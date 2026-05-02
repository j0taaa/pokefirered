export const TRAINER_BACK_PIC_RED = 0;
export const TRAINER_BACK_PIC_LEAF = 1;
export const TRAINER_BACK_PIC_RUBY_SAPPHIRE_BRENDAN = 2;
export const TRAINER_BACK_PIC_RUBY_SAPPHIRE_MAY = 3;
export const TRAINER_BACK_PIC_POKEDUDE = 4;
export const TRAINER_BACK_PIC_OLD_MAN = 5;

export type TrainerBackPicId =
  | typeof TRAINER_BACK_PIC_RED
  | typeof TRAINER_BACK_PIC_LEAF
  | typeof TRAINER_BACK_PIC_RUBY_SAPPHIRE_BRENDAN
  | typeof TRAINER_BACK_PIC_RUBY_SAPPHIRE_MAY
  | typeof TRAINER_BACK_PIC_POKEDUDE
  | typeof TRAINER_BACK_PIC_OLD_MAN;

export const TRAINER_BACK_PIC_COUNT = 6;

export interface MonCoords {
  size: number;
  yOffset: number;
}

export interface CompressedSpriteSheetRef {
  data: string;
  size: number;
  tag: number;
}

export interface CompressedSpritePaletteRef {
  data: string;
  tag: number;
}

export interface AnimFrameCommand {
  kind: 'frame';
  imageValue: number;
  duration: number;
}

export interface AnimEndCommand {
  kind: 'end';
}

export type AnimCommand = AnimFrameCommand | AnimEndCommand;

export type BackAnimSequenceName =
  | 'sAnim_GeneralFrame0'
  | 'sAnim_GeneralFrame3'
  | 'sAnimCmd_Red_1'
  | 'sAnimCmd_Leaf_1'
  | 'sAnimCmd_RSBrendan_1'
  | 'sAnimCmd_RSMay_1'
  | 'sAnimCmd_Pokedude_1'
  | 'sAnimCmd_OldMan_1';

const frame = (imageValue: number, duration: number): AnimFrameCommand => ({
  kind: 'frame',
  imageValue,
  duration
});

const end = (): AnimEndCommand => ({ kind: 'end' });

export const gTrainerBackPicCoords: readonly MonCoords[] = [
  { size: 8, yOffset: 5 },
  { size: 8, yOffset: 5 },
  { size: 8, yOffset: 4 },
  { size: 8, yOffset: 4 },
  { size: 8, yOffset: 4 },
  { size: 8, yOffset: 4 }
];

export const gTrainerBackPicTable: readonly CompressedSpriteSheetRef[] = [
  { data: 'gTrainerBackPic_Red', size: 0x2800, tag: 0 },
  { data: 'gTrainerBackPic_Leaf', size: 0x2800, tag: 1 },
  { data: 'gTrainerBackPic_RSBrendan', size: 0x2000, tag: 2 },
  { data: 'gTrainerBackPic_RSMay', size: 0x2000, tag: 3 },
  { data: 'gTrainerBackPic_Pokedude', size: 0x2000, tag: 4 },
  { data: 'gTrainerBackPic_OldMan', size: 0x2000, tag: 5 }
];

export const gTrainerBackPicPaletteTable: readonly CompressedSpritePaletteRef[] = [
  { data: 'gTrainerPalette_RedBackPic', tag: 0 },
  { data: 'gTrainerPalette_LeafBackPic', tag: 1 },
  { data: 'gTrainerPalette_RSBrendan1', tag: 2 },
  { data: 'gTrainerPalette_RSMay1', tag: 3 },
  { data: 'gTrainerPalette_PokedudeBackPic', tag: 4 },
  { data: 'gTrainerPalette_OldManBackPic', tag: 5 }
];

export const sAnimCmd_Red_1: readonly AnimCommand[] = [
  frame(1, 20),
  frame(2, 6),
  frame(3, 6),
  frame(4, 24),
  frame(0, 1),
  end()
];

export const sAnimCmd_Leaf_1: readonly AnimCommand[] = [
  frame(1, 20),
  frame(2, 6),
  frame(3, 6),
  frame(4, 24),
  frame(0, 1),
  end()
];

export const sAnimCmd_Pokedude_1: readonly AnimCommand[] = [
  frame(1, 24),
  frame(2, 9),
  frame(3, 24),
  frame(0, 9),
  end()
];

export const sAnimCmd_OldMan_1: readonly AnimCommand[] = [
  frame(1, 24),
  frame(2, 9),
  frame(3, 24),
  frame(0, 9),
  end()
];

export const sAnimCmd_RSBrendan_1: readonly AnimCommand[] = [
  frame(0, 24),
  frame(1, 9),
  frame(2, 24),
  frame(0, 9),
  frame(3, 50),
  end()
];

export const sAnimCmd_RSMay_1: readonly AnimCommand[] = [
  frame(0, 24),
  frame(1, 9),
  frame(2, 24),
  frame(0, 9),
  frame(3, 50),
  end()
];

export const TRAINER_BACK_ANIM_COMMANDS: Record<BackAnimSequenceName, readonly AnimCommand[] | null> = {
  sAnim_GeneralFrame0: null,
  sAnim_GeneralFrame3: null,
  sAnimCmd_Red_1,
  sAnimCmd_Leaf_1,
  sAnimCmd_RSBrendan_1,
  sAnimCmd_RSMay_1,
  sAnimCmd_Pokedude_1,
  sAnimCmd_OldMan_1
};

export const sBackAnims_Red: readonly BackAnimSequenceName[] = ['sAnim_GeneralFrame0', 'sAnimCmd_Red_1'];
export const sBackAnims_Leaf: readonly BackAnimSequenceName[] = ['sAnim_GeneralFrame0', 'sAnimCmd_Leaf_1'];
export const sBackAnims_Pokedude: readonly BackAnimSequenceName[] = ['sAnim_GeneralFrame0', 'sAnimCmd_Pokedude_1'];
export const sBackAnims_OldMan: readonly BackAnimSequenceName[] = ['sAnim_GeneralFrame0', 'sAnimCmd_OldMan_1'];
export const sBackAnims_RSBrendan: readonly BackAnimSequenceName[] = ['sAnim_GeneralFrame3', 'sAnimCmd_RSBrendan_1'];
export const sBackAnims_RSMay: readonly BackAnimSequenceName[] = ['sAnim_GeneralFrame3', 'sAnimCmd_RSMay_1'];

export const gTrainerBackAnimsPtrTable: readonly (readonly BackAnimSequenceName[])[] = [
  sBackAnims_Red,
  sBackAnims_Leaf,
  sBackAnims_RSBrendan,
  sBackAnims_RSMay,
  sBackAnims_Pokedude,
  sBackAnims_OldMan
];

export const getTrainerBackPicCoords = (trainerBackPicId: TrainerBackPicId): MonCoords =>
  gTrainerBackPicCoords[trainerBackPicId];

export const getTrainerBackPicSheet = (trainerBackPicId: TrainerBackPicId): CompressedSpriteSheetRef =>
  gTrainerBackPicTable[trainerBackPicId];

export const getTrainerBackPicPalette = (trainerBackPicId: TrainerBackPicId): CompressedSpritePaletteRef =>
  gTrainerBackPicPaletteTable[trainerBackPicId];

export const getTrainerBackAnims = (trainerBackPicId: TrainerBackPicId): readonly BackAnimSequenceName[] =>
  gTrainerBackAnimsPtrTable[trainerBackPicId];
