export const AGB_PRINT_FLUSH_ADDR = 0x09fe209d;
export const AGB_PRINT_STRUCT_ADDR = 0x09fe20f8;
export const AGB_PRINT_PROTECT_ADDR = 0x09fe2ffe;
export const WSCNT_DATA = 0x4317;
export const NOCASHGBAIDADDR = 0x04fffa00;
export const NOCASHGBAPRINTADDR1 = 0x04fffa10;
export const NOCASHGBAPRINTADDR2 = 0x04fffa14;
export const MGBA_REG_DEBUG_MAX = 256;
export const MGBA_LOG_WARN = 2;
export const MGBA_LOG_ERROR = 3;

export interface AgbPrintStruct {
  m_nRequest: number;
  m_nBank: number;
  m_nGet: number;
  m_nPut: number;
}

export interface IsAgbPrnRuntime {
  waitcnt: number;
  ime: number;
  protect: number;
  agbPrint: AgbPrintStruct;
  agbPrintBuffer: Uint16Array;
  agbFlushCalls: number;
  protectWrites: number[];
  noCashPrintWrites: Array<{ address: number; value: string }>;
  debugEnable: number;
  debugFlags: number;
  debugString: string;
  mgbaHandshakeEnabled: boolean;
  halted: boolean;
  haltReasons: string[];
}

export const createIsAgbPrnRuntime = (
  overrides: Partial<IsAgbPrnRuntime> = {}
): IsAgbPrnRuntime => ({
  waitcnt: overrides.waitcnt ?? 0,
  ime: overrides.ime ?? 1,
  protect: overrides.protect ?? 0,
  agbPrint: overrides.agbPrint ?? {
    m_nRequest: 0,
    m_nBank: 0,
    m_nGet: 0,
    m_nPut: 0
  },
  agbPrintBuffer: overrides.agbPrintBuffer ?? new Uint16Array(0x10000),
  agbFlushCalls: overrides.agbFlushCalls ?? 0,
  protectWrites: overrides.protectWrites ?? [],
  noCashPrintWrites: overrides.noCashPrintWrites ?? [],
  debugEnable: overrides.debugEnable ?? 0,
  debugFlags: overrides.debugFlags ?? 0,
  debugString: overrides.debugString ?? '',
  mgbaHandshakeEnabled: overrides.mgbaHandshakeEnabled ?? true,
  halted: overrides.halted ?? false,
  haltReasons: overrides.haltReasons ?? []
});

const setProtect = (runtime: IsAgbPrnRuntime, value: number): void => {
  runtime.protect = value & 0xffff;
  runtime.protectWrites.push(runtime.protect);
};

const gbaCharCode = (chr: string | number): number =>
  typeof chr === 'number' ? chr & 0xff : (chr.charCodeAt(0) || 0) & 0xff;

const formatPrintf = (format: string, args: unknown[]): string => {
  let index = 0;
  return format.replace(/%([0]?\d+)?([sdxX%])/g, (_match, width: string | undefined, spec: string) => {
    if (spec === '%') {
      return '%';
    }
    const value = args[index++];
    if (spec === 's') {
      return String(value);
    }
    const numeric = Number(value) | 0;
    if (spec === 'd') {
      return String(numeric);
    }
    const text = (numeric >>> 0).toString(16);
    const padded = width ? text.padStart(Number(width), '0') : text;
    return spec === 'X' ? padded.toUpperCase() : padded;
  });
};

const halt = (runtime: IsAgbPrnRuntime, reason: string): void => {
  runtime.halted = true;
  runtime.haltReasons.push(reason);
};

export function AGBPrintInit(runtime: IsAgbPrnRuntime): void {
  const oldWSCNT = runtime.waitcnt;
  runtime.waitcnt = WSCNT_DATA;
  setProtect(runtime, 0x20);
  runtime.agbPrint.m_nRequest = 0;
  runtime.agbPrint.m_nGet = 0;
  runtime.agbPrint.m_nPut = 0;
  runtime.agbPrint.m_nBank = 0xfd;
  setProtect(runtime, 0);
  runtime.waitcnt = oldWSCNT;
}

export function AGBPutcInternal(runtime: IsAgbPrnRuntime, cChr: string | number): void {
  const put = runtime.agbPrint.m_nPut & 0xffff;
  const bufferIndex = put >>> 1;
  let data = runtime.agbPrintBuffer[bufferIndex];
  const chr = gbaCharCode(cChr);
  setProtect(runtime, 0x20);
  data = (put & 1) !== 0 ? ((data & 0x00ff) | (chr << 8)) : ((data & 0xff00) | chr);
  runtime.agbPrintBuffer[bufferIndex] = data & 0xffff;
  runtime.agbPrint.m_nPut = (put + 1) & 0xffff;
  setProtect(runtime, 0);
}

export function AGBPrintFlushCallback(runtime: IsAgbPrnRuntime): void {
  runtime.agbFlushCalls += 1;
  runtime.agbPrint.m_nGet = runtime.agbPrint.m_nPut;
}

export function AGBPutc(runtime: IsAgbPrnRuntime, cChr: string | number): void {
  const oldWSCNT = runtime.waitcnt;
  runtime.waitcnt = WSCNT_DATA;
  AGBPutcInternal(runtime, cChr);
  runtime.waitcnt = oldWSCNT;
  if (runtime.agbPrint.m_nPut === ((runtime.agbPrint.m_nGet - 1) & 0xffff)) {
    AGBPrintFlush1Block(runtime);
  }
}

export function AGBPrint(runtime: IsAgbPrnRuntime, pBuf: string): void {
  const oldWSCNT = runtime.waitcnt;
  runtime.waitcnt = WSCNT_DATA;
  for (let i = 0; i < pBuf.length && pBuf.charCodeAt(i) !== 0; i += 1) {
    AGBPutc(runtime, pBuf[i]);
  }
  runtime.waitcnt = oldWSCNT;
}

export function AGBPrintf(
  runtime: IsAgbPrnRuntime,
  pBuf: string,
  ...args: unknown[]
): void {
  AGBPrint(runtime, formatPrintf(pBuf, args));
}

export function AGBPrintTransferDataInternal(runtime: IsAgbPrnRuntime, bAllData: number): void {
  const nIME = runtime.ime;
  const oldWSCNT = runtime.waitcnt;
  runtime.ime = nIME & ~1;
  runtime.waitcnt = WSCNT_DATA;

  if (bAllData) {
    while (runtime.agbPrint.m_nPut !== runtime.agbPrint.m_nGet) {
      setProtect(runtime, 0x20);
      AGBPrintFlushCallback(runtime);
      setProtect(runtime, 0);
    }
  } else if (runtime.agbPrint.m_nPut !== runtime.agbPrint.m_nGet) {
    setProtect(runtime, 0x20);
    AGBPrintFlushCallback(runtime);
    setProtect(runtime, 0);
  }

  runtime.waitcnt = oldWSCNT;
  runtime.ime = nIME;
}

export function AGBPrintFlush1Block(runtime: IsAgbPrnRuntime): void {
  AGBPrintTransferDataInternal(runtime, 0);
}

export function AGBPrintFlush(runtime: IsAgbPrnRuntime): void {
  AGBPrintTransferDataInternal(runtime, 1);
}

export function AGBAssert(
  runtime: IsAgbPrnRuntime,
  pFile: string,
  nLine: number,
  pExpression: string,
  nStopProgram: number
): void {
  if (nStopProgram) {
    AGBPrintf(runtime, 'ASSERTION FAILED  FILE=[%s] LINE=[%d]  EXP=[%s] \n', pFile, nLine, pExpression);
    AGBPrintFlush(runtime);
    halt(runtime, 'AGBAssert');
  } else {
    AGBPrintf(runtime, 'WARING FILE=[%s] LINE=[%d]  EXP=[%s] \n', pFile, nLine, pExpression);
  }
}

export function NoCashGBAPrint(runtime: IsAgbPrnRuntime, pBuf: string): void {
  runtime.noCashPrintWrites.push({ address: NOCASHGBAPRINTADDR2, value: pBuf });
}

export function NoCashGBAPrintf(
  runtime: IsAgbPrnRuntime,
  pBuf: string,
  ...args: unknown[]
): void {
  NoCashGBAPrint(runtime, formatPrintf(pBuf, args));
}

export function NoCashGBAAssert(
  runtime: IsAgbPrnRuntime,
  pFile: string,
  nLine: number,
  pExpression: string,
  nStopProgram: boolean | number
): void {
  if (nStopProgram) {
    NoCashGBAPrintf(runtime, 'ASSERTION FAILED  FILE=[%s] LINE=[%d]  EXP=[%s]', pFile, nLine, pExpression);
    halt(runtime, 'NoCashGBAAssert');
  } else {
    NoCashGBAPrintf(runtime, 'WARING FILE=[%s] LINE=[%d]  EXP=[%s]', pFile, nLine, pExpression);
  }
}

export function MgbaOpen(runtime: IsAgbPrnRuntime): boolean {
  runtime.debugEnable = 0xc0de;
  if (runtime.mgbaHandshakeEnabled) {
    runtime.debugEnable = 0x1dea;
  }
  return runtime.debugEnable === 0x1dea;
}

export function MgbaClose(runtime: IsAgbPrnRuntime): void {
  runtime.debugEnable = 0;
}

export function MgbaPrintf(
  runtime: IsAgbPrnRuntime,
  level: number,
  ptr: string,
  ...args: unknown[]
): void {
  const maskedLevel = level & 0x7;
  runtime.debugString = formatPrintf(ptr, args).slice(0, MGBA_REG_DEBUG_MAX);
  runtime.debugFlags = maskedLevel | 0x100;
}

export function MgbaAssert(
  runtime: IsAgbPrnRuntime,
  pFile: string,
  nLine: number,
  pExpression: string,
  nStopProgram: boolean | number
): void {
  if (nStopProgram) {
    MgbaPrintf(runtime, MGBA_LOG_ERROR, 'ASSERTION FAILED  FILE=[%s] LINE=[%d]  EXP=[%s]', pFile, nLine, pExpression);
    halt(runtime, 'MgbaAssert');
  } else {
    MgbaPrintf(runtime, MGBA_LOG_WARN, 'WARING FILE=[%s] LINE=[%d]  EXP=[%s]', pFile, nLine, pExpression);
  }
}
