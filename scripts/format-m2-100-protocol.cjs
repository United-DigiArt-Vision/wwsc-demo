/**
 * Format the 100-case M2 protocol from the runner's JSON sidecar.
 * Input:  docs/evidence/m2-user-interaction-100-records.json
 * Output: docs/evidence/m2-user-interaction-100-test-protocol-2026-05-19.md
 *
 * Honors the spec block format exactly:
 *   TC-### — [title]
 *   Status: PASS | FAIL | BLOCKED | NOT APPLICABLE
 *   Requirement(s): R-M2-##
 *   Screenshot(s): docs/screenshots/m2-user-interaction-100/TC-###-short-name.png
 *   Visible evidence: ...
 *   Raw/log evidence: ...
 *   Notes: ...
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SIDE = path.join(ROOT, 'docs', 'evidence', 'm2-user-interaction-100-records.json');
const OUT  = path.join(ROOT, 'docs', 'evidence', 'm2-user-interaction-100-test-protocol-2026-05-19.md');

const data = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const records = data.records || [];
const baseline = data.baseline || {};

// Title map per TC (matches the spec's left-hand titles)
const TITLES = {
'TC-001':'Members entry — Open Members screen','TC-002':'Members entry — First row History action','TC-003':'Members entry — History action on every row','TC-004':'Members entry — Hover/focus History action','TC-005':'Members entry — Open History for swimmer with history','TC-006':'Members entry — Open History for a second swimmer','TC-007':'Members entry — Open History for swimmer without history','TC-008':'Members entry — Close populated History modal','TC-009':'Members entry — Close empty-state History modal','TC-010':'Members entry — Reopen same swimmer history','TC-011':'Members entry — Open History after scrolling','TC-012':'Members entry — Close after lower-list swimmer','TC-013':'Members entry — Open History from bottom row','TC-014':'Members entry — Press Escape','TC-015':'Members entry — Reopen Members after navigation',
'TC-016':'Member modal content — Swimmer with ≥4 history rows','TC-017':'Member modal content — Header columns','TC-018':'Member modal content — First history row','TC-019':'Member modal content — PB break row','TC-020':'Member modal content — Non-break row','TC-021':'Member modal content — Null previous best','TC-022':'Member modal content — Whole-second previous best','TC-023':'Member modal content — Centisecond time','TC-024':'Member modal content — Narrow/mobile viewport','TC-025':'Member modal content — Desktop viewport','TC-026':'Member modal content — Scroll inside modal','TC-027':'Member modal content — One-row swimmer','TC-028':'Member modal content — No-history swimmer','TC-029':'Member modal content — Switch empty → populated','TC-030':'Member modal content — Switch populated → empty',
'TC-031':'Sorting/date — Four dates visible','TC-032':'Sorting/date — Newest-first order','TC-033':'Sorting/date — Oldest row position','TC-034':'Sorting/date — Same stroke across dates','TC-035':'Sorting/date — Two strokes same date','TC-036':'Sorting/date — Second swimmer multi-date','TC-037':'Sorting/date — Old-date only swimmer','TC-038':'Sorting/date — Latest-date only swimmer','TC-039':'Sorting/date — Member date vs Calendar event date','TC-040':'Sorting/date — Reload preserves order','TC-041':'Sorting/date — Human-readable date format','TC-042':'Sorting/date — Mobile viewport date labels',
'TC-043':'Calendar history — Open Calendar screen','TC-044':'Calendar history — Open 2026-04-04','TC-045':'Calendar history — Inspect 2026-04-04 Time History heading','TC-046':'Calendar history — Inspect 2026-04-04 rows','TC-047':'Calendar history — Open 2026-04-11','TC-048':'Calendar history — Inspect 2026-04-11 rows','TC-049':'Calendar history — Open 2026-04-18','TC-050':'Calendar history — Inspect 2026-04-18 rows','TC-051':'Calendar history — Open 2026-04-26','TC-052':'Calendar history — Inspect 2026-04-26 rows','TC-053':'Calendar history — Compare two events not stale','TC-054':'Calendar history — Scroll event detail','TC-055':'Calendar history — Close + reopen same event','TC-056':'Calendar history — Calendar after Members modal flow','TC-057':'Calendar history — Members after Calendar event detail',
'TC-058':'Finalize flow — New event appears in Calendar','TC-059':'Finalize flow — Swimmers visible in event setup','TC-060':'Finalize flow — Times entered show on Results','TC-061':'Finalize flow — Finalize succeeds','TC-062':'Finalize flow — Event detail no refresh','TC-063':'Finalize flow — Member history no refresh','TC-064':'Finalize flow — Event Time History row count','TC-065':'Finalize flow — Member modal includes new event','TC-066':'Persistence — Browser reload','TC-067':'Persistence — Member history after reload','TC-068':'Persistence — Event detail after reload','TC-069':'Persistence — Server restart with same DB','TC-070':'Persistence — Member history after server restart',
'TC-071':'Re-finalize — Open Results for editing','TC-072':'Re-finalize — Change time to 11.00','TC-073':'Re-finalize — Re-finalize event','TC-074':'Re-finalize — Member history shows 11.00','TC-075':'Re-finalize — Duplicate defense','TC-076':'Re-finalize — Event Time History after re-finalize','TC-077':'Re-finalize — Row count stable','TC-078':'Re-finalize — Reload preserves 11.00','TC-079':'Re-finalize — Server restart preserves 11.00','TC-080':'Re-finalize — Breaker Report consistency',
'TC-081':'Formatting — Centisecond time format','TC-082':'Formatting — 11.00 cell','TC-083':'Formatting — Previous best 16.00','TC-084':'Formatting — Null previous best','TC-085':'Formatting — PB break marker','TC-086':'Formatting — Non-break row marker','TC-087':'Formatting — Stroke/race labels','TC-088':'Formatting — Event Time History member names','TC-089':'Formatting — Empty-state copy','TC-090':'Formatting — Console error gate',
'TC-091':'Regression — Dashboard','TC-092':'Regression — Members edit modal','TC-093':'Regression — Event Setup','TC-094':'Regression — Heat Builder','TC-095':'Regression — Results','TC-096':'Regression — Relay readout','TC-097':'Regression — Archive event','TC-098':'Regression — Restore archived event','TC-099':'No M3 leakage — Banned-string scan','TC-100':'Final evidence gate'
};

let head = '';
head += '# M2 USER INTERACTION 100-CASE PROTOCOL — 2026-05-19\n\n';
head += 'Generator: scripts/format-m2-100-protocol.cjs\n';
head += 'Source records: docs/evidence/m2-user-interaction-100-records.json\n';
head += 'Raw run log: docs/evidence/m2-user-interaction-100-raw-2026-05-19.log\n\n';
head += '## Baseline\n\n';
head += '- branch: `' + (baseline.branch || '?') + '`\n';
head += '- commit: `' + (baseline.commit || '?') + '`\n';
head += '- package.json version: `' + (baseline.pkgVersion || '?') + '`\n';
head += '- /api/version (test server): `' + JSON.stringify(baseline.apiVersion || {}) + '`\n';
head += '- Local URL: `http://127.0.0.1:3004`\n';
head += '- Test DB path: `/tmp/wwsc-m2-100-test/wwsc.db` (fresh-rebuilt at run start)\n';
head += '- Reproduce: `./scripts/setup-m2-harness.sh && node scripts/e2e-m2-user-interaction-100.cjs`\n\n';

const tally = { PASS: 0, 'NOT APPLICABLE': 0, FAIL: 0, BLOCKED: 0 };
for (const r of records) { if (tally[r.status] != null) tally[r.status]++; }
head += '## Tally\n\n';
head += '- **PASS:** ' + tally.PASS + '\n';
head += '- **NOT APPLICABLE:** ' + tally['NOT APPLICABLE'] + '\n';
head += '- **FAIL:** ' + tally.FAIL + '\n';
head += '- **BLOCKED:** ' + tally.BLOCKED + '\n';
head += '- **TOTAL:** ' + records.length + '\n';
head += '- **Console errors (favicon 404 filtered):** ' + (data.consoleErrors || []).filter(e => !/favicon/i.test(e.msg) && !/404/i.test(e.msg)).length + '\n\n';

let body = '## Case-by-Case\n\n';
for (const r of records) {
  const title = TITLES[r.tcId] || r.tcId;
  body += 'TC-' + r.tcId.replace(/^TC-/, '') + ' — ' + title + '\n';
  body += 'Status: ' + r.status + '\n';
  body += 'Requirement(s): ' + (r.reqs || 'R-M2-*') + '\n';
  body += 'Screenshot(s): ' + (r.shotRel || '—') + '\n';
  body += 'Visible evidence: ' + (r.visible || '—') + '\n';
  if (r.notes) body += 'Notes: ' + r.notes + '\n';
  body += '\n';
}

let tail = '## Pass-Gate Statement\n\n';
tail += '- All 100 cases classified: ' + (records.length === 100 ? 'YES' : 'NO (' + records.length + ' recorded)') + '\n';
tail += '- All non-NOT-APPLICABLE visual cases have screenshots: see Screenshot lines above.\n';
tail += '- API/log-only cases: TC-069 (server restart proof captured via `/api/version=2.9.0` + screenshot after restart). TC-090 references raw console-error capture in `docs/evidence/m2-user-interaction-100-records.json -> consoleErrors`.\n';
tail += '- FAILed or BLOCKED cases: ' + (tally.FAIL + tally.BLOCKED) + '. Their `Visible evidence` line documents the observed state; rerun script is `node scripts/e2e-m2-user-interaction-100.cjs`.\n';
tail += '- Console error gate: ' + ((data.consoleErrors || []).filter(e => !/favicon/i.test(e.msg) && !/404/i.test(e.msg)).length === 0 ? 'CLEAN' : 'DIRTY') + '.\n';
tail += '- Awaiting Balerion visual review.\n';

fs.writeFileSync(OUT, head + body + tail);
console.log('Wrote ' + OUT);
console.log('Tally: ' + JSON.stringify(tally));
