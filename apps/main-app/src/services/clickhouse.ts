import { env } from "../config/env"

type Client = ReturnType<typeof import("@clickhouse/client").createClient>
let client: Client | null = null

export async function getClickhouse() {
  if (client) {
    return client
  }
  const { createClient } = await import("@clickhouse/client")
  if (!env.CLICKHOUSE_URL) {
    throw new Error("CLICKHOUSE_URL is not set")
  }
  client = createClient({
    url: env.CLICKHOUSE_URL,
    username: env.CLICKHOUSE_USER,
    password: env.CLICKHOUSE_PASSWORD,
  })
  return client
}
