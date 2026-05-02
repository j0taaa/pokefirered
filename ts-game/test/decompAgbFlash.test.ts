import { describe, expect, test } from 'vitest';
import {
  FLASH_ROM_SIZE_1M,
  FlashTimerIntr,
  INTR_FLAG_TIMER0,
  ProgramFlashSectorAndVerify,
  ProgramFlashSectorAndVerifyNBytes,
  ReadFlash,
  ReadFlash1,
  ReadFlashId,
  ReadFlash_Core,
  SetFlashTimerIntr,
  SetReadFlash1,
  StartFlashTimer,
  StopFlashTimer,
  SwitchFlashBank,
  VerifyFlashSector,
  VerifyFlashSectorNBytes,
  VerifyFlashSector_Core,
  createAgbFlashRuntime,
  flashTimerIntr,
  programFlashSectorAndVerify,
  programFlashSectorAndVerifyNBytes,
  readFlash,
  readFlashCore,
  readFlashId,
  setFlashTimerIntr,
  setReadFlash1,
  startFlashTimer,
  stopFlashTimer,
  switchFlashBank,
  verifyFlashSector,
  verifyFlashSectorCore,
  verifyFlashSectorNBytes
} from '../src/game/decompAgbFlash';

describe('decomp agb_flash', () => {
  test('SwitchFlashBank and ReadFlashId issue the exact command writes', () => {
    const runtime = createAgbFlashRuntime();
    switchFlashBank(runtime, 2);
    expect(runtime.flashWrites).toEqual([
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0xb0 },
      { address: 0x0000, value: 2 }
    ]);

    runtime.flashWrites = [];
    runtime.flashMemory[0] = 0x34;
    runtime.flashMemory[1] = 0x12;
    expect(readFlashId(runtime)).toBe(0x1234);
    expect(runtime.pollFlashStatus).toBe('ReadFlash1');
    expect(runtime.flashWrites).toEqual([
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0x90 },
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0xf0 },
      { address: 0x5555, value: 0xf0 }
    ]);
  });

  test('timer setup, interrupt, start, and stop mirror register side effects', () => {
    const runtime = createAgbFlashRuntime();
    const intr = { value: null as string | null };
    expect(setFlashTimerIntr(runtime, 4, intr)).toBe(1);
    expect(setFlashTimerIntr(runtime, 2, intr)).toBe(0);
    expect(intr.value).toBe('FlashTimerIntr');

    runtime.flashMaxTime = [10, 11, 12, 20, 21, 22];
    runtime.regIme = 7;
    startFlashTimer(runtime, 1);
    expect(runtime.savedIme).toBe(7);
    expect(runtime.timerCount).toBe(20);
    expect(runtime.timerReg).toEqual([21, 22]);
    expect(runtime.regIe & (INTR_FLAG_TIMER0 << 2)).not.toBe(0);
    expect(runtime.regIf).toBe(INTR_FLAG_TIMER0 << 2);
    expect(runtime.regIme).toBe(1);

    runtime.timerCount = 2;
    flashTimerIntr(runtime);
    expect(runtime.flashTimeoutFlag).toBe(0);
    flashTimerIntr(runtime);
    expect(runtime.flashTimeoutFlag).toBe(1);

    stopFlashTimer(runtime);
    expect(runtime.timerReg).toEqual([0, 0]);
    expect(runtime.regIe & (INTR_FLAG_TIMER0 << 2)).toBe(0);
    expect(runtime.regIme).toBe(7);
  });

  test('ReadFlash copies bytes after 1M bank switching and waitcnt setup', () => {
    const runtime = createAgbFlashRuntime();
    runtime.flash = { romSize: FLASH_ROM_SIZE_1M, sector: { shift: 4, size: 16 } };
    runtime.flashMemory = new Uint8Array(2 * 16 * 16);
    runtime.flashMemory[17 * 16 + 3] = 0xab;
    runtime.flashMemory[17 * 16 + 4] = 0xcd;
    const dest = new Uint8Array(2);

    readFlash(runtime, 17, 3, dest, 2);

    expect([...dest]).toEqual([0xab, 0xcd]);
    expect(runtime.currentBank).toBe(1);
    expect(runtime.regWaitcnt & 0x3).toBe(0x3);

    const copied = new Uint8Array(3);
    readFlashCore(Uint8Array.from([9, 8, 7, 6]), 1, copied, 3);
    expect([...copied]).toEqual([8, 7, 6]);
    setReadFlash1(runtime);
    expect(runtime.pollFlashStatus).toBe('ReadFlash1');
  });

  test('verify helpers return zero or the target mismatch address', () => {
    const runtime = createAgbFlashRuntime({ romSize: 0, sector: { shift: 3, size: 8 } });
    runtime.flashMemory = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(verifyFlashSector(runtime, 0, Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]))).toBe(0);
    expect(verifyFlashSector(runtime, 0, Uint8Array.from([1, 2, 9, 4, 5, 6, 7, 8]))).toBe(2);
    expect(verifyFlashSectorNBytes(runtime, 0, Uint8Array.from([1, 2, 3]), 3)).toBe(0);
    expect(verifyFlashSectorCore(Uint8Array.from([1, 4]), Uint8Array.from([1, 2]), 2)).toBe(1);
  });

  test('program-and-verify retries up to three times and stops on success', () => {
    const runtime = createAgbFlashRuntime({ romSize: 0, sector: { shift: 3, size: 8 } });
    runtime.flashMemory = new Uint8Array(8);
    runtime.programFlashSectorResults = [1, 0];
    const src = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);

    expect(programFlashSectorAndVerify(runtime, 0, src)).toBe(0);
    expect(runtime.programFlashSectorCalls).toHaveLength(2);

    runtime.programFlashSectorCalls = [];
    runtime.flashMemory.fill(0);
    expect(programFlashSectorAndVerifyNBytes(runtime, 0, Uint8Array.from([9, 8, 7, 6]), 4)).toBe(0);
    expect(runtime.flashMemory.slice(0, 4)).toEqual(Uint8Array.from([9, 8, 7, 6]));
  });

  test('exact C-name exports invoke the same flash command, timer, read, verify, and program logic', () => {
    const runtime = createAgbFlashRuntime({ romSize: FLASH_ROM_SIZE_1M, sector: { shift: 4, size: 16 } });
    runtime.flashMemory = new Uint8Array(2 * 16 * 16);

    SwitchFlashBank(runtime, 1);
    expect(runtime.currentBank).toBe(1);
    expect(runtime.flashWrites.slice(-4)).toEqual([
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0xb0 },
      { address: 0x0000, value: 1 }
    ]);

    runtime.flashMemory[0] = 0xcd;
    runtime.flashMemory[1] = 0xab;
    expect(ReadFlashId(runtime)).toBe(0xabcd);

    const intr = { value: null as string | null };
    expect(SetFlashTimerIntr(runtime, 3, intr)).toBe(0);
    expect(intr.value).toBe('FlashTimerIntr');
    runtime.flashMaxTime = [1, 2, 3, 4, 5, 6];
    StartFlashTimer(runtime, 1);
    expect(runtime.timerReg).toEqual([5, 6]);
    runtime.timerCount = 1;
    FlashTimerIntr(runtime);
    expect(runtime.flashTimeoutFlag).toBe(1);
    StopFlashTimer(runtime);
    expect(runtime.timerReg).toEqual([0, 0]);

    expect(ReadFlash1(Uint8Array.from([7, 8]), 1)).toBe(8);
    SetReadFlash1(runtime);
    expect(runtime.pollFlashStatus).toBe('ReadFlash1');

    const directCopy = new Uint8Array(3);
    ReadFlash_Core(Uint8Array.from([1, 2, 3, 4]), 1, directCopy, 3);
    expect([...directCopy]).toEqual([2, 3, 4]);

    runtime.flashMemory[17 * 16 + 2] = 0x55;
    const flashCopy = new Uint8Array(1);
    ReadFlash(runtime, 17, 2, flashCopy, 1);
    expect([...flashCopy]).toEqual([0x55]);

    runtime.flashMemory.set(Uint8Array.from([9, 8, 7, 6]), 17 * 16);
    expect(VerifyFlashSectorNBytes(runtime, 17, Uint8Array.from([9, 8, 7, 6]), 4)).toBe(0);
    expect(VerifyFlashSector_Core(Uint8Array.from([1, 2]), Uint8Array.from([1, 3]), 2)).toBe(1);

    const fullRuntime = createAgbFlashRuntime({ romSize: 0, sector: { shift: 2, size: 4 } });
    expect(ProgramFlashSectorAndVerify(fullRuntime, 0, Uint8Array.from([1, 2, 3, 4]))).toBe(0);
    expect(VerifyFlashSector(fullRuntime, 0, Uint8Array.from([1, 2, 3, 4]))).toBe(0);
    fullRuntime.flashMemory.fill(0);
    expect(ProgramFlashSectorAndVerifyNBytes(fullRuntime, 0, Uint8Array.from([5, 6]), 2)).toBe(0);
    expect([...fullRuntime.flashMemory.slice(0, 2)]).toEqual([5, 6]);
  });
});
