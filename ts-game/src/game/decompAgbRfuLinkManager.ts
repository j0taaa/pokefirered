export const RFU_CHILD_MAX = 4;
export const RFU_ID = 0x8000;
export const MODE_CHILD = 0;
export const MODE_PARENT = 1;
export const MODE_P_C_SWITCH = 2;
export const MODE_NEUTRAL = 2;
export const AGB_CLK_MASTER = 0;
export const AGB_CLK_SLAVE = 1;

export const PCSWITCH_1ST_SC_START = 0x01;
export const PCSWITCH_1ST_SC = 0x02;
export const PCSWITCH_2ND_SP_START = 0x03;
export const PCSWITCH_2ND_SP = 0x04;
export const PCSWITCH_3RD_SC_START = 0x05;
export const PCSWITCH_3RD_SC = 0x06;
export const PCSWITCH_CP = 0x07;
export const PCSWITCH_SC_LOCK = 0x08;
export const PCSWITCH_SP_PERIOD = 65;

export const LMAN_ERROR_MANAGER_BUSY = 1;
export const LMAN_ERROR_AGB_CLK_SLAVE = 2;
export const LMAN_ERROR_PID_NOT_FOUND = 3;
export const LMAN_ERROR_ILLEGAL_PARAMETER = 4;
export const LMAN_ERROR_NOW_COMMUNICATION = 6;
export const LMAN_ERROR_NOW_SEARCH_PARENT = 7;

export const LMAN_MSG_INITIALIZE_COMPLETED = 0x00;
export const LMAN_MSG_NEW_CHILD_CONNECT_DETECTED = 0x10;
export const LMAN_MSG_NEW_CHILD_CONNECT_ACCEPTED = 0x11;
export const LMAN_MSG_NEW_CHILD_CONNECT_REJECTED = 0x12;
export const LMAN_MSG_SEARCH_CHILD_PERIOD_EXPIRED = 0x13;
export const LMAN_MSG_END_WAIT_CHILD_NAME = 0x14;
export const LMAN_MSG_PARENT_FOUND = 0x20;
export const LMAN_MSG_SEARCH_PARENT_PERIOD_EXPIRED = 0x21;
export const LMAN_MSG_CONNECT_PARENT_SUCCESSED = 0x22;
export const LMAN_MSG_CONNECT_PARENT_FAILED = 0x23;
export const LMAN_MSG_CHILD_NAME_SEND_COMPLETED = 0x24;
export const LMAN_MSG_CHILD_NAME_SEND_FAILED_AND_DISCONNECTED = 0x25;
export const LMAN_MSG_LINK_LOSS_DETECTED_AND_DISCONNECTED = 0x30;
export const LMAN_MSG_LINK_LOSS_DETECTED_AND_START_RECOVERY = 0x31;
export const LMAN_MSG_LINK_RECOVERY_SUCCESSED = 0x32;
export const LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED = 0x33;
export const LMAN_MSG_LINK_DISCONNECTED_BY_USER = 0x40;
export const LMAN_MSG_CHANGE_AGB_CLOCK_SLAVE = 0x41;
export const LMAN_MSG_RFU_POWER_DOWN = 0x42;
export const LMAN_MSG_MANAGER_STOPPED = 0x43;
export const LMAN_MSG_MANAGER_FORCED_STOPPED_AND_RFU_RESET = 0x44;
export const LMAN_MSG_CHANGE_AGB_CLOCK_MASTER = 0x45;
export const LMAN_MSG_RECV_DATA_REQ_COMPLETED = 0x50;
export const LMAN_MSG_REQ_API_ERROR = 0xf0;
export const LMAN_MSG_WATCH_DOG_TIMER_ERROR = 0xf1;
export const LMAN_MSG_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA = 0xf2;
export const LMAN_MSG_LMAN_API_ERROR_RETURN = 0xf3;
export const LMAN_MSG_RFU_FATAL_ERROR = 0xff;

export const RFU_CHILD_CLOCK_SLAVE_OFF = 0;
export const RFU_CHILD_CLOCK_SLAVE_ON = 1;
export const RFU_CHILD_CLOCK_SLAVE_OFF_REQ = 2;

export const LMAN_STATE_READY = 0x00;
export const LMAN_STATE_SOFT_RESET_AND_CHECK_ID = 0x01;
export const LMAN_STATE_RESET = 0x02;
export const LMAN_STATE_CONFIG_SYSTEM = 0x03;
export const LMAN_STATE_CONFIG_GAME_DATA = 0x04;
export const LMAN_STATE_START_SEARCH_CHILD = 0x05;
export const LMAN_STATE_POLL_SEARCH_CHILD = 0x06;
export const LMAN_STATE_END_SEARCH_CHILD = 0x07;
export const LMAN_STATE_WAIT_RECV_CHILD_NAME = 0x08;
export const LMAN_STATE_START_SEARCH_PARENT = 0x09;
export const LMAN_STATE_POLL_SEARCH_PARENT = 0x0a;
export const LMAN_STATE_END_SEARCH_PARENT = 0x0b;
export const LMAN_STATE_START_CONNECT_PARENT = 0x0c;
export const LMAN_STATE_POLL_CONNECT_PARENT = 0x0d;
export const LMAN_STATE_END_CONNECT_PARENT = 0x0e;
export const LMAN_STATE_SEND_CHILD_NAME = 0x0f;
export const LMAN_STATE_START_LINK_RECOVERY = 0x10;
export const LMAN_STATE_POLL_LINK_RECOVERY = 0x11;
export const LMAN_STATE_END_LINK_RECOVERY = 0x12;
export const LMAN_STATE_MS_CHANGE = 0x13;
export const LMAN_STATE_STOP_MODE = 0x15;
export const LMAN_STATE_BACK_STATE = 0x16;
export const LMAN_FORCED_STOP_AND_RFU_RESET = 0x17;
export const LMAN_STATE_WAIT_CHANGE_CLOCK_MASTER = 0x18;

export const ID_RESET_REQ = 0x10;
export const ID_SYSTEM_CONFIG_REQ = 0x11;
export const ID_GAME_CONFIG_REQ = 0x12;
export const ID_SC_START_REQ = 0x13;
export const ID_SC_POLL_REQ = 0x14;
export const ID_SC_END_REQ = 0x15;
export const ID_SP_START_REQ = 0x16;
export const ID_SP_POLL_REQ = 0x17;
export const ID_SP_END_REQ = 0x18;
export const ID_CP_START_REQ = 0x19;
export const ID_CP_POLL_REQ = 0x1a;
export const ID_CP_END_REQ = 0x1b;
export const ID_CPR_START_REQ = 0x1c;
export const ID_CPR_POLL_REQ = 0x1d;
export const ID_CPR_END_REQ = 0x1e;
export const ID_MS_CHANGE_REQ = 0x1f;
export const ID_STOP_MODE_REQ = 0x20;
export const ID_DISCONNECT_REQ = 0x21;
export const ID_DATA_RX_REQ = 0x22;
export const ID_DATA_TX_REQ = 0x23;
export const ID_DISCONNECTED_AND_CHANGE_REQ = 0x24;
export const ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ = 0x25;

export const SLOT_BUSY_FLAG = 0x80;
export const SLOT_STATE_SEND_FAILED = 3;
export const SLOT_STATE_SEND_SUCCESS = 4;
export const SLOT_STATE_SEND_UNI = 5;
export const SLOT_STATE_RECV_SUCCESS = 6;
export const TYPE_NI = 0;
export const TYPE_NI_SEND = 1;
export const TYPE_NI_RECV = 2;
export const REASON_DISCONNECTED = 1;
export const REASON_LINK_LOSS = 2;

const RN_ACCEPT = 0x01;
const RN_NAME_TIMER_CLEAR = 0x02;
const RN_DISCONNECT = 0x04;
const LINK_RECOVERY_START = 0x01;
const LINK_RECOVERY_EXE = 0x02;
const LINK_RECOVERY_IMPOSSIBLE = 0x04;
const FSP_ON = 0x01;
const FSP_START = 0x02;

export interface InitParam {
  maxMFrame: number;
  MC_TimerCount: number;
  availSlot_flag: number;
  mboot_flag: number;
  serialNo: number;
  gameName: readonly number[] | string;
  userName: readonly number[] | string;
  fastSearchParent_flag: number;
  linkRecovery_enable: number;
  linkRecovery_period: number;
  NI_failCounter_limit: number;
}

export interface RfuPartner {
  id: number;
  serialNo: number;
}

export interface RfuLinkStatus {
  parentChild: number;
  findParentCount: number;
  partner: RfuPartner[];
  linkLossSlotFlag: number;
  connSlotFlag: number;
  getNameFlag: number;
  sendSlotUNIFlag: number;
  sendSlotNIFlag: number;
  recvSlotNIFlag: number;
}

export interface RfuSlotComm {
  state: number;
  dataType: number;
  bmSlot: number;
  failCounter: number;
}

export interface RfuSlotStatus {
  send: RfuSlotComm;
  recv: RfuSlotComm;
}

export interface VBlankTimer {
  active: number;
  count_max: number;
  count: number[];
}

export interface LinkManager {
  acceptSlot_flag: number;
  acceptCount: number;
  childClockSlave_flag: number;
  parentAck_flag: number;
  state: number;
  next_state: number;
  parent_child: number;
  pcswitch_flag: number;
  RFU_powerOn_flag: number;
  linkRecovery_enable: number;
  linkRecovery_start_flag: number;
  fastSearchParent_flag: number;
  connectSlot_flag_old: number;
  reserveDisconnectSlot_flag: number;
  active: number;
  msc_exe_flag: number;
  child_slot: number;
  state_bak: number[];
  param: number[];
  NI_failCounter_limit: number;
  connect_period: number;
  connect_period_initial: number;
  pcswitch_period_bak: number;
  work: number;
  acceptable_serialNo_list: number[];
  nameAcceptTimer: VBlankTimer;
  linkRecoveryTimer: VBlankTimer;
  init_param: InitParam | null;
  LMAN_callback: ((msg: number, paramCount: number) => void) | null;
  MSC_callback: ((reqCommandId: number) => void) | null;
}

export interface AgbRfuLinkManagerRuntime {
  lman: LinkManager;
  gRfuLinkStatus: RfuLinkStatus;
  gRfuSlotStatusNI: RfuSlotStatus[];
  gRfuSlotStatusUNI: RfuSlotStatus[];
  callbacks: Array<{ msg: number; paramCount: number; params: number[] }>;
  mscCalls: number[];
  operations: string[];
  masterSlave: number;
  softResetId: number;
  syncVBlankResult: boolean;
  watchLinkResult: {
    bmLinkLossSlot: number;
    reason: number;
    bmLinkRecoverySlot: number;
  };
  connectParentStatus: { error: number; status: number; childSlot: number };
  connectRecoveryStatus: { error: number; status: number };
  uniParentDracAck: { error: number; ack: number };
  stwiRecvBuffer: number[];
  svc49Results: number[];
  svc4aResults: number[];
}

const emptyComm = (): RfuSlotComm => ({ state: 0, dataType: 0, bmSlot: 0, failCounter: 0 });
const emptySlot = (): RfuSlotStatus => ({ send: emptyComm(), recv: emptyComm() });
const emptyTimer = (): VBlankTimer => ({ active: 0, count_max: 0, count: [0, 0, 0, 0] });

export const createLinkManager = (): LinkManager => ({
  acceptSlot_flag: 0,
  acceptCount: 0,
  childClockSlave_flag: RFU_CHILD_CLOCK_SLAVE_OFF,
  parentAck_flag: 0,
  state: LMAN_STATE_READY,
  next_state: LMAN_STATE_READY,
  parent_child: MODE_NEUTRAL,
  pcswitch_flag: 0,
  RFU_powerOn_flag: 0,
  linkRecovery_enable: 0,
  linkRecovery_start_flag: 0,
  fastSearchParent_flag: 0,
  connectSlot_flag_old: 0,
  reserveDisconnectSlot_flag: 0,
  active: 0,
  msc_exe_flag: 0,
  child_slot: 0,
  state_bak: [0, 0],
  param: [0, 0],
  NI_failCounter_limit: 0,
  connect_period: 0,
  connect_period_initial: 0,
  pcswitch_period_bak: 0,
  work: 0,
  acceptable_serialNo_list: [0xffff],
  nameAcceptTimer: emptyTimer(),
  linkRecoveryTimer: emptyTimer(),
  init_param: null,
  LMAN_callback: null,
  MSC_callback: null
});

export const createAgbRfuLinkManagerRuntime = (
  overrides: Partial<AgbRfuLinkManagerRuntime> = {}
): AgbRfuLinkManagerRuntime => ({
  lman: createLinkManager(),
  gRfuLinkStatus: {
    parentChild: MODE_NEUTRAL,
    findParentCount: 0,
    partner: Array.from({ length: RFU_CHILD_MAX }, () => ({ id: 0, serialNo: 0 })),
    linkLossSlotFlag: 0,
    connSlotFlag: 0,
    getNameFlag: 0,
    sendSlotUNIFlag: 0,
    sendSlotNIFlag: 0,
    recvSlotNIFlag: 0
  },
  gRfuSlotStatusNI: Array.from({ length: RFU_CHILD_MAX }, emptySlot),
  gRfuSlotStatusUNI: Array.from({ length: RFU_CHILD_MAX }, emptySlot),
  callbacks: [],
  mscCalls: [],
  operations: [],
  masterSlave: AGB_CLK_MASTER,
  softResetId: RFU_ID,
  syncVBlankResult: false,
  watchLinkResult: { bmLinkLossSlot: 0, reason: 0, bmLinkRecoverySlot: 0 },
  connectParentStatus: { error: 0, status: 0, childSlot: 0 },
  connectRecoveryStatus: { error: 0, status: 0 },
  uniParentDracAck: { error: 0, ack: 0 },
  stwiRecvBuffer: Array.from({ length: 16 }, () => 0),
  svc49Results: [],
  svc4aResults: [],
  ...overrides
});

const occureCallback = (runtime: AgbRfuLinkManagerRuntime, msg: number, paramCount: number): void => {
  runtime.callbacks.push({ msg, paramCount, params: runtime.lman.param.slice(0, paramCount) });
  runtime.lman.LMAN_callback?.(msg, paramCount);
  runtime.lman.param[0] = 0;
  runtime.lman.param[1] = 0;
};

const clearVariables = (runtime: AgbRfuLinkManagerRuntime): void => {
  const callback = runtime.lman.LMAN_callback;
  const msc = runtime.lman.MSC_callback;
  runtime.lman = { ...runtime.lman, ...createLinkManager(), LMAN_callback: callback, MSC_callback: msc };
};

const managerChangeAgbClockMaster = (runtime: AgbRfuLinkManagerRuntime): void => {
  if (runtime.lman.childClockSlave_flag !== RFU_CHILD_CLOCK_SLAVE_OFF) {
    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_OFF;
    occureCallback(runtime, LMAN_MSG_CHANGE_AGB_CLOCK_MASTER, 0);
  }
};

export const rfu_LMAN_REQBN_softReset_and_checkID = (runtime: AgbRfuLinkManagerRuntime): number => {
  const id = runtime.softResetId;
  runtime.operations.push('rfu_REQBN_softReset_and_checkID');
  if (id === RFU_ID) runtime.lman.RFU_powerOn_flag = 1;
  if (runtime.lman.state !== LMAN_FORCED_STOP_AND_RFU_RESET && runtime.lman.state !== LMAN_STATE_SOFT_RESET_AND_CHECK_ID) {
    runtime.lman.state = LMAN_STATE_READY;
    runtime.lman.next_state = LMAN_STATE_READY;
  }
  runtime.lman.pcswitch_flag = 0;
  runtime.lman.reserveDisconnectSlot_flag = 0;
  runtime.lman.acceptCount = 0;
  runtime.lman.acceptSlot_flag = 0;
  runtime.lman.parent_child = MODE_NEUTRAL;
  managerChangeAgbClockMaster(runtime);
  return id;
};

export const rfu_LMAN_REQ_sendData = (runtime: AgbRfuLinkManagerRuntime, clockChangeFlag: boolean): void => {
  let flag = clockChangeFlag;
  if (runtime.gRfuLinkStatus.parentChild === MODE_CHILD) {
    flag = runtime.lman.childClockSlave_flag === RFU_CHILD_CLOCK_SLAVE_ON;
  } else {
    runtime.lman.parentAck_flag = 0;
  }
  runtime.operations.push(`rfu_REQ_sendData:${flag ? 1 : 0}`);
};

export const rfu_LMAN_initializeManager = (
  runtime: AgbRfuLinkManagerRuntime,
  callback: ((msg: number, paramCount: number) => void) | null,
  mscCallback: ((reqCommandId: number) => void) | null
): number => {
  if (callback == null) return LMAN_ERROR_ILLEGAL_PARAMETER;
  runtime.lman = createLinkManager();
  runtime.lman.parent_child = MODE_NEUTRAL;
  runtime.lman.LMAN_callback = callback;
  runtime.lman.MSC_callback = mscCallback;
  runtime.operations.push('rfu_setMSCCallback:rfu_LMAN_MSC_callback', 'rfu_setREQCallback:rfu_LMAN_REQ_callback');
  return 0;
};

export const rfu_LMAN_initializeRFU = (runtime: AgbRfuLinkManagerRuntime, init: InitParam): void => {
  clearVariables(runtime);
  runtime.lman.state = LMAN_STATE_SOFT_RESET_AND_CHECK_ID;
  runtime.lman.next_state = LMAN_STATE_RESET;
  runtime.lman.init_param = init;
  runtime.lman.linkRecovery_enable = init.linkRecovery_enable;
  runtime.lman.linkRecoveryTimer.count_max = init.linkRecovery_period;
  runtime.lman.NI_failCounter_limit = init.NI_failCounter_limit;
  if (init.fastSearchParent_flag) runtime.lman.fastSearchParent_flag = FSP_ON;
};

export const rfu_LMAN_powerDownRFU = (runtime: AgbRfuLinkManagerRuntime): void => {
  runtime.lman.state = LMAN_STATE_STOP_MODE;
};

const serialListIsTerminated = (serials: readonly number[]): boolean => serials.slice(0, 16).includes(0xffff);

export const rfu_LMAN_establishConnection = (
  runtime: AgbRfuLinkManagerRuntime,
  parentChild: number,
  connectPeriod: number,
  nameAcceptPeriod: number,
  acceptableSerialNoList: number[]
): number => {
  if (runtime.lman.state !== LMAN_STATE_READY && (runtime.lman.state !== LMAN_STATE_WAIT_RECV_CHILD_NAME || parentChild !== MODE_PARENT)) {
    runtime.lman.param[0] = 1;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_MANAGER_BUSY;
  }
  if (runtime.masterSlave === AGB_CLK_SLAVE) {
    runtime.lman.param[0] = 2;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_AGB_CLK_SLAVE;
  }
  if (!serialListIsTerminated(acceptableSerialNoList)) {
    runtime.lman.param[0] = 4;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_ILLEGAL_PARAMETER;
  }
  let mode = parentChild;
  let period = connectPeriod;
  if (mode > MODE_PARENT) {
    runtime.lman.pcswitch_flag = PCSWITCH_1ST_SC_START;
    mode = MODE_PARENT;
    period = 0;
  } else {
    runtime.lman.pcswitch_flag = 0;
  }
  if (mode !== MODE_CHILD) {
    runtime.lman.state = LMAN_STATE_START_SEARCH_CHILD;
  } else {
    runtime.lman.state = LMAN_STATE_START_SEARCH_PARENT;
    if (runtime.lman.fastSearchParent_flag) runtime.lman.fastSearchParent_flag = FSP_START;
  }
  runtime.lman.parent_child = mode;
  runtime.lman.connect_period = period;
  runtime.lman.connect_period_initial = 0;
  runtime.lman.nameAcceptTimer.count_max = nameAcceptPeriod;
  runtime.lman.acceptable_serialNo_list = acceptableSerialNoList;
  return 0;
};

export const rfu_LMAN_CHILD_connectParent = (
  runtime: AgbRfuLinkManagerRuntime,
  parentId: number,
  connectPeriod: number
): number => {
  if (runtime.lman.state !== LMAN_STATE_READY && (runtime.lman.state < 9 || runtime.lman.state > 11)) {
    runtime.lman.param[0] = 1;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_MANAGER_BUSY;
  }
  if (runtime.masterSlave === AGB_CLK_SLAVE) {
    runtime.lman.param[0] = 2;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_AGB_CLK_SLAVE;
  }
  const index = runtime.gRfuLinkStatus.partner.slice(0, runtime.gRfuLinkStatus.findParentCount).findIndex((p) => p.id === parentId);
  if (runtime.gRfuLinkStatus.findParentCount === 0 || index === -1) {
    runtime.lman.param[0] = 3;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_PID_NOT_FOUND;
  }
  if (runtime.lman.state === LMAN_STATE_READY || runtime.lman.state === LMAN_STATE_START_SEARCH_PARENT) {
    runtime.lman.state = LMAN_STATE_START_CONNECT_PARENT;
    runtime.lman.next_state = LMAN_STATE_POLL_CONNECT_PARENT;
  } else {
    runtime.lman.state = LMAN_STATE_END_SEARCH_PARENT;
    runtime.lman.next_state = LMAN_STATE_START_CONNECT_PARENT;
  }
  runtime.lman.work = parentId;
  runtime.lman.connect_period = connectPeriod;
  runtime.lman.connect_period_initial = 0;
  if (runtime.lman.pcswitch_flag !== 0) runtime.lman.pcswitch_flag = PCSWITCH_CP;
  return 0;
};

const disconnect = (runtime: AgbRfuLinkManagerRuntime, mask: number): void => {
  const active = runtime.lman.active;
  runtime.lman.active = 1;
  runtime.operations.push(`rfu_REQ_disconnect:${mask}`, 'rfu_waitREQComplete');
  runtime.lman.active = active;
};

export const rfu_LMAN_stopManager = (runtime: AgbRfuLinkManagerRuntime, forced: boolean): void => {
  let msg = 0;
  runtime.lman.pcswitch_flag = 0;
  if (forced) {
    clearVariables(runtime);
    runtime.lman.state = LMAN_FORCED_STOP_AND_RFU_RESET;
    return;
  }
  switch (runtime.lman.state) {
    case LMAN_STATE_START_SEARCH_CHILD:
      runtime.lman.state = LMAN_STATE_WAIT_RECV_CHILD_NAME;
      runtime.lman.next_state = LMAN_STATE_READY;
      msg = LMAN_MSG_SEARCH_CHILD_PERIOD_EXPIRED;
      break;
    case LMAN_STATE_POLL_SEARCH_CHILD:
      runtime.lman.state = LMAN_STATE_END_SEARCH_CHILD;
      runtime.lman.next_state = LMAN_STATE_WAIT_RECV_CHILD_NAME;
      break;
    case LMAN_STATE_END_SEARCH_CHILD:
      runtime.lman.next_state = LMAN_STATE_WAIT_RECV_CHILD_NAME;
      break;
    case LMAN_STATE_WAIT_RECV_CHILD_NAME:
      break;
    case LMAN_STATE_START_SEARCH_PARENT:
      runtime.lman.state = LMAN_STATE_READY;
      runtime.lman.next_state = LMAN_STATE_READY;
      msg = LMAN_MSG_SEARCH_PARENT_PERIOD_EXPIRED;
      break;
    case LMAN_STATE_POLL_SEARCH_PARENT:
      runtime.lman.state = LMAN_STATE_END_SEARCH_PARENT;
      runtime.lman.next_state = LMAN_STATE_READY;
      break;
    case LMAN_STATE_END_SEARCH_PARENT:
      runtime.lman.next_state = LMAN_STATE_READY;
      break;
    case LMAN_STATE_START_CONNECT_PARENT:
      runtime.lman.state = LMAN_STATE_READY;
      runtime.lman.next_state = LMAN_STATE_READY;
      msg = LMAN_MSG_CONNECT_PARENT_FAILED;
      break;
    case LMAN_STATE_POLL_CONNECT_PARENT:
      runtime.lman.state = LMAN_STATE_END_CONNECT_PARENT;
      break;
    case LMAN_STATE_START_LINK_RECOVERY:
      runtime.lman.state = runtime.lman.state_bak[0];
      runtime.lman.next_state = runtime.lman.state_bak[1];
      disconnect(runtime, runtime.gRfuLinkStatus.linkLossSlotFlag);
      runtime.lman.param[0] = runtime.gRfuLinkStatus.linkLossSlotFlag;
      occureCallback(runtime, LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED, 1);
      return;
    case LMAN_STATE_POLL_LINK_RECOVERY:
      runtime.lman.state = LMAN_STATE_END_LINK_RECOVERY;
      break;
    case LMAN_STATE_END_LINK_RECOVERY:
      break;
    default:
      runtime.lman.state = LMAN_STATE_READY;
      runtime.lman.next_state = LMAN_STATE_READY;
      msg = LMAN_MSG_MANAGER_STOPPED;
      break;
  }
  if (runtime.lman.state === LMAN_STATE_READY) occureCallback(runtime, msg, 0);
};

export const rfu_LMAN_linkWatcher = (runtime: AgbRfuLinkManagerRuntime, reqCommandId: number): boolean => {
  runtime.operations.push(`rfu_REQBN_watchLink:${reqCommandId}`);
  const { bmLinkLossSlot, reason, bmLinkRecoverySlot } = runtime.watchLinkResult;
  let disconnected = false;
  if (bmLinkLossSlot) {
    runtime.lman.param[0] = bmLinkLossSlot;
    runtime.lman.param[1] = reason;
    if (runtime.lman.linkRecovery_enable) {
      runtime.lman.linkRecovery_start_flag = LINK_RECOVERY_START;
      if (runtime.lman.parent_child === MODE_CHILD && reason === REASON_DISCONNECTED) {
        runtime.lman.linkRecovery_start_flag = LINK_RECOVERY_IMPOSSIBLE;
      }
      if (runtime.lman.linkRecovery_start_flag === LINK_RECOVERY_START) {
        for (let i = 0; i < RFU_CHILD_MAX; i++) {
          if ((bmLinkLossSlot >> i) & 1) {
            runtime.lman.linkRecoveryTimer.active |= 1 << i;
            runtime.lman.linkRecoveryTimer.count[i] = runtime.lman.linkRecoveryTimer.count_max;
          }
        }
        occureCallback(runtime, LMAN_MSG_LINK_LOSS_DETECTED_AND_START_RECOVERY, 1);
      } else {
        runtime.lman.linkRecovery_start_flag = 0;
        disconnect(runtime, bmLinkLossSlot);
        disconnected = true;
        occureCallback(runtime, LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED, 1);
      }
    } else {
      disconnect(runtime, bmLinkLossSlot);
      disconnected = true;
      occureCallback(runtime, LMAN_MSG_LINK_LOSS_DETECTED_AND_DISCONNECTED, 2);
    }
    managerChangeAgbClockMaster(runtime);
  }
  if (runtime.gRfuLinkStatus.parentChild === MODE_PARENT) {
    if (bmLinkRecoverySlot) {
      for (let i = 0; i < RFU_CHILD_MAX; i++) {
        if (((runtime.lman.linkRecoveryTimer.active >> i) & 1) && ((bmLinkRecoverySlot >> i) & 1)) {
          runtime.lman.linkRecoveryTimer.count[i] = 0;
        }
      }
      runtime.lman.linkRecoveryTimer.active &= ~bmLinkRecoverySlot;
      runtime.lman.param[0] = bmLinkRecoverySlot;
      occureCallback(runtime, LMAN_MSG_LINK_RECOVERY_SUCCESSED, 1);
    }
    let bmDisconnectSlot = 0;
    for (let i = 0; i < RFU_CHILD_MAX; i++) {
      if (((runtime.lman.linkRecoveryTimer.active >> i) & 1) && runtime.lman.linkRecoveryTimer.count[i] && --runtime.lman.linkRecoveryTimer.count[i] === 0) {
        runtime.lman.linkRecoveryTimer.active &= ~(1 << i);
        bmDisconnectSlot |= 1 << i;
      }
    }
    if (bmDisconnectSlot) {
      disconnect(runtime, bmDisconnectSlot);
      disconnected = true;
      runtime.lman.param[0] = bmDisconnectSlot;
      occureCallback(runtime, LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED, 1);
    }
    if (!runtime.lman.linkRecoveryTimer.active) runtime.lman.linkRecovery_start_flag = 0;
  }
  return disconnected;
};

export const rfu_LMAN_syncVBlank = (runtime: AgbRfuLinkManagerRuntime): void => {
  runtime.operations.push('rfu_syncVBlank');
  if (runtime.syncVBlankResult) {
    occureCallback(runtime, LMAN_MSG_WATCH_DOG_TIMER_ERROR, 0);
    managerChangeAgbClockMaster(runtime);
  }
};

const settingPCSWITCH = (runtime: AgbRfuLinkManagerRuntime, rand: number): void => {
  if (runtime.lman.pcswitch_flag === PCSWITCH_3RD_SC_START) {
    runtime.lman.parent_child = MODE_PARENT;
    runtime.lman.state = LMAN_STATE_START_SEARCH_CHILD;
    runtime.lman.connect_period = runtime.lman.pcswitch_period_bak;
    runtime.lman.connect_period_initial = 0;
    runtime.lman.pcswitch_flag = runtime.lman.connect_period ? PCSWITCH_3RD_SC : PCSWITCH_1ST_SC_START;
  }
  if (runtime.lman.pcswitch_flag === PCSWITCH_1ST_SC_START) {
    runtime.lman.parent_child = MODE_PARENT;
    runtime.lman.state = LMAN_STATE_START_SEARCH_CHILD;
    runtime.lman.connect_period = rand % 285;
    runtime.lman.pcswitch_period_bak = 285 - runtime.lman.connect_period;
    runtime.lman.connect_period_initial = 0;
    runtime.lman.pcswitch_flag = runtime.lman.connect_period ? PCSWITCH_1ST_SC : PCSWITCH_2ND_SP_START;
  }
  if (runtime.lman.pcswitch_flag === PCSWITCH_2ND_SP_START) {
    runtime.lman.parent_child = MODE_CHILD;
    runtime.lman.connect_period = PCSWITCH_SP_PERIOD;
    runtime.lman.connect_period_initial = 0;
    runtime.lman.pcswitch_flag = PCSWITCH_2ND_SP;
    runtime.lman.state = LMAN_STATE_START_SEARCH_PARENT;
  }
};

export const rfu_LMAN_endManager = (runtime: AgbRfuLinkManagerRuntime): void => {
  const callback = runtime.lman.LMAN_callback;
  const msc = runtime.lman.MSC_callback;
  runtime.lman = { ...createLinkManager(), LMAN_callback: callback, MSC_callback: msc };
  runtime.lman.parent_child = MODE_NEUTRAL;
};

export const rfu_LMAN_clearVariables = (runtime: AgbRfuLinkManagerRuntime): void => {
  clearVariables(runtime);
};

export const rfu_LMAN_PARENT_stopWaitLinkRecoveryAndDisconnect = (
  runtime: AgbRfuLinkManagerRuntime,
  bmTargetSlot: number
): void => {
  if ((bmTargetSlot & runtime.lman.linkRecoveryTimer.active) === 0) {
    return;
  }

  runtime.lman.linkRecoveryTimer.active &= ~bmTargetSlot;
  for (let i = 0; i < RFU_CHILD_MAX; i += 1) {
    if ((bmTargetSlot >> i) & 1) {
      runtime.lman.linkRecoveryTimer.count[i] = 0;
    }
  }

  const disconnected = runtime.gRfuLinkStatus.linkLossSlotFlag & bmTargetSlot;
  if (disconnected) {
    disconnect(runtime, disconnected);
  }
  runtime.lman.param[0] = disconnected;
  occureCallback(runtime, LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED, disconnected);
};

export const rfu_LMAN_settingPCSWITCH = (runtime: AgbRfuLinkManagerRuntime, rand: number): void => {
  settingPCSWITCH(runtime, rand);
};

export const rfu_LMAN_occureCallback = (
  runtime: AgbRfuLinkManagerRuntime,
  msg: number,
  paramCount: number
): void => {
  occureCallback(runtime, msg, paramCount);
};

export const rfu_LMAN_disconnect = (runtime: AgbRfuLinkManagerRuntime, bmDisconnectSlot: number): void => {
  disconnect(runtime, bmDisconnectSlot);
};

export const rfu_LMAN_setLMANCallback = (
  runtime: AgbRfuLinkManagerRuntime,
  callback: ((msg: number, paramCount: number) => void) | null
): void => {
  runtime.lman.LMAN_callback = callback;
};

export const rfu_LMAN_managerChangeAgbClockMaster = (runtime: AgbRfuLinkManagerRuntime): void => {
  managerChangeAgbClockMaster(runtime);
};

export const rfu_LMAN_manager_entity = (runtime: AgbRfuLinkManagerRuntime, rand: number): void => {
  if (runtime.lman.LMAN_callback == null && runtime.lman.state !== LMAN_STATE_READY) {
    runtime.lman.state = LMAN_STATE_READY;
    return;
  }
  if (runtime.lman.pcswitch_flag) settingPCSWITCH(runtime, rand);
  if (runtime.lman.state !== LMAN_STATE_READY) {
    runtime.operations.push('rfu_waitREQComplete');
    runtime.lman.active = 1;
    const opByState: Record<number, string> = {
      [LMAN_STATE_RESET]: 'rfu_REQ_reset',
      [LMAN_STATE_CONFIG_SYSTEM]: 'rfu_REQ_configSystem',
      [LMAN_STATE_CONFIG_GAME_DATA]: 'rfu_REQ_configGameData',
      [LMAN_STATE_START_SEARCH_CHILD]: 'rfu_REQ_startSearchChild',
      [LMAN_STATE_POLL_SEARCH_CHILD]: 'rfu_REQ_pollSearchChild',
      [LMAN_STATE_END_SEARCH_CHILD]: 'rfu_REQ_endSearchChild',
      [LMAN_STATE_START_SEARCH_PARENT]: 'rfu_REQ_startSearchParent',
      [LMAN_STATE_POLL_SEARCH_PARENT]: 'rfu_REQ_pollSearchParent',
      [LMAN_STATE_END_SEARCH_PARENT]: 'rfu_REQ_endSearchParent',
      [LMAN_STATE_START_CONNECT_PARENT]: `rfu_REQ_startConnectParent:${runtime.lman.work}`,
      [LMAN_STATE_POLL_CONNECT_PARENT]: 'rfu_REQ_pollConnectParent',
      [LMAN_STATE_END_CONNECT_PARENT]: 'rfu_REQ_endConnectParent',
      [LMAN_STATE_START_LINK_RECOVERY]: `rfu_REQ_CHILD_startConnectRecovery:${runtime.gRfuLinkStatus.linkLossSlotFlag}`,
      [LMAN_STATE_POLL_LINK_RECOVERY]: 'rfu_REQ_CHILD_pollConnectRecovery',
      [LMAN_STATE_END_LINK_RECOVERY]: 'rfu_REQ_CHILD_endConnectRecovery',
      [LMAN_STATE_MS_CHANGE]: 'rfu_REQ_changeMasterSlave',
      [LMAN_STATE_STOP_MODE]: 'rfu_REQ_stopMode'
    };
    if (runtime.lman.state === LMAN_FORCED_STOP_AND_RFU_RESET) {
      const ok = rfu_LMAN_REQBN_softReset_and_checkID(runtime) === RFU_ID;
      runtime.lman.state = LMAN_STATE_READY;
      runtime.lman.next_state = LMAN_STATE_READY;
      occureCallback(runtime, ok ? LMAN_MSG_MANAGER_FORCED_STOPPED_AND_RFU_RESET : LMAN_MSG_RFU_FATAL_ERROR, 0);
    } else if (runtime.lman.state === LMAN_STATE_SOFT_RESET_AND_CHECK_ID) {
      if (rfu_LMAN_REQBN_softReset_and_checkID(runtime) === RFU_ID) {
        runtime.lman.state = runtime.lman.next_state;
        runtime.lman.next_state = LMAN_STATE_CONFIG_SYSTEM;
      } else {
        runtime.lman.state = LMAN_STATE_READY;
        runtime.lman.next_state = LMAN_STATE_READY;
        occureCallback(runtime, LMAN_MSG_RFU_FATAL_ERROR, 0);
      }
    } else if (opByState[runtime.lman.state]) {
      runtime.operations.push(opByState[runtime.lman.state]);
    }
    runtime.operations.push('rfu_waitREQComplete');
    runtime.lman.active = 0;
  }
  if (runtime.gRfuLinkStatus.parentChild === MODE_PARENT && rfu_LMAN_linkWatcher(runtime, 0)) return;
  rfu_LMAN_PARENT_checkRecvChildName(runtime);
  rfu_LMAN_CHILD_checkSendChildName(runtime);
  rfu_LMAN_CHILD_linkRecoveryProcess(runtime);
  rfu_LMAN_checkNICommunicateStatus(runtime);
};

export const rfu_LMAN_REQ_callback = (runtime: AgbRfuLinkManagerRuntime, reqCommandId: number, reqResult: number): void => {
  let status = 0;
  if (runtime.lman.active !== 0) {
    runtime.lman.active = 0;
    switch (reqCommandId) {
      case ID_RESET_REQ:
        if (reqResult === 0) {
          runtime.lman.state = runtime.lman.next_state;
          runtime.lman.next_state = LMAN_STATE_CONFIG_GAME_DATA;
        }
        break;
      case ID_SYSTEM_CONFIG_REQ:
        if (reqResult === 0) {
          runtime.lman.state = runtime.lman.next_state;
          runtime.lman.next_state = LMAN_STATE_READY;
        }
        break;
      case ID_GAME_CONFIG_REQ:
        if (reqResult === 0) {
          runtime.lman.state = LMAN_STATE_READY;
          runtime.lman.next_state = LMAN_STATE_READY;
          occureCallback(runtime, LMAN_MSG_INITIALIZE_COMPLETED, 0);
        }
        break;
      case ID_SC_START_REQ:
        if (reqResult === 0) runtime.lman.state = runtime.lman.next_state = LMAN_STATE_POLL_SEARCH_CHILD;
        break;
      case ID_SC_POLL_REQ:
        if (runtime.lman.connect_period) {
          if ((runtime.svc49Results.shift() ?? 0) !== 0 && runtime.lman.connect_period_initial < 300) {
            if (runtime.lman.connect_period > 1) runtime.lman.connect_period--;
            else runtime.lman.connect_period_initial++;
          } else if (--runtime.lman.connect_period === 0) {
            runtime.lman.state = LMAN_STATE_END_SEARCH_CHILD;
            runtime.lman.next_state = LMAN_STATE_WAIT_RECV_CHILD_NAME;
          }
        }
        break;
      case ID_SC_END_REQ:
        if (reqResult === 0) {
          runtime.lman.state = runtime.lman.next_state;
          runtime.lman.next_state = LMAN_STATE_READY;
          if (runtime.lman.pcswitch_flag === 0) occureCallback(runtime, LMAN_MSG_SEARCH_CHILD_PERIOD_EXPIRED, 0);
        }
        break;
      case ID_SP_START_REQ:
        if (reqResult === 0) {
          if (runtime.lman.fastSearchParent_flag === FSP_ON && runtime.lman.connect_period > 1) runtime.lman.connect_period--;
          runtime.lman.state = runtime.lman.next_state = LMAN_STATE_POLL_SEARCH_PARENT;
        }
        break;
      case ID_SP_POLL_REQ:
        if (reqResult === 0) {
          status = rfu_LMAN_CHILD_checkEnableParentCandidate(runtime);
          runtime.lman.param[0] = status;
          if (status) occureCallback(runtime, LMAN_MSG_PARENT_FOUND, 1);
        }
        if (runtime.lman.connect_period) {
          if ((runtime.svc4aResults.shift() ?? 0) !== 0 && runtime.lman.connect_period_initial < 300) {
            if (runtime.lman.connect_period > 1) runtime.lman.connect_period--;
            else runtime.lman.connect_period_initial++;
          } else if (--runtime.lman.connect_period === 0) {
            runtime.lman.state = LMAN_STATE_END_SEARCH_PARENT;
            runtime.lman.next_state = LMAN_STATE_READY;
          }
        }
        break;
      case ID_SP_END_REQ:
        if (reqResult === 0) runtime.lman.state = runtime.lman.next_state;
        break;
      case ID_CP_START_REQ:
        if (reqResult === 0) runtime.lman.state = runtime.lman.next_state = LMAN_STATE_POLL_CONNECT_PARENT;
        break;
      case ID_CP_POLL_REQ:
        if (reqResult === 0 && runtime.connectParentStatus.error === 0 && runtime.connectParentStatus.status === 0) {
          runtime.lman.child_slot = runtime.connectParentStatus.childSlot;
          runtime.lman.state = LMAN_STATE_END_CONNECT_PARENT;
        }
        if (runtime.lman.connect_period && --runtime.lman.connect_period === 0) runtime.lman.state = LMAN_STATE_END_CONNECT_PARENT;
        break;
      case ID_CP_END_REQ:
        if (reqResult === 0 && runtime.connectParentStatus.error === 0) {
          runtime.lman.child_slot = runtime.connectParentStatus.childSlot;
          if (runtime.connectParentStatus.status === 0) {
            runtime.lman.state = LMAN_STATE_MS_CHANGE;
            runtime.lman.next_state = LMAN_STATE_SEND_CHILD_NAME;
            runtime.lman.work = LMAN_MSG_CONNECT_PARENT_SUCCESSED;
            runtime.lman.param[0] = runtime.lman.child_slot;
          } else {
            runtime.lman.state = LMAN_STATE_READY;
            runtime.lman.next_state = LMAN_STATE_READY;
            runtime.lman.work = LMAN_MSG_CONNECT_PARENT_FAILED;
            runtime.lman.param[0] = runtime.connectParentStatus.status;
          }
          occureCallback(runtime, runtime.lman.work, 1);
          runtime.lman.work = 0;
        }
        break;
      case ID_MS_CHANGE_REQ:
        if (reqResult === 0) {
          if (runtime.lman.next_state === LMAN_STATE_BACK_STATE) {
            runtime.lman.state = runtime.lman.state_bak[0];
            runtime.lman.next_state = runtime.lman.state_bak[1];
          } else if (runtime.lman.next_state === LMAN_STATE_SEND_CHILD_NAME) {
            runtime.lman.state = runtime.lman.next_state;
            runtime.lman.nameAcceptTimer.active |= 1 << runtime.lman.child_slot;
            runtime.lman.nameAcceptTimer.count[runtime.lman.child_slot] = runtime.lman.nameAcceptTimer.count_max;
            runtime.operations.push(`rfu_clearSlot:${TYPE_NI_SEND}:${runtime.lman.child_slot}`, `rfu_NI_CHILD_setSendGameName:${runtime.lman.child_slot}:14`);
          }
          runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_ON;
          occureCallback(runtime, LMAN_MSG_CHANGE_AGB_CLOCK_SLAVE, 0);
        }
        break;
      case ID_STOP_MODE_REQ:
        if (reqResult === 0) {
          runtime.lman.state = LMAN_STATE_READY;
          runtime.lman.next_state = LMAN_STATE_READY;
          occureCallback(runtime, LMAN_MSG_RFU_POWER_DOWN, 0);
        }
        break;
    }
    runtime.lman.active = 1;
  }
  if (reqCommandId === ID_DISCONNECT_REQ && reqResult === 0) {
    runtime.lman.param[0] = runtime.stwiRecvBuffer[8] ?? 0;
    rfu_LMAN_reflectCommunicationStatus(runtime, runtime.lman.param[0]);
    runtime.lman.acceptSlot_flag &= ~runtime.lman.param[0];
    if (runtime.lman.active === 0) occureCallback(runtime, LMAN_MSG_LINK_DISCONNECTED_BY_USER, 1);
  } else if (reqCommandId === ID_DATA_RX_REQ) {
    rfu_LMAN_CHILD_checkSendChildName2(runtime);
    if (runtime.gRfuLinkStatus.parentChild !== MODE_NEUTRAL) occureCallback(runtime, LMAN_MSG_RECV_DATA_REQ_COMPLETED, 0);
  } else if ((reqCommandId === ID_RESET_REQ || reqCommandId === ID_STOP_MODE_REQ) && reqResult === 0) {
    runtime.lman.reserveDisconnectSlot_flag = 0;
    runtime.lman.acceptCount = 0;
    runtime.lman.acceptSlot_flag = 0;
    runtime.lman.parent_child = MODE_NEUTRAL;
    managerChangeAgbClockMaster(runtime);
  }
  if (reqResult !== 0) {
    runtime.lman.param[0] = reqCommandId;
    runtime.lman.param[1] = reqResult;
    if (runtime.lman.active) runtime.lman.state = runtime.lman.next_state = LMAN_STATE_READY;
    occureCallback(runtime, LMAN_MSG_REQ_API_ERROR, 2);
    managerChangeAgbClockMaster(runtime);
  }
  if (reqCommandId === ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ) {
    occureCallback(runtime, LMAN_MSG_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA, 0);
    managerChangeAgbClockMaster(runtime);
  }
};

export const rfu_LMAN_MSC_callback = (runtime: AgbRfuLinkManagerRuntime, reqCommandId: number): void => {
  const activeBak = runtime.lman.active;
  runtime.lman.active = 0;
  runtime.lman.msc_exe_flag = 1;
  if (runtime.gRfuLinkStatus.parentChild === MODE_CHILD) {
    rfu_LMAN_linkWatcher(runtime, reqCommandId);
    if (runtime.lman.childClockSlave_flag !== RFU_CHILD_CLOCK_SLAVE_ON) {
      managerChangeAgbClockMaster(runtime);
      runtime.lman.msc_exe_flag = 0;
      runtime.lman.active = activeBak;
      return;
    }
  } else if (runtime.uniParentDracAck.error === 0) {
    runtime.lman.parentAck_flag |= runtime.uniParentDracAck.ack;
  }
  runtime.lman.MSC_callback?.(reqCommandId);
  runtime.mscCalls.push(reqCommandId);
  runtime.operations.push('rfu_waitREQComplete');
  if (runtime.lman.childClockSlave_flag === RFU_CHILD_CLOCK_SLAVE_OFF_REQ) managerChangeAgbClockMaster(runtime);
  runtime.lman.msc_exe_flag = 0;
  runtime.lman.active = activeBak;
};

export const rfu_LMAN_PARENT_checkRecvChildName = (runtime: AgbRfuLinkManagerRuntime): void => {
  const lman = runtime.lman;
  if (![LMAN_STATE_START_SEARCH_CHILD, LMAN_STATE_POLL_SEARCH_CHILD, LMAN_STATE_END_SEARCH_CHILD, LMAN_STATE_WAIT_RECV_CHILD_NAME].includes(lman.state)) return;
  const newSlot = ((runtime.gRfuLinkStatus.connSlotFlag ^ lman.connectSlot_flag_old) & runtime.gRfuLinkStatus.connSlotFlag) & ~runtime.gRfuLinkStatus.getNameFlag;
  lman.connectSlot_flag_old = runtime.gRfuLinkStatus.connSlotFlag;
  if (newSlot) {
    lman.param[0] = newSlot;
    occureCallback(runtime, LMAN_MSG_NEW_CHILD_CONNECT_DETECTED, 1);
  }
  let newAcceptSlot = 0;
  for (let i = 0; i < RFU_CHILD_MAX; i++) {
    const tgtSlot = 1 << i;
    let flags = 0;
    if (newSlot & tgtSlot) {
      lman.nameAcceptTimer.count[i] = lman.nameAcceptTimer.count_max;
      lman.nameAcceptTimer.active |= tgtSlot;
    } else if (lman.nameAcceptTimer.active & tgtSlot) {
      const recv = runtime.gRfuSlotStatusNI[i].recv;
      if (recv.state === SLOT_STATE_RECV_SUCCESS && recv.dataType === 1) {
        flags = RN_NAME_TIMER_CLEAR;
        if (lman.acceptable_serialNo_list.includes(runtime.gRfuLinkStatus.partner[i].serialNo)) {
          lman.acceptSlot_flag |= tgtSlot;
          lman.acceptCount++;
          newAcceptSlot |= tgtSlot;
          flags |= RN_ACCEPT;
        }
        if (!(flags & RN_ACCEPT)) flags |= RN_DISCONNECT;
      } else if (--lman.nameAcceptTimer.count[i] === 0) {
        flags = RN_NAME_TIMER_CLEAR | RN_DISCONNECT;
      }
      if (flags & RN_NAME_TIMER_CLEAR) {
        lman.nameAcceptTimer.active &= ~tgtSlot;
        lman.nameAcceptTimer.count[i] = 0;
        runtime.operations.push(`rfu_clearSlot:${TYPE_NI_RECV}:${i}`);
      }
      if (flags & RN_DISCONNECT) lman.reserveDisconnectSlot_flag |= tgtSlot;
    }
  }
  if (newAcceptSlot) {
    lman.param[0] = newAcceptSlot;
    occureCallback(runtime, LMAN_MSG_NEW_CHILD_CONNECT_ACCEPTED, 1);
  }
  if (lman.reserveDisconnectSlot_flag) {
    let flags = 1;
    if (runtime.gRfuLinkStatus.sendSlotUNIFlag && (lman.parentAck_flag & lman.acceptSlot_flag) !== lman.acceptSlot_flag) flags = 0;
    if (flags) {
      disconnect(runtime, lman.reserveDisconnectSlot_flag);
      lman.param[0] = lman.reserveDisconnectSlot_flag;
      lman.reserveDisconnectSlot_flag = 0;
      occureCallback(runtime, LMAN_MSG_NEW_CHILD_CONNECT_REJECTED, 1);
    }
  }
  if (lman.nameAcceptTimer.active === 0 && lman.state === LMAN_STATE_WAIT_RECV_CHILD_NAME && lman.pcswitch_flag === 0) {
    lman.state = LMAN_STATE_READY;
    lman.next_state = LMAN_STATE_READY;
    occureCallback(runtime, LMAN_MSG_END_WAIT_CHILD_NAME, 0);
  }
};

export const rfu_LMAN_CHILD_checkSendChildName = (runtime: AgbRfuLinkManagerRuntime): void => {
  const lman = runtime.lman;
  if (lman.state === LMAN_STATE_SEND_CHILD_NAME) {
    if (--lman.nameAcceptTimer.count[lman.child_slot] === 0 || runtime.gRfuSlotStatusNI[lman.child_slot].send.state === SLOT_STATE_SEND_FAILED) {
      rfu_LMAN_requestChangeAgbClockMaster(runtime);
      lman.state = LMAN_STATE_WAIT_CHANGE_CLOCK_MASTER;
      runtime.operations.push(`rfu_clearSlot:${TYPE_NI_SEND}:${lman.child_slot}`);
      lman.nameAcceptTimer.active &= ~(1 << lman.child_slot);
      lman.nameAcceptTimer.count[lman.child_slot] = 0;
    }
  }
  if (lman.state === LMAN_STATE_WAIT_CHANGE_CLOCK_MASTER) {
    if (lman.childClockSlave_flag === RFU_CHILD_CLOCK_SLAVE_ON) rfu_LMAN_requestChangeAgbClockMaster(runtime);
    if (lman.childClockSlave_flag === RFU_CHILD_CLOCK_SLAVE_OFF) {
      lman.state = LMAN_STATE_READY;
      lman.next_state = LMAN_STATE_READY;
      disconnect(runtime, runtime.gRfuLinkStatus.connSlotFlag | runtime.gRfuLinkStatus.linkLossSlotFlag);
      lman.param[0] = 0;
      occureCallback(runtime, LMAN_MSG_CHILD_NAME_SEND_FAILED_AND_DISCONNECTED, 1);
    }
  }
};

export const rfu_LMAN_CHILD_checkSendChildName2 = (runtime: AgbRfuLinkManagerRuntime): void => {
  const lman = runtime.lman;
  if (lman.state === LMAN_STATE_SEND_CHILD_NAME && runtime.gRfuSlotStatusNI[lman.child_slot].send.state === SLOT_STATE_SEND_SUCCESS) {
    lman.state = LMAN_STATE_READY;
    lman.next_state = LMAN_STATE_READY;
    runtime.operations.push(`rfu_clearSlot:${TYPE_NI_SEND}:${lman.child_slot}`);
    lman.nameAcceptTimer.active &= ~(1 << lman.child_slot);
    lman.nameAcceptTimer.count[lman.child_slot] = 0;
    occureCallback(runtime, LMAN_MSG_CHILD_NAME_SEND_COMPLETED, 0);
  }
};

export const rfu_LMAN_CHILD_linkRecoveryProcess = (runtime: AgbRfuLinkManagerRuntime): void => {
  if (runtime.lman.parent_child === MODE_CHILD && runtime.lman.linkRecovery_start_flag === LINK_RECOVERY_START) {
    runtime.lman.state_bak[0] = runtime.lman.state;
    runtime.lman.state_bak[1] = runtime.lman.next_state;
    runtime.lman.state = LMAN_STATE_START_LINK_RECOVERY;
    runtime.lman.next_state = LMAN_STATE_POLL_LINK_RECOVERY;
    runtime.lman.linkRecovery_start_flag = LINK_RECOVERY_EXE;
  }
};

export const rfu_LMAN_CHILD_checkEnableParentCandidate = (runtime: AgbRfuLinkManagerRuntime): number => {
  let flags = 0;
  for (let i = 0; i < runtime.gRfuLinkStatus.findParentCount; i++) {
    if (runtime.lman.acceptable_serialNo_list.includes(runtime.gRfuLinkStatus.partner[i].serialNo)) flags |= 1 << i;
  }
  return flags;
};

export const rfu_LMAN_reflectCommunicationStatus = (runtime: AgbRfuLinkManagerRuntime, disconnectedMask: number): void => {
  if (runtime.gRfuLinkStatus.sendSlotNIFlag) {
    for (let i = 0; i < RFU_CHILD_MAX; i++) {
      const send = runtime.gRfuSlotStatusNI[i].send;
      if ((send.state & SLOT_BUSY_FLAG) && (send.bmSlot & disconnectedMask)) {
        send.bmSlot &= ~disconnectedMask;
        runtime.operations.push(`rfu_changeSendTarget:${TYPE_NI}:${i}:${send.bmSlot}`);
      }
    }
  }
  if (runtime.gRfuLinkStatus.recvSlotNIFlag) {
    for (let i = 0; i < RFU_CHILD_MAX; i++) {
      const recv = runtime.gRfuSlotStatusNI[i].recv;
      if ((recv.state & SLOT_BUSY_FLAG) && (recv.bmSlot & disconnectedMask)) {
        runtime.operations.push(`rfu_NI_stopReceivingData:${i}`);
      }
    }
  }
  if (runtime.gRfuLinkStatus.sendSlotUNIFlag) {
    runtime.gRfuLinkStatus.sendSlotUNIFlag &= ~disconnectedMask;
    for (let i = 0; i < RFU_CHILD_MAX; i++) {
      const send = runtime.gRfuSlotStatusUNI[i].send;
      if (send.state === SLOT_STATE_SEND_UNI && (disconnectedMask & send.bmSlot)) send.bmSlot &= ~disconnectedMask;
    }
  }
};

export const rfu_LMAN_checkNICommunicateStatus = (runtime: AgbRfuLinkManagerRuntime): void => {
  if (!runtime.lman.NI_failCounter_limit) return;
  if (runtime.gRfuLinkStatus.sendSlotNIFlag) {
    for (let i = 0; i < RFU_CHILD_MAX; i++) {
      const send = runtime.gRfuSlotStatusNI[i].send;
      if (send.state & SLOT_BUSY_FLAG) {
        let flags = 0;
        for (let j = 0; j < RFU_CHILD_MAX; j++) {
          if (((send.bmSlot >> j) & 1) && runtime.gRfuSlotStatusNI[j].send.failCounter > runtime.lman.NI_failCounter_limit) flags |= 1 << j;
          if (flags) {
            send.bmSlot = flags ^ send.bmSlot;
            runtime.operations.push(`rfu_changeSendTarget:${TYPE_NI}:${i}:${send.bmSlot}`);
          }
        }
      }
    }
  }
  if (runtime.gRfuLinkStatus.recvSlotNIFlag) {
    for (let i = 0; i < RFU_CHILD_MAX; i++) {
      const recv = runtime.gRfuSlotStatusNI[i].recv;
      if ((recv.state & SLOT_BUSY_FLAG) && recv.failCounter > runtime.lman.NI_failCounter_limit) {
        runtime.operations.push(`rfu_NI_stopReceivingData:${i}`);
      }
    }
  }
};

export const rfu_LMAN_setMSCCallback = (
  runtime: AgbRfuLinkManagerRuntime,
  callback: ((reqCommandId: number) => void) | null
): void => {
  runtime.lman.MSC_callback = callback;
  runtime.operations.push('rfu_setMSCCallback:rfu_LMAN_MSC_callback');
};

export const rfu_LMAN_setLinkRecovery = (runtime: AgbRfuLinkManagerRuntime, _enableFlag: number, recoveryPeriod: number): number => {
  runtime.lman.linkRecovery_enable = 0;
  runtime.lman.linkRecoveryTimer.count_max = recoveryPeriod;
  return 0;
};

export const rfu_LMAN_setNIFailCounterLimit = (runtime: AgbRfuLinkManagerRuntime, limit: number): number => {
  if (runtime.gRfuLinkStatus.sendSlotNIFlag | runtime.gRfuLinkStatus.recvSlotNIFlag) {
    runtime.lman.param[0] = 6;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_NOW_COMMUNICATION;
  }
  runtime.lman.NI_failCounter_limit = limit;
  return 0;
};

export const rfu_LMAN_setFastSearchParent = (runtime: AgbRfuLinkManagerRuntime, enableFlag: number): number => {
  if ([LMAN_STATE_START_SEARCH_PARENT, LMAN_STATE_POLL_SEARCH_PARENT, LMAN_STATE_END_SEARCH_PARENT].includes(runtime.lman.state)) {
    runtime.lman.param[0] = 7;
    occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    return LMAN_ERROR_NOW_SEARCH_PARENT;
  }
  runtime.lman.fastSearchParent_flag = enableFlag ? FSP_ON : 0;
  return 0;
};

export const rfu_LMAN_requestChangeAgbClockMaster = (runtime: AgbRfuLinkManagerRuntime): void => {
  if (runtime.lman.childClockSlave_flag === RFU_CHILD_CLOCK_SLAVE_OFF) {
    occureCallback(runtime, LMAN_MSG_CHANGE_AGB_CLOCK_MASTER, 0);
  } else if (runtime.lman.childClockSlave_flag === RFU_CHILD_CLOCK_SLAVE_ON) {
    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_OFF_REQ;
  }
};

export const rfu_LMAN_forceChangeSP = (runtime: AgbRfuLinkManagerRuntime, child = true): void => {
  if (!runtime.lman.pcswitch_flag) return;
  switch (runtime.lman.state) {
    case LMAN_STATE_START_SEARCH_CHILD:
      runtime.lman.pcswitch_flag = PCSWITCH_2ND_SP_START;
      runtime.lman.state = LMAN_STATE_START_SEARCH_PARENT;
      break;
    case LMAN_STATE_POLL_SEARCH_CHILD:
      runtime.lman.pcswitch_flag = PCSWITCH_1ST_SC;
      runtime.lman.connect_period = 1;
      break;
    case LMAN_STATE_END_SEARCH_CHILD:
    case LMAN_STATE_WAIT_RECV_CHILD_NAME:
      runtime.lman.pcswitch_flag = PCSWITCH_1ST_SC;
      break;
    case LMAN_STATE_START_SEARCH_PARENT:
    case LMAN_STATE_POLL_SEARCH_PARENT:
      if (!child) break;
      runtime.lman.connect_period = PCSWITCH_SP_PERIOD;
      runtime.lman.connect_period_initial = 0;
      break;
    case LMAN_STATE_END_SEARCH_PARENT:
      if (!child) break;
      runtime.lman.connect_period = PCSWITCH_SP_PERIOD;
      runtime.lman.connect_period_initial = 0;
      runtime.lman.state = LMAN_STATE_POLL_SEARCH_PARENT;
      break;
  }
};
