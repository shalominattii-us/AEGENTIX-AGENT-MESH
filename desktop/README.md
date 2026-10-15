# Aegentix Desktop Assistant
### Cortana-Style Floating HUD & Voice Client for Aegentix Sovereign OS

A lightweight, dark-acrylic desktop assistant overlay inspired by Cortana and Spotlight for interacting with Aegentix operations, telemetry, and the 29-exchange World Monitor mesh.

---

## Features

- **Cortana-Style Glowing Orb & Waveform**: Visualizer animates dynamically between `Listening`, `Processing`, and `Speaking` states.
- **Voice Input (STT)**: Push-to-talk via microphone button or holding the `Spacebar`.
- **Audio Voice Talk-Back (TTS)**: Native browser / OS speech synthesis speaks operational status aloud.
- **Quick Action Chips**:
  - `System Health`: Queries local kernel, 29 exchange streams, and ledger height.
  - `WMON Price`: Queries Volume-Weighted Median Price ($1.482) across the 29-exchange mesh.
  - `Clusters`: Inspects multi-cloud AWS, Azure, and Edge K3s status.
- **Dual Launch Modes**:
  1. **Electron Native HUD**: Frameless, transparent floating window with global hotkey (`Ctrl+Shift+Space`).
  2. **Zero-Install Windows App Mode**: Launches immediately via standalone Edge App Mode without requiring `npm install`.

---

## How to Launch

### 1. Instant Launch (Zero-Install):
```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\eagle\antigravity\Aegentix-Super-Agent-Wallet\desktop\launch-assistant.ps1
```

### 2. Full Electron Native Runtime:
```powershell
cd C:\Users\eagle\antigravity\Aegentix-Super-Agent-Wallet\desktop
pnpm install
pnpm start
```

---

## Keyboard Shortcuts

- `Ctrl + Shift + Space` (or `Alt + Space`): Toggle HUD visibility from system tray.
- `Spacebar` (held): Push-to-talk voice recording.
- `Enter`: Submit text query.
