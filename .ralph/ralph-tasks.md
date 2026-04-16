# FireRed Browser Port Ralph Backlog

This file is the task source for the Ralph/OpenCode loop. Work from top to bottom, one cohesive task at a time.

## Ralph Operating Rules

- Stay scoped to the browser-port track under `ts-game/` unless a docs-only repo-root update is required.
- Always compare behavior against the original decomp C/ASM/data files before implementing.
- Prefer generated/exported data from the original decomp tree over hand-authored placeholder data.
- Keep the app runnable after every task.
- Add or update tests for non-trivial logic.
- Run the relevant checks before marking a task complete.
- Mark completed tasks by changing `[ ]` to `[x]` in this file and add a short note under "Ralph Progress Notes".
- Do not commit or push manually; the Ralph wrapper uploads new commits to GitHub after Ralph exits. The `gh` CLI is present if GitHub context is needed.
- Do not commit generated bundles or binary artifacts.
- Keep implementation decoupled: rendering, input, data adapters, scripts, battle, menus, and save systems should remain separable.
- If blocked, add a note with exact file paths and the blocker, then continue to the next independent task.

## Standard Checks

Run these when a task touches the browser port:

```bash
cd ts-game
npm run test -- --run
npm run build
cd ..
git diff --check
```

Run exporter checks after data-adapter changes:

```bash
cd ts-game
npm run export:map -- Route1
npm run export:map -- PalletTown
npm run export:map -- ViridianCity
```

Add newly supported maps to the exporter sanity list as they land.

## Completion Definition

The browser port is "finished" when the player can complete the main FireRed game flow in-browser with original maps/scripts/trainers/items/battles/save behavior at practical parity:

- New game or saved game starts correctly.
- Player can travel through all required maps.
- Warps, doors, map connections, signs, item balls, hidden items, NPCs, trainers, shops, centers, menus, battles, party, bag, Pokédex, HM gating, badges, story flags, and credits flow work.
- Automated tests cover core logic and decomp parity for exported data.
- `npm run test -- --run`, `npm run build`, and `git diff --check` pass.

## Phase 1 - Data Export Foundation

- [x] Extend `ts-game/scripts/export-decomp-map.mjs` to export `warp_events` with destination map and warp id.
- [x] Add tests for exported warp event shape using Viridian City, Pallet Town, and Pokémon Center maps.
- [x] Add a typed `WarpSource` contract to map sources and `TileMap`.
- [x] Add runtime warp trigger detection based on player tile and original warp event coordinates.
- [x] Implement unloaded-warp placeholder handling with clear script/runtime state.
- [x] Export object-event trainer metadata (`trainer_type`, `trainer_sight_or_berry_tree_id`) for trainer battle support.
- [x] Export hidden item metadata with item id, quantity, flag, and underfoot behavior.
- [x] Export berry tree events when encountered in map data.
- [x] Export clone object events instead of silently dropping clone-only data.
- [x] Add generic tileset attribute path tests for several secondary tileset names.
- [x] Add a command to export a batch of maps listed in a manifest.
- [x] Create an early-game map manifest for Pallet/Viridian/Route1/Route2/Route22/Route21.
- [x] Add snapshot/parity tests for the manifest export output.
- [x] Add exporter support for map labels that differ from folder names.
- [x] Document exporter inputs, outputs, and decomp parity assumptions in `ts-game/README.md`.

## Phase 2 - Outdoor Map Coverage

- [ ] Add Route 2 compact/decomp-backed map data and parity tests.
- [ ] Wire Viridian City north connection to Route 2.
- [ ] Add Route 22 compact/decomp-backed map data and parity tests.
- [ ] Wire Viridian City west connection to Route 22.
- [ ] Add Route 21 North compact/decomp-backed map data and parity tests.
- [ ] Wire Pallet Town south connection to Route 21 North.
- [ ] Add Route 21 South compact/decomp-backed map data and parity tests.
- [ ] Add Viridian Forest entrance/exit outdoor maps and parity tests.
- [ ] Add Pewter City compact/decomp-backed map data and parity tests.
- [ ] Wire Route 2/Pewter/Viridian Forest travel path.
- [ ] Add Route 3 compact/decomp-backed map data and parity tests.
- [ ] Add Route 4 compact/decomp-backed map data and parity tests.
- [ ] Add Cerulean City compact/decomp-backed map data and parity tests.
- [ ] Add Route 24 and Route 25 compact/decomp-backed map data and parity tests.
- [ ] Add Route 5/6/7/8/9/10 maps and connection tests.
- [ ] Add Vermilion City map and connection tests.
- [ ] Add Rock Tunnel outdoor entrances.
- [ ] Add Lavender Town map and connection tests.
- [ ] Add Celadon City map and connection tests.
- [ ] Add Saffron City map and connection tests.
- [ ] Add Fuchsia City map and connection tests.
- [ ] Add Cinnabar Island map and connection tests.
- [ ] Add Indigo Plateau outdoor/center map and connection tests.
- [ ] Add Sevii Islands outdoor maps required by the FireRed story.

## Phase 3 - Indoor Maps And Warps

- [ ] Add warp runtime support for entering/exiting buildings.
- [ ] Add Pallet player house 1F/2F maps, warps, signs, and tests.
- [ ] Add Pallet rival house map, warps, NPCs, and tests.
- [ ] Add Professor Oak's Lab map, starter table events, NPCs, and tests.
- [ ] Add Viridian Pokémon Center map and healing workflow stub.
- [ ] Add Viridian Mart map and shop clerk workflow stub.
- [ ] Add Viridian School map and signs.
- [ ] Add Viridian House map and NPCs.
- [ ] Add Viridian Gym map locked/unlocked behavior.
- [ ] Add standard Pokémon Center template behavior for all centers.
- [ ] Add standard Mart template behavior for all marts.
- [ ] Add Pewter interiors and Gym.
- [ ] Add Cerulean interiors and Gym.
- [ ] Add Vermilion interiors, Fan Club, Gym, and harbor entry.
- [ ] Add Celadon interiors, department store, game corner, and Gym.
- [ ] Add Lavender interiors and Pokémon Tower floors.
- [ ] Add Saffron interiors, Silph Co, Fighting Dojo, and Gym.
- [ ] Add Fuchsia interiors, Safari Zone gates, and Gym.
- [ ] Add Cinnabar interiors, Pokémon Mansion, lab, and Gym.
- [ ] Add Indigo Plateau interior maps and Elite Four rooms.
- [ ] Add Sevii Island interiors needed for story completion.

## Phase 4 - Script Engine Parity

- [ ] Replace ad-hoc script callbacks with a small interpreted script operation layer.
- [ ] Model core commands: `msgbox`, `setvar`, `goto_if_eq`, `goto_if_set`, `setflag`, `clearflag`, `giveitem`, `checkitemspace`, `applymovement`, `warp`.
- [ ] Add tests for script branching against Route 1 Mart clerk, Pallet sign lady, and Viridian old man.
- [ ] Add movement script queue support for player and NPCs.
- [ ] Add door open/close animation state at gameplay logic level.
- [ ] Add `lock`, `lockall`, `release`, and `releaseall` interaction blocking semantics.
- [ ] Add `waitmovement`, `waitstate`, and dialogue continuation semantics.
- [ ] Add yes/no choice support and `VAR_RESULT`.
- [ ] Add multichoice menus used by common scripts.
- [ ] Add starter selection script flow.
- [ ] Add Oak parcel delivery script flow.
- [ ] Add Pokédex acquisition script flow.
- [ ] Add badge and gym leader event scripts.
- [ ] Add HM acquisition and field move gating scripts.
- [ ] Add fossil selection and restoration scripts.
- [ ] Add Team Rocket story scripts.
- [ ] Add Elite Four and Champion scripts.
- [ ] Add Hall of Fame and credits scripts.
- [ ] Add script persistence tests for flags, vars, consumed triggers, and story state.

## Phase 5 - Player, Movement, Collision, And Field Moves

- [ ] Replace free-pixel movement with tile-step movement matching Gen 3 field behavior.
- [ ] Add step timing and directional input buffering.
- [ ] Add running shoes gating and speed behavior.
- [ ] Add bike mode and cycling restrictions.
- [ ] Add surf movement mode and water collision behavior.
- [ ] Add ledge jump animation timing and landing lockout.
- [ ] Add stairs/bridge/overpass behavior where needed.
- [ ] Add cut tree object behavior and persistence.
- [ ] Add strength boulder behavior.
- [ ] Add rock smash object behavior.
- [ ] Add flash/darkness behavior for caves.
- [ ] Add fly destination registry and map section unlocks.
- [ ] Add dig/escape rope escape behavior.
- [ ] Add poison step damage behavior.
- [ ] Add repel step counter behavior.
- [ ] Add wild encounter step counter more faithful to original `wild_encounter.c`.
- [ ] Add map transition animation/fade state.
- [ ] Add collision tests for water, surf, cut trees, strength boulders, and ledges.

## Phase 6 - Rendering And Assets

- [ ] Build an asset extraction pipeline for tileset graphics suitable for browser rendering.
- [ ] Render maps from original metatile graphics rather than debug colors.
- [ ] Render primary and secondary tilesets with palettes.
- [ ] Render animated tiles for water, flowers, doors, and special tiles.
- [ ] Replace player marker with original overworld sprites.
- [ ] Add NPC sprite rendering from object graphics ids.
- [ ] Add movement animations for player and NPCs.
- [ ] Add object event sprites for item balls, cut trees, boulders, and water NPCs.
- [ ] Add battle transition visual.
- [ ] Add dialogue box visual close to FireRed.
- [ ] Add menu window rendering close to FireRed.
- [ ] Add map name popup rendering.
- [ ] Add fade transitions for map loads and warps.
- [ ] Add asset loading tests/smoke checks.

## Phase 7 - Menus And UI Systems

- [ ] Finish START menu option parity with original dynamic entries.
- [ ] Implement party menu with six Pokémon slots.
- [ ] Implement Pokémon summary screens.
- [ ] Implement bag pockets and item use.
- [ ] Implement trainer card.
- [ ] Implement Pokédex list/detail shell.
- [ ] Implement save confirmation and overwrite flow at closer parity.
- [ ] Implement options screen with persisted settings.
- [ ] Implement map/town map view.
- [ ] Implement PC storage UI enough for story completion.
- [ ] Implement shop buy/sell UI.
- [ ] Implement move selection UI outside battle for HMs/TMs.
- [ ] Implement naming screen for player/rival/Pokémon.
- [ ] Add keyboard/gamepad remapping support.
- [ ] Add responsive/mobile touch controls after desktop parity is stable.

## Phase 8 - Party, Pokémon Data, Items, And Growth

- [ ] Export Pokémon species base stats/types/abilities from decomp data.
- [ ] Export move data with power/type/accuracy/category/effects.
- [ ] Export item data and pocket/category metadata.
- [ ] Implement Pokémon party model with species, level, EXP, stats, IVs, EVs, nature placeholder, moves, PP, status.
- [ ] Implement EXP gain and level-up.
- [ ] Implement evolution rules needed for FireRed.
- [ ] Implement learnset and move replacement flow.
- [ ] Implement item usage on party Pokémon.
- [ ] Implement Poké Ball inventory and capture item consumption.
- [ ] Implement HMs/TMs.
- [ ] Implement key items and story items.
- [ ] Implement money and prize payouts.
- [ ] Add save/load migration for party, bag, Pokédex, money, badges, and playtime.

## Phase 9 - Battle System

- [ ] Replace prototype damage with Gen 3 damage formula.
- [ ] Add physical/special split by type for Gen 3.
- [ ] Add STAB, type effectiveness, random damage roll, burn, critical hits.
- [ ] Add accuracy/evasion and move miss behavior.
- [ ] Add PP consumption and Struggle.
- [ ] Add priority and turn order.
- [ ] Add status conditions: poison, burn, paralysis, sleep, freeze, confusion.
- [ ] Add volatile effects needed by main-game moves.
- [ ] Add stat stages.
- [ ] Add switching and forced switch flow.
- [ ] Add trainer battle party data and AI.
- [ ] Add wild battle escape odds.
- [ ] Add capture formula closer to Gen 3.
- [ ] Add battle items.
- [ ] Add EXP/share behavior enough for main game.
- [ ] Add double battle support if needed by story/trainers.
- [ ] Add battle tests using known Gen 3 formula examples.
- [ ] Add trainer rematch/defeated flags.

## Phase 10 - Trainers, Encounters, Gyms, And Story Progression

- [ ] Export trainer parties and trainer metadata.
- [ ] Add trainer sight-line detection.
- [ ] Add trainer approach movement.
- [ ] Add trainer battle start/end scripts.
- [ ] Add defeated trainer flags.
- [ ] Add Gym leader battle flows and badge rewards.
- [ ] Add rival battle flows.
- [ ] Add Team Rocket battle flows.
- [ ] Add Snorlax/static encounter flows.
- [ ] Add legendary/static encounter scaffolding.
- [ ] Add fishing encounters.
- [ ] Add surfing encounters.
- [ ] Add cave/grass/water encounter tables for all maps.
- [ ] Add Safari Zone encounter and step rules.
- [ ] Add story gate tests for badge/HM progression.

## Phase 11 - Save, Persistence, And Compatibility

- [ ] Expand save schema for all game state.
- [ ] Add schema migration tests.
- [ ] Add save corruption handling tests.
- [ ] Persist current map, warp id, position, facing, party, bag, flags, vars, money, badges, Pokédex, options, playtime.
- [ ] Add autosave/dev save utilities gated behind dev mode.
- [ ] Add import/export save JSON for debugging.
- [ ] Add deterministic RNG seed persistence for tests where useful.

## Phase 12 - Audio

- [ ] Add audio system abstraction.
- [ ] Add map music routing by original map metadata.
- [ ] Add sound effect triggers for menu movement, dialogue, item obtain, doors, ledges, battle start.
- [ ] Add mute/volume options.
- [ ] Add tests for music state transitions at logic level.

## Phase 13 - Quality, Tooling, And Release Readiness

- [ ] Add linting if not already present.
- [ ] Add typecheck-only CI command.
- [ ] Add a browser smoke test using Playwright for boot, movement, interact, map transition, save.
- [ ] Add visual smoke tests for rendered maps after real assets land.
- [ ] Add performance pass for map rendering culling and asset caching.
- [ ] Add error boundary / fatal error overlay.
- [ ] Add dev debug panel for map id, tile, behavior, encounter type, flags, vars.
- [ ] Add docs for running, testing, exporting data, and adding new maps.
- [ ] Add a release checklist.
- [ ] Keep PR-sized commits grouped by subsystem.

## Ralph Progress Notes

- 2026-04-15: Seeded backlog for autonomous Ralph/OpenCode loop.
- 2026-04-15: Phase 1 Task 1 done. Added `warpEventToWarp` converter to `export-decomp-map.mjs` exporting `{x, y, elevation, destMap, destWarpId}` from decomp `warp_events`. Verified with PalletTown (3 warps), ViridianCity (5 warps), ViridianCity_PokemonCenter_1F (4 warps), and Route1 (0 warps). All 82 tests pass, build clean.
- 2026-04-15: Phase 1 Task 2 done. Added `test/warpExport.test.ts` with 9 tests covering: PalletTown (3 warps), ViridianCity (5 warps), ViridianCity_PokemonCenter_1F (4 warps), Route1 (0 warps). Tests validate output shape `{x, y, elevation, destMap, destWarpId}`, dest_warp_id string→number conversion, MAP_ constant form, and exact coordinate parity against decomp JSON. All 91 tests pass, build clean.
- 2026-04-15: Phase 1 Task 3 done. Added typed `WarpSource` interface (`{x, y, elevation, destMap, destWarpId}`) to `mapSource.ts`, added `warps` field to `MapSource`, `CompactMapSource`, and `TileMap` interfaces. Threaded warps through `parseMapSource` (with validation), `mapFromSource`, and `mapFromCompactSource`. Added decomp-backed warp data to PalletTown (3 warps), ViridianCity (5 warps), and Route1 (0 warps) compact sources. Added 9 new tests covering: warp shape contract on all loaded maps, decomp coordinate parity for PalletTown and ViridianCity, destMap MAP_ form, parseMapSource validation (invalid x, empty destMap, negative destWarpId), and deep-copy isolation. All 100 tests pass, build clean.
- 2026-04-15: Phase 1 Task 4 done. Added `ts-game/src/game/warps.ts` with runtime warp trigger detection mirroring decomp `GetWarpEventAtPosition` from `field_control_avatar.c`. Implements `findWarpAtTile` (x/y/elevation matching, elevation 0 wildcard), `isWarpMetatileBehavior` (all 17 warp behaviors from `metatile_behaviors.h`), `isArrowWarpMetatileBehavior`, `resolveWarpDestination` (destination map + landing tile via dest warp index), `detectWarpAtPlayerPosition` (step/arrow warp classification), and `tryResolveWarpAtPlayerPosition` (full resolution). Wired into `main.ts` game loop: after player moves to new tile, checks for warp before step triggers/wild encounters. Warps take priority over step triggers. Added 36 tests covering: toTile conversion, all warp behaviors, arrow/stair directional checks, elevation wildcard, destination resolution, blocked landing fallback, real map parity (PalletTown 3 warps, ViridianCity 5 warps with MB_WARP_DOOR at Pokemon Center), and decomp parity for `GetWarpEventAtPosition` semantics. All 136 tests pass, build clean.
- 2026-04-15: Phase 1 Task 5 done. Implemented unloaded-warp placeholder handling. Added `WarpResolutionStatus` enum (`none|resolved|unloaded_map|invalid_warp_id|not_activatable`) and `WarpResolution` type to `warps.ts`, mirroring decomp's three-tier fallback from `SetPlayerCoordsFromWarp()`. Added `resolveWarpAttempt` (partial resolution from warp source) and `resolveFullWarpAttempt` (end-to-end detection+resolution). Added `UnloadedWarpAttempt` interface and `lastUnloadedWarp` field to `ScriptRuntimeState` with `recordUnloadedWarpAttempt`/`clearUnloadedWarpAttempt` helpers. Updated `main.ts` game loop to use `resolveFullWarpAttempt`: resolved warps apply map change, unloaded/invalid warps show placeholder dialogue and record attempt, other cases fall through to triggers/encounters. Added 20 new tests covering: resolution status discrimination, real map parity (all PalletTown+ViridianCity warps report `unloaded_map`), script runtime recording/clearing/overwrite, and save snapshot exclusion. All 156 tests pass, build clean.
- 2026-04-15: Phase 1 Task 6 done. Verified and tested trainer metadata export pipeline. Exporter (`export-decomp-map.mjs`) already outputs `trainerType` and `trainerSightOrBerryTreeId` for each NPC. `NpcSource` interface has typed `TrainerType` union and `isTrainerNpc` helper. `parseMapSource` validates trainer fields. Added 13 tests: `isTrainerNpc` for all four trainer types and undefined, `parseMapSource` validation for invalid trainerType and negative/non-integer trainerSightOrBerryTreeId, valid trainer NPC parsing, all current map NPCs confirmed TRAINER_TYPE_NONE, Route3 exporter output verified (8 trainers with sight 2-5, 1 non-trainer), and Route3 exporter output matches decomp source exactly. Updated PalletTown and ViridianCity NPC parity tests to include trainer_type/trainer_sight_or_berry_tree_id fields. All 169 tests pass, build clean.
- 2026-04-15: Phase 1 Task 7 done. Exported hidden item metadata. Added `HiddenItemSource` interface (`{x, y, elevation, item, quantity, flag, underfoot}`) to `mapSource.ts`, added `hiddenItems` field to `MapSource`, `CompactMapSource`, and `TileMap`. Added `hiddenItemEventToHiddenItem` converter to exporter outputting full metadata from decomp `bg_events` with type `hidden_item`. Added `parseHiddenItemSource` validation (integer x/y/elevation, non-empty item/flag strings, positive integer quantity, boolean underfoot). Threaded through `parseMapSource`, `mapFromSource`, `mapFromCompactSource`. Updated all map source files and test fixtures to include `hiddenItems`. Added 16 new tests: shape contract validation, parseMapSource rejection for missing item/flag/zero-qty/non-boolean-underfoot/non-integer-x, loaded maps empty array check, deep-copy isolation, non-array rejection, ViridianForest (2 hidden items) decomp parity, Route3 (1 hidden item) decomp parity, VermilionCity (1 hidden item) decomp parity, PalletTown/Route1 empty parity, FLAG_HIDDEN_ITEM_ pattern, ITEM_ pattern. All 185 tests pass, build clean.
- 2026-04-15: Phase 1 Task 8 done. Exported berry tree events. Berry trees are detected by `MOVEMENT_TYPE_BERRY_TREE_GROWTH` (0xC from `event_object_movement.h`). Added `objectEventToBerryTree` converter to exporter outputting `{x, y, elevation, berryTreeId, localId, scriptId, flag}` from decomp `object_events` with berry tree movement type. Added `BerryTreeSource` interface to `mapSource.ts`, added `berryTrees` field to `MapSource`, `CompactMapSource`, and `TileMap`. Added `parseBerryTreeSource` validation (integer x/y/elevation, positive integer berryTreeId, non-empty string localId, optional string scriptId/flag). Threaded through `parseMapSource`, `mapFromSource`, `mapFromCompactSource`. Updated all map source files and test fixtures to include `berryTrees`. Confirmed FireRed has no berry tree events (ScrCmd_setberrytree is commented out, no maps use MOVEMENT_TYPE_BERRY_TREE_GROWTH). Added 13 new tests: shape contract, parseMapSource rejection for non-integer x/y/elevation, zero berryTreeId, empty localId, non-array, loaded maps empty array, deep-copy isolation, exporter empty output for FireRed maps, exporter filtering by MOVEMENT_TYPE_BERRY_TREE_GROWTH for ViridianForest, exported shape contract, early FireRed maps confirmed zero berry tree objects. All 198 tests pass, build clean.
- 2026-04-15: Phase 1 Task 9 done. Exported clone object events. Clone objects (type "clone" in map.json) reference a target object on another map via targetLocalId + targetMap, used for border visibility of NPCs/obstacles across map connections. Added `objectEventToCloneObject` converter to exporter outputting `{x, y, graphicsId, targetLocalId, targetMap}`. Exporter now filters clone objects out of the NPC list and exports them separately in a `cloneObjects` array. Added `CloneObjectSource` interface to `mapSource.ts`, added `cloneObjects` field to `MapSource`, `CompactMapSource`, and `TileMap`. Added `parseCloneObjectSource` validation (integer x/y, non-empty string graphicsId/targetLocalId/targetMap). Threaded through `parseMapSource`, `mapFromSource`, `mapFromCompactSource`. Updated all map source files, JSON fixtures, and test TileMap literals to include `cloneObjects`. Added 18 new tests: shape contract, validation rejection for non-integer x/y, empty graphicsId/targetLocalId/targetMap, non-array, negative coordinates (border clones), loaded maps empty array, deep-copy isolation, exporter empty output for early maps, Route2 decomp parity (Cut Tree clone to ViridianCity), Route21_North decomp parity (Fat Man clone to PalletTown), clone exclusion from NPC list, LOCALID_/MAP_/OBJ_EVENT_GFX_ pattern checks, all 7 maps with clones verified correct count, no NPC fields leaked into clone objects. All 216 tests pass, build clean.
- 2026-04-15: Phase 1 Task 10 done. Added generic tileset attribute path tests for 30 secondary tileset names covering all outdoor cities, caves, indoor buildings, and special tilesets. Fixed exporter `tilesetAttributePath` conversion to handle consecutive uppercase (SSAnne→ss_anne), letter-digit boundaries (GenericBuilding1→generic_building_1), and trailing digits (SeviiIslands123→sevii_islands_123). Added `tilesetToDirName` helper in tests matching the exporter's fixed 3-step regex. Tests verify: bin file existence, size multiple of 4, valid uint32LE entries with behavior ≤ 0x1FF, all unique secondary tilesets from layouts.json resolve to existing files, and primary tilesets (General/Building) resolve correctly. 92 new test cases across 5 parametrized test blocks. All 308 tests pass, build clean.
- 2026-04-15: Phase 1 Task 11 done. Added batch map export command. Refactored `export-decomp-map.mjs` to export `exportMap` and `tilesetAttributePath` as named ESM exports (gameName now a parameter instead of argv). Created `scripts/export-batch-maps.mjs` with `exportBatch` (reads JSON manifest array of map names, exports all, returns `{maps, errors, mapNames}`). Handles individual map failures gracefully (null result + error entry). Added `export:maps` npm script: `npm run export:maps -- <manifest.json>`. Created `scripts/manifests/early-game.json` with PalletTown/Route1/ViridianCity. Added 16 tests in `test/batchExport.test.ts`: manifest validation (non-existent file, non-array, non-string entries, empty strings), output structure (correct keys, mapNames order, all maps exported), map parity (batch output matches single-export output for all 3 maps), error handling (invalid maps produce null+errors, valid maps succeed alongside failures, empty manifest, single-map manifest). All 324 tests pass, build clean.
- 2026-04-15: Phase 1 Task 12 done. Extended `scripts/manifests/early-game.json` from 3 to 7 maps: PalletTown, Route1, ViridianCity, Route2, Route22, Route21_North, Route21_South. Verified all 7 maps export cleanly via batch exporter with zero errors. Updated `test/batchExport.test.ts`: mapNames assertion updated for 7-map list, added 4 new parity tests (Route2, Route22, Route21_North, Route21_South batch export matches single export). All 328 tests pass, build clean.
- 2026-04-15: Phase 1 Task 13 done. Added `test/manifestSnapshot.test.ts` with 133 comprehensive snapshot/parity tests for the early-game manifest export output. Tests run the batch exporter once and verify all 7 maps against decomp source data: batch integrity (zero errors, correct map order, key order), metadata parity (id, name, layout, music, region_map_section, weather, map_type, allow flags, battle_scene), layout dimensions from layouts.json, collision/encounter/behavior row dimensions and format, warp count and field-by-field data parity, NPC count and field-by-field data parity (excluding clones), clone object count and field-by-field parity, trigger count parity (coord_events + bg_events), hidden item count and field-by-field parity, berry tree count parity, connection field-by-field parity, cross-map consistency (MAP_ constants, SPECIES_ constants, OBJ_EVENT_GFX_ patterns, LOCALID_ patterns), wild encounter coverage for all maps with land encounters, specific map expectations (event counts, trainer types, hidden item details, clone targets). All 461 tests pass, build clean.
- 2026-04-15: Phase 1 Task 14 done. Added label-aware lookup to `ts-game/scripts/export-decomp-map.mjs` so exports now resolve by folder name, `map.json` name, or decomp `MAP_*` label. Covered mismatched-label cases with `test/exportDecompMap.test.ts`, including `MAP_ROUTE21_NORTH` and `MAP_SSANNE_EXTERIOR`. Verified with `npm run test -- --run`, `npm run build`, direct exporter invocation via `node scripts/export-decomp-map.mjs MAP_SSANNE_EXTERIOR`, and `git diff --check`.
- 2026-04-15: Phase 1 Task 15 done. Documented the current decomp exporter in `ts-game/README.md`, covering invocation, accepted map label inputs, repo-root source files, emitted JSON fields, trigger/event conversions, parity assumptions, and current limits. Verified with `cd ts-game && npm run test -- --run`, `cd ts-game && npm run build`, and `git diff --check`.
