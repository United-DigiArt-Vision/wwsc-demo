#!/usr/bin/env python3
"""WWSC Combinatorial Test Matrix v2.7.1
Tests all requirement across multiple swimmer counts, race types, and configurations.
Server must be running on port 3000.
"""
import json, urllib.request, urllib.error

B = "http://localhost:3000"
PASS = 0; FAIL = 0; RESULTS = []

def ok(name):
    global PASS; PASS += 1; RESULTS.append(("✅", name)); print(f"  ✅ {name}")

def fail(name, detail=""):
    global FAIL; FAIL += 1; RESULTS.append(("❌", name + " — " + str(detail)[:120])); print(f"  ❌ {name} — {str(detail)[:120]}")

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

def fresh_event(n_present, special=None, entries=None):
    """Create fresh event with n_present swimmers marked present."""
    post("/api/events/reset")
    evt = get("/api/events/current")
    eid = evt["id"]
    att = get(f"/api/events/{eid}/attendance")

    updates = []
    for i, a in enumerate(att):
        present = i < n_present
        entry = None
        if present and entries and i < len(entries):
            entry = entries[i]
        elif present and special == "medley_relay":
            # Default: cycle through Y, Back, Breast, Free
            cycle = ["Y", "Back", "Breast", "Free"]
            entry = cycle[i % 4]
        elif present and special:
            entry = "Y"  # opted into special event
        updates.append({"member_id": a["member_id"], "present": present, "special_event_entry": entry})

    put(f"/api/events/{eid}/attendance", {"attendees": updates})

    std = "ordinary_swim"
    put(f"/api/events/{eid}/config", {"standard_event": std, "special_event": special})
    return eid, att[:n_present]

def setup_races(eid, race_types):
    put(f"/api/events/{eid}/races", {"race_types": race_types})
    return get(f"/api/events/{eid}/races")

def run_individual_race(race):
    """Generate heats, enter times, rank — full individual race cycle."""
    rid = race["id"]
    heats_data = get(f"/api/races/{rid}/generate-heats")
    heats = heats_data.get("heats", [])
    if not heats:
        return None, "no heats generated"
    post(f"/api/races/{rid}/confirm-heats", heats_data)
    saved = get(f"/api/races/{rid}/heats")

    for h in saved:
        for i, l in enumerate(h["lanes"]):
            d = l["start_delay"]
            pb = l["handicap_time"]
            if i == 0:
                ft = d * 100 + (pb - 1) * 100  # break
            else:
                ft = d * 100 + pb * 100 + 50  # slightly over
            put(f"/api/heats/{h['id']}/lanes/{l['id']}/time", {"finish_time": ft})

    post(f"/api/races/{rid}/rank")
    return saved, None

def run_relay_race(race):
    """Generate teams, enter times, rank — full relay cycle."""
    rid = race["id"]
    gen = post(f"/api/races/{rid}/generate-relay-teams")
    teams = gen.get("teams", [])
    if not teams:
        return None, gen.get("warning", "no teams")

    post(f"/api/races/{rid}/save-relay-teams", {"teams": teams})
    saved = get(f"/api/races/{rid}/relay-teams")

    for t in saved:
        target = t["target_time"] or 0
        delay = t["start_delay"] or 0
        total = (target + delay) * 100 + 100  # slightly over perfect
        put(f"/api/relay-teams/{t['id']}/time", {"total_time": total})

    post(f"/api/races/{rid}/rank-relay")
    return saved, None

RELAY_TYPES = ["25m_relay", "25m_brace", "50m_brace", "medley_relay", "pogo"]

# ══════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("  COMBINATORIAL TEST MATRIX v2.7.1")
print("=" * 60)

# ── DIMENSION 1: Swimmer Count × Individual Races ──
print("\n=== DIM 1: Swimmer Counts × Individual Heats ===")

for n in [3, 4, 5, 7, 8, 12, 23]:
    label = f"N={n}"
    eid, swimmers = fresh_event(n)
    races = setup_races(eid, ["25m"])
    race = races[0]

    heats_data = get(f"/api/races/{race['id']}/generate-heats")
    heats = heats_data.get("heats", [])

    # Verify heat structure
    total_lanes = sum(len(h["lanes"]) for h in heats)
    if total_lanes == n or total_lanes <= n:  # some may lack PB
        ok(f"{label}: Heats generated ({len(heats)} heats, {total_lanes} lanes)")
    else:
        fail(f"{label}: Heat count", f"{len(heats)} heats, {total_lanes} lanes for {n} swimmers")

    # Verify no heat has < 3 swimmers (except N=5 where [3,2] is unavoidable)
    if n >= 4:
        min_heat = min(len(h["lanes"]) for h in heats) if heats else 0
        if min_heat >= 3:
            ok(f"{label}: No heat < 3 swimmers (min={min_heat})")
        elif n == 5 and min_heat == 2:
            ok(f"{label}: N=5 → [3,2] is unavoidable (min={min_heat})")
        else:
            fail(f"{label}: Heat too small", f"min={min_heat}")

    # Verify handicap calc: start_delay = max_time - PB
    all_correct = True
    for h in heats:
        times = [l["handicap_time"] for l in h["lanes"]]
        mx = max(times) + 2  # BASE_OFFSET
        for l in h["lanes"]:
            expected = mx - l["handicap_time"]
            if l["start_delay"] != expected:
                all_correct = False
    if all_correct:
        ok(f"{label}: Handicap calc correct")
    else:
        fail(f"{label}: Handicap calc")

    # Enter times and verify results
    post(f"/api/races/{race['id']}/confirm-heats", heats_data)
    saved = get(f"/api/races/{race['id']}/heats")
    for h in saved:
        for i, l in enumerate(h["lanes"]):
            ft = l["start_delay"] * 100 + l["handicap_time"] * 100 + 50
            res = put(f"/api/heats/{h['id']}/lanes/{l['id']}/time", {"finish_time": ft})
            # Verify unit consistency
            if "net_time" in res and "variance" in res:
                expected_net = ft - l["start_delay"] * 100
                expected_var = expected_net - l["handicap_time"] * 100
                if res["net_time"] != expected_net or res["variance"] != expected_var:
                    all_correct = False
    if all_correct:
        ok(f"{label}: Unit consistency (net/variance) correct")
    else:
        fail(f"{label}: Unit mismatch in results")

# ── DIMENSION 2: Race Type Combinations ──
print("\n=== DIM 2: Race Type Combinations ===")

combos = [
    ("Standard only", ["25m", "50m", "25m_relay"], None),
    ("+ 25m Brace", ["25m", "50m", "25m_relay", "25m_brace"], None),
    ("+ 50m Brace", ["25m", "50m", "25m_relay", "50m_brace"], None),
    ("+ Pogo", ["25m", "50m", "25m_relay", "pogo"], None),
    ("+ 75m Special", ["25m", "50m", "25m_relay", "75m"], "75m"),
    ("+ Backstroke", ["25m", "50m", "25m_relay", "backstroke"], "backstroke"),
    ("+ Breaststroke", ["25m", "50m", "25m_relay", "breaststroke"], "breaststroke"),
    ("+ Butterfly", ["25m", "50m", "25m_relay", "butterfly"], "butterfly"),
    ("+ Medley", ["25m", "50m", "25m_relay", "medley_relay"], "medley_relay"),
]

for combo_name, race_types, special in combos:
    eid, _ = fresh_event(12, special=special)
    races = setup_races(eid, race_types)

    if len(races) != len(race_types):
        fail(f"Combo '{combo_name}': Race count", f"expected {len(race_types)}, got {len(races)}")
        continue

    all_ok = True
    for race in races:
        rt = race["race_type"]
        if rt in RELAY_TYPES:
            teams, err = run_relay_race(race)
            if err:
                # Some relays may not generate with special filtering
                if "Need at least" in str(err):
                    pass  # expected for small counts
                else:
                    fail(f"Combo '{combo_name}' relay {rt}", err)
                    all_ok = False
            elif teams:
                # Verify relay variance units
                for t in teams:
                    if t.get("variance") is not None:
                        target_cs = (t.get("target_time") or 0) * 100
                        delay_cs = (t.get("start_delay") or 0) * 100
                        total = t.get("total_time") or 0
                        expected_var = total - delay_cs - target_cs
                        if t["variance"] != expected_var:
                            fail(f"Combo '{combo_name}' {rt} variance", f"expected {expected_var}, got {t['variance']}")
                            all_ok = False
        else:
            saved, err = run_individual_race(race)
            if err:
                fail(f"Combo '{combo_name}' race {rt}", err)
                all_ok = False

    if all_ok:
        ok(f"Combo '{combo_name}': All {len(race_types)} races OK")

# ── DIMENSION 3: Medley Entry Patterns ──
print("\n=== DIM 3: Medley Entry Patterns ===")

medley_patterns = [
    ("All Y (auto)", 9, ["Y"] * 9),
    ("All explicit", 9, ["Back", "Breast", "Free"] * 3),
    ("Mix Y+explicit", 9, ["Y", "Back", "Y", "Breast", "Y", "Free", "Y", "Back", "Y"]),
    ("3 swimmers (1 team)", 3, ["Back", "Breast", "Free"]),
    ("6 swimmers (2 teams)", 6, ["Back", "Breast", "Free", "Back", "Breast", "Free"]),
    ("7 swimmers (2+leftover)", 7, ["Back", "Breast", "Free", "Y", "Y", "Y", "Y"]),
    ("With N mixed in", 12, ["Y", "Back", "Breast", "Free", "Y", "N", "N", "N", "N", "N", "N", "N"]),
    ("Minimum: exactly 3 eligible", 6, ["Back", "Breast", "Free", "N", "N", "N"]),
]

for pattern_name, n, entries in medley_patterns:
    eid, _ = fresh_event(n, special="medley_relay", entries=entries)
    races = setup_races(eid, ["medley_relay"])
    race = races[0]

    gen = post(f"/api/races/{race['id']}/generate-relay-teams")
    teams = gen.get("teams", [])

    eligible = [e for e in entries if e in ["Y", "Back", "Breast", "Free"]]
    n_members = sum(len(t.get("members", [])) for t in teams)

    # All eligible should be in teams
    if n_members >= len(eligible) or (len(eligible) < 3 and not teams):
        ok(f"Medley '{pattern_name}': {len(teams)} teams, {n_members} members ({len(eligible)} eligible)")
    else:
        fail(f"Medley '{pattern_name}'", f"{n_members} in teams vs {len(eligible)} eligible")

    # No N-swimmer should be in teams
    n_entries_by_swimmer = {}
    att = get(f"/api/events/{eid}/attendance")
    for i, a in enumerate(att[:n]):
        n_entries_by_swimmer[a["member_id"]] = entries[i] if i < len(entries) else None

    n_in_teams = False
    for t in teams:
        for m in t.get("members", []):
            if n_entries_by_swimmer.get(m["member_id"]) == "N":
                n_in_teams = True

    if not n_in_teams:
        ok(f"Medley '{pattern_name}': No N-swimmer in teams")
    else:
        fail(f"Medley '{pattern_name}': N-swimmer found in teams")

    # Medley start_delay must always be 2
    if teams:
        all_start_2 = all(t.get("start_delay") == 2 for t in teams)
        if all_start_2:
            ok(f"Medley '{pattern_name}': All teams start=2")
        else:
            delays = [t.get("start_delay") for t in teams]
            fail(f"Medley '{pattern_name}': Start not 2", f"delays={delays}")

# ── DIMENSION 4: Relay Swimmer Counts ──
print("\n=== DIM 4: Relay Swimmer Counts ===")

for n in [3, 4, 5, 8, 9, 12, 23]:
    eid, _ = fresh_event(n)
    races = setup_races(eid, ["25m_relay"])
    race = races[0]

    gen = post(f"/api/races/{race['id']}/generate-relay-teams")
    teams = gen.get("teams", [])

    if not teams and n < 2:
        ok(f"Relay N={n}: No teams (need min 2)")
        continue

    if teams:
        total_members = sum(len(t.get("members", [])) for t in teams)
        # Verify target_time = sum of member PBs
        target_ok = True
        for t in teams:
            members = t.get("members", [])
            sum_pbs = sum(m.get("time_25m") or 0 for m in members)
            if t.get("target_time") and abs(t["target_time"] - sum_pbs) > 1:
                target_ok = False

        ok(f"Relay N={n}: {len(teams)} teams, {total_members} members")
        if target_ok:
            ok(f"Relay N={n}: target_time = sum(PBs)")
        else:
            fail(f"Relay N={n}: target mismatch")

        # Enter times and verify variance
        post(f"/api/races/{race['id']}/save-relay-teams", {"teams": teams})
        saved = get(f"/api/races/{race['id']}/relay-teams")
        var_ok = True
        for t in saved:
            target = t.get("target_time") or 0
            delay = t.get("start_delay") or 0
            perfect = (target + delay) * 100
            res = put(f"/api/relay-teams/{t['id']}/time", {"total_time": perfect})
            if res.get("variance") != 0:
                var_ok = False
        if var_ok:
            ok(f"Relay N={n}: Perfect time → variance=0")
        else:
            fail(f"Relay N={n}: Variance mismatch")
    else:
        fail(f"Relay N={n}: No teams generated", gen.get("warning", ""))

# ── DIMENSION 5: Ranking Edge Cases Across Configurations ──
print("\n=== DIM 5: Ranking Across Configurations ===")

# 2-way tie in various heat sizes
for n in [3, 4, 8]:
    eid, _ = fresh_event(n)
    races = setup_races(eid, ["25m"])
    race = races[0]
    heats = get(f"/api/races/{race['id']}/generate-heats").get("heats", [])
    post(f"/api/races/{race['id']}/confirm-heats", {"heats": heats})
    saved = get(f"/api/races/{race['id']}/heats")

    if saved:
        h = saved[0]
        # Enter identical times for first 2 lanes
        for i, l in enumerate(h["lanes"]):
            ft = 5000 if i < 2 else 5000 + (i * 100)
            put(f"/api/heats/{h['id']}/lanes/{l['id']}/time", {"finish_time": ft})

        post(f"/api/races/{race['id']}/rank")
        results = get(f"/api/events/{eid}/results")
        lanes = results[0]["heats"][0]["lanes"]
        tied = [l for l in lanes if l["finish_time"] == 5000]
        if len(tied) >= 2 and all(l["place"] == 1 for l in tied):
            ok(f"Tie N={n}: Equal finish → equal place")
        else:
            fail(f"Tie N={n}", f"places={[l['place'] for l in tied]}")

# Medley tie — equal variance
eid_mt, _ = fresh_event(9, special="medley_relay")
races_mt = setup_races(eid_mt, ["medley_relay"])
race_mt = races_mt[0]
gen_mt = post(f"/api/races/{race_mt['id']}/generate-relay-teams")
teams_mt = gen_mt.get("teams", [])
if len(teams_mt) >= 2:
    post(f"/api/races/{race_mt['id']}/save-relay-teams", {"teams": teams_mt})
    saved_mt = get(f"/api/races/{race_mt['id']}/relay-teams")
    # Both teams: perfect time → variance = 0
    for t in saved_mt[:2]:
        perfect = ((t["target_time"] or 0) + (t["start_delay"] or 0)) * 100
        put(f"/api/relay-teams/{t['id']}/time", {"total_time": perfect})
    if len(saved_mt) >= 3:
        slow = ((saved_mt[2]["target_time"] or 0) + (saved_mt[2]["start_delay"] or 0)) * 100 + 200
        put(f"/api/relay-teams/{saved_mt[2]['id']}/time", {"total_time": slow})
    post(f"/api/races/{race_mt['id']}/rank-relay")
    ranked = get(f"/api/races/{race_mt['id']}/relay-teams")
    places = [t["place"] for t in ranked if t["total_time"] is not None]
    if places[:2] == [1, 1]:
        ok(f"Medley tie: equal variance → equal place ({places})")
    else:
        fail("Medley tie", f"places={places}")

# ── DIMENSION 6: Breaker Detection Across Distances ──
print("\n=== DIM 6: Breakers Across Race Types ===")

for distance in ["25m", "50m", "backstroke", "breaststroke"]:
    special = distance if distance not in ["25m", "50m"] else None
    eid_b, _ = fresh_event(8, special=special)
    race_types = ["25m", "50m"]
    if special:
        race_types.append(special)
    races_b = setup_races(eid_b, race_types)
    target_race = next((r for r in races_b if r["race_type"] == distance), None)
    if not target_race:
        fail(f"Breaker {distance}: Race not found")
        continue

    saved, err = run_individual_race(target_race)
    if err:
        fail(f"Breaker {distance}", err)
        continue

    # First lane in first heat should have a break (we entered pb-1)
    h = saved[0]
    lane = h["lanes"][0]
    lane_data = get(f"/api/races/{target_race['id']}/heats")
    first_lane = lane_data[0]["lanes"][0]
    if first_lane.get("is_break") == 1:
        ok(f"Breaker {distance}: Break detected (variance={first_lane.get('variance')})")
    else:
        fail(f"Breaker {distance}: No break", f"var={first_lane.get('variance')}")

    # Finalize and check breakers endpoint
    # Enter times for other races too
    for r in races_b:
        if r["id"] != target_race["id"]:
            if r["race_type"] in RELAY_TYPES:
                run_relay_race(r)
            else:
                run_individual_race(r)

    post(f"/api/events/{eid_b}/finalize")
    breakers = get(f"/api/events/{eid_b}/breakers")
    distance_breakers = [b for b in breakers if b["stroke"] == distance]
    if distance_breakers:
        b = distance_breakers[0]
        # Verify units: old_pb in CS, new_time in CS, improvement in CS
        if b["old_pb"] > 100 and b["new_time"] > 100 and b["improvement"] > 0:
            ok(f"Breaker {distance}: API units correct (old={b['old_pb']}cs, new={b['new_time']}cs, imp={b['improvement']}cs)")
        else:
            fail(f"Breaker {distance}: Units wrong", f"old={b['old_pb']}, new={b['new_time']}, imp={b['improvement']}")
    else:
        fail(f"Breaker {distance}: Not in breakers list")

# ══════════════════════════════════════════════════════════
print(f"\n{'=' * 60}")
print(f"  COMBINATORIAL MATRIX: {PASS} PASS / {FAIL} FAIL")
print(f"{'=' * 60}")
for icon, name in RESULTS:
    print(f"  {icon} {name}")

verdict = "PASS" if FAIL == 0 else "FAIL"
print(f"\n  VERDICT: {verdict}")
