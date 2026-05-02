import trainerClassLookupsSource from '../../../src/data/pokemon/trainer_class_lookups.h?raw';

export type TrainerClassLookupCondition = 'BUGFIX' | 'NO_BUGFIX';

export interface TrainerClassLookupEntry {
  facilityClass: string;
  value: string;
  condition?: TrainerClassLookupCondition;
}

export const TRAINER_CLASS_LOOKUPS_SOURCE = trainerClassLookupsSource;

const getTableBody = (source: string, tableName: string): string =>
  source.match(new RegExp(`const u8 ${tableName}\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';

export const parseTrainerClassLookupTable = (source: string, tableName: string): TrainerClassLookupEntry[] => {
  const entries: TrainerClassLookupEntry[] = [];
  let condition: TrainerClassLookupCondition | undefined;

  for (const line of getTableBody(source, tableName).split('\n')) {
    if (line.includes('#ifdef BUGFIX')) {
      condition = 'BUGFIX';
      continue;
    }
    if (line.includes('#else')) {
      condition = 'NO_BUGFIX';
      continue;
    }
    if (line.includes('#endif')) {
      condition = undefined;
      continue;
    }

    const match = line.match(/\[(FACILITY_CLASS_\w+)\]\s*=\s*(TRAINER_(?:PIC|CLASS)_\w+),/u);
    if (match) {
      entries.push({
        facilityClass: match[1],
        value: match[2],
        ...(condition ? { condition } : {})
      });
    }
  }

  return entries;
};

const resolveLookupEntries = (
  entries: TrainerClassLookupEntry[],
  bugfix: boolean
): TrainerClassLookupEntry[] =>
  entries.filter((entry) => {
    if (!entry.condition) {
      return true;
    }
    return bugfix ? entry.condition === 'BUGFIX' : entry.condition === 'NO_BUGFIX';
  });

export const gFacilityClassToPicIndexRaw = parseTrainerClassLookupTable(
  trainerClassLookupsSource,
  'gFacilityClassToPicIndex'
);

export const gFacilityClassToTrainerClassRaw = parseTrainerClassLookupTable(
  trainerClassLookupsSource,
  'gFacilityClassToTrainerClass'
);

export const gFacilityClassToPicIndex = resolveLookupEntries(gFacilityClassToPicIndexRaw, false);
export const gFacilityClassToPicIndexBugfix = resolveLookupEntries(gFacilityClassToPicIndexRaw, true);
export const gFacilityClassToTrainerClass = resolveLookupEntries(gFacilityClassToTrainerClassRaw, false);

export const getFacilityClassPicIndex = (facilityClass: string, bugfix = false): string | undefined =>
  (bugfix ? gFacilityClassToPicIndexBugfix : gFacilityClassToPicIndex).find((entry) => entry.facilityClass === facilityClass)
    ?.value;

export const getFacilityClassTrainerClass = (facilityClass: string): string | undefined =>
  gFacilityClassToTrainerClass.find((entry) => entry.facilityClass === facilityClass)?.value;
