import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import type { TileMap } from '../src/world/tileMap';
import type { NpcState } from '../src/game/npc';
import { createPlayer } from '../src/game/player';
import { createScriptRuntimeState, setScriptFlag } from '../src/game/scripts';
import {
  checkForTrainersWantingBattle,
  startFieldTrainerSee,
  stepFieldTrainerSee
} from '../src/game/fieldTrainerSee';
import { getDecompTrainerBattleInfoForScript } from '../src/game/decompFieldDialogue';

const createOpenMap = (): TileMap => {
  const width = 8;
  const height = 8;
  return {
    id: 'testMap',
    width,
    height,
    tileSize: 16,
    walkable: Array(width * height).fill(true),
    collisionValues: Array(width * height).fill(0),
    elevations: Array(width * height).fill(0),
    terrainTypes: Array(width * height).fill(0),
    tileBehaviors: Array(width * height).fill(0),
    connections: [],
    triggers: [],
    npcs: [],
    warps: []
  };
};

const createTrainerNpc = (overrides: Partial<NpcState> = {}): NpcState => ({
  id: 'PewterCity_Gym_ObjectEvent_Liam',
  position: vec2(2 * 16, 2 * 16),
  path: [],
  pathIndex: 0,
  facing: 'down',
  initialFacing: 'down',
  moving: false,
  animationTime: 0,
  idleDurationSeconds: 0.3,
  idleTimeRemaining: 0,
  graphicsId: 'OBJ_EVENT_GFX_CAMPER',
  movementType: 'MOVEMENT_TYPE_FACE_DOWN',
  trainerType: 'TRAINER_TYPE_NORMAL',
  trainerSightOrBerryTreeId: 3,
  interactScriptId: 'PewterCity_Gym_EventScript_Liam',
  flag: '0',
  dialogueLines: [],
  dialogueIndex: 0,
  initialTile: vec2(2, 2),
  currentTile: vec2(2, 2),
  previousTile: vec2(2, 2),
  movementRangeX: 0,
  movementRangeY: 0,
  currentElevation: 0,
  previousElevation: 0,
  ...overrides
});

describe('field trainer sight integration', () => {
  test('detects unbeaten trainers from map trainer metadata and decomp trainerbattle flags', () => {
    const map = createOpenMap();
    const player = createPlayer();
    player.position = vec2(2 * 16, 5 * 16);
    player.currentTile = vec2(2, 5);
    player.previousTile = vec2(2, 5);
    const runtime = createScriptRuntimeState();
    const trainer = createTrainerNpc();

    const match = checkForTrainersWantingBattle(map, player, [trainer], runtime);
    expect(match).toMatchObject({
      npc: trainer,
      direction: 'down',
      approachDistance: 3
    });

    setScriptFlag(runtime, getDecompTrainerBattleInfoForScript('PewterCity_Gym_EventScript_Liam')!.defeatFlag);
    expect(checkForTrainersWantingBattle(map, player, [trainer], runtime)).toBeNull();
  });

  test('uses the C path rule: blocked line-of-sight prevents trainer engagement', () => {
    const map = createOpenMap();
    map.collisionValues![4 * map.width + 2] = 1;
    const player = createPlayer();
    player.position = vec2(2 * 16, 5 * 16);
    player.currentTile = vec2(2, 5);
    player.previousTile = vec2(2, 5);

    expect(checkForTrainersWantingBattle(map, player, [createTrainerNpc()], createScriptRuntimeState())).toBeNull();
  });

  test('runs exclamation first, then walks the trainer to one tile away from the player', () => {
    const map = createOpenMap();
    const trainer = createTrainerNpc();
    const state = startFieldTrainerSee({ npc: trainer, direction: 'down', approachDistance: 3 });

    expect(trainer.activeEmote).toBe('exclamation');
    for (let i = 0; i < 31; i += 1) {
      expect(stepFieldTrainerSee(state, [trainer], map, 1 / 60)).toBe(false);
    }
    expect(stepFieldTrainerSee(state, [trainer], map, 1 / 60)).toBe(false);
    expect(trainer.activeEmote).toBeUndefined();
    expect(state.phase).toBe('approach');

    for (let i = 0; i < 90 && state.phase !== 'ready'; i += 1) {
      stepFieldTrainerSee(state, [trainer], map, 1 / 60);
    }

    expect(state.phase).toBe('ready');
    expect(trainer.currentTile).toEqual(vec2(2, 4));
    expect(trainer.facing).toBe('down');
  });
});
