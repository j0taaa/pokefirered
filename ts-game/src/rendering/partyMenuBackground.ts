/**
 * FireRed party menu BG (`graphics/party_menu/bg.png` + `bg.bin`).
 * The game builds `bg.4bpp` from the PNG (`-num_tiles 62 -Wnum_tiles`) and maps it with `gPartyMenuBg_Tilemap`.
 * We composite the same way instead of tiling the sheet as a full-screen texture.
 */

import partyBgTilemapUrl from '../../../graphics/party_menu/bg.bin?url';

const TILE = 8;
const MAP_TILES_W = 32;
const MAP_VISIBLE_TILES_H = 20;
const MAP_BYTES_PER_ROW = MAP_TILES_W * 2;

export const PARTY_MENU_BG_PIXEL_W = MAP_TILES_W * TILE;
export const PARTY_MENU_BG_PIXEL_H = MAP_VISIBLE_TILES_H * TILE;
export const PARTY_MENU_BG_DRAW_W = 240;

const BG_TILESET_TILES_PER_ROW = 8;

const readMapEntry = (tilemap: Uint8Array, tileX: number, tileY: number): { id: number; hflip: boolean; vflip: boolean; pal: number } => {
  const offset = tileY * MAP_BYTES_PER_ROW + tileX * 2;
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
  const sx = (tileId % BG_TILESET_TILES_PER_ROW) * TILE;
  const sy = Math.floor(tileId / BG_TILESET_TILES_PER_ROW) * TILE;
  dest.save();
  dest.translate(destX + (hflip ? TILE : 0), destY + (vflip ? TILE : 0));
  dest.scale(hflip ? -1 : 1, vflip ? -1 : 1);
  dest.drawImage(tileset, sx, sy, TILE, TILE, 0, 0, TILE, TILE);
  dest.restore();
};

export const loadPartyMenuTilemapBytes = async (): Promise<Uint8Array> => {
  const response = await fetch(partyBgTilemapUrl);
  if (!response.ok) {
    throw new Error(`party menu tilemap fetch failed: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
};

export const buildPartyMenuBackgroundCanvas = (
  tileset: CanvasImageSource,
  tilemap: Uint8Array
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = PARTY_MENU_BG_PIXEL_W;
  canvas.height = PARTY_MENU_BG_PIXEL_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable');
  }

  for (let ty = 0; ty < MAP_VISIBLE_TILES_H; ty += 1) {
    for (let tx = 0; tx < MAP_TILES_W; tx += 1) {
      const { id, hflip, vflip } = readMapEntry(tilemap, tx, ty);
      blitMapTile(ctx, tx * TILE, ty * TILE, tileset, id, hflip, vflip);
    }
  }

  return canvas;
};
