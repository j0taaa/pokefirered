import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import type { FieldRuntimeObject } from '../src/game/fieldCollision';
import { createPlayer } from '../src/game/player';
import {
  runCollisionTrace,
  runPlayerMovementTrace
} from '../src/game/overworldTrace';
import type { TileMap } from '../src/world/tileMap';

const createTraceMap = (overrides: Partial<TileMap> = {}): TileMap => ({
  id: 'MAP_TRACE',
  width: 5,
  height: 5,
  tileSize: 16,
  walkable: Array.from({ length: 25 }, () => true),
  collisionValues: Array.from({ length: 25 }, () => 0),
  tileBehaviors: Array.from({ length: 25 }, () => 0),
  elevations: Array.from({ length: 25 }, () => 0),
  connections: [],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: [],
  ...overrides
});

const createTraceObject = (overrides: Partial<FieldRuntimeObject> = {}): FieldRuntimeObject => ({
  id: 'player',
  currentTile: vec2(1, 1),
  previousTile: vec2(1, 1),
  facing: 'down',
  initialTile: vec2(1, 1),
  movementRangeX: 0,
  movementRangeY: 0,
  currentElevation: 0,
  previousElevation: 0,
  trackedByCamera: true,
  avatarMode: 'normal',
  ...overrides
});

describe('overworld trace parity harness', () => {
  test('records ordered collision decisions and commits only decomp-admitted movement targets', () => {
    const map = createTraceMap();
    map.collisionValues![1 * map.width + 2] = 1;
    map.walkable[1 * map.width + 2] = false;
    map.tileBehaviors![3 * map.width + 1] = 0x3b;

    const trace = runCollisionTrace({
      map,
      object: createTraceObject(),
      steps: [
        { label: 'blocked east', direction: 'right' },
        { label: 'open south', direction: 'down' },
        { label: 'south ledge', direction: 'down' }
      ]
    });

    expect(trace).toEqual([
      expect.objectContaining({
        label: 'blocked east',
        result: 'impassable',
        from: { x: 1, y: 1, elevation: 0 },
        target: { x: 2, y: 1, elevation: 0 },
        committed: false
      }),
      expect.objectContaining({
        label: 'open south',
        result: 'none',
        from: { x: 1, y: 1, elevation: 0 },
        movementTarget: { x: 1, y: 2, elevation: 0 },
        committed: true
      }),
      expect.objectContaining({
        label: 'south ledge',
        result: 'ledgeJump',
        from: { x: 1, y: 2, elevation: 0 },
        target: { x: 1, y: 3, elevation: 0 },
        movementTarget: { x: 1, y: 4, elevation: 0 },
        committed: true
      })
    ]);
  });

  test('captures object previous-tile blocking and connected-edge admission like the field engine', () => {
    const blocker = createTraceObject({
      id: 'npc',
      currentTile: vec2(3, 1),
      previousTile: vec2(2, 1)
    });

    const blockedTrace = runCollisionTrace({
      map: createTraceMap(),
      object: createTraceObject(),
      objects: [blocker],
      steps: [{ label: 'previous occupied tile', direction: 'right' }]
    });

    expect(blockedTrace[0]).toMatchObject({
      result: 'objectEvent',
      blockingObjectId: 'npc',
      committed: false
    });

    const destination = createTraceMap({ id: 'MAP_CONNECTED', width: 2, height: 2 });
    const source = createTraceMap({
      id: 'MAP_SOURCE',
      width: 2,
      height: 2,
      walkable: [true, true, true, true],
      collisionValues: [0, 0, 0, 0],
      tileBehaviors: [0, 0, 0, 0],
      elevations: [0, 0, 0, 0],
      connections: [{ map: 'MAP_CONNECTED', offset: 0, direction: 'right' }]
    });

    const connectionTrace = runCollisionTrace({
      map: source,
      object: createTraceObject({
        currentTile: vec2(1, 1),
        previousTile: vec2(1, 1),
        initialTile: vec2(1, 1)
      }),
      loadMapById: (mapId) => mapId === destination.id ? destination : null,
      steps: [{ label: 'connected edge', direction: 'right' }]
    });

    expect(connectionTrace[0]).toMatchObject({
      result: 'none',
      target: { x: 0, y: 1, elevation: 0 },
      movementTarget: { x: 0, y: 1, elevation: 0 },
      viaConnection: true,
      committed: true
    });
  });

  test('records player movement snapshots and bike-specific collision outcomes', () => {
    const blockedBikeMap = createTraceMap({
      tileBehaviors: Array.from({ length: 25 }, () => 0)
    });
    blockedBikeMap.tileBehaviors![3 * blockedBikeMap.width + 4] = 0x0a;

    const player = createPlayer();
    player.avatarMode = 'machBike';
    player.facing = 'right';
    player.runningState = 'moving';

    const blockedTrace = runPlayerMovementTrace({
      map: blockedBikeMap,
      player,
      steps: [{ label: 'bike forbidden east', input: { right: true } }]
    });

    expect(blockedTrace[0]).toMatchObject({
      label: 'bike forbidden east',
      result: {
        attemptedDirection: 'right',
        collision: 'impassable',
        enteredNewTile: false,
        forcedMovement: false,
        connectionMapId: null
      },
      before: expect.objectContaining({ tile: { x: 3, y: 3, elevation: 0 } }),
      after: expect.objectContaining({ tile: { x: 3, y: 3, elevation: 0 } })
    });

    const crackedIceMap = createTraceMap({
      tileBehaviors: Array.from({ length: 25 }, () => 0),
      collisionValues: Array.from({ length: 25 }, () => 0)
    });
    crackedIceMap.tileBehaviors![3 * crackedIceMap.width + 4] = 0x27;
    crackedIceMap.collisionValues![3 * crackedIceMap.width + 4] = 1;

    const crackedPlayer = createPlayer();
    crackedPlayer.avatarMode = 'machBike';
    crackedPlayer.facing = 'right';
    crackedPlayer.runningState = 'moving';

    const crackedTrace = runPlayerMovementTrace({
      map: crackedIceMap,
      player: crackedPlayer,
      steps: [{ label: 'bike cracked ice', input: { right: true } }]
    });

    expect(crackedTrace[0].result.collision).toBe('none');
    expect(crackedTrace[0].after.stepSpeed).toBe(120);
    expect(crackedTrace[0].after.position.x).toBe(3 * 16 + 2);
  });
});
