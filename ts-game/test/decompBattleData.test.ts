import { describe, expect, test } from 'vitest';
import {
  getBattleTerrainForScene,
  getDecompBattleMove,
  getDecompLevelUpMoves
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
