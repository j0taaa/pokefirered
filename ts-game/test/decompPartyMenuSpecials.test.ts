import { describe, expect, test } from 'vitest';
import {
  BufferMoveDeleterNicknameAndMove,
  ChooseMonForMoveRelearner,
  ChoosePartyMon,
  GetNumMovesSelectedMonHas,
  IsSelectedMonEgg,
  MOVE_NONE,
  MoveDeleterForgetMove,
  SelectMoveDeleterMove,
  ShiftMoveSlot,
  Task_ChoosePartyMon,
  chooseMonForMoveRelearner,
  choosePartyMon,
  bufferMoveDeleterNicknameAndMove,
  getNumMovesSelectedMonHas,
  isSelectedMonEgg,
  moveDeleterForgetMove,
  selectMoveDeleterMove,
  shiftMoveSlot,
  taskChoosePartyMon,
  type PartyMenuSpecialRuntime
} from '../src/game/decompPartyMenuSpecials';

const createRuntime = (): PartyMenuSpecialRuntime => ({
  vars: { gSpecialVar_0x8004: 0, gSpecialVar_0x8005: 1 },
  stringVars: { STR_VAR_1: '', STR_VAR_2: '' },
  party: [{
    nickname: 'SPARKY',
    moves: [10, 20, MOVE_NONE, 30],
    pp: [35, 20, 0, 15],
    ppBonuses: 0b11_10_01_00
  }]
});

describe('decompPartyMenuSpecials', () => {
  test('ChoosePartyMon and ChooseMonForMoveRelearner create the exact task/menu setup', () => {
    const runtime = createRuntime();
    choosePartyMon(runtime);
    expect(runtime.partyMenu).toMatchObject({
      lockedControls: true,
      taskPriority: 10,
      menuType: 'PARTY_MENU_TYPE_CHOOSE_SINGLE_MON',
      paletteFadeStarted: true
    });

    taskChoosePartyMon(runtime, true);
    expect(runtime.partyMenu?.destroyed).toBeUndefined();
    taskChoosePartyMon(runtime, false);
    expect(runtime.partyMenu?.paletteBufferTransferDisabled).toBe(true);
    expect(runtime.partyMenu?.destroyed).toBe(true);

    chooseMonForMoveRelearner(runtime);
    expect(runtime.partyMenu?.menuType).toBe('PARTY_MENU_TYPE_MOVE_RELEARNER');
  });

  test('SelectMoveDeleterMove stores summary screen mode and continue-script callback', () => {
    const runtime = createRuntime();
    selectMoveDeleterMove(runtime);
    expect(runtime.partyMenu?.summaryScreenMode).toBe('PSS_MODE_FORGET_MOVE');
    expect(runtime.partyMenu?.fieldCallback).toBe('FieldCB_ContinueScriptHandleMusic');
  });

  test('GetNumMovesSelectedMonHas counts non-MOVE_NONE slots', () => {
    const runtime = createRuntime();
    getNumMovesSelectedMonHas(runtime);
    expect(runtime.vars.gSpecialVar_Result).toBe(3);
    expect(runtime.vars.VAR_RESULT).toBe(3);
  });

  test('BufferMoveDeleterNicknameAndMove buffers nickname and selected move name', () => {
    const runtime = createRuntime();
    bufferMoveDeleterNicknameAndMove(runtime, { 20: 'QUICK ATTACK' });
    expect(runtime.stringVars.STR_VAR_1).toBe('SPARKY');
    expect(runtime.stringVars.STR_VAR_2).toBe('QUICK ATTACK');
  });

  test('ShiftMoveSlot swaps move, PP, and PP Up bonus bitfields exactly', () => {
    const mon = createRuntime().party[0];
    shiftMoveSlot(mon, 0, 1);
    expect(mon.moves.slice(0, 2)).toEqual([20, 10]);
    expect(mon.pp.slice(0, 2)).toEqual([20, 35]);
    expect(mon.ppBonuses & 0x0f).toBe(0b0001);
  });

  test('MoveDeleterForgetMove clears selected move then shifts following slots left', () => {
    const runtime = createRuntime();
    moveDeleterForgetMove(runtime);
    expect(runtime.party[0].moves).toEqual([10, MOVE_NONE, 30, MOVE_NONE]);
    expect(runtime.party[0].pp).toEqual([35, 0, 15, 0]);
  });

  test('IsSelectedMonEgg mirrors MON_DATA_IS_EGG into gSpecialVar_Result', () => {
    const runtime = createRuntime();
    isSelectedMonEgg(runtime);
    expect(runtime.vars.gSpecialVar_Result).toBe(0);
    runtime.party[0].isEgg = true;
    isSelectedMonEgg(runtime);
    expect(runtime.vars.gSpecialVar_Result).toBe(1);
  });

  test('exact C-name party menu specials preserve menu and move-deleter behavior', () => {
    const runtime = createRuntime();

    ChoosePartyMon(runtime);
    expect(runtime.partyMenu).toMatchObject({
      lockedControls: true,
      taskPriority: 10,
      menuType: 'PARTY_MENU_TYPE_CHOOSE_SINGLE_MON',
      paletteFadeStarted: true
    });
    Task_ChoosePartyMon(runtime, 0, true);
    expect(runtime.partyMenu?.destroyed).toBeUndefined();
    Task_ChoosePartyMon(runtime, 0, false);
    expect(runtime.partyMenu?.paletteBufferTransferDisabled).toBe(true);
    expect(runtime.partyMenu?.destroyed).toBe(true);

    ChooseMonForMoveRelearner(runtime);
    expect(runtime.partyMenu?.menuType).toBe('PARTY_MENU_TYPE_MOVE_RELEARNER');
    SelectMoveDeleterMove(runtime);
    expect(runtime.partyMenu?.summaryScreenMode).toBe('PSS_MODE_FORGET_MOVE');
    expect(runtime.partyMenu?.fieldCallback).toBe('FieldCB_ContinueScriptHandleMusic');

    GetNumMovesSelectedMonHas(runtime);
    expect(runtime.vars.gSpecialVar_Result).toBe(3);
    BufferMoveDeleterNicknameAndMove(runtime, { 20: 'QUICK ATTACK' });
    expect(runtime.stringVars.STR_VAR_1).toBe('SPARKY');
    expect(runtime.stringVars.STR_VAR_2).toBe('QUICK ATTACK');

    const mon = createRuntime().party[0];
    ShiftMoveSlot(mon, 0, 1);
    expect(mon.moves.slice(0, 2)).toEqual([20, 10]);
    expect(mon.pp.slice(0, 2)).toEqual([20, 35]);

    MoveDeleterForgetMove(runtime);
    expect(runtime.party[0].moves).toEqual([10, MOVE_NONE, 30, MOVE_NONE]);
    runtime.party[0].isEgg = true;
    IsSelectedMonEgg(runtime);
    expect(runtime.vars.gSpecialVar_Result).toBe(1);
  });
});
