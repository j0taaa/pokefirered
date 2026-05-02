import easyChatGroupSpeechSource from '../../../src/data/easy_chat/easy_chat_group_speech.h?raw';

export interface EasyChatSpeechWord {
  symbol: string;
  text: string;
}

export interface EasyChatSpeechEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_SPEECH_SOURCE = easyChatGroupSpeechSource;

const parseWords = (source: string): EasyChatSpeechWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_SPEECH_WORDS = parseWords(easyChatGroupSpeechSource);

const wordTextBySymbol = new Map(EASY_CHAT_SPEECH_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupSpeech = (source: string): EasyChatSpeechEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Speech = parseEasyChatGroupSpeech(easyChatGroupSpeechSource);

export const getEasyChatSpeechWord = (symbol: string): EasyChatSpeechEntry | undefined =>
  sEasyChatGroup_Speech.find((entry) => entry.textSymbol === symbol);
