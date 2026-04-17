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

## 2026-04-17 — chore: v2.8.6 SSOT cleanup (no delivery change)
- **Timestamp:** 2026-04-17 18:15:00
- **App Version (from package.json):** 2.8.6
- **Branch:** dev/v2.8.6-dino-final-ux-fixes
- **RecordedCommit:** fe60a7c
- **HEAD after this entry:** b82202d
- **Editor:** Claude Code
- **Convention:** `RecordedCommit` = substantive delivery commit (the feature commit). Housekeeping / docs / lockfile commits on top do NOT shift `RecordedCommit`; they are tracked via `HEAD` instead.
- **Changes (all housekeeping, no delivery impact):**
  - `package-lock.json` version bumped 2.7.0 → 2.8.6 (was stale after `npm rebuild better-sqlite3`; synced to match package.json). Commit: `7491f71`.
  - `USER-INTERACTION-TEST-PROTOCOL-v2.8.6.md`: header reworked to show HEAD + RecordedCommit + housekeeping-commit chain explicitly.
  - `version/CURRENT_STATE.md`: adopts the single convention above; now references HEAD + RecordedCommit separately with the clean working-tree state.

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
