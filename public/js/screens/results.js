/**
 * WWSC — Results Screen (Excel-Style Spreadsheet)
 * Enter times, calculate results, finalize, breakers.
 * R7.1–R7.12, R8.1–R8.4
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
  // F2-fix: Include ALL races (individual + relay) in one dropdown
  const INDIVIDUAL_TYPES = ['25m','50m','75m','backstroke','breaststroke','butterfly'];
  const RELAY_TYPES = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];
  resRaces = allRaces.filter(r => INDIVIDUAL_TYPES.includes(r.race_type) || RELAY_TYPES.includes(r.race_type));
  resHasRelays = allRaces.some(r => RELAY_TYPES.includes(r.race_type));
  
  // F5/F7: Pre-load relay teams for relay races so they render inline
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

  // F2: If navigated from sidebar race link, pre-select that race
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
  if (!race || !race.heats || race.heats.length === 0) {
    el.innerHTML = `<h1>Results</h1><div class="card"><p>No heats generated for this race. <a href="#" onclick="navigate('heat-builder')">Generate heats first.</a></p></div>`;
    return;
  }

  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;
  const allTimesEntered = race.heats.every(h => h.lanes.every(l => l.finish_time != null));
  const anyTimesEntered = race.heats.some(h => h.lanes.some(l => l.finish_time != null));

  el.innerHTML = `
    <div class="toolbar" style="align-items:flex-start">
      <h1 style="margin:0">Results — ${raceLabel}</h1>
      <div class="toolbar-spacer"></div>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Print</button>
    </div>

    <div class="toolbar">
      <select class="form-control" style="max-width:300px" onchange="selectResRace(this.value)">
        ${(() => {
          // F4: Group as Standard (25m, 50m, non-special relays) vs Special (medley, backstroke, etc.)
          const RELAY_TYPES = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];
          const SPECIAL_TYPES = ['75m','backstroke','breaststroke','butterfly','medley_relay'];
          const standard = resRaces.filter(r => !SPECIAL_TYPES.includes(r.race_type));
          const special = resRaces.filter(r => SPECIAL_TYPES.includes(r.race_type));
          
          // F6: Check if race actually has results entered (not just heats_generated status)
          function hasActualResults(r) {
            const isRelay = RELAY_TYPES.includes(r.race_type);
            if (isRelay) {
              return r.relay_teams && r.relay_teams.some(t => t.total_time != null);
            }
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
        <button class="btn btn-accent" id="btn-complete-archive" onclick="doCompleteEvent()">📦 Complete & Archive</button>
      ` : ''}
      ${resCompleted ? `
        <button class="btn btn-accent" disabled style="opacity:0.5;cursor:not-allowed">📦 Archived ✓</button>
      ` : ''}
    </div>

    ${''}<!-- F2: Relays now integrated in dropdown -->
    ${resFinalized ? '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">✓ Event Finalized — breakers recorded (PBs not auto-updated)</strong></div>' : ''}
    ${resCompleted ? '<div class="card" style="background:#e0e0e0;text-align:center;padding:12px"><strong>📦 Event Archived</strong></div>' : ''}

    ${''}<!-- Breakers Report temporarily hidden until Bryan confirms finish-time input method -->

    <!-- Results Table -->
    <div style="overflow-x:auto;margin-bottom:16px">
      ${isResRaceRelay(race) ? renderRelayResultsInline(race) : renderResultsTable(race)}
    </div>

  `;
}

function renderBreakersReport(race) {
  // SSOT: breaker = variance < -1 (Bryan's Excel formula).
  // net_time = actual swim time, variance = net_time - PB.
  const breakers = [];
  for (const heat of race.heats) {
    for (const lane of heat.lanes) {
      // F9: Validate breaker data — net_time must be positive and realistic
      if (lane.finish_time != null && lane.variance != null && lane.variance < -1 && lane.net_time > 0) {
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

  if (breakers.length === 0) {
    return `<div class="card" style="background:#fff8e1;border-left:6px solid #ffb300;margin-bottom:16px">
      <strong>🏅 Breakers Report</strong><br>
      No PB breakers in this race.
    </div>`;
  }

  // Sort by improvement (most improved first)
  breakers.sort((a, b) => b.improvement - a.improvement);

  let rows = breakers.map((b, i) => {
    const medal = i === 0 ? '🏆 ' : '';
    return `<tr style="background:${i % 2 === 0 ? '#e8f5e9' : '#f1f8e9'}">
      <td style="padding:8px 12px;font-weight:${i === 0 ? '700' : '400'}">${medal}${b.name}</td>
      <td style="padding:8px 12px;text-align:center">Heat ${b.heat}</td>
      <td style="padding:8px 12px;text-align:center">${b.pb}s</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700">${b.newTime}s</td>
      <td style="padding:8px 12px;text-align:center;color:#2e7d32;font-weight:700">-${b.improvement}s</td>
    </tr>`;
  }).join('');

  return `<div class="card" style="background:#fff8e1;border-left:6px solid #ffb300;margin-bottom:16px">
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
    // Bryan logic: places are ranked WITHIN EACH HEAT by raw finish time ascending.
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
      // SSOT: breaker = variance < -1 (Bryan's Excel: IF(variance < -1, "break", ""))
      const isBreak = lane.finish_time != null && lane.variance != null && lane.variance < -1;
      // Bryan logic: show a breaker marker only for the BEST breaker in this heat.
      let bestBreakerId = null;
      const breakersInHeat = heat.lanes.filter(x => x.finish_time != null && x.variance != null && x.variance < -1);
      if (breakersInHeat.length > 0) {
        breakersInHeat.sort((a, b) => a.variance - b.variance || a.finish_time - b.finish_time);
        bestBreakerId = breakersInHeat[0].id;
      }
      const isTrophy = lane.id === bestBreakerId;
      const breakCls = isBreak ? ' break-cell' : '';
      const displayPlace = livePlaces[lane.id] || lane.place || null;

      let finishCell;
      if (resFinalized) {
        finishCell = `<td class="time-cell${breakCls}" style="font-weight:700">${hasTime ? lane.finish_time + 's' : '—'}</td>`;
      } else {
        finishCell = `<td class="time-input${breakCls}" onclick="enterFinishTime(${heat.id}, ${lane.id}, ${lane.finish_time || 0})" style="cursor:pointer;font-weight:700">${hasTime ? lane.finish_time + 's' : '⏱️ Tap'}</td>`;
      }

      let placeCell;
      if (resFinalized || !hasTime) {
        placeCell = `<td style="font-weight:700;color:var(--primary)">${displayPlace ? ordinal(displayPlace) : '—'}</td>`;
      } else {
        placeCell = `<td>
          <select class="place-select" onchange="overridePlace(${heat.id}, ${lane.id}, this.value)" onclick="event.stopPropagation()">
            <option value="" ${!displayPlace ? 'selected' : ''}>—</option>
            <option value="1" ${displayPlace === 1 ? 'selected' : ''}>1st</option>
            <option value="2" ${displayPlace === 2 ? 'selected' : ''}>2nd</option>
            <option value="3" ${displayPlace === 3 ? 'selected' : ''}>3rd</option>
            <option value="4" ${displayPlace === 4 ? 'selected' : ''}>4th</option>
          </select>
        </td>`;
      }

      rows += `<tr class="${isBreak ? 'break-row' : ''}">
        <td>${lane.lane_number}</td>
        <td class="name-cell">${lane.name}</td>
        <td class="time-cell">${lane.handicap_time}s ${tooltip('PB: ' + lane.handicap_time + 's')}</td>
        <td class="time-cell">${lane.start_delay}s ${tooltip('Starts at ' + lane.start_delay + 's')}</td>
        ${finishCell}
        <td class="time-cell">${hasTime ? lane.net_time + 's' : '—'}</td>
        <td class="time-cell" style="${hasTime && lane.variance < 0 ? 'color:var(--success);font-weight:700' : ''}">${hasTime ? (lane.variance >= 0 ? '+' : '') + lane.variance + 's' : '—'}</td>
        ${placeCell}
        <td style="text-align:center;font-size:20px">${isTrophy ? '🏆' : ''}</td>
      </tr>`;
    }

    html += `
      <div class="card" style="margin-bottom:24px;padding:0;overflow:hidden;border:4px solid #0b3d91">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;border-bottom:4px solid #0b3d91">
          Heat ${heat.heat_number}
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
                <th>Place</th>
                <th style="width:40px">🏆</th>
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

// ── Actions ─────────────────────────────────────────

function selectResRace(raceId) {
  // F5/F7: Stay on Results screen for ALL races (individual AND relay) — no navigation away
  resSelectedRace = resRaces.find(r => r.id === parseInt(raceId));
  drawResults();
}

function enterFinishTime(heatId, laneId, currentValue) {
  showNumpad('', async (value) => {
    if (value == null) return;
    const result = await API.enterTime(heatId, laneId, parseInt(value));
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    // Refresh results
    renderResults();
  });
}

async function overridePlace(heatId, laneId, place) {
  // For now, manual place override stores locally. Full implementation would need a backend endpoint.
  // The calculate/rank endpoint will auto-set places, but user can override via dropdown.
  if (place) {
    // We'll handle this when Calculate is clicked — the rank endpoint sets places by finish_time
    // For manual override, we'd need a dedicated endpoint. For now, just visual.
  }
}

async function calculateResults() {
  confirmDialog('Save Rankings?', 'This will persist the current ranking (places 1st–4th) to the database. Rankings are already computed live.', async () => {
    const result = await API.rankRace(resSelectedRace.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    renderResults();
  });
}

async function doFinalizeEvent(allComplete) {
  // F11: Build detailed report of what's missing per race
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
    ? '⚠️ Missing results:\n\n' + reportText + '\n\nMissing entries will be skipped. PBs will NOT be auto-updated.'
    : 'All results entered:\n\n' + reportText + '\n\nPBs will NOT be auto-updated.';

  confirmDialog('Finalize Event?', warningText, async () => {
    const result = await API.finalizeEvent(resEvent.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    // F12: Detailed finalization report
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
            if (lane.variance != null && lane.variance < -1 && lane.net_time > 0) breakers++;
          }
        }
        finalReport += '• ' + label + ': ' + entered + '/' + total + ' results';
        if (entered === 0) finalReport += ' ❌ (skipped)';
        else finalReport += ' ✓';
        if (breakers > 0) finalReport += ', ' + breakers + ' breaker' + (breakers !== 1 ? 's' : '');
        finalReport += '\n';
      }
    }
    finalReport += '\nPBs were not auto-updated.';
    alert(finalReport);
    renderResults();
  });
}

async function doUnlockEvent() {
  if (!confirm('Unlock event? This allows you to change races and enter times again. Any finalized results remain for now but can be edited.')) return;
  await fetch(`/api/events/${resEvent.id}/unlock`, { method: 'PUT' });
  renderResults();
}

async function doCompleteEvent() {
  confirmDialog('Complete & Archive?',
    'This will archive the event. You can still view results in the Season Calendar.',
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
    <tr class="break-row">
      <td class="name-cell">${b.member_name}</td>
      <td>${b.stroke}</td>
      <td class="time-cell">${b.old_pb}s</td>
      <td class="time-cell" style="font-weight:700;color:var(--success)">${b.new_time}s</td>
      <td style="font-weight:700;color:var(--success)">-${b.improvement}s</td>
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

// ── Inline Relay Results (F5/F7) ─────────────────────

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
      const pbDisplay = pbCol != null ? pbCol + 's' : '—';
      rows += '<tr><td>' + m.leg_order + '</td><td class="name-cell">' + m.name + '</td><td>' + (m.stroke || '—') + '</td><td class="time-cell">' + pbDisplay + '</td></tr>';
    }

    let totalTimeCell;
    if (!resFinalized) {
      totalTimeCell = '<td class="time-input" onclick="enterRelayTimeInline(' + team.id + ', ' + (team.total_time || 0) + ')" style="cursor:pointer;font-weight:700;font-size:16px">' + (team.total_time != null ? team.total_time + 's' : '⏱️ Tap') + '</td>';
    } else {
      totalTimeCell = '<td class="time-cell" style="font-weight:700;font-size:16px">' + (team.total_time != null ? team.total_time + 's' : '—') + '</td>';
    }

    let varianceDisplay = '';
    if (team.variance != null) {
      const varStyle = Math.abs(team.variance) < 3 ? 'color:var(--success);font-weight:700' : '';
      varianceDisplay = '<span style="' + varStyle + '"> | Variance: ' + (team.variance >= 0 ? '+' : '') + team.variance + 's</span>';
    }

    const targetDisplay = team.target_time ? 'Target: ' + team.target_time + 's' : '';

    html += '<div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;border:4px solid #0b3d91"><div style="background:#e0f2f1;padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #0b3d91"><span>' + teamHeader + '</span><span style="font-weight:400;font-size:13px;color:#666">Start: 2s' + (targetDisplay ? ' • ' + targetDisplay : '') + '</span></div><table class="spreadsheet-table" style="margin:0"><thead><tr><th style="width:50px">Leg</th><th style="text-align:left;min-width:140px">Swimmer</th><th>Stroke</th><th>PB</th></tr></thead><tbody>' + rows + '<tr style="background:#f5f5f5;font-weight:700"><td></td><td colspan="2">Team Total' + varianceDisplay + '</td>' + totalTimeCell + '</tr></tbody></table></div>';
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
    const result = await API.enterRelayTeamTime(teamId, parseInt(value));
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

// Race labels: uses RACE_LABELS from heat-builder.js (loaded before this file)
