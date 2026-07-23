# Kombo - Invoker Combo Simulator

> English | [简体中文](./README.md)

A desktop practice tool for Dota/Dota2 Invoker enthusiasts. Simulates the full chain of orb-switching (Quas/Wex/Exort), invoking, and casting — with combo editing, optimal-keystroke solving, automatic statistics, and trend review.

## Installation

Download the latest `Kombo_x.x.x_x64-setup.exe` from [Releases](../../releases) and double-click to install. No extra dependencies required on Windows 10+.

## Features

### Practice
- **Free Practice**: Switch orbs / invoke / cast freely. The last 10 cast spells are shown below; not recorded in stats.
- **Combo Practice**: Pick a combo from the library to start guided practice; cast target spells in order to advance progress.
- **Pre-cast Start**: Pre-cast combos start with the pre-cast spells' orb order already on your head (no need to re-invoke).
- **Completion Hold**: After a combo ends, it stays on the evaluation screen showing three metrics — no auto-loop.
- **Spacebar Restart**: Press Space on the completion screen to instantly start the next round — no mouse needed.
- **Esc Discard**: Press Esc during practice to silently discard the round (not saved, not counted, no result shown).
- **Live Timer**: Starts on the first valid keypress; freezes at the precise duration on completion.
- **Orb Queue Animation**: FIFO queue advances right-to-left — new orb slides in with a pulse, the whole queue shifts left, the head orb is pushed out.
- **Spell Cooldown**: A successful cast triggers a 2-second cooldown (clockwise sweep overlay); repeated casts during cooldown are blocked.
- **Sound Feedback**: Casting a spell / a successful invoke plays the matching sound effect (independently toggleable in settings; persisted).
- **Kill Announcer**: A successful combo counts as a kill, playing Dota2 announcer sounds (First Blood / Double Kill / ... / Rampage + Killing Spree / ... / Godlike); a failed combo counts as your death and resets the kill streak.
- **Spell Recipes Reference**: A toggleable recipe panel in free practice (10 spells + 3-element recipes, elements as icons, ordered Q→W→E).

### Combo Library
- **Custom Combos**: Add spells in sequence (each spell appears only once per combo); optionally pre-cast the first two spells as a starting state.
- **Optimal Keystroke Solver**: The fewest-keystroke sequence solved via FIFO orb queue + BFS, following the "switch-invoke-cast one at a time" rhythm. Orb-switch order follows a three-tier tiebreak (fewest switches → grouped repeated keys → follow recipe), ergonomic. Visible in the editor, combo list, and practice page (eye toggle, persisted).
- **Preset Combos**: Built-in classics like Tornado → EMP → Chaos Meteor → Deafening Blast.

### Review
- **Summary Cards**: Total rounds / success rate / average keystroke ratio / best speed — a glance at the current filter range.
- **Three-Metric Trend Chart**: Orb ratio / keystroke ratio / speed score, normalized to 0-100% (higher is better), only successful rounds; chart auto-resizes with the window.
- **Success Rate Badge**: Successful rounds / total rounds in range, colored by proficiency (green/yellow/red).
- **Filters**: Slice by combo + time range (today / 7d / 30d / all).

### Other
- **Desktop-grade Layout**: Fixed top bar (navigation + gear settings popover), minimum window size, window position/size auto-remembered.
- **System Language Detection**: Chinese systems (Simplified/Traditional) default to Chinese, otherwise English; once manually switched, the user's choice takes priority.
- **Help Page**: Built-in usage guide and metric explanations (「Help」 in the nav bar).
- **Dual Theme & Language**: DOTA1/DOTA2 icon themes (toggle by clicking the avatar), Chinese/English toggle.
- **DOTA1/DOTA2 Keybinds**: Legacy keys (Y/V/G/C/X...) vs Dota2 default keys (D/F), bound by theme.
- **Unified Icons**: UI control icons uniformly use lucide line icons.

## Hotkeys

| Key | Function |
|---|---|
| `Q` / `W` / `E` | Switch elemental orbs (Ice/Lightning/Fire, FIFO up to 3) |
| `R` | Invoke (combine current 3 orbs into a spell) |
| Cast key (scheme-dependent) | Cast the slot spell |
| `Space` | On completion: instantly start the next round |
| `Esc` | During practice: discard the round (not saved) |

**LEGACY (traditional keys)**: Y=ColdSnap / V=GhostWalk / G=IceWall / C=EMP / X=Tornado / Z=Alacrity / T=SunStrike / F=ForgeSpirit / D=ChaosMeteor / B=DeafeningBlast

**DOTA2 (default keys)**: D=first slot / F=second slot

## Review Metrics

| Metric | Meaning |
|---|---|
| **Orb Ratio** | Optimal orb switches / actual orb switches. Only counts Q/W/E, measuring orb efficiency. 100% means zero excess switches. |
| **Keystroke Ratio** | Optimal total keystrokes / actual total keystrokes. Covers Q/W/E/R/D/F; extra R presses, miscasts, and backtracking all lower the score. |
| **Speed Score** | Fastest round duration in range / this round's duration. The fastest round is the 100-point benchmark. |
| **Success Rate** | Successful rounds / total rounds (including failures). Green ≥ 80% / Amber 50-80% / Red < 50% / Grey = unknown (no data). |

> Failed rounds are excluded from the trend chart (to avoid dragging down the curve) but counted in the success rate.

## Kill Announcer Mechanism

In combo practice, each successful combo completion counts as killing an enemy hero (you stay alive); a failed combo counts as your own death. Two independent counters:

| Dimension | Sequence | Reset Condition |
|---|---|---|
| **Kill Streak** (one life cumulative) | 3=Killing Spree → ... → 9=Godlike → 10+=Beyond Godlike | Combo failure (your death) resets to zero |
| **Multi-Kill** (within 18s window) | 1=First Blood → 2=Double Kill → ... → 5+=Rampage | Interval over 18s restarts; First Blood only on first trigger |

> Re-entering the combo page (switching combos / re-selecting) resets everything including First Blood; Spacebar restart does not reset.

## Pre-cast Mechanism (DOTA2 Real Slot Rules)

A newly invoked spell occupies the D slot; the original D-slot spell is pushed to F. Thus:
- Pre-cast F slot = `spells[0]` (first invoked, first cast)
- Pre-cast D slot = `spells[1]` (last invoked, later cast)

Example: combo `Tornado → EMP`, the player first presses R to invoke Tornado → then R to invoke EMP (Tornado pushed to F). On cast, press **F (Tornado) then D (EMP)**.

## Development

```bash
npm install          # Install frontend dependencies
npm run dev          # Frontend-only dev (Vite + React)
npm run test         # Run tests
npm run tauri dev    # Tauri desktop app dev
npm run tauri build  # Build Windows installer
```

Tech stack: Vite + React + TypeScript + Tailwind CSS + Tauri v2 (Rust) + framer-motion

## License

MIT
