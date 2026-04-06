# DATA DICTIONARY — WWSC Swimming App v2.7.1

## Zwei-Einheiten-System

| System | Einheit | Speicherung | Beispiel | Format-Funktion |
|--------|---------|-------------|----------|-----------------|
| **Handicap** | Whole Seconds (s) | Integer | 14 = 14 Sekunden | `formatWhole()` → "14" |
| **Stopwatch** | Centiseconds (cs) | Integer | 1345 = 13.45 Sekunden | `formatTime()` → "13.45" |

**REGEL: Jede Berechnung die Werte aus BEIDEN Systemen mischt, MUSS konvertieren.**
- Sekunden → Centiseconds: `* 100`
- Centiseconds → Sekunden: `/ 100` (selten nötig)

---

## Felder: Individual Heats (heat_lane Tabelle)

| Feld | Einheit | Quelle | Display-Funktion | Screens |
|------|---------|--------|-----------------|---------|
| `handicap_time` | **Sekunden** | member.time_Xm (PB) | `formatWhole()` | Heat Builder, Results (als "PB") |
| `start_delay` | **Sekunden** | max_time - handicap_time | `formatWhole()` | Heat Builder, Results (als "Delay") |
| `max_time` | **Sekunden** | max(PBs) + 2 | `formatWhole()` | Heat Builder Header |
| `finish_time` | **Centiseconds** | User-Eingabe via Numpad | `formatTime()` | Results |
| `net_time` | **Centiseconds** | finish_time - start_delay*100 | `formatTime()` | Results |
| `variance` | **Centiseconds** | net_time - handicap_time*100 | `formatTime()` | Results |
| `is_break` | Boolean | variance <= -100 | "BREAK" / "—" | Results |
| `place` | Integer | Ranking nach finish_time | ordinal() | Results |

### Berechnungsformel Individual:
```
net_time(cs) = finish_time(cs) - start_delay(s) * 100
variance(cs) = net_time(cs) - handicap_time(s) * 100
is_break = variance <= -100
```

---

## Felder: Relay Teams (relay_team Tabelle)

| Feld | Einheit | Quelle | Display-Funktion | Screens |
|------|---------|--------|-----------------|---------|
| `target_time` | **Sekunden** | Summe der Member-PBs | `formatWhole()` | HB, Relays, Results (vor Zeiteingabe) |
| `start_delay` | **Sekunden** | Medley: immer 2; Andere: max - target | `formatWhole()` | HB, Relays, Results |
| `max_time` | **Sekunden** | max(target_times) + 2 | `formatWhole()` | HB, Relays |
| `total_time` | **Centiseconds** | User-Eingabe via Numpad | `formatTime()` | Relays, Results |
| `variance` | **Centiseconds** | total_time - start_delay*100 - target_time*100 | `formatTime()` | Relays, Results |
| `place` | Integer | Ranking (varies by type) | ordinal() | HB, Relays, Results |

### Berechnungsformel Relay:
```
net_time(cs) = total_time(cs) - start_delay(s) * 100
variance(cs) = net_time(cs) - target_time(s) * 100
```

### Relay Team Total Anzeige:
```
VOR Zeiteingabe: target_time(s) → formatWhole()  →  "49"
NACH Zeiteingabe: total_time(cs) → formatTime()   →  "75.00"
```

---

## Felder: Relay Team Members (relay_team_member Tabelle)

| Feld | Einheit | Quelle | Display-Funktion | Screens |
|------|---------|--------|-----------------|---------|
| `split_time` | **Centiseconds** | User-Eingabe via Numpad | `formatTime()` | HB (25m relay), Relays |
| PB (abgeleitet) | **Sekunden** | member.time_X via getRelayPB() | `formatWhole()` | HB, Relays, Results |

---

## Felder: Breakers (time_history Tabelle + API-Response)

### In der Datenbank (time_history):
| Feld | Einheit | Quelle |
|------|---------|--------|
| `previous_best` | **Sekunden** | member.time_X zum Zeitpunkt der Finalisierung |
| `time` | **Centiseconds** | net_time aus heat_lane |
| `is_break` | Boolean | aus heat_lane.is_break |

### In der API-Response (/breakers, /reports/breakers, /report):
| Feld | Einheit | Berechnung | Display-Funktion |
|------|---------|------------|-----------------|
| `old_pb` | **Centiseconds** | previous_best * 100 | `formatTime()` |
| `new_time` | **Centiseconds** | time (unverändert) | `formatTime()` |
| `improvement` | **Centiseconds** | old_pb - new_time | `formatTime()` |

### Im Frontend-Inline-Report (results.js renderBreakersSection):
| Feld | Einheit | Berechnung | Display-Funktion |
|------|---------|------------|-----------------|
| `pb` | **Sekunden** | lane.handicap_time (direkt) | `formatWhole()` |
| `newTime` | **Centiseconds** | lane.net_time (direkt) | `formatTime()` |
| `improvement` | **Centiseconds** | handicap_time * 100 - net_time | `formatTime()` |

**ACHTUNG:** Der Inline-Report berechnet `improvement` ANDERS als die API!
- API: `previous_best * 100 - time` (beides schon in CS konvertiert)
- Inline: `handicap_time * 100 - net_time` (muss selbst konvertieren)
Beide müssen zum gleichen Ergebnis kommen.

---

## Felder: Members (member Tabelle)

| Feld | Einheit | Display-Funktion | Screens |
|------|---------|-----------------|---------|
| `time_25m` | **Sekunden** | `formatWhole()` | Members, Times Sheet, HB, Results |
| `time_50m` | **Sekunden** | `formatWhole()` | Members, Times Sheet, HB, Results |
| `time_75m` | **Sekunden** | `formatWhole()` | Members, Times Sheet |
| `time_backstroke` | **Sekunden** | `formatWhole()` | Members, Times Sheet |
| `time_breaststroke` | **Sekunden** | `formatWhole()` | Members, Times Sheet |
| `time_butterfly` | **Sekunden** | `formatWhole()` | Members, Times Sheet |

---

## Propagationsregeln

### Wenn ein Swimmer zu einem Relay-Team hinzugefügt wird:
1. `target_time` = Summe ALLER Member-PBs (via getRelayPB)
2. Medley: `start_delay` = 2 (immer)
3. Standard: `start_delay` = max(alle team targets) + 2 - eigenes target
4. `max_time` = max(alle team targets) + 2

### Wenn eine Finish-Zeit eingegeben wird:
1. `net_time` = finish_time - start_delay * 100
2. `variance` = net_time - handicap_time * 100
3. `is_break` = variance <= -100

### Wenn ein Relay Total eingegeben wird:
1. `variance` = total_time - start_delay * 100 - target_time * 100

### Ranking-Regeln:
- Individual: gleiche finish_time → gleicher place (1,1,3)
- Relay 25m/Pogo: niedrigste total_time gewinnt
- Relay Brace/Medley: kleinste abs(variance) gewinnt, gleiche abs = gleicher Platz
