export const EREADER_XFR_STATE_INIT = 0;
export const EREADER_XFR_STATE_HANDSHAKE = 1;
export const EREADER_XFR_STATE_START = 2;
export const EREADER_XFR_STATE_TRANSFER = 3;
export const EREADER_XFR_STATE_TRANSFER_DONE = 4;
export const EREADER_XFR_STATE_CHECKSUM = 5;
export const EREADER_XFR_STATE_DONE = 6;

export const EREADER_XFER_EXE = 1;
export const EREADER_XFER_CHK = 2;
export const EREADER_XFER_SHIFT = 0;
export const EREADER_XFER_MASK = (EREADER_XFER_EXE | EREADER_XFER_CHK) << EREADER_XFER_SHIFT;

export const EREADER_CANCEL_TIMEOUT = 1;
export const EREADER_CANCEL_KEY = 2;
export const EREADER_CANCEL_SHIFT = 2;
export const EREADER_CANCEL_TIMEOUT_MASK = EREADER_CANCEL_TIMEOUT << EREADER_CANCEL_SHIFT;
export const EREADER_CANCEL_KEY_MASK = EREADER_CANCEL_KEY << EREADER_CANCEL_SHIFT;
export const EREADER_CANCEL_MASK = (EREADER_CANCEL_TIMEOUT | EREADER_CANCEL_KEY) << EREADER_CANCEL_SHIFT;

export const EREADER_CHECKSUM_OK = 1;
export const EREADER_CHECKSUM_ERR = 2;
export const EREADER_CHECKSUM_SHIFT = 4;
export const EREADER_CHECKSUM_OK_MASK = EREADER_CHECKSUM_OK << EREADER_CHECKSUM_SHIFT;
export const EREADER_CHECKSUM_MASK = (EREADER_CHECKSUM_OK | EREADER_CHECKSUM_ERR) << EREADER_CHECKSUM_SHIFT;

export const B_BUTTON = 0x0002;
export const INTR_FLAG_TIMER3 = 1 << 6;
export const INTR_FLAG_SERIAL = 1 << 7;
export const SIO_32BIT_MODE = 0x1000;
export const SIO_MULTI_MODE = 0x2000;
export const SIO_38400_BPS = 0x0001;
export const SIO_9600_BPS = 0x0000;
export const SIO_115200_BPS = 0x0003;
export const SIO_MULTI_SI = 0x0004;
export const SIO_MULTI_SD = 0x0008;
export const SIO_ENABLE = 0x0080;
export const SIO_INTR_ENABLE = 0x4000;
export const TIMER_INTR_ENABLE = 0x40;
export const TIMER_ENABLE = 0x80;

export interface SendRecvMgr {
  master_slave: number;
  state: number;
  xferState: number;
  checksumResult: number;
  cancellationReason: number;
  dataptr: number[] | null;
  cursor: number;
  size: number;
  checksum: number;
}

export interface EReaderRegisters {
  REG_IME: number;
  REG_IE: number;
  REG_TM3CNT_L: number;
  REG_TM3CNT_H: number;
  REG_SIOCNT: number;
  REG_RCNT: number;
  REG_IF: number;
  REG_SIODATA32: number;
  REG_SIODATA8: number;
  REG_SIOMLT_SEND: number;
  REG_SIOMLT_RECV: number[];
  REG_KEYINPUT: number;
}

export interface EReaderRuntime {
  mgr: SendRecvMgr;
  regs: EReaderRegisters;
  sJoyNewOrRepeated: number;
  sJoyNew: number;
  sSendRecvStatus: number;
  sCounter1: number;
  sCounter2: number;
  sSavedIme: number;
  sSavedIe: number;
  sSavedTm3Cnt: number;
  sSavedSioCnt: number;
  sSavedRCnt: number;
  gShouldAdvanceLinkState: number;
  vblankWaits: number;
  maxBlockingIterations: number;
  operations: string[];
}

export const createSendRecvMgr = (): SendRecvMgr => ({
  master_slave: 0,
  state: EREADER_XFR_STATE_INIT,
  xferState: 0,
  checksumResult: 0,
  cancellationReason: 0,
  dataptr: null,
  cursor: 0,
  size: 0,
  checksum: 0
});

export const createEReaderRuntime = (): EReaderRuntime => ({
  mgr: createSendRecvMgr(),
  regs: {
    REG_IME: 1,
    REG_IE: 0,
    REG_TM3CNT_L: 0,
    REG_TM3CNT_H: 0,
    REG_SIOCNT: 0,
    REG_RCNT: 0,
    REG_IF: 0,
    REG_SIODATA32: 0,
    REG_SIODATA8: 0,
    REG_SIOMLT_SEND: 0,
    REG_SIOMLT_RECV: [0xffff, 0xffff, 0xffff, 0xffff],
    REG_KEYINPUT: 0x03ff
  },
  sJoyNewOrRepeated: 0,
  sJoyNew: 0,
  sSendRecvStatus: 0,
  sCounter1: 0,
  sCounter2: 0,
  sSavedIme: 0,
  sSavedIe: 0,
  sSavedTm3Cnt: 0,
  sSavedSioCnt: 0,
  sSavedRCnt: 0,
  gShouldAdvanceLinkState: 0,
  vblankWaits: 0,
  maxBlockingIterations: 1024,
  operations: []
});

const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;

const clearSendRecvMgr = (runtime: EReaderRuntime): void => {
  Object.assign(runtime.mgr, createSendRecvMgr());
};

const vBlankIntrWait = (runtime: EReaderRuntime): void => {
  runtime.vblankWaits += 1;
  runtime.operations.push('VBlankIntrWait');
};

export const eReaderSend = (runtime: EReaderRuntime, size: number, src: number[]): number => {
  let result = 2;
  eReaderHelperSaveRegsState(runtime);

  for (let i = 0; i < runtime.maxBlockingIterations; i += 1) {
    getKeyInput(runtime);
    if ((runtime.sJoyNew & B_BUTTON) !== 0) {
      runtime.gShouldAdvanceLinkState = 2;
    }

    runtime.sSendRecvStatus = eReaderHandleTransfer(runtime, 1, size, src, null);
    if ((runtime.sSendRecvStatus & 0x13) === 0x10) {
      result = 0;
      break;
    } else if ((runtime.sSendRecvStatus & 8) !== 0) {
      result = 1;
      break;
    } else if ((runtime.sSendRecvStatus & 4) !== 0) {
      result = 2;
      break;
    } else {
      runtime.gShouldAdvanceLinkState = 0;
      vBlankIntrWait(runtime);
    }
  }

  clearSendRecvMgr(runtime);
  eReaderHelperRestoreRegsState(runtime);
  return result;
};

export const eReaderRecv = (runtime: EReaderRuntime, dest: number[]): number => {
  let result = 2;
  eReaderHelperSaveRegsState(runtime);

  for (let i = 0; i < runtime.maxBlockingIterations; i += 1) {
    getKeyInput(runtime);
    if ((runtime.sJoyNew & B_BUTTON) !== 0) {
      runtime.gShouldAdvanceLinkState = 2;
    }

    runtime.sSendRecvStatus = eReaderHandleTransfer(runtime, 0, 0, null, dest);
    if ((runtime.sSendRecvStatus & 0x13) === 0x10) {
      result = 0;
      break;
    } else if ((runtime.sSendRecvStatus & 8) !== 0) {
      result = 1;
      break;
    } else if ((runtime.sSendRecvStatus & 4) !== 0) {
      result = 2;
      break;
    } else {
      runtime.gShouldAdvanceLinkState = 0;
      vBlankIntrWait(runtime);
    }
  }

  clearSendRecvMgr(runtime);
  eReaderHelperRestoreRegsState(runtime);
  return result;
};

export const closeSerial = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_IME = 0;
  runtime.regs.REG_IE = u16(runtime.regs.REG_IE & ~(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL));
  runtime.regs.REG_IME = 1;
  runtime.regs.REG_SIOCNT = 0;
  runtime.regs.REG_TM3CNT_H = 0;
  runtime.regs.REG_IF = INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL;
};

export const openSerialMulti = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_IME = 0;
  runtime.regs.REG_IE = u16(runtime.regs.REG_IE & ~(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL));
  runtime.regs.REG_IME = 1;
  runtime.regs.REG_RCNT = 0;
  runtime.regs.REG_SIOCNT = SIO_MULTI_MODE;
  runtime.regs.REG_SIOCNT = u16(runtime.regs.REG_SIOCNT | SIO_INTR_ENABLE | SIO_115200_BPS);
  runtime.regs.REG_IME = 0;
  runtime.regs.REG_IE = u16(runtime.regs.REG_IE | INTR_FLAG_SERIAL);
  runtime.regs.REG_IME = 1;
  if (runtime.mgr.state === 0) {
    clearSendRecvMgr(runtime);
  }
};

export const openSerial32 = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_RCNT = 0;
  runtime.regs.REG_SIOCNT = u16(SIO_INTR_ENABLE | SIO_32BIT_MODE);
  runtime.regs.REG_SIOCNT = u16(runtime.regs.REG_SIOCNT | SIO_MULTI_SD);
  runtime.gShouldAdvanceLinkState = 0;
  runtime.sCounter1 = 0;
  runtime.sCounter2 = 0;
};

export const eReaderHandleTransfer = (
  runtime: EReaderRuntime,
  mode: number,
  size: number,
  data: number[] | null,
  recvBuffer: number[] | null
): number => {
  const mgr = runtime.mgr;
  switch (mgr.state) {
    case EREADER_XFR_STATE_INIT:
      openSerialMulti(runtime);
      mgr.xferState = EREADER_XFER_EXE;
      mgr.state = EREADER_XFR_STATE_HANDSHAKE;
      break;
    case EREADER_XFR_STATE_HANDSHAKE:
      if (determineSendRecvState(runtime, mode)) {
        enableSio(runtime);
      }
      if (runtime.gShouldAdvanceLinkState === 2) {
        mgr.cancellationReason = EREADER_CANCEL_KEY;
        mgr.state = EREADER_XFR_STATE_DONE;
      }
      break;
    case EREADER_XFR_STATE_START:
      openSerial32(runtime);
      setUpTransferManager(runtime, size, data, recvBuffer);
      mgr.state = EREADER_XFR_STATE_TRANSFER;
    // fallthrough
    case EREADER_XFR_STATE_TRANSFER:
      if (runtime.gShouldAdvanceLinkState === 2) {
        mgr.cancellationReason = EREADER_CANCEL_KEY;
        mgr.state = EREADER_XFR_STATE_DONE;
      } else {
        runtime.sCounter1 += 1;
        runtime.sCounter2 += 1;
        if (mgr.master_slave === 0 && runtime.sCounter2 > 60) {
          mgr.cancellationReason = EREADER_CANCEL_TIMEOUT;
          mgr.state = EREADER_XFR_STATE_DONE;
        }
        if (mgr.xferState !== EREADER_XFER_CHK) {
          if (mgr.master_slave !== 0 && runtime.sCounter1 > 2) {
            enableSio(runtime);
            mgr.xferState = EREADER_XFER_CHK;
          } else {
            enableSio(runtime);
            mgr.xferState = EREADER_XFER_CHK;
          }
        }
      }
      break;
    case EREADER_XFR_STATE_TRANSFER_DONE:
      openSerialMulti(runtime);
      mgr.state = EREADER_XFR_STATE_CHECKSUM;
      break;
    case EREADER_XFR_STATE_CHECKSUM:
      if (mgr.master_slave === 1 && runtime.sCounter1 > 2) {
        enableSio(runtime);
      }
      runtime.sCounter1 += 1;
      if (runtime.sCounter1 > 60) {
        mgr.cancellationReason = EREADER_CANCEL_TIMEOUT;
        mgr.state = EREADER_XFR_STATE_DONE;
      }
      break;
    case EREADER_XFR_STATE_DONE:
      if (mgr.xferState !== 0) {
        closeSerial(runtime);
        mgr.xferState = 0;
      }
      break;
  }
  return u16((mgr.xferState << EREADER_XFER_SHIFT)
    | (mgr.cancellationReason << EREADER_CANCEL_SHIFT)
    | (mgr.checksumResult << EREADER_CHECKSUM_SHIFT));
};

export const determineSendRecvState = (runtime: EReaderRuntime, mode: number): number => {
  const terminals = runtime.regs.REG_SIOCNT & (SIO_MULTI_SI | SIO_MULTI_SD);
  const resp = terminals === SIO_MULTI_SD && mode !== 0 ? 1 : 0;
  runtime.mgr.master_slave = resp;
  return resp;
};

export const setUpTransferManager = (
  runtime: EReaderRuntime,
  size: number,
  data: number[] | null,
  recvBuffer: number[] | null
): void => {
  const mgr = runtime.mgr;
  if (mgr.master_slave) {
    runtime.regs.REG_SIOCNT = u16(runtime.regs.REG_SIOCNT | SIO_38400_BPS);
    mgr.dataptr = data;
    runtime.regs.REG_SIODATA32 = u32(size);
    mgr.size = Math.trunc(size / 4) + 1;
    startTm3(runtime);
  } else {
    runtime.regs.REG_SIOCNT = u16(runtime.regs.REG_SIOCNT | SIO_9600_BPS);
    mgr.dataptr = recvBuffer;
  }
};

export const startTm3 = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_TM3CNT_L = u16(-601);
  runtime.regs.REG_TM3CNT_H = TIMER_INTR_ENABLE;
  runtime.regs.REG_IME = 0;
  runtime.regs.REG_IE = u16(runtime.regs.REG_IE | INTR_FLAG_TIMER3);
  runtime.regs.REG_IME = 1;
};

export const eReaderHelperTimer3Callback = (runtime: EReaderRuntime): void => {
  disableTm3(runtime);
  enableSio(runtime);
};

export const eReaderHelperSerialCallback = (runtime: EReaderRuntime): void => {
  const mgr = runtime.mgr;
  const recv = [...runtime.regs.REG_SIOMLT_RECV];
  let recv32 = 0;

  switch (mgr.state) {
    case EREADER_XFR_STATE_HANDSHAKE: {
      runtime.regs.REG_SIOMLT_SEND = 0xccd0;
      let cnt1 = 0;
      let cnt2 = 0;
      for (let i = 0; i < 4; i += 1) {
        if (recv[i] === 0xccd0) {
          cnt1 += 1;
        } else if (recv[i] !== 0xffff) {
          cnt2 += 1;
        }
      }
      if (cnt1 === 2 && cnt2 === 0) {
        mgr.state = EREADER_XFR_STATE_START;
      }
      break;
    }
    case EREADER_XFR_STATE_TRANSFER:
      recv32 = runtime.regs.REG_SIODATA32 >>> 0;
      if (mgr.cursor === 0 && mgr.master_slave === 0) {
        mgr.size = Math.trunc(recv32 / 4) + 1;
      }
      if (mgr.master_slave === 1) {
        if (mgr.cursor < mgr.size) {
          const word = mgr.dataptr?.[mgr.cursor] ?? 0;
          runtime.regs.REG_SIODATA32 = u32(word);
          mgr.checksum = u32(mgr.checksum + word);
        } else {
          runtime.regs.REG_SIODATA32 = mgr.checksum;
        }
      } else {
        if (mgr.cursor > 0 && mgr.cursor < mgr.size + 1) {
          if (mgr.dataptr !== null) {
            mgr.dataptr[mgr.cursor - 1] = recv32;
          }
          mgr.checksum = u32(mgr.checksum + recv32);
        } else if (mgr.cursor !== 0) {
          if (mgr.checksum === recv32) {
            mgr.checksumResult = EREADER_CHECKSUM_OK;
          } else {
            mgr.checksumResult = EREADER_CHECKSUM_ERR;
          }
        }
        runtime.sCounter2 = 0;
      }
      mgr.cursor += 1;
      if (mgr.cursor < mgr.size + 2) {
        if (mgr.master_slave !== 0) {
          runtime.regs.REG_TM3CNT_H = u16(runtime.regs.REG_TM3CNT_H | TIMER_ENABLE);
        } else {
          enableSio(runtime);
        }
      } else {
        mgr.state = EREADER_XFR_STATE_TRANSFER_DONE;
        runtime.sCounter1 = 0;
      }
      break;
    case EREADER_XFR_STATE_CHECKSUM:
      if (mgr.master_slave === 0) {
        runtime.regs.REG_SIODATA8 = mgr.checksumResult;
      }
      if (recv[1] === EREADER_CHECKSUM_OK || recv[1] === EREADER_CHECKSUM_ERR) {
        if (mgr.master_slave === 1) {
          mgr.checksumResult = recv[1];
        }
        mgr.state = EREADER_XFR_STATE_DONE;
      }
      break;
  }
};

export const enableSio = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_SIOCNT = u16(runtime.regs.REG_SIOCNT | SIO_ENABLE);
};

export const disableTm3 = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_TM3CNT_H = u16(runtime.regs.REG_TM3CNT_H & ~TIMER_ENABLE);
  runtime.regs.REG_TM3CNT_L = u16(-601);
};

export const getKeyInput = (runtime: EReaderRuntime): void => {
  const rawKeys = (runtime.regs.REG_KEYINPUT ^ 0x3ff) & 0x3ff;
  runtime.sJoyNew = rawKeys & ~runtime.sJoyNewOrRepeated;
  runtime.sJoyNewOrRepeated = rawKeys;
};

export const eReaderHelperSaveRegsState = (runtime: EReaderRuntime): void => {
  runtime.sSavedIme = runtime.regs.REG_IME;
  runtime.sSavedIe = runtime.regs.REG_IE;
  runtime.sSavedTm3Cnt = runtime.regs.REG_TM3CNT_H;
  runtime.sSavedSioCnt = runtime.regs.REG_SIOCNT;
  runtime.sSavedRCnt = runtime.regs.REG_RCNT;
};

export const eReaderHelperRestoreRegsState = (runtime: EReaderRuntime): void => {
  runtime.regs.REG_IME = runtime.sSavedIme;
  runtime.regs.REG_IE = runtime.sSavedIe;
  runtime.regs.REG_TM3CNT_H = runtime.sSavedTm3Cnt;
  runtime.regs.REG_SIOCNT = runtime.sSavedSioCnt;
  runtime.regs.REG_RCNT = runtime.sSavedRCnt;
};

export const eReaderHelperClearsSendRecvMgr = (runtime: EReaderRuntime): void => {
  clearSendRecvMgr(runtime);
};

export const EReader_Send = eReaderSend;
export const EReader_Recv = eReaderRecv;
export const CloseSerial = closeSerial;
export const OpenSerialMulti = openSerialMulti;
export const OpenSerial32 = openSerial32;
export const EReaderHandleTransfer = eReaderHandleTransfer;
export const DetermineSendRecvState = determineSendRecvState;
export const SetUpTransferManager = setUpTransferManager;
export const StartTm3 = startTm3;
export const EReaderHelper_Timer3Callback = eReaderHelperTimer3Callback;
export const EReaderHelper_SerialCallback = eReaderHelperSerialCallback;
export const EnableSio = enableSio;
export const DisableTm3 = disableTm3;
export const GetKeyInput = getKeyInput;
export const EReaderHelper_SaveRegsState = eReaderHelperSaveRegsState;
export const EReaderHelper_RestoreRegsState = eReaderHelperRestoreRegsState;
export const EReaderHelper_ClearsSendRecvMgr = eReaderHelperClearsSendRecvMgr;
