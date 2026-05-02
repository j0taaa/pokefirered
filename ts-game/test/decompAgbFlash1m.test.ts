import { describe, expect, test } from 'vitest';
import {
  DEFAULT_FLASH,
  IdentifyFlash,
  LE26FV10N1TS,
  MX29L010,
  WaitForFlashWrite_Common,
  WAITCNT_SRAM_8,
  WAITCNT_SRAM_MASK,
  createFlashRuntimeState,
  identifyFlash,
  waitForFlashWriteCommon
} from '../src/game/decompAgbFlash1m';

describe('decompAgbFlash1m', () => {
  test('IdentifyFlash selects MX, LE, or Default setup info from joined flash ids', () => {
    const mxRuntime = createFlashRuntimeState();
    mxRuntime.regWAITCNT = 0xffff;
    expect(IdentifyFlash(mxRuntime, { readFlashId: () => 0x09c2 })).toBe(0);
    expect(mxRuntime.flash).toBe(MX29L010);

    mxRuntime.flash = null;
    expect(identifyFlash(mxRuntime, { readFlashId: () => 0x09c2 })).toBe(0);
    expect(mxRuntime.regWAITCNT).toBe((0xffff & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8);
    expect(mxRuntime.flash).toBe(MX29L010);
    expect(mxRuntime.programFlashByte).toBe('ProgramFlashByte_MX');
    expect(mxRuntime.flashMaxTime).toBe(MX29L010.maxTime);

    const leRuntime = createFlashRuntimeState();
    expect(identifyFlash(leRuntime, { readFlashId: () => 0x1362 })).toBe(0);
    expect(leRuntime.flash).toBe(LE26FV10N1TS);

    const fallbackRuntime = createFlashRuntimeState();
    expect(identifyFlash(fallbackRuntime, { readFlashId: () => 0xffff })).toBe(1);
    expect(fallbackRuntime.flash).toBe(DEFAULT_FLASH);
  });

  test('WaitForFlashWrite_Common returns zero when polling reaches lastData', () => {
    const runtime = createFlashRuntimeState();
    const polls = [0x00, 0x40, 0xff];
    const started: number[] = [];
    let stopped = 0;

    const result = waitForFlashWriteCommon(runtime, 3, 0xff, {
      pollFlashStatus: () => polls.shift() ?? 0xff,
      startFlashTimer: (phase) => started.push(phase),
      stopFlashTimer: () => {
        stopped += 1;
      }
    });

    expect(result).toBe(0);
    expect(started).toEqual([3]);
    expect(stopped).toBe(1);
    expect(runtime.timerStartedPhase).toBe(3);
    expect(runtime.timerStopped).toBe(true);
    expect(runtime.flashWrites).toEqual([]);

    const aliasRuntime = createFlashRuntimeState();
    expect(WaitForFlashWrite_Common(aliasRuntime, 9, 0xaa, { pollFlashStatus: () => 0xaa })).toBe(0);
    expect(aliasRuntime.timerStopped).toBe(true);
  });

  test('WaitForFlashWrite_Common resets flash and returns phase | 0xA000 on exceeded chip limit', () => {
    const runtime = createFlashRuntimeState();
    const polls = [0x20, 0x00];

    const result = waitForFlashWriteCommon(runtime, 2, 0xff, {
      pollFlashStatus: () => polls.shift() ?? 0x00
    });

    expect(result).toBe(0xa002);
    expect(runtime.flashWrites).toEqual([{ address: 0x5555, value: 0xf0 }]);
    expect(runtime.timerStopped).toBe(true);
  });

  test('WaitForFlashWrite_Common resets flash and returns phase | 0xC000 on timeout flag', () => {
    const runtime = createFlashRuntimeState();
    runtime.timeoutFlag = true;
    const polls = [0x00, 0x10];

    const result = waitForFlashWriteCommon(runtime, 1, 0xff, {
      pollFlashStatus: () => polls.shift() ?? 0x10
    });

    expect(result).toBe(0xc001);
    expect(runtime.flashWrites).toEqual([{ address: 0x5555, value: 0xf0 }]);
    expect(runtime.timerStopped).toBe(true);
  });

  test('WaitForFlashWrite_Common accepts a final successful poll after warning bits or timeout', () => {
    const exceededRuntime = createFlashRuntimeState();
    const exceededPolls = [0x20, 0xaa];
    expect(waitForFlashWriteCommon(exceededRuntime, 4, 0xaa, {
      pollFlashStatus: () => exceededPolls.shift() ?? 0xaa
    })).toBe(0);
    expect(exceededRuntime.flashWrites).toEqual([]);

    const timeoutRuntime = createFlashRuntimeState();
    timeoutRuntime.timeoutFlag = true;
    const timeoutPolls = [0x00, 0xbb];
    expect(waitForFlashWriteCommon(timeoutRuntime, 5, 0xbb, {
      pollFlashStatus: () => timeoutPolls.shift() ?? 0xbb
    })).toBe(0);
    expect(timeoutRuntime.flashWrites).toEqual([]);
  });
});
