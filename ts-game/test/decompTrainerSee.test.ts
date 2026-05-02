import { describe, expect, test } from 'vitest';
import {
  CheckForTrainersWantingBattle,
  CheckPathBetweenTrainerAndPlayer,
  CheckTrainer,
  CreateTask,
  DIR_EAST,
  DIR_NORTH,
  DIR_SOUTH,
  EndTrainerApproach,
  FLDEFF_EXCLAMATION_MARK_ICON,
  FLDEFF_POP_OUT_OF_ASH,
  FldEff_ExclamationMarkIcon1,
  GetTrainerApproachDistance,
  LOCALID_CAMERA,
  MOVEMENT_ACTION_FACE_DOWN,
  MOVEMENT_ACTION_FACE_PLAYER,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,
  MOVEMENT_ACTION_REVEAL_TRAINER,
  MOVEMENT_ACTION_WALK_FAST_DOWN,
  MOVEMENT_ACTION_WALK_FAST_UP,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,
  MOVEMENT_TYPE_BURIED,
  MOVEMENT_TYPE_FACE_DOWN,
  MOVEMENT_TYPE_FACE_RIGHT,
  MOVEMENT_TYPE_TREE_DISGUISE,
  OBJECT_EVENTS_COUNT,
  RunTrainerSeeTask,
  SpriteCB_TrainerIcons,
  TRAINER_BATTLE_DOUBLE,
  TRAINER_TYPE_BURIED,
  TRAINER_TYPE_NORMAL,
  Task_RevealTrainer_RunTrainerSeeFuncList,
  TrainerSeeFunc_BeginJumpOutOfAsh,
  TrainerSeeFunc_BeginRemoveDisguise,
  TrainerSeeFunc_EndJumpOutOfAsh,
  TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveDown,
  TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveUp,
  TrainerSeeFunc_OffscreenAboveTrainerCreateCameraObj,
  TrainerSeeFunc_PrepareToEngage,
  TrainerSeeFunc_StartExclMark,
  TrainerSeeFunc_TrainerApproach,
  TrainerSeeFunc_WaitExclMark,
  TrainerSeeFunc_WaitJumpOutOfAsh,
  TrainerSeeFunc_WaitRemoveDisguise,
  createTrainerSeeRuntime,
  setCollisionAtCoords,
  setCollisionFlagAtCoords
} from '../src/game/decompTrainerSee';

const makeSightTrainer = () => {
  const runtime = createTrainerSeeRuntime();
  runtime.objectEvents[0].active = true;
  runtime.objectEvents[0].spriteId = 0;
  runtime.objectEvents[1] = {
    ...runtime.objectEvents[1],
    active: true,
    trainerType: TRAINER_TYPE_NORMAL,
    trainerRange_berryTreeId: 3,
    facingDirection: DIR_SOUTH,
    currentCoords: { x: 5, y: 5 },
    rangeX: 9,
    rangeY: 8,
    movementType: MOVEMENT_TYPE_FACE_DOWN,
    localId: 11,
    mapNum: 2,
    mapGroup: 3,
    spriteId: 1
  };
  runtime.playerDestCoords = { x: 5, y: 8 };
  setCollisionAtCoords(runtime, runtime.objectEvents[1], 5, 8, DIR_SOUTH, 4);
  return runtime;
};

describe('decomp trainer_see.c parity', () => {
  test('directional trainer sight returns distance only for C-matching line/range and south capacity guard', () => {
    const runtime = makeSightTrainer();
    expect(GetTrainerApproachDistance(runtime, runtime.objectEvents[1])).toBe(3);

    const east = createTrainerSeeRuntime();
    east.objectEvents[2] = {
      ...east.objectEvents[2],
      active: true,
      trainerType: TRAINER_TYPE_NORMAL,
      trainerRange_berryTreeId: 4,
      facingDirection: DIR_EAST,
      currentCoords: { x: 1, y: 1 }
    };
    east.playerDestCoords = { x: 4, y: 1 };
    setCollisionAtCoords(east, east.objectEvents[2], 4, 1, DIR_EAST, 4);
    expect(GetTrainerApproachDistance(east, east.objectEvents[2])).toBe(3);

    const southNoObjectSlot = makeSightTrainer();
    southNoObjectSlot.objectEvents[1].trainerRange_berryTreeId = 4;
    southNoObjectSlot.playerDestCoords = { x: 5, y: 9 };
    southNoObjectSlot.firstInactiveObjectEventId = OBJECT_EVENTS_COUNT;
    setCollisionAtCoords(southNoObjectSlot, southNoObjectSlot.objectEvents[1], 5, 9, DIR_SOUTH, 4);
    expect(GetTrainerApproachDistance(southNoObjectSlot, southNoObjectSlot.objectEvents[1])).toBe(0);
  });

  test('buried trainers scan south, north, west, east and path check preserves range while applying collision mask', () => {
    const runtime = createTrainerSeeRuntime();
    runtime.objectEvents[2] = {
      ...runtime.objectEvents[2],
      active: true,
      trainerType: TRAINER_TYPE_BURIED,
      trainerRange_berryTreeId: 6,
      currentCoords: { x: 10, y: 10 },
      rangeX: 7,
      rangeY: 6
    };
    runtime.playerDestCoords = { x: 10, y: 8 };
    setCollisionFlagAtCoords(runtime, runtime.objectEvents[2], 10, 10, DIR_NORTH, 1);
    setCollisionFlagAtCoords(runtime, runtime.objectEvents[2], 10, 9, DIR_NORTH, 0);
    setCollisionAtCoords(runtime, runtime.objectEvents[2], 10, 8, DIR_NORTH, 4);

    expect(GetTrainerApproachDistance(runtime, runtime.objectEvents[2])).toBe(2);
    expect(runtime.objectEvents[2].rangeX).toBe(7);
    expect(runtime.objectEvents[2].rangeY).toBe(6);

    setCollisionFlagAtCoords(runtime, runtime.objectEvents[2], 10, 9, DIR_NORTH, 2);
    expect(CheckPathBetweenTrainerAndPlayer(runtime, runtime.objectEvents[2], 2, DIR_NORTH)).toBe(0);
  });

  test('trainer check honors disabled sight, trainer flags, double battle party state, and starts approach task with distance minus one', () => {
    const disabled = makeSightTrainer();
    disabled.trainerSightDisabled = true;
    expect(CheckForTrainersWantingBattle(disabled)).toBe(false);

    const flagged = makeSightTrainer();
    flagged.trainerFlags.add(1);
    expect(CheckTrainer(flagged, 1)).toBe(false);

    const doubleBattle = makeSightTrainer();
    doubleBattle.scriptsByObjectEventId.set(1, [0, TRAINER_BATTLE_DOUBLE]);
    doubleBattle.getMonsStateToDoubles = true;
    expect(CheckTrainer(doubleBattle, 1)).toBe(false);

    const runtime = makeSightTrainer();
    runtime.scriptsByObjectEventId.set(1, [0, 0, 42]);
    expect(CheckForTrainersWantingBattle(runtime)).toBe(true);
    expect(runtime.configuredBattles).toEqual([{ trainerObjId: 1, script: [0, 0, 42] }]);
    expect(runtime.tasks[0]?.func).toBe('Task_RunTrainerSeeFuncList');
    expect(runtime.tasks[0]?.data[1]).toBe(1);
    expect(runtime.tasks[0]?.data[3]).toBe(2);
  });

  test('main trainer-see task runs exclamation, approach, engage, and followup transitions in the same C slot order', () => {
    const runtime = makeSightTrainer();
    const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
    const task = runtime.tasks[taskId]!;
    task.data[0] = 1;
    task.data[1] = 1;
    task.data[3] = 1;
    task.followupFunc = 'Task_DestroyTrainerApproachTask';

    RunTrainerSeeTask(runtime, taskId);
    expect(task.data[0]).toBe(2);
    expect(runtime.activeFieldEffects.has(FLDEFF_EXCLAMATION_MARK_ICON)).toBe(true);
    expect(runtime.objectEvents[1].heldMovement).toBe(MOVEMENT_ACTION_FACE_DOWN);

    runtime.activeFieldEffects.delete(FLDEFF_EXCLAMATION_MARK_ICON);
    runtime.objectEvents[1].heldMovementFinished = true;
    RunTrainerSeeTask(runtime, taskId);
    expect(task.data[0]).toBe(3);
    expect(runtime.objectEvents[1].heldMovement).toBe(MOVEMENT_ACTION_WALK_NORMAL_DOWN);
    expect(task.data[3]).toBe(0);

    runtime.objectEvents[1].heldMovementFinished = true;
    RunTrainerSeeTask(runtime, taskId);
    expect(task.data[0]).toBe(4);
    expect(runtime.objectEvents[1].heldMovement).toBe(MOVEMENT_ACTION_FACE_PLAYER);

    runtime.objectEvents[1].heldMovementFinished = true;
    RunTrainerSeeTask(runtime, taskId);
    expect(task.data[0]).toBe(5);
    expect(runtime.objectEvents[1].movementType).toBe(MOVEMENT_TYPE_FACE_DOWN);
    expect(runtime.playerForcedMovementCanceled).toBe(true);

    RunTrainerSeeTask(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_DestroyTrainerApproachTask');
  });

  test('individual trainer-see funcs preserve branch targets for offscreen, disguise, and ash flows', () => {
    const runtime = makeSightTrainer();
    const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
    const task = runtime.tasks[taskId]!;
    const trainer = runtime.objectEvents[1];

    task.data[0] = 1;
    task.data[3] = 3;
    expect(TrainerSeeFunc_StartExclMark(runtime, taskId, task, trainer)).toBe(true);
    expect(task.data[0]).toBe(12);

    task.data[0] = 2;
    trainer.movementType = MOVEMENT_TYPE_TREE_DISGUISE;
    expect(TrainerSeeFunc_WaitExclMark(runtime, taskId, task, trainer)).toBe(true);
    expect(task.data[0]).toBe(6);

    expect(TrainerSeeFunc_BeginRemoveDisguise(runtime, taskId, task, trainer)).toBe(false);
    expect(trainer.heldMovement).toBe(MOVEMENT_ACTION_REVEAL_TRAINER);
    trainer.heldMovementFinished = true;
    expect(TrainerSeeFunc_WaitRemoveDisguise(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(3);

    task.data[0] = 2;
    trainer.movementType = MOVEMENT_TYPE_BURIED;
    expect(TrainerSeeFunc_WaitExclMark(runtime, taskId, task, trainer)).toBe(true);
    expect(task.data[0]).toBe(8);

    trainer.heldMovementFinished = true;
    task.data[0] = 9;
    expect(TrainerSeeFunc_BeginJumpOutOfAsh(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(10);
    expect(runtime.activeFieldEffects.has(FLDEFF_POP_OUT_OF_ASH)).toBe(true);

    runtime.sprites[task.data[4]].animCmdIndex = 2;
    expect(TrainerSeeFunc_WaitJumpOutOfAsh(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(11);
    expect(trainer.fixedPriority).toBe(false);
    expect(trainer.triggerGroundEffectsOnMove).toBe(true);
    expect(trainer.heldMovement).toBe(MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN);

    runtime.activeFieldEffects.delete(FLDEFF_POP_OUT_OF_ASH);
    expect(TrainerSeeFunc_EndJumpOutOfAsh(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(3);
  });

  test('prepare-to-engage waits on unfinished trainer/player movement before changing movement type and canceling player movement', () => {
    const runtime = makeSightTrainer();
    const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
    const task = runtime.tasks[taskId]!;
    const trainer = runtime.objectEvents[1];
    trainer.facingDirection = DIR_EAST;
    trainer.movementOverridden = true;
    trainer.heldMovementFinished = false;

    expect(TrainerSeeFunc_PrepareToEngage(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(0);

    trainer.heldMovementFinished = true;
    runtime.objectEvents[0].movementOverridden = true;
    runtime.objectEvents[0].heldMovementFinished = false;
    expect(TrainerSeeFunc_PrepareToEngage(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(0);

    runtime.objectEvents[0].heldMovementFinished = true;
    expect(TrainerSeeFunc_PrepareToEngage(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[0]).toBe(1);
    expect(trainer.movementType).toBe(MOVEMENT_TYPE_FACE_RIGHT);
    expect(trainer.templateCoords).toEqual(trainer.currentCoords);
    expect(runtime.playerForcedMovementCanceled).toBe(true);
  });

  test('offscreen-above trainer camera object scrolls up, starts exclamation, scrolls down, and restores player camera', () => {
    const runtime = makeSightTrainer();
    runtime.saveBlock1.pos = { x: 20, y: 30 };
    runtime.saveBlock1.location = { mapNum: 4, mapGroup: 5 };
    runtime.objectEvents[2].active = false;
    const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
    const task = runtime.tasks[taskId]!;
    const trainer = runtime.objectEvents[1];
    trainer.mapNum = 4;
    trainer.mapGroup = 5;
    task.data[3] = 3;

    expect(TrainerSeeFunc_OffscreenAboveTrainerCreateCameraObj(runtime, taskId, task, trainer)).toBe(false);
    const camera = runtime.objectEvents.find((objectEvent) => objectEvent.active && objectEvent.localId === LOCALID_CAMERA)!;
    expect(camera.currentCoords).toEqual({ x: 27, y: 37 });
    expect(camera.invisible).toBe(true);
    expect(runtime.followedObjectId).toBe(camera.spriteId);
    expect(task.data[0]).toBe(1);

    expect(TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveUp(runtime, taskId, task, trainer)).toBe(false);
    expect(camera.heldMovement).toBe(MOVEMENT_ACTION_WALK_FAST_UP);
    expect(task.data[5]).toBe(1);
    camera.heldMovementFinished = true;
    TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveUp(runtime, taskId, task, trainer);
    expect(task.data[5]).toBe(2);
    camera.heldMovementFinished = true;
    TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveUp(runtime, taskId, task, trainer);
    expect(runtime.activeFieldEffects.has(FLDEFF_EXCLAMATION_MARK_ICON)).toBe(true);
    expect(task.data[0]).toBe(2);

    runtime.activeFieldEffects.delete(FLDEFF_EXCLAMATION_MARK_ICON);
    camera.heldMovementFinished = true;
    TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveDown(runtime, taskId, task, trainer);
    expect(camera.heldMovement).toBe(MOVEMENT_ACTION_WALK_FAST_DOWN);
    camera.heldMovementFinished = true;
    TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveDown(runtime, taskId, task, trainer);
    camera.heldMovementFinished = true;
    TrainerSeeFunc_OffscreenAboveTrainerCameraObjMoveDown(runtime, taskId, task, trainer);
    expect(camera.active).toBe(false);
    expect(runtime.followedObjectId).toBe(runtime.objectEvents[runtime.playerAvatar.objectEventId].spriteId);
    expect(task.data[0]).toBe(2);
  });

  test('reveal trainer task clears held movement once, advances ash funcs, then destroys itself after pop ash is inactive', () => {
    const runtime = makeSightTrainer();
    const trainer = runtime.objectEvents[1];
    trainer.heldMovement = MOVEMENT_ACTION_FACE_PLAYER;
    trainer.movementOverridden = true;
    trainer.heldMovementFinished = false;

    const taskId = CreateTask(runtime, 'Task_RevealTrainer_RunTrainerSeeFuncList', 0);
    const task = runtime.tasks[taskId]!;
    task.data[1] = 1;

    Task_RevealTrainer_RunTrainerSeeFuncList(runtime, taskId);
    expect(task.data[7]).toBe(1);
    expect(trainer.heldMovementFinished).toBe(false);

    trainer.heldMovementFinished = true;
    Task_RevealTrainer_RunTrainerSeeFuncList(runtime, taskId);
    expect(task.data[0]).toBe(2);

    runtime.sprites[task.data[4]].animCmdIndex = 2;
    Task_RevealTrainer_RunTrainerSeeFuncList(runtime, taskId);
    expect(task.data[0]).toBe(3);

    runtime.activeFieldEffects.delete(FLDEFF_POP_OUT_OF_ASH);
    Task_RevealTrainer_RunTrainerSeeFuncList(runtime, taskId);
    expect(runtime.tasks[taskId]).toBeNull();
  });

  test('EndTrainerApproach restarts trainer task at func 1 and followup destroys task while enabling script context', () => {
    const runtime = makeSightTrainer();
    const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
    const task = runtime.tasks[taskId]!;
    task.data[1] = 1;
    task.data[3] = 0;

    EndTrainerApproach(runtime);
    expect(task.data[0]).toBe(2);
    expect(task.followupFunc).toBe('Task_DestroyTrainerApproachTask');

    runtime.activeFieldEffects.delete(FLDEFF_EXCLAMATION_MARK_ICON);
    runtime.objectEvents[1].heldMovementFinished = true;
    RunTrainerSeeTask(runtime, taskId);
    runtime.objectEvents[1].heldMovementFinished = true;
    RunTrainerSeeTask(runtime, taskId);
    RunTrainerSeeTask(runtime, taskId);
    RunTrainerSeeTask(runtime, taskId);
    expect(runtime.tasks[taskId]).toBeNull();
    expect(runtime.scriptContextEnabled).toBe(true);
  });

  test('trainer icon field effect copies field effect args, animates upward arc, and stops when target is gone or animation ended', () => {
    const runtime = createTrainerSeeRuntime();
    runtime.objectEvents[4] = {
      ...runtime.objectEvents[4],
      active: true,
      localId: 9,
      mapNum: 8,
      mapGroup: 7,
      spriteId: 10
    };
    runtime.sprites[10].x = 100;
    runtime.sprites[10].y = 80;
    runtime.sprites[10].x2 = 3;
    runtime.sprites[10].y2 = 4;
    runtime.fieldEffectArguments[0] = 9;
    runtime.fieldEffectArguments[1] = 8;
    runtime.fieldEffectArguments[2] = 7;
    runtime.activeFieldEffects.add(FLDEFF_EXCLAMATION_MARK_ICON);

    expect(FldEff_ExclamationMarkIcon1(runtime)).toBe(0);
    const icon = runtime.sprites[0];
    expect(icon.oam.priority).toBe(1);
    expect(icon.coordOffsetEnabled).toBe(1);
    expect(icon.data.slice(0, 4)).toEqual([9, 8, 7, -5]);
    expect(icon.data[7]).toBe(FLDEFF_EXCLAMATION_MARK_ICON);
    expect(icon.animNum).toBe(0);
    expect(icon.subpriority).toBe(0x53);

    SpriteCB_TrainerIcons(runtime, icon);
    expect(icon.x).toBe(100);
    expect(icon.y).toBe(64);
    expect(icon.x2).toBe(3);
    expect(icon.y2).toBe(-1);
    expect(icon.data[3]).toBe(-4);
    expect(icon.data[4]).toBe(-5);

    icon.animEnded = true;
    SpriteCB_TrainerIcons(runtime, icon);
    expect(icon.stoppedFieldEffectId).toBe(FLDEFF_EXCLAMATION_MARK_ICON);
    expect(runtime.activeFieldEffects.has(FLDEFF_EXCLAMATION_MARK_ICON)).toBe(false);
  });

  test('trainer approach waits when movement is overridden and unfinished', () => {
    const runtime = makeSightTrainer();
    const taskId = CreateTask(runtime, 'Task_RunTrainerSeeFuncList', 80);
    const task = runtime.tasks[taskId]!;
    task.data[3] = 2;
    const trainer = runtime.objectEvents[1];
    trainer.movementOverridden = true;
    trainer.heldMovementFinished = false;

    expect(TrainerSeeFunc_TrainerApproach(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[3]).toBe(2);
    expect(trainer.heldMovement).toBeNull();

    trainer.heldMovementFinished = true;
    expect(TrainerSeeFunc_TrainerApproach(runtime, taskId, task, trainer)).toBe(false);
    expect(task.data[3]).toBe(1);
    expect(trainer.heldMovement).toBe(MOVEMENT_ACTION_WALK_NORMAL_DOWN);
  });
});
