# Step 08 — UI menus foundation

Status: ✅ Done on 2026-04-14

## Scope shipped

- Added a `StartMenuState` model and step function under `src/game/menu.ts`.
- Wired START-menu input handling into the main loop before interaction/movement.
- Added directional edge-trigger input booleans (`upPressed/downPressed/...`) for menu navigation fidelity.
- Added a DOM start-menu overlay (`src/ui/startMenu.ts`) and HUD menu status field.
- Frozen world stepping (player + NPC updates) while menu is active.
- 2026-04-14 follow-up: start-menu setup now mirrors FireRed context builders (`normal`, `safari`, `link`, `unionRoom`) with runtime-driven entries.
- 2026-04-14 follow-up: menu selections now execute callback-like transitions into placeholder panels (instead of only writing HUD script ids), with close behavior on B/START/A.
- 2026-04-14 follow-up: OPTION now behaves as an editable menu scene with row navigation + left/right setting changes for text speed, battle scene, and battle style (mirroring `option_menu.c` item structure at prototype scope).
- 2026-04-14 follow-up: replaced start-menu placeholder text with FireRed `gStartMenuDesc_*` wording for Pokédex/Party/Bag/Player, added Safari RETIRE yes/no prompt flow, and added Pokédex open guard when no species have been seen (matching `StartMenuPokedexSanityCheck`).

## FireRed parity notes

- Ordering and open path mirror FireRed field controls in spirit: START is checked from field input and opens the start menu (`src/field_control_avatar.c`).
- START while dialogue is active first cancels message flow, then opens menu (modeled from `FieldInput_HandleCancelSignpost` behavior).
- Menu option ordering is aligned to FireRed baseline ordering from `start_menu.c`.

## Tests

- Added `test/menu.test.ts` for:
  - start-open behavior,
  - dialogue-close-on-open behavior,
  - cursor wraparound,
  - EXIT close handling,
  - context-specific menu composition and panel callback transitions.
- Existing tests kept green with updated input snapshot shape.
