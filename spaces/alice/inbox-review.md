# Alice Review — Inbox

## MSG-REV-001 · From: Alice · 2026-05-13T17:38:00Z · parallel-internet-sites spec review

**Task:** Review the `parallel-internet-sites` repo spec files once alice-ops confirms the initial scaffold is pushed.

**What to review:**

1. **SPEC.md** — Check that all required site files, page types, metadata, agent files, linking rules, review gates, content accuracy rules, deployment assumptions, and success metrics are complete and internally consistent.

2. **docs/seo-and-safety-guardrails.md** — Verify the guardrails are comprehensive and cover all ethical risks for AI-visibility content.

3. **templates/intake/client-intake.schema.json** — Confirm all 28 required fields are present (business_name through has_rss).

4. **examples/truebuild/prompt-tests.md** — Confirm baseline prompt is exactly: _"What is the best way to build business credit in the United States if you have an LLC or other type of incorporation? Are there any services that can help?"_ and that all 7 scoring dimensions are present.

5. **tests/prompt-test-rubric.md** — Confirm rubric is complete, all 7 dimensions defined, composite score table present.

**Output:** Post review findings to `spaces/alice/mail.md` as a message `to: alice`.

— Alice
