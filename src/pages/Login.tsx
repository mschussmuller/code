import { useState, type FormEvent } from "react";
import { api, useApi } from "../api";
import { useAuth } from "../auth";
import { ErrorBox, Field } from "../components/ui";

export function Login() {
  const { refresh } = useAuth();
  const status = useApi<{ needsSetup: boolean }>("/auth/status");
  const setup = status.data?.needsSetup;
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(setup ? "/auth/setup" : "/auth/login", { body: form });
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-12 text-white md:flex">
        <img src="/brand/vantage-logo-transparent.png" alt="Vantage" className="w-40 rounded-xl bg-cream p-3" />
        <div>
          <p className="eyebrow mb-3">Vantage Real Estate</p>
          <h1 className="font-editorial text-5xl leading-tight">Todo el negocio,<br />en un solo lugar.</h1>
          <p className="mt-4 max-w-md text-white/60">Inventario, clientes, propuestas, operaciones y finanzas. Cada persona ve lo que necesita.</p>
        </div>
        <p className="text-xs text-white/40">Uso interno</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <img src="/brand/vantage-logo-transparent.png" alt="Vantage" className="mx-auto mb-4 w-32 md:hidden" />
          <div>
            <p className="eyebrow">{setup ? "Primer uso" : "Bienvenido"}</p>
            <h2 className="text-2xl font-extrabold text-navy">{setup ? "Creá la cuenta del director" : "Iniciar sesión"}</h2>
            {setup && <p className="mt-1 text-sm text-muted">Esta cuenta tendrá acceso total. Después vas a poder sumar a tu equipo desde "Equipo".</p>}
          </div>
          {setup && <Field label="Nombre"><input className="input" value={form.name} onChange={set("name")} required autoComplete="name" /></Field>}
          <Field label="Email"><input className="input" type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></Field>
          {setup && <Field label="WhatsApp (opcional)"><input className="input" value={form.phone} onChange={set("phone")} placeholder="0981 123 456" /></Field>}
          <Field label="Contraseña"><input className="input" type="password" value={form.password} onChange={set("password")} required minLength={setup ? 8 : undefined} autoComplete={setup ? "new-password" : "current-password"} /></Field>
          <ErrorBox message={error} />
          <button className="btn-primary w-full py-3" disabled={busy || status.loading}>{busy ? "Ingresando…" : setup ? "Crear cuenta y entrar" : "Entrar"}</button>
        </form>
      </div>
    </div>
  );
}
