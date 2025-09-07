import { ResponsesRequestSchema } from "@alphagate/contracts"
import type { Context } from "hono"
import { Hono } from "hono"

type Env = {
  Bindings: {
    PORTKEY_GATEWAY_URL: string
    PORTKEY_ORG_TOKEN: string
    MAIN_APP_URL: string
    // CONFIG_CACHE?: KVNamespace // optional KV for future caching
  }
}

const app = new Hono<Env>()
const TRAILING_SLASH_RE = /\/$/
const BEARER_PREFIX = "bearer "

app.get("/", (c) => c.text("AlphaGate Edge Worker OK"))

// OpenAI Responses-compatible proxy → Portkey OSS Gateway
app.all("/v1/responses", async (c) => {
  const base = c.env.PORTKEY_GATEWAY_URL
  if (!base) {
    return c.json({ code: "config_error", message: "PORTKEY_GATEWAY_URL not set" }, 500)
  }
  if (!c.env.MAIN_APP_URL) {
    return c.json({ code: "config_error", message: "MAIN_APP_URL not set" }, 500)
  }

  const auth = c.req.header("authorization")
  if (!auth?.toLowerCase().startsWith(BEARER_PREFIX)) {
    return c.json({ code: "unauthorized", message: "Missing Authorization header" }, 401)
  }

  // Read body once so we can inspect/transform
  const rawBody = await c.req.text()
  const endpointName = getEndpointName(c, rawBody)
  if (!endpointName) {
    return c.json({ code: "bad_request", message: "Invalid request payload" }, 400)
  }

  const org_id = await authorizeWithMainApp(c, auth)
  if (!org_id) {
    return c.json({ code: "unauthorized", message: "API key invalid" }, 401)
  }

  const providerModel = await resolveProviderModel(c, org_id, endpointName)
  if (!providerModel) {
    return c.json({ code: "config_error", message: "Endpoint routing is invalid" }, 500)
  }

  const forwardBody = rewriteModel(rawBody, providerModel)
  const upstream = await forwardToPortkey(c, base, forwardBody)

  return maybeWrapSse(upstream)
})

function getEndpointName(c: Context<Env>, rawBody: string): string | null {
  const fromHeader = c.req.header("x-ag-endpoint")
  if (fromHeader) {
    return fromHeader
  }
  try {
    const parsed = ResponsesRequestSchema.parse(JSON.parse(rawBody))
    return parsed.model
  } catch {
    return null
  }
}

async function authorizeWithMainApp(c: Context<Env>, auth: string): Promise<string | null> {
  const res = await fetch(
    `${c.env.MAIN_APP_URL.replace(TRAILING_SLASH_RE, "")}/internal/auth-key`,
    {
      method: "POST",
      headers: { "content-type": "application/json", authorization: auth },
      body: JSON.stringify({}),
    }
  )
  if (!res.ok) {
    return null
  }
  const data = (await res.json()) as { org_id?: string }
  return data.org_id ?? null
}

async function resolveProviderModel(
  c: Context<Env>,
  org_id: string,
  endpoint: string
): Promise<string | null> {
  const res = await fetch(
    `${c.env.MAIN_APP_URL.replace(TRAILING_SLASH_RE, "")}/internal/endpoint-config`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ org_id, endpoint }),
    }
  )
  if (!res.ok) {
    return null
  }
  const raw = (await res.json()) as { routing?: { primary?: { model?: string } } }
  return raw?.routing?.primary?.model ?? null
}

function rewriteModel(rawBody: string, model: string): string {
  const obj = JSON.parse(rawBody)
  obj.model = model
  return JSON.stringify(obj)
}

function forwardToPortkey(c: Context<Env>, base: string, body: string): Promise<Response> {
  const url = `${base.replace(TRAILING_SLASH_RE, "")}/v1/responses`
  const token = c.env.PORTKEY_ORG_TOKEN || ""
  return fetch(url, {
    method: "POST",
    headers: {
      "content-type": c.req.header("content-type") || "application/json",
      "x-portkey-api-key": token,
    },
    body,
  })
}

function maybeWrapSse(upstream: Response): Response {
  const contentType = upstream.headers.get("content-type") || ""
  if (!(contentType.includes("text/event-stream") && upstream.body)) {
    return new Response(upstream.body, { status: upstream.status, headers: upstream.headers })
  }
  const keepAliveMs = 15_000
  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const reader = upstream.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }
      let done = false
      const timer = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"))
      }, keepAliveMs)
      try {
        while (!done) {
          const { value, done: d } = await reader.read()
          if (d) {
            done = true
            break
          }
          if (value) {
            controller.enqueue(value)
          }
        }
      } finally {
        clearInterval(timer)
        controller.close()
      }
    },
  })
  const headers = new Headers(upstream.headers)
  headers.set("content-type", "text/event-stream")
  return new Response(readable, { status: upstream.status, headers })
}

export default app
