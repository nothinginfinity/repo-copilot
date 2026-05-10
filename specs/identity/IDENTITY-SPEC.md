# Identity Domain Gist Spec — G-012
**Version:** 0.1  
**Status:** Draft  
**Date:** 2026-05-09  
**Author:** Jared Edwards + Bob (repo-copilot)

---

## What Is a Domain Identity Gist?

A **domain identity gist** is a user-owned JSON file — hosted as a GitHub Gist — that stores personal preferences for a specific life domain (style, music, food, faith, health, travel, etc.).

Apps request access to only the domain(s) they need. The user grants or denies per request. No app ever sees your full identity at once unless you choose that.

This is **OAuth for personal taste** — not for account access, but for lived experience.

---

## Core Principles

1. **User-owned** — the gist lives in your GitHub account. No platform owns it.
2. **Domain-scoped** — each domain is a separate gist. Apps get the minimum necessary.
3. **Permissioned** — every access request is explicit. You grant, you revoke.
4. **LLM-populated** — your conversations, research, and brainstorm sessions feed the gist automatically via a distillation agent. You don't fill out a form.
5. **Portable** — any PWA, anywhere, can fetch your gist via its public URL if you grant access.
6. **Versioned** — git-tracked. You can see how your tastes evolve over time.

---

## Domain Taxonomy

| Domain | `_domain` key | What It Covers | Sensitivity |
|--------|--------------|----------------|-------------|
| Core | `core` | Name, language, timezone, social graph | Low — shared with every app |
| Style | `style` | Clothing, aesthetic, brands, budget | Low |
| Music | `music` | Genres, artists, mood, tempo | Low |
| Food | `food` | Diet, cuisine, allergies, flavor | Medium |
| Faith | `faith` | Values, traditions, observances | High |
| Health | `health` | Wellness, sensitivities, goals | High |
| Travel | `travel` | Pace, budget, regions, interests | Medium |
| Entertainment | `entertainment` | Film, games, books, creators | Low |
| Work | `work` | Role, tools, collaboration style | Medium |

---

## Permission Model

When a PWA wants to personalize your experience, it issues a **domain request**:

```json
{
  "app": "friends-clothing-store",
  "requesting": ["core", "style"],
  "reason": "To show you items that match your taste and fit",
  "expires": "session"
}
```

The user sees a prompt:
> *"friends-clothing-store is requesting access to your **core** and **style** gists. Grant / Deny"*

On grant, the app receives only those two domain objects. Nothing else.

**Expiry options:** `session` | `24h` | `30d` | `permanent` | `revocable`

---

## How LLM Conversations Feed Your Gist

You don't manually fill out your identity gist. Your conversations do it for you.

### Pipeline

```
1. LLM session committed to studio-brainstorm repo
        ↓
2. Distillation agent reads session
        ↓
3. Extracts preference signals
   ("Jared mentioned minimal design 4x",
    "Jared said he avoids fast fashion",
    "Jared described his faith as important to daily decisions")
        ↓
4. Routes signals to correct domain gist
        ↓
5. Gist updated, committed, versioned
```

### Signal Extraction Rules
- Only explicit or strongly implied preferences are extracted
- Signals are tagged with source session ID for auditability
- User can review and remove any signal at any time
- Conflicting signals surface for user resolution, not silent overwrite

---

## Two-Gist Social Primitive

When two people both have identity gists and open the same PWA link:

```
Person A's gist + Person B's gist
        ↓
LLM negotiates shared context
        ↓
App generates a shared experience built for both people
```

Examples:
- A multiplayer game that adapts its theme to both players' entertainment gists
- A restaurant recommendation app that finds overlap between two food gists
- A travel planner that builds an itinerary respecting both people's constraints

This is the **social primitive** — not a profile page, not a friend request, but a live negotiation between two identities mediated by an LLM.

---

## Creating Your Own Domain Gist

1. Fork `specs/identity/identity-template.json` from `nothinginfinity/repo-copilot`
2. Keep only the domains relevant to you
3. Save as a **secret GitHub Gist** (secret = not indexed, but accessible via direct URL)
4. Note the gist URL — this is your identity endpoint
5. Share the URL only with apps you trust

---

## Roadmap

| Version | Feature |
|---------|--------|
| v0.1 | Core schema + domain taxonomy (this spec) |
| v0.2 | Distillation agent (studio-brainstorm → gist pipeline) |
| v0.3 | Permission prompt UI (PWA-native consent layer) |
| v0.4 | Two-gist social primitive (LLM negotiation layer) |
| v0.5 | RSS feed integration (m-mcp-rss ingests gist updates as feed) |
| v1.0 | Full platform — identity as billable resolution event |

---

## Related Gists

- **G-009** — `jared-identity.json` — Jared's core identity (the first wormhole)
- **G-010** — Brain DB — agent memory system
- **G-011** — Hub — inter-repo hub spec
- **G-012** — This spec
