import { describe, expect, test } from 'vitest';
import {
  FLDEFF_USE_VS_SEEKER,
  FLAG_SYS_GAME_CLEAR,
  FLAG_SYS_VS_SEEKER_CHARGING,
  FLAG_WORLD_MAP_FUCHSIA_CITY,
  GetNextAvailableRematchTrainer,
  GetRandomFaceDirectionMovementType,
  GetRematchTrainerId,
  GetRematchTrainerIdGivenGameState,
  GetRunningBehaviorFromGraphicsId,
  GetTrainerFlagFromScript,
  GetVsSeekerResponseInArea,
  ITEM_VS_SEEKER,
  IsTrainerReadyForRematch,
  LOCALID_PLAYER,
  LookupVsSeekerOpponentInArray,
  MAX_REMATCH_PARTIES,
  MOVEMENT_TYPE_FACE_DOWN,
  MOVEMENT_TYPE_FACE_LEFT,
  MOVEMENT_TYPE_FACE_RIGHT,
  MOVEMENT_TYPE_FACE_UP,
  MOVEMENT_TYPE_RAISE_HAND_AND_JUMP,
  MOVEMENT_TYPE_RAISE_HAND_AND_STOP,
  MOVEMENT_TYPE_RAISE_HAND_AND_SWIM,
  NO_REMATCH_LOCALID,
  ObjectEventIdIsSane,
  SKIP,
  TRAINER_NONE,
  TRAINER_TYPE_NORMAL,
  Task_ResetObjectsRematchWantedState,
  Task_VsSeeker_0,
  Task_VsSeeker_1,
  Task_VsSeeker_2,
  Task_VsSeeker_3,
  TryGetRematchTrainerIdGivenGameState,
  UpdateVsSeekerStepCounter,
  VSSEEKER_CAN_USE,
  VSSEEKER_NOT_CHARGED,
  VSSEEKER_NO_ONE_IN_RANGE,
  VSSEEKER_RESPONSE_FOUND_REMATCHES,
  VSSEEKER_RESPONSE_NO_RESPONSE,
  VSSEEKER_RESPONSE_UNFOUGHT_TRAINERS,
  VsSeekerResetObjectMovementAfterChargeComplete,
  VsSeekerSetStepCounterFullyCharged,
  CanUseVsSeeker,
  ClearAllTrainerRematchStates,
  ClearRematchStateByTrainerId,
  ClearRematchStateOfLastTalked,
  GatherNearbyTrainerInfo,
  MapResetTrainerRematches,
  ResetMovementOfRematchableTrainers,
  ShouldTryRematchBattle,
  StartAllRespondantIdleMovements,
  createVsSeekerRuntime,
  movementConst,
  objectGfxConst,
  sMovementScript_TrainerNoRematch,
  sMovementScript_TrainerRematch,
  sMovementScript_TrainerUnfought,
  sMovementScript_Wait48,
  sRematches,
  tickVsSeekerTask,
  trainerConst,
  type VsSeekerRuntime,
  type VsSeekerTaskFunc
} from '../src/game/decompVsSeeker';

describe('decomp vs seeker', () => {
  test('parses rematch and movement data directly from vs_seeker.c', () => {
    expect(sRematches).toHaveLength(221);
    expect(sRematches[0]).toEqual({
      trainerIdxs: [
        trainerConst('TRAINER_YOUNGSTER_BEN'),
        trainerConst('TRAINER_YOUNGSTER_BEN_2'),
        SKIP,
        trainerConst('TRAINER_YOUNGSTER_BEN_3'),
        trainerConst('TRAINER_YOUNGSTER_BEN_4'),
        TRAINER_NONE
      ],
      map: 'MAP_ROUTE3'
    });
    expect(sRematches[2].trainerIdxs).toEqual([
      trainerConst('TRAINER_BUG_CATCHER_COLTON'),
      trainerConst('TRAINER_BUG_CATCHER_COLTON_2'),
      SKIP,
      trainerConst('TRAINER_BUG_CATCHER_COLTON_3'),
      SKIP,
      trainerConst('TRAINER_BUG_CATCHER_COLTON_4')
    ]);
    expect(sMovementScript_Wait48).toEqual([
      movementConst('MOVEMENT_ACTION_DELAY_16'),
      movementConst('MOVEMENT_ACTION_DELAY_16'),
      movementConst('MOVEMENT_ACTION_DELAY_16'),
      movementConst('MOVEMENT_ACTION_STEP_END')
    ]);
    expect(sMovementScript_TrainerUnfought).toEqual([movementConst('MOVEMENT_ACTION_EMOTE_EXCLAMATION_MARK'), movementConst('MOVEMENT_ACTION_STEP_END')]);
    expect(sMovementScript_TrainerNoRematch).toEqual([movementConst('MOVEMENT_ACTION_EMOTE_X'), movementConst('MOVEMENT_ACTION_STEP_END')]);
    expect(sMovementScript_TrainerRematch).toEqual([movementConst('MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN'), movementConst('MOVEMENT_ACTION_EMOTE_DOUBLE_EXCL_MARK'), movementConst('MOVEMENT_ACTION_STEP_END')]);
    expect(MAX_REMATCH_PARTIES).toBe(6);
    expect(LOCALID_PLAYER).toBe(NO_REMATCH_LOCALID);
  });

  test('updates packed bag and charging step counters with C bit masking', () => {
    const runtime = createVsSeekerRuntime();
    expect(UpdateVsSeekerStepCounter(runtime)).toBe(false);
    expect(runtime.trainerRematchStepCounter).toBe(0);

    runtime.bagItems.set(ITEM_VS_SEEKER, 1);
    runtime.trainerRematchStepCounter = 99;
    expect(UpdateVsSeekerStepCounter(runtime)).toBe(false);
    expect(runtime.trainerRematchStepCounter).toBe(100);
    expect(UpdateVsSeekerStepCounter(runtime)).toBe(false);
    expect(runtime.trainerRematchStepCounter).toBe(100);

    runtime.flags.add(FLAG_SYS_VS_SEEKER_CHARGING);
    runtime.trainerRematches[7] = 3;
    runtime.trainerRematchStepCounter = 99 << 8;
    expect(UpdateVsSeekerStepCounter(runtime)).toBe(true);
    expect(runtime.flags.has(FLAG_SYS_VS_SEEKER_CHARGING)).toBe(false);
    expect(runtime.trainerRematchStepCounter).toBe(1);
    expect(runtime.trainerRematches[7]).toBe(0);
  });

  test('checks usability through charge state and visible trainer scan', () => {
    const runtime = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    runtime.trainerRematchStepCounter = 42;
    GatherNearbyTrainerInfo(runtime);
    expect(CanUseVsSeeker(runtime)).toBe(VSSEEKER_NOT_CHARGED);
    expect(runtime.stringVars[0]).toBe('58');

    runtime.trainerRematchStepCounter = 100;
    expect(CanUseVsSeeker(runtime)).toBe(VSSEEKER_CAN_USE);

    runtime.objectEvents[0].active = false;
    expect(CanUseVsSeeker(runtime)).toBe(VSSEEKER_NO_ONE_IN_RANGE);
  });

  test('runs item-use tasks through not-charged, charged, field-effect, and closeout branches', () => {
    const notCharged = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    const notChargedTask = pushTask(notCharged, 'Task_VsSeeker_0');
    notCharged.trainerRematchStepCounter = 10;
    Task_VsSeeker_0(notCharged, notChargedTask);
    expect(notCharged.sVsSeeker).toBeNull();
    expect(notCharged.tasks[notChargedTask].func).toBe('Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker');
    expect(notCharged.operations).toContain('DisplayItemMessageOnField:0:FONT_NORMAL:VSSeeker_Text_BatteryNotChargedNeedXSteps:Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker');

    const runtime = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    runtime.trainerRematchStepCounter = 100;
    runtime.foughtTrainers.add(trainerConst('TRAINER_YOUNGSTER_BEN'));
    runtime.randomValues = [70];
    const taskId = pushTask(runtime, 'Task_VsSeeker_0');
    Task_VsSeeker_0(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_VsSeeker_1');
    expect(runtime.tasks[taskId].data[0]).toBe(15);
    expect(runtime.fieldEffects.has(FLDEFF_USE_VS_SEEKER)).toBe(true);

    for (let i = 0; i < 15; i += 1) Task_VsSeeker_1(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_VsSeeker_2');
    runtime.fieldEffects.delete(FLDEFF_USE_VS_SEEKER);
    Task_VsSeeker_2(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_VsSeeker_3');
    expect(runtime.sVsSeeker?.responseCode).toBe(VSSEEKER_RESPONSE_FOUND_REMATCHES);
    expect(runtime.operations).toContain(`ScriptMovement_StartObjectMovementScript:${NO_REMATCH_LOCALID}:0:0:${sMovementScript_Wait48.join(',')}`);

    Task_VsSeeker_3(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.sVsSeeker).toBeNull();
  });

  test('calculates area responses for unfought, no-rematch, random no, and random yes trainers', () => {
    const unfought = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    GatherNearbyTrainerInfo(unfought);
    expect(GetVsSeekerResponseInArea(unfought, sRematches)).toBe(VSSEEKER_RESPONSE_UNFOUGHT_TRAINERS);
    expect(unfought.sVsSeeker?.trainerHasNotYetBeenFought).toBe(true);
    expect(unfought.operations).toContain(`ScriptMovement_StartObjectMovementScript:1:0:0:${sMovementScript_TrainerUnfought.join(',')}`);

    const randomNo = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    randomNo.foughtTrainers.add(trainerConst('TRAINER_YOUNGSTER_BEN'));
    randomNo.randomValues = [29];
    GatherNearbyTrainerInfo(randomNo);
    expect(GetVsSeekerResponseInArea(randomNo, sRematches)).toBe(VSSEEKER_RESPONSE_NO_RESPONSE);
    expect(randomNo.sVsSeeker?.trainerDoesNotWantRematch).toBe(true);
    expect(randomNo.operations).toContain(`ScriptMovement_StartObjectMovementScript:1:0:0:${sMovementScript_TrainerNoRematch.join(',')}`);

    const randomYes = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    randomYes.foughtTrainers.add(trainerConst('TRAINER_YOUNGSTER_BEN'));
    randomYes.randomValues = [30];
    GatherNearbyTrainerInfo(randomYes);
    expect(GetVsSeekerResponseInArea(randomYes, sRematches)).toBe(VSSEEKER_RESPONSE_FOUND_REMATCHES);
    expect(randomYes.trainerRematches[1]).toBe(1);
    expect(randomYes.objectEvents[0].shiftedStillCoords).toBe(true);
    expect(randomYes.flags.has(FLAG_SYS_VS_SEEKER_CHARGING)).toBe(true);

    const maxed = makeRuntimeWithTrainer(1, trainerConst('TRAINER_RIVAL_OAKS_LAB_BULBASAUR'));
    maxed.foughtTrainers.add(trainerConst('TRAINER_RIVAL_OAKS_LAB_BULBASAUR'));
    GatherNearbyTrainerInfo(maxed);
    expect(GetVsSeekerResponseInArea(maxed, sRematches)).toBe(VSSEEKER_RESPONSE_NO_RESPONSE);
  });

  test('looks up rematch ids and gates them by story flags exactly like the C helpers', () => {
    const runtime = createVsSeekerRuntime();
    const ben = trainerConst('TRAINER_YOUNGSTER_BEN');
    const ben2 = trainerConst('TRAINER_YOUNGSTER_BEN_2');
    const ben3 = trainerConst('TRAINER_YOUNGSTER_BEN_3');
    const ben4 = trainerConst('TRAINER_YOUNGSTER_BEN_4');
    const idx = { value: 0 };

    runtime.foughtTrainers.add(ben);
    expect(GetNextAvailableRematchTrainer(runtime, sRematches, ben, idx)).toBe(1);
    expect(idx.value).toBe(0);
    runtime.foughtTrainers.add(ben2);
    expect(GetNextAvailableRematchTrainer(runtime, sRematches, ben, idx)).toBe(3);

    expect(GetRematchTrainerIdGivenGameState([ben, ben2, SKIP, ben3, ben4, 0], 4)).toBe(3);
    const rematchIdx = { value: 3 };
    TryGetRematchTrainerIdGivenGameState(runtime, [ben, ben2, SKIP, ben3, ben4, 0], rematchIdx);
    expect(rematchIdx.value).toBe(1);
    runtime.flags.add(FLAG_WORLD_MAP_FUCHSIA_CITY);
    const rematchIdxAllowed = { value: 3 };
    TryGetRematchTrainerIdGivenGameState(runtime, [ben, ben2, SKIP, ben3, ben4, 0], rematchIdxAllowed);
    expect(rematchIdxAllowed.value).toBe(3);

    const noProgress = createVsSeekerRuntime();
    noProgress.foughtTrainers.add(ben);
    noProgress.foughtTrainers.add(ben2);
    expect(GetRematchTrainerId(noProgress, ben)).toBe(ben2);
    runtime.flags.add(FLAG_WORLD_MAP_FUCHSIA_CITY);
    expect(GetRematchTrainerId(runtime, ben)).toBe(ben3);
    runtime.foughtTrainers.add(ben3);
    runtime.flags.add(FLAG_SYS_GAME_CLEAR);
    expect(GetRematchTrainerId(runtime, ben)).toBe(ben4);
    expect(LookupVsSeekerOpponentInArray(sRematches, trainerConst('TRAINER_BUG_CATCHER_COLTON_4'))).toBe(2);
  });

  test('mirrors rematch battle predicates and clear-state side effects', () => {
    const runtime = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    runtime.trainerBattleOpponentA = trainerConst('TRAINER_YOUNGSTER_BEN');
    runtime.specialVarLastTalked = 1;
    expect(ShouldTryRematchBattle(runtime)).toBe(false);

    runtime.foughtTrainers.add(trainerConst('TRAINER_YOUNGSTER_BEN'));
    expect(ShouldTryRematchBattle(runtime)).toBe(true);

    runtime.trainerRematches[1] = 2;
    expect(IsTrainerReadyForRematch(runtime)).toBe(true);
    ClearRematchStateOfLastTalked(runtime);
    expect(runtime.trainerRematches[1]).toBe(0);
    expect(runtime.operations).toContain('SetBattledTrainerFlag');

    runtime.trainerRematches[1] = 2;
    runtime.selectedObjectEvent = 0;
    runtime.randomValues = [1];
    ClearRematchStateByTrainerId(runtime);
    expect(runtime.trainerRematches[1]).toBe(0);
    expect(runtime.objectEvents[0].movementType).toBe(MOVEMENT_TYPE_FACE_DOWN);
  });

  test('resets movement, freezes after charging, and dispatches task ticks', () => {
    const runtime = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    runtime.objectEvents[0].movementType = MOVEMENT_TYPE_RAISE_HAND_AND_JUMP;
    runtime.randomValues = [2, 3, 0];
    ResetMovementOfRematchableTrainers(runtime);
    expect(runtime.objectEvents[0].movementType).toBe(MOVEMENT_TYPE_FACE_LEFT);
    expect(runtime.sprites[0].x2).toBe(0);

    runtime.objectEventTemplates[0].movementType = MOVEMENT_TYPE_RAISE_HAND_AND_JUMP;
    VsSeekerResetObjectMovementAfterChargeComplete(runtime);
    expect(runtime.objectEventTemplates[0].movementType).toBe(MOVEMENT_TYPE_FACE_RIGHT);

    const taskId = pushTask(runtime, 'Task_ResetObjectsRematchWantedState');
    Task_ResetObjectsRematchWantedState(runtime, taskId);
    expect(runtime.objectEvents[0].frozen).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    const tickTaskId = pushTask(runtime, 'Task_VsSeeker_1');
    runtime.tasks[tickTaskId].data[0] = 1;
    tickVsSeekerTask(runtime, tickTaskId);
    expect(runtime.tasks[tickTaskId].func).toBe('Task_VsSeeker_2');

    runtime.trainerRematches[1] = 9;
    runtime.flags.add(FLAG_SYS_VS_SEEKER_CHARGING);
    MapResetTrainerRematches(runtime, 0, 0);
    expect(runtime.trainerRematches[1]).toBe(0);
    expect(runtime.flags.has(FLAG_SYS_VS_SEEKER_CHARGING)).toBe(false);
  });

  test('keeps object visibility, script flag, graphics behavior, and random direction helpers exact', () => {
    const runtime = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    expect(GetTrainerFlagFromScript(runtime.objectEventTemplates[0].script)).toBe(trainerConst('TRAINER_YOUNGSTER_BEN'));
    expect(ObjectEventIdIsSane(runtime, 0)).toBe(true);
    runtime.sprites[0].data[0] = 7;
    expect(ObjectEventIdIsSane(runtime, 0)).toBe(false);

    expect(GetRunningBehaviorFromGraphicsId(objectGfxConst('OBJ_EVENT_GFX_YOUNGSTER'))).toBe(MOVEMENT_TYPE_RAISE_HAND_AND_JUMP);
    expect(GetRunningBehaviorFromGraphicsId(objectGfxConst('OBJ_EVENT_GFX_SWIMMER_M_WATER'))).toBe(MOVEMENT_TYPE_RAISE_HAND_AND_SWIM);
    expect(GetRunningBehaviorFromGraphicsId(objectGfxConst('OBJ_EVENT_GFX_CLERK'))).toBe(MOVEMENT_TYPE_RAISE_HAND_AND_STOP);

    runtime.randomValues = [0, 1, 2, 3];
    expect(GetRandomFaceDirectionMovementType(runtime)).toBe(MOVEMENT_TYPE_FACE_UP);
    expect(GetRandomFaceDirectionMovementType(runtime)).toBe(MOVEMENT_TYPE_FACE_DOWN);
    expect(GetRandomFaceDirectionMovementType(runtime)).toBe(MOVEMENT_TYPE_FACE_LEFT);
    expect(GetRandomFaceDirectionMovementType(runtime)).toBe(MOVEMENT_TYPE_FACE_RIGHT);

    VsSeekerSetStepCounterFullyCharged(runtime);
    expect((runtime.trainerRematchStepCounter >> 8) & 0xff).toBe(100);
    ClearAllTrainerRematchStates(runtime);
    expect(runtime.trainerRematches.every((value) => value === 0)).toBe(true);
  });

  test('starts respondent idle movements for matching trainer entries', () => {
    const runtime = makeRuntimeWithTrainer(1, trainerConst('TRAINER_YOUNGSTER_BEN'));
    runtime.foughtTrainers.add(trainerConst('TRAINER_YOUNGSTER_BEN'));
    GatherNearbyTrainerInfo(runtime);
    const vsSeeker = runtime.sVsSeeker!;
    vsSeeker.numRematchableTrainers = 1;
    vsSeeker.trainerIdxArray[0] = trainerConst('TRAINER_YOUNGSTER_BEN');
    vsSeeker.runningBehaviourEtcArray[0] = MOVEMENT_TYPE_RAISE_HAND_AND_JUMP;

    StartAllRespondantIdleMovements(runtime);
    expect(runtime.objectEvents[0].movementType).toBe(MOVEMENT_TYPE_RAISE_HAND_AND_JUMP);
    expect(runtime.trainerRematches[1]).toBe(1);
  });
});

function pushTask(runtime: VsSeekerRuntime, func: VsSeekerTaskFunc): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
}

function makeRuntimeWithTrainer(localId: number, trainerId: number): VsSeekerRuntime {
  const runtime = createVsSeekerRuntime();
  runtime.objectEventCount = 1;
  runtime.objectEventTemplates.push({
    localId,
    trainerType: TRAINER_TYPE_NORMAL,
    movementType: MOVEMENT_TYPE_FACE_DOWN,
    script: trainerScript(trainerId),
    graphicsId: objectGfxConst('OBJ_EVENT_GFX_YOUNGSTER')
  });
  runtime.objectEvents[0] = {
    active: true,
    localId,
    spriteId: 0,
    singleMovementActive: false,
    currentCoords: { x: 7, y: 7 },
    movementType: MOVEMENT_TYPE_FACE_DOWN,
    facingDirection: 1,
    frozen: false,
    shiftedStillCoords: false
  };
  runtime.sprites[0] = { data: [0], x2: 4, y2: 5 };
  runtime.sVsSeeker = null;
  return runtime;
}

function trainerScript(trainerId: number): number[] {
  return [0x5c, 0, trainerId & 0xff, trainerId >> 8];
}
