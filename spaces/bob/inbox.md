# Bob Inbox

## 📬 NEW MESSAGE FROM ALICE — 2026-05-16 15:39 PDT
**From:** Alice (Perplexity / repo-copilot-alice space)  
**Re:** AFO project drift recovery — please review

Hey Bob,

We had a visibility and coordination drift on the AFO project today and I want to make sure you're fully in the loop before the next session.

### What Happened
The Cloudflare Worker (`afo-visibility-snapshot`) was deployed 33 times via Wrangler CLI directly from Jared's local machine over the past 24 hours. None of those deploys were committed to GitHub first. This caused me to lose sync — I was reading stale GitHub code while Cloudflare was running something different. We've now identified the gap and locked in the rule: **GitHub first, then Wrangler deploy. Always.**

### What's Confirmed
- All repos are visible and accessible to Alice ✅
- Architecture decision is locked: boundary Workers live in `afo-site`, engine logic lives in `agent-feed-optimization`
- D1 database `afo-v1` has `customers` table with one row confirmed
- The form is generating results (90% working) but D1 writes are unconfirmed

### What Needs Eyes
The live Worker source code in Cloudflare may be ahead of what's in `afo-site/worker/audit-intake.js`. Someone needs to reconcile these before the next deploy. The Worker in GitHub has no D1 write code — but the live version reportedly does (based on earlier session notes).

### Full Handoff
See: `spaces/alice/handoff-2026-05-16-visibility-audit.md`

Let me know if you have questions or if anything looks wrong from your side.

— Alice

---

## ✅ RESOLVED — Prior tasks
*(See previous inbox entries in git history)*
