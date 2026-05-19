# Context Links — Alice Handoff
_generated: 2026-05-19T16:13:00Z | session: alice/context-links-phase1/jared_
_project: context-links | repo: nothinginfinity/context-links_

---

## Current State

### Context Links — Phase 1 Scaffold
**Status:** ✅ Phase 1 complete — repo live, app shell built, mock data wired

- Repo created: `nothinginfinity/context-links` (private)
- Spec file staged at `specs/context-links.spec.html` — source of truth for all component contracts
- Next.js 14 app shell scaffolded: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- All TypeScript models live in `lib/types.ts` (12 types from `#model-spec`)
- Mock data seeded in `lib/mock-data.ts` — persona: Jared Edwards, AFO/context harness builder
- File generators written in `lib/generators/` for `context.json`, `context.md`, `llms.txt`, `links.json`, `proof.json`
- 11 React components built with `data-spec-component` annotations matching the visual contract
- 6 API routes wired: `/api/context-profile`, `/api/links`, `/api/projects`, `/api/proof`, `/api/ai-guidance`, `/api/analytics/summary`
- 6 public machine-readable files placed in `public/`: `llms.txt`, `context.json`, `context.md`, `links.json`, `proof.json`, `.well-known/context-links.json`
- JSON Schema for `ContextProfile` at `schemas/context-profile.schema.json`
- Root docs complete: `README.md`, `AGENTS.md`, `PRD.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`

---

## Repo Map

| Path | Purpose |
|---|---|
| `specs/context-links.spec.html` | Visual + machine contract — source of truth |
| `lib/types.ts` | All TypeScript models (ContextProfile, CanonicalLink, etc.) |
| `lib/mock-data.ts` | Seeded mock profile, analytics, AI guidance |
| `lib/generators/` | Generators for all 5 machine-readable output files |
| `app/page.tsx` | `PublicContextPage` — assembles all 11 components |
| `app/globals.css` | Dark glassmorphic design system, CSS tokens |
| `app/layout.tsx` | Root layout with Inter font |
| `components/` | 11 components — one per `data-spec-component` boundary |
| `app/api/` | 6 REST API routes |
| `public/` | Static machine-readable files (Phase 1 placeholders) |
| `schemas/` | JSON Schema Draft-07 for ContextProfile |
| `README.md` | Project overview and setup |
| `AGENTS.md` | Agent operating instructions for this repo |
| `PRD.md` | Product requirements doc |
| `ROADMAP.md` | 5-phase roadmap with Phase 1 checked |
| `docs/ARCHITECTURE.md` | Layer map, file table, deployment topology |

---

## Open Gates (blocking Phase 2)

1. **Spec file not yet pushed to repo** — `specs/context-links.spec.html` exists in layout but the actual HTML file content needs to be committed. Jared should push the spec file from his local copy or paste content for Alice to push.
2. **`npm install` + first `npm run dev` not yet verified** — no CI is wired. Jared should do a local smoke test before Phase 2 starts.
3. **Generators are written but not wired to API routes** — Phase 1 uses static `public/` files. Phase 2 task: wire generators to serve dynamically from API routes.
4. **No database yet** — all data is mock. Phase 2 task: choose persistence layer (Supabase, PlanetScale, or Cloudflare D1).

---

## Spec Contract Reference

All component, model, route, and file-output specs live inside `specs/context-links.spec.html`.
The embedded JSON specs are read in this order:

1. `#app-spec` — app identity and phase gates
2. `#prd-spec` — product requirements
3. `#route-spec` — URL routes and page contracts
4. `#model-spec` — TypeScript data models
5. `#api-spec` — REST API contracts
6. `#file-output-spec` — machine-readable output file contracts
7. `#roadmap-spec` — phase roadmap
8. `#agents-spec` — agent roles and responsibilities
9. `#component-inventory` — component list
10. `#agent-build-instructions` — Alice's build instructions

`data-spec-component` attributes on each React component map directly to entries in `#component-inventory`.

---

## Phase 2 — What Comes Next

Phase 2 tasks (from `ROADMAP.md` and `#roadmap-spec`):

1. **Database** — provision Supabase (or Cloudflare D1) and define the `context_profiles` table
2. **Profile editor UI** — `/dashboard` page with form for editing `ContextProfile` fields
3. **Dynamic generation** — wire `lib/generators/` to produce public files from live DB data
4. **Auth** — lightweight auth gate on `/dashboard` (NextAuth or Clerk, Phase 1 explicitly excluded)
5. **Bot detection telemetry** — log LLM reads via `/api/analytics/llm-read` route
6. **Custom slug routing** — `/:slug` → public context page for that profile
7. **`/api/ingest` route** — accept external profile data from `#api-spec`

---

## Context for Next Alice Instance

You are Alice, working on **Context Links** — a standalone project separate from AFO/repo-copilot.

**What it is:** An "all-my-links" page upgraded into a canonical AI context hub. Users get a public page at `/:slug` that serves both humans (visual) and LLMs (machine-readable files: `llms.txt`, `context.json`, `context.md`, `links.json`, `proof.json`).

**Repo:** `nothinginfinity/context-links` (private)  
**Branch:** `main`  
**Framework:** Next.js 14, TypeScript, Tailwind v3  
**Design system:** Dark glassmorphic — deep navy `#080a12` background, gradient mesh, glass cards  
**Key file:** `specs/context-links.spec.html` — ALWAYS read this before building anything  

**Do not** confuse this with `repo-copilot` or `parallel-internet-sites`. This is a greenfield product with its own repo.

**To run locally:**
```bash
git clone https://github.com/nothinginfinity/context-links
cd context-links
npm install
npm run dev
# → http://localhost:3000
```

**Alice's primary file for this project is this file:**  
`spaces/context-links/handoff.md` in `nothinginfinity/repo-copilot`

Load it at the start of any Context Links session.
