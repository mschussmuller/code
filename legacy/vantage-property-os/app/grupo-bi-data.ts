import type { Project, Unit } from "./data";

const updatedAt = "2026-08-26";
const portal = "https://sites.google.com/view/portalgrupobi/inicio";

// Commercial source: user-supplied screenshot, received 27/08/2026.
// File: Captura de pantalla 2026-08-27 a la(s) 15.48.31.png
// Source attachment: libfile_7e8f1ebd26088191be04e5999e1c6e8a.
// Only visible rows were reviewed; hidden/filtered Excel rows were not inspected.
export const completedInventoryReview = {
  reviewedAt: "2026-08-27",
  label: "Captura revisada 27/08 · sin vigencia explícita",
  note: "Disponibilidad y precios contrastados con la captura aportada el 27/08/2026, hoja DISPONIBILIDAD DPTO. Revisión limitada a las filas visibles; no constituye lectura del Excel completo ni confirmación directa de la desarrolladora. La captura no indica fecha de vigencia.",
  reserved: [
    { projectId: "bi-san-clemente-fernando", code: "301", kind: "Departamento", type: "2 dormitorios c/ lavadero frontal", totalM2: 72, parking: 0, priceUSD: 83000, financing: "12 meses sin intereses", status: "Reservado" },
    { projectId: "bi-san-clemente-fernando", code: "503", kind: "Departamento", type: "2 dormitorios frontal", totalM2: 66, parking: 0, priceUSD: 76000, financing: "12 meses sin intereses", status: "Reservado" },
    { projectId: "bi-san-clemente-fernando", code: "602", kind: "Departamento", type: "3 dormitorios c/ lavadero frontal", totalM2: 93, parking: 0, priceUSD: 107000, financing: "12 meses sin intereses", status: "Reservado" },
    { projectId: "bi-san-clemente-fernando", code: "7", kind: "Cochera", type: "Cochera", totalM2: 12.5, parking: 1, priceUSD: 11000, financing: "12 meses sin intereses", status: "Reservado" },
  ],
  parking: [
    { projectId: "bi-santa-marina-norte", code: "6", totalM2: 12.5, priceUSD: 11000, financing: "12 meses sin intereses", status: "Disponible" },
    { projectId: "bi-santa-marina-norte", code: "10", totalM2: 12.5, priceUSD: 11000, financing: "12 meses sin intereses", status: "Disponible" },
  ],
};

// Brochure details are technical documentation, not a source of live stock.
export const completedBrochureDetails: Record<string, NonNullable<Project["brochureDetails"]>> = {
  "bi-san-clemente-santa-teresa": {
    reviewedAt: "2026-08-27",
    building: "112 departamentos, 12 niveles, 1 subsuelo y 2 torres (brochure, p. 4).",
    amenities: ["Piscina", "Solárium", "2 parrilleros", "Sala de reuniones y coworking", "Gimnasio", "Laundry", "Playroom"],
    finishes: ["Porcelanato rectificado en interiores", "Porcelanato antideslizante en baños, balcones y azoteas", "Mesadas de granito natural", "Iluminación LED", "Aberturas de aluminio con vidrio laminado"],
    typologies: [
      { label: "Monoambiente", areaM2: 33, bathrooms: 1, balconyDimensions: "1,10 × 3,75 m", page: 14 },
      { label: "1 dormitorio frontal", areaM2: 39, bathrooms: 1, balconyDimensions: "1,50 × 2,50 m", page: 16 },
      { label: "1 dormitorio posterior", areaM2: 39, bathrooms: 1, balconyDimensions: "1,10 × 3,76 m", page: 18 },
      { label: "1 dormitorio lateral", areaM2: 36.5, bathrooms: 1, balconyDimensions: "0,80 × 2,50 m", page: 20 },
      { label: "2 dormitorios frontales", areaM2: 65, bathrooms: 2, balconyDimensions: "1,50 × 2,88 m", page: 22 },
    ],
    sourceNotes: ["Brochure: materialidad p. 10; tipologías pp. 14–23; amenities p. 25. Páginas físicas del PDF.", "Las dimensiones de balcón no equivalen a una superficie oficial discriminada. No se recalcularon metros propios ni totales.", "Las leyendas de disponibilidad del brochure no se importan como stock. La captura muestra disponibles 102, 109, 809 y 908. Sólo 102 admite 12 meses sin intereses; las otras tres son al contado. 109 incluye cochera. Todas tienen renta activa y requieren visitas coordinadas."],
  },
  "bi-santa-marina-norte": {
    reviewedAt: "2026-08-27",
    building: "Edificio boutique de 6 plantas y 38 departamentos (brochure, p. 2). Dirección: Waldino Lovera c/ Benito Vargas, Zona Norte, Fernando de la Mora (p. 8).",
    amenities: ["Quincho al aire libre", "Piscina", "Deck", "Coworking", "Laundry", "Baños comunes", "Gimnasio"],
    finishes: ["Aires acondicionados split frío/calor", "Iluminación LED", "Porcelanato rectificado en interiores", "Porcelanato antideslizante en baños, balcones y azotea", "Mesadas de granito natural", "Aberturas de aluminio con vidrio laminado 3+3"],
    typologies: [
      { label: "Monoambiente lateral A", areaM2: 29, bathrooms: 1, page: 10 },
      { label: "Monoambiente lateral B", areaM2: 29, bathrooms: 1, page: 12 },
      { label: "Monoambiente frontal", areaM2: 29, bathrooms: 1, balconyDimensions: "1,32 × 3,18 m", page: 14 },
      { label: "1 dormitorio frontal", areaM2: 36.5, bathrooms: 1, balconyDimensions: "Frontal: 1,34 × 2,90 m; posterior: 0,84 × 2,62 m", page: 16 },
      { label: "1 dormitorio posterior", areaM2: 38, bathrooms: 1, balconyDimensions: "1,00 × 3,16 m", page: 18 },
      { label: "1 dormitorio frontal", areaM2: 39, bathrooms: 1, balconyDimensions: "1,34 × 1,80 m", page: 20 },
      { label: "1 dormitorio posterior", areaM2: 39, bathrooms: 1, balconyDimensions: "1,00 × 2,96 m", page: 22 },
    ],
    sourceNotes: ["Brochure: materialidad p. 4; ubicación pp. 7–8; tipologías pp. 10–23; amenities p. 25. Páginas físicas del PDF.", "El brochure incluye una mención genérica a 2 dormitorios en p. 11, pero no una ficha de esa tipología; no se crea inventario por esa mención. La cota del dormitorio en p. 16 requiere aclaración y no se importó.", "Las dimensiones de balcón se conservan como cotas, no como superficie oficial. La captura muestra 302 B y 505 disponibles al contado, sin cochera, con renta activa y visitas coordinadas. Cocheras 6 y 10: disponibles, 12,5 m² y USD 11.000 cada una; 12 meses sin intereses, sin cronograma informado."],
  },
  "bi-san-clemente-fernando": {
    reviewedAt: "2026-08-27",
    building: "Soldado Ovelar esquina San Francisco, Zona Sur, Fernando de la Mora. Terminación y entrega en diciembre de 2023 según el portal comercial consultado el 27/08/2026.",
    amenities: ["Ascensores", "Azotea cubierta", "Parrillas en quincho y balcones", "Área de esparcimiento para niños", "Área para ejercicio al aire libre"],
    finishes: ["Un aire acondicionado por tipología publicada", "Mueble de cocina", "Parrilla en tipologías B, A y E según fichas"],
    typologies: [
      { label: "B · Monoambiente · niveles 1–3", areaM2: 30.21, bathrooms: 1, page: 4 },
      { label: "C · 1 dormitorio · niveles 1–3", areaM2: 36, bathrooms: 1, page: 5 },
      { label: "A · 2 dormitorios · niveles 1–6", areaM2: 70.81, bathrooms: 2, page: 6 },
      { label: "E · 3 dormitorios · nivel 6", areaM2: 92.22, bathrooms: 2, page: 7 },
    ],
    sourceNotes: ["Brochure: dirección y superficies totales pp. 4–7; amenities p. 11. Páginas físicas del PDF; contenido gráfico revisado visualmente.", "El brochure contiene precios históricos sin vigencia acreditada: no se incorporan como precios actuales ni se habilitan unidades para cotizar.", "La captura muestra reservados los departamentos 301, 503 y 602 y la cochera 7; no se habilitan para cotizar. No se infiere el estado de filas ocultas. Balcones visibles, sin superficie discriminada."],
  },
};

export const grupoBiProjects: Project[] = [
  { id: "bi-dhome-campos", name: "DHOME Campos Cervera", developer: "Building Innovations", location: "Barrio Mariscal, Asunción", stage: "Prepozo", delivery: "Abril de 2027", confidence: "Parcial", updatedAt, summary: "21 departamentos disponibles verificados en la planilla comercial en tiempo real. Las cocheras independientes no se incluyen como propiedades.", brochure: "https://drive.google.com/file/d/16PEKnVnngZcopTEyTnbg4xGLJ-cj1eI8/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQCO28BCyeQFQoBfNgpQOwPlAYvlYETR6ZUmbML9lpqKeNc?e=efmF0U", driveFolder: "https://drive.google.com/drive/folders/1Ad_SysLKOGUhaMFj0rdKYfso5Otnh_xw?usp=sharing", mapQuery: "DHOME Campos Cervera Barrio Mariscal Asuncion Paraguay", color: "#24486d", parkingPriceUSD: 16000 },
  { id: "bi-velvet-mariscal", name: "VELVET Mariscal", developer: "Grupo BI", location: "Recoleta, Asunción", stage: "Prepozo", delivery: "Noviembre de 2029", confidence: "Parcial", updatedAt, summary: "54 departamentos disponibles verificados en la planilla comercial en tiempo real. Se excluyeron 75 cocheras disponibles del buscador de propiedades.", brochure: "https://drive.google.com/file/d/1iIKjJt38ap81UC2cdD5DmUmrtltUeQFY/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQD_pVJUkmJST7J4aAdO0ASNAQxffJpr8sx2jk_0BJNIPEo?e=cjqLSK", driveFolder: "https://drive.google.com/drive/folders/1XSD_n7HALZHBfBJSwb0Lnw5ROkPd4kxj?usp=sharing", mapQuery: "VELVET Mariscal Recoleta Asuncion Paraguay", color: "#7d5e77" },
  { id: "bi-filum-herrera", name: "FILUM Herrera", developer: "Grupo BI", location: "Herrera, Asunción", stage: "Semiterminado", delivery: "Diciembre de 2026", confidence: "Parcial", updatedAt, summary: "21 departamentos disponibles verificados. Las 32 cocheras disponibles se conservaron como información comercial y no como propiedades.", brochure: "https://drive.google.com/file/d/1O5Nn3DMvP3dqpSVMuFWdq8C0Gp5PFFTF/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBU6huuSqjyRYlA3DOQoSzxAfcrXB2nzOVGyYSo2BLiH3A?e=A73M82", driveFolder: "https://drive.google.com/drive/folders/1JHGUR_afb-VXc6F9VeklOQ3wptX6MGWR?usp=sharing", mapQuery: "FILUM Herrera Asuncion Paraguay", color: "#456b73" },
  { id: "bi-filum-recoleta", name: "FILUM Recoleta", developer: "Grupo BI", location: "Recoleta, Asunción", stage: "Semiterminado", delivery: "Marzo de 2027", confidence: "Parcial", updatedAt, summary: "6 departamentos disponibles verificados; se excluyeron 8 cocheras independientes del buscador.", brochure: "https://drive.google.com/file/d/16xfr52g0TsIHqoVjTUM82WZpvBkackmf/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQDj8HXIy9xCT7YiNUT9T7LrAYXjyFHPFyW0rSXx6Jo6ZTk?e=CWdgRG", driveFolder: "https://drive.google.com/drive/folders/1Bf7Tf3Bx2ii0fWo2A6ONpnSqxcoJym9l?usp=sharing", mapQuery: "FILUM Recoleta Asuncion Paraguay", color: "#6f7e91" },
  { id: "bi-dhome-cdd", name: "DHOME Cruz del Defensor", developer: "Grupo BI", location: "Recoleta, Asunción", stage: "Semiterminado", delivery: "Abril de 2027", confidence: "Parcial", updatedAt, summary: "3 departamentos disponibles confirmados por la fuente comercial; las unidades vigentes se ofrecen únicamente al contado.", brochure: "https://drive.google.com/file/d/1GMtElojQ1AetPwXTT6mZa9l0jOHQpBaH/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQB3jPdB0lwiRaphY4PnZoEjAaL0GgeCP6eDsDeZdyPVbUw?e=f1TmUM", driveFolder: "https://drive.google.com/drive/folders/15Ov0pZiuFc7r13Dnz_H7VzJBsqXdZVnl?usp=sharing", mapQuery: "DHOME Cruz del Defensor Recoleta Asuncion Paraguay", color: "#8b674f" },
  { id: "bi-san-clemente-norte", name: "SAN CLEMENTE Norte", developer: "Grupo BI", location: "Zona Norte, Fernando de la Mora", stage: "Pozo", delivery: "Marzo de 2028", confidence: "Parcial", updatedAt, summary: "46 departamentos disponibles verificados. Se excluyeron 30 cocheras independientes del inventario de propiedades.", brochure: "https://drive.google.com/file/d/1PjfeyXwrV3VoGpeMK9qMdr8ewrWvAOuT/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQB_ruDRfiG6SqAPZdMOLkaNAT8A5aezWHh0oHGoPpjwI-Q?e=cquLpT", driveFolder: "https://drive.google.com/drive/folders/1X7KLEeUK5tguxGYeNbNzGhvp_PNdB4Ti?usp=sharing", mapQuery: "SAN CLEMENTE Norte Fernando de la Mora Paraguay", imageUrl: "/projects/san-clemente-norte/fachada.jpg", color: "#587862" },
  { id: "bi-san-clemente-santa-teresa", name: "SAN CLEMENTE Santa Teresa", developer: "Grupo BI", location: "Zona Norte, Fernando de la Mora", stage: "Terminado", delivery: "Entregado en diciembre de 2024", confidence: "Parcial", updatedAt, summary: "4 departamentos disponibles según captura del 27/08: 102, 109, 809 y 908. Todos con renta activa y visitas coordinadas. 102: 12 meses sin intereses; restantes: contado. 109 incluye cochera.", brochure: "https://drive.google.com/file/d/1Q70-ZZg-dnNwqzYMGZUwrxoswru4fdX0/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBCXoo6q-r3Q5O7wudUxG0wAQU28YjrIvyCRGKQCJVclmg?e=vLePU0", driveFolder: "https://drive.google.com/drive/folders/1EN7P2sSmvFN5WP5R5I3MqmaVxXM98BqM?usp=sharing", mapQuery: "SAN CLEMENTE Santa Teresa Fernando de la Mora Paraguay", color: "#7a6b57" },
  { id: "bi-santa-marina-norte", name: "SANTA MARINA Norte", developer: "Grupo BI", location: "Zona Norte, Fernando de la Mora", stage: "Terminado", delivery: "Entregado en diciembre de 2025", confidence: "Parcial", updatedAt, summary: "302 B y 505 disponibles al contado según captura del 27/08, con renta activa y visitas coordinadas. Cocheras opcionales 6 y 10: USD 11.000 cada una, separadas del inventario de departamentos.", parkingPriceUSD: completedInventoryReview.parking[0].priceUSD, brochure: "https://drive.google.com/file/d/15fLwz57jljCRf91pFZ4a6rO_DWyNXWpc/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBCXoo6q-r3Q5O7wudUxG0wAQU28YjrIvyCRGKQCJVclmg?e=vLePU0", driveFolder: "https://drive.google.com/drive/folders/1ArM-vlN-0QoFQhWG87isZ_5QcfewgwMA?usp=sharing", mapQuery: "SANTA MARINA Norte Fernando de la Mora Paraguay", color: "#6b7f8d" },
  { id: "bi-san-clemente-fernando", name: "SAN CLEMENTE Fernando", developer: "Grupo BI", location: "Zona Sur, Fernando de la Mora", stage: "Terminado", delivery: "Entregado en diciembre de 2023", confidence: "Requiere confirmación", updatedAt: "2026-08-27", sourceDateLabel: completedInventoryReview.label, summary: "Proyecto terminado con brochure público. En la captura del 27/08, los departamentos 301, 503 y 602 y la cochera 7 figuran reservados; ninguno se habilita para cotizar.", brochure: "https://drive.google.com/file/d/1IZ8sLFzOvTeFDgON7xVfVAtpIZElcn5G/view", priceList: "https://grupobipy-my.sharepoint.com/:x:/g/personal/jazmin_pereira_buildinginnovations_com_py/IQBCXoo6q-r3Q5O7wudUxG0wAQU28YjrIvyCRGKQCJVclmg?e=vLePU0", driveFolder: "https://drive.google.com/drive/folders/1qoVNUt1zfUdjGv1Pc0nfKhF-2oJS5xZ-?usp=sharing", mediaFolder: "https://drive.google.com/drive/folders/1o2UfcAmF7a9BgUb4s1vv8eiyfjJ1ARPx", mapQuery: "Soldado Ovelar esquina San Francisco, Fernando de la Mora, Paraguay", color: "#756f52" },
].map((project) => ({
  ...project,
  developer: "Building Innovations",
  ...(completedBrochureDetails[project.id] ? {
    updatedAt: completedInventoryReview.reviewedAt,
    sourceDateLabel: completedInventoryReview.label,
    brochureDetails: {
      ...completedBrochureDetails[project.id],
      sourceNotes: [...completedBrochureDetails[project.id].sourceNotes, completedInventoryReview.note],
    },
  } : {}),
  ...(project.id === "bi-santa-marina-norte" ? { mapQuery: "Waldino Lovera c/ Benito Vargas, Fernando de la Mora, Paraguay" } : {}),
})) as Project[];

type RawConfig = { projectId: string; rows: string; financing: string | Record<string, string>; rentActive?: boolean };

function bedroomsFromType(type: string) {
  const match = type.match(/(\d)\s*DORM/i);
  return match ? Number(match[1]) : 0;
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makeUnits({ projectId, rows, financing, rentActive = false }: RawConfig): Unit[] {
  return rows.trim().split("\n").filter(Boolean).map((line) => {
    const [code, floor, type, m2Raw, cashRaw, financedRaw, downRaw, monthlyRaw, balanceRaw] = line.split("|");
    const price = Number(cashRaw);
    const financed = Number(financedRaw);
    const downPayment = Number(downRaw);
    const monthlyPayment = Number(monthlyRaw);
    const balanceOnDelivery = Number(balanceRaw);
    const parking = /COCHERA/i.test(type) ? 1 : 0;
    const features = [
      "Disponibilidad verificada en el portal comercial de Building Innovations",
      typeof financing === "string" ? financing : financing[code],
      parking ? "Cochera incluida" : "Cochera no incluida",
      financed > price ? `Precio financiado: USD ${financed.toLocaleString("en-US")}` : "Precio publicado por la desarrolladora",
      ...(rentActive ? ["Renta activa", "Visita con coordinación previa"] : []),
    ];
    return {
      id: `bi-${projectId}-${slug(code)}`,
      projectId,
      code,
      floor,
      type: type.replace(/\s+/g, " ").trim(),
      bedrooms: bedroomsFromType(type),
      ownM2: Number(m2Raw),
      balconyM2: 0,
      totalM2: Number(m2Raw),
      currency: "USD",
      price,
      parking,
      status: "Disponible",
      ...(downPayment > 0 ? { downPayment: Math.round(downPayment) } : {}),
      ...(monthlyPayment > 0 ? { monthlyPayment: Math.round(monthlyPayment) } : {}),
      ...(balanceOnDelivery > 0 ? { balanceOnDelivery: Math.round(balanceOnDelivery) } : {}),
      features,
      updatedAt,
    };
  });
}

const dhomeCampos = `
204|Segundo piso|1 dormitorio lateral|42|69300|75600|22680|1374.545|7560
208|Segundo piso|1 dormitorio lateral|42|69300|75600|22680|1374.545|7560
302|Tercer piso|1 dormitorio frontal|42|69300|75600|22680|1374.545|7560
304|Tercer piso|1 dormitorio lateral|42|69300|75600|22680|1374.545|7560
308|Tercer piso|1 dormitorio lateral|42|69300|75600|22680|1374.545|7560
309|Tercer piso|1 dormitorio posterior|42|69300|75600|22680|1374.545|7560
310|Tercer piso|1 dormitorio posterior|42|69300|75600|22680|1374.545|7560
311|Tercer piso|1 dormitorio posterior|42|69300|75600|22680|1374.545|7560
401|Cuarto piso|1 dormitorio frontal|42|69300|75600|22680|1374.545|7560
404|Cuarto piso|1 dormitorio lateral|42|69300|75600|22680|1374.545|7560
408|Cuarto piso|1 dormitorio lateral + cochera|42|85300|91600|27480|1665.455|9160
409|Cuarto piso|1 dormitorio posterior + cochera|42|85300|91600|27480|1665.455|9160
410|Cuarto piso|1 dormitorio posterior + cochera|42|85300|91600|27480|1665.455|9160
411|Cuarto piso|1 dormitorio posterior + cochera|42|85300|91600|27480|1665.455|9160
504|Quinto piso|1 dormitorio lateral + cochera|42|85300|91600|27480|1665.455|9160
508|Quinto piso|1 dormitorio lateral + cochera|42|85300|91600|27480|1665.455|9160
510|Quinto piso|1 dormitorio posterior + cochera|42|85300|91600|27480|1665.455|9160
604|Sexto piso|1 dormitorio lateral + cochera|42|85300|91600|27480|1665.455|9160
606|Sexto piso|1 dormitorio lateral + cochera|36|75400|80800|24240|1469.091|8080
608|Sexto piso|1 dormitorio lateral + cochera|42|85300|91600|27480|1665.455|9160
708|Séptimo piso|1 dormitorio lateral + cochera|42|85300|91600|27480|1665.455|9160`;

const velvet = `
114|Primer piso|1 dormitorio lateral - con cochera incluida|45|92500|99250|29775|1701.429|9925
214|Segundo piso|1 dormitorio lateral - con cochera incluida|45|93400|100150|30045|1716.857|10015
314|Tercer piso|1 dormitorio lateral - con cochera incluida|45|94300|101050|30315|1732.286|10105
414|Cuarto piso|1 dormitorio lateral - con cochera incluida|45|95200|101950|30585|1747.714|10195
513|Quinto piso|1 dormitorio lateral - con cochera incluida|45|96100|102850|30855|1763.143|10285
514|Quinto piso|1 dormitorio lateral - con cochera incluida|45|96100|102850|30855|1763.143|10285
614|Sexto piso|1 dormitorio lateral - con cochera incluida|45|97000|103750|31125|1778.571|10375
801|Octavo piso|1 dormitorio posterior - con cochera incluida|47|102480|109530|32859|1877.657|10953
803|Octavo piso|1 dormitorio frontal - con cochera incluida|47|102480|109530|32859|1877.657|10953
805|Octavo piso|1 dormitorio frontal - con cochera incluida|47|102480|109530|32859|1877.657|10953
806 - A|Octavo piso|2 dormitorios lateral - con cochera incluida|65|135600|145350|43605|2491.714|14535
807|Octavo piso|1 dormitorio posterior - con cochera incluida|47|102480|109530|32859|1877.657|10953
901|Noveno piso|1 dormitorio posterior - con cochera incluida|47|103420|110470|33141|1893.771|11047
903|Noveno piso|1 dormitorio frontal - con cochera incluida|47|103420|110470|33141|1893.771|11047
904|Noveno piso|1 dormitorio frontal - con cochera incluida|47|103420|110470|33141|1893.771|11047
905|Noveno piso|1 dormitorio frontal - con cochera incluida|47|103420|110470|33141|1893.771|11047
906 - A|Noveno piso|2 dormitorios lateral - con cochera incluida|65|136900|146650|43995|2514|14665
907|Noveno piso|1 dormitorio posterior - con cochera incluida|47|103420|110470|33141|1893.771|11047
1001|Décimo piso|1 dormitorio posterior - con cochera incluida|47|104360|111410|33423|1909.886|11141
1004|Décimo piso|1 dormitorio frontal - con cochera incluida|47|104360|111410|33423|1909.886|11141
1005|Décimo piso|1 dormitorio frontal - con cochera incluida|47|104360|111410|33423|1909.886|11141
1006 - A|Décimo piso|2 dormitorios lateral - con cochera incluida|65|138200|147950|44385|2536.286|14795
1007|Décimo piso|1 dormitorio posterior - con cochera incluida|47|104360|111410|33423|1909.886|11141
1101|Undécimo piso|1 dormitorio posterior - con cochera incluida|47|105300|112350|33705|1926|11235
1103|Undécimo piso|1 dormitorio frontal - con cochera incluida|47|105300|112350|33705|1926|11235
1104|Undécimo piso|1 dormitorio frontal - con cochera incluida|47|105300|112350|33705|1926|11235
1105|Undécimo piso|1 dormitorio frontal - con cochera incluida|47|105300|112350|33705|1926|11235
1107|Undécimo piso|1 dormitorio posterior - con cochera incluida|47|105300|112350|33705|1926|11235
1201|Duodécimo piso|1 dormitorio posterior - con cochera incluida|47|106240|113290|33987|1942.114|11329
1203|Duodécimo piso|1 dormitorio frontal - con cochera incluida|47|106240|113290|33987|1942.114|11329
1204|Duodécimo piso|1 dormitorio frontal - con cochera incluida|47|106240|113290|33987|1942.114|11329
1205|Duodécimo piso|1 dormitorio frontal - con cochera incluida|47|106240|113290|33987|1942.114|11329
1206 - A|Duodécimo piso|2 dormitorios lateral - con cochera incluida|65|140800|150550|45165|2580.857|15055
1206 - B|Duodécimo piso|1 dormitorio lateral - con cochera incluida|39|90880|96730|29019|1658.229|9673
1207|Duodécimo piso|1 dormitorio posterior - con cochera incluida|47|106240|113290|33987|1942.114|11329
1301|Decimotercer piso|1 dormitorio posterior - con cochera incluida|47|107180|114230|34269|1958.229|11423
1305|Decimotercer piso|1 dormitorio frontal - con cochera incluida|47|107180|114230|34269|1958.229|11423
1306 - A|Decimotercer piso|2 dormitorios lateral - con cochera incluida|65|142100|151850|45555|2603.143|15185
1306 - B|Decimotercer piso|1 dormitorio lateral - con cochera incluida|39|91660|97510|29253|1671.6|9751
1307|Decimotercer piso|1 dormitorio posterior - con cochera incluida|47|107180|114230|34269|1958.229|11423
1401|Decimocuarto piso|1 dormitorio posterior - con cochera incluida|47|108120|115170|34551|1974.343|11517
1403|Decimocuarto piso|1 dormitorio frontal - con cochera incluida|47|108120|115170|34551|1974.343|11517
1404|Decimocuarto piso|1 dormitorio frontal - con cochera incluida|47|108120|115170|34551|1974.343|11517
1405|Decimocuarto piso|1 dormitorio frontal - con cochera incluida|47|108120|115170|34551|1974.343|11517
1406 - A|Decimocuarto piso|2 dormitorios lateral - con cochera incluida|65|143400|153150|45945|2625.429|15315
1406 - B|Decimocuarto piso|1 dormitorio lateral - con cochera incluida|39|92440|98290|29487|1684.971|9829
1407|Decimocuarto piso|1 dormitorio posterior - con cochera incluida|47|108120|115170|34551|1974.343|11517
1501|Decimoquinto piso|1 dormitorio posterior - con cochera incluida|47|109060|116110|34833|1990.457|11611
1503|Decimoquinto piso|1 dormitorio frontal - con cochera incluida|47|109060|116110|34833|1990.457|11611
1504|Decimoquinto piso|1 dormitorio frontal - con cochera incluida|47|109060|116110|34833|1990.457|11611
1505|Decimoquinto piso|1 dormitorio frontal - con cochera incluida|47|109060|116110|34833|1990.457|11611
1506 - A|Decimoquinto piso|2 dormitorios lateral - con cochera incluida|65|144700|154450|46335|2647.714|15445
1506 - B|Decimoquinto piso|1 dormitorio lateral - con cochera incluida|39|93220|99070|29721|1698.343|9907
1507|Decimoquinto piso|1 dormitorio posterior - con cochera incluida|47|109060|116110|34833|1990.457|11611`;

const filumHerrera = `
108|1er piso|2 dormitorios posterior|77|142450|142450|42735|3561.25|14245
105|1er piso|2 dormitorios frontal|77|142450|142450|42735|3561.25|14245
112|1er piso|1 dormitorio lateral|38|70300|70300|21090|1757.5|7030
107|1er piso|1 dormitorio lateral|38|70300|70300|21090|1757.5|7030
106|1er piso|1 dormitorio lateral|38|70300|70300|21090|1757.5|7030
202|2do piso|1 dormitorio frontal|48|88800|88800|26640|2220|8880
208|2do piso|2 dormitorios posterior|77|142450|142450|42735|3561.25|14245
205|2do piso|2 dormitorios frontal|77|142450|142450|42735|3561.25|14245
206|2do piso|1 dormitorio lateral|38|70300|70300|21090|1757.5|7030
405|4to piso|2 dormitorios frontal|77|145530|145530|43659|3638.25|14553
406|4to piso|1 dormitorio lateral|38|71820|71820|21546|1795.5|7182
401|4to piso|1 dormitorio lateral|38|71820|71820|21546|1795.5|7182
508|5to piso|2 dormitorios posterior|77|145530|145530|43659|3638.25|14553
507|5to piso|1 dormitorio lateral|38|71820|71820|21546|1795.5|7182
506|5to piso|1 dormitorio lateral|38|71820|71820|21546|1795.5|7182
505|5to piso|2 dormitorios frontal|77|145530|145530|43659|3638.25|14553
604|6to piso|1 dormitorio frontal|40|75600|75600|22680|1890|7560
702|7mo piso|1 dormitorio frontal|48|90720|90720|27216|2268|9072
707|7mo piso|1 dormitorio lateral|38|71820|71820|21546|1795.5|7182
701|7mo piso|1 dormitorio lateral|38|71820|71820|21546|1795.5|7182
708|7mo piso|2 dormitorios posterior|77|145530|145530|43659|3638.25|14553`;

const filumRecoleta = `
108|Primer piso|1 dormitorio posterior|48|98400|98400|29520|5904|9840
307|Tercer piso|Monoambiente lateral|33|67650|67650|20295|4059|6765
601B|Sexto piso|1 dormitorio frontal|42|86100|86100|25830|5166|8610
608|Sexto piso|1 dormitorio posterior|48|98400|98400|29520|5904|9840
811|Octavo piso|2 dormitorios posterior|77|157850|157850|47355|9471|15785
908|Noveno piso|1 dormitorio posterior|48|98400|98400|29520|5904|9840`;

const dhomeCdd = `
207|2|1 dormitorio junior posterior + cochera|32|75200|0|0|0|0
307|3|1 dormitorio junior posterior + cochera|32|75200|0|0|0|0
503|5|1 dormitorio junior frontal + cochera|32|75200|0|0|0|0`;

const sanClementeNorte = `
101|1|Monoambiente posterior|30|36000|40500|12150|1215|4050
102|1|1 dormitorio posterior|40|48000|54000|16200|1620|5400
103|1|1 dormitorio frontal|40|48000|54000|16200|1620|5400
104|1|1 dormitorio frontal|40|48000|54000|16200|1620|5400
105|1|1 dormitorio frontal|40|48000|54000|16200|1620|5400
106|1|2 dormitorios frontal|60|72000|81000|24300|2430|8100
107|1|1 dormitorio frontal|40|48000|54000|16200|1620|5400
108|1|1 dormitorio frontal|40|48000|54000|16200|1620|5400
109|1|1 dormitorio posterior|40|48000|54000|16200|1620|5400
110|1|Monoambiente posterior|30|36000|40500|12150|1215|4050
201|2|Monoambiente posterior|30|36000|40500|12150|1215|4050
202|2|1 dormitorio posterior|40|48000|54000|16200|1620|5400
203|2|1 dormitorio frontal|40|48000|54000|16200|1620|5400
204|2|1 dormitorio frontal|40|48000|54000|16200|1620|5400
205|2|1 dormitorio frontal|40|48000|54000|16200|1620|5400
206|2|2 dormitorios frontal|60|72000|81000|24300|2430|8100
207|2|1 dormitorio frontal|40|48000|54000|16200|1620|5400
208|2|1 dormitorio frontal|40|48000|54000|16200|1620|5400
209|2|1 dormitorio posterior|40|48000|54000|16200|1620|5400
210|2|Monoambiente posterior|30|36000|40500|12150|1215|4050
301|3|Monoambiente posterior|30|36000|40500|12150|1215|4050
302|3|1 dormitorio posterior|40|48000|54000|16200|1620|5400
303|3|1 dormitorio frontal|40|48000|54000|16200|1620|5400
304|3|1 dormitorio frontal|40|48000|54000|16200|1620|5400
307|3|1 dormitorio frontal|40|48000|54000|16200|1620|5400
308|3|1 dormitorio frontal|40|48000|54000|16200|1620|5400
309|3|1 dormitorio posterior|40|48000|54000|16200|1620|5400
310|3|Monoambiente posterior|30|36000|40500|12150|1215|4050
402|4|1 dormitorio posterior|40|50000|56000|16800|1680|5600
403|4|1 dormitorio frontal|40|50000|56000|16800|1680|5600
404|4|1 dormitorio frontal|40|50000|56000|16800|1680|5600
405|4|1 dormitorio frontal|40|50000|56000|16800|1680|5600
406|4|2 dormitorios frontal|60|75000|84000|25200|2520|8400
407|4|1 dormitorio frontal|40|50000|56000|16800|1680|5600
408|4|1 dormitorio frontal|40|50000|56000|16800|1680|5600
409|4|1 dormitorio posterior|40|50000|56000|16800|1680|5600
502|5|1 dormitorio posterior|40|50000|56000|16800|1680|5600
503|5|1 dormitorio frontal|40|50000|56000|16800|1680|5600
504|5|1 dormitorio frontal|40|50000|56000|16800|1680|5600
505|5|1 dormitorio frontal|40|50000|56000|16800|1680|5600
509|5|1 dormitorio posterior|40|50000|56000|16800|1680|5600
602|6|1 dormitorio posterior|40|50000|56000|16800|1680|5600
603|6|1 dormitorio frontal|40|50000|56000|16800|1680|5600
702|7|1 dormitorio posterior|40|50000|56000|16800|1680|5600
704|7|1 dormitorio frontal|40|50000|56000|16800|1680|5600
705|7|1 dormitorio frontal|40|50000|56000|16800|1680|5600`;

const santaTeresa = `
102|1|2 dormitorios frontal|65|90000|0|0|0|0
109|1|1 dormitorio posterior + cochera|39|64000|0|0|0|0
908|9|Monoambiente posterior|33|46500|0|0|0|0`;

const santaMarina = `
302 B|3|1 dormitorio frontal|36.5|52000|0|0|0|0`;

export const grupoBiUnits: Unit[] = [
  ...makeUnits({ projectId: "bi-dhome-campos", rows: dhomeCampos, financing: "30% de entrega, 33 cuotas por 60% y 10% contra entrega" }),
  ...makeUnits({ projectId: "bi-velvet-mariscal", rows: velvet, financing: "30% de entrega, 35 cuotas por 60% y 10% contra entrega" }),
  ...makeUnits({ projectId: "bi-filum-herrera", rows: filumHerrera, financing: "30% de entrega, 24 cuotas por 60% y 10% contra entrega" }),
  ...makeUnits({ projectId: "bi-filum-recoleta", rows: filumRecoleta, financing: "30% de entrega, 10 cuotas por 60% y 10% contra entrega" }),
  ...makeUnits({ projectId: "bi-dhome-cdd", rows: dhomeCdd, financing: "Unidad disponible únicamente al contado" }),
  ...makeUnits({ projectId: "bi-san-clemente-norte", rows: sanClementeNorte, financing: "30% de entrega, 20 cuotas por 60% y 10% contra entrega" }),
  ...makeUnits({ projectId: "bi-san-clemente-santa-teresa", rows: santaTeresa, financing: { "102": "12 meses sin intereses; condiciones negociadas con el dueño", "109": "Venta al contado", "908": "Venta al contado" }, rentActive: true }),
  ...makeUnits({ projectId: "bi-santa-marina-norte", rows: santaMarina, financing: "Venta al contado", rentActive: true }),
].map((unit) => {
  const details = completedBrochureDetails[unit.projectId];
  if (!details) return unit;
  return {
    ...unit,
    // Neither brochure certifies a separate own-area or balcony-area figure.
    ownM2: -1,
    balconyM2: -1,
    areaLabel: "según fuente",
    updatedAt: completedInventoryReview.reviewedAt,
    features: ["Disponible según captura aportada el 27/08/2026", ...unit.features.slice(1), ...details.amenities, "Balcón: dimensiones en ficha técnica; superficie oficial no discriminada"],
  };
});

export const grupoBiSource = portal;
