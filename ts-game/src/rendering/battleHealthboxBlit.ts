/**
 * Singles healthbox art (`healthbox_singles_*.png`) matches the decomp
 * `gHealthboxSingles*Gfx` sheets: **128×32** (opponent) or **128×64** (player),
 * i.e. the two OAM halves placed side by side (`CreateBattlerHealthboxSprites`
 * in `battle_interface.c`).
 *
 * The PNGs in-tree are exported for editing in normal raster order (same as
 * `%.4bpp: %.png` round-trips in the decomp toolchain). Do **not** apply GBA
 * 8×8 tile reordering here — that scrambles these sheets.
 *
 * Sprite **placement** still uses `CalcCenterToCornerVec` (`sprite.c`): ROM
 * `InitBattlerHealthboxCoords` sets `sprite->x/y`; OAM top-left is
 * `x + centerToCornerVecX`, `y + centerToCornerVecY` (see `battleScreenLayout`).
 *
 * **Transparency:** `graphics/battle_interface/healthbox.pal` index 0 is unused on
 * OBJ (treated as transparent in hardware). Indexed PNGs use RGB(0,0,0) for that
 * slot with no `tRNS` chunk, so browsers draw it opaque — we clear alpha for
 * exact `#000000` when preparing the blit source.
 */

import type { BattleHealthboxOamAnchor } from './battleScreenLayout';

/**
 * Clone a loaded healthbox sheet into a canvas with OBJ-style transparency for
 * palette index 0 (`#000000` in exported PNGs).
 */
export const buildHealthboxCanvasWithObjTransparency = (
  img: HTMLImageElement | HTMLCanvasElement
): HTMLCanvasElement => {
  const w =
    'naturalWidth' in img && img.naturalWidth > 0
      ? img.naturalWidth
      : (img as HTMLCanvasElement).width;
  const h =
    'naturalHeight' in img && img.naturalHeight > 0
      ? img.naturalHeight
      : (img as HTMLCanvasElement).height;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const c = out.getContext('2d');
  if (!c) {
    throw new Error('2d context unavailable for healthbox prep');
  }
  c.imageSmoothingEnabled = false;
  c.drawImage(img, 0, 0);
  const data = c.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i] === 0 && px[i + 1] === 0 && px[i + 2] === 0) {
      px[i + 3] = 0;
    }
  }
  c.putImageData(data, 0, 0);
  return out;
};

/** Blit the full 128px-wide healthbox sheet to the battle canvas at OAM top-left. */
export const blitSinglesHealthboxSheet = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  anchor: BattleHealthboxOamAnchor,
  destW: number,
  destH: number
): void => {
  const { oamX, oamY } = anchor;
  const nw =
    'naturalWidth' in img && typeof img.naturalWidth === 'number' ? img.naturalWidth : destW;
  const nh =
    'naturalHeight' in img && typeof img.naturalHeight === 'number' ? img.naturalHeight : destH;
  ctx.drawImage(img, 0, 0, nw, nh, oamX, oamY, destW, destH);
};

export const blitSinglesOpponentHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  anchor: BattleHealthboxOamAnchor,
  destW: number,
  destH: number
): void => {
  blitSinglesHealthboxSheet(ctx, img, anchor, destW, destH);
};

export const blitSinglesPlayerHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  anchor: BattleHealthboxOamAnchor,
  destW: number,
  destH: number
): void => {
  blitSinglesHealthboxSheet(ctx, img, anchor, destW, destH);
};
