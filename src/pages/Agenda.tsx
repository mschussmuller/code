import { useState } from "react";
import { Link } from "react-router-dom";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import { Empty, Loading, PageHeader, Section } from "../components/ui";
import { date } from "../format";
import type { Task } from "../../shared/types";

export function Agenda() {
  const perms = usePermissions();
  const [all, setAll] = useState(false);
  const { data, loading, reload } = useApi<{ tasks: Task[] }>(`/tasks${all ? "?scope=all" : ""}`);
  const [form, setForm] = useState({ title: "", due_at: "" });

  const today = new Date().toISOString().slice(0, 10);
  const open = data?.tasks.filter((t) => !t.done_at) ?? [];
  const groups = [
    { title: "Vencidos", tone: "text-bad", items: open.filter((t) => t.due_at.slice(0, 10) < today) },
    { title: "Hoy", tone: "text-navy", items: open.filter((t) => t.due_at.slice(0, 10) === today) },
    { title: "Próximos", tone: "text-navy", items: open.filter((t) => t.due_at.slice(0, 10) > today) },
    { title: "Hechos (últimos 7 días)", tone: "text-muted", items: data?.tasks.filter((t) => t.done_at) ?? [] },
  ];

  async function toggle(t: Task) { await api(`/tasks/${t.id}`, { method: "PATCH", body: { done: !t.done_at } }); void reload(); }
  async function postpone(t: Task) {
    const next = new Date(Math.max(Date.now(), new Date(t.due_at).getTime()) + 86400_000);
    await api(`/tasks/${t.id}`, { method: "PATCH", body: { due_at: next.toISOString() } });
    void reload();
  }
  async function add() {
    if (!form.title.trim() || !form.due_at) return;
    await api("/tasks", { body: form });
    setForm({ title: "", due_at: "" });
    void reload();
  }

  return (
    <>
      <PageHeader eyebrow="Agenda" title="Seguimientos y tareas" subtitle="El sistema crea seguimientos automáticos cuando un cliente lleva días sin contacto o después de enviar una propuesta."
        actions={perms.manager && <button className="btn-ghost" onClick={() => setAll(!all)}>{all ? "Ver sólo los míos" : "Ver todo el equipo"}</button>} />
      <div className="card mb-5 flex flex-col gap-2 p-3 sm:flex-row">
        <input className="input flex-1" placeholder="Nueva tarea (ej: llamar a la desarrolladora por precios)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input sm:w-56" type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
        <button className="btn-primary" onClick={add}>Agregar</button>
      </div>
      {loading && !data && <Loading />}
      {data && !data.tasks.length && <Empty title="Sin pendientes">¡Todo al día!</Empty>}
      <div className="space-y-4">
        {groups.filter((g) => g.items.length).map((g) => (
          <Section key={g.title} title={<span className={g.tone}>{g.title} ({g.items.length})</span>}>
            <div className="divide-y divide-line">
              {g.items.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <input type="checkbox" checked={Boolean(t.done_at)} onChange={() => toggle(t)} className="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${t.done_at ? "text-muted line-through" : ""}`}>{t.title}</p>
                    <p className="text-xs text-muted">
                      {date(t.due_at, true)}
                      {t.client_id && <> · <Link to={`/clientes/${t.client_id}`} className="font-semibold text-gold">{t.client_name}</Link></>}
                      {all && t.assigned_name ? ` · ${t.assigned_name}` : ""}{t.auto ? " · automático" : ""}
                    </p>
                  </div>
                  {!t.done_at && <button className="text-xs font-semibold text-muted hover:text-navy" onClick={() => postpone(t)}>Mañana →</button>}
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </>
  );
}
