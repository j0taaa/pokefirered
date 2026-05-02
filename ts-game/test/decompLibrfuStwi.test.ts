import { describe, expect, it } from 'vitest';
import {
  AGB_CLK_MASTER,
  AGB_CLK_SLAVE,
  AgbRFU_SoftReset,
  ERR_REQ_CMD_CLOCK_DRIFT,
  ERR_REQ_CMD_CLOCK_SLAVE,
  ERR_REQ_CMD_IME_DISABLE,
  ERR_REQ_CMD_SENDING,
  ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ,
  ID_CP_START_REQ,
  ID_CPR_START_REQ,
  ID_DATA_READY_AND_CHANGE_REQ,
  ID_DATA_TX_AND_CHANGE_REQ,
  ID_DATA_TX_REQ,
  ID_DISCONNECTED_AND_CHANGE_REQ,
  ID_DISCONNECT_REQ,
  ID_GAME_CONFIG_REQ,
  ID_LINK_STATUS_REQ,
  LIBRFU_STWI_C_TRANSLATION_UNIT,
  ID_MS_CHANGE_REQ,
  ID_RESET_REQ,
  ID_RESUME_RETRANSMIT_AND_CHANGE_REQ,
  ID_SC_START_REQ,
  ID_STOP_MODE_REQ,
  ID_SYSTEM_CONFIG_REQ,
  ID_TEST_MODE_REQ,
  INTR_FLAG_SERIAL,
  INTR_FLAG_TIMER0,
  SIO_115200_BPS,
  SIO_32BIT_MODE,
  SIO_INTR_ENABLE,
  SIO_MULTI_BUSY,
  STWI_init_Callback_M,
  STWI_init,
  STWI_init_all,
  STWI_init_timer,
  STWI_intr_timer,
  STWI_poll_CommandEnd,
  STWI_read_status,
  STWI_reset_ClockCounter,
  STWI_restart_Command,
  STWI_send_CP_StartREQ,
  STWI_send_CPR_StartREQ,
  STWI_send_DataReadyAndChangeREQ,
  STWI_send_DataTxAndChangeREQ,
  STWI_send_DataTxREQ,
  STWI_send_DisconnectREQ,
  STWI_send_DisconnectedAndChangeREQ,
  STWI_send_GameConfigREQ,
  STWI_send_LinkStatusREQ,
  STWI_send_MS_ChangeREQ,
  STWI_send_ResetREQ,
  STWI_send_ResumeRetransmitAndChangeREQ,
  STWI_send_SC_StartREQ,
  STWI_send_StopModeREQ,
  STWI_send_SystemConfigREQ,
  STWI_send_TestModeREQ,
  STWI_set_Callback_ID,
  STWI_set_Callback_M,
  STWI_set_Callback_S,
  STWI_set_MS_mode,
  STWI_set_timer,
  STWI_start_Command,
  STWI_stop_timer,
  TIMER_1024CLK,
  TIMER_ENABLE,
  TIMER_INTR_ENABLE,
  createRfuIntrStruct,
  createStwiRuntime,
} from '../src/game/decompLibrfuStwi';

const commandWord = (id: number, len: number) => (0x99660000 | (len << 8) | id) >>> 0;
const baseSio = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS;

describe('decompLibrfuStwi', () => {
  it('initializes STWI status, interrupt target, packet pointers, callbacks, and hardware registers', () => {
    const runtime = createStwiRuntime();
    const intr = createRfuIntrStruct();

    STWI_init_all(runtime, intr, true);
    expect(runtime.interrupt).toBe('block1');
    expect(runtime.gSTWIStatus).toBe(intr.block2);
    expect(runtime.gSTWIStatus.rxPacket).toBe(intr.rxPacketAlloc);
    expect(runtime.gSTWIStatus.txPacket).toBe(intr.txPacketAlloc);
    expect(runtime.gSTWIStatus.msMode).toBe(AGB_CLK_MASTER);
    expect(runtime.gSTWIStatus.state).toBe(0);
    expect(runtime.gSTWIStatus.sending).toBe(0);
    expect(runtime.REG_RCNT).toBe(0x100);
    expect(runtime.REG_SIOCNT).toBe(baseSio);
    expect(runtime.operations).toEqual(['DmaCopy16:IntrSIO32:block1', `IntrEnable:${INTR_FLAG_SERIAL}`]);

    STWI_init_timer(runtime, 2);
    expect(runtime.interrupt).toBe('STWI_intr_timer');
    expect(runtime.gSTWIStatus.timerSelect).toBe(2);
    expect(runtime.operations.at(-1)).toBe(`IntrEnable:${INTR_FLAG_TIMER0 << 2}`);

    const otherRuntime = createStwiRuntime();
    const otherIntr = createRfuIntrStruct();
    STWI_init_all(otherRuntime, otherIntr, false);
    expect(otherRuntime.interrupt).toBe('IntrSIO32');
    expect(otherRuntime.gSTWIStatus).toBe(otherIntr.block1Status);
  });

  it('reads status fields and preserves callback setters exactly', () => {
    const runtime = createStwiRuntime();
    runtime.gSTWIStatus.error = 7;
    runtime.gSTWIStatus.msMode = AGB_CLK_SLAVE;
    runtime.gSTWIStatus.state = 3;
    runtime.gSTWIStatus.reqActiveCommand = ID_LINK_STATUS_REQ;

    expect([0, 1, 2, 3, 9].map((index) => STWI_read_status(runtime, index))).toEqual([7, AGB_CLK_SLAVE, 3, ID_LINK_STATUS_REQ, 0xffff]);
    expect(STWI_poll_CommandEnd(runtime)).toBe(7);

    const callbackM = () => undefined;
    const callbackS = () => undefined;
    const callbackID = () => undefined;
    STWI_set_Callback_M(runtime, callbackM);
    STWI_set_Callback_S(runtime, callbackS);
    STWI_set_Callback_ID(runtime, callbackID);
    expect(runtime.gSTWIStatus.callbackM).toBe(callbackM);
    expect(runtime.gSTWIStatus.callbackS).toBe(callbackS);
    expect(runtime.gSTWIStatus.callbackID).toBe(callbackID);
    STWI_init_Callback_M(runtime);
    expect(runtime.gSTWIStatus.callbackM).toBeNull();
  });

  it('starts no-payload commands and blocks initialization on IME, active send, or slave mode errors', () => {
    const runtime = createStwiRuntime();
    const callbacks: string[] = [];
    STWI_set_Callback_M(runtime, (request, error, status) => callbacks.push(`${request}:${error}:${status ? 'status' : 'none'}`));

    expect(LIBRFU_STWI_C_TRANSLATION_UNIT).toBe('src/librfu_stwi.c');
    expect(STWI_init(runtime, ID_LINK_STATUS_REQ)).toBe(0);
    expect(runtime.gSTWIStatus.sending).toBe(1);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_LINK_STATUS_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(0);
    expect(runtime.gSTWIStatus.reqNext).toBe(0);
    expect(runtime.gSTWIStatus.error).toBe(0);
    runtime.gSTWIStatus.sending = 0;

    STWI_send_ResetREQ(runtime);
    expect(runtime.gSTWIStatus.sending).toBe(1);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_RESET_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(0);
    expect(runtime.gSTWIStatus.reqNext).toBe(1);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_RESET_REQ, 0));
    expect(runtime.REG_SIODATA32).toBe(commandWord(ID_RESET_REQ, 0));
    expect(runtime.REG_IE & INTR_FLAG_SERIAL).toBe(INTR_FLAG_SERIAL);
    expect(runtime.REG_SIOCNT).toBe(SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_MULTI_BUSY | SIO_115200_BPS);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_MS_ChangeREQ(runtime);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_MS_CHANGE_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(0);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_MS_CHANGE_REQ, 0));

    runtime.gSTWIStatus.sending = 0;
    STWI_send_ResumeRetransmitAndChangeREQ(runtime);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_RESUME_RETRANSMIT_AND_CHANGE_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(0);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_RESUME_RETRANSMIT_AND_CHANGE_REQ, 0));

    STWI_send_LinkStatusREQ(runtime);
    expect(runtime.gSTWIStatus.error).toBe(ERR_REQ_CMD_SENDING);
    expect(runtime.gSTWIStatus.sending).toBe(0);
    expect(callbacks.at(-1)).toBe(`${ID_LINK_STATUS_REQ}:${ERR_REQ_CMD_SENDING}:none`);

    runtime.REG_IME = 0;
    STWI_send_SC_StartREQ(runtime);
    expect(runtime.gSTWIStatus.error).toBe(ERR_REQ_CMD_IME_DISABLE);
    expect(callbacks.at(-1)).toBe(`${ID_SC_START_REQ}:${ERR_REQ_CMD_IME_DISABLE}:none`);

    runtime.REG_IME = 1;
    STWI_set_MS_mode(runtime, AGB_CLK_SLAVE);
    STWI_send_StopModeREQ(runtime);
    expect(runtime.gSTWIStatus.error).toBe(ERR_REQ_CMD_CLOCK_SLAVE);
    expect(callbacks.at(-1)).toBe(`${ID_STOP_MODE_REQ}:${ERR_REQ_CMD_CLOCK_SLAVE}:status`);
  });

  it('writes game/system config, data ready, disconnect, test mode, CP, and CPR payloads byte-for-byte', () => {
    const runtime = createStwiRuntime();

    STWI_send_GameConfigREQ(runtime, Array.from({ length: 16 }, (_, i) => i + 1), [0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7]);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_GAME_CONFIG_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(6);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_GAME_CONFIG_REQ, 6));
    expect(runtime.gSTWIStatus.txPacket.bytes.slice(4, 28)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7]);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_SystemConfigREQ(runtime, 0x1234, 0x56, 0x78);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_SYSTEM_CONFIG_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(1);
    expect(runtime.gSTWIStatus.txPacket.bytes.slice(4, 8)).toEqual([0x78, 0x56, 0x34, 0x12]);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_DataReadyAndChangeREQ(runtime, 0);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_DATA_READY_AND_CHANGE_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(0);
    runtime.gSTWIStatus.sending = 0;
    STWI_send_DataReadyAndChangeREQ(runtime, 9);
    expect(runtime.gSTWIStatus.reqLength).toBe(1);
    expect(runtime.gSTWIStatus.txPacket.bytes.slice(4, 8)).toEqual([9, 0, 0, 0]);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_DisconnectedAndChangeREQ(runtime, 0x12, 0x34);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_DISCONNECTED_AND_CHANGE_REQ);
    expect(runtime.gSTWIStatus.txPacket.bytes.slice(4, 8)).toEqual([0x12, 0x34, 0, 0]);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_DisconnectREQ(runtime, 0x7f);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_DISCONNECT_REQ);
    expect(runtime.gSTWIStatus.txPacket.data32[0]).toBe(0x7f);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_TestModeREQ(runtime, 0x12, 0x34);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_TEST_MODE_REQ);
    expect(runtime.gSTWIStatus.txPacket.data32[0]).toBe(0x3412);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_CP_StartREQ(runtime, 0xbeef);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_CP_START_REQ);
    expect(runtime.gSTWIStatus.txPacket.data32[0]).toBe(0xbeef);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_CPR_StartREQ(runtime, 0x1234, 0x5678, 0x9a);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_CPR_START_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(2);
    expect(runtime.gSTWIStatus.txPacket.data32.slice(0, 2)).toEqual([0x12345678, 0x9a]);
  });

  it('rounds data tx sizes up to u32 words and copies padded bytes into packet data', () => {
    const runtime = createStwiRuntime();

    STWI_send_DataTxREQ(runtime, [1, 2, 3, 4, 5], 5);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_DATA_TX_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(2);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_DATA_TX_REQ, 2));
    expect(runtime.gSTWIStatus.txPacket.bytes.slice(4, 12)).toEqual([1, 2, 3, 4, 5, 0, 0, 0]);
    expect(runtime.gSTWIStatus.txPacket.data32.slice(0, 2)).toEqual([0x04030201, 0x00000005]);

    runtime.gSTWIStatus.sending = 0;
    STWI_send_DataTxAndChangeREQ(runtime, [9, 8, 7, 6], 4);
    expect(runtime.gSTWIStatus.reqActiveCommand).toBe(ID_DATA_TX_AND_CHANGE_REQ);
    expect(runtime.gSTWIStatus.reqLength).toBe(1);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_DATA_TX_AND_CHANGE_REQ, 1));
    expect(runtime.gSTWIStatus.txPacket.data32[0]).toBe(0x06070809);
  });

  it('sets, stops, interrupts, restarts, and resets timers with the same state transitions', () => {
    const runtime = createStwiRuntime();
    STWI_init_timer(runtime, 1);

    STWI_set_timer(runtime, 80);
    expect(runtime.gSTWIStatus.timerState).toBe(2);
    expect(runtime.timersL[1]).toBe(0xfae0);
    expect(runtime.timersH[1]).toBe(TIMER_ENABLE | TIMER_INTR_ENABLE | TIMER_1024CLK);
    expect(runtime.REG_IF).toBe(INTR_FLAG_TIMER0 << 1);

    STWI_intr_timer(runtime);
    expect(runtime.gSTWIStatus.timerActive).toBe(1);
    expect(runtime.gSTWIStatus.timerState).toBe(1);
    expect(runtime.timersL[1]).toBe(0xfccb);

    runtime.gSTWIStatus.reqActiveCommand = ID_RESET_REQ;
    runtime.gSTWIStatus.reqLength = 0;
    runtime.gSTWIStatus.recoveryCount = 0;
    STWI_intr_timer(runtime);
    expect(runtime.gSTWIStatus.recoveryCount).toBe(1);
    expect(runtime.gSTWIStatus.reqNext).toBe(1);

    STWI_set_timer(runtime, 100);
    const callbacks: string[] = [];
    STWI_set_Callback_M(runtime, (request, error) => callbacks.push(`${request}:${error}`));
    STWI_intr_timer(runtime);
    expect(runtime.gSTWIStatus.state).toBe(5);
    expect(runtime.gSTWIStatus.reqLength).toBe(0);
    expect(runtime.gSTWIStatus.reqNext).toBe(0);
    expect(runtime.REG_SIODATA32 >>> 0).toBe(0x80000000);
    expect(runtime.REG_SIOCNT).toBe(baseSio + 0x7f);
    expect(callbacks.at(-1)).toBe(`${ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ}:0`);

    STWI_set_timer(runtime, 130);
    expect(runtime.gSTWIStatus.timerState).toBe(4);
    expect(runtime.timersL[1]).toBe(0xf7ad);
    STWI_stop_timer(runtime);
    expect(runtime.gSTWIStatus.timerState).toBe(0);
    expect(runtime.timersL[1]).toBe(0);
    expect(runtime.timersH[1]).toBe(0);
  });

  it('applies restart recovery count, drift error branches, clock reset, and soft reset cleanup', () => {
    const runtime = createStwiRuntime();
    const callbacks: string[] = [];
    STWI_set_Callback_M(runtime, (request, error) => callbacks.push(`${request}:${error}`));

    runtime.gSTWIStatus.reqActiveCommand = ID_RESET_REQ;
    runtime.gSTWIStatus.reqLength = 0;
    runtime.gSTWIStatus.recoveryCount = 2;
    runtime.gSTWIStatus.sending = 1;
    STWI_restart_Command(runtime);
    expect(runtime.gSTWIStatus.error).toBe(ERR_REQ_CMD_CLOCK_DRIFT);
    expect(runtime.gSTWIStatus.sending).toBe(0);
    expect(runtime.gSTWIStatus.state).toBe(4);
    expect(callbacks.at(-1)).toBe(`${ID_RESET_REQ}:${ERR_REQ_CMD_CLOCK_DRIFT}`);

    runtime.gSTWIStatus.reqActiveCommand = ID_MS_CHANGE_REQ;
    runtime.gSTWIStatus.recoveryCount = 2;
    runtime.gSTWIStatus.state = 0;
    STWI_restart_Command(runtime);
    expect(runtime.gSTWIStatus.state).toBe(0);

    runtime.gSTWIStatus.reqActiveCommand = ID_RESUME_RETRANSMIT_AND_CHANGE_REQ;
    runtime.gSTWIStatus.recoveryCount = 2;
    runtime.gSTWIStatus.state = 0;
    STWI_restart_Command(runtime);
    expect(runtime.gSTWIStatus.state).toBe(0);

    STWI_reset_ClockCounter(runtime);
    expect(runtime.gSTWIStatus.state).toBe(5);
    expect(runtime.REG_SIODATA32 >>> 0).toBe(0x80000000);

    runtime.gSTWIStatus.timerSelect = 0;
    runtime.gSTWIStatus.reqActiveCommand = 99;
    runtime.gSTWIStatus.sending = 1;
    runtime.gSTWIStatus.error = 5;
    runtime.gSTWIStatus.msMode = AGB_CLK_SLAVE;
    AgbRFU_SoftReset(runtime);
    expect(runtime.REG_RCNT).toBe(0x80a0);
    expect(runtime.REG_SIOCNT).toBe(baseSio);
    expect(runtime.gSTWIStatus).toMatchObject({
      state: 0,
      reqLength: 0,
      reqNext: 0,
      reqActiveCommand: 0,
      ackLength: 0,
      ackNext: 0,
      ackActiveCommand: 0,
      timerState: 0,
      timerActive: 0,
      error: 0,
      msMode: AGB_CLK_MASTER,
      recoveryCount: 0,
      sending: 0,
    });
  });

  it('allows direct STWI_start_Command after manual length setup like the C static helper', () => {
    const runtime = createStwiRuntime();
    runtime.gSTWIStatus.reqActiveCommand = ID_SYSTEM_CONFIG_REQ;
    runtime.gSTWIStatus.reqLength = 3;
    STWI_start_Command(runtime);
    expect(runtime.gSTWIStatus.txPacket.command).toBe(commandWord(ID_SYSTEM_CONFIG_REQ, 3));
  });
});
