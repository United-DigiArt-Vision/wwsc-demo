# CURRENT_STATE

**Version (from `package.json`):** 2.8.9
**BaseBranch:** main
**BaseCommit:** 70fed2e
**TargetBranch:** dev/v2.8.9-bryan-relay-randomness
**Branch:** dev/v2.8.9-bryan-relay-randomness
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.9-bryan-relay-randomness`
**RecordedCommit:** 004d70f
**LastEditor:** Claude Code
**Date:** 2026-04-21
**Timestamp:** 2026-04-21 21:15:00
**WorkingTreeStatus:** clean (v2.8.9 delivery ready, awaiting Balerion deployment)
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.9`

## Definition used across current v2.8.9 working artifacts
- **RecordedCommit** = the substantive delivery anchor for v2.8.9. All three Bryan 2026-04-21 relay corrections are included by commit `004d70f` (`fix: v2.8.9 Brace forceReshuffle — complete Bryan 2026-04-21 point 3`) and its predecessor `6069347` (`fix: keep standard relay on brace weeks and force relay reshuffle`).
- **Scope of delivery** = Bryan 2026-04-21 relay corrections: (1) Brace weeks include the standard 25m relay (event-setup.js), (2) Shuffle forwards `forceReshuffle: true` end-to-end (api.js, heat-builder.js, server.js), (3) Brace pairing applies the same rotation the round-robin distribution uses so repeat shuffles produce visibly different pairings/totals (server.js).
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `dev/v2.8.9-bryan-relay-randomness`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
