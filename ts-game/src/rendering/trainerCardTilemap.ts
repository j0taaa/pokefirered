/**
 * Renders Kanto trainer card BG / face / back tilemaps from `graphics/trainer_card/*.bin`
 * using the shared 4BPP charset exported as `tiles.png` (`gKantoTrainerCard_Gfx` in `graphics.c`).
 *
 * Tilemap format matches GBA text-mode BG entries (`src/trainer_card.c` `DrawCardScreenBackground` /
 * `DrawCardFrontOrBack`): 30×20 `u16` little-endian per `.bin` (1200 bytes).
 */

import { TC_GBA_H, TC_GBA_W } from './trainerCardScreenLayout';

export const TRAINER_CARD_TILEMAP_W = 30;
export const TRAINER_CARD_TILEMAP_H = 20;
export const TRAINER_CARD_TILE_PIXEL = 8;

const TILE_INDEX_MASK = 0x03ff;
const TILE_HFLIP = 0x0400;
const TILE_VFLIP = 0x0800;

export const decodeTrainerCardTilemap = (buffer: ArrayBuffer): Uint16Array => {
  const u16 = new Uint16Array(buffer);
  const expected = TRAINER_CARD_TILEMAP_W * TRAINER_CARD_TILEMAP_H;
  if (u16.length !== expected) {
    throw new Error(`trainer card tilemap: expected ${expected} u16, got ${u16.length}`);
  }
  return u16;
};

/** Blit one 8×8 tile from the trainer card charset (e.g. star strip tile `143` in `trainer_card.c`). */
export const drawTrainerCardCharsetTile = (
  ctx: CanvasRenderingContext2D,
  tileset: HTMLImageElement,
  tileId: number,
  destX: number,
  destY: number
): void => {
  if (!(tileset.complete && tileset.naturalWidth > 0)) {
    return;
  }
  const tilesPerRow = Math.floor(tileset.naturalWidth / TRAINER_CARD_TILE_PIXEL);
  const sx = (tileId % tilesPerRow) * TRAINER_CARD_TILE_PIXEL;
  const sy = Math.floor(tileId / tilesPerRow) * TRAINER_CARD_TILE_PIXEL;
  ctx.drawImage(
    tileset,
    sx,
    sy,
    TRAINER_CARD_TILE_PIXEL,
    TRAINER_CARD_TILE_PIXEL,
    destX,
    destY,
    TRAINER_CARD_TILE_PIXEL,
    TRAINER_CARD_TILE_PIXEL
  );
};

export const drawTrainerCardTilemapLayer = (
  ctx: CanvasRenderingContext2D,
  tileset: HTMLImageElement,
  map: Uint16Array,
  destX: number,
  destY: number
): void => {
  if (!(tileset.complete && tileset.naturalWidth > 0)) {
    return;
  }

  const tilesPerRow = Math.floor(tileset.naturalWidth / TRAINER_CARD_TILE_PIXEL);

  for (let ty = 0; ty < TRAINER_CARD_TILEMAP_H; ty += 1) {
    for (let tx = 0; tx < TRAINER_CARD_TILEMAP_W; tx += 1) {
      const entry = map[ty * TRAINER_CARD_TILEMAP_W + tx];
      const tileId = entry & TILE_INDEX_MASK;
      const hFlip = (entry & TILE_HFLIP) !== 0;
      const vFlip = (entry & TILE_VFLIP) !== 0;

      const sx = (tileId % tilesPerRow) * TRAINER_CARD_TILE_PIXEL;
      const sy = Math.floor(tileId / tilesPerRow) * TRAINER_CARD_TILE_PIXEL;

      const dx = destX + tx * TRAINER_CARD_TILE_PIXEL;
      const dy = destY + ty * TRAINER_CARD_TILE_PIXEL;

      ctx.save();
      ctx.translate(dx + (hFlip ? TRAINER_CARD_TILE_PIXEL : 0), dy + (vFlip ? TRAINER_CARD_TILE_PIXEL : 0));
      ctx.scale(hFlip ? -1 : 1, vFlip ? -1 : 1);
      ctx.drawImage(
        tileset,
        sx,
        sy,
        TRAINER_CARD_TILE_PIXEL,
        TRAINER_CARD_TILE_PIXEL,
        0,
        0,
        TRAINER_CARD_TILE_PIXEL,
        TRAINER_CARD_TILE_PIXEL
      );
      ctx.restore();
    }
  }
};

/** Composite `bg` then `fg` (same as BG2 + BG0 in `trainer_card.c`). */
export const buildTrainerCardComposite = (
  tileset: HTMLImageElement,
  bg: Uint16Array,
  fg: Uint16Array
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = TC_GBA_W;
  canvas.height = TC_GBA_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  ctx.imageSmoothingEnabled = false;
  drawTrainerCardTilemapLayer(ctx, tileset, bg, 0, 0);
  drawTrainerCardTilemapLayer(ctx, tileset, fg, 0, 0);
  return canvas;
};
