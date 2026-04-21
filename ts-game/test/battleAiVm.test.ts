import { describe, expect, test } from 'vitest';
import type { BattleMove } from '../src/game/battle';
import { chooseTrainerMoveIndex } from '../src/game/battleAiVm';

const makeMove = (id: string, effect: string, power: number): BattleMove => ({
  id,
  name: id.replace(/_/gu, ' '),
  power,
  type: 'water',
  accuracy: 100,
  pp: 20,
  ppRemaining: 20,
  priority: 0,
  effect,
  effectScriptLabel: `BattleScript_${effect}`,
  target: 'MOVE_TARGET_SELECTED',
  secondaryEffectChance: 0,
  flags: []
});

describe('battle AI VM scaffolding', () => {
  test('scores trainer move candidates using parsed decomp AI roots', () => {
    const decision = chooseTrainerMoveIndex(
      [
        {
          index: 0,
          move: makeMove('TACKLE', 'EFFECT_HIT', 35),
          effectiveness: 1,
          maxDamage: 12,
          targetStatus: 'none'
        },
        {
          index: 1,
          move: makeMove('WATER_GUN', 'EFFECT_HIT', 40),
          effectiveness: 2,
          maxDamage: 18,
          targetStatus: 'none'
        }
      ],
      ['AI_SCRIPT_CHECK_BAD_MOVE', 'AI_SCRIPT_TRY_TO_FAINT', 'AI_SCRIPT_CHECK_VIABILITY'],
      15,
      () => 0
    );

    expect(decision?.selectedIndex).toBe(1);
    expect(decision?.scoredMoves[0]?.rootScripts).toEqual([
      'AI_CheckBadMove',
      'AI_TryToFaint',
      'AI_CheckViability'
    ]);
    expect(decision?.scoredMoves.find((entry) => entry.index === 1)?.score).toBeGreaterThan(
      decision?.scoredMoves.find((entry) => entry.index === 0)?.score ?? Number.NEGATIVE_INFINITY
    );
  });
});
