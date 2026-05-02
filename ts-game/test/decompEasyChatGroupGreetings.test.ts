import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GREETINGS_WORDS,
  EASY_CHAT_GROUP_GREETINGS_SOURCE,
  getEasyChatGreetingsWord,
  sEasyChatGroup_Greetings
} from '../src/game/decompEasyChatGroupGreetings';

describe('decomp easy chat group greetings', () => {
  test('parses every greeting word string in source order', () => {
    expect(EASY_CHAT_GROUP_GREETINGS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Greetings[]');
    expect(EASY_CHAT_GREETINGS_WORDS).toHaveLength(42);
    expect(EASY_CHAT_GREETINGS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Thanks', text: 'THANKS' },
      { symbol: 'sEasyChatWord_Yes', text: 'YES' },
      { symbol: 'sEasyChatWord_HereGoes', text: 'HERE GOES' },
      { symbol: 'sEasyChatWord_HereICome', text: 'HERE I COME' },
      { symbol: 'sEasyChatWord_HereItIs', text: 'HERE IT IS' }
    ]);
  });

  test('preserves all enabled flags and alphabetical ordering', () => {
    expect(sEasyChatGroup_Greetings).toHaveLength(42);
    expect(sEasyChatGroup_Greetings.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatGreetingsWord('sEasyChatWord_WhatsUpQues')).toEqual({
      textSymbol: 'sEasyChatWord_WhatsUpQues',
      text: "WHAT'S UP?",
      alphabeticalOrder: 7,
      enabled: true
    });
    expect(sEasyChatGroup_Greetings.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_CountOn',
      text: 'COUNT ON',
      alphabeticalOrder: 39,
      enabled: true
    });
  });
});
