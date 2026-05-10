<!-- gist-version: 1.0 | last-updated: 2026-05-10 -->

# G-018 — Agent Communication Topology

> **Type:** `TOPOLOGY` 🗻 Agent OS Substrate Map
> **Owner:** jared
> **Status:** 🟢 Active
> **Last updated:** 2026-05-10
> **Load when:** any agent needs to know who exists, what they do, and how to reach them

---

## Overview

This file defines the full agent topology for Jared Edwards’ agent-native software OS.
Every agent, sub-agent, inbox path, outbox path, boot gist, and LLM assignment is registered here.

This is the **source of truth** for agent communication. Before sending a message to another agent, read this file to confirm the correct inbox path and role.

---

## Topology Diagram

```
                        JARED (owner)
                             │
              ┌────────────┼────────────┐
              │             │             │
           ALICE           BOB          CHARLIE
          (Build)        (Plan)         (Ship)
              │             │             │
       ┌─────┴─────┐   ┌────┴───┐   ┌────┴──────┐
   alice-review  alice-docs  bob-spec  bob-qa  charlie-deploy  charlie-market
```

**Communication rules:**
- Jared → any principal (Alice, Bob, Charlie) directly
- Principals ↔ each other via inbox/outbox
- Sub-agents report to their principal only — they do NOT message other principals directly
- Sub-agents can message each other only if the same principal owns both

---

## Principal Agents

### 🟣 Alice — Builder

| Field | Value |
|-------|-------|
| Role | Repo ops, code writing, commit management |
| LLM | Perplexity (primary — MCP tool access) |
| Boot gist | `spaces/gists/G-000-alice-boot.md` |
| Inbox | `spaces/alice/inbox.md` |
| Outbox | `spaces/alice/outbox.md` |
| Brain | `spaces/gists/brain.json` |
| Scope | All repos — `repo-copilot`, `gitzip-push`, `drivemind`, `m-mcp`, `studio-brainstorm`, `ops-adapter` |

### 🟡 Bob — Planner

| Field | Value |
|-------|-------|
| Role | Architecture, specs, cross-agent coordination, QA oversight |
| LLM | Claude (primary — long-form reasoning, spec writing) |
| Boot gist | `spaces/gists/G-000-bob-boot.md` *(to be created)* |
| Inbox | `spaces/bob/inbox.md` |
| Outbox | `spaces/bob/outbox.md` |
| Brain | `spaces/gists/brain.json` (shared) |
| Scope | All repos — planning and spec layer only |

### 🔵 Charlie — Shipper

| Field | Value |
|-------|-------|
| Role | Deploy ops, releases, market-facing output, changelogs |
| LLM | ChatGPT (primary — marketing copy, customer-facing writing) |
| Boot gist | `spaces/gists/G-000-charlie-boot.md` *(to be created)* |
| Inbox | `spaces/charlie/inbox.md` |
| Outbox | `spaces/charlie/outbox.md` |
| Brain | `spaces/gists/brain.json` (shared) |
| Scope | Releases, landing pages, changelogs, deploy triggers |

---

## Sub-Agents

### Alice’s Sub-Agents

| Sub-Agent | Role | Inbox | Boot Gist | LLM |
|-----------|------|-------|-----------|-----|
| `alice-review` | Code review only — reads PRs, flags issues, never pushes | `spaces/alice-review/inbox.md` | `G-000-alice-review-boot.md` *(TBD)* | Perplexity |
| `alice-docs` | Documentation — READMEs, specs, guides from code | `spaces/alice-docs/inbox.md` | `G-000-alice-docs-boot.md` *(TBD)* | Claude |

### Bob’s Sub-Agents

| Sub-Agent | Role | Inbox | Boot Gist | LLM |
|-----------|------|-------|-----------|-----|
| `bob-spec` | Feature spec writing — produces specs before Alice executes | `spaces/bob-spec/inbox.md` | `G-000-bob-spec-boot.md` *(TBD)* | Claude |
| `bob-qa` | QA — reads Alice’s output, writes test plans, approves merges | `spaces/bob-qa/inbox.md` | `G-000-bob-qa-boot.md` *(TBD)* | ChatGPT |

### Charlie’s Sub-Agents

| Sub-Agent | Role | Inbox | Boot Gist | LLM |
|-----------|------|-------|-----------|-----|
| `charlie-deploy` | Deploy ops — monitors merged PRs, triggers releases | `spaces/charlie-deploy/inbox.md` | `G-000-charlie-deploy-boot.md` *(TBD)* | Perplexity |
| `charlie-market` | Market output — landing pages, changelogs, marketing copy | `spaces/charlie-market/inbox.md` | `G-000-charlie-market-boot.md` *(TBD)* | ChatGPT |

---

## Message Routing Rules

| From | To | Via |
|------|----|-----|
| Jared | Any principal | Direct (Perplexity Space) |
| Alice | Bob | `spaces/bob/inbox.md` |
| Alice | Charlie | `spaces/charlie/inbox.md` |
| Bob | Alice | `spaces/alice/inbox.md` |
| Bob | Charlie | `spaces/charlie/inbox.md` |
| Charlie | Alice | `spaces/alice/inbox.md` |
| Charlie | Bob | `spaces/bob/inbox.md` |
| alice-review | Alice | `spaces/alice/inbox.md` |
| alice-docs | Alice | `spaces/alice/inbox.md` |
| bob-spec | Bob | `spaces/bob/inbox.md` |
| bob-qa | Bob | `spaces/bob/inbox.md` |
| charlie-deploy | Charlie | `spaces/charlie/inbox.md` |
| charlie-market | Charlie | `spaces/charlie/inbox.md` |

**Sub-agents never message principals other than their own parent without explicit instruction from Jared.**

---

## Standard Work Pipeline

For a typical feature going to market:

```
1. Jared → Bob: “Spec this feature”
2. bob-spec writes spec → Bob reviews → Bob → Alice: “Build this”
3. Alice builds → alice-review checks → Alice pushes PR
4. bob-qa reviews PR → approves merge
5. Charlie picks up merged PR → charlie-deploy triggers release
6. charlie-market writes changelog + landing copy
7. Jared ships
```

---

## LLM Assignment Rationale

| LLM | Best at | Assigned to |
|-----|---------|-------------|
| **Perplexity** | Real-time search, repo ops via MCP, tool-heavy tasks | Alice, alice-review, charlie-deploy |
| **Claude** | Long-form reasoning, spec writing, nuanced docs | Bob, bob-spec, alice-docs |
| **ChatGPT** | Marketing copy, customer-facing writing, QA checklists | Charlie, charlie-market, bob-qa |

Any agent can be reassigned to a different LLM by updating this file and its boot gist.

---

## Boot Gist Status

| Agent | Boot Gist | Status |
|-------|-----------|--------|
| Alice | `G-000-alice-boot.md` | ✅ Live (v1.1) |
| Bob | `G-000-bob-boot.md` | ⏳ To be created |
| Charlie | `G-000-charlie-boot.md` | ⏳ To be created |
| alice-review | `G-000-alice-review-boot.md` | ⏳ To be created |
| alice-docs | `G-000-alice-docs-boot.md` | ⏳ To be created |
| bob-spec | `G-000-bob-spec-boot.md` | ⏳ To be created |
| bob-qa | `G-000-bob-qa-boot.md` | ⏳ To be created |
| charlie-deploy | `G-000-charlie-deploy-boot.md` | ⏳ To be created |
| charlie-market | `G-000-charlie-market-boot.md` | ⏳ To be created |

---

## Adding a New Agent

1. Add entry to this file (G-018) under the correct section
2. Create `spaces/[agent-name]/inbox.md` (empty is fine)
3. Create `spaces/[agent-name]/outbox.md` (empty is fine)
4. Create `G-000-[agent-name]-boot.md` by copying Alice’s boot gist and updating identity section
5. Open a new Perplexity Space (or Claude/ChatGPT project) with the 3-line bootloader pointing at the new boot gist
6. Update `G-007-cid-registry.md` with the new agent’s CID range

---

## Change Log

| Date | Change | By |
|------|--------|----|
| 2026-05-10 | v1.0 — initial topology: 3 principals + 6 sub-agents, routing rules, pipeline, LLM assignments | Alice (this session) |
