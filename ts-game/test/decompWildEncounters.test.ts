import { describe, expect, test } from 'vitest';
import {
  countWildEncounterTables,
  getRawWildEncounters,
  getWildEncounterForMap,
  getWildEncounterGroup,
  WILD_ENCOUNTERS_JSON_SOURCE
} from '../src/game/decompWildEncounters';
import { getPokedexAreaMarkers } from '../src/game/decompPokedexUi';

describe('decomp wild encounters data', () => {
  test('ports the complete wild encounters JSON structure', () => {
    const raw = getRawWildEncounters();
    expect(JSON.parse(WILD_ENCOUNTERS_JSON_SOURCE)).toEqual(raw);
    expect(raw.wild_encounter_groups).toHaveLength(1);

    const group = raw.wild_encounter_groups[0];
    expect(group.label).toBe('gWildMonHeaders');
    expect(group.for_maps).toBe(true);
    expect(group.fields.map((field) => field.type)).toEqual([
      'land_mons',
      'water_mons',
      'rock_smash_mons',
      'fishing_mons'
    ]);
    expect(group.encounters).toHaveLength(264);
  });

  test('preserves encounter rates, rod groups, and table counts exactly', () => {
    const group = getWildEncounterGroup('gWildMonHeaders');
    expect(group?.fields[0]).toEqual({
      type: 'land_mons',
      encounter_rates: [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1]
    });
    expect(group?.fields[3]).toEqual({
      type: 'fishing_mons',
      encounter_rates: [70, 30, 60, 20, 20, 40, 40, 15, 4, 1],
      groups: {
        old_rod: [0, 1],
        good_rod: [2, 3, 4],
        super_rod: [5, 6, 7, 8, 9]
      }
    });

    expect(countWildEncounterTables()).toEqual({
      land_mons: 226,
      water_mons: 100,
      rock_smash_mons: 28,
      fishing_mons: 100
    });
  });

  test('exposes exact map encounter entries and keeps Pokedex integration working', () => {
    const route1 = getWildEncounterForMap('MAP_ROUTE1');
    expect(route1).toMatchObject({
      map: 'MAP_ROUTE1',
      base_label: 'sRoute1_FireRed',
      land_mons: {
        encounter_rate: 21
      }
    });
    expect(route1?.land_mons?.mons.slice(0, 2)).toEqual([
      { min_level: 3, max_level: 3, species: 'SPECIES_PIDGEY' },
      { min_level: 3, max_level: 3, species: 'SPECIES_RATTATA' }
    ]);
    expect(route1?.land_mons?.mons).toHaveLength(12);

    expect(getWildEncounterForMap('MAP_PALLET_TOWN')).toMatchObject({
      map: 'MAP_PALLET_TOWN',
      base_label: 'sPalletTown_FireRed',
      water_mons: {
        encounter_rate: 1
      },
      fishing_mons: {
        encounter_rate: 10
      }
    });

    expect(getPokedexAreaMarkers('PIDGEY').length).toBeGreaterThan(0);
  });
});
