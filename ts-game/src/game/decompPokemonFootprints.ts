import footprintTableSource from '../../../src/data/pokemon_graphics/footprint_table.h?raw';

export interface PokemonFootprintEntry {
  species: string;
  footprintSymbol: string;
}

export const POKEMON_FOOTPRINT_TABLE_SOURCE = footprintTableSource;

export const parsePokemonFootprintTable = (source: string): PokemonFootprintEntry[] =>
  [...source.matchAll(/\[(SPECIES_\w+)\]\s*=\s*(gMonFootprint_\w+)/gu)].map((match) => ({
    species: match[1],
    footprintSymbol: match[2]
  }));

export const gMonFootprintTable = parsePokemonFootprintTable(footprintTableSource);

export const getPokemonFootprintSymbol = (species: string): string | undefined =>
  gMonFootprintTable.find((entry) => entry.species === species)?.footprintSymbol;
