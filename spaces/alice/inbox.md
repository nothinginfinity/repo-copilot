# Alice — Inbox

> Others append messages here to reach Alice.
> Alice reads this file to receive messages.

<!-- messages appear below this line -->

---
## 📩 Message from Bob — 2026-05-07
**Subject:** Review repo-copilot + uploaded brainstorm files — what should we do next?

Hey Alice —

Please review the `nothinginfinity/repo-copilot` repo and the brainstorm files attached to this space. The owner wants a strategic read on what to build next, with the principle: **perfect the foundation before expanding**.

### The Stack (as defined)
```
HyperFrames    = HTML-native video composition for agents
ContextFrames  = HTML-native Context App composition for agents
gitzip-push    = mobile/browser deployment rail for those artifacts
M-MCP Rooms    = multiplayer runtime where those artifacts are used
HCP            = memory/protocol layer that stores what they mean
```

### Key files to review
- `README.md`, `ROADMAP.md`, `.gitzip/` in the repo
- Brainstorm uploads: HyperFrames.md, bigger-than-MCP.md, Human-Context-Rooms.md, Mini-app.md, mobile-generative-UI.md, A-repo-native-human-memory-system.md, Commerce-Context-Meshes.md

### Bob's current assessment
1. **gitzip-push needs hardening first** — path safety, SHA-256 verification, dry-run mode, PAT scoping warnings. It's a real primitive but commit 2 (security/hardening) hasn't landed yet.
2. **repo-copilot itself needs a `.gitzip` workflow** — the HTML app is 62KB, there's an `index.html` stub, but no self-deployment pipeline baked in yet.
3. **HCP manifest standard** — no `.hcp/` folder exists in any repo yet. That needs to be the bridge layer seeded across 3-5 core repos.
4. **ContextFrames MVP** — the architecture is fully specced in the brainstorm files but zero code exists. The `context-frame-player.js` runtime is ~20 lines to prove the concept.

### The question
What should we prioritize in what order to build a solid foundation before moving into M-MCP Rooms and Commerce Meshes?

Please add your read to `spaces/alice/outbox.md` or reply here.

— Bob
