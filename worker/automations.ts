import { newId, notify, nowIso } from "./lib";

// Días sin contacto antes de generar un seguimiento automático, según la etapa del cliente.
export const FOLLOW_UP_DAYS: Record<string, number> = { nuevo: 1, contactado: 4, visita: 3, propuesta: 3, negociacion: 2, reservado: 7 };
const STALE_PROJECT_DAYS = 30;

const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000).toISOString();

/** Corre todos los días (cron en wrangler.jsonc). Devuelve un resumen para el registro. */
export async function runDailyAutomations(db: D1Database) {
  const now = nowIso();
  const summary = { followUps: 0, overdueReminders: 0, staleProjects: 0, overdueReceivables: 0 };

  // 1. Seguimientos: clientes activos sin contacto reciente y sin tarea abierta.
  for (const [stage, days] of Object.entries(FOLLOW_UP_DAYS)) {
    const { results } = await db.prepare(
      `SELECT cl.id, cl.name, cl.assigned_to FROM clients cl
       WHERE cl.stage = ? AND cl.assigned_to IS NOT NULL AND COALESCE(cl.last_contact_at, cl.created_at) < ?
         AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.client_id = cl.id AND t.done_at IS NULL)`,
    ).bind(stage, daysAgo(days)).all<{ id: string; name: string; assigned_to: string }>();
    for (const cl of results) {
      await db.prepare("INSERT INTO tasks (id, client_id, assigned_to, title, due_at, auto, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)")
        .bind(newId(), cl.id, cl.assigned_to, `Seguimiento: ${cl.name} (sin contacto hace ${days}+ días)`, now, now).run();
      summary.followUps++;
    }
  }

  // 2. Resumen diario de pendientes vencidos para cada usuario.
  const { results: overdue } = await db.prepare(
    "SELECT assigned_to, COUNT(*) AS n FROM tasks WHERE done_at IS NULL AND due_at <= ? GROUP BY assigned_to",
  ).bind(now).all<{ assigned_to: string; n: number }>();
  for (const row of overdue) {
    await notify(db, row.assigned_to, `Tenés ${row.n} seguimiento${row.n === 1 ? "" : "s"} para hoy`, "Revisá tu agenda para no perder oportunidades.", "/agenda");
    summary.overdueReminders++;
  }

  const { results: managers } = await db.prepare("SELECT id, role FROM users WHERE active = 1 AND role IN ('director','socio','admin')").all<{ id: string }>();

  // 3. Proyectos con información desactualizada (verificar disponibilidad con la desarrolladora).
  const stale = await db.prepare("SELECT COUNT(*) AS n FROM projects WHERE active = 1 AND updated_at < ?")
    .bind(daysAgo(STALE_PROJECT_DAYS).slice(0, 10)).first<{ n: number }>();
  if (stale?.n && new Date().getUTCDay() === 1) { // los lunes, para no saturar
    for (const m of managers) await notify(db, m.id, `${stale.n} proyectos para verificar`, `Sin actualizar hace más de ${STALE_PROJECT_DAYS} días. Confirmá precios y disponibilidad con las desarrolladoras.`, "/inventario?vista=verificar");
    summary.staleProjects = stale.n;
  }

  // 4. Comisiones vencidas sin cobrar.
  const receivable = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(amount_usd), 0) AS total FROM payments WHERE kind = 'cobro' AND paid_date IS NULL AND due_date < ?")
    .bind(now.slice(0, 10)).first<{ n: number; total: number }>();
  if (receivable?.n) {
    for (const m of managers) await notify(db, m.id, `${receivable.n} comisiones vencidas sin cobrar`, `Total USD ${Math.round(receivable.total).toLocaleString("es-PY")}`, "/finanzas");
    summary.overdueReceivables = receivable.n;
  }

  // Limpieza: sesiones vencidas y notificaciones leídas de más de 60 días.
  await db.batch([
    db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
    db.prepare("DELETE FROM notifications WHERE read_at IS NOT NULL AND created_at < ?").bind(daysAgo(60)),
  ]);
  return summary;
}
