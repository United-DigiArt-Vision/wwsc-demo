/**
 * WWSC — API Client
 */
const API = {
  async get(url) {
    const r = await fetch(url);
    return r.json();
  },
  async post(url, data) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.json();
  },
  async put(url, data) {
    const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.json();
  },
  async patch(url, data) {
    const r = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return r.json();
  },
  async upload(url, file) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(url, { method: 'POST', body: fd });
    return r.json();
  },

  // Members
  getMembers: () => API.get('/api/members'),
  getMember: (id) => API.get(`/api/members/${id}`),
  createMember: (data) => API.post('/api/members', data),
  updateMember: (id, data) => API.put(`/api/members/${id}`, data),
  importCSV: (file) => API.upload('/api/members/import', file),

  // Events
  getCurrentEvent: () => API.get('/api/events/current'),
  getEvents: () => API.get('/api/events'),
  createEvent: (date) => API.post('/api/events', { date }),
  resetWeek: () => API.post('/api/events/reset'),
  getEventConfig: (eventId) => API.get(`/api/events/${eventId}/config`),
  updateEventConfig: (eventId, config) => API.put(`/api/events/${eventId}/config`, config),

  // Attendance
  getAttendance: (eventId) => API.get(`/api/events/${eventId}/attendance`),
  updateAttendance: (eventId, attendees) => API.put(`/api/events/${eventId}/attendance`, { attendees }),

  // Races
  getRaces: (eventId) => API.get(`/api/events/${eventId}/races`),
  updateRaces: (eventId, race_types) => API.put(`/api/events/${eventId}/races`, { race_types }),

  // Heats
  generateHeats: (raceId) => API.get(`/api/races/${raceId}/generate-heats`),
  confirmHeats: (raceId, heats) => API.post(`/api/races/${raceId}/confirm-heats`, { heats }),
  getHeats: (raceId) => API.get(`/api/races/${raceId}/heats`),

  // Dashboard
  getDashboard: () => API.get('/api/dashboard'),

  // Results
  getResults: (eventId) => API.get(`/api/events/${eventId}/results`),
  enterTime: (heatId, laneId, finishTime) => API.put(`/api/heats/${heatId}/lanes/${laneId}/time`, { finish_time: finishTime }),
  rankRace: (raceId) => API.post(`/api/races/${raceId}/rank`),
  finalizeEvent: (eventId) => API.post(`/api/events/${eventId}/finalize`),
  getBreakers: (eventId) => API.get(`/api/events/${eventId}/breakers`),
  getAllBreakers: () => API.get('/api/reports/breakers'),
  completeEvent: (eventId) => API.post(`/api/events/${eventId}/complete`),
  getTimeHistory: (eventId) => API.get(`/api/events/${eventId}/time-history`),

  // Backup
  createBackup: () => API.post('/api/backup'),

  // Relays
  generateRelayTeams: (raceId) => API.post(`/api/races/${raceId}/generate-relay-teams`),
  saveRelayTeams: (raceId, teams) => API.post(`/api/races/${raceId}/save-relay-teams`, { teams }),
  getRelayTeams: (raceId) => API.get(`/api/races/${raceId}/relay-teams`),
  enterRelayTeamTime: (teamId, totalTime) => API.put(`/api/relay-teams/${teamId}/time`, { total_time: totalTime }),
  enterRelaySplit: (teamId, memberId, splitTime) => API.put(`/api/relay-teams/${teamId}/member/${memberId}/split`, { split_time: splitTime }),
  rankRelay: (raceId) => API.post(`/api/races/${raceId}/rank-relay`),

  // v2.4.0: Manual place + slow swimmers
  setManualPlace: (laneId, manualPlace) => API.patch('/api/heat-lanes/' + laneId + '/place', { manual_place: manualPlace }),
  getSlowSwimmers: (eventId) => API.get('/api/events/' + eventId + '/slow-swimmers'),
};
