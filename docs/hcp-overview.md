# HCP — Hyperframe Context Protocol

HCP is the memory and protocol layer of the repo-copilot network. It answers the question: **what does a repo know about itself, and how do agents discover that?**

## Quick Start

To add HCP to any repo, create a `.hcp/` directory with three files:

```
.hcp/
  repo.json          ← identity + role
  purpose.md         ← human-readable role description  
  capabilities.json  ← machine-readable capability list
```

See `.hcp/SPEC.md` for the full specification.

## The Network

The five repos in the network and their roles:

| Repo | Role | HCP Status |
|---|---|---|
| `repo-copilot` | Orchestrator | ✅ Active |
| `gitzip-push` | Deployment Rail | 🔜 Pending seed |
| `hyperframes` | HTML Video Composition | 🔜 Pending seed |
| `context-frames` | HTML Context Composition | 📋 Repo planned |
| `m-mcp` | Multiplayer Runtime | 📋 Repo planned |

## Why File-Based?

HCP is intentionally file-native. No server, no database, no registry. The `.hcp/` directory in each repo IS the protocol. This means:
- Any agent can read it with a single `get_file_contents` call
- Any human can read it with a browser
- It survives as long as the repo survives
- It requires zero infrastructure to maintain
