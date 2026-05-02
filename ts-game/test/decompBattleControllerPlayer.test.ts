import { describe, expect, test } from 'vitest';
import {
  BATTLE_TYPE_LINK,
  CONTROLLER_GETMONDATA,
  CONTROLLER_PLAYSE,
  CONTROLLER_SETMONDATA,
  CONTROLLER_SWITCHINANIM,
  CopyPlayerMonData,
  HandleInputChooseAction,
  HandleInputChooseMove,
  HandleMoveSwitching,
  MoveSelectionCreateCursorAt,
  PlayerBufferExecCompleted,
  PlayerBufferRunCommand,
  PlayerHandleChooseItem,
  PlayerHandleChoosePokemon,
  PlayerHandleExpUpdate,
  PlayerHandleGetMonData,
  PlayerHandleSetMonData,
  PlayerHandleSpriteInvisibility,
  SetControllerToPlayer,
  SpriteCB_FreePlayerSpriteLoadMonSprite,
  Task_GiveExpWithExpBar,
  Task_PrepareToGiveExpWithExpBar,
  Task_StartSendOutAnim,
  WaitForMonSelection,
  CompleteWhenChoseItem,
  createBattleControllerPlayerRuntime
} from '../src/game/decompBattleControllerPlayer';

describe('decompBattleControllerPlayer', () => {
  test('controller setup and command completion match link/non-link paths', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.activeBattler = 1;
    runtime.controllerExecFlags = 0b1111;

    SetControllerToPlayer(runtime);
    expect(runtime.battlerControllerFuncs[1]).toBe('PlayerBufferRunCommand');
    expect(runtime.doingBattleAnim).toBe(false);

    PlayerBufferExecCompleted(runtime);
    expect(runtime.controllerExecFlags & runtime.bitTable[1]).toBe(0);

    runtime.controllerExecFlags = 0b1111;
    runtime.battleTypeFlags = BATTLE_TYPE_LINK;
    runtime.multiplayerId = 3;
    PlayerBufferExecCompleted(runtime);
    expect(runtime.battleBufferA[1][0]).toBe(56);
    expect(runtime.operations).toContain('PrepareBufferDataTransferLink:2:4:3');
  });

  test('PlayerBufferRunCommand dispatches command table handlers', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.battleBufferA[0][0] = CONTROLLER_PLAYSE;
    runtime.battleBufferA[0][1] = 42;

    PlayerBufferRunCommand(runtime);
    expect(runtime.operations).toContain('PlaySE:42');
    expect(runtime.controllerExecFlags & 1).toBe(0);
  });

  test('copy/set mon data mirrors controller buffers', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.party[2] = { species: 25, hp: 12, maxHp: 20, level: 8, exp: 123, moves: [1, 2, 3, 4], pp: [5, 6, 7, 8], nickname: 'PIKA', raw: [9, 9] };

    expect(CopyPlayerMonData(2, [], runtime).slice(0, 9)).toEqual([25, 12, 20, 8, 123, 1, 2, 3, 4]);
    runtime.battleBufferA[0][0] = CONTROLLER_GETMONDATA;
    runtime.battleBufferA[0][1] = 2;
    PlayerHandleGetMonData(runtime);
    expect(runtime.battleBufferB[0].slice(0, 5)).toEqual([25, 12, 20, 8, 123]);

    runtime.controllerExecFlags = 1;
    runtime.battleBufferA[0][0] = CONTROLLER_SETMONDATA;
    runtime.battleBufferA[0][1] = 2;
    runtime.battleBufferA[0][2] = 26;
    runtime.battleBufferA[0][3] = 18;
    runtime.battleBufferA[0][4] = 9;
    PlayerHandleSetMonData(runtime);
    expect(runtime.party[2]).toMatchObject({ species: 26, hp: 18, level: 9 });
  });

  test('action and move input update cursors and return chosen values', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.controllerExecFlags = 1;
    runtime.input.right = true;
    HandleInputChooseAction(runtime);
    expect(runtime.actionSelectionCursor[0]).toBe(1);

    runtime.input.right = false;
    runtime.input.a = true;
    runtime.controllerExecFlags = 1;
    HandleInputChooseAction(runtime);
    expect(runtime.battleBufferB[0][0]).toBe(1);

    runtime.controllerExecFlags = 1;
    runtime.input.a = false;
    MoveSelectionCreateCursorAt(1, 0, runtime);
    runtime.battleMons[0].moves = [10, 20, 30, 40];
    runtime.battleMons[0].pp = [1, 2, 3, 4];
    HandleMoveSwitching(runtime);
    expect(runtime.battleMons[0].moves).toEqual([10, 30, 20, 40]);

    runtime.input.a = true;
    runtime.controllerExecFlags = 1;
    HandleInputChooseMove(runtime);
    expect(runtime.battleBufferB[0]).toEqual(expect.arrayContaining([1, 30]));
  });

  test('choose item and pokemon wait callbacks complete only after external selections', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.controllerExecFlags = 1;

    PlayerHandleChoosePokemon(runtime);
    expect(runtime.battlerControllerFuncs[0]).toBe('WaitForMonSelection');
    WaitForMonSelection(runtime);
    expect(runtime.controllerExecFlags).toBe(1);
    runtime.monSelectionDone = true;
    runtime.selectedMonId = 4;
    WaitForMonSelection(runtime);
    expect(runtime.battleBufferB[0][0]).toBe(4);

    runtime.controllerExecFlags = 1;
    PlayerHandleChooseItem(runtime);
    runtime.itemSelectionDone = true;
    runtime.selectedItem = 99;
    CompleteWhenChoseItem(runtime);
    expect(runtime.battleBufferB[0][0]).toBe(99);
  });

  test('exp and send-out task progression mutates battle state and completes', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.controllerExecFlags = 1;
    PlayerHandleExpUpdate(runtime);
    const prep = runtime.tasks.length - 1;
    runtime.tasks[prep].data[1] = 0;
    runtime.tasks[prep].data[2] = 50;
    Task_PrepareToGiveExpWithExpBar(prep, runtime);
    expect(runtime.tasks[prep].func).toBe('Task_GiveExpWithExpBar');
    Task_GiveExpWithExpBar(prep, runtime);
    Task_GiveExpWithExpBar(prep, runtime);
    Task_GiveExpWithExpBar(prep, runtime);
    expect(runtime.party[0].exp).toBe(50);

    runtime.controllerExecFlags = 1;
    runtime.battleBufferA[0][0] = CONTROLLER_SWITCHINANIM;
    PlayerBufferRunCommand(runtime);
    const sendOut = runtime.tasks.length - 1;
    Task_StartSendOutAnim(sendOut, runtime);
    Task_StartSendOutAnim(sendOut, runtime);
    Task_StartSendOutAnim(sendOut, runtime);
    expect(runtime.tasks[sendOut].destroyed).toBe(true);
  });

  test('sprite and visibility handlers preserve direct sprite state changes', () => {
    const runtime = createBattleControllerPlayerRuntime();
    runtime.battleBufferA[0][1] = 1;
    PlayerHandleSpriteInvisibility(runtime);
    expect(runtime.sprites[0].invisible).toBe(true);

    SpriteCB_FreePlayerSpriteLoadMonSprite(0, runtime);
    expect(runtime.sprites[0].destroyed).toBe(true);
  });
});
