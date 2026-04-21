import { describe, expect, test } from 'vitest';
import {
  blendGbaPaletteColor,
  blendHexColor,
  decodeGbaRgb5,
  encodeGbaRgb5,
  tintBattleTerrainPalette
} from '../src/rendering/decompBlendPalette';

describe('decomp blend palette parity', () => {
  test('blends gba palette colors with the same channel math as blend_palette.c', () => {
    const red = encodeGbaRgb5({ r: 31, g: 0, b: 0 });
    const blue = encodeGbaRgb5({ r: 0, g: 0, b: 31 });

    expect(blendGbaPaletteColor(red, blue, 16)).toBe(blue);
    expect(decodeGbaRgb5(blendGbaPaletteColor(red, blue, 8))).toEqual({ r: 15, g: 0, b: 15 });
  });

  test('blends css hex colors through gba 5-bit palette space', () => {
    expect(blendHexColor('#ff0000', '#0000ff', 8)).toBe('#7b007b');
  });

  test('tints battle terrain palettes when weather is active', () => {
    const base = {
      sky: '#8cc6ff',
      horizon: '#dff7ff',
      floor: '#73c056',
      accent: '#357f32'
    };

    expect(tintBattleTerrainPalette(base, 'none')).toEqual(base);
    expect(tintBattleTerrainPalette(base, 'rain')).toEqual({
      sky: '#7ba5e6',
      horizon: '#bdd6e6',
      floor: '#6ba56b',
      accent: '#31734a'
    });
  });
});
