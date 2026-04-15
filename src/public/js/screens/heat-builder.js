/**
 * WWSC — Heat Builder Screen (Individual Heats + Relay Teams)
 * v2.6.0+: PB/Delay/Max in whole seconds, Finish/Net/Variance in centiseconds
 */
let hbRaces = [];
let hbSelectedRace = null;
let hbPreviewHeats = null;
let hbConfirmed = false;

// Relay state (when a relay race is selected)
let hbRelayTeams = null;
let hbRelayConfirmed = false;
let hbRelayRanked = false;
let hbAttendance = [];

const RACE_LABELS = {
  '25m': '25m Freestyle', '50m': '50m Freestyle', '75m': '75m Freestyle',
  'backstroke': 'Backstroke', 'breaststroke': 'Breaststroke', 'butterfly': 'Butterfly',
  '25m_relay': '25m Team Relay', '25m_brace': '25m Brace Relay',
  '50m_brace': '50m Brace Relay', 'medley_relay': 'Medley Relay', 'pogo': 'Pogo'
};

const RELAY_RACE_TYPES = ['25m_relay', '25m_brace', '50m_brace', 'medley_relay', 'pogo'];

function isRelayRace(raceType) {
  return RELAY_RACE_TYPES.includes(raceType);
}

async function renderHeatBuilder(raceType) {
  const event = await API.getCurrentEvent();
  const el = document.getElementById('content');

  if (!event) {
    el.innerHTML = '<h1>Heat Builder</h1><div class="card"><p>No active event. <a href="#" onclick="navigate(\'event-setup\')">Go to Times Sheet first.</a></p></div>';
    return;
  }

  hbRaces = await API.getRaces(event.id);
  hbAttendance = await API.getAttendance(event.id);

  if (hbRaces.length === 0) {
    el.innerHTML = '<h1>Heat Builder</h1><div class="card"><p>No events selected. <a href="#" onclick="navigate(\'event-setup\')">Go to Times Sheet.</a></p></div>';
    return;
  }

  if (raceType === 'reset') {
    const individualRaces = hbRaces.filter(r => !isRelayRace(r.race_type));
    hbSelectedRace = individualRaces.length > 0 ? individualRaces[0] : hbRaces[0];
    hbPreviewHeats = null;
    hbConfirmed = false;
    hbRelayTeams = null;
    hbRelayConfirmed = false;
    hbRelayRanked = false;
  } else if (raceType && raceType !== 'undefined') {
    const pending = hbRaces.find(r => r.race_type === raceType);
    if (pending) {
      hbSelectedRace = pending;
      hbPreviewHeats = null;
      hbConfirmed = false;
      hbRelayTeams = null;
      hbRelayConfirmed = false;
      hbRelayRanked = false;
    }
  } else if (window._pendingHBRaceType) {
    const pending = hbRaces.find(r => r.race_type === window._pendingHBRaceType);
    if (pending) {
      hbSelectedRace = pending;
      hbPreviewHeats = null;
      hbConfirmed = false;
      hbRelayTeams = null;
      hbRelayConfirmed = false;
      hbRelayRanked = false;
    }
    window._pendingHBRaceType = null;
  }

  if (!hbSelectedRace || !hbRaces.find(r => r.id === hbSelectedRace.id)) {
    const individualRaces = hbRaces.filter(r => !isRelayRace(r.race_type));
    hbSelectedRace = individualRaces.length > 0 ? individualRaces[0] : hbRaces[0];
    hbPreviewHeats = null;
    hbConfirmed = false;
    hbRelayTeams = null;
    hbRelayConfirmed = false;
    hbRelayRanked = false;
  } else {
    hbSelectedRace = hbRaces.find(r => r.id === hbSelectedRace.id);
  }

  if (isRelayRace(hbSelectedRace.race_type)) {
    if (hbSelectedRace.status === 'heats_generated' && !hbRelayTeams) {
      const saved = await API.getRelayTeams(hbSelectedRace.id);
      if (saved && saved.length > 0) {
        hbRelayTeams = saved;
        hbRelayConfirmed = true;
        hbRelayRanked = saved.some(t => t.place != null);
      }
    }
  } else {
    if (hbSelectedRace.status === 'heats_generated' && !hbPreviewHeats) {
      hbPreviewHeats = await loadSavedHeats(hbSelectedRace.id);
      hbConfirmed = true;
    }
  }

  drawHeatBuilder();
}

const SPECIAL_EVENT_TYPES = ['75m', 'backstroke', 'breaststroke', 'butterfly', 'medley_relay'];

function isSpecialEvent(raceType) {
  return SPECIAL_EVENT_TYPES.includes(raceType);
}

function drawHeatBuilder() {
  const el = document.getElementById('content');
  
  const standardIndividual = hbRaces.filter(r => !isRelayRace(r.race_type) && !isSpecialEvent(r.race_type));
  const relayRaces = hbRaces.filter(r => isRelayRace(r.race_type));
  const specialEvents = hbRaces.filter(r => isSpecialEvent(r.race_type));
  
  const allConfirmed = hbRaces.every(r => r.status === 'heats_generated');
  const confirmedCount = hbRaces.filter(r => r.status === 'heats_generated').length;

  let progressHtml = '<div class="progress-tracker">';
  
  const standardRaces = [...standardIndividual, ...relayRaces.filter(r => !isSpecialEvent(r.race_type))];
  const specialRaces = [...specialEvents.filter(r => !isRelayRace(r.race_type)), ...relayRaces.filter(r => isSpecialEvent(r.race_type))];
  if (standardRaces.length > 0) {
    progressHtml += '<div class="progress-section"><span class="progress-label">Standard ' + tooltip('25m + 50m + Relays') + ':</span>';
    for (const r of standardRaces) {
      const done = r.status === 'heats_generated';
      const active = hbSelectedRace && r.id === hbSelectedRace.id;
      progressHtml += '<button class="progress-item ' + (done ? 'done' : '') + (active ? ' active' : '') + '" onclick="selectHBRace(' + r.id + ')">' + (done ? '✅ ' : '⬜ ') + (RACE_LABELS[r.race_type] || r.race_type) + '</button>';
    }
    progressHtml += '</div>';
  }
  
  if (specialRaces.length > 0) {
    progressHtml += '<div class="progress-section"><span class="progress-label">Special ' + tooltip('Selected extra event') + ':</span>';
    for (const r of specialRaces) {
      const done = r.status === 'heats_generated';
      const active = hbSelectedRace && r.id === hbSelectedRace.id;
      progressHtml += '<button class="progress-item ' + (done ? 'done' : '') + (active ? ' active' : '') + '" onclick="selectHBRace(' + r.id + ')">' + (done ? '✅ ' : '⬜ ') + (RACE_LABELS[r.race_type] || r.race_type) + '</button>';
    }
    progressHtml += '</div>';
  }
  progressHtml += '</div>';

  if (!hbSelectedRace) return;

  let goToResultsBtn = '';
  if (allConfirmed) {
    goToResultsBtn = '<div class="card print-hide" style="background:#e8f5e9;text-align:center;padding:16px;margin-top:12px"><strong style="color:var(--success)">All ' + hbRaces.length + ' races ready!</strong><br><button class="btn btn-accent btn-lg" onclick="navigate(\'results\')" style="margin-top:8px;font-size:18px;padding:14px 32px">Go to Results</button></div>';
  } else {
    goToResultsBtn = '<div class="print-hide" style="text-align:center;margin-top:8px;color:#999;font-size:14px">' + confirmedCount + '/' + hbRaces.length + ' races confirmed — confirm all to proceed to Results</div>';
  }

  let raceContent = '';
  if (isRelayRace(hbSelectedRace.race_type)) {
    raceContent = renderRelayContent();
  } else {
    raceContent = renderIndividualContent();
  }

  const headerWithResults = '<div class="toolbar" style="margin-bottom:16px"><h1 style="margin:0">Heat Builder</h1><div class="toolbar-spacer"></div><button class="btn btn-outline" onclick="window.print()">🖨️ Print</button><button class="btn btn-primary" onclick="navigate(\'results\')">🏆 Results →</button></div>';
  
  el.innerHTML = headerWithResults + progressHtml + raceContent + goToResultsBtn;
}

// ═══ Individual Race Content ═══

function renderIndividualContent() {
  const race = hbSelectedRace;
  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;

  let buttons = '<div class="toolbar">';
  buttons += '<h2 style="margin:0">' + raceLabel + '</h2><div class="toolbar-spacer"></div>';
  
  if (!hbConfirmed) {
    buttons += '<button class="btn btn-primary" onclick="generateHBHeats()">' + tooltip('Randomly assigns swimmers to heats (4 per heat) based on who is present.') + ' Generate Heats</button>';
    if (hbPreviewHeats) {
      buttons += ' <button class="btn btn-accent" onclick="generateHBHeats()">' + tooltip('Re-randomize the heat assignments.') + ' Shuffle</button>';
      buttons += ' <button class="btn btn-success" onclick="confirmHBHeats()">' + tooltip('Lock these heats. You can then enter finish times.') + ' Confirm Heats</button>';
    }
  } else {
    buttons += '<button class="btn btn-accent" onclick="reshuffleHBHeats()">' + tooltip('Discard current heats and re-randomize.') + ' Re-Shuffle</button>';
  }
  buttons += '</div>';

  if (hbConfirmed) {
    buttons += '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">Heats Confirmed</strong></div>';
  }

  let table = '';
  if (hbPreviewHeats) {
    table = renderHeatTable(hbPreviewHeats);
  } else {
    table = '<div class="card print-hide"><p>Tap "Generate Heats" to create randomised heat assignments.</p></div>';
  }

  return buttons + '<div style="overflow-x:auto;margin-bottom:16px">' + table + '</div>';
}

function renderHeatTable(heats) {
  if (!heats || heats.length === 0) return '<div class="card"><p>No eligible swimmers (no PB times or nobody present).</p></div>';

  let html = '';
  for (const heat of heats) {
    const maxTime = heat.max_time || (Math.max(...heat.lanes.map(l => l.handicap_time)) + 2);
    let rows = '';
    for (let li = 0; li < 4; li++) {
      const lane = heat.lanes[li];
      if (lane) {
        rows += '<tr><td>' + lane.lane_number + '</td><td class="name-cell">' + lane.name + '</td><td>' + formatWhole(lane.handicap_time) + '</td><td style="color:#999">' + formatWhole(maxTime) + '</td><td style="font-weight:700;color:var(--accent)">+' + formatWhole(lane.start_delay) + '</td></tr>';
      } else {
        rows += '<tr><td>' + (li + 1) + '</td><td class="name-cell" style="color:#999;font-style:italic">— empty —</td><td></td><td></td><td></td></tr>';
      }
    }
    
    html += `
      <div class="card" style="margin-bottom:24px;padding:0;overflow:hidden;border:4px solid #0b3d91">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;border-bottom:4px solid #0b3d91;display:flex;justify-content:space-between;align-items:center">
          <span>Heat ${heat.heat_number}</span>
          <span style="font-weight:400;font-size:13px;opacity:0.8">Max: ${formatWhole(maxTime)}</span>
        </div>
        <table class="spreadsheet-table" style="margin:0">
          <thead>
            <tr>
              <th style="width:50px">Lane</th>
              <th style="text-align:left;min-width:150px">Swimmer</th>
              <th>PB ${tooltip('Personal Best — the fastest recorded time for this distance.')}</th>
              <th>Max Time ${tooltip('The slowest PB in this heat + 2s. Used to calculate start delays.')}</th>
              <th>Start Delay ${tooltip('Handicap delay = Max Time - Swimmer PB')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  return html;
}

// ═══ Relay Race Content ═══

function renderRelayContent() {
  const race = hbSelectedRace;
  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;

  let buttons = '<div class="toolbar">';
  buttons += '<h2 style="margin:0">' + raceLabel + '</h2><div class="toolbar-spacer"></div>';

  if (!hbRelayConfirmed) {
    buttons += '<button class="btn btn-primary" onclick="generateHBRelayTeams()">' + tooltip('Creates balanced relay teams from present swimmers.') + ' Generate Teams</button>';
    if (hbRelayTeams && hbRelayTeams.length > 0) {
      buttons += ' <button class="btn btn-accent" onclick="generateHBRelayTeams()">' + tooltip('Re-randomize the team assignments.') + ' Shuffle</button>';
      buttons += ' <button class="btn btn-success" onclick="confirmHBRelayTeams()">' + tooltip('Lock these teams.') + ' Confirm Teams</button>';
    }
  } else {
    buttons += '<button class="btn btn-accent" onclick="reshuffleHBRelayTeams()">' + tooltip('Discard current teams and re-randomize. Entered times will be lost.') + ' Re-Shuffle</button>';
  }
  buttons += '</div>';

  if (hbRelayConfirmed) {
    let statusMsg = 'Teams Confirmed';
    if (hbRelayRanked) {
      const teamsWithTime = hbRelayTeams ? hbRelayTeams.filter(t => t.total_time != null).length : 0;
      statusMsg = 'Results Calculated — ' + teamsWithTime + '/' + (hbRelayTeams ? hbRelayTeams.length : 0) + ' teams ranked';
    }
    buttons += '<div class="card print-hide" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">' + statusMsg + '</strong></div>';
  }

  if (race.race_type === 'medley_relay') {
    buttons += '<div class="card print-hide" style="background:#fff8e1;border-left:5px solid #e65100;padding:12px 16px;margin-top:12px">' +
      '<strong style="color:#e65100">What (Y) means</strong><br>' +
      '<span style="color:#5d4037">(Y) means the swimmer was marked as <strong>Y</strong> in the Times Sheet, so the system automatically assigned a stroke to fill the team.</span><br>' +
      '<span style="color:#5d4037">For Medley Relay, every team now starts at <strong>2</strong>. Results are ranked by <strong>smallest variance</strong>. Equal variances share the same place.</span>' +
      '</div>';
  }

  let content = '';
  if (hbRelayTeams && hbRelayTeams.length > 0) {
    const isBraceHB = ['25m_brace', '50m_brace'].includes(race.race_type);
    content = isBraceHB ? renderBraceTeamsInHB(hbRelayTeams, race) : renderRelayTeamsInHB(hbRelayTeams, race);
  } else {
    content = '<div class="card print-hide"><p>Tap "Generate Teams" to create balanced relay teams.</p></div>';
  }

  return buttons + '<div style="margin-bottom:16px">' + content + '</div>';
}

// v2.7.4: Brace in Heat Builder — compact lane-based layout (like Individual Heats)
function renderBraceTeamsInHB(teams, race) {
  let rows = '';
  for (const team of teams) {
    const members = team.members || [];
    const names = members.map(m => m.name).join(' + ');
    const pbs = members.map(m => formatWhole(getPBForRelayHB(m, race.race_type))).join(' + ');
    const totalDisplay = formatWhole(team.target_time);
    const startDisplay = formatWhole(team.start_delay || 0);
    const targetDisplay = formatWhole((team.target_time || 0) + (team.start_delay || 0));
    const placeDisplay = team.place ? ordinalRelay(team.place) : '—';
    const placeStyle = team.place ? 'color:#e53935;font-weight:700' : '';

    let totalCell;
    if (team.total_time != null) {
      totalCell = '<td style="font-weight:700">' + formatTime(team.total_time) + '</td>';
    } else {
      totalCell = '<td style="font-weight:700">' + formatWhole(team.target_time) + '</td>';
    }

    const varDisplay = team.variance != null ? ((team.variance >= 0 ? '+' : '') + formatTime(team.variance)) : '—';

    rows += '<tr>' +
      '<td>' + team.team_number + '</td>' +
      '<td class="name-cell">' + names + '</td>' +
      '<td>' + pbs + '</td>' +
      '<td>' + totalDisplay + '</td>' +
      '<td style="font-weight:700;color:var(--accent)">+' + startDisplay + '</td>' +
      '<td>' + targetDisplay + '</td>' +
      '<td>' + varDisplay + '</td>' +
      '<td style="' + placeStyle + '">' + placeDisplay + '</td>' +
      '</tr>';
  }

  return `
    <div class="card" style="margin-bottom:24px;padding:0;overflow:hidden;border:4px solid #0b3d91">
      <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;border-bottom:4px solid #0b3d91;display:flex;justify-content:space-between;align-items:center">
        <span>${RACE_LABELS[race.race_type] || race.race_type}</span>
        <span style="font-weight:400;font-size:13px;opacity:0.8">Start: 2s | smallest variance wins</span>
      </div>
      <table class="spreadsheet-table" style="margin:0">
        <thead>
          <tr>
            <th style="width:50px">Lane</th>
            <th style="text-align:left;min-width:200px">Pair</th>
            <th>PBs</th>
            <th>Total</th>
            <th>Start Delay</th>
            <th>Target</th>
            <th>Variance</th>
            <th>Place</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderRelayTeamsInHB(teams, race) {
  let html = '';
  const isMedley = race.race_type === 'medley_relay';
  const is25mRelay = race.race_type === '25m_relay';
  const showStroke = isMedley || ['25m_brace', '50m_brace'].includes(race.race_type); // BF0404-07: Hide stroke for 25m relay
  const isPogo = race.race_type === 'pogo';
  const showSplits = false; // R4/R8: Split removed from HB per Bryan v2.8.0
  const showPogoTimes = isPogo; // v2.7.3: Pogo shows T1/T2/Avg columns
  const teamColors = ['#0b3d91', '#c62828', '#2e7d32', '#e65100', '#6a1b9a', '#00838f'];
  const medleyColors = {
    back: '#e3f2fd',
    breast: '#fce4ec',
    fly: '#fff3e0',
    free: '#e8f5e9'
  };

  for (let ti = 0; ti < teams.length; ti++) {
    const team = teams[ti];
    const teamColor = teamColors[ti % teamColors.length];
    const members = team.members || [];
    const placeDisplay = team.place ? ordinalRelay(team.place) : '';
    // R-15: Relay place display red + bold
    const teamHeader = team.team_name + (placeDisplay ? ' — <span style="color:#e53935;font-weight:700;font-size:18px">' + placeDisplay + '</span>' : '');

    // R18 v2.8.3 / v2.8.4 Bryan fix 4: Leftover team banner for Medley AND
    // 25m Team Relay — prompts user to explicitly pick a swim-twice swimmer
    // instead of relying on silent auto-filling.
    const missingStrokes = isMedley ? ['Back', 'Breast', 'Free'].filter(st => !members.find(m => (m.stroke || '').toLowerCase() === st.toLowerCase())) : [];
    const isRelay25mUnder = is25mRelay && team.needs_swim_twice_completion === true && members.length < 4;
    const isLeftoverTeam = (isMedley && team.needs_swim_twice_completion === true && missingStrokes.length > 0) || isRelay25mUnder;
    let leftoverBanner = '';
    if (isMedley && team.needs_swim_twice_completion === true && missingStrokes.length > 0) {
      leftoverBanner = '<div class="print-hide" style="background:#fff3e0;border-left:4px solid #e65100;padding:10px 14px;font-size:13px;color:#5d4037"><strong>⚠️ Leftover team — incomplete.</strong> Select a swimmer below to <strong>swim twice</strong> and complete missing stroke' + (missingStrokes.length > 1 ? 's' : '') + ': <strong>' + missingStrokes.join(', ') + '</strong>.</div>';
    } else if (isRelay25mUnder) {
      const missingLegs = 4 - members.length;
      leftoverBanner = '<div class="print-hide" style="background:#fff3e0;border-left:4px solid #e65100;padding:10px 14px;font-size:13px;color:#5d4037"><strong>⚠️ Team is undersized.</strong> ' + missingLegs + ' leg' + (missingLegs > 1 ? 's' : '') + ' missing — explicitly pick a swimmer from the dropdown below to <strong>swim twice</strong> and even out this team.</div>';
    }

    let rows = '';
    for (let mi = 0; mi < members.length; mi++) {
      const m = members[mi];
      const pbCol = getPBForRelayHB(m, race.race_type);
      const pbDisplay = formatWhole(pbCol);
      const strokeKey = isMedley ? (m.stroke || '').toLowerCase().substring(0, 4) : null;
      const rowStyle = isMedley ? ' style="background:' + (medleyColors[strokeKey] || '#fff') + '"' : '';
      const strokeLabel = m.stroke || '—';
      // v2.8.4: Swim-twice members get editable stroke + remove button (Medley only).
      // Only rows explicitly added via hbAddSwimTwice (is_swim_twice flag) OR
      // a duplicate appearance of the same member within the SAME team get the edit UI.
      // An original assignment in one team is never removable through this UI, even
      // if the same swimmer also swims twice in a different team.
      const duplicateInTeam = members.some((other, oi) => oi < mi && other.member_id === m.member_id);
      const isSwimTwice = isMedley && !hbRelayConfirmed && (duplicateInTeam || m.is_swim_twice === true);
      let strokeCellContent;
      if (isMedley && isSwimTwice) {
        // Editable stroke selector + remove button
        const strokes = ['Back', 'Breast', 'Free'];
        const opts = strokes.map(st => '<option value="' + st + '"' + (st === m.stroke ? ' selected' : '') + '>' + st + '</option>').join('');
        strokeCellContent = '<select class="form-control" style="display:inline-block;width:auto;min-width:90px;padding:2px 6px;margin-right:6px" onchange="hbChangeSwimTwiceStroke(' + ti + ',' + mi + ',this.value)">' + opts + '</select>'
          + '<button class="btn btn-outline" style="padding:2px 8px;font-size:12px;color:#c62828;border-color:#c62828" onclick="hbRemoveSwimTwice(' + ti + ',' + mi + ')" title="Remove this swim-twice assignment">✕ Remove</button>';
      } else {
        strokeCellContent = (isMedley && m.auto === true)
          ? strokeLabel + ' <span style="color:#e65100;font-weight:700;font-size:13px">(Y)</span>'
          : strokeLabel;
      }

      // BF0404-04: Split column for 25m relay (shows after confirm)
      let splitCell = '';
      if (showSplits && hbRelayConfirmed) {
        splitCell = '<td class="time-input" onclick="enterHBRelaySplit(' + (team.id || 0) + ', ' + m.member_id + ', ' + (m.split_time || 0) + ')" style="cursor:pointer;font-weight:700">' + (m.split_time != null ? formatTime(m.split_time) : '⏱️ Tap') + '</td>';
      } else if (showSplits) {
        splitCell = '<td class="time-cell">—</td>';
      }

      rows += '<tr' + rowStyle + '><td>' + m.leg_order + '</td><td class="name-cell">' + m.name + '</td>' + (showStroke ? '<td>' + strokeCellContent + '</td>' : '') + splitCell + '<td class="time-cell">' + pbDisplay + '</td></tr>';
    }

    // R16: No Swim Twice for Pogo
    let swimTwiceRow = '';
    if (!hbRelayConfirmed && !isPogo) {
      const nextLeg = members.length + 1;
      let optionPool = members;
      if (isMedley) {
        optionPool = hbAttendance
          .filter(a => a.present && ['Y', 'Back', 'Breast', 'Free'].includes(a.special_event_entry))
          .map(a => ({ member_id: a.member_id, name: a.name }));
      } else if (is25mRelay) {
        // v2.8.4 Bryan fix 4: 25m Team Relay — show ALL present attendees so user
        // can explicitly pick any swimmer to swim twice (not just this team's members).
        optionPool = hbAttendance
          .filter(a => a.present)
          .map(a => ({ member_id: a.member_id, name: a.name }));
      }
      const seen = new Set();
      const memberOptions = optionPool
        .filter(function(m) {
          if (seen.has(m.member_id)) return false;
          seen.add(m.member_id);
          return true;
        })
        .sort(function(a, b) { return a.name.localeCompare(b.name); })
        .map(function(m) { return '<option value="' + m.member_id + '">' + m.name + '</option>'; }).join('');
      const addLabel = (isMedley && isLeftoverTeam) ? '➕ Swim Twice' : (isMedley ? '➕ Add Swimmer' : '➕ Swim Twice');
      const colSpan = 1 + (showStroke ? 1 : 0) + (showSplits ? 1 : 0) + 1; // swimmer + optional stroke + optional split + PB
      // v2.8.5 Bryan fix A: for Medley, include an explicit stroke picker so
      // user chooses swimmer AND stroke before the add. Default pre-select is
      // the first still-missing stroke in the team; user can freely change it.
      let strokePicker = '';
      if (isMedley) {
        const medleyStrokes = ['Back', 'Breast', 'Free'];
        const strokeOpts = medleyStrokes.map(function(st) {
          const isMissing = missingStrokes.indexOf(st) !== -1;
          const preselect = (missingStrokes.length > 0 && st === missingStrokes[0]) ? ' selected' : '';
          const label = isMissing ? st + ' (missing)' : st;
          return '<option value="' + st + '"' + preselect + '>' + label + '</option>';
        }).join('');
        strokePicker = '<label style="font-size:12px;color:#5d4037;font-weight:700;margin-left:4px">Swim as:</label><select id="hb-swim-twice-stroke-' + ti + '" class="form-control" style="max-width:160px;min-height:44px">' + strokeOpts + '</select>';
      }
      swimTwiceRow = '<tr class="print-hide" style="background:#fafafa; border-top: 2px dashed #ccc"><td>' + nextLeg + '</td><td colspan="' + colSpan + '"><div style="display:flex;align-items:center;gap:8px;padding:4px 0;flex-wrap:wrap"><select id="hb-swim-twice-' + ti + '" class="form-control" style="max-width:240px;min-height:44px"><option value="">— Select swimmer —</option>' + memberOptions + '</select>' + strokePicker + '<button class="btn btn-accent" style="min-height:44px;white-space:nowrap" onclick="hbAddSwimTwice(' + ti + ')">' + addLabel + '</button></div></td></tr>';
    }

    // BF0404-05: Team Total shows target_time (whole seconds) before times are entered, or total_time (centiseconds) after
    // v2.7.1: Must use correct formatter for each unit type
    let totalTimeCell;
    if (team.total_time != null) {
      totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:18px">' + formatTime(team.total_time) + '</td>';
    } else {
      totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:18px">' + (team.target_time != null ? formatWhole(team.target_time) : '—') + '</td>';
    }

    // Consistent naming with Results: Total = PB sum, Start Delay separate, Target = Total + Start Delay
    const startDelayDisplay = '⏱️ Start Delay: ' + formatWhole(team.start_delay || 0) + ' s';
    const totalDisplay = team.target_time != null ? 'Total: ' + formatWhole(team.target_time) : '';
    const targetDisplay = team.target_time != null ? 'Target: ' + formatWhole(team.target_time + (team.start_delay || 0)) : '';

    // Column counts for colspan
    const totalColSpan = 1 + (showStroke ? 1 : 0) + (showSplits ? 1 : 0); // leg + swimmer + optional stroke + optional split (PB is the last cell)
    const strokeHeader = showStroke ? '<th>Stroke</th>' : '';
    const splitHeader = showSplits ? '<th style="min-width:80px">Split</th>' : '';

    html += '<div class="card" style="margin-bottom:40px;padding:0;overflow:hidden;border:4px solid ' + teamColor + '">' +
            '<div style="background:' + teamColor + ';color:white;padding:12px 16px;font-weight:800;font-size:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-bottom:1px solid rgba(0,0,0,0.1)">' +
            '<span style="flex-shrink:0">' + teamHeader + '</span>' +
            '<span style="display:flex;align-items:center;gap:12px;flex-shrink:0"><span style="background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:20px;font-weight:700;font-size:16px">' + startDelayDisplay + '</span><span style="font-weight:400;font-size:13px;color:rgba(255,255,255,0.9);white-space:nowrap">' + (totalDisplay ? totalDisplay : '') + (targetDisplay ? ' • ' + targetDisplay : '') + '</span></span>' +
            '</div>' +
            leftoverBanner +
            '<table class="spreadsheet-table" style="margin:0">' +
            '<thead><tr><th style="width:50px">Leg</th><th style="text-align:left;min-width:140px">Swimmer</th>' + strokeHeader + splitHeader + '<th>PB</th></tr></thead>' +
            '<tbody>' + rows + swimTwiceRow +
            (isPogo ? '' : '<tr style="background:#f5f5f5;font-weight:700;border-top:2px solid ' + teamColor + '"><td></td><td colspan="' + totalColSpan + '">Team Total</td>' + totalTimeCell + '</tr>') +
            '</tbody></table></div>';
  }

  return html;
}

// BF-5 + v2.8.5 Bryan fix A: Add swimmer to swim a second leg.
// Medley: the stroke is taken from the explicit stroke picker the user chose
// in the swim-twice row (id="hb-swim-twice-stroke-<teamIndex>"). No hidden
// defaults, no reuse of the swimmer's historical stroke, no fallback to a
// "previous stroke" behavior. Row is marked is_swim_twice so the inline
// stroke dropdown + remove button render for the user.
function hbAddSwimTwice(teamIndex) {
  var select = document.getElementById('hb-swim-twice-' + teamIndex);
  if (!select || !select.value) { alert('Please select a swimmer first.'); return; }
  var memberId = parseInt(select.value);
  var team = hbRelayTeams[teamIndex];
  if (!team) return;
  var existing = team.members.find(function(m) { return m.member_id === memberId; });
  if (!existing) {
    existing = hbAttendance.find(function(a) { return a.member_id === memberId; });
    if (!existing) return;
  }
  var nextLeg = team.members.length + 1;
  var stroke = existing.stroke || 'Free';
  var auto = false;
  if (hbSelectedRace && hbSelectedRace.race_type === 'medley_relay') {
    // v2.8.5: Use the explicit stroke picker value. If somehow missing, fall
    // back to first open stroke in the team (never to the swimmer's history).
    var strokeSelect = document.getElementById('hb-swim-twice-stroke-' + teamIndex);
    if (strokeSelect && strokeSelect.value) {
      stroke = strokeSelect.value;
    } else {
      var openStrokes = ['Back', 'Breast', 'Free'].filter(function(st) {
        return !team.members.find(function(m) { return (m.stroke || '').toLowerCase() === st.toLowerCase(); });
      });
      stroke = openStrokes.length > 0 ? openStrokes[0] : 'Free';
    }
    auto = false;
  }
  var newMember = {
    member_id: existing.member_id,
    name: existing.name,
    leg_order: nextLeg,
    stroke: stroke,
    auto: auto,
    is_swim_twice: true,
    time_25m: existing.time_25m,
    time_50m: existing.time_50m,
    time_backstroke: existing.time_backstroke,
    time_breaststroke: existing.time_breaststroke,
    time_butterfly: existing.time_butterfly
  };
  team.members.push(newMember);

  // v2.7.1: Recalculate target_time, start_delay, max_time after adding swimmer
  recalcRelayTeam(team, hbSelectedRace.race_type, hbRelayTeams);
  renderHeatBuilder();
}

// v2.8.4 Bryan fix 1: Change stroke of a swim-twice member to the actual
// stroke they need to fill. Recalculates team PB totals for medley.
function hbChangeSwimTwiceStroke(teamIndex, memberIndex, newStroke) {
  var team = hbRelayTeams[teamIndex];
  if (!team || !team.members || !team.members[memberIndex]) return;
  team.members[memberIndex].stroke = newStroke;
  team.members[memberIndex].auto = false;
  if (hbSelectedRace) recalcRelayTeam(team, hbSelectedRace.race_type, hbRelayTeams);
  renderHeatBuilder();
}

// v2.8.4 Bryan fix 2: Remove a swim-twice assignment so the user can
// correct a wrong selection.
function hbRemoveSwimTwice(teamIndex, memberIndex) {
  var team = hbRelayTeams[teamIndex];
  if (!team || !team.members || !team.members[memberIndex]) return;
  team.members.splice(memberIndex, 1);
  // Re-number leg_order so legs stay 1..N
  team.members.forEach(function(m, i) { m.leg_order = i + 1; });
  if (hbSelectedRace) recalcRelayTeam(team, hbSelectedRace.race_type, hbRelayTeams);
  renderHeatBuilder();
}

// getPBForRelayHB → use shared getRelayPB from format.js
function getPBForRelayHB(member, raceType) { return getRelayPB(member, raceType); }

// ordinalRelay → use shared ordinal from format.js
function ordinalRelay(n) { return ordinal(n); }

// ═══ Individual Actions ═══

async function selectHBRace(raceId) {
  hbSelectedRace = hbRaces.find(r => r.id === parseInt(raceId));
  hbPreviewHeats = null;
  hbConfirmed = false;
  hbRelayTeams = null;
  hbRelayConfirmed = false;
  hbRelayRanked = false;
  if (hbSelectedRace.status === 'heats_generated') {
    if (isRelayRace(hbSelectedRace.race_type)) {
      const saved = await API.getRelayTeams(hbSelectedRace.id);
      if (saved && saved.length > 0) {
        hbRelayTeams = saved;
        hbRelayConfirmed = true;
        hbRelayRanked = saved.some(t => t.place != null);
      }
    } else {
      hbPreviewHeats = await loadSavedHeats(hbSelectedRace.id);
      hbConfirmed = true;
    }
  }
  drawHeatBuilder();
}

async function generateHBHeats() {
  const result = await API.generateHeats(hbSelectedRace.id);
  if (result.warning) alert(result.warning);
  hbPreviewHeats = result.heats;
  hbConfirmed = false;
  drawHeatBuilder();
}

async function confirmHBHeats() {
  if (!hbPreviewHeats || hbPreviewHeats.length === 0) return;
  await API.confirmHeats(hbSelectedRace.id, hbPreviewHeats);
  hbConfirmed = true;
  hbSelectedRace.status = 'heats_generated';
  drawHeatBuilder();
}

async function reshuffleHBHeats() {
  if (!confirm('Re-shuffle heats? Any entered results for this race will be cleared.')) return;
  hbConfirmed = false;
  hbSelectedRace.status = 'setup';
  await generateHBHeats();
}

function goToResults() { navigate('results'); }

async function loadSavedHeats(raceId) {
  const res = await fetch('/api/races/' + raceId + '/heats');
  const heats = await res.json();
  if (!heats.length) return null;
  return heats.map(function(h) {
    return {
      heat_number: h.heat_number,
      max_time: h.max_time,
      lanes: h.lanes.map(function(l) {
        return { lane_number: l.lane_number, name: l.name, member_id: l.member_id, handicap_time: l.handicap_time, start_delay: l.start_delay };
      })
    };
  });
}

// ═══ Relay Actions (in Heat Builder) ═══

async function generateHBRelayTeams() {
  const result = await API.generateRelayTeams(hbSelectedRace.id);
  if (result.error) { alert('Error: ' + result.error); return; }
  if (result.warning) alert(result.warning);
  hbRelayTeams = result.teams;
  hbRelayConfirmed = false;
  hbRelayRanked = false;
  drawHeatBuilder();
}

async function confirmHBRelayTeams() {
  if (!hbRelayTeams || hbRelayTeams.length === 0) return;
  const result = await API.saveRelayTeams(hbSelectedRace.id, hbRelayTeams);
  if (result.error) { alert('Error: ' + result.error); return; }
  const saved = await API.getRelayTeams(hbSelectedRace.id);
  hbRelayTeams = saved;
  hbRelayConfirmed = true;
  hbSelectedRace.status = 'heats_generated';
  drawHeatBuilder();
}

async function reshuffleHBRelayTeams() {
  if (!confirm('Re-shuffle teams? Any entered times will be cleared.')) return;
  hbRelayConfirmed = false;
  hbRelayRanked = false;
  hbRelayTeams = null;
  hbSelectedRace.status = 'setup';
  await generateHBRelayTeams();
}

function enterHBRelayTeamTime(teamId, currentValue) {
  showNumpad('', async function(value) {
    if (value == null) return;
    await API.enterRelayTeamTime(teamId, value);
    const saved = await API.getRelayTeams(hbSelectedRace.id);
    hbRelayTeams = saved;
    drawHeatBuilder();
  });
}

function enterHBRelaySplit(teamId, memberId, currentValue) {
  showNumpad(currentValue || '', async function(value) {
    if (value == null) return;
    await API.enterRelaySplit(teamId, memberId, value);
    const saved = await API.getRelayTeams(hbSelectedRace.id);
    hbRelayTeams = saved;
    drawHeatBuilder();
  });
}
