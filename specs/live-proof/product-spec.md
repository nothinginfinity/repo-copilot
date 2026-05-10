# LiveProof — Product Spec v0.1
_date: 2026-05-10 | author: Alice | status: draft_

---

## 1. Overview

**LiveProof** is a real-time social proof platform that connects prospective restaurant customers with verified diners currently on-site, brokered by LLM agents. Reviewers earn rewards. Restaurants convert advertising budget into live word-of-mouth. Customers get live answers before committing.

---

## 2. Problem

Static review platforms (Yelp, Google Maps) are temporally disconnected from the current restaurant experience. A 3-year-old review tells you nothing about:
- Tonight's chef, crowd level, or noise
- Current wait time and table availability
- Whether the dish you want is actually good today

Social media (TikTok, Instagram) solves recency but not interactivity — you can't ask a TikTok video a follow-up question.

**LiveProof fills the gap: live, interactive, private, incentivized.**

---

## 3. Personas

### 3a. The Live Reviewer (Diner)
- At the restaurant right now, opted into LiveProof
- Willing to answer 1–10 pings during their meal
- Motivated by: rewards (cash, coupons, free meals), social status, altruism
- Concern: not wanting to be disrupted or share unwanted info

### 3b. The Customer (Searcher)
- Considering visiting a restaurant in the next 1–3 hours
- On Google Maps, Yelp, restaurant website, or LiveProof app
- Wants: confidence, real photos, honest current assessment
- Motivated by: making a good decision quickly

### 3c. The Restaurant (Operator)
- Has an advertising budget currently spent on static digital ads
- Wants: more foot traffic, more trust signals, lower cost-per-acquisition
- Motivated by: measurable ROI — only pays when interaction happens

---

## 4. Core User Flows

### Flow A — Reviewer Check-In
1. Reviewer opens LiveProof at restaurant
2. Geo-verification confirms location (GPS + optional QR scan at table)
3. Reviewer sets: ping limit (1–10), response types (text / photo / video / voice), topic filters
4. Status: "Live at [Restaurant]" — visible to searching customers
5. Pings arrive as push notifications; reviewer accepts or declines each
6. On session end or ping limit reached, check-out auto-triggers
7. Reward credited within 60 seconds of interaction close

### Flow B — Customer Ping
1. Customer finds restaurant on search
2. Sees "1 person live right now" badge
3. Taps → Match Agent finds best available reviewer
4. Customer types question or selects quick prompt
5. Reviewer gets notification, responds
6. Customer receives response — decides to visit or not
7. Customer optionally rates the interaction (feeds Trust Agent)

### Flow C — Restaurant Reward Trigger
1. Restaurant configures reward tiers in dashboard
2. Reward Agent monitors interaction events
3. On successful close, Reward Agent fires webhook to POS/loyalty system
4. Coupon or credit issued to reviewer instantly
5. Restaurant sees cost-per-interaction analytics in dashboard

---

## 5. Reward Model

| Interaction Type | Reviewer Earns | Restaurant Pays |
|---|---|---|
| Text response | $3–5 credit | $3–5 + 20% platform fee |
| Photo | $5–8 credit | $5–8 + 20% platform fee |
| Short video (< 30s) | $8–12 credit | $8–12 + 20% platform fee |
| Voice/video call (< 3 min) | $10–15 credit | $10–15 + 20% platform fee |

Credits redeemable as: coupon for current restaurant, cash back (Stripe Connect), or credit at any partner restaurant.

**ROI framing:** A $10 live interaction driving a $60 dinner = 6× return. CPM digital ads = $2–20/1,000 impressions with no verified intent.

---

## 6. MVP Scope (v1.0)

**In scope:**
- Reviewer PWA: check-in, ping response, reward tracking
- Customer search widget (embeddable iframe)
- Restaurant dashboard: reward config, analytics, API key
- Match Agent, Reward Agent, Presence Agent

**Out of scope (v1.0):**
- Native iOS/Android apps
- Voice/video calls (text + photo/video only)
- Third-party platform embeds (Google, Yelp)
- Multi-location chains

---

## 7. Success Metrics

| Metric | Target (90 days) |
|---|---|
| Active Live Reviewers per city | 50+ |
| Avg ping response time | < 60 seconds |
| Customer→visit conversion | ≥ 25% |
| Restaurant reward spend/month | $500+ per restaurant |
| Reviewer 30-day retention | ≥ 40% |

---

## 8. Open Questions

1. Fraud prevention — Trust Agent spec needed
2. Reviewer anonymity — anonymized profiles in v1.1
3. Restaurant onboarding — white-glove for first 10
4. Platform embeds — legal review needed
5. Cold start — "leave a question for the next reviewer" fallback
