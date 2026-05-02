export const ID_DATA_TX_AND_CHANGE_REQ = 0x25;
export const ID_MS_CHANGE_REQ = 0x27;
export const ID_DATA_READY_AND_CHANGE_REQ = 0x28;
export const ID_DISCONNECTED_AND_CHANGE_REQ = 0x29;
export const ID_UNK35_REQ = 0x35;
export const ID_UNK36_REQ = 0x36;
export const ID_RESUME_RETRANSMIT_AND_CHANGE_REQ = 0x37;

export const AGB_CLK_SLAVE = 0;
export const AGB_CLK_MASTER = 1;

export const ERR_REQ_CMD_ACK_REJECTION = 0x0003;

export const TIMER_1CLK = 0x00;
export const TIMER_64CLK = 0x01;
export const TIMER_256CLK = 0x02;
export const TIMER_INTR_ENABLE = 0x40;
export const TIMER_ENABLE = 0x80;

export const SIO_32BIT_MODE = 0x1000;
export const SIO_57600_BPS = 0x0002;
export const SIO_115200_BPS = 0x0003;
export const SIO_MULTI_SI = 0x0004;
export const SIO_MULTI_SD = 0x0008;
export const SIO_ENABLE = 0x0080;
export const SIO_INTR_ENABLE = 0x4000;
export const SIO_MULTI_SI_SHIFT = 2;

export const INTR_FLAG_TIMER0 = 1 << 3;

export type StwiCallbackM = (reqCommandId: number, error: number) => void;
export type StwiCallbackS = (reqCommandId: number) => void;
export type StwiCallbackID = () => void;

export interface STWIStatus {
  state: number;
  reqLength: number;
  reqNext: number;
  reqActiveCommand: number;
  ackLength: number;
  ackNext: number;
  ackActiveCommand: number;
  timerSelect: number;
  unk_b: number;
  timerState: number;
  timerActive: number;
  unk_11: number;
  error: number;
  msMode: number;
  recoveryCount: number;
  unk_16: number;
  unk_17: number;
  callbackM: StwiCallbackM | null;
  callbackS: StwiCallbackS | null;
  callbackID: StwiCallbackID | null;
  txPacket: number[];
  rxPacket: number[];
  sending: number;
}

export interface LibrfuIntrRegisters {
  REG_IME: number;
  REG_SIOCNT: number;
  REG_SIODATA32: number;
  REG_IF: number;
  REG_TM0CNT_L: number[];
  REG_TM0CNT_H: number[];
  handshakePollLimit: number;
  timerWaitPollLimit: number;
  onHandshakePoll?: (slot: number, status: STWIStatus, registers: LibrfuIntrRegisters) => void;
  onTimerWaitPoll?: (status: STWIStatus, registers: LibrfuIntrRegisters) => void;
}

export const createSTWIStatus = (): STWIStatus => ({
  state: 0,
  reqLength: 0,
  reqNext: 0,
  reqActiveCommand: 0,
  ackLength: 0,
  ackNext: 0,
  ackActiveCommand: 0,
  timerSelect: 0,
  unk_b: 0,
  timerState: 0,
  timerActive: 0,
  unk_11: 0,
  error: 0,
  msMode: AGB_CLK_MASTER,
  recoveryCount: 0,
  unk_16: 0,
  unk_17: 0,
  callbackM: null,
  callbackS: null,
  callbackID: null,
  txPacket: Array(32).fill(0),
  rxPacket: Array(32).fill(0),
  sending: 0,
});

export const createLibrfuIntrRegisters = (): LibrfuIntrRegisters => ({
  REG_IME: 1,
  REG_SIOCNT: SIO_MULTI_SI,
  REG_SIODATA32: 0,
  REG_IF: 0,
  REG_TM0CNT_L: [0, 0, 0, 0],
  REG_TM0CNT_H: [0, 0, 0, 0],
  handshakePollLimit: 1024,
  timerWaitPollLimit: 1024,
});

const u8 = (value: number): number => value & 0xff;
const u16 = (value: number): number => value & 0xffff;
const u32 = (value: number): number => value >>> 0;

export function IntrSIO32(status: STWIStatus, registers: LibrfuIntrRegisters): void {
  if (status.state === 10) {
    if (status.callbackID !== null) {
      Callback_Dummy_ID(status.callbackID);
    }
  } else if (status.msMode === AGB_CLK_MASTER) {
    sio32intr_clock_master(status, registers);
  } else {
    sio32intr_clock_slave(status, registers);
  }
}

export function sio32intr_clock_master(status: STWIStatus, registers: LibrfuIntrRegisters): void {
  let ackLen: number;

  STWI_set_timer_in_RAM(status, registers, 80);
  const regSIODATA32 = u32(registers.REG_SIODATA32);

  if (status.state === 0) {
    if (regSIODATA32 === 0x80000000) {
      if (status.reqNext <= status.reqLength) {
        registers.REG_SIODATA32 = u32(status.txPacket[status.reqNext]);
        status.reqNext = u8(status.reqNext + 1);
      } else {
        status.state = 1;
        registers.REG_SIODATA32 = 0x80000000;
      }
    } else {
      STWI_stop_timer_in_RAM(status, registers);
      STWI_set_timer_in_RAM(status, registers, 130);
      return;
    }
  } else if (status.state === 1) {
    if (u32(regSIODATA32 & 0xffff0000) === 0x99660000) {
      status.ackNext = 0;
      status.rxPacket[status.ackNext] = regSIODATA32;
      status.ackNext = u8(status.ackNext + 1);
      status.ackActiveCommand = u8(regSIODATA32);
      status.ackLength = u8(regSIODATA32 >>> 8);
      ackLen = status.ackLength;
      if (ackLen >= status.ackNext) {
        status.state = 2;
        registers.REG_SIODATA32 = 0x80000000;
      } else {
        status.state = 3;
      }
    } else {
      STWI_stop_timer_in_RAM(status, registers);
      STWI_set_timer_in_RAM(status, registers, 130);
      return;
    }
  } else if (status.state === 2) {
    status.rxPacket[status.ackNext] = regSIODATA32;
    status.ackNext = u8(status.ackNext + 1);
    if (status.ackLength < status.ackNext) {
      status.state = 3;
    } else {
      registers.REG_SIODATA32 = 0x80000000;
    }
  }

  if (handshake_wait(status, registers, 1) === 1) {
    return;
  }

  registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS | SIO_MULTI_SD;

  if (handshake_wait(status, registers, 0) === 1) {
    return;
  }

  STWI_stop_timer_in_RAM(status, registers);

  if (status.state === 3) {
    if (
      status.ackActiveCommand === (0x80 | ID_MS_CHANGE_REQ)
      || status.ackActiveCommand === (0x80 | ID_DATA_TX_AND_CHANGE_REQ)
      || status.ackActiveCommand === (0x80 | ID_UNK35_REQ)
      || status.ackActiveCommand === (0x80 | ID_RESUME_RETRANSMIT_AND_CHANGE_REQ)
    ) {
      status.msMode = AGB_CLK_SLAVE;
      registers.REG_SIODATA32 = 0x80000000;
      registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS;
      registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS | SIO_ENABLE;
      status.state = 5;
    } else {
      if (status.ackActiveCommand === 0xee) {
        registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS;
        status.state = 4;
        status.error = ERR_REQ_CMD_ACK_REJECTION;
      } else {
        registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS;
        status.state = 4;
      }
    }
    status.sending = 0;
    if (status.callbackM !== null) {
      Callback_Dummy_M(status.reqActiveCommand, status.error, status.callbackM);
    }
  } else {
    registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS;
    registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS | SIO_ENABLE;
  }
}

export function sio32intr_clock_slave(status: STWIStatus, registers: LibrfuIntrRegisters): void {
  let reqLen: number;

  status.timerActive = 0;
  STWI_set_timer_in_RAM(status, registers, 100);
  if (handshake_wait(status, registers, 0) === 1) {
    return;
  }
  registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS | SIO_MULTI_SD;
  const regSIODATA32 = u32(registers.REG_SIODATA32);

  if (status.state === 5) {
    status.rxPacket[0] = regSIODATA32;
    status.reqNext = 1;
    reqLen = regSIODATA32 >>> 16;
    if (reqLen === (0x99660000 >>> 16)) {
      status.reqLength = u8(regSIODATA32 >>> 8);
      reqLen = status.reqLength;
      status.reqActiveCommand = u8(regSIODATA32);
      reqLen = status.reqActiveCommand;
      void reqLen;
      if (status.reqLength === 0) {
        if (
          status.reqActiveCommand === ID_MS_CHANGE_REQ
          || status.reqActiveCommand === ID_DATA_READY_AND_CHANGE_REQ
          || status.reqActiveCommand === ID_DISCONNECTED_AND_CHANGE_REQ
          || status.reqActiveCommand === ID_UNK36_REQ
        ) {
          status.ackActiveCommand = u8(status.reqActiveCommand + 0x80);
          status.txPacket[0] = u32(0x99660000 + status.ackActiveCommand);
          status.ackLength = 0;
        } else {
          status.txPacket[0] = 0x996601ee;
          if (status.reqActiveCommand >= 0x10 && status.reqActiveCommand <= 0x3d) {
            status.txPacket[1] = 1;
          } else {
            status.txPacket[1] = 2;
          }
          status.ackLength = 1;
          status.error = ERR_REQ_CMD_ACK_REJECTION;
        }
        registers.REG_SIODATA32 = u32(status.txPacket[0]);
        status.ackNext = 1;
        status.state = 7;
      } else {
        registers.REG_SIODATA32 = 0x80000000;
        status.reqNext = 1;
        status.state = 6;
      }
    } else {
      STWI_stop_timer_in_RAM(status, registers);
      STWI_set_timer_in_RAM(status, registers, 100);
      return;
    }
  } else if (status.state === 6) {
    status.rxPacket[status.reqNext] = regSIODATA32;
    status.reqNext = u8(status.reqNext + 1);
    if (status.reqLength < status.reqNext) {
      if (
        status.reqActiveCommand === ID_DATA_READY_AND_CHANGE_REQ
        || status.reqActiveCommand === ID_DISCONNECTED_AND_CHANGE_REQ
        || status.reqActiveCommand === ID_UNK36_REQ
      ) {
        status.ackActiveCommand = u8(status.reqActiveCommand + 0x80);
        status.txPacket[0] = u32(0x99660000 | status.ackActiveCommand);
        status.ackLength = 0;
      } else {
        status.txPacket[0] = 0x996601ee;
        if (status.reqActiveCommand >= 0x10 && status.reqActiveCommand <= 0x3d) {
          status.txPacket[1] = 1;
        } else {
          status.txPacket[1] = 2;
        }
        status.ackLength = 1;
        status.error = ERR_REQ_CMD_ACK_REJECTION;
      }
      registers.REG_SIODATA32 = u32(status.txPacket[0]);
      status.ackNext = 1;
      status.state = 7;
    } else {
      registers.REG_SIODATA32 = 0x80000000;
    }
  } else if (status.state === 7) {
    if (regSIODATA32 === 0x80000000) {
      if (status.ackLength < status.ackNext) {
        status.state = 8;
      } else {
        registers.REG_SIODATA32 = u32(status.txPacket[status.ackNext]);
        status.ackNext = u8(status.ackNext + 1);
      }
    } else {
      STWI_stop_timer_in_RAM(status, registers);
      STWI_set_timer_in_RAM(status, registers, 100);
      return;
    }
  }

  if (handshake_wait(status, registers, 1) === 1) {
    return;
  }

  if (status.state === 8) {
    registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS;
    STWI_stop_timer_in_RAM(status, registers);
    if (status.error === ERR_REQ_CMD_ACK_REJECTION) {
      STWI_init_slave(status, registers);
      if (status.callbackS !== null) {
        Callback_Dummy_S(0x1ee, status.callbackS);
      }
    } else {
      registers.REG_SIODATA32 = 0;
      registers.REG_SIOCNT = 0;
      registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS;
      status.msMode = AGB_CLK_MASTER;
      status.state = 0;
      if (status.callbackS !== null) {
        Callback_Dummy_S((status.reqLength << 8) | status.reqActiveCommand, status.callbackS);
      }
    }
  } else {
    registers.REG_IME = 0;
    waitForSlaveTimerWindow(status, registers);
    registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS;
    registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS | SIO_ENABLE;
    registers.REG_IME = 1;
  }
}

export function handshake_wait(status: STWIStatus, registers: LibrfuIntrRegisters, slot: number): number {
  let polls = 0;
  do {
    if ((status.timerActive & 0xff) === 1) {
      status.timerActive = 0;
      return 1;
    }
    registers.onHandshakePoll?.(slot, status, registers);
    polls += 1;
    if (polls > registers.handshakePollLimit) {
      throw new Error('handshake_wait exceeded poll limit');
    }
  } while ((registers.REG_SIOCNT & SIO_MULTI_SI) !== (slot << SIO_MULTI_SI_SHIFT));
  return 0;
}

export function STWI_set_timer_in_RAM(status: STWIStatus, registers: LibrfuIntrRegisters, count: number): void {
  registers.REG_IME = 0;
  switch (u8(count)) {
    case 50:
      registers.REG_TM0CNT_L[status.timerSelect] = 0xfccb;
      status.timerState = 1;
      break;
    case 80:
      registers.REG_TM0CNT_L[status.timerSelect] = 0xfae0;
      status.timerState = 2;
      break;
    case 100:
      registers.REG_TM0CNT_L[status.timerSelect] = 0xf996;
      status.timerState = 3;
      break;
    case 130:
      registers.REG_TM0CNT_L[status.timerSelect] = 0xf7ad;
      status.timerState = 4;
      break;
  }
  registers.REG_TM0CNT_H[status.timerSelect] = TIMER_ENABLE | TIMER_64CLK | TIMER_256CLK | TIMER_INTR_ENABLE;
  registers.REG_IF = INTR_FLAG_TIMER0 << status.timerSelect;
  registers.REG_IME = 1;
}

export function STWI_stop_timer_in_RAM(status: STWIStatus, registers: LibrfuIntrRegisters): void {
  status.timerState = 0;
  registers.REG_TM0CNT_L[status.timerSelect] = 0;
  registers.REG_TM0CNT_H[status.timerSelect] = 0;
}

export function STWI_init_slave(status: STWIStatus, registers: LibrfuIntrRegisters): void {
  status.state = 5;
  status.msMode = AGB_CLK_SLAVE;
  status.reqLength = 0;
  status.reqNext = 0;
  status.reqActiveCommand = 0;
  status.ackLength = 0;
  status.ackNext = 0;
  status.ackActiveCommand = 0;
  status.timerState = 0;
  status.timerActive = 0;
  status.error = 0;
  status.recoveryCount = 0;
  registers.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS | SIO_ENABLE;
}

function waitForSlaveTimerWindow(status: STWIStatus, registers: LibrfuIntrRegisters): void {
  if ((registers.REG_TM0CNT_H[0] & TIMER_ENABLE) === 0) {
    return;
  }

  const limit = (registers.REG_TM0CNT_H[0] & 0x03) === TIMER_1CLK ? 0xff9b : 0xfffe;
  let polls = 0;
  while (registers.REG_TM0CNT_L[0] > limit) {
    registers.onTimerWaitPoll?.(status, registers);
    polls += 1;
    if (polls > registers.timerWaitPollLimit) {
      throw new Error('slave timer wait exceeded poll limit');
    }
  }
}

export function Callback_Dummy_M(reqCommandId: number, error: number, callbackM: StwiCallbackM): void {
  callbackM(u32(reqCommandId), u16(error));
}

export function Callback_Dummy_S(reqCommandId: number, callbackS: StwiCallbackS): void {
  callbackS(u16(reqCommandId));
}

export function Callback_Dummy_ID(callbackId: StwiCallbackID): void {
  callbackId();
}
