/**
 * FireRed battle BG0 textbox layer (`gBattleInterface_Textbox_*` in `src/graphics.c` / `battle_bg.c`).
 * Composites `graphics/battle_interface/textbox.png` with `textbox.bin` (32×64 tile map, 8×8 tiles).
 * Tile index 0 with palette 0 is treated as transparent so terrain drawn underneath stays visible.
 */

import textboxBinUrl from '../../../graphics/battle_interface/textbox.bin?url';
import {
  BG_SCREEN_TILE_WIDTH,
  BG_TILE_SIZE
} from './decompBgRegs';
import { copyWrappedBgTilemapRegion, decodeBgMapEntry } from './decompCableCarUtil';

const TILE = BG_TILE_SIZE;
const MAP_TILES_W = BG_SCREEN_TILE_WIDTH;
const MAP_VISIBLE_TILES_H = 20;
const TILESET_TILES_PER_ROW = 16;

export const BATTLE_TEXTBOX_PIXEL_W = 240;
export const BATTLE_TEXTBOX_PIXEL_H = MAP_VISIBLE_TILES_H * TILE;

const blitMapTile = (
  dest: CanvasRenderingContext2D,
  destX: number,
  destY: number,
  tileset: CanvasImageSource,
  tileId: number,
  hflip: boolean,
  vflip: boolean
): void => {
  const sx = (tileId % TILESET_TILES_PER_ROW) * TILE;
  const sy = Math.floor(tileId / TILESET_TILES_PER_ROW) * TILE;
  dest.save();
  dest.translate(destX + (hflip ? TILE : 0), destY + (vflip ? TILE : 0));
  dest.scale(hflip ? -1 : 1, vflip ? -1 : 1);
  dest.drawImage(tileset, sx, sy, TILE, TILE, 0, 0, TILE, TILE);
  dest.restore();
};

export const loadBattleTextboxTilemapBytes = async (): Promise<Uint8Array> => {
  const response = await fetch(textboxBinUrl);
  if (!response.ok) {
    throw new Error(`battle textbox tilemap fetch failed: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

export const buildBattleTextboxBackgroundCanvas = (
  tileset: CanvasImageSource,
  tilemap: Uint8Array
): HTMLCanvasElement => {
  const expected = MAP_TILES_W * MAP_VISIBLE_TILES_H * 2;
  if (tilemap.length < expected) {
    throw new Error(`battle textbox tilemap: expected at least ${expected} bytes, got ${tilemap.length}`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = BATTLE_TEXTBOX_PIXEL_W;
  canvas.height = BATTLE_TEXTBOX_PIXEL_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable');
  }
  ctx.imageSmoothingEnabled = false;

  const visibleRegion = copyWrappedBgTilemapRegion(tilemap, 0, 0, MAP_TILES_W, MAP_VISIBLE_TILES_H);
  const tilesW = Math.floor(BATTLE_TEXTBOX_PIXEL_W / TILE);
  for (let ty = 0; ty < MAP_VISIBLE_TILES_H; ty += 1) {
    for (let tx = 0; tx < tilesW; tx += 1) {
      const { id, hflip, vflip, pal } = decodeBgMapEntry(visibleRegion[ty * MAP_TILES_W + tx] ?? 0);
      if (id === 0 && pal === 0) {
        continue;
      }
      blitMapTile(ctx, tx * TILE, ty * TILE, tileset, id, hflip, vflip);
    }
  }

  return canvas;
};
