import { createHash, randomBytes, randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

export class ReviewApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ReviewApiError";
  }
}

export type ReviewRecord = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  source: "website" | "google" | "facebook" | "other";
};

export type ReviewAdminStatus = "published" | "archived" | "deleted";
export type ReviewAdminRecord = ReviewRecord & { status: ReviewAdminStatus; deletedAt: string | null };

type ReviewInput = { name: string; rating: number; review: string; consent: boolean; website?: string };

let pool: mysql.Pool | undefined;
let schemaReady: Promise<void> | undefined;

function getPool() {
  const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new ReviewApiError(503, "A véleményküldés még nincs bekapcsolva.");
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
        deleted_at DATETIME NULL,
        approval_token_hash CHAR(64) NULL,
        approval_expires_at DATETIME NULL,
        KEY idx_public_reviews (status, published_at),
        UNIQUE KEY idx_review_approval_token (approval_token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).then(() => undefined).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
    schemaReady = schemaReady.then(async () => {
      const db = getPool();
      const [columns] = await db.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM biocare_reviews LIKE 'deleted_at'");
      if (columns.length === 0) await db.query("ALTER TABLE biocare_reviews ADD COLUMN deleted_at DATETIME NULL");
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_admin_tokens (
          token_hash CHAR(64) NOT NULL PRIMARY KEY,
          purpose VARCHAR(20) NOT NULL DEFAULT 'login',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          used_at DATETIME NULL,
          KEY idx_admin_token_expiry (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_admin_sessions (
          token_hash CHAR(64) NOT NULL PRIMARY KEY,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          KEY idx_admin_session_expiry (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_admin_settings (
          id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
          admin_email VARCHAR(254) NOT NULL,
          welcome_sent_email VARCHAR(254) NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      const email = currentAdminEmail();
      await db.execute("INSERT IGNORE INTO biocare_review_admin_settings (id, admin_email, welcome_sent_email) VALUES (1, ?, ?)", [email, email]);
    }).catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  await schemaReady;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) throw new ReviewApiError(403, "Érvénytelen kérés.");
  let originHost = "";
  try { originHost = new URL(origin).host; } catch { /* handled below */ }
  if (originHost !== new URL(request.url).host) {
    throw new ReviewApiError(403, "Érvénytelen kérés.");
  }
}

const recentSubmissions = new Map<string, number[]>();

export function enforceReviewRateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (recentSubmissions.get(ip) ?? []).filter((time) => now - time < 15 * 60_000);
  if (recent.length >= 3) {
    throw new ReviewApiError(429, "Most túl sok értékelést küldtél. Próbáld újra később.");
  }
  recent.push(now);
  recentSubmissions.set(ip, recent);
}

export function validateReviewInput(input: unknown): ReviewInput {
  if (!input || typeof input !== "object") throw new ReviewApiError(400, "Ellenőrizd a kitöltött mezőket.");
  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const review = typeof value.review === "string" ? value.review.trim() : "";
  const rating = Number(value.rating);
  if (typeof value.website === "string" && value.website.trim()) {
    throw new ReviewApiError(400, "A beküldés nem sikerült.");
  }
  if (name.length < 2 || name.length > 80 || review.length < 10 || review.length > 2000 || !Number.isInteger(rating) || rating < 1 || rating > 5 || value.consent !== true) {
    throw new ReviewApiError(400, "Töltsd ki az összes mezőt, és fogadd el a közzétételi hozzájárulást.");
  }
  return { name, review, rating, consent: true };
}

function approvalTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new ReviewApiError(503, "Az e-mailes értesítés beállítása még hiányzik.");
  }
  const port = Number(process.env.SMTP_PORT || 587);
  return {
    to: process.env.REVIEWS_ADMIN_EMAIL?.trim() || "info@hubayworks.eu",
    from: process.env.SMTP_FROM || SMTP_USER,
    transport: nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } }),
  };
}

function adminTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) throw new ReviewApiError(503, "Az admin e-mailes belépés még nincs beállítva.");
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
}

const adminCookie = "biocare_review_admin";
const adminLoginRequests = new Map<string, number[]>();
let adminEmailSync: Promise<boolean> | undefined;

function sha256(value: string) { return createHash("sha256").update(value).digest("hex"); }

function currentAdminEmail() {
  const email = process.env.REVIEWS_ADMIN_EMAIL?.trim() || "info@hubayworks.eu";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ReviewApiError(503, "Az admin e-mail-cím beállítása érvénytelen.");
  return email;
}

export async function requestReviewAdminAccess(request: Request) {
  await ensureReviewSchema();
  await syncReviewAdminEmail(request);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (adminLoginRequests.get(ip) ?? []).filter((time) => now - time < 15 * 60_000);
  if (recent.length >= 3) throw new ReviewApiError(429, "Túl sok belépési kérést küldtél. Próbáld újra később.");
  recent.push(now);
  adminLoginRequests.set(ip, recent);

  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expires = new Date(now + 20 * 60_000);
  await getPool().execute("INSERT INTO biocare_review_admin_tokens (token_hash, purpose, expires_at) VALUES (?, 'login', ?)", [tokenHash, expires]);
  const baseUrl = (process.env.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const loginUrl = `${baseUrl}/reviews-admin?token=${encodeURIComponent(token)}`;
  await adminTransport().sendMail({
    to: currentAdminEmail(),
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    subject: "TESZT – BioCare adminpanel elérése",
    text: `Szia! Ez a tesztlevél a BioCare adminpanel elérését mutatja be. Az Adminpanel megnyitása hivatkozás közvetlenül beléptet a véleménykezelőbe. A hivatkozás egyszer használható, és 20 percig érvényes: ${loginUrl}\n\nHa nem te kérted ezt a tesztet, hagyd figyelmen kívül ezt az e-mailt.`,
    html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#283126"><p>Szia!</p><h1>BioCare adminpanel – teszt</h1><p>Ez a tesztlevél az adminpanel elérését mutatja be. Az alábbi gomb közvetlenül megnyitja a véleménykezelőt és beléptet.</p><p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:14px 20px;border-radius:24px;background:#71845e;color:white;text-decoration:none;font-weight:bold">Adminpanel megnyitása</a></p><p>A hivatkozás az admin postafiókhoz készül, egyszer használható, és 20 percig érvényes.</p><p>Ha nem te kérted ezt a tesztet, hagyd figyelmen kívül ezt az e-mailt.</p></main>`,
  });
}

async function createAdminLoginToken() {
  const token = randomBytes(32).toString("base64url");
  await getPool().execute(
    "INSERT INTO biocare_review_admin_tokens (token_hash, purpose, expires_at) VALUES (?, 'login', ?)",
    [sha256(token), new Date(Date.now() + 20 * 60_000)],
  );
  return token;
}

export async function syncReviewAdminEmail(request: Request): Promise<boolean> {
  await ensureReviewSchema();
  if (adminEmailSync) return adminEmailSync;
  adminEmailSync = (async () => {
    const email = currentAdminEmail();
    const db = getPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT admin_email, welcome_sent_email FROM biocare_review_admin_settings WHERE id = 1 LIMIT 1");
    const storedEmail = String(rows[0]?.admin_email || "");
    if (storedEmail !== email) {
      await db.execute("UPDATE biocare_review_admin_settings SET admin_email = ?, welcome_sent_email = NULL WHERE id = 1 AND admin_email <> ?", [email, email]);
    }
    // An email change only updates the configured admin address. Client handoff
    // mail is sent exclusively by the explicit, authenticated handoff action.
    return false;
  })().finally(() => { adminEmailSync = undefined; });
  return adminEmailSync;
}

export async function sendReviewAdminHandoffEmail(request: Request) {
  await ensureReviewSchema();
  if (process.env["REVIEW_ADMIN_HANDOFF_ENABLED"] !== "true") {
    throw new ReviewApiError(409, "Az átadási e-mail csak a hivatalos átadás előkészítésekor engedélyezhető.");
  }
  const email = currentAdminEmail();
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT welcome_sent_email FROM biocare_review_admin_settings WHERE id = 1 LIMIT 1");
  const sentEmail = rows[0]?.welcome_sent_email == null ? null : String(rows[0].welcome_sent_email);
  if (sentEmail === email) throw new ReviewApiError(409, "Az átadási e-mailt erre a címre már elküldtük.");
  const [claim] = await db.execute<mysql.ResultSetHeader>(
    "UPDATE biocare_review_admin_settings SET welcome_sent_email = 'sending' WHERE id = 1 AND admin_email = ? AND (welcome_sent_email IS NULL OR (welcome_sent_email <> ? AND welcome_sent_email <> 'sending'))",
    [email, email],
  );
  if (claim.affectedRows !== 1) throw new ReviewApiError(409, "Az átadási e-mail már folyamatban van.");
  try {
    const token = await createAdminLoginToken();
    const baseUrl = (process.env.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
    const siteUrl = (process.env.PUBLIC_SITE_URL || "https://biocarekozmetikapecs.hu").replace(/\/$/, "");
    const accessUrl = `${baseUrl}/reviews-admin?token=${encodeURIComponent(token)}`;
    const links = [
      ["Jóváhagyott vélemények", `${baseUrl}/reviews-admin?status=published`],
      ["Archivált vélemények", `${baseUrl}/reviews-admin?status=archived`],
      ["Nemrég törölt vélemények", `${baseUrl}/reviews-admin?status=deleted`],
    ] as const;
    await adminTransport().sendMail({
      to: email,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      subject: "Üdvözlünk a BioCare új weboldalán",
      text: `Szia! Üdvözlünk a BioCare megújult weboldalán.\n\nWeboldal: ${siteUrl}\n\nAdminfelület: ${accessUrl}\nAz adminbelépő link egyszer használható és 20 percig érvényes.\n\n${links.map(([label, url]) => `${label}: ${url}`).join("\n")}\n\nA listák csak admin belépés után érhetők el. A dashboardon PDF-be mentheted az aktuális listát.`,
      html: `<main style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#283126"><h1>Üdvözlünk a BioCare új weboldalán!</h1><p>Elkészült a megújult weboldal és az admin véleménykezelő felület.</p><p><a href="${escapeHtml(siteUrl)}" style="display:inline-block;margin:4px;padding:14px 20px;border-radius:24px;background:#f1f4ec;color:#35422e;text-decoration:none;font-weight:bold">BioCare weboldal megnyitása</a></p><p><a href="${escapeHtml(accessUrl)}" style="display:inline-block;margin:4px;padding:14px 20px;border-radius:24px;background:#71845e;color:white;text-decoration:none;font-weight:bold">Adminfelület megnyitása</a></p><p>Az adminbelépő link egyszer használható és 20 percig érvényes. A véleménylisták csak admin belépés után érhetők el.</p><h2>Véleménylisták</h2><ul>${links.map(([label, url]) => `<li><a href="${escapeHtml(url)}">${label}</a></li>`).join("")}</ul><p>A dashboardon az aktuális lista PDF-be menthető.</p></main>`,
    });
    await db.execute("UPDATE biocare_review_admin_settings SET welcome_sent_email = ? WHERE id = 1 AND welcome_sent_email = 'sending'", [email]);
  } catch (error) {
    await db.execute("UPDATE biocare_review_admin_settings SET welcome_sent_email = NULL WHERE id = 1 AND welcome_sent_email = 'sending'");
    throw error;
  }
}

export async function createReviewAdminSession(token: string) {
  await ensureReviewSchema();
  if (token.length < 32 || token.length > 128) return null;
  const db = getPool();
  const [result] = await db.execute<mysql.ResultSetHeader>("UPDATE biocare_review_admin_tokens SET used_at = NOW() WHERE token_hash = ? AND purpose = 'login' AND used_at IS NULL AND expires_at > NOW()", [sha256(token)]);
  if (result.affectedRows !== 1) return null;
  const session = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 8 * 60 * 60_000);
  await db.execute("INSERT INTO biocare_review_admin_sessions (token_hash, expires_at) VALUES (?, ?)", [sha256(session), expires]);
  return session;
}

function sessionFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const value = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${adminCookie}=`))?.slice(adminCookie.length + 1);
  return value ? decodeURIComponent(value) : "";
}

export async function requireReviewAdmin(request: Request) {
  await ensureReviewSchema();
  const token = sessionFromRequest(request);
  if (token.length < 32 || token.length > 128) throw new ReviewApiError(401, "A véleménylistákhoz e-mailes admin belépés szükséges.");
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>("SELECT token_hash FROM biocare_review_admin_sessions WHERE token_hash = ? AND expires_at > NOW() LIMIT 1", [sha256(token)]);
  if (!rows.length) throw new ReviewApiError(401, "A belépés lejárt. Kérj új belépési linket e-mailben.");
  return token;
}

export async function listAdminReviews(status: ReviewAdminStatus): Promise<ReviewAdminRecord[]> {
  await ensureReviewSchema();
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(
    "SELECT id, author, rating, review_text AS reviewText, DATE_FORMAT(created_at, '%Y-%m-%d') AS reviewDate, source, status, DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i') AS deletedAt FROM biocare_reviews WHERE status = ? ORDER BY created_at DESC LIMIT 500",
    [status],
  );
  return rows.map((row) => ({ id: String(row.id), author: String(row.author), rating: Number(row.rating), text: String(row.reviewText), date: String(row.reviewDate), source: row.source as ReviewRecord["source"], status: row.status as ReviewAdminStatus, deletedAt: row.deletedAt ? String(row.deletedAt) : null }));
}

export async function applyReviewAdminAction(id: string, action: "archive" | "restore" | "delete" | "purge") {
  await ensureReviewSchema();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const db = getPool();
  const [result] = action === "purge"
    ? await db.execute<mysql.ResultSetHeader>("DELETE FROM biocare_reviews WHERE id = ? AND status = 'deleted'", [id])
    : action === "archive"
      ? await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'archived', archived_at = NOW(), deleted_at = NULL WHERE id = ? AND status = 'published'", [id])
      : action === "delete"
        ? await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'deleted', deleted_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE id = ? AND status IN ('pending', 'published', 'archived')", [id])
        : await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'published', published_at = NOW(), archived_at = NULL, deleted_at = NULL WHERE id = ? AND status IN ('archived', 'deleted')", [id]);
  return result.affectedRows === 1;
}

export function reviewAdminCookie(session: string, clear = false, secure = true) {
  return `${adminCookie}=${clear ? "" : encodeURIComponent(session)}; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Strict; Max-Age=${clear ? 0 : 8 * 60 * 60}`;
}

export async function deleteReviewAdminSession(request: Request) {
  await ensureReviewSchema();
  const token = sessionFromRequest(request);
  if (token) await getPool().execute("DELETE FROM biocare_review_admin_sessions WHERE token_hash = ?", [sha256(token)]);
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
    ? await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'deleted', deleted_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW()", [hash])
    : action === "archive"
      ? await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'archived', archived_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW()", [hash])
      : await db.execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'published', published_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE approval_token_hash = ? AND status = 'pending' AND approval_expires_at > NOW()", [hash]);
  return result.affectedRows === 1;
}
