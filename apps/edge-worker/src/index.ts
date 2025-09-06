import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('AlphaGate Edge Worker OK'))

// Placeholder for OpenAI-compatible Responses API proxy
app.all('/v1/responses', (c) => c.text('TODO: proxy to Portkey/OpenAI', 501))

export default app

