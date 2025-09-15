# Code Style (Readable Focus)

Goal: Make firmware easy for new contributors to navigate and modify quickly.

## Naming
- Files: lowercase_with_underscores (existing mixed names kept unless risky to change).
- Types (struct/class/enums): PascalCase `FallStateMachine`.
- Functions: lowerCamelCase `collectSensorData()`.
- Constants: `kPascalCase` for compile‑time `constexpr`, or ALL_CAPS only for macro guards.
- Globals: prefix `g_` if truly global; prefer static in .cpp.
- Member variables (if added later): suffix `_` (not yet enforced).

## Includes Order
1. Matching header (if any)
2. Project headers
3. Third-party libs
4. `<Arduino.h>` / std headers
Blank lines between groups.

## Constants & Magic Numbers
- Replace magic numbers with named `constexpr` in `constants.h` (pins, topics, time intervals, thresholds used across modules).
- Keep tuning-only values near algorithm with a short comment.

## Comments
- File header: 1–2 lines: purpose + key responsibilities.
- Function: brief imperative summary if intent not obvious.
- Inline: only when logic is non-trivial (avoid restating code).
- Use `// TODO(username):` for pending improvements.

## Error / Status Logging
- Use concise Serial prints starting with a tag: `[WIFI]`, `[AWS]`, `[IMPACT]`, `[CAL]`.
- Avoid flooding loop—gate high‑rate messages with timers.

## JSON Building
- Use centralized helper (`event_publisher`) rather than scattered `snprintf`.

## Calibration
- All calibration structs loaded early; expose a single status summary if needed.

## Formatting
- Indent: 2 spaces (keep existing where not touched to avoid noisy diffs).
- Max line target: ~100 chars (wrap JSON or long strings).

## Safety vs Demo Logic
- Add `mode` field everywhere decision thresholds differ.
- Separate demo thresholds in config layer only.

## Folder Guide
- `include/` public headers.
- `src/` implementation, feature modules.
- `src/sensors/` sensor acquisition + calibration helpers.

## When Adding New Code
1. Decide if value is config → put in `constants.h`.
2. Need dynamic threshold? add to config profile.
3. Provide a minimal test hook (serial print or stub function).

## Not Doing (Yet)
- Full clang-format enforcement (kept manual readability).
- Renaming legacy symbols that appear widely unless refactor planned.

## Example Constant
```cpp
// constants.h
constexpr uint8_t kBuzzerPin = 13; // Active-high piezo buzzer
```

Keep it simple; optimize for a human skimming in 30 seconds.
