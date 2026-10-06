import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api";
import { Empty, ErrorBox, Field, PageHeader, Section } from "../components/ui";
import { FX_DEFAULT, m2, money, usd } from "../format";
import { useSelection } from "../selection";
import { calculateQuoteOption, type QuoteAdjustment, type QuoteSettings } from "../../shared/quote";
import type { Client, Unit } from "../../shared/types";

export function ProposalBuilder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const selection = useSelection();
  const clients = useApi<{ clients: Client[] }>("/clients");
  const units = useApi<{ units: Unit[] }>(selection.ids.length ? `/inventory/units?ids=${selection.ids.join(",")}` : null);
  const [clientId, setClientId] = useState(params.get("cliente") ?? "");
  const [clientName, setClientName] = useState("");
  const [note, setNote] = useState("");
  const [settings, setSettings] = useState<QuoteSettings>({ paymentMode: "financiado", fx: FX_DEFAULT, downPercent: 30, term: 30, parkingChoice: { enabled: false, priceUSD: "" } });
  const [adjust, setAdjust] = useState<Record<string, QuoteAdjustment>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get("cliente")) setClientId(params.get("cliente")!);
  }, [params]);

  const ordered = selection.ids.map((id) => units.data?.units.find((u) => u.id === id)).filter(Boolean) as Unit[];

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>("/proposals", {
        body: { client_id: clientId || undefined, client_name: clientName, settings, note, options: ordered.map((u) => ({ unitId: u.id, ...adjust[u.id] })) },
      });
      selection.clear();
      navigate(`/propuestas/${id}/imprimir`);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }

  if (!selection.ids.length) {
    return (
      <>
        <PageHeader eyebrow="Propuesta" title="Nueva propuesta" />
        <Empty title="No hay unidades seleccionadas">
          <Link to={clientId ? `/buscar?cliente=${clientId}` : "/buscar"} className="font-semibold text-gold">Ir al buscador</Link> y tocá “Proponer” en hasta 6 unidades.
        </Empty>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Propuesta" title="Armar propuesta" subtitle="Ajustá condiciones y generá el documento para el cliente." />
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Section title="Cliente">
            <Field label="Cliente del CRM">
              <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">— Sin registrar —</option>{clients.data?.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            {!clientId && <Field label="Nombre del cliente" className="mt-3"><input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field>}
            <p className="mt-2 text-xs text-muted">Si elegís un cliente del CRM, la propuesta queda en su historial y se agenda un seguimiento en 2 días.</p>
          </Section>
          <Section title="Condiciones">
            <div className="mb-3 flex rounded-lg border border-line p-0.5">
              {(["financiado", "contado"] as const).map((m) => (
                <button key={m} onClick={() => setSettings({ ...settings, paymentMode: m })} className={`flex-1 rounded-md py-1.5 text-sm font-semibold capitalize ${settings.paymentMode === m ? "bg-navy text-white" : "text-muted"}`}>{m}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {settings.paymentMode === "financiado" && <>
                <Field label="Entrega inicial (%)"><input className="input" type="number" value={settings.downPercent} onChange={(e) => setSettings({ ...settings, downPercent: Number(e.target.value) })} /></Field>
                <Field label="Cuotas (meses)"><input className="input" type="number" value={settings.term} onChange={(e) => setSettings({ ...settings, term: Math.max(1, Number(e.target.value)) })} /></Field>
              </>}
              <Field label="Tipo de cambio (Gs/USD)"><input className="input" type="number" value={settings.fx} onChange={(e) => setSettings({ ...settings, fx: Number(e.target.value) || FX_DEFAULT })} /></Field>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={settings.parkingChoice?.enabled} onChange={(e) => setSettings({ ...settings, parkingChoice: { priceUSD: settings.parkingChoice?.priceUSD ?? "", enabled: e.target.checked } })} />
              Sumar cochera opcional (unidades sin cochera)
            </label>
            {settings.parkingChoice?.enabled && <input className="input mt-2" type="number" placeholder="Precio cochera USD" value={settings.parkingChoice.priceUSD} onChange={(e) => setSettings({ ...settings, parkingChoice: { enabled: true, priceUSD: e.target.value } })} />}
            <p className="mt-3 text-xs text-muted">Si una unidad tiene plan oficial de la desarrolladora y no aplicás descuento ni cochera, se usa ese plan.</p>
          </Section>
          <Section title="Mensaje para el cliente">
            <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional. Ej: Te comparto las opciones que conversamos…" />
          </Section>
          <ErrorBox message={error} />
          <button className="btn-gold w-full py-3" disabled={busy || (!clientId && !clientName.trim())} onClick={save}>{busy ? "Generando…" : "Generar propuesta"}</button>
        </div>

        <div className="space-y-3">
          {ordered.map((u, i) => {
            const q = calculateQuoteOption(u, u.delivery ?? "", adjust[u.id] ?? {}, settings);
            return (
              <div key={u.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="eyebrow">Opción {i + 1} · {u.developer_name}</p>
                    <p className="font-extrabold text-navy">{u.project_name} · {u.code}</p>
                    <p className="text-xs text-muted">{u.type} · {m2(u.total_m2)} · Lista {money(u.price, u.currency)}</p>
                  </div>
                  <button className="text-xs font-semibold text-bad" onClick={() => selection.toggle(u.id)}>Quitar</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Descuento (%)"><input className="input" type="number" min={0} max={100} value={adjust[u.id]?.discountPercent ?? ""} onChange={(e) => setAdjust({ ...adjust, [u.id]: { ...adjust[u.id], discountPercent: e.target.value } })} /></Field>
                  <Field label="Entrega del proyecto" className="sm:col-span-3"><input className="input" value={adjust[u.id]?.delivery ?? q.projectDelivery} onChange={(e) => setAdjust({ ...adjust, [u.id]: { ...adjust[u.id], delivery: e.target.value } })} /></Field>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-cream p-3 text-center text-sm">
                  <div><p className="text-xs text-muted">Precio final</p><p className="font-extrabold text-navy">{usd(q.finalPriceUSD)}</p></div>
                  <div><p className="text-xs text-muted">{settings.paymentMode === "contado" ? "Pago contado" : "Entrega inicial"}</p><p className="font-extrabold text-navy">{usd(q.delivery)}</p></div>
                  <div><p className="text-xs text-muted">Cuota</p><p className="font-extrabold text-navy">{settings.paymentMode === "contado" ? "—" : usd(q.payment)}</p>{q.usesOfficialPlan && <p className="text-[10px] text-ok">Plan oficial</p>}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
