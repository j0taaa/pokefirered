import { describe, expect, test } from 'vitest';
import {
  FIELD_RENDER_ORDER,
  getMetatileLayerPass,
  getSpritePriorityForElevation
} from '../src/rendering/fieldRenderOrder';

describe('field render order parity', () => {
  test('FIELD_RENDER_ORDER alternates sprites and map layers', () => {
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

  test('getMetatileLayerPass returns correct pass for covered, split, and normal types', () => {
    expect(getMetatileLayerPass(1, 0)).toBe('bottom');
    expect(getMetatileLayerPass(1, 4)).toBe('middle');
    expect(getMetatileLayerPass(2, 0)).toBe('bottom');
    expect(getMetatileLayerPass(2, 4)).toBe('top');
    expect(getMetatileLayerPass(0, 0)).toBe('middle');
    expect(getMetatileLayerPass(0, 4)).toBe('top');
  });

  test('getSpritePriorityForElevation maps elevation to priority', () => {
    expect(getSpritePriorityForElevation(0)).toBe(2);
    expect(getSpritePriorityForElevation(3)).toBe(2);
    expect(getSpritePriorityForElevation(4)).toBe(1);
    expect(getSpritePriorityForElevation(7)).toBe(2);
    expect(getSpritePriorityForElevation(13)).toBe(0);
    expect(getSpritePriorityForElevation(14)).toBe(0);
    expect(getSpritePriorityForElevation(undefined)).toBe(2);
    expect(getSpritePriorityForElevation(-1)).toBe(2);
    expect(getSpritePriorityForElevation(16)).toBe(2);
  });
});