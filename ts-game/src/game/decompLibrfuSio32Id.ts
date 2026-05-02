export const RFU_ID = 0x8001;
export const AGB_CLK_SLAVE = 0;
export const AGB_CLK_MASTER = 1;
export const SIO32_CONNECTION_DATA = [0x494e, 0x544e, 0x4e45, 0x4f44] as const;
export const SIO32_ID_LIB_VAR = 'Sio32ID_030820';
export const SIO_32BIT_MODE = 0x1000;
export const SIO_38400_BPS = 0x0001;
export const SIO_ENABLE = 0x0080;
export const SIO_INTR_ENABLE = 0x4000;
export const INTR_FLAG_SERIAL = 1 << 7;
export const TIMER_1024CLK = 0x03;
export const TIMER_ENABLE = 0x80;

export interface RfuSio32IdState {
  MS_mode: number;
  state: number;
  count: number;
  send_id: number;
  recv_id: number;
  unk8: number;
  lastId: number;
}

export interface RfuSio32Registers {
  REG_IME: number;
  REG_IE: number;
  REG_RCNT: number;
  REG_SIOCNT: number;
  REG_IF: number;
  REG_SIODATA32: number;
  timerSelect: number;
  stwiState: number;
  callbackSet: boolean;
}

export const createRfuSio32IdState = (): RfuSio32IdState => ({
  MS_mode: 0,
  state: 0,
  count: 0,
  send_id: 0,
  recv_id: 0,
  unk8: 0,
  lastId: 0
});

export const createRfuSio32Registers = (): RfuSio32Registers => ({
  REG_IME: 1,
  REG_IE: 0,
  REG_RCNT: 0,
  REG_SIOCNT: 0,
  REG_IF: 0,
  REG_SIODATA32: 0,
  timerSelect: 0,
  stwiState: 0,
  callbackSet: false
});

export const sio32IdInit = (
  state: RfuSio32IdState,
  registers: RfuSio32Registers
): void => {
  registers.REG_IME = 0;
  registers.REG_IE &= ~((8 << registers.timerSelect) | INTR_FLAG_SERIAL);
  registers.REG_IME = 1;
  registers.REG_RCNT = 0;
  registers.REG_SIOCNT = SIO_32BIT_MODE;
  registers.REG_SIOCNT |= SIO_INTR_ENABLE | SIO_ENABLE;
  Object.assign(state, createRfuSio32IdState());
  registers.REG_IF = INTR_FLAG_SERIAL;
};

export const sio32IdMain = (
  state: RfuSio32IdState,
  registers: RfuSio32Registers
): number => {
  switch (state.state) {
    case 0:
      state.MS_mode = AGB_CLK_MASTER;
      registers.REG_SIOCNT |= SIO_38400_BPS;
      registers.REG_IME = 0;
      registers.REG_IE |= INTR_FLAG_SERIAL;
      registers.REG_IME = 1;
      state.state = 1;
      registers.REG_SIOCNT |= SIO_ENABLE;
      break;
    case 1:
      if (state.lastId === 0) {
        if (state.MS_mode === AGB_CLK_MASTER) {
          if (state.count === 0) {
            registers.REG_IME = 0;
            registers.REG_SIOCNT |= SIO_ENABLE;
            registers.REG_IME = 1;
          }
        } else if (state.send_id !== RFU_ID && state.count === 0) {
          registers.REG_IME = 0;
          registers.REG_IE &= ~INTR_FLAG_SERIAL;
          registers.REG_IME = 1;
          registers.REG_SIOCNT = 0;
          registers.REG_SIOCNT = SIO_32BIT_MODE;
          registers.REG_IF = INTR_FLAG_SERIAL;
          registers.REG_SIOCNT |= SIO_INTR_ENABLE | SIO_ENABLE;
          registers.REG_IME = 0;
          registers.REG_IE |= INTR_FLAG_SERIAL;
          registers.REG_IME = 1;
        }
        break;
      }
      state.state = 2;
      return state.lastId;
    default:
      return state.lastId;
  }
  return 0;
};

export const sio32IdIntr = (
  state: RfuSio32IdState,
  registers: RfuSio32Registers
): void => {
  let regSIODATA32 = registers.REG_SIODATA32 >>> 0;
  if (state.MS_mode !== AGB_CLK_MASTER) {
    registers.REG_SIOCNT |= SIO_ENABLE;
  }

  const rfuSIO32IdUnk0Times16 = ((regSIODATA32 << (16 * state.MS_mode)) >>> 16) & 0xffff;
  regSIODATA32 = ((regSIODATA32 << (16 * (1 - state.MS_mode))) >>> 16) & 0xffff;

  if (state.lastId === 0) {
    let backup = rfuSIO32IdUnk0Times16;
    if (backup === state.recv_id) {
      if (state.count < 4) {
        backup = (~state.send_id) & 0xffff;
        if (state.recv_id === backup && regSIODATA32 === ((~state.recv_id) & 0xffff)) {
          state.count += 1;
        }
      } else {
        state.lastId = regSIODATA32;
      }
    } else {
      state.count = 0;
    }
  }

  state.send_id = state.count < 4 ? SIO32_CONNECTION_DATA[state.count] : RFU_ID;
  state.recv_id = (~regSIODATA32) & 0xffff;
  registers.REG_SIODATA32 = (
    (state.send_id << (16 * (1 - state.MS_mode)))
    + (state.recv_id << (16 * state.MS_mode))
  ) >>> 0;

  if (state.MS_mode === AGB_CLK_MASTER && (state.count !== 0 || regSIODATA32 === 0x494e) && state.lastId === 0) {
    registers.REG_SIOCNT |= SIO_ENABLE;
  }
};

export const agbRfuCheckId = (
  registers: RfuSio32Registers,
  maxTries: number,
  step?: (state: RfuSio32IdState, registers: RfuSio32Registers, iteration: number) => void
): number => {
  if (registers.REG_IME === 0) {
    return -1;
  }

  const ieBak = registers.REG_IE;
  registers.stwiState = 10;
  registers.callbackSet = true;
  const state = createRfuSio32IdState();
  sio32IdInit(state, registers);

  let id = 0;
  let tries = (maxTries & 0xff) * 8;
  let iteration = 0;
  while (((--tries) & 0xff) !== 0xff) {
    step?.(state, registers, iteration);
    id = sio32IdMain(state, registers);
    if (id !== 0) {
      break;
    }
    iteration += 1;
  }

  registers.REG_IME = 0;
  registers.REG_IE = ieBak;
  registers.REG_IME = 1;
  registers.stwiState = 0;
  registers.callbackSet = false;
  return id;
};

export function AgbRFU_checkID(
  registers: RfuSio32Registers,
  maxTries: number,
  step?: (state: RfuSio32IdState, registers: RfuSio32Registers, iteration: number) => void
): number {
  return agbRfuCheckId(registers, maxTries, step);
}

export function Sio32IDInit(
  state: RfuSio32IdState,
  registers: RfuSio32Registers
): void {
  sio32IdInit(state, registers);
}

export function Sio32IDMain(
  state: RfuSio32IdState,
  registers: RfuSio32Registers
): number {
  return sio32IdMain(state, registers);
}

export function Sio32IDIntr(
  state: RfuSio32IdState,
  registers: RfuSio32Registers
): void {
  sio32IdIntr(state, registers);
}
