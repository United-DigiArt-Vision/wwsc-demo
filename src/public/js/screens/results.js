/**
 * WWSC — Results Screen (v2.6.0+: dual time system, break column, manual place, slow swimmers)
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
    // R9: Prefer a race that actually has heats/teams, to avoid empty default
    const RELAY_TYPES_SEL = ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'];
    const raceWithData = resRaces.find(r => {
      if (RELAY_TYPES_SEL.includes(r.race_type)) return r.relay_teams && r.relay_teams.length > 0;
      return r.heats && r.heats.length > 0;
    });
    resSelectedRace = raceWithData || resRaces[0];
  } else {
    resSelectedRace = resRaces.find(r => r.id === resSelectedRace.id);
  }

  drawResults();
}

function drawResults() {
  const el = document.getElementById('content');
  const race = resSelectedRace;
  // R9: Check if current race has data — but still render the race selector so user can switch tabs
  const currentRaceHasData = isResRaceRelay(race)
    ? (race && race.relay_teams && race.relay_teams.length > 0)
    : (race && race.heats && race.heats.length > 0);

  if (!currentRaceHasData && resRaces.length <= 1) {
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
      <button class="btn btn-outline" onclick="showResultsReadout()">🗣️ Readout</button>
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
        <button class="btn btn-accent" onclick="showSeasonReport()">📄 Event Report</button>
        <button class="btn btn-accent" disabled style="opacity:0.5;cursor:not-allowed">✅ Completed ✓</button>
      ` : ''}
    </div>

    ${resFinalized ? '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">✓ Event Finalized — breakers recorded. PBs not auto-updated — update manually via Members → select swimmer → edit time.</strong></div>' : ''}
    ${resCompleted ? '<div class="card" style="background:#e0e0e0;text-align:center;padding:12px"><strong>✅ Event Completed</strong></div>' : ''}

    <div style="overflow-x:auto;margin-bottom:16px">
      ${currentRaceHasData
        ? (isResRaceRelay(race) ? (
            ['25m_brace','50m_brace'].includes(race.race_type) ? renderBraceResultsInline(race) :
            race.race_type === 'pogo' ? renderPogoResultsInline(race) :
            renderRelayResultsInline(race)
          ) : renderResultsTable(race))
        : '<div class="card" style="background:#fff3e0;border-left:4px solid #e65100;padding:16px"><strong>No heats generated for this race.</strong><br>Go to <a href="#" onclick="navigate(\'heat-builder\')">Heat Builder</a> to generate heats first.</div>'
      }
    </div>

    ${(currentRaceHasData && !isRelay) ? renderBreakersSection(race) : ''}
    <div id="slow-swimmers-section"></div>
    ${/* R11: Consolidated Report removed from Results page — only on Breaker Report sidebar page */''}
  `;

  // Load slow swimmers + consolidated breakers async
  // Exceeding report is needed for relevant races on Results page as well
  if (resFinalized || anyTimesEntered) {
    loadSlowSwimmers();
    // R11: Consolidated report removed from Results page
  }
}

function renderBreakersSection(race) {
  // Collect breakers from current race
  const breakers = [];
  for (const heat of (race.heats || [])) {
    for (const lane of heat.lanes) {
      if (lane.finish_time != null && lane.variance != null && lane.variance <= -100 && lane.net_time > 0) {
        // v2.7.1: handicap_time is WHOLE SECONDS, net_time is CENTISECONDS
        // Convert PB to centiseconds for correct improvement calculation
        const pbCs = lane.handicap_time * 100;
        breakers.push({
          name: lane.name || 'Unknown',
          heat: heat.heat_number,
          pb: lane.handicap_time,
          newTime: lane.net_time,
          improvement: pbCs - lane.net_time
        });
      }
    }
  }

  if (breakers.length === 0) return '';

  breakers.sort((a, b) => b.improvement - a.improvement);

  // R10: Unified report table format
  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;
  let rows = breakers.map((b, i) => {
    const medal = i === 0 ? '🏆 ' : '';
    return `<tr style="background:${i % 2 === 0 ? '#e8f5e9' : '#f1f8e9'}">
      <td style="padding:8px 12px;font-weight:${i === 0 ? '700' : '400'}">${medal}${b.name}</td>
      <td style="padding:8px 12px;text-align:center">${raceLabel} - Heat ${b.heat}</td>
      <td style="padding:8px 12px;text-align:center">${formatWhole(b.pb)}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700">${formatTime(b.newTime)}</td>
      <td style="padding:8px 12px;text-align:center;color:#2e7d32;font-weight:700">-${formatTime(b.improvement)}</td>
    </tr>`;
  }).join('');

  // R10: Unified column headers: Swimmer | Event/Heat | Old PB | New Time | Variance
  return `<div class="card" style="background:#e8f5e9;border-left:6px solid #2e7d32;margin-bottom:16px">
    <strong style="font-size:1.1em">🏅 Breakers Report — ${breakers.length} PB${breakers.length !== 1 ? 's' : ''} Broken!</strong>
    <table class="report-table" style="width:100%;border-collapse:collapse;margin-top:10px;table-layout:fixed">
      <thead>
        <tr style="background:#2e7d32;color:#fff">
          <th style="padding:8px 12px;text-align:left;width:25%">Swimmer</th>
          <th style="padding:8px 12px;text-align:center;width:25%">Event/Heat</th>
          <th style="padding:8px 12px;text-align:center;width:15%">Old PB</th>
          <th style="padding:8px 12px;text-align:center;width:15%">New Time</th>
          <th style="padding:8px 12px;text-align:center;width:20%">Variance</th>
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
    // Rank by finish_time within heat for live places — with tie handling
    const rankedLanes = heat.lanes
      .filter(l => l.finish_time != null)
      .slice()
      .sort((a, b) => a.finish_time - b.finish_time);
    const livePlaces = {};
    let currentPlace = 0;
    let prevFinish = null;
    rankedLanes.forEach((lane, idx) => {
      if (prevFinish === null || lane.finish_time !== prevFinish) {
        currentPlace = idx + 1;
      }
      livePlaces[lane.id] = currentPlace;
      prevFinish = lane.finish_time;
    });

    let rows = '';
    for (let li = 0; li < heat.lanes.length; li++) {
      const lane = heat.lanes[li];
      const hasTime = lane.finish_time != null;
      const isBreak = hasTime && lane.variance != null && lane.variance <= -100;
      const autoPlace = livePlaces[lane.id] || lane.place || null;

      let finishCell;
      if (resFinalized) {
        finishCell = `<td class="time-cell" style="font-weight:700">${hasTime ? formatTime(lane.finish_time) : '—'}</td>`;
      } else {
        finishCell = `<td class="time-input" onclick="enterFinishTime(${heat.id}, ${lane.id}, ${lane.finish_time || 0})" style="cursor:pointer;font-weight:700">${hasTime ? formatTime(lane.finish_time) : '⏱️ Tap'}</td>`;
      }

      // BF2.6-13 & BF0404-17: Gold/Silver/Bronze colors for auto-placing + subtle row tint
      let autoPlaceCell;
      let rowStyle = '';
      if (autoPlace) {
        let apBg, apColor, rowBg;
        if (autoPlace === 1) { apBg = '#FFD700'; apColor = '#333'; rowBg = '#fffde7'; }
        else if (autoPlace === 2) { apBg = '#C0C0C0'; apColor = '#333'; rowBg = '#fafafa'; }
        else if (autoPlace === 3) { apBg = '#CD7F32'; apColor = '#fff'; rowBg = '#fff8e1'; }
        else { apBg = '#9e9e9e'; apColor = '#fff'; rowBg = ''; }
        
        autoPlaceCell = `<td style="text-align:center;background:${apBg};color:${apColor};font-weight:700;font-size:16px">${autoPlace} ${autoPlace <= 3 ? '🏆' : ''}</td>`;
        if (rowBg && !isBreak) rowStyle = ` style="background:${rowBg};border-left:4px solid ${apBg}"`;
      } else {
        autoPlaceCell = `<td style="text-align:center">—</td>`;
      }

      let manualPlaceCell;
      if (resFinalized) {
        manualPlaceCell = `<td style="text-align:center">${lane.manual_place ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#e53935;color:white;font-weight:700;font-size:13px">${lane.manual_place}</span>` : '—'}</td>`;
      } else {
        manualPlaceCell = `<td>
          <select class="place-select" style="min-height:44px;padding:4px 8px;font-size:14px;border:2px solid #e53935;border-radius:6px" onchange="setManualPlace(${lane.id}, this.value)" onclick="event.stopPropagation()">
            <option value="" ${!lane.manual_place ? 'selected' : ''}>—</option>
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

      // BF2.6-03: Total = PB + Delay (expected finish time)
      const totalTime = (lane.handicap_time != null && lane.start_delay != null) ? lane.handicap_time + lane.start_delay : null;

      rows += `<tr class="${rowClass}"${rowStyle}>
        <td>${lane.lane_number}</td>
        <td class="name-cell" style="font-size:18px">${lane.name}</td>
        <td class="time-cell">${formatWhole(lane.handicap_time)}</td>
        <td class="time-cell">${formatWhole(lane.start_delay)}</td>
        <td class="time-cell">${formatWhole(totalTime)}</td>
        ${finishCell}
        <td class="time-cell">${hasTime ? formatTime(lane.net_time) : '—'}</td>
        <td class="time-cell" style="${hasTime && lane.variance < 0 ? 'color:var(--success);font-weight:700' : ''}">${hasTime ? (lane.variance >= 0 ? '+' : '') + formatTime(lane.variance) : '—'}</td>
        ${breakCell}
        ${autoPlaceCell}
        ${manualPlaceCell}
      </tr>`;
    }

    html += `
      <div class="card" style="margin-bottom:24px;padding:0;overflow:hidden;border:4px solid #0b3d91">
        <div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;border-bottom:4px solid #0b3d91;display:flex;justify-content:space-between;align-items:center">
          <span>Heat ${heat.heat_number}</span>
          <span style="font-weight:400;font-size:13px;opacity:0.8">Expected finish: ${formatWhole(maxTime)}</span>
        </div>
        <div style="overflow-x:auto">
          <table class="spreadsheet-table">
            <thead>
              <tr>
                <th style="width:50px">Lane</th>
                <th style="text-align:left;min-width:140px">Swimmer</th>
                <th>PB</th>
                <th>Delay</th>
                <th>Exp. Finish</th>
                <th style="min-width:80px">Finish</th>
                <th>Net</th>
                <th>Variance</th>
                <th>Break</th>
                <th style="color:#4caf50">Auto</th>
                <th style="color:#e53935">Manual</th>
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

function buildResultsReadout(race) {
  const raceLabel = RACE_LABELS[race.race_type] || race.race_type;
  if (isResRaceRelay(race)) {
    const teams = race.relay_teams || [];
    if (teams.length === 0) return `${raceLabel} Results\nNo teams available.`;
    let ranked = teams.slice().filter(t => t.total_time != null);
    if (ranked.some(t => t.place != null)) {
      ranked = ranked.sort((a, b) => (a.place ?? 999) - (b.place ?? 999));
    } else {
      ranked = ranked.sort((a, b) => (a.total_time ?? 999999) - (b.total_time ?? 999999));
    }
    const lines = [`${raceLabel} Results`];
    ranked.forEach(t => {
      const place = t.place ? ordinal(t.place) + ': ' : '';
      const time = t.total_time != null ? formatTime(t.total_time) : '—';
      lines.push(`${place}${t.team_name} — ${time}`);
    });
    return lines.join('\n');
  }

  const lines = [`${raceLabel} Results`];
  for (const heat of race.heats || []) {
    lines.push(`Heat ${heat.heat_number}:`);
    if (!heat.lanes || heat.lanes.length === 0) {
      lines.push('  No swimmers.');
      continue;
    }
    const rankedLanes = heat.lanes
      .filter(l => l.finish_time != null)
      .slice()
      .sort((a, b) => a.finish_time - b.finish_time);
    const livePlaces = {};
    rankedLanes.forEach((lane, idx) => {
      livePlaces[lane.id] = idx + 1;
    });

    const placed = heat.lanes.map(lane => {
      const autoPlace = livePlaces[lane.id] || lane.place || null;
      const place = lane.manual_place || autoPlace;
      return { lane, place };
    }).filter(p => p.place != null)
      .sort((a, b) => a.place - b.place);

    if (placed.length === 0) {
      lines.push('  No results.');
      continue;
    }

    placed.forEach(p => {
      const time = p.lane.finish_time != null ? formatTime(p.lane.finish_time) : '—';
      lines.push(`  ${ordinal(p.place)}: ${p.lane.name} — ${time}`);
    });
  }

  return lines.join('\n');
}

function showResultsReadout() {
  const race = resSelectedRace;
  if (!race) return;
  const readout = buildResultsReadout(race);
  showModal('Results Readout', `
    <textarea id="results-readout-text" class="form-control" style="width:100%;min-height:220px;font-family:monospace">${readout}</textarea>
  `, [
    { label: 'Copy', cls: 'btn-primary', action: async () => {
      const text = document.getElementById('results-readout-text')?.value || '';
      try {
        await navigator.clipboard.writeText(text);
        hideModal();
        alert('Readout copied to clipboard.');
      } catch (e) {
        alert('Copy failed. You can still select and copy manually.');
      }
    }},
    { label: 'Close', cls: 'btn-outline' }
  ]);
}

// ordinal() is now shared from format.js — this local alias kept for compatibility
// function ordinal(n) → already defined in format.js, loaded before this file

// ── Slow Swimmers Section ──────────────────────────

async function loadSlowSwimmers() {
  if (!resEvent) return;
  try {
    const allSlow = await API.getSlowSwimmers(resEvent.id);
    const section = document.getElementById('slow-swimmers-section');
    if (!section) return;
    // R12: Filter to current race type only
    const currentRace = resSelectedRace;
    const slow = currentRace ? allSlow.filter(s => s.race_type === currentRace.race_type) : allSlow;
    if (!slow || slow.length === 0) {
      section.innerHTML = '';
      return;
    }

    const raceLabel = currentRace ? (RACE_LABELS[currentRace.race_type] || currentRace.race_type) : '';
    const rows = slow.map(s => `
      <tr>
        <td class="name-cell">${s.name}</td>
        <td>${s.race_type}</td>
        <td class="time-cell">${formatWhole(s.pb)}</td>
        <td class="time-cell">${formatTime(s.net_time)}</td>
        <td class="time-cell" style="font-weight:700;color:#e65100">+${formatTime(s.variance)}</td>
      </tr>
    `).join('');

    // R10: Unified report format with Event/Heat column
    const slowRows = slow.map((s, i) => `
      <tr style="background:${i % 2 === 0 ? '#fffaf5' : '#ffffff'}">
        <td style="text-align:left;font-weight:600;padding:12px 14px;border-bottom:1px solid #ffe0b2">${s.name}</td>
        <td style="text-align:center;padding:12px 14px;border-bottom:1px solid #ffe0b2">${raceLabel}${s.heat_number ? ' - Heat ' + s.heat_number : ''}</td>
        <td style="text-align:center;padding:12px 14px;border-bottom:1px solid #ffe0b2">${formatWhole(s.pb)}</td>
        <td style="text-align:center;font-weight:700;padding:12px 14px;border-bottom:1px solid #ffe0b2">${formatTime(s.net_time)}</td>
        <td style="text-align:center;color:#e65100;font-weight:700;padding:12px 14px;border-bottom:1px solid #ffe0b2">+${formatTime(s.variance)}</td>
      </tr>
    `).join('');

    section.innerHTML = `
      <div class="card" style="margin-top:20px;margin-bottom:16px;padding:0;overflow:hidden;border:2px solid #ffcc80">
        <div style="background:#e65100;color:white;padding:10px 16px;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <strong style="font-size:1.1em">⚠️ Exceeding Report — ${slow.length} swimmer${slow.length !== 1 ? 's' : ''}</strong>
          <span style="font-size:12px;font-weight:400;opacity:0.95">More than 2 seconds over PB</span>
        </div>
        <div style="padding:10px 16px;font-size:13px;color:var(--text-secondary);background:#fff8f1;border-bottom:1px solid #ffe0b2">These swimmers may need their PB times adjusted up. Times are NOT auto-updated.</div>
        <div style="overflow-x:auto">
          <table class="report-table" style="width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed">
            <thead>
              <tr>
                <th style="text-align:left;width:25%;padding:12px 14px;border-bottom:2px solid #ffe0b2">Swimmer</th>
                <th style="text-align:center;width:25%;padding:12px 14px;border-bottom:2px solid #ffe0b2">Event/Heat</th>
                <th style="text-align:center;width:15%;padding:12px 14px;border-bottom:2px solid #ffe0b2">Old PB</th>
                <th style="text-align:center;width:15%;padding:12px 14px;border-bottom:2px solid #ffe0b2">New Time</th>
                <th style="text-align:center;width:20%;padding:12px 14px;border-bottom:2px solid #ffe0b2">Variance</th>
              </tr>
            </thead>
            <tbody>${slowRows}</tbody>
          </table>
        </div>
        <div style="padding:10px 16px;font-size:12px;color:#8d6e63;background:#fff3e0">ℹ️ To update a PB: Members → select swimmer → edit time.</div>
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
      await showSeasonReport();
      navigate('calendar');
    }
  );
}

async function showSeasonReport() {
  const report = await API.getEventReport(resEvent.id);
  if (report.error) {
    alert('Error: ' + report.error);
    return;
  }

  let html = '<html><head><title>Event Report</title><style>' +
    'body{font-family:Arial,sans-serif;padding:24px;color:#222}h1,h2,h3{margin:0 0 12px}table{width:100%;border-collapse:collapse;margin:12px 0 24px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.meta{color:#666;margin-bottom:20px}.card{margin-bottom:24px;padding:16px;border:1px solid #ddd;border-radius:8px}' +
    '</style></head><body>';
  html += '<h1>Event Report — ' + report.event.date + '</h1>';
  html += '<div class="meta">Participants: ' + report.attendance.length + ' • Status: ' + report.event.status + '</div>';
  html += '<div class="card"><h2>Participants</h2><table><thead><tr><th>Name</th><th>Special Entry</th></tr></thead><tbody>' +
    report.attendance.map(a => '<tr><td>' + a.name + '</td><td>' + (a.special_event_entry || '—') + '</td></tr>').join('') +
    '</tbody></table></div>';

  for (const race of report.races) {
    html += '<div class="card"><h2>' + (RACE_LABELS[race.race_type] || race.race_type) + '</h2>';
    if (race.teams) {
      for (const team of race.teams) {
        html += '<h3>' + team.team_name + (team.place ? ' — ' + ordinal(team.place) : '') + '</h3>';
        html += '<table><thead><tr><th>Leg</th><th>Swimmer</th><th>Stroke</th><th>Total</th><th>Variance</th></tr></thead><tbody>' +
          team.members.map(m => '<tr><td>' + m.leg_order + '</td><td>' + m.name + '</td><td>' + (m.stroke || '—') + '</td><td></td><td></td></tr>').join('') +
          '<tr><td colspan="3"><strong>Team Result</strong></td><td>' + (team.total_time != null ? formatTime(team.total_time) : '—') + '</td><td>' + (team.variance != null ? ((team.variance >= 0 ? '+' : '') + formatTime(team.variance)) : '—') + '</td></tr>' +
          '</tbody></table>';
      }
    } else if (race.heats) {
      for (const heat of race.heats) {
        html += '<h3>Heat ' + heat.heat_number + '</h3>';
        html += '<table><thead><tr><th>Lane</th><th>Swimmer</th><th>PB</th><th>Finish</th><th>Place</th></tr></thead><tbody>' +
          heat.lanes.map(l => '<tr><td>' + l.lane_number + '</td><td>' + l.name + '</td><td>' + formatWhole(l.handicap_time) + '</td><td>' + (l.finish_time != null ? formatTime(l.finish_time) : '—') + '</td><td>' + (l.place || l.manual_place || '—') + '</td></tr>').join('') +
          '</tbody></table>';
      }
    }
    html += '</div>';
  }

  if (report.breakers && report.breakers.length > 0) {
    html += '<div class="card"><h2>Record Breakers</h2><table><thead><tr><th>Swimmer</th><th>Stroke</th><th>Old PB</th><th>New Time</th><th>Improved</th></tr></thead><tbody>' +
      report.breakers.map(b => '<tr><td>' + b.member_name + '</td><td>' + b.stroke + '</td><td>' + (b.old_pb != null ? formatTime(b.old_pb) : '?') + '</td><td>' + (b.new_time != null ? formatTime(b.new_time) : '?') + '</td><td style="color:green">⬇️ ' + (b.improvement != null ? formatTime(b.improvement) : '?') + '</td></tr>').join('') +
      '</tbody></table></div>';
  }

  html += '</body></html>';
  const w = window.open('', '_blank');
  if (!w) return alert('Popup blocked. Please allow popups and try again.');
  w.document.write(html);
  w.document.close();
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

// v2.7.4: Brace Relay — compact lane-based layout in Results
function renderBraceResultsInline(race) {
  const teams = race.relay_teams || [];
  if (teams.length === 0) return '<div class="card"><p>No brace teams generated yet.</p></div>';

  const ranked = teams.some(t => t.place != null);
  let actionsHtml = '';
  if (!resFinalized) {
    actionsHtml = '<div class="toolbar" style="margin-bottom:12px">';
    if (!ranked) {
      const anyTimes = teams.some(t => t.total_time != null);
      actionsHtml += '<button class="btn btn-primary" onclick="calculateRelayResultsInline()" ' + (anyTimes ? '' : 'disabled') + '>📊 Calculate Results</button>';
    } else {
      actionsHtml += '<span style="color:var(--success);font-weight:700">🏆 Results Calculated</span>';
    }
    actionsHtml += '</div>';
  }

  let rows = '';
  for (const team of teams) {
    const members = team.members || [];
    const names = members.map(m => m.name).join(' + ');
    const pbs = members.map(m => formatWhole(getRelayPBForResults(m, race.race_type))).join(' + ');
    const totalPB = team.target_time; // R7: renamed from "Target" to "Total"
    const startDelay = team.start_delay || 0;
    const targetCalc = totalPB != null ? totalPB + startDelay : null; // R7: new Target = Total + Start

    // R7: Gold/Silver/Bronze color coding for place
    let placeBg = '', placeColor = '';
    if (team.place === 1) { placeBg = '#FFD700'; placeColor = '#333'; }
    else if (team.place === 2) { placeBg = '#C0C0C0'; placeColor = '#333'; }
    else if (team.place === 3) { placeBg = '#CD7F32'; placeColor = '#fff'; }
    const placeDisplay = team.place ? ordinal(team.place) : '—';
    const placeStyle = team.place ? 'background:' + placeBg + ';color:' + placeColor + ';font-weight:700;font-size:16px;text-align:center' : '';

    let finishCell;
    if (!resFinalized) {
      finishCell = '<td onclick="enterRelayTimeInline(' + team.id + ', ' + (team.total_time || 0) + ')" style="cursor:pointer;font-weight:700">' + (team.total_time != null ? formatTime(team.total_time) : '⏱️ Tap') + '</td>';
    } else {
      finishCell = '<td style="font-weight:700">' + (team.total_time != null ? formatTime(team.total_time) : '—') + '</td>';
    }

    const varDisplay = team.variance != null ? ((team.variance >= 0 ? '+' : '') + formatTime(team.variance)) : '—';
    const varStyle = team.variance != null && Math.abs(team.variance) < 300 ? 'color:var(--success);font-weight:700' : '';

    rows += '<tr><td>' + team.team_number + '</td><td class="name-cell">' + names + '</td><td>' + pbs + '</td><td>' + formatWhole(totalPB) + '</td><td>' + formatWhole(startDelay) + '</td><td>' + (targetCalc != null ? formatWhole(targetCalc) : '—') + '</td>' + finishCell + '<td style="' + varStyle + '">' + varDisplay + '</td><td style="' + placeStyle + '">' + placeDisplay + '</td></tr>';
  }

  // R7: Updated column order: PBs | Total | Start | Target (new) | Finish | Variance | Place
  return actionsHtml + '<div class="card" style="margin-bottom:16px;padding:0;overflow:hidden;border:4px solid #0b3d91"><div style="background:var(--primary);color:white;padding:10px 16px;font-weight:700;font-size:16px;display:flex;justify-content:space-between;align-items:center"><span>' + (RACE_LABELS[race.race_type] || race.race_type) + '</span><span style="font-weight:400;font-size:13px;opacity:0.8">Start: 2s | fastest finish wins</span></div><table class="spreadsheet-table" style="margin:0"><thead><tr><th style="width:50px">Lane</th><th style="text-align:left;min-width:180px">Pair</th><th>PBs</th><th>Total</th><th>Start</th><th>Target</th><th style="min-width:80px">Finish</th><th>Variance</th><th>Place</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

// R16: Pogo Results — columns: PB | Start | Total | T1 | T2 | Result (Avg) | Variance
function renderPogoResultsInline(race) {
  const teams = race.relay_teams || [];
  if (teams.length === 0) return '<div class="card"><p>No Pogo teams generated yet.</p></div>';

  let html = '';
  for (const team of teams) {
    const members = team.members || [];
    const placeDisplay = team.place ? ordinal(team.place) : '';
    let placeBadge = '';
    if (team.place === 1) placeBadge = '<span style="background:#FFD700;color:#333;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px">🥇</span>';
    else if (team.place === 2) placeBadge = '<span style="background:#C0C0C0;color:#333;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px">🥈</span>';
    else if (team.place === 3) placeBadge = '<span style="background:#CD7F32;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px">🥉</span>';
    const teamHeader = team.team_name + (placeDisplay ? ' — <span style="color:#e53935;font-weight:700;font-size:18px">' + placeDisplay + '</span>' : '');
    const startDisplay = '⏱️ Start: ' + formatWhole(team.start_delay || 0) + ' s';
    const totalPB = 'Total: ' + formatWhole(team.target_time);
    const targetCalc = team.target_time != null ? 'Target: ' + formatWhole(team.target_time + (team.start_delay || 0)) : '';

    let rows = '';
    for (const m of members) {
      const t1 = m.split_time;
      const t2 = m.split_time_2;
      const pbRaw = getRelayPBForResults(m, race.race_type);
      const pb = formatWhole(pbRaw);
      const avg = (t1 != null && t2 != null) ? Math.round((t1 + t2) / 2) : null;
      const expectedFinishSecs = (pbRaw != null ? (pbRaw + (team.start_delay || 0)) : null);
      // Calculate individual variance based on PB + start_delay vs avg time
      const targetTimeCs = expectedFinishSecs != null ? expectedFinishSecs * 100 : null;
      const indVariance = (avg != null && targetTimeCs != null) ? (avg - targetTimeCs) : null;

      let t1Cell, t2Cell;
      if (!resFinalized) {
        t1Cell = '<td class="time-input pogo-edit" data-team-id="' + team.id + '" data-member-id="' + m.member_id + '" data-split="1" data-current="' + (t1 || 0) + '" style="cursor:pointer;font-weight:700">' + (t1 != null ? formatTime(t1) : '⏱️ T1') + '</td>';
        t2Cell = '<td class="time-input pogo-edit" data-team-id="' + team.id + '" data-member-id="' + m.member_id + '" data-split="2" data-current="' + (t2 || 0) + '" style="cursor:pointer;font-weight:700">' + (t2 != null ? formatTime(t2) : '⏱️ T2') + '</td>';
      } else {
        t1Cell = '<td>' + (t1 != null ? formatTime(t1) : '—') + '</td>';
        t2Cell = '<td>' + (t2 != null ? formatTime(t2) : '—') + '</td>';
      }

      const targetDisplay = team.target_time != null ? formatWhole(team.target_time + (team.start_delay || 0)) : '—';
      const resultCell = '<td class="result-cell" style="font-weight:700;background:#e8f5e9;color:#111">' + (avg != null ? formatTime(avg) : '—') + '</td>';
      const varianceCell = '<td>' + (indVariance != null ? ((indVariance >= 0 ? '+' : '') + formatTime(indVariance)) : '—') + '</td>';
      rows += '<tr>'
        + '<td class="name-cell">' + m.name + '</td>'
        + '<td>' + pb + '</td>'
        + '<td>' + formatWhole(team.start_delay || 0) + '</td>'
        + '<td>' + (expectedFinishSecs != null ? formatWhole(expectedFinishSecs) : '—') + '</td>'
        + '<td>' + formatWhole(team.target_time) + '</td>'
        + '<td>' + targetDisplay + '</td>'
        + t1Cell
        + t2Cell
        + resultCell
        + varianceCell
        + '</tr>';
    }

    // R16: No Team Total for Pogo — time entry happens per swimmer (T1/T2)
    const headerBg = team.place ? '#e8f5e9' : '#e0f2f1';
    html += '<div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;border:4px solid #0b3d91"><div style="background:' + headerBg + ';padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #0b3d91"><span>' + teamHeader + placeBadge + '</span><span style="display:flex;align-items:center;gap:12px"><span style="background:rgba(11,61,145,0.15);padding:6px 14px;border-radius:20px;font-weight:700;font-size:16px;color:#0b3d91">' + startDisplay + '</span><span style="font-weight:400;font-size:13px;color:#666">' + totalPB + ' • ' + targetCalc + '</span></span></div>' +
      '<div style="overflow-x:auto"><table class="spreadsheet-table" style="margin:0;font-size:12px;width:100%"><thead><tr style="white-space:nowrap"><th style="text-align:left;min-width:90px">Swimmer</th><th style="min-width:30px">PB</th><th style="min-width:36px">Start</th><th style="min-width:42px">Exp.F</th><th style="min-width:36px">Total</th><th style="min-width:36px">Tgt</th><th style="min-width:50px">T1</th><th style="min-width:50px">T2</th><th style="min-width:52px;background:#2e7d32;color:#fff;font-weight:800;text-shadow:none">Result</th><th style="min-width:48px">Var.</th></tr></thead><tbody>' + rows +
      '</tbody></table></div></div>'; // R16: No Team Total footer for Pogo
  }
  return html;
}

// Pogo split1 inline entry (T1) — must call renderResults, not drawRelays
function enterPogoSplit1Inline(teamId, memberId, currentValue) {
  showNumpad(currentValue || '', async (value) => {
    try {
      if (value == null) return;
      const result = await API.enterRelaySplit(teamId, memberId, value);
      if (result.error) { alert('Error: ' + result.error); return; }
      renderResults();
    } catch (err) { console.error('Pogo T1 save error:', err); }
  });
}

// Pogo split2 inline entry (T2)
function enterPogoSplit2Inline(teamId, memberId, currentValue) {
  showNumpad(currentValue || '', async (value) => {
    try {
      if (value == null) return;
      const result = await API.enterRelaySplit2(teamId, memberId, value);
      if (result.error) { alert('Error: ' + result.error); return; }
      renderResults();
    } catch (err) { console.error('Pogo T2 save error:', err); }
  });
}

document.addEventListener('click', (e) => {
  const cell = e.target.closest('.pogo-edit');
  if (!cell) return;
  const teamId = Number(cell.dataset.teamId);
  const memberId = Number(cell.dataset.memberId);
  const split = cell.dataset.split;
  const current = Number(cell.dataset.current || 0);
  if (split === '1') enterPogoSplit1Inline(teamId, memberId, current);
  else enterPogoSplit2Inline(teamId, memberId, current);
});

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
    // BF2.6-15: RED + BOLD + LARGER place display for relay results
    const placeDisplay = team.place ? ordinal(team.place) : '';
    const teamHeader = team.team_name + (placeDisplay ? ' — <span style="color:#e53935;font-weight:700;font-size:18px">' + placeDisplay + '</span>' : '');

    const isMedley = race.race_type === 'medley_relay';
    const isBrace = ['25m_brace', '50m_brace'].includes(race.race_type);
    const is25mRelay = race.race_type === '25m_relay';
    const isPogo = race.race_type === 'pogo';
    const showStroke = isMedley || isBrace;
    const showSplits = is25mRelay;
    const showPogoTimes = isPogo;

    let rows = '';
    for (const m of members) {
      const pbCol = getRelayPBForResults(m, race.race_type);
      const pbDisplay = formatWhole(pbCol);
      const splitDisplay = m.split_time != null ? formatTime(m.split_time) : '—';
      const strokeDisplay = (isMedley && m.auto === true)
        ? (m.stroke || '—') + ' <span style="color:#e65100;font-weight:700;font-size:13px">(Y)</span>'
        : (m.stroke || '—');

      // v2.7.3: Pogo shows T1/T2/Avg
      let pogoCells = '';
      if (showPogoTimes) {
        const t1 = m.split_time;
        const t2 = m.split_time_2;
        const avg = (t1 != null && t2 != null) ? Math.round((t1 + t2) / 2) : null;
        pogoCells = '<td class="time-cell">' + (t1 != null ? formatTime(t1) : '—') + '</td>' +
          '<td class="time-cell">' + (t2 != null ? formatTime(t2) : '—') + '</td>' +
          '<td class="time-cell" style="font-weight:700;background:#e8f5e9">' + (avg != null ? formatTime(avg) : '—') + '</td>';
      }

      rows += '<tr><td>' + m.leg_order + '</td><td class="name-cell">' + m.name + '</td>' + (showStroke ? '<td>' + strokeDisplay + '</td>' : '') + '<td class="time-cell">' + pbDisplay + '</td>' + (showSplits ? '<td class="time-cell">' + splitDisplay + '</td>' : '') + pogoCells + '</tr>';
    }

    let totalTimeCell;
    if (!resFinalized) {
      totalTimeCell = '<td onclick="enterRelayTimeInline(' + team.id + ', ' + (team.total_time || 0) + ')" style="cursor:pointer;font-weight:900;font-size:18px;color:#ffffff !important;text-shadow:0 1px 2px rgba(0,0,0,0.3);padding:12px 16px">' + (team.total_time != null ? formatTime(team.total_time) : '⏱️ Tap') + '</td>';
    } else {
      totalTimeCell = '<td style="font-weight:900;font-size:18px;color:#ffffff !important;text-shadow:0 1px 2px rgba(0,0,0,0.3);padding:12px 16px">' + (team.total_time != null ? formatTime(team.total_time) : '—') + '</td>';
    }

    let varianceDisplay = '';
    if (team.variance != null) {
      const varStyle = Math.abs(team.variance) < 300 ? 'color:var(--success);font-weight:700' : '';
      varianceDisplay = '<span style="' + varStyle + '"> | Variance: ' + (team.variance >= 0 ? '+' : '') + formatTime(team.variance) + '</span>';
    }

    // R7: Total = PB sum, Target = Total + Start
    const totalPBDisplay = team.target_time ? 'Total: ' + formatWhole(team.target_time) : '';
    const targetCalcDisplay = team.target_time ? 'Target: ' + formatWhole(team.target_time + (team.start_delay || 0)) : '';
    const startDisplay = '⏱️ Start: ' + formatWhole(team.start_delay || 0) + ' s';

    // R7: Gold/Silver/Bronze for place in header
    let placeBadge = '';
    if (team.place === 1) placeBadge = '<span style="background:#FFD700;color:#333;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px">🥇</span>';
    else if (team.place === 2) placeBadge = '<span style="background:#C0C0C0;color:#333;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px">🥈</span>';
    else if (team.place === 3) placeBadge = '<span style="background:#CD7F32;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:8px">🥉</span>';

    const colCount = 2 + (showStroke ? 1 : 0) + 1 + (showSplits ? 1 : 0) + (showPogoTimes ? 3 : 0);
    const headerBg = team.place ? '#e8f5e9' : '#e0f2f1';
    const totalRowStyle = 'background:#c62828;color:white;font-weight:700;font-size:16px';
    const splitHeader = showSplits ? '<th>Result</th>' : '';
    const pogoHeaders = showPogoTimes ? '<th style="min-width:70px">T1</th><th style="min-width:70px">T2</th><th style="min-width:70px;background:#e8f5e9">Avg</th>' : '';
    // R8: Variance moved to right side of Team Total row
    const varCell = team.variance != null ? '<td style="' + totalRowStyle + ';text-align:right;padding:8px 16px">' + (team.variance >= 0 ? '+' : '') + formatTime(team.variance) + '</td>' : '<td style="' + totalRowStyle + '">—</td>';
    html += '<div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;border:4px solid #0b3d91"><div style="background:' + headerBg + ';padding:8px 16px;font-weight:700;font-size:15px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid #0b3d91"><span>' + teamHeader + placeBadge + '</span><span style="display:flex;align-items:center;gap:12px"><span style="background:rgba(11,61,145,0.15);padding:6px 14px;border-radius:20px;font-weight:700;font-size:16px;color:#0b3d91">' + startDisplay + '</span><span style="font-weight:400;font-size:13px;color:#666">' + (totalPBDisplay ? totalPBDisplay + ' ' : '') + (targetCalcDisplay ? '• ' + targetCalcDisplay : '') + '</span></span></div><table class="spreadsheet-table" style="margin:0"><thead><tr><th style="width:50px">Leg</th><th style="text-align:left;min-width:140px">Swimmer</th>' + (showStroke ? '<th>Stroke</th>' : '') + '<th>PB</th>' + splitHeader + pogoHeaders + '</tr></thead><tbody>' + rows + '<tr style="' + totalRowStyle + '"><td></td><td colspan="' + (colCount - 3) + '" style="text-align:right">Team Total</td>' + totalTimeCell + varCell + '</tr></tbody></table></div>';
  }

  return html;
}

// getRelayPBForResults → use shared getRelayPB from format.js
function getRelayPBForResults(member, raceType) { return getRelayPB(member, raceType); }

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

// ── Consolidated Breaker Report (NF-2) — all breakers on one page ──

async function loadConsolidatedBreakers() {
  const section = document.getElementById('consolidated-breakers-section');
  if (!section) return;
  try {
    const breakers = await API.getAllBreakers();
    if (!breakers || breakers.length === 0) {
      section.innerHTML = '';
      return;
    }
    // Group by event date + stroke
    const groups = {};
    breakers.forEach(b => {
      const key = b.event_date + ' — ' + b.stroke.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });

    let html = `<div class="card" style="margin-top:24px;border:3px solid var(--success)">
      <h3 style="color:var(--success);margin-bottom:12px">🏆 All Breakers (Consolidated)</h3>`;
    
    for (const [groupName, items] of Object.entries(groups)) {
      html += `<div style="margin-bottom:16px">
        <h4 style="color:var(--primary);margin:8px 0">${groupName}</h4>
        <table class="spreadsheet-table" style="font-size:14px"><thead><tr>
          <th style="text-align:left">Swimmer</th><th>Previous PB</th><th>New Time</th><th>Improvement</th>
        </tr></thead><tbody>`;
      items.forEach(b => {
        html += `<tr>
          <td style="text-align:left;font-weight:600">${b.member_name}</td>
          <td>${formatTime(b.old_pb)}</td>
          <td style="font-weight:700;color:var(--success)">${formatTime(b.new_time)}</td>
          <td style="font-weight:700;color:var(--success)">-${formatTime(b.improvement)}</td>
        </tr>`;
      });
      html += '</tbody></table></div>';
    }
    html += '</div>';
    section.innerHTML = html;
  } catch (e) { console.error('Failed to load consolidated breakers:', e); }
}

// ── Readout Mode (UX-1) — large font view for poolside announcements ──

function showReadout() {
  if (!resSelectedRace) return;
  const race = resSelectedRace;
  const isRelay = isResRaceRelay(race);

  let rows = '';
  if (isRelay) {
    const teams = (race.relay_teams || []).slice().sort((a, b) => (a.place || 99) - (b.place || 99));
    teams.forEach(t => {
      rows += `<tr>
        <td style="font-size:32px;font-weight:800;color:var(--primary)">${t.place ? ordinal(t.place) : '—'}</td>
        <td style="font-size:28px;font-weight:700">${t.team_name || 'Team ' + t.team_number}</td>
        <td style="font-size:28px">${t.total_time != null ? formatTime(t.total_time) : '—'}</td>
        <td></td>
      </tr>`;
    });
  } else {
    const allLanes = [];
    (race.heats || []).forEach(h => {
      h.lanes.forEach(l => {
        if (l.finish_time != null) {
          const isBreak = l.variance != null && l.variance <= -100;
          allLanes.push({ ...l, heat_number: h.heat_number, isBreak });
        }
      });
    });
    allLanes.sort((a, b) => {
      const pa = a.manual_place || a.place || 99;
      const pb = b.manual_place || b.place || 99;
      return pa - pb || a.net_time - b.net_time;
    });
    allLanes.forEach((l, i) => {
      const place = l.manual_place || l.place || (i + 1);
      rows += `<tr style="${l.isBreak ? 'background:#e8f5e9' : ''}">
        <td style="font-size:32px;font-weight:800;color:var(--primary)">${ordinal(place)}</td>
        <td style="font-size:28px;font-weight:700">${l.name}</td>
        <td style="font-size:28px">${formatTime(l.net_time)}</td>
        <td style="font-size:24px;font-weight:700;color:${l.isBreak ? 'var(--success)' : '#999'}">${l.isBreak ? '🏆 BREAK' : ''}</td>
      </tr>`;
    });
  }

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  overlay.innerHTML = `
    <div style="background:white;width:95vw;max-width:700px;border-radius:16px;padding:24px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="margin:0;font-size:24px">📢 Results Readout</h2>
        <button class="btn btn-outline" onclick="hideModal()" style="font-size:18px">✕ Close</button>
      </div>
      <div style="text-align:center;margin-bottom:16px;font-size:20px;color:var(--primary);font-weight:700">${race.race_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="border-bottom:3px solid var(--primary)">
          <th style="text-align:left;padding:8px;font-size:18px">Place</th>
          <th style="text-align:left;padding:8px;font-size:18px">Name</th>
          <th style="text-align:left;padding:8px;font-size:18px">Time</th>
          <th style="text-align:left;padding:8px;font-size:18px">Break</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
