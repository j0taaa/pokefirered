import { describe, expect, test } from 'vitest';
import {
  SPECIES_INFO_H_TRANSLATION_UNIT,
  getRawSpeciesInfo,
  getSpeciesInfoUnparsedRemainder
} from '../src/game/decompSpeciesInfo';
import {
  FRONT_PIC_COORDINATES_H_TRANSLATION_UNIT,
  FRONT_PIC_COORDINATES_SOURCE,
  gMonFrontPicCoords
} from '../src/game/decompFrontPicCoordinates';
import {
  BACK_PIC_COORDINATES_H_TRANSLATION_UNIT,
  BACK_PIC_COORDINATES_SOURCE,
  gMonBackPicCoords
} from '../src/game/decompBackPicCoordinates';
import {
  FRONT_PIC_TABLE_H_TRANSLATION_UNIT,
  FRONT_PIC_TABLE_SOURCE,
  gMonFrontPicTable
} from '../src/game/decompFrontPicTable';
import {
  BACK_PIC_TABLE_H_TRANSLATION_UNIT,
  BACK_PIC_TABLE_SOURCE,
  gMonBackPicTable
} from '../src/game/decompBackPicTable';
import {
  PALETTE_TABLE_H_TRANSLATION_UNIT,
  PALETTE_TABLE_SOURCE,
  gMonPaletteTable
} from '../src/game/decompPaletteTable';
import {
  SHINY_PALETTE_TABLE_H_TRANSLATION_UNIT,
  SHINY_PALETTE_TABLE_SOURCE,
  gMonShinyPaletteTable
} from '../src/game/decompShinyPaletteTable';
import {
  FOOTPRINT_TABLE_H_TRANSLATION_UNIT,
  POKEMON_FOOTPRINT_TABLE_SOURCE,
  gMonFootprintTable
} from '../src/game/decompFootprintTable';

describe('decomp Pokemon data header facades', () => {
  test('anchors species_info.h to the exact parsed gSpeciesInfo rows', () => {
    expect(SPECIES_INFO_H_TRANSLATION_UNIT).toBe('src/data/pokemon/species_info.h');
    expect(getRawSpeciesInfo()).toHaveLength(412);
    expect(getSpeciesInfoUnparsedRemainder()).toBe('');
    expect(getRawSpeciesInfo()[1]).toMatchObject({
      species: 'SPECIES_BULBASAUR',
      baseHP: '45',
      types: ['TYPE_GRASS', 'TYPE_POISON'],
      abilities: ['ABILITY_OVERGROW', 'ABILITY_NONE']
    });
  });

  test('anchors Pokemon picture coordinate headers to exact source-order tables', () => {
    expect(FRONT_PIC_COORDINATES_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/front_pic_coordinates.h');
    expect(FRONT_PIC_COORDINATES_SOURCE).toContain('const struct MonCoords gMonFrontPicCoords[]');
    expect(gMonFrontPicCoords).toHaveLength(440);
    expect(gMonFrontPicCoords[1]).toEqual({ species: 'SPECIES_BULBASAUR', width: 40, height: 40, yOffset: 16 });

    expect(BACK_PIC_COORDINATES_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/back_pic_coordinates.h');
    expect(BACK_PIC_COORDINATES_SOURCE).toContain('const struct MonCoords gMonBackPicCoords[]');
    expect(gMonBackPicCoords).toHaveLength(440);
    expect(gMonBackPicCoords[1]).toEqual({ species: 'SPECIES_BULBASAUR', width: 48, height: 32, yOffset: 16 });
  });

  test('anchors Pokemon graphics and palette pointer headers to exact parsed tables', () => {
    expect(FRONT_PIC_TABLE_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/front_pic_table.h');
    expect(FRONT_PIC_TABLE_SOURCE).toContain('const struct CompressedSpriteSheet gMonFrontPicTable[]');
    expect(gMonFrontPicTable).toHaveLength(440);
    expect(gMonFrontPicTable.at(-1)).toEqual({ species: 'SPECIES_UNOWN_QMARK', symbol: 'gMonFrontPic_UnownQuestionMark' });

    expect(BACK_PIC_TABLE_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/back_pic_table.h');
    expect(BACK_PIC_TABLE_SOURCE).toContain('const struct CompressedSpriteSheet gMonBackPicTable[]');
    expect(gMonBackPicTable).toHaveLength(440);
    expect(gMonBackPicTable.at(-1)).toEqual({ species: 'SPECIES_UNOWN_QMARK', symbol: 'gMonBackPic_UnownQuestionMark' });

    expect(PALETTE_TABLE_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/palette_table.h');
    expect(PALETTE_TABLE_SOURCE).toContain('const struct CompressedSpritePalette gMonPaletteTable[]');
    expect(gMonPaletteTable).toHaveLength(440);
    expect(gMonPaletteTable.at(-1)).toEqual({ species: 'SPECIES_UNOWN_QMARK', symbol: 'gMonPalette_Unown' });

    expect(SHINY_PALETTE_TABLE_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/shiny_palette_table.h');
    expect(SHINY_PALETTE_TABLE_SOURCE).toContain('const struct CompressedSpritePalette gMonShinyPaletteTable[]');
    expect(gMonShinyPaletteTable).toHaveLength(440);
    expect(gMonShinyPaletteTable.at(-1)).toEqual({ species: 'SPECIES_UNOWN_QMARK', symbol: 'gMonShinyPalette_Unown' });
  });

  test('anchors footprint_table.h to exact parsed footprint pointers', () => {
    expect(FOOTPRINT_TABLE_H_TRANSLATION_UNIT).toBe('src/data/pokemon_graphics/footprint_table.h');
    expect(POKEMON_FOOTPRINT_TABLE_SOURCE).toContain('const u8 *const gMonFootprintTable[]');
    expect(gMonFootprintTable).toHaveLength(413);
    expect(gMonFootprintTable.at(-1)).toEqual({
      species: 'SPECIES_EGG',
      footprintSymbol: 'gMonFootprint_Bulbasaur'
    });
  });
});
