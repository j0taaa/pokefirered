import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_HOBBIES_SOURCE,
  EASY_CHAT_HOBBIES_WORDS,
  getEasyChatHobbiesWord,
  sEasyChatGroup_Hobbies
} from '../src/game/decompEasyChatGroupHobbies';

describe('decomp easy chat group hobbies', () => {
  test('parses every hobbies word string in source order', () => {
    expect(EASY_CHAT_GROUP_HOBBIES_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Hobbies[]');
    expect(EASY_CHAT_HOBBIES_WORDS).toHaveLength(54);
    expect(EASY_CHAT_HOBBIES_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Idol', text: 'IDOL' },
      { symbol: 'sEasyChatWord_Anime', text: 'ANIME' },
      { symbol: 'sEasyChatWord_Song', text: 'SONG' },
      { symbol: 'sEasyChatWord_Movie', text: 'MOVIE' },
      { symbol: 'sEasyChatWord_Sweets', text: 'SWEETS' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Hobbies).toHaveLength(54);
    expect(sEasyChatGroup_Hobbies.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatHobbiesWord('sEasyChatWord_ChildsPlay')).toEqual({
      textSymbol: 'sEasyChatWord_ChildsPlay',
      text: "CHILD'S PLAY",
      alphabeticalOrder: 11,
      enabled: true
    });
    expect(sEasyChatGroup_Hobbies.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Look',
      text: 'LOOK',
      alphabeticalOrder: 20,
      enabled: true
    });
  });
});
