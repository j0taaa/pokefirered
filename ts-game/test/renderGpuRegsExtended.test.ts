import { describe, expect, test } from 'vitest';
import {
  createGpuRegManagerState,
  initGpuRegManager,
  setGpuReg,
  getGpuReg,
  copyBufferedValuesToGpuRegs,
  setGpuRegBits,
  clearGpuRegBits,
  enableInterrupts,
  disableInterrupts,
  peekBufferedGpuReg,
  peekHardwareGpuReg,
  pokeHardwareGpuReg,
  GPU_REG_BUF_SIZE,
  EMPTY_GPU_REG_SLOT,
  DISPCNT_FORCED_BLANK,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_DISPSTAT,
  REG_OFFSET_VCOUNT,
  INTR_FLAG_VBLANK,
  INTR_FLAG_HBLANK,
  DISPSTAT_VBLANK_INTR,
  DISPSTAT_HBLANK_INTR
} from '../src/rendering/decompGpuRegs';

describe('GPU register rendering parity (extended)', () => {
  test('GPU register buffer size matches GBA hardware', () => {
    expect(GPU_REG_BUF_SIZE).toBe(0x60);
  });

  test('empty slot marker is 0xff', () => {
    expect(EMPTY_GPU_REG_SLOT).toBe(0xff);
  });

  test('DISPCNT forced blank bit matches GBA register', () => {
    expect(DISPCNT_FORCED_BLANK).toBe(0x0080);
  });

  test('DISPSTAT interrupt bits match GBA register layout', () => {
    expect(DISPSTAT_VBLANK_INTR).toBe(0x0008);
    expect(DISPSTAT_HBLANK_INTR).toBe(0x0010);
  });

  test('interrupt flag bits match GBA IF register', () => {
    expect(INTR_FLAG_VBLANK).toBe(0x0001);
    expect(INTR_FLAG_HBLANK).toBe(0x0002);
  });

  test('register offsets match GBA IO register map', () => {
    expect(REG_OFFSET_DISPCNT).toBe(0x00);
    expect(REG_OFFSET_DISPSTAT).toBe(0x04);
    expect(REG_OFFSET_VCOUNT).toBe(0x06);
  });

  test('buffered and hardware registers are independent', () => {
    const state = createGpuRegManagerState();
    pokeHardwareGpuReg(state, 0x10, 0xaaaa);
    setGpuReg(state, 0x10, 0x5555);

    expect(peekBufferedGpuReg(state, 0x10)).toBe(0x5555);
    expect(peekHardwareGpuReg(state, 0x10)).toBe(0xaaaa);
  });

  test('DISPSTAT special handling preserves interrupt bits during copy', () => {
    const state = createGpuRegManagerState();
    pokeHardwareGpuReg(state, REG_OFFSET_DISPSTAT, 0x0040);
    setGpuReg(state, REG_OFFSET_DISPSTAT, DISPSTAT_VBLANK_INTR | DISPSTAT_HBLANK_INTR);

    copyBufferedValuesToGpuRegs(state);

    const result = peekHardwareGpuReg(state, REG_OFFSET_DISPSTAT);
    expect(result & DISPSTAT_VBLANK_INTR).toBe(DISPSTAT_VBLANK_INTR);
    expect(result & DISPSTAT_HBLANK_INTR).toBe(DISPSTAT_HBLANK_INTR);
  });

  test('VCOUNT register reads from hardware, not buffer', () => {
    const state = createGpuRegManagerState();
    pokeHardwareGpuReg(state, REG_OFFSET_VCOUNT, 0x00a0);
    setGpuReg(state, REG_OFFSET_VCOUNT, 0x0050);

    expect(getGpuReg(state, REG_OFFSET_VCOUNT)).toBe(0x00a0);
  });

  test('enableInterrupts and disableInterrupts update DISPSTAT interrupt bits', () => {
    const state = createGpuRegManagerState();
    pokeHardwareGpuReg(state, REG_OFFSET_DISPCNT, DISPCNT_FORCED_BLANK);

    enableInterrupts(state, INTR_FLAG_VBLANK);
    expect(state.regIE & INTR_FLAG_VBLANK).toBe(INTR_FLAG_VBLANK);
    expect(peekHardwareGpuReg(state, REG_OFFSET_DISPSTAT) & DISPSTAT_VBLANK_INTR).toBe(DISPSTAT_VBLANK_INTR);

    disableInterrupts(state, INTR_FLAG_VBLANK);
    expect(state.regIE & INTR_FLAG_VBLANK).toBe(0);
    expect(peekHardwareGpuReg(state, REG_OFFSET_DISPSTAT) & DISPSTAT_VBLANK_INTR).toBe(0);
  });

  test('setGpuRegBits and clearGpuRegBits modify buffered value correctly', () => {
    const state = createGpuRegManagerState();
    setGpuReg(state, 0x10, 0x0003);
    setGpuRegBits(state, 0x10, 0x000c);
    expect(peekBufferedGpuReg(state, 0x10)).toBe(0x000f);

    clearGpuRegBits(state, 0x10, 0x0005);
    expect(peekBufferedGpuReg(state, 0x10)).toBe(0x000a);
  });

  test('initGpuRegManager resets all state', () => {
    const state = createGpuRegManagerState();
    state.buffer.fill(0xffff);
    state.waitingList.fill(0);
    state.hardwareRegs.fill(0xffff);
    state.bufferLocked = true;
    state.shouldSyncRegIE = true;
    state.regIE = 0xffff;

    initGpuRegManager(state);

    expect(state.buffer.every((v) => v === 0)).toBe(true);
    expect(state.waitingList.every((v) => v === EMPTY_GPU_REG_SLOT)).toBe(true);
    expect(state.hardwareRegs.every((v) => v === 0)).toBe(true);
    expect(state.bufferLocked).toBe(false);
    expect(state.shouldSyncRegIE).toBe(false);
    expect(state.regIE).toBe(0);
  });
});