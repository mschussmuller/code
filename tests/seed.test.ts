import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// El inventario migrado del sistema anterior no debe perder unidades ni romper integridad.
const { projects, units } = JSON.parse(readFileSync("seed/inventory.json", "utf8")) as {
  projects: { id: string }[]; units: { id: string; projectId: string; price: number; status: string }[];
};

describe("inventario migrado", () => {
  it("conserva proyectos y unidades del respaldo", () => {
    expect(projects.length).toBe(37);
    expect(units.length).toBe(726);
  });
  it("ids únicos, proyectos existentes y precios positivos", () => {
    const projectIds = new Set(projects.map((p) => p.id));
    expect(new Set(units.map((u) => u.id)).size).toBe(units.length);
    expect(units.every((u) => projectIds.has(u.projectId))).toBe(true);
    expect(units.every((u) => u.price > 0)).toBe(true);
  });
  it("la migración SQL coincide con el JSON", () => {
    const sql = readFileSync("migrations/0002_inventory.sql", "utf8");
    expect(sql.match(/^INSERT INTO units /gm)?.length).toBe(units.length);
    expect(sql.match(/^INSERT INTO projects /gm)?.length).toBe(projects.length);
  });
});
