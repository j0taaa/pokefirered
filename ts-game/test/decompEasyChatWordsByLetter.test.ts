import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_WORDS_BY_LETTER_BUCKETS,
  EASY_CHAT_WORDS_BY_LETTER_SOURCE,
  getEasyChatWordsByLetterBucket,
  parseEasyChatWordsByLetterBuckets,
  parseEasyChatWordsByLetterPointers,
  sEasyChatWordsByLetterPointers
} from '../src/game/decompEasyChatWordsByLetter';

describe('decomp easy chat words by letter', () => {
  test('parses every letter bucket and pointer row from the source', () => {
    expect(EASY_CHAT_WORDS_BY_LETTER_SOURCE).toContain('#include "easy_chat.h"');
    expect(parseEasyChatWordsByLetterBuckets(EASY_CHAT_WORDS_BY_LETTER_SOURCE)).toEqual(
      EASY_CHAT_WORDS_BY_LETTER_BUCKETS
    );
    expect(parseEasyChatWordsByLetterPointers(EASY_CHAT_WORDS_BY_LETTER_SOURCE)).toEqual(
      sEasyChatWordsByLetterPointers
    );
    expect(EASY_CHAT_WORDS_BY_LETTER_BUCKETS).toHaveLength(27);
    expect(sEasyChatWordsByLetterPointers).toHaveLength(27);
    expect(EASY_CHAT_WORDS_BY_LETTER_BUCKETS.reduce((sum, bucket) => sum + bucket.tokens.length, 0)).toBe(1949);
  });

  test('preserves representative bucket contents and doubled-species markers', () => {
    expect(EASY_CHAT_WORDS_BY_LETTER_BUCKETS[0]).toEqual({
      symbol: 'sEasyChatWordsByLetter_Others',
      tokens: [
        'EC_WORD_EXCL',
        'EC_WORD_EXCL_EXCL',
        'EC_WORD_DASH',
        'EC_WORD_DASH_DASH_DASH',
        'EC_WORD_ELLIPSIS',
        'EC_WORD_ELLIPSIS_EXCL',
        'EC_WORD_ELLIPSIS_ELLIPSIS_ELLIPSIS',
        'EC_WORD_1_HIT_KO_EXCL',
        'EC_WORD_QUES',
        'EC_WORD_QUES_EXCL'
      ]
    });
    expect(getEasyChatWordsByLetterBucket('sEasyChatWordsByLetter_Z')).toEqual({
      symbol: 'sEasyChatWordsByLetter_Z',
      tokens: [
        'EC_POKEMON2(ZANGOOSE)',
        'EC_MOVE2(ZAP_CANNON)',
        'EC_POKEMON(ZAPDOS)',
        'EC_POKEMON2(ZIGZAGOON)',
        '-1',
        '2',
        'EC_POKEMON2(ZUBAT)',
        'EC_POKEMON(ZUBAT)'
      ]
    });
  });

  test('keeps pointer counts matching the exact token count in each bucket', () => {
    const bucketsBySymbol = new Map(EASY_CHAT_WORDS_BY_LETTER_BUCKETS.map((bucket) => [bucket.symbol, bucket]));
    expect(sEasyChatWordsByLetterPointers[1]).toEqual({
      words: 'sEasyChatWordsByLetter_A',
      numWords: 106
    });
    expect(sEasyChatWordsByLetterPointers.at(-1)).toEqual({
      words: 'sEasyChatWordsByLetter_Z',
      numWords: 8
    });
    for (const pointer of sEasyChatWordsByLetterPointers) {
      expect(bucketsBySymbol.get(pointer.words)?.tokens).toHaveLength(pointer.numWords);
    }
  });
});
