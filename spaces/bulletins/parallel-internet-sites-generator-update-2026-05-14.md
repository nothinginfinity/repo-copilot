# Bulletin BLT-016 — Generator Update: Multi-Client Reusable
**For:** Jared + Brainstorm review
**Date:** 2026-05-14
**Prepared by:** Alice
**Supersedes:** BLT-015 (marked read — archived)
**Repo:** https://github.com/nothinginfinity/parallel-internet-sites

---

## What Changed Since BLT-015

BLT-015 closed with a yellow-green status: technically ready, not public-launch ready. One architectural pivot was made before deployment planning proceeds.

**The generator script (`scripts/generate-site.js`) is now multi-client reusable.**

Previously, the output path was hardcoded to `examples/truebuild/site`. TrueBuild was the only possible output target. That has been patched.

---

## The Change

### Before
```bash
node scripts/generate-site.js
# Always output to: examples/truebuild/site
# No way to generate for any other client
```

### After
```bash
node scripts/generate-site.js [intake-json-path] [output-folder]

# TrueBuild (default — unchanged)
node scripts/generate-site.js

# Nothing Infinity / AFO (new)
node scripts/generate-site.js templates/intake/client-intake.example.afo.json examples/afo/site

# Any future client
node scripts/generate-site.js templates/intake/client-intake.example.acme.json examples/acme/site
```

Both arguments are optional. Default behavior is unchanged for TrueBuild.

---

## Files Delivered

| File | Type | What changed |
|---|---|---|
| `scripts/generate-site.js` | Patched | `argv[2]` = intake path, `argv[3]` = output folder. All stub fallbacks are now generic — no TrueBuild-specific text in the logic layer. Hard exit with clear error if intake JSON is missing or invalid. |
| `scripts/README.md` | Updated | Three usage examples documented: TrueBuild, AFO, and generic new-client pattern. Token map fully documented. |
| `templates/intake/client-intake.example.afo.json` | New | Fully populated intake for Nothing Infinity — the agency’s own Parallel Internet Site. Services: AFO install, Parallel Internet Site deployment, AI visibility audit, prompt-test monitoring, agent-first content strategy, LLM entity profile setup. |
| `examples/afo/README.md` | New | Documents the AFO example, how to generate it, and side-by-side comparison with TrueBuild example. |

---

## Why This Matters

### Before this change
TrueBuild was the only example, and the generator script was coupled to it. To use this for a second client, someone would have had to manually edit the script.

### After this change
Adding client #3, #4, or #10 requires:
1. Fill in `templates/intake/client-intake.example.[client].json`
2. Run one command: `node scripts/generate-site.js [intake] [output]`
3. Follow `docs/deployment-pack-v1.md`

That’s the full workflow. No script edits. No hardcoded changes.

### The AFO intake is also a product demo
`client-intake.example.afo.json` is populated with Nothing Infinity’s own services. This means the repo now demonstrates the product both *with* (TrueBuild) and *about* (AFO/Nothing Infinity) itself. Two distinct industries, two distinct use cases, same template and script.

---

## Current State of the Repo

### What’s complete

| Component | Status | Notes |
|---|---|---|
| Repo scaffold (42 files) | ✅ Done | Full spec, templates, schemas, examples, tests |
| TrueBuild intake (28 fields) | ✅ Done | All fields populated |
| AFO / Nothing Infinity intake | ✅ Done | New — added this update |
| Static site template (7 HTML) | ✅ Done | All pages + JSON-LD, 53 tokens |
| AFO integration (Phase 3) | ✅ Done | Cross-domain rules, agent-reconciliation.md |
| Baseline prompt tests (Phase 4) | ✅ Done | TrueBuild: 2/50 pre-deployment |
| Generator script (Phase 5) | ✅ Done | Multi-client as of this update |
| Deployment Pack v1 | ⚠️ In progress | alice-ops MSG-OPS-006 — not yet complete |
| comparisons.html review | ⚠️ In progress | alice-review MSG-REV-004 — not yet complete |

### What’s still open (same 3 hard gates from BLT-015)
1. `ai.truebuild.com` DNS — not yet created
2. Form action URL for `contact.html` — not yet resolved
3. Jared / client content approval on rendered pages

---

## Questions for Brainstorm

These replace the 6 questions from BLT-015. Questions 1–5 are resolved or held. This update introduces two new ones.

### Question 1 — AFO intake accuracy
`client-intake.example.afo.json` was authored based on known Nothing Infinity services. **Does Brainstorm want to review and approve this intake before the AFO demo site is generated and deployed to `ai.nothinginfinity.com`?**

This is the same content gate that applies to TrueBuild. The agency’s own Parallel Site should go through the same approval process as a client’s.

### Question 2 — Sequencing: TrueBuild first or AFO first?
Two complete examples now exist. Deployment could go:
- **TrueBuild first** — close the 3 hard gates, deploy as planned, use as the client proof
- **AFO first** — deploy `ai.nothinginfinity.com` first as the agency demo, then TrueBuild
- **Both simultaneously** — both go live at the same time as paired demos

**Does Brainstorm have a preference on sequencing?** The technical answer is either is ready; this is a product positioning call.

---

## Recommended Review for Brainstorm

1. Review `scripts/README.md` — does the multi-client workflow make sense as described?
2. Review `templates/intake/client-intake.example.afo.json` — is the Nothing Infinity positioning accurate and approvable?
3. Answer Question 1 (AFO intake approval gate) and Question 2 (deployment sequencing)
4. Confirm BLT-015 decisions still hold (they do — this update adds to them, does not change them)

---

*Bulletin prepared by Alice — 2026-05-14T07:10:00Z*
*File: `spaces/bulletins/parallel-internet-sites-generator-update-2026-05-14.md`*
*Ref: BLT-016*
