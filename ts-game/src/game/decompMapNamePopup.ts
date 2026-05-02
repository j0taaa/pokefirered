export const FLOOR_ROOFTOP = 127;
export const TASK_NONE = 0xff;
export const FLAG_DONT_SHOW_MAP_NAME_POPUP = 'FLAG_DONT_SHOW_MAP_NAME_POPUP';

export interface MapNamePopupTask {
  active: boolean;
  data: number[];
}

export interface MapNamePopupWindow {
  id: number;
  width: number;
  height: number;
  paletteIntoFadedBuffer: boolean;
  tileNum: number;
  text: string;
  cleared: boolean;
  removed: boolean;
}

export interface MapNamePopupRuntime {
  flags: Set<string>;
  questLogPlayback: boolean;
  tasks: MapNamePopupTask[];
  windows: MapNamePopupWindow[];
  bg0x: number;
  bg0y: number;
  bg0vofs: number;
  dmaBusy: boolean;
  regionMapSectionId: number;
  floorNum: number;
  mapNames: Record<number, string>;
  operations: string[];
}

export const createMapNamePopupRuntime = (overrides: Partial<MapNamePopupRuntime> = {}): MapNamePopupRuntime => ({
  flags: new Set(),
  questLogPlayback: false,
  tasks: [],
  windows: [],
  bg0x: 0,
  bg0y: 0,
  bg0vofs: 0,
  dmaBusy: false,
  regionMapSectionId: 0,
  floorNum: 0,
  mapNames: {},
  operations: [],
  ...overrides
});

const tState = 0;
const tTimer = 1;
const tPos = 2;
const tReshow = 3;
const tWindowId = 4;
const tWindowExists = 5;
const tWindowCleared = 6;
const tWindowDestroyed = 7;
const tPalIntoFadedBuffer = 8;

const findTaskId = (runtime: MapNamePopupRuntime): number => {
  const index = runtime.tasks.findIndex((task) => task.active);
  return index < 0 ? TASK_NONE : index;
};

const createTask = (runtime: MapNamePopupRuntime): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({ active: true, data: Array(16).fill(0) });
  runtime.operations.push(`CreateTask:Task_MapNamePopup:${taskId}`);
  return taskId;
};

export const MapNamePopupAppendFloorNum = (dest: string, floorNum: number): string => {
  if (floorNum === 0) return dest;
  if (floorNum === FLOOR_ROOFTOP) return `${dest} ROOFTOP`;
  if (floorNum < 0) return `${dest} B${Math.abs(floorNum)}F`;
  return `${dest} ${floorNum}F`;
};

export function MapNamePopupPrintMapNameOnWindow(runtime: MapNamePopupRuntime, windowId: number): void {
  const window = runtime.windows[windowId];
  if (!window) return;
  const baseName = runtime.mapNames[runtime.regionMapSectionId] ?? `MAP_${runtime.regionMapSectionId}`;
  window.text = MapNamePopupAppendFloorNum(baseName, runtime.floorNum);
  runtime.operations.push(`MapNamePopupPrintMapNameOnWindow:${windowId}:${window.text}`);
}

export function MapNamePopupCreateWindow(runtime: MapNamePopupRuntime, palIntoFadedBuffer: boolean): number {
  let width = 14;
  let tileNum = 0x01d;
  if (runtime.floorNum !== 0) {
    if (runtime.floorNum !== FLOOR_ROOFTOP) {
      width += 5;
      tileNum = 0x027;
    } else {
      width += 8;
      tileNum = 0x02d;
    }
  }
  const windowId = runtime.windows.length;
  runtime.windows.push({
    id: windowId,
    width,
    height: 2,
    paletteIntoFadedBuffer: palIntoFadedBuffer,
    tileNum,
    text: '',
    cleared: false,
    removed: false
  });
  runtime.operations.push(`AddWindow:${windowId}`, palIntoFadedBuffer ? 'LoadPalette:faded' : 'CpuCopy16:unfaded', `LoadStdWindowTiles:${windowId}:${tileNum}`, `DrawTextBorderOuter:${windowId}:${tileNum}:13`, `PutWindowTilemap:${windowId}`);
  MapNamePopupPrintMapNameOnWindow(runtime, windowId);
  runtime.operations.push(`CopyWindowToVram:${windowId}:COPYWIN_FULL`);
  return windowId;
}

export function ShowMapNamePopup(runtime: MapNamePopupRuntime, palIntoFadedBuffer: boolean): void {
  if (runtime.flags.has(FLAG_DONT_SHOW_MAP_NAME_POPUP) || runtime.questLogPlayback) return;
  let taskId = findTaskId(runtime);
  if (taskId === TASK_NONE) {
    taskId = createTask(runtime);
    runtime.bg0x = 0;
    runtime.bg0y = -0x1081;
    const task = runtime.tasks[taskId];
    task.data[tState] = 0;
    task.data[tPos] = 0;
    task.data[tPalIntoFadedBuffer] = palIntoFadedBuffer ? 1 : 0;
  } else {
    const task = runtime.tasks[taskId];
    if (task.data[tState] !== 4) task.data[tState] = 4;
    task.data[tReshow] = 1;
  }
}

export function Task_MapNamePopup(runtime: MapNamePopupRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task?.active) return;
  const data = task.data;
  switch (data[tState]) {
    case 0:
      data[tWindowId] = MapNamePopupCreateWindow(runtime, data[tPalIntoFadedBuffer] !== 0);
      data[tWindowExists] = 1;
      data[tState] = 1;
      break;
    case 1:
      if (runtime.dmaBusy) break;
      data[tState] = 2;
    // fallthrough
    case 2:
      data[tPos] -= 2;
      if (data[tPos] <= -24) {
        data[tState] = 3;
        data[tTimer] = 0;
      }
      break;
    case 3:
      data[tTimer] += 1;
      if (data[tTimer] > 120) {
        data[tTimer] = 0;
        data[tState] = 4;
      }
      break;
    case 4:
      data[tPos] += 2;
      if (data[tPos] >= 0) {
        if (data[tReshow]) {
          MapNamePopupPrintMapNameOnWindow(runtime, data[tWindowId]);
          runtime.operations.push(`CopyWindowToVram:${data[tWindowId]}:COPYWIN_GFX`);
          data[tState] = 1;
          data[tReshow] = 0;
        } else {
          data[tState] = 6;
          return;
        }
      }
      break;
    case 5:
      break;
    case 6:
      if (data[tWindowExists] && !data[tWindowCleared]) {
        runtime.windows[data[tWindowId]].cleared = true;
        runtime.operations.push(`rbox_fill_rectangle:${data[tWindowId]}`, `CopyWindowToVram:${data[tWindowId]}:COPYWIN_MAP`);
        data[tWindowCleared] = 1;
      }
      data[tState] = 7;
      return;
    case 7:
      if (!runtime.dmaBusy) {
        if (data[tWindowExists]) {
          runtime.windows[data[tWindowId]].removed = true;
          data[tWindowExists] = 0;
          data[tWindowDestroyed] = 1;
        }
        data[tState] = 8;
        runtime.bg0y = 0;
      }
      return;
    case 8:
      task.active = false;
      runtime.operations.push(`DestroyTask:${taskId}`);
      return;
  }
  runtime.bg0vofs = data[tPos];
}

export function DismissMapNamePopup(runtime: MapNamePopupRuntime): void {
  const taskId = findTaskId(runtime);
  if (taskId !== TASK_NONE && runtime.tasks[taskId].data[tState] < 6) runtime.tasks[taskId].data[tState] = 6;
}

export function IsMapNamePopupTaskActive(runtime: MapNamePopupRuntime): boolean {
  return findTaskId(runtime) !== TASK_NONE;
}
