# Claude — Project Index
> Maintained by Alice. Fetch this file when Jared names a project to work on.
> Raw URL: https://raw.githubusercontent.com/nothinginfinity/repo-copilot/main/spaces/claude/project-index.md

---

## How to Use This File

1. Jared says "work on [project-name]"
2. Find the row below
3. Fetch CLAUDE-TODO link → that's your task list
4. Fetch Spec link → that's the full product detail
5. Start on Phase 1 of the TODO
6. Post status to message board when each phase is done

---

## Active Projects

| Project | Status | CLAUDE-TODO | Spec | AGENTS.md | Notes |
|---------|--------|-------------|------|-----------|-------|
| **context-links** | 🟡 In Progress | [TODO](https://raw.githubusercontent.com/nothinginfinity/context-links/main/CLAUDE-TODO.md) | [Spec](https://raw.githubusercontent.com/nothinginfinity/context-links/main/specs/context-links.spec.html) | [AGENTS](https://raw.githubusercontent.com/nothinginfinity/context-links/main/AGENTS.md) | D1 already exists: `context-links-db` (228546e2-992a-4c7f-9248-41d45aafc0f7) |
| **checkpoint-cloud** | 🟠 Queued | [TODO](https://raw.githubusercontent.com/nothinginfinity/checkpoint-cloud/main/CLAUDE-TODO.md) | [Spec](https://raw.githubusercontent.com/nothinginfinity/checkpoint-cloud/main/specs/checkpoint-cloud-jurisdiction-cron.spec.html) | [AGENTS](https://raw.githubusercontent.com/nothinginfinity/checkpoint-cloud/main/AGENTS.md) | Seed CSV + schema ready. Start with Leaflet map prototype. |
| **slop-zone** | 🟠 Queued | [TODO](https://raw.githubusercontent.com/nothinginfinity/slop-zone/main/CLAUDE-TODO.md) | [Spec](https://raw.githubusercontent.com/nothinginfinity/slop-zone/main/specs/slop-zone.spec.html) | [AGENTS](https://raw.githubusercontent.com/nothinginfinity/slop-zone/main/AGENTS.md) | Foundation app — build before slop-up and slop-talk |
| **slop-up** | 🔵 Blocked | [TODO](https://raw.githubusercontent.com/nothinginfinity/slop-up/main/CLAUDE-TODO.md) | [Spec](https://raw.githubusercontent.com/nothinginfinity/slop-up/main/specs/slop-up.spec.html) | [AGENTS](https://raw.githubusercontent.com/nothinginfinity/slop-up/main/AGENTS.md) | Depends on slop-zone routing bridge |
| **slop-talk** | 🔵 Blocked | [TODO](https://raw.githubusercontent.com/nothinginfinity/slop-talk/main/CLAUDE-TODO.md) | [Spec](https://raw.githubusercontent.com/nothinginfinity/slop-talk/main/specs/slop-talk.spec.html) | [AGENTS](https://raw.githubusercontent.com/nothinginfinity/slop-talk/main/AGENTS.md) | Depends on slop-zone artifact attachment system |
| **afo-managed-workspace** | 🟠 Queued | [TODO](https://raw.githubusercontent.com/nothinginfinity/afo-managed-workspace/main/CLAUDE-TODO.md) | [Spec](https://raw.githubusercontent.com/nothinginfinity/afo-managed-workspace/main/specs/afo-managed-workspace.spec.html) | [AGENTS](https://raw.githubusercontent.com/nothinginfinity/afo-managed-workspace/main/AGENTS.md) | Commercial product layer for AFO |

---

## Status Key

| Icon | Meaning |
|------|---------|
| 🟢 | Live / deployed |
| 🟡 | In Progress — Claude actively building |
| 🟠 | Queued — ready to start, no blockers |
| 🔵 | Blocked — depends on another project |
| ⚫ | On Hold |

---

## Project Quick-Reference

### context-links
- **What:** Smart links that carry context — AI prompts, briefs, data bundled into a shareable URL
- **Stack:** Next.js + Cloudflare Workers + D1 (`context-links-db`) + KV
- **GitHub:** https://github.com/nothinginfinity/context-links

### checkpoint-cloud
- **What:** Zip-aware DUI checkpoint pipeline for SoCal — cron ingest, D1 storage, Leaflet map
- **Stack:** Cloudflare Workers (cron + API) + D1 + R2 + Leaflet.js
- **GitHub:** https://github.com/nothinginfinity/checkpoint-cloud
- **Seed data:** https://raw.githubusercontent.com/nothinginfinity/checkpoint-cloud/main/data/checkpoint_template_v2.csv

### slop-zone
- **What:** Timed inbox for AI artifacts — every output gets a lifecycle timer
- **Stack:** Cloudflare Workers + D1 + R2 + KV (cron for expiration)
- **GitHub:** https://github.com/nothinginfinity/slop-zone

### slop-up
- **What:** Marketplace layer for slop-zone — package AI outputs for sale, license, or donation
- **Stack:** Cloudflare Workers + D1 + R2
- **GitHub:** https://github.com/nothinginfinity/slop-up
- **Dependency:** slop-zone routing bridge must exist first

### slop-talk
- **What:** Forum where threads attach slop-zone artifacts, specs, and data references
- **Stack:** Cloudflare Workers + D1 + KV
- **GitHub:** https://github.com/nothinginfinity/slop-talk
- **Dependency:** slop-zone artifact attachment system must exist first

### afo-managed-workspace
- **What:** Commercial managed workspace product for AFO clients — 3-tier pricing, provisioning pipeline
- **Stack:** Cloudflare Workers + D1 + KV
- **GitHub:** https://github.com/nothinginfinity/afo-managed-workspace

---

## Adding a New Project (Alice updates this file)

When a new repo is scaffolded, Alice adds a row to the Active Projects table above with:
- Project name + status
- Raw GitHub links to CLAUDE-TODO.md, spec, and AGENTS.md
- Brief note on dependencies or starting point
