import { describe, expect, test } from 'vitest';
// @ts-ignore Vitest imports the ESM exporter directly for parity checks.
import { exportMap } from '../scripts/export-decomp-map.mjs';

describe('export-decomp-map', () => {
  test('exports maps by folder name', () => {
    const map = exportMap('Route21_North');

    expect(map.id).toBe('MAP_ROUTE21_NORTH');
    expect(map.metadata.name).toBe('Route21_North');
  });

  test('accepts MAP_* labels when they differ from folder names', () => {
    expect(exportMap('MAP_ROUTE21_NORTH')).toEqual(exportMap('Route21_North'));
  });

  test('accepts decomp labels for acronym-heavy maps', () => {
    expect(exportMap('MAP_SSANNE_EXTERIOR')).toEqual(exportMap('SSAnne_Exterior'));
  });

  test('reports label-aware lookup failures', () => {
    expect(() => exportMap('MAP_NOT_A_REAL_PLACE')).toThrow(
      'Expected a folder name, map name, or MAP_* label from data/maps.'
    );
  });
});
