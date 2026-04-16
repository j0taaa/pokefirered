import { vec2 } from '../core/vec2';
import type { PlayerState } from './player';
import type { TileMap } from '../world/tileMap';
import { isWalkableAtTile } from '../world/tileMap';

export interface MapConnectionTransition {
  map: TileMap;
  playerPosition: { x: number; y: number };
}

export const resolveMapConnectionTransition = (
  map: TileMap,
  playerTileX: number,
  playerTileY: number,
  direction: PlayerState['facing'] | null,
  loadMapById: (mapId: string) => TileMap | null
): MapConnectionTransition | null => {
  if (!direction) {
    return null;
  }

  const connection = map.connections.find((entry) => entry.direction === direction);
  if (!connection) {
    return null;
  }

  const atConnectedEdge = (
    (direction === 'up' && playerTileY === 0)
    || (direction === 'down' && playerTileY === map.height - 1)
    || (direction === 'left' && playerTileX === 0)
    || (direction === 'right' && playerTileX === map.width - 1)
  );

  if (!atConnectedEdge) {
    return null;
  }

  const destinationMap = loadMapById(connection.map);
  if (!destinationMap) {
    return null;
  }

  const destinationTile = vec2(playerTileX, playerTileY);
  switch (direction) {
    case 'up':
      destinationTile.x = playerTileX - connection.offset;
      destinationTile.y = destinationMap.height - 1;
      break;
    case 'down':
      destinationTile.x = playerTileX - connection.offset;
      destinationTile.y = 0;
      break;
    case 'left':
      destinationTile.x = destinationMap.width - 1;
      destinationTile.y = playerTileY - connection.offset;
      break;
    case 'right':
      destinationTile.x = 0;
      destinationTile.y = playerTileY - connection.offset;
      break;
  }

  if (!isWalkableAtTile(destinationMap, destinationTile.x, destinationTile.y)) {
    return null;
  }

  return {
    map: destinationMap,
    playerPosition: {
      x: destinationTile.x * destinationMap.tileSize,
      y: destinationTile.y * destinationMap.tileSize
    }
  };
};
