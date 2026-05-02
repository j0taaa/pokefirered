import easyChatGroupTrainerSource from '../../../src/data/easy_chat/easy_chat_group_trainer.h?raw';

export interface EasyChatTrainerWord {
  symbol: string;
  text: string;
}

export interface EasyChatTrainerEntry {
  textSymbol: string;
  text: string;
  alphabeticalOrder: number;
  enabled: boolean;
}

export const EASY_CHAT_GROUP_TRAINER_SOURCE = easyChatGroupTrainerSource;

const parseWords = (source: string): EasyChatTrainerWord[] =>
  [...source.matchAll(/static const u8 (sEasyChatWord_\w+)\[\]\s*=\s*_\("([\s\S]*?)"\);/gu)].map((match) => ({
    symbol: match[1],
    text: match[2]
  }));

export const EASY_CHAT_TRAINER_WORDS = parseWords(easyChatGroupTrainerSource);

const wordTextBySymbol = new Map(EASY_CHAT_TRAINER_WORDS.map((word) => [word.symbol, word.text]));

export const parseEasyChatGroupTrainer = (source: string): EasyChatTrainerEntry[] =>
  [...source.matchAll(/\.text = (sEasyChatWord_\w+),\s*\.alphabeticalOrder = (\d+),\s*\.enabled = (TRUE|FALSE)/gu)].map((match) => ({
    textSymbol: match[1],
    text: wordTextBySymbol.get(match[1]) ?? '',
    alphabeticalOrder: Number.parseInt(match[2], 10),
    enabled: match[3] === 'TRUE'
  }));

export const sEasyChatGroup_Trainer = parseEasyChatGroupTrainer(easyChatGroupTrainerSource);

export const getEasyChatTrainerWord = (symbol: string): EasyChatTrainerEntry | undefined =>
  sEasyChatGroup_Trainer.find((entry) => entry.textSymbol === symbol);
