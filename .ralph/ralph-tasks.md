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
- Commit completed task changes directly to the current branch after checks pass.
- Push commits to GitHub whenever something is added or changed; the `gh` CLI is present if GitHub context or authentication checks are needed.
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

- [ ] Extend `ts-game/scripts/export-decomp-map.mjs` to export `warp_events` with destination map and warp id.
- [ ] Add tests for exported warp event shape using Viridian City, Pallet Town, and Pokémon Center maps.
- [ ] Add a typed `WarpSource` contract to map sources and `TileMap`.
- [ ] Add runtime warp trigger detection based on player tile and original warp event coordinates.
- [ ] Implement unloaded-warp placeholder handling with clear script/runtime state.
- [ ] Export object-event trainer metadata (`trainer_type`, `trainer_sight_or_berry_tree_id`) for trainer battle support.
- [ ] Export hidden item metadata with item id, quantity, flag, and underfoot behavior.
- [ ] Export berry tree events when encountered in map data.
- [ ] Export clone object events instead of silently dropping clone-only data.
- [ ] Add generic tileset attribute path tests for several secondary tileset names.
- [ ] Add a command to export a batch of maps listed in a manifest.
- [ ] Create an early-game map manifest for Pallet/Viridian/Route1/Route2/Route22/Route21.
- [ ] Add snapshot/parity tests for the manifest export output.
- [ ] Add exporter support for map labels that differ from folder names.
- [ ] Document exporter inputs, outputs, and decomp parity assumptions in `ts-game/README.md`.

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
