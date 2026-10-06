import { desc } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { auditLogs, documentIntakes } from "../../../db/schema";

function actor(request: Request) {
  return request.headers.get("oai-authenticated-user-email") || "administrador@vantage.local";
}

function safeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "documento";
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(documentIntakes).orderBy(desc(documentIntakes.createdAt)).limit(100);
    return Response.json({ intakes: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar los ingresos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const projectId = String(form.get("projectId") || "");
    const developer = String(form.get("developer") || "");
    const documentType = String(form.get("documentType") || "Otro");
    const sourceUrl = String(form.get("sourceUrl") || "").trim();
    const note = String(form.get("note") || "").trim();
    const uploaded = form.get("file");
    const file = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
    if (!projectId || !developer || (!file && !sourceUrl)) {
      return Response.json({ error: "Elegí un proyecto y agregá un archivo o enlace" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const createdBy = actor(request);
    let r2Key: string | null = null;
    if (file) {
      if (!env.BUCKET) throw new Error("El almacenamiento de archivos todavía no está disponible");
      r2Key = `documentos/${safeName(developer)}/${safeName(projectId)}/${id}-${safeName(file.name)}`;
      await env.BUCKET.put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    }

    const sourceType = file ? "Archivo" : sourceUrl.includes("drive.google.com") ? "Google Drive" : "Enlace";
    const analysisSummary = `${documentType} recibido y asociado al proyecto. Se incorporó al control documental; los cambios comerciales deben aprobarse antes de reemplazar datos vigentes.`;
    const record = {
      id, projectId, developer, documentType, sourceType,
      fileName: file?.name || null,
      sourceUrl: sourceUrl || null,
      r2Key,
      mimeType: file?.type || null,
      sizeBytes: file?.size || null,
      note: note || null,
      status: "Recibido",
      analysisSummary,
      createdAt,
      createdBy,
    };
    const db = getDb();
    await db.batch([
      db.insert(documentIntakes).values(record),
      db.insert(auditLogs).values({ id: crypto.randomUUID(), action: "DOCUMENT_RECEIVED", entityType: "project", entityId: projectId, details: `${documentType} · ${sourceType}`, createdAt, createdBy }),
    ]);
    return Response.json({ intake: record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo registrar el documento" }, { status: 500 });
  }
}
