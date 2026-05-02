import { describe, expect, it } from 'vitest';
import {
  AGB_CLK_MASTER,
  AGB_CLK_SLAVE,
  Callback_Dummy_ID,
  Callback_Dummy_M,
  Callback_Dummy_S,
  ERR_REQ_CMD_ACK_REJECTION,
  ID_MS_CHANGE_REQ,
  INTR_FLAG_TIMER0,
  IntrSIO32,
  SIO_32BIT_MODE,
  SIO_57600_BPS,
  SIO_ENABLE,
  SIO_INTR_ENABLE,
  SIO_MULTI_SI,
  SIO_MULTI_SI_SHIFT,
  STWI_init_slave,
  STWI_set_timer_in_RAM,
  STWI_stop_timer_in_RAM,
  TIMER_64CLK,
  TIMER_256CLK,
  TIMER_ENABLE,
  TIMER_INTR_ENABLE,
  createLibrfuIntrRegisters,
  createSTWIStatus,
  handshake_wait,
  sio32intr_clock_master,
  sio32intr_clock_slave,
} from '../src/game/decompLibrfuIntr';

const makeHandshakeImmediate = (registers: ReturnType<typeof createLibrfuIntrRegisters>) => {
  registers.onHandshakePoll = (slot) => {
    registers.REG_SIOCNT = slot << SIO_MULTI_SI_SHIFT;
  };
};

describe('decompLibrfuIntr', () => {
  it('dummy callbacks forward masked C argument widths exactly', () => {
    const masterCalls: Array<[number, number]> = [];
    const slaveCalls: number[] = [];
    let idCalls = 0;

    Callback_Dummy_M(0x1_0000_0012, 0x1_0034, (reqCommandId, error) => {
      masterCalls.push([reqCommandId, error]);
    });
    Callback_Dummy_S(0x1_0056, (reqCommandId) => {
      slaveCalls.push(reqCommandId);
    });
    Callback_Dummy_ID(() => {
      idCalls += 1;
    });

    expect(masterCalls).toEqual([[0x12, 0x34]]);
    expect(slaveCalls).toEqual([0x56]);
    expect(idCalls).toBe(1);
  });

  it('IntrSIO32 dispatches the state 10 ID callback directly', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    let calls = 0;
    status.state = 10;
    status.callbackID = () => {
      calls += 1;
    };

    IntrSIO32(status, registers);

    expect(calls).toBe(1);
  });

  it('STWI_set_timer_in_RAM and STWI_stop_timer_in_RAM mirror timer register writes', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    status.timerSelect = 2;

    STWI_set_timer_in_RAM(status, registers, 80);
    expect(status.timerState).toBe(2);
    expect(registers.REG_TM0CNT_L[2]).toBe(0xfae0);
    expect(registers.REG_TM0CNT_H[2]).toBe(TIMER_ENABLE | TIMER_64CLK | TIMER_256CLK | TIMER_INTR_ENABLE);
    expect(registers.REG_IF).toBe(INTR_FLAG_TIMER0 << 2);
    expect(registers.REG_IME).toBe(1);

    STWI_stop_timer_in_RAM(status, registers);
    expect(status.timerState).toBe(0);
    expect(registers.REG_TM0CNT_L[2]).toBe(0);
    expect(registers.REG_TM0CNT_H[2]).toBe(0);
  });

  it('handshake_wait returns on timerActive before matching the SI slot', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    status.timerActive = 1;
    registers.REG_SIOCNT = 0;

    expect(handshake_wait(status, registers, 1)).toBe(1);
    expect(status.timerActive).toBe(0);
  });

  it('master ACK completion changes to slave mode for master/slave change requests', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    const callbackCalls: Array<[number, number]> = [];
    makeHandshakeImmediate(registers);
    status.state = 1;
    status.msMode = AGB_CLK_MASTER;
    status.sending = 1;
    status.reqActiveCommand = ID_MS_CHANGE_REQ;
    status.callbackM = (reqCommandId, error) => {
      callbackCalls.push([reqCommandId, error]);
    };
    registers.REG_SIODATA32 = 0x996600a7;

    sio32intr_clock_master(status, registers);

    expect(status.ackNext).toBe(1);
    expect(status.ackLength).toBe(0);
    expect(status.ackActiveCommand).toBe(0xa7);
    expect(status.rxPacket[0]).toBe(0x996600a7);
    expect(status.msMode).toBe(AGB_CLK_SLAVE);
    expect(status.state).toBe(5);
    expect(status.sending).toBe(0);
    expect(registers.REG_SIODATA32).toBe(0x80000000);
    expect(registers.REG_SIOCNT).toBe(SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_57600_BPS | SIO_ENABLE);
    expect(callbackCalls).toEqual([[ID_MS_CHANGE_REQ, 0]]);
  });

  it('master ACK rejection stores ERR_REQ_CMD_ACK_REJECTION and calls callbackM', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    const callbackCalls: Array<[number, number]> = [];
    makeHandshakeImmediate(registers);
    status.state = 1;
    status.msMode = AGB_CLK_MASTER;
    status.sending = 1;
    status.reqActiveCommand = 0x13;
    status.callbackM = (reqCommandId, error) => {
      callbackCalls.push([reqCommandId, error]);
    };
    registers.REG_SIODATA32 = 0x996600ee;

    sio32intr_clock_master(status, registers);

    expect(status.state).toBe(4);
    expect(status.error).toBe(ERR_REQ_CMD_ACK_REJECTION);
    expect(status.sending).toBe(0);
    expect(callbackCalls).toEqual([[0x13, ERR_REQ_CMD_ACK_REJECTION]]);
  });

  it('slave zero-length master/slave change request ACKs and returns to master on completion', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    const callbackCalls: number[] = [];
    makeHandshakeImmediate(registers);
    STWI_init_slave(status, registers);
    status.callbackS = (reqCommandId) => {
      callbackCalls.push(reqCommandId);
    };
    registers.REG_SIODATA32 = 0x99660027;

    sio32intr_clock_slave(status, registers);

    expect(status.rxPacket[0]).toBe(0x99660027);
    expect(status.reqLength).toBe(0);
    expect(status.reqActiveCommand).toBe(ID_MS_CHANGE_REQ);
    expect(status.ackActiveCommand).toBe(0xa7);
    expect(status.ackLength).toBe(0);
    expect(status.ackNext).toBe(1);
    expect(status.txPacket[0]).toBe(0x996600a7);
    expect(registers.REG_SIODATA32).toBe(0x996600a7);
    expect(status.state).toBe(7);

    registers.REG_SIODATA32 = 0x80000000;
    sio32intr_clock_slave(status, registers);

    expect(status.state).toBe(0);
    expect(status.msMode).toBe(AGB_CLK_MASTER);
    expect(registers.REG_SIODATA32).toBe(0);
    expect(callbackCalls).toEqual([ID_MS_CHANGE_REQ]);
  });

  it('slave rejects unsupported zero-length requests with the same ACK payload shape', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    makeHandshakeImmediate(registers);
    STWI_init_slave(status, registers);
    registers.REG_SIODATA32 = 0x99660005;

    sio32intr_clock_slave(status, registers);

    expect(status.txPacket[0]).toBe(0x996601ee);
    expect(status.txPacket[1]).toBe(2);
    expect(status.ackLength).toBe(1);
    expect(status.error).toBe(ERR_REQ_CMD_ACK_REJECTION);
    expect(status.state).toBe(7);
  });

  it('slave receive request waits for all words before preparing ACK', () => {
    const status = createSTWIStatus();
    const registers = createLibrfuIntrRegisters();
    makeHandshakeImmediate(registers);
    STWI_init_slave(status, registers);
    registers.REG_SIOCNT = SIO_MULTI_SI;
    registers.REG_SIODATA32 = 0x99660128;

    sio32intr_clock_slave(status, registers);

    expect(status.state).toBe(6);
    expect(status.reqLength).toBe(1);
    expect(status.reqActiveCommand).toBe(0x28);
    expect(registers.REG_SIODATA32).toBe(0x80000000);

    registers.REG_SIODATA32 = 0x12345678;
    sio32intr_clock_slave(status, registers);

    expect(status.rxPacket[1]).toBe(0x12345678);
    expect(status.state).toBe(7);
    expect(status.txPacket[0]).toBe(0x996600a8);
  });
});
