import { describe, expect, test } from 'vitest';
import {
  parseWildEncountersTemplateMetadata,
  WILD_ENCOUNTERS_TEMPLATE_METADATA,
  WILD_ENCOUNTERS_TEMPLATE_SOURCE
} from '../src/game/decompWildEncountersTemplate';

describe('decomp wild encounters generator template', () => {
  test('preserves the raw wild encounters template source', () => {
    expect(WILD_ENCOUNTERS_TEMPLATE_SOURCE.trimStart()).toMatch(/^\{\{ doNotModifyHeader \}\}/u);
    expect(WILD_ENCOUNTERS_TEMPLATE_SOURCE).toContain('const struct WildPokemonHeader {{ wild_encounter_group.label }}[]');
    expect(WILD_ENCOUNTERS_TEMPLATE_SOURCE.trimEnd().split('\n')).toHaveLength(107);
  });

  test('parses template directives and emitted declaration targets', () => {
    expect(parseWildEncountersTemplateMetadata(WILD_ENCOUNTERS_TEMPLATE_SOURCE)).toEqual(
      WILD_ENCOUNTERS_TEMPLATE_METADATA
    );
    expect(WILD_ENCOUNTERS_TEMPLATE_METADATA.directives.slice(0, 6)).toEqual([
      'for wild_encounter_group in wild_encounter_groups',
      'for wild_encounter_field in wild_encounter_group.fields',
      'for encounter_rate in wild_encounter_field.encounter_rates',
      'endfor',
      'for field_subgroup_key, field_subgroup_subarray in wild_encounter_field.groups',
      'for field_subgroup_index in field_subgroup_subarray'
    ]);
    expect(WILD_ENCOUNTERS_TEMPLATE_METADATA.structDeclarations).toEqual([
      'WildPokemon {{ encounter.base_label }}_LandMons',
      'WildPokemon {{ encounter.base_label }}_WaterMons',
      'WildPokemon {{ encounter.base_label }}_RockSmashMons',
      'WildPokemon {{ encounter.base_label }}_FishingMons',
      'WildPokemonHeader {{ wild_encounter_group.label }}'
    ]);
    expect(WILD_ENCOUNTERS_TEMPLATE_METADATA.infoDeclarations).toEqual([
      '{{ encounter.base_label }}_LandMonsInfo',
      '{{ encounter.base_label }}_WaterMonsInfo',
      '{{ encounter.base_label }}_RockSmashMonsInfo',
      '{{ encounter.base_label }}_FishingMonsInfo'
    ]);
  });

  test('keeps the emitted wild pokemon header field order intact', () => {
    expect(WILD_ENCOUNTERS_TEMPLATE_METADATA.headerFields).toEqual([
      'mapGroup',
      'mapNum',
      'landMonsInfo',
      'waterMonsInfo',
      'rockSmashMonsInfo',
      'fishingMonsInfo',
      'mapGroup',
      'mapNum',
      'landMonsInfo',
      'waterMonsInfo',
      'rockSmashMonsInfo',
      'fishingMonsInfo'
    ]);
  });
});
