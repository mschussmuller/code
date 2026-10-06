import { useState } from "react";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import type { Unit, User } from "../../shared/types";
import { ErrorBox, Field, Modal } from "./ui";

/** Registrar una reserva: marca la unidad como reservada y avisa a gerencia. */
export function OperationForm({ clientId, clientName, unitIds, onClose, onSaved }: { clientId?: string; clientName?: string; unitIds?: string[]; onClose: () => void; onSaved: () => void }) {
  const perms = usePermissions();
  const users = useApi<{ users: User[] }>(perms.manager ? "/users" : null);
  const units = useApi<{ units: Unit[] }>(unitIds?.length ? `/inventory/units?ids=${unitIds.join(",")}` : null);
  const [unitQuery, setUnitQuery] = useState("");
  const search = useApi<{ units: Unit[] }>(unitQuery.length >= 2 ? `/inventory/units?text=${encodeURIComponent(unitQuery)}&limit=20` : null);
  const [form, setForm] = useState({ unit_id: unitIds?.[0] ?? "", unit_label: "", client_name: clientName ?? "", price_usd: "", commission_pct: "3", seller_share_pct: "40", seller_id: "", reserved_at: new Date().toISOString().slice(0, 10), notes: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const options = [...(units.data?.units ?? []), ...(search.data?.units ?? [])];

  async function save() {
    try {
      await api("/operations", { body: { ...form, client_id: clientId, price_usd: Number(form.price_usd) || undefined, commission_pct: Number(form.commission_pct), seller_share_pct: Number(form.seller_share_pct) } });
      onSaved();
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <Modal title="Registrar reserva" onClose={onClose}>
      <div className="grid gap-3">
        {!clientId && <Field label="Cliente"><input className="input" value={form.client_name} onChange={set("client_name")} /></Field>}
        <Field label="Buscar unidad del inventario"><input className="input" value={unitQuery} onChange={(e) => setUnitQuery(e.target.value)} placeholder="Proyecto o código" /></Field>
        <Field label="Unidad">
          <select className="input" value={form.unit_id} onChange={set("unit_id")}>
            <option value="">— Fuera del inventario (escribir abajo) —</option>
            {options.map((u) => <option key={u.id} value={u.id}>{u.project_name} · {u.code} · {u.type} ({u.status})</option>)}
          </select>
        </Field>
        {!form.unit_id && <Field label="Descripción de la unidad"><input className="input" value={form.unit_label} onChange={set("unit_label")} placeholder="Ej: Reventa Edificio X, depto 4B" /></Field>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio final USD (vacío = precio de lista)"><input className="input" type="number" value={form.price_usd} onChange={set("price_usd")} /></Field>
          <Field label="Fecha de reserva"><input className="input" type="date" value={form.reserved_at} onChange={set("reserved_at")} /></Field>
          {perms.finance && <>
            <Field label="Comisión inmobiliaria (%)"><input className="input" type="number" step="0.1" value={form.commission_pct} onChange={set("commission_pct")} /></Field>
            <Field label="Parte del vendedor (% de la comisión)"><input className="input" type="number" value={form.seller_share_pct} onChange={set("seller_share_pct")} /></Field>
          </>}
          {perms.manager && (
            <Field label="Vendedor" className="col-span-2">
              <select className="input" value={form.seller_id} onChange={set("seller_id")}><option value="">Yo</option>{users.data?.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            </Field>
          )}
        </div>
        <Field label="Notas"><textarea className="input" rows={2} value={form.notes} onChange={set("notes")} /></Field>
      </div>
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Registrar</button></div>
    </Modal>
  );
}
