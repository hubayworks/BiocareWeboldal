import { createHash, randomBytes, randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import type { H3Event } from "h3";
import { createError, getRequestHeader, getRequestIP, getRequestURL } from "h3";

export type ReviewRecord = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: "website" | "google" | "facebook" | "other";
};

type ReviewInput = { name: string; rating: number; review: string; consent: boolean; website?: string };

let pool: mysql.Pool | undefined;
let schemaReady: Promise<void> | undefined;

function getPool() {
  const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw createError({ statusCode: 503, statusMessage: "A véleményküldés még nincs bekapcsolva." });
  }
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      charset: "utf8mb4",
    });
  }
  return pool;
}

export async function ensureReviewSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS biocare_reviews (
        id CHAR(36) NOT NULL PRIMARY KEY,
        author VARCHAR(80) NOT NULL,
        rating TINYINT UNSIGNED NOT NULL,
        review_text TEXT NOT NULL,
        source VARCHAR(20) NOT NULL DEFAULT 'website',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        consent_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME NULL,
        archived_at DATETIME NULL,
        approval_token_hash CHAR(64) NULL,
        approval_expires_at DATETIME NULL,
        KEY idx_public_reviews (status, published_at),
        UNIQUE KEY idx_review_approval_token (approval_token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).then(() => undefined).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

export function assertSameOrigin(event: H3Event) {
  const origin = getRequestHeader(event, "origin");
  if (!origin) throw createError({ statusCode: 403, statusMessage: "Érvénytelen kérés." });
  let originHost = "";
  try { originHost = new URL(origin).host; } catch { /* handled below */ }
  if (originHost !== getRequestURL(event).host) {
    throw createError({ statusCode: 403, statusMessage: "Érvénytelen kérés." });
  }
}

const recentSubmissions = new Map<string, number[]>();

export function enforceReviewRateLimit(event: H3Event) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const recent = (recentSubmissions.get(ip) ?? []).filter((time) => now - time < 15 * 60_000);
  if (recent.length >= 3) {
    throw createError({ statusCode: 429, statusMessage: "Most túl sok értékelést küldtél. Próbáld újra később." });
  }
  recent.push(now);
  recentSubmissions.set(ip, recent);
}

export function validateReviewInput(input: unknown): ReviewInput {
  if (!input || typeof input !== "object") throw createError({ statusCode: 400, statusMessage: "Ellenőrizd a kitöltött mezőket." });
  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const review = typeof value.review === "string" ? value.review.trim() : "";
  const rating = Number(value.rating);
  if (typeof value.website === "string" && value.website.trim()) {
    throw createError({ statusCode: 400, statusMessage: "A beküldés nem sikerült." });
  }
  if (name.length < 2 || name.length > 80 || review.length < 10 || review.length > 2000 || !Number.isInteger(rating) || rating < 1 || rating > 5 || value.consent !== true) {
    throw createError({ statusCode: 400, statusMessage: "Töltsd ki az összes mezőt, és fogadd el a közzétételi hozzájárulást." });
  }
  return { name, review, rating, consent: true };
}

function approvalTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw createError({ statusCode: 503, statusMessage: "Az e-mailes értesítés beállítása még hiányzik." });
  }
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    to: "info@hubayworks.eu",
    from: process.env.SMTP_FROM || SMTP_USER,
    transport: nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } }),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export async function submitReview(input: ReviewInput, requestOrigin: string) {
  await ensureReviewSchema();
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 48 * 60 * 60_000);
  const db = getPool();
  await db.execute(
    "INSERT INTO biocare_reviews (id, author, rating, review_text, source, status, consent_at, approval_token_hash, approval_expires_at) VALUES (?, ?, ?, ?, 'website', 'pending', NOW(), ?, ?)",
    [id, input.name, input.rating, input.review, tokenHash, expires],
  );

  try {
    const mail = approvalTransport();
    const baseUrl = (process.env.APP_BASE_URL || requestOrigin).replace(/\/$/, "");
    const actionUrl = (action: "approve" | "archive" | "delete") => `${baseUrl}/review-jovahagyas?token=${encodeURIComponent(token)}&action=${action}`;
    const approveUrl = actionUrl("approve");
    const archiveUrl = actionUrl("archive");
    const deleteUrl = actionUrl("delete");
    const stars = "★".repeat(input.rating) + "☆".repeat(5 - input.rating);
    const subject = "Új BioCare vendégvélemény jóváhagyásra vár";
    const safeName = escapeHtml(input.name);
    const safeReview = escapeHtml(input.review);
    await mail.transport.sendMail({
      to: mail.to,
      from: mail.from,
      subject,
      text: `Új vélemény érkezett a BioCare weboldaláról.\n\n${stars}\nNév: ${input.name}\n\n${input.review}\n\nVálassz műveletet (a link megnyitása után még meg kell erősíteni):\nJóváhagyás és közzététel: ${approveUrl}\nArchiválás: ${archiveUrl}\nVégleges törlés: ${deleteUrl}\n\nA link 48 óráig és egyszer használható. A megnyitás önmagában nem módosítja a véleményt.`,
      html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#283126"><h1 style="font-size:22px">Új vendégvélemény érkezett</h1><p style="color:#71845e;font-size:20px">${stars}</p><p><strong>Név:</strong> ${safeName}</p><blockquote style="margin:20px 0;padding:16px 20px;background:#f1f4ec;border-left:3px solid #93a978;white-space:pre-line">${safeReview}</blockquote><p style="font-weight:bold">Válassz műveletet:</p><p><a href="${escapeHtml(approveUrl)}" style="display:inline-block;margin:4px;padding:13px 18px;border-radius:24px;background:#71845e;color:white;text-decoration:none;font-weight:bold">Vélemény hozzáadása a weboldalhoz</a></p><p><a href="${escapeHtml(archiveUrl)}" style="display:inline-block;margin:4px;padding:12px 18px;border-radius:24px;background:#f1f4ec;color:#35422e;text-decoration:none;font-weight:bold">Archiválás</a><a href="${escapeHtml(deleteUrl)}" style="display:inline-block;margin:4px;padding:12px 18px;border-radius:24px;background:#fff1ed;color:#8b3020;text-decoration:none;font-weight:bold">Végleges törlés</a></p><p style="font-size:12px;color:#687064">A hivatkozás 48 óráig és egyszer használható. Megnyitás után külön meg kell erősíteni a műveletet; önmagában a link megnyitása semmit nem módosít.</p></main>`,
    });
  } catch (error) {
    await db.execute("DELETE FROM biocare_reviews WHERE id = ? AND status = 'pending'", [id]);
    throw error;
  }
}

export async function listPublishedReviews(): Promise<ReviewRecord[]> {
  await ensureReviewSchema();
  const [rows] = await getPool().query<mysql.RowDataPacket[]>(
    "SELECT id, author, rating, review_text AS reviewText, DATE_FORMAT(created_at, '%Y-%m-%d') AS reviewDate, source FROM biocare_reviews WHERE status = 'published' ORDER BY published_at DESC LIMIT 50",
  );
  return rows.map((row) => ({ id: String(row.id), author: String(row.author), rating: Number(row.rating), text: String(row.reviewText), date: String(row.reviewDate), source: row.source as ReviewRecord["source"] }));
}

export async function getPendingReview(token: string) {
  await ensureReviewSchema();
  const hash = createHash("sha256").update(token).digest("hex");
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(
    "SELECT id, author, rating, review_text AS reviewText FROM biocare_reviews WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW() LIMIT 1",
    [hash],
  );
  const row = rows[0];
  return row ? { id: String(row.id), author: String(row.author), rating: Number(row.rating), text: String(row.reviewText) } : null;
}

export async function applyPendingReviewAction(token: string, action: "approve" | "archive" | "delete") {
  await ensureReviewSchema();
  const hash = createHash("sha256").update(token).digest("hex");
  const db = getPool();
  const [result] = action === "delete"
    ? await db.execute<mysql.ResultSetHeader>("DELETE FROM biocare_reviews WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW()", [hash])
    : action === "archive"
      ? await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'archived', archived_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW()", [hash])
      : await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'published', published_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW()", [hash]);
  return result.affectedRows === 1;
}
