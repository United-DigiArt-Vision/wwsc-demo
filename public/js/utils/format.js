/**
 * WWSC — Time Formatting Utilities (Centiseconds)
 * All times stored as centiseconds (INTEGER). 1345 = 13.45 seconds.
 * These are the ONLY formatting functions — use everywhere.
 */

/**
 * Format centiseconds to display string.
 * formatTime(1345) → '13.45'
 * formatTime(-100) → '-1.00'
 * formatTime(0) → '0.00'
 * formatTime(null) → '—'
 */
function formatTime(cs) {
  if (cs == null) return '—';
  const sign = cs < 0 ? '-' : '';
  const abs = Math.abs(cs);
  const secs = Math.floor(abs / 100);
  const hundredths = abs % 100;
  return sign + secs + '.' + String(hundredths).padStart(2, '0');
}

/**
 * Parse user input string to centiseconds integer.
 * parseTime('13.45') → 1345
 * parseTime('13') → 1300
 * parseTime('13.4') → 1340
 * parseTime('') → null
 * parseTime(null) → null
 */
function parseTime(input) {
  if (input == null || input === '') return null;
  const str = String(input).trim();
  if (str === '') return null;
  const parts = str.split('.');
  const secs = parseInt(parts[0], 10) || 0;
  let hundredths = 0;
  if (parts.length > 1) {
    const frac = parts[1].substring(0, 2);
    if (frac.length === 1) {
      hundredths = parseInt(frac, 10) * 10;
    } else {
      hundredths = parseInt(frac, 10) || 0;
    }
  }
  const sign = str.startsWith('-') ? -1 : 1;
  return sign * (Math.abs(secs) * 100 + hundredths);
}
