# WWSC v2.12.2 - Brace Relay Placement Fix

Date: 2026-06-17
Branch: `dev/v2.12.2-brace-relay-placement-fix`
Source: Bryan Hesketh inbound 2026-06-17, screenshot IMG_7403

## Root Cause

Brace Relay placement is assigned in `src/server.js` by `rankRelayTeams()`. For special variance races (`25m_brace`, `50m_brace`, `pogo`, `medley_relay`), the code used `Math.abs(variance)` both to order teams and to decide whether teams shared the same place.

That made teams with different recorded variances such as `-100` and `+100` share a place. In Bryan's reported shape, a winner at `0` followed by teams at `-100`, `+100`, and `+100` could be placed `1,2,2,2` instead of assigning 2nd to only the `-100` team and tying only the two identical `+100` variances.

## Fix

Ranking order still uses nearest-to-target (`Math.abs(variance)`) for special variance races. Equal placement now uses the raw recorded variance value, so only identical variance values share a place. When nearest-to-target scores match but raw variances differ, the raw variance and team id provide deterministic ordering.

Expected fixed example:

```text
variances: 0, -100, +100, +100, +150
places:    1, 2,    3,    3,    5
```

## Changed Files

- `src/server.js`
- `scripts/test-m3-pointscore-unit.cjs`
- `package.json`
- `package-lock.json`
- `src/public/index.html`
- `docs/evidence/v2122-brace-relay-placement/BRACE-RELAY-PLACEMENT-FIX-2026-06-17.md`

## Tests

Added `UT14-brace-variance-identical-tie-only` to `node scripts/test-m3-pointscore-unit.cjs`.

Raw output:

```text
PASS UT1-rule-individual  individual 5/4/3/2
PASS UT1-rule-relay  relay 5/4/3 + entry 2
PASS UT1-rule-source-labeled  source + aggregation labeled
PASS UT2-points-allocated  place 1->5, 3->3, finisher->2, no zero rows; rows=23
PASS UT3-idempotent  rows before=23 after=23
PASS UT4-no-dup-after-change  rows after change+refinalize=23 (was 23)
PASS UT5-monthly-addition  monthly total == event1+event2 for all swimmers; events=2
PASS UT6-season-addition  season total == sum of 3 events; events=3
PASS UT7-member-contribution  member total == sum of contributions=12
PASS UT8-months-list  months=2026-05,2026-04
PASS UT8-unknown-member-404  unknown member → 404
PASS UT9-unknown-racetype-individual  unknown type → individual place1=5 (rows=1, basis=individual-place)
PASS UT10-racetype-categorization  relay incl brace/pogo → relay 5/4/3; strokes → individual 5/4/3/2
PASS UT11-relay-team-543  relay/team place 1=5, 2=4, 3=3, finished non-podium=2
PASS UT12-relay-aggregation-api  relay event totals feed month+season; teams=3, rows=23
PASS UT13-breaker-shifts-place-points  {"201":2,"202":5,"203":4,"204":3,"205":2}
PASS UT14-brace-variance-identical-tie-only  variances=[0,-100,100,100,150] places=[1,2,3,3,5]

=== UNIT TALLY: 17 PASS / 0 FAIL ===
```
