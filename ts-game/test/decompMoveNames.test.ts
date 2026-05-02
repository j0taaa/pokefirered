import { describe, expect, test } from 'vitest';
import {
  getMoveName,
  gMoveNames,
  MOVE_NAMES_SOURCE
} from '../src/game/decompMoveNames';

describe('decomp move names', () => {
  test('parses every gMoveNames row in source order', () => {
    expect(MOVE_NAMES_SOURCE).toContain('const u8 gMoveNames[MOVES_COUNT][MOVE_NAME_LENGTH + 1]');
    expect(gMoveNames).toHaveLength(355);
    expect(gMoveNames.slice(0, 8)).toEqual([
      { move: 'MOVE_NONE', name: '-$$$$$$' },
      { move: 'MOVE_POUND', name: 'POUND' },
      { move: 'MOVE_KARATE_CHOP', name: 'KARATE CHOP' },
      { move: 'MOVE_DOUBLE_SLAP', name: 'DOUBLESLAP' },
      { move: 'MOVE_COMET_PUNCH', name: 'COMET PUNCH' },
      { move: 'MOVE_MEGA_PUNCH', name: 'MEGA PUNCH' },
      { move: 'MOVE_PAY_DAY', name: 'PAY DAY' },
      { move: 'MOVE_FIRE_PUNCH', name: 'FIRE PUNCH' }
    ]);
  });

  test('preserves punctuation-sensitive names and tail ordering', () => {
    expect(getMoveName('MOVE_SAND_ATTACK')).toBe('SAND-ATTACK');
    expect(getMoveName('MOVE_DOUBLE_EDGE')).toBe('DOUBLE-EDGE');
    expect(getMoveName('MOVE_LOCK_ON')).toBe('LOCK-ON');
    expect(gMoveNames.slice(-8)).toEqual([
      { move: 'MOVE_CALM_MIND', name: 'CALM MIND' },
      { move: 'MOVE_LEAF_BLADE', name: 'LEAF BLADE' },
      { move: 'MOVE_DRAGON_DANCE', name: 'DRAGON DANCE' },
      { move: 'MOVE_ROCK_BLAST', name: 'ROCK BLAST' },
      { move: 'MOVE_SHOCK_WAVE', name: 'SHOCK WAVE' },
      { move: 'MOVE_WATER_PULSE', name: 'WATER PULSE' },
      { move: 'MOVE_DOOM_DESIRE', name: 'DOOM DESIRE' },
      { move: 'MOVE_PSYCHO_BOOST', name: 'PSYCHO BOOST' }
    ]);
  });
});
