import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Role } from "../shared/roles";

export type Env = { DB: D1Database };
export type SessionUser = { id: string; email: string; name: string; role: Role; phone: string | null; must_change_password: number };
export type AppEnv = { Bindings: Env; Variables: { user: SessionUser } };
export type Ctx = Context<AppEnv>;

export const newId = () => crypto.randomUUID();
export const nowIso = () => new Date().toISOString();

export function fail(status: 400 | 401 | 403 | 404 | 409, message: string): never {
  throw new HTTPException(status, { message });
}

export async function audit(db: D1Database, userId: string | null, action: string, entity: string, entityId: string | null, details?: unknown) {
  await db.prepare("INSERT INTO audit_log (id, user_id, action, entity, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(newId(), userId, action, entity, entityId, details === undefined ? null : JSON.stringify(details), nowIso()).run();
}

export async function notify(db: D1Database, userId: string, title: string, body?: string, link?: string) {
  await db.prepare("INSERT INTO notifications (id, user_id, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(newId(), userId, title, body ?? null, link ?? null, nowIso()).run();
}

/** Picks only the allowed keys present in body, for dynamic UPDATEs. */
export function pick(body: Record<string, unknown>, allowed: readonly string[]) {
  const out: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) out[key] = body[key] === "" ? null : body[key];
  return out;
}

export async function updateRow(db: D1Database, table: string, id: string, fields: Record<string, unknown>) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  await db.prepare(`UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`)
    .bind(...keys.map((k) => fields[k] as string | number | null), id).run();
}

export async function body<T = Record<string, unknown>>(c: Ctx): Promise<T> {
  try {
    return (await c.req.json()) as T;
  } catch {
    fail(400, "Solicitud inválida");
  }
}
