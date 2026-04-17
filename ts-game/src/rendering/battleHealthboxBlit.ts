/**
 * FireRed singles healthbox PNGs are **not** a left-to-right strip: the build
 * packs four character blocks in a 2×2 order (see `CreateBattlerHealthboxSprites`
 * + `SpriteCB_HealthBoxOther` in `battle_interface.c`). A naive `drawImage` of
 * the full sheet shows corners / “Lv” / tail scrambled. We reassemble the same
 * quadrants into the correct on-screen layout.
 *
 * Opponent sheet: 128×32 → four 64×16 regions, transpose the 2×2 grid.
 * Player sheet: 128×64 → four 64×32 regions, transpose the 2×2 grid.
 */

const OPP_W = 128;
const OPP_H = 32;
const PL_W = 128;
const PL_H = 64;

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

/**
 * Transpose 2×2 grid of equal-sized rects from image → destination rectangle.
 * dest TL ← src TL, dest TR ← src BL, dest BL ← src TR, dest BR ← src BR.
 */
export const blitSinglesOpponentHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  destX: number,
  destY: number,
  destW: number,
  destH: number
): void => {
  const qw = OPP_W / 2;
  const qh = OPP_H / 2;
  const dw = destW / 2;
  const dh = destH / 2;

  blitQuarter(ctx, img, 0, 0, qw, qh, destX, destY, dw, dh);
  blitQuarter(ctx, img, 0, qh, qw, qh, destX + dw, destY, dw, dh);
  blitQuarter(ctx, img, qw, 0, qw, qh, destX, destY + dh, dw, dh);
  blitQuarter(ctx, img, qw, qh, qw, qh, destX + dw, destY + dh, dw, dh);
};

export const blitSinglesPlayerHealthbox = (
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  destX: number,
  destY: number,
  destW: number,
  destH: number
): void => {
  const qw = PL_W / 2;
  const qh = PL_H / 2;
  const dw = destW / 2;
  const dh = destH / 2;

  blitQuarter(ctx, img, 0, 0, qw, qh, destX, destY, dw, dh);
  blitQuarter(ctx, img, 0, qh, qw, qh, destX + dw, destY, dw, dh);
  blitQuarter(ctx, img, qw, 0, qw, qh, destX, destY + dh, dw, dh);
  blitQuarter(ctx, img, qw, qh, qw, qh, destX + dw, destY + dh, dw, dh);
};
