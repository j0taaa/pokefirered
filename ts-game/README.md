# ts-game (TypeScript Browser Port Track)

This folder contains a runnable browser prototype for the FireRed port effort.

## Current vertical slice

The app currently implements a functional runtime slice:

- Vite + TypeScript app shell (`index.html`, `src/main.ts`)
- Fixed-step game loop
- Browser keyboard input adapter (WASD/Arrows + Shift run + Z/Enter interact)
- Map loading adapter boundary (`MapSource`) with JSON-backed prototype fixture
- Player movement + facing + movement animation state
- NPC entity starter with patrol paths, idle pauses, and map-aware collision probes
- Object-event-style NPC interaction scripts (`interactScriptId`) with face-player behavior
- Camera-follow viewport with map-bound clamping
- Canvas renderer with visible-tile culling and sprite-like player rendering
- HUD for FPS + player state + camera coordinates + NPC/dialog status + last-run script id
- START menu flow with FireRed-like dynamic option composition and submenu callbacks
- START > OPTION panel now supports editable Text Speed / Battle Scene / Battle Style settings
- Battle vertical slice v4: command selection (`FIGHT`/`BAG`/`POKéMON`/`RUN`), full Gen-3 type-chart effectiveness sampling for preview math, Poké Ball/Great Ball shake-count capture messaging, poison end-turn chip damage, party switching, and improved enemy move-utility heuristics
- Browser save/load persistence adapter (localStorage-backed) wired to FireRed-style START > SAVE ask/overwrite flow
- Unit tests for movement, collisions (map + entity), camera behavior, NPC logic, trigger execution, and map source parsing

## Folder layout

- `src/core` — runtime primitives (loop, vectors, camera)
- `src/input` — browser input adapters / snapshots
- `src/world` — map and collision data structures
- `src/game` — gameplay state stepping
- `src/rendering` — canvas rendering adapter
- `src/ui` — lightweight DOM HUD bindings
- `test` — Vitest unit tests
- `roadmap` — tracked roadmap + per-step planning notes

## Commands

Run inside `ts-game/`:

- `npm install`
- `npm run dev`
- `npm run test`
- `npm run build`

## Decomp Exporter

`scripts/export-decomp-map.mjs` exports map data from the original decomp tree into the browser-port JSON shape used by the TypeScript runtime and parity tests.

Run it from `ts-game/`:

```bash
node scripts/export-decomp-map.mjs <MapName> [FireRed|LeafGreen]
```

Accepted `<MapName>` forms:

- Map folder name under `data/maps/`, for example `Route21_North`
- `map.json` `name`, for example `SSAnne_Exterior`
- Decomp `MAP_*` label, for example `MAP_ROUTE21_NORTH`

If the label cannot be resolved, the script throws an error that explicitly says it expected a folder name, map name, or `MAP_*` label from `data/maps`.

### Inputs

The exporter reads directly from the decomp repository at the repo root:

- `data/maps/<resolved-map>/map.json` for map metadata and events
- `data/layouts/layouts.json` plus the referenced layout blockdata file
- `data/tilesets/primary/*/metatile_attributes.bin` and `data/tilesets/secondary/*/metatile_attributes.bin`
- `src/data/wild_encounters.json` for wild encounter groups

The optional game argument defaults to `FireRed` and is currently only used when selecting map encounter data.

### Output Shape

The script prints one JSON object to stdout with this high-level structure:

- `id`
- `metadata`: `name`, `layout`, `music`, `regionMapSection`, `weather`, `mapType`, `allowCycling`, `allowEscaping`, `allowRunning`, `showMapName`, `battleScene`, `connections`
- `wildEncounters`: currently `land` only when encounter data exists
- `width`, `height`, `tileSize`
- `collisionRows`: `.` for passable tiles and `#` for blocked tiles
- `encounterRows`: `L` for land encounters, `W` for water encounters, `.` otherwise
- `behaviorRows`: hex-encoded metatile behavior values, two hex digits per tile
- `triggers`: merged `coord_events` and `bg_events`
- `warps`: `{ x, y, elevation, destMap, destWarpId }`
- `hiddenItems`: `{ x, y, elevation, item, quantity, flag, underfoot }`
- `berryTrees`: `{ x, y, elevation, berryTreeId, localId, scriptId, flag }`
- `cloneObjects`: `{ x, y, graphicsId, targetLocalId, targetMap }`
- `npcs`: exported non-clone object events with movement, script, flag, and trainer metadata

Notable trigger conversions:

- `coord_events` become step triggers with `conditionVar` and `conditionEquals`
- non-hidden `bg_events` become interact triggers
- hidden items also emit one-shot triggers gated by their decomp flag

### Parity Assumptions

The exporter is intentionally decomp-backed rather than hand-authored. Current assumptions are:

- Map identity and event data should match `data/maps/*/map.json` exactly after field renaming and light normalization.
- Warp destinations preserve the decomp `MAP_*` destination label and coerce `dest_warp_id` to a number.
- Hidden item quantity and trainer sight / berry tree ids are numeric in the exported output even if the decomp JSON stores them as strings.
- Collision, encounter markers, and behavior rows are derived from layout blockdata plus metatile attribute binaries, not from runtime heuristics.
- Wild encounters are filtered by both map id and the selected game suffix (`*_FireRed` or `*_LeafGreen`).
- Clone objects are exported separately and excluded from the normal NPC list.
- Berry trees are detected from object events that use `MOVEMENT_TYPE_BERRY_TREE_GROWTH`.

### Current Limits

- The exporter currently emits only `land` wild encounters.
- It is a read-only extraction tool; it does not write generated files into the repo by itself.
- The runtime map interfaces in `src/world/` are still narrower than the full exporter payload, so parity tests are the main consumer of the complete export object today.

## Migration note / next steps

Roadmap source of truth is now in `ts-game/roadmap/ROADMAP.md`.

Near-term next increments:

1. Replace START-menu placeholder panels with fully interactive menu scenes (party/bag/options + deeper save UX parity).
2. Expand trigger/script parity to include richer variable/flag gates and object-event scripts.
3. Replace primitive player visuals with true sprite-sheet frames.
4. Extend battle scene parity with status conditions, proper Poké Ball shake phases, and richer AI move utility heuristics.
