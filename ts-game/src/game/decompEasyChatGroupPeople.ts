import easyChatGroupPeopleSource from '../../../src/data/easy_chat/easy_chat_group_people.h?raw';

export interface EasyChatPeopleWord {
  symbol: string;
  text: string;
}

export interface EasyChatPeopleEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_PEOPLE_SOURCE = easyChatGroupPeopleSource;

const parseWords = (source: string): EasyChatPeopleWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_PEOPLE_WORDS = parseWords(easyChatGroupPeopleSource);

const wordTextBySymbol = new Map(EASY_CHAT_PEOPLE_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupPeople = (source: string): EasyChatPeopleEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_People = parseEasyChatGroupPeople(easyChatGroupPeopleSource);

export const getEasyChatPeopleWord = (symbol: string): EasyChatPeopleEntry | undefined =>
  sEasyChatGroup_People.find((entry) => entry.textSymbol === symbol);
