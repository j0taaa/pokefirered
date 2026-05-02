import { describe, expect, test } from 'vitest';
import {
  AGBAssert,
  AGBPrint,
  AGBPrintFlush,
  AGBPrintFlush1Block,
  AGBPrintInit,
  AGBPrintTransferDataInternal,
  AGBPrintf,
  AGBPutc,
  AGBPutcInternal,
  MGBA_LOG_ERROR,
  MGBA_LOG_WARN,
  MgbaAssert,
  MgbaClose,
  MgbaOpen,
  MgbaPrintf,
  NOCASHGBAPRINTADDR2,
  NoCashGBAAssert,
  NoCashGBAPrint,
  NoCashGBAPrintf,
  WSCNT_DATA,
  createIsAgbPrnRuntime
} from '../src/game/decompIsAgbPrn';

describe('decomp isagbprn', () => {
  test('AGBPrintInit writes protected state and restores WAITCNT', () => {
    const runtime = createIsAgbPrnRuntime({ waitcnt: 0x1234 });

    AGBPrintInit(runtime);

    expect(runtime.waitcnt).toBe(0x1234);
    expect(runtime.agbPrint).toEqual({ m_nRequest: 0, m_nBank: 0xfd, m_nGet: 0, m_nPut: 0 });
    expect(runtime.protectWrites).toEqual([0x20, 0]);
  });

  test('AGBPutc and AGBPrint pack characters into the 16-bit print buffer exactly', () => {
    const runtime = createIsAgbPrnRuntime({ waitcnt: 0x2222 });
    AGBPrintInit(runtime);
    runtime.protectWrites = [];

    AGBPutc(runtime, 'A');
    AGBPutc(runtime, 'B');
    AGBPutcInternal(runtime, '!');
    AGBPrint(runtime, 'CD\0EF');

    expect(runtime.waitcnt).toBe(0x2222);
    expect(runtime.agbPrint.m_nPut).toBe(5);
    expect(runtime.agbPrintBuffer[0]).toBe(0x4241);
    expect(runtime.agbPrintBuffer[1]).toBe(0x4321);
    expect(runtime.agbPrintBuffer[2]).toBe(0x44);
    expect(runtime.protectWrites).toEqual([0x20, 0, 0x20, 0, 0x20, 0, 0x20, 0, 0x20, 0]);
  });

  test('AGB flush paths disable IME, write protection, call the flush callback, and restore registers', () => {
    const runtime = createIsAgbPrnRuntime({ ime: 1, waitcnt: 0x3456 });
    runtime.agbPrint.m_nPut = 3;
    runtime.agbPrint.m_nGet = 0;

    AGBPrintFlush1Block(runtime);

    expect(runtime.agbFlushCalls).toBe(1);
    expect(runtime.agbPrint.m_nGet).toBe(3);
    expect(runtime.ime).toBe(1);
    expect(runtime.waitcnt).toBe(0x3456);
    expect(runtime.protectWrites).toEqual([0x20, 0]);

    runtime.agbPrint.m_nPut = 5;
    AGBPrintTransferDataInternal(runtime, 1);
    expect(runtime.agbFlushCalls).toBe(2);
    expect(runtime.agbPrint.m_nGet).toBe(5);

    runtime.agbPrint.m_nPut = 7;
    AGBPrintFlush(runtime);
    expect(runtime.agbFlushCalls).toBe(3);
    expect(runtime.agbPrint.m_nGet).toBe(7);
  });

  test('AGBPrintf and AGBAssert use the same formatted messages and halt only for stop assertions', () => {
    const runtime = createIsAgbPrnRuntime();
    AGBPrintInit(runtime);
    AGBPrintf(runtime, 'v=%d %s %02x', 7, 'ok', 10);

    const text = String.fromCharCode(
      ...Array.from({ length: runtime.agbPrint.m_nPut }, (_, i) =>
        i & 1 ? runtime.agbPrintBuffer[i >>> 1] >> 8 : runtime.agbPrintBuffer[i >>> 1] & 0xff
      )
    );
    expect(text).toBe('v=7 ok 0a');

    AGBAssert(runtime, 'file.c', 12, 'x', 0);
    expect(runtime.halted).toBe(false);
    AGBAssert(runtime, 'file.c', 13, 'y', 1);
    expect(runtime.halted).toBe(true);
    expect(runtime.haltReasons).toEqual(['AGBAssert']);
  });

  test('no$gba print functions write to the no-newline address and assert halt behavior matches C', () => {
    const runtime = createIsAgbPrnRuntime();

    NoCashGBAPrint(runtime, 'hello');
    NoCashGBAPrintf(runtime, 'n=%d', 42);
    NoCashGBAAssert(runtime, 'a.c', 1, 'warn', false);
    NoCashGBAAssert(runtime, 'b.c', 2, 'stop', true);

    expect(runtime.noCashPrintWrites).toEqual([
      { address: NOCASHGBAPRINTADDR2, value: 'hello' },
      { address: NOCASHGBAPRINTADDR2, value: 'n=42' },
      { address: NOCASHGBAPRINTADDR2, value: 'WARING FILE=[a.c] LINE=[1]  EXP=[warn]' },
      { address: NOCASHGBAPRINTADDR2, value: 'ASSERTION FAILED  FILE=[b.c] LINE=[2]  EXP=[stop]' }
    ]);
    expect(runtime.halted).toBe(true);
    expect(runtime.haltReasons).toEqual(['NoCashGBAAssert']);
  });

  test('mGBA open/close, printf, and assert preserve register-level side effects', () => {
    const runtime = createIsAgbPrnRuntime();

    expect(MgbaOpen(runtime)).toBe(true);
    expect(runtime.debugEnable).toBe(0x1dea);
    MgbaPrintf(runtime, 0xf, 'value=%d', 5);
    expect(runtime.debugString).toBe('value=5');
    expect(runtime.debugFlags).toBe((0xf & 0x7) | 0x100);
    MgbaAssert(runtime, 'c.c', 3, 'soft', false);
    expect(runtime.debugFlags).toBe(MGBA_LOG_WARN | 0x100);
    expect(runtime.debugString).toBe('WARING FILE=[c.c] LINE=[3]  EXP=[soft]');
    MgbaAssert(runtime, 'd.c', 4, 'hard', true);
    expect(runtime.debugFlags).toBe(MGBA_LOG_ERROR | 0x100);
    expect(runtime.haltReasons).toEqual(['MgbaAssert']);
    MgbaClose(runtime);
    expect(runtime.debugEnable).toBe(0);
  });

  test('mGBA open returns false when the emulator handshake does not rewrite debug enable', () => {
    const runtime = createIsAgbPrnRuntime({ mgbaHandshakeEnabled: false });

    expect(MgbaOpen(runtime)).toBe(false);
    expect(runtime.debugEnable).toBe(0xc0de);
  });

  test('AGBPutc flushes one block when put catches get - 1', () => {
    const runtime = createIsAgbPrnRuntime();
    runtime.agbPrint.m_nPut = 0xfffe;
    runtime.agbPrint.m_nGet = 0;

    AGBPutc(runtime, 65);

    expect(runtime.agbPrint.m_nPut).toBe(0xffff);
    expect(runtime.agbFlushCalls).toBe(1);
  });

  test('AGB print routines temporarily use WSCNT_DATA internally', () => {
    const runtime = createIsAgbPrnRuntime({ waitcnt: 9 });
    AGBPrintInit(runtime);
    runtime.waitcnt = WSCNT_DATA;
    AGBPutc(runtime, 'Z');
    expect(runtime.waitcnt).toBe(WSCNT_DATA);
  });
});
