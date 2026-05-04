# Step 07 — Trigger zones + scripts v1

## Status
Complete (Wave 1). Core infrastructure implemented; script label coverage continues in Task 9.

## Objective

Add a first trigger/script slice that mirrors core FireRed field flow:

- interaction checks object events first, then facing/background-style triggers
- stepping onto coordinate tiles can execute script callbacks
- trigger execution is data-driven from map JSON metadata
- simple runtime variables and one-shot trigger gates exist for script conditions

## Implementation notes

- 2026-04-14: Extended `MapSource` and `TileMap` contracts with trigger-zone metadata and validation.
- 2026-04-14: Added script runtime/registry scaffolding in `src/game/scripts.ts`.
- 2026-04-14: Added facing + step trigger execution in `src/game/triggers.ts`.
- 2026-04-14: Updated interaction update order to keep object (NPC) priority before facing triggers, analogous to `GetInteractionScript` ordering in `src/field_control_avatar.c`.
- 2026-04-14: Added prototype sign/coord/warp script hooks and HUD surfacing for last script id.
- 2026-04-14: Added tests in `test/triggers.test.ts` and expanded map/interaction test coverage.

## Follow-ups

- Add object-event script ids sourced from extracted map event tables.
- Add script queue semantics (advance/close) instead of instant open/close dialogue toggles.

## Additional iteration notes

- 2026-04-14: Added FireRed-style trigger gating extensions that keep legacy `VarGet(trigger) == index` parity while also allowing additional AND conditions for variable ranges (`gt/gte/lt/lte/ne`) and flag-state checks.
- 2026-04-14: Added script runtime helpers for var math and flags (`set/add/get var`, `set/clear/is flag`) so trigger/script code maps more directly to decomp-side `Var*` / `Flag*` operations.
- 2026-04-14: Extended prototype route data with a follow-up coordinate trigger gated by both var progress and a one-time acknowledgement flag.
- 2026-04-14: Updated prototype object-event script behavior so NPC dialogue branches on persisted flag/var state (first-talk flag set + follow-up lines), matching decomp-style event script statefulness.
