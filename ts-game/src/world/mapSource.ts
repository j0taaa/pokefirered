import prototypeRouteMapJson from './maps/prototypeRoute.json';
import route2MapJson from './maps/route2.json';
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

export interface MapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
  encounterTiles?: string[];
  triggers?: TriggerZone[];
}

export interface CompactMapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  collisionRows: string[];
  encounterRows?: string[];
  triggers?: TriggerZone[];
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isBooleanArray = (value: unknown): value is boolean[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'boolean');

const isEncounterTileArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => entry === '.' || entry === 'L' || entry === 'W');

const isTileRows = (value: unknown, width: number, allowedPattern: RegExp): value is string[] =>
  Array.isArray(value)
  && value.every((row) => typeof row === 'string' && row.length === width && allowedPattern.test(row));

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

export const mapFromSource = (source: MapSource): TileMap => {
  const expectedTiles = source.width * source.height;

  if (source.walkable.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has walkable length ${source.walkable.length}, expected ${expectedTiles}.`
    );
  }

  if (source.encounterTiles && source.encounterTiles.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has encounterTiles length ${source.encounterTiles.length}, expected ${expectedTiles}.`
    );
  }

  return {
    id: source.id,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    walkable: [...source.walkable],
    encounterTiles: source.encounterTiles ? [...source.encounterTiles] : undefined,
    triggers: source.triggers ? [...source.triggers] : []
  };
};

const flattenRows = (rows: string[]): string[] => rows.flatMap((row) => [...row]);

const walkableFromCollisionRows = (collisionRows: string[]): boolean[] =>
  flattenRows(collisionRows).map((tile) => tile === '.');

export const mapFromCompactSource = (source: CompactMapSource): TileMap =>
  mapFromSource({
    id: source.id,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    walkable: walkableFromCollisionRows(source.collisionRows),
    encounterTiles: source.encounterRows ? flattenRows(source.encounterRows) : undefined,
    triggers: source.triggers
  });

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

  if (candidate.encounterTiles !== undefined && !isEncounterTileArray(candidate.encounterTiles)) {
    throw new Error(`Map source "${id}" must include encounterTiles using ., L, or W markers.`);
  }

  if (candidate.triggers !== undefined && !Array.isArray(candidate.triggers)) {
    throw new Error(`Map source "${id}" triggers must be an array.`);
  }

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    walkable: candidate.walkable,
    encounterTiles: candidate.encounterTiles as string[] | undefined,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id))
  };
};

export const parseCompactMapSource = (raw: unknown): CompactMapSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Compact map source payload must be an object.');
  }

  const candidate = raw as Record<string, unknown>;
  const id = candidate.id;

  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Compact map source id must be a non-empty string.');
  }

  if (!isPositiveInteger(candidate.width) || !isPositiveInteger(candidate.height)) {
    throw new Error(`Compact map source "${id}" must define positive integer width and height.`);
  }

  if (!isPositiveInteger(candidate.tileSize)) {
    throw new Error(`Compact map source "${id}" must define a positive integer tileSize.`);
  }

  if (!isTileRows(candidate.collisionRows, candidate.width, /^[.#]+$/u)) {
    throw new Error(
      `Compact map source "${id}" must include collisionRows made of ${candidate.width} '.'/'#' tiles.`
    );
  }

  if (candidate.collisionRows.length !== candidate.height) {
    throw new Error(
      `Compact map source "${id}" has ${candidate.collisionRows.length} collision rows, expected ${candidate.height}.`
    );
  }

  if (candidate.encounterRows !== undefined && !isTileRows(candidate.encounterRows, candidate.width, /^[.LW]+$/u)) {
    throw new Error(
      `Compact map source "${id}" must include encounterRows made of ${candidate.width} '.', 'L', or 'W' tiles.`
    );
  }

  if (candidate.encounterRows !== undefined && candidate.encounterRows.length !== candidate.height) {
    throw new Error(
      `Compact map source "${id}" has ${candidate.encounterRows.length} encounter rows, expected ${candidate.height}.`
    );
  }

  if (candidate.triggers !== undefined && !Array.isArray(candidate.triggers)) {
    throw new Error(`Compact map source "${id}" triggers must be an array.`);
  }

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    collisionRows: [...candidate.collisionRows],
    encounterRows: candidate.encounterRows ? [...candidate.encounterRows] : undefined,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id))
  };
};

export const loadPrototypeRouteMap = (): TileMap =>
  mapFromSource(parseMapSource(prototypeRouteMapJson));

export const loadRoute2Map = (): TileMap =>
  mapFromCompactSource(parseCompactMapSource(route2MapJson));
