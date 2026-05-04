# ts-game (TypeScript Browser Port)

This folder contains the complete TypeScript browser port of Pokémon FireRed, maintaining strict 1:1 behavioral parity with the decompilation.

## Parity Contract

This port maintains **strict 1:1 behavioral parity** with the Pokemon FireRed decompilation.

**Baseline Commit**: `586f38ad14860d70c20fa58fc30a410818f2833f`

### Core Principles

1. **Preserve Everything**: Bugs, quirks, RNG order, timing, and observable behavior are intentionally preserved
2. **Hardware-Only Adaptations**: Browser technologies replace GBA hardware only at clear boundaries (Canvas/WebGL for PPU, Web Audio for APU, browser storage for save RAM, etc.)
3. **No Enhancements**: Non-parity improvements, QoL changes, and balance tweaks are excluded
4. **Test-Driven Parity**: All work follows TDD - tests first, implementation to pass

### Verification

The parity contract is enforced via automated tests:

```bash
# Core parity contract
npm run test -- --run test/parityContract.test.ts

# Full convergence coverage
npm run test -- --run test/convergence-coverage.test.ts

# All parity and inventory tests
npm run test -- --run test/*conversion*.test.* test/*coverage*.test.* test/*inventory*.test.*
```

Browser route verification (Playwright):

```bash
npx playwright test e2e/mainRoute.spec.ts e2e/postgameLinkRoute.spec.ts --reporter=line
```

See [roadmap/ROADMAP.md](roadmap/ROADMAP.md) for complete contract details.

## Implementation overview

The TypeScript port implements complete FireRed gameplay with 1:1 parity:

- **Runtime core**: Vite + TypeScript app shell, fixed-step game loop, browser input adapter (WASD/Arrows + Shift run + Z/Enter interact)
- **World systems**: Map loading (`MapSource`) with 425 decomp-exported maps, player movement/facing/animation, NPC entities with patrols and collision probes, object-event interaction scripts, camera-follow viewport, trigger zones, warp system
- **Rendering**: Canvas renderer with visible-tile culling, decomp-backed metatile textures, object-event sprites, HUD for game state
- **UI/Menu systems**: START menu with dynamic option composition, OPTION panel (Text Speed / Battle Scene / Battle Style), BAG with `ITEMS` / `KEY ITEMS` / `POKé BALLS` / `TM CASE` / `BERRY POUCH` pockets, PC storage, party management, Pokédex, Trainer Card, save/load flow
- **Battle systems**: Decomp-backed move/learnset metadata, parsed battle scripts / AI / trainer data, VM-owned singles/doubles/partner/link turn execution, battler-derived compatibility views, terrain mapping, canvas battle scene renderer, deterministic trace serialization, seeded parity fixture runner, native `tools/battletrace` oracle
- **Field systems**: Complete field script interpreter (213 commands, 272 specials, 172 movement commands), `applymovement`, door/warp commands, camera objects, text printer with control codes, multichoice dialogs, PokéMart, in-game trades, daycare, move tutor/relearner
- **Save/Storage**: Checksum-protected save format, localStorage persistence, schema migration, all 20 save substates covered
- **Audio**: Deterministic audio event stream, Web Audio playback, script-triggered SE/BGM/fanfare/fade
- **Link/Multiplayer**: In-memory link hub, Mystery Gift, Union Room, Trainer Tower, wireless adapter simulation
- **Test coverage**: 4,384+ unit tests across movement, collisions, camera, NPCs, triggers, scripts, battles, inventory, saves, menus, rendering, audio, and link features

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

### Development
- `npm ci` - Install dependencies from lockfile
- `npm run dev` - Start development server

### Verification
- `npm run test -- --run` - Run full test suite (4,384+ tests)
- `npm run test -- --run test/parityContract.test.ts` - Parity contract tests
- `npm run test -- --run test/convergence-coverage.test.ts` - Convergence coverage gate
- `npm run test -- --run test/*conversion*.test.* test/*coverage*.test.* test/*inventory*.test.*` - Conversion and inventory tests
- `npm run build` - TypeScript compilation and Vite build
- `npx playwright test e2e/mainRoute.spec.ts e2e/postgameLinkRoute.spec.ts --reporter=line` - Browser route verification

Use `npm ci` instead of `npm install` for bootstrap and CI. It installs exactly from `package-lock.json`.

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

### Current State

- The exporter emits `land` wild encounters fully; `water` encounters export exists with full runtime consumption.
- It is a read-only extraction tool; it does not write generated files into the repo by itself.
- The runtime consumes collision rows, encounter rows, trigger data, and wild encounters from the exporter payload.
- **Exporter capability**: All 425 maps exportable and verified.
- **Runtime registry**: All 425 maps supported through the exporter (full parity verified).

## Parity verification

### Final convergence status

The port achieves **zero-missing parity** across all required FireRed systems:

| Category | Required | Status |
|----------|----------|--------|
| Maps | 425 | ✅ Complete |
| Warps | 1,294 | ✅ Complete |
| Connections | 120 | ✅ Complete |
| Script labels | 1,819 | ✅ Complete |
| Script commands | 213 | ✅ Complete |
| Field specials | 272 | ✅ Complete |
| Movement commands | 172 | ✅ Complete |
| Item flows | 360 | ✅ Complete |
| Battle behaviors | 855 | ✅ Complete |
| Menu scenes | 25 | ✅ Complete |
| Save substates | 20 | ✅ Complete |
| Render/text fixtures | 23 | ✅ Complete |
| Audio events | 23 | ✅ Complete |
| Link/hardware features | 17 | ✅ Complete |

**Total**: 5,655 required parity items verified. Missing: 0. Untracked: 0. Unresolved: 0.

Evidence locations:
- Convergence report: `.sisyphus/evidence/task-19-convergence-report.txt`
- Browser route specs: `e2e/mainRoute.spec.ts`, `e2e/postgameLinkRoute.spec.ts`
- Parity fixtures: `test/parity/`
- Native oracle: `tools/battletrace/`

### Documentation

- **Parity contract**: `roadmap/ROADMAP.md`
- **Decomp conversion tracking**: `DECOMP_SRC_CONVERSION_PROGRESS.md`
- **Evidence archive**: `.sisyphus/evidence/`

### Contributing

When modifying the port, maintain 1:1 parity:

1. Preserve bugs, quirks, RNG order, timing, and observable behavior
2. Browser adaptations only at hardware boundaries (canvas, web audio, storage, input)
3. No non-parity enhancements or QoL changes
4. Test-driven development: tests first, implementation to pass
5. All changes must pass the full verification suite
