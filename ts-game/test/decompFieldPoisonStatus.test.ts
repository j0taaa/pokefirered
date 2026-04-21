import { describe, expect, test } from 'vitest';
import { doPoisonFieldEffect, tryFieldPoisonWhiteOut } from '../src/game/decompFieldPoisonStatus';

describe('decomp field_poison', () => {
  test('applies 1 HP poison walk damage and reports faints', () => {
    const party = [
      {
        species: 'PIDGEY',
        level: 10,
        maxHp: 20,
        hp: 7,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 255,
        types: ['normal', 'flying'],
        status: 'poison' as const
      },
      {
        species: 'CHARMANDER',
        level: 10,
        maxHp: 20,
        hp: 1,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 45,
        types: ['fire'],
        status: 'poison' as const
      },
      {
        species: 'RATTATA',
        level: 9,
        maxHp: 18,
        hp: 12,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 255,
        types: ['normal'],
        status: 'none' as const
      }
    ];

    expect(doPoisonFieldEffect(party)).toBe('FLDPSN_FNT');
    expect(party[0]?.hp).toBe(6);
    expect(party[1]?.hp).toBe(0);
    expect(party[2]?.hp).toBe(12);

    const whiteOut = tryFieldPoisonWhiteOut(party);
    expect(whiteOut.faintedMessages).toEqual(['CHARMANDER fainted...']);
    expect(whiteOut.allMonsFainted).toBe(false);
    expect(party[1]?.status).toBe('none');
  });

  test('reports all-party whiteout when every mon drops from poison', () => {
    const party = [
      {
        species: 'CHARMANDER',
        level: 10,
        maxHp: 20,
        hp: 1,
        attack: 10,
        defense: 10,
        speed: 10,
        spAttack: 10,
        spDefense: 10,
        catchRate: 45,
        types: ['fire'],
        status: 'poison' as const
      }
    ];

    expect(doPoisonFieldEffect(party)).toBe('FLDPSN_FNT');
    expect(tryFieldPoisonWhiteOut(party).allMonsFainted).toBe(true);
  });
});
