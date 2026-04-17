/**
 * FireRed battle BG0 textbox layer (`gBattleInterface_Textbox_*` in `src/graphics.c` / `battle_bg.c`).
 * Composites `graphics/battle_interface/textbox.png` with `textbox.bin` (32×64 tile map, 8×8 tiles).
 * Tile index 0 with palette 0 is treated as transparent so terrain drawn underneath stays visible.
 */

import textboxBinUrl from '../../../graphics/battle_interface/textbox.bin?url';

const TILE = 8;
const MAP_TILES_W = 32;
const MAP_VISIBLE_TILES_H = 20;
const TILESET_TILES_PER_ROW = 16;

export const BATTLE_TEXTBOX_PIXEL_W = 240;
export const BATTLE_TEXTBOX_PIXEL_H = MAP_VISIBLE_TILES_H * TILE;

const readMapEntry = (
  tilemap: Uint8Array,
  tileX: number,
  tileY: number
): { id: number; hflip: boolean; vflip: boolean; pal: number } => {
  const offset = (tileY * MAP_TILES_W + tileX) * 2;
  const lo = tilemap[offset] ?? 0;
  const hi = tilemap[offset + 1] ?? 0;
  const word = lo | (hi << 8);
  return {
    id: word & 0x03ff,
    hflip: (word & 0x0400) !== 0,
    vflip: (word & 0x0800) !== 0,
    pal: (word >> 12) & 0x0f
  };
};

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

  const tilesW = Math.floor(BATTLE_TEXTBOX_PIXEL_W / TILE);
  for (let ty = 0; ty < MAP_VISIBLE_TILES_H; ty += 1) {
    for (let tx = 0; tx < tilesW; tx += 1) {
      const { id, hflip, vflip, pal } = readMapEntry(tilemap, tx, ty);
      if (id === 0 && pal === 0) {
        continue;
      }
      blitMapTile(ctx, tx * TILE, ty * TILE, tileset, id, hflip, vflip);
    }
  }

  return canvas;
};
