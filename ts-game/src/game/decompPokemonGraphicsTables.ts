import frontPicTableSource from '../../../src/data/pokemon_graphics/front_pic_table.h?raw';
import backPicTableSource from '../../../src/data/pokemon_graphics/back_pic_table.h?raw';
import paletteTableSource from '../../../src/data/pokemon_graphics/palette_table.h?raw';
import shinyPaletteTableSource from '../../../src/data/pokemon_graphics/shiny_palette_table.h?raw';

export interface PokemonGraphicsTableEntry {
  species: string;
  symbol: string;
}

export const FRONT_PIC_TABLE_SOURCE = frontPicTableSource;
export const BACK_PIC_TABLE_SOURCE = backPicTableSource;
export const PALETTE_TABLE_SOURCE = paletteTableSource;
export const SHINY_PALETTE_TABLE_SOURCE = shinyPaletteTableSource;

export const parsePokemonGraphicsTable = (source: string, macroName: string): PokemonGraphicsTableEntry[] =>
  [...source.matchAll(new RegExp(`${macroName}\\((\\w+),\\s*(gMon\\w+_\\w+)\\)`, 'gu'))].map((match) => ({
    species: `SPECIES_${match[1]}`,
    symbol: match[2]
  }));

export const gMonFrontPicTable = parsePokemonGraphicsTable(frontPicTableSource, 'SPECIES_SPRITE');
export const gMonBackPicTable = parsePokemonGraphicsTable(backPicTableSource, 'SPECIES_SPRITE');
export const gMonPaletteTable = parsePokemonGraphicsTable(paletteTableSource, 'SPECIES_PAL');
export const gMonShinyPaletteTable = parsePokemonGraphicsTable(shinyPaletteTableSource, 'SPECIES_SHINY_PAL');

export const getPokemonFrontPicSymbol = (species: string): string | undefined =>
  gMonFrontPicTable.find((entry) => entry.species === species)?.symbol;

export const getPokemonBackPicSymbol = (species: string): string | undefined =>
  gMonBackPicTable.find((entry) => entry.species === species)?.symbol;

export const getPokemonPaletteSymbol = (species: string): string | undefined =>
  gMonPaletteTable.find((entry) => entry.species === species)?.symbol;

export const getPokemonShinyPaletteSymbol = (species: string): string | undefined =>
  gMonShinyPaletteTable.find((entry) => entry.species === species)?.symbol;
