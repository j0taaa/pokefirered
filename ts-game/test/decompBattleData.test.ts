import { describe, expect, test } from 'vitest';
import {
  getBattleTerrainForScene,
  getDecompBattleMove,
  getDecompLevelUpMoves,
  getRawBattleMoveDefinitions
} from '../src/game/decompBattleData';

describe('decomp battle data', () => {
  test('parses move metadata and effect-script mapping from the decomp', () => {
    const ember = getDecompBattleMove('EMBER');
    expect(ember).toBeTruthy();
    expect(ember?.effect).toBe('EFFECT_BURN_HIT');
    expect(ember?.power).toBe(40);
    expect(ember?.type).toBe('fire');
    expect(ember?.effectScriptLabel).toBe('BattleScript_EffectBurnHit');
  });

  test('ports every gBattleMoves entry with exact raw C field values', () => {
    const moves = getRawBattleMoveDefinitions();
    expect(moves).toHaveLength(355);

    expect(moves[0]).toEqual({
      move: 'MOVE_NONE',
      effect: 'EFFECT_HIT',
      power: '0',
      type: 'TYPE_NORMAL',
      accuracy: '0',
      pp: '0',
      secondaryEffectChance: '0',
      target: 'MOVE_TARGET_SELECTED',
      priority: '0',
      flags: '0'
    });

    expect(moves[1]).toEqual({
      move: 'MOVE_POUND',
      effect: 'EFFECT_HIT',
      power: '40',
      type: 'TYPE_NORMAL',
      accuracy: '100',
      pp: '35',
      secondaryEffectChance: '0',
      target: 'MOVE_TARGET_SELECTED',
      priority: '0',
      flags: 'FLAG_MAKES_CONTACT | FLAG_PROTECT_AFFECTED | FLAG_MIRROR_MOVE_AFFECTED | FLAG_KINGS_ROCK_AFFECTED'
    });

    expect(moves.at(-1)).toEqual({
      move: 'MOVE_PSYCHO_BOOST',
      effect: 'EFFECT_OVERHEAT',
      power: '140',
      type: 'TYPE_PSYCHIC',
      accuracy: '90',
      pp: '5',
      secondaryEffectChance: '100',
      target: 'MOVE_TARGET_SELECTED',
      priority: '0',
      flags: 'FLAG_PROTECT_AFFECTED | FLAG_MIRROR_MOVE_AFFECTED | FLAG_KINGS_ROCK_AFFECTED'
    });
  });

  test('reads level-up learnsets from the decomp pointer tables', () => {
    const charmanderMoves = getDecompLevelUpMoves('CHARMANDER', 8).map((move) => move.id);
    expect(charmanderMoves).toContain('EMBER');
    expect(charmanderMoves).toContain('GROWL');

    const pidgeyMoves = getDecompLevelUpMoves('PIDGEY', 3).map((move) => move.id);
    expect(pidgeyMoves).toEqual(['TACKLE']);
  });

  test('maps battle scenes back to decomp terrain ids', () => {
    expect(getBattleTerrainForScene('MAP_BATTLE_SCENE_GYM')).toBe('BATTLE_TERRAIN_GYM');
    expect(getBattleTerrainForScene('MAP_BATTLE_SCENE_NORMAL', { mapId: 'MAP_ROCK_TUNNEL_1F', encounterKind: 'land' })).toBe('BATTLE_TERRAIN_CAVE');
  });
});
