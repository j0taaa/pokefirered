export const ID_RESET_REQ = 0x10;
export const LIBRFU_STWI_C_TRANSLATION_UNIT = 'src/librfu_stwi.c';
export const ID_LINK_STATUS_REQ = 0x11;
export const ID_VERSION_STATUS_REQ = 0x12;
export const ID_SYSTEM_STATUS_REQ = 0x13;
export const ID_SLOT_STATUS_REQ = 0x14;
export const ID_CONFIG_STATUS_REQ = 0x15;
export const ID_GAME_CONFIG_REQ = 0x16;
export const ID_SYSTEM_CONFIG_REQ = 0x17;
export const ID_SC_START_REQ = 0x19;
export const ID_SC_POLL_REQ = 0x1a;
export const ID_SC_END_REQ = 0x1b;
export const ID_SP_START_REQ = 0x1c;
export const ID_SP_POLL_REQ = 0x1d;
export const ID_SP_END_REQ = 0x1e;
export const ID_CP_START_REQ = 0x1f;
export const ID_CP_POLL_REQ = 0x20;
export const ID_CP_END_REQ = 0x21;
export const ID_DATA_TX_REQ = 0x24;
export const ID_DATA_TX_AND_CHANGE_REQ = 0x25;
export const ID_DATA_RX_REQ = 0x26;
export const ID_MS_CHANGE_REQ = 0x27;
export const ID_DATA_READY_AND_CHANGE_REQ = 0x28;
export const ID_DISCONNECTED_AND_CHANGE_REQ = 0x29;
export const ID_DISCONNECT_REQ = 0x30;
export const ID_TEST_MODE_REQ = 0x31;
export const ID_CPR_START_REQ = 0x32;
export const ID_CPR_POLL_REQ = 0x33;
export const ID_CPR_END_REQ = 0x34;
export const ID_UNK35_REQ = 0x35;
export const ID_RESUME_RETRANSMIT_AND_CHANGE_REQ = 0x37;
export const ID_STOP_MODE_REQ = 0x3d;
export const ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ = 0xff;

export const AGB_CLK_SLAVE = 0;
export const AGB_CLK_MASTER = 1;
export const ERR_REQ_CMD_CLOCK_DRIFT = 0x0001;
export const ERR_REQ_CMD_SENDING = 0x0002;
export const ERR_REQ_CMD_CLOCK_SLAVE = 0x0004;
export const ERR_REQ_CMD_IME_DISABLE = 0x0006;

export const SIO_32BIT_MODE = 0x1000;
export const SIO_115200_BPS = 0x0003;
export const SIO_MULTI_BUSY = 0x0080;
export const SIO_INTR_ENABLE = 0x4000;
export const TIMER_1024CLK = 0x03;
export const TIMER_INTR_ENABLE = 0x40;
export const TIMER_ENABLE = 0x80;
export const INTR_FLAG_TIMER0 = 1 << 3;
export const INTR_FLAG_SERIAL = 1 << 7;

export type StwiCallbackM = (request: number, error: number, status?: STWIStatus) => void;
export type StwiCallbackS = (value: number) => void;
export type StwiCallbackID = () => void;

export type RfuPacket = {
  bytes: number[];
  command: number;
  data32: number[];
};

export type STWIStatus = {
  state: number;
  reqLength: number;
  reqNext: number;
  reqActiveCommand: number;
  ackLength: number;
  ackNext: number;
  ackActiveCommand: number;
  timerSelect: number;
  timerState: number;
  timerActive: number;
  error: number;
  msMode: number;
  recoveryCount: number;
  callbackM: StwiCallbackM | null;
  callbackS: StwiCallbackS | null;
  callbackID: StwiCallbackID | null;
  txPacket: RfuPacket;
  rxPacket: RfuPacket;
  sending: number;
};

export type RfuIntrStruct = {
  rxPacketAlloc: RfuPacket;
  txPacketAlloc: RfuPacket;
  block1Status: STWIStatus;
  block2: STWIStatus;
};

export type StwiRuntime = {
  gSTWIStatus: STWIStatus;
  interrupt: unknown;
  REG_RCNT: number;
  REG_SIOCNT: number;
  REG_SIODATA32: number;
  REG_IME: number;
  REG_IE: number;
  REG_IF: number;
  timersL: number[];
  timersH: number[];
  operations: string[];
  callbackLog: string[];
};

const emptyPacket = (): RfuPacket => ({ bytes: Array(0x74).fill(0), command: 0, data32: Array(0x1c).fill(0) });

const emptyStatus = (): STWIStatus => ({
  state: 0,
  reqLength: 0,
  reqNext: 0,
  reqActiveCommand: 0,
  ackLength: 0,
  ackNext: 0,
  ackActiveCommand: 0,
  timerSelect: 0,
  timerState: 0,
  timerActive: 0,
  error: 0,
  msMode: AGB_CLK_MASTER,
  recoveryCount: 0,
  callbackM: null,
  callbackS: null,
  callbackID: null,
  txPacket: emptyPacket(),
  rxPacket: emptyPacket(),
  sending: 0,
});

export const createRfuIntrStruct = (): RfuIntrStruct => ({
  rxPacketAlloc: emptyPacket(),
  txPacketAlloc: emptyPacket(),
  block1Status: emptyStatus(),
  block2: emptyStatus(),
});

export const createStwiRuntime = (): StwiRuntime => ({
  gSTWIStatus: emptyStatus(),
  interrupt: null,
  REG_RCNT: 0,
  REG_SIOCNT: 0,
  REG_SIODATA32: 0,
  REG_IME: 1,
  REG_IE: 0,
  REG_IF: 0,
  timersL: Array(4).fill(0),
  timersH: Array(4).fill(0),
  operations: [],
  callbackLog: [],
});

const u8 = (value: number): number => value & 0xff;
const u32 = (value: number): number => value >>> 0;

const setByte = (packet: RfuPacket, offset: number, value: number): void => {
  packet.bytes[offset] = u8(value);
};

const setU16LE = (packet: RfuPacket, offset: number, value: number): void => {
  packet.bytes[offset] = value & 0xff;
  packet.bytes[offset + 1] = (value >>> 8) & 0xff;
};

const setU32LE = (packet: RfuPacket, offset: number, value: number): void => {
  const word = u32(value);
  packet.bytes[offset] = word & 0xff;
  packet.bytes[offset + 1] = (word >>> 8) & 0xff;
  packet.bytes[offset + 2] = (word >>> 16) & 0xff;
  packet.bytes[offset + 3] = (word >>> 24) & 0xff;
  if (offset === 0) packet.command = word;
  else if (offset >= 4 && (offset - 4) % 4 === 0) packet.data32[(offset - 4) / 4] = word;
};

const setData32 = (packet: RfuPacket, index: number, value: number): void => setU32LE(packet, 4 + index * 4, value);

const copyBytesToData32 = (packet: RfuPacket, input: readonly number[], size: number): void => {
  for (let i = 0; i < size; i += 1) setByte(packet, 4 + i, input[i] ?? 0);
  for (let i = 0; i < Math.ceil(size / 4); i += 1) {
    packet.data32[i] = u32((packet.bytes[4 + i * 4] ?? 0) | ((packet.bytes[5 + i * 4] ?? 0) << 8) | ((packet.bytes[6 + i * 4] ?? 0) << 16) | ((packet.bytes[7 + i * 4] ?? 0) << 24));
  }
};

const baseSio = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_115200_BPS;

export const STWI_init_all = (runtime: StwiRuntime, interruptStruct: RfuIntrStruct, copyInterruptToRam: boolean): void => {
  if (copyInterruptToRam === true) {
    runtime.interrupt = 'block1';
    runtime.operations.push('DmaCopy16:IntrSIO32:block1');
    runtime.gSTWIStatus = interruptStruct.block2;
  } else {
    runtime.interrupt = 'IntrSIO32';
    runtime.gSTWIStatus = interruptStruct.block1Status;
  }
  const status = runtime.gSTWIStatus;
  status.rxPacket = interruptStruct.rxPacketAlloc;
  status.txPacket = interruptStruct.txPacketAlloc;
  status.msMode = AGB_CLK_MASTER;
  status.state = 0;
  status.reqLength = 0;
  status.reqNext = 0;
  status.ackLength = 0;
  status.ackNext = 0;
  status.ackActiveCommand = 0;
  status.timerState = 0;
  status.timerActive = 0;
  status.error = 0;
  status.recoveryCount = 0;
  status.sending = 0;
  runtime.REG_RCNT = 0x100;
  runtime.REG_SIOCNT = baseSio;
  STWI_init_Callback_M(runtime);
  STWI_init_Callback_S(runtime);
  runtime.operations.push(`IntrEnable:${INTR_FLAG_SERIAL}`);
};

export const STWI_init_timer = (runtime: StwiRuntime, timerSelect: number): void => {
  runtime.interrupt = 'STWI_intr_timer';
  runtime.gSTWIStatus.timerSelect = timerSelect;
  runtime.operations.push(`IntrEnable:${INTR_FLAG_TIMER0 << runtime.gSTWIStatus.timerSelect}`);
};

export const AgbRFU_SoftReset = (runtime: StwiRuntime): void => {
  const status = runtime.gSTWIStatus;
  runtime.REG_RCNT = 0x8000;
  runtime.REG_RCNT = 0x80a0;
  runtime.timersH[status.timerSelect] = 0;
  runtime.timersL[status.timerSelect] = 0;
  runtime.timersH[status.timerSelect] = TIMER_ENABLE | TIMER_1024CLK;
  while (runtime.timersL[status.timerSelect] <= 0x11) {
    runtime.REG_RCNT = 0x80a2;
    runtime.timersL[status.timerSelect] += 1;
  }
  runtime.timersH[status.timerSelect] = 3;
  runtime.REG_RCNT = 0x80a0;
  runtime.REG_SIOCNT = baseSio;
  status.state = 0;
  status.reqLength = 0;
  status.reqNext = 0;
  status.reqActiveCommand = 0;
  status.ackLength = 0;
  status.ackNext = 0;
  status.ackActiveCommand = 0;
  status.timerState = 0;
  status.timerActive = 0;
  status.error = 0;
  status.msMode = AGB_CLK_MASTER;
  status.recoveryCount = 0;
  status.sending = 0;
};

export const STWI_set_MS_mode = (runtime: StwiRuntime, mode: number): void => { runtime.gSTWIStatus.msMode = mode; };

export const STWI_read_status = (runtime: StwiRuntime, index: number): number => {
  switch (index) {
    case 0: return runtime.gSTWIStatus.error;
    case 1: return runtime.gSTWIStatus.msMode;
    case 2: return runtime.gSTWIStatus.state;
    case 3: return runtime.gSTWIStatus.reqActiveCommand;
    default: return 0xffff;
  }
};

export const STWI_init_Callback_M = (runtime: StwiRuntime): void => { STWI_set_Callback_M(runtime, null); };
export const STWI_init_Callback_S = (runtime: StwiRuntime): void => { STWI_set_Callback_S(runtime, null); };
export const STWI_set_Callback_M = (runtime: StwiRuntime, callbackM: StwiCallbackM | null): void => { runtime.gSTWIStatus.callbackM = callbackM; };
export const STWI_set_Callback_S = (runtime: StwiRuntime, callbackS: StwiCallbackS | null): void => { runtime.gSTWIStatus.callbackS = callbackS; };
export const STWI_set_Callback_ID = (runtime: StwiRuntime, func: StwiCallbackID | null): void => { runtime.gSTWIStatus.callbackID = func; };

export const STWI_poll_CommandEnd = (runtime: StwiRuntime): number => runtime.gSTWIStatus.error;

export const STWI_init = (runtime: StwiRuntime, request: number): number => {
  const status = runtime.gSTWIStatus;
  if (!runtime.REG_IME) {
    status.error = ERR_REQ_CMD_IME_DISABLE;
    status.callbackM?.(request, status.error);
    return 1;
  }
  if (status.sending === 1) {
    status.error = ERR_REQ_CMD_SENDING;
    status.sending = 0;
    status.callbackM?.(request, status.error);
    return 1;
  }
  if (status.msMode === AGB_CLK_SLAVE) {
    status.error = ERR_REQ_CMD_CLOCK_SLAVE;
    status.callbackM?.(request, status.error, status);
    return 1;
  }
  status.sending = 1;
  status.reqActiveCommand = request;
  status.state = 0;
  status.reqLength = 0;
  status.reqNext = 0;
  status.ackLength = 0;
  status.ackNext = 0;
  status.ackActiveCommand = 0;
  status.timerState = 0;
  status.timerActive = 0;
  status.error = 0;
  status.recoveryCount = 0;
  runtime.REG_RCNT = 0x100;
  runtime.REG_SIOCNT = baseSio;
  return 0;
};

export const STWI_start_Command = (runtime: StwiRuntime): number => {
  const status = runtime.gSTWIStatus;
  setU32LE(status.txPacket, 0, u32(0x99660000 | (status.reqLength << 8) | status.reqActiveCommand));
  runtime.REG_SIODATA32 = status.txPacket.command;
  status.state = 0;
  status.reqNext = 1;
  const imeTemp = runtime.REG_IME;
  runtime.REG_IME = 0;
  runtime.REG_IE |= INTR_FLAG_TIMER0 << status.timerSelect;
  runtime.REG_IE |= INTR_FLAG_SERIAL;
  runtime.REG_IME = imeTemp;
  runtime.REG_SIOCNT = SIO_INTR_ENABLE | SIO_32BIT_MODE | SIO_MULTI_BUSY | SIO_115200_BPS;
  runtime.operations.push(`STWI_start_Command:${status.reqActiveCommand}:${status.reqLength}:${status.txPacket.command}`);
  return 0;
};

const sendNoPayload = (runtime: StwiRuntime, id: number): void => {
  if (!STWI_init(runtime, id)) {
    runtime.gSTWIStatus.reqLength = 0;
    STWI_start_Command(runtime);
  }
};

export const STWI_send_ResetREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_RESET_REQ);
export const STWI_send_LinkStatusREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_LINK_STATUS_REQ);
export const STWI_send_VersionStatusREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_VERSION_STATUS_REQ);
export const STWI_send_SystemStatusREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SYSTEM_STATUS_REQ);
export const STWI_send_SlotStatusREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SLOT_STATUS_REQ);
export const STWI_send_ConfigStatusREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_CONFIG_STATUS_REQ);
export const STWI_send_SC_StartREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SC_START_REQ);
export const STWI_send_SC_PollingREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SC_POLL_REQ);
export const STWI_send_SC_EndREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SC_END_REQ);
export const STWI_send_SP_StartREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SP_START_REQ);
export const STWI_send_SP_PollingREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SP_POLL_REQ);
export const STWI_send_SP_EndREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_SP_END_REQ);
export const STWI_send_CP_PollingREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_CP_POLL_REQ);
export const STWI_send_CP_EndREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_CP_END_REQ);
export const STWI_send_DataRxREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_DATA_RX_REQ);
export const STWI_send_MS_ChangeREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_MS_CHANGE_REQ);
export const STWI_send_ResumeRetransmitAndChangeREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_RESUME_RETRANSMIT_AND_CHANGE_REQ);
export const STWI_send_CPR_PollingREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_CPR_POLL_REQ);
export const STWI_send_CPR_EndREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_CPR_END_REQ);
export const STWI_send_StopModeREQ = (runtime: StwiRuntime): void => sendNoPayload(runtime, ID_STOP_MODE_REQ);

export const STWI_send_GameConfigREQ = (runtime: StwiRuntime, serialGname: readonly number[], uname: readonly number[]): void => {
  if (!STWI_init(runtime, ID_GAME_CONFIG_REQ)) {
    const packet = runtime.gSTWIStatus.txPacket;
    runtime.gSTWIStatus.reqLength = 6;
    setU16LE(packet, 4, (serialGname[0] ?? 0) | ((serialGname[1] ?? 0) << 8));
    for (let i = 0; i < 14; i += 1) setByte(packet, 6 + i, serialGname[2 + i] ?? 0);
    for (let i = 0; i < 8; i += 1) setByte(packet, 20 + i, uname[i] ?? 0);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_SystemConfigREQ = (runtime: StwiRuntime, availSlotFlag: number, maxMFrame: number, mcTimer: number): void => {
  if (!STWI_init(runtime, ID_SYSTEM_CONFIG_REQ)) {
    const packet = runtime.gSTWIStatus.txPacket;
    runtime.gSTWIStatus.reqLength = 1;
    setByte(packet, 4, mcTimer);
    setByte(packet, 5, maxMFrame);
    setU16LE(packet, 6, availSlotFlag);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_CP_StartREQ = (runtime: StwiRuntime, unk1: number): void => {
  if (!STWI_init(runtime, ID_CP_START_REQ)) {
    runtime.gSTWIStatus.reqLength = 1;
    setData32(runtime.gSTWIStatus.txPacket, 0, unk1);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_DataTxREQ = (runtime: StwiRuntime, input: readonly number[], size: number): void => {
  if (!STWI_init(runtime, ID_DATA_TX_REQ)) {
    let reqLength = Math.trunc(size / 4);
    if (size & 3) reqLength += 1;
    runtime.gSTWIStatus.reqLength = reqLength;
    copyBytesToData32(runtime.gSTWIStatus.txPacket, input, reqLength * 4);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_DataTxAndChangeREQ = (runtime: StwiRuntime, input: readonly number[], size: number): void => {
  if (!STWI_init(runtime, ID_DATA_TX_AND_CHANGE_REQ)) {
    let reqLength = Math.trunc(size / 4);
    if (size & 3) reqLength += 1;
    runtime.gSTWIStatus.reqLength = reqLength;
    copyBytesToData32(runtime.gSTWIStatus.txPacket, input, reqLength * 4);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_DataReadyAndChangeREQ = (runtime: StwiRuntime, unk: number): void => {
  if (!STWI_init(runtime, ID_DATA_READY_AND_CHANGE_REQ)) {
    if (!unk) runtime.gSTWIStatus.reqLength = 0;
    else {
      runtime.gSTWIStatus.reqLength = 1;
      setByte(runtime.gSTWIStatus.txPacket, 4, unk);
      setByte(runtime.gSTWIStatus.txPacket, 5, 0);
      setByte(runtime.gSTWIStatus.txPacket, 6, 0);
      setByte(runtime.gSTWIStatus.txPacket, 7, 0);
    }
    STWI_start_Command(runtime);
  }
};

export const STWI_send_DisconnectedAndChangeREQ = (runtime: StwiRuntime, unk0: number, unk1: number): void => {
  if (!STWI_init(runtime, ID_DISCONNECTED_AND_CHANGE_REQ)) {
    runtime.gSTWIStatus.reqLength = 1;
    setByte(runtime.gSTWIStatus.txPacket, 4, unk0);
    setByte(runtime.gSTWIStatus.txPacket, 5, unk1);
    setByte(runtime.gSTWIStatus.txPacket, 6, 0);
    setByte(runtime.gSTWIStatus.txPacket, 7, 0);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_DisconnectREQ = (runtime: StwiRuntime, unk: number): void => {
  if (!STWI_init(runtime, ID_DISCONNECT_REQ)) {
    runtime.gSTWIStatus.reqLength = 1;
    setData32(runtime.gSTWIStatus.txPacket, 0, unk);
    STWI_start_Command(runtime);
  }
};

export const STWI_send_TestModeREQ = (runtime: StwiRuntime, unk0: number, unk1: number): void => {
  if (!STWI_init(runtime, ID_TEST_MODE_REQ)) {
    runtime.gSTWIStatus.reqLength = 1;
    setData32(runtime.gSTWIStatus.txPacket, 0, unk0 | (unk1 << 8));
    STWI_start_Command(runtime);
  }
};

export const STWI_send_CPR_StartREQ = (runtime: StwiRuntime, unk0: number, unk1: number, unk2: number): void => {
  if (!STWI_init(runtime, ID_CPR_START_REQ)) {
    runtime.gSTWIStatus.reqLength = 2;
    setData32(runtime.gSTWIStatus.txPacket, 0, u32(unk1 | (unk0 << 16)));
    setData32(runtime.gSTWIStatus.txPacket, 1, unk2);
    STWI_start_Command(runtime);
  }
};

export const STWI_set_timer = (runtime: StwiRuntime, count: number): void => {
  const status = runtime.gSTWIStatus;
  runtime.REG_IME = 0;
  switch (count) {
    case 50:
      runtime.timersL[status.timerSelect] = 0xfccb; status.timerState = 1; break;
    case 80:
      runtime.timersL[status.timerSelect] = 0xfae0; status.timerState = 2; break;
    case 100:
      runtime.timersL[status.timerSelect] = 0xf996; status.timerState = 3; break;
    case 130:
      runtime.timersL[status.timerSelect] = 0xf7ad; status.timerState = 4; break;
  }
  runtime.timersH[status.timerSelect] = TIMER_ENABLE | TIMER_INTR_ENABLE | TIMER_1024CLK;
  runtime.REG_IF = INTR_FLAG_TIMER0 << status.timerSelect;
  runtime.REG_IME = 1;
};

export const STWI_stop_timer = (runtime: StwiRuntime): void => {
  const status = runtime.gSTWIStatus;
  status.timerState = 0;
  runtime.timersL[status.timerSelect] = 0;
  runtime.timersH[status.timerSelect] = 0;
};

export const STWI_restart_Command = (runtime: StwiRuntime): number => {
  const status = runtime.gSTWIStatus;
  if (status.recoveryCount < 2) {
    status.recoveryCount += 1;
    STWI_start_Command(runtime);
  } else {
    status.error = ERR_REQ_CMD_CLOCK_DRIFT;
    status.sending = 0;
    status.callbackM?.(status.reqActiveCommand, status.error);
    if (![ID_MS_CHANGE_REQ, ID_DATA_TX_AND_CHANGE_REQ, ID_UNK35_REQ, ID_RESUME_RETRANSMIT_AND_CHANGE_REQ].includes(status.reqActiveCommand)) status.state = 4;
  }
  return 0;
};

export const STWI_reset_ClockCounter = (runtime: StwiRuntime): number => {
  const status = runtime.gSTWIStatus;
  status.state = 5;
  status.reqLength = 0;
  status.reqNext = 0;
  runtime.REG_SIODATA32 = 1 << 31;
  runtime.REG_SIOCNT = 0;
  runtime.REG_SIOCNT = baseSio;
  runtime.REG_SIOCNT = baseSio + 0x7f;
  return 0;
};

export const STWI_intr_timer = (runtime: StwiRuntime): void => {
  const status = runtime.gSTWIStatus;
  switch (status.timerState) {
    case 2:
      status.timerActive = 1;
      STWI_set_timer(runtime, 50);
      break;
    case 1:
    case 4:
      STWI_stop_timer(runtime);
      STWI_restart_Command(runtime);
      break;
    case 3:
      status.timerActive = 1;
      STWI_stop_timer(runtime);
      STWI_reset_ClockCounter(runtime);
      status.callbackM?.(ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ, 0);
      break;
  }
};
