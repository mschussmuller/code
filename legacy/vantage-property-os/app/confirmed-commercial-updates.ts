import type { Project, Unit } from "./data";

const reviewedAt = "2026-09-01";
const allCommercialFields = ["inventoryAudit", "delivery", "validation", "priceList", "units", "financing"];

type ProjectPatch = Partial<Project> & { auditNote?: string };

const projectPatches: Record<string, ProjectPatch> = {
  "solana-2": { confidence: "Confirmado", updatedAt: reviewedAt, sourceDateLabel: "Lista vigente confirmada por el equipo", summary: "34 unidades disponibles según la lista comercial vigente. Las dos filas 1D C sin código están bloqueada y reservada, por lo que no pueden ofrecerse.", resolvedFields: allCommercialFields, auditNote: "La vigencia actual y las 34 unidades ofertables fueron confirmadas; las dos filas 1D C sin código no se ofrecen." },
  "casas-bosque": { stage: "Terminado", delivery: "Proyecto terminado — entrega inmediata", confidence: "Confirmado", updatedAt: reviewedAt, sourceDateLabel: "Lista actualizada 02/02/2026", summary: "12 casas terminadas y ofertables. Financiación propia hasta 15 años; entrega inicial, tasa y cronograma se consultan para cada operación.", resolvedFields: allCommercialFields, auditNote: "Las 12 casas y sus precios de lista fueron confirmados como vigentes y ofertables." },
  "blu": { stage: "Pozo", delivery: "Noviembre de 2029", confidence: "Confirmado", updatedAt: reviewedAt, sourceDateLabel: "Lista 26/08/2026", summary: "4 unidades disponibles. El precio incluye las cocheras indicadas; cochera adicional USD 20.000. Financiación propia con entrega desde 20% y saldo a negociar.", resolvedFields: allCommercialFields, auditNote: "Lista legible de agosto de 2026 incorporada: 4 unidades disponibles con cocheras incluidas." },
  "mood-office": { delivery: "Agosto de 2030", confidence: "Confirmado", updatedAt: reviewedAt, sourceDateLabel: "Lista vigente: julio de 2026", summary: "60 oficinas disponibles y 7 reservadas. El precio incluye 1 o 2 cocheras. Dos planes durante obra y alternativa de financiar el saldo de posesión.", resolvedFields: allCommercialFields, auditNote: "El equipo confirmó que la lista de julio de 2026 continúa vigente y que las cocheras están incluidas." },
  "ventura": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "27 unidades disponibles. Cochera opcional y sumada aparte. CREO: entrega referencial 30%, saldo en cuotas antes de la entrega, sujeto a negociación.", resolvedFields: allCommercialFields },
  "venire": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "55 unidades disponibles; la 605 está reservada. Hay 9 cocheras opcionales y separadas; sólo las marcadas en salmón son exclusivas para unidades de 2 dormitorios.", resolvedFields: allCommercialFields, auditNote: "La unidad 605 fue retirada del stock disponible; quedan 55 unidades." },
  "venire-villa-morra": { stage: "Pozo", delivery: "Marzo de 2029", confidence: "Confirmado", updatedAt: reviewedAt, summary: "28 unidades directas. Reventa 605 con precio a consultar. 33 cocheras y 14 bauleras, ambas alrededor de USD 15.000 y con precio final sujeto a consulta.", resolvedFields: allCommercialFields },
  "ventura-torre-1": { stage: "Semiterminado", delivery: "Diciembre de 2026", confidence: "Confirmado", updatedAt: reviewedAt, summary: "7 unidades disponibles. Cochera opcional y añadida al precio cuando el comprador la solicita.", resolvedFields: allCommercialFields },
  "ventura-hassler": { stage: "Terminado", delivery: "Entregado — listo para ocupación", confidence: "Confirmado", updatedAt: reviewedAt, summary: "3 unidades disponibles: 105, 305 y 403. Dos cocheras opcionales, de USD 15.000 y USD 13.000, sumadas aparte.", resolvedFields: allCommercialFields },
  "insignia-07": { stage: "Pozo", delivery: "Torres A y B entregadas en agosto de 2026 · Torres C y D: junio de 2028", confidence: "Confirmado", updatedAt: reviewedAt, summary: "34 unidades disponibles en Torres C y D. Planes recalculables: 60/90 cuotas con 25% inicial y 120 cuotas con aproximadamente 17%, más posesión, refuerzos y cancelación.", resolvedFields: allCommercialFields, auditNote: "B43 fue retirada; el inventario vigente queda en 34 unidades de Torres C y D." },
  "insignia-08": { delivery: "Torres A y B: julio de 2027 · Torres C y D: julio de 2029", confidence: "Confirmado", updatedAt: reviewedAt, summary: "24 unidades disponibles. A/B: planes tradicionales de 60, 90 y 120 cuotas. C/D: Plan Facilísimo recalculable para cualquier unidad disponible.", resolvedFields: allCommercialFields, auditNote: "Se retiraron C46, C41, D04 y D02 y se incorporó B19; total vigente: 24." },
  "insignia-09": { delivery: "Junio de 2028", confidence: "Confirmado", updatedAt: reviewedAt, summary: "46 unidades disponibles, todas con una cochera incluida. Financiación propia de 60, 90 y 120 cuotas recalculable para cualquier unidad.", resolvedFields: allCommercialFields },
  "insignia-10": { delivery: "Torres A y B: marzo de 2028 · Torre C: diciembre de 2029", confidence: "Confirmado", updatedAt: reviewedAt, summary: "18 unidades disponibles. Las unidades de 2 dormitorios incluyen una cochera; B72 incluye dos. Planes de 60, 90 y 120 cuotas recalculables.", resolvedFields: allCommercialFields },
  "insignia-11": { delivery: "Marzo de 2028", confidence: "Confirmado", updatedAt: reviewedAt, summary: "32 unidades disponibles, cada una con cochera incluida. Planes propios de 60, 90 y 120 cuotas recalculables.", resolvedFields: allCommercialFields },
  "city-02": { delivery: "Diciembre de 2027", confidence: "Confirmado", updatedAt: reviewedAt, summary: "21 unidades disponibles. Las cinco unidades de 3 dormitorios y 71,4 m² están confirmadas; cada precio incluye una cochera. Financiación propia.", resolvedFields: allCommercialFields },
  "terra-02": { delivery: "Septiembre de 2027", confidence: "Confirmado", updatedAt: reviewedAt, summary: "25 unidades disponibles, todas con cochera incluida. Financiación propia de 60, 90 y 120 cuotas recalculable.", resolvedFields: allCommercialFields },
  "bi-dhome-campos": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "21 unidades disponibles. Entrega abril de 2027. Cochera opcional USD 16.000 y sin baulera. Financiación según plan de la unidad; descuento contado referencial alrededor de 5%, sujeto a confirmación.", parkingPriceUSD: 16000, resolvedFields: allCommercialFields },
  "bi-velvet-mariscal": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "54 unidades disponibles. Entrega noviembre de 2029. Cocheras opcionales por USD 16.000, todas al mismo precio. Condición final y descuento se confirman al cotizar.", parkingPriceUSD: 16000, resolvedFields: allCommercialFields },
  "bi-filum-herrera": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "21 unidades disponibles. Entrega diciembre de 2026. Cochera opcional USD 14.000. Financiación especial posobra hasta un máximo de 24 meses, aplicable a cualquier unidad.", parkingPriceUSD: 14000, resolvedFields: allCommercialFields },
  "bi-san-clemente-santa-teresa": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "3 unidades de reventa disponibles: 102, 109 y 908. La 809 está reservada. 109 incluye cochera; 102 y 908 no permiten agregarla. Condiciones negociables con el dueño y consulta final obligatoria.", resolvedFields: allCommercialFields },
  "bi-santa-marina-norte": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "Unidad de reventa 302 B disponible al contado. Cochera opcional USD 11.000, financiable en 12 cuotas iguales sin intereses; demás condiciones a consultar.", resolvedFields: allCommercialFields },
  "bi-san-clemente-fernando": { confidence: "Confirmado", updatedAt: reviewedAt, summary: "Proyecto terminado sin unidades ofertables: 301, 503 y 602, además de la cochera 7, están reservadas.", resolvedFields: allCommercialFields },
};

const casas: Array<[string, string, number, number]> = [
  ["Casa 1", "Tipología 2", 149.72, 165000], ["Casa 2", "Tipología 1", 150.60, 150000],
  ["Casa 3", "Tipología 1", 150.60, 150000], ["Casa 4", "Tipología 1", 150.60, 155000],
  ["Casa 5", "Tipología a confirmar", 150.60, 155000], ["Casa 6", "Tipología a confirmar", 150.60, 150000],
  ["Casa 7", "Tipología a confirmar", 150.60, 150000], ["Casa 8", "Tipología a confirmar", 150.60, 155000],
  ["Casa 9", "Tipología 3", 150.71, 165000], ["Casa 10", "Tipología 4", 159.74, 170000],
  ["Casa 11", "Tipología 4", 159.74, 170000], ["Casa 12", "Tipología 3", 150.71, 165000],
];

const blu: Array<[string, number, number, number, number, number]> = [
  ["1A", 2, 103.8, 116.3, 275460, 1], ["2B", 2, 103.8, 116.3, 276960, 1],
  ["3C", 3, 138.4, 163.4, 362807, 2], ["7A", 2, 103.8, 116.3, 290460, 1],
];

const makeCasa = ([code, type, totalM2, price]: [string, string, number, number]): Unit => ({
  id: `casas-bosque-${code.replace(/\s/g, "-").toLowerCase()}`, projectId: "casas-bosque", code, floor: "Casa", type,
  bedrooms: 3, ownM2: totalM2, balconyM2: 0, totalM2, currency: "USD", price, parking: 0, status: "Disponible",
  features: ["Proyecto terminado", "Financiación propia hasta 15 años", "Condiciones finales a consultar"], updatedAt: reviewedAt,
});

const makeBlu = ([code, bedrooms, ownM2, totalM2, price, parking]: [string, number, number, number, number, number]): Unit => ({
  id: `blu-${code.toLowerCase()}`, projectId: "blu", code, floor: code[0], type: `${bedrooms} dormitorios`, bedrooms,
  ownM2, balconyM2: bedrooms === 3 ? 34.7 : 15.5, totalM2, parkingM2: parking * 12.5, currency: "USD", price, parking,
  status: "Disponible", downPayment: Math.round(price * .2), features: [`${parking} cochera${parking > 1 ? "s" : ""} incluida${parking > 1 ? "s" : ""}`, "Entrega inicial desde 20%", "Saldo negociable"], updatedAt: reviewedAt,
});

export function applyConfirmedCommercialUpdates(projects: Project[], units: Unit[]) {
  for (const project of projects) {
    const patch = projectPatches[project.id];
    if (!patch) continue;
    const { auditNote, ...projectPatch } = patch;
    Object.assign(project, projectPatch);
    if (project.inventoryAudit) {
      project.inventoryAudit.status = "Cotejado";
      project.inventoryAudit.reviewedAt = reviewedAt;
      project.inventoryAudit.pending = [];
      project.inventoryAudit.checkedUnits = units.filter((unit) => unit.projectId === project.id && unit.status === "Disponible").length;
      if (auditNote) project.inventoryAudit.notes = [...project.inventoryAudit.notes, auditNote];
    }
  }

  const remove = new Set(["venire:605", "insignia-07:B43", "insignia-08:C46", "insignia-08:C41", "insignia-08:D04", "insignia-08:D02", "bi-san-clemente-santa-teresa:809", "bi-santa-marina-norte:505"]);
  for (let index = units.length - 1; index >= 0; index--) {
    if (remove.has(`${units[index].projectId}:${units[index].code}`) || units[index].projectId === "casas-bosque" || units[index].projectId === "blu") units.splice(index, 1);
  }

  units.push(...casas.map(makeCasa), ...blu.map(makeBlu));
  if (!units.some((unit) => unit.projectId === "ventura-hassler" && unit.code === "105")) units.push({
    id: "ventura-hassler-105", projectId: "ventura-hassler", code: "105", floor: "1", type: "2 dormitorios", bedrooms: 2,
    ownM2: 78, balconyM2: 0, totalM2: 78, currency: "USD", price: 140000, parking: 0, status: "Disponible",
    downPayment: 42000, features: ["Cochera opcional", "CREO: entrega referencial 30%", "Saldo antes de la entrega"], updatedAt: reviewedAt,
  });
  if (!units.some((unit) => unit.projectId === "insignia-08" && unit.code === "B19")) units.push({
    id: "ig08-b19", projectId: "insignia-08", code: "B19", floor: "1", type: "2+dormitorios", bedrooms: 2,
    ownM2: 50.1, balconyM2: -1, totalM2: 50.1, areaLabel: "de departamento", commonM2: 11.4, parkingM2: 12.5,
    currency: "USD", price: 74799, parking: 1, status: "Disponible",
    features: ["Torre B", "1 cochera incluida", "Plan tradicional de 60, 90 o 120 cuotas"], updatedAt: reviewedAt,
  });

  for (const unit of units) {
    const project = projects.find((item) => item.id === unit.projectId);
    if (project?.developer === "CREO Inmuebles") {
      unit.downPayment = Math.round(unit.price * .3);
      unit.features = Array.from(new Set([...unit.features, "Entrega referencial 30%", "Saldo antes de la entrega", "Condiciones negociables"]));
    }
    if (unit.projectId === "mood-office") {
      unit.downPayment = Math.round(unit.price * .2);
      unit.features = Array.from(new Set([...unit.features, "20% inicial", "Dos alternativas de pago durante obra", "Posesión financiable hasta 3 años"]));
    }
  }

  for (const project of projects.filter((item) => item.developer === "Grupo Avanza")) {
    project.consultationPolicy = "Material de referencia. Confirmar disponibilidad, precio, entrega y financiación ante cada interesado.";
    project.resolvedFields = allCommercialFields;
    if (project.id === "avanza-viwwo") project.summary = "Precios referenciales desde 17/08/2026: Balance Studio 29 m² USD 65.056; Smart Studio 27 m² USD 66.972; Corner Studio 29 m² USD 75.839; Medium Studio 31 m² USD 78.495; Living One 39 m² USD 95.831; Urban Studio 41 m² USD 96.581; Signature 2D 71 m² USD 158.717; Signature+ 2D 79 m² USD 181.105. Living One+ agotado. Superficies aproximadas; disponibilidad y precio exacto se consultan.";
  }
  for (const unit of units.filter((item) => item.projectId.startsWith("avanza-"))) unit.status = "Requiere confirmación";

  for (const project of projects.filter((item) => item.developer === "Building Innovations")) {
    project.resolvedFields = allCommercialFields;
    project.consultationPolicy = "Confirmar disponibilidad y condición final antes de emitir propuesta. Descuento contado referencial alrededor de 5%, negociable.";
  }

  for (const [projectId, count, note] of [
    ["r-bulnes", 10, "Lista de agosto de 2026 y brochure oficial revisados."],
    ["r-las-lomas", 8, "Brochure de julio y lista de agosto de 2026 revisados."],
    ["r-andrade", 27, "Brochure con lista de agosto, plan de pago y proyección de rentabilidad revisado."],
  ] as const) {
    const project = projects.find((item) => item.id === projectId);
    if (project && !project.inventoryAudit) project.inventoryAudit = {
      reviewedAt,
      status: "Cotejado",
      checkedUnits: count,
      areaCorrections: 0,
      addedUnits: count,
      sources: [],
      notes: [note],
      pending: [],
    };
  }
  for (const project of projects) if (project.inventoryAudit) {
    if (project.resolvedFields?.includes("inventoryAudit")) project.inventoryAudit.pending = [];
    project.inventoryAudit.checkedUnits = units.filter((unit) => unit.projectId === project.id && unit.status === "Disponible").length;
  }
}
