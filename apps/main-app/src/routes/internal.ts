import { Hono } from "hono"
import { type ZodIssue, z } from "zod"

export const internalRouter = new Hono()

const HTTP = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL: 500,
} as const

internalRouter.post("/auth-key", async (c) => {
  try {
    // Prefer JSON body { token }, else Authorization header
    const raw = await c.req.json().catch(() => ({}))
    const bearer = c.req.header("authorization")
    const token = (() => {
      const parsed = InternalAuthKeyRequestSchema.safeParse(raw)
      const BEARER_PREFIX = "bearer "
      if (parsed.success) {
        return parsed.data.token
      }
      if (bearer?.toLowerCase().startsWith(BEARER_PREFIX)) {
        return bearer.slice(BEARER_PREFIX.length)
      }
      return null
    })()
    if (!token) {
      return c.json({ code: "bad_request", message: "Missing API token" }, HTTP.BAD_REQUEST)
    }

    // Lookup by prefix and verify hash
    const parts = token.split(".")
    if (parts.length < 2) {
      return c.json({ code: "unauthorized", message: "Malformed API token" }, HTTP.UNAUTHORIZED)
    }
    const first = parts[0]
    if (!first) {
      return c.json({ code: "unauthorized", message: "Malformed API token" }, HTTP.UNAUTHORIZED)
    }
    const prefix = first
    const secret = parts.slice(1).join(".")

    const { getSql } = await import("../services/db")
    const { verifySecret } = await import("../services/keys")
    const sql = getSql()
    const rows = await sql /* sql */`
      select id, org_id, secret_hash, status
      from api_keys
      where prefix = ${prefix}
      limit 1
    `
    if (rows.length === 0) {
      return c.json({ code: "not_found", message: "API key not found" }, HTTP.NOT_FOUND)
    }
    const key = rows[0] as unknown as {
      id: string
      org_id: string
      secret_hash: string
      status: string
    }
    if (key.status !== "active") {
      return c.json({ code: "unauthorized", message: "API key disabled" }, HTTP.UNAUTHORIZED)
    }
    const ok = verifySecret(secret, key.secret_hash)
    if (!ok) {
      return c.json({ code: "unauthorized", message: "API key invalid" }, HTTP.UNAUTHORIZED)
    }

    return c.json({ org_id: key.org_id, api_key_id: key.id, scopes: {} })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})

internalRouter.post("/endpoint-config", async (c) => {
  try {
    const body = await c.req.json()
    const parsed = InternalEndpointConfigRequestSchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.issues.map((i: ZodIssue) => ({
        path: i.path,
        message: i.message,
      }))
      return c.json({ code: "bad_request", message: "Invalid payload", details }, HTTP.BAD_REQUEST)
    }

    const { endpoint } = parsed.data

    // Dev stub: optional fake config for quick local iteration
    if (process.env.AG_DEV_FAKE_CONFIG === "1" && endpoint === "vision-screencast-evaluator") {
      return c.json({
        endpoint_id: "dev-stub",
        version: "1.0.0",
        routing: {
          primary: { provider: "runpod", model: "qwen-vl-7b" },
          failover: [],
        },
        policies: { grade_band: "6-8", pii_redaction: true, retention_days: 1 },
        quotas: { per_day: 20_000 },
      })
    }

    // Resolve endpoint in DB by (org_id, endpoint name) → latest version config
    const { getSql } = await import("../services/db")
    const sql = getSql()
    const rows = await sql /* sql */`
      select ev.id as ev_id, e.id as endpoint_id, ev.version, ev.config_json
      from endpoints e
      join endpoint_versions ev on ev.endpoint_id = e.id
      where e.org_id = ${parsed.data.org_id} and e.name = ${parsed.data.endpoint}
      order by ev.created_at desc
      limit 1
    `
    if (rows.length === 0) {
      return c.json({ code: "not_found", message: "Endpoint not found" }, HTTP.NOT_FOUND)
    }
    const row = rows[0] as unknown as {
      endpoint_id: string
      version: string
      config_json: unknown
    }
    // config_json should contain routing, policies, quotas, schema
    const cfg = row.config_json as Record<string, unknown>
    return c.json({ endpoint_id: row.endpoint_id, version: row.version, ...cfg })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})
const InternalAuthKeyRequestSchema = z.object({ token: z.string() })
const InternalEndpointConfigRequestSchema = z.object({ org_id: z.string(), endpoint: z.string() })
