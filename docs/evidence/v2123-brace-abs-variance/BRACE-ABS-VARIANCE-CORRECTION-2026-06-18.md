# WWSC v2.12.3 (prepared) — Brace Relay Placement: tie back to ABSOLUTE variance

**Date:** 2026-06-18
**Status:** PREPARED in working tree — NOT committed, NOT deployed. Awaiting Dino go + Bryan's detail message.
**Source:** Bryan Hesketh inbound 2026-06-18 (`../../../../messages/2026-06-18-Bryan-inbound-v2122-brace-abs-variance-newmembers-errorhandling.md`)

## Background — why v2.12.2 was wrong

v2.12.2 (commit `5128065`) changed brace/special-variance **tie detection** from absolute to **signed** variance, so a team at +100cs and one at −100cs received different places. Bryan tested live v2.12.2 and rejected it:

> "Off s team is +0.50 of their time then they will be equal to a team that is -0.50 of their time. It should be absolute variance."

This matches the documented business rule. `docs/SYSTEM-SPEC-v2.12.0.md` §11 (race ranking table) defines brace/pogo/medley_relay ranking as **"kleinste |variance|"** with **"Gleichstand = gleicher Platz"** — equal *distance* from target (equal absolute variance) shares a place. The v2.12.2 signed change violated our own SSOT spec.

## Fix (Part 1 of the v2.12.3 response)

- `src/server.js` `rankTieValue()` for `SPECIAL_VARIANCE_RACES` returns `Math.abs(variance)` again (same as `rankScore`), so teams equally far from target tie. Restores the pre-`5128065` behavior. Ordering is unchanged (nearest-to-target by absolute variance).
- `scripts/test-m3-pointscore-unit.cjs` UT14 updated: for variances `[0,-100,100,100,150]` expected places are now `[1,2,2,2,5]` (was `[1,2,3,3,5]`); test id renamed `UT14-brace-variance-absolute-tie`.

## Verification (this session, Claude 2026-06-18)

Pure-logic — `rankScore`/`rankTieValue` **extracted verbatim from the edited `src/server.js`** (read from disk and instantiated, not re-typed), DB place-loop from `rankRelayTeams()` replicated:

```text
PASS UT14 brace [0,-100,100,100,150]      -> places [1,2,2,2,5]
PASS Bryan +0.50 ties -0.50 [0,-50,50]    -> places [1,2,2]
PASS distinct abs [0,-30,80,-120]         -> places [1,2,3,4]
PASS standard relay total_time [5000,5000,5200] -> places [1,1,3]
ALL PASS
```

`node --check src/server.js` PASS; `node --check scripts/test-m3-pointscore-unit.cjs` PASS.

**NOT re-run this session:** the DB-backed suite `node scripts/test-m3-pointscore-unit.cjs` (17/0 incl. UT14) — shell node is x86_64 vs arm64 `better-sqlite3` → `ERR_DLOPEN_FAILED`. Must be confirmed in an arm64-node env (Mac Mini) before any deploy.

## STILL OPEN — do NOT deploy as a complete fix

1. **Person/team place mismatch** — Bryan: "1 person from a 2 person team [got] equal second when the team placing was 9th." In pointscore both team members inherit `team.place` (`src/pointscore.js:170`), so this mismatch originates elsewhere. Leading **HYPOTHESIS**: brace odd-man-out (odd participant count → one partner swims twice → appears in two teams, SYSTEM-SPEC §11). Needs Bryan's concrete example to confirm — do **not** guess.
2. **New members** — important requirement, missed at sign-off. Awaiting Bryan's spec.
3. **Error/issue handling** — manual pointscore edit, edit date, etc. Awaiting Bryan's spec.

Bryan: "I will try and be more concise with actual details tomorrow."

## Lesson recorded

The original brace task (`../../../../messages/2026-06-17-2206-Balerion-To-Claude-WWSC-Brace-Relay-Placement-Bug-Fix.md`) acted on an **interpretation** of Bryan's report ("tie only on exact variance"), not his verbatim words; his original message + screenshot IMG_7403 were never archived. Archive the customer's verbatim wording + screenshots BEFORE commissioning a fix.
