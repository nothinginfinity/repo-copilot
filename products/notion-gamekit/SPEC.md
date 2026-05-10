# notion-gamekit — Product Spec
_Status: v0.1 draft — 2026-05-10_
_Owner: Jared | Build: Alice | Spec+QA: Bob | Deploy+Market: Charlie_

---

## Vision

A game-agnostic engine that proves: GitHub Pages app → playable on phone → session logged
→ Notion scoreboard updates → LLM can analyze results → template can be duplicated and sold.

Every game is a "cartridge" in the same universal engine.
The engine is the product. The games prove the engine. The Notion template is what gets sold.

---

## Repo / Product Ladder

| Repo | Role |
|------|------|
| `notion-gamekit` | The engine (this) |
| `notion-arcade` | The game collection |
| `life-franchise-mode` | Serious business/life simulator |
| `agent-mission-control` | AI agent operating game |

---

## Directory Structure

```
notion-gamekit/
  app/
    index.html
    style.css
    app.js
  games/
    tic-tac-toe/
      game.json
      logic.js
      schema.json
      prompts.md
    minesweeper/
      game.json
      logic.js
      schema.json
      prompts.md
  notion/
    database-schema.md
    template-guide.md
  docs/
    gamekit-roadmap.md
    creator-guide.md
```

---

## Universal Game Loop

```
Player opens game
  → Game creates session
  → Player makes moves
  → Game updates state
  → Game ends or pauses
  → Score/result saved
  → Notion stores session + moves + scoreboard
  → LLM analyzes session
  → Dashboard updates
```

---

## Universal Base Objects

| Object | Fields |
|--------|--------|
| **Game** | id, name, type, min/max players, tracks, notionDatabases |
| **Player** | id, name, type (human/ai), wins, losses, draws |
| **Session** | id, game, player, opponent, mode, started_at, ended_at, duration, result, score, difficulty, move_count, final_state, sync_status, analysis_status |
| **Move** | id, session_id, move_number, player, move_type, move_data, board_state_before, board_state_after, timestamp, valid, notes |
| **Score** | player, game, total_sessions, wins, losses, draws, best_score, best_time, current_streak, last_played |

---

## game.json Schema

```json
{
  "id": "tic-tac-toe",
  "name": "Tic-Tac-Toe",
  "type": "turn_based_board",
  "players": { "min": 1, "max": 2 },
  "tracks": ["wins", "losses", "draws", "move_history", "streaks", "duration"],
  "notionDatabases": ["Games", "Players", "Sessions", "Moves", "Scores", "AI Analysis"]
}
```

---

## Notion Universal Databases

### Sessions
Session ID, Game, Player, Opponent, Mode, Started At, Ended At, Duration, Result, Score, Difficulty, Move Count, Final State, Sync Status, Analysis Status

### Moves
Move ID, Session ID, Move Number, Player, Move Type, Move Data, Board State Before, Board State After, Timestamp, Valid?, Notes

### Scores / Leaderboard
Player, Game, Total Sessions, Wins, Losses, Draws, Best Score, Best Time, Current Streak, Last Played

### AI Analysis
Session ID, Game, Player, Notes, Weaknesses, Recommendations, Created At

---

## Notion Sync Levels

| Level | What | Goal |
|-------|------|------|
| **Level 1** | localStorage only | Prove gameplay |
| **Level 2** | Copy-to-Notion JSON/markdown payload | Prove data model |
| **Level 3** | Notion API via secure relay (Cloudflare Worker / GitHub Action) | Automatic scoreboard |

v1 ships Level 1 + Level 2. Level 3 comes after template is selling.

---

## Game Roadmap

| Phase | Game | Proves |
|-------|------|--------|
| 1 | **Tic-Tac-Toe** | Board state, session logging, Notion scoreboard |
| 2 | Rock Paper Scissors | Ultra-fast session log, streaks, probability (side demo) |
| 3 | **Minesweeper** | Timer, risk, difficulty, hidden information |
| 4 | Memory Match | Cards, memory, attempts, pattern recognition |
| 5 | **Checkers** | Deeper turn-based, longer sessions, pause/resume |
| 6 | **Skill Arena** | Skill diagnostics, LLM analysis, education bridge |
| 7 | Solitaire Score Tracker | Classic card game stats |
| 8 | **Main Street Builder** | Money, events, choices, resource tracking |
| 9 | Credit/Resource Simulator | Synthetic finance strategy |
| 10 | **Life Franchise Mode Scenario 001** | Full business/life simulator |

**Bold = primary milestones.**

---

## Week-by-Week Build Order

### Week 1 — GameKit Core + Tic-Tac-Toe
- Mobile PWA shell
- Tic-Tac-Toe game (vs simple AI)
- Local scoreboard (localStorage)
- Session object + move log object
- Export JSON button
- Notion template blueprint
- README setup guide

**Success condition:** Play on phone from GitHub Pages, finish a game, see session summary matching Notion schema.

### Week 2 — Notion Template + Manual Import
- Notion databases (Games, Players, Sessions, Moves, Scores, AI Analysis)
- Demo player data + demo sessions
- Leaderboard views
- Game detail pages
- AI analysis prompt page
- Copy/paste workflow (Level 2 sync)

**Success condition:** User duplicates template, plays game, copies result to Notion, sees dashboard stats.

### Week 3 — Minesweeper
- Timer, difficulty, best time
- Risk metrics, failure/success stats
- Same Sessions + Scores databases handle both games

### Week 4 — Skill Arena
- Question-based game, JSON question import
- Track answers by category, confidence, explanation
- AI prompt for weak-skill analysis

### Week 5 — Checkers
- Local 2-player, move validation, capture logic
- Save/resume session, move history

### Week 6 — Main Street Builder
- Simple business board game
- Synthetic player profile: cash/time/skill/resources
- Event cards, opportunity cards
- End-of-game business analysis

---

## What to Avoid in v1

- No chess, no Monopoly clone
- No real financial advice
- No multiplayer
- No authentication
- No paid marketplace logic
- No live Notion API sync (Level 3 deferred)
- No perfect polish — prove the loop first

---

## Distribution Plan

- **App:** GitHub Pages (free, instant, mobile PWA)
- **Template:** Notion template gallery or Gumroad
- **Target buyer:** Notion power users, indie hackers, educators, life-gamification enthusiasts
- **Price point:** TBD by Charlie

---

## Open Questions for Bob (Spec)

1. Should `Session` be one Notion DB or split by game type?
2. What is the minimum viable `game.json` schema for v1?
3. How should `board_state` be serialized for Tic-Tac-Toe? (3x3 array? string?)
4. What are the acceptance criteria for Week 1 success condition?
5. Should Level 2 sync use JSON copy, markdown table copy, or both?

---

## Open Questions for Charlie (Deploy + Market)

1. GitHub Pages setup — new repo `notion-gamekit` or subfolder of `repo-copilot`?
2. Notion template gallery vs Gumroad vs Lemon Squeezy for v1 distribution?
3. Price point for v1 Tic-Tac-Toe template?
4. What does the product landing page look like?
