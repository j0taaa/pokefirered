import { vec2, type Vec2 } from '../core/vec2';
import type { TileMap } from '../world/tileMap';
import { isWalkableAtPixel } from '../world/tileMap';
import type { NpcSource } from '../world/mapSource';

export interface NpcPathPoint {
  x: number;
  y: number;
}

export interface NpcState {
  id: string;
  position: Vec2;
  path: NpcPathPoint[];
  pathIndex: number;
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  idleDurationSeconds: number;
  idleTimeRemaining: number;
  interactScriptId?: string;
  dialogueLines: string[];
  dialogueIndex: number;
}

const NPC_SPEED = 24;
const ARRIVAL_EPSILON = 0.75;

export const createPrototypeNpcs = (): NpcState[] => [
  {
    id: 'npc-lass-01',
    position: vec2(6 * 16, 5 * 16),
    path: [
      { x: 6 * 16, y: 5 * 16 },
      { x: 8 * 16, y: 5 * 16 },
      { x: 8 * 16, y: 7 * 16 },
      { x: 6 * 16, y: 7 * 16 }
    ],
    pathIndex: 1,
    facing: 'right',
    moving: false,
    idleDurationSeconds: 0.35,
    idleTimeRemaining: 0,
    interactScriptId: 'object.npc-lass-01.interact',
    dialogueLines: [],
    dialogueIndex: 0
  },
  {
    id: 'npc-bugcatcher-01',
    position: vec2(3 * 16, 8 * 16),
    path: [
      { x: 3 * 16, y: 8 * 16 },
      { x: 5 * 16, y: 8 * 16 }
    ],
    pathIndex: 1,
    facing: 'right',
    moving: false,
    idleDurationSeconds: 0.5,
    idleTimeRemaining: 0,
    interactScriptId: 'object.npc-bugcatcher-01.interact',
    dialogueLines: [],
    dialogueIndex: 0
  }
];

const stationaryPath = (x: number, y: number): NpcPathPoint[] => [{ x, y }];

const pathFromSource = (source: NpcSource, tileSize: number): NpcPathPoint[] => {
  const x = source.x * tileSize;
  const y = source.y * tileSize;

  switch (source.movementType) {
    case 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN':
      return [
        { x, y: (source.y - source.movementRangeY) * tileSize },
        { x, y },
        { x, y: (source.y + source.movementRangeY) * tileSize },
        { x, y }
      ];
    case 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT':
      return [
        { x: (source.x - source.movementRangeX) * tileSize, y },
        { x, y },
        { x: (source.x + source.movementRangeX) * tileSize, y },
        { x, y }
      ];
    case 'MOVEMENT_TYPE_FACE_UP':
    case 'MOVEMENT_TYPE_FACE_DOWN':
    case 'MOVEMENT_TYPE_FACE_LEFT':
    case 'MOVEMENT_TYPE_FACE_RIGHT':
    default:
      return stationaryPath(x, y);
  }
};

const facingFromMovementType = (movementType: string): NpcState['facing'] => {
  switch (movementType) {
    case 'MOVEMENT_TYPE_FACE_UP':
      return 'up';
    case 'MOVEMENT_TYPE_FACE_LEFT':
      return 'left';
    case 'MOVEMENT_TYPE_FACE_RIGHT':
    case 'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT':
      return 'right';
    case 'MOVEMENT_TYPE_FACE_DOWN':
    case 'MOVEMENT_TYPE_WANDER_UP_AND_DOWN':
    default:
      return 'down';
  }
};

export const createNpcsFromSources = (
  sources: NpcSource[],
  tileSize: number
): NpcState[] => sources.map((source) => {
  const path = pathFromSource(source, tileSize);

  return {
    id: source.id,
    position: vec2(source.x * tileSize, source.y * tileSize),
    path,
    pathIndex: path.length > 1 ? 1 : 0,
    facing: facingFromMovementType(source.movementType),
    moving: false,
    idleDurationSeconds: 0.45,
    idleTimeRemaining: 0,
    interactScriptId: source.scriptId,
    dialogueLines: [],
    dialogueIndex: 0
  };
});

const updateFacing = (npc: NpcState, dx: number, dy: number): void => {
  if (Math.abs(dx) >= Math.abs(dy)) {
    npc.facing = dx >= 0 ? 'right' : 'left';
    return;
  }

  npc.facing = dy >= 0 ? 'down' : 'up';
};

export const stepNpcs = (
  npcs: NpcState[],
  map: TileMap,
  dtSeconds: number,
  frozenNpcIds: ReadonlySet<string> = new Set()
): NpcState[] => {
  for (const npc of npcs) {
    if (frozenNpcIds.has(npc.id)) {
      npc.moving = false;
      continue;
    }

    if (npc.path.length === 0) {
      npc.moving = false;
      continue;
    }

    if (npc.idleTimeRemaining > 0) {
      npc.idleTimeRemaining = Math.max(0, npc.idleTimeRemaining - dtSeconds);
      npc.moving = false;
      continue;
    }

    const target = npc.path[npc.pathIndex];
    const dx = target.x - npc.position.x;
    const dy = target.y - npc.position.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= ARRIVAL_EPSILON) {
      npc.position = vec2(target.x, target.y);
      npc.pathIndex = (npc.pathIndex + 1) % npc.path.length;
      npc.idleTimeRemaining = npc.idleDurationSeconds;
      npc.moving = false;
      continue;
    }

    updateFacing(npc, dx, dy);

    const maxStep = NPC_SPEED * dtSeconds;
    const stepDistance = Math.min(maxStep, distance);
    const nx = dx / distance;
    const ny = dy / distance;
    const nextPosition = vec2(
      npc.position.x + nx * stepDistance,
      npc.position.y + ny * stepDistance
    );

    const probe = vec2(nextPosition.x + 8, nextPosition.y + 12);
    if (!isWalkableAtPixel(map, probe)) {
      npc.moving = false;
      npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);
      continue;
    }

    npc.position = nextPosition;
    npc.moving = true;
  }

  return npcs;
};

export const collidesWithNpcs = (
  probePosition: Vec2,
  npcs: NpcState[],
  radius = 10
): boolean => {
  for (const npc of npcs) {
    const dx = npc.position.x - probePosition.x;
    const dy = npc.position.y - probePosition.y;
    if (Math.hypot(dx, dy) <= radius) {
      return true;
    }
  }

  return false;
};
