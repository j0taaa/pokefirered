import { describe, expect, test } from 'vitest';
import {
  getFacilityClassPicIndex,
  getFacilityClassTrainerClass,
  gFacilityClassToPicIndex,
  gFacilityClassToPicIndexBugfix,
  gFacilityClassToPicIndexRaw,
  gFacilityClassToTrainerClass,
  gFacilityClassToTrainerClassRaw,
  TRAINER_CLASS_LOOKUPS_SOURCE
} from '../src/game/decompTrainerClassLookups';

describe('decomp trainer class lookups', () => {
  test('parses pic-index rows including BUGFIX alternatives', () => {
    expect(TRAINER_CLASS_LOOKUPS_SOURCE).toContain('const u8 gFacilityClassToPicIndex[]');
    expect(gFacilityClassToPicIndexRaw).toHaveLength(152);
    expect(gFacilityClassToPicIndex).toHaveLength(150);
    expect(gFacilityClassToPicIndexBugfix).toHaveLength(150);
    expect(gFacilityClassToPicIndex.slice(0, 5)).toEqual([
      { facilityClass: 'FACILITY_CLASS_AQUA_LEADER_ARCHIE', value: 'TRAINER_PIC_AQUA_LEADER_ARCHIE' },
      { facilityClass: 'FACILITY_CLASS_AQUA_GRUNT_M', value: 'TRAINER_PIC_AQUA_GRUNT_M' },
      { facilityClass: 'FACILITY_CLASS_AQUA_GRUNT_F', value: 'TRAINER_PIC_AQUA_GRUNT_F' },
      { facilityClass: 'FACILITY_CLASS_RS_AROMA_LADY', value: 'TRAINER_PIC_RS_AROMA_LADY' },
      { facilityClass: 'FACILITY_CLASS_RS_RUIN_MANIAC', value: 'TRAINER_PIC_RS_RUIN_MANIAC' }
    ]);
  });

  test('preserves default and BUGFIX pic-index branch behavior', () => {
    expect(getFacilityClassPicIndex('FACILITY_CLASS_ELITE_FOUR_AGATHA')).toBe('TRAINER_PIC_ELITE_FOUR_LORELEI');
    expect(getFacilityClassPicIndex('FACILITY_CLASS_ELITE_FOUR_LANCE')).toBe('TRAINER_PIC_ELITE_FOUR_BRUNO');
    expect(getFacilityClassPicIndex('FACILITY_CLASS_ELITE_FOUR_AGATHA', true)).toBe('TRAINER_PIC_ELITE_FOUR_AGATHA');
    expect(getFacilityClassPicIndex('FACILITY_CLASS_ELITE_FOUR_LANCE', true)).toBe('TRAINER_PIC_ELITE_FOUR_LANCE');
    expect(gFacilityClassToPicIndex.at(-1)).toEqual({
      facilityClass: 'FACILITY_CLASS_CHAMPION_RIVAL_2',
      value: 'TRAINER_PIC_CHAMPION_RIVAL'
    });
  });

  test('parses trainer-class rows in source order', () => {
    expect(TRAINER_CLASS_LOOKUPS_SOURCE).toContain('const u8 gFacilityClassToTrainerClass[]');
    expect(gFacilityClassToTrainerClassRaw).toHaveLength(150);
    expect(gFacilityClassToTrainerClass).toHaveLength(150);
    expect(getFacilityClassTrainerClass('FACILITY_CLASS_AQUA_LEADER_ARCHIE')).toBe('TRAINER_CLASS_AQUA_LEADER');
    expect(getFacilityClassTrainerClass('FACILITY_CLASS_BOSS')).toBe('TRAINER_CLASS_BOSS');
    expect(gFacilityClassToTrainerClass.at(-1)).toEqual({
      facilityClass: 'FACILITY_CLASS_CHAMPION_RIVAL_2',
      value: 'TRAINER_CLASS_CHAMPION'
    });
  });
});
