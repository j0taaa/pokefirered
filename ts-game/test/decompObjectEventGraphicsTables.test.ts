import { describe, expect, test } from 'vitest';
import {
  gObjectEventGraphicsInfoDeclarations,
  gObjectEventGraphicsInfos,
  gObjectEventGraphicsInfoPointers,
  gObjectEventGraphicDeclarations,
  gObjectEventPicTables,
  getDecompObjectEventGraphicDeclaration,
  getDecompObjectEventGraphicsInfo,
  getDecompObjectEventGraphicsInfoForIndex,
  getDecompObjectEventGraphicsInfoPointer,
  getDecompObjectEventPicTable
} from '../src/game/decompObjectEventGraphicsTables';

describe('decomp object event graphics tables', () => {
  test('parses every object event graphics asset and empty u16 declaration', () => {
    expect(gObjectEventGraphicDeclarations).toHaveLength(232);
    expect(gObjectEventGraphicDeclarations.filter((declaration) => declaration.kind === 'incbin')).toHaveLength(216);
    expect(gObjectEventGraphicDeclarations.filter((declaration) => declaration.kind === 'empty')).toHaveLength(16);
    expect(getDecompObjectEventGraphicDeclaration('gObjectEventPal_Player')).toEqual({
      symbol: 'gObjectEventPal_Player',
      kind: 'incbin',
      path: 'graphics/object_events/palettes/player.gbapal',
      declaredLength: null
    });
    expect(getDecompObjectEventGraphicDeclaration('gObjectEventPaletteNull14')).toEqual({
      symbol: 'gObjectEventPaletteNull14',
      kind: 'empty',
      path: null,
      declaredLength: 16
    });
    expect(getDecompObjectEventGraphicDeclaration('sFiller1')).toEqual({
      symbol: 'sFiller1',
      kind: 'empty',
      path: null,
      declaredLength: 0x90
    });
    expect(gObjectEventGraphicDeclarations.at(-1)).toEqual({
      symbol: 'gFieldEffectObjectPic_Bird',
      kind: 'incbin',
      path: 'graphics/field_effects/pics/bird.4bpp',
      declaredLength: null
    });
  });

  test('preserves object-event and field-effect graphic declaration groups', () => {
    expect(gObjectEventGraphicDeclarations.filter((declaration) => declaration.symbol.startsWith('gObjectEventPic_'))).toHaveLength(157);
    expect(gObjectEventGraphicDeclarations.filter((declaration) => declaration.symbol.startsWith('gObjectEventPal_'))).toHaveLength(17);
    expect(gObjectEventGraphicDeclarations.filter((declaration) => declaration.symbol.startsWith('gFieldEffectObjectPic_'))).toHaveLength(37);
    expect(gObjectEventGraphicDeclarations.filter((declaration) => declaration.symbol.startsWith('gFieldEffect') && declaration.symbol.includes('Pal'))).toHaveLength(5);
    expect(getDecompObjectEventGraphicDeclaration('gObjectEventPic_UnusedWoman')?.path).toBe(
      'graphics/object_events/pics/people/unused_woman.4bpp'
    );
    expect(getDecompObjectEventGraphicDeclaration('gFieldEffectObjectPic_CutGrass2')?.path).toBe(
      'graphics/field_effects/fldeff_cut.4bpp'
    );
  });

  test('parses every graphics info declaration and indexed pointer', () => {
    expect(gObjectEventGraphicsInfoDeclarations).toHaveLength(152);
    expect(gObjectEventGraphicsInfoPointers).toHaveLength(152);
    expect(gObjectEventGraphicsInfoDeclarations.slice(0, 3)).toEqual([
      'gObjectEventGraphicsInfo_RedNormal',
      'gObjectEventGraphicsInfo_RedBike',
      'gObjectEventGraphicsInfo_RedSurf'
    ]);
    expect(gObjectEventGraphicsInfoDeclarations.slice(-3)).toEqual([
      'gObjectEventGraphicsInfo_DeoxysA',
      'gObjectEventGraphicsInfo_DeoxysN',
      'gObjectEventGraphicsInfo_SSAnne'
    ]);
    expect(getDecompObjectEventGraphicsInfoPointer('OBJ_EVENT_GFX_RED_NORMAL')).toEqual({
      index: 'OBJ_EVENT_GFX_RED_NORMAL',
      symbol: 'gObjectEventGraphicsInfo_RedNormal'
    });
    expect(getDecompObjectEventGraphicsInfoPointer('OBJ_EVENT_GFX_SS_ANNE')).toEqual({
      index: 'OBJ_EVENT_GFX_SS_ANNE',
      symbol: 'gObjectEventGraphicsInfo_SSAnne'
    });
  });

  test('parses every object event graphics info struct including unused extras', () => {
    expect(gObjectEventGraphicsInfos).toHaveLength(154);
    expect(getDecompObjectEventGraphicsInfo('gObjectEventGraphicsInfo_RedNormal')).toEqual({
      symbol: 'gObjectEventGraphicsInfo_RedNormal',
      tileTag: 'TAG_NONE',
      paletteTag: 'OBJ_EVENT_PAL_TAG_PLAYER_RED',
      reflectionPaletteTag: 'OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION',
      size: 512,
      width: 16,
      height: 32,
      paletteSlot: 'PALSLOT_PLAYER',
      shadowSize: 'SHADOW_SIZE_M',
      inanimate: false,
      disableReflectionPaletteLoad: false,
      tracks: 'TRACKS_FOOT',
      oam: 'gObjectEventBaseOam_16x32',
      subspriteTables: 'gObjectEventSpriteOamTables_16x32',
      anims: 'sAnimTable_RedGreenNormal',
      images: 'sPicTable_RedNormal',
      affineAnims: 'gDummySpriteAffineAnimTable'
    });
    expect(getDecompObjectEventGraphicsInfo('gObjectEventGraphicsInfo_RedSurf')).toMatchObject({
      reflectionPaletteTag: 'OBJ_EVENT_PAL_TAG_NONE',
      disableReflectionPaletteLoad: true,
      images: 'sPicTable_RedSurf'
    });
    expect(getDecompObjectEventGraphicsInfo('gObjectEventGraphicsInfo_SSAnne')).toMatchObject({
      size: 4096,
      width: 128,
      height: 64,
      oam: 'gObjectEventBaseOam_8x8',
      subspriteTables: 'gObjectEventSpriteOamTables_128x64'
    });
  });

  test('keeps unused graphics infos separate from the indexed pointer table', () => {
    expect(getDecompObjectEventGraphicsInfo('gObjectEventGraphicsInfo_UnusedWoman')).not.toBeNull();
    expect(getDecompObjectEventGraphicsInfo('gObjectEventGraphicsInfo_RedBikeAlt')).not.toBeNull();
    expect(gObjectEventGraphicsInfoPointers.some((entry) => entry.symbol === 'gObjectEventGraphicsInfo_UnusedWoman')).toBe(false);
    expect(gObjectEventGraphicsInfoPointers.some((entry) => entry.symbol === 'gObjectEventGraphicsInfo_RedBikeAlt')).toBe(false);
    expect(getDecompObjectEventGraphicsInfoForIndex('OBJ_EVENT_GFX_RED_NORMAL')?.symbol).toBe(
      'gObjectEventGraphicsInfo_RedNormal'
    );
  });

  test('parses every sprite frame image table and overworld frame argument', () => {
    const totalFrames = gObjectEventPicTables.reduce((sum, table) => sum + table.frames.length, 0);

    expect(gObjectEventPicTables).toHaveLength(151);
    expect(totalFrames).toBe(1302);
    expect(getDecompObjectEventPicTable('sPicTable_RedNormal')?.frames).toHaveLength(20);
    expect(getDecompObjectEventPicTable('sPicTable_RedNormal')?.frames[0]).toEqual({
      picSymbol: 'gObjectEventPic_RedNormal',
      widthTiles: 2,
      heightTiles: 4,
      frame: 0
    });
    expect(getDecompObjectEventPicTable('sPicTable_RedNormal')?.frames.at(-1)).toEqual({
      picSymbol: 'gObjectEventPic_RedSurfRun',
      widthTiles: 2,
      heightTiles: 4,
      frame: 13
    });
  });

  test('preserves repeated frame sequences and final table order', () => {
    expect(getDecompObjectEventPicTable('sPicTable_Pikachu')?.frames.map((frame) => frame.frame)).toEqual([
      0,
      1,
      2,
      0,
      0,
      1,
      1,
      2,
      2
    ]);
    expect(gObjectEventPicTables.at(-1)).toEqual({
      symbol: 'sPicTable_Mom',
      frames: [
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 0 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 1 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 2 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 0 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 0 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 1 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 1 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 2 },
        { picSymbol: 'gObjectEventPic_Mom', widthTiles: 2, heightTiles: 4, frame: 2 }
      ]
    });
  });
});
