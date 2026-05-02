import easyChatGroupActionsSource from '../../../src/data/easy_chat/easy_chat_group_actions.h?raw';

export interface EasyChatActionsWord {
  symbol: string;
  text: string;
}

export interface EasyChatActionsEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_ACTIONS_SOURCE = easyChatGroupActionsSource;

const parseWords = (source: string): EasyChatActionsWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_ACTIONS_WORDS = parseWords(easyChatGroupActionsSource);

const wordTextBySymbol = new Map(EASY_CHAT_ACTIONS_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupActions = (source: string): EasyChatActionsEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Actions = parseEasyChatGroupActions(easyChatGroupActionsSource);

export const getEasyChatActionsWord = (symbol: string): EasyChatActionsEntry | undefined =>
  sEasyChatGroup_Actions.find((entry) => entry.textSymbol === symbol);
