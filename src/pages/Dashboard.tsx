import { Link } from "react-router-dom";
import { useApi } from "../api";
import { useAuth, usePermissions } from "../auth";
import { Badge, ErrorBox, Loading, PageHeader, Section, Stat } from "../components/ui";
import { compactUsd, date } from "../format";
import { ACTIVE_STAGES, CLIENT_STAGES, ROLE_LABEL, type Role } from "../../shared/roles";

type Dashboard = {
  inventory: { units: number; projects: number; value: number; staleProjects: { id: string; name: string; updated_at: string }[]; changes7d: number };
  pipeline: { stage: string; n: number }[];
  coldClients: number;
  tasks: { overdue: number | null; today: number | null };
  proposalsMonth: number;
  operationsMonth: { n: number; volume: number };
  sellers: { id: string; name: string; role: Role; active_clients: number; proposals_30d: number; operations_30d: number; volume_30d: number; overdue_tasks: number }[] | null;
  finance: { receivable: number | null; income_month: number | null; outflow_month: number | null } | null;
};

export function Dashboard() {
  const { user } = useAuth();
  const perms = usePermissions();
  const { data, error, loading } = useApi<Dashboard>("/dashboard");
  if (loading && !data) return <Loading />;
  if (!data) return <ErrorBox message={error} />;
  const stageCount = (id: string) => data.pipeline.find((p) => p.stage === id)?.n ?? 0;
  const activeClients = ACTIVE_STAGES.reduce((s, id) => s + stageCount(id), 0);
  const maxStage = Math.max(1, ...ACTIVE_STAGES.map(stageCount));
  const hour = new Date().getHours();

  return (
    <>
      <PageHeader eyebrow="Panorama" title={`${hour < 12 ? "Buen día" : hour < 19 ? "Buenas tardes" : "Buenas noches"}, ${user?.name.split(" ")[0]}`}
        subtitle={perms.manager ? "Así está funcionando el negocio hoy. Tocá cualquier número para ver el detalle." : "Tu actividad comercial de hoy."} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Seguimientos vencidos" value={data.tasks.overdue ?? 0} hint={`${data.tasks.today ?? 0} para hoy`} to="/agenda" tone={(data.tasks.overdue ?? 0) > 0 ? "bad" : "ok"} />
        <Stat label={perms.manager ? "Clientes activos" : "Mis clientes activos"} value={activeClients} hint={`${data.coldClients} sin contacto hace +7 días`} to="/clientes" tone={data.coldClients > 0 ? "warn" : undefined} />
        <Stat label="Propuestas del mes" value={data.proposalsMonth} to="/propuestas" />
        <Stat label="Reservas y ventas del mes" value={data.operationsMonth.n} hint={compactUsd(data.operationsMonth.volume)} to="/operaciones" />
      </div>

      {perms.finance && data.finance && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Comisiones a cobrar" value={compactUsd(data.finance.receivable ?? 0)} to="/finanzas" tone="warn" />
          <Stat label="Ingresos del mes" value={compactUsd(data.finance.income_month ?? 0)} to="/finanzas" tone="ok" />
          <Stat label="Egresos del mes" value={compactUsd(data.finance.outflow_month ?? 0)} hint="Gastos + pagos a vendedores" to="/finanzas" />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Section title="Embudo comercial" className="lg:col-span-3" action={<Link to="/clientes" className="text-sm font-semibold text-gold">Ver clientes →</Link>}>
          <div className="space-y-2">
            {CLIENT_STAGES.filter((s) => ACTIVE_STAGES.includes(s.id)).map((s) => (
              <Link key={s.id} to={`/clientes?etapa=${s.id}`} className="flex items-center gap-3 rounded-lg p-1 hover:bg-cream">
                <span className="w-24 text-sm font-semibold text-muted">{s.label}</span>
                <span className="h-7 flex-1 overflow-hidden rounded-md bg-cream">
                  <span className="flex h-full items-center rounded-md bg-navy px-2 text-xs font-bold text-white" style={{ width: `${Math.max(6, (stageCount(s.id) / maxStage) * 100)}%` }}>{stageCount(s.id)}</span>
                </span>
              </Link>
            ))}
            <p className="pt-2 text-xs text-muted">Ganados: {stageCount("ganado")} · Perdidos: {stageCount("perdido")}</p>
          </div>
        </Section>

        <Section title="Inventario" className="lg:col-span-2" action={<Link to="/inventario" className="text-sm font-semibold text-gold">Ver todo →</Link>}>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-2xl font-extrabold text-navy">{data.inventory.units}</p><p className="text-xs text-muted">unidades disponibles</p></div>
            <div><p className="text-2xl font-extrabold text-navy">{data.inventory.projects}</p><p className="text-xs text-muted">proyectos con stock</p></div>
            <div className="col-span-2"><p className="text-lg font-extrabold text-navy">{compactUsd(data.inventory.value)}</p><p className="text-xs text-muted">valor total disponible · {data.inventory.changes7d} cambios de precio/estado en 7 días</p></div>
          </div>
          {data.inventory.staleProjects.length > 0 && (
            <Link to="/inventario?vista=verificar" className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 hover:bg-amber-100">
              <span>⚠</span>
              <span><b>{data.inventory.staleProjects.length} proyectos</b> sin actualizar hace más de 30 días. Conviene verificar precios y disponibilidad.</span>
            </Link>
          )}
        </Section>
      </div>

      {data.sellers && (
        <Section title="Equipo comercial · últimos 30 días" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2">Persona</th><th>Clientes activos</th><th>Propuestas</th><th>Operaciones</th><th>Volumen</th><th>Seguimientos vencidos</th>
              </tr></thead>
              <tbody>
                {data.sellers.map((s) => (
                  <tr key={s.id} className="border-b border-line/60 last:border-0">
                    <td className="py-2.5"><Link to={`/clientes?vendedor=${s.id}`} className="font-bold text-navy hover:text-gold">{s.name}</Link> <span className="text-xs text-muted">{ROLE_LABEL[s.role]}</span></td>
                    <td>{s.active_clients}</td><td>{s.proposals_30d}</td><td>{s.operations_30d}</td><td>{compactUsd(s.volume_30d)}</td>
                    <td>{s.overdue_tasks > 0 ? <Badge color="red">{s.overdue_tasks}</Badge> : <Badge color="green">0</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {perms.manager && data.inventory.staleProjects.length > 0 && (
        <Section title="Proyectos para verificar con la desarrolladora" className="mt-6">
          <div className="flex flex-wrap gap-2">
            {data.inventory.staleProjects.map((p) => (
              <Link key={p.id} to={`/inventario/${p.id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-gold">{p.name} <span className="text-xs text-muted">· {date(p.updated_at)}</span></Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
