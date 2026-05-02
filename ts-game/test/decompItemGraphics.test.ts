import { describe, expect, test } from 'vitest';
import {
  getItemGraphicsAssetDeclaration,
  ITEM_GRAPHICS_ASSET_DECLARATIONS,
  ITEM_GRAPHICS_SOURCE,
  parseItemGraphicsAssetDeclarations
} from '../src/game/decompItemGraphics';

describe('decomp item graphics declarations', () => {
  test('parses every item icon and palette INCBIN declaration in source order', () => {
    expect(ITEM_GRAPHICS_SOURCE).toContain('gItemIcon_QuestionMark[] = INCBIN_U32');
    expect(parseItemGraphicsAssetDeclarations(ITEM_GRAPHICS_SOURCE)).toEqual(ITEM_GRAPHICS_ASSET_DECLARATIONS);
    expect(ITEM_GRAPHICS_ASSET_DECLARATIONS).toHaveLength(466);
    expect(ITEM_GRAPHICS_ASSET_DECLARATIONS[0]).toEqual({
      symbol: 'gItemIcon_QuestionMark',
      assetPath: 'graphics/items/icons/question_mark.4bpp.lz',
      kind: 'icon',
      section: null
    });
    expect(ITEM_GRAPHICS_ASSET_DECLARATIONS.at(-1)).toEqual({
      symbol: 'gItemIconPalette_Sapphire',
      assetPath: 'graphics/items/icon_palettes/sapphire.gbapal.lz',
      kind: 'palette',
      section: 'FireRed/LeafGreen key items'
    });
  });

  test('preserves section comments for representative item categories', () => {
    expect(getItemGraphicsAssetDeclaration('gItemIcon_MasterBall')).toEqual({
      symbol: 'gItemIcon_MasterBall',
      assetPath: 'graphics/items/icons/master_ball.4bpp.lz',
      kind: 'icon',
      section: 'Pokeballs'
    });
    expect(getItemGraphicsAssetDeclaration('gItemIconPalette_FireTMHM')).toEqual({
      symbol: 'gItemIconPalette_FireTMHM',
      assetPath: 'graphics/items/icon_palettes/fire_tm_hm.gbapal.lz',
      kind: 'palette',
      section: 'TMs/HMs'
    });
    expect(getItemGraphicsAssetDeclaration('gItemIconPalette_Ruby')).toEqual({
      symbol: 'gItemIconPalette_Ruby',
      assetPath: 'graphics/items/icon_palettes/ruby.gbapal.lz',
      kind: 'palette',
      section: 'FireRed/LeafGreen key items'
    });
  });

  test('classifies declarations as icons or palettes using their original symbol names', () => {
    const icons = ITEM_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'icon');
    const palettes = ITEM_GRAPHICS_ASSET_DECLARATIONS.filter((declaration) => declaration.kind === 'palette');

    expect(icons).toHaveLength(215);
    expect(palettes).toHaveLength(251);
    expect(getItemGraphicsAssetDeclaration('gItemIcon_TimerBall')?.kind).toBe('icon');
    expect(getItemGraphicsAssetDeclaration('gItemIconPalette_RepeatBall')?.kind).toBe('palette');
  });
});
