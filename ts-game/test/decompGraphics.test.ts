import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  expandGraphicsSource,
  gGraphicsAssetDeclarationBySymbol,
  gGraphicsAssetDeclarations,
  getGraphicsAssetDeclaration,
  getGraphicsIncbinPath,
  listGraphicsAssetSymbols,
  parseGraphicsAssetDeclarations
} from '../src/game/decompGraphics';

const repoRoot = resolve(__dirname, '../..');
const graphicsC = readFileSync(resolve(repoRoot, 'src/graphics.c'), 'utf8');

const preprocessFireRed = (source: string): string =>
  source.replace(/#ifdef FIRERED\n([\s\S]*?)#endif/gmu, '$1')
    .replace(/#ifdef LEAFGREEN\n[\s\S]*?#endif/gmu, '');

const countDirectIncbinDecls = (source: string): number =>
  [...preprocessFireRed(source).matchAll(/const\s+u(?:8|16|32)\s+\w+(?:\[[^\]]*\])+\s*=\s*INCBIN_U(?:8|16|32)\(\s*"[^"]+"\s*\);/gmu)].length;

describe('decomp graphics', () => {
  test('expands the same graphics headers included by src/graphics.c and keeps the FireRed branch', () => {
    const expanded = expandGraphicsSource(graphicsC);

    expect(expanded).toContain('gBallGfx_Poke');
    expect(expanded).toContain('gMonFrontPic_Bulbasaur');
    expect(expanded).toContain('gTrainerFrontPic_AquaLeaderArchie');
    expect(expanded).toContain('graphics/title_screen/firered/game_title_logo.gbapal');
    expect(expanded).not.toContain('graphics/title_screen/leafgreen/game_title_logo.gbapal');
  });

  test('parses every direct and included INCBIN declaration plus multi-palette arrays and literal arrays', () => {
    const expectedSimpleDecls = countDirectIncbinDecls(expandGraphicsSource(graphicsC));

    const parsed = parseGraphicsAssetDeclarations();
    const simpleDecls = parsed.filter((declaration) => declaration.kind === 'incbin');
    const multiDecls = parsed.filter((declaration) => declaration.kind === 'incbin-array');
    const literalDecls = parsed.filter((declaration) => declaration.kind === 'literal-array');

    expect(simpleDecls).toHaveLength(expectedSimpleDecls);
    expect(multiDecls.map((declaration) => declaration.symbol)).toEqual([
      'gNamingScreenMenu_Pal',
      'gTilesetPalettes_General',
      'gTilesetPalettes_GenericBuilding1',
      'gTilesetPalettes_DepartmentStore',
      'gCreditsMonPokeball_Pals'
    ]);
    expect(literalDecls).toEqual([{ kind: 'literal-array', cType: 'u16', symbol: 'sEmptyPal', dimensions: ['16'], values: [0] }]);
    expect(gGraphicsAssetDeclarations).toHaveLength(parsed.length);
  });

  test('keeps exact symbol-to-INCBIN metadata for representative graphics assets', () => {
    expect(getGraphicsAssetDeclaration('gBattleInterface_Textbox_Gfx')).toEqual({
      kind: 'incbin',
      cType: 'u32',
      symbol: 'gBattleInterface_Textbox_Gfx',
      dimensions: [''],
      incbinType: 'INCBIN_U32',
      path: 'graphics/battle_interface/textbox.4bpp.lz'
    });
    expect(getGraphicsAssetDeclaration('gMonIcon_Metapod')).toEqual({
      kind: 'incbin',
      cType: 'u8',
      symbol: 'gMonIcon_Metapod',
      dimensions: [''],
      incbinType: 'INCBIN_U8',
      path: 'graphics/pokemon/metapod/icon.4bpp'
    });
    expect(getGraphicsAssetDeclaration('gGraphics_TitleScreen_GameTitleLogoPals')).toEqual({
      kind: 'incbin',
      cType: 'u16',
      symbol: 'gGraphics_TitleScreen_GameTitleLogoPals',
      dimensions: [''],
      incbinType: 'INCBIN_U16',
      path: 'graphics/title_screen/firered/game_title_logo.gbapal'
    });
    expect(getGraphicsIncbinPath('gTradeGba_Gfx')).toBe('graphics/trade/gba.4bpp');
  });

  test('keeps included data graphics symbols available through the registry', () => {
    expect(getGraphicsAssetDeclaration('gBallGfx_Poke')).toEqual({
      kind: 'incbin',
      cType: 'u32',
      symbol: 'gBallGfx_Poke',
      dimensions: [''],
      incbinType: 'INCBIN_U32',
      path: 'graphics/interface/ball/poke.4bpp.lz'
    });
    expect(getGraphicsAssetDeclaration('gTrainerPalette_LeaderBrock')).toEqual({
      kind: 'incbin',
      cType: 'u32',
      symbol: 'gTrainerPalette_LeaderBrock',
      dimensions: [''],
      incbinType: 'INCBIN_U32',
      path: 'graphics/trainers/palettes/leader_brock.gbapal.lz'
    });
    expect(getGraphicsAssetDeclaration('gItemIconPalette_MasterBall')).toEqual({
      kind: 'incbin',
      cType: 'u32',
      symbol: 'gItemIconPalette_MasterBall',
      dimensions: [''],
      incbinType: 'INCBIN_U32',
      path: 'graphics/items/icon_palettes/master_ball.gbapal.lz'
    });
    expect(gGraphicsAssetDeclarationBySymbol.size).toBe(gGraphicsAssetDeclarations.length);
  });

  test('preserves multi-INCBIN palette array order and symbol listing order', () => {
    expect(getGraphicsAssetDeclaration('gTilesetPalettes_DepartmentStore')).toEqual({
      kind: 'incbin-array',
      cType: 'u16',
      symbol: 'gTilesetPalettes_DepartmentStore',
      dimensions: ['', '16'],
      incbinType: 'INCBIN_U16',
      paths: [
        'data/tilesets/secondary/department_store/palettes/00.gbapal',
        'data/tilesets/secondary/department_store/palettes/01.gbapal',
        'data/tilesets/secondary/department_store/palettes/02.gbapal',
        'data/tilesets/secondary/department_store/palettes/03.gbapal',
        'data/tilesets/secondary/department_store/palettes/04.gbapal',
        'data/tilesets/secondary/department_store/palettes/05.gbapal',
        'data/tilesets/secondary/department_store/palettes/06.gbapal',
        'data/tilesets/secondary/department_store/palettes/07.gbapal',
        'data/tilesets/secondary/department_store/palettes/08.gbapal',
        'data/tilesets/secondary/department_store/palettes/09.gbapal',
        'data/tilesets/secondary/department_store/palettes/10.gbapal',
        'data/tilesets/secondary/department_store/palettes/11.gbapal',
        'data/tilesets/secondary/department_store/palettes/12.gbapal',
        'data/tilesets/secondary/department_store/palettes/13.gbapal',
        'data/tilesets/secondary/department_store/palettes/14.gbapal',
        'data/tilesets/secondary/department_store/palettes/15.gbapal'
      ]
    });

    const symbols = listGraphicsAssetSymbols();
    expect(symbols[0]).toBe('gBattleInterface_Textbox_Gfx');
    expect(symbols).toContain('gMonFrontPic_Bulbasaur');
    expect(symbols.at(-1)).toBe('gBerryCrush_TextWindows_Tilemap');
  });
});
