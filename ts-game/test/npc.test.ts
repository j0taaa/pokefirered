import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vec2 } from '../src/core/vec2';
import {
  SUPPORTED_NPC_MOVEMENT_TYPES,
  collidesWithNpcs,
  collidesWithNpcsAtTile,
  createPrototypeNpcs,
  createMapNpcs,
  getObjectEventHiddenFlag,
  isNpcVisible,
  resetNpcFixedSubpriority,
  setNpcFixedSubpriority,
  stepNpcs,
  trySpawnObjectEvents,
  type NpcState
} from '../src/game/npc';
import { createPlayer } from '../src/game/player';
import { createPrototypeRouteMap, type TileMap } from '../src/world/tileMap';

const testDir = path.dirname(fileURLToPath(import.meta.url));

describe('npc stepping', () => {
  test('moves npc along its patrol path', () => {
    const map: TileMap = {
      id: 'test-map',
      width: 12,
      height: 12,
      tileSize: 16,
      walkable: Array.from({ length: 12 * 12 }, () => true),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };
    const npcs: NpcState[] = [
      {
        id: 'walker',
        position: vec2(2 * 16, 2 * 16),
        path: [
          { x: 2 * 16, y: 2 * 16 },
          { x: 4 * 16, y: 2 * 16 }
        ],
        pathIndex: 1,
        facing: 'right',
        moving: false,
        idleDurationSeconds: 0.2,
        idleTimeRemaining: 0,
        dialogueLines: [],
        dialogueIndex: 0
      }
    ];
    const startX = npcs[0].position.x;

    stepNpcs(npcs, map, 1 / 10);

    expect(npcs[0].position.x).toBeGreaterThan(startX);
    expect(npcs[0].facing).toBe('right');
  });

  test('waits at patrol nodes before moving again', () => {
    const map: TileMap = {
      id: 'test-map',
      width: 12,
      height: 12,
      tileSize: 16,
      walkable: Array.from({ length: 12 * 12 }, () => true),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };

    const npc: NpcState = {
      id: 'idler',
      position: vec2(2 * 16, 2 * 16),
      path: [
        { x: 2 * 16, y: 2 * 16 },
        { x: 3 * 16, y: 2 * 16 }
      ],
      pathIndex: 1,
      facing: 'right',
      moving: false,
      idleDurationSeconds: 0.4,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0
    };

    for (let i = 0; i < 8; i += 1) {
      stepNpcs([npc], map, 1 / 10);
    }

    expect(npc.idleTimeRemaining).toBeGreaterThan(0);
    const holdX = npc.position.x;
    stepNpcs([npc], map, 1 / 10);
    expect(npc.position.x).toBe(holdX);
  });

  test('stops npc when next probe is blocked by map', () => {
    const map: TileMap = {
      id: 'blocked-row',
      width: 12,
      height: 12,
      tileSize: 16,
      walkable: Array.from({ length: 12 * 12 }, (_, index) => Math.floor(index / 12) !== 5),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };
    const npc: NpcState = {
      id: 'blocked',
      position: vec2(9 * 16, 4.1 * 16),
      path: [{ x: 9 * 16, y: 7 * 16 }],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0
    };

    for (let i = 0; i < 30; i += 1) {
      stepNpcs([npc], map, 1 / 60);
    }

    expect(npc.moving).toBe(false);
    expect(npc.position.y).toBeLessThan(5 * 16);
  });

  test('freezes targeted npc when requested', () => {
    const map = createPrototypeRouteMap();
    const [npc] = createPrototypeNpcs();
    const startX = npc.position.x;

    stepNpcs([npc], map, 1 / 10, null, new Set([npc.id]));

    expect(npc.position.x).toBe(startX);
    expect(npc.moving).toBe(false);
  });

  test('blocks npc movement into the player tile using the shared collision engine', () => {
    const map = createPrototypeRouteMap();
    const player = createPlayer();
    player.position = vec2(4 * 16, 2 * 16);

    const npc: NpcState = {
      id: 'walker',
      position: vec2(2 * 16, 2 * 16),
      path: [
        { x: 2 * 16, y: 2 * 16 },
        { x: 4 * 16, y: 2 * 16 }
      ],
      pathIndex: 1,
      facing: 'right',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0
    };

    for (let i = 0; i < 60; i += 1) {
      stepNpcs([npc], map, 1 / 60, player);
    }

    expect(npc.position.x).toBeLessThan(4 * 16);
    expect(npc.moving).toBe(false);
  });

  test('does not move hidden object events or let them block visible NPCs', () => {
    const map: TileMap = {
      id: 'test-map',
      width: 12,
      height: 12,
      tileSize: 16,
      walkable: Array.from({ length: 12 * 12 }, () => true),
      collisionValues: Array.from({ length: 12 * 12 }, () => 0),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };
    const visibleWalker: NpcState = {
      id: 'walker',
      position: vec2(2 * 16, 2 * 16),
      path: [{ x: 4 * 16, y: 2 * 16 }],
      pathIndex: 0,
      facing: 'right',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      currentTile: vec2(2, 2),
      previousTile: vec2(2, 2),
      initialTile: vec2(2, 2)
    };
    const hiddenBlocker: NpcState = {
      id: 'hidden-blocker',
      position: vec2(3 * 16, 2 * 16),
      path: [{ x: 3 * 16, y: 4 * 16 }],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      currentTile: vec2(3, 2),
      previousTile: vec2(3, 2),
      initialTile: vec2(3, 2)
    };
    const flags = new Set([getObjectEventHiddenFlag(hiddenBlocker.id)]);

    stepNpcs([visibleWalker, hiddenBlocker], map, 1 / 10, null, new Set(), flags);

    expect(visibleWalker.position.x).toBeGreaterThan(2 * 16);
    expect(hiddenBlocker.position).toEqual(vec2(3 * 16, 2 * 16));
    expect(hiddenBlocker.moving).toBe(false);
  });

  test('spawns inactive flagged objects once their template flag is clear', () => {
    const npc: NpcState = {
      id: 'flagged',
      position: vec2(2 * 16, 2 * 16),
      path: [],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      active: false,
      flag: 'FLAG_HIDE_FLAGGED'
    };

    expect(isNpcVisible(npc, new Set(['FLAG_HIDE_FLAGGED']))).toBe(false);
    trySpawnObjectEvents([npc], new Set(['FLAG_HIDE_FLAGGED']));
    expect(npc.active).toBe(false);

    const flags = new Set<string>();
    trySpawnObjectEvents([npc], flags);
    expect(npc.active).toBe(true);
    expect(isNpcVisible(npc, flags)).toBe(true);

    const unflaggedRemoved = { ...npc, active: false, flag: '0' };
    trySpawnObjectEvents([unflaggedRemoved], new Set());
    expect(isNpcVisible(unflaggedRemoved, new Set())).toBe(false);
  });

  test('preserves script-forced object subpriority until reset like the decomp', () => {
    const npc: NpcState = {
      id: 'priority',
      position: vec2(4 * 16, 4 * 16),
      path: [],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      previousElevation: 4,
      currentElevation: 4
    };

    setNpcFixedSubpriority(npc, 87);
    expect(npc.fixedPriority).toBe(true);
    expect(npc.renderPriority).toBe(1);
    expect(npc.renderSubpriority).toBe(87);

    resetNpcFixedSubpriority(npc);
    expect(npc.fixedPriority).toBe(false);
    expect(npc.renderPriority).toBeUndefined();
    expect(npc.renderSubpriority).toBeUndefined();
  });

  test('initializes exported movement types with decomp facing, range, and invisibility rules', () => {
    const map: TileMap = {
      id: 'movement-init',
      width: 8,
      height: 8,
      tileSize: 16,
      walkable: Array.from({ length: 8 * 8 }, () => true),
      collisionValues: Array.from({ length: 8 * 8 }, () => 0),
      elevations: Array.from({ length: 8 * 8 }, () => 3),
      connections: [],
      triggers: [],
      warps: [],
      npcs: [
        {
          id: 'wander-up',
          x: 2,
          y: 2,
          graphicsId: 'OBJ_EVENT_GFX_BOY',
          movementType: 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN',
          movementRangeX: 0,
          movementRangeY: 0,
          trainerType: 'TRAINER_TYPE_NONE',
          trainerSightOrBerryTreeId: 0,
          scriptId: 'script',
          flag: '0'
        },
        {
          id: 'hidden',
          x: 4,
          y: 2,
          graphicsId: 'OBJ_EVENT_GFX_BOY',
          movementType: 'MOVEMENT_TYPE_INVISIBLE',
          movementRangeX: 0,
          movementRangeY: 0,
          trainerType: 'TRAINER_TYPE_NONE',
          trainerSightOrBerryTreeId: 0,
          scriptId: 'script',
          flag: '0'
        }
      ]
    };

    const [wanderer, hidden] = createMapNpcs(map);

    expect(wanderer.facing).toBe('up');
    expect(wanderer.movementRangeX).toBe(1);
    expect(wanderer.movementRangeY).toBe(1);
    expect(hidden.invisible).toBe(true);
  });

  test('wandering movement types choose decomp direction tables and use shared collision', () => {
    const map: TileMap = {
      id: 'wander',
      width: 8,
      height: 8,
      tileSize: 16,
      walkable: Array.from({ length: 8 * 8 }, () => true),
      collisionValues: Array.from({ length: 8 * 8 }, () => 0),
      elevations: Array.from({ length: 8 * 8 }, () => 3),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };
    const npc: NpcState = {
      id: 'wanderer',
      position: vec2(2 * 16, 2 * 16),
      path: [],
      pathIndex: 0,
      facing: 'down',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      currentTile: vec2(2, 2),
      previousTile: vec2(2, 2),
      initialTile: vec2(2, 2),
      currentElevation: 3,
      previousElevation: 3,
      movementRangeX: 2,
      movementRangeY: 2,
      movementType: 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT'
    };

    stepNpcs([npc], map, 1 / 60, null, new Set(), new Set(), () => 0.75);

    expect(npc.facing).toBe('right');
    expect(npc.currentTile).toEqual(vec2(3, 2));
    expect(npc.position.x).toBeGreaterThan(2 * 16);
  });

  test('walk sequences retry the next route entry on outside-range collisions like MoveNextDirectionInSequence', () => {
    const map: TileMap = {
      id: 'sequence',
      width: 8,
      height: 8,
      tileSize: 16,
      walkable: Array.from({ length: 8 * 8 }, () => true),
      collisionValues: Array.from({ length: 8 * 8 }, () => 0),
      elevations: Array.from({ length: 8 * 8 }, () => 3),
      connections: [],
      triggers: [],
      npcs: [],
      warps: []
    };
    const npc: NpcState = {
      id: 'sequencer',
      position: vec2(3 * 16, 2 * 16),
      path: [],
      pathIndex: 0,
      facing: 'right',
      moving: false,
      idleDurationSeconds: 0,
      idleTimeRemaining: 0,
      dialogueLines: [],
      dialogueIndex: 0,
      currentTile: vec2(3, 2),
      previousTile: vec2(3, 2),
      initialTile: vec2(2, 2),
      currentElevation: 3,
      previousElevation: 3,
      movementRangeX: 1,
      movementRangeY: 1,
      movementType: 'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP',
      directionSequenceIndex: 0
    };

    stepNpcs([npc], map, 1 / 60);

    expect(npc.directionSequenceIndex).toBe(1);
    expect(npc.facing).toBe('down');
    expect(npc.currentTile).toEqual(vec2(3, 3));
  });

  test('committed browser maps only export NPC movement types covered by the runtime', () => {
    const mapsDir = path.resolve(testDir, '../src/world/maps');
    const unsupported = fs.readdirSync(mapsDir)
      .filter((file) => file.endsWith('.json'))
      .flatMap((file) => {
        const map = JSON.parse(fs.readFileSync(path.join(mapsDir, file), 'utf8'));
        return (map.npcs ?? [])
          .filter((npc: { movementType?: string }) =>
            typeof npc.movementType === 'string' && !SUPPORTED_NPC_MOVEMENT_TYPES.has(npc.movementType)
          )
          .map((npc: { id?: string; movementType?: string }) => `${file}:${npc.id ?? 'unknown'}:${npc.movementType}`);
      });

    expect(unsupported).toEqual([]);
  });
});

describe('npc collisions', () => {
  test('detects a collision probe near an npc', () => {
    const npcs = createPrototypeNpcs();
    const hit = collidesWithNpcs(vec2(6 * 16, 5 * 16), npcs, 12);
    const miss = collidesWithNpcs(vec2(20 * 16, 20 * 16), npcs, 12);

    expect(hit).toBe(true);
    expect(miss).toBe(false);
  });

  test('detects occupied npc tiles for decomp-style step blocking', () => {
    const npcs = createPrototypeNpcs();

    expect(collidesWithNpcsAtTile(vec2(6, 5), npcs, 16)).toBe(true);
    expect(collidesWithNpcsAtTile(vec2(20, 20), npcs, 16)).toBe(false);
  });
});
