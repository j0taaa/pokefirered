import { describe, expect, test } from 'vitest';
import {
  ABILITY_DESCRIPTIONS,
  ABILITY_TEXT_SOURCE,
  gAbilityDescriptionPointers,
  gAbilityNames,
  getAbilityDescription,
  getAbilityName
} from '../src/game/decompAbilityText';

describe('decomp ability text', () => {
  test('parses every static ability description and pointer row', () => {
    expect(ABILITY_TEXT_SOURCE).toContain('const u8 *const gAbilityDescriptionPointers[ABILITIES_COUNT]');
    expect(ABILITY_DESCRIPTIONS).toHaveLength(78);
    expect(gAbilityDescriptionPointers).toHaveLength(78);
    expect(gAbilityDescriptionPointers.slice(0, 4)).toEqual([
      { ability: 'ABILITY_NONE', descriptionSymbol: 'sNoneDescription', description: 'No special ability.' },
      { ability: 'ABILITY_STENCH', descriptionSymbol: 'sStenchDescription', description: 'Helps repel wild POKéMON.' },
      { ability: 'ABILITY_DRIZZLE', descriptionSymbol: 'sDrizzleDescription', description: 'Summons rain in battle.' },
      { ability: 'ABILITY_SPEED_BOOST', descriptionSymbol: 'sSpeedBoostDescription', description: 'Gradually boosts SPEED.' }
    ]);
  });

  test('parses every ability name with decomp spelling quirks', () => {
    expect(gAbilityNames).toHaveLength(78);
    expect(getAbilityName('ABILITY_COMPOUND_EYES')).toBe('COMPOUNDEYES');
    expect(getAbilityName('ABILITY_LIGHTNING_ROD')).toBe('LIGHTNINGROD');
    expect(getAbilityName('ABILITY_AIR_LOCK')).toBe('AIR LOCK');
    expect(getAbilityDescription('ABILITY_WONDER_GUARD')).toBe('“Super effective” hits.');
    expect(gAbilityNames.at(-1)).toEqual({ ability: 'ABILITY_AIR_LOCK', name: 'AIR LOCK' });
  });
});
