import easyChatGroupEndingsSource from '../../../src/data/easy_chat/easy_chat_group_endings.h?raw';

export interface EasyChatEndingsWord {
  symbol: string;
  text: string;
}

export interface EasyChatEndingsEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_ENDINGS_SOURCE = easyChatGroupEndingsSource;

const parseWords = (source: string): EasyChatEndingsWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_ENDINGS_WORDS = parseWords(easyChatGroupEndingsSource);

const wordTextBySymbol = new Map(EASY_CHAT_ENDINGS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupEndings = (source: string): EasyChatEndingsEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Endings = parseEasyChatGroupEndings(easyChatGroupEndingsSource);

export const getEasyChatEndingsWord = (symbol: string): EasyChatEndingsEntry | undefined =>
  sEasyChatGroup_Endings.find((entry) => entry.textSymbol === symbol);
