export const SE_FIELD_POISON = 'SE_FIELD_POISON';
export const BG_MOSAIC_SET = 'BG_MOSAIC_SET';

export interface FldEffPoisonTask {
  id: number;
  data: number[];
  destroyed: boolean;
  func: 'Task_FieldPoisonEffect';
  priority: number;
}

export interface FldEffPoisonRuntime {
  tasks: FldEffPoisonTask[];
  operations: string[];
  revision: number;
  bgMosaic: number;
}

export const createFldEffPoisonRuntime = (overrides: Partial<FldEffPoisonRuntime> = {}): FldEffPoisonRuntime => ({
  tasks: [],
  operations: [],
  revision: 0,
  bgMosaic: 0,
  ...overrides
});

const CreateTask = (runtime: FldEffPoisonRuntime, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, data: [0, 0], destroyed: false, func: 'Task_FieldPoisonEffect', priority });
  runtime.operations.push(`CreateTask:Task_FieldPoisonEffect:${priority}`);
  return id;
};

const DestroyTask = (runtime: FldEffPoisonRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
};

const AdjustBgMosaic = (runtime: FldEffPoisonRuntime, value: number, mode: string): void => {
  runtime.bgMosaic = value & 0xff;
  runtime.operations.push(`AdjustBgMosaic:${runtime.bgMosaic}:${mode}`);
};

export function Task_FieldPoisonEffect(runtime: FldEffPoisonRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  const data = task.data;
  switch (data[0]) {
    case 0:
      data[1] += runtime.revision >= 0xa ? 2 : 1;
      if (data[1] > 4) data[0] += 1;
      break;
    case 1:
      data[1] -= 1;
      if (data[1] === 0) data[0] += 1;
      break;
    case 2:
      DestroyTask(runtime, taskId);
      return;
  }
  AdjustBgMosaic(runtime, ((data[1] & 0xff) << 4) | (data[1] & 0xff), BG_MOSAIC_SET);
}

export function FldEffPoison_Start(runtime: FldEffPoisonRuntime): void {
  runtime.operations.push(`PlaySE:${SE_FIELD_POISON}`);
  CreateTask(runtime, 80);
}

export function FldEffPoison_IsActive(runtime: FldEffPoisonRuntime): boolean {
  return runtime.tasks.some((task) => !task.destroyed && task.func === 'Task_FieldPoisonEffect');
}
