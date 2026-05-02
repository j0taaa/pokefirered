export const FLOOR_ROOFTOP = 127;
export const WIN_PAL_NUM = 13;
export const TASK_NONE = 0xff;
export const COPYWIN_MAP = 1;
export const COPYWIN_GFX = 2;
export const COPYWIN_FULL = 3;
export const FONT_NORMAL = 2;
export const TEXT_SKIP_DRAW = 0xff;
export const CHAR_SPACE = ' ';
export const CHAR_B = 'B';
export const CHAR_F = 'F';

export interface MapNamePopupTask {
  data: number[];
  destroyed: boolean;
}

export interface MapNamePopupRuntime {
  flagDontShowMapNamePopup: boolean;
  questLogPlaybackState: boolean;
  tasks: MapNamePopupTask[];
  bgXChanges: Array<{ bg: number; value: number; op: number }>;
  bgYChanges: Array<{ bg: number; value: number; op: number }>;
  gpuRegBG0VOFS: number[];
  dma3Busy: boolean;
  nextWindowId: number;
  windows: Array<{
    id: number;
    template: {
      bg: number;
      tilemapLeft: number;
      tilemapTop: number;
      width: number;
      height: number;
      paletteNum: number;
      baseBlock: number;
    };
    removed: boolean;
  }>;
  mapHeader: {
    floorNum: number;
    regionMapSectionId: number;
  };
  mapNames: Record<number, string>;
  loadedPaletteIntoFaded: boolean[];
  copiedPaletteIntoUnfaded: boolean[];
  loadedStdWindowTiles: Array<{ windowId: number; tileNum: number }>;
  drawnTextBorders: Array<{ windowId: number; tileNum: number; palNum: number }>;
  putWindowTilemaps: number[];
  printedText: Array<{ windowId: number; text: string; x: number; y: number; speed: number }>;
  filledWindows: number[];
  copiedWindows: Array<{ windowId: number; mode: number }>;
  rboxFilled: number[];
}

export const createMapNamePopupRuntime = (): MapNamePopupRuntime => ({
  flagDontShowMapNamePopup: false,
  questLogPlaybackState: false,
  tasks: [],
  bgXChanges: [],
  bgYChanges: [],
  gpuRegBG0VOFS: [],
  dma3Busy: false,
  nextWindowId: 0,
  windows: [],
  mapHeader: {
    floorNum: 0,
    regionMapSectionId: 0
  },
  mapNames: {
    0: 'PALLET TOWN'
  },
  loadedPaletteIntoFaded: [],
  copiedPaletteIntoUnfaded: [],
  loadedStdWindowTiles: [],
  drawnTextBorders: [],
  putWindowTilemaps: [],
  printedText: [],
  filledWindows: [],
  copiedWindows: [],
  rboxFilled: []
});

const findTaskIdByFunc = (runtime: MapNamePopupRuntime): number =>
  runtime.tasks.findIndex((task) => !task.destroyed);

const createTask = (runtime: MapNamePopupRuntime): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    data: Array.from({ length: 16 }, () => 0),
    destroyed: false
  });
  return taskId;
};

export const showMapNamePopup = (
  runtime: MapNamePopupRuntime,
  palIntoFadedBuffer: boolean
): void => {
  if (runtime.flagDontShowMapNamePopup !== true && !runtime.questLogPlaybackState) {
    let taskId = findTaskIdByFunc(runtime);
    if (taskId === -1) {
      taskId = createTask(runtime);
      runtime.bgXChanges.push({ bg: 0, value: 0x0000, op: 0 });
      runtime.bgYChanges.push({ bg: 0, value: -0x1081, op: 0 });
      runtime.tasks[taskId].data[0] = 0;
      runtime.tasks[taskId].data[2] = 0;
      runtime.tasks[taskId].data[8] = palIntoFadedBuffer ? 1 : 0;
    } else {
      if (runtime.tasks[taskId].data[0] !== 4) {
        runtime.tasks[taskId].data[0] = 4;
      }
      runtime.tasks[taskId].data[3] = 1;
    }
  }
};

export const taskMapNamePopup = (
  runtime: MapNamePopupRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      task.data[4] = mapNamePopupCreateWindow(runtime, task.data[8] !== 0);
      task.data[5] = 1;
      task.data[0] = 1;
      break;
    case 1:
      if (runtime.dma3Busy) {
        break;
      }
    // fallthrough
    case 2:
      task.data[2] -= 2;
      if (task.data[2] <= -24) {
        task.data[0] = 3;
        task.data[1] = 0;
      }
      break;
    case 3:
      task.data[1] += 1;
      if (task.data[1] > 120) {
        task.data[1] = 0;
        task.data[0] = 4;
      }
      break;
    case 4:
      task.data[2] += 2;
      if (task.data[2] >= 0) {
        if (task.data[3]) {
          mapNamePopupPrintMapNameOnWindow(runtime, task.data[4]);
          runtime.copiedWindows.push({ windowId: task.data[4], mode: COPYWIN_GFX });
          task.data[0] = 1;
          task.data[3] = 0;
        } else {
          task.data[0] = 6;
          return;
        }
      }
    // fallthrough
    case 5:
      break;
    case 6:
      if (task.data[5] && !task.data[6]) {
        runtime.rboxFilled.push(task.data[4]);
        runtime.copiedWindows.push({ windowId: task.data[4], mode: COPYWIN_MAP });
        task.data[6] = 1;
      }
      task.data[0] = 7;
      return;
    case 7:
      if (!runtime.dma3Busy) {
        if (task.data[5]) {
          const window = runtime.windows.find((item) => item.id === task.data[4]);
          if (window) {
            window.removed = true;
          }
          task.data[5] = 0;
          task.data[7] = 1;
        }
        task.data[0] = 8;
        runtime.bgYChanges.push({ bg: 0, value: 0x00000000, op: 0 });
      }
      return;
    case 8:
      task.destroyed = true;
      return;
  }

  runtime.gpuRegBG0VOFS.push(task.data[2]);
};

export const dismissMapNamePopup = (
  runtime: MapNamePopupRuntime
): void => {
  const taskId = findTaskIdByFunc(runtime);
  if (taskId !== -1 && runtime.tasks[taskId].data[0] < 6) {
    runtime.tasks[taskId].data[0] = 6;
  }
};

export const isMapNamePopupTaskActive = (
  runtime: MapNamePopupRuntime
): boolean => findTaskIdByFunc(runtime) !== -1;

export const mapNamePopupCreateWindow = (
  runtime: MapNamePopupRuntime,
  palIntoFadedBuffer: boolean
): number => {
  const windowTemplate = {
    bg: 0,
    tilemapLeft: 1,
    tilemapTop: 29,
    width: 14,
    height: 2,
    paletteNum: WIN_PAL_NUM,
    baseBlock: 0x001
  };
  let tileNum = 0x01d;
  if (runtime.mapHeader.floorNum !== 0) {
    if (runtime.mapHeader.floorNum !== FLOOR_ROOFTOP) {
      windowTemplate.width += 5;
      tileNum = 0x027;
    } else {
      windowTemplate.width += 8;
      tileNum = 0x02d;
    }
  }

  const windowId = runtime.nextWindowId++;
  runtime.windows.push({ id: windowId, template: windowTemplate, removed: false });
  if (palIntoFadedBuffer) {
    runtime.loadedPaletteIntoFaded.push(true);
  } else {
    runtime.copiedPaletteIntoUnfaded.push(true);
  }
  runtime.loadedStdWindowTiles.push({ windowId, tileNum });
  runtime.drawnTextBorders.push({ windowId, tileNum, palNum: WIN_PAL_NUM });
  runtime.putWindowTilemaps.push(windowId);
  mapNamePopupPrintMapNameOnWindow(runtime, windowId);
  runtime.copiedWindows.push({ windowId, mode: COPYWIN_FULL });
  return windowId;
};

const getStringWidth = (text: string): number => text.length * 8;

export const mapNamePopupPrintMapNameOnWindow = (
  runtime: MapNamePopupRuntime,
  windowId: number
): void => {
  let mapName = runtime.mapNames[runtime.mapHeader.regionMapSectionId] ?? '';
  let maxWidth = 112;
  if (runtime.mapHeader.floorNum !== 0) {
    mapName = mapNamePopupAppendFloorNum(mapName, runtime.mapHeader.floorNum);
    maxWidth = runtime.mapHeader.floorNum !== FLOOR_ROOFTOP ? 152 : 176;
  }
  const xpos = Math.trunc((maxWidth - getStringWidth(mapName)) / 2);
  runtime.filledWindows.push(windowId);
  runtime.printedText.push({ windowId, text: mapName, x: xpos, y: 2, speed: TEXT_SKIP_DRAW });
};

export const mapNamePopupAppendFloorNum = (
  dest: string,
  floorNum: number
): string => {
  if (floorNum === 0) {
    return dest;
  }
  let result = `${dest}${CHAR_SPACE}`;
  if (floorNum === FLOOR_ROOFTOP) {
    return `${result}ROOFTOP`;
  }
  let normalizedFloor = floorNum;
  if (floorNum < 0) {
    result += CHAR_B;
    normalizedFloor *= -1;
  }
  result += `${normalizedFloor}${CHAR_F}`;
  return result;
};
