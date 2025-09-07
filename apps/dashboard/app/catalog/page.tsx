const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3001"
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || ""

async function fetchCatalog() {
  const res = await fetch(`${MAIN_APP_URL}/admin/catalog`, { cache: "no-store" })
  if (!res.ok) {
    return [] as Array<{
      id: string
      org_id: string
      name: string
      visibility: string
      created_at: string
    }>
  }
  const data = (await res.json()) as {
    items: Array<{
      id: string
      org_id: string
      name: string
      visibility: string
      created_at: string
    }>
  }
  return data.items
}

async function installEndpoint(formData: FormData) {
  "use server"
  const id = (formData.get("id") as string) || ""
  const org_id = (formData.get("org_id") as string) || ""
  if (!(id && org_id)) {
    return
  }
  await fetch(`${MAIN_APP_URL}/admin/endpoints/${encodeURIComponent(id)}/install`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ org_id }),
  })
}

export default async function CatalogPage() {
  const orgId = DEFAULT_ORG_ID
  const items = await fetchCatalog()
  return (
    <main style={{ padding: 24 }}>
      <h1>Catalog</h1>
      <p>Install into org: {orgId || "(set NEXT_PUBLIC_DEFAULT_ORG_ID)"}</p>
      <table cellPadding={8} style={{ borderCollapse: "collapse", minWidth: 820 }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Owner Org</th>
            <th align="left">Published</th>
            <th align="left">Created</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.org_id}</td>
              <td>{e.visibility}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>
                <form action={installEndpoint}>
                  <input name="id" type="hidden" value={e.id} />
                  <input name="org_id" type="hidden" value={orgId} />
                  <button type="submit">Install</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
