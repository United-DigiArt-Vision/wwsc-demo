/**
 * WWSC — Results Screen
 * Enter times, review & finalize, breakers report
 */
let resEvent = null;
let resRaces = [];
let resSelectedRaceIdx = 0;
let resBreakers = [];
let resFinalized = false;

function toast(msg) {
  if (window.showToast) window.showToast(msg);
  else console.log('[Toast]', msg);
}

function formatTime(seconds) {
  if (seconds == null) return '—';
  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(seconds);
  return `${sign}${abs}s`;
}

function pbColumn(raceType) {
  const map = {
    '25m': 'time_25m', '50m': 'time_50m', '75m': 'time_75m',
    'backstroke': 'time_backstroke', 'breaststroke': 'time_breaststroke', 'butterfly': 'time_butterfly'
  };
  return map[raceType] || null;
}

const raceLabels = {
  '25m': '25m', '50m': '50m', '75m': '75m',
  'backstroke': 'Back', 'breaststroke': 'Breast', 'butterfly': 'Fly'
};

async function renderResults() {
  const content = document.getElementById('content');

  resEvent = await API.getCurrentEvent();
  if (!resEvent) {
    content.innerHTML = `<h1>🏆 Results</h1><div class="card"><p>No active event. <a href="#" onclick="navigate('event-setup')">Set up an event first.</a></p></div>`;
    return;
  }

  resFinalized = (resEvent.status === 'finalized' || resEvent.status === 'completed');
  resRaces = await API.getResults(resEvent.id);

  // Filter to individual races only
  resRaces = resRaces.filter(r => ['25m','50m','75m','backstroke','breaststroke','butterfly'].includes(r.race_type));

  if (resRaces.length === 0) {
    content.innerHTML = `<h1>🏆 Results</h1><div class="card"><p>No races with heats found. <a href="#" onclick="navigate('heat-builder')">Generate heats first.</a></p></div>`;
    return;
  }

  // Clamp selected race index
  if (resSelectedRaceIdx >= resRaces.length) resSelectedRaceIdx = 0;

  if (resFinalized) {
    resBreakers = await API.getBreakers(resEvent.id);
    drawBreakersReport();
  } else {
    drawTimesEntry();
  }
}

function drawTimesEntry() {
  const content = document.getElementById('content');
  const race = resRaces[resSelectedRaceIdx];
  const pbCol = pbColumn(race.race_type);

  // Stats
  let totalLanes = 0, filledLanes = 0, potentialBreakers = 0;
  resRaces.forEach(r => {
    r.heats.forEach(h => {
      h.lanes.forEach(l => {
        totalLanes++;
        if (l.finish_time != null) filledLanes++;
        if (l.is_break) potentialBreakers++;
      });
    });
  });
  const allFilled = totalLanes > 0 && filledLanes === totalLanes;

  content.innerHTML = `
    <h1>🏆 Results — Enter Times</h1>

    <div class="toolbar">
      ${resRaces.map((r, i) => `
        <button class="btn ${i === resSelectedRaceIdx ? 'btn-primary' : 'btn-outline'}" 
          onclick="selectResultsRace(${i})" style="min-width:60px">${raceLabels[r.race_type] || r.race_type}</button>
      `).join('')}
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${filledLanes}/${totalLanes}</div><div class="stat-label">Times Entered</div></div>
      <div class="stat-card"><div class="stat-value">${potentialBreakers}</div><div class="stat-label">Potential Breakers</div></div>
    </div>

    <div id="res-heats">
      ${race.heats.length === 0 ? '<div class="card"><p>No heats for this race. <a href="#" onclick="navigate(\'heat-builder\')">Generate heats.</a></p></div>' : ''}
      ${race.heats.map(h => renderResultHeat(h, race.race_type, pbCol)).join('')}
    </div>

    <div class="quick-actions" style="margin-top:20px">
      <button class="btn btn-success btn-lg btn-block" onclick="reviewAndFinalize()" ${allFilled ? '' : 'disabled'}>
        ✅ Finalize Event ${allFilled ? '' : `(${totalLanes - filledLanes} times missing)`}
      </button>
    </div>
  `;
}

function renderResultHeat(heat, raceType, pbCol) {
  const allEntered = heat.lanes.every(l => l.finish_time != null);

  return `
    <div class="heat-card">
      <div class="heat-card-header">
        Heat ${heat.heat_number} — ${heat.lanes.length} swimmer${heat.lanes.length !== 1 ? 's' : ''}
        ${allEntered ? ' ✅' : ''}
      </div>
      ${heat.lanes.map(l => {
        const pb = pbCol ? l[pbCol] : l.handicap_time;
        const hasTime = l.finish_time != null;
        const isBreak = l.is_break === 1;
        const borderStyle = hasTime ? (isBreak ? 'border-left:4px solid var(--success)' : 'border-left:4px solid var(--danger)') : '';

        return `
          <div class="heat-lane" style="cursor:pointer;${borderStyle}" onclick="enterTime(${heat.id}, ${l.id}, ${l.finish_time || 0})">
            <div class="lane-num">${l.lane_number}</div>
            <div class="lane-name">
              <div>${l.name}</div>
              <div style="font-size:12px;color:var(--text-secondary)">PB: ${formatTime(pb)} · Delay: +${l.start_delay}s</div>
            </div>
            <div style="text-align:right;min-width:100px">
              ${hasTime ? `
                <div style="font-size:20px;font-weight:700;color:${isBreak ? 'var(--success)' : 'var(--text)'}">${formatTime(l.finish_time)}</div>
                <div style="font-size:12px;color:var(--text-secondary)">Net: ${formatTime(l.net_time)}</div>
                <div style="font-size:12px;color:${l.variance < 0 ? 'var(--success)' : 'var(--danger)'}">${l.variance > 0 ? '+' : ''}${formatTime(l.variance)}</div>
              ` : `
                <div style="font-size:16px;color:var(--inactive)">Tap to enter</div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function selectResultsRace(idx) {
  resSelectedRaceIdx = idx;
  renderResults();
}

function enterTime(heatId, laneId, currentValue) {
  if (resFinalized) return;
  showNumpad(currentValue ? String(currentValue) : '', async (value) => {
    if (value == null) return;
    const result = await API.saveTime(heatId, laneId, value);
    if (result.error) { toast('Error: ' + result.error); return; }
    toast(`Time saved: ${value}s (Net: ${result.net_time}s)`);
    renderResults();
  });
}

async function reviewAndFinalize() {
  // Count stats
  let totalSwimmers = 0, totalHeats = 0, potentialBreakers = 0;
  resRaces.forEach(r => {
    r.heats.forEach(h => {
      totalHeats++;
      h.lanes.forEach(l => {
        totalSwimmers++;
        if (l.is_break) potentialBreakers++;
      });
    });
  });

  // Rank all races first
  for (const race of resRaces) {
    await API.rankRace(race.id);
  }

  confirmDialog(
    'Finalize Event?',
    `<strong>${totalSwimmers}</strong> swimmers across <strong>${totalHeats}</strong> heats.<br><strong>${potentialBreakers}</strong> potential record breakers.<br><br>This will update PBs and save time history. Continue?`,
    async () => {
      const result = await API.finalizeEvent(resEvent.id);
      if (result.error) { toast('Error: ' + result.error); return; }
      toast(`🏆 Event finalized! ${result.breakers_count} records broken!`);
      renderResults();
    }
  );
}

function drawBreakersReport() {
  const content = document.getElementById('content');
  const isCompleted = resEvent.status === 'completed';

  content.innerHTML = `
    <h1>🏆 Breakers Report</h1>
    <p style="color:var(--text-secondary);margin-bottom:16px">Event ${resEvent.date} — ${isCompleted ? 'Completed ✅' : 'Finalized'}</p>

    ${resBreakers.length === 0 ? '<div class="card"><p>No records broken this week.</p></div>' : `
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>🏆</th>
              <th>Swimmer</th>
              <th>Stroke</th>
              <th>Old PB</th>
              <th>New PB</th>
              <th>Improved</th>
            </tr>
          </thead>
          <tbody>
            ${resBreakers.map(b => `
              <tr>
                <td>🏆</td>
                <td>${b.member_name}</td>
                <td>${raceLabels[b.stroke] || b.stroke}</td>
                <td>${formatTime(b.old_pb)}</td>
                <td style="color:var(--success);font-weight:700">${formatTime(b.new_pb)}</td>
                <td style="color:var(--success)">-${b.improvement}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}

    ${!isCompleted ? `
      <div class="quick-actions" style="margin-top:20px">
        <button class="btn btn-primary btn-lg btn-block" onclick="completeAndArchive()">📦 Complete & Archive Event</button>
      </div>
    ` : `
      <div class="card" style="background:#e8f5e9;text-align:center">
        <h2 style="color:var(--success)">✅ Event Completed & Archived</h2>
      </div>
    `}

    <h2 style="margin-top:24px">📊 All Times</h2>
    ${resRaces.map(race => `
      ${race.heats.map(h => renderResultHeat(h, race.race_type, pbColumn(race.race_type))).join('')}
    `).join('')}
  `;
}

async function completeAndArchive() {
  confirmDialog('Complete Event?', 'This will archive the event. You won\'t be able to modify times.', async () => {
    const result = await API.completeEvent(resEvent.id);
    if (result.error) { toast('Error: ' + result.error); return; }
    toast('📦 Event completed and archived!');
    renderResults();
  });
}
