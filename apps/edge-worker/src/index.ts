import { Hono } from "hono"

type Env = {
  Bindings: {
    PORTKEY_GATEWAY_URL: string
    PORTKEY_ORG_TOKEN: string
  }
}

const app = new Hono<Env>()
const TRAILING_SLASH_RE = /\/$/

app.get("/", (c) => c.text("AlphaGate Edge Worker OK"))

// OpenAI Responses-compatible proxy → Portkey OSS Gateway
app.all("/v1/responses", async (c) => {
  const base = c.env.PORTKEY_GATEWAY_URL
  if (!base) {
    return c.text("PORTKEY_GATEWAY_URL not set", 500)
  }
  const url = `${base.replace(TRAILING_SLASH_RE, "")}/v1/responses`
  const token = c.env.PORTKEY_ORG_TOKEN || ""
  const body = await c.req.text()
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": c.req.header("content-type") || "application/json",
      "x-portkey-api-key": token,
    },
    body,
  })
  return new Response(res.body, { status: res.status, headers: res.headers })
})

export default app
