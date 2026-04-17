import { describe, expect, test } from 'vitest';
import { getBattlePpLineColors, getBattlePpToMaxPpState } from '../src/rendering/battleScreenLayout';

describe('battleScreenLayout PP palette parity', () => {
  test('getBattlePpToMaxPpState matches GetCurrentPpToMaxPpState branches', () => {
    expect(getBattlePpToMaxPpState(20, 20)).toBe(3);
    expect(getBattlePpToMaxPpState(2, 2)).toBe(3);
    expect(getBattlePpToMaxPpState(2, 1)).toBe(3);
    expect(getBattlePpToMaxPpState(0, 1)).toBe(2);
    expect(getBattlePpToMaxPpState(1, 1)).toBe(3);
    expect(getBattlePpToMaxPpState(3, 7)).toBe(3);
    expect(getBattlePpToMaxPpState(2, 7)).toBe(0);
    expect(getBattlePpToMaxPpState(1, 7)).toBe(1);
    expect(getBattlePpToMaxPpState(0, 10)).toBe(2);
    expect(getBattlePpToMaxPpState(1, 10)).toBe(1);
    expect(getBattlePpToMaxPpState(3, 10)).toBe(0);
    expect(getBattlePpToMaxPpState(6, 10)).toBe(3);
  });

  test('getBattlePpLineColors returns four ROM pairs', () => {
    expect(getBattlePpLineColors(20, 20)).toEqual({ fg: '#202020', shadow: '#dedede' });
    expect(getBattlePpLineColors(0, 10)).toEqual({ fg: '#ee0000', shadow: '#f6de9c' });
    expect(getBattlePpLineColors(1, 10)).toEqual({ fg: '#ff9400', shadow: '#ffee73' });
    expect(getBattlePpLineColors(3, 10)).toEqual({ fg: '#eede00', shadow: '#fff68b' });
  });
});
