import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  canFish,
  fieldUseFuncRod,
  getFishingRodSecondaryId,
  GOOD_ROD,
  OLD_ROD,
  startFishing,
  SUPER_ROD
} from '../src/game/decompFishing';
import { createDialogueState } from '../src/game/interaction';
import { createPlayer, type PlayerState } from '../src/game/player';
import { PLAYER_AVATAR_FLAG_UNDERWATER, setPlayerAvatarStateMask } from '../src/game/playerAvatarTransition';
import { createScriptRuntimeState } from '../src/game/scripts';
import type { TileMap } from '../src/world/tileMap';

const createMap = (
  tileBehaviors: number[],
  collisionValues: number[] = Array.from({ length: 4 * 4 }, () => 0),
  elevations: number[] = Array.from({ length: 4 * 4 }, () => 0),
  terrainTypes: number[] = Array.from({ length: 4 * 4 }, () => 0)
): TileMap => ({
  id: 'fishing-test',
  width: 4,
  height: 4,
  tileSize: 16,
  walkable: collisionValues.map((collision) => collision === 0),
  collisionValues,
  elevations,
  terrainTypes,
  tileBehaviors,
  connections: [],
  triggers: [],
  npcs: [],
  warps: []
});

const createFishingPlayer = (overrides: Partial<PlayerState> = {}): PlayerState => ({
  ...createPlayer(),
  position: vec2(1 * 16, 1 * 16),
  currentTile: vec2(1, 1),
  previousTile: vec2(1, 1),
  facing: 'right',
  currentElevation: 3,
  previousElevation: 3,
  ...overrides
});

describe('decomp fishing field use', () => {
  test('maps rod item ids to the decomp secondary rod ids', () => {
    expect(getFishingRodSecondaryId('ITEM_OLD_ROD')).toBe(OLD_ROD);
    expect(getFishingRodSecondaryId('ITEM_GOOD_ROD')).toBe(GOOD_ROD);
    expect(getFishingRodSecondaryId('ITEM_SUPER_ROD')).toBe(SUPER_ROD);
    expect(getFishingRodSecondaryId('ITEM_POTION')).toBeNull();
  });

  test('CanFish rejects waterfalls and underwater player avatar flags before water checks', () => {
    const behaviors = Array.from({ length: 4 * 4 }, () => 0);
    behaviors[1 * 4 + 2] = 0x13;
    const waterfallMap = createMap(behaviors);

    expect(canFish(createFishingPlayer(), waterfallMap)).toBe(false);

    behaviors[1 * 4 + 2] = 0x12;
    const underwaterPlayer = createFishingPlayer();
    setPlayerAvatarStateMask(underwaterPlayer, PLAYER_AVATAR_FLAG_UNDERWATER);
    expect(canFish(underwaterPlayer, createMap(behaviors))).toBe(false);
  });

  test('CanFish on foot requires elevation-mismatch water in front like IsPlayerFacingSurfableFishableWater', () => {
    const behaviors = Array.from({ length: 4 * 4 }, () => 0);
    behaviors[1 * 4 + 2] = 0x12;
    const elevations = Array.from({ length: 4 * 4 }, () => 3);
    elevations[1 * 4 + 2] = 4;
    const terrainTypes = Array.from({ length: 4 * 4 }, () => 0);
    terrainTypes[1 * 4 + 2] = 2;

    expect(canFish(createFishingPlayer(), createMap(behaviors, undefined, elevations, terrainTypes))).toBe(true);

    elevations[1 * 4 + 2] = 3;
    expect(canFish(createFishingPlayer(), createMap(behaviors, undefined, elevations, terrainTypes))).toBe(false);

    elevations[1 * 4 + 2] = 4;
    terrainTypes[1 * 4 + 2] = 0;
    expect(canFish(createFishingPlayer(), createMap(behaviors, undefined, elevations, terrainTypes))).toBe(false);
  });

  test('CanFish while surfing uses surfable behavior plus raw MapGrid collision zero', () => {
    const behaviors = Array.from({ length: 4 * 4 }, () => 0);
    behaviors[1 * 4 + 2] = 0x12;
    const surfer = createFishingPlayer({ avatarMode: 'surfing' });

    expect(canFish(surfer, createMap(behaviors))).toBe(true);

    const collisionValues = Array.from({ length: 4 * 4 }, () => 0);
    collisionValues[1 * 4 + 2] = 1;
    expect(canFish(surfer, createMap(behaviors, collisionValues))).toBe(false);
  });

  test('StartFishing locks player controls, prevents stepping, and records the rod task', () => {
    const runtime = createScriptRuntimeState();
    const player = createFishingPlayer({ avatarGraphicsMode: 'surf' });

    const task = startFishing(runtime, player, GOOD_ROD);

    expect(runtime.fieldEffects.fishing).toBe(task);
    expect(task).toMatchObject({ active: true, step: 0, rod: GOOD_ROD, playerGraphicsMode: 'surf' });
    expect(player.controllable).toBe(false);
    expect(player.avatarPreventStep).toBe(true);
    expect(player.avatarGraphicsMode).toBe('fish');
    expect(runtime.lastScriptId).toBe('fieldEffect.fishing.start');
  });

  test('FieldUseFunc_Rod starts fishing only after CanFish succeeds', () => {
    const behaviors = Array.from({ length: 4 * 4 }, () => 0);
    behaviors[1 * 4 + 2] = 0x12;
    const elevations = Array.from({ length: 4 * 4 }, () => 3);
    elevations[1 * 4 + 2] = 4;
    const terrainTypes = Array.from({ length: 4 * 4 }, () => 0);
    terrainTypes[1 * 4 + 2] = 2;
    const runtime = createScriptRuntimeState();
    const player = createFishingPlayer();
    const dialogue = createDialogueState();

    expect(
      fieldUseFuncRod(runtime, player, createMap(behaviors, undefined, elevations, terrainTypes), OLD_ROD, dialogue)
    ).toBe(true);
    expect(runtime.fieldEffects.fishing?.rod).toBe(OLD_ROD);

    const blockedRuntime = createScriptRuntimeState();
    const blockedDialogue = createDialogueState();
    elevations[1 * 4 + 2] = 3;
    expect(fieldUseFuncRod(
      blockedRuntime,
      createFishingPlayer(),
      createMap(behaviors, undefined, elevations, terrainTypes),
      OLD_ROD,
      blockedDialogue
    )).toBe(false);
    expect(blockedRuntime.fieldEffects.fishing).toBeNull();
    expect(blockedRuntime.lastScriptId).toBe('item.rod.notTheTime');
    expect(blockedDialogue.text).toContain("isn't the time");
  });
});
