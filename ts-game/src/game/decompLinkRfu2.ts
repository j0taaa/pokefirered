export const MAX_RFU_PLAYERS = 5;
export const RFU_CHILD_MAX = 4;
export const CMD_LENGTH = 8;
export const COMM_SLOT_LENGTH = (CMD_LENGTH - 1) * 2;
export const MODE_NEUTRAL = 0;
export const MODE_PARENT = 1;
export const MODE_CHILD = 2;
export const MODE_P_C_SWITCH = 3;
export const RFUSTATE_INIT = 0;
export const RFUSTATE_INIT_END = 1;
export const RFUSTATE_PARENT_CONNECT = 2;
export const RFUSTATE_PARENT_CONNECT_END = 3;
export const RFUSTATE_STOP_MANAGER = 4;
export const RFUSTATE_STOP_MANAGER_END = 5;
export const RFUSTATE_CHILD_CONNECT = 6;
export const RFUSTATE_CHILD_CONNECT_END = 7;
export const RFUSTATE_RECONNECTED = 9;
export const RFUSTATE_CONNECTED = 10;
export const RFUSTATE_CHILD_TRY_JOIN = 11;
export const RFUSTATE_CHILD_JOINED = 12;
export const RFUSTATE_UR_PLAYER_EXCHANGE = 13;
export const RFUSTATE_UR_STOP_MANAGER = 14;
export const RFUSTATE_UR_STOP_MANAGER_END = 15;
export const RFUSTATE_UR_FINALIZE = 16;
export const RFUSTATE_PARENT_FINALIZE_START = 17;
export const RFUSTATE_PARENT_FINALIZE = 18;
export const RFUSTATE_UR_CONNECT = 17;
export const RFUSTATE_UR_CONNECT_END = 18;
export const RFUSTATE_FINALIZED = 20;
export const RFU_STATUS_OK = 0;
export const RFU_STATUS_NEW_CHILD_DETECTED = 1;
export const RFU_STATUS_JOIN_GROUP_OK = 2;
export const RFU_STATUS_JOIN_GROUP_NO = 3;
export const RFU_STATUS_LEAVE_GROUP = 4;
export const RFU_STATUS_CONNECTION_ERROR = 5;
export const RFU_STATUS_FATAL_ERROR = 6;
export const RFU_ERROR_STATE_NONE = 0;
export const RFU_ERROR_STATE_IGNORE = 1;
export const RFU_DISCONNECT_NONE = 0;
export const RFU_DISCONNECT_NORMAL = 1;
export const RFU_DISCONNECT_ERROR = 2;
export const RFUCMD_SEND_BLOCK = 0x8800;
export const RFUCMD_READY_CLOSE_LINK = 0x5f00;
export const RFUCMD_READY_EXIT_STANDBY = 0x6600;
export const RFUCMD_DISCONNECT = 0xed00;

export interface Rfu2Task { func: string; data: number[]; destroyed: boolean; }
export interface Rfu2BlockSend { active: boolean; payload: number[]; size: number; count: number; next: number; receiving: number; receivedFlags: number; failedFlags: number; owner: number; }
export interface Rfu2Player { name: string; trainerId: number; activity: number; serialNo: number; gender: number; language: number; }
export interface Rfu2Manager {
  parentChild: number;
  state: number;
  errorState: number;
  status: number;
  errorInfo: number;
  parentFinished: boolean;
  parentSlots: number;
  parentSendSlot: number;
  acceptSlot_flag: number;
  childSlot: number;
  childSendCount: number;
  childSendCmdId: number;
  parentId: number;
  reconnectParentId: number;
  linkPlayerIdx: number[];
  childRecvIds: number[];
  numChildRecvErrors: number[];
  childRecvBuffer: number[][];
  childSendBuffer: number[];
  childRecvQueue: number[];
  recvCmds: number[][][];
  sendBlock: Rfu2BlockSend;
  recvBlock: Rfu2BlockSend[];
  recvQueue: number[][];
  sendQueue: number[][];
  backupQueue: number[][];
  linkRecovered: boolean;
  disconnectSlots: number;
  disconnectMode: number;
  runParentMain2: boolean;
  parentMain2Failed: boolean;
  nextChildBits: number;
  incomingChild: number;
  stopNewConnections: boolean;
  callback: string | null;
  searchTaskId: number;
  playerExchangeActive: boolean;
  isMaster: boolean;
  normalDisconnectMode: boolean;
  recoveringFromLinkLoss: boolean;
  ignoreError: boolean;
  multiplayerId: number;
  linkPlayerCount: number;
}
export interface LinkRfu2Runtime {
  gRfu: Rfu2Manager;
  tasks: Rfu2Task[];
  operations: string[];
  gSendCmd: number[];
  gRecvCmds: number[][];
  gLinkPlayers: Rfu2Player[];
  selectedLinkPlayerIds: number[];
  hostUsername: string;
  hostGameData: { activity: number; child_sprite_gender: number[]; playerTrainerId: number; locked: boolean; wonderFlags: number; tradeSpecies: number; tradeLevel: number; };
  linkStatus: { sendSlotUNIFlag: number; connSlotFlag: number; linkLossSlotFlag: number; partner: Array<{ id: number; serialNo: number; name: string; trainerId: number; activity: number; }>; };
  lman: { acceptSlot_flag: number; parentAck_flag: number; childClockSlave_flag: number; state: number; next_state: number; };
  receivedRemoteLinkPlayers: boolean;
  leavingGroupMembers: Set<number>;
  serialNumber: number;
  softReset: boolean;
  commonReloaded: boolean;
  saveReloaded: boolean;
}

const playerBitsToNewChildIdx = [0, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0];
const playerBitsToCount = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
const emptyBlock = (): Rfu2BlockSend => ({ active: false, payload: [], size: 0, count: 0, next: 0, receiving: 0, receivedFlags: 0, failedFlags: 0, owner: 0 });
const emptyPlayer = (): Rfu2Player => ({ name: '', trainerId: 0, activity: 0, serialNo: 0, gender: 0, language: 0 });
let activeRuntime: LinkRfu2Runtime | null = null;

export function createLinkRfu2Runtime(): LinkRfu2Runtime {
  const runtime: LinkRfu2Runtime = {
    gRfu: {
      parentChild: MODE_NEUTRAL, state: RFUSTATE_INIT, errorState: RFU_ERROR_STATE_NONE, status: RFU_STATUS_OK, errorInfo: 0,
      parentFinished: false, parentSlots: 0, parentSendSlot: 0, acceptSlot_flag: 0, childSlot: 0, childSendCount: 0, childSendCmdId: 0,
      parentId: 0, reconnectParentId: 0, linkPlayerIdx: Array.from({ length: RFU_CHILD_MAX }, () => 0), childRecvIds: Array.from({ length: RFU_CHILD_MAX }, () => 0xff),
      numChildRecvErrors: Array.from({ length: RFU_CHILD_MAX }, () => 0), childRecvBuffer: Array.from({ length: RFU_CHILD_MAX }, () => Array.from({ length: COMM_SLOT_LENGTH }, () => 0)),
      childSendBuffer: Array.from({ length: COMM_SLOT_LENGTH }, () => 0), childRecvQueue: Array.from({ length: COMM_SLOT_LENGTH * MAX_RFU_PLAYERS }, () => 0),
      recvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: CMD_LENGTH - 1 }, () => [0, 0])),
      sendBlock: emptyBlock(), recvBlock: Array.from({ length: MAX_RFU_PLAYERS }, emptyBlock), recvQueue: [], sendQueue: [], backupQueue: [],
      linkRecovered: false, disconnectSlots: 0, disconnectMode: RFU_DISCONNECT_NONE, runParentMain2: false, parentMain2Failed: false, nextChildBits: 0,
      incomingChild: 0, stopNewConnections: false, callback: null, searchTaskId: -1, playerExchangeActive: false, isMaster: false,
      normalDisconnectMode: false, recoveringFromLinkLoss: false, ignoreError: false, multiplayerId: 0, linkPlayerCount: 1
    },
    tasks: [], operations: [], gSendCmd: Array.from({ length: CMD_LENGTH }, () => 0), gRecvCmds: Array.from({ length: MAX_RFU_PLAYERS }, () => Array.from({ length: CMD_LENGTH }, () => 0)),
    gLinkPlayers: Array.from({ length: MAX_RFU_PLAYERS }, emptyPlayer), selectedLinkPlayerIds: Array.from({ length: MAX_RFU_PLAYERS }, () => 0),
    hostUsername: '', hostGameData: { activity: 0, child_sprite_gender: [0, 0, 0, 0], playerTrainerId: 0, locked: false, wonderFlags: 0, tradeSpecies: 0, tradeLevel: 0 },
    linkStatus: { sendSlotUNIFlag: 1, connSlotFlag: 0, linkLossSlotFlag: 0, partner: Array.from({ length: RFU_CHILD_MAX }, () => ({ id: 0, serialNo: 0, name: '', trainerId: 0, activity: 0 })) },
    lman: { acceptSlot_flag: 0, parentAck_flag: 0, childClockSlave_flag: 1, state: 0, next_state: 0 },
    receivedRemoteLinkPlayers: false, leavingGroupMembers: new Set(), serialNumber: 0x00008001, softReset: false, commonReloaded: false, saveReloaded: false
  };
  activeRuntime = runtime;
  return runtime;
}
const req = (runtime?: LinkRfu2Runtime): LinkRfu2Runtime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('link_rfu_2 runtime is not active'); return r; };
const op = (r: LinkRfu2Runtime, name: string, ...args: Array<string | number | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const createTask = (r: LinkRfu2Runtime, func: string): number => { const id = r.tasks.length; r.tasks.push({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false }); return id; };
const destroyTask = (r: LinkRfu2Runtime, id: number): void => { if (r.tasks[id]) r.tasks[id].destroyed = true; };
const countBits = (bits: number): number => playerBitsToCount[bits & 0xf] ?? 0;
const enqueue = (q: number[][], data: number[]): void => { q.push([...data]); };
const dequeue = (q: number[][], size = COMM_SLOT_LENGTH): number[] => q.shift() ?? Array.from({ length: size }, () => 0);

export function Debug_PrintString(_string: unknown, x: number, y: number, r = req()): void { op(r, 'Debug_PrintString', x, y); }
export function Debug_PrintNum(num: number, x: number, y: number, numDigits: number, r = req()): void { op(r, 'Debug_PrintNum', num, x, y, numDigits); }
export function ResetLinkRfuGFLayer(r = req()): void { const err = r.gRfu.errorState; const fresh = createLinkRfu2Runtime().gRfu; r.gRfu = fresh; r.gRfu.errorState = err === RFU_ERROR_STATE_IGNORE ? err : RFU_ERROR_STATE_NONE; r.gSendCmd.fill(0); r.gRecvCmds.forEach(row => row.fill(0)); r.gLinkPlayers = Array.from({ length: MAX_RFU_PLAYERS }, emptyPlayer); op(r, 'ResetLinkRfuGFLayer'); activeRuntime = r; }
export function InitRFU(r = req()): void { InitRFUAPI(r); op(r, 'rfu_REQ_stopMode'); }
export function InitRFUAPI(r = req()): void { RfuSetIgnoreError(false, r); ResetLinkRfuGFLayer(r); op(r, 'rfu_initializeAPI'); }
export function Task_ParentSearchForChildren(taskId: number, r = req()): void { UpdateChildStatuses(r); if (r.gRfu.state === RFUSTATE_INIT) r.gRfu.state = RFUSTATE_INIT_END; else if (r.gRfu.state === RFUSTATE_PARENT_CONNECT) r.gRfu.state = RFUSTATE_PARENT_CONNECT_END; else if (r.gRfu.state === RFUSTATE_STOP_MANAGER) r.gRfu.state = RFUSTATE_STOP_MANAGER_END; else if (r.gRfu.state === RFUSTATE_PARENT_FINALIZE) { InitChildRecvBuffers(r); InitParentSendData(r); r.gRfu.state = RFUSTATE_FINALIZED; createTask(r, 'Task_PlayerExchange'); destroyTask(r, taskId); } op(r, 'Task_ParentSearchForChildren', r.gRfu.state); }
export function Rfu_GetIndexOfNewestChild(bits: number): number { return playerBitsToNewChildIdx[bits & 0xf] ?? 0; }
export function SetLinkPlayerIdsFromSlots(baseSlots: number, addSlots: number, r = req()): void { let baseId = 1; if (addSlots === -1) { for (let i = 0; i < RFU_CHILD_MAX; i++) if ((baseSlots >> i) & 1) r.gRfu.linkPlayerIdx[i] = baseId++; } else { for (let i = 0; i < RFU_CHILD_MAX; i++) if (!((baseSlots >> i) & 1)) r.gRfu.linkPlayerIdx[i] = 0; let newId = 1; while (r.gRfu.linkPlayerIdx.includes(newId)) newId++; for (let i = 0, bits = addSlots & ~baseSlots; i < RFU_CHILD_MAX; i++) if ((bits >> i) & 1) r.gRfu.linkPlayerIdx[i] = newId++; } }
export function Task_ChildSearchForParent(taskId: number, r = req()): void { if (r.gRfu.state === RFUSTATE_INIT) r.gRfu.state = RFUSTATE_INIT_END; else if (r.gRfu.state === RFUSTATE_CHILD_CONNECT) r.gRfu.state = RFUSTATE_CHILD_CONNECT_END; else if (r.gRfu.state === RFUSTATE_RECONNECTED) r.tasks[taskId].data[1] = 10; else if (r.gRfu.state === RFUSTATE_CHILD_TRY_JOIN && GetJoinGroupStatus(r) === RFU_STATUS_JOIN_GROUP_OK) r.gRfu.state = RFUSTATE_CHILD_JOINED; else if (r.gRfu.state === RFUSTATE_CHILD_JOINED) { r.gRfu.parentChild = MODE_CHILD; createTask(r, 'Task_PlayerExchange'); destroyTask(r, taskId); } op(r, 'Task_ChildSearchForParent', r.gRfu.state); }
export function InitChildRecvBuffers(r = req()): void { r.gRfu.childRecvBuffer.forEach(buf => buf.fill(0)); op(r, 'InitChildRecvBuffers', r.lman.acceptSlot_flag); }
export function InitParentSendData(r = req()): void { const slots = r.lman.acceptSlot_flag || r.gRfu.acceptSlot_flag; r.gRfu.parentSendSlot = Rfu_GetIndexOfNewestChild(slots); r.gRfu.parentSlots = slots; SetLinkPlayerIdsFromSlots(slots, -1, r); r.gRfu.parentChild = MODE_PARENT; }
export function Task_UnionRoomListen(taskId: number, r = req()): void { if (r.gRfu.state === RFUSTATE_INIT) r.gRfu.state = RFUSTATE_INIT_END; else if (r.gRfu.state === RFUSTATE_UR_CONNECT) r.gRfu.state = RFUSTATE_UR_CONNECT_END; else if (r.gRfu.state === RFUSTATE_UR_PLAYER_EXCHANGE) { r.gRfu.parentChild = MODE_CHILD; createTask(r, r.tasks[taskId]?.data[7] ? 'Task_PlayerExchangeChat' : 'Task_PlayerExchange'); destroyTask(r, taskId); } else if (r.gRfu.state === RFUSTATE_UR_STOP_MANAGER) r.gRfu.state = RFUSTATE_UR_STOP_MANAGER_END; else if (r.gRfu.state === RFUSTATE_UR_FINALIZE) { InitChildRecvBuffers(r); InitParentSendData(r); r.gRfu.state = RFUSTATE_FINALIZED; r.gRfu.playerExchangeActive = true; destroyTask(r, taskId); } op(r, 'Task_UnionRoomListen', r.gRfu.state); }
export function LinkRfu_CreateConnectionAsParent(r = req()): void { r.gRfu.parentChild = MODE_PARENT; r.gRfu.state = RFUSTATE_PARENT_CONNECT_END; op(r, 'rfu_LMAN_establishConnection:parent'); }
export function LinkRfu_StopManagerBeforeEnteringChat(r = req()): void { r.gRfu.state = RFUSTATE_STOP_MANAGER_END; op(r, 'rfu_LMAN_stopManager'); }
export function LinkRfu_ForceChangeSpParent(r = req()): void { if (r.gRfu.parentId === 0) op(r, 'rfu_LMAN_forceChangeSP'); }
export function MscCallback_Child(_REQ_commandID = 0, r = req()): void { r.gRfu.childSendBuffer.fill(0); r.gRfu.childSendCount++; enqueue(r.gRfu.recvQueue, r.gRfu.childRecvQueue); UpdateBackupQueue(r); op(r, 'MscCallback_Child'); }
export function MSCCallback_Parent(_REQ_commandID = 0, r = req()): void { r.gRfu.parentFinished = true; }
export function LinkRfu_Shutdown(r = req()): void { r.tasks.forEach(t => { if (['Task_PlayerExchange', 'Task_PlayerExchangeUpdate', 'Task_PlayerExchangeChat', 'Task_ParentSearchForChildren', 'Task_ChildSearchForParent', 'Task_UnionRoomListen'].includes(t.func)) t.destroyed = true; }); ResetLinkRfuGFLayer(r); op(r, 'LinkRfu_Shutdown'); }
export function CreateTask_ParentSearchForChildren(r = req()): void { r.gRfu.searchTaskId = createTask(r, 'Task_ParentSearchForChildren'); }
export function CanTryReconnectParent(r = req()): boolean { return r.gRfu.state === RFUSTATE_CHILD_CONNECT_END && r.gRfu.parentId !== 0; }
export function TryReconnectParent(r = req()): boolean { if (CanTryReconnectParent(r)) { r.gRfu.state = RFUSTATE_RECONNECTED; return true; } return false; }
export function CreateTask_ChildSearchForParent(r = req()): void { r.gRfu.searchTaskId = createTask(r, 'Task_ChildSearchForParent'); }
export function LmanAcceptSlotFlagIsNotZero(r = req()): boolean { return r.lman.acceptSlot_flag !== 0; }
export function LinkRfu_StopManagerAndFinalizeSlots(r = req()): void { r.gRfu.state = RFUSTATE_STOP_MANAGER; r.gRfu.acceptSlot_flag = r.lman.acceptSlot_flag; }
export function WaitRfuState(force: boolean, r = req()): boolean { if (r.gRfu.state === RFUSTATE_PARENT_FINALIZE_START || force) { r.gRfu.state = RFUSTATE_PARENT_FINALIZE; return true; } return false; }
export function StopUnionRoomLinkManager(r = req()): void { r.gRfu.state = RFUSTATE_UR_STOP_MANAGER; }
export function ReadySendDataForSlots(slots: number, r = req()): void { op(r, 'rfu_UNI_readySendData', Rfu_GetIndexOfNewestChild(slots)); }
export function ReadAllPlayerRecvCmds(r = req()): void { for (let i = 0; i < MAX_RFU_PLAYERS; i++) for (let j = 0; j < CMD_LENGTH - 1; j++) { r.gRfu.recvCmds[i][j][0] = r.gRecvCmds[i][j] & 0xff; r.gRfu.recvCmds[i][j][1] = r.gRecvCmds[i][j] >> 8; r.gRecvCmds[i][j] = 0; } }
export function MoveSendCmdToRecv(r = req()): void { for (let i = 0; i < CMD_LENGTH - 1; i++) { r.gRecvCmds[0][i] = r.gSendCmd[i]; r.gSendCmd[i] = 0; } }
export function UpdateBackupQueue(r = req()): void { if (r.gRfu.linkRecovered) { r.gRfu.childSendBuffer = dequeue(r.gRfu.backupQueue); if (r.gRfu.backupQueue.length === 0) r.gRfu.linkRecovered = false; } else { r.gRfu.childSendBuffer = dequeue(r.gRfu.sendQueue); enqueue(r.gRfu.backupQueue, r.gRfu.childSendBuffer); } }
export function IsRfuRecvQueueEmpty(r = req()): boolean { return r.linkStatus.sendSlotUNIFlag !== 0 && r.gRecvCmds.every(row => row.every(v => v === 0)); }
export function RfuMain1_Parent(r = req()): boolean { if (r.gRfu.state >= RFUSTATE_FINALIZED) { ReadAllPlayerRecvCmds(r); r.gRfu.runParentMain2 = true; } op(r, 'RfuMain1_Parent'); return false; }
export function RfuMain2_Parent(r = req()): boolean { if (r.gRfu.runParentMain2) { MoveSendCmdToRecv(r); RfuHandleReceiveCommand(0, r); CallRfuFunc(r); r.gRfu.runParentMain2 = false; } return r.linkStatus.sendSlotUNIFlag ? r.gRfu.parentMain2Failed : false; }
export function ChildBuildSendCmd(sendCmd: number[], dst: number[], r = req()): void { if (sendCmd[0]) { sendCmd[0] |= r.gRfu.childSendCmdId << 5; r.gRfu.childSendCmdId = (r.gRfu.childSendCmdId + 1) & 7; for (let i = 0; i < CMD_LENGTH - 1; i++) { dst[2 * i] = sendCmd[i] & 0xff; dst[2 * i + 1] = sendCmd[i] >> 8; } } else dst.fill(0); }
export function RfuMain1_Child(r = req()): boolean { const recv = dequeue(r.gRfu.recvQueue, COMM_SLOT_LENGTH * MAX_RFU_PLAYERS); for (let i = 0; i < MAX_RFU_PLAYERS; i++) for (let j = 0; j < CMD_LENGTH - 1; j++) r.gRecvCmds[i][j] = recv[i * COMM_SLOT_LENGTH + j * 2] | (recv[i * COMM_SLOT_LENGTH + j * 2 + 1] << 8); RfuHandleReceiveCommand(0, r); if (r.gRfu.childSendCount) { r.gRfu.childSendCount--; const send = Array.from({ length: COMM_SLOT_LENGTH }, () => 0); ChildBuildSendCmd(r.gSendCmd, send, r); enqueue(r.gRfu.sendQueue, send); r.gSendCmd.fill(0); } return IsRfuRecvQueueEmpty(r); }
export function HandleSendFailure(_unused = 0, flags = 0, r = req()): void { for (let i = 0; i < r.gRfu.sendBlock.count; i++) { if (!((flags >> i) & 1)) { r.gRfu.sendBlock.failedFlags |= 1 << i; enqueue(r.gRfu.sendQueue, [RFUCMD_SEND_BLOCK | i]); } } }
export function Rfu_SetBlockReceivedFlag(playerId: number, r = req()): void { r.gRfu.recvBlock[playerId].receivedFlags |= 1; }
export function Rfu_ResetBlockReceivedFlag(playerId: number, r = req()): void { r.gRfu.recvBlock[playerId].receivedFlags = 0; }
export function LoadLinkPlayerIds(playerCount = MAX_RFU_PLAYERS, r = req()): void { r.gRfu.linkPlayerCount = playerCount; r.selectedLinkPlayerIds = Array.from({ length: playerCount }, (_v, i) => i); }
export function SendKeysToRfu(keys = 0, r = req()): void { r.gSendCmd[0] = keys; }
export function IsSendingKeysToRfu(r = req()): boolean { return r.gRfu.callback === 'Rfu_BerryBlenderSendHeldKeys'; }
export function StartSendingKeysToRfu(r = req()): void { r.gRfu.callback = 'Rfu_BerryBlenderSendHeldKeys'; }
export function ClearLinkRfuCallback(r = req()): void { r.gRfu.callback = null; }
export function Rfu_BerryBlenderSendHeldKeys(r = req()): void { SendKeysToRfu(r.gSendCmd[0], r); }
export function Rfu_SetBerryBlenderLinkCallback(r = req()): void { r.gRfu.callback = 'Rfu_BerryBlenderSendHeldKeys'; }
export function RfuHandleReceiveCommand(_unused = 0, r = req()): void { if ((r.gRecvCmds[0][0] & 0xff00) === RFUCMD_DISCONNECT) r.gRfu.disconnectSlots |= r.gRecvCmds[0][0] & 0xff; }
export function AreAllPlayersReadyToReceive(r = req()): boolean { return r.gRfu.recvBlock.every((b, i) => i >= r.gRfu.linkPlayerCount || b.receiving >= 1); }
export function AreAllPlayersFinishedReceiving(r = req()): boolean { return r.gRfu.recvBlock.every((b, i) => i >= r.gRfu.linkPlayerCount || b.receiving >= 2); }
export function ResetSendDataManager(data = emptyBlock()): void { Object.assign(data, emptyBlock()); }
export function Rfu_GetBlockReceivedStatus(playerId = 0, r = req()): number { return r.gRfu.recvBlock[playerId].receivedFlags; }
export function RfuPrepareSendBuffer(command: number, r = req()): void { r.gSendCmd[0] = command; }
export function Rfu_SendPacket(packet: number[], r = req()): void { enqueue(r.gRfu.sendQueue, packet); }
export function Rfu_InitBlockSend(src: number[], size: number, r = req()): void { r.gRfu.sendBlock = { ...emptyBlock(), active: true, payload: [...src], size, count: Math.ceil(size / (COMM_SLOT_LENGTH - 2)), receiving: 1 }; }
export function HandleBlockSend(r = req()): void { if (!r.gRfu.sendBlock.active) return; if (r.gRfu.sendBlock.next < r.gRfu.sendBlock.count - 1) SendNextBlock(r); else SendLastBlock(r); }
export function SendNextBlock(r = req()): void { const i = r.gRfu.sendBlock.next++; Rfu_SendPacket([RFUCMD_SEND_BLOCK | i, ...r.gRfu.sendBlock.payload.slice(i * 12, i * 12 + 12)], r); }
export function SendLastBlock(r = req()): void { SendNextBlock(r); r.gRfu.sendBlock.active = false; r.gRfu.sendBlock.receiving = 2; }
export function Rfu_SendBlockRequest(type = 0, r = req()): void { RfuPrepareSendBuffer(0x7700 | type, r); }
export function RfuShutdownAfterDisconnect(r = req()): void { DisconnectRfu(r); LinkRfu_Shutdown(r); }
export function DisconnectRfu(r = req()): void { r.gRfu.disconnectMode = RFU_DISCONNECT_NORMAL; r.receivedRemoteLinkPlayers = false; op(r, 'DisconnectRfu'); }
export function TryDisconnectRfu(r = req()): boolean { if (r.gRfu.disconnectMode !== RFU_DISCONNECT_NONE) { DisconnectRfu(r); return true; } return false; }
export function LinkRfu_FatalError(r = req()): void { RfuSetStatus(RFU_STATUS_FATAL_ERROR, r.gRfu.errorInfo, r); }
export function WaitAllReadyToCloseLink(r = req()): boolean { return r.gRecvCmds.every(row => row[0] === RFUCMD_READY_CLOSE_LINK || row[0] === 0); }
export function SendReadyCloseLink(r = req()): void { r.gSendCmd[0] = RFUCMD_READY_CLOSE_LINK; }
export function Task_TryReadyCloseLink(taskId: number, r = req()): void { SendReadyCloseLink(r); if (WaitAllReadyToCloseLink(r)) destroyTask(r, taskId); }
export function Rfu_SetCloseLinkCallback(r = req()): void { r.gRfu.callback = 'SendReadyCloseLink'; }
export function SendReadyExitStandbyUntilAllReady(r = req()): boolean { r.gSendCmd[0] = RFUCMD_READY_EXIT_STANDBY; return r.gRecvCmds.every(row => row[0] === RFUCMD_READY_EXIT_STANDBY || row[0] === 0); }
export function LinkLeaderReadyToExitStandby(r = req()): boolean { return SendReadyExitStandbyUntilAllReady(r); }
export function Rfu_LinkStandby(r = req()): void { r.gRfu.callback = 'SendReadyExitStandbyUntilAllReady'; }
export function Rfu_SetLinkStandbyCallback(r = req()): void { r.gRfu.callback = 'Rfu_LinkStandby'; }
export function IsRfuSerialNumberValid(serialNo: number): boolean { return [0x00008001, 0x00008002].includes(serialNo); }
export function Rfu_SetLinkRecovery(enable = true, r = req()): void { r.gRfu.recoveringFromLinkLoss = enable; }
export function Rfu_StopPartnerSearch(r = req()): void { r.gRfu.stopNewConnections = true; }
export function Rfu_GetMultiplayerId(r = req()): number { return r.gRfu.multiplayerId; }
export function Rfu_GetLinkPlayerCount(r = req()): number { return r.gRfu.linkPlayerCount; }
export function IsLinkRfuTaskFinished(r = req()): boolean { return r.gRfu.searchTaskId < 0 || !!r.tasks[r.gRfu.searchTaskId]?.destroyed; }
export function CallRfuFunc(r = req()): void { if (r.gRfu.callback) op(r, 'CallRfuFunc', r.gRfu.callback); }
export function CheckForLeavingGroupMembers(r = req()): boolean { return r.leavingGroupMembers.size > 0; }
export function RfuTryDisconnectLeavingChildren(r = req()): void { r.leavingGroupMembers.forEach(id => r.gRfu.disconnectSlots |= 1 << id); }
export function HasTrainerLeftPartnersList(name: string, trainerId: number, r = req()): boolean { return !r.linkStatus.partner.some(p => p.name === name && p.trainerId === trainerId); }
export function SendRfuStatusToPartner(status = 0, r = req()): void { r.gSendCmd[0] = status; }
export function SendLeaveGroupNotice(r = req()): void { SendRfuStatusToPartner(RFU_STATUS_LEAVE_GROUP, r); }
export function WaitSendRfuStatusToPartner(r = req()): boolean { return r.gSendCmd[0] !== 0; }
export function UpdateChildStatuses(r = req()): void { r.gRfu.nextChildBits = r.lman.acceptSlot_flag & ~r.gRfu.parentSlots; }
export function GetJoinGroupStatus(r = req()): number { return r.gRfu.status; }
export function Task_PlayerExchange(taskId: number, r = req()): void { r.gRfu.playerExchangeActive = true; ReceiveRfuLinkPlayers(r); destroyTask(r, taskId); }
export function ClearSelectedLinkPlayerIds(disconnectMask = 0, r = req()): void { r.selectedLinkPlayerIds = r.selectedLinkPlayerIds.map((id, i) => ((disconnectMask >> i) & 1 ? 0 : id)); }
export function ReceiveRfuLinkPlayers(r = req()): void { r.receivedRemoteLinkPlayers = true; r.gRfu.linkPlayerCount = Math.max(1, countBits(r.gRfu.parentSlots) + 1); }
export function ValidateAndReceivePokemonSioInfo(_recvBuffer: unknown, r = req()): void { ReceiveRfuLinkPlayers(r); }
export function Task_PlayerExchangeUpdate(taskId: number, r = req()): void { ReceiveRfuLinkPlayers(r); r.gRfu.incomingChild = 0; destroyTask(r, taskId); }
export function Task_PlayerExchangeChat(taskId: number, r = req()): void { r.gRfu.playerExchangeActive = true; r.hostGameData.activity |= 0x40; destroyTask(r, taskId); }
export function RfuCheckErrorStatus(r = req()): boolean { return RfuHasErrored(r); }
export function RfuMain1_UnionRoom(r = req()): boolean { UpdateChildStatuses(r); return RfuMain1(r); }
export function RfuMain1(r = req()): boolean { return r.gRfu.parentChild === MODE_PARENT ? RfuMain1_Parent(r) : RfuMain1_Child(r); }
export function RfuMain2(r = req()): boolean { return r.gRfu.parentChild === MODE_PARENT ? RfuMain2_Parent(r) : false; }
export function SetHostRfuUsername(name: string, r = req()): void { r.hostUsername = name.slice(0, 7); }
export function ResetHostRfuGameData(r = req()): void { r.hostGameData = { activity: 0, child_sprite_gender: [0, 0, 0, 0], playerTrainerId: 0, locked: false, wonderFlags: 0, tradeSpecies: 0, tradeLevel: 0 }; }
export function SetHostRfuGameData(activity = 0, r = req()): void { r.hostGameData.activity = activity; }
export function GetHostRfuGameData(r = req()): LinkRfu2Runtime['hostGameData'] { return r.hostGameData; }
export function SetHostRfuWonderFlags(flags = 0, r = req()): void { r.hostGameData.wonderFlags = flags; }
export function SetTradeBoardRegisteredMonInfo(species: number, level: number, r = req()): void { r.hostGameData.tradeSpecies = species; r.hostGameData.tradeLevel = level; }
export function UpdateGameData_GroupLockedIn(locked: boolean, r = req()): void { r.hostGameData.locked = locked; }
export function UpdateGameData_SetActivity(activity: number, r = req()): void { r.hostGameData.activity = activity; }
export function SetUnionRoomChatPlayerData(r = req()): void { r.hostGameData.activity |= 0x40; }
export function RfuSetErrorParams(errorInfo: number, r = req()): void { r.gRfu.errorInfo = errorInfo; r.gRfu.errorState = RFU_ERROR_STATE_NONE; }
export function ResetErrorState(r = req()): void { r.gRfu.errorState = RFU_ERROR_STATE_NONE; r.gRfu.errorInfo = 0; }
export function RfuSetIgnoreError(ignore: boolean, r = req()): void { r.gRfu.ignoreError = ignore; r.gRfu.errorState = ignore ? RFU_ERROR_STATE_IGNORE : RFU_ERROR_STATE_NONE; }
export function DisconnectNewChild(r = req()): void { r.gRfu.disconnectSlots |= r.gRfu.incomingChild; r.gRfu.incomingChild = 0; }
export function StartDisconnectNewChild(r = req()): void { createTask(r, 'DisconnectNewChild'); }
export function LinkManagerCB_Parent(msg = 0, param = 0, r = req()): void { if (msg) RfuSetStatus(RFU_STATUS_OK, param, r); }
export function LinkManagerCB_Child(msg = 0, param = 0, r = req()): void { LinkManagerCB_Parent(msg, param, r); }
export function ParentResetChildRecvMetadata(slot: number, r = req()): void { r.gRfu.childRecvIds[slot] = 0xff; r.gRfu.numChildRecvErrors[slot] = 0; }
export function GetNewChildrenInUnionRoomChat(r = req()): number { return r.gRfu.nextChildBits; }
export function LinkManagerCB_UnionRoom(msg = 0, param = 0, r = req()): void { LinkManagerCB_Parent(msg, param, r); }
export function RfuSetNormalDisconnectMode(r = req()): void { r.gRfu.normalDisconnectMode = true; r.gRfu.disconnectMode = RFU_DISCONNECT_NORMAL; }
export function RfuSetStatus(status: number, errorInfo = 0, r = req()): void { r.gRfu.status = status; r.gRfu.errorInfo = errorInfo; }
export function RfuGetStatus(r = req()): number { return r.gRfu.status; }
export function RfuGetErrorInfo(r = req()): number { return r.gRfu.errorInfo; }
export function RfuHasErrored(r = req()): boolean { return !r.gRfu.ignoreError && r.gRfu.status >= RFU_STATUS_CONNECTION_ERROR; }
export function Rfu_IsPlayerExchangeActive(r = req()): boolean { return r.gRfu.playerExchangeActive; }
export function Rfu_IsMaster(r = req()): boolean { return r.gRfu.isMaster || r.gRfu.parentChild === MODE_PARENT; }
export function RfuVSync(r = req()): void { op(r, 'RfuVSync'); }
export function ClearRecvCommands(r = req()): void { r.gRecvCmds.forEach(row => row.fill(0)); }
export function VBlank_RfuIdle(r = req()): void { RfuVSync(r); }
export function Debug_RfuIdle(r = req()): void { op(r, 'Debug_RfuIdle'); }
export function IsUnionRoomListenTaskActive(r = req()): boolean { return r.tasks.some(t => t.func === 'Task_UnionRoomListen' && !t.destroyed); }
export function CreateTask_RfuIdle(r = req()): void { createTask(r, 'Task_Idle'); }
export function DestroyTask_RfuIdle(r = req()): void { r.tasks.forEach(t => { if (t.func === 'Task_Idle') t.destroyed = true; }); }
export function CB2_RfuIdle(r = req()): void { op(r, 'CB2_RfuIdle'); }
export function InitializeRfuLinkManager_LinkLeader(r = req()): void { ResetLinkRfuGFLayer(r); r.gRfu.parentChild = MODE_PARENT; CreateTask_ParentSearchForChildren(r); }
export function InitializeRfuLinkManager_JoinGroup(r = req()): void { ResetLinkRfuGFLayer(r); r.gRfu.parentChild = MODE_CHILD; CreateTask_ChildSearchForParent(r); }
export function InitializeRfuLinkManager_EnterUnionRoom(r = req()): void { ResetLinkRfuGFLayer(r); r.gRfu.parentChild = MODE_P_C_SWITCH; r.gRfu.searchTaskId = createTask(r, 'Task_UnionRoomListen'); }
export function ReadU16(ptr: number[] | Uint8Array, offset = 0): number { return (ptr[offset] ?? 0) | ((ptr[offset + 1] ?? 0) << 8); }
export function GetPartnerIndexByNameAndTrainerID(trainerName: string, trainerId: number, r = req()): number { return r.linkStatus.partner.findIndex(p => p.name === trainerName && p.trainerId === trainerId); }
export function RfuReqDisconnectSlot(bmDisconnectSlot: number, r = req()): void { r.gRfu.disconnectSlots |= bmDisconnectSlot; op(r, 'rfu_REQ_disconnect', bmDisconnectSlot); }
export function RequestDisconnectSlotByTrainerNameAndId(name: string, trainerId: number, r = req()): void { const i = GetPartnerIndexByNameAndTrainerID(name, trainerId, r); if (i >= 0) RfuReqDisconnectSlot(1 << i, r); }
export function Rfu_DisconnectPlayerById(id: number, r = req()): void { RfuReqDisconnectSlot(1 << id, r); }
export function Task_SendDisconnectCommand(taskId: number, r = req()): void { SendDisconnectCommand(r.gRfu.disconnectSlots, r.gRfu.disconnectMode, r); destroyTask(r, taskId); }
export function SendDisconnectCommand(playersToDisconnect: number, disconnectMode: number, r = req()): void { r.gSendCmd[0] = RFUCMD_DISCONNECT | playersToDisconnect; r.gSendCmd[1] = disconnectMode; }
export function Task_RfuReconnectWithParent(taskId: number, r = req()): void { if (TryReconnectParent(r)) destroyTask(r, taskId); }
export function CreateTask_RfuReconnectWithParent(r = req()): void { createTask(r, 'Task_RfuReconnectWithParent'); }
export function DestroyTask_RfuReconnectWithParent(r = req()): void { r.tasks.forEach(t => { if (t.func === 'Task_RfuReconnectWithParent') t.destroyed = true; }); }
export function IsPartnerActivityIncompatible(activity: number, r = req()): boolean { return r.hostGameData.activity !== 0 && r.hostGameData.activity !== activity; }
export function Task_TryConnectToUnionRoomParent(taskId: number, r = req()): void { TryConnectToUnionRoomParent(r); destroyTask(r, taskId); }
export function TryConnectToUnionRoomParent(r = req()): boolean { if (r.gRfu.parentId) { r.gRfu.state = RFUSTATE_UR_PLAYER_EXCHANGE; return true; } return false; }
export function IsRfuRecoveringFromLinkLoss(r = req()): boolean { return r.gRfu.recoveringFromLinkLoss; }
export function IsRfuCommunicatingWithAllChildren(r = req()): boolean { return (r.linkStatus.connSlotFlag & r.gRfu.parentSlots) === r.gRfu.parentSlots; }
export function Debug_PrintEmpty(r = req()): void { op(r, 'Debug_PrintEmpty'); }
export function Debug_PrintStatus(r = req()): void { op(r, 'Debug_PrintStatus', r.gRfu.status, r.gRfu.errorInfo); }
export function GetRfuSendQueueLength(r = req()): number { return r.gRfu.sendQueue.length; }
export function GetRfuRecvQueueLength(r = req()): number { return r.gRfu.recvQueue.length; }
export function RfuReloadCommon(r = req()): void { r.commonReloaded = true; }
export function RfuReloadSave(r = req()): void { r.saveReloaded = true; }
export function RfuSoftReset(r = req()): void { r.softReset = true; ResetLinkRfuGFLayer(r); }
export function Task_Idle(taskId: number, r = req()): void { op(r, 'Task_Idle', taskId); }
