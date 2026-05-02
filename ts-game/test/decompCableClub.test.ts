import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_LINK_IN_BATTLE,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_TRAINER,
  B_OUTCOME_LOST,
  B_OUTCOME_WON,
  CABLE_SEAT_FAILED,
  CABLE_SEAT_SUCCESS,
  CB2_ReturnFromCableClubBattle,
  CB2_ReturnFromUnionRoomBattle,
  CARD_STAT_BATTLES_LOST,
  CARD_STAT_BATTLES_WON,
  CheckLinkCanceled,
  CheckLinkCanceledBeforeConnection,
  CheckLinkErrored,
  CheckSioErrored,
  CleanupLinkRoomState,
  CreateLinkupTask,
  CreateTask,
  CreateTask_ReestablishCableClubLink,
  EnterColosseumPlayerSpot,
  EnterTradeSeat,
  EXCHANGE_COMPLETE,
  EXCHANGE_DIFF_SELECTIONS,
  EXCHANGE_PARTNER_NOT_READY,
  EXCHANGE_PLAYER_NOT_READY,
  EXCHANGE_TIMED_OUT,
  EXCHANGE_WRONG_NUM_PLAYERS,
  ExchangeDataAndGetLinkupStatus,
  ExitLinkRoom,
  FIELD_MESSAGE_BOX_HIDDEN,
  GetSeeingLinkPlayerCardMsg,
  LINKTYPE_BATTLE,
  LINKTYPE_CONTEST_GMODE,
  LINKTYPE_MULTI_BATTLE,
  LINKTYPE_RECORD_MIX_AFTER,
  LINKTYPE_RECORD_MIX_BEFORE,
  LINKTYPE_SINGLE_BATTLE,
  LINKTYPE_TRADE,
  LINKTYPE_TRADE_SETUP,
  LINKUP_CONNECTION_ERROR,
  LINKUP_DIFF_SELECTIONS,
  LINKUP_ONGOING,
  LINKUP_PARTNER_NOT_READY,
  LINKUP_PLAYER_NOT_READY,
  LINKUP_SUCCESS,
  LINKUP_WRONG_NUM_PLAYERS,
  MUS_RS_VS_GYM_LEADER,
  MUS_RS_VS_TRAINER,
  Script_ShowLinkTrainerCard,
  StartWiredCableClubTrade,
  TASK_NONE,
  TRAINER_LINK_OPPONENT,
  Task_DelayedBlockRequest,
  Task_EnterCableClubSeat,
  Task_LinkupAwaitConfirmation,
  Task_LinkupAwaitConnection,
  Task_LinkupAwaitTrainerCardData,
  Task_LinkupCheckStatusAfterConfirm,
  Task_LinkupConfirm,
  Task_LinkupConfirmWhenReady,
  Task_LinkupConnectionError,
  Task_LinkupExchangeDataWithLeader,
  Task_LinkupFailed,
  Task_LinkupStart,
  Task_LinkupTryConfirmation,
  Task_ReestablishLink,
  Task_ReestablishLinkAwaitConfirmation,
  Task_ReestablishLinkAwaitConnection,
  Task_ReestablishLinkLeader,
  Task_StartWiredCableClubBattle,
  Task_StartWiredTrade,
  Task_StartWirelessCableClubBattle,
  Task_StartWirelessTrade,
  Task_StopLinkup,
  Task_WaitExitToScript,
  Task_WaitForLinkPlayerConnection,
  TryBattleLinkup,
  TryContestLinkup,
  TryLinkTimeout,
  TryRecordMixLinkup,
  TryTradeLinkup,
  USING_DOUBLE_BATTLE,
  USING_MULTI_BATTLE,
  USING_RECORD_CORNER,
  USING_SINGLE_BATTLE,
  USING_TRADE_CENTER,
  VERSION_FIRE_RED,
  VERSION_LEAF_GREEN,
  VERSION_RUBY,
  VERSION_SAPPHIRE,
  WARP_ID_DYNAMIC,
  createDecompCableClubRuntime,
  runCableClubTask
} from '../src/game/decompCableClub';

const stepUntilDestroyed = (runtime: ReturnType<typeof createDecompCableClubRuntime>, taskId: number, limit = 80): void => {
  for (let i = 0; i < limit && !runtime.tasks[taskId].destroyed; i++) runCableClubTask(runtime, taskId);
};

describe('decomp cable_club.c parity', () => {
  test('CreateLinkupTask and Task_LinkupStart initialize globals and wait ten ticks before await-connection', () => {
    const runtime = createDecompCableClubRuntime({ linkPlayerCount: 4, nextWindowId: 7 });
    CreateLinkupTask(runtime, 2, 4);
    CreateLinkupTask(runtime, 4, 4);
    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.tasks[0].data[1]).toBe(2);
    expect(runtime.tasks[0].data[2]).toBe(4);

    runCableClubTask(runtime, 0);
    expect(runtime.operations.slice(1, 5)).toEqual(['OpenLinkTimed', 'ResetLinkPlayerCount', 'ResetLinkPlayers', 'AddWindow:7']);
    expect(runtime.linkPlayerCount).toBe(0);
    expect(runtime.tasks[0].data[5]).toBe(7);

    for (let i = 0; i < 10; i++) runCableClubTask(runtime, 0);
    expect(runtime.tasks[0].func).toBe(Task_LinkupAwaitConnection);
  });

  test('linkup exchange status maps timed exchange codes and writes wrong-player count text', () => {
    const runtime = createDecompCableClubRuntime({ linkPlayerCount: 3 });
    runtime.exchangeStatus = EXCHANGE_TIMED_OUT;
    expect(ExchangeDataAndGetLinkupStatus(runtime, 2, 4)).toBe(LINKUP_ONGOING);
    runtime.exchangeStatus = EXCHANGE_COMPLETE;
    expect(ExchangeDataAndGetLinkupStatus(runtime, 2, 4)).toBe(LINKUP_SUCCESS);
    runtime.exchangeStatus = EXCHANGE_DIFF_SELECTIONS;
    expect(ExchangeDataAndGetLinkupStatus(runtime, 2, 4)).toBe(LINKUP_DIFF_SELECTIONS);
    runtime.exchangeStatus = EXCHANGE_PLAYER_NOT_READY;
    expect(ExchangeDataAndGetLinkupStatus(runtime, 2, 4)).toBe(LINKUP_PLAYER_NOT_READY);
    runtime.exchangeStatus = EXCHANGE_PARTNER_NOT_READY;
    expect(ExchangeDataAndGetLinkupStatus(runtime, 2, 4)).toBe(LINKUP_PARTNER_NOT_READY);
    runtime.exchangeStatus = EXCHANGE_WRONG_NUM_PLAYERS;
    expect(ExchangeDataAndGetLinkupStatus(runtime, 2, 4)).toBe(LINKUP_WRONG_NUM_PLAYERS);
    expect(runtime.gStringVar1).toBe('3');
  });

  test('cancel, SIO, and link-error checks mutate task funcs exactly like the C helpers', () => {
    const runtime = createDecompCableClubRuntime({ input: { aNew: false, bNew: true, aHeld: false, bHeld: false } });
    const taskId = CreateTask(runtime, Task_LinkupStart, 80);
    runtime.gLinkType = LINKTYPE_SINGLE_BATTLE;
    expect(CheckLinkCanceledBeforeConnection(runtime, taskId)).toBe(true);
    expect(runtime.gLinkType).toBe(0);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupFailed);

    runtime.tasks[taskId].func = Task_LinkupStart;
    runtime.isLinkConnectionEstablished = true;
    expect(CheckLinkCanceled(runtime, taskId)).toBe(true);
    expect(runtime.operations).toContain('SetSuppressLinkErrorMessage:1');

    runtime.tasks[taskId].func = Task_LinkupStart;
    runtime.sioMultiSI = true;
    expect(CheckSioErrored(runtime, taskId)).toBe(true);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupConnectionError);

    runtime.tasks[taskId].func = Task_LinkupStart;
    runtime.hasLinkErrorOccurred = true;
    expect(CheckLinkErrored(runtime, taskId)).toBe(true);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupConnectionError);
  });

  test('leader linkup follows ready, confirmation, exchange-success, trainer-card, and destroy states', () => {
    const runtime = createDecompCableClubRuntime({
      isLinkMaster: true,
      isLinkConnectionEstablished: true,
      linkPlayerCount: 2,
      exchangeStatus: EXCHANGE_COMPLETE,
      blockReceivedStatus: 0b11,
      linkPlayers: [
        { version: VERSION_FIRE_RED, trainerId: 2, name: 'RED' },
        { version: VERSION_SAPPHIRE, trainerId: 3, name: 'SAPPH' },
        { version: VERSION_LEAF_GREEN, trainerId: 0, name: '' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' }
      ],
      blockRecvBuffer: [{ frlg: true }, { rse: true }]
    });
    const taskId = CreateTask(runtime, Task_LinkupStart, 80);
    runtime.tasks[taskId].data[1] = 2;
    runtime.tasks[taskId].data[2] = 2;
    runtime.tasks[taskId].data[5] = 4;

    Task_LinkupAwaitConnection(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupConfirmWhenReady);
    expect(runtime.operations).toContain(`PlaySE:21`);

    runtime.fieldMessageBoxType = FIELD_MESSAGE_BOX_HIDDEN;
    Task_LinkupConfirmWhenReady(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupAwaitConfirmation);

    runtime.input.aNew = true;
    Task_LinkupAwaitConfirmation(runtime, taskId);
    expect(runtime.savedPlayerCount).toBe(2);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupTryConfirmation);

    runtime.input.aNew = false;
    runtime.input.aHeld = true;
    runtime.fieldMessageBoxType = FIELD_MESSAGE_BOX_HIDDEN;
    Task_LinkupTryConfirmation(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupConfirm);

    Task_LinkupConfirm(runtime, taskId);
    expect(runtime.gSpecialVar_Result).toBe(LINKUP_SUCCESS);
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupCheckStatusAfterConfirm);

    Task_LinkupCheckStatusAfterConfirm(runtime, taskId);
    expect(runtime.gFieldLinkPlayerCount).toBe(2);
    expect(runtime.gLocalLinkPlayerId).toBe(0);
    expect(runtime.operations).toContain('SendBlockRequest:2');
    expect(runtime.tasks[taskId].func).toBe(Task_LinkupAwaitTrainerCardData);

    Task_LinkupAwaitTrainerCardData(runtime, taskId);
    expect(runtime.trainerCards[0]).toEqual({ frlg: true });
    expect(runtime.trainerCards[1]).toEqual({ rse: { rse: true }, version: VERSION_SAPPHIRE });
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.operations).toContain('ScriptContext_Enable');
  });

  test('leader failure statuses choose close-link or callback based on C branches', () => {
    const wrongRs = createDecompCableClubRuntime({
      linkPlayerCount: 2,
      gSpecialVar_Result: LINKUP_WRONG_NUM_PLAYERS,
      linkPlayers: [
        { version: VERSION_RUBY, trainerId: 1, name: 'R' },
        { version: VERSION_FIRE_RED, trainerId: 2, name: 'F' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' }
      ]
    });
    const taskId = CreateTask(wrongRs, Task_LinkupStart, 80);
    Task_LinkupCheckStatusAfterConfirm(wrongRs, taskId);
    expect(wrongRs.operations).toContain('CloseLink');
    expect(wrongRs.tasks[taskId].func).toBe(Task_StopLinkup);

    const wrongFrlg = createDecompCableClubRuntime({ linkPlayerCount: 2, gSpecialVar_Result: LINKUP_WRONG_NUM_PLAYERS });
    const wrongFrlgTask = CreateTask(wrongFrlg, Task_LinkupStart, 80);
    Task_LinkupCheckStatusAfterConfirm(wrongFrlg, wrongFrlgTask);
    expect(wrongFrlg.operations).toContain('SetCloseLinkCallback');

    const notReady = createDecompCableClubRuntime({ gSpecialVar_Result: LINKUP_PARTNER_NOT_READY });
    const notReadyTask = CreateTask(notReady, Task_LinkupStart, 80);
    Task_LinkupCheckStatusAfterConfirm(notReady, notReadyTask);
    expect(notReady.operations).toContain('CloseLink');
  });

  test('follower exchange data path handles ongoing, close-callback failures, close-link failures, and success', () => {
    const ongoing = createDecompCableClubRuntime({ exchangeStatus: EXCHANGE_TIMED_OUT });
    const ongoingTask = CreateTask(ongoing, Task_LinkupStart, 80);
    Task_LinkupExchangeDataWithLeader(ongoing, ongoingTask);
    expect(ongoing.tasks[ongoingTask].func).toBe(Task_LinkupStart);

    const diff = createDecompCableClubRuntime({ exchangeStatus: EXCHANGE_DIFF_SELECTIONS });
    const diffTask = CreateTask(diff, Task_LinkupExchangeDataWithLeader, 80);
    Task_LinkupExchangeDataWithLeader(diff, diffTask);
    expect(diff.operations).toContain('SetCloseLinkCallback');
    expect(diff.tasks[diffTask].func).toBe(Task_StopLinkup);

    const playerNotReady = createDecompCableClubRuntime({ exchangeStatus: EXCHANGE_PLAYER_NOT_READY });
    const playerNotReadyTask = CreateTask(playerNotReady, Task_LinkupExchangeDataWithLeader, 80);
    Task_LinkupExchangeDataWithLeader(playerNotReady, playerNotReadyTask);
    expect(playerNotReady.operations).toContain('CloseLink');
    expect(playerNotReady.tasks[playerNotReadyTask].func).toBe(Task_StopLinkup);

    const success = createDecompCableClubRuntime({ exchangeStatus: EXCHANGE_COMPLETE, linkPlayerCount: 2, multiplayerId: 1 });
    const successTask = CreateTask(success, Task_LinkupExchangeDataWithLeader, 80);
    Task_LinkupExchangeDataWithLeader(success, successTask);
    expect(success.gFieldLinkPlayerCount).toBe(2);
    expect(success.gLocalLinkPlayerId).toBe(1);
    expect(success.operations).toContain('TrainerCard_GenerateCardForLinkPlayer');
    expect(success.tasks[successTask].func).toBe(Task_LinkupAwaitTrainerCardData);
  });

  test('stop, failed, connection-error, timeout, and delayed block request preserve direct task side effects', () => {
    const runtime = createDecompCableClubRuntime();
    const stopTask = CreateTask(runtime, Task_StopLinkup, 80);
    runtime.tasks[stopTask].data[5] = 9;
    Task_StopLinkup(runtime, stopTask);
    expect(runtime.operations).toContain('RemoveWindow:9');
    expect(runtime.tasks[stopTask].destroyed).toBe(true);

    const failedTask = CreateTask(runtime, Task_LinkupFailed, 80);
    Task_LinkupFailed(runtime, failedTask);
    expect(runtime.gSpecialVar_Result).toBe(5);

    const errorTask = CreateTask(runtime, Task_LinkupConnectionError, 80);
    Task_LinkupConnectionError(runtime, errorTask);
    expect(runtime.gSpecialVar_Result).toBe(LINKUP_CONNECTION_ERROR);

    const timeoutTask = CreateTask(runtime, Task_LinkupConfirm, 80);
    runtime.tasks[timeoutTask].data[4] = 600;
    expect(TryLinkTimeout(runtime, timeoutTask)).toBe(true);
    expect(runtime.tasks[timeoutTask].func).toBe(Task_LinkupConnectionError);

    const delayed = CreateTask(runtime, Task_DelayedBlockRequest, 80);
    for (let i = 0; i < 10; i++) Task_DelayedBlockRequest(runtime, delayed);
    expect(runtime.operations).toContain('SendBlockRequest:2');
    expect(runtime.tasks[delayed].destroyed).toBe(true);
  });

  test('public linkup entrypoints set link types, battle flags, and task min/max values', () => {
    const single = createDecompCableClubRuntime({ gSpecialVar_0x8004: USING_SINGLE_BATTLE });
    TryBattleLinkup(single);
    expect(single.gLinkType).toBe(LINKTYPE_SINGLE_BATTLE);
    expect(single.tasks[0].data.slice(1, 3)).toEqual([2, 2]);

    const multi = createDecompCableClubRuntime({ gSpecialVar_0x8004: USING_MULTI_BATTLE });
    TryBattleLinkup(multi);
    expect(multi.gLinkType).toBe(LINKTYPE_MULTI_BATTLE);
    expect(multi.tasks[0].data.slice(1, 3)).toEqual([4, 4]);

    const trade = createDecompCableClubRuntime({ gBattleTypeFlags: 99 });
    TryTradeLinkup(trade);
    expect(trade.gLinkType).toBe(LINKTYPE_TRADE_SETUP);
    expect(trade.gBattleTypeFlags).toBe(0);

    const record = createDecompCableClubRuntime({ gSpecialVar_Result: 9, gBattleTypeFlags: 99 });
    TryRecordMixLinkup(record);
    expect(record.gSpecialVar_Result).toBe(LINKUP_ONGOING);
    expect(record.gLinkType).toBe(LINKTYPE_RECORD_MIX_BEFORE);
    expect(record.tasks[0].data.slice(1, 3)).toEqual([2, 4]);

    const contest = createDecompCableClubRuntime({ gBattleTypeFlags: 99 });
    TryContestLinkup(contest);
    expect(contest.gLinkType).toBe(LINKTYPE_CONTEST_GMODE);
    expect(contest.tasks[0].data.slice(1, 3)).toEqual([4, 4]);
  });

  test('reestablish link task sets modes, creates wait task, advances as leader, and prevents duplicate tasks', () => {
    const runtime = createDecompCableClubRuntime({ gSpecialVar_0x8004: USING_RECORD_CORNER, linkPlayerCount: 2, savedPlayerCount: 2 });
    const taskId = CreateTask_ReestablishCableClubLink(runtime);
    expect(taskId).toBe(0);
    expect(runtime.gLinkType).toBe(LINKTYPE_RECORD_MIX_AFTER);
    expect(CreateTask_ReestablishCableClubLink(runtime)).toBe(TASK_NONE);

    Task_ReestablishLink(runtime, taskId);
    expect(runtime.operations).toContain('OpenLink');
    expect(runtime.tasks[1].func).toBe(Task_WaitForLinkPlayerConnection);
    for (let i = 0; i < 10; i++) Task_ReestablishLink(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe(Task_ReestablishLinkAwaitConnection);

    Task_ReestablishLinkAwaitConnection(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe(Task_ReestablishLinkLeader);
    Task_ReestablishLinkLeader(runtime, taskId);
    expect(runtime.operations).toContain('CheckShouldAdvanceLinkState');
    expect(runtime.tasks[taskId].func).toBe(Task_ReestablishLinkAwaitConfirmation);
    runtime.receivedRemoteLinkPlayers = true;
    runtime.exchangeStatus = EXCHANGE_COMPLETE;
    Task_ReestablishLinkAwaitConfirmation(runtime, taskId);
    expect(runtime.operations).toContain('CheckLinkPlayersMatchSaved');
    expect(runtime.operations).toContain('StartSendingKeysToLink');
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    const trade = createDecompCableClubRuntime({ gSpecialVar_0x8004: USING_TRADE_CENTER });
    CreateTask_ReestablishCableClubLink(trade);
    expect(trade.gLinkType).toBe(LINKTYPE_TRADE);
  });

  test('wired battle state machine follows fade, close, remote wait, BGM, flags, callback, and destroy', () => {
    const runtime = createDecompCableClubRuntime({
      gSpecialVar_0x8004: USING_MULTI_BATTLE,
      linkPlayers: [
        { version: VERSION_FIRE_RED, trainerId: 1, name: 'A' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: 'B' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: 'C' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: 'D' }
      ]
    });
    const taskId = CreateTask(runtime, Task_StartWiredCableClubBattle, 80);
    stepUntilDestroyed(runtime, taskId);
    expect(runtime.gLinkType).toBe(LINKTYPE_BATTLE);
    expect(runtime.operations).toContain(`PlayMapChosenOrBattleBGM:${MUS_RS_VS_GYM_LEADER}`);
    expect(runtime.operations).toContain('ReducePlayerPartyToThree');
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE | BATTLE_TYPE_MULTI);
    expect(runtime.gTrainerBattleOpponent_A).toBe(TRAINER_LINK_OPPONENT);
    expect(runtime.gMain.savedCallback).toBe('CB2_ReturnFromCableClubBattle');
  });

  test('wireless battle receives link players before standby and battle startup', () => {
    const runtime = createDecompCableClubRuntime({
      gSpecialVar_0x8004: USING_DOUBLE_BATTLE,
      linkPlayerCount: 2,
      linkPlayerCountAsBitFlags: 0b11,
      blockReceivedStatus: 0b11,
      blockRecvBuffer: [
        { version: VERSION_FIRE_RED, trainerId: 0, name: 'EVEN' },
        { version: VERSION_LEAF_GREEN, trainerId: 1, name: 'ODD' }
      ]
    });
    const taskId = CreateTask(runtime, Task_StartWirelessCableClubBattle, 80);
    stepUntilDestroyed(runtime, taskId);
    expect(runtime.operations).toContain('SendBlock:0');
    expect(runtime.operations).toContain('ConvertLinkPlayerName:0');
    expect(runtime.operations).toContain(`PlayMapChosenOrBattleBGM:${MUS_RS_VS_TRAINER}`);
    expect(runtime.linkPlayers[0].linkType).toBe(LINKTYPE_BATTLE);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE);
  });

  test('return battle callbacks update records, mystery gift stats, union-room branch, and setup-save callback', () => {
    const runtime = createDecompCableClubRuntime({
      gBattleTypeFlags: BATTLE_TYPE_LINK_IN_BATTLE | BATTLE_TYPE_LINK,
      gSpecialVar_0x8004: USING_SINGLE_BATTLE,
      gWirelessCommType: 1,
      gBattleOutcome: B_OUTCOME_WON,
      multiplayerId: 0,
      linkPlayers: [
        { version: VERSION_FIRE_RED, trainerId: 10, name: 'A' },
        { version: VERSION_LEAF_GREEN, trainerId: 22, name: 'B' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' }
      ]
    });
    CB2_ReturnFromCableClubBattle(runtime);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_LINK);
    expect(runtime.operations).toContain('UpdatePlayerLinkBattleRecords:1');
    expect(runtime.operations).toContain(`MysteryGift_TryIncrementStat:${CARD_STAT_BATTLES_WON}:22`);
    expect(runtime.gMain.savedCallback).toBe('CB2_ReturnToFieldFromMultiplayer');
    expect(runtime.operations).toContain('SetMainCallback2:CB2_SetUpSaveAfterLinkBattle');

    const union = createDecompCableClubRuntime({ inUnionRoom: true, linkTaskFinished: false });
    CB2_ReturnFromCableClubBattle(union);
    expect(union.gMain.savedCallback).toBe('CB2_ReturnFromUnionRoomBattle');
    CB2_ReturnFromUnionRoomBattle(union);
    expect(union.operations).toContain('SetCloseLinkCallback');
    union.linkTaskFinished = true;
    CB2_ReturnFromUnionRoomBattle(union);
    expect(union.operations).toContain('SetMainCallback2:CB2_ReturnToField');

    const lost = createDecompCableClubRuntime({
      gSpecialVar_0x8004: USING_SINGLE_BATTLE,
      gWirelessCommType: 1,
      gBattleOutcome: B_OUTCOME_LOST,
      linkPlayers: [
        { version: VERSION_FIRE_RED, trainerId: 10, name: 'A' },
        { version: VERSION_FIRE_RED, trainerId: 99, name: 'B' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' },
        { version: VERSION_FIRE_RED, trainerId: 0, name: '' }
      ]
    });
    CB2_ReturnFromCableClubBattle(lost);
    expect(lost.operations).toContain(`MysteryGift_TryIncrementStat:${CARD_STAT_BATTLES_LOST}:99`);
  });

  test('cleanup, exit, seat entry, and trade entrypoints mirror field/link side effects', () => {
    const cleanup = createDecompCableClubRuntime({ gSpecialVar_0x8004: USING_DOUBLE_BATTLE });
    CleanupLinkRoomState(cleanup);
    expect(cleanup.operations).toContain('LoadPlayerParty');
    expect(cleanup.operations).toContain('SavePlayerBag');
    expect(cleanup.dynamicWarp).toBe(WARP_ID_DYNAMIC);
    ExitLinkRoom(cleanup);
    expect(cleanup.operations).toContain('QueueExitLinkRoomKey');

    const seat = createDecompCableClubRuntime({ gSpecialVar_0x8005: 3, fieldMessageHidden: true });
    const taskId = CreateTask(seat, Task_EnterCableClubSeat, 80);
    seat.tasks[taskId].followupFunc = Task_StartWiredTrade;
    Task_EnterCableClubSeat(seat, taskId);
    seat.fieldMessageHidden = true;
    Task_EnterCableClubSeat(seat, taskId);
    expect(seat.gLocalLinkPlayerId).toBe(3);
    seat.cableClubPartnersReady = CABLE_SEAT_SUCCESS;
    Task_EnterCableClubSeat(seat, taskId);
    expect(seat.tasks[taskId].func).toBe(Task_StartWiredTrade);

    const failedSeat = createDecompCableClubRuntime({ fieldMessageHidden: true });
    const failedTask = CreateTask(failedSeat, Task_EnterCableClubSeat, 80);
    failedSeat.tasks[failedTask].data[0] = 2;
    failedSeat.cableClubPartnersReady = CABLE_SEAT_FAILED;
    Task_EnterCableClubSeat(failedSeat, failedTask);
    Task_EnterCableClubSeat(failedSeat, failedTask);
    expect(failedSeat.operations).toContain('SetLinkWaitingForScript');
    expect(failedSeat.tasks[failedTask].destroyed).toBe(true);

    const wiredSeat = createDecompCableClubRuntime();
    EnterTradeSeat(wiredSeat);
    expect(wiredSeat.tasks[0].followupFunc).toBe(Task_StartWiredTrade);
    const wirelessSeat = createDecompCableClubRuntime({ gWirelessCommType: 1 });
    EnterTradeSeat(wirelessSeat);
    expect(wirelessSeat.tasks[0].followupFunc).toBe(Task_StartWirelessTrade);

    const colosseum = createDecompCableClubRuntime({ gWirelessCommType: 1 });
    EnterColosseumPlayerSpot(colosseum);
    expect(colosseum.gLinkType).toBe(LINKTYPE_BATTLE);
    expect(colosseum.tasks[0].followupFunc).toBe(Task_StartWirelessCableClubBattle);
  });

  test('wired and wireless trade tasks drive fade, callbacks, trade positions, and menu startup', () => {
    const wired = createDecompCableClubRuntime({ gSelectedTradeMonPositions: [5, 6] });
    const wiredTask = CreateTask(wired, Task_StartWiredTrade, 80);
    stepUntilDestroyed(wired, wiredTask);
    expect(wired.gSelectedTradeMonPositions).toEqual([0, 0]);
    expect(wired.operations).toContain('SetCloseLinkCallback');
    expect(wired.operations).toContain('SetMainCallback2:CB2_StartCreateTradeMenu');

    const wireless = createDecompCableClubRuntime({ gSelectedTradeMonPositions: [7, 8], linkTaskFinished: true });
    const wirelessTask = CreateTask(wireless, Task_StartWirelessTrade, 80);
    stepUntilDestroyed(wireless, wirelessTask);
    expect(wireless.operations).toContain('ClearLinkRfuCallback');
    expect(wireless.operations).toContain('SetLinkStandbyCallback');
    expect(wireless.operations).toContain('CreateTask_CreateTradeMenu');

    const start = createDecompCableClubRuntime();
    StartWiredCableClubTrade(start);
    expect(start.tasks[0].func).toBe(Task_StartWiredTrade);
    expect(start.operations).toContain('ScriptContext_Stop');
  });

  test('trainer-card scripts and wait/exit helpers preserve tail-of-file behavior', () => {
    const runtime = createDecompCableClubRuntime({
      gSpecialVar_0x8006: 2,
      trainerCardStars: [0, 4],
      linkPlayers: [
        { version: VERSION_FIRE_RED, trainerId: 0, name: 'A' },
        { version: VERSION_FIRE_RED, trainerId: 1, name: 'CARDY' },
        { version: VERSION_FIRE_RED, trainerId: 2, name: 'C' },
        { version: VERSION_FIRE_RED, trainerId: 3, name: 'D' }
      ]
    });
    Script_ShowLinkTrainerCard(runtime);
    expect(runtime.operations).toContain('ShowTrainerCardInLink:2:CB2_ReturnToFieldContinueScriptPlayMapMusic');
    expect(GetSeeingLinkPlayerCardMsg(runtime, 0)).toBe(false);
    expect(runtime.gStringVar1).toBe('A');
    expect(GetSeeingLinkPlayerCardMsg(runtime, 1)).toBe(true);
    expect(runtime.gSpecialVar_0x8006).toBe(1);
    expect(runtime.gStringVar1).toBe('CARDY');
    expect(runtime.gStringVar2).toBe('GoldCard');

    const wait = createDecompCableClubRuntime();
    const waitTask = CreateTask(wait, Task_WaitForLinkPlayerConnection, 80);
    wait.tasks[waitTask].data[0] = 300;
    Task_WaitForLinkPlayerConnection(wait, waitTask);
    expect(wait.operations).toContain('CloseLink');
    expect(wait.operations).toContain('SetMainCallback2:CB2_LinkError');
    expect(wait.tasks[waitTask].destroyed).toBe(true);

    const exit = createDecompCableClubRuntime();
    const exitTask = CreateTask(exit, Task_WaitExitToScript, 80);
    Task_WaitExitToScript(exit, exitTask);
    expect(exit.operations).toContain('ScriptContext_Enable');
    expect(exit.tasks[exitTask].destroyed).toBe(true);
  });
});
