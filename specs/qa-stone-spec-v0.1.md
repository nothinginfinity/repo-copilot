# QA.Stone Specification v0.1

> **Quick Audit Stone** — a composite artifact standard for agent-native software infrastructure.
> Author: Jared Edwards · Alice (alice/c1/jared) · 2026-05-07

---

## Overview

A QA.Stone is not a single file or a single repository. It is a **composite artifact** assembled from three distinct infrastructure primitives — each contributing a different dimension of the Stone's structure, semantics, and connectivity.

The name derives from its dual meaning:
- **Quick** — instantly addressable, fetchable, and injectable into any agent context
- **Audit** — content-addressed, versioned, and traceable back to its origin conversation and human author

The visual metaphor is a 3D Cantor lattice with stochastic diagonal escapes: the repo provides the ordered lattice structure, the context/data layer provides the encoded payload, and the gist provides the wormholes — cross-links that connect nodes in the lattice non-hierarchically.

---

## The Three Primitives

### 1. Repository — The Lattice

A GitHub repository is the **structured, versioned, self-similar grid** of the Stone. It provides:

- Commit history (full audit trail)
- Branch structure (parallel reasoning paths)
- File hierarchy (organized capability tree)
- GitHub Actions (executable behavior triggered by events)
- Access control (collaborators, visibility, branch protection)

The repo is the **body** of the Stone. It is ordered, recursive, and deterministic. Everything in it follows the commit graph.

### 2. Gist — The Wormhole / Stochastic Diagonal Escape

A GitHub Gist is the **cross-repo, user-owned, non-hierarchical connector**. It provides:

- A stable `raw_url` accessible from any repo, any agent, any tool — without repo membership
- Its own git history (`git_pull_url`) — versioned independently of any repo
- Up to 10MB per file, up to 300 files per gist
- No PR overhead, no branch dependency, no repo coupling
- User ownership (not repo ownership) — it belongs to Jared, not to any single project

In graph theory terms, gists are **cross-edges**: they connect nodes in the lattice that have no formal dependency relationship. They are stochastic because the set of consumers is not known at creation time — any repo or agent can traverse the wormhole.

This is the missing primitive that completes the QA.Stone structure. The repo provides the lattice; the gist provides the escape hatch.

**Size reference:**

| File size | API behavior |
|-----------|--------------|
| Up to 1 MB | Full content via API |
| 1 MB – 10 MB | Fetch via `raw_url` |
| Over 10 MB | Clone via `git_pull_url` |
| Up to 300 files | Per gist |

### 3. Context / Data — The Payload

The context layer is the **semantic meaning** encoded inside the Stone. It provides:

- **HCP manifests** (`.hcp/repo.json`, `purpose.md`, `capabilities.json`) — what the repo is and what it can do
- **Session gists** (G-001 through G-007+) — agent orientation, constraints, handoff state
- **Identity profile** (`jared-identity.json`) — who the human author is, their preferences, their working style
- **Conversation archives** — prior reasoning sessions stored as addressable artifacts
- **Skill definitions** — MCP tool specs, agent capability schemas, prompt templates

Context/data is the **glow channel** of the Stone — the encoded signal that tells consumers what the artifact means and how to use it.

---

## The QA.Stone Manifest

Every QA.Stone is described by a manifest file: `qa.stone.json`. This file ties all three primitives together into a single addressable, self-describing artifact.

### Schema

```json
{
  "version": "0.1",
  "stone_id": "<8-char hex>",
  "border_hash": "<16-char hex — SHA-256 of canonical fields>",
  "type": "CONTEXT | SKILL | IDENTITY | FRAME | GOLDSTONE | ALERT",
  "glow_channel": "<dot-notation semantic tag>",
  "rarity": "COMMON | UNCOMMON | RARE | GOLDSTONE",
  "depth": 0,

  "repo": {
    "owner": "<github-username>",
    "name": "<repo-name>",
    "branch": "main",
    "path": "<optional path within repo>"
  },

  "gist": {
    "gist_id": "<github-gist-id>",
    "raw_url": "<stable raw content URL>",
    "encoding": "utf-8 | base64",
    "files": [
      {
        "filename": "<filename>",
        "role": "payload | index | manifest | skill | identity | archive"
      }
    ],
    "adapter_ref": "<path to ops adapter queue file — required for SKILL type Stones>"
  },

  "context": {
    "hcp_path": "<path to .hcp/ folder in repo, if present>",
    "session_gists": ["<gist-path-or-id>"],
    "identity_gist": "<gist-id of owner identity profile>",
    "cid": "<agent>/<conv-index>/<human-token>"
  },

  "wormhole_registry": [
    "<gist-id or raw_url of connected Stone or artifact>"
  ],

  "access": "PUBLIC | SIGNED | GATED | RESTRICTED | CHALLENGE",

  "fortune_decode": "<compressed LLM-readable summary of this Stone's purpose>",

  "created": "YYYY-MM-DD",
  "updated": "YYYY-MM-DD",
  "owner": "<human-token>"
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `version` | ✅ | Manifest schema version |
| `stone_id` | ✅ | 8-char hex unique identifier |
| `border_hash` | ✅ | SHA-256 of `stone_id + type + glow_channel + created` |
| `type` | ✅ | Semantic category (see Type Registry below) |
| `glow_channel` | ✅ | Dot-notation tag (e.g. `skill.mcp`, `memory.conversation`, `identity.human`) |
| `rarity` | ✅ | Complexity/value tier |
| `depth` | ✅ | Nesting level — 0 = root Stone, 1+ = child/embedded |
| `repo` | ✅ | The lattice — source repository and path |
| `gist` | ✅ | The wormhole — gist ID, raw_url, file roles |
| `gist.adapter_ref` | ⬜ SKILL only | Path to the ops adapter queue file that invokes this skill (e.g. `spaces/notion-ops/queue.json`). Makes a SKILL Stone self-invoking — not just what it is, but how to run it. |
| `context` | ✅ | The payload — HCP path, session gists, identity, CID |
| `wormhole_registry` | ⬜ | Cross-links to connected Stones or artifacts |
| `access` | ✅ | Access control level |
| `fortune_decode` | ⬜ | LLM-readable compressed summary for agent injection |
| `created` / `updated` | ✅ | ISO date stamps |
| `owner` | ✅ | Human token (e.g. `jared`) |

---

## Type Registry

| Type | Glow Channel Pattern | Description |
|------|---------------------|-------------|
| `CONTEXT` | `context.*` | Agent orientation — constraints, session state, handoff |
| `SKILL` | `skill.*` | MCP tool spec, agent capability, prompt template |
| `IDENTITY` | `identity.*` | Human or agent profile, preferences, working style |
| `FRAME` | `frame.*` | HTML-native ContextFrame artifact for M-MCP Rooms |
| `ALERT` | `alert.*` | Time-sensitive blocking flag — load before inbox |
| `GOLDSTONE` | `project.*` | Full project artifact — repo + gist + complete HCP manifest |

---

## Glow Channel Taxonomy

```
context.constraints       ← G-001 equivalent
context.session           ← G-003/G-002 equivalent
context.handoff           ← G-005 equivalent
context.checklist         ← G-004 equivalent
context.vocab             ← G-006 equivalent
context.cid               ← G-007 equivalent
context.alert             ← G-008 equivalent (proposed)

identity.human            ← Jared identity profile
identity.agent            ← Alice/Bob agent profile

skill.mcp                 ← MCP tool definition
skill.prompt              ← Reusable prompt template
skill.capability          ← Agent capability spec

memory.conversation       ← Archived conversation
memory.brainstorm         ← Ideation session artifact
memory.session            ← Ephemeral session notes

frame.context             ← ContextFrame HTML artifact
frame.hyperframe          ← HyperFrame video composition artifact

project.complete          ← GOLDSTONE — full project Stone
project.brainstorm        ← Brainstorm origin artifact
```

---

## Access Levels

| Level | Behavior |
|-------|----------|
| `PUBLIC` | No authentication — readable by anyone with the URL |
| `SIGNED` | Readable but verifies sender identity via CID |
| `GATED` | Requires explicit approval (wallet or agent gate) |
| `RESTRICTED` | IP/device whitelist — internal tooling only |
| `CHALLENGE` | Gated + security question or LLM challenge mode |

---

## Session Startup Protocol (with QA.Stone Layer)

```
1. Fetch identity Stone        ← glow_channel: identity.human
2. Fetch constraints Stone     ← glow_channel: context.constraints (G-001)
3. Fetch agent context Stone   ← glow_channel: context.session (G-003 or G-002)
4. Fetch handoff Stone         ← glow_channel: context.handoff (G-005)
5. Check for ALERT Stones      ← glow_channel: context.alert (G-008 if exists)
6. Read inbox                  ← act
```

---

## Integration Points

- **gitzip-push** — add `gist_id` field to `.gitzip` manifest for docking-area deployments
- **HCP** — `.hcp/repo.json` mirrored to gist as a `GOLDSTONE` Stone for cross-repo discovery
- **M-MCP Rooms** — `FRAME` Stones loaded via `<iframe src="raw_url">` with no repo dependency
- **repo-copilot** — `spaces/gists/` holds internal Stones; `gist.github.com` holds cross-repo wormholes

---

## Example: Jared Identity Stone

```json
{
  "version": "0.1",
  "stone_id": "a1b2c3d4",
  "border_hash": "f9e8d7c6b5a43210",
  "type": "IDENTITY",
  "glow_channel": "identity.human",
  "rarity": "RARE",
  "depth": 0,
  "repo": {
    "owner": "nothinginfinity",
    "name": "repo-copilot",
    "branch": "main",
    "path": "spaces/gists/G-009-identity.md"
  },
  "gist": {
    "gist_id": "<to-be-created>",
    "raw_url": "<to-be-created>",
    "encoding": "utf-8",
    "files": [
      { "filename": "jared-identity.json", "role": "identity" }
    ]
  },
  "context": {
    "hcp_path": null,
    "session_gists": ["G-001", "G-003", "G-007"],
    "identity_gist": "<self>",
    "cid": "alice/c1/jared"
  },
  "wormhole_registry": [
    "spaces/gists/G-003-alice-context.md",
    "spaces/gists/G-002-bob-context.md",
    "spaces/gists/G-007-cid-registry.md"
  ],
  "access": "SIGNED",
  "fortune_decode": "Jared Edwards. Builds agent-native software infrastructure. Foundation before expansion. Prefers strategic read before tactical action. Active repos: repo-copilot, gitzip-push, drivemind, m-mcp, studio-brainstorm.",
  "created": "2026-05-07",
  "updated": "2026-05-07",
  "owner": "jared"
}
```

### Example: notion-ops SKILL Stone

```json
{
  "version": "0.1",
  "stone_id": "b3c4d5e6",
  "border_hash": "1a2b3c4d5e6f7890",
  "type": "SKILL",
  "glow_channel": "skill.mcp",
  "rarity": "UNCOMMON",
  "depth": 0,
  "repo": {
    "owner": "nothinginfinity",
    "name": "repo-copilot",
    "branch": "main",
    "path": "spaces/notion-ops"
  },
  "gist": {
    "gist_id": "<notion-ops-gist-id>",
    "raw_url": "<notion-ops-raw-url>",
    "encoding": "utf-8",
    "files": [
      { "filename": "notion-ops-spec.json", "role": "skill" }
    ],
    "adapter_ref": "spaces/notion-ops/queue.json"
  },
  "context": {
    "hcp_path": null,
    "session_gists": [],
    "identity_gist": "fb001a1ece0a750f857c4f90a1130f92",
    "cid": "alice/c2/jared"
  },
  "access": "SIGNED",
  "fortune_decode": "notion-ops adapter. Ops: search, get_page, create_page, query_database, update_block, append_blocks, create_database, append_row, append_note. Invoke via adapter_ref queue.",
  "created": "2026-05-09",
  "updated": "2026-05-09",
  "owner": "jared"
}
```

---

## Change Log

| Date | Version | Change | By |
|------|---------|--------|----||
| 2026-05-07 | 0.1 | Initial specification | Jared Edwards + Alice (alice/c1/jared) |
| 2026-05-09 | 0.1 | Add `adapter_ref` field to `gist` block — SKILL Stones now self-invoking | Alice (alice/c2/jared) |
