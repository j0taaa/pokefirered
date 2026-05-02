import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_VOICES_SOURCE,
  EASY_CHAT_VOICES_WORDS,
  getEasyChatVoicesWord,
  sEasyChatGroup_Voices
} from '../src/game/decompEasyChatGroupVoices';

describe('decomp easy chat group voices', () => {
  test('parses every voices word string in source order', () => {
    expect(EASY_CHAT_GROUP_VOICES_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Voices[]');
    expect(EASY_CHAT_VOICES_WORDS).toHaveLength(63);
    expect(EASY_CHAT_VOICES_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Excl', text: '!' },
      { symbol: 'sEasyChatWord_ExclExcl', text: '!!' },
      { symbol: 'sEasyChatWord_QuesExcl', text: '?!' },
      { symbol: 'sEasyChatWord_Ques', text: '?' },
      { symbol: 'sEasyChatWord_Ellipsis', text: '…' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Voices).toHaveLength(63);
    expect(sEasyChatGroup_Voices.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatVoicesWord('sEasyChatWord_DashDashDash')).toEqual({
      textSymbol: 'sEasyChatWord_DashDashDash',
      text: '- - -',
      alphabeticalOrder: 2,
      enabled: true
    });
    expect(getEasyChatVoicesWord('sEasyChatWord_OiOiOi')).toEqual({
      textSymbol: 'sEasyChatWord_OiOiOi',
      text: 'OI, OI, OI',
      alphabeticalOrder: 37,
      enabled: true
    });
    expect(sEasyChatGroup_Voices.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Wahahaha',
      text: 'WAHAHAHA',
      alphabeticalOrder: 39,
      enabled: true
    });
  });
});
