import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_PEOPLE_SOURCE,
  EASY_CHAT_PEOPLE_WORDS,
  getEasyChatPeopleWord,
  sEasyChatGroup_People
} from '../src/game/decompEasyChatGroupPeople';

describe('decomp easy chat group people', () => {
  test('parses every people word string in source order', () => {
    expect(EASY_CHAT_GROUP_PEOPLE_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_People[]');
    expect(EASY_CHAT_PEOPLE_WORDS).toHaveLength(75);
    expect(EASY_CHAT_PEOPLE_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Opponent', text: 'OPPONENT' },
      { symbol: 'sEasyChatWord_I', text: 'I' },
      { symbol: 'sEasyChatWord_You', text: 'YOU' },
      { symbol: 'sEasyChatWord_Yours', text: 'YOURS' },
      { symbol: 'sEasyChatWord_Son', text: 'SON' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_People).toHaveLength(75);
    expect(sEasyChatGroup_People.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatPeopleWord('sEasyChatWord_Youre')).toEqual({
      textSymbol: 'sEasyChatWord_Youre',
      text: "YOU'RE",
      alphabeticalOrder: 12,
      enabled: true
    });
    expect(getEasyChatPeopleWord('sEasyChatWord_Mr')).toEqual({
      textSymbol: 'sEasyChatWord_Mr',
      text: 'MR.',
      alphabeticalOrder: 40,
      enabled: true
    });
    expect(sEasyChatGroup_People.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Some',
      text: 'SOME',
      alphabeticalOrder: 3,
      enabled: true
    });
  });
});
