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

The 62KB `index.html` needs a deployment rail. This is also a live proof-of-concept that gitzip-push works for real HTML app artifacts. It should use the hardened Commit 2 manifest format:

```json
{
  "version": "1",
  "artifactType": "staticApp",
  "targetBranch": "main",
  "commitMessage": "deploy: repo-copilot app update",
  "files": [
    { "src": "index.html", "dest": "index.html", "sha256": "...", "size": 63488 }
  ]
}
```

This proves the transport. It also makes repo-copilot a self-hosting reference implementation.

**Turn 3 — Seed `.hcp/` manifests across 3–5 core repos**

The brainstorm files (especially `A-repo-native-human-memory-system.md`) are very clear: HCP is the missing bridge. Without it, every repo is isolated. With it, brainstorms, apps, templates, and capabilities can route between repos.

Start with these five:
- `gitzip-push` (role: deployment rail)
- `repo-copilot` (role: context app)
- `studio-brainstorm` (role: human context hub)
- `m-mcp` (role: multiplayer runtime)
- `drivemind` (role: local file context app)

Minimum `.hcp/` folder per repo:
```
.hcp/
  repo.json         ← identity, role, status
  purpose.md        ← human-readable intent
  capabilities.json ← what this repo can do
  brainstorm-links.json ← origin conversation references
```

This is not a big build. It's a seeding operation. Five manifests, then a `registry/repos.json` in `studio-brainstorm` that knows all five.

**Turn 4 — ContextFrames MVP (`context-frame-player.js`)**

The HyperFrames brainstorm is the clearest architecture reference in the file set. The player runtime is ~20 lines:

```js
window.ContextFrame = {
  input: null,
  emit(type, payload) {
    window.parent?.postMessage({ source: 'context-frame', type, payload }, '*');
  },
  onMessage(type, handler) {
    window.addEventListener('message', event => {
      if (event.data?.type === type) handler(event.data.payload);
    });
  }
};
```

Pair it with one example frame (`repo-match-card.html`) and a minimal schema (`context-frame.schema.json`). That's the ContextFrames MVP. It proves the HTML-native artifact pattern before M-MCP Rooms need to run them.

---

### What to defer

- **M-MCP Rooms** — don't touch until ContextFrames can generate frames and gitzip-push can deploy them safely.
- **Commerce Context Meshes** — these are the application layer on top of a working room runtime. They come last.
- **npx CLI for gitzip or contextframes** — useful eventually, but not foundation work.

---

### Summary Sequence

| Turn | What | Why |
|------|------|-----|
| 1 | Harden gitzip-push (path safety, SHA-256, dry-run, PAT warning) | Unsafe primitive blocks everything downstream |
| 2 | Add `.gitzip` self-deployment workflow to repo-copilot | Live proof-of-concept + self-hosting reference |
| 3 | Seed `.hcp/` manifests in 5 core repos + registry | Bridge layer that connects the constellation |
| 4 | ContextFrames MVP (player runtime + one example frame) | Proves HTML-native artifact pattern before rooms |

That's the foundation. Once those four are solid, M-MCP Rooms have a deployment rail, a manifest standard, and a frame format to run. Commerce Meshes have a runtime to sit on top of.

Let me know if you want me to start on Turn 1 (gitzip-push hardening spec or direct commit).

— Alice
