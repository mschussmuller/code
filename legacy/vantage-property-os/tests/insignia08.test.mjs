import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { loadData } from "./load-data.mjs";

// Source: Drive 1TwQVvBDamQPmyVF8FYD8MBdHfHyfVFcF, reviewed 27/08/2026.
// File modified 17/08/2026; no document validity date was supplied.
const source = readFileSync(new URL("../app/data.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = loadData();
const units = exports.units.filter(unit => unit.projectId === "insignia-08");
const cdUnits = units.filter(unit => /^[CD]/.test(unit.code));
const text = readFileSync(new URL("./fixtures/insignia08-source.txt", import.meta.url), "utf8");
const rows = text.trim().split("\n").slice(1);

test("Insignia 08 matches every source row, with separate areas and unchanged prices", () => {
  assert.equal(rows.length, 84);
  assert.equal(units.length, 24);
  assert.ok(units.some(unit => unit.code === "B19" && unit.price === 74799));
  const withdrawn = new Set(["C46", "C41", "D04", "D02"]);
  let available = 0;
  for (const row of rows) {
    const match = row.match(/^TORRE ([CD]) (PB|\d) [CD] (\d+) (Quinta|Frente) (.+?) X (\d) ([\d.]+) ([\d.]+) ([\d.-]+) ([\d.]+) (Vendido|[\d,]+)$/);
    assert.ok(match, row);
    const code = match[1] + match[3];
    const unit = cdUnits.find(unit => unit.code === code);
    if (match[11] === "Vendido" || withdrawn.has(code)) {
      assert.equal(unit, undefined, code + " must not be offered");
      continue;
    }
    available++;
    assert.ok(unit, code);
    assert.equal(unit.price, Number(match[11].replaceAll(",", "")), code);
    assert.equal(unit.totalM2, Number(match[8]), code);
    assert.equal(unit.ownM2, Number(match[8]), code);
    assert.equal(unit.commonM2, Number(match[10]), code);
    assert.equal(unit.patioM2, match[9] === "-" ? 0 : Number(match[9]), code);
    assert.equal(unit.parkingM2, Number(match[7]), code);
    assert.equal(unit.parking, Number(match[6]), code);
    assert.equal(unit.areaLabel, "de departamento");
    assert.equal(unit.currency, "USD");
    assert.doesNotMatch(unit.type, /X$/);
  }
  assert.equal(available, cdUnits.length);
  assert.equal(units.filter(unit => unit.totalM2 >= 60).length, 0, "patios/common areas do not inflate apartment search");
});
