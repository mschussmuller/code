import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLogs, proposals } from "../../../db/schema";

function actor(request: Request) {
  return request.headers.get("oai-authenticated-user-email") || "administrador@vantage.local";
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(proposals).orderBy(desc(proposals.createdAt)).limit(50);
    return Response.json({ proposals: rows.map((row) => ({ ...row, selectedUnitIds: JSON.parse(row.selectedUnitIds) })) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo cargar el historial" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { clientName?: string; advisor?: string; selectedUnitIds?: string[]; downPercent?: number; termMonths?: number; fxRate?: number; paymentMode?: string; quoteOptions?: Array<{ unitId: string; [key: string]: unknown }> };
    const selectedUnitIds = Array.isArray(body.selectedUnitIds) ? body.selectedUnitIds.slice(0, 5) : [];
    if (!selectedUnitIds.length) return Response.json({ error: "Seleccioná al menos una unidad" }, { status: 400 });

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const createdBy = actor(request);
    const db = getDb();
    const record = {
      id,
      clientName: body.clientName?.trim() || "Cliente sin nombre",
      advisor: body.advisor?.trim() || "Vantage Real Estate",
      selectedUnitIds: JSON.stringify(selectedUnitIds),
      downPercent: Number(body.downPercent) || 30,
      termMonths: Number(body.termMonths) || 30,
      fxRate: Number(body.fxRate) || 7900,
      createdAt,
      createdBy,
    };
    // Keep the exact per-option adjustments in the existing internal audit trail.
    // Advisor-entered delivery text does not overwrite the source project record.
    const quoteOptions = Array.isArray(body.quoteOptions)
      ? body.quoteOptions.filter((option) => option && selectedUnitIds.includes(option.unitId)).slice(0, 5)
      : [];
    const auditDetails = JSON.stringify({
      summary: `Propuesta para ${record.clientName} con ${selectedUnitIds.length} opciones`,
      paymentMode: body.paymentMode === "contado" ? "contado" : "financiado",
      quoteOptions,
    });
    await db.batch([
      db.insert(proposals).values(record),
      db.insert(auditLogs).values({ id: crypto.randomUUID(), action: "CREATED", entityType: "proposal", entityId: id, details: auditDetails, createdAt, createdBy }),
    ]);
    return Response.json({ proposal: { ...record, selectedUnitIds } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo guardar la propuesta" }, { status: 500 });
  }
}
