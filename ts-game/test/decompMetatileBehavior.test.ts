import { describe, expect, test } from 'vitest';
import * as mb from '../src/game/decompMetatileBehavior';

describe('decomp metatile behavior', () => {
  test('single-behavior predicates match their exact FireRed constants', () => {
    const pairs: Array<[number, (behavior: number) => boolean]> = [
      [mb.MB_JUMP_EAST, mb.MetatileBehavior_IsJumpEast],
      [mb.MB_JUMP_WEST, mb.MetatileBehavior_IsJumpWest],
      [mb.MB_JUMP_NORTH, mb.MetatileBehavior_IsJumpNorth],
      [mb.MB_JUMP_SOUTH, mb.MetatileBehavior_IsJumpSouth],
      [mb.MB_COUNTER, mb.MetatileBehavior_IsCounter],
      [mb.MB_PC, mb.MetatileBehavior_IsPC],
      [mb.MB_REGION_MAP, mb.MetatileBehavior_IsRegionMap],
      [mb.MB_LAVARIDGE_1F_WARP, mb.MetatileBehavior_IsLavaridge1FWarp],
      [mb.MB_REGULAR_WARP, mb.MetatileBehavior_IsWarpPad],
      [mb.MB_UNION_ROOM_WARP, mb.MetatileBehavior_IsUnionRoomWarp],
      [mb.MB_FALL_WARP, mb.MetatileBehavior_IsFallWarp],
      [mb.MB_TRASH_BIN, mb.MetatileBehavior_IsTrashBin],
      [mb.MB_TRAINER_TOWER_MONITOR, mb.MetatileBehavior_IsTrainerTowerMonitor]
    ];

    for (const [behavior, fn] of pairs) {
      expect(fn(behavior)).toBe(true);
      expect(fn((behavior + 1) & 0xff)).toBe(false);
    }
  });

  test('water, surfable, reflective, and terrain ranges preserve the source tables', () => {
    for (const behavior of [
      mb.MB_POND_WATER,
      mb.MB_FAST_WATER,
      mb.MB_DEEP_WATER,
      mb.MB_WATERFALL,
      mb.MB_OCEAN_WATER,
      mb.MB_UNUSED_WATER,
      mb.MB_CYCLING_ROAD_WATER,
      mb.MB_EASTWARD_CURRENT,
      mb.MB_WESTWARD_CURRENT,
      mb.MB_NORTHWARD_CURRENT,
      mb.MB_SOUTHWARD_CURRENT
    ]) {
      expect(mb.MetatileBehavior_IsSurfable(behavior)).toBe(true);
    }

    expect(mb.MetatileBehavior_IsSurfable(mb.MB_PUDDLE)).toBe(false);
    expect(mb.MetatileBehavior_IsWater(mb.MB_POND_WATER)).toBe(true);
    expect(mb.MetatileBehavior_IsWater(mb.MB_WATERFALL)).toBe(false);
    expect(mb.MetatileBehavior_IsWater(mb.MB_EASTWARD_CURRENT)).toBe(true);
    expect(mb.MetatileBehavior_IsDeepWaterTerrain(mb.MB_FAST_WATER)).toBe(true);
    expect(mb.MetatileBehavior_IsDeepWaterTerrain(mb.MB_OCEAN_WATER)).toBe(true);
    expect(mb.MetatileBehavior_IsDeepWaterTerrain(mb.MB_WATERFALL)).toBe(false);
    expect(mb.MetatileBehavior_IsSurfableAndNotWaterfall(mb.MB_DEEP_WATER)).toBe(true);
    expect(mb.MetatileBehavior_IsSurfableAndNotWaterfall(mb.MB_WATERFALL)).toBe(false);
    expect(mb.MetatileBehavior_IsReflective(mb.MB_ICE)).toBe(true);
    expect(mb.MetatileBehavior_IsReflective(mb.MB_DEEP_WATER)).toBe(false);
  });

  test('movement, warp, block, and spin ranges match the C comparisons', () => {
    expect(mb.MetatileBehavior_IsEscalator(mb.MB_UP_ESCALATOR)).toBe(true);
    expect(mb.MetatileBehavior_IsEscalator(mb.MB_DOWN_ESCALATOR)).toBe(true);
    expect(mb.MetatileBehavior_IsEscalator(mb.MB_UP_RIGHT_STAIR_WARP)).toBe(false);
    expect(mb.MetatileBehavior_IsDirectionalStairWarp(mb.MB_UP_RIGHT_STAIR_WARP)).toBe(true);
    expect(mb.MetatileBehavior_IsDirectionalStairWarp(mb.MB_DOWN_LEFT_STAIR_WARP)).toBe(true);
    expect(mb.MetatileBehavior_IsDirectionalStairWarp(mb.MB_DOWN_ESCALATOR)).toBe(false);
    expect(mb.MetatileBehavior_IsArrowWarp(mb.MB_EAST_ARROW_WARP)).toBe(true);
    expect(mb.MetatileBehavior_IsArrowWarp(mb.MB_REGULAR_WARP)).toBe(false);
    expect(mb.MetatileBehavior_IsForcedMovementTile(mb.MB_WALK_EAST)).toBe(true);
    expect(mb.MetatileBehavior_IsForcedMovementTile(mb.MB_TRICK_HOUSE_PUZZLE_8_FLOOR)).toBe(true);
    expect(mb.MetatileBehavior_IsForcedMovementTile(mb.MB_EASTWARD_CURRENT)).toBe(true);
    expect(mb.MetatileBehavior_IsForcedMovementTile(mb.MB_SPIN_DOWN)).toBe(true);
    expect(mb.MetatileBehavior_IsForcedMovementTile(mb.MB_STOP_SPINNING)).toBe(false);
    expect(mb.MetatileBehavior_IsSpinTile(mb.MB_SPIN_RIGHT)).toBe(true);
    expect(mb.MetatileBehavior_IsSpinTile(mb.MB_SPIN_DOWN)).toBe(true);
    expect(mb.MetatileBehavior_IsSpinTile(mb.MB_STOP_SPINNING)).toBe(false);
    expect(mb.MetatileBehavior_IsEastBlocked(mb.MB_IMPASSABLE_NORTHEAST)).toBe(true);
    expect(mb.MetatileBehavior_IsWestBlocked(mb.MB_IMPASSABLE_NORTHEAST)).toBe(false);
    expect(mb.MetatileBehavior_IsCyclingRoadPullDownTile(mb.MB_CYCLING_ROAD_PULL_DOWN)).toBe(true);
    expect(mb.MetatileBehavior_IsCyclingRoadPullDownTileGrass(mb.MB_CYCLING_ROAD_PULL_DOWN_GRASS)).toBe(true);
  });

  test('facing-sensitive predicates require DIR_NORTH before checking the behavior', () => {
    expect(mb.MetatileBehavior_IsPlayerFacingTVScreen(mb.MB_TELEVISION, mb.DIR_NORTH)).toBe(true);
    expect(mb.MetatileBehavior_IsPlayerFacingTVScreen(mb.MB_TELEVISION, 1)).toBe(false);
    expect(mb.MetatileBehavior_IsPlayerFacingPokemonCenterSign(mb.MB_POKEMON_CENTER_SIGN, mb.DIR_NORTH)).toBe(true);
    expect(mb.MetatileBehavior_IsPlayerFacingPokeMartSign(mb.MB_POKEMART_SIGN, mb.DIR_NORTH)).toBe(true);
    expect(mb.MetatileBehavior_IsPlayerFacingCableClubWirelessMonitor(mb.MB_CABLE_CLUB_WIRELESS_MONITOR, mb.DIR_NORTH)).toBe(true);
    expect(mb.MetatileBehavior_IsPlayerFacingBattleRecords(mb.MB_BATTLE_RECORDS, mb.DIR_NORTH)).toBe(true);
  });

  test('constant false FireRed stubs and bit attributes keep their original behavior', () => {
    for (const fn of [
      mb.MetatileBehavior_IsDeepSand,
      mb.MetatileBehavior_IsLongGrass,
      mb.MetatileBehavior_IsBridge,
      mb.MetatileBehavior_IsLavaridgeB1FWarp,
      mb.MetatileBehavior_IsCrackedFloor,
      mb.MetatileBehavior_IsPolishedWindow,
      mb.MetatileBehavior_IsSecretBaseJumpMat
    ]) {
      expect(fn(0)).toBe(false);
      expect(fn(0xff)).toBe(false);
    }

    expect(mb.MetatileBehavior_IsATile(0)).toBe(true);
    expect(mb.MetatileBehavior_IsATile(0xff)).toBe(true);
    expect(mb.TestMetatileAttributeBit(0, 1)).toBe(false);
    expect(mb.TestMetatileAttributeBit(1, 1)).toBe(true);
    expect(mb.TestMetatileAttributeBit(2, 2)).toBe(true);
    expect(mb.TestMetatileAttributeBit(3, 4)).toBe(true);
    expect(mb.TestMetatileAttributeBit(4, 8)).toBe(true);
    expect(mb.TestMetatileAttributeBit(4, 4)).toBe(false);
  });
});
