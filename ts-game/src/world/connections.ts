import type { InputSnapshot } from '../input/inputState';
import type { PlayerState } from '../game/player';
import type { MapConnectionSource } from './mapSource';
import type { TileMap } from './tileMap';

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
