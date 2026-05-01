# WWSC v2.8.11 Retrospective Browser-E2E Evidence

Date: 2026-05-01
Scope: Bryan latest v2.8.10 retest feedback, retested against latest live/code version v2.8.11.
Runner: Playwright with installed Google Chrome (V0006 v5.5 / Playwright Browser-E2E standard).
Base URL: http://127.0.0.1:3000

## Summary

- Checks: 23
- PASS: 23
- FAIL: 0
- Screenshots: `docs/screenshots/v2.8.11-browser-e2e-retro/`

## Bryan feedback coverage

- Relay pre-generation display clean: WWSC-E2E-005..009
- Print heading consistency/prominence: WWSC-E2E-012..014
- Remove `(decides ranking)`: WWSC-E2E-015..018
- Event Report Andrew Barnes Special Entry `N`: WWSC-E2E-019..022
- Console/no obvious browser error: WWSC-E2E-023

## Results

| ID | Status | Evidence |
|---|---|---|
| WWSC-E2E-001 | PASS | /api/version is {"version":"2.8.11","build":"2026-05-01T05:03:39.148Z"} |
| WWSC-E2E-002 | PASS | 25m Team Relay test race exists |
| WWSC-E2E-003 | PASS | sidebar/body shows v2.8.11 after page load |
| WWSC-E2E-004 | PASS | navigated to Heat Builder via click |
| WWSC-E2E-005 | PASS | 25m Team Relay selected |
| WWSC-E2E-006 | PASS | Generate Teams is clear next action before generation |
| WWSC-E2E-007 | PASS | no confusing 0/0 teams complete banner before generation |
| WWSC-E2E-008 | PASS | no unassigned swimmer pool before generation |
| WWSC-E2E-009 | PASS | no Add Team control before generation |
| WWSC-E2E-010 | PASS | teams generated via click |
| WWSC-E2E-011 | PASS | team total/target remain visible |
| WWSC-E2E-012 | PASS | relay print headings consistent: 18px/900, 18px/900, 18px/900 |
| WWSC-E2E-013 | PASS | relay print headings prominent enough |
| WWSC-E2E-014 | PASS | page heading hierarchy preserved h1=20px h2=16px |
| WWSC-E2E-015 | PASS | Results screen reached via confirm=click, resultsNav=click |
| WWSC-E2E-016 | PASS | variance row remains visible |
| WWSC-E2E-017 | PASS | removed decides ranking wording is absent |
| WWSC-E2E-018 | PASS | relay placing still visible |
| WWSC-E2E-019 | PASS | Andrew Barnes report row renders N: Andrew Barnes	N |
| WWSC-E2E-020 | PASS | Andrew Barnes report row does not render dash |
| WWSC-E2E-021 | PASS | Event Report keeps Special Entry column visible |
| WWSC-E2E-022 | PASS | Event Report has no visible undefined/null/NaN |
| WWSC-E2E-023 | PASS | relevant browser console/page errors: 0 (raw: 1) |
