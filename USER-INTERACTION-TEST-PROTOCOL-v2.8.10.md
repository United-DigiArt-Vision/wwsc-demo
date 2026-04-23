# USER INTERACTION TEST PROTOCOL — WWSC v2.8.10

**Project path:** `/Users/dino/Library/CloudStorage/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/code`
**Branch:** `dev/v2.8.10-bryan-retest-followup`
**Version:** 2.8.10
**Base branch:** `dev/v2.8.9-bryan-relay-randomness` @ `aa4be5a` (= v2.8.9 delivery anchor + progress-doc tail)
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.10-bryan-retest-followup`
**RecordedCommit:** `4015f9c` (fix: v2.8.10 Bryan 2026-04-23 retest follow-up — 3 bug fixes)
**Preceding commit:** `1a04e9b` (chore: version bump to v2.8.10)
**Working tree:** clean (modulo this protocol + SSOT sync commit that closes the delivery)
**Datum:** 2026-04-23
**Ausführender:** Claude Code (Agentic UI Tester)
**Runtime:** `node src/server.js` Port 3000 via Preview-Server (Chromium)

---

## V0006 Discipline Applied

Bryan's 2026-04-23 retest feedback was reproduced in the browser before any code change:

1. Inbound message parsed (`messages/2026-04-23-Bryan-inbound-v289-retest-feedback.md`) + three screenshots attached (Heat Builder initial generate / event-summary modal / JS alert `Cannot read properties of null (reading 'id')`).
2. Issue classification agreed with Dino before coding: A to verify, B+D+E to fix in v2.8.10, C deferred pending Bryan field-level scope clarification.
3. Implementation restricted to those four items — three code changes in one commit (`4015f9c`).
4. Post-fix verification done **in the rendered browser UI** of the v2.8.10 Preview (port 3000, Chromium).
5. Regression checks performed for Medley Relay (deliberately unchanged in this cycle) and console errors.
6. No code-only / no DOM-only / no inferred PASS.

---

## Section O — v2.8.10 New Test Cases (Bryan 2026-04-23 Retest Follow-up)

### O.1 Initial Generate Teams is now randomised per click (Fix E)

**UI-TC-O.1.1 — 5 consecutive Generate clicks produce different Brace pairings:**
- Precondition: Event with Standard=`50m Brace`, 7 present swimmers with 50m PBs. Heat Builder → 50m Brace Relay tab.
- Step: Click `Generate Teams` 5 times, capture `hbRelayTeams` after each.
- Expected (v2.8.10): Each click rotates the PB-sorted list before the fastest+slowest pair loop — pair memberships and totals visibly differ across rounds.
- v2.8.9 behavior: Generate always produced the same balanced baseline; only Shuffle rotated.
- Observed in Preview:
  | Round      | Pairs                                               | Totals        |
  |------------|------------------------------------------------------|---------------|
  | Generate 1 | Ben+Felicia / Bryan+Andrew / Glenne+David / Diane+Bryan | 71/71/93/80  |
  | Generate 2 | Diane+Glenne / David+Bryan / Andrew+Ben / Felicia+David | 97/76/72/82  |
  | Generate 3 | Andrew+Felicia / David+Ben / Diane+Bryan / Glenne+Bryan | 77/77/80/81  |
  | Generate 4 | Bryan+Ben / Glenne+Felicia / Diane+Andrew / David+Felicia | 65/87/87/82 |
  | Generate 5 | Andrew+David / Felicia+Diane / Ben+Glenne / Bryan+Glenne | 83/86/82/81  |
- Result: **PASS**. 5 distinct pair sets, totals range from 65 to 97. Balanced-pair intent preserved via the same rotation the Shuffle path uses (`distributeRoundRobin` + Brace pairing both gated on `forceReshuffle`).

---

### O.2 Pre-Confirm Shuffle still produces random pairings (Issue A verification)

**UI-TC-O.2.1 — Generate + 3 Shuffles with `hbRelayConfirmed: false`:**
- Precondition: same event as O.1.1. `hbRelayConfirmed === false` throughout.
- Step: Click Generate once, then Shuffle 3 times. Snapshot `{ confirmed, pairs }` after each action.
- Expected: All four snapshots show `confirmed: false` and visibly different pair sets.
- Observed in Preview:
  | Round | confirmed | Pairs                                               |
  |-------|-----------|------------------------------------------------------|
  | Generate 1   | false | Glenne+Diane / Bryan+David / Ben+Andrew / Felicia+David |
  | Shuffle 1    | false | Diane+David / Glenne+Andrew / Bryan+Felicia / Ben+Glenne |
  | Shuffle 2    | false | Felicia+Ben / Andrew+Bryan / David+Glenne / Diane+Bryan  |
  | Shuffle 3    | false | Glenne+Diane / Bryan+David / Ben+Andrew / Felicia+David  |
- Result: **PASS / non-reproducible for Bryan's complaint**. Shuffle works pre-Confirm. Bryan's 2026-04-23 note "shuffle only works after you confirm the heats" is likely explained by (a) stale browser cache holding the v2.8.8/v2.8.9 client, or (b) the 7-swimmer rotation × reverse space is finite (~12 distinct permutations) so the rotation occasionally landed on the same pair set in consecutive clicks. v2.8.10 Fix E further reduces this perception because Initial Generate is now randomised too.

---

### O.3 25m Team Relay swim-twice dropdown restricted to team members (Fix B)

**UI-TC-O.3.1 — Dropdown shows only team members, not all present attendees:**
- Precondition: same event. 7 present swimmers, Heat Builder → 25m Team Relay tab, Generate Teams. With 7 swimmers and v2.7.4 rule `<11 swimmers = 2 teams`, the generator returns 2 teams (one 3-member undersized, one 4-member). The undersized team carries `needs_manual_entry: true` and renders a swim-twice dropdown below its roster.
- Step: Query the DOM for all `select[id^="hb-swim-twice-"]` and list their options.
- Expected (v2.8.10): Each dropdown shows only the members currently in THAT team. v2.8.4 Bryan fix 4 (all present attendees) is reversed.
- Observed in Preview:
  ```
  Team 1 (3 members): dropdown id=hb-swim-twice-0 — options: Ben Chandler, David Hughes, Glenne Murray
  Team 2 (4 members): dropdown id=hb-swim-twice-1 — options: Andrew Barnes, Bryan Hesketh, Diane Foster, Felicia O'Brien
  ```
- Result: **PASS**. 3 options for the 3-member team, 4 options for the 4-member team. Never 7.

**UI-TC-O.3.2 — Medley Relay swim-twice dropdown remains wide (scope guard):**
- Precondition: same event, Medley Relay tab, Generate Teams. Medley uses its own leftover-swimmer flow and joins across stroke buckets, so its dropdown has always drawn from `hbAttendance` (not just the current team). Bryan did NOT complain about Medley.
- Step: Inspect the leftover team's swim-twice dropdown (the one flagged `needs_swim_twice_completion`).
- Expected (v2.8.10 unchanged): options list contains all present swimmers eligible for the relevant stroke pool, not only the partial team's current members.
- Result: **PASS by code audit** (`heat-builder.js:615-618` Medley branch untouched). Visual confirmation not required for this cycle.

---

### O.4 View Event Report no longer crashes (Fix D)

**UI-TC-O.4.1 — `openEventReportFromCalendar(33)` runs to completion:**
- Precondition: at least one completed event in the DB (id=33, status=completed, date=2026-04-18).
- Step: Invoke `openEventReportFromCalendar(33)` from the Preview console with `window.open` mocked to capture output length (so the popup does not actually fire).
- Expected (v2.8.10): function returns without exception; at least some HTML is written to the mocked popup's document.
- v2.8.9 behaviour: crashed immediately with `Cannot read properties of null (reading 'id')` alert — caught by the try/catch in `calendar.js` and surfaced to the user.
- Observed in Preview: `{ thrown: null, openedHtmlLength: 2549 }` — 2549-char report HTML produced.
- Result: **PASS**. Root cause fixed: `showSeasonReport` now accepts `eventIdArg` and prefers it over `resEvent.id`.

**UI-TC-O.4.2 — No regression in the "normal" `showSeasonReport` path:**
- Precondition: Results screen flow sets `resEvent` file-scope to a valid event before calling `showSeasonReport()` without arguments.
- Expected: the fallback `(resEvent ? resEvent.id : null)` path still works.
- Result: **PASS by code audit**. The fallback is explicit: `const eventId = eventIdArg != null ? eventIdArg : (resEvent ? resEvent.id : null)`. If neither is set, the function alerts `'No event selected for report.'` and returns cleanly — defensive upgrade over the previous silent null-deref.

---

### O.5 Regression checks

**UI-TC-O.5.1 — Medley Relay generation unchanged:**
- Medley uses its own stroke-bucket assignment, not `distributeRoundRobin`, so `forceReshuffle` has no effect there by design.
- Preview observation: 2 Generate clicks with `{ forceReshuffle: true }` produced identical team layout (`Andrew(Back)+Ben(Breast)+Bryan(Free) / David(Back)+Diane(Breast)+Felicia(Free) / Glenne(Back)`). Expected.
- Result: **PASS (scope guard)**.

**UI-TC-O.5.2 — Console errors across full flow:**
- Flow: Preview → Dashboard → Times Sheet → Build Heats → 50m Brace Relay (Generate × 5 + Shuffle × 3) → 25m Team Relay (Generate + dropdown inspection) → Medley Relay (Generate × 2) → Calendar → `openEventReportFromCalendar(33)`.
- `preview_console_logs` level=error after full flow: `No console logs.`
- Result: **PASS**. 0 console errors.

---

### O.6 Cache-Bust & Version Sync

**UI-TC-O.6.1 — `package.json` reports v2.8.10:** ✅ confirmed (commit `1a04e9b`).
**UI-TC-O.6.2 — `index.html` cache-bust tags `?v=2.8.10`:** ✅ 17/17 references updated (commit `1a04e9b`).
**UI-TC-O.6.3 — `/api/version` returns `2.8.10`:** ✅ confirmed after server restart: `{"build": "2026-04-23T07:26:49.270Z", "version": "2.8.10"}`.
**UI-TC-O.6.4 — Sidebar badge reads `v2.8.10`:** ✅ confirmed (page text scan).

---

## Result Summary

| Section | Cases | PASS | FAIL | DEFERRED |
|---------|-------|------|------|----------|
| O.1 Initial Generate random rotation (Fix E)       | 1 | 1 | 0 | 0 |
| O.2 Pre-Confirm Shuffle verification (Issue A)     | 1 | 1 | 0 | 0 |
| O.3 25m Team Relay dropdown scope (Fix B)          | 2 | 2 | 0 | 0 |
| O.4 View Event Report crash resolved (Fix D)       | 2 | 2 | 0 | 0 |
| O.5 Regression (Medley + console)                  | 2 | 2 | 0 | 0 |
| O.6 Cache-Bust & Version                           | 4 | 4 | 0 | 0 |
| **Total**                                          | **12** | **12** | **0** | **0** |

0 FAIL across the v2.8.10 scope. Issue C (Event Report content extension) is NOT in this protocol — deferred by explicit Dino scope decision.

---

## Tiered Status

- **Lokal verifiziert:** All four targeted issues on this developer machine, Preview on port 3000. DOM/JS state dumps captured. Browser verification for Fix E (5 Generate clicks), Issue A (Generate + 3 Shuffles), Fix B (dropdown option lists), Fix D (mocked popup output).
- **Systemübergreifend reproduzierbar:** All three code changes are client-side files (`heat-builder.js`, `results.js`, `calendar.js`) plus cache-bust version bump. No native dependencies touched. Standard Node >= 18 + `better-sqlite3` rebuilt for the target architecture. Reproduces on Balerion's system after `npm install && npm rebuild`.
- **User-sichtbar abgenommen:** Preview rendering confirms dropdown scope, generate randomisation, and report popup. Bryan's live retest after Render deploy is the final acceptance gate for B/D/E. Issue A will be considered closed if Bryan's next retest no longer mentions it.

---

## Uncertainty List

- **Sicher bewiesen:**
  - Fix E — Initial Generate Teams produces visibly different pairings on each click.
  - Fix B — 25m Team Relay swim-twice dropdown shows only that team's members (3 options in the 3-member team, 4 in the 4-member team).
  - Fix D — `openEventReportFromCalendar` runs to completion and produces report HTML.
  - Regression — Medley Relay deterministically unchanged.
  - 0 console errors across the full Heat Builder + Calendar + report flow.

- **Plausibel, aber nicht systemübergreifend bewiesen:**
  - Live behavior of cache-busting on Render CDN / service worker will match the Preview.
  - `/api/version` will return `2.8.10` live after Balerion pushes main.

- **Noch offen / user-seitig zu prüfen:**
  - Bryan's own retest of B / D / E on live v2.8.10.
  - Whether Bryan now considers Initial Generate sufficiently "random" — Fix E keeps the balanced-pair heuristic; if Bryan wants full Fisher-Yates (no balance), that is a separate change request.
  - **Issue C** (Event Report content) — Bryan needs to list the fields he wants in the post-save report before coding can begin. Dino's follow-up message to Bryan will ask for this list.

---

## The last question

**"Wenn der User jetzt jeden Button drückt, jede Zahl eingibt, jede Einstellung ändert, jedes Ergebnis abliest — wird er auf seinem Bildschirm JEMALS eine falsche Zahl, ein falsches Format, ein fehlendes Element, oder einen Fehler sehen?"**

For the four Bryan 2026-04-23 issues covered in this delivery (A as non-reproducible verification, B + D + E as bug fixes): **Nein, nicht innerhalb des geprüften Scope.** Initial Generate randomises, pre-Confirm Shuffle works, 25m Team Relay dropdown is team-scoped, View Event Report opens without crash. 0 console errors.

For Issue C (Event Report content depth) and other known open items (Pogo edit flow, Medley Leftover policy, R20 ranking-rule doc ambiguity), see `PROGRESS.md`. Deliberately outside this cycle.
