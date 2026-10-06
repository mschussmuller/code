import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs } from "../../../db/schema";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
    return Response.json({ audit: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo cargar la actividad" }, { status: 500 });
  }
}
