import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  GetAnimTypeByItemId,
  GetClosenessFromFriendship,
  GetMonLevelUpWindowStats,
  GetPSAStruct,
  ITEM_HM08,
  ITEM_POTION,
  ITEM_RARE_CANDY,
  ITEM_TM01,
  PSA_GetAnimType,
  PSA_GetItemId,
  PSA_GetMonNickname,
  PSA_GetMonPersonality,
  PSA_GetMonSpecies,
  PSA_GetNameOfMoveForgotten,
  PSA_GetNameOfMoveToTeach,
  PSA_GetPokemon,
  PSA_GetSceneWork,
  PSA_ITEM_ANIM_TYPE_DEFAULT,
  PSA_ITEM_ANIM_TYPE_POTION,
  PSA_ITEM_ANIM_TYPE_TMHM,
  PSA_IsCancelDisabled,
  PSA_TEXT_FORGET_POOF,
  PSA_TEXT_HUH,
  PSA_TEXT_ITEM_USED,
  PSA_TEXT_LEARNED_MOVE,
  PSA_TEXT_MACHINE_SET,
  RunPsaTask,
  SE_M_SPIT_UP,
  StartUseItemAnim_CantEvolve,
  StartUseItemAnim_ForgetMoveAndLearnTMorHM,
  StartUseItemAnim_Normal,
  Task_CleanUp,
  VBlankCB_PSA,
  CB2_PSA,
  createPokemonSpecialAnimRuntime,
  createPsaPokemon
} from '../src/game/decompPokemonSpecialAnim';

const runUntilState = (runtime: ReturnType<typeof createPokemonSpecialAnimRuntime>, state: number, limit = 80) => {
  for (let i = 0; i < limit && GetPSAStruct(runtime)?.state !== state; i += 1) {
    runtime.gPaletteFade.active = false;
    RunPsaTask(runtime);
  }
};

describe('decomp pokemon_special_anim.c parity', () => {
  test('friendship and item anim type helpers preserve C thresholds and map', () => {
    expect(GetClosenessFromFriendship(100)).toBe(0);
    expect(GetClosenessFromFriendship(101)).toBe(1);
    expect(GetClosenessFromFriendship(150)).toBe(1);
    expect(GetClosenessFromFriendship(151)).toBe(2);
    expect(GetClosenessFromFriendship(200)).toBe(2);
    expect(GetClosenessFromFriendship(201)).toBe(3);

    expect(GetAnimTypeByItemId(ITEM_RARE_CANDY)).toBe(PSA_ITEM_ANIM_TYPE_DEFAULT);
    expect(GetAnimTypeByItemId(ITEM_POTION)).toBe(PSA_ITEM_ANIM_TYPE_POTION);
    expect(GetAnimTypeByItemId(ITEM_TM01)).toBe(PSA_ITEM_ANIM_TYPE_TMHM);
    expect(GetAnimTypeByItemId(ITEM_HM08)).toBe(PSA_ITEM_ANIM_TYPE_TMHM);
    expect(GetAnimTypeByItemId(999)).toBe(PSA_ITEM_ANIM_TYPE_DEFAULT);
  });

  test('StartUseItemAnim_Normal allocates PSA, resets outside battle, and wires accessors', () => {
    const runtime = createPokemonSpecialAnimRuntime({
      party: [
        createPsaPokemon({
          species: 25,
          friendship: 255,
          personality: 0x12345678,
          nickname: 'PIKA',
          maxHP: 35,
          atk: 55,
          def: 40,
          speed: 90,
          spatk: 50,
          spdef: 50
        })
      ]
    });

    StartUseItemAnim_Normal(runtime, 0, ITEM_POTION, 'BackCB');

    expect(runtime.operations.slice(0, 4)).toEqual([
      'ResetTasks',
      'ResetSpriteData',
      'FreeAllSpritePalettes',
      'CreateTask:Task_UseItem_Normal:0'
    ]);
    expect(runtime.mainCallback2).toBe('CB2_PSA');
    expect(PSA_GetItemId(runtime)).toBe(ITEM_POTION);
    expect(PSA_GetAnimType(runtime)).toBe(PSA_ITEM_ANIM_TYPE_POTION);
    expect(PSA_GetMonSpecies(runtime)).toBe(25);
    expect(PSA_GetMonPersonality(runtime)).toBe(0x12345678);
    expect(PSA_GetMonNickname(runtime)).toBe('PIKA');
    expect(PSA_GetPokemon(runtime)?.nickname).toBe('PIKA');
    expect(PSA_GetSceneWork(runtime)).toEqual({ animType: 0 });
    expect(GetMonLevelUpWindowStats(PSA_GetPokemon(runtime)!)).toEqual([35, 55, 40, 90, 50, 50]);
  });

  test('allocation failure immediately restores saved callback', () => {
    const runtime = createPokemonSpecialAnimRuntime({ allocationFails: true });

    StartUseItemAnim_Normal(runtime, 0, ITEM_POTION, 'BackCB');

    expect(runtime.mainCallback2).toBe('BackCB');
    expect(runtime.tasks).toEqual([]);
  });

  test('Task_UseItem_Normal follows item-used flow and skips fade for evolution stones', () => {
    const runtime = createPokemonSpecialAnimRuntime({
      party: [createPsaPokemon({ species: 6, friendship: 255 })],
      itemKindOverride: { [ITEM_POTION]: 2 }
    });
    StartUseItemAnim_Normal(runtime, 0, ITEM_POTION, 'BackCB');

    runUntilState(runtime, 12);
    expect(runtime.operations).toContain('PSA_CreateMonSpriteAtCloseness:0');
    expect(runtime.operations).toContain('PSA_SetUpZoomAnim:3');
    expect(runtime.operations).toContain('PlayCry_Normal:6:0');
    expect(runtime.operations).toContain(`PSA_PrintMessage:${PSA_TEXT_ITEM_USED}`);

    runtime.gMain.newKeys = A_BUTTON;
    RunPsaTask(runtime);
    expect(GetPSAStruct(runtime)?.state).toBe(14);
    RunPsaTask(runtime);
    expect(runtime.mainCallback2).toBe('BackCB');
    expect(runtime.tasks[0]).toBeNull();
  });

  test('normal item cancel switches to cleanup before running state machine', () => {
    const runtime = createPokemonSpecialAnimRuntime();
    StartUseItemAnim_Normal(runtime, 0, ITEM_POTION, 'BackCB');

    runtime.gMain.heldKeys = A_BUTTON;
    RunPsaTask(runtime);

    expect(runtime.operations).toContain('PSA_UseItem_CleanUpForCancel');
    expect(runtime.tasks[0]?.func).toBe('Task_CleanUp');
    expect(GetPSAStruct(runtime)?.state).toBe(0);
  });

  test('TM no-forget setup waits 21 frames then enters machine set sequence', () => {
    const runtime = createPokemonSpecialAnimRuntime({
      moveNames: { 1: 'FOCUS PUNCH' },
      itemToMove: { [ITEM_TM01]: 1 }
    });
    StartUseItemAnim_Normal(runtime, 0, ITEM_TM01, 'BackCB');

    expect(runtime.tasks[0]?.func).toBe('Task_UseTM_NoForget');
    expect(PSA_GetNameOfMoveToTeach(runtime)).toBe('FOCUS PUNCH');

    runUntilState(runtime, 3);
    for (let i = 0; i < 21; i += 1) {
      RunPsaTask(runtime);
    }
    expect(runtime.tasks[0]?.func).toBe('Task_MachineSet');
    expect(GetPSAStruct(runtime)?.state).toBe(0);

    runUntilState(runtime, 9, 120);
    expect(runtime.operations).toContain(`PSA_PrintMessage:${PSA_TEXT_MACHINE_SET}`);
    expect(runtime.operations).toContain(`PSA_PrintMessage:${PSA_TEXT_LEARNED_MOVE}`);
    expect(runtime.operations).toContain('PlayFanfare:MUS_LEVEL_UP');
    RunPsaTask(runtime);
    expect(runtime.tasks[0]?.func).toBe('Task_CleanUp');
  });

  test('forget-move flow prints poof sequence, then transitions into machine set', () => {
    const runtime = createPokemonSpecialAnimRuntime({
      moveNames: { 15: 'CUT', 1: 'POUND' },
      itemToMove: { [ITEM_TM01]: 1 }
    });
    StartUseItemAnim_ForgetMoveAndLearnTMorHM(runtime, 0, ITEM_TM01, 15, 'BackCB');

    expect(runtime.tasks[0]?.func).toBe('Task_ForgetMove');
    expect(PSA_GetNameOfMoveForgotten(runtime)).toBe('CUT');

    runUntilState(runtime, 13, 220);
    expect(runtime.operations).toContain(`PlaySE:${SE_M_SPIT_UP}`);
    expect(runtime.operations).toContain(`PSA_PrintMessage:${PSA_TEXT_FORGET_POOF}`);
    expect(runtime.operations).toContain('PSA_AfterPoof_ClearMessageWindow');
    RunPsaTask(runtime);
    expect(runtime.tasks[0]?.func).toBe('Task_MachineSet');
    expect(GetPSAStruct(runtime)?.state).toBe(0);
  });

  test('cant-evolve flow supports B cancel and normal huh-message cleanup', () => {
    const canceled = createPokemonSpecialAnimRuntime();
    StartUseItemAnim_CantEvolve(canceled, 0, ITEM_POTION, 'BackCB');
    canceled.gMain.heldKeys = B_BUTTON;
    RunPsaTask(canceled);
    expect(canceled.tasks[0]?.func).toBe('Task_CleanUp');

    const runtime = createPokemonSpecialAnimRuntime();
    StartUseItemAnim_CantEvolve(runtime, 0, ITEM_POTION, 'BackCB');
    runUntilState(runtime, 8);
    expect(runtime.operations).toContain(`PSA_PrintMessage:${PSA_TEXT_HUH}`);
    runtime.gMain.newKeys = B_BUTTON;
    RunPsaTask(runtime);
    expect(GetPSAStruct(runtime)?.state).toBe(9);
    runtime.gPaletteFade.active = false;
    RunPsaTask(runtime);
    expect(runtime.mainCallback2).toBe('BackCB');
    expect(runtime.tasks[0]).toBeNull();
  });

  test('cleanup stores cancel-disabled flag only after fade and cry constraints clear', () => {
    const runtime = createPokemonSpecialAnimRuntime();
    StartUseItemAnim_Normal(runtime, 0, ITEM_POTION, 'BackCB');
    const ptr = GetPSAStruct(runtime)!;
    ptr.cancelDisabled = true;
    ptr.field_00a4 = 1;
    runtime.tasks[0]!.func = 'Task_CleanUp';

    Task_CleanUp(runtime, 0);
    expect(ptr.state).toBe(1);

    runtime.cryFinished = false;
    runtime.gPaletteFade.active = false;
    Task_CleanUp(runtime, 0);
    expect(runtime.tasks[0]).not.toBeNull();

    runtime.cryFinished = true;
    Task_CleanUp(runtime, 0);
    expect(PSA_IsCancelDisabled(runtime)).toBe(true);
    expect(runtime.mainCallback2).toBe('BackCB');
    expect(runtime.tasks[0]).toBeNull();
  });

  test('vblank and CB2 callbacks preserve operation order', () => {
    const runtime = createPokemonSpecialAnimRuntime();

    VBlankCB_PSA(runtime);
    CB2_PSA(runtime);

    expect(runtime.operations).toEqual([
      'TransferPlttBuffer',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'RunTextPrinters',
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'UpdatePaletteFade'
    ]);
  });
});
