import { describe, expect, test } from 'vitest';
import { getMapTextureKey } from '../src/rendering/decompTextureStore';
import {
  FIELD_RENDER_ORDER,
  getMetatileLayerPass,
  getSpritePriorityForElevation
} from '../src/rendering/fieldRenderOrder';

describe('decomp texture store', () => {
  test('distinguishes map texture cache entries by metatile id and layer type', () => {
    expect(getMapTextureKey(42, 0)).toBe('42:0');
    expect(getMapTextureKey(42, 1)).toBe('42:1');
    expect(getMapTextureKey(42, 0)).not.toBe(getMapTextureKey(42, 1));
  });

  test('routes metatile halves through the same field passes as the decomp', () => {
    expect(getMetatileLayerPass(0, 0)).toBe('middle');
    expect(getMetatileLayerPass(0, 4)).toBe('top');
    expect(getMetatileLayerPass(1, 0)).toBe('bottom');
    expect(getMetatileLayerPass(1, 4)).toBe('middle');
    expect(getMetatileLayerPass(2, 0)).toBe('bottom');
    expect(getMetatileLayerPass(2, 4)).toBe('top');
  });

  test('maps sprite priority from elevation like the original object renderer', () => {
    expect(getSpritePriorityForElevation(3)).toBe(2);
    expect(getSpritePriorityForElevation(4)).toBe(1);
    expect(getSpritePriorityForElevation(13)).toBe(0);
    expect(getSpritePriorityForElevation(undefined)).toBe(2);
  });

  test('renders field sprites in the same priority slots as the decomp bg stack', () => {
    expect(FIELD_RENDER_ORDER).toEqual([
      { type: 'sprites', priority: 3 },
      { type: 'map', pass: 'bottom' },
      { type: 'sprites', priority: 2 },
      { type: 'map', pass: 'middle' },
      { type: 'sprites', priority: 1 },
      { type: 'map', pass: 'top' },
      { type: 'sprites', priority: 0 }
    ]);
  });
});
