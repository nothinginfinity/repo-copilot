# Notion Database Setup — notion-gamekit v1
_Tic-Tac-Toe template. Duplicate this template into your Notion workspace._

---

## Overview

v1 uses **2 Notion databases**:

| Database | Purpose | Records |
|----------|---------|--------|
| **Sessions** | One record per game played | Created by Export JSON + paste |
| **Scores** | One record per player, lifetime stats | Updated manually after each session |

All databases live inside the duplicated Notion template page.

---

## Database 1: Sessions

Create a new database named **Sessions**.

| Property Name | Property Type | Options / Notes |
|---|---|---|
| `Session ID` | Text | Paste from exported JSON. Format: UUID v4 |
| `Game` | Select | Add option: `tic-tac-toe` |
| `Player` | Text | Your name |
| `Opponent` | Text | `AI` for v1 |
| `Mode` | Select | Add option: `human_vs_ai` |
| `Started At` | Date | Include time. Set timezone. |
| `Ended At` | Date | Include time. |
| `Duration (sec)` | Number | Format: Number |
| `Result` | Select | Add options: `win`, `loss`, `draw` |
| `Move Count` | Number | Format: Number |
| `Final State` | Text | 9-char board string e.g. `XOXOXOXXO` |
| `Move Log` | Text | Paste JSON array string from export |
| `Sync Status` | Select | Add options: `local`, `copied`, `synced` |

**Recommended views:**
- **All Games** — default table view, sort by Started At descending
- **Wins** — filter: Result = win
- **By Game** — group by: Game

---

## Database 2: Scores

Create a new database named **Scores** (leaderboard).

| Property Name | Property Type | Options / Notes |
|---|---|---|
| `Player` | Title | Your name |
| `Game` | Select | Add option: `tic-tac-toe` |
| `Total Sessions` | Number | Format: Number |
| `Wins` | Number | Format: Number |
| `Losses` | Number | Format: Number |
| `Draws` | Number | Format: Number |
| `Win Rate` | Formula | `round(prop("Wins") / prop("Total Sessions") * 100)` + `"%"` |
| `Current Streak` | Number | Positive = win streak, negative = loss streak |
| `Last Played` | Date | Include time. |

**Recommended views:**
- **Leaderboard** — table view, sort by Win Rate descending, then Total Sessions descending

---

## How to Add a Session (Level 2 Sync)

1. Finish a game in the app
2. Tap **Export JSON** — the session data copies to your clipboard
3. Open Notion → Sessions database → **New record**
4. Paste each field from the JSON into the matching Notion property
5. Set `Sync Status` → `copied`
6. Open Scores → find your player record → update Win/Loss/Draw counts and Last Played

> **Tip:** In a future update, the app will auto-push to Notion via API (Level 3 sync). For v1, the manual paste takes about 60 seconds.

---

## Deferred to v2

These databases are **intentionally excluded from v1** to keep the template simple enough to actually sell:

- `Moves` DB — move-level analytics (v2: promoted from `move_log` text field)
- `Players` DB — multi-player profiles (v2)
- `Games` DB — game catalog (v2 when 2+ games exist)
- `AI Analysis` DB — LLM session analysis (v2, see `prompts.md` for manual prompt)

---

## Template Duplication Guide

1. Open the shared Notion template link
2. Click **Duplicate** (top-right) — this copies the full template into your workspace
3. Rename the root page if desired
4. All databases are pre-configured — no setup needed beyond adding your first session

---

_Schema version: 1.0 | Last updated: 2026-05-10 | Owner: Bob (Spec+QA)_
