export const MAP_TYPE_TOWN = 1;
export const MAP_TYPE_CITY = 2;
export const MAP_TYPE_ROUTE = 3;
export const MAP_TYPE_UNDERGROUND = 4;
export const MAP_TYPE_UNDERWATER = 5;
export const MAP_TYPE_OCEAN_ROUTE = 6;
export const MAP_TYPE_UNKNOWN = 7;
export const MAP_TYPE_INDOOR = 8;
export const MAP_TYPE_SECRET_BASE = 9;

export const FLAG_SYS_FLASH_ACTIVE = 'FLAG_SYS_FLASH_ACTIVE';
export const SE_M_REFLECT = 'SE_M_REFLECT';
export const EVENT_SCRIPT_FLD_EFF_FLASH = 'EventScript_FldEffFlash';

export interface FlashTransitionType {
  fromType: number;
  toType: number;
  isEnter: boolean;
  isExit: boolean;
  func1: 'FlashTransition_Enter' | 'FlashTransition_Exit';
  func2: 'RunMapPreviewScreen';
}

export interface FldEffFlashTask {
  func: string;
  data: number[];
}

export interface FldEffFlashRuntime {
  mapHeader: {
    cave: boolean;
    regionMapSectionId: number;
  };
  flags: Set<string>;
  fieldCallback2: string | null;
  postMenuFieldCallback: string | null;
  fieldEffectArguments: number[];
  cursorSelectionMonId: number;
  tasks: FldEffFlashTask[];
  gpuRegs: Record<string, number>;
  paletteLoads: Array<{ source: string; offset: number; size: number }>;
  callbacks: {
    main: string | null;
    savedMain: string;
    vblank: string | null;
    savedVblank: string | null;
  };
  lastWarpMapType: number;
  currentMapType: number;
  lastWarpMapSectionId: number;
  mapPreviewAllowed: boolean;
  mapPreviewGfxLoadFinished: boolean;
  dmaBusyWithBgCopy: boolean;
  paletteFadeActive: boolean;
  bButtonHeld: boolean;
  playedSE: string[];
  setupScripts: string[];
  transitionLog: string[];
  mapPreviewWindows: number[];
  nextWindowId: number;
}

export const sTransitionTypes: readonly FlashTransitionType[] = [
  { fromType: MAP_TYPE_TOWN, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_CITY, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_ROUTE, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERWATER, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_OCEAN_ROUTE, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNKNOWN, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_INDOOR, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_SECRET_BASE, toType: MAP_TYPE_UNDERGROUND, isEnter: true, isExit: false, func1: 'FlashTransition_Enter', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_TOWN, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_CITY, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_ROUTE, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_UNDERWATER, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_OCEAN_ROUTE, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_UNKNOWN, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_INDOOR, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' },
  { fromType: MAP_TYPE_UNDERGROUND, toType: MAP_TYPE_SECRET_BASE, isEnter: false, isExit: true, func1: 'FlashTransition_Exit', func2: 'RunMapPreviewScreen' }
];

export const createFldEffFlashRuntime = (): FldEffFlashRuntime => ({
  mapHeader: {
    cave: false,
    regionMapSectionId: 0
  },
  flags: new Set(),
  fieldCallback2: null,
  postMenuFieldCallback: null,
  fieldEffectArguments: [],
  cursorSelectionMonId: 0,
  tasks: [],
  gpuRegs: {},
  paletteLoads: [],
  callbacks: {
    main: null,
    savedMain: 'savedCallback',
    vblank: null,
    savedVblank: 'savedVBlank'
  },
  lastWarpMapType: MAP_TYPE_TOWN,
  currentMapType: MAP_TYPE_TOWN,
  lastWarpMapSectionId: 0,
  mapPreviewAllowed: false,
  mapPreviewGfxLoadFinished: false,
  dmaBusyWithBgCopy: false,
  paletteFadeActive: false,
  bButtonHeld: false,
  playedSE: [],
  setupScripts: [],
  transitionLog: [],
  mapPreviewWindows: [],
  nextWindowId: 0
});

const createTask = (runtime: FldEffFlashRuntime, func: string): number => {
  runtime.tasks.push({ func, data: Array.from({ length: 16 }, () => 0) });
  return runtime.tasks.length - 1;
};

const setGpuReg = (runtime: FldEffFlashRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
};

const loadPalette = (runtime: FldEffFlashRuntime, source: string, offset: number, size: number): void => {
  runtime.paletteLoads.push({ source, offset, size });
};

const setMainCallback2 = (runtime: FldEffFlashRuntime, callback: string): void => {
  runtime.callbacks.main = callback;
};

const setVBlankCallback = (runtime: FldEffFlashRuntime, callback: string | null): void => {
  runtime.callbacks.vblank = callback;
};

export const setUpFieldMoveFlash = (runtime: FldEffFlashRuntime): boolean => {
  if (runtime.mapHeader.cave !== true) {
    return false;
  }
  if (runtime.flags.has(FLAG_SYS_FLASH_ACTIVE)) {
    return false;
  }
  runtime.fieldCallback2 = 'FieldCallback_PrepareFadeInFromMenu';
  runtime.postMenuFieldCallback = 'FieldCallback_Flash';
  return true;
};

export const fieldCallbackFlash = (runtime: FldEffFlashRuntime): number => {
  const taskId = createTask(runtime, 'CreateFieldEffectShowMon');
  runtime.fieldEffectArguments[0] = runtime.cursorSelectionMonId & 0xff;
  runtime.tasks[taskId].data[8] = 0;
  runtime.tasks[taskId].data[9] = 0;
  runtime.transitionLog.push('FieldCallback_Flash:FldrEff_UseFlash');
  return taskId;
};

export const fldEffUseFlash = (runtime: FldEffFlashRuntime): void => {
  runtime.playedSE.push(SE_M_REFLECT);
  runtime.flags.add(FLAG_SYS_FLASH_ACTIVE);
  runtime.setupScripts.push(EVENT_SCRIPT_FLD_EFF_FLASH);
};

export const cb2ChangeMapMain = (runtime: FldEffFlashRuntime): void => {
  runtime.transitionLog.push('RunTasks');
  runtime.transitionLog.push('AnimateSprites');
  runtime.transitionLog.push('BuildOamBuffer');
  runtime.transitionLog.push('UpdatePaletteFade');
};

export const vbcChangeMapVBlank = (runtime: FldEffFlashRuntime): void => {
  runtime.transitionLog.push('LoadOam');
  runtime.transitionLog.push('ProcessSpriteCopyRequests');
  runtime.transitionLog.push('TransferPlttBuffer');
};

export const mapTransitionIsEnter = (fromType: number, toType: number): boolean => {
  const transition = sTransitionTypes.find((entry) => entry.fromType === fromType && entry.toType === toType);
  return transition?.isEnter ?? false;
};

export const mapTransitionIsExit = (fromType: number, toType: number): boolean => {
  const transition = sTransitionTypes.find((entry) => entry.fromType === fromType && entry.toType === toType);
  return transition?.isExit ?? false;
};

export const cb2DoChangeMap = (runtime: FldEffFlashRuntime): void => {
  setVBlankCallback(runtime, null);
  setGpuReg(runtime, 'DISPCNT', 0);
  setGpuReg(runtime, 'BG2CNT', 0);
  setGpuReg(runtime, 'BG1CNT', 0);
  setGpuReg(runtime, 'BG0CNT', 0);
  setGpuReg(runtime, 'BG2HOFS', 0);
  setGpuReg(runtime, 'BG2VOFS', 0);
  setGpuReg(runtime, 'BG1HOFS', 0);
  setGpuReg(runtime, 'BG1VOFS', 0);
  setGpuReg(runtime, 'BG0HOFS', 0);
  setGpuReg(runtime, 'BG0VOFS', 0);
  runtime.tasks = [];
  runtime.transitionLog.push('ResetPaletteFade');
  runtime.transitionLog.push('ResetSpriteData');
  setVBlankCallback(runtime, 'VBC_ChangeMapVBlank');
  setMainCallback2(runtime, 'CB2_ChangeMapMain');
  if (!tryDoMapTransition(runtime)) {
    setMainCallback2(runtime, runtime.callbacks.savedMain);
  }
};

export const tryDoMapTransition = (runtime: FldEffFlashRuntime): boolean => {
  const fromType = runtime.lastWarpMapType;
  const toType = runtime.currentMapType;
  if (runtime.lastWarpMapSectionId !== runtime.mapHeader.regionMapSectionId && runtime.mapPreviewAllowed) {
    runMapPreviewScreen(runtime, runtime.mapHeader.regionMapSectionId);
    return true;
  }
  const transition = sTransitionTypes.find((entry) => entry.fromType === fromType && entry.toType === toType);
  if (transition) {
    if (transition.func1 === 'FlashTransition_Enter') {
      flashTransitionEnter(runtime);
    } else {
      flashTransitionExit(runtime);
    }
    return true;
  }
  return false;
};

export const flashTransitionExit = (runtime: FldEffFlashRuntime): number =>
  createTask(runtime, 'Task_FlashTransition_Exit_0');

export const flashTransitionEnter = (runtime: FldEffFlashRuntime): number =>
  createTask(runtime, 'Task_FlashTransition_Enter_0');

export const stepFldEffFlashTask = (runtime: FldEffFlashRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  switch (task.func) {
    case 'Task_FlashTransition_Exit_0':
      task.func = 'Task_FlashTransition_Exit_1';
      break;
    case 'Task_FlashTransition_Exit_1':
      setGpuReg(runtime, 'DISPCNT', 0);
      runtime.transitionLog.push('LZ77UnCompVram:CaveTransitionTiles');
      runtime.transitionLog.push('LZ77UnCompVram:CaveTransitionTilemap');
      loadPalette(runtime, 'sCaveTransitionPalette_White', 14, 16);
      loadPalette(runtime, 'sCaveTransitionPalette+8', 14, 8);
      setGpuReg(runtime, 'BLDCNT', 0x3f41);
      setGpuReg(runtime, 'BLDALPHA', 0);
      setGpuReg(runtime, 'BLDY', 0);
      setGpuReg(runtime, 'BG0CNT', 0x1f0c);
      setGpuReg(runtime, 'DISPCNT', 0x1100);
      task.func = 'Task_FlashTransition_Exit_2';
      task.data[0] = 16;
      task.data[1] = 0;
      break;
    case 'Task_FlashTransition_Exit_2': {
      const r4 = task.data[1];
      setGpuReg(runtime, 'BLDALPHA', (16 << 8) + r4);
      if (r4 <= 16) {
        task.data[1] += 1;
      } else {
        task.data[2] = 0;
        task.func = 'Task_FlashTransition_Exit_3';
      }
      break;
    }
    case 'Task_FlashTransition_Exit_3': {
      setGpuReg(runtime, 'BLDALPHA', (16 << 8) + 16);
      const count = task.data[2];
      if (count < 8) {
        task.data[2] += 1;
        loadPalette(runtime, `sCaveTransitionPalette+${count + 8}`, 14, 8 - count);
      } else {
        loadPalette(runtime, 'sCaveTransitionPalette_White', 0, 16);
        task.func = 'Task_FlashTransition_Exit_4';
        task.data[2] = 8;
      }
      break;
    }
    case 'Task_FlashTransition_Exit_4':
      if (task.data[2] !== 0) {
        task.data[2] -= 1;
      } else {
        setMainCallback2(runtime, runtime.callbacks.savedMain);
      }
      break;
    case 'Task_FlashTransition_Enter_0':
      task.func = 'Task_FlashTransition_Enter_1';
      break;
    case 'Task_FlashTransition_Enter_1':
      setGpuReg(runtime, 'DISPCNT', 0);
      runtime.transitionLog.push('LZ77UnCompVram:CaveTransitionTiles');
      runtime.transitionLog.push('LZ77UnCompVram:CaveTransitionTilemap');
      setGpuReg(runtime, 'BLDCNT', 0);
      setGpuReg(runtime, 'BLDALPHA', 0);
      setGpuReg(runtime, 'BLDY', 0);
      setGpuReg(runtime, 'BG0CNT', 0x1f0c);
      setGpuReg(runtime, 'DISPCNT', 0x1100);
      loadPalette(runtime, 'sCaveTransitionPalette_White', 14, 16);
      loadPalette(runtime, 'sCaveTransitionPalette_Black', 0, 16);
      task.func = 'Task_FlashTransition_Enter_2';
      task.data[0] = 16;
      task.data[1] = 0;
      task.data[2] = 0;
      break;
    case 'Task_FlashTransition_Enter_2': {
      const count = task.data[2];
      if (count < 16) {
        task.data[2] += 2;
        loadPalette(runtime, `sCaveTransitionPalette+${15 - count}`, 14, count + 1);
      } else {
        setGpuReg(runtime, 'BLDALPHA', (16 << 8) + 16);
        setGpuReg(runtime, 'BLDCNT', 0x3f41);
        task.func = 'Task_FlashTransition_Enter_3';
      }
      break;
    }
    case 'Task_FlashTransition_Enter_3': {
      const r4 = 16 - task.data[1];
      setGpuReg(runtime, 'BLDALPHA', (16 << 8) + r4);
      if (r4 !== 0) {
        task.data[1] += 1;
      } else {
        loadPalette(runtime, 'sCaveTransitionPalette_Black', 0, 16);
        setMainCallback2(runtime, runtime.callbacks.savedMain);
      }
      break;
    }
    case 'Task_MapPreviewScreen_0':
      stepMapPreviewScreen(runtime, task);
      break;
  }
};

const stepFldEffFlashTaskAs = (runtime: FldEffFlashRuntime, taskId: number, func: string): void => {
  const task = runtime.tasks[taskId];
  if (!task) {
    return;
  }
  task.func = func;
  stepFldEffFlashTask(runtime, taskId);
};

export const taskFlashTransitionExit0 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Exit_0');

export const taskFlashTransitionExit1 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Exit_1');

export const taskFlashTransitionExit2 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Exit_2');

export const taskFlashTransitionExit3 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Exit_3');

export const taskFlashTransitionExit4 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Exit_4');

export const taskFlashTransitionEnter0 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Enter_0');

export const taskFlashTransitionEnter1 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Enter_1');

export const taskFlashTransitionEnter2 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Enter_2');

export const taskFlashTransitionEnter3 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_FlashTransition_Enter_3');

export const runMapPreviewScreen = (runtime: FldEffFlashRuntime, mapSecId: number): number => {
  const taskId = createTask(runtime, 'Task_MapPreviewScreen_0');
  runtime.tasks[taskId].data[3] = mapSecId & 0xffff;
  return taskId;
};

const stepMapPreviewScreen = (runtime: FldEffFlashRuntime, task: FldEffFlashTask): void => {
  switch (task.data[0]) {
    case 0:
      task.data[5] = 0;
      setVBlankCallback(runtime, null);
      runtime.transitionLog.push('MapPreview_InitBgs');
      runtime.transitionLog.push(`MapPreview_LoadGfx:${task.data[3]}`);
      runtime.transitionLog.push('BlendPalettes:Black');
      task.data[0] += 1;
      break;
    case 1:
      if (!runtime.mapPreviewGfxLoadFinished) {
        task.data[4] = runtime.nextWindowId++;
        runtime.mapPreviewWindows.push(task.data[4]);
        runtime.transitionLog.push(`MapPreview_CreateMapNameWindow:${task.data[3]}`);
        task.data[0] += 1;
      }
      break;
    case 2:
      if (!runtime.dmaBusyWithBgCopy) {
        runtime.paletteFadeActive = true;
        setVBlankCallback(runtime, runtime.callbacks.savedVblank);
        task.data[0] += 1;
      }
      break;
    case 3:
      if (!runtime.paletteFadeActive) {
        task.data[2] = mapPreviewGetDuration(task.data[3]);
        task.data[0] += 1;
      }
      break;
    case 4:
      task.data[1] += 1;
      if (task.data[1] > task.data[2] || runtime.bButtonHeld) {
        runtime.paletteFadeActive = true;
        task.data[0] += 1;
      }
      break;
    case 5:
      if (!runtime.paletteFadeActive) {
        for (let i = 0; i < 16; i += 1) {
          task.data[i] = 0;
        }
        runtime.transitionLog.push('MapPreview_Unload');
        task.func = 'Task_FlashTransition_Enter_1';
      }
      break;
  }
};

export const mapPreviewGetDuration = (_mapSecId: number): number => 120;

export const taskMapPreviewScreen0 = (runtime: FldEffFlashRuntime, taskId: number): void =>
  stepFldEffFlashTaskAs(runtime, taskId, 'Task_MapPreviewScreen_0');

export const SetUpFieldMove_Flash = setUpFieldMoveFlash;
export const FieldCallback_Flash = fieldCallbackFlash;
export const FldEff_UseFlash = fldEffUseFlash;
export const CB2_ChangeMapMain = cb2ChangeMapMain;
export const VBC_ChangeMapVBlank = vbcChangeMapVBlank;
export const CB2_DoChangeMap = cb2DoChangeMap;
export const TryDoMapTransition = tryDoMapTransition;
export const MapTransitionIsEnter = mapTransitionIsEnter;
export const MapTransitionIsExit = mapTransitionIsExit;
export const FlashTransition_Exit = flashTransitionExit;
export const Task_FlashTransition_Exit_0 = taskFlashTransitionExit0;
export const Task_FlashTransition_Exit_1 = taskFlashTransitionExit1;
export const Task_FlashTransition_Exit_2 = taskFlashTransitionExit2;
export const Task_FlashTransition_Exit_3 = taskFlashTransitionExit3;
export const Task_FlashTransition_Exit_4 = taskFlashTransitionExit4;
export const FlashTransition_Enter = flashTransitionEnter;
export const Task_FlashTransition_Enter_0 = taskFlashTransitionEnter0;
export const Task_FlashTransition_Enter_1 = taskFlashTransitionEnter1;
export const Task_FlashTransition_Enter_2 = taskFlashTransitionEnter2;
export const Task_FlashTransition_Enter_3 = taskFlashTransitionEnter3;
export const RunMapPreviewScreen = runMapPreviewScreen;
export const Task_MapPreviewScreen_0 = taskMapPreviewScreen0;
