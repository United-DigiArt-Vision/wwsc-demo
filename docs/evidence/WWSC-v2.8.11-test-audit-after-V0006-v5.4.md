# WWSC v2.8.11 Test Audit after V0006 v5.4 Browser-E2E Rule

Date: 2026-05-01
Project SSOT: `~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`
Live app: https://wwsc-demo.onrender.com
Live version: `2.8.11`
Audit trigger: Dino asked whether WWSC had all necessary tests including evidence under the new Browser-E2E standard.

## Conclusion

The original v2.8.11 delivery had meaningful evidence, but it was not fully aligned with the new V0006 v5.4 Browser-E2E standard because the main v2.8.11 verification was an automated/browser-assisted CDP script, not a dedicated Playwright-with-installed-Chrome Browser-E2E run.

I therefore performed a retrospective Browser-E2E run against the latest v2.8.11 state.

Result: PASS.

## Existing evidence before retrospective run

Existing artifacts:

- Test spec: `USER-INTERACTION-TEST-SPEC-v2.8.11.md`
  - 75 user-perspective cases scoped to Bryan's 2026-05-01 retest feedback.
- Existing protocol: `USER-INTERACTION-TEST-PROTOCOL-v2.8.11.md`
  - 56 automated/browser-assisted checks.
  - 56 PASS / 0 FAIL.
- Existing screenshots: `docs/screenshots/v2.8.11-bryan/`
  - Relay pre-generation clean state.
  - Generated relay teams.
  - Print-media relay headings.
  - Results without `(decides ranking)`.
  - Event Report showing Andrew Barnes Special Entry `N`.

Audit finding:
- Good coverage existed for the five Bryan issues.
- But it did not explicitly satisfy the newer Playwright/Chrome Browser-E2E fallback standard from V0006 v5.4.

## Retrospective Browser-E2E added

New artifacts:

- Playwright script: `scripts/e2e-v2811-browser-playwright.cjs`
- Evidence protocol: `docs/evidence/WWSC-v2.8.11-retrospective-browser-e2e-evidence.md`
- Raw log: `docs/evidence/WWSC-v2.8.11-retrospective-browser-e2e-raw.log`
- Screenshots: `docs/screenshots/v2.8.11-browser-e2e-retro/`

Runner:
- Playwright with installed Google Chrome.
- Local controlled app instance from latest v2.8.11 code.
- DB was backed up before test and restored after test.

Result:
- 23 checks executed.
- 23 PASS.
- 0 FAIL.

## Bryan feedback coverage

Bryan's latest feedback file:
`../messages/2026-05-01-Bryan-inbound-v2810-retest-feedback.md`

Coverage:

1. Relay selection display confusing before Generate Teams
   - Covered by: WWSC-E2E-005 through WWSC-E2E-011.
   - Screenshot: `02-relay-pre-generation-clean.png`, `03-relay-generated-teams.png`.
   - Result: PASS.

2. Printing heading consistency
   - Covered by: WWSC-E2E-012.
   - Screenshot: `04-print-media-heading-prominence.png`.
   - Result: PASS.

3. Printing headings more prominent
   - Covered by: WWSC-E2E-013 and WWSC-E2E-014.
   - Screenshot: `04-print-media-heading-prominence.png`.
   - Result: PASS.

4. Remove `(decides ranking)` wording from 25m Team Relay results
   - Covered by: WWSC-E2E-015 through WWSC-E2E-018.
   - Screenshot: `05-results-no-decides-ranking.png`.
   - Result: PASS.

5. Event Report Andrew Barnes Special Entry dash should be `N`
   - Covered by: WWSC-E2E-019 through WWSC-E2E-022.
   - Screenshot: `06-event-report-andrew-special-entry-n.png`.
   - Result: PASS.

6. Browser console / user confidence
   - Covered by: WWSC-E2E-023.
   - Result: PASS.
   - One raw 404 resource error was observed and ignored as non-product-relevant; no relevant browser console/page errors remained.

## Current gate

Ball remains with Bryan.

Next action when Bryan replies:
1. Archive exact inbound message and screenshots in `../messages/` first.
2. Read `code/PROGRESS.md`, `code/version/CURRENT_STATE.md`, this audit, and the sent-confirmation file.
3. Classify reply as acceptance / M1 blocker / scope expansion / payment-boundary.
4. If bug: reproduce with Browser-E2E before changing code.
5. Do not start Pointscore/M3 without M1/payment clarity or Dino's explicit instruction.

## SSOT reminder

The operative WWSC SSOT remains:
`~/Dropbox/Dino-Balerion-Claude-Code/Projekte/0004_swimming-app/`

Do not treat `~/wwsc-demo`, old workspace project folders, daily notes, or chat memory as a second project truth.
