import { describe, expect, test } from 'vitest';
import {
  GCMB_EWRAM_START,
  GCMB_HASH_POLY,
  GCMB_KAWA,
  GCMB_MAGIC_BOOTKEY,
  GCMB_MAGIC_COUNTER2,
  GCMB_MAGIC_KEYA,
  GCMB_MAGIC_KEYB,
  GCMB_MAGIC_KEYCDERIVATION,
  GCMB_RUBY_USA_GAME_CODE,
  GCMB_STATUS_RECV_COMPLETE,
  GCMB_STATUS_SEND_COMPLETE,
  INTR_FLAG_SERIAL,
  MBPROGRESS_LOGO_CORRECT,
  MBPROGRESS_NONE,
  MBPROGRESS_READY_TO_BOOT,
  ROM_HEADER_NINTENDO_LOGO_LENGTH,
  ROM_HEADER_NINTENDO_LOGO_OFFSET,
  GameCubeMultiBoot_ExecuteProgram,
  GameCubeMultiBoot_HandleSerialInterrupt,
  GameCubeMultiBoot_Hash,
  GameCubeMultiBoot_Init,
  GameCubeMultiBoot_Main,
  GameCubeMultiBoot_Quit,
  createGameCubeMultiBootRuntime,
  readImageU32,
  writeImageBytes
} from '../src/game/decompLibGcnMultiboot';

describe('decomp libgcnmultiboot', () => {
  test('hash performs the same 32 carry/xor rounds as libgcnmultiboot.s', () => {
    expect(GameCubeMultiBoot_Hash(0x12345678, 0x9abcdef0)).toBe(referenceHash(0x12345678, 0x9abcdef0));
    expect(GameCubeMultiBoot_Hash(0xffffffff, 0x000000bb)).toBe(referenceHash(0xffffffff, 0x000000bb));
  });

  test('init mirrors the struct-clear counter shuffle and serial register setup', () => {
    const runtime = createGameCubeMultiBootRuntime({
      regIME: 1,
      regIE: 0x22,
      mb: {
        counter1: 9,
        counter2: 0x46,
        mbProgress: MBPROGRESS_READY_TO_BOOT,
        savedVCount: 0x91,
        keyA: 1,
        keyB: 2,
        keyC: 3,
        imageSize: 4,
        serialIntrHandler: null
      }
    });

    GameCubeMultiBoot_Init(runtime);

    expect(runtime.mb).toMatchObject({
      counter1: 0,
      counter2: 0x91,
      mbProgress: MBPROGRESS_NONE,
      savedVCount: 0x23,
      keyA: 0,
      keyB: 0,
      keyC: 0,
      imageSize: 0,
      serialIntrHandler: 'GcMbIntrHandler_Stop'
    });
    expect(runtime.regIME).toBe(1);
    expect(runtime.regIE & INTR_FLAG_SERIAL).toBe(INTR_FLAG_SERIAL);
    expect(runtime.regIF).toBe(INTR_FLAG_SERIAL);
    expect(runtime.regRCNT).toBe(0xc000);
    expect(runtime.regJOYCNT).toBe(0x47);
    expect(runtime.regJOYSTAT).toBe(0);
  });

  test('main initializes on missing/stale handlers and validates the Nintendo logo before decrypting', () => {
    const runtime = createGameCubeMultiBootRuntime({
      mb: {
        serialIntrHandler: 'GcMbIntrHandler_Stop',
        counter1: 10,
        counter2: 7,
        savedVCount: 3
      }
    });
    GameCubeMultiBoot_Main(runtime);
    expect(runtime.mb.mbProgress).toBe(MBPROGRESS_NONE);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_Stop');
    expect(runtime.mb.savedVCount).toBe(4);

    const logoRuntime = createGameCubeMultiBootRuntime({
      mb: {
        serialIntrHandler: 'GcMbIntrHandler_Stop',
        keyA: 0xdd000001,
        keyB: 0x02030405,
        curDestPtr: GCMB_EWRAM_START + 0xa0
      }
    });
    writeImageBytes(logoRuntime, GCMB_EWRAM_START + ROM_HEADER_NINTENDO_LOGO_OFFSET, logoRuntime.romHeaderNintendoLogo);
    GameCubeMultiBoot_Main(logoRuntime);
    expect(logoRuntime.mb.mbProgress).toBe(MBPROGRESS_LOGO_CORRECT);
    expect(logoRuntime.mb.baseDestPtr).toBe(GCMB_EWRAM_START + 0xa0);
    expect(logoRuntime.mb.hashVal).toBe((0xdd000001 ^ 0x02030405) >>> 0);
    expect(logoRuntime.mb.sessionKey).toBe((Math.imul(logoRuntime.mb.hashVal, GCMB_KAWA) + 1) >>> 0);

    const badLogo = createGameCubeMultiBootRuntime({
      mb: { serialIntrHandler: 'GcMbIntrHandler_Stop', curDestPtr: GCMB_EWRAM_START + 0xa0 }
    });
    writeImageBytes(badLogo, GCMB_EWRAM_START + ROM_HEADER_NINTENDO_LOGO_OFFSET, Uint8Array.from({ length: ROM_HEADER_NINTENDO_LOGO_LENGTH }, () => 0));
    GameCubeMultiBoot_Main(badLogo);
    expect(badLogo.mb.mbProgress).toBe(MBPROGRESS_NONE);
  });

  test('main decrypts transferred words, derives KeyC, and accepts the boot key exactly', () => {
    const runtime = createGameCubeMultiBootRuntime({
      mb: {
        serialIntrHandler: 'GcMbIntrHandler_Stop',
        mbProgress: MBPROGRESS_LOGO_CORRECT,
        baseDestPtr: GCMB_EWRAM_START + 0x100,
        curDestPtr: GCMB_EWRAM_START + 0x108,
        hashVal: 0x11111111,
        sessionKey: 0x22222222,
        savedVCount: 0x34
      }
    });
    writeWord(runtime, 0x100, 0xabcdef01);
    writeWord(runtime, 0x104, 0x12345678);

    const plain0 = ((0xabcdef01 ^ 0x22222222) + 0x11111111) >>> 0;
    const hash0 = referenceHash(plain0, 0x11111111);
    const session1 = (Math.imul(0x22222222, GCMB_KAWA) + 1) >>> 0;
    const plain1 = ((0x12345678 ^ session1) + hash0) >>> 0;
    const hash1 = referenceHash(plain1, hash0);

    GameCubeMultiBoot_Main(runtime);
    expect(readImageU32(runtime, GCMB_EWRAM_START + 0x100)).toBe(plain0);
    expect(readImageU32(runtime, GCMB_EWRAM_START + 0x104)).toBe(plain1);
    expect(runtime.mb.hashVal).toBe(hash1);
    expect(runtime.mb.baseDestPtr).toBe(GCMB_EWRAM_START + 0x108);
    expect(runtime.mb.keyC).toBe(0x33ffffff);
    expect(runtime.mb.keyCDerivation).toBe(((referenceHash(0x33ffffff, hash1) << 8) + GCMB_MAGIC_KEYCDERIVATION) >>> 0);

    runtime.mb.bootKey = referenceHash(runtime.mb.keyC, 0xbb) & 0xffff;
    GameCubeMultiBoot_Main(runtime);
    expect(runtime.mb.mbProgress).toBe(MBPROGRESS_READY_TO_BOOT);
  });

  test('serial interrupt handshake follows the assembly handler chain', () => {
    const runtime = createGameCubeMultiBootRuntime({
      regVCOUNT: 0x56,
      mb: { serialIntrHandler: 'GcMbIntrHandler_Stop', savedVCount: 0x12, counter2: 0x34 }
    });

    runtime.regJOYCNT = 1;
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.regJOY_TRANS).toBe(GCMB_RUBY_USA_GAME_CODE);
    expect(runtime.regJOYSTAT).toBe(0x10);
    expect(runtime.mb.keyB).toBe(0x1200);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckGameCodeSent');

    runtime.regJOYCNT = statusReg(GCMB_STATUS_SEND_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckHandshakeResponse');

    runtime.regJOY_RECV = GCMB_RUBY_USA_GAME_CODE;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_RECV_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.keyB).toBe(0x12001200);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_ReceiveKeyA');

    runtime.regJOY_RECV = (GCMB_MAGIC_KEYA << 24) | 0x112233;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_RECV_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.keyA).toBe(((GCMB_MAGIC_KEYA << 24) | 0x112233) >>> 0);
    expect(runtime.regJOY_TRANS).toBe(((runtime.mb.keyB + GCMB_MAGIC_KEYB) >>> 0));
    expect(runtime.regJOYSTAT).toBe(0x30);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckKeyBSent');

    runtime.regJOYCNT = statusReg(GCMB_STATUS_SEND_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckImageSizeResponse');

    runtime.regJOY_RECV = 1;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_RECV_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.imageSize).toBe(4);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckImageResponse');

    runtime.regJOY_RECV = 0xaabbccdd;
    runtime.regVCOUNT = 0x77;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_RECV_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(readImageU32(runtime, GCMB_EWRAM_START)).toBe(0xaabbccdd);
    expect(runtime.mb.curDestPtr).toBe(GCMB_EWRAM_START + 4);
    expect(runtime.mb.imageSize).toBe(3);
    expect(runtime.mb.savedVCount).toBe(0x77);
  });

  test('serial transfer end sends counter2, key derivation, boot key, then stops', () => {
    const runtime = createGameCubeMultiBootRuntime({
      mb: {
        serialIntrHandler: 'GcMbIntrHandler_CheckImageResponse',
        imageSize: 1,
        counter2: 0x45
      }
    });

    runtime.regJOY_RECV = 0x12345678;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_RECV_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.regJOY_TRANS).toBe((0x45 << 8) + GCMB_MAGIC_COUNTER2);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckCounter2Sent');

    runtime.regJOYCNT = statusReg(GCMB_STATUS_SEND_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.regJOY_TRANS).toBe((0x45 << 8) + GCMB_MAGIC_COUNTER2);

    runtime.mb.keyCDerivation = 0xaabbccff;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_SEND_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.regJOY_TRANS).toBe(0xaabbccff);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_CheckKeyCDerivationSent');

    runtime.regJOY_RECV = (GCMB_MAGIC_BOOTKEY << 24) | 0x4321;
    runtime.regJOYCNT = statusReg(GCMB_STATUS_SEND_COMPLETE | GCMB_STATUS_RECV_COMPLETE);
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.bootKey).toBe(0x4321);
    expect(runtime.mb.serialIntrHandler).toBe('GcMbIntrHandler_StopUnconditionally');

    runtime.regVCOUNT = 0x88;
    runtime.regJOYCNT = 0;
    GameCubeMultiBoot_HandleSerialInterrupt(runtime);
    expect(runtime.mb.serialIntrHandler).toBeNull();
    expect(runtime.regJOYSTAT).toBe(0);
    expect(runtime.mb.savedVCount).toBe(0x88);
  });

  test('execute and quit preserve the observable register side effects', () => {
    const runtime = createGameCubeMultiBootRuntime({ regIME: 1, regIE: INTR_FLAG_SERIAL, mb: { mbProgress: MBPROGRESS_LOGO_CORRECT } });
    GameCubeMultiBoot_ExecuteProgram(runtime);
    expect(runtime.executedAddress).toBeNull();
    expect(runtime.operations).toContain('GameCubeMultiBoot_ExecuteProgram:fail');

    runtime.mb.mbProgress = MBPROGRESS_READY_TO_BOOT;
    GameCubeMultiBoot_ExecuteProgram(runtime);
    expect(runtime.regIME).toBe(0);
    expect(runtime.executedAddress).toBe(GCMB_EWRAM_START + 0xc0);

    runtime.regIME = 1;
    GameCubeMultiBoot_Quit(runtime);
    expect(runtime.regIME).toBe(1);
    expect(runtime.regJOYCNT).toBe(0x07);
    expect(runtime.regRCNT).toBe(0x8000);
    expect(runtime.regIF).toBe(INTR_FLAG_SERIAL);
    expect(runtime.regIE & INTR_FLAG_SERIAL).toBe(0);
  });
});

function referenceHash(value: number, hashVal: number): number {
  let r3 = (hashVal ^ value) >>> 0;
  for (let i = 0; i < 0x20; i += 1) {
    const carry = r3 & 1;
    r3 >>>= 1;
    if (carry !== 0) r3 = (r3 ^ GCMB_HASH_POLY) >>> 0;
  }
  return r3 >>> 0;
}

function statusReg(status: number): number {
  return status << 1;
}

function writeWord(runtime: ReturnType<typeof createGameCubeMultiBootRuntime>, offset: number, word: number): void {
  writeImageBytes(runtime, GCMB_EWRAM_START + offset, Uint8Array.of(word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff));
}
