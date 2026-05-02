import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_MISC_SOURCE,
  EASY_CHAT_MISC_WORDS,
  getEasyChatMiscWord,
  sEasyChatGroup_Misc
} from '../src/game/decompEasyChatGroupMisc';

describe('decomp easy chat group misc', () => {
  test('parses every misc word string in source order', () => {
    expect(EASY_CHAT_GROUP_MISC_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Misc[]');
    expect(EASY_CHAT_MISC_WORDS).toHaveLength(42);
    expect(EASY_CHAT_MISC_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Highs', text: 'HIGHS' },
      { symbol: 'sEasyChatWord_Lows', text: 'LOWS' },
      { symbol: 'sEasyChatWord_Um', text: 'UM' },
      { symbol: 'sEasyChatWord_Rear', text: 'REAR' },
      { symbol: 'sEasyChatWord_Things', text: 'THINGS' }
    ]);
  });

  test('preserves all enabled flags and punctuation text', () => {
    expect(sEasyChatGroup_Misc).toHaveLength(42);
    expect(sEasyChatGroup_Misc.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatMiscWord('sEasyChatWord_ThatsItExcl')).toEqual({
      textSymbol: 'sEasyChatWord_ThatsItExcl',
      text: "THAT'S IT!",
      alphabeticalOrder: 41,
      enabled: true
    });
    expect(sEasyChatGroup_Misc.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Right',
      text: 'RIGHT',
      alphabeticalOrder: 37,
      enabled: true
    });
  });
});
