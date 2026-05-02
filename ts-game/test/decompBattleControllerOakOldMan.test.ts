import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_ACTION_CANCEL_PARTNER,
  B_ACTION_RUN,
  B_ACTION_USE_ITEM,
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_LINK_REAL,
  BATTLE_TYPE_OLD_MAN_TUTORIAL,
  CONTROLLER_GETMONDATA,
  CONTROLLER_TERMINATOR_NOP,
  CONTROLLER_TWORETURNVALUES,
  DPAD_DOWN,
  FIRST_BATTLE_MSG_FLAG_HP_RESTORE,
  FIRST_BATTLE_MSG_FLAG_STAT_CHG,
  ITEM_POTION,
  OakOldManBufferExecCompleted,
  OakOldManBufferRunCommand,
  OakOldManHandleChooseAction,
  OakOldManHandleChooseItem,
  OakOldManHandleChoosePokemon,
  OakOldManHandleCmd55,
  OakOldManHandleExpUpdate,
  OakOldManHandleGetRawMonData,
  OakOldManHandlePrintString,
  REQUEST_SPECIES_BATTLE,
  STRINGID_DEFENDERSSTATFELL,
  STRINGID_DONTLEAVEBIRCH,
  STRINGID_PLAYERGOTMONEY,
  STRINGID_TRAINER1WINTEXT,
  SetControllerToOakOrOldMan,
  createLinkPartnerMon,
  createOakOldManRuntime,
  runOakOldManControllerFunc
} from '../src/game/decompBattleControllerOakOldMan';

describe('decomp battle_controller_oak_old_man', () => {
  test('controller setup clears simulated inputs and completion mirrors link/local C paths', () => {
    const runtime = createOakOldManRuntime();
    runtime.gBattleStruct.simulatedInputState = [1, 2, 3, 4];
    SetControllerToOakOrOldMan(runtime);
    expect(runtime.gBattleStruct.simulatedInputState).toEqual([0, 0, 0, 0]);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('OakOldManBufferRunCommand');

    OakOldManBufferExecCompleted(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    const linkRuntime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK_REAL, multiplayerId: 2 });
    OakOldManBufferExecCompleted(linkRuntime);
    expect(linkRuntime.gBattleBufferA[0][0]).toBe(CONTROLLER_TERMINATOR_NOP);
    expect(linkRuntime.emittedTransfers).toEqual([{ buffer: 'link', size: 4, data: [2] }]);
  });

  test('mon data and raw data read from the player party', () => {
    const runtime = createOakOldManRuntime({
      gPlayerParty: [
        createLinkPartnerMon({ species: 0x123, raw: Array.from({ length: 64 }, (_, i) => i + 10) }),
        ...Array.from({ length: 5 }, () => createLinkPartnerMon())
      ]
    });

    runtime.gBattleBufferA[0][0] = CONTROLLER_GETMONDATA;
    runtime.gBattleBufferA[0][1] = REQUEST_SPECIES_BATTLE;
    OakOldManBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 2, data: [0x23, 0x01] });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][1] = 5;
    runtime.gBattleBufferA[0][2] = 3;
    OakOldManHandleGetRawMonData(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 3, data: [15, 16, 17] });
  });

  test('first-battle input action cursor moves and emits selected action', () => {
    const runtime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE });
    OakOldManHandleChooseAction(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('HandleChooseActionAfterDma3');
    runOakOldManControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('HandleInputChooseAction');

    runOakOldManControllerFunc(runtime, DPAD_DOWN);
    expect(runtime.gActionSelectionCursor[0]).toBe(2);
    runOakOldManControllerFunc(runtime, A_BUTTON);
    expect(runtime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [B_ACTION_RUN - 1, 0, 0] });
    expect(runtime.gBattleControllerExecFlags).toBe(0);
  });

  test('old-man tutorial simulates opening bag and choosing item', () => {
    const runtime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_OLD_MAN_TUTORIAL });
    OakOldManHandleChooseAction(runtime);
    runOakOldManControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('SimulateInputChooseAction');

    for (let i = 0; i < 64; i++) runOakOldManControllerFunc(runtime);
    expect(runtime.operations).toContain('ActionSelectionCreateCursorAt:1:0');
    for (let i = 0; i < 64; i++) runOakOldManControllerFunc(runtime);
    expect(runtime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [B_ACTION_USE_ITEM, 0, 0] });
  });

  test('first-battle print strings install the same Oak text callbacks and flags', () => {
    const runtime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE });

    runtime.gBattleBufferA[0][2] = STRINGID_DEFENDERSSTATFELL & 0xff;
    runtime.gBattleBufferA[0][3] = STRINGID_DEFENDERSSTATFELL >> 8;
    OakOldManHandlePrintString(runtime);
    expect(runtime.firstBattleState2Flags & FIRST_BATTLE_MSG_FLAG_STAT_CHG).toBe(FIRST_BATTLE_MSG_FLAG_STAT_CHG);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PrintOakText_LoweringStats');

    for (const [stringId, callback] of [
      [STRINGID_PLAYERGOTMONEY, 'PrintOakText_WinEarnsPrizeMoney'],
      [STRINGID_TRAINER1WINTEXT, 'PrintOakText_HowDisappointing'],
      [STRINGID_DONTLEAVEBIRCH, 'PrintOakText_OakNoRunningFromATrainer']
    ] as const) {
      runtime.gBattlerControllerFuncs[0] = 'OakOldManBufferRunCommand';
      runtime.gBattleBufferA[0][2] = stringId & 0xff;
      runtime.gBattleBufferA[0][3] = stringId >> 8;
      OakOldManHandlePrintString(runtime);
      expect(runtime.gBattlerControllerFuncs[0]).toBe(callback);
    }
  });

  test('choose item, choose pokemon, exp update, and end battle preserve controller side effects', () => {
    const runtime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE });
    runtime.gBattleBufferA[0].splice(1, 6, 2, 1, 0, 5, 4, 3);
    OakOldManHandleChoosePokemon(runtime);
    expect(runtime.gBattleStruct).toMatchObject({ battlerPreventingSwitchout: 0, playerPartyIdx: 1, abilityPreventingSwitchout: 0 });
    expect(runtime.gBattlePartyCurrentOrder).toEqual([5, 4, 3]);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('OpenPartyMenuToChooseMon');
    runOakOldManControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('WaitForMonSelection');
    runtime.gPartyMenuUseExitCallback = true;
    runtime.gSelectedMonPartyId = 4;
    runOakOldManControllerFunc(runtime);
    expect(runtime.emittedControllerValues.at(-1)).toMatchObject({ cmd: 34, bufferId: 1, data: [4, 5, 4, 3] });

    const itemRuntime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE, gSpecialVar_ItemId: ITEM_POTION });
    OakOldManHandleChooseItem(itemRuntime);
    runOakOldManControllerFunc(itemRuntime);
    expect(itemRuntime.gBattlerControllerFuncs[0]).toBe('CompleteWhenChoseItem');
    runOakOldManControllerFunc(itemRuntime);
    expect(itemRuntime.firstBattleState2Flags & FIRST_BATTLE_MSG_FLAG_HP_RESTORE).toBe(FIRST_BATTLE_MSG_FLAG_HP_RESTORE);
    expect(itemRuntime.gBattlerControllerFuncs[0]).toBe('PrintOakText_KeepAnEyeOnHP');

    const expRuntime = createOakOldManRuntime({ gPlayerParty: [createLinkPartnerMon({ level: 5 }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())] });
    expRuntime.gBattleBufferA[0][1] = 0;
    expRuntime.gBattleBufferA[0][2] = 0x34;
    expRuntime.gBattleBufferA[0][3] = 0x12;
    OakOldManHandleExpUpdate(expRuntime);
    expect(expRuntime.gTasks.at(-1)).toMatchObject({ func: 'Task_GiveExpToMon', data: [0, 0x1234, 0] });
    expect(expRuntime.gBattlerControllerFuncs[0]).toBe('OakOldManDummy');

    const endRuntime = createOakOldManRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK_REAL });
    endRuntime.gBattleBufferA[0][1] = 7;
    OakOldManHandleCmd55(endRuntime);
    expect(endRuntime.gBattleOutcome).toBe(7);
    expect(endRuntime.gBattlerControllerFuncs[0]).toBe('OakOldManSetBattleEndCallbacks');
  });

  test('double partner cancel restores ball item before emitting cancel action', () => {
    const runtime = createOakOldManRuntime({
      gBattleTypeFlags: BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_DOUBLE,
      gActiveBattler: 2,
      gBattleControllerExecFlags: 4,
      battlerPositions: [0, 1, 2, 3]
    });
    runtime.gBattlerControllerFuncs[2] = 'HandleInputChooseAction';
    runtime.gBattleBufferA[2][1] = B_ACTION_USE_ITEM;
    runtime.gBattleBufferA[2][2] = 4;

    runOakOldManControllerFunc(runtime, 0x0002);

    expect(runtime.bagItems[4]).toBe(1);
    expect(runtime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [B_ACTION_CANCEL_PARTNER, 0, 0] });
  });
});
