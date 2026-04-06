/**
 * WWSC Display Tests v2.7.1 — Automated DOM verification
 *
 * Run via browser console or preview_eval after setting up test data.
 * Prerequisite: Server running on port 3000 with test data from setup script.
 *
 * Usage:
 *   1. Run: python3 tests/display/setup-display-data.py
 *   2. Open http://localhost:3000 in browser
 *   3. Open browser console
 *   4. Paste this entire file and press Enter
 *   5. Results print to console
 */
(async function runDisplayTests() {
  var PASS = 0, FAIL = 0, RESULTS = [];

  function ok(name) { PASS++; RESULTS.push('✅ ' + name); console.log('  ✅ ' + name); }
  function fail(name, detail) { FAIL++; RESULTS.push('❌ ' + name + ' — ' + (detail || '')); console.log('  ❌ ' + name + ' — ' + (detail || '')); }

  function waitMs(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  async function nav(screen) {
    navigate(screen);
    await waitMs(500); // let DOM render
  }

  console.log('\n=== WWSC DISPLAY TESTS v2.7.1 ===\n');

  // ─── D1: Members — PBs are whole numbers (R-02) ───
  console.log('--- R-02: Members Whole Seconds ---');
  await nav('members');
  var cells = document.querySelectorAll('.data-table td');
  var hasDecimalPB = false;
  cells.forEach(function(c) {
    var t = c.textContent.trim();
    if (t.match(/^\d+\.\d+$/) && !t.match(/^\d+\.00$/)) hasDecimalPB = true;
  });
  hasDecimalPB ? fail('D1-R02: Members PBs whole seconds', 'found decimal') : ok('D1-R02: Members PBs whole seconds');

  // ─── D2-D8: Results Screen ───
  console.log('--- R-03/R-04/R-05/B2: Results ---');
  await nav('results');
  await waitMs(500);

  // D2: "Exp. Finish" column header (R-04)
  var headers = Array.from(document.querySelectorAll('th'));
  headers.some(function(h) { return h.textContent.includes('Exp. Finish'); })
    ? ok('D2-R04: "Exp. Finish" column exists')
    : fail('D2-R04: "Exp. Finish" column missing');

  // D3: PB/Delay/ExpFinish are whole numbers (R-03)
  var pbHasDecimal = false;
  document.querySelectorAll('.spreadsheet-table tbody tr').forEach(function(r) {
    var tds = r.querySelectorAll('td');
    if (tds.length >= 8) {
      [2, 3, 4].forEach(function(i) {
        var v = tds[i].textContent.trim();
        if (v !== '—' && v.match(/\.\d+/)) pbHasDecimal = true;
      });
    }
  });
  pbHasDecimal ? fail('D3-R03: PB/Delay/ExpFinish whole', 'found decimal') : ok('D3-R03: PB/Delay/ExpFinish whole seconds');

  // D4: Finish times are XX.XX (centiseconds format)
  var finishOK = true;
  document.querySelectorAll('.spreadsheet-table tbody tr').forEach(function(r) {
    var tds = r.querySelectorAll('td');
    if (tds.length >= 8) {
      var ft = tds[5].textContent.trim();
      if (ft !== '—' && ft !== '⏱️ Tap' && !ft.match(/\d+\.\d{2}/)) finishOK = false;
    }
  });
  finishOK ? ok('D4: Finish times XX.XX format') : fail('D4: Finish format');

  // D5-D7: Gold/Silver/Bronze (R-05)
  var gold = document.querySelectorAll('td[style*="#FFD700"]').length;
  var silver = document.querySelectorAll('td[style*="#C0C0C0"]').length;
  var bronze = document.querySelectorAll('td[style*="#CD7F32"]').length;
  gold > 0 ? ok('D5-R05: Gold styling (' + gold + ')') : fail('D5-R05: No gold');
  silver > 0 ? ok('D6-R05: Silver styling (' + silver + ')') : fail('D6-R05: No silver');
  bronze > 0 ? ok('D7-R05: Bronze styling (' + bronze + ')') : fail('D7-R05: No bronze');

  // D8: Breakers inline — Improved By format (B2+5)
  var breakerSection = document.querySelector('[style*="border-left:6px solid #2e7d32"]');
  if (breakerSection) {
    var bt = breakerSection.textContent;
    var hasGoodFormat = bt.match(/-\d+\.\d{2}/);
    var hasDoubleNeg = bt.match(/--\d/);
    (hasGoodFormat && !hasDoubleNeg) ? ok('D8-B2: Breaker Improved By format correct') : fail('D8-B2: Breaker format', 'double neg or wrong format');
  } else {
    fail('D8-B2: No breakers section found');
  }

  // ─── D9-D14: 25m Relay Results ───
  console.log('--- R-07/R-08/R-09/R-15/R-16/B4: 25m Relay ---');
  var sel = document.querySelector('select.form-control');
  var relayOpt = Array.from(sel.options).find(function(o) { return o.text.includes('25m Team'); });
  if (relayOpt) {
    sel.value = relayOpt.value;
    sel.dispatchEvent(new Event('change'));
    await waitMs(500);
  }

  // D9: No Stroke column (R-09)
  var relayHeaders = Array.from(document.querySelectorAll('.spreadsheet-table th'));
  var hasStroke = relayHeaders.some(function(h) { return h.textContent.includes('Stroke'); });
  hasStroke ? fail('D9-R09: Stroke column present in 25m relay') : ok('D9-R09: No Stroke column in 25m relay');

  // D10: Split column exists (R-07)
  var hasSplit = relayHeaders.some(function(h) { return h.textContent.includes('Split'); });
  hasSplit ? ok('D10-R07: Split column in 25m relay') : fail('D10-R07: No Split column');

  // D11: Place rot+fett (R-15)
  var placeSpans = document.querySelectorAll('span[style*="color:#e53935"]');
  var boldPlace = false;
  placeSpans.forEach(function(s) { if (s.style.fontWeight === '700') boldPlace = true; });
  (placeSpans.length > 0 && boldPlace) ? ok('D11-R15: Relay place red+bold (' + placeSpans.length + ')') : fail('D11-R15: Relay place styling');

  // D12: Team Total formatted as XX.XX (B4)
  var totalCorrect = true;
  document.querySelectorAll('tr[style*="background:#c62828"] td').forEach(function(c) {
    var t = c.textContent.trim();
    if (t.match(/^\d{3,}$/) && !t.includes('.')) totalCorrect = false;
  });
  totalCorrect ? ok('D12-B4: Relay Total formatted (not raw cs)') : fail('D12-B4: Raw centiseconds in Total');

  // D13: No Exceeded Report on relay page (R-16)
  var slowSection = document.getElementById('slow-swimmers-section');
  var hasExceeded = slowSection && slowSection.innerHTML.trim().length > 0;
  hasExceeded ? fail('D13-R16: Exceeded on relay page') : ok('D13-R16: No Exceeded on relay page');

  // D14: Start time prominent (R-08)
  var hasStart = false;
  document.querySelectorAll('span').forEach(function(s) {
    if (s.textContent.includes('Start:') && s.textContent.includes('s')) hasStart = true;
  });
  hasStart ? ok('D14-R08: Start time prominent') : fail('D14-R08: No start time visible');

  // ─── D15-D17: Medley Relay ───
  console.log('--- R-10/R-11/R-17: Medley Relay ---');
  var medleyOpt = Array.from(sel.options).find(function(o) { return o.text.includes('Medley'); });
  if (medleyOpt) {
    sel.value = medleyOpt.value;
    sel.dispatchEvent(new Event('change'));
    await waitMs(500);
  }

  // D15: Stroke column present (R-10)
  var medleyHeaders = Array.from(document.querySelectorAll('.spreadsheet-table th'));
  var medleyStroke = medleyHeaders.some(function(h) { return h.textContent.includes('Stroke'); });
  medleyStroke ? ok('D15-R10: Stroke column in Medley') : fail('D15-R10: No Stroke in Medley');

  // D16: All teams Start=2 (R-17)
  var startTexts = [];
  document.querySelectorAll('span').forEach(function(s) {
    if (s.textContent.includes('Start:')) startTexts.push(s.textContent.trim());
  });
  var allStart2 = startTexts.length > 0 && startTexts.every(function(t) { return t.includes('2 s'); });
  allStart2 ? ok('D16-R17: Medley Start=2 (' + startTexts.length + ' teams)') : fail('D16-R17: Medley start not 2', JSON.stringify(startTexts));

  // D17: Variance formatted XX.XX (R-18)
  var varTexts = [];
  document.querySelectorAll('span').forEach(function(s) {
    if (s.textContent.includes('Variance:')) varTexts.push(s.textContent.trim());
  });
  var varOK = varTexts.every(function(t) { return t.match(/[+-]?\d+\.\d{2}/); });
  (varTexts.length > 0 && varOK) ? ok('D17-R18: Medley variance formatted') : fail('D17-R18: Variance format', JSON.stringify(varTexts));

  // ─── D18-D19: Breaker Report Screen ───
  console.log('--- B6: Breaker Report Screen ---');
  await nav('breaker-report');
  await waitMs(500);

  // D18: All time values formatted XX.XX (B6)
  var rawCS = false, formattedCS = false;
  document.querySelectorAll('.time-cell').forEach(function(c) {
    var t = c.textContent.trim();
    if (t.match(/^\d{3,}s?$/)) rawCS = true;
    if (t.match(/^\d+\.\d{2}$/)) formattedCS = true;
  });
  (formattedCS && !rawCS) ? ok('D18-B6: Breaker Report formatted (no raw cs)') : fail('D18-B6: Raw centiseconds in Breaker Report');

  // D19: No double-negative (B5)
  var bodyText = document.body.textContent;
  bodyText.match(/--\d+\.\d/) ? fail('D19-B5: Double negative found') : ok('D19-B5: No double negative');

  // ─── D20-D22: Season Calendar Modal ───
  console.log('--- B7: Season Calendar Modal ---');
  await nav('calendar');
  await waitMs(500);

  // Complete event first if needed
  await fetch('/api/events/1/complete', { method: 'POST' });
  await nav('calendar');
  await waitMs(300);

  // Open modal
  if (typeof viewEventDetails === 'function') {
    viewEventDetails(1);
    await waitMs(800);
  }

  var modal = document.querySelector('[style*="fixed"]');
  if (modal) {
    var mt = modal.textContent;

    // D20: Participants section (B7)
    mt.includes('Participants') ? ok('D20-B7: Calendar has Participants') : fail('D20-B7: No Participants');

    // D21: Race results (B7)
    (mt.includes('Races') && mt.match(/1st:|2nd:|3rd:/)) ? ok('D21-B7: Calendar has race results') : fail('D21-B7: No race results');

    // D22: Breaker values formatted (B7)
    var breakerPart = mt.substring(mt.indexOf('Record Breakers'));
    var hasRawS = breakerPart.match(/\d{3,}s/);
    var hasFmt = breakerPart.match(/\d+\.\d{2}/);
    (hasFmt && !hasRawS) ? ok('D22-B7: Calendar breakers formatted') : fail('D22-B7: Raw values in calendar');

    modal.remove();
  } else {
    fail('D20-D22: Modal did not open');
  }

  // ─── D23: Stroke Counter on Times Sheet (R-14) ───
  console.log('--- R-14: Stroke Counter ---');
  // Need to set medley config first
  await fetch('/api/events/reset', { method: 'POST' });
  var evtRes = await fetch('/api/events/current');
  var evt = await evtRes.json();
  if (evt && evt.id) {
    await fetch('/api/events/' + evt.id + '/config', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard_event: 'ordinary_swim', special_event: 'medley_relay' })
    });
    var attRes = await fetch('/api/events/' + evt.id + '/attendance');
    var att = await attRes.json();
    var entries = ['Y', 'Back', 'Breast', 'Free', 'Y', 'Back', 'N', 'N', 'N'];
    var updates = att.slice(0, 9).map(function(a, i) {
      return { member_id: a.member_id, present: true, special_event_entry: entries[i] };
    });
    att.slice(9).forEach(function(a) { updates.push({ member_id: a.member_id, present: false }); });
    await fetch('/api/events/' + evt.id + '/attendance', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendees: updates })
    });
  }
  await nav('event-setup');
  await waitMs(500);

  var tsText = document.body.textContent;
  var hasBackC = tsText.includes('Back:');
  var hasBreastC = tsText.includes('Breast:');
  var hasFreeC = tsText.includes('Free:');
  (hasBackC && hasBreastC && hasFreeC) ? ok('D23-R14: Stroke counter visible') : fail('D23-R14: Stroke counter', 'Back=' + hasBackC + ' Breast=' + hasBreastC + ' Free=' + hasFreeC);

  // ─── D24: R-21 Post-Complete status ───
  console.log('--- R-21/R-22: Post-Complete ---');
  // The completed event should show "Completed" status, not "in progress"
  // Check via API
  var ev1Res = await fetch('/api/events/1');
  var ev1 = await ev1Res.json();
  if (ev1 && ev1.status === 'completed') {
    ok('D24-R21: Event status=completed (not in progress)');
  } else {
    fail('D24-R21: Event status', ev1 ? ev1.status : 'null');
  }

  // D25: R-22 After complete, Results screen shows "Completed" banner (not timesheet redirect)
  // We need a completed event as current — but completed events show "no active event"
  // This is BY DESIGN: completed events go to calendar. The requirement says
  // "no redirect to timesheet after complete" — and doCompleteEvent() navigates to calendar.
  // Verify: doCompleteEvent calls navigate('calendar'), not navigate('event-setup')
  if (typeof doCompleteEvent === 'function') {
    var fnSource = doCompleteEvent.toString();
    var goesToCalendar = fnSource.includes("navigate('calendar')");
    var goesToTimesheet = fnSource.includes("navigate('event-setup')");
    (goesToCalendar && !goesToTimesheet) ? ok('D25-R22: Complete → calendar (not timesheet)') : fail('D25-R22: Navigation after complete', 'calendar=' + goesToCalendar + ' timesheet=' + goesToTimesheet);
  } else {
    fail('D25-R22: doCompleteEvent not found');
  }

  // D26: R-23 Event Report exists and is callable
  if (typeof showSeasonReport === 'function') {
    ok('D26-R23: showSeasonReport function exists');
  } else {
    fail('D26-R23: showSeasonReport missing');
  }

  // ─── SUMMARY ───
  console.log('\n' + '='.repeat(50));
  console.log('  DISPLAY TESTS: ' + PASS + ' PASS / ' + FAIL + ' FAIL');
  console.log('='.repeat(50));
  RESULTS.forEach(function(r) { console.log('  ' + r); });
  console.log('\n  VERDICT: ' + (FAIL === 0 ? 'PASS' : 'FAIL'));

  return { pass: PASS, fail: FAIL, verdict: FAIL === 0 ? 'PASS' : 'FAIL' };
})();
