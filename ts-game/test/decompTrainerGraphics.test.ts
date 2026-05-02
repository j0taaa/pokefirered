import { describe, expect, test } from 'vitest';
import {
  getTrainerGraphicsAssetDeclaration,
  parseTrainerGraphicsAssetDeclarations,
  TRAINER_GRAPHICS_ASSET_DECLARATIONS,
  TRAINER_GRAPHICS_SOURCE
} from '../src/game/decompTrainerGraphics';

describe('decomp trainer graphics declarations', () => {
  test('parses every trainer graphics INCBIN declaration in source order', () => {
    expect(TRAINER_GRAPHICS_SOURCE).toContain('gTrainerFrontPic_AquaLeaderArchie[] = INCBIN_U32');
    expect(parseTrainerGraphicsAssetDeclarations(TRAINER_GRAPHICS_SOURCE)).toEqual(
      TRAINER_GRAPHICS_ASSET_DECLARATIONS
    );
    expect(TRAINER_GRAPHICS_ASSET_DECLARATIONS).toHaveLength(306);
    expect(TRAINER_GRAPHICS_ASSET_DECLARATIONS[0]).toEqual({
      symbol: 'gTrainerFrontPic_AquaLeaderArchie',
      assetPath: 'graphics/trainers/front_pics/aqua_leader_archie_front_pic.4bpp.lz',
      valueType: 'u32',
      incbinType: 'U32',
      kind: 'frontPic'
    });
    expect(TRAINER_GRAPHICS_ASSET_DECLARATIONS.at(-1)).toEqual({
      symbol: 'gTrainerPalette_OldManBackPic',
      assetPath: 'graphics/trainers/palettes/old_man_back_pic.gbapal.lz',
      valueType: 'u32',
      incbinType: 'U32',
      kind: 'palette'
    });
  });

  test('classifies front pics, back pics, and palettes from the original symbols', () => {
    expect(TRAINER_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'frontPic')).toHaveLength(
      148
    );
    expect(TRAINER_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'backPic')).toHaveLength(
      6
    );
    expect(TRAINER_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'palette')).toHaveLength(
      152
    );
    expect(getTrainerGraphicsAssetDeclaration('gTrainerBackPic_Red')).toEqual({
      symbol: 'gTrainerBackPic_Red',
      assetPath: 'graphics/trainers/back_pics/red_back_pic.4bpp',
      valueType: 'u8',
      incbinType: 'U8',
      kind: 'backPic'
    });
    expect(getTrainerGraphicsAssetDeclaration('gTrainerPalette_RedBackPic')).toEqual({
      symbol: 'gTrainerPalette_RedBackPic',
      assetPath: 'graphics/trainers/palettes/red_back_pic.gbapal.lz',
      valueType: 'u32',
      incbinType: 'U32',
      kind: 'palette'
    });
  });
});
