/**
 * FireRed party menu layout (`src/data/party_menu.h`, `PARTY_LAYOUT_SINGLE`).
 * Coordinates are GBA screen pixels (240×160), matching window tilemap × 8.
 */

export const PARTY_GBA_WIDTH = 240;
export const PARTY_GBA_HEIGHT = 160;

/** `sSinglePartyMenuWindowTemplate` — party mon windows + bottom message window. */
export const PARTY_SINGLE_WINDOWS = [
  { slot: 0 as const, tileLeft: 1, tileTop: 3, tileW: 10, tileH: 7, column: 'left' as const },
  { slot: 1 as const, tileLeft: 12, tileTop: 1, tileW: 18, tileH: 3, column: 'right' as const },
  { slot: 2 as const, tileLeft: 12, tileTop: 4, tileW: 18, tileH: 3, column: 'right' as const },
  { slot: 3 as const, tileLeft: 12, tileTop: 7, tileW: 18, tileH: 3, column: 'right' as const },
  { slot: 4 as const, tileLeft: 12, tileTop: 10, tileW: 18, tileH: 3, column: 'right' as const },
  { slot: 5 as const, tileLeft: 12, tileTop: 13, tileW: 18, tileH: 3, column: 'right' as const },
  { slot: 'message' as const, tileLeft: 1, tileTop: 15, tileW: 28, tileH: 4, column: 'message' as const }
] as const;

/** `sPartyMenuSpriteCoords[PARTY_LAYOUT_SINGLE]` — per slot: mon, item, status, pokeball (x,y) pairs. */
export const PARTY_SINGLE_SPRITES: ReadonlyArray<{
  mon: { x: number; y: number };
  item: { x: number; y: number };
  status: { x: number; y: number };
  pokeball: { x: number; y: number };
}> = [
  { mon: { x: 16, y: 40 }, item: { x: 20, y: 50 }, status: { x: 56, y: 52 }, pokeball: { x: 16, y: 34 } },
  { mon: { x: 104, y: 18 }, item: { x: 108, y: 28 }, status: { x: 144, y: 27 }, pokeball: { x: 102, y: 25 } },
  { mon: { x: 104, y: 42 }, item: { x: 108, y: 52 }, status: { x: 144, y: 51 }, pokeball: { x: 102, y: 49 } },
  { mon: { x: 104, y: 66 }, item: { x: 108, y: 76 }, status: { x: 144, y: 75 }, pokeball: { x: 102, y: 73 } },
  { mon: { x: 104, y: 90 }, item: { x: 108, y: 100 }, status: { x: 144, y: 99 }, pokeball: { x: 102, y: 97 } },
  { mon: { x: 104, y: 114 }, item: { x: 108, y: 124 }, status: { x: 144, y: 123 }, pokeball: { x: 102, y: 121 } }
];

/** `sPartyBoxInfoRects` text offsets (pixels within each party window). */
export const PARTY_TEXT_LEFT = {
  nickname: { x: 24, y: 11, w: 40, h: 13 },
  level: { x: 32, y: 20, w: 32, h: 8 },
  gender: { x: 64, y: 20, w: 8, h: 8 },
  hp: { x: 38, y: 36, w: 24, h: 8 },
  maxHp: { x: 53, y: 36, w: 24, h: 8 },
  hpBar: { x: 24, y: 35, w: 48, h: 3 }
} as const;

export const PARTY_TEXT_RIGHT = {
  nickname: { x: 22, y: 3, w: 40, h: 13 },
  level: { x: 32, y: 12, w: 32, h: 8 },
  gender: { x: 64, y: 12, w: 8, h: 8 },
  hp: { x: 102, y: 12, w: 24, h: 8 },
  maxHp: { x: 117, y: 12, w: 24, h: 8 },
  hpBar: { x: 88, y: 10, w: 48, h: 3 }
} as const;

/** `DisplaySelectionWindow` SELECTWINDOW_ACTIONS — bg 2, tiles (19, 19 - 2*numActions), 10×(2*numActions). */
export const partyActionsWindowTiles = (numActions: number): { tileLeft: number; tileTop: number; tileW: number; tileH: number } => ({
  tileLeft: 19,
  tileTop: 19 - numActions * 2,
  tileW: 10,
  tileH: numActions * 2
});

/** `sCancelButtonWindowTemplate` — CANCEL label window (tile coords). */
export const PARTY_CANCEL_BUTTON_WINDOW = { tileLeft: 24, tileTop: 17, tileW: 6, tileH: 2 } as const;

/**
 * `DrawCancelConfirmButtons` blits `cancel_button.bin` to BG1 at (23,18), 7×2 tiles — one tile left of
 * the cancel window and one row lower. Center the label in this rect when drawing over the pre-built BG.
 */
export const PARTY_CANCEL_BUTTON_BG_BLIT = { tileLeft: 23, tileTop: 18, tileW: 7, tileH: 2 } as const;

export const tilesToPixels = (
  tileLeft: number,
  tileTop: number,
  tileW: number,
  tileH: number
): { x: number; y: number; w: number; h: number } => ({
  x: tileLeft * 8,
  y: tileTop * 8,
  w: tileW * 8,
  h: tileH * 8
});

export const getPartyMonWindowRect = (slotIndex: number): { x: number; y: number; w: number; h: number; column: 'left' | 'right' } => {
  const w = PARTY_SINGLE_WINDOWS[slotIndex];
  const r = tilesToPixels(w.tileLeft, w.tileTop, w.tileW, w.tileH);
  return { ...r, column: w.column === 'left' ? 'left' : 'right' };
};

export const getPartyMessageWindowRect = (): { x: number; y: number; w: number; h: number } => {
  const w = PARTY_SINGLE_WINDOWS[6];
  return tilesToPixels(w.tileLeft, w.tileTop, w.tileW, w.tileH);
};
