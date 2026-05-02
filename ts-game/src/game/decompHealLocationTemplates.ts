import healLocationConstantsTemplateSource from '../../../src/data/heal_locations.constants.json.txt?raw';
import healLocationDataTemplateSource from '../../../src/data/heal_locations.json.txt?raw';

export const HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE = healLocationConstantsTemplateSource;
export const HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE = healLocationDataTemplateSource;

export const HEAL_LOCATIONS_TEMPLATE_FILES = {
  constants: HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE,
  data: HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE
} as const;

export const healLocationConstantsTemplateDeclaresEnum = (): boolean =>
  HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE.includes('HEAL_LOCATION_NONE')
  && HEAL_LOCATIONS_CONSTANTS_TEMPLATE_SOURCE.includes('NUM_HEAL_LOCATIONS');

export const healLocationDataTemplateDeclaresWhiteoutTables = (): boolean =>
  HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE.includes('sWhiteoutRespawnHealCenterMapIdxs')
  && HEAL_LOCATIONS_DATA_TEMPLATE_SOURCE.includes('sWhiteoutRespawnHealerNpcIds');
