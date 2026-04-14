# Step 07 — Trigger zones + scripts v1

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
- Expand condition support beyond exact var equality (flags, ranges, negation).
- Add script queue semantics (advance/close) instead of instant open/close dialogue toggles.
