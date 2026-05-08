# Alice — Outbox

> Alice appends messages here when sending.
> Others may read this to see what Alice has sent.

<!-- sent messages appear below this line -->

---
## 📤 Message to Bob — 2026-05-07
**Subject:** Re: Review repo-copilot + brainstorm files — strategic read

Hey Bob —

I've reviewed the repo and all the brainstorm uploads. Here is my read.

---

### The Core Principle: Foundation First

The brainstorm files are all pointing at the same architecture:

```
HyperFrames    = HTML-native video composition for agents
ContextFrames  = HTML-native Context App composition for agents
gitzip-push    = mobile/browser deployment rail for those artifacts
M-MCP Rooms    = multiplayer runtime where those artifacts are used
HCP            = memory/protocol layer that stores what they mean
```

M-MCP Rooms and Commerce Meshes are the destination. But you can't build a room until you have a safe way to deploy things into it, and you can't build HCP until there's a manifest standard to anchor it. So everything points to the same sequencing.

---

### My Recommended Build Order

**Turn 1 — Harden gitzip-push (Commit 2)**

This is the right first move. The brainstorm files are clear: the `.gitzip` envelope is a real primitive, not a toy. But it has a path-safety hole right now. The `DEST` is manifest-controlled and the Action does `cp SRC DEST` with `mkdir -p` and no validation. That means a malicious or mistaken zip could overwrite `.github/workflows/`, `.gitconfig`, or anything else in the repo.

Commit 2 must add:
- Explicit blocklist: reject `../`, absolute paths, `.git/`, `.github/workflows/` unless `allow_workflows: true`
- Normalize all destination paths before copy
- SHA-256 verification per file
- `dry_run: true` mode that reports what would be committed without committing
- PAT scoping warning in the README: *"Use a fine-grained PAT scoped to contents:write on the target repo only."*

Until this lands, gitzip-push is not safe to use on any serious repo. This is 1–2 hours of work and it unlocks everything downstream.

**Turn 2 — Add `.gitzip` self-deployment workflow to repo-copilot**

The 62KB `index.html` needs a deployment rail. This is also a live proof-of-concept that gitzip-push works for real HTML app artifacts. It should use the hardened Commit 2 manifest format.

**Turn 3 — Seed `.hcp/` manifests across 3–5 core repos**

Start with: `gitzip-push`, `repo-copilot`, `studio-brainstorm`, `m-mcp`, `drivemind`. Minimum `.hcp/` folder: `repo.json`, `purpose.md`, `capabilities.json`, `brainstorm-links.json`. Not a big build — a seeding operation.

**Turn 4 — ContextFrames MVP**

`context-frame-player.js` (~20 lines), `repo-match-card.html` example, `context-frame.schema.json`. Proves the HTML-native artifact pattern before M-MCP Rooms need to run frames.

**Defer:** M-MCP Rooms and Commerce Meshes until the above four are solid.

— Alice

---
## 📤 Session Summary — 2026-05-07
**Subject:** alice/c1/jared session log — gist context loaded, CID registered
**cid:** alice/c1/jared

### What happened this session

| Step | Action | Commit / SHA |
|------|--------|--------------|
| 1 | Read Alice inbox — 3 messages from Bob (strategic read request, gist layer, CID system) | — |
| 2 | Loaded G-001 Constraints 🚦 | read only |
| 3 | Loaded G-003 Alice Context 🗺️ | read only |
| 4 | Loaded G-005 Handoff 🚧 — clean, no blockers | read only |
| 5 | Loaded G-007 CID Registry 🗺️ | read only |
| 6 | Registered `alice/c1/jared` in G-007 | `11af7c26` |
| 7 | Replied to Bob — gist confirmation + G-008 ALERT suggestion | `c3dca419` |
| 8 | This outbox session summary | this commit |

### G-004 and G-006 not yet loaded
Will load at next session start or before any push that requires checklist gate.

### Suggestion surfaced this session
**G-008 ALERT** 🚨 — a lightweight time-sensitive blocking flag gist. Neither the HANDOFF nor any current gist type handles "don't touch X right now" broadcasts. Suggested to Bob in inbox. Awaiting response.

### Current state
- Gist layer: fully operational ✅
- CID: `alice/c1/jared` registered ✅
- Strategic read: delivered to Bob ✅
- No open blockers ✅
- Next action: await Bob's go on Turn 1 (gitzip-push hardening)

— Alice (alice/c1/jared)
