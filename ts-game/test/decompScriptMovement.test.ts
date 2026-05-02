import { describe, expect, test } from 'vitest';
import {
  ClearMovementScriptFinished,
  GetMovementScript,
  GetMovementScriptIdFromObjectEventId,
  GetMoveObjectsTaskId,
  IsMovementScriptFinished,
  LoadObjectEventIdFromMovementScript,
  LoadObjectEventIdPtrFromMovementScript,
  MOVEMENT_ACTION_STEP_END,
  OBJECT_EVENTS_COUNT,
  ScriptMovement_AddNewMovement,
  ScriptMovement_IsObjectMovementFinished,
  ScriptMovement_MoveObjects,
  ScriptMovement_StartMoveObjects,
  ScriptMovement_StartObjectMovementScript,
  ScriptMovement_TakeStep,
  ScriptMovement_TryAddNewMovement,
  ScriptMovement_UnfreezeActiveObjects,
  ScriptMovement_UnfreezeObjectEvents,
  SetMovementScript,
  SetMovementScriptFinished,
  SetObjectEventIdAtMovementScript,
  TAIL_SENTINEL,
  clearMovementScriptFinished,
  createMovementObjectEvent,
  createScriptMovementRuntime,
  getHeldMovementDurationFrames,
  getMovementScript,
  getMovementScriptIdFromObjectEventId,
  getMoveObjectsTaskId,
  isMovementScriptFinished,
  loadObjectEventIdFromMovementScript,
  loadObjectEventIdPtrFromMovementScript,
  scriptMovementIsObjectMovementFinished,
  scriptMovementMoveObjects,
  scriptMovementStartMoveObjects,
  scriptMovementStartObjectMovementScript,
  scriptMovementTakeStep,
  scriptMovementTryAddNewMovement,
  scriptMovementUnfreezeObjectEvents,
  setMovementScriptFinished,
  setObjectEventIdAtMovementScript
} from '../src/game/decompScriptMovement';

describe('decompScriptMovement', () => {
  test('exact C function names are exported as callable script movement routines', () => {
    expect(typeof ScriptMovement_StartObjectMovementScript).toBe('function');
    expect(typeof ScriptMovement_IsObjectMovementFinished).toBe('function');
    expect(typeof ScriptMovement_UnfreezeObjectEvents).toBe('function');
    expect(typeof ScriptMovement_StartMoveObjects).toBe('function');
    expect(typeof GetMoveObjectsTaskId).toBe('function');
    expect(typeof ScriptMovement_TryAddNewMovement).toBe('function');
    expect(typeof GetMovementScriptIdFromObjectEventId).toBe('function');
    expect(typeof LoadObjectEventIdPtrFromMovementScript).toBe('function');
    expect(typeof SetObjectEventIdAtMovementScript).toBe('function');
    expect(typeof LoadObjectEventIdFromMovementScript).toBe('function');
    expect(typeof ClearMovementScriptFinished).toBe('function');
    expect(typeof SetMovementScriptFinished).toBe('function');
    expect(typeof IsMovementScriptFinished).toBe('function');
    expect(typeof SetMovementScript).toBe('function');
    expect(GetMovementScript).toBe(getMovementScript);
    expect(typeof ScriptMovement_AddNewMovement).toBe('function');
    expect(typeof ScriptMovement_UnfreezeActiveObjects).toBe('function');
    expect(typeof ScriptMovement_MoveObjects).toBe('function');
    expect(typeof ScriptMovement_TakeStep).toBe('function');
  });

  test('LoadObjectEventIdPtrFromMovementScript exposes a pointer-like byte slot', () => {
    const runtime = createScriptMovementRuntime();
    const taskId = scriptMovementStartMoveObjects(runtime, 50);
    const ptr = loadObjectEventIdPtrFromMovementScript(runtime, taskId, 3);

    expect(ptr.value).toBe(0xff);
    ptr.value = 7;
    expect(loadObjectEventIdFromMovementScript(runtime, taskId, 3)).toBe(7);
    setObjectEventIdAtMovementScript(runtime, taskId, 3, 8);
    expect(ptr.value).toBe(8);
  });

  test('start object movement creates task, reserves player slot, and adds movement only through player slot', () => {
    const runtime = createScriptMovementRuntime();
    runtime.objectEvents[0] = createMovementObjectEvent(0, 1, 2, 3);

    expect(scriptMovementStartObjectMovementScript(runtime, 9, 2, 3, [1])).toBe(true);
    const taskId = scriptMovementStartMoveObjects(runtime, 50);
    expect(runtime.tasks[taskId].data.slice(1)).toEqual(Array.from({ length: 15 }, () => -1));

    expect(scriptMovementTryAddNewMovement(runtime, taskId, 0, [4, MOVEMENT_ACTION_STEP_END])).toBe(false);
    expect(getMovementScriptIdFromObjectEventId(runtime, taskId, 0)).toBe(0);
    expect(getMovementScriptIdFromObjectEventId(runtime, taskId, 9)).toBe(OBJECT_EVENTS_COUNT);
  });

  test('try add returns true if existing movement is still running, otherwise replaces finished script', () => {
    const runtime = createScriptMovementRuntime();
    runtime.objectEvents[0] = createMovementObjectEvent(0, 1);
    const taskId = scriptMovementStartMoveObjects(runtime, 50);
    scriptMovementTryAddNewMovement(runtime, taskId, 0, [1]);
    expect(scriptMovementTryAddNewMovement(runtime, taskId, 0, [2])).toBe(true);
    setMovementScriptFinished(runtime, taskId, 0);
    expect(scriptMovementTryAddNewMovement(runtime, taskId, 0, [2])).toBe(false);
    expect(runtime.movementScripts[0]).toEqual([2]);
    expect(isMovementScriptFinished(runtime, taskId, 0)).toBe(false);
  });

  test('take step waits on active held movement, advances successful movements, and freezes on step end', () => {
    const runtime = createScriptMovementRuntime();
    runtime.objectEvents[0] = createMovementObjectEvent(0, 1);
    const taskId = scriptMovementStartMoveObjects(runtime, 50);
    runtime.tasks[taskId].data[1] = 0;
    runtime.movementScripts[0] = [7, MOVEMENT_ACTION_STEP_END];

    runtime.objectEvents[0].heldMovementActive = true;
    runtime.objectEvents[0].heldMovementRemainingFrames = 2;
    runtime.objectEvents[0].clearHeldMovementIfFinishedResult = false;
    scriptMovementTakeStep(runtime, taskId, 0, 0);
    expect(runtime.objectEvents[0].heldMovements).toEqual([]);

    runtime.objectEvents[0].clearHeldMovementIfFinishedResult = true;
    scriptMovementTakeStep(runtime, taskId, 0, 0);
    expect(runtime.objectEvents[0].heldMovements).toEqual([]);
    expect(runtime.movementScriptOffsets[0]).toBe(0);

    scriptMovementTakeStep(runtime, taskId, 0, 0);
    expect(runtime.objectEvents[0].heldMovements).toEqual([7]);
    expect(runtime.movementScriptOffsets[0]).toBe(1);

    runtime.objectEvents[0].heldMovementActive = false;
    scriptMovementTakeStep(runtime, taskId, 0, 0);
    expect(isMovementScriptFinished(runtime, taskId, 0)).toBe(true);
    expect(runtime.objectEvents[0].frozen).toBe(true);

    runtime.objectEvents[0].frozen = false;
    scriptMovementTakeStep(runtime, taskId, 0, 0);
    expect(runtime.objectEvents[0].frozen).toBe(false);
  });

  test('held movement durations mirror decomp step speed and delay families', () => {
    expect(getHeldMovementDurationFrames(0x00)).toBe(1);
    expect(getHeldMovementDurationFrames(0x08)).toBe(31);
    expect(getHeldMovementDurationFrames(0x0c)).toBe(23);
    expect(getHeldMovementDurationFrames(0x10)).toBe(16);
    expect(getHeldMovementDurationFrames(0x1c)).toBe(16);
    expect(getHeldMovementDurationFrames(0x31)).toBe(6);
    expect(getHeldMovementDurationFrames(0x35)).toBe(4);
    expect(getHeldMovementDurationFrames(0x39)).toBe(2);
    expect(getHeldMovementDurationFrames(0x41)).toBe(11);
    expect(getHeldMovementDurationFrames(0x9b)).toBe(160);
  });

  test('move objects, is finished, clear finished, and unfreeze paths mirror task data scanning', () => {
    const runtime = createScriptMovementRuntime();
    runtime.objectEvents[0] = createMovementObjectEvent(0, 1, 0, 0);
    runtime.objectEvents[1] = createMovementObjectEvent(1, 2, 0, 0);
    const taskId = scriptMovementStartMoveObjects(runtime, 50);
    setObjectEventIdAtMovementScript(runtime, taskId, 0, 0);
    setObjectEventIdAtMovementScript(runtime, taskId, 1, 1);
    runtime.movementScripts[0] = [1, MOVEMENT_ACTION_STEP_END];
    runtime.movementScripts[1] = [MOVEMENT_ACTION_STEP_END];

    scriptMovementMoveObjects(runtime, taskId);
    expect(runtime.objectEvents[0].heldMovements).toEqual([1]);
    expect(runtime.objectEvents[1].frozen).toBe(true);
    expect(scriptMovementIsObjectMovementFinished(runtime, 2, 0, 0)).toBe(true);
    clearMovementScriptFinished(runtime, taskId, 1);
    expect(scriptMovementIsObjectMovementFinished(runtime, 2, 0, 0)).toBe(false);
    expect(scriptMovementIsObjectMovementFinished(runtime, 9, 0, 0)).toBe(true);

    scriptMovementUnfreezeObjectEvents(runtime);
    expect(runtime.objectEvents[1].frozen).toBe(false);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(getMoveObjectsTaskId(runtime)).toBe(TAIL_SENTINEL);
  });
});
