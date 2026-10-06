# Vantage OS

Sistema interno de gestión inmobiliaria de Vantage Real Estate: inventario, buscador, clientes (CRM), agenda, propuestas, operaciones, finanzas y panorama gerencial, con permisos por rol.

Reemplaza a *Vantage Property OS* (ChatGPT Sites). El código anterior quedó como referencia en [`legacy/vantage-property-os`](legacy/vantage-property-os) y su inventario (37 proyectos, 726 unidades) fue migrado a la base de datos.

## Qué hace

| Módulo | Para qué sirve |
| --- | --- |
| **Panorama** | Cómo está el negocio hoy: seguimientos vencidos, embudo de clientes, inventario, operaciones del mes, ranking del equipo y, para gerencia, comisiones a cobrar e ingresos/egresos. Cada número lleva al detalle. |
| **Inventario** | Proyectos por desarrolladora, fichas, documentos, unidades, precios y estados. Marca los proyectos sin actualizar hace más de 30 días para verificarlos con la desarrolladora. |
| **Buscador** | Filtra unidades por presupuesto, dormitorios, zona, etapa, desarrolladora y cochera. Se puede abrir con el perfil de un cliente ya cargado. |
| **Clientes** | Tablero por etapa (nuevo → ganado/perdido), qué busca cada cliente, historial de contactos, seguimientos, propuestas, operaciones y sugerencias automáticas del inventario. |
| **Agenda** | Seguimientos propios (o de todo el equipo, para gerencia). |
| **Propuestas** | Cotizador (contado/financiado, descuento, cochera, plan oficial de la desarrolladora) que genera un documento con la marca, listo para PDF o WhatsApp. |
| **Operaciones** | Reservas, boletos y escrituras. Actualizan solas el estado de la unidad y del cliente. |
| **Finanzas** | Comisiones a cobrar, pagos a vendedores, gastos por categoría, resultado mensual y rentabilidad por vendedor. |
| **Equipo** | Alta de usuarios, roles, contraseñas temporales y desactivación. |

### Roles

| Rol | Ve |
| --- | --- |
| Director / Socio | Todo, incluida la gestión del equipo. |
| Administración | Todo menos la gestión de usuarios. |
| Vendedor | Inventario, buscador y **sus** clientes, propuestas y operaciones (con su comisión). No ve finanzas ni los clientes de otros. |

Los permisos se validan en el servidor ([`shared/roles.ts`](shared/roles.ts)); ocultar un botón no es lo único que los protege.

### Automatizaciones

- **Al crear un cliente:** tarea de primer contacto en 24 h.
- **Al enviar una propuesta:** el cliente pasa a "Propuesta" y se agenda un seguimiento a los 2 días.
- **Al cambiar el precio o el estado de una unidad:** se avisa a cada vendedor que se la propuso a un cliente activo.
- **Al registrar una reserva:** la unidad pasa a "Reservado" y se avisa a gerencia. Con boleto firmado se generan el cobro de la comisión y el pago al vendedor. La escritura marca la unidad como vendida; si la operación se cae, vuelve a estar disponible.
- **Todos los días a las 07:00 (Asunción):**
  - se crean seguimientos para clientes sin contacto reciente (los días dependen de la etapa);
  - cada persona recibe un aviso de sus pendientes;
  - gerencia recibe un aviso por las comisiones vencidas;
  - los lunes, gerencia recibe también un aviso por los proyectos con datos viejos.

## Publicación (una sola vez, gratis)

Funciona en el plan gratuito de **Cloudflare** (Workers + base de datos D1). Cada vez que se sube código a GitHub, el sistema se verifica y se publica solo (`.github/workflows/deploy.yml`).

1. Crear una cuenta gratuita en <https://dash.cloudflare.com/sign-up>.
2. En el panel, entrar a **Workers & Pages** una vez, para que se active tu subdominio `*.workers.dev`.
3. Copiar el **Account ID**: está en la página principal de la cuenta, columna derecha, o en *Workers & Pages*.
4. Crear un **API Token**: *My Profile → API Tokens → Create Token*. Usar la plantilla **"Edit Cloudflare Workers"** y agregarle el permiso **Account · D1 · Edit**.
5. En GitHub, en el repositorio, ir a *Settings → Secrets and variables → Actions → New repository secret* y crear:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
6. Ir a *Actions → Verificar y publicar → Run workflow*, o subir cualquier cambio. La primera vez, el proceso crea la base de datos, carga el inventario y publica en `https://vantage-os.<tu-subdominio>.workers.dev`.
7. Entrar a esa dirección. La primera persona que entra crea la **cuenta del director**. Desde **Equipo** se agrega al resto: el sistema genera una contraseña temporal y un mensaje listo para mandar por WhatsApp.

## Desarrollo local

```bash
npm install
npm run db:migrate:local   # crea la base local con el inventario
npm run dev                # http://localhost:5173
npm test                   # pruebas
npm run typecheck
```

Estructura:

- `worker/`: API (Hono sobre Cloudflare Workers), autenticación, permisos y automatizaciones (`automations.ts`).
- `src/`: interfaz (React + Tailwind).
- `shared/`: lógica compartida (roles, cotizador, tipos).
- `migrations/`: esquema e inventario inicial.
- `scripts/`: exportación del sistema anterior.
- `legacy/`: sistema anterior, solo como referencia.

Para cambiar la base de datos, agregar un archivo nuevo `migrations/000N_descripcion.sql`; se aplica solo en la próxima publicación.
