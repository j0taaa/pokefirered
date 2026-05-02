import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_CONDITIONS_WORDS,
  EASY_CHAT_GROUP_CONDITIONS_SOURCE,
  getEasyChatConditionsWord,
  sEasyChatGroup_Conditions
} from '../src/game/decompEasyChatGroupConditions';

describe('decomp easy chat group conditions', () => {
  test('parses every conditions word string in source order', () => {
    expect(EASY_CHAT_GROUP_CONDITIONS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Conditions[]');
    expect(EASY_CHAT_CONDITIONS_WORDS).toHaveLength(69);
    expect(EASY_CHAT_CONDITIONS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Hot', text: 'HOT' },
      { symbol: 'sEasyChatWord_Exists', text: 'EXISTS' },
      { symbol: 'sEasyChatWord_Excess', text: 'EXCESS' },
      { symbol: 'sEasyChatWord_Approved', text: 'APPROVED' },
      { symbol: 'sEasyChatWord_Has', text: 'HAS' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Conditions).toHaveLength(69);
    expect(sEasyChatGroup_Conditions.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatConditionsWord('sEasyChatWord_NonStop')).toEqual({
      textSymbol: 'sEasyChatWord_NonStop',
      text: 'NON-STOP',
      alphabeticalOrder: 18,
      enabled: true
    });
    expect(sEasyChatGroup_Conditions.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Badly',
      text: 'BADLY',
      alphabeticalOrder: 64,
      enabled: true
    });
  });
});
