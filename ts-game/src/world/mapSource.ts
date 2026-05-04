import { mapRegistry } from './mapRegistry';
import type { TileMap } from './tileMap';
import {
  normalizeCoordEventWeatherId,
  type CoordEventWeatherId
} from './decompCoordEventWeather';

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
  elevation?: number;
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
  regionMapSection?: string;
  mapType?: string;
  allowRunning?: boolean;
  allowEscaping?: boolean;
  coordEventWeather?: CoordEventWeatherId;
  walkable: boolean[];
  collisionValues?: number[];
  elevations?: number[];
  terrainTypes?: number[];
  tileBehaviors?: number[];
  connections?: MapConnectionSource[];
  encounterTiles?: string[];
  wildEncounters?: WildEncounters;
  battleScene?: string;
  triggers?: TriggerZone[];
  visual?: MapVisualSource;
  npcs?: MapNpcSource[];
  hiddenItems?: MapHiddenItemSource[];
  warps?: WarpSource[];
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
  water?: WildEncounterGroup;
  fishing?: WildEncounterGroup;
  rockSmash?: WildEncounterGroup;
}

export interface CompactMapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  regionMapSection?: string;
  mapType?: string;
  allowRunning?: boolean;
  allowEscaping?: boolean;
  coordEventWeather?: CoordEventWeatherId;
  collisionRows: string[];
  elevationRows?: string[];
  terrainRows?: string[];
  behaviorRows?: string[];
  connections?: MapConnectionSource[];
  encounterRows?: string[];
  wildEncounters?: WildEncounters;
  battleScene?: string;
  triggers?: TriggerZone[];
  visual?: MapVisualSource;
  npcs?: MapNpcSource[];
  hiddenItems?: MapHiddenItemSource[];
  warps?: WarpSource[];
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

export interface MapHiddenItemSource {
  x: number;
  y: number;
  elevation?: number;
  item: string;
  quantity?: number;
  flag: string;
  underfoot?: boolean;
}

export interface WarpSource {
  x: number;
  y: number;
  elevation: number;
  destMap: string;
  destWarpId: number;
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

const isBehaviorRows = (value: unknown, width: number): value is string[] =>
  Array.isArray(value)
  && value.every((row) => typeof row === 'string' && row.length === width * 2 && /^[0-9a-f]+$/u.test(row));

const isElevationRows = (value: unknown, width: number): value is string[] =>
  Array.isArray(value)
  && value.every((row) => typeof row === 'string' && row.length === width && /^[0-9a-f]+$/u.test(row));

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
  return (candidate.land === undefined || isWildEncounterGroup(candidate.land))
    && (candidate.water === undefined || isWildEncounterGroup(candidate.water))
    && (candidate.fishing === undefined || isWildEncounterGroup(candidate.fishing))
    && (candidate.rockSmash === undefined || isWildEncounterGroup(candidate.rockSmash));
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

const parseHiddenItemSource = (raw: unknown, mapId: string, index: number): MapHiddenItemSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" hidden item ${index} must be an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if ((!isPositiveInteger(candidate.x) && candidate.x !== 0) || (!isPositiveInteger(candidate.y) && candidate.y !== 0)) {
    throw new Error(`Map source "${mapId}" hidden item ${index} must define integer x and y.`);
  }

  if (typeof candidate.item !== 'string' || candidate.item.length === 0) {
    throw new Error(`Map source "${mapId}" hidden item ${index} must define item.`);
  }

  if (typeof candidate.flag !== 'string' || candidate.flag.length === 0) {
    throw new Error(`Map source "${mapId}" hidden item ${index} must define flag.`);
  }

  return {
    x: candidate.x as number,
    y: candidate.y as number,
    elevation: Number.isInteger(candidate.elevation) ? candidate.elevation as number : undefined,
    item: candidate.item as string,
    quantity: Number.isInteger(candidate.quantity) ? candidate.quantity as number : undefined,
    flag: candidate.flag as string,
    underfoot: typeof candidate.underfoot === 'boolean' ? candidate.underfoot : undefined
  };
};

const parseWarpSource = (raw: unknown, mapId: string, index: number): WarpSource => {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Map source "${mapId}" warp ${index} must be an object.`);
  }

  const candidate = raw as Record<string, unknown>;
  if (!Number.isInteger(candidate.x) || !Number.isInteger(candidate.y)) {
    throw new Error(`Map source "${mapId}" warp ${index} must define integer x and y.`);
  }

  if (!Number.isInteger(candidate.elevation)) {
    throw new Error(`Map source "${mapId}" warp ${index} must define integer elevation.`);
  }

  if (typeof candidate.destMap !== 'string' || candidate.destMap.length === 0) {
    throw new Error(`Map source "${mapId}" warp ${index} must define destMap.`);
  }

  if (!Number.isInteger(candidate.destWarpId) || (candidate.destWarpId as number) < 0) {
    throw new Error(`Map source "${mapId}" warp ${index} must define non-negative integer destWarpId.`);
  }

  return {
    x: candidate.x as number,
    y: candidate.y as number,
    elevation: candidate.elevation as number,
    destMap: candidate.destMap as string,
    destWarpId: candidate.destWarpId as number
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

  if (candidate.elevation !== undefined && !Number.isInteger(candidate.elevation)) {
    throw new Error(`Map source "${mapId}" trigger "${candidate.id}" has invalid elevation.`);
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
    elevation: candidate.elevation as number | undefined,
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

  if (source.tileBehaviors && source.tileBehaviors.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has tileBehaviors length ${source.tileBehaviors.length}, expected ${expectedTiles}.`
    );
  }

  if (source.elevations && source.elevations.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has elevations length ${source.elevations.length}, expected ${expectedTiles}.`
    );
  }

  if (source.terrainTypes && source.terrainTypes.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has terrainTypes length ${source.terrainTypes.length}, expected ${expectedTiles}.`
    );
  }

  if (source.collisionValues && source.collisionValues.length !== expectedTiles) {
    throw new Error(
      `Map source "${source.id}" has collisionValues length ${source.collisionValues.length}, expected ${expectedTiles}.`
    );
  }

  return {
    id: source.id,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    regionMapSection: source.regionMapSection,
    mapType: source.mapType,
    allowRunning: source.allowRunning,
    allowEscaping: source.allowEscaping,
    coordEventWeather: source.coordEventWeather,
    walkable: [...source.walkable],
    collisionValues: source.collisionValues ? [...source.collisionValues] : undefined,
    elevations: source.elevations ? [...source.elevations] : undefined,
    terrainTypes: source.terrainTypes ? [...source.terrainTypes] : undefined,
    tileBehaviors: source.tileBehaviors ? [...source.tileBehaviors] : undefined,
    connections: source.connections ? [...source.connections] : [],
    encounterTiles: source.encounterTiles ? [...source.encounterTiles] : undefined,
    wildEncounters: source.wildEncounters,
    battleScene: source.battleScene,
    triggers: source.triggers ? [...source.triggers] : [],
    visual: source.visual
      ? {
        primaryTileset: source.visual.primaryTileset,
        secondaryTileset: source.visual.secondaryTileset,
        metatileIds: [...source.visual.metatileIds],
        layerTypes: [...source.visual.layerTypes]
      }
      : undefined,
    npcs: source.npcs ? [...source.npcs] : [],
    hiddenItems: source.hiddenItems ? [...source.hiddenItems] : [],
    warps: source.warps ? [...source.warps] : []
  };
};

const flattenRows = (rows: string[]): string[] => rows.flatMap((row) => [...row]);

const collisionValuesFromRows = (collisionRows: string[]): number[] =>
  flattenRows(collisionRows).map((tile) => {
    if (tile === '.') {
      return 0;
    }

    if (tile === '#') {
      return 1;
    }

    return Number.parseInt(tile, 16);
  });

const walkableFromCollisionRows = (collisionRows: string[]): boolean[] =>
  collisionValuesFromRows(collisionRows).map((collisionValue) => collisionValue === 0);

const elevationsFromRows = (elevationRows: string[]): number[] =>
  flattenRows(elevationRows).map((elevation) => Number.parseInt(elevation, 16));

const terrainTypesFromRows = (terrainRows: string[]): number[] =>
  flattenRows(terrainRows).map((terrain) => Number.parseInt(terrain, 16));

const behaviorsFromRows = (behaviorRows: string[]): number[] =>
  behaviorRows.flatMap((row) => row.match(/../gu)?.map((behavior) => Number.parseInt(behavior, 16)) ?? []);

export const mapFromCompactSource = (source: CompactMapSource): TileMap =>
  mapFromSource({
    id: source.id,
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    regionMapSection: source.regionMapSection,
    mapType: source.mapType,
    allowRunning: source.allowRunning,
    allowEscaping: source.allowEscaping,
    coordEventWeather: source.coordEventWeather,
    walkable: walkableFromCollisionRows(source.collisionRows),
    collisionValues: collisionValuesFromRows(source.collisionRows),
    elevations: source.elevationRows ? elevationsFromRows(source.elevationRows) : undefined,
    terrainTypes: source.terrainRows ? terrainTypesFromRows(source.terrainRows) : undefined,
    tileBehaviors: source.behaviorRows ? behaviorsFromRows(source.behaviorRows) : undefined,
    connections: source.connections,
    encounterTiles: source.encounterRows ? flattenRows(source.encounterRows) : undefined,
    wildEncounters: source.wildEncounters,
    battleScene: source.battleScene,
    triggers: source.triggers,
    visual: source.visual,
    npcs: source.npcs,
    hiddenItems: source.hiddenItems,
    warps: source.warps
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

  if (candidate.collisionValues !== undefined && !isIntegerArray(candidate.collisionValues)) {
    throw new Error(`Map source "${id}" must include collisionValues as an integer array.`);
  }

  if (candidate.encounterTiles !== undefined && !isEncounterTileArray(candidate.encounterTiles)) {
    throw new Error(`Map source "${id}" must include encounterTiles using ., L, or W markers.`);
  }

  if (candidate.tileBehaviors !== undefined && !isIntegerArray(candidate.tileBehaviors)) {
    throw new Error(`Map source "${id}" must include tileBehaviors as an integer array.`);
  }

  if (candidate.terrainTypes !== undefined && !isIntegerArray(candidate.terrainTypes)) {
    throw new Error(`Map source "${id}" must include terrainTypes as an integer array.`);
  }

  if (candidate.elevations !== undefined && !isIntegerArray(candidate.elevations)) {
    throw new Error(`Map source "${id}" must include elevations as an integer array.`);
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

  if (candidate.hiddenItems !== undefined && !Array.isArray(candidate.hiddenItems)) {
    throw new Error(`Map source "${id}" hiddenItems must be an array.`);
  }

  if (candidate.warps !== undefined && !Array.isArray(candidate.warps)) {
    throw new Error(`Map source "${id}" warps must be an array.`);
  }

  const expectedTiles = candidate.width * candidate.height;

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    regionMapSection: typeof candidate.regionMapSection === 'string' ? candidate.regionMapSection : undefined,
    mapType: typeof candidate.mapType === 'string' ? candidate.mapType : undefined,
    allowRunning: typeof candidate.allowRunning === 'boolean' ? candidate.allowRunning : undefined,
    allowEscaping: typeof candidate.allowEscaping === 'boolean' ? candidate.allowEscaping : undefined,
    coordEventWeather: normalizeCoordEventWeatherId(candidate.coordEventWeather),
    walkable: candidate.walkable,
    collisionValues: candidate.collisionValues as number[] | undefined,
    elevations: candidate.elevations as number[] | undefined,
    terrainTypes: candidate.terrainTypes as number[] | undefined,
    tileBehaviors: candidate.tileBehaviors as number[] | undefined,
    connections: (candidate.connections ?? []).map((entry, index) => parseMapConnectionSource(entry, id, index)),
    encounterTiles: candidate.encounterTiles as string[] | undefined,
    wildEncounters: candidate.wildEncounters as WildEncounters | undefined,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id)),
    visual: candidate.visual ? parseVisualSource(candidate.visual, id, expectedTiles) : undefined,
    npcs: (candidate.npcs ?? []).map((entry, index) => parseMapNpcSource(entry, id, index)),
    hiddenItems: (candidate.hiddenItems ?? []).map((entry, index) => parseHiddenItemSource(entry, id, index)),
    warps: (candidate.warps ?? []).map((entry, index) => parseWarpSource(entry, id, index))
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

  if (!isTileRows(candidate.collisionRows, candidate.width, /^[.#0-3]+$/u)) {
    throw new Error(
      `Compact map source "${id}" must include collisionRows made of ${candidate.width} '.'/'#' or 0-3 tiles.`
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

  if (candidate.elevationRows !== undefined && !isElevationRows(candidate.elevationRows, candidate.width)) {
    throw new Error(
      `Compact map source "${id}" must include elevationRows made of ${candidate.width} one-digit hex elevations.`
    );
  }

  if (candidate.elevationRows !== undefined && candidate.elevationRows.length !== candidate.height) {
    throw new Error(
      `Compact map source "${id}" has ${candidate.elevationRows.length} elevation rows, expected ${candidate.height}.`
    );
  }

  if (candidate.terrainRows !== undefined && !isElevationRows(candidate.terrainRows, candidate.width)) {
    throw new Error(
      `Compact map source "${id}" must include terrainRows made of ${candidate.width} one-digit hex terrain values.`
    );
  }

  if (candidate.terrainRows !== undefined && candidate.terrainRows.length !== candidate.height) {
    throw new Error(
      `Compact map source "${id}" has ${candidate.terrainRows.length} terrain rows, expected ${candidate.height}.`
    );
  }

  if (candidate.behaviorRows !== undefined && !isBehaviorRows(candidate.behaviorRows, candidate.width)) {
    throw new Error(
      `Compact map source "${id}" must include behaviorRows made of ${candidate.width} two-digit hex behaviors.`
    );
  }

  if (candidate.behaviorRows !== undefined && candidate.behaviorRows.length !== candidate.height) {
    throw new Error(
      `Compact map source "${id}" has ${candidate.behaviorRows.length} behavior rows, expected ${candidate.height}.`
    );
  }

  const metadata = candidate.metadata as Record<string, unknown> | undefined;
  if (metadata !== undefined && typeof metadata !== 'object') {
    throw new Error(`Compact map source "${id}" metadata must be an object.`);
  }

  const metadataConnections = metadata?.connections ?? undefined;
  const metadataBattleScene = metadata?.battleScene;
  const metadataRegionMapSection = metadata?.regionMapSection;
  const metadataWeather = metadata?.weather;
  const metadataMapType = metadata?.mapType;
  const metadataAllowRunning = metadata?.allowRunning;
  const metadataAllowEscaping = metadata?.allowEscaping;

  if (metadataConnections !== undefined && !Array.isArray(metadataConnections)) {
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

  if (candidate.hiddenItems !== undefined && !Array.isArray(candidate.hiddenItems)) {
    throw new Error(`Compact map source "${id}" hiddenItems must be an array.`);
  }

  if (candidate.warps !== undefined && !Array.isArray(candidate.warps)) {
    throw new Error(`Compact map source "${id}" warps must be an array.`);
  }

  const expectedTiles = candidate.width * candidate.height;

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    regionMapSection: typeof metadataRegionMapSection === 'string' ? metadataRegionMapSection : undefined,
    mapType: typeof metadataMapType === 'string' ? metadataMapType : undefined,
    allowRunning: typeof metadataAllowRunning === 'boolean' ? metadataAllowRunning : undefined,
    allowEscaping: typeof metadataAllowEscaping === 'boolean' ? metadataAllowEscaping : undefined,
    coordEventWeather: normalizeCoordEventWeatherId(metadataWeather),
    collisionRows: [...candidate.collisionRows],
    elevationRows: candidate.elevationRows ? [...candidate.elevationRows] : undefined,
    terrainRows: candidate.terrainRows ? [...candidate.terrainRows] : undefined,
    behaviorRows: candidate.behaviorRows ? [...candidate.behaviorRows] : undefined,
    connections: (metadataConnections ?? []).map((entry, index) => parseMapConnectionSource(entry, id, index)),
    encounterRows: candidate.encounterRows ? [...candidate.encounterRows] : undefined,
    wildEncounters: candidate.wildEncounters as WildEncounters | undefined,
    battleScene: typeof metadataBattleScene === 'string' ? metadataBattleScene : undefined,
    triggers: (candidate.triggers ?? []).map((entry) => parseTriggerZone(entry, id)),
    visual: candidate.visual ? parseVisualSource(candidate.visual, id, expectedTiles) : undefined,
    npcs: (candidate.npcs ?? []).map((entry, index) => parseMapNpcSource(entry, id, index)),
    hiddenItems: (candidate.hiddenItems ?? []).map((entry, index) => parseHiddenItemSource(entry, id, index)),
    warps: (candidate.warps ?? []).map((entry, index) => parseWarpSource(entry, id, index))
  };
};

const loadRegisteredMap = (mapId: string): TileMap | null => {
  const entry = mapRegistry[mapId];
  if (!entry?.source) {
    return null;
  }

  return mapFromCompactSource(parseCompactMapSource(entry.source));
};

const loadRequiredMap = (mapId: string): TileMap => {
  const map = loadRegisteredMap(mapId);
  if (!map) {
    throw new Error(`Map registry entry ${mapId} does not have an exported compact map source.`);
  }

  return map;
};

export const loadPalletTownMap = (): TileMap =>
  loadRequiredMap('MAP_PALLET_TOWN');

export const loadPalletTownProfessorOaksLabMap = (): TileMap =>
  loadRequiredMap('MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB');

export const loadPalletTownPlayersHouse1FMap = (): TileMap =>
  loadRequiredMap('MAP_PALLET_TOWN_PLAYERS_HOUSE_1F');

export const loadPalletTownPlayersHouse2FMap = (): TileMap =>
  loadRequiredMap('MAP_PALLET_TOWN_PLAYERS_HOUSE_2F');

export const loadPalletTownRivalsHouseMap = (): TileMap =>
  loadRequiredMap('MAP_PALLET_TOWN_RIVALS_HOUSE');

export const loadCeladonCityMap = (): TileMap =>
  loadRequiredMap('MAP_CELADON_CITY');

export const loadCinnabarIslandMap = (): TileMap =>
  loadRequiredMap('MAP_CINNABAR_ISLAND');

export const loadCeruleanCityMap = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY');

export const loadCeruleanCityBikeShopMap = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_BIKE_SHOP');

export const loadCeruleanCityGymMap = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_GYM');

export const loadCeruleanCityHouse1Map = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_HOUSE1');

export const loadCeruleanCityHouse2Map = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_HOUSE2');

export const loadCeruleanCityHouse3Map = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_HOUSE3');

export const loadCeruleanCityHouse4Map = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_HOUSE4');

export const loadCeruleanCityHouse5Map = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_HOUSE5');

export const loadCeruleanCityMartMap = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_MART');

export const loadCeruleanCityPokemonCenter1FMap = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_POKEMON_CENTER_1F');

export const loadCeruleanCityPokemonCenter2FMap = (): TileMap =>
  loadRequiredMap('MAP_CERULEAN_CITY_POKEMON_CENTER_2F');

export const loadFuchsiaCityMap = (): TileMap =>
  loadRequiredMap('MAP_FUCHSIA_CITY');

export const loadIndigoPlateauExteriorMap = (): TileMap =>
  loadRequiredMap('MAP_INDIGO_PLATEAU_EXTERIOR');

export const loadIndigoPlateauPokemonCenter1FMap = (): TileMap =>
  loadRequiredMap('MAP_INDIGO_PLATEAU_POKEMON_CENTER_1F');

export const loadLavenderTownMap = (): TileMap =>
  loadRequiredMap('MAP_LAVENDER_TOWN');

export const loadMtEmberExteriorMap = (): TileMap =>
  loadRequiredMap('MAP_MT_EMBER_EXTERIOR');

export const loadOneIslandMap = (): TileMap =>
  loadRequiredMap('MAP_ONE_ISLAND');

export const loadOneIslandKindleRoadMap = (): TileMap =>
  loadRequiredMap('MAP_ONE_ISLAND_KINDLE_ROAD');

export const loadOneIslandTreasureBeachMap = (): TileMap =>
  loadRequiredMap('MAP_ONE_ISLAND_TREASURE_BEACH');

export const loadPewterCityGymMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_GYM');

export const loadPewterCityHouse1Map = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_HOUSE1');

export const loadPewterCityHouse2Map = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_HOUSE2');

export const loadPewterCityMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY');

export const loadPewterCityMartMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_MART');

export const loadPewterCityMuseum1FMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_MUSEUM_1F');

export const loadPewterCityMuseum2FMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_MUSEUM_2F');

export const loadPewterCityPokemonCenter1FMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_POKEMON_CENTER_1F');

export const loadPewterCityPokemonCenter2FMap = (): TileMap =>
  loadRequiredMap('MAP_PEWTER_CITY_POKEMON_CENTER_2F');

export const loadRoute1Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE1');

export const loadRoute2Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE2');

export const loadRoute24Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE24');

export const loadRoute25Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE25');

export const loadRoute3Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE3');

export const loadRoute4Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE4');

export const loadRoute5Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE5');

export const loadRoute6Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE6');

export const loadRoute7Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE7');

export const loadRoute8Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE8');

export const loadRoute9Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE9');

export const loadRoute10Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE10');

export const loadSaffronCityMap = (): TileMap =>
  loadRequiredMap('MAP_SAFFRON_CITY');

export const loadRockTunnel1FMap = (): TileMap =>
  loadRequiredMap('MAP_ROCK_TUNNEL_1F');

export const loadRockTunnelB1FMap = (): TileMap =>
  loadRequiredMap('MAP_ROCK_TUNNEL_B1F');

export const loadThreeIslandMap = (): TileMap =>
  loadRequiredMap('MAP_THREE_ISLAND');

export const loadThreeIslandBerryForestMap = (): TileMap =>
  loadRequiredMap('MAP_THREE_ISLAND_BERRY_FOREST');

export const loadThreeIslandBondBridgeMap = (): TileMap =>
  loadRequiredMap('MAP_THREE_ISLAND_BOND_BRIDGE');

export const loadThreeIslandPortMap = (): TileMap =>
  loadRequiredMap('MAP_THREE_ISLAND_PORT');

export const loadTwoIslandMap = (): TileMap =>
  loadRequiredMap('MAP_TWO_ISLAND');

export const loadTwoIslandCapeBrinkMap = (): TileMap =>
  loadRequiredMap('MAP_TWO_ISLAND_CAPE_BRINK');

export const loadVermilionCityMap = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY');

export const loadVermilionCityGymMap = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_GYM');

export const loadVermilionCityHouse1Map = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_HOUSE1');

export const loadVermilionCityHouse2Map = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_HOUSE2');

export const loadVermilionCityHouse3Map = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_HOUSE3');

export const loadVermilionCityMartMap = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_MART');

export const loadVermilionCityPokemonCenter1FMap = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_POKEMON_CENTER_1F');

export const loadVermilionCityPokemonCenter2FMap = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_POKEMON_CENTER_2F');

export const loadVermilionCityPokemonFanClubMap = (): TileMap =>
  loadRequiredMap('MAP_VERMILION_CITY_POKEMON_FAN_CLUB');

export const loadRoute2ViridianForestNorthEntranceMap = (): TileMap =>
  loadRequiredMap('MAP_ROUTE2_VIRIDIAN_FOREST_NORTH_ENTRANCE');

export const loadRoute2ViridianForestSouthEntranceMap = (): TileMap =>
  loadRequiredMap('MAP_ROUTE2_VIRIDIAN_FOREST_SOUTH_ENTRANCE');

export const loadRoute21NorthMap = (): TileMap =>
  loadRequiredMap('MAP_ROUTE21_NORTH');

export const loadRoute21SouthMap = (): TileMap =>
  loadRequiredMap('MAP_ROUTE21_SOUTH');

export const loadRoute22Map = (): TileMap =>
  loadRequiredMap('MAP_ROUTE22');

export const loadViridianCityMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_CITY');

export const loadViridianForestMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_FOREST');

export const loadViridianCityMartMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_CITY_MART');

export const loadViridianCityPokemonCenter1FMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_CITY_POKEMON_CENTER_1F');

export const loadViridianCityHouseMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_CITY_HOUSE');

export const loadViridianCityGymMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_CITY_GYM');

export const loadViridianCitySchoolMap = (): TileMap =>
  loadRequiredMap('MAP_VIRIDIAN_CITY_SCHOOL');

export const loadMapById = (mapId: string): TileMap | null =>
  loadRegisteredMap(mapId);
export const loadPrototypeRouteMap = (): TileMap =>
  loadRoute2Map();
