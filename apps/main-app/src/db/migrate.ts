import { promises as fs } from "node:fs"
import path from "node:path"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import { getDb } from "../services/db"

async function run() {
  const db: Kysely<unknown> = getDb() as unknown as Kysely<unknown>
  const migrationsFolder = path.resolve(import.meta.dirname, "./migrations")
  const provider = new FileMigrationProvider({
    fs,
    path,
    migrationFolder: migrationsFolder,
  })
  const migrator = new Migrator({ db, provider })
  const { error } = await migrator.migrateToLatest()
  if (error) {
    process.exit(1)
  }
  await db.destroy?.()
}

run().catch(() => {
  process.exit(1)
})
