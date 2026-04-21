import { describe, expect, test } from 'vitest';
import {
  addMoney,
  getMoney,
  isEnoughMoney,
  removeMoney,
  setMoney
} from '../src/game/decompMoney';

describe('decompMoney', () => {
  test('supports legacy fallback reads and encrypted writes', () => {
    const state = {
      vars: {
        money: 4321,
        moneyEncryptionKey: 0x1234
      } as Record<string, number>
    };

    expect(getMoney(state)).toBe(4321);

    setMoney(state, 6789);

    expect(getMoney(state)).toBe(6789);
    expect(state.vars.money).toBe(6789);
    expect(state.vars.moneyEncrypted).toBe((6789 ^ 0x1234) >>> 0);
  });

  test('matches FireRed add/remove clamp behavior', () => {
    const state = { vars: { money: 900, moneyEncryptionKey: 0 } as Record<string, number> };

    expect(isEnoughMoney(state, 500)).toBe(true);
    expect(isEnoughMoney(state, 901)).toBe(false);

    addMoney(state, 200);
    expect(getMoney(state)).toBe(1100);

    removeMoney(state, 1500);
    expect(getMoney(state)).toBe(0);
  });
});
