import { describe, expect, test } from 'vitest';
import {
  EASY_CHAT_GROUP_MOVE_1_INCLUDE,
  EASY_CHAT_GROUP_MOVE_1_SOURCE,
  sEasyChatGroup_Move1
} from '../src/game/decompEasyChatGroupMove1';

describe('decomp easy chat group move 1', () => {
  test('preserves include and every move token in source order', () => {
    expect(EASY_CHAT_GROUP_MOVE_1_SOURCE).toContain('#include "constants/moves.h"');
    expect(EASY_CHAT_GROUP_MOVE_1_INCLUDE).toBe('constants/moves.h');
    expect(sEasyChatGroup_Move1).toHaveLength(154);
    expect(sEasyChatGroup_Move1.slice(0, 8)).toEqual([
      'MOVE_ABSORB',
      'MOVE_AEROBLAST',
      'MOVE_AGILITY',
      'MOVE_AIR_CUTTER',
      'MOVE_ANCIENT_POWER',
      'MOVE_AROMATHERAPY',
      'MOVE_ASTONISH',
      'MOVE_AURORA_BEAM'
    ]);
  });

  test('preserves middle and tail move ordering', () => {
    expect(sEasyChatGroup_Move1.slice(73, 80)).toEqual([
      'MOVE_MORNING_SUN',
      'MOVE_NATURE_POWER',
      'MOVE_NIGHTMARE',
      'MOVE_OCTAZOOKA',
      'MOVE_ODOR_SLEUTH',
      'MOVE_OUTRAGE',
      'MOVE_OVERHEAT'
    ]);
    expect(sEasyChatGroup_Move1.at(-1)).toBe('MOVE_YAWN');
  });
});
