import { describe, expect, test } from 'vitest';
import {
  allDecompMapIds,
  DECOMP_MAP_COUNT,
  EXPORTED_DECOMP_MAP_COUNT,
  exportedDecompMapIds,
  mapRegistry
} from '../src/world/mapRegistry';
import { loadMapById } from '../src/world/mapSource';

describe('generated map registry', () => {
  test('contains the complete decomp map id set', () => {
    expect(DECOMP_MAP_COUNT).toBe(425);
    expect(allDecompMapIds).toHaveLength(DECOMP_MAP_COUNT);
    expect(new Set(allDecompMapIds).size).toBe(DECOMP_MAP_COUNT);
    expect(mapRegistry.MAP_ROUTE2.name).toBe('Route2');
    expect(mapRegistry.MAP_DYNAMIC).toBeUndefined();
  });

  test('loads every exported decomp map through loadMapById', () => {
    expect(EXPORTED_DECOMP_MAP_COUNT).toBe(DECOMP_MAP_COUNT);
    expect(exportedDecompMapIds).toHaveLength(EXPORTED_DECOMP_MAP_COUNT);

    for (const mapId of exportedDecompMapIds) {
      const map = loadMapById(mapId);
      expect(map, mapId).not.toBeNull();
      expect(map?.id).toBe(mapId);
    }
  });

  test('loads maps that were previously registry-only placeholders', () => {
    expect(mapRegistry.MAP_CELADON_CITY_CONDOMINIUMS_1F.source).not.toBeNull();
    expect(loadMapById('MAP_CELADON_CITY_CONDOMINIUMS_1F')?.id).toBe('MAP_CELADON_CITY_CONDOMINIUMS_1F');
  });
});
