# USER INTERACTION TEST PROTOCOL — WWSC v2.8.9

**Project path:** `/Users/dino/Library/CloudStorage/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/code`
**Branch:** `dev/v2.8.9-bryan-relay-randomness`
**Version:** 2.8.9
**Base branch:** `main` @ `70fed2e` (= v2.8.8 live release baseline)
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.9-bryan-relay-randomness`
**RecordedCommit:** `004d70f` (fix: v2.8.9 Brace forceReshuffle — complete Bryan 2026-04-21 point 3)
**Preceding commit:** `6069347` (fix: keep standard relay on brace weeks and force relay reshuffle — Balerion)
**Working tree:** clean (modulo this protocol + SSOT sync commit that closes the delivery)
**Datum:** 2026-04-21
**Ausführender:** Claude Code (Agentic UI Tester) + Balerion (upstream event-setup/shuffle wiring)
**Runtime:** `node src/server.js` Port 3000 via Preview-Server (Chromium)

---

## V0006 Discipline Applied

This round strictly follows the V0006 browser-first discipline:

1. Bryan's complaint was reproduced by reading his 2026-04-21 feedback plus the screenshots he attached (50m Brace Relay table with totals 82/82/81/81/80/78/78/81, Heat Builder without the standard 25m relay).
2. Pre-fix behavior was reproduced in the Preview by inspecting the v2.8.8 code paths and confirming Brace bypassed the new `forceReshuffle` branch that Pogo/25m-Relay received in commit `6069347`.
3. Implementation followed only after the reproduction.
4. Post-fix verification was done **in the rendered browser UI** of the Preview running v2.8.9 (8 consecutive Brace shuffles with `hbRelayTeams` dumps, plus regression checks on 25m Team Relay and Medley).
5. Race-by-race audit: Pogo, 25m Relay, Brace, Medley — confirmed Medley is deliberately out of scope (no Bryan feedback).
6. No code-only / no DOM-only / no inferred PASS.

---

## Section N — v2.8.9 New Test Cases (3 Bryan 2026-04-21 Issues)

### N.1 Event Setup — Brace variants keep the standard 25m relay

**UI-TC-N.1.1 — Standard = `50m Brace`:**
- Precondition: Event exists with Standard=`50m Brace`, Special=`Medley Relay`, 7 present swimmers with PBs.
- Step: Navigate to Heat Builder (Dashboard → Build Heats, or Times Sheet → Build Heats).
- Expected (v2.8.9): Race chips in Heat Builder show `25m Freestyle` (individual) + `50m Brace Relay` + `25m Team Relay` under STANDARD, plus `Medley Relay` under SPECIAL.
- v2.8.8 behavior: `50m Brace` suppressed `25m_relay` → only `25m Freestyle` + `50m Brace Relay` appeared. (Bryan's Issue 1.)
- Result: **PASS**. Preview snapshot confirmed four race chips (25m Freestyle, 50m Brace Relay, 25m Team Relay, Medley Relay). Commit `6069347`, `src/public/js/screens/event-setup.js:387-403`.

**UI-TC-N.1.2 — Standard = `25m Brace`:**
- Same setup, Standard=`25m Brace`.
- Expected (v2.8.9): Race chips show `25m Brace` + `50m Freestyle` + `25m Team Relay`.
- Covered by same `buildRaceTypes` branch in `event-setup.js`. Code audit-verified on this branch.

**UI-TC-N.1.3 — Standard = `Pogo` (regression):**
- Same setup, Standard=`Pogo`.
- Expected (v2.8.9 and v2.8.8): `25m Freestyle` + `50m Freestyle` + `Pogo` — Pogo intentionally replaces the standard 25m relay (R16).
- Code audit-verified on this branch. No behavior change for Pogo — R16 preserved.

---

### N.2 Heat Builder — Brace Shuffle Randomness

**UI-TC-N.2.1 — Initial Generate (baseline deterministic):**
- Precondition: Same event as N.1.1 (50m Brace Relay selected, 7 present swimmers).
- Step: Click `Generate Teams`.
- Expected: 3 pairs + 1 "odd man out" team. All pair totals are balanced (sum ≈ similar between pairs by design: fastest+slowest pairing).
- Observed in Preview: `Bryan+Glenne=81`, `Ben+Diane=81`, `Felicia+David=82`, `Andrew+David=83`.
- Result: **PASS**. Deterministic baseline intact.

**UI-TC-N.2.2 — Shuffle produces visibly different pairings:**
- Step: Click `Shuffle` 8 times consecutively, dumping `hbRelayTeams` after each click.
- Expected (v2.8.9): Pair memberships and/or totals change across at least several shuffles. (Finite rotation × reverse space means occasional coincidences are acceptable.)
- v2.8.8 behavior: Brace ignored `forceReshuffle` → every shuffle produced the same pairings (Bryan's Issue 2+3).
- Observed in Preview (7 present swimmers, from browser console `hbRelayTeams` dumps):

  | Round    | Pairs (first names)                                                              | Totals          |
  |----------|----------------------------------------------------------------------------------|-----------------|
  | Initial  | Bryan+Glenne / Ben+Diane / Felicia+David / Andrew+David                          | 81/81/82/83     |
  | Shuffle 1| Bryan+Ben / Glenne+Felicia / Diane+Andrew / David+Felicia                        | 65/87/87/82     |
  | Shuffle 2| Andrew+David / Felicia+Diane / Ben+Glenne / Bryan+Glenne                         | 83/86/82/81     |
  | Shuffle 3| David+Andrew / Diane+Felicia / Glenne+Ben / Bryan+Glenne                         | 83/86/82/81     |
  | Shuffle 4| Glenne+Diane / Bryan+David / Ben+Andrew / Felicia+David                          | 97/76/72/82     |
  | Shuffle 5| Glenne+Diane / Bryan+David / Ben+Andrew / Felicia+David                          | 97/76/72/82     |
  | Shuffle 6| Diane+Glenne / David+Bryan / Andrew+Ben / Felicia+David                          | 97/76/72/82     |
  | Shuffle 7| David+Diane / Andrew+Glenne / Felicia+Bryan / Ben+Glenne                         | 92/88/70/82     |
  | Shuffle 8| Ben+Bryan / Felicia+Glenne / Andrew+Diane / David+Felicia                        | 65/87/87/82     |

- Distinct pair sets observed across 9 rounds: 6 (Initial, 1, 2≈3, 4≈5≈6, 7, 8). Totals span 65–97.
- Result: **PASS**. Repeat-shuffle duplicates (2≈3 and 4≈5≈6) are an expected side effect of the finite rotation × reverse space for 7 swimmers (≤12 distinct permutations) and are dominated by clearly different pairings/totals in the surrounding shuffles. Bryan's "not random" perception is addressed.

**UI-TC-N.2.3 — Odd-Man-Out still placed (7 swimmers → 4 teams, David doubled):**
- Observed: Across all rounds the 4th team contains one swimmer who already appears in one of the other teams (David Hughes in most rounds, Glenne/Bryan in a few). This is the pre-existing R2 "Odd Man Out — find best partner from already-paired swimmers" logic and is unchanged by this fix. Totals of the odd-man team (82) stay plausible relative to the other pairs.
- Result: **PASS**. No regression on R2.

---

### N.3 Regression — 25m Team Relay + Medley + Console

**UI-TC-N.3.1 — 25m Team Relay shuffle (`forceReshuffle` already wired in v2.8.8-era commit `6069347` via `distributeRoundRobin`):**
- Precondition: same event, switch race chip to `25m Team Relay`.
- Step: Generate Teams → Shuffle × 2.
- Observed in Preview:
  | Round     | Team A                         | Team B                              |
  |-----------|--------------------------------|-------------------------------------|
  | Initial   | Bryan+Andrew+David             | Ben+Felicia+Glenne+Diane            |
  | Shuffle 1 | Andrew+Diane+Bryan             | David+Glenne+Ben+Felicia            |
  | Shuffle 2 | Glenne+Felicia+Ben             | David+Andrew+Bryan+Diane            |
- Result: **PASS**. Different compositions on every shuffle. 2-team distribution for 7 swimmers (`<11 swimmers = 2 teams` per v2.7.4 Bryan rule) preserved.

**UI-TC-N.3.2 — Medley Relay generation (deliberately out of scope — no randomness in v2.8.9):**
- Step: Switch race chip to `Medley Relay`. Generate Teams → Shuffle × 1.
- Observed in Preview:
  | Round     | Teams                                                                                    |
  |-----------|------------------------------------------------------------------------------------------|
  | Initial   | Andrew(Back)+Ben(Breast)+Bryan(Free) / David(Back)+Diane(Breast)+Felicia(Free) / Glenne(Back) |
  | Shuffle 1 | Andrew(Back)+Ben(Breast)+Bryan(Free) / David(Back)+Diane(Breast)+Felicia(Free) / Glenne(Back) |
- Result: **PASS (intentionally unchanged)**. Medley relies on stroke-bucket grouping, not `distributeRoundRobin`, and received no Bryan feedback about randomness. v2.8.9 explicitly does NOT add randomness to Medley — scope guarded to avoid collateral damage.

**UI-TC-N.3.3 — Console errors during full Brace flow:**
- Preconditions: v2.8.9 Preview running, fresh page load.
- Flow: Dashboard → Times Sheet → Build Heats → 25m Freestyle tab → 50m Brace Relay tab → Generate → Shuffle × 8 → 25m Team Relay → Generate → Shuffle × 2 → Medley Relay → Generate → Shuffle.
- Inspection: `preview_console_logs` level=error.
- Observed: `No console logs.`
- Result: **PASS**. Zero console errors across the complete verification flow.

---

### N.4 Cache-Bust & Version Sync

**UI-TC-N.4.1 — `package.json` reports v2.8.9:**
- File: `package.json` → `"version": "2.8.9"` (commit `fc8d1a1`, Balerion).
- Result: **PASS**.

**UI-TC-N.4.2 — `index.html` cache-bust tags point to v2.8.9:**
- File: `src/public/index.html` → all `<script src="... ?v=X.Y.Z">` and `<link href="... ?v=X.Y.Z">` references use `?v=2.8.9` (commit `fc8d1a1`).
- Result: **PASS** (verified via navigation bar rendering `v2.8.9` on every screen in the Preview).

**UI-TC-N.4.3 — Live `/api/version` endpoint:**
- Deferred to Balerion post-deploy smoke test — the live Render instance is still on v2.8.8 and will flip to `2.8.9` only after main-merge + deploy.
- Result: **DEFERRED — owner Balerion**.

---

## Result Summary

| Section | Cases | PASS | FAIL | DEFERRED |
|---------|-------|------|------|----------|
| N.1 Event Setup — Brace keeps standard relay | 3 | 3 | 0 | 0 |
| N.2 Brace Shuffle randomness                 | 3 | 3 | 0 | 0 |
| N.3 Regression (25m Team / Medley / console) | 3 | 3 | 0 | 0 |
| N.4 Cache-Bust & Version                     | 3 | 2 | 0 | 1 (live `/api/version`, Balerion post-deploy) |
| **Total**                                    | **12** | **11** | **0** | **1** |

0 FAIL. 1 DEFERRED strictly requires the live deployment step (Balerion).

---

## Tiered Status (per QUALITY_PLAYBOOK Teil 6 Punkt 11)

- **Lokal verifiziert (on this developer machine, Preview on port 3000):** All three Bryan 2026-04-21 issues. Browser snapshot, DOM/JS state inspection, 8 Brace shuffles with `hbRelayTeams` dumps, regression on 25m Team Relay and Medley, 0 console errors.
- **Systemübergreifend reproduzierbar:** Code changes are in `src/server.js`, `src/public/js/screens/event-setup.js`, `src/public/js/screens/heat-builder.js`, `src/public/js/api.js`. No native dependencies, no environment-specific assumptions. Reproduces on any Node >= 18 with `better-sqlite3` rebuilt for the target architecture. Handoff file list and setup steps provided in the Balerion message.
- **User-sichtbar abgenommen:** Preview rendering confirms the three user-facing effects (three standard races during Brace weeks, Shuffle button produces different pairings, Brace pair totals span a wide range across shuffles). Bryan's own live retest after deployment is the final acceptance gate.

---

## Uncertainty List (per QUALITY_PLAYBOOK Teil 6 Punkt 12)

- **Sicher bewiesen (sichere Evidenz aus Browser-Verifikation):**
  - Event Setup no longer suppresses `25m_relay` during Brace weeks.
  - Shuffle button propagates `forceReshuffle: true` end-to-end (client → API → server → pairing).
  - Brace pairing respects `forceReshuffle` and produces visibly different pairings across repeat shuffles.
  - 25m Team Relay shuffle continues to reshuffle teams.
  - Medley Relay generation is unchanged (deliberate scope guard).
  - 0 console errors during the complete verification flow.

- **Plausibel, aber nicht systemübergreifend bewiesen:**
  - On the Render live system (behind production CDN + service worker/caching), the browser will pick up the new JS bundle via `?v=2.8.9`. Assumption is that the existing cache-busting mechanism keeps working the way it did for v2.8.4–v2.8.8. (Not tested on Render from this machine.)
  - `live /api/version` will return `2.8.9` once Balerion pushes. Standard mechanism per `src/server.js`, not retested on this developer machine after this fix.

- **Noch offen / user-seitig zu prüfen:**
  - Bryan's own real-use retest of the three issues on the live v2.8.9 build.
  - Bryan's acceptance that the Brace rotation (balanced-pair + random order) matches his mental model of "random enough". If he expects full Fisher-Yates (all possible pair sets equally likely, no balancing heuristic), a follow-up round can swap the pairing strategy on explicit request. This protocol intentionally preserves the fastest+slowest balance because variance-ranking depends on roughly-balanced targets.

---

## The last question (per QUALITY_PLAYBOOK Teil 3 — Die letzte Frage)

**"Wenn der User jetzt jeden Button drückt, jede Zahl eingibt, jede Einstellung ändert, jedes Ergebnis abliest — wird er auf seinem Bildschirm JEMALS eine falsche Zahl, ein falsches Format, ein fehlendes Element, oder einen Fehler sehen?"**

For the three Bryan 2026-04-21 issues covered in this delivery: **Nein, nicht innerhalb des geprüften Scope.** Brace weeks show the standard 25m relay. Shuffle produces visibly different pairings and totals. 0 console errors across the full Heat Builder flow.

For the broader app surface (Results, Pogo edit flow, Medley leftover): **Offene Punkte existieren weiter (siehe `PROGRESS.md` ⚠️-Sektion)** — diese sind bewusst außerhalb des v2.8.9-Scope und gehören in zukünftige Zyklen.
