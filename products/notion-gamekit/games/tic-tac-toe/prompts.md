# AI Analysis Prompts — Tic-Tac-Toe
_Copy-paste prompts for analyzing your game sessions with any LLM (ChatGPT, Claude, Perplexity, etc.)_
_v1: Manual prompt. v2: Auto-invoked via Notion AI Analysis DB._

---

## How to Use

1. Finish a game and export the session JSON
2. Open any LLM chat
3. Paste the relevant prompt below
4. Replace `{{SESSION_JSON}}` with your exported session data
5. Read the analysis

---

## Prompt 1 — Session Debrief (Quick)

Use after any single game for a fast summary.

```
You are a Tic-Tac-Toe coach. Analyze this game session and give me:
1. A one-sentence verdict on how the game was played
2. The move that decided the outcome (if any)
3. One thing I could have done differently

Game data:
{{SESSION_JSON}}

Board notation: 9-char string, positions 0-8 left-to-right top-to-bottom. X = me, O = AI, . = empty.
```

---

## Prompt 2 — Deep Move Analysis

Use when you want to understand a specific game in depth.

```
You are a Tic-Tac-Toe analyst. I'll give you a full game move log. For each move, tell me:
- Was it optimal, suboptimal, or a mistake?
- What was the best move available at that point?
- Did this move create a threat, block a threat, or neither?

Game data:
{{SESSION_JSON}}

Board positions (0-indexed, row-major):
  0 | 1 | 2
  ---------
  3 | 4 | 5
  ---------
  6 | 7 | 8

X = me, O = AI.
```

---

## Prompt 3 — Pattern Analysis (Multi-Session)

Use after 5+ games to identify trends.

```
You are a Tic-Tac-Toe coach. I'll give you multiple game sessions. Analyze my overall play patterns and tell me:
1. My most common opening move(s)
2. My most common mistake type (missing wins, failing to block, etc.)
3. My win rate trend — am I improving?
4. One specific habit to break and one to keep

Sessions:
{{SESSION_JSON_ARRAY}}

X = me in all sessions. Board notation: 9-char string, positions 0-8.
```

---

## Prompt 4 — Fun / Narrative Mode

Use when you want an entertaining story of the game, not coaching feedback.

```
You are a sports commentator narrating a Tic-Tac-Toe match. Describe the game dramatically, move by move, as if it were the final game of a world championship. 
Be enthusiastic, use sports metaphors, and make even mundane moves sound decisive.

Game data:
{{SESSION_JSON}}

Board notation: 9-char string, positions 0-8. X = the human challenger, O = the relentless AI.
```

---

## Prompt 5 — Notion AI Analysis Template

_For use inside Notion AI (v2 feature). Add this as a Notion AI block on the Sessions database template._

```
Analyze this Tic-Tac-Toe session record. Summarize:
- Result and key turning point
- Player's strongest and weakest move
- One-line coaching tip

Session ID: {{Session ID}}
Result: {{Result}}
Move Count: {{Move Count}}
Final State: {{Final State}}
Move Log: {{Move Log}}
```

---

## Session JSON Format Reference

When pasting session data, your exported JSON will look like this:

```json
{
  "session_id": "a3f1c8b2-4e7d-4a2f-b6c1-9d3e5f7a8b2c",
  "game": "tic-tac-toe",
  "player": "Jared",
  "opponent": "AI",
  "mode": "human_vs_ai",
  "started_at": "2026-05-10T22:00:00Z",
  "ended_at": "2026-05-10T22:02:34Z",
  "duration_secs": 154,
  "result": "win",
  "move_count": 7,
  "final_state": "XOXOXOXXO",
  "move_log": [
    { "n": 1, "p": "X", "cell": 4, "state": "....X...." },
    { "n": 2, "p": "O", "cell": 0, "state": "O...X...." },
    { "n": 3, "p": "X", "cell": 2, "state": "O.XX....." },
    { "n": 4, "p": "O", "cell": 6, "state": "O.XX..O.." },
    { "n": 5, "p": "X", "cell": 1, "state": "OXXXO.O.." },
    { "n": 6, "p": "O", "cell": 5, "state": "OXXXOOO.." },
    { "n": 7, "p": "X", "cell": 8, "state": "OXXXOOOX." }
  ],
  "sync_status": "copied"
}
```

---

_Prompt version: 1.0 | Last updated: 2026-05-10 | Owner: Bob (Spec+QA)_
