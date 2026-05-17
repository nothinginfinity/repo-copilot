# [Worker Name] — README
_Reference: G-020 Source-of-Truth & Deploy Discipline Protocol_

Copy this template into every Cloudflare Worker directory as `README.md`.

---

## Worker Name

(Exact name as it appears in Cloudflare Dashboard — e.g., `afo-visibility-snapshot`)

## Purpose

(One paragraph. What does this Worker do? What triggers it? What does it produce?)

## Canonical Source Path

```
<repo>/<path-to-worker-directory>/
  index.js
  wrangler.toml
  README.md       ← this file
  DEPLOY_LOG.md
```

## Route / Domain

| Method | Route | Purpose |
|--------|-------|---------|
| POST | https://example.com/api/endpoint | Description |

---

## Environment Variables

| Var | Secret? | Required? | Purpose | Where Set |
|-----|---------|-----------|---------|----------|
| EXAMPLE_KEY | Yes | Yes | API auth | CF Dashboard → Worker Settings |

**⚠️ Never commit secret values to GitHub. Document name and purpose only.**

---

## D1 / KV Bindings

| Binding | Type | Resource Name | Purpose |
|---------|------|---------------|---------|
| DB | D1 | afo-v1 | Read/write customers and snapshots |

Also defined in `wrangler.toml`.

---

## Deploy Command

```bash
# From the worker directory:
cd worker/[worker-name]
wrangler deploy
```

**Required:** Source must be committed to GitHub before deploying.

---

## Test Checklist

- [ ] Submit form / trigger endpoint
- [ ] Confirm D1 row created (check via CF D1 Console)
- [ ] Confirm GitHub Issue created (check repo Issues)
- [ ] Confirm email sent (check inbox)
- [ ] Check Worker logs for errors (CF Dashboard → Workers → Logs)

---

## Rollback Notes

(How to roll back if deploy fails. e.g., redeploy previous commit SHA, restore D1 row, etc.)

---

## Emergency Quick Edit Recovery

If a hotfix was applied via Cloudflare Quick Edit:

1. Copy live source from CF Quick Edit back to `index.js` in this directory.
2. Commit with message: `sync: recover Cloudflare hotfix for [worker-name]`
3. Update `DEPLOY_LOG.md`.
4. Update relevant handoff in `repo-copilot`.
5. Confirm drift is resolved before resuming feature work.

**Protocol reference:** `spaces/protocols/G-020-source-of-truth-and-deploy-discipline.md`
