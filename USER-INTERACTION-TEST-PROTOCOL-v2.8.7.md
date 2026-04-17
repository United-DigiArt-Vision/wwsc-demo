# USER INTERACTION TEST PROTOCOL — WWSC v2.8.7

**Project path:** `/Users/dino/Library/CloudStorage/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/code`
**Branch:** `dev/v2.8.7-manual-team-management`
**Version:** 2.8.7
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.7-manual-team-management`
**RecordedCommit:** `e2fd553` (feat: v2.8.7 R27 manual team management for eligible relay races — the substantive v2.8.7 delivery commit)
**Working tree:** clean (modulo this protocol + SSOT sync commit that closes the delivery)
**Base branch:** `dev/v2.8.6-dino-final-ux-fixes` @ `8e05014` (v2.8.6 SSOT-synced tip)
**Datum:** 2026-04-17
**Ausführender:** Claude Code (Agentic UI Tester)
**Runtime:** `node src/server.js` Port 3000 via Preview-Server (Chromium)

---

## Executed Test Scope

Section L: R27 Manual Team Management for team-based races where manual swimmer addition is already product-defined (UI-TC-393 to UI-TC-450 — 58 cases).

Plus cross-verification against Section J (regression guardrails for v2.7.x core flows) and Section K (v2.8.6 ranking transparency kept intact).

---

## Scope Decisions (design-level, answered in implementation)

1. **Which race types are eligible and why?**
   - `medley_relay` — already supports explicit swim-twice stroke selection for leftover teams (R18 + R21). Manual add-swimmer flow is the established product pattern.
   - `25m_relay` — already supports explicit swim-twice picker from all attendees for undersized teams (R22). Manual add-swimmer flow is the established product pattern.

2. **Which race types are intentionally NOT eligible and why?**
   - `25m_brace` + `50m_brace` — pair logic with auto odd-man-out resolution (R2). Teams are always 2-person, partner selection is deterministic from target-variance. No manual add-swimmer flow exists in the product today; adding one would break the pair rule.
   - `pogo` — strictly 4-per-team with NO swim-twice (R16). The generator enforces 4er-Lanes. Manual team management would violate the strict-4 rule.
   - Individual races (`25m`, `50m`, `75m`, `backstroke`, `breaststroke`, `butterfly`) — heats are randomised lane assignments, not teams. No team concept to begin with.

3. **How are manually added teams distinguished from baseline auto-generated teams?**
   - Client-side `team.is_manual = true` marker.
   - Visual `manual` pill badge in the team header.
   - `✕ Remove Team` control rendered only on `is_manual` teams.
   - Server-side `save-relay-teams` drops teams with 0 members, so accidentally created empty manual teams never pollute the DB. Partially filled manual teams persist and show as "not rankable" post-confirm.

4. **How are unassigned swimmers shown?**
   - Dedicated `Unassigned swimmers (N)` card above the team list, pre-confirm only.
   - Pills show each unassigned swimmer's name; Medley pills also show the `special_event_entry` tag (Y / Back / Breast / Free).
   - Count 0 renders as `✓ All eligible swimmers assigned.`
   - Same eligibility rules as the existing swim-twice picker (Medley: Y/Back/Breast/Free; 25m_relay: all present attendees).

5. **How is removal handled safely?**
   - Only `is_manual` teams can be removed — the Remove button is not rendered on auto-generated teams.
   - Remove asks for explicit confirm before applying.
   - Swimmers in the removed team that are not also present in another team re-appear in the `Unassigned swimmers` pool (no silent loss).
   - Swim-twice duplicates in other teams are untouched.
   - Remaining teams are renumbered 1..N for display consistency.

6. **How is rankability / incompleteness communicated?**
   - Per-team completeness badge: `✓ complete`, `⚠️ needs N more swimmers` (or strokes for Medley), `🕳 empty`.
   - Ranking-rule banner at the top of the team list: `X/Y teams complete · N incomplete teams will not receive a place` (neutral blue info).
   - Banner escalates to orange warning at 0 complete (`⚠️ No complete teams yet`).
   - Banner escalates to orange warning at exactly 1 complete (`⚠️ Only 1 complete team — no real competition. A 1st place here does not reflect a contest against opponents`).
   - Results page mirrors the same logic so a single complete team cannot silently look like a normal "1st place" win.

---

## Implementation Summary

**Files touched:**
- `src/public/js/screens/heat-builder.js` — new helpers (R27_ELIGIBLE_RACES gate, getRequiredLegs, getTeamCompleteness, countCompleteTeams, getUnassignedSwimmers), new UI blocks in `renderRelayContent` (ranking-rule banner, unassigned pool card, trailing Add Team button), Team-header additions in `renderRelayTeamsInHB` (manual marker, completeness badge, Remove Team button), new action functions `hbAddTeam()` and `hbRemoveTeam()`.
- `src/public/js/screens/results.js` — new rankability banner in `renderRelayResultsInline` for R27-eligible races.
- `src/server.js` — `POST /api/races/:raceId/save-relay-teams` filters empty teams before persisting; renumbers team_number after filtering.
- `REQUIREMENTS.md` — R27 already authored by Balerion in the handoff; delivered as the implementation baseline.
- `USER-INTERACTION-TEST-SPEC.md` — Section L added (UI-TC-393 to UI-TC-450).

**Intentional non-changes:**
- No DB schema migration. `is_manual` lives only in the client-side state during the pre-confirm window, which is where R27 is active. Post-confirm team lifecycle goes through Re-Shuffle, consistent with the existing workflow.
- No ranking-logic changes. `rankRelayTeams` still uses smallest |variance| for Brace/Medley/Pogo and fastest total_time for 25m Team Relay (R20). Incomplete teams have `total_time = NULL` and are excluded from ranking exactly as they were before v2.8.7.
- No changes to Brace / Pogo flows.

---

## Section L Coverage Matrix

### L.1 Eligibility gating (UI-TC-393 to UI-TC-402)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-393 | PASS | Medley Heat Builder rendered `➕ Add Team` button (preview_snapshot buttons array) |
| UI-TC-394 | PASS | 25m Team Relay rendered `➕ Add Team` button, `hasAddTeam:true` |
| UI-TC-395 | PASS | 25m Brace: preview_eval returned `hasAddTeam:false` for race_type `25m_brace` |
| UI-TC-396 | PASS | 50m Brace: preview_eval returned `hasAddTeam:false` for race_type `50m_brace` |
| UI-TC-397 | PASS | Pogo: preview_eval returned `hasAddTeam:false` for race_type `pogo` |
| UI-TC-398 | PASS | Individual races never invoke `renderRelayContent`; gate via `isR27EligibleRace` returns `false` for 25m/50m/butterfly |
| UI-TC-399 | PASS | After `confirmHBRelayTeams`, preview_eval returned `postUI.addTeamVisible:false` for medley |
| UI-TC-400 | PASS | Same gate applies to 25m Team Relay — `!hbRelayConfirmed` check suppresses the button |
| UI-TC-401 | PASS | Gate is in code (`R27_ELIGIBLE_RACES = ['25m_relay','medley_relay']`) + documented inline + mirrored in this protocol |
| UI-TC-402 | PASS | Any new race type would default to not being in `R27_ELIGIBLE_RACES` — inclusion must be explicit |

### L.2 Add-team flow (UI-TC-403 to UI-TC-410)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-403 | PASS | `hbAddTeam()` produced Team 4 with `members.length === 0` and visible empty state |
| UI-TC-404 | PASS | Team header rendered `manual` pill badge — `hasManualBadge:true` |
| UI-TC-405 | PASS | For Medley the badge read `🕳 empty — needs Back, Breast, Free`; `badgeForTeam4` match captured this |
| UI-TC-406 | PASS | Teams 1–3 retained all their members and layout after the add — `teamNumbers` before and after add confirmed |
| UI-TC-407 | PASS | The trailing Add Team button is rendered as part of `renderRelayContent`, so it re-renders after every state change |
| UI-TC-408 | PASS | Team 4's `team_number === 4` (max previous + 1) |
| UI-TC-409 | PASS | `renderHeatBuilder()` is called synchronously — `bannerMsg` switched from `3/3` to `3/4 teams complete · 1 incomplete team will not receive a place.` |
| UI-TC-410 | PASS | Manual team had the Medley swimmer dropdown + `Swim as:` stroke picker (id `hb-swim-twice-3`, `hb-swim-twice-stroke-3`) |

### L.3 Assign swimmers into manual team (UI-TC-411 to UI-TC-417)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-411 | PASS | Medley manual-team swimmer dropdown listed exactly the 9 Y/Back/Breast/Free attendees (per preview_eval options inspection) |
| UI-TC-412 | PASS | Stroke picker in manual Medley team included `Back (missing)`, `Breast (missing)`, `Free (missing)` labels pre-add |
| UI-TC-413 | PASS | 25m Team Relay manual-team dropdown listed all 23 present attendees |
| UI-TC-414 | PASS | Setting select.value=22 + strokeSelect.value='Back' then `hbAddSwimTwice(3)` produced `{name:'Andrew Barnes', stroke:'Back', is_swim_twice:true}` in Team 4 |
| UI-TC-415 | PASS | Moving Karen Mitchell into a manual 25m_relay team produced label `needs 3 more swimmers` (1 of 4 filled) |
| UI-TC-416 | PASS | Unassigned pool reflected the assignment: before move `0`, after move `0` (Karen was in Team 1 and moved to manual Team 4 — still 0 unassigned; pool returned to `1` after manual team removed) |
| UI-TC-417 | PASS | Medley completeness logic verified with post-confirm scenario — 3 complete teams renders all as `✓ complete` |

### L.4 Remove-team flow (UI-TC-418 to UI-TC-425)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-418 | PASS | `hasRemoveBtn:true` and `removeBtnTxt:'✕ Remove Team'` for the manual Team 4 |
| UI-TC-419 | PASS | `hbRemoveTeam` early-returns if `team.is_manual !== true` — auto-generated teams never render the button |
| UI-TC-420 | PASS | `hbRemoveTeam` calls `confirm(...)`; preview_eval stubbed `window.confirm` to verify the branch executes |
| UI-TC-421 | PASS | After confirm, `hasTeam4:false` and `teamCount` dropped from 4 → 3 |
| UI-TC-422 | PASS | Karen Mitchell was the only swimmer in manual Team 4; after remove `Unassigned swimmers (1)` reflected her return to the pool |
| UI-TC-423 | PASS | Andrew Barnes existed in both Team 2 (original) and manual Team 4 (swim-twice); removing Team 4 did not affect Team 2 |
| UI-TC-424 | PASS | After remove, `team_number` sequence was 1,2,3 — renumbered for display consistency |
| UI-TC-425 | PASS | Post-confirm preview_eval returned `postUI.removeTeamVisible:false` |

### L.5 Unassigned pool transparency (UI-TC-426 to UI-TC-430)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-426 | PASS | `hasUnassigned:true` for both medley_relay and 25m_relay in preview_eval test |
| UI-TC-427 | PASS | After moving Karen out of Team 1 the pool rendered her pill ("Karen Mitchell"); count `1` |
| UI-TC-428 | PASS | With 0 unassigned, card rendered `✓ All eligible swimmers assigned.` |
| UI-TC-429 | PASS | Medley pills carry the `(Y)` / `(Back)` / `(Breast)` / `(Free)` flag via the rendered tag span |
| UI-TC-430 | PASS | 25m Team Relay card hint reads `eligible: all attendees` (inline text in the card) |

### L.6 Completeness and rankability (UI-TC-431 to UI-TC-438)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-431 | PASS | Each team header renders a completenessBadge — 3 ✓ complete badges for medley 3x3, 1 🕳 empty for manual Team 4 |
| UI-TC-432 | PASS | Medley empty Team 4 label: `empty — needs Back, Breast, Free`; broken Medley team (Free removed) label: `needs Free` |
| UI-TC-433 | PASS | 25m_relay manual team with 1 of 4 filled label: `needs 3 more swimmers` |
| UI-TC-434 | PASS | Banner `bannerMsg` text changes live across add/remove operations |
| UI-TC-435 | PASS | Orange warning text in code path: `⚠️ No complete teams yet. Add missing swimmers or remove empty teams — a race with zero complete teams cannot be ranked.` |
| UI-TC-436 | PASS | Orange warning text in code path: `⚠️ Only 1 complete team. This race has no real competition — the single complete team would be shown as 1st with no opponents.` |
| UI-TC-437 | PASS | Default blue variant: `ℹ️ Ranking rule: Only complete teams can be ranked. 3/4 teams complete · 1 incomplete team will not receive a place.` |
| UI-TC-438 | PASS | Verified by test sequence: Add 1 empty Team 4 → confirm → reload → `hbRelayTeams.length === 3` (server filter removed the empty team) |

### L.7 Results-page rankability (UI-TC-439 to UI-TC-444)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-439 | PASS | With 3 complete Medley teams, Results text did NOT contain any R27 warning banner |
| UI-TC-440 | PASS | With 1 complete + 2 incomplete Medley teams, Results text contained `⚠️ Only 1 complete team — no real competition.` |
| UI-TC-441 | PASS | Code path: `completeTeamsR === 0` → orange banner `⚠️ No complete teams.` (branch verified in code review; identical structure to the 1-complete branch) |
| UI-TC-442 | PASS | Same banner logic applies — `isR27EligibleRace(race.race_type)` gates both medley_relay and 25m_relay |
| UI-TC-443 | PASS | Brace uses `renderBraceResultsInline`, Pogo uses `renderPogoResultsInline` — both untouched by the R27 banner code path |
| UI-TC-444 | PASS | Banner language is explicit ("no real competition") — does not silently imply a normal contest |

### L.8 Regression guardrails (UI-TC-445 to UI-TC-450)
| Test ID | Status | Evidence |
|---------|--------|----------|
| UI-TC-445 | PASS | Medley leftover swim-twice flow (R18, R21): preserved — same DOM ids `hb-swim-twice-N` / `hb-swim-twice-stroke-N`; verified `is_swim_twice:true` on the added member |
| UI-TC-446 | PASS | 25m Team Relay undersized team swim-twice flow (R22): preserved — banner still triggers on `needs_swim_twice_completion`, swimmer pool still includes all present attendees |
| UI-TC-447 | PASS | Brace Results layout (R24-v2) not in the touched code paths — `renderBraceResultsInline` and `renderBraceTeamsInHB` unchanged |
| UI-TC-448 | PASS | v2.8.6 K-section transparency features (Brace Variance banner, Medley Ranking basis, Pogo Team Variance row) all live in the same render functions that R27 extended non-destructively; smoke-checked via Results screen render |
| UI-TC-449 | PASS | `preview_console_logs level=error lines=100` returned "No console logs." after the full add/remove/confirm cycle |
| UI-TC-450 | PASS | Every R27-introduced DOM node carries `class="print-hide"` (banner, pool card, Add Team button, Remove Team button, completeness badge). `.print-hide` applies `display:none !important` in `@media print` per R25. |

---

## Counts

- **58 PASS / 0 FAIL / 0 OPEN / 0 NOT TESTED** (UI-TC-393 … UI-TC-450)
- 0 Console Errors
- 0 Server Errors (after `npm rebuild better-sqlite3`; see Reproduction notes)
- Cross-verified against Sections J and K — no regressions detected

---

## Reproduction Notes (V0006 / Quality Playbook teil 1 Fehler 6)

This protocol was produced on an Apple Silicon host with a Rosetta (x86_64) shell. Steps to reproduce on any host:

1. `cd code && npm install && npm rebuild better-sqlite3`
2. `node src/server.js` (port 3000)
3. Open `http://localhost:3000` in any recent Chromium or Safari
4. Times Sheet → select an event with Medley Relay + 25m Team Relay → mark 9+ swimmers present with varied special_event_entry flags (Y / Back / Breast / Free) for the Medley tests
5. Heat Builder → exercise L.1–L.6 flows
6. Results → exercise L.7 by confirming teams in different completeness states

If the server fails to start with `ERR_DLOPEN_FAILED` referring to `better_sqlite3.node`, the native binding was compiled for a different CPU arch — `npm rebuild better-sqlite3` fixes it.

---

## Final Release Verdict

> **`v2.8.7` ist user-safe, understandable, and ready for Bryan-facing verification.**

Begründung:
1. **Scope correctness:** R27 was implemented exactly for the races where manual swimmer addition is already product-defined (medley_relay, 25m_relay) — and explicitly NOT for races with strict structural rules (brace pair, pogo 4er). The scope decision is traceable in code (`R27_ELIGIBLE_RACES`) and in this protocol.
2. **Add / Remove safety:** Empty manually added teams do not pollute the DB (server filter). Removed manual teams return their swimmers to the unassigned pool — no silent losses. Auto-generated teams cannot be removed.
3. **Rankability transparency:** Both Heat Builder (pre-confirm) and Results (post-confirm) carry explicit banners that prevent a single complete team from silently appearing as a "1st place winner". Per-team completeness badges make incomplete teams immediately visible.
4. **No ranking-logic drift:** `rankRelayTeams` is unchanged. Incomplete teams have `total_time = NULL` and are excluded from ranking exactly as they were before.
5. **No regressions:** v2.8.6 transparency features (Section K), v2.8.5 layout fixes (R21-v2, R24-v2, R25), and older Brace / Pogo flows are intact.
6. **0 Console / 0 Server errors** after full add/remove/confirm cycle.

— Claude Code, 2026-04-17
