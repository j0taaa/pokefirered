export const RFU_CHILD_MAX = 4;
export const WINDOW_COUNT = 4;
export const MODE_NEUTRAL = 0;
export const MODE_CHILD = 1;
export const MODE_PARENT = 2;
export const TYPE_UNI_SEND = 0x10;
export const TYPE_UNI_RECV = 0x01;
export const TYPE_NI_SEND = 0x20;
export const TYPE_NI_RECV = 0x02;
export const TYPE_UNI = TYPE_UNI_SEND | TYPE_UNI_RECV;
export const TYPE_NI = TYPE_NI_SEND | TYPE_NI_RECV;
export const AVAIL_SLOT1 = 1;
export const AGB_CLK_MASTER = 0;
export const AGB_CLK_SLAVE = 1;
export const RFU_ID = 0x8000;
export const LLF_P_SIZE = 0xff;
export const SLOT_BUSY_FLAG = 0x80;
export const SLOT_SEND_FLAG = 0x20;
export const SLOT_RECV_FLAG = 0x40;
export const SLOT_STATE_SEND_START = SLOT_BUSY_FLAG | SLOT_SEND_FLAG | 1;
export const SLOT_STATE_SENDING = SLOT_BUSY_FLAG | SLOT_SEND_FLAG | 2;
export const SLOT_STATE_SEND_LAST = SLOT_BUSY_FLAG | SLOT_SEND_FLAG | 3;
export const SLOT_STATE_SEND_NULL = SLOT_BUSY_FLAG | SLOT_SEND_FLAG | 4;
export const SLOT_STATE_SEND_SUCCESS = 5;
export const SLOT_STATE_SEND_FAILED = 6;
export const SLOT_STATE_SEND_UNI = 0x10;
export const SLOT_STATE_RECV_START = SLOT_BUSY_FLAG | SLOT_RECV_FLAG | 1;
export const SLOT_STATE_RECEIVING = SLOT_BUSY_FLAG | SLOT_RECV_FLAG | 2;
export const SLOT_STATE_RECV_LAST = SLOT_BUSY_FLAG | SLOT_RECV_FLAG | 3;
export const SLOT_STATE_RECV_SUCCESS = 4;
export const SLOT_STATE_RECV_FAILED = 5;
export const SLOT_STATE_RECV_IGNORE = 6;
export const SLOT_STATE_RECV_SUCCESS_AND_SENDSIDE_UNKNOWN = 7;
export const LCOM_UNI = SLOT_STATE_SEND_UNI & 0xf;
export const LCOM_NI_START = SLOT_STATE_SEND_START & 0xf;
export const LCOM_NI = SLOT_STATE_SENDING & 0xf;
export const LCOM_NI_END = SLOT_STATE_SEND_LAST & 0xf;
export const ERR_RFU_API_BUFF_ADR = 1;
export const ERR_RFU_API_BUFF_SIZE = 2;
export const ERR_MODE_NOT_PARENT = 3;
export const ERR_REQ_CMD_ID = 4;
export const ERR_REQ_CMD_IME_DISABLE = 6;
export const ERR_ID_CHECK_IME_DISABLE = 7;
export const ERR_PID_NOT_FOUND = 8;
export const ERR_MODE_NOT_CONNECTED = 9;
export const ERR_SLOT_NO = 10;
export const ERR_SLOT_NOT_CONNECTED = 11;
export const ERR_SLOT_BUSY = 12;
export const ERR_SUBFRAME_SIZE = 13;
export const ERR_COMM_TYPE = 14;
export const ERR_SLOT_TARGET = 15;
export const ERR_SLOT_NOT_SENDING = 16;
export const ERR_RECV_BUFF_OVER = 17;
export const ERR_RECV_UNK = 18;
export const ERR_RECV_DATA_OVERWRITED = 19;
export const ERR_RECV_REPLY_SUBFRAME_SIZE = 20;
export const ERR_DATA_RECV = 0x100;
export const REASON_DISCONNECTED = 0;
export const REASON_LINK_LOSS = 1;
export const ID_STOP_MODE_REQ = 0x30;
export const ID_SC_START_REQ = 0x10;
export const ID_SC_POLL_REQ = 0x11;
export const ID_SC_END_REQ = 0x12;
export const ID_SP_POLL_REQ = 0x21;
export const ID_CP_START_REQ = 0x20;
export const ID_CP_POLL_REQ = 0x21;
export const ID_CP_END_REQ = 0x22;
export const ID_MS_CHANGE_REQ = 0x27;
export const ID_DATA_TX_REQ = 0x24;
export const ID_DATA_RX_REQ = 0x25;
export const ID_LINK_STATUS_REQ = 0x26;
export const ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ = 0xee;
export const ID_DISCONNECTED_AND_CHANGE_REQ = 0x28;
export const ID_RESUME_RETRANSMIT_AND_CHANGE_REQ = 0x36;
export const ID_DATA_TX_AND_CHANGE_REQ = 0x37;
export const RFU_API_BUFF_SIZE_RAM = 0x1000;
export const RFU_API_BUFF_SIZE_ROM = 0x800;

export interface RfuTgtData {
  id: number;
  slot: number;
  serialNo: number;
  mbootFlag: number;
  gname: number[];
  uname: number[];
}

export interface NIComm {
  state: number;
  errorCode: number;
  now_p: number[];
  remainSize: number;
  bmSlotOrg: number;
  bmSlot: number;
  payloadSize: number;
  dataType: number;
  dataSize: number;
  src: number[];
  ack: number;
  phase: number;
  recvAckFlag: number[];
  n: number[];
  failCounter: number;
}

export interface UNISend {
  state: number;
  bmSlot: number;
  src: number[];
  payloadSize: number;
  dataReadyFlag: number;
}

export interface UNIRecv {
  state: number;
  errorCode: number;
  dataBlockFlag: number;
  newDataFlag: number;
  dataSize: number;
}

export interface RfuSlotStatusNI {
  send: NIComm;
  recv: NIComm;
  recvBuffer: number[] | null;
  recvBufferSize: number;
}

export interface RfuSlotStatusUNI {
  send: UNISend;
  recv: UNIRecv;
  recvBuffer: number[] | null;
  recvBufferSize: number;
}

export interface RfuLinkStatus {
  watchInterval: number;
  parentChild: number;
  my: RfuTgtData;
  partner: RfuTgtData[];
  strength: number[];
  connCount: number;
  connSlotFlag: number;
  linkLossSlotFlag: number;
  getNameFlag: number;
  findParentCount: number;
  remainLLFrameSizeChild: number[];
  remainLLFrameSizeParent: number;
  sendSlotNIFlag: number;
  recvSlotNIFlag: number;
  sendSlotUNIFlag: number;
  LLFReadyFlag: number;
}

export interface RfuStatic {
  flags: number;
  reqResult: number;
  nowWatchInterval: number;
  SCStartFlag: number;
  cidBak: number[];
  linkEmergencyLimit: number;
  lsFixedCount: number[];
  tryPid: number;
  linkEmergencyFlag: number[];
  recoveryBmSlot: number;
  recvRenewalFlag: number;
  totalPacketSize: number;
  commExistFlag: number;
  emberCount: number;
  nullFrameCount: number;
  NIEndRecvFlag: number;
  recvErrorFlag: number;
  watchdogTimer: number;
}

export interface RfuFixed {
  STWIBuffer: { data: number[]; command: number };
  LLFBuffer: number[];
  reqCallback: ((reqCommand: number, reqResult: number) => void) | null;
}

export interface LibrfuRfuRuntime {
  gRfuLinkStatus: RfuLinkStatus;
  gRfuStatic: RfuStatic;
  gRfuFixed: RfuFixed;
  gRfuSlotStatusNI: RfuSlotStatusNI[];
  gRfuSlotStatusUNI: RfuSlotStatusUNI[];
  operations: string[];
  lastCallbackM: string;
  callbackS: ((reqCommandId: number) => void) | null;
  masterSlave: number;
  ime: number;
  sending: boolean;
  reqActiveCommand: number;
  msMode: number;
  softResetId: number;
  pollCommandEndResult: number;
}

const makeTarget = (): RfuTgtData => ({ id: 0, slot: 0, serialNo: 0, mbootFlag: 0, gname: Array.from({ length: 13 }, () => 0), uname: Array.from({ length: 8 }, () => 0) });
const makeNIComm = (): NIComm => ({ state: 0, errorCode: 0, now_p: [0, 0, 0, 0], remainSize: 0, bmSlotOrg: 0, bmSlot: 0, payloadSize: 0, dataType: 0, dataSize: 0, src: [], ack: 0, phase: 0, recvAckFlag: [0, 0, 0, 0], n: [0, 0, 0, 0], failCounter: 0 });
const makeSlotNI = (): RfuSlotStatusNI => ({ send: makeNIComm(), recv: makeNIComm(), recvBuffer: null, recvBufferSize: 0 });
const makeSlotUNI = (): RfuSlotStatusUNI => ({ send: { state: 0, bmSlot: 0, src: [], payloadSize: 0, dataReadyFlag: 0 }, recv: { state: 0, errorCode: 0, dataBlockFlag: 0, newDataFlag: 0, dataSize: 0 }, recvBuffer: null, recvBufferSize: 0 });
const makeLinkStatus = (): RfuLinkStatus => ({ watchInterval: 4, parentChild: MODE_NEUTRAL, my: makeTarget(), partner: Array.from({ length: RFU_CHILD_MAX }, () => makeTarget()), strength: [0, 0, 0, 0], connCount: 0, connSlotFlag: 0, linkLossSlotFlag: 0, getNameFlag: 0, findParentCount: 0, remainLLFrameSizeChild: [16, 16, 16, 16], remainLLFrameSizeParent: LLF_P_SIZE, sendSlotNIFlag: 0, recvSlotNIFlag: 0, sendSlotUNIFlag: 0, LLFReadyFlag: 0 });
const makeStatic = (): RfuStatic => ({ flags: 0, reqResult: 0, nowWatchInterval: 0, SCStartFlag: 0, cidBak: [0, 0, 0, 0], linkEmergencyLimit: 1, lsFixedCount: [0, 0, 0, 0], tryPid: 0, linkEmergencyFlag: [0, 0, 0, 0], recoveryBmSlot: 0, recvRenewalFlag: 0, totalPacketSize: 0, commExistFlag: 0, emberCount: 0, nullFrameCount: 0, NIEndRecvFlag: 0, recvErrorFlag: 0, watchdogTimer: 0 });
const frameSize = (runtime: LibrfuRfuRuntime): number => runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? 3 : 2;
let activeRuntime: LibrfuRfuRuntime | null = null;
const requireRuntime = (runtime?: LibrfuRfuRuntime): LibrfuRfuRuntime => {
  const resolved = runtime ?? activeRuntime;
  if (resolved === null) throw new Error('librfu runtime is not active');
  return resolved;
};

export const createLibrfuRfuRuntime = (): LibrfuRfuRuntime => {
  const runtime: LibrfuRfuRuntime = { gRfuLinkStatus: makeLinkStatus(), gRfuStatic: makeStatic(), gRfuFixed: { STWIBuffer: { data: Array.from({ length: 256 }, () => 0), command: 0 }, LLFBuffer: Array.from({ length: 512 }, () => 0), reqCallback: null }, gRfuSlotStatusNI: Array.from({ length: RFU_CHILD_MAX }, () => makeSlotNI()), gRfuSlotStatusUNI: Array.from({ length: RFU_CHILD_MAX }, () => makeSlotUNI()), operations: [], lastCallbackM: 'rfu_CB_defaultCallback', callbackS: null, masterSlave: AGB_CLK_MASTER, ime: 1, sending: false, reqActiveCommand: 0, msMode: 1, softResetId: RFU_ID, pollCommandEndResult: 0 };
  activeRuntime = runtime;
  return runtime;
};

const cb = (runtime: LibrfuRfuRuntime, name: string): void => { runtime.lastCallbackM = name; runtime.operations.push(`CB:${name}`); };
const stwi = (runtime: LibrfuRfuRuntime, op: string): void => { runtime.operations.push(op); };
const connectedMask = (runtime: LibrfuRfuRuntime): number => runtime.gRfuLinkStatus.connSlotFlag | runtime.gRfuLinkStatus.linkLossSlotFlag;

export function rfu_initializeAPI(_APIBuffer: unknown, buffByteSize: number, _sioIntrTable_p: unknown, copyInterruptToRam: boolean, runtime = requireRuntime()): number { if (buffByteSize < (copyInterruptToRam ? RFU_API_BUFF_SIZE_RAM : RFU_API_BUFF_SIZE_ROM)) return ERR_RFU_API_BUFF_SIZE; rfu_STC_clearAPIVariables(runtime); runtime.gRfuSlotStatusNI.forEach((s) => { s.recvBuffer = null; s.recvBufferSize = 0; }); runtime.gRfuSlotStatusUNI.forEach((s) => { s.recvBuffer = null; s.recvBufferSize = 0; }); runtime.operations.push('STWI_init_all'); return 0; }
export function rfu_STC_clearAPIVariables(runtime = requireRuntime()): void { const flags = runtime.gRfuStatic.flags; runtime.gRfuStatic = makeStatic(); runtime.gRfuStatic.flags = flags & 8; runtime.gRfuLinkStatus = makeLinkStatus(); rfu_clearAllSlot(runtime); runtime.gRfuStatic.SCStartFlag = 0; }
export function rfu_REQ_PARENT_resumeRetransmitAndChange(runtime = requireRuntime()): void { cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, 'ResumeRetransmitAndChangeREQ'); }
export function rfu_UNI_PARENT_getDRAC_ACK(ackFlag: { value: number }, runtime = requireRuntime()): number { ackFlag.value = 0; if (runtime.gRfuLinkStatus.parentChild !== MODE_PARENT) return ERR_MODE_NOT_PARENT; const b = runtime.gRfuFixed.STWIBuffer.data; if (b[0] === 40 || b[0] === 54) { ackFlag.value = b[1] === 0 ? runtime.gRfuLinkStatus.connSlotFlag : b[4]; return 0; } return ERR_REQ_CMD_ID; }
export function rfu_setTimerInterrupt(timerNo: number, _timerIntrTable_p: unknown, runtime = requireRuntime()): void { stwi(runtime, `timer:${timerNo}`); }
export function rfu_getSTWIRecvBuffer(runtime = requireRuntime()): number[] { return runtime.gRfuFixed.STWIBuffer.data; }
export function rfu_setMSCCallback(callback: ((reqCommandId: number) => void) | null, runtime = requireRuntime()): void { runtime.callbackS = callback; }
export function rfu_setREQCallback(callback: ((reqCommandId: number, reqResult: number) => void) | null, runtime = requireRuntime()): void { runtime.gRfuFixed.reqCallback = callback; rfu_enableREQCallback(callback !== null, runtime); }
export function rfu_enableREQCallback(enable: boolean, runtime = requireRuntime()): void { runtime.gRfuStatic.flags = enable ? runtime.gRfuStatic.flags | 8 : runtime.gRfuStatic.flags & 0xf7; }
export function rfu_STC_REQ_callback(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_defaultCallback'); runtime.gRfuStatic.reqResult = reqResult; if (runtime.gRfuStatic.flags & 8) runtime.gRfuFixed.reqCallback?.(reqCommand, reqResult); }
export function rfu_CB_defaultCallback(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqCommand === ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ) { if (runtime.gRfuStatic.flags & 8) runtime.gRfuFixed.reqCallback?.(reqCommand, reqResult); const bm = connectedMask(runtime); for (let i = 0; i < RFU_CHILD_MAX; i += 1) if ((bm >> i) & 1) rfu_STC_removeLinkData(i, 1, runtime); runtime.gRfuLinkStatus.parentChild = MODE_NEUTRAL; } }
export function rfu_waitREQComplete(runtime = requireRuntime()): number { stwi(runtime, 'poll_CommandEnd'); return runtime.gRfuStatic.reqResult; }
export function rfu_REQ_RFUStatus(runtime = requireRuntime()): void { cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, 'SystemStatusREQ'); }
export function rfu_getRFUStatus(rfuState: { value: number }, runtime = requireRuntime()): number { if (runtime.gRfuFixed.STWIBuffer.data[0] !== 0x93) return ERR_REQ_CMD_ID; rfuState.value = runtime.pollCommandEndResult === 0 ? runtime.gRfuFixed.STWIBuffer.data[7] : 0xff; return 0; }
export function rfu_MBOOT_CHILD_inheritanceLinkStatus(runtime = requireRuntime()): number { runtime.gRfuStatic.flags |= 0x80; return 0; }
export function rfu_REQ_stopMode(runtime = requireRuntime()): void { if (runtime.ime === 0) { rfu_STC_REQ_callback(ID_STOP_MODE_REQ, ERR_REQ_CMD_IME_DISABLE, runtime); } else { rfu_STC_clearAPIVariables(runtime); cb(runtime, 'rfu_CB_stopMode'); stwi(runtime, 'StopModeREQ'); } }
export function rfu_CB_stopMode(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_REQBN_softReset_and_checkID(runtime = requireRuntime()): number { if (runtime.ime === 0) return ERR_ID_CHECK_IME_DISABLE; rfu_STC_clearAPIVariables(runtime); return runtime.softResetId; }
export function rfu_REQ_reset(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_reset'); stwi(runtime, 'ResetREQ'); }
export function rfu_CB_reset(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) rfu_STC_clearAPIVariables(runtime); rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_REQ_configSystem(availSlotFlag: number, _maxMFrame: number, mcTimer: number, runtime = requireRuntime()): void { cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, `SystemConfigREQ:${(availSlotFlag & AVAIL_SLOT1) | 0x3c}`); runtime.gRfuStatic.linkEmergencyLimit = mcTimer === 0 ? 1 : Math.trunc(600 / mcTimer); }
export function rfu_REQ_configGameData(mbootFlag: number, serialNo: number, gname: readonly number[], uname: readonly number[], runtime = requireRuntime()): void { const packet = Array.from({ length: 16 }, () => 0); packet[0] = serialNo & 0xff; packet[1] = (serialNo >> 8) | (mbootFlag ? 0x80 : 0); for (let i = 2; i < 15; i += 1) packet[i] = gname[i - 2] ?? 0; let sum = 0; for (let i = 0; i < 8; i += 1) sum += (uname[i] ?? 0) + (gname[i] ?? 0); packet[15] = (~sum) & 0xff; runtime.gRfuFixed.STWIBuffer.data.splice(4, 16, ...packet); cb(runtime, 'rfu_CB_configGameData'); stwi(runtime, 'GameConfigREQ'); }
export function rfu_CB_configGameData(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) { const p = runtime.gRfuFixed.STWIBuffer.data; runtime.gRfuLinkStatus.my.serialNo = p[4] | (p[5] << 8); runtime.gRfuLinkStatus.my.mbootFlag = runtime.gRfuLinkStatus.my.serialNo & 0x8000 ? 1 : 0; runtime.gRfuLinkStatus.my.serialNo &= 0x7fff; runtime.gRfuLinkStatus.my.gname = p.slice(6, 19); runtime.gRfuLinkStatus.my.uname = p.slice(20, 28); } rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_REQ_startSearchChild(runtime = requireRuntime()): void { runtime.gRfuStatic.lsFixedCount.fill(0); if (runtime.gRfuFixed.STWIBuffer.data[7] === 0) rfu_STC_clearLinkStatus(MODE_PARENT, runtime); cb(runtime, 'rfu_CB_startSearchChild'); stwi(runtime, 'SC_StartREQ'); }
export function rfu_CB_startSearchChild(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) runtime.gRfuStatic.SCStartFlag = 1; rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_STC_clearLinkStatus(parentChild: number, runtime = requireRuntime()): void { rfu_clearAllSlot(runtime); if (parentChild !== MODE_CHILD) { runtime.gRfuLinkStatus.partner = Array.from({ length: RFU_CHILD_MAX }, () => makeTarget()); runtime.gRfuLinkStatus.findParentCount = 0; } runtime.gRfuLinkStatus.strength.fill(0); runtime.gRfuLinkStatus.connCount = 0; runtime.gRfuLinkStatus.connSlotFlag = 0; runtime.gRfuLinkStatus.linkLossSlotFlag = 0; runtime.gRfuLinkStatus.getNameFlag = 0; }
export function rfu_REQ_pollSearchChild(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_pollAndEndSearchChild'); stwi(runtime, 'SC_PollingREQ'); }
export function rfu_REQ_endSearchChild(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_pollAndEndSearchChild'); stwi(runtime, 'SC_EndREQ'); }
export function rfu_CB_pollAndEndSearchChild(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) rfu_STC_readChildList(runtime); if (reqCommand === ID_SC_END_REQ) runtime.gRfuStatic.SCStartFlag = 0; rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_STC_readChildList(runtime = requireRuntime()): void { const data = runtime.gRfuFixed.STWIBuffer.data; let num = data[1]; let p = 4; while (num-- > 0) { const id = data[p] | (data[p + 1] << 8); const slot = data[p + 2]; if (slot < RFU_CHILD_MAX && !((connectedMask(runtime) >> slot) & 1)) { runtime.gRfuStatic.lsFixedCount[slot] = 0x3c; runtime.gRfuLinkStatus.strength[slot] = 16; runtime.gRfuLinkStatus.connSlotFlag |= 1 << slot; runtime.gRfuLinkStatus.connCount += 1; runtime.gRfuLinkStatus.partner[slot] = { ...makeTarget(), id, slot }; runtime.gRfuLinkStatus.parentChild = MODE_PARENT; runtime.gRfuStatic.flags &= 0x7f; runtime.gRfuStatic.cidBak[slot] = id; } p += 4; } }
export function rfu_REQ_startSearchParent(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_startSearchParent'); stwi(runtime, 'SP_StartREQ'); }
export function rfu_CB_startSearchParent(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) rfu_STC_clearLinkStatus(MODE_CHILD, runtime); rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_REQ_pollSearchParent(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_pollSearchParent'); stwi(runtime, 'SP_PollingREQ'); }
export function rfu_CB_pollSearchParent(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) rfu_STC_readParentCandidateList(runtime); rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_REQ_endSearchParent(runtime = requireRuntime()): void { cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, 'SP_EndREQ'); }
export function rfu_STC_readParentCandidateList(runtime = requireRuntime()): void { const data = runtime.gRfuFixed.STWIBuffer.data; runtime.gRfuLinkStatus.partner = Array.from({ length: RFU_CHILD_MAX }, () => makeTarget()); runtime.gRfuLinkStatus.findParentCount = 0; let p = 4; for (let i = 0, num = data[1]; i < RFU_CHILD_MAX && num !== 0; i += 1, num -= 7) { const target = makeTarget(); target.id = data[p] | (data[p + 1] << 8); target.slot = data[p + 2]; target.serialNo = (data[p + 4] | (data[p + 5] << 8)) & 0x7fff; target.mbootFlag = (data[p + 5] & 0x80) ? 1 : 0; target.gname = data.slice(p + 6, p + 19); target.uname = data.slice(p + 20, p + 28); runtime.gRfuLinkStatus.partner[runtime.gRfuLinkStatus.findParentCount++] = target; p += 28; } }
export function rfu_REQ_startConnectParent(pid: number, runtime = requireRuntime()): void { if (!runtime.gRfuLinkStatus.partner.some((p) => p.id === pid)) rfu_STC_REQ_callback(ID_CP_START_REQ, ERR_PID_NOT_FOUND, runtime); else { runtime.gRfuStatic.tryPid = pid; cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, `CP_StartREQ:${pid}`); } }
export function rfu_REQ_pollConnectParent(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_pollConnectParent'); stwi(runtime, 'CP_PollingREQ'); }
export function rfu_CB_pollConnectParent(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) { const d = runtime.gRfuFixed.STWIBuffer.data; const id = d[0] | (d[1] << 8); const slot = d[6]; if (d[7] === 0 && slot < RFU_CHILD_MAX) { const bit = 1 << slot; if (!(runtime.gRfuLinkStatus.connSlotFlag & bit)) { runtime.gRfuLinkStatus.connSlotFlag |= bit; runtime.gRfuLinkStatus.linkLossSlotFlag &= ~bit; runtime.gRfuLinkStatus.my.id = id; runtime.gRfuLinkStatus.connCount += 1; runtime.gRfuLinkStatus.parentChild = MODE_CHILD; runtime.gRfuStatic.flags |= 0x80; const src = runtime.gRfuLinkStatus.partner.find((p) => p.id === runtime.gRfuStatic.tryPid) ?? makeTarget(); runtime.gRfuLinkStatus.partner[slot] = { ...src, slot }; } } } rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_getConnectParentStatus(status: { value: number }, connectSlotNo: { value: number }, runtime = requireRuntime()): number { const p = runtime.gRfuFixed.STWIBuffer.data; status.value = 0xff; if (p[0] === 0xa0 || p[0] === 0xa1) { connectSlotNo.value = p[6]; status.value = p[7]; return 0; } return ERR_REQ_CMD_ID; }
export function rfu_REQ_endConnectParent(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_pollConnectParent'); stwi(runtime, 'CP_EndREQ'); const slot = runtime.gRfuFixed.STWIBuffer.data[6]; if (slot < 4) runtime.gRfuStatic.linkEmergencyFlag[slot] = 0; }
export function rfu_syncVBlank(runtime = requireRuntime()): number { rfu_NI_checkCommFailCounter(runtime); if (runtime.gRfuLinkStatus.parentChild === MODE_NEUTRAL) return 0; if (runtime.gRfuStatic.nowWatchInterval) runtime.gRfuStatic.nowWatchInterval -= 1; const masterSlave = rfu_getMasterSlave(runtime); if (!(runtime.gRfuStatic.flags & 2) && masterSlave === AGB_CLK_SLAVE) { runtime.gRfuStatic.flags |= 4; runtime.gRfuStatic.watchdogTimer = 360; } if (masterSlave !== AGB_CLK_SLAVE) runtime.gRfuStatic.flags &= 0xfd; else runtime.gRfuStatic.flags |= 2; if (!(runtime.gRfuStatic.flags & 4)) return 0; if (runtime.gRfuStatic.watchdogTimer === 0) { connectedSlotsRemove(runtime, true); runtime.gRfuLinkStatus.parentChild = MODE_NEUTRAL; return 1; } runtime.gRfuStatic.watchdogTimer -= 1; return 0; }
const connectedSlotsRemove = (runtime: LibrfuRfuRuntime, disconnect: boolean): void => { const bm = connectedMask(runtime); for (let i = 0; i < RFU_CHILD_MAX; i += 1) if ((bm >> i) & 1) rfu_STC_removeLinkData(i, disconnect ? 1 : 0, runtime); };
export function rfu_REQBN_watchLink(_reqCommandId: number, bmLinkLossSlot: { value: number }, linkLossReason: { value: number }, parentBmLinkRecoverySlot: { value: number }, runtime = requireRuntime()): number { bmLinkLossSlot.value = 0; linkLossReason.value = REASON_DISCONNECTED; parentBmLinkRecoverySlot.value = 0; if (runtime.gRfuLinkStatus.parentChild === MODE_NEUTRAL || runtime.msMode === 0) return 0; for (let i = 0; i < RFU_CHILD_MAX; i += 1) { const bit = 1 << i; if ((runtime.gRfuLinkStatus.connSlotFlag & bit) && runtime.gRfuLinkStatus.strength[i] === 0) { runtime.gRfuStatic.linkEmergencyFlag[i] += 1; if (runtime.gRfuStatic.linkEmergencyFlag[i] > 3) { bmLinkLossSlot.value |= bit; linkLossReason.value = REASON_LINK_LOSS; rfu_STC_removeLinkData(i, 0, runtime); } } if ((runtime.gRfuLinkStatus.linkLossSlotFlag & bit) && runtime.gRfuLinkStatus.strength[i] > 10) { parentBmLinkRecoverySlot.value |= bit; runtime.gRfuLinkStatus.connSlotFlag |= bit; runtime.gRfuLinkStatus.linkLossSlotFlag &= ~bit; runtime.gRfuLinkStatus.connCount += 1; } } return 0; }
export function rfu_STC_removeLinkData(bmConnectedPartnerId: number, bmDisconnect: number, runtime = requireRuntime()): void { const bit = 1 << bmConnectedPartnerId; runtime.gRfuStatic.lsFixedCount[bmConnectedPartnerId] = 0; if ((runtime.gRfuLinkStatus.connSlotFlag & bit) && runtime.gRfuLinkStatus.connCount) runtime.gRfuLinkStatus.connCount -= 1; runtime.gRfuLinkStatus.connSlotFlag &= ~bit; runtime.gRfuLinkStatus.linkLossSlotFlag |= bit; if (runtime.gRfuLinkStatus.parentChild === MODE_CHILD && runtime.gRfuLinkStatus.connSlotFlag === 0) runtime.gRfuLinkStatus.parentChild = MODE_NEUTRAL; if (bmDisconnect) { runtime.gRfuLinkStatus.partner[bmConnectedPartnerId] = makeTarget(); runtime.gRfuLinkStatus.linkLossSlotFlag &= ~bit; runtime.gRfuLinkStatus.getNameFlag &= ~bit; runtime.gRfuLinkStatus.strength[bmConnectedPartnerId] = 0; } }
export function rfu_REQ_disconnect(bmDisconnectSlot: number, runtime = requireRuntime()): void { if (connectedMask(runtime) & bmDisconnectSlot) { runtime.gRfuStatic.recoveryBmSlot = bmDisconnectSlot; cb(runtime, 'rfu_CB_disconnect'); stwi(runtime, `DisconnectREQ:${bmDisconnectSlot}`); } }
export function rfu_CB_disconnect(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { runtime.gRfuStatic.recoveryBmSlot &= connectedMask(runtime); runtime.gRfuFixed.STWIBuffer.data[8] = runtime.gRfuStatic.recoveryBmSlot; if (reqResult === 0) for (let i = 0; i < RFU_CHILD_MAX; i += 1) if ((runtime.gRfuStatic.recoveryBmSlot >> i) & 1) rfu_STC_removeLinkData(i, 1, runtime); if (connectedMask(runtime) === 0) runtime.gRfuLinkStatus.parentChild = MODE_NEUTRAL; rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_REQ_CHILD_startConnectRecovery(bmRecoverySlot: number, runtime = requireRuntime()): void { runtime.gRfuStatic.recoveryBmSlot = bmRecoverySlot; cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, `CPR_StartREQ:${bmRecoverySlot}`); }
export function rfu_REQ_CHILD_pollConnectRecovery(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_CHILD_pollConnectRecovery'); stwi(runtime, 'CPR_PollingREQ'); }
export function rfu_CB_CHILD_pollConnectRecovery(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0 && runtime.gRfuFixed.STWIBuffer.data[4] === 0 && runtime.gRfuStatic.recoveryBmSlot) { runtime.gRfuLinkStatus.parentChild = MODE_CHILD; for (let i = 0; i < RFU_CHILD_MAX; i += 1) { const bit = 1 << i; if (runtime.gRfuStatic.recoveryBmSlot & bit & runtime.gRfuLinkStatus.linkLossSlotFlag) { runtime.gRfuLinkStatus.connSlotFlag |= bit; runtime.gRfuLinkStatus.linkLossSlotFlag &= ~bit; runtime.gRfuLinkStatus.connCount += 1; runtime.gRfuStatic.linkEmergencyFlag[i] = 0; } } runtime.gRfuStatic.recoveryBmSlot = 0; } rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_CHILD_getConnectRecoveryStatus(status: { value: number }, runtime = requireRuntime()): number { status.value = 0xff; const cmd = runtime.gRfuFixed.STWIBuffer.data[0]; if (cmd === 0xb3 || cmd === 0xb4) { status.value = runtime.gRfuFixed.STWIBuffer.data[4]; return 0; } return ERR_REQ_CMD_ID; }
export function rfu_REQ_CHILD_endConnectRecovery(runtime = requireRuntime()): void { cb(runtime, 'rfu_CB_CHILD_pollConnectRecovery'); stwi(runtime, 'CPR_EndREQ'); }
export function rfu_STC_fastCopy(src_p: { value: number[]; index: number }, dst_p: { value: number[]; index: number }, size: number): void { for (let i = size - 1; i !== -1; i -= 1) dst_p.value[dst_p.index++] = src_p.value[src_p.index++] ?? 0; }
export function rfu_REQ_changeMasterSlave(runtime = requireRuntime()): void { if (runtime.masterSlave === AGB_CLK_MASTER) { cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, 'MS_ChangeREQ'); } else rfu_STC_REQ_callback(ID_MS_CHANGE_REQ, 0, runtime); }
export function rfu_getMasterSlave(runtime = requireRuntime()): number { let masterSlave = runtime.masterSlave; if (masterSlave === AGB_CLK_MASTER && runtime.sending && [ID_MS_CHANGE_REQ, ID_DATA_TX_AND_CHANGE_REQ, ID_RESUME_RETRANSMIT_AND_CHANGE_REQ].includes(runtime.reqActiveCommand)) masterSlave = AGB_CLK_SLAVE; return masterSlave; }
export function rfu_clearAllSlot(runtime = requireRuntime()): void { runtime.gRfuSlotStatusNI = Array.from({ length: RFU_CHILD_MAX }, () => makeSlotNI()); runtime.gRfuSlotStatusUNI = Array.from({ length: RFU_CHILD_MAX }, () => makeSlotUNI()); runtime.gRfuLinkStatus.remainLLFrameSizeChild = [16, 16, 16, 16]; runtime.gRfuLinkStatus.remainLLFrameSizeParent = LLF_P_SIZE; runtime.gRfuLinkStatus.sendSlotNIFlag = 0; runtime.gRfuLinkStatus.recvSlotNIFlag = 0; runtime.gRfuLinkStatus.sendSlotUNIFlag = 0; runtime.gRfuStatic.recvRenewalFlag = 0; }
export function rfu_STC_releaseFrame(bm_slot_id: number, send_recv: number, NI_comm: NIComm, runtime = requireRuntime()): void { if (!(runtime.gRfuStatic.flags & 0x80)) { if (send_recv === 0) runtime.gRfuLinkStatus.remainLLFrameSizeParent += NI_comm.payloadSize; runtime.gRfuLinkStatus.remainLLFrameSizeParent += 3; } else { if (send_recv === 0) runtime.gRfuLinkStatus.remainLLFrameSizeChild[bm_slot_id] += NI_comm.payloadSize; runtime.gRfuLinkStatus.remainLLFrameSizeChild[bm_slot_id] += 2; } }
export function rfu_clearSlot(connTypeFlag: number, slotStatusIndex: number, runtime = requireRuntime()): number { if (slotStatusIndex >= RFU_CHILD_MAX) return ERR_SLOT_NO; if (!(connTypeFlag & (TYPE_UNI_SEND | TYPE_UNI_RECV | TYPE_NI_SEND | TYPE_NI_RECV))) return ERR_COMM_TYPE; const ni = runtime.gRfuSlotStatusNI[slotStatusIndex]; if (connTypeFlag & TYPE_NI_SEND) { if (ni.send.state & SLOT_BUSY_FLAG) rfu_STC_releaseFrame(slotStatusIndex, 0, ni.send, runtime); runtime.gRfuLinkStatus.sendSlotNIFlag &= ~ni.send.bmSlotOrg; ni.send = makeNIComm(); } if (connTypeFlag & TYPE_NI_RECV) { if (ni.recv.state & SLOT_BUSY_FLAG) rfu_STC_releaseFrame(slotStatusIndex, 1, ni.recv, runtime); runtime.gRfuLinkStatus.recvSlotNIFlag &= ~(1 << slotStatusIndex); ni.recv = makeNIComm(); } if (connTypeFlag & TYPE_UNI_SEND) { runtime.gRfuLinkStatus.sendSlotUNIFlag &= ~runtime.gRfuSlotStatusUNI[slotStatusIndex].send.bmSlot; runtime.gRfuSlotStatusUNI[slotStatusIndex].send = makeSlotUNI().send; } if (connTypeFlag & TYPE_UNI_RECV) runtime.gRfuSlotStatusUNI[slotStatusIndex].recv = makeSlotUNI().recv; return 0; }
export function rfu_setRecvBuffer(connType: number, slotNo: number, buffer: number[], buffSize: number, runtime = requireRuntime()): number { if (slotNo >= RFU_CHILD_MAX) return ERR_SLOT_NO; if (connType & TYPE_NI) { runtime.gRfuSlotStatusNI[slotNo].recvBuffer = buffer; runtime.gRfuSlotStatusNI[slotNo].recvBufferSize = buffSize; } else if (connType & TYPE_UNI) { runtime.gRfuSlotStatusUNI[slotNo].recvBuffer = buffer; runtime.gRfuSlotStatusUNI[slotNo].recvBufferSize = buffSize; } else return ERR_COMM_TYPE; return 0; }
export function rfu_NI_setSendData(bmSendSlot: number, subFrameSize: number, src: readonly number[], size: number, runtime = requireRuntime()): number { return rfu_STC_setSendData_org(32, bmSendSlot, subFrameSize, src, size, runtime); }
export function rfu_UNI_setSendData(bmSendSlot: number, src: readonly number[], size: number, runtime = requireRuntime()): number { return rfu_STC_setSendData_org(16, bmSendSlot, size + frameSize(runtime), src, 0, runtime); }
export function rfu_NI_CHILD_setSendGameName(slotNo: number, subFrameSize: number, runtime = requireRuntime()): number { return rfu_STC_setSendData_org(64, 1 << slotNo, subFrameSize, [runtime.gRfuLinkStatus.my.serialNo & 0xff, runtime.gRfuLinkStatus.my.serialNo >> 8], 26, runtime); }
export function rfu_STC_setSendData_org(ni_or_uni: number, bmSendSlot: number, subFrameSize: number, src: readonly number[], dataSize: number, runtime = requireRuntime()): number { if (runtime.gRfuLinkStatus.parentChild === MODE_NEUTRAL) return ERR_MODE_NOT_CONNECTED; if (!(bmSendSlot & 0xf)) return ERR_SLOT_NO; if ((connectedMask(runtime) & bmSendSlot) !== bmSendSlot) return ERR_SLOT_NOT_CONNECTED; const sendingFlag = ni_or_uni & 0x10 ? runtime.gRfuLinkStatus.sendSlotUNIFlag : runtime.gRfuLinkStatus.sendSlotNIFlag; if (sendingFlag & bmSendSlot) return ERR_SLOT_BUSY; const slot = Math.max(0, [0, 1, 2, 3].find((i) => ((bmSendSlot >> i) & 1) !== 0) ?? 0); const frame = frameSize(runtime); const remain = runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? runtime.gRfuLinkStatus.remainLLFrameSizeParent : runtime.gRfuLinkStatus.remainLLFrameSizeChild[slot]; if (subFrameSize > remain || subFrameSize <= frame) return ERR_SUBFRAME_SIZE; if ((ni_or_uni & 0x20) || ni_or_uni === 0x40) { const comm = runtime.gRfuSlotStatusNI[slot].send; Object.assign(comm, makeNIComm(), { errorCode: 0, now_p: [0, 0, 0, 0], remainSize: 7, bmSlotOrg: bmSendSlot, bmSlot: bmSendSlot, payloadSize: subFrameSize - frame, dataType: ni_or_uni & 0x20 ? 0 : 1, dataSize, src: [...src], ack: 0, phase: 0, n: [1, 1, 1, 1], state: SLOT_STATE_SEND_START }); runtime.gRfuLinkStatus.sendSlotNIFlag |= bmSendSlot; } else { const uni = runtime.gRfuSlotStatusUNI[slot].send; Object.assign(uni, { bmSlot: bmSendSlot, src: [...src], payloadSize: subFrameSize - frame, state: SLOT_STATE_SEND_UNI }); runtime.gRfuLinkStatus.sendSlotUNIFlag |= bmSendSlot; } if (runtime.gRfuLinkStatus.parentChild === MODE_PARENT) runtime.gRfuLinkStatus.remainLLFrameSizeParent -= subFrameSize; else runtime.gRfuLinkStatus.remainLLFrameSizeChild[slot] -= subFrameSize; return 0; }
export function rfu_changeSendTarget(connType: number, slotStatusIndex: number, bmNewTgtSlot: number, runtime = requireRuntime()): number { if (slotStatusIndex >= RFU_CHILD_MAX) return ERR_SLOT_NO; if (connType === TYPE_NI_SEND) { const send = runtime.gRfuSlotStatusNI[slotStatusIndex].send; if (!((send.state & SLOT_BUSY_FLAG) && (send.state & SLOT_SEND_FLAG))) return ERR_SLOT_NOT_SENDING; const changed = bmNewTgtSlot ^ send.bmSlot; if (changed & bmNewTgtSlot) return ERR_SLOT_TARGET; runtime.gRfuLinkStatus.sendSlotNIFlag &= ~changed; send.bmSlot = bmNewTgtSlot; if (send.bmSlot === 0) { rfu_STC_releaseFrame(slotStatusIndex, 0, send, runtime); send.state = SLOT_STATE_SEND_FAILED; } } else if (connType === TYPE_UNI_SEND) { const send = runtime.gRfuSlotStatusUNI[slotStatusIndex].send; if (send.state !== SLOT_STATE_SEND_UNI) return ERR_SLOT_NOT_SENDING; runtime.gRfuLinkStatus.sendSlotUNIFlag &= ~send.bmSlot; runtime.gRfuLinkStatus.sendSlotUNIFlag |= bmNewTgtSlot; send.bmSlot = bmNewTgtSlot; } else return ERR_COMM_TYPE; return 0; }
export function rfu_NI_stopReceivingData(slotStatusIndex: number, runtime = requireRuntime()): number { if (slotStatusIndex >= RFU_CHILD_MAX) return ERR_SLOT_NO; const recv = runtime.gRfuSlotStatusNI[slotStatusIndex].recv; if (recv.state & SLOT_BUSY_FLAG) { recv.state = recv.state === SLOT_STATE_RECV_LAST ? SLOT_STATE_RECV_SUCCESS_AND_SENDSIDE_UNKNOWN : SLOT_STATE_RECV_FAILED; runtime.gRfuLinkStatus.recvSlotNIFlag &= ~(1 << slotStatusIndex); rfu_STC_releaseFrame(slotStatusIndex, 1, recv, runtime); } return 0; }
export function rfu_UNI_changeAndReadySendData(slotStatusIndex: number, src: readonly number[], size: number, runtime = requireRuntime()): number { if (slotStatusIndex >= RFU_CHILD_MAX) return ERR_SLOT_NO; const send = runtime.gRfuSlotStatusUNI[slotStatusIndex].send; if (send.state !== SLOT_STATE_SEND_UNI) return ERR_SLOT_NOT_SENDING; const frameEnd = (runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? runtime.gRfuLinkStatus.remainLLFrameSizeParent : runtime.gRfuLinkStatus.remainLLFrameSizeChild[slotStatusIndex]) + send.payloadSize; if (frameEnd < size) return ERR_SUBFRAME_SIZE; send.src = [...src]; send.payloadSize = size; send.dataReadyFlag = 1; return 0; }
export function rfu_UNI_readySendData(slotStatusIndex: number, runtime = requireRuntime()): void { if (slotStatusIndex < RFU_CHILD_MAX && runtime.gRfuSlotStatusUNI[slotStatusIndex].send.state === SLOT_STATE_SEND_UNI) runtime.gRfuSlotStatusUNI[slotStatusIndex].send.dataReadyFlag = 1; }
export function rfu_UNI_clearRecvNewDataFlag(slotStatusIndex: number, runtime = requireRuntime()): void { if (slotStatusIndex < RFU_CHILD_MAX) runtime.gRfuSlotStatusUNI[slotStatusIndex].recv.newDataFlag = 0; }
export function rfu_REQ_sendData(clockChangeFlag: boolean, runtime = requireRuntime()): void { if (runtime.gRfuLinkStatus.parentChild === MODE_NEUTRAL) return; if (!runtime.gRfuLinkStatus.LLFReadyFlag) rfu_constructSendLLFrame(runtime); if (runtime.gRfuLinkStatus.LLFReadyFlag) { cb(runtime, 'rfu_CB_sendData'); stwi(runtime, clockChangeFlag ? 'DataTxAndChangeREQ' : 'DataTxREQ'); } else if (clockChangeFlag) { if (runtime.gRfuLinkStatus.parentChild === MODE_PARENT) runtime.callbackS?.(39); else { cb(runtime, 'rfu_CB_sendData2'); stwi(runtime, 'MS_ChangeREQ'); } } }
export function rfu_CB_sendData(_reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0) for (let i = 0; i < RFU_CHILD_MAX; i += 1) { runtime.gRfuSlotStatusUNI[i].send.dataReadyFlag = 0; const ni = runtime.gRfuSlotStatusNI[i].send; if (ni.state === SLOT_STATE_SEND_NULL) { rfu_STC_releaseFrame(i, 0, ni, runtime); runtime.gRfuLinkStatus.sendSlotNIFlag &= ~ni.bmSlot; if (ni.dataType === 1) runtime.gRfuLinkStatus.getNameFlag |= 1 << i; ni.state = SLOT_STATE_SEND_SUCCESS; } } runtime.gRfuLinkStatus.LLFReadyFlag = 0; rfu_STC_REQ_callback(ID_DATA_TX_REQ, reqResult, runtime); }
export function rfu_CB_sendData2(_reqCommand: number, reqResult: number, runtime = requireRuntime()): void { rfu_STC_REQ_callback(ID_DATA_TX_REQ, reqResult, runtime); }
export function rfu_CB_sendData3(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult !== 0) rfu_STC_REQ_callback(ID_DATA_TX_REQ, reqResult, runtime); else if (reqCommand === ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ) rfu_STC_REQ_callback(reqCommand, 0, runtime); }
export function rfu_constructSendLLFrame(runtime = requireRuntime()): void { if (runtime.gRfuLinkStatus.parentChild === MODE_NEUTRAL || !(runtime.gRfuLinkStatus.sendSlotNIFlag | runtime.gRfuLinkStatus.recvSlotNIFlag | runtime.gRfuLinkStatus.sendSlotUNIFlag)) return; const dest: number[] = []; let packetSize = 0; for (let i = 0; i < RFU_CHILD_MAX; i += 1) { let curr = 0; const ni = runtime.gRfuSlotStatusNI[i]; if (ni.send.state & SLOT_BUSY_FLAG) curr += rfu_STC_NI_constructLLSF(i, { value: dest }, ni.send, runtime); if (ni.recv.state & SLOT_BUSY_FLAG) curr += rfu_STC_NI_constructLLSF(i, { value: dest }, ni.recv, runtime); if (runtime.gRfuSlotStatusUNI[i].send.state === SLOT_STATE_SEND_UNI) curr += rfu_STC_UNI_constructLLSF(i, { value: dest }, runtime); if (curr) packetSize += curr; } runtime.gRfuFixed.LLFBuffer = [packetSize, ...dest]; runtime.gRfuStatic.totalPacketSize = packetSize; }
export function rfu_STC_NI_constructLLSF(bm_slot_id: number, dest_pp: { value: number[] }, NI_comm: NIComm, runtime = requireRuntime()): number { const fs = frameSize(runtime); const size = NI_comm.state === SLOT_STATE_SENDING ? Math.min(NI_comm.payloadSize, Math.max(0, NI_comm.dataSize - NI_comm.now_p[NI_comm.phase])) : Math.min(NI_comm.payloadSize, NI_comm.remainSize); dest_pp.value.push(NI_comm.state & 0xf, NI_comm.phase, size); for (let i = 0; i < size; i += 1) dest_pp.value.push(NI_comm.src[(NI_comm.now_p[NI_comm.phase] + i) % Math.max(1, NI_comm.src.length)] ?? 0); if (NI_comm.state === SLOT_STATE_SENDING) NI_comm.phase = (NI_comm.phase + 1) & 3; runtime.gRfuLinkStatus.LLFReadyFlag |= runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? 1 : 1 << bm_slot_id; return size + fs; }
export function rfu_STC_UNI_constructLLSF(bm_slot_id: number, dest_p: { value: number[] }, runtime = requireRuntime()): number { const send = runtime.gRfuSlotStatusUNI[bm_slot_id].send; if (!send.dataReadyFlag || !send.bmSlot) return 0; const fs = frameSize(runtime); dest_p.value.push(send.state & 0xf, send.payloadSize); dest_p.value.push(...send.src.slice(0, send.payloadSize)); runtime.gRfuLinkStatus.LLFReadyFlag |= runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? 16 : 16 << bm_slot_id; return fs + send.payloadSize; }
export function rfu_REQ_recvData(runtime = requireRuntime()): void { if (runtime.gRfuLinkStatus.parentChild !== MODE_NEUTRAL) { runtime.gRfuStatic.commExistFlag = runtime.gRfuLinkStatus.sendSlotNIFlag | runtime.gRfuLinkStatus.recvSlotNIFlag | runtime.gRfuLinkStatus.sendSlotUNIFlag; runtime.gRfuStatic.recvErrorFlag = 0; cb(runtime, 'rfu_CB_recvData'); stwi(runtime, 'DataRxREQ'); } }
export function rfu_CB_recvData(reqCommand: number, reqResult: number, runtime = requireRuntime()): void { if (reqResult === 0 && runtime.gRfuFixed.STWIBuffer.data[1]) { runtime.gRfuStatic.NIEndRecvFlag = 0; if (runtime.gRfuLinkStatus.parentChild === MODE_PARENT) rfu_STC_PARENT_analyzeRecvPacket(runtime); else rfu_STC_CHILD_analyzeRecvPacket(runtime); if (runtime.gRfuStatic.recvErrorFlag) reqResult = runtime.gRfuStatic.recvErrorFlag | ERR_DATA_RECV; } rfu_STC_REQ_callback(reqCommand, reqResult, runtime); }
export function rfu_STC_PARENT_analyzeRecvPacket(runtime = requireRuntime()): void { let frames = runtime.gRfuFixed.STWIBuffer.data[0] >> 8; let packet = 8; for (let slot = 0; slot < RFU_CHILD_MAX; slot += 1) { let count = frames & 0x1f; frames >>= 5; if (count === 0) runtime.gRfuStatic.NIEndRecvFlag |= 1 << slot; while (count > 0) { const used = rfu_STC_analyzeLLSF(slot, runtime.gRfuFixed.STWIBuffer.data.slice(packet), count, runtime); packet += used; count -= used; } } }
export function rfu_STC_CHILD_analyzeRecvPacket(runtime = requireRuntime()): void { let frames = runtime.gRfuFixed.STWIBuffer.data[4] & 0x7f; let packet = 8; if (frames === 0) runtime.gRfuStatic.NIEndRecvFlag = 15; while (frames > 0) { const used = rfu_STC_analyzeLLSF(0, runtime.gRfuFixed.STWIBuffer.data.slice(packet), frames, runtime); packet += used; frames -= used; } }
export function rfu_STC_analyzeLLSF(slot_id: number, src: readonly number[], last_frame: number, runtime = requireRuntime()): number { const fs = runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? 2 : 3; if (last_frame < fs) return last_frame; const llsf = { recvFirst: 0, connSlotFlag: runtime.gRfuLinkStatus.connSlotFlag, slotState: src[0] ?? 0, ack: src[1] ? 1 : 0, phase: src[1] ?? 0, n: src[2] ?? 0, frame: src[2] ?? 0 }; const payload = src.slice(fs, fs + llsf.frame); if (llsf.slotState === LCOM_UNI) rfu_STC_UNI_receive(slot_id, llsf, payload, runtime); else if (llsf.ack === 0) rfu_STC_NI_receive_Receiver(slot_id, llsf, payload, runtime); else rfu_STC_NI_receive_Sender(slot_id, slot_id, llsf, payload, runtime); return llsf.frame + fs; }
export function rfu_STC_UNI_receive(bm_slot_id: number, llsf_NI: { frame: number }, src: readonly number[], runtime = requireRuntime()): void { const slot = runtime.gRfuSlotStatusUNI[bm_slot_id]; const recv = slot.recv; recv.errorCode = 0; if (slot.recvBufferSize < llsf_NI.frame) { recv.state = SLOT_STATE_RECV_IGNORE; recv.errorCode = ERR_RECV_BUFF_OVER; } else { recv.state = SLOT_STATE_RECEIVING; recv.dataSize = llsf_NI.frame; if (slot.recvBuffer) for (let i = 0; i < llsf_NI.frame; i += 1) slot.recvBuffer[i] = src[i] ?? 0; recv.newDataFlag = 1; recv.state = 0; } if (recv.errorCode) runtime.gRfuStatic.recvErrorFlag |= 16 << bm_slot_id; }
export function rfu_STC_NI_receive_Sender(NI_slot: number, bm_flag: number, llsf_NI: { phase: number; n: number; slotState: number }, _data_p: readonly number[], runtime = requireRuntime()): void { const ni = runtime.gRfuSlotStatusNI[NI_slot].send; if (ni.n[llsf_NI.phase] === llsf_NI.n) ni.recvAckFlag[llsf_NI.phase] |= 1 << bm_flag; if ((ni.recvAckFlag[llsf_NI.phase] & ni.bmSlot) === ni.bmSlot) { ni.n[llsf_NI.phase] = (ni.n[llsf_NI.phase] + 1) & 3; ni.recvAckFlag[llsf_NI.phase] = 0; if (ni.state === SLOT_STATE_SEND_START) { ni.now_p[llsf_NI.phase] += ni.payloadSize; ni.remainSize = ni.dataSize; ni.state = SLOT_STATE_SENDING; } else if (ni.state === SLOT_STATE_SEND_LAST) ni.state = SLOT_STATE_SEND_NULL; } runtime.gRfuStatic.recvRenewalFlag |= 16 << bm_flag; runtime.gRfuSlotStatusNI[bm_flag].send.failCounter = 0; }
export function rfu_STC_NI_receive_Receiver(bm_slot_id: number, llsf_NI: { slotState: number; phase: number; n: number; frame: number }, data_p: readonly number[], runtime = requireRuntime()): void { const recv = runtime.gRfuSlotStatusNI[bm_slot_id].recv; if (llsf_NI.slotState === LCOM_NI_START && recv.state !== SLOT_STATE_RECV_START) rfu_STC_NI_initSlot_asRecvControllData(bm_slot_id, recv, runtime); if (llsf_NI.slotState === LCOM_NI && recv.state === SLOT_STATE_RECV_START && !recv.remainSize) rfu_STC_NI_initSlot_asRecvDataEntity(bm_slot_id, recv, runtime); if (llsf_NI.slotState === LCOM_NI_END) { runtime.gRfuStatic.NIEndRecvFlag |= 1 << bm_slot_id; recv.phase = 0; recv.n[0] = 0; recv.state = SLOT_STATE_RECV_LAST; } if (recv.state === SLOT_STATE_RECEIVING) { recv.now_p[llsf_NI.phase] += llsf_NI.frame; recv.remainSize -= llsf_NI.frame; if (runtime.gRfuSlotStatusNI[bm_slot_id].recvBuffer) for (let i = 0; i < llsf_NI.frame; i += 1) runtime.gRfuSlotStatusNI[bm_slot_id].recvBuffer![recv.now_p[llsf_NI.phase] + i] = data_p[i] ?? 0; } recv.phase = llsf_NI.phase; recv.n[llsf_NI.phase] = llsf_NI.n; runtime.gRfuStatic.recvRenewalFlag |= 1 << bm_slot_id; recv.failCounter = 0; }
export function rfu_STC_NI_initSlot_asRecvControllData(bm_slot_id: number, NI_comm: NIComm, runtime = requireRuntime()): void { const frame = frameSize(runtime); const remain = runtime.gRfuLinkStatus.parentChild === MODE_PARENT ? runtime.gRfuLinkStatus.remainLLFrameSizeParent : runtime.gRfuLinkStatus.remainLLFrameSizeChild[bm_slot_id]; const bit = 1 << bm_slot_id; if (NI_comm.state === 0) { if (remain < frame) { NI_comm.state = SLOT_STATE_RECV_IGNORE; NI_comm.errorCode = ERR_RECV_REPLY_SUBFRAME_SIZE; runtime.gRfuStatic.recvErrorFlag |= bit; } else { NI_comm.errorCode = 0; NI_comm.now_p[0] = 0; NI_comm.remainSize = 7; NI_comm.ack = 1; NI_comm.payloadSize = 0; NI_comm.bmSlot = bit; NI_comm.state = SLOT_STATE_RECV_START; runtime.gRfuLinkStatus.recvSlotNIFlag |= bit; } } }
export function rfu_STC_NI_initSlot_asRecvDataEntity(bm_slot_id: number, NI_comm: NIComm, runtime = requireRuntime()): void { if (NI_comm.dataType !== 1 && NI_comm.dataSize > runtime.gRfuSlotStatusNI[bm_slot_id].recvBufferSize) { const bit = 1 << bm_slot_id; runtime.gRfuStatic.recvErrorFlag |= bit; runtime.gRfuLinkStatus.recvSlotNIFlag &= ~bit; NI_comm.errorCode = ERR_RECV_BUFF_OVER; NI_comm.state = SLOT_STATE_RECV_FAILED; rfu_STC_releaseFrame(bm_slot_id, 1, NI_comm, runtime); return; } for (let i = 0; i < WINDOW_COUNT; i += 1) { NI_comm.n[i] = 0; NI_comm.now_p[i] = NI_comm.payloadSize * i; } NI_comm.remainSize = NI_comm.dataSize; NI_comm.state = SLOT_STATE_RECEIVING; }
export function rfu_NI_checkCommFailCounter(runtime = requireRuntime()): void { if (runtime.gRfuLinkStatus.sendSlotNIFlag | runtime.gRfuLinkStatus.recvSlotNIFlag) { const recvRenewalFlag = runtime.gRfuStatic.recvRenewalFlag >> 4; for (let i = 0; i < RFU_CHILD_MAX; i += 1) { const bit = 1 << i; if ((runtime.gRfuLinkStatus.sendSlotNIFlag & bit) && !(runtime.gRfuStatic.recvRenewalFlag & bit)) runtime.gRfuSlotStatusNI[i].send.failCounter += 1; if ((runtime.gRfuLinkStatus.recvSlotNIFlag & bit) && !(recvRenewalFlag & bit)) runtime.gRfuSlotStatusNI[i].recv.failCounter += 1; } runtime.gRfuStatic.recvRenewalFlag = 0; } }
export function rfu_REQ_noise(runtime = requireRuntime()): void { cb(runtime, 'rfu_STC_REQ_callback'); stwi(runtime, 'TestModeREQ:1:0'); }
