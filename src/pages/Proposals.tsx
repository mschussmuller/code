import { Link } from "react-router-dom";
import { useApi } from "../api";
import { usePermissions } from "../auth";
import { Empty, Loading, PageHeader } from "../components/ui";
import { date, parseJson } from "../format";
import { useSelection } from "../selection";

export function Proposals() {
  const perms = usePermissions();
  const selection = useSelection();
  const { data, loading } = useApi<{ proposals: { id: string; client_id: string | null; client_name: string; options: string; created_at: string; user_name: string }[] }>("/proposals");
  return (
    <>
      <PageHeader eyebrow="Comercial" title="Propuestas" subtitle="Documentos profesionales listos para enviar por WhatsApp o imprimir en PDF."
        actions={<>
          <Link to="/buscar" className="btn-ghost">Elegir unidades</Link>
          <Link to="/propuestas/nueva" className="btn-primary">{selection.ids.length ? `Armar con ${selection.ids.length} seleccionadas` : "Nueva propuesta"}</Link>
        </>} />
      {loading && !data && <Loading />}
      {data && !data.proposals.length && <Empty title="Todavía no hay propuestas">Buscá unidades, tocá “Proponer” y después “Armar propuesta”.</Empty>}
      <div className="card divide-y divide-line">
        {data?.proposals.map((p) => (
          <Link key={p.id} to={`/propuestas/${p.id}/imprimir`} className="flex flex-wrap items-center gap-3 p-4 hover:bg-cream/50">
            <span className="min-w-0 flex-1"><span className="block font-bold text-navy">{p.client_name}</span><span className="text-xs text-muted">{parseJson<unknown[]>(p.options, []).length} opciones{perms.manager ? ` · ${p.user_name}` : ""}</span></span>
            <span className="text-sm text-muted">{date(p.created_at)}</span>
            <span className="text-gold">→</span>
          </Link>
        ))}
      </div>
    </>
  );
}
