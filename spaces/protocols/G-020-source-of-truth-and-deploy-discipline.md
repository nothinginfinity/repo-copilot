# G-020 — Source-of-Truth & Deploy Discipline Protocol
_version: 1.0 | last-updated: 2026-05-16 | applies-to: alice, bob, brainstorm_

---

## Purpose

This protocol prevents drift between GitHub, Cloudflare, and agent memory. It applies to all live infrastructure work — especially Cloudflare Workers, D1, KV, DNS, Pages, and GitHub Actions.

This protocol was created after a 33-deploy drift event on 2026-05-16 where the live Cloudflare Worker had been modified repeatedly without corresponding GitHub commits. Cloudflare became the de-facto source of truth by accident. This document makes that almost impossible going forward.

---

## Core Law

```
GitHub is canonical source.
Cloudflare is runtime.
repo-copilot is coordination memory.
Brainstorm is architecture/review.

No live infrastructure change is considered complete unless
source, deploy state, and handoff state are all aligned.
```

**The mantra:**
```
Before building, locate the source.
Before deploying, commit the source.
After deploying, record the source.
If source is missing, the task is not build — the task is recovery.
```

---

## Source-of-Truth Hierarchy

1. GitHub repository source files
2. GitHub deploy workflows / Wrangler config
3. repo-copilot handoff and deploy records
4. Cloudflare runtime state
5. Session memory / chat memory

If Cloudflare runtime differs from GitHub source, this condition is called **DRIFT**.

---

## Drift Rule

When drift is detected:

1. Stop feature work immediately.
2. Identify the live runtime component (Worker name, route, D1 binding).
3. Recover or reconstruct live source (via Quick Edit copy, session history, or reconstruction).
4. Commit canonical source to GitHub.
5. Document deploy state in DEPLOY_LOG.md and handoff.
6. Only then continue feature work.

No exceptions. Drift takes priority over all feature work.

---

## Cloudflare Worker Rules

Every Cloudflare Worker must have a canonical GitHub path.

**Required file structure:**
```
worker-name/
  index.js          ← canonical Worker source
  wrangler.toml     ← Worker config and bindings
  README.md         ← Worker documentation
  DEPLOY_LOG.md     ← deploy history
```

**README.md must document:**
- Worker name
- Route/domain
- Purpose
- Required env vars (table format — see Env Var Rule below)
- Required D1/KV bindings
- Deploy command
- Test checklist
- Rollback notes

**DEPLOY_LOG.md must record for each deploy:**
- Date/time
- Commit SHA
- Worker name
- Route/domain
- Deploy method (Wrangler CLI / GitHub Actions / Quick Edit)
- Result (success / failure)
- Test result

---

## Git-First Deploy Rule

**Allowed normal flow:**
```
edit source → commit to GitHub → deploy from committed source → record deploy → test → handoff
```

**Disallowed normal flow:**
```
edit in Cloudflare → deploy → maybe update GitHub later
```

Wrangler deploy is only permitted from a committed GitHub source. If uncommitted changes are being deployed, stop and commit first.

**Preferred long-term path:** GitHub Actions deploy triggered by push to main.

---

## Emergency Quick Edit Rule

Cloudflare Quick Edit is allowed **only for emergency hotfixes** when a production issue cannot wait for a commit.

After any Quick Edit:

1. Copy live source back into the canonical GitHub path immediately.
2. Commit with message: `sync: recover Cloudflare hotfix for <worker-name>`
3. Update DEPLOY_LOG.md.
4. Update the relevant handoff file.
5. Mark the system as reconciled.

No new feature work may begin until Quick Edit recovery is complete.

---

## Environment Variable Rule

Required env vars must be documented in the Worker README.

- Secrets must **never** be committed to GitHub.
- Public vars may be listed by name and purpose only.
- Each Worker README must include an env var table:

| Var | Secret? | Required? | Purpose | Where Set |
|-----|---------|-----------|---------|----------|
| EXAMPLE_KEY | Yes | Yes | API auth | CF Dashboard → Worker Settings |

---

## D1 / KV Binding Rule

D1 and KV bindings must be documented in both `wrangler.toml` and the Worker README.

Any D1 schema change must include:
- Migration SQL file
- Apply command
- Verification SQL
- Rollback or repair note where possible

---

## Repo Boundary Rule

For AFO:
```
afo-site                  = public site + public form Workers
agent-feed-optimization   = AFO spec, jobs, validators, engine processors
repo-copilot              = agent coordination, handoffs, bulletins, memory
```

**Rule:** Do not create a new repo unless the boundary cannot be cleanly represented inside the existing repos.

Workers that handle public URL routes live with the public site repo. Workers that run autonomously or process jobs live with the engine repo.

---

## Agent Responsibilities

### Brainstorm
- Reviews architecture and workflow decisions.
- Flags drift, naming confusion, repo-boundary problems, and missing deploy discipline.
- Produces recommendations and copy-pasteable instructions.
- Does **not** mutate repo state unless explicitly asked.
- Treats Cloudflare as runtime state, not canonical source.
- Default review question: *"Does this change preserve source-of-truth, deploy discipline, and repo boundary clarity?"*

### Alice
- Owns coordination state (handoffs, inboxes, bulletins, deploy records).
- Runs source-of-truth check at session boot before routing any work.
- Confirms GitHub source path exists before routing implementation work to Bob.
- Declares **DRIFT BLOCKER** when GitHub source is missing or stale.
- Requires source capture before any Worker modification when DRIFT is detected.
- Treats Cloudflare Quick Edit as emergency-only.
- Never considers a Worker "done" unless all five conditions are met:
  1. Source exists in GitHub
  2. Env vars are documented
  3. Route/domain is documented
  4. Deploy command is documented
  5. End-to-end test result is recorded

### Bob
- Works from GitHub source only.
- Never assumes live Cloudflare source equals GitHub source.
- If asked to modify a Worker, first inspects the canonical source path and deploy log.
- If source is missing or stale, stops and reports: **"Source reconciliation required before I can proceed."**
- Every Worker commit must include:
  - Code change
  - Updated README (env vars, bindings, route)
  - Updated DEPLOY_LOG.md
  - Deploy instruction
  - Test checklist
  - Rollback note when relevant
- Reports back to Alice with: commit SHA, deploy instructions, and test status.

---

## Drift Detection Checklist

Before modifying any live infrastructure, answer all of these:

- [ ] Does the live component have a GitHub source path?
- [ ] Does the Worker name match the source directory name?
- [ ] Does the endpoint route match the documented route in README?
- [ ] Are env vars documented?
- [ ] Are D1/KV bindings documented in wrangler.toml and README?
- [ ] Is there a DEPLOY_LOG.md?
- [ ] Is the latest deploy entry linked to a commit SHA?
- [ ] Is the handoff current?

If **any answer is no**, reconcile before feature work.

---

## Required Handoff Format for Live Infrastructure

See template: `spaces/templates/live-infra-handoff-template.md`

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-16 | Initial creation after 33-deploy drift event |
