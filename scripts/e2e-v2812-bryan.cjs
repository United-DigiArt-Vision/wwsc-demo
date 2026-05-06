const fs = require('fs');
const path = require('path');
const { chromium } = require('/Users/macmini001/avanak-inventory/node_modules/playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3002';
const OUT = path.resolve('docs/screenshots/v2.8.12-bryan');
const EVIDENCE = path.resolve('docs/evidence');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(EVIDENCE, { recursive: true });

const results = [];
const consoleErrors = [];
function note(value) { return String(value).replace(/\|/g, '/').replace(/\n/g, ' '); }
function record(id, ok, message) {
  results.push({ id, status: ok ? 'PASS' : 'FAIL', note: message });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${message}`);
  if (!ok) throw new Error(`${id}: ${message}`);
}
async function api(pathname, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(BASE + pathname, { ...opts, headers });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok || (body && body.error)) throw new Error(`${pathname} -> ${res.status}: ${text}`);
  return body;
}
async function shot(page, name) { await page.screenshot({ path: path.join(OUT, name), fullPage: true }); }
function bodyHasNoBrokenValues(text) { return !/(undefined|null|NaN)/.test(text); }
function assertMembersVisible(text) { return /Members:\s+[A-Za-z]/.test(text) || /Leg\s+Swimmer/.test(text); }

async function configureAttendance(eventId) {
  const attendance = await api(`/api/events/${eventId}/attendance`);
  const chosen = new Set(attendance.slice(0, 14).map(a => a.member_id));
  const strokes = ['Backstroke', 'Breaststroke', 'Butterfly', 'Free'];
  const attendees = attendance.map((a, idx) => ({
    member_id: a.member_id,
    present: chosen.has(a.member_id) ? 1 : 0,
    special_event_entry: chosen.has(a.member_id) ? strokes[idx % strokes.length] : null
  }));
  await api(`/api/events/${eventId}/attendance`, { method: 'PUT', body: { attendees } });
  return attendees;
}
async function setupNormalRace(eventId, raceType) {
  const races = await api(`/api/events/${eventId}/races`);
  const race = races.find(r => r.race_type === raceType);
  if (!race) throw new Error(`Missing race ${raceType}`);
  const preview = await api(`/api/races/${race.id}/generate-heats`);
  if (!preview.heats || preview.heats.length === 0) throw new Error(`No heats for ${raceType}: ${preview.warning || ''}`);
  await api(`/api/races/${race.id}/confirm-heats`, { method: 'POST', body: { heats: preview.heats } });
  const heats = await api(`/api/races/${race.id}/heats`);
  return { race, heats };
}
async function setupRelayRace(eventId, raceType) {
  const races = await api(`/api/events/${eventId}/races`);
  const race = races.find(r => r.race_type === raceType);
  if (!race) throw new Error(`Missing relay ${raceType}`);
  const generated = await api(`/api/races/${race.id}/generate-relay-teams`, { method: 'POST', body: { forceReshuffle: true } });
  if (!generated.teams || generated.teams.length < 2) throw new Error(`Need >=2 teams for ${raceType}`);
  await api(`/api/races/${race.id}/save-relay-teams`, { method: 'POST', body: { teams: generated.teams } });
  let teams = await api(`/api/races/${race.id}/relay-teams`);
  for (let i = 0; i < teams.length; i++) {
    const t = teams[i];
    const targetCs = (t.target_time || 80) * 100;
    const startCs = (t.start_delay || 0) * 100;
    let delta = i * 37;
    if (raceType === 'medley_relay') delta = [85, -12, 42, 120][i] ?? (i * 25); // prove variance-ranking explainability.
    await api(`/api/relay-teams/${t.id}/time`, { method: 'PUT', body: { total_time: targetCs + startCs + delta } });
  }
  await api(`/api/races/${race.id}/rank-relay`, { method: 'POST', body: {} });
  teams = await api(`/api/races/${race.id}/relay-teams`);
  return { race, teams };
}
async function setIndividualTimes(raceType, race, heats) {
  const lane1 = heats[0].lanes[0];
  const lane2 = heats[0].lanes[1];
  const finishForVariance = (lane, varianceCs) => (lane.start_delay * 100) + (lane.handicap_time * 100) + varianceCs;
  await api(`/api/heats/${lane1.heat_id}/lanes/${lane1.id}/time`, { method: 'PUT', body: { finish_time: finishForVariance(lane1, -50) } });
  await api(`/api/heats/${lane2.heat_id}/lanes/${lane2.id}/time`, { method: 'PUT', body: { finish_time: finishForVariance(lane2, raceType === '25m' ? -49 : -50) } });
  const updated = await api(`/api/races/${race.id}/heats`);
  return updated;
}

(async () => {
  const version = await api('/api/version');
  record('V2812-A01', version.version === '2.8.12', `/api/version is ${JSON.stringify(version)}`);

  const event1 = await api('/api/events', { method: 'POST', body: { date: '2026-05-06' } });
  await api(`/api/events/${event1.id}/config`, { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: 'medley_relay' } });
  await configureAttendance(event1.id);
  await api(`/api/events/${event1.id}/races`, { method: 'PUT', body: { race_types: ['25m', '50m', '25m_relay', 'medley_relay'] } });

  const normal25 = await setupNormalRace(event1.id, '25m');
  const normal50 = await setupNormalRace(event1.id, '50m');
  const relay25 = await setupRelayRace(event1.id, '25m_relay');
  const medley = await setupRelayRace(event1.id, 'medley_relay');
  const heats25 = await setIndividualTimes('25m', normal25.race, normal25.heats);
  const heats50 = await setIndividualTimes('50m', normal50.race, normal50.heats);

  const first25 = heats25[0].lanes[0], second25 = heats25[0].lanes[1];
  const first50 = heats50[0].lanes[0];
  record('V2812-D01', first25.is_break === 1 && first25.variance === -50, '25m exactly 0.50s improvement is BREAK');
  record('V2812-D02', second25.is_break === 0 && second25.variance === -49, '25m 0.49s improvement is not BREAK');
  record('V2812-D06', first50.is_break === 0 && first50.variance === -50, '50m 0.50s improvement remains non-break regression guard');
  record('V2812-B03', medley.teams.some(t => t.variance != null) && medley.teams.sort((a,b)=>(a.place||99)-(b.place||99))[0].variance === -12, 'Medley ranks by smallest absolute variance, not raw fastest time');

  await api(`/api/events/${event1.id}/finalize`, { method: 'POST', body: {} });
  const event1Breakers = await api(`/api/events/${event1.id}/breakers`);
  record('V2812-D04', event1Breakers.some(b => b.improvement === 50), 'Finalized event breakers include 0.50s 25m break');
  record('V2812-D05', !event1Breakers.some(b => b.improvement === 49), 'Finalized event breakers exclude 0.49s non-break');

  const event2 = await api('/api/events', { method: 'POST', body: { date: '2026-05-05' } });
  await api(`/api/events/${event2.id}/config`, { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: 'medley_relay' } });
  await configureAttendance(event2.id);
  await api(`/api/events/${event2.id}/races`, { method: 'PUT', body: { race_types: ['25m', '25m_relay', 'medley_relay'] } });
  const event2normal25 = await setupNormalRace(event2.id, '25m');
  await setIndividualTimes('25m', event2normal25.race, event2normal25.heats);
  await setupRelayRace(event2.id, '25m_relay');
  await setupRelayRace(event2.id, 'medley_relay');
  await api(`/api/events/${event2.id}/finalize`, { method: 'POST', body: {} });

  let allEvents = await api('/api/events?archived=1');
  record('V2812-E03', allEvents.some(e => e.id === event1.id), 'Event 1 appears in Season Calendar API after finalization');
  record('V2812-E05', allEvents.some(e => e.id === event1.id) && allEvents.some(e => e.id === event2.id), 'Event 1 and Event 2 both remain saved');
  await api(`/api/events/${event1.id}/archive`, { method: 'PUT', body: {} });
  allEvents = await api('/api/events?archived=1');
  record('V2812-E08', allEvents.find(e => e.id === event1.id)?.archived === 1, 'Intentional archive moves event to deleted state');
  await api(`/api/events/${event1.id}/restore`, { method: 'PUT', body: {} });
  allEvents = await api('/api/events?archived=1');
  record('V2812-E09', allEvents.find(e => e.id === event1.id)?.archived === 0, 'Restore returns archived event to active list');

  const report = await api(`/api/events/${event1.id}/report`);
  record('V2812-C07-API', report.races.some(r => r.race_type === '25m_relay' && r.teams?.some(t => t.members?.length > 0)), 'Report API has 25m relay members');
  record('V2812-C08-API', report.races.some(r => r.race_type === 'medley_relay' && r.teams?.some(t => t.members?.length > 0 && t.variance != null)), 'Report API has Medley members and variance');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto(`${BASE}/?v=2.8.12`, { waitUntil: 'networkidle' });
  let body = await page.locator('body').innerText();
  await shot(page, '01-dashboard-v2812.png');
  record('V2812-A02', body.includes('v2.8.12'), 'Dashboard/sidebar shows v2.8.12');
  const assets = await page.evaluate(() => [...document.querySelectorAll('script[src],link[href]')].map(e => e.src || e.href).join('\n'));
  record('V2812-A03', assets.includes('v=2.8.12') && !assets.includes('v=2.8.11'), 'Assets use v2.8.12 cache busting');

  await page.evaluate(() => navigate('results'));
  await page.waitForTimeout(600);
  body = await page.locator('body').innerText();
  record('V2812-A04', body.includes('Results'), 'Results screen loads without white screen');
  await page.evaluate(() => { const r = resRaces.find(x => x.race_type === 'medley_relay'); selectResRace(r.id); });
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  await shot(page, '02-medley-results-screen-variance.png');
  record('V2812-B02', assertMembersVisible(body), 'Medley Results screen visibly lists team members/strokes');
  record('V2812-B05', body.includes('Variance') || body.includes('Variance from Target'), 'Medley Results screen explains ranking with variance');

  const medleyReadout = await page.evaluate(() => {
    const r = resRaces.find(x => x.race_type === 'medley_relay');
    return buildResultsReadout(r);
  });
  fs.writeFileSync(path.join(OUT, '03-medley-readout.txt'), medleyReadout);
  record('V2812-B04', /Variance: [+-]/.test(medleyReadout), 'Medley readout includes signed variance');
  record('V2812-B06', /Members:\s+[A-Za-z]/.test(medleyReadout), 'Medley readout includes participant names');
  record('V2812-B07', !/undefined|null|NaN/.test(medleyReadout), 'Medley copied readout has no broken values');

  await page.evaluate(() => navigate('calendar'));
  await page.waitForTimeout(700);
  await page.evaluate((id) => viewEventDetails(id), event1.id);
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  await shot(page, '04-calendar-event-details-relay-members.png');
  record('V2812-C02', body.includes('25m Relay') && /Members:\s+[A-Za-z]/.test(body), 'Calendar details show 25m Relay member names');
  record('V2812-C04', body.includes('Medley Relay') && /Members:\s+[A-Za-z].*\(/s.test(body), 'Calendar details show Medley member names/strokes');
  record('V2812-C05', !/Team \d+ \(\d+\.\d+\)\s*(1st|2nd|3rd)?\s*$/m.test(body), 'Calendar details no longer only show Team/time');

  const reportHtml = await page.evaluate(async (id) => {
    let captured = '';
    const oldOpen = window.open;
    window.open = () => ({ document: { write: html => { captured += html; }, close: () => {} } });
    await showSeasonReport(id);
    window.open = oldOpen;
    return captured;
  }, event1.id);
  fs.writeFileSync(path.join(OUT, '05-event-report.html'), reportHtml);
  await page.setContent(reportHtml, { waitUntil: 'load' });
  body = await page.locator('body').innerText();
  await shot(page, '05-event-report-relay-members-variance.png');
  record('V2812-C06', body.includes('Event Report'), 'Full Event Report opens from Calendar path');
  record('V2812-C07', body.includes('25m Team Relay') && body.includes('Medley Relay') && body.includes('Leg') && body.includes('Swimmer'), 'Event Report relay tables include members');
  record('V2812-C08', body.includes('Variance') && bodyHasNoBrokenValues(body), 'Printable Event Report includes variance with no broken values');

  await page.goto(`${BASE}/?v=2.8.12`, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigate('results'));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const r = resRaces.find(x => x.race_type === '25m'); selectResRace(r.id); });
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  await shot(page, '06-25m-half-second-breaker.png');
  record('V2812-D01-UI', body.includes('BREAK') || body.includes('Breakers'), '25m screen visibly marks/mentions breaker for 0.50s improvement');

  await page.evaluate(() => navigate('calendar'));
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  await shot(page, '07-calendar-two-events-saved.png');
  record('V2812-E04', body.includes('COMPLETED EVENTS (2)') && body.includes('2\nEvents'), 'Calendar shows two saved events before restart');
  record('V2812-F05', !/Pointscore|M3/i.test(body), 'Scope guard: no Pointscore/M3 UI introduced');
  const relevantConsoleErrors = consoleErrors.filter(e => !/favicon|404/.test(e));
  record('V2812-F06', relevantConsoleErrors.length === 0, `No relevant browser console/page errors (${consoleErrors.length} raw)`);
  await browser.close();

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const md = `# WWSC v2.8.12 Bryan Final Polish Browser-E2E Evidence\n\nDate: 2026-05-06\nBase URL: ${BASE}\nRunner: Playwright with installed Google Chrome via /Users/macmini001/avanak-inventory/node_modules/playwright\nDB Path: ${process.env.WWSC_DB_PATH || '(default)'}\n\n## Summary\n\n- Checks: ${results.length}\n- PASS: ${passed}\n- FAIL: ${failed}\n- Screenshots/text/html: \`docs/screenshots/v2.8.12-bryan/\`\n\n## Bryan feedback coverage\n\n- Medley readout variance + participant names: V2812-B02/B04/B05/B06/B07\n- History/Event Details relay team members: V2812-C02/C04/C05\n- Full Event Report relay member/variance auditability: V2812-C06/C07/C08\n- 25m break threshold >= 0.5s: V2812-D01/D02/D04/D05 + UI check\n- Saved event persistence/no disappearing events: V2812-E03/E04/E05/E08/E09; restart proof logged separately\n- No M3/Pointscore scope creep: V2812-F05\n\n## Results\n\n| ID | Status | Evidence |\n|---|---|---|\n${results.map(r => `| ${r.id} | ${r.status} | ${note(r.note)} |`).join('\n')}\n\n## Artifacts\n\n- 01-dashboard-v2812.png\n- 02-medley-results-screen-variance.png\n- 03-medley-readout.txt\n- 04-calendar-event-details-relay-members.png\n- 05-event-report.html\n- 05-event-report-relay-members-variance.png\n- 06-25m-half-second-breaker.png\n- 07-calendar-two-events-saved.png\n`;
  fs.writeFileSync(path.join(EVIDENCE, 'WWSC-v2.8.12-bryan-browser-e2e-evidence.md'), md);
  console.log(`SUMMARY ${passed}/${results.length} PASS, ${failed} FAIL`);
})().catch(err => { console.error(err.stack || err); process.exit(1); });
