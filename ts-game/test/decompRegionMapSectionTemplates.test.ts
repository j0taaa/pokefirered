import { describe, expect, test } from 'vitest';
import {
  METLOC_FATEFUL_ENCOUNTER,
  METLOC_IN_GAME_TRADE,
  METLOC_SPECIAL_EGG,
  REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE,
  REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE,
  REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE,
  REGION_MAP_SECTION_TEMPLATE_FILES,
  regionMapConstantsTemplateDeclaresSentinels,
  regionMapEntriesTemplateDeclaresCoreTables,
  regionMapStringsTemplateDeclaresNameCloneHandling
} from '../src/game/decompRegionMapSectionTemplates';

describe('decomp region map section generator templates', () => {
  test('preserves constants template enum, starts, and special met location values', () => {
    expect(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE).toContain('#ifndef GUARD_CONSTANTS_REGION_MAP_SECTIONS_H');
    expect(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE).toContain('{{ map_section.id }}');
    expect(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE).toContain('MAPSEC_NONE');
    expect(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE).toContain('KANTO_MAPSEC_START   MAPSEC_PALLET_TOWN');
    expect(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE).toContain('SEVII_MAPSEC_START   MAPSEC_ONE_ISLAND');
    expect(METLOC_SPECIAL_EGG).toBe(0xfd);
    expect(METLOC_IN_GAME_TRADE).toBe(0xfe);
    expect(METLOC_FATEFUL_ENCOUNTER).toBe(0xff);
    expect(regionMapConstantsTemplateDeclaresSentinels()).toBe(true);
  });

  test('preserves strings template name de-duplication and clone handling', () => {
    expect(REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE).toContain('GUARD_DATA_REGION_MAP_REGION_MAP_ENTRY_STRINGS_H');
    expect(REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE).toContain('setVar(map_section.name, map_section.id)');
    expect(REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE).toContain('static const u8 sMapsecName_{{ cleanString(map_section.name) }}[]');
    expect(REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE).toContain('name_clone');
    expect(regionMapStringsTemplateDeclaresNameCloneHandling()).toBe(true);
  });

  test('preserves entries template map names, top-left corners, and dimensions tables', () => {
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('static const u8 *const sMapNames[]');
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('[{{ map_section.id }} - KANTO_MAPSEC_START]');
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('sMapSectionTopLeftCorners[MAPSEC_COUNT][2]');
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('{ {{ map_section.x }}, {{ map_section.y }} }');
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('sMapSectionDimensions[MAPSEC_COUNT][2]');
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('{ {{ map_section.width }}, {{ map_section.height }} }');
    expect(regionMapEntriesTemplateDeclaresCoreTables()).toBe(true);
  });

  test('exposes the three raw template files without transformation', () => {
    expect(REGION_MAP_SECTION_TEMPLATE_FILES.constants).toBe(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE);
    expect(REGION_MAP_SECTION_TEMPLATE_FILES.entries).toBe(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE);
    expect(REGION_MAP_SECTION_TEMPLATE_FILES.strings).toBe(REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE);
  });
});
