import { describe, expect, test } from 'vitest';
import {
  getRegionMapSectionById,
  getRegionMapSectionByName,
  gRegionMapSections,
  REGION_MAP_SECTIONS_SOURCE
} from '../src/game/decompRegionMapSections';

describe('decomp region map sections json', () => {
  test('loads every region map section in source order', () => {
    expect(REGION_MAP_SECTIONS_SOURCE.map_sections).toBe(gRegionMapSections);
    expect(gRegionMapSections).toHaveLength(197);
    expect(gRegionMapSections.slice(0, 5)).toEqual([
      { id: 'MAPSEC_LITTLEROOT_TOWN' },
      { id: 'MAPSEC_OLDALE_TOWN' },
      { id: 'MAPSEC_DEWFORD_TOWN' },
      { id: 'MAPSEC_LAVARIDGE_TOWN' },
      { id: 'MAPSEC_FALLARBOR_TOWN' }
    ]);
  });

  test('preserves named coordinates and explicit zero-sized special area', () => {
    expect(getRegionMapSectionById('MAPSEC_MONEAN_CHAMBER')).toEqual({
      id: 'MAPSEC_MONEAN_CHAMBER',
      name: 'MONEAN CHAMBER',
      x: 0,
      y: 0,
      width: 1,
      height: 1
    });
    expect(getRegionMapSectionByName('BIRTH ISLAND')).toEqual({
      id: 'MAPSEC_BIRTH_ISLAND',
      name: 'BIRTH ISLAND',
      x: 18,
      y: 13,
      width: 1,
      height: 1
    });
    expect(gRegionMapSections.at(-1)).toEqual({
      id: 'MAPSEC_SPECIAL_AREA',
      name: 'CELADON DEPT.',
      x: 0,
      y: 0,
      width: 0,
      height: 0
    });
  });
});
