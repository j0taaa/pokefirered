export const GPU_REG_BUF_SIZE = 0x60;
export const EMPTY_GPU_REG_SLOT = 0xff;

export const REG_OFFSET_DISPCNT = 0x00;
export const REG_OFFSET_DISPSTAT = 0x04;
export const REG_OFFSET_VCOUNT = 0x06;

export const DISPCNT_FORCED_BLANK = 0x0080;
export const DISPSTAT_VBLANK_INTR = 0x0008;
export const DISPSTAT_HBLANK_INTR = 0x0010;
export const INTR_FLAG_VBLANK = 0x0001;
export const INTR_FLAG_HBLANK = 0x0002;

export interface GpuRegManagerState {
  buffer: Uint16Array;
  waitingList: Uint8Array;
  hardwareRegs: Uint16Array;
  bufferLocked: boolean;
  shouldSyncRegIE: boolean;
  regIE: number;
  regIME: number;
}

export const createGpuRegManagerState = (): GpuRegManagerState => ({
  buffer: new Uint16Array(GPU_REG_BUF_SIZE / 2),
  waitingList: new Uint8Array(GPU_REG_BUF_SIZE).fill(EMPTY_GPU_REG_SLOT),
  hardwareRegs: new Uint16Array(GPU_REG_BUF_SIZE / 2),
  bufferLocked: false,
  shouldSyncRegIE: false,
  regIE: 0,
  regIME: 0
});

const normalizeU8 = (value: number): number => value & 0xff;
const normalizeU16 = (value: number): number => value & 0xffff;
const regIndex = (regOffset: number): number => normalizeU8(regOffset) >>> 1;

const getBufferedReg = (state: GpuRegManagerState, regOffset: number): number =>
  state.buffer[regIndex(regOffset)] ?? 0;

const setBufferedReg = (
  state: GpuRegManagerState,
  regOffset: number,
  value: number
): void => {
  state.buffer[regIndex(regOffset)] = normalizeU16(value);
};

const getHardwareReg = (state: GpuRegManagerState, regOffset: number): number =>
  state.hardwareRegs[regIndex(regOffset)] ?? 0;

const setHardwareReg = (
  state: GpuRegManagerState,
  regOffset: number,
  value: number
): void => {
  state.hardwareRegs[regIndex(regOffset)] = normalizeU16(value);
};

export const initGpuRegManager = (state: GpuRegManagerState = createGpuRegManagerState()): GpuRegManagerState => {
  state.buffer.fill(0);
  state.waitingList.fill(EMPTY_GPU_REG_SLOT);
  state.hardwareRegs.fill(0);
  state.bufferLocked = false;
  state.shouldSyncRegIE = false;
  state.regIE = 0;
  return state;
};

export const copyBufferedValueToGpuReg = (
  state: GpuRegManagerState,
  regOffset: number
): void => {
  const offset = normalizeU8(regOffset);
  if (offset === REG_OFFSET_DISPSTAT) {
    const current = getHardwareReg(state, REG_OFFSET_DISPSTAT);
    const masked = current & ~(DISPSTAT_HBLANK_INTR | DISPSTAT_VBLANK_INTR);
    setHardwareReg(state, REG_OFFSET_DISPSTAT, masked | getBufferedReg(state, REG_OFFSET_DISPSTAT));
    return;
  }

  setHardwareReg(state, offset, getBufferedReg(state, offset));
};

export const copyBufferedValuesToGpuRegs = (state: GpuRegManagerState): void => {
  if (state.bufferLocked) {
    return;
  }

  for (let i = 0; i < GPU_REG_BUF_SIZE; i += 1) {
    const regOffset = state.waitingList[i];
    if (regOffset === EMPTY_GPU_REG_SLOT) {
      return;
    }

    copyBufferedValueToGpuReg(state, regOffset);
    state.waitingList[i] = EMPTY_GPU_REG_SLOT;
  }
};

export const setGpuReg = (
  state: GpuRegManagerState,
  regOffset: number,
  value: number
): void => {
  const offset = normalizeU8(regOffset);
  if (offset >= GPU_REG_BUF_SIZE) {
    return;
  }

  setBufferedReg(state, offset, value);

  const vcount = getHardwareReg(state, REG_OFFSET_VCOUNT) & 0xff;
  const dispcnt = getHardwareReg(state, REG_OFFSET_DISPCNT);
  if ((vcount >= 161 && vcount <= 225) || (dispcnt & DISPCNT_FORCED_BLANK) !== 0) {
    copyBufferedValueToGpuReg(state, offset);
    return;
  }

  state.bufferLocked = true;
  for (let i = 0; i < GPU_REG_BUF_SIZE; i += 1) {
    if (state.waitingList[i] === offset) {
      state.bufferLocked = false;
      return;
    }

    if (state.waitingList[i] === EMPTY_GPU_REG_SLOT) {
      state.waitingList[i] = offset;
      state.bufferLocked = false;
      return;
    }
  }
  state.bufferLocked = false;
};

export const getGpuReg = (state: GpuRegManagerState, regOffset: number): number => {
  const offset = normalizeU8(regOffset);
  if (offset === REG_OFFSET_DISPSTAT || offset === REG_OFFSET_VCOUNT) {
    return getHardwareReg(state, offset);
  }

  return getBufferedReg(state, offset);
};

export const setGpuRegBits = (
  state: GpuRegManagerState,
  regOffset: number,
  mask: number
): void => {
  setGpuReg(state, regOffset, getBufferedReg(state, regOffset) | mask);
};

export const clearGpuRegBits = (
  state: GpuRegManagerState,
  regOffset: number,
  mask: number
): void => {
  setGpuReg(state, regOffset, getBufferedReg(state, regOffset) & ~mask);
};

export const syncRegIE = (state: GpuRegManagerState): void => {
  if (!state.shouldSyncRegIE) {
    return;
  }

  const temp = state.regIME;
  state.regIME = 0;
  state.regIE = normalizeU16(state.regIE);
  state.regIME = temp;
  state.shouldSyncRegIE = false;
};

export const updateRegDispstatIntrBits = (
  state: GpuRegManagerState,
  regIE: number
): void => {
  const oldValue = getGpuReg(state, REG_OFFSET_DISPSTAT) & (DISPSTAT_HBLANK_INTR | DISPSTAT_VBLANK_INTR);
  let newValue = 0;

  if ((regIE & INTR_FLAG_VBLANK) !== 0) {
    newValue |= DISPSTAT_VBLANK_INTR;
  }

  if ((regIE & INTR_FLAG_HBLANK) !== 0) {
    newValue |= DISPSTAT_HBLANK_INTR;
  }

  if (oldValue !== newValue) {
    setGpuReg(state, REG_OFFSET_DISPSTAT, newValue);
  }
};

export const enableInterrupts = (
  state: GpuRegManagerState,
  mask: number
): void => {
  state.regIE = normalizeU16(state.regIE | mask);
  state.shouldSyncRegIE = true;
  syncRegIE(state);
  updateRegDispstatIntrBits(state, state.regIE);
};

export const disableInterrupts = (
  state: GpuRegManagerState,
  mask: number
): void => {
  state.regIE = normalizeU16(state.regIE & ~mask);
  state.shouldSyncRegIE = true;
  syncRegIE(state);
  updateRegDispstatIntrBits(state, state.regIE);
};

export const peekBufferedGpuReg = (state: GpuRegManagerState, regOffset: number): number =>
  getBufferedReg(state, regOffset);

export const peekHardwareGpuReg = (state: GpuRegManagerState, regOffset: number): number =>
  getHardwareReg(state, regOffset);

export const pokeHardwareGpuReg = (
  state: GpuRegManagerState,
  regOffset: number,
  value: number
): void => {
  setHardwareReg(state, regOffset, value);
};

export const InitGpuRegManager = initGpuRegManager;
export const CopyBufferedValueToGpuReg = copyBufferedValueToGpuReg;
export const CopyBufferedValuesToGpuRegs = copyBufferedValuesToGpuRegs;
export const SetGpuReg = setGpuReg;
export const GetGpuReg = getGpuReg;
export const SetGpuRegBits = setGpuRegBits;
export const ClearGpuRegBits = clearGpuRegBits;
export const SyncRegIE = syncRegIE;
export const EnableInterrupts = enableInterrupts;
export const DisableInterrupts = disableInterrupts;
export const UpdateRegDispstatIntrBits = updateRegDispstatIntrBits;
