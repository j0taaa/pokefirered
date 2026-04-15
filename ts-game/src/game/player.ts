import type { InputSnapshot } from '../input/inputState';
import { vec2, type Vec2 } from '../core/vec2';
import {
  getLedgeJumpDirectionAtPixel,
  isDirectionalMoveBlocked,
  isWalkableAtPixel,
  type TileMap
} from '../world/tileMap';

export interface PlayerState {
  position: Vec2;
  facing: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
  jumping?: boolean;
  animationTime: number;
}

const WALK_SPEED = 54;
const RUN_SPEED = 84;

export const createPlayer = (): PlayerState => ({
  position: vec2(3 * 16, 3 * 16),
  facing: 'down',
  moving: false,
  jumping: false,
  animationTime: 0
});

const directionToVector = (facing: PlayerState['facing']): Vec2 => {
  switch (facing) {
    case 'up':
      return vec2(0, -1);
    case 'down':
      return vec2(0, 1);
    case 'left':
      return vec2(-1, 0);
    case 'right':
      return vec2(1, 0);
  }
};

export const stepPlayer = (
  state: PlayerState,
  input: InputSnapshot,
  map: TileMap,
  dtSeconds: number,
  isBlocked?: (nextPosition: Vec2) => boolean
): PlayerState => {
  const direction = vec2();

  if (input.left) direction.x -= 1;
  if (input.right) direction.x += 1;
  if (input.up) direction.y -= 1;
  if (input.down) direction.y += 1;

  if (direction.x === 0 && direction.y === 0) {
    state.moving = false;
    state.jumping = false;
    state.animationTime = 0;
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
  const movementVector = directionToVector(state.facing);
  const currentProbe = vec2(state.position.x + 8, state.position.y + 12);
  const facingProbe = vec2(
    currentProbe.x + movementVector.x * map.tileSize,
    currentProbe.y + movementVector.y * map.tileSize
  );

  if (getLedgeJumpDirectionAtPixel(map, facingProbe, state.facing)) {
    const landingPosition = vec2(
      state.position.x + movementVector.x * map.tileSize * 2,
      state.position.y + movementVector.y * map.tileSize * 2
    );
    const landingProbe = vec2(landingPosition.x + 8, landingPosition.y + 12);

    if (isWalkableAtPixel(map, landingProbe) && !isBlocked?.(landingPosition)) {
      state.position = landingPosition;
      state.moving = true;
      state.jumping = true;
      state.animationTime += dtSeconds;
      return state;
    }
  }

  const nextPosition = vec2(
    state.position.x + direction.x * speed * dtSeconds,
    state.position.y + direction.y * speed * dtSeconds
  );

  const collisionProbe = vec2(nextPosition.x + 8, nextPosition.y + 12);

  if (!isWalkableAtPixel(map, collisionProbe)) {
    state.moving = false;
    state.jumping = false;
    state.animationTime = 0;
    return state;
  }

  if (isDirectionalMoveBlocked(map, currentProbe, collisionProbe, state.facing)) {
    state.moving = false;
    state.jumping = false;
    state.animationTime = 0;
    return state;
  }

  if (isBlocked?.(nextPosition)) {
    state.moving = false;
    state.jumping = false;
    state.animationTime = 0;
    return state;
  }

  state.position = nextPosition;
  state.moving = true;
  state.jumping = false;
  state.animationTime += dtSeconds;
  return state;
};
