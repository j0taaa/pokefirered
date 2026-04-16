import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import { isWalkableAtPixel, type TileMap } from '../world/tileMap';

export interface PlayerState {
  position: Vec2;
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  animationTime: number;
}

const WALK_SPEED = 54;
const RUN_SPEED = 84;

export const createPlayer = (): PlayerState => ({
  position: vec2(3 * 16, 3 * 16),
  facing: 'down',
  moving: false,
  animationTime: 0
});

export const getPlayerTilePosition = (position: Vec2, tileSize: number): Vec2 =>
  vec2(
    Math.floor((position.x + 8) / tileSize),
    Math.floor((position.y + 12) / tileSize)
  );

export const resolveInputDirection = (input: InputSnapshot): PlayerState['facing'] | null => {
  const direction = vec2();

  if (input.left) direction.x -= 1;
  if (input.right) direction.x += 1;
  if (input.up) direction.y -= 1;
  if (input.down) direction.y += 1;

  if (direction.x === 0 && direction.y === 0) {
    return null;
  }

  if (Math.abs(direction.x) > Math.abs(direction.y)) {
    return direction.x > 0 ? 'right' : 'left';
  }

  return direction.y > 0 ? 'down' : 'up';
};

export const stepPlayer = (
  state: PlayerState,
  input: InputSnapshot,
  map: TileMap,
  dtSeconds: number,
  isBlocked?: (nextPosition: Vec2) => boolean
): PlayerState => {
  const facing = resolveInputDirection(input);
  if (!facing) {
    state.moving = false;
    state.animationTime = 0;
    return state;
  }

  state.facing = facing;

  const direction = vec2(
    facing === 'left' ? -1 : facing === 'right' ? 1 : 0,
    facing === 'up' ? -1 : facing === 'down' ? 1 : 0
  );

  const speed = input.run ? RUN_SPEED : WALK_SPEED;
  const nextPosition = vec2(
    state.position.x + direction.x * speed * dtSeconds,
    state.position.y + direction.y * speed * dtSeconds
  );

  const collisionProbe = vec2(nextPosition.x + 8, nextPosition.y + 12);

  if (!isWalkableAtPixel(map, collisionProbe)) {
    state.moving = false;
    state.animationTime = 0;
    return state;
  }

  if (isBlocked?.(nextPosition)) {
    state.moving = false;
    state.animationTime = 0;
    return state;
  }

  state.position = nextPosition;
  state.moving = true;
  state.animationTime += dtSeconds;
  return state;
};
