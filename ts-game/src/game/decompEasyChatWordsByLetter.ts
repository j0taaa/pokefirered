import easyChatWordsByLetterSource from '../../../src/data/easy_chat/easy_chat_words_by_letter.h?raw';

export interface EasyChatWordsByLetterBucket {
  symbol: string;
  tokens: string[];
}

export interface EasyChatWordsByLetterPointer {
  words: string;
  numWords: number;
}

export const EASY_CHAT_WORDS_BY_LETTER_SOURCE = easyChatWordsByLetterSource;

export const parseEasyChatWordsByLetterBuckets = (source: string): EasyChatWordsByLetterBucket[] =>
  [...source.matchAll(/^static const u16 (sEasyChatWordsByLetter_\w+)\[\]\s*=\s*\{([\s\S]*?)^\};/gmu)].map(
    (match) => ({
      symbol: match[1],
      tokens: [
        ...match[2]
          .replace(/\/\/.*$/gmu, '')
          .matchAll(/EC_\w+\([^)]*\)|EC_WORD_\w+|-?\d+/gu)
      ].map((token) => token[0])
    })
  );

export const parseEasyChatWordsByLetterPointers = (source: string): EasyChatWordsByLetterPointer[] =>
  [...source.matchAll(/\{\s*\.words = (sEasyChatWordsByLetter_\w+),\s*\.numWords = (\d+),\s*\}/gu)].map(
    (match) => ({
      words: match[1],
      numWords: Number.parseInt(match[2], 10)
    })
  );

export const EASY_CHAT_WORDS_BY_LETTER_BUCKETS =
  parseEasyChatWordsByLetterBuckets(easyChatWordsByLetterSource);

export const sEasyChatWordsByLetterPointers =
  parseEasyChatWordsByLetterPointers(easyChatWordsByLetterSource);

export const getEasyChatWordsByLetterBucket = (symbol: string): EasyChatWordsByLetterBucket | undefined =>
  EASY_CHAT_WORDS_BY_LETTER_BUCKETS.find((bucket) => bucket.symbol === symbol);
