# Step 11 — Data convergence with decomp exports

## Goal

Replace prototype-only data with adapter data that can be checked against the original decomp map/layout sources.

## Implementation notes

- 2026-04-15: Added compact Route 1 adapter data under `src/world/maps/route1.ts`.
- 2026-04-15: Added map-source NPC metadata so object events can be instantiated from route data.
- 2026-04-15: Wired the runtime to load Route 1 and its object events instead of the synthetic prototype route.
- 2026-04-15: Added Route 1 parity tests that compare object/background events against `data/maps/Route1/map.json` and collision rows against `data/layouts/Route1/map.bin` using the original `MAPGRID_COLLISION_MASK` bit rule.

## Follow-ups

- Generate compact adapter data from a repeatable export command instead of hand-maintaining rows.
- Add metatile behavior metadata for ledges, grass encounters, and directional blocking.
- Convert additional early-game maps and add connection/warp-driven map switching.
