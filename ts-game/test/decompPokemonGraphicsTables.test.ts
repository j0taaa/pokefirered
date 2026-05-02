import { describe, expect, test } from 'vitest';
import {
  BACK_PIC_TABLE_SOURCE,
  FRONT_PIC_TABLE_SOURCE,
  getPokemonBackPicSymbol,
  getPokemonFrontPicSymbol,
  getPokemonPaletteSymbol,
  getPokemonShinyPaletteSymbol,
  gMonBackPicTable,
  gMonFrontPicTable,
  gMonPaletteTable,
  gMonShinyPaletteTable,
  PALETTE_TABLE_SOURCE,
  SHINY_PALETTE_TABLE_SOURCE
} from '../src/game/decompPokemonGraphicsTables';

describe('decomp Pokemon graphics pointer tables', () => {
  test('parses front and back pic tables in source order', () => {
    expect(FRONT_PIC_TABLE_SOURCE).toContain('const struct CompressedSpriteSheet gMonFrontPicTable[]');
    expect(BACK_PIC_TABLE_SOURCE).toContain('const struct CompressedSpriteSheet gMonBackPicTable[]');
    expect(gMonFrontPicTable).toHaveLength(440);
    expect(gMonBackPicTable).toHaveLength(440);
    expect(gMonFrontPicTable.slice(0, 5)).toEqual([
      { species: 'SPECIES_NONE', symbol: 'gMonFrontPic_CircledQuestionMark' },
      { species: 'SPECIES_BULBASAUR', symbol: 'gMonFrontPic_Bulbasaur' },
      { species: 'SPECIES_IVYSAUR', symbol: 'gMonFrontPic_Ivysaur' },
      { species: 'SPECIES_VENUSAUR', symbol: 'gMonFrontPic_Venusaur' },
      { species: 'SPECIES_CHARMANDER', symbol: 'gMonFrontPic_Charmander' }
    ]);
    expect(getPokemonBackPicSymbol('SPECIES_EGG')).toBe('gMonFrontPic_Egg');
  });

  test('parses normal and shiny palette tables in source order', () => {
    expect(PALETTE_TABLE_SOURCE).toContain('const struct CompressedSpritePalette gMonPaletteTable[]');
    expect(SHINY_PALETTE_TABLE_SOURCE).toContain('const struct CompressedSpritePalette gMonShinyPaletteTable[]');
    expect(gMonPaletteTable).toHaveLength(440);
    expect(gMonShinyPaletteTable).toHaveLength(440);
    expect(getPokemonPaletteSymbol('SPECIES_UNOWN_QMARK')).toBe('gMonPalette_Unown');
    expect(getPokemonShinyPaletteSymbol('SPECIES_UNOWN_QMARK')).toBe('gMonShinyPalette_Unown');
  });

  test('preserves Unown tail symbols and special punctuation variants', () => {
    expect(getPokemonFrontPicSymbol('SPECIES_UNOWN_EMARK')).toBe('gMonFrontPic_UnownExclamationMark');
    expect(getPokemonFrontPicSymbol('SPECIES_UNOWN_QMARK')).toBe('gMonFrontPic_UnownQuestionMark');
    expect(gMonFrontPicTable.slice(-5)).toEqual([
      { species: 'SPECIES_UNOWN_X', symbol: 'gMonFrontPic_UnownX' },
      { species: 'SPECIES_UNOWN_Y', symbol: 'gMonFrontPic_UnownY' },
      { species: 'SPECIES_UNOWN_Z', symbol: 'gMonFrontPic_UnownZ' },
      { species: 'SPECIES_UNOWN_EMARK', symbol: 'gMonFrontPic_UnownExclamationMark' },
      { species: 'SPECIES_UNOWN_QMARK', symbol: 'gMonFrontPic_UnownQuestionMark' }
    ]);
    expect(gMonBackPicTable.slice(-5)).toEqual([
      { species: 'SPECIES_UNOWN_X', symbol: 'gMonBackPic_UnownX' },
      { species: 'SPECIES_UNOWN_Y', symbol: 'gMonBackPic_UnownY' },
      { species: 'SPECIES_UNOWN_Z', symbol: 'gMonBackPic_UnownZ' },
      { species: 'SPECIES_UNOWN_EMARK', symbol: 'gMonBackPic_UnownExclamationMark' },
      { species: 'SPECIES_UNOWN_QMARK', symbol: 'gMonBackPic_UnownQuestionMark' }
    ]);
  });
});
