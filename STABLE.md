# STABLE.md — Deployed Version Tracker

> **SR-022:** Diese Datei ist die Single Source of Truth dafür, was LIVE ist.
> Wird bei JEDEM Deploy aktualisiert. PFLICHT.

---

## 🟢 AKTUELL DEPLOYED

| Was | Details |
|-----|---------|
| **Live-URL** | https://wwsc-demo.onrender.com |
| **Git Tag** | `v2.0-baseline` |
| **Commit** | `1a8b88d` (Branch: `dev/swimming-v2.0-baseline-20260320`) |
| **Deploy-Datum** | Vor 20.03.2026 (ursprünglich ~22.02.2026 deployed, Code gesichert 20.03.2026) |
| **Deploy-Befehl** | Push zu Render via Git (render.yaml in src/) |
| **Render Service** | `wwsc-demo` |

## ✅ CLIENT-APPROVED FEATURES (Bryan Hesketh)

Bryan hat diese Version im Teams-Call am 22.02.2026 gesehen und approved:

1. **Times Sheet** — Excel-Spreadsheet-Style mit PB-Zeiten pro Stroke (25m, 50m, 75m, Backstroke, Breaststroke, Butterfly)
2. **Standard Distances Dropdown** — Ordinary Swim, 25m Brace, 50m Brace, Pogo
3. **Special Event Dropdown** — 75m, Backstroke, Breaststroke, Butterfly, Medley Relay
4. **Attendance & entries** — Kombinierte Spalte mit Y/N/Back/Breast/Free Dropdowns
5. **Heat Builder** — Spreadsheet-Tabelle mit Heat/Lane/Swimmer/PB Time/Max Time/Start Delay
6. **Members** — Tabelle mit Status-Tags, PB-Zeiten, Edit-Buttons, CSV Import
7. **Dashboard** — Stats Cards + Quick Actions
8. **Season Calendar** — Event-Historie

## 📌 BASIS FÜR NÄCHSTE VERSION

- **Nächste Version:** v2.1 (M1 Requirements)
- **Basiert auf:** Tag `v2.0-baseline` (Commit `1a8b88d`)
- **Was fehlt für M1:** Results Screen (Zeit-Eingabe, Finalize, Breakers, Archive)
- **Branch:** Wird von `dev/swimming-v2.0-baseline-20260320` abgezweigt

---

## 📜 VERSION HISTORY

| Version | Tag | Commit | Datum | Beschreibung |
|---------|-----|--------|-------|-------------|
| v2.0 | `v2.0-baseline` | `1a8b88d` | 20.03.2026 | Bryan-approved Excel-Style UI (gesichert von Live-Render) |
| v1.0 | — | `4180791` | 19.03.2026 | ❌ NICHT Bryan-approved — Card-Layout UI (überholt) |
