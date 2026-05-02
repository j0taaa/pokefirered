import easyChatGroupLifestyleSource from '../../../src/data/easy_chat/easy_chat_group_lifestyle.h?raw';

export interface EasyChatLifestyleWord {
  symbol: string;
  text: string;
}

export interface EasyChatLifestyleEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_LIFESTYLE_SOURCE = easyChatGroupLifestyleSource;

const parseWords = (source: string): EasyChatLifestyleWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_LIFESTYLE_WORDS = parseWords(easyChatGroupLifestyleSource);

const wordTextBySymbol = new Map(EASY_CHAT_LIFESTYLE_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupLifestyle = (source: string): EasyChatLifestyleEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Lifestyle = parseEasyChatGroupLifestyle(easyChatGroupLifestyleSource);

export const getEasyChatLifestyleWord = (symbol: string): EasyChatLifestyleEntry | undefined =>
  sEasyChatGroup_Lifestyle.find((entry) => entry.textSymbol === symbol);
