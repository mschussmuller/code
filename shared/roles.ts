export type Role = "director" | "socio" | "admin" | "vendedor";

export const ROLE_LABEL: Record<Role, string> = {
  director: "Director",
  socio: "Socio",
  admin: "Administración",
  vendedor: "Vendedor",
};

/** Ve todo el negocio: todos los clientes, vendedores, operaciones y reportes. */
export const isManager = (role: Role) => role === "director" || role === "socio" || role === "admin";
/** Ve información financiera: comisiones de la empresa, cobros, pagos, gastos y rentabilidad. */
export const canSeeFinance = (role: Role) => role === "director" || role === "socio" || role === "admin";
/** Puede editar el inventario (proyectos, unidades, precios, estados). */
export const canEditInventory = (role: Role) => role === "director" || role === "socio" || role === "admin";
/** Puede crear y desactivar usuarios. */
export const canManageUsers = (role: Role) => role === "director" || role === "socio";

export const CLIENT_STAGES = [
  { id: "nuevo", label: "Nuevo" },
  { id: "contactado", label: "Contactado" },
  { id: "visita", label: "Visita" },
  { id: "propuesta", label: "Propuesta" },
  { id: "negociacion", label: "Negociación" },
  { id: "reservado", label: "Reservado" },
  { id: "ganado", label: "Ganado" },
  { id: "perdido", label: "Perdido" },
] as const;
export type ClientStage = (typeof CLIENT_STAGES)[number]["id"];
export const ACTIVE_STAGES: ClientStage[] = ["nuevo", "contactado", "visita", "propuesta", "negociacion", "reservado"];

export const OPERATION_STATUS = [
  { id: "reserva", label: "Reserva" },
  { id: "boleto", label: "Boleto firmado" },
  { id: "escritura", label: "Escriturada" },
  { id: "caida", label: "Caída" },
] as const;
export type OperationStatus = (typeof OPERATION_STATUS)[number]["id"];

export const UNIT_STATUS = ["Disponible", "Reservado", "Vendido", "Requiere confirmación"] as const;
export type UnitStatus = (typeof UNIT_STATUS)[number];
