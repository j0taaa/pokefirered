import { describe, expect, test } from 'vitest';
import * as battleRecords from '../src/game/decompBattleRecords';
import {
  A_BUTTON,
  B_OUTCOME_DREW,
  B_OUTCOME_LOST,
  B_OUTCOME_WON,
  COPYWIN_FULL,
  COPYWIN_GFX,
  DISPCNT_BG0_ON,
  DISPCNT_BG3_ON,
  DISPCNT_MODE_0,
  DISPCNT_OBJ_1D_MAP,
  EOS,
  EXT_CTRL_CODE_BEGIN,
  EXT_CTRL_CODE_JPN,
  GAME_STAT_LINK_BATTLE_DRAWS,
  GAME_STAT_LINK_BATTLE_LOSSES,
  GAME_STAT_LINK_BATTLE_WINS,
  LANGUAGE_JAPANESE,
  LINK_B_RECORDS_COUNT,
  MAP_GROUP_UNION_ROOM,
  MAP_NUM_UNION_ROOM,
  PALETTES_ALL,
  PLAYER_NAME_LENGTH,
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG3CNT,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WININ,
  RGB_BLACK,
  SE_SELECT,
  addOpponentLinkBattleRecord,
  bytesFromString,
  clearLinkBattleRecord,
  clearPlayerLinkBattleRecords,
  createBattleRecordsRuntime,
  createLinkBattleRecord,
  getLinkBattleRecordTotalBattles,
  indexOfOpponentLinkBattleRecord,
  loadFrameGfxOnBg,
  mainCB2,
  mainCB2SetUp,
  printBattleRecords,
  printOpponentBattleRecord,
  printTotalRecord,
  resetGpu,
  runBattleRecordsTask,
  showBattleRecords,
  sortLinkBattleRecords,
  stringFromBytes,
  taskDestroyAndReturnToField,
  taskFadeOut,
  taskWaitButton,
  taskWaitFadeIn,
  updateBattleOutcomeOnTrainerCards,
  updateLinkBattleGameStats,
  updateLinkBattleRecord,
  updatePlayerLinkBattleRecords,
  vblankCB
} from '../src/game/decompBattleRecords';

describe('decomp battle_records', () => {
  test('exports exact C battle-record names as aliases of the implemented logic', () => {
    expect(battleRecords.ShowBattleRecords).toBe(battleRecords.showBattleRecords);
    expect(battleRecords.MainCB2_SetUp).toBe(battleRecords.mainCB2SetUp);
    expect(battleRecords.VBlankCB).toBe(battleRecords.vblankCB);
    expect(battleRecords.MainCB2).toBe(battleRecords.mainCB2);
    expect(battleRecords.Task_WaitFadeIn).toBe(battleRecords.taskWaitFadeIn);
    expect(battleRecords.Task_WaitButton).toBe(battleRecords.taskWaitButton);
    expect(battleRecords.Task_FadeOut).toBe(battleRecords.taskFadeOut);
    expect(battleRecords.Task_DestroyAndReturnToField).toBe(battleRecords.taskDestroyAndReturnToField);
    expect(battleRecords.ClearWindowCommitAndRemove).toBe(battleRecords.clearWindowCommitAndRemove);
    expect(battleRecords.ResetGpu).toBe(battleRecords.resetGpu);
    expect(battleRecords.StopAllRunningTasks).toBe(battleRecords.stopAllRunningTasks);
    expect(battleRecords.EnableDisplay).toBe(battleRecords.enableDisplay);
    expect(battleRecords.ResetBGPos).toBe(battleRecords.resetBGPos);
    expect(battleRecords.ClearLinkBattleRecord).toBe(battleRecords.clearLinkBattleRecord);
    expect(battleRecords.ClearLinkBattleRecords).toBe(battleRecords.clearLinkBattleRecords);
    expect(battleRecords.GetLinkBattleRecordTotalBattles).toBe(battleRecords.getLinkBattleRecordTotalBattles);
    expect(battleRecords.IndexOfOpponentLinkBattleRecord).toBe(battleRecords.indexOfOpponentLinkBattleRecord);
    expect(battleRecords.SortLinkBattleRecords).toBe(battleRecords.sortLinkBattleRecords);
    expect(battleRecords.UpdateLinkBattleRecord).toBe(battleRecords.updateLinkBattleRecord);
    expect(battleRecords.UpdateLinkBattleGameStats).toBe(battleRecords.updateLinkBattleGameStats);
    expect(battleRecords.AddOpponentLinkBattleRecord).toBe(battleRecords.addOpponentLinkBattleRecord);
    expect(battleRecords.ClearPlayerLinkBattleRecords).toBe(battleRecords.clearPlayerLinkBattleRecords);
    expect(battleRecords.IncTrainerCardWinCount).toBe(battleRecords.incTrainerCardWinCount);
    expect(battleRecords.IncTrainerCardLossCount).toBe(battleRecords.incTrainerCardLossCount);
    expect(battleRecords.UpdateBattleOutcomeOnTrainerCards).toBe(battleRecords.updateBattleOutcomeOnTrainerCards);
    expect(battleRecords.UpdatePlayerLinkBattleRecords).toBe(battleRecords.updatePlayerLinkBattleRecords);
    expect(battleRecords.PrintTotalRecord).toBe(battleRecords.printTotalRecord);
    expect(battleRecords.PrintOpponentBattleRecord).toBe(battleRecords.printOpponentBattleRecord);
    expect(battleRecords.PrintBattleRecords).toBe(battleRecords.printBattleRecords);
    expect(battleRecords.CommitWindow).toBe(battleRecords.commitWindow);
    expect(battleRecords.LoadFrameGfxOnBg).toBe(battleRecords.loadFrameGfxOnBg);
  });

  test('record clearing, totals, sorting, and lookup mirror the fixed-size link record table', () => {
    const runtime = createBattleRecordsRuntime();
    const records = runtime.gSaveBlock2Ptr.linkBattleRecords;
    records.entries[0] = { name: bytesFromString('ONE'), trainerId: 1, wins: 1, losses: 1, draws: 0 };
    records.entries[1] = { name: bytesFromString('TWO'), trainerId: 2, wins: 6, losses: 0, draws: 0 };
    records.entries[2] = { name: bytesFromString('THREE'), trainerId: 3, wins: 1, losses: 1, draws: 3 };
    records.entries[3] = { name: bytesFromString('FOUR'), trainerId: 4, wins: 0, losses: 0, draws: 1 };
    records.entries[4] = { name: bytesFromString('FIVE'), trainerId: 5, wins: 2, losses: 2, draws: 2 };

    expect(getLinkBattleRecordTotalBattles(records.entries[2])).toBe(5);
    expect(indexOfOpponentLinkBattleRecord(records, bytesFromString('TWO'), 2)).toBe(1);
    expect(indexOfOpponentLinkBattleRecord(records, bytesFromString('TWO'), 99)).toBe(LINK_B_RECORDS_COUNT);

    sortLinkBattleRecords(records);
    expect(records.entries.map((record) => stringFromBytes(record.name))).toEqual(['FIVE', 'TWO', 'THREE', 'ONE', 'FOUR']);

    clearLinkBattleRecord(records.entries[0]);
    expect(records.entries[0]).toEqual({ name: [EOS], trainerId: 0, wins: 0, losses: 0, draws: 0 });

    clearPlayerLinkBattleRecords(runtime);
    expect(records.entries.every((record) => record.name[0] === EOS && record.trainerId === 0)).toBe(true);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_WINS]).toBe(0);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_LOSSES]).toBe(0);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_DRAWS]).toBe(0);
  });

  test('record and game-stat increments cap at 9999 and ignore unknown outcomes', () => {
    const runtime = createBattleRecordsRuntime();
    const record = createLinkBattleRecord();
    record.wins = 9999;
    record.losses = 9998;
    record.draws = 0;
    runtime.gameStats[GAME_STAT_LINK_BATTLE_WINS] = 9999;
    runtime.gameStats[GAME_STAT_LINK_BATTLE_LOSSES] = 9998;

    updateLinkBattleRecord(record, B_OUTCOME_WON);
    updateLinkBattleRecord(record, B_OUTCOME_LOST);
    updateLinkBattleRecord(record, B_OUTCOME_DREW);
    updateLinkBattleRecord(record, 99);
    expect(record).toMatchObject({ wins: 9999, losses: 9999, draws: 1 });

    updateLinkBattleGameStats(runtime, B_OUTCOME_WON);
    updateLinkBattleGameStats(runtime, B_OUTCOME_LOST);
    updateLinkBattleGameStats(runtime, 99);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_WINS]).toBe(9999);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_LOSSES]).toBe(9999);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_DRAWS] ?? 0).toBe(0);
  });

  test('AddOpponentLinkBattleRecord prefixes Japanese names, replaces the last slot, updates outcome, and resorts', () => {
    const runtime = createBattleRecordsRuntime();
    const records = runtime.gSaveBlock2Ptr.linkBattleRecords;
    records.entries[0] = { name: bytesFromString('TOP'), trainerId: 10, wins: 9, losses: 0, draws: 0 };
    records.entries[1] = { name: bytesFromString('MID'), trainerId: 11, wins: 3, losses: 0, draws: 0 };
    records.entries[2] = { name: bytesFromString('LOW'), trainerId: 12, wins: 1, losses: 0, draws: 0 };
    records.entries[3] = { name: bytesFromString('ZERO'), trainerId: 13, wins: 0, losses: 0, draws: 0 };
    records.entries[4] = { name: bytesFromString('DROP'), trainerId: 14, wins: 0, losses: 0, draws: 0 };

    addOpponentLinkBattleRecord(runtime, records, bytesFromString('NIPPON'), 77, B_OUTCOME_LOST, LANGUAGE_JAPANESE);

    const inserted = records.entries.find((record) => record.trainerId === 77);
    expect(inserted?.name.slice(0, PLAYER_NAME_LENGTH)).toEqual([EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_JPN, ...bytesFromString('NIPPON').slice(0, 5)]);
    expect(inserted?.losses).toBe(1);
    expect(records.entries.map((record) => getLinkBattleRecordTotalBattles(record))).toEqual([9, 3, 1, 1, 0]);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_LOSSES]).toBe(1);

    addOpponentLinkBattleRecord(runtime, records, inserted!.name, 77, B_OUTCOME_DREW, 0);
    expect(records.entries.find((record) => record.trainerId === 77)?.draws).toBe(1);
    expect(runtime.gameStats[GAME_STAT_LINK_BATTLE_DRAWS]).toBe(1);
  });

  test('UpdatePlayerLinkBattleRecords skips Union Room and otherwise updates trainer cards plus opponent table', () => {
    const runtime = createBattleRecordsRuntime();
    runtime.gTrainerCards[2].rse.playerName = bytesFromString('RIVAL');
    runtime.gTrainerCards[2].rse.trainerId = 0x1234;
    runtime.gLinkPlayers[2].language = 0;
    runtime.gBattleOutcome = B_OUTCOME_WON;

    updatePlayerLinkBattleRecords(runtime, 2);
    expect(runtime.gTrainerCards[3].rse.linkBattleWins).toBe(1);
    expect(runtime.gTrainerCards[2].rse.linkBattleLosses).toBe(1);
    expect(runtime.gSaveBlock2Ptr.linkBattleRecords.entries[0]).toMatchObject({ trainerId: 0x1234, wins: 1 });

    runtime.gSaveBlock1Ptr.location = { mapGroup: MAP_GROUP_UNION_ROOM, mapNum: MAP_NUM_UNION_ROOM };
    runtime.gBattleOutcome = B_OUTCOME_LOST;
    updatePlayerLinkBattleRecords(runtime, 2);
    expect(runtime.gTrainerCards[2].rse.linkBattleWins).toBe(0);
    expect(runtime.gTrainerCards[3].rse.linkBattleLosses).toBe(0);
  });

  test('trainer card outcome helper applies won/lost cases and saturating counters', () => {
    const runtime = createBattleRecordsRuntime();
    runtime.gBattleOutcome = B_OUTCOME_LOST;
    runtime.gTrainerCards[0].rse.linkBattleWins = 9999;
    runtime.gTrainerCards[1].rse.linkBattleLosses = 9999;

    updateBattleOutcomeOnTrainerCards(runtime, 0);
    expect(runtime.gTrainerCards[0].rse.linkBattleWins).toBe(9999);
    expect(runtime.gTrainerCards[1].rse.linkBattleLosses).toBe(9999);

    runtime.gBattleOutcome = B_OUTCOME_DREW;
    updateBattleOutcomeOnTrainerCards(runtime, 0);
    expect(runtime.gTrainerCards[0].rse.linkBattleWins).toBe(9999);
    expect(runtime.gTrainerCards[1].rse.linkBattleLosses).toBe(9999);
  });

  test('ShowBattleRecords, VBlankCB, MainCB2, GPU reset, display enable, and frame graphics emit the same calls', () => {
    const runtime = createBattleRecordsRuntime();

    showBattleRecords(runtime);
    expect(runtime.vblankCallback).toBeNull();
    expect(runtime.mainCallback2).toBe('MainCB2_SetUp');

    vblankCB(runtime);
    mainCB2(runtime);
    expect(runtime.calls.map((call) => call.fn)).toEqual([
      'SetVBlankCallback',
      'SetMainCallback2',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'TransferPlttBuffer',
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'UpdatePaletteFade'
    ]);
    expect(runtime.calls.at(-2)?.fn).toBe('BuildOamBuffer');
    expect(runtime.calls.at(-1)?.fn).toBe('UpdatePaletteFade');

    resetGpu(runtime);
    expect(runtime.calls.some((call) => call.fn === 'DmaClearLarge16' && call.args[1] === 'VRAM')).toBe(true);
    expect(runtime.gpuRegs[REG_OFFSET_BG0CNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_BG3CNT]).toBe(0);
    expect(runtime.gpuRegs[REG_OFFSET_WININ]).toBe(0);

    loadFrameGfxOnBg(runtime, 3);
    expect(runtime.calls.slice(-3).map((call) => call.fn)).toEqual(['LoadBgTiles', 'CopyToBgTilemapBufferRect', 'LoadPalette']);
  });

  test('MainCB2_SetUp advances through the exact setup states and respects DMA busy state', () => {
    const runtime = createBattleRecordsRuntime();

    for (let state = 0; state <= 3; state += 1) {
      expect(runtime.gMain.state).toBe(state);
      mainCB2SetUp(runtime);
    }
    expect(runtime.gMain.state).toBe(4);
    expect(runtime.sBg3TilemapBuffer_p).toHaveLength(0x800);
    expect(runtime.calls.some((call) => call.fn === 'SetBgTilemapBuffer' && call.args[0] === 3)).toBe(true);

    runtime.dma3Busy = true;
    mainCB2SetUp(runtime);
    expect(runtime.gMain.state).toBe(4);
    runtime.dma3Busy = false;
    mainCB2SetUp(runtime);
    expect(runtime.gMain.state).toBe(5);
    expect(runtime.calls.slice(-3).map((call) => call.fn)).toEqual(['ShowBg', 'ShowBg', 'CopyBgTilemapBufferToVram']);

    mainCB2SetUp(runtime);
    expect(runtime.gMain.state).toBe(6);
    mainCB2SetUp(runtime);
    expect(runtime.gMain.state).toBe(7);

    mainCB2SetUp(runtime);
    expect(runtime.gpuRegs[REG_OFFSET_DISPCNT]).toBe(DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG3_ON);
    expect(runtime.vblankCallback).toBe('VBlankCB');
    expect(runtime.mainCallback2).toBe('MainCB2');
    expect(runtime.gMain.state).toBe(0);
    expect(runtime.tasks.at(-1)).toMatchObject({ func: 'Task_WaitFadeIn', priority: 8 });
    expect(runtime.printedText.some((entry) => entry.text.includes('BATTLE RESULTS'))).toBe(true);
  });

  test('MainCB2_SetUp trainer tower branch calls PrintTrainerTowerRecords instead of battle record printing', () => {
    const runtime = createBattleRecordsRuntime();
    runtime.gSpecialVar_0x8004 = 1;
    runtime.gMain.state = 7;

    mainCB2SetUp(runtime);

    expect(runtime.calls.some((call) => call.fn === 'PrintTrainerTowerRecords')).toBe(true);
    expect(runtime.printedText).toHaveLength(0);
  });

  test('task callbacks wait for fades/buttons, play select, fade out, and destroy after cleanup', () => {
    const runtime = createBattleRecordsRuntime();
    runtime.sBg3TilemapBuffer_p = [1, 2, 3];
    runtime.tasks.push({ id: 0, func: 'Task_WaitFadeIn', priority: 8, destroyed: false, data: [] });

    runtime.gPaletteFade.active = true;
    taskWaitFadeIn(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_WaitFadeIn');
    runtime.gPaletteFade.active = false;
    runBattleRecordsTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_WaitButton');

    taskWaitButton(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_WaitButton');
    runtime.gMain.newKeys = A_BUTTON;
    runBattleRecordsTask(runtime, 0);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'PlaySE', args: [SE_SELECT] });
    expect(runtime.tasks[0].func).toBe('Task_FadeOut');

    taskFadeOut(runtime, 0);
    expect(runtime.calls.at(-1)).toEqual({ fn: 'BeginNormalPaletteFade', args: [PALETTES_ALL, 0, 0, 16, RGB_BLACK] });
    expect(runtime.tasks[0].func).toBe('Task_DestroyAndReturnToField');

    runtime.gPaletteFade.active = true;
    taskDestroyAndReturnToField(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(false);
    runtime.gPaletteFade.active = false;
    runBattleRecordsTask(runtime, 0);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldContinueScriptPlayMapMusic');
    expect(runtime.sBg3TilemapBuffer_p).toBeNull();
    expect(runtime.calls.slice(-5).map((call) => call.fn)).toEqual([
      'ClearWindowTilemap',
      'CopyWindowToVram',
      'RemoveWindow',
      'FreeAllWindowBuffers',
      'DestroyTask'
    ]);
    expect(runtime.calls.find((call) => call.fn === 'CopyWindowToVram' && call.args[1] === COPYWIN_GFX)).toBeTruthy();
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  test('printing helpers draw totals, blank records, populated records, and commit the window', () => {
    const runtime = createBattleRecordsRuntime();
    runtime.gameStats[GAME_STAT_LINK_BATTLE_WINS] = 12;
    runtime.gameStats[GAME_STAT_LINK_BATTLE_LOSSES] = 10000;
    runtime.gameStats[GAME_STAT_LINK_BATTLE_DRAWS] = 3;

    printTotalRecord(runtime, runtime.gSaveBlock2Ptr.linkBattleRecords);
    expect(runtime.printedText.at(-1)).toMatchObject({ x: 12, y: 24, text: 'TOTAL RECORD W:12   L:9999 D:3   ' });

    printOpponentBattleRecord(runtime, createLinkBattleRecord(), 50);
    expect(runtime.printedText.slice(-4).map((entry) => entry.text)).toEqual(['-------', '----', '----', '----']);
    expect(runtime.printedText.slice(-4).map((entry) => entry.x)).toEqual([0, 0x54, 0x84, 0xb4]);

    printOpponentBattleRecord(runtime, { name: bytesFromString('GARY'), trainerId: 1, wins: 4, losses: 12, draws: 0 }, 64);
    expect(runtime.printedText.slice(-4).map((entry) => entry.text)).toEqual(['GARY', '   4', '  12', '   0']);

    runtime.gSaveBlock2Ptr.linkBattleRecords.entries[0] = { name: bytesFromString('RED'), trainerId: 2, wins: 1, losses: 2, draws: 3 };
    printBattleRecords(runtime);
    expect(runtime.calls.find((call) => call.fn === 'FillWindowPixelRect')).toBeTruthy();
    expect(runtime.printedText.some((entry) => entry.text.includes('BATTLE RESULTS'))).toBe(true);
    expect(runtime.printedText.some((entry) => entry.text === 'WIN{CLEAR_TO 0x30}LOSE{CLEAR_TO 0x60}DRAW')).toBe(true);
    expect(runtime.calls.at(-2)).toEqual({ fn: 'PutWindowTilemap', args: [0] });
    expect(runtime.calls.at(-1)).toEqual({ fn: 'CopyWindowToVram', args: [0, COPYWIN_FULL] });
  });
});
