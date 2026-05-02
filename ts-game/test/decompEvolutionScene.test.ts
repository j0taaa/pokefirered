import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  DPAD_DOWN,
  EVOSTATE_CANCEL,
  EVOSTATE_END,
  EVOSTATE_EVO_SOUND,
  EVOSTATE_FADE_IN,
  EVOSTATE_INTRO_MSG,
  EVOSTATE_REPLACE_MOVE,
  EVOSTATE_SET_MON_EVOLVED,
  EVOSTATE_SPARKLE_ARC,
  EVOSTATE_SPARKLE_CIRCLE,
  EVOSTATE_TRY_LEARN_MOVE,
  EVOSTATE_WAIT_CYCLE_MON_SPRITE,
  EVO_LEVEL_NINJASK,
  InitMovingBgPalette,
  IsMovingBackgroundTaskRunning,
  MON_HAS_MAX_MOVES,
  MVSTATE_FORGET_MSG_1,
  MVSTATE_HANDLE_MOVE_SELECT,
  MVSTATE_HANDLE_YES_NO,
  MVSTATE_INTRO_MSG_1,
  MVSTATE_PRINT_YES_NO,
  MVSTATE_RETRY_AFTER_HM,
  MVSTATE_SHOW_MOVE_SELECT,
  MVSTATE_ASK_CANCEL,
  SPECIES_NINJASK,
  SPECIES_SHEDINJA,
  StartBgAnimation,
  StopBgAnimation,
  T_EVOSTATE_EVO_MON_ANIM,
  T_EVOSTATE_INTRO_CRY,
  T_EVOSTATE_REPLACE_MOVE,
  T_EVOSTATE_SET_MON_EVOLVED,
  T_EVOSTATE_TRY_LEARN_MOVE,
  T_MVSTATE_FORGET_MSG,
  T_MVSTATE_HANDLE_YES_NO,
  T_MVSTATE_SHOW_MOVE_SELECT,
  TASK_BIT_CAN_STOP,
  TASK_NONE,
  BeginEvolutionScene,
  CB2_BeginEvolutionScene,
  CB2_EvolutionSceneUpdate,
  CB2_TradeEvolutionSceneUpdate,
  CB2_TradeEvolutionSceneLoadGraphics,
  CreateShedinja,
  CreateTask,
  EvoDummyFunc,
  EvolutionScene,
  FindTaskIdByFunc,
  Task_AnimateBg,
  Task_BeginEvolutionScene,
  Task_EvolutionScene,
  Task_TradeEvolutionScene,
  Task_UpdateBgPalette,
  TradeEvolutionScene,
  VBlankCB_EvolutionScene,
  VBlankCB_TradeEvolutionScene,
  createEvolutionRuntime,
  createPokemon,
  sBgAnim_PalIndexes
} from '../src/game/decompEvolutionScene';

const taskData = (runtime: ReturnType<typeof createEvolutionRuntime>, func: string) => {
  const id = FindTaskIdByFunc(runtime, func);
  expect(id).not.toBe(TASK_NONE);
  return runtime.tasks.find((task) => task.id === id)!.data;
};

describe('decompEvolutionScene', () => {
  test('exact C-name callbacks run palette, task, sprite, text, and vblank work in order', () => {
    const mon = createPokemon({ species: 10 });
    const runtime = createEvolutionRuntime({ playerParty: [mon] });
    BeginEvolutionScene(runtime, mon, 20, true, 0);

    CB2_BeginEvolutionScene(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['UpdatePaletteFade', 'RunTasks', 'BeginNormalPaletteFade(4294967295,0,0,16,RGB_BLACK)']);
    expect(taskData(runtime, 'Task_BeginEvolutionScene')[0]).toBe(1);

    runtime.gPaletteFadeActive = false;
    CB2_BeginEvolutionScene(runtime);
    expect(runtime.mainCallback).toBe('CB2_EvolutionSceneUpdate');
    expect(FindTaskIdByFunc(runtime, 'Task_EvolutionScene')).not.toBe(TASK_NONE);

    const beforeUpdate = runtime.operations.length;
    CB2_EvolutionSceneUpdate(runtime);
    expect(runtime.operations.slice(beforeUpdate, beforeUpdate + 5)).toEqual(['AnimateSprites', 'BuildOamBuffer', 'RunTextPrinters', 'UpdatePaletteFade', 'RunTasks']);

    runtime.gBattle_BG0_X = 1;
    runtime.gBattle_BG0_Y = 2;
    runtime.gBattle_BG1_X = 3;
    runtime.gBattle_BG1_Y = 4;
    runtime.gBattle_BG2_X = 5;
    runtime.gBattle_BG2_Y = 6;
    runtime.gBattle_BG3_X = 7;
    runtime.gBattle_BG3_Y = 8;
    VBlankCB_EvolutionScene(runtime);
    expect(runtime.operations.slice(-12)).toEqual([
      'SetGpuReg(REG_OFFSET_BG0HOFS,1)',
      'SetGpuReg(REG_OFFSET_BG0VOFS,2)',
      'SetGpuReg(REG_OFFSET_BG1HOFS,3)',
      'SetGpuReg(REG_OFFSET_BG1VOFS,4)',
      'SetGpuReg(REG_OFFSET_BG2HOFS,5)',
      'SetGpuReg(REG_OFFSET_BG2VOFS,6)',
      'SetGpuReg(REG_OFFSET_BG3HOFS,7)',
      'SetGpuReg(REG_OFFSET_BG3VOFS,8)',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'TransferPlttBuffer',
      'ScanlineEffect_InitHBlankDmaTransfer'
    ]);

    const tradeRuntime = createEvolutionRuntime({ playerParty: [createPokemon({ species: 30 })] });
    TradeEvolutionScene(tradeRuntime, tradeRuntime.playerParty[0]!, 31, 0, 0);
    const tradeBefore = tradeRuntime.operations.length;
    CB2_TradeEvolutionSceneUpdate(tradeRuntime);
    expect(tradeRuntime.operations.slice(tradeBefore, tradeBefore + 5)).toEqual(['AnimateSprites', 'BuildOamBuffer', 'RunTextPrinters', 'UpdatePaletteFade', 'RunTasks']);
    VBlankCB_TradeEvolutionScene(tradeRuntime);
    expect(tradeRuntime.operations.at(-1)).toBe('ScanlineEffect_InitHBlankDmaTransfer');
    expect(() => EvoDummyFunc(tradeRuntime)).not.toThrow();
  });

  test('BeginEvolutionScene and Task_BeginEvolutionScene dispatch exactly through the fade gate', () => {
    const mon = createPokemon({ species: 10 });
    const runtime = createEvolutionRuntime({ playerParty: [mon] });

    BeginEvolutionScene(runtime, mon, 20, true, 0);
    expect(runtime.mainCallback).toBe('CB2_BeginEvolutionScene');
    expect(taskData(runtime, 'Task_BeginEvolutionScene')[2]).toBe(20);

    const taskId = FindTaskIdByFunc(runtime, 'Task_BeginEvolutionScene');
    Task_BeginEvolutionScene(runtime, taskId);
    expect(taskData(runtime, 'Task_BeginEvolutionScene')[0]).toBe(1);

    runtime.gPaletteFadeActive = false;
    Task_BeginEvolutionScene(runtime, taskId);
    expect(runtime.sEvoStructPtr?.preEvoSpriteId).toBe(0);
    expect(runtime.sEvoStructPtr?.postEvoSpriteId).toBe(1);
    expect(runtime.mainCallback).toBe('CB2_EvolutionSceneUpdate');
    expect(taskData(runtime, 'Task_EvolutionScene').slice(0, 5)).toEqual([EVOSTATE_FADE_IN, 10, 20, TASK_BIT_CAN_STOP, 1]);
  });

  test('EvolutionScene initializes sprites, saved palette, callbacks, and task fields', () => {
    const mon = createPokemon({ species: 25 });
    const runtime = createEvolutionRuntime({ palette: Array.from({ length: 256 }, (_, index) => 1000 + index), playerParty: [mon] });

    EvolutionScene(runtime, mon, 26, false, 0);

    expect(runtime.sEvoStructPtr?.savedPalette.slice(0, 3)).toEqual([1032, 1033, 1034]);
    expect(runtime.sprites.map((sprite) => [sprite.oam.paletteNum, sprite.invisible])).toEqual([[1, true], [2, true]]);
    expect(runtime.vblankCallback).toBe('VBlankCB_EvolutionScene');
    expect(runtime.hblankCallback).toBe('EvoDummyFunc');
    expect(taskData(runtime, 'Task_EvolutionScene').slice(0, 11)).toEqual([0, 25, 26, 0, 1, 0, 0, 0, 0, 0, 0]);
  });

  test('Task_EvolutionScene follows the C happy path through evolution and cleanup', () => {
    const mon = createPokemon({ species: 30 });
    const runtime = createEvolutionRuntime({ playerParty: [mon], playerPartyCount: 1 });
    EvolutionScene(runtime, mon, 31, false, 0);
    const id = FindTaskIdByFunc(runtime, 'Task_EvolutionScene');
    const data = taskData(runtime, 'Task_EvolutionScene');

    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_INTRO_MSG);
    expect(runtime.sprites[0]!.invisible).toBe(false);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_SPARKLE_ARC);
    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_SPARKLE_CIRCLE - 2);
    runtime.sEvoStructPtr!.delayTimer = 1;
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    while (data[0] !== EVOSTATE_EVO_SOUND) Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    runtime.sePlaying = true;
    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_SET_MON_EVOLVED - 1);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    expect(mon.species).toBe(31);
    expect(runtime.gameStats).toEqual(['GAME_STAT_EVOLVED_POKEMON']);
    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_END);
    Task_EvolutionScene(runtime, id);
    expect(runtime.sEvoStructPtr).toBeNull();
    expect(runtime.mainCallback).toBe('AfterEvolution');
  });

  test('non-trade cancellation paths preserve the C conditions', () => {
    const mon = createPokemon({ species: 40 });
    const runtime = createEvolutionRuntime({ playerParty: [mon], nationalDexEnabled: false });
    EvolutionScene(runtime, mon, 200, true, 0);
    const id = FindTaskIdByFunc(runtime, 'Task_EvolutionScene');
    const data = taskData(runtime, 'Task_EvolutionScene');
    const graphicsId = CreateTask(runtime, 'CycleEvolutionMonSprite', 0);
    runtime.gBattleCommunication[2] = graphicsId;
    data[0] = EVOSTATE_WAIT_CYCLE_MON_SPRITE;

    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_CANCEL);
    expect(data[9]).toBe(1);
    expect(runtime.tasks.find((task) => task.id === graphicsId)!.data[8]).toBe(1);

    const bRuntime = createEvolutionRuntime({ playerParty: [createPokemon({ species: 41 })], heldKeys: B_BUTTON });
    EvolutionScene(bRuntime, bRuntime.playerParty[0]!, 42, true, 0);
    const bData = taskData(bRuntime, 'Task_EvolutionScene');
    const bGraphicsId = CreateTask(bRuntime, 'CycleEvolutionMonSprite', 0);
    bRuntime.gBattleCommunication[2] = bGraphicsId;
    bData[0] = EVOSTATE_WAIT_CYCLE_MON_SPRITE;
    Task_EvolutionScene(bRuntime, FindTaskIdByFunc(bRuntime, 'Task_EvolutionScene'));
    expect(bData[0]).toBe(EVOSTATE_CANCEL);
    expect(bRuntime.tasks.find((task) => task.id === bGraphicsId)!.data[8]).toBe(1);
  });

  test('non-trade move replacement handles yes/no, summary, HM retry, and replacing a move', () => {
    const mon = createPokemon({ species: 50, moves: [10, 20, 30, 40] });
    const runtime = createEvolutionRuntime({ playerParty: [mon], moveLearnResults: [MON_HAS_MAX_MOVES], moveToLearn: 99 });
    EvolutionScene(runtime, mon, 51, false, 0);
    const id = FindTaskIdByFunc(runtime, 'Task_EvolutionScene');
    const data = taskData(runtime, 'Task_EvolutionScene');
    data[0] = EVOSTATE_TRY_LEARN_MOVE;

    Task_EvolutionScene(runtime, id);
    expect(data[0]).toBe(EVOSTATE_REPLACE_MOVE);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_HANDLE_YES_NO);
    runtime.newKeys = DPAD_DOWN;
    Task_EvolutionScene(runtime, id);
    expect(runtime.gBattleCommunication[1]).toBe(1);
    runtime.newKeys = A_BUTTON;
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_ASK_CANCEL);
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_PRINT_YES_NO);
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_HANDLE_YES_NO);

    runtime.gBattleCommunication[1] = 1;
    runtime.newKeys = A_BUTTON;
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_INTRO_MSG_1);
    runtime.newKeys = 0;
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    Task_EvolutionScene(runtime, id);
    runtime.gBattleCommunication[1] = 0;
    runtime.newKeys = A_BUTTON;
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_SHOW_MOVE_SELECT);
    runtime.gPaletteFadeActive = false;
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_HANDLE_MOVE_SELECT);
    expect(runtime.operations.at(-1)).toContain('ShowSelectMovePokemonSummaryScreen');

    runtime.mainCallback = 'CB2_EvolutionSceneUpdate';
    runtime.moveSlotToReplace = 1;
    runtime.hmMoves.add(20);
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_RETRY_AFTER_HM);
    Task_EvolutionScene(runtime, id);
    expect(data[6]).toBe(MVSTATE_SHOW_MOVE_SELECT);

    runtime.hmMoves.clear();
    Task_EvolutionScene(runtime, id);
    runtime.mainCallback = 'CB2_EvolutionSceneUpdate';
    Task_EvolutionScene(runtime, id);
    expect(mon.moves).toEqual([10, 99, 30, 40]);
    expect(data[6]).toBe(MVSTATE_FORGET_MSG_1);
  });

  test('CreateShedinja copies the evolved mon and clears the same fields as the C helper', () => {
    const mon = createPokemon({
      species: SPECIES_NINJASK,
      nickname: 'NIN',
      language: 1,
      heldItem: 123,
      markings: 7,
      encryptSeparator: 44,
      ribbons: [1, 2, 3],
      status: 55,
      mail: 12
    });
    const table = Array.from({ length: SPECIES_NINJASK + 1 }, () => [{ method: 0, targetSpecies: 0 }, { method: 0, targetSpecies: 0 }]);
    table[SPECIES_NINJASK] = [{ method: EVO_LEVEL_NINJASK, targetSpecies: 291 }, { method: 0, targetSpecies: SPECIES_SHEDINJA }];
    const runtime = createEvolutionRuntime({ playerParty: [mon], playerPartyCount: 1, evolutionTable: table });

    CreateShedinja(runtime, SPECIES_NINJASK, mon);

    expect(runtime.playerPartyCount).toBe(2);
    expect(runtime.playerParty[1]).toMatchObject({
      species: SPECIES_SHEDINJA,
      nickname: 'ヌケニン',
      heldItem: 0,
      markings: 0,
      encryptSeparator: 0,
      status: 0,
      mail: 0xff
    });
    expect(runtime.playerParty[1]!.ribbons).toEqual([0, 0, 0]);
    expect(runtime.pokedexFlags).toEqual([{ species: SPECIES_SHEDINJA, flag: 'SEEN' }, { species: SPECIES_SHEDINJA, flag: 'CAUGHT' }]);
  });

  test('trade evolution setup, load graphics, sound bug, and replace move flow stay distinct from non-trade', () => {
    const mon = createPokemon({ species: 60, moves: [1, 2, 3, 4] });
    const runtime = createEvolutionRuntime({ playerParty: [mon], wirelessCommType: 1, moveLearnResults: [MON_HAS_MAX_MOVES], moveToLearn: 88 });
    runtime.sprites.push({ id: 9, invisible: false, callback: 'dummy', oam: { paletteNum: 3 } });

    TradeEvolutionScene(runtime, mon, 61, 9, 0);
    expect(runtime.textFlagsUseAlternateDownArrow).toBe(true);
    expect(taskData(runtime, 'Task_TradeEvolutionScene')[0]).toBe(T_EVOSTATE_INTRO_CRY - 1);

    for (let i = 0; i < 8; i++) CB2_TradeEvolutionSceneLoadGraphics(runtime);
    expect(runtime.mainCallback).toBe('CB2_TradeEvolutionSceneUpdate');
    expect(runtime.operations).toContain('CreateWirelessStatusIndicatorSprite');

    const data = taskData(runtime, 'Task_TradeEvolutionScene');
    const id = FindTaskIdByFunc(runtime, 'Task_TradeEvolutionScene');
    data[0] = T_EVOSTATE_EVO_MON_ANIM;
    runtime.sePlaying = false;
    Task_TradeEvolutionScene(runtime, id);
    expect(data[0]).toBe(T_EVOSTATE_EVO_MON_ANIM);
    runtime.sePlaying = true;
    Task_TradeEvolutionScene(runtime, id);
    expect(data[0]).toBe(T_EVOSTATE_SET_MON_EVOLVED);

    data[0] = T_EVOSTATE_TRY_LEARN_MOVE;
    runtime.sePlaying = false;
    Task_TradeEvolutionScene(runtime, id);
    expect(data[0]).toBe(T_EVOSTATE_REPLACE_MOVE);
    Task_TradeEvolutionScene(runtime, id);
    Task_TradeEvolutionScene(runtime, id);
    Task_TradeEvolutionScene(runtime, id);
    expect(data[6]).toBe(T_MVSTATE_HANDLE_YES_NO);
    runtime.menuInputs.push(0);
    Task_TradeEvolutionScene(runtime, id);
    expect(data[6]).toBe(T_MVSTATE_SHOW_MOVE_SELECT);
    Task_TradeEvolutionScene(runtime, id);
    runtime.mainCallback = 'CB2_TradeEvolutionSceneUpdate';
    runtime.moveSlotToReplace = 2;
    Task_TradeEvolutionScene(runtime, id);
    expect(mon.moves[2]).toBe(88);
    expect(data[6]).toBe(T_MVSTATE_FORGET_MSG);
    expect(runtime.operations).toContain('DestroyWirelessStatusIndicatorSprite');
  });

  test('background palette and animation helpers follow the table-driven C timing', () => {
    const runtime = createEvolutionRuntime();
    const palette: number[] = [];
    InitMovingBgPalette(palette);
    expect(palette.slice(0, 16)).toEqual(sBgAnim_PalIndexes[0]);

    StartBgAnimation(runtime, false);
    const updateId = FindTaskIdByFunc(runtime, 'Task_UpdateBgPalette');
    const animateId = FindTaskIdByFunc(runtime, 'Task_AnimateBg');
    expect(updateId).not.toBe(TASK_NONE);
    expect(animateId).not.toBe(TASK_NONE);

    for (let i = 0; i < 29; i++) Task_UpdateBgPalette(runtime, updateId);
    expect(runtime.loadedPalettes.at(-1)?.values).toEqual(sBgAnim_PalIndexes[0]);

    IsMovingBackgroundTaskRunning(runtime);
    const before = [...runtime.tasks.find((task) => task.id === updateId)!.data];
    Task_UpdateBgPalette(runtime, updateId);
    expect(runtime.tasks.find((task) => task.id === updateId)!.data).toEqual(before);

    runtime.tasks.find((task) => task.id === updateId)!.isActive = false;
    Task_AnimateBg(runtime, animateId);
    expect(runtime.gBattle_BG1_X).toBe(0);
    expect(runtime.gBattle_BG2_X).toBe(256);

    StartBgAnimation(runtime, true);
    StopBgAnimation(runtime);
    expect(FindTaskIdByFunc(runtime, 'Task_UpdateBgPalette')).toBe(TASK_NONE);
    expect(runtime.sBgAnimPal).toBeNull();
  });
});
