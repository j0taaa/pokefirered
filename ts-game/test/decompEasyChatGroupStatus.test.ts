import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_STATUS_SOURCE,
  EASY_CHAT_STATUS_WORDS,
  getEasyChatStatusWord,
  sEasyChatGroup_Status
} from '../src/game/decompEasyChatGroupStatus';

describe('decomp easy chat group status', () => {
  test('parses every status word string in source order', () => {
    expect(EASY_CHAT_GROUP_STATUS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Status[]');
    expect(EASY_CHAT_STATUS_WORDS).toHaveLength(109);
    expect(EASY_CHAT_STATUS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Dark', text: 'DARK' },
      { symbol: 'sEasyChatWord_Stench', text: 'STENCH' },
      { symbol: 'sEasyChatWord_ThickFat', text: 'THICK FAT' },
      { symbol: 'sEasyChatWord_RainDish', text: 'RAIN DISH' },
      { symbol: 'sEasyChatWord_Drizzle', text: 'DRIZZLE' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Status).toHaveLength(109);
    expect(sEasyChatGroup_Status.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatStatusWord('sEasyChatWord_AltColor')).toEqual({
      textSymbol: 'sEasyChatWord_AltColor',
      text: 'ALT. COLOR',
      alphabeticalOrder: 29,
      enabled: true
    });
    expect(sEasyChatGroup_Status.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_ShieldDust',
      text: 'SHIELD DUST',
      alphabeticalOrder: 80,
      enabled: true
    });
  });
});
