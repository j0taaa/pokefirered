export const SCENE_ENSURE_CONNECT = 0;
export const SCENE_TURN_OFF_POWER = 1;
export const SCENE_TRANSMITTING = 2;
export const SCENE_FOLLOW_INSTRUCT = 3;
export const SCENE_TRANSMIT_FAILED = 4;
export const SCENE_BEGIN = 5;

export const STATE_BEGIN = 0;
export const STATE_CONNECT = 1;
export const STATE_TURN_OFF_POWER = 2;
export const STATE_UNUSED = 3;
export const STATE_INIT_MULTIBOOT = 4;
export const STATE_MULTIBOOT = 5;
export const STATE_TRANSMIT = 6;
export const STATE_SUCCEEDED = 7;
export const STATE_EXIT = 8;
export const STATE_FAILED = 9;
export const STATE_RETRY = 10;

export const A_BUTTON = 1;
export const INTR_FLAG_VBLANK = 1;
export const MULTIBOOT_HEADER_SIZE = 0xc0;
export const MULTIBOOT_SERVER_TYPE_NORMAL = 0;
export const DISPCNT_BG0_ON = 0x0100;
export const BERRY_FIX_PROGRAM_SIZE = 0x3bf4;

export const BERRY_FIX_GRAPHICS = [
  ['gBerryFixGameboy_Gfx', 'gBerryFixGameboy_Tilemap', 'gBerryFixGameboy_Pal'],
  ['gBerryFixGameboyLogo_Gfx', 'gBerryFixGameboyLogo_Tilemap', 'gBerryFixGameboyLogo_Pal'],
  ['gBerryFixGbaTransfer_Gfx', 'gBerryFixGbaTransfer_Tilemap', 'gBerryFixGbaTransfer_Pal'],
  ['gBerryFixGbaTransferHighlight_Gfx', 'gBerryFixGbaTransferHighlight_Tilemap', 'gBerryFixGbaTransferHighlight_Pal'],
  ['gBerryFixGbaTransferError_Gfx', 'gBerryFixGbaTransferError_Tilemap', 'gBerryFixGbaTransferError_Pal'],
  ['gBerryFixWindow_Gfx', 'gBerryFixWindow_Tilemap', 'gBerryFixWindow_Pal']
] as const;

export interface BerryFixTask {
  data: number[];
  destroyed: boolean;
}

export interface BerryFixRuntime {
  regDISPCNT: number;
  regBG0HOFS: number;
  regBG0VOFS: number;
  regBLDCNT: number;
  regBG0CNT: number;
  disabledInterrupts: number[];
  enabledInterrupts: number[];
  soundVSyncOff: boolean;
  vblankCallback: string | null;
  dmaFills: Array<{ channel: number; value: number; dest: 'VRAM' | 'PLTT'; size: number }>;
  spriteDataReset: boolean;
  tasksReset: boolean;
  scanlineEffectStopped: boolean;
  helpSystemEnabled: boolean;
  mainCallback2: string | null;
  tasks: BerryFixTask[];
  scenes: number[];
  decompressions: Array<{ source: string; dest: string }>;
  paletteCopies: Array<{ source: string; dest: string; size: number }>;
  multibootStart: number | null;
  multibootStatus: number;
  multibootSize: number;
  multibootParam: {
    masterp: number | null;
    server_type: number;
    probe_count: number;
    response_bit: number;
    client_bit: number;
  };
  multiBootInitCount: number;
  multiBootMainResults: number[];
  multiBootMainCallCount: number;
  multiBootStartMasterCalls: Array<{
    start: number;
    size: number;
    paletteData: number;
    clientBit: number;
  }>;
  multiBootComplete: boolean;
  newKeys: number;
  softReset: boolean;
}

export const createBerryFixRuntime = (): BerryFixRuntime => ({
  regDISPCNT: 0,
  regBG0HOFS: 0,
  regBG0VOFS: 0,
  regBLDCNT: 0,
  regBG0CNT: 0,
  disabledInterrupts: [],
  enabledInterrupts: [],
  soundVSyncOff: false,
  vblankCallback: null,
  dmaFills: [],
  spriteDataReset: false,
  tasksReset: false,
  scanlineEffectStopped: false,
  helpSystemEnabled: true,
  mainCallback2: null,
  tasks: [],
  scenes: [],
  decompressions: [],
  paletteCopies: [],
  multibootStart: null,
  multibootStatus: 0,
  multibootSize: 0,
  multibootParam: {
    masterp: null,
    server_type: 0,
    probe_count: 0,
    response_bit: 0,
    client_bit: 0
  },
  multiBootInitCount: 0,
  multiBootMainResults: [],
  multiBootMainCallCount: 0,
  multiBootStartMasterCalls: [],
  multiBootComplete: false,
  newKeys: 0,
  softReset: false
});

const createTask = (runtime: BerryFixRuntime): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    data: Array.from({ length: 16 }, () => 0),
    destroyed: false
  });
  return taskId;
};

export const setScene = (runtime: BerryFixRuntime, scene: number): void => {
  const graphics = BERRY_FIX_GRAPHICS[scene];
  runtime.regDISPCNT = 0;
  runtime.regBG0HOFS = 0;
  runtime.regBG0VOFS = 0;
  runtime.regBLDCNT = 0;
  runtime.decompressions.push({ source: graphics[0], dest: 'BG_CHAR_ADDR(0)' });
  runtime.decompressions.push({ source: graphics[1], dest: 'BG_SCREEN_ADDR(31)' });
  runtime.paletteCopies.push({ source: graphics[2], dest: 'BG_PLTT', size: 0x200 });
  runtime.regBG0CNT = 0 | (0 << 2) | (31 << 8) | 0;
  runtime.regDISPCNT = DISPCNT_BG0_ON;
  runtime.scenes.push(scene);
};

export const cb2InitBerryFixProgram = (runtime: BerryFixRuntime): number => {
  runtime.disabledInterrupts.push(0xffff);
  runtime.enabledInterrupts.push(INTR_FLAG_VBLANK);
  runtime.soundVSyncOff = true;
  runtime.vblankCallback = null;
  runtime.dmaFills.push({ channel: 3, value: 0, dest: 'VRAM', size: 0x18000 });
  runtime.dmaFills.push({ channel: 3, value: 0, dest: 'PLTT', size: 0x400 });
  runtime.spriteDataReset = true;
  runtime.tasksReset = true;
  runtime.scanlineEffectStopped = true;
  runtime.helpSystemEnabled = false;
  const taskId = createTask(runtime);
  runtime.tasks[taskId].data[0] = STATE_BEGIN;
  runtime.mainCallback2 = 'CB2_BerryFix';
  return taskId;
};

export const cb2BerryFix = (runtime: BerryFixRuntime): void => {
  for (let taskId = 0; taskId < runtime.tasks.length; taskId += 1) {
    if (!runtime.tasks[taskId].destroyed) {
      taskBerryFixMain(runtime, taskId);
    }
  }
};

const multiBootMain = (runtime: BerryFixRuntime): number => {
  runtime.multiBootMainCallCount += 1;
  const result = runtime.multiBootMainResults.shift() ?? 0;
  runtime.multibootStatus = result;
  return result;
};

export const taskBerryFixMain = (
  runtime: BerryFixRuntime,
  taskId: number
): void => {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case STATE_BEGIN:
      setScene(runtime, SCENE_BEGIN);
      data[0] = STATE_CONNECT;
      break;
    case STATE_CONNECT:
      if ((runtime.newKeys & A_BUTTON) !== 0) {
        setScene(runtime, SCENE_ENSURE_CONNECT);
        data[0] = STATE_TURN_OFF_POWER;
      }
      break;
    case STATE_TURN_OFF_POWER:
      if ((runtime.newKeys & A_BUTTON) !== 0) {
        setScene(runtime, SCENE_TURN_OFF_POWER);
        data[0] = STATE_INIT_MULTIBOOT;
      }
      break;
    case STATE_INIT_MULTIBOOT:
      runtime.multibootStart = 0;
      runtime.multibootSize = BERRY_FIX_PROGRAM_SIZE;
      runtime.multibootParam.masterp = 0;
      runtime.multibootParam.server_type = MULTIBOOT_SERVER_TYPE_NORMAL;
      runtime.multiBootInitCount += 1;
      data[1] = 0;
      data[0] = STATE_MULTIBOOT;
      break;
    case STATE_MULTIBOOT:
      if (
        runtime.multibootParam.probe_count === 0 &&
        (runtime.multibootParam.response_bit & 0x2) !== 0 &&
        (runtime.multibootParam.client_bit & 0x2) !== 0
      ) {
        data[1] += 1;
        if (data[1] > 180) {
          setScene(runtime, SCENE_TRANSMITTING);
          runtime.multiBootStartMasterCalls.push({
            start: (runtime.multibootStart ?? 0) + MULTIBOOT_HEADER_SIZE,
            size: runtime.multibootSize - MULTIBOOT_HEADER_SIZE,
            paletteData: 4,
            clientBit: 1
          });
          data[1] = 0;
          data[0] = STATE_TRANSMIT;
        } else {
          multiBootMain(runtime);
        }
      } else {
        data[1] = 0;
        multiBootMain(runtime);
      }
      break;
    case STATE_TRANSMIT:
      multiBootMain(runtime);
      if (runtime.multiBootComplete) {
        setScene(runtime, SCENE_FOLLOW_INSTRUCT);
        data[0] = STATE_SUCCEEDED;
      } else if ((runtime.multibootParam.client_bit & 2) === 0) {
        data[0] = STATE_FAILED;
      }
      break;
    case STATE_SUCCEEDED:
      data[0] = STATE_EXIT;
      break;
    case STATE_EXIT:
      if ((runtime.newKeys & A_BUTTON) !== 0) {
        runtime.tasks[taskId].destroyed = true;
        runtime.softReset = true;
      }
      break;
    case STATE_FAILED:
      setScene(runtime, SCENE_TRANSMIT_FAILED);
      data[0] = STATE_RETRY;
      break;
    case STATE_RETRY:
      if ((runtime.newKeys & A_BUTTON) !== 0) {
        data[0] = STATE_BEGIN;
      }
      break;
  }
};

export function SetScene(runtime: BerryFixRuntime, scene: number): void {
  setScene(runtime, scene);
}

export function CB2_InitBerryFixProgram(runtime: BerryFixRuntime): number {
  return cb2InitBerryFixProgram(runtime);
}

export function CB2_BerryFix(runtime: BerryFixRuntime): void {
  cb2BerryFix(runtime);
}

export function Task_BerryFixMain(runtime: BerryFixRuntime, taskId: number): void {
  taskBerryFixMain(runtime, taskId);
}
