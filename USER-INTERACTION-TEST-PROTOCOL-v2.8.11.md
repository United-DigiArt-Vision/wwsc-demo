# USER INTERACTION TEST PROTOCOL — v2.8.11 Bryan Polish Pass

Date: 2026-05-01
Version: 2.8.11
Branch: dev/v2.8.11-bryan-polish

## Summary

- Automated/browser-assisted checks executed: 56
- PASS: 56
- FAIL: 0
- Screenshot evidence: `docs/screenshots/v2.8.11-bryan/`

## Results

| ID | Status | Evidence / note |
|---|---|---|
| V2811-A01 | PASS | API version 2.8.11 |
| SETUP-RACE | PASS | 25m relay race exists |
| V2811-B02 | PASS | Clean generate instruction visible before generation |
| V2811-B03 | PASS | No 0/0 teams complete banner before generation |
| V2811-B04 | PASS | No unassigned pool before generation |
| V2811-B05 | PASS | No Add Team before generation |
| V2811-B06 | PASS | Generate Teams button visible |
| V2811-B01 | PASS | 25m Team Relay selected in Heat Builder |
| V2811-B09 | PASS | No duplicate helper blocks before generation |
| V2811-A02 | PASS | App loads Heat Builder screen without white screen |
| V2811-A03 | PASS | Loaded index assets include v2.8.11 cache-busting |
| V2811-A04 | PASS | Core screen renders navigable content |
| V2811-A05 | PASS | No visible stale v2.8.10 label on checked screen |
| V2811-C01 | PASS | 3 relay team cards generated |
| V2811-C02 | PASS | 3 teams generated for 13 swimmers |
| V2811-C03 | PASS | Team names visible after generation |
| V2811-C04 | PASS | Total/Target remain visible |
| V2811-B08 | PASS | Management UI appears after teams exist |
| V2811-C07-PRE | PASS | Confirm path is available after generation |
| V2811-D01 | PASS | Print header font Arial, sans-serif |
| V2811-D02 | PASS | Relay team title typography consistent: 18px/900, 18px/900, 18px/900 |
| V2811-D03 | PASS | Blue/red/green team headers share print title class |
| V2811-D04 | PASS | Table/team heading font family consistent |
| V2811-D05 | PASS | Page title remains higher in print hierarchy |
| V2811-D07 | PASS | No team heading is tiny in print media |
| V2811-E01 | PASS | Team title 18px/900 |
| V2811-E02 | PASS | H1 20px |
| V2811-E03 | PASS | H2 16px |
| V2811-E05 | PASS | Team title is visually stronger than row text |
| V2811-E07 | PASS | Team heading legible at print size |
| V2811-E08 | PASS | Screenshot/PDF evidence contains prominent Team headings |
| V2811-D08 | PASS | Print heading state remains stable after generation |
| V2811-D09 | PASS | Print headings remain visible in wide viewport |
| V2811-D10 | PASS | Print headings are not collapsed to old tiny 10px style |
| V2811-C06 | PASS | Confirm relay teams completed without throwing |
| V2811-C07 | PASS | Navigation to Results completed after confirmation |
| V2811-F01 | PASS | 25m Team Relay Results screen opens |
| V2811-F02 | PASS | Variance row appears after entered times/ranking |
| V2811-F03 | PASS | Variance row has no `(decides ranking)` wording |
| V2811-F04 | PASS | No team card contains removed wording |
| V2811-F05 | PASS | No literal decides ranking visible in Results |
| V2811-F06 | PASS | Relay places remain visible |
| V2811-F07 | PASS | Ranking save/calculated state remains visible |
| V2811-F08 | PASS | Finalize Event action remains available |
| V2811-F10 | PASS | Other ranking explanatory text remains stable/no broken values |
| V2811-G01 | PASS | Andrew Barnes is present in report fixture |
| V2811-G10-API | PASS | Report API Andrew raw entry null; UI should render N |
| V2811-G05 | PASS | Andrew report row: Andrew Barnes N |
| V2811-G06 | PASS | Andrew report row does not show dash |
| V2811-G07 | PASS | Report still shows Y for Y swimmers |
| V2811-G09 | PASS | Report does not show null as participant value |
| V2811-G11 | PASS | Reopened generated Event Report HTML contains report title |
| V2811-G12 | PASS | Report print/popup keeps Special Entry column visible |
| V2811-I05 | PASS | No visible undefined in final checked screen |
| V2811-I06 | PASS | No visible null in final checked screen |
| V2811-I07 | PASS | No visible NaN in final checked screen |
