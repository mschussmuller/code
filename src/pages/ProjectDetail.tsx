import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import { Badge, Empty, ErrorBox, Field, Loading, Modal, Section } from "../components/ui";
import { SelectionBar, UnitRow } from "../components/UnitRow";
import { Icon } from "../components/Icon";
import { date, parseJson } from "../format";
import { resizeImage } from "../image";
import { Freshness } from "./Inventory";
import { UNIT_STATUS } from "../../shared/roles";
import type { Project, Unit } from "../../shared/types";

type Audit = { reviewedAt: string; status: string; notes: string[]; pending: string[]; sources: { label: string; url: string }[] };
type Brochure = { building: string; amenities: string[]; finishes: string[] };
type GalleryItem = { src: string; title: string };
type DocLink = { label: string; url: string };

export function ProjectDetail() {
  const { id } = useParams();
  const perms = usePermissions();
  const { data, error, loading, reload } = useApi<{ project: Project; units: Unit[] }>(`/inventory/projects/${id}`);
  const [status, setStatus] = useState("Disponible");
  const [bedrooms, setBedrooms] = useState("");
  const [editingProject, setEditingProject] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | "new" | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const units = useMemo(() => (data?.units ?? []).filter((u) => (status === "todas" || u.status === status) && (!bedrooms || String(Math.min(u.bedrooms, 3)) === bedrooms)), [data, status, bedrooms]);
  if (loading && !data) return <Loading />;
  if (!data) return <ErrorBox message={error} />;
  const p = data.project;
  const extra = parseJson<{ inventoryAudit?: Audit; brochureDetails?: Brochure; consultationPolicy?: string; gallery?: GalleryItem[]; documents?: DocLink[] }>(p.extra, {});
  const links = [
    ["Brochure", p.brochure_url], ["Lista de precios", p.price_list_url], ["Planos", p.plans_url], ["Renders y fotos", p.media_url],
    ["Videos", p.video_url], ["Carpeta completa", p.drive_url],
    ["Google Maps", p.map_query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.map_query)}` : null],
  ].filter(([, url]) => url) as [string, string][];
  const counts = UNIT_STATUS.map((s) => [s, data.units.filter((u) => u.status === s).length] as const).filter(([, n]) => n);

  return (
    <div className="pb-20">
      <Link to="/inventario" className="mb-3 inline-block text-sm font-semibold text-muted hover:text-navy">← Inventario</Link>
      <div className="card overflow-hidden">
        <div className="relative min-h-44 bg-navy p-6 text-white" style={{ background: `linear-gradient(135deg, ${p.color ?? "#0b1f3a"}, #0b1f3a)` }}>
          {p.image_url && <><img src={p.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/60 to-navy/10" /></>}
          <div className="relative">
            <p className="eyebrow">{p.developer_name}</p>
            <h1 className="mt-1 text-3xl font-extrabold">{p.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-white/80"><Icon name="map" size={15} /> {p.location}</p>
            <div className="mt-3 flex flex-wrap gap-2"><Badge color="gold">{p.stage}</Badge><Badge color={p.confidence === "Confirmado" ? "green" : "amber"}>{p.confidence}</Badge><Freshness updated={p.updated_at} /></div>
          </div>
          {perms.editInventory && (
            <div className="absolute right-4 top-4 flex gap-2">
              {!p.image_url && <button className="btn-gold" onClick={() => setEditingProject(true)}>📷 Agregar fachada</button>}
              <button className="btn-ghost" onClick={() => setEditingProject(true)}><Icon name="edit" size={15} /> Editar</button>
            </div>
          )}
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm leading-relaxed">{p.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {links.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="btn-ghost py-1.5 text-xs">{label} ↗</a>)}
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted">Entrega:</span> <b>{p.delivery}</b></p>
            {p.parking_price_usd ? <p><span className="text-muted">Cochera adicional:</span> <b>USD {p.parking_price_usd.toLocaleString("es-PY")}</b></p> : null}
            {p.source_label && <p><span className="text-muted">Fuente:</span> {p.source_label}</p>}
            <p className="flex flex-wrap gap-1">{counts.map(([s, n]) => <Badge key={s} color={s === "Disponible" ? "green" : "gray"}>{n} {s.toLowerCase()}</Badge>)}</p>
          </div>
        </div>
      </div>

      {(extra.gallery?.length || extra.documents?.length) ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {extra.gallery?.length ? (
            <Section title={`Galería (${extra.gallery.length})`} className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {extra.gallery.map((g, i) => (
                  <button key={g.src} onClick={() => setLightbox(i)} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-cream">
                    <img src={g.src} alt={g.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-1.5 text-left text-[11px] font-semibold text-white">{g.title}</span>
                  </button>
                ))}
              </div>
            </Section>
          ) : null}
          {extra.documents?.length ? (
            <Section title="Documentos">
              <div className="space-y-1">
                {extra.documents.map((d) => <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-cream"><Icon name="file" size={15} className="shrink-0 text-gold" /> {d.label}</a>)}
              </div>
            </Section>
          ) : null}
        </div>
      ) : null}
      {lightbox !== null && extra.gallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute left-2 top-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + extra.gallery!.length - 1) % extra.gallery!.length); }}>‹</button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={extra.gallery[lightbox].src} alt="" className="max-h-[85vh] rounded-lg" />
            <figcaption className="mt-2 text-center text-sm text-white">{extra.gallery[lightbox].title} · {lightbox + 1}/{extra.gallery.length}</figcaption>
          </figure>
          <button className="absolute right-2 top-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % extra.gallery!.length); }}>›</button>
        </div>
      )}

      {(extra.inventoryAudit || extra.brochureDetails) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {extra.brochureDetails && (
            <Section title="Ficha técnica">
              <p className="text-sm">{extra.brochureDetails.building}</p>
              {extra.brochureDetails.amenities?.length > 0 && <p className="mt-2 text-sm"><b>Amenities:</b> {extra.brochureDetails.amenities.join(", ")}</p>}
              {extra.brochureDetails.finishes?.length > 0 && <p className="mt-2 text-sm"><b>Terminaciones:</b> {extra.brochureDetails.finishes.join(", ")}</p>}
            </Section>
          )}
          {extra.inventoryAudit && (
            <Section title={`Verificación de inventario · ${extra.inventoryAudit.status}`}>
              <p className="text-xs text-muted">Revisado {date(extra.inventoryAudit.reviewedAt)}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{extra.inventoryAudit.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              {extra.inventoryAudit.pending.length > 0 && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900"><b>Pendiente:</b> {extra.inventoryAudit.pending.join(" ")}</p>}
            </Section>
          )}
        </div>
      )}

      <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold text-navy">Unidades ({units.length})</h2>
        <div className="flex flex-wrap gap-2">
          <select className="input w-auto" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
            <option value="">Todas las tipologías</option><option value="0">Monoambiente</option><option value="1">1 dormitorio</option><option value="2">2 dormitorios</option><option value="3">3+ dormitorios</option>
          </select>
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todas">Todos los estados</option>{UNIT_STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
          {perms.editInventory && <button className="btn-ghost" onClick={() => setEditingUnit("new")}>+ Unidad</button>}
        </div>
      </div>
      {!units.length && <Empty title="No hay unidades con este filtro" />}
      <div className="space-y-2">
        {units.map((u) => <UnitRow key={u.id} unit={u} showProject={false} onEdit={perms.editInventory ? () => setEditingUnit(u) : undefined} />)}
      </div>
      <SelectionBar />
      {editingProject && <ProjectEditor project={p} onClose={() => setEditingProject(false)} onSaved={() => { setEditingProject(false); void reload(); }} />}
      {editingUnit && <UnitEditor projectId={p.id} unit={editingUnit === "new" ? null : editingUnit} onClose={() => setEditingUnit(null)} onSaved={() => { setEditingUnit(null); void reload(); }} />}
    </div>
  );
}

function ProjectEditor({ project, onClose, onSaved }: { project: Project; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: project.name, location: project.location, stage: project.stage, delivery: project.delivery, confidence: project.confidence,
    summary: project.summary, brochure_url: project.brochure_url ?? "", price_list_url: project.price_list_url ?? "", plans_url: project.plans_url ?? "",
    media_url: project.media_url ?? "", drive_url: project.drive_url ?? "", image_url: project.image_url ?? "",
    parking_price_usd: project.parking_price_usd?.toString() ?? "", source_label: project.source_label ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const { image_url } = await api<{ image_url: string }>(`/inventory/projects/${project.id}/image`, { body: { dataUrl: await resizeImage(file) } });
      setForm((f) => ({ ...f, image_url }));
    } catch (e) { setError((e as Error).message); } finally { setUploading(false); }
  }
  async function save() {
    try {
      await api(`/inventory/projects/${project.id}`, { method: "PATCH", body: { ...form, parking_price_usd: form.parking_price_usd ? Number(form.parking_price_usd) : null } });
      onSaved();
    } catch (e) { setError((e as Error).message); }
  }
  return (
    <Modal title="Editar proyecto" onClose={onClose} wide>
      <p className="mb-3 text-xs text-muted">Al guardar, la fecha de actualización pasa a hoy. Queda registrado quién hizo el cambio.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre"><input className="input" value={form.name} onChange={set("name")} /></Field>
        <Field label="Ubicación"><input className="input" value={form.location} onChange={set("location")} /></Field>
        <Field label="Etapa"><select className="input" value={form.stage} onChange={set("stage")}>{["Prepozo", "Pozo", "Semiterminado", "Terminado", "Requiere confirmación"].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Estado de la información"><select className="input" value={form.confidence} onChange={set("confidence")}>{["Confirmado", "Parcial", "Requiere confirmación"].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Entrega"><input className="input" value={form.delivery} onChange={set("delivery")} /></Field>
        <Field label="Fuente / fecha de lista"><input className="input" value={form.source_label} onChange={set("source_label")} /></Field>
        <Field label="Resumen comercial" className="sm:col-span-2"><textarea className="input" rows={3} value={form.summary} onChange={set("summary")} /></Field>
        <Field label="Brochure (enlace)"><input className="input" value={form.brochure_url} onChange={set("brochure_url")} /></Field>
        <Field label="Lista de precios (enlace)"><input className="input" value={form.price_list_url} onChange={set("price_list_url")} /></Field>
        <Field label="Planos (enlace)"><input className="input" value={form.plans_url} onChange={set("plans_url")} /></Field>
        <Field label="Fotos y renders (enlace)"><input className="input" value={form.media_url} onChange={set("media_url")} /></Field>
        <Field label="Carpeta Drive"><input className="input" value={form.drive_url} onChange={set("drive_url")} /></Field>
        <div className="sm:col-span-2">
          <span className="label">Foto de fachada (aparece en las propuestas)</span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-20 w-32 overflow-hidden rounded-lg bg-cream">{form.image_url && <img src={form.image_url} alt="" className="h-full w-full object-cover" />}</div>
            <label className="btn-ghost cursor-pointer">
              {uploading ? "Subiendo…" : "📷 Subir foto"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            <input className="input min-w-0 flex-1" value={form.image_url} onChange={set("image_url")} placeholder="…o pegá un enlace de Google Drive a la imagen" />
          </div>
        </div>
        <Field label="Precio cochera adicional (USD)"><input className="input" type="number" value={form.parking_price_usd} onChange={set("parking_price_usd")} /></Field>
      </div>
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Guardar</button></div>
    </Modal>
  );
}

function UnitEditor({ projectId, unit, onClose, onSaved }: { projectId: string; unit: Unit | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: unit?.code ?? "", floor: unit?.floor ?? "", type: unit?.type ?? "", bedrooms: String(unit?.bedrooms ?? 1), total_m2: unit?.total_m2?.toString() ?? "",
    currency: unit?.currency ?? "USD", price: unit?.price?.toString() ?? "", parking: String(unit?.parking ?? 0), status: unit?.status ?? "Disponible",
    down_payment: unit?.down_payment?.toString() ?? "", monthly_payment: unit?.monthly_payment?.toString() ?? "", source: "",
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const num = (v: string) => (v === "" ? null : Number(v));
  async function save() {
    const payload = { ...form, project_id: projectId, bedrooms: Number(form.bedrooms), total_m2: num(form.total_m2), price: Number(form.price), parking: Number(form.parking), down_payment: num(form.down_payment), monthly_payment: num(form.monthly_payment) };
    try {
      if (unit) await api(`/inventory/units/${unit.id}`, { method: "PATCH", body: payload });
      else await api("/inventory/units", { body: payload });
      onSaved();
    } catch (e) { setError((e as Error).message); }
  }
  return (
    <Modal title={unit ? `Unidad ${unit.code}` : "Nueva unidad"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Código"><input className="input" value={form.code} onChange={set("code")} /></Field>
        <Field label="Piso"><input className="input" value={form.floor} onChange={set("floor")} /></Field>
        <Field label="Tipología" className="col-span-2"><input className="input" value={form.type} onChange={set("type")} placeholder="Ej: 2 dormitorios tipo A" /></Field>
        <Field label="Dormitorios"><input className="input" type="number" min={0} value={form.bedrooms} onChange={set("bedrooms")} /></Field>
        <Field label="m² totales"><input className="input" type="number" value={form.total_m2} onChange={set("total_m2")} /></Field>
        <Field label="Moneda"><select className="input" value={form.currency} onChange={set("currency")}><option>USD</option><option>PYG</option></select></Field>
        <Field label="Precio"><input className="input" type="number" value={form.price} onChange={set("price")} /></Field>
        <Field label="Cocheras incluidas"><input className="input" type="number" value={form.parking} onChange={set("parking")} /></Field>
        <Field label="Estado"><select className="input" value={form.status} onChange={set("status")}>{UNIT_STATUS.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Entrega inicial (plan oficial)"><input className="input" type="number" value={form.down_payment} onChange={set("down_payment")} /></Field>
        <Field label="Cuota mensual (plan oficial)"><input className="input" type="number" value={form.monthly_payment} onChange={set("monthly_payment")} /></Field>
        {unit && <Field label="Fuente del cambio" className="col-span-2"><input className="input" value={form.source} onChange={set("source")} placeholder="Ej: lista 05/10, WhatsApp con la desarrolladora" /></Field>}
      </div>
      {unit && <p className="mt-3 text-xs text-muted">Si cambia el precio o el estado, se avisa automáticamente a los vendedores que la propusieron.</p>}
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Guardar</button></div>
    </Modal>
  );
}
