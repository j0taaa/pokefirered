import easyChatGroupPokemonSource from '../../../src/data/easy_chat/easy_chat_group_pokemon.h?raw';

export const EASY_CHAT_GROUP_POKEMON_SOURCE = easyChatGroupPokemonSource;

export const parseEasyChatGroupPokemon = (source: string): string[] => {
  const block = source.match(/static const u16 sEasyChatGroup_Pokemon\[\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...block.matchAll(/\b(SPECIES_\w+)\b/gu)].map((match) => match[1]);
};

export const sEasyChatGroup_Pokemon = parseEasyChatGroupPokemon(easyChatGroupPokemonSource);
