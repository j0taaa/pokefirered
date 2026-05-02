import { describe, expect, test } from 'vitest';
import {
  DISPCNT_FORCED_BLANK,
  DISPSTAT_HBLANK_INTR,
  DISPSTAT_VBLANK_INTR,
  EMPTY_GPU_REG_SLOT,
  GPU_REG_BUF_SIZE,
  INTR_FLAG_HBLANK,
  INTR_FLAG_VBLANK,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_DISPSTAT,
  REG_OFFSET_VCOUNT,
  clearGpuRegBits,
  copyBufferedValuesToGpuRegs,
  createGpuRegManagerState,
  disableInterrupts,
  enableInterrupts,
  getGpuReg,
  initGpuRegManager,
  peekBufferedGpuReg,
  peekHardwareGpuReg,
  pokeHardwareGpuReg,
  setGpuReg,
  setGpuRegBits
} from '../src/rendering/decompGpuRegs';

describe('decompGpuRegs', () => {
  test('InitGpuRegManager clears the buffers, waiting list, and interrupt shadow', () => {
    const state = createGpuRegManagerState();
    state.buffer.fill(0xffff);
    state.waitingList.fill(0);
    state.hardwareRegs.fill(0xffff);
    state.bufferLocked = true;
    state.shouldSyncRegIE = true;
    state.regIE = 0xffff;

    initGpuRegManager(state);

    expect([...state.buffer]).toEqual(new Array(GPU_REG_BUF_SIZE / 2).fill(0));
    expect([...state.waitingList]).toEqual(new Array(GPU_REG_BUF_SIZE).fill(EMPTY_GPU_REG_SLOT));
    expect([...state.hardwareRegs]).toEqual(new Array(GPU_REG_BUF_SIZE / 2).fill(0));
    expect(state.bufferLocked).toBe(false);
    expect(state.shouldSyncRegIE).toBe(false);
    expect(state.regIE).toBe(0);
  });

  test('SetGpuReg writes immediately during forced blank or vblank scanlines', () => {
    const state = createGpuRegManagerState();

    pokeHardwareGpuReg(state, REG_OFFSET_DISPCNT, DISPCNT_FORCED_BLANK);
    setGpuReg(state, 0x10, 0x1234);

    expect(peekBufferedGpuReg(state, 0x10)).toBe(0x1234);
    expect(peekHardwareGpuReg(state, 0x10)).toBe(0x1234);
    expect(state.waitingList[0]).toBe(EMPTY_GPU_REG_SLOT);

    pokeHardwareGpuReg(state, REG_OFFSET_DISPCNT, 0);
    pokeHardwareGpuReg(state, REG_OFFSET_VCOUNT, 161);
    setGpuReg(state, 0x12, 0xabcd);

    expect(peekHardwareGpuReg(state, 0x12)).toBe(0xabcd);
    expect(state.waitingList[0]).toBe(EMPTY_GPU_REG_SLOT);
  });

  test('SetGpuReg queues unique register offsets outside the immediate-copy window', () => {
    const state = createGpuRegManagerState();

    setGpuReg(state, 0x10, 0x1111);
    setGpuReg(state, 0x12, 0x2222);
    setGpuReg(state, 0x10, 0x3333);

    expect(peekBufferedGpuReg(state, 0x10)).toBe(0x3333);
    expect(peekHardwareGpuReg(state, 0x10)).toBe(0);
    expect([...state.waitingList.slice(0, 3)]).toEqual([0x10, 0x12, EMPTY_GPU_REG_SLOT]);

    copyBufferedValuesToGpuRegs(state);

    expect(peekHardwareGpuReg(state, 0x10)).toBe(0x3333);
    expect(peekHardwareGpuReg(state, 0x12)).toBe(0x2222);
    expect(state.waitingList[0]).toBe(EMPTY_GPU_REG_SLOT);
    expect(state.waitingList[1]).toBe(EMPTY_GPU_REG_SLOT);
  });

  test('GetGpuReg reads DISPSTAT and VCOUNT from hardware, other regs from the buffer', () => {
    const state = createGpuRegManagerState();

    pokeHardwareGpuReg(state, REG_OFFSET_DISPSTAT, 0x0048);
    pokeHardwareGpuReg(state, REG_OFFSET_VCOUNT, 0x00a1);
    setGpuReg(state, 0x20, 0x7777);

    expect(getGpuReg(state, REG_OFFSET_DISPSTAT)).toBe(0x0048);
    expect(getGpuReg(state, REG_OFFSET_VCOUNT)).toBe(0x00a1);
    expect(getGpuReg(state, 0x20)).toBe(0x7777);
  });

  test('SetGpuRegBits and ClearGpuRegBits operate on the buffered value', () => {
    const state = createGpuRegManagerState();

    setGpuReg(state, 0x10, 0x0003);
    setGpuRegBits(state, 0x10, 0x000c);
    clearGpuRegBits(state, 0x10, 0x0005);

    expect(peekBufferedGpuReg(state, 0x10)).toBe(0x000a);
  });

  test('EnableInterrupts and DisableInterrupts mirror DISPSTAT interrupt bits', () => {
    const state = createGpuRegManagerState();
    pokeHardwareGpuReg(state, REG_OFFSET_DISPCNT, DISPCNT_FORCED_BLANK);
    pokeHardwareGpuReg(state, REG_OFFSET_DISPSTAT, 0x0040);

    enableInterrupts(state, INTR_FLAG_VBLANK | INTR_FLAG_HBLANK);

    expect(state.regIE).toBe(INTR_FLAG_VBLANK | INTR_FLAG_HBLANK);
    expect(state.shouldSyncRegIE).toBe(false);
    expect(peekHardwareGpuReg(state, REG_OFFSET_DISPSTAT)).toBe(
      0x0040 | DISPSTAT_VBLANK_INTR | DISPSTAT_HBLANK_INTR
    );

    disableInterrupts(state, INTR_FLAG_HBLANK);

    expect(state.regIE).toBe(INTR_FLAG_VBLANK);
    expect(peekHardwareGpuReg(state, REG_OFFSET_DISPSTAT)).toBe(0x0040 | DISPSTAT_VBLANK_INTR);
  });
});
