import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, missingDataTasks } from "../../../db/schema";

function actor(request: Request) {
  return request.headers.get("oai-authenticated-user-email") || "administrador@vantage.local";
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(missingDataTasks).orderBy(desc(missingDataTasks.updatedAt)).limit(300);
    return Response.json({ tasks: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar los faltantes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: string; projectId?: string; developer?: string; field?: string; label?: string; reason?: string; priority?: string; status?: string };
    if (!body.id || !body.projectId || !body.developer || !body.field || !body.label || !body.reason) return Response.json({ error: "Faltan datos" }, { status: 400 });
    const now = new Date().toISOString();
    const createdBy = actor(request);
    const record = { id: body.id, projectId: body.projectId, developer: body.developer, field: body.field, label: body.label, reason: body.reason, priority: body.priority || "Media", status: body.status || "Pendiente", createdAt: now, updatedAt: now, createdBy };
    const db = getDb();
    await db.insert(missingDataTasks).values(record).onConflictDoUpdate({ target: missingDataTasks.id, set: { status: record.status, updatedAt: now } });
    await db.insert(auditLogs).values({ id: crypto.randomUUID(), action: "MISSING_DATA_STATUS", entityType: "project", entityId: body.projectId, details: `${body.label}: ${record.status}`, createdAt: now, createdBy });
    return Response.json({ task: record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo actualizar el faltante" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: string; status?: string };
    if (!body.id || !body.status) return Response.json({ error: "Faltan datos" }, { status: 400 });
    const updatedAt = new Date().toISOString();
    const db = getDb();
    await db.update(missingDataTasks).set({ status: body.status, updatedAt }).where(eq(missingDataTasks.id, body.id));
    return Response.json({ id: body.id, status: body.status, updatedAt });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo actualizar" }, { status: 500 });
  }
}
