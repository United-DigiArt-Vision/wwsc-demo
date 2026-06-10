# Bryan Expectation Proof — WWSC v2.11.0 Live Demo — 2026-06-09

## Verdict

The live demo now proves Bryan's immediate retest expectations that can be proven from the hosted app:

- test data is visible
- Season Calendar is not empty
- completed event data is present
- requested race/stroke categories have saved result rows
- relay/team pointscore uses 5/4/3
- DB export is available
- graph source data exists
- break-count reports are populated
- total-improvement reports are populated

Two items are intentionally **not claimed as proven**:

- the original missing old demo events were recovered
- final production persistence/backups are already configured and proven

Those are different claims. The current proof covers the live demo retest state.

## Source Requirements From Bryan

Bryan asked on 2026-06-09:

- "Please confirm all test data is available."
- "I am unable to test until it is there."
- "The Season Calendar is empty."
- "Please restore the previous events."
- "It is a little concerning that the data gets lost everytime I create a new event."
- "How will this work in the future?"

Bryan also asked on 2026-06-05:

- Relay should be 5 points for 1st, 4 for 2nd, 3 for 3rd.
- Need results by each stroke/event category: 25m, 50m, relay, 75m, 25m brace, 50m brace, breast, back, butterfly, 75m.
- How do I export the DB?
- How can it produce graphs?
- Number of breaks per person overall and by event.
- Total time improvement by person by event and overall.

## Live Evidence

Live URL:

- `https://wwsc-demo.onrender.com`

Version:

- `/api/version` => `2.11.0`

Completed live event:

- Event `1`
- Date `2026-06-06`
- Status `completed`
- Present swimmers: 18
- Race count: 10
- Current event after completion: `null`

Pointscore:

- `/api/pointscore/months` => `["2026-06"]`
- `/api/pointscore/season/2026` => 1 event, 18 standings

Race/stroke coverage from `/api/reports/event-coverage`:

- `25m` => 18 result rows
- `50m` => 18 result rows
- `75m` => 18 result rows
- `backstroke` => 18 result rows
- `breaststroke` => 18 result rows
- `butterfly` => 18 result rows
- `25m_relay` => 18 result rows, 3 teams
- `medley_relay` => 18 result rows, 6 teams
- `25m_brace` => 18 result rows, 9 teams
- `50m_brace` => 18 result rows, 9 teams

Relay/team 5/4/3 proof from `/api/events/1/pointscore`:

- `25m_relay` point distribution: 6 swimmers with 5 points, 6 with 4 points, 6 with 3 points
- `medley_relay` point distribution: 3 swimmers with 5 points, 3 with 4 points, 3 with 3 points
- `25m_brace` point distribution: 2 swimmers with 5 points, 2 with 4 points, 2 with 3 points
- `50m_brace` point distribution: 2 swimmers with 5 points, 2 with 4 points, 2 with 3 points

Reports:

- `/api/reports/break-counts` => 6 overall rows, 6 by-event rows
- `/api/reports/improvements` => 16 overall rows, 48 by-event rows

Graphs:

- `/api/events/1/time-history` => 108 rows
- Rows contain swimmer, event date, stroke, time, previous best, and break flag.
- The app's DB & Graphs tab explains graphs are produced from these saved `time_history` rows.

DB export:

- `HEAD /api/export/db` => HTTP 200
- `content-type: application/octet-stream`
- `content-length: 94208`
- filename pattern: `wwsc-sqlite-db-v2.11.0-YYYY-MM-DD...db`

Browser visibility:

- Season Calendar showed `COMPLETED EVENTS (1)`, `Sat, 6 June 2026`, 18 swimmers, 10 races, `v2.11.0`
- Event Details modal showed 18 participants and 10 races with saved times
- Pointscore per-event table showed 18 ranked swimmers
- Break Counts tab showed populated overall and by-event tables
- Improvements tab showed populated overall and by-event tables
- Completed Categories tab showed all requested categories as covered
- DB & Graphs tab showed the database download button and graph-source explanation

Console:

- Only observed browser console issue was a harmless `favicon.ico` 404.
- No app/data error was observed in the checked views.

## Requirement Matrix

| Bryan expectation | Proven? | Evidence |
|---|---:|---|
| Test data is available | Yes | Completed event `1`, 18 swimmers, 10 races, populated reports |
| Season Calendar is not empty | Yes | Browser and API show completed event `Sat, 6 June 2026` |
| Completed events can be tested | Yes | Event `1` status `completed`; Event Details has participants/races/results |
| Results for 25m | Yes | 18 result rows |
| Results for 50m | Yes | 18 result rows |
| Results for 75m | Yes | 18 result rows |
| Results for breaststroke | Yes | 18 result rows |
| Results for backstroke | Yes | 18 result rows |
| Results for butterfly | Yes | 18 result rows |
| Results for relay | Yes | `25m_relay` has 18 result rows and 3 teams |
| Results for medley relay | Yes | `medley_relay` has 18 result rows and 6 teams |
| Results for 25m brace | Yes | 18 result rows and 9 teams |
| Results for 50m brace | Yes | 18 result rows and 9 teams |
| Relay/team scoring 5/4/3 | Yes | `/api/events/1/pointscore` has 5/4/3 distributions for relay/team races |
| DB export | Yes | `HEAD /api/export/db` returns 200 octet-stream, 94,208 bytes |
| Graph production explanation/data | Yes | 108 `time_history` rows and DB & Graphs UI explanation |
| Break count per person overall | Yes | 6 overall rows |
| Break count by event | Yes | 6 by-event rows |
| Total improvement overall | Yes | 16 overall rows |
| Total improvement by event | Yes | 48 by-event rows |
| Old missing events recovered | Not proven | Do not claim; current correction re-created/restored demo test data |
| Future production persistence/backups | Not proven in demo | Needs final production setup with persistent DB and backup/restore process |

## Customer-Facing Boundary

Safe claim:

> The demo test dataset has been restored/re-created and verified on the live link.

Do not claim:

> The original old missing demo events were recovered.

Do not claim:

> Production persistence/backups are already fully implemented and proven.
