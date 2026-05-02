import { vec2 } from '../core/vec2';
import type { PlayerState } from './player';
import type { TileMap } from '../world/tileMap';
import { MapGridGetElevationAt } from '../world/tileMap';
import { getCollisionAtCoords, resolveStepTarget } from './fieldCollision';

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

  const target = resolveStepTarget(
    map,
    { x: playerTileX, y: playerTileY },
    direction,
    loadMapById
  );
  if (!target?.viaConnection) {
    return null;
  }

  const elevation = MapGridGetElevationAt(map, playerTileX, playerTileY);
  const collision = getCollisionAtCoords(
    map,
    {
      id: 'player',
      currentTile: vec2(playerTileX, playerTileY),
      previousTile: vec2(playerTileX, playerTileY),
      facing: direction,
      initialTile: vec2(playerTileX, playerTileY),
      movementRangeX: 0,
      movementRangeY: 0,
      currentElevation: elevation,
      previousElevation: elevation,
      trackedByCamera: true,
      avatarMode: 'normal'
    },
    direction,
    target,
    [],
    loadMapById
  );

  if (collision.result !== 'none') {
    return null;
  }

  return {
    map: target.map,
    playerPosition: {
      x: target.tile.x * target.map.tileSize,
      y: target.tile.y * target.map.tileSize
    }
  };
};
