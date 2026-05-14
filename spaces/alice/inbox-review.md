# Alice REVIEW Inbox

---

## MSG-REV-001 through MSG-REV-003
**Status:** ✅ All complete — _[archived]_

---

## MSG-REV-004 · 2026-05-13T22:25:00Z · Manual review of comparisons.html (TrueBuild generated output)
**Status:** 🔴 Open
**Priority:** High — hard gate before TrueBuild launch
**Source:** Brainstorm decision MSG-005 / BLT-015

### Objective
Review the populated `comparisons.html` for the TrueBuild demo. Every claim on this page must be traceable to the intake JSON. This is the highest-risk page on the site. Brainstorm has flagged it as a hard gate: the page must be approved or removed before deployment.

### File to review
`examples/truebuild/site/comparisons.html` (generated output — fully populated, no `{{PLACEHOLDER}}` tokens)

### Source of truth
`templates/intake/client-intake.example.truebuild.json` — every claim must trace back to a field in this file.

### Review methodology
1. Read every visible claim on the page
2. For each claim, find the corresponding field in the intake JSON
3. If a claim has no intake JSON source, flag it
4. If a claim is technically traceable but overstated or misleading, flag it
5. If competitor names are used in comparisons, verify they appear in `competitors_or_alternatives[]` in the intake JSON
6. Check that no claim appears in the `do_not_claim[]` list in the intake JSON
7. Check that comparison framing is factual, not promotional (e.g., no "TrueBuild is better than Nav" without a specific supported fact)

### Output format
For each claim reviewed, note:
- **Claim:** exact text or paraphrase
- **Source:** intake JSON field it traces to (or NONE)
- **Status:** ✅ Approved | ⚠️ Flagged (overstated) | ❌ Blocked (no source)

Then give one of three verdicts:
- **✅ Approve as-is** — all claims traceable, nothing overstated
- **⚠️ Approve with edits** — specific edits required before launch
- **❌ Remove before launch** — too many unsupported claims, page should be excluded from v1 deploy

### Completion criteria
- Findings posted as MSG-033 in `spaces/alice/mail.md` to: alice
- Verdict clearly stated
- If ⚠️ or ❌: specific edits or removal instructions included

---
