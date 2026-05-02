import { describe, expect, test } from 'vitest';
import {
  ChildBuildSendCmd,
  CreateTask_ChildSearchForParent,
  CreateTask_ParentSearchForChildren,
  DisconnectRfu,
  GetRfuRecvQueueLength,
  GetRfuSendQueueLength,
  GetHostRfuGameData,
  InitializeRfuLinkManager_EnterUnionRoom,
  InitializeRfuLinkManager_JoinGroup,
  InitializeRfuLinkManager_LinkLeader,
  InitParentSendData,
  IsRfuSerialNumberValid,
  LinkRfu_StopManagerAndFinalizeSlots,
  LoadLinkPlayerIds,
  MODE_CHILD,
  MODE_PARENT,
  MODE_P_C_SWITCH,
  RFUSTATE_FINALIZED,
  RFUSTATE_PARENT_FINALIZE,
  RFUSTATE_PARENT_FINALIZE_START,
  RFU_STATUS_CONNECTION_ERROR,
  RfuGetErrorInfo,
  RfuGetStatus,
  RfuHasErrored,
  RfuMain1_Child,
  RfuMain1_Parent,
  RfuMain2_Parent,
  RfuReloadCommon,
  RfuReloadSave,
  RfuSetStatus,
  RfuSoftReset,
  Rfu_GetIndexOfNewestChild,
  Rfu_InitBlockSend,
  Rfu_SetBlockReceivedFlag,
  SendDisconnectCommand,
  SendLastBlock,
  SendNextBlock,
  SetHostRfuGameData,
  SetLinkPlayerIdsFromSlots,
  StartSendingKeysToRfu,
  Task_ChildSearchForParent,
  Task_ParentSearchForChildren,
  TryReconnectParent,
  UpdateBackupQueue,
  WaitRfuState,
  createLinkRfu2Runtime
} from '../src/game/decompLinkRfu2';

describe('decompLinkRfu2', () => {
  test('parent and child setup preserve RFU state/slot transitions', () => {
    const runtime = createLinkRfu2Runtime();
    SetHostRfuGameData(123, runtime);
    expect(GetHostRfuGameData(runtime)).toBe(runtime.hostGameData);
    expect(GetHostRfuGameData(runtime).activity).toBe(123);

    InitializeRfuLinkManager_LinkLeader(runtime);
    expect(runtime.gRfu.parentChild).toBe(MODE_PARENT);
    expect(runtime.tasks[runtime.gRfu.searchTaskId].func).toBe('Task_ParentSearchForChildren');

    runtime.lman.acceptSlot_flag = 0b1011;
    InitParentSendData(runtime);
    expect(runtime.gRfu.parentSlots).toBe(0b1011);
    expect(runtime.gRfu.parentSendSlot).toBe(Rfu_GetIndexOfNewestChild(0b1011));
    expect(runtime.gRfu.linkPlayerIdx).toEqual([1, 2, 0, 3]);

    SetLinkPlayerIdsFromSlots(0b0011, 0b0111, runtime);
    expect(runtime.gRfu.linkPlayerIdx[2]).toBe(3);

    runtime.gRfu.state = RFUSTATE_PARENT_FINALIZE_START;
    expect(WaitRfuState(false, runtime)).toBe(true);
    expect(runtime.gRfu.state).toBe(RFUSTATE_PARENT_FINALIZE);

    Task_ParentSearchForChildren(runtime.gRfu.searchTaskId, runtime);
    expect(runtime.gRfu.state).toBe(RFUSTATE_FINALIZED);
  });

  test('child search, reconnect, and union-room initialization mirror manager modes', () => {
    const runtime = createLinkRfu2Runtime();

    InitializeRfuLinkManager_JoinGroup(runtime);
    expect(runtime.gRfu.parentChild).toBe(MODE_CHILD);
    expect(runtime.tasks[runtime.gRfu.searchTaskId].func).toBe('Task_ChildSearchForParent');

    runtime.gRfu.state = 7;
    runtime.gRfu.parentId = 44;
    expect(TryReconnectParent(runtime)).toBe(true);
    expect(runtime.gRfu.state).toBe(9);

    Task_ChildSearchForParent(runtime.gRfu.searchTaskId, runtime);
    expect(runtime.tasks[runtime.gRfu.searchTaskId].data[1]).toBe(10);

    InitializeRfuLinkManager_EnterUnionRoom(runtime);
    expect(runtime.gRfu.parentChild).toBe(MODE_P_C_SWITCH);
    expect(runtime.tasks[runtime.gRfu.searchTaskId].func).toBe('Task_UnionRoomListen');

    CreateTask_ParentSearchForChildren(runtime);
    CreateTask_ChildSearchForParent(runtime);
    expect(runtime.tasks.some(task => task.func === 'Task_ParentSearchForChildren')).toBe(true);
    expect(runtime.tasks.some(task => task.func === 'Task_ChildSearchForParent')).toBe(true);
  });

  test('send queues, child command packing, and parent main loops move data like link slots', () => {
    const runtime = createLinkRfu2Runtime();
    runtime.gSendCmd[0] = 0x1234;
    const packed = Array.from({ length: 14 }, () => 0);

    ChildBuildSendCmd(runtime.gSendCmd, packed, runtime);
    expect(packed[0]).toBe(0x34);
    expect(packed[1]).toBe(0x12);
    expect(runtime.gRfu.childSendCmdId).toBe(1);

    runtime.gRfu.recvQueue.push(packed.concat(Array.from({ length: 14 * 4 }, () => 0)));
    runtime.gRfu.childSendCount = 1;
    runtime.gSendCmd[0] = 0x2222;
    RfuMain1_Child(runtime);
    expect(runtime.gRecvCmds[0][0]).toBe(0x1234);
    expect(GetRfuSendQueueLength(runtime)).toBe(1);

    runtime.gRfu.parentChild = MODE_PARENT;
    runtime.gRfu.state = RFUSTATE_FINALIZED;
    runtime.gRfu.parentSlots = 1;
    runtime.linkStatus.connSlotFlag = 1;
    runtime.gSendCmd[0] = 0x3333;
    RfuMain1_Parent(runtime);
    expect(runtime.gRfu.runParentMain2).toBe(true);
    RfuMain2_Parent(runtime);
    expect(runtime.gRecvCmds[0][0]).toBe(0x3333);

    runtime.gRfu.sendQueue = [[1, 2, 3]];
    UpdateBackupQueue(runtime);
    expect(runtime.gRfu.childSendBuffer.slice(0, 3)).toEqual([1, 2, 3]);
    expect(runtime.gRfu.backupQueue).toHaveLength(1);
    expect(GetRfuRecvQueueLength(runtime)).toBe(0);
  });

  test('block send, status/error, and disconnect helpers expose the C side effects', () => {
    const runtime = createLinkRfu2Runtime();

    Rfu_InitBlockSend(Array.from({ length: 30 }, (_v, i) => i), 30, runtime);
    expect(runtime.gRfu.sendBlock.count).toBe(3);
    SendNextBlock(runtime);
    SendLastBlock(runtime);
    expect(runtime.gRfu.sendBlock.active).toBe(false);
    expect(GetRfuSendQueueLength(runtime)).toBe(2);

    Rfu_SetBlockReceivedFlag(2, runtime);
    expect(runtime.gRfu.recvBlock[2].receivedFlags).toBe(1);

    RfuSetStatus(RFU_STATUS_CONNECTION_ERROR, 0x55, runtime);
    expect(RfuGetStatus(runtime)).toBe(RFU_STATUS_CONNECTION_ERROR);
    expect(RfuGetErrorInfo(runtime)).toBe(0x55);
    expect(RfuHasErrored(runtime)).toBe(true);

    StartSendingKeysToRfu(runtime);
    expect(runtime.gRfu.callback).toBe('Rfu_BerryBlenderSendHeldKeys');

    SendDisconnectCommand(0b1010, 1, runtime);
    expect(runtime.gSendCmd[0]).toBe(0xed0a);
    expect(runtime.gSendCmd[1]).toBe(1);

    DisconnectRfu(runtime);
    expect(runtime.receivedRemoteLinkPlayers).toBe(false);

    LinkRfu_StopManagerAndFinalizeSlots(runtime);
    expect(runtime.gRfu.acceptSlot_flag).toBe(runtime.lman.acceptSlot_flag);

    LoadLinkPlayerIds(3, runtime);
    expect(runtime.selectedLinkPlayerIds.slice(0, 3)).toEqual([0, 1, 2]);

    expect(IsRfuSerialNumberValid(0x00008001)).toBe(true);
    RfuReloadCommon(runtime);
    RfuReloadSave(runtime);
    expect(runtime.commonReloaded).toBe(true);
    expect(runtime.saveReloaded).toBe(true);
    RfuSoftReset(runtime);
    expect(runtime.softReset).toBe(true);
  });
});
