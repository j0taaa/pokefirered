import easyChatGroupAdjectivesSource from '../../../src/data/easy_chat/easy_chat_group_adjectives.h?raw';

export interface EasyChatAdjectivesWord {
  symbol: string;
  text: string;
}

export interface EasyChatAdjectivesEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_ADJECTIVES_SOURCE = easyChatGroupAdjectivesSource;

const parseWords = (source: string): EasyChatAdjectivesWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_ADJECTIVES_WORDS = parseWords(easyChatGroupAdjectivesSource);

const wordTextBySymbol = new Map(EASY_CHAT_ADJECTIVES_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupAdjectives = (source: string): EasyChatAdjectivesEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Adjectives = parseEasyChatGroupAdjectives(easyChatGroupAdjectivesSource);

export const getEasyChatAdjectivesWord = (symbol: string): EasyChatAdjectivesEntry | undefined =>
  sEasyChatGroup_Adjectives.find((entry) => entry.textSymbol === symbol);
