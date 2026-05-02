import easyChatGroupTimeSource from '../../../src/data/easy_chat/easy_chat_group_time.h?raw';

export interface EasyChatTimeWord {
  symbol: string;
  text: string;
}

export interface EasyChatTimeEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_TIME_SOURCE = easyChatGroupTimeSource;

const parseWords = (source: string): EasyChatTimeWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_TIME_WORDS = parseWords(easyChatGroupTimeSource);

const wordTextBySymbol = new Map(EASY_CHAT_TIME_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupTime = (source: string): EasyChatTimeEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Time = parseEasyChatGroupTime(easyChatGroupTimeSource);

export const getEasyChatTimeWord = (symbol: string): EasyChatTimeEntry | undefined =>
  sEasyChatGroup_Time.find((entry) => entry.textSymbol === symbol);
