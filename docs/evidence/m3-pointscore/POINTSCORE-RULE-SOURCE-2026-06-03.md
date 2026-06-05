# WWSC Pointscore Rule — Source-Labeled Working Artifact

**Date:** 2026-06-03
**Updated:** 2026-06-05 for Bryan's relay/team point clarification.
**Source:** `bryan-excel-original.xlsm` pointscore sheets + `Instructions` sheet.
**Status:** WORKING ASSUMPTION derived from the spreadsheet, with Bryan's 2026-06-05 clarification that Relay/Team events use 5/4/3. **NOT a confirmed full Constitution rule.** Adjustable via the centralized rule config in `src/pointscore.js`.

> Balerion guardrail wording: "working assumptions sent to Bryan", not "Bryan confirmed final Constitution rules." Bryan's 2026-06-02 message confirmed the *aggregation* model (event-separated, monthly/season by simple addition) and that the Excel sheets are the working scoring source. Bryan's 2026-06-05 follow-up clarified the Relay/Team event scale as 5/4/3. The values below are isolated + adjustable.

## 1. How the Excel encodes pointscore (extracted facts)

- There is one pointscore sheet per race category: `25m Point score`, `50m Point score`, `75m Point score`, `Backstroke Pointscore`, `Breaststroke Pointscore`, `Butterfly Pointscore`, `Relay Point score`, `25m Brace Pointscore`, `50m Brace Pointscore`, `Medley Relay Pointscore`, plus a `Total Pointscore` roll-up.
- Layout per sheet: **rows = swimmers, columns = events (by date)**, cell = points that swimmer earned at that event. Column B is `=TODAY()` (the in-progress week, blank), column C onward are dated past events.
- `Total Pointscore` row 8 header: `Name | 25m | 50m | 75m | Backstroke | BreastStroke | Butterfly | 25m Brace | 50m Brace | Medley relay | Total`. The Total column is the **simple sum across all race categories** (verified: e.g. Ben Capaan `4+3+0+5+0+0+0+0+0 = 12`, Glenne O'Connell `5+5+0+2 = 12`).
- `Instructions` sheet, rows 12 / 37 / 38: *"It will calculate placing, breakers and pointscores"*, *"It obtains the scores for each swimmer from the heats worksheets"*, *"hit the 'Insert this weeks Results' button and it will enter the points for that event for each swimmer."* → **points are derived from race placing**, computed per event, then accumulated.
- `Instructions` rows 20 / 22: Medley Relay placing is by *variance from team time*; Brace relays are *overall Nearest-to-Time* (not per-heat). This matches the app's existing accepted ranking (smallest-variance-wins for Brace/Medley; per-heat place for individual races).
- `Requirements` row 5: *"Once entrant 'breaks' it allocates more point to other entrants"* — a documented club rule that exists but whose exact mechanics are not specified numerically in the sheet. **Flagged as adjustable; not implemented in this slice** (documented as an open Constitution-level detail).

## 2. Observed point-value distribution (raw evidence)

From `docs/evidence/m3-pointscore/pointscore-distribution-summary.json` (computed from the actual cell values):

| Sheet | Distinct point values | Distribution |
|---|---|---|
| 25m Point score | 2, 3, 4, 5 | 2×3, 3×2, 4×3, 5×3 |
| 50m Point score | 2, 3, 4, 5 | 2×7, 3×7, 4×8, 5×8 |
| Backstroke Pointscore | 2, 3, 4, 5 | 2×9, 3×1, 4×1, 5×1 |
| Medley Relay Pointscore | 2, 3, 4, 5 | mixed |
| Relay Point score | 1, 2, 3 | 1×6, 2×8, 3×9 |

**Interpretation (working assumption):**
- **Individual races** (25m / 50m / 75m / Backstroke / Breaststroke / Butterfly) use a **place-based 5 / 4 / 3 / 2** scale: 1st = 5, 2nd = 4, 3rd = 3, every other finisher = 2.
  - Backstroke (an *optional* event, 1 heat): 3 placed swimmers get 5/4/3, the other 9 finishers get 2. ✔ matches `2×9, 3×1, 4×1, 5×1`.
  - 50m (everyone swims, many heats): each heat awards its own 1st/2nd/3rd, so many 5s/4s/3s plus 2s. ✔ matches the even spread.
- **Relay / team races** use a **place-based 5 / 4 / 3** scale per Bryan's 2026-06-05 clarification: 1st = 5, 2nd = 4, 3rd = 3.
  - Note: the raw `Relay Point score` sheet distribution above showed {1, 2, 3}; Bryan's later clarification supersedes the original inferred working assumption for app scoring.
- **Brace / Medley** placings are overall (variance-based) — already computed by the accepted ranking; the same individual or team scale is applied to that overall place.

## 3. Centralized working-assumption rule (what the engine implements)

Implemented in `src/pointscore.js` as an adjustable `POINTSCORE_RULES` config:

```
INDIVIDUAL (25m, 50m, 75m, backstroke, breaststroke, butterfly):
  place 1 → 5
  place 2 → 4
  place 3 → 3
  any other finisher (has a finish time) → 2
  did not finish / absent → 0 (no row)

RELAY / TEAM (25m_relay, medley_relay, 25m_brace, 50m_brace, pogo):
  place 1 → 5
  place 2 → 4
  place 3 → 3
  other finishing teams/pairs → 0
```

- "place" = the app's already-accepted place: per-heat `place`/`manual_place` for individual races; overall variance-based place for Brace/Medley/Pogo; fastest-total place for 25m Team Relay.
- The engine **reads** these accepted place values and **only writes** to `pointscore_entry`. It never recomputes variance, place, breaker, or ranking.
- All numbers above live in one config object and can be replaced wholesale when Bryan sends the Constitution, without touching any accepted M1/M2 logic.

## 4. Explicitly deferred (adjustable, not in this slice)

- The `Requirements` row-5 "break reallocation" rule (extra points redistributed when someone breaks a record) — numerically unspecified. Documented as an open Constitution detail.
- PB-break bonus / attendance points — the Excel has separate `Total Improvement` and `Attendance` sheets that are **not** summed into `Total Pointscore` (verified: Total = sum of the per-race pointscore columns only). So **no PB-bonus and no attendance points** in the pointscore total under this working assumption.
- Tie-breaking beyond "equal points, then name" — not specified by Bryan; the standings use points-desc then name-asc as a documented working default.
- Season boundary date range — Bryan said monthly + season totals by simple addition but did not define the season's start/end. Working default: **season = calendar year**; month = calendar month. Both adjustable and shown in the UI as the current working default.

## 5. Manual expected-results basis

The fixture tests derive expected points by applying section 3's rule to seeded place values. The manual expected sheets live at `docs/evidence/m3-user-interaction-v3.0.1/manual-expected-*.json`, produced by the same rule config, so the test asserts the engine matches the documented rule (not a hand-typed magic number).
