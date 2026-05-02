import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_ACTIONS_WORDS,
  EASY_CHAT_GROUP_ACTIONS_SOURCE,
  getEasyChatActionsWord,
  sEasyChatGroup_Actions
} from '../src/game/decompEasyChatGroupActions';

describe('decomp easy chat group actions', () => {
  test('parses every actions word string in source order', () => {
    expect(EASY_CHAT_GROUP_ACTIONS_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Actions[]');
    expect(EASY_CHAT_ACTIONS_WORDS).toHaveLength(78);
    expect(EASY_CHAT_ACTIONS_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_Meets', text: 'MEETS' },
      { symbol: 'sEasyChatWord_Concede', text: 'CONCEDE' },
      { symbol: 'sEasyChatWord_Give', text: 'GIVE' },
      { symbol: 'sEasyChatWord_Gives', text: 'GIVES' },
      { symbol: 'sEasyChatWord_Played', text: 'PLAYED' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Actions).toHaveLength(78);
    expect(sEasyChatGroup_Actions.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatActionsWord('sEasyChatWord_Couldnt')).toEqual({
      textSymbol: 'sEasyChatWord_Couldnt',
      text: "COULDN'T",
      alphabeticalOrder: 11,
      enabled: true
    });
    expect(sEasyChatGroup_Actions.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Fainted',
      text: 'FAINTED',
      alphabeticalOrder: 50,
      enabled: true
    });
  });
});
