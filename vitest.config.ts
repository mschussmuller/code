import { defineConfig } from "vitest/config";

// Config separada para que los tests no levanten el plugin de Cloudflare.
export default defineConfig({ test: { include: ["tests/**/*.test.ts"] } });
