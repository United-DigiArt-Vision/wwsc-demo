/**
 * WWSC — Time Format Utilities (v2.6.0: Dual format)
 * SSOT for all time formatting and parsing in the app.
 * 
 * TWO time systems:
 * 1. PB times (Members, Heats PB, Delay, Max): WHOLE SECONDS stored as integers (e.g. 16 = 16s)
 * 2. Stopwatch times (Finish, Net, Variance): CENTISECONDS stored as integers (e.g. 1345 = 13.45s)
 */

/**
 * Format centiseconds to "XX.XX" display string.
 * Used for: Finish Time, Net Time, Variance (stopwatch precision)
 * @param {number|null} cs - Value in centiseconds (e.g. 1345 = 13.45s)
 * @returns {string} Formatted string (e.g. "13.45") or "—" if null
 */
function formatTime(cs) {
  if (cs == null) return '—';
  const negative = cs < 0;
  const abs = Math.abs(cs);
  const secs = Math.floor(abs / 100);
  const cents = abs % 100;
  return (negative ? '-' : '') + secs + '.' + String(cents).padStart(2, '0');
}

/**
 * Format whole seconds to "XX" display string.
 * Used for: PB, Start Delay, Max Time, Total (handicap precision)
 * @param {number|null} secs - Value in whole seconds (e.g. 16 = 16s)
 * @returns {string} Formatted string (e.g. "16") or "—" if null
 */
function formatWhole(secs) {
  if (secs == null) return '—';
  const negative = secs < 0;
  const abs = Math.abs(secs);
  return (negative ? '-' : '') + abs;
}

/**
 * Parse user input "XX.XX" to centiseconds integer.
 * Used for: Finish Time entry (stopwatch)
 * Accepts: "13.45" → 1345, "13" → 1300, "13.4" → 1340, "" → null
 * @param {string} input - User-entered time string
 * @returns {number|null} Centiseconds or null if invalid/empty
 */
function parseTime(input) {
  if (!input || String(input).trim() === '') return null;
  const str = String(input).trim();
  const parts = str.split('.');
  const secs = parseInt(parts[0], 10);
  if (isNaN(secs) || secs < 0) return null;
  let cents = 0;
  if (parts[1]) {
    const c = parts[1].slice(0, 2).padEnd(2, '0');
    cents = parseInt(c, 10);
    if (isNaN(cents)) cents = 0;
  }
  return secs * 100 + cents;
}

/**
 * Parse user input to whole seconds integer.
 * Used for: PB entry (Members)
 * Accepts: "16" → 16, "39" → 39, "" → null
 * @param {string} input - User-entered time string (whole seconds only)
 * @returns {number|null} Whole seconds or null if invalid/empty
 */
function parseWhole(input) {
  if (!input || String(input).trim() === '') return null;
  const secs = parseInt(String(input).trim(), 10);
  if (isNaN(secs) || secs < 0) return null;
  return secs;
}
