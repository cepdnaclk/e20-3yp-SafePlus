# Smart Safety Helmet Firmware – Demo vs Production Modes

This firmware now supports two operating modes via a configurable profile system:

## 1. DEMO Mode (Default)

Used for exhibitions with a mannequin. Thresholds are intentionally very sensitive so that:

- Light taps on the helmet register as impact ("mild" severity)
- Small altitude or motion changes can trigger a "fall" sequence
- Quick hand interaction shows system responsiveness

Not suitable for real safety monitoring. False positives expected by design.

## 2. PRODUCTION Mode

Intended for field deployment with calibrated thresholds aligned closer to research norms:

- Multi-stage fall logic (altitude + impact + inactivity)
- Higher impact g-force requirements
- More conservative rotation and altitude drop detection

## Switching Modes

In `src/main.cpp`:

```cpp
static DetectionMode requestedMode = DetectionMode::DEMO; // change to PRODUCTION for real use
```

Change to `DetectionMode::PRODUCTION` and recompile for deployment.

## New Configuration Layer

Added files:

- `include/config_manager.h`
- `src/config_manager.cpp`

Dynamic runtime thresholds are provided through `getActiveConfig()` which is consumed in `fall_detection.cpp`.

## Event Publishing

A unified JSON telemetry builder:

- `include/event_publisher.h`
- `src/event_publisher.cpp`

Adds `mode`, structured impact object, and battery + gas contexts.

## Simulation Utilities

For exhibition demo triggers:

- `include/demo_simulation.h`
- `src/demo_simulation.cpp`

Functions:

- `simulateLightImpact()` – returns a crafted mild impact
- `triggerSimulatedFall()` – simulates fall state for a few seconds

You can hook these to a button or serial command if desired.

## Safety Disclaimer

DEMO mode is NOT a substitute for validated PPE safety systems. Always switch to PRODUCTION, recalibrate sensors (MPU, H3LIS, MQ2), and validate with controlled test scenarios before claiming functional reliability.

## Recommended Next Steps

1. Add persistent storage of chosen mode (NVS/Preferences)
2. Add serial command: `MODE DEMO` / `MODE PROD`
3. Log raw events for threshold tuning (CSV over serial)
4. Add duration windows (free-fall time, impact window sequencing)

## Telemetry JSON (excerpt)

```json
{
  "mode": "DEMO",
  "id": "Helmet_1",
  "temp": 26.1,
  "hum": 63.4,
  "bpm": 78.0,
  "loc": [7.254651, 80.591405],
  "gas": 12.5,
  "gasType": "LPG",
  "gasAlert": true,
  "sos": false,
  "impact": {
    "severity": "mild",
    "angle": 25.0,
    "direction": "front",
    "mag": 1.5,
    "active": true
  },
  "fallActive": false,
  "battery": {"pct": 82, "status": "Good"}
}
```

---
For further enhancement or integration (BLE companion app, OTA config, ML classifier), extend the configuration layer rather than hard-coding new constants.
