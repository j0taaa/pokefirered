import { describe, expect, test } from 'vitest';
import {
  AGB_CLK_MASTER,
  INTR_FLAG_SERIAL,
  RFU_ID,
  SIO32_CONNECTION_DATA,
  SIO32_ID_LIB_VAR,
  SIO_32BIT_MODE,
  SIO_38400_BPS,
  SIO_ENABLE,
  SIO_INTR_ENABLE,
  AgbRFU_checkID,
  Sio32IDInit,
  Sio32IDIntr,
  Sio32IDMain,
  agbRfuCheckId,
  createRfuSio32IdState,
  createRfuSio32Registers,
} from '../src/game/decompLibrfuSio32Id';

describe('decompLibrfuSio32Id', () => {
  test('Sio32IDInit disables timer/serial interrupts, configures 32-bit SIO, and clears state', () => {
    const state = createRfuSio32IdState();
    const registers = createRfuSio32Registers();
    state.count = 3;
    registers.REG_IE = 0xffff;
    registers.timerSelect = 1;

    Sio32IDInit(state, registers);

    expect(state).toEqual(createRfuSio32IdState());
    expect(registers.REG_IE & ((8 << 1) | INTR_FLAG_SERIAL)).toBe(0);
    expect(registers.REG_SIOCNT).toBe(SIO_32BIT_MODE | SIO_INTR_ENABLE | SIO_ENABLE);
    expect(registers.REG_IF).toBe(INTR_FLAG_SERIAL);
  });

  test('Sio32IDMain enters master mode and returns lastId once available', () => {
    const state = createRfuSio32IdState();
    const registers = createRfuSio32Registers();
    expect(Sio32IDMain(state, registers)).toBe(0);
    expect(state.MS_mode).toBe(AGB_CLK_MASTER);
    expect(state.state).toBe(1);
    expect(registers.REG_SIOCNT & (SIO_38400_BPS | SIO_ENABLE)).toBe(SIO_38400_BPS | SIO_ENABLE);
    expect(registers.REG_IE & INTR_FLAG_SERIAL).toBe(INTR_FLAG_SERIAL);

    state.lastId = 0x1234;
    expect(Sio32IDMain(state, registers)).toBe(0x1234);
    expect(state.state).toBe(2);
  });

  test('Sio32IDIntr follows the NINTENDO handshake and then captures RFU id', () => {
    const state = createRfuSio32IdState();
    const registers = createRfuSio32Registers();
    state.MS_mode = AGB_CLK_MASTER;

    registers.REG_SIODATA32 = 0x0000ffff;
    Sio32IDIntr(state, registers);
    expect(state.count).toBe(0);
    expect(state.send_id).toBe(SIO32_CONNECTION_DATA[0]);

    for (let i = 1; i < SIO32_CONNECTION_DATA.length; i += 1) {
      state.recv_id = (~state.send_id) & 0xffff;
      registers.REG_SIODATA32 = ((~state.recv_id & 0xffff) << 16) | state.recv_id;
      Sio32IDIntr(state, registers);
      expect(state.count).toBe(i);
      expect(state.send_id).toBe(SIO32_CONNECTION_DATA[i]);
    }

    state.recv_id = (~state.send_id) & 0xffff;
    registers.REG_SIODATA32 = ((~state.recv_id & 0xffff) << 16) | state.recv_id;
    Sio32IDIntr(state, registers);
    expect(state.count).toBe(4);
    expect(state.send_id).toBe(RFU_ID);

    state.count = 4;
    state.recv_id = 0xabcd;
    registers.REG_SIODATA32 = (RFU_ID << 16) | state.recv_id;
    Sio32IDIntr(state, registers);
    expect(state.lastId).toBe(RFU_ID);
    expect(state.send_id).toBe(RFU_ID);
  });

  test('AgbRFU_checkID returns -1 when interrupts are disabled and restores registers afterward', () => {
    const disabled = createRfuSio32Registers();
    disabled.REG_IME = 0;
    expect(AgbRFU_checkID(disabled, 1)).toBe(-1);

    const registers = createRfuSio32Registers();
    registers.REG_IE = 0x2222;
    const id = AgbRFU_checkID(registers, 1, (state) => {
      state.lastId = 0xbeef;
    });
    expect(id).toBe(0xbeef);
    expect(registers.REG_IE).toBe(0x2222);
    expect(registers.REG_IME).toBe(1);
    expect(registers.stwiState).toBe(0);
    expect(registers.callbackSet).toBe(false);
    expect(SIO32_ID_LIB_VAR).toBe('Sio32ID_030820');
    expect(agbRfuCheckId(createRfuSio32Registers(), 0)).toBe(0);
  });
});
