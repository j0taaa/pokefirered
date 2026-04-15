import type { InputSnapshot } from '../input/inputState';
import type { PlayerState } from '../game/player';
import type { MapConnectionSource } from './mapSource';
import { isWalkableAtPixel, type TileMap } from './tileMap';

export interface ResolvedMapConnection {
  connection: MapConnectionSource;
  map: TileMap;
  position: { x: number; y: number };
}

export const findConnectionForInput = (
  map: TileMap,
  player: PlayerState,
  input: InputSnapshot
): MapConnectionSource | null => {
  const tileX = Math.floor((player.position.x + 8) / map.tileSize);
  const tileY = Math.floor((player.position.y + 12) / map.tileSize);
  const connections = map.metadata?.connections ?? [];

  if (input.up && tileY <= 0) {
    return connections.find((connection) => connection.direction === 'up') ?? null;
  }

  if (input.down && tileY >= map.height - 1) {
    return connections.find((connection) => connection.direction === 'down') ?? null;
  }

  if (input.left && tileX <= 0) {
    return connections.find((connection) => connection.direction === 'left') ?? null;
  }

  if (input.right && tileX >= map.width - 1) {
    return connections.find((connection) => connection.direction === 'right') ?? null;
  }

  return null;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const findNearestWalkableEntryTile = (
  map: TileMap,
  preferredX: number,
  preferredY: number,
  searchRadius = 3
): { x: number; y: number } => {
  const centerX = clamp(preferredX, 0, map.width - 1);
  const centerY = clamp(preferredY, 0, map.height - 1);

  for (let radius = 0; radius <= searchRadius; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        if (Math.abs(dx) + Math.abs(dy) !== radius) {
          continue;
        }

        const x = clamp(centerX + dx, 0, map.width - 1);
        const y = clamp(centerY + dy, 0, map.height - 1);
        const probe = {
          x: x * map.tileSize + 8,
          y: y * map.tileSize + 12
        };

        if (isWalkableAtPixel(map, probe)) {
          return { x, y };
        }
      }
    }
  }

  return {
    x: centerX,
    y: centerY
  };
};

export const getConnectionLandingTile = (
  sourceMap: TileMap,
  destinationMap: TileMap,
  connection: MapConnectionSource,
  player: PlayerState
): { x: number; y: number } => {
  const sourceTileX = Math.floor((player.position.x + 8) / sourceMap.tileSize);
  const sourceTileY = Math.floor((player.position.y + 12) / sourceMap.tileSize);

  switch (connection.direction) {
    case 'up':
      return findNearestWalkableEntryTile(
        destinationMap,
        sourceTileX - connection.offset,
        destinationMap.height - 2
      );
    case 'down':
      return findNearestWalkableEntryTile(destinationMap, sourceTileX - connection.offset, 1);
    case 'left':
      return findNearestWalkableEntryTile(destinationMap, destinationMap.width - 2, sourceTileY - connection.offset);
    case 'right':
      return findNearestWalkableEntryTile(destinationMap, 1, sourceTileY - connection.offset);
    case 'any':
      return findNearestWalkableEntryTile(destinationMap, sourceTileX - connection.offset, sourceTileY);
  }
};

export const resolveMapConnection = (
  sourceMap: TileMap,
  player: PlayerState,
  input: InputSnapshot,
  loadDestinationMap: (mapId: string) => TileMap | null
): ResolvedMapConnection | null => {
  const connection = findConnectionForInput(sourceMap, player, input);
  if (!connection) {
    return null;
  }

  const destinationMap = loadDestinationMap(connection.map);
  if (!destinationMap) {
    return null;
  }

  const tile = getConnectionLandingTile(sourceMap, destinationMap, connection, player);

  return {
    connection,
    map: destinationMap,
    position: {
      x: tile.x * destinationMap.tileSize,
      y: tile.y * destinationMap.tileSize
    }
  };
};
