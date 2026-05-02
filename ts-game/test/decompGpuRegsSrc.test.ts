import { describe, expect, test } from 'vitest';
import * as gpu from '../src/game/decompGpuRegs';

describe('src/gpu_regs.c parity exports', () => {
  test('exact C names point at the implemented GPU register manager logic', () => {
    expect(gpu.InitGpuRegManager).toBe(gpu.initGpuRegManager);
    expect(gpu.CopyBufferedValueToGpuReg).toBe(gpu.copyBufferedValueToGpuReg);
    expect(gpu.CopyBufferedValuesToGpuRegs).toBe(gpu.copyBufferedValuesToGpuRegs);
    expect(gpu.SetGpuReg).toBe(gpu.setGpuReg);
    expect(gpu.GetGpuReg).toBe(gpu.getGpuReg);
    expect(gpu.SetGpuRegBits).toBe(gpu.setGpuRegBits);
    expect(gpu.ClearGpuRegBits).toBe(gpu.clearGpuRegBits);
    expect(gpu.SyncRegIE).toBe(gpu.syncRegIE);
    expect(gpu.EnableInterrupts).toBe(gpu.enableInterrupts);
    expect(gpu.DisableInterrupts).toBe(gpu.disableInterrupts);
    expect(gpu.UpdateRegDispstatIntrBits).toBe(gpu.updateRegDispstatIntrBits);
  });

  test('SetGpuReg and CopyBufferedValuesToGpuRegs preserve queued write behavior through C names', () => {
    const state = gpu.createGpuRegManagerState();

    gpu.SetGpuReg(state, 0x10, 0x1234);
    expect(gpu.peekBufferedGpuReg(state, 0x10)).toBe(0x1234);
    expect(gpu.peekHardwareGpuReg(state, 0x10)).toBe(0);

    gpu.CopyBufferedValuesToGpuRegs(state);
    expect(gpu.peekHardwareGpuReg(state, 0x10)).toBe(0x1234);
  });
});
