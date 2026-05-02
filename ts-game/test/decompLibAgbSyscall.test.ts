import { describe, expect, test } from 'vitest';
import {
  ArcTan2,
  BgAffineSet,
  CpuFastSet,
  CpuSet,
  Div,
  GBA_BIOS_SVC,
  LZ77UnCompVram,
  LZ77UnCompWram,
  MultiBoot,
  ObjAffineSet,
  REG_IME,
  RegisterRamReset,
  SoftReset,
  Sqrt,
  USER_STACK,
  VBlankIntrWait,
  createGbaBiosRuntime
} from '../src/game/decompLibAgbSyscall';

describe('decomp libagbsyscall.s', () => {
  test('records the exact BIOS SVC numbers used by the veneer labels', () => {
    expect(GBA_BIOS_SVC).toEqual({
      ArcTan2: 0x0a,
      BgAffineSet: 0x0e,
      CpuFastSet: 0x0c,
      CpuSet: 0x0b,
      Div: 0x06,
      LZ77UnCompVram: 0x12,
      LZ77UnCompWram: 0x11,
      MultiBoot: 0x25,
      ObjAffineSet: 0x0f,
      RegisterRamReset: 0x01,
      SoftReset: 0x00,
      Sqrt: 0x08,
      VBlankIntrWait: 0x05
    });
  });

  test('simple veneers issue one matching svc and preserve argument order', () => {
    const runtime = createGbaBiosRuntime({
      returnValues: { ArcTan2: 0x1111, Div: -7, Sqrt: 12 }
    });
    const src = { src: true };
    const dest = { dest: true };

    expect(ArcTan2(runtime, 1, 2)).toBe(0x1111);
    BgAffineSet(runtime, src, dest, 3);
    CpuFastSet(runtime, src, dest, 4);
    CpuSet(runtime, src, dest, 5);
    expect(Div(runtime, 9, 2)).toBe(-7);
    LZ77UnCompVram(runtime, src, dest);
    LZ77UnCompWram(runtime, src, dest);
    ObjAffineSet(runtime, src, dest, 6, 7);
    RegisterRamReset(runtime, 0xff);
    expect(Sqrt(runtime, 144)).toBe(12);

    expect(runtime.calls).toEqual([
      { svc: 0x0a, args: [1, 2] },
      { svc: 0x0e, args: [src, dest, 3] },
      { svc: 0x0c, args: [src, dest, 4] },
      { svc: 0x0b, args: [src, dest, 5] },
      { svc: 0x06, args: [9, 2] },
      { svc: 0x12, args: [src, dest] },
      { svc: 0x11, args: [src, dest] },
      { svc: 0x0f, args: [src, dest, 6, 7] },
      { svc: 0x01, args: [0xff] },
      { svc: 0x08, args: [144] }
    ]);
  });

  test('MultiBoot sets r1 to 1 and VBlankIntrWait clears r2 before svc', () => {
    const param = { multiboot: true };
    const runtime = createGbaBiosRuntime({ returnValues: { MultiBoot: 0 } });

    expect(MultiBoot(runtime, param)).toBe(0);
    VBlankIntrWait(runtime);

    expect(runtime.calls).toEqual([
      { svc: GBA_BIOS_SVC.MultiBoot, args: [param, 1] },
      { svc: GBA_BIOS_SVC.VBlankIntrWait, args: [] }
    ]);
    expect(runtime.registers.r2).toBe(0);
  });

  test('SoftReset disables IME, moves to user stack, then runs svc 1 and svc 0', () => {
    const runtime = createGbaBiosRuntime({ stackPointer: 0x1234 });

    SoftReset(runtime);

    expect(runtime.memory8[REG_IME]).toBe(0);
    expect(runtime.stackPointer).toBe(USER_STACK);
    expect(runtime.calls).toEqual([
      { svc: GBA_BIOS_SVC.RegisterRamReset, args: [] },
      { svc: GBA_BIOS_SVC.SoftReset, args: [] }
    ]);
  });
});
