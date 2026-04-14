# Step 04 — Map loading adapter boundary

## Goal
Introduce data-loading abstractions to replace hard-coded prototype map data.

## Done
- Added a `MapSource` contract plus parser/validator utilities in `src/world/mapSource.ts`.
- Added JSON-backed prototype map fixture at `src/world/maps/prototypeRoute.json`.
- Switched app bootstrap to load map data via loader boundary instead of hard-coded generation.
- Added unit tests for map source load + validation failures in `test/mapSource.test.ts`.

## Notes
- 2026-04-14: Completed adapter boundary with synchronous JSON import for now; next iteration can swap to async fetch or extracted assets without touching rendering/input code.
