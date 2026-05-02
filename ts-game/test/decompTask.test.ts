import { describe, expect, test } from 'vitest';
import {
  CreateTask,
  DestroyTask,
  FindFirstActiveTask,
  FindTaskIdByFunc,
  FuncIsActiveTask,
  GetTaskCount,
  GetWordTaskArg,
  HEAD_SENTINEL,
  ResetTasks,
  RunTasks,
  SetTaskFuncWithFollowupFunc,
  SetWordTaskArg,
  SwitchTaskToFollowupFunc,
  TaskDummy,
  NUM_TASKS,
  TAIL_SENTINEL,
  createTask,
  createTaskRuntime,
  destroyTask,
  findTaskIdByFunc,
  funcIsActiveTask,
  getTaskCount,
  getWordTaskArg,
  registerTaskCallback,
  resetTasks,
  runTasks,
  setTaskFuncWithFollowupFunc,
  setWordTaskArg,
  switchTaskToFollowupFunc
} from '../src/game/decompTask';

describe('decompTask', () => {
  test('ResetTasks initializes inactive linked free list fields exactly like C', () => {
    const runtime = createTaskRuntime();
    resetTasks(runtime);

    expect(runtime.tasks[0]).toMatchObject({
      isActive: false,
      func: 'TaskDummy',
      prev: HEAD_SENTINEL,
      next: 1,
      priority: -1
    });
    expect(runtime.tasks[NUM_TASKS - 1].next).toBe(TAIL_SENTINEL);
    expect(runtime.tasks.every((task) => task.data.every((value) => value === 0))).toBe(true);
  });

  test('CreateTask inserts active tasks by ascending priority and appends equal priority', () => {
    const runtime = createTaskRuntime();
    const low = createTask(runtime, 'low', 10);
    const high = createTask(runtime, 'high', 1);
    const equal = createTask(runtime, 'equal', 10);

    expect([low, high, equal]).toEqual([0, 1, 2]);
    expect(runtime.tasks[high]).toMatchObject({ prev: HEAD_SENTINEL, next: low });
    expect(runtime.tasks[low]).toMatchObject({ prev: high, next: equal });
    expect(runtime.tasks[equal]).toMatchObject({ prev: low, next: TAIL_SENTINEL });
  });

  test('DestroyTask unlinks head, tail, and middle active tasks without clearing task data', () => {
    const runtime = createTaskRuntime();
    const a = createTask(runtime, 'a', 1);
    const b = createTask(runtime, 'b', 2);
    const c = createTask(runtime, 'c', 3);
    runtime.tasks[b].data[0] = 99;

    destroyTask(runtime, b);
    expect(runtime.tasks[a].next).toBe(c);
    expect(runtime.tasks[c].prev).toBe(a);
    expect(runtime.tasks[b]).toMatchObject({ isActive: false, data: expect.arrayContaining([99]) });

    destroyTask(runtime, a);
    expect(runtime.tasks[c].prev).toBe(HEAD_SENTINEL);
    destroyTask(runtime, c);
    expect(getTaskCount(runtime)).toBe(0);
  });

  test('RunTasks follows linked order and utility functions match active task lookup behavior', () => {
    const runtime = createTaskRuntime();
    createTask(runtime, 'late', 9);
    createTask(runtime, 'early', 1);
    registerTaskCallback(runtime, 'early', (taskId) => runtime.tasks[taskId].data[0]++);
    registerTaskCallback(runtime, 'late', (taskId) => runtime.tasks[taskId].data[0]++);

    runTasks(runtime);

    expect(runtime.ranTaskIds).toEqual([1, 0]);
    expect(funcIsActiveTask(runtime, 'early')).toBe(true);
    expect(findTaskIdByFunc(runtime, 'late')).toBe(0);
    expect(findTaskIdByFunc(runtime, 'missing')).toBe(0xff);
    expect(getTaskCount(runtime)).toBe(2);
  });

  test('followup functions and word task args are stored as two halfwords', () => {
    const runtime = createTaskRuntime();
    const taskId = createTask(runtime, 'initial', 0);

    setTaskFuncWithFollowupFunc(runtime, taskId, 'middle', 'followup');
    expect(runtime.tasks[taskId].func).toBe('middle');
    expect(runtime.tasks[taskId].data[14]).toBeGreaterThan(0);
    switchTaskToFollowupFunc(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('followup');

    setWordTaskArg(runtime, taskId, 2, 0x89abcdef);
    expect(runtime.tasks[taskId].data[2]).toBe(0xcdef);
    expect(runtime.tasks[taskId].data[3]).toBe(0x89ab);
    expect(getWordTaskArg(runtime, taskId, 2)).toBe(0x89abcdef);
    setWordTaskArg(runtime, taskId, 15, 0xffffffff);
    expect(getWordTaskArg(runtime, taskId, 15)).toBe(0);
  });

  test('exact C-name task exports preserve linked scheduling, followups, lookup, and word args', () => {
    const runtime = createTaskRuntime();
    ResetTasks(runtime);

    const late = CreateTask(runtime, 'late', 8);
    const early = CreateTask(runtime, 'early', 1);
    expect([late, early]).toEqual([0, 1]);
    expect(FindFirstActiveTask(runtime)).toBe(early);
    expect(runtime.tasks[early]).toMatchObject({ prev: HEAD_SENTINEL, next: late });
    expect(runtime.tasks[late]).toMatchObject({ prev: early, next: TAIL_SENTINEL });

    registerTaskCallback(runtime, 'early', (taskId) => runtime.tasks[taskId].data[0] += 1);
    registerTaskCallback(runtime, 'late', (taskId) => runtime.tasks[taskId].data[0] += 2);
    RunTasks(runtime);
    expect(runtime.ranTaskIds).toEqual([early, late]);
    expect(runtime.tasks[early].data[0]).toBe(1);
    expect(runtime.tasks[late].data[0]).toBe(2);

    expect(FuncIsActiveTask(runtime, 'late')).toBe(true);
    expect(FindTaskIdByFunc(runtime, 'late')).toBe(late);
    expect(GetTaskCount(runtime)).toBe(2);

    SetTaskFuncWithFollowupFunc(runtime, early, 'middle', 'followup');
    expect(runtime.tasks[early].func).toBe('middle');
    SwitchTaskToFollowupFunc(runtime, early);
    expect(runtime.tasks[early].func).toBe('followup');

    SetWordTaskArg(runtime, early, 4, 0x76543210);
    expect(runtime.tasks[early].data[4]).toBe(0x3210);
    expect(runtime.tasks[early].data[5]).toBe(0x7654);
    expect(GetWordTaskArg(runtime, early, 4)).toBe(0x76543210);

    TaskDummy(early);
    DestroyTask(runtime, early);
    expect(runtime.tasks[late].prev).toBe(HEAD_SENTINEL);
    DestroyTask(runtime, late);
    expect(GetTaskCount(runtime)).toBe(0);
  });
});
