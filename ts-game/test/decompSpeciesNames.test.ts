import { describe, expect, test } from 'vitest';
import {
  getSpeciesName,
  gSpeciesNames,
  SPECIES_NAMES_SOURCE
} from '../src/game/decompSpeciesNames';

describe('decomp species names', () => {
  test('parses every gSpeciesNames row in source order', () => {
    expect(SPECIES_NAMES_SOURCE).toContain('const u8 gSpeciesNames[][POKEMON_NAME_LENGTH + 1]');
    expect(gSpeciesNames).toHaveLength(412);
    expect(gSpeciesNames.slice(0, 8)).toEqual([
      { species: 'SPECIES_NONE', name: '??????????' },
      { species: 'SPECIES_BULBASAUR', name: 'BULBASAUR' },
      { species: 'SPECIES_IVYSAUR', name: 'IVYSAUR' },
      { species: 'SPECIES_VENUSAUR', name: 'VENUSAUR' },
      { species: 'SPECIES_CHARMANDER', name: 'CHARMANDER' },
      { species: 'SPECIES_CHARMELEON', name: 'CHARMELEON' },
      { species: 'SPECIES_CHARIZARD', name: 'CHARIZARD' },
      { species: 'SPECIES_SQUIRTLE', name: 'SQUIRTLE' }
    ]);
  });

  test('preserves special symbols, punctuation, and tail ordering', () => {
    expect(getSpeciesName('SPECIES_NIDORAN_F')).toBe('NIDORAN♀');
    expect(getSpeciesName('SPECIES_NIDORAN_M')).toBe('NIDORAN♂');
    expect(getSpeciesName('SPECIES_FARFETCHD')).toBe("FARFETCH'D");
    expect(getSpeciesName('SPECIES_MR_MIME')).toBe('MR. MIME');
    expect(gSpeciesNames.slice(-8)).toEqual([
      { species: 'SPECIES_KYOGRE', name: 'KYOGRE' },
      { species: 'SPECIES_GROUDON', name: 'GROUDON' },
      { species: 'SPECIES_RAYQUAZA', name: 'RAYQUAZA' },
      { species: 'SPECIES_LATIAS', name: 'LATIAS' },
      { species: 'SPECIES_LATIOS', name: 'LATIOS' },
      { species: 'SPECIES_JIRACHI', name: 'JIRACHI' },
      { species: 'SPECIES_DEOXYS', name: 'DEOXYS' },
      { species: 'SPECIES_CHIMECHO', name: 'CHIMECHO' }
    ]);
  });
});
