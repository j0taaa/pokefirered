import { describe, expect, test } from 'vitest';
import { addCoins, getCoins, removeCoins, setCoins } from '../src/game/decompCoins';

describe('decomp coins', () => {
  test('supports encrypted coin reads and writes', () => {
    const state = {
      vars: {
        coins: 250,
        coinsEncryptionKey: 0x55aa
      } as Record<string, number>
    };

    expect(getCoins(state)).toBe(250);

    setCoins(state, 4321);

    expect(getCoins(state)).toBe(4321);
    expect(state.vars.coins).toBe(4321);
    expect(state.vars.coinsEncrypted).toBe((4321 ^ 0x55aa) >>> 0);
  });

  test('matches FireRed add/remove clamp behavior', () => {
    const state = {
      vars: {
        coins: 9998,
        coinsEncryptionKey: 0
      } as Record<string, number>
    };

    expect(addCoins(state, 1)).toBe(true);
    expect(getCoins(state)).toBe(9999);
    expect(addCoins(state, 1)).toBe(false);
    expect(getCoins(state)).toBe(9999);

    expect(removeCoins(state, 10000)).toBe(false);
    expect(removeCoins(state, 99)).toBe(true);
    expect(getCoins(state)).toBe(9900);
  });
});
