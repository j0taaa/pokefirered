import speciesInfoSource from '../../../src/data/pokemon/species_info.h?raw';

export type DecompTypeId =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel';

export interface DecompSpeciesInfo {
  species: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseSpAttack: number;
  baseSpDefense: number;
  catchRate: number;
  types: DecompTypeId[];
  abilities: string[];
}

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const typeMap: Record<string, DecompTypeId> = {
  TYPE_NORMAL: 'normal',
  TYPE_FIRE: 'fire',
  TYPE_WATER: 'water',
  TYPE_GRASS: 'grass',
  TYPE_ELECTRIC: 'electric',
  TYPE_ICE: 'ice',
  TYPE_FIGHTING: 'fighting',
  TYPE_POISON: 'poison',
  TYPE_GROUND: 'ground',
  TYPE_FLYING: 'flying',
  TYPE_PSYCHIC: 'psychic',
  TYPE_BUG: 'bug',
  TYPE_ROCK: 'rock',
  TYPE_GHOST: 'ghost',
  TYPE_DRAGON: 'dragon',
  TYPE_DARK: 'dark',
  TYPE_STEEL: 'steel'
};

const parseSpeciesInfo = (source: string): Map<string, DecompSpeciesInfo> => {
  const entries = new Map<string, DecompSpeciesInfo>();
  const entryRegex = /\[SPECIES_(\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;

  for (const match of source.matchAll(entryRegex)) {
    const species = normalizeSpecies(match[1]);
    const block = match[2];
    const typesMatch = block.match(/\.types = \{(TYPE_\w+), (TYPE_\w+)\}/u);
    const typeA = typesMatch ? typeMap[typesMatch[1]] : 'normal';
    const typeB = typesMatch ? typeMap[typesMatch[2]] : typeA;
    const types = typeA === typeB ? [typeA] : [typeA, typeB];
    const abilities = (block.match(/\.abilities = \{(ABILITY_\w+), (ABILITY_\w+)\}/u)?.slice(1) ?? ['ABILITY_NONE', 'ABILITY_NONE'])
      .map((ability) => ability.replace(/^ABILITY_/u, ''))
      .filter((ability) => ability !== 'NONE');

    entries.set(species, {
      species,
      baseHp: Number.parseInt(block.match(/\.baseHP = (\d+)/u)?.[1] ?? '1', 10),
      baseAttack: Number.parseInt(block.match(/\.baseAttack = (\d+)/u)?.[1] ?? '1', 10),
      baseDefense: Number.parseInt(block.match(/\.baseDefense = (\d+)/u)?.[1] ?? '1', 10),
      baseSpeed: Number.parseInt(block.match(/\.baseSpeed = (\d+)/u)?.[1] ?? '1', 10),
      baseSpAttack: Number.parseInt(block.match(/\.baseSpAttack = (\d+)/u)?.[1] ?? '1', 10),
      baseSpDefense: Number.parseInt(block.match(/\.baseSpDefense = (\d+)/u)?.[1] ?? '1', 10),
      catchRate: Number.parseInt(block.match(/\.catchRate = (\d+)/u)?.[1] ?? '255', 10),
      types,
      abilities
    });
  }

  return entries;
};

const decompSpeciesInfo = parseSpeciesInfo(speciesInfoSource);

export const getDecompSpeciesInfo = (species: string): DecompSpeciesInfo | null =>
  decompSpeciesInfo.get(normalizeSpecies(species)) ?? null;

export const formatTypeLabel = (type: string): string => type.toUpperCase();
