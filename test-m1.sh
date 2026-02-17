#!/bin/bash
# Vermithrax QA — Milestone 1 Test Suite
set -e
B=http://localhost:3000
PASS=0
FAIL=0
RESULTS=""

check() {
  local name="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    PASS=$((PASS+1))
    RESULTS="$RESULTS\nPASS | $name"
    echo "✅ PASS: $name"
  else
    FAIL=$((FAIL+1))
    RESULTS="$RESULTS\nFAIL | $name | expected=$expected actual=$actual"
    echo "❌ FAIL: $name (expected: $expected, got: $actual)"
  fi
}

check_eq() {
  local name="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    PASS=$((PASS+1))
    RESULTS="$RESULTS\nPASS | $name"
    echo "✅ PASS: $name"
  else
    FAIL=$((FAIL+1))
    RESULTS="$RESULTS\nFAIL | $name | expected=$expected actual=$actual"
    echo "❌ FAIL: $name (expected: $expected, got: $actual)"
  fi
}

echo "========================================="
echo "  VERMITHRAX QA — MILESTONE 1"
echo "========================================="

# ─── 1. MEMBER MANAGEMENT ───
echo ""
echo "=== 1. MEMBER MANAGEMENT ==="

# T1: Add member with all fields
R=$(curl -s -X POST $B/api/members -H 'Content-Type: application/json' \
  -d '{"name":"John Smith","time_25m":15,"time_50m":30,"time_75m":50,"time_backstroke":35,"time_breaststroke":40,"time_butterfly":45}')
check "T1: Add member" '"id":' "$R"

# T2: Add member with special characters
R=$(curl -s -X POST $B/api/members -H 'Content-Type: application/json' \
  -d '{"name":"O'\''Connell-Smith","time_25m":18,"time_50m":35}')
check "T2: Special chars in name" '"id":' "$R"

# T3: Verify members stored correctly
R=$(curl -s $B/api/members)
check "T3a: Member 1 in list" '"John Smith"' "$R"
check "T3b: Member 2 in list" "O'Connell-Smith" "$R"

# T4: Edit member PB
curl -s -X PUT $B/api/members/1 -H 'Content-Type: application/json' \
  -d '{"name":"John Smith","is_active":1,"time_25m":14,"time_50m":28,"time_75m":50,"time_backstroke":35,"time_breaststroke":40,"time_butterfly":45}' > /dev/null
R=$(curl -s $B/api/members/1)
check "T4: Edit PB (25m=14)" '"time_25m":14' "$R"
check "T4b: Edit PB (50m=28)" '"time_50m":28' "$R"

# T5: Deactivate member
curl -s -X PUT $B/api/members/2 -H 'Content-Type: application/json' \
  -d '{"name":"O'\''Connell-Smith","is_active":0,"time_25m":18,"time_50m":35}' > /dev/null
R=$(curl -s $B/api/members/2)
check "T5: Deactivate member" '"is_active":0' "$R"

# T6: Empty name rejected
R=$(curl -s -X POST $B/api/members -H 'Content-Type: application/json' -d '{"name":""}')
check "T6: Empty name rejected" '"error"' "$R"

# T7: CSV Import
cat > /tmp/test_members.csv << 'CSVEOF'
Name,25m,50m,75m,Backstroke,Breaststroke,Butterfly
Alice Brown,13,28,45,32,38,42
Bob Wilson,16,33,52,37,41,48
Charlie Davis,,31,,35,,
Diana Evans,14,29,47,33,39,44
Eve Foster,17,34,53,38,42,49
Frank Green,15,30,48,34,40,46
CSVEOF
R=$(curl -s -X POST $B/api/members/import -F "file=@/tmp/test_members.csv")
check "T7: CSV import 6 members" '"imported":6' "$R"

# T8: CSV with empty rows
echo "Name,25m" > /tmp/empty.csv
R=$(curl -s -X POST $B/api/members/import -F "file=@/tmp/empty.csv")
check "T8: CSV empty → error" '"No members found' "$R"

# T9: CSV missing name column
printf "Player,25m\nBob,15\n" > /tmp/noname.csv
R=$(curl -s -X POST $B/api/members/import -F "file=@/tmp/noname.csv")
check "T9: CSV missing Name col" 'Missing' "$R"

# T10: CSV non-integer times
printf "Name,25m\nBob,abc\n" > /tmp/badtime.csv
R=$(curl -s -X POST $B/api/members/import -F "file=@/tmp/badtime.csv")
check "T10: CSV bad times" 'invalid time' "$R"

# T11: CSV with empty time fields → null
R=$(curl -s $B/api/members)
# Charlie Davis should have null for 25m, 75m, breaststroke, butterfly
CHARLIE=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);c=[m for m in d if m["name"]=="Charlie Davis"][0];print(c["time_25m"],c["time_75m"])')
check_eq "T11: CSV empty fields → null" "None None" "$CHARLIE"

# ─── 2. EVENT SETUP ───
echo ""
echo "=== 2. EVENT SETUP ==="

# T12: Create event
R=$(curl -s -X POST $B/api/events -H 'Content-Type: application/json' -d '{"date":"2026-02-17"}')
check "T12: Create event" '"id":' "$R"
EVENT_ID=$(echo "$R" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')

# T13: Verify event status
R=$(curl -s $B/api/events/current)
check "T13: Event status=setup" '"status":"setup"' "$R"

# T14: Attendance excludes deactivated member
R=$(curl -s $B/api/events/$EVENT_ID/attendance)
HAS_DEACTIVATED=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);print("yes" if any(x["member_id"]==2 for x in d) else "no")')
check_eq "T14: Deactivated excluded from attendance" "no" "$HAS_DEACTIVATED"

# T15: Mark attendance (7 members present)
curl -s -X PUT $B/api/events/$EVENT_ID/attendance -H 'Content-Type: application/json' \
  -d '{"attendees":[{"member_id":1,"present":true},{"member_id":3,"present":true},{"member_id":4,"present":true},{"member_id":5,"present":true},{"member_id":6,"present":true},{"member_id":7,"present":true},{"member_id":8,"present":true}]}' > /dev/null
R=$(curl -s $B/api/events/$EVENT_ID/attendance)
PRESENT=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(sum(1 for x in d if x["present"]))')
check_eq "T15: 7 members marked present" "7" "$PRESENT"

# T16: Select races
curl -s -X PUT $B/api/events/$EVENT_ID/races -H 'Content-Type: application/json' \
  -d '{"race_types":["25m","50m","backstroke"]}' > /dev/null
R=$(curl -s $B/api/events/$EVENT_ID/races)
RACE_COUNT=$(echo "$R" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))')
check_eq "T16: 3 races created" "3" "$RACE_COUNT"

# T17: Dashboard
R=$(curl -s $B/api/dashboard)
check "T17a: Dashboard totalMembers" '"totalMembers":7' "$R"
check "T17b: Dashboard presentCount" '"presentCount":7' "$R"
check "T17c: Dashboard racesCount" '"racesCount":3' "$R"

# Get race IDs
RACES=$(curl -s $B/api/events/$EVENT_ID/races)
RACE_50M=$(echo "$RACES" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([r["id"] for r in d if r["race_type"]=="50m"][0])')

# ─── 3. HEAT BUILDER ───
echo ""
echo "=== 3. HEAT BUILDER ==="

# T18: Generate heats for 50m (7 swimmers)
R=$(curl -s "$B/api/races/$RACE_50M/generate-heats")
echo "$R" > /tmp/heats_gen.json
HEAT_INFO=$(python3 << 'PYEOF'
import json
with open('/tmp/heats_gen.json') as f:
    d = json.load(f)
heats = d['heats']
sizes = [len(h['lanes']) for h in heats]
print(f"{len(heats)}|{sizes}")
PYEOF
)
HEAT_COUNT=$(echo "$HEAT_INFO" | cut -d'|' -f1)
HEAT_SIZES=$(echo "$HEAT_INFO" | cut -d'|' -f2)
check_eq "T18a: 7 swimmers → 2 heats" "2" "$HEAT_COUNT"
check_eq "T18b: Distribution [4,3]" "[4, 3]" "$HEAT_SIZES"

# T19: Handicap calculation
python3 << 'PYEOF'
import json
with open('/tmp/heats_gen.json') as f:
    d = json.load(f)
errors = []
for h in d['heats']:
    times = [l['handicap_time'] for l in h['lanes']]
    max_t = max(times)
    for l in h['lanes']:
        expected_delay = max_t - l['handicap_time']
        if l['start_delay'] != expected_delay:
            errors.append(f"{l['name']}: expected delay {expected_delay}, got {l['start_delay']}")
if errors:
    print("FAIL|" + "; ".join(errors))
else:
    print("PASS|Handicap calc correct for all lanes")
PYEOF
HC_RESULT=$(python3 << 'PYEOF2'
import json
with open('/tmp/heats_gen.json') as f:
    d = json.load(f)
for h in d['heats']:
    times = [l['handicap_time'] for l in h['lanes']]
    max_t = max(times)
    for l in h['lanes']:
        expected_delay = max_t - l['handicap_time']
        if l['start_delay'] != expected_delay:
            print("FAIL")
            exit()
print("PASS")
PYEOF2
)
check_eq "T19: Handicap start_delay = max_time - handicap_time" "PASS" "$HC_RESULT"

# T20: Randomisation (generate 10 times, check not all identical)
UNIQUE=$(for i in $(seq 1 10); do
  curl -s "$B/api/races/$RACE_50M/generate-heats" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(",".join(str(l["member_id"]) for h in d["heats"] for l in h["lanes"]))'
done | sort -u | wc -l | tr -d ' ')
if [ "$UNIQUE" -gt 1 ]; then
  check_eq "T20: Randomisation (>1 unique order in 10 runs)" "PASS" "PASS"
else
  check_eq "T20: Randomisation (>1 unique order in 10 runs)" "PASS" "FAIL"
fi

# T21: Confirm heats → persisted
HEATS_DATA=$(curl -s "$B/api/races/$RACE_50M/generate-heats")
curl -s -X POST "$B/api/races/$RACE_50M/confirm-heats" -H 'Content-Type: application/json' -d "$HEATS_DATA" > /dev/null
R=$(curl -s "$B/api/races/$RACE_50M/heats")
SAVED_HEATS=$(echo "$R" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))')
check_eq "T21: Confirmed heats persisted" "2" "$SAVED_HEATS"

# T22: Edge — test heat distribution for various counts
# 3 swimmers
curl -s -X PUT "$B/api/events/$EVENT_ID/attendance" -H 'Content-Type: application/json' \
  -d '{"attendees":[{"member_id":1,"present":true},{"member_id":3,"present":true},{"member_id":4,"present":true},{"member_id":5,"present":false},{"member_id":6,"present":false},{"member_id":7,"present":false},{"member_id":8,"present":false}]}' > /dev/null
R=$(curl -s "$B/api/races/$RACE_50M/generate-heats")
SIZES=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([len(h["lanes"]) for h in d["heats"]])')
check_eq "T22a: 3 swimmers → [3]" "[3]" "$SIZES"

# 4 swimmers
curl -s -X PUT "$B/api/events/$EVENT_ID/attendance" -H 'Content-Type: application/json' \
  -d '{"attendees":[{"member_id":1,"present":true},{"member_id":3,"present":true},{"member_id":4,"present":true},{"member_id":5,"present":true},{"member_id":6,"present":false},{"member_id":7,"present":false},{"member_id":8,"present":false}]}' > /dev/null
R=$(curl -s "$B/api/races/$RACE_50M/generate-heats")
SIZES=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([len(h["lanes"]) for h in d["heats"]])')
check_eq "T22b: 4 swimmers → [4]" "[4]" "$SIZES"

# 5 swimmers (OQ-7: likely 1 heat of 5 as overflow)
curl -s -X PUT "$B/api/events/$EVENT_ID/attendance" -H 'Content-Type: application/json' \
  -d '{"attendees":[{"member_id":1,"present":true},{"member_id":3,"present":true},{"member_id":4,"present":true},{"member_id":5,"present":true},{"member_id":6,"present":true},{"member_id":7,"present":false},{"member_id":8,"present":false}]}' > /dev/null
R=$(curl -s "$B/api/races/$RACE_50M/generate-heats")
SIZES=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([len(h["lanes"]) for h in d["heats"]])')
echo "  INFO: 5 swimmers → $SIZES (OQ-7 open question)"
# Accept [5] or [3,3] or similar - just verify no heat < 3
MIN_SIZE=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);print(min(len(h["lanes"]) for h in d["heats"]))')
if [ "$MIN_SIZE" -ge 3 ]; then
  check_eq "T22c: 5 swimmers → no heat < 3" "PASS" "PASS"
else
  check_eq "T22c: 5 swimmers → no heat < 3" "PASS" "FAIL (min=$MIN_SIZE)"
fi

# Restore 7 for remaining tests
curl -s -X PUT "$B/api/events/$EVENT_ID/attendance" -H 'Content-Type: application/json' \
  -d '{"attendees":[{"member_id":1,"present":true},{"member_id":3,"present":true},{"member_id":4,"present":true},{"member_id":5,"present":true},{"member_id":6,"present":true},{"member_id":7,"present":true},{"member_id":8,"present":true}]}' > /dev/null

# T23: Missing PB — swimmer excluded
# Charlie Davis has no 25m time. Test 25m race.
RACE_25M=$(echo "$RACES" | python3 -c 'import sys,json;d=json.load(sys.stdin);print([r["id"] for r in d if r["race_type"]=="25m"][0])')
R=$(curl -s "$B/api/races/$RACE_25M/generate-heats")
HAS_CHARLIE=$(echo "$R" | python3 -c 'import sys,json;d=json.load(sys.stdin);names=[l["name"] for h in d["heats"] for l in h["lanes"]];print("yes" if "Charlie Davis" in names else "no")')
check_eq "T23: Missing PB excluded from heats" "no" "$HAS_CHARLIE"

# ─── 4. WEEKLY RESET ───
echo ""
echo "=== 4. WEEKLY RESET ==="

# T24: Reset creates backup
R=$(curl -s -X POST $B/api/events/reset)
check "T24a: Reset returns ok" '"ok":true' "$R"
check "T24b: Reset returns backup path" '"backup":' "$R"

# T25: Backup file exists
BACKUP_PATH=$(echo "$R" | python3 -c 'import sys,json;print(json.load(sys.stdin)["backup"])')
if [ -f "$BACKUP_PATH" ]; then
  check_eq "T25: Backup file exists" "PASS" "PASS"
else
  check_eq "T25: Backup file exists" "PASS" "FAIL"
fi

# T26: Old event completed
R=$(curl -s $B/api/events/$EVENT_ID)
check "T26: Old event completed" '"completed"' "$R"

# T27: Members preserved after reset
R=$(curl -s $B/api/members)
MEMBER_COUNT=$(echo "$R" | python3 -c 'import sys,json;print(len(json.load(sys.stdin)))')
check_eq "T27: Members preserved (9 total)" "9" "$MEMBER_COUNT"

# ─── 5. API / UI CHECKS ───
echo ""
echo "=== 5. API ENDPOINT CHECKS ==="

# T28: All endpoints respond without 500
ENDPOINTS="/api/members /api/events/current /api/dashboard"
ALL_OK=true
for EP in $ENDPOINTS; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$B$EP")
  if [ "$CODE" = "500" ]; then
    ALL_OK=false
    echo "  ❌ $EP returned 500"
  fi
done
check_eq "T28: No 500 errors on GET endpoints" "true" "$ALL_OK"

# T29: JSON responses are valid
VALID=true
for EP in $ENDPOINTS; do
  R=$(curl -s "$B$EP")
  echo "$R" | python3 -c 'import sys,json;json.load(sys.stdin)' 2>/dev/null
  if [ $? -ne 0 ]; then
    VALID=false
    echo "  ❌ $EP returned invalid JSON"
  fi
done
check_eq "T29: All responses valid JSON" "true" "$VALID"

# T30: 404 for non-existent member
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$B/api/members/9999")
check_eq "T30: 404 for non-existent member" "404" "$CODE"

echo ""
echo "========================================="
echo "  RESULTS: $PASS PASS / $FAIL FAIL"
echo "========================================="
echo -e "$RESULTS"
