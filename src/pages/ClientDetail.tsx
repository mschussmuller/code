import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import { ClientForm } from "../components/ClientForm";
import { Icon } from "../components/Icon";
import { OperationForm } from "../components/OperationForm";
import { UnitRow, SelectionBar } from "../components/UnitRow";
import { Badge, ErrorBox, Loading, Section } from "../components/ui";
import { compactUsd, date, parseJson, relative, usd, whatsappLink } from "../format";
import { CLIENT_STAGES, OPERATION_STATUS } from "../../shared/roles";
import type { Client, Interaction, Task, Unit } from "../../shared/types";

type Detail = {
  client: Client; interactions: Interaction[]; tasks: Task[];
  proposals: { id: string; created_at: string; options: string; user_name: string }[];
  operations: { id: string; unit_label: string; status: string; price_usd: number; reserved_at: string }[];
};

const KINDS = [["whatsapp", "WhatsApp"], ["llamada", "Llamada"], ["reunion", "Reunión"], ["visita", "Visita"], ["email", "Email"], ["nota", "Nota"]];

export function ClientDetail() {
  const { id } = useParams();
  const perms = usePermissions();
  const { data, error, loading, reload } = useApi<Detail>(`/clients/${id}`);
  const [editing, setEditing] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [note, setNote] = useState({ kind: "whatsapp", note: "" });
  const [task, setTask] = useState({ title: "", due_at: "" });
  const c = data?.client;
  const matchQuery = c ? new URLSearchParams(Object.entries({
    max: c.budget_max_usd ? String(Math.round(c.budget_max_usd * 1.05)) : "", min: c.budget_min_usd ? String(c.budget_min_usd) : "",
    bedrooms: c.bedrooms_min != null ? String(Math.min(c.bedrooms_min, 3)) : "", zone: c.zones ?? "", limit: "6",
  }).filter(([, v]) => v)).toString() : null;
  const matches = useApi<{ units: Unit[] }>(c && (c.budget_max_usd || c.zones || c.bedrooms_min != null) ? `/inventory/units?${matchQuery}` : null);

  if (loading && !data) return <Loading />;
  if (!data || !c) return <ErrorBox message={error} />;

  async function addNote() {
    if (!note.note.trim()) return;
    await api(`/clients/${id}/interactions`, { body: note });
    setNote({ ...note, note: "" });
    void reload();
  }
  async function addTask() {
    if (!task.title.trim() || !task.due_at) return;
    await api("/tasks", { body: { ...task, client_id: id } });
    setTask({ title: "", due_at: "" });
    void reload();
  }
  async function toggleTask(t: Task) {
    await api(`/tasks/${t.id}`, { method: "PATCH", body: { done: !t.done_at } });
    void reload();
  }
  async function setStage(stage: string) {
    const lost_reason = stage === "perdido" ? prompt("¿Por qué se perdió? (precio, compró en otro lado, no responde…)") ?? "" : undefined;
    await api(`/clients/${id}`, { method: "PATCH", body: { stage, lost_reason } });
    void reload();
  }

  const greeting = `Hola ${c.name.split(" ")[0]}, ¿cómo estás? Te escribo de Vantage Real Estate.`;

  return (
    <div className="pb-20">
      <Link to="/clientes" className="mb-3 inline-block text-sm font-semibold text-muted hover:text-navy">← Clientes</Link>
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy">{c.name}</h1>
            <p className="text-sm text-muted">{[c.phone, c.email, c.source && `Origen: ${c.source}`].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 text-xs text-muted">Último contacto {relative(c.last_contact_at)}{perms.manager && c.assigned_name ? ` · Asignado a ${c.assigned_name}` : ""}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.phone && <a className="btn-ghost" href={whatsappLink(c.phone, greeting)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> WhatsApp</a>}
            {c.phone && <a className="btn-ghost" href={`tel:${c.phone}`}><Icon name="phone" size={16} /> Llamar</a>}
            <button className="btn-ghost" onClick={() => setEditing(true)}><Icon name="edit" size={16} /> Editar</button>
          </div>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {CLIENT_STAGES.map((s) => (
            <button key={s.id} onClick={() => s.id !== c.stage && setStage(s.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${s.id === c.stage ? (s.id === "perdido" ? "bg-bad text-white" : s.id === "ganado" ? "bg-ok text-white" : "bg-navy text-white") : "bg-cream text-muted hover:bg-gold-light"}`}>
              {s.label}
            </button>
          ))}
        </div>
        {c.lost_reason && c.stage === "perdido" && <p className="mt-2 text-sm text-bad">Motivo: {c.lost_reason}</p>}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Qué busca" action={<Link className="btn-primary py-1.5" to={`/buscar?cliente=${c.id}`}><Icon name="search" size={15} /> Buscar opciones</Link>}>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><p className="text-xs text-muted">Presupuesto</p><p className="font-bold">{c.budget_max_usd ? `${c.budget_min_usd ? compactUsd(c.budget_min_usd) + " – " : "Hasta "}${compactUsd(c.budget_max_usd)}` : "—"}</p></div>
              <div><p className="text-xs text-muted">Dormitorios</p><p className="font-bold">{c.bedrooms_min == null ? "—" : c.bedrooms_min === 0 ? "Monoambiente" : `${c.bedrooms_min}${c.bedrooms_min >= 3 ? "+" : ""}`}</p></div>
              <div><p className="text-xs text-muted">Objetivo</p><p className="font-bold">{c.purpose || "—"}</p></div>
              <div><p className="text-xs text-muted">Zonas</p><p className="font-bold">{c.zones || "—"}</p></div>
            </div>
            {c.preferences && <p className="mt-3 text-sm"><span className="text-muted">Preferencias:</span> {c.preferences}</p>}
            {c.notes && <p className="mt-1 text-sm"><span className="text-muted">Notas:</span> {c.notes}</p>}
            {matches.data && matches.data.units.length > 0 && (
              <div className="mt-4">
                <p className="eyebrow mb-2">Sugerencias del inventario</p>
                <div className="space-y-2">{matches.data.units.map((u) => <UnitRow key={u.id} unit={u} />)}</div>
              </div>
            )}
          </Section>

          <Section title="Historial">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <select className="input sm:w-36" value={note.kind} onChange={(e) => setNote({ ...note, kind: e.target.value })}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <input className="input flex-1" placeholder="¿Qué se habló? Ej: le interesa Venire, quiere visitar el sábado" value={note.note}
                onChange={(e) => setNote({ ...note, note: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addNote()} />
              <button className="btn-primary" onClick={addNote}>Registrar</button>
            </div>
            <ol className="space-y-3">
              {data.interactions.map((i) => (
                <li key={i.id} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <span><b className="capitalize">{KINDS.find(([v]) => v === i.kind)?.[1] ?? i.kind}</b> · {i.note}<br /><span className="text-xs text-muted">{date(i.created_at, true)} · {i.user_name ?? "Sistema"}</span></span>
                </li>
              ))}
              {!data.interactions.length && <p className="text-sm text-muted">Sin registros todavía.</p>}
            </ol>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Seguimientos">
            <div className="space-y-2">
              {data.tasks.map((t) => (
                <label key={t.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={Boolean(t.done_at)} onChange={() => toggleTask(t)} />
                  <span className={t.done_at ? "text-muted line-through" : ""}>{t.title}<br />
                    <span className={`text-xs ${!t.done_at && new Date(t.due_at) < new Date() ? "font-bold text-bad" : "text-muted"}`}>{date(t.due_at, true)}{t.auto ? " · automático" : ""}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 space-y-2 border-t border-line pt-3">
              <input className="input" placeholder="Nuevo seguimiento" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
              <div className="flex gap-2"><input className="input" type="datetime-local" value={task.due_at} onChange={(e) => setTask({ ...task, due_at: e.target.value })} /><button className="btn-ghost" onClick={addTask}>+</button></div>
            </div>
          </Section>

          <Section title="Propuestas" action={<Link to={`/propuestas/nueva?cliente=${c.id}`} className="text-sm font-semibold text-gold">+ Nueva</Link>}>
            {data.proposals.map((p) => (
              <Link key={p.id} to={`/propuestas/${p.id}/imprimir`} className="block rounded-lg p-2 text-sm hover:bg-cream">
                <b>{parseJson<unknown[]>(p.options, []).length} opciones</b> · {date(p.created_at)} <span className="text-xs text-muted">· {p.user_name}</span>
              </Link>
            ))}
            {!data.proposals.length && <p className="text-sm text-muted">Sin propuestas.</p>}
          </Section>

          <Section title="Operaciones" action={<button onClick={() => setReserving(true)} className="text-sm font-semibold text-gold">+ Reserva</button>}>
            {data.operations.map((o) => (
              <div key={o.id} className="rounded-lg p-2 text-sm">
                <b>{o.unit_label}</b><br />
                <span className="text-xs text-muted">{usd(o.price_usd)} · {date(o.reserved_at)}</span> <Badge color="gold">{OPERATION_STATUS.find((s) => s.id === o.status)?.label}</Badge>
              </div>
            ))}
            {!data.operations.length && <p className="text-sm text-muted">Sin operaciones.</p>}
          </Section>
        </div>
      </div>
      <SelectionBar />
      {editing && <ClientForm client={c} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); void reload(); }} />}
      {reserving && <OperationForm clientId={c.id} clientName={c.name} onClose={() => setReserving(false)} onSaved={() => { setReserving(false); void reload(); }} />}
    </div>
  );
}
