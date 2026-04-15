# Step 11 — Data convergence with decomp exports

## Goal

Replace prototype-only data with adapter data that can be checked against the original decomp map/layout sources.

## Implementation notes

- 2026-04-15: Added compact Route 1 adapter data under `src/world/maps/route1.ts`.
- 2026-04-15: Added map-source NPC metadata so object events can be instantiated from route data.
- 2026-04-15: Wired the runtime to load Route 1 and its object events instead of the synthetic prototype route.
- 2026-04-15: Added Route 1 parity tests that compare object/background events against `data/maps/Route1/map.json` and collision rows against `data/layouts/Route1/map.bin` using the original `MAPGRID_COLLISION_MASK` bit rule.
- 2026-04-15: Added Route 1 encounter-terrain rows derived from metatile attribute bits 24-26 (`METATILE_ATTRIBUTE_ENCOUNTER_TYPE`) and gated wild battles to land-encounter tiles, matching the `TILE_ENCOUNTER_NONE` early return in `wild_encounter.c`.
- 2026-04-15: Added `npm run export:map -- <MapName>` for repeatable compact map exports from decomp map/layout/tileset data.
- 2026-04-15: Added metatile behavior rows from `METATILE_ATTRIBUTE_BEHAVIOR` plus runtime helpers for ledges and directional impassable checks, mirroring `MetatileBehavior_IsJump*` and `MetatileBehavior_Is*Blocked`.

## Follow-ups

- Apply ledge jump movement as a field action instead of only exposing behavior metadata.
- Convert additional early-game maps and add connection/warp-driven map switching.
