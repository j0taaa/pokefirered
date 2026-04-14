# Step 02 — Playable viewport + camera follow

## Goal
Render only a viewport window and move camera with the player while clamping to map bounds.

## Done
- Added `src/core/camera.ts` with camera state + bounded follow behavior.
- Updated runtime bootstrap to use a 12x10 tile viewport.
- Updated renderer to draw only visible tile range.
- Added HUD camera coordinates.
- Added unit tests in `test/camera.test.ts`.

## Remaining
- Add camera smoothing toggle (optional mode).
- Add future camera rules for scripted panning.
