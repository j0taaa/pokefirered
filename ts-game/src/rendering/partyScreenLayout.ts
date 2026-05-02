/**
 * FireRed party menu layout (`src/data/party_menu.h`, `PARTY_LAYOUT_SINGLE`).
 * Coordinates are GBA screen pixels (240×160), matching window tilemap × 8.
 */

import {
  getPartyMenuBoxInfoRects,
  getPartyMenuCancelButtonWindowTemplate,
  getPartyMenuSingleWindowTemplates,
  getPartyMenuSpriteCoords
} from '../game/decompPartyMenuData';

export const PARTY_GBA_WIDTH = 240;
export const PARTY_GBA_HEIGHT = 160;

const singleWindowTemplates = getPartyMenuSingleWindowTemplates();
const singleSpriteCoords = getPartyMenuSpriteCoords().PARTY_LAYOUT_SINGLE;
const boxInfoRects = getPartyMenuBoxInfoRects();
const cancelButtonWindowTemplate = getPartyMenuCancelButtonWindowTemplate();

/** `sSinglePartyMenuWindowTemplate` — party mon windows + bottom message window. */
export const PARTY_SINGLE_WINDOWS = singleWindowTemplates
  .filter((template): template is Exclude<typeof template, 'DUMMY_WIN_TEMPLATE'> => template !== 'DUMMY_WIN_TEMPLATE')
  .map((template, index) => ({
    slot: index < 6 ? index : 'message',
    tileLeft: template.tilemapLeft,
    tileTop: template.tilemapTop,
    tileW: template.width,
    tileH: template.height,
    column: index === 0 ? 'left' : index < 6 ? 'right' : 'message'
  })) as ReadonlyArray<{
    slot: number | 'message';
    tileLeft: number;
    tileTop: number;
    tileW: number;
    tileH: number;
    column: 'left' | 'right' | 'message';
  }>;

/** `sPartyMenuSpriteCoords[PARTY_LAYOUT_SINGLE]` — per slot: mon, item, status, pokeball (x,y) pairs. */
export const PARTY_SINGLE_SPRITES: ReadonlyArray<{
  mon: { x: number; y: number };
  item: { x: number; y: number };
  status: { x: number; y: number };
  pokeball: { x: number; y: number };
}> = singleSpriteCoords;

/** `sPartyBoxInfoRects` text offsets (pixels within each party window). */
export const PARTY_TEXT_LEFT = boxInfoRects.PARTY_BOX_LEFT_COLUMN;

export const PARTY_TEXT_RIGHT = boxInfoRects.PARTY_BOX_RIGHT_COLUMN;

/** `DisplaySelectionWindow` SELECTWINDOW_ACTIONS — bg 2, tiles (19, 19 - 2*numActions), 10×(2*numActions). */
export const partyActionsWindowTiles = (numActions: number): { tileLeft: number; tileTop: number; tileW: number; tileH: number } => ({
  tileLeft: 19,
  tileTop: 19 - numActions * 2,
  tileW: 10,
  tileH: numActions * 2
});

/** `sCancelButtonWindowTemplate` — CANCEL label window (tile coords). */
export const PARTY_CANCEL_BUTTON_WINDOW = {
  tileLeft: cancelButtonWindowTemplate.tilemapLeft,
  tileTop: cancelButtonWindowTemplate.tilemapTop,
  tileW: cancelButtonWindowTemplate.width,
  tileH: cancelButtonWindowTemplate.height
} as const;

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
