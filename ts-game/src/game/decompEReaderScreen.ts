import {
  EREADER_CANCEL_KEY_MASK,
  EREADER_CANCEL_TIMEOUT_MASK,
  EREADER_CHECKSUM_OK_MASK,
  EREADER_XFER_MASK,
  type EReaderRuntime as EReaderHelperRuntime,
  createEReaderRuntime,
  eReaderHelperClearsSendRecvMgr,
  eReaderHelperRestoreRegsState,
  eReaderHelperSaveRegsState,
  eReaderHandleTransfer,
} from './decompEReaderHelpers';

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const INTR_FLAG_VCOUNT = 1 << 2;
export const LINKTYPE_EREADER_FRLG = 0x5502;
export const MASTER_HANDSHAKE = 0x8fff;
export const SLAVE_HANDSHAKE = 0xb9a0;
export const EREADER_HANDSHAKE = 0xccd0;
export const MAX_LINK_PLAYERS = 4;
export const CLIENT_MAX_MSG_SIZE = 64;
export const SE_SELECT = 5;
export const SE_DING_DONG = 66;
export const MUS_OBTAIN_ITEM = 258;

export const TRANSFER_ACTIVE = 0;
export const TRANSFER_SUCCESS = 1;
export const TRANSFER_CANCELED = 2;
export const TRANSFER_TIMEOUT = 3;

export const RECV_STATE_INIT = 0;
export const RECV_STATE_WAIT_START = 1;
export const RECV_STATE_START = 2;
export const RECV_STATE_EXCHANGE = 3;
export const RECV_STATE_START_DISCONNECT = 4;
export const RECV_STATE_WAIT_DISCONNECT = 5;

export const RECV_ACTIVE = 0;
export const RECV_CANCELED = 1;
export const RECV_SUCCESS = 2;
export const RECV_ERROR = 3;
export const RECV_DISCONNECTED = 4;
export const RECV_TIMEOUT = 5;

export const ER_STATE_START = 0;
export const ER_STATE_INIT_LINK = 1;
export const ER_STATE_INIT_LINK_WAIT = 2;
export const ER_STATE_INIT_LINK_CHECK = 3;
export const ER_STATE_MSG_SELECT_CONNECT = 4;
export const ER_STATE_MSG_SELECT_CONNECT_WAIT = 5;
export const ER_STATE_TRY_LINK = 6;
export const ER_STATE_INCORRECT_LINK = 7;
export const ER_STATE_CONNECTING = 8;
export const ER_STATE_TRANSFER = 9;
export const ER_STATE_TRANSFER_END = 10;
export const ER_STATE_TRANSFER_SUCCESS = 11;
export const ER_STATE_LOAD_CARD_START = 12;
export const ER_STATE_LOAD_CARD = 13;
export const ER_STATE_WAIT_RECV_CARD = 14;
export const ER_STATE_VALIDATE_CARD = 15;
export const ER_STATE_WAIT_DISCONNECT = 16;
export const ER_STATE_SAVE = 17;
export const ER_STATE_SUCCESS_MSG = 18;
export const ER_STATE_SUCCESS_END = 19;
export const ER_STATE_LINK_ERROR = 20;
export const ER_STATE_LINK_ERROR_TRY_AGAIN = 21;
export const ER_STATE_SAVE_FAILED = 22;
export const ER_STATE_CANCELED_CARD_READ = 23;
export const ER_STATE_UNUSED_1 = 24;
export const ER_STATE_UNUSED_2 = 25;
export const ER_STATE_END = 26;

export interface EReaderData {
  status: number;
  size: number;
  data: number[] | null;
}

export interface EReaderTaskData {
  timer: number;
  unused1: number;
  unused2: number;
  unused3: number;
  state: number;
  textState: number;
  unused4: number;
  unused5: number;
  unused6: number;
  unused7: number;
  status: number;
  unusedBuffer: Uint8Array | null;
}

export interface EReaderTask {
  data: EReaderTaskData;
  priority: number;
  destroyed: boolean;
}

export interface EReaderScreenRuntime {
  helper: EReaderHelperRuntime;
  gEReaderData: EReaderData;
  gIntrTable: Array<string | null>;
  REG_IME: number;
  REG_IE: number;
  gShouldAdvanceLinkState: number;
  gDecompressionBuffer: Uint8Array;
  gLinkType: number;
  gLink: { tempRecvBuffer: number[] };
  gReceivedRemoteLinkPlayers: number;
  newKeys: number;
  tasks: EReaderTask[];
  mainCallback2: string | null;
  isLinkMaster: boolean;
  linkPlayerCount: number;
  linkErrorOccurred: boolean;
  linkConnectionEstablished: boolean;
  linkPlayerDataExchangeComplete: boolean;
  blockReceivedStatus: number;
  validateTrainerTowerDataResult: boolean;
  saveTrainerTowerResult: boolean;
  fanfareTaskInactive: boolean;
  multiBootProgram: number[];
  operations: Array<{ op: string; args: unknown[] }>;
  printedMessages: string[];
  playedSE: number[];
  fanfares: number[];
}

export const createEReaderScreenRuntime = (): EReaderScreenRuntime => ({
  helper: createEReaderRuntime(),
  gEReaderData: { status: 0, size: 0, data: null },
  gIntrTable: Array.from({ length: 14 }, () => null),
  REG_IME: 1,
  REG_IE: 0,
  gShouldAdvanceLinkState: 0,
  gDecompressionBuffer: new Uint8Array(0x4000),
  gLinkType: 0,
  gLink: { tempRecvBuffer: [0xffff, 0xffff, 0xffff, 0xffff] },
  gReceivedRemoteLinkPlayers: 0,
  newKeys: 0,
  tasks: [],
  mainCallback2: null,
  isLinkMaster: false,
  linkPlayerCount: 0,
  linkErrorOccurred: false,
  linkConnectionEstablished: false,
  linkPlayerDataExchangeComplete: false,
  blockReceivedStatus: 0,
  validateTrainerTowerDataResult: false,
  saveTrainerTowerResult: false,
  fanfareTaskInactive: false,
  multiBootProgram: [],
  operations: [],
  printedMessages: [],
  playedSE: [],
  fanfares: [],
});

export function EReader_Load(runtime: EReaderScreenRuntime, eReader: EReaderData, size: number, data: number[]): void {
  const imeBak = runtime.REG_IME;
  runtime.REG_IME = 0;
  runtime.gIntrTable[1] = 'EReaderHelper_SerialCallback';
  runtime.gIntrTable[2] = 'EReaderHelper_Timer3Callback';
  eReaderHelperSaveRegsState(runtime.helper);
  eReaderHelperClearsSendRecvMgr(runtime.helper);
  runtime.REG_IE |= INTR_FLAG_VCOUNT;
  runtime.REG_IME = imeBak;
  eReader.status = 0;
  eReader.size = size;
  eReader.data = data;
}

export function EReader_Reset(runtime: EReaderScreenRuntime, _eReader: EReaderData): void {
  const imeBak = runtime.REG_IME;
  runtime.REG_IME = 0;
  eReaderHelperClearsSendRecvMgr(runtime.helper);
  eReaderHelperRestoreRegsState(runtime.helper);
  RestoreSerialTimer3IntrHandlers(runtime);
  runtime.REG_IME = imeBak;
}

export function EReader_Transfer(runtime: EReaderScreenRuntime, eReader: EReaderData): number {
  let transferStatus = TRANSFER_ACTIVE;
  eReader.status = eReaderHandleTransfer(runtime.helper, 1, eReader.size, eReader.data, null);

  if ((eReader.status & EREADER_XFER_MASK) === 0 && (eReader.status & EREADER_CHECKSUM_OK_MASK) !== 0) {
    transferStatus = TRANSFER_SUCCESS;
  }

  if ((eReader.status & EREADER_CANCEL_KEY_MASK) !== 0) {
    transferStatus = TRANSFER_CANCELED;
  }

  if ((eReader.status & EREADER_CANCEL_TIMEOUT_MASK) !== 0) {
    transferStatus = TRANSFER_TIMEOUT;
  }

  runtime.gShouldAdvanceLinkState = 0;
  runtime.helper.gShouldAdvanceLinkState = 0;
  return transferStatus;
}

export function OpenEReaderLink(runtime: EReaderScreenRuntime): void {
  runtime.gDecompressionBuffer.fill(0, 0, 0x2000);
  runtime.gLinkType = LINKTYPE_EREADER_FRLG;
  OpenLink(runtime);
  SetSuppressLinkErrorMessage(runtime, true);
}

export function ValidateEReaderConnection(runtime: EReaderScreenRuntime): boolean {
  const imeBak = runtime.REG_IME;
  runtime.REG_IME = 0;
  const handshakes = runtime.gLink.tempRecvBuffer.slice(0, MAX_LINK_PLAYERS);
  runtime.REG_IME = imeBak;

  return handshakes[0] === SLAVE_HANDSHAKE
    && handshakes[1] === EREADER_HANDSHAKE
    && handshakes[2] === 0xffff
    && handshakes[3] === 0xffff;
}

export function IsEReaderConnectionSane(runtime: EReaderScreenRuntime): boolean {
  if (IsLinkMaster(runtime) && GetLinkPlayerCount_2(runtime) === 2) {
    return true;
  }
  return false;
}

export function TryReceiveCard(runtime: EReaderScreenRuntime, ref: { state: number; timer: number }): number {
  if (
    (ref.state === RECV_STATE_EXCHANGE
      || ref.state === RECV_STATE_START_DISCONNECT
      || ref.state === RECV_STATE_WAIT_DISCONNECT)
    && HasLinkErrorOccurred(runtime)
  ) {
    ref.state = 0;
    return RECV_ERROR;
  }

  switch (ref.state) {
    case RECV_STATE_INIT:
      if (IsLinkMaster(runtime) && GetLinkPlayerCount_2(runtime) > 1) {
        ref.state = RECV_STATE_WAIT_START;
      } else if (JOY_NEW(runtime, B_BUTTON)) {
        ref.state = 0;
        return RECV_CANCELED;
      }
      break;
    case RECV_STATE_WAIT_START:
      ref.timer += 1;
      if (ref.timer > 5) {
        ref.timer = 0;
        ref.state = RECV_STATE_START;
      }
      break;
    case RECV_STATE_START:
      if (GetLinkPlayerCount_2(runtime) === 2) {
        PlaySE(runtime, SE_DING_DONG);
        CheckShouldAdvanceLinkState(runtime);
        ref.timer = 0;
        ref.state = RECV_STATE_EXCHANGE;
      } else if (JOY_NEW(runtime, B_BUTTON)) {
        ref.state = 0;
        return RECV_CANCELED;
      }
      break;
    case RECV_STATE_EXCHANGE:
      ref.timer += 1;
      if (ref.timer > 30) {
        ref.state = 0;
        return RECV_TIMEOUT;
      }

      if (IsLinkConnectionEstablished(runtime)) {
        if (runtime.gReceivedRemoteLinkPlayers) {
          if (IsLinkPlayerDataExchangeComplete(runtime)) {
            ref.state = 0;
            return RECV_SUCCESS;
          }
          ref.state = RECV_STATE_START_DISCONNECT;
        } else {
          ref.state = RECV_STATE_EXCHANGE;
        }
      }
      break;
    case RECV_STATE_START_DISCONNECT:
      SetCloseLinkCallbackAndType(runtime, 0);
      ref.state = RECV_STATE_WAIT_DISCONNECT;
      break;
    case RECV_STATE_WAIT_DISCONNECT:
      if (!runtime.gReceivedRemoteLinkPlayers) {
        ref.state = 0;
        return RECV_DISCONNECTED;
      }
      break;
  }
  return RECV_ACTIVE;
}

export function CreateEReaderTask(runtime: EReaderScreenRuntime): number {
  const taskId = CreateTask(runtime, 0);
  const data = runtime.tasks[taskId].data;
  data.state = 0;
  data.textState = 0;
  data.unused4 = 0;
  data.unused5 = 0;
  data.unused6 = 0;
  data.unused7 = 0;
  data.timer = 0;
  data.unused1 = 0;
  data.unused2 = 0;
  data.unused3 = 0;
  data.status = 0;
  data.unusedBuffer = new Uint8Array(CLIENT_MAX_MSG_SIZE);
  return taskId;
}

export function ResetTimer(ref: { timer: number }): void {
  ref.timer = 0;
}

export function UpdateTimer(ref: { timer: number }, time: number): boolean {
  ref.timer += 1;
  if (ref.timer > time) {
    ref.timer = 0;
    return true;
  }
  return false;
}

export function Task_EReader(runtime: EReaderScreenRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data.state) {
    case ER_STATE_START:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_ReceiveMysteryGiftWithEReader')) {
        data.state = ER_STATE_INIT_LINK;
      }
      break;
    case ER_STATE_INIT_LINK:
      OpenEReaderLink(runtime);
      ResetTimer(data);
      data.state = ER_STATE_INIT_LINK_WAIT;
      break;
    case ER_STATE_INIT_LINK_WAIT:
      if (UpdateTimer(data, 10)) data.state = ER_STATE_INIT_LINK_CHECK;
      break;
    case ER_STATE_INIT_LINK_CHECK:
      if (!IsEReaderConnectionSane(runtime)) {
        CloseLink(runtime);
        data.state = ER_STATE_MSG_SELECT_CONNECT;
      } else {
        data.state = ER_STATE_LOAD_CARD;
      }
      break;
    case ER_STATE_MSG_SELECT_CONNECT:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_SelectConnectFromEReaderMenu')) {
        AddTextPrinterToWindow1(runtime, 'gJPText_SelectConnectWithGBA');
        ResetTimer(data);
        data.state = ER_STATE_MSG_SELECT_CONNECT_WAIT;
      }
      break;
    case ER_STATE_MSG_SELECT_CONNECT_WAIT:
      if (UpdateTimer(data, 90)) {
        OpenEReaderLink(runtime);
        data.state = ER_STATE_TRY_LINK;
      } else if (JOY_NEW(runtime, B_BUTTON)) {
        ResetTimer(data);
        PlaySE(runtime, SE_SELECT);
        data.state = ER_STATE_CANCELED_CARD_READ;
      }
      break;
    case ER_STATE_TRY_LINK:
      if (JOY_NEW(runtime, B_BUTTON)) {
        PlaySE(runtime, SE_SELECT);
        CloseLink(runtime);
        ResetTimer(data);
        data.state = ER_STATE_CANCELED_CARD_READ;
      } else if (GetLinkPlayerCount_2(runtime) > 1) {
        ResetTimer(data);
        CloseLink(runtime);
        data.state = ER_STATE_INCORRECT_LINK;
      } else if (ValidateEReaderConnection(runtime)) {
        PlaySE(runtime, SE_SELECT);
        CloseLink(runtime);
        ResetTimer(data);
        data.state = ER_STATE_CONNECTING;
      } else if (UpdateTimer(data, 10)) {
        CloseLink(runtime);
        OpenEReaderLink(runtime);
        ResetTimer(data);
      }
      break;
    case ER_STATE_INCORRECT_LINK:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_LinkIsIncorrect')) data.state = ER_STATE_MSG_SELECT_CONNECT;
      break;
    case ER_STATE_CONNECTING:
      AddTextPrinterToWindow1(runtime, 'gJPText_Connecting');
      EReader_Load(runtime, runtime.gEReaderData, runtime.multiBootProgram.length, runtime.multiBootProgram);
      data.state = ER_STATE_TRANSFER;
      break;
    case ER_STATE_TRANSFER:
      data.status = EReader_Transfer(runtime, runtime.gEReaderData);
      if (data.status !== TRANSFER_ACTIVE) data.state = ER_STATE_TRANSFER_END;
      break;
    case ER_STATE_TRANSFER_END:
      EReader_Reset(runtime, runtime.gEReaderData);
      if (data.status === TRANSFER_TIMEOUT) {
        data.state = ER_STATE_LINK_ERROR;
      } else if (data.status === TRANSFER_SUCCESS) {
        ResetTimer(data);
        AddTextPrinterToWindow1(runtime, 'gJPText_PleaseWaitAMoment');
        data.state = ER_STATE_TRANSFER_SUCCESS;
      } else {
        data.state = ER_STATE_START;
      }
      break;
    case ER_STATE_TRANSFER_SUCCESS:
      if (UpdateTimer(data, 840)) data.state = ER_STATE_LOAD_CARD_START;
      break;
    case ER_STATE_LOAD_CARD_START:
      OpenEReaderLink(runtime);
      AddTextPrinterToWindow1(runtime, 'gJPText_AllowEReaderToLoadCard');
      data.state = ER_STATE_LOAD_CARD;
      break;
    case ER_STATE_LOAD_CARD:
      {
        const recv = { state: data.textState, timer: data.timer };
        const result = TryReceiveCard(runtime, recv);
        data.textState = recv.state;
        data.timer = recv.timer;
        switch (result) {
          case RECV_ACTIVE:
            break;
          case RECV_SUCCESS:
            AddTextPrinterToWindow1(runtime, 'gJPText_Connecting');
            data.state = ER_STATE_WAIT_RECV_CARD;
            break;
          case RECV_CANCELED:
            PlaySE(runtime, SE_SELECT);
            CloseLink(runtime);
            data.state = ER_STATE_CANCELED_CARD_READ;
            break;
          case RECV_TIMEOUT:
            CloseLink(runtime);
            data.state = ER_STATE_LINK_ERROR_TRY_AGAIN;
            break;
          case RECV_ERROR:
          case RECV_DISCONNECTED:
            CloseLink(runtime);
            data.state = ER_STATE_LINK_ERROR;
            break;
        }
      }
      break;
    case ER_STATE_WAIT_RECV_CARD:
      if (HasLinkErrorOccurred(runtime)) {
        CloseLink(runtime);
        data.state = ER_STATE_LINK_ERROR;
      } else if (GetBlockReceivedStatus(runtime)) {
        ResetBlockReceivedFlags(runtime);
        data.state = ER_STATE_VALIDATE_CARD;
      }
      break;
    case ER_STATE_VALIDATE_CARD:
      data.status = ValidateTrainerTowerData(runtime) ? 1 : 0;
      SetCloseLinkCallbackAndType(runtime, data.status);
      data.state = ER_STATE_WAIT_DISCONNECT;
      break;
    case ER_STATE_WAIT_DISCONNECT:
      if (!runtime.gReceivedRemoteLinkPlayers) {
        if (data.status === 1) data.state = ER_STATE_SAVE;
        else data.state = ER_STATE_LINK_ERROR;
      }
      break;
    case ER_STATE_SAVE:
      if (CEReaderTool_SaveTrainerTower(runtime)) {
        AddTextPrinterToWindow1(runtime, 'gJPText_ConnectionComplete');
        ResetTimer(data);
        data.state = ER_STATE_SUCCESS_MSG;
      } else {
        data.state = ER_STATE_SAVE_FAILED;
      }
      break;
    case ER_STATE_SUCCESS_MSG:
      if (UpdateTimer(data, 120)) {
        AddTextPrinterToWindow1(runtime, 'gJPText_NewTrainerHasComeToSevii');
        PlayFanfare(runtime, MUS_OBTAIN_ITEM);
        data.state = ER_STATE_SUCCESS_END;
      }
      break;
    case ER_STATE_SUCCESS_END:
      if (IsFanfareTaskInactive(runtime) && JOY_NEW(runtime, A_BUTTON | B_BUTTON)) data.state = ER_STATE_END;
      break;
    case ER_STATE_CANCELED_CARD_READ:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_CardReadingHasBeenHalted')) data.state = ER_STATE_END;
      break;
    case ER_STATE_LINK_ERROR:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_ConnectionErrorCheckLink')) data.state = ER_STATE_START;
      break;
    case ER_STATE_LINK_ERROR_TRY_AGAIN:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_ConnectionErrorTryAgain')) data.state = ER_STATE_START;
      break;
    case ER_STATE_SAVE_FAILED:
      if (PrintMysteryGiftMenuMessage(runtime, data, 'gJPText_WriteErrorUnableToSaveData')) data.state = ER_STATE_START;
      break;
    case ER_STATE_END:
      HelpSystem_Enable(runtime);
      data.unusedBuffer = null;
      DestroyTask(runtime, taskId);
      SetMainCallback2(runtime, 'MainCB_FreeAllBuffersAndReturnToInitTitleScreen');
      break;
  }
}

function CreateTask(runtime: EReaderScreenRuntime, priority: number): number {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    priority,
    destroyed: false,
    data: {
      timer: 0,
      unused1: 0,
      unused2: 0,
      unused3: 0,
      state: 0,
      textState: 0,
      unused4: 0,
      unused5: 0,
      unused6: 0,
      unused7: 0,
      status: 0,
      unusedBuffer: null,
    },
  });
  return taskId;
}

function JOY_NEW(runtime: EReaderScreenRuntime, mask: number): boolean {
  return (runtime.newKeys & mask) !== 0;
}

function record(runtime: EReaderScreenRuntime, op: string, ...args: unknown[]): void {
  runtime.operations.push({ op, args });
}

function RestoreSerialTimer3IntrHandlers(runtime: EReaderScreenRuntime): void {
  record(runtime, 'RestoreSerialTimer3IntrHandlers');
}

function OpenLink(runtime: EReaderScreenRuntime): void {
  record(runtime, 'OpenLink');
}

function CloseLink(runtime: EReaderScreenRuntime): void {
  record(runtime, 'CloseLink');
}

function SetSuppressLinkErrorMessage(runtime: EReaderScreenRuntime, suppress: boolean): void {
  record(runtime, 'SetSuppressLinkErrorMessage', suppress);
}

function IsLinkMaster(runtime: EReaderScreenRuntime): boolean {
  return runtime.isLinkMaster;
}

function GetLinkPlayerCount_2(runtime: EReaderScreenRuntime): number {
  return runtime.linkPlayerCount;
}

function HasLinkErrorOccurred(runtime: EReaderScreenRuntime): boolean {
  return runtime.linkErrorOccurred;
}

function PlaySE(runtime: EReaderScreenRuntime, song: number): void {
  runtime.playedSE.push(song);
}

function CheckShouldAdvanceLinkState(runtime: EReaderScreenRuntime): void {
  record(runtime, 'CheckShouldAdvanceLinkState');
}

function IsLinkConnectionEstablished(runtime: EReaderScreenRuntime): boolean {
  return runtime.linkConnectionEstablished;
}

function IsLinkPlayerDataExchangeComplete(runtime: EReaderScreenRuntime): boolean {
  return runtime.linkPlayerDataExchangeComplete;
}

function SetCloseLinkCallbackAndType(runtime: EReaderScreenRuntime, type: number): void {
  record(runtime, 'SetCloseLinkCallbackAndType', type);
}

function PrintMysteryGiftMenuMessage(runtime: EReaderScreenRuntime, data: EReaderTaskData, message: string): boolean {
  runtime.printedMessages.push(message);
  data.textState = 0;
  return true;
}

function AddTextPrinterToWindow1(runtime: EReaderScreenRuntime, message: string): void {
  runtime.printedMessages.push(message);
}

function GetBlockReceivedStatus(runtime: EReaderScreenRuntime): number {
  return runtime.blockReceivedStatus;
}

function ResetBlockReceivedFlags(runtime: EReaderScreenRuntime): void {
  runtime.blockReceivedStatus = 0;
  record(runtime, 'ResetBlockReceivedFlags');
}

function ValidateTrainerTowerData(runtime: EReaderScreenRuntime): boolean {
  record(runtime, 'ValidateTrainerTowerData', runtime.gDecompressionBuffer.length);
  return runtime.validateTrainerTowerDataResult;
}

function CEReaderTool_SaveTrainerTower(runtime: EReaderScreenRuntime): boolean {
  record(runtime, 'CEReaderTool_SaveTrainerTower', runtime.gDecompressionBuffer.length);
  return runtime.saveTrainerTowerResult;
}

function PlayFanfare(runtime: EReaderScreenRuntime, song: number): void {
  runtime.fanfares.push(song);
}

function IsFanfareTaskInactive(runtime: EReaderScreenRuntime): boolean {
  return runtime.fanfareTaskInactive;
}

function HelpSystem_Enable(runtime: EReaderScreenRuntime): void {
  record(runtime, 'HelpSystem_Enable');
}

function DestroyTask(runtime: EReaderScreenRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
}

function SetMainCallback2(runtime: EReaderScreenRuntime, callback: string): void {
  runtime.mainCallback2 = callback;
}
