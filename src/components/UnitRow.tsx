import { Link } from "react-router-dom";
import { useSelection } from "../selection";
import { m2, money, parking } from "../format";
import type { Unit } from "../../shared/types";
import { Badge, unitStatusColor } from "./ui";
import { Icon } from "./Icon";

/** Fila/tarjeta de unidad con botón para sumarla a la propuesta. */
export function UnitRow({ unit, showProject = true, onEdit }: { unit: Unit; showProject?: boolean; onEdit?: () => void }) {
  const selection = useSelection();
  const selected = selection.has(unit.id);
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 transition ${selected ? "border-gold ring-2 ring-gold/20" : "border-line"}`}>
      <div className="min-w-0 flex-1">
        {showProject && (
          <Link to={`/inventario/${unit.project_id}`} className="block truncate text-xs font-bold uppercase tracking-wide text-gold hover:underline">
            {unit.project_name} <span className="font-semibold normal-case text-muted">· {unit.developer_name}</span>
          </Link>
        )}
        <p className="font-bold text-navy">
          {unit.code} <span className="font-semibold text-ink">· {unit.type}</span>
        </p>
        <p className="text-xs text-muted">
          Piso {unit.floor || "—"} · {m2(unit.total_m2)} · {parking(unit.parking)}
          {showProject && unit.location ? ` · ${unit.location}` : ""}
          {showProject && unit.delivery ? ` · Entrega: ${unit.delivery}` : ""}
        </p>
      </div>
      <div className="text-right">
        <p className="font-extrabold text-navy">{money(unit.price, unit.currency)}</p>
        {unit.monthly_payment ? <p className="text-xs text-muted">Cuota {money(unit.monthly_payment, unit.currency)}</p> : null}
        {unit.status !== "Disponible" && <Badge color={unitStatusColor(unit.status)}>{unit.status}</Badge>}
      </div>
      <div className="flex gap-1">
        {onEdit && <button className="btn-ghost px-2.5" onClick={onEdit} aria-label="Editar unidad"><Icon name="edit" size={16} /></button>}
        <button
          className={selected ? "btn-gold px-3" : "btn-ghost px-3"}
          disabled={!selected && (selection.full || unit.status === "Vendido")}
          onClick={() => selection.toggle(unit.id)}
          title={selected ? "Quitar de la propuesta" : "Agregar a la propuesta"}
        >
          <Icon name={selected ? "check" : "plus"} size={16} />
          <span className="hidden sm:inline">{selected ? "En propuesta" : "Proponer"}</span>
        </button>
      </div>
    </div>
  );
}

export function SelectionBar() {
  const selection = useSelection();
  if (!selection.ids.length) return null;
  return (
    <div className="no-print fixed inset-x-0 bottom-4 z-30 mx-auto flex w-[min(560px,calc(100%-2rem))] items-center justify-between gap-3 rounded-2xl bg-navy px-4 py-3 text-white shadow-2xl md:left-64">
      <span className="text-sm"><b>{selection.ids.length}</b> unidad{selection.ids.length === 1 ? "" : "es"} seleccionada{selection.ids.length === 1 ? "" : "s"}</span>
      <div className="flex gap-2">
        <button className="rounded-lg px-3 py-1.5 text-sm text-white/70 hover:text-white" onClick={selection.clear}>Vaciar</button>
        <Link to="/propuestas/nueva" className="btn-gold py-1.5">Armar propuesta →</Link>
      </div>
    </div>
  );
}
