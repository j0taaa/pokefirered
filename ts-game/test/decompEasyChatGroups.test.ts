import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_INCLUDES,
  EASY_CHAT_GROUPS_SOURCE,
  getEasyChatGroup,
  sEasyChatGroups
} from '../src/game/decompEasyChatGroups';

describe('decomp easy chat groups', () => {
  test('preserves include order for all easy chat group sources', () => {
    expect(EASY_CHAT_GROUPS_SOURCE).toContain('static const struct EasyChatGroup sEasyChatGroups[]');
    expect(EASY_CHAT_GROUP_INCLUDES).toEqual([
      'easy_chat.h',
      'easy_chat_group_pokemon.h',
      'easy_chat_group_trainer.h',
      'easy_chat_group_status.h',
      'easy_chat_group_battle.h',
      'easy_chat_group_greetings.h',
      'easy_chat_group_people.h',
      'easy_chat_group_voices.h',
      'easy_chat_group_speech.h',
      'easy_chat_group_endings.h',
      'easy_chat_group_feelings.h',
      'easy_chat_group_conditions.h',
      'easy_chat_group_actions.h',
      'easy_chat_group_lifestyle.h',
      'easy_chat_group_hobbies.h',
      'easy_chat_group_time.h',
      'easy_chat_group_misc.h',
      'easy_chat_group_adjectives.h',
      'easy_chat_group_events.h',
      'easy_chat_group_move_1.h',
      'easy_chat_group_move_2.h',
      'easy_chat_group_trendy_saying.h',
      'easy_chat_group_pokemon2.h'
    ]);
  });

  test('preserves every sEasyChatGroups row and enabled count', () => {
    expect(sEasyChatGroups).toHaveLength(22);
    expect(sEasyChatGroups.slice(0, 4)).toEqual([
      { source: 'sEasyChatGroup_Pokemon', wordDataKind: 'valueList', numWords: 202, numEnabledWords: 202 },
      { source: 'sEasyChatGroup_Trainer', wordDataKind: 'words', numWords: 26, numEnabledWords: 25 },
      { source: 'sEasyChatGroup_Status', wordDataKind: 'words', numWords: 109, numEnabledWords: 109 },
      { source: 'sEasyChatGroup_Battle', wordDataKind: 'words', numWords: 63, numEnabledWords: 63 }
    ]);
    expect(getEasyChatGroup('sEasyChatGroup_Events')).toEqual({
      source: 'sEasyChatGroup_Events',
      wordDataKind: 'words',
      numWords: 28,
      numEnabledWords: 19
    });
    expect(sEasyChatGroups.at(-1)).toEqual({
      source: 'sEasyChatGroup_Pokemon2',
      wordDataKind: 'valueList',
      numWords: 251,
      numEnabledWords: 251
    });
  });
});
