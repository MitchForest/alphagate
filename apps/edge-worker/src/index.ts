import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) => c.text("AlphaGate Edge Worker OK"))

// Placeholder for OpenAI-compatible Responses API proxy
const HTTP_NOT_IMPLEMENTED = 501
app.all("/v1/responses", (c) => c.text("TODO: proxy to Portkey/OpenAI", HTTP_NOT_IMPLEMENTED))

export default app
