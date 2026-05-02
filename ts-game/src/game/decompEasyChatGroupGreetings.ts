import easyChatGroupGreetingsSource from '../../../src/data/easy_chat/easy_chat_group_greetings.h?raw';

export interface EasyChatGreetingsWord {
  symbol: string;
  text: string;
}

export interface EasyChatGreetingsEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_GREETINGS_SOURCE = easyChatGroupGreetingsSource;

const parseWords = (source: string): EasyChatGreetingsWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_GREETINGS_WORDS = parseWords(easyChatGroupGreetingsSource);

const wordTextBySymbol = new Map(EASY_CHAT_GREETINGS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupGreetings = (source: string): EasyChatGreetingsEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Greetings = parseEasyChatGroupGreetings(easyChatGroupGreetingsSource);

export const getEasyChatGreetingsWord = (symbol: string): EasyChatGreetingsEntry | undefined =>
  sEasyChatGroup_Greetings.find((entry) => entry.textSymbol === symbol);
