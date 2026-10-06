export const FX_DEFAULT = 7900;

const usdFmt = new Intl.NumberFormat("es-PY", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pygFmt = new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 });

export const usd = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "—" : usdFmt.format(v));
export const pyg = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "—" : pygFmt.format(v));
export const money = (v: number, currency: "USD" | "PYG") => (currency === "USD" ? usd(v) : pyg(v));
export const compactUsd = (v: number | null | undefined) => {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_000_000) return `USD ${(v / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (Math.abs(v) >= 10_000) return `USD ${Math.round(v / 1000)} mil`;
  return usd(v);
};
export const m2 = (v: number | null | undefined) => (v == null || v <= 0 ? "Por confirmar" : `${v.toLocaleString("es-PY", { maximumFractionDigits: 1 })} m²`);

export function date(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return d.toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });
}

export function relative(value: string | null | undefined) {
  if (!value) return "nunca";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months === 1 ? "" : "es"}`;
}

export const daysSince = (value: string | null | undefined) => (value ? Math.floor((Date.now() - new Date(value).getTime()) / 86400_000) : Infinity);

export function parking(n: number) {
  if (n < 0) return "Cochera por confirmar";
  if (n === 0) return "Sin cochera";
  return `${n} cochera${n === 1 ? "" : "s"}`;
}

export function whatsappLink(phone: string | null | undefined, text: string) {
  // Números paraguayos locales (0981…) se convierten a formato internacional (595981…).
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^0/, "595");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const parseJson = <T,>(value: string | null | undefined, fallback: T): T => {
  try { return value ? (JSON.parse(value) as T) : fallback; } catch { return fallback; }
};
