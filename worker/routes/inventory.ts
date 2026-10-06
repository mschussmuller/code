import { Hono } from "hono";
import { canEditInventory, UNIT_STATUS } from "../../shared/roles";
import { requireRole } from "../auth";
import { audit, body, fail, newId, notify, nowIso, pick, updateRow, type AppEnv } from "../lib";

const FX_DEFAULT = 7900;

const PROJECT_FIELDS = ["name", "location", "stage", "delivery", "confidence", "summary", "brochure_url", "price_list_url", "plans_url",
  "media_url", "video_url", "drive_url", "map_query", "image_url", "parking_price_usd", "source_label", "active"] as const;
const UNIT_FIELDS = ["code", "floor", "type", "bedrooms", "own_m2", "balcony_m2", "total_m2", "currency", "price", "parking", "status",
  "down_payment", "monthly_payment", "balance_on_delivery", "features"] as const;
const TRACKED = ["price", "status", "currency"];

export const inventoryRoutes = new Hono<AppEnv>()
  .get("/projects", async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT p.*, d.name AS developer_name,
         (SELECT COUNT(*) FROM units u WHERE u.project_id = p.id AND u.status = 'Disponible') AS available_units,
         (SELECT MIN(CASE WHEN u.currency = 'USD' THEN u.price ELSE u.price / ${FX_DEFAULT} END) FROM units u WHERE u.project_id = p.id AND u.status = 'Disponible') AS min_price_usd,
         (SELECT MAX(CASE WHEN u.currency = 'USD' THEN u.price ELSE u.price / ${FX_DEFAULT} END) FROM units u WHERE u.project_id = p.id AND u.status = 'Disponible') AS max_price_usd
       FROM projects p JOIN developers d ON d.id = p.developer_id
       ORDER BY d.name, p.name`,
    ).all();
    return c.json({ projects: results });
  })
  .get("/projects/:id", async (c) => {
    const id = c.req.param("id");
    const project = await c.env.DB.prepare("SELECT p.*, d.name AS developer_name FROM projects p JOIN developers d ON d.id = p.developer_id WHERE p.id = ?").bind(id).first();
    if (!project) fail(404, "Proyecto no encontrado");
    const { results: units } = await c.env.DB.prepare("SELECT * FROM units WHERE project_id = ? ORDER BY CAST(floor AS INTEGER), code").bind(id).all();
    return c.json({ project, units });
  })
  .patch("/projects/:id", requireRole(canEditInventory), async (c) => {
    const id = c.req.param("id");
    const fields = pick(await body(c), PROJECT_FIELDS);
    fields.updated_at = nowIso().slice(0, 10);
    await updateRow(c.env.DB, "projects", id, fields);
    await audit(c.env.DB, c.get("user").id, "UPDATED", "project", id, fields);
    return c.json({ ok: true });
  })
  .post("/projects", requireRole(canEditInventory), async (c) => {
    const data = await body(c);
    const name = String(data.name ?? "").trim();
    const developerName = String(data.developer_name ?? "").trim();
    if (!name || !developerName) fail(400, "Ingresá el nombre del proyecto y la desarrolladora");
    const devId = developerName.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await c.env.DB.prepare("INSERT OR IGNORE INTO developers (id, name) VALUES (?, ?)").bind(devId, developerName).run();
    const id = `${devId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.slice(0, 60) + "-" + newId().slice(0, 4);
    await c.env.DB.prepare(
      "INSERT INTO projects (id, developer_id, name, location, stage, delivery, confidence, summary, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'Requiere confirmación', ?, ?)",
    ).bind(id, devId, name, String(data.location ?? ""), String(data.stage ?? "Pozo"), String(data.delivery ?? "Requiere confirmación"), String(data.summary ?? ""), nowIso().slice(0, 10)).run();
    await audit(c.env.DB, c.get("user").id, "CREATED", "project", id, { name, developerName });
    return c.json({ id }, 201);
  })
  // Buscador de unidades: filtra por presupuesto, dormitorios, zona, etapa, desarrolladora.
  .get("/units", async (c) => {
    const q = c.req.query();
    const where = ["p.active = 1"];
    const args: (string | number)[] = [];
    const status = q.status ?? "Disponible";
    if (status !== "todas") { where.push("u.status = ?"); args.push(status); }
    const usd = `(CASE WHEN u.currency = 'USD' THEN u.price ELSE u.price / ${FX_DEFAULT} END)`;
    if (q.min) { where.push(`${usd} >= ?`); args.push(Number(q.min)); }
    if (q.max) { where.push(`${usd} <= ?`); args.push(Number(q.max)); }
    if (q.bedrooms) { where.push(q.bedrooms === "3" ? "u.bedrooms >= 3" : "u.bedrooms = ?"); if (q.bedrooms !== "3") args.push(Number(q.bedrooms)); }
    if (q.minM2) { where.push("u.total_m2 >= ?"); args.push(Number(q.minM2)); }
    if (q.stage) { where.push("p.stage = ?"); args.push(q.stage); }
    if (q.developer) { where.push("p.developer_id = ?"); args.push(q.developer); }
    if (q.project) { where.push("p.id = ?"); args.push(q.project); }
    if (q.parking === "1") where.push("u.parking > 0");
    if (q.zone) {
      const zones = q.zone.split(",").map((z) => z.trim()).filter(Boolean);
      if (zones.length) { where.push(`(${zones.map(() => "p.location LIKE ?").join(" OR ")})`); args.push(...zones.map((z) => `%${z}%`)); }
    }
    if (q.text) { where.push("(u.type LIKE ? OR u.code LIKE ? OR p.name LIKE ?)"); args.push(`%${q.text}%`, `%${q.text}%`, `%${q.text}%`); }
    if (q.ids) { const ids = q.ids.split(",").slice(0, 50); where.splice(0, where.length, `u.id IN (${ids.map(() => "?").join(",")})`); args.splice(0, args.length, ...ids); }
    const order = q.sort === "price_desc" ? `${usd} DESC` : q.sort === "m2" ? "u.total_m2 DESC" : `${usd} ASC`;
    const { results } = await c.env.DB.prepare(
      `SELECT u.*, p.name AS project_name, p.location, p.stage, p.delivery, p.color, p.image_url, p.parking_price_usd, d.name AS developer_name
       FROM units u JOIN projects p ON p.id = u.project_id JOIN developers d ON d.id = p.developer_id
       WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${Math.min(Number(q.limit) || 200, 500)}`,
    ).bind(...args).all();
    return c.json({ units: results });
  })
  .post("/units", requireRole(canEditInventory), async (c) => {
    const data = await body(c);
    const projectId = String(data.project_id ?? "");
    if (!(await c.env.DB.prepare("SELECT 1 FROM projects WHERE id = ?").bind(projectId).first())) fail(404, "Proyecto no encontrado");
    const fields = pick(data, UNIT_FIELDS);
    if (!fields.code || !fields.price) fail(400, "Código y precio son obligatorios");
    const id = `${projectId}-${String(fields.code).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${newId().slice(0, 4)}`;
    const row = { id, project_id: projectId, floor: "", type: "", bedrooms: 0, currency: "USD", parking: 0, status: "Disponible", features: "[]", ...fields, updated_at: nowIso().slice(0, 10) };
    const keys = Object.keys(row);
    await c.env.DB.prepare(`INSERT INTO units (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`).bind(...keys.map((k) => (row as Record<string, unknown>)[k] as string | number | null)).run();
    await audit(c.env.DB, c.get("user").id, "CREATED", "unit", id, row);
    return c.json({ id }, 201);
  })
  .patch("/units/:id", requireRole(canEditInventory), async (c) => {
    const id = c.req.param("id");
    const data = await body(c);
    const fields = pick(data, UNIT_FIELDS);
    if (fields.status && !UNIT_STATUS.includes(fields.status as never)) fail(400, "Estado inválido");
    const before = await c.env.DB.prepare("SELECT u.*, p.name AS project_name FROM units u JOIN projects p ON p.id = u.project_id WHERE u.id = ?").bind(id).first<Record<string, unknown>>();
    if (!before) fail(404, "Unidad no encontrada");
    fields.updated_at = nowIso().slice(0, 10);
    await updateRow(c.env.DB, "units", id, fields);
    const user = c.get("user");
    const changed = TRACKED.filter((k) => k in fields && String(fields[k]) !== String(before[k]));
    for (const field of changed) {
      await c.env.DB.prepare("INSERT INTO unit_changes (id, unit_id, field, old_value, new_value, source, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(newId(), id, field, String(before[field]), String(fields[field]), (data.source as string) || null, nowIso(), user.id).run();
    }
    if (changed.length) await alertSellersAboutUnit(c.env.DB, id, `${before.project_name} · ${before.code}`, changed.map((f) => `${f}: ${before[f]} → ${fields[f]}`).join(" · "), user.id);
    await audit(c.env.DB, user.id, "UPDATED", "unit", id, fields);
    return c.json({ ok: true });
  })
  .get("/changes", async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT ch.*, u.code, p.name AS project_name, us.name AS user_name FROM unit_changes ch
       JOIN units u ON u.id = ch.unit_id JOIN projects p ON p.id = u.project_id LEFT JOIN users us ON us.id = ch.created_by
       ORDER BY ch.created_at DESC LIMIT 100`,
    ).all();
    return c.json({ changes: results });
  })
  .get("/developers", async (c) => {
    const { results } = await c.env.DB.prepare("SELECT * FROM developers ORDER BY name").all();
    return c.json({ developers: results });
  });

/** Avisa a cada vendedor que le propuso esta unidad a un cliente activo que cambió su precio o estado. */
async function alertSellersAboutUnit(db: D1Database, unitId: string, label: string, detail: string, actorId: string) {
  const { results } = await db.prepare(
    `SELECT DISTINCT pr.user_id, pr.client_name, pr.client_id FROM proposals pr
     LEFT JOIN clients cl ON cl.id = pr.client_id
     WHERE pr.options LIKE ? AND (cl.id IS NULL OR cl.stage NOT IN ('ganado','perdido'))`,
  ).bind(`%"unitId":"${unitId}"%`).all<{ user_id: string; client_name: string; client_id: string | null }>();
  for (const row of results) {
    if (row.user_id === actorId) continue;
    await notify(db, row.user_id, `Cambio en ${label}`, `Se la propusiste a ${row.client_name}. ${detail}`, row.client_id ? `/clientes/${row.client_id}` : "/inventario");
  }
}
