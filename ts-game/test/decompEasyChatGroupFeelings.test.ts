import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_FEELINGS_WORDS,
  EASY_CHAT_GROUP_FEELINGS_SOURCE,
  getEasyChatFeelingsWord,
  sEasyChatGroup_Feelings
} from '../src/game/decompEasyChatGroupFeelings';

describe('decomp easy chat group feelings', () => {
  test('parses every feelings word string in source order', () => {
    expect(EASY_CHAT_GROUP_FEELINGS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Feelings[]');
    expect(EASY_CHAT_FEELINGS_WORDS).toHaveLength(69);
    expect(EASY_CHAT_FEELINGS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Meet', text: 'MEET' },
      { symbol: 'sEasyChatWord_Play', text: 'PLAY' },
      { symbol: 'sEasyChatWord_Hurried', text: 'HURRIED' },
      { symbol: 'sEasyChatWord_Goes', text: 'GOES' },
      { symbol: 'sEasyChatWord_Giddy', text: 'GIDDY' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Feelings).toHaveLength(69);
    expect(sEasyChatGroup_Feelings.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatFeelingsWord('sEasyChatWord_AllRight')).toEqual({
      textSymbol: 'sEasyChatWord_AllRight',
      text: 'ALL RIGHT',
      alphabeticalOrder: 8,
      enabled: true
    });
    expect(sEasyChatGroup_Feelings.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Understands',
      text: 'UNDERSTANDS',
      alphabeticalOrder: 20,
      enabled: true
    });
  });
});
