import easyChatGroupVoicesSource from '../../../src/data/easy_chat/easy_chat_group_voices.h?raw';

export interface EasyChatVoicesWord {
  symbol: string;
  text: string;
}

export interface EasyChatVoicesEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_VOICES_SOURCE = easyChatGroupVoicesSource;

const parseWords = (source: string): EasyChatVoicesWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_VOICES_WORDS = parseWords(easyChatGroupVoicesSource);

const wordTextBySymbol = new Map(EASY_CHAT_VOICES_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupVoices = (source: string): EasyChatVoicesEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Voices = parseEasyChatGroupVoices(easyChatGroupVoicesSource);

export const getEasyChatVoicesWord = (symbol: string): EasyChatVoicesEntry | undefined =>
  sEasyChatGroup_Voices.find((entry) => entry.textSymbol === symbol);
