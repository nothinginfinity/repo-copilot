# Identity Domain Gist Spec — G-012
**Version:** 0.2  
**Status:** Draft  
**Date:** 2026-05-09  
**Author:** Jared Edwards + Bob (repo-copilot)  
**Reviewed by:** Alice (alice/c5/jared)  
**Changes from v0.1:** Revocation mechanism, `social_graph` schema, security model, `finance` domain, `context` domain

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
4. **LLM-populated** — your conversations, research, and brainstorm sessions feed the gist automatically via a distillation agent. You don’t fill out a form.
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
| Faith | `faith` | Values, traditions, observances | **High** — see Security Model |
| Health | `health` | Wellness, sensitivities, goals | **High** — see Security Model |
| Travel | `travel` | Pace, budget, regions, interests | Medium |
| Entertainment | `entertainment` | Film, games, books, creators | Low |
| Work | `work` | Role, tools, collaboration style | Medium |
| Finance | `finance` | Spending style, budget comfort, savings priority, subscription tolerance | Medium |
| Context | `context` | Device primary, accessibility needs, UI density, color scheme | Low |

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
> *“friends-clothing-store is requesting access to your **core** and **style** gists. Grant / Deny”*

On grant, the app receives only those two domain objects. Nothing else.

**Expiry options:** `session` | `24h` | `30d` | `permanent` | `revocable`

---

## Revocation Mechanism

*Added v0.2 — addresses Alice gap #1.*

Each access grant is issued a **grant token** — a short slug generated at grant time and stored in the gist’s `_grants` array:

```json
{
  "_grants": [
    {
      "token": "gk_a3f9",
      "app": "friends-clothing-store",
      "domains": ["core", "style"],
      "granted_at": "2026-05-09T22:00:00Z",
      "expires": "30d"
    }
  ]
}
```

### Revoking a single app

Delete or mark-expired the app’s entry in `_grants`. The app’s token is now invalid. Other apps’ tokens are unaffected — each grant is scoped to its own token.

### Revoking all access (nuclear option)

Create a new gist and update your identity endpoint URL. All old tokens die with the old URL. No existing app retains access until you re-grant.

### Token rotation (periodic hygiene)

Rotate your gist URL annually or after any suspected leak. The old URL remains readable but you stop sharing it. Apps that need continued access must re-request.

> **Note:** Until a PWA-native permission prompt UI ships (v0.3), grant management is manual via editing the gist JSON. The `_grants` array is the source of truth.

---

## `social_graph` Schema

*Added v0.2 — addresses Alice gap #2.*

The `social_graph` field in the `core` domain is an array of **identity references** — people whose gists you trust and want apps to be aware of:

```json
{
  "social_graph": [
    {
      "handle": "@alice",
      "gist_url": "https://gist.github.com/alice/abc123",
      "domains_shared": ["core", "entertainment"],
      "relationship": "collaborator",
      "notes": "Alice is my agent partner"
    },
    {
      "handle": "@charlie",
      "gist_url": "https://gist.github.com/charlie/def456",
      "domains_shared": ["core"],
      "relationship": "teammate",
      "notes": ""
    }
  ]
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `handle` | string | Yes | Human-readable name or @username |
| `gist_url` | string | Yes | Direct URL to their identity gist |
| `domains_shared` | array | Yes | Which domains of *their* gist you want apps to see |
| `relationship` | string | No | Free label: `friend`, `collaborator`, `family`, `teammate` |
| `notes` | string | No | Freeform context for distillation agent |

### How apps use `social_graph`

For the **two-gist social primitive**: when two users open the same PWA and both have `social_graph` entries pointing at each other, the app can confirm the mutual reference and proceed directly to LLM negotiation without a second grant prompt. This is the trusted-pair fast path.

---

## Security Model for High-Sensitivity Domains

*Added v0.2 — addresses Alice gap #6.*

> **Important:** GitHub Secret Gists are NOT truly private. Anyone with the direct URL can read the content. The “secret” designation only means the gist is not indexed or publicly listed — it does not encrypt or token-gate the content.

### Risk by Sensitivity Level

| Sensitivity | Domains | Risk if URL leaks |
|-------------|---------|------------------|
| Low | `core`, `style`, `music`, `entertainment`, `context` | Minimal — preference data only |
| Medium | `food`, `travel`, `work`, `finance` | Moderate — behavioral and financial signals |
| **High** | `faith`, `health` | **Serious** — religious beliefs, medical conditions |

### Mitigations for High-Sensitivity Domains (v0.2 recommendations)

1. **Separate gist per high-sensitivity domain.** Never bundle `faith` or `health` with other domains in the same gist file. URL leak is contained to one domain.

2. **Rotate URLs more aggressively.** High-sensitivity gists should be rotated every 90 days or immediately after sharing with any new app.

3. **Limit `permanent` grants.** Never issue a `permanent` expiry for `faith` or `health` domains. Maximum recommended: `30d` with explicit re-grant.

4. **Encrypt at rest (v0.3 target).** Full field-level encryption of high-sensitivity domain values, with the decryption key held by the user and never transmitted to apps — only the LLM running locally (or in a trusted enclave) decrypts. This is a v0.3 build item.

5. **URL-leak handling.** If you suspect a high-sensitivity gist URL has leaked: immediately delete the gist and create a new one. Notify any apps you had granted access to re-request.

> Until v0.3 encryption ships, users with high personal risk (public figures, people in restrictive contexts) should avoid storing `faith` and `health` domains in GitHub Gists entirely and wait for the encrypted store.

---

## How LLM Conversations Feed Your Gist

You don’t manually fill out your identity gist. Your conversations do it for you.

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

> **Note:** The distillation agent architecture (model selection, prompt structure, confidence threshold) is deferred to v0.2 scope — see Roadmap.

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
- A multiplayer game that adapts its theme to both players’ entertainment gists
- A restaurant recommendation app that finds overlap between two food gists
- A travel planner that builds an itinerary respecting both people’s constraints

This is the **social primitive** — not a profile page, not a friend request, but a live negotiation between two identities mediated by an LLM.

See `social_graph` schema above for the trusted-pair fast path.

---

## Creating Your Own Domain Gist

1. Fork `specs/identity/identity-template.json` from `nothinginfinity/repo-copilot`
2. Keep only the domains relevant to you
3. Save as a **secret GitHub Gist** (secret = not indexed, but accessible via direct URL)
4. Note the gist URL — this is your identity endpoint
5. Share the URL only with apps you trust
6. For `faith` and `health` domains: read the Security Model section above before storing sensitive data

---

## Roadmap

| Version | Feature |
|---------|--------|
| v0.1 | Core schema + domain taxonomy |
| **v0.2** | **Revocation mechanism, `social_graph` schema, security model, `finance` + `context` domains (this spec)** |
| v0.3 | Distillation agent spec (studio-brainstorm → gist pipeline); field-level encryption for high-sensitivity domains |
| v0.4 | Permission prompt UI (PWA-native consent layer) |
| v0.5 | Two-gist social primitive (LLM negotiation layer) |
| v0.6 | RSS feed integration (m-mcp-rss ingests gist updates as feed) |
| v1.0 | Full platform — identity as billable resolution event |

---

## Related Gists

- **G-009** — `jared-identity.json` — Jared’s core identity (the first wormhole)
- **G-010** — Brain DB — agent memory system
- **G-011** — Hub — inter-repo hub spec
- **G-012** — This spec
- **G-013** — Roadmap DB schema (pending)
- **G-014** — notion-ops architecture (pending)
