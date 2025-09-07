import { revalidatePath } from "next/cache"

const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3001"
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || ""

async function fetchKeys(orgId: string) {
  if (!orgId) {
    return [] as Array<{
      id: string
      name: string
      prefix: string
      status: string
      created_at: string
    }>
  }
  const res = await fetch(`${MAIN_APP_URL}/admin/keys?org_id=${encodeURIComponent(orgId)}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    return []
  }
  const data = (await res.json()) as {
    items: Array<{ id: string; name: string; prefix: string; status: string; created_at: string }>
  }
  return data.items
}

async function createKey(formData: FormData) {
  "use server"
  const org_id = (formData.get("org_id") as string) || ""
  const name = (formData.get("name") as string) || "Default Key"
  const _res = await fetch(`${MAIN_APP_URL}/admin/keys`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ org_id, name }),
  })
  // Token is returned only once on create; for now, not persisted in UI
  revalidatePath("/keys")
}

export default async function KeysPage() {
  const orgId = DEFAULT_ORG_ID
  const items = await fetchKeys(orgId)
  const _lastToken = ""
  return (
    <main style={{ padding: 24 }}>
      <h1>API Keys</h1>
      <p>Organization: {orgId || "(set NEXT_PUBLIC_DEFAULT_ORG_ID)"}</p>
      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <form action={createKey} style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <div>
            <label htmlFor="org_id">Org ID</label>
            <input
              defaultValue={orgId}
              id="org_id"
              name="org_id"
              style={{ display: "block", width: 320 }}
            />
          </div>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              placeholder="Default Key"
              style={{ display: "block", width: 240 }}
            />
          </div>
          <button type="submit">Create Key</button>
        </form>
        {/* Token not persisted in UI yet */}
      </section>

      <table cellPadding={8} style={{ borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th align="left">Prefix</th>
            <th align="left">Name</th>
            <th align="left">Status</th>
            <th align="left">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((k) => (
            <tr key={k.id}>
              <td>{k.prefix}</td>
              <td>{k.name}</td>
              <td>{k.status}</td>
              <td>{new Date(k.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
