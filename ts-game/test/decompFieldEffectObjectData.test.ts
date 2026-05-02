import { describe, expect, test } from 'vitest';
import {
  getFieldEffectAnimCommandTables,
  getFieldEffectAnimPointerTables,
  getFieldEffectFrameImageTables,
  getFieldEffectObjectRawDeclarations,
  getFieldEffectObjectUnparsedRemainder,
  getFieldEffectSpritePalettes,
  getFieldEffectSpriteTemplates
} from '../src/game/decompFieldEffectObjectData';

describe('decomp field effect object data', () => {
  test('covers every top-level declaration from src/data/field_effects/field_effect_objects.h', () => {
    const declarations = getFieldEffectObjectRawDeclarations();
    expect(declarations).toHaveLength(166);
    expect(declarations.filter((declaration) => declaration.cType === 'SpritePalette')).toHaveLength(4);
    expect(declarations.filter((declaration) => declaration.cType === 'SpriteTemplate')).toHaveLength(36);
    expect(declarations.filter((declaration) => declaration.cType === 'SpriteFrameImage')).toHaveLength(35);
    expect(declarations.filter((declaration) => declaration.cType === 'AnimCmd' && !declaration.pointerConst)).toHaveLength(57);
    expect(declarations.filter((declaration) => declaration.cType === 'AnimCmd' && declaration.pointerConst)).toHaveLength(31);
    expect(declarations.filter((declaration) => declaration.cType === 'AffineAnimCmd')).toHaveLength(3);
    expect(getFieldEffectObjectUnparsedRemainder()).toBe('');
  });

  test('ports sprite palettes and templates with exact C field tokens', () => {
    expect(getFieldEffectSpritePalettes()).toEqual([
      { name: 'gSpritePalette_GeneralFieldEffect0', data: 'gFieldEffectObjectPalette0', tag: 'FLDEFF_PAL_TAG_GENERAL_0' },
      { name: 'gSpritePalette_GeneralFieldEffect1', data: 'gFieldEffectObjectPalette1', tag: 'FLDEFF_PAL_TAG_GENERAL_1' },
      { name: 'gSpritePalette_Ash', data: 'gFieldEffectPal_Ash', tag: 'FLDEFF_PAL_TAG_ASH' },
      { name: 'gSpritePalette_SmallSparkle', data: 'gFieldEffectPal_SmallSparkle', tag: 'FLDEFF_PAL_TAG_SMALL_SPARKLE' }
    ]);

    const templates = getFieldEffectSpriteTemplates();
    expect(templates[0]).toEqual({
      name: 'gFieldEffectObjectTemplate_ShadowSmall',
      tileTag: 'TAG_NONE',
      paletteTag: 'TAG_NONE',
      oam: '&gObjectEventBaseOam_8x8',
      anims: 'sAnimTable_Shadow',
      images: 'sPicTable_ShadowSmall',
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'UpdateShadowFieldEffect'
    });
    expect(templates.at(-1)).toEqual({
      name: 'gFieldEffectObjectTemplate_SmallSparkle',
      tileTag: 'TAG_NONE',
      paletteTag: 'FLDEFF_PAL_TAG_SMALL_SPARKLE',
      oam: '&gObjectEventBaseOam_16x16',
      anims: 'sAnimTable_SmallSparkle',
      images: 'sPicTable_SmallSparkle',
      affineAnims: 'gDummySpriteAffineAnimTable',
      callback: 'UpdateSparkleFieldEffect'
    });
  });

  test('ports frame image tables and animation command rows exactly', () => {
    const frameTables = getFieldEffectFrameImageTables();
    expect(frameTables[0]).toEqual({
      name: 'sPicTable_ShadowSmall',
      frames: ['obj_frame_tiles(gFieldEffectObjectPic_ShadowSmall)']
    });
    expect(frameTables.find((table) => table.name === 'sPicTable_Bubbles')?.frames).toEqual([
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 0)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 1)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 2)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 3)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 4)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 5)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 6)',
      'overworld_frame(gFieldEffectObjectPic_Bubbles, 2, 4, 7)'
    ]);

    expect(getFieldEffectAnimCommandTables().find((table) => table.name === 'sSurfBlobAnim_FaceEast')?.commands).toEqual([
      'ANIMCMD_FRAME(4, 48, .hFlip = TRUE)',
      'ANIMCMD_FRAME(5, 48, .hFlip = TRUE)',
      'ANIMCMD_JUMP(0)'
    ]);
  });

  test('ports animation pointer tables including designated indexes exactly', () => {
    const surfBlob = getFieldEffectAnimPointerTables().find((table) => table.name === 'sAnimTable_SurfBlob');
    expect(surfBlob?.entries).toEqual([
      { index: 'DIR_SOUTH - 1', value: 'sSurfBlobAnim_FaceSouth' },
      { index: 'DIR_NORTH - 1', value: 'sSurfBlobAnim_FaceNorth' },
      { index: 'DIR_WEST  - 1', value: 'sSurfBlobAnim_FaceWest' },
      { index: 'DIR_EAST  - 1', value: 'sSurfBlobAnim_FaceEast' }
    ]);

    const reflection = getFieldEffectAnimPointerTables().find((table) => table.name === 'sAffineAnims_ReflectionDistortion');
    expect(reflection?.entries).toEqual([
      { index: null, value: 'sAffineAnim_ReflectionDistortion_0' },
      { index: null, value: 'sAffineAnim_ReflectionDistortion_1' }
    ]);
  });
});
