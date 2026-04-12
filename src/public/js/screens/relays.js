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
      <button class="btn btn-outline" onclick="navigate('results')">← Back to Results</button>
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
      ${relayTeams && relayTeams.length > 0 ? (isBrace ? renderBraceTable(relayTeams, race) : renderRelayTable(relayTeams, race)) : '<div class="card"><p>Tap "Generate Teams" to create balanced relay teams.</p></div>'}
    </div>
  `;
}

// v2.4.0: formatTime() is now global from format.js (centiseconds)
// Removed local formatTime — use the global one

// v2.7.4: Brace Relay — compact lane-based layout (one row per pair)
function renderBraceTable(teams, race) {
  let rows = '';
  for (const team of teams) {
    const members = team.members || [];
    const names = members.map(m => m.name).join(' + ');
    const pbs = members.map(m => formatWhole(getRelayPB(m, race.race_type))).join(' + ');
    const targetDisplay = formatWhole(team.target_time);
    const startDisplay = formatWhole(team.start_delay || 0);
    const placeDisplay = team.place ? ordinal(team.place) : '—';
    const placeStyle = team.place ? 'color:#e53935;font-weight:700' : '';

    let totalCell;
    if (relayConfirmed && !relayEventFinalized) {
      totalCell = `<td class="time-input" onclick="enterRelayTeamTime(${team.id}, ${team.total_time || 0})" style="cursor:pointer;font-weight:700">${team.total_time != null ? formatTime(team.total_time) : '⏱️ Tap'}</td>`;
    } else {
      totalCell = `<td style="font-weight:700">${team.total_time != null ? formatTime(team.total_time) : '—'}</td>`;
    }

    const varDisplay = team.variance != null ? ((team.variance >= 0 ? '+' : '') + formatTime(team.variance)) : '—';
    const varStyle = team.variance != null && Math.abs(team.variance) < 300 ? 'color:var(--success);font-weight:700' : '';

    rows += `<tr>
      <td>${team.team_number}</td>
      <td class="name-cell">${names}</td>
      <td>${pbs}</td>
      <td>${targetDisplay}</td>
      <td>${startDisplay}</td>
      ${totalCell}
      <td style="${varStyle}">${varDisplay}</td>
      <td style="${placeStyle}">${placeDisplay}</td>
    </tr>`;
  }

  return `
    <div class="card" style="margin-bottom:16px;padding:0;overflow:hidden;border:4px solid #0b3d91">
      <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;display:flex;justify-content:space-between;align-items:center">
        <span>${RACE_LABELS[race.race_type] || race.race_type}</span>
        <span style="font-weight:400;font-size:13px;opacity:0.8">Start: 2s | fastest finish wins</span>
      </div>
      <table class="spreadsheet-table" style="margin:0">
        <thead>
          <tr>
            <th style="width:50px">Lane</th>
            <th style="text-align:left;min-width:200px">Pair</th>
            <th>PBs</th>
            <th>Target</th>
            <th>Start</th>
            <th style="min-width:80px">Finish</th>
            <th>Variance</th>
            <th>Place</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderRelayTable(teams, race) {
  const isBrace = ['25m_brace', '50m_brace'].includes(race.race_type);
  const isMedley = race.race_type === 'medley_relay';
  const is25mRelay = race.race_type === '25m_relay';
  const isPogo = race.race_type === 'pogo';
  const showSplits = false; // R4/R8: Split removed per Bryan v2.8.0
  const showPogoTimes = isPogo; // v2.7.3: Pogo shows 2 timekeeper columns + average
  const showStroke = isMedley || isBrace; // BF2.6-07: Hide Stroke column for 25m relay (always Freestyle)

  let html = '';
  const teamColors = ['#1565c0', '#c62828', '#2e7d32', '#e65100', '#6a1b9a'];
  const medleyOrder = ['back', 'breast', 'fly', 'free'];
  const medleyColors = {
    back: '#e3f2fd',
    breast: '#fce4ec',
    fly: '#fff3e0',
    free: '#e8f5e9'
  };

  const allRelayMembersMap = new Map();
  teams.forEach(t => {
    (t.members || []).forEach(m => {
      if (!allRelayMembersMap.has(m.member_id)) {
        allRelayMembersMap.set(m.member_id, m);
      }
    });
  });
  const allRelayMembers = Array.from(allRelayMembersMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  for (let ti = 0; ti < teams.length; ti++) {
    const team = teams[ti];
    const teamColor = teamColors[ti % teamColors.length];
    let members = team.members || [];
    if (isMedley) {
      members = members.slice().sort((a, b) => {
        const aStroke = normalizeMedleyStroke(a.stroke);
        const bStroke = normalizeMedleyStroke(b.stroke);
        return medleyOrder.indexOf(aStroke) - medleyOrder.indexOf(bStroke);
      });
    }
    const placeDisplay = team.place ? ordinalRelay(team.place) : '';
    // F31: Simple header — just "Team 1", "Team 2", etc. (per Bryan's Excel)
    // R-15: Relay place display must be red + bold
    const teamHeader = `${team.team_name}${placeDisplay ? ' — <span style="color:#e53935;font-weight:700;font-size:18px">' + placeDisplay + '</span>' : ''}`;
    const needsManual = team.needs_manual_entry;

    let rows = '';
    let lastStroke = null;
    for (const m of members) {
      const pbCol = getPBForRelay(m, race.race_type);
      const pbDisplay = formatWhole(pbCol);
      const strokeKey = isMedley ? normalizeMedleyStroke(m.stroke) : null;
      const rowColor = isMedley ? (medleyColors[strokeKey] || '#f5f5f5') : '';
      const isGroupStart = isMedley && strokeKey !== lastStroke;
      const rowStyle = isMedley
        ? ` style="background:${rowColor};${isGroupStart && lastStroke ? 'border-top:3px solid #0b3d91;' : ''}"`
        : '';
      lastStroke = isMedley ? strokeKey : lastStroke;
      const strokeLabel = isMedley ? (strokeKey ? strokeKey[0].toUpperCase() + strokeKey.slice(1) : '—') : (m.stroke || '—');
      // Show what the user chose: if auto-assigned (user picked Y), show "Back (Y)" etc.
      const isAuto = m.auto === true;
      const strokeDisplay = (isMedley && isAuto) ? strokeLabel + ' <span style="color:#e65100;font-weight:700;font-size:13px">(Y)</span>' : strokeLabel;

      // Split time cell
      let splitCell;
      if (relayConfirmed && showSplits && !relayEventFinalized) {
        splitCell = `<td class="time-input" onclick="enterRelaySplit(${team.id}, ${m.member_id}, ${m.split_time || 0})" style="cursor:pointer;font-weight:700">${m.split_time != null ? formatTime(m.split_time) : '⏱️ Tap'}</td>`;
      } else if (showSplits) {
        splitCell = `<td class="time-cell">${m.split_time != null ? formatTime(m.split_time) : '—'}</td>`;
      } else {
        splitCell = '';
      }

      // v2.7.3: Pogo — 2 timekeeper columns + average
      let pogoCells = '';
      if (showPogoTimes) {
        const t1 = m.split_time;
        const t2 = m.split_time_2;
        const avg = (t1 != null && t2 != null) ? Math.round((t1 + t2) / 2) : null;
        if (relayConfirmed && !relayEventFinalized) {
          pogoCells = `<td class="time-input" onclick="enterRelaySplit(${team.id}, ${m.member_id}, ${t1 || 0})" style="cursor:pointer;font-weight:700">${t1 != null ? formatTime(t1) : '⏱️ T1'}</td>` +
            `<td class="time-input" onclick="enterPogoSplit2(${team.id}, ${m.member_id}, ${t2 || 0})" style="cursor:pointer;font-weight:700">${t2 != null ? formatTime(t2) : '⏱️ T2'}</td>` +
            `<td class="time-cell" style="font-weight:700;background:#e8f5e9">${avg != null ? formatTime(avg) : '—'}</td>`;
        } else {
          pogoCells = `<td class="time-cell">${t1 != null ? formatTime(t1) : '—'}</td>` +
            `<td class="time-cell">${t2 != null ? formatTime(t2) : '—'}</td>` +
            `<td class="time-cell" style="font-weight:700;background:#e8f5e9">${avg != null ? formatTime(avg) : '—'}</td>`;
        }
      }

      rows += `<tr${rowStyle}>
        <td>${m.leg_order}</td>
        <td class="name-cell">${m.name}</td>
        ${showStroke ? `<td>${strokeDisplay}</td>` : ''}
        ${splitCell}
        ${pogoCells}
        <td class="time-cell">${pbDisplay}</td>
      </tr>`;
    }

    // Column count: Leg + Swimmer + (Stroke if shown) + (Split if showSplits) + (Pogo 3 cols) + PB
    const colCount = 2 + (showStroke ? 1 : 0) + (showSplits ? 1 : 0) + (showPogoTimes ? 3 : 0) + 1;

    // BF-5: "Swim Twice" — always available so Bryan can add extra legs
    let swimTwiceRow = '';
    if (!relayConfirmed) {
      const nextLeg = members.length + 1;
      const optionsSource = isMedley ? allRelayMembers : members;
      const memberOptions = optionsSource.map(m => `<option value="${m.member_id}">${m.name}</option>`).join('');
      swimTwiceRow = `<tr style="background:#fff3e0">
        <td>${nextLeg}</td>
        <td colspan="${colCount - 1}">
          <div style="display:flex;align-items:center;gap:8px">
            <select id="swim-twice-${team.team_number}" class="form-control" style="max-width:200px;min-height:44px">
              <option value="">— Select swimmer —</option>
              ${memberOptions}
            </select>
            <button class="btn btn-accent" style="min-height:44px;white-space:nowrap" onclick="addSwimTwice(${ti}, ${team.team_number})">➕ Swim Twice</button>
          </div>
        </td>
      </tr>`;
    }

    // Bryan: Team Total is always the primary input; splits are not required.
    let totalTimeCell;
    if (relayConfirmed && !relayEventFinalized) {
      totalTimeCell = `<td class="time-input" onclick="enterRelayTeamTime(${team.id}, ${team.total_time || 0})" style="cursor:pointer;font-weight:700;font-size:16px">${team.total_time != null ? formatTime(team.total_time) : '⏱️ Tap'}</td>`;
    } else {
      totalTimeCell = `<td class="time-cell" style="font-weight:700;font-size:16px">${team.total_time != null ? formatTime(team.total_time) : '—'}</td>`;
    }

    let varianceDisplay = '';
    if ((isBrace || isMedley) && team.variance != null) {
      const varStyle = Math.abs(team.variance) < 3 ? 'color:var(--success);font-weight:700' : '';
      varianceDisplay = `<span style="${varStyle}"> | Variance: ${team.variance >= 0 ? '+' : ''}${formatTime(team.variance)}</span>`;
    }

    let targetDisplay = team.target_time ? 'Target: ' + formatWhole(team.target_time) : '';
    let startDisplay = '⏱️ Start: ' + formatWhole(team.start_delay || 0) + ' s';

    html += `
      <div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;border-left:5px solid ${teamColor}">
        <div style="background:#e0f2f1;padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <span>${teamHeader}${needsManual ? ' ⚠️ Manual Entry' : ''}</span>
          <span><span style="background:#0b3d91;color:#fff;padding:4px 10px;border-radius:12px;font-weight:700;font-size:18px">${startDisplay}</span> <span style="font-weight:400;font-size:13px;color:#666">${targetDisplay ? '• ' + targetDisplay + ' ' : ''}${tooltip('Relay starting time is fixed at 2s. Enter only Team Total time; splits are not required.')}</span></span>
        </div>
        <table class="spreadsheet-table" style="margin:0">
          <thead>
            <tr>
              <th style="width:50px">Leg ${tooltip('Order in which swimmers race in the relay (1st, 2nd, 3rd, 4th).')}</th>
              <th style="text-align:left;min-width:140px">Swimmer</th>
              ${showStroke ? '<th>Stroke ' + tooltip('Swimming style for this leg. For standard relays all swim freestyle. For Medley each swimmer has a different stroke.') + '</th>' : ''}
              ${showSplits ? '<th style="min-width:80px">Split ' + tooltip('Individual split time — how long THIS swimmer took for their leg. Tap to enter.') + '</th>' : ''}
              ${showPogoTimes ? '<th style="min-width:70px">T1 ' + tooltip('Timekeeper 1 — first stopwatch reading.') + '</th><th style="min-width:70px">T2 ' + tooltip('Timekeeper 2 — second stopwatch reading.') + '</th><th style="min-width:70px;background:#e8f5e9">Avg ' + tooltip('Average of both timekeepers.') + '</th>' : ''}
              <th>PB ${tooltip('Personal Best time for the relevant distance.')}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            ${swimTwiceRow}
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

// getPBForRelay → use shared getRelayPB from format.js
function getPBForRelay(member, raceType) { return getRelayPB(member, raceType); }

function normalizeMedleyStroke(stroke) {
  const s = (stroke || '').toLowerCase();
  if (s.startsWith('back')) return 'back';
  if (s.startsWith('breast')) return 'breast';
  if (s.startsWith('fly') || s.startsWith('butter')) return 'fly';
  if (s.startsWith('free')) return 'free';
  return 'free';
}

// ordinalRelay → use shared ordinal from format.js
function ordinalRelay(n) { return ordinal(n); }

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

// BF-5: Add a swimmer to swim a second leg in uneven teams
function addSwimTwice(teamIndex, teamNumber) {
  const select = document.getElementById(`swim-twice-${teamNumber}`);
  if (!select || !select.value) { alert('Please select a swimmer first.'); return; }
  const memberId = parseInt(select.value);
  const team = relayTeams[teamIndex];
  if (!team) return;
  const existingMember = team.members.find(m => m.member_id === memberId);
  if (!existingMember) return;
  const nextLeg = team.members.length + 1;
  team.members.push({
    member_id: existingMember.member_id,
    name: existingMember.name,
    leg_order: nextLeg,
    stroke: existingMember.stroke || 'Free',
    pb: existingMember.pb,
    time_25m: existingMember.time_25m,
    time_50m: existingMember.time_50m,
    time_backstroke: existingMember.time_backstroke,
    time_breaststroke: existingMember.time_breaststroke,
    time_butterfly: existingMember.time_butterfly
  });
  team.needs_manual_entry = false;
  // v2.7.1: Recalculate target/start/max after adding swimmer
  recalcRelayTeam(team, relaySelectedRace.race_type, relayTeams);
  drawRelays();
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
  confirmDialog('Save & Build Heats?', 'This will lock the relay teams and build heats. You can then enter times.', async () => {
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
  // F8: Always start numpad fresh (empty) — same behavior as individual race time entry
  showNumpad('', async (value) => {
    if (value == null) return;
    const result = await API.enterRelayTeamTime(teamId, value);
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
    const result = await API.enterRelaySplit(teamId, memberId, value);
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

// v2.7.3: Pogo second timekeeper entry
function enterPogoSplit2(teamId, memberId, currentValue) {
  showNumpad(currentValue || '', async (value) => {
    if (value == null) return;
    const result = await API.enterRelaySplit2(teamId, memberId, value);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
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
