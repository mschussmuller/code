import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-tight text-navy md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, to, tone }: { label: string; value: ReactNode; hint?: ReactNode; to?: string; tone?: "ok" | "warn" | "bad" }) {
  const color = tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-navy";
  const inner = (
    <>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );
  return to ? <Link to={to} className="card block p-4 transition hover:border-gold hover:shadow-md">{inner}</Link> : <div className="card p-4">{inner}</div>;
}

const BADGE: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700", green: "bg-emerald-50 text-emerald-800", amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-800", blue: "bg-sky-50 text-sky-800", gold: "bg-gold-light/60 text-navy", navy: "bg-navy text-white",
};
export function Badge({ children, color = "gray" }: { children: ReactNode; color?: keyof typeof BADGE }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${BADGE[color]}`}>{children}</span>;
}

export function unitStatusColor(status: string): keyof typeof BADGE {
  return status === "Disponible" ? "green" : status === "Reservado" ? "amber" : status === "Vendido" ? "red" : "gray";
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 sm:rounded-2xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold text-navy">{title}</h2>
          <button className="rounded-full p-1 text-muted hover:bg-cream" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="label">{label}</span>{children}</label>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center">
      <p className="font-bold text-navy">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="p-10 text-center text-sm text-muted">Cargando…</div>;
}

export function ErrorBox({ message }: { message: string | null }) {
  return message ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{message}</div> : null;
}

export function Section({ title, action, children, className = "" }: { title: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-extrabold text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
