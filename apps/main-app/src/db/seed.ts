import { getSql } from "../services/db"
import { generateApiKeyToken } from "../services/keys"

async function seed() {
  const sql = getSql()

  // Upsert organization
  const orgName = "AlphaGate Dev Org"
  const org = await sql /* sql */`
    select id from organizations where name = ${orgName} limit 1
  `
  let orgId: string
  if (org.length === 0) {
    orgId = crypto.randomUUID()
    await sql /* sql */`
      insert into organizations (id, name, tier, region)
      values (${orgId}, ${orgName}, 'dev', 'us-east-1')
    `
  } else {
    orgId = (org[0] as { id: string }).id
  }

  // Create API key if none exist for this org
  const existingKeys = await sql /* sql */`
    select id from api_keys where org_id = ${orgId} limit 1
  `
  let apiKeyToken: string | null = null
  if (existingKeys.length === 0) {
    const { token, prefix, secret_hash } = generateApiKeyToken()
    apiKeyToken = token
    await sql /* sql */`
      insert into api_keys (id, org_id, name, prefix, secret_hash, status)
      values (${crypto.randomUUID()}, ${orgId}, 'Default Key', ${prefix}, ${secret_hash}, 'active')
    `
  }

  // Seed Screentime endpoint template if missing
  const endpointName = "vision-screencast-evaluator"
  const endpoints = await sql /* sql */`
    select id from endpoints where org_id = ${orgId} and name = ${endpointName} limit 1
  `
  let endpointId: string
  if (endpoints.length === 0) {
    endpointId = crypto.randomUUID()
    await sql /* sql */`
      insert into endpoints (id, org_id, name, visibility, description, tags)
      values (${endpointId}, ${orgId}, ${endpointName}, 'private', 'Screentime evaluator template', ${JSON.stringify(["screentime", "vision"])})
    `
    const versionId = crypto.randomUUID()
    const version = "1.0.0"
    const config = {
      routing: { primary: { provider: "runpod", model: "qwen-vl-7b" }, failover: [] },
      policies: { grade_band: "6-8", pii_redaction: true, retention_days: 1 },
      quotas: { per_day: 20_000 },
      schema: { name: "screentime_activity_v1", schema: {} },
      prompt: { system: "Analyze classroom screenshots and output structured JSON per schema." },
    }
    await sql /* sql */`
      insert into endpoint_versions (id, endpoint_id, version, config_json)
      values (${versionId}, ${endpointId}, ${version}, ${JSON.stringify(config)})
    `
  } else {
    endpointId = (endpoints[0] as { id: string }).id
  }

  // Write seed output to file for the developer to read (avoid console usage per linter)
  const out = {
    org_id: orgId,
    api_key_token: apiKeyToken, // null if an API key already existed
    endpoint: endpointName,
  }
  const { writeFile, mkdir } = await import("node:fs/promises")
  await mkdir(".tmp", { recursive: true })
  await writeFile(".tmp/seed-output.json", JSON.stringify(out, null, 2), "utf8")
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
