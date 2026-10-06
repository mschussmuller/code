import { useState } from "react";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import { CLIENT_STAGES } from "../../shared/roles";
import type { Client, User } from "../../shared/types";
import { ErrorBox, Field, Modal } from "./ui";

const SOURCES = ["Referido", "Instagram", "Facebook", "WhatsApp", "Portal inmobiliario", "Web", "Cartel / oficina", "Cliente anterior", "Otro"];

export function ClientForm({ client, onClose, onSaved }: { client?: Client; onClose: () => void; onSaved: (id: string) => void }) {
  const perms = usePermissions();
  const users = useApi<{ users: User[] }>(perms.manager ? "/users" : null);
  const [form, setForm] = useState({
    name: client?.name ?? "", phone: client?.phone ?? "", email: client?.email ?? "", source: client?.source ?? "", stage: client?.stage ?? "nuevo",
    purpose: client?.purpose ?? "", budget_min_usd: client?.budget_min_usd?.toString() ?? "", budget_max_usd: client?.budget_max_usd?.toString() ?? "",
    bedrooms_min: client?.bedrooms_min?.toString() ?? "", zones: client?.zones ?? "", preferences: client?.preferences ?? "", notes: client?.notes ?? "",
    assigned_to: client?.assigned_to ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const num = (v: string) => (v === "" ? null : Number(v));

  async function save() {
    setBusy(true);
    const payload = { ...form, budget_min_usd: num(form.budget_min_usd), budget_max_usd: num(form.budget_max_usd), bedrooms_min: num(form.bedrooms_min) };
    try {
      if (client) { await api(`/clients/${client.id}`, { method: "PATCH", body: payload }); onSaved(client.id); }
      else onSaved((await api<{ id: string }>("/clients", { body: payload })).id);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  return (
    <Modal title={client ? "Editar cliente" : "Nuevo cliente"} onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Nombre y apellido" className="sm:col-span-2"><input className="input" value={form.name} onChange={set("name")} autoFocus /></Field>
        <Field label="Origen"><select className="input" value={form.source} onChange={set("source")}><option value="">—</option>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="WhatsApp / teléfono"><input className="input" value={form.phone} onChange={set("phone")} placeholder="0981 123 456" /></Field>
        <Field label="Email"><input className="input" type="email" value={form.email} onChange={set("email")} /></Field>
        <Field label="Etapa"><select className="input" value={form.stage} onChange={set("stage")}>{CLIENT_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Field>
        <p className="eyebrow pt-2 sm:col-span-3">Qué busca</p>
        <Field label="Objetivo"><select className="input" value={form.purpose} onChange={set("purpose")}><option value="">—</option><option>Vivienda</option><option>Inversión</option><option>Oficina</option></select></Field>
        <Field label="Presupuesto desde (USD)"><input className="input" type="number" value={form.budget_min_usd} onChange={set("budget_min_usd")} /></Field>
        <Field label="Presupuesto hasta (USD)"><input className="input" type="number" value={form.budget_max_usd} onChange={set("budget_max_usd")} /></Field>
        <Field label="Dormitorios"><select className="input" value={form.bedrooms_min} onChange={set("bedrooms_min")}><option value="">Cualquiera</option><option value="0">Monoambiente</option><option value="1">1</option><option value="2">2</option><option value="3">3 o más</option></select></Field>
        <Field label="Zonas preferidas" className="sm:col-span-2"><input className="input" value={form.zones} onChange={set("zones")} placeholder="Recoleta, Villa Morra" /></Field>
        <Field label="Preferencias (cochera, amoblado, entrega, financiación…)" className="sm:col-span-3"><textarea className="input" rows={2} value={form.preferences} onChange={set("preferences")} /></Field>
        <Field label="Notas internas" className="sm:col-span-2"><textarea className="input" rows={2} value={form.notes} onChange={set("notes")} /></Field>
        {perms.manager && (
          <Field label="Vendedor asignado">
            <select className="input" value={form.assigned_to} onChange={set("assigned_to")}>
              <option value="">Yo</option>{users.data?.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
        )}
      </div>
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={busy || !form.name.trim()} onClick={save}>Guardar</button></div>
    </Modal>
  );
}
