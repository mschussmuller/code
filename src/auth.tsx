import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import { canEditInventory, canManageUsers, canSeeFinance, isManager, type Role } from "../shared/roles";

export type Me = { id: string; email: string; name: string; role: Role; phone: string | null; must_change_password: number };
type AuthState = { user: Me | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };

const AuthContext = createContext<AuthState>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      setUser((await api<{ user: Me }>("/auth/me")).user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);
  useEffect(() => {
    void refresh();
    const onUnauthorized = () => setUser(null);
    window.addEventListener("vos:unauthorized", onUnauthorized);
    return () => window.removeEventListener("vos:unauthorized", onUnauthorized);
  }, [refresh]);
  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Permisos del usuario actual (la API vuelve a validarlos en el servidor). */
export function usePermissions() {
  const role = useAuth().user?.role ?? "vendedor";
  return { manager: isManager(role), finance: canSeeFinance(role), editInventory: canEditInventory(role), manageUsers: canManageUsers(role) };
}
