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
  // Filter to individual races (not relays for now)
  resRaces = allRaces.filter(r => ['25m','50m','75m','backstroke','breaststroke','butterfly'].includes(r.race_type));
  resHasRelays = allRaces.some(r => ['25m_relay','25m_brace','50m_brace','medley_relay','pogo'].includes(r.race_type));

  if (resRaces.length === 0) {
    el.innerHTML = `<h1>Results</h1><div class="card"><p>No races with heats yet. <a href="#" onclick="navigate('heat-builder')">Build heats first.</a></p></div>
    ${resHasRelays ? '<div class="card" style="text-align:center"><button class="btn btn-accent" onclick="navigate(\'relays\')">🏊 View Relays →</button></div>' : ''}`;
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
      ${resHasRelays ? '<button class="btn btn-accent" onclick="navigate(\'relays\')">🏊 Relays →</button>' : ''}
    </div>

    <div class="toolbar">
      <select class="form-control" style="max-width:300px" onchange="selectResRace(this.value)">
        ${resRaces.map(r => `<option value="${r.id}" ${r.id === race.id ? 'selected' : ''}>${RACE_LABELS[r.race_type] || r.race_type} ${r.heats.some(h => h.lanes.some(l => l.finish_time != null)) ? '✓' : ''}</option>`).join('')}
      </select>
      ${!resFinalized ? `
        <button class="btn btn-primary" onclick="calculateResults()" ${!anyTimesEntered ? 'disabled' : ''}>📊 Calculate Results</button>
        <button class="btn btn-success" onclick="doFinalizeEvent(${allTimesEntered ? 'true' : 'false'})">✅ Finalize Event</button>
      ` : ''}
      ${resFinalized && !resCompleted ? `
        <button class="btn btn-accent" onclick="doCompleteEvent()">📦 Complete & Archive</button>
      ` : ''}
    </div>

    ${resHasRelays && !resFinalized ? '<div class="card" style="background:#e3f2fd;text-align:center;padding:10px"><span style="color:var(--primary)">📋 Relay results are on a separate screen →</span> <button class="btn btn-accent" onclick="navigate(\'relays\')" style="margin-left:8px;min-height:32px;padding:4px 12px">🏊 View Relays</button></div>' : ''}
    ${resFinalized ? '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">✓ Event Finalized — PBs updated, breakers recorded</strong></div>' : ''}
    ${resCompleted ? '<div class="card" style="background:#e0e0e0;text-align:center;padding:12px"><strong>📦 Event Archived</strong></div>' : ''}

    <!-- Results Table -->
    <div style="overflow-x:auto;margin-bottom:16px">
      ${renderResultsTable(race)}
    </div>

    <!-- Breakers Section -->
    <div id="breakers-section"></div>
  `;

  // Load breakers if finalized
  if (resFinalized) {
    loadBreakers();
  }
}

function renderResultsTable(race) {
  let rows = '';

  for (const heat of race.heats) {
    const maxTime = heat.lanes.length > 0 ? Math.max(...heat.lanes.map(l => l.handicap_time)) : 0;

    for (let li = 0; li < heat.lanes.length; li++) {
      const lane = heat.lanes[li];
      const heatCell = li === 0
        ? `<td rowspan="${heat.lanes.length}" style="font-weight:700;font-size:16px;vertical-align:middle;background:#e0f2f1">Heat ${heat.heat_number}</td>`
        : '';

      const hasTime = lane.finish_time != null;
      const isBreak = lane.is_break === 1;
      const breakCls = isBreak ? ' break-cell' : '';

      // Finish time cell — clickable if not finalized
      let finishCell;
      if (resFinalized) {
        finishCell = `<td class="time-cell${breakCls}" style="font-weight:700">${hasTime ? lane.finish_time + 's' : '—'}</td>`;
      } else {
        finishCell = `<td class="time-input${breakCls}" onclick="enterFinishTime(${heat.id}, ${lane.id}, ${lane.finish_time || 0})" style="cursor:pointer;font-weight:700">${hasTime ? lane.finish_time + 's' : '⏱️ Tap'}</td>`;
      }

      // Place display with manual override
      let placeCell;
      if (resFinalized || !hasTime) {
        placeCell = `<td style="font-weight:700;color:var(--primary)">${lane.place ? ordinal(lane.place) : '—'}</td>`;
      } else {
        placeCell = `<td>
          <select class="place-select" onchange="overridePlace(${heat.id}, ${lane.id}, this.value)" onclick="event.stopPropagation()">
            <option value="" ${!lane.place ? 'selected' : ''}>—</option>
            <option value="1" ${lane.place === 1 ? 'selected' : ''}>1st</option>
            <option value="2" ${lane.place === 2 ? 'selected' : ''}>2nd</option>
            <option value="3" ${lane.place === 3 ? 'selected' : ''}>3rd</option>
            <option value="4" ${lane.place === 4 ? 'selected' : ''}>4th</option>
          </select>
        </td>`;
      }

      rows += `<tr class="${isBreak ? 'break-row' : ''}">
        ${heatCell}
        <td>${lane.lane_number}</td>
        <td class="name-cell">${lane.name}</td>
        <td class="time-cell">${lane.handicap_time}s</td>
        <td class="time-cell">${lane.start_delay}s</td>
        ${finishCell}
        <td class="time-cell">${hasTime ? lane.net_time + 's' : '—'}</td>
        <td class="time-cell" style="${hasTime && lane.variance < 0 ? 'color:var(--success);font-weight:700' : ''}">${hasTime ? (lane.variance >= 0 ? '+' : '') + lane.variance + 's' : '—'}</td>
        ${placeCell}
        <td style="text-align:center">${isBreak ? '🏆' : ''}</td>
      </tr>`;
    }
  }

  return `
    <table class="spreadsheet-table">
      <thead>
        <tr>
          <th>Heat</th>
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
  `;
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

// ── Actions ─────────────────────────────────────────

function selectResRace(raceId) {
  resSelectedRace = resRaces.find(r => r.id === parseInt(raceId));
  drawResults();
}

function enterFinishTime(heatId, laneId, currentValue) {
  showNumpad(currentValue || '', async (value) => {
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
  confirmDialog('Calculate Results?', 'This will rank swimmers by finish time for all heats in this race.', async () => {
    const result = await API.rankRace(resSelectedRace.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    renderResults();
  });
}

async function doFinalizeEvent(allComplete) {
  // F1: Count swimmers without times across ALL individual races
  let missingCount = 0;
  for (const race of resRaces) {
    if (!race.heats) continue;
    for (const heat of race.heats) {
      for (const lane of heat.lanes) {
        if (lane.finish_time == null) missingCount++;
      }
    }
  }

  const warningText = missingCount > 0
    ? `⚠️ ${missingCount} swimmer${missingCount !== 1 ? 's have' : ' has'} no finish time and will be skipped.\n\nThis will update PBs for any record breakers and lock the results. This cannot be undone.`
    : 'This will update PBs for any record breakers and lock the results. This cannot be undone.';

  confirmDialog('Finalize Event?', warningText, async () => {
    const result = await API.finalizeEvent(resEvent.id);
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    alert(`Event finalized! ${result.breakers_count} record breaker${result.breakers_count !== 1 ? 's' : ''} found.${missingCount > 0 ? ' (' + missingCount + ' swimmers without times were skipped)' : ''}`);
    renderResults();
  });
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
      <td class="time-cell" style="font-weight:700;color:var(--success)">${b.new_pb}s</td>
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

// Race labels: uses RACE_LABELS from heat-builder.js (loaded before this file)
