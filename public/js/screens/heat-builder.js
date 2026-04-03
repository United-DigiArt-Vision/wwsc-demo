/**
 * WWSC — Heat Builder Screen (Individual Heats + Relay Teams)
 * v2.4.0: All times in centiseconds, formatTime() display, relay handicap
 */
let hbRaces = [];
let hbSelectedRace = null;
let hbPreviewHeats = null;
let hbConfirmed = false;

// Relay state (when a relay race is selected)
let hbRelayTeams = null;
let hbRelayConfirmed = false;
let hbRelayRanked = false;

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
    goToResultsBtn = '<div class="card" style="background:#e8f5e9;text-align:center;padding:16px;margin-top:12px"><strong style="color:var(--success)">All ' + hbRaces.length + ' races ready!</strong><br><button class="btn btn-accent btn-lg" onclick="navigate(\'results\')" style="margin-top:8px;font-size:18px;padding:14px 32px">Go to Results</button></div>';
  } else {
    goToResultsBtn = '<div style="text-align:center;margin-top:8px;color:#999;font-size:14px">' + confirmedCount + '/' + hbRaces.length + ' races confirmed — confirm all to proceed to Results</div>';
  }

  let raceContent = '';
  if (isRelayRace(hbSelectedRace.race_type)) {
    raceContent = renderRelayContent();
  } else {
    raceContent = renderIndividualContent();
  }

  const headerWithResults = '<div class="toolbar" style="margin-bottom:16px"><h1 style="margin:0">Heat Builder</h1><div class="toolbar-spacer"></div><button class="btn btn-primary" onclick="navigate(\'results\')">🏆 Results →</button></div>';
  
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
    table = '<div class="card"><p>Tap "Generate Heats" to create randomised heat assignments.</p></div>';
  }

  return buttons + '<div style="overflow-x:auto;margin-bottom:16px">' + table + '</div>';
}

function renderHeatTable(heats) {
  if (!heats || heats.length === 0) return '<div class="card"><p>No eligible swimmers (no PB times or nobody present).</p></div>';

  let html = '';
  for (const heat of heats) {
    const maxTime = heat.max_time || (Math.max(...heat.lanes.map(l => l.handicap_time)) + 200);
    let rows = '';
    for (let li = 0; li < 4; li++) {
      const lane = heat.lanes[li];
      if (lane) {
        rows += '<tr><td>' + lane.lane_number + '</td><td class="name-cell">' + lane.name + '</td><td>' + formatTime(lane.handicap_time) + '</td><td style="color:#999">' + formatTime(maxTime) + '</td><td style="font-weight:700;color:var(--accent)">+' + formatTime(lane.start_delay) + '</td></tr>';
      } else {
        rows += '<tr><td>' + (li + 1) + '</td><td class="name-cell" style="color:#999;font-style:italic">— empty —</td><td></td><td></td><td></td></tr>';
      }
    }
    
    html += `
      <div class="card" style="margin-bottom:24px;padding:0;overflow:hidden;border:4px solid #0b3d91">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;border-bottom:4px solid #0b3d91;display:flex;justify-content:space-between;align-items:center">
          <span>Heat ${heat.heat_number}</span>
          <span style="font-weight:400;font-size:13px;opacity:0.8">Max: ${formatTime(maxTime)}</span>
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
    buttons += '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">' + statusMsg + '</strong></div>';
  }

  let content = '';
  if (hbRelayTeams && hbRelayTeams.length > 0) {
    content = renderRelayTeamsInHB(hbRelayTeams, race);
  } else {
    content = '<div class="card"><p>Tap "Generate Teams" to create balanced relay teams.</p></div>';
  }

  return buttons + '<div style="margin-bottom:16px">' + content + '</div>';
}

function renderRelayTeamsInHB(teams, race) {
  let html = '';
  const isMedley = race.race_type === 'medley_relay';
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
    const teamHeader = team.team_name + (placeDisplay ? ' — ' + placeDisplay : '');

    let rows = '';
    for (const m of members) {
      const pbCol = getPBForRelayHB(m, race.race_type);
      const pbDisplay = formatTime(pbCol);
      const strokeKey = isMedley ? (m.stroke || '').toLowerCase().substring(0, 4) : null;
      const rowStyle = isMedley ? ' style="background:' + (medleyColors[strokeKey] || '#fff') + '"' : '';
      
      rows += '<tr' + rowStyle + '><td>' + m.leg_order + '</td><td class="name-cell">' + m.name + '</td><td>' + (m.stroke || '—') + '</td><td class="time-cell">' + pbDisplay + '</td></tr>';
    }

    // BF-5: Swim Twice — always show "Add Leg" option before confirming
    let swimTwiceRow = '';
    if (!hbRelayConfirmed) {
      const nextLeg = members.length + 1;
      const memberOptions = members.map(function(m) { return '<option value="' + m.member_id + '">' + m.name + '</option>'; }).join('');
      swimTwiceRow = '<tr style="background:#fafafa; border-top: 2px dashed #ccc"><td>' + nextLeg + '</td><td colspan="3"><div style="display:flex;align-items:center;gap:8px;padding:4px 0"><select id="hb-swim-twice-' + ti + '" class="form-control" style="max-width:200px;min-height:44px"><option value="">— Select swimmer —</option>' + memberOptions + '</select><button class="btn btn-accent" style="min-height:44px;white-space:nowrap" onclick="hbAddSwimTwice(' + ti + ')">➕ Swim Twice</button></div></td></tr>';
    }

    let totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:18px">' + (team.total_time != null ? formatTime(team.total_time) : '—') + '</td>';

    const targetDisplay = team.target_time ? 'Target: ' + formatTime(team.target_time) : '';
    const startDisplay = 'Delay: ' + formatTime(team.start_delay || 0);
    const maxDisplay = team.max_time ? 'Max: ' + formatTime(team.max_time) : '';

    html += '<div class="card" style="margin-bottom:40px;padding:0;overflow:hidden;border:4px solid ' + teamColor + ' shadow: 0 4px 6px rgba(0,0,0,0.1)">' +
            '<div style="background:' + teamColor + ';color:white;padding:12px 16px;font-weight:800;font-size:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-bottom:1px solid rgba(0,0,0,0.1)">' +
            '<span style="flex-shrink:0">' + teamHeader + '</span>' +
            '<span style="font-weight:400;font-size:13px;color:rgba(255,255,255,0.9);white-space:nowrap;flex-shrink:0">' + startDisplay + (targetDisplay ? ' • ' + targetDisplay : '') + (maxDisplay ? ' • ' + maxDisplay : '') + '</span>' +
            '</div>' +
            '<table class="spreadsheet-table" style="margin:0">' +
            '<thead><tr><th style="width:50px">Leg</th><th style="text-align:left;min-width:140px">Swimmer</th><th>Stroke</th><th>PB</th></tr></thead>' +
            '<tbody>' + rows + swimTwiceRow + 
            '<tr style="background:#f5f5f5;font-weight:700;border-top:2px solid ' + teamColor + '"><td></td><td colspan="2">Team Total</td>' + totalTimeCell + '</tr>' +
            '</tbody></table></div>';
  }

  return html;
}

// BF-5: Add swimmer to swim a second leg (Heat Builder version)
function hbAddSwimTwice(teamIndex) {
  var select = document.getElementById('hb-swim-twice-' + teamIndex);
  if (!select || !select.value) { alert('Please select a swimmer first.'); return; }
  var memberId = parseInt(select.value);
  var team = hbRelayTeams[teamIndex];
  if (!team) return;
  var existing = team.members.find(function(m) { return m.member_id === memberId; });
  if (!existing) return;
  var nextLeg = team.members.length + 1;
  team.members.push({
    member_id: existing.member_id,
    name: existing.name,
    leg_order: nextLeg,
    stroke: existing.stroke || 'Free'
  });
  renderHeatBuilder();
}

function getPBForRelayHB(member, raceType) {
  switch (raceType) {
    case '25m_relay': return member.time_25m;
    case '25m_brace': return member.time_25m;
    case '50m_brace': return member.time_50m;
    case 'pogo': return member.time_25m;
    case 'medley_relay': {
      const stroke = (member.stroke || '').toLowerCase();
      if (stroke === 'back') return member.time_backstroke;
      if (stroke === 'breast') return member.time_breaststroke;
      if (stroke === 'free') return member.time_25m;
      return member.time_25m;
    }
    default: return null;
  }
}

function ordinalRelay(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

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
