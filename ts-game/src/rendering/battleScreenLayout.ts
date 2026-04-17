/**
 * FireRed single-battle scene coordinates, kept in GBA pixels.
 * Battler and healthbox anchors mirror decomp values from `battle_anim_mons.c`
 * and `battle_interface.c::InitBattlerHealthboxCoords`.
 *
 * Bottom text / prompt / PP / type panels use the **standard** window frame (`DrawStdWindowFrame`),
 * not the dialogue `menu_message` box — same as field menus in this port.
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

export const BATTLE_COMMAND_LABELS = [
  { command: 'fight', x: 152, y: 126 },
  { command: 'bag', x: 192, y: 126 },
  { command: 'pokemon', x: 152, y: 140 },
  { command: 'run', x: 192, y: 140 }
] as const;

export const BATTLE_MOVE_SLOTS = [
  { index: 0, x: 24, y: 126 },
  { index: 1, x: 112, y: 126 },
  { index: 2, x: 24, y: 140 },
  { index: 3, x: 112, y: 140 }
] as const;

export const BATTLE_PP_BOX = { x: 178, y: 122, w: 50, h: 14 } as const;
export const BATTLE_TYPE_BOX = { x: 178, y: 138, w: 50, h: 10 } as const;
