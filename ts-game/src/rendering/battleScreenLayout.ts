/**
 * FireRed single-battle scene coordinates, kept in GBA pixels.
 * Battler anchors mirror `battle_anim_mons.c`; healthbox sprite roots mirror
 * `battle_interface.c::InitBattlerHealthboxCoords`.
 *
 * Bottom panels use the battle textbox tile layer (`gBattleInterface_Textbox_*`) plus
 * bitmap healthbox art — not the field `std.png` nine-slice.
 */

export const BATTLE_GBA_WIDTH = 240;
export const BATTLE_GBA_HEIGHT = 160;

export const BATTLE_SINGLE_BATTLER_COORDS = {
  player: { x: 72, y: 80 },
  opponent: { x: 176, y: 40 }
} as const;

export const BATTLE_SINGLE_HEALTHBOX_COORDS = {
  opponent: { x: 44, y: 30, w: 92, h: 30 },
  player: { x: 158, y: 88, w: 74, h: 30 }
} as const;

export const BATTLE_MESSAGE_WINDOW = { x: 8, y: 120, w: 224, h: 32 } as const;
export const BATTLE_ACTION_PROMPT_WINDOW = { x: 8, y: 120, w: 112, h: 32 } as const;
export const BATTLE_ACTION_MENU_WINDOW = { x: 136, y: 120, w: 96, h: 32 } as const;
export const BATTLE_MOVE_MENU_WINDOW = { x: 8, y: 120, w: 224, h: 32 } as const;
export const BATTLE_LIST_WINDOW = { x: 8, y: 100, w: 224, h: 52 } as const;

/** Monospace-style advance for battle command text (avoids proportional-font overlap). */
export const BATTLE_COMMAND_CHAR_ADVANCE = 7;

export const BATTLE_COMMAND_LABELS = [
  { command: 'fight' as const, label: 'FIGHT', x: 140, y: 124 },
  { command: 'bag' as const, label: 'BAG', x: 200, y: 124 },
  { command: 'pokemon' as const, label: 'POKéMON', x: 136, y: 138 },
  { command: 'run' as const, label: 'RUN', x: 204, y: 138 }
] as const;

export const BATTLE_MOVE_SLOTS = [
  { index: 0, x: 24, y: 126 },
  { index: 1, x: 112, y: 126 },
  { index: 2, x: 24, y: 140 },
  { index: 3, x: 112, y: 140 }
] as const;

export const BATTLE_PP_BOX = { x: 178, y: 122, w: 50, h: 14 } as const;
export const BATTLE_TYPE_BOX = { x: 178, y: 138, w: 50, h: 10 } as const;
