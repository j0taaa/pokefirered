export const GCMB_STRUCT_COUNTER1 = 0x00;
export const GCMB_STRUCT_COUNTER2 = 0x01;
export const GCMB_STRUCT_MBPROGRESS = 0x02;
export const GCMB_STRUCT_SAVEDVCOUNT = 0x03;
export const GCMB_STRUCT_KEYA = 0x04;
export const GCMB_STRUCT_KEYB = 0x08;
export const GCMB_STRUCT_KEYC = 0x0c;
export const GCMB_STRUCT_BOOT_KEY = 0x10;
export const GCMB_STRUCT_IMAGE_SIZE = 0x12;
export const GCMB_STRUCT_SESSION_KEY = 0x14;
export const GCMB_STRUCT_HASH_VAL = 0x18;
export const GCMB_STRUCT_KEYC_DERIVATION = 0x1c;
export const GCMB_STRUCT_BASE_DEST_PTR = 0x20;
export const GCMB_STRUCT_CUR_DEST_PTR = 0x24;
export const GCMB_STRUCT_SERIAL_INTR_HANDLER = 0x28;

export const ROM_HEADER_NINTENDO_LOGO_OFFSET = 0x04;
export const ROM_HEADER_NINTENDO_LOGO_LENGTH = 0x98;
export const ROM_HEADER_NINTENDO_LOGO_END = 0xa0;

export const MBPROGRESS_NONE = 0x00;
export const MBPROGRESS_LOGO_CORRECT = 0x01;
export const MBPROGRESS_READY_TO_BOOT = 0x02;

export const GCMB_MAGIC_BOOTKEY_HASHVAL = 0xbb;
export const GCMB_MAGIC_BOOTKEY = 0xbb;
export const GCMB_MAGIC_COUNTER2 = 0xcc;
export const GCMB_MAGIC_KEYA = 0xdd;
export const GCMB_MAGIC_KEYB = 0xee;
export const GCMB_MAGIC_KEYCDERIVATION = 0xff;

export const GCMB_HASH_POLY = 0xa1c1;
export const GCMB_KAWA = 0x6177614b;
export const GCMB_RUBY_USA_GAME_CODE = 0x45565841;
export const GCMB_EWRAM_START = 0x02000000;
export const GCMB_MAXIMUM_IMAGE_SIZE_U32S = 0x4000;
export const INTR_FLAG_SERIAL = 0x80;

export const GCMB_STATUS_RECV_COMPLETE = 1;
export const GCMB_STATUS_SEND_COMPLETE = 2;

export type GameCubeMultiBootIntrHandler =
  | 'GcMbIntrHandler_Stop'
  | 'GcMbIntrHandler_CheckGameCodeSent'
  | 'GcMbIntrHandler_CheckHandshakeResponse'
  | 'GcMbIntrHandler_ReceiveKeyA'
  | 'GcMbIntrHandler_CheckKeyBSent'
  | 'GcMbIntrHandler_CheckImageSizeResponse'
  | 'GcMbIntrHandler_CheckImageResponse'
  | 'GcMbIntrHandler_CheckCounter2Sent'
  | 'GcMbIntrHandler_CheckKeyCDerivationSent'
  | 'GcMbIntrHandler_CheckBootKeyResponse'
  | 'GcMbIntrHandler_StopUnconditionally';

export interface GameCubeMultiBoot {
  counter1: number;
  counter2: number;
  mbProgress: number;
  savedVCount: number;
  keyA: number;
  keyB: number;
  keyC: number;
  bootKey: number;
  imageSize: number;
  sessionKey: number;
  hashVal: number;
  keyCDerivation: number;
  baseDestPtr: number;
  curDestPtr: number;
  serialIntrHandler: GameCubeMultiBootIntrHandler | null;
}

export interface GameCubeMultiBootRuntime {
  mb: GameCubeMultiBoot;
  memory: Uint8Array;
  romHeaderNintendoLogo: Uint8Array;
  regIME: number;
  regIE: number;
  regIF: number;
  regRCNT: number;
  regJOYCNT: number;
  regJOYSTAT: number;
  regJOY_RECV: number;
  regJOY_TRANS: number;
  regVCOUNT: number;
  executedAddress: number | null;
  operations: string[];
}

export const createGameCubeMultiBootRuntime = (
  overrides: Partial<Omit<GameCubeMultiBootRuntime, 'mb'>> & { mb?: Partial<GameCubeMultiBoot> } = {}
): GameCubeMultiBootRuntime => ({
  mb: {
    counter1: overrides.mb?.counter1 ?? 0,
    counter2: overrides.mb?.counter2 ?? 0,
    mbProgress: overrides.mb?.mbProgress ?? MBPROGRESS_NONE,
    savedVCount: overrides.mb?.savedVCount ?? 0,
    keyA: overrides.mb?.keyA ?? 0,
    keyB: overrides.mb?.keyB ?? 0,
    keyC: overrides.mb?.keyC ?? 0,
    bootKey: overrides.mb?.bootKey ?? 0,
    imageSize: overrides.mb?.imageSize ?? 0,
    sessionKey: overrides.mb?.sessionKey ?? 0,
    hashVal: overrides.mb?.hashVal ?? 0,
    keyCDerivation: overrides.mb?.keyCDerivation ?? 0,
    baseDestPtr: overrides.mb?.baseDestPtr ?? GCMB_EWRAM_START,
    curDestPtr: overrides.mb?.curDestPtr ?? GCMB_EWRAM_START,
    serialIntrHandler: overrides.mb?.serialIntrHandler ?? null
  },
  memory: overrides.memory ?? new Uint8Array(0x20000),
  romHeaderNintendoLogo: overrides.romHeaderNintendoLogo ?? defaultNintendoLogo(),
  regIME: overrides.regIME ?? 0,
  regIE: overrides.regIE ?? 0,
  regIF: overrides.regIF ?? 0,
  regRCNT: overrides.regRCNT ?? 0,
  regJOYCNT: overrides.regJOYCNT ?? 0,
  regJOYSTAT: overrides.regJOYSTAT ?? 0,
  regJOY_RECV: overrides.regJOY_RECV ?? 0,
  regJOY_TRANS: overrides.regJOY_TRANS ?? 0,
  regVCOUNT: overrides.regVCOUNT ?? 0,
  executedAddress: overrides.executedAddress ?? null,
  operations: overrides.operations ?? []
});

export function GameCubeMultiBoot_Hash(value: number, hashVal: number): number {
  let r3 = u32(hashVal ^ value);
  for (let r2 = 0x20; r2 !== 0; r2 -= 1) {
    const carry = r3 & 1;
    r3 >>>= 1;
    if (carry !== 0) r3 = u32(r3 ^ GCMB_HASH_POLY);
  }
  return r3;
}

export function GameCubeMultiBoot_Main(runtime: GameCubeMultiBootRuntime): void {
  const mb = runtime.mb;
  let shouldInit = false;

  if (mb.serialIntrHandler === null) {
    shouldInit = true;
  } else {
    mb.counter2 = u8(mb.counter2 + 1);
    if (mb.mbProgress === MBPROGRESS_READY_TO_BOOT) return;

    const ime = runtime.regIME;
    runtime.regIME = 0;
    const oldCounter1 = mb.counter1;
    if (mb.counter1 <= 0x0a) mb.counter1 = u8(mb.counter1 + 1);
    runtime.regIME = ime;
    shouldInit = oldCounter1 >= 0x0a;
  }

  if (shouldInit) {
    GameCubeMultiBoot_Init(runtime);
    return;
  }

  if (mb.mbProgress === MBPROGRESS_NONE) {
    const transferred = mb.curDestPtr - mb.baseDestPtr;
    if (transferred === 0 || transferred < ROM_HEADER_NINTENDO_LOGO_END) return;
    if (!logoMatches(runtime, mb.baseDestPtr)) {
      GameCubeMultiBoot_Init(runtime);
      return;
    }

    mb.baseDestPtr = u32(mb.baseDestPtr + ROM_HEADER_NINTENDO_LOGO_END);
    mb.mbProgress = MBPROGRESS_LOGO_CORRECT;
    mb.hashVal = u32(mb.keyA ^ mb.keyB);
    mb.sessionKey = u32(Math.imul(mb.hashVal, GCMB_KAWA) + 1);
    return;
  }

  let ptr = mb.baseDestPtr;
  while (ptr < mb.curDestPtr) {
    const ciphertext = readU32(runtime, ptr);
    const plaintext = u32((ciphertext ^ mb.sessionKey) + mb.hashVal);
    writeU32(runtime, ptr, plaintext);
    mb.hashVal = GameCubeMultiBoot_Hash(plaintext, mb.hashVal);
    mb.sessionKey = u32(Math.imul(mb.sessionKey, GCMB_KAWA) + 1);
    ptr = u32(ptr + 4);
  }
  mb.baseDestPtr = ptr;

  if (mb.imageSize !== 0) return;
  if (mb.curDestPtr !== mb.baseDestPtr) return;

  if (mb.keyC === 0) {
    mb.keyC = u32((u8(mb.savedVCount) << 24) - 1);
    mb.keyCDerivation = u32((GameCubeMultiBoot_Hash(mb.keyC, mb.hashVal) << 8) + GCMB_MAGIC_KEYCDERIVATION);
    return;
  }

  if (mb.bootKey === 0) return;

  const realBootKey = GameCubeMultiBoot_Hash(mb.keyC, GCMB_MAGIC_BOOTKEY_HASHVAL);
  if (u16(mb.bootKey) !== realBootKey) {
    GameCubeMultiBoot_Init(runtime);
    return;
  }

  mb.mbProgress = MBPROGRESS_READY_TO_BOOT;
}

export function GameCubeMultiBoot_ExecuteProgram(runtime: GameCubeMultiBootRuntime): void {
  if (runtime.mb.mbProgress !== MBPROGRESS_READY_TO_BOOT) {
    runtime.operations.push('GameCubeMultiBoot_ExecuteProgram:fail');
    return;
  }
  runtime.regIME = 0;
  runtime.executedAddress = GCMB_EWRAM_START + 0xc0;
  runtime.operations.push(`GameCubeMultiBoot_ExecuteProgram:${runtime.executedAddress}`);
}

export function GameCubeMultiBoot_Init(runtime: GameCubeMultiBootRuntime): void {
  const mb = runtime.mb;
  const ime = runtime.regIME;
  runtime.regIME = 0;

  const oldSavedVCount = mb.savedVCount;
  const oldCounter2 = mb.counter2;
  mb.serialIntrHandler = 'GcMbIntrHandler_Stop';
  mb.counter1 = 0;
  mb.counter2 = u8(oldSavedVCount);
  mb.mbProgress = MBPROGRESS_NONE;
  mb.savedVCount = u8(oldCounter2 >>> 1);
  mb.keyA = 0;
  mb.keyB = 0;
  mb.keyC = 0;
  mb.bootKey = 0;
  mb.imageSize = 0;
  mb.sessionKey = 0;
  mb.hashVal = 0;
  mb.keyCDerivation = 0;

  runtime.regRCNT = 0x8000;
  runtime.regRCNT = 0xc000;
  runtime.regJOYCNT = 0x47;
  runtime.regJOYSTAT = 0;
  runtime.regIF = INTR_FLAG_SERIAL;
  runtime.regIE |= INTR_FLAG_SERIAL;
  runtime.regIME = ime;
  runtime.operations.push('GameCubeMultiBoot_Init');
}

export function GameCubeMultiBoot_HandleSerialInterrupt(runtime: GameCubeMultiBootRuntime): void {
  const mb = runtime.mb;
  const status = runtime.regJOYCNT;
  runtime.regJOYCNT = status;
  mb.counter1 = 0;

  if (mb.serialIntrHandler === null) {
    readVCount(runtime);
    return;
  }

  const shiftedStatus = status >>> 1;
  if ((status & 1) !== 0) {
    beginHandshake(runtime);
    return;
  }

  runInterruptHandler(runtime, mb.serialIntrHandler, shiftedStatus);
}

export function GameCubeMultiBoot_Quit(runtime: GameCubeMultiBootRuntime): void {
  const ime = runtime.regIME;
  runtime.regIME = 0;
  runtime.regJOYCNT = 0x07;
  runtime.regRCNT = 0x8000;
  runtime.regIF = INTR_FLAG_SERIAL;
  runtime.regIE &= ~INTR_FLAG_SERIAL;
  runtime.regIME = ime;
  runtime.operations.push('GameCubeMultiBoot_Quit');
}

export function writeImageBytes(runtime: GameCubeMultiBootRuntime, address: number, bytes: Uint8Array): void {
  runtime.memory.set(bytes, toOffset(address));
}

export function readImageU32(runtime: GameCubeMultiBootRuntime, address: number): number {
  return readU32(runtime, address);
}

function runInterruptHandler(runtime: GameCubeMultiBootRuntime, handler: GameCubeMultiBootIntrHandler, status: number): void {
  switch (handler) {
    case 'GcMbIntrHandler_Stop':
    case 'GcMbIntrHandler_StopUnconditionally':
      stop(runtime);
      break;
    case 'GcMbIntrHandler_CheckGameCodeSent':
      checkGameCodeSent(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckHandshakeResponse':
      checkHandshakeResponse(runtime, status);
      break;
    case 'GcMbIntrHandler_ReceiveKeyA':
      receiveKeyA(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckKeyBSent':
      checkKeyBSent(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckImageSizeResponse':
      checkImageSizeResponse(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckImageResponse':
      checkImageResponse(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckCounter2Sent':
      checkCounter2Sent(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckKeyCDerivationSent':
      checkKeyCDerivationSent(runtime, status);
      break;
    case 'GcMbIntrHandler_CheckBootKeyResponse':
      checkBootKeyResponse(runtime, status);
      break;
  }
}

function stop(runtime: GameCubeMultiBootRuntime): void {
  runtime.regJOYSTAT = 0;
  runtime.mb.serialIntrHandler = null;
  readVCount(runtime);
}

function readVCount(runtime: GameCubeMultiBootRuntime): void {
  runtime.mb.savedVCount = u8(runtime.regVCOUNT);
}

function beginHandshake(runtime: GameCubeMultiBootRuntime): void {
  const mb = runtime.mb;
  runtime.regJOY_TRANS = GCMB_RUBY_USA_GAME_CODE;
  runtime.regJOYSTAT = 0x10;
  mb.keyB = setByte(mb.keyB, 1, mb.savedVCount);
  if (mb.mbProgress !== MBPROGRESS_NONE) {
    stop(runtime);
    return;
  }
  mb.baseDestPtr = GCMB_EWRAM_START;
  mb.curDestPtr = GCMB_EWRAM_START;
  mb.serialIntrHandler = 'GcMbIntrHandler_CheckGameCodeSent';
}

function checkGameCodeSent(runtime: GameCubeMultiBootRuntime, status: number): void {
  if ((status & GCMB_STATUS_SEND_COMPLETE) === 0) {
    stop(runtime);
  } else if ((status & GCMB_STATUS_RECV_COMPLETE) !== 0) {
    checkHandshakeResponse(runtime, status);
  } else {
    runtime.mb.serialIntrHandler = 'GcMbIntrHandler_CheckHandshakeResponse';
  }
}

function checkHandshakeResponse(runtime: GameCubeMultiBootRuntime, status: number): void {
  if ((status & GCMB_STATUS_RECV_COMPLETE) === 0) {
    stop(runtime);
  } else if (runtime.regJOY_RECV !== GCMB_RUBY_USA_GAME_CODE) {
    stop(runtime);
  } else {
    runtime.mb.keyB = setByte(runtime.mb.keyB, 3, runtime.mb.savedVCount);
    runtime.mb.serialIntrHandler = 'GcMbIntrHandler_ReceiveKeyA';
  }
}

function receiveKeyA(runtime: GameCubeMultiBootRuntime, status: number): void {
  const mb = runtime.mb;
  if ((status & GCMB_STATUS_RECV_COMPLETE) === 0) {
    stop(runtime);
    return;
  }
  const recv = u32(runtime.regJOY_RECV);
  if ((recv >>> 24) !== GCMB_MAGIC_KEYA) {
    stop(runtime);
    return;
  }
  mb.keyA = recv;
  mb.keyB = setByte(mb.keyB, 2, mb.counter2);

  const bitCount = countBits(mb.keyB >>> 8);
  if (bitCount > 0x0e) mb.keyB = setByte(mb.keyB, 2, 0);
  else if (bitCount < 0x07) mb.keyB = setByte(mb.keyB, 2, 0xff);

  runtime.regJOY_TRANS = u32(mb.keyB + GCMB_MAGIC_KEYB);
  runtime.regJOYSTAT = 0x30;
  mb.serialIntrHandler = 'GcMbIntrHandler_CheckKeyBSent';
}

function checkKeyBSent(runtime: GameCubeMultiBootRuntime, status: number): void {
  if ((status & GCMB_STATUS_SEND_COMPLETE) === 0) {
    stop(runtime);
  } else if ((status & GCMB_STATUS_RECV_COMPLETE) !== 0) {
    checkImageSizeResponse(runtime, status);
  } else {
    runtime.mb.serialIntrHandler = 'GcMbIntrHandler_CheckImageSizeResponse';
  }
}

function checkImageSizeResponse(runtime: GameCubeMultiBootRuntime, status: number): void {
  const mb = runtime.mb;
  if ((status & GCMB_STATUS_RECV_COMPLETE) === 0) {
    stop(runtime);
    return;
  }
  if (u32(runtime.regJOY_RECV) >= GCMB_MAXIMUM_IMAGE_SIZE_U32S) {
    stop(runtime);
    return;
  }
  mb.imageSize = u16((runtime.regJOY_RECV + 1) * 2);
  if (mb.mbProgress !== MBPROGRESS_NONE) {
    stop(runtime);
    return;
  }
  mb.baseDestPtr = GCMB_EWRAM_START;
  mb.curDestPtr = GCMB_EWRAM_START;
  mb.serialIntrHandler = 'GcMbIntrHandler_CheckImageResponse';
}

function checkImageResponse(runtime: GameCubeMultiBootRuntime, status: number): void {
  const mb = runtime.mb;
  if ((status & GCMB_STATUS_RECV_COMPLETE) === 0) {
    stop(runtime);
    return;
  }
  runtime.regJOYSTAT = (((mb.curDestPtr & 4) + 8) << 2) & 0xffff;
  writeU32(runtime, mb.curDestPtr, runtime.regJOY_RECV);
  mb.curDestPtr = u32(mb.curDestPtr + 4);
  mb.imageSize = u16(mb.imageSize - 1);
  if (mb.imageSize !== 0) {
    readVCount(runtime);
  } else {
    sendCounter2(runtime);
  }
}

function sendCounter2(runtime: GameCubeMultiBootRuntime): void {
  runtime.regJOY_TRANS = u32((runtime.mb.counter2 << 8) + GCMB_MAGIC_COUNTER2);
  runtime.mb.serialIntrHandler = 'GcMbIntrHandler_CheckCounter2Sent';
}

function checkCounter2Sent(runtime: GameCubeMultiBootRuntime, status: number): void {
  if ((status & GCMB_STATUS_SEND_COMPLETE) === 0) {
    stop(runtime);
  } else if (runtime.mb.keyCDerivation === 0) {
    sendCounter2(runtime);
  } else {
    runtime.regJOY_TRANS = runtime.mb.keyCDerivation;
    runtime.mb.serialIntrHandler = 'GcMbIntrHandler_CheckKeyCDerivationSent';
  }
}

function checkKeyCDerivationSent(runtime: GameCubeMultiBootRuntime, status: number): void {
  if ((status & GCMB_STATUS_SEND_COMPLETE) === 0) {
    stop(runtime);
  } else if ((status & GCMB_STATUS_RECV_COMPLETE) !== 0) {
    checkBootKeyResponse(runtime, status);
  } else {
    runtime.mb.serialIntrHandler = 'GcMbIntrHandler_CheckBootKeyResponse';
  }
}

function checkBootKeyResponse(runtime: GameCubeMultiBootRuntime, status: number): void {
  if ((status & GCMB_STATUS_RECV_COMPLETE) === 0) {
    stop(runtime);
    return;
  }
  if ((u32(runtime.regJOY_RECV) >>> 24) !== GCMB_MAGIC_BOOTKEY) {
    stop(runtime);
    return;
  }
  runtime.mb.bootKey = u16(runtime.regJOY_RECV);
  runtime.mb.serialIntrHandler = 'GcMbIntrHandler_StopUnconditionally';
}

function logoMatches(runtime: GameCubeMultiBootRuntime, address: number): boolean {
  const start = toOffset(address + ROM_HEADER_NINTENDO_LOGO_OFFSET);
  for (let i = 0; i < ROM_HEADER_NINTENDO_LOGO_LENGTH; i += 1) {
    if (runtime.memory[start + i] !== runtime.romHeaderNintendoLogo[i]) return false;
  }
  return true;
}

function readU32(runtime: GameCubeMultiBootRuntime, address: number): number {
  const offset = toOffset(address);
  return u32(runtime.memory[offset] | (runtime.memory[offset + 1] << 8) | (runtime.memory[offset + 2] << 16) | (runtime.memory[offset + 3] << 24));
}

function writeU32(runtime: GameCubeMultiBootRuntime, address: number, value: number): void {
  const offset = toOffset(address);
  const v = u32(value);
  runtime.memory[offset] = v & 0xff;
  runtime.memory[offset + 1] = (v >>> 8) & 0xff;
  runtime.memory[offset + 2] = (v >>> 16) & 0xff;
  runtime.memory[offset + 3] = (v >>> 24) & 0xff;
}

function setByte(value: number, byte: number, byteValue: number): number {
  const shift = byte * 8;
  return u32((value & ~(0xff << shift)) | (u8(byteValue) << shift));
}

function countBits(value: number): number {
  let count = 0;
  let current = u32(value);
  while (current !== 0) {
    count += current & 1;
    current >>>= 1;
  }
  return count;
}

function defaultNintendoLogo(): Uint8Array {
  return Uint8Array.from({ length: ROM_HEADER_NINTENDO_LOGO_LENGTH }, (_, i) => (0x24 + Math.imul(i, 0x13)) & 0xff);
}

function toOffset(address: number): number {
  return address - GCMB_EWRAM_START;
}

const u8 = (value: number): number => value & 0xff;
const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;
