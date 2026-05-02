import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_POKEMON2_SOURCE,
  sEasyChatGroup_Pokemon2
} from '../src/game/decompEasyChatGroupPokemon2';

describe('decomp easy chat group pokemon2', () => {
  test('preserves every Pokemon2 species token in source order', () => {
    expect(EASY_CHAT_GROUP_POKEMON2_SOURCE).toContain('static const u16 sEasyChatGroup_Pokemon2[]');
    expect(sEasyChatGroup_Pokemon2).toHaveLength(251);
    expect(sEasyChatGroup_Pokemon2.slice(0, 8)).toEqual([
      'SPECIES_ABRA',
      'SPECIES_AERODACTYL',
      'SPECIES_AIPOM',
      'SPECIES_ALAKAZAM',
      'SPECIES_AMPHAROS',
      'SPECIES_ARBOK',
      'SPECIES_ARCANINE',
      'SPECIES_ARIADOS'
    ]);
  });

  test('preserves middle and tail species ordering', () => {
    expect(sEasyChatGroup_Pokemon2.slice(120, 128)).toEqual([
      'SPECIES_MAGNEMITE',
      'SPECIES_MAGNETON',
      'SPECIES_MANKEY',
      'SPECIES_MANTINE',
      'SPECIES_MAREEP',
      'SPECIES_MARILL',
      'SPECIES_MAROWAK',
      'SPECIES_MEGANIUM'
    ]);
    expect(sEasyChatGroup_Pokemon2.slice(-8)).toEqual([
      'SPECIES_WEEZING',
      'SPECIES_WIGGLYTUFF',
      'SPECIES_WOBBUFFET',
      'SPECIES_WOOPER',
      'SPECIES_XATU',
      'SPECIES_YANMA',
      'SPECIES_ZAPDOS',
      'SPECIES_ZUBAT'
    ]);
  });
});
