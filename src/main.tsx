import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider, useAuth, usePermissions } from "./auth";
import { SelectionProvider } from "./selection";
import { Layout } from "./components/Layout";
import { Loading } from "./components/ui";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Search } from "./pages/Search";
import { Clients } from "./pages/Clients";
import { ClientDetail } from "./pages/ClientDetail";
import { Agenda } from "./pages/Agenda";
import { Proposals } from "./pages/Proposals";
import { ProposalBuilder } from "./pages/ProposalBuilder";
import { ProposalView } from "./pages/ProposalView";
import { Operations } from "./pages/Operations";
import { Finance } from "./pages/Finance";
import { Team } from "./pages/Team";
import { Account } from "./pages/Account";

function Restricted({ allow, children }: { allow: boolean; children: React.ReactNode }) {
  return allow ? <>{children}</> : <div className="card p-8 text-center"><p className="font-bold text-navy">Sin acceso</p><p className="text-sm text-muted">Esta sección está reservada para gerencia y administración.</p></div>;
}

function App() {
  const { user, loading } = useAuth();
  const perms = usePermissions();
  if (loading) return <Loading />;
  if (!user) return <Login />;
  return (
    <Routes>
      <Route path="/propuestas/:id/imprimir" element={<ProposalView />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="inventario" element={<Inventory />} />
        <Route path="inventario/:id" element={<ProjectDetail />} />
        <Route path="buscar" element={<Search />} />
        <Route path="clientes" element={<Clients />} />
        <Route path="clientes/:id" element={<ClientDetail />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="propuestas" element={<Proposals />} />
        <Route path="propuestas/nueva" element={<ProposalBuilder />} />
        <Route path="operaciones" element={<Operations />} />
        <Route path="finanzas" element={<Restricted allow={perms.finance}><Finance /></Restricted>} />
        <Route path="equipo" element={<Restricted allow={perms.manageUsers}><Team /></Restricted>} />
        <Route path="cuenta" element={<Account />} />
        <Route path="*" element={<div className="card p-8 text-center text-muted">Página no encontrada</div>} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SelectionProvider>
          <App />
        </SelectionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
