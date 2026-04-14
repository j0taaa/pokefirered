import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import { isWalkableAtPixel, type TileMap } from '../world/tileMap';

export interface PlayerState {
  position: Vec2;
  facing: 'up' | 'down' | 'left' | 'right';
}

const WALK_SPEED = 54;
const RUN_SPEED = 84;

export const createPlayer = (): PlayerState => ({
  position: vec2(3 * 16, 3 * 16),
  facing: 'down'
});

export const stepPlayer = (
  state: PlayerState,
  input: InputSnapshot,
  map: TileMap,
  dtSeconds: number
): PlayerState => {
  const direction = vec2();

  if (input.left) direction.x -= 1;
  if (input.right) direction.x += 1;
  if (input.up) direction.y -= 1;
  if (input.down) direction.y += 1;

  if (direction.x === 0 && direction.y === 0) {
    return state;
  }

  if (Math.abs(direction.x) > Math.abs(direction.y)) {
    state.facing = direction.x > 0 ? 'right' : 'left';
    direction.y = 0;
  } else if (direction.y !== 0) {
    state.facing = direction.y > 0 ? 'down' : 'up';
    direction.x = 0;
  }

  const speed = input.run ? RUN_SPEED : WALK_SPEED;
  const nextPosition = vec2(
    state.position.x + direction.x * speed * dtSeconds,
    state.position.y + direction.y * speed * dtSeconds
  );

  const collisionProbe = vec2(nextPosition.x + 8, nextPosition.y + 12);

  if (!isWalkableAtPixel(map, collisionProbe)) {
    return state;
  }

  state.position = nextPosition;
  return state;
};
