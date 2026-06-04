/**
 * WWSC — Member Graph Modal (M3 R-M3-05).
 *
 * Renders per-swimmer time-trend graphs based on the v2.9.0 M2 time_history
 * archive. Pure SVG; no external chart library; consistent with the existing
 * vanilla-JS stack.
 *
 * Two graph types per Bryan 2026-05-20 inbound + QA-08 (minimum working
 * assumption A + B, the only two M3 graph types this branch ships):
 *   • TIME-TREND (A): X = event date, Y = finish-time, one line per stroke,
 *     dotted lines connect time points; PB-break events get a 🏆 chip.
 *   • PB-PROGRESSION (B): X = event date, Y = previous_best value at that
 *     event, steps down on PB-break events.
 *
 * Other graph types (variance scatter, attendance heatmap, place histogram)
 * are catalogued in QA-08 but not shipped until Bryan picks them — per
 * Balerion's 2026-05-29 ambiguity rule "Only implement unambiguous items.
 * Do not guess unresolved scoring/reporting/constitution behavior".
 *
 * Empty state and one-row state are both designed so the UI never crashes
 * on no/sparse data (UIT-M3-005, UIT-M3-006).
 *
 * Data source: GET /api/members/:id/time-history (already exists from M2).
 */

// Friendly stroke labels for the legend / picker.
function memberGraphStrokeLabel(stroke) {
  if (!stroke) return '—';
  const map = {
    '25m': '25m', '50m': '50m', '75m': '75m',
    backstroke: 'Backstroke',
    breaststroke: 'Breaststroke',
    butterfly: 'Butterfly'
  };
  return map[stroke] || stroke;
}

// Stable color per stroke. Color-blind-safe palette (Bang Wong 2011).
const MEMBER_GRAPH_STROKE_COLORS = {
  '25m':            '#0072B2',
  '50m':            '#D55E00',
  '75m':            '#009E73',
  backstroke:       '#CC79A7',
  breaststroke:     '#E69F00',
  butterfly:        '#56B4E9'
};
function memberGraphStrokeColor(stroke) {
  return MEMBER_GRAPH_STROKE_COLORS[stroke] || '#666666';
}

// Format an ISO date YYYY-MM-DD into "DD MMM" for the X-axis labels (short
// form keeps mobile readable; full date stays available on hover/tooltip).
function memberGraphShortDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch (e) { return iso; }
}

// Convert centiseconds → "X.XX" using the shared format helper. Defensive
// against null so the SVG annotation never says "null" or "NaN".
function memberGraphTimeText(cs) {
  return cs == null ? '' : (typeof formatTime === 'function' ? formatTime(cs) : String(cs));
}

// Build one SVG `<polyline>` + per-point `<circle>` overlay for a single
// stroke series. Returns an SVG string fragment.
function memberGraphBuildSeries(seriesRows, options) {
  const { xScale, yScale, color, stroke } = options;
  // Filter rows that have a numeric time. Already chronologically ASC because
  // we sorted before calling.
  const pts = seriesRows.filter(r => typeof r.time === 'number');
  if (pts.length === 0) return '';
  const coords = pts.map(r => [xScale(r.event_date), yScale(r.time)]);
  const polyline = '<polyline fill="none" stroke="' + color + '" stroke-width="2" points="' +
    coords.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ') +
    '" data-stroke-series="' + stroke + '"/>';
  const dots = pts.map((r, i) => {
    const [x, y] = coords[i];
    const isBreak = !!r.is_break;
    const radius = isBreak ? 6 : 4;
    const fill = isBreak ? '#2e7d32' : color;
    const tooltip = memberGraphStrokeLabel(stroke) + ' · ' + r.event_date + ' · ' + memberGraphTimeText(r.time) + (isBreak ? ' · PB Break' : '');
    // data-* attributes expose the exact stored row behind each plotted point
    // so automated tests (and a curious inspector) can verify the chart is not
    // lying about the underlying time_history rows. Required by Balerion's
    // R-M3-05 QA fix #3 (exact point/date/time/PB mapping, not just dot count).
    const pbCs = r.previous_best != null ? r.previous_best * 100 : null;
    return '<circle data-series-pt="' + stroke +
      '" data-date="' + (r.event_date || '') +
      '" data-time-cs="' + (typeof r.time === 'number' ? r.time : '') +
      '" data-time-text="' + memberGraphTimeText(r.time) +
      '" data-pb-cs="' + (pbCs == null ? '' : pbCs) +
      '" data-is-break="' + (isBreak ? '1' : '0') +
      '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + radius + '" fill="' + fill + '" stroke="white" stroke-width="1"><title>' +
      tooltip.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</title></circle>';
  }).join('');
  return polyline + dots;
}

// Restrict rows to an inclusive [fromDate, toDate] ISO window (either bound
// optional). Local to this graph view — NOT the QA-04 global Reports/CSV
// slicer, which is a separate, still-blocked decision. This filter only
// changes which of THIS swimmer's already-fetched rows are plotted.
function memberGraphApplyDateRange(rows, opts) {
  if (!opts) return rows;
  const from = opts.fromDate || null;
  const to = opts.toDate || null;
  if (!from && !to) return rows;
  return rows.filter(r => {
    const d = r.event_date || '';
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

// Render the per-stroke time-trend graph (graph type A from QA-08).
function memberGraphRenderTimeTrend(rowsInput, container, opts) {
  // Apply the optional date-range window first (UIT-M3-007 / UIT-M3-008).
  const rows = memberGraphApplyDateRange(rowsInput, opts);
  if (rows.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">No history rows in the selected date range.</p>';
    return;
  }
  // Group rows by stroke; keep ASC chronological order for line drawing.
  const byStroke = {};
  rows.slice()
    .sort((a, b) => (a.event_date || '').localeCompare(b.event_date || ''))
    .forEach(r => {
      if (!byStroke[r.stroke]) byStroke[r.stroke] = [];
      byStroke[r.stroke].push(r);
    });

  const strokes = Object.keys(byStroke);
  const allowedStrokes = opts && opts.strokeFilter && opts.strokeFilter !== 'all'
    ? strokes.filter(s => s === opts.strokeFilter)
    : strokes;

  if (allowedStrokes.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">No history rows for the selected stroke.</p>';
    return;
  }

  // Compute scales
  const allRows = allowedStrokes.flatMap(s => byStroke[s]);
  if (allRows.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">No data to plot.</p>';
    return;
  }

  const dates = Array.from(new Set(allRows.map(r => r.event_date))).filter(Boolean).sort();
  const times = allRows.map(r => r.time).filter(t => typeof t === 'number');
  const minTime = Math.min.apply(null, times);
  const maxTime = Math.max.apply(null, times);

  // Geometry
  const width = container.clientWidth || 600;
  const height = 360;
  const padding = { top: 24, right: 24, bottom: 56, left: 56 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Single date → single x value; draw datapoint at the middle.
  function xScale(iso) {
    if (dates.length === 1) return padding.left + plotW / 2;
    const i = dates.indexOf(iso);
    if (i < 0) return padding.left;
    return padding.left + (i / (dates.length - 1)) * plotW;
  }
  // Time scale inverts Y (smaller time = higher on chart).
  const timeRange = Math.max(1, maxTime - minTime);
  function yScale(cs) {
    return padding.top + plotH - ((cs - minTime) / timeRange) * plotH;
  }

  // Axes
  const yTickCount = 4;
  const yTicks = [];
  for (let i = 0; i <= yTickCount; i++) {
    const t = minTime + (i / yTickCount) * timeRange;
    yTicks.push('<g><line x1="' + padding.left + '" y1="' + yScale(t).toFixed(1) +
      '" x2="' + (width - padding.right) + '" y2="' + yScale(t).toFixed(1) +
      '" stroke="#e5e7eb" stroke-dasharray="2,3"/>' +
      '<text x="' + (padding.left - 8) + '" y="' + (yScale(t) + 4).toFixed(1) +
      '" text-anchor="end" font-size="11" fill="#475569">' + memberGraphTimeText(Math.round(t)) + '</text></g>');
  }
  const xLabels = dates.map(d => {
    const x = xScale(d);
    return '<text x="' + x.toFixed(1) + '" y="' + (height - padding.bottom + 18) +
      '" text-anchor="middle" font-size="11" fill="#475569" transform="rotate(-25 ' +
      x.toFixed(1) + ',' + (height - padding.bottom + 18) + ')">' + memberGraphShortDate(d) + '</text>';
  }).join('');

  const series = allowedStrokes.map(s => memberGraphBuildSeries(byStroke[s], {
    xScale, yScale, color: memberGraphStrokeColor(s), stroke: s
  })).join('');

  const legend = allowedStrokes.map((s, i) => {
    const cx = padding.left + i * 90;
    return '<g transform="translate(' + cx + ',8)"><circle cx="6" cy="6" r="5" fill="' +
      memberGraphStrokeColor(s) + '"/>' +
      '<text x="18" y="10" font-size="11" fill="#475569">' + memberGraphStrokeLabel(s) + '</text></g>';
  }).join('');

  container.innerHTML =
    '<svg viewBox="0 0 ' + width + ' ' + height + '" width="100%" height="' + height +
    '" data-graph-type="time-trend" role="img" aria-label="Time-trend graph">' +
    legend +
    yTicks.join('') +
    xLabels +
    series +
    '</svg>';
}

// Render the PB-progression graph (graph type B from QA-08).
function memberGraphRenderPBProgression(rowsInput, container, opts) {
  // Apply the date-range window before computing running PBs so the curve
  // reflects only the visible window (UIT-M3-007).
  const rows = memberGraphApplyDateRange(rowsInput, opts);
  if (rows.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">No history rows in the selected date range.</p>';
    return;
  }
  // Per stroke, walk chronologically and track the lowest finish-time so far.
  const byStroke = {};
  rows.slice()
    .sort((a, b) => (a.event_date || '').localeCompare(b.event_date || ''))
    .forEach(r => {
      if (!byStroke[r.stroke]) byStroke[r.stroke] = [];
      byStroke[r.stroke].push(r);
    });
  const strokes = Object.keys(byStroke);
  const allowedStrokes = opts && opts.strokeFilter && opts.strokeFilter !== 'all'
    ? strokes.filter(s => s === opts.strokeFilter)
    : strokes;
  const pbSeries = {};
  for (const s of allowedStrokes) {
    let runningPb = null;
    pbSeries[s] = byStroke[s].map(r => {
      if (runningPb == null || r.time < runningPb) runningPb = r.time;
      return { ...r, time: runningPb };
    });
  }
  // Now hand off to the same line-renderer; the only visible difference is
  // that PB-progression is a step-down line, drawn over the same date axis.
  // For simplicity we use the same visualizer; mark the data-graph-type so
  // the test runner can distinguish.
  const allRows = Object.values(pbSeries).flat();
  if (allRows.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">No data to plot.</p>';
    return;
  }
  memberGraphRenderTimeTrend(allRows, container, opts);
  // Patch the type tag so UIT-M3-004 can target it.
  const svg = container.querySelector('svg');
  if (svg) svg.setAttribute('data-graph-type', 'pb-progression');
}

// Public entry from members.js. Opens a modal, fetches the swimmer's history,
// and renders graph type A by default. Stroke + graph-type pickers above the
// SVG let the user filter (UIT-M3-002 / UIT-M3-004 / UIT-M3-007).
async function showMemberGraphModal(memberId) {
  // Show a loading state immediately to keep clicks responsive.
  const memberFromCache = (typeof membersCache !== 'undefined') ? membersCache.find(m => m.id === memberId) : null;
  const memberName = memberFromCache ? memberFromCache.name : 'Swimmer';
  showModal('Graphs — ' + memberName,
    '<p style="color:var(--text-secondary)">Loading…</p>',
    [{ label: 'Close', cls: 'btn-outline' }]
  );
  let rows;
  try {
    rows = await API.getMemberTimeHistory(memberId);
  } catch (err) {
    showModal('Graphs — ' + memberName,
      '<p style="color:#dc3545">Could not load history: ' + (err && err.message ? err.message : 'unknown error') + '</p>',
      [{ label: 'Close', cls: 'btn-outline' }]
    );
    return;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    showModal('Graphs — ' + memberName,
      '<p style="color:var(--text-secondary)">No time history yet for this swimmer. ' +
      'Graphs appear here after at least one event is finalized.</p>',
      [{ label: 'Close', cls: 'btn-outline' }]
    );
    return;
  }

  const strokes = Array.from(new Set(rows.map(r => r.stroke))).filter(Boolean).sort();
  const body = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
      <label style="font-size:12px;color:var(--text-secondary)">Graph type</label>
      <select id="mg-type" class="form-control" style="max-width:200px">
        <option value="time-trend">Time-trend (A)</option>
        <option value="pb-progression">PB progression (B)</option>
      </select>
      <label style="font-size:12px;color:var(--text-secondary);margin-left:12px">Stroke / Race</label>
      <select id="mg-stroke" class="form-control" style="max-width:200px">
        <option value="all">All strokes</option>
        ${strokes.map(s => `<option value="${s}">${memberGraphStrokeLabel(s)}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
      <label style="font-size:12px;color:var(--text-secondary)">From</label>
      <input id="mg-from" type="date" class="form-control" style="max-width:170px">
      <label style="font-size:12px;color:var(--text-secondary)">To</label>
      <input id="mg-to" type="date" class="form-control" style="max-width:170px">
      <button id="mg-clear-range" class="btn btn-outline" style="font-size:12px">Clear range</button>
    </div>
    <div id="mg-canvas" style="width:100%;min-height:380px;border:1px solid #e5e7eb;border-radius:6px;background:white;padding:8px"></div>
    <p style="margin-top:8px;color:var(--text-secondary);font-size:12px">
      ${rows.length} history row${rows.length === 1 ? '' : 's'} · Bigger dots and a green color mark PB break events. M3 R-M3-05.
    </p>
  `;

  showModal('Graphs — ' + memberName, body, [{ label: 'Close', cls: 'btn-outline' }]);

  const draw = () => {
    const container = document.getElementById('mg-canvas');
    if (!container) return;
    const type = document.getElementById('mg-type').value;
    const stroke = document.getElementById('mg-stroke').value;
    const fromDate = document.getElementById('mg-from').value || null;
    const toDate = document.getElementById('mg-to').value || null;
    const opts = { strokeFilter: stroke, fromDate, toDate };
    if (type === 'pb-progression') {
      memberGraphRenderPBProgression(rows, container, opts);
    } else {
      memberGraphRenderTimeTrend(rows, container, opts);
    }
  };
  // Initial draw, then redraw on picker changes. ResizeObserver lets the SVG
  // re-fit when the user resizes the browser (UIT-M3-013).
  draw();
  document.getElementById('mg-type').onchange = draw;
  document.getElementById('mg-stroke').onchange = draw;
  document.getElementById('mg-from').onchange = draw;
  document.getElementById('mg-to').onchange = draw;
  document.getElementById('mg-clear-range').onclick = (e) => {
    e.preventDefault();
    document.getElementById('mg-from').value = '';
    document.getElementById('mg-to').value = '';
    draw();
  };
  if (typeof ResizeObserver === 'function') {
    const canvas = document.getElementById('mg-canvas');
    if (canvas) new ResizeObserver(draw).observe(canvas);
  }
}
