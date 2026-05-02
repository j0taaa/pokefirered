export const FLASH_ROM_SIZE_1M = 0x20000;
export const SECTORS_PER_BANK = 16;
export const WAITCNT_SRAM_MASK = 0x0003;
export const WAITCNT_SRAM_8 = 0x0003;
export const INTR_FLAG_TIMER0 = 1 << 3;

export interface FlashType {
  romSize: number;
  sector: {
    shift: number;
    size: number;
  };
}

export interface AgbFlashRuntime {
  timerNum: number;
  timerCount: number;
  timerReg: [number, number];
  savedIme: number;
  flashTimeoutFlag: number;
  pollFlashStatus: 'ReadFlash1' | null;
  flash: FlashType;
  flashMaxTime: number[];
  flashMemory: Uint8Array;
  currentBank: number;
  flashWrites: { address: number; value: number }[];
  regIme: number;
  regIe: number;
  regIf: number;
  regWaitcnt: number;
  programFlashSectorResults: number[];
  programFlashSectorCalls: { sectorNum: number; src: Uint8Array }[];
}

export const createAgbFlashRuntime = (
  flash: FlashType = { romSize: FLASH_ROM_SIZE_1M, sector: { shift: 12, size: 0x1000 } }
): AgbFlashRuntime => ({
  timerNum: 0,
  timerCount: 0,
  timerReg: [0, 0],
  savedIme: 0,
  flashTimeoutFlag: 0,
  pollFlashStatus: null,
  flash,
  flashMaxTime: Array.from({ length: 12 }, (_unused, i) => i + 1),
  flashMemory: new Uint8Array(2 * SECTORS_PER_BANK * flash.sector.size),
  currentBank: 0,
  flashWrites: [],
  regIme: 1,
  regIe: 0,
  regIf: 0,
  regWaitcnt: 0,
  programFlashSectorResults: [],
  programFlashSectorCalls: []
});

const flashWrite = (runtime: AgbFlashRuntime, address: number, value: number): void => {
  runtime.flashWrites.push({ address: address & 0xffff, value: value & 0xff });
};

export const switchFlashBank = (runtime: AgbFlashRuntime, bankNum: number): void => {
  flashWrite(runtime, 0x5555, 0xaa);
  flashWrite(runtime, 0x2aaa, 0x55);
  flashWrite(runtime, 0x5555, 0xb0);
  flashWrite(runtime, 0x0000, bankNum);
  runtime.currentBank = bankNum & 0xff;
};

export const readFlashId = (runtime: AgbFlashRuntime): number => {
  runtime.pollFlashStatus = 'ReadFlash1';
  flashWrite(runtime, 0x5555, 0xaa);
  flashWrite(runtime, 0x2aaa, 0x55);
  flashWrite(runtime, 0x5555, 0x90);
  const flashId = ((runtime.flashMemory[1] << 8) | runtime.flashMemory[0]) & 0xffff;
  flashWrite(runtime, 0x5555, 0xaa);
  flashWrite(runtime, 0x2aaa, 0x55);
  flashWrite(runtime, 0x5555, 0xf0);
  flashWrite(runtime, 0x5555, 0xf0);
  return flashId;
};

export const flashTimerIntr = (runtime: AgbFlashRuntime): void => {
  if (runtime.timerCount !== 0 && --runtime.timerCount === 0) {
    runtime.flashTimeoutFlag = 1;
  }
};

export const setFlashTimerIntr = (
  runtime: AgbFlashRuntime,
  timerNum: number,
  intrFunc: { value: string | null }
): number => {
  if (timerNum >= 4) {
    return 1;
  }
  runtime.timerNum = timerNum & 0xff;
  intrFunc.value = 'FlashTimerIntr';
  return 0;
};

export const startFlashTimer = (runtime: AgbFlashRuntime, phase: number): void => {
  let index = phase * 3;
  runtime.savedIme = runtime.regIme;
  runtime.regIme = 0;
  runtime.timerReg[1] = 0;
  runtime.regIe |= INTR_FLAG_TIMER0 << runtime.timerNum;
  runtime.flashTimeoutFlag = 0;
  runtime.timerCount = runtime.flashMaxTime[index++] & 0xffff;
  runtime.timerReg[0] = runtime.flashMaxTime[index++] & 0xffff;
  runtime.timerReg[1] = runtime.flashMaxTime[index++] & 0xffff;
  runtime.regIf = INTR_FLAG_TIMER0 << runtime.timerNum;
  runtime.regIme = 1;
};

export const stopFlashTimer = (runtime: AgbFlashRuntime): void => {
  runtime.regIme = 0;
  runtime.timerReg[0] = 0;
  runtime.timerReg[1] = 0;
  runtime.regIe &= ~(INTR_FLAG_TIMER0 << runtime.timerNum);
  runtime.regIme = runtime.savedIme;
};

export const readFlash1 = (addr: Uint8Array, offset = 0): number => addr[offset] & 0xff;

export const setReadFlash1 = (runtime: AgbFlashRuntime): void => {
  runtime.pollFlashStatus = 'ReadFlash1';
};

export const readFlashCore = (
  src: Uint8Array,
  srcOffset: number,
  dest: Uint8Array,
  size: number
): void => {
  let offset = srcOffset;
  let destOffset = 0;
  let remaining = size >>> 0;
  while (remaining-- !== 0) {
    dest[destOffset++] = src[offset++];
  }
};

const resolveSector = (runtime: AgbFlashRuntime, sectorNum: number): number => {
  let sector = sectorNum & 0xffff;
  if (runtime.flash.romSize === FLASH_ROM_SIZE_1M) {
    switchFlashBank(runtime, Math.trunc(sector / SECTORS_PER_BANK));
    sector %= SECTORS_PER_BANK;
  }
  return runtime.currentBank * SECTORS_PER_BANK + sector;
};

export const readFlash = (
  runtime: AgbFlashRuntime,
  sectorNum: number,
  offset: number,
  dest: Uint8Array,
  size: number
): void => {
  runtime.regWaitcnt = (runtime.regWaitcnt & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8;
  const sector = resolveSector(runtime, sectorNum);
  const srcOffset = (sector << runtime.flash.sector.shift) + offset;
  readFlashCore(runtime.flashMemory, srcOffset, dest, size);
};

export const verifyFlashSectorCore = (
  src: Uint8Array,
  tgt: Uint8Array,
  size: number,
  tgtOffset = 0
): number => {
  let srcOffset = 0;
  let targetOffset = tgtOffset;
  let remaining = size >>> 0;
  while (remaining-- !== 0) {
    if (tgt[targetOffset++] !== src[srcOffset++]) {
      return targetOffset - 1;
    }
  }
  return 0;
};

export const verifyFlashSector = (
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array
): number => {
  runtime.regWaitcnt = (runtime.regWaitcnt & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8;
  const sector = resolveSector(runtime, sectorNum);
  const tgtOffset = sector << runtime.flash.sector.shift;
  return verifyFlashSectorCore(src, runtime.flashMemory, runtime.flash.sector.size, tgtOffset);
};

export const verifyFlashSectorNBytes = (
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array,
  n: number
): number => {
  if (runtime.flash.romSize === FLASH_ROM_SIZE_1M) {
    switchFlashBank(runtime, Math.trunc(sectorNum / SECTORS_PER_BANK));
    sectorNum %= SECTORS_PER_BANK;
  }
  runtime.regWaitcnt = (runtime.regWaitcnt & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8;
  const absoluteSector = runtime.currentBank * SECTORS_PER_BANK + sectorNum;
  const tgtOffset = absoluteSector << runtime.flash.sector.shift;
  return verifyFlashSectorCore(src, runtime.flashMemory, n, tgtOffset);
};

export const programFlashSector = (
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array
): number => {
  runtime.programFlashSectorCalls.push({ sectorNum: sectorNum & 0xffff, src: new Uint8Array(src) });
  const queued = runtime.programFlashSectorResults.shift();
  if (queued !== undefined) {
    return queued & 0xffff;
  }
  const sector = resolveSector(runtime, sectorNum);
  runtime.flashMemory.set(src.subarray(0, runtime.flash.sector.size), sector << runtime.flash.sector.shift);
  return 0;
};

export const programFlashSectorAndVerify = (
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array
): number => {
  let result = 0;
  for (let i = 0; i < 3; i += 1) {
    result = programFlashSector(runtime, sectorNum, src);
    if (result !== 0) {
      continue;
    }
    result = verifyFlashSector(runtime, sectorNum, src);
    if (result === 0) {
      break;
    }
  }
  return result;
};

export const programFlashSectorAndVerifyNBytes = (
  runtime: AgbFlashRuntime,
  sectorNum: number,
  dataSrc: Uint8Array,
  n: number
): number => {
  let result = 0;
  for (let i = 0; i < 3; i += 1) {
    result = programFlashSector(runtime, sectorNum, dataSrc);
    if (result !== 0) {
      continue;
    }
    result = verifyFlashSectorNBytes(runtime, sectorNum, dataSrc, n);
    if (result === 0) {
      break;
    }
  }
  return result;
};

export function SwitchFlashBank(runtime: AgbFlashRuntime, bankNum: number): void {
  switchFlashBank(runtime, bankNum);
}

export function ReadFlashId(runtime: AgbFlashRuntime): number {
  return readFlashId(runtime);
}

export function FlashTimerIntr(runtime: AgbFlashRuntime): void {
  flashTimerIntr(runtime);
}

export function SetFlashTimerIntr(
  runtime: AgbFlashRuntime,
  timerNum: number,
  intrFunc: { value: string | null }
): number {
  return setFlashTimerIntr(runtime, timerNum, intrFunc);
}

export function StartFlashTimer(runtime: AgbFlashRuntime, phase: number): void {
  startFlashTimer(runtime, phase);
}

export function StopFlashTimer(runtime: AgbFlashRuntime): void {
  stopFlashTimer(runtime);
}

export function ReadFlash1(addr: Uint8Array, offset = 0): number {
  return readFlash1(addr, offset);
}

export function SetReadFlash1(runtime: AgbFlashRuntime): void {
  setReadFlash1(runtime);
}

export function ReadFlash_Core(
  src: Uint8Array,
  srcOffset: number,
  dest: Uint8Array,
  size: number
): void {
  readFlashCore(src, srcOffset, dest, size);
}

export function ReadFlash(
  runtime: AgbFlashRuntime,
  sectorNum: number,
  offset: number,
  dest: Uint8Array,
  size: number
): void {
  readFlash(runtime, sectorNum, offset, dest, size);
}

export function VerifyFlashSector_Core(
  src: Uint8Array,
  tgt: Uint8Array,
  size: number,
  tgtOffset = 0
): number {
  return verifyFlashSectorCore(src, tgt, size, tgtOffset);
}

export function VerifyFlashSector(
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array
): number {
  return verifyFlashSector(runtime, sectorNum, src);
}

export function VerifyFlashSectorNBytes(
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array,
  n: number
): number {
  return verifyFlashSectorNBytes(runtime, sectorNum, src, n);
}

export function ProgramFlashSectorAndVerify(
  runtime: AgbFlashRuntime,
  sectorNum: number,
  src: Uint8Array
): number {
  return programFlashSectorAndVerify(runtime, sectorNum, src);
}

export function ProgramFlashSectorAndVerifyNBytes(
  runtime: AgbFlashRuntime,
  sectorNum: number,
  dataSrc: Uint8Array,
  n: number
): number {
  return programFlashSectorAndVerifyNBytes(runtime, sectorNum, dataSrc, n);
}
