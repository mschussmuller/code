import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { ErrorBox, Field, PageHeader } from "../components/ui";
import { ROLE_LABEL } from "../../shared/roles";

export function Account() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/auth/password", { body: form });
      setMsg("Contraseña actualizada");
      setForm({ current: "", next: "" });
      await refresh();
    } catch (err) { setError((err as Error).message); }
  }
  return (
    <div className="max-w-lg">
      <PageHeader eyebrow="Mi cuenta" title={user?.name ?? ""} subtitle={`${user?.email} · ${user ? ROLE_LABEL[user.role] : ""}`} />
      <form onSubmit={save} className="card space-y-4 p-5">
        <h2 className="font-extrabold text-navy">Cambiar contraseña</h2>
        <Field label="Contraseña actual"><input className="input" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required /></Field>
        <Field label="Nueva contraseña (mínimo 8 caracteres)"><input className="input" type="password" value={form.next} minLength={8} onChange={(e) => setForm({ ...form, next: e.target.value })} required /></Field>
        <ErrorBox message={error} />
        {msg && <p className="text-sm font-semibold text-ok">{msg}</p>}
        <button className="btn-primary">Guardar</button>
      </form>
    </div>
  );
}
