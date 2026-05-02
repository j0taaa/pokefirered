import speciesNamesSource from '../../../src/data/text/species_names.h?raw';

export interface SpeciesNameEntry {
  species: string;
  name: string;
}

export const SPECIES_NAMES_SOURCE = speciesNamesSource;

export const parseSpeciesNames = (source: string): SpeciesNameEntry[] =>
  [...source.matchAll(/\[(SPECIES_\w+)\]\s*=\s*_\("([\s\S]*?)"\)/gu)].map((match) => ({
    species: match[1],
    name: match[2]
  }));

export const gSpeciesNames = parseSpeciesNames(speciesNamesSource);

export const getSpeciesName = (species: string): string | undefined =>
  gSpeciesNames.find((entry) => entry.species === species)?.name;
