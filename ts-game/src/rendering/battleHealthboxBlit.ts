/**
 * Singles healthbox `.png` assets are laid out like **OBJ VRAM**: each 64px-wide
 * OAM half (`CreateBattlerHealthboxSprites` in `battle_interface.c`) stores its
 * pixels in **2×2 macro-blocks** (GBA tile packing), not plain left-to-right
 * raster order. A full-sheet `drawImage` shows the four chunks scrambled.
 *
 * We transpose **within each 64px half** only (matching two sprites at +64px,
 * not swapping the halves themselves).
 *
 * Sprite **placement** uses `CalcCenterToCornerVec` from `sprite.c`: ROM
 * `InitBattlerHealthboxCoords` sets `sprite->x/y` (the logical anchor), and
 * the hardware OAM top-left is `x + centerToCornerVecX`, `y + centerToCornerVecY`.
 * Opponent uses the 64×32 vec (−32, −16). Player’s OAM becomes 64×64 later, but
 * `centerToCornerVec` is still from the initial 64×32 template (−32, −16).
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

export const blitSinglesOpponentHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  anchor: BattleHealthboxOamAnchor,
  destW: number,
  destH: number
): void => {
  const { oamX, oamY } = anchor;
  const halfSrcW = 64;
  const halfSrcH = 32;
  const halfDestW = destW / 2;
  const halfDestH = destH;

  blitTranspose2x2InRect(ctx, img, 0, 0, halfSrcW, halfSrcH, oamX, oamY, halfDestW, halfDestH);
  blitTranspose2x2InRect(
    ctx,
    img,
    halfSrcW,
    0,
    halfSrcW,
    halfSrcH,
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
  const halfSrcW = 64;
  const halfSrcH = 64;
  const halfDestW = destW / 2;
  const halfDestH = destH;

  blitTranspose2x2InRect(ctx, img, 0, 0, halfSrcW, halfSrcH, oamX, oamY, halfDestW, halfDestH);
  blitTranspose2x2InRect(
    ctx,
    img,
    halfSrcW,
    0,
    halfSrcW,
    halfSrcH,
    oamX + halfDestW,
    oamY,
    halfDestW,
    halfDestH
  );
};
