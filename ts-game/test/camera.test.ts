import { describe, expect, test } from 'vitest';
import { createCamera, followTarget } from '../src/core/camera';

describe('camera follow behavior', () => {
  test('centers on target when there is enough map room', () => {
    const camera = createCamera(160, 128);

    followTarget(camera, { x: 120, y: 80 }, { width: 640, height: 480 });

    expect(camera.x).toBe(40);
    expect(camera.y).toBe(16);
  });

  test('clamps to map bounds near top-left and bottom-right', () => {
    const camera = createCamera(160, 128);

    followTarget(camera, { x: 10, y: 10 }, { width: 320, height: 240 });
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);

    followTarget(camera, { x: 400, y: 400 }, { width: 320, height: 240 });
    expect(camera.x).toBe(160);
    expect(camera.y).toBe(112);
  });
});
