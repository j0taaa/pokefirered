import type { Vec2 } from './vec2';

export interface CameraState {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface CameraBounds {
  width: number;
  height: number;
}

export const createCamera = (
  viewportWidth: number,
  viewportHeight: number
): CameraState => ({
  x: 0,
  y: 0,
  viewportWidth,
  viewportHeight
});

export const followTarget = (
  camera: CameraState,
  target: Vec2,
  bounds: CameraBounds
): CameraState => {
  const centeredX = target.x - camera.viewportWidth / 2;
  const centeredY = target.y - camera.viewportHeight / 2;

  const maxX = Math.max(0, bounds.width - camera.viewportWidth);
  const maxY = Math.max(0, bounds.height - camera.viewportHeight);

  camera.x = clamp(centeredX, 0, maxX);
  camera.y = clamp(centeredY, 0, maxY);

  return camera;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
