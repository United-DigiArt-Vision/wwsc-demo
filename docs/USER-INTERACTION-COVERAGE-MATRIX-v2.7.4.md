# USER INTERACTION COVERAGE MATRIX — WWSC v2.7.4

**Testcases:** 22 | **PASS:** 22 | **FAIL:** 0

| Spec-Punkt | Titel | Getestet? | Status | Event | Evidenz |
|-----------|-------|-----------|--------|-------|---------|
| P1 | Brace Attendance (Y+N) | JA | PASS | EV-A | 10/10 in Brace, 3 N-swimmers included |
| P2 | Standard vs Special | JA | PASS | EV-A | 25m=10 all, 75m=7 Y-only |
| P3-HB | Brace Layout Heat Builder | JA | PASS | EV-A | Lane\|Pair\|PBs\|Target headers, Screenshot |
| P3-REL | Brace Layout Relays | JA | PASS | EV-A | Lane\|Pair\|PBs\|Target headers, Screenshot |
| P3-RES | Brace Layout Results | JA | PASS | EV-A | Lane\|Pair\|PBs\|Target headers, Screenshot |
| P4 | Cross-Screen Consistency | JA | PASS | EV-A | Relays vars = Results vars |
| P5 | Brace Start=2 | JA | PASS | EV-A | All 5 teams start=2, header "Start: 2s" |
| P6 | Brace No Breakers | JA | PASS | EV-A | 0 brace breakers after finalize |
| P7 | Brace lowest variance wins | JA | PASS | EV-A | var=73→1st, 100→3rd, 150→4th |
| P8 | Brace Tie (equal variance) | JA | PASS | EV-A | 2 teams var=73 → both 1st, next=3rd |
| P9-10 | Relay 10→2 teams | JA | PASS | EV-B | API: 2 teams |
| P9-11 | Relay 11→3 teams | JA | PASS | EV-B | API: 3 teams |
| P9-12 | Relay 12→3 teams | JA | PASS | EV-B | API: 3 teams |
| P10-MED | Medley regression | JA | PASS | EV-C | 3 teams, start=2 |
| P10-POG | Pogo regression | JA | PASS | EV-C | 2 teams, start=2 |
| P10-FIN | Finalize/Complete | JA | PASS | EV-C | status=completed |
| P10-CON | Console errors | JA | PASS | - | 0 errors |
