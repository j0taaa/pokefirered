import type { Vec2 } from '../core/vec2';

export interface TileMap {
  width: number;
  height: number;
  tileSize: number;
  walkable: boolean[];
}

export const createPrototypeRouteMap = (): TileMap => {
  const width = 20;
  const height = 15;
  const walkable = new Array<boolean>(width * height).fill(true);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const edge = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const hedge = y === 5 && x > 2 && x < width - 3;
      const pond = x >= 12 && x <= 16 && y >= 8 && y <= 12;

      if (edge || hedge || pond) {
        walkable[y * width + x] = false;
      }
    }
  }

  walkable[5 * width + 10] = true;

  return {
    width,
    height,
    tileSize: 16,
    walkable
  };
};

export const isWalkableAtPixel = (map: TileMap, pos: Vec2): boolean => {
  const tileX = Math.floor(pos.x / map.tileSize);
  const tileY = Math.floor(pos.y / map.tileSize);

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return false;
  }

  return map.walkable[tileY * map.width + tileX];
};
