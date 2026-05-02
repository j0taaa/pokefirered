import { describe, expect, it } from 'vitest';
import {
  DATA_C_INCLUDES,
  DATA_C_SOURCE,
  DATA_C_TABLE_BLOCKS,
  DATA_C_TRANSLATION_UNIT,
  getDataTableBlock
} from '../src/game/decompData';
import {
  DECORATION_C_TRANSLATION_UNIT,
  gDecorations,
  getDecoration,
  getDecorationCompilationIncludes,
  getDecorationDescription,
  getDecorationTiles
} from '../src/game/decompDecoration';
import {
  TILESETS_C_SOURCE,
  TILESETS_C_TRANSLATION_UNIT,
  getTilesetHeaderDeclaration,
  getTilesetPaletteDeclaration,
  getTilesetTilesDeclaration,
  getTilesetsCompilationIncludes
} from '../src/game/decompTilesets';

describe('data-only C translation unit ports', () => {
  it('anchors src/data.c through parsed battler sprite and affine tables', () => {
    expect(DATA_C_TRANSLATION_UNIT).toBe('src/data.c');
    expect(DATA_C_INCLUDES).toEqual(expect.arrayContaining(['global.h', 'battle.h', 'data.h']));
    expect(DATA_C_SOURCE).toContain('const struct SpriteFrameImage gBattlerPicTable_PlayerLeft[]');
    expect(DATA_C_TABLE_BLOCKS.length).toBeGreaterThan(10);
    expect(getDataTableBlock('gBattlerPicTable_PlayerLeft')).toMatchObject({
      symbol: 'gBattlerPicTable_PlayerLeft',
      kind: 'spriteFrameImage',
      isStatic: false
    });
    expect(getDataTableBlock('gAffineAnims_BattleSpriteOpponentSide')).toMatchObject({
      symbol: 'gAffineAnims_BattleSpriteOpponentSide',
      kind: 'affineAnimPointerTable'
    });
  });

  it('anchors src/decoration.c through the exact included decoration data sets', () => {
    expect(DECORATION_C_TRANSLATION_UNIT).toBe('src/decoration.c');
    expect(getDecorationCompilationIncludes()).toEqual([
      'global.h',
      'decoration.h',
      'constants/decorations.h',
      'data/decoration/tiles.h',
      'data/decoration/description.h',
      'data/decoration/header.h'
    ]);
    expect(gDecorations.length).toBeGreaterThan(20);
    const smallDesk = getDecoration('DECOR_SMALL_DESK');
    expect(smallDesk).toMatchObject({
      id: 'DECOR_SMALL_DESK',
      descriptionSymbol: expect.stringMatching(/^DecorDesc_/u),
      gfxSymbol: expect.stringMatching(/^DecorGfx_/u)
    });
    expect(getDecorationDescription(smallDesk!.descriptionSymbol)).toBeTruthy();
    expect(getDecorationTiles(smallDesk!.gfxSymbol)?.tiles.length).toBeGreaterThan(0);
  });

  it('anchors src/tilesets.c through graphics, metatile, and header declarations', () => {
    expect(TILESETS_C_TRANSLATION_UNIT).toBe('src/tilesets.c');
    expect(TILESETS_C_SOURCE).toContain('#include "data/tilesets/graphics.h"');
    expect(getTilesetsCompilationIncludes()).toEqual([
      'global.h',
      'tilesets.h',
      'tileset_anims.h',
      'data/tilesets/graphics.h',
      'data/tilesets/metatiles.h',
      'data/tilesets/headers.h'
    ]);
    expect(getTilesetHeaderDeclaration('gTileset_General')).toMatchObject({
      symbol: 'gTileset_General',
      tiles: 'gTilesetTiles_General',
      palettes: 'gTilesetPalettes_General'
    });
    expect(getTilesetTilesDeclaration('gTilesetTiles_PalletTown')).toBeTruthy();
    expect(getTilesetPaletteDeclaration('gTilesetPalettes_PalletTown')).toBeTruthy();
  });
});
