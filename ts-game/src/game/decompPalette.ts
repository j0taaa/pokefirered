export const NORMAL_FADE = 0;
export const FAST_FADE = 1;
export const HARDWARE_FADE = 2;

export const PLTT_SIZE = 0x400;
export const PLTT_BUFFER_SIZE = PLTT_SIZE / 2;
export const NUM_PALETTE_STRUCTS = 16;
export const NUM_TASKS = 16;
export const NUM_TASK_DATA = 16;
export const TASK_NONE = 0xff;

export const PALETTE_FADE_STATUS_LOADING = 0xff;
export const PALETTE_FADE_STATUS_DELAY = 2;
export const PALETTE_FADE_STATUS_ACTIVE = 1;
export const PALETTE_FADE_STATUS_DONE = 0;

export const PALETTES_BG = 0x0000ffff;
export const PALETTES_OBJECTS = 0xffff0000;
export const PALETTES_ALL = PALETTES_BG | PALETTES_OBJECTS;

export const BG_PLTT_OFFSET = 0x000;
export const OBJ_PLTT_OFFSET = 0x100;
export const PLTT_ID = (n: number): number => n * 16;
export const BG_PLTT_ID = (n: number): number => BG_PLTT_OFFSET + PLTT_ID(n);
export const OBJ_PLTT_ID = (n: number): number => OBJ_PLTT_OFFSET + PLTT_ID(n);
export const OBJ_PLTT_ID2 = (n: number): number => PLTT_ID(n + 16);

export const FAST_FADE_IN_FROM_WHITE = 0;
export const FAST_FADE_OUT_TO_WHITE = 1;
export const FAST_FADE_IN_FROM_BLACK = 2;
export const FAST_FADE_OUT_TO_BLACK = 3;

export const RGB_BLACK = 0;
export const RGB_WHITE = 0x7fff;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDY = 0x54;

export interface PaletteFadeControl {
  multipurpose1: number;
  delayCounter: number;
  y: number;
  targetY: number;
  blendColor: number;
  active: boolean;
  multipurpose2: number;
  yDec: boolean;
  bufferTransferDisabled: boolean;
  mode: number;
  shouldResetBlendRegisters: boolean;
  hardwareFadeFinishing: boolean;
  softwareFadeFinishingCounter: number;
  softwareFadeFinishing: boolean;
  objPaletteToggle: number;
  deltaY: number;
  unused: number;
}

export interface PaletteStructTemplate {
  id: number;
  src: ArrayLike<number>;
  pst_field_8_0: boolean;
  unused: number;
  size: number;
  time1: number;
  srcCount: number;
  state: number;
  time2: number;
}

export interface PaletteStruct {
  template: PaletteStructTemplate;
  active: boolean;
  flag: boolean;
  baseDestOffset: number;
  destOffset: number;
  srcIndex: number;
  countdown1: number;
  countdown2: number;
}

export interface PaletteTask {
  func: 'TaskDummy' | 'Task_BlendPalettesGradually';
  isActive: boolean;
  prev: number;
  next: number;
  priority: number;
  data: number[];
}

export interface DecompPaletteRuntime {
  gPlttBufferUnfaded: Uint16Array;
  gPlttBufferFaded: Uint16Array;
  pltt: Uint16Array;
  gPaletteDecompressionBuffer: Uint16Array;
  gPaletteFade: PaletteFadeControl;
  sPaletteStructs: PaletteStruct[];
  sPlttBufferTransferPending: number;
  gTasks: PaletteTask[];
  gpuRegs: Map<number, number>;
  operations: string[];
  decompressPalette?: (src: ArrayLike<number>, dest: Uint16Array) => void;
}

const sDummyPaletteStructTemplate: PaletteStructTemplate = {
  id: 0xffff,
  src: [],
  pst_field_8_0: false,
  unused: 0,
  size: 0,
  time1: 0,
  srcCount: 0,
  state: 1,
  time2: 0
};

export const sRoundedDownGrayscaleMap = [
  0, 0, 0, 0, 0,
  5, 5, 5, 5, 5,
  11, 11, 11, 11, 11,
  16, 16, 16, 16, 16,
  21, 21, 21, 21, 21,
  27, 27, 27, 27, 27,
  31, 31
] as const;

const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;
const u5 = (value: number): number => value & 0x1f;
const boolBit = (value: number): boolean => (value & 1) !== 0;
const s8 = (value: number): number => (value << 24) >> 24;
const s16 = (value: number): number => (value << 16) >> 16;
const q8_8 = (value: number): number => s16(Math.trunc(value * 256));

export const RGB = (r: number, g: number, b: number): number => u16(r | (g << 5) | (b << 10));
export const RGB2 = RGB;
export const GET_R = (color: number): number => color & 0x1f;
export const GET_G = (color: number): number => (color >> 5) & 0x1f;
export const GET_B = (color: number): number => (color >> 10) & 0x1f;

export const createPaletteFadeControl = (): PaletteFadeControl => ({
  multipurpose1: 0,
  delayCounter: 0,
  y: 0,
  targetY: 0,
  blendColor: 0,
  active: false,
  multipurpose2: 0,
  yDec: false,
  bufferTransferDisabled: false,
  mode: 0,
  shouldResetBlendRegisters: false,
  hardwareFadeFinishing: false,
  softwareFadeFinishingCounter: 0,
  softwareFadeFinishing: false,
  objPaletteToggle: 0,
  deltaY: 0,
  unused: 0
});

const createPaletteStruct = (): PaletteStruct => ({
  template: sDummyPaletteStructTemplate,
  active: false,
  flag: false,
  baseDestOffset: 0,
  destOffset: 0,
  srcIndex: 0,
  countdown1: 0,
  countdown2: 0
});

const createTask = (): PaletteTask => ({
  func: 'TaskDummy',
  isActive: false,
  prev: 0,
  next: 0,
  priority: 0,
  data: Array(NUM_TASK_DATA).fill(0)
});

export const createDecompPaletteRuntime = (): DecompPaletteRuntime => {
  const runtime: DecompPaletteRuntime = {
    gPlttBufferUnfaded: new Uint16Array(PLTT_BUFFER_SIZE),
    gPlttBufferFaded: new Uint16Array(PLTT_BUFFER_SIZE),
    pltt: new Uint16Array(PLTT_BUFFER_SIZE),
    gPaletteDecompressionBuffer: new Uint16Array(PLTT_BUFFER_SIZE),
    gPaletteFade: createPaletteFadeControl(),
    sPaletteStructs: Array.from({ length: NUM_PALETTE_STRUCTS }, createPaletteStruct),
    sPlttBufferTransferPending: 0,
    gTasks: Array.from({ length: NUM_TASKS }, createTask),
    gpuRegs: new Map<number, number>(),
    operations: []
  };
  ResetTasks(runtime);
  ResetPaletteFade(runtime);
  return runtime;
};

const copy16 = (src: ArrayLike<number>, dest: Uint16Array, offset: number, size: number): void => {
  const count = size >> 1;
  for (let i = 0; i < count; i++) {
    dest[offset + i] = u16(src[i] ?? 0);
  }
};

const fill16 = (value: number, dest: Uint16Array, offset: number, size: number): void => {
  const count = size >> 1;
  dest.fill(u16(value), offset, offset + count);
};

export const LoadCompressedPalette = (
  runtime: DecompPaletteRuntime,
  src: ArrayLike<number>,
  offset: number,
  size: number
): void => {
  if (runtime.decompressPalette) {
    runtime.decompressPalette(src, runtime.gPaletteDecompressionBuffer);
  } else {
    copy16(src, runtime.gPaletteDecompressionBuffer, 0, size);
  }
  copy16(runtime.gPaletteDecompressionBuffer, runtime.gPlttBufferUnfaded, offset, size);
  copy16(runtime.gPaletteDecompressionBuffer, runtime.gPlttBufferFaded, offset, size);
};

export const LoadPalette = (
  runtime: DecompPaletteRuntime,
  src: ArrayLike<number>,
  offset: number,
  size: number
): void => {
  copy16(src, runtime.gPlttBufferUnfaded, offset, size);
  copy16(src, runtime.gPlttBufferFaded, offset, size);
};

export const FillPalette = (
  runtime: DecompPaletteRuntime,
  value: number,
  offset: number,
  size: number
): void => {
  fill16(value, runtime.gPlttBufferUnfaded, offset, size);
  fill16(value, runtime.gPlttBufferFaded, offset, size);
};

export const TransferPlttBuffer = (runtime: DecompPaletteRuntime): void => {
  if (!runtime.gPaletteFade.bufferTransferDisabled) {
    runtime.pltt.set(runtime.gPlttBufferFaded);
    runtime.sPlttBufferTransferPending = 0;
    if (runtime.gPaletteFade.mode === HARDWARE_FADE && runtime.gPaletteFade.active) {
      UpdateBlendRegisters(runtime);
    }
  }
};

export const UpdatePaletteFade = (runtime: DecompPaletteRuntime): number => {
  if (runtime.sPlttBufferTransferPending) {
    return PALETTE_FADE_STATUS_LOADING;
  }

  let result: number;
  if (runtime.gPaletteFade.mode === NORMAL_FADE) {
    result = UpdateNormalPaletteFade(runtime);
  } else if (runtime.gPaletteFade.mode === FAST_FADE) {
    result = UpdateFastPaletteFade(runtime);
  } else {
    result = UpdateHardwarePaletteFade(runtime);
  }
  runtime.sPlttBufferTransferPending = runtime.gPaletteFade.multipurpose1 | 0;
  return result;
};

export const ResetPaletteFade = (runtime: DecompPaletteRuntime): void => {
  for (let i = 0; i < NUM_PALETTE_STRUCTS; i++) {
    PaletteStruct_Reset(runtime, i);
  }
  ResetPaletteFadeControl(runtime);
};

export const ReadPlttIntoBuffers = (runtime: DecompPaletteRuntime): void => {
  for (let i = 0; i < PLTT_BUFFER_SIZE; i++) {
    runtime.gPlttBufferUnfaded[i] = runtime.pltt[i] ?? 0;
    runtime.gPlttBufferFaded[i] = runtime.pltt[i] ?? 0;
  }
};

export const BeginNormalPaletteFade = (
  runtime: DecompPaletteRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  blendColor: number
): boolean => {
  if (runtime.gPaletteFade.active) {
    return false;
  }

  runtime.gPaletteFade.deltaY = 2;
  let localDelay = s8(delay);
  if (localDelay < 0) {
    runtime.gPaletteFade.deltaY += localDelay * -1;
    localDelay = 0;
  }
  runtime.gPaletteFade.multipurpose1 = u32(selectedPalettes);
  runtime.gPaletteFade.delayCounter = localDelay & 0x3f;
  runtime.gPaletteFade.multipurpose2 = localDelay & 0x3f;
  runtime.gPaletteFade.y = startY & 0x1f;
  runtime.gPaletteFade.targetY = targetY & 0x1f;
  runtime.gPaletteFade.blendColor = blendColor & 0x7fff;
  runtime.gPaletteFade.active = true;
  runtime.gPaletteFade.mode = NORMAL_FADE;
  runtime.gPaletteFade.yDec = startY >= targetY;
  UpdatePaletteFade(runtime);

  const temp = runtime.gPaletteFade.bufferTransferDisabled;
  runtime.gPaletteFade.bufferTransferDisabled = false;
  runtime.pltt.set(runtime.gPlttBufferFaded);
  runtime.sPlttBufferTransferPending = 0;
  if (runtime.gPaletteFade.mode === HARDWARE_FADE && runtime.gPaletteFade.active) {
    UpdateBlendRegisters(runtime);
  }
  runtime.gPaletteFade.bufferTransferDisabled = temp;
  return true;
};

export const BeginPlttFade = (
  runtime: DecompPaletteRuntime,
  selectedPalettes: number,
  delay: number,
  startY: number,
  targetY: number,
  blendColor: number
): boolean => {
  ReadPlttIntoBuffers(runtime);
  return BeginNormalPaletteFade(runtime, selectedPalettes, delay, startY, targetY, blendColor);
};

export const PaletteStruct_Run = (
  runtime: DecompPaletteRuntime,
  a1: boolean,
  unkFlagsRef: { value: number }
): void => {
  for (let i = 0; i < NUM_PALETTE_STRUCTS; i++) {
    const palstruct = runtime.sPaletteStructs[i];
    if (!palstruct.active || palstruct.template.pst_field_8_0 !== a1) {
      continue;
    }

    const srcIndex = palstruct.srcIndex;
    const srcCount = palstruct.template.srcCount;
    if (srcIndex === srcCount) {
      PaletteStruct_TryEnd(runtime, palstruct);
      if (!palstruct.active) {
        continue;
      }
    }
    if (palstruct.countdown1 === 0) {
      PaletteStruct_Copy(runtime, palstruct, unkFlagsRef);
    } else {
      palstruct.countdown1--;
    }
    PaletteStruct_Blend(runtime, palstruct, unkFlagsRef);
  }
};

export const PaletteStruct_Copy = (
  runtime: DecompPaletteRuntime,
  palStruct: PaletteStruct,
  unkFlagsRef: { value: number }
): void => {
  let srcOffset = palStruct.srcIndex * palStruct.template.size;
  let i = 0;
  if (!palStruct.template.pst_field_8_0) {
    while (i < palStruct.template.size) {
      runtime.gPlttBufferUnfaded[palStruct.destOffset] = u16(palStruct.template.src[srcOffset] ?? 0);
      runtime.gPlttBufferFaded[palStruct.destOffset] = u16(palStruct.template.src[srcOffset] ?? 0);
      i++;
      palStruct.destOffset++;
      srcOffset++;
    }
  } else {
    while (i < palStruct.template.size) {
      runtime.gPlttBufferFaded[palStruct.destOffset] = u16(palStruct.template.src[srcOffset] ?? 0);
      i++;
      palStruct.destOffset++;
      srcOffset++;
    }
  }
  palStruct.destOffset = palStruct.baseDestOffset;
  palStruct.countdown1 = palStruct.template.time1;
  palStruct.srcIndex++;
  if (palStruct.srcIndex >= palStruct.template.srcCount) {
    if (palStruct.countdown2) {
      palStruct.countdown2--;
    }
    palStruct.srcIndex = 0;
  }
  unkFlagsRef.value = u32(unkFlagsRef.value | (1 << (palStruct.baseDestOffset >> 4)));
};

export const PaletteStruct_Blend = (
  runtime: DecompPaletteRuntime,
  palStruct: PaletteStruct,
  _unkFlagsRef: { value: number }
): void => {
  if (runtime.gPaletteFade.active && ((1 << (palStruct.baseDestOffset >> 4)) & runtime.gPaletteFade.multipurpose1)) {
    if (!palStruct.template.pst_field_8_0) {
      if (runtime.gPaletteFade.delayCounter !== runtime.gPaletteFade.multipurpose2) {
        BlendPalette(
          runtime,
          palStruct.baseDestOffset,
          palStruct.template.size,
          runtime.gPaletteFade.y,
          runtime.gPaletteFade.blendColor
        );
      }
    } else if (!runtime.gPaletteFade.delayCounter) {
      if (palStruct.countdown1 !== palStruct.template.time1) {
        const srcOffset = palStruct.srcIndex * palStruct.template.size;
        for (let i = 0; i < palStruct.template.size; i++) {
          runtime.gPlttBufferFaded[palStruct.baseDestOffset + i] = u16(palStruct.template.src[srcOffset + i] ?? 0);
        }
      }
    }
  }
};

export const PaletteStruct_TryEnd = (runtime: DecompPaletteRuntime, palStruct: PaletteStruct): void => {
  if (!palStruct.countdown2) {
    const state = palStruct.template.state;
    if (state === 0) {
      palStruct.srcIndex = 0;
      palStruct.countdown1 = palStruct.template.time1;
      palStruct.countdown2 = palStruct.template.time2;
      palStruct.destOffset = palStruct.baseDestOffset;
    } else {
      if (state < 0) {
        return;
      }
      if (state > 2) {
        return;
      }
      PaletteStruct_ResetById(runtime, palStruct.template.id);
    }
  } else {
    palStruct.countdown2--;
  }
};

export const PaletteStruct_ResetById = (runtime: DecompPaletteRuntime, id: number): void => {
  const paletteNum = PaletteStruct_GetPalNum(runtime, id);
  if (paletteNum !== NUM_PALETTE_STRUCTS) {
    PaletteStruct_Reset(runtime, paletteNum);
  }
};

export const PaletteStruct_Reset = (runtime: DecompPaletteRuntime, paletteNum: number): void => {
  runtime.sPaletteStructs[paletteNum] = createPaletteStruct();
};

export const ResetPaletteFadeControl = (runtime: DecompPaletteRuntime): void => {
  const fade = runtime.gPaletteFade;
  fade.multipurpose1 = 0;
  fade.multipurpose2 = 0;
  fade.delayCounter = 0;
  fade.y = 0;
  fade.targetY = 0;
  fade.blendColor = 0;
  fade.active = false;
  fade.multipurpose2 = 0;
  fade.yDec = false;
  fade.bufferTransferDisabled = false;
  fade.shouldResetBlendRegisters = false;
  fade.hardwareFadeFinishing = false;
  fade.softwareFadeFinishing = false;
  fade.softwareFadeFinishingCounter = 0;
  fade.objPaletteToggle = 0;
  fade.deltaY = 2;
};

export const PaletteStruct_SetUnusedFlag = (runtime: DecompPaletteRuntime, id: number): void => {
  const paletteNum = PaletteStruct_GetPalNum(runtime, id);
  if (paletteNum !== NUM_PALETTE_STRUCTS) {
    runtime.sPaletteStructs[paletteNum].flag = true;
  }
};

export const PaletteStruct_ClearUnusedFlag = (runtime: DecompPaletteRuntime, id: number): void => {
  const paletteNum = PaletteStruct_GetPalNum(runtime, id);
  if (paletteNum !== NUM_PALETTE_STRUCTS) {
    runtime.sPaletteStructs[paletteNum].flag = false;
  }
};

export const PaletteStruct_GetPalNum = (runtime: DecompPaletteRuntime, id: number): number => {
  for (let i = 0; i < NUM_PALETTE_STRUCTS; i++) {
    if (runtime.sPaletteStructs[i].template.id === id) {
      return i;
    }
  }
  return NUM_PALETTE_STRUCTS;
};

export const UpdateNormalPaletteFade = (runtime: DecompPaletteRuntime): number => {
  const fade = runtime.gPaletteFade;
  if (!fade.active) {
    return PALETTE_FADE_STATUS_DONE;
  }
  if (IsSoftwarePaletteFadeFinishing(runtime)) {
    return fade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
  }

  if (!fade.objPaletteToggle) {
    if (fade.delayCounter < fade.multipurpose2) {
      fade.delayCounter++;
      return PALETTE_FADE_STATUS_DELAY;
    }
    fade.delayCounter = 0;
  }

  let paletteOffset = 0;
  let selectedPalettes: number;
  if (!fade.objPaletteToggle) {
    selectedPalettes = fade.multipurpose1 & 0xffff;
  } else {
    selectedPalettes = (fade.multipurpose1 >>> 16) & 0xffff;
    paletteOffset = OBJ_PLTT_OFFSET;
  }

  while (selectedPalettes) {
    if (selectedPalettes & 1) {
      BlendPalette(runtime, paletteOffset, 16, fade.y, fade.blendColor);
    }
    selectedPalettes >>>= 1;
    paletteOffset += 16;
  }

  fade.objPaletteToggle ^= 1;
  if (!fade.objPaletteToggle) {
    if (fade.y === fade.targetY) {
      fade.multipurpose1 = 0;
      fade.softwareFadeFinishing = true;
    } else {
      let val = s8(fade.y);
      if (!fade.yDec) {
        val = s8(val + fade.deltaY);
        if (val > fade.targetY) {
          val = fade.targetY;
        }
      } else {
        val = s8(val - fade.deltaY);
        if (val < fade.targetY) {
          val = fade.targetY;
        }
      }
      fade.y = val & 0x1f;
    }
  }
  return fade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
};

export const InvertPlttBuffer = (runtime: DecompPaletteRuntime, selectedPalettes: number): void => {
  let paletteOffset = 0;
  let selected = u32(selectedPalettes);
  while (selected) {
    if (selected & 1) {
      for (let i = 0; i < 16; i++) {
        runtime.gPlttBufferFaded[paletteOffset + i] = u16(~runtime.gPlttBufferFaded[paletteOffset + i]);
      }
    }
    selected >>>= 1;
    paletteOffset += 16;
  }
};

export const TintPlttBuffer = (
  runtime: DecompPaletteRuntime,
  selectedPalettes: number,
  r: number,
  g: number,
  b: number
): void => {
  let paletteOffset = 0;
  let selected = u32(selectedPalettes);
  const sr = s8(r);
  const sg = s8(g);
  const sb = s8(b);
  while (selected) {
    if (selected & 1) {
      for (let i = 0; i < 16; i++) {
        const color = runtime.gPlttBufferFaded[paletteOffset + i];
        runtime.gPlttBufferFaded[paletteOffset + i] = RGB(
          u5(GET_R(color) + sr),
          u5(GET_G(color) + sg),
          u5(GET_B(color) + sb)
        );
      }
    }
    selected >>>= 1;
    paletteOffset += 16;
  }
};

export const UnfadePlttBuffer = (runtime: DecompPaletteRuntime, selectedPalettes: number): void => {
  let paletteOffset = 0;
  let selected = u32(selectedPalettes);
  while (selected) {
    if (selected & 1) {
      for (let i = 0; i < 16; i++) {
        runtime.gPlttBufferFaded[paletteOffset + i] = runtime.gPlttBufferUnfaded[paletteOffset + i];
      }
    }
    selected >>>= 1;
    paletteOffset += 16;
  }
};

export const BeginFastPaletteFade = (runtime: DecompPaletteRuntime, submode: number): void => {
  runtime.gPaletteFade.deltaY = 2;
  BeginFastPaletteFadeInternal(runtime, submode);
};

export const BeginFastPaletteFadeInternal = (runtime: DecompPaletteRuntime, submode: number): void => {
  runtime.gPaletteFade.y = 31;
  runtime.gPaletteFade.multipurpose2 = submode & 0x3f;
  runtime.gPaletteFade.active = true;
  runtime.gPaletteFade.mode = FAST_FADE;
  if (submode === FAST_FADE_IN_FROM_BLACK) {
    fill16(RGB_BLACK, runtime.gPlttBufferFaded, 0, PLTT_SIZE);
  }
  if (submode === FAST_FADE_IN_FROM_WHITE) {
    fill16(RGB_WHITE, runtime.gPlttBufferFaded, 0, PLTT_SIZE);
  }
  UpdatePaletteFade(runtime);
};

export const UpdateFastPaletteFade = (runtime: DecompPaletteRuntime): number => {
  const fade = runtime.gPaletteFade;
  if (!fade.active) {
    return PALETTE_FADE_STATUS_DONE;
  }
  if (IsSoftwarePaletteFadeFinishing(runtime)) {
    return fade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
  }

  const paletteOffsetStart = fade.objPaletteToggle ? OBJ_PLTT_OFFSET : 0;
  const paletteOffsetEnd = fade.objPaletteToggle ? PLTT_BUFFER_SIZE : OBJ_PLTT_OFFSET;
  switch (fade.multipurpose2) {
    case FAST_FADE_IN_FROM_WHITE:
      for (let i = paletteOffsetStart; i < paletteOffsetEnd; i++) {
        const unfaded = runtime.gPlttBufferUnfaded[i];
        const faded = runtime.gPlttBufferFaded[i];
        let r = s8(GET_R(faded) - 2);
        let g = s8(GET_G(faded) - 2);
        let b = s8(GET_B(faded) - 2);
        if (r < GET_R(unfaded)) r = GET_R(unfaded);
        if (g < GET_G(unfaded)) g = GET_G(unfaded);
        if (b < GET_B(unfaded)) b = GET_B(unfaded);
        runtime.gPlttBufferFaded[i] = RGB(r, g, b);
      }
      break;
    case FAST_FADE_OUT_TO_WHITE:
      for (let i = paletteOffsetStart; i < paletteOffsetEnd; i++) {
        const data = runtime.gPlttBufferFaded[i];
        let r = s8(GET_R(data) + 2);
        let g = s8(GET_G(data) + 2);
        let b = s8(GET_B(data) + 2);
        if (r > 31) r = 31;
        if (g > 31) g = 31;
        if (b > 31) b = 31;
        runtime.gPlttBufferFaded[i] = RGB(r, g, b);
      }
      break;
    case FAST_FADE_IN_FROM_BLACK:
      for (let i = paletteOffsetStart; i < paletteOffsetEnd; i++) {
        const unfaded = runtime.gPlttBufferUnfaded[i];
        const faded = runtime.gPlttBufferFaded[i];
        let r = s8(GET_R(faded) + 2);
        let g = s8(GET_G(faded) + 2);
        let b = s8(GET_B(faded) + 2);
        if (r > GET_R(unfaded)) r = GET_R(unfaded);
        if (g > GET_G(unfaded)) g = GET_G(unfaded);
        if (b > GET_B(unfaded)) b = GET_B(unfaded);
        runtime.gPlttBufferFaded[i] = RGB(r, g, b);
      }
      break;
    case FAST_FADE_OUT_TO_BLACK:
      for (let i = paletteOffsetStart; i < paletteOffsetEnd; i++) {
        const data = runtime.gPlttBufferFaded[i];
        let r = s8(GET_R(data) - 2);
        let g = s8(GET_G(data) - 2);
        let b = s8(GET_B(data) - 2);
        if (r < 0) r = 0;
        if (g < 0) g = 0;
        if (b < 0) b = 0;
        runtime.gPlttBufferFaded[i] = RGB(r, g, b);
      }
      break;
    default:
      break;
  }

  fade.objPaletteToggle ^= 1;
  if (fade.objPaletteToggle) {
    return fade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
  }
  if (fade.y - fade.deltaY < 0) {
    fade.y = 0;
  } else {
    fade.y -= fade.deltaY;
  }
  if (fade.y === 0) {
    switch (fade.multipurpose2) {
      case FAST_FADE_IN_FROM_WHITE:
      case FAST_FADE_IN_FROM_BLACK:
        runtime.gPlttBufferFaded.set(runtime.gPlttBufferUnfaded);
        break;
      case FAST_FADE_OUT_TO_WHITE:
        fill16(0xffff, runtime.gPlttBufferFaded, 0, PLTT_SIZE);
        break;
      case FAST_FADE_OUT_TO_BLACK:
        fill16(0x0000, runtime.gPlttBufferFaded, 0, PLTT_SIZE);
        break;
      default:
        break;
    }
    fade.mode = NORMAL_FADE;
    fade.softwareFadeFinishing = true;
  }
  return fade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
};

export const BeginHardwarePaletteFade = (
  runtime: DecompPaletteRuntime,
  blendCnt: number,
  delay: number,
  y: number,
  targetY: number,
  shouldResetBlendRegisters: number
): void => {
  const fade = runtime.gPaletteFade;
  fade.multipurpose1 = blendCnt & 0xff;
  fade.delayCounter = delay & 0x3f;
  fade.multipurpose2 = delay & 0x3f;
  fade.y = y & 0x1f;
  fade.targetY = targetY & 0x1f;
  fade.active = true;
  fade.mode = HARDWARE_FADE;
  fade.shouldResetBlendRegisters = boolBit(shouldResetBlendRegisters);
  fade.hardwareFadeFinishing = false;
  fade.yDec = y >= targetY;
};

export const UpdateHardwarePaletteFade = (runtime: DecompPaletteRuntime): number => {
  const fade = runtime.gPaletteFade;
  if (!fade.active) {
    return PALETTE_FADE_STATUS_DONE;
  }
  if (fade.delayCounter < fade.multipurpose2) {
    fade.delayCounter++;
    return PALETTE_FADE_STATUS_DELAY;
  }
  fade.delayCounter = 0;
  if (!fade.yDec) {
    fade.y++;
    if (fade.y > fade.targetY) {
      fade.hardwareFadeFinishing = true;
      fade.y--;
    }
  } else {
    const previous = fade.y;
    fade.y = u5(fade.y - 1);
    if (previous - 1 < fade.targetY) {
      fade.hardwareFadeFinishing = true;
      fade.y = u5(fade.y + 1);
    }
  }

  if (fade.hardwareFadeFinishing) {
    if (fade.shouldResetBlendRegisters) {
      fade.multipurpose1 = 0;
      fade.y = 0;
    }
    fade.shouldResetBlendRegisters = false;
  }
  return fade.active ? PALETTE_FADE_STATUS_ACTIVE : PALETTE_FADE_STATUS_DONE;
};

export const SetGpuReg = (runtime: DecompPaletteRuntime, reg: number, value: number): void => {
  runtime.gpuRegs.set(reg, u16(value));
  runtime.operations.push(`SetGpuReg:${reg}:${u16(value)}`);
};

export const UpdateBlendRegisters = (runtime: DecompPaletteRuntime): void => {
  const fade = runtime.gPaletteFade;
  SetGpuReg(runtime, REG_OFFSET_BLDCNT, fade.multipurpose1);
  SetGpuReg(runtime, REG_OFFSET_BLDY, fade.y);
  if (fade.hardwareFadeFinishing) {
    fade.hardwareFadeFinishing = false;
    fade.mode = 0;
    fade.multipurpose1 = 0;
    fade.y = 0;
    fade.active = false;
  }
};

export const IsSoftwarePaletteFadeFinishing = (runtime: DecompPaletteRuntime): boolean => {
  const fade = runtime.gPaletteFade;
  if (fade.softwareFadeFinishing) {
    if (fade.softwareFadeFinishingCounter === 4) {
      fade.active = false;
      fade.softwareFadeFinishing = false;
      fade.softwareFadeFinishingCounter = 0;
    } else {
      fade.softwareFadeFinishingCounter++;
    }
    return true;
  }
  return false;
};

export const BlendPalette = (
  runtime: DecompPaletteRuntime,
  palOffset: number,
  numEntries: number,
  coeff: number,
  blendColor: number
): void => {
  const blendR = GET_R(blendColor);
  const blendG = GET_G(blendColor);
  const blendB = GET_B(blendColor);
  for (let i = 0; i < numEntries; i++) {
    const index = i + palOffset;
    const data1 = runtime.gPlttBufferUnfaded[index];
    const r = s8(GET_R(data1));
    const g = s8(GET_G(data1));
    const b = s8(GET_B(data1));
    runtime.gPlttBufferFaded[index] = RGB(
      r + (((blendR - r) * coeff) >> 4),
      g + (((blendG - g) * coeff) >> 4),
      b + (((blendB - b) * coeff) >> 4)
    );
  }
};

export const BlendPalettes = (
  runtime: DecompPaletteRuntime,
  selectedPalettes: number,
  coeff: number,
  color: number
): void => {
  let paletteOffset = 0;
  let selected = u32(selectedPalettes);
  while (selected) {
    if (selected & 1) {
      BlendPalette(runtime, paletteOffset, 16, coeff, color);
    }
    selected >>>= 1;
    paletteOffset += 16;
  }
};

export const BlendPalettesUnfaded = (
  runtime: DecompPaletteRuntime,
  selectedPalettes: number,
  coeff: number,
  color: number
): void => {
  runtime.gPlttBufferFaded.set(runtime.gPlttBufferUnfaded);
  BlendPalettes(runtime, selectedPalettes, coeff, color);
};

export const TintPalette_GrayScale = (palette: Uint16Array, count: number, offset = 0): void => {
  for (let i = 0; i < count; i++) {
    const index = offset + i;
    const color = palette[index];
    const gray = (GET_R(color) * q8_8(0.3) + GET_G(color) * q8_8(0.59) + GET_B(color) * q8_8(0.1133)) >> 8;
    palette[index] = RGB2(gray, gray, gray);
  }
};

export const TintPalette_GrayScale2 = (palette: Uint16Array, count: number, offset = 0): void => {
  for (let i = 0; i < count; i++) {
    const index = offset + i;
    const color = palette[index];
    let gray = (GET_R(color) * q8_8(0.3) + GET_G(color) * q8_8(0.59) + GET_B(color) * q8_8(0.1133)) >> 8;
    if (gray > 31) {
      gray = 31;
    }
    gray = sRoundedDownGrayscaleMap[gray] ?? 31;
    palette[index] = RGB2(gray, gray, gray);
  }
};

export const TintPalette_SepiaTone = (palette: Uint16Array, count: number, offset = 0): void => {
  for (let i = 0; i < count; i++) {
    const index = offset + i;
    const color = palette[index];
    const gray = (GET_R(color) * q8_8(0.3) + GET_G(color) * q8_8(0.59) + GET_B(color) * q8_8(0.1133)) >> 8;
    let r = s16(q8_8(1.2) * gray) >> 8;
    const g = s16(q8_8(1.0) * gray) >> 8;
    const b = s16(q8_8(0.94) * gray) >> 8;
    if (r > 31) {
      r = 31;
    }
    palette[index] = RGB2(r, g, b);
  }
};

export const TintPalette_CustomTone = (
  palette: Uint16Array,
  count: number,
  rTone: number,
  gTone: number,
  bTone: number,
  offset = 0
): void => {
  for (let i = 0; i < count; i++) {
    const index = offset + i;
    const color = palette[index];
    const gray = (GET_R(color) * q8_8(0.3) + GET_G(color) * q8_8(0.59) + GET_B(color) * q8_8(0.1133)) >> 8;
    let r = (u16(rTone) * gray) >> 8;
    let g = (u16(gTone) * gray) >> 8;
    let b = (u16(bTone) * gray) >> 8;
    if (r > 31) r = 31;
    if (g > 31) g = 31;
    if (b > 31) b = 31;
    palette[index] = RGB2(r, g, b);
  }
};

export const CopyPaletteInvertedTint = (
  src: ArrayLike<number>,
  dst: Uint16Array,
  count: number,
  tone: number,
  srcOffset = 0,
  dstOffset = 0
): void => {
  if (!tone) {
    for (let i = 0; i < count; i++) {
      dst[dstOffset + i] = u16(src[srcOffset + i] ?? 0);
    }
  } else {
    for (let i = 0; i < count; i++) {
      const color = src[srcOffset + i] ?? 0;
      let r = GET_R(color);
      let g = GET_G(color);
      let b = GET_B(color);
      const gray = (r * q8_8(0.3) + g * q8_8(0.59) + b * q8_8(0.1133)) >> 8;
      r += (tone * (gray - r)) >> 4;
      g += (tone * (gray - g)) >> 4;
      b += (tone * (gray - b)) >> 4;
      dst[dstOffset + i] = RGB2(r, g, b);
    }
  }
};

export const ResetTasks = (runtime: DecompPaletteRuntime): void => {
  for (let i = 0; i < NUM_TASKS; i++) {
    runtime.gTasks[i].isActive = false;
    runtime.gTasks[i].func = 'TaskDummy';
    runtime.gTasks[i].prev = i;
    runtime.gTasks[i].next = i + 1;
    runtime.gTasks[i].priority = 0xff;
    runtime.gTasks[i].data.fill(0);
  }
  runtime.gTasks[0].prev = 0xfe;
  runtime.gTasks[NUM_TASKS - 1].next = 0xff;
};

const findFirstActiveTask = (runtime: DecompPaletteRuntime): number => {
  for (let taskId = 0; taskId < NUM_TASKS; taskId++) {
    if (runtime.gTasks[taskId].isActive === true && runtime.gTasks[taskId].prev === 0xfe) {
      return taskId;
    }
  }
  return NUM_TASKS;
};

const insertTask = (runtime: DecompPaletteRuntime, newTaskId: number): void => {
  let taskId = findFirstActiveTask(runtime);
  if (taskId === NUM_TASKS) {
    runtime.gTasks[newTaskId].prev = 0xfe;
    runtime.gTasks[newTaskId].next = 0xff;
    return;
  }

  while (true) {
    if (runtime.gTasks[newTaskId].priority < runtime.gTasks[taskId].priority) {
      runtime.gTasks[newTaskId].prev = runtime.gTasks[taskId].prev;
      runtime.gTasks[newTaskId].next = taskId;
      if (runtime.gTasks[taskId].prev !== 0xfe) {
        runtime.gTasks[runtime.gTasks[taskId].prev].next = newTaskId;
      }
      runtime.gTasks[taskId].prev = newTaskId;
      return;
    }
    if (runtime.gTasks[taskId].next === 0xff) {
      runtime.gTasks[newTaskId].prev = taskId;
      runtime.gTasks[newTaskId].next = runtime.gTasks[taskId].next;
      runtime.gTasks[taskId].next = newTaskId;
      return;
    }
    taskId = runtime.gTasks[taskId].next;
  }
};

export const CreateTask = (
  runtime: DecompPaletteRuntime,
  func: PaletteTask['func'],
  priority: number
): number => {
  for (let i = 0; i < NUM_TASKS; i++) {
    if (!runtime.gTasks[i].isActive) {
      runtime.gTasks[i].func = func;
      runtime.gTasks[i].priority = priority & 0xff;
      insertTask(runtime, i);
      runtime.gTasks[i].data.fill(0);
      runtime.gTasks[i].isActive = true;
      return i;
    }
  }
  return 0;
};

export const DestroyTask = (runtime: DecompPaletteRuntime, taskId: number): void => {
  if (runtime.gTasks[taskId]?.isActive) {
    const task = runtime.gTasks[taskId];
    task.isActive = false;
    if (task.prev === 0xfe) {
      if (task.next !== 0xff) {
        runtime.gTasks[task.next].prev = 0xfe;
      }
    } else if (task.next === 0xff) {
      runtime.gTasks[task.prev].next = 0xff;
    } else {
      runtime.gTasks[task.prev].next = task.next;
      runtime.gTasks[task.next].prev = task.prev;
    }
  }
};

export const RunTasks = (runtime: DecompPaletteRuntime): void => {
  let taskId = findFirstActiveTask(runtime);
  if (taskId !== NUM_TASKS) {
    do {
      const nextTaskId = runtime.gTasks[taskId].next;
      if (runtime.gTasks[taskId].func === 'Task_BlendPalettesGradually') {
        Task_BlendPalettesGradually(runtime, taskId);
      }
      taskId = nextTaskId;
    } while (taskId !== 0xff);
  }
};

export const FindTaskIdByFunc = (runtime: DecompPaletteRuntime, func: PaletteTask['func']): number => {
  for (let i = 0; i < NUM_TASKS; i++) {
    if (runtime.gTasks[i].isActive === true && runtime.gTasks[i].func === func) {
      return i;
    }
  }
  return TASK_NONE;
};

export const SetWordTaskArg = (
  runtime: DecompPaletteRuntime,
  taskId: number,
  dataElem: number,
  value: number
): void => {
  if (dataElem <= 14) {
    runtime.gTasks[taskId].data[dataElem] = s16(value);
    runtime.gTasks[taskId].data[dataElem + 1] = s16(value >>> 16);
  }
};

export const GetWordTaskArg = (
  runtime: DecompPaletteRuntime,
  taskId: number,
  dataElem: number
): number => {
  if (dataElem <= 14) {
    return u32((runtime.gTasks[taskId].data[dataElem] & 0xffff) | (runtime.gTasks[taskId].data[dataElem + 1] << 16));
  }
  return 0;
};

export const BlendPalettesGradually = (
  runtime: DecompPaletteRuntime,
  selectedPalettes: number,
  delay: number,
  coeff: number,
  coeffTarget: number,
  color: number,
  priority: number,
  id: number
): void => {
  const taskId = CreateTask(runtime, 'Task_BlendPalettesGradually', priority);
  const task = runtime.gTasks[taskId];
  task.data[0] = s16(coeff);
  task.data[1] = s16(coeffTarget);
  if (s8(delay) >= 0) {
    task.data[3] = s16(delay);
    task.data[2] = 1;
  } else {
    task.data[3] = 0;
    task.data[2] = s16(-s8(delay) + 1);
  }
  if (coeffTarget < coeff) {
    task.data[2] = s16(task.data[2] * -1);
  }
  SetWordTaskArg(runtime, taskId, 5, selectedPalettes);
  task.data[7] = s16(color);
  task.data[8] = s16(id);
  Task_BlendPalettesGradually(runtime, taskId);
};

export const IsBlendPalettesGraduallyTaskActive = (runtime: DecompPaletteRuntime, id: number): boolean => {
  for (let i = 0; i < NUM_TASKS; i++) {
    const task = runtime.gTasks[i];
    if (task.isActive === true && task.func === 'Task_BlendPalettesGradually' && task.data[8] === s16(id)) {
      return true;
    }
  }
  return false;
};

export const DestroyBlendPalettesGraduallyTask = (runtime: DecompPaletteRuntime): void => {
  while (true) {
    const taskId = FindTaskIdByFunc(runtime, 'Task_BlendPalettesGradually');
    if (taskId === TASK_NONE) {
      break;
    }
    DestroyTask(runtime, taskId);
  }
};

export const Task_BlendPalettesGradually = (runtime: DecompPaletteRuntime, taskId: number): void => {
  const data = runtime.gTasks[taskId].data;
  const palettes = GetWordTaskArg(runtime, taskId, 5);
  data[4] = s16(data[4] + 1);
  if (data[4] > data[3]) {
    data[4] = 0;
    BlendPalettes(runtime, palettes, data[0], data[7]);
    const target = data[1];
    if (data[0] === target) {
      DestroyTask(runtime, taskId);
    } else {
      data[0] = s16(data[0] + data[2]);
      if (data[2] >= 0) {
        if (data[0] < target) {
          return;
        }
      } else if (data[0] > target) {
        return;
      }
      data[0] = target;
    }
  }
};
