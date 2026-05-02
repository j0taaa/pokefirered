import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  CalcPayout,
  CalcSlotBias,
  CreateSlotMachine,
  GetNextReelPosition,
  ICON_7,
  ICON_CHERRIES,
  ICON_MAGNEMITE,
  ICON_PIKACHU,
  ICON_ROCKET,
  ICON_SHELLDER,
  InitReelButtonTileMem,
  IsReelSpinning,
  PALSLOT_LINE_BET,
  PALSLOT_LINE_MATCH,
  PALSLOT_LINE_NORMAL,
  PAYOUT_7,
  PAYOUT_CHERRIES2,
  PAYOUT_CHERRIES3,
  PAYOUT_MAGSHELL,
  PAYOUT_NONE,
  PAYOUT_PIKAPSY,
  PAYOUT_ROCKET,
  PlaySlotMachine,
  PressReelButton,
  ReelIconToPayoutRank,
  ReleaseReelButtons,
  SetLineStatesByBet,
  SignalStopWinningLineFlashTask,
  StartReels,
  StopReel1,
  StopReel2,
  StopReel3,
  Task_FlashWinningLine,
  Task_SpinReels,
  TestReelIconAttribute,
  TwoReelBiasCheck,
  createSlotMachineRuntime,
  sPayoutTable
} from '../src/game/decompSlotMachine';
import { createTask } from '../src/game/decompTask';

describe('decompSlotMachine', () => {
  test('PlaySlotMachine initializes the same persistent state and clamps machine index', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(99, 'ReturnCallback', runtime);

    expect(runtime.state?.machineIdx).toBe(0);
    expect(runtime.state?.savedCallback).toBe('ReturnCallback');
    expect(runtime.state?.currentReel).toBe(0);
    expect(runtime.state?.bet).toBe(0);
    expect(runtime.state?.payout).toBe(0);
    expect(runtime.state?.destReelPos).toEqual([21, 21, 21]);
    expect(runtime.mainCallback2).toBe('CB2_InitSlotMachine');
  });

  test('icon attribute and payout rank helpers match the decompiled switch tables', () => {
    expect(TestReelIconAttribute(PAYOUT_NONE, ICON_CHERRIES)).toBe(false);
    expect(TestReelIconAttribute(PAYOUT_CHERRIES2, ICON_CHERRIES)).toBe(true);
    expect(TestReelIconAttribute(PAYOUT_MAGSHELL, ICON_MAGNEMITE)).toBe(true);
    expect(TestReelIconAttribute(PAYOUT_MAGSHELL, ICON_SHELLDER)).toBe(true);
    expect(TestReelIconAttribute(PAYOUT_PIKAPSY, ICON_PIKACHU)).toBe(true);
    expect(TestReelIconAttribute(PAYOUT_ROCKET, ICON_ROCKET)).toBe(true);
    expect(TestReelIconAttribute(PAYOUT_7, ICON_7)).toBe(true);

    expect(ReelIconToPayoutRank(ICON_CHERRIES)).toBe(PAYOUT_CHERRIES2);
    expect(ReelIconToPayoutRank(ICON_MAGNEMITE)).toBe(PAYOUT_MAGSHELL);
    expect(ReelIconToPayoutRank(ICON_PIKACHU)).toBe(PAYOUT_PIKAPSY);
    expect(ReelIconToPayoutRank(ICON_ROCKET)).toBe(PAYOUT_ROCKET);
    expect(ReelIconToPayoutRank(ICON_7)).toBe(PAYOUT_7);
  });

  test('reel spin task preserves the three-subpixel decrement cadence and stop sentinel', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    StartReels(runtime);
    runtime.state!.destReelPos[0] = 19;

    Task_SpinReels(0, runtime);
    expect(runtime.state!.reelPositions[0]).toBe(0);
    expect(runtime.state!.reelSubpixel[0]).toBe(1);
    expect(IsReelSpinning(0, runtime)).toBe(true);

    Task_SpinReels(0, runtime);
    Task_SpinReels(0, runtime);
    expect(runtime.state!.reelPositions[0]).toBe(20);
    expect(runtime.state!.reelSubpixel[0]).toBe(0);

    while (IsReelSpinning(0, runtime)) Task_SpinReels(0, runtime);
    expect(runtime.state!.reelPositions[0]).toBe(19);
    expect(runtime.state!.destReelPos[0]).toBe(21);
  });

  test('stop-reel helpers use the same bias checks and deterministic sampled destination rules', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    runtime.state!.machineBias = PAYOUT_NONE;
    runtime.state!.reelPositions = [0, 0, 0];
    runtime.state!.reelSubpixel = [1, 0, 0];
    runtime.randomValues = [0];

    expect(GetNextReelPosition(0, runtime)).toBe(20);
    StopReel1(0, runtime);
    expect(runtime.state!.reelStopOrder[0]).toBe(0);
    expect(runtime.state!.destReelPos[0]).toBeGreaterThanOrEqual(0);
    expect(runtime.state!.destReelPos[0]).toBeLessThan(21);

    runtime.state!.machineBias = PAYOUT_7;
    runtime.state!.reelPositions = [8, 12, 0];
    runtime.state!.reelStopOrder = [0, 1, 0];
    StopReel2(1, runtime);
    StopReel3(2, runtime);
    expect(runtime.state!.reelStopOrder[1]).toBe(1);
    expect(runtime.state!.destReelPos[1]).toBeGreaterThanOrEqual(0);
    expect(runtime.state!.destReelPos[2]).toBeGreaterThanOrEqual(0);
    expect(typeof TwoReelBiasCheck(0, 1, 1, 12, PAYOUT_7)).toBe('boolean');
  });

  test('CalcSlotBias follows machine chances, cooldown, and non-overwrite rule for jackpot bias', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    runtime.randomValues = [0x8000, 0xffff];
    CalcSlotBias(runtime);
    expect(runtime.state!.machineBias).toBe(PAYOUT_CHERRIES2);

    runtime.state!.machineBias = PAYOUT_ROCKET;
    runtime.randomValues = [0];
    CalcSlotBias(runtime);
    expect(runtime.state!.machineBias).toBe(PAYOUT_ROCKET);
  });

  test('CalcPayout sums every active line and records win flags', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    runtime.state!.bet = 3;
    runtime.state!.reelPositions = [7, 11, 20];

    const best = CalcPayout(runtime);

    expect(best).toBe(PAYOUT_7);
    expect(runtime.state!.payout).toBe(sPayoutTable[PAYOUT_7]);
    expect(runtime.state!.winFlags).toEqual([false, true, false, false, false]);

    runtime.state!.bet = 1;
    runtime.state!.reelPositions = [0, 0, 0];
    expect(CalcPayout(runtime)).toBe(PAYOUT_CHERRIES3);
    expect(runtime.state!.payout).toBe(6);
  });

  test('line and button tile state mirror palette masks and released/pressed tile copies', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    CreateSlotMachine(runtime);
    runtime.state!.bet = 3;
    runtime.bgTilemapBuffer2[0x0229] = 0x1234;
    InitReelButtonTileMem(runtime);

    SetLineStatesByBet(runtime.bgTilemapBuffer2, runtime);
    expect(runtime.linePalettes).toEqual([PALSLOT_LINE_BET, PALSLOT_LINE_BET, PALSLOT_LINE_BET, PALSLOT_LINE_BET, PALSLOT_LINE_BET]);
    expect(runtime.bgTilemapBuffer2[0x0144] & 0xf000).toBe(PALSLOT_LINE_BET << 12);

    PressReelButton(0, 0, runtime);
    expect(runtime.bgTilemapBuffer2[0x0229]).toBe(0xc0);
    ReleaseReelButtons(runtime);
    expect(runtime.bgTilemapBuffer2[0x0229]).toBe(0x1234);
  });

  test('flash-winning-line task paints winning lines and restores them when signaled', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    runtime.state!.winFlags = [true, false, true, false, false];
    const taskId = createTask(runtime.taskRuntime, 'Task_FlashWinningLine', 3);

    Task_FlashWinningLine(taskId, runtime);
    expect(runtime.linePalettes[0]).toBe(PALSLOT_LINE_MATCH);
    expect(runtime.linePalettes[2]).toBe(PALSLOT_LINE_MATCH);

    SignalStopWinningLineFlashTask(runtime);
    Task_FlashWinningLine(taskId, runtime);
    expect(runtime.linePalettes[0]).toBe(PALSLOT_LINE_NORMAL);
    expect(runtime.linePalettes[2]).toBe(PALSLOT_LINE_NORMAL);
  });

  test('main task betting and reel start path consumes coins and launches spinning state', () => {
    const runtime = createSlotMachineRuntime();
    PlaySlotMachine(0, 'Return', runtime);
    CreateSlotMachine(runtime);
    runtime.coins = 10;
    const taskId = createTask(runtime.taskRuntime, 'MainTask_SlotsGameLoop', 0);
    runtime.state!.taskId = taskId;
    runtime.newKeys = A_BUTTON;
    runtime.state!.bet = 1;

    runtime.taskRuntime.tasks[taskId].data[0] = 0;
    runtime.taskRuntime.tasks[taskId].func = 'MainTask_SlotsGameLoop';
    runtime.newKeys = A_BUTTON;
    runtime.taskRuntime.callbacks.MainTask_SlotsGameLoop(taskId);
    expect(runtime.taskRuntime.tasks[taskId].data[0]).toBe(2);

    runtime.newKeys = 0;
    runtime.randomValues = [0, 0xffff];
    runtime.taskRuntime.callbacks.MainTask_SlotsGameLoop(taskId);
    expect(runtime.qlPlayedTheSlots).toBe(true);
    expect(runtime.state!.reelIsSpinning).toEqual([true, true, true]);
  });
});
