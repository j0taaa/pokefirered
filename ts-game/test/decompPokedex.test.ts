import { describe, expect, test } from 'vitest';
import { formatDexHeight, formatDexWeight, getDecompPokedexEntry } from '../src/game/decompPokedex';

describe('decomp pokedex data', () => {
  test('loads decomp-backed pokedex metadata for known species', () => {
    const entry = getDecompPokedexEntry('CHARMANDER');
    expect(entry).not.toBeNull();
    expect(entry?.category).toBe('LIZARD');
    expect(entry?.heightDm).toBe(6);
    expect(entry?.weightHg).toBe(85);
    expect(entry?.description.length).toBeGreaterThan(10);
  });

  test('formats height and weight with pokedex-friendly units', () => {
    expect(formatDexHeight(6)).toBe(`2'00"`);
    expect(formatDexWeight(85)).toBe('18.7 lbs');
  });
});
