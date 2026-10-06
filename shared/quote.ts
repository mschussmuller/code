// Cotizador: misma lógica del sistema anterior (legacy/vantage-property-os/app/quote-options.ts).
export type QuoteUnit = {
  currency: "USD" | "PYG";
  price: number;
  parking: number;
  down_payment?: number | null;
  monthly_payment?: number | null;
};
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

export function calculateQuoteOption(unit: QuoteUnit, projectDelivery: string, adjustment: QuoteAdjustment, settings: QuoteSettings) {
  const { paymentMode, fx, downPercent, term, parkingChoice } = settings;
  const enteredDiscount = Number(adjustment.discountPercent);
  const appliedDiscountPercent = Number.isFinite(enteredDiscount) ? Math.min(100, Math.max(0, enteredDiscount)) : 0;
  const unitPriceUSD = unit.currency === "USD" ? unit.price : unit.price / fx;
  const parkingPrice = Number(parkingChoice?.priceUSD);
  const optionalParkingPriceUSD = unit.parking === 0 && parkingChoice?.enabled && Number.isFinite(parkingPrice) ? Math.max(0, parkingPrice) : 0;
  const discountUSD = unitPriceUSD * (appliedDiscountPercent / 100);
  const finalPriceUSD = unitPriceUSD - discountUSD + optionalParkingPriceUSD;
  const usesOfficialPlan = paymentMode === "financiado" && appliedDiscountPercent === 0 && optionalParkingPriceUSD === 0 && Boolean(unit.monthly_payment);
  const toUSD = (v: number) => (unit.currency === "USD" ? v : v / fx);
  const delivery = paymentMode === "contado"
    ? finalPriceUSD
    : usesOfficialPlan && unit.down_payment ? toUSD(unit.down_payment) : finalPriceUSD * (downPercent / 100);
  const payment = paymentMode === "contado"
    ? 0
    : usesOfficialPlan && unit.monthly_payment ? toUSD(unit.monthly_payment) : (finalPriceUSD - delivery) / term;
  return {
    unitPriceUSD, appliedDiscountPercent, optionalParkingPriceUSD, discountUSD,
    finalPriceUSD, usesOfficialPlan, delivery, payment,
    projectDelivery: quoteDelivery(projectDelivery, adjustment.delivery),
  };
}

export function priceUSD(unit: { currency: "USD" | "PYG"; price: number }, fx: number) {
  return unit.currency === "USD" ? unit.price : unit.price / fx;
}
