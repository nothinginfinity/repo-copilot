# G-012 — Identity Domain Gist Spec

| Field | Value |
|-------|-------|
| **ID** | G-012 |
| **Name** | identity-domain-spec |
| **Status** | Draft v0.1 |
| **Date** | 2026-05-09 |
| **Files** | `specs/identity/identity-template.json`, `specs/identity/IDENTITY-SPEC.md` |
| **Purpose** | Canonical schema + permission model for domain-scoped personal identity gists |

## Summary

Defines the **domain identity gist** primitive — user-owned JSON files (one per life domain) that apps request access to on a permissioned, scoped basis. The foundation for personalizing all PWA apps without surveillance.

## Key Concepts

- **Domain-scoped** — style, music, food, faith, health, travel, entertainment, work, core
- **Permission model** — apps request specific domains; user grants/denies per session
- **LLM-populated** — brainstorm conversations feed the gist via a distillation agent
- **Two-gist social primitive** — two identities + LLM = shared personalized experience
- **Billable event** — identity resolution is the platform's revenue primitive

## Related

- G-009 `jared-identity.json` — the first identity wormhole
- `m-mcp-rss` — RSS adapter that will ingest gist updates as subscribable feeds
- `specs/pwa-app-store-bypass.md` — the distribution layer this identity spec powers
- `specs/code-icles-spec-v0.1.md` — generated content that consumes identity gists
