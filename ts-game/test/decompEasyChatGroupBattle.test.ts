import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_BATTLE_WORDS,
  EASY_CHAT_GROUP_BATTLE_SOURCE,
  getEasyChatBattleWord,
  sEasyChatGroup_Battle
} from '../src/game/decompEasyChatGroupBattle';

describe('decomp easy chat group battle', () => {
  test('parses every battle word string in source order', () => {
    expect(EASY_CHAT_GROUP_BATTLE_SOURCE).toContain('static const struct EasyChatWordInfo sEasyChatGroup_Battle[]');
    expect(EASY_CHAT_BATTLE_WORDS).toHaveLength(63);
    expect(EASY_CHAT_BATTLE_WORDS.slice(0, 5)).toEqual([
      { symbol: 'sEasyChatWord_MatchUp', text: 'MATCH UP' },
      { symbol: 'sEasyChatWord_Go', text: 'GO' },
      { symbol: 'sEasyChatWord_No1', text: 'NO. 1' },
      { symbol: 'sEasyChatWord_Decide', text: 'DECIDE' },
      { symbol: 'sEasyChatWord_LetMeWin', text: 'LET ME WIN' }
    ]);
  });

  test('preserves all enabled flags and tail ordering', () => {
    expect(sEasyChatGroup_Battle).toHaveLength(63);
    expect(sEasyChatGroup_Battle.every((entry) => entry.enabled)).toBe(true);
    expect(getEasyChatBattleWord('sEasyChatWord_CantWin')).toEqual({
      textSymbol: 'sEasyChatWord_CantWin',
      text: "CAN'T WIN",
      alphabeticalOrder: 56,
      enabled: true
    });
    expect(sEasyChatGroup_Battle.at(-1)).toEqual({
      textSymbol: 'sEasyChatWord_Move',
      text: 'MOVE',
      alphabeticalOrder: 7,
      enabled: true
    });
  });
});
