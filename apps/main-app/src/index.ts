import { Hono } from 'hono'
import { serve } from 'bun'

const app = new Hono()

app.get('/', (c) => c.json({ ok: true, service: 'main-app' }))

const port = Number(process.env.MAIN_APP_PORT || 3001)
serve({ fetch: app.fetch, port })
console.log(`[main-app] listening on http://localhost:${port}`)

