import { describe, expect, test } from 'vitest';
import {
  AGB_CLK_MASTER,
  AGB_CLK_SLAVE,
  ERR_MODE_NOT_CONNECTED,
  ERR_PID_NOT_FOUND,
  ERR_REQ_CMD_ID,
  ERR_SLOT_BUSY,
  ERR_SLOT_NO,
  ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ,
  MODE_CHILD,
  MODE_NEUTRAL,
  MODE_PARENT,
  REASON_LINK_LOSS,
  RFU_ID,
  SLOT_STATE_RECV_LAST,
  SLOT_STATE_SEND_START,
  SLOT_STATE_SEND_UNI,
  TYPE_NI_RECV,
  TYPE_NI_SEND,
  TYPE_UNI,
  createLibrfuRfuRuntime,
  rfu_CB_defaultCallback,
  rfu_CB_pollConnectParent,
  rfu_CB_recvData,
  rfu_CHILD_getConnectRecoveryStatus,
  rfu_NI_checkCommFailCounter,
  rfu_NI_setSendData,
  rfu_NI_stopReceivingData,
  rfu_REQBN_softReset_and_checkID,
  rfu_REQBN_watchLink,
  rfu_REQ_disconnect,
  rfu_REQ_recvData,
  rfu_REQ_startConnectParent,
  rfu_STC_NI_constructLLSF,
  rfu_STC_UNI_receive,
  rfu_STC_clearAPIVariables,
  rfu_STC_readChildList,
  rfu_UNI_PARENT_getDRAC_ACK,
  rfu_UNI_changeAndReadySendData,
  rfu_UNI_clearRecvNewDataFlag,
  rfu_UNI_readySendData,
  rfu_UNI_setSendData,
  rfu_changeSendTarget,
  rfu_clearSlot,
  rfu_getConnectParentStatus,
  rfu_getMasterSlave,
  rfu_getRFUStatus,
  rfu_initializeAPI,
  rfu_setRecvBuffer,
  rfu_setREQCallback,
  rfu_syncVBlank
} from '../src/game/decompLibrfuRfu';

describe('decompLibrfuRfu', () => {
  test('initialization clears API variables, slots, and validates buffer size', () => {
    const runtime = createLibrfuRfuRuntime();
    expect(rfu_initializeAPI({}, 4, null, true, runtime)).toBe(2);
    expect(rfu_initializeAPI({}, 0x1000, null, true, runtime)).toBe(0);
    expect(runtime.gRfuLinkStatus.watchInterval).toBe(4);
    expect(runtime.gRfuLinkStatus.parentChild).toBe(MODE_NEUTRAL);
    expect(runtime.gRfuLinkStatus.remainLLFrameSizeChild).toEqual([16, 16, 16, 16]);
  });

  test('callbacks and RFU status preserve request result and user callback behavior', () => {
    const runtime = createLibrfuRfuRuntime();
    const seen: Array<[number, number]> = [];
    rfu_setREQCallback((cmd, result) => seen.push([cmd, result]), runtime);
    expect(runtime.gRfuStatic.flags & 8).toBe(8);
    runtime.gRfuFixed.STWIBuffer.data[0] = 0x93;
    runtime.gRfuFixed.STWIBuffer.data[7] = 42;
    const state = { value: 0 };
    expect(rfu_getRFUStatus(state, runtime)).toBe(0);
    expect(state.value).toBe(42);
    rfu_CB_defaultCallback(ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ, 7, runtime);
    expect(seen).toEqual([[ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ, 7]]);
  });

  test('search child and connect parent update link status slots exactly by bitmask', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.gRfuFixed.STWIBuffer.data[1] = 2;
    runtime.gRfuFixed.STWIBuffer.data.splice(4, 8, 0x34, 0x12, 0, 0, 0x78, 0x56, 2, 0);
    rfu_STC_readChildList(runtime);
    expect(runtime.gRfuLinkStatus.parentChild).toBe(MODE_PARENT);
    expect(runtime.gRfuLinkStatus.connSlotFlag).toBe(0b0101);
    expect(runtime.gRfuLinkStatus.partner[2].id).toBe(0x5678);

    rfu_REQ_startConnectParent(99, runtime);
    expect(runtime.gRfuStatic.reqResult).toBe(ERR_PID_NOT_FOUND);

    runtime.gRfuStatic.tryPid = 0x5678;
    runtime.gRfuFixed.STWIBuffer.data.splice(0, 8, 0xab, 0xcd, 0, 0, 0, 0, 1, 0);
    rfu_CB_pollConnectParent(0x21, 0, runtime);
    expect(runtime.gRfuLinkStatus.parentChild).toBe(MODE_CHILD);
    expect(runtime.gRfuLinkStatus.my.id).toBe(0xcdab);
    expect(runtime.gRfuLinkStatus.connSlotFlag & 2).toBe(2);
  });

  test('send data setup enforces connected mode, busy state, frame budget, and target changes', () => {
    const runtime = createLibrfuRfuRuntime();
    expect(rfu_NI_setSendData(1, 8, [1, 2, 3], 3, runtime)).toBe(ERR_MODE_NOT_CONNECTED);
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    expect(rfu_NI_setSendData(1, 8, [1, 2, 3, 4], 4, runtime)).toBe(0);
    expect(runtime.gRfuLinkStatus.sendSlotNIFlag).toBe(1);
    expect(runtime.gRfuSlotStatusNI[0].send.state).toBe(SLOT_STATE_SEND_START);
    expect(rfu_NI_setSendData(1, 8, [1], 1, runtime)).toBe(ERR_SLOT_BUSY);
    expect(rfu_changeSendTarget(TYPE_NI_SEND, 0, 0, runtime)).toBe(0);
    expect(runtime.gRfuSlotStatusNI[0].send.state).toBe(6);
  });

  test('UNI send, ready, receive buffers, and new-data flags follow slot rules', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    const recv: number[] = [];
    expect(rfu_setRecvBuffer(TYPE_UNI, 0, recv, 4, runtime)).toBe(0);
    expect(rfu_UNI_setSendData(1, [9, 8, 7], 3, runtime)).toBe(0);
    expect(runtime.gRfuSlotStatusUNI[0].send.state).toBe(SLOT_STATE_SEND_UNI);
    rfu_UNI_readySendData(0, runtime);
    expect(runtime.gRfuSlotStatusUNI[0].send.dataReadyFlag).toBe(1);
    expect(rfu_UNI_changeAndReadySendData(0, [5, 4], 2, runtime)).toBe(0);
    rfu_STC_UNI_receive(0, { frame: 3 }, [1, 2, 3], runtime);
    expect(recv).toEqual([1, 2, 3]);
    expect(runtime.gRfuSlotStatusUNI[0].recv.newDataFlag).toBe(1);
    rfu_UNI_clearRecvNewDataFlag(0, runtime);
    expect(runtime.gRfuSlotStatusUNI[0].recv.newDataFlag).toBe(0);
  });

  test('clear slot and stop receiving release frame flags', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    rfu_NI_setSendData(1, 8, [1, 2, 3], 3, runtime);
    expect(rfu_clearSlot(TYPE_NI_SEND, 0, runtime)).toBe(0);
    expect(runtime.gRfuLinkStatus.sendSlotNIFlag).toBe(0);
    runtime.gRfuSlotStatusNI[0].recv.state = SLOT_STATE_RECV_LAST;
    runtime.gRfuSlotStatusNI[0].recv.bmSlot = 1;
    runtime.gRfuLinkStatus.recvSlotNIFlag = 1;
    expect(rfu_NI_stopReceivingData(0, runtime)).toBe(0);
    expect(runtime.gRfuLinkStatus.recvSlotNIFlag).toBe(0);
    expect(rfu_clearSlot(0, 0, runtime)).toBe(14);
    expect(rfu_clearSlot(TYPE_NI_RECV, 4, runtime)).toBe(ERR_SLOT_NO);
  });

  test('watchdog, master/slave, link loss, and recovery match bitflag transitions', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    runtime.gRfuLinkStatus.connCount = 1;
    runtime.gRfuStatic.flags = 4;
    (runtime.gRfuStatic as typeof runtime.gRfuStatic & { watchdogTimer: number }).watchdogTimer = 0;
    expect(rfu_syncVBlank(runtime)).toBe(1);
    expect(runtime.gRfuLinkStatus.parentChild).toBe(MODE_NEUTRAL);

    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    runtime.gRfuLinkStatus.connCount = 1;
    runtime.gRfuLinkStatus.strength[0] = 0;
    const loss = { value: 0 };
    const reason = { value: 0 };
    const recovery = { value: 0 };
    for (let i = 0; i < 4; i += 1) rfu_REQBN_watchLink(0, loss, reason, recovery, runtime);
    expect(loss.value).toBe(1);
    expect(reason.value).toBe(REASON_LINK_LOSS);

    runtime.masterSlave = AGB_CLK_MASTER;
    runtime.sending = true;
    runtime.reqActiveCommand = 0x37;
    expect(rfu_getMasterSlave(runtime)).toBe(AGB_CLK_SLAVE);
  });

  test('status helpers and disconnect/recovery callbacks mirror STWI packet ids', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    runtime.gRfuLinkStatus.connCount = 1;
    runtime.gRfuFixed.STWIBuffer.data.splice(0, 9, 0xa0, 0, 0, 0, 0, 0, 2, 3, 0);
    const status = { value: 0 };
    const slot = { value: 0 };
    expect(rfu_getConnectParentStatus(status, slot, runtime)).toBe(0);
    expect(status.value).toBe(3);
    expect(slot.value).toBe(2);
    rfu_REQ_disconnect(1, runtime);
    expect(runtime.operations).toContain('DisconnectREQ:1');
    runtime.gRfuStatic.recoveryBmSlot = 1;
    rfu_STC_clearAPIVariables(runtime);
    runtime.gRfuLinkStatus.linkLossSlotFlag = 1;
    runtime.gRfuStatic.recoveryBmSlot = 1;
    runtime.gRfuFixed.STWIBuffer.data[4] = 0;
    import('../src/game/decompLibrfuRfu').then(({ rfu_CB_CHILD_pollConnectRecovery }) => {
      rfu_CB_CHILD_pollConnectRecovery(0xb4, 0, runtime);
      expect(runtime.gRfuLinkStatus.connSlotFlag).toBe(1);
    });
    runtime.gRfuFixed.STWIBuffer.data[0] = 0xb3;
    expect(rfu_CHILD_getConnectRecoveryStatus(status, runtime)).toBe(0);
    runtime.gRfuFixed.STWIBuffer.data[0] = 0;
    expect(rfu_getRFUStatus(status, runtime)).toBe(ERR_REQ_CMD_ID);
  });

  test('LL frame construction and receive callback drive renewal and error flags', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 1;
    rfu_NI_setSendData(1, 8, [1, 2, 3, 4], 4, runtime);
    const dest: number[] = [];
    expect(rfu_STC_NI_constructLLSF(0, { value: dest }, runtime.gRfuSlotStatusNI[0].send, runtime)).toBeGreaterThan(0);
    expect(runtime.gRfuLinkStatus.LLFReadyFlag).toBe(1);

    runtime.gRfuFixed.STWIBuffer.data[1] = 1;
    runtime.gRfuFixed.STWIBuffer.data[0] = 0;
    rfu_REQ_recvData(runtime);
    expect(runtime.operations).toContain('DataRxREQ');
    rfu_CB_recvData(0x25, 0, runtime);
    expect(runtime.gRfuStatic.reqResult).toBe(0);

    runtime.gRfuLinkStatus.sendSlotNIFlag = 1;
    rfu_NI_checkCommFailCounter(runtime);
    expect(runtime.gRfuSlotStatusNI[0].send.failCounter).toBeGreaterThan(0);
  });

  test('soft reset and DRAC ACK helpers preserve original error cases', () => {
    const runtime = createLibrfuRfuRuntime();
    runtime.ime = 0;
    expect(rfu_REQBN_softReset_and_checkID(runtime)).toBe(7);
    runtime.ime = 1;
    runtime.softResetId = RFU_ID;
    expect(rfu_REQBN_softReset_and_checkID(runtime)).toBe(RFU_ID);

    const ack = { value: 123 };
    expect(rfu_UNI_PARENT_getDRAC_ACK(ack, runtime)).toBe(3);
    runtime.gRfuLinkStatus.parentChild = MODE_PARENT;
    runtime.gRfuLinkStatus.connSlotFlag = 0xf;
    runtime.gRfuFixed.STWIBuffer.data.splice(0, 5, 40, 0, 0, 0, 7);
    expect(rfu_UNI_PARENT_getDRAC_ACK(ack, runtime)).toBe(0);
    expect(ack.value).toBe(0xf);
  });
});
