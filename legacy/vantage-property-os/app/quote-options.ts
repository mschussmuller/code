import type { Project, Unit } from "./data";

export type QuoteAdjustment = { discountPercent?: string; delivery?: string };
export type QuoteSettings = {
  paymentMode: "financiado" | "contado";
  fx: number;
  downPercent: number;
  term: number;
  parkingChoice?: { enabled: boolean; priceUSD: string };
};

export function quoteDelivery(source: string, entered?: string) {
  // An explicit empty value hides the field. Free text is not a date parser.
  if (entered !== undefined) return entered.trim();
  return /requiere confirmación|pendiente|por confirmar|sin fecha/i.test(source) ? "" : source;
}

export function discountSummary(percentages: number[]) {
  const distinct = [...new Set(percentages)];
  if (!distinct.length || (distinct.length === 1 && distinct[0] === 0)) return "Sin descuento";
  return distinct.length === 1 ? `${distinct[0]}%` : "Por opción";
}

export function calculateQuoteOption(unit: Unit, project: Project, adjustment: QuoteAdjustment, settings: QuoteSettings) {
  const { paymentMode, fx, downPercent, term, parkingChoice } = settings;
  const enteredDiscount = Number(adjustment.discountPercent);
  const appliedDiscountPercent = Number.isFinite(enteredDiscount) ? Math.min(100, Math.max(0, enteredDiscount)) : 0;
  const unitPriceUSD = unit.currency === "USD" ? unit.price : unit.price / fx;
  const parkingPrice = Number(parkingChoice?.priceUSD);
  const optionalParkingPriceUSD = unit.parking === 0 && parkingChoice?.enabled && Number.isFinite(parkingPrice) ? Math.max(0, parkingPrice) : 0;
  const discountUSD = unitPriceUSD * (appliedDiscountPercent / 100);
  const finalPriceUSD = unitPriceUSD - discountUSD + optionalParkingPriceUSD;
  const usesOfficialPlan = paymentMode === "financiado" && appliedDiscountPercent === 0 && optionalParkingPriceUSD === 0 && Boolean(unit.monthlyPayment);
  const delivery = paymentMode === "contado" ? finalPriceUSD : usesOfficialPlan && unit.downPayment ? (unit.currency === "USD" ? unit.downPayment : unit.downPayment / fx) : finalPriceUSD * (downPercent / 100);
  const payment = paymentMode === "contado" ? 0 : usesOfficialPlan && unit.monthlyPayment ? (unit.currency === "USD" ? unit.monthlyPayment : unit.monthlyPayment / fx) : (finalPriceUSD - delivery) / term;
  return {
    unitPriceUSD, appliedDiscountPercent, optionalParkingPriceUSD, discountUSD,
    finalPriceUSD, usesOfficialPlan, delivery, payment,
    projectDelivery: quoteDelivery(project.delivery, adjustment.delivery),
    deliverySource: adjustment.delivery !== undefined ? "advisor" : "project",
  };
}
