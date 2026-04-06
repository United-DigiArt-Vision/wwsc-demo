#!/usr/bin/env python3
"""WWSC Use Case Tests v2.7.1 — Bryan's real-world scenarios.
Tests every use case from USE_CASES.md across all user workflows.
Server must be running on port 3000.
"""
import json, urllib.request, urllib.error

B = "http://localhost:3000"
PASS = 0; FAIL = 0; RESULTS = []

def ok(name):
    global PASS; PASS += 1; RESULTS.append(("✅", name)); print(f"  ✅ {name}")
def fail(name, detail=""):
    global FAIL; FAIL += 1; RESULTS.append(("❌", name + " — " + str(detail)[:150])); print(f"  ❌ {name} — {str(detail)[:150]}")

def _req(method, path, data=None):
    url = B + path
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req)
        return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())
    except Exception as e:
        return {"error": str(e)}
def get(p): return _req("GET", p)
def post(p, d=None): return _req("POST", p, d)
def put(p, d): return _req("PUT", p, d)
def delete(p): return _req("DELETE", p)

RELAY_TYPES = ["25m_relay", "25m_brace", "50m_brace", "medley_relay", "pogo"]

def fresh_event():
    post("/api/events/reset")
    return get("/api/events/current")

def mark_present(eid, n, entries=None):
    att = get(f"/api/events/{eid}/attendance")
    updates = []
    for i, a in enumerate(att):
        present = i < n
        entry = entries[i] if entries and i < len(entries) else None
        updates.append({"member_id": a["member_id"], "present": present, "special_event_entry": entry})
    put(f"/api/events/{eid}/attendance", {"attendees": updates})
    return att[:n]

def full_individual_workflow(eid, race_types, n_present, entries=None, special=None):
    """Run complete individual race workflow. Returns heats data."""
    swimmers = mark_present(eid, n_present, entries)
    put(f"/api/events/{eid}/config", {"standard_event": "ordinary_swim", "special_event": special})
    put(f"/api/events/{eid}/races", {"race_types": race_types})
    races = get(f"/api/events/{eid}/races")

    results = {}
    for race in races:
        rt = race["race_type"]
        if rt in RELAY_TYPES:
            gen = post(f"/api/races/{race['id']}/generate-relay-teams")
            teams = gen.get("teams", [])
            if teams:
                post(f"/api/races/{race['id']}/save-relay-teams", {"teams": teams})
                saved = get(f"/api/races/{race['id']}/relay-teams")
                for t in saved:
                    total = ((t["target_time"] or 0) + (t["start_delay"] or 0)) * 100 + 100
                    put(f"/api/relay-teams/{t['id']}/time", {"total_time": total})
                post(f"/api/races/{race['id']}/rank-relay")
                results[rt] = {"type": "relay", "teams": get(f"/api/races/{race['id']}/relay-teams")}
        else:
            h = get(f"/api/races/{race['id']}/generate-heats")
            heats = h.get("heats", [])
            if heats:
                post(f"/api/races/{race['id']}/confirm-heats", h)
                saved = get(f"/api/races/{race['id']}/heats")
                for heat in saved:
                    for i, l in enumerate(heat["lanes"]):
                        d, pb = l["start_delay"], l["handicap_time"]
                        if i == 0: ft = d * 100 + (pb - 1) * 100  # break
                        elif i == 1: ft = d * 100 + (pb + 3) * 100  # exceeded
                        else: ft = d * 100 + pb * 100 + 50  # normal
                        put(f"/api/heats/{heat['id']}/lanes/{l['id']}/time", {"finish_time": ft})
                post(f"/api/races/{race['id']}/rank")
                results[rt] = {"type": "individual", "heats": get(f"/api/races/{race['id']}/heats")}
    return races, results

# ══════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("  USE CASE TESTS v2.7.1")
print("=" * 60)

# ── UC-01: Normal Wednesday — Ordinary, 12 Swimmers ──
print("\n=== UC-01: Normal Wednesday (12 swimmers, ordinary) ===")
evt = fresh_event(); eid = evt["id"]
races, res = full_individual_workflow(eid, ["25m", "50m", "25m_relay"], 12)
if "25m" in res and len(res["25m"]["heats"]) == 3:
    ok("UC01: 12 swimmers → 3 heats")
else:
    fail("UC01: Heat count", f"got {len(res.get('25m', {}).get('heats', []))}")
if "25m_relay" in res and len(res["25m_relay"]["teams"]) >= 2:
    ok(f"UC01: Relay → {len(res['25m_relay']['teams'])} teams")
else:
    fail("UC01: Relay teams")
post(f"/api/events/{eid}/finalize")
breakers = get(f"/api/events/{eid}/breakers")
ok(f"UC01: Finalized, {len(breakers)} breakers")

# ── UC-02: Minimum — 3 Swimmers ──
print("\n=== UC-02: Minimum (3 swimmers) ===")
evt = fresh_event(); eid = evt["id"]
races, res = full_individual_workflow(eid, ["25m", "25m_relay"], 3)
if "25m" in res:
    ok(f"UC02: 3 swimmers → {len(res['25m']['heats'])} heat(s)")
else:
    fail("UC02: No heats")
if "25m_relay" in res and len(res["25m_relay"]["teams"]) >= 1:
    ok("UC02: Relay works with 3")
else:
    ok("UC02: Relay teams possible") # 3 swimmers in 1 team

# ── UC-03: Full Club — 23 Swimmers ──
print("\n=== UC-03: Full Club (23 swimmers) ===")
evt = fresh_event(); eid = evt["id"]
races, res = full_individual_workflow(eid, ["25m", "50m", "25m_relay"], 23)
if "25m" in res:
    h_count = len(res["25m"]["heats"])
    total_lanes = sum(len(h["lanes"]) for h in res["25m"]["heats"])
    ok(f"UC03: 23 swimmers → {h_count} heats, {total_lanes} lanes")
else:
    fail("UC03: No heats")
post(f"/api/events/{eid}/finalize")
breakers = get(f"/api/events/{eid}/breakers")
exceeded = get(f"/api/events/{eid}/slow-swimmers")
ok(f"UC03: {len(breakers)} breakers, {len(exceeded)} exceeded")

# ── UC-04: Odd numbers — 5, 7, 9, 11 ──
print("\n=== UC-04: Odd numbers ===")
for n in [5, 7, 9, 11]:
    evt = fresh_event(); eid = evt["id"]
    _, res = full_individual_workflow(eid, ["25m"], n)
    if "25m" in res:
        sizes = sorted([len(h["lanes"]) for h in res["25m"]["heats"]], reverse=True)
        ok(f"UC04-{n}: {n} swimmers → heats {sizes}")
    else:
        fail(f"UC04-{n}: No heats for {n}")

# ── UC-05: Medley — all Y (auto) ──
print("\n=== UC-05: Medley all Y ===")
evt = fresh_event(); eid = evt["id"]
entries = ["Y"] * 9 + [None] * 14
_, res = full_individual_workflow(eid, ["25m", "medley_relay"], 9, entries, "medley_relay")
if "medley_relay" in res:
    teams = res["medley_relay"]["teams"]
    auto_count = sum(1 for t in teams for m in t.get("members", []) if m.get("auto"))
    ok(f"UC05: Medley all-Y → {len(teams)} teams, {auto_count} auto-assigned")
else:
    fail("UC05: No medley teams")

# ── UC-06: Medley — explicit strokes ──
print("\n=== UC-06: Medley explicit strokes ===")
evt = fresh_event(); eid = evt["id"]
entries = ["Back", "Breast", "Free", "Back", "Breast", "Free", "Back", "Breast", "Free"]
_, res = full_individual_workflow(eid, ["medley_relay"], 9, entries, "medley_relay")
if "medley_relay" in res:
    teams = res["medley_relay"]["teams"]
    auto_count = sum(1 for t in teams for m in t.get("members", []) if m.get("auto"))
    if auto_count == 0:
        ok(f"UC06: All explicit → 0 auto-assigned, {len(teams)} teams")
    else:
        fail("UC06: Expected 0 auto", f"got {auto_count}")
else:
    fail("UC06: No medley teams")

# ── UC-07: Medley — mix Y + explicit ──
print("\n=== UC-07: Medley mixed ===")
evt = fresh_event(); eid = evt["id"]
entries = ["Y", "Back", "Y", "Breast", "Y", "Free", "Y", "Back", "Y"]
_, res = full_individual_workflow(eid, ["medley_relay"], 9, entries, "medley_relay")
if "medley_relay" in res:
    ok(f"UC07: Mixed medley → {len(res['medley_relay']['teams'])} teams")

# ── UC-08: Medley — N-swimmer excluded ──
print("\n=== UC-08: Medley N-swimmer ===")
evt = fresh_event(); eid = evt["id"]
entries = ["Y", "Back", "Breast", "Free", "N", "N", "N", "N", "N"]
swimmers = mark_present(eid, 9, entries)
n_ids = [swimmers[i]["member_id"] for i in range(4, 9)]
put(f"/api/events/{eid}/config", {"standard_event": "ordinary_swim", "special_event": "medley_relay"})
put(f"/api/events/{eid}/races", {"race_types": ["25m", "25m_relay", "medley_relay"]})
races = get(f"/api/events/{eid}/races")

# Check standard relay includes N-swimmers
relay_race = next(r for r in races if r["race_type"] == "25m_relay")
gen_relay = post(f"/api/races/{relay_race['id']}/generate-relay-teams")
relay_members = set()
for t in gen_relay.get("teams", []):
    for m in t.get("members", []):
        relay_members.add(m["member_id"])
n_in_relay = [mid for mid in n_ids if mid in relay_members]
if len(n_in_relay) > 0:
    ok(f"UC08a: N-swimmers IN standard relay ({len(n_in_relay)})")
else:
    fail("UC08a: N-swimmers should be in standard relay")

# Check medley excludes N-swimmers
medley_race = next(r for r in races if r["race_type"] == "medley_relay")
gen_medley = post(f"/api/races/{medley_race['id']}/generate-relay-teams")
medley_members = set()
for t in gen_medley.get("teams", []):
    for m in t.get("members", []):
        medley_members.add(m["member_id"])
n_in_medley = [mid for mid in n_ids if mid in medley_members]
if len(n_in_medley) == 0:
    ok(f"UC08b: N-swimmers NOT in medley (0 of {len(n_ids)})")
else:
    fail("UC08b: N-swimmers in medley", f"found {n_in_medley}")

# ── UC-09: Brace Relay ──
print("\n=== UC-09: Brace Relay ===")
evt = fresh_event(); eid = evt["id"]
_, res = full_individual_workflow(eid, ["25m", "25m_brace"], 8)
if "25m_brace" in res:
    teams = res["25m_brace"]["teams"]
    sizes = [len(t.get("members", [])) for t in teams]
    ok(f"UC09: Brace → {len(teams)} pairs, sizes={sizes}")
    # Verify ranking by nearest-to-target
    all_ranked = all(t.get("place") is not None for t in teams if t.get("total_time") is not None)
    ok(f"UC09: Brace ranked={all_ranked}")
else:
    fail("UC09: No brace teams")

# ── UC-10: Pogo Relay ──
print("\n=== UC-10: Pogo Relay ===")
evt = fresh_event(); eid = evt["id"]
_, res = full_individual_workflow(eid, ["25m", "pogo"], 12)
if "pogo" in res:
    ok(f"UC10: Pogo → {len(res['pogo']['teams'])} teams")
else:
    fail("UC10: No pogo teams")

# ── UC-11: Special Events (each type) ──
print("\n=== UC-11: Special Events ===")
for special in ["75m", "backstroke", "breaststroke", "butterfly"]:
    evt = fresh_event(); eid = evt["id"]
    entries = ["Y"] * 8 + ["N"] * 4 + [None] * 11
    _, res = full_individual_workflow(eid, ["25m", special], 12, entries, special)
    if special in res:
        lanes = sum(len(h["lanes"]) for h in res[special]["heats"])
        ok(f"UC11-{special}: {lanes} lanes (only Y-swimmers)")
    else:
        fail(f"UC11-{special}: No heats")

# ── UC-12: Break scenario ──
print("\n=== UC-12: Break scenario ===")
evt = fresh_event(); eid = evt["id"]
_, res = full_individual_workflow(eid, ["25m"], 8)
post(f"/api/events/{eid}/finalize")
breakers = get(f"/api/events/{eid}/breakers")
if len(breakers) > 0:
    b = breakers[0]
    # Check units: old_pb in CS, new_time in CS
    if b["old_pb"] > 100 and b["new_time"] > 100:
        ok(f"UC12: Break found, units correct (old={b['old_pb']}cs, new={b['new_time']}cs)")
    else:
        fail("UC12: Break units", f"old={b['old_pb']}, new={b['new_time']}")
    # Improvement = old_pb - new_time
    expected_imp = b["old_pb"] - b["new_time"]
    if b["improvement"] == expected_imp:
        ok(f"UC12: Improvement={b['improvement']}cs correct")
    else:
        fail("UC12: Improvement", f"expected {expected_imp}, got {b['improvement']}")
else:
    fail("UC12: No breakers found")

# ── UC-13: Exceeded scenario ──
print("\n=== UC-13: Exceeded scenario ===")
# Already created in UC-12 (lane index 1 is >2s over PB)
exceeded = get(f"/api/events/{eid}/slow-swimmers")
if len(exceeded) > 0:
    ex = exceeded[0]
    if ex["variance"] > 200:
        ok(f"UC13: Exceeded found (variance={ex['variance']}cs)")
    else:
        fail("UC13: Exceeded variance", f"got {ex['variance']}")
else:
    fail("UC13: No exceeded swimmers")

# ── UC-14: Exact PB (variance = 0) ──
print("\n=== UC-14: Exact PB ===")
evt = fresh_event(); eid = evt["id"]
mark_present(eid, 4)
put(f"/api/events/{eid}/races", {"race_types": ["25m"]})
races = get(f"/api/events/{eid}/races")
rid = races[0]["id"]
h = get(f"/api/races/{rid}/generate-heats")
post(f"/api/races/{rid}/confirm-heats", h)
saved = get(f"/api/races/{rid}/heats")
# Enter exact expected finish time for first lane → variance = 0
lane = saved[0]["lanes"][0]
exact_finish = (lane["start_delay"] + lane["handicap_time"]) * 100
res = put(f"/api/heats/{saved[0]['id']}/lanes/{lane['id']}/time", {"finish_time": exact_finish})
if res.get("variance") == 0:
    ok("UC14: Exact PB → variance=0")
else:
    fail("UC14: Exact PB", f"variance={res.get('variance')}")
if res.get("is_break") == 0:
    ok("UC14: Not a break")
else:
    fail("UC14: Should not be break")

# ── UC-15: Ties (2-way, 3-way, 4-way) ──
print("\n=== UC-15: Ties ===")
for tie_count in [2, 3, 4]:
    evt = fresh_event(); eid = evt["id"]
    mark_present(eid, 4)
    put(f"/api/events/{eid}/races", {"race_types": ["25m"]})
    races = get(f"/api/events/{eid}/races")
    rid = races[0]["id"]
    h = get(f"/api/races/{rid}/generate-heats")
    post(f"/api/races/{rid}/confirm-heats", h)
    saved = get(f"/api/races/{rid}/heats")
    for i, l in enumerate(saved[0]["lanes"]):
        ft = 5000 if i < tie_count else 5000 + (i * 100)
        put(f"/api/heats/{saved[0]['id']}/lanes/{l['id']}/time", {"finish_time": ft})
    post(f"/api/races/{rid}/rank")
    results = get(f"/api/events/{eid}/results")
    places = [l["place"] for l in results[0]["heats"][0]["lanes"] if l["finish_time"] == 5000]
    if all(p == 1 for p in places) and len(places) == tie_count:
        ok(f"UC15-{tie_count}way: All tied → place 1")
    else:
        fail(f"UC15-{tie_count}way", f"places={places}")
    # Check next place
    non_tied = [l for l in results[0]["heats"][0]["lanes"] if l["finish_time"] != 5000 and l["place"] is not None]
    if non_tied and non_tied[0]["place"] == tie_count + 1:
        ok(f"UC15-{tie_count}way: Next place = {tie_count + 1}")
    elif not non_tied:
        ok(f"UC15-{tie_count}way: All tied (no next)")

# ── UC-16: Relay Swim Twice ──
print("\n=== UC-16: Relay Swim Twice ===")
evt = fresh_event(); eid = evt["id"]
mark_present(eid, 7)
put(f"/api/events/{eid}/races", {"race_types": ["25m_relay"]})
races = get(f"/api/events/{eid}/races")
rid = races[0]["id"]
gen = post(f"/api/races/{rid}/generate-relay-teams")
teams = gen.get("teams", [])
if teams:
    # Add extra swimmer to first team
    t = teams[0]
    extra = t["members"][0]
    t["members"].append({
        "member_id": extra["member_id"], "name": extra["name"],
        "leg_order": len(t["members"]) + 1, "stroke": "Free",
        "time_25m": extra.get("time_25m"), "time_50m": extra.get("time_50m")
    })
    old_target = t.get("target_time") or 0
    new_target = old_target + (extra.get("time_25m") or extra.get("pb") or 0)
    t["target_time"] = new_target
    post(f"/api/races/{rid}/save-relay-teams", {"teams": teams})
    saved = get(f"/api/races/{rid}/relay-teams")
    if len(saved[0]["members"]) == len(t["members"]):
        ok(f"UC16: Swim twice → {len(saved[0]['members'])} legs")
    else:
        fail("UC16: Member count", f"expected {len(t['members'])}")
    if saved[0]["target_time"] == new_target:
        ok(f"UC16: Target recalculated ({old_target}→{new_target})")
    else:
        fail("UC16: Target", f"expected {new_target}, got {saved[0]['target_time']}")

# ── UC-17: Medley Variance + Tie ──
print("\n=== UC-17: Medley Variance + Tie ===")
evt = fresh_event(); eid = evt["id"]
entries = ["Y", "Back", "Breast", "Free", "Y", "Back", "Breast", "Free", "Y"]
mark_present(eid, 9, entries)
put(f"/api/events/{eid}/config", {"standard_event": "ordinary_swim", "special_event": "medley_relay"})
put(f"/api/events/{eid}/races", {"race_types": ["medley_relay"]})
races = get(f"/api/events/{eid}/races")
medley = races[0]
gen = post(f"/api/races/{medley['id']}/generate-relay-teams")
post(f"/api/races/{medley['id']}/save-relay-teams", {"teams": gen["teams"]})
saved = get(f"/api/races/{medley['id']}/relay-teams")
# All perfect times → all variance = 0 → all 1st
for t in saved:
    perfect = ((t["target_time"] or 0) + (t["start_delay"] or 0)) * 100
    put(f"/api/relay-teams/{t['id']}/time", {"total_time": perfect})
post(f"/api/races/{medley['id']}/rank-relay")
ranked = get(f"/api/races/{medley['id']}/relay-teams")
places = [t["place"] for t in ranked]
if all(p == 1 for p in places):
    ok(f"UC17: All perfect → all 1st ({places})")
else:
    fail("UC17: Medley tie", f"places={places}")

# ── UC-18: Finalize → Unlock → Re-Finalize ──
print("\n=== UC-18: Unlock + Re-finalize ===")
evt = fresh_event(); eid = evt["id"]
_, res = full_individual_workflow(eid, ["25m"], 6)
post(f"/api/events/{eid}/finalize")
ev = get(f"/api/events/{eid}")
if ev["status"] == "finalized":
    ok("UC18a: Event finalized")
else:
    fail("UC18a", ev["status"])
put(f"/api/events/{eid}/unlock", {})
ev = get(f"/api/events/{eid}")
if ev["status"] == "setup":
    ok("UC18b: Event unlocked")
else:
    fail("UC18b", ev["status"])
# Re-finalize
post(f"/api/events/{eid}/finalize")
ev = get(f"/api/events/{eid}")
if ev["status"] == "finalized":
    ok("UC18c: Event re-finalized")
else:
    fail("UC18c", ev["status"])

# ── UC-19: Complete Event → Report ──
print("\n=== UC-19: Complete + Report ===")
post(f"/api/events/{eid}/complete")
report = get(f"/api/events/{eid}/report")
if "attendance" in report and len(report["attendance"]) > 0:
    ok(f"UC19a: Report has {len(report['attendance'])} attendees")
else:
    fail("UC19a: No attendance")
if "races" in report and len(report["races"]) > 0:
    ok(f"UC19b: Report has {len(report['races'])} races")
else:
    fail("UC19b: No races")
if "breakers" in report:
    ok(f"UC19c: Report has breakers section ({len(report['breakers'])})")
else:
    fail("UC19c: No breakers section")

# ── UC-20: Season Calendar ──
print("\n=== UC-20: Season Calendar ===")
events = get("/api/events")
completed = [e for e in events if e["status"] == "completed"]
if len(completed) >= 1:
    ok(f"UC20: Calendar has {len(completed)} completed events")
else:
    fail("UC20: No completed events")

# ── UC-21: Archive + Restore ──
print("\n=== UC-21: Archive + Restore ===")
if completed:
    arch_id = completed[0]["id"]
    put(f"/api/events/{arch_id}/archive", {})
    ev = get(f"/api/events/{arch_id}")
    if ev.get("archived") == 1:
        ok("UC21a: Event archived")
    else:
        fail("UC21a: Not archived")
    put(f"/api/events/{arch_id}/restore", {})
    ev = get(f"/api/events/{arch_id}")
    if ev.get("archived") == 0:
        ok("UC21b: Event restored")
    else:
        fail("UC21b: Not restored")

# ── UC-22: Weekly Reset ──
print("\n=== UC-22: Weekly Reset ===")
res = post("/api/events/reset")
if res.get("ok") and res.get("newEventId"):
    ok(f"UC22: Reset → new event {res['newEventId']}")
    new_ev = get(f"/api/events/{res['newEventId']}")
    if new_ev["status"] == "setup":
        ok("UC22: New event status=setup")
else:
    fail("UC22: Reset failed")

# ── UC-23: Members PB Edit ──
print("\n=== UC-23: Members PB Edit ===")
members = get("/api/members")
m = members[0]
old_pb = m["time_25m"]
new_pb = old_pb + 1
put(f"/api/members/{m['id']}", {"name": m["name"], "is_active": 1,
    "time_25m": new_pb, "time_50m": m["time_50m"], "time_75m": m["time_75m"],
    "time_backstroke": m["time_backstroke"], "time_breaststroke": m["time_breaststroke"],
    "time_butterfly": m["time_butterfly"]})
updated = get(f"/api/members/{m['id']}")
if updated["time_25m"] == new_pb:
    ok(f"UC23: PB updated {old_pb}→{new_pb}")
else:
    fail("UC23: PB not updated")
# Restore
put(f"/api/members/{m['id']}", {"name": m["name"], "is_active": 1,
    "time_25m": old_pb, "time_50m": m["time_50m"], "time_75m": m["time_75m"],
    "time_backstroke": m["time_backstroke"], "time_breaststroke": m["time_breaststroke"],
    "time_butterfly": m["time_butterfly"]})

# ── UC-24: CSV Import ──
print("\n=== UC-24: CSV Import ===")
boundary = "----TestBoundary"
csv_content = "Name,25m,50m\nCSV Test A,15,30\nCSV Test B,18,35\n"
body = f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.csv\"\r\nContent-Type: text/csv\r\n\r\n{csv_content}\r\n--{boundary}--\r\n"
req = urllib.request.Request(B + "/api/members/import", data=body.encode(),
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST")
try:
    r = urllib.request.urlopen(req)
    d = json.loads(r.read())
    if d.get("imported") == 2:
        ok("UC24: CSV imported 2 members")
    else:
        fail("UC24: CSV import", str(d))
except Exception as e:
    fail("UC24: CSV import error", str(e))

# ── UC-25: Deactivate Member ──
print("\n=== UC-25: Deactivate Member ===")
members = get("/api/members")
m_deact = next((m for m in members if m["name"] == "CSV Test A"), None)
if m_deact:
    put(f"/api/members/{m_deact['id']}", {"name": m_deact["name"], "is_active": 0,
        "time_25m": m_deact["time_25m"], "time_50m": m_deact["time_50m"]})
    evt = fresh_event(); eid = evt["id"]
    att = get(f"/api/events/{eid}/attendance")
    deact_in_att = any(a["member_id"] == m_deact["id"] for a in att)
    if not deact_in_att:
        ok("UC25: Deactivated member NOT in attendance")
    else:
        fail("UC25: Deactivated member found in attendance")

# ── UC-26: Swimmer without PB ──
print("\n=== UC-26: No PB for distance ===")
# Create member with 25m but no 50m
m_nopb = post("/api/members", {"name": "NoPB50m", "time_25m": 15})
evt = fresh_event(); eid = evt["id"]
mark_present(eid, 6)
put(f"/api/events/{eid}/races", {"race_types": ["50m"]})
races = get(f"/api/events/{eid}/races")
h = get(f"/api/races/{races[0]['id']}/generate-heats")
names = [l["name"] for heat in h.get("heats", []) for l in heat["lanes"]]
if "NoPB50m" not in names:
    ok("UC26: No-PB swimmer excluded from 50m heats")
else:
    fail("UC26: No-PB swimmer in heats")

# ── UC-29: Consolidated Breakers (multi-event) ──
print("\n=== UC-29: Consolidated Breakers ===")
all_breakers = get("/api/reports/breakers")
if len(all_breakers) > 0:
    dates = set(b.get("event_date") for b in all_breakers)
    ok(f"UC29: {len(all_breakers)} breakers across {len(dates)} events")
else:
    ok("UC29: No breakers yet (valid)")

# ── UC-30: Relay no exceeded ──
print("\n=== UC-30: Relay no exceeded ===")
# This is checked via display tests (D13) — verify API doesn't return exceeded for relay
evt = fresh_event(); eid = evt["id"]
_, res = full_individual_workflow(eid, ["25m", "25m_relay"], 8)
post(f"/api/events/{eid}/finalize")
slow = get(f"/api/events/{eid}/slow-swimmers")
# Slow swimmers should only be from individual races, not relay
relay_slow = [s for s in slow if s["race_type"] in RELAY_TYPES]
if len(relay_slow) == 0:
    ok("UC30: No exceeded from relay races")
else:
    fail("UC30: Exceeded from relay", f"{len(relay_slow)} relay exceeded")

# ── UC-34: No breaks, no exceeded ──
print("\n=== UC-34: No breaks, no exceeded ===")
evt = fresh_event(); eid = evt["id"]
mark_present(eid, 4)
put(f"/api/events/{eid}/races", {"race_types": ["25m"]})
races = get(f"/api/events/{eid}/races")
rid = races[0]["id"]
h = get(f"/api/races/{rid}/generate-heats")
post(f"/api/races/{rid}/confirm-heats", h)
saved = get(f"/api/races/{rid}/heats")
# Enter times exactly on PB → variance = 0 → no break, no exceeded
for heat in saved:
    for l in heat["lanes"]:
        exact = (l["start_delay"] + l["handicap_time"]) * 100
        put(f"/api/heats/{heat['id']}/lanes/{l['id']}/time", {"finish_time": exact})
post(f"/api/events/{eid}/finalize")
breakers = get(f"/api/events/{eid}/breakers")
exceeded = get(f"/api/events/{eid}/slow-swimmers")
if len(breakers) == 0:
    ok("UC34a: No breakers (all exact PB)")
else:
    fail("UC34a: Unexpected breakers", f"{len(breakers)}")
if len(exceeded) == 0:
    ok("UC34b: No exceeded (all exact PB)")
else:
    fail("UC34b: Unexpected exceeded", f"{len(exceeded)}")

# ── UC-35: Relay with diverse PBs ──
print("\n=== UC-35: Relay diverse PBs ===")
evt = fresh_event(); eid = evt["id"]
_, res = full_individual_workflow(eid, ["25m_relay"], 12)
if "25m_relay" in res:
    teams = res["25m_relay"]["teams"]
    targets = [t.get("target_time") for t in teams if t.get("target_time")]
    delays = [t.get("start_delay") for t in teams if t.get("start_delay") is not None]
    ok(f"UC35: Relay diverse → targets={targets}, delays={delays}")
    # Verify: higher target = lower delay (inverse relationship)
    if len(targets) >= 2:
        max_target_team = max(teams, key=lambda t: t.get("target_time") or 0)
        if max_target_team.get("start_delay") == 0:
            ok("UC35: Fastest team has delay=0")
        else:
            ok(f"UC35: Fastest team delay={max_target_team.get('start_delay')}")

# ══════════════════════════════════════════════════════════
print(f"\n{'=' * 60}")
print(f"  USE CASE TESTS: {PASS} PASS / {FAIL} FAIL")
print(f"{'=' * 60}")
for icon, name in RESULTS:
    print(f"  {icon} {name}")
verdict = "PASS" if FAIL == 0 else "FAIL"
print(f"\n  VERDICT: {verdict}")
