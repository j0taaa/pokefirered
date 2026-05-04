import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  CanStopSurfing,
  checkAcroBikeCollision,
  checkForObjectEventCollision,
  checkForPlayerAvatarCollision,
  COLLISION_FLAG_ELEVATION_MISMATCH,
  COLLISION_FLAG_IMPASSABLE,
  COLLISION_FLAG_OBJECT_EVENT,
  COLLISION_FLAG_OUTSIDE_RANGE,
  evaluateFieldCollision,
  GetLedgeJumpDirection,
  GetObjectEventIdByPosition,
  GetObjectEventIdByXY,
  getCollisionFlagsAtCoords,
  getCollisionAtCoords,
  MetatileBehavior_IsJumpEast,
  MetatileBehavior_IsJumpNorth,
  MetatileBehavior_IsJumpSouth,
  MetatileBehavior_IsJumpWest,
  MetatileBehavior_IsNonAnimDoor,
  MetatileBehavior_IsSurfable,
  MetatileBehavior_IsSurfableAndNotWaterfall,
  MetatileBehavior_IsBumpySlope,
  MetatileBehavior_IsHorizontalRail,
  MetatileBehavior_IsIsolatedHorizontalRail,
  MetatileBehavior_IsIsolatedVerticalRail,
  MetatileBehavior_IsWater,
  MetatileBehavior_IsWaterfall,
  ObjectEventDoesElevationMatch,
  ShouldJumpLedge,
  MetatileBehavior_IsVerticalRail,
  resolveStepTarget
} from '../src/game/fieldCollision';
import type { TileMap } from '../src/world/tileMap';

const createTestMap = (overrides: Partial<TileMap> = {}): TileMap => ({
  id: 'MAP_TEST',
  width: 4,
  height: 4,
  tileSize: 16,
  walkable: new Array(16).fill(true),
  collisionValues: new Array(16).fill(0),
  tileBehaviors: new Array(16).fill(0),
  elevations: new Array(16).fill(0),
  connections: [],
  triggers: [],
  npcs: [],
  hiddenItems: [],
  warps: [],
  ...overrides
});

const createObject = (overrides: Partial<Parameters<typeof evaluateFieldCollision>[0]['object']> = {}) => ({
  id: 'player',
  currentTile: vec2(1, 1),
  previousTile: vec2(1, 1),
  facing: 'down' as const,
  initialTile: vec2(1, 1),
  movementRangeX: 0,
  movementRangeY: 0,
  currentElevation: 0,
  previousElevation: 0,
  trackedByCamera: true,
  avatarMode: 'normal' as const,
  ...overrides
});

describe('field collision evaluation', () => {
  test('exposes the same GetCollisionAtCoords and CheckForObjectEventCollision split as the decomp', () => {
    const surfStopMap = createTestMap({
      elevations: [
        0, 0, 0, 0,
        0, 1, 3, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    const surfer = createObject({
      avatarMode: 'surfing',
      currentElevation: 1,
      previousElevation: 1
    });
    const surfTarget = resolveStepTarget(surfStopMap, surfer.currentTile, 'right');

    expect(surfTarget).not.toBeNull();
    expect(getCollisionAtCoords(
      surfStopMap,
      surfer,
      'right',
      surfTarget!,
      []
    ).result).toBe('elevationMismatch');
    expect(checkForObjectEventCollision(
      surfStopMap,
      surfer,
      'right',
      surfTarget,
      surfStopMap.tileBehaviors![1 * surfStopMap.width + 2]!,
      []
    ).result).toBe('stopSurfing');
  });

  test('CheckForPlayerAvatarCollision performs current-tile stair warp before stepping', () => {
    const stairMap = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x6c, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });

    expect(checkForPlayerAvatarCollision({
      map: stairMap,
      object: createObject(),
      direction: 'right'
    }).result).toBe('directionalStairWarp');
  });

  test('FireRed acro-bike trick metatile predicates stay false like the decomp stubs', () => {
    for (const behavior of [0x00, 0x2a, 0x38, 0xd0]) {
      expect(MetatileBehavior_IsBumpySlope(behavior)).toBe(false);
      expect(MetatileBehavior_IsIsolatedVerticalRail(behavior)).toBe(false);
      expect(MetatileBehavior_IsIsolatedHorizontalRail(behavior)).toBe(false);
      expect(MetatileBehavior_IsVerticalRail(behavior)).toBe(false);
      expect(MetatileBehavior_IsHorizontalRail(behavior)).toBe(false);
      expect(checkAcroBikeCollision(behavior)).toBeNull();
    }
  });

  test('matches decomp metatile predicates used by field collision specials', () => {
    expect(MetatileBehavior_IsJumpEast(0x38)).toBe(true);
    expect(MetatileBehavior_IsJumpWest(0x39)).toBe(true);
    expect(MetatileBehavior_IsJumpNorth(0x3a)).toBe(true);
    expect(MetatileBehavior_IsJumpSouth(0x3b)).toBe(true);
    expect(MetatileBehavior_IsJumpEast(0x39)).toBe(false);
    expect(MetatileBehavior_IsNonAnimDoor(0x60)).toBe(true);
    expect(MetatileBehavior_IsNonAnimDoor(0x69)).toBe(false);
    expect(MetatileBehavior_IsWaterfall(0x13)).toBe(true);
    expect(MetatileBehavior_IsWaterfall(0x12)).toBe(false);

    for (const behavior of [0x10, 0x11, 0x12, 0x13, 0x15, 0x1a, 0x1b, 0x50, 0x51, 0x52, 0x53]) {
      expect(MetatileBehavior_IsSurfable(behavior)).toBe(true);
    }

    for (const behavior of [0x10, 0x11, 0x12, 0x15, 0x50, 0x51, 0x52, 0x53]) {
      expect(MetatileBehavior_IsWater(behavior)).toBe(true);
    }

    for (const behavior of [0x13, 0x1a, 0x1b, 0x00]) {
      expect(MetatileBehavior_IsWater(behavior)).toBe(false);
    }

    expect(MetatileBehavior_IsSurfableAndNotWaterfall(0x12)).toBe(true);
    expect(MetatileBehavior_IsSurfableAndNotWaterfall(0x13)).toBe(false);
    expect(MetatileBehavior_IsSurfable(0x00)).toBe(false);
  });

  test('matches GetObjectEventIdByPosition elevation semantics', () => {
    const object = createObject({
      id: 'npc',
      currentTile: vec2(2, 1),
      previousTile: vec2(1, 1),
      currentElevation: 3,
      previousElevation: 3,
      trackedByCamera: false
    });
    const zeroElevationObject = createObject({
      id: 'wildcard',
      currentTile: vec2(3, 1),
      previousTile: vec2(3, 1),
      currentElevation: 0,
      previousElevation: 0,
      trackedByCamera: false
    });

    expect(ObjectEventDoesElevationMatch(object, 3)).toBe(true);
    expect(ObjectEventDoesElevationMatch(object, 2)).toBe(false);
    expect(ObjectEventDoesElevationMatch(object, 0)).toBe(true);
    expect(ObjectEventDoesElevationMatch(zeroElevationObject, 3)).toBe(true);
    expect(GetObjectEventIdByPosition([object, zeroElevationObject], vec2(2, 1), 3)).toBe('npc');
    expect(GetObjectEventIdByPosition([object], vec2(2, 1), 2)).toBeNull();
    expect(GetObjectEventIdByPosition([object], vec2(1, 1), 3)).toBeNull();
    expect(GetObjectEventIdByXY([object], vec2(2, 1))).toBe('npc');
    expect(GetObjectEventIdByXY([object], vec2(1, 1))).toBeNull();
  });

  test('matches GetLedgeJumpDirection and ShouldJumpLedge direction mapping', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x3a, 0x3b, 0,
        0, 0x39, 0x38, 0,
        0, 0, 0, 0
      ]
    });

    expect(GetLedgeJumpDirection(map, vec2(1, 1), 'up')).toBe('up');
    expect(GetLedgeJumpDirection(map, vec2(2, 1), 'down')).toBe('down');
    expect(GetLedgeJumpDirection(map, vec2(1, 2), 'left')).toBe('left');
    expect(GetLedgeJumpDirection(map, vec2(2, 2), 'right')).toBe('right');
    expect(GetLedgeJumpDirection(map, vec2(2, 2), 'left')).toBeNull();
    expect(GetLedgeJumpDirection(map, vec2(2, 2), null)).toBeNull();
    expect(ShouldJumpLedge(map, vec2(2, 1), 'down')).toBe(true);
    expect(ShouldJumpLedge(map, vec2(2, 1), 'up')).toBe(false);
  });

  test('CheckForObjectEventCollision keeps acro-bike post-processing inert for FireRed', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0, 0xd0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    const object = createObject({ avatarMode: 'acroBike' });
    const target = resolveStepTarget(map, object.currentTile, 'right');

    expect(checkForObjectEventCollision(
      map,
      object,
      'right',
      target,
      0xd0,
      []
    ).result).toBe('none');
  });

  test('GetCollisionFlagsAtCoords returns the decomp bitmask for all active collision causes', () => {
    const map = createTestMap({
      collisionValues: [
        0, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ],
      elevations: [
        0, 0, 0, 0,
        0, 1, 2, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    const object = createObject({
      currentElevation: 1,
      previousElevation: 1,
      currentTile: vec2(1, 1),
      previousTile: vec2(1, 1),
      initialTile: vec2(0, 1),
      movementRangeX: 1
    });
    const target = resolveStepTarget(map, object.currentTile, 'right');
    const blocker = createObject({
      id: 'npc',
      currentTile: vec2(2, 1),
      previousTile: vec2(2, 1),
      currentElevation: 1,
      previousElevation: 1,
      trackedByCamera: false
    });

    expect(getCollisionFlagsAtCoords(
      map,
      object,
      'right',
      target,
      [blocker]
    )).toBe(
      COLLISION_FLAG_OUTSIDE_RANGE
      | COLLISION_FLAG_IMPASSABLE
      | COLLISION_FLAG_ELEVATION_MISMATCH
      | COLLISION_FLAG_OBJECT_EVENT
    );

    const invalidBorderTarget = resolveStepTarget(
      createTestMap({ width: 2, height: 2 }),
      vec2(1, 1),
      'right'
    );
    expect(getCollisionFlagsAtCoords(
      createTestMap({ width: 2, height: 2 }),
      createObject({ currentTile: vec2(1, 1), previousTile: vec2(1, 1), initialTile: vec2(1, 1) }),
      'right',
      invalidBorderTarget,
      []
    )).toBe(COLLISION_FLAG_IMPASSABLE);
  });

  test('returns impassable for blocked collision bits', () => {
    const map = createTestMap({
      collisionValues: [
        0, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });

    expect(evaluateFieldCollision({
      map,
      object: createObject(),
      direction: 'right'
    }).result).toBe('impassable');
  });

  test('returns impassable for directional metatile blocking', () => {
    const map = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    map.tileBehaviors![1] = 0x33;

    expect(evaluateFieldCollision({
      map,
      object: createObject(),
      direction: 'up'
    }).result).toBe('impassable');
  });

  test('admits valid connected edges and rejects invalid borders', () => {
    const source = createTestMap({
      id: 'MAP_SOURCE',
      width: 2,
      height: 2,
      connections: [{ map: 'MAP_DEST', offset: 0, direction: 'right' }]
    });
    const destination = createTestMap({ id: 'MAP_DEST', width: 2, height: 2 });
    const edgeObject = createObject({
      currentTile: vec2(1, 0),
      previousTile: vec2(1, 0),
      initialTile: vec2(1, 0)
    });

    const connected = evaluateFieldCollision({
      map: source,
      object: edgeObject,
      direction: 'right',
      loadMapById: (mapId) => mapId === 'MAP_DEST' ? destination : null
    });
    expect(connected.result).toBe('none');
    expect(connected.target).toEqual({
      map: destination,
      tile: { x: 0, y: 0 },
      viaConnection: true,
      connection: { map: 'MAP_DEST', offset: 0, direction: 'right' }
    });

    expect(evaluateFieldCollision({
      map: createTestMap({ width: 2, height: 2 }),
      object: edgeObject,
      direction: 'right'
    }).result).toBe('impassable');
  });

  test('applies decomp collision ordering after resolving connected edge targets', () => {
    const source = createTestMap({
      id: 'MAP_SOURCE',
      width: 2,
      height: 2,
      connections: [{ map: 'MAP_DEST', offset: 0, direction: 'right' }]
    });
    const edgeObject = createObject({
      currentTile: vec2(1, 0),
      previousTile: vec2(1, 0),
      initialTile: vec2(1, 0),
      currentElevation: 1,
      previousElevation: 1
    });

    expect(() => evaluateFieldCollision({
      map: source,
      object: edgeObject,
      direction: 'right',
      loadMapById: () => null
    })).toThrow('Invalid map connection: MAP_SOURCE right connection references unloaded map MAP_DEST.');

    const blockedDestination = createTestMap({
      id: 'MAP_DEST',
      width: 2,
      height: 2,
      collisionValues: [
        1, 0,
        0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: source,
      object: edgeObject,
      direction: 'right',
      loadMapById: (mapId) => mapId === 'MAP_DEST' ? blockedDestination : null
    }).result).toBe('impassable');

    const directionallyBlockedDestination = createTestMap({
      id: 'MAP_DEST',
      width: 2,
      height: 2,
      tileBehaviors: [
        0x31, 0,
        0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: source,
      object: edgeObject,
      direction: 'right',
      loadMapById: (mapId) => mapId === 'MAP_DEST' ? directionallyBlockedDestination : null
    }).result).toBe('impassable');

    const elevationBlockedDestination = createTestMap({
      id: 'MAP_DEST',
      width: 2,
      height: 2,
      elevations: [
        2, 0,
        0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: source,
      object: edgeObject,
      direction: 'right',
      loadMapById: (mapId) => mapId === 'MAP_DEST' ? elevationBlockedDestination : null
    }).result).toBe('elevationMismatch');
  });

  test('GetCollisionAtCoords treats valid borders and invalid borders like GetMapBorderIdAt', () => {
    const destination = createTestMap({ id: 'MAP_DEST', width: 2, height: 2 });
    const source = createTestMap({
      id: 'MAP_SOURCE',
      width: 2,
      height: 2,
      connections: [{ map: 'MAP_DEST', offset: 0, direction: 'right' }]
    });
    const edgeObject = createObject({
      currentTile: vec2(1, 1),
      previousTile: vec2(1, 1),
      initialTile: vec2(1, 1)
    });
    const connectedTarget = resolveStepTarget(source, edgeObject.currentTile, 'right', (mapId) =>
      mapId === 'MAP_DEST' ? destination : null
    );

    expect(connectedTarget).not.toBeNull();
    expect(getCollisionAtCoords(
      source,
      edgeObject,
      'right',
      connectedTarget!,
      [],
      (mapId) => mapId === 'MAP_DEST' ? destination : null
    ).result).toBe('none');

    const invalidTarget = {
      map: createTestMap({ width: 2, height: 2 }),
      tile: vec2(0, 1),
      viaConnection: true
    };
    expect(getCollisionAtCoords(
      createTestMap({ width: 2, height: 2 }),
      edgeObject,
      'right',
      invalidTarget,
      []
    ).result).toBe('impassable');
  });

  test('returns elevation mismatch and stop surfing from the same core check', () => {
    const elevationMap = createTestMap({
      elevations: [
        0, 0, 0, 0,
        0, 1, 4, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });

    expect(evaluateFieldCollision({
      map: elevationMap,
      object: createObject({ currentElevation: 1, previousElevation: 1 }),
      direction: 'right'
    }).result).toBe('elevationMismatch');

    const surfStopMap = createTestMap({
      elevations: [
        0, 0, 0, 0,
        0, 1, 3, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: surfStopMap,
      object: createObject({
        avatarMode: 'surfing',
        currentElevation: 1,
        previousElevation: 1
      }),
      direction: 'right'
    }).result).toBe('stopSurfing');

    const movingBlocker = createObject({
      id: 'npc',
      currentTile: vec2(3, 3),
      previousTile: vec2(2, 1),
      currentElevation: 3,
      previousElevation: 3,
      trackedByCamera: false
    });
    expect(evaluateFieldCollision({
      map: surfStopMap,
      object: createObject({
        avatarMode: 'surfing',
        currentElevation: 1,
        previousElevation: 1
      }),
      direction: 'right',
      objects: [movingBlocker]
    }).result).toBe('stopSurfing');

    const surfTarget = resolveStepTarget(surfStopMap, createObject().currentTile, 'right');
    expect(surfTarget).not.toBeNull();
    const currentBlocker = createObject({
      id: 'current-blocker',
      currentTile: vec2(2, 1),
      previousTile: vec2(3, 3),
      currentElevation: 0,
      previousElevation: 0,
      trackedByCamera: false
    });
    expect(CanStopSurfing(
      createObject({
        avatarMode: 'surfing',
        currentElevation: 1,
        previousElevation: 1
      }),
      surfTarget!,
      [currentBlocker]
    )).toBe(false);
    expect(evaluateFieldCollision({
      map: surfStopMap,
      object: createObject({
        avatarMode: 'surfing',
        currentElevation: 1,
        previousElevation: 1
      }),
      direction: 'right',
      objects: [currentBlocker]
    }).result).toBe('elevationMismatch');
  });

  test('matches object collisions against current and previous occupied tiles', () => {
    const blocker = createObject({
      id: 'npc',
      currentTile: vec2(3, 3),
      previousTile: vec2(2, 1),
      trackedByCamera: false
    });

    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject(),
      direction: 'right',
      objects: [blocker]
    }).result).toBe('objectEvent');

    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ currentElevation: 1, previousElevation: 1 }),
      direction: 'right',
      objects: [createObject({
        id: 'other-elevation-npc',
        currentTile: vec2(3, 3),
        previousTile: vec2(2, 1),
        currentElevation: 2,
        previousElevation: 2,
        trackedByCamera: false
      })]
    }).result).toBe('none');
  });

  test('returns outside range for ranged object events', () => {
    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({
        id: 'npc',
        currentTile: vec2(2, 1),
        previousTile: vec2(2, 1),
        initialTile: vec2(1, 1),
        movementRangeX: 1,
        trackedByCamera: false
      }),
      direction: 'right'
    }).result).toBe('outsideRange');
  });

  test('returns ledge jump, pushed boulder, and directional stair warp outcomes', () => {
    const ledgeMap = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    ledgeMap.tileBehaviors![9] = 0x3b;
    expect(evaluateFieldCollision({
      map: ledgeMap,
      object: createObject(),
      direction: 'down'
    })).toMatchObject({
      result: 'ledgeJump',
      target: {
        map: ledgeMap,
        tile: { x: 1, y: 2 },
        viaConnection: false
      },
      movementTarget: {
        map: ledgeMap,
        tile: { x: 1, y: 3 },
        viaConnection: false
      }
    });

    const blockedLedgeMap = createTestMap({
      collisionValues: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0
      ],
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0x3b, 0, 0,
        0, 0, 0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: blockedLedgeMap,
      object: createObject(),
      direction: 'down'
    }).result).toBe('ledgeJump');

    const boulder = createObject({
      id: 'boulder',
      currentTile: vec2(2, 1),
      previousTile: vec2(2, 1),
      trackedByCamera: false,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
    });
    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [boulder]
    }).result).toBe('pushedBoulder');

    const stairMap = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0x6c, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: stairMap,
      object: createObject(),
      direction: 'right'
    }).result).toBe('directionalStairWarp');
  });

  test('only returns pushed boulder when the boulder can move like the decomp', () => {
    const boulder = createObject({
      id: 'boulder',
      currentTile: vec2(2, 1),
      previousTile: vec2(2, 1),
      trackedByCamera: false,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
    });

    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject(),
      direction: 'right',
      objects: [boulder]
    }).result).toBe('objectEvent');

    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [{
        ...boulder,
        graphicsId: 'OBJ_EVENT_GFX_OLD_MAN'
      }]
    }).result).toBe('objectEvent');

    const blockedMap = createTestMap({
      collisionValues: [
        0, 0, 0, 0,
        0, 0, 0, 1,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: blockedMap,
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [boulder]
    }).result).toBe('objectEvent');

    const fallWarpMap = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0, 0, 0x66,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: fallWarpMap,
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [boulder]
    }).result).toBe('pushedBoulder');

    const doorMap = createTestMap({
      tileBehaviors: [
        0, 0, 0, 0,
        0, 0, 0, 0x60,
        0, 0, 0, 0,
        0, 0, 0, 0
      ]
    });
    expect(evaluateFieldCollision({
      map: doorMap,
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [boulder]
    }).result).toBe('objectEvent');

    const blockedByObject = createObject({
      id: 'blocker',
      currentTile: vec2(3, 1),
      previousTile: vec2(3, 1),
      trackedByCamera: false
    });
    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [boulder, blockedByObject]
    }).result).toBe('objectEvent');

    const previousTileOnlyBoulder = createObject({
      id: 'boulder-moving-away',
      currentTile: vec2(3, 1),
      previousTile: vec2(2, 1),
      trackedByCamera: false,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
    });
    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [previousTileOnlyBoulder]
    }).result).toBe('objectEvent');

    const rangeLockedBoulder = createObject({
      id: 'range-locked-boulder',
      currentTile: vec2(2, 1),
      previousTile: vec2(2, 1),
      initialTile: vec2(2, 1),
      movementRangeX: 1,
      movementRangeY: 0,
      trackedByCamera: false,
      graphicsId: 'OBJ_EVENT_GFX_PUSHABLE_BOULDER'
    });
    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [rangeLockedBoulder]
    }).result).toBe('pushedBoulder');

    expect(evaluateFieldCollision({
      map: createTestMap(),
      object: createObject({ strengthActive: true }),
      direction: 'right',
      objects: [{
        ...rangeLockedBoulder,
        initialTile: vec2(1, 1)
      }]
    }).result).toBe('objectEvent');
  });
});
