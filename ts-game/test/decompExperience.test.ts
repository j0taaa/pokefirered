import { describe, expect, test } from 'vitest';
import {
  EXPERIENCE_TABLE_ROW_LABELS,
  EXPERIENCE_TABLES_SOURCE,
  gExperienceTables,
  getExperienceForLevel,
  getLevelForExperience,
  parseExperienceTableRowLabels
} from '../src/game/decompExperience';

describe('decomp experience tables', () => {
  test('preserves the decomp experience table row order', () => {
    expect(EXPERIENCE_TABLES_SOURCE).toContain('const u32 gExperienceTables[][MAX_LEVEL + 1]');
    expect(parseExperienceTableRowLabels(EXPERIENCE_TABLES_SOURCE)).toEqual([...EXPERIENCE_TABLE_ROW_LABELS]);
    expect(gExperienceTables).toHaveLength(8);
    expect(gExperienceTables.every((row) => row.length === 101)).toBe(true);
  });

  test('evaluates the same macro-generated values for representative rows', () => {
    expect(gExperienceTables[0].slice(0, 8)).toEqual([0, 1, 8, 27, 64, 125, 216, 343]);
    expect(gExperienceTables[1][50]).toBe(getExperienceForLevel('GROWTH_ERRATIC', 50));
    expect(gExperienceTables[2][100]).toBe(getExperienceForLevel('GROWTH_FLUCTUATING', 100));
    expect(gExperienceTables[3][36]).toBe(getExperienceForLevel('GROWTH_MEDIUM_SLOW', 36));
    expect(gExperienceTables[4][100]).toBe(800000);
    expect(gExperienceTables[5][100]).toBe(1250000);
  });

  test('preserves the duplicate Medium Fast rows and level lookup behavior', () => {
    expect(gExperienceTables[6]).toEqual(gExperienceTables[0]);
    expect(gExperienceTables[7]).toEqual(gExperienceTables[0]);
    expect(getLevelForExperience('GROWTH_MEDIUM_FAST', gExperienceTables[0][16])).toBe(16);
    expect(getLevelForExperience('GROWTH_MEDIUM_FAST', gExperienceTables[0][17] - 1)).toBe(16);
  });
});
