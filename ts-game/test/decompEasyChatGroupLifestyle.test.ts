import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_LIFESTYLE_SOURCE,
  EASY_CHAT_LIFESTYLE_WORDS,
  getEasyChatLifestyleWord,
  sEasyChatGroup_Lifestyle
} from '../src/game/decompEasyChatGroupLifestyle';

describe('decomp easy chat group lifestyle', () => {
  test('parses every lifestyle word string in source order', () => {
    expect(EASY_CHAT_GROUP_LIFESTYLE_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Lifestyle[]');
    expect(EASY_CHAT_LIFESTYLE_WORDS).toHaveLength(45);
    expect(EASY_CHAT_LIFESTYLE_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Chores', text: 'CHORES' },
      { symbol: 'sEasyChatWord_Home', text: 'HOME' },
      { symbol: 'sEasyChatWord_Money', text: 'MONEY' },
      { symbol: 'sEasyChatWord_Allowance', text: 'ALLOWANCE' },
      { symbol: 'sEasyChatWord_Bath', text: 'BATH' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Lifestyle).toHaveLength(45);
    expect(sEasyChatGroup_Lifestyle.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatLifestyleWord('sEasyChatWord_DeptStore')).toEqual({
      textSymbol: 'sEasyChatWord_DeptStore',
      text: 'DEPT. STORE',
      alphabeticalOrder: 33,
      enabled: true
    });
    expect(sEasyChatGroup_Lifestyle.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_World',
      text: 'WORLD',
      alphabeticalOrder: 44,
      enabled: true
    });
  });
});
