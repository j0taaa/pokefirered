import regionMapLayoutKantoSource from '../../../src/data/region_map/region_map_layout_kanto.h?raw';
import regionMapLayoutSevii123Source from '../../../src/data/region_map/region_map_layout_sevii_123.h?raw';
import regionMapLayoutSevii45Source from '../../../src/data/region_map/region_map_layout_sevii_45.h?raw';
import regionMapLayoutSevii67Source from '../../../src/data/region_map/region_map_layout_sevii_67.h?raw';

export const LAYER_MAP = 0;
export const LAYER_DUNGEON = 1;
export const LAYER_COUNT = 2;
export const REGION_MAP_HEIGHT = 15;
export const REGION_MAP_WIDTH = 22;

export type RegionMapLayer = typeof LAYER_MAP | typeof LAYER_DUNGEON;
export type RegionMapLayoutName = 'Kanto' | 'Sevii123' | 'Sevii45' | 'Sevii67';
export type RegionMapLayout = readonly [readonly string[][], readonly string[][]];

export const REGION_MAP_LAYOUT_SOURCES: Record<RegionMapLayoutName, string> = {
  Kanto: regionMapLayoutKantoSource,
  Sevii123: regionMapLayoutSevii123Source,
  Sevii45: regionMapLayoutSevii45Source,
  Sevii67: regionMapLayoutSevii67Source
};

const parseLayerRows = (source: string, layerName: 'LAYER_MAP' | 'LAYER_DUNGEON'): string[][] => {
  const start = source.indexOf(`[${layerName}]`);
  if (start < 0) {
    throw new Error(`Missing ${layerName} in region map layout source`);
  }

  const nextLayer = layerName === 'LAYER_MAP' ? source.indexOf('[LAYER_DUNGEON]', start) : source.indexOf('\n};', start);
  const block = source.slice(start, nextLayer < 0 ? undefined : nextLayer);
  const rows = [...block.matchAll(/\{([^{}]+)\}/gu)].map((match) =>
    match[1]
      .split(',')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
  );

  if (rows.length !== REGION_MAP_HEIGHT || rows.some((row) => row.length !== REGION_MAP_WIDTH)) {
    throw new Error(`Unexpected ${layerName} region map dimensions`);
  }

  return rows;
};

export const parseRegionMapLayout = (source: string): RegionMapLayout => [
  parseLayerRows(source, 'LAYER_MAP'),
  parseLayerRows(source, 'LAYER_DUNGEON')
];

export const REGION_MAP_LAYOUTS: Record<RegionMapLayoutName, RegionMapLayout> = {
  Kanto: parseRegionMapLayout(regionMapLayoutKantoSource),
  Sevii123: parseRegionMapLayout(regionMapLayoutSevii123Source),
  Sevii45: parseRegionMapLayout(regionMapLayoutSevii45Source),
  Sevii67: parseRegionMapLayout(regionMapLayoutSevii67Source)
};

export const getRegionMapSection = (
  layoutName: RegionMapLayoutName,
  layer: RegionMapLayer,
  x: number,
  y: number
): string => REGION_MAP_LAYOUTS[layoutName][layer][y]?.[x] ?? 'MAPSEC_NONE';
