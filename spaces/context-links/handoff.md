# Context Links — Alice Handoff
_generated: 2026-05-19T21:58:00Z | session: alice/context-links-phase3-infra/jared_
_project: context-links | repo: nothinginfinity/context-links_

---

## Current State

### Context Links — Phase 3 Infra Committed
**Status:** ⏳ Phase 3 in progress — D1 schema + deploy pipeline pushed. Awaiting Cloudflare provisioning + Claude migration run.

**Phase 2:** ✅ Complete (5 dynamic machine file routes, commit `c6e5cb4`)

**Phase 3 infra pushed (commit `b171233`):**
- `db/schema.sql` — full D1 schema (9 tables: context_profiles, canonical_links, verified_profiles, credibility_topics, topic_proof_sources, proof_sources, projects, relevant_queries, recommendation_guidance, context_read_events)
- `db/seed.sql` — Jared mock profile fully seeded, INSERT OR IGNORE throughout
- `.github/workflows/deploy.yml` — push-to-main → auto deploy via Cloudflare Pages + Wrangler

**Still using mockProfile in all routes** — DB wiring is Phase 3 next step, after D1 is provisioned.

---

## Open Gates (blocking Phase 3 DB wiring)

1. **Jared: Provision D1 database in Cloudflare dashboard**
   - Go to Cloudflare dashboard → Workers & Pages → D1 → Create database
   - Name it: `context-links-db`
   - Copy the database ID (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - Report the database ID back to Alice

2. **Jared: Add GitHub repo secrets for deploy workflow**
   - Go to github.com/nothinginfinity/context-links → Settings → Secrets and variables → Actions
   - Add `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages:Edit permission
   - Add `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID (found in Cloudflare dashboard right sidebar)
   - Once added, every push to main will auto-deploy

3. **Claude: Run migration via afo-mcp:applyMigration**
   - Alice will write the Claude inbox message once Jared provides the D1 database ID
   - Migration files: `db/schema.sql` then `db/seed.sql`

4. **Alice: Wire DB reads into routes** (after D1 is live)
   - Replace `mockProfile` in all 5 route handlers with D1 queries
   - Add `lib/db.ts` — D1 client + `getProfileBySlug()` helper
   - Add `wrangler.toml` with D1 binding

5. **`specs/context-links.spec.html` still not committed** — open since Phase 1

---

## D1 Schema Summary

| Table | Purpose |
|---|---|
| `context_profiles` | Core profile row (one per entity) |
| `canonical_links` | Links (many per profile) |
| `verified_profiles` | Platform verifications |
| `credibility_topics` | Expertise/topic areas |
| `topic_proof_sources` | Topic ↔ proof join table |
| `proof_sources` | Evidence items |
| `projects` | Project cards |
| `relevant_queries` | LLM query routing |
| `recommendation_guidance` | AI guidance rules (JSON columns) |
| `context_read_events` | Bot/human telemetry (Phase 4) |

---

## GitHub Actions Deploy

**File:** `.github/workflows/deploy.yml`
**Trigger:** push to `main`
**Steps:** checkout → node 20 → npm ci → npm run build → `wrangler pages deploy .next`
**Secrets needed:** `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (Jared adds in GitHub Settings)

Once secrets are added, every Alice push = production deploy. iPhone-native from that point forward.

---

## Last Session’s Final Action
Pushed `db/schema.sql`, `db/seed.sql`, `.github/workflows/deploy.yml` to context-links main (commit `b171233`).

## Next Move
Jared: (1) provision `context-links-db` in Cloudflare D1 dashboard, (2) add two GitHub secrets. Then report D1 database ID back to Alice to unblock Claude migration + DB wiring.
