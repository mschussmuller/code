import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import type { Role } from "../shared/roles";
import { audit, body, fail, newId, nowIso, type AppEnv, type Ctx, type SessionUser } from "./lib";

const COOKIE = "vos_session";
const SESSION_DAYS = 30;
const ITERATIONS = 100_000; // máximo soportado por PBKDF2 en Workers

const b64 = (bytes: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(await pbkdf2(password, salt, ITERATIONS))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  const candidate = new Uint8Array(await pbkdf2(password, unb64(salt), Number(iter)));
  const expected = unb64(hash);
  if (candidate.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) diff |= candidate[i] ^ expected[i];
  return diff === 0;
}

async function sha256(value: string) {
  return b64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

export function validatePassword(password: unknown): string {
  if (typeof password !== "string" || password.length < 8) fail(400, "La contraseña debe tener al menos 8 caracteres");
  return password;
}

export function normalizeEmail(email: unknown): string {
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fail(400, "Email inválido");
  return value;
}

async function startSession(c: Ctx, userId: string) {
  const token = b64(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await c.env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, expires.toISOString(), nowIso()).run();
  setCookie(c, COOKIE, token, { httpOnly: true, secure: new URL(c.req.url).protocol === "https:", sameSite: "Lax", path: "/", expires });
}

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE);
  if (!token) fail(401, "Sesión no iniciada");
  const user = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.role, u.phone, u.must_change_password FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ? AND u.active = 1`,
  ).bind(await sha256(token), nowIso()).first<SessionUser>();
  if (!user) fail(401, "Sesión vencida");
  c.set("user", user);
  await next();
});

export const requireRole = (check: (role: Role) => boolean) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (!check(c.get("user").role)) fail(403, "No tenés permiso para ver esta información");
    await next();
  });

export const authRoutes = new Hono<AppEnv>()
  .get("/status", async (c) => {
    const count = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    return c.json({ needsSetup: !count?.n });
  })
  // Primer uso: crea la cuenta del director. Sólo funciona si no existe ningún usuario.
  .post("/setup", async (c) => {
    const data = await body(c);
    const count = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    if (count?.n) fail(409, "El sistema ya fue configurado");
    const id = newId();
    const name = String(data.name ?? "").trim();
    if (!name) fail(400, "Ingresá tu nombre");
    await c.env.DB.prepare("INSERT INTO users (id, email, name, role, phone, password_hash, created_at) VALUES (?, ?, ?, 'director', ?, ?, ?)")
      .bind(id, normalizeEmail(data.email), name, (data.phone as string) || null, await hashPassword(validatePassword(data.password)), nowIso()).run();
    await audit(c.env.DB, id, "SETUP", "user", id);
    await startSession(c, id);
    return c.json({ ok: true }, 201);
  })
  .post("/login", async (c) => {
    const data = await body(c);
    const email = normalizeEmail(data.email);
    const user = await c.env.DB.prepare("SELECT id, password_hash FROM users WHERE email = ? AND active = 1").bind(email).first<{ id: string; password_hash: string }>();
    if (!user || !(await verifyPassword(String(data.password ?? ""), user.password_hash))) fail(401, "Email o contraseña incorrectos");
    await startSession(c, user.id);
    await audit(c.env.DB, user.id, "LOGIN", "user", user.id);
    return c.json({ ok: true });
  })
  .post("/logout", async (c) => {
    const token = getCookie(c, COOKIE);
    if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(await sha256(token)).run();
    deleteCookie(c, COOKIE, { path: "/" });
    return c.json({ ok: true });
  })
  .get("/me", requireUser, (c) => c.json({ user: c.get("user") }))
  .post("/password", requireUser, async (c) => {
    const data = await body(c);
    const user = c.get("user");
    const row = await c.env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(user.id).first<{ password_hash: string }>();
    if (!row || !(await verifyPassword(String(data.current ?? ""), row.password_hash))) fail(400, "La contraseña actual no es correcta");
    await c.env.DB.prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?")
      .bind(await hashPassword(validatePassword(data.next)), user.id).run();
    return c.json({ ok: true });
  });

