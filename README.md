# Alpha Gate Monorepo

Monorepo scaffold using Bun workspaces + Turborepo + Changesets, Biome for lint/format, and Vitest for tests.

- Apps: `apps/edge-worker`, `apps/main-app`, `apps/dashboard`
- Packages: `packages/*`
- UI: `ui/ui`, `ui/kibo`, `ui/ai` (shadcn namespaced registries)

Quickstart
- Install Bun: https://bun.sh
- Install deps: `bun install`
- Dev all: `bun run dev`
- Build all: `bun run build`
- Lint/format: `bun run lint` / `bun run format`
- Test: `bun run test`

Notes
- CI is configured in `.github/workflows/ci.yml`.
- Configure shadcn namespaces per `ui/*` READMEs and https://ui.shadcn.com/docs/registry/namespace.

