import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_OUTCOME_DREW,
  B_TRANSITION_SLICE,
  B_TRANSITION_WHITE_BARS_FADE,
  B_BUTTON,
  ITEMMENULOCATION_TTVSCR_REGISTER,
  ITEMMENULOCATION_TTVSCR_TMS,
  SELECT_BUTTON,
  TTVSCR_BATTLE,
  TTVSCR_CATCHING,
  TTVSCR_REGISTER,
  TTVSCR_STATUS,
  TTVSCR_TMS,
  InitTeachyTvController,
  SetTeachyTvControllerModeToResume,
  TTVcmd_DudeMoveRight,
  TTVcmd_DudeMoveUp,
  TTVcmd_EraseTextWindowIfKeyPressed,
  TTVcmd_NpcMoveAndSetupTextPrinter,
  TTVcmd_TaskBattleOrFadeByOptionChosen,
  TTVcmd_TextPrinterSwitchStringByOptionChosen,
  TeachyTvCallback,
  TeachyTvComputeMapTilesFromTilesetAndMetaTiles,
  TeachyTvComputePalIndexArrayEntryByMetaTile,
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles,
  TeachyTvGrassAnimationCheckIfNeedsToGenerateGrassObj,
  TeachyTvGrassAnimationObjCallback,
  TeachyTvLoadMapPalette,
  TeachyTvLoadMapTilesetToBuffer,
  TeachyTvMainCallback,
  TeachyTvOptionListController,
  TeachyTvPostBattleFadeControl,
  TeachyTvPreBattleAnimAndSetBattleCallback,
  TeachyTvPushBackNewMapPalIndexArrayEntry,
  TeachyTvQuitFadeControlAndTaskDel,
  TeachyTvRenderMsgAndSwitchClusterFuncs,
  TeachyTvRestorePlayerPartyCallback,
  TeachyTvSetupBagItemsByOptionChosen,
  TeachyTvSetupWindow,
  TeachyTvVblankHandler,
  createTeachyTvRuntime,
  dispatchTeachyTvTask,
  sListMenuItems,
  sListMenuItems_NoTMCase,
  sTMsScript,
  sWhereToReturnToFromBattle
} from '../src/game/decompTeachyTv';
import {
  gTeachyTvText_BattleScript1,
  gTeachyTvText_CatchingScript1,
  gTeachyTvText_PokedudeSaysHello
} from '../src/game/decompStrings';

const initializedRuntime = (hasTmCase = true) => {
  const runtime = createTeachyTvRuntime({ hasTmCase });
  InitTeachyTvController(runtime, 0, 'CB2_ReturnToField');
  TeachyTvMainCallback(runtime);
  TeachyTvMainCallback(runtime);
  return runtime;
};

describe('decompTeachyTv', () => {
  test('InitTeachyTvController follows mode 0 reset, mode 1 resume coercion, and callback setup', () => {
    const runtime = createTeachyTvRuntime({
      sStaticResources: { callback: null, mode: 7, whichScript: TTVSCR_TMS, scrollOffset: 4, selectedRow: 3 }
    });

    InitTeachyTvController(runtime, 0, 'CB2_ReturnToField');
    expect(runtime.sStaticResources).toMatchObject({
      callback: 'CB2_ReturnToField',
      mode: 0,
      whichScript: TTVSCR_BATTLE,
      scrollOffset: 0,
      selectedRow: 0
    });
    expect(runtime.mainCallback).toBe('TeachyTvMainCallback');

    runtime.sStaticResources.scrollOffset = 5;
    runtime.sStaticResources.selectedRow = 2;
    InitTeachyTvController(runtime, 1, 'resumeCb');
    expect(runtime.sStaticResources.mode).toBe(0);
    expect(runtime.sStaticResources.scrollOffset).toBe(5);
    expect(runtime.sStaticResources.selectedRow).toBe(2);
  });

  test('TeachyTvMainCallback builds either option-list mode or post-battle mode exactly by static mode', () => {
    const runtime = initializedRuntime();
    expect(runtime.mainCallback).toBe('TeachyTvCallback');
    expect(runtime.vblankCallback).toBe('TeachyTvVblankHandler');
    expect(runtime.tasks[0]?.func).toBe('TeachyTvOptionListController');
    expect(runtime.listMenuTemplate?.items).toEqual(sListMenuItems);
    expect(runtime.sResources?.scrollIndicatorArrowPairId).toBe(0);
    expect(runtime.sprites[0]).toMatchObject({ invisible: true, oam: { priority: 2 } });

    const noTmCase = initializedRuntime(false);
    expect(noTmCase.listMenuTemplate?.items).toEqual(sListMenuItems_NoTMCase);
    expect(noTmCase.listMenuTemplate?.totalItems).toBe(5);
    expect(noTmCase.listMenuTemplate?.maxShowed).toBe(5);
    expect(noTmCase.listMenuTemplate?.upText_Y).toBe(14);
    expect(noTmCase.sResources?.scrollIndicatorArrowPairId).toBe(0xff);

    const postBattle = createTeachyTvRuntime();
    postBattle.sStaticResources.mode = 2;
    postBattle.sStaticResources.whichScript = TTVSCR_STATUS;
    TeachyTvMainCallback(postBattle);
    TeachyTvMainCallback(postBattle);
    expect(postBattle.tasks[0]?.func).toBe('TeachyTvPostBattleFadeControl');
    expect(postBattle.sResources?.grassAnimCounterLo).toBe(3);
    expect(postBattle.sResources?.grassAnimCounterHi).toBe(0);
    expect(postBattle.sprites[0]).toMatchObject({ x2: 0x78, y2: 0x38, anim: 0 });
  });

  test('TeachyTvSetupWindow and option-list controller mirror list input, SELECT, cancel, and script selection', () => {
    const runtime = initializedRuntime();
    runtime.listInputs.push(TTVSCR_CATCHING);

    TeachyTvOptionListController(runtime, 0);

    expect(runtime.sStaticResources.whichScript).toBe(TTVSCR_CATCHING);
    expect(runtime.tasks[0]?.func).toBe('TeachyTvRenderMsgAndSwitchClusterFuncs');
    expect(runtime.tasks[0]?.data[2]).toBe(0);
    expect(runtime.tasks[0]?.data[3]).toBe(0);
    expect(runtime.sResources?.scrollIndicatorArrowPairId).toBe(0xff);

    const cancelRuntime = initializedRuntime();
    cancelRuntime.listInputs.push(-2);
    TeachyTvOptionListController(cancelRuntime, 0);
    expect(cancelRuntime.tasks[0]?.func).toBe('TeachyTvQuitFadeControlAndTaskDel');

    const selectRuntime = initializedRuntime();
    selectRuntime.pressedButtons = SELECT_BUTTON;
    TeachyTvOptionListController(selectRuntime, 0);
    expect(selectRuntime.tasks[0]?.func).toBe('TeachyTvQuitFadeControlAndTaskDel');

    const bagRuntime = initializedRuntime();
    bagRuntime.sStaticResources.callback = 'CB2_BagMenuFromStartMenu';
    bagRuntime.pressedButtons = SELECT_BUTTON;
    TeachyTvOptionListController(bagRuntime, 0);
    expect(bagRuntime.tasks[0]?.func).toBe('TeachyTvOptionListController');
  });

  test('Teachy TV script commands advance counters, choose text by script, and support B-button interruption', () => {
    const runtime = initializedRuntime();
    runtime.sStaticResources.whichScript = TTVSCR_CATCHING;
    runtime.listInputs.push(TTVSCR_CATCHING);
    TeachyTvOptionListController(runtime, 0);

    TTVcmd_TextPrinterSwitchStringByOptionChosen(runtime, 0);
    expect(runtime.textPrinterLog.at(-1)).toBe(gTeachyTvText_CatchingScript1);
    expect(runtime.tasks[0]?.data[3]).toBe(1);

    runtime.textPrinterActive = false;
    runtime.tasks[0]!.data[3] = 2;
    runtime.sprites[0]!.x2 = 0x78;
    runtime.tasks[0]!.data[2] = 35;
    TTVcmd_NpcMoveAndSetupTextPrinter(runtime, 0);
    expect(runtime.textPrinterLog.at(-1)).toBe(gTeachyTvText_PokedudeSaysHello);
    expect(runtime.tasks[0]?.data[3]).toBe(3);

    runtime.tasks[0]!.data[3] = 7;
    runtime.pressedButtons = A_BUTTON;
    TTVcmd_EraseTextWindowIfKeyPressed(runtime, 0);
    expect(runtime.tasks[0]?.data[3]).toBe(8);

    runtime.pressedButtons = B_BUTTON;
    TeachyTvRenderMsgAndSwitchClusterFuncs(runtime, 0);
    expect(runtime.sResources?.grassAnimDisabled).toBe(1);
    expect(runtime.tasks[0]?.func).toBe('TTVcmd_End');
    expect(runtime.sprites[0]).toMatchObject({ x2: 0, y2: 0, anim: 0 });
  });

  test('battle and bag branch commands preserve callbacks, transition IDs, and restore behavior', () => {
    const battleRuntime = initializedRuntime();
    battleRuntime.sStaticResources.whichScript = TTVSCR_BATTLE;
    TTVcmd_TaskBattleOrFadeByOptionChosen(battleRuntime, 0);
    expect(battleRuntime.sResources).toBeNull();
    expect(battleRuntime.gSpecialVar_0x8004).toBe(TTVSCR_BATTLE);
    expect(battleRuntime.gMainSavedCallback).toBe('TeachyTvRestorePlayerPartyCallback');
    expect(battleRuntime.tasks[0]?.data[6]).toBe(B_TRANSITION_WHITE_BARS_FADE);
    expect(battleRuntime.tasks[0]?.func).toBe('TeachyTvPreBattleAnimAndSetBattleCallback');

    TeachyTvPreBattleAnimAndSetBattleCallback(battleRuntime, 0);
    expect(battleRuntime.tasks[0]?.data[7]).toBe(1);
    battleRuntime.battleTransitionDone = true;
    TeachyTvPreBattleAnimAndSetBattleCallback(battleRuntime, 0);
    expect(battleRuntime.mainCallback).toBe('CB2_InitBattle');
    expect(battleRuntime.tasks[0]?.destroyed).toBe(true);

    const statusRuntime = initializedRuntime();
    statusRuntime.sStaticResources.whichScript = TTVSCR_STATUS;
    TTVcmd_TaskBattleOrFadeByOptionChosen(statusRuntime, 0);
    expect(statusRuntime.tasks[0]?.data[6]).toBe(B_TRANSITION_SLICE);

    const tmRuntime = initializedRuntime();
    tmRuntime.sStaticResources.whichScript = TTVSCR_TMS;
    TTVcmd_TaskBattleOrFadeByOptionChosen(tmRuntime, 0);
    expect(tmRuntime.sResources?.savedCallback).toBe('TeachyTvSetupBagItemsByOptionChosen');
    expect(tmRuntime.tasks[0]?.func).toBe('TeachyTvQuitFadeControlAndTaskDel');
    TeachyTvSetupBagItemsByOptionChosen(tmRuntime);
    expect(tmRuntime.initializedBagLocation).toBe(ITEMMENULOCATION_TTVSCR_TMS);

    tmRuntime.sStaticResources.whichScript = TTVSCR_REGISTER;
    TeachyTvSetupBagItemsByOptionChosen(tmRuntime);
    expect(tmRuntime.initializedBagLocation).toBe(ITEMMENULOCATION_TTVSCR_REGISTER);

    const restoreRuntime = createTeachyTvRuntime({ gBattleOutcome: B_OUTCOME_DREW });
    restoreRuntime.sStaticResources.callback = 'fieldCb';
    SetTeachyTvControllerModeToResume(restoreRuntime);
    TeachyTvRestorePlayerPartyCallback(restoreRuntime);
    expect(restoreRuntime.sStaticResources.mode).toBe(0);
    expect(restoreRuntime.mainCallback).toBe('TeachyTvMainCallback');
  });

  test('post-battle fade returns to the exact cluster index table', () => {
    const runtime = initializedRuntime();
    runtime.tasks[0]!.func = 'TeachyTvPostBattleFadeControl';

    for (const whichScript of [TTVSCR_BATTLE, TTVSCR_STATUS, TTVSCR_CATCHING, TTVSCR_TMS, TTVSCR_REGISTER]) {
      runtime.tasks[0]!.data[3] = 0;
      runtime.sStaticResources.whichScript = whichScript;
      TeachyTvPostBattleFadeControl(runtime, 0);
      expect(runtime.tasks[0]?.data[3]).toBe(sWhereToReturnToFromBattle[whichScript]);
      runtime.tasks[0]!.func = 'TeachyTvPostBattleFadeControl';
    }
  });

  test('quit fade chooses saved callback before overworld callback and frees resources', () => {
    const runtime = initializedRuntime();
    runtime.sResources!.savedCallback = 'TeachyTvSetupBagItemsByOptionChosen';
    runtime.tasks[0]!.func = 'TeachyTvQuitFadeControlAndTaskDel';

    TeachyTvQuitFadeControlAndTaskDel(runtime, 0);

    expect(runtime.mainCallback).toBe('TeachyTvSetupBagItemsByOptionChosen');
    expect(runtime.sResources).toBeNull();
    expect(runtime.tasks[0]?.destroyed).toBe(true);
  });

  test('grass animation generation, movement callbacks, and tile lookup match the decompiled counters', () => {
    const runtime = initializedRuntime();
    const hostId = runtime.tasks[0]!.data[1];
    runtime.sprites[hostId]!.x2 = 0x30;
    runtime.sprites[hostId]!.y2 = 0x10;
    runtime.sResources!.grassAnimCounterLo = 0;
    runtime.sResources!.grassAnimCounterHi = 0;

    expect(TeachyTvGrassAnimationCheckIfNeedsToGenerateGrassObj(runtime, 0x20, 0x10)).toBe(1);

    runtime.tasks[0]!.data[2] = 15;
    TTVcmd_DudeMoveUp(runtime, 0);
    expect(runtime.sResources?.grassAnimCounterHi).toBe(-1);
    expect(runtime.tasks[0]?.data[2]).toBe(16);

    runtime.tasks[0]!.data[2] = 7;
    TTVcmd_DudeMoveRight(runtime, 0);
    expect(runtime.sprites.length).toBeGreaterThan(1);

    const grass = runtime.sprites.at(-1)!;
    grass.animEnded = true;
    grass.x2 = runtime.sprites[hostId]!.x2 + 16;
    TeachyTvGrassAnimationObjCallback(runtime, grass.id);
    expect(grass.destroyed).toBe(true);
  });

  test('tile flip and palette helper math is a direct C translation', () => {
    const sourceTile = Array.from({ length: 0x20 }, (_, i) => i + 1);
    const horizontal = Array.from({ length: 0x20 }, () => 0);
    TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(horizontal, sourceTile, 1);
    expect(horizontal.slice(0, 4)).toEqual([0x40, 0x30, 0x20, 0x10]);

    const vertical = Array.from({ length: 0x20 }, () => 0);
    TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(vertical, sourceTile, 2);
    expect(vertical.slice(0, 4)).toEqual([29, 30, 31, 32]);

    const tileset = Array.from({ length: 0x20 * 8 }, (_, i) => i & 0xff);
    const block = Array.from({ length: 0x80 }, () => 0);
    TeachyTvComputeMapTilesFromTilesetAndMetaTiles([0, 1, 2, 3, 4, 5, 6, 7], block, tileset);
    expect(block.some((value) => value !== 0)).toBe(true);

    const pals = Array.from({ length: 16 }, () => 0xff);
    expect(TeachyTvComputePalIndexArrayEntryByMetaTile(pals, 0x3000)).toBe(0xf);
    expect(pals[0]).toBe(3);
    expect(TeachyTvComputePalIndexArrayEntryByMetaTile(pals, 0x5000)).toBe(0xe);
    expect(pals[1]).toBe(5);
    expect(TeachyTvComputePalIndexArrayEntryByMetaTile(pals, 0x3000)).toBe(0xf);

    const tilemap = Array.from({ length: 64 }, () => 0);
    TeachyTvPushBackNewMapPalIndexArrayEntry(tilemap, Array.from({ length: 16 }, () => 0xff), [0x1000, 0x2000, 0x1000, 0x3000], 2);
    expect(tilemap[0]).toBe((0xf << 12) + 8);
    expect(tilemap[1]).toBe((0xe << 12) + 9);
    expect(tilemap[32]).toBe((0xf << 12) + 10);
    expect(tilemap[33]).toBe((0xd << 12) + 11);
  });

  test('script table lengths preserve the shorter TMs/register path and text table uses battle text', () => {
    const runtime = initializedRuntime();
    expect(sTMsScript).toHaveLength(16);
    expect(runtime.textPrinterLog).toEqual([]);

    runtime.sStaticResources.whichScript = TTVSCR_BATTLE;
    TTVcmd_TextPrinterSwitchStringByOptionChosen(runtime, 0);
    expect(runtime.textPrinterLog.at(-1)).toBe(gTeachyTvText_BattleScript1);

    expect(TeachyTvSetupWindow(runtime)).toBe(1);
    dispatchTeachyTvTask(runtime, 0);
  });

  test('TeachyTvCallback, vblank, tileset loading, and palette loading match the C helpers', () => {
    const runtime = initializedRuntime();
    runtime.listInputs.push(TTVSCR_CATCHING);

    TeachyTvCallback(runtime);
    expect(runtime.tasks[0]?.func).toBe('TeachyTvRenderMsgAndSwitchClusterFuncs');
    expect(runtime.operations.slice(-4)).toEqual([
      'AnimateSprites',
      'BuildOamBuffer',
      'DoScheduledBgTilemapCopiesToVram',
      'UpdatePaletteFade'
    ]);

    TeachyTvVblankHandler(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);

    const rawTiles = Array.from({ length: 0x40 }, (_, i) => i + 1);
    const rawDest = Array.from({ length: 0x80 }, () => 0);
    TeachyTvLoadMapTilesetToBuffer(runtime, { isCompressed: false, tiles: rawTiles }, rawDest, 2);
    expect(rawDest.slice(0, 0x40)).toEqual(rawTiles);
    expect(runtime.operations.at(-1)).toBe('CpuFastCopy(tiles,dstBuffer,64)');

    const compressedDest: number[] = [];
    TeachyTvLoadMapTilesetToBuffer(runtime, { isCompressed: true, tiles: [9, 8, 7] }, compressedDest, 2);
    expect(compressedDest).toEqual([9, 8, 7]);
    expect(runtime.operations.at(-1)).toBe('LZDecompressWram(tiles,dstBuffer)');

    TeachyTvLoadMapTilesetToBuffer(runtime, null, compressedDest, 2);
    expect(compressedDest).toEqual([9, 8, 7]);

    TeachyTvLoadMapPalette(
      runtime,
      {
        primaryTileset: { isCompressed: false, tiles: [], palettes: [[1], [2], [3], [4], [5], [6], [7]] },
        secondaryTileset: { isCompressed: false, tiles: [], palettes: [[10], [11], [12], [13], [14], [15], [16], [17]] }
      },
      [0, 6, 7, 0xff, 1]
    );
    expect(runtime.operations.slice(-3)).toEqual([
      'LoadPalette(1,BG_PLTT_ID(15),PLTT_SIZE_4BPP)',
      'LoadPalette(7,BG_PLTT_ID(14),PLTT_SIZE_4BPP)',
      'LoadPalette(17,BG_PLTT_ID(13),PLTT_SIZE_4BPP)'
    ]);
  });
});
