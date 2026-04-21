import { describe, expect, test } from 'vitest';
import {
  Q_8_8_div,
  Q_8_8_inv,
  Q_8_8_mul,
  Q_24_8_div,
  Q_24_8_inv,
  Q_24_8_mul,
  Q_N_S_div,
  Q_N_S_inv,
  Q_N_S_mul
} from '../src/game/decompMathUtil';

describe('decomp math_util', () => {
  test('multiplies fixed-point values with the same truncation as C', () => {
    expect(Q_8_8_mul(240, 0x80)).toBe(120);
    expect(Q_N_S_mul(4, 48, 24)).toBe(72);
    expect(Q_24_8_mul(1024, 0x80)).toBe(512);
  });

  test('returns zero on division by zero for div helpers', () => {
    expect(Q_8_8_div(5, 0)).toBe(0);
    expect(Q_N_S_div(4, 5, 0)).toBe(0);
    expect(Q_24_8_div(5, 0)).toBe(0);
  });

  test('divides and inverts fixed-point values like the decomp helpers', () => {
    expect(Q_8_8_div(120, 3)).toBe(10240);
    expect(Q_N_S_div(4, 7, 2)).toBe(56);
    expect(Q_24_8_div(512, 2)).toBe(65536);
    expect(Q_8_8_inv(4)).toBe(16384);
    expect(Q_N_S_inv(4, 8)).toBe(512);
    expect(Q_24_8_inv(4)).toBe(16384);
  });
});
