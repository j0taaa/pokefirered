import wildEncountersSource from '../../../src/data/wild_encounters.json?raw';

export type WildEncounterTableType = 'land_mons' | 'water_mons' | 'rock_smash_mons' | 'fishing_mons';

export interface RawWildEncounterMon {
  min_level: number;
  max_level: number;
  species: string;
}

export interface RawWildEncounterTable {
  encounter_rate: number;
  mons: RawWildEncounterMon[];
}

export interface RawWildEncounterField {
  type: WildEncounterTableType;
  encounter_rates: number[];
  groups?: Record<string, number[]>;
}

export interface RawWildEncounterEntry {
  map: string;
  base_label: string;
  land_mons?: RawWildEncounterTable;
  water_mons?: RawWildEncounterTable;
  rock_smash_mons?: RawWildEncounterTable;
  fishing_mons?: RawWildEncounterTable;
}

export interface RawWildEncounterGroup {
  label: string;
  for_maps: boolean;
  fields: RawWildEncounterField[];
  encounters: RawWildEncounterEntry[];
}

export interface RawWildEncounters {
  wild_encounter_groups: RawWildEncounterGroup[];
}

const parseWildEncounters = (source: string): RawWildEncounters =>
  JSON.parse(source) as RawWildEncounters;

const cloneTable = (table: RawWildEncounterTable | undefined): RawWildEncounterTable | undefined =>
  table
    ? {
      encounter_rate: table.encounter_rate,
      mons: table.mons.map((mon) => ({ ...mon }))
    }
    : undefined;

const cloneField = (field: RawWildEncounterField): RawWildEncounterField => ({
  type: field.type,
  encounter_rates: [...field.encounter_rates],
  groups: field.groups ? Object.fromEntries(Object.entries(field.groups).map(([key, value]) => [key, [...value]])) : undefined
});

const cloneEncounter = (encounter: RawWildEncounterEntry): RawWildEncounterEntry => ({
  map: encounter.map,
  base_label: encounter.base_label,
  land_mons: cloneTable(encounter.land_mons),
  water_mons: cloneTable(encounter.water_mons),
  rock_smash_mons: cloneTable(encounter.rock_smash_mons),
  fishing_mons: cloneTable(encounter.fishing_mons)
});

const rawWildEncounters = parseWildEncounters(wildEncountersSource);

export const WILD_ENCOUNTERS_JSON_SOURCE = wildEncountersSource;

export const getRawWildEncounters = (): RawWildEncounters => ({
  wild_encounter_groups: rawWildEncounters.wild_encounter_groups.map((group) => ({
    label: group.label,
    for_maps: group.for_maps,
    fields: group.fields.map(cloneField),
    encounters: group.encounters.map(cloneEncounter)
  }))
});

export const getWildEncounterGroup = (label: string): RawWildEncounterGroup | null =>
  getRawWildEncounters().wild_encounter_groups.find((group) => group.label === label) ?? null;

export const getWildEncounterForMap = (mapId: string): RawWildEncounterEntry | null => {
  for (const group of rawWildEncounters.wild_encounter_groups) {
    const encounter = group.encounters.find((entry) => entry.map === mapId);
    if (encounter) {
      return cloneEncounter(encounter);
    }
  }

  return null;
};

export const countWildEncounterTables = (): Record<WildEncounterTableType, number> => {
  const counts: Record<WildEncounterTableType, number> = {
    land_mons: 0,
    water_mons: 0,
    rock_smash_mons: 0,
    fishing_mons: 0
  };

  for (const group of rawWildEncounters.wild_encounter_groups) {
    for (const encounter of group.encounters) {
      for (const tableType of Object.keys(counts) as WildEncounterTableType[]) {
        if (encounter[tableType]) {
          counts[tableType] += 1;
        }
      }
    }
  }

  return counts;
};
