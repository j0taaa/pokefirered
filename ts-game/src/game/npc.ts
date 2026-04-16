import { vec2, type Vec2 } from '../core/vec2';
import type { TileMap } from '../world/tileMap';
import { isWalkableAtPixel } from '../world/tileMap';

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
  animationTime?: number;
  idleDurationSeconds: number;
  idleTimeRemaining: number;
  graphicsId?: string;
  interactScriptId?: string;
  flag?: string;
  itemId?: string;
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
    animationTime: 0,
    idleDurationSeconds: 0.35,
    idleTimeRemaining: 0,
    graphicsId: 'OBJ_EVENT_GFX_LASS',
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
    animationTime: 0,
    idleDurationSeconds: 0.5,
    idleTimeRemaining: 0,
    graphicsId: 'OBJ_EVENT_GFX_BUG_CATCHER',
    interactScriptId: 'object.npc-bugcatcher-01.interact',
    dialogueLines: [],
    dialogueIndex: 0
  }
];

const facingFromMovementType = (movementType?: string): NpcState['facing'] => {
  switch (movementType) {
    case 'MOVEMENT_TYPE_FACE_UP':
      return 'up';
    case 'MOVEMENT_TYPE_FACE_LEFT':
      return 'left';
    case 'MOVEMENT_TYPE_FACE_RIGHT':
      return 'right';
    case 'MOVEMENT_TYPE_FACE_DOWN':
    default:
      return 'down';
  }
};

const inferItemIdFromScript = (scriptId?: string, graphicsId?: string): string | undefined => {
  if (graphicsId !== 'OBJ_EVENT_GFX_ITEM_BALL' || !scriptId) {
    return undefined;
  }

  const match = scriptId.match(/_EventScript_Item([A-Za-z0-9]+)/u);
  if (!match) {
    return undefined;
  }

  return `ITEM_${match[1]
    .replace(/([A-Z]+)([A-Z][a-z])/gu, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/gu, '$1_$2')
    .toUpperCase()}`;
};

export const createMapNpcs = (map: TileMap): NpcState[] =>
  map.npcs.map((npc) => ({
    id: npc.id,
    position: vec2(npc.x * map.tileSize, npc.y * map.tileSize),
    path: [],
    pathIndex: 0,
    facing: facingFromMovementType(npc.movementType),
    moving: false,
    animationTime: 0,
    idleDurationSeconds: 0.3,
    idleTimeRemaining: 0,
    graphicsId: npc.graphicsId,
    interactScriptId: npc.scriptId,
    flag: npc.flag,
    itemId: inferItemIdFromScript(npc.scriptId, npc.graphicsId),
    dialogueLines: [],
    dialogueIndex: 0
  }));

export const isNpcVisible = (npc: NpcState, flags: ReadonlySet<string>): boolean =>
  !npc.flag || npc.flag === '0' || !flags.has(npc.flag);

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
      npc.animationTime = 0;
      continue;
    }

    if (npc.path.length === 0) {
      npc.moving = false;
      npc.animationTime = 0;
      continue;
    }

    if (npc.idleTimeRemaining > 0) {
      npc.idleTimeRemaining = Math.max(0, npc.idleTimeRemaining - dtSeconds);
      npc.moving = false;
      npc.animationTime = 0;
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
      npc.animationTime = 0;
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
      npc.animationTime = 0;
      npc.idleTimeRemaining = Math.max(npc.idleTimeRemaining, 0.2);
      continue;
    }

    npc.position = nextPosition;
    npc.moving = true;
    npc.animationTime = (npc.animationTime ?? 0) + dtSeconds;
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
