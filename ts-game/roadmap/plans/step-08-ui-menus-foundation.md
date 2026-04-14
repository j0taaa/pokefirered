# Step 08 — UI menus foundation

Status: ✅ Done on 2026-04-14

## Scope shipped

- Added a `StartMenuState` model and step function under `src/game/menu.ts`.
- Wired START-menu input handling into the main loop before interaction/movement.
- Added directional edge-trigger input booleans (`upPressed/downPressed/...`) for menu navigation fidelity.
- Added a DOM start-menu overlay (`src/ui/startMenu.ts`) and HUD menu status field.
- Frozen world stepping (player + NPC updates) while menu is active.

## FireRed parity notes

- Ordering and open path mirror FireRed field controls in spirit: START is checked from field input and opens the start menu (`src/field_control_avatar.c`).
- START while dialogue is active first cancels message flow, then opens menu (modeled from `FieldInput_HandleCancelSignpost` behavior).
- Menu option ordering is aligned to FireRed baseline ordering from `start_menu.c`.

## Tests

- Added `test/menu.test.ts` for:
  - start-open behavior,
  - dialogue-close-on-open behavior,
  - cursor wraparound,
  - EXIT close handling.
- Existing tests kept green with updated input snapshot shape.
