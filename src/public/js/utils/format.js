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

/**
 * Ordinal suffix for relay/race placement (1st, 2nd, 3rd, 4th, …)
 * Shared by heat-builder, relays, and results screens.
 */
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Recalculate target_time, start_delay, max_time for a relay team
 * after adding/removing a swimmer. Call this after modifying team.members.
 * @param {object} team - The team object with members array
 * @param {string} raceType - e.g. '25m_relay', 'medley_relay'
 * @param {array} allTeams - All teams (needed for max_time calc in non-medley)
 */
function recalcRelayTeam(team, raceType, allTeams) {
  var newTarget = 0;
  for (var i = 0; i < team.members.length; i++) {
    var pb = getRelayPB(team.members[i], raceType);
    newTarget += (pb || 0);
  }
  team.target_time = newTarget > 0 ? newTarget : null;

  if (raceType === 'medley_relay') {
    team.start_delay = 2;
    team.max_time = newTarget > 0 ? newTarget + 2 : 2;
  } else {
    // For standard relays: recalc based on max across all teams
    var maxPB = 0;
    for (var t = 0; t < allTeams.length; t++) {
      var tTarget = 0;
      for (var m = 0; m < allTeams[t].members.length; m++) {
        var mpb = getRelayPB(allTeams[t].members[m], raceType);
        tTarget += (mpb || 0);
      }
      if (tTarget > maxPB) maxPB = tTarget;
    }
    var maxTime = maxPB + 2;
    team.start_delay = newTarget > 0 ? maxTime - newTarget : 0;
    team.max_time = maxTime;
    // Also update other teams' start_delay with new maxTime
    for (var t2 = 0; t2 < allTeams.length; t2++) {
      var t2Target = allTeams[t2].target_time || 0;
      allTeams[t2].start_delay = t2Target > 0 ? maxTime - t2Target : 0;
      allTeams[t2].max_time = maxTime;
    }
  }
}

/**
 * Get PB for a relay member based on race type and stroke.
 * Shared by heat-builder, relays, and results screens.
 */
function getRelayPB(member, raceType) {
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
