import { Kysely } from "kysely"
import { PostgresJSDialect } from "kysely-postgres-js"
import postgres from "postgres"
import { env } from "../config/env"
import type { DB } from "../types/db"

let dbInstance: Kysely<DB> | null = null
let sqlClient: ReturnType<typeof postgres> | null = null

export function getDb(): Kysely<DB> {
  if (dbInstance) {
    return dbInstance
  }
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }
  const sql = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })
  const dialect = new PostgresJSDialect({ postgres: sql })
  dbInstance = new Kysely<DB>({ dialect })
  sqlClient = sql
  return dbInstance
}

export function getSql() {
  if (!sqlClient) {
    // ensure getDb() initialized connection
    getDb()
  }
  if (!sqlClient) {
    throw new Error("Postgres client not initialized")
  }
  return sqlClient
}
