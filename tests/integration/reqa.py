#!/usr/bin/env python3
"""Vermithrax RE-QA — Full test suite for WWSC Swimming App M1"""
import json, io, os, urllib.request, urllib.error, urllib.parse

B = "http://localhost:3000"
PASS = 0; FAIL = 0; RESULTS = []

def ok(name):
    global PASS; PASS += 1; RESULTS.append(("✅", name, "")); print(f"  ✅ {name}")

def fail(name, detail=""):
    global FAIL; FAIL += 1; RESULTS.append(("❌", name, str(detail)[:120])); print(f"  ❌ {name} — {str(detail)[:120]}")

class Resp:
    def __init__(self, status, body):
        self.status_code = status
        self._body = body
    @property
    def ok(self): return 200 <= self.status_code < 300
    @property
    def text(self): return self._body
    def json(self): return json.loads(self._body)

def _req(method, path, data=None, content_type="application/json"):
    url = B + path
    body = None
    headers = {}
    if data is not None and content_type == "application/json":
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    elif data is not None:
        body = data
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req)
        return Resp(r.status, r.read().decode())
    except urllib.error.HTTPError as e:
        return Resp(e.code, e.read().decode())
    except Exception as e:
        return Resp(0, str(e))

def get(path): return _req("GET", path)
def post(path, data=None): return _req("POST", path, data)
def put(path, data=None): return _req("PUT", path, data)
def delete(path): return _req("DELETE", path)

def upload_csv(content):
    boundary = "----Boundary123456"
    body = f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.csv\"\r\nContent-Type: text/csv\r\n\r\n{content}\r\n--{boundary}--\r\n"
    return _req("POST", "/api/members/import", body.encode(), f"multipart/form-data; boundary={boundary}")

# ══════════════════════════════════════════════════════════
print("\n=== 1. MEMBERS CRUD ===")

r = post("/api/members", {"name": "Alice Test", "time_25m": 15, "time_50m": 30, "time_backstroke": 35})
if r.ok and "id" in r.json(): ok("T1: Add member"); alice_id = r.json()["id"]
else: fail("T1: Add member", r.text); alice_id = None

r = post("/api/members", {"name": "O'Brien-Smith", "time_25m": 18, "time_50m": 33})
if r.ok and "id" in r.json(): ok("T2: Special chars name")
else: fail("T2: Special chars name", r.text)

r = get("/api/members")
members = r.json()
names = [m["name"] for m in members]
if "Alice Test" in names: ok("T3a: List contains Alice")
else: fail("T3a: List contains Alice", names)
if "O'Brien-Smith" in names: ok("T3b: List contains O'Brien")
else: fail("T3b: List contains O'Brien", names)

if alice_id:
    r = put(f"/api/members/{alice_id}", {"name": "Alice Test", "is_active": 1, "time_25m": 14, "time_50m": 28, "time_backstroke": 35})
    if r.ok and r.json().get("ok"): ok("T4: Edit member")
    else: fail("T4: Edit member", r.text)
    r = get(f"/api/members/{alice_id}")
    if r.json().get("time_25m") == 14: ok("T4b: PB updated")
    else: fail("T4b: PB updated", r.json().get("time_25m"))

if alice_id:
    put(f"/api/members/{alice_id}", {"name": "Alice Test", "is_active": 0, "time_25m": 14, "time_50m": 28, "time_backstroke": 35})
    r = get(f"/api/members/{alice_id}")
    if r.json().get("is_active") == 0: ok("T5: Deactivate member")
    else: fail("T5: Deactivate member", r.json())
    put(f"/api/members/{alice_id}", {"name": "Alice Test", "is_active": 1, "time_25m": 14, "time_50m": 28, "time_backstroke": 35})

r = post("/api/members", {"name": "", "time_25m": 10})
if r.status_code == 400 and "error" in r.json(): ok("T6: Empty name rejected")
else: fail("T6: Empty name rejected", f"status={r.status_code}")

print("\n=== 1b. CSV IMPORT ===")

r = upload_csv("Name,25m,50m,backstroke\nBob CSV,16,31,36\nCarol CSV,17,32,37\nDave CSV,18,33,38\nEve CSV,19,34,39\nFrank CSV,20,35,40\nGrace CSV,21,36,41")
if r.ok and r.json().get("imported") == 6: ok("T7: CSV import 6")
else: fail("T7: CSV import 6", r.text)

r = upload_csv("Name,25m")
if r.status_code == 400 and "No members" in r.json().get("error", ""): ok("T8: CSV empty → error")
else: fail("T8: CSV empty → error", r.text)

r = upload_csv("id,25m\n1,15")
if r.status_code == 400 and "name" in r.json().get("error", "").lower(): ok("T9: CSV missing Name → error (FIX#4)")
else: fail("T9: CSV missing Name → error (FIX#4)", r.text)

r = upload_csv("Name,25m\nTest,abc")
d = r.json()
has_invalid = False
if d.get("errors"):
    has_invalid = any("invalid" in e.lower() for e in d["errors"])
elif d.get("error"):
    has_invalid = "invalid" in d["error"].lower()
if has_invalid: ok("T10: CSV bad times → error")
else: fail("T10: CSV bad times → error", r.text)

r = upload_csv("Name,25m,50m\nNullGuy,,")
if r.ok and r.json().get("imported") == 1: ok("T11a: CSV empty times imported")
else: fail("T11a: CSV empty times imported", r.text)

members = get("/api/members").json()
ng = [m for m in members if m["name"] == "NullGuy"]
if ng and ng[0]["time_25m"] is None and ng[0]["time_50m"] is None: ok("T11b: Empty times are null")
elif ng: fail("T11b: Empty times are null", f"25m={ng[0]['time_25m']}, 50m={ng[0]['time_50m']}")
else: fail("T11b: NullGuy not found")

print("\n=== 2. EVENT SETUP ===")

r = post("/api/events", {"date": "2026-02-17"})
if r.ok and "id" in r.json(): ok("T12: Create event"); evt_id = r.json()["id"]
else: fail("T12: Create event", r.text); evt_id = None

if evt_id:
    r = get(f"/api/events/{evt_id}")
    if r.json().get("status") == "setup": ok("T13: Event status=setup")
    else: fail("T13: Event status=setup", r.json())

    obrien = [m for m in get("/api/members").json() if "O'Brien" in m["name"]]
    if obrien:
        put(f"/api/members/{obrien[0]['id']}", {"name": obrien[0]["name"], "is_active": 0, "time_25m": 18, "time_50m": 33})

    att = get(f"/api/events/{evt_id}/attendance").json()
    if obrien and not any(a["member_id"] == obrien[0]["id"] for a in att): ok("T14: Deactivated excluded from attendance")
    else: fail("T14: Deactivated excluded from attendance")

    r = put(f"/api/events/{evt_id}/attendance", {"attendees": []})
    if r.status_code == 400: ok("T15a: 0 attendees → 400 (FIX#5)")
    else: fail("T15a: 0 attendees → 400 (FIX#5)", f"status={r.status_code}")

    active_members = get("/api/members").json()
    with_25m = [m for m in active_members if m["is_active"] == 1 and m["time_25m"] is not None]
    present_ids = [m["id"] for m in with_25m[:9]]
    att_data = [{"member_id": mid, "present": True} for mid in present_ids]
    r = put(f"/api/events/{evt_id}/attendance", {"attendees": att_data})
    if r.ok and r.json().get("ok"): ok(f"T15b: Mark {len(present_ids)} present")
    else: fail("T15b: Mark present", r.text)

    r = put(f"/api/events/{evt_id}/races", {"race_types": []})
    if r.status_code == 400: ok("T16a: 0 races → 400 (FIX#5)")
    else: fail("T16a: 0 races → 400 (FIX#5)", f"status={r.status_code}")

    r = put(f"/api/events/{evt_id}/races", {"race_types": ["25m", "50m", "backstroke"]})
    if r.ok: ok("T16b: 3 races created")
    else: fail("T16b: 3 races created", r.text)

    r = get("/api/dashboard").json()
    if r.get("racesCount") == 3: ok("T17: Dashboard races count")
    else: fail("T17: Dashboard", f"racesCount={r.get('racesCount')}")

print("\n=== 2b. LOCK/UNLOCK (FIX #1) ===")

if evt_id:
    r = put(f"/api/events/{evt_id}/lock")
    if r.ok and r.json().get("ok"): ok("T18a: Lock event")
    else: fail("T18a: Lock event", r.text)

    r = put(f"/api/events/{evt_id}/attendance", {"attendees": att_data})
    if r.status_code == 403: ok("T18b: Attendance blocked when locked (FIX#1)")
    else: fail("T18b: Attendance blocked (FIX#1)", f"status={r.status_code}")

    r = put(f"/api/events/{evt_id}/races", {"race_types": ["25m"]})
    if r.status_code == 403: ok("T18c: Races blocked when locked (FIX#1)")
    else: fail("T18c: Races blocked (FIX#1)", f"status={r.status_code}")

    r = put(f"/api/events/{evt_id}/unlock")
    if r.ok: ok("T18d: Unlock event")
    else: fail("T18d: Unlock event", r.text)

    r = put(f"/api/events/{evt_id}/attendance", {"attendees": att_data})
    if r.ok: ok("T18e: Attendance works after unlock (FIX#1)")
    else: fail("T18e: Attendance after unlock", f"status={r.status_code}")

    put(f"/api/events/{evt_id}/races", {"race_types": ["25m", "50m", "backstroke"]})

print("\n=== 3. HEAT GENERATION ===")

if evt_id:
    races = get(f"/api/events/{evt_id}/races").json()
    rid_25m = next((r["id"] for r in races if r["race_type"] == "25m"), None)

    if rid_25m:
        r = get(f"/api/races/{rid_25m}/generate-heats").json()
        heats = r.get("heats", [])
        if heats: ok(f"T19: Generate heats ({len(heats)} heats for 9 swimmers)")
        else: fail("T19: Generate heats", r)

        # Handicap: start_delay = (max_PB + 2) - PB (BASE_OFFSET = 2)
        all_ok = True
        for h in heats:
            times = [l["handicap_time"] for l in h["lanes"]]
            mx = max(times) + 2  # BASE_OFFSET
            for l in h["lanes"]:
                if l["start_delay"] != mx - l["handicap_time"]: all_ok = False
        if all_ok: ok("T20: Handicap start_delay = (max+2) - PB")
        else: fail("T20: Handicap calc")

        # Randomisation
        orders = set()
        for _ in range(10):
            r2 = get(f"/api/races/{rid_25m}/generate-heats").json()
            ids = tuple(l["member_id"] for h in r2.get("heats", []) for l in h["lanes"])
            orders.add(ids)
        if len(orders) > 1: ok(f"T21: Randomisation ({len(orders)} unique/10)")
        else: fail("T21: Randomisation", "all identical")

        # Confirm
        data = get(f"/api/races/{rid_25m}/generate-heats").json()
        r = post(f"/api/races/{rid_25m}/confirm-heats", data)
        if r.ok: ok("T22a: Confirm heats")
        else: fail("T22a: Confirm heats", r.text)

        saved = get(f"/api/races/{rid_25m}/heats").json()
        if len(saved) > 0: ok(f"T22b: Heats persisted ({len(saved)})")
        else: fail("T22b: Heats persisted")

        # Missing PB
        ng = [m for m in get("/api/members").json() if m["name"] == "NullGuy"]
        if ng and ng[0]["time_25m"] is None:
            r = get(f"/api/races/{rid_25m}/generate-heats").json()
            names = [l["name"] for h in r.get("heats", []) for l in h["lanes"]]
            if "NullGuy" not in names: ok("T23: Missing PB excluded")
            else: fail("T23: Missing PB excluded", "NullGuy in heats")
        else:
            print(f"  ℹ️ NullGuy has 25m={ng[0]['time_25m'] if ng else 'N/A'}, skipping PB exclusion test")

print("\n=== 3b. HEAT DISTRIBUTION (FIX #2) ===")

def test_heat_dist(n, expected, label):
    r = post("/api/events", {"date": "2026-02-17"})
    if not r.ok: fail(label, "event create failed"); return
    eid = r.json()["id"]
    att = get(f"/api/events/{eid}/attendance").json()
    all_m = get("/api/members").json()
    active_pb = [m for m in all_m if m["is_active"] == 1 and m["time_25m"] is not None]
    if len(active_pb) < n: fail(label, f"only {len(active_pb)} members"); return
    target = set(m["id"] for m in active_pb[:n])
    ad = [{"member_id": a["member_id"], "present": a["member_id"] in target} for a in att]
    r = put(f"/api/events/{eid}/attendance", {"attendees": ad})
    if not r.ok: fail(label, f"att: {r.text}"); return
    put(f"/api/events/{eid}/races", {"race_types": ["25m"]})
    rid = get(f"/api/events/{eid}/races").json()[0]["id"]
    r = get(f"/api/races/{rid}/generate-heats").json()
    dist = sorted([len(h["lanes"]) for h in r.get("heats", [])], reverse=True)
    if dist == expected: ok(f"{label}: {n} → {expected}")
    else: fail(f"{label}: {n} → {expected}", f"got {dist}")

active_pb = [m for m in get("/api/members").json() if m["is_active"] == 1 and m["time_25m"] is not None]
for i in range(max(0, 23 - len(active_pb))):
    post("/api/members", {"name": f"Extra {i}", "time_25m": 10+i, "time_50m": 25+i})

test_heat_dist(3, [3], "T19a")
test_heat_dist(4, [4], "T19b")
test_heat_dist(6, [3, 3], "T19c")
test_heat_dist(7, [4, 3], "T19d")
test_heat_dist(8, [4, 4], "T19e")
test_heat_dist(9, [3, 3, 3], "T19f(FIX#2)")
test_heat_dist(10, [4, 3, 3], "T19g")
test_heat_dist(11, [4, 4, 3], "T19h")
test_heat_dist(12, [4, 4, 4], "T19i")
test_heat_dist(23, [4, 4, 4, 4, 4, 3], "T19j")

print("\n=== 4. SERVER STABILITY (FIX #3) ===")

if alice_id:
    r = delete(f"/api/members/{alice_id}")
    if r.ok and r.json().get("ok"): ok("T24a: DELETE member (soft delete)")
    else: fail("T24a: DELETE member", r.text)

r = get("/api/dashboard")
if r.ok: ok("T24b: Server stable after DELETE")
else: fail("T24b: Server crashed after DELETE")

if evt_id:
    r = put(f"/api/events/{evt_id}/races", {"race_types": ["50m"]})
    if r.ok: ok("T24c: Replace races w/ heats (FK safe)")
    else: fail("T24c: FK constraint crash", r.text)

r = get("/api/dashboard")
if r.ok: ok("T24d: Server stable after FK operation")
else: fail("T24d: Server crashed")

print("\n=== 5. WEEKLY RESET (FIX #6) ===")

r = post("/api/events/reset")
if r.ok and r.json().get("ok"): ok("T25a: Reset ok")
else: fail("T25a: Reset", r.text)

data = r.json() if r.ok else {}
if data.get("backup"): ok("T25b: Backup path returned")
else: fail("T25b: Backup path missing", data)

if data.get("newEventId"): ok("T25c: New event auto-created (FIX#6)")
else: fail("T25c: No newEventId (FIX#6)", data)

bp = data.get("backup", "")
if bp and os.path.isfile(bp): ok("T25d: Backup file exists")
else: fail("T25d: Backup file", f"path={bp}")

new_evt = data.get("newEventId")
if new_evt:
    r = get(f"/api/events/{new_evt}")
    if r.ok and r.json().get("status") == "setup": ok("T25e: New event status=setup")
    else: fail("T25e: New event status", r.text)

if evt_id:
    r = get(f"/api/events/{evt_id}")
    if r.ok and r.json().get("status") == "completed": ok("T25f: Old event completed")
    else: fail("T25f: Old event", r.text)

m_after = get("/api/members").json()
if len(m_after) > 5: ok(f"T25g: Members preserved ({len(m_after)})")
else: fail("T25g: Members lost", len(m_after))

print("\n=== 6. BACKUP ===")

r = post("/api/backup")
if r.ok and r.json().get("ok"): ok("T26: Manual backup")
else: fail("T26: Backup", r.text)

print("\n=== 7. API ROBUSTNESS ===")

all_valid = True
for ep in ["/api/members", "/api/events/current", "/api/dashboard"]:
    r = get(ep)
    try: r.json()
    except: all_valid = False; print(f"    ⚠️ {ep} invalid JSON")
if all_valid: ok("T27: All GETs valid JSON")
else: fail("T27: JSON validity")

r = get("/api/members/99999")
if r.status_code == 404: ok("T28: 404 for nonexistent member")
else: fail("T28: 404", f"got {r.status_code}")

print(f"\n{'='*50}")
print(f"  RESULTS: {PASS} PASS / {FAIL} FAIL")
print(f"{'='*50}")
for icon, name, detail in RESULTS:
    d = f" | {detail}" if detail else ""
    print(f"  {icon} {name}{d}")

verdict = "PASS" if FAIL == 0 else "FAIL"
print(f"\n  VERDICT: {verdict}")
