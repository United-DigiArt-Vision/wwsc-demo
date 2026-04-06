#!/bin/bash
# Vermithrax RE-QA — Full test suite
set +e
B=http://localhost:3000
PASS=0; FAIL=0; RESULTS=""

ok() { PASS=$((PASS+1)); RESULTS="$RESULTS\n✅ $1"; echo "✅ $1"; }
fail() { FAIL=$((FAIL+1)); RESULTS="$RESULTS\n❌ $1 | $2"; echo "❌ $1 — $2"; }

# Reset DB: delete all members, reset events
curl -s -X POST $B/api/events/new-week > /dev/null 2>&1

echo "=== 1. MEMBERS CRUD ==="

# Add member
R=$(curl -s -X POST $B/api/members -H 'Content-Type: application/json' -d '{"name":"Alice Test","time_25m":15,"time_50m":30,"time_backstroke":35}')
echo "$R" | grep -q '"id":' && ok "T1: Add member" || fail "T1: Add member" "$R"

# Add special chars
R=$(curl -s -X POST $B/api/members -H 'Content-Type: application/json' -d "{\"name\":\"O'Brien-Smith\",\"time_25m\":18,\"time_50m\":33}")
echo "$R" | grep -q '"id":' && ok "T2: Special chars name" || fail "T2: Special chars name" "$R"

# List members
R=$(curl -s $B/api/members)
echo "$R" | grep -q 'Alice Test' && ok "T3a: List contains Alice" || fail "T3a: List contains Alice" "$R"
echo "$R" | grep -q "O'Brien-Smith" && ok "T3b: List contains O'Brien" || fail "T3b: List contains O'Brien" "$R"

# Get Alice's ID
ALICE_ID=$(echo "$R" | python3 -c "import sys,json;d=json.load(sys.stdin);print([m['id'] for m in d if m['name']=='Alice Test'][0])")

# Edit member
R=$(curl -s -X PUT $B/api/members/$ALICE_ID -H 'Content-Type: application/json' -d '{"name":"Alice Test","is_active":1,"time_25m":14,"time_50m":28,"time_backstroke":35}')
echo "$R" | grep -q '"ok":true' && ok "T4: Edit member" || fail "T4: Edit member" "$R"
R=$(curl -s $B/api/members/$ALICE_ID)
echo "$R" | grep -q '"time_25m":14' && ok "T4b: PB updated" || fail "T4b: PB updated" "$R"

# Deactivate
R=$(curl -s -X PUT $B/api/members/$ALICE_ID -H 'Content-Type: application/json' -d '{"name":"Alice Test","is_active":0,"time_25m":14,"time_50m":28,"time_backstroke":35}')
R=$(curl -s $B/api/members/$ALICE_ID)
echo "$R" | grep -q '"is_active":0' && ok "T5: Deactivate member" || fail "T5: Deactivate member" "$R"

# Re-activate for later tests
curl -s -X PUT $B/api/members/$ALICE_ID -H 'Content-Type: application/json' -d '{"name":"Alice Test","is_active":1,"time_25m":14,"time_50m":28,"time_backstroke":35}' > /dev/null

# Empty name rejected
R=$(curl -s -X POST $B/api/members -H 'Content-Type: application/json' -d '{"name":"","time_25m":10}')
echo "$R" | grep -q '"error"' && ok "T6: Empty name rejected" || fail "T6: Empty name rejected" "$R"

echo ""
echo "=== 1b. CSV IMPORT ==="

# Valid CSV
CSV="Name,25m,50m,backstroke\nBob CSV,16,31,36\nCarol CSV,17,32,37\nDave CSV,18,33,38\nEve CSV,19,34,39\nFrank CSV,20,35,40\nGrace CSV,21,36,41"
R=$(curl -s -X POST $B/api/members/import -F "file=@-;filename=test.csv" <<< "$(echo -e "$CSV")")
echo "$R" | grep -q '"imported":6' && ok "T7: CSV import 6" || fail "T7: CSV import 6" "$R"

# CSV empty
R=$(curl -s -X POST $B/api/members/import -F "file=@-;filename=empty.csv" <<< "Name,25m")
echo "$R" | grep -q 'No members found' && ok "T8: CSV empty → error" || fail "T8: CSV empty → error" "$R"

# CSV missing Name column (FIX #4)
R=$(curl -s -X POST $B/api/members/import -F "file=@-;filename=bad.csv" <<< "$(echo -e "id,25m\n1,15")")
echo "$R" | grep -qi 'missing\|name' && ok "T9: CSV missing Name → error (FIX#4)" || fail "T9: CSV missing Name → error (FIX#4)" "$R"

# CSV bad times
R=$(curl -s -X POST $B/api/members/import -F "file=@-;filename=bad2.csv" <<< "$(echo -e "Name,25m\nTest,abc")")
echo "$R" | grep -qi 'invalid' && ok "T10: CSV bad times → error" || fail "T10: CSV bad times → error" "$R"

# CSV empty time fields → null
R=$(curl -s -X POST $B/api/members/import -F "file=@-;filename=null.csv" <<< "$(echo -e "Name,25m,50m\nNullGuy,,")")
echo "$R" | grep -q '"imported":1' && ok "T11a: CSV empty times imported" || fail "T11a: CSV empty times imported" "$R"
R=$(curl -s $B/api/members)
NULLCHECK=$(echo "$R" | python3 -c "import sys,json;d=json.load(sys.stdin);m=[x for x in d if x['name']=='NullGuy'][0];print(m['time_25m'],m['time_50m'])")
[ "$NULLCHECK" = "None None" ] && ok "T11b: Empty times are null" || fail "T11b: Empty times are null" "$NULLCHECK"

echo ""
echo "=== 2. EVENT SETUP ==="

# Create event
R=$(curl -s -X POST $B/api/events -H 'Content-Type: application/json' -d '{"date":"2026-02-17"}')
echo "$R" | grep -q '"id":' && ok "T12: Create event" || fail "T12: Create event" "$R"
EVT_ID=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")

# Event status
R=$(curl -s $B/api/events/$EVT_ID)
echo "$R" | grep -q '"status":"setup"' && ok "T13: Event status=setup" || fail "T13: Event status=setup" "$R"

# Check attendance excludes deactivated
# First deactivate O'Brien
OBRIEN_ID=$(curl -s $B/api/members | python3 -c "import sys,json;d=json.load(sys.stdin);print([m['id'] for m in d if \"O'Brien\" in m['name']][0])")
curl -s -X PUT $B/api/members/$OBRIEN_ID -H 'Content-Type: application/json' -d "{\"name\":\"O'Brien-Smith\",\"is_active\":0,\"time_25m\":18,\"time_50m\":33}" > /dev/null

R=$(curl -s $B/api/events/$EVT_ID/attendance)
echo "$R" | python3 -c "import sys,json;d=json.load(sys.stdin);sys.exit(0 if not any(a['member_id']==$OBRIEN_ID for a in d) else 1)" 2>/dev/null \
  && ok "T14: Deactivated excluded from attendance" || fail "T14: Deactivated excluded" ""

# Get all member IDs from attendance
MEMBER_IDS=$(curl -s $B/api/events/$EVT_ID/attendance | python3 -c "import sys,json;d=json.load(sys.stdin);print(' '.join(str(a['member_id']) for a in d[:9]))")
read -ra MIDS <<< "$MEMBER_IDS"

# FIX #5: 0 attendees → 400
R=$(curl -s -o /dev/null -w '%{http_code}' -X PUT $B/api/events/$EVT_ID/attendance -H 'Content-Type: application/json' -d '{"attendees":[]}')
[ "$R" = "400" ] && ok "T15a: 0 attendees → 400 (FIX#5)" || fail "T15a: 0 attendees → 400 (FIX#5)" "got $R"

# Mark 9 members present
ATT_JSON=$(python3 -c "
import json
ids = [${MIDS[0]},${MIDS[1]},${MIDS[2]},${MIDS[3]},${MIDS[4]},${MIDS[5]},${MIDS[6]},${MIDS[7]},${MIDS[8]}]
print(json.dumps({'attendees':[{'member_id':i,'present':True} for i in ids]}))
")
R=$(curl -s -X PUT $B/api/events/$EVT_ID/attendance -H 'Content-Type: application/json' -d "$ATT_JSON")
echo "$R" | grep -q '"ok":true' && ok "T15b: Mark 9 present" || fail "T15b: Mark 9 present" "$R"

# FIX #5: 0 races → 400
R=$(curl -s -o /dev/null -w '%{http_code}' -X PUT $B/api/events/$EVT_ID/races -H 'Content-Type: application/json' -d '{"race_types":[]}')
[ "$R" = "400" ] && ok "T16a: 0 races → 400 (FIX#5)" || fail "T16a: 0 races → 400 (FIX#5)" "got $R"

# Set races
R=$(curl -s -X PUT $B/api/events/$EVT_ID/races -H 'Content-Type: application/json' -d '{"race_types":["25m","50m","backstroke"]}')
echo "$R" | grep -q '"ok":true' && ok "T16b: 3 races created" || fail "T16b: 3 races created" "$R"

# Dashboard
R=$(curl -s $B/api/dashboard)
echo "$R" | grep -q '"presentCount":9' && ok "T17: Dashboard counts" || fail "T17: Dashboard counts" "$R"

echo ""
echo "=== 2b. LOCK/UNLOCK (FIX #1) ==="

# Lock
R=$(curl -s -X PUT $B/api/events/$EVT_ID/lock)
echo "$R" | grep -q '"ok":true' && ok "T18a: Lock event" || fail "T18a: Lock event" "$R"

# Attendance blocked (403)
R=$(curl -s -o /dev/null -w '%{http_code}' -X PUT $B/api/events/$EVT_ID/attendance -H 'Content-Type: application/json' -d "$ATT_JSON")
[ "$R" = "403" ] && ok "T18b: Attendance blocked when locked (FIX#1)" || fail "T18b: Attendance blocked" "got $R"

# Races blocked (403)
R=$(curl -s -o /dev/null -w '%{http_code}' -X PUT $B/api/events/$EVT_ID/races -H 'Content-Type: application/json' -d '{"race_types":["25m"]}')
[ "$R" = "403" ] && ok "T18c: Races blocked when locked (FIX#1)" || fail "T18c: Races blocked" "got $R"

# Unlock
R=$(curl -s -X PUT $B/api/events/$EVT_ID/unlock)
echo "$R" | grep -q '"ok":true' && ok "T18d: Unlock event" || fail "T18d: Unlock event" "$R"

# Attendance works again
R=$(curl -s -o /dev/null -w '%{http_code}' -X PUT $B/api/events/$EVT_ID/attendance -H 'Content-Type: application/json' -d "$ATT_JSON")
[ "$R" = "200" ] && ok "T18e: Attendance works after unlock (FIX#1)" || fail "T18e: Attendance after unlock" "got $R"

echo ""
echo "=== 3. HEAT GENERATION ==="

# Get 25m race ID
RACE_25M=$(curl -s $B/api/events/$EVT_ID/races | python3 -c "import sys,json;d=json.load(sys.stdin);print([r['id'] for r in d if r['race_type']=='25m'][0])")
RACE_50M=$(curl -s $B/api/events/$EVT_ID/races | python3 -c "import sys,json;d=json.load(sys.stdin);print([r['id'] for r in d if r['race_type']=='50m'][0])")

# Generate heats for 25m (should have swimmers with PBs)
R=$(curl -s $B/api/races/$RACE_25M/generate-heats)

# Test heat distribution for various swimmer counts
# We'll create controlled test scenarios
echo ""
echo "--- Heat distribution tests (FIX #2) ---"

# Helper: create N test members, event, attendance, race, check heats
test_heat_dist() {
  local N=$1 EXPECTED="$2" LABEL="$3"
  # Create fresh event
  local EID=$(curl -s -X POST $B/api/events -H 'Content-Type: application/json' -d '{"date":"2026-02-17"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
  
  # Get active members with 25m times
  local ALL_WITH_PB=$(curl -s $B/api/events/$EID/attendance | python3 -c "
import sys,json
att = json.load(sys.stdin)
ids = [a['member_id'] for a in att]
# need to check who has 25m time
print(' '.join(str(i) for i in ids))
")
  
  # We need exactly N members with PB present. Mark N present.
  local MEMBER_ARR=($ALL_WITH_PB)
  local ATT="["
  for i in $(seq 0 $((${#MEMBER_ARR[@]}-1))); do
    [ $i -gt 0 ] && ATT="$ATT,"
    if [ $i -lt $N ]; then
      ATT="$ATT{\"member_id\":${MEMBER_ARR[$i]},\"present\":true}"
    else
      ATT="$ATT{\"member_id\":${MEMBER_ARR[$i]},\"present\":false}"
    fi
  done
  ATT="$ATT]"
  
  # Need at least 3 present
  if [ $N -lt 3 ]; then
    # Should fail with <3 swimmers
    return
  fi
  
  curl -s -X PUT $B/api/events/$EID/attendance -H 'Content-Type: application/json' -d "{\"attendees\":$ATT}" > /dev/null
  curl -s -X PUT $B/api/events/$EID/races -H 'Content-Type: application/json' -d '{"race_types":["25m"]}' > /dev/null
  local RID=$(curl -s $B/api/events/$EID/races | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['id'])")
  
  local HEATS=$(curl -s $B/api/races/$RID/generate-heats)
  local DIST=$(echo "$HEATS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
sizes=sorted([len(h['lanes']) for h in d['heats']], reverse=True)
print(sizes)
" 2>/dev/null)
  
  [ "$DIST" = "$EXPECTED" ] && ok "$LABEL: $N swimmers → $EXPECTED" || fail "$LABEL: $N swimmers → $EXPECTED" "got $DIST"
}

# First ensure we have enough members with 25m PBs
# Add more test members to have enough
for i in $(seq 1 20); do
  curl -s -X POST $B/api/members -H 'Content-Type: application/json' -d "{\"name\":\"Swimmer $i\",\"time_25m\":$((10+i)),\"time_50m\":$((25+i)),\"time_backstroke\":$((30+i))}" > /dev/null
done

test_heat_dist 3 "[3]" "T19a"
test_heat_dist 4 "[4]" "T19b"
test_heat_dist 6 "[3, 3]" "T19c"
test_heat_dist 7 "[4, 3]" "T19d"
test_heat_dist 8 "[4, 4]" "T19e"
test_heat_dist 9 "[3, 3, 3]" "T19f (FIX#2)"
test_heat_dist 10 "[4, 3, 3]" "T19g"
test_heat_dist 11 "[4, 4, 3]" "T19h"
test_heat_dist 12 "[4, 4, 4]" "T19i"
test_heat_dist 23 "[4, 4, 4, 4, 4, 3]" "T19j"

echo ""
echo "--- Handicap calculation ---"
# Test start_delay = max_time - handicap_time
R=$(curl -s $B/api/races/$RACE_25M/generate-heats)
HANDICAP_OK=$(echo "$R" | python3 -c "
import sys,json
d=json.load(sys.stdin)
ok=True
for h in d['heats']:
  times=[l['handicap_time'] for l in h['lanes']]
  mx=max(times)
  for l in h['lanes']:
    expected=mx-l['handicap_time']
    if l['start_delay']!=expected:
      ok=False
      print(f\"FAIL: {l['name']} delay={l['start_delay']} expected={expected}\")
print('OK' if ok else 'FAIL')
")
[ "$HANDICAP_OK" = "OK" ] && ok "T20: Handicap start_delay correct" || fail "T20: Handicap calc" "$HANDICAP_OK"

# Randomisation
echo ""
echo "--- Randomisation ---"
ORDERS=""
for i in $(seq 1 10); do
  O=$(curl -s $B/api/races/$RACE_25M/generate-heats | python3 -c "
import sys,json
d=json.load(sys.stdin)
ids=[l['member_id'] for h in d['heats'] for l in h['lanes']]
print(','.join(str(i) for i in ids))
" 2>/dev/null)
  ORDERS="$ORDERS $O"
done
UNIQUE=$(echo $ORDERS | tr ' ' '\n' | sort -u | wc -l)
[ "$UNIQUE" -gt 1 ] && ok "T21: Randomisation ($UNIQUE unique orders in 10 runs)" || fail "T21: Randomisation" "all same"

# Confirm heats
HEATS_DATA=$(curl -s $B/api/races/$RACE_25M/generate-heats)
curl -s -X POST $B/api/races/$RACE_25M/confirm-heats -H 'Content-Type: application/json' -d "$HEATS_DATA" > /dev/null
R=$(curl -s $B/api/races/$RACE_25M/heats)
HCOUNT=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin)))")
[ "$HCOUNT" -gt 0 ] && ok "T22: Confirmed heats persisted ($HCOUNT heats)" || fail "T22: Heats persisted" "$HCOUNT"

# Missing PB excluded
echo ""
echo "--- Missing PB ---"
# NullGuy has no 25m PB
R=$(curl -s $B/api/races/$RACE_25M/generate-heats)
echo "$R" | python3 -c "
import sys,json
d=json.load(sys.stdin)
names=[l['name'] for h in d['heats'] for l in h['lanes']]
sys.exit(1 if 'NullGuy' in names else 0)
" && ok "T23: Missing PB excluded" || fail "T23: Missing PB excluded" "NullGuy found in heats"

echo ""
echo "=== 4. SERVER STABILITY (FIX #3) ==="

# DELETE member (soft delete) - should not crash server
R=$(curl -s -X DELETE $B/api/members/$ALICE_ID)
echo "$R" | grep -q '"ok":true' && ok "T24a: DELETE member ok" || fail "T24a: DELETE member" "$R"

# Server still responding
R=$(curl -s $B/api/dashboard)
echo "$R" | grep -q 'totalMembers' && ok "T24b: Server stable after DELETE" || fail "T24b: Server crashed" "$R"

# Try to delete races that have heats (FK constraint test)
R=$(curl -s -X PUT $B/api/events/$EVT_ID/races -H 'Content-Type: application/json' -d '{"race_types":["50m"]}')
echo "$R" | grep -q '"ok":true' && ok "T24c: Replace races with heats (FK safe)" || fail "T24c: FK constraint" "$R"

# Server still alive
R=$(curl -s $B/api/dashboard)
echo "$R" | grep -q 'totalMembers' && ok "T24d: Server stable after FK operation" || fail "T24d: Server crashed" "$R"

echo ""
echo "=== 5. WEEKLY RESET (FIX #6) ==="

R=$(curl -s -X POST $B/api/events/new-week)
echo "$R" | grep -q '"ok":true' && ok "T25a: Reset returns ok" || fail "T25a: Reset" "$R"
echo "$R" | grep -q '"backup":' && ok "T25b: Reset returns backup path" || fail "T25b: Backup path" "$R"
echo "$R" | grep -q '"newEventId":' && ok "T25c: Reset creates new event (FIX#6)" || fail "T25c: New event (FIX#6)" "$R"

# Backup file exists
BPATH=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin)['backup'])" 2>/dev/null)
[ -f "$BPATH" ] && ok "T25d: Backup file exists" || fail "T25d: Backup file" "path=$BPATH"

# New event is setup
NEW_EVT=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin)['newEventId'])" 2>/dev/null)
R=$(curl -s $B/api/events/$NEW_EVT)
echo "$R" | grep -q '"status":"setup"' && ok "T25e: New event status=setup" || fail "T25e: New event status" "$R"

# Old event completed
R=$(curl -s $B/api/events/$EVT_ID)
echo "$R" | grep -q '"completed"' && ok "T25f: Old event completed" || fail "T25f: Old event" "$R"

# Members preserved
R=$(curl -s $B/api/members)
MCOUNT=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin)))")
[ "$MCOUNT" -gt 5 ] && ok "T25g: Members preserved ($MCOUNT)" || fail "T25g: Members" "$MCOUNT"

echo ""
echo "=== 6. BACKUP ==="
R=$(curl -s -X POST $B/api/backup)
echo "$R" | grep -q '"ok":true' && ok "T26: Manual backup" || fail "T26: Backup" "$R"

echo ""
echo "=== 7. API ROBUSTNESS ==="
# All GET endpoints return valid JSON
ALL_OK=true
for EP in /api/members /api/events/current /api/dashboard; do
  R=$(curl -s $B$EP)
  echo "$R" | python3 -c "import sys,json;json.load(sys.stdin)" 2>/dev/null || { ALL_OK=false; echo "  ⚠️ $EP invalid JSON"; }
done
[ "$ALL_OK" = "true" ] && ok "T27: All GETs return valid JSON" || fail "T27: JSON validity" ""

# 404 for nonexistent member
R=$(curl -s -o /dev/null -w '%{http_code}' $B/api/members/99999)
[ "$R" = "404" ] && ok "T28: 404 for nonexistent member" || fail "T28: 404" "got $R"

echo ""
echo "========================================="
echo "  RESULTS: $PASS PASS / $FAIL FAIL"
echo "========================================="
echo -e "$RESULTS"
