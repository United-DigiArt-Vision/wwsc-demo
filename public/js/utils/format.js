/**
 * WWSC — Time Format Utilities (Centiseconds)
 * SSOT for all time formatting and parsing in the app.
 * All times stored as INTEGER centiseconds: 1345 = 13.45 seconds.
 */

/**
 * Format centiseconds to "XX.XX" display string.
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
 * Parse user input "XX.XX" to centiseconds integer.
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
