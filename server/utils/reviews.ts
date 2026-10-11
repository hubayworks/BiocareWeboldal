import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
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
export type ReviewIntegrationSettings = { googleUrl: string; facebookUrl: string; instagramUrl: string };
export type ReviewCustomer = { id: string; email: string; name: string; phone: string };
export type ReviewCustomerRecord = Omit<ReviewAdminRecord, "status"> & { status: "pending" | ReviewAdminStatus };
export type CustomerGiftRequest = { id: string; kind: string; details: string; status: "requested" | "contacted" | "completed" | "cancelled"; createdAt: string };
export type AdminCustomerRecord = { id: string; name: string; email: string; phone: string; createdAt: string; reviewCount: number; giftRequestCount: number };
export type AdminDashboard = { users: AdminCustomerRecord[]; giftRequests: Array<CustomerGiftRequest & { customerName: string; customerEmail: string; customerPhone: string }>; counts: { users: number; reviews: number; pendingReviews: number; publishedReviews: number; giftRequests: number } };

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
        CREATE TABLE IF NOT EXISTS biocare_review_customers (
          id CHAR(36) NOT NULL PRIMARY KEY,
          email VARCHAR(254) NOT NULL UNIQUE,
          display_name VARCHAR(80) NOT NULL,
          phone VARCHAR(40) NOT NULL DEFAULT '',
          password_hash VARCHAR(255) NULL,
          email_verified_at DATETIME NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_customer_tokens (
          token_hash CHAR(64) NOT NULL PRIMARY KEY,
          email VARCHAR(254) NOT NULL,
          display_name VARCHAR(80) NOT NULL,
          phone VARCHAR(40) NOT NULL DEFAULT '',
          password_hash VARCHAR(255) NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          used_at DATETIME NULL,
          KEY idx_customer_token_expiry (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      const [customerPhoneColumns] = await db.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM biocare_review_customers LIKE 'phone'");
      if (customerPhoneColumns.length === 0) await db.query("ALTER TABLE biocare_review_customers ADD COLUMN phone VARCHAR(40) NOT NULL DEFAULT ''");
      const [customerPasswordColumns] = await db.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM biocare_review_customers LIKE 'password_hash'");
      if (customerPasswordColumns.length === 0) await db.query("ALTER TABLE biocare_review_customers ADD COLUMN password_hash VARCHAR(255) NULL");
      const [customerTokenPhoneColumns] = await db.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM biocare_review_customer_tokens LIKE 'phone'");
      if (customerTokenPhoneColumns.length === 0) await db.query("ALTER TABLE biocare_review_customer_tokens ADD COLUMN phone VARCHAR(40) NOT NULL DEFAULT ''");
      const [customerTokenPasswordColumns] = await db.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM biocare_review_customer_tokens LIKE 'password_hash'");
      if (customerTokenPasswordColumns.length === 0) await db.query("ALTER TABLE biocare_review_customer_tokens ADD COLUMN password_hash VARCHAR(255) NULL");
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_customer_sessions (
          token_hash CHAR(64) NOT NULL PRIMARY KEY,
          customer_id CHAR(36) NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          KEY idx_customer_session_expiry (expires_at),
          KEY idx_customer_session_owner (customer_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_gift_requests (
          id CHAR(36) NOT NULL PRIMARY KEY,
          customer_id CHAR(36) NOT NULL,
          request_kind VARCHAR(40) NOT NULL,
          details VARCHAR(1000) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'requested',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_gift_request_customer (customer_id, created_at),
          KEY idx_gift_request_status (status, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      const [accountColumns] = await db.query<mysql.RowDataPacket[]>("SHOW COLUMNS FROM biocare_reviews LIKE 'customer_id'");
      if (accountColumns.length === 0) await db.query("ALTER TABLE biocare_reviews ADD COLUMN customer_id CHAR(36) NULL, ADD KEY idx_review_customer (customer_id, created_at)");
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_admin_settings (
          id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
          admin_email VARCHAR(254) NOT NULL,
          welcome_sent_email VARCHAR(254) NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await db.query(`
        CREATE TABLE IF NOT EXISTS biocare_review_integrations (
          id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
          google_url VARCHAR(2048) NOT NULL DEFAULT '',
          facebook_url VARCHAR(2048) NOT NULL DEFAULT '',
          instagram_url VARCHAR(2048) NOT NULL DEFAULT '',
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      await db.execute("INSERT IGNORE INTO biocare_review_integrations (id, google_url, facebook_url, instagram_url) VALUES (1, '', '', '')");
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
const customerCookie = "biocare_review_customer";
const adminLoginRequests = new Map<string, number[]>();
const customerLoginRequests = new Map<string, number[]>();
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

export async function requestReviewCustomerAccess(request: Request, rawEmail: unknown, rawName: unknown, rawPhone: unknown) {
  await ensureReviewSchema();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || name.length < 2 || name.length > 80 || phone.replace(/[\s()+.-]/g, "").length < 7 || phone.length > 40) {
    throw new ReviewApiError(400, "Adj meg egy érvényes nevet, e-mail-címet és telefonszámot.");
  }
  if (email === currentAdminEmail().toLowerCase()) throw new ReviewApiError(403, "Ez a cím az adminfelülethez van fenntartva. Az ügyfélfiókhoz használj másik e-mail-címet.");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (customerLoginRequests.get(ip) ?? []).filter((time) => now - time < 15 * 60_000);
  if (recent.length >= 3) throw new ReviewApiError(429, "Most túl sok belépési linket kértél. Próbáld újra később.");
  recent.push(now);
  customerLoginRequests.set(ip, recent);

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(now + 20 * 60_000);
  await getPool().execute("INSERT INTO biocare_review_customer_tokens (token_hash, email, display_name, phone, expires_at) VALUES (?, ?, ?, ?, ?)", [sha256(token), email, name, phone, expires]);
  const baseUrl = (process.env.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const loginUrl = `${baseUrl}/fiok?token=${encodeURIComponent(token)}`;
  await adminTransport().sendMail({
    to: email,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    subject: "BioCare-fiók belépési link",
    text: `Szia ${name}!\n\nA BioCare-fiókod létrehozásához vagy megnyitásához kattints a linkre: ${loginUrl}\n\nA link egyszer használható és 20 percig érvényes. Ha nem te kérted, hagyd figyelmen kívül ezt az e-mailt.`,
    html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#283126"><p>Szia ${escapeHtml(name)}!</p><h1>BioCare-fiók</h1><p>A fiókod létrehozásához vagy megnyitásához kattints az alábbi gombra.</p><p><a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:14px 20px;border-radius:24px;background:#71845e;color:white;text-decoration:none;font-weight:bold">Belépés a fiókomba</a></p><p>A link egyszer használható és 20 percig érvényes. Ha nem te kérted, hagyd figyelmen kívül ezt az e-mailt.</p></main>`,
  });
}

function passwordHash(password: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

function verifyPassword(password: string, encoded: string | null) {
  if (!encoded) return false;
  const [algorithm, saltText, hashText] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltText || !hashText) return false;
  try {
    const expected = Buffer.from(hashText, "base64url");
    const actual = scryptSync(password, Buffer.from(saltText, "base64url"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}

export async function registerReviewCustomer(request: Request, rawEmail: unknown, rawName: unknown, rawPhone: unknown, rawPassword: unknown) {
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (password.length < 12 || password.length > 200) throw new ReviewApiError(400, "A jelszó legalább 12 karakter legyen.");
  await ensureReviewSchema();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || name.length < 2 || name.length > 80 || phone.replace(/[\s()+.-]/g, "").length < 7 || phone.length > 40) {
    throw new ReviewApiError(400, "Töltsd ki érvényes névvel, e-mail-címmel és telefonszámmal az összes mezőt.");
  }
  if (email === currentAdminEmail().toLowerCase()) throw new ReviewApiError(403, "Ez az e-mail-cím az adminbelépéshez van fenntartva.");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (customerLoginRequests.get(ip) ?? []).filter((time) => now - time < 15 * 60_000);
  if (recent.length >= 3) throw new ReviewApiError(429, "Túl sok regisztrációs kérés. Próbáld újra később.");
  recent.push(now);
  customerLoginRequests.set(ip, recent);
  const token = randomBytes(32).toString("base64url");
  await getPool().execute("INSERT INTO biocare_review_customer_tokens (token_hash, email, display_name, phone, password_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?)", [sha256(token), email, name, phone, passwordHash(password), new Date(now + 20 * 60_000)]);
  const baseUrl = (process.env.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const verifyUrl = `${baseUrl}/fiok?token=${encodeURIComponent(token)}`;
  await adminTransport().sendMail({
    to: email,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    subject: "BioCare-fiók megerősítése",
    text: `Szia ${name}!\n\nA regisztráció befejezéséhez erősítsd meg az e-mail-címed a hivatkozással: ${verifyUrl}\n\nA link egyszer használható és 20 percig érvényes. Ha nem te kérted, hagyd figyelmen kívül ezt az e-mailt.`,
    html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#283126"><p>Szia ${escapeHtml(name)}!</p><h1>BioCare-fiók megerősítése</h1><p>A regisztráció befejezéséhez erősítsd meg az e-mail-címed.</p><p><a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:14px 20px;border-radius:24px;background:#71845e;color:white;text-decoration:none;font-weight:bold">E-mail-cím megerősítése</a></p><p>A link egyszer használható és 20 percig érvényes.</p></main>`,
  });
}

export async function signInReviewCustomer(rawEmail: unknown, rawPassword: unknown) {
  await ensureReviewSchema();
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (email === currentAdminEmail().toLowerCase()) throw new ReviewApiError(403, "Az adminfelületre az admin postafiókba kért biztonságos belépőlinkkel lépj be.");
  const ipKey = `password:${email}`;
  const now = Date.now();
  const recent = (customerLoginRequests.get(ipKey) ?? []).filter((time) => now - time < 15 * 60_000);
  if (recent.length >= 8) throw new ReviewApiError(429, "Túl sok sikertelen belépési kísérlet. Próbáld újra később.");
  recent.push(now);
  customerLoginRequests.set(ipKey, recent);
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>("SELECT id, email, display_name AS displayName, phone, password_hash AS passwordHash FROM biocare_review_customers WHERE email = ? AND email_verified_at IS NOT NULL LIMIT 1", [email]);
  const row = rows[0];
  if (!row || !verifyPassword(password, row.passwordHash ? String(row.passwordHash) : null)) throw new ReviewApiError(401, "Az e-mail-cím vagy a jelszó nem megfelelő.");
  const customer: ReviewCustomer = { id: String(row.id), email: String(row.email), name: String(row.displayName), phone: String(row.phone || "") };
  const session = randomBytes(32).toString("base64url");
  await getPool().execute("INSERT INTO biocare_review_customer_sessions (token_hash, customer_id, expires_at) VALUES (?, ?, ?)", [sha256(session), customer.id, new Date(Date.now() + 8 * 60 * 60_000)]);
  return { session, customer };
}

export async function createReviewCustomerSession(token: string): Promise<{ session: string; customer: ReviewCustomer } | null> {
  await ensureReviewSchema();
  if (token.length < 32 || token.length > 128) return null;
  const db = getPool();
  const hash = sha256(token);
  const [claim] = await db.execute<mysql.ResultSetHeader>("UPDATE biocare_review_customer_tokens SET used_at = NOW() WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()", [hash]);
  if (claim.affectedRows !== 1) return null;
  const [tokens] = await db.execute<mysql.RowDataPacket[]>("SELECT email, display_name AS displayName, phone, password_hash AS passwordHash FROM biocare_review_customer_tokens WHERE token_hash = ? LIMIT 1", [hash]);
  if (!tokens.length) return null;
  const email = String(tokens[0].email);
  const name = String(tokens[0].displayName);
  const phone = String(tokens[0].phone || "");
  await db.execute("INSERT INTO biocare_review_customers (id, email, display_name, phone, password_hash, email_verified_at) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), phone = VALUES(phone), password_hash = COALESCE(VALUES(password_hash), password_hash), email_verified_at = COALESCE(email_verified_at, NOW())", [randomUUID(), email, name, phone, tokens[0].passwordHash || null]);
  const [rows] = await db.execute<mysql.RowDataPacket[]>("SELECT id, email, display_name AS displayName, phone FROM biocare_review_customers WHERE email = ? AND email_verified_at IS NOT NULL LIMIT 1", [email]);
  if (!rows.length) return null;
  const customer: ReviewCustomer = { id: String(rows[0].id), email: String(rows[0].email), name: String(rows[0].displayName), phone: String(rows[0].phone || "") };
  const session = randomBytes(32).toString("base64url");
  await db.execute("INSERT INTO biocare_review_customer_sessions (token_hash, customer_id, expires_at) VALUES (?, ?, ?)", [sha256(session), customer.id, new Date(Date.now() + 8 * 60 * 60_000)]);
  return { session, customer };
}

function customerSessionFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const value = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${customerCookie}=`))?.slice(customerCookie.length + 1);
  return value ? decodeURIComponent(value) : "";
}

export async function getReviewCustomer(request: Request): Promise<ReviewCustomer | null> {
  await ensureReviewSchema();
  const token = customerSessionFromRequest(request);
  if (token.length < 32 || token.length > 128) return null;
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>("SELECT c.id, c.email, c.display_name AS displayName, c.phone FROM biocare_review_customer_sessions s JOIN biocare_review_customers c ON c.id = s.customer_id WHERE s.token_hash = ? AND s.expires_at > NOW() AND c.email_verified_at IS NOT NULL LIMIT 1", [sha256(token)]);
  const row = rows[0];
  return row ? { id: String(row.id), email: String(row.email), name: String(row.displayName), phone: String(row.phone || "") } : null;
}

export async function updateReviewCustomerProfile(customerId: string, rawName: unknown, rawPhone: unknown) {
  await ensureReviewSchema();
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
  if (name.length < 2 || name.length > 80 || phone.replace(/[\s()+.-]/g, "").length < 7 || phone.length > 40) {
    throw new ReviewApiError(400, "Adj meg érvényes nevet és telefonszámot.");
  }
  await getPool().execute("UPDATE biocare_review_customers SET display_name = ?, phone = ? WHERE id = ?", [name, phone, customerId]);
  return { name, phone };
}

export async function updateReviewCustomerPassword(customerId: string, rawPassword: unknown) {
  await ensureReviewSchema();
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (password.length < 12 || password.length > 200) throw new ReviewApiError(400, "A jelszó legalább 12 karakter legyen.");
  await getPool().execute("UPDATE biocare_review_customers SET password_hash = ? WHERE id = ?", [passwordHash(password), customerId]);
}

export async function deleteReviewCustomerSession(request: Request) {
  await ensureReviewSchema();
  const token = customerSessionFromRequest(request);
  if (token) await getPool().execute("DELETE FROM biocare_review_customer_sessions WHERE token_hash = ?", [sha256(token)]);
}

export function reviewCustomerCookie(session: string, clear = false, secure = true) {
  return `${customerCookie}=${clear ? "" : encodeURIComponent(session)}; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Strict; Max-Age=${clear ? 0 : 8 * 60 * 60}`;
}

export async function listCustomerReviews(customerId: string): Promise<ReviewCustomerRecord[]> {
  await ensureReviewSchema();
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>("SELECT id, author, rating, review_text AS reviewText, DATE_FORMAT(created_at, '%Y-%m-%d') AS reviewDate, source, status, DATE_FORMAT(deleted_at, '%Y-%m-%d %H:%i') AS deletedAt FROM biocare_reviews WHERE customer_id = ? AND status <> 'deleted' ORDER BY created_at DESC LIMIT 100", [customerId]);
  return rows.map((row) => ({ id: String(row.id), author: String(row.author), rating: Number(row.rating), text: String(row.reviewText), date: String(row.reviewDate), source: row.source as ReviewRecord["source"], status: row.status as "pending" | ReviewAdminStatus, deletedAt: row.deletedAt ? String(row.deletedAt) : null }));
}

export async function withdrawCustomerReview(customerId: string, reviewId: string) {
  await ensureReviewSchema();
  if (!/^[0-9a-f-]{36}$/i.test(reviewId)) return false;
  const [result] = await getPool().execute<mysql.ResultSetHeader>("UPDATE biocare_reviews SET status = 'deleted', deleted_at = NOW(), approval_token_hash = NULL, approval_expires_at = NULL WHERE id = ? AND customer_id = ? AND status IN ('pending', 'published', 'archived')", [reviewId, customerId]);
  return result.affectedRows === 1;
}

export async function listCustomerGiftRequests(customerId: string): Promise<CustomerGiftRequest[]> {
  await ensureReviewSchema();
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>("SELECT id, request_kind AS kind, details, status, DATE_FORMAT(created_at, '%Y-%m-%d') AS createdAt FROM biocare_gift_requests WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100", [customerId]);
  return rows.map((row) => ({ id: String(row.id), kind: String(row.kind), details: String(row.details), status: row.status as CustomerGiftRequest["status"], createdAt: String(row.createdAt) }));
}

export async function createCustomerGiftRequest(customer: ReviewCustomer, rawKind: unknown, rawDetails: unknown) {
  await ensureReviewSchema();
  const kind = typeof rawKind === "string" ? rawKind.trim() : "";
  const details = typeof rawDetails === "string" ? rawDetails.trim() : "";
  if (!["Ajándékkártya", "Arckezelési bérlet", "Kezelési utalvány"].includes(kind) || details.length < 3 || details.length > 1000) {
    throw new ReviewApiError(400, "Válassz egy igénylést, és adj meg legalább néhány részletet.");
  }
  const id = randomUUID();
  await getPool().execute("INSERT INTO biocare_gift_requests (id, customer_id, request_kind, details) VALUES (?, ?, ?, ?)", [id, customer.id, kind, details]);
  const notifyTo = process.env.REVIEW_ADMIN_EMAIL?.trim() || currentAdminEmail();
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
      await adminTransport().sendMail({
        to: notifyTo,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        subject: `BioCare igénylés – ${kind}`,
        text: `Új igénylés érkezett.\nNév: ${customer.name}\nE-mail: ${customer.email}\nTípus: ${kind}\nRészletek: ${details}\nAz igénylés a vendég adminfiókjában is megjelenik.`,
        html: `<main style="font-family:Arial,sans-serif;color:#283126"><h1>Új BioCare-igénylés</h1><p><b>${escapeHtml(kind)}</b></p><p>Név: ${escapeHtml(customer.name)}<br>E-mail: ${escapeHtml(customer.email)}</p><p>${escapeHtml(details)}</p></main>`,
      });
    } catch (error) {
      console.error("Gift request was saved, but the notification email failed", error);
    }
  }
  return id;
}

export async function getReviewAdminDashboard(): Promise<AdminDashboard> {
  await ensureReviewSchema();
  const db = getPool();
  const [[userRows], [requestRows], [reviewStats]] = await Promise.all([
    db.query<mysql.RowDataPacket[]>(`SELECT c.id, c.display_name AS name, c.email, c.phone, DATE_FORMAT(c.created_at, '%Y-%m-%d') AS createdAt, COUNT(DISTINCT r.id) AS reviewCount, COUNT(DISTINCT g.id) AS giftRequestCount FROM biocare_review_customers c LEFT JOIN biocare_reviews r ON r.customer_id = c.id LEFT JOIN biocare_gift_requests g ON g.customer_id = c.id GROUP BY c.id ORDER BY c.created_at DESC LIMIT 500`),
    db.query<mysql.RowDataPacket[]>(`SELECT g.id, g.request_kind AS kind, g.details, g.status, DATE_FORMAT(g.created_at, '%Y-%m-%d') AS createdAt, c.display_name AS customerName, c.email AS customerEmail, c.phone AS customerPhone FROM biocare_gift_requests g JOIN biocare_review_customers c ON c.id = g.customer_id ORDER BY g.created_at DESC LIMIT 500`),
    db.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) AS total, SUM(status = 'pending') AS pending, SUM(status = 'published') AS published FROM biocare_reviews`),
  ]);
  const [[customerCount]] = await db.query<mysql.RowDataPacket[]>("SELECT COUNT(*) AS total FROM biocare_review_customers");
  const [[requestCount]] = await db.query<mysql.RowDataPacket[]>("SELECT COUNT(*) AS total FROM biocare_gift_requests WHERE status IN ('requested', 'contacted')");
  const stats = reviewStats[0] || {};
  return {
    users: userRows.map((row) => ({ id: String(row.id), name: String(row.name), email: String(row.email), phone: String(row.phone || ""), createdAt: String(row.createdAt), reviewCount: Number(row.reviewCount), giftRequestCount: Number(row.giftRequestCount) })),
    giftRequests: requestRows.map((row) => ({ id: String(row.id), kind: String(row.kind), details: String(row.details), status: row.status as CustomerGiftRequest["status"], createdAt: String(row.createdAt), customerName: String(row.customerName), customerEmail: String(row.customerEmail), customerPhone: String(row.customerPhone || "") })),
    counts: { users: Number(customerCount.total), reviews: Number(stats.total || 0), pendingReviews: Number(stats.pending || 0), publishedReviews: Number(stats.published || 0), giftRequests: Number(requestCount.total) },
  };
}

export async function updateAdminGiftRequestStatus(id: string, rawStatus: unknown) {
  await ensureReviewSchema();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["requested", "contacted", "completed", "cancelled"].includes(String(rawStatus))) return false;
  const [result] = await getPool().execute<mysql.ResultSetHeader>("UPDATE biocare_gift_requests SET status = ? WHERE id = ?", [rawStatus, id]);
  return result.affectedRows === 1;
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

export async function getReviewIntegrationSettings(): Promise<ReviewIntegrationSettings> {
  await ensureReviewSchema();
  const [rows] = await getPool().query<mysql.RowDataPacket[]>("SELECT google_url AS googleUrl, facebook_url AS facebookUrl, instagram_url AS instagramUrl FROM biocare_review_integrations WHERE id = 1 LIMIT 1");
  const row = rows[0];
  return { googleUrl: String(row?.googleUrl || ""), facebookUrl: String(row?.facebookUrl || ""), instagramUrl: String(row?.instagramUrl || "") };
}

export async function saveReviewIntegrationSettings(value: unknown): Promise<ReviewIntegrationSettings> {
  if (!value || typeof value !== "object") throw new ReviewApiError(400, "Ellenőrizd a megadott kapcsolatokat.");
  const input = value as Record<string, unknown>;
  const parseUrl = (key: keyof ReviewIntegrationSettings) => {
    const raw = typeof input[key] === "string" ? input[key].trim() : "";
    if (!raw) return "";
    if (raw.length > 2048) throw new ReviewApiError(400, "A hivatkozás túl hosszú.");
    let url: URL;
    try { url = new URL(raw); } catch { throw new ReviewApiError(400, "Csak teljes, https:// kezdetű hivatkozást adj meg."); }
    if (url.protocol !== "https:") throw new ReviewApiError(400, "Csak biztonságos https:// hivatkozás menthető.");
    return url.toString();
  };
  const settings = { googleUrl: parseUrl("googleUrl"), facebookUrl: parseUrl("facebookUrl"), instagramUrl: parseUrl("instagramUrl") };
  await ensureReviewSchema();
  await getPool().execute("UPDATE biocare_review_integrations SET google_url = ?, facebook_url = ?, instagram_url = ? WHERE id = 1", [settings.googleUrl, settings.facebookUrl, settings.instagramUrl]);
  return settings;
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

export async function submitReview(input: ReviewInput, requestOrigin: string, customerId: string | null = null) {
  await ensureReviewSchema();
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 48 * 60 * 60_000);
  const db = getPool();
  await db.execute(
    "INSERT INTO biocare_reviews (id, author, rating, review_text, source, status, consent_at, approval_token_hash, approval_expires_at, customer_id) VALUES (?, ?, ?, ?, 'website', 'pending', NOW(), ?, ?, ?)",
    [id, input.name, input.rating, input.review, tokenHash, expires, customerId],
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
