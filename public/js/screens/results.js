/**
 * WWSC — Results Screen (v2.4.0: centiseconds, break column, manual place, slow swimmers)
 * Enter times, calculate results, finalize, breakers.
 */
let resRaces = [];
let resSelectedRace = null;
let resEvent = null;
let resFinalized = false;
let resCompleted = false;
let resHasRelays = false;

async function renderResults() {
  resEvent = await API.getCurrentEvent();
  const el = document.getElementById('content');

  if (!resEvent) {
    el.innerHTML = `<h1>Results</h1><div class="card"><p>No active event. <a href="#" onclick="navigate('event-setup')">Go to Times Sheet first.</a></p></div>`;
    return;
  }

  resFinalized = (resEvent.status === 'finalized' || resEvent.status === 'completed');
  resCompleted = (resEvent.status === 'completed');

  const allRaces = await API.getResults(resEvent.id);
  const INDIVIDUAL_TYPES = ['25m','50m','75m','backstroke','breaststroke','butterfly'];
  const RELAY_TYPES = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];
  resRaces = allRaces.filter(r => INDIVIDUAL_TYPES.includes(r.race_type) || RELAY_TYPES.includes(r.race_type));
  resHasRelays = allRaces.some(r => RELAY_TYPES.includes(r.race_type));
  
  for (const r of resRaces) {
    if (RELAY_TYPES.includes(r.race_type) && r.status === 'heats_generated') {
      try {
        r.relay_teams = await API.getRelayTeams(r.id);
      } catch(e) { r.relay_teams = []; }
    }
  }

  if (resRaces.length === 0) {
    el.innerHTML = `<h1>Results</h1><div class="card"><p>No races with heats yet. <a href="#" onclick="navigate('heat-builder')">Build heats first.</a></p></div>`;
    return;
  }

  if (window._pendingRaceType) {
    const pending = resRaces.find(r => r.race_type === window._pendingRaceType);
    if (pending) resSelectedRace = pending;
    window._pendingRaceType = null;
  }

  if (!resSelectedRace || !resRaces.find(r => r.id === resSelectedRace.id)) {
    resSelectedRace = resRaces[0];
  } else {
    resSelectedRace = resRaces.find(r => r.id === resSelectedRace.id);
  }

  drawResults();
}

function drawResults() {
  const el = document.getElementById('content');
  const race = resSelectedRace;
  if (isResRaceRelay(race)) {
    if (!race || !race.relay_teams || race.relay_teams.length === 0) {
      el.innerHTML = `<h1>Results</h1><div class="card"><p>No relay teams generated for this race. <a href="#" onclick="navigate('heat-builder')">Generate teams first.</a></p></div>`;
      return;
    }
  } else if (!race || !race.heats || race.heats.length === 0) {
    el.innerHTML = `<h1>Results</h1><div class="card"><p>No heats generated for this race. <a href="#" onclick="navigate('heat-builder')">Generate heats first.</a></p></div>`;
    return;
  }

  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;
  const isRelay = isResRaceRelay(race);
  const allTimesEntered = isRelay
    ? (race.relay_teams || []).every(t => t.total_time != null)
    : (race.heats || []).every(h => h.lanes.every(l => l.finish_time != null));
  const anyTimesEntered = isRelay
    ? (race.relay_teams || []).some(t => t.total_time != null)
    : (race.heats || []).some(h => h.lanes.some(l => l.finish_time != null));

  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Results — ${raceLabel}</h1>
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>

    <div class="toolbar">
      <select class="form-control" style="max-width:300px" onchange="selectResRace(this.value)">
        ${(() => {
          const RELAY_TYPES = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];
          const SPECIAL_TYPES = ['75m','backstroke','breaststroke','butterfly','medley_relay'];
          const standard = resRaces.filter(r => !SPECIAL_TYPES.includes(r.race_type));
          const special = resRaces.filter(r => SPECIAL_TYPES.includes(r.race_type));
          
          function hasActualResults(r) {
            const isRelay = RELAY_TYPES.includes(r.race_type);
            if (isRelay) return r.relay_teams && r.relay_teams.some(t => t.total_time != null);
            return r.heats && r.heats.some(h => h.lanes && h.lanes.some(l => l.finish_time != null));
          }
          
          let opts = '';
          if (standard.length > 0) {
            opts += '<optgroup label="── Standard ──">';
            opts += standard.map(r => `<option value="${r.id}" ${r.id === race.id ? 'selected' : ''}>${RACE_LABELS[r.race_type] || r.race_type} ${hasActualResults(r) ? '✓' : ''}</option>`).join('');
            opts += '</optgroup>';
          }
          if (special.length > 0) {
            opts += '<optgroup label="── Special ──">';
            opts += special.map(r => `<option value="${r.id}" ${r.id === race.id ? 'selected' : ''}>${RACE_LABELS[r.race_type] || r.race_type} ${hasActualResults(r) ? '✓' : ''}</option>`).join('');
            opts += '</optgroup>';
          }
          return opts;
        })()}
      </select>
      ${!resFinalized ? `
        <button class="btn btn-primary" onclick="calculateResults()" ${!anyTimesEntered ? 'disabled' : ''}>💾 Save Rankings</button>
        <button class="btn btn-success" onclick="doFinalizeEvent(${allTimesEntered ? 'true' : 'false'})">✅ Finalize Event</button>
      ` : `
        <button class="btn btn-outline" onclick="doUnlockEvent()" style="color:var(--danger);border-color:var(--danger)">🔓 Unlock for Edits</button>
      `}
      ${resFinalized && !resCompleted ? `
        <button class="btn btn-accent" id="btn-complete-archive" onclick="doCompleteEvent()">✅ Complete Event</button>
      ` : ''}
      ${resCompleted ? `
        <button class="btn btn-accent" disabled style="opacity:0.5;cursor:not-allowed">✅ Completed ✓</button>
      ` : ''}
    </div>

    ${resFinalized ? '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">✓ Event Finalized — breakers recorded. PBs not auto-updated — update manually via Members → select swimmer → edit time.</strong></div>' : ''}
    ${resCompleted ? '<div class="card" style="background:#e0e0e0;text-align:center;padding:12px"><strong>✅ Event Completed</strong></div>' : ''}

    <div style="overflow-x:auto;margin-bottom:16px">
      ${isResRaceRelay(race) ? renderRelayResultsInline(race) : renderResultsTable(race)}
    </div>

    ${!isRelay ? renderBreakersSection(race) : ''}
    <div id="slow-swimmers-section"></div>
  `;

  // Load slow swimmers async
  if (resFinalized || anyTimesEntered) {
    loadSlowSwimmers();
  }
}

function renderBreakersSection(race) {
  // Collect breakers from current race
  const breakers = [];
  for (const heat of (race.heats || [])) {
    for (const lane of heat.lanes) {
      if (lane.finish_time != null && lane.variance != null && lane.variance <= -100 && lane.net_time > 0) {
        breakers.push({
          name: lane.name || 'Unknown',
          heat: heat.heat_number,
          pb: lane.handicap_time,
          newTime: lane.net_time,
          improvement: lane.handicap_time - lane.net_time
        });
      }
    }
  }

  if (breakers.length === 0) return '';

  breakers.sort((a, b) => b.improvement - a.improvement);

  let rows = breakers.map((b, i) => {
    const medal = i === 0 ? '🏆 ' : '';
    return `<tr style="background:${i % 2 === 0 ? '#e8f5e9' : '#f1f8e9'}">
      <td style="padding:8px 12px;font-weight:${i === 0 ? '700' : '400'}">${medal}${b.name}</td>
      <td style="padding:8px 12px;text-align:center">Heat ${b.heat}</td>
      <td style="padding:8px 12px;text-align:center">${formatTime(b.pb)}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700">${formatTime(b.newTime)}</td>
      <td style="padding:8px 12px;text-align:center;color:#2e7d32;font-weight:700">-${formatTime(b.improvement)}</td>
    </tr>`;
  }).join('');

  return `<div class="card" style="background:#e8f5e9;border-left:6px solid #2e7d32;margin-bottom:16px">
    <strong style="font-size:1.1em">🏅 Breakers Report — ${breakers.length} PB${breakers.length !== 1 ? 's' : ''} Broken!</strong>
    <table style="width:100%;border-collapse:collapse;margin-top:10px">
      <thead>
        <tr style="background:#2e7d32;color:#fff">
          <th style="padding:8px 12px;text-align:left">Swimmer</th>
          <th style="padding:8px 12px;text-align:center">Heat</th>
          <th style="padding:8px 12px;text-align:center">Old PB</th>
          <th style="padding:8px 12px;text-align:center">New Time</th>
          <th style="padding:8px 12px;text-align:center">Improved By</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function renderResultsTable(race) {
  let html = '';

  for (const heat of race.heats) {
    const maxTime = heat.max_time || 0;
    // Rank by finish_time within heat for live places
    const rankedLanes = heat.lanes
      .filter(l => l.finish_time != null)
      .slice()
      .sort((a, b) => a.finish_time - b.finish_time);
    const livePlaces = {};
    rankedLanes.forEach((lane, idx) => {
      livePlaces[lane.id] = idx + 1;
    });

    let rows = '';
    for (let li = 0; li < heat.lanes.length; li++) {
      const lane = heat.lanes[li];
      const hasTime = lane.finish_time != null;
      const isBreak = hasTime && lane.variance != null && lane.variance <= -100;
      const autoPlace = livePlaces[lane.id] || lane.place || null;
      const displayPlace = lane.manual_place || autoPlace;

      let finishCell;
      if (resFinalized) {
        finishCell = `<td class="time-cell" style="font-weight:700">${hasTime ? formatTime(lane.finish_time) : '—'}</td>`;
      } else {
        finishCell = `<td class="time-input" onclick="enterFinishTime(${heat.id}, ${lane.id}, ${lane.finish_time || 0})" style="cursor:pointer;font-weight:700">${hasTime ? formatTime(lane.finish_time) : '⏱️ Tap'}</td>`;
      }

      // Manual place dropdown
      let placeCell;
      if (resFinalized) {
        placeCell = `<td style="font-weight:700;color:var(--primary)">${displayPlace ? ordinal(displayPlace) : '—'}</td>`;
      } else {
        placeCell = `<td>
          <select class="place-select" style="min-height:44px;padding:4px 8px;font-size:14px" onchange="setManualPlace(${lane.id}, this.value)" onclick="event.stopPropagation()">
            <option value="" ${!lane.manual_place ? 'selected' : ''}>— ${autoPlace ? '('+ordinal(autoPlace)+')' : ''}</option>
            <option value="1" ${lane.manual_place === 1 ? 'selected' : ''}>1st</option>
            <option value="2" ${lane.manual_place === 2 ? 'selected' : ''}>2nd</option>
            <option value="3" ${lane.manual_place === 3 ? 'selected' : ''}>3rd</option>
            <option value="4" ${lane.manual_place === 4 ? 'selected' : ''}>4th</option>
          </select>
        </td>`;
      }

      // Break column
      const breakCell = hasTime ? (isBreak ? '<td class="break-text">BREAK</td>' : '<td style="color:#999">—</td>') : '<td>—</td>';

      const rowClass = isBreak ? 'break-row-highlight' : '';

      rows += `<tr class="${rowClass}">
        <td>${lane.lane_number}</td>
        <td class="name-cell" style="font-size:18px">${lane.name}</td>
        <td class="time-cell">${formatTime(lane.handicap_time)}</td>
        <td class="time-cell">${formatTime(lane.start_delay)}</td>
        ${finishCell}
        <td class="time-cell">${hasTime ? formatTime(lane.net_time) : '—'}</td>
        <td class="time-cell" style="${hasTime && lane.variance < 0 ? 'color:var(--success);font-weight:700' : ''}">${hasTime ? (lane.variance >= 0 ? '+' : '') + formatTime(lane.variance) : '—'}</td>
        ${breakCell}
        ${placeCell}
      </tr>`;
    }

    html += `
      <div class="card" style="margin-bottom:24px;padding:0;overflow:hidden;border:4px solid #0b3d91">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;border-bottom:4px solid #0b3d91;display:flex;justify-content:space-between;align-items:center">
          <span>Heat ${heat.heat_number}</span>
          <span style="font-weight:400;font-size:13px;opacity:0.8">Expected finish: ${formatTime(maxTime)}</span>
        </div>
        <div style="overflow-x:auto">
          <table class="spreadsheet-table">
            <thead>
              <tr>
                <th style="width:50px">Lane</th>
                <th style="text-align:left;min-width:140px">Swimmer</th>
                <th>PB</th>
                <th>Delay</th>
                <th style="min-width:80px">Finish</th>
                <th>Net</th>
                <th>Variance</th>
                <th>Break</th>
                <th>Place</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  return html;
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

// ── Slow Swimmers Section ──────────────────────────

async function loadSlowSwimmers() {
  if (!resEvent) return;
  try {
    const slow = await API.getSlowSwimmers(resEvent.id);
    const section = document.getElementById('slow-swimmers-section');
    if (!section) return;
    if (!slow || slow.length === 0) {
      section.innerHTML = '';
      return;
    }

    const rows = slow.map(s => `
      <tr>
        <td class="name-cell">${s.name}</td>
        <td>${s.race_type}</td>
        <td class="time-cell">${formatTime(s.pb)}</td>
        <td class="time-cell">${formatTime(s.net_time)}</td>
        <td class="time-cell" style="font-weight:700;color:#e65100">+${formatTime(s.variance)}</td>
      </tr>
    `).join('');

    section.innerHTML = `
      <div class="card slow-swimmers-card" style="margin-top:16px">
        <strong style="font-size:1.1em">⚠️ Swimmers Exceeding PB by >2 seconds</strong>
        <p style="margin:8px 0;font-size:13px;color:var(--text-secondary)">These swimmers may need their PB times adjusted up. Times are NOT auto-adjusted.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:8px">
          <thead>
            <tr style="background:#e65100;color:#fff">
              <th style="padding:8px 12px;text-align:left">Swimmer</th>
              <th style="padding:8px 12px;text-align:center">Stroke</th>
              <th style="padding:8px 12px;text-align:center">PB</th>
              <th style="padding:8px 12px;text-align:center">Actual</th>
              <th style="padding:8px 12px;text-align:center">Over by</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:8px;font-size:12px;color:#999">ℹ️ To update a PB: Members → select swimmer → edit time.</p>
      </div>
    `;
  } catch (e) {
    console.error('Failed to load slow swimmers:', e);
  }
}

// ── Actions ─────────────────────────────────────────

function selectResRace(raceId) {
  resSelectedRace = resRaces.find(r => r.id === parseInt(raceId));
  drawResults();
}

function enterFinishTime(heatId, laneId, currentValue) {
  showNumpad('', async (value) => {
    if (value == null) return;
    const result = await API.enterTime(heatId, laneId, value);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    renderResults();
  });
}

async function setManualPlace(laneId, place) {
  const manualPlace = place ? parseInt(place) : null;
  const result = await API.setManualPlace(laneId, manualPlace);
  if (result.error) {
    alert('Error: ' + result.error);
    return;
  }
  renderResults();
}

async function calculateResults() {
  confirmDialog('Save Rankings?', 'This will persist the current ranking (places 1st–4th) to the database.', async () => {
    const result = await API.rankRace(resSelectedRace.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    renderResults();
  });
}

async function doFinalizeEvent(allComplete) {
  const RELAY_TYPES_F = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];
  let totalMissing = 0;
  let reportLines = [];

  for (const race of resRaces) {
    const label = RACE_LABELS[race.race_type] || race.race_type;
    const isRelay = RELAY_TYPES_F.includes(race.race_type);

    if (isRelay) {
      const teams = race.relay_teams || [];
      const totalTeams = teams.length;
      const teamsWithTime = teams.filter(t => t.total_time != null).length;
      const missing = totalTeams - teamsWithTime;
      if (totalTeams === 0) {
        reportLines.push('• ' + label + ': no teams generated');
        totalMissing++;
      } else if (missing > 0) {
        reportLines.push('• ' + label + ': ' + missing + '/' + totalTeams + ' teams missing times');
        totalMissing += missing;
      } else {
        reportLines.push('• ' + label + ': ' + totalTeams + '/' + totalTeams + ' teams ✓');
      }
    } else {
      if (!race.heats) { reportLines.push('• ' + label + ': no heats'); totalMissing++; continue; }
      let total = 0, entered = 0;
      for (const heat of race.heats) {
        for (const lane of heat.lanes) {
          total++;
          if (lane.finish_time != null) entered++;
        }
      }
      const missing = total - entered;
      if (missing > 0) {
        reportLines.push('• ' + label + ': ' + missing + '/' + total + ' swimmers missing');
        totalMissing += missing;
      } else {
        reportLines.push('• ' + label + ': ' + total + '/' + total + ' results ✓');
      }
    }
  }

  const reportText = reportLines.join('\n');
  const warningText = totalMissing > 0
    ? '⚠️ Missing results:\n\n' + reportText + '\n\nMissing entries will be skipped.\n\n💡 PBs are NOT auto-updated.'
    : 'All results entered:\n\n' + reportText + '\n\n💡 PBs are NOT auto-updated.';

  confirmDialog('Finalize Event?', warningText, async () => {
    const result = await API.finalizeEvent(resEvent.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    let finalReport = 'Event finalized!\n\n';
    for (const race of resRaces) {
      const label = RACE_LABELS[race.race_type] || race.race_type;
      const isRelay = RELAY_TYPES_F.includes(race.race_type);
      if (isRelay) {
        const teams = race.relay_teams || [];
        const teamsWithTime = teams.filter(t => t.total_time != null).length;
        finalReport += '• ' + label + ': ' + teamsWithTime + '/' + teams.length + ' teams';
        if (teamsWithTime === 0) finalReport += ' ❌ (skipped)';
        else finalReport += ' ✓';
        finalReport += '\n';
      } else {
        if (!race.heats) { finalReport += '• ' + label + ': no heats ❌\n'; continue; }
        let total = 0, entered = 0, breakers = 0;
        for (const heat of race.heats) {
          for (const lane of heat.lanes) {
            total++;
            if (lane.finish_time != null) entered++;
            if (lane.variance != null && lane.variance <= -100 && lane.net_time > 0) breakers++;
          }
        }
        finalReport += '• ' + label + ': ' + entered + '/' + total + ' results';
        if (entered === 0) finalReport += ' ❌ (skipped)';
        else finalReport += ' ✓';
        if (breakers > 0) finalReport += ', ' + breakers + ' breaker' + (breakers !== 1 ? 's' : '');
        finalReport += '\n';
      }
    }
    finalReport += '\n💡 PBs were not auto-updated. To update: Members → select swimmer → edit time.';
    alert(finalReport);
    renderResults();
  });
}

async function doUnlockEvent() {
  if (!confirm('Unlock event? This allows you to change races and enter times again.')) return;
  await fetch(`/api/events/${resEvent.id}/unlock`, { method: 'PUT' });
  renderResults();
}

async function doCompleteEvent() {
  confirmDialog('Complete Event?',
    'This will mark the event as completed. You can still view results in the Season Calendar.',
    async () => {
      const result = await API.completeEvent(resEvent.id);
      if (result.error) {
        alert('Error: ' + result.error);
        return;
      }
      renderResults();
    }
  );
}

async function loadBreakers() {
  const breakers = await API.getBreakers(resEvent.id);
  const section = document.getElementById('breakers-section');
  if (!section) return;

  if (!breakers || breakers.length === 0) {
    section.innerHTML = '<div class="card"><p>No record breakers this event.</p></div>';
    return;
  }

  const rows = breakers.map(b => `
    <tr class="break-row-highlight">
      <td class="name-cell">${b.member_name}</td>
      <td>${b.stroke}</td>
      <td class="time-cell">${formatTime(b.old_pb)}</td>
      <td class="time-cell" style="font-weight:700;color:var(--success)">${formatTime(b.new_time)}</td>
      <td style="font-weight:700;color:var(--success)">-${formatTime(b.improvement)}</td>
    </tr>
  `).join('');

  section.innerHTML = `
    <h2>🏆 Record Breakers</h2>
    <table class="spreadsheet-table">
      <thead>
        <tr>
          <th style="text-align:left">Swimmer</th>
          <th>Stroke</th>
          <th>Old PB</th>
          <th>New PB</th>
          <th>Improvement</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ── Inline Relay Results ─────────────────────────────

const RES_RELAY_TYPES = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];

function isResRaceRelay(race) {
  return RES_RELAY_TYPES.includes(race.race_type);
}

function renderRelayResultsInline(race) {
  const teams = race.relay_teams || [];
  if (teams.length === 0) {
    return '<div class="card"><p>No relay teams generated yet. <a href="#" onclick="navigate(\'heat-builder\')">Build teams in Heat Builder first.</a></p></div>';
  }

  const anyTimes = teams.some(t => t.total_time != null);
  const ranked = teams.some(t => t.place != null);

  let actionsHtml = '';
  if (!resFinalized) {
    actionsHtml = '<div class="toolbar" style="margin-bottom:12px">';
    if (!ranked) {
      actionsHtml += '<button class="btn btn-primary" onclick="calculateRelayResultsInline()" ' + (anyTimes ? '' : 'disabled') + '>📊 Calculate Results</button>';
    } else {
      actionsHtml += '<span style="color:var(--success);font-weight:700">🏆 Results Calculated</span>';
    }
    actionsHtml += '</div>';
  }

  let html = actionsHtml;
  for (const team of teams) {
    const members = team.members || [];
    const placeDisplay = team.place ? ordinal(team.place) : '';
    const teamHeader = team.team_name + (placeDisplay ? ' — ' + placeDisplay : '');

    let rows = '';
    for (const m of members) {
      const pbCol = getRelayPBForResults(m, race.race_type);
      const pbDisplay = formatTime(pbCol);
      rows += '<tr><td>' + m.leg_order + '</td><td class="name-cell">' + m.name + '</td><td>' + (m.stroke || '—') + '</td><td class="time-cell">' + pbDisplay + '</td></tr>';
    }

    let totalTimeCell;
    if (!resFinalized) {
      totalTimeCell = '<td class="time-input" onclick="enterRelayTimeInline(' + team.id + ', ' + (team.total_time || 0) + ')" style="cursor:pointer;font-weight:700;font-size:16px">' + (team.total_time != null ? formatTime(team.total_time) : '⏱️ Tap') + '</td>';
    } else {
      totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:16px">' + (team.total_time != null ? formatTime(team.total_time) : '—') + '</td>';
    }

    let varianceDisplay = '';
    if (team.variance != null) {
      const varStyle = Math.abs(team.variance) < 300 ? 'color:var(--success);font-weight:700' : '';
      varianceDisplay = '<span style="' + varStyle + '"> | Variance: ' + (team.variance >= 0 ? '+' : '') + formatTime(team.variance) + '</span>';
    }

    const targetDisplay = team.target_time ? 'Target: ' + formatTime(team.target_time) : '';
    const startDisplay = 'Delay: ' + formatTime(team.start_delay || 0);
    const maxDisplay = team.max_time ? 'Max: ' + formatTime(team.max_time) : '';

    html += '<div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;border:4px solid #0b3d91"><div style="background:#e0f2f1;padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #0b3d91"><span>' + teamHeader + '</span><span style="font-weight:400;font-size:13px;color:#666">' + startDisplay + (targetDisplay ? ' • ' + targetDisplay : '') + (maxDisplay ? ' • ' + maxDisplay : '') + '</span></div><table class="spreadsheet-table" style="margin:0"><thead><tr><th style="width:50px">Leg</th><th style="text-align:left;min-width:140px">Swimmer</th><th>Stroke</th><th>PB</th></tr></thead><tbody>' + rows + '<tr style="background:#f5f5f5;font-weight:700"><td></td><td colspan="2">Team Total' + varianceDisplay + '</td>' + totalTimeCell + '</tr></tbody></table></div>';
  }

  return html;
}

function getRelayPBForResults(member, raceType) {
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

function enterRelayTimeInline(teamId, currentValue) {
  showNumpad('', async (value) => {
    if (value == null) return;
    const result = await API.enterRelayTeamTime(teamId, value);
    if (result.error) { alert('Error: ' + result.error); return; }
    renderResults();
  });
}

async function calculateRelayResultsInline() {
  confirmDialog('Calculate Relay Results?', 'This will rank teams based on Team Total times.', async () => {
    const result = await API.rankRelay(resSelectedRace.id);
    if (result.error) { alert('Error: ' + result.error); return; }
    renderResults();
  });
}
