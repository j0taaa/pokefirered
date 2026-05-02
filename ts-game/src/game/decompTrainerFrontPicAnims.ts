import trainerFrontPicAnimsSource from '../../../src/data/trainer_graphics/front_pic_anims.h?raw';

export interface TrainerFrontAnimList {
  symbol: string;
  anims: string[];
}

export interface TrainerFrontAnimPointer {
  trainerPic: string;
  animsSymbol: string;
}

export const TRAINER_FRONT_PIC_ANIMS_SOURCE = trainerFrontPicAnimsSource;

export const parseTrainerFrontAnimLists = (source: string): TrainerFrontAnimList[] =>
  [...source.matchAll(/^static const union AnimCmd \*const (sAnims_\w+)\[\]\s*=\s*\{([\s\S]*?)^\};/gmu)].map(
    (match) => ({
      symbol: match[1],
      anims: [...match[2].matchAll(/\b(sAnim_\w+)\b/gu)].map((anim) => anim[1])
    })
  );

export const parseTrainerFrontAnimPointerTable = (source: string): TrainerFrontAnimPointer[] =>
  [...source.matchAll(/^\s*\[(TRAINER_PIC_\w+)\]\s*=\s*(sAnims_\w+),/gmu)].map((match) => ({
    trainerPic: match[1],
    animsSymbol: match[2]
  }));

export const TRAINER_FRONT_ANIM_LISTS = parseTrainerFrontAnimLists(trainerFrontPicAnimsSource);
export const gTrainerFrontAnimsPtrTable = parseTrainerFrontAnimPointerTable(trainerFrontPicAnimsSource);

export const getTrainerFrontAnimList = (symbol: string): TrainerFrontAnimList | undefined =>
  TRAINER_FRONT_ANIM_LISTS.find((entry) => entry.symbol === symbol);

export const getTrainerFrontAnimPointer = (trainerPic: string): TrainerFrontAnimPointer | undefined =>
  gTrainerFrontAnimsPtrTable.find((entry) => entry.trainerPic === trainerPic);
