import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_ADJECTIVES_WORDS,
  EASY_CHAT_GROUP_ADJECTIVES_SOURCE,
  getEasyChatAdjectivesWord,
  sEasyChatGroup_Adjectives
} from '../src/game/decompEasyChatGroupAdjectives';

describe('decomp easy chat group adjectives', () => {
  test('parses every adjective word string in source order', () => {
    expect(EASY_CHAT_GROUP_ADJECTIVES_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Adjectives[]');
    expect(EASY_CHAT_ADJECTIVES_WORDS).toHaveLength(36);
    expect(EASY_CHAT_ADJECTIVES_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Wandering', text: 'WANDERING' },
      { symbol: 'sEasyChatWord_Rickety', text: 'RICKETY' },
      { symbol: 'sEasyChatWord_RockSolid', text: 'ROCK-SOLID' },
      { symbol: 'sEasyChatWord_Hungry', text: 'HUNGRY' },
      { symbol: 'sEasyChatWord_Tight', text: 'TIGHT' }
    ]);
  });

  test('preserves all enabled flags and alphabetical ordering', () => {
    expect(sEasyChatGroup_Adjectives).toHaveLength(36);
    expect(sEasyChatGroup_Adjectives.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatAdjectivesWord('sEasyChatWord_LoveyDovey')).toEqual({
      textSymbol: 'sEasyChatWord_LoveyDovey',
      text: 'LOVEY-DOVEY',
      alphabeticalOrder: 24,
      enabled: true
    });
    expect(sEasyChatGroup_Adjectives.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Anticipation',
      text: 'ANTICIPATION',
      alphabeticalOrder: 30,
      enabled: true
    });
  });
});
