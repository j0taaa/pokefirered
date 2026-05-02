import easyChatGroupPokemon2Source from '../../../src/data/easy_chat/easy_chat_group_pokemon2.h?raw';

export const EASY_CHAT_GROUP_POKEMON2_SOURCE = easyChatGroupPokemon2Source;

export const parseEasyChatGroupPokemon2 = (source: string): string[] => {
  const block = source.match(/static const u16 sEasyChatGroup_Pokemon2\[\]\s*=\s*\{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...block.matchAll(/\b(SPECIES_\w+)\b/gu)].map((match) => match[1]);
};

export const sEasyChatGroup_Pokemon2 = parseEasyChatGroupPokemon2(easyChatGroupPokemon2Source);
