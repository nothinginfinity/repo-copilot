# Live Infrastructure Handoff Template
_Reference: G-020 Source-of-Truth & Deploy Discipline Protocol_

Copy this template for every live infrastructure handoff. Fill in all fields. Use `N/A` only if a field genuinely does not apply.

---

## Handoff: [Component Name] — [Date]

**Component:** (e.g., Cloudflare Worker: afo-visibility-snapshot)  
**Repo:** (e.g., nothinginfinity/afo-site)  
**Canonical source path:** (e.g., worker/visibility-snapshot/index.js)  
**Runtime name:** (exact name in Cloudflare Dashboard)  
**Route/domain:** (e.g., https://www.agentfeedoptimization.com/api/audit-request)  

---

## Bindings

| Binding | Type | Name | Notes |
|---------|------|------|-------|
| (e.g., DB) | D1 | afo-v1 | Reads/writes customers + visibility_snapshots |

---

## Environment Variables

| Var | Secret? | Required? | Purpose | Status |
|-----|---------|-----------|---------|--------|
| (e.g., TURNSTILE_SECRET_KEY) | Yes | Yes | Validates Turnstile token | Set in CF Dashboard |

---

## Deploy State

**Last known deploy commit:** (SHA or "untracked — DRIFT")  
**Deploy method:** (Wrangler CLI / GitHub Actions / Quick Edit)  
**Deploy date:** (YYYY-MM-DD)  
**Test status:** (passed / failed / untested)  

---

## D1 Schema State

**Tables confirmed:** (list table names)  
**Last migration applied:** (filename or "none")  
**Verification SQL run:** (yes/no)  

---

## Open Blockers

(List any unresolved blockers. If none, write "None.")  

---

## Next Action

(Exactly one next step, clearly stated.)  

---

## Drift Status

- [ ] GitHub source exists and matches live runtime
- [ ] Env vars documented
- [ ] Route/domain documented
- [ ] Deploy log current
- [ ] Handoff current

**Drift status:** CLEAR / DRIFT DETECTED  
