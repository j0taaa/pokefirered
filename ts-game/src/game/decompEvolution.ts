import evolutionSource from '../../../src/data/pokemon/evolution.h?raw';
import type { BattlePokemonSnapshot } from './battle';

export interface DecompEvolutionRule {
  method: string;
  parameter: number;
  targetSpecies: string;
}

export interface RawDecompEvolutionRule {
  method: string;
  parameterToken: string;
  targetSpecies: string;
}

export interface RawDecompEvolutionEntry {
  species: string;
  rules: RawDecompEvolutionRule[];
}

export const EVOLUTION_SOURCE = evolutionSource;

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

export const parseRawEvolutionTable = (source: string): RawDecompEvolutionEntry[] => {
  const entries: RawDecompEvolutionEntry[] = [];
  const entryRegex = /\[SPECIES_(\w+)\]\s*=\s*\{\{([\s\S]*?)\}\},?/gu;
  const ruleRegex = /(?:\{)?(EVO_[A-Z0-9_]+),\s*([^,]+),\s*SPECIES_([A-Z0-9_]+)(?:\})?/gu;

  for (const match of source.matchAll(entryRegex)) {
    entries.push({
      species: `SPECIES_${match[1]}`,
      rules: [...match[2].matchAll(ruleRegex)].map((ruleMatch) => ({
        method: ruleMatch[1],
        parameterToken: ruleMatch[2].trim(),
        targetSpecies: `SPECIES_${ruleMatch[3]}`
      }))
    });
  }

  return entries;
};

export const gEvolutionTable = parseRawEvolutionTable(evolutionSource);

const parseEvolutionTable = (): Map<string, DecompEvolutionRule[]> => {
  const rules = new Map<string, DecompEvolutionRule[]>();
  const entryRegex = /\[SPECIES_(\w+)\]\s*=\s*\{\{([\s\S]*?)\}\},?/gu;
  const ruleRegex = /(?:\{)?(EVO_[A-Z0-9_]+),\s*([^,]+),\s*SPECIES_([A-Z0-9_]+)(?:\})?/gu;

  for (const match of evolutionSource.matchAll(entryRegex)) {
    const species = normalizeSpecies(match[1]);
    const ruleList: DecompEvolutionRule[] = [];

    for (const ruleMatch of match[2].matchAll(ruleRegex)) {
      ruleList.push({
        method: ruleMatch[1],
        parameter: Number.parseInt(ruleMatch[2], 10) || 0,
        targetSpecies: normalizeSpecies(ruleMatch[3])
      });
    }

    if (ruleList.length > 0) {
      rules.set(species, ruleList);
    }
  }

  return rules;
};

const evolutionTable = parseEvolutionTable();

export const getDecompEvolutionRules = (species: string): DecompEvolutionRule[] =>
  evolutionTable.get(normalizeSpecies(species))?.map((rule) => ({ ...rule })) ?? [];

export const getRawDecompEvolutionRules = (species: string): RawDecompEvolutionRule[] =>
  gEvolutionTable.find((entry) => entry.species === `SPECIES_${normalizeSpecies(species)}`)?.rules.map((rule) => ({ ...rule })) ?? [];

export const getLevelEvolutionCandidate = (
  pokemon: Pick<BattlePokemonSnapshot, 'species' | 'level' | 'attack' | 'defense'>
): string | null => {
  const rules = evolutionTable.get(normalizeSpecies(pokemon.species)) ?? [];

  for (const rule of rules) {
    switch (rule.method) {
      case 'EVO_LEVEL':
        if (pokemon.level >= rule.parameter) {
          return rule.targetSpecies;
        }
        break;
      case 'EVO_LEVEL_ATK_GT_DEF':
        if (pokemon.level >= rule.parameter && pokemon.attack > pokemon.defense) {
          return rule.targetSpecies;
        }
        break;
      case 'EVO_LEVEL_ATK_EQ_DEF':
        if (pokemon.level >= rule.parameter && pokemon.attack === pokemon.defense) {
          return rule.targetSpecies;
        }
        break;
      case 'EVO_LEVEL_ATK_LT_DEF':
        if (pokemon.level >= rule.parameter && pokemon.attack < pokemon.defense) {
          return rule.targetSpecies;
        }
        break;
      default:
        break;
    }
  }

  return null;
};
