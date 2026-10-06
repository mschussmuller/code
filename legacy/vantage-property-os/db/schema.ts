import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const proposals = sqliteTable("proposals", {
  id: text("id").primaryKey(),
  clientName: text("client_name").notNull(),
  advisor: text("advisor").notNull(),
  selectedUnitIds: text("selected_unit_ids").notNull(),
  downPercent: integer("down_percent").notNull(),
  termMonths: integer("term_months").notNull(),
  fxRate: integer("fx_rate").notNull(),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details").notNull(),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").notNull(),
});

export const dataOverrides = sqliteTable("data_overrides", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  field: text("field").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value").notNull(),
  sourceUrl: text("source_url"),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").notNull(),
});

export const documentIntakes = sqliteTable("document_intakes", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  developer: text("developer").notNull(),
  documentType: text("document_type").notNull(),
  sourceType: text("source_type").notNull(),
  fileName: text("file_name"),
  sourceUrl: text("source_url"),
  r2Key: text("r2_key"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  note: text("note"),
  status: text("status").notNull(),
  analysisSummary: text("analysis_summary").notNull(),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by").notNull(),
});

export const missingDataTasks = sqliteTable("missing_data_tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  developer: text("developer").notNull(),
  field: text("field").notNull(),
  label: text("label").notNull(),
  reason: text("reason").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdBy: text("created_by").notNull(),
});
