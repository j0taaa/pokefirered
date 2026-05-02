import regionMapSectionsSource from '../../../src/data/region_map/region_map_sections.json';

export interface RegionMapSection {
  id?: string;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface RegionMapSectionsPayload {
  map_sections: RegionMapSection[];
}

export const REGION_MAP_SECTIONS_SOURCE = regionMapSectionsSource as RegionMapSectionsPayload;
export const gRegionMapSections = REGION_MAP_SECTIONS_SOURCE.map_sections;

export const getRegionMapSectionById = (id: string): RegionMapSection | undefined =>
  gRegionMapSections.find((section) => section.id === id);

export const getRegionMapSectionByName = (name: string): RegionMapSection | undefined =>
  gRegionMapSections.find((section) => section.name === name);
