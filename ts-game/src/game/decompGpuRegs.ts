export * from '../rendering/decompGpuRegs';
import {
  clearGpuRegBits,
  copyBufferedValueToGpuReg,
  copyBufferedValuesToGpuRegs,
  disableInterrupts,
  enableInterrupts,
  getGpuReg,
  initGpuRegManager,
  setGpuReg,
  setGpuRegBits,
  syncRegIE,
  updateRegDispstatIntrBits
} from '../rendering/decompGpuRegs';

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
