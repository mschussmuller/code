import { Link, useParams } from "react-router-dom";
import { useApi } from "../api";
import { Icon } from "../components/Icon";
import { ErrorBox, Loading } from "../components/ui";
import { date, m2, parking, parseJson, usd, whatsappLink } from "../format";
import { calculateQuoteOption } from "../../shared/quote";
import type { Proposal, ProposalOption, ProposalSettings, Unit } from "../../shared/types";

type PUnit = Unit & { image_url?: string | null; color?: string | null; brochure_url?: string | null; map_query?: string | null };

export function ProposalView() {
  const { id } = useParams();
  const { data, error, loading } = useApi<{ proposal: Proposal; units: PUnit[] }>(`/proposals/${id}`);
  if (loading && !data) return <Loading />;
  if (!data) return <div className="p-6"><ErrorBox message={error} /></div>;
  const p = data.proposal;
  const settings = parseJson<ProposalSettings>(p.settings, { paymentMode: "financiado", fx: 7900, downPercent: 30, term: 30 });
  const options = parseJson<ProposalOption[]>(p.options, []);
  const rows = options.map((o) => ({ o, u: data.units.find((u) => u.id === o.unitId) })).filter((r): r is { o: ProposalOption; u: PUnit } => Boolean(r.u));
  const quotes = rows.map(({ o, u }) => ({ u, q: calculateQuoteOption(u, u.delivery ?? "", o, settings) }));

  const waText = [
    `Hola ${p.client_name.split(" ")[0]}! Te comparto las opciones que preparamos en Vantage Real Estate:`,
    ...quotes.map(({ u, q }, i) => `\n*Opción ${i + 1}: ${u.project_name} · ${u.code}*\n${u.type} · ${m2(u.total_m2)} · ${u.location}\nPrecio: ${usd(q.finalPriceUSD)}${settings.paymentMode === "financiado" ? `\nEntrega: ${usd(q.delivery)} + cuotas de ${usd(q.payment)}` : ""}${q.projectDelivery ? `\nEntrega del proyecto: ${q.projectDelivery}` : ""}`),
    `\nQuedo atento a tus comentarios. ${p.user_name}`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-cream/40 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
        <Link to={p.client_id ? `/clientes/${p.client_id}` : "/propuestas"} className="text-sm font-semibold text-muted">← Volver</Link>
        <div className="flex gap-2">
          <a className="btn-ghost" href={whatsappLink((p as Proposal & { client_phone?: string | null }).client_phone, waText)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> Enviar por WhatsApp</a>
          <button className="btn-primary" onClick={() => window.print()}><Icon name="print" size={16} /> Imprimir / PDF</button>
        </div>
      </div>

      <article className="mx-auto max-w-4xl bg-white p-6 shadow-sm sm:my-6 sm:rounded-2xl sm:p-10 print:my-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-gold pb-6">
          <img src="/brand/vantage-logo-transparent.png" alt="Vantage Real Estate" className="w-36" />
          <div className="text-right">
            <p className="eyebrow">Propuesta comercial</p>
            <h1 className="font-editorial text-3xl text-navy">{p.client_name}</h1>
            <p className="text-sm text-muted">{date(p.created_at)}</p>
          </div>
        </header>
        {p.note && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed">{p.note}</p>}
        <p className="mt-6 text-sm text-muted">
          Seleccionamos {quotes.length} opción{quotes.length === 1 ? "" : "es"} según tu búsqueda.
          Modalidad: <b className="text-ink">{settings.paymentMode === "contado" ? "pago contado" : `financiado · ${settings.downPercent}% de entrega y ${settings.term} cuotas`}</b>.
        </p>

        <div className="mt-6 space-y-5">
          {quotes.map(({ u, q }, i) => (
            <section key={u.id} className="overflow-hidden rounded-2xl border border-line" style={{ breakInside: "avoid" }}>
              <div className="flex flex-col sm:flex-row print:flex-row">
                <div className="h-40 shrink-0 bg-navy sm:h-auto sm:w-56 print:h-auto print:w-56" style={{ background: u.image_url ? undefined : `linear-gradient(135deg, ${u.color ?? "#0b1f3a"}, #0b1f3a)` }}>
                  {u.image_url ? <img src={u.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-4 text-center font-editorial text-2xl text-white">{u.project_name}</div>}
                </div>
                <div className="flex-1 p-5">
                  <p className="eyebrow">Opción {i + 1} · {u.developer_name}</p>
                  <h2 className="text-xl font-extrabold text-navy">{u.project_name}</h2>
                  <p className="text-sm text-muted">{u.location}{q.projectDelivery ? ` · Entrega ${q.projectDelivery}` : ""}</p>
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4 print:grid-cols-4">
                    <p><span className="text-muted">Unidad</span><br /><b>{u.code}</b></p>
                    <p><span className="text-muted">Tipología</span><br /><b>{u.type}</b></p>
                    <p><span className="text-muted">Superficie</span><br /><b>{m2(u.total_m2)}</b></p>
                    <p><span className="text-muted">Cochera</span><br /><b>{q.optionalParkingPriceUSD ? "Incluida (adicional)" : parking(u.parking)}</b></p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-cream p-3 text-center">
                    <div>
                      <p className="text-[11px] text-muted">Precio{q.appliedDiscountPercent ? ` (-${q.appliedDiscountPercent}%)` : ""}</p>
                      {q.appliedDiscountPercent ? <p className="text-xs text-muted line-through">{usd(q.unitPriceUSD)}</p> : null}
                      <p className="text-lg font-extrabold text-navy">{usd(q.finalPriceUSD)}</p>
                    </div>
                    <div><p className="text-[11px] text-muted">{settings.paymentMode === "contado" ? "Contado" : "Entrega inicial"}</p><p className="text-lg font-extrabold text-navy">{usd(q.delivery)}</p></div>
                    <div><p className="text-[11px] text-muted">{settings.paymentMode === "contado" ? "Cuotas" : q.usesOfficialPlan ? "Cuota (plan desarrolladora)" : `${settings.term} cuotas de`}</p><p className="text-lg font-extrabold text-navy">{settings.paymentMode === "contado" ? "—" : usd(q.payment)}</p></div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-6 text-sm">
          <div>
            <p className="eyebrow">Tu asesor</p>
            <p className="font-bold text-navy">{p.user_name}</p>
            <p className="text-muted">{[p.user_phone, p.user_email].filter(Boolean).join(" · ")}</p>
          </div>
          <p className="max-w-sm text-[11px] leading-snug text-muted">Precios en dólares americanos, sujetos a disponibilidad y confirmación final de la desarrolladora al momento de la reserva. Valores referenciales.</p>
        </footer>
      </article>
    </div>
  );
}
