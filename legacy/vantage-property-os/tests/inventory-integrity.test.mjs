import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { loadData } from "./load-data.mjs";

const source = readFileSync(new URL("../app/data.ts", import.meta.url), "utf8");
const grupoBiSource = readFileSync(new URL("../app/grupo-bi-data.ts", import.meta.url), "utf8");
const avanzaSource = readFileSync(new URL("../app/avanza-data.ts", import.meta.url), "utf8");
const r5Source = readFileSync(new URL("../app/r5-las-lomas-data.ts", import.meta.url), "utf8");
const grupoBiModule = ts.transpileModule(grupoBiSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { grupoBiProjects, grupoBiUnits, completedBrochureDetails, completedInventoryReview } = await import(`data:text/javascript;base64,${Buffer.from(grupoBiModule).toString("base64")}`);
const r5Module = ts.transpileModule(r5Source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { r5Projects, r5Units } = await import(`data:text/javascript;base64,${Buffer.from(r5Module).toString("base64")}`);
const searchSource = readFileSync(new URL("../app/property-os.tsx", import.meta.url), "utf8");
const quoteSource = readFileSync(new URL("../app/quote-options.ts", import.meta.url), "utf8");
const quoteModule = ts.transpileModule(quoteSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const quoteFunctions = await import(`data:text/javascript;base64,${Buffer.from(quoteModule).toString("base64")}`);
const { calculateQuoteOption, quoteDelivery, discountSummary } = quoteFunctions;
const unitPattern = /\{ id: "([^"]+)", projectId: "([^"]+)", code: "([^"]+)", floor: "([^"]+)", type: "([^"]+)", bedrooms: (\d+), ownM2: ([\d.]+), balconyM2: ([\d.]+), totalM2: ([\d.]+), currency: "(USD|PYG)", price: (\d+), parking: (\d+), status: "([^"]+)"/g;
const units = loadData().units.filter(unit => !/^(bi-|avanza-|r5-)/.test(unit.projectId));

const count = (projectId) => units.filter((unit) => unit.projectId === projectId && unit.status === "Disponible").length;
const rawCount = (name) => {
  const block = grupoBiSource.match(new RegExp("const " + name + " = `([\\s\\S]*?)`;"));
  assert.ok(block, `missing Grupo BI block ${name}`);
  return block[1].trim().split("\n").filter(Boolean).length;
};

test("inventory IDs are unique and commercial values are usable", () => {
  assert.equal(new Set(units.map((unit) => unit.id)).size, units.length);
  assert.ok(units.every((unit) => unit.price > 0 && unit.totalM2 > 0));
});

test("verified source inventories cannot silently regress to samples", () => {
  assert.equal(count("narciso"), 86);
  assert.equal(units.filter((unit) => unit.projectId === "narciso" && unit.status === "Disponible" && unit.bedrooms === 2).length, 26);
  assert.equal(count("solana-2"), 34);
  assert.equal(count("mood-office"), 60);
  assert.deepEqual({
    "insignia-07": count("insignia-07"),
    "insignia-08": count("insignia-08"),
    "insignia-09": count("insignia-09"),
    "insignia-10": count("insignia-10"),
    "insignia-11": count("insignia-11"),
    "city-02": count("city-02"),
    "terra-02": count("terra-02"),
  }, {
    "insignia-07": 34,
    "insignia-08": 24,
    "insignia-09": 46,
    "insignia-10": 18,
    "insignia-11": 32,
    "city-02": 21,
    "terra-02": 25,
  });
});

test("City 02 follows the 28/08/2026 commercial list", () => {
  const city = units.filter((unit) => unit.projectId === "city-02" && unit.status === "Disponible");
  assert.equal(city.length, 21);
  assert.ok(city.some((unit) => unit.code === "C11" && unit.bedrooms === 3 && unit.price === 150179));
  assert.ok(["C53", "C54", "C33"].every((code) => !city.some((unit) => unit.code === code)));
});

test("exact results stay first and fallback alternatives remain controlled", () => {
  const strictSearch = ({ projectId, bedrooms, maxBudget }) => units.filter((unit) =>
    unit.status === "Disponible" &&
    (!projectId || unit.projectId === projectId) &&
    (bedrooms == null || unit.bedrooms === bedrooms) &&
    (!maxBudget || unit.price <= maxBudget)
  );

  assert.equal(strictSearch({ projectId: "narciso", bedrooms: 2, maxBudget: 1 }).length, 0);
  assert.equal(strictSearch({ projectId: "narciso", bedrooms: 2, maxBudget: 1_000_000 }).length, 26);
  assert.match(searchSource, /unit\.status === "Disponible"/);
  assert.match(searchSource, /unit\.projectId === projectFilter/);
  assert.match(searchSource, /unit\.bedrooms !== desiredBedrooms\) return \[\]/);
  assert.match(searchSource, /priceUSD > maxBudget\) return \[\]/);
  assert.match(searchSource, /score < 70\) return \[\]/);
  assert.match(searchSource, /priceUSD > maxBudget \* 1\.15/);
  assert.match(searchSource, /location && !locationMatches\(project\.location, location\)\) return \[\]/);
  assert.match(searchSource, /if \(exactMatches\.length\) return \{ items: exactMatches, nearMode: false \}/);
});

test("project locations use verified municipalities instead of generic labels", () => {
  assert.match(source, /"insignia-07", "Insignia 07", "San Lorenzo, Central"/);
  assert.match(source, /"insignia-08", "Insignia 08", "Luque, Central"/);
  assert.match(source, /"insignia-11", "Insignia 11", "Km 10, Ciudad del Este"/);
  assert.match(source, /"city-02", "City 02", "Los Laureles, Asunción"/);
  assert.match(source, /"terra-02", "Terra 02", "Luque, Central"/);
});

test("Grupo BI inventory contains only verified habitable availability", () => {
  assert.deepEqual({
    dhomeCampos: rawCount("dhomeCampos"),
    velvet: rawCount("velvet"),
    filumHerrera: rawCount("filumHerrera"),
    filumRecoleta: rawCount("filumRecoleta"),
    dhomeCdd: rawCount("dhomeCdd"),
    sanClementeNorte: rawCount("sanClementeNorte"),
    santaTeresa: rawCount("santaTeresa"),
    santaMarina: rawCount("santaMarina"),
  }, {
    dhomeCampos: 21,
    velvet: 54,
    filumHerrera: 21,
    filumRecoleta: 6,
    dhomeCdd: 3,
    sanClementeNorte: 46,
    santaTeresa: 3,
    santaMarina: 1,
  });
  assert.doesNotMatch(grupoBiSource, /^\+?\d+\|[^\n]*\|(COCHERA|VEHICULAR|MOTO)\|/mi);
  assert.match(grupoBiSource, /location: "Zona Norte, Fernando de la Mora"/);
  assert.doesNotMatch(grupoBiSource, /SAN CLEMENTE Fernando.*id:/);
});

test("every Grupo BI brochure opens a direct PDF instead of its Drive folder", () => {
  const brochureUrls = [...grupoBiSource.matchAll(/brochure: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(brochureUrls.length, 9);
  assert.ok(brochureUrls.every((url) => /drive\.google\.com\/file\/d\//.test(url)));
  assert.ok(brochureUrls.every((url) => !/drive\/folders/.test(url)));
});

test("completed brochures add technical typologies without inventing commercial inventory", () => {
  const completed = grupoBiProjects.filter(project => project.brochureDetails);
  assert.equal(completed.length, 3);
  assert.equal(completed.reduce((sum, project) => sum + project.brochureDetails.typologies.length, 0), 16);
  const fernando = completed.find(project => project.id === "bi-san-clemente-fernando");
  assert.equal(fernando.stage, "Terminado");
  assert.equal(fernando.location, "Zona Sur, Fernando de la Mora");
  assert.equal(grupoBiUnits.filter(unit => unit.projectId === fernando.id).length, 0);
  assert.deepEqual(fernando.brochureDetails.typologies.map(type => type.areaM2), [30.21, 36, 70.81, 92.22]);
  assert.ok(fernando.brochureDetails.sourceNotes.some(note => note.includes("precios históricos")));
  assert.equal(new Set(grupoBiProjects.map(project => project.id)).size, grupoBiProjects.length);
  assert.equal(new Set(grupoBiUnits.map(unit => unit.id)).size, grupoBiUnits.length);
});

test("screenshot review preserves exact prices and refreshes only completed inventory", () => {
  const completedUnits = grupoBiUnits.filter(unit => completedBrochureDetails[unit.projectId]);
  assert.deepEqual(completedUnits.map(unit => [unit.code, unit.price, unit.totalM2, unit.parking]), [
    ["102", 90000, 65, 0], ["109", 64000, 39, 1], ["908", 46500, 33, 0],
    ["302 B", 52000, 36.5, 0],
  ]);
  assert.ok(completedUnits.every(unit => unit.updatedAt === "2026-08-27" && unit.ownM2 === -1 && unit.balconyM2 === -1));
  assert.ok(completedUnits.every(unit => unit.features.includes("Piscina") && unit.features.includes("Gimnasio")));
  assert.ok(grupoBiUnits.filter(unit => !completedBrochureDetails[unit.projectId]).every(unit => unit.ownM2 === unit.totalM2));
  assert.ok(grupoBiUnits.filter(unit => !completedBrochureDetails[unit.projectId]).every(unit => unit.updatedAt === "2026-08-26"));
  assert.equal(grupoBiUnits.length, 155, "reserved resales must stay out of availability");
  assert.ok(completedUnits.every(unit => unit.features.includes("Renta activa") && unit.features.includes("Visita con coordinación previa")));
  assert.ok(completedUnits.every(unit => !unit.monthlyPayment && !unit.downPayment), "screenshot does not provide installment amounts or deposit");
  const financed = completedUnits.filter(unit => unit.features.some(feature => feature.includes("12 meses sin intereses")));
  assert.deepEqual(financed.map(unit => [unit.projectId, unit.code]), [["bi-san-clemente-santa-teresa", "102"]]);
  assert.equal(completedUnits.filter(unit => unit.features.includes("Venta al contado")).length, 3);
  assert.ok(grupoBiProjects.filter(project => project.brochureDetails).every(project => project.sourceDateLabel === completedInventoryReview.label));
  assert.match(completedInventoryReview.note, /filas visibles/);
  assert.doesNotMatch(grupoBiSource, /no reconfirmado el 27\/08|Lista comercial no releída/);
});

test("screenshot reserved records and standalone parking stay out of apartment search", () => {
  assert.deepEqual(completedInventoryReview.reserved.map(row => [row.code, row.priceUSD]), [["301", 83000], ["503", 76000], ["602", 107000], ["7", 11000]]);
  assert.ok(completedInventoryReview.reserved.every(row => row.status === "Reservado"));
  assert.equal(grupoBiUnits.filter(unit => unit.projectId === "bi-san-clemente-fernando").length, 0);
  assert.deepEqual(completedInventoryReview.parking.map(row => [row.code, row.totalM2, row.priceUSD]), [["6", 12.5, 11000], ["10", 12.5, 11000]]);
  const project = grupoBiProjects.find(project => project.id === "bi-santa-marina-norte");
  assert.equal(project.parkingPriceUSD, 11000);
  assert.deepEqual(grupoBiUnits.filter(unit => unit.projectId === project.id).map(unit => unit.code), ["302 B"]);
  const unit = grupoBiUnits.find(unit => unit.projectId === project.id && unit.code === "302 B");
  const result = calculateQuoteOption(unit, project, {}, { paymentMode: "contado", fx: 7900, downPercent: 30, term: 12, parkingChoice: { enabled: true, priceUSD: String(project.parkingPriceUSD) } });
  assert.equal(result.finalPriceUSD, 63000);
});

test("public brochures stay connected while confirmed projects can quote without one", () => {
  const allProjectSources = `${source}\n${grupoBiSource}\n${avanzaSource}\n${r5Source}`;
  const publicBrochureIds = [
    "12yTs1bfFD-sDoepYN2jbGDLDC7TLIbaV", "1pXvHXaSjT6VcghP5f6DTYP9-3-icTEe4", "17SYSceIxTIw573qLW6SJdCQkJymInxJK",
    "1puyVpxFkYHHvx_WE4Eu1rMnf_a0maKes", "16WqHl5I075p_ZWUCHxoYsCeaHg09oN5H", "1Owoer44N5cSr2rUYa995k4SxIWOCcwUX",
    "1GoWkP4PuI_26VU3lY5oH_iLylZH7FJnZ", "1Ex5SPQHGQErMfPqO2BIdWkjY4amVL-5v", "1r977Qj5ffgC4QHSgvaG7lJnWIPMoN0ol",
    "1FRuaD3129IKU1xWTyjMczilWKe3FZgfH", "1zYNcZ2uhq8M45aVeNqVbhWKOONbSjM3w", "1Gn-tCTkY8A1PC3XvHx3TCNV3CCzctiNk",
    "1rGgsIUDwBDgHO2AWtVLx2k8plsws0iTd", "1lWiM2Ny3cX51z36y2JYcXelrNy_9lwlo", "19cgjcOnCfomW52SKJR8UHwRyFxzy0_cP",
    "1xpc5IAFFhSkzDxH6toXDwOd2xaOOQLQC", "141NzUoHCl6nWa2SFYUE9HpQ1YzZCJ2ia", "16PEKnVnngZcopTEyTnbg4xGLJ-cj1eI8",
    "1iIKjJt38ap81UC2cdD5DmUmrtltUeQFY", "1O5Nn3DMvP3dqpSVMuFWdq8C0Gp5PFFTF", "16xfr52g0TsIHqoVjTUM82WZpvBkackmf",
    "1GMtElojQ1AetPwXTT6mZa9l0jOHQpBaH", "1PjfeyXwrV3VoGpeMK9qMdr8ewrWvAOuT", "1Q70-ZZg-dnNwqzYMGZUwrxoswru4fdX0",
    "15fLwz57jljCRf91pFZ4a6rO_DWyNXWpc", "19cOfpEGjBDT3aN_9nA81CZ_nUIhr_-me", "11wZjH7a8eZ846fiNfYFM6631msdhXF9-",
    "1f4rRRfCPWKp0geTx6y1QKM8VYPTf7uqR", "1ZhIbskDjp38iZHR-BBwq3GSF46qaAR_1", "1H0dzQMh1bAVloS1Klto1OMLoY9DU2DMt",
    "1IZ8sLFzOvTeFDgON7xVfVAtpIZElcn5G",
  ];
  assert.equal(publicBrochureIds.length, 31);
  assert.ok(publicBrochureIds.every((id) => allProjectSources.includes(id)), "all available public brochure copies must be connected");
  assert.equal((avanzaSource.match(/brochure: ""/g) || []).length, 3);
  assert.match(searchSource, /!project \|\| \(!isDirectBrochureUrl\(project\.brochure\) && project\.confidence !== "Confirmado"\)/);
});

test("R Bulnes remains separate from R5 Las Lomas and preserves ten current source prices", () => {
  const bulnesUnits = r5Units.filter(unit => unit.projectId === "r-bulnes");
  assert.deepEqual(bulnesUnits.map(({ code, type, totalM2, price }) => [code, type, totalM2, price]), [
    ["201", "1 dormitorio", 55.47, 122034], ["204", "1 dormitorio", 55.47, 122034],
    ["205", "2 dormitorios", 82.20, 180840], ["301", "1 dormitorio", 55.47, 123365],
    ["304", "1 dormitorio", 55.47, 123365], ["404", "1 dormitorio", 55.47, 124697],
    ["504", "1 dormitorio", 55.47, 126028], ["604", "1 dormitorio", 55.47, 127359],
    ["605", "2 dormitorios", 82.20, 188731], ["607", "1 dormitorio", 48.14, 110529],
  ]);
  assert.equal(new Set(bulnesUnits.map(unit => unit.id)).size, 10);
  assert.ok(bulnesUnits.every(unit => unit.status === "Disponible" && unit.parking === 0));
  assert.ok(bulnesUnits.every(unit => unit.floor === unit.code[0] && unit.ownM2 === unit.totalM2 && unit.balconyM2 === 0));
  assert.ok(bulnesUnits.every(unit => !unit.monthlyPayment && !unit.downPayment));
  assert.match(source, /\.\.\.r5Projects/);
  assert.match(source, /\.\.\.r5Units/);
});

test("R Bulnes uses optional parking and storage with negotiated financing", () => {
  const project = r5Projects[0];
  assert.equal(project.name, "R Bulnes");
  assert.equal(project.parkingPriceUSD, 20000);
  assert.equal(project.delivery, "Entregado en febrero de 2026 — listo para ocupación");
  assert.equal(project.stage, "Terminado");
  assert.match(project.mapQuery, /Gonzalo Bulnes esquina Del Maestro/);
  assert.equal(project.brochure, "/brochures/r-bulnes.pdf");
  assert.match(project.sourceDateLabel, /agosto de 2026/);
  const bulnesUnits = r5Units.filter(unit => unit.projectId === project.id);
  assert.ok(bulnesUnits.every(unit => !unit.imageUrl), "floor plans must not be used as quote banners");
  assert.ok(bulnesUnits.every(unit => unit.features.some(feature => feature.includes("hasta 36 meses"))));
});

test("R Las Lomas and R Andrade use the standard 30/60/10 plan", () => {
  const lomas = r5Units.filter(unit => unit.projectId === "r-las-lomas");
  const andrade = r5Units.filter(unit => unit.projectId === "r-andrade");
  assert.equal(lomas.length, 8);
  assert.equal(andrade.length, 27);
  for (const unit of [...lomas, ...andrade]) {
    assert.equal(unit.downPayment, Math.round(unit.price * .3));
    assert.equal(unit.monthlyPayment, Math.round(unit.price * .6 / 15));
    assert.equal(unit.balanceOnDelivery, Math.round(unit.price * .1));
  }
  assert.ok(andrade.every(unit => unit.features.includes("ROI proyectado 12%-15%")));
  assert.equal(r5Projects.find(project => project.id === "r-andrade").delivery, "4.º trimestre de 2027");
  assert.equal(r5Projects.find(project => project.id === "r-las-lomas").parkingPriceUSD, 23000);
});

test("proposal document keeps commercial links clickable on screen and PDF", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const proposalLinks = searchSource.match(/<div className="official-links">([\s\S]*?)<\/div>/)?.[1] || "";
  assert.match(searchSource, /function isDirectBrochureUrl/);
  assert.match(searchSource, /drive\\\.google\\\.com\\\/file\\\/d/);
  assert.match(searchSource, /isDirectBrochureUrl\(project\.brochure\) && <a href=\{project\.brochure\} target="_blank" rel="noopener noreferrer"/);
  assert.match(searchSource, /Ver brochure/);
  assert.doesNotMatch(proposalLinks, /priceList|Lista comercial|lista de precios/i);
  assert.doesNotMatch(css, /\.official-links \{ display: none; \}/);
  assert.match(css, /\.official-links a \{ min-height: 9\.5mm;/);
});

test("budget results start at the closest value below the ceiling and then decrease", () => {
  const maxBudget = 150_000;
  const ordered = [120_000, 149_000, 135_000, 150_000, 151_000].filter((price) => price <= maxBudget).sort((a, b) => b - a);
  assert.deepEqual(ordered, [150_000, 149_000, 135_000, 120_000]);
  assert.match(searchSource, /maxBudget\s*\? b\.priceUSD - a\.priceUSD/);
  assert.match(searchSource, /opción más cercana a tu presupuesto sin superarlo/);
});

test("proposal separates cash payment, manual discount, and financed scenarios", () => {
  assert.match(searchSource, /type PaymentMode = "financiado" \| "contado"/);
  assert.match(searchSource, /Descuento de esta unidad \(%\)/);
  assert.match(quoteSource, /paymentMode === "contado" \? finalPriceUSD/);
  assert.doesNotMatch(searchSource, /DESCUENTO MANUAL|Descuento manual sujeto a aprobación|% manual/);
  assert.match(searchSource, /Las cuotas indicadas son estimativas y deben validarse/);
});

test("optional parking is priced per unit and included in proposal totals", () => {
  assert.match(searchSource, /type ParkingChoice = \{ enabled: boolean; priceUSD: string \}/);
  assert.match(searchSource, /Agregar 1 cochera/);
  assert.match(searchSource, /Precio de cochera \(USD\)/);
  assert.match(quoteSource, /unitPriceUSD - discountUSD \+ optionalParkingPriceUSD/);
  assert.match(searchSource, /savingProposal \|\| invalidParkingChoice/);
  assert.match(searchSource, /La cochera opcional está incluida en el precio final/);
  assert.doesNotMatch(searchSource, /Lista: \{usd\.format/);
});

test("discounts are independent across options and recalculate cash, financing and parking", () => {
  const project = r5Projects[0];
  const unit = { ...r5Units[0], price: 100000, downPayment: 30000, monthlyPayment: 2000 };
  const settings = { paymentMode: "financiado", fx: 7900, downPercent: 30, term: 30 };
  const first = calculateQuoteOption(unit, project, { discountPercent: "5" }, settings);
  const second = calculateQuoteOption(unit, project, { discountPercent: "8.5" }, { ...settings, parkingChoice: { enabled: true, priceUSD: "23000" } });
  assert.equal(first.finalPriceUSD, 95000);
  assert.equal(second.finalPriceUSD, 114500);
  assert.equal(second.delivery, 34350);
  assert.equal(second.payment, (114500 - 34350) / 30);
  assert.equal(second.discountUSD, 8500, "optional parking is not discounted");
  assert.equal(first.usesOfficialPlan, false);
  const unchanged = calculateQuoteOption(unit, project, { discountPercent: "0" }, settings);
  assert.equal(unchanged.usesOfficialPlan, true);
  assert.equal(unchanged.payment, 2000, "another option's discount cannot affect this official plan");
  const cash = calculateQuoteOption(unit, project, { discountPercent: "100" }, { ...settings, paymentMode: "contado" });
  assert.equal(cash.finalPriceUSD, 0);
  assert.equal(cash.payment, 0);
  const pyg = calculateQuoteOption({ ...unit, price: 790000000, currency: "PYG" }, project, { discountPercent: "5" }, settings);
  assert.equal(pyg.finalPriceUSD, 95000);
  assert.equal(discountSummary([5, 8.5, 0]), "Por opción");
  assert.equal(discountSummary([5, 5]), "5%");
  assert.equal(discountSummary([0]), "Sin descuento");
});

test("delivery accepts free text or omission without changing catalog source data", () => {
  assert.equal(quoteDelivery("Requiere confirmación"), "");
  assert.equal(quoteDelivery("Fecha de entrega pendiente de confirmación"), "");
  assert.equal(quoteDelivery("Agosto de 2030"), "Agosto de 2030");
  assert.equal(quoteDelivery("Requiere confirmación", "Segundo semestre de 2029"), "Segundo semestre de 2029");
  assert.equal(quoteDelivery("Agosto de 2030", ""), "");
  assert.equal(quoteDelivery("Requiere confirmación", "A coordinar"), "A coordinar");
  const result = calculateQuoteOption(r5Units[0], r5Projects[0], { delivery: "Diciembre de 2028" }, { paymentMode: "contado", fx: 7900, downPercent: 30, term: 30 });
  assert.equal(result.projectDelivery, "Diciembre de 2028");
  assert.equal(result.deliverySource, "advisor");
  assert.equal(r5Projects[0].delivery, "Entregado en febrero de 2026 — listo para ocupación");
});

test("printable quote renders each discount and entered delivery without manual-edit notices", () => {
  const require = createRequire(import.meta.url);
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const stateNames = [...searchSource.matchAll(/const \[(\w+), [^\]]+\] = useState/g)].map(match => match[1]);
  const adjustments = {
    [r5Units[0].id]: { discountPercent: "5", delivery: "Diciembre de 2028" },
    [r5Units[1].id]: { discountPercent: "8.5", delivery: "Entrega inmediata" },
  };
  const state = { tab: "propuesta", paymentMode: "contado", selected: [r5Units[0].id, r5Units[1].id], unitAdjustments: adjustments };
  const js = ts.transpileModule(searchSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const render = (fixtureUnits = r5Units) => {
    let hook = 0;
    const exports = {};
    runInNewContext(js, { exports, require: (name) => {
      if (name === "react") return { ...React, useEffect: () => {}, useMemo: fn => fn(), useState: initial => { const key = stateNames[hook++]; return [Object.hasOwn(state, key) ? state[key] : initial, () => {}]; } };
      if (name === "next/image") return function MockImage({ unoptimized, fill, priority, ...props }) { return React.createElement("img", props); };
      if (name === "./data") return { projects: r5Projects, units: fixtureUnits };
      if (name === "./quote-options") return quoteFunctions;
      return require(name);
    } });
    return renderToStaticMarkup(React.createElement(exports.default)).split('id="proposal-print"')[1];
  };
  const printed = render();
  assert.match(printed, /DICIEMBRE 2028/);
  assert.match(printed, /ENTREGA INMEDIATA/);
  assert.match(printed, /Descuento aplicado: 5%/);
  assert.match(printed, /Descuento aplicado: 8\.5%/);
  assert.doesNotMatch(printed, /Por opción/);
  const separated = render(r5Units.map((unit, index) => index === 0 ? { ...unit, totalM2: 44.1, commonM2: 10, patioM2: 63, parkingM2: 12.5, areaLabel: "de departamento" } : unit));
  assert.match(separated, /SUPERFICIE<\/small><strong>44,10 m²/);
  assert.doesNotMatch(separated, /Patio:|Comunes:/);
  const office = render(r5Units.map((unit, index) => index === 0 ? { ...unit, totalM2: 68.5, internalM2: 53.3, balconyM2: 15.2, parkingM2: 12.5, areaLabel: "de oficina con balcón" } : unit));
  assert.match(office, /SUPERFICIE<\/small><strong>68,50 m²/);
  assert.doesNotMatch(office, /Interior:/);
  const storage = render(r5Units.map((unit, index) => index === 0 ? { ...unit, totalM2: 80, parkingM2: 25, storageM2: 2, areaLabel: "de departamento" } : unit));
  assert.match(storage, /SUPERFICIE<\/small><strong>80,00 m²/);
  assert.doesNotMatch(storage, /Baulera:/);
  assert.doesNotMatch(printed, /Auditoría de inventario|Fuentes internas|Lista comercial/);
  assert.doesNotMatch(printed, /Gs\.|PYG|Cotización referencial/, "USD-only quotes must not include guarani conversions");
  const mixedUnits = r5Units.map((unit, index) => index === 1 ? { ...unit, currency: "PYG", price: unit.price * 7900 } : unit);
  const mixed = render(mixedUnits);
  const prices = [...mixed.matchAll(/<div class="official-price">([\s\S]*?)<\/div>/g)].map(match => match[1]);
  assert.equal(prices.length, 2);
  assert.doesNotMatch(prices[0], /Gs\.|PYG/, "USD option stays in dollars even in a mixed quote");
  assert.match(prices[1], /Gs\./, "PYG option retains its local-currency amount");
  assert.match(mixed, /Cotización referencial/);
  assert.doesNotMatch(printed, /proposal-option-image|plano-[a-z]\.jpg/, "quotes must not include floor plans in the façade area");
  assert.match(printed, /vantage-logo\.png/);
  assert.match(printed, /Ver brochure/);
  assert.doesNotMatch(printed, /manual|requiere confirmación|sujeto a aprobación/i);
  adjustments[r5Units[0].id].delivery = "";
  delete adjustments[r5Units[1].id].delivery;
  assert.match(render(), /FEBRERO 2026/);
  assert.doesNotMatch(render(), /Requiere confirmación/);
  state.paymentMode = "financiado";
  assert.match(render(), /cuotas estimadas/);
  assert.doesNotMatch(render(), /Gs\.|PYG|Cotización referencial/);
  const api = readFileSync(new URL("../app/api/proposals/route.ts", import.meta.url), "utf8");
  assert.match(api, /details: auditDetails/);
  assert.match(api, /quoteOptions,/);
});
