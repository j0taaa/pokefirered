import easyChatGroupTrendySayingSource from '../../../src/data/easy_chat/easy_chat_group_trendy_saying.h?raw';

export interface EasyChatTrendySayingWord {
  symbol: string;
  text: string;
}

export interface EasyChatTrendySayingEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_TRENDY_SAYING_SOURCE = easyChatGroupTrendySayingSource;

const parseWords = (source: string): EasyChatTrendySayingWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_TRENDY_SAYING_WORDS = parseWords(easyChatGroupTrendySayingSource);

const wordTextBySymbol = new Map(EASY_CHAT_TRENDY_SAYING_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupTrendySaying = (source: string): EasyChatTrendySayingEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_TrendySaying = parseEasyChatGroupTrendySaying(easyChatGroupTrendySayingSource);

export const getEasyChatTrendySayingWord = (symbol: string): EasyChatTrendySayingEntry | undefined =>
  sEasyChatGroup_TrendySaying.find((entry) => entry.textSymbol === symbol);
