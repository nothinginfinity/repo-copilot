# Spec: Email-for-AI — Sub-Inbox Routing System
**cid:** alice/c-spec-001/jared
**date:** 2026-05-10
**status:** ready

---

## Goal

Extend the Alice inbox system to route messages to per-sub-agent sub-inboxes automatically via a `to:` header field, so alice-ops and alice-review each boot with only their own messages — keeping all inboxes light, ordered, and slop-free — without adding any new workflow files or routing logic inside gists.

---

## Background

Currently all messages land flat in `spaces/alice/inbox.md`. Sub-agents (alice-ops, alice-review) read the full inbox and must mentally filter. As message volume grows this creates noise and wastes token budget on irrelevant context.

The fix: add a `to:` header to every message. `unzip-and-route.yml` already runs on every turn-bundle push — add one routing step that splits messages into sub-inbox files by recipient. The master `inbox.md` remains the fallback for anything unrouted.

Mental model: Gmail folders. One "email address" (`spaces/alice/`), multiple folders (sub-inbox files), automatic routing by label/header, master inbox as catch-all.

---

## Inputs

- Current `spaces/alice/inbox.md` — existing messages, structure, and format
- Current `.github/workflows/unzip-and-route.yml` — existing routing Action
- `spaces/gists/G-000-alice-ops-boot.md` — to update startup sequence (inbox path)
- `spaces/gists/G-000-alice-review-boot.md` — to update startup sequence (inbox path)
- `spaces/gists/G-000-alice-boot.md` — to update inbox section noting sub-inbox structure

---

## Outputs

| File | Action | Notes |
|------|--------|-------|
| `spaces/alice/inbox-ops.md` | **Create** | Sub-inbox for alice-ops — auto-routed messages only |
| `spaces/alice/inbox-review.md` | **Create** | Sub-inbox for alice-review — auto-routed messages only |
| `.github/workflows/unzip-and-route.yml` | **Update** | Add routing step: parse `to:` header → append to correct sub-inbox |
| `spaces/gists/G-000-alice-ops-boot.md` | **Update** | Startup call 3: change inbox path to `spaces/alice/inbox-ops.md` |
| `spaces/gists/G-000-alice-review-boot.md` | **Update** | Startup call 3: change inbox path to `spaces/alice/inbox-review.md` |
| `spaces/gists/G-000-alice-boot.md` | **Update** | Add inbox structure note in Section 5 (Inbox Architecture) |

---

## Message Format — `to:` Header

All agents writing to Alice's inbox must include a `to:` field immediately after the message date line. Example:

```markdown
## 📩 Message from Bob — 2026-05-10
**to:** alice-ops
**Subject:** Push SPEC-001 outputs to main
**cid:** bob/c12/jared
```

Valid `to:` values:

| Value | Routes to |
|-------|----------|
| `alice` | `spaces/alice/inbox.md` (default / principal) |
| `alice-ops` | `spaces/alice/inbox-ops.md` |
| `alice-review` | `spaces/alice/inbox-review.md` |
| *(missing / blank)* | `spaces/alice/inbox.md` (graceful fallback) |

---

## Routing Logic — unzip-and-route.yml Addition

Add the following step **after** the existing inbox-append step, **before** the brain-note step:

```yaml
- name: Route inbox messages by to: header
  run: |
    python3 - <<'EOF'
    import re, os

    INBOX = "spaces/alice/inbox.md"
    ROUTES = {
        "alice-ops": "spaces/alice/inbox-ops.md",
        "alice-review": "spaces/alice/inbox-review.md",
    }

    with open(INBOX, "r") as f:
        content = f.read()

    # Split into individual messages (each starts with ## 📩)
    messages = re.split(r'(?=^## 📩)', content, flags=re.MULTILINE)
    master_messages = []

    for msg in messages:
        to_match = re.search(r'\*\*to:\*\*\s*(\S+)', msg)
        recipient = to_match.group(1).strip() if to_match else "alice"

        if recipient in ROUTES:
            target = ROUTES[recipient]
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "a") as f:
                f.write(msg)
        else:
            master_messages.append(msg)

    # Rewrite master inbox with only unrouted messages
    header = "# Alice — Inbox\n\n> Messages not addressed to a sub-agent land here.\n> Alice reads this file for unrouted tasks.\n\n<!-- messages appear below this line -->\n\n---\n"
    with open(INBOX, "w") as f:
        f.write(header + "".join(master_messages))
    EOF
```

**Important:** This step rewrites `inbox.md` to remove routed messages after routing. This keeps the master inbox clean over time. Routed messages live permanently in their sub-inbox files.

---

## Sub-Inbox File Structure

Each sub-inbox file follows the same format as `inbox.md`:

```markdown
# Alice Ops — Inbox

> Auto-routed messages addressed to: alice-ops
> alice-ops reads this file at startup instead of spaces/alice/inbox.md

<!-- messages appear below this line -->

---
```

---

## Boot Gist Updates

### G-000-alice-ops-boot.md — Startup Sequence (Section 6, Call 3)

Change:
```
| 3 | spaces/alice/inbox.md | Pending ops tasks |
```
To:
```
| 3 | spaces/alice/inbox-ops.md | Pending ops tasks (auto-routed) |
```

### G-000-alice-review-boot.md — Startup Sequence (Section 6, Call 3)

Change:
```
| 3 | spaces/alice/inbox.md | Pending review tasks |
```
To:
```
| 3 | spaces/alice/inbox-review.md | Pending review tasks (auto-routed) |
```

### G-000-alice-boot.md — Add Inbox Architecture note (Section 5)

Add after the startup table:
```markdown
### Inbox Architecture

| File | Reader | Receives |
|------|--------|----------|
| `spaces/alice/inbox.md` | Alice (principal) | Unrouted messages, `to: alice` or no `to:` field |
| `spaces/alice/inbox-ops.md` | alice-ops | Messages with `to: alice-ops` |
| `spaces/alice/inbox-review.md` | alice-review | Messages with `to: alice-review` |

Routing is automatic via `unzip-and-route.yml`. Never manually edit sub-inbox files.
```

---

## Acceptance Criteria

- [ ] `spaces/alice/inbox-ops.md` exists with correct header
- [ ] `spaces/alice/inbox-review.md` exists with correct header
- [ ] `unzip-and-route.yml` routing step added and syntactically valid
- [ ] A test message with `to: alice-ops` pushed via turn bundle lands in `inbox-ops.md` and NOT in `inbox.md`
- [ ] A message with no `to:` field stays in `inbox.md` (graceful fallback confirmed)
- [ ] `G-000-alice-ops-boot.md` startup call 3 updated to `inbox-ops.md`
- [ ] `G-000-alice-review-boot.md` startup call 3 updated to `inbox-review.md`
- [ ] `G-000-alice-boot.md` inbox architecture table added
- [ ] No new workflow files created — routing lives entirely within existing `unzip-and-route.yml`
- [ ] Master `inbox.md` contains only unrouted messages after a routing run

---

## Anti-Bloat Rules (Non-Negotiable)

- `inbox.md` stays master — never removed, always fallback for unrouted messages
- Sub-inboxes are append-only from the Action — agents read, Action writes, nothing else
- No routing logic inside any gist file — routing lives in the Action only
- Missing `to:` field always falls back to `inbox.md` — nothing gets lost
- Do not create sub-inboxes for Bob or Charlie yet — extend the pattern only when their volume justifies it

---

## Execution Order (Alice's Turn Plan)

| Turn | Action |
|------|--------|
| 1 | Create `inbox-ops.md` + `inbox-review.md` with correct headers; read current SHA of `unzip-and-route.yml` |
| 2 | Update `unzip-and-route.yml` with routing step; update `G-000-alice-ops-boot.md` + `G-000-alice-review-boot.md` inbox paths |
| 3 | Update `G-000-alice-boot.md` with inbox architecture table; push turn-bundle; confirm all acceptance criteria |

---

## Notes

- **Notion extension (optional, not required for v1):** The routing step could also queue a Notion op to log each routed message to a "Inbox Log" DB with columns: `From`, `To`, `Subject`, `cid`, `Date`. Adds observability. Implement in v2 if volume justifies it.
- **Future sub-agents:** When bob-ops or charlie-deploy volume grows, extend by adding entries to the `ROUTES` dict in the Python step and creating the corresponding sub-inbox file. No other changes needed.
- **Bob/Charlie parallel:** Bob and Charlie inboxes could adopt the same pattern (`inbox-spec.md`, `inbox-qa.md` for Bob; `inbox-deploy.md`, `inbox-market.md` for Charlie) once the Alice pattern is validated.

---

## Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-10 | v1.0 — initial spec | Alice (alice/c-spec-001/jared) |
