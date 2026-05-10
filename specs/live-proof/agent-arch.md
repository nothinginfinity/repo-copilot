# LiveProof — Agent Architecture v0.1
_date: 2026-05-10 | author: Alice | status: draft_

---

## 1. Philosophy

LiveProof is a human-in-the-loop system. LLM agents handle everything automatable — routing, verification, reward triggers, fraud scoring. The human's role is what cannot be automated: physical presence and genuine social proof.

Follows repo-copilot agent pattern: single-responsibility agents, structured event communication, no reward issued without a verified human interaction event.

---

## 2. Agent Roster

### Presence Agent
Manages reviewer check-in/check-out lifecycle.
- Inputs: check_in, heartbeat (every 5 min), check_out events
- Outputs: reviewer_live → Match Agent, session_closed → Reward Agent, presence_alert → Trust Agent
- State: sessions/{reviewer_id}/active.json

### Match Agent
Routes customer pings to optimal available reviewer.
- Inputs: customer_ping, reviewer_live registry
- Algorithm: filter by restaurant_id + ping_type → rank by trust score, pings remaining, response time → 30s fallback
- Outputs: ping_routed, ping_failed

### Reward Agent
Triggers restaurant rewards on verified interaction close.
- Inputs: interaction_closed (with Trust Agent quality score), restaurant config
- Trigger conditions: non-empty response + type match + quality score ≥ 0.6
- Outputs: reward_issued, restaurant_charged (Stripe), reward_failed

### Trust Agent
Scores interaction quality and detects fraud.
- Scoring: response relevance (LLM), response time, reviewer history, customer rating, GPS consistency
- Fraud flags: repeated reviewer/customer pair, GPS mismatch, photo metadata mismatch, copy-paste response
- Outputs: quality_score (0.0–1.0), fraud_flag, reviewer_score_updated

---

## 3. Event Flow

```
CUSTOMER                    AGENTS                      REVIEWER
   |                           |                            |
   |--[customer_ping]--------->|                            |
   |                    [Match Agent]                       |
   |                           |--[ping_routed]----------->|
   |                           |<--[ping_response]---------|
   |<--[response delivered]----|                            |
   |              [Trust Agent scores]                      |
   |              [Reward Agent fires if score >= 0.6]      |
   |                           |--[reward_issued]---------->|
   |                           |--[restaurant_charged]----->|
```

---

## 4. Integration Points

- **POS webhook:** POST /webhook/reward — Square, Toast, Stripe Connect (v1.0); email coupon fallback
- **Embeddable widget:** script tag with data-restaurant-id; Google/Yelp require partnership
- **Reviewer PWA:** Web Push API notifications, camera + GPS access

---

## 5. Core Data Model

```json
// Session
{ "session_id": "sess_abc", "reviewer_id": "usr_xyz", "restaurant_id": "rest_123",
  "ping_limit": 5, "pings_remaining": 3, "accepted_types": ["text","photo"],
  "trust_score": 0.87, "rewards_earned": 14.00, "status": "live" }

// Interaction
{ "interaction_id": "int_def", "session_id": "sess_abc", "customer_id": "cust_789",
  "ping_type": "photo", "question": "Can you show me the pasta?",
  "response_time_seconds": 22, "quality_score": 0.91,
  "reward_amount": 7.00, "status": "closed" }
```

---

## 6. Phase Roadmap

| Phase | Focus | Agents |
|---|---|---|
| v1.0 | Text + photo, single city | Presence, Match, Reward |
| v1.1 | Video, Trust Agent full | + Trust Agent |
| v1.2 | Voice/video calls, multi-city | + Call Broker Agent |
| v2.0 | Platform embed API | + Platform Adapter Agent |
| v3.0 | White-label SDK | All agents as microservices |
