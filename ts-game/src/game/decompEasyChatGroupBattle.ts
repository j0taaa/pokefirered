import easyChatGroupBattleSource from '../../../src/data/easy_chat/easy_chat_group_battle.h?raw';

export interface EasyChatBattleWord {
  symbol: string;
  text: string;
}

export interface EasyChatBattleEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_BATTLE_SOURCE = easyChatGroupBattleSource;

const parseWords = (source: string): EasyChatBattleWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_BATTLE_WORDS = parseWords(easyChatGroupBattleSource);

const wordTextBySymbol = new Map(EASY_CHAT_BATTLE_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupBattle = (source: string): EasyChatBattleEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Battle = parseEasyChatGroupBattle(easyChatGroupBattleSource);

export const getEasyChatBattleWord = (symbol: string): EasyChatBattleEntry | undefined =>
  sEasyChatGroup_Battle.find((entry) => entry.textSymbol === symbol);
