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
- 2026-04-15: Added Route 1 metadata/connections to the compact adapter and exporter output.
- 2026-04-15: Added south-ledge jumping as a discrete two-tile player movement, matching `GetLedgeJumpDirection` + `GetJump2MovementAction` behavior at prototype scope.
- 2026-04-15: Updated the canvas renderer and HUD to consume real map metadata/behavior data for grass, ledges, signs, and map identity.
- 2026-04-15: Added Route 1 FireRed land wild-encounter data from `src/data/wild_encounters.json` to the map adapter/exporter and battle startup.
- 2026-04-15: Added wild encounter slot rates from the original land encounter rate table and weighted Route 1 wild species selection by those slots.
- 2026-04-15: Added connection-edge detection for Route 1's north/south decomp connections as a first map-switching hook.

## Follow-ups

- Load connected destination maps instead of surfacing connection stubs.
- Convert additional early-game maps and add connection/warp-driven map switching.
