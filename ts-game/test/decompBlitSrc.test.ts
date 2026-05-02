import { describe, expect, test } from 'vitest';
import * as blit from '../src/game/decompBlit';

describe('src/blit.c parity exports', () => {
  test('exact C names point at the implemented bitmap blitters', () => {
    expect(blit.BlitBitmapRect4BitWithoutColorKey).toBe(blit.blitBitmapRect4BitWithoutColorKey);
    expect(blit.BlitBitmapRect4Bit).toBe(blit.blitBitmapRect4Bit);
    expect(blit.FillBitmapRect4Bit).toBe(blit.fillBitmapRect4Bit);
    expect(blit.BlitBitmapRect4BitTo8Bit).toBe(blit.blitBitmapRect4BitTo8Bit);
    expect(blit.FillBitmapRect8Bit).toBe(blit.fillBitmapRect8Bit);
  });

  test('BlitBitmapRect4BitTo8Bit preserves palette offset and color key through C name', () => {
    const src = blit.createDecompBitmap(16, 16, 4);
    const dst = blit.createDecompBitmap(16, 16, 8);

    blit.FillBitmapRect4Bit(src, 0, 0, 2, 2, 5);
    blit.FillBitmapRect4Bit(src, 1, 1, 1, 1, 0);
    blit.FillBitmapRect8Bit(dst, 0, 0, 16, 16, 77);
    blit.BlitBitmapRect4BitTo8Bit(src, dst, 0, 0, 3, 4, 2, 2, 0, 2);

    expect(blit.readDecompBitmap8bppPixel(dst, 3, 4)).toBe(0x25);
    expect(blit.readDecompBitmap8bppPixel(dst, 4, 5)).toBe(77);
  });
});
