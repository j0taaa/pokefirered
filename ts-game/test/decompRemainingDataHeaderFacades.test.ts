import { describe, expect, test } from 'vitest';
import {
  FIELD_EFFECT_OBJECTS_H_TRANSLATION_UNIT,
  getFieldEffectObjectRawDeclarations,
  getFieldEffectObjectUnparsedRemainder
} from '../src/game/decompFieldEffectObjects';
import {
  HEAL_LOCATIONS_H_TRANSLATION_UNIT,
  HEAL_LOCATIONS_JSON_TRANSLATION_UNIT,
  HEAL_LOCATIONS,
  HEAL_LOCATIONS_SOURCE
} from '../src/game/decompHealLocations';
import {
  HEAL_LOCATIONS_CONSTANTS_JSON_TXT_TRANSLATION_UNIT
} from '../src/game/decompHealLocationsConstantsJson';
import {
  HEAL_LOCATIONS_JSON_TXT_TRANSLATION_UNIT
} from '../src/game/decompHealLocationsJson';
import {
  MOVEMENT_TYPE_FUNC_TABLES_H_TRANSLATION_UNIT,
  gMovementTypeFunctionTables,
  gMovementTypePrototypes
} from '../src/game/decompMovementTypeFuncTables';
import {
  OBJECT_EVENT_GRAPHICS_INFO_H_TRANSLATION_UNIT,
  gObjectEventGraphicsInfos
} from '../src/game/decompObjectEventGraphicsInfo';
import {
  OBJECT_EVENT_GRAPHICS_INFO_POINTERS_H_TRANSLATION_UNIT,
  gObjectEventGraphicsInfoPointers
} from '../src/game/decompObjectEventGraphicsInfoPointers';
import {
  OBJECT_EVENT_PIC_TABLES_H_TRANSLATION_UNIT,
  gObjectEventPicTables
} from '../src/game/decompObjectEventPicTables';
import {
  REGION_MAP_LAYOUT_KANTO_H_TRANSLATION_UNIT,
  REGION_MAP_LAYOUTS,
  REGION_MAP_LAYOUT_SOURCES
} from '../src/game/decompRegionMapLayoutKanto';
import { REGION_MAP_LAYOUT_SEVII_123_H_TRANSLATION_UNIT } from '../src/game/decompRegionMapLayoutSevii123';
import { REGION_MAP_LAYOUT_SEVII_45_H_TRANSLATION_UNIT } from '../src/game/decompRegionMapLayoutSevii45';
import { REGION_MAP_LAYOUT_SEVII_67_H_TRANSLATION_UNIT } from '../src/game/decompRegionMapLayoutSevii67';
import {
  REGION_MAP_ENTRIES_H_TRANSLATION_UNIT,
  REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE
} from '../src/game/decompRegionMapEntries';
import {
  REGION_MAP_ENTRY_STRINGS_H_TRANSLATION_UNIT,
  REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE
} from '../src/game/decompRegionMapEntryStrings';
import {
  REGION_MAP_SECTIONS_CONSTANTS_JSON_TXT_TRANSLATION_UNIT,
  REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE
} from '../src/game/decompRegionMapSectionsConstantsJson';
import {
  REGION_MAP_SECTIONS_ENTRIES_JSON_TXT_TRANSLATION_UNIT
} from '../src/game/decompRegionMapSectionsEntriesJson';
import {
  REGION_MAP_SECTIONS_STRINGS_JSON_TXT_TRANSLATION_UNIT
} from '../src/game/decompRegionMapSectionsStringsJson';
import {
  TRAINER_BACK_PIC_ANIMS_H_TRANSLATION_UNIT,
  gTrainerBackAnimsPtrTable,
  sAnimCmd_Red_1
} from '../src/game/decompTrainerBackPicAnims';
import {
  TRAINER_BACK_PIC_TABLES_H_TRANSLATION_UNIT,
  gTrainerBackPicTable
} from '../src/game/decompTrainerBackPicTables';
import {
  WILD_ENCOUNTERS_JSON_TXT_TRANSLATION_UNIT,
  WILD_ENCOUNTERS_JSON_SOURCE,
  getRawWildEncounters
} from '../src/game/decompWildEncountersJson';

describe('remaining decomp data/header facades', () => {
  test('anchors field-effect, heal-location, object-event, and wild encounter sources', () => {
    expect(FIELD_EFFECT_OBJECTS_H_TRANSLATION_UNIT).toBe('src/data/field_effects/field_effect_objects.h');
    expect(getFieldEffectObjectRawDeclarations()).toHaveLength(166);
    expect(getFieldEffectObjectUnparsedRemainder()).toBe('');

    expect(HEAL_LOCATIONS_H_TRANSLATION_UNIT).toBe('src/data/heal_locations.h');
    expect(HEAL_LOCATIONS_JSON_TRANSLATION_UNIT).toBe('src/data/heal_locations.json');
    expect(HEAL_LOCATIONS_CONSTANTS_JSON_TXT_TRANSLATION_UNIT).toBe('src/data/heal_locations.constants.json.txt');
    expect(HEAL_LOCATIONS_JSON_TXT_TRANSLATION_UNIT).toBe('src/data/heal_locations.json.txt');
    expect(HEAL_LOCATIONS_SOURCE.heal_locations).toHaveLength(20);
    expect(HEAL_LOCATIONS[0]?.id).toBe('HEAL_LOCATION_PALLET_TOWN');

    expect(MOVEMENT_TYPE_FUNC_TABLES_H_TRANSLATION_UNIT).toBe('src/data/object_events/movement_type_func_tables.h');
    expect(gMovementTypePrototypes).toHaveLength(160);
    expect(gMovementTypeFunctionTables).toHaveLength(55);

    expect(OBJECT_EVENT_GRAPHICS_INFO_H_TRANSLATION_UNIT).toBe('src/data/object_events/object_event_graphics_info.h');
    expect(gObjectEventGraphicsInfos).toHaveLength(154);
    expect(OBJECT_EVENT_GRAPHICS_INFO_POINTERS_H_TRANSLATION_UNIT).toBe('src/data/object_events/object_event_graphics_info_pointers.h');
    expect(gObjectEventGraphicsInfoPointers).toHaveLength(152);
    expect(OBJECT_EVENT_PIC_TABLES_H_TRANSLATION_UNIT).toBe('src/data/object_events/object_event_pic_tables.h');
    expect(gObjectEventPicTables).toHaveLength(151);

    expect(WILD_ENCOUNTERS_JSON_TXT_TRANSLATION_UNIT).toBe('src/data/wild_encounters.json.txt');
    expect(JSON.parse(WILD_ENCOUNTERS_JSON_SOURCE)).toEqual(getRawWildEncounters());
  });

  test('anchors region-map templates/layouts and trainer back-pic data headers', () => {
    expect(REGION_MAP_LAYOUT_KANTO_H_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_layout_kanto.h');
    expect(REGION_MAP_LAYOUT_SEVII_123_H_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_layout_sevii_123.h');
    expect(REGION_MAP_LAYOUT_SEVII_45_H_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_layout_sevii_45.h');
    expect(REGION_MAP_LAYOUT_SEVII_67_H_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_layout_sevii_67.h');
    expect(REGION_MAP_LAYOUT_SOURCES.Kanto).toContain('sRegionMapSections_Kanto');
    expect(REGION_MAP_LAYOUTS.Kanto[0]).toHaveLength(15);

    expect(REGION_MAP_ENTRIES_H_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_entries.h');
    expect(REGION_MAP_SECTION_ENTRIES_TEMPLATE_SOURCE).toContain('static const u8 *const sMapNames[]');
    expect(REGION_MAP_ENTRY_STRINGS_H_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_entry_strings.h');
    expect(REGION_MAP_SECTION_STRINGS_TEMPLATE_SOURCE).toContain('static const u8 sMapsecName_');
    expect(REGION_MAP_SECTIONS_CONSTANTS_JSON_TXT_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_sections.constants.json.txt');
    expect(REGION_MAP_SECTION_CONSTANTS_TEMPLATE_SOURCE).toContain('MAPSEC_NONE');
    expect(REGION_MAP_SECTIONS_ENTRIES_JSON_TXT_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_sections.entries.json.txt');
    expect(REGION_MAP_SECTIONS_STRINGS_JSON_TXT_TRANSLATION_UNIT).toBe('src/data/region_map/region_map_sections.strings.json.txt');

    expect(TRAINER_BACK_PIC_ANIMS_H_TRANSLATION_UNIT).toBe('src/data/trainer_graphics/back_pic_anims.h');
    expect(gTrainerBackAnimsPtrTable).toHaveLength(6);
    expect(sAnimCmd_Red_1[0]).toEqual({ kind: 'frame', imageValue: 1, duration: 20 });
    expect(TRAINER_BACK_PIC_TABLES_H_TRANSLATION_UNIT).toBe('src/data/trainer_graphics/back_pic_tables.h');
    expect(gTrainerBackPicTable).toHaveLength(6);
    expect(gTrainerBackPicTable[0]).toEqual({ data: 'gTrainerBackPic_Red', size: 0x2800, tag: 0 });
  });
});
