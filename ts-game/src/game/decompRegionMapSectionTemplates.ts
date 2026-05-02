import regionMapSectionConstantsTemplateSource from '../../../src/data/region_map/region_map_sections.constants.json.txt?raw';
import regionMapSectionEntriesTemplateSource from '../../../src/data/region_map/region_map_sections.entries.json.txt?raw';
import regionMapSectionStringsTemplateSource from '../../../src/data/region_map/region_map_sections.strings.json.txt?raw';

export const REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE = regionMapSectionConstantsTemplateSource;
export const REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE = regionMapSectionEntriesTemplateSource;
export const REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE = regionMapSectionStringsTemplateSource;

export const REGION_MAP_SECTION_TEMPLATE_FILES = {
  constants: REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE,
  entries: REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE,
  strings: REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE
} as const;

export const METLOC_SPECIAL_EGG = 0xfd;
export const METLOC_IN_GAME_TRADE = 0xfe;
export const METLOC_FATEFUL_ENCOUNTER = 0xff;

export const regionMapConstantsTemplateDeclaresSentinels = (): boolean =>
  REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE.includes('MAPSEC_NONE')
  && REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE.includes('MAPSEC_COUNT')
  && REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE.includes('KANTO_MAPSEC_START   MAPSEC_PALLET_TOWN')
  && REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE.includes('SEVII_MAPSEC_START   MAPSEC_ONE_ISLAND');

export const regionMapEntriesTemplateDeclaresCoreTables = (): boolean =>
  REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE.includes('static const u8 *const sMapNames[]')
  && REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE.includes('static const u16 sMapSectionTopLeftCorners[MAPSEC_COUNT][2]')
  && REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE.includes('static const u16 sMapSectionDimensions[MAPSEC_COUNT][2]');

export const regionMapStringsTemplateDeclaresNameCloneHandling = (): boolean =>
  REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE.includes('name_clone')
  && REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE.includes('sMapsecName_{{ cleanString(map_section.name) }}_Clone');
