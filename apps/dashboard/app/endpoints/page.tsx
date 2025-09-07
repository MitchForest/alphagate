const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3001"
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || ""

async function fetchEndpoints(orgId: string) {
  if (!orgId) {
    return [] as Array<{ id: string; name: string; visibility: string; created_at: string }>
  }
  const res = await fetch(`${MAIN_APP_URL}/admin/endpoints?org_id=${encodeURIComponent(orgId)}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    return []
  }
  const data = (await res.json()) as {
    items: Array<{ id: string; name: string; visibility: string; created_at: string }>
  }
  return data.items
}

async function createEndpoint(formData: FormData) {
  "use server"
  const org_id = (formData.get("org_id") as string) || ""
  const name = (formData.get("name") as string) || "vision-screencast-evaluator"
  const visibility = (formData.get("visibility") as string) || "private"

  const routing = {
    primary: {
      provider: "runpod",
      model: (formData.get("provider_model") as string) || "qwen-vl-7b",
    },
  }
  const policies = { grade_band: "6-8", pii_redaction: true, retention_days: 1 }
  const payload = { org_id, name, visibility, routing, policies }

  await fetch(`${MAIN_APP_URL}/admin/endpoints`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })
}

async function publishEndpoint(formData: FormData) {
  "use server"
  const id = (formData.get("id") as string) || ""
  if (!id) {
    return
  }
  await fetch(`${MAIN_APP_URL}/admin/endpoints/${encodeURIComponent(id)}/publish`, {
    method: "POST",
  })
}

export default async function EndpointsPage() {
  const orgId = DEFAULT_ORG_ID
  const items = await fetchEndpoints(orgId)
  return (
    <main style={{ padding: 24 }}>
      <h1>Endpoints</h1>
      <p>Organization: {orgId || "(set NEXT_PUBLIC_DEFAULT_ORG_ID)"}</p>
      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <form action={createEndpoint} style={{ display: "flex", gap: 8, alignItems: "end" }}>
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
              defaultValue="vision-screencast-evaluator"
              id="name"
              name="name"
              style={{ display: "block", width: 320 }}
            />
          </div>
          <div>
            <label htmlFor="provider_model">Provider model</label>
            <input
              defaultValue="qwen-vl-7b"
              id="provider_model"
              name="provider_model"
              style={{ display: "block", width: 240 }}
            />
          </div>
          <div>
            <label htmlFor="visibility">Visibility</label>
            <select
              defaultValue="private"
              id="visibility"
              name="visibility"
              style={{ display: "block", width: 160 }}
            >
              <option value="private">private</option>
              <option value="public">public</option>
            </select>
          </div>
          <button type="submit">Create Endpoint</button>
        </form>
      </section>

      <table cellPadding={8} style={{ borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Visibility</th>
            <th align="left">Created</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.visibility}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>
                <form action={publishEndpoint}>
                  <input name="id" type="hidden" value={e.id} />
                  <button disabled={e.visibility === "public"} type="submit">
                    {e.visibility === "public" ? "Published" : "Publish"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
