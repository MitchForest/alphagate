import { serve } from "bun"
import { Hono } from "hono"
import { env } from "./config/env"
import { adminRouter } from "./routes/admin"
import { internalRouter } from "./routes/internal"

const app = new Hono()

app.get("/", (c) => c.json({ ok: true, service: "main-app" }))

app.route("/internal", internalRouter)
app.route("/admin", adminRouter)

const DEFAULT_MAIN_APP_PORT = 3001
const port = Number(env.MAIN_APP_PORT ?? DEFAULT_MAIN_APP_PORT)
serve({ fetch: app.fetch, port })
console.log(`[main-app] listening on http://localhost:${port}`)
