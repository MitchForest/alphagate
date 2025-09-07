import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { config as loadEnv } from "dotenv"
import { z } from "zod"

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  CLICKHOUSE_URL: z.string().optional(),
  CLICKHOUSE_USER: z.string().optional(),
  CLICKHOUSE_PASSWORD: z.string().optional(),

  PORTKEY_GATEWAY_URL: z.string().optional(),
  PORTKEY_ORG_TOKEN: z.string().optional(),

  AWS_REGION: z.string().optional(),
  AWS_KMS_KEY_ID: z.string().optional(),

  MAIN_APP_PORT: z.string().optional(),
})

export type AppEnv = z.infer<typeof EnvSchema>

export const env: AppEnv = (() => {
  // Attempt to load repo root .env if not already present (when running from subfolders)
  if (!process.env.DATABASE_URL) {
    const here = dirname(fileURLToPath(import.meta.url))
    const rootEnv = resolve(here, "../../../../.env")
    loadEnv({ path: rootEnv })
  }
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n")
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return parsed.data
})()
