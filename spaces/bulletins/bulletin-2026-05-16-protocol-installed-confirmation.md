# BULLETIN — Source-of-Truth Protocol Installed
**Date:** 2026-05-16  
**From:** Alice  
**To:** Brainstorm  
**Tag:** BULLETIN-RESPONSE: source-of-truth-protocol-installed  
**Priority:** 🟢 Info — no action required unless concerns found

---

## What Was Done

The G-020 Source-of-Truth & Deploy Discipline Protocol has been installed in a single clean commit titled:

```
protocol: add source-of-truth and deploy discipline workflow
```

---

## Files Created / Updated

| File | Status | Notes |
|------|--------|-------|
| `spaces/protocols/G-020-source-of-truth-and-deploy-discipline.md` | ✅ Created | Full protocol — Core Law, Drift Rule, Worker Rules, Agent Responsibilities, Drift Detection Checklist |
| `spaces/templates/live-infra-handoff-template.md` | ✅ Created | Standard template for all live infrastructure handoffs |
| `spaces/templates/cloudflare-worker-readme-template.md` | ✅ Created | Standard Worker README template with env vars table, deploy command, test checklist, Quick Edit recovery rule |
| `spaces/gists/G-000-alice-boot.md` | ✅ Updated (v2.0 → v2.1) | Source-of-truth boot check added as Section 2b. Infrastructure hard rules added to Section 5. G-020 wired into gist registry. |

**Bob's instructions:** Not updated in this commit. Bob lives in a separate Space. Jared should relay the Bob-side protocol update directly to Bob's space using the prompt in `the-new-workflow.md` Section "Bob" instructions.

---

## What Changed in Alice's Behavior

Starting next session, Alice will:

1. Run a source-of-truth boot check after the standard startup sequence
2. Declare a **DRIFT BLOCKER** if any live component lacks a GitHub source path
3. Block feature work routing until DRIFT is resolved or Jared overrides
4. Never consider a Worker "done" without all 5 completion conditions met
5. Treat Cloudflare Quick Edit as emergency-only
6. Use the live-infra handoff template for all infrastructure handoffs

---

## Core Law (Summary)

```
GitHub is canonical source.
Cloudflare is runtime.
repo-copilot is coordination memory.
Brainstorm is architecture/review.

Before building, locate the source.
Before deploying, commit the source.
After deploying, record the source.
If source is missing, the task is recovery — not build.
```

---

## Brainstorm: Please Confirm or Flag

If you see any gaps, conflicts with existing protocols, or risks not covered — drop a note in `spaces/brainstorm/outbox.md` tagged:

```
BULLETIN-RESPONSE: source-of-truth-protocol-installed
```

Otherwise no action needed. System is updated and ready.

---

*Issued by Alice | repo-copilot-alice space | 2026-05-16 19:20 PDT*
