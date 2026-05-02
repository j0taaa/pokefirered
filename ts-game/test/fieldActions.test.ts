import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  applyFieldActionStartSideEffects,
  createFieldAction,
  GAME_STAT_JUMPED_DOWN_LEDGES,
  stepFieldAction
} from '../src/game/fieldActions';
import { createPlayer } from '../src/game/player';
import type { NpcState } from '../src/game/npc';
import type { TileMap } from '../src/world/tileMap';

const createTestMap = (): TileMap => ({
  id: 'MAP_TEST',
  width: 8,
  height: 8,
  tileSize: 16,
  walkable: new Array(64).fill(true),
  collisionValues: new Array(64).fill(0),
  tileBehaviors: new Array(64).fill(0),
  elevations: new Array(64).fill(0),
  connections: [],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: []
});

describe('field actions', () => {
  test('animates ledge jumps before completing the landing tile', () => {
    const map = createTestMap();
    const player = createPlayer();
    const action = createFieldAction(
      map,
      player,
      [],
      {
        result: 'ledgeJump',
        target: { map, tile: vec2(3, 4), viaConnection: false },
        movementTarget: { map, tile: vec2(3, 5), viaConnection: false }
      },
      'down'
    );

    expect(action).not.toBeNull();

    const midStep = stepFieldAction(action!, player, [], map, 4 / 60);
    expect(midStep.completed).toBe(false);
    expect(player.position.y).toBeGreaterThan(3 * 16);
    expect(player.position.y).toBeLessThan(5 * 16);

    const completeStep = stepFieldAction(action!, player, [], map, 4 / 60);
    expect(completeStep.completed).toBe(true);
    expect(completeStep.enteredNewTile).toBe(true);
    expect(player.position).toEqual(vec2(3 * 16, 5 * 16));
  });

  test('keeps the forced movement phase after forced ledge jumps like DoForcedMovement', () => {
    const map = createTestMap();
    const player = createPlayer();
    player.controllable = false;
    const action = createFieldAction(
      map,
      player,
      [],
      {
        result: 'ledgeJump',
        target: { map, tile: vec2(3, 4), viaConnection: false },
        movementTarget: { map, tile: vec2(3, 5), viaConnection: false }
      },
      'down',
      undefined,
      true
    );

    expect(action).not.toBeNull();

    const completeStep = stepFieldAction(action!, player, [], map, 8 / 60);
    expect(completeStep.completed).toBe(true);
    expect(completeStep.forcedMovement).toBe(true);
    expect(player.position).toEqual(vec2(3 * 16, 5 * 16));
    expect(player.controllable).toBe(false);
  });

  test('increments the ledge-jump game stat when the ledge action starts', () => {
    const map = createTestMap();
    const player = createPlayer();
    const runtime = { vars: {} as Record<string, number> };
    const action = createFieldAction(
      map,
      player,
      [],
      {
        result: 'ledgeJump',
        target: { map, tile: vec2(3, 4), viaConnection: false },
        movementTarget: { map, tile: vec2(3, 5), viaConnection: false }
      },
      'down'
    );

    expect(action).not.toBeNull();

    applyFieldActionStartSideEffects(action!, runtime);
    applyFieldActionStartSideEffects(action!, runtime);

    expect(runtime.vars[GAME_STAT_JUMPED_DOWN_LEDGES]).toBe(2);
  });

  test('finishes surf dismounts on foot at the target tile', () => {
    const map = createTestMap();
    const player = createPlayer();
    player.avatarMode = 'surfing';
    const action = createFieldAction(
      map,
      player,
      [],
      {
        result: 'stopSurfing',
        target: { map, tile: vec2(3, 4), viaConnection: false },
        movementTarget: { map, tile: vec2(3, 4), viaConnection: false }
      },
      'down'
    );

    expect(action).not.toBeNull();
    expect(player.avatarMode).toBe('normal');

    const result = stepFieldAction(action!, player, [], map, 16 / 60);
    expect(result.completed).toBe(true);
    expect(player.avatarMode).toBe('normal');
    expect(player.position).toEqual(vec2(3 * 16, 4 * 16));
  });

  test('animates Strength pushes and commits the boulder tile at the end', () => {
    const map = createTestMap();
    const player = createPlayer();
    const boulder: NpcState = {
      id: 'boulder',
      position: vec2(4 * 16, 3 * 16),
      path: [],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      animationTime: 0,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER',
      currentTile: vec2(4, 3),
      previousTile: vec2(4, 3),
      initialTile: vec2(4, 3),
      movementRangeX: 0,
      movementRangeY: 0,
      currentElevation: 0,
      previousElevation: 0
    };

    const action = createFieldAction(
      map,
      player,
      [boulder],
      {
        result: 'pushedBoulder',
        target: { map, tile: vec2(4, 3), viaConnection: false },
        blockingObject: {
          id: 'boulder',
          currentTile: vec2(4, 3),
          previousTile: vec2(4, 3),
          facing: 'down',
          initialTile: vec2(4, 3),
          movementRangeX: 0,
          movementRangeY: 0,
          currentElevation: 0,
          previousElevation: 0,
          trackedByCamera: false,
          avatarMode: 'normal',
          graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
        },
        movementTarget: null
      },
      'right'
    );

    expect(action).not.toBeNull();

    const midStep = stepFieldAction(action!, player, [boulder], map, 16 / 60);
    expect(midStep.completed).toBe(false);
    expect(boulder.position.x).toBeGreaterThan(4 * 16);
    expect(boulder.position.x).toBeLessThan(5 * 16);

    const completeStep = stepFieldAction(action!, player, [boulder], map, 16 / 60);
    expect(completeStep.completed).toBe(true);
    expect(completeStep.enteredNewTile).toBe(false);
    expect(boulder.position).toEqual(vec2(5 * 16, 3 * 16));
    expect(boulder.currentTile).toEqual(vec2(5, 3));
  });

  test('removes Strength boulders that finish on fall-warp holes', () => {
    const map = createTestMap();
    map.tileBehaviors![3 * map.width + 5] = 0x66;
    const player = createPlayer();
    const boulder: NpcState = {
      id: 'boulder',
      position: vec2(4 * 16, 3 * 16),
      path: [],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      animationTime: 0,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER',
      currentTile: vec2(4, 3),
      previousTile: vec2(4, 3),
      initialTile: vec2(4, 3),
      movementRangeX: 0,
      movementRangeY: 0,
      currentElevation: 0,
      previousElevation: 0
    };

    const action = createFieldAction(
      map,
      player,
      [boulder],
      {
        result: 'pushedBoulder',
        target: { map, tile: vec2(4, 3), viaConnection: false },
        blockingObject: {
          id: 'boulder',
          currentTile: vec2(4, 3),
          previousTile: vec2(4, 3),
          facing: 'down',
          initialTile: vec2(4, 3),
          movementRangeX: 0,
          movementRangeY: 0,
          currentElevation: 0,
          previousElevation: 0,
          trackedByCamera: false,
          avatarMode: 'normal',
          graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
        },
        movementTarget: null
      },
      'right'
    );

    expect(action).not.toBeNull();

    const completeStep = stepFieldAction(action!, player, [boulder], map, 32 / 60);
    expect(completeStep.completed).toBe(true);
    expect(boulder.currentTile).toEqual(vec2(5, 3));
    expect(boulder.active).toBe(false);
    expect(boulder.moving).toBe(false);
  });

  test('reports Strength-button tiles when pushed boulders finish on floor switches', () => {
    const map = createTestMap();
    map.tileBehaviors![3 * map.width + 5] = 0x20;
    const player = createPlayer();
    const boulder: NpcState = {
      id: 'boulder',
      position: vec2(4 * 16, 3 * 16),
      path: [],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      animationTime: 0,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER',
      currentTile: vec2(4, 3),
      previousTile: vec2(4, 3),
      initialTile: vec2(4, 3),
      movementRangeX: 0,
      movementRangeY: 0,
      currentElevation: 0,
      previousElevation: 0
    };

    const action = createFieldAction(
      map,
      player,
      [boulder],
      {
        result: 'pushedBoulder',
        target: { map, tile: vec2(4, 3), viaConnection: false },
        blockingObject: {
          id: 'boulder',
          currentTile: vec2(4, 3),
          previousTile: vec2(4, 3),
          facing: 'down',
          initialTile: vec2(4, 3),
          movementRangeX: 0,
          movementRangeY: 0,
          currentElevation: 0,
          previousElevation: 0,
          trackedByCamera: false,
          avatarMode: 'normal',
          graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
        },
        movementTarget: null
      },
      'right'
    );

    expect(action).not.toBeNull();

    const completeStep = stepFieldAction(action!, player, [boulder], map, 32 / 60);
    expect(completeStep.completed).toBe(true);
    expect(completeStep.strengthButtonTile).toEqual(vec2(5, 3));
  });
});
