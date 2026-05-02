import { describe, expect, test } from 'vitest';
import {
  getPokemonFootprintSymbol,
  gMonFootprintTable,
  POKEMON_FOOTPRINT_TABLE_SOURCE
} from '../src/game/decompPokemonFootprints';

describe('decomp Pokemon footprint table', () => {
  test('parses every footprint pointer in source order', () => {
    expect(POKEMON_FOOTPRINT_TABLE_SOURCE).toContain('const u8 *const gMonFootprintTable[]');
    expect(gMonFootprintTable).toHaveLength(413);
    expect(gMonFootprintTable.slice(0, 8)).toEqual([
      { species: 'SPECIES_NONE', footprintSymbol: 'gMonFootprint_Bulbasaur' },
      { species: 'SPECIES_BULBASAUR', footprintSymbol: 'gMonFootprint_Bulbasaur' },
      { species: 'SPECIES_IVYSAUR', footprintSymbol: 'gMonFootprint_Ivysaur' },
      { species: 'SPECIES_VENUSAUR', footprintSymbol: 'gMonFootprint_Venusaur' },
      { species: 'SPECIES_CHARMANDER', footprintSymbol: 'gMonFootprint_Charmander' },
      { species: 'SPECIES_CHARMELEON', footprintSymbol: 'gMonFootprint_Charmeleon' },
      { species: 'SPECIES_CHARIZARD', footprintSymbol: 'gMonFootprint_Charizard' },
      { species: 'SPECIES_SQUIRTLE', footprintSymbol: 'gMonFootprint_Squirtle' }
    ]);
  });

  test('preserves special symbols and tail ordering', () => {
    expect(getPokemonFootprintSymbol('SPECIES_FARFETCHD')).toBe('gMonFootprint_Farfetchd');
    expect(getPokemonFootprintSymbol('SPECIES_MR_MIME')).toBe('gMonFootprint_Mrmime');
    expect(gMonFootprintTable.slice(-8)).toEqual([
      { species: 'SPECIES_GROUDON', footprintSymbol: 'gMonFootprint_Groudon' },
      { species: 'SPECIES_RAYQUAZA', footprintSymbol: 'gMonFootprint_Rayquaza' },
      { species: 'SPECIES_LATIAS', footprintSymbol: 'gMonFootprint_Latias' },
      { species: 'SPECIES_LATIOS', footprintSymbol: 'gMonFootprint_Latios' },
      { species: 'SPECIES_JIRACHI', footprintSymbol: 'gMonFootprint_Jirachi' },
      { species: 'SPECIES_DEOXYS', footprintSymbol: 'gMonFootprint_Deoxys' },
      { species: 'SPECIES_CHIMECHO', footprintSymbol: 'gMonFootprint_Chimecho' },
      { species: 'SPECIES_EGG', footprintSymbol: 'gMonFootprint_Bulbasaur' }
    ]);
  });
});
