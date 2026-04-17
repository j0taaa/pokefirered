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

/**
 * Healthbox placement: `InitBattlerHealthboxCoords` sets `sprite->x/y`; OAM
 * top-left is `x + centerToCornerVec` (`CalcCenterToCornerVec` in `sprite.c`).
 * - Opponent `SPRITE_SIZE_64x32` (horizontal, size 3): vec (−32, −16).
 * - Player singles switches `oam.shape` to 64×64 **after** `CreateSprite` runs; the
 *   sprite’s `centerToCornerVec` is still from the initial 64×32 template (−32, −16).
 */
export const BATTLE_HEALTHBOX_OAM_ANCHOR = {
  opponent: { oamX: 44 - 32, oamY: 30 - 16 },
  player: { oamX: 158 - 32, oamY: 88 - 16 }
} as const;

export type BattleHealthboxOamAnchor = (typeof BATTLE_HEALTHBOX_OAM_ANCHOR)[keyof typeof BATTLE_HEALTHBOX_OAM_ANCHOR];

export const BATTLE_SINGLE_HEALTHBOX_DIM = {
  opponent: { w: 128, h: 32 },
  player: { w: 128, h: 64 }
} as const;

/**
 * `AddTextPrinterAndCreateWindowOnHealthbox` (`battle_interface.c`) passes
 * `color[] = { 2, 1, 3 }` into `AddTextPrinterParameterized4` (`menu2.c`):
 * `bgColor = color[0]`, `fgColor = color[1]`, `shadowColor = color[2]`.
 * RGB values from `graphics/battle_interface/healthbox.pal` (JASC indices 1 and 3).
 */
export const BATTLE_HEALTHBOX_TEXT = {
  fg: '#414141',
  shadow: '#ded5b4'
} as const;

/**
 * `sTextOnWindowsInfo_Normal[B_WIN_MSG]` / `[B_WIN_ACTION_PROMPT]` (`battle_message.c`):
 * `fgColor = 1`, `shadowColor = 6` on palette 0 from `graphics/battle_interface/textbox1.pal`.
 */
export const BATTLE_MESSAGE_TEXT = {
  fg: '#ffffff',
  shadow: '#6a5a73'
} as const;

/**
 * Battle command + move windows use BG palette slot 5 (`paletteNum = 5` in `battle_bg.c` window templates).
 * `LoadBattleMenuWindowGfx` overwrites indices 12–15 to GBA RGB(9,9,9), RGB(9,9,9), RGB(31,31,31), RGB(26,26,25);
 * `sTextOnWindowsInfo_Normal` uses fg 13, bg 14, shadow 15 for `B_WIN_ACTION_MENU`, move names, type, etc.
 */
const gba5To8 = (v: number): number => Math.min(255, Math.round((v * 255) / 31));

export const BATTLE_PAL5_TEXT = {
  fg: `rgb(${gba5To8(9)}, ${gba5To8(9)}, ${gba5To8(9)})`,
  shadow: `rgb(${gba5To8(26)}, ${gba5To8(26)}, ${gba5To8(25)})`
} as const;

/**
 * `gPPTextPalette` (`graphics/interface/text_pp.pal`) pairs written to palette 5 indices 12 (fg) and 11 (shadow)
 * by `SetPpNumbersPaletteInMoveSelection` (`battle_message.c`), keyed by `GetCurrentPpToMaxPpState`.
 */
const BATTLE_PP_TEXT_PAIRS: ReadonlyArray<{ fg: string; shadow: string }> = [
  { fg: '#eede00', shadow: '#fff68b' },
  { fg: '#ff9400', shadow: '#ffee73' },
  { fg: '#ee0000', shadow: '#f6de9c' },
  { fg: '#202020', shadow: '#dedede' }
];

/** Mirrors `GetCurrentPpToMaxPpState` in `battle_message.c`. */
export function getBattlePpToMaxPpState(currentPp: number, maxPp: number): number {
  if (maxPp === currentPp) {
    return 3;
  }
  if (maxPp <= 2) {
    if (currentPp > 1) {
      return 3;
    }
    return 2 - currentPp;
  }
  if (maxPp <= 7) {
    if (currentPp > 2) {
      return 3;
    }
    return 2 - currentPp;
  }
  if (currentPp === 0) {
    return 2;
  }
  if (currentPp <= Math.floor(maxPp / 4)) {
    return 1;
  }
  if (currentPp > Math.floor(maxPp / 2)) {
    return 3;
  }
  return 0;
}

export function getBattlePpLineColors(currentPp: number, maxPp: number): { fg: string; shadow: string } {
  const state = getBattlePpToMaxPpState(currentPp, maxPp);
  return BATTLE_PP_TEXT_PAIRS[state] ?? BATTLE_PP_TEXT_PAIRS[3]!;
}

/** Text overlays relative to **OAM top-left** of the 128px-wide composite (`getSinglesHealthboxDrawRect`). */
export const BATTLE_HEALTHBOX_OVERLAY = {
  opponent: {
    species: { dx: 8, dy: 3 },
    speciesWidth: 56,
    levelFromRight: 41,
    hpBar: { dx: 40, dy: 16, w: 48 },
    statusFromBottom: 10
  },
  player: {
    species: { dx: 16, dy: 3 },
    speciesWidth: 52,
    levelFromRight: 41,
    hpBar: { dx: 48, dy: 16, w: 48 },
    hpText: { dx: 60, dy: 21 },
    expBar: { dx: 8, dy: 50, w: 64 },
    statusFromBottom: 10
  }
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
