import { describe, expect, test } from 'vitest';
import {
  getTrainerFrontPicPalette,
  getTrainerFrontPicSheet,
  gTrainerFrontPicCoords,
  gTrainerFrontPicPaletteTable,
  gTrainerFrontPicTable,
  parseTrainerFrontPicCoords,
  parseTrainerFrontPicPaletteTable,
  parseTrainerFrontPicTable,
  TRAINER_FRONT_PIC_TABLES_SOURCE
} from '../src/game/decompTrainerFrontPicTables';

describe('decomp trainer front pic tables', () => {
  test('parses every coordinate, sprite, and palette entry in source order', () => {
    expect(TRAINER_FRONT_PIC_TABLES_SOURCE).toContain('const struct MonCoords gTrainerFrontPicCoords[]');
    expect(parseTrainerFrontPicCoords(TRAINER_FRONT_PIC_TABLES_SOURCE)).toEqual(gTrainerFrontPicCoords);
    expect(parseTrainerFrontPicTable(TRAINER_FRONT_PIC_TABLES_SOURCE)).toEqual(gTrainerFrontPicTable);
    expect(parseTrainerFrontPicPaletteTable(TRAINER_FRONT_PIC_TABLES_SOURCE)).toEqual(gTrainerFrontPicPaletteTable);
    expect(gTrainerFrontPicCoords).toHaveLength(148);
    expect(gTrainerFrontPicTable).toHaveLength(148);
    expect(gTrainerFrontPicPaletteTable).toHaveLength(148);
  });

  test('preserves representative sprite sizes and palette mappings', () => {
    expect(gTrainerFrontPicCoords.slice(0, 3)).toEqual([
      { size: 8, yOffset: 1 },
      { size: 8, yOffset: 1 },
      { size: 8, yOffset: 1 }
    ]);
    expect(getTrainerFrontPicSheet('SR_AND_JR')).toEqual({
      trainer: 'SR_AND_JR',
      data: 'gTrainerFrontPic_SrAndJr',
      size: 0x1000
    });
    expect(getTrainerFrontPicSheet('RED')).toEqual({
      trainer: 'RED',
      data: 'gTrainerFrontPic_Red',
      size: 0x800
    });
    expect(getTrainerFrontPicPalette('LEAF')).toEqual({
      trainer: 'LEAF',
      data: 'gTrainerPalette_Leaf'
    });
    expect(gTrainerFrontPicPaletteTable.at(-1)).toEqual({
      trainer: 'PAINTER',
      data: 'gTrainerPalette_Painter'
    });
  });
});
