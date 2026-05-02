import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_IS_MASTER,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_LINK_IN_BATTLE,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  BATTLE_TYPE_POKEDUDE,
  BATTLE_TYPE_SAFARI,
  BUFFER_A,
  BUFFER_B,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_OPPONENT_RIGHT,
  B_POSITION_PLAYER_LEFT,
  B_POSITION_PLAYER_RIGHT,
  CreateTasksForSendRecvLinkBuffers,
  HandleLinkBattleSetup,
  InitBattleControllers,
  InitLinkBtlControllers,
  InitSinglePlayerBtlControllers,
  BtlController_EmitBattleAnimation,
  BtlController_EmitChooseAction,
  BtlController_EmitChooseItem,
  BtlController_EmitChooseMove,
  BtlController_EmitChoosePokemon,
  BtlController_EmitDataTransfer,
  BtlController_EmitDrawPartyStatusSummary,
  BtlController_EmitGetMonData,
  BtlController_EmitHealthBarUpdate,
  BtlController_EmitMoveAnimation,
  BtlController_EmitPlayBGM,
  BtlController_EmitPrintString,
  BtlController_EmitStatusIconUpdate,
  ControllerCmd,
  PrepareBufferDataTransfer,
  PrepareBufferDataTransferLink,
  SetBattlePartyIds,
  SetUpBattleVars,
  Task_HandleCopyReceivedLinkBuffersData,
  Task_HandleSendLinkBuffersData,
  TryReceiveLinkBattleData,
  LINK_BUFF_DATA,
  LINK_BUFF_SIZE_HI,
  LINK_BUFF_SIZE_LO,
  PARTY_SUMM_SKIP_DRAW_DELAY,
  SPECIES_EGG,
  SPECIES_NONE,
  createBattleControllersRuntime,
  createTasksForSendRecvLinkBuffers,
  handleLinkBattleSetup,
  initBattleControllers,
  initLinkBtlControllers,
  initSinglePlayerBtlControllers,
  prepareBufferDataTransfer,
  prepareBufferDataTransferLink,
  setBattlePartyIds,
  setUpBattleVars,
  taskHandleCopyReceivedLinkBuffersData,
  taskHandleSendLinkBuffersData,
  tryReceiveLinkBattleData
} from '../src/game/decompBattleControllers';

describe('decomp battle_controllers', () => {
  test('exports exact C function names for setup and link-buffer helpers', () => {
    expect(HandleLinkBattleSetup).toBe(handleLinkBattleSetup);
    expect(SetUpBattleVars).toBe(setUpBattleVars);
    expect(InitBattleControllers).toBe(initBattleControllers);
    expect(InitSinglePlayerBtlControllers).toBe(initSinglePlayerBtlControllers);
    expect(InitLinkBtlControllers).toBe(initLinkBtlControllers);
    expect(SetBattlePartyIds).toBe(setBattlePartyIds);
    expect(PrepareBufferDataTransfer).toBe(prepareBufferDataTransfer);
    expect(CreateTasksForSendRecvLinkBuffers).toBe(createTasksForSendRecvLinkBuffers);
    expect(PrepareBufferDataTransferLink).toBe(prepareBufferDataTransferLink);
    expect(Task_HandleSendLinkBuffersData).toBe(taskHandleSendLinkBuffersData);
    expect(TryReceiveLinkBattleData).toBe(tryReceiveLinkBattleData);
    expect(Task_HandleCopyReceivedLinkBuffersData).toBe(
      taskHandleCopyReceivedLinkBuffersData
    );
  });

  test('SetUpBattleVars resets controller arrays and creates link send/receive tasks only for link battles', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    runtime.gWirelessCommType = 1;
    runtime.gReceivedRemoteLinkPlayers = 0;
    runtime.gBattlerControllerFuncs.fill('dirty');
    runtime.gBattlerPositions.fill(3);
    runtime.gActionSelectionCursor.fill(9);
    runtime.gMoveSelectionCursor.fill(8);

    setUpBattleVars(runtime);

    expect(runtime.gBattleMainFunc).toBe('BeginBattleIntroDummy');
    expect(runtime.gBattlerControllerFuncs).toEqual(Array(4).fill('BattleControllerDummy'));
    expect(runtime.gBattlerPositions).toEqual(Array(4).fill(0xff));
    expect(runtime.gActionSelectionCursor).toEqual([0, 0, 0, 0]);
    expect(runtime.gMoveSelectionCursor).toEqual([0, 0, 0, 0]);
    expect(runtime.operations).toContain('SetWirelessCommType1');
    expect(runtime.operations).toContain('OpenLink');
    expect(runtime.tasks.map((task) => task.func)).toEqual([
      'Task_WaitForLinkPlayerConnection',
      'Task_HandleSendLinkBuffersData',
      'Task_HandleCopyReceivedLinkBuffersData'
    ]);
    expect(runtime.gBattleControllerExecFlags).toBe(0);
  });

  test('InitSinglePlayerBtlControllers preserves normal, tutorial, safari, pokedude, and double layouts', () => {
    const normal = createBattleControllersRuntime();
    normal.gBattleTypeFlags = BATTLE_TYPE_IS_MASTER;
    initBattleControllers(normal);
    expect(normal.gBattlerControllerFuncs.slice(0, 2)).toEqual(['SetControllerToPlayer', 'SetControllerToOpponent']);
    expect(normal.gBattlerPositions.slice(0, 2)).toEqual([B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT]);
    expect(normal.gBattlersCount).toBe(2);

    const safari = createBattleControllersRuntime();
    safari.gBattleTypeFlags = BATTLE_TYPE_SAFARI;
    initBattleControllers(safari);
    expect(safari.gBattlerControllerFuncs[0]).toBe('SetControllerToSafari');

    const oldMan = createBattleControllersRuntime();
    oldMan.gBattleTypeFlags = BATTLE_TYPE_OLD_MAN_TUTORIAL | BATTLE_TYPE_FIRST_BATTLE;
    initBattleControllers(oldMan);
    expect(oldMan.gBattlerControllerFuncs[0]).toBe('SetControllerToOakOrOldMan');

    const pokedudeDouble = createBattleControllersRuntime();
    pokedudeDouble.gBattleTypeFlags = BATTLE_TYPE_DOUBLE | BATTLE_TYPE_POKEDUDE;
    initBattleControllers(pokedudeDouble);
    expect(pokedudeDouble.gBattlerControllerFuncs).toEqual(Array(4).fill('SetControllerToPokedude'));
    expect(pokedudeDouble.gBattlerPositions).toEqual([0, 1, 2, 3]);
    expect(pokedudeDouble.gBattlersCount).toBe(4);
  });

  test('InitLinkBtlControllers preserves master/slave, double, and multi partner/opponent assignment', () => {
    const master = createBattleControllersRuntime();
    master.gBattleTypeFlags = BATTLE_TYPE_LINK | BATTLE_TYPE_IS_MASTER;
    initBattleControllers(master);
    expect(master.gBattleMainFunc).toBe('BeginBattleIntro');
    expect(master.gBattlerControllerFuncs.slice(0, 2)).toEqual(['SetControllerToPlayer', 'SetControllerToLinkOpponent']);
    expect(master.gBattlerPositions.slice(0, 2)).toEqual([B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT]);

    const slaveDouble = createBattleControllersRuntime();
    slaveDouble.gBattleTypeFlags = BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE;
    initBattleControllers(slaveDouble);
    expect(slaveDouble.gBattlerControllerFuncs).toEqual(['SetControllerToLinkOpponent', 'SetControllerToPlayer', 'SetControllerToLinkOpponent', 'SetControllerToPlayer']);
    expect(slaveDouble.gBattlerPositions).toEqual([B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_RIGHT, B_POSITION_PLAYER_RIGHT]);

    const multi = createBattleControllersRuntime();
    multi.gBattleTypeFlags = BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE | BATTLE_TYPE_MULTI | BATTLE_TYPE_IS_MASTER;
    multi.gLinkPlayers = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
    multi.multiplayerId = 1;
    initBattleControllers(multi);
    expect(multi.gBattlerControllerFuncs).toEqual(['SetControllerToLinkOpponent', 'SetControllerToPlayer', 'SetControllerToLinkOpponent', 'SetControllerToLinkPartner']);
    expect(multi.gBattlerPositions).toEqual([B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT, B_POSITION_PLAYER_LEFT]);
    expect(multi.gBattlerPartyIndexes).toEqual([B_POSITION_PLAYER_LEFT, 3, B_POSITION_OPPONENT_RIGHT, B_POSITION_PLAYER_LEFT]);
  });

  test('SetBattlePartyIds picks first usable party members and preserves the player-right SPECIES typo', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gBattlersCount = 4;
    runtime.gBattlerPositions = [0, 1, 2, 3];
    runtime.gPlayerParty = [
      { hp: 0, species: 1 },
      { hp: 10, species: SPECIES_EGG, speciesOrEgg: SPECIES_EGG },
      { hp: 10, species: 25, speciesOrEgg: 25 },
      { hp: 10, species: SPECIES_NONE, speciesOrEgg: 30 },
      { hp: 10, species: 40, speciesOrEgg: 40 },
      { hp: 10, species: 50, speciesOrEgg: 50 }
    ];
    runtime.gEnemyParty = [
      { hp: 4, species: 1, speciesOrEgg: 1 },
      { hp: 5, species: 2, speciesOrEgg: 2 },
      { hp: 6, species: 3, speciesOrEgg: 3 },
      { hp: 7, species: 4, speciesOrEgg: 4 },
      { hp: 8, species: 5, speciesOrEgg: 5 },
      { hp: 9, species: 6, speciesOrEgg: 6 }
    ];
    setBattlePartyIds(runtime);
    expect(runtime.gBattlerPartyIndexes).toEqual([2, 0, 4, 1]);
  });

  test('local PrepareBufferDataTransfer writes buffer A/B for the active battler', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gActiveBattler = 2;
    prepareBufferDataTransfer(runtime, BUFFER_A, [1, 2, 3], 3);
    prepareBufferDataTransfer(runtime, BUFFER_B, [4, 5], 2);
    expect(runtime.gBattleBufferA[2].slice(0, 4)).toEqual([1, 2, 3, 0]);
    expect(runtime.gBattleBufferB[2].slice(0, 3)).toEqual([4, 5, 0]);
  });

  test('link PrepareBufferDataTransferLink packs headers, aligned size, wrap point, and task cursors exactly', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    createTasksForSendRecvLinkBuffers(runtime);
    runtime.gActiveBattler = 3;
    runtime.gBattlerAttacker = 2;
    runtime.gBattlerTarget = 1;
    runtime.gAbsentBattlerFlags = 0xaa;
    runtime.gEffectBattler = 0xbb;
    prepareBufferDataTransferLink(runtime, BUFFER_A, 5, [9, 8, 7, 6, 5]);

    expect(runtime.gLinkBattleSendBuffer.slice(0, 13)).toEqual([BUFFER_A, 3, 2, 1, 8, 0, 0xaa, 0xbb, 9, 8, 7, 6, 5]);
    expect(runtime.tasks[runtime.sLinkSendTaskId].data[14]).toBe(16);

    runtime.tasks[runtime.sLinkSendTaskId].data[14] = 0xff8;
    prepareBufferDataTransferLink(runtime, BUFFER_B, 4, [1, 2, 3, 4]);
    expect(runtime.tasks[runtime.sLinkSendTaskId].data[12]).toBe(0xff8);
    expect(runtime.tasks[runtime.sLinkSendTaskId].data[14]).toBe(16);
    expect(runtime.gLinkBattleSendBuffer[0]).toBe(BUFFER_B);
  });

  test('send and receive link tasks preserve countdown, send, finish, copy, and exec-flag behavior', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK | BATTLE_TYPE_LINK_IN_BATTLE;
    createTasksForSendRecvLinkBuffers(runtime);
    const sendId = runtime.sLinkSendTaskId;
    taskHandleSendLinkBuffersData(runtime, sendId);
    expect(runtime.tasks[sendId].data[10]).toBe(100);
    expect(runtime.tasks[sendId].data[11]).toBe(1);
    runtime.tasks[sendId].data[10] = 1;
    runtime.gReceivedRemoteLinkPlayers = 1;
    taskHandleSendLinkBuffersData(runtime, sendId);
    expect(runtime.tasks[sendId].data[11]).toBe(3);

    prepareBufferDataTransferLink(runtime, BUFFER_A, 2, [44, 55]);
    taskHandleSendLinkBuffersData(runtime, sendId);
    expect(runtime.sentBlocks[0]).toMatchObject({ offset: 0, size: 12 });
    expect(runtime.tasks[sendId].data[11]).toBe(4);
    taskHandleSendLinkBuffersData(runtime, sendId);
    expect(runtime.tasks[sendId].data[13]).toBe(5);
    expect(runtime.tasks[sendId].data[15]).toBe(12);

    runtime.gLinkPlayers[0].linkType = 0x2211;
    runtime.linkPlayerCount = 1;
    runtime.blockReceivedStatus = 1;
    runtime.gBlockRecvBuffer[0] = [BUFFER_A, 2, 4, 0, 7, 0, 0, 1, 99, 88, 77, 66];
    tryReceiveLinkBattleData(runtime);
    expect(runtime.operations).toContain('DestroyTask_RfuIdle');
    expect(runtime.tasks[runtime.sLinkReceiveTaskId].data[14]).toBe(12);
    taskHandleCopyReceivedLinkBuffersData(runtime, runtime.sLinkReceiveTaskId);
    expect(runtime.gBattleBufferA[2].slice(0, 4)).toEqual([99, 88, 77, 66]);
    expect(runtime.gBattleControllerExecFlags & 4).toBe(4);

    runtime.tasks[runtime.sLinkReceiveTaskId].data[15] = 0;
    runtime.gBattleControllerExecFlags = 4;
    taskHandleCopyReceivedLinkBuffersData(runtime, runtime.sLinkReceiveTaskId);
    expect(runtime.tasks[runtime.sLinkReceiveTaskId].data[15]).toBe(0);
  });

  test('controller emitters pack representative command buffers exactly', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gActiveBattler = 1;

    BtlController_EmitGetMonData(runtime, BUFFER_A, 4, 2);
    expect(runtime.gBattleBufferA[1].slice(0, 4)).toEqual([ControllerCmd.GETMONDATA, 4, 2, 0]);

    BtlController_EmitHealthBarUpdate(runtime, BUFFER_A, 0x8123);
    expect(runtime.gBattleBufferA[1].slice(0, 4)).toEqual([ControllerCmd.HEALTHBARUPDATE, 0, 0x23, 0x81]);

    BtlController_EmitStatusIconUpdate(runtime, BUFFER_A, 0x11223344, 0xaabbccdd);
    expect(runtime.gBattleBufferA[1].slice(0, 9)).toEqual([ControllerCmd.STATUSICONUPDATE, 0x44, 0x33, 0x22, 0x11, 0xdd, 0xcc, 0xbb, 0xaa]);

    BtlController_EmitChoosePokemon(runtime, BUFFER_A, 3, 4, 5, [6, 7, 8]);
    expect(runtime.gBattleBufferA[1].slice(0, 8)).toEqual([ControllerCmd.CHOOSEPOKEMON, 3, 4, 5, 6, 7, 8, 0]);

    BtlController_EmitDataTransfer(runtime, BUFFER_A, 3, [1, 2, 3]);
    expect(runtime.gBattleBufferA[1].slice(0, 7)).toEqual([ControllerCmd.DATATRANSFER, ControllerCmd.DATATRANSFER, 3, 0, 1, 2, 3]);

    BtlController_EmitBattleAnimation(runtime, BUFFER_A, 9, 0xbeef);
    expect(runtime.gBattleBufferA[1].slice(0, 4)).toEqual([ControllerCmd.BATTLEANIMATION, 9, 0xef, 0xbe]);

    BtlController_EmitChooseAction(runtime, BUFFER_A, 2, 0x1234);
    expect(runtime.gBattleBufferA[1].slice(0, 4)).toEqual([ControllerCmd.CHOOSEACTION, 2, 0x34, 0x12]);
    expect(runtime.trace).toContain('ChooseAction:1:2:4660');
  });

  test('complex emitters preserve odd C sizes and field placement', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gActiveBattler = 0;
    runtime.gMultiHitCounter = 3;
    runtime.gBattleWeather = 0x1234;
    BtlController_EmitMoveAnimation(runtime, BUFFER_A, 0x0201, 4, 0x0302, 0x88776655, 9, [1, 2, 3, 4, 5]);
    expect(runtime.gBattleBufferA[0].slice(0, 21)).toEqual([
      ControllerCmd.MOVEANIMATION, 1, 2, 4, 2, 3, 0x55, 0x66, 0x77, 0x88, 9, 3, 0x34, 0x12, 0, 0, 1, 2, 3, 4, 5
    ]);

    BtlController_EmitChooseMove(runtime, BUFFER_A, 1, 0, [9, 8, 7, 6]);
    expect(runtime.gBattleBufferA[0].slice(0, 8)).toEqual([ControllerCmd.CHOOSEMOVE, 1, 0, 0, 9, 8, 7, 6]);
    expect(runtime.trace).toContain('ChooseMove:0:1');

    BtlController_EmitChooseItem(runtime, BUFFER_A, [3, 2, 1, 99]);
    expect(runtime.gBattleBufferA[0].slice(0, 4)).toEqual([ControllerCmd.OPENBAG, 3, 2, 1]);

    BtlController_EmitDrawPartyStatusSummary(runtime, BUFFER_A, [1, 2, 3, 4], PARTY_SUMM_SKIP_DRAW_DELAY | 3);
    expect(runtime.gBattleBufferA[0].slice(0, 8)).toEqual([ControllerCmd.DRAWPARTYSTATUSSUMMARY, 3, 1, ControllerCmd.DRAWPARTYSTATUSSUMMARY, 1, 2, 3, 4]);

    BtlController_EmitPlayBGM(runtime, BUFFER_A, 3, [7, 8, 9, 10]);
    expect(runtime.gBattleBufferA[0].slice(0, 6)).toEqual([ControllerCmd.PLAYBGM, 3, 0, 7, 8, 9]);
  });

  test('PrintString captures battle message globals and routes through link transfer when linked', () => {
    const runtime = createBattleControllersRuntime();
    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    createTasksForSendRecvLinkBuffers(runtime);
    runtime.gActiveBattler = 1;
    runtime.gBattleOutcome = 5;
    runtime.gCurrentMove = 0x1234;
    runtime.gChosenMove = 0x5678;
    runtime.gLastUsedItem = 0x9abc;
    runtime.gLastUsedAbility = 7;
    runtime.gBattleScriptingBattler = 2;
    runtime.scriptPartyIdx = 3;
    runtime.hpScale = 4;
    runtime.gPotentialItemEffectBattler = 1;
    runtime.gBattleMoves[0x1234] = { type: 11 };
    runtime.gBattleMons = [{ ability: 1 }, { ability: 2 }, { ability: 3 }, { ability: 4 }];
    runtime.gBattleTextBuff1 = [1, 2];
    runtime.gBattleTextBuff2 = [3, 4];
    runtime.gBattleTextBuff3 = [5, 6];

    BtlController_EmitPrintString(runtime, BUFFER_A, 0x2222);
    expect(runtime.trace).toEqual(['PrintString:1:8738']);
    expect(runtime.gLinkBattleSendBuffer.slice(0, 12)).toEqual([BUFFER_A, 1, 0, 0, runtime.gLinkBattleSendBuffer[LINK_BUFF_SIZE_LO], runtime.gLinkBattleSendBuffer[LINK_BUFF_SIZE_HI], 0, 0, ControllerCmd.PRINTSTRING, 5, 0x22, 0x22]);
    expect(runtime.gLinkBattleSendBuffer[LINK_BUFF_DATA + 4]).toBe(0x34);
    expect(runtime.gLinkBattleSendBuffer[LINK_BUFF_DATA + 5]).toBe(0x12);
  });
});
