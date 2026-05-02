# Overworld Collision Parity Tracker

This tracker records the remaining major gaps before the TypeScript overworld can be called
1:1 with the FireRed decomp for movement, collision, warps, and field object behavior.

Major gaps remaining: 0

## Remaining Major Gaps

None tracked.

## Completed Closures

- Added decomp-shaped field collision APIs for base collision, object-event collision, player-avatar collision, collision flags, map-grid accessors, ledge predicates, surf predicates, object lookup, and warp metatile predicates.
- Removed browser-only fixture/behavior fallbacks from collision and warp activation paths.
- Made player and NPC tile stepping consume the shared field collision engine for normal map/object blocking.
- Added runtime checks for hidden object-events so flagged/hidden NPCs do not move or participate in NPC collision.
- Added an automated fresh-decomp-export audit for all committed compact browser maps with collision, elevation, behavior, metatile, layer, and warp data.
- Made step trigger execution stop at the first runnable coord event and suppress later normal step side effects such as wild encounters, matching the decomp step-script gate.
- Added elevation-aware trigger matching and exporter support for coord/bg event elevations with decomp wildcard elevation `0` semantics.
- Made player-facing object-event interaction elevation-aware, including decomp wildcard elevation `0` behavior.
- Made counter interactions use the same player-elevation object-event lookup when selecting the NPC behind the counter.
- Made interaction startup ignore hidden or flag-disabled object events before selecting/freezing/running their scripts.
- Made A-button object-event lookups derive facing-position elevation like `GetInFrontOfPlayerPosition`, forcing elevation `0` from zero-elevation player tiles.
- Made A-button facing/background triggers use the same facing-position elevation rule for sign and hidden-item lookups.
- Passed exported runtime elevation rows into the interaction path so front-tile checks can make decomp-shaped elevation decisions from map data.
- Added the decomp `GetInteractionScript` metatile fallback after object-event and background-event lookups.
- Added generic metatile script mapping for PCs, shelves, signs, fixtures, monitors, and other FireRed flavor-text metatiles.
- Preserved decomp interaction priority so background events still win before metatile script fallback.
- Added the decomp `GetInteractedWaterScript` fallback after metatile interactions.
- Added A-button water gates for fast current, Surf startup, Waterfall use, and can't-use-waterfall outcomes.
- Added a decomp-shaped `CanFish`/`FieldUseFunc_Rod` helper with rod secondary IDs, waterfall and underwater rejection, on-foot elevation-mismatch water checks, surfing collision-zero checks, and `StartFishing` control-lock/prevent-step side effects.
- Added Surf and Waterfall field-effect handling to the decomp script interpreter so accepted field-move scripts update runtime/avatar state.
- Added decomp-shaped walk-into-signpost handling for held vertical movement into signpost metatiles.
- Wired walk-into-signpost checks into the main overworld loop before normal player movement starts.
- Preserved walk-into-signpost restrictions: held direction must match facing, horizontal movement is rejected, and scripted signpost bg events still use elevation/condition gates.
- Added a decomp-shaped arrow-warp resolver that only activates arrow warp metatiles when held D-pad direction matches player facing.
- Stopped generic current-tile warp resolution from activating arrow or directional stair warps unless the matching decomp gate admits them.
- Wired arrow-warp handling into the overworld loop before walk-into-signpost and normal player movement checks.
- Completed rendering-priority-from-object-state parity: field sprites now use previous elevation, decomp elevation-to-priority slots, decomp `SetObjectSubpriorityByElevation` row/subpriority math, and script-forced fixed subpriority state.
- Completed object visibility/flags/hidden-object parity: object events now distinguish active spawned state, script invisibility, remove/add lifecycle, real template hide flags, and runtime hidden flags across rendering, interaction, movement, and collision.
- Completed connection/border runtime edge-case parity for loaded runtime maps: connected-edge movement now stays behind the shared decomp-shaped collision path, valid overlaps transition by decomp offsets, invalid overlaps or unloaded destinations block, and connected target collision bits, directional impassability, and elevation mismatches all reject before map transfer.
- Added the decomp controllable-vs-forced phase gate for forced movement tiles: controllable players no longer auto-slide just because they are standing on a forced tile, normal movement onto a forced tile arms the next forced step, and a movement update no longer chains into a second tile step in the same frame.
- Completed forced movement tile parity for FireRed's implemented forced metatiles: walk, slide, current, waterfall, ice/slippery floor, spin, stop-spinning, blocked forced movement, forced ledge/stop-surfing/boulder field-action handoff, and the decomp controllable/forced phase gate now share the same branch order as `TryDoMetatileBehaviorForcedMovement` / `DoForcedMovement`. FireRed Secret Base jump/spin mat predicates are decomp stubs and remain inert.
- Completed ledge/jump movement effects: ledge collision keeps the decomp `CheckForObjectEventCollision` order, ledge metatile direction predicates mirror `GetLedgeJumpDirection`, blocked ledge tiles still produce `COLLISION_LEDGE_JUMP`, jumps animate with the decomp 8-frame movement duration to the tile beyond the ledge, forced ledges preserve forced phase, and ledge jumps increment `GAME_STAT_JUMPED_DOWN_LEDGES` when the field action starts.
- Completed Strength boulder task parity: Strength flag gating, pushable-boulder-only lookup, destination collision/non-anim-door/fall-warp rules, slower boulder push animation/commit, fall-hole removal, forced-action continuation, and Victory Road strength-button coord-event activation now follow the decomp `TryPushBoulder` / `Task_BumpBoulder` flow.
- Completed NPC movement-type parity for committed browser maps: exported object events now preserve decomp initial-facing rules, ranged movement range expansion, invisible movement state, random look/face direction tables, wander direction tables, slower wander speed, back-and-forth walking, walk-sequence routing, outside-range retries, and shared collision/object blocking. The test suite now audits every committed compact-map NPC movement type against the supported runtime set.
- Completed field input/script gating: start-menu, interaction, and player-movement admission now share explicit decomp-shaped field input gates, blocking field buttons during dialogue, script sessions, pending forced movement, field actions, start-menu world blocking, and battle blocking while still allowing active field actions to finish through their dedicated path.
- Completed full warp variant behavior for the browser runtime: current-tile, door, arrow, directional-stair, escalator, Lavaridge, warp-pad/teleport, union-room, fall-warp, and dynamic-warp branches now expose decomp-shaped warp effects, record the corresponding warp task/special side effects, handle fall initial-avatar reset state, set union-room mode, and apply the decomp bike stair dismount delay.
- Added decomp-shaped movement-action decoding for scripted `applymovement` blocks: face, walk speed families, run, slide, glide, current, jump/jump2/in-place jump, delays, facing lock, original-facing restore, visibility, emotes, animation, fixed-priority, affine, trainer reveal, Rock Smash, Cut, and Nurse Joy bow commands now resolve to FireRed movement action IDs, and an audit covers every movement command referenced by loaded decomp `applymovement` labels.
- Wired decomp script-movement task control flow into field scripts: `applymovement` now starts a `ScriptMovement_StartObjectMovementScript`-shaped task, records the moving local id, and `waitmovement` / `waitmovementat` suspend script continuation until `ScriptMovement_IsObjectMovementFinished` reports completion.
- Moved scripted actor updates behind emitted held-movement actions: field scripts now decode held action IDs back into movement actions and apply player/NPC/camera state only when the decomp-shaped movement task advances, instead of teleporting actors through an entire movement block at `applymovement` time.
- Completed object-event movement-action parity for the browser runtime: held movement actions now carry decomp-derived completion durations for face, delay, walk speed, walk-in-place, run, current, slide, jump, acro, spin, glide, and special action families, and script continuation cannot consume the next movement command until the active held action clears.
- Completed player-avatar transition/task parity for the browser runtime: `PlayerState` now keeps decomp-style avatar `flags` separate from pending `transitionFlags`, `DoPlayerAvatarTransition` consumes transition bits in FireRed state order and clears them, `SetPlayerAvatarStateMask` preserves only dash/forced/controllable bits, Acro transition bits run the same Bike transition as the decomp, underwater transition remains a no-op transition handler, controllable return-to-field is explicit, avatar graphics/state lookup follows gendered decomp mappings, player avatar init clears/rebuilds state like `InitPlayerAvatar`, and initial map-entry transition/direction adjustment mirrors `overworld.c`.
- Completed Bike/Acro/Mach Bike special-case parity for FireRed's implemented runtime: bike state now preserves `BikeClearState`, `Bike_UpdateBikeCounterSpeed`, `GetPlayerSpeed`, turning/slope state transitions, field-button fastest-speed gating, Cycling Road downhill/uphill handling, bike-specific `GetBikeCollisionAt` behavior for running-disallowed metatiles and cracked ice `COLLISION_COUNT`, decomp `RideWaterCurrent` movement speed for normal bike movement, Acro/Mach shared bike transition behavior, and FireRed's bumpy-slope/rail/Fortree predicates remain inert because the decomp stubs return false.
- Completed the trace-based parity harness: overworld traces can now record ordered decomp-shaped field collision decisions, committed movement targets, blocking object IDs, connection edge admission, and player step snapshots before/after browser movement. The harness covers blocked collision, ledge movement targets, previous-tile object blocking, connected-edge movement, and bike-specific collision outcomes such as running-disallowed blocking and cracked-ice `COLLISION_COUNT`.
- Completed the full map export/data audit: all committed decomp-backed compact browser maps are now refreshed from the decomp exporter, audited without silent skips against a fresh export for metadata, collision/elevation/behavior/encounter rows, visual metatile/layer data, warps, triggers, hidden items, object events, clone objects, berry trees, and wild encounters, and loaded through `loadMapById` with exact runtime collision/elevation/behavior/visual arrays.
- Completed Surf/water/fishing/waterfall edge-case parity for the tracked browser runtime: compact map exports now preserve raw terrain attribute rows, `MetatileAtCoordsIsWaterTile` uses the decomp terrain-bit check, A-button Surf and rod use require the same elevation-mismatch/collision/water-terrain gates as `IsPlayerFacingSurfableFishableWater`, waterfall/current interaction ordering stays decomp-shaped, and water/fishing/rock-smash encounter tables plus water encounter markers now load from decomp data so surfing wild battles use water encounter groups and water battle terrain.

## Completed Major Gaps

- Rendering priority from object state
- Object visibility/flags/hidden objects
- Connection/border runtime edge cases
- Forced movement tiles
- Ledges/jump movement effects
- Strength boulder task parity
- NPC movement-type parity for committed browser maps
- Field input/script gating
- Full warp variant behavior
- Object-event movement actions
- Player avatar transition/task parity
- Bike/Acro/Mach Bike special cases
- Trace-based parity harness
- Full map export/data audit
- Surf/water/fishing/waterfall edge cases

## Notes

- The tracked major gap list is closed for committed browser-port overworld collision/movement scope.
- Current map audit covers every committed decomp-backed browser-port compact map. Future runtime maps must be added to the committed compact-map set so they are covered by the same no-skip audit.
