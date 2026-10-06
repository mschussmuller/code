import { describe, expect, it } from "vitest";
import { calculateQuoteOption, quoteDelivery } from "../shared/quote";

const settings = { paymentMode: "financiado" as const, fx: 8000, downPercent: 30, term: 30 };

describe("calculateQuoteOption", () => {
  it("usa el plan oficial cuando no hay descuento ni cochera", () => {
    const q = calculateQuoteOption({ currency: "USD", price: 100000, parking: 0, down_payment: 25000, monthly_payment: 2000 }, "Mayo 2028", {}, settings);
    expect(q.usesOfficialPlan).toBe(true);
    expect(q.delivery).toBe(25000);
    expect(q.payment).toBe(2000);
  });

  it("recalcula con descuento y cochera opcional", () => {
    const q = calculateQuoteOption({ currency: "USD", price: 100000, parking: 0, monthly_payment: 2000 }, "", { discountPercent: "10" },
      { ...settings, parkingChoice: { enabled: true, priceUSD: "15000" } });
    expect(q.finalPriceUSD).toBe(105000);
    expect(q.delivery).toBeCloseTo(31500);
    expect(q.payment).toBeCloseTo(2450);
    expect(q.usesOfficialPlan).toBe(false);
  });

  it("no suma cochera a unidades que ya la incluyen y convierte guaraníes", () => {
    const q = calculateQuoteOption({ currency: "PYG", price: 800_000_000, parking: 1 }, "", {}, { ...settings, paymentMode: "contado", parkingChoice: { enabled: true, priceUSD: "15000" } });
    expect(q.finalPriceUSD).toBe(100000);
    expect(q.delivery).toBe(100000);
    expect(q.payment).toBe(0);
  });

  it("limita el descuento entre 0 y 100", () => {
    expect(calculateQuoteOption({ currency: "USD", price: 1000, parking: 0 }, "", { discountPercent: "150" }, settings).finalPriceUSD).toBe(0);
    expect(calculateQuoteOption({ currency: "USD", price: 1000, parking: 0 }, "", { discountPercent: "-5" }, settings).finalPriceUSD).toBe(1000);
  });
});

describe("quoteDelivery", () => {
  it("oculta fechas sin confirmar y respeta lo que escribe el asesor", () => {
    expect(quoteDelivery("Requiere confirmación")).toBe("");
    expect(quoteDelivery("Marzo de 2029")).toBe("Marzo de 2029");
    expect(quoteDelivery("Marzo de 2029", " Abril 2029 ")).toBe("Abril 2029");
  });
});
