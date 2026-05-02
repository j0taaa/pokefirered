import {
  MX29L010,
  WAITCNT_SRAM_8,
  WAITCNT_SRAM_MASK,
  type FlashRuntimeState
} from './decompAgbFlash1m';
import type { FlashSetupInfo } from './decompAgbFlashLe';

export const SECTORS_PER_BANK = 16;
export const FLASH_BASE = 0;
export const FLASH_ERROR_INVALID_SECTOR = 0x80ff;
export const FLASH_ERROR_INVALID_OFFSET = 0x8000;

export interface FlashMxRuntimeState extends FlashRuntimeState {
  flash: FlashSetupInfo;
  switchedBanks: number[];
  readFlash1SetCount: number;
  flashNumRemainingBytes: number;
}

export type WaitForFlashWriteMx = (
  phase: number,
  address: number,
  lastData: number
) => number;

export const createFlashMxRuntimeState = (
  flash: FlashSetupInfo = MX29L010
): FlashMxRuntimeState => ({
  regWAITCNT: 0,
  programFlashByte: flash.programFlashByte,
  programFlashSector: flash.programFlashSector,
  eraseFlashChip: flash.eraseFlashChip,
  eraseFlashSector: flash.eraseFlashSector,
  waitForFlashWrite: flash.waitForFlashWrite,
  flashMaxTime: flash.maxTime,
  flash,
  timeoutFlag: false,
  flashWrites: [],
  timerStartedPhase: null,
  timerStopped: false,
  switchedBanks: [],
  readFlash1SetCount: 0,
  flashNumRemainingBytes: 0
});

const writeFlash = (
  runtime: FlashMxRuntimeState,
  address: number,
  value: number
): void => {
  runtime.flashWrites.push({ address: address & 0xffff, value: value & 0xff });
};

const setFlashWaitState = (runtime: FlashMxRuntimeState): void => {
  runtime.regWAITCNT = (runtime.regWAITCNT & ~WAITCNT_SRAM_MASK) | runtime.flash.waitStateSetup[0];
};

const resetSramWaitState = (runtime: FlashMxRuntimeState): void => {
  runtime.regWAITCNT = (runtime.regWAITCNT & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8;
};

const switchFlashBank = (runtime: FlashMxRuntimeState, bank: number): void => {
  runtime.switchedBanks.push(bank & 0xffff);
};

const setReadFlash1 = (runtime: FlashMxRuntimeState): void => {
  runtime.readFlash1SetCount += 1;
};

const localSectorAddress = (
  runtime: FlashMxRuntimeState,
  localSector: number,
  offset = 0
): number => FLASH_BASE + ((localSector & 0xffff) << runtime.flash.sector.sectorShift) + offset;

export const eraseFlashChipMx = (
  runtime: FlashMxRuntimeState,
  waitForFlashWrite: WaitForFlashWriteMx
): number => {
  setFlashWaitState(runtime);

  writeFlash(runtime, 0x5555, 0xaa);
  writeFlash(runtime, 0x2aaa, 0x55);
  writeFlash(runtime, 0x5555, 0x80);
  writeFlash(runtime, 0x5555, 0xaa);
  writeFlash(runtime, 0x2aaa, 0x55);
  writeFlash(runtime, 0x5555, 0x10);

  setReadFlash1(runtime);
  const result = waitForFlashWrite(3, FLASH_BASE, 0xff) & 0xffff;
  resetSramWaitState(runtime);
  return result;
};

export const eraseFlashSectorMx = (
  runtime: FlashMxRuntimeState,
  sectorNum: number,
  waitForFlashWrite: WaitForFlashWriteMx
): number => {
  if (sectorNum >= runtime.flash.sector.sectorCount) {
    return FLASH_ERROR_INVALID_SECTOR;
  }

  switchFlashBank(runtime, Math.trunc(sectorNum / SECTORS_PER_BANK));
  const localSector = sectorNum % SECTORS_PER_BANK;
  let numTries = 0;

  for (;;) {
    setFlashWaitState(runtime);
    const address = localSectorAddress(runtime, localSector);

    writeFlash(runtime, 0x5555, 0xaa);
    writeFlash(runtime, 0x2aaa, 0x55);
    writeFlash(runtime, 0x5555, 0x80);
    writeFlash(runtime, 0x5555, 0xaa);
    writeFlash(runtime, 0x2aaa, 0x55);
    writeFlash(runtime, address, 0x30);

    setReadFlash1(runtime);
    const result = waitForFlashWrite(2, address, 0xff) & 0xffff;
    if ((result & 0xa000) === 0 || numTries > 3) {
      resetSramWaitState(runtime);
      return result;
    }

    numTries += 1;
  }
};

export const programFlashByteMx = (
  runtime: FlashMxRuntimeState,
  sectorNum: number,
  offset: number,
  data: number,
  waitForFlashWrite: WaitForFlashWriteMx
): number => {
  if (offset >= runtime.flash.sector.sectorSize) {
    return FLASH_ERROR_INVALID_OFFSET;
  }

  switchFlashBank(runtime, Math.trunc(sectorNum / SECTORS_PER_BANK));
  const localSector = sectorNum % SECTORS_PER_BANK;
  const address = localSectorAddress(runtime, localSector, offset);

  setReadFlash1(runtime);
  setFlashWaitState(runtime);

  writeFlash(runtime, 0x5555, 0xaa);
  writeFlash(runtime, 0x2aaa, 0x55);
  writeFlash(runtime, 0x5555, 0xa0);
  writeFlash(runtime, address, data);

  return waitForFlashWrite(1, address, data & 0xff) & 0xffff;
};

export const programByteMx = (
  runtime: FlashMxRuntimeState,
  srcByte: number,
  destAddress: number,
  waitForFlashWrite: WaitForFlashWriteMx
): number => {
  writeFlash(runtime, 0x5555, 0xaa);
  writeFlash(runtime, 0x2aaa, 0x55);
  writeFlash(runtime, 0x5555, 0xa0);
  writeFlash(runtime, destAddress, srcByte);
  return waitForFlashWrite(1, destAddress, srcByte & 0xff) & 0xffff;
};

export const programFlashSectorMx = (
  runtime: FlashMxRuntimeState,
  sectorNum: number,
  src: Uint8Array,
  waitForFlashWrite: WaitForFlashWriteMx,
  eraseFlashSector: (
    runtime: FlashMxRuntimeState,
    sectorNum: number,
    waitForFlashWrite: WaitForFlashWriteMx
  ) => number = eraseFlashSectorMx
): number => {
  if (sectorNum >= runtime.flash.sector.sectorCount) {
    return FLASH_ERROR_INVALID_SECTOR;
  }

  let result = eraseFlashSector(runtime, sectorNum, waitForFlashWrite) & 0xffff;
  if (result !== 0) {
    return result;
  }

  switchFlashBank(runtime, Math.trunc(sectorNum / SECTORS_PER_BANK));
  const localSector = sectorNum % SECTORS_PER_BANK;

  setReadFlash1(runtime);
  setFlashWaitState(runtime);

  runtime.flashNumRemainingBytes = runtime.flash.sector.sectorSize;
  let destAddress = localSectorAddress(runtime, localSector);
  let srcOffset = 0;

  while (runtime.flashNumRemainingBytes > 0) {
    result = programByteMx(runtime, src[srcOffset] ?? 0, destAddress, waitForFlashWrite);
    if (result !== 0) {
      break;
    }

    runtime.flashNumRemainingBytes -= 1;
    srcOffset += 1;
    destAddress += 1;
  }

  return result;
};

export function EraseFlashChip_MX(
  runtime: FlashMxRuntimeState,
  waitForFlashWrite: WaitForFlashWriteMx
): number {
  return eraseFlashChipMx(runtime, waitForFlashWrite);
}

export function EraseFlashSector_MX(
  runtime: FlashMxRuntimeState,
  sectorNum: number,
  waitForFlashWrite: WaitForFlashWriteMx
): number {
  return eraseFlashSectorMx(runtime, sectorNum, waitForFlashWrite);
}

export function ProgramFlashByte_MX(
  runtime: FlashMxRuntimeState,
  sectorNum: number,
  offset: number,
  data: number,
  waitForFlashWrite: WaitForFlashWriteMx
): number {
  return programFlashByteMx(runtime, sectorNum, offset, data, waitForFlashWrite);
}

export function ProgramByte(
  runtime: FlashMxRuntimeState,
  srcByte: number,
  destAddress: number,
  waitForFlashWrite: WaitForFlashWriteMx
): number {
  return programByteMx(runtime, srcByte, destAddress, waitForFlashWrite);
}

export function ProgramFlashSector_MX(
  runtime: FlashMxRuntimeState,
  sectorNum: number,
  src: Uint8Array,
  waitForFlashWrite: WaitForFlashWriteMx,
  eraseFlashSector?: (
    runtime: FlashMxRuntimeState,
    sectorNum: number,
    waitForFlashWrite: WaitForFlashWriteMx
  ) => number
): number {
  return programFlashSectorMx(runtime, sectorNum, src, waitForFlashWrite, eraseFlashSector);
}
