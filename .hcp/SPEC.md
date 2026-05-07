# HCP — Hyperframe Context Protocol Specification v0.1

## Overview

HCP is a lightweight, file-based protocol for declaring the identity, role, and capabilities of a GitHub repository within a multi-agent, HTML-native software network.

A repo participates in HCP by maintaining a `.hcp/` directory at its root.

## Required Files

| File | Purpose |
|---|---|
| `.hcp/repo.json` | Identity: who/what this repo is in the network |
| `.hcp/purpose.md` | Human-readable explanation of the repo's role |
| `.hcp/capabilities.json` | Machine-readable list of capabilities with status and spec links |

## Optional Files

| File | Purpose |
|---|---|
| `.hcp/network.json` | Known network members (orchestrators maintain this) |
| `.hcp/contexts/[name].json` | Per-capability or per-dependency context records |
| `.hcp/changelog.md` | Protocol-level changes (not code changes) |

## repo.json Schema

```json
{
  "hcp_version": "0.1.0",
  "repo": "owner/name",
  "role_in_network": "orchestrator | deployment_rail | html_video_composition | html_context_composition | multiplayer_runtime | memory_layer",
  "artifact_format": "html | gitzip_bundle | json | markdown",
  "trust_model": "free-text description",
  "created": "YYYY-MM-DD",
  "updated": "YYYY-MM-DD"
}
```

## Capability Status Values

| Value | Meaning |
|---|---|
| `active` | Implemented and usable |
| `planned` | Specced but not yet implemented |
| `deprecated` | No longer maintained |
| `experimental` | Implemented but unstable API |

## Design Principles

1. **File-native** — No server, no database. The `.hcp/` directory IS the protocol.
2. **Human-readable** — Every file should be understandable by a developer reading the repo.
3. **Agent-traversable** — Agents can discover capabilities by reading `.hcp/capabilities.json`.
4. **Minimal** — Required files are 3. Everything else is optional.
5. **Composable** — Each repo declares its own identity. A network.json can reference others, but no central registry is required.

## Versioning

HCP uses semantic versioning. The current version is `0.1.0` (pre-stable). Breaking changes will increment the minor version until `1.0.0` is declared stable.
