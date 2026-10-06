import { useState } from "react";
import { api, useApi } from "../api";
import { Badge, Empty, ErrorBox, Field, Loading, Modal, PageHeader, Section, Stat } from "../components/ui";
import { compactUsd, date, usd } from "../format";
import type { Payment, User } from "../../shared/types";

type Summary = {
  year: number;
  months: { month: string; income: number; payouts: number; expenses: number }[];
  pending: { receivable: number | null; overdue_receivable: number | null; payable: number | null };
  expensesByCategory: { category: string; total: number }[];
  sellers: { id: string; name: string; operations: number; volume: number; commission: number; seller_commission: number }[];
};
const KIND = { cobro: ["Cobro comisión", "green"], ingreso: ["Otro ingreso", "green"], pago_vendedor: ["Pago a vendedor", "blue"], gasto: ["Gasto", "red"] } as const;
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const EXPENSE_CATEGORIES = ["Publicidad", "Sueldos", "Alquiler oficina", "Servicios", "Movilidad", "Impuestos", "Honorarios", "Otros"];

export function Finance() {
  const [year, setYear] = useState(new Date().getFullYear());
  const summary = useApi<Summary>(`/finance/summary?year=${year}`);
  const payments = useApi<{ payments: Payment[] }>("/finance/payments");
  const [tab, setTab] = useState<"pendientes" | "movimientos">("pendientes");
  const [creating, setCreating] = useState(false);
  const s = summary.data;
  const totals = s?.months.reduce((acc, m) => ({ income: acc.income + m.income, out: acc.out + m.payouts + m.expenses }), { income: 0, out: 0 }) ?? { income: 0, out: 0 };
  const max = Math.max(1, ...(s?.months.flatMap((m) => [m.income, m.payouts + m.expenses]) ?? [1]));
  const list = (payments.data?.payments ?? []).filter((p) => (tab === "pendientes" ? !p.paid_date : Boolean(p.paid_date)));

  async function markPaid(p: Payment) {
    const when = prompt("Fecha de pago (AAAA-MM-DD)", new Date().toISOString().slice(0, 10));
    if (!when) return;
    await api(`/finance/payments/${p.id}`, { method: "PATCH", body: { paid_date: when } });
    void payments.reload(); void summary.reload();
  }
  async function remove(p: Payment) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await api(`/finance/payments/${p.id}`, { method: "DELETE" });
    void payments.reload(); void summary.reload();
  }

  return (
    <>
      <PageHeader eyebrow="Administración · acceso restringido" title="Finanzas" subtitle="Comisiones, cobranzas, pagos a vendedores, gastos y rentabilidad."
        actions={<>
          <select className="input w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))}>{[0, 1, 2].map((d) => <option key={d}>{new Date().getFullYear() - d}</option>)}</select>
          <button className="btn-primary" onClick={() => setCreating(true)}>+ Movimiento</button>
        </>} />
      {summary.loading && !s && <Loading />}
      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Comisiones a cobrar" value={compactUsd(s.pending.receivable ?? 0)} hint={s.pending.overdue_receivable ? `${usd(s.pending.overdue_receivable)} vencidas` : "Nada vencido"} tone={s.pending.overdue_receivable ? "bad" : "warn"} />
            <Stat label="A pagar a vendedores" value={compactUsd(s.pending.payable ?? 0)} />
            <Stat label={`Ingresos cobrados ${year}`} value={compactUsd(totals.income)} tone="ok" />
            <Stat label={`Resultado ${year}`} value={compactUsd(totals.income - totals.out)} hint={`Egresos ${compactUsd(totals.out)}`} tone={totals.income - totals.out >= 0 ? "ok" : "bad"} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Section title="Ingresos vs. egresos por mes" className="lg:col-span-2">
              <div className="flex h-48 items-end gap-1.5">
                {MONTHS.map((label, i) => {
                  const m = s.months.find((x) => x.month === `${year}-${String(i + 1).padStart(2, "0")}`);
                  const inc = m?.income ?? 0;
                  const out = (m?.payouts ?? 0) + (m?.expenses ?? 0);
                  return (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1" title={`${label}: ingresos ${usd(inc)} · egresos ${usd(out)}`}>
                      <div className="flex h-40 w-full items-end justify-center gap-0.5">
                        <div className="w-1/2 rounded-t bg-ok" style={{ height: `${(inc / max) * 100}%` }} />
                        <div className="w-1/2 rounded-t bg-bad/70" style={{ height: `${(out / max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted">{label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted"><span className="text-ok">■</span> Ingresos <span className="ml-3 text-bad">■</span> Egresos (gastos + pagos a vendedores)</p>
            </Section>
            <Section title={`Gastos ${year} por categoría`}>
              {!s.expensesByCategory.length && <p className="text-sm text-muted">Sin gastos registrados.</p>}
              {s.expensesByCategory.map((e) => <p key={e.category} className="flex justify-between border-b border-line/60 py-1.5 text-sm last:border-0"><span>{e.category}</span><b>{usd(e.total)}</b></p>)}
            </Section>
          </div>

          <Section title={`Rentabilidad por vendedor · ${year}`} className="mt-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="py-2">Vendedor</th><th>Operaciones</th><th>Volumen</th><th>Comisión generada</th><th>Comisión vendedor</th><th>Neto empresa</th></tr></thead>
                <tbody>{s.sellers.map((v) => <tr key={v.id} className="border-b border-line/60 last:border-0"><td className="py-2 font-bold">{v.name}</td><td>{v.operations}</td><td>{compactUsd(v.volume)}</td><td>{usd(v.commission)}</td><td>{usd(v.seller_commission)}</td><td className="font-bold text-ok">{usd(v.commission - v.seller_commission)}</td></tr>)}</tbody>
              </table>
            </div>
          </Section>
        </>
      )}

      <div className="mb-3 mt-6 flex gap-1">
        {(["pendientes", "movimientos"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${tab === t ? "bg-navy text-white" : "bg-white text-muted ring-1 ring-line"}`}>{t === "pendientes" ? "Pendientes de cobro/pago" : "Movimientos realizados"}</button>)}
      </div>
      {payments.data && !list.length && <Empty title="Sin movimientos" />}
      <div className="card divide-y divide-line">
        {list.map((p) => {
          const overdue = !p.paid_date && p.due_date && p.due_date < new Date().toISOString().slice(0, 10);
          return (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-3">
              <Badge color={KIND[p.kind][1]}>{KIND[p.kind][0]}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{p.description}</p>
                <p className={`text-xs ${overdue ? "font-bold text-bad" : "text-muted"}`}>{p.paid_date ? `Pagado ${date(p.paid_date)}` : p.due_date ? `Vence ${date(p.due_date)}` : "Sin fecha"}{p.user_name ? ` · ${p.user_name}` : ""}{p.category ? ` · ${p.category}` : ""}</p>
              </div>
              <p className={`font-extrabold ${p.kind === "cobro" || p.kind === "ingreso" ? "text-ok" : "text-bad"}`}>{p.kind === "cobro" || p.kind === "ingreso" ? "+" : "−"}{usd(p.amount_usd)}</p>
              {!p.paid_date && <button className="btn-ghost py-1 text-xs" onClick={() => markPaid(p)}>Marcar {p.kind === "cobro" || p.kind === "ingreso" ? "cobrado" : "pagado"}</button>}
              <button className="text-xs text-muted hover:text-bad" onClick={() => remove(p)}>Eliminar</button>
            </div>
          );
        })}
      </div>
      {creating && <PaymentForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); void payments.reload(); void summary.reload(); }} />}
    </>
  );
}

function PaymentForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const users = useApi<{ users: User[] }>("/users");
  const [form, setForm] = useState({ kind: "gasto", category: "", description: "", amount_usd: "", due_date: "", paid_date: new Date().toISOString().slice(0, 10), user_id: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  async function save() {
    try { await api("/finance/payments", { body: { ...form, amount_usd: Number(form.amount_usd) } }); onSaved(); } catch (e) { setError((e as Error).message); }
  }
  return (
    <Modal title="Nuevo movimiento" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo"><select className="input" value={form.kind} onChange={set("kind")}>{Object.entries(KIND).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <Field label="Monto (USD)"><input className="input" type="number" value={form.amount_usd} onChange={set("amount_usd")} /></Field>
        <Field label="Descripción" className="col-span-2"><input className="input" value={form.description} onChange={set("description")} /></Field>
        {form.kind === "gasto" && <Field label="Categoría" className="col-span-2"><select className="input" value={form.category} onChange={set("category")}><option value="">—</option>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>}
        {form.kind === "pago_vendedor" && <Field label="Vendedor" className="col-span-2"><select className="input" value={form.user_id} onChange={set("user_id")}><option value="">—</option>{users.data?.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>}
        <Field label="Vencimiento"><input className="input" type="date" value={form.due_date} onChange={set("due_date")} /></Field>
        <Field label="Fecha de pago (vacío = pendiente)"><input className="input" type="date" value={form.paid_date} onChange={set("paid_date")} /></Field>
      </div>
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Guardar</button></div>
    </Modal>
  );
}
