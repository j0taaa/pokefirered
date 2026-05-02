import wildEncountersTemplateSource from '../../../src/data/wild_encounters.json.txt?raw';

export interface WildEncountersTemplateMetadata {
  directives: string[];
  structDeclarations: string[];
  infoDeclarations: string[];
  headerFields: string[];
}

export const WILD_ENCOUNTERS_TEMPLATE_SOURCE = wildEncountersTemplateSource;

export const parseWildEncountersTemplateMetadata = (source: string): WildEncountersTemplateMetadata => ({
  directives: [...source.matchAll(/^##\s*(.+)$/gmu)].map((match) => match[1]),
  structDeclarations: [
    ...source.matchAll(/^const struct (WildPokemon|WildPokemonHeader)\s+(.+?)(?:\[\])?\s*=/gmu)
  ].map((match) => `${match[1]} ${match[2].trim()}`),
  infoDeclarations: [...source.matchAll(/const struct WildPokemonInfo ([^=\n]+)=/gu)].map((match) =>
    match[1].trim()
  ),
  headerFields: [...source.matchAll(/^\s+\.([A-Za-z0-9_]+)\s*=/gmu)].map((match) => match[1])
});

export const WILD_ENCOUNTERS_TEMPLATE_METADATA =
  parseWildEncountersTemplateMetadata(wildEncountersTemplateSource);
