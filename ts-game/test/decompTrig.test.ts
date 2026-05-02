import { describe, expect, test } from 'vitest';
import {
  Cos,
  Cos2,
  Sin,
  Sin2,
  TRIG_C_TRANSLATION_UNIT,
  cos,
  cos2,
  gSineDegreeTable,
  gSineTable,
  sin,
  sin2
} from '../src/game/decompTrig';

describe('decomp trig', () => {
  test('exports exact trig.c entry points', () => {
    expect(TRIG_C_TRANSLATION_UNIT).toBe('src/trig.c');
    expect(Sin(64, 100)).toBe(sin(64, 100));
    expect(Cos(0, 100)).toBe(cos(0, 100));
    expect(Sin2(90)).toBe(sin2(90));
    expect(Cos2(0)).toBe(cos2(0));
  });

  test('gSineTable reconstructs the exact 320-entry Q8.8 table shape', () => {
    expect(gSineTable).toHaveLength(320);
    expect(gSineTable.slice(0, 10)).toEqual([0, 6, 12, 18, 25, 31, 37, 43, 49, 56]);
    expect(gSineTable[64]).toBe(256);
    expect(gSineTable[128]).toBe(0);
    expect(gSineTable[129]).toBe(-6);
    expect(gSineTable[192]).toBe(-256);
    expect(gSineTable[256]).toBe(0);
    expect(gSineTable.slice(315, 320)).toEqual([254, 254, 255, 255, 255]);
  });

  test('Sin and Cos use Q8.8 table values and arithmetic right shift scaling', () => {
    expect(sin(0, 100)).toBe(0);
    expect(sin(64, 100)).toBe(100);
    expect(sin(32, 100)).toBe((100 * 181) >> 8);
    expect(sin(192, 100)).toBe(-100);
    expect(sin(160, 100)).toBe((100 * -181) >> 8);

    expect(cos(0, 100)).toBe(100);
    expect(cos(64, 100)).toBe(0);
    expect(cos(128, 100)).toBe(-100);
    expect(cos(255, 100)).toBe((100 * gSineTable[319]) >> 8);
  });

  test('gSineDegreeTable reconstructs the exact 180-entry Q4.12 table', () => {
    expect(gSineDegreeTable).toHaveLength(180);
    expect(gSineDegreeTable.slice(0, 6)).toEqual([0, 71, 143, 214, 286, 357]);
    expect(gSineDegreeTable[30]).toBe(2048);
    expect(gSineDegreeTable[45]).toBe(2896);
    expect(gSineDegreeTable[90]).toBe(4096);
    expect(gSineDegreeTable[135]).toBe(2896);
    expect(gSineDegreeTable[179]).toBe(71);
  });

  test('Sin2 and Cos2 preserve degree wrapping and alternating sign by half-turn', () => {
    expect(sin2(0)).toBe(0);
    expect(sin2(90)).toBe(4096);
    expect(sin2(179)).toBe(71);
    expect(sin2(180)).toBe(0);
    expect(sin2(181)).toBe(-71);
    expect(sin2(270)).toBe(-4096);
    expect(sin2(360)).toBe(0);
    expect(sin2(450)).toBe(4096);

    expect(cos2(0)).toBe(4096);
    expect(cos2(90)).toBe(0);
    expect(cos2(180)).toBe(-4096);
    expect(cos2(270)).toBe(0);
  });

  test('Sin2 and Cos2 accept u16 angles like the C signatures', () => {
    expect(sin2(65536 + 90)).toBe(4096);
    expect(sin2(-1)).toBe(sin2(0xffff));
    expect(cos2(65536)).toBe(4096);
  });
});
