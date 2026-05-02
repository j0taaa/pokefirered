import { describe, expect, test } from 'vitest';
import {
  BlendPalette,
  BlendPalettesAt,
  createBlendPaletteRuntime,
  gbaB,
  gbaG,
  gbaR,
  gbaRgb
} from '../src/game/decompBlendPalette';

describe('src/blend_palette.c parity', () => {
  test('BlendPalette reads unfaded colors and writes faded colors with C channel math', () => {
    const runtime = createBlendPaletteRuntime();
    runtime.gPlttBufferUnfaded[4] = gbaRgb(31, 0, 0);
    runtime.gPlttBufferUnfaded[5] = gbaRgb(0, 31, 0);

    BlendPalette(runtime, 4, 2, 8, gbaRgb(0, 0, 31));

    expect([gbaR(runtime.gPlttBufferFaded[4]), gbaG(runtime.gPlttBufferFaded[4]), gbaB(runtime.gPlttBufferFaded[4])])
      .toEqual([15, 0, 15]);
    expect([gbaR(runtime.gPlttBufferFaded[5]), gbaG(runtime.gPlttBufferFaded[5]), gbaB(runtime.gPlttBufferFaded[5])])
      .toEqual([0, 15, 15]);
    expect(runtime.gPlttBufferUnfaded[4]).toBe(gbaRgb(31, 0, 0));
  });

  test('BlendPalettesAt fills directly when coefficient is 16', () => {
    const palette = [gbaRgb(1, 2, 3), gbaRgb(4, 5, 6), gbaRgb(7, 8, 9)];

    BlendPalettesAt(palette, gbaRgb(10, 11, 12), 16, palette.length);

    expect(palette).toEqual([gbaRgb(10, 11, 12), gbaRgb(10, 11, 12), gbaRgb(10, 11, 12)]);
  });

  test('BlendPalettesAt blends in place and leaves zero-sized buffers untouched', () => {
    const palette = [gbaRgb(31, 0, 0), gbaRgb(0, 31, 0)];

    BlendPalettesAt(palette, gbaRgb(0, 0, 31), 4, palette.length);

    expect([gbaR(palette[0]), gbaG(palette[0]), gbaB(palette[0])]).toEqual([23, 0, 7]);
    expect([gbaR(palette[1]), gbaG(palette[1]), gbaB(palette[1])]).toEqual([0, 23, 7]);

    BlendPalettesAt(palette, gbaRgb(1, 1, 1), 16, 0);
    expect([gbaR(palette[0]), gbaG(palette[0]), gbaB(palette[0])]).toEqual([23, 0, 7]);
  });
});
