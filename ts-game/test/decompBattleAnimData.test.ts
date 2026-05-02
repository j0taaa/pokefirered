import { describe, expect, test } from 'vitest';
import {
  getBattleAnimBackgroundTable,
  getBattleAnimOamData,
  getBattleAnimPaletteTable,
  getBattleAnimPicTable,
  getBattleAnimRawDeclarations,
  getBattleAnimUnparsedRemainder
} from '../src/game/decompBattleAnimData';

describe('decomp battle anim data', () => {
  test('covers every top-level declaration from src/data/battle_anim.h', () => {
    const declarations = getBattleAnimRawDeclarations();
    expect(declarations).toHaveLength(75);
    expect(declarations.filter((declaration) => declaration.structType === 'OamData')).toHaveLength(72);
    expect(declarations.map((declaration) => declaration.name).slice(-3)).toEqual([
      'gBattleAnimPicTable',
      'gBattleAnimPaletteTable',
      'gBattleAnimBackgroundTable'
    ]);
    expect(getBattleAnimUnparsedRemainder()).toBe('');
  });

  test('ports OAM data records with exact C field values', () => {
    const oamData = getBattleAnimOamData();
    expect(oamData).toHaveLength(72);

    expect(oamData[0]).toEqual({
      name: 'gOamData_AffineOff_ObjNormal_8x8',
      y: '0',
      affineMode: 'ST_OAM_AFFINE_OFF',
      objMode: 'ST_OAM_OBJ_NORMAL',
      bpp: 'ST_OAM_4BPP',
      shape: 'SPRITE_SHAPE(8x8)',
      x: '0',
      size: 'SPRITE_SIZE(8x8)',
      tileNum: '0',
      priority: '2',
      paletteNum: '0'
    });

    expect(oamData.at(-1)).toEqual({
      name: 'gOamData_AffineDouble_ObjBlend_32x64',
      y: '0',
      affineMode: 'ST_OAM_AFFINE_DOUBLE',
      objMode: 'ST_OAM_OBJ_BLEND',
      bpp: 'ST_OAM_4BPP',
      shape: 'SPRITE_SHAPE(32x64)',
      x: '0',
      size: 'SPRITE_SIZE(32x64)',
      tileNum: '0',
      priority: '2',
      paletteNum: '0'
    });
  });

  test('ports battle animation sprite graphics and palettes exactly', () => {
    const pics = getBattleAnimPicTable();
    const palettes = getBattleAnimPaletteTable();

    expect(pics).toHaveLength(289);
    expect(palettes).toHaveLength(289);
    expect(pics[0]).toEqual({ data: 'gBattleAnimSpriteGfx_Bone', size: '0x0200', tag: 'ANIM_TAG_BONE' });
    expect(pics.at(-1)).toEqual({ data: 'gBattleAnimSpriteGfx_GoldRing', size: '0x0100', tag: 'ANIM_TAG_BLUE_RING_2' });
    expect(palettes[0]).toEqual({ data: 'gBattleAnimSpritePal_Bone', tag: 'ANIM_TAG_BONE' });
    expect(palettes.at(-1)).toEqual({ data: 'gBattleAnimSpritePal_BlueRing2', tag: 'ANIM_TAG_BLUE_RING_2' });
  });

  test('ports battle animation background table exactly', () => {
    const backgrounds = getBattleAnimBackgroundTable();
    expect(backgrounds).toHaveLength(27);
    expect(backgrounds[0]).toEqual({
      index: 'BG_NONE',
      image: 'gBattleAnimBgImage_Dark',
      palette: 'gBattleAnimBgPalette_Dark',
      tilemap: 'gBattleAnimBgTilemap_Dark'
    });
    expect(backgrounds.at(-1)).toEqual({
      index: 'BG_SOLAR_BEAM_CONTESTS',
      image: 'gBattleAnimBgImage_Impact',
      palette: 'gBattleAnimBgPalette_SolarBeam',
      tilemap: 'gBattleAnimBgTilemap_ImpactContests'
    });
  });
});
