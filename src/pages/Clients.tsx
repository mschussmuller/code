import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApi } from "../api";
import { usePermissions } from "../auth";
import { ClientForm } from "../components/ClientForm";
import { Badge, Empty, ErrorBox, Loading, PageHeader } from "../components/ui";
import { compactUsd, daysSince, relative } from "../format";
import { CLIENT_STAGES } from "../../shared/roles";
import type { Client, User } from "../../shared/types";

type Row = Client & { next_task_at: string | null };

export function Clients() {
  const perms = usePermissions();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"tablero" | "lista">(window.innerWidth < 768 ? "lista" : "tablero");
  const seller = params.get("vendedor") ?? "";
  const stage = params.get("etapa") ?? "";
  const { data, error, loading } = useApi<{ clients: Row[] }>(`/clients${seller ? `?seller=${seller}` : ""}`);
  const users = useApi<{ users: User[] }>(perms.manager ? "/users" : null);

  const clients = useMemo(() => (data?.clients ?? []).filter((c) =>
    (!text || `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`.toLowerCase().includes(text.toLowerCase())) && (!stage || c.stage === stage)), [data, text, stage]);
  const update = (k: string, v: string) => { const next = new URLSearchParams(params); if (v) next.set(k, v); else next.delete(k); setParams(next); };

  return (
    <>
      <PageHeader eyebrow="CRM" title="Clientes" subtitle={perms.manager ? "Todos los clientes de la inmobiliaria." : "Tus clientes y oportunidades."}
        actions={<button className="btn-primary" onClick={() => setCreating(true)}>+ Nuevo cliente</button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Buscar por nombre, teléfono o email" value={text} onChange={(e) => setText(e.target.value)} />
        {perms.manager && (
          <select className="input w-auto" value={seller} onChange={(e) => update("vendedor", e.target.value)}>
            <option value="">Todo el equipo</option>{users.data?.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        <select className="input w-auto" value={stage} onChange={(e) => update("etapa", e.target.value)}>
          <option value="">Todas las etapas</option>{CLIENT_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div className="ml-auto flex rounded-lg border border-line bg-white p-0.5">
          {(["tablero", "lista"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${view === v ? "bg-navy text-white" : "text-muted"}`}>{v}</button>)}
        </div>
      </div>
      {loading && !data && <Loading />}
      <ErrorBox message={error} />
      {data && !data.clients.length && <Empty title="Todavía no hay clientes">Cargá el primero con “Nuevo cliente”. El sistema te va a recordar cuándo hacer cada seguimiento.</Empty>}

      {data && data.clients.length > 0 && view === "tablero" && (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
          {CLIENT_STAGES.filter((s) => !stage || s.id === stage).map((s) => {
            const col = clients.filter((c) => c.stage === s.id);
            return (
              <div key={s.id} className="w-72 shrink-0 rounded-2xl bg-cream/70 p-2">
                <p className="flex justify-between px-2 py-1 text-xs font-extrabold uppercase tracking-wide text-muted">{s.label}<span>{col.length}</span></p>
                <div className="space-y-2">{col.map((c) => <ClientCard key={c.id} client={c} showSeller={perms.manager} />)}</div>
              </div>
            );
          })}
        </div>
      )}

      {data && data.clients.length > 0 && view === "lista" && (
        <div className="card divide-y divide-line">
          {clients.map((c) => (
            <button key={c.id} onClick={() => navigate(`/clientes/${c.id}`)} className="flex w-full flex-wrap items-center gap-3 p-3 text-left hover:bg-cream/50">
              <span className="min-w-0 flex-1"><span className="block font-bold text-navy">{c.name}</span><span className="text-xs text-muted">{c.phone} {perms.manager && c.assigned_name ? `· ${c.assigned_name}` : ""}</span></span>
              <Badge color="gold">{CLIENT_STAGES.find((s) => s.id === c.stage)?.label}</Badge>
              <span className="w-28 text-right text-xs text-muted">Contacto {relative(c.last_contact_at)}</span>
            </button>
          ))}
        </div>
      )}
      {creating && <ClientForm onClose={() => setCreating(false)} onSaved={(id) => navigate(`/clientes/${id}`)} />}
    </>
  );
}

function ClientCard({ client: c, showSeller }: { client: Row; showSeller: boolean }) {
  const cold = ["nuevo", "contactado", "visita", "propuesta", "negociacion"].includes(c.stage) && daysSince(c.last_contact_at ?? c.created_at) > 7;
  const overdue = c.next_task_at && new Date(c.next_task_at) < new Date();
  return (
    <Link to={`/clientes/${c.id}`} className="block rounded-xl border border-line bg-white p-3 shadow-sm transition hover:border-gold">
      <p className="font-bold text-navy">{c.name}</p>
      <p className="text-xs text-muted">
        {c.budget_max_usd ? `Hasta ${compactUsd(c.budget_max_usd)}` : "Presupuesto sin definir"}{c.bedrooms_min != null ? ` · ${c.bedrooms_min === 0 ? "Mono" : `${c.bedrooms_min}D`}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {overdue ? <Badge color="red">Seguimiento vencido</Badge> : cold ? <Badge color="amber">Sin contacto {relative(c.last_contact_at ?? c.created_at)}</Badge> : <span className="text-[11px] text-muted">Contacto {relative(c.last_contact_at)}</span>}
        {showSeller && c.assigned_name && <span className="ml-auto text-[11px] font-semibold text-muted">{c.assigned_name.split(" ")[0]}</span>}
      </div>
    </Link>
  );
}
