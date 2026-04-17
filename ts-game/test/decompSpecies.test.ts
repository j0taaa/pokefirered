import { describe, expect, test } from 'vitest';
import { formatTypeLabel, getDecompSpeciesInfo } from '../src/game/decompSpecies';

describe('decomp species data', () => {
  test('loads base stats and types for known species', () => {
    const info = getDecompSpeciesInfo('CHARMANDER');
    expect(info).not.toBeNull();
    expect(info?.baseAttack).toBe(52);
    expect(info?.baseSpAttack).toBe(60);
    expect(info?.types).toEqual(['fire']);
  });

  test('formats type labels in menu-friendly form', () => {
    expect(formatTypeLabel('flying')).toBe('FLYING');
  });
});
