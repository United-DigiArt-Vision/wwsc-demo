# CHANGELOG (Codebasis)

## Entry Template
- **Date:** YYYY-MM-DD
- **Timestamp:** YYYY-MM-DD HH:MM:SS
- **App Version (from package.json):** X.Y.Z
- **Branch:** branch-name
- **RecordedCommit:** abc1234
- **Editor:** Name
- **Changes:** Kurzbeschreibung der Änderung

---

## 2026-04-18 — release: v2.8.8 live deployment on Render
- **Timestamp:** 2026-04-18 18:45:48
- **App Version (from package.json):** 2.8.8
- **Branch:** main
- **RecordedCommit:** 497f78d
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `main`
- **Editor:** Balerion
- **Changes:**
  - `main` in `~/wwsc-demo` was fast-forwarded from live base `642e52d` (`v2.8.3`) to the Dropbox-delivered v2.8.8 branch tip and prepared for GitHub push / Render auto-deploy.
  - Release basis for all future Bryan follow-up on this version is now `package.json=2.8.8` + `RecordedCommit=497f78d` + live repo `main`.
  - Cumulative live delivery now includes the v2.8.4–v2.8.8 workstream: Bryan follow-up corrections (R21–R26), v2.8.5 rework + user-tested UI corrections, v2.8.6 final UX/transparency fixes, v2.8.7 manual team management for eligible relays, and v2.8.8 final special-race/results readability fixes.
  - `STABLE.md`, `CLAUDE.md`, and `PROGRESS.md` were updated to reflect that v2.8.8 is now the active live baseline awaiting Bryan feedback.
  - Bryan-facing continuity artifacts recorded locally in `messages/2026-04-18-outgoing-to-bryan-v288-live.md` and `messages/2026-04-18-current-state-after-v288-live.md`.

## 2026-04-18 — feat: v2.8.8 iteration 7 (Pogo Heat Builder — mirror Pogo Results columns)
- **Timestamp:** 2026-04-18 13:15:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 497f78d
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 7 was needed:** Dino asked for the Pogo Heat Builder to expose the same plan columns the Pogo Results screen already shows, minus the result-entry fields (T1 / T2 / Result / Variance). Before: `Leg | Swimmer | PB`. The team-level Start Delay, expected-finish per swimmer, PB-sum, and Target were only encoded in the card header text. Aligning Heat Builder with Results gives the user the full plan up front in the same shape they will see during time entry.
- **Changes (Pogo Heat Builder display-only — no ranking logic, data model, or API change):**
  - `src/public/js/screens/heat-builder.js` (`renderRelayTeamsInHB`):
    * Row template appends four extra `<td>` cells when `isPogo`: `Start` (team.start_delay), `Exp.F` (member_pb + start_delay), `Total` (team.target_time), `Target` (team.target_time + team.start_delay).
    * Thead template appends `Start / Exp.F / Total / Target` headers only for Pogo.
  - Medley / 25m Team Relay / Brace / individual-race headers and rows unchanged.
- **Scope:** Pogo only — other relay race types continue to render as before.
- **Browser-verified on the Preview (Pogo generate teams, 4 swimmers):**
  * Header: `Leg | Swimmer | PB | Start | Exp.F | Total | Target` — 7 discrete titles.
  * Team 1: Bryan (PB 13, Exp.F 15), Ben (14, 16), Felicia (16, 18), Andrew (16, 18) — all rows show team Total 59 and Target 61 with per-team Start Delay 2s.
  * Team header text still shows "Start Delay: 2s • Total: 59 • Target: 61".
  * 0 console errors.

## 2026-04-18 — feat: v2.8.8 iteration 6 (Brace Results — add Target column)
- **Timestamp:** 2026-04-18 12:45:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 0368840
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 6 was needed:** Dino asked whether the Brace Results table should expose a Target column right of Total. Fachlich yes — Target = Total + Start Delay is exactly the value the Variance column measures Tap against. Without a visible Target, the user has to add "+ 2s" in their head to audit the ranking math from the table alone. This is also the shape R7 (Bryan's original spec) already defined.
- **Changes (Brace Results display-only — no ranking logic, data model or API change):**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead + row template):
    * Header row now has 8 columns: `Lane | Pair | PBs | Total | Target | ⏱️ Tap (finish) | Variance | Place`.
    * Row template renders `formatWhole(target_time + start_delay)` for the Target cell. The right border of the "Plan" zone moved from the Total cell onto the new Target cell so the Plan/Actual visual divider still lands in the same place.
  - Target values are derived from existing `team.target_time` + `team.start_delay` — already computed server-side, no new field.
- **Scope:** same `renderBraceResultsInline` code path, covers both `25m_brace` and `50m_brace`. No other race type touched.
- **Browser-verified on the Preview (50m Brace):**
  * 8-column header renders cleanly: `Lane | Pair | PBs | Total | Target | ⏱️ Tap (finish) | Variance | Place`.
  * Target cells render correctly: Total 81 → Target 83 (Start=2s), 82→84, 83→85.
  * 25m Brace shares the same code path → identical rendering.
  * 0 console errors.

## 2026-04-18 — fix: v2.8.8 iteration 5 ((Y) marker reflects current attendance, not stale auto flag)
- **Timestamp:** 2026-04-18 12:15:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** ddabb81
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 5 was needed:** Dino found Glenne Murray rendered as `Back (Y)` in the Medley Heat Builder, even though her Times Sheet entry was explicitly `Back`. Root cause: the client rendered `(Y)` based on `m.auto === true`, a flag captured at team-generation time. The server's leftover-team branch (`server.js:1417`) forces `auto: true` on every leftover swimmer, regardless of whether they were a real wildcard (`special_event_entry='Y'`) or just a Backstroker who didn't fit into a complete team. Once that stale flag is on the client, later Times Sheet edits don't clear it, so the UI keeps showing `(Y)` on a swimmer who is no longer a wildcard.
- **Changes (3 client-side files, consistent fix — no server / schema / API changes):**
  - `src/public/js/screens/heat-builder.js`: look up the attendee in `hbAttendance` by `member_id` and show `(Y)` only if `attendee.special_event_entry === 'Y'`.
  - `src/public/js/screens/results.js`: use `m.special_event_entry === 'Y'` (already joined into the `/relay-teams` payload by `GET /api/races/:raceId/relay-teams` via the attendance JOIN at `server.js:1517`).
  - `src/public/js/screens/relays.js`: same change for the legacy relay screen.
- **Race-type audit:** `(Y)` rendering exists only for Medley (Brace / 25m Team Relay / Pogo have no stroke column). Grep across all screens confirmed the three Medley stroke-cell code paths were the only call-sites; all three now read from the current attendance entry.
- **Browser-verified on the Preview:**
  1. 7 Medley-eligible swimmers, all with explicit Back/Breast/Free in the Times Sheet. All 7 stroke cells rendered plain (`Back` / `Breast` / `Free`) — zero `(Y)` markers.
  2. Then set Glenne Murray to `special_event_entry='Y'` and re-shuffle. Glenne's cell correctly rendered `Back (Y)`; the other 6 stroke cells remained unmarked. Screenshot captured.
- **Scope:** same branch as v2.8.8 R28 work. Version number stays 2.8.8. No ranking/schema/API changes.

## 2026-04-18 — fix: v2.8.8 R28 iteration 4 (header contrast fix — titles legible)
- **Timestamp:** 2026-04-18 11:30:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** bea39db
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why iteration 4 was needed:** In iteration 3 the header row went flat (single row), but the Tap (finish) / Variance / Place `<th>` cells kept their yellow/orange accent backgrounds (`#fff8e1` / `#fff3e0`). The spreadsheet-table stylesheet renders `<thead>` text in white. Result: those three titles rendered as white-on-pale-yellow and were effectively invisible — Dino correctly perceived "keinen titel" on those columns.
- **Changes:**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): drop the pale accent backgrounds from the `<th>` cells. Header row is now uniform teal (rgb(0,128,128)) with white titles across all seven columns (`Lane | Pair | PBs | Total | ⏱️ Tap (finish) | Variance | Place`). The accent colors (yellow for Tap, orange for Variance, place-medal colors for Place) stay in the `<td>` data cells — the visual grouping on the values is preserved where it matters, without breaking title readability.
  - `version/CURRENT_STATE.md`: RecordedCommit pointer moved `474d063` → `bea39db`.
- **Browser re-verified on the Preview server (v2.8.8):** `getComputedStyle` on every header cell returned `background: rgb(0, 128, 128)` and `color: rgb(255, 255, 255)` — uniform contrast across all 7 titles. Screenshot taken as evidence. 0 console errors.
- **Scope unchanged:** same `renderBraceResultsInline` tableHead, covers both 25m_brace and 50m_brace. No ranking/schema/API/print changes.

## 2026-04-18 — fix: v2.8.8 R28 iteration 3 (flat single-row header) — superseded by iteration 4
- **Timestamp:** 2026-04-18 11:00:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 474d063
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why a third iteration was needed:** Dino live-rejected iteration 2 (Team group header). He read the row-1 labels `Team / Plan (target) / Actual (input) / ↓ Variance decides Place ↓` as explanatory sentences, not as discrete column titles. In particular the `↓ Variance decides Place ↓` phrase read like a help text, so the Variance and Place columns below it still felt untitled from a user perspective.
- **Changes:**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): drop the group row entirely. Final header is a single row with one discrete title per column: `Lane | Pair | PBs | Total | ⏱️ Tap (finish) | Variance | Place`. No empty zones, no asymmetric groups, no labels that can be misread as sentences.
  - R24-v2 grouped layout (`Plan / Actual / Variance decides Place`) is dropped. The R26 ranking banner above the table continues to state "How Place is decided: smallest absolute Variance wins", so the ranking basis remains explicit.
  - `version/CURRENT_STATE.md`: RecordedCommit pointer moved `d103c44` → `474d063`.
- **Browser re-verified on the Preview server (v2.8.8):** single header row with 7 discrete labels (verified via DOM inspection + screenshot). 0 console errors. R26 banner intact.
- **Scope unchanged:** same `renderBraceResultsInline` tableHead, covers both 25m_brace and 50m_brace. No ranking/schema/API/print changes.

## 2026-04-18 — fix: v2.8.8 R28 follow-up (Team group header over Lane+Pair) — superseded by iteration 3
- **Timestamp:** 2026-04-18 10:30:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** d103c44
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Why a follow-up was needed:** Dino live-re-tested the first R28 iteration (`3de4265`, rowspan="2" on Lane+Pair) and reported the fix was not enough: promoting Lane + Pair into the top row left the two cells in the bottom row below them empty, so the sub-header row then read as if two columns had no title. The asymmetric "untitled zone" had simply moved from the top row into the bottom row.
- **Changes:**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): replace the rowspan="2" approach with a symmetric 2-row grouping.
    - Row 1 (groups): `Team {cs=2}` | `Plan (target) {cs=2}` | `Actual (input)` | `↓ Variance decides Place ↓ {cs=2}`
    - Row 2 (columns): `Lane` | `Pair` | `PBs` | `Total` | `⏱️ Tap (finish)` | `Variance` | `Place`
    - Every cell in both rows now carries a non-empty meaningful label.
  - `USER-INTERACTION-TEST-SPEC.md` Section M: UI-TC-459 and UI-TC-463 updated to describe the final Team-group structure (no rowspan).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.8.md`: M.2 row updated, Addendum added documenting the superseded first iteration and why it was replaced.
  - `version/CURRENT_STATE.md`: RecordedCommit pointer moved from `3de4265` to `d103c44`.
- **Browser re-verified:** post-follow-up DOM inspection confirms 0 empty cells in either row; screenshot shows full symmetric header on 25m Brace. 50m Brace uses the same code path. 0 console errors.
- **Scope unchanged:** same 25m_brace + 50m_brace tableHead. No other surface changed. No ranking/schema/API changes.

## 2026-04-18 — feat: v2.8.8 R28 Brace Results header completeness (superseded by follow-up fix)
- **Timestamp:** 2026-04-18 09:45:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 3de4265
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.8-header-completeness-audit`
- **Editor:** Claude Code
- **Changes (R28 — UX/readability only, no ranking or schema changes):**
  - `src/public/js/screens/results.js` (`renderBraceResultsInline` tableHead): Lane and Pair are no longer sitting under two empty `<th>` cells. They are hoisted into the top header row via `rowspan="2"` with `vertical-align:middle`. The two empty cells are removed and the second row now only lists the columns that belong to the group headers (PBs, Total, Tap, Variance, Place). Every top-row cell now carries a non-empty, meaningful label — the left side of the table no longer reads as a forgotten/untitled zone.
  - `REQUIREMENTS.md`: R28 added (authored by Balerion in the handoff) — delivered as implementation baseline.
  - `USER-INTERACTION-TEST-SPEC.md`: new Section M (UI-TC-451..UI-TC-476, 26 cases across pre-fix perception, post-fix completeness, per-race audit, regression guardrails).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.8.md`: new protocol; 26 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED; V0006-conform (pre-fix reproduction in the rendered UI → fix → post-fix re-verification in the rendered UI).
  - **Per-race audit conclusion:** grouped-header-over-empty-cells existed ONLY in Brace Results tableHead. Medley / 25m Team Relay / Pogo / individual heats use flat single-row theads and are left unchanged. Heat Builder uses flat theads everywhere, also unchanged.
  - Browser-verified on Chromium port 3000:
    * Pre-fix: DOM inspection returned 2 `<th>` cells with empty text over Lane + Pair for 25m Brace; 50m Brace shares the same code path and same failure shape.
    * Post-fix: all top-row cells carry non-empty labels; Lane/Pair rowspan="2"; Plan (target) colspan="2"; Actual (input) colspan="1"; ↓ Variance decides Place ↓ colspan="2".
    * R26 banner + group structure intact. R27 Heat Builder surfaces (Add/Remove Team / Unassigned pool / Ranking-rule banner) intact.
    * 0 console errors.

## 2026-04-18 — chore: v2.8.8 version bump (first commit on branch)
- **Timestamp:** 2026-04-18 09:10:00
- **App Version (from package.json):** 2.8.8
- **Branch:** dev/v2.8.8-header-completeness-audit
- **RecordedCommit:** 871b340
- **Editor:** Claude Code
- **Changes (V0014 first-commit rule — version bump only):**
  - `package.json`: 2.8.7 → 2.8.8
  - `package-lock.json`: 2.8.7 → 2.8.8
  - `src/public/index.html`: cache-bust `?v=2.8.7` → `?v=2.8.8` (17 tags)

---

## 2026-04-17 — feat: v2.8.7 R27 manual team management for eligible relay races
- **Timestamp:** 2026-04-17 22:15:00
- **App Version (from package.json):** 2.8.7
- **Branch:** dev/v2.8.7-manual-team-management
- **RecordedCommit:** e2fd553
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.7-manual-team-management`
- **Editor:** Claude Code
- **Changes (R27 only — no ranking-logic or schema changes):**
  - `src/public/js/screens/heat-builder.js`: New R27 UI for pre-confirm eligible races (medley_relay, 25m_relay).
    - New helpers: `R27_ELIGIBLE_RACES`, `isR27EligibleRace`, `getRequiredLegs`, `getTeamCompleteness`, `countCompleteTeams`, `getUnassignedSwimmers`.
    - `renderRelayContent`: ranking-rule banner (blue info / orange at 0 or 1 complete), unassigned-swimmers card with pills, trailing `➕ Add Team` button.
    - `renderRelayTeamsInHB`: per-team `manual` pill badge, `✓ complete` / `⚠️ needs N more` / `🕳 empty` completeness badge, `✕ Remove Team` control (is_manual only).
    - `hbAddTeam()`: creates new empty team with `is_manual:true`; re-runs `recalcRelayTeam` for start-delay/max-time consistency.
    - `hbRemoveTeam(teamIndex)`: guarded to `is_manual` teams only; confirm() prompt; swimmers return to unassigned pool; remaining teams renumbered 1..N.
  - `src/public/js/screens/results.js`: New R27 rankability banner in `renderRelayResultsInline` for eligible races. 0 complete → orange "No complete teams". 1 complete → orange "Only 1 complete team — no real competition." ≥2 complete + incomplete → blue "X/Y teams complete".
  - `src/server.js`: `POST /api/races/:raceId/save-relay-teams` drops teams with 0 members before persisting; renumbers team_number after filtering. Partially filled manual teams still persist and render as not-rankable for the user.
  - `REQUIREMENTS.md`: R27 delivered (was authored by Balerion as part of the handoff).
  - `USER-INTERACTION-TEST-SPEC.md`: Section L added (UI-TC-393..UI-TC-450, 58 cases across L.1 Eligibility gating, L.2 Add-team flow, L.3 Assign swimmers, L.4 Remove-team flow, L.5 Unassigned pool, L.6 Completeness/rankability, L.7 Results rankability, L.8 Regression guardrails).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.7.md`: new protocol with 58 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED, browser-evidence per test case.
  - Browser-verified on Chromium (preview server, port 3000) end-to-end:
    * Medley (9 Y-swimmers): Add Team → empty manual Team 4 with pill/badge/Remove; add swimmer flow works; remove brings swimmer back to pool.
    * 25m Team Relay (23 swimmers): same flow; `needs 3 more swimmers` label rendered correctly.
    * Brace / Pogo: no R27 UI (gated correctly).
    * Post-confirm: all R27 surfaces hidden.
    * Empty-team filter: 1 empty + 3 filled teams → DB persists 3.
    * Results "Only 1 complete team — no real competition." banner rendered correctly on 1 complete + 2 incomplete Medley teams.
    * 0 console errors.

## 2026-04-17 — chore: v2.8.7 version bump (first commit on branch)
- **Timestamp:** 2026-04-17 21:45:00
- **App Version (from package.json):** 2.8.7
- **Branch:** dev/v2.8.7-manual-team-management
- **RecordedCommit:** 7b6bc9d
- **Editor:** Claude Code
- **Changes (V0014 first-commit rule — version bump only):**
  - `package.json`: 2.8.6 → 2.8.7
  - `package-lock.json`: 2.8.6 → 2.8.7
  - `src/public/index.html`: cache-bust `?v=2.8.6` → `?v=2.8.7` (17 tags)

---

## 2026-04-17 — chore: v2.8.6 SSOT cleanup (no delivery change)
- **Timestamp:** 2026-04-17 21:30:00
- **App Version (from package.json):** 2.8.6
- **Branch:** dev/v2.8.6-dino-final-ux-fixes
- **RecordedCommit:** fe60a7c
- **Current branch tip:** dynamic — `git rev-parse --short HEAD` on `dev/v2.8.6-dino-final-ux-fixes`
- **Editor:** Claude Code
- **Convention:** `RecordedCommit` = substantive delivery commit (the feature commit). Static HEAD hashes are NOT stored in versioned artifacts; resolve the current branch tip dynamically via `git rev-parse`.
- **Changes (all housekeeping, no delivery impact):**
  - `package-lock.json` version bumped 2.7.0 → 2.8.6 (was stale after `npm rebuild better-sqlite3`; synced to match package.json).
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.6.md`: header reworked to reference RecordedCommit only; current branch tip resolved dynamically.
  - `version/CURRENT_STATE.md`: static HEAD value removed; adopts dynamic `git rev-parse` resolution.

## 2026-04-17 — feat: v2.8.6 Dino final UX fixes (R24-v3 + ranking transparency)
- **Timestamp:** 2026-04-17 16:45:00
- **App Version (from package.json):** 2.8.6
- **Branch:** dev/v2.8.6-dino-final-ux-fixes
- **RecordedCommit:** fe60a7c
- **Editor:** Claude Code
- **Changes (4 Dino-live-test findings addressed via UI-only changes):**
  - A) 25m Brace Tap column: explicit "⏱️ Tap (finish)" header + "Actual (input)" group label; column min-width bumped; yellow Actual zone preserved.
  - B) 25m Brace ranking explainability: new prominent orange banner directly above the table "🏁 How Place is decided: smallest absolute Variance wins — the team closest to its Target, not the team with the fastest Tap." Group header "↓ Variance decides Place ↓" spans Variance+Place. Variance cell promoted to font-size 15px + weight 800 + bg #fff3e0. Place cell shares #fff3e0 zone.
  - C) Medley Relay variance visibility: per-team "🏁 Ranking basis" banner; new "Variance from Target (decides ranking): ±X.XX [place]" row under each Medley team table with color-coded variance + medal Place cell. Team Total row cleaned up to label+value only.
  - D) Pogo variance visibility: per-team ranking banner; Var. column header orange + bold; per-member Var. cells color-coded (green/orange); new "Team Variance from Target (decides ranking): ±X.XX [place]" row at bottom of each Pogo team table.
  - No ranking-logic changes — smallest variance wins rule unchanged for Brace/Medley/Pogo; 25m Team Relay still fastest total_time.
  - USER-INTERACTION-TEST-PROTOCOL-v2.8.6.md: Section K (UI-TC-337..TC-392) executed, 56 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED.
  - Browser-verified: Brace Dino scenario (Tap 33.90/var -2.10 = 1st; Tap 33.70/var -3.30 = 4th) rendered with banner + prominent Variance. Medley + Pogo ranking-transparency rows visible with explicit labels.

## 2026-04-15 — feat: v2.8.5 Rework after Dino live test (R21-v2, R24-v2, R25, R26)
- **Timestamp:** 2026-04-15 22:00:00
- **App Version (from package.json):** 2.8.5
- **Branch:** dev/v2.8.5-bryan-rework-user-tested
- **RecordedCommit:** 6b30f1a
- **Editor:** Claude Code
- **Changes (addressing Dino-live-test findings):**
  - R21-v2 (Medley swim-twice stroke — ACTUALLY FIXED): new explicit "Swim as:" Stroke-Picker in the swim-twice row. User must pick swimmer AND stroke before clicking. No hidden default to swimmer's historical stroke. Missing strokes get "(missing)" label. Pre-selects first missing stroke; freely overridable. hbAddSwimTwice reads the explicit picker value.
  - R24-v2 (Results layout — ACTUALLY GROUPED): Brace Results now has 2-row header with group labels "Plan | Actual | Delta | Result". Column groups visually separated via background colors (grey for Plan, yellow for Tap, color-coded Variance) and 2px borders. Tap cell prominently styled as button-like interactive target.
  - R25 (Print audit — ALL SURFACES): `.print-hide` class now applied across Heat Builder (swim-twice row, leftover banner, status cards, empty-state prompts), Results (Event Finalized/Completed banners), Breaker Report, Relays, Event Report. Operational text hidden; race data preserved.
  - R26 (Meta-rule): user-facing revalidation as hard gate — code-only evidence no longer counts as done.
  - REQUIREMENTS.md: R21-v2, R24-v2, R25, R26 added with user-flow acceptance criteria.
  - USER-INTERACTION-TEST-SPEC.md: Section I added with UI-TC-187 to UI-TC-291 (105 new test cases across Medley swim-twice, correction/replacement, 25m Relay explicit, Results layout, Print audit, Ranking, regressions).
  - Browser-verified end-to-end: Bryan (swam Back in Team 1) correctly assigned to Breast via explicit picker in Team 2; Remove/re-add cycle clean; Results table shows 2-row grouped header; no console errors.

## 2026-04-15 — feat: Bryan Follow-up Corrections (v2.8.4, R20+R21+R22+R23+R24)
- **Timestamp:** 2026-04-15 20:30:00
- **App Version (from package.json):** 2.8.4
- **Branch:** dev/v2.8.4-bryan-followup-special-races
- **RecordedCommit:** f5e4c3b
- **Editor:** Claude Code
- **Changes (6 Bryan corrections):**
  - Fix 1+2 (R21): Medley swim-twice stroke now editable + removable. New hbChangeSwimTwiceStroke / hbRemoveSwimTwice. hbAddSwimTwice prefers missing stroke instead of historical.
  - Fix 3 (R23): Print cleanup — new `.print-hide` CSS class applied to "(Y) explanation", "All X races ready", "X/Y races confirmed", "Event Finalized/Completed" banners.
  - Fix 4 (R22): 25m Team Relay undersized teams get `needs_swim_twice_completion: true` + orange banner + explicit swim-twice dropdown across all attendees.
  - Fix 5 (R24): Brace Results table compacted to Lane | Pair | PBs | Total | Tap | Variance | Place. Start/Target moved into card header.
  - Fix 6 (R20): Ranking for 25m brace, 50m brace, Pogo, Medley → smallest |variance| wins. 25m Team Relay unchanged. New rankRelayTeams helper used in 3 call sites. UI text "fastest finish wins" → "smallest variance wins".
  - Browser-verified end-to-end: Medley 4-swimmer flow (banner + stroke-edit + remove), Brace ranking with +100/-300/+500 variances → 1st/2nd/3rd by |var|, 11-swimmer 25m Team Relay undersized banner, Brace Results new column order.

## 2026-04-15 — feat: Medley Leftover Swim-Twice Flow (v2.8.3, R18)
- **Timestamp:** 2026-04-15 08:00:00
- **App Version (from package.json):** 2.8.3
- **Branch:** dev/v2.8.3-medley-leftover-swim-twice
- **RecordedCommit:** 8192cd9
- **Editor:** Claude Code
- **Changes:**
  - server.js: Medley leftover handling — 1–2 Restschwimmer erzeugen jetzt ein partielles Team mit `needs_swim_twice_completion: true` statt verworfen zu werden
  - heat-builder.js: Oranger Banner "⚠️ Leftover team — incomplete" mit fehlenden Strokes; Banner verschwindet sobald alle 3 Strokes besetzt sind
  - heat-builder.js: "+ Swim Twice" Label für Leftover-Teams (klarer als "+ Add Swimmer")
  - REQUIREMENTS.md R18 von 🟡 offen auf 🟢 Bryan-bestätigt
  - USER-INTERACTION-TEST-SPEC.md UI-TC-158 aktualisiert + neue UI-TC-169 bis UI-TC-176 (Section G)
  - PROGRESS.md Phase 8 aktualisiert
  - Browser-verifiziert: 4 Y-swimmers → 1 Team + 1 Leftover-Team mit Banner → Swim-Twice 2× → Banner weg → Confirm → Persistenz mit Duplikat-member_ids

## 2026-04-14 — fix: Heat Builder print fits one page (v2.8.2)
- **Timestamp:** 2026-04-14 13:45:00
- **App Version (from package.json):** 2.8.2
- **Branch:** main
- **RecordedCommit:** 5f0d6be
- **Editor:** Claude Code
- **Changes:**
  - style.css: Overhauled @media print rules for one-page fit
  - Root cause: 6 heats × ~175px = ~1050px exceeded A4 printable area (~1023px)
  - Fix: @page margin 8mm, reduced cell padding (2px 4px), font 10px, card margin 4px, border 1px, line-height 1.2
  - Result: total print height 819px — fits comfortably on A4 (1063px printable)
  - Browser print-preview verified: all 6 heats on one page, readable B/W

## 2026-04-14 — feat: Heat Builder Print Button (v2.8.1)
- **Timestamp:** 2026-04-14 12:00:00
- **App Version (from package.json):** 2.8.1
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** c48c8d2
- **Editor:** Claude Code
- **Changes:**
  - Version bump 2.8.0 → 2.8.1 (package.json + index.html cache-busting)
  - heat-builder.js: Added Print button using same window.print() pattern as Results page
  - Button-/Pattern-Reuse only — no additional print styling needed
  - Browser-verified: Print button visible, onclick=window.print(), no existing actions broken

## 2026-04-12 — fix: Breaker Report sorting by strongest variance first
- **Timestamp:** 2026-04-12 19:25:00
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** b70bbba
- **Editor:** Claude Code
- **Changes:**
  - server.js: Added post-query sort to /api/reports/breakers — sorts by date DESC, then variance DESC (strongest break first), then name alphabetically for deterministic tie-break
  - Root cause: SQL ORDER BY used stroke+name but never variance
  - Browser-verified: -9.00 → -8.00 → -4.00 → -3.00 → -2.00 with alphabetical tie-break

## 2026-04-12 — fix: add deterministic tie-break for breaker report sorting
- **Timestamp:** 2026-04-12 19:13:36
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 8489a28
- **Editor:** Balerion
- **Changes:** Added deterministic secondary sorting by swimmer name when breaker variance is equal, so group ordering is stable and predictable instead of depending on prior API order.

## 2026-04-12 — fix: use variance consistently in breaker reports
- **Timestamp:** 2026-04-12 18:55:38
- **App Version (from package.json):** 2.8.0
- **Branch:** dev/v2.8.0-bryan-feedback
- **RecordedCommit:** 2cc54b2
- **Editor:** Balerion
- **Changes:** Switched breaker reports consistently from improvement-based display/sorting to variance-based display/sorting, including headings and row values, so the strongest variance appears first and the report matches the visible metric.
