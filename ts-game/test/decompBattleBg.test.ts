import { describe, expect, test } from 'vitest';
import {
  B_OUTCOME_DREW,
  B_OUTCOME_WON,
  BattleInitBgsAndWindows,
  B_WIN_VS_MULTI_PLAYER_1,
  B_WIN_VS_OPPONENT,
  B_WIN_VS_OUTCOME_DRAW,
  B_WIN_VS_OUTCOME_LEFT,
  B_WIN_VS_OUTCOME_RIGHT,
  B_WIN_VS_PLAYER,
  BATTLE_TERRAIN_CAVE,
  BATTLE_TERRAIN_CHAMPION,
  BATTLE_TERRAIN_GRASS,
  BATTLE_TERRAIN_GYM,
  BATTLE_TERRAIN_INDOOR_1,
  BATTLE_TERRAIN_INDOOR_2,
  BATTLE_TERRAIN_LEADER,
  BATTLE_TERRAIN_LINK,
  BATTLE_TERRAIN_LORELEI,
  BATTLE_TERRAIN_PLAIN,
  BATTLE_TERRAIN_WATER,
  BATTLE_TYPE_BATTLE_TOWER,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_KYOGRE_GROUDON,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_POKEDUDE,
  BATTLE_TYPE_TRAINER,
  CB2_unused,
  CreateUnknownDebugSprite,
  DrawBattleEntryBackground,
  DrawLinkBattleParticipantPokeballs,
  DrawLinkBattleVsScreenOutcomeText,
  DrawMainBattleBackground,
  GetBattleTerrainByMapScene,
  GetBattleTerrainGfxPtrs,
  GetBattleTerrainOverride,
  InitBattleBgsVideo,
  InitLinkBattleVsScreen,
  LoadBattleMenuWindowGfx,
  LoadBattleTerrainEntryGfx,
  LoadBattleTerrainGfx,
  LoadBattleTextboxAndBackground,
  LoadChosenBattleElement,
  MAP_BATTLE_SCENE_AGATHA,
  MAP_BATTLE_SCENE_GYM,
  MAP_BATTLE_SCENE_INDOOR_2,
  MAP_BATTLE_SCENE_NORMAL,
  TRAINER_CLASS_CHAMPION,
  TRAINER_CLASS_LEADER,
  VERSION_FIRE_RED,
  battleInitBgsAndWindows,
  cb2Unused,
  createBattleBgRuntime,
  createBattleBgTask,
  createUnknownDebugSprite,
  drawBattleEntryBackground,
  drawLinkBattleParticipantPokeballs,
  drawLinkBattleVsScreenOutcomeText,
  drawMainBattleBackground,
  gBattleBgTemplates,
  getBattleTerrainByMapScene,
  getBattleTerrainGfxPtrs,
  getBattleTerrainOverride,
  initBattleBgsVideo,
  initLinkBattleVsScreen,
  loadBattleMenuWindowGfx,
  loadBattleTerrainEntryGfx,
  loadBattleTerrainGfx,
  loadBattleTextboxAndBackground,
  loadChosenBattleElement,
  sBattleTerrainTable,
  sMapBattleSceneMapping,
  sStandardBattleWindowTemplates,
  sUnused
} from '../src/game/decompBattleBg';

describe('decomp battle_bg', () => {
  test('exact C function names are exported as the implemented battle bg routines', () => {
    expect(CreateUnknownDebugSprite).toBe(createUnknownDebugSprite);
    expect(CB2_unused).toBe(cb2Unused);
    expect(GetBattleTerrainByMapScene).toBe(getBattleTerrainByMapScene);
    expect(LoadBattleTerrainGfx).toBe(loadBattleTerrainGfx);
    expect(LoadBattleTerrainEntryGfx).toBe(loadBattleTerrainEntryGfx);
    expect(GetBattleTerrainGfxPtrs).toBe(getBattleTerrainGfxPtrs);
    expect(BattleInitBgsAndWindows).toBe(battleInitBgsAndWindows);
    expect(InitBattleBgsVideo).toBe(initBattleBgsVideo);
    expect(LoadBattleMenuWindowGfx).toBe(loadBattleMenuWindowGfx);
    expect(DrawMainBattleBackground).toBe(drawMainBattleBackground);
    expect(LoadBattleTextboxAndBackground).toBe(loadBattleTextboxAndBackground);
    expect(DrawLinkBattleParticipantPokeballs).toBe(drawLinkBattleParticipantPokeballs);
    expect(DrawLinkBattleVsScreenOutcomeText).toBe(drawLinkBattleVsScreenOutcomeText);
    expect(InitLinkBattleVsScreen).toBe(initLinkBattleVsScreen);
    expect(DrawBattleEntryBackground).toBe(drawBattleEntryBackground);
    expect(GetBattleTerrainOverride).toBe(getBattleTerrainOverride);
    expect(LoadChosenBattleElement).toBe(loadChosenBattleElement);
  });

  test('static data preserves bg/window templates and terrain mapping', () => {
    expect(sUnused).toEqual([1, 2]);
    expect(gBattleBgTemplates).toEqual([
      { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0 },
      { bg: 1, charBaseIndex: 1, mapBaseIndex: 28, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0 },
      { bg: 2, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
      { bg: 3, charBaseIndex: 2, mapBaseIndex: 26, screenSize: 1, paletteMode: 0, priority: 3, baseTile: 0 }
    ]);
    expect(sStandardBattleWindowTemplates[0]).toMatchObject({ tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, baseBlock: 0x090 });
    expect(sStandardBattleWindowTemplates.at(-1)).toBeNull();
    expect(sBattleTerrainTable).toHaveLength(20);
    expect(sBattleTerrainTable[BATTLE_TERRAIN_GRASS]).toMatchObject({ tileset: 'sBattleTerrainTiles_Grass', palette: 'sBattleTerrainPalette_Grass' });
    expect(sBattleTerrainTable[BATTLE_TERRAIN_PLAIN]).toMatchObject({ tileset: 'sBattleTerrainTiles_Building', palette: 'sBattleTerrainPalette_Plain' });
    expect(sBattleTerrainTable[BATTLE_TERRAIN_INDOOR_1]).toMatchObject({ tileset: 'sBattleTerrainTiles_Indoor', palette: 'sBattleTerrainPalette_Indoor1' });
    expect(sMapBattleSceneMapping.map((entry) => entry.battleTerrain)).toEqual([BATTLE_TERRAIN_GYM, BATTLE_TERRAIN_INDOOR_1, BATTLE_TERRAIN_INDOOR_2, BATTLE_TERRAIN_LORELEI, 16, 17, 18, BATTLE_TERRAIN_LINK]);
  });

  test('debug sprite callback and bg init routines record exact call order', () => {
    const runtime = createBattleBgRuntime();
    createUnknownDebugSprite(runtime);
    expect(runtime.gSprites[0].invisible).toBe(true);
    expect(runtime.mainCallback2).toBe('CB2_unused');
    cb2Unused(runtime);
    expect(runtime.operations.slice(-2)).toEqual(['AnimateSprites', 'BuildOamBuffer']);

    runtime.operations = [];
    battleInitBgsAndWindows(runtime);
    expect(runtime.operations).toEqual(['ResetBgsAndClearDma3BusyFlags(FALSE)', 'InitBgsFromTemplates(0, gBattleBgTemplates, 4)', 'InitWindows(sStandardBattleWindowTemplates)', 'DeactivateAllTextPrinters']);

    initBattleBgsVideo(runtime);
    expect(runtime.operations).toContain('EnableInterrupts(VBLANK | VCOUNT | TIMER3 | SERIAL)');
    expect(runtime.operations).toContain('SetGpuReg(REG_OFFSET_DISPCNT, battle display flags)');
  });

  test('terrain lookup, gfx loading, entry loading, and pointer fallback match C bounds', () => {
    expect(getBattleTerrainByMapScene(MAP_BATTLE_SCENE_GYM)).toBe(BATTLE_TERRAIN_GYM);
    expect(getBattleTerrainByMapScene(MAP_BATTLE_SCENE_AGATHA)).toBe(17);
    expect(getBattleTerrainByMapScene(99)).toBe(BATTLE_TERRAIN_PLAIN);
    expect(getBattleTerrainGfxPtrs(BATTLE_TERRAIN_LINK)).toEqual({
      tileset: 'sBattleTerrainTiles_Building',
      tilemap: 'sBattleTerrainTilemap_Building',
      palette: 'sBattleTerrainPalette_Plain'
    });

    const runtime = createBattleBgRuntime();
    loadBattleTerrainGfx(runtime, 99);
    expect(runtime.operations).toEqual([
      'LZDecompressVram(sBattleTerrainTiles_Building, BG_CHAR_ADDR(2))',
      'LZDecompressVram(sBattleTerrainTilemap_Building, BG_SCREEN_ADDR(26))',
      'LoadCompressedPalette(sBattleTerrainPalette_Plain, BG_PLTT_ID(2), 3 * PLTT_SIZE_4BPP)'
    ]);
    runtime.operations = [];
    loadBattleTerrainEntryGfx(runtime, BATTLE_TERRAIN_WATER);
    expect(runtime.operations).toEqual([
      'LZDecompressVram(sBattleTerrainAnimTiles_Water, BG_CHAR_ADDR(1))',
      'LZDecompressVram(sBattleTerrainAnimTilemap_Water, BG_SCREEN_ADDR(28))'
    ]);
  });

  test('battle terrain override preserves special battle type and trainer class priority', () => {
    const runtime = createBattleBgRuntime({ gBattleTerrain: BATTLE_TERRAIN_WATER });
    expect(getBattleTerrainOverride(runtime)).toBe(BATTLE_TERRAIN_WATER);
    runtime.currentMapBattleScene = MAP_BATTLE_SCENE_INDOOR_2;
    expect(getBattleTerrainOverride(runtime)).toBe(BATTLE_TERRAIN_INDOOR_2);
    runtime.gBattleTypeFlags = BATTLE_TYPE_POKEDUDE;
    expect(getBattleTerrainOverride(runtime)).toBe(BATTLE_TERRAIN_GRASS);
    expect(runtime.gBattleTerrain).toBe(BATTLE_TERRAIN_GRASS);
    runtime.gBattleTypeFlags = BATTLE_TYPE_BATTLE_TOWER;
    expect(getBattleTerrainOverride(runtime)).toBe(BATTLE_TERRAIN_LINK);
    runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER;
    runtime.trainers[0] = { trainerClass: TRAINER_CLASS_LEADER };
    expect(getBattleTerrainOverride(runtime)).toBe(BATTLE_TERRAIN_LEADER);
    runtime.trainers[0] = { trainerClass: TRAINER_CLASS_CHAMPION };
    expect(getBattleTerrainOverride(runtime)).toBe(BATTLE_TERRAIN_CHAMPION);
  });

  test('menu window/textbox loaders include first battle and pokedude extra window gfx', () => {
    const runtime = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE });
    loadBattleMenuWindowGfx(runtime);
    expect(runtime.operations).toContain('Menu_LoadStdPalAt(BG_PLTT_ID(7))');
    runtime.operations = [];
    loadBattleTextboxAndBackground(runtime);
    expect(runtime.operations[0]).toBe('LZDecompressVram(gBattleInterface_Textbox_Gfx, BG_CHAR_ADDR(0))');
    expect(runtime.operations).toContain('LoadUserWindowGfx(2, 0x012, BG_PLTT_ID(1))');
    expect(runtime.operations.at(-3)).toBe('LZDecompressVram(sBattleTerrainTiles_Grass, BG_CHAR_ADDR(2))');
    runtime.operations = [];
    drawMainBattleBackground(runtime);
    expect(runtime.operations[0]).toBe('LZDecompressVram(sBattleTerrainTiles_Grass, BG_CHAR_ADDR(2))');
  });

  test('DrawLinkBattleParticipantPokeballs packs non-multi and multi status bits exactly', () => {
    const runtime = createBattleBgRuntime();
    const taskId = createBattleBgTask(runtime, { 3: 0b11_10_01_00_11_10, 4: 0b00_01_10_11_00_01 });
    runtime.gBattleStruct.multiplayerId = 0;
    drawLinkBattleParticipantPokeballs(runtime, taskId, 0, 1, 2, 7);
    expect(runtime.tilemapCopies.at(-1)).toMatchObject({ bgId: 1, destX: 2, destY: 7, width: 6, tiles: [0x6003, 0x6004, 0x6001, 0x6002, 0x6003, 0x6004] });
    drawLinkBattleParticipantPokeballs(runtime, taskId, 1, 2, 2, 7);
    expect(runtime.tilemapCopies.at(-1)?.tiles).toEqual([0x6002, 0x6001, 0x6004, 0x6003, 0x6002, 0x6001]);

    runtime.gBattleTypeFlags = BATTLE_TYPE_MULTI;
    runtime.gTasks[taskId].data[5] = 0;
    drawLinkBattleParticipantPokeballs(runtime, taskId, 2, 1, 2, 8);
    expect(runtime.tilemapCopies.at(-1)).toMatchObject({ width: 3, tiles: [0x6002, 0x6003, 0x6004] });
    runtime.gTasks[taskId].data[5] = 1;
    drawLinkBattleParticipantPokeballs(runtime, taskId, 1, 2, 2, 4);
    expect(runtime.tilemapCopies.at(-1)?.tiles).toEqual([0x6003, 0x6002, 0x6001]);
  });

  test('VS outcome text follows draw, multi id parity, and non-multi outcome branches', () => {
    const runtime = createBattleBgRuntime({ gBattleOutcome: B_OUTCOME_DREW });
    drawLinkBattleVsScreenOutcomeText(runtime);
    expect(runtime.textWindows).toEqual([{ text: 'gText_Draw', windowId: B_WIN_VS_OUTCOME_DRAW }]);

    runtime.textWindows = [];
    runtime.gBattleTypeFlags = BATTLE_TYPE_MULTI;
    runtime.gBattleOutcome = B_OUTCOME_WON;
    runtime.gBattleStruct.multiplayerId = 1;
    runtime.gLinkPlayers[1].id = 1;
    drawLinkBattleVsScreenOutcomeText(runtime);
    expect(runtime.textWindows).toEqual([
      { text: 'gText_Win', windowId: B_WIN_VS_OUTCOME_RIGHT },
      { text: 'gText_Loss', windowId: B_WIN_VS_OUTCOME_LEFT }
    ]);

    runtime.textWindows = [];
    runtime.gBattleTypeFlags = 0;
    runtime.gBattleOutcome = 2;
    runtime.gBattleStruct.multiplayerId = 0;
    runtime.gLinkPlayers[0].id = 0;
    drawLinkBattleVsScreenOutcomeText(runtime);
    expect(runtime.textWindows).toEqual([
      { text: 'gText_Win', windowId: B_WIN_VS_OUTCOME_RIGHT },
      { text: 'gText_Loss', windowId: B_WIN_VS_OUTCOME_LEFT }
    ]);
  });

  test('InitLinkBattleVsScreen handles non-multi setup, sprite allocation, and motion finish', () => {
    const runtime = createBattleBgRuntime();
    runtime.gLinkPlayers = [{ id: 1, name: 'P1' }, { id: 0, name: 'P0' }, { id: 2, name: 'P2' }, { id: 3, name: 'P3' }];
    runtime.gBattleStruct.multiplayerId = 0;
    const taskId = createBattleBgTask(runtime, { 0: 0, 1: 0, 2: 2, 3: 0x555, 4: 0xaaa });
    initLinkBattleVsScreen(runtime, taskId);
    expect(runtime.gTasks[taskId].data[0]).toBe(1);
    expect(runtime.textWindows).toEqual([
      { text: 'P0', windowId: B_WIN_VS_PLAYER },
      { text: 'P1', windowId: B_WIN_VS_OPPONENT }
    ]);

    initLinkBattleVsScreen(runtime, taskId);
    expect(runtime.gBattleStruct.linkBattleVsSpriteId_V).toBe(0);
    expect(runtime.gBattleStruct.linkBattleVsSpriteId_S).toBe(1);
    expect(runtime.gSprites[0].invisible).toBe(true);
    expect(runtime.gTasks[taskId].data[0]).toBe(2);

    initLinkBattleVsScreen(runtime, taskId);
    expect(runtime.gTasks[taskId].data[2]).toBe(0);
    expect(runtime.gTasks[taskId].data[1]).toBe(2);
    initLinkBattleVsScreen(runtime, taskId);
    expect(runtime.gTasks[taskId].destroyed).toBe(true);
    expect(runtime.gSprites[0].invisible).toBe(false);
    expect(runtime.gSprites[1].oam.tileNum).toBe(0x40);
    expect(runtime.operations).toContain('PlaySE(SE_M_HARDEN)');
  });

  test('InitLinkBattleVsScreen multi setup draws all four names and final outcome when data[5] set', () => {
    const runtime = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_MULTI, gBattleOutcome: B_OUTCOME_WON });
    runtime.gBattleStruct.multiplayerId = 0;
    runtime.gLinkPlayers = [{ id: 0, name: 'A' }, { id: 1, name: 'B' }, { id: 2, name: 'C' }, { id: 3, name: 'D' }];
    const taskId = createBattleBgTask(runtime, { 3: 0x555, 4: 0xaaa, 5: 1 });
    initLinkBattleVsScreen(runtime, taskId);
    expect(runtime.textWindows.slice(0, 4)).toEqual([
      { text: 'A', windowId: B_WIN_VS_MULTI_PLAYER_1 },
      { text: 'B', windowId: 18 },
      { text: 'C', windowId: 19 },
      { text: 'D', windowId: 20 }
    ]);
    runtime.gTasks[taskId].data[0] = 1;
    initLinkBattleVsScreen(runtime, taskId);
    runtime.gTasks[taskId].data[0] = 2;
    initLinkBattleVsScreen(runtime, taskId);
    expect(runtime.textWindows.at(-2)).toEqual({ text: 'gText_Win', windowId: B_WIN_VS_OUTCOME_LEFT });
  });

  test('DrawBattleEntryBackground follows link, pokedude, tower, kyogre/groudon, trainer, and map branches', () => {
    const link = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK });
    drawBattleEntryBackground(link);
    expect(link.gBattle_BG1_Y).toBe(-164);
    expect(link.operations).toContain('LoadCompressedSpriteSheetUsingHeap(sVsLettersSpriteSheet)');

    const pokedude = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_POKEDUDE });
    drawBattleEntryBackground(pokedude);
    expect(pokedude.operations[0]).toBe('LZDecompressVram(sBattleTerrainAnimTiles_Grass, BG_CHAR_ADDR(1))');

    const tower = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_BATTLE_TOWER });
    drawBattleEntryBackground(tower);
    expect(tower.operations[0]).toBe('LZDecompressVram(sBattleTerrainAnimTiles_Building, BG_CHAR_ADDR(1))');

    const kyogre = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_KYOGRE_GROUDON, gGameVersion: VERSION_FIRE_RED });
    drawBattleEntryBackground(kyogre);
    expect(kyogre.operations[0]).toBe('LZDecompressVram(sBattleTerrainAnimTiles_Cave, BG_CHAR_ADDR(1))');

    const leader = createBattleBgRuntime({ gBattleTypeFlags: BATTLE_TYPE_TRAINER, trainers: { 0: { trainerClass: TRAINER_CLASS_LEADER } } });
    drawBattleEntryBackground(leader);
    expect(leader.operations[0]).toBe('LZDecompressVram(sBattleTerrainAnimTiles_Building, BG_CHAR_ADDR(1))');

    const map = createBattleBgRuntime({ currentMapBattleScene: MAP_BATTLE_SCENE_NORMAL, gBattleTerrain: BATTLE_TERRAIN_CAVE });
    drawBattleEntryBackground(map);
    expect(map.operations[0]).toBe('LZDecompressVram(sBattleTerrainAnimTiles_Cave, BG_CHAR_ADDR(1))');
  });

  test('LoadChosenBattleElement preserves case actions and case 3 fallthrough into case 4', () => {
    const runtime = createBattleBgRuntime({ gBattleTerrain: BATTLE_TERRAIN_WATER });
    expect(loadChosenBattleElement(runtime, 0)).toBe(false);
    expect(runtime.operations.at(-1)).toBe('LZDecompressVram(gBattleInterface_Textbox_Gfx, BG_CHAR_ADDR(0))');
    expect(loadChosenBattleElement(runtime, 1)).toBe(false);
    expect(runtime.operations).toContain('CopyBgTilemapBufferToVram(0)');
    expect(loadChosenBattleElement(runtime, 2)).toBe(false);
    expect(runtime.operations.at(-1)).toBe('LoadCompressedPalette(gBattleInterface_Textbox_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP)');
    runtime.operations = [];
    expect(loadChosenBattleElement(runtime, 3)).toBe(false);
    expect(runtime.operations).toEqual([
      'LZDecompressVram(sBattleTerrainTiles_Water, BG_CHAR_ADDR(2))',
      'LZDecompressVram(sBattleTerrainTilemap_Water, BG_SCREEN_ADDR(26))'
    ]);
    runtime.operations = [];
    expect(loadChosenBattleElement(runtime, 5)).toBe(false);
    expect(runtime.operations).toEqual(['LoadCompressedPalette(sBattleTerrainPalette_Water, BG_PLTT_ID(2), 3 * PLTT_SIZE_4BPP)']);
    expect(loadChosenBattleElement(runtime, 6)).toBe(false);
    expect(runtime.operations).toContain('LoadUserWindowGfx(2, 0x012, BG_PLTT_ID(1))');
    expect(loadChosenBattleElement(runtime, 7)).toBe(true);
  });
});
