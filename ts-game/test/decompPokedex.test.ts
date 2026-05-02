import { describe, expect, test } from 'vitest';
import {
  FLAG_GET_CAUGHT,
  FLAG_GET_SEEN,
  FLAG_SET_CAUGHT,
  FLAG_SET_SEEN,
  GetHoennPokedexCount,
  GetKantoPokedexCount,
  GetNationalPokedexCount,
  GetPokedexCategoryName,
  GetPokedexHeightWeight,
  GetSetPokedexFlag,
  HasAllHoennMons,
  HasAllKantoMons,
  HasAllMons,
  formatDexHeight,
  formatDexWeight,
  getDecompPokedexEntry,
  getHoennPokedexCount,
  getKantoPokedexCount,
  getNationalPokedexCount,
  getPokedexHeightWeight,
  getSetPokedexFlag,
  gPokedexEntries,
  hasAllHoennMons,
  hasAllKantoMons,
  hasAllMons,
  parseRawPokedexEntries,
  POKEDEX_ENTRIES_SOURCE
} from '../src/game/decompPokedex';

describe('decomp pokedex data', () => {
  test('loads decomp-backed pokedex metadata for known species', () => {
    const entry = getDecompPokedexEntry('CHARMANDER');
    expect(entry).not.toBeNull();
    expect(entry?.category).toBe('LIZARD');
    expect(entry?.heightDm).toBe(6);
    expect(entry?.weightHg).toBe(85);
    expect(entry?.description.length).toBeGreaterThan(10);
  });

  test('formats height and weight with pokedex-friendly units', () => {
    expect(formatDexHeight(6)).toBe(`2'00"`);
    expect(formatDexWeight(85)).toBe('18.7 lbs');
  });

  test('tracks seen and caught flags with the decomp flag cases', () => {
    const state = {
      pokedex: {
        seenSpecies: [] as string[],
        caughtSpecies: [] as string[]
      }
    };

    expect(getSetPokedexFlag(state, 4, FLAG_GET_SEEN)).toBe(0);
    expect(getSetPokedexFlag(state, 4, FLAG_GET_CAUGHT)).toBe(0);

    expect(getSetPokedexFlag(state, 4, FLAG_SET_SEEN)).toBe(0);
    expect(getSetPokedexFlag(state, 4, FLAG_SET_CAUGHT)).toBe(0);

    expect(getSetPokedexFlag(state, 4, FLAG_GET_SEEN)).toBe(1);
    expect(getSetPokedexFlag(state, 4, FLAG_GET_CAUGHT)).toBe(1);
    expect(state.pokedex.seenSpecies).toEqual(['CHARMANDER']);
    expect(state.pokedex.caughtSpecies).toEqual(['CHARMANDER']);
  });

  test('counts Kanto and National dex totals with the same exclusions as pokedex.c helpers', () => {
    const state = {
      pokedex: {
        seenSpecies: ['BULBASAUR', 'CHIKORITA', 'TREECKO'],
        caughtSpecies: ['BULBASAUR', 'CHIKORITA', 'TREECKO']
      }
    };

    expect(getKantoPokedexCount(state, FLAG_GET_SEEN)).toBe(1);
    expect(getKantoPokedexCount(state, FLAG_GET_CAUGHT)).toBe(1);
    expect(getNationalPokedexCount(state, FLAG_GET_SEEN)).toBe(3);
    expect(getNationalPokedexCount(state, FLAG_GET_CAUGHT)).toBe(3);
  });

  test('applies the decomp completion rules for Kanto, Hoenn, and full National checks', () => {
    const state = {
      pokedex: {
        seenSpecies: [] as string[],
        caughtSpecies: [] as string[]
      }
    };

    for (let dexNumber = 1; dexNumber <= 151; dexNumber += 1) {
      getSetPokedexFlag(state, dexNumber, FLAG_SET_CAUGHT);
    }

    expect(hasAllKantoMons(state)).toBe(true);
    expect(hasAllMons(state)).toBe(false);
    expect(hasAllHoennMons(state)).toBe(false);
  });

  test('returns decomp height and weight by national dex index', () => {
    expect(getPokedexHeightWeight(4, 0)).toBe(6);
    expect(getPokedexHeightWeight(4, 1)).toBe(85);
    expect(getPokedexHeightWeight(9999, 0)).toBe(1);
  });

  test('parses every raw pokedex entry field from pokedex_entries.h', () => {
    expect(POKEDEX_ENTRIES_SOURCE).toContain('const struct PokedexEntry gPokedexEntries[]');
    expect(parseRawPokedexEntries(POKEDEX_ENTRIES_SOURCE)).toEqual(gPokedexEntries);
    expect(gPokedexEntries).toHaveLength(387);
    expect(gPokedexEntries[0]).toEqual({
      nationalDex: 'NATIONAL_DEX_NONE',
      categoryName: 'UNKNOWN',
      height: 0,
      weight: 0,
      descriptionSymbol: 'gDummyPokedexText',
      unusedDescriptionSymbol: 'gDummyPokedexTextUnused',
      pokemonScale: 256,
      pokemonOffset: 0,
      trainerScale: 256,
      trainerOffset: 0
    });
    expect(gPokedexEntries[1]).toEqual({
      nationalDex: 'NATIONAL_DEX_BULBASAUR',
      categoryName: 'SEED',
      height: 7,
      weight: 69,
      descriptionSymbol: 'gBulbasaurPokedexText',
      unusedDescriptionSymbol: 'gBulbasaurPokedexTextUnused',
      pokemonScale: 356,
      pokemonOffset: 16,
      trainerScale: 256,
      trainerOffset: -2
    });
  });

  test('preserves tail raw pokedex scale and offset data', () => {
    expect(gPokedexEntries.at(-1)).toEqual({
      nationalDex: 'NATIONAL_DEX_DEOXYS',
      categoryName: 'DNA',
      height: 17,
      weight: 608,
      descriptionSymbol: 'gDeoxysPokedexText',
      unusedDescriptionSymbol: 'gDeoxysPokedexTextUnused',
      pokemonScale: 293,
      pokemonOffset: 0,
      trainerScale: 337,
      trainerOffset: 2
    });
    expect(gPokedexEntries.find((entry) => entry.nationalDex === 'NATIONAL_DEX_RAYQUAZA')).toMatchObject({
      pokemonOffset: -1,
      trainerScale: 483,
      trainerOffset: 9
    });
  });

  test('exact C-name Pokedex helpers preserve category, flag, count, and completion logic', () => {
    const state = {
      pokedex: {
        seenSpecies: [] as string[],
        caughtSpecies: [] as string[]
      }
    };

    expect(GetPokedexCategoryName(1)).toBe('SEED');
    expect(GetPokedexHeightWeight(4, 0)).toBe(getPokedexHeightWeight(4, 0));
    expect(GetPokedexHeightWeight(4, 1)).toBe(getPokedexHeightWeight(4, 1));
    expect(GetPokedexHeightWeight(4, 99)).toBe(1);

    expect(GetSetPokedexFlag(state, 1, FLAG_SET_SEEN)).toBe(0);
    expect(GetSetPokedexFlag(state, 1, FLAG_SET_CAUGHT)).toBe(0);
    expect(GetSetPokedexFlag(state, 1, FLAG_GET_SEEN)).toBe(1);
    expect(GetSetPokedexFlag(state, 1, FLAG_GET_CAUGHT)).toBe(1);

    expect(GetKantoPokedexCount(state, FLAG_GET_CAUGHT)).toBe(getKantoPokedexCount(state, FLAG_GET_CAUGHT));
    expect(GetNationalPokedexCount(state, FLAG_GET_SEEN)).toBe(getNationalPokedexCount(state, FLAG_GET_SEEN));
    expect(GetHoennPokedexCount(state, FLAG_GET_CAUGHT)).toBe(getHoennPokedexCount(state, FLAG_GET_CAUGHT));
    expect(HasAllKantoMons(state)).toBe(false);
    expect(HasAllHoennMons(state)).toBe(false);
    expect(HasAllMons(state)).toBe(false);
  });
});
