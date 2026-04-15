import prototypeRouteMapJson from './maps/prototypeRoute.json';
import { route1CompactMapSource } from './maps/route1';
import type { TileMap } from './tileMap';

export type TriggerFacing = 'any' | 'up' | 'down' | 'left' | 'right';
export type TriggerConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';

export interface TriggerCondition {
  var?: string;
  flag?: string;
  op?: TriggerConditionOperator;
  value?: number;
  flagState?: boolean;
}

export interface TriggerZone {
  id: string;
  x: number;
  y: number;
  activation: 'interact' | 'step';
  scriptId: string;
  facing: TriggerFacing;
  once: boolean;
  conditions?: TriggerCondition[];
  conditionVar?: string;
  conditionEquals?: number;
}

export interface NpcSource {
  id: string;
  x: number;
  y: number;
  graphicsId: string;
  movementType: string;
  movementRangeX: number;
  movementRangeY: number;
  scriptId?: string;
  flag?: string;
}

export interface MapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
  triggers?: TriggerZone[];
  npcs?: NpcSource[];
}

export interface CompactMapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  collisionRows: string[];
  triggers?: TriggerZone[];
  npcs?: NpcSource[];
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isBooleanArray = (value: unknown): value is boolean[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'boolean');

const isFacing = (value: unknown): value is TriggerFacing =>
  value === 'any' || value === 'up' || value === 'down' || value === 'left' || value === 'right';

const isConditionOperator = (value: unknown): value is TriggerConditionOperator =>
  value === 'eq'
  || value === 'ne'
  || value === 'gt'
  || value === 'gte'
  || value === 'lt'
  || value === 'lte';

const parseTriggerCondition = (
  raw: unknown,
  mapId: string,
  triggerId: string,
  index: number
): TriggerCondition => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" trigger "${triggerId}" condition ${index} is not an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  const hasVar = typeof candidate.var === 'string' && candidate.var.length > 0;
  const hasFlag = typeof candidate.flag === 'string' && candidate.flag.length > 0;
  if (!hasVar && !hasFlag) {
    throw new Error(`Map source "${mapId}" trigger "${triggerId}" condition ${index} requires var or flag.`);
  }

  if (candidate.op !== undefined && !isConditionOperator(candidate.op)) {
    throw new Error(`Map source "${mapId}" trigger "${triggerId}" condition ${index} has invalid op.`);
  }

  if (candidate.value !== undefined && !Number.isInteger(candidate.value)) {
    throw new Error(`Map source "${mapId}" trigger "${triggerId}" condition ${index} has invalid value.`);
  }

  if (candidate.flagState !== undefined && typeof candidate.flagState !== 'boolean') {
    throw new Error(`Map source "${mapId}" trigger "${triggerId}" condition ${index} has invalid flagState.`);
  }

  return {
    var: hasVar ? candidate.var as string : undefined,
    flag: hasFlag ? candidate.flag as string : undefined,
    op: candidate.op as TriggerConditionOperator | undefined,
    value: candidate.value as number | undefined,
    flagState: candidate.flagState as boolean | undefined
  };
};

const parseTriggerZone = (raw: unknown, mapId: string): TriggerZone => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" has a trigger that is not an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || candidate.id.length === 0) {
    throw new Error(`Map source "${mapId}" has a trigger with an invalid id.`);
  }

  if (!isPositiveInteger(candidate.x) && candidate.x !== 0) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" must define integer x.`);
  }

  if (!isPositiveInteger(candidate.y) && candidate.y !== 0) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" must define integer y.`);
  }

  if (candidate.activation !== 'interact' && candidate.activation !== 'step') {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" has invalid activation.`);
  }

  if (typeof candidate.scriptId !== 'string' || candidate.scriptId.length === 0) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" must define scriptId.`);
  }

  const facing = candidate.facing ?? 'any';
  if (!isFacing(facing)) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" has invalid facing.`);
  }

  if (candidate.conditionVar !== undefined && typeof candidate.conditionVar !== 'string') {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" has invalid conditionVar.`);
  }

  if (candidate.conditionEquals !== undefined && !Number.isInteger(candidate.conditionEquals)) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" has invalid conditionEquals.`);
  }

  if (candidate.conditions !== undefined && !Array.isArray(candidate.conditions)) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" has invalid conditions.`);
  }

  return {
    id: candidate.id,
    x: candidate.x as number,
    y: candidate.y as number,
    activation: candidate.activation,
    scriptId: candidate.scriptId,
    facing,
    once: candidate.once === true,
    conditions: (candidate.conditions as unknown[] | undefined)?.map((entry, index) =>
      parseTriggerCondition(entry, mapId, candidate.id as string, index)
    ),
    conditionVar: candidate.conditionVar as string | undefined,
    conditionEquals: candidate.conditionEquals as number | undefined
  };
};

const parseNpcSource = (raw: unknown, mapId: string): NpcSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" has an NPC that is not an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || candidate.id.length === 0) {
    throw new Error(`Map source "${mapId}" has an NPC with an invalid id.`);
  }

  if (!Number.isInteger(candidate.x) || !Number.isInteger(candidate.y)) {
    throw new Error(`Map source "${mapId}" NPC "${candidate.id}" must define integer x/y.`);
  }

  if (typeof candidate.graphicsId !== 'string' || candidate.graphicsId.length === 0) {
    throw new Error(`Map source "${mapId}" NPC "${candidate.id}" must define graphicsId.`);
  }

  if (typeof candidate.movementType !== 'string' || candidate.movementType.length === 0) {
    throw new Error(`Map source "${mapId}" NPC "${candidate.id}" must define movementType.`);
  }

  if (!Number.isInteger(candidate.movementRangeX) || !Number.isInteger(candidate.movementRangeY)) {
    throw new Error(`Map source "${mapId}" NPC "${candidate.id}" must define integer movement ranges.`);
  }

  return {
    id: candidate.id,
    x: candidate.x as number,
    y: candidate.y as number,
    graphicsId: candidate.graphicsId as string,
    movementType: candidate.movementType as string,
    movementRangeX: candidate.movementRangeX as number,
    movementRangeY: candidate.movementRangeY as number,
    scriptId: candidate.scriptId as string | undefined,
    flag: candidate.flag as string | undefined
  };
};

export const mapFromSource = (source: MapSource): TileMap => {
  const expectedTiles = source.width * source.height;

  if (source.walkable.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has walkable length ${source.walkable.length}, expected ${expectedTiles}.`
    );
  }

  return {
    id: source.id,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    walkable: [...source.walkable],
    triggers: source.triggers ? [...source.triggers] : [],
    npcs: source.npcs ? [...source.npcs] : []
  };
};

export const parseMapSource = (raw: unknown): MapSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Map source payload must be an object.');
  }

  const candidate = raw as Record<string, unknown>;
  const id = candidate.id;

  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Map source id must be a non-empty string.');
  }

  if (!isPositiveInteger(candidate.width) || !isPositiveInteger(candidate.height)) {
    throw new Error(`Map source "${id}" must define positive integer width and height.`);
  }

  if (!isPositiveInteger(candidate.tileSize)) {
    throw new Error(`Map source "${id}" must define a positive integer tileSize.`);
  }

  if (!isBooleanArray(candidate.walkable)) {
    throw new Error(`Map source "${id}" must include a boolean walkable array.`);
  }

  if (candidate.triggers !== undefined && !Array.isArray(candidate.triggers)) {
    throw new Error(`Map source "${id}" triggers must be an array.`);
  }

  if (candidate.npcs !== undefined && !Array.isArray(candidate.npcs)) {
    throw new Error(`Map source "${id}" npcs must be an array.`);
  }

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    walkable: candidate.walkable,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id)),
    npcs: (candidate.npcs ?? []).map((entry) => parseNpcSource(entry, id))
  };
};

export const expandCollisionRows = (source: CompactMapSource): boolean[] => {
  if (source.collisionRows.length !== source.height) {
    throw new Error(`Compact map source "${source.id}" has ${source.collisionRows.length} rows, expected ${source.height}.`);
  }

  return source.collisionRows.flatMap((row, y) => {
    if (row.length !== source.width) {
      throw new Error(`Compact map source "${source.id}" row ${y} has width ${row.length}, expected ${source.width}.`);
    }

    return [...row].map((tile) => {
      if (tile === '.') return true;
      if (tile === '#') return false;
      throw new Error(`Compact map source "${source.id}" row ${y} has invalid collision marker "${tile}".`);
    });
  });
};

export const mapFromCompactSource = (source: CompactMapSource): TileMap =>
  mapFromSource(parseMapSource({
    id: source.id,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    walkable: expandCollisionRows(source),
    triggers: source.triggers,
    npcs: source.npcs
  }));

export const loadPrototypeRouteMap = (): TileMap =>
  mapFromSource(parseMapSource(prototypeRouteMapJson));

export const loadRoute1Map = (): TileMap =>
  mapFromCompactSource(route1CompactMapSource);
