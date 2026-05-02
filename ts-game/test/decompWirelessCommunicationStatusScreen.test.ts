import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  ACTIVITY_BATTLE_SINGLE,
  ACTIVITY_BERRY_CRUSH,
  ACTIVITY_CHAT,
  ACTIVITY_NONE,
  ACTIVITY_SPIN_TRADE,
  B_BUTTON,
  COLOR_NONE,
  COLOR_NORMAL,
  COLOR_TITLE,
  COLOR_TOTAL,
  COLOR_UNUSED,
  CountPlayersInGroupAndGetActivity,
  CyclePalette,
  ExitWirelessCommunicationStatusScreen,
  FONT_NORMAL_COPY_2,
  FONT_SMALL,
  GROUPTYPE_BATTLE,
  GROUPTYPE_TOTAL,
  GROUPTYPE_TRADE,
  GROUPTYPE_UNION,
  HaveCountsChanged,
  IN_UNION_ROOM,
  NUM_GROUPTYPES,
  NUM_TASK_DATA,
  PrintHeaderTexts,
  SE_SELECT,
  ShowWirelessCommunicationScreen,
  Task_WirelessCommunicationScreen,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_GREEN,
  TEXT_COLOR_LIGHT_GRAY,
  TEXT_COLOR_LIGHT_GREEN,
  TEXT_COLOR_LIGHT_RED,
  TEXT_COLOR_RED,
  TEXT_COLOR_TRANSPARENT,
  TEXT_COLOR_WHITE,
  UpdateCommunicationCounts,
  WCSS_AddTextPrinterParameterized,
  CB2_InitWirelessCommunicationScreen,
  createRfuPlayer,
  createWirelessStatusRuntime,
} from '../src/game/decompWirelessCommunicationStatusScreen';

describe('decompWirelessCommunicationStatusScreen', () => {
  it('ShowWirelessCommunicationScreen installs the init callback', () => {
    const runtime = createWirelessStatusRuntime();
    ShowWirelessCommunicationScreen(runtime);
    expect(runtime.mainCallback2).toBe('CB2_InitWirelessCommunicationScreen');
  });

  it('CB2_InitWirelessCommunicationScreen mirrors setup state and creates screen tasks', () => {
    const runtime = createWirelessStatusRuntime();

    CB2_InitWirelessCommunicationScreen(runtime);

    expect(runtime.sStatusScreen).not.toBeNull();
    expect(runtime.sStatusScreen!.taskId).toBe(0);
    expect(runtime.sStatusScreen!.rfuTaskId).toBe(1);
    expect(runtime.sStatusScreen!.prevGroupCounts[GROUPTYPE_TOTAL]).toBe(1);
    expect(runtime.bgTilemapBuffers[0]).toHaveLength(0x800);
    expect(runtime.bgTilemapBuffers[1]).toHaveLength(0x800);
    expect(runtime.vBlankCallback).toBe('VBlankCB_WirelessCommunicationScreen');
    expect(runtime.mainCallback2).toBe('CB2_RunWirelessCommunicationScreen');
    expect(runtime.tasks).toHaveLength(2);
    expect(runtime.textPrinters[0].str).toBe('WIRELESS COMMUNICATION STATUS');
  });

  it('WCSS_AddTextPrinterParameterized uses the exact color table and speed rule', () => {
    const runtime = createWirelessStatusRuntime();
    WCSS_AddTextPrinterParameterized(runtime, 0, FONT_SMALL, 'none', 1, 2, COLOR_NONE);
    WCSS_AddTextPrinterParameterized(runtime, 0, FONT_NORMAL_COPY_2, 'normal', 1, 2, COLOR_NORMAL);
    WCSS_AddTextPrinterParameterized(runtime, 0, FONT_NORMAL_COPY_2, 'total', 1, 2, COLOR_TOTAL);
    WCSS_AddTextPrinterParameterized(runtime, 0, FONT_NORMAL_COPY_2, 'title', 1, 2, COLOR_TITLE);
    WCSS_AddTextPrinterParameterized(runtime, 0, FONT_NORMAL_COPY_2, 'unused', 1, 2, COLOR_UNUSED);

    expect(runtime.textPrinters.map((p) => p.color)).toEqual([
      [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY],
      [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY],
      [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_RED, TEXT_COLOR_LIGHT_RED],
      [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GREEN, TEXT_COLOR_GREEN],
      [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY],
    ]);
    expect(runtime.textPrinters[0].speed).toBe(0);
    expect(runtime.textPrinters[1].speed).toBe(1);
  });

  it('CyclePalette advances every six calls and wraps at ARRAY_COUNT(sPalettes) - 2', () => {
    const runtime = createWirelessStatusRuntime();
    const data = Array(16).fill(0);

    for (let i = 0; i < 5; i += 1) CyclePalette(runtime, data);
    expect(data[7]).toBe(5);
    expect(data[8]).toBe(0);

    CyclePalette(runtime, data);
    expect(data[7]).toBe(0);
    expect(data[8]).toBe(1);
    expect(runtime.calls.at(-1)).toEqual({ op: 'LoadPalette', args: ['sPalettes[3]', 0, 16] });

    data[7] = 5;
    data[8] = 13;
    CyclePalette(runtime, data);
    expect(data[8]).toBe(0);
    expect(runtime.calls.at(-1)).toEqual({ op: 'LoadPalette', args: ['sPalettes[2]', 0, 16] });
  });

  it('CountPlayersInGroupAndGetActivity handles fixed and dynamic player counts only for spawn-in players', () => {
    const counts = [0, 0, 0, 0];

    expect(CountPlayersInGroupAndGetActivity(createRfuPlayer(ACTIVITY_BATTLE_SINGLE), counts)).toBe(ACTIVITY_BATTLE_SINGLE);
    expect(counts[GROUPTYPE_BATTLE]).toBe(2);

    CountPlayersInGroupAndGetActivity(createRfuPlayer(ACTIVITY_BERRY_CRUSH, [1, 0, 2, 3]), counts);
    expect(counts[GROUPTYPE_TOTAL]).toBe(4);

    CountPlayersInGroupAndGetActivity(createRfuPlayer(ACTIVITY_CHAT | IN_UNION_ROOM, [7, 8, 0, 0]), counts);
    expect(counts[GROUPTYPE_UNION]).toBe(3);

    CountPlayersInGroupAndGetActivity(createRfuPlayer(ACTIVITY_SPIN_TRADE, [1, 1, 0, 0], 0), counts);
    expect(counts[GROUPTYPE_TRADE]).toBe(0);
  });

  it('HaveCountsChanged compares all NUM_GROUPTYPES slots', () => {
    expect(HaveCountsChanged([0, 0, 0, 0], [0, 0, 0, 0])).toBe(false);
    expect(HaveCountsChanged([0, 0, 0, 1], [0, 0, 0, 0])).toBe(true);
  });

  it('UpdateCommunicationCounts returns activity updates and computes revision-10 total', () => {
    const runtime = createWirelessStatusRuntime();
    CB2_InitWirelessCommunicationScreen(runtime);
    const status = runtime.sStatusScreen!;
    const group = runtime.tasks[status.rfuTaskId].group!;
    group.playerList.players = Array.from({ length: NUM_TASK_DATA }, () => createRfuPlayer(ACTIVITY_NONE, [], 0));
    group.playerList.players[0] = createRfuPlayer(ACTIVITY_BATTLE_SINGLE);
    group.playerList.players[1] = createRfuPlayer(ACTIVITY_SPIN_TRADE, [1, 2]);
    group.playerList.players[2] = createRfuPlayer(ACTIVITY_CHAT | IN_UNION_ROOM, [1, 2, 3]);
    group.playerList.players[3] = createRfuPlayer(ACTIVITY_BERRY_CRUSH, [9]);

    expect(UpdateCommunicationCounts(runtime, status.groupCounts, status.prevGroupCounts, status.activities, status.rfuTaskId)).toBe(true);

    expect(status.groupCounts.slice(0, NUM_GROUPTYPES)).toEqual([3, 2, 4, 11]);
    expect(status.prevGroupCounts.slice(0, NUM_GROUPTYPES)).toEqual([3, 2, 4, 2]);
    expect(status.activities[0]).toBe(ACTIVITY_BATTLE_SINGLE);
    expect(status.activities[3]).toBe(ACTIVITY_BERRY_CRUSH);

    expect(UpdateCommunicationCounts(runtime, status.groupCounts, status.prevGroupCounts, status.activities, status.rfuTaskId)).toBe(false);
    group.playerList.players[4] = createRfuPlayer(ACTIVITY_NONE | IN_UNION_ROOM);
    expect(UpdateCommunicationCounts(runtime, status.groupCounts, status.prevGroupCounts, status.activities, status.rfuTaskId)).toBe(true);
  });

  it('PrintHeaderTexts clears windows, centers title, and prints group headers', () => {
    const runtime = createWirelessStatusRuntime();
    PrintHeaderTexts(runtime);

    expect(runtime.calls.slice(0, 3)).toEqual([
      { op: 'FillWindowPixelBuffer', args: [0, 0] },
      { op: 'FillWindowPixelBuffer', args: [1, 0] },
      { op: 'FillWindowPixelBuffer', args: [2, 0] },
    ]);
    expect(runtime.textPrinters.map((p) => p.str)).toEqual([
      'WIRELESS COMMUNICATION STATUS',
      'People trading',
      'People battling',
      'People in Union Room',
      'People communicating',
    ]);
    expect(runtime.textPrinters.at(-1)!.color).toEqual([TEXT_COLOR_TRANSPARENT, TEXT_COLOR_RED, TEXT_COLOR_LIGHT_RED]);
  });

  it('Task_WirelessCommunicationScreen steps through fade-in, update, input, and fade-out states', () => {
    const runtime = createWirelessStatusRuntime();
    CB2_InitWirelessCommunicationScreen(runtime);
    const status = runtime.sStatusScreen!;
    const task = runtime.tasks[status.taskId];
    const group = runtime.tasks[status.rfuTaskId].group!;
    group.playerList.players = Array.from({ length: NUM_TASK_DATA }, () => createRfuPlayer(ACTIVITY_NONE, [], 0));
    group.playerList.players[0] = createRfuPlayer(ACTIVITY_BATTLE_SINGLE);

    task.data[0] = 1;
    Task_WirelessCommunicationScreen(runtime, status.taskId);
    expect(task.data[0]).toBe(2);
    expect(runtime.shownBgs).toContain(1);
    expect(runtime.shownBgs).toContain(0);

    runtime.gPaletteFade.active = false;
    Task_WirelessCommunicationScreen(runtime, status.taskId);
    expect(task.data[0]).toBe(3);

    runtime.newKeys = A_BUTTON;
    Task_WirelessCommunicationScreen(runtime, status.taskId);
    expect(task.data[0]).toBe(4);
    expect(runtime.playedSE).toEqual([SE_SELECT]);
    expect(runtime.tasks[status.rfuTaskId].data[15]).toBe(0xff);
    expect(runtime.textPrinters.some((p) => p.windowId === 2 && p.str.trim() === '2')).toBe(true);

    Task_WirelessCommunicationScreen(runtime, status.taskId);
    expect(task.data[0]).toBe(5);
    expect(runtime.calls.at(-1)).toEqual({ op: 'BeginNormalPaletteFade', args: [0xffff, 0, 0, 16, 0] });

    Task_WirelessCommunicationScreen(runtime, status.taskId);
    expect(runtime.mainCallback2).toBe('ExitWirelessCommunicationStatusScreen');
    expect(task.destroyed).toBe(true);
  });

  it('Task_WirelessCommunicationScreen accepts B button or svc_53 as exit triggers', () => {
    const runtime = createWirelessStatusRuntime();
    CB2_InitWirelessCommunicationScreen(runtime);
    const status = runtime.sStatusScreen!;
    runtime.tasks[status.taskId].data[0] = 3;
    runtime.newKeys = B_BUTTON;

    Task_WirelessCommunicationScreen(runtime, status.taskId);
    expect(runtime.tasks[status.taskId].data[0]).toBe(4);

    const svcRuntime = createWirelessStatusRuntime();
    CB2_InitWirelessCommunicationScreen(svcRuntime);
    const svcStatus = svcRuntime.sStatusScreen!;
    svcRuntime.tasks[svcStatus.taskId].data[0] = 3;
    svcRuntime.svc53 = true;
    Task_WirelessCommunicationScreen(svcRuntime, svcStatus.taskId);
    expect(svcRuntime.tasks[svcStatus.taskId].data[0]).toBe(4);
  });

  it('ExitWirelessCommunicationStatusScreen frees windows, bg buffers, status data, and returns to field', () => {
    const runtime = createWirelessStatusRuntime();
    CB2_InitWirelessCommunicationScreen(runtime);
    const bg0 = runtime.bgTilemapBuffers[0];
    const bg1 = runtime.bgTilemapBuffers[1];
    const status = runtime.sStatusScreen;

    ExitWirelessCommunicationStatusScreen(runtime);

    expect(runtime.calls).toContainEqual({ op: 'FreeAllWindowBuffers', args: [] });
    expect(runtime.freed).toContain(bg0);
    expect(runtime.freed).toContain(bg1);
    expect(runtime.freed).toContain(status);
    expect(runtime.sStatusScreen).toBeNull();
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldContinueScriptPlayMapMusic');
  });
});
