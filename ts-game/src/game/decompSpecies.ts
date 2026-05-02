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

export type DecompGrowthRate =
  | 'GROWTH_MEDIUM_FAST'
  | 'GROWTH_ERRATIC'
  | 'GROWTH_FLUCTUATING'
  | 'GROWTH_MEDIUM_SLOW'
  | 'GROWTH_FAST'
  | 'GROWTH_SLOW';

export interface DecompSpeciesInfo {
  species: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseSpAttack: number;
  baseSpDefense: number;
  evYield: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    spAttack: number;
    spDefense: number;
  };
  catchRate: number;
  safariZoneFleeRate: number;
  expYield: number;
  growthRate: DecompGrowthRate;
  types: DecompTypeId[];
  abilities: string[];
  genderRatioToken: string;
}

export interface RawSpeciesInfo {
  species: string;
  initializer: string;
  baseHP: string;
  baseAttack: string;
  baseDefense: string;
  baseSpeed: string;
  baseSpAttack: string;
  baseSpDefense: string;
  types: string[];
  catchRate: string;
  expYield: string;
  evYield_HP: string;
  evYield_Attack: string;
  evYield_Defense: string;
  evYield_Speed: string;
  evYield_SpAttack: string;
  evYield_SpDefense: string;
  itemCommon: string;
  itemRare: string;
  genderRatio: string;
  eggCycles: string;
  friendship: string;
  growthRate: string;
  eggGroups: string[];
  abilities: string[];
  safariZoneFleeRate: string;
  bodyColor: string;
  noFlip: string;
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
      evYield: {
        hp: Number.parseInt(block.match(/\.evYield_HP = (\d+)/u)?.[1] ?? '0', 10),
        attack: Number.parseInt(block.match(/\.evYield_Attack = (\d+)/u)?.[1] ?? '0', 10),
        defense: Number.parseInt(block.match(/\.evYield_Defense = (\d+)/u)?.[1] ?? '0', 10),
        speed: Number.parseInt(block.match(/\.evYield_Speed = (\d+)/u)?.[1] ?? '0', 10),
        spAttack: Number.parseInt(block.match(/\.evYield_SpAttack = (\d+)/u)?.[1] ?? '0', 10),
        spDefense: Number.parseInt(block.match(/\.evYield_SpDefense = (\d+)/u)?.[1] ?? '0', 10)
      },
      catchRate: Number.parseInt(block.match(/\.catchRate = (\d+)/u)?.[1] ?? '255', 10),
      safariZoneFleeRate: Number.parseInt(block.match(/\.safariZoneFleeRate = (\d+)/u)?.[1] ?? '0', 10),
      expYield: Number.parseInt(block.match(/\.expYield = (\d+)/u)?.[1] ?? '0', 10),
      growthRate: (block.match(/\.growthRate = (GROWTH_\w+)/u)?.[1] ?? 'GROWTH_MEDIUM_FAST') as DecompGrowthRate,
      types,
      abilities,
      genderRatioToken: block.match(/\.genderRatio = ([^,]+)/u)?.[1]?.trim() ?? 'PERCENT_FEMALE(50)'
    });
  }

  return entries;
};

const parseDefineMacro = (source: string, name: string): string => {
  const defineStart = source.indexOf(`#define ${name}`);
  if (defineStart < 0) {
    return '';
  }

  const nextTopLevelConst = source.indexOf('\nconst ', defineStart);
  const end = nextTopLevelConst < 0 ? source.length : nextTopLevelConst;
  return source.slice(defineStart, end).trim();
};

const parseSpeciesTableBody = (source: string): string => {
  const tableMatch = source.match(/const struct SpeciesInfo gSpeciesInfo\[\] =\n\{([\s\S]*?)^\};/mu);
  if (!tableMatch) {
    throw new Error('Missing gSpeciesInfo table in species_info.h');
  }

  return tableMatch[1];
};

const parseRawFieldMap = (initializer: string): Map<string, string> => {
  const fields = new Map<string, string>();
  const fieldRegex = /^\s*\.(\w+)\s*=\s*(.+?),\s*$/gmu;

  for (const match of initializer.matchAll(fieldRegex)) {
    fields.set(match[1], match[2].trim());
  }

  return fields;
};

const parseRawPair = (value: string | undefined): string[] =>
  value
    ?.replace(/^\{/u, '')
    .replace(/\}$/u, '')
    .split(',')
    .map((entry) => entry.trim()) ?? [];

const parseRawSpeciesInfo = (source: string): RawSpeciesInfo[] => {
  const body = parseSpeciesTableBody(source);
  const oldUnownInitializer = parseDefineMacro(source, 'OLD_UNOWN_SPECIES_INFO')
    .replace(/^#define OLD_UNOWN_SPECIES_INFO\s*/u, '')
    .replace(/\\\n/g, '\n')
    .trim();
  const entryRegex = /\[(SPECIES_\w+)\]\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|OLD_UNOWN_SPECIES_INFO),/gu;
  const entries: RawSpeciesInfo[] = [];

  for (const match of body.matchAll(entryRegex)) {
    const initializer = match[2] === 'OLD_UNOWN_SPECIES_INFO' ? oldUnownInitializer : match[2];
    const fields = parseRawFieldMap(initializer);

    entries.push({
      species: match[1],
      initializer: match[2],
      baseHP: fields.get('baseHP') ?? '0',
      baseAttack: fields.get('baseAttack') ?? '0',
      baseDefense: fields.get('baseDefense') ?? '0',
      baseSpeed: fields.get('baseSpeed') ?? '0',
      baseSpAttack: fields.get('baseSpAttack') ?? '0',
      baseSpDefense: fields.get('baseSpDefense') ?? '0',
      types: parseRawPair(fields.get('types')),
      catchRate: fields.get('catchRate') ?? '0',
      expYield: fields.get('expYield') ?? '0',
      evYield_HP: fields.get('evYield_HP') ?? '0',
      evYield_Attack: fields.get('evYield_Attack') ?? '0',
      evYield_Defense: fields.get('evYield_Defense') ?? '0',
      evYield_Speed: fields.get('evYield_Speed') ?? '0',
      evYield_SpAttack: fields.get('evYield_SpAttack') ?? '0',
      evYield_SpDefense: fields.get('evYield_SpDefense') ?? '0',
      itemCommon: fields.get('itemCommon') ?? 'ITEM_NONE',
      itemRare: fields.get('itemRare') ?? 'ITEM_NONE',
      genderRatio: fields.get('genderRatio') ?? '0',
      eggCycles: fields.get('eggCycles') ?? '0',
      friendship: fields.get('friendship') ?? '0',
      growthRate: fields.get('growthRate') ?? 'GROWTH_MEDIUM_FAST',
      eggGroups: parseRawPair(fields.get('eggGroups')),
      abilities: parseRawPair(fields.get('abilities')),
      safariZoneFleeRate: fields.get('safariZoneFleeRate') ?? '0',
      bodyColor: fields.get('bodyColor') ?? 'BODY_COLOR_RED',
      noFlip: fields.get('noFlip') ?? 'FALSE'
    });
  }

  return entries;
};

const parseSpeciesInfoUnparsedRemainder = (source: string): string => {
  let body = parseSpeciesTableBody(source);
  const entryRegex = /\[(SPECIES_\w+)\]\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|OLD_UNOWN_SPECIES_INFO),/gu;
  body = body.replace(entryRegex, '');
  return body.replace(/\/\/.*$/gmu, '').trim();
};

const decompSpeciesInfo = parseSpeciesInfo(speciesInfoSource);
const rawSpeciesInfo = parseRawSpeciesInfo(speciesInfoSource);
const speciesInfoUnparsedRemainder = parseSpeciesInfoUnparsedRemainder(speciesInfoSource);

export const getRawSpeciesInfo = (): RawSpeciesInfo[] =>
  rawSpeciesInfo.map((entry) => ({
    ...entry,
    types: [...entry.types],
    eggGroups: [...entry.eggGroups],
    abilities: [...entry.abilities]
  }));

export const getSpeciesInfoUnparsedRemainder = (): string => speciesInfoUnparsedRemainder;

export const getDecompSpeciesInfo = (species: string): DecompSpeciesInfo | null =>
  decompSpeciesInfo.get(normalizeSpecies(species)) ?? null;

export const formatTypeLabel = (type: string): string => type.toUpperCase();
