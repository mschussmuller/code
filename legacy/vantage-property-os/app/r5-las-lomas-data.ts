import type { Project, Unit } from "./data";

const bulnesDate = "2026-08-26";
const lomasDate = "2026-08-04";
const andradeDate = "2026-08-19";
const resolvedFields = ["inventoryAudit", "delivery", "validation", "priceList", "units", "financing"];

export const r5Projects: Project[] = [
  {
    id: "r-bulnes",
    name: "R Bulnes",
    developer: "Grupo Delgado / FDS",
    location: "Gonzalo Bulnes esquina Del Maestro, Asunción",
    stage: "Terminado",
    delivery: "Entregado en febrero de 2026 — listo para ocupación",
    confidence: "Confirmado",
    updatedAt: bulnesDate,
    sourceDateLabel: "Lista: agosto de 2026",
    summary: "10 unidades disponibles. Cochera opcional USD 20.000 y baulera opcional USD 3.000. Financiación directa hasta 36 meses; entrega y cronograma se negocian con cada comprador.",
    brochure: "/brochures/r-bulnes.pdf",
    mapQuery: "Gonzalo Bulnes esquina Del Maestro Asunción Paraguay",
    color: "#0b3b34",
    parkingPriceUSD: 20000,
    resolvedFields,
    consultationPolicy: "Disponibilidad según lista de agosto de 2026. Reconfirmar condiciones negociadas antes de emitir propuesta.",
    brochureDetails: {
      reviewedAt: "2026-09-01",
      building: "38 departamentos: 12 studios, 15 de 1 dormitorio, 7 de 2 dormitorios y 4 de 3 dormitorios. El edificio ya fue entregado.",
      amenities: ["Recepción", "Estar común por piso", "Gimnasio", "Quincho", "Terraza", "Piscina", "Deck", "Laundry"],
      finishes: ["Balcones en las tipologías residenciales", "Kitchenette en studios", "Parrilla en las tipologías de 2 dormitorios"],
      typologies: [
        { label: "Studio", areaM2: 28.51, bathrooms: 1, page: 22 },
        { label: "1 dormitorio sobre Bulnes", areaM2: 55.47, bathrooms: 2, page: 21 },
        { label: "1 dormitorio sobre Del Maestro", areaM2: 48.14, bathrooms: 2, page: 25 },
        { label: "2 dormitorios", areaM2: 82.2, bathrooms: 3, page: 23 },
        { label: "2 dormitorios en esquina", areaM2: 92.62, bathrooms: 3, page: 24 },
      ],
      sourceNotes: ["Áreas tomadas de la lista comercial de agosto de 2026; el brochure no discrimina superficies por tipología.", "El brochure también identifica unidades de 3 dormitorios, pero no publica su superficie en la ficha revisada."],
    },
  },
  {
    id: "r-las-lomas",
    name: "R5 Las Lomas",
    developer: "Grupo Delgado / FDS",
    location: "Pastor Filártiga esquina Dr. Carlos Abdala, Las Lomas, Asunción",
    stage: "Pozo",
    delivery: "A consultar al cotizar",
    confidence: "Confirmado",
    updatedAt: lomasDate,
    sourceDateLabel: "Lista: agosto de 2026",
    summary: "8 departamentos de 1 dormitorio disponibles. Cinco cocheras con baulera opcionales por USD 23.000. Plan estándar: 30% inicial, 60% en 15 cuotas iguales y 10% en la posesión.",
    brochure: "/brochures/r-las-lomas.pdf",
    priceList: "https://drive.google.com/file/d/16NTblM2sLm_HpMV5zJjUXiW5BYXXcAPo/view?usp=drivesdk",
    mapQuery: "Pastor Filártiga esquina Dr. Carlos Abdala Las Lomas Asunción Paraguay",
    color: "#123c35",
    imageUrl: "/projects/r5-las-lomas/fachada.jpg",
    parkingPriceUSD: 23000,
    parkingIncludesStorage: true,
    resolvedFields,
    consultationPolicy: "La fecha de entrega y la disponibilidad final se consultan al preparar cada propuesta.",
    brochureDetails: {
      reviewedAt: "2026-09-01",
      building: "Proyecto residencial en Las Lomas con distribuciones flexibles, balcones y zona de esparcimiento en la azotea.",
      amenities: ["Zona de esparcimiento en la azotea"],
      finishes: ["Balcones", "Iluminación natural", "Distribuciones funcionales"],
      typologies: [
        { label: "1 dormitorio A", areaM2: 52.75, bathrooms: 2, page: 4 },
        { label: "1 dormitorio C", areaM2: 31.15, bathrooms: 1, page: 6 },
        { label: "1 dormitorio E", areaM2: 22.8, bathrooms: 1, page: 8 },
        { label: "1 dormitorio F", areaM2: 37.16, bathrooms: 1, page: 10 },
        { label: "1 dormitorio B", areaM2: 62.5, bathrooms: 2, page: 12 },
        { label: "1 dormitorio D", areaM2: 33.7, bathrooms: 1, page: 14 },
      ],
      sourceNotes: ["El brochure documenta seis tipologías; la disponibilidad y los precios provienen de la lista separada de agosto de 2026.", "Las cocheras disponibles incluyen 12,5 m² de estacionamiento y 0,9 m² de baulera."],
    },
  },
  {
    id: "r-andrade",
    name: "R Andrade",
    developer: "Grupo Delgado / FDS",
    location: "Dr. Morra y O'Higgins, Villa Morra, Asunción",
    stage: "Pozo",
    delivery: "4.º trimestre de 2027",
    confidence: "Confirmado",
    updatedAt: andradeDate,
    sourceDateLabel: "Lista incluida en el brochure: agosto de 2026",
    summary: "27 studios amoblados y equipados disponibles, desde USD 66.950. Plan estándar 30% + 15 cuotas por el 60% + 10% en posesión. Pool de renta previsto para el 1.er trimestre de 2028.",
    brochure: "/brochures/r-andrade.pdf",
    priceList: "/brochures/r-andrade.pdf#page=15",
    mapQuery: "Dr. Morra y O'Higgins Villa Morra Asunción Paraguay",
    color: "#153d35",
    imageUrl: "/projects/r-andrade/fachada.jpg",
    resolvedFields,
    consultationPolicy: "Rentabilidad, ocupación y tarifa son proyecciones del brochure, no resultados garantizados. Reconfirmar stock antes de cotizar.",
    brochureDetails: {
      reviewedAt: "2026-09-01",
      building: "Edificio de studios en Villa Morra. Las unidades ofertadas entre los pisos 2 y 7 se publican totalmente equipadas y amobladas.",
      amenities: ["Azotea con espacio de esparcimiento", "Pool de renta para inversores", "Showroom virtual"],
      finishes: ["Unidad equipada", "Unidad amoblada", "Balcón", "Distribución integrada"],
      typologies: [{ label: "Studio", areaM2: 30.17, bathrooms: 1, page: 4 }],
      sourceNotes: ["La lista de agosto de 2026 publica superficies entre 28,35 y 30,17 m²; 30,17 m² es la tipología ilustrada en el brochure.", "Proyección del pool: ocupación 80%-90%, tarifa diaria USD 50-65, margen neto 55%-60%, fee de administración 15%-20% y ROI 12%-15%.", "El reglamento prevé vocación de renta corta por 15 años, renovable cada 5 años. Puesta en marcha estimada: 1.er trimestre de 2028."],
    },
  },
];

const bulnesRows = `201|1 dormitorio|55.47|122034|145034
204|1 dormitorio|55.47|122034|145034
205|2 dormitorios|82.20|180840|203840
301|1 dormitorio|55.47|123365|146365
304|1 dormitorio|55.47|123365|146365
404|1 dormitorio|55.47|124697|147697
504|1 dormitorio|55.47|126028|149028
604|1 dormitorio|55.47|127359|150359
605|2 dormitorios|82.20|188731|211731
607|1 dormitorio|48.14|110529|133529`;

const lomasRows = `101|A|52.75|105500
106|F|37.16|69700
206|F|37.16|72700
401|A|52.75|110300
406|D|33.70|78700
501|A|52.75|111936
502|C|31.15|67900
505|B|62.50|132625`;

const andradeRows = `205|29.27|66950
208|29.27|66950
307|29.81|68959
310|29.14|68959
311|29.14|68959
404|29.19|71027
406|29.81|71027
408|29.27|71027
507|29.81|73158
508|29.27|73158
509|28.35|73158
511|29.14|73158
512|28.89|73158
607|29.81|75353
608|29.27|75353
609|28.35|75353
610|29.14|75353
612|28.89|75353
701|29.72|77613
705|29.27|77613
706|29.81|77613
707|29.81|77613
708|29.27|77613
709|28.35|77613
710|29.14|77613
711|29.14|77613
712|28.89|77613`;

const bulnesUnits: Unit[] = bulnesRows.split("\n").map((row) => {
  const [code, type, area, price, totalWithExtras] = row.split("|");
  return {
    id: `r-bulnes-${code}`, projectId: "r-bulnes", code, floor: code[0], type, bedrooms: Number(type[0]),
    ownM2: Number(area), balconyM2: 0, totalM2: Number(area), areaLabel: "de departamento", currency: "USD",
    price: Number(price), parking: 0, status: "Disponible",
    features: ["Proyecto entregado y listo para ocupación", "Cochera opcional USD 20.000", "Baulera opcional USD 3.000", `Total con cochera y baulera: USD ${Number(totalWithExtras).toLocaleString("es-PY")}`, "Financiación directa hasta 36 meses; condiciones negociables"],
    updatedAt: bulnesDate,
  };
});

const lomasUnits: Unit[] = lomasRows.split("\n").map((row) => {
  const [code, type, area, price] = row.split("|");
  const numericPrice = Number(price);
  return {
    id: `r-las-lomas-${code}`, projectId: "r-las-lomas", code, floor: code[0], type: `1 dormitorio tipo ${type}`, bedrooms: 1,
    ownM2: Number(area), balconyM2: 0, totalM2: Number(area), areaLabel: "de departamento", currency: "USD",
    price: numericPrice, parking: 0, status: "Disponible", downPayment: Math.round(numericPrice * .3),
    monthlyPayment: Math.round(numericPrice * .6 / 15), balanceOnDelivery: Math.round(numericPrice * .1),
    features: ["30% de entrega inicial", "60% en 15 cuotas iguales", "10% en la posesión", "Cochera con baulera opcional por USD 23.000"],
    updatedAt: lomasDate, imageUrl: "/projects/r5-las-lomas/fachada.jpg", planUrl: `/projects/r5-las-lomas/plano-${type.toLowerCase()}.jpg`,
  };
});

const andradeUnits: Unit[] = andradeRows.split("\n").map((row) => {
  const [code, area, price] = row.split("|");
  const numericPrice = Number(price);
  return {
    id: `r-andrade-${code}`, projectId: "r-andrade", code, floor: code[0], type: "Studio amoblado y equipado", bedrooms: 0,
    ownM2: Number(area), balconyM2: -1, totalM2: Number(area), areaLabel: "de departamento", currency: "USD",
    price: numericPrice, parking: 0, status: "Disponible", downPayment: Math.round(numericPrice * .3),
    monthlyPayment: Math.round(numericPrice * .6 / 15), balanceOnDelivery: Math.round(numericPrice * .1),
    features: ["Totalmente equipado y amoblado", "30% de entrega inicial", "60% en 15 cuotas iguales", "10% en la posesión", "ROI proyectado 12%-15%", "Ocupación proyectada 80%-90%", "Tarifa diaria proyectada USD 50-65", "Proyecciones del brochure; no garantizadas"],
    updatedAt: andradeDate,
  };
});

export const r5Units: Unit[] = [...bulnesUnits, ...lomasUnits, ...andradeUnits];
