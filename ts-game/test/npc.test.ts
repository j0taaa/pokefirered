import { describe, expect, test } from 'vitest';
import { vec2 } from '../src/core/vec2';
import {
  collidesWithNpcs,
  createPrototypeNpcs,
  stepNpcs,
  type NpcState
} from '../src/game/npc';
import { createPrototypeRouteMap, type TileMap } from '../src/world/tileMap';

describe('npc stepping', () => {
  test('moves npc along its patrol path', () => {
    const map: TileMap = {
      id: 'test-map',
      width: 12,
      height: 12,
      tileSize: 16,
      walkable: Array.from({ length: 12 * 12 }, () => true),
      triggers: []
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
      triggers: []
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
    const map = createPrototypeRouteMap();
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

    stepNpcs([npc], map, 1 / 10, new Set([npc.id]));

    expect(npc.position.x).toBe(startX);
    expect(npc.moving).toBe(false);
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
});
