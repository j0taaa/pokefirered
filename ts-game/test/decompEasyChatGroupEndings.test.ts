import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_ENDINGS_WORDS,
  EASY_CHAT_GROUP_ENDINGS_SOURCE,
  getEasyChatEndingsWord,
  sEasyChatGroup_Endings
} from '../src/game/decompEasyChatGroupEndings';

describe('decomp easy chat group endings', () => {
  test('parses every endings word string in source order', () => {
    expect(EASY_CHAT_GROUP_ENDINGS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Endings[]');
    expect(EASY_CHAT_ENDINGS_WORDS).toHaveLength(69);
    expect(EASY_CHAT_ENDINGS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Will', text: 'WILL' },
      { symbol: 'sEasyChatWord_WillBeHere', text: 'WILL BE HERE' },
      { symbol: 'sEasyChatWord_Or', text: 'OR' },
      { symbol: 'sEasyChatWord_Times', text: 'TIMES' },
      { symbol: 'sEasyChatWord_Wonder', text: 'WONDER' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Endings).toHaveLength(69);
    expect(sEasyChatGroup_Endings.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatEndingsWord('sEasyChatWord_IsntItQues')).toEqual({
      textSymbol: 'sEasyChatWord_IsntItQues',
      text: "ISN'T IT?",
      alphabeticalOrder: 49,
      enabled: true
    });
    expect(sEasyChatGroup_Endings.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Anywhere',
      text: 'ANYWHERE',
      alphabeticalOrder: 10,
      enabled: true
    });
  });
});
