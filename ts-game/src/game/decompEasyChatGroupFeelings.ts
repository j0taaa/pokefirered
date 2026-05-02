import easyChatGroupFeelingsSource from '../../../src/data/easy_chat/easy_chat_group_feelings.h?raw';

export interface EasyChatFeelingsWord {
  symbol: string;
  text: string;
}

export interface EasyChatFeelingsEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_FEELINGS_SOURCE = easyChatGroupFeelingsSource;

const parseWords = (source: string): EasyChatFeelingsWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_FEELINGS_WORDS = parseWords(easyChatGroupFeelingsSource);

const wordTextBySymbol = new Map(EASY_CHAT_FEELINGS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupFeelings = (source: string): EasyChatFeelingsEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Feelings = parseEasyChatGroupFeelings(easyChatGroupFeelingsSource);

export const getEasyChatFeelingsWord = (symbol: string): EasyChatFeelingsEntry | undefined =>
  sEasyChatGroup_Feelings.find((entry) => entry.textSymbol === symbol);
