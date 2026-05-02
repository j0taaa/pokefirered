import easyChatGroupMiscSource from '../../../src/data/easy_chat/easy_chat_group_misc.h?raw';

export interface EasyChatMiscWord {
  symbol: string;
  text: string;
}

export interface EasyChatMiscEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_MISC_SOURCE = easyChatGroupMiscSource;

const parseWords = (source: string): EasyChatMiscWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_MISC_WORDS = parseWords(easyChatGroupMiscSource);

const wordTextBySymbol = new Map(EASY_CHAT_MISC_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupMisc = (source: string): EasyChatMiscEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Misc = parseEasyChatGroupMisc(easyChatGroupMiscSource);

export const getEasyChatMiscWord = (symbol: string): EasyChatMiscEntry | undefined =>
  sEasyChatGroup_Misc.find((entry) => entry.textSymbol === symbol);
