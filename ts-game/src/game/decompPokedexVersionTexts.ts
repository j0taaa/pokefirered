import pokedexTextFrSource from '../../../src/data/pokemon/pokedex_text_fr.h?raw';
import pokedexTextLgSource from '../../../src/data/pokemon/pokedex_text_lg.h?raw';

export type PokedexVersionTextId = 'FIRERED' | 'LEAFGREEN';

export interface PokedexTextDeclaration {
  symbol: string;
  text: string;
  unused: boolean;
}

export const POKEDEX_TEXT_FR_SOURCE = pokedexTextFrSource;
export const POKEDEX_TEXT_LG_SOURCE = pokedexTextLgSource;

export const parsePokedexTextDeclarations = (source: string): PokedexTextDeclaration[] =>
  [...source.matchAll(/^const\s+u8\s+(\w+)\[\]\s*=\s*_\(([\s\S]*?)\);/gmu)].map((match) => ({
    symbol: match[1],
    text: [...match[2].matchAll(/"([\s\S]*?)"/gu)].map((part) => part[1]).join(''),
    unused: match[1].endsWith('Unused')
  }));

export const POKEDEX_TEXTS_BY_VERSION: Record<PokedexVersionTextId, readonly PokedexTextDeclaration[]> = {
  FIRERED: parsePokedexTextDeclarations(pokedexTextFrSource),
  LEAFGREEN: parsePokedexTextDeclarations(pokedexTextLgSource)
};

export const getPokedexTextDeclaration = (
  version: PokedexVersionTextId,
  symbol: string
): PokedexTextDeclaration | undefined =>
  POKEDEX_TEXTS_BY_VERSION[version].find((entry) => entry.symbol === symbol);
