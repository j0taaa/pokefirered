import pokedexTextSource from '../../../src/data/pokemon/pokedex_text.h?raw';

export const POKEDEX_TEXT_INCLUDE_SOURCE = pokedexTextSource;

export const POKEDEX_TEXT_VERSION_INCLUDES = {
  FIRERED: 'pokedex_text_fr.h',
  LEAFGREEN: 'pokedex_text_lg.h'
} as const;

export type PokedexTextVersion = keyof typeof POKEDEX_TEXT_VERSION_INCLUDES;

export const getPokedexTextIncludeForVersion = (version: PokedexTextVersion): string =>
  POKEDEX_TEXT_VERSION_INCLUDES[version];
