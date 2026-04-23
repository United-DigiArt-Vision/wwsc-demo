# CURRENT_STATE

**Version (from `package.json`):** 2.8.10
**BaseBranch:** dev/v2.8.9-bryan-relay-randomness (tip aa4be5a — v2.8.9 live on Render since 2026-04-22/23)
**BaseCommit:** aa4be5a
**TargetBranch:** dev/v2.8.10-bryan-retest-followup
**Branch:** dev/v2.8.10-bryan-retest-followup
**Current branch tip:** dynamic — run `git rev-parse --short HEAD` on branch `dev/v2.8.10-bryan-retest-followup`
**RecordedCommit:** 4015f9c
**LastEditor:** Claude Code
**Date:** 2026-04-23
**Timestamp:** 2026-04-23 07:45:00
**WorkingTreeStatus:** clean (v2.8.10 delivery ready, awaiting Balerion deployment)
**Version SSOT:** `package.json`
**Release Anchors:** `STABLE.md`, Git Tag, `/api/version`, `src/public/index.html?v=2.8.10`

## Definition used across current v2.8.10 working artifacts
- **RecordedCommit** = the substantive delivery anchor for v2.8.10. Three client-side bug fixes are bundled in commit `4015f9c` (`fix: v2.8.10 Bryan 2026-04-23 retest follow-up — 3 bug fixes`), after the mandatory V0014 version bump commit `1a04e9b` (`chore: version bump to v2.8.10`).
- **Scope of delivery** = Bryan 2026-04-23 retest follow-up: (B) 25m Team Relay swim-twice dropdown restricted to team members only — reverses v2.8.4 Bryan fix 4; (D) View Event Report crash `Cannot read properties of null (reading 'id')` fixed by threading eventId through `showSeasonReport(eventIdArg)`; (E) Initial Generate Teams now applies the same random rotation Shuffle uses, so each click produces a fresh balanced-randomised pairing. Issue A (Bryan's "shuffle only works after confirm" note) verified as NOT reproducible in v2.8.10. Issue C (Event Report content scope extension) deferred pending field-level clarification with Bryan.
- **Current branch tip (HEAD)** is intentionally NOT stored as a static value in versioned artifacts, because any commit that writes a HEAD value changes HEAD. Resolve it dynamically with `git rev-parse --short HEAD` on the branch `dev/v2.8.10-bryan-retest-followup`.

## Rules
- `package.json` is the only SSOT for semantic version numbers.
- `CURRENT_STATE.md` records the delivery anchor (`RecordedCommit`) plus working-tree state. It does not freeze a static HEAD hash.
- `version/CHANGELOG.md` must reflect the same RecordedCommit / Branch / Version for the corresponding delivery.
- If version changes, `package.json`, cache-busting in `src/public/index.html`, `version/CURRENT_STATE.md`, `version/CHANGELOG.md`, and release anchors must stay in sync.
