/**
 * WWSC — Heat Builder Screen
 * Generate, Preview, Reshuffle, Confirm heats
 */
let hbRaces = [];
let hbSelectedRace = null;
let hbPreviewHeats = null;
let hbConfirmed = false;

async function renderHeatBuilder() {
  const event = await API.getCurrentEvent();
  const el = document.getElementById('content');

  if (!event) {
    el.innerHTML = `<h1>Heat Builder</h1><div class="card"><p>No active event. <a href="#" onclick="navigate('event-setup')">Set up an event first.</a></p></div>`;
    return;
  }

  hbRaces = await API.getRaces(event.id);
  // Filter to individual races only (not relays)
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

  // Auto-load saved heats if already confirmed
  if (hbSelectedRace.status === 'heats_generated' && !hbPreviewHeats) {
    hbPreviewHeats = await loadSavedHeats(hbSelectedRace.id);
    hbConfirmed = true;
  }

  drawHeatBuilder(individualRaces);
}

function drawHeatBuilder(races) {
  const el = document.getElementById('content');
  const raceLabels = { '25m': '25m Freestyle', '50m': '50m Freestyle', '75m': '75m Freestyle', 'backstroke': 'Backstroke', 'breaststroke': 'Breaststroke', 'butterfly': 'Butterfly' };

  el.innerHTML = `
    <h1>Heat Builder</h1>

    <div class="toolbar">
      <select class="form-control" style="max-width:300px" onchange="selectHBRace(this.value)">
        ${races.map(r => `<option value="${r.id}" ${r.id === hbSelectedRace.id ? 'selected' : ''}>${raceLabels[r.race_type] || r.race_type} ${r.status === 'heats_generated' ? '✓' : ''}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-lg" onclick="generateHBHeats()">🔀 Generate Heats</button>
      ${hbPreviewHeats ? `<button class="btn btn-accent btn-lg" onclick="generateHBHeats()">🔄 Shuffle Again</button>` : ''}
    </div>

    <div id="hb-heats">
      ${hbPreviewHeats ? renderHeatPreview(hbPreviewHeats) : '<div class="card"><p>Select an event and tap "Generate Heats" to create randomised heat assignments.</p></div>'}
    </div>

    ${hbPreviewHeats && hbPreviewHeats.length > 0 && !hbConfirmed ? `
      <div class="quick-actions" style="margin-top:16px">
        <button class="btn btn-success btn-lg btn-block" onclick="confirmHBHeats()">✓ Confirm Heats</button>
      </div>
    ` : ''}
    ${hbConfirmed ? '<div class="card" style="background:#e8f5e9;text-align:center;margin-bottom:12px"><h2 style="color:var(--success)">✓ Heats Confirmed — Ready for Pool!</h2><p>Show this screen at poolside. Tap "Generate Heats" to reshuffle.</p></div>' : ''}
  `;
}

function renderHeatPreview(heats) {
  if (!heats || heats.length === 0) return '<div class="card"><p>No eligible swimmers for this event (no PB times or nobody present).</p></div>';

  return heats.map(h => `
    <div class="heat-card">
      <div class="heat-card-header">Heat ${h.heat_number} — ${h.lanes.length} swimmer${h.lanes.length !== 1 ? 's' : ''}</div>
      ${h.lanes.map(l => `
        <div class="heat-lane">
          <div class="lane-num">${l.lane_number}</div>
          <div class="lane-name">${l.name}</div>
          <div class="lane-delay">+${l.start_delay}s</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

async function selectHBRace(raceId) {
  hbSelectedRace = hbRaces.find(r => r.id === parseInt(raceId));
  hbPreviewHeats = null;
  hbConfirmed = false;
  // If heats already confirmed for this race, load them
  if (hbSelectedRace.status === 'heats_generated') {
    hbPreviewHeats = await loadSavedHeats(hbSelectedRace.id);
    hbConfirmed = true;
  }
  renderHeatBuilder();
}

async function generateHBHeats() {
  const result = await API.generateHeats(hbSelectedRace.id);
  if (result.warning) {
    alert(result.warning);
  }
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

// Load saved heats from DB for confirmed races
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
