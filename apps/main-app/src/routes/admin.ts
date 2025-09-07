import { Hono } from "hono"
import { type ZodIssue, z } from "zod"
import { getSql } from "../services/db"
import { generateApiKeyToken } from "../services/keys"

export const adminRouter = new Hono()

const HTTP = {
  BAD_REQUEST: 400,
  NOT_IMPLEMENTED: 501,
  INTERNAL: 500,
} as const

// Minimal stubs to define surface; wire DB next
adminRouter.get("/keys", async (c) => {
  try {
    const org_id = c.req.query("org_id")
    if (!org_id) {
      return c.json({ code: "bad_request", message: "Missing org_id" }, HTTP.BAD_REQUEST)
    }
    const sql = getSql()
    const rows = await sql /* sql */`
      select id, name, prefix, status, created_at
      from api_keys
      where org_id = ${org_id}
      order by created_at desc
      limit 100
    `
    const list = rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      name: String(r.name),
      prefix: String(r.prefix),
      status: String(r.status),
      created_at: new Date(String(r.created_at)).toISOString(),
    }))
    return c.json({ items: list })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})

adminRouter.post("/keys", async (c) => {
  try {
    const body = await c.req.json()
    const parsed = ApiKeyCreateRequestSchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.issues.map((i: ZodIssue) => ({
        path: i.path,
        message: i.message,
      }))
      return c.json({ code: "bad_request", message: "Invalid payload", details }, HTTP.BAD_REQUEST)
    }
    const { org_id, name } = parsed.data
    const { token, prefix, secret_hash } = generateApiKeyToken()
    const sql = getSql()
    const id = crypto.randomUUID()
    const rows = await sql /* sql */`
      insert into api_keys (id, org_id, name, prefix, secret_hash, status)
      values (${id}, ${org_id}, ${name}, ${prefix}, ${secret_hash}, 'active')
      returning id, prefix, status, created_at
    `
    const rec = rows[0] as { id: string; prefix: string; status: string; created_at: Date }
    return c.json({
      id: rec.id,
      prefix: rec.prefix,
      status: rec.status,
      created_at: rec.created_at.toISOString(),
      token,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})

adminRouter.get("/endpoints", async (c) => {
  try {
    const org_id = c.req.query("org_id")
    if (!org_id) {
      return c.json({ code: "bad_request", message: "Missing org_id" }, HTTP.BAD_REQUEST)
    }
    const sql = getSql()
    const rows = await sql /* sql */`
      select id, name, visibility, created_at
      from endpoints
      where org_id = ${org_id}
      order by created_at desc
      limit 100
    `
    const list = rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      name: String(r.name),
      visibility: String(r.visibility),
      created_at: new Date(String(r.created_at)).toISOString(),
    }))
    return c.json({ items: list })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})

adminRouter.post("/endpoints", async (c) => {
  try {
    const body = await c.req.json()
    const parsed = EndpointCreateRequestSchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.issues.map((i: ZodIssue) => ({
        path: i.path,
        message: i.message,
      }))
      return c.json({ code: "bad_request", message: "Invalid payload", details }, HTTP.BAD_REQUEST)
    }
    const {
      org_id,
      name,
      description,
      tags,
      visibility,
      routing,
      policies,
      quotas,
      schema,
      prompt,
    } = parsed.data
    const sql = getSql()
    const endpointId = crypto.randomUUID()
    await sql /* sql */`
      insert into endpoints (id, org_id, name, visibility, description, tags)
      values (${endpointId}, ${org_id}, ${name}, ${visibility}, ${description ?? null}, ${tags ? JSON.stringify(tags) : null})
    `
    const versionId = crypto.randomUUID()
    const version = "1.0.0"
    const config = { routing, policies, quotas, schema, prompt }
    await sql /* sql */`
      insert into endpoint_versions (id, endpoint_id, version, config_json)
      values (${versionId}, ${endpointId}, ${version}, ${JSON.stringify(config)})
    `
    return c.json({ id: endpointId, version })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})
// Minimal DTOs (align with contracts for MVP)
const ApiKeyCreateRequestSchema = z.object({
  org_id: z.string(),
  name: z.string(),
  scopes: z.object({ endpoints: z.array(z.string()).optional() }).optional(),
})

const EndpointRoutingSchema = z.object({
  primary: z.object({ provider: z.string(), model: z.string(), byok_ref: z.string().optional() }),
  failover: z
    .array(z.object({ provider: z.string(), model: z.string(), byok_ref: z.string().optional() }))
    .optional()
    .default([]),
})
const GradeBandEnum = z.enum(["K-5", "6-8", "9-12"]) // policy preset
const EndpointPoliciesSchema = z.object({
  grade_band: GradeBandEnum,
  pii_redaction: z.boolean().default(true),
  retention_days: z.number().int().nonnegative().default(1),
})
const EndpointQuotasSchema = z.object({
  per_day: z.number().int().positive().optional(),
  per_month: z.number().int().positive().optional(),
})
const JsonSchemaSchema = z.object({ name: z.string(), schema: z.unknown() })
const EndpointPromptSchema = z.object({ system: z.string().optional() })
const VisibilityEnum = z.enum(["private", "public"]) // endpoint visibility
const EndpointCreateRequestSchema = z.object({
  org_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: VisibilityEnum.default("private"),
  routing: EndpointRoutingSchema,
  policies: EndpointPoliciesSchema,
  quotas: EndpointQuotasSchema.optional(),
  schema: JsonSchemaSchema.optional(),
  prompt: EndpointPromptSchema.optional(),
})

const EndpointInstallRequestSchema = z.object({
  org_id: z.string(),
  name: z.string().optional(),
})

// Publish an endpoint (set visibility to public)
adminRouter.post("/endpoints/:id/publish", async (c) => {
  try {
    const id = c.req.param("id")
    if (!id) {
      return c.json({ code: "bad_request", message: "Missing endpoint id" }, HTTP.BAD_REQUEST)
    }
    const sql = getSql()
    const rows = await sql /* sql */`
      update endpoints set visibility = 'public' where id = ${id} returning id
    `
    if (rows.length === 0) {
      return c.json({ code: "not_found", message: "Endpoint not found" }, HTTP.BAD_REQUEST)
    }
    return c.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})

// Install (clone) an endpoint into another org
adminRouter.post("/endpoints/:id/install", async (c) => {
  try {
    const id = c.req.param("id")
    if (!id) {
      return c.json({ code: "bad_request", message: "Missing endpoint id" }, HTTP.BAD_REQUEST)
    }
    const body = await c.req.json()
    const parsed = EndpointInstallRequestSchema.safeParse(body)
    if (!parsed.success) {
      const details = parsed.error.issues.map((i: ZodIssue) => ({
        path: i.path,
        message: i.message,
      }))
      return c.json({ code: "bad_request", message: "Invalid payload", details }, HTTP.BAD_REQUEST)
    }
    const targetOrg = parsed.data.org_id
    const sql = getSql()
    const src = await sql /* sql */`
      select e.id as endpoint_id, e.name as endpoint_name, e.visibility, e.org_id,
             ev.id as version_id, ev.version, ev.config_json, ev.created_at
      from endpoints e
      join endpoint_versions ev on ev.endpoint_id = e.id
      where e.id = ${id}
      order by ev.created_at desc
      limit 1
    `
    if (src.length === 0) {
      return c.json({ code: "not_found", message: "Endpoint not found" }, HTTP.BAD_REQUEST)
    }
    const row = src[0] as Record<string, unknown>
    let name = parsed.data.name || (row.endpoint_name as string)
    const exists = await sql /* sql */`
      select 1 from endpoints where org_id = ${targetOrg} and name = ${name} limit 1
    `
    if (exists.length > 0) {
      const RADIX = 36
      const START = 2
      const END = 6
      name = `${name}-copy-${(Math.random() + 1).toString(RADIX).slice(START, END)}`
    }
    const newEndpointId = crypto.randomUUID()
    await sql /* sql */`
      insert into endpoints (id, org_id, name, visibility, description, tags)
      values (${newEndpointId}, ${targetOrg}, ${name}, 'private', null, null)
    `
    const newVersionId = crypto.randomUUID()
    await sql /* sql */`
      insert into endpoint_versions (id, endpoint_id, version, config_json)
      values (${newVersionId}, ${newEndpointId}, ${String(row.version)}, ${String(row.config_json)})
    `
    return c.json({ id: newEndpointId, version: String(row.version) })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})

// Catalog: list public endpoints across orgs
adminRouter.get("/catalog", async (c) => {
  try {
    const sql = getSql()
    const rows = await sql /* sql */`
      select id, org_id, name, visibility, created_at from endpoints where visibility = 'public' order by created_at desc limit 100
    `
    const items = rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      org_id: String(r.org_id),
      name: String(r.name),
      visibility: String(r.visibility),
      created_at: new Date(String(r.created_at)).toISOString(),
    }))
    return c.json({ items })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return c.json({ code: "internal_error", message }, HTTP.INTERNAL)
  }
})
