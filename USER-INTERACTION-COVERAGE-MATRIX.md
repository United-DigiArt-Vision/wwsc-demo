# USER INTERACTION COVERAGE MATRIX — WWSC v2.8.0

**Testcases:** 18 | **PASS:** 18 | **FAIL:** 0

| Spec ID | Requirement | Getestet? | Status | Evidenz |
|---------|------------|-----------|--------|---------|
| TC-01 | R1: 50m Zusammenlegung | JA | PASS | Timesheet zeigt 50m PBs |
| TC-02 | R2: Brace Odd-Man-Out | JA | PASS | 13→7 pairs, 0 solo, 1 double |
| TC-03 | R4: No Split in HB | JA | PASS | Headers: Leg\|Swimmer\|PB |
| TC-05 | R5: (Y) Flag korrekt | JA | PASS | isWildcard check in server.js |
| TC-06 | R6: Live Placing | JA | PASS | Auto-rank after time entry |
| TC-09 | R7: Total/Target/Color | JA | PASS | All relay types: Total+Target+Gold/Silver/Bronze |
| TC-10 | R8: No Split in Results | JA | PASS | Split removed |
| TC-11 | R9: Deadlock fix | JA | PASS | Defaults to race with data |
| TC-12 | R10+R12: Report format + filter | JA | PASS | Event/Heat column, filtered |
| TC-13 | R11: No Consolidated | JA | PASS | Removed from Results |
| TC-15 | R13: Report symmetry | JA | PASS | report-table class, Variance header |
| TC-16 | R14: Calendar heats | JA | PASS | Heat 1, Heat 2 breakdown |
| TC-17 | R15: Report button | JA | PASS | View Event Report in modal |
| TC-18a | R16: Pogo 4-per-team | JA | PASS | 3 teams × 4 swimmers, no swim twice, no total |
| TC-18d | R16: Pogo Results columns | JA | PASS | renderPogoResultsInline: Swimmer\|PB\|Start\|Total\|T1\|T2\|Result\|Variance |
| TC-18b | R16: No Swim Twice | JA | PASS | Button absent in Pogo HB |
| TC-18c | R16: No Team Total | JA | PASS | Footer absent in Pogo HB |
| TC-04 | R3: Print Layout | JA | PASS | 17 print CSS rules verified in browser, real dialog not automatable |
| CONSOLE | JS Errors | JA | PASS | 0 errors |

### Open
None. All items closed.

## R17-R20 Expanded Coverage (TC-19 to TC-68)
**Total: 43 PASS / 1 TEST-BUG / 0 CODE-BUG**

TC-48 shows FAIL because test setup used 5000cs as tie value which was slower than other teams (resulting in place 4,4 — correct tie behavior, wrong test expectation). The tie logic itself is verified correct in TC-52, TC-56, TC-60.
