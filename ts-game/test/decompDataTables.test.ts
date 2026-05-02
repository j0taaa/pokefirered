import { describe, expect, test } from 'vitest';
import {
  DATA_C_DEFINES,
  DATA_C_INCLUDES,
  DATA_C_SOURCE,
  DATA_C_TABLE_BLOCKS,
  getDataTableBlock,
  parseDataTableBlocks
} from '../src/game/decompDataTables';

describe('decomp data.c tables', () => {
  test('preserves includes, macros, and every top-level table block', () => {
    expect(DATA_C_SOURCE).toContain('#define BATTLER_OFFSET(i)');
    expect(DATA_C_INCLUDES.slice(0, 5)).toEqual(['global.h', 'gflib.h', 'battle.h', 'data.h', 'graphics.h']);
    expect(DATA_C_INCLUDES.slice(-5)).toEqual([
      'data/trainer_parties.h',
      'data/text/trainer_class_names.h',
      'data/trainers.h',
      'data/text/species_names.h',
      'data/text/move_names.h'
    ]);
    expect(DATA_C_DEFINES).toHaveLength(6);
    expect(DATA_C_DEFINES[0]).toBe('BATTLER_OFFSET(i) (gHeap + 0x8000 + MON_PIC_SIZE * (i))');
    expect(parseDataTableBlocks(DATA_C_SOURCE)).toEqual(DATA_C_TABLE_BLOCKS);
    expect(DATA_C_TABLE_BLOCKS).toHaveLength(34);
  });

  test('preserves battler and trainer back sprite frame image tables', () => {
    expect(getDataTableBlock('gBattlerPicTable_PlayerLeft')).toEqual({
      symbol: 'gBattlerPicTable_PlayerLeft',
      kind: 'spriteFrameImage',
      isStatic: false,
      tokens: [
        'BATTLER_OFFSET(0), MON_PIC_SIZE',
        'BATTLER_OFFSET(1), MON_PIC_SIZE',
        'BATTLER_OFFSET(2), MON_PIC_SIZE',
        'BATTLER_OFFSET(3), MON_PIC_SIZE'
      ]
    });
    expect(getDataTableBlock('gTrainerBackPicTable_Red')?.tokens).toEqual([
      'gTrainerBackPic_Red, 0x0800',
      'gTrainerBackPic_Red + 0x0800, 0x0800',
      'gTrainerBackPic_Red + 0x1000, 0x0800',
      'gTrainerBackPic_Red + 0x1800, 0x0800',
      'gTrainerBackPic_Red + 0x2000, 0x0800'
    ]);
  });

  test('preserves normal animation and affine animation command sequences', () => {
    expect(getDataTableBlock('sAnim_GeneralFrame0')).toEqual({
      symbol: 'sAnim_GeneralFrame0',
      kind: 'animCmd',
      isStatic: true,
      tokens: ['ANIMCMD_FRAME(0, 0)', 'ANIMCMD_END']
    });
    expect(getDataTableBlock('sAffineAnim_Battler_HorizontalSquishLoop')).toEqual({
      symbol: 'sAffineAnim_Battler_HorizontalSquishLoop',
      kind: 'affineAnimCmd',
      isStatic: true,
      tokens: [
        'AFFINEANIMCMD_FRAME(0xA0, 0x100, 0, 0)',
        'AFFINEANIMCMD_FRAME( 0x4,   0x0, 0, 8)',
        'AFFINEANIMCMD_FRAME(-0x4,   0x0, 0, 8)',
        'AFFINEANIMCMD_JUMP(1)'
      ]
    });
  });

  test('preserves affine and mon-pic pointer table ordering', () => {
    expect(getDataTableBlock('gAffineAnims_BattleSpritePlayerSide')).toMatchObject({
      kind: 'affineAnimPointerTable',
      isStatic: false,
      tokens: [
        '[BATTLER_AFFINE_NORMAL] = sAffineAnim_Battler_Normal',
        '[BATTLER_AFFINE_EMERGE] = sAffineAnim_Battler_Emerge',
        '[BATTLER_AFFINE_RETURN] = sAffineAnim_Battler_Return',
        'sAffineAnim_Battler_HorizontalSquishLoop',
        'sAffineAnim_Battler_Grow',
        'sAffineAnim_Battler_Shrink',
        'sAffineAnim_Battler_GrowLarge',
        'sAffineAnim_Battler_TipRight',
        'sAffineAnim_Battler_BigToSmall'
      ]
    });
    expect(getDataTableBlock('gAnims_MonPic')).toEqual({
      symbol: 'gAnims_MonPic',
      kind: 'animPointerTable',
      isStatic: false,
      tokens: ['sAnim_MonPic_0', 'sAnim_MonPic_1', 'sAnim_MonPic_2', 'sAnim_MonPic_3']
    });
  });
});
