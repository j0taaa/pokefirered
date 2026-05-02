import easyChatGroupHobbiesSource from '../../../src/data/easy_chat/easy_chat_group_hobbies.h?raw';

export interface EasyChatHobbiesWord {
  symbol: string;
  text: string;
}

export interface EasyChatHobbiesEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_HOBBIES_SOURCE = easyChatGroupHobbiesSource;

const parseWords = (source: string): EasyChatHobbiesWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_HOBBIES_WORDS = parseWords(easyChatGroupHobbiesSource);

const wordTextBySymbol = new Map(EASY_CHAT_HOBBIES_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupHobbies = (source: string): EasyChatHobbiesEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Hobbies = parseEasyChatGroupHobbies(easyChatGroupHobbiesSource);

export const getEasyChatHobbiesWord = (symbol: string): EasyChatHobbiesEntry | undefined =>
  sEasyChatGroup_Hobbies.find((entry) => entry.textSymbol === symbol);
