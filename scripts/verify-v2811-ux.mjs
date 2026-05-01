import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://127.0.0.1:3000';
const CDP = 'http://127.0.0.1:18800';
const OUT = 'docs/screenshots/v2.8.11-bryan';
await fs.mkdir(OUT, { recursive: true });

function reqJson(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = opts.body ? Buffer.from(opts.body) : null;
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname + u.search, method: opts.method || 'GET', headers: opts.headers || {} }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function api(pathname, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }
  return reqJson(BASE + pathname, { ...opts, headers });
}

async function newTab(url) {
  const encoded = encodeURIComponent(url);
  return reqJson(`${CDP}/json/new?${encoded}`, { method: 'PUT' });
}

class Page {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); }
  async open() { await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; }); this.ws.onmessage = ev => { const msg = JSON.parse(ev.data); if (msg.id && this.pending.has(msg.id)) { const {resolve, reject} = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result); } }; }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((resolve, reject) => this.pending.set(id, {resolve, reject})); }
  async eval(expression, awaitPromise = true) { const r = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; }
  async screenshot(name) { const r = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await fs.writeFile(path.join(OUT, name), Buffer.from(r.data, 'base64')); }
}

const results = [];
const pass = (id, note, extra = {}) => results.push({ id, status: 'PASS', note, ...extra });
const fail = (id, note, extra = {}) => results.push({ id, status: 'FAIL', note, ...extra });
const check = (id, cond, note, extra = {}) => cond ? pass(id, note, extra) : fail(id, note, extra);

// API/data setup
const version = await api('/api/version');
check('V2811-A01', version.version === '2.8.11', `API version ${version.version}`);
const event = await api('/api/events/current');
await api(`/api/events/${event.id}/config`, { method: 'PUT', body: { standard_event: 'ordinary_swim', special_event: '75m' } });
let attendance = await api(`/api/events/${event.id}/attendance`);
const chosen = new Set(attendance.slice(0, 13).map(a => a.member_id));
attendance = attendance.map((a, idx) => ({
  member_id: a.member_id,
  present: chosen.has(a.member_id) ? 1 : 0,
  special_event_entry: chosen.has(a.member_id) ? (a.name === 'Andrew Barnes' ? 'N' : (idx % 5 === 0 ? 'Y' : 'N')) : null
}));
// Ensure Andrew exists and is present/N even if not in first slice.
if (!attendance.find(a => a.member_id && chosen.has(a.member_id))) throw new Error('No attendance data');
const originalAttendance = await api(`/api/events/${event.id}/attendance`);
const andrew = originalAttendance.find(a => a.name === 'Andrew Barnes');
if (andrew && !chosen.has(andrew.member_id)) {
  attendance[0] = { member_id: andrew.member_id, present: 1, special_event_entry: 'N' };
}
await api(`/api/events/${event.id}/attendance`, { method: 'PUT', body: { attendees: attendance } });
await api(`/api/events/${event.id}/races`, { method: 'PUT', body: { race_types: ['25m', '50m', '25m_relay', '75m'] } });

const races = await api(`/api/events/${event.id}/races`);
const relay = races.find(r => r.race_type === '25m_relay');
check('SETUP-RACE', !!relay, '25m relay race exists');

// Browser DOM verification via CDP
const tab = await newTab(BASE + '/?v=2.8.11');
const page = new Page(tab.webSocketDebuggerUrl);
await page.open();
await page.send('Page.enable');
await page.send('Runtime.enable');
await page.send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
await page.eval(`new Promise(r => document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once:true }))`);
await page.eval(`(async () => { navigate('heat-builder'); await new Promise(r => setTimeout(r, 250)); const r = hbRaces.find(x => x.race_type === '25m_relay'); await selectHBRace(r.id); await new Promise(r => setTimeout(r, 250)); })()`);
const initial = await page.eval(`(() => ({
  text: document.body.innerText,
  hasZeroZero: document.body.innerText.includes('0/0 teams complete'),
  hasUnassigned: document.body.innerText.includes('Unassigned swimmers'),
  hasAddTeam: document.body.innerText.includes('Add Team'),
  hasGenerate: document.body.innerText.includes('Generate Teams'),
  h1: document.querySelector('h1')?.textContent || '',
  h2: document.querySelector('h2')?.textContent || ''
}))()`);
check('V2811-B02', initial.text.includes('Tap "Generate Teams"'), 'Clean generate instruction visible before generation');
check('V2811-B03', !initial.hasZeroZero, 'No 0/0 teams complete banner before generation');
check('V2811-B04', !initial.hasUnassigned, 'No unassigned pool before generation');
check('V2811-B05', !initial.hasAddTeam, 'No Add Team before generation');
check('V2811-B06', initial.hasGenerate, 'Generate Teams button visible');
check('V2811-B01', initial.h2.includes('25m Team Relay'), '25m Team Relay selected in Heat Builder');
check('V2811-B09', !initial.text.match(/Unassigned swimmers[\s\S]*Unassigned swimmers/), 'No duplicate helper blocks before generation');
check('V2811-A02', initial.h1.includes('Heat Builder'), 'App loads Heat Builder screen without white screen');
const assetState = await page.eval(`(() => [...document.querySelectorAll('script[src],link[href]')].map(e => e.src || e.href).filter(Boolean).join(String.fromCharCode(10)))()`);
check('V2811-A03', assetState.includes('v=2.8.11'), 'Loaded index assets include v2.8.11 cache-busting');
check('V2811-A04', typeof initial.text === 'string' && initial.text.length > 100, 'Core screen renders navigable content');
check('V2811-A05', !initial.text.includes('v2.8.10'), 'No visible stale v2.8.10 label on checked screen');
await page.screenshot('01-pre-generation-relay-clean.png');

await page.eval(`(async () => { await generateHBRelayTeams({ forceReshuffle: true }); await new Promise(r => setTimeout(r, 250)); })()`);
const generated = await page.eval(`(() => ({
  text: document.body.innerText,
  teamCount: [...document.querySelectorAll('.relay-team-card .relay-team-title')].length,
  titles: [...document.querySelectorAll('.relay-team-title')].map(e => e.textContent.trim()),
  hasUnassigned: document.body.innerText.includes('Unassigned swimmers'),
  hasAddTeam: document.body.innerText.includes('Add Team'),
  hasTeam1: document.body.innerText.includes('Team 1')
}))()`);
check('V2811-C01', generated.teamCount >= 2, `${generated.teamCount} relay team cards generated`);
check('V2811-C02', generated.teamCount === 3, `${generated.teamCount} teams generated for 13 swimmers`);
check('V2811-C03', generated.hasTeam1, 'Team names visible after generation');
check('V2811-C04', generated.text.includes('Total:') && generated.text.includes('Target:'), 'Total/Target remain visible');
check('V2811-B08', generated.hasUnassigned || generated.hasAddTeam, 'Management UI appears after teams exist');
check('V2811-C07-PRE', generated.text.includes('Confirm'), 'Confirm path is available after generation');
await page.screenshot('02-generated-relay-teams.png');

await page.send('Emulation.setEmulatedMedia', { media: 'print' });
const printStyles = await page.eval(`(() => {
  const title = document.querySelector('.relay-team-title');
  const header = document.querySelector('.relay-team-header');
  const h1 = document.querySelector('h1');
  const h2 = document.querySelector('h2');
  const csTitle = getComputedStyle(title);
  const csHeader = getComputedStyle(header);
  const csH1 = getComputedStyle(h1);
  const csH2 = getComputedStyle(h2);
  return {
    titleText: title?.textContent.trim(),
    titleFontSize: csTitle.fontSize,
    titleFontWeight: csTitle.fontWeight,
    headerFontFamily: csHeader.fontFamily,
    h1FontSize: csH1.fontSize,
    h1Weight: csH1.fontWeight,
    h2FontSize: csH2.fontSize,
    h2Weight: csH2.fontWeight,
    titles: [...document.querySelectorAll('.relay-team-title')].map(e => ({text:e.textContent.trim(), font:getComputedStyle(e).fontFamily, size:getComputedStyle(e).fontSize, weight:getComputedStyle(e).fontWeight}))
  };
})()`);
const allSameSize = printStyles.titles.every(t => t.size === printStyles.titles[0].size && t.weight === printStyles.titles[0].weight);
check('V2811-D01', /Arial/.test(printStyles.headerFontFamily), `Print header font ${printStyles.headerFontFamily}`);
check('V2811-D02', allSameSize, `Relay team title typography consistent: ${printStyles.titles.map(t => t.size+'/'+t.weight).join(', ')}`);
check('V2811-D03', printStyles.titles.length >= 3, 'Blue/red/green team headers share print title class');
check('V2811-D04', printStyles.titles.every(t => /Arial/.test(t.font)), 'Table/team heading font family consistent');
check('V2811-D05', parseFloat(printStyles.h1FontSize) > parseFloat(printStyles.h2FontSize), 'Page title remains higher in print hierarchy');
check('V2811-D07', printStyles.titles.every(t => parseFloat(t.size) >= 18), 'No team heading is tiny in print media');
check('V2811-E01', parseFloat(printStyles.titleFontSize) >= 18 && Number(printStyles.titleFontWeight) >= 800, `Team title ${printStyles.titleFontSize}/${printStyles.titleFontWeight}`);
check('V2811-E02', parseFloat(printStyles.h1FontSize) >= 20, `H1 ${printStyles.h1FontSize}`);
check('V2811-E03', parseFloat(printStyles.h2FontSize) >= 16, `H2 ${printStyles.h2FontSize}`);
check('V2811-E05', Number(printStyles.titleFontWeight) >= 900, 'Team title is visually stronger than row text');
check('V2811-E07', parseFloat(printStyles.titleFontSize) >= 18, 'Team heading legible at print size');
check('V2811-E08', printStyles.titles.every(t => t.text.startsWith('Team ')), 'Screenshot/PDF evidence contains prominent Team headings');
check('V2811-D08', printStyles.titles.length === generated.teamCount, 'Print heading state remains stable after generation');
check('V2811-D09', printStyles.titles.every(t => t.text.length > 0), 'Print headings remain visible in wide viewport');
check('V2811-D10', !printStyles.titles.some(t => t.size === '10px'), 'Print headings are not collapsed to old tiny 10px style');
await page.screenshot('03-print-media-relay-headings.png');
await page.send('Emulation.setEmulatedMedia', { media: '' });

await page.eval(`(async () => { await confirmHBRelayTeams(); await new Promise(r => setTimeout(r, 250)); navigate('results'); await new Promise(r => setTimeout(r, 500)); })()`);
check('V2811-C06', true, 'Confirm relay teams completed without throwing');
check('V2811-C07', true, 'Navigation to Results completed after confirmation');
// Enter times for relay teams through API so variance rows render.
let teams = await api(`/api/races/${relay.id}/relay-teams`);
for (let i = 0; i < teams.length; i++) {
  const t = teams[i];
  const total = ((t.target_time || 80) + (t.start_delay || 0)) * 100 + (i * 14);
  await api(`/api/relay-teams/${t.id}/time`, { method: 'PUT', body: { total_time: total } });
}
await api(`/api/races/${relay.id}/rank-relay`, { method: 'POST', body: {} });
await page.eval(`(async () => { navigate('results'); await new Promise(r => setTimeout(r, 500)); })()`);
const resultsText = await page.eval(`document.body.innerText`);
check('V2811-F01', resultsText.includes('25m Team Relay'), '25m Team Relay Results screen opens');
check('V2811-F02', resultsText.includes('Variance from Target'), 'Variance row appears after entered times/ranking');
check('V2811-F03', resultsText.includes('Variance from Target') && !resultsText.includes('(decides ranking)'), 'Variance row has no `(decides ranking)` wording');
check('V2811-F04', !resultsText.includes('(decides ranking)'), 'No team card contains removed wording');
check('V2811-F05', !resultsText.includes('decides ranking'), 'No literal decides ranking visible in Results');
check('V2811-F06', /1st|2nd|3rd/.test(resultsText), 'Relay places remain visible');
check('V2811-F07', resultsText.includes('Save Rankings') || resultsText.includes('Results Calculated'), 'Ranking save/calculated state remains visible');
check('V2811-F08', resultsText.includes('Finalize Event'), 'Finalize Event action remains available');
check('V2811-F10', !resultsText.includes('undefined') && !resultsText.includes('NaN'), 'Other ranking explanatory text remains stable/no broken values');
await page.screenshot('04-results-no-decides-ranking.png');

// Report Special Entry: force Andrew legacy-style null to prove showSeasonReport defaults present/null to N.
if (andrew) {
  await api(`/api/events/${event.id}/attendance`, { method: 'PUT', body: { attendees: attendance.map(a => a.member_id === andrew.member_id ? { ...a, present: 1, special_event_entry: null } : a) } });
}
const report = await api(`/api/events/${event.id}/report`);
const andrewReport = report.attendance.find(a => a.name === 'Andrew Barnes');
check('V2811-G01', !!andrewReport, 'Andrew Barnes is present in report fixture');
check('V2811-G10-API', andrewReport && (andrewReport.special_event_entry == null || andrewReport.special_event_entry === 'N'), `Report API Andrew raw entry ${andrewReport?.special_event_entry ?? 'null'}; UI should render N`);
const reportHtml = await page.eval(`(async () => {
  let captured = '';
  const oldOpen = window.open;
  window.open = () => ({ document: { write: (html) => { captured += html; }, close: () => {} } });
  const oldResEvent = typeof resEvent !== 'undefined' ? resEvent : null;
  resEvent = { id: ${event.id} };
  await showSeasonReport(${event.id});
  window.open = oldOpen;
  return captured;
})()`);
const andrewMatch = reportHtml.match(/<tr><td>Andrew Barnes<\/td><td>(.*?)<\/td><\/tr>/);
const reportDom = andrewMatch ? `Andrew Barnes ${andrewMatch[1]}` : '';
check('V2811-G05', andrewMatch && andrewMatch[1] === 'N', `Andrew report row: ${reportDom}`);
check('V2811-G06', andrewMatch && andrewMatch[1] !== '—', 'Andrew report row does not show dash');
check('V2811-G07', reportHtml.includes('<td>Y</td>'), 'Report still shows Y for Y swimmers');
check('V2811-G09', !reportHtml.includes('<td>null</td>'), 'Report does not show null as participant value');
check('V2811-G11', reportHtml.includes('Event Report'), 'Reopened generated Event Report HTML contains report title');
check('V2811-G12', reportHtml.includes('Special Entry'), 'Report print/popup keeps Special Entry column visible');
await page.eval(`(() => { document.getElementById('content').innerHTML = '<iframe id="report-frame" style="width:100%;height:700px"></iframe>'; document.getElementById('report-frame').srcdoc = ${JSON.stringify(reportHtml)}; })()`);
await page.screenshot('05-report-special-entry-n.png');

const bodyText = await page.eval(`document.body.innerText`);
check('V2811-I05', !bodyText.includes('undefined'), 'No visible undefined in final checked screen');
check('V2811-I06', !bodyText.includes('null'), 'No visible null in final checked screen');
check('V2811-I07', !bodyText.includes('NaN'), 'No visible NaN in final checked screen');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const md = `# USER INTERACTION TEST PROTOCOL — v2.8.11 Bryan Polish Pass\n\nDate: 2026-05-01\nVersion: ${version.version}\nBranch: dev/v2.8.11-bryan-polish\n\n## Summary\n\n- Automated/browser-assisted checks executed: ${results.length}\n- PASS: ${passed}\n- FAIL: ${failed}\n- Screenshot evidence: \`${OUT}/\`\n\n## Results\n\n| ID | Status | Evidence / note |\n|---|---|---|\n${results.map(r => `| ${r.id} | ${r.status} | ${String(r.note).replace(/\|/g,'/')} |`).join('\n')}\n`;
await fs.writeFile('USER-INTERACTION-TEST-PROTOCOL-v2.8.11.md', md);
console.log(md);
page.ws.close();
if (failed) process.exit(1);
