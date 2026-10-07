// Genera el PDF de la propuesta en el navegador, igual en cualquier dispositivo:
// una hoja A4 por unidad, con fachada, galería, plan de pago y enlaces (brochure, ubicación, planos).
import type { jsPDF as JsPDF } from "jspdf";

export type SheetStep = { label: string; hint: string; value: string };
export type ProposalSheet = {
  developer: string;
  stage: string;
  project: string;
  location: string;
  delivery: string;
  facts: [string, string][];
  priceLabel: string;
  price: string;
  priceNote: string[];
  planTitle: string;
  steps: SheetStep[];
  links: { label: string; url: string }[];
  image: string | null;
  gallery: string[];
  disclaimer: string;
};
export type ProposalDoc = {
  clientName: string;
  date: string;
  note: string | null;
  advisorName: string;
  advisorContact: string;
  sheets: ProposalSheet[];
};

const NAVY: [number, number, number] = [11, 31, 58];
const GOLD: [number, number, number] = [198, 161, 91];
const GOLD_LIGHT: [number, number, number] = [234, 217, 181];
const CREAM: [number, number, number] = [245, 241, 233];
const MUTED: [number, number, number] = [110, 117, 130];
const LINE: [number, number, number] = [228, 225, 218];
const INK: [number, number, number] = [23, 32, 51];

const W = 210;
const M = 14;
const CW = W - M * 2;

/** Carga una imagen y la recorta (tipo "cover") a la proporción pedida. Devuelve JPEG en base64 o null. */
async function coverImage(src: string, ratio: number, maxW = 1400, opts: { radius?: number; shade?: boolean } = {}): Promise<string | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = src;
    });
    const srcRatio = img.naturalWidth / img.naturalHeight;
    let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
    if (srcRatio > ratio) { sw = sh * ratio; sx = (img.naturalWidth - sw) / 2; } else { sh = sw / ratio; sy = (img.naturalHeight - sh) / 2; }
    const cw = Math.min(maxW, Math.round(sw));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = Math.round(cw / ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (opts.radius && typeof ctx.roundRect === "function") {
      const r = opts.radius * (canvas.width / 1000);
      ctx.beginPath();
      ctx.roundRect(0, 0, canvas.width, canvas.height, r);
      ctx.clip();
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    if (opts.shade) {
      // Degradado inferior para que el texto blanco se lea sobre cualquier foto
      const g = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
      g.addColorStop(0, "rgba(11,31,58,0)");
      g.addColorStop(1, "rgba(11,31,58,0.92)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL("image/jpeg", 0.86);
  } catch {
    return null; // imagen inaccesible (CORS, borrada): la hoja sigue sin ella
  }
}

async function logo(): Promise<{ data: string; ratio: number } | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = "/brand/vantage-logo-transparent.png";
    });
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = Math.round((600 * img.naturalHeight) / img.naturalWidth);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL("image/png"), ratio: img.naturalWidth / img.naturalHeight };
  } catch {
    return null;
  }
}

function eyebrow(doc: JsPDF, text: string, x: number, y: number, color = GOLD, align: "left" | "right" = "left") {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...color);
  const t = text.toUpperCase();
  const spacing = 0.6;
  const width = doc.getTextWidth(t) + spacing * (t.length - 1);
  doc.setCharSpace(spacing);
  doc.text(t, align === "right" ? x - width : x, y);
  doc.setCharSpace(0);
}

function fitText(doc: JsPDF, text: string, maxWidth: number, size: number, min = 7) {
  let s = size;
  doc.setFontSize(s);
  while (s > min && doc.getTextWidth(text) > maxWidth) doc.setFontSize((s -= 0.5));
  return s;
}

export async function buildProposalPdf(data: ProposalDoc): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const brand = await logo();
  const HERO_H = 92, THUMB_H = 32;
  const heroRatio = CW / HERO_H;
  const thumbW = (CW - 8) / 3;
  const thumbRatio = thumbW / THUMB_H;
  const images = await Promise.all(
    data.sheets.map(async (s) => ({
      hero: s.image ? await coverImage(s.image, heroRatio, 1600, { radius: 16, shade: true }) : null,
      thumbs: await Promise.all(s.gallery.slice(0, 3).map((g) => coverImage(g, thumbRatio, 700, { radius: 30 }))),
    })),
  );

  data.sheets.forEach((s, i) => {
    if (i > 0) doc.addPage();
    const total = data.sheets.length;

    // Encabezado
    if (brand) doc.addImage(brand.data, "PNG", M, 11, 32, 32 / brand.ratio);
    eyebrow(doc, `Propuesta comercial${total > 1 ? ` · Opción ${i + 1} de ${total}` : ""}`, W - M, 16, GOLD, "right");
    doc.setFont("times", "normal");
    doc.setTextColor(...NAVY);
    fitText(doc, data.clientName, 110, 20, 12);
    doc.text(data.clientName, W - M, 25, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(data.date, W - M, 30.5, { align: "right" });

    // Fachada con datos del proyecto
    const hy = 38, hh = HERO_H;
    const img = images[i];
    if (img.hero) doc.addImage(img.hero, "JPEG", M, hy, CW, hh);
    else { doc.setFillColor(...NAVY); doc.roundedRect(M, hy, CW, hh, 3, 3, "F"); }
    eyebrow(doc, `${s.developer} · ${s.stage}`, M + 7, hy + hh - 24, GOLD_LIGHT);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    fitText(doc, s.project, CW - 14, 22, 12);
    doc.text(s.project, M + 7, hy + hh - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const loc = [s.location, s.delivery].filter(Boolean).join(" · ");
    doc.text(doc.splitTextToSize(loc, CW - 14)[0] ?? "", M + 7, hy + hh - 6.5);

    // Galería
    const ty = hy + hh + 3.5;
    img.thumbs.forEach((t, k) => {
      if (!t) return;
      doc.addImage(t, "JPEG", M + k * (thumbW + 4), ty, thumbW, THUMB_H);
    });
    const hasThumbs = img.thumbs.some(Boolean);

    // Columna izquierda: la unidad y el precio
    const cy = (hasThumbs ? ty + THUMB_H : ty) + 9;
    const lw = 84, rx = M + lw + 8, rw = CW - lw - 8;
    eyebrow(doc, "La unidad", M, cy);
    s.facts.forEach(([label, value], k) => {
      const fx = M + (k % 2) * (lw / 2), fy = cy + 6 + Math.floor(k / 2) * 13;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text(label, fx, fy);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(value, lw / 2 - 3).slice(0, 2), fx, fy + 4.5);
    });
    const py = cy + 6 + Math.ceil(s.facts.length / 2) * 13 + 2;
    const ph = 22 + s.priceNote.length * 4;
    doc.setFillColor(...NAVY);
    doc.roundedRect(M, py, lw, ph, 3, 3, "F");
    eyebrow(doc, s.priceLabel, M + 6, py + 7, GOLD_LIGHT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(s.price, M + 6, py + 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD_LIGHT);
    s.priceNote.forEach((n, k) => doc.text(n, M + 6, py + 22.5 + k * 4));

    // Columna derecha: plan de pago y enlaces
    eyebrow(doc, s.planTitle, rx, cy);
    let sy = cy + 3;
    s.steps.forEach((st, k) => {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);
      doc.roundedRect(rx, sy, rw, 13, 2.5, 2.5, "S");
      doc.setFillColor(...GOLD_LIGHT);
      doc.circle(rx + 6, sy + 6.5, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...NAVY);
      doc.text(String(k + 1), rx + 6, sy + 7.6, { align: "center" });
      doc.setFontSize(6.8);
      doc.setTextColor(...MUTED);
      doc.setCharSpace(0.3);
      doc.text(st.label.toUpperCase(), rx + 12, sy + 5.5);
      doc.setCharSpace(0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(st.hint, rx + 12, sy + 9.8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...NAVY);
      doc.text(st.value, rx + rw - 4, sy + 8.3, { align: "right" });
      sy += 15;
    });

    let lx = rx, ly = sy + 1;
    doc.setFontSize(8.5);
    s.links.forEach((l, k) => {
      doc.setFont("helvetica", "bold");
      const bw = doc.getTextWidth(l.label) + 10;
      if (lx + bw > rx + rw) { lx = rx; ly += 10; }
      if (k === 0) { doc.setFillColor(...GOLD); doc.roundedRect(lx, ly, bw, 8, 2, 2, "F"); doc.setTextColor(...NAVY); }
      else { doc.setDrawColor(...LINE); doc.roundedRect(lx, ly, bw, 8, 2, 2, "S"); doc.setTextColor(...INK); }
      doc.text(l.label, lx + bw / 2, ly + 5.3, { align: "center" });
      doc.link(lx, ly, bw, 8, { url: l.url });
      lx += bw + 3;
    });

    // Mensaje del asesor (sólo en la primera hoja)
    const footY = 266;
    if (i === 0 && data.note) {
      const lines = doc.splitTextToSize(data.note, CW - 12).slice(0, 3) as string[];
      const nh = 6 + lines.length * 4;
      doc.setFillColor(...CREAM);
      doc.roundedRect(M, footY - nh - 5, CW, nh, 2.5, 2.5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(lines, M + 6, footY - nh - 5 + 6.5);
    }

    // Pie: asesor y aclaración
    doc.setDrawColor(...LINE);
    doc.line(M, footY, W - M, footY);
    eyebrow(doc, "Tu asesor", M, footY + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(data.advisorName, M, footY + 12.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(data.advisorContact, M, footY + 17);
    doc.setFontSize(6.5);
    doc.text(doc.splitTextToSize(s.disclaimer, 88), W - M - 88, footY + 7);
  });

  return doc.output("blob");
}

/** Comparte sólo el PDF (WhatsApp u otra app). Si el dispositivo no puede compartir archivos, lo descarga. */
export async function sharePdf(blob: Blob, filename: string): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = new File([blob], filename, { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }
  downloadPdf(blob, filename);
  return "downloaded";
}

export function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
