import abilitiesSource from '../../../src/data/text/abilities.h?raw';

export interface AbilityDescriptionEntry {
  symbol: string;
  description: string;
}

export interface AbilityDescriptionPointerEntry {
  ability: string;
  descriptionSymbol: string;
  description: string;
}

export interface AbilityNameEntry {
  ability: string;
  name: string;
}

export const ABILITY_TEXT_SOURCE = abilitiesSource;

export const parseAbilityDescriptions = (source: string): AbilityDescriptionEntry[] =>
  [...source.matchAll(/static const u8 (s\w+Description)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    description: match[2]
  }));

export const ABILITY_DESCRIPTIONS = parseAbilityDescriptions(abilitiesSource);

const descriptionBySymbol = new Map(ABILITY_DESCRIPTIONS.map((entry) => [entry.symbol, entry.description]));

export const parseAbilityDescriptionPointers = (source: string): AbilityDescriptionPointerEntry[] =>
  [...source.matchAll(/\[(ABILITY_\w+)\]\s*=\s*(s\w+Description)/gu)].map((match) => ({
    ability: match[1],
    descriptionSymbol: match[2],
    description: descriptionBySymbol.get(match[2]) ?? ''
  }));

export const gAbilityDescriptionPointers = parseAbilityDescriptionPointers(abilitiesSource);

export const parseAbilityNames = (source: string): AbilityNameEntry[] => {
  const block = source.match(/const u8 gAbilityNames\[ABILITIES_COUNT\]\[ABILITY_NAME_LENGTH \+ 1\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...block.matchAll(/\[(ABILITY_\w+)\]\s*=\s*_\("([\s\S]*?)"\)/gu)].map((match) => ({
    ability: match[1],
    name: match[2]
  }));
};

export const gAbilityNames = parseAbilityNames(abilitiesSource);

export const getAbilityName = (ability: string): string | undefined =>
  gAbilityNames.find((entry) => entry.ability === ability)?.name;

export const getAbilityDescription = (ability: string): string | undefined =>
  gAbilityDescriptionPointers.find((entry) => entry.ability === ability)?.description;
