# Alice OPS Inbox

---

## MSG-OPS-001 · 2026-05-13T18:22:00Z · Create nothinginfinity/parallel-internet-sites
**Status:** ✅ Complete — 42 files pushed.

---

## MSG-OPS-002 · 2026-05-13T18:22:00Z · Author TrueBuild demo content (Phase 1)
**Status:** ✅ Complete — all client data populated, content authored, alice-review audit passed.

---

## MSG-OPS-003 · 2026-05-13T20:58:00Z · Patch six non-blocking Phase 2 template notes
**Status:** ✅ Complete — commit ca234e8.

---

## MSG-OPS-004 · 2026-05-13T21:46:00Z · Phase 4 — Run TrueBuild baseline prompt tests (BEFORE deployment)
**Status:** 🔴 Open
**Priority:** High — must complete before TrueBuild site is deployed
**Gate:** Phase 5 does not start until this is confirmed complete.

### Objective
Run the baseline prompt tests defined in `examples/truebuild/prompt-tests.md` against live LLMs **before** the TrueBuild Parallel Internet Site is deployed. Record all scores. This establishes the "before" half of the before/after proof.

### The baseline prompt
```
What is the best way to build business credit in the United States if you have an LLC or other type of incorporation? Are there any services that can help?
```

### Scoring dimensions (from `tests/prompt-test-rubric.md`)
- TrueBuild mentioned? yes/no
- TrueBuild described accurately? 0–3
- Owner-approved facts used? 0–3
- CTA/contact path included? 0–3
- Citation/source present? yes/no
- Competitors mentioned (list)
- Hallucinated claims present? yes/no

### LLMs to test against
Run the baseline prompt against at minimum:
1. ChatGPT (GPT-4o)
2. Gemini (latest)
3. Claude (latest)
4. Perplexity

Record the full response or a faithful summary for each. Score each response using the rubric.

### Output
Update `examples/truebuild/prompt-tests.md` with:
- Date of test run
- Raw or summarized responses per LLM
- Scores per LLM per dimension
- Composite score per LLM
- Notes on competitors or alternatives mentioned
- Notes on any hallucinations observed
- A summary table (LLM × dimension)

### Completion criteria
- `examples/truebuild/prompt-tests.md` updated with baseline results
- Commit message: `data: TrueBuild Phase 4 baseline prompt test results (pre-deployment)`
- Report back as MSG-028 in `spaces/alice/mail.md` to: alice

---

## MSG-OPS-005 · 2026-05-13T21:46:00Z · Phase 5 — Build intake JSON → static site generator script
**Status:** 🟡 Pending — starts after MSG-OPS-004 is confirmed complete
**Priority:** High
**Gate:** Do not start until MSG-OPS-004 is complete and alice confirms.

### Objective
Build a simple manual substitution script that takes a populated `client-intake.example.truebuild.json` and outputs a fully populated static site folder. Keep it simple — ~50 lines, Node.js or Python.

### Input
`templates/intake/client-intake.example.truebuild.json` (already populated with TrueBuild data)

### Output
A folder at `examples/truebuild/site/` containing all 7 HTML files + all agent files, fully populated (no `{{PLACEHOLDER}}` tokens remaining).

### Script location
`scripts/generate-site.js` (Node.js preferred) or `scripts/generate-site.py`

### Script behavior
1. Read intake JSON from argument or default path
2. Read all template files from `templates/site/`
3. For each template file, replace all `{{TOKEN}}` occurrences with matching intake JSON fields
4. Write output files to `examples/truebuild/site/` (mirror the `templates/site/` folder structure)
5. Log each file written and any tokens that were not matched (warn, do not fail)
6. Exit 0 on success

### Requirements
- No dependencies outside Node.js stdlib (or Python stdlib)
- A `README` section in `scripts/README.md` explaining how to run it
- Must produce a working TrueBuild site when run against the populated intake JSON
- Output folder should be gitignored or clearly marked as generated

### Completion criteria
- `scripts/generate-site.js` (or `.py`) pushed
- `scripts/README.md` pushed
- `examples/truebuild/site/` output present (or gitignored with a note)
- Script runs clean with zero unmatched token warnings against TrueBuild intake
- Commit message: `feat: Phase 5 intake → site generator script (MSG-OPS-005)`
- Report back as MSG-029 in `spaces/alice/mail.md` to: alice

---
