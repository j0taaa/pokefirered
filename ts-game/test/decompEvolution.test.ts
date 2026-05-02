import { describe, expect, test } from 'vitest';
import {
  EVOLUTION_SOURCE,
  gEvolutionTable,
  getDecompEvolutionRules,
  getLevelEvolutionCandidate,
  getRawDecompEvolutionRules
} from '../src/game/decompEvolution';

describe('decomp evolution data', () => {
  test('parses every raw evolution table entry and rule token', () => {
    expect(EVOLUTION_SOURCE).toContain('const struct Evolution gEvolutionTable[NUM_SPECIES][EVOS_PER_MON]');
    expect(gEvolutionTable).toHaveLength(172);
    expect(gEvolutionTable.reduce((count, entry) => count + entry.rules.length, 0)).toBe(184);
    expect(gEvolutionTable.slice(0, 3)).toEqual([
      {
        species: 'SPECIES_BULBASAUR',
        rules: [{ method: 'EVO_LEVEL', parameterToken: '16', targetSpecies: 'SPECIES_IVYSAUR' }]
      },
      {
        species: 'SPECIES_IVYSAUR',
        rules: [{ method: 'EVO_LEVEL', parameterToken: '32', targetSpecies: 'SPECIES_VENUSAUR' }]
      },
      {
        species: 'SPECIES_CHARMANDER',
        rules: [{ method: 'EVO_LEVEL', parameterToken: '16', targetSpecies: 'SPECIES_CHARMELEON' }]
      }
    ]);
  });

  test('parses level evolution rules from the decomp table', () => {
    expect(getDecompEvolutionRules('CHARMANDER')).toEqual([
      {
        method: 'EVO_LEVEL',
        parameter: 16,
        targetSpecies: 'CHARMELEON'
      }
    ]);
  });

  test('preserves item and split evolution parameter tokens exactly', () => {
    expect(getRawDecompEvolutionRules('GLOOM')).toEqual([
      { method: 'EVO_ITEM', parameterToken: 'ITEM_LEAF_STONE', targetSpecies: 'SPECIES_VILEPLUME' },
      { method: 'EVO_ITEM', parameterToken: 'ITEM_SUN_STONE', targetSpecies: 'SPECIES_BELLOSSOM' }
    ]);
    expect(getRawDecompEvolutionRules('TYROGUE')).toEqual([
      { method: 'EVO_LEVEL_ATK_LT_DEF', parameterToken: '20', targetSpecies: 'SPECIES_HITMONCHAN' },
      { method: 'EVO_LEVEL_ATK_GT_DEF', parameterToken: '20', targetSpecies: 'SPECIES_HITMONLEE' },
      { method: 'EVO_LEVEL_ATK_EQ_DEF', parameterToken: '20', targetSpecies: 'SPECIES_HITMONTOP' }
    ]);
    expect(gEvolutionTable.at(-1)).toEqual({
      species: 'SPECIES_METANG',
      rules: [{ method: 'EVO_LEVEL', parameterToken: '45', targetSpecies: 'SPECIES_METAGROSS' }]
    });
  });

  test('resolves simple level evolutions when the threshold is met', () => {
    expect(getLevelEvolutionCandidate({
      species: 'CHARMANDER',
      level: 16,
      attack: 30,
      defense: 20
    })).toBe('CHARMELEON');

    expect(getLevelEvolutionCandidate({
      species: 'CHARMANDER',
      level: 15,
      attack: 30,
      defense: 20
    })).toBeNull();
  });

  test('resolves Tyrogue split evolutions using attack and defense', () => {
    expect(getLevelEvolutionCandidate({
      species: 'TYROGUE',
      level: 20,
      attack: 25,
      defense: 20
    })).toBe('HITMONLEE');

    expect(getLevelEvolutionCandidate({
      species: 'TYROGUE',
      level: 20,
      attack: 20,
      defense: 20
    })).toBe('HITMONTOP');

    expect(getLevelEvolutionCandidate({
      species: 'TYROGUE',
      level: 20,
      attack: 18,
      defense: 22
    })).toBe('HITMONCHAN');
  });
});
