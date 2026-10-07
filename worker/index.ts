import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authRoutes, requireUser } from "./auth";
import { runDailyAutomations } from "./automations";
import type { AppEnv, Env } from "./lib";
import { dashboardRoutes, financeRoutes, notificationRoutes, operationRoutes } from "./routes/business";
import { clientRoutes, proposalRoutes, taskRoutes } from "./routes/crm";
import { inventoryRoutes } from "./routes/inventory";
import { userRoutes } from "./routes/users";

const app = new Hono<AppEnv>().basePath("/api");

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "Error interno. Intentá de nuevo." }, 500);
});

app.route("/auth", authRoutes);
// Imágenes públicas (fachadas): se muestran en propuestas que se comparten con clientes.
app.get("/media/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT mime, data FROM media WHERE id = ?").bind(c.req.param("id")).first<{ mime: string; data: string }>();
  if (!row) return c.json({ error: "No encontrado" }, 404);
  const bytes = Uint8Array.from(atob(row.data), (ch) => ch.charCodeAt(0));
  return c.body(bytes, 200, { "Content-Type": row.mime, "Cache-Control": "public, max-age=31536000, immutable" });
});
app.use("*", async (c, next) => (c.req.path.startsWith("/api/auth/") || c.req.path.startsWith("/api/media/") ? next() : requireUser(c, next)));
app.route("/users", userRoutes);
app.route("/inventory", inventoryRoutes);
app.route("/clients", clientRoutes);
app.route("/tasks", taskRoutes);
app.route("/proposals", proposalRoutes);
app.route("/operations", operationRoutes);
app.route("/finance", financeRoutes);
app.route("/dashboard", dashboardRoutes);
app.route("/notifications", notificationRoutes);
app.all("*", (c) => c.json({ error: "No encontrado" }, 404));

export default {
  fetch: app.fetch,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runDailyAutomations(env.DB).then((s) => console.log("automations", s)));
  },
} satisfies ExportedHandler<Env>;
