import { z } from "zod"

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  CLICKHOUSE_URL: z.string().url().optional(),
  CLICKHOUSE_USER: z.string().optional(),
  CLICKHOUSE_PASSWORD: z.string().optional(),

  PORTKEY_GATEWAY_URL: z.string().url().optional(),
  PORTKEY_ORG_TOKEN: z.string().optional(),

  AWS_REGION: z.string().optional(),
  AWS_KMS_KEY_ID: z.string().optional(),

  MAIN_APP_PORT: z.string().optional(),
})

export type AppEnv = z.infer<typeof EnvSchema>

export const env: AppEnv = (() => {
  // Note: dotenv loading is intentionally skipped; Bun apps can rely on process.env
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n")
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return parsed.data
})()
