"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { projects, units, type Project, type Unit } from "./data";
import { calculateQuoteOption, quoteDelivery, type QuoteAdjustment } from "./quote-options";

type Tab = "buscar" | "proyectos" | "propuesta" | "datos";
type DataView = "cargar" | "faltantes" | "estado";
type PaymentMode = "financiado" | "contado";
type ParkingChoice = { enabled: boolean; priceUSD: string };
type ProposalHistory = { id: string; clientName: string; advisor: string; selectedUnitIds: string[]; createdAt: string; createdBy: string };
type DataOverride = { id: string; entityType: string; entityId: string; field: string; newValue: string; createdAt: string; createdBy: string };
type DocumentIntake = { id: string; projectId: string; developer: string; documentType: string; sourceType: string; fileName?: string | null; sourceUrl?: string | null; status: string; analysisSummary: string; createdAt: string; createdBy: string };
type MissingTask = { id: string; projectId: string; developer: string; field: string; label: string; reason: string; priority: string; status: string; updatedAt: string };
type MissingSuggestion = { id: string; projectId: string; developer: string; projectName: string; field: string; label: string; reason: string; priority: "Alta" | "Media"; status: string };

const usd = new Intl.NumberFormat("es-PY", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pyg = new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 });

function budgetUsd(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function proposalType(unit: Unit) {
  if (/studio/i.test(unit.type)) return "Studio";
  if (/monoambiente/i.test(unit.type)) return "Monoambiente";
  return unit.type.replace(/\s+tipo\s+[A-Z]$/i, "");
}

function proposalDelivery(value: string) {
  const clean = value.trim();
  const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const duration = clean.match(/(\d+)\s+meses?\s+desde\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i);
  if (duration) {
    const start = new Date(Number(duration[3]), monthNames.indexOf(duration[2].toLowerCase()), 1);
    start.setMonth(start.getMonth() + Number(duration[1]));
    return `${monthNames[start.getMonth()]} ${start.getFullYear()}`.toUpperCase();
  }
  const directMonth = clean.match(new RegExp(`(${monthNames.join("|")})\\s+(?:de\\s+)?(\\d{4})`, "i"));
  if (directMonth) return `${directMonth[1]} ${directMonth[2]}`.toUpperCase();
  const quarter = clean.match(/([1-4])(?:\.|º|°|er|do|to)*\s*trimestre(?:\s+de)?\s+(\d{4})/i);
  if (quarter) return `${monthNames[Number(quarter[1]) * 3 - 1]} ${quarter[2]}`.toUpperCase();
  if (/requiere|confirmar|pendiente|sin fecha/i.test(clean)) return "A CONFIRMAR";
  return clean.toUpperCase();
}

function proposalIncludes(unit: Unit) {
  if (unit.features.some((feature) => /amoblad|equipad/i.test(feature)) || /amoblad|equipad/i.test(unit.type)) return "Amoblamiento";
  return "Según unidad";
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M9 21v-3h6v3"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>,
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8z"/>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    folder: <><path d="M3 6h7l2 2h9v11H3z"/></>,
    alert: <><path d="M12 3 2 21h20z"/><path d="M12 9v5M12 18h.01"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatPrice(unit: Unit, fx: number, force?: "USD" | "PYG") {
  if (force === "USD") return usd.format(unit.currency === "USD" ? unit.price : unit.price / fx);
  if (force === "PYG") return pyg.format(unit.currency === "PYG" ? unit.price : unit.price * fx);
  return unit.currency === "USD" ? usd.format(unit.price) : pyg.format(unit.price);
}

function formatArea(unit: Unit, decimals = 1) {
  return unit.totalM2 > 0 ? `${unit.totalM2.toFixed(decimals)} m²` : "Por confirmar";
}

function areaDetails(unit: Unit) {
  return [
    unit.internalM2 !== undefined ? `${unit.projectId === "venire" ? "Cubierta" : "Interior"}: ${unit.internalM2.toFixed(2)} m²` : null,
    unit.patioM2 ? `Patio: ${unit.patioM2.toFixed(1)} m²` : null,
    unit.commonM2 !== undefined ? `Comunes: ${unit.commonM2.toFixed(1)} m²` : null,
    unit.parkingM2 ? `Cochera: ${unit.parkingM2.toFixed(1)} m²` : null,
    unit.storageM2 !== undefined ? `Baulera: ${unit.storageM2.toFixed(1)} m²` : null,
  ].filter(Boolean).join(" · ");
}

function InventoryAuditDetails({ project }: { project: Project }) {
  const audit = project.inventoryAudit;
  if (!audit) return null;
  return <section className="brochure-details inventory-review" aria-label={`Auditoría de ${project.name}`}>
    <h3>Auditoría de inventario · {audit.status}</h3>
    <p>Revisión documental: {audit.reviewedAt} · {audit.checkedUnits} unidades cotejadas · {audit.areaCorrections} superficies corregidas · {audit.addedUnits} incorporadas.</p>
    {audit.notes.map(note => <p key={note}>{note}</p>)}
    {audit.pending.length > 0 && <><h4>Pendientes de confirmación</h4><ul>{audit.pending.map(note => <li key={note}>{note}</li>)}</ul></>}
    <details><summary>Fuentes internas de la revisión</summary>{audit.sources.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></p>)}</details>
  </section>;
}

function formatParking(unit: Unit) {
  if (unit.parking < 0) return "Por confirmar";
  if (unit.parking === 0) return "No incluye";
  return `${unit.parking} cochera${unit.parking === 1 ? "" : "s"}`;
}

function ageInDays(date: string) {
  return Math.max(0, Math.floor((new Date("2026-08-24").getTime() - new Date(date).getTime()) / 86400000));
}

function BrochureDetails({ project }: { project: Project }) {
  const details = project.brochureDetails;
  if (!details) return null;
  return <section className="brochure-details" aria-label={`Ficha técnica de ${project.name}`}>
    <h3>Datos del brochure</h3>
    <p>{details.building}</p>
    <h4>Amenities</h4><p>{details.amenities.join(" · ")}</p>
    <h4>Terminaciones y equipamiento</h4><p>{details.finishes.join(" · ")}</p>
    <div className="brochure-table-wrap"><table>
      <caption>Tipologías documentadas · No representan disponibilidad</caption>
      <thead><tr><th>Tipología</th><th>m² publicados</th><th>Baños</th><th>Cotas de balcón</th><th>Plano</th></tr></thead>
      <tbody>{details.typologies.map((type) => <tr key={`${type.label}-${type.areaM2}`}>
        <td>{type.label}</td><td>{type.areaM2.toLocaleString("es-PY")}</td><td>{type.bathrooms}</td><td>{type.balconyDimensions || "Sin discriminar"}</td>
        <td><a href={project.brochure} target="_blank" rel="noreferrer">PDF · p. {type.page}</a></td>
      </tr>)}</tbody>
    </table></div>
    <details><summary>Fuentes y observaciones · Revisión {details.reviewedAt}</summary>
      {details.sourceNotes.map((note) => <p key={note}>{note}</p>)}
    </details>
  </section>;
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function isDirectBrochureUrl(url?: string) {
  if (!url) return false;
  return /drive\.google\.com\/file\/d\/|docs\.google\.com\/[^/]+\/d\/|\.pdf(?:$|[?#])/i.test(url);
}

function locationMatches(projectLocation: string, requestedLocation: string) {
  const haystack = normalizeText(projectLocation);
  let needle = normalizeText(requestedLocation);
  if (!needle) return true;
  if (needle === "cde") needle = "ciudad del este";
  if (needle === "capital") needle = "asuncion";
  if (needle === "gran asuncion") return /asuncion|luque|san lorenzo|fernando de la mora|lambare|mariano roque alonso/.test(haystack);
  return haystack.includes(needle);
}

function Freshness({ date, label }: { date: string; label?: string }) {
  const age = ageInDays(date);
  return <span className={`freshness ${age > 30 ? "stale" : "current"}`}>{label || (age > 30 ? "Requiere confirmación" : `Actualizado hace ${age} días`)}</span>;
}

function ProjectMark({ project, large = false }: { project: Project; large?: boolean }) {
  return <div className={`project-mark ${large ? "large" : ""}`} style={{ "--project-color": project.color } as React.CSSProperties}><span>{project.name.replace("Torre ", "").split(" ").map((word) => word[0]).join("").slice(0, 3)}</span></div>;
}

export default function PropertyOS({ userEmail }: { userEmail?: string | null }) {
  const [tab, setTab] = useState<Tab>("buscar");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [capital, setCapital] = useState("");
  const [monthly, setMonthly] = useState("");
  const [location, setLocation] = useState("");
  const [developer, setDeveloper] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [minM2, setMinM2] = useState("");
  const [stage, setStage] = useState("");
  const [fx, setFx] = useState(7900);
  const [selected, setSelected] = useState<string[]>([]);
  const [projectOpen, setProjectOpen] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [advisor, setAdvisor] = useState("Vantage Real Estate");
  const [term, setTerm] = useState(30);
  const [downPercent, setDownPercent] = useState(30);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("financiado");
  const [unitAdjustments, setUnitAdjustments] = useState<Record<string, QuoteAdjustment>>({});
  const [parkingChoices, setParkingChoices] = useState<Record<string, ParkingChoice>>({});
  const [history, setHistory] = useState<ProposalHistory[]>([]);
  const [savingProposal, setSavingProposal] = useState(false);
  const [overrides, setOverrides] = useState<DataOverride[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState(projects[0].id);
  const [editField, setEditField] = useState("delivery");
  const [editValue, setEditValue] = useState("");
  const [editSource, setEditSource] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [dataView, setDataView] = useState<DataView>("faltantes");
  const [intakes, setIntakes] = useState<DocumentIntake[]>([]);
  const [missingTasks, setMissingTasks] = useState<MissingTask[]>([]);
  const [intakeDeveloper, setIntakeDeveloper] = useState(projects[0].developer);
  const [intakeProjectId, setIntakeProjectId] = useState(projects[0].id);
  const [intakeDocumentType, setIntakeDocumentType] = useState("Brochure");
  const [intakeSourceMode, setIntakeSourceMode] = useState<"drive" | "file">("drive");
  const [intakeUrl, setIntakeUrl] = useState("");
  const [intakeFile, setIntakeFile] = useState<File | null>(null);
  const [intakeNote, setIntakeNote] = useState("");
  const [savingIntake, setSavingIntake] = useState(false);
  const [intakeMessage, setIntakeMessage] = useState("");
  const [missingDeveloper, setMissingDeveloper] = useState("");
  const [showMediumMissing, setShowMediumMissing] = useState(false);

  const liveProjects = useMemo(() => projects.map((project) => {
    const latest = overrides.filter((item) => item.entityType === "project" && item.entityId === project.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return latest.reduce((current, item) => ({ ...current, [item.field]: item.newValue }), project) as Project;
  }), [overrides]);
  const liveProjectById = useMemo(() => Object.fromEntries(liveProjects.map((project) => [project.id, project])) as Record<string, Project>, [liveProjects]);
  const developers = useMemo(() => Array.from(new Set(liveProjects.map((project) => project.developer))), [liveProjects]);
  const developerProjects = useMemo(() => developer
    ? liveProjects.filter((project) => project.developer === developer)
    : liveProjects, [developer, liveProjects]);
  const portfolioGroups = useMemo(() => developers.map((developerName) => ({
    developer: developerName,
    projects: liveProjects.filter((project) => project.developer === developerName),
  })), [developers, liveProjects]);
  const intakeProjects = useMemo(() => liveProjects.filter((project) => project.developer === intakeDeveloper), [intakeDeveloper, liveProjects]);

  useEffect(() => {
    fetch("/api/proposals").then((response) => response.ok ? response.json() : null).then((payload) => payload?.proposals && setHistory(payload.proposals)).catch(() => undefined);
    fetch("/api/overrides").then((response) => response.ok ? response.json() : null).then((payload) => payload?.overrides && setOverrides(payload.overrides)).catch(() => undefined);
    fetch("/api/intake").then((response) => response.ok ? response.json() : null).then((payload) => payload?.intakes && setIntakes(payload.intakes)).catch(() => undefined);
    fetch("/api/missing").then((response) => response.ok ? response.json() : null).then((payload) => payload?.tasks && setMissingTasks(payload.tasks)).catch(() => undefined);
  }, []);

  const searchResults = useMemo(() => {
    const maxBudget = Number(budget) || 0;
    const maxCapital = Number(capital) || 0;
    const maxMonthly = Number(monthly) || 0;
    const minimumM2 = Number(minM2) || 0;
    const desiredBedrooms = bedrooms === "" ? null : Number(bedrooms);
    const terms = normalizeText(query).split(/\s+/).filter(Boolean);
    const stageOrder = ["Prepozo", "Pozo", "Semiterminado", "Terminado"];
    const baseCandidates = units
      .filter((unit) => unit.status === "Disponible")
      .filter((unit) => !developer || liveProjectById[unit.projectId]?.developer === developer)
      .filter((unit) => !projectFilter || unit.projectId === projectFilter)
      .flatMap((unit) => {
        const project = liveProjectById[unit.projectId];
        if (!project || (!isDirectBrochureUrl(project.brochure) && project.confidence !== "Confirmado")) return [];
        const priceUSD = unit.currency === "USD" ? unit.price : unit.price / fx;
        const downUSD = unit.downPayment ? (unit.currency === "USD" ? unit.downPayment : unit.downPayment / fx) : priceUSD * (downPercent / 100);
        const monthlyUSD = unit.monthlyPayment ? (unit.currency === "USD" ? unit.monthlyPayment : unit.monthlyPayment / fx) : (priceUSD - downUSD) / term;
        const searchable = normalizeText(`${project.name} ${project.developer} ${project.location} ${unit.type} ${unit.code} ${unit.features.join(" ")}`);
        return [{ unit, project, priceUSD, downUSD, monthlyUSD, searchable }];
      });

    const exactMatches = baseCandidates.flatMap(({ unit, project, priceUSD, downUSD, monthlyUSD, searchable }) => {
        const gaps: string[] = [];
        const wins: string[] = [];

        if (terms.length && !terms.every((termValue) => searchable.includes(termValue))) return [];
        if (maxBudget && priceUSD > maxBudget) return [];
        if (maxCapital && downUSD > maxCapital) return [];
        if (maxMonthly && monthlyUSD > maxMonthly) return [];
        if (location && !locationMatches(project.location, location)) return [];
        if (desiredBedrooms !== null && unit.bedrooms < 0) return [];
        if (desiredBedrooms !== null && unit.bedrooms !== desiredBedrooms) return [];
        if (minimumM2 && (unit.totalM2 <= 0 || unit.totalM2 < minimumM2)) return [];
        if (stage && project.stage !== stage) return [];

        if (terms.length) wins.push("Búsqueda exacta");
        if (maxBudget) wins.push("Dentro del presupuesto");
        if (maxCapital) wins.push("Entrega inicial compatible");
        if (maxMonthly) wins.push("Cuota compatible");
        if (location) wins.push("Ubicación elegida");
        if (desiredBedrooms !== null) wins.push("Tipología exacta");
        if (minimumM2) wins.push("Superficie compatible");
        if (stage) wins.push("Etapa elegida");

        return [{ unit, project, score: 100, exact: true as const, gaps, wins, priceUSD, downUSD, monthlyUSD }];
      })
      .sort((a, b) => maxBudget
        ? b.priceUSD - a.priceUSD || a.project.name.localeCompare(b.project.name)
        : a.priceUSD - b.priceUSD || a.project.name.localeCompare(b.project.name));

    if (exactMatches.length) return { items: exactMatches, nearMode: false };

    const nearMatches = baseCandidates.flatMap(({ unit, project, priceUSD, downUSD, monthlyUSD, searchable }) => {
      if (location && !locationMatches(project.location, location)) return [];
      if (maxBudget && priceUSD > maxBudget * 1.15) return [];
      if (maxCapital && downUSD > maxCapital * 1.15) return [];
      if (maxMonthly && monthlyUSD > maxMonthly * 1.15) return [];
      if (desiredBedrooms !== null && (unit.bedrooms < 0 || Math.abs(unit.bedrooms - desiredBedrooms) > 1)) return [];
      if (minimumM2 && (unit.totalM2 <= 0 || unit.totalM2 < minimumM2 * 0.85)) return [];

      const requestedStageIndex = stageOrder.indexOf(stage);
      const projectStageIndex = stageOrder.indexOf(project.stage);
      if (stage && (requestedStageIndex < 0 || projectStageIndex < 0 || Math.abs(requestedStageIndex - projectStageIndex) > 1)) return [];

      let weightedScore = 0;
      let totalWeight = 0;
      const gaps: string[] = [];
      const wins: string[] = [];
      const addScore = (weight: number, value: number) => {
        weightedScore += weight * Math.max(0, Math.min(100, value));
        totalWeight += weight;
      };

      if (terms.length) {
        const matchingTerms = terms.filter((termValue) => searchable.includes(termValue)).length;
        const ratio = matchingTerms / terms.length;
        if (ratio < 0.5) return [];
        addScore(12, ratio * 100);
        if (ratio === 1) wins.push("Búsqueda exacta");
        else gaps.push(`Coincide con ${matchingTerms} de ${terms.length} términos`);
      }
      if (maxBudget) {
        addScore(20, priceUSD <= maxBudget ? 100 : (maxBudget / priceUSD) * 100);
        if (priceUSD <= maxBudget) wins.push("Dentro del presupuesto");
        else gaps.push(`${usd.format(priceUSD - maxBudget)} sobre presupuesto`);
      }
      if (maxCapital) {
        addScore(12, downUSD <= maxCapital ? 100 : (maxCapital / downUSD) * 100);
        if (downUSD <= maxCapital) wins.push("Entrega inicial compatible");
        else gaps.push(`${usd.format(downUSD - maxCapital)} más de entrega`);
      }
      if (maxMonthly) {
        addScore(12, monthlyUSD <= maxMonthly ? 100 : (maxMonthly / monthlyUSD) * 100);
        if (monthlyUSD <= maxMonthly) wins.push("Cuota compatible");
        else gaps.push(`${usd.format(monthlyUSD - maxMonthly)} sobre la cuota`);
      }
      if (location) {
        addScore(20, 100);
        wins.push(`Ubicación exacta: ${project.location}`);
      }
      if (desiredBedrooms !== null) {
        const difference = Math.abs(unit.bedrooms - desiredBedrooms);
        addScore(16, difference === 0 ? 100 : 70);
        if (difference === 0) wins.push("Tipología exacta");
        else gaps.push(`${unit.bedrooms || "Mono"} dormitorio${unit.bedrooms === 1 ? "" : "s"} en vez de ${desiredBedrooms || "mono"}`);
      }
      if (minimumM2) {
        addScore(10, unit.totalM2 >= minimumM2 ? 100 : (unit.totalM2 / minimumM2) * 100);
        if (unit.totalM2 >= minimumM2) wins.push("Superficie compatible");
        else gaps.push(`${(minimumM2 - unit.totalM2).toFixed(1)} m² por debajo`);
      }
      if (stage) {
        const difference = Math.abs(requestedStageIndex - projectStageIndex);
        addScore(8, difference === 0 ? 100 : 70);
        if (difference === 0) wins.push("Etapa elegida");
        else gaps.push(`Etapa cercana: ${project.stage}`);
      }

      const score = totalWeight ? Math.round(weightedScore / totalWeight) : 0;
      if (score < 70) return [];
      return [{ unit, project, score, exact: false as const, gaps, wins, priceUSD, downUSD, monthlyUSD }];
    }).sort((a, b) => maxBudget
      ? Math.abs(a.priceUSD - maxBudget) - Math.abs(b.priceUSD - maxBudget) || Number(a.priceUSD > maxBudget) - Number(b.priceUSD > maxBudget) || b.priceUSD - a.priceUSD || b.score - a.score
      : b.score - a.score || a.priceUSD - b.priceUSD || a.project.name.localeCompare(b.project.name));

    return { items: nearMatches, nearMode: nearMatches.length > 0 };
  }, [query, budget, capital, monthly, location, bedrooms, minM2, stage, developer, projectFilter, fx, term, downPercent, liveProjectById]);

  const scored = searchResults.items;
  const nearMode = searchResults.nearMode;

  const scoredGroups = useMemo(() => {
    const byDeveloper = new Map<string, typeof scored>();
    scored.forEach((item) => {
      const current = byDeveloper.get(item.project.developer) || [];
      current.push(item);
      byDeveloper.set(item.project.developer, current);
    });
    return Array.from(byDeveloper.entries()).map(([developerName, developerItems]) => {
      const byProject = new Map<string, typeof scored>();
      developerItems.forEach((item) => {
        const current = byProject.get(item.project.id) || [];
        current.push(item);
        byProject.set(item.project.id, current);
      });
      return { developer: developerName, projects: Array.from(byProject.values()) };
    });
  }, [scored]);

  const selectedUnits = selected.map((id) => units.find((unit) => unit.id === id)).filter(Boolean) as Unit[];
  const quoteOptions = selectedUnits.map((unit) => {
    const project = liveProjectById[unit.projectId];
    return { unit, project, ...calculateQuoteOption(unit, project, unitAdjustments[unit.id] || {}, { paymentMode, fx, downPercent, term, parkingChoice: parkingChoices[unit.id] }) };
  });
  const invalidParkingChoice = selectedUnits.some((unit) => unit.parking === 0 && parkingChoices[unit.id]?.enabled && !(Number(parkingChoices[unit.id]?.priceUSD) > 0));
  const activeFilters = [query, budget, capital, monthly, location, developer, projectFilter, bedrooms, minM2, stage].filter((value) => value !== "").length;
  const openProject = projectOpen ? liveProjectById[projectOpen] : null;

  const suggestedMissing = useMemo<MissingSuggestion[]>(() => {
    const taskById = new Map(missingTasks.map((task) => [task.id, task]));
    const received = new Set(intakes.map((item) => `${item.projectId}:${item.documentType}`));
    const rows: MissingSuggestion[] = [];
    const add = (project: Project, field: string, label: string, reason: string, priority: "Alta" | "Media") => {
      const id = `${project.id}:${field}`;
      rows.push({ id, projectId: project.id, developer: project.developer, projectName: project.name, field, label, reason, priority, status: taskById.get(id)?.status || "Pendiente" });
    };
    liveProjects.forEach((project) => {
      const resolved = new Set(project.resolvedFields || []);
      const projectUnits = units.filter((unit) => unit.projectId === project.id && unit.status !== "Vendido");
      const uncertainDelivery = /requiere|confirmar|pendiente/i.test(project.delivery);
      if (!resolved.has("inventoryAudit") && project.inventoryAudit?.pending.length) add(project, "inventoryAudit", "Pendientes de auditoría de inventario", project.inventoryAudit.pending.join(" "), "Alta");
      if (!resolved.has("delivery") && uncertainDelivery) add(project, "delivery", "Fecha de entrega confirmada", "La fecha actual es incompleta o contradictoria.", "Alta");
      if (!resolved.has("validation") && project.confidence !== "Confirmado") add(project, "validation", "Validación comercial vigente", "El proyecto todavía figura como parcial o requiere confirmación.", "Alta");
      if (!resolved.has("priceList") && !project.priceList && !received.has(`${project.id}:Lista de precios`)) add(project, "priceList", "Lista de precios y disponibilidad", "No hay una lista comercial vinculada.", "Alta");
      if (!resolved.has("units") && !projectUnits.length) add(project, "units", "Unidades disponibles estructuradas", "Todavía no hay unidades cargadas para comparar.", "Alta");
      if (!resolved.has("plans") && !project.plansFolder && !received.has(`${project.id}:Planos`)) add(project, "plans", "Planos por tipología", "No se registró una carpeta o archivo de planos.", "Media");
      if (!resolved.has("renders") && !project.mediaFolder && !received.has(`${project.id}:Renders y fotos`)) add(project, "renders", "Renders y fotografías", "No se registró material visual separado del brochure.", "Media");
      if (!resolved.has("financing") && !received.has(`${project.id}:Financiación`) && !projectUnits.some((unit) => unit.downPayment || unit.monthlyPayment)) add(project, "financing", "Plan oficial de financiación", "Faltan entrega, cuotas, refuerzos o saldo contra entrega.", "Alta");
    });
    return rows.sort((a, b) => Number(a.status === "Resuelto") - Number(b.status === "Resuelto") || Number(b.priority === "Alta") - Number(a.priority === "Alta") || a.developer.localeCompare(b.developer));
  }, [intakes, liveProjects, missingTasks]);
  const visibleMissing = suggestedMissing.filter((item) => (!missingDeveloper || item.developer === missingDeveloper) && (showMediumMissing || item.priority === "Alta"));
  const intakeReady = intakeSourceMode === "drive" ? Boolean(intakeUrl.trim()) : Boolean(intakeFile);
  const criticalMissingCount = suggestedMissing.filter((item) => item.priority === "Alta" && item.status !== "Resuelto").length;

  function toggleUnit(id: string) {
    if (selected.includes(id)) {
      setSelected((current) => current.filter((value) => value !== id));
      setUnitAdjustments((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setParkingChoices((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }
    setSelected((current) => current.length < 5 ? [...current, id] : current);
  }

  function updateUnitAdjustment(id: string, updates: Partial<QuoteAdjustment>) {
    setUnitAdjustments((current) => ({ ...current, [id]: { ...current[id], ...updates } }));
  }

  function updateParkingChoice(unit: Unit, updates: Partial<ParkingChoice>) {
    const project = liveProjectById[unit.projectId];
    setParkingChoices((current) => ({
      ...current,
      [unit.id]: {
        enabled: false,
        priceUSD: project?.parkingPriceUSD ? String(project.parkingPriceUSD) : "",
        ...current[unit.id],
        ...updates,
      },
    }));
  }

  function clearFilters() {
    setBudget(""); setCapital(""); setMonthly(""); setLocation(""); setDeveloper(""); setProjectFilter(""); setBedrooms(""); setMinM2(""); setStage(""); setQuery("");
  }

  async function saveAndPrint() {
    if (!selectedUnits.length || savingProposal) return;
    setSavingProposal(true);
    try {
      const response = await fetch("/api/proposals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientName, advisor, selectedUnitIds: selected, downPercent, termMonths: term, fxRate: fx, paymentMode, quoteOptions: quoteOptions.map(({ unit, project, ...values }) => ({ unitId: unit.id, projectId: project.id, ...values })) }) });
      if (response.ok) {
        const payload = await response.json();
        setHistory((current) => [payload.proposal, ...current]);
      }
    } finally {
      setSavingProposal(false);
      window.setTimeout(() => window.print(), 50);
    }
  }

  async function saveEdit() {
    if (!editValue.trim() || savingEdit) return;
    setSavingEdit(true);
    const currentProject = liveProjectById[editProjectId];
    try {
      const response = await fetch("/api/overrides", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entityType: "project", entityId: editProjectId, field: editField, previousValue: String(currentProject?.[editField as keyof Project] || ""), newValue: editValue.trim(), sourceUrl: editSource.trim() }) });
      if (response.ok) {
        const payload = await response.json();
        setOverrides((current) => [...current, payload.override]);
        setEditValue(""); setEditSource(""); setEditOpen(false);
      }
    } finally { setSavingEdit(false); }
  }

  async function submitIntake() {
    if (savingIntake || !intakeReady) return;
    setSavingIntake(true); setIntakeMessage("");
    const form = new FormData();
    form.set("developer", intakeDeveloper);
    form.set("projectId", intakeProjectId);
    form.set("documentType", intakeDocumentType);
    form.set("note", intakeNote);
    if (intakeSourceMode === "drive") form.set("sourceUrl", intakeUrl.trim());
    if (intakeSourceMode === "file" && intakeFile) form.set("file", intakeFile);
    try {
      const response = await fetch("/api/intake", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo registrar");
      setIntakes((current) => [payload.intake, ...current]);
      setIntakeUrl(""); setIntakeFile(null); setIntakeNote("");
      setIntakeMessage("Documento registrado y agregado al control del proyecto.");
    } catch (error) {
      setIntakeMessage(error instanceof Error ? error.message : "No se pudo registrar el documento");
    } finally { setSavingIntake(false); }
  }

  async function updateMissing(item: MissingSuggestion, status: string) {
    const existing = missingTasks.find((task) => task.id === item.id);
    const response = await fetch("/api/missing", {
      method: existing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(existing ? { id: item.id, status } : { ...item, status }),
    });
    if (!response.ok) return;
    const payload = await response.json();
    setMissingTasks((current) => existing
      ? current.map((task) => task.id === item.id ? { ...task, status, updatedAt: payload.updatedAt } : task)
      : [{ ...item, status, updatedAt: new Date().toISOString() }, ...current]);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setTab("buscar")} aria-label="Ir al buscador">
          <Image unoptimized src="/brand/vantage-logo-oficial-2026.png" alt="Logo oficial de Vantage" width={897} height={571} priority/>
          <span><small>PROPERTY OS</small><em>PORTAFOLIO INTERNO</em></span>
        </button>
        <nav>
          <small className="nav-label">COMERCIAL</small>
          <button className={tab === "buscar" ? "active" : ""} onClick={() => setTab("buscar")}><Icon name="search"/><span>Buscar</span></button>
          <button className={tab === "proyectos" ? "active" : ""} onClick={() => setTab("proyectos")}><Icon name="building"/><span>Portafolio</span><em>{liveProjects.length}</em></button>
          <button className={tab === "propuesta" ? "active" : ""} onClick={() => setTab("propuesta")}><Icon name="file"/><span>Propuestas</span>{selected.length > 0 && <em className="gold">{selected.length}</em>}</button>
          <small className="nav-label management">GESTIÓN</small>
          <button className={tab === "datos" ? "active" : ""} onClick={() => { setTab("datos"); setDataView("faltantes"); }}><Icon name="alert"/><span>Datos faltantes</span><em className="alert-count">{criticalMissingCount}</em></button>
        </nav>
        <div className="sidebar-status">
          <div className="status-orb"/><div><strong>Base conectada</strong><small>{liveProjects.length} proyectos · {units.filter((unit) => unit.status === "Disponible").length} unidades</small></div>
        </div>
        <div className="user-card"><span className="avatar">{(userEmail || "M")[0].toUpperCase()}</span><div><strong>{userEmail ? userEmail.split("@")[0] : "Maxi / Benja"}</strong><small>Administrador</small></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-heading">
            <Image unoptimized src="/brand/vantage-logo-oficial-2026.png" alt="Logo oficial de Vantage" width={897} height={571} priority/>
            <div><p className="eyebrow">VANTAGE REAL ESTATE · USO INTERNO</p><h1>{tab === "buscar" ? "Encontrá la opción correcta" : tab === "proyectos" ? "Portafolio" : tab === "propuesta" ? "Crear propuesta" : "Datos faltantes y archivos"}</h1></div>
          </div>
          <div className="top-actions">
            <label className="fx-field">USD 1 = ₲ <input aria-label="Cotización del dólar" type="number" value={fx} onChange={(event) => setFx(Number(event.target.value) || 7900)}/></label>
            <button className="icon-button mobile-menu" onClick={() => setFiltersOpen(!filtersOpen)}><Icon name="filter"/><span>{activeFilters}</span></button>
          </div>
        </header>

        {tab === "buscar" && criticalMissingCount > 0 && <div className="critical-data-banner"><span className="critical-data-icon"><Icon name="alert"/></span><div><strong>{criticalMissingCount} datos importantes necesitan confirmación</strong><p>Fechas de entrega, financiación, disponibilidad o documentación pendiente.</p></div><button onClick={() => { setTab("datos"); setDataView("faltantes"); }}>Ver datos necesarios <Icon name="arrow" size={15}/></button></div>}

        {tab === "buscar" && (
          <div className="search-layout">
            <section className={`filter-panel ${filtersOpen ? "open" : ""}`}>
              <div className="panel-title"><div><p className="eyebrow">PERFIL DEL CLIENTE</p><h2>Definir búsqueda</h2></div>{activeFilters > 0 && <button onClick={clearFilters}>Limpiar</button>}</div>
              <label className="input-label">Búsqueda rápida<div className="search-box"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Proyecto, barrio o tipología"/></div></label>
              <label className="input-label">Desarrolladora<select value={developer} onChange={(event) => { setDeveloper(event.target.value); setProjectFilter(""); }}><option value="">Todas las desarrolladoras</option>{developers.map((developerName) => <option key={developerName}>{developerName}</option>)}</select></label>
              <label className="input-label">Proyecto<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}><option value="">Todos los proyectos</option>{developerProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <label className="input-label">Presupuesto máximo (USD)<div className="prefix-input"><span>$</span><input inputMode="numeric" value={budget} onChange={(event) => setBudget(event.target.value.replace(/\D/g, ""))} placeholder="150.000"/></div></label>
              <label className="input-label">Ubicación<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ej. Recoleta, Ykua Satí"/></label>
              <label className="input-label">Dormitorios<select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}><option value="">Cualquiera</option><option value="0">Mono / Oficina</option><option value="1">1 dormitorio</option><option value="2">2 dormitorios</option><option value="3">3 dormitorios</option></select></label>
              <button className="advanced-toggle" onClick={() => setAdvancedFiltersOpen((current) => !current)}><Icon name="filter" size={15}/><span>{advancedFiltersOpen ? "Ocultar filtros avanzados" : "Más filtros"}</span><Icon name="arrow" size={14}/></button>
              {advancedFiltersOpen && <div className="advanced-filters">
                <div className="field-grid two"><label className="input-label">Capital inicial (USD)<div className="prefix-input"><span>$</span><input inputMode="numeric" value={capital} onChange={(event) => setCapital(event.target.value.replace(/\D/g, ""))} placeholder="30.000"/></div></label><label className="input-label">Cuota máxima (USD)<div className="prefix-input"><span>$</span><input inputMode="numeric" value={monthly} onChange={(event) => setMonthly(event.target.value.replace(/\D/g, ""))} placeholder="2.000"/></div></label></div>
                <div className="field-grid two"><label className="input-label">Mínimo m²<input inputMode="decimal" value={minM2} onChange={(event) => setMinM2(event.target.value.replace(/[^0-9.]/g, ""))} placeholder="50"/></label><label className="input-label">Etapa<select value={stage} onChange={(event) => setStage(event.target.value)}><option value="">Todas</option><option>Prepozo</option><option>Pozo</option><option>Semiterminado</option><option>Terminado</option></select></label></div>
                <div className="scenario-box"><div><span>Escenario estimado</span><small>Sin plan oficial</small></div><label>Entrega <strong>{downPercent}%</strong><input type="range" min="10" max="50" step="5" value={downPercent} onChange={(event) => setDownPercent(Number(event.target.value))}/></label><label>Plazo <strong>{term} meses</strong><input type="range" min="12" max="120" step="6" value={term} onChange={(event) => setTerm(Number(event.target.value))}/></label></div>
              </div>}
              <button className="primary mobile-apply" onClick={() => setFiltersOpen(false)}>Ver {scored.length} opciones</button>
            </section>

            <section className="results-panel">
              <div className="result-summary"><div><span className="result-count">{scored.length}</span><div><strong>{nearMode ? "alternativas con 70% o más de coincidencia" : "opciones que cumplen todos los filtros"}</strong><small>{nearMode ? "No hubo coincidencias exactas. Cada diferencia se muestra claramente." : scored.length ? budget ? `Ordenadas desde la más cercana a ${usd.format(Number(budget))} hacia abajo.` : "Todas estas unidades cumplen el 100% de los criterios." : "No hay coincidencias exactas ni alternativas que alcancen el 70%."}</small></div></div><div className="legend"><i className={nearMode ? "near-dot" : "exact-dot"}/> {nearMode ? "Coincidencia mínima 70%" : "Coincidencia exacta"}</div></div>
              <div className={`recommendation-strip ${!scored.length ? "no-match" : nearMode ? "near-match" : ""}`}><span className="spark">{scored.length ? "✦" : "!"}</span><div><strong>{scored.length ? nearMode ? "Mejor alternativa cercana" : "Mejor opción dentro de tus criterios" : "No encontramos una opción adecuada"}</strong><p>{scored[0] ? nearMode ? `${scored[0].project.name} · Unidad ${scored[0].unit.code} alcanza ${scored[0].score}% de coincidencia. Revisá las diferencias antes de cotizar.` : budget ? `${scored[0].project.name} · Unidad ${scored[0].unit.code} es la opción más cercana a tu presupuesto sin superarlo.` : `${scored[0].project.name} · Unidad ${scored[0].unit.code} es la opción de menor precio que cumple todos los filtros.` : "No mostramos resultados por debajo del 70% ni propiedades de otra ubicación."}</p></div></div>
              <div className="results-directory">
                {!scored.length && <div className="empty-results"><span><Icon name="search" size={25}/></span><div><h2>No hay unidades que cumplan todos los criterios</h2><p>Podés modificar un filtro o limpiar la búsqueda. No incluimos opciones aproximadas ni propiedades fuera de tus límites.</p></div><button className="secondary" onClick={clearFilters}>Limpiar filtros</button></div>}
                {scoredGroups.map((developerGroup) => <section className="developer-result-group" key={developerGroup.developer}>
                  <div className="developer-result-head"><div><span>DESARROLLADORA</span><h2>{developerGroup.developer}</h2></div><strong>{developerGroup.projects.reduce((total, group) => total + group.length, 0)} opciones</strong></div>
                  {developerGroup.projects.map((projectItems) => <div className="project-result-group" key={projectItems[0].project.id}>
                    <button className="project-result-head" onClick={() => setProjectOpen(projectItems[0].project.id)}><span><ProjectMark project={projectItems[0].project}/><span><small>PROYECTO</small><strong>{projectItems[0].project.name}</strong><em>{projectItems[0].project.location}</em></span></span><span>{projectItems.length} unidad{projectItems.length === 1 ? "" : "es"}<Icon name="arrow" size={15}/></span></button>
                    <div className="unit-list">{projectItems.map(({ unit, project, score, exact, gaps, wins, downUSD, monthlyUSD }) => (
                  <article className={`unit-card ${scored[0]?.unit.id === unit.id ? "recommended" : ""}`} key={unit.id}>
                    {scored[0]?.unit.id === unit.id && <div className="recommend-badge">{nearMode ? "MEJOR ALTERNATIVA" : "MEJOR ENCAJE"}</div>}
                    <div className="unit-main">
                      <div className="unit-code"><small>UNIDAD</small><strong>{unit.code}</strong></div>
                      <div className="unit-identity"><div className="title-row"><strong>{unit.type}</strong><span className={`stage ${project.stage.toLowerCase().replace(" ", "-")}`}>{project.stage}</span></div><p>Piso {unit.floor} · {project.name}</p><div className="unit-tags"><span>{formatArea(unit)} {unit.areaLabel || "totales"}</span>{unit.balconyM2 > 0 && <span>{unit.balconyM2.toFixed(1)} m² balcón</span>}<span>{formatParking(unit)}</span>{areaDetails(unit) && <span>{areaDetails(unit)}</span>}</div></div>
                      <div className="unit-price"><small>Precio de lista</small><strong>{formatPrice(unit, fx)}</strong><span>{unit.currency === "USD" ? pyg.format(unit.price * fx) : usd.format(unit.price / fx)}</span></div>
                      <div className={`score-ring ${exact ? "exact" : "near"}`} style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}><div><strong>{score}%</strong><small>encaje</small></div></div>
                    </div>
                    <div className="match-details">
                      <div className="fit-reasons">{wins.slice(0, 3).map((win) => <span className="win" key={win}><Icon name="check" size={14}/>{win}</span>)}{gaps.slice(0, 2).map((gap) => <span className="gap" key={gap}>{gap}</span>)}{!wins.length && !gaps.length && <span className="win"><Icon name="check" size={14}/>Disponible y con precio vigente</span>}</div>
                      <div className="payment-preview"><span>Entrega <strong>{usd.format(downUSD)}</strong></span><span>Cuota {unit.monthlyPayment ? "oficial" : "estimada"} <strong>{usd.format(monthlyUSD)}</strong></span></div>
                      <div className="card-actions"><button className="ghost" onClick={() => setProjectOpen(project.id)}>Ver ficha</button><button className={selected.includes(unit.id) ? "selected-button" : "secondary"} onClick={() => toggleUnit(unit.id)}>{selected.includes(unit.id) ? <><Icon name="check"/> Seleccionada</> : <><Icon name="plus"/> Propuesta</>}</button></div>
                    </div>
                  </article>))}</div>
                  </div>)}
                </section>)}
              </div>
            </section>
          </div>
        )}

        {tab === "proyectos" && (
          <section className="content-section">
            <div className="section-intro"><div><p>Los {liveProjects.length} desarrollos actuales, con inventario, fuentes y estado documental.</p></div><div className="portfolio-stats"><span><strong>{liveProjects.length}</strong> proyectos</span><span><strong>{units.filter((unit) => unit.status === "Disponible").length}</strong> unidades cargadas</span><span><strong>{developers.length}</strong> desarrolladoras</span></div></div>
            <div className="developer-overview">
              {portfolioGroups.map((group, index) => <article key={group.developer}><span>0{index + 1}</span><div><small>DESARROLLADORA</small><strong>{group.developer}</strong><em>{group.projects.length} proyecto{group.projects.length === 1 ? "" : "s"}</em></div></article>)}
            </div>
            <div className="portfolio-directory">
              {portfolioGroups.map((group) => <section className="developer-section" key={group.developer}><div className="developer-section-head"><div><span>DESARROLLADORA</span><h2>{group.developer}</h2></div><p>{group.projects.length} proyecto{group.projects.length === 1 ? "" : "s"} · {units.filter((unit) => group.projects.some((project) => project.id === unit.projectId) && unit.status !== "Vendido").length} unidades cargadas</p></div><div className="project-grid">
              {group.projects.map((project) => {
                const projectUnits = units.filter((unit) => unit.projectId === project.id && unit.status !== "Vendido");
                const from = projectUnits.length ? Math.min(...projectUnits.map((unit) => unit.currency === "USD" ? unit.price : unit.price / fx)) : null;
                return <article className="project-card" key={project.id} onClick={() => setProjectOpen(project.id)}><div className={`project-card-top ${project.imageUrl ? "has-image" : ""}`} style={{ "--project-color": project.color } as React.CSSProperties}>{project.imageUrl && <Image unoptimized fill sizes="(max-width: 900px) 100vw, 33vw" className="project-card-image" src={project.imageUrl} alt={`Imagen de ${project.name}`}/>}<ProjectMark project={project} large/><span className={`confidence confidence-${project.confidence === "Requiere confirmación" ? "red" : "amber"}`}>{project.confidence}</span>{!project.imageUrl && <div className="building-lines"><i/><i/><i/><i/></div>}</div><div className="project-card-body"><small>PROYECTO</small><h3>{project.name}</h3><p><Icon name="map" size={15}/>{project.location}</p><div className="project-metrics"><span><small>Desde</small><strong>{from ? usd.format(from) : "Por confirmar"}</strong></span><span><small>Unidades</small><strong>{projectUnits.length || "—"}</strong></span></div><div className="project-footer"><Freshness date={project.updatedAt} label={project.sourceDateLabel}/><Icon name="arrow"/></div></div></article>;
              })}
            </div></section>)}
            </div>
          </section>
        )}

        {tab === "propuesta" && (
          <section className="proposal-workspace">
            <div className="proposal-controls">
              <div className="panel-title"><div><p className="eyebrow">PROPUESTA COMERCIAL</p><h2>Preparar documento</h2></div><span>{selectedUnits.length}/5 opciones</span></div>
              <label className="input-label">Nombre del cliente<input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Ej. Carmen Moreira"/></label>
              <label className="input-label">Asesor o firma<input value={advisor} onChange={(event) => setAdvisor(event.target.value)} /></label>
              <label className="input-label">Forma de pago<select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}><option value="financiado">Financiado</option><option value="contado">Al contado</option></select></label>
              {paymentMode === "financiado" && <div className="field-grid two"><label className="input-label">Entrega estimada<select value={downPercent} onChange={(event) => setDownPercent(Number(event.target.value))}><option value="20">20%</option><option value="30">30%</option><option value="40">40%</option></select></label><label className="input-label">Plazo<select value={term} onChange={(event) => setTerm(Number(event.target.value))}><option value="24">24 meses</option><option value="30">30 meses</option><option value="60">60 meses</option><option value="90">90 meses</option><option value="120">120 meses</option></select></label></div>}
              <p className="helper">Definí el descuento y la entrega de cada opción. El descuento se aplica al departamento; la cochera se suma por separado.</p>
              <div className="selected-stack">
                {selectedUnits.map((unit, index) => {
                  const project = liveProjectById[unit.projectId];
                  const parkingChoice = parkingChoices[unit.id] || { enabled: false, priceUSD: project?.parkingPriceUSD ? String(project.parkingPriceUSD) : "" };
                  return <div className="selected-option-card" key={unit.id}>
                    <div className="selected-row"><span>{index + 1}</span><div><strong>{project.name}</strong><small>Unidad {unit.code} · {unit.type}</small></div><button onClick={() => toggleUnit(unit.id)} aria-label="Quitar opción"><Icon name="close" size={16}/></button></div>
                    <div className="option-adjustments">
                      <label className="input-label">Descuento de esta unidad (%)<input type="number" min="0" max="100" step="any" value={unitAdjustments[unit.id]?.discountPercent ?? ""} onChange={(event) => updateUnitAdjustment(unit.id, { discountPercent: event.target.value })} placeholder="0" aria-label={`Descuento de ${project.name} unidad ${unit.code}`}/></label>
                      <label className="input-label">Entrega del proyecto<input type="text" value={unitAdjustments[unit.id]?.delivery ?? quoteDelivery(project.delivery)} onChange={(event) => updateUnitAdjustment(unit.id, { delivery: event.target.value })} placeholder="Ej. Diciembre de 2028 o entrega inmediata" aria-label={`Entrega de ${project.name} unidad ${unit.code}`}/></label>
                    </div>
                    {unit.parking > 0 ? <p className="parking-included"><Icon name="check" size={13}/> {formatParking(unit)} incluida en el precio</p> : <div className="parking-choice"><label><input type="checkbox" checked={parkingChoice.enabled} onChange={(event) => updateParkingChoice(unit, { enabled: event.target.checked })}/><span>Agregar 1 cochera{project.parkingIncludesStorage ? " + baulera" : ""}</span></label>{parkingChoice.enabled && <label className="parking-price"><span>Precio de cochera (USD)</span><input type="number" min="1" step="100" value={parkingChoice.priceUSD} onChange={(event) => updateParkingChoice(unit, { priceUSD: event.target.value })} placeholder="Ej. 16000"/></label>}</div>}
                  </div>;
                })}
                {!selectedUnits.length && <div className="empty-selection"><Icon name="file" size={30}/><strong>Todavía no seleccionaste opciones</strong><p>Volvé al buscador y agregá entre 1 y 5 unidades.</p><button className="secondary" onClick={() => setTab("buscar")}>Ir al buscador</button></div>}
              </div>
              {invalidParkingChoice && <p className="parking-error">Ingresá el precio confirmado de la cochera antes de exportar.</p>}
              <button className="primary export-button" disabled={!selectedUnits.length || savingProposal || invalidParkingChoice} onClick={saveAndPrint}><Icon name="download"/> {savingProposal ? "Guardando…" : "Exportar PDF para WhatsApp"}</button>
              <p className="helper">El documento siempre indicará que precios y disponibilidad están sujetos a confirmación.</p>
              <div className="history-block"><div className="history-title"><Icon name="history"/><strong>Historial reciente</strong></div>{history.slice(0, 5).map((item) => <div className="history-row" key={item.id}><div><strong>{item.clientName}</strong><small>{item.selectedUnitIds.length} opciones · {new Date(item.createdAt).toLocaleDateString("es-PY")}</small></div><span>{item.createdBy.split("@")[0]}</span></div>)}{!history.length && <p>Tus propuestas exportadas aparecerán aquí.</p>}</div>
            </div>
            <div className="proposal-preview-wrap">
              <div className="proposal-preview" id="proposal-print">
                {quoteOptions.map(({ unit, project, unitPriceUSD, appliedDiscountPercent, optionalParkingPriceUSD, discountUSD, finalPriceUSD, usesOfficialPlan, delivery, payment, projectDelivery }) => {
                  const imageUrl = unit.imageUrl || project.imageUrl;
                  const balanceOnDelivery = unit.balanceOnDelivery ? (unit.currency === "USD" ? unit.balanceOnDelivery : unit.balanceOnDelivery / fx) : 0;
                  const installments = usesOfficialPlan && payment > 0 ? Math.max(1, Math.round((unitPriceUSD - delivery - balanceOnDelivery) / payment)) : term;
                  const parkingLabel = unit.parking > 0 ? "Incluida" : optionalParkingPriceUSD > 0 ? `Opcional · ${budgetUsd(optionalParkingPriceUSD)}` : "No incluida";
                  return <article className="official-quote-sheet" key={unit.id}>
                    <header className="official-quote-header">
                      <div className="official-quote-brand"><Image unoptimized className="official-quote-logo" width={897} height={571} src="/brand/vantage-logo.png" alt="Vantage Real Estate"/></div>
                    </header>
                    <div className="official-quote-body">
                      <section className={`official-hero ${imageUrl ? "has-image" : "without-image"}`}>
                        {imageUrl && <div className="official-photo has-image"><Image unoptimized fill sizes="420px" src={imageUrl} alt={`Fachada oficial de ${project.name}`}/></div>}
                        <div className="official-summary">
                          <p className="official-kicker">{project.stage} · UNIDAD DISPONIBLE</p>
                          <h2>{project.name}</h2>
                          <p className="official-type">{proposalType(unit)} · {formatArea(unit, 2).replace(".", ",")}</p>
                          <p className="official-unit">Unidad {unit.code} · Piso {unit.floor}</p>
                          <div className="official-price"><small>{appliedDiscountPercent > 0 || optionalParkingPriceUSD > 0 ? "PRECIO FINAL" : "PRECIO DE LISTA"}</small><strong>{budgetUsd(finalPriceUSD)}</strong>{unit.currency === "PYG" && <span>{pyg.format(finalPriceUSD * fx)}</span>}</div>
                          <div className="official-badges"><span>{project.stage.toUpperCase()}</span>{projectDelivery && <span>ENTREGA · {proposalDelivery(projectDelivery)}</span>}</div>
                          <p className="official-location"><Icon name="map" size={14}/>{project.location}</p>
                        </div>
                      </section>
                      <section className="official-facts">
                        <span><small>TIPOLOGÍA</small><strong>{proposalType(unit)}</strong></span>
                        <span><small>SUPERFICIE</small><strong>{formatArea(unit, 2).replace(".", ",")}</strong></span>
                        <span><small>INCLUYE</small><strong>{proposalIncludes(unit)}</strong></span>
                        <span><small>COCHERA</small><strong>{parkingLabel}</strong></span>
                      </section>
                      <section className="official-payment">
                        <div className="official-section-head"><div><small>PLAN DE PAGO</small><h3>{paymentMode === "contado" ? "Pago al contado" : usesOfficialPlan ? "Plan oficial de la desarrolladora" : "Plan estimado"}</h3></div><strong>{budgetUsd(finalPriceUSD)}</strong></div>
                        {paymentMode === "contado" ? <div className="official-payment-steps single"><div className="payment-index">1</div><div><small>PAGO ÚNICO</small><strong>{budgetUsd(finalPriceUSD)}</strong><span>Al confirmar la operación</span></div></div> : <div className="official-payment-steps">
                          <div className="official-payment-step"><div className="payment-index">1</div><div><small>ENTREGA INICIAL</small><strong>{budgetUsd(delivery)}</strong><span>Al reservar</span></div></div>
                          <div className="official-payment-step"><div className="payment-index">2</div><div><small>DURANTE OBRA</small><strong>{budgetUsd(payment)}</strong><span>{installments} cuotas{usesOfficialPlan ? "" : " estimadas"}</span></div></div>
                          {balanceOnDelivery > 0 && <div className="official-payment-step"><div className="payment-index">3</div><div><small>CONTRA ENTREGA</small><strong>{budgetUsd(balanceOnDelivery)}</strong><span>Saldo final</span></div></div>}
                        </div>}
                        {(appliedDiscountPercent > 0 || optionalParkingPriceUSD > 0) && <p className="official-price-note">{appliedDiscountPercent > 0 && <>Descuento aplicado: {appliedDiscountPercent}% (−{budgetUsd(discountUSD)}).</>} {optionalParkingPriceUSD > 0 && <>La cochera opcional está incluida en el precio final.</>}</p>}
                      </section>
                      <div className="official-links">{isDirectBrochureUrl(project.brochure) && <a href={project.brochure} target="_blank" rel="noopener noreferrer"><Icon name="file" size={15}/> Ver brochure</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.mapQuery)}`} target="_blank" rel="noopener noreferrer"><Icon name="map" size={15}/> Ver ubicación</a></div>
                      {(clientName || advisor) && <div className="official-recipient"><span><small>CLIENTE</small><strong>{clientName || "A confirmar"}</strong></span><span><small>ASESOR</small><strong>{advisor}</strong></span></div>}
                      <div className="official-disclaimer"><p>Precio, disponibilidad y condiciones sujetos a confirmación final con la desarrolladora. Documento informativo, sin validez contractual.{!usesOfficialPlan && paymentMode === "financiado" ? " Las cuotas indicadas son estimativas y deben validarse antes de presentar la propuesta." : ""}{unit.currency === "PYG" ? ` Cotización referencial: USD 1 = ${pyg.format(fx).replace("PYG", "Gs.")}.` : ""}</p></div>
                    </div>
                  </article>;
                })}
              </div>
            </div>
          </section>
        )}

        {tab === "datos" && (
          <section className="content-section data-section">
            <div className="data-center-head">
              <div><p className="eyebrow">GESTIÓN DOCUMENTAL</p><h2>Una sola entrada para toda la información</h2><p>Cargá, revisá faltantes y controlá el estado sin recorrer todo el sistema.</p></div>
              <div className="data-tabs"><button className={dataView === "faltantes" ? "active" : ""} onClick={() => setDataView("faltantes")}><Icon name="alert"/> Datos necesarios <span>{suggestedMissing.filter((item) => item.status !== "Resuelto").length}</span></button><button className={dataView === "cargar" ? "active" : ""} onClick={() => setDataView("cargar")}><Icon name="upload"/> Cargar archivos</button><button className={dataView === "estado" ? "active" : ""} onClick={() => setDataView("estado")}><Icon name="database"/> Estado general</button></div>
            </div>

            {dataView === "cargar" && <div className="intake-layout">
              <div className="intake-card">
                <div className="intake-card-head"><span className="kpi-icon blue"><Icon name="folder"/></span><div><h3>Agregar documentación</h3><p>Primero ubicamos la fuente; luego queda dentro del proyecto correcto.</p></div></div>
                <div className="field-grid two"><label className="input-label">Desarrolladora<select value={intakeDeveloper} onChange={(event) => { const value = event.target.value; setIntakeDeveloper(value); setIntakeProjectId(liveProjects.find((project) => project.developer === value)?.id || ""); }}>{developers.map((developerName) => <option key={developerName}>{developerName}</option>)}</select></label><label className="input-label">Proyecto<select value={intakeProjectId} onChange={(event) => setIntakeProjectId(event.target.value)}>{intakeProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>
                <label className="input-label">Tipo de material<select value={intakeDocumentType} onChange={(event) => setIntakeDocumentType(event.target.value)}><option>Brochure</option><option>Lista de precios</option><option>Planos</option><option>Renders y fotos</option><option>Financiación</option><option>Amenities y ficha técnica</option><option>Video o recorrido</option><option>Otro</option></select></label>
                <div className="source-switch"><button className={intakeSourceMode === "drive" ? "active" : ""} onClick={() => setIntakeSourceMode("drive")}><span className="drive-mini">△</span> Enlace de Drive</button><button className={intakeSourceMode === "file" ? "active" : ""} onClick={() => setIntakeSourceMode("file")}><Icon name="upload"/> Subir archivo</button></div>
                {intakeSourceMode === "drive" ? <label className="input-label">Enlace de archivo o carpeta<input value={intakeUrl} onChange={(event) => setIntakeUrl(event.target.value)} placeholder="https://drive.google.com/drive/folders/..."/><small className="field-help">Compartilo como “cualquier persona con el enlace” para poder revisarlo.</small></label> : <label className="file-drop"><input type="file" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.mp4" onChange={(event) => setIntakeFile(event.target.files?.[0] || null)}/><Icon name="upload" size={22}/><strong>{intakeFile?.name || "Elegir archivo"}</strong><span>PDF, Excel, imágenes o video</span></label>}
                <label className="input-label">Nota opcional<input value={intakeNote} onChange={(event) => setIntakeNote(event.target.value)} placeholder="Ej. Lista actualizada de agosto"/></label>
                <button className="primary intake-submit" disabled={savingIntake || !intakeReady} onClick={submitIntake}><Icon name="check"/> {savingIntake ? "Registrando…" : "Registrar y revisar"}</button>
                {intakeMessage && <p className="intake-message">{intakeMessage}</p>}
              </div>
              <div className="intake-side">
                <div className="workflow-card"><p className="eyebrow">CÓMO FUNCIONA</p><ol><li><span>1</span><div><strong>Ubicamos</strong><p>Desarrolladora, proyecto y tipo de material.</p></div></li><li><span>2</span><div><strong>Revisamos cobertura</strong><p>El sistema compara lo recibido con la ficha actual.</p></div></li><li><span>3</span><div><strong>Aprobamos cambios</strong><p>Maxi o Benja confirma antes de modificar datos comerciales.</p></div></li></ol><div className="automation-note"><Icon name="alert"/><p>Una carpeta completa de Drive se registra como fuente. La lectura profunda automática de todos sus archivos requiere una conexión autorizada; mientras tanto, el control queda ordenado y manual.</p></div></div>
                <div className="recent-intakes"><div className="table-head"><div><h3>Ingresos recientes</h3><p>Últimos materiales registrados.</p></div><span>{intakes.length}</span></div>{intakes.slice(0, 5).map((item) => <div className="intake-row" key={item.id}><span className="intake-type"><Icon name={item.sourceType === "Archivo" ? "file" : "folder"}/></span><div><strong>{liveProjectById[item.projectId]?.name || item.projectId}</strong><small>{item.documentType} · {item.sourceType}</small></div><i>{item.status}</i></div>)}{!intakes.length && <div className="empty-intakes"><strong>Todavía no hay ingresos</strong><p>El primer archivo o enlace aparecerá acá.</p></div>}</div>
              </div>
            </div>}

            {dataView === "faltantes" && <div className="missing-view">
              <div className="missing-callout"><span><Icon name="alert"/></span><div><h3>Estos son los datos que Vantage necesita solicitar</h3><p>La lista se genera por desarrolladora y proyecto. Empezá por los de prioridad alta; cuando recibas la respuesta, cargala y marcá el punto como resuelto.</p></div><button className="primary" onClick={() => setDataView("cargar")}><Icon name="upload"/> Cargar respuesta</button></div>
              <div className="missing-summary"><article><small>Faltantes activos</small><strong>{suggestedMissing.filter((item) => item.status !== "Resuelto").length}</strong></article><article><small>Prioridad alta</small><strong>{suggestedMissing.filter((item) => item.priority === "Alta" && item.status !== "Resuelto").length}</strong></article><article><small>Ya solicitados</small><strong>{suggestedMissing.filter((item) => item.status === "Solicitado").length}</strong></article><label>Desarrolladora<select value={missingDeveloper} onChange={(event) => setMissingDeveloper(event.target.value)}><option value="">Todas</option>{developers.map((developerName) => <option key={developerName}>{developerName}</option>)}</select></label></div>
              <div className="missing-toolbar"><p>{showMediumMissing ? "Mostrando prioridades altas y medias" : "Mostrando primero lo urgente"}</p><button className="secondary" onClick={() => setShowMediumMissing((current) => !current)}>{showMediumMissing ? "Ver solo urgentes" : "Ver también prioridad media"}</button></div>
              <div className="missing-list">{visibleMissing.map((item) => <article className={`missing-row ${item.status === "Resuelto" ? "resolved" : ""}`} key={item.id}><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span><div className="missing-copy"><small>{item.developer} · {item.projectName}</small><strong>{item.label}</strong><p>{item.reason}</p></div><span className={`missing-status status-${item.status.toLowerCase()}`}>{item.status}</span><div className="missing-actions">{item.status === "Pendiente" && <button className="secondary" onClick={() => updateMissing(item, "Solicitado")}>Marcar solicitado</button>}{item.status === "Solicitado" && <button className="secondary" onClick={() => updateMissing(item, "Resuelto")}><Icon name="check"/> Marcar resuelto</button>}{item.status === "Resuelto" && <button className="ghost" onClick={() => updateMissing(item, "Pendiente")}>Reabrir</button>}</div></article>)}</div>
            </div>}

            {dataView === "estado" && <>
              <div className="audit-note"><Icon name="check"/><div><strong>Auditoría documental · 27/08/2026 · {liveProjects.length} proyectos</strong><p>Consultá el resultado, las correcciones y los pendientes dentro de cada ficha. “Cotejado” significa coincidencia con el documento, no disponibilidad confirmada hoy.</p></div></div>
              <div className="data-table-wrap"><div className="table-head"><div><h2>Estado por desarrolladora y proyecto</h2><p>Vigencia, fuentes y nivel de confirmación.</p></div><button className="secondary" onClick={() => setEditOpen(true)}><Icon name="plus"/> Actualizar dato</button></div><div className="data-table"><div className="data-row header"><span>Proyecto</span><span>Brochure</span><span>Precios</span><span>Vigencia</span><span>Auditoría</span><span/></div>{portfolioGroups.map((group) => <div className="data-developer-block" key={group.developer}><div className="data-developer-row"><strong>{group.developer}</strong><span>{group.projects.length} proyectos</span></div>{group.projects.map((project) => <div className="data-row" key={project.id}><span className="project-cell"><ProjectMark project={project}/><span><strong>{project.name}</strong><small>{project.location}</small></span></span><span className={isDirectBrochureUrl(project.brochure) ? "cell-ok" : "cell-warn"}>{isDirectBrochureUrl(project.brochure) ? <><Icon name="check"/> Archivo directo</> : "Falta archivo directo"}</span><span className={project.priceList ? "cell-ok" : "cell-warn"}>{project.priceList ? <><Icon name="check"/> Localizada</> : "Pendiente"}</span><span><Freshness date={project.updatedAt} label={project.sourceDateLabel}/></span><span><i className={`status-pill ${project.inventoryAudit?.status === "Sin cotejo" ? "red" : "amber"}`}>{project.inventoryAudit?.status || project.confidence}</i></span><span><button className="icon-button" onClick={() => setProjectOpen(project.id)}><Icon name="arrow"/></button></span></div>)}</div>)}</div></div>
              <div className="audit-note"><Icon name="history"/><div><strong>Historial de cambios activado</strong><p>Cada cambio conserva el valor anterior, la fuente, la fecha y el usuario responsable.</p></div></div>
            </>}
          </section>
        )}
      </main>

      {selected.length > 0 && tab !== "propuesta" && <button className="proposal-float" onClick={() => setTab("propuesta")}><span>{selected.length}</span><div><strong>Preparar propuesta</strong><small>Comparar y exportar PDF</small></div><Icon name="arrow"/></button>}

      {openProject && <div className="modal-backdrop" onMouseDown={() => setProjectOpen(null)}><section className="project-modal" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setProjectOpen(null)}><Icon name="close"/></button><div className={`modal-hero ${openProject.imageUrl ? "has-image" : ""}`} style={{ "--project-color": openProject.color } as React.CSSProperties}>{openProject.imageUrl && <Image unoptimized fill sizes="760px" className="modal-hero-image" src={openProject.imageUrl} alt={`Imagen de ${openProject.name}`}/>}<ProjectMark project={openProject} large/><div><small>{openProject.developer}</small><h2>{openProject.name}</h2><p><Icon name="map" size={16}/>{openProject.location}</p></div><span className={`confidence confidence-${openProject.confidence === "Requiere confirmación" ? "red" : "amber"}`}>{openProject.confidence}</span></div><div className="modal-body"><p className="modal-summary">{openProject.summary}</p><div className="modal-facts"><span><small>Etapa</small><strong>{openProject.stage}</strong></span><span><small>Entrega</small><strong>{openProject.delivery}</strong></span><span><small>Información</small><Freshness date={openProject.updatedAt} label={openProject.sourceDateLabel}/></span></div><InventoryAuditDetails project={openProject}/><BrochureDetails project={openProject}/><div className="document-actions">{isDirectBrochureUrl(openProject.brochure) && <a className="secondary" href={openProject.brochure} target="_blank" rel="noreferrer"><Icon name="file"/> Ver brochure</a>}{openProject.priceList && <a className="secondary" href={openProject.priceList} target="_blank" rel="noreferrer"><Icon name="database"/> Lista comercial</a>}{openProject.plansFolder && <a className="secondary" href={openProject.plansFolder} target="_blank" rel="noreferrer"><Icon name="file"/> Planos</a>}{openProject.mediaFolder && <a className="secondary" href={openProject.mediaFolder} target="_blank" rel="noreferrer"><Icon name="folder"/> Renders y fotos</a>}{openProject.videoFolder && <a className="secondary" href={openProject.videoFolder} target="_blank" rel="noreferrer"><Icon name="folder"/> Videos</a>}{openProject.driveFolder && <a className="secondary" href={openProject.driveFolder} target="_blank" rel="noreferrer"><Icon name="folder"/> Carpeta completa</a>}<a className="secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(openProject.mapQuery)}`} target="_blank" rel="noreferrer"><Icon name="map"/> Google Maps</a></div><div className="modal-units"><div className="table-head"><div><h3>Unidades cargadas</h3><p>Disponibles y sujetas a confirmación final.</p></div><span>{isDirectBrochureUrl(openProject.brochure) ? units.filter((unit) => unit.projectId === openProject.id && unit.status === "Disponible").length : 0} resultados</span></div>{isDirectBrochureUrl(openProject.brochure) && units.filter((unit) => unit.projectId === openProject.id && unit.status === "Disponible").map((unit) => <div className="modal-unit-row" key={unit.id}><span><strong>{unit.code}</strong><small>Piso {unit.floor}</small></span><span><strong>{unit.type}</strong><small>{formatArea(unit)} {unit.areaLabel || "según fuente"}</small>{areaDetails(unit) && <small>{areaDetails(unit)}</small>}</span><span><strong>{formatPrice(unit, fx)}</strong><small>{unit.status}</small></span><button className={selected.includes(unit.id) ? "selected-button" : "secondary"} onClick={() => toggleUnit(unit.id)}>{selected.includes(unit.id) ? <Icon name="check"/> : <Icon name="plus"/>}</button></div>)}{(!isDirectBrochureUrl(openProject.brochure) || !units.some((unit) => unit.projectId === openProject.id && unit.status === "Disponible")) && <div className="empty-selection"><strong>Proyecto todavía no habilitado para cotizar</strong><p>{!isDirectBrochureUrl(openProject.brochure) ? "Falta un brochure público individual." : "No hay unidades disponibles cargadas para cotizar. Revisá el estado comercial en la ficha del proyecto."}</p></div>}</div></div></section></div>}
      {editOpen && <div className="modal-backdrop" onMouseDown={() => setEditOpen(false)}><section className="edit-modal" onMouseDown={(event) => event.stopPropagation()}><div className="edit-modal-head"><div><p className="eyebrow">CAMBIO REGISTRADO</p><h2>Actualizar información</h2></div><button className="icon-button" onClick={() => setEditOpen(false)}><Icon name="close"/></button></div><p>El sistema conservará el valor anterior, la fuente, la fecha y el usuario responsable.</p><label className="input-label">Proyecto<select value={editProjectId} onChange={(event) => { const value = event.target.value; setEditProjectId(value); setEditValue(String(liveProjectById[value]?.[editField as keyof Project] || "")); }}>{liveProjects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label><label className="input-label">Dato a modificar<select value={editField} onChange={(event) => { const value = event.target.value; setEditField(value); setEditValue(String(liveProjectById[editProjectId]?.[value as keyof Project] || "")); }}><option value="delivery">Fecha o condición de entrega</option><option value="stage">Etapa del proyecto</option><option value="location">Ubicación</option><option value="confidence">Estado de confirmación</option><option value="updatedAt">Fecha de actualización (AAAA-MM-DD)</option><option value="summary">Resumen comercial</option></select></label><label className="input-label">Nuevo valor<textarea value={editValue} onChange={(event) => setEditValue(event.target.value)} placeholder="Ingresá la información confirmada"/></label><label className="input-label">Fuente o enlace de respaldo<input value={editSource} onChange={(event) => setEditSource(event.target.value)} placeholder="Enlace de Drive, mensaje o documento"/></label><button className="primary save-edit" disabled={!editValue.trim() || savingEdit} onClick={saveEdit}>{savingEdit ? "Guardando…" : "Guardar cambio"}</button></section></div>}
    </div>
  );
}
