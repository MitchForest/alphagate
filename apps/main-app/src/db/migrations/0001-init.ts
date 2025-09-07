import type { Kysely } from "kysely"
import { sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("organizations")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("tier", "text")
    .addColumn("region", "text")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable("users")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("org_id", "text", (col) => col.notNull().references("organizations.id"))
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("role", "text")
    .addColumn("password_hash", "text")
    .addColumn("external_idp", "text")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable("memberships")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("org_id", "text", (col) => col.notNull().references("organizations.id"))
    .addColumn("user_id", "text", (col) => col.notNull().references("users.id"))
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable("api_keys")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("org_id", "text", (col) => col.notNull().references("organizations.id"))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("prefix", "text", (col) => col.notNull().unique())
    .addColumn("secret_hash", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) => col.notNull().defaultTo("active"))
    .addColumn("last_used_at", "timestamptz")
    .addColumn("rate_limit_json", "jsonb")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable("endpoints")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("org_id", "text", (col) => col.notNull().references("organizations.id"))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("visibility", "text", (col) => col.notNull().defaultTo("private"))
    .addColumn("description", "text")
    .addColumn("tags", "jsonb")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex("endpoints_org_name_unique")
    .on("endpoints")
    .columns(["org_id", "name"])
    .unique()
    .execute()

  await db.schema
    .createTable("endpoint_versions")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("endpoint_id", "text", (col) => col.notNull().references("endpoints.id"))
    .addColumn("version", "text", (col) => col.notNull())
    .addColumn("config_json", "jsonb", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createIndex("endpoint_versions_unique")
    .on("endpoint_versions")
    .columns(["endpoint_id", "version"])
    .unique()
    .execute()

  await db.schema
    .createTable("policies")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("org_id", "text", (col) => col.notNull().references("organizations.id"))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("config_json", "jsonb", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()

  await db.schema
    .createTable("audit_log")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("org_id", "text", (col) => col.notNull().references("organizations.id"))
    .addColumn("actor_user_id", "text")
    .addColumn("action", "text", (col) => col.notNull())
    .addColumn("target", "text")
    .addColumn("details_json", "jsonb")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("audit_log").ifExists().execute()
  await db.schema.dropTable("policies").ifExists().execute()
  await db.schema.dropIndex("endpoint_versions_unique").ifExists().execute()
  await db.schema.dropTable("endpoint_versions").ifExists().execute()
  await db.schema.dropIndex("endpoints_org_name_unique").ifExists().execute()
  await db.schema.dropTable("endpoints").ifExists().execute()
  await db.schema.dropTable("api_keys").ifExists().execute()
  await db.schema.dropTable("memberships").ifExists().execute()
  await db.schema.dropTable("users").ifExists().execute()
  await db.schema.dropTable("organizations").ifExists().execute()
}
