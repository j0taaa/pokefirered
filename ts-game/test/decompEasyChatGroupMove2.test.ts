import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_MOVE_2_INCLUDE,
  EASY_CHAT_GROUP_MOVE_2_SOURCE,
  sEasyChatGroup_Move2
} from '../src/game/decompEasyChatGroupMove2';

describe('decomp easy chat group move 2', () => {
  test('preserves include and every move token in source order', () => {
    expect(EASY_CHAT_GROUP_MOVE_2_SOURCE).toContain('#include "constants/moves.h"');
    expect(EASY_CHAT_GROUP_MOVE_2_INCLUDE).toBe('constants/moves.h');
    expect(sEasyChatGroup_Move2).toHaveLength(200);
    expect(sEasyChatGroup_Move2.slice(0, 8)).toEqual([
      'MOVE_ACID',
      'MOVE_ACID_ARMOR',
      'MOVE_AERIAL_ACE',
      'MOVE_AMNESIA',
      'MOVE_ARM_THRUST',
      'MOVE_ASSIST',
      'MOVE_ATTRACT',
      'MOVE_BARRAGE'
    ]);
  });

  test('preserves middle and tail move ordering', () => {
    expect(sEasyChatGroup_Move2.slice(95, 102)).toEqual([
      'MOVE_LUSTER_PURGE',
      'MOVE_MACH_PUNCH',
      'MOVE_MAGIC_COAT',
      'MOVE_MAGICAL_LEAF',
      'MOVE_MAGNITUDE',
      'MOVE_MEDITATE',
      'MOVE_MEGA_DRAIN'
    ]);
    expect(sEasyChatGroup_Move2.at(-1)).toBe('MOVE_ZAP_CANNON');
  });
});
