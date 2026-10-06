import { Hono } from "hono";
import { canManageUsers, type Role } from "../../shared/roles";
import { hashPassword, normalizeEmail, requireRole } from "../auth";
import { audit, body, fail, newId, nowIso, pick, updateRow, type AppEnv } from "../lib";

const ROLES: Role[] = ["director", "socio", "admin", "vendedor"];

function tempPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const userRoutes = new Hono<AppEnv>()
  // Lista básica del equipo (para asignar clientes, filtros, etc.)
  .get("/", async (c) => {
    const { results } = await c.env.DB.prepare(
      "SELECT id, email, name, role, phone, active, must_change_password, created_at FROM users ORDER BY active DESC, name",
    ).all();
    return c.json({ users: results });
  })
  .post("/", requireRole(canManageUsers), async (c) => {
    const data = await body(c);
    const role = data.role as Role;
    if (!ROLES.includes(role)) fail(400, "Rol inválido");
    const name = String(data.name ?? "").trim();
    if (!name) fail(400, "Ingresá el nombre");
    const email = normalizeEmail(data.email);
    if (await c.env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first()) fail(409, "Ya existe un usuario con ese email");
    const password = tempPassword();
    const id = newId();
    await c.env.DB.prepare("INSERT INTO users (id, email, name, role, phone, password_hash, must_change_password, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)")
      .bind(id, email, name, role, (data.phone as string) || null, await hashPassword(password), nowIso()).run();
    await audit(c.env.DB, c.get("user").id, "CREATED", "user", id, { email, role });
    return c.json({ id, temporaryPassword: password }, 201);
  })
  .patch("/:id", requireRole(canManageUsers), async (c) => {
    const id = c.req.param("id");
    const data = await body(c);
    const me = c.get("user");
    const fields = pick(data, ["name", "role", "phone", "active"]);
    if (fields.role && !ROLES.includes(fields.role as Role)) fail(400, "Rol inválido");
    if (id === me.id && (fields.active === 0 || (fields.role && fields.role !== me.role))) fail(400, "No podés quitarte tu propio acceso");
    const target = await c.env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(id).first<{ role: Role }>();
    if (!target) fail(404, "Usuario no encontrado");
    if (target.role === "director" && me.role !== "director") fail(403, "Sólo el director puede modificar a otro director");
    await updateRow(c.env.DB, "users", id, fields);
    let temporaryPassword: string | undefined;
    if (data.resetPassword) {
      temporaryPassword = tempPassword();
      await c.env.DB.prepare("UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?").bind(await hashPassword(temporaryPassword), id).run();
      await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
    }
    if (fields.active === 0) await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
    await audit(c.env.DB, me.id, "UPDATED", "user", id, { ...fields, resetPassword: Boolean(data.resetPassword) });
    return c.json({ ok: true, temporaryPassword });
  });
