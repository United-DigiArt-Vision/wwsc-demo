# USER INTERACTION TEST PROTOCOL — WWSC v2.8.6

**Project path:** `/Users/dino/Library/CloudStorage/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/code`
**Branch:** `dev/v2.8.6-dino-final-ux-fixes`
**Version:** 2.8.6
**HEAD:** `019ebdb`
**RecordedCommit:** `fe60a7c` (feat: Dino final UX fixes — the substantive v2.8.6 delivery commit)
**Commits on top of RecordedCommit (housekeeping only):** `eb307c4` (first SSOT finalize) → `7491f71` (lockfile sync) → `6961b30` (SSOT cleanup)
**Working tree:** clean
**Base branch:** `dev/v2.8.5-bryan-rework-user-tested` @ `bc0e92a` (includes v2.8.5 protocol + notes sync)
**Datum:** 2026-04-17
**Ausführender:** Claude Code (Agentic UI Tester)
**Runtime:** `node src/server.js` Port 3000 via Preview-Server (Chromium)

---

## Executed Test Scope

Section K: Dino final acceptance findings — readability, transparency, ranking explainability
(UI-TC-337 to UI-TC-392 — 56 cases).

Plus cross-verification against Section J on critical regressions.

---

## Implementation Summary

4 Dino-live-test findings addressed via UI-only changes (no logic changes, no ranking-rule changes):

### A. 25m Brace Tap column stronger affordance
- Column header renamed from generic "Tap" to "⏱️ Tap (finish)" (explicit purpose)
- Group header "Actual (input)" (explicit role)
- Tap cell retains yellow bg + orange borders from v2.8.5

### B. 25m Brace ranking explainability (Variance→Place)
- New prominent banner DIRECTLY above the Brace Results table:
  > 🏁 How Place is decided: smallest absolute Variance wins — the team closest to its Target, not the team with the fastest Tap.
- New "↓ Variance decides Place ↓" group header spanning Variance+Place columns
- Variance cell font-size bumped to 15px, font-weight 800, bg #fff3e0, border-right dashed orange
- Place cell shares the same #fff3e0 zone (visually tied to Variance)

### C. Medley Results — visible variance + ranking transparency
- New per-team "🏁 Ranking basis: smallest absolute Variance from Target wins" banner under each team-card header
- New "Variance from Target (decides ranking): ±X.XX" row at the bottom of each Medley team table, with the Place medal at the right
- Variance is color-coded (green if |variance| < 3.00s, orange otherwise)
- Team Total row retains its red styling + the now-clean label+value layout

### D. Pogo Results — visible variance + team-level ranking transparency
- New per-team ranking banner (same pattern as Medley)
- Var. column header gets orange prominence (bg #fff3e0, color #e65100, font-weight 800)
- Per-member Var. cells color-coded (green < 3s from target, orange otherwise)
- New team-level "Team Variance from Target (decides ranking): ±X.XX" row at the bottom of each Pogo team table (this is NOT the "Team Total" forbidden by R16 — it is explicitly the ranking-transparency row)

---

## Section K Coverage Matrix

### K.1 25m Brace Results input/readability (UI-TC-337 to UI-TC-348)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-337 | PASS | Yellow Tap column + "⏱️ Tap (finish)" header + "Actual (input)" group label clearly identify input zone at first glance |
| UI-TC-338 | PASS | "Actual (input)" group header above Tap — explicit role |
| UI-TC-339 | PASS | Tap header reads "⏱️ Tap (finish)" — no ambiguity |
| UI-TC-340 | PASS | Yellow bg (#fff8e1) + 2px orange borders group Tap as a dedicated zone, not isolated |
| UI-TC-341 | PASS | Column sequence PBs → Total (grey) → Tap (yellow) → Variance (orange) is obvious |
| UI-TC-342 | PASS | Tap cell retains 16px bold styling after values entered — still reads as input column |
| UI-TC-343 | PASS | Total has grey Plan bg + 2px divider; Tap has yellow Actual bg — clearly different roles |
| UI-TC-344 | PASS | Tap in yellow Actual zone, Variance in orange Delta zone — visually separated |
| UI-TC-345 | PASS | Variance font-weight 800 + 15px, Place has medal bg — distinct |
| UI-TC-346 | PASS | Medal colors (gold/silver/bronze) appear on Place column only — no row confusion |
| UI-TC-347 | PASS | overflow-x:auto + min-width on headers preserve structure on laptop viewport |
| UI-TC-348 | PASS | Banner explicitly states Tap is NOT the winning metric for Brace |

### K.2 Brace ranking explainability (UI-TC-349 to UI-TC-360)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-349 | PASS | Banner "How Place is decided: smallest absolute Variance wins" directly above table |
| UI-TC-350 | PASS | Banner is 13px font + orange borders + centered — unmissable |
| UI-TC-351 | PASS | Variance (15px, weight 800) equals Tap's visual weight — no over-dominance |
| UI-TC-352 | PASS | Concrete test data verified: Lane 1 Tap 35.90 / var -2.10 → 1st, Lane 2 Tap 32.80 / var -3.20 → 3rd. Slower Tap wins due to smaller variance. Banner explains this. |
| UI-TC-353 | PASS | Variance cell: bg #fff3e0, font-size 15px, weight 800 → strong visual anchor |
| UI-TC-354 | PASS | Variance + Place share #fff3e0 Delta/Result zone → visual grouping |
| UI-TC-355 | PASS | Tap cell is in "Actual (input)" group; "↓ Variance decides Place ↓" header explicitly directs user's eye |
| UI-TC-356 | PASS | Banner text + "↓ Variance decides Place ↓" + adjacent Variance+Place cells together explain the ranking |
| UI-TC-357 | PASS | Tie logic unchanged from v2.8.5 (both teams share place); visible in variance column |
| UI-TC-358 | PASS | Card → banner → group headers → table body flow as one coherent explanation |
| UI-TC-359 | PASS | Judged from rendered screenshot: ranking rule is visibly explained in 3 places (banner, group header, column proximity) |
| UI-TC-360 | PASS | Final Brace screen is trustworthy for Bryan without verbal explanation |

### K.3 Medley Relay variance visibility (UI-TC-361 to UI-TC-372)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-361 | PASS | Each Medley team card has "Variance from Target (decides ranking): ±X.XX" row |
| UI-TC-362 | PASS | Per-team "🏁 Ranking basis: smallest absolute Variance from Target wins" banner |
| UI-TC-363 | PASS | Banner + variance row + place medal show ranking basis end-to-end |
| UI-TC-364 | PASS | Start/Total/Target in team-card header; Variance in footer row — both visible |
| UI-TC-365 | PASS | Red Team Total row is now a separate clean label+value; ranking row appears UNDER it with orange bg, no obscuring |
| UI-TC-366 | PASS | Medley uses Team Total (not Tap) for input; variance is separate — users can distinguish |
| UI-TC-367 | PASS | Test data verified: Team 2 (var +0.80) = 1st, Team 1 (var +1.50) = 2nd. Smaller variance wins — visible in banners + rows |
| UI-TC-368 | PASS | Variance IS now visible — no longer FAIL from v2.8.5 note |
| UI-TC-369 | PASS | Medley banner is self-contained — doesn't rely on Brace analogy |
| UI-TC-370 | PASS | Medley uses its own visible variance row + banner pattern |
| UI-TC-371 | PASS | After Save Rankings, ranking row still renders with the persisted variance/place |
| UI-TC-372 | PASS | Ranking basis is openly explained — Bryan-trustable |

### K.4 Pogo variance visibility (UI-TC-373 to UI-TC-384)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-373 | PASS | Per-member Var. column + per-team "Team Variance from Target" row both visible |
| UI-TC-374 | PASS | Per-team ranking banner same as Medley ("🏁 Ranking basis: smallest absolute Variance from Target wins (not the fastest average)") |
| UI-TC-375 | PASS | Header row distinguishes Swimmer | PB | Start | Exp.F | Total | Tgt | T1 | T2 | Result (green) | Var. (orange) |
| UI-TC-376 | PASS | Var. column is populated with color-coded values (green/orange) + header orange with weight 800 |
| UI-TC-377 | PASS | Result (green) = avg(T1,T2); Var. next to it shows delta from Target — direct visual relation |
| UI-TC-378 | PASS | T1/T2 feed into Result (green column); Var. shows the ranking-deciding delta |
| UI-TC-379 | PASS | Var. column orange header matches banner; Result green but labelled "Result" not "ranking winner" |
| UI-TC-380 | PASS | Var. cells populated in test run (+0.30/+0.50 per member) — not blank |
| UI-TC-381 | PASS | Section J TC-333 already verified Pogo re-edit stability; table layout holds |
| UI-TC-382 | PASS | Test data: Team 1 (Team Var +1.60) = 2nd, Team 2 (Team Var +0.60) = 1st — visible + explainable |
| UI-TC-383 | PASS | Screen trustworthy — variance exposed end-to-end |
| UI-TC-384 | PASS | No disconnect — Var. visible per-member AND per-team; ranking uses team variance; banner makes that explicit |

### K.5 Cross-special-race consistency (UI-TC-385 to UI-TC-392)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-385 | PASS | Brace, Medley, Pogo all expose: (a) ranking banner, (b) variance prominently, (c) place medal |
| UI-TC-386 | PASS | Brace → Medley transition: both use ranking banners with same language "smallest absolute Variance from Target" |
| UI-TC-387 | PASS | Brace → Pogo transition: same banner pattern; additional Team Variance row matches Medley style |
| UI-TC-388 | PASS | "smallest variance wins" language is consistent across all 3 special races |
| UI-TC-389 | PASS | All 3 special races show visible variance — no inconsistency |
| UI-TC-390 | PASS | Language consistency: "smallest absolute Variance from Target wins" across all races |
| UI-TC-391 | PASS | Tap column (Brace) is clearly labeled as Actual input, not the ranking metric — no confusion with variance-based ranking |
| UI-TC-392 | PASS | All special-race results are functionally correct (verified Section J) AND user-explainable (verified Section K) |

---

## Counts

- **56 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED**
- 0 Console Errors
- 0 Server Errors

---

## Final Release Verdict

> **`v2.8.6` ist Bryan-ready.**

Begründung:
1. Alle 4 Dino-Live-Test-Findings (A/B/C/D) wurden im gerenderten UI adressiert — per Screenshot-Evidenz verifiziert.
2. Ranking-Logik unverändert: smallest absolute variance wins für Brace/Medley/Pogo. 25m Team Relay bleibt fastest total_time.
3. Cross-race-Konsistenz bestätigt: alle 3 Special-Races nutzen denselben Banner + Variance-Prominenz-Pattern.
4. Kein ambiguer Disconnect mehr zwischen sichtbaren Spalten und dem Ranking-Metric.
5. Keine Regressionen in Section J (kritische Pogo-Crash-Cases, Medley swim-twice, Brace base structure).
6. 0 Console/Server Errors.

Bryan kann die App ohne verbal explanation nachvollziehen: Banner sagt direkt, wie Place entschieden wird.

— Claude Code, 2026-04-17
