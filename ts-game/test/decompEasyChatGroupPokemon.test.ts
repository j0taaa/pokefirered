import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_POKEMON_SOURCE,
  sEasyChatGroup_Pokemon
} from '../src/game/decompEasyChatGroupPokemon';

describe('decomp easy chat group pokemon', () => {
  test('preserves every Pokemon species token in source order', () => {
    expect(EASY_CHAT_GROUP_POKEMON_SOURCE).toContain('static const u16 sEasyChatGroup_Pokemon[]');
    expect(sEasyChatGroup_Pokemon).toHaveLength(202);
    expect(sEasyChatGroup_Pokemon.slice(0, 8)).toEqual([
      'SPECIES_ABRA',
      'SPECIES_ABSOL',
      'SPECIES_AGGRON',
      'SPECIES_ALAKAZAM',
      'SPECIES_ALTARIA',
      'SPECIES_ANORITH',
      'SPECIES_ARMALDO',
      'SPECIES_ARON'
    ]);
  });

  test('preserves middle and tail species ordering', () => {
    expect(sEasyChatGroup_Pokemon.slice(95, 102)).toEqual([
      'SPECIES_MAGIKARP',
      'SPECIES_MAGNEMITE',
      'SPECIES_MAGNETON',
      'SPECIES_MAKUHITA',
      'SPECIES_MANECTRIC',
      'SPECIES_MARILL',
      'SPECIES_MARSHTOMP'
    ]);
    expect(sEasyChatGroup_Pokemon.at(-1)).toBe('SPECIES_ZUBAT');
  });
});
