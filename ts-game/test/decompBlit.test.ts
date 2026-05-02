import { describe, expect, test } from 'vitest';
import {
  blitBitmapRect4Bit,
  blitBitmapRect4BitTo8Bit,
  blitBitmapRect4BitWithoutColorKey,
  createDecompBitmap,
  fillBitmapRect4Bit,
  fillBitmapRect8Bit,
  readDecompBitmap4bppPixel,
  readDecompBitmap8bppPixel
} from '../src/rendering/decompBlit';

describe('decomp blit parity', () => {
  test('fills and blits packed 4bpp rectangles without a color key', () => {
    const src = createDecompBitmap(16, 16, 4);
    const dst = createDecompBitmap(16, 16, 4);

    fillBitmapRect4Bit(src, 2, 3, 4, 3, 7);
    fillBitmapRect4Bit(dst, 0, 0, 16, 16, 1);
    blitBitmapRect4BitWithoutColorKey(src, dst, 2, 3, 5, 6, 4, 3);

    expect(readDecompBitmap4bppPixel(dst, 5, 6)).toBe(7);
    expect(readDecompBitmap4bppPixel(dst, 8, 8)).toBe(7);
    expect(readDecompBitmap4bppPixel(dst, 9, 8)).toBe(1);
    expect(readDecompBitmap4bppPixel(dst, 4, 6)).toBe(1);
  });

  test('honors 4bpp color key and destination clipping exactly', () => {
    const src = createDecompBitmap(16, 16, 4);
    const dst = createDecompBitmap(8, 8, 4);

    fillBitmapRect4Bit(src, 0, 0, 16, 16, 2);
    fillBitmapRect4Bit(src, 1, 0, 1, 1, 3);
    fillBitmapRect4Bit(dst, 0, 0, 8, 8, 9);
    blitBitmapRect4Bit(src, dst, 0, 0, 7, 7, 4, 4, 2);

    expect(readDecompBitmap4bppPixel(dst, 7, 7)).toBe(9);

    blitBitmapRect4Bit(src, dst, 1, 0, 7, 7, 4, 4, 2);
    expect(readDecompBitmap4bppPixel(dst, 7, 7)).toBe(3);
  });

  test('converts 4bpp to 8bpp with palette offset and color key', () => {
    const src = createDecompBitmap(16, 16, 4);
    const dst = createDecompBitmap(16, 16, 8);

    fillBitmapRect4Bit(src, 0, 0, 2, 2, 5);
    fillBitmapRect4Bit(src, 1, 1, 1, 1, 0);
    fillBitmapRect8Bit(dst, 0, 0, 16, 16, 77);
    blitBitmapRect4BitTo8Bit(src, dst, 0, 0, 3, 4, 2, 2, 0, 2);

    expect(readDecompBitmap8bppPixel(dst, 3, 4)).toBe(0x20 + 5);
    expect(readDecompBitmap8bppPixel(dst, 4, 4)).toBe(0x20 + 5);
    expect(readDecompBitmap8bppPixel(dst, 3, 5)).toBe(0x20 + 5);
    expect(readDecompBitmap8bppPixel(dst, 4, 5)).toBe(77);
  });
});
