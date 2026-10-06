// Builds migrations/0002_inventory.sql from seed/inventory.json (exported from the legacy system).
import { readFileSync, writeFileSync } from "node:fs";

const { projects, units } = JSON.parse(readFileSync("seed/inventory.json", "utf8"));
const q = (v) => (v === undefined || v === null || v === "" ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const num = (v) => (typeof v === "number" && v >= 0 ? v : null); // legacy uses -1 for "unknown"

const lines = ["-- Inventario migrado desde Vantage Property OS (respaldo 2026-09-22). Generado por scripts/build-seed.mjs"];
const developers = [...new Set(projects.map((p) => p.developer))];
for (const name of developers) lines.push(`INSERT INTO developers (id, name) VALUES (${q(slug(name))}, ${q(name)});`);

for (const p of projects) {
  const extra = {};
  for (const k of ["inventoryAudit", "brochureDetails", "consultationPolicy", "resolvedFields", "parkingIncludesStorage"]) if (p[k] !== undefined) extra[k] = p[k];
  lines.push(`INSERT INTO projects (id, developer_id, name, location, stage, delivery, confidence, summary, brochure_url, price_list_url, plans_url, media_url, video_url, drive_url, map_query, color, image_url, parking_price_usd, source_label, extra, updated_at) VALUES (${[
    p.id, slug(p.developer), p.name, p.location, p.stage, p.delivery, p.confidence, p.summary ?? "", p.brochure, p.priceList, p.plansFolder,
    p.mediaFolder, p.videoFolder, p.driveFolder, p.mapQuery, p.color, p.imageUrl, p.parkingPriceUSD, p.sourceDateLabel, JSON.stringify(extra), p.updatedAt,
  ].map(q).join(", ")});`);
}

for (const u of units) {
  const extra = {};
  for (const k of ["areaLabel", "internalM2", "parkingM2", "storageM2", "commonM2", "patioM2", "imageUrl", "planUrl", "reinforcement"]) if (u[k] !== undefined) extra[k] = u[k];
  lines.push(`INSERT INTO units (id, project_id, code, floor, type, bedrooms, own_m2, balcony_m2, total_m2, currency, price, parking, status, down_payment, monthly_payment, balance_on_delivery, features, extra, updated_at) VALUES (${[
    u.id, u.projectId, u.code, u.floor, u.type, u.bedrooms, num(u.ownM2), num(u.balconyM2), num(u.totalM2), u.currency, u.price,
    u.parking, u.status, u.downPayment, u.monthlyPayment, u.balanceOnDelivery, JSON.stringify(u.features ?? []), JSON.stringify(extra), u.updatedAt,
  ].map(q).join(", ")});`);
}

writeFileSync("migrations/0002_inventory.sql", lines.join("\n") + "\n");
console.log(`Wrote ${developers.length} developers, ${projects.length} projects, ${units.length} units`);
