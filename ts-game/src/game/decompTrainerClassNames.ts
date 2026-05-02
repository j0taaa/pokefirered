import trainerClassNamesSource from '../../../src/data/text/trainer_class_names.h?raw';

export interface TrainerClassNameEntry {
  trainerClass: string;
  name: string;
}

export const TRAINER_CLASS_NAMES_SOURCE = trainerClassNamesSource;

const decodeText = (text: string): string => text.replaceAll('{PKMN}', 'PKMN');

export const parseTrainerClassNames = (source: string): TrainerClassNameEntry[] =>
  [...source.matchAll(/\[(TRAINER_CLASS_\w+)\]\s*=\s*_\("([^"]*)"\)/gu)].map((match) => ({
    trainerClass: match[1],
    name: decodeText(match[2])
  }));

export const gTrainerClassNames = parseTrainerClassNames(trainerClassNamesSource);

export const getTrainerClassName = (trainerClass: string): string | undefined =>
  gTrainerClassNames.find((entry) => entry.trainerClass === trainerClass)?.name;
