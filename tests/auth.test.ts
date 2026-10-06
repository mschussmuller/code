import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../worker/auth";
import { canEditInventory, canManageUsers, canSeeFinance, isManager } from "../shared/roles";

describe("contraseñas", () => {
  it("verifica la correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword("secreta123");
    expect(hash.startsWith("pbkdf2$100000$")).toBe(true);
    expect(await verifyPassword("secreta123", hash)).toBe(true);
    expect(await verifyPassword("otra-clave", hash)).toBe(false);
  });
});

describe("permisos por rol", () => {
  it("el vendedor no ve finanzas, no edita inventario ni gestiona usuarios", () => {
    expect(isManager("vendedor")).toBe(false);
    expect(canSeeFinance("vendedor")).toBe(false);
    expect(canEditInventory("vendedor")).toBe(false);
    expect(canManageUsers("vendedor")).toBe(false);
  });
  it("director y socio tienen acceso total; administración no gestiona usuarios", () => {
    for (const r of ["director", "socio"] as const) expect([isManager(r), canSeeFinance(r), canEditInventory(r), canManageUsers(r)]).toEqual([true, true, true, true]);
    expect(canSeeFinance("admin")).toBe(true);
    expect(canManageUsers("admin")).toBe(false);
  });
});
