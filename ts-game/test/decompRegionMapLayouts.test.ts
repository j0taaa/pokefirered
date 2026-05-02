import { describe, expect, test } from 'vitest';
import {
  LAYER_COUNT,
  LAYER_DUNGEON,
  LAYER_MAP,
  REGION_MAP_HEIGHT,
  REGION_MAP_LAYOUTS,
  REGION_MAP_LAYOUT_SOURCES,
  REGION_MAP_WIDTH,
  getRegionMapSection
} from '../src/game/decompRegionMapLayouts';

describe('decomp region map layouts', () => {
  test('loads all four region_map_layout source files with decomp dimensions', () => {
    expect(Object.keys(REGION_MAP_LAYOUT_SOURCES)).toEqual(['Kanto', 'Sevii123', 'Sevii45', 'Sevii67']);
    for (const layout of Object.values(REGION_MAP_LAYOUTS)) {
      expect(layout).toHaveLength(LAYER_COUNT);
      for (const layer of layout) {
        expect(layer).toHaveLength(REGION_MAP_HEIGHT);
        expect(layer.every((row) => row.length === REGION_MAP_WIDTH)).toBe(true);
      }
    }
  });

  test('preserves Kanto map and dungeon cells exactly', () => {
    expect(getRegionMapSection('Kanto', LAYER_MAP, 4, 11)).toBe('MAPSEC_PALLET_TOWN');
    expect(getRegionMapSection('Kanto', LAYER_MAP, 14, 3)).toBe('MAPSEC_CERULEAN_CITY');
    expect(getRegionMapSection('Kanto', LAYER_DUNGEON, 9, 3)).toBe('MAPSEC_MT_MOON');
    expect(getRegionMapSection('Kanto', LAYER_DUNGEON, 12, 12)).toBe('MAPSEC_KANTO_SAFARI_ZONE');
  });

  test('preserves Sevii 1-3 map and dungeon cells exactly', () => {
    expect(getRegionMapSection('Sevii123', LAYER_MAP, 1, 8)).toBe('MAPSEC_ONE_ISLAND');
    expect(getRegionMapSection('Sevii123', LAYER_MAP, 18, 12)).toBe('MAPSEC_THREE_ISLAND');
    expect(getRegionMapSection('Sevii123', LAYER_DUNGEON, 2, 3)).toBe('MAPSEC_MT_EMBER');
    expect(getRegionMapSection('Sevii123', LAYER_DUNGEON, 14, 12)).toBe('MAPSEC_BERRY_FOREST');
  });

  test('preserves Sevii 4-5 map and dungeon cells exactly', () => {
    expect(getRegionMapSection('Sevii45', LAYER_MAP, 3, 4)).toBe('MAPSEC_FOUR_ISLAND');
    expect(getRegionMapSection('Sevii45', LAYER_MAP, 18, 12)).toBe('MAPSEC_MEMORIAL_PILLAR');
    expect(getRegionMapSection('Sevii45', LAYER_DUNGEON, 3, 4)).toBe('MAPSEC_ICEFALL_CAVE');
    expect(getRegionMapSection('Sevii45', LAYER_DUNGEON, 18, 9)).toBe('MAPSEC_LOST_CAVE');
  });

  test('preserves Sevii 6-7 map and dungeon cells exactly', () => {
    expect(getRegionMapSection('Sevii67', LAYER_MAP, 15, 0)).toBe('MAPSEC_OUTCAST_ISLAND');
    expect(getRegionMapSection('Sevii67', LAYER_MAP, 5, 8)).toBe('MAPSEC_SEVEN_ISLAND');
    expect(getRegionMapSection('Sevii67', LAYER_DUNGEON, 15, 0)).toBe('MAPSEC_ALTERING_CAVE');
    expect(getRegionMapSection('Sevii67', LAYER_DUNGEON, 9, 12)).toBe('MAPSEC_TANOBY_CHAMBERS');
  });

  test('matches decomp default behavior for out-of-range lookup', () => {
    expect(getRegionMapSection('Kanto', LAYER_MAP, 99, 99)).toBe('MAPSEC_NONE');
  });
});
