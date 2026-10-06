import { useState } from "react";
import { Link } from "react-router-dom";
import { api, useApi } from "../api";
import { usePermissions } from "../auth";
import { OperationForm } from "../components/OperationForm";
import { Badge, Empty, Loading, PageHeader, Stat } from "../components/ui";
import { compactUsd, date, usd } from "../format";
import { OPERATION_STATUS } from "../../shared/roles";
import type { Operation } from "../../shared/types";

type Row = Operation & { commission_usd?: number; seller_commission_usd?: number };
const COLOR = { reserva: "amber", boleto: "blue", escritura: "green", caida: "red" } as const;

export function Operations() {
  const perms = usePermissions();
  const { data, loading, reload } = useApi<{ operations: Row[] }>("/operations");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("activas");
  const ops = (data?.operations ?? []).filter((o) => filter === "todas" || (filter === "activas" ? o.status !== "caida" : o.status === filter));
  const live = (data?.operations ?? []).filter((o) => o.status !== "caida");
  const year = String(new Date().getFullYear());
  const thisYear = live.filter((o) => o.reserved_at.startsWith(year));

  async function changeStatus(o: Row, status: string) {
    if (status === "caida" && !confirm("¿Marcar la operación como caída? La unidad vuelve a quedar disponible.")) return;
    await api(`/operations/${o.id}`, { method: "PATCH", body: { status } });
    void reload();
  }
  async function editCommission(o: Row) {
    const pct = prompt("Comisión de la inmobiliaria (%)", String(o.commission_pct ?? 0));
    if (pct === null) return;
    const share = prompt("Parte del vendedor (% de la comisión)", String(o.seller_share_pct ?? 0));
    if (share === null) return;
    await api(`/operations/${o.id}`, { method: "PATCH", body: { commission_pct: Number(pct), seller_share_pct: Number(share) } });
    void reload();
  }

  return (
    <>
      <PageHeader eyebrow="Operaciones" title="Reservas y ventas" subtitle="Al registrar una reserva la unidad se marca como reservada. Al firmar boleto se generan los cobros de comisión."
        actions={<button className="btn-primary" onClick={() => setCreating(true)}>+ Registrar reserva</button>} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={`Operaciones ${year}`} value={thisYear.length} />
        <Stat label={`Volumen ${year}`} value={compactUsd(thisYear.reduce((s, o) => s + o.price_usd, 0))} />
        <Stat label="En curso (reserva/boleto)" value={live.filter((o) => o.status !== "escritura").length} />
        <Stat label={perms.finance ? `Comisiones ${year}` : `Mis comisiones ${year}`} value={compactUsd(thisYear.reduce((s, o) => s + (perms.finance ? o.commission_usd ?? 0 : o.seller_commission_usd ?? 0), 0))} tone="ok" />
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {[["activas", "Activas"], ...OPERATION_STATUS.map((s) => [s.id, s.label]), ["todas", "Todas"]].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === id ? "bg-navy text-white" : "bg-white text-muted ring-1 ring-line"}`}>{label}</button>
        ))}
      </div>
      {loading && !data && <Loading />}
      {data && !ops.length && <Empty title="Sin operaciones en esta vista" />}
      <div className="space-y-2">
        {ops.map((o) => (
          <div key={o.id} className="card flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy">{o.unit_label}</p>
              <p className="text-xs text-muted">
                {o.client_id ? <Link to={`/clientes/${o.client_id}`} className="font-semibold text-gold">{o.client_name}</Link> : o.client_name}
                {` · ${o.seller_name} · Reserva ${date(o.reserved_at)}`}{o.closed_at ? ` · Escritura ${date(o.closed_at)}` : ""}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-extrabold text-navy">{usd(o.price_usd)}</p>
              {perms.finance ? (
                <button onClick={() => editCommission(o)} className="text-xs text-muted hover:text-navy">Comisión {o.commission_pct}% = {usd(o.commission_usd)} · vendedor {usd(o.seller_commission_usd)} ✎</button>
              ) : <p className="text-xs text-muted">Tu comisión: {usd(o.seller_commission_usd)}</p>}
            </div>
            {perms.manager ? (
              <select className="input w-auto" value={o.status} onChange={(e) => changeStatus(o, e.target.value)}>
                {OPERATION_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            ) : <Badge color={COLOR[o.status]}>{OPERATION_STATUS.find((s) => s.id === o.status)?.label}</Badge>}
          </div>
        ))}
      </div>
      {creating && <OperationForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); void reload(); }} />}
    </>
  );
}
