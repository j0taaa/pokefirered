import { describe, expect, test } from 'vitest';
import {
  getTrainerFrontAnimList,
  getTrainerFrontAnimPointer,
  gTrainerFrontAnimsPtrTable,
  parseTrainerFrontAnimLists,
  parseTrainerFrontAnimPointerTable,
  TRAINER_FRONT_ANIM_LISTS,
  TRAINER_FRONT_PIC_ANIMS_SOURCE
} from '../src/game/decompTrainerFrontPicAnims';

describe('decomp trainer front pic anims', () => {
  test('parses every static animation list and pointer-table row', () => {
    expect(TRAINER_FRONT_PIC_ANIMS_SOURCE).toContain('static const union AnimCmd *const sAnims_AquaLeaderArchie[]');
    expect(parseTrainerFrontAnimLists(TRAINER_FRONT_PIC_ANIMS_SOURCE)).toEqual(TRAINER_FRONT_ANIM_LISTS);
    expect(parseTrainerFrontAnimPointerTable(TRAINER_FRONT_PIC_ANIMS_SOURCE)).toEqual(gTrainerFrontAnimsPtrTable);
    expect(TRAINER_FRONT_ANIM_LISTS).toHaveLength(148);
    expect(gTrainerFrontAnimsPtrTable).toHaveLength(148);
  });

  test('preserves representative animation list symbols and designated pointer rows', () => {
    expect(TRAINER_FRONT_ANIM_LISTS[0]).toEqual({
      symbol: 'sAnims_AquaLeaderArchie',
      anims: ['sAnim_GeneralFrame0']
    });
    expect(TRAINER_FRONT_ANIM_LISTS.at(-1)).toEqual({
      symbol: 'sAnims_Painter',
      anims: ['sAnim_GeneralFrame0']
    });
    expect(getTrainerFrontAnimList('sAnims_Red')).toEqual({
      symbol: 'sAnims_Red',
      anims: ['sAnim_GeneralFrame0']
    });
    expect(getTrainerFrontAnimPointer('TRAINER_PIC_RED')).toEqual({
      trainerPic: 'TRAINER_PIC_RED',
      animsSymbol: 'sAnims_Red'
    });
    expect(gTrainerFrontAnimsPtrTable.at(-1)).toEqual({
      trainerPic: 'TRAINER_PIC_PAINTER',
      animsSymbol: 'sAnims_Painter'
    });
  });
});
