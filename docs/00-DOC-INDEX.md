# DOKUMENTATIONS-INDEX — WWSC Swimming App

**Stand: v2.12.0 (2026-06-11).** Dieser Index ist der Einstiegspunkt und klärt verbindlich,
welche Dokumente AKTUELL (SSOT) sind und welche HISTORISCH (Milestone-Snapshots, nicht löschen).

## AKTUELL — SSOT (bei Widerspruch gewinnen diese, in dieser Reihenfolge)

| Dokument | Inhalt |
|---|---|
| `../README.md` | Einstieg: Stack, Schnellstart, Env-Vars, Doku-Landkarte |
| **`SYSTEM-SPEC-v2.12.0.md`** | Master-Spezifikation: Domäne, alle Business-Regeln/Formeln, Lifecycle, datierte Kundenentscheidungen |
| **`DATA_DICTIONARY.md`** | Datenmodell: alle Tabellen/Felder, Einheiten (s/cs), Berechnungs- + Propagationsregeln |
| **`API-REFERENCE-v2.12.0.md`** | Alle 73 HTTP-Endpoints: Semantik, Einheiten, Seiteneffekte, CSV-Header |
| **`UI-SCREEN-SPEC-v2.12.0.md`** | Jeder Screen: Elemente, Interaktionen, Zustände (inkl. v2.12.0-Features) |
| **`REBUILD-GUIDE-v2.12.0.md`** | Betrieb + stack-unabhängiger Nachbau + Abnahme-/Äquivalenzkriterien |
| `TEST_ARCHITECTURE.md` | Test-Philosophie (User-sichtbar testen) + aktuelle Gate-Matrix v2.12.0 |
| `../tests/README.md` | Alle Suiten reproduzierbar ausführen (Setup, Reihenfolge, tee-Vertrag, Harness-Eigenheiten) |
| `../REQUIREMENTS-V2.12.0-BRYAN-FEEDBACK.md` | Aktuellste Anforderungsrunde mit Traceability (10 Reqs ↔ Tests) |
| `../version/CURRENT_STATE.md` / `../version/CHANGELOG.md` / `../PROGRESS.md` / `../STABLE.md` | Projektstand-SSOT, Historie, letzte stabile Live-Version |
| `../CLAUDE.md` + Dropbox-Root `QUALITY_PLAYBOOK.md`, `COLLABORATION_MODEL.md` | Arbeits-/Qualitäts-/Kollaborationsregeln |

Evidence/Beweise: `evidence/` + `screenshots/` (je Version; v2.12.0: `evidence/v2120-bryan-feedback/`
inkl. Abnahmeprotokoll und Gate-Roh-Log).

## HISTORISCH — Milestone-Snapshots (Kontext „warum“, NICHT mehr Verhaltens-SSOT)

| Dokument(e) | Snapshot von |
|---|---|
| `PRD.md`, `DESIGN_SPEC.md`, `UNIT_TEST_SPEC.md`, `INTEGRATION_TEST_SPEC.md`, `TRACEABILITY_MATRIX.md` | v2.6.2/v2.7.1-Runde (M1) |
| `USE_CASES.md` | v2.7.1 — Domänen-Einführung weiterhin lesenswert; Details teils überholt |
| `EXCEL_EQUIVALENCE_REPORT.md` | Abgleich mit Bryans Original-Excel (M1) |
| `USER-INTERACTION-*`-Dateien (hier und im Projekt-Root) | manuelle Testprotokolle je Version (v2.7.x–v2.8.x, M2, M3) |
| `M3-HISTORY-RETENTION-POLICY.md` | M2/M3-Designentscheidung (gültig, in SYSTEM-SPEC zusammengefasst) |
| Root: `REQUIREMENTS.md` (v2.8.0), `REQUIREMENTS-M2/M3-*`, `DESIGN-SPEC*`, `*-CHECKLIST*`, `M3-*`, `HANDOVER-*`, `NOTES.md`, `BRYAN-*` | jeweilige Milestone-Runden M1–M3 |

Regeln: Historische Dokumente werden nicht aktualisiert und nicht gelöscht (Audit-Trail).
Neue Arbeit dokumentiert sich in einer neuen `REQUIREMENTS-V<version>-*`-Datei + Updates der
AKTUELL-Liste; bei Release zusätzlich CHANGELOG/CURRENT_STATE/STABLE (siehe CLAUDE.md-Pflichten).
