import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, dataOverrides } from "../../../db/schema";

function actor(request: Request) {
  return request.headers.get("oai-authenticated-user-email") || "administrador@vantage.local";
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(dataOverrides).orderBy(desc(dataOverrides.createdAt)).limit(200);
    return Response.json({ overrides: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar las modificaciones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { entityType?: string; entityId?: string; field?: string; previousValue?: string; newValue?: string; sourceUrl?: string };
    if (!body.entityType || !body.entityId || !body.field || body.newValue === undefined) return Response.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const createdBy = actor(request);
    const db = getDb();
    const record = { id, entityType: body.entityType, entityId: body.entityId, field: body.field, previousValue: body.previousValue || null, newValue: String(body.newValue), sourceUrl: body.sourceUrl || null, createdAt, createdBy };
    await db.batch([
      db.insert(dataOverrides).values(record),
      db.insert(auditLogs).values({ id: crypto.randomUUID(), action: "UPDATED", entityType: body.entityType, entityId: body.entityId, details: `${body.field}: ${body.previousValue || "—"} → ${body.newValue}`, createdAt, createdBy }),
    ]);
    return Response.json({ override: record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo guardar la modificación" }, { status: 500 });
  }
}
