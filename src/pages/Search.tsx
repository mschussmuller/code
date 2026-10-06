import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api";
import { Empty, ErrorBox, Field, Loading, PageHeader } from "../components/ui";
import { SelectionBar, UnitRow } from "../components/UnitRow";
import type { Client, Developer, Unit } from "../../shared/types";

const EMPTY = { min: "", max: "", bedrooms: "", zone: "", stage: "", developer: "", parking: "", text: "", sort: "price_asc" };

/** Convierte las preferencias de un cliente en filtros del buscador. */
export function clientFilters(c: Pick<Client, "budget_min_usd" | "budget_max_usd" | "bedrooms_min" | "zones">) {
  return {
    ...EMPTY,
    min: c.budget_min_usd ? String(c.budget_min_usd) : "",
    max: c.budget_max_usd ? String(c.budget_max_usd) : "",
    bedrooms: c.bedrooms_min != null ? String(Math.min(c.bedrooms_min, 3)) : "",
    zone: c.zones ?? "",
  };
}

export function Search() {
  const [params] = useSearchParams();
  const clientId = params.get("cliente");
  const [filters, setFilters] = useState(EMPTY);
  const [limit, setLimit] = useState(60);
  const [client, setClient] = useState<Client | null>(null);
  const developers = useApi<{ developers: Developer[] }>("/inventory/developers");

  useEffect(() => {
    if (!clientId) return;
    void api<{ client: Client }>(`/clients/${clientId}`).then(({ client }) => { setClient(client); setFilters(clientFilters(client)); });
  }, [clientId]);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) q.set(k, v);
    q.set("limit", String(limit));
    return q.toString();
  }, [filters, limit]);
  const [debounced, setDebounced] = useState(query);
  useEffect(() => { const t = setTimeout(() => setDebounced(query), 300); return () => clearTimeout(t); }, [query]);
  const { data, error, loading } = useApi<{ units: Unit[] }>(`/inventory/units?${debounced}`);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="pb-20">
      <PageHeader eyebrow="Buscador" title={client ? `Opciones para ${client.name}` : "Encontrá la unidad correcta"}
        subtitle={client ? <>Filtros cargados desde el perfil del cliente. <Link to={`/clientes/${client.id}`} className="font-semibold text-gold">Ver cliente</Link></> : "Definí el perfil del cliente y elegí hasta 6 unidades para armar la propuesta."} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card h-fit space-y-3 p-4 lg:sticky lg:top-20">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Presupuesto desde (USD)"><input className="input" type="number" value={filters.min} onChange={set("min")} /></Field>
            <Field label="Hasta (USD)"><input className="input" type="number" value={filters.max} onChange={set("max")} /></Field>
          </div>
          <Field label="Dormitorios">
            <select className="input" value={filters.bedrooms} onChange={set("bedrooms")}>
              <option value="">Cualquiera</option><option value="0">Monoambiente / studio</option><option value="1">1 dormitorio</option><option value="2">2 dormitorios</option><option value="3">3 o más</option>
            </select>
          </Field>
          <Field label="Zonas (separadas por coma)"><input className="input" value={filters.zone} onChange={set("zone")} placeholder="Recoleta, Villa Morra, Luque" /></Field>
          <Field label="Etapa">
            <select className="input" value={filters.stage} onChange={set("stage")}>
              <option value="">Todas</option>{["Prepozo", "Pozo", "Semiterminado", "Terminado"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Desarrolladora">
            <select className="input" value={filters.developer} onChange={set("developer")}>
              <option value="">Todas</option>{developers.data?.developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.parking === "1"} onChange={(e) => setFilters({ ...filters, parking: e.target.checked ? "1" : "" })} /> Con cochera incluida</label>
          <Field label="Texto libre"><input className="input" value={filters.text} onChange={set("text")} placeholder="Proyecto, código, tipología" /></Field>
          <button className="btn-ghost w-full" onClick={() => setFilters(EMPTY)}>Limpiar filtros</button>
        </aside>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted">{loading ? "Buscando…" : `${data?.units.length ?? 0} unidades disponibles${(data?.units.length ?? 0) >= 200 ? " (mostrando las primeras 200)" : ""}`}</p>
            <select className="input w-auto" value={filters.sort} onChange={set("sort")}>
              <option value="price_asc">Menor precio</option><option value="price_desc">Mayor precio</option><option value="m2">Más m²</option>
            </select>
          </div>
          <ErrorBox message={error} />
          {loading && !data && <Loading />}
          {data && !data.units.length && <Empty title="No hay unidades con todos estos criterios">Probá ampliar el presupuesto o quitar algún filtro.</Empty>}
          <div className="space-y-2">{data?.units.map((u) => <UnitRow key={u.id} unit={u} />)}</div>
          {data && data.units.length >= limit && limit < 500 && <button className="btn-ghost mt-3 w-full" onClick={() => setLimit(limit + 60)}>Mostrar más</button>}
        </section>
      </div>
      <SelectionBar />
    </div>
  );
}
