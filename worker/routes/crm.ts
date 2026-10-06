import { Hono } from "hono";
import { CLIENT_STAGES, isManager } from "../../shared/roles";
import { audit, body, fail, newId, notify, nowIso, pick, updateRow, type AppEnv, type Ctx } from "../lib";

const CLIENT_FIELDS = ["name", "phone", "email", "source", "stage", "purpose", "budget_min_usd", "budget_max_usd", "bedrooms_min", "zones",
  "preferences", "notes", "assigned_to", "next_action_at", "lost_reason"] as const;
const STAGE_IDS = CLIENT_STAGES.map((s) => s.id) as string[];

/** Devuelve el cliente si el usuario puede verlo (vendedor: sólo los asignados a él). */
export async function loadClient(c: Ctx, id: string) {
  const user = c.get("user");
  const client = await c.env.DB.prepare("SELECT cl.*, u.name AS assigned_name FROM clients cl LEFT JOIN users u ON u.id = cl.assigned_to WHERE cl.id = ?")
    .bind(id).first<Record<string, unknown>>();
  if (!client) fail(404, "Cliente no encontrado");
  if (!isManager(user.role) && client.assigned_to !== user.id) fail(403, "Este cliente está asignado a otro vendedor");
  return client;
}

export const clientRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const q = c.req.query();
    const where: string[] = [];
    const args: string[] = [];
    if (!isManager(user.role)) { where.push("cl.assigned_to = ?"); args.push(user.id); }
    else if (q.seller) { where.push("cl.assigned_to = ?"); args.push(q.seller); }
    if (q.stage) { where.push("cl.stage = ?"); args.push(q.stage); }
    if (q.text) { where.push("(cl.name LIKE ? OR cl.phone LIKE ? OR cl.email LIKE ?)"); args.push(`%${q.text}%`, `%${q.text}%`, `%${q.text}%`); }
    const { results } = await c.env.DB.prepare(
      `SELECT cl.*, u.name AS assigned_name,
         (SELECT MIN(t.due_at) FROM tasks t WHERE t.client_id = cl.id AND t.done_at IS NULL) AS next_task_at
       FROM clients cl LEFT JOIN users u ON u.id = cl.assigned_to
       ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY cl.updated_at DESC LIMIT 500`,
    ).bind(...args).all();
    return c.json({ clients: results });
  })
  .post("/", async (c) => {
    const user = c.get("user");
    const data = pick(await body(c), CLIENT_FIELDS);
    if (!String(data.name ?? "").trim()) fail(400, "Ingresá el nombre del cliente");
    if (data.stage && !STAGE_IDS.includes(String(data.stage))) fail(400, "Etapa inválida");
    if (!isManager(user.role) || !data.assigned_to) data.assigned_to = user.id;
    const id = newId();
    const now = nowIso();
    const row: Record<string, unknown> = { id, stage: "nuevo", ...data, created_at: now, updated_at: now, last_contact_at: null, created_by: user.id };
    const keys = Object.keys(row);
    await c.env.DB.prepare(`INSERT INTO clients (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`).bind(...keys.map((k) => row[k] as string | number | null)).run();
    // Primer seguimiento automático: contactar dentro de las 24 h.
    await c.env.DB.prepare("INSERT INTO tasks (id, client_id, assigned_to, title, due_at, auto, created_by, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)")
      .bind(newId(), id, row.assigned_to, `Primer contacto con ${row.name}`, new Date(Date.now() + 86400_000).toISOString(), user.id, now).run();
    if (row.assigned_to !== user.id) await notify(c.env.DB, String(row.assigned_to), "Nuevo cliente asignado", String(row.name), `/clientes/${id}`);
    await audit(c.env.DB, user.id, "CREATED", "client", id);
    return c.json({ id }, 201);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const client = await loadClient(c, id);
    const db = c.env.DB;
    const [interactions, tasks, proposals, operations] = await Promise.all([
      db.prepare("SELECT i.*, u.name AS user_name FROM interactions i LEFT JOIN users u ON u.id = i.user_id WHERE i.client_id = ? ORDER BY i.created_at DESC").bind(id).all(),
      db.prepare("SELECT t.*, u.name AS assigned_name FROM tasks t LEFT JOIN users u ON u.id = t.assigned_to WHERE t.client_id = ? ORDER BY t.done_at IS NOT NULL, t.due_at").bind(id).all(),
      db.prepare("SELECT pr.id, pr.created_at, pr.options, u.name AS user_name FROM proposals pr JOIN users u ON u.id = pr.user_id WHERE pr.client_id = ? ORDER BY pr.created_at DESC").bind(id).all(),
      db.prepare("SELECT id, unit_label, status, price_usd, reserved_at FROM operations WHERE client_id = ? ORDER BY reserved_at DESC").bind(id).all(),
    ]);
    return c.json({ client, interactions: interactions.results, tasks: tasks.results, proposals: proposals.results, operations: operations.results });
  })
  .patch("/:id", async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    const before = await loadClient(c, id);
    const data = pick(await body(c), CLIENT_FIELDS);
    if (data.stage && !STAGE_IDS.includes(String(data.stage))) fail(400, "Etapa inválida");
    if (!isManager(user.role)) delete data.assigned_to;
    data.updated_at = nowIso();
    await updateRow(c.env.DB, "clients", id, data);
    if (data.stage && data.stage !== before.stage) {
      const label = (s: unknown) => CLIENT_STAGES.find((x) => x.id === s)?.label ?? s;
      await c.env.DB.prepare("INSERT INTO interactions (id, client_id, user_id, kind, note, created_at) VALUES (?, ?, ?, 'sistema', ?, ?)")
        .bind(newId(), id, user.id, `Etapa: ${label(before.stage)} → ${label(data.stage)}${data.lost_reason ? ` (${data.lost_reason})` : ""}`, nowIso()).run();
    }
    if (data.assigned_to && data.assigned_to !== before.assigned_to) {
      await c.env.DB.prepare("UPDATE tasks SET assigned_to = ? WHERE client_id = ? AND done_at IS NULL").bind(data.assigned_to, id).run();
      await notify(c.env.DB, String(data.assigned_to), "Cliente reasignado a vos", String(before.name), `/clientes/${id}`);
    }
    await audit(c.env.DB, user.id, "UPDATED", "client", id, data);
    return c.json({ ok: true });
  })
  .post("/:id/interactions", async (c) => {
    const id = c.req.param("id");
    await loadClient(c, id);
    const data = await body(c);
    const note = String(data.note ?? "").trim();
    if (!note) fail(400, "Escribí una nota");
    const now = nowIso();
    await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO interactions (id, client_id, user_id, kind, note, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(newId(), id, c.get("user").id, String(data.kind || "nota"), note, now),
      c.env.DB.prepare("UPDATE clients SET last_contact_at = ?, updated_at = ?, stage = CASE WHEN stage = 'nuevo' THEN 'contactado' ELSE stage END WHERE id = ?").bind(now, now, id),
    ]);
    return c.json({ ok: true }, 201);
  });

export const taskRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const scope = c.req.query("scope");
    const all = scope === "all" && isManager(user.role);
    const { results } = await c.env.DB.prepare(
      `SELECT t.*, cl.name AS client_name, u.name AS assigned_name FROM tasks t
       LEFT JOIN clients cl ON cl.id = t.client_id LEFT JOIN users u ON u.id = t.assigned_to
       WHERE ${all ? "1 = 1" : "t.assigned_to = ?"} AND (t.done_at IS NULL OR t.done_at > ?)
       ORDER BY t.done_at IS NOT NULL, t.due_at LIMIT 300`,
    ).bind(...(all ? [] : [user.id]), new Date(Date.now() - 7 * 86400_000).toISOString()).all();
    return c.json({ tasks: results });
  })
  .post("/", async (c) => {
    const user = c.get("user");
    const data = await body(c);
    const title = String(data.title ?? "").trim();
    if (!title || !data.due_at) fail(400, "Ingresá la tarea y la fecha");
    if (data.client_id) await loadClient(c, String(data.client_id));
    const assigned = isManager(user.role) && data.assigned_to ? String(data.assigned_to) : user.id;
    const id = newId();
    await c.env.DB.prepare("INSERT INTO tasks (id, client_id, assigned_to, title, due_at, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, (data.client_id as string) || null, assigned, title, new Date(String(data.due_at)).toISOString(), user.id, nowIso()).run();
    if (assigned !== user.id) await notify(c.env.DB, assigned, "Nueva tarea asignada", title, "/agenda");
    return c.json({ id }, 201);
  })
  .patch("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const task = await c.env.DB.prepare("SELECT * FROM tasks WHERE id = ?").bind(id).first<{ assigned_to: string }>();
    if (!task) fail(404, "Tarea no encontrada");
    if (!isManager(user.role) && task.assigned_to !== user.id) fail(403, "Tarea de otro usuario");
    const data = await body(c);
    const fields: Record<string, unknown> = {};
    if ("done" in data) fields.done_at = data.done ? nowIso() : null;
    if (data.due_at) fields.due_at = new Date(String(data.due_at)).toISOString();
    if (data.title) fields.title = String(data.title);
    await updateRow(c.env.DB, "tasks", id, fields);
    return c.json({ ok: true });
  });

export const proposalRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const { results } = await c.env.DB.prepare(
      `SELECT pr.id, pr.client_id, pr.client_name, pr.options, pr.created_at, u.name AS user_name FROM proposals pr JOIN users u ON u.id = pr.user_id
       ${isManager(user.role) ? "" : "WHERE pr.user_id = ?"} ORDER BY pr.created_at DESC LIMIT 200`,
    ).bind(...(isManager(user.role) ? [] : [user.id])).all();
    return c.json({ proposals: results });
  })
  .post("/", async (c) => {
    const user = c.get("user");
    const data = await body(c);
    const options = Array.isArray(data.options) ? (data.options as { unitId: string }[]).filter((o) => o && typeof o.unitId === "string").slice(0, 6) : [];
    if (!options.length) fail(400, "Seleccioná al menos una unidad");
    let clientName = String(data.client_name ?? "").trim();
    const clientId = (data.client_id as string) || null;
    if (clientId) clientName = String((await loadClient(c, clientId)).name);
    if (!clientName) fail(400, "Ingresá el nombre del cliente");
    const id = newId();
    const now = nowIso();
    const stmts = [
      c.env.DB.prepare("INSERT INTO proposals (id, client_id, client_name, user_id, settings, options, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, clientId, clientName, user.id, JSON.stringify(data.settings ?? {}), JSON.stringify(options), (data.note as string) || null, now),
    ];
    if (clientId) {
      stmts.push(
        c.env.DB.prepare("INSERT INTO interactions (id, client_id, user_id, kind, note, created_at) VALUES (?, ?, ?, 'propuesta', ?, ?)").bind(newId(), clientId, user.id, `Propuesta con ${options.length} opción(es)`, now),
        c.env.DB.prepare("UPDATE clients SET stage = CASE WHEN stage IN ('nuevo','contactado','visita') THEN 'propuesta' ELSE stage END, last_contact_at = ?, updated_at = ? WHERE id = ?").bind(now, now, clientId),
        // Seguimiento automático: preguntar por la propuesta en 2 días.
        c.env.DB.prepare("INSERT INTO tasks (id, client_id, assigned_to, title, due_at, auto, created_by, created_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)")
          .bind(newId(), clientId, user.id, `Seguimiento de propuesta a ${clientName}`, new Date(Date.now() + 2 * 86400_000).toISOString(), user.id, now),
      );
    }
    await c.env.DB.batch(stmts);
    await audit(c.env.DB, user.id, "CREATED", "proposal", id);
    return c.json({ id }, 201);
  })
  .get("/:id", async (c) => {
    const user = c.get("user");
    const proposal = await c.env.DB.prepare(
      "SELECT pr.*, u.name AS user_name, u.phone AS user_phone, u.email AS user_email, cl.phone AS client_phone FROM proposals pr JOIN users u ON u.id = pr.user_id LEFT JOIN clients cl ON cl.id = pr.client_id WHERE pr.id = ?",
    ).bind(c.req.param("id")).first<Record<string, unknown>>();
    if (!proposal) fail(404, "Propuesta no encontrada");
    if (!isManager(user.role) && proposal.user_id !== user.id) fail(403, "Propuesta de otro vendedor");
    const ids = (JSON.parse(String(proposal.options)) as { unitId: string }[]).map((o) => o.unitId);
    const { results: units } = await c.env.DB.prepare(
      `SELECT u.*, p.name AS project_name, p.location, p.stage, p.delivery, p.image_url, p.color, p.brochure_url, p.map_query, d.name AS developer_name
       FROM units u JOIN projects p ON p.id = u.project_id JOIN developers d ON d.id = p.developer_id WHERE u.id IN (${ids.map(() => "?").join(",")})`,
    ).bind(...ids).all();
    return c.json({ proposal, units });
  });
