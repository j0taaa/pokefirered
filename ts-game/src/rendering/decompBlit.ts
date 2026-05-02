export interface DecompBitmap {
  width: number;
  height: number;
  pixels: Uint8Array;
}

const bitmap4bppStride = (width: number): number => (width + (width & 7)) >> 3;
const bitmap8bppStride = (width: number): number => (width + (width & 7)) >> 3;

const pixel4bppOffset = (bitmap: DecompBitmap, x: number, y: number): number =>
  ((x >> 1) & 3)
  + ((x >> 3) << 5)
  + (((y >> 3) * bitmap4bppStride(bitmap.width)) << 5)
  + (((y << 29) >>> 27) >>> 0);

const pixel8bppOffset = (bitmap: DecompBitmap, x: number, y: number): number =>
  (x & 7)
  + ((x >> 3) << 6)
  + (((y >> 3) * bitmap8bppStride(bitmap.width)) << 6)
  + (((y << 29) >>> 26) >>> 0);

const get4bppPixel = (bitmap: DecompBitmap, x: number, y: number): number => {
  const byte = bitmap.pixels[pixel4bppOffset(bitmap, x, y)] ?? 0;
  return (byte >> ((x & 1) << 2)) & 0xf;
};

const set4bppPixel = (bitmap: DecompBitmap, x: number, y: number, value: number): void => {
  const offset = pixel4bppOffset(bitmap, x, y);
  const toShift = (x & 1) << 2;
  const toAnd = 0xf0 >> toShift;
  bitmap.pixels[offset] = ((value & 0xf) << toShift) | ((bitmap.pixels[offset] ?? 0) & toAnd);
};

export const createDecompBitmap = (width: number, height: number, bitsPerPixel: 4 | 8): DecompBitmap => {
  const stride = bitsPerPixel === 4 ? bitmap4bppStride(width) << 5 : bitmap8bppStride(width) << 6;
  return {
    width,
    height,
    pixels: new Uint8Array(stride * Math.ceil(height / 8))
  };
};

export const blitBitmapRect4BitWithoutColorKey = (
  src: DecompBitmap,
  dst: DecompBitmap,
  srcX: number,
  srcY: number,
  dstX: number,
  dstY: number,
  width: number,
  height: number
): void => {
  blitBitmapRect4Bit(src, dst, srcX, srcY, dstX, dstY, width, height, 0xff);
};

export const blitBitmapRect4Bit = (
  src: DecompBitmap,
  dst: DecompBitmap,
  srcX: number,
  srcY: number,
  dstX: number,
  dstY: number,
  width: number,
  height: number,
  colorKey: number
): void => {
  const xEnd = dst.width - dstX < width ? (dst.width - dstX) + srcX : srcX + width;
  const yEnd = dst.height - dstY < height ? (dst.height - dstY) + srcY : srcY + height;

  for (let loopSrcY = srcY, loopDstY = dstY; loopSrcY < yEnd; loopSrcY += 1, loopDstY += 1) {
    for (let loopSrcX = srcX, loopDstX = dstX; loopSrcX < xEnd; loopSrcX += 1, loopDstX += 1) {
      const value = get4bppPixel(src, loopSrcX, loopSrcY);
      if (colorKey === 0xff || value !== colorKey) {
        set4bppPixel(dst, loopDstX, loopDstY, value);
      }
    }
  }
};

export const fillBitmapRect4Bit = (
  surface: DecompBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
  fillValue: number
): void => {
  const xEnd = Math.min(x + width, surface.width);
  const yEnd = Math.min(y + height, surface.height);

  for (let loopY = y; loopY < yEnd; loopY += 1) {
    for (let loopX = x; loopX < xEnd; loopX += 1) {
      set4bppPixel(surface, loopX, loopY, fillValue);
    }
  }
};

export const blitBitmapRect4BitTo8Bit = (
  src: DecompBitmap,
  dst: DecompBitmap,
  srcX: number,
  srcY: number,
  dstX: number,
  dstY: number,
  width: number,
  height: number,
  colorKey: number,
  paletteOffset: number
): void => {
  const palOffsetBits = ((paletteOffset << 28) >>> 24) >>> 0;
  const xEnd = dst.width - dstX < width ? (dst.width - dstX) + srcX : srcX + width;
  const yEnd = dst.height - dstY < height ? (srcY + dst.height) - dstY : srcY + height;

  for (let loopSrcY = srcY, loopDstY = dstY; loopSrcY < yEnd; loopSrcY += 1, loopDstY += 1) {
    for (let loopSrcX = srcX, loopDstX = dstX; loopSrcX < xEnd; loopSrcX += 1, loopDstX += 1) {
      const value = get4bppPixel(src, loopSrcX, loopSrcY);
      if (colorKey === 0xff || value !== (colorKey & 0xf)) {
        dst.pixels[pixel8bppOffset(dst, loopDstX, loopDstY)] = palOffsetBits + value;
      }
    }
  }
};

export const fillBitmapRect8Bit = (
  surface: DecompBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
  fillValue: number
): void => {
  const xEnd = Math.min(x + width, surface.width);
  const yEnd = Math.min(y + height, surface.height);

  for (let loopY = y; loopY < yEnd; loopY += 1) {
    for (let loopX = x; loopX < xEnd; loopX += 1) {
      surface.pixels[pixel8bppOffset(surface, loopX, loopY)] = fillValue;
    }
  }
};

export const readDecompBitmap4bppPixel = get4bppPixel;

export const readDecompBitmap8bppPixel = (
  bitmap: DecompBitmap,
  x: number,
  y: number
): number => bitmap.pixels[pixel8bppOffset(bitmap, x, y)] ?? 0;

export const BlitBitmapRect4BitWithoutColorKey = blitBitmapRect4BitWithoutColorKey;
export const BlitBitmapRect4Bit = blitBitmapRect4Bit;
export const FillBitmapRect4Bit = fillBitmapRect4Bit;
export const BlitBitmapRect4BitTo8Bit = blitBitmapRect4BitTo8Bit;
export const FillBitmapRect8Bit = fillBitmapRect8Bit;
