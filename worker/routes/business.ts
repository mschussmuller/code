import { Hono } from "hono";
import { canSeeFinance, isManager, OPERATION_STATUS, type OperationStatus } from "../../shared/roles";
import { requireRole } from "../auth";
import { audit, body, fail, newId, notify, nowIso, pick, updateRow, type AppEnv } from "../lib";
import { loadClient } from "./crm";

const STATUS_IDS = OPERATION_STATUS.map((s) => s.id) as string[];
const UNIT_STATUS_FOR: Record<OperationStatus, string> = { reserva: "Reservado", boleto: "Reservado", escritura: "Vendido", caida: "Disponible" };
const CLIENT_STAGE_FOR: Record<OperationStatus, string> = { reserva: "reservado", boleto: "reservado", escritura: "ganado", caida: "negociacion" };

async function managers(db: D1Database) {
  const { results } = await db.prepare("SELECT id FROM users WHERE active = 1 AND role IN ('director','socio','admin')").all<{ id: string }>();
  return results.map((r) => r.id);
}

async function syncUnitAndClient(db: D1Database, op: { unit_id: string | null; client_id: string | null }, status: OperationStatus, userId: string) {
  if (op.unit_id) {
    const unit = await db.prepare("SELECT status FROM units WHERE id = ?").bind(op.unit_id).first<{ status: string }>();
    const next = UNIT_STATUS_FOR[status];
    if (unit && unit.status !== next) {
      await db.batch([
        db.prepare("UPDATE units SET status = ?, updated_at = ? WHERE id = ?").bind(next, nowIso().slice(0, 10), op.unit_id),
        db.prepare("INSERT INTO unit_changes (id, unit_id, field, old_value, new_value, source, created_at, created_by) VALUES (?, ?, 'status', ?, ?, 'Operación', ?, ?)")
          .bind(newId(), op.unit_id, unit.status, next, nowIso(), userId),
      ]);
    }
  }
  if (op.client_id) await db.prepare("UPDATE clients SET stage = ?, updated_at = ? WHERE id = ?").bind(CLIENT_STAGE_FOR[status], nowIso(), op.client_id).run();
}

/** Al firmar boleto/escritura genera el cobro de comisión y el pago al vendedor esperados (una sola vez). */
async function ensureCommissionPayments(db: D1Database, opId: string, userId: string) {
  const op = await db.prepare("SELECT * FROM operations WHERE id = ?").bind(opId).first<Record<string, number & string>>();
  if (!op || !op.commission_pct) return;
  const existing = await db.prepare("SELECT 1 FROM payments WHERE operation_id = ? AND kind = 'cobro'").bind(opId).first();
  if (existing) return;
  const commission = (op.price_usd * op.commission_pct) / 100;
  const sellerPart = (commission * op.seller_share_pct) / 100;
  const due = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);
  const stmts = [db.prepare("INSERT INTO payments (id, operation_id, kind, category, description, amount_usd, due_date, created_at, created_by) VALUES (?, ?, 'cobro', 'Comisión', ?, ?, ?, ?, ?)")
    .bind(newId(), opId, `Comisión ${op.unit_label} · ${op.client_name}`, commission, due, nowIso(), userId)];
  if (sellerPart > 0) stmts.push(db.prepare("INSERT INTO payments (id, operation_id, kind, category, description, amount_usd, due_date, user_id, created_at, created_by) VALUES (?, ?, 'pago_vendedor', 'Comisión vendedor', ?, ?, ?, ?, ?, ?)")
    .bind(newId(), opId, `Comisión vendedor ${op.unit_label}`, sellerPart, due, op.seller_id, nowIso(), userId));
  await db.batch(stmts);
}

export const operationRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const manager = isManager(user.role);
    const finance = canSeeFinance(user.role);
    const { results } = await c.env.DB.prepare(
      `SELECT o.*, u.name AS seller_name FROM operations o JOIN users u ON u.id = o.seller_id ${manager ? "" : "WHERE o.seller_id = ?"} ORDER BY o.reserved_at DESC LIMIT 500`,
    ).bind(...(manager ? [] : [user.id])).all<Record<string, unknown>>();
    const rows = results.map((o) => {
      const commission = (Number(o.price_usd) * Number(o.commission_pct)) / 100;
      const sellerCommission = (commission * Number(o.seller_share_pct)) / 100;
      // Los vendedores ven su comisión, no la de la empresa.
      return finance ? { ...o, commission_usd: commission, seller_commission_usd: sellerCommission }
        : { ...o, commission_pct: undefined, seller_share_pct: undefined, seller_commission_usd: sellerCommission };
    });
    return c.json({ operations: rows });
  })
  .post("/", async (c) => {
    const user = c.get("user");
    const data = await body(c);
    const finance = canSeeFinance(user.role);
    let clientName = String(data.client_name ?? "").trim();
    const clientId = (data.client_id as string) || null;
    if (clientId) clientName = String((await loadClient(c, clientId)).name);
    let unitLabel = String(data.unit_label ?? "").trim();
    const unitId = (data.unit_id as string) || null;
    let price = Number(data.price_usd);
    if (unitId) {
      const unit = await c.env.DB.prepare("SELECT u.code, u.price, u.currency, u.status, p.name FROM units u JOIN projects p ON p.id = u.project_id WHERE u.id = ?")
        .bind(unitId).first<{ code: string; price: number; currency: string; status: string; name: string }>();
      if (!unit) fail(404, "Unidad no encontrada");
      if (unit.status === "Vendido" || unit.status === "Reservado") fail(409, `La unidad ya figura como ${unit.status.toLowerCase()}`);
      unitLabel = `${unit.name} · ${unit.code}`;
      if (!price) price = unit.currency === "USD" ? unit.price : unit.price / 7900;
    }
    if (!clientName || !unitLabel || !price) fail(400, "Completá cliente, unidad y precio");
    const sellerId = isManager(user.role) && data.seller_id ? String(data.seller_id) : user.id;
    const id = newId();
    const status = "reserva" as const;
    await c.env.DB.prepare(
      `INSERT INTO operations (id, unit_id, unit_label, client_id, client_name, seller_id, status, price_usd, commission_pct, seller_share_pct, reserved_at, notes, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, unitId, unitLabel, clientId, clientName, sellerId, status, price, finance ? Number(data.commission_pct) || 0 : 0,
      finance ? Number(data.seller_share_pct) || 0 : 0, String(data.reserved_at || nowIso().slice(0, 10)), (data.notes as string) || null, nowIso(), user.id).run();
    await syncUnitAndClient(c.env.DB, { unit_id: unitId, client_id: clientId }, status, user.id);
    for (const m of await managers(c.env.DB)) if (m !== user.id) await notify(c.env.DB, m, "Nueva reserva", `${unitLabel} · ${clientName} (${user.name})`, "/operaciones");
    await audit(c.env.DB, user.id, "CREATED", "operation", id);
    return c.json({ id }, 201);
  })
  .patch("/:id", requireRole(isManager), async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    const op = await c.env.DB.prepare("SELECT * FROM operations WHERE id = ?").bind(id).first<{ status: OperationStatus; unit_id: string | null; client_id: string | null }>();
    if (!op) fail(404, "Operación no encontrada");
    const allowed = canSeeFinance(user.role) ? ["status", "price_usd", "commission_pct", "seller_share_pct", "seller_id", "notes", "closed_at"] : ["status", "notes", "closed_at"];
    const fields = pick(await body(c), allowed);
    if (fields.status && !STATUS_IDS.includes(String(fields.status))) fail(400, "Estado inválido");
    if (fields.status === "escritura" && !fields.closed_at) fields.closed_at = nowIso().slice(0, 10);
    await updateRow(c.env.DB, "operations", id, fields);
    if (fields.status && fields.status !== op.status) {
      await syncUnitAndClient(c.env.DB, op, fields.status as OperationStatus, user.id);
      if (fields.status === "boleto" || fields.status === "escritura") await ensureCommissionPayments(c.env.DB, id, user.id);
    }
    await audit(c.env.DB, user.id, "UPDATED", "operation", id, fields);
    return c.json({ ok: true });
  });

export const financeRoutes = new Hono<AppEnv>()
  .use(requireRole(canSeeFinance))
  .get("/payments", async (c) => {
    const { results } = await c.env.DB.prepare(
      `SELECT p.*, o.unit_label AS operation_label, u.name AS user_name FROM payments p
       LEFT JOIN operations o ON o.id = p.operation_id LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.paid_date IS NOT NULL, COALESCE(p.due_date, p.created_at) DESC LIMIT 1000`,
    ).all();
    return c.json({ payments: results });
  })
  .post("/payments", async (c) => {
    const data = await body(c);
    const kind = String(data.kind);
    if (!["cobro", "pago_vendedor", "gasto", "ingreso"].includes(kind)) fail(400, "Tipo inválido");
    const amount = Number(data.amount_usd);
    const description = String(data.description ?? "").trim();
    if (!description || !(amount > 0)) fail(400, "Completá descripción y monto");
    const id = newId();
    await c.env.DB.prepare(
      "INSERT INTO payments (id, operation_id, kind, category, description, amount_usd, due_date, paid_date, user_id, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(id, (data.operation_id as string) || null, kind, (data.category as string) || null, description, amount, (data.due_date as string) || null,
      (data.paid_date as string) || null, (data.user_id as string) || null, nowIso(), c.get("user").id).run();
    await audit(c.env.DB, c.get("user").id, "CREATED", "payment", id, { kind, amount });
    return c.json({ id }, 201);
  })
  .patch("/payments/:id", async (c) => {
    const id = c.req.param("id");
    const fields = pick(await body(c), ["category", "description", "amount_usd", "due_date", "paid_date"]);
    await updateRow(c.env.DB, "payments", id, fields);
    await audit(c.env.DB, c.get("user").id, "UPDATED", "payment", id, fields);
    return c.json({ ok: true });
  })
  .delete("/payments/:id", async (c) => {
    const id = c.req.param("id");
    await c.env.DB.prepare("DELETE FROM payments WHERE id = ?").bind(id).run();
    await audit(c.env.DB, c.get("user").id, "DELETED", "payment", id);
    return c.json({ ok: true });
  })
  .get("/summary", async (c) => {
    const year = Number(c.req.query("year")) || new Date().getFullYear();
    const { results: months } = await c.env.DB.prepare(
      `SELECT substr(paid_date, 1, 7) AS month,
         SUM(CASE WHEN kind IN ('cobro','ingreso') THEN amount_usd ELSE 0 END) AS income,
         SUM(CASE WHEN kind = 'pago_vendedor' THEN amount_usd ELSE 0 END) AS payouts,
         SUM(CASE WHEN kind = 'gasto' THEN amount_usd ELSE 0 END) AS expenses
       FROM payments WHERE paid_date LIKE ? GROUP BY month ORDER BY month`,
    ).bind(`${year}-%`).all();
    const pending = await c.env.DB.prepare(
      `SELECT SUM(CASE WHEN kind = 'cobro' THEN amount_usd ELSE 0 END) AS receivable,
              SUM(CASE WHEN kind = 'cobro' AND due_date < date('now') THEN amount_usd ELSE 0 END) AS overdue_receivable,
              SUM(CASE WHEN kind = 'pago_vendedor' THEN amount_usd ELSE 0 END) AS payable
       FROM payments WHERE paid_date IS NULL`,
    ).first();
    const { results: expensesByCategory } = await c.env.DB.prepare(
      "SELECT COALESCE(category, 'Sin categoría') AS category, SUM(amount_usd) AS total FROM payments WHERE kind = 'gasto' AND paid_date LIKE ? GROUP BY category ORDER BY total DESC",
    ).bind(`${year}-%`).all();
    const { results: sellers } = await c.env.DB.prepare(
      `SELECT u.id, u.name, COUNT(o.id) AS operations, COALESCE(SUM(o.price_usd), 0) AS volume,
         COALESCE(SUM(o.price_usd * o.commission_pct / 100), 0) AS commission,
         COALESCE(SUM(o.price_usd * o.commission_pct / 100 * o.seller_share_pct / 100), 0) AS seller_commission
       FROM users u LEFT JOIN operations o ON o.seller_id = u.id AND o.status != 'caida' AND o.reserved_at LIKE ?
       WHERE u.active = 1 GROUP BY u.id ORDER BY volume DESC`,
    ).bind(`${year}-%`).all();
    return c.json({ year, months, pending, expensesByCategory, sellers });
  });

export const dashboardRoutes = new Hono<AppEnv>().get("/", async (c) => {
  const user = c.get("user");
  const db = c.env.DB;
  const manager = isManager(user.role);
  const scope = manager ? "" : "AND assigned_to = ?";
  const scopeArgs = manager ? [] : [user.id];
  const monthStart = nowIso().slice(0, 7);
  const staleDate = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

  const [inventory, staleProjects, changes, pipeline, cold, tasks, proposals, operations] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS units, COUNT(DISTINCT project_id) AS projects, SUM(CASE WHEN currency = 'USD' THEN price ELSE price / 7900 END) AS value
                FROM units WHERE status = 'Disponible'`).first(),
    db.prepare("SELECT id, name, updated_at FROM projects WHERE active = 1 AND updated_at < ? ORDER BY updated_at LIMIT 20").bind(staleDate).all(),
    db.prepare("SELECT COUNT(*) AS n FROM unit_changes WHERE created_at > ?").bind(weekAgo).first<{ n: number }>(),
    db.prepare(`SELECT stage, COUNT(*) AS n FROM clients WHERE 1 = 1 ${scope} GROUP BY stage`).bind(...scopeArgs).all(),
    db.prepare(`SELECT COUNT(*) AS n FROM clients WHERE stage IN ('nuevo','contactado','visita','propuesta','negociacion') AND COALESCE(last_contact_at, created_at) < ? ${scope}`)
      .bind(weekAgo, ...scopeArgs).first<{ n: number }>(),
    db.prepare("SELECT SUM(CASE WHEN due_at < ? THEN 1 ELSE 0 END) AS overdue, SUM(CASE WHEN substr(due_at, 1, 10) = ? THEN 1 ELSE 0 END) AS today FROM tasks WHERE done_at IS NULL AND assigned_to = ?")
      .bind(nowIso(), nowIso().slice(0, 10), user.id).first(),
    db.prepare(`SELECT COUNT(*) AS n FROM proposals WHERE created_at LIKE ? ${manager ? "" : "AND user_id = ?"}`).bind(`${monthStart}%`, ...scopeArgs).first<{ n: number }>(),
    db.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(price_usd), 0) AS volume FROM operations WHERE status != 'caida' AND reserved_at LIKE ? ${manager ? "" : "AND seller_id = ?"}`)
      .bind(`${monthStart}%`, ...scopeArgs).first(),
  ]);

  let sellers = null;
  if (manager) {
    sellers = (await db.prepare(
      `SELECT u.id, u.name, u.role,
         (SELECT COUNT(*) FROM clients cl WHERE cl.assigned_to = u.id AND cl.stage NOT IN ('ganado','perdido')) AS active_clients,
         (SELECT COUNT(*) FROM proposals pr WHERE pr.user_id = u.id AND pr.created_at > ?) AS proposals_30d,
         (SELECT COUNT(*) FROM operations o WHERE o.seller_id = u.id AND o.status != 'caida' AND o.reserved_at > ?) AS operations_30d,
         (SELECT COALESCE(SUM(o.price_usd), 0) FROM operations o WHERE o.seller_id = u.id AND o.status != 'caida' AND o.reserved_at > ?) AS volume_30d,
         (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = u.id AND t.done_at IS NULL AND t.due_at < ?) AS overdue_tasks
       FROM users u WHERE u.active = 1 ORDER BY volume_30d DESC, operations_30d DESC, active_clients DESC`,
    ).bind(new Date(Date.now() - 30 * 86400_000).toISOString(), new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10),
      new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10), nowIso()).all()).results;
  }

  let finance = null;
  if (canSeeFinance(user.role)) {
    finance = await db.prepare(
      `SELECT SUM(CASE WHEN kind = 'cobro' AND paid_date IS NULL THEN amount_usd ELSE 0 END) AS receivable,
              SUM(CASE WHEN kind IN ('cobro','ingreso') AND paid_date LIKE ? THEN amount_usd ELSE 0 END) AS income_month,
              SUM(CASE WHEN kind IN ('gasto','pago_vendedor') AND paid_date LIKE ? THEN amount_usd ELSE 0 END) AS outflow_month
       FROM payments`,
    ).bind(`${monthStart}%`, `${monthStart}%`).first();
  }

  return c.json({
    inventory: { ...inventory, staleProjects: staleProjects.results, changes7d: changes?.n ?? 0 },
    pipeline: pipeline.results, coldClients: cold?.n ?? 0, tasks, proposalsMonth: proposals?.n ?? 0, operationsMonth: operations,
    sellers, finance,
  });
});

export const notificationRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const { results } = await c.env.DB.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").bind(c.get("user").id).all();
    return c.json({ notifications: results });
  })
  .post("/read", async (c) => {
    await c.env.DB.prepare("UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL").bind(nowIso(), c.get("user").id).run();
    return c.json({ ok: true });
  });
