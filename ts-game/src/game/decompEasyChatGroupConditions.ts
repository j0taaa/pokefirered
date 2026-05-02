import easyChatGroupConditionsSource from '../../../src/data/easy_chat/easy_chat_group_conditions.h?raw';

export interface EasyChatConditionsWord {
  symbol: string;
  text: string;
}

export interface EasyChatConditionsEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_CONDITIONS_SOURCE = easyChatGroupConditionsSource;

const parseWords = (source: string): EasyChatConditionsWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_CONDITIONS_WORDS = parseWords(easyChatGroupConditionsSource);

const wordTextBySymbol = new Map(EASY_CHAT_CONDITIONS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupConditions = (source: string): EasyChatConditionsEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Conditions = parseEasyChatGroupConditions(easyChatGroupConditionsSource);

export const getEasyChatConditionsWord = (symbol: string): EasyChatConditionsEntry | undefined =>
  sEasyChatGroup_Conditions.find((entry) => entry.textSymbol === symbol);
