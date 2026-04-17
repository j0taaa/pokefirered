/**
 * Singles healthbox art mirrors `gHealthboxSingles*Gfx` + `LoadSpriteSheet` /
 * `CreateBattlerHealthboxSprites` (`battle_interface.c`): linear 4bpp tile
 * bytes (same layout as `tools/gbagfx` `ConvertToTiles4Bpp`) are decoded with
 * no 2×2 transpose — matching OBJ VRAM + `DISPCNT_OBJ_1D_MAP`.
 *
 * Palette: `graphics/battle_interface/healthbox.pal` (JASC); OBJ treats palette
 * index 0 as transparent (`parseJascPalette` forces alpha 0 on index 0).
 *
 * Tile bytes are embedded as base64 in `healthboxSingles4bppB64.ts` (generated
 * from the repo PNGs via `scripts/gen_healthbox_singles_tile_b64.py`).
 *
 * OAM top-left: `InitBattlerHealthboxCoords` + `CalcCenterToCornerVec` — see
 * `battleScreenLayout.ts`.
 */

import type { BattleHealthboxOamAnchor } from './battleScreenLayout';
import { decodeGba4bppTilesToImageData, parseJascPalette } from './gbaTileDecode';
import healthboxPalRaw from '../../../graphics/battle_interface/healthbox.pal?raw';

const healthboxPalette = parseJascPalette(healthboxPalRaw);

/**
 * Decode ROM-linear 4bpp tiles to a canvas the same size as the singles PNG
 * sheet (128×32 foe, 128×64 player).
 */
export const buildPreparedSinglesHealthboxSheetFromTileBytes = (
  tileBytes: Uint8Array,
  widthPx: number,
  heightPx: number
): HTMLCanvasElement => {
  const imgData = decodeGba4bppTilesToImageData(tileBytes, widthPx, heightPx, healthboxPalette);
  const out = document.createElement('canvas');
  out.width = widthPx;
  out.height = heightPx;
  const ctx = out.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable for healthbox prep');
  }
  ctx.imageSmoothingEnabled = false;
  ctx.putImageData(imgData, 0, 0);
  return out;
};

export const blitSinglesOpponentHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  anchor: BattleHealthboxOamAnchor,
  destW: number,
  destH: number
): void => {
  const { oamX, oamY } = anchor;
  const halfDestW = destW / 2;
  ctx.drawImage(img, 0, 0, 64, 32, oamX, oamY, halfDestW, destH);
  ctx.drawImage(img, 64, 0, 64, 32, oamX + halfDestW, oamY, halfDestW, destH);
};

export const blitSinglesPlayerHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  anchor: BattleHealthboxOamAnchor,
  destW: number,
  destH: number
): void => {
  const { oamX, oamY } = anchor;
  const halfDestW = destW / 2;
  ctx.drawImage(img, 0, 0, 64, 64, oamX, oamY, halfDestW, destH);
  ctx.drawImage(img, 64, 0, 64, 64, oamX + halfDestW, oamY, halfDestW, destH);
};
