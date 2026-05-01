const fs = require('fs');
const path = require('path');
const { chromium } = require('/Users/macmini001/avanak-inventory/node_modules/playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const OUT = path.resolve('docs/screenshots/v2.8.11-browser-e2e-retro');
fs.mkdirSync(OUT, { recursive: true });

const results = [];
function record(id, ok, note) { results.push({ id, status: ok ? 'PASS' : 'FAIL', note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${note}`); if (!ok) throw new Error(`${id}: ${note}`); }
async function api(pathname, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== 'string') { opts.body = JSON.stringify(opts.body); headers['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + pathname, { ...opts, headers });
  if (!res.ok) throw new Error(`${pathname} -> ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}
async function screenshot(page, name) { await page.screenshot({ path: path.join(OUT, name), fullPage: true }); }
async function clickText(page, text, fallbackFn) {
  const loc = page.getByText(text, { exact: false }).first();
  try { await loc.waitFor({ state: 'visible', timeout: 2500 }); await loc.click(); return 'click'; }
  catch (e) { if (!fallbackFn) throw e; await fallbackFn(); return 'fallback-evaluate'; }
}

(async () => {
  const version = await api('/api/version');
  record('WWSC-E2E-001', version.version === '2.8.11', `/api/version is ${JSON.stringify(version)}`);

  // Controlled local data setup so Bryan's latest 5 feedback points are reproducible without touching live data.
  const event = await api('/api/events/current');
  await api(`/api/events/${event.id}/config`, { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: '75m' } });
  const originalAttendance = await api(`/api/events/${event.id}/attendance`);
  const chosen = new Set(originalAttendance.slice(0, 13).map(a => a.member_id));
  const andrew = originalAttendance.find(a => a.name === 'Andrew Barnes');
  let attendees = originalAttendance.map((a, idx) => ({
    member_id: a.member_id,
    present: chosen.has(a.member_id) ? 1 : 0,
    special_event_entry: chosen.has(a.member_id) ? (idx % 5 === 0 ? 'Y' : 'N') : null
  }));
  if (andrew) attendees = attendees.map((a, idx) => idx === 0 ? { member_id: andrew.member_id, present: 1, special_event_entry: 'N' } : (a.member_id === andrew.member_id ? { ...a, present: 0, special_event_entry: null } : a));
  await api(`/api/events/${event.id}/attendance`, { method: 'PUT', body: { attendees } });
  await api(`/api/events/${event.id}/races`, { method: 'PUT', body: { race_types: ['25m', '50m', '25m_relay', '75m'] } });
  const races = await api(`/api/events/${event.id}/races`);
  const relay = races.find(r => r.race_type === '25m_relay');
  record('WWSC-E2E-002', !!relay, '25m Team Relay test race exists');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto(`${BASE}/?v=2.8.11`, { waitUntil: 'networkidle' });
  await screenshot(page, '01-dashboard-live-v2811.png');
  record('WWSC-E2E-003', (await page.locator('body').innerText()).includes('v2.8.11'), 'sidebar/body shows v2.8.11 after page load');

  const heatNavMode = await clickText(page, 'Heat Builder', async () => page.evaluate(() => navigate('heat-builder')));
  await page.waitForTimeout(500);
  record('WWSC-E2E-004', (await page.locator('body').innerText()).includes('Heat Builder'), `navigated to Heat Builder via ${heatNavMode}`);

  await page.evaluate(async (relayId) => { const r = hbRaces.find(x => x.id === relayId) || hbRaces.find(x => x.race_type === '25m_relay'); await selectHBRace(r.id); }, relay.id);
  await page.waitForTimeout(500);
  let body = await page.locator('body').innerText();
  await screenshot(page, '02-relay-pre-generation-clean.png');
  record('WWSC-E2E-005', body.includes('25m Team Relay'), '25m Team Relay selected');
  record('WWSC-E2E-006', body.includes('Generate Teams'), 'Generate Teams is clear next action before generation');
  record('WWSC-E2E-007', !body.includes('0/0 teams complete'), 'no confusing 0/0 teams complete banner before generation');
  record('WWSC-E2E-008', !body.includes('Unassigned swimmers'), 'no unassigned swimmer pool before generation');
  record('WWSC-E2E-009', !body.includes('Add Team'), 'no Add Team control before generation');

  const genMode = await clickText(page, 'Generate Teams', async () => page.evaluate(() => generateHBRelayTeams({ forceReshuffle: true })));
  await page.waitForTimeout(900);
  body = await page.locator('body').innerText();
  await screenshot(page, '03-relay-generated-teams.png');
  record('WWSC-E2E-010', /Team 1/.test(body) && /Team 2/.test(body), `teams generated via ${genMode}`);
  record('WWSC-E2E-011', body.includes('Total:') && body.includes('Target:'), 'team total/target remain visible');

  await page.emulateMedia({ media: 'print' });
  const styles = await page.evaluate(() => {
    const titles = [...document.querySelectorAll('.relay-team-title')].map(e => ({ text: e.textContent.trim(), size: getComputedStyle(e).fontSize, weight: getComputedStyle(e).fontWeight, font: getComputedStyle(e).fontFamily }));
    const h1 = document.querySelector('h1'); const h2 = document.querySelector('h2');
    return { titles, h1: getComputedStyle(h1).fontSize, h2: getComputedStyle(h2).fontSize };
  });
  await screenshot(page, '04-print-media-heading-prominence.png');
  record('WWSC-E2E-012', styles.titles.length >= 3 && styles.titles.every(t => t.size === styles.titles[0].size && t.weight === styles.titles[0].weight), `relay print headings consistent: ${styles.titles.map(t=>`${t.size}/${t.weight}`).join(', ')}`);
  record('WWSC-E2E-013', styles.titles.every(t => parseFloat(t.size) >= 18 && Number(t.weight) >= 800), 'relay print headings prominent enough');
  record('WWSC-E2E-014', parseFloat(styles.h1) > parseFloat(styles.h2), `page heading hierarchy preserved h1=${styles.h1} h2=${styles.h2}`);
  await page.emulateMedia({ media: null });

  const confirmMode = await clickText(page, 'Confirm', async () => page.evaluate(() => confirmHBRelayTeams()));
  await page.waitForTimeout(500);
  const resultsMode = await clickText(page, 'Results', async () => page.evaluate(() => navigate('results')));
  await page.waitForTimeout(700);
  let teams = await api(`/api/races/${relay.id}/relay-teams`);
  for (let i = 0; i < teams.length; i++) await api(`/api/relay-teams/${teams[i].id}/time`, { method: 'PUT', body: { total_time: Math.round(((teams[i].target_time || 80) + (teams[i].start_delay || 0)) * 100 + (i * 17)) } });
  await api(`/api/races/${relay.id}/rank-relay`, { method: 'POST', body: {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => navigate('results'));
  await page.waitForTimeout(700);
  body = await page.locator('body').innerText();
  await screenshot(page, '05-results-no-decides-ranking.png');
  record('WWSC-E2E-015', body.includes('25m Team Relay'), `Results screen reached via confirm=${confirmMode}, resultsNav=${resultsMode}`);
  record('WWSC-E2E-016', body.includes('Variance from Target'), 'variance row remains visible');
  record('WWSC-E2E-017', !body.includes('(decides ranking)') && !body.includes('decides ranking'), 'removed decides ranking wording is absent');
  record('WWSC-E2E-018', /1st|2nd|3rd/.test(body), 'relay placing still visible');

  // Force the exact Bryan report bug shape: present Andrew with null special entry must render as N, not dash.
  if (andrew) {
    const legacyNull = attendees.map(a => a.member_id === andrew.member_id ? { ...a, present: 1, special_event_entry: null } : a);
    await api(`/api/events/${event.id}/attendance`, { method: 'PUT', body: { attendees: legacyNull } });
  }
  const reportHtml = await page.evaluate(async (eventId) => {
    let captured = '';
    const oldOpen = window.open;
    window.open = () => ({ document: { write: html => { captured += html; }, close: () => {} } });
    resEvent = { id: eventId };
    await showSeasonReport(eventId);
    window.open = oldOpen;
    return captured;
  }, event.id);
  await page.setContent(reportHtml, { waitUntil: 'load' });
  await screenshot(page, '06-event-report-andrew-special-entry-n.png');
  const reportText = await page.locator('body').innerText();
  const andrewLine = reportText.split('\n').find(l => l.includes('Andrew Barnes')) || '';
  record('WWSC-E2E-019', andrewLine.includes('Andrew Barnes') && /\bN\b/.test(andrewLine), `Andrew Barnes report row renders N: ${andrewLine}`);
  record('WWSC-E2E-020', !andrewLine.includes('—') && !andrewLine.includes('-'), 'Andrew Barnes report row does not render dash');
  record('WWSC-E2E-021', reportText.includes('Special Entry'), 'Event Report keeps Special Entry column visible');
  record('WWSC-E2E-022', !/undefined|null|NaN/.test(reportText), 'Event Report has no visible undefined/null/NaN');

  const relevantConsoleErrors = consoleErrors.filter(e => !/favicon|Failed to load resource: the server responded with a status of 404/.test(e));
  if (consoleErrors.length) console.log('CONSOLE_ERRORS_RAW', JSON.stringify(consoleErrors, null, 2));
  record('WWSC-E2E-023', relevantConsoleErrors.length === 0, `relevant browser console/page errors: ${relevantConsoleErrors.length} (raw: ${consoleErrors.length})`);

  await browser.close();
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const md = `# WWSC v2.8.11 Retrospective Browser-E2E Evidence\n\nDate: 2026-05-01\nScope: Bryan latest v2.8.10 retest feedback, retested against latest live/code version v2.8.11.\nRunner: Playwright with installed Google Chrome (V0006 v5.4 fallback standard).\nBase URL: ${BASE}\n\n## Summary\n\n- Checks: ${results.length}\n- PASS: ${passed}\n- FAIL: ${failed}\n- Screenshots: \`docs/screenshots/v2.8.11-browser-e2e-retro/\`\n\n## Bryan feedback coverage\n\n- Relay pre-generation display clean: WWSC-E2E-005..009\n- Print heading consistency/prominence: WWSC-E2E-012..014\n- Remove \`(decides ranking)\`: WWSC-E2E-015..018\n- Event Report Andrew Barnes Special Entry \`N\`: WWSC-E2E-019..022\n- Console/no obvious browser error: WWSC-E2E-023\n\n## Results\n\n| ID | Status | Evidence |\n|---|---|---|\n${results.map(r => `| ${r.id} | ${r.status} | ${String(r.note).replace(/\|/g, '/')} |`).join('\n')}\n`;
  fs.writeFileSync('docs/evidence/WWSC-v2.8.11-retrospective-browser-e2e-evidence.md', md);
  console.log(`\nSUMMARY ${passed}/${results.length} PASS, ${failed} FAIL`);
})().catch(err => { console.error(err.stack || err); process.exit(1); });
