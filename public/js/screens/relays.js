/**
 * WWSC — Relays Screen (Excel-Style Spreadsheet)
 * Manage relay teams: generate, confirm, enter times, rank.
 * R10.1–R10.10
 */
let relayRaces = [];
let relaySelectedRace = null;
let relayEvent = null;
let relayTeams = null;
let relayConfirmed = false;
let relayRanked = false;
let relayEventFinalized = false;

// RELAY_RACE_TYPES defined in heat-builder.js (loaded before this file)

async function renderRelays() {
  relayEvent = await API.getCurrentEvent();
  relayEventFinalized = relayEvent && (relayEvent.status === 'finalized' || relayEvent.status === 'completed');
  const el = document.getElementById('content');

  if (!relayEvent) {
    el.innerHTML = `<h1>Relays</h1><div class="card"><p>No active event. <a href="#" onclick="navigate('event-setup')">Go to Times Sheet first.</a></p></div>`;
    return;
  }

  const allRaces = await API.getRaces(relayEvent.id);
  relayRaces = allRaces.filter(r => RELAY_RACE_TYPES.includes(r.race_type));

  if (relayRaces.length === 0) {
    el.innerHTML = `<h1>Relays</h1><div class="card"><p>No relay races configured. <a href="#" onclick="navigate('event-setup')">Go to Times Sheet.</a></p></div>`;
    return;
  }

  // F2: If navigated from sidebar relay link, pre-select that race
  if (window._pendingRelayType) {
    const pending = relayRaces.find(r => r.race_type === window._pendingRelayType);
    if (pending) {
      relaySelectedRace = pending;
      relayTeams = null;
      relayConfirmed = false;
      relayRanked = false;
    }
    window._pendingRelayType = null;
  }

  if (!relaySelectedRace || !relayRaces.find(r => r.id === relaySelectedRace.id)) {
    relaySelectedRace = relayRaces[0];
    relayTeams = null;
    relayConfirmed = false;
    relayRanked = false;
  }

  // Load saved teams if already confirmed
  if (relaySelectedRace.status === 'heats_generated' && !relayTeams) {
    const saved = await API.getRelayTeams(relaySelectedRace.id);
    if (saved && saved.length > 0) {
      relayTeams = saved;
      relayConfirmed = true;
      relayRanked = saved.some(t => t.place != null);
    }
  }

  drawRelays();
}

function drawRelays() {
  const el = document.getElementById('content');
  const race = relaySelectedRace;
  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;
  const isBrace = ['25m_brace', '50m_brace'].includes(race.race_type);
  const isMedley = race.race_type === 'medley_relay';
  const anyTimesEntered = relayTeams && relayTeams.some(t => t.total_time != null);
  const allTimesEntered = relayTeams && relayTeams.length > 0 && relayTeams.every(t => t.total_time != null);

  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Relays — ${raceLabel}</h1>
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" onclick="navigate('heat-builder')">← Heats</button>
      <button class="btn btn-outline" onclick="navigate('results')">← Results</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>

    <div class="toolbar">
      <select class="form-control" style="max-width:300px" onchange="selectRelayRace(this.value)">
        ${relayRaces.map(r => `<option value="${r.id}" ${r.id === race.id ? 'selected' : ''}>${RACE_LABELS[r.race_type] || r.race_type} ${r.status === 'heats_generated' ? '✓' : ''}</option>`).join('')}
      </select>
      ${!relayConfirmed ? `
        <button class="btn btn-primary" onclick="generateRelayTeams()">🔀 Generate Teams</button>
        ${relayTeams && relayTeams.length > 0 ? '<button class="btn btn-accent" onclick="generateRelayTeams()">🔄 Shuffle</button>' : ''}
        ${relayTeams && relayTeams.length > 0 ? '<button class="btn btn-success" onclick="confirmRelayTeams()">✓ Confirm Teams</button>' : ''}
      ` : `
        <button class="btn btn-accent" onclick="reshuffleRelayTeams()">🔄 Re-Shuffle Teams</button>
        ${!relayRanked ? `<button class="btn btn-primary" onclick="calculateRelayResults()" ${!anyTimesEntered ? 'disabled' : ''}>📊 Calculate Results</button>` : ''}
      `}
    </div>

    ${relayConfirmed ? '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">✓ Teams Confirmed</strong></div>' : ''}
    ${relayRanked ? (() => {
      const teamsWithTime = relayTeams ? relayTeams.filter(t => t.total_time != null).length : 0;
      const totalTeams = relayTeams ? relayTeams.length : 0;
      const missingNote = teamsWithTime < totalTeams ? ' (' + (totalTeams - teamsWithTime) + ' teams without times — not ranked)' : '';
      return '<div class="card" style="background:#e0f2f1;text-align:center;padding:12px"><strong style="color:var(--primary)">🏆 Results Calculated — ' + teamsWithTime + '/' + totalTeams + ' teams ranked' + missingNote + '</strong></div>';
    })() : ''}

    <div style="overflow-x:auto;margin-bottom:16px">
      ${relayTeams && relayTeams.length > 0 ? renderRelayTable(relayTeams, race) : '<div class="card"><p>Tap "Generate Teams" to create balanced relay teams.</p></div>'}
    </div>
  `;
}

function formatTime(seconds) {
  if (seconds == null) return '—';
  return seconds + 's';
}

function renderRelayTable(teams, race) {
  const isBrace = ['25m_brace', '50m_brace'].includes(race.race_type);
  const isMedley = race.race_type === 'medley_relay';
  const showSplits = false; // Bryan: total times only, splits not required

  let html = '';

  for (const team of teams) {
    const members = team.members || [];
    const placeDisplay = team.place ? ordinalRelay(team.place) : '';
    // F31: Simple header — just "Team 1", "Team 2", etc. (per Bryan's Excel)
    const teamHeader = `${team.team_name}${placeDisplay ? ' — ' + placeDisplay : ''}`;
    const needsManual = team.needs_manual_entry;

    let rows = '';
    for (const m of members) {
      const pbCol = getPBForRelay(m, race.race_type);
      const pbDisplay = pbCol != null ? pbCol + 's' : '—';

      // Split time cell
      let splitCell;
      if (relayConfirmed && showSplits && !relayEventFinalized) {
        splitCell = `<td class="time-input" onclick="enterRelaySplit(${team.id}, ${m.member_id}, ${m.split_time || 0})" style="cursor:pointer;font-weight:700">${m.split_time != null ? m.split_time + 's' : '⏱️ Tap'}</td>`;
      } else if (showSplits) {
        splitCell = `<td class="time-cell">—</td>`;
      } else {
        splitCell = '';
      }

      rows += `<tr>
        <td>${m.leg_order}</td>
        <td class="name-cell">${m.name}</td>
        <td>${m.stroke || '—'}</td>
        ${splitCell}
        <td class="time-cell">${pbDisplay}</td>
      </tr>`;
    }

    // Bryan: Team Total is always the primary input; splits are not required.
    let totalTimeCell;
    if (relayConfirmed && !relayEventFinalized) {
      totalTimeCell = `<td class="time-input" onclick="enterRelayTeamTime(${team.id}, ${team.total_time || 0})" style="cursor:pointer;font-weight:700;font-size:16px">${team.total_time != null ? team.total_time + 's' : '⏱️ Tap'}</td>`;
    } else {
      totalTimeCell = `<td class="time-cell" style="font-weight:700;font-size:16px">${team.total_time != null ? team.total_time + 's' : '—'}</td>`;
    }

    let varianceDisplay = '';
    if ((isBrace || isMedley) && team.variance != null) {
      const varStyle = Math.abs(team.variance) < 3 ? 'color:var(--success);font-weight:700' : '';
      varianceDisplay = `<span style="${varStyle}"> | Variance: ${team.variance >= 0 ? '+' : ''}${team.variance}s</span>`;
    }

    let targetDisplay = team.target_time ? 'Target: ' + team.target_time + 's' : '';
    let startDisplay = 'Start: 2s';

    // Column count: Leg + Swimmer + Stroke + (Split if showSplits) + PB = 4 or 5
    const colCount = showSplits ? 5 : 4;

    html += `
      <div class="card" style="margin-bottom:12px;padding:0;overflow:hidden">
        <div style="background:#e0f2f1;padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <span>${teamHeader}${needsManual ? ' ⚠️ Manual Entry' : ''}</span>
          <span style="font-weight:400;font-size:13px;color:#666">${startDisplay} ${targetDisplay ? '• ' + targetDisplay + ' ' : ''}${tooltip('Relay starting time is fixed at 2s. Enter only Team Total time; splits are not required.')}</span>
        </div>
        <table class="spreadsheet-table" style="margin:0">
          <thead>
            <tr>
              <th style="width:50px">Leg ${tooltip('Order in which swimmers race in the relay (1st, 2nd, 3rd, 4th).')}</th>
              <th style="text-align:left;min-width:140px">Swimmer</th>
              <th>Stroke ${tooltip('Swimming style for this leg. For standard relays all swim freestyle. For Medley each swimmer has a different stroke.')}</th>
              ${showSplits ? '<th style="min-width:80px">Split ' + tooltip('Individual split time — how long THIS swimmer took for their leg. Tap to enter.') + '</th>' : ''}
              <th>PB ${tooltip('Personal Best time for the relevant distance.')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background:#f5f5f5;font-weight:700">
              <td></td>
              <td colspan="${colCount - 2}">Team Total${varianceDisplay}</td>
              ${totalTimeCell}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  return html;
}

function getPBForRelay(member, raceType) {
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

// ── Actions ─────────────────────────────────────────

async function selectRelayRace(raceId) {
  relaySelectedRace = relayRaces.find(r => r.id === parseInt(raceId));
  relayTeams = null;
  relayConfirmed = false;
  relayRanked = false;
  if (relaySelectedRace.status === 'heats_generated') {
    const saved = await API.getRelayTeams(relaySelectedRace.id);
    if (saved && saved.length > 0) {
      relayTeams = saved;
      relayConfirmed = true;
      relayRanked = saved.some(t => t.place != null);
    }
  }
  drawRelays();
}

async function reshuffleRelayTeams() {
  confirmDialog('Re-Shuffle Teams?', 'This will discard current teams and any entered times. Are you sure?', async () => {
    relayConfirmed = false;
    relayRanked = false;
    relayTeams = null;
    await generateRelayTeams();
  });
}

async function generateRelayTeams() {
  const result = await API.generateRelayTeams(relaySelectedRace.id);
  if (result.error) {
    alert('Error: ' + result.error);
    return;
  }
  if (result.warning) alert(result.warning);
  relayTeams = result.teams;
  relayConfirmed = false;
  relayRanked = false;
  drawRelays();
}

async function confirmRelayTeams() {
  if (!relayTeams || relayTeams.length === 0) return;
  confirmDialog('Confirm Teams?', 'This will save the relay teams. You can then enter times.', async () => {
    const result = await API.saveRelayTeams(relaySelectedRace.id, relayTeams);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    // Reload saved teams (to get DB IDs)
    const saved = await API.getRelayTeams(relaySelectedRace.id);
    relayTeams = saved;
    relayConfirmed = true;
    relaySelectedRace.status = 'heats_generated';
    drawRelays();
  });
}

function enterRelayTeamTime(teamId, currentValue) {
  showNumpad(currentValue || '', async (value) => {
    if (value == null) return;
    const result = await API.enterRelayTeamTime(teamId, parseInt(value));
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    // Refresh
    const saved = await API.getRelayTeams(relaySelectedRace.id);
    relayTeams = saved;
    drawRelays();
  });
}

function enterRelaySplit(teamId, memberId, currentValue) {
  showNumpad(currentValue || '', async (value) => {
    if (value == null) return;
    const result = await API.enterRelaySplit(teamId, memberId, parseInt(value));
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    // Refresh
    const saved = await API.getRelayTeams(relaySelectedRace.id);
    relayTeams = saved;
    drawRelays();
  });
}

async function calculateRelayResults() {
  confirmDialog('Calculate Relay Results?', 'This will rank teams based on Team Total times.', async () => {
    const result = await API.rankRelay(relaySelectedRace.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    // Refresh
    const saved = await API.getRelayTeams(relaySelectedRace.id);
    relayTeams = saved;
    relayRanked = true;
    drawRelays();
  });
}
