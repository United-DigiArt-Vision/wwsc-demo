/**
 * WWSC — Heat Builder Screen (Individual Heats + Relay Teams)
 * F17: Unified screen for all races. F18: Progress tracker.
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

async function renderHeatBuilder() {
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

  // F17: Handle pending race type from sidebar click
  if (window._pendingHBRaceType) {
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
    // F21: Default to first INDIVIDUAL race, not relay (more intuitive when coming from Times Sheet)
    const individualRaces = hbRaces.filter(r => !isRelayRace(r.race_type));
    hbSelectedRace = individualRaces.length > 0 ? individualRaces[0] : hbRaces[0];
    hbPreviewHeats = null;
    hbConfirmed = false;
    hbRelayTeams = null;
    hbRelayConfirmed = false;
    hbRelayRanked = false;
  }

  // Load saved state for selected race
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

// F24: Special event types (stroke-based races chosen by user)
// Per Bryan's Excel: Standard = 25m + 50m + 25m Team Relay. Special = 75m, Backstroke, Breaststroke, Butterfly, Medley Relay
// Note: Medley Relay is BOTH a relay (team event) AND a special event (user-selected via I11 dropdown)
const SPECIAL_EVENT_TYPES = ['75m', 'backstroke', 'breaststroke', 'butterfly', 'medley_relay'];

function isSpecialEvent(raceType) {
  return SPECIAL_EVENT_TYPES.includes(raceType);
}

function drawHeatBuilder() {
  const el = document.getElementById('content');
  
  // F24: Group races logically: Standard (25m, 50m, 75m, relays) vs Special Event (backstroke etc.)
  const standardIndividual = hbRaces.filter(r => !isRelayRace(r.race_type) && !isSpecialEvent(r.race_type));
  const relayRaces = hbRaces.filter(r => isRelayRace(r.race_type));
  const specialEvents = hbRaces.filter(r => isSpecialEvent(r.race_type));
  
  const allConfirmed = hbRaces.every(r => r.status === 'heats_generated');
  const confirmedCount = hbRaces.filter(r => r.status === 'heats_generated').length;

  // F24: Progress tracker with logical grouping: STANDARD | SPECIAL EVENT
  let progressHtml = '<div class="progress-tracker">';
  
  // Standard section: Individual distances + Relays together (per Bryan's Excel: 25m, 50m, 25m Team Relay + optional Brace/Pogo)
  const standardRaces = [...standardIndividual, ...relayRaces];
  if (standardRaces.length > 0) {
    progressHtml += '<div class="progress-section"><span class="progress-label">Standard ' + tooltip('Per Bryan\'s Excel: 25m + 50m (always) + 25m Team Relay + optional relay type (Brace/Pogo).') + ':</span>';
    for (const r of standardRaces) {
      const done = r.status === 'heats_generated';
      const active = r.id === hbSelectedRace.id;
      progressHtml += '<button class="progress-item ' + (done ? 'done' : '') + (active ? ' active' : '') + '" onclick="selectHBRace(' + r.id + ')">' + (done ? '✅ ' : '⬜ ') + (RACE_LABELS[r.race_type] || r.race_type) + '</button>';
    }
    progressHtml += '</div>';
  }
  
  // Special Event section (if any) — per Bryan's Excel Cell I11
  if (specialEvents.length > 0) {
    progressHtml += '<div class="progress-section"><span class="progress-label">Special ' + tooltip('Per Bryan\'s Excel (I11): Optional race chosen each week — 75m, Backstroke, Breaststroke, Butterfly, or Medley Relay.') + ':</span>';
    for (const r of specialEvents) {
      const done = r.status === 'heats_generated';
      const active = r.id === hbSelectedRace.id;
      progressHtml += '<button class="progress-item ' + (done ? 'done' : '') + (active ? ' active' : '') + '" onclick="selectHBRace(' + r.id + ')">' + (done ? '✅ ' : '⬜ ') + (RACE_LABELS[r.race_type] || r.race_type) + '</button>';
    }
    progressHtml += '</div>';
  }
  progressHtml += '</div>';

  // F16: "Go to Results" only when ALL confirmed
  let goToResultsBtn = '';
  if (allConfirmed) {
    goToResultsBtn = '<div class="card" style="background:#e8f5e9;text-align:center;padding:16px;margin-top:12px"><strong style="color:var(--success)">All ' + hbRaces.length + ' races ready!</strong><br><button class="btn btn-accent btn-lg" onclick="navigate(\'results\')" style="margin-top:8px;font-size:18px;padding:14px 32px">Go to Results</button></div>';
  } else {
    goToResultsBtn = '<div style="text-align:center;margin-top:8px;color:#999;font-size:14px">' + confirmedCount + '/' + hbRaces.length + ' races confirmed — confirm all to proceed to Results</div>';
  }

  // Render the selected race content
  let raceContent = '';
  if (isRelayRace(hbSelectedRace.race_type)) {
    raceContent = renderRelayContent();
  } else {
    raceContent = renderIndividualContent();
  }

  // F30: Results button always visible in top-right corner (same size as other buttons)
  const headerWithResults = '<div class="toolbar" style="margin-bottom:16px"><h1 style="margin:0">Heat Builder</h1><div class="toolbar-spacer"></div><button class="btn btn-primary" onclick="navigate(\'results\')">' + tooltip('Go to Results screen to enter finish times and calculate winners.') + ' 🏆 Results →</button></div>';
  
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

  let rows = '';
  for (const heat of heats) {
    const maxTime = Math.max(...heat.lanes.map(l => l.handicap_time));
    for (let li = 0; li < 4; li++) {
      const lane = heat.lanes[li];
      const heatCell = li === 0
        ? '<td rowspan="4" style="font-weight:700;font-size:16px;vertical-align:middle;background:#e0f2f1">Heat ' + heat.heat_number + '</td>'
        : '';
      if (lane) {
        rows += '<tr>' + heatCell + '<td>' + lane.lane_number + '</td><td class="name-cell">' + lane.name + '</td><td>' + lane.handicap_time + 's</td><td>' + maxTime + 's</td><td style="font-weight:700;color:var(--accent)">+' + lane.start_delay + 's</td></tr>';
      } else {
        rows += '<tr>' + heatCell + '<td>' + (li + 1) + '</td><td class="name-cell" style="color:#999;font-style:italic">— empty —</td><td></td><td></td><td></td></tr>';
      }
    }
  }

  return '<table class="spreadsheet-table"><thead><tr><th>Heat</th><th style="width:50px">Lane</th><th style="text-align:left;min-width:150px">Swimmer</th><th>PB Time ' + tooltip('Personal Best — the fastest recorded time for this distance.') + '</th><th>Max Time ' + tooltip('The slowest PB in this heat. Used to calculate start delays.') + '</th><th>Start Delay ' + tooltip('Seconds to wait before starting. Faster swimmers get longer delays so everyone finishes together.') + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// ═══ Relay Race Content ═══

function renderRelayContent() {
  const race = hbSelectedRace;
  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;
  const showSplits = ['25m_relay', 'pogo'].includes(race.race_type);

  let buttons = '<div class="toolbar">';
  buttons += '<h2 style="margin:0">' + raceLabel + '</h2><div class="toolbar-spacer"></div>';

  if (!hbRelayConfirmed) {
    buttons += '<button class="btn btn-primary" onclick="generateHBRelayTeams()">' + tooltip('Creates balanced relay teams from present swimmers.') + ' Generate Teams</button>';
    if (hbRelayTeams && hbRelayTeams.length > 0) {
      buttons += ' <button class="btn btn-accent" onclick="generateHBRelayTeams()">' + tooltip('Re-randomize the team assignments.') + ' Shuffle</button>';
      buttons += ' <button class="btn btn-success" onclick="confirmHBRelayTeams()">' + tooltip('Lock these teams. You can then enter times.') + ' Confirm Teams</button>';
    }
  } else {
    buttons += '<button class="btn btn-accent" onclick="reshuffleHBRelayTeams()">' + tooltip('Discard current teams and re-randomize. Entered times will be lost.') + ' Re-Shuffle</button>';
    if (!hbRelayRanked) {
      const anyTimes = hbRelayTeams && hbRelayTeams.some(t => t.total_time != null);
      buttons += ' <button class="btn btn-primary" onclick="calculateHBRelayResults()" ' + (anyTimes ? '' : 'disabled') + '>' + tooltip('Rank teams based on their total times.') + ' Calculate Results</button>';
    }
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
  const showSplits = ['25m_relay', 'pogo'].includes(race.race_type);
  const isFinalized = hbRelayRanked; // Read-only after ranking
  let html = '';

  for (const team of teams) {
    const members = team.members || [];
    const placeDisplay = team.place ? ordinalRelay(team.place) : '';
    const teamHeader = 'Team ' + team.team_number + ': "' + team.team_name + '"' + (placeDisplay ? ' — ' + placeDisplay : '');

    let rows = '';
    for (const m of members) {
      const pbCol = getPBForRelayHB(m, race.race_type);
      const pbDisplay = pbCol != null ? pbCol + 's' : '—';

      let splitCell = '';
      if (showSplits) {
        if (hbRelayConfirmed && !isFinalized) {
          splitCell = '<td class="time-input" onclick="enterHBRelaySplit(' + team.id + ', ' + m.member_id + ', ' + (m.split_time || 0) + ')" style="cursor:pointer;font-weight:700">' + (m.split_time != null ? m.split_time + 's' : 'Tap') + '</td>';
        } else {
          splitCell = '<td class="time-cell">' + (m.split_time != null ? m.split_time + 's' : '—') + '</td>';
        }
      }

      rows += '<tr><td>' + m.leg_order + '</td><td class="name-cell">' + m.name + '</td><td>' + (m.stroke || '—') + '</td>' + splitCell + '<td class="time-cell">' + pbDisplay + '</td></tr>';
    }

    // F22: Team Total shows "—" not "Tap" (user doesn't tap the total row, they tap individual splits or use Calculate Results)
    let totalTimeCell;
    if (hbRelayConfirmed && !isFinalized) {
      // For relay types that need splits (25m_relay, pogo), total is calculated from splits, not tapped directly
      // For other relays, we may allow direct total entry if needed
      const needsSplits = ['25m_relay', 'pogo'].includes(race.race_type);
      if (needsSplits) {
        // Total is auto-calculated from splits, show "—" until calculated
        totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:16px">' + (team.total_time != null ? team.total_time + 's' : '—') + '</td>';
      } else {
        // Allow tapping to enter total directly
        totalTimeCell = '<td class="time-input" onclick="enterHBRelayTeamTime(' + team.id + ', ' + (team.total_time || 0) + ')" style="cursor:pointer;font-weight:700;font-size:16px">' + (team.total_time != null ? team.total_time + 's' : 'Tap') + '</td>';
      }
    } else {
      totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:16px">' + (team.total_time != null ? team.total_time + 's' : '—') + '</td>';
    }

    const colCount = showSplits ? 5 : 4;
    const targetDisplay = team.target_time ? 'Target: ' + team.target_time + 's' : '';

    // F23: Fixed target display with proper overflow handling (no cutoff)
    html += '<div class="card" style="margin-bottom:12px;padding:0;overflow:hidden"><div style="background:#e0f2f1;padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:12px"><span style="flex-shrink:0">' + teamHeader + '</span><span style="font-weight:400;font-size:13px;color:#666;white-space:nowrap;flex-shrink:0">' + targetDisplay + ' ' + tooltip('Target = sum of all team members PBs. Team Total = actual relay time.') + '</span></div><table class="spreadsheet-table" style="margin:0"><thead><tr><th style="width:50px">Leg ' + tooltip('Order in which swimmers race in the relay.') + '</th><th style="text-align:left;min-width:140px">Swimmer</th><th>Stroke ' + tooltip('Swimming style for this leg.') + '</th>' + (showSplits ? '<th style="min-width:80px">Split ' + tooltip('Individual split time for this leg. Tap to enter.') + '</th>' : '') + '<th>PB ' + tooltip('Personal Best time for the relevant distance.') + '</th></tr></thead><tbody>' + rows + '<tr style="background:#f5f5f5;font-weight:700"><td></td><td colspan="' + (colCount - 2) + '">Team Total</td>' + totalTimeCell + '</tr></tbody></table></div>';
  }

  return html;
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
  confirmDialog('Confirm Teams?', 'This will save the relay teams. You can then enter times.', async function() {
    const result = await API.saveRelayTeams(hbSelectedRace.id, hbRelayTeams);
    if (result.error) { alert('Error: ' + result.error); return; }
    const saved = await API.getRelayTeams(hbSelectedRace.id);
    hbRelayTeams = saved;
    hbRelayConfirmed = true;
    hbSelectedRace.status = 'heats_generated';
    drawHeatBuilder();
  });
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
  showNumpad(currentValue || '', async function(value) {
    if (value == null) return;
    await API.enterRelayTeamTime(teamId, parseInt(value));
    const saved = await API.getRelayTeams(hbSelectedRace.id);
    hbRelayTeams = saved;
    drawHeatBuilder();
  });
}

function enterHBRelaySplit(teamId, memberId, currentValue) {
  showNumpad(currentValue || '', async function(value) {
    if (value == null) return;
    await API.enterRelaySplit(teamId, memberId, parseInt(value));
    const saved = await API.getRelayTeams(hbSelectedRace.id);
    hbRelayTeams = saved;
    drawHeatBuilder();
  });
}

async function calculateHBRelayResults() {
  confirmDialog('Calculate Relay Results?', 'This will rank teams based on their times.', async function() {
    // F29: For split-based relays, auto-calculate total_time from splits before ranking
    const isSplitBased = ['25m_relay', 'pogo'].includes(hbSelectedRace.race_type);
    if (isSplitBased && hbRelayTeams) {
      for (const team of hbRelayTeams) {
        const members = team.members || [];
        const allSplitsEntered = members.every(m => m.split_time != null);
        if (allSplitsEntered) {
          const sumOfSplits = members.reduce((sum, m) => sum + (m.split_time || 0), 0);
          await API.enterRelayTeamTime(team.id, sumOfSplits);
        }
      }
    }
    
    await API.rankRelay(hbSelectedRace.id);
    const saved = await API.getRelayTeams(hbSelectedRace.id);
    hbRelayTeams = saved;
    hbRelayRanked = true;
    drawHeatBuilder();
  });
}
