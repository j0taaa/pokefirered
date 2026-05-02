import { describe, expect, test } from 'vitest';
import {
  BATTLE_TOWER_LEVEL_100_SOURCE,
  BATTLE_TOWER_LEVEL_50_SOURCE,
  gBattleTowerLevel100Mons,
  gBattleTowerLevel50Mons,
  parseBattleTowerPokemonTemplates
} from '../src/game/decompBattleTowerPokemon';

describe('decomp battle tower pokemon templates', () => {
  test('parses every level 50 and level 100 template row', () => {
    expect(BATTLE_TOWER_LEVEL_50_SOURCE).toContain('gBattleTowerLevel50Mons[]');
    expect(BATTLE_TOWER_LEVEL_100_SOURCE).toContain('gBattleTowerLevel100Mons[]');
    expect(parseBattleTowerPokemonTemplates(BATTLE_TOWER_LEVEL_50_SOURCE)).toEqual(gBattleTowerLevel50Mons);
    expect(parseBattleTowerPokemonTemplates(BATTLE_TOWER_LEVEL_100_SOURCE)).toEqual(gBattleTowerLevel100Mons);
    expect(gBattleTowerLevel50Mons).toHaveLength(300);
    expect(gBattleTowerLevel100Mons).toHaveLength(300);
    expect(gBattleTowerLevel50Mons.every((template) => template.moves.length === 4)).toBe(true);
    expect(gBattleTowerLevel100Mons.every((template) => template.moves.length === 4)).toBe(true);
  });

  test('preserves level 50 first and tail templates exactly', () => {
    expect(gBattleTowerLevel50Mons[0]).toEqual({
      species: 'SPECIES_PIKACHU',
      heldItem: 'BATTLE_TOWER_ITEM_ORAN_BERRY',
      teamFlags: '0x42',
      moves: ['MOVE_QUICK_ATTACK', 'MOVE_THUNDER_WAVE', 'MOVE_THUNDER_SHOCK', 'MOVE_GROWL'],
      evSpread: 'F_EV_SPREAD_SPEED | F_EV_SPREAD_DEFENSE',
      nature: 'NATURE_HARDY'
    });
    expect(gBattleTowerLevel50Mons.at(-1)).toEqual({
      species: 'SPECIES_MACHAMP',
      heldItem: 'BATTLE_TOWER_ITEM_SCOPE_LENS',
      teamFlags: '0x14',
      moves: ['MOVE_CROSS_CHOP', 'MOVE_COUNTER', 'MOVE_ROCK_TOMB', 'MOVE_FLAMETHROWER'],
      evSpread: 'F_EV_SPREAD_SP_DEFENSE | F_EV_SPREAD_HP',
      nature: 'NATURE_HARDY'
    });
  });

  test('preserves level 100 first and tail templates exactly', () => {
    expect(gBattleTowerLevel100Mons[0]).toEqual({
      species: 'SPECIES_LINOONE',
      heldItem: 'BATTLE_TOWER_ITEM_RAWST_BERRY',
      teamFlags: '0x42',
      moves: ['MOVE_SLASH', 'MOVE_GROWL', 'MOVE_TAIL_WHIP', 'MOVE_SAND_ATTACK'],
      evSpread: 'F_EV_SPREAD_SPEED',
      nature: 'NATURE_SERIOUS'
    });
    expect(gBattleTowerLevel100Mons.at(-1)).toEqual({
      species: 'SPECIES_MACHAMP',
      heldItem: 'BATTLE_TOWER_ITEM_LIECHI_BERRY',
      teamFlags: '0x5D',
      moves: ['MOVE_CROSS_CHOP', 'MOVE_EARTHQUAKE', 'MOVE_LOW_KICK', 'MOVE_ROCK_SLIDE'],
      evSpread: 'F_EV_SPREAD_SPEED | F_EV_SPREAD_ATTACK',
      nature: 'NATURE_HARDY'
    });
  });
});
