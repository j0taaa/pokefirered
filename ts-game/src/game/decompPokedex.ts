import pokedexEntriesSource from '../../../src/data/pokemon/pokedex_entries.h?raw';
import pokedexTextSource from '../../../src/data/pokemon/pokedex_text_fr.h?raw';
import pokemonSource from '../../../src/pokemon.c?raw';

export interface DecompPokedexEntry {
  species: string;
  nationalDexNumber: number;
  category: string;
  heightDm: number;
  weightHg: number;
  description: string;
}

export interface RawPokedexEntry {
  nationalDex: string;
  categoryName: string;
  height: number;
  weight: number;
  descriptionSymbol: string;
  unusedDescriptionSymbol: string;
  pokemonScale: number;
  pokemonOffset: number;
  trainerScale: number;
  trainerOffset: number;
}

export interface DecompPokedexFlagState {
  pokedex: {
    seenSpecies: string[];
    caughtSpecies: string[];
  };
}

export const KANTO_DEX_COUNT = 151;
export const JOHTO_DEX_COUNT = 251;

export const FLAG_GET_SEEN = 0;
export const FLAG_GET_CAUGHT = 1;
export const FLAG_SET_SEEN = 2;
export const FLAG_SET_CAUGHT = 3;

export const POKEDEX_ENTRIES_SOURCE = pokedexEntriesSource;

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const decodeCString = (value: string): string =>
  value
    .replace(/\\n/gu, ' ')
    .replace(/\\p/gu, ' ')
    .replace(/\{[^}]+\}/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();

const parsePokedexTexts = (source: string): Map<string, string> => {
  const texts = new Map<string, string>();
  const regex = /const u8 (\w+)\[\] = _\(([\s\S]*?)\);\n/gu;

  for (const match of source.matchAll(regex)) {
    const symbol = match[1];
    const body = match[2];
    const lines = [...body.matchAll(/"([^"]*)"/gu)].map((part) => part[1]);
    texts.set(symbol, decodeCString(lines.join('')));
  }

  return texts;
};

export const parseRawPokedexEntries = (source: string): RawPokedexEntry[] =>
  [...source.matchAll(/\[(NATIONAL_DEX_\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu)].map((match) => {
    const block = match[2];
    const categoryName = block.match(/\.categoryName = _\("([^"]+)"\)/u)?.[1] ?? 'UNKNOWN';
    const numberField = (field: string): number =>
      Number.parseInt(block.match(new RegExp(`\\.${field} = (-?\\d+)`, 'u'))?.[1] ?? '0', 10);

    return {
      nationalDex: match[1],
      categoryName,
      height: numberField('height'),
      weight: numberField('weight'),
      descriptionSymbol: block.match(/\.description = (\w+)/u)?.[1] ?? '',
      unusedDescriptionSymbol: block.match(/\.unusedDescription = (\w+)/u)?.[1] ?? '',
      pokemonScale: numberField('pokemonScale'),
      pokemonOffset: numberField('pokemonOffset'),
      trainerScale: numberField('trainerScale'),
      trainerOffset: numberField('trainerOffset')
    };
  });

const parsePokedexEntries = (entriesSource: string, textSource: string): Map<string, DecompPokedexEntry> => {
  const textMap = parsePokedexTexts(textSource);
  const entries = new Map<string, DecompPokedexEntry>();
  const entryRegex = /\[NATIONAL_DEX_(\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;
  let nationalDexNumber = 0;

  for (const match of entriesSource.matchAll(entryRegex)) {
    const species = normalizeSpecies(match[1]);
    if (species === 'NONE') {
      continue;
    }

    nationalDexNumber += 1;
    const block = match[2];
    const category = block.match(/\.categoryName = _\("([^"]+)"\)/u)?.[1] ?? 'UNKNOWN';
    const heightDm = Number.parseInt(block.match(/\.height = (\d+)/u)?.[1] ?? '0', 10);
    const weightHg = Number.parseInt(block.match(/\.weight = (\d+)/u)?.[1] ?? '0', 10);
    const descriptionSymbol = block.match(/\.description = (\w+)/u)?.[1] ?? '';

    entries.set(species, {
      species,
      nationalDexNumber,
      category,
      heightDm,
      weightHg,
      description: textMap.get(descriptionSymbol) ?? 'No Pokedex entry available.'
    });
  }

  return entries;
};

export const gPokedexEntries = parseRawPokedexEntries(pokedexEntriesSource);

const decompPokedexEntries = parsePokedexEntries(pokedexEntriesSource, pokedexTextSource);

const nationalDexEntries = [...decompPokedexEntries.values()]
  .sort((left, right) => left.nationalDexNumber - right.nationalDexNumber);

const hoennToNationalOrder = (() => {
  const match = pokemonSource.match(
    /static const u16 sHoennToNationalOrder\[NUM_SPECIES - 1\] =\s*\{([\s\S]*?)\n\};/u
  );
  if (!match) {
    return [] as number[];
  }

  return [...match[1].matchAll(/HOENN_TO_NATIONAL\((\w+)\)/gu)].map((entry) =>
    nationalDexEntries.find((candidate) => candidate.species === normalizeSpecies(entry[1]))?.nationalDexNumber ?? 0
  );
})();

const normalizePokedexSpecies = (species: string): string => normalizeSpecies(species);

const ensureSpeciesFlag = (speciesList: string[], species: string): void => {
  const normalized = normalizePokedexSpecies(species);
  if (!speciesList.includes(normalized)) {
    speciesList.push(normalized);
    speciesList.sort((left, right) => (getNationalDexNumber(left) ?? 9999) - (getNationalDexNumber(right) ?? 9999));
  }
};

const getSpeciesForNationalDexNumber = (nationalDexNumber: number): string | null =>
  nationalDexEntries[nationalDexNumber - 1]?.species ?? null;

export const getDecompPokedexEntry = (species: string): DecompPokedexEntry | null =>
  decompPokedexEntries.get(normalizeSpecies(species)) ?? null;

export const getNationalDexNumber = (species: string): number | null =>
  getDecompPokedexEntry(species)?.nationalDexNumber ?? null;

export const getNationalDexSpecies = (): string[] =>
  nationalDexEntries.map((entry) => entry.species);

export const getPokedexHeightWeight = (dexNum: number, data: 0 | 1): number => {
  const entry = nationalDexEntries[Math.max(0, dexNum - 1)];
  if (!entry) {
    return 1;
  }

  switch (data) {
    case 0:
      return entry.heightDm;
    case 1:
      return entry.weightHg;
    default:
      return 1;
  }
};

export function GetPokedexCategoryName(dexNum: number): string {
  return gPokedexEntries[Math.trunc(dexNum)]?.categoryName ?? 'UNKNOWN';
}

export function GetPokedexHeightWeight(dexNum: number, data: number): number {
  return getPokedexHeightWeight(dexNum, data as 0 | 1);
}

export const getSetPokedexFlag = (
  state: DecompPokedexFlagState,
  nationalDexNo: number,
  caseId: number
): number => {
  const species = getSpeciesForNationalDexNumber(nationalDexNo);
  if (!species) {
    return 0;
  }

  switch (caseId) {
    case FLAG_GET_SEEN:
      return state.pokedex.seenSpecies.includes(species) ? 1 : 0;
    case FLAG_GET_CAUGHT:
      return state.pokedex.caughtSpecies.includes(species) ? 1 : 0;
    case FLAG_SET_SEEN:
      ensureSpeciesFlag(state.pokedex.seenSpecies, species);
      return 0;
    case FLAG_SET_CAUGHT:
      ensureSpeciesFlag(state.pokedex.caughtSpecies, species);
      return 0;
    default:
      return 0;
  }
};

export function GetSetPokedexFlag(
  state: DecompPokedexFlagState,
  nationalDexNo: number,
  caseId: number
): number {
  return getSetPokedexFlag(state, nationalDexNo, caseId);
}

export const getNationalPokedexCount = (
  state: DecompPokedexFlagState,
  caseId: number
): number => {
  let count = 0;
  for (let i = 0; i < nationalDexEntries.length; i += 1) {
    switch (caseId) {
      case FLAG_GET_SEEN:
        if (getSetPokedexFlag(state, i + 1, FLAG_GET_SEEN)) {
          count += 1;
        }
        break;
      case FLAG_GET_CAUGHT:
        if (getSetPokedexFlag(state, i + 1, FLAG_GET_CAUGHT)) {
          count += 1;
        }
        break;
    }
  }
  return count;
};

export function GetNationalPokedexCount(
  state: DecompPokedexFlagState,
  caseId: number
): number {
  return getNationalPokedexCount(state, caseId);
}

export const getHoennPokedexCount = (
  state: DecompPokedexFlagState,
  caseId: number
): number => {
  let count = 0;
  for (let i = 0; i < hoennToNationalOrder.length; i += 1) {
    switch (caseId) {
      case FLAG_GET_SEEN:
        if (getSetPokedexFlag(state, hoennToNationalOrder[i] ?? 0, FLAG_GET_SEEN)) {
          count += 1;
        }
        break;
      case FLAG_GET_CAUGHT:
        if (getSetPokedexFlag(state, hoennToNationalOrder[i] ?? 0, FLAG_GET_CAUGHT)) {
          count += 1;
        }
        break;
    }
  }
  return count;
};

export function GetHoennPokedexCount(
  state: DecompPokedexFlagState,
  caseId: number
): number {
  return getHoennPokedexCount(state, caseId);
}

export const getKantoPokedexCount = (
  state: DecompPokedexFlagState,
  caseId: number
): number => {
  let count = 0;
  for (let i = 0; i < KANTO_DEX_COUNT; i += 1) {
    switch (caseId) {
      case FLAG_GET_SEEN:
        if (getSetPokedexFlag(state, i + 1, FLAG_GET_SEEN)) {
          count += 1;
        }
        break;
      case FLAG_GET_CAUGHT:
        if (getSetPokedexFlag(state, i + 1, FLAG_GET_CAUGHT)) {
          count += 1;
        }
        break;
    }
  }
  return count;
};

export function GetKantoPokedexCount(
  state: DecompPokedexFlagState,
  caseId: number
): number {
  return getKantoPokedexCount(state, caseId);
}

export const hasAllHoennMons = (state: DecompPokedexFlagState): boolean => {
  for (let i = 0; i < hoennToNationalOrder.length - 2; i += 1) {
    if (!getSetPokedexFlag(state, hoennToNationalOrder[i] ?? 0, FLAG_GET_CAUGHT)) {
      return false;
    }
  }
  return true;
};

export function HasAllHoennMons(state: DecompPokedexFlagState): boolean {
  return hasAllHoennMons(state);
}

export const hasAllKantoMons = (state: DecompPokedexFlagState): boolean => {
  for (let i = 0; i < KANTO_DEX_COUNT - 1; i += 1) {
    if (!getSetPokedexFlag(state, i + 1, FLAG_GET_CAUGHT)) {
      return false;
    }
  }
  return true;
};

export function HasAllKantoMons(state: DecompPokedexFlagState): boolean {
  return hasAllKantoMons(state);
}

export const hasAllMons = (state: DecompPokedexFlagState): boolean => {
  for (let i = 0; i < KANTO_DEX_COUNT - 1; i += 1) {
    if (!getSetPokedexFlag(state, i + 1, FLAG_GET_CAUGHT)) {
      return false;
    }
  }

  for (let i = KANTO_DEX_COUNT; i < JOHTO_DEX_COUNT - 3; i += 1) {
    if (!getSetPokedexFlag(state, i + 1, FLAG_GET_CAUGHT)) {
      return false;
    }
  }

  for (let i = JOHTO_DEX_COUNT; i < nationalDexEntries.length - 2; i += 1) {
    if (!getSetPokedexFlag(state, i + 1, FLAG_GET_CAUGHT)) {
      return false;
    }
  }

  return true;
};

export function HasAllMons(state: DecompPokedexFlagState): boolean {
  return hasAllMons(state);
}

export const formatDexHeight = (heightDm: number): string => {
  const totalInches = Math.round((heightDm / 10) * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches.toString().padStart(2, '0')}"`;
};

export const formatDexWeight = (weightHg: number): string => `${(weightHg * 0.220462).toFixed(1)} lbs`;
