import { describe, expect, test } from 'vitest';
import {
  AGB_CLK_SLAVE,
  ID_CP_END_REQ,
  ID_CP_POLL_REQ,
  ID_DATA_RX_REQ,
  ID_GAME_CONFIG_REQ,
  ID_MS_CHANGE_REQ,
  ID_SC_POLL_REQ,
  LMAN_ERROR_AGB_CLK_SLAVE,
  LMAN_ERROR_ILLEGAL_PARAMETER,
  LMAN_ERROR_MANAGER_BUSY,
  LMAN_ERROR_PID_NOT_FOUND,
  LMAN_FORCED_STOP_AND_RFU_RESET,
  LMAN_MSG_CHANGE_AGB_CLOCK_MASTER,
  LMAN_MSG_CHANGE_AGB_CLOCK_SLAVE,
  LMAN_MSG_CHILD_NAME_SEND_COMPLETED,
  LMAN_MSG_CONNECT_PARENT_SUCCESSED,
  LMAN_MSG_END_WAIT_CHILD_NAME,
  LMAN_MSG_INITIALIZE_COMPLETED,
  LMAN_MSG_LINK_LOSS_DETECTED_AND_DISCONNECTED,
  LMAN_MSG_LINK_LOSS_DETECTED_AND_START_RECOVERY,
  LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED,
  LMAN_MSG_LINK_RECOVERY_SUCCESSED,
  LMAN_MSG_LMAN_API_ERROR_RETURN,
  LMAN_MSG_MANAGER_FORCED_STOPPED_AND_RFU_RESET,
  LMAN_MSG_NEW_CHILD_CONNECT_ACCEPTED,
  LMAN_MSG_NEW_CHILD_CONNECT_DETECTED,
  LMAN_MSG_NEW_CHILD_CONNECT_REJECTED,
  LMAN_MSG_PARENT_FOUND,
  LMAN_MSG_REQ_API_ERROR,
  LMAN_MSG_SEARCH_PARENT_PERIOD_EXPIRED,
  LMAN_MSG_WATCH_DOG_TIMER_ERROR,
  LMAN_STATE_END_CONNECT_PARENT,
  LMAN_STATE_END_SEARCH_PARENT,
  LMAN_STATE_MS_CHANGE,
  LMAN_STATE_POLL_SEARCH_CHILD,
  LMAN_STATE_POLL_SEARCH_PARENT,
  LMAN_STATE_READY,
  LMAN_STATE_SEND_CHILD_NAME,
  LMAN_STATE_SOFT_RESET_AND_CHECK_ID,
  LMAN_STATE_START_CONNECT_PARENT,
  LMAN_STATE_START_LINK_RECOVERY,
  LMAN_STATE_START_SEARCH_CHILD,
  LMAN_STATE_START_SEARCH_PARENT,
  LMAN_STATE_WAIT_RECV_CHILD_NAME,
  MODE_CHILD,
  MODE_NEUTRAL,
  MODE_PARENT,
  MODE_P_C_SWITCH,
  PCSWITCH_1ST_SC,
  PCSWITCH_1ST_SC_START,
  PCSWITCH_2ND_SP_START,
  PCSWITCH_2ND_SP,
  RFU_CHILD_CLOCK_SLAVE_OFF,
  RFU_CHILD_CLOCK_SLAVE_OFF_REQ,
  RFU_CHILD_CLOCK_SLAVE_ON,
  REASON_DISCONNECTED,
  SLOT_BUSY_FLAG,
  SLOT_STATE_RECV_SUCCESS,
  SLOT_STATE_SEND_SUCCESS,
  TYPE_NI,
  createAgbRfuLinkManagerRuntime,
  rfu_LMAN_CHILD_checkEnableParentCandidate,
  rfu_LMAN_CHILD_connectParent,
  rfu_LMAN_CHILD_linkRecoveryProcess,
  rfu_LMAN_MSC_callback,
  rfu_LMAN_PARENT_checkRecvChildName,
  rfu_LMAN_PARENT_stopWaitLinkRecoveryAndDisconnect,
  rfu_LMAN_REQBN_softReset_and_checkID,
  rfu_LMAN_REQ_callback,
  rfu_LMAN_REQ_sendData,
  rfu_LMAN_checkNICommunicateStatus,
  rfu_LMAN_clearVariables,
  rfu_LMAN_disconnect,
  rfu_LMAN_endManager,
  rfu_LMAN_establishConnection,
  rfu_LMAN_forceChangeSP,
  rfu_LMAN_initializeManager,
  rfu_LMAN_initializeRFU,
  rfu_LMAN_linkWatcher,
  rfu_LMAN_managerChangeAgbClockMaster,
  rfu_LMAN_manager_entity,
  rfu_LMAN_occureCallback,
  rfu_LMAN_reflectCommunicationStatus,
  rfu_LMAN_requestChangeAgbClockMaster,
  rfu_LMAN_setFastSearchParent,
  rfu_LMAN_setLMANCallback,
  rfu_LMAN_setLinkRecovery,
  rfu_LMAN_setNIFailCounterLimit,
  rfu_LMAN_settingPCSWITCH,
  rfu_LMAN_stopManager,
  rfu_LMAN_syncVBlank
} from '../src/game/decompAgbRfuLinkManager';

const initParam = {
  maxMFrame: 4,
  MC_TimerCount: 7,
  availSlot_flag: 0xf,
  mboot_flag: 0,
  serialNo: 0x1234,
  gameName: 'GAME',
  userName: 'USER',
  fastSearchParent_flag: 1,
  linkRecovery_enable: 1,
  linkRecovery_period: 3,
  NI_failCounter_limit: 8
};

describe('decomp AgbRfu LinkManager', () => {
  test('initializes manager/RFU and soft-reset path exactly resets public state', () => {
    const runtime = createAgbRfuLinkManagerRuntime();
    const seen: Array<[number, number]> = [];
    expect(rfu_LMAN_initializeManager(runtime, (msg, count) => seen.push([msg, count]), null)).toBe(0);
    rfu_LMAN_initializeRFU(runtime, initParam);
    expect(runtime.lman.state).toBe(LMAN_STATE_SOFT_RESET_AND_CHECK_ID);
    expect(runtime.lman.next_state).toBe(2);
    expect(runtime.lman.linkRecoveryTimer.count_max).toBe(3);
    expect(runtime.lman.fastSearchParent_flag).toBe(1);

    expect(rfu_LMAN_REQBN_softReset_and_checkID(runtime)).toBe(0x8000);
    expect(runtime.lman.RFU_powerOn_flag).toBe(1);
    expect(runtime.lman.pcswitch_flag).toBe(0);
    expect(runtime.lman.parent_child).toBe(2);
    expect(runtime.operations).toContain('rfu_REQBN_softReset_and_checkID');

    runtime.lman.active = 1;
    runtime.lman.state = 4;
    runtime.lman.next_state = 0;
    rfu_LMAN_REQ_callback(runtime, ID_GAME_CONFIG_REQ, 0);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_INITIALIZE_COMPLETED, paramCount: 0, params: [] });
    expect(seen.at(-1)).toEqual([LMAN_MSG_INITIALIZE_COMPLETED, 0]);
  });

  test('establish connection validates busy, slave, serial list, parent, child, and PC switch modes', () => {
    const runtime = createAgbRfuLinkManagerRuntime();
    rfu_LMAN_initializeManager(runtime, () => undefined, null);

    runtime.lman.state = LMAN_STATE_POLL_SEARCH_CHILD;
    expect(rfu_LMAN_establishConnection(runtime, MODE_PARENT, 10, 20, [0x1234, 0xffff])).toBe(LMAN_ERROR_MANAGER_BUSY);
    expect(runtime.callbacks.at(-1)).toMatchObject({ msg: LMAN_MSG_LMAN_API_ERROR_RETURN, params: [1] });

    runtime.lman.state = LMAN_STATE_READY;
    runtime.masterSlave = AGB_CLK_SLAVE;
    expect(rfu_LMAN_establishConnection(runtime, MODE_PARENT, 10, 20, [0xffff])).toBe(LMAN_ERROR_AGB_CLK_SLAVE);
    expect(runtime.callbacks.at(-1)).toMatchObject({ params: [2] });

    runtime.masterSlave = 0;
    expect(rfu_LMAN_establishConnection(runtime, MODE_PARENT, 10, 20, Array.from({ length: 16 }, (_, i) => i))).toBe(
      LMAN_ERROR_ILLEGAL_PARAMETER
    );
    expect(runtime.callbacks.at(-1)).toMatchObject({ params: [4] });

    expect(rfu_LMAN_establishConnection(runtime, MODE_PARENT, 10, 20, [0x1234, 0xffff])).toBe(0);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_SEARCH_CHILD);
    expect(runtime.lman.connect_period).toBe(10);

    runtime.lman.state = LMAN_STATE_READY;
    runtime.lman.fastSearchParent_flag = 1;
    expect(rfu_LMAN_establishConnection(runtime, MODE_CHILD, 9, 21, [0x1234, 0xffff])).toBe(0);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_SEARCH_PARENT);
    expect(runtime.lman.fastSearchParent_flag).toBe(2);

    runtime.lman.state = LMAN_STATE_READY;
    expect(rfu_LMAN_establishConnection(runtime, MODE_P_C_SWITCH, 9, 21, [0xffff])).toBe(0);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_SEARCH_CHILD);
    expect(runtime.lman.pcswitch_flag).toBe(PCSWITCH_1ST_SC_START);
    expect(runtime.lman.connect_period).toBe(0);
  });

  test('child connect parent searches candidates and request callbacks advance connection states', () => {
    const runtime = createAgbRfuLinkManagerRuntime({
      gRfuLinkStatus: {
        parentChild: 2,
        findParentCount: 2,
        partner: [
          { id: 10, serialNo: 0x1111 },
          { id: 20, serialNo: 0x2222 },
          { id: 0, serialNo: 0 },
          { id: 0, serialNo: 0 }
        ],
        linkLossSlotFlag: 0,
        connSlotFlag: 0,
        getNameFlag: 0,
        sendSlotUNIFlag: 0,
        sendSlotNIFlag: 0,
        recvSlotNIFlag: 0
      }
    });
    rfu_LMAN_initializeManager(runtime, () => undefined, null);
    expect(rfu_LMAN_CHILD_connectParent(runtime, 99, 12)).toBe(LMAN_ERROR_PID_NOT_FOUND);
    expect(runtime.callbacks.at(-1)).toMatchObject({ msg: LMAN_MSG_LMAN_API_ERROR_RETURN, params: [3] });

    expect(rfu_LMAN_CHILD_connectParent(runtime, 20, 12)).toBe(0);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_CONNECT_PARENT);
    expect(runtime.lman.next_state).toBe(13);
    expect(runtime.lman.work).toBe(20);

    runtime.lman.active = 1;
    rfu_LMAN_REQ_callback(runtime, ID_CP_POLL_REQ, 0);
    expect(runtime.lman.state).toBe(LMAN_STATE_END_CONNECT_PARENT);
    runtime.lman.active = 1;
    runtime.connectParentStatus = { error: 0, status: 0, childSlot: 2 };
    rfu_LMAN_REQ_callback(runtime, ID_CP_END_REQ, 0);
    expect(runtime.lman.state).toBe(LMAN_STATE_MS_CHANGE);
    expect(runtime.lman.next_state).toBe(LMAN_STATE_SEND_CHILD_NAME);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CONNECT_PARENT_SUCCESSED, paramCount: 1, params: [2] });

    runtime.lman.active = 1;
    rfu_LMAN_REQ_callback(runtime, ID_MS_CHANGE_REQ, 0);
    expect(runtime.lman.state).toBe(LMAN_STATE_SEND_CHILD_NAME);
    expect(runtime.lman.childClockSlave_flag).toBe(RFU_CHILD_CLOCK_SLAVE_ON);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CHANGE_AGB_CLOCK_SLAVE, paramCount: 0, params: [] });
    expect(runtime.operations).toContain('rfu_NI_CHILD_setSendGameName:2:14');

    runtime.gRfuSlotStatusNI[2].send.state = SLOT_STATE_SEND_SUCCESS;
    rfu_LMAN_REQ_callback(runtime, ID_DATA_RX_REQ, 0);
    expect(runtime.lman.state).toBe(LMAN_STATE_READY);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CHILD_NAME_SEND_COMPLETED, paramCount: 0, params: [] });
  });

  test('stop, forced stop, PC switch, sync watchdog, and send-data flags follow C branches', () => {
    const runtime = createAgbRfuLinkManagerRuntime({ syncVBlankResult: true });
    rfu_LMAN_initializeManager(runtime, () => undefined, null);

    runtime.lman.state = LMAN_STATE_START_SEARCH_PARENT;
    rfu_LMAN_stopManager(runtime, false);
    expect(runtime.lman.state).toBe(LMAN_STATE_READY);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_SEARCH_PARENT_PERIOD_EXPIRED, paramCount: 0, params: [] });

    rfu_LMAN_stopManager(runtime, true);
    expect(runtime.lman.state).toBe(LMAN_FORCED_STOP_AND_RFU_RESET);
    rfu_LMAN_manager_entity(runtime, 0);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_MANAGER_FORCED_STOPPED_AND_RFU_RESET, paramCount: 0, params: [] });

    runtime.lman.pcswitch_flag = PCSWITCH_1ST_SC_START;
    rfu_LMAN_manager_entity(runtime, 42);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_SEARCH_CHILD);
    expect(runtime.lman.connect_period).toBe(42);
    expect(runtime.lman.pcswitch_period_bak).toBe(243);
    expect(runtime.lman.pcswitch_flag).toBe(PCSWITCH_1ST_SC);

    runtime.lman.state = LMAN_STATE_POLL_SEARCH_CHILD;
    rfu_LMAN_forceChangeSP(runtime);
    expect(runtime.lman.connect_period).toBe(1);
    runtime.lman.state = LMAN_STATE_START_SEARCH_CHILD;
    rfu_LMAN_forceChangeSP(runtime);
    expect(runtime.lman.pcswitch_flag).toBe(PCSWITCH_2ND_SP_START);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_SEARCH_PARENT);

    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_ON;
    rfu_LMAN_syncVBlank(runtime);
    expect(runtime.callbacks.at(-2)).toEqual({ msg: LMAN_MSG_WATCH_DOG_TIMER_ERROR, paramCount: 0, params: [] });
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CHANGE_AGB_CLOCK_MASTER, paramCount: 0, params: [] });

    runtime.gRfuLinkStatus.parentChild = MODE_CHILD;
    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_ON;
    rfu_LMAN_REQ_sendData(runtime, false);
    expect(runtime.operations.at(-1)).toBe('rfu_REQ_sendData:1');
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.lman.parentAck_flag = 7;
    rfu_LMAN_REQ_sendData(runtime, true);
    expect(runtime.lman.parentAck_flag).toBe(0);
  });

  test('link watcher starts, succeeds, fails, or bypasses recovery with exact callback params', () => {
    const runtime = createAgbRfuLinkManagerRuntime({
      gRfuLinkStatus: {
        parentChild: MODE_PARENT,
        findParentCount: 0,
        partner: Array.from({ length: 4 }, () => ({ id: 0, serialNo: 0 })),
        linkLossSlotFlag: 0,
        connSlotFlag: 0,
        getNameFlag: 0,
        sendSlotUNIFlag: 0,
        sendSlotNIFlag: 0,
        recvSlotNIFlag: 0
      },
      watchLinkResult: { bmLinkLossSlot: 2, reason: 9, bmLinkRecoverySlot: 0 }
    });
    rfu_LMAN_initializeManager(runtime, () => undefined, null);
    runtime.lman.linkRecovery_enable = 1;
    runtime.lman.linkRecoveryTimer.count_max = 2;
    expect(rfu_LMAN_linkWatcher(runtime, 0)).toBe(false);
    expect(runtime.lman.linkRecoveryTimer.active).toBe(2);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_LINK_LOSS_DETECTED_AND_START_RECOVERY, paramCount: 1, params: [2] });

    runtime.watchLinkResult = { bmLinkLossSlot: 0, reason: 0, bmLinkRecoverySlot: 2 };
    expect(rfu_LMAN_linkWatcher(runtime, 0)).toBe(false);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_LINK_RECOVERY_SUCCESSED, paramCount: 1, params: [2] });

    runtime.lman.linkRecoveryTimer.active = 4;
    runtime.lman.linkRecoveryTimer.count[2] = 1;
    runtime.watchLinkResult = { bmLinkLossSlot: 0, reason: 0, bmLinkRecoverySlot: 0 };
    expect(rfu_LMAN_linkWatcher(runtime, 0)).toBe(true);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED, paramCount: 1, params: [4] });
    expect(runtime.operations).toContain('rfu_REQ_disconnect:4');

    const noRecovery = createAgbRfuLinkManagerRuntime({
      watchLinkResult: { bmLinkLossSlot: 1, reason: 7, bmLinkRecoverySlot: 0 }
    });
    rfu_LMAN_initializeManager(noRecovery, () => undefined, null);
    expect(rfu_LMAN_linkWatcher(noRecovery, 0)).toBe(true);
    expect(noRecovery.callbacks.at(-1)).toEqual({
      msg: LMAN_MSG_LINK_LOSS_DETECTED_AND_DISCONNECTED,
      paramCount: 2,
      params: [1, 7]
    });

    const impossible = createAgbRfuLinkManagerRuntime({
      watchLinkResult: { bmLinkLossSlot: 8, reason: REASON_DISCONNECTED, bmLinkRecoverySlot: 0 }
    });
    rfu_LMAN_initializeManager(impossible, () => undefined, null);
    impossible.lman.linkRecovery_enable = 1;
    impossible.lman.parent_child = MODE_CHILD;
    expect(rfu_LMAN_linkWatcher(impossible, 0)).toBe(true);
    expect(impossible.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED, paramCount: 1, params: [8] });

    impossible.lman.linkRecovery_start_flag = 1;
    impossible.lman.state = LMAN_STATE_POLL_SEARCH_PARENT;
    impossible.lman.next_state = LMAN_STATE_END_SEARCH_PARENT;
    rfu_LMAN_CHILD_linkRecoveryProcess(impossible);
    expect(impossible.lman.state).toBe(LMAN_STATE_START_LINK_RECOVERY);
    expect(impossible.lman.state_bak).toEqual([LMAN_STATE_POLL_SEARCH_PARENT, LMAN_STATE_END_SEARCH_PARENT]);
  });

  test('parent child-name acceptance/rejection and candidate scan preserve slot bit behavior', () => {
    const runtime = createAgbRfuLinkManagerRuntime();
    rfu_LMAN_initializeManager(runtime, () => undefined, null);
    runtime.lman.state = LMAN_STATE_WAIT_RECV_CHILD_NAME;
    runtime.lman.nameAcceptTimer.count_max = 3;
    runtime.lman.acceptable_serialNo_list = [0x2222, 0xffff];
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    runtime.gRfuLinkStatus.partner[0].serialNo = 0x2222;
    rfu_LMAN_PARENT_checkRecvChildName(runtime);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_NEW_CHILD_CONNECT_DETECTED, paramCount: 1, params: [1] });
    expect(runtime.lman.nameAcceptTimer.active).toBe(1);

    runtime.gRfuSlotStatusNI[0].recv.state = SLOT_STATE_RECV_SUCCESS;
    runtime.gRfuSlotStatusNI[0].recv.dataType = 1;
    rfu_LMAN_PARENT_checkRecvChildName(runtime);
    expect(runtime.lman.acceptSlot_flag).toBe(1);
    expect(runtime.lman.acceptCount).toBe(1);
    expect(runtime.callbacks.at(-2)).toEqual({ msg: LMAN_MSG_NEW_CHILD_CONNECT_ACCEPTED, paramCount: 1, params: [1] });
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_END_WAIT_CHILD_NAME, paramCount: 0, params: [] });

    runtime.lman.state = LMAN_STATE_WAIT_RECV_CHILD_NAME;
    runtime.gRfuLinkStatus.connSlotFlag = 3;
    runtime.gRfuLinkStatus.partner[1].serialNo = 0x9999;
    rfu_LMAN_PARENT_checkRecvChildName(runtime);
    runtime.gRfuSlotStatusNI[1].recv.state = SLOT_STATE_RECV_SUCCESS;
    runtime.gRfuSlotStatusNI[1].recv.dataType = 1;
    rfu_LMAN_PARENT_checkRecvChildName(runtime);
    expect(runtime.callbacks.at(-2)).toEqual({ msg: LMAN_MSG_NEW_CHILD_CONNECT_REJECTED, paramCount: 1, params: [2] });
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_END_WAIT_CHILD_NAME, paramCount: 0, params: [] });

    runtime.gRfuLinkStatus.findParentCount = 3;
    runtime.gRfuLinkStatus.partner[0].serialNo = 0x1000;
    runtime.gRfuLinkStatus.partner[1].serialNo = 0x2222;
    runtime.gRfuLinkStatus.partner[2].serialNo = 0x3333;
    expect(rfu_LMAN_CHILD_checkEnableParentCandidate(runtime)).toBe(2);

    runtime.lman.active = 1;
    runtime.lman.acceptable_serialNo_list = [0x2222, 0x3333, 0xffff];
    rfu_LMAN_REQ_callback(runtime, ID_SC_POLL_REQ, 0);
    runtime.lman.state = LMAN_STATE_POLL_SEARCH_PARENT;
    runtime.lman.active = 1;
    rfu_LMAN_REQ_callback(runtime, 0x17, 0);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_PARENT_FOUND, paramCount: 1, params: [6] });
  });

  test('communication reflection, NI fail limits, clock requests, MSC callback, and API errors are modeled', () => {
    const runtime = createAgbRfuLinkManagerRuntime();
    rfu_LMAN_initializeManager(runtime, () => undefined, (id) => runtime.operations.push(`MSC:${id}`));
    runtime.gRfuLinkStatus.sendSlotNIFlag = 1;
    runtime.gRfuLinkStatus.recvSlotNIFlag = 1;
    runtime.gRfuLinkStatus.sendSlotUNIFlag = 3;
    runtime.gRfuSlotStatusNI[0].send = { state: SLOT_BUSY_FLAG, dataType: 0, bmSlot: 3, failCounter: 0 };
    runtime.gRfuSlotStatusNI[1].recv = { state: SLOT_BUSY_FLAG, dataType: 0, bmSlot: 2, failCounter: 0 };
    runtime.gRfuSlotStatusUNI[0].send = { state: 5, dataType: 0, bmSlot: 3, failCounter: 0 };
    rfu_LMAN_reflectCommunicationStatus(runtime, 2);
    expect(runtime.gRfuSlotStatusNI[0].send.bmSlot).toBe(1);
    expect(runtime.gRfuLinkStatus.sendSlotUNIFlag).toBe(1);
    expect(runtime.gRfuSlotStatusUNI[0].send.bmSlot).toBe(1);
    expect(runtime.operations).toContain(`rfu_changeSendTarget:${TYPE_NI}:0:1`);
    expect(runtime.operations).toContain('rfu_NI_stopReceivingData:1');

    runtime.lman.NI_failCounter_limit = 4;
    runtime.gRfuSlotStatusNI[2].send = { state: SLOT_BUSY_FLAG, dataType: 0, bmSlot: 4, failCounter: 5 };
    rfu_LMAN_checkNICommunicateStatus(runtime);
    expect(runtime.operations).toContain(`rfu_changeSendTarget:${TYPE_NI}:2:0`);

    expect(rfu_LMAN_setNIFailCounterLimit(runtime, 10)).toBe(6);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_LMAN_API_ERROR_RETURN, paramCount: 1, params: [6] });
    runtime.gRfuLinkStatus.sendSlotNIFlag = 0;
    runtime.gRfuLinkStatus.recvSlotNIFlag = 0;
    expect(rfu_LMAN_setNIFailCounterLimit(runtime, 10)).toBe(0);
    expect(runtime.lman.NI_failCounter_limit).toBe(10);

    runtime.lman.state = LMAN_STATE_POLL_SEARCH_PARENT;
    expect(rfu_LMAN_setFastSearchParent(runtime, 1)).toBe(7);
    expect(rfu_LMAN_setLinkRecovery(runtime, 1, 12)).toBe(0);
    expect(runtime.lman.linkRecovery_enable).toBe(0);
    expect(runtime.lman.linkRecoveryTimer.count_max).toBe(12);

    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_OFF;
    rfu_LMAN_requestChangeAgbClockMaster(runtime);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CHANGE_AGB_CLOCK_MASTER, paramCount: 0, params: [] });
    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_ON;
    rfu_LMAN_requestChangeAgbClockMaster(runtime);
    expect(runtime.lman.childClockSlave_flag).toBe(RFU_CHILD_CLOCK_SLAVE_OFF_REQ);

    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_OFF_REQ;
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.uniParentDracAck = { error: 0, ack: 2 };
    rfu_LMAN_MSC_callback(runtime, 77);
    expect(runtime.lman.parentAck_flag).toBe(2);
    expect(runtime.mscCalls).toContain(77);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CHANGE_AGB_CLOCK_MASTER, paramCount: 0, params: [] });

    runtime.lman.active = 1;
    rfu_LMAN_REQ_callback(runtime, ID_CP_POLL_REQ, 9);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_REQ_API_ERROR, paramCount: 2, params: [ID_CP_POLL_REQ, 9] });
  });

  test('exact C-name static RFU manager helpers preserve callback, disconnect, PC switch, and recovery behavior', () => {
    const runtime = createAgbRfuLinkManagerRuntime();
    const seen: Array<[number, number]> = [];
    rfu_LMAN_initializeManager(runtime, (msg, count) => seen.push([msg, count]), null);

    runtime.lman.state = LMAN_STATE_START_SEARCH_CHILD;
    runtime.lman.child_slot = 3;
    runtime.lman.nameAcceptTimer.active = 0xf;
    runtime.lman.linkRecoveryTimer.active = 0xf;
    runtime.lman.nameAcceptTimer.count = [1, 2, 3, 4];
    runtime.lman.linkRecoveryTimer.count = [5, 6, 7, 8];
    rfu_LMAN_clearVariables(runtime);
    expect(runtime.lman.state).toBe(LMAN_STATE_READY);
    expect(runtime.lman.parent_child).toBe(MODE_NEUTRAL);
    expect(runtime.lman.child_slot).toBe(0);
    expect(runtime.lman.nameAcceptTimer.count).toEqual([0, 0, 0, 0]);
    expect(runtime.lman.LMAN_callback).not.toBeNull();

    rfu_LMAN_setLMANCallback(runtime, (msg, count) => seen.push([msg + 1, count + 1]));
    runtime.lman.param[0] = 42;
    rfu_LMAN_occureCallback(runtime, LMAN_MSG_LMAN_API_ERROR_RETURN, 1);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_LMAN_API_ERROR_RETURN, paramCount: 1, params: [42] });
    expect(seen.at(-1)).toEqual([LMAN_MSG_LMAN_API_ERROR_RETURN + 1, 2]);
    expect(runtime.lman.param.slice(0, 2)).toEqual([0, 0]);

    runtime.lman.active = 7;
    rfu_LMAN_disconnect(runtime, 3);
    expect(runtime.lman.active).toBe(7);
    expect(runtime.operations.slice(-2)).toEqual(['rfu_REQ_disconnect:3', 'rfu_waitREQComplete']);

    runtime.lman.linkRecoveryTimer.active = 0b0110;
    runtime.lman.linkRecoveryTimer.count = [9, 9, 9, 9];
    runtime.gRfuLinkStatus.linkLossSlotFlag = 0b0010;
    rfu_LMAN_PARENT_stopWaitLinkRecoveryAndDisconnect(runtime, 0b0110);
    expect(runtime.lman.linkRecoveryTimer.active).toBe(0);
    expect(runtime.lman.linkRecoveryTimer.count).toEqual([9, 0, 0, 9]);
    expect(runtime.callbacks.at(-1)).toEqual({
      msg: LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED,
      paramCount: 2,
      params: [2, 0]
    });

    runtime.lman.pcswitch_flag = PCSWITCH_1ST_SC_START;
    rfu_LMAN_settingPCSWITCH(runtime, 285);
    expect(runtime.lman.parent_child).toBe(MODE_CHILD);
    expect(runtime.lman.state).toBe(LMAN_STATE_START_SEARCH_PARENT);
    expect(runtime.lman.connect_period).toBe(65);
    expect(runtime.lman.pcswitch_flag).toBe(PCSWITCH_2ND_SP);

    runtime.lman.childClockSlave_flag = RFU_CHILD_CLOCK_SLAVE_ON;
    rfu_LMAN_managerChangeAgbClockMaster(runtime);
    expect(runtime.lman.childClockSlave_flag).toBe(RFU_CHILD_CLOCK_SLAVE_OFF);
    expect(runtime.callbacks.at(-1)).toEqual({ msg: LMAN_MSG_CHANGE_AGB_CLOCK_MASTER, paramCount: 0, params: [] });

    runtime.lman.state = LMAN_STATE_START_CONNECT_PARENT;
    runtime.lman.child_slot = 2;
    rfu_LMAN_endManager(runtime);
    expect(runtime.lman.state).toBe(LMAN_STATE_READY);
    expect(runtime.lman.child_slot).toBe(0);
    expect(runtime.lman.parent_child).toBe(MODE_NEUTRAL);
    expect(runtime.lman.LMAN_callback).not.toBeNull();
  });
});
