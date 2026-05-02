import { describe, expect, test } from 'vitest';
import {
  ACTIVITY_ACCEPT,
  ACTIVITY_DECLINE,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_TRAINER,
  CB2_UnionRoomBattle,
  IN_UNION_ROOM,
  SetUpPartiesAndStartBattle,
  TRAINER_UNION_ROOM,
  UnionRoomBattle_CreateTextPrinter,
  UnionRoomBattle_PrintTextOnWindow0,
  VBlankCB_UnionRoomBattle,
  cb2UnionRoomBattle,
  createUnionRoomBattleRuntime,
  gText_BattleWasRefused,
  gText_CommStandbyAwaitingOtherPlayer,
  gText_RefusedBattle,
  setUpPartiesAndStartBattle,
  unionRoomBattlePrintTextOnWindow0
} from '../src/game/decompUnionRoomBattle';

describe('decomp union_room_battle', () => {
  test('SetUpPartiesAndStartBattle copies selected mons, clears party, and starts link trainer battle', () => {
    const runtime = createUnionRoomBattleRuntime();
    runtime.playerParty = ['bulba', 'char', 'squirtle', 'pika', 'eevee', 'mew'];
    runtime.selectedOrderFromParty = [3, 5];

    setUpPartiesAndStartBattle(runtime);

    expect(runtime.battleTypeStarted).toBe(BATTLE_TYPE_LINK | BATTLE_TYPE_TRAINER);
    expect(runtime.enemyParty.slice(0, 2)).toEqual(['squirtle', 'eevee']);
    expect(runtime.playerParty).toEqual(['squirtle', 'eevee', null, null, null, null]);
    expect(runtime.gameStats.GAME_STAT_NUM_UNION_ROOM_BATTLES).toBe(1);
    expect(runtime.playerPartyCount).toBe(2);
    expect(runtime.trainerBattleOpponentA).toBe(TRAINER_UNION_ROOM);
    expect(runtime.mainCallback2).toBe('CB2_InitBattle');
  });

  test('text printer helper uses two states and resets once printing ends', () => {
    const runtime = createUnionRoomBattleRuntime();
    const state = { value: 0 };

    expect(unionRoomBattlePrintTextOnWindow0(runtime, state, gText_CommStandbyAwaitingOtherPlayer, 0)).toBe(false);
    expect(state.value).toBe(1);
    expect(runtime.printedTexts.at(-1)).toContain(gText_CommStandbyAwaitingOtherPlayer);
    expect(unionRoomBattlePrintTextOnWindow0(runtime, state, gText_CommStandbyAwaitingOtherPlayer, 0)).toBe(false);
    runtime.textPrinterActive = false;
    expect(unionRoomBattlePrintTextOnWindow0(runtime, state, gText_CommStandbyAwaitingOtherPlayer, 0)).toBe(true);
    expect(state.value).toBe(0);
  });

  test('CB2 sends accept when selected orders are not negative mirrors', () => {
    const runtime = createUnionRoomBattleRuntime();

    cb2UnionRoomBattle(runtime);
    expect(runtime.mainState).toBe(1);
    cb2UnionRoomBattle(runtime);
    runtime.textPrinterActive = false;
    cb2UnionRoomBattle(runtime);
    expect(runtime.mainState).toBe(2);
    cb2UnionRoomBattle(runtime);
    cb2UnionRoomBattle(runtime);

    expect(runtime.mainState).toBe(4);
    expect(runtime.sendBlocks).toHaveLength(1);
    expect(runtime.sendBlocks[0].data[0]).toBe(ACTIVITY_ACCEPT | IN_UNION_ROOM);
  });

  test('CB2 sends decline when selected orders are negative mirrors', () => {
    const runtime = createUnionRoomBattleRuntime();
    runtime.mainState = 3;
    runtime.selectedOrderFromParty = [2, -2];

    cb2UnionRoomBattle(runtime);

    expect(runtime.sendBlocks[0].data[0]).toBe(ACTIVITY_DECLINE | IN_UNION_ROOM);
    expect(runtime.mainState).toBe(4);
  });

  test('accepted blocks fade to link standby and then start battle', () => {
    const runtime = createUnionRoomBattleRuntime();
    runtime.mainState = 4;
    runtime.blockReceivedStatus = 3;
    runtime.blockRecvBuffer[0][0] = ACTIVITY_ACCEPT | IN_UNION_ROOM;
    runtime.blockRecvBuffer[1][0] = ACTIVITY_ACCEPT | IN_UNION_ROOM;

    cb2UnionRoomBattle(runtime);
    expect(runtime.mainState).toBe(50);
    expect(runtime.blockReceivedStatus).toBe(0);
    cb2UnionRoomBattle(runtime);
    expect(runtime.mainState).toBe(51);
    runtime.linkTaskFinished = true;
    cb2UnionRoomBattle(runtime);
    expect(runtime.linkStandbyCallbackSet).toBe(true);
    expect(runtime.mainState).toBe(52);
    cb2UnionRoomBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_InitBattle');
  });

  test('decline branches return to field with the matching message', () => {
    const ownDecline = createUnionRoomBattleRuntime();
    ownDecline.mainState = 4;
    ownDecline.work = { textState: 0 };
    ownDecline.blockReceivedStatus = 3;
    ownDecline.multiplayerId = 0;
    ownDecline.blockRecvBuffer[0][0] = ACTIVITY_DECLINE | IN_UNION_ROOM;
    ownDecline.blockRecvBuffer[1][0] = ACTIVITY_ACCEPT | IN_UNION_ROOM;

    cb2UnionRoomBattle(ownDecline);
    expect(ownDecline.mainState).toBe(6);
    ownDecline.receivedRemoteLinkPlayers = false;
    cb2UnionRoomBattle(ownDecline);
    cb2UnionRoomBattle(ownDecline);
    expect(ownDecline.printedTexts.at(-1)).toContain(gText_RefusedBattle);
    ownDecline.textPrinterActive = false;
    cb2UnionRoomBattle(ownDecline);
    expect(ownDecline.mainCallback2).toBe('CB2_ReturnToField');

    const partnerDecline = createUnionRoomBattleRuntime();
    partnerDecline.mainState = 4;
    partnerDecline.work = { textState: 0 };
    partnerDecline.blockReceivedStatus = 3;
    partnerDecline.multiplayerId = 0;
    partnerDecline.blockRecvBuffer[0][0] = ACTIVITY_ACCEPT | IN_UNION_ROOM;
    partnerDecline.blockRecvBuffer[1][0] = ACTIVITY_DECLINE | IN_UNION_ROOM;
    cb2UnionRoomBattle(partnerDecline);
    expect(partnerDecline.mainState).toBe(8);
    partnerDecline.receivedRemoteLinkPlayers = false;
    cb2UnionRoomBattle(partnerDecline);
    cb2UnionRoomBattle(partnerDecline);
    expect(partnerDecline.printedTexts.at(-1)).toContain(gText_BattleWasRefused);
  });

  test('exact C-name entry points mirror the port helpers and vblank callback', () => {
    const runtime = createUnionRoomBattleRuntime();

    SetUpPartiesAndStartBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_InitBattle');

    const cbRuntime = createUnionRoomBattleRuntime();
    CB2_UnionRoomBattle(cbRuntime);
    expect(cbRuntime.mainState).toBe(1);

    const printState = { value: 0 };
    expect(UnionRoomBattle_PrintTextOnWindow0(runtime, printState, 'text', 0)).toBe(false);
    expect(printState.value).toBe(1);
    UnionRoomBattle_CreateTextPrinter(runtime, 0, 'hello', 1, 2, 3);
    expect(runtime.printedTexts.at(-1)).toBe('0:1:2:3:hello');

    VBlankCB_UnionRoomBattle(runtime);

    expect(runtime.perFrameCalls).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);
  });
});
