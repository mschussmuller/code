import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import { Badge, Empty, ErrorBox, Field, Loading, Modal, PageHeader } from "../components/ui";
import { compactUsd, daysSince, relative } from "../format";
import type { Project } from "../../shared/types";

const STAGES = ["Prepozo", "Pozo", "Semiterminado", "Terminado", "Requiere confirmación"];

export function Freshness({ updated }: { updated: string }) {
  const days = daysSince(updated);
  return <Badge color={days > 30 ? "red" : days > 14 ? "amber" : "green"}>Actualizado {relative(updated)}</Badge>;
}

export function Inventory() {
  const perms = usePermissions();
  const [params, setParams] = useSearchParams();
  const { data, error, loading, reload } = useApi<{ projects: Project[] }>("/inventory/projects");
  const [text, setText] = useState("");
  const [stage, setStage] = useState("");
  const [creating, setCreating] = useState(false);
  const verify = params.get("vista") === "verificar";
  const withStock = params.get("stock") !== "todos";

  const groups = useMemo(() => {
    let list = (data?.projects ?? []).filter((p) => p.active);
    if (text) list = list.filter((p) => `${p.name} ${p.location} ${p.developer_name}`.toLowerCase().includes(text.toLowerCase()));
    if (stage) list = list.filter((p) => p.stage === stage);
    if (withStock && !verify) list = list.filter((p) => (p.available_units ?? 0) > 0);
    if (verify) list = [...list].filter((p) => daysSince(p.updated_at) > 30).sort((a, b) => a.updated_at.localeCompare(b.updated_at));
    const map = new Map<string, Project[]>();
    for (const p of list) map.set(p.developer_name ?? "", [...(map.get(p.developer_name ?? "") ?? []), p]);
    return [...map.entries()];
  }, [data, text, stage, verify, withStock]);

  const total = data?.projects.reduce((s, p) => s + (p.available_units ?? 0), 0) ?? 0;

  return (
    <>
      <PageHeader eyebrow="Inventario" title={verify ? "Proyectos para verificar" : "Proyectos y desarrollos"}
        subtitle={verify ? "Sin actualizar hace más de 30 días. Confirmá precios y disponibilidad con cada desarrolladora." : `${total} unidades disponibles en ${data?.projects.filter((p) => (p.available_units ?? 0) > 0).length ?? 0} proyectos`}
        actions={<>
          <Link to="/buscar" className="btn-primary">Buscar unidades</Link>
          {perms.editInventory && <button className="btn-ghost" onClick={() => setCreating(true)}>+ Proyecto</button>}
        </>} />

      <div className="mb-5 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Buscar proyecto, zona o desarrolladora" value={text} onChange={(e) => setText(e.target.value)} />
        <select className="input w-auto" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">Todas las etapas</option>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className={verify ? "btn-gold" : "btn-ghost"} onClick={() => setParams(verify ? {} : { vista: "verificar" })}>⚠ Para verificar</button>
        {!verify && <button className="btn-ghost" onClick={() => setParams(withStock ? { stock: "todos" } : {})}>{withStock ? "Mostrar sin stock" : "Sólo con stock"}</button>}
      </div>

      {loading && !data && <Loading />}
      <ErrorBox message={error} />
      {data && !groups.length && <Empty title="No hay proyectos con esos filtros" />}

      <div className="space-y-8">
        {groups.map(([developer, projects]) => (
          <section key={developer}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-extrabold text-navy">{developer}</h2>
              <span className="text-xs text-muted">{projects.length} proyecto{projects.length === 1 ? "" : "s"} · {projects.reduce((s, p) => s + (p.available_units ?? 0), 0)} unidades</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        ))}
      </div>
      {creating && <NewProjectModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); void reload(); }} />}
    </>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Link to={`/inventario/${p.id}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lg">
      <div className="relative h-32 bg-navy" style={{ background: p.image_url ? undefined : `linear-gradient(135deg, ${p.color ?? "#0b1f3a"}, #0b1f3a)` }}>
        {p.image_url && <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />}
        <span className="absolute left-3 top-3"><Badge color="navy">{p.stage}</Badge></span>
        <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2 py-1 text-xs font-extrabold text-navy">{p.available_units ?? 0} disp.</span>
      </div>
      <div className="p-4">
        <p className="font-extrabold text-navy group-hover:text-gold">{p.name}</p>
        <p className="text-xs text-muted">{p.location}</p>
        <p className="mt-2 text-sm">{p.min_price_usd ? <>Desde <b>{compactUsd(p.min_price_usd)}</b></> : <span className="text-muted">Sin precios cargados</span>}</p>
        <p className="text-xs text-muted">Entrega: {p.delivery}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          <Freshness updated={p.updated_at} />
          {p.confidence !== "Confirmado" && <Badge color="amber">{p.confidence}</Badge>}
        </div>
      </div>
    </Link>
  );
}

function NewProjectModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", developer_name: "", location: "", stage: "Pozo", delivery: "", summary: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  async function save() {
    try { await api("/inventory/projects", { body: form }); onSaved(); } catch (e) { setError((e as Error).message); }
  }
  return (
    <Modal title="Nuevo proyecto" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre"><input className="input" value={form.name} onChange={set("name")} /></Field>
        <Field label="Desarrolladora"><input className="input" value={form.developer_name} onChange={set("developer_name")} /></Field>
        <Field label="Ubicación"><input className="input" value={form.location} onChange={set("location")} /></Field>
        <Field label="Etapa"><select className="input" value={form.stage} onChange={set("stage")}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Entrega" className="sm:col-span-2"><input className="input" value={form.delivery} onChange={set("delivery")} placeholder="Ej: Diciembre de 2028" /></Field>
        <Field label="Resumen comercial" className="sm:col-span-2"><textarea className="input" rows={3} value={form.summary} onChange={set("summary")} /></Field>
      </div>
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Crear</button></div>
    </Modal>
  );
}
