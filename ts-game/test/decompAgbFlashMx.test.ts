import { describe, expect, test } from 'vitest';
import {
  WAITCNT_SRAM_8,
  WAITCNT_SRAM_MASK
} from '../src/game/decompAgbFlash1m';
import {
  FLASH_ERROR_INVALID_OFFSET,
  FLASH_ERROR_INVALID_SECTOR,
  EraseFlashChip_MX,
  EraseFlashSector_MX,
  ProgramFlashByte_MX,
  ProgramFlashSector_MX,
  createFlashMxRuntimeState,
} from '../src/game/decompAgbFlashMx';

describe('decompAgbFlashMx', () => {
  test('EraseFlashChip_MX writes the six command bytes, waits on phase 3, then restores SRAM wait', () => {
    const runtime = createFlashMxRuntimeState();
    runtime.regWAITCNT = 0xffff;
    const waits: Array<[number, number, number]> = [];

    expect(EraseFlashChip_MX(runtime, (...args) => {
      waits.push(args);
      return 0x1234;
    })).toBe(0x1234);

    expect(runtime.flashWrites).toEqual([
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0x80 },
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0x10 }
    ]);
    expect(waits).toEqual([[3, 0, 0xff]]);
    expect(runtime.readFlash1SetCount).toBe(1);
    expect(runtime.regWAITCNT).toBe((0xffff & ~WAITCNT_SRAM_MASK) | WAITCNT_SRAM_8);
  });

  test('EraseFlashSector_MX rejects invalid sectors and retries while result has 0xA000 set', () => {
    const invalidRuntime = createFlashMxRuntimeState();
    expect(EraseFlashSector_MX(invalidRuntime, 32, () => 0)).toBe(FLASH_ERROR_INVALID_SECTOR);
    expect(invalidRuntime.flashWrites).toEqual([]);

    const runtime = createFlashMxRuntimeState();
    const results = [0xa002, 0xa002, 0];
    const waits: Array<[number, number, number]> = [];

    expect(EraseFlashSector_MX(runtime, 17, (...args) => {
      waits.push(args);
      return results.shift() ?? 0;
    })).toBe(0);

    expect(runtime.switchedBanks).toEqual([1]);
    expect(waits).toEqual([
      [2, 0x1000, 0xff],
      [2, 0x1000, 0xff],
      [2, 0x1000, 0xff]
    ]);
    expect(runtime.flashWrites.filter((write) => write.value === 0x30)).toEqual([
      { address: 0x1000, value: 0x30 },
      { address: 0x1000, value: 0x30 },
      { address: 0x1000, value: 0x30 }
    ]);
  });

  test('ProgramFlashByte_MX validates offset and writes the AA/55/A0/data program sequence', () => {
    const invalidRuntime = createFlashMxRuntimeState();
    expect(ProgramFlashByte_MX(invalidRuntime, 0, 4096, 0x12, () => 0)).toBe(FLASH_ERROR_INVALID_OFFSET);

    const runtime = createFlashMxRuntimeState();
    const waits: Array<[number, number, number]> = [];
    expect(ProgramFlashByte_MX(runtime, 18, 7, 0x5a, (...args) => {
      waits.push(args);
      return 0;
    })).toBe(0);

    expect(runtime.switchedBanks).toEqual([1]);
    expect(runtime.flashWrites).toEqual([
      { address: 0x5555, value: 0xaa },
      { address: 0x2aaa, value: 0x55 },
      { address: 0x5555, value: 0xa0 },
      { address: 0x2007, value: 0x5a }
    ]);
    expect(waits).toEqual([[1, 0x2007, 0x5a]]);
  });

  test('ProgramFlashSector_MX erases first, programs sequential bytes, and preserves remaining count on failure', () => {
    const runtime = createFlashMxRuntimeState();
    const waits: Array<[number, number, number]> = [];

    const result = ProgramFlashSector_MX(
      runtime,
      1,
      Uint8Array.from([0x10, 0x20, 0x30]),
      (...args) => {
        waits.push(args);
        return waits.length === 4 ? 0xb001 : 0;
      }
    );

    expect(result).toBe(0xb001);
    expect(runtime.switchedBanks).toEqual([0, 0]);
    expect(waits).toEqual([
      [2, 0x1000, 0xff],
      [1, 0x1000, 0x10],
      [1, 0x1001, 0x20],
      [1, 0x1002, 0x30]
    ]);
    expect(runtime.flashNumRemainingBytes).toBe(4094);
  });
});
