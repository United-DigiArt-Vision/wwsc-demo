/**
 * WWSC — Heat Builder Screen (Excel-Style Table Layout)
 * All heats visible on one page, spreadsheet format.
 */
let hbRaces = [];
let hbSelectedRace = null;
let hbPreviewHeats = null;
let hbConfirmed = false;

const RACE_LABELS = {
  '25m': '25m Freestyle', '50m': '50m Freestyle', '75m': '75m Freestyle',
  'backstroke': 'Backstroke', 'breaststroke': 'Breaststroke', 'butterfly': 'Butterfly',
  '25m_relay': '25m Team Relay', '25m_brace': '25m Brace Relay',
  '50m_brace': '50m Brace Relay', 'medley_relay': 'Medley Relay', 'pogo': 'Pogo'
};

async function renderHeatBuilder() {
  const event = await API.getCurrentEvent();
  const el = document.getElementById('content');

  if (!event) {
    el.innerHTML = `<h1>Heat Builder</h1><div class="card"><p>No active event. <a href="#" onclick="navigate('event-setup')">Set up an event first.</a></p></div>`;
    return;
  }

  hbRaces = await API.getRaces(event.id);
  const individualRaces = hbRaces.filter(r => ['25m','50m','75m','backstroke','breaststroke','butterfly'].includes(r.race_type));

  if (individualRaces.length === 0) {
    el.innerHTML = `<h1>Heat Builder</h1><div class="card"><p>No individual events selected. <a href="#" onclick="navigate('event-setup')">Go to Event Setup.</a></p></div>`;
    return;
  }

  if (!hbSelectedRace || !individualRaces.find(r => r.id === hbSelectedRace.id)) {
    hbSelectedRace = individualRaces[0];
    hbPreviewHeats = null;
    hbConfirmed = false;
  }

  if (hbSelectedRace.status === 'heats_generated' && !hbPreviewHeats) {
    hbPreviewHeats = await loadSavedHeats(hbSelectedRace.id);
    hbConfirmed = true;
  }

  drawHeatBuilder(individualRaces);
}

function drawHeatBuilder(races) {
  const el = document.getElementById('content');

  el.innerHTML = `
    <h1>Heat Builder</h1>

    <div class="toolbar">
      <select class="form-control" style="max-width:300px" onchange="selectHBRace(this.value)">
        ${races.map(r => `<option value="${r.id}" ${r.id === hbSelectedRace.id ? 'selected' : ''}>${RACE_LABELS[r.race_type] || r.race_type} ${r.status === 'heats_generated' ? '✓' : ''}</option>`).join('')}
      </select>
      <button class="btn btn-primary" onclick="generateHBHeats()">🔀 Generate Heats</button>
      ${hbPreviewHeats ? `<button class="btn btn-accent" onclick="generateHBHeats()">🔄 Shuffle</button>` : ''}
      ${hbPreviewHeats && hbPreviewHeats.length > 0 && !hbConfirmed ? `<button class="btn btn-success" onclick="confirmHBHeats()">✓ Confirm Heats</button>` : ''}
    </div>

    ${hbConfirmed ? '<div class="card" style="background:#e8f5e9;text-align:center;padding:12px"><strong style="color:var(--success)">✓ Heats Confirmed — Ready for Pool!</strong></div>' : ''}

    <div id="hb-heats">
      ${hbPreviewHeats ? renderHeatTable(hbPreviewHeats) : '<div class="card"><p>Select an event and tap "Generate Heats" to create randomised heat assignments.</p></div>'}
    </div>
  `;
}

function renderHeatTable(heats) {
  if (!heats || heats.length === 0) return '<div class="card"><p>No eligible swimmers (no PB times or nobody present).</p></div>';

  let rows = '';
  for (const heat of heats) {
    const maxTime = Math.max(...heat.lanes.map(l => l.handicap_time));
    for (let li = 0; li < 4; li++) {
      const lane = heat.lanes[li];
      const heatCell = li === 0
        ? `<td rowspan="4" style="font-weight:700;font-size:16px;vertical-align:middle;background:#e0f2f1">Heat ${heat.heat_number}</td>`
        : '';
      if (lane) {
        rows += `<tr>
          ${heatCell}
          <td>${lane.lane_number}</td>
          <td class="name-cell">${lane.name}</td>
          <td>${lane.handicap_time}s</td>
          <td>${maxTime}s</td>
          <td style="font-weight:700;color:var(--accent)">+${lane.start_delay}s</td>
        </tr>`;
      } else {
        rows += `<tr>
          ${heatCell}
          <td>${li + 1}</td>
          <td class="name-cell" style="color:#999;font-style:italic">— empty —</td>
          <td></td><td></td><td></td>
        </tr>`;
      }
    }
  }

  return `
    <table class="spreadsheet-table">
      <thead>
        <tr>
          <th>Heat</th>
          <th style="width:50px">Lane</th>
          <th style="text-align:left;min-width:150px">Swimmer</th>
          <th>PB Time</th>
          <th>Max Time</th>
          <th>Start Delay</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function selectHBRace(raceId) {
  hbSelectedRace = hbRaces.find(r => r.id === parseInt(raceId));
  hbPreviewHeats = null;
  hbConfirmed = false;
  if (hbSelectedRace.status === 'heats_generated') {
    hbPreviewHeats = await loadSavedHeats(hbSelectedRace.id);
    hbConfirmed = true;
  }
  renderHeatBuilder();
}

async function generateHBHeats() {
  const result = await API.generateHeats(hbSelectedRace.id);
  if (result.warning) alert(result.warning);
  hbPreviewHeats = result.heats;
  hbConfirmed = false;
  renderHeatBuilder();
}

async function confirmHBHeats() {
  if (!hbPreviewHeats || hbPreviewHeats.length === 0) return;
  await API.confirmHeats(hbSelectedRace.id, hbPreviewHeats);
  hbConfirmed = true;
  renderHeatBuilder();
}

async function loadSavedHeats(raceId) {
  const res = await fetch(`/api/races/${raceId}/heats`);
  const heats = await res.json();
  if (!heats.length) return null;
  return heats.map(h => ({
    heat_number: h.heat_number,
    lanes: h.lanes.map(l => ({
      lane_number: l.lane_number,
      name: l.name,
      member_id: l.member_id,
      handicap_time: l.handicap_time,
      start_delay: l.start_delay
    }))
  }));
}
