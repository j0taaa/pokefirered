import { describe, expect, test } from 'vitest';
import { createDialogueState } from '../src/game/interaction';
import {
  CheckObjectGraphicsInFrontOfPlayer,
  CreateFieldEffectShowMon,
  DIR_EAST,
  FLDEFF_FIELD_MOVE_SHOW_MON,
  FLDEFF_FIELD_MOVE_SHOW_MON_INIT,
  FLDEFF_USE_ROCK_SMASH,
  FieldCallback_UseRockSmash,
  FldEff_UseRockSmash,
  GAME_STAT_USED_ROCK_SMASH,
  MAP_TYPE_UNDERWATER,
  OBJ_EVENT_GFX_ROCK_SMASH_ROCK,
  SE_M_ROCK_THROW,
  SetUpFieldMove_RockSmash,
  StartRockSmashFieldEffect,
  Task_FieldEffectShowMon_Cleanup,
  Task_FieldEffectShowMon_Init,
  Task_FieldEffectShowMon_WaitFldeff,
  Task_FieldEffectShowMon_WaitPlayerAnim,
  checkObjectGraphicsInFrontOfPlayer,
  createFieldEffectShowMon,
  createFldEffRockSmashRuntime,
  doFieldEffectRockSmash,
  fieldCallbackUseRockSmash,
  fldEffUseRockSmash,
  setUpFieldMoveRockSmash,
  startRockSmashFieldEffect,
  taskFieldEffectShowMonCleanup,
  taskFieldEffectShowMonInit,
  taskFieldEffectShowMonWaitFldeff,
  taskFieldEffectShowMonWaitPlayerAnim
} from '../src/game/decompFldEffRockSmash';

describe('decomp fldeff_rocksmash.c parity', () => {
  test('exports exact C names as aliases of the implemented logic', () => {
    expect(CheckObjectGraphicsInFrontOfPlayer).toBe(checkObjectGraphicsInFrontOfPlayer);
    expect(CreateFieldEffectShowMon).toBe(createFieldEffectShowMon);
    expect(Task_FieldEffectShowMon_Init).toBe(taskFieldEffectShowMonInit);
    expect(Task_FieldEffectShowMon_WaitPlayerAnim).toBe(taskFieldEffectShowMonWaitPlayerAnim);
    expect(Task_FieldEffectShowMon_WaitFldeff).toBe(taskFieldEffectShowMonWaitFldeff);
    expect(Task_FieldEffectShowMon_Cleanup).toBe(taskFieldEffectShowMonCleanup);
    expect(SetUpFieldMove_RockSmash).toBe(setUpFieldMoveRockSmash);
    expect(FieldCallback_UseRockSmash).toBe(fieldCallbackUseRockSmash);
    expect(FldEff_UseRockSmash).toBe(fldEffUseRockSmash);
    expect(StartRockSmashFieldEffect).toBe(startRockSmashFieldEffect);
  });

  test('CheckObjectGraphicsInFrontOfPlayer records facing position and last talked object', () => {
    const runtime = createFldEffRockSmashRuntime();
    runtime.oneStepInFront = { x: 4, y: 7 };
    runtime.playerElevation = 2;
    runtime.objectEvents[0].graphicsId = OBJ_EVENT_GFX_ROCK_SMASH_ROCK;
    runtime.objectEvents[0].localId = 9;
    runtime.objectEvents[0].x = 4;
    runtime.objectEvents[0].y = 7;
    runtime.objectEvents[0].elevation = 2;

    expect(checkObjectGraphicsInFrontOfPlayer(runtime, OBJ_EVENT_GFX_ROCK_SMASH_ROCK)).toBe(true);
    expect(runtime.playerFacingPosition).toEqual({ x: 4, y: 7, elevation: 2 });
    expect(runtime.specialVarLastTalked).toBe(9);

    runtime.objectEvents[0].graphicsId = 'OBJ_EVENT_GFX_SIGN';
    expect(checkObjectGraphicsInFrontOfPlayer(runtime, OBJ_EVENT_GFX_ROCK_SMASH_ROCK)).toBe(false);
  });

  test('SetUpFieldMove_RockSmash wires menu callbacks only when the smash rock is in front', () => {
    const runtime = createFldEffRockSmashRuntime();
    runtime.objectEvents[0].graphicsId = OBJ_EVENT_GFX_ROCK_SMASH_ROCK;

    expect(setUpFieldMoveRockSmash(runtime)).toBe(true);
    expect(runtime.fieldCallback2).toBe('FieldCallback_PrepareFadeInFromMenu');
    expect(runtime.postMenuFieldCallback).toBe('FieldCallback_UseRockSmash');

    const blocked = createFldEffRockSmashRuntime();
    blocked.objectEvents[0].graphicsId = 'OBJ_EVENT_GFX_CUT_TREE';
    expect(setUpFieldMoveRockSmash(blocked)).toBe(false);
    expect(blocked.postMenuFieldCallback).toBeNull();
  });

  test('FieldCallback_UseRockSmash and FldEff_UseRockSmash preserve script args, task creation, stat, and callback data', () => {
    const runtime = createFldEffRockSmashRuntime();
    runtime.cursorSelectionMonId = 3;

    fieldCallbackUseRockSmash(runtime);
    expect(runtime.fieldEffectArguments[0]).toBe(3);
    expect(runtime.scriptsSetup).toEqual(['EventScript_FldEffRockSmash']);

    expect(fldEffUseRockSmash(runtime)).toBe(false);
    expect(runtime.tasks[0].func).toBe('Task_FieldEffectShowMon_Init');
    expect(runtime.fieldEffectFuncInData).toBe('StartRockSmashFieldEffect');
    expect(runtime.gameStats[GAME_STAT_USED_ROCK_SMASH]).toBe(1);
  });

  test('show-mon task follows player animation, field effect wait, cleanup, and Rock Smash resume path', () => {
    const runtime = createFldEffRockSmashRuntime();
    runtime.playerFacingDirection = DIR_EAST;
    runtime.objectEvents[0].graphicsId = OBJ_EVENT_GFX_ROCK_SMASH_ROCK;
    runtime.activeFieldEffects.add(FLDEFF_USE_ROCK_SMASH);
    const taskId = fldEffUseRockSmash(runtime) === false ? 0 : -1;

    taskFieldEffectShowMonInit(runtime, taskId);
    expect(runtime.playerControlsLocked).toBe(1);
    expect(runtime.playerAvatar.preventStep).toBe(true);
    expect(runtime.playerSummonMonAnims).toBe(1);
    expect(runtime.objectEvents[0].heldMovement).toBe('MOVEMENT_ACTION_START_ANIM_IN_DIRECTION');
    expect(runtime.tasks[taskId].func).toBe('Task_FieldEffectShowMon_WaitPlayerAnim');

    taskFieldEffectShowMonWaitPlayerAnim(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_FieldEffectShowMon_WaitPlayerAnim');

    runtime.objectEvents[0].heldMovementFinished = true;
    taskFieldEffectShowMonWaitPlayerAnim(runtime, taskId);
    expect(runtime.fieldEffectsStarted).toEqual([FLDEFF_FIELD_MOVE_SHOW_MON_INIT]);
    expect(runtime.tasks[taskId].func).toBe('Task_FieldEffectShowMon_WaitFldeff');

    runtime.activeFieldEffects.add(FLDEFF_FIELD_MOVE_SHOW_MON);
    taskFieldEffectShowMonWaitFldeff(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_FieldEffectShowMon_WaitFldeff');

    runtime.activeFieldEffects.delete(FLDEFF_FIELD_MOVE_SHOW_MON);
    taskFieldEffectShowMonWaitFldeff(runtime, taskId);
    expect(runtime.fieldEffectArguments[1]).toBe(DIR_EAST);
    expect(runtime.fieldEffectArguments[2]).toBe(3);
    expect(runtime.objectEvents[0].graphicsId).toBe('GetPlayerAvatarGraphicsIdByCurrentState');
    expect(runtime.sprites[0].anim).toBe(3);
    expect(runtime.fieldEffectsRemoved).toContain(FLDEFF_FIELD_MOVE_SHOW_MON);
    expect(runtime.tasks[taskId].func).toBe('Task_FieldEffectShowMon_Cleanup');

    taskFieldEffectShowMonCleanup(runtime, taskId);
    expect(runtime.sounds).toEqual([SE_M_ROCK_THROW]);
    expect(runtime.fieldEffectsRemoved).toContain(FLDEFF_USE_ROCK_SMASH);
    expect(runtime.scriptContextEnabled).toBe(1);
    expect(runtime.playerAvatar.preventStep).toBe(false);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('underwater show-mon init skips the player animation just like the C leftover path', () => {
    const runtime = createFldEffRockSmashRuntime();
    const taskId = createFieldEffectShowMon(runtime);
    runtime.mapHeader.mapType = MAP_TYPE_UNDERWATER;

    taskFieldEffectShowMonInit(runtime, taskId);

    expect(runtime.playerSummonMonAnims).toBe(0);
    expect(runtime.fieldEffectsStarted).toEqual([FLDEFF_FIELD_MOVE_SHOW_MON_INIT]);
    expect(runtime.tasks[taskId].func).toBe('Task_FieldEffectShowMon_WaitFldeff');
  });

  test('legacy browser script helper still enters the rock-smash waitstate and counts the use', () => {
    const runtime = {
      vars: {} as Record<string, number>
    };
    const dialogue = createDialogueState();
    const session = {
      rootScriptId: 'EventScript_RockSmash',
      currentLabel: 'EventScript_RockSmash',
      lineIndex: 0,
      lastTrainerId: null,
      hiddenItemFlag: null,
      loadedPointerTextLabel: null,
      callStack: [],
      waitingFor: null,
      movingLocalId: 0,
      waitingMovementLocalId: null,
      suspendedChoice: null,
      specialState: null,
      messageBoxFrame: 'std' as const,
      messageBoxAutoScroll: false
    };

    doFieldEffectRockSmash(runtime, dialogue, session);

    expect(runtime.vars['gameStat.GAME_STAT_USED_ROCK_SMASH']).toBe(1);
    expect(session.specialState).toEqual({ kind: 'rockSmashFieldEffect' });
  });
});
