import { describe, expect, test } from 'vitest';
import {
  TRAINER_BACK_ANIM_COMMANDS,
  TRAINER_BACK_PIC_COUNT,
  TRAINER_BACK_PIC_OLD_MAN,
  TRAINER_BACK_PIC_POKEDUDE,
  TRAINER_BACK_PIC_RED,
  TRAINER_BACK_PIC_RUBY_SAPPHIRE_BRENDAN,
  gTrainerBackAnimsPtrTable,
  gTrainerBackPicCoords,
  gTrainerBackPicPaletteTable,
  gTrainerBackPicTable,
  getTrainerBackAnims,
  getTrainerBackPicCoords,
  getTrainerBackPicPalette,
  getTrainerBackPicSheet,
  sAnimCmd_OldMan_1,
  sAnimCmd_RSBrendan_1,
  sAnimCmd_Red_1
} from '../src/game/decompTrainerBackPics';

describe('decomp trainer back pic data', () => {
  test('back_pic_tables.h preserves coordinates, sheet sizes, and tags in index order', () => {
    expect(gTrainerBackPicCoords).toEqual([
      { size: 8, yOffset: 5 },
      { size: 8, yOffset: 5 },
      { size: 8, yOffset: 4 },
      { size: 8, yOffset: 4 },
      { size: 8, yOffset: 4 },
      { size: 8, yOffset: 4 }
    ]);
    expect(gTrainerBackPicTable).toEqual([
      { data: 'gTrainerBackPic_Red', size: 0x2800, tag: 0 },
      { data: 'gTrainerBackPic_Leaf', size: 0x2800, tag: 1 },
      { data: 'gTrainerBackPic_RSBrendan', size: 0x2000, tag: 2 },
      { data: 'gTrainerBackPic_RSMay', size: 0x2000, tag: 3 },
      { data: 'gTrainerBackPic_Pokedude', size: 0x2000, tag: 4 },
      { data: 'gTrainerBackPic_OldMan', size: 0x2000, tag: 5 }
    ]);
    expect(gTrainerBackPicTable).toHaveLength(TRAINER_BACK_PIC_COUNT);
  });

  test('back_pic_tables.h preserves palette pointers and lookup helpers', () => {
    expect(gTrainerBackPicPaletteTable).toEqual([
      { data: 'gTrainerPalette_RedBackPic', tag: 0 },
      { data: 'gTrainerPalette_LeafBackPic', tag: 1 },
      { data: 'gTrainerPalette_RSBrendan1', tag: 2 },
      { data: 'gTrainerPalette_RSMay1', tag: 3 },
      { data: 'gTrainerPalette_PokedudeBackPic', tag: 4 },
      { data: 'gTrainerPalette_OldManBackPic', tag: 5 }
    ]);
    expect(getTrainerBackPicCoords(TRAINER_BACK_PIC_RED)).toEqual({ size: 8, yOffset: 5 });
    expect(getTrainerBackPicSheet(TRAINER_BACK_PIC_POKEDUDE)).toEqual({
      data: 'gTrainerBackPic_Pokedude',
      size: 0x2000,
      tag: 4
    });
    expect(getTrainerBackPicPalette(TRAINER_BACK_PIC_OLD_MAN)).toEqual({
      data: 'gTrainerPalette_OldManBackPic',
      tag: 5
    });
  });

  test('back_pic_anims.h preserves each custom animation command sequence', () => {
    expect(sAnimCmd_Red_1).toEqual([
      { kind: 'frame', imageValue: 1, duration: 20 },
      { kind: 'frame', imageValue: 2, duration: 6 },
      { kind: 'frame', imageValue: 3, duration: 6 },
      { kind: 'frame', imageValue: 4, duration: 24 },
      { kind: 'frame', imageValue: 0, duration: 1 },
      { kind: 'end' }
    ]);
    expect(sAnimCmd_OldMan_1).toEqual([
      { kind: 'frame', imageValue: 1, duration: 24 },
      { kind: 'frame', imageValue: 2, duration: 9 },
      { kind: 'frame', imageValue: 3, duration: 24 },
      { kind: 'frame', imageValue: 0, duration: 9 },
      { kind: 'end' }
    ]);
    expect(sAnimCmd_RSBrendan_1).toEqual([
      { kind: 'frame', imageValue: 0, duration: 24 },
      { kind: 'frame', imageValue: 1, duration: 9 },
      { kind: 'frame', imageValue: 2, duration: 24 },
      { kind: 'frame', imageValue: 0, duration: 9 },
      { kind: 'frame', imageValue: 3, duration: 50 },
      { kind: 'end' }
    ]);
  });

  test('back_pic_anims.h preserves pointer-table order and general frame references', () => {
    expect(gTrainerBackAnimsPtrTable).toEqual([
      ['sAnim_GeneralFrame0', 'sAnimCmd_Red_1'],
      ['sAnim_GeneralFrame0', 'sAnimCmd_Leaf_1'],
      ['sAnim_GeneralFrame3', 'sAnimCmd_RSBrendan_1'],
      ['sAnim_GeneralFrame3', 'sAnimCmd_RSMay_1'],
      ['sAnim_GeneralFrame0', 'sAnimCmd_Pokedude_1'],
      ['sAnim_GeneralFrame0', 'sAnimCmd_OldMan_1']
    ]);
    expect(getTrainerBackAnims(TRAINER_BACK_PIC_RUBY_SAPPHIRE_BRENDAN)).toEqual([
      'sAnim_GeneralFrame3',
      'sAnimCmd_RSBrendan_1'
    ]);
    expect(TRAINER_BACK_ANIM_COMMANDS.sAnim_GeneralFrame0).toBeNull();
    expect(TRAINER_BACK_ANIM_COMMANDS.sAnimCmd_Red_1).toBe(sAnimCmd_Red_1);
  });
});
