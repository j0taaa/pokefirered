/**
 * FireRed party menu BG (`graphics/party_menu/bg.png` + `bg.bin`).
 * The game builds `bg.4bpp` from the PNG (`-num_tiles 62 -Wnum_tiles`) and maps it with `gPartyMenuBg_Tilemap`.
 * We composite the same way instead of tiling the sheet as a full-screen texture.
 */

import partyBgTilemapUrl from '../../../graphics/party_menu/bg.bin?url';
import {
  BG_SCREEN_TILE_WIDTH,
  BG_TILE_SIZE
} from './decompBgRegs';
import { copyWrappedBgTilemapRegion, decodeBgMapEntry } from './decompCableCarUtil';

const TILE = BG_TILE_SIZE;
const MAP_TILES_W = BG_SCREEN_TILE_WIDTH;
const MAP_VISIBLE_TILES_H = 20;

export const PARTY_MENU_BG_PIXEL_W = MAP_TILES_W * TILE;
export const PARTY_MENU_BG_PIXEL_H = MAP_VISIBLE_TILES_H * TILE;
export const PARTY_MENU_BG_DRAW_W = 240;

const BG_TILESET_TILES_PER_ROW = 8;

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
  ctx.imageSmoothingEnabled = false;

  const visibleRegion = copyWrappedBgTilemapRegion(tilemap, 0, 0, MAP_TILES_W, MAP_VISIBLE_TILES_H);
  for (let ty = 0; ty < MAP_VISIBLE_TILES_H; ty += 1) {
    for (let tx = 0; tx < MAP_TILES_W; tx += 1) {
      const { id, hflip, vflip } = decodeBgMapEntry(visibleRegion[ty * MAP_TILES_W + tx] ?? 0);
      blitMapTile(ctx, tx * TILE, ty * TILE, tileset, id, hflip, vflip);
    }
  }

  return canvas;
};
