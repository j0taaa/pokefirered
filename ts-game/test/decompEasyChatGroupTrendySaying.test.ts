import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_TRENDY_SAYING_SOURCE,
  EASY_CHAT_TRENDY_SAYING_WORDS,
  getEasyChatTrendySayingWord,
  sEasyChatGroup_TrendySaying
} from '../src/game/decompEasyChatGroupTrendySaying';

describe('decomp easy chat group trendy saying', () => {
  test('parses every trendy saying word string in source order', () => {
    expect(EASY_CHAT_GROUP_TRENDY_SAYING_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_TrendySaying[]');
    expect(EASY_CHAT_TRENDY_SAYING_WORDS).toHaveLength(33);
    expect(EASY_CHAT_TRENDY_SAYING_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_KthxBye', text: 'KTHX, BYE.' },
      { symbol: 'sEasyChatWord_YesSirExcl', text: 'YES, SIR!' },
      { symbol: 'sEasyChatWord_AvantGarde', text: 'AVANT GARDE' },
      { symbol: 'sEasyChatWord_Couple', text: 'COUPLE' },
      { symbol: 'sEasyChatWord_MuchObliged', text: 'MUCH OBLIGED' }
    ]);
  });

  test('preserves all-disabled entries and alphabetical ordering values', () => {
    expect(sEasyChatGroup_TrendySaying).toHaveLength(33);
    expect(sEasyChatGroup_TrendySaying.every((entry) => !entry.enabled)).toBe(true);
    expect(getEasyChatTrendySayingWord('sEasyChatWord_1HitKOExcl')).toEqual({
      textSymbol: 'sEasyChatWord_1HitKOExcl',
      text: '1-HIT KO!',
      alphabeticalOrder: 26,
      enabled: false
    });
    expect(sEasyChatGroup_TrendySaying.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Ugly',
      text: 'UGLY',
      alphabeticalOrder: 31,
      enabled: false
    });
  });
});
