import { describe, expect, test } from 'vitest';
import {
  getObjectEventSpriteMetadata,
  resolveObjectEventFrameSource,
  type ObjectEventSpriteMetadata
} from '../src/rendering/decompTextureStore';

const standardTenFrameNpc: ObjectEventSpriteMetadata = {
  frameWidth: 16,
  frameHeight: 32,
  sourceFrames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
};

const nurse: ObjectEventSpriteMetadata = {
  frameWidth: 16,
  frameHeight: 32,
  sourceFrames: [0, 1, 2, 0, 0, 1, 1, 2, 2, 3]
};

describe('object event sprite frame sources', () => {
  test('keeps mixed player pic-table entries scoped to the current PNG', () => {
    expect(getObjectEventSpriteMetadata('OBJ_EVENT_GFX_RED_NORMAL')?.sourceFrames).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8
    ]);
  });

  test('uses decomp frame width for ten-frame NPC sheets', () => {
    const source = resolveObjectEventFrameSource(
      { width: 160, height: 32 },
      standardTenFrameNpc,
      'right',
      false,
      0
    );

    expect(source).toMatchObject({
      flipX: true,
      sourceWidth: 16,
      sourceHeight: 32,
      sourceX: 32,
      sourceY: 0
    });
  });

  test('resolves reused source frames from compact NPC sheets', () => {
    const source = resolveObjectEventFrameSource(
      { width: 64, height: 32 },
      nurse,
      'down',
      true,
      0.25
    );

    expect(source).toMatchObject({
      flipX: false,
      sourceWidth: 16,
      sourceHeight: 32,
      sourceX: 0,
      sourceY: 0
    });
  });

  test('holds walking frames for 8 decomp frames at 60 FPS', () => {
    const beforeDecompFrameEight = resolveObjectEventFrameSource(
      { width: 144, height: 32 },
      undefined,
      'down',
      true,
      7 / 60
    );
    const atDecompFrameEight = resolveObjectEventFrameSource(
      { width: 144, height: 32 },
      undefined,
      'down',
      true,
      8 / 60
    );

    expect(beforeDecompFrameEight.sourceX).toBe(3 * 16);
    expect(atDecompFrameEight.sourceX).toBe(0);
  });

  test('can start a normal step on the alternate foot like SetStepAnimHandleAlternation', () => {
    const alternateFoot = resolveObjectEventFrameSource(
      { width: 144, height: 32 },
      undefined,
      'down',
      true,
      0,
      1
    );

    expect(alternateFoot.sourceX).toBe(4 * 16);
  });
});
