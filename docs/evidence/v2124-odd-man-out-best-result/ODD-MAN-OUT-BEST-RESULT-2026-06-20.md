# WWSC v2.12.4 — Brace Odd-Man-Out: count BEST result only

**Date:** 2026-06-20/21
**Source:** Bryan Hesketh inbound 2026-06-20 (`../../../../messages/2026-06-20-Bryan-inbound-v2123-odd-man-out-best-result-special-events-edit.md`): *"If a member had to swim twice record the best result/points only."*

## Background
In a brace/relay race with an **odd** number of swimmers, `server.js` `rankRelayTeams()` / the team generator pair the leftover swimmer with an already-paired partner who then **swims twice** (`leg_order:2`) — that person is a member of **two** teams. Confirmed live (v2.12.3, Event 6 25m_brace): *Helen Sharp* was in team 48 (place 3) AND team 53 (place 6), so she appeared twice with two places, and the pointscore **summed** both teams' points.

## Rule (Bryan)
A swimmer who swims twice in the same race counts only their **best result** — the highest points (= best place) — **not the sum** of both teams.

## Fix
`src/pointscore.js` `writeEventPointscore()`: the per-(event_race, member) aggregation now takes **`Math.max`** of the row points instead of the **sum**. Single-team members are unaffected (one row). Comment + function doc updated. No other behavior changed.

## Tests
`node scripts/test-m3-pointscore-unit.cjs` → **18 PASS / 0 FAIL** (x64 clone `~/wwsc-dev/wwsc`).
New **UT15-odd-man-out-best-result-only**: member 101 in team(place 1=5pts) AND team(place 3=3pts) → scores **5** (best), not 8 (sum); members 102=5, 103=3, 104=2 unaffected.

```text
PASS UT15-odd-man-out-best-result-only  swim-twice 101 best=5 (not sum 8); 102=5,103=3,104=2 → {"101":5,"102":5,"103":3,"104":2}
=== UNIT TALLY: 18 PASS / 0 FAIL ===
```

`node --check src/pointscore.js` + test file: PASS.

## Spec
`docs/SYSTEM-SPEC-v2.12.0.md` §16 (pointscore table) + §14 (dated decisions) updated with the odd-man-out best-result rule.

## NOT in this version (awaiting Bryan's documentation)
- Special events with manual heat placement + creating a pointscore for that week ("will document and respond").
- Manual edit/input of data (corrections). Design sketched in `v2.12.4-PREP-...` (manual pointscore override + `manual_override` flag).
