import trainerFrontPicTablesSource from '../../../src/data/trainer_graphics/front_pic_tables.h?raw';

export interface TrainerFrontPicCoords {
  size: number;
  yOffset: number;
}

export interface TrainerFrontPicSheet {
  trainer: string;
  data: string;
  size: number;
}

export interface TrainerFrontPicPalette {
  trainer: string;
  data: string;
}

export const TRAINER_FRONT_PIC_TABLES_SOURCE = trainerFrontPicTablesSource;

export const parseTrainerFrontPicCoords = (source: string): TrainerFrontPicCoords[] =>
  [...source.matchAll(/\{\.size = (\d+), \.y_offset = (\d+)\}/gu)].map((match) => ({
    size: Number.parseInt(match[1], 10),
    yOffset: Number.parseInt(match[2], 10)
  }));

export const parseTrainerFrontPicTable = (source: string): TrainerFrontPicSheet[] =>
  [...source.matchAll(/TRAINER_SPRITE\(([^,]+),\s*(\w+),\s*(0x[0-9A-Fa-f]+|\d+)\)/gu)].map((match) => ({
    trainer: match[1],
    data: match[2],
    size: Number.parseInt(match[3], 0)
  }));

export const parseTrainerFrontPicPaletteTable = (source: string): TrainerFrontPicPalette[] =>
  [...source.matchAll(/TRAINER_PAL\(([^,]+),\s*(\w+)\)/gu)].map((match) => ({
    trainer: match[1],
    data: match[2]
  }));

export const gTrainerFrontPicCoords = parseTrainerFrontPicCoords(trainerFrontPicTablesSource);
export const gTrainerFrontPicTable = parseTrainerFrontPicTable(trainerFrontPicTablesSource);
export const gTrainerFrontPicPaletteTable = parseTrainerFrontPicPaletteTable(trainerFrontPicTablesSource);

export const getTrainerFrontPicSheet = (trainer: string): TrainerFrontPicSheet | undefined =>
  gTrainerFrontPicTable.find((entry) => entry.trainer === trainer);

export const getTrainerFrontPicPalette = (trainer: string): TrainerFrontPicPalette | undefined =>
  gTrainerFrontPicPaletteTable.find((entry) => entry.trainer === trainer);
