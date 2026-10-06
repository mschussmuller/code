import { useState } from "react";
import { api, useApi } from "../api";
import { useAuth } from "../auth";
import { Badge, ErrorBox, Field, Loading, Modal, PageHeader } from "../components/ui";
import { ROLE_LABEL, type Role } from "../../shared/roles";
import type { User } from "../../shared/types";

const ROLE_HELP: Record<Role, string> = {
  director: "Acceso total, incluida la gestión del equipo.",
  socio: "Acceso total: gerencia, finanzas y equipo.",
  admin: "Gerencia y finanzas. Edita inventario. No gestiona usuarios.",
  vendedor: "Inventario, buscador y sus propios clientes, propuestas y operaciones. No ve finanzas.",
};

export function Team() {
  const { user: me } = useAuth();
  const { data, loading, reload } = useApi<{ users: User[] }>("/users");
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState<{ name: string; email: string; password: string } | null>(null);

  async function update(u: User, body: Record<string, unknown>) {
    const res = await api<{ temporaryPassword?: string }>(`/users/${u.id}`, { method: "PATCH", body });
    if (res.temporaryPassword) setCredentials({ name: u.name, email: u.email, password: res.temporaryPassword });
    void reload();
  }

  return (
    <>
      <PageHeader eyebrow="Equipo" title="Usuarios y permisos" subtitle="Cada persona ve sólo lo que necesita. Los permisos se controlan en el servidor."
        actions={<button className="btn-primary" onClick={() => setCreating(true)}>+ Agregar persona</button>} />
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(ROLE_HELP) as Role[]).map((r) => <div key={r} className="card p-3"><p className="text-sm font-bold text-navy">{ROLE_LABEL[r]}</p><p className="text-xs text-muted">{ROLE_HELP[r]}</p></div>)}
      </div>
      {loading && !data && <Loading />}
      <div className="card divide-y divide-line">
        {data?.users.map((u) => (
          <div key={u.id} className={`flex flex-wrap items-center gap-3 p-4 ${u.active ? "" : "opacity-50"}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cream font-extrabold text-navy">{u.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy">{u.name} {u.id === me?.id && <span className="text-xs text-muted">(vos)</span>}</p>
              <p className="text-xs text-muted">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
            </div>
            {!u.active && <Badge color="red">Inactivo</Badge>}
            {u.must_change_password ? <Badge color="amber">Contraseña temporal</Badge> : null}
            <select className="input w-auto" value={u.role} disabled={u.id === me?.id} onChange={(e) => update(u, { role: e.target.value })}>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            {u.id !== me?.id && <>
              <button className="btn-ghost py-1.5 text-xs" onClick={() => confirm(`¿Generar una contraseña nueva para ${u.name}?`) && update(u, { resetPassword: true })}>Nueva contraseña</button>
              <button className="btn-ghost py-1.5 text-xs" onClick={() => update(u, { active: u.active ? 0 : 1 })}>{u.active ? "Desactivar" : "Reactivar"}</button>
            </>}
          </div>
        ))}
      </div>
      {creating && <NewUser onClose={() => setCreating(false)} onCreated={(c) => { setCreating(false); setCredentials(c); void reload(); }} />}
      {credentials && <CredentialsModal {...credentials} onClose={() => setCredentials(null)} />}
    </>
  );
}

function NewUser({ onClose, onCreated }: { onClose: () => void; onCreated: (c: { name: string; email: string; password: string }) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "vendedor" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  async function save() {
    try {
      const res = await api<{ temporaryPassword: string }>("/users", { body: form });
      onCreated({ name: form.name, email: form.email.trim().toLowerCase(), password: res.temporaryPassword });
    } catch (e) { setError((e as Error).message); }
  }
  return (
    <Modal title="Agregar persona" onClose={onClose}>
      <div className="grid gap-3">
        <Field label="Nombre"><input className="input" value={form.name} onChange={set("name")} /></Field>
        <Field label="Email (para ingresar)"><input className="input" type="email" value={form.email} onChange={set("email")} /></Field>
        <Field label="WhatsApp (aparece en las propuestas)"><input className="input" value={form.phone} onChange={set("phone")} /></Field>
        <Field label="Rol"><select className="input" value={form.role} onChange={set("role")}>{(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></Field>
        <p className="text-xs text-muted">{ROLE_HELP[form.role as Role]}</p>
      </div>
      <ErrorBox message={error} />
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancelar</button><button className="btn-primary" onClick={save}>Crear acceso</button></div>
    </Modal>
  );
}

function CredentialsModal({ name, email, password, onClose }: { name: string; email: string; password: string; onClose: () => void }) {
  const text = `Hola ${name.split(" ")[0]}! Ya tenés acceso a Vantage OS.\nIngresá en ${window.location.origin}\nEmail: ${email}\nContraseña temporal: ${password}\n(Te va a pedir cambiarla.)`;
  return (
    <Modal title="Acceso creado" onClose={onClose}>
      <p className="text-sm">Compartí estos datos con <b>{name}</b>. La contraseña se muestra una sola vez.</p>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-cream p-3 text-sm">{text}</pre>
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(text)}>Copiar</button>
        <a className="btn-primary" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">Enviar por WhatsApp</a>
      </div>
    </Modal>
  );
}
