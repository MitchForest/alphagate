import { serve } from "bun"
import { Hono } from "hono"
import React from "react"
import { renderToReadableStream } from "react-dom/server"

const app = new Hono()

app.get("/", async (_c) => {
  const el = React.createElement("div", null, "AlphaGate Dashboard")
  const stream = await renderToReadableStream(el)
  return new Response(stream, { headers: { "Content-Type": "text/html" } })
})

const DEFAULT_DASHBOARD_PORT = 3000
const port = Number(process.env.DASHBOARD_PORT ?? DEFAULT_DASHBOARD_PORT)
serve({ fetch: app.fetch, port })
console.log(`[dashboard] listening on http://localhost:${port}`)
