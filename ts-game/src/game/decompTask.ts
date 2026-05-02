export const HEAD_SENTINEL = 0xfe;
export const TAIL_SENTINEL = 0xff;
export const TASK_NONE = TAIL_SENTINEL;
export const NUM_TASKS = 16;
export const NUM_TASK_DATA = 16;

export type TaskFunc = string;

export interface DecompTask {
  func: TaskFunc;
  isActive: boolean;
  prev: number;
  next: number;
  priority: number;
  data: number[];
}

export interface TaskRuntime {
  tasks: DecompTask[];
  callbacks: Record<TaskFunc, (taskId: number) => void>;
  functionPointers: Map<TaskFunc, number>;
  pointerFunctions: Map<number, TaskFunc>;
  nextFunctionPointer: number;
  ranTaskIds: number[];
}

export const createTaskRuntime = (): TaskRuntime => {
  const runtime: TaskRuntime = {
    tasks: [],
    callbacks: {},
    functionPointers: new Map(),
    pointerFunctions: new Map(),
    nextFunctionPointer: 1,
    ranTaskIds: []
  };
  resetTasks(runtime);
  return runtime;
};

const emptyData = (): number[] => Array.from({ length: NUM_TASK_DATA }, () => 0);

export const resetTasks = (runtime: TaskRuntime): void => {
  runtime.tasks = [];
  for (let i = 0; i < NUM_TASKS; i += 1) {
    runtime.tasks.push({
      isActive: false,
      func: 'TaskDummy',
      prev: i,
      next: i + 1,
      priority: -1,
      data: emptyData()
    });
  }
  runtime.tasks[0].prev = HEAD_SENTINEL;
  runtime.tasks[NUM_TASKS - 1].next = TAIL_SENTINEL;
};

export const registerTaskCallback = (
  runtime: TaskRuntime,
  func: TaskFunc,
  callback: (taskId: number) => void
): void => {
  runtime.callbacks[func] = callback;
};

const getFunctionPointer = (runtime: TaskRuntime, func: TaskFunc): number => {
  const existing = runtime.functionPointers.get(func);
  if (existing !== undefined) {
    return existing;
  }
  const pointer = runtime.nextFunctionPointer;
  runtime.nextFunctionPointer += 1;
  runtime.functionPointers.set(func, pointer);
  runtime.pointerFunctions.set(pointer, func);
  return pointer;
};

const insertTask = (runtime: TaskRuntime, newTaskId: number): void => {
  let taskId = findFirstActiveTask(runtime);

  if (taskId === NUM_TASKS) {
    runtime.tasks[newTaskId].prev = HEAD_SENTINEL;
    runtime.tasks[newTaskId].next = TAIL_SENTINEL;
    return;
  }

  for (;;) {
    if (runtime.tasks[newTaskId].priority < runtime.tasks[taskId].priority) {
      runtime.tasks[newTaskId].prev = runtime.tasks[taskId].prev;
      runtime.tasks[newTaskId].next = taskId;
      if (runtime.tasks[taskId].prev !== HEAD_SENTINEL) {
        runtime.tasks[runtime.tasks[taskId].prev].next = newTaskId;
      }
      runtime.tasks[taskId].prev = newTaskId;
      return;
    }
    if (runtime.tasks[taskId].next === TAIL_SENTINEL) {
      runtime.tasks[newTaskId].prev = taskId;
      runtime.tasks[newTaskId].next = runtime.tasks[taskId].next;
      runtime.tasks[taskId].next = newTaskId;
      return;
    }
    taskId = runtime.tasks[taskId].next;
  }
};

export const createTask = (
  runtime: TaskRuntime,
  func: TaskFunc,
  priority: number
): number => {
  for (let i = 0; i < NUM_TASKS; i += 1) {
    if (!runtime.tasks[i].isActive) {
      runtime.tasks[i].func = func;
      runtime.tasks[i].priority = priority & 0xff;
      insertTask(runtime, i);
      runtime.tasks[i].data = emptyData();
      runtime.tasks[i].isActive = true;
      return i;
    }
  }
  return 0;
};

export const destroyTask = (runtime: TaskRuntime, taskId: number): void => {
  if (taskId >= NUM_TASKS) {
    return;
  }
  const task = runtime.tasks[taskId];
  if (task.isActive) {
    task.isActive = false;
    if (task.prev === HEAD_SENTINEL) {
      if (task.next !== TAIL_SENTINEL) {
        runtime.tasks[task.next].prev = HEAD_SENTINEL;
      }
    } else if (task.next === TAIL_SENTINEL) {
      runtime.tasks[task.prev].next = TAIL_SENTINEL;
    } else {
      runtime.tasks[task.prev].next = task.next;
      runtime.tasks[task.next].prev = task.prev;
    }
  }
};

export const runTasks = (runtime: TaskRuntime): void => {
  let taskId = findFirstActiveTask(runtime);
  if (taskId !== NUM_TASKS) {
    do {
      runtime.ranTaskIds.push(taskId);
      const callback = runtime.callbacks[runtime.tasks[taskId].func] ?? taskDummy;
      callback(taskId);
      taskId = runtime.tasks[taskId].next;
    } while (taskId !== TAIL_SENTINEL);
  }
};

export const findFirstActiveTask = (runtime: TaskRuntime): number => {
  for (let taskId = 0; taskId < NUM_TASKS; taskId += 1) {
    if (runtime.tasks[taskId].isActive === true && runtime.tasks[taskId].prev === HEAD_SENTINEL) {
      return taskId;
    }
  }
  return NUM_TASKS;
};

export const taskDummy = (_taskId: number): void => {};

export const setTaskFuncWithFollowupFunc = (
  runtime: TaskRuntime,
  taskId: number,
  func: TaskFunc,
  followupFunc: TaskFunc
): void => {
  const followupFuncIndex = NUM_TASK_DATA - 2;
  const pointer = getFunctionPointer(runtime, followupFunc);
  runtime.tasks[taskId].data[followupFuncIndex] = pointer & 0xffff;
  runtime.tasks[taskId].data[followupFuncIndex + 1] = (pointer >>> 16) & 0xffff;
  runtime.tasks[taskId].func = func;
};

export const switchTaskToFollowupFunc = (
  runtime: TaskRuntime,
  taskId: number
): void => {
  const followupFuncIndex = NUM_TASK_DATA - 2;
  const pointer =
    (runtime.tasks[taskId].data[followupFuncIndex] & 0xffff) |
    ((runtime.tasks[taskId].data[followupFuncIndex + 1] & 0xffff) << 16);
  runtime.tasks[taskId].func = runtime.pointerFunctions.get(pointer) ?? 'TaskDummy';
};

export const funcIsActiveTask = (
  runtime: TaskRuntime,
  func: TaskFunc
): boolean => runtime.tasks.some((task) => task.isActive === true && task.func === func);

export const findTaskIdByFunc = (
  runtime: TaskRuntime,
  func: TaskFunc
): number => {
  for (let i = 0; i < NUM_TASKS; i += 1) {
    if (runtime.tasks[i].isActive === true && runtime.tasks[i].func === func) {
      return i;
    }
  }
  return 0xff;
};

export const getTaskCount = (runtime: TaskRuntime): number =>
  runtime.tasks.reduce((count, task) => count + (task.isActive === true ? 1 : 0), 0);

export const setWordTaskArg = (
  runtime: TaskRuntime,
  taskId: number,
  dataElem: number,
  value: number
): void => {
  if (dataElem <= 14) {
    runtime.tasks[taskId].data[dataElem] = value & 0xffff;
    runtime.tasks[taskId].data[dataElem + 1] = (value >>> 16) & 0xffff;
  }
};

export const getWordTaskArg = (
  runtime: TaskRuntime,
  taskId: number,
  dataElem: number
): number => {
  if (dataElem <= 14) {
    return (
      (runtime.tasks[taskId].data[dataElem] & 0xffff) |
      ((runtime.tasks[taskId].data[dataElem + 1] & 0xffff) << 16)
    ) >>> 0;
  }
  return 0;
};

export function ResetTasks(runtime: TaskRuntime): void {
  resetTasks(runtime);
}

export function CreateTask(runtime: TaskRuntime, func: TaskFunc, priority: number): number {
  return createTask(runtime, func, priority);
}

export function InsertTask(runtime: TaskRuntime, newTaskId: number): void {
  insertTask(runtime, newTaskId);
}

export function DestroyTask(runtime: TaskRuntime, taskId: number): void {
  destroyTask(runtime, taskId);
}

export function RunTasks(runtime: TaskRuntime): void {
  runTasks(runtime);
}

export function FindFirstActiveTask(runtime: TaskRuntime): number {
  return findFirstActiveTask(runtime);
}

export function TaskDummy(taskId: number): void {
  taskDummy(taskId);
}

export function SetTaskFuncWithFollowupFunc(
  runtime: TaskRuntime,
  taskId: number,
  func: TaskFunc,
  followupFunc: TaskFunc
): void {
  setTaskFuncWithFollowupFunc(runtime, taskId, func, followupFunc);
}

export function SwitchTaskToFollowupFunc(runtime: TaskRuntime, taskId: number): void {
  switchTaskToFollowupFunc(runtime, taskId);
}

export function FuncIsActiveTask(runtime: TaskRuntime, func: TaskFunc): boolean {
  return funcIsActiveTask(runtime, func);
}

export function FindTaskIdByFunc(runtime: TaskRuntime, func: TaskFunc): number {
  return findTaskIdByFunc(runtime, func);
}

export function GetTaskCount(runtime: TaskRuntime): number {
  return getTaskCount(runtime);
}

export function SetWordTaskArg(
  runtime: TaskRuntime,
  taskId: number,
  dataElem: number,
  value: number
): void {
  setWordTaskArg(runtime, taskId, dataElem, value);
}

export function GetWordTaskArg(runtime: TaskRuntime, taskId: number, dataElem: number): number {
  return getWordTaskArg(runtime, taskId, dataElem);
}
