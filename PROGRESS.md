# PROGRESS — WWSC v2.12.0 Bryan-Feedback (3 Hauptreports, Defaults, Tap Placing, Relay-Grid)

## 🆕 v2.12.0 BRYAN-FEEDBACK 2026-06-10 — IMPLEMENTIERT + LOKAL VOLL VERIFIZIERT (2026-06-10 21:30 CEST)

- [x] Bryans Inbound verbatim archiviert: `../messages/2026-06-10-Bryan-inbound-v2110-feedback-defaults-relay-pointscore-simplification.md` (Klassifikation: Retest-Defekt + UX-Änderungen + Pointscore-Vereinfachung + Testdaten-Anfrage; KEINE Acceptance).
- [x] Live-Zustand read-only reproduziert: Event 1 (Seed, 10 Kategorien) + Bryans eigenes Event 2 (2026-06-10, 22 Schwimmer, 4 Kategorien) sind completed; 25m-brace-Daten VORHANDEN (9 Teams, Plätze 1–9) — Root Cause = nur Podium-Teams bekommen Punkte, Rest war in Swimmer Card unsichtbar.
- [x] Branch `dev/v2.12.0-bryan-feedback` (von v2.11.0 `1d965ef` + Balerion-Evidence-Sync `9e0abc7`); Version-Bump `98ba44f` als erster Commit; Gate-Commit `b5c3c43`.
- [x] R-V12-02 Select-All-Default **Y** (event-setup.js `applyDefaultEntryY()`; explizite N/Back/Breast/Free bleiben).
- [x] R-V12-03 **Quick Tap Placing** pro Heat (Reihenfolge tippen = Platz 1..4, nochmal tippen = entfernen, Clear; Dropdowns als Fallback).
- [x] R-V12-04 **Relay-Grid**: Teams nebeneinander (Screen auto-fit, Print 3 Spalten kompakt) in Results + Relays.
- [x] R-V12-05..07 **Bryans 3 Hauptreports** (API+CSV+UI): by-race-type Wochenmatrix, Total-Pointscore Single Page, Breakers Count+Amount aus `pb_change_log` (neu; PUT /api/members/:id loggt jede manuelle Zeitänderung transaktional) + season_start vs current. Alte Ansichten unter "More reports" erhalten.
- [x] R-V12-08 **Swimmer Card** zeigt jede Teilnahme inkl. 0 Punkte (Fix "25m brace does not list in any results").
- [x] R-V12-09 **Event-Report** mit PB/Start/Finish/Net/Variance/BREAK/Place + Relay-Start/Target; Manual-Place-Präzedenz gefixt (Report + Season Calendar — Pattern-Audit, kein Punkt-Fix).
- [x] Member-DELETE räumt jetzt `pointscore_entry` + `pb_change_log` (FK-Crash-Fix).
- [x] R-V12-01 **Wochen-Seeder** `scripts/seed-bryan-weekly-events.cjs`: 7 abgeschlossene Sa-Events 18.04.–30.05.2026, rotierende Konfigurationen, Breaks + manuelle PB-Updates nach jedem Event (befüllt Report 3), variierende Anwesenheit. Niemals löschen, vorhandene Daten übersprungen (2. Lauf: 0/7), Abbruch bei unfertigem Event, APPLY_LIVE-Guard. Selbstverifikation **9/0**.
- [x] Traceability: `REQUIREMENTS-V2.12.0-BRYAN-FEEDBACK.md` (10 Requirements, 0 FEHL); Abnahmeprotokoll: `docs/evidence/v2120-bryan-feedback/V2.12.0-ABNAHMEPROTOKOLL.md`.
- [x] Gates @ `b5c3c43` (Roh-Log `docs/evidence/v2120-bryan-feedback/gate-run-b5c3c43.log`): v2120-Unit **24/0** • Pointscore-Unit **15/0** • Slice2-Unit **7/0** • Isolation **PASS** • v2120-Browser **10/0**, 0 Console-Errors • M2-55 **55/0** • M2-100 **98/2NA/0** • Graphs **19/1NA/0** • Slice2-Browser **13/0** • M3-120 **118/2NA/0/0**.
- [x] Bryan-Antwort-Draft: `../messages/2026-06-10-draft-to-bryan-v2120-feedback-response.md` (senden ERST nach Live-Deploy + Live-Seed).
- [ ] Balerion: Branch-Übernahme + ReQA auf Mac Mini (Handoff: `../messages/2026-06-10-2*-Claude-To-Balerion-WWSC-v2.12.0-Bryan-Feedback-Handoff.md`).
- [ ] Dino-Freigabe: merge → deploy → Live-Wochen-Seed → Bryan-Versand.

Boundaries gehalten: kein Push, kein Deploy, kein Live-Mutieren, kein Bryan-Kontakt; Bryans Event 2 unangetastet.

---

# PROGRESS (vorher) — WWSC v2.11.0 M3 Slice 2 Reports / Export

## ✅ LIVE DEMO DATA CORRECTED FOR BRYAN RETEST (2026-06-09 17:55 CEST)

- [x] Bryan's 2026-06-09 empty Season Calendar / missing report-data blocker reproduced read-only on live demo: `v2.11.0` was live, but events/months/break report were empty.
- [x] Dino explicitly authorized live correction.
- [x] Ran guarded live seeder: `BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-m3-slice2-live-retest.cjs`.
- [x] Seeder result: **9 PASS / 0 FAIL**.
- [x] Created completed live demo event `1`, date `2026-06-06`, 18 present swimmers, 10 race categories.
- [x] Independent API verification: Season Calendar data, pointscore month/season, completed categories, break counts, improvements, time-history/graph source, and DB export are populated.
- [x] Browser visibility check: Season Calendar, Event Details, Pointscore, Break Counts, Improvements, Completed Categories, and DB & Graphs are visible/populated.
- [x] Evidence: `docs/evidence/bryan-v2110-live-retest-seed/seed-2026-06-09T15-50-20-984Z.json`.
- [x] Human-readable note: `docs/evidence/bryan-v2110-live-retest-seed/LIVE-RESEED-VERIFY-2026-06-09.md`.
- [x] Proof matrix: `docs/evidence/bryan-v2110-live-retest-seed/BRYAN-EXPECTATION-PROOF-2026-06-09.md`.
- [x] Dino sent Bryan the correction update at 2026-06-09 18:18 CEST.
- [x] Sent-confirmed record: `../messages/2026-06-09-outgoing-to-bryan-live-demo-data-corrected-sent-confirmed.md`.

Customer-facing boundary: say the demo test dataset was restored/re-created and verified; do not claim the old missing demo events were recovered.

Current gate: wait for Bryan's next reply. Archive full inbound first, then classify before any code/data/client-response action.

## 🎯 AKTUELLER STATUS
Phase: M2 v2.9.0 released/paid by Bryan; M3 commissioned; v2.11.0 deployed live and Bryan's empty-demo-data blocker corrected/re-verified on 2026-06-09.
Schritt: Waiting for Bryan's retest response after Dino/Nedim sent the live demo data correction update on 2026-06-09 18:18 Europe/Berlin.
Blockiert: Waiting for Bryan. Direct Render disk/backups remain not inspectable from current tooling, so do not claim original old demo events were recovered. Production persistence/backups remain separate future production setup.

## 📤 BRYAN DELIVERY SENT — v2.11.0 / M3 Slice 2 (2026-06-06 18:58 Europe/Berlin)

- [x] Dino confirmed by Discord screenshot that he sent Bryan the v2.11.0 update.
- [x] Sent-confirmed record: `../messages/2026-06-06-outgoing-to-bryan-v2110-m3-slice2-sent-confirmed.md`.
- [x] Screenshot source archived: `../messages/attachments/2026-06-06-v2110-sent-to-bryan-confirmation/01-upwork-outgoing-v2110-visible.png`.
- [x] Visible sent message states: v2.11.0 live URL, relay/team scoring 5/4/3, completed-category report, DB export, graph source from `time_history`, break-count report, and total-improvement report.
- [x] Important nuance: the visible screenshot does not show the optional prepared paragraph explicitly mentioning the seeded completed retest event, though the live demo is seeded and ready for Bryan to test.
- [x] Current gate: **WAITING FOR BRYAN RETEST / ACCEPTANCE / ISSUE DETAILS**.

Next Bryan reply handling:
- Archive full reply and screenshot(s) first.
- Classify as acceptance, retest defect, calculation mismatch, Constitution/rule input, seeded-data confusion, scope expansion, or ambiguous feedback.
- If Bryan reports a defect, reproduce against live v2.11.0 and the seeded completed event before changing code.
- If Bryan accepts, prepare M3 acceptance/payment-close path.

## 🧪 v2.11.0 LIVE RETEST DATA SEEDED FOR BRYAN (2026-06-06 17:52 Europe/Berlin)

- [x] New guarded seed script: `scripts/seed-bryan-m3-slice2-live-retest.cjs`.
- [x] Local isolated proof passed before live mutation.
- [x] Dino authorized live seed; ran `BASE_URL=https://wwsc-demo.onrender.com APPLY_LIVE=1 node scripts/seed-bryan-m3-slice2-live-retest.cjs`.
- [x] Live completed event created: event `1`, date `2026-06-06`, status `completed`, 18 present swimmers, 10 race categories.
- [x] Live category coverage now includes: 25m, 50m, 75m, backstroke, breaststroke, butterfly, 25m relay, medley relay, 25m brace, 50m brace.
- [x] Live break-count report populated.
- [x] Live total-improvement report populated.
- [x] Live time-history rows populated for graph testing.
- [x] Live DB export still returns 200 with `wwsc-sqlite-db-v2.11.0-...db`.
- [x] Evidence: `docs/evidence/bryan-v2110-live-retest-seed/seed-2026-06-06T15-50-55-798Z.json`.

## 🚀 v2.11.0 LIVE DEPLOYED (2026-06-06 17:38 Europe/Berlin)

- [x] Balerion re-proved the full current gate on Mac Mini before deploy: Slice2 Unit/API **7/0**, Slice2 Browser/UI/File **13/0**, pointscore Unit/API **15/0**, M2-55 **55/0**, M2-100 **98/2NA/0/0**, history graphs **19/1NA/0**, final M3-120 **118/2NA/0/0/0CIM**.
- [x] Pushed `641aa0e` to `main` and pushed tag `v2.11.0`.
- [x] Render live `/api/version` returns `2.11.0`.
- [x] Read-only live smoke passed for `/api/reports/event-coverage`, `/api/reports/break-counts`, `/api/reports/improvements`, and `/api/export/db`.
- [x] Live DB export returns 200 `application/octet-stream`, `content-length: 94208`, filename `wwsc-sqlite-db-v2.11.0-...db`.
- [x] Dino/Nedim sends Bryan the prepared update.
- [x] Archive Dino's sent confirmation in `messages/`.

## 🆕 v2.11.0 M3 SLICE 2 — REPORTS / DB EXPORT / ALL EVENT CATEGORIES PROVEN (2026-06-06)

- [x] Branch `dev/v2.11.0-m3-slice2-reports-export` created from `dev/v2.10.2-relay-543@cea5d39`; version/cache-bust bumped to `2.11.0`.
- [x] New completed-result category report: `GET /api/reports/event-coverage` + CSV + UI tab `Completed Categories`; proof covers 25m, 50m, relay, medley relay, 75m, 25m brace, 50m brace, breaststroke/backstroke/butterfly. Bryan's duplicate `75m` is documented as NOT APPLICABLE WITH SOURCE.
- [x] New break-count reports: `GET /api/reports/break-counts` + CSV + UI tab `Break Counts`; source = `time_history.is_break`, finalized/completed non-archived events only; overall and by-event views.
- [x] New total-time-improvement reports: `GET /api/reports/improvements` + CSV + UI tab `Improvements`; source = `time_history.time` and `previous_best`, counted only when previous best exists and current time is faster; centiseconds internally, human-readable UI.
- [x] New raw SQLite DB export: `GET /api/export/db`; uses SQLite backup API, filename includes `v2.11.0` + date, verified as valid SQLite DB by `better-sqlite3` after download.
- [x] Reports UI `DB & Graphs` tab explains DB export and graph source; graph entry point and graph API/time-history mapping re-proven.
- [x] Evidence matrix + customer-facing draft: `docs/evidence/m3-slice2/V2.11.0-BRYAN-REPORTS-EXPORT-ALL-EVENTS-PROOF.md`.
- [x] Proof: Slice2 Unit/API **7/0**, Slice2 Browser/UI/File **13/0** (10 screenshots), pointscore Unit/API **15/0**, M2-55 **55/0**, M2-100 **98/2NA/0/0**, history graphs **19/1NA/0**, M3-120 **118/2NA/0/0/0CIM**.
- [x] Boundaries held: no push, no deploy, no merge to main, no tag, no Bryan/client contact, no hosted/live data mutation.

## 🆕 v2.10.2 RELAY/TEAM POINTSCORE 5/4/3 — IMPLEMENTED + EVIDENCED (2026-06-05)

## 🆕 v2.10.2 RELAY/TEAM POINTSCORE 5/4/3 — IMPLEMENTED + EVIDENCED (2026-06-05)

Bryan 2026-06-05 clarified relay/team scoring = **5/4/3** (was 3/2/1 Excel working assumption). Claude took over Balerion's Dropbox-synced in-progress WIP onto feature branch `dev/v2.10.2-relay-543` after Dino confirmed Balerion had stepped away; `main` untouched at `9106eaf`.

- [x] Engine `src/pointscore.js`: `categories.relay.pointsByPlace` → `{1:5,2:4,3:3}` (finisherPoints 0); individual scale unchanged; `src/server.js` finalize hook unchanged (centralized rule).
- [x] Tests: UT1 asserts 5/4/3; **+UT11** (exact relay 5/4/3 by place) **+UT12** (relay → month/season aggregation). Unit **15/0**.
- [x] All current-truth specs/docs 3/2/1 → 5/4/3, source-labeled Bryan-confirmed 2026-06-05; UT10/11/12 documented. Historical CHANGELOG untouched.
- [x] Version 2.10.2 (package.json/-lock + index.html cache-bust). Commits: `c4ab774` bump → `2501fff` engine+tests → `cc7e67d` docs (+ evidence/SSOT-close).
- [x] **Full gate GREEN @ `50844a0` on BOTH systems** (2026-06-06): unit **15/0**, isolation **PASS**, M2-55 **55/0**, M2-100 **98/2/0/0**, M3-120 **116/0/0/2NA/2CIM** (UIT-M3-111/112 PASS; UIT-M3-030 relay 5/4/3), history-graphs **19/1/0**; 0 console errors. Proof matrix: `docs/evidence/m3-pointscore/V2.10.2-BRYAN-RELAY-543-PROOF.md`.
- [x] Root cause of last session's blocked browser gates = Dropbox `better-sqlite3` arch ping-pong (arm64 clobbered local x86_64 → `ERR_DLOPEN_FAILED`), NOT ENOSPC/throttle. Fix = `npm rebuild better-sqlite3` before each local run.
- [x] Balerion **independent QA**: reproduced identical results (Mac Mini, temp copy outside Dropbox) + screenshot-sanity-checked. Verdict **v2.10.2 scope PROVEN** (`../messages/2026-06-06-0909-Balerion-To-Claude-WWSC-v2102-QA-Proof-Boundary.md`).
- [ ] Dino merge/deploy decision for v2.10.2 (Dino-authorized only).
- [ ] Dino: Slice 2 scope (breaks-per-person + total-improvement reports; DB export; all-event retest dataset).

Handoff: `../messages/2026-06-05-1910-Claude-To-Balerion-WWSC-v2.10.2-Relay-543.md`.

## 🚦 CURRENT GATE — BRYAN PERSISTENCE / RELAY RULE / REPORT REQUIREMENTS FOLLOW-UP (2026-06-05 14:52 Europe/Berlin)

- [x] Bryan follow-up archived: `../messages/2026-06-05-Bryan-inbound-persistence-all-event-results-followup.md`.
- [x] Bryan "More info" follow-up archived: `../messages/2026-06-05-Bryan-inbound-more-info-relay-reports-db-graphs.md`.
- [x] Classification: mixed data persistence + calculation/rule input + usage questions + concretized report requirements. Not acceptance.
- [x] Current truth boundary:
  - Completed/finalized events are intended to be saved in SQLite.
  - Render hosted demo DB path remains `/var/data/wwsc.db`.
  - The old four events Bryan created previously were not visible through the live app/API when checked on 2026-06-04; do not claim they were recovered.
  - Four completed April 2026 retest events are visible live and support pointscore/history retesting.
  - A current setup event may be visible, but it is not a completed result.
  - Current `src/pointscore.js` uses relay/team 3/2/1; Bryan now says relay/team should be 5/4/3.
  - Graphs currently exist as per-swimmer time/PB history graphs from saved `time_history` rows.
  - CSV exports exist for report data; full raw SQLite DB download/export is not yet a customer-facing UI.
  - Break-count per person overall/by event and total-improvement per person by event/overall are now concrete requested report outputs.
- [x] Draft updated: `../messages/2026-06-05-draft-to-bryan-persistence-all-event-results-followup.md` (v3).
- [x] Relay 5/4/3 rule correction IMPLEMENTED + evidenced as v2.10.2 on `dev/v2.10.2-relay-543` (see section above).
- [ ] Balerion full browser gate (M2-100 + history-graphs) on Mac Mini + independent QA.
- [ ] Dino decision on Slice 2 (breaks-per-person + total-improvement reports; DB export; all-event retest dataset) + Bryan response.

Recommended next response:
- Acknowledge the concern.
- Be honest that the prior four old entries cannot be found/recovered through the app/API from current evidence.
- Acknowledge relay/team rule correction to 5/4/3.
- Offer/commit a completed retest dataset across the requested event/stroke categories so reports can be validated without manual recreation.
- Explain CSV/report export vs full raw SQLite DB export honestly.
- Explain graphs from saved time-history rows.
- Treat break-count and total-improvement summaries as concrete report outputs to add/verify.
- Explain production go-live behavior: persistent database + backups/restore policy, not demo-only assumptions.

## Previous gate — WAITING FOR BRYAN RETEST / ACCEPTANCE / ISSUE DETAILS (2026-06-04 14:14 Europe/Berlin)

- [x] Bryan inbound archived: `../messages/2026-06-04-Bryan-inbound-completed-events-db-question.md`.
- [x] Draft response prepared: `../messages/2026-06-04-draft-to-bryan-completed-events-db-question.md`.
- [x] Readonly live checks:
  - `GET /api/version` → `2.10.1`.
  - `GET /api/events` → `[]`.
  - `GET /api/events?archived=1` → `[]`.
  - `GET /api/pointscore/months` → `[]`.
  - `GET /api/events/current` → `null`.
- [x] Storage truth from code/config:
  - Render production DB path: `WWSC_DB_PATH=/var/data/wwsc.db` via `render.yaml`.
  - Render default backup directory: `/var/data/backups`.
  - Local dev DB path: `src/data/wwsc.db`.
  - E2E tests use isolated `/tmp/...` DBs and are not Bryan's live data.
- [x] Render access attempted:
  - no local `render` CLI available.
  - no Render API key/account found in `secrets/accounts.json`.
  - OpenClaw managed browser reaches Render sign-in only.
  - user Chrome relay remains unavailable (`127.0.0.1:9222/json/version` issue), so logged-in Render dashboard could not be inspected.
- [x] Reusable retest seed path created: `scripts/seed-bryan-retest-events.cjs`.
- [x] Local isolated verification passed:
  - 4 completed events created.
  - `/api/events?archived=1` shows all 4.
  - `/api/events/current` returns `null`.
  - April monthly pointscore and 2026 season pointscore are visible.
  - Time History and Pointscore rows are written.
  - Evidence: `docs/evidence/bryan-retest-seed/seed-2026-06-04T10-37-23-577Z.json`.
  - Summary: `docs/evidence/bryan-retest-seed/README.md`.
- [x] Safety guard verified: script refuses `https://wwsc-demo.onrender.com` unless `APPLY_LIVE=1` is set.
- [x] Hosted demo post-restart verification:
  - Live already contained 4 completed deterministic retest events created at 2026-06-04T12:02Z.
  - Guard re-run with `APPLY_LIVE=1` refused because 4 events already existed; no duplicate seed was applied.
  - Read-only verification passed 7/7 checks: live version 2.10.1, four completed events visible, expected April dates visible, no current event, April pointscore visible, season pointscore visible, time history visible.
  - Evidence: `docs/evidence/bryan-retest-seed/live-verify-2026-06-04T12-06-20-652Z.json`.
- [x] Final Bryan response draft prepared: `../messages/2026-06-04-draft-to-bryan-completed-events-db-question-final-after-live-seed.md`.
- [x] Dino confirmed he sent the final Bryan reply exactly as prepared on 2026-06-04 at 14:14 Europe/Berlin.
- [x] Sent-confirmed record: `../messages/2026-06-04-outgoing-to-bryan-completed-events-db-question-sent-confirmed.md`.

Classification: M3 retest blocker / live-data persistence/test-data workflow question. Do not classify as M3 acceptance, formula mismatch, or Constitution-rule feedback yet. Customer-facing next step is waiting for Bryan's retest/acceptance/issue details. Balerion must not send externally unless Dino explicitly instructs it.

Next Bryan reply handling:
- Archive Bryan's complete reply first.
- Classify before response/code: acceptance, retest issue, calculation mismatch, Constitution/rule input, data persistence issue, scope expansion, or ambiguous feedback.
- If Bryan provides a defect, reproduce against the live demo with the four completed retest events before changing code.
- If Bryan accepts M3, prepare the M3 acceptance/payment-close path.

## 📤 BRYAN DELIVERY SENT — v2.10.1 / M3 (2026-06-04 09:53 Europe/Berlin)

- [x] Dino confirmed by Discord screenshot that he sent the Bryan delivery message.
- [x] Sent-confirmed record: `../messages/2026-06-04-outgoing-to-bryan-v2101-m3-delivery-sent-confirmed.md`.
- [x] Screenshot source: Discord attachment `IMG_7239---9a5755db-4d2c-4775-b796-b80dd248cc2a.png`, received 2026-06-04 09:54 Europe/Berlin.
- [x] Recipient visible in screenshot: Bryan Hesketh / Bryan H.
- [x] Sender visible in screenshot: Nedim Dino Agic.
- [x] Visible sent message is shorter than the prepared draft: it does not show the separate release-testing paragraph or the explicit M2-regression bullet, so those should remain internal evidence rather than assumed client-facing wording.
- [x] Current gate: **WAITING FOR BRYAN TEST / ACCEPTANCE / CONSTITUTION-RULE FEEDBACK**.

Next Bryan reply handling:
- Archive full reply before interpretation.
- Classify as acceptance, calculation mismatch, Constitution rule input, bug report, scope expansion, or ambiguous feedback.
- If Bryan provides exact Constitution rules or expected results, open a narrow v2.10.x adjustment loop and map rule -> code -> test -> evidence.
- If Bryan accepts M3, prepare the M3 acceptance/payment-close path.

## 🆕 M3 POINTSCORE SLICE — IMPLEMENTED + TESTED + RELEASE AUTHORIZED (2026-06-04)

Implemented per Balerion's 2026-06-03 06:45 directive under Bryan's 2026-06-02 working assumptions. Engine commit `219bdd9`; CSV-route refactor + test suite + specs + SSOT committed on `dev/v2.10.0-m3-history-graphs` (resolve HEAD dynamically). The prior session completed implementation + ran the evidence but hit its context limit mid-closure; this slice was re-verified first-hand and closed out in a fresh session.

- [x] Isolated scoring engine `src/pointscore.js` (adjustable POINTSCORE_RULES: 5/4/3/2 indiv + 5/4/3 relay; reads accepted results; writes only `pointscore_entry`; `WWSC_POINTSCORE_DISABLED` switch).
- [x] Additive finalize hook + read APIs + CSV exports (`src/server.js`); `🎯 Pointscore` UI screen (`src/public/js/screens/pointscore.js`, nav in `sidebar.js`/`app.js`).
- [x] Excel scoring source extracted + source-labeled: `scripts/extract-pointscore.py`, `docs/evidence/m3-pointscore/POINTSCORE-RULE-SOURCE-2026-06-03.md`.
- [x] Specs: `DESIGN-SPEC` / `UNIT-TEST-SPEC` / `INTEGRATION-TEST-SPEC` / `REQUIREMENT-TEST-EVIDENCE-MATRIX` (M3 pointscore); `DEV-CHECKLIST-M3` → IMPLEMENTED.
- [x] Unit/API: `scripts/test-m3-pointscore-unit.cjs` = 12 PASS / 0 FAIL (incl. UT9 unknown-race_type → individual).
- [x] Isolation proof: `scripts/e2e-m3-pointscore-isolation.cjs` = PASS (accepted flow byte-identical with pointscore on/off).
- [x] 120-case browser suite: `scripts/e2e-m3-pointscore-120.cjs` = 114 PASS / 6 NA / 0 FAIL / 0 BLOCKED (clean-HEAD evidence in `docs/evidence/m3-user-interaction-v3.0.1/`, 64 screenshots). Balerion found the prior UIT-M3-113 mobile screenshot still had an Event Details overlay despite a PASS note; fixed the harness cleanup in commit `711c66d` and refreshed clean evidence in commit `735f0b3`.
- [x] Regression: M2 55/0, M2 100 = 98/2/0/0, R-M3-05 history-graphs 19/1/0; out-of-scope guard clean.
- [x] Balerion V0015 QA of the evidence package — PASS after independent reproduction on 2026-06-04. Reproduced: Unit/API 12/0, isolation PASS, M2 55/0, M2 100 98/2/0/0, M3 120 114/6/0/0, R-M3-05 graphs 19/1/0. Visual re-check of `UIT-M3-113-resp-mobile.png` confirms no overlay after harness fix.
- [x] Claude Code Bryan-expectation proof — Balerion sent `../messages/2026-06-04-0810-Balerion-To-Claude-WWSC-M3-Bryan-Expectation-Proof-Required.md`; Claude returned `../messages/2026-06-04-1030-Claude-To-Balerion-WWSC-M3-Bryan-Expectation-Proof.md`.
- [x] Balerion V0015 verification of Claude's Bryan-expectation proof — PASS on 2026-06-04 at HEAD `d3d3ada`. Reproduced: Unit/API 13/0, isolation PASS, M2 55/0, M2 100 98/2/0/0, M3 120 116 PASS / 2 NA / 2 CLIENT INPUT MISSING / 0 FAIL / 0 BLOCKED, R-M3-05 graphs 19/1/0. Verification note: `../messages/2026-06-04-0920-Balerion-V0015-WWSC-M3-Bryan-Expectation-Proof-Verification.md`.
- [x] Dino authorized release/deploy/client update preparation on 2026-06-04 09:28 Europe/Berlin.
- [x] `STABLE.md` update + merge to `main` + deploy + live smoke evidence. `origin/main` = `2154574`, tag `v2.10.1`, `/api/version` = `2.10.1`, live smoke 8 PASS / 0 FAIL.

## ✅ ERLEDIGT (mit Dateireferenz)
- [x] M2 activated/funded evidence: `../messages/2026-05-18-Bryan-M2-active-funded.md`.
- [x] M2 scope-confirmation sent/evidence: `../messages/2026-05-18-outgoing-to-bryan-m2-scope-confirmation-sent-confirmed.md`.
- [x] Stable M1 file backup: `../backups/2026-05-18-0615-v2.8.12-m1-stable-origin-main/`.
- [x] Stable M1 git backup branch: `backup/v2.8.12-m1-stable-20260518` at `eb87e11`.
- [x] M2 feature branch: `dev/v2.9.0-m2-time-history`.
- [x] Version bump first commit: `aa004be` (`2.9.0`).
- [x] Requirements: `REQUIREMENTS-M2-TIME-HISTORY.md`.
- [x] Design: `DESIGN-SPEC-M2-TIME-HISTORY.md`.
- [x] Unit tests: `UNIT-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Integration tests: `INTEGRATION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] User interaction tests: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Dev checklist: `DEV-CHECKLIST-M2-TIME-HISTORY.md`.
- [x] T1 API enrichment (`event_date` on event time-history). `src/server.js`.
- [x] T2 New member time-history endpoint. `src/server.js`.
- [x] T3 Frontend API wrapper. `src/public/js/api.js`.
- [x] T4 Members screen History action + modal. `src/public/js/screens/members.js`.
- [x] T5 Calendar/Event-detail Time History section. `src/public/js/screens/calendar.js`.
- [x] T6 Automated E2E runner. `scripts/e2e-m2-time-history.cjs`.
- [x] T7 M1 regression smoke executed inside the E2E run (dashboard + 6 screens + console gate).
- [x] Browser-E2E evidence: `docs/evidence/m2-time-history-run.log`, `docs/evidence/m2-time-history-console-errors.log`, `docs/screenshots/m2-time-history/` (9 PNGs).
- [x] Test protocol + coverage matrix: `USER-INTERACTION-TEST-PROTOCOL-M2-TIME-HISTORY.md`, `USER-INTERACTION-COVERAGE-MATRIX-M2-TIME-HISTORY.md`.
- [x] T8 CHANGELOG + CURRENT_STATE updated.
- [x] T9 Final SSOT completion commit (delivery close).
- [x] Expanded 100-case screenshot user-interaction spec: `USER-INTERACTION-TEST-SPEC-M2-TIME-HISTORY.md`.
- [x] Claude Code execution handoff for 100-case spec: `../messages/2026-05-19-Balerion-To-Claude-M2-100-user-interaction-screenshot-test-spec.md`.
- [x] Claude Code 100-case execution handoff: `../messages/2026-05-19-Claude-To-Balerion-M2-100-case-screenshot-handoff.md`.
- [x] 100-case screenshot evidence package: `docs/evidence/m2-user-interaction-100-test-protocol-2026-05-19.md`, `docs/evidence/m2-user-interaction-100-raw-2026-05-19.log`, `docs/evidence/m2-user-interaction-100-records.json`, `docs/screenshots/m2-user-interaction-100/` (101 PNGs).
- [x] Balerion V0015 review of 100-case evidence: `../messages/2026-05-19-Balerion-V0015-M2-100-case-screenshot-review.md`.
- [x] Local installation/backup handover addendum created after Dino asked whether Bryan's handbooks explain local install/run requirements: `../handover/MS2-handover-2026-05-19/WWSC-Local-Installation-and-Backup-Guide-2026-05-19.pdf` plus source `.md`/`.html`.
- [x] Future handbook requirement locked in: `../handover/HANDBOOK-REQUIREMENTS.md` now requires local install, SQLite licence/runtime notes, local data storage, backups, and troubleshooting in every future customer handbook.
- [x] v2.9.0 / M2 delivery update sent to Bryan by Dino and archived: `../messages/2026-05-19-outgoing-to-bryan-v290-m2-delivery-sent-confirmed.md`.
- [x] Bryan graph/history-data question archived: `../messages/2026-05-20-Bryan-inbound-graphs-history-question.md`.
- [x] Screenshot archived: `../messages/attachments/2026-05-20-upwork-bryan-graphs-history-question.png`.
- [x] Reply draft prepared: `../messages/2026-05-20-draft-to-bryan-graphs-history-question.md`.
- [x] Bryan next-step question archived: `../messages/2026-05-21-Bryan-inbound-what-do-you-need-now.md`.
- [x] Screenshot archived: `../messages/attachments/2026-05-21-upwork-bryan-what-do-you-need-now.png`.
- [x] Reply draft prepared: `../messages/2026-05-21-draft-to-bryan-next-needed-m2-acceptance-m3-gate.md`.
- [x] Dino sent M2 acceptance request / M3 gate reply to Bryan: `../messages/2026-05-21-outgoing-to-bryan-m2-acceptance-request-sent-confirmed.md`.
- [x] Sent screenshot archived: `../messages/attachments/2026-05-21-upwork-outgoing-bryan-m2-acceptance-request-sent.png`.
- [x] Bryan M2 "is met" + production/commercial questions archived: `../messages/2026-05-23-Bryan-inbound-m2-met-production-questions.md`.
- [x] Dino sent final M2 release / commercial production boundary reply: `../messages/2026-05-23-outgoing-to-bryan-commercial-scope-boundary-sent-confirmed.md`.
- [x] Dino confirmed on 2026-05-29 11:04 Europe/Berlin: Bryan paid/released M2 and commissioned M3.
- [x] Claude Code M3 development handoff created: `../messages/2026-05-29-1105-Balerion-To-Claude-WWSC-M3-Development-Handoff.md`.
- [x] Mandatory M3 user-interaction proof spec created: `docs/tests/M3-USER-INTERACTION-TEST-SPEC-v3.0.0.md` (100 cases).
- [x] Claude Code M3 handoff amended to require the spec before implementation signoff.
- [x] M3 Phase-1 baseline verification (branch=main, HEAD 7b4dcc5, origin/main 3f22593, tag v2.9.0=8d167fd, package.json 2.9.0) — matches Balerion's claimed baseline.
- [x] M3 PRD authored on branch `dev/m3-prd-planning`: `REQUIREMENTS-M3-POINTSCORE-REPORTS.md` (R-M3-01..R-M3-12 + Cross-Reference to UIT-M3-001..UIT-M3-100).
- [x] M3 acceptance checklist: `DEV-CHECKLIST-M3-POINTSCORE-REPORTS.md` (per-requirement gates + blocking-dependency matrix + evidence layout that matches the UIT-M3 spec's Required Final Protocol Format).
- [x] M3 questions and assumptions: `M3-QUESTIONS-AND-ASSUMPTIONS-2026-05-29.md` (QA-01..QA-13 + QA → UIT-M3 PROVISIONAL unblock map).
- [x] Claude → Balerion PRD-phase handoff: `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-PRD-Handoff.md`.
- [x] Balerion 2026-05-29 12:10 "You Are Next" implementation directive received: `../messages/2026-05-29-1210-Balerion-To-Claude-WWSC-M3-You-Are-Next.md`.
- [x] M3 V0014 first commit on feature branch: `7712067` bumps to v2.10.0 on `dev/v2.10.0-m3-history-graphs`.
- [x] R-M3-05 implementation: `src/public/js/screens/member-graph.js` + Members "📈 Graphs" action + script tag. Commit `6283ce6`.
- [x] R-M3-05 E2E runner: `scripts/e2e-m3-history-graphs.cjs` (commit `7f7a0a3`).
- [x] R-M3-05 evidence: 19 PASS / 1 NA (UIT-M3-016 deferred) / 0 FAIL / 0 PROVISIONAL, 0 console errors, 20 screenshots under `docs/screenshots/m3-user-interaction-v3.0.0/`, protocol at `docs/evidence/m3-user-interaction-v3.0.0/m3-history-graphs-protocol.md`.
- [x] R-M3-08 history retention policy documentation: `docs/M3-HISTORY-RETENTION-POLICY.md` (QA-12 working answer).
- [x] R-M3-11 M2 regression rerun on M3 branch with `WWSC_E2E_EXPECTED_VERSION=2.10.0`: 55 PASS / 0 FAIL (`e2e-m2-time-history`) + 98 PASS / 2 NA / 0 FAIL (`e2e-m2-user-interaction-100`). Logs archived as `docs/evidence/m2-*.log.m3-regression`.
- [x] R-M3-12 out-of-scope code review: clean (`src/server.js`, `src/db.js`, `src/seed.js`, `render.yaml`, `package-lock.json` all untouched).
- [x] Claude → Balerion delivery handoff (R-M3-05 slice): `../messages/2026-05-29-Claude-To-Balerion-WWSC-M3-History-Graphs-Delivery.md`.
- [x] R-M3-05 accepted PASS after clean-HEAD evidence rerun and Balerion QA.
- [x] Accepted/paid/deployed M2 baseline backup created: `../backups/2026-05-29-v2.9.0-accepted-paid-deployed/`.
- [x] Forward-build guardrail established: M1/M2/v2.9.0 accepted behavior is protected; M3 must build additively and not guess unknown rules.
- [x] Dino/Nedim sent Bryan the M3 Pointscore / Constitution clarification questions on 2026-05-29 ~22:15 Europe/Berlin; sent-confirmed record: `../messages/2026-05-29-outgoing-to-bryan-m3-pointscore-constitution-questions-sent-confirmed.md`.
- [x] Bryan's 2026-06-02 partial pointscore answer archived and mapped: `../messages/2026-06-02-Bryan-inbound-m3-event-separated-month-season-addition.md`.
- [x] Dino/Nedim sent Bryan the M3 pointscore assumptions message after deciding not to chase another clarification round: `../messages/2026-06-02-outgoing-to-bryan-m3-pointscore-assumptions-sent-confirmed.md`.
- [x] Balerion prepared the strict M3 pointscore Claude Code directive: `../messages/2026-06-03-0645-Balerion-To-Claude-WWSC-M3-Pointscore-Implementation-Directive.md`.
- [x] Balerion prepared the mandatory 120-case M3 user-interaction test spec: `USER-INTERACTION-TEST-SPEC-M3-POINTSCORE-REPORTS-v3.0.1.md`.

## 📋 NÄCHSTER SCHRITT (sofort ausführbar)
Was: Dino can send Bryan the prepared final reply and ask him to retest using the hosted demo's restored/reseeded completed-event dataset.

Kriterium fertig (current gate): Bryan receives the precise storage + retest-data reply; next Bryan reply is archived and classified before any further code or client-response step.

## ⚠️ OFFENE PUNKTE / SCOPE-GRENZEN
- Pointscore/reports/graphs/constitution scoring are M3, not retroactive M2. Bryan's 2026-06-02 answer partially clarified event-separated points plus monthly/season addition; Dino/Nedim then sent Bryan the working assumptions. Implementation is released under those sent assumptions, but Constitution-specific behavior remains "adjustable later" unless Bryan provides a separate Constitution document.
- Commercial hosted version / multiple clubs / customer isolation / backups / access control / maintenance remain separate commercial/productization scope, not automatic M3.
- Stable M1/v2.8.12 unverändert (backup-Branch und File-Snapshot existieren).
- **Keine Carry-overs mehr.** `UI-M2-F06` / `UI-M2-F08` / `UI-M2-C04` sind unter ausführbarer Browser-Evidenz geschlossen.
- Safety: Dino authorized push/deploy/tag for v2.10.1 on 2026-06-04. No live data mutation. No Bryan/client contact by Balerion unless Dino explicitly instructs sending.

## 📊 FORTSCHRITT
Dev-loop preparation: 6/6 spec artifacts
Implementation: 9/9 checklist tasks done
Browser-E2E evidence: 55 PASS / 0 FAIL / 0 console errors (Full-Proof Rerun)
Expanded user-interaction screenshot spec: 98 PASS / 2 NOT APPLICABLE / 0 FAIL / 0 BLOCKED, 101 screenshots, Balerion V0015 review complete
Quality gate: local `main` post-merge verification complete; 100-case screenshot proof accepted; Render live-smoke passed; Bryan update sent; Bryan M2 acceptance/payment now confirmed by Dino; M3 commissioned; R-M3-05 accepted PASS; M2 accepted/paid/deployed backup created; Bryan clarification questions sent; Bryan partial aggregation answer archived/mapped; Dino/Nedim sent the follow-up assumptions message; Claude Code implemented M3 pointscore/reports under those assumptions; Balerion independently verified M3 and M2 regression evidence; Dino authorized deploy; v2.10.1 was deployed/live-smoked; Dino sent the Bryan v2.10.1/M3 delivery update on 2026-06-04 09:53 Europe/Berlin. Current gate: wait for Bryan's response and archive/classify it before acting.

## 2026-05-29 22:30 Resume Note

Bryan's 2026-06-02 reply is archived and mapped as a partial answer. Dino/Nedim then sent Bryan the assumptions message, so we are no longer waiting for another clarification round before pointscore work. Next: release a constrained M3 pointscore directive to Claude Code under the sent assumptions: event-separated points, monthly/season totals by simple addition, existing Excel pointscore sheets as working scoring source, separate Constitution differences adjustable later. Do not invent Constitution rules or hard-code them as confirmed truth.

Protect the accepted/paid/deployed `v2.9.0` / M1 / M2 baseline, especially Race/Heat/Breaker/Ranking/Time-History behavior. Restore/comparison backup: `../backups/2026-05-29-v2.9.0-accepted-paid-deployed/`, source `v2.9.0` commit `8d167fdcc787f663c7b4168d32096ff5baa66b35`.

Last known Claude Code state: branch `dev/v2.10.0-m3-history-graphs`, HEAD `79751e6`, R-M3-05 PASS, guardrail accepted, no push/deploy/tag/Bryan contact. Next evidence gate must include browser E2E flows, raw logs, screenshots/traces, console-error check, and Requirement -> Test -> Evidence mapping.
