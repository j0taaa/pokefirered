# ts-game (TypeScript Browser Port Track)

This folder contains a runnable browser prototype for the FireRed port effort.

## Current vertical slice

The app currently implements a functional runtime slice:

- Vite + TypeScript app shell (`index.html`, `src/main.ts`)
- Fixed-step game loop
- Browser keyboard input adapter (WASD/Arrows + Shift run + Z/Enter interact)
- Map loading adapter boundary (`MapSource`) with decomp-exported compact map fixtures
- Player movement + facing + movement animation state
- NPC entity starter with patrol paths, idle pauses, and map-aware collision probes
- Object-event-style NPC interaction scripts (`interactScriptId`) with face-player behavior
- Camera-follow viewport with map-bound clamping
- Canvas renderer with visible-tile culling, decomp-backed metatile textures, and object-event sprite rendering
- HUD for FPS + player state + camera coordinates + NPC/dialog status + last-run script id
- START menu flow with FireRed-like dynamic option composition and submenu callbacks
- START > OPTION panel now supports editable Text Speed / Battle Scene / Battle Style settings
- START > BAG now uses a decomp-derived shared inventory state with `ITEMS` / `KEY ITEMS` / `POKé BALLS` pockets, per-pocket cursor memory, item pickup persistence, and a dedicated FireRed-style bag overlay
- Battle parity foundation: decomp-backed move metadata and learnsets, parsed battle-script / battle-AI / trainer-battle data from the decomp, script-shaped single wild-battle sequencing, decomp terrain mapping, a renderer-backed canvas battle scene instead of the old DOM battle overlay, and battle-runtime scaffolding for side/party/battler state plus deterministic trace events
- Browser save/load persistence adapter (localStorage-backed) wired to FireRed-style START > SAVE ask/overwrite flow
- Unit tests for movement, collisions (map + entity), camera behavior, NPC logic, trigger execution, and map source parsing

## Folder layout

- `src/core` — runtime primitives (loop, vectors, camera)
- `src/input` — browser input adapters / snapshots
- `src/world` — map and collision data structures
- `src/game` — gameplay state stepping, including decomp-backed battle data, decomp parser modules, and battle engine state
- `src/rendering` — canvas rendering adapter, including the battle scene renderer
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
- The runtime currently consumes collision rows, encounter rows, trigger data, and land wild encounters from the exporter payload.

## Migration note / next steps

Roadmap source of truth is now in `ts-game/roadmap/ROADMAP.md`.

Near-term next increments:

1. Extend bag parity with TM Case / Berry Pouch submenus, registered-item use flows, and battle bag selection UI.
2. Replace remaining START-menu placeholder panels with fully interactive menu scenes (party/player + deeper save UX parity).
3. Expand trigger/script parity to include richer variable/flag gates and object-event scripts.
4. Expand decomp-backed overworld parity beyond Route 2 with richer object movement patterns and more map fixtures.
5. Keep battle implementation aligned to the decompiled sources (`battle_main.c`, `battle_script_commands.c`, `battle_bg.c`, `battle_interface.c`, `battle_ai_script_commands.c`, `battle_ai_switch_items.c`) as more mechanics and UI states are ported, using the current decomp parser layer plus the config-driven battle state, battle-VM scaffolding, structured post-battle result pipeline, and trace serialization as the migration path toward fuller trainer and multi-battler parity.
