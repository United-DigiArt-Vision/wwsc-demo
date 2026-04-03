# STABLE — WWSC Swimming App

**Tag:** v2.4.0
**Date:** 2026-04-03
**Commit:** 9467bdc
**Branch:** main
**SSOT Version:** package.json → "version": "2.4.0"

## What's in v2.4.0
- Centiseconds (all times to hundredths)
- Breaker threshold >=1s (was >1s)
- Breakers visible in Results ("BREAK" text)
- Manual Placing (marker assigns 1st-4th before time entry)
- Results Readout (pool-side announcement format)
- Max Time display (MaxPB + 2s per heat)
- Heat Consistency 25m↔50m
- Relay Handicap Starts
- Relay Splits display
- Relay Swim Twice (for uneven teams)
- No Relay Breakers
- Inactive Member Filter (Active/Inactive/All)
- Slow Swimmers Report (>2s over PB)

## Rollback
```bash
git checkout v2.4.0
```
