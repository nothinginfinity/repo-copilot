# Alice Handoff — 2026-05-15 Evening (Session 3)
_Authoritative state snapshot. Overrides inbox and mail for current status._

---

## Current State

**Phase:** AFO v1 dogfood launch — code complete, blocked on Cloudflare domain wiring only.

**What's done:**
- All 10 roadmap commits shipped to `nothinginfinity/parallel-internet-sites`
- `workers/visibility-snapshot/` Worker is complete:
  - `index.js` — serves `GET /start`, `GET /results`, `POST /api/visibility-snapshot`
  - `start.html` — full 8-field form + Turnstile + `{{TURNSTILE_SITE_KEY}}` placeholder (injected at serve time)
  - `results.html` — score ring, 10-check list, 5 prompts, platform links, CTA card
  - `wrangler.toml` — Worker name `afo-visibility-snapshot`, D1 binding `afo-v1`
  - Booking URL **hardcoded** in `results.html`: `https://cal.com/jared-edwards-gscxmo`
  - Booking URL also in `index.js` const `BOOKING_URL` (for API unreachable response only)
- `db/migrations/002_visibility_snapshot_fields.sql` — additive migration ready to apply
  - Adds columns to `audit_requests`
  - Creates `visibility_snapshots` table + 3 indexes
- `.github/workflows/deploy-visibility-snapshot.yml` — deploys on push to `workers/visibility-snapshot/**`
- `TURNSTILE_SECRET` injected as secret by the workflow

**What is NOT done (Cloudflare dashboard steps — Jared must do):**
1. Apply migration to production D1:
   ```
   wrangler d1 execute afo-v1 --file=db/migrations/002_visibility_snapshot_fields.sql --remote
   ```
2. Add `TURNSTILE_SITE_KEY` to Worker `[vars]` in dashboard OR in `wrangler.toml` (needed for `/start` form)
3. Wire custom domain route: `agentfeedoptimization.com/*` → Worker `afo-visibility-snapshot`
4. Trigger deploy: push any change to `workers/visibility-snapshot/**` OR run workflow manually

**TrueBuild homepage label** — homepage copy still shows TrueBuild as a real case study. Needs a "Demo" label. Deferred — not blocking launch.

**AFO self-test** — Jared or Alice runs snapshot on `agentfeedoptimization.com` after launch as go/no-go gate.

---

## Open Questions

1. **Migration apply** — Has Jared run `002_visibility_snapshot_fields.sql` against production D1 yet?
2. **TURNSTILE_SITE_KEY** — Is the site key var set in the Worker? (Secret is set by workflow; site key is a public var.)
3. **Custom domain route** — Is `agentfeedoptimization.com` routing to the `afo-visibility-snapshot` Worker yet?
4. **TrueBuild demo label** — Low priority, needs a one-line copy edit on the homepage.

---

## Repo Structure (as audited this session)

```
nothinginfinity/parallel-internet-sites
├── .github/workflows/
│   ├── deploy-audit-signup.yml
│   └── deploy-visibility-snapshot.yml
├── db/migrations/
│   ├── 002_visibility_snapshot_fields.sql  ✅ ready to apply
│   └── README.md
├── docs/
│   └── afo-funnel-roadmap-v1.md           ✅ committed
├── workers/
│   ├── audit-signup/                       ✅ untouched — live
│   └── visibility-snapshot/
│       ├── index.js                        ✅ complete
│       ├── start.html                      ✅ complete
│       ├── results.html                    ✅ complete (booking URL hardcoded)
│       ├── wrangler.toml                   ✅ complete
│       ├── package.json                    ✅
│       └── README.md                       ✅
```

---

## Next Session Start Checklist

1. Ask Jared: Have the 4 Cloudflare dashboard steps above been completed?
2. If yes to all 4 → run AFO self-test and mark launch-ready
3. If no → identify which step is stuck and unblock
4. TrueBuild demo label — 5-minute copy edit, bundle with next push
