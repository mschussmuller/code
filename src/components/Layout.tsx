import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api, useApi } from "../api";
import { useAuth, usePermissions } from "../auth";
import { date } from "../format";
import { useSelection } from "../selection";
import type { Notification } from "../../shared/types";
import { ROLE_LABEL } from "../../shared/roles";
import { Icon } from "./Icon";

export function Layout() {
  const { user, logout } = useAuth();
  const perms = usePermissions();
  const selection = useSelection();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const notifications = useApi<{ notifications: Notification[] }>("/notifications");
  const unread = notifications.data?.notifications.filter((n) => !n.read_at).length ?? 0;

  useEffect(() => { setMenuOpen(false); setBellOpen(false); }, [location.pathname]);
  useEffect(() => {
    const t = setInterval(() => void notifications.reload(), 120_000);
    return () => clearInterval(t);
  }, [notifications.reload]);

  const nav = [
    { to: "/", label: "Panorama", icon: "home", end: true },
    { to: "/inventario", label: "Inventario", icon: "building" },
    { to: "/buscar", label: "Buscador", icon: "search" },
    { to: "/clientes", label: "Clientes", icon: "users" },
    { to: "/agenda", label: "Agenda", icon: "calendar" },
    { to: "/propuestas", label: "Propuestas", icon: "file", badge: selection.ids.length || undefined },
    { to: "/operaciones", label: "Operaciones", icon: "handshake" },
    ...(perms.finance ? [{ to: "/finanzas", label: "Finanzas", icon: "wallet" }] : []),
    ...(perms.manageUsers ? [{ to: "/equipo", label: "Equipo", icon: "team" }] : []),
  ];

  async function openBell() {
    setBellOpen((v) => !v);
    if (unread) {
      await api("/notifications/read", { method: "POST" });
      void notifications.reload();
    }
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-navy px-4 py-6 text-white">
      <Link to="/" className="mb-8 flex items-center gap-3 px-2">
        <img src="/brand/vantage-mark.png" alt="" className="h-10 w-10 rounded-lg bg-cream p-1" />
        <div>
          <p className="text-sm font-extrabold tracking-wide">VANTAGE OS</p>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-gold">Gestión inmobiliaria</p>
        </div>
      </Link>
      <nav className="grid gap-1">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-gold/15 text-white shadow-[inset_3px_0_0_var(--color-gold)]" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>
            <Icon name={item.icon} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? <span className="rounded-full bg-gold px-2 text-xs font-extrabold text-navy">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4">
        <Link to="/cuenta" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-sm font-extrabold text-navy">{user?.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{user?.name}</span>
            <span className="block text-[11px] text-white/50">{user && ROLE_LABEL[user.role]}</span>
          </span>
        </Link>
        <button onClick={async () => { await logout(); navigate("/"); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
          <Icon name="logout" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen md:pl-64">
      <div className="no-print fixed inset-y-0 left-0 z-40 hidden md:block">{sidebar}</div>
      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 flex md:hidden" onClick={() => setMenuOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>{sidebar}</div>
          <div className="flex-1 bg-navy/40" />
        </div>
      )}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
        <button className="rounded-lg p-2 md:hidden" onClick={() => setMenuOpen(true)} aria-label="Menú"><Icon name="menu" /></button>
        <img src="/brand/vantage-logo-transparent.png" alt="Vantage" className="h-8 md:hidden" />
        <div className="hidden text-sm text-muted md:block">{new Date().toLocaleDateString("es-PY", { weekday: "long", day: "numeric", month: "long" })}</div>
        <div className="relative">
          <button onClick={openBell} className="relative rounded-full border border-line bg-white p-2 hover:border-gold" aria-label="Notificaciones">
            <Icon name="bell" />
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-bad px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          {bellOpen && (
            <div className="card absolute right-0 top-12 z-50 max-h-[70vh] w-[min(360px,calc(100vw-2rem))] overflow-y-auto p-2">
              {!notifications.data?.notifications.length && <p className="p-4 text-center text-sm text-muted">Sin novedades</p>}
              {notifications.data?.notifications.map((n) => (
                <Link key={n.id} to={n.link ?? "#"} className={`block rounded-lg p-3 hover:bg-cream ${n.read_at ? "" : "bg-gold-light/30"}`}>
                  <p className="text-sm font-bold text-navy">{n.title}</p>
                  {n.body && <p className="text-xs text-muted">{n.body}</p>}
                  <p className="mt-1 text-[10px] text-muted">{date(n.created_at, true)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {user?.must_change_password ? (
          <div className="no-print mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Estás usando una contraseña temporal. <Link to="/cuenta" className="font-bold underline">Cambiala ahora</Link>.
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
