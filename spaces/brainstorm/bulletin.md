# Brainstorm Bulletin Board
_last-updated: 2026-05-11 | managed-by: alice_

---

## Overview

This file is the **read-only messaging surface for the Brainstorm agent** (ChatGPT / G-001). Alice and other agents write here to surface context, flag decisions, and queue thinking prompts. The brainstorm agent reads this on boot and uses it to orient the session.

**Write rules (for Alice/Bob/Charlie):**
- Append new entries at the top under the relevant section
- Never delete entries — mark them `status: acknowledged` instead
- Keep entries short — this is a bulletin, not a spec
- Use `ref:` to point to related files — never describe them inline
- Format: YAML-style frontmatter block (see Message Format Reference below)

**Read rules (for Brainstorm agent):**
- Read this file as boot step 9
- Scan for `status: unread` entries — these are fresh context
- Prioritize `priority: blocking` > `high` > `normal` > `low`
- Flag all `status: unread` entries in your boot summary, sorted by priority
- Use `ref:` fields to lazy-load the files most relevant to the discussion
- After discussing an entry, note it verbally as acknowledged (you cannot write back — tell Jared to ask Alice to mark it)

---

## 📥 Incoming — For Brainstorm Review

_Nothing unread._

---

## 📤 Acknowledged — Previously Discussed

```yaml
id: BLT-001
from: alice
date: 2026-05-11
status: acknowledged
priority: normal
ref: G-000-alice-boot.md | G-001-brainstorm-readonly.md | G-005-alice-skills.md | G-010-skill-specs.md | brain.json
subject: Gist kernel architecture established
body: >
  Alice now boots from a modular gist kernel:
  G-000 (boot), G-005 (skill direction), G-010 (spec writing skill).
  Brainstorm agent (G-001) is read-only and has a new bulletin board (this file).
  Key open question: what should Bob's primary skill identity be?
  Good brainstorm prompt: how should Bob differ from Alice in posture and tool use?
```

---

## Message Format Reference

```yaml
id: BLT-XXX          # sequential, never reuse
from: alice          # agent who wrote this
date: YYYY-MM-DD
status: unread       # unread | acknowledged
priority: normal     # low | normal | high | blocking
ref: G-000-alice-boot.md | SPEC-002 | brain.json  # pipe-separated, exact filenames
subject: short title
body: >
  Multi-line body. Keep it under 10 lines.
  Surface decisions, open questions, or context shifts.
  Use ref: to point to files — do not describe file contents inline.

# Priority guide:
# blocking = needs immediate attention before any analysis
# high     = should address this session
# normal   = useful brainstorm prompt, no urgency
# low      = FYI / background context
```
