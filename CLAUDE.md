# Vantage OS — notas para sesiones de Claude

- Stack: Cloudflare Workers + D1 (SQLite) + Hono (`worker/`), React 19 + Tailwind v4 + react-router (`src/`), lógica compartida en `shared/`.
- Idioma de la interfaz y mensajes: español rioplatense/paraguayo (voseo). Moneda base USD; guaraníes con TC (por defecto 7900).
- Permisos: siempre validar en el servidor con `shared/roles.ts` (`isManager`, `canSeeFinance`, `canEditInventory`, `canManageUsers`). Los vendedores sólo ven sus clientes/propuestas/operaciones y nunca datos financieros de la empresa.
- Base de datos: cambios sólo con nuevas migraciones en `migrations/` (nunca editar las ya aplicadas). `0002_inventory.sql` se genera con `npm run seed:sql`.
- Verificar antes de subir: `npm run typecheck && npm test && npx vite build`. Probar en local con `npm run db:migrate:local && npm run dev`.
- Publicación automática vía `.github/workflows/deploy.yml` (secretos `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
- `legacy/` es el sistema anterior (ChatGPT Sites): sólo referencia, no se compila.
