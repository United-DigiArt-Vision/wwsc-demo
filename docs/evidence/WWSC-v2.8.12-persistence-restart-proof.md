# WWSC v2.8.12 Persistence Restart Proof

Date: 2026-05-06
DB Path: /tmp/wwsc-v2812-data/wwsc.db
Version after restart: {"version":"2.8.12","build":"2026-05-06T11:56:47.697Z"}
Events after restart: 2
Active finalized events after restart: 2

| Check | Status | Evidence |
|---|---|---|
| Version survives restart | PASS | 2.8.12 |
| Two saved finalized events survive restart | PASS | 1:2026-05-06:finalized:archived=0, 2:2026-05-05:finalized:archived=0 |

Raw events JSON:
```json
[
  {
    "id": 1,
    "date": "2026-05-06",
    "status": "finalized",
    "created_at": "2026-05-06T11:56:31.260Z",
    "standard_event": "ordinary_swim",
    "special_event": "medley_relay",
    "archived": 0,
    "present_count": 14,
    "race_count": 4
  },
  {
    "id": 2,
    "date": "2026-05-05",
    "status": "finalized",
    "created_at": "2026-05-06T11:56:31.297Z",
    "standard_event": "ordinary_swim",
    "special_event": "medley_relay",
    "archived": 0,
    "present_count": 14,
    "race_count": 3
  }
]
```