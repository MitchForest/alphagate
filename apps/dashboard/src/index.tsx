import { Hono } from 'hono'
import { serve } from 'bun'
import React from 'react'
import { renderToReadableStream } from 'react-dom/server'

const app = new Hono()

app.get('/', async (c) => {
  const el = React.createElement('div', null, 'AlphaGate Dashboard')
  const stream = await renderToReadableStream(el)
  return new Response(stream, { headers: { 'Content-Type': 'text/html' } })
})

const port = Number(process.env.DASHBOARD_PORT || 3000)
serve({ fetch: app.fetch, port })
console.log(`[dashboard] listening on http://localhost:${port}`)

