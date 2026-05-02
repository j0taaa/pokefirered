import { describe, expect, test } from 'vitest';
import {
  formatTypeLabel,
  getDecompSpeciesInfo,
  getRawSpeciesInfo,
  getSpeciesInfoUnparsedRemainder
} from '../src/game/decompSpecies';

describe('decomp species data', () => {
  test('loads base stats and types for known species', () => {
    const info = getDecompSpeciesInfo('CHARMANDER');
    expect(info).not.toBeNull();
    expect(info?.baseAttack).toBe(52);
    expect(info?.baseSpAttack).toBe(60);
    expect(info?.types).toEqual(['fire']);
  });

  test('formats type labels in menu-friendly form', () => {
    expect(formatTypeLabel('flying')).toBe('FLYING');
  });

  test('ports every gSpeciesInfo entry with exact raw C field values', () => {
    const rawSpecies = getRawSpeciesInfo();
    expect(rawSpecies).toHaveLength(412);
    expect(getSpeciesInfoUnparsedRemainder()).toBe('');

    expect(rawSpecies[0]).toMatchObject({
      species: 'SPECIES_NONE',
      initializer: '{0}',
      baseHP: '0',
      types: [],
      abilities: []
    });

    expect(rawSpecies[1]).toMatchObject({
      species: 'SPECIES_BULBASAUR',
      baseHP: '45',
      baseAttack: '49',
      baseDefense: '49',
      baseSpeed: '45',
      baseSpAttack: '65',
      baseSpDefense: '65',
      types: ['TYPE_GRASS', 'TYPE_POISON'],
      catchRate: '45',
      expYield: '64',
      evYield_SpAttack: '1',
      itemCommon: 'ITEM_NONE',
      genderRatio: 'PERCENT_FEMALE(12.5)',
      eggGroups: ['EGG_GROUP_MONSTER', 'EGG_GROUP_GRASS'],
      abilities: ['ABILITY_OVERGROW', 'ABILITY_NONE'],
      bodyColor: 'BODY_COLOR_GREEN',
      noFlip: 'FALSE'
    });

    expect(rawSpecies.find((entry) => entry.species === 'SPECIES_OLD_UNOWN_B')).toMatchObject({
      initializer: 'OLD_UNOWN_SPECIES_INFO',
      baseHP: '50',
      baseAttack: '150',
      types: ['TYPE_NORMAL', 'TYPE_NORMAL'],
      genderRatio: 'MON_GENDERLESS',
      abilities: ['ABILITY_NONE', 'ABILITY_NONE']
    });

    expect(rawSpecies.at(-1)).toMatchObject({
      species: 'SPECIES_CHIMECHO',
      baseHP: '65',
      baseSpAttack: '95',
      growthRate: 'GROWTH_FAST',
      abilities: ['ABILITY_LEVITATE', 'ABILITY_NONE']
    });
  });
});
