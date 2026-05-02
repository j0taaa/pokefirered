import easyChatGroupEventsSource from '../../../src/data/easy_chat/easy_chat_group_events.h?raw';

export interface EasyChatEventsWord {
  symbol: string;
  text: string;
}

export interface EasyChatEventsEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_EVENTS_SOURCE = easyChatGroupEventsSource;

const parseWords = (source: string): EasyChatEventsWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_EVENTS_WORDS = parseWords(easyChatGroupEventsSource);

const wordTextBySymbol = new Map(EASY_CHAT_EVENTS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupEvents = (source: string): EasyChatEventsEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Events = parseEasyChatGroupEvents(easyChatGroupEventsSource);

export const getEasyChatEventsWord = (symbol: string): EasyChatEventsEntry | undefined =>
  sEasyChatGroup_Events.find((entry) => entry.textSymbol === symbol);
