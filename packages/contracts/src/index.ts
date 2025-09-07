import { z } from "zod"

// OpenAI Responses-compatible request (subset used by AlphaGate)
const InputTextPart = z.object({ type: z.literal("input_text"), text: z.string() })
const InputImagePart = z.object({
  type: z.literal("input_image"),
  image_url: z.string().url(),
})
export const ResponsesContentPartSchema = z.union([InputTextPart, InputImagePart])
export type ResponsesContentPart = z.infer<typeof ResponsesContentPartSchema>

export const ResponsesMessageSchema = z.object({
  role: z.enum(["user", "system"]).default("user"),
  content: z.array(ResponsesContentPartSchema).min(1),
})
export type ResponsesMessage = z.infer<typeof ResponsesMessageSchema>

const JsonSchemaSchema = z.object({
  name: z.string(),
  // JSON Schema is opaque here; validated separately in server
  schema: z.unknown(),
})
const ResponseFormatVariantSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("json_schema"), json_schema: JsonSchemaSchema }),
  z.object({ type: z.literal("text") }),
])

export const ResponsesRequestSchema = z.object({
  model: z.string(),
  input: z.array(ResponsesMessageSchema).min(1),
  response_format: ResponseFormatVariantSchema.optional().default({ type: "text" }),
})
export type ResponsesRequest = z.infer<typeof ResponsesRequestSchema>

export const ResponsesErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
})
export type ResponsesError = z.infer<typeof ResponsesErrorSchema>

// Streaming events (subset)
export const StreamEventOutputTextDelta = z.object({
  type: z.literal("response.output_text.delta"),
  delta: z.string(),
})
export const StreamEventCompleted = z.object({
  type: z.literal("response.completed"),
  response: z.unknown().optional(),
})
export const ResponsesStreamEventSchema = z.union([
  StreamEventOutputTextDelta,
  StreamEventCompleted,
])
export type ResponsesStreamEvent = z.infer<typeof ResponsesStreamEventSchema>

// Admin API DTOs (subset for MVP)
export const VisibilityEnum = z.enum(["private", "public"]) // endpoint visibility

export const GradeBandEnum = z.enum(["K-5", "6-8", "9-12"]) // policy preset

export const EndpointRoutingSchema = z.object({
  primary: z.object({ provider: z.string(), model: z.string(), byok_ref: z.string().optional() }),
  failover: z
    .array(z.object({ provider: z.string(), model: z.string(), byok_ref: z.string().optional() }))
    .optional()
    .default([]),
})

export const EndpointPoliciesSchema = z.object({
  grade_band: GradeBandEnum,
  pii_redaction: z.boolean().default(true),
  retention_days: z.number().int().nonnegative().default(1),
})

export const EndpointQuotasSchema = z.object({
  per_day: z.number().int().positive().optional(),
  per_month: z.number().int().positive().optional(),
})

export const EndpointPromptSchema = z.object({
  system: z.string().optional(),
})

export const EndpointCreateRequestSchema = z.object({
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
export type EndpointCreateRequest = z.infer<typeof EndpointCreateRequestSchema>

export const EndpointPublishRequestSchema = z.object({ endpoint_id: z.string() })
export type EndpointPublishRequest = z.infer<typeof EndpointPublishRequestSchema>

export const EndpointInstallRequestSchema = z.object({
  source_endpoint_id: z.string(),
  org_id: z.string(),
})
export type EndpointInstallRequest = z.infer<typeof EndpointInstallRequestSchema>

export const ApiKeyCreateRequestSchema = z.object({
  org_id: z.string(),
  name: z.string(),
  scopes: z.object({ endpoints: z.array(z.string()).optional() }).optional(),
})
export type ApiKeyCreateRequest = z.infer<typeof ApiKeyCreateRequestSchema>

export const ApiKeyResponseSchema = z.object({
  id: z.string(),
  prefix: z.string(),
  status: z.enum(["active", "disabled"]).default("active"),
  created_at: z.string(),
  // Returned only on creation time so the caller can copy it
  token: z.string().optional(),
})
export type ApiKeyResponse = z.infer<typeof ApiKeyResponseSchema>

export const InternalAuthKeyRequestSchema = z.object({ token: z.string() })
export const InternalAuthKeyResponseSchema = z.object({
  org_id: z.string(),
  api_key_id: z.string(),
  scopes: z.object({ endpoints: z.array(z.string()).optional() }).optional(),
})
export type InternalAuthKeyRequest = z.infer<typeof InternalAuthKeyRequestSchema>
export type InternalAuthKeyResponse = z.infer<typeof InternalAuthKeyResponseSchema>

export const InternalEndpointConfigRequestSchema = z.object({
  org_id: z.string(),
  endpoint: z.string(),
})
export const InternalEndpointConfigResponseSchema = z.object({
  endpoint_id: z.string(),
  version: z.string(),
  routing: EndpointRoutingSchema,
  policies: EndpointPoliciesSchema,
  quotas: EndpointQuotasSchema.optional(),
  schema: JsonSchemaSchema.optional(),
})
export type InternalEndpointConfigRequest = z.infer<typeof InternalEndpointConfigRequestSchema>
export type InternalEndpointConfigResponse = z.infer<typeof InternalEndpointConfigResponseSchema>
