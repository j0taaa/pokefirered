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
  updateRegDispstatIntrBits,
  type GpuRegManagerState
} from '../rendering/decompGpuRegs';

export function InitGpuRegManager(state?: GpuRegManagerState): GpuRegManagerState {
  return initGpuRegManager(state);
}

export function CopyBufferedValueToGpuReg(
  state: GpuRegManagerState,
  regOffset: number
): void {
  copyBufferedValueToGpuReg(state, regOffset);
}

export function CopyBufferedValuesToGpuRegs(state: GpuRegManagerState): void {
  copyBufferedValuesToGpuRegs(state);
}

export function SetGpuReg(
  state: GpuRegManagerState,
  regOffset: number,
  value: number
): void {
  setGpuReg(state, regOffset, value);
}

export function GetGpuReg(state: GpuRegManagerState, regOffset: number): number {
  return getGpuReg(state, regOffset);
}

export function SetGpuRegBits(
  state: GpuRegManagerState,
  regOffset: number,
  mask: number
): void {
  setGpuRegBits(state, regOffset, mask);
}

export function ClearGpuRegBits(
  state: GpuRegManagerState,
  regOffset: number,
  mask: number
): void {
  clearGpuRegBits(state, regOffset, mask);
}

export function SyncRegIE(state: GpuRegManagerState): void {
  syncRegIE(state);
}

export function EnableInterrupts(state: GpuRegManagerState, mask: number): void {
  enableInterrupts(state, mask);
}

export function DisableInterrupts(state: GpuRegManagerState, mask: number): void {
  disableInterrupts(state, mask);
}

export function UpdateRegDispstatIntrBits(
  state: GpuRegManagerState,
  regIE: number
): void {
  updateRegDispstatIntrBits(state, regIE);
}
