import prototypeRouteMapJson from './maps/prototypeRoute.json';
import type { TileMap } from './tileMap';

export interface MapSource {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
}

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isBooleanArray = (value: unknown): value is boolean[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'boolean');

export const mapFromSource = (source: MapSource): TileMap => {
  const expectedTiles = source.width * source.height;

  if (source.walkable.length !== expectedTiles) {
    throw new Error(
      `Map source \"${source.id}\" has walkable length ${source.walkable.length}, expected ${expectedTiles}.`
    );
  }

  return {
    width: source.width,
    height: source.height,
    tileSize: source.tileSize,
    walkable: [...source.walkable]
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
    throw new Error(`Map source \"${id}\" must define positive integer width and height.`);
  }

  if (!isPositiveInteger(candidate.tileSize)) {
    throw new Error(`Map source \"${id}\" must define a positive integer tileSize.`);
  }

  if (!isBooleanArray(candidate.walkable)) {
    throw new Error(`Map source \"${id}\" must include a boolean walkable array.`);
  }

  return {
    id,
    width: candidate.width,
    height: candidate.height,
    tileSize: candidate.tileSize,
    walkable: candidate.walkable
  };
};

export const loadPrototypeRouteMap = (): TileMap =>
  mapFromSource(parseMapSource(prototypeRouteMapJson));
