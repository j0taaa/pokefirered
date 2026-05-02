import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_TIME_SOURCE,
  EASY_CHAT_TIME_WORDS,
  getEasyChatTimeWord,
  sEasyChatGroup_Time
} from '../src/game/decompEasyChatGroupTime';

describe('decomp easy chat group time', () => {
  test('parses every time word string in source order', () => {
    expect(EASY_CHAT_GROUP_TIME_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Time[]');
    expect(EASY_CHAT_TIME_WORDS).toHaveLength(45);
    expect(EASY_CHAT_TIME_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Fall', text: 'FALL' },
      { symbol: 'sEasyChatWord_Morning', text: 'MORNING' },
      { symbol: 'sEasyChatWord_Tomorrow', text: 'TOMORROW' },
      { symbol: 'sEasyChatWord_Last', text: 'LAST' },
      { symbol: 'sEasyChatWord_Day', text: 'DAY' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Time).toHaveLength(45);
    expect(sEasyChatGroup_Time.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatTimeWord('sEasyChatWord_Nighttime')).toEqual({
      textSymbol: 'sEasyChatWord_Nighttime',
      text: 'NIGHTTIME',
      alphabeticalOrder: 44,
      enabled: true
    });
    expect(sEasyChatGroup_Time.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Week',
      text: 'WEEK',
      alphabeticalOrder: 12,
      enabled: true
    });
  });
});
