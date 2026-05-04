import { describe, expect, test } from 'vitest';
import {
  blendGbaPaletteColor,
  decodeGbaRgb5,
  encodeGbaRgb5,
  blendHexColor,
  tintBattleTerrainPalette
} from '../src/rendering/decompBlendPalette';

describe('blend palette rendering parity', () => {
  test('encodeGbaRgb5 packs RGB5 channels into 15-bit color', () => {
    expect(encodeGbaRgb5({ r: 31, g: 0, b: 0 })).toBe(0x001f);
    expect(encodeGbaRgb5({ r: 0, g: 31, b: 0 })).toBe(0x03e0);
    expect(encodeGbaRgb5({ r: 0, g: 0, b: 31 })).toBe(0x7c00);
    expect(encodeGbaRgb5({ r: 31, g: 31, b: 31 })).toBe(0x7fff);
  });

  test('decodeGbaRgb5 unpacks 15-bit color into RGB5 channels', () => {
    expect(decodeGbaRgb5(0x001f)).toEqual({ r: 31, g: 0, b: 0 });
    expect(decodeGbaRgb5(0x03e0)).toEqual({ r: 0, g: 31, b: 0 });
    expect(decodeGbaRgb5(0x7c00)).toEqual({ r: 0, g: 0, b: 31 });
    expect(decodeGbaRgb5(0x7fff)).toEqual({ r: 31, g: 31, b: 31 });
  });

  test('blendGbaPaletteColor interpolates between base and blend colors', () => {
    const base = encodeGbaRgb5({ r: 31, g: 31, b: 31 });
    const blend = encodeGbaRgb5({ r: 0, g: 0, b: 0 });

    expect(blendGbaPaletteColor(base, blend, 0)).toBe(base);
    expect(blendGbaPaletteColor(base, blend, 16)).toBe(blend & 0x7fff);
    expect(blendGbaPaletteColor(base, blend, 8)).toBe(encodeGbaRgb5({ r: 15, g: 15, b: 15 }));
  });

  test('blendGbaPaletteColor clamps coefficient to 0-16', () => {
    const base = encodeGbaRgb5({ r: 31, g: 31, b: 31 });
    const blend = encodeGbaRgb5({ r: 0, g: 0, b: 0 });

    expect(blendGbaPaletteColor(base, blend, -1)).toBe(base);
    expect(blendGbaPaletteColor(base, blend, 17)).toBe(blend & 0x7fff);
  });

  test('blendHexColor blends CSS hex colors', () => {
    const result = blendHexColor('#ffffff', '#000000', 8);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);

    const white = blendHexColor('#ffffff', '#000000', 0);
    expect(white).toBe('#ffffff');

    const black = blendHexColor('#ffffff', '#000000', 16);
    expect(black).toBe('#000000');
  });

  test('tintBattleTerrainPalette returns base palette for none weather', () => {
    const base = { sky: '#8cc6ff', horizon: '#dff7ff', floor: '#73c056', accent: '#357f32' };
    const result = tintBattleTerrainPalette(base, 'none');
    expect(result).toEqual(base);
  });

  test('tintBattleTerrainPalette applies rain tint', () => {
    const base = { sky: '#8cc6ff', horizon: '#dff7ff', floor: '#73c056', accent: '#357f32' };
    const result = tintBattleTerrainPalette(base, 'rain');
    expect(result.sky).not.toBe(base.sky);
    expect(result.horizon).not.toBe(base.horizon);
    expect(result.floor).not.toBe(base.floor);
    expect(result.accent).not.toBe(base.accent);
  });

  test('tintBattleTerrainPalette applies sun, sandstorm, and hail tints', () => {
    const base = { sky: '#8cc6ff', horizon: '#dff7ff', floor: '#73c056', accent: '#357f32' };

    const sunResult = tintBattleTerrainPalette(base, 'sun');
    expect(sunResult.sky).not.toBe(base.sky);

    const sandstormResult = tintBattleTerrainPalette(base, 'sandstorm');
    expect(sandstormResult.sky).not.toBe(base.sky);

    const hailResult = tintBattleTerrainPalette(base, 'hail');
    expect(hailResult.sky).not.toBe(base.sky);
  });
});