export * from '../rendering/decompBlit';
import {
  blitBitmapRect4Bit,
  blitBitmapRect4BitTo8Bit,
  blitBitmapRect4BitWithoutColorKey,
  fillBitmapRect4Bit,
  fillBitmapRect8Bit,
  type DecompBitmap
} from '../rendering/decompBlit';

export function BlitBitmapRect4BitWithoutColorKey(
  src: DecompBitmap,
  dst: DecompBitmap,
  srcX: number,
  srcY: number,
  dstX: number,
  dstY: number,
  width: number,
  height: number
): void {
  blitBitmapRect4BitWithoutColorKey(src, dst, srcX, srcY, dstX, dstY, width, height);
}

export function BlitBitmapRect4Bit(
  src: DecompBitmap,
  dst: DecompBitmap,
  srcX: number,
  srcY: number,
  dstX: number,
  dstY: number,
  width: number,
  height: number,
  colorKey: number
): void {
  blitBitmapRect4Bit(src, dst, srcX, srcY, dstX, dstY, width, height, colorKey);
}

export function FillBitmapRect4Bit(
  surface: DecompBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
  fillValue: number
): void {
  fillBitmapRect4Bit(surface, x, y, width, height, fillValue);
}

export function BlitBitmapRect4BitTo8Bit(
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
): void {
  blitBitmapRect4BitTo8Bit(src, dst, srcX, srcY, dstX, dstY, width, height, colorKey, paletteOffset);
}

export function FillBitmapRect8Bit(
  surface: DecompBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
  fillValue: number
): void {
  fillBitmapRect8Bit(surface, x, y, width, height, fillValue);
}
