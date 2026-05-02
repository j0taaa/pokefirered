import { describe, expect, test } from 'vitest';
import {
  HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE,
  HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE,
  HEAL_LOCATIONS_TEMPLATE_FILES,
  healLocationConstantsTemplateDeclaresEnum,
  healLocationDataTemplateDeclaresWhiteoutTables
} from '../src/game/decompHealLocationTemplates';

describe('decomp heal location generator templates', () => {
  test('preserves the constants template enum structure', () => {
    expect(HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE).toContain('#ifndef GUARD_CONSTANTS_HEAL_LOCATIONS_H');
    expect(HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE).toContain('HEAL_LOCATION_NONE');
    expect(HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE).toContain('{{ heal_location.id }}');
    expect(HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE).toContain('NUM_HEAL_LOCATIONS');
    expect(healLocationConstantsTemplateDeclaresEnum()).toBe(true);
  });

  test('preserves the data template tables and MAP_GROUP/MAP_NUM expansions', () => {
    expect(HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE).toContain('static const struct HealLocation sHealLocations[NUM_HEAL_LOCATIONS - 1]');
    expect(HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE).toContain('.mapGroup = MAP_GROUP({{ heal_location.map }})');
    expect(HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE).toContain('sWhiteoutRespawnHealCenterMapIdxs');
    expect(HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE).toContain('sWhiteoutRespawnHealerNpcIds');
    expect(healLocationDataTemplateDeclaresWhiteoutTables()).toBe(true);
  });

  test('exposes both raw template files without transformation', () => {
    expect(HEAL_LOCATIONS_TEMPLATE_FILES.constants).toBe(HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE);
    expect(HEAL_LOCATIONS_TEMPLATE_FILES.data).toBe(HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE);
  });
});
