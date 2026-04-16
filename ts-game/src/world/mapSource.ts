import route2MapJson from './maps/route2.json';
import route22MapJson from './maps/route22.json';
import viridianCityMapJson from './maps/viridianCity.json';
import type { TileMap } from './tileMap';

export type TriggerFacing = 'any' | 'up' | 'down' | 'left' | 'right';
export type TriggerConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
export type MapConnectionDirection = 'up' | 'down' | 'left' | 'right';

export interface MapConnectionSource {
  map: string;
  offset: number;
  direction: MapConnectionDirection;
}

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
  connections?: MapConnectionSource[];
  encounterTiles?: string[];
  wildEncounters?: WildEncounters;
  triggers?: TriggerZone[];
  visual?: MapVisualSource;
  npcs?: MapNpcSource[];
}

export interface WildEncounterMon {
  minLevel: number;
  maxLevel: number;
  species: string;
  slotRate: number;
}

export interface WildEncounterGroup {
  encounterRate: number;
  mons: WildEncounterMon[];
}

export interface WildEncounters {
  land?: WildEncounterGroup;
}

export interface CompactMapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  collisionRows: string[];
  connections?: MapConnectionSource[];
  encounterRows?: string[];
  wildEncounters?: WildEncounters;
  triggers?: TriggerZone[];
  visual?: MapVisualSource;
  npcs?: MapNpcSource[];
}

export interface MapVisualSource {
  primaryTileset: string;
  secondaryTileset: string;
  metatileIds: number[];
  layerTypes: number[];
}

export interface MapNpcSource {
  id: string;
  x: number;
  y: number;
  graphicsId: string;
  movementType: string;
  movementRangeX: number;
  movementRangeY: number;
  trainerType: string;
  trainerSightOrBerryTreeId: number;
  scriptId: string;
  flag: string;
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

const isIntegerArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((entry) => Number.isInteger(entry));

const isMapConnectionDirection = (value: unknown): value is MapConnectionDirection =>
  value === 'up' || value === 'down' || value === 'left' || value === 'right';

const isWildEncounterMon = (value: unknown): value is WildEncounterMon => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.minLevel)
    && Number.isInteger(candidate.maxLevel)
    && typeof candidate.species === 'string'
    && candidate.species.length > 0
    && Number.isInteger(candidate.slotRate);
};

const isWildEncounterGroup = (value: unknown): value is WildEncounterGroup => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Number.isInteger(candidate.encounterRate)
    && Array.isArray(candidate.mons)
    && candidate.mons.every((entry) => isWildEncounterMon(entry));
};

const isWildEncounters = (value: unknown): value is WildEncounters => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.land === undefined || isWildEncounterGroup(candidate.land);
};

const parseVisualSource = (raw: unknown, mapId: string, expectedTiles: number): MapVisualSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" visual payload must be an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.primaryTileset !== 'string' || candidate.primaryTileset.length === 0) {
    throw new Error(`Map source "${mapId}" visual.primaryTileset must be a non-empty string.`);
  }

  if (typeof candidate.secondaryTileset !== 'string' || candidate.secondaryTileset.length === 0) {
    throw new Error(`Map source "${mapId}" visual.secondaryTileset must be a non-empty string.`);
  }

  if (!isIntegerArray(candidate.metatileIds) || candidate.metatileIds.length !== expectedTiles) {
    throw new Error(`Map source "${mapId}" visual.metatileIds must contain ${expectedTiles} integers.`);
  }

  if (!isIntegerArray(candidate.layerTypes) || candidate.layerTypes.length !== expectedTiles) {
    throw new Error(`Map source "${mapId}" visual.layerTypes must contain ${expectedTiles} integers.`);
  }

  return {
    primaryTileset: candidate.primaryTileset,
    secondaryTileset: candidate.secondaryTileset,
    metatileIds: [...candidate.metatileIds],
    layerTypes: [...candidate.layerTypes]
  };
};

const parseMapNpcSource = (raw: unknown, mapId: string, index: number): MapNpcSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" npc ${index} must be an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || candidate.id.length === 0) {
    throw new Error(`Map source "${mapId}" npc ${index} must define a non-empty id.`);
  }

  if (!Number.isInteger(candidate.x) || !Number.isInteger(candidate.y)) {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define integer x and y.`);
  }

  if (typeof candidate.graphicsId !== 'string' || candidate.graphicsId.length === 0) {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define graphicsId.`);
  }

  if (typeof candidate.movementType !== 'string' || candidate.movementType.length === 0) {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define movementType.`);
  }

  if (!Number.isInteger(candidate.movementRangeX) || !Number.isInteger(candidate.movementRangeY)) {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define integer movement ranges.`);
  }

  if (typeof candidate.trainerType !== 'string' || candidate.trainerType.length === 0) {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define trainerType.`);
  }

  if (!Number.isInteger(candidate.trainerSightOrBerryTreeId)) {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define trainerSightOrBerryTreeId.`);
  }

  if (typeof candidate.scriptId !== 'string') {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define scriptId.`);
  }

  if (typeof candidate.flag !== 'string') {
    throw new Error(`Map source "${mapId}" npc "${candidate.id}" must define flag.`);
  }

  return {
    id: candidate.id as string,
    x: candidate.x as number,
    y: candidate.y as number,
    graphicsId: candidate.graphicsId as string,
    movementType: candidate.movementType as string,
    movementRangeX: candidate.movementRangeX as number,
    movementRangeY: candidate.movementRangeY as number,
    trainerType: candidate.trainerType as string,
    trainerSightOrBerryTreeId: candidate.trainerSightOrBerryTreeId as number,
    scriptId: candidate.scriptId as string,
    flag: candidate.flag as string
  };
};

const parseMapConnectionSource = (raw: unknown, mapId: string, index: number): MapConnectionSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" connection ${index} must be an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.map !== 'string' || candidate.map.length === 0) {
    throw new Error(`Map source "${mapId}" connection ${index} must define map.`);
  }

  if (!Number.isInteger(candidate.offset)) {
    throw new Error(`Map source "${mapId}" connection "${candidate.map}" must define integer offset.`);
  }

  if (!isMapConnectionDirection(candidate.direction)) {
    throw new Error(`Map source "${mapId}" connection "${candidate.map}" has invalid direction.`);
  }

  return {
    map: candidate.map as string,
    offset: candidate.offset as number,
    direction: candidate.direction
  };
};

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
    connections: source.connections ? [...source.connections] : [],
    encounterTiles: source.encounterTiles ? [...source.encounterTiles] : undefined,
    wildEncounters: source.wildEncounters,
    triggers: source.triggers ? [...source.triggers] : [],
    visual: source.visual
      ? {
        primaryTileset: source.visual.primaryTileset,
        secondaryTileset: source.visual.secondaryTileset,
        metatileIds: [...source.visual.metatileIds],
        layerTypes: [...source.visual.layerTypes]
      }
      : undefined,
    npcs: source.npcs ? [...source.npcs] : []
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
    connections: source.connections,
    encounterTiles: source.encounterRows ? flattenRows(source.encounterRows) : undefined,
    wildEncounters: source.wildEncounters,
    triggers: source.triggers,
    visual: source.visual,
    npcs: source.npcs
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

  if (candidate.connections !== undefined && !Array.isArray(candidate.connections)) {
    throw new Error(`Map source "${id}" connections must be an array.`);
  }

  if (candidate.wildEncounters !== undefined && !isWildEncounters(candidate.wildEncounters)) {
    throw new Error(`Map source "${id}" must include valid wildEncounters data.`);
  }

  if (candidate.triggers !== undefined && !Array.isArray(candidate.triggers)) {
    throw new Error(`Map source "${id}" triggers must be an array.`);
  }

  if (candidate.npcs !== undefined && !Array.isArray(candidate.npcs)) {
    throw new Error(`Map source "${id}" npcs must be an array.`);
  }

  const expectedTiles = candidate.width * candidate.height;

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    walkable: candidate.walkable,
    connections: (candidate.connections ?? []).map((entry, index) => parseMapConnectionSource(entry, id, index)),
    encounterTiles: candidate.encounterTiles as string[] | undefined,
    wildEncounters: candidate.wildEncounters as WildEncounters | undefined,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id)),
    visual: candidate.visual ? parseVisualSource(candidate.visual, id, expectedTiles) : undefined,
    npcs: (candidate.npcs ?? []).map((entry, index) => parseMapNpcSource(entry, id, index))
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

  const metadata = candidate.metadata as Record<string, unknown> | undefined;
  if (metadata !== undefined && typeof metadata !== 'object') {
    throw new Error(`Compact map source "${id}" metadata must be an object.`);
  }

  if (metadata?.connections !== undefined && !Array.isArray(metadata.connections)) {
    throw new Error(`Compact map source "${id}" metadata.connections must be an array.`);
  }

  if (candidate.wildEncounters !== undefined && !isWildEncounters(candidate.wildEncounters)) {
    throw new Error(`Compact map source "${id}" must include valid wildEncounters data.`);
  }

  if (candidate.triggers !== undefined && !Array.isArray(candidate.triggers)) {
    throw new Error(`Compact map source "${id}" triggers must be an array.`);
  }

  if (candidate.npcs !== undefined && !Array.isArray(candidate.npcs)) {
    throw new Error(`Compact map source "${id}" npcs must be an array.`);
  }

  const expectedTiles = candidate.width * candidate.height;

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    collisionRows: [...candidate.collisionRows],
    connections: (metadata?.connections ?? []).map((entry, index) => parseMapConnectionSource(entry, id, index)),
    encounterRows: candidate.encounterRows ? [...candidate.encounterRows] : undefined,
    wildEncounters: candidate.wildEncounters as WildEncounters | undefined,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id)),
    visual: candidate.visual ? parseVisualSource(candidate.visual, id, expectedTiles) : undefined,
    npcs: (candidate.npcs ?? []).map((entry, index) => parseMapNpcSource(entry, id, index))
  };
};

export const loadRoute2Map = (): TileMap =>
  mapFromCompactSource(parseCompactMapSource(route2MapJson));

export const loadRoute22Map = (): TileMap =>
  mapFromCompactSource(parseCompactMapSource(route22MapJson));

export const loadViridianCityMap = (): TileMap =>
  mapFromCompactSource(parseCompactMapSource(viridianCityMapJson));

export const loadMapById = (mapId: string): TileMap | null => {
  switch (mapId) {
    case 'MAP_ROUTE2':
      return loadRoute2Map();
    case 'MAP_VIRIDIAN_CITY':
      return loadViridianCityMap();
    default:
      return null;
  }
};

export const loadPrototypeRouteMap = (): TileMap =>
  loadRoute2Map();
