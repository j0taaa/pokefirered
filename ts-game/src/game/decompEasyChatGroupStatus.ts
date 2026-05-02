import easyChatGroupStatusSource from '../../../src/data/easy_chat/easy_chat_group_status.h?raw';

export interface EasyChatStatusWord {
  symbol: string;
  text: string;
}

export interface EasyChatStatusEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_STATUS_SOURCE = easyChatGroupStatusSource;

const parseWords = (source: string): EasyChatStatusWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_STATUS_WORDS = parseWords(easyChatGroupStatusSource);

const wordTextBySymbol = new Map(EASY_CHAT_STATUS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupStatus = (source: string): EasyChatStatusEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Status = parseEasyChatGroupStatus(easyChatGroupStatusSource);

export const getEasyChatStatusWord = (symbol: string): EasyChatStatusEntry | undefined =>
  sEasyChatGroup_Status.find((entry) => entry.textSymbol === symbol);
