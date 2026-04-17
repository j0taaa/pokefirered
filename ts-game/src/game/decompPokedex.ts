import pokedexEntriesSource from '../../../src/data/pokemon/pokedex_entries.h?raw';
import pokedexTextSource from '../../../src/data/pokemon/pokedex_text_fr.h?raw';

export interface DecompPokedexEntry {
  species: string;
  nationalDexNumber: number;
  category: string;
  heightDm: number;
  weightHg: number;
  description: string;
}

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

const parsePokedexEntries = (entriesSource: string, textSource: string): Map<string, DecompPokedexEntry> => {
  const textMap = parsePokedexTexts(textSource);
  const entries = new Map<string, DecompPokedexEntry>();
  const entryRegex = /\[NATIONAL_DEX_(\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/gu;
  let nationalDexNumber = 0;

  for (const match of entriesSource.matchAll(entryRegex)) {
    nationalDexNumber += 1;
    const species = normalizeSpecies(match[1]);
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

const decompPokedexEntries = parsePokedexEntries(pokedexEntriesSource, pokedexTextSource);

export const getDecompPokedexEntry = (species: string): DecompPokedexEntry | null =>
  decompPokedexEntries.get(normalizeSpecies(species)) ?? null;

export const getNationalDexNumber = (species: string): number | null =>
  getDecompPokedexEntry(species)?.nationalDexNumber ?? null;

export const getNationalDexSpecies = (): string[] =>
  [...decompPokedexEntries.values()]
    .sort((left, right) => left.nationalDexNumber - right.nationalDexNumber)
    .map((entry) => entry.species);

export const formatDexHeight = (heightDm: number): string => {
  const totalInches = Math.round((heightDm / 10) * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches.toString().padStart(2, '0')}"`;
};

export const formatDexWeight = (weightHg: number): string => `${(weightHg * 0.220462).toFixed(1)} lbs`;
