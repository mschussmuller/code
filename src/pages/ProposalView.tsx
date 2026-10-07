import { Link, useParams } from "react-router-dom";
import { useApi } from "../api";
import { Icon } from "../components/Icon";
import { ErrorBox, Loading } from "../components/ui";
import { date, m2, parseJson, pyg, usd, whatsappLink } from "../format";
import { calculateQuoteOption } from "../../shared/quote";
import type { Proposal, ProposalOption, ProposalSettings, Unit } from "../../shared/types";

type PUnit = Unit & { image_url?: string | null; color?: string | null; brochure_url?: string | null; map_query?: string | null; plans_url?: string | null };

/** Los enlaces de la propuesta se comparten con clientes: siempre absolutos. */
const absolute = (url: string | null | undefined) => (!url ? null : url.startsWith("/") ? `${window.location.origin}${url}` : url);
const mapsUrl = (u: PUnit) => (u.map_query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.map_query)}` : null);

export function ProposalView() {
  const { id } = useParams();
  const { data, error, loading } = useApi<{ proposal: Proposal & { client_phone?: string | null }; units: PUnit[] }>(`/proposals/${id}`);
  if (loading && !data) return <Loading />;
  if (!data) return <div className="p-6"><ErrorBox message={error} /></div>;
  const p = data.proposal;
  const settings = parseJson<ProposalSettings>(p.settings, { paymentMode: "financiado", fx: 7900, downPercent: 30, term: 30 });
  const options = parseJson<ProposalOption[]>(p.options, []);
  const quotes = options
    .map((o) => ({ o, u: data.units.find((u) => u.id === o.unitId) }))
    .filter((r): r is { o: ProposalOption; u: PUnit } => Boolean(r.u))
    .map(({ o, u }) => ({ u, q: calculateQuoteOption(u, u.delivery ?? "", o, settings) }));

  const waText = [
    `Hola ${p.client_name.split(" ")[0]}! Te comparto las opciones que preparamos en Vantage Real Estate:`,
    ...quotes.map(({ u, q }, i) => [
      `\n*Opción ${i + 1}: ${u.project_name} · Unidad ${u.code}*`,
      `${u.type} · ${m2(u.total_m2)} · ${u.location}`,
      `Precio: ${usd(q.finalPriceUSD)}`,
      settings.paymentMode === "financiado" ? `Entrega: ${usd(q.delivery)} + cuotas de ${usd(q.payment)}` : null,
      q.projectDelivery ? `Entrega del proyecto: ${q.projectDelivery}` : null,
      absolute(u.brochure_url) ? `Brochure: ${absolute(u.brochure_url)}` : null,
      mapsUrl(u) ? `Ubicación: ${mapsUrl(u)}` : null,
    ].filter(Boolean).join("\n")),
    `\nQuedo atento a tus comentarios. ${p.user_name}`,
  ].join("\n");

  return (
    <div className="min-h-screen bg-cream/40 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
        <Link to={p.client_id ? `/clientes/${p.client_id}` : "/propuestas"} className="text-sm font-semibold text-muted">← Volver</Link>
        <div className="flex gap-2">
          <a className="btn-ghost" href={whatsappLink(p.client_phone, waText)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> Enviar por WhatsApp</a>
          <button className="btn-primary" onClick={() => window.print()}><Icon name="print" size={16} /> Imprimir / PDF</button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 py-6 print:max-w-none print:space-y-0 print:py-0">
        {quotes.map(({ u, q }, i) => {
          const fx = settings.fx;
          const toUSD = (v: number) => (u.currency === "USD" ? v : v / fx);
          const balance = u.balance_on_delivery ? toUSD(u.balance_on_delivery) : 0;
          const installments = q.usesOfficialPlan && q.payment > 0 ? Math.max(1, Math.round((q.unitPriceUSD - q.delivery - balance) / q.payment)) : settings.term;
          const parkingLabel = u.parking > 0 ? `${u.parking} incluida${u.parking > 1 ? "s" : ""}` : q.optionalParkingPriceUSD > 0 ? `Opcional · ${usd(q.optionalParkingPriceUSD)}` : u.parking < 0 ? "A confirmar" : "No incluida";
          const brochure = absolute(u.brochure_url);
          const maps = mapsUrl(u);
          const plans = absolute(u.plans_url);
          return (
            <article key={u.id} className="print-page overflow-hidden bg-white shadow-sm sm:rounded-2xl print:rounded-none print:shadow-none" style={{ breakInside: "avoid" }}>
              <header className="flex items-center justify-between gap-4 px-8 pb-4 pt-7">
                <img src="/brand/vantage-logo-transparent.png" alt="Vantage Real Estate" className="w-28" />
                <div className="text-right">
                  <p className="eyebrow">Propuesta comercial{quotes.length > 1 ? ` · Opción ${i + 1} de ${quotes.length}` : ""}</p>
                  <p className="font-editorial text-2xl text-navy">{p.client_name}</p>
                  <p className="text-xs text-muted">{date(p.created_at)}</p>
                </div>
              </header>

              <section className="relative mx-8 h-72 overflow-hidden rounded-2xl bg-navy print:h-64" style={{ background: u.image_url ? undefined : `linear-gradient(135deg, ${u.color ?? "#0b1f3a"}, #0b1f3a)` }}>
                {u.image_url && <img src={u.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-gold-light">{u.developer_name} · {u.stage}</p>
                  <h1 className="text-3xl font-extrabold leading-tight">{u.project_name}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/85"><Icon name="map" size={14} /> {u.location}{q.projectDelivery ? ` · ${/^(entreg|proyecto terminado|terminado|listo)/i.test(q.projectDelivery) ? q.projectDelivery : `Entrega ${q.projectDelivery}`}` : ""}</p>
                </div>
              </section>

              <div className="grid gap-6 px-8 py-6 sm:grid-cols-[1fr_1.15fr] print:grid-cols-[1fr_1.15fr]">
                <section>
                  <p className="eyebrow mb-2">La unidad</p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div><dt className="text-xs text-muted">Unidad</dt><dd className="font-bold">{u.code}{u.floor ? ` · ${/piso|casa|pb|planta/i.test(u.floor) ? u.floor : `Piso ${u.floor}`}` : ""}</dd></div>
                    <div><dt className="text-xs text-muted">Tipología</dt><dd className="font-bold">{u.type}</dd></div>
                    <div><dt className="text-xs text-muted">Superficie</dt><dd className="font-bold">{m2(u.total_m2)}</dd></div>
                    <div><dt className="text-xs text-muted">Cochera</dt><dd className="font-bold">{parkingLabel}</dd></div>
                  </dl>
                  <div className="mt-5 rounded-2xl bg-navy p-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-[.14em] text-gold-light">{q.appliedDiscountPercent || q.optionalParkingPriceUSD ? "Precio final" : "Precio de lista"}</p>
                    {q.appliedDiscountPercent > 0 && <p className="text-sm text-white/60 line-through">{usd(q.unitPriceUSD)}</p>}
                    <p className="text-3xl font-extrabold">{usd(q.finalPriceUSD)}</p>
                    {u.currency === "PYG" && <p className="text-xs text-white/70">{pyg(q.finalPriceUSD * fx)}</p>}
                    {q.appliedDiscountPercent > 0 && <p className="mt-1 text-xs text-gold-light">Incluye {q.appliedDiscountPercent}% de descuento (−{usd(q.discountUSD)})</p>}
                  </div>
                </section>

                <section>
                  <p className="eyebrow mb-2">{settings.paymentMode === "contado" ? "Forma de pago" : q.usesOfficialPlan ? "Plan oficial de la desarrolladora" : "Plan de pago estimado"}</p>
                  <ol className="space-y-2">
                    {(settings.paymentMode === "contado"
                      ? [["Pago único", usd(q.finalPriceUSD), "Al confirmar la operación"]]
                      : [
                          ["Entrega inicial", usd(q.delivery), "Al reservar"],
                          ["Durante obra", usd(q.payment), `${installments} cuotas${q.usesOfficialPlan ? "" : " estimadas"}`],
                          ...(balance > 0 ? [["Contra entrega", usd(balance), "Saldo final"]] : []),
                        ]).map(([label, value, hint], n) => (
                      <li key={label} className="flex items-center gap-3 rounded-xl border border-line p-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-light font-extrabold text-navy">{n + 1}</span>
                        <span className="flex-1"><span className="block text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span><span className="text-xs text-muted">{hint}</span></span>
                        <span className="text-lg font-extrabold text-navy">{value}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {brochure && <a href={brochure} target="_blank" rel="noreferrer" className="btn-gold py-2"><Icon name="file" size={15} /> Ver brochure</a>}
                    {maps && <a href={maps} target="_blank" rel="noreferrer" className="btn-ghost py-2"><Icon name="map" size={15} /> Ver ubicación</a>}
                    {plans && <a href={plans} target="_blank" rel="noreferrer" className="btn-ghost py-2"><Icon name="building" size={15} /> Ver planos</a>}
                  </div>
                </section>
              </div>

              <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-line px-8 py-5 text-sm">
                <div>
                  <p className="eyebrow">Tu asesor</p>
                  <p className="font-bold text-navy">{p.user_name}</p>
                  <p className="text-muted">{[p.user_phone, p.user_email].filter(Boolean).join(" · ")}</p>
                </div>
                <p className="max-w-sm text-[10px] leading-snug text-muted">
                  Precio, disponibilidad y condiciones sujetos a confirmación final con la desarrolladora. Documento informativo, sin validez contractual.
                  {!q.usesOfficialPlan && settings.paymentMode === "financiado" ? " Las cuotas son estimativas." : ""}
                  {u.currency === "PYG" ? ` Cotización referencial: USD 1 = Gs. ${fx.toLocaleString("es-PY")}.` : ""}
                </p>
              </footer>
              {i === 0 && p.note && <p className="mx-8 mb-6 whitespace-pre-line rounded-xl bg-cream p-4 text-sm">{p.note}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
