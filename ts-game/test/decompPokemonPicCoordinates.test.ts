import { describe, expect, test } from 'vitest';
import {
  BACK_PIC_COORDINATES_SOURCE,
  FRONT_PIC_COORDINATES_SOURCE,
  getPokemonBackPicCoordinates,
  getPokemonFrontPicCoordinates,
  gMonBackPicCoords,
  gMonFrontPicCoords
} from '../src/game/decompPokemonPicCoordinates';

describe('decomp Pokemon pic coordinates', () => {
  test('parses every front pic coordinate row in source order', () => {
    expect(FRONT_PIC_COORDINATES_SOURCE).toContain('const struct MonCoords gMonFrontPicCoords[]');
    expect(gMonFrontPicCoords).toHaveLength(440);
    expect(gMonFrontPicCoords.slice(0, 5)).toEqual([
      { species: 'SPECIES_NONE', width: 64, height: 64, yOffset: 0 },
      { species: 'SPECIES_BULBASAUR', width: 40, height: 40, yOffset: 16 },
      { species: 'SPECIES_IVYSAUR', width: 48, height: 48, yOffset: 10 },
      { species: 'SPECIES_VENUSAUR', width: 64, height: 56, yOffset: 4 },
      { species: 'SPECIES_CHARMANDER', width: 40, height: 40, yOffset: 13 }
    ]);
  });

  test('parses every back pic coordinate row in source order', () => {
    expect(BACK_PIC_COORDINATES_SOURCE).toContain('const struct MonCoords gMonBackPicCoords[]');
    expect(gMonBackPicCoords).toHaveLength(440);
    expect(gMonBackPicCoords.slice(0, 5)).toEqual([
      { species: 'SPECIES_NONE', width: 64, height: 64, yOffset: 0 },
      { species: 'SPECIES_BULBASAUR', width: 48, height: 32, yOffset: 16 },
      { species: 'SPECIES_IVYSAUR', width: 56, height: 48, yOffset: 10 },
      { species: 'SPECIES_VENUSAUR', width: 64, height: 48, yOffset: 10 },
      { species: 'SPECIES_CHARMANDER', width: 48, height: 48, yOffset: 10 }
    ]);
  });

  test('preserves Egg and Unown punctuation coordinate rows', () => {
    expect(getPokemonFrontPicCoordinates('SPECIES_EGG')).toEqual({
      species: 'SPECIES_EGG',
      width: 24,
      height: 24,
      yOffset: 20
    });
    expect(getPokemonBackPicCoordinates('SPECIES_EGG')).toEqual({
      species: 'SPECIES_EGG',
      width: 24,
      height: 48,
      yOffset: 10
    });
    expect(gMonFrontPicCoords.slice(-2)).toEqual([
      { species: 'SPECIES_UNOWN_EMARK', width: 24, height: 40, yOffset: 15 },
      { species: 'SPECIES_UNOWN_QMARK', width: 24, height: 40, yOffset: 13 }
    ]);
    expect(gMonBackPicCoords.slice(-2)).toEqual([
      { species: 'SPECIES_UNOWN_EMARK', width: 24, height: 56, yOffset: 6 },
      { species: 'SPECIES_UNOWN_QMARK', width: 32, height: 56, yOffset: 6 }
    ]);
  });
});
