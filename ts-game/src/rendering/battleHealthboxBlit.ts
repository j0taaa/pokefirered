/**
 * Singles healthbox art mirrors `gHealthboxSingles*Gfx` + `CreateBattlerHealthboxSprites`
 * (`battle_interface.c`): two OAM entries per box, each **64px wide** (64×32 foe,
 * 64×64 player after `oam.shape` change), `tileNum` gap `32` / `64` tiles.
 *
 * With `DISPCNT_OBJ_1D_MAP` (`battle_bg.c`), character tiles are linear in VRAM, but
 * each **64px-wide OBJ** still packs its 8×8 tiles in the hardware **2×2
 * macro-block** order used by the GBA OBJ renderer (same reason two 64-wide
 * halves are separate sprites). Raw `healthbox_singles_*.png` dumps match the
 * sheet file order; we **transpose 2×2 within each 64px half** so pixels match
 * what the PPU shows, then treat palette index 0 as transparent (OBJ treats
 * index 0 as clear; PNG uses `#000000` without `tRNS`).
 *
 * OAM top-left: `InitBattlerHealthboxCoords` + `CalcCenterToCornerVec` (`sprite.c`)
 * — see `battleScreenLayout.ts`.
 */

import type { BattleHealthboxOamAnchor } from './battleScreenLayout';

const blitQuarter = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): void => {
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
};

/** Transpose 2×2 grid inside [sx,sy,sx+rw,sy+rh] of `img` onto [dx,dy,dx+destW,dy+destH]. */
const blitTranspose2x2InRect = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  sx: number,
  sy: number,
  rw: number,
  rh: number,
  dx: number,
  dy: number,
  destW: number,
  destH: number
): void => {
  const qw = rw / 2;
  const qh = rh / 2;
  const dw = destW / 2;
  const dh = destH / 2;

  blitQuarter(ctx, img, sx, sy, qw, qh, dx, dy, dw, dh);
  blitQuarter(ctx, img, sx, sy + qh, qw, qh, dx + dw, dy, dw, dh);
  blitQuarter(ctx, img, sx + qw, sy, qw, qh, dx, dy + dh, dw, dh);
  blitQuarter(ctx, img, sx + qw, sy + qh, qw, qh, dx + dw, dy + dh, dw, dh);
};

const applyObjPaletteZeroTransparency = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void => {
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i] === 0 && px[i + 1] === 0 && px[i + 2] === 0) {
      px[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
};

/**
 * Build a 128×32 or 128×64 canvas: OBJ-style 2×2 transpose per 64px half, then
 * clear alpha for palette slot 0 (`#000000`).
 */
export const buildPreparedSinglesHealthboxSheet = (
  img: HTMLImageElement,
  kind: 'opponent' | 'player'
): HTMLCanvasElement => {
  const w = img.naturalWidth;
  const h = kind === 'opponent' ? 32 : 64;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (!ctx) {
    throw new Error('2d context unavailable for healthbox prep');
  }
  ctx.imageSmoothingEnabled = false;

  if (kind === 'opponent') {
    blitTranspose2x2InRect(ctx, img, 0, 0, 64, 32, 0, 0, 64, 32);
    blitTranspose2x2InRect(ctx, img, 64, 0, 64, 32, 64, 0, 64, 32);
  } else {
    blitTranspose2x2InRect(ctx, img, 0, 0, 64, 64, 0, 0, 64, 64);
    blitTranspose2x2InRect(ctx, img, 64, 0, 64, 64, 64, 0, 64, 64);
  }

  applyObjPaletteZeroTransparency(ctx, w, h);
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
  const halfDestH = destH;

  blitTranspose2x2InRect(ctx, img, 0, 0, 64, 32, oamX, oamY, halfDestW, halfDestH);
  blitTranspose2x2InRect(
    ctx,
    img,
    64,
    0,
    64,
    32,
    oamX + halfDestW,
    oamY,
    halfDestW,
    halfDestH
  );
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
  const halfDestH = destH;

  blitTranspose2x2InRect(ctx, img, 0, 0, 64, 64, oamX, oamY, halfDestW, halfDestH);
  blitTranspose2x2InRect(
    ctx,
    img,
    64,
    0,
    64,
    64,
    oamX + halfDestW,
    oamY,
    halfDestW,
    halfDestH
  );
};
