#!/usr/bin/env python3
"""Sets up test data for display tests. Run before run-display-tests.js.
Server must be running on port 3000 with a FRESH database."""
import json, urllib.request, urllib.error

B = "http://localhost:3000"

def post(p, d=None):
    b = json.dumps(d).encode() if d else None
    h = {"Content-Type": "application/json"} if d else {}
    r = urllib.request.urlopen(urllib.request.Request(B+p, data=b, headers=h, method="POST"))
    return json.loads(r.read())

def put(p, d):
    b = json.dumps(d).encode()
    r = urllib.request.urlopen(urllib.request.Request(B+p, data=b, headers={"Content-Type": "application/json"}, method="PUT"))
    return json.loads(r.read())

def get(p):
    return json.loads(urllib.request.urlopen(B+p).read())

print("Setting up display test data...")

evt = post("/api/events", {"date": "2026-04-06"})
eid = evt["id"]
att = get(f"/api/events/{eid}/attendance")
entries = ["Y","Back","Breast","Free","Y","Back","Breast","Free","Y","N","N","N"]
updates = [{"member_id": a["member_id"], "present": i < 12, "special_event_entry": entries[i] if i < 12 else None} for i, a in enumerate(att)]
put(f"/api/events/{eid}/attendance", {"attendees": updates})
put(f"/api/events/{eid}/config", {"standard_event": "ordinary_swim", "special_event": "medley_relay"})
put(f"/api/events/{eid}/races", {"race_types": ["25m", "50m", "25m_relay", "medley_relay"]})
races = get(f"/api/events/{eid}/races")

for race in races:
    if race["race_type"] in ["25m", "50m"]:
        h = get(f"/api/races/{race['id']}/generate-heats")
        post(f"/api/races/{race['id']}/confirm-heats", h)
        saved = get(f"/api/races/{race['id']}/heats")
        for heat in saved:
            for i, l in enumerate(heat["lanes"]):
                d, pb = l["start_delay"], l["handicap_time"]
                if i == 0: ft = d * 100 + (pb - 1) * 100  # break
                else: ft = d * 100 + pb * 100 + 50
                put(f"/api/heats/{heat['id']}/lanes/{l['id']}/time", {"finish_time": ft})
        post(f"/api/races/{race['id']}/rank")

for race in races:
    if race["race_type"] in ["25m_relay", "medley_relay"]:
        r = post(f"/api/races/{race['id']}/generate-relay-teams")
        post(f"/api/races/{race['id']}/save-relay-teams", {"teams": r["teams"]})
        teams = get(f"/api/races/{race['id']}/relay-teams")
        for t in teams:
            total = ((t["target_time"] or 0) + (t["start_delay"] or 0)) * 100 + 100
            put(f"/api/relay-teams/{t['id']}/time", {"total_time": total})
        post(f"/api/races/{race['id']}/rank-relay")

post(f"/api/events/{eid}/finalize")
print(f"Done. Event {eid} finalized with breaks + relay results.")
print("Now open http://localhost:3000 and run run-display-tests.js in browser console.")
