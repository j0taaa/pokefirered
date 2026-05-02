export const TASK_NONE = 0xff;

export const USING_SINGLE_BATTLE = 1;
export const USING_DOUBLE_BATTLE = 2;
export const USING_TRADE_CENTER = 3;
export const USING_RECORD_CORNER = 4;
export const USING_MULTI_BATTLE = 5;

export const LINKUP_ONGOING = 0;
export const LINKUP_SUCCESS = 1;
export const LINKUP_SOMEONE_NOT_READY = 2;
export const LINKUP_DIFF_SELECTIONS = 3;
export const LINKUP_WRONG_NUM_PLAYERS = 4;
export const LINKUP_FAILED = 5;
export const LINKUP_CONNECTION_ERROR = 6;
export const LINKUP_PLAYER_NOT_READY = 7;
export const LINKUP_RETRY_ROLE_ASSIGN = 8;
export const LINKUP_PARTNER_NOT_READY = 9;

export const CABLE_SEAT_WAITING = 0;
export const CABLE_SEAT_SUCCESS = 1;
export const CABLE_SEAT_FAILED = 2;

export const LINKTYPE_TRADE = 0x1111;
export const LINKTYPE_TRADE_SETUP = 0x1133;
export const LINKTYPE_BATTLE = 0x2211;
export const LINKTYPE_SINGLE_BATTLE = 0x2233;
export const LINKTYPE_DOUBLE_BATTLE = 0x2244;
export const LINKTYPE_MULTI_BATTLE = 0x2255;
export const LINKTYPE_RECORD_MIX_BEFORE = 0x3311;
export const LINKTYPE_RECORD_MIX_AFTER = 0x3322;
export const LINKTYPE_BERRY_BLENDER_SETUP = 0x4411;
export const LINKTYPE_CONTEST_GMODE = 0x6601;

export const EXCHANGE_NOT_STARTED = 0;
export const EXCHANGE_COMPLETE = 1;
export const EXCHANGE_TIMED_OUT = 2;
export const EXCHANGE_DIFF_SELECTIONS = 3;
export const EXCHANGE_PLAYER_NOT_READY = 4;
export const EXCHANGE_PARTNER_NOT_READY = 5;
export const EXCHANGE_WRONG_NUM_PLAYERS = 6;

export const BLOCK_REQ_SIZE_100 = 2;
export const FIELD_MESSAGE_BOX_HIDDEN = 0;
export const FIELD_MESSAGE_BOX_AUTO_SCROLL = 3;

export const VERSION_SAPPHIRE = 1;
export const VERSION_RUBY = 2;
export const VERSION_FIRE_RED = 4;
export const VERSION_LEAF_GREEN = 5;

export const SE_PIN = 21;
export const SE_BOO = 22;
export const SE_SELECT = 5;
export const MUS_RS_VS_GYM_LEADER = 265;
export const MUS_RS_VS_TRAINER = 266;

export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_TRAINER = 1 << 3;
export const BATTLE_TYPE_LINK_IN_BATTLE = 1 << 5;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const TRAINER_LINK_OPPONENT = 0x800;
export const B_OUTCOME_WON = 1;
export const B_OUTCOME_LOST = 2;
export const CARD_STAT_BATTLES_WON = 0;
export const CARD_STAT_BATTLES_LOST = 1;
export const WARP_ID_DYNAMIC = 0x7f;
export const TRADE_PLAYER = 0;
export const TRADE_PARTNER = 1;

export type CableClubTaskFunc = (runtime: DecompCableClubRuntime, taskId: number) => void;

export interface CableClubTask {
  id: number;
  data: number[];
  func: CableClubTaskFunc;
  priority: number;
  destroyed: boolean;
  followupFunc: CableClubTaskFunc | null;
}

export interface LinkPlayer {
  version: number;
  trainerId: number;
  linkType?: number;
  name: string;
}

export interface TrainerCard {
  version?: number;
  rse?: unknown;
  [key: string]: unknown;
}

export interface DecompCableClubRuntime {
  tasks: CableClubTask[];
  nextTaskId: number;
  operations: string[];
  input: { aNew: boolean; bNew: boolean; aHeld: boolean; bHeld: boolean };
  linkPlayerCount: number;
  savedPlayerCount: number;
  multiplayerId: number;
  isLinkMaster: boolean;
  isLinkConnectionEstablished: boolean;
  hasLinkErrorOccurred: boolean;
  sioMultiSI: boolean;
  exchangeStatus: number;
  fieldMessageBoxType: number;
  receivedRemoteLinkPlayers: boolean;
  blockReceivedStatus: number;
  linkPlayerCountAsBitFlags: number;
  savedLinkPlayerCountAsBitFlags: number;
  linkPlayers: LinkPlayer[];
  localLinkPlayer: LinkPlayer;
  blockRecvBuffer: unknown[];
  blockSendBuffer: unknown;
  trainerCards: TrainerCard[];
  trainerCardStars: number[];
  gStringVar1: string;
  gStringVar2: string;
  gStringVar4: string;
  gSpecialVar_Result: number;
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_0x8006: number;
  gLinkType: number;
  gBattleTypeFlags: number;
  gFieldLinkPlayerCount: number;
  gLocalLinkPlayerId: number;
  gWirelessCommType: number;
  gPaletteFade: { active: boolean };
  gMain: { state: number; savedCallback: string | null };
  gBattleOutcome: number;
  gSelectedTradeMonPositions: number[];
  gTrainerBattleOpponent_A: number;
  inUnionRoom: boolean;
  linkTaskFinished: boolean;
  cableClubPartnersReady: number;
  nextWindowId: number;
  fieldMessageHidden: boolean;
  dynamicWarp: number | null;
  unusedVarNeededToMatch: number[];
}

export const createDecompCableClubRuntime = (overrides: Partial<DecompCableClubRuntime> = {}): DecompCableClubRuntime => ({
  tasks: overrides.tasks ?? [],
  nextTaskId: overrides.nextTaskId ?? 0,
  operations: overrides.operations ?? [],
  input: overrides.input ?? { aNew: false, bNew: false, aHeld: false, bHeld: false },
  linkPlayerCount: overrides.linkPlayerCount ?? 0,
  savedPlayerCount: overrides.savedPlayerCount ?? 0,
  multiplayerId: overrides.multiplayerId ?? 0,
  isLinkMaster: overrides.isLinkMaster ?? true,
  isLinkConnectionEstablished: overrides.isLinkConnectionEstablished ?? false,
  hasLinkErrorOccurred: overrides.hasLinkErrorOccurred ?? false,
  sioMultiSI: overrides.sioMultiSI ?? false,
  exchangeStatus: overrides.exchangeStatus ?? EXCHANGE_NOT_STARTED,
  fieldMessageBoxType: overrides.fieldMessageBoxType ?? FIELD_MESSAGE_BOX_HIDDEN,
  receivedRemoteLinkPlayers: overrides.receivedRemoteLinkPlayers ?? false,
  blockReceivedStatus: overrides.blockReceivedStatus ?? 0,
  linkPlayerCountAsBitFlags: overrides.linkPlayerCountAsBitFlags ?? 0,
  savedLinkPlayerCountAsBitFlags: overrides.savedLinkPlayerCountAsBitFlags ?? 0,
  linkPlayers: overrides.linkPlayers ?? [
    { version: VERSION_FIRE_RED, trainerId: 0, name: 'RED' },
    { version: VERSION_LEAF_GREEN, trainerId: 1, name: 'GREEN' },
    { version: VERSION_FIRE_RED, trainerId: 2, name: 'BLUE' },
    { version: VERSION_FIRE_RED, trainerId: 3, name: 'YELLOW' }
  ],
  localLinkPlayer: overrides.localLinkPlayer ?? { version: VERSION_FIRE_RED, trainerId: 99, name: 'LOCAL' },
  blockRecvBuffer: overrides.blockRecvBuffer ?? [{ card: 0 }, { card: 1 }, { card: 2 }, { card: 3 }],
  blockSendBuffer: overrides.blockSendBuffer ?? {},
  trainerCards: overrides.trainerCards ?? [{}, {}, {}, {}],
  trainerCardStars: overrides.trainerCardStars ?? [0, 0, 0, 0],
  gStringVar1: overrides.gStringVar1 ?? '',
  gStringVar2: overrides.gStringVar2 ?? '',
  gStringVar4: overrides.gStringVar4 ?? '',
  gSpecialVar_Result: overrides.gSpecialVar_Result ?? LINKUP_ONGOING,
  gSpecialVar_0x8004: overrides.gSpecialVar_0x8004 ?? 0,
  gSpecialVar_0x8005: overrides.gSpecialVar_0x8005 ?? 0,
  gSpecialVar_0x8006: overrides.gSpecialVar_0x8006 ?? 0,
  gLinkType: overrides.gLinkType ?? 0,
  gBattleTypeFlags: overrides.gBattleTypeFlags ?? 0,
  gFieldLinkPlayerCount: overrides.gFieldLinkPlayerCount ?? 0,
  gLocalLinkPlayerId: overrides.gLocalLinkPlayerId ?? 0,
  gWirelessCommType: overrides.gWirelessCommType ?? 0,
  gPaletteFade: overrides.gPaletteFade ?? { active: false },
  gMain: overrides.gMain ?? { state: 0, savedCallback: null },
  gBattleOutcome: overrides.gBattleOutcome ?? 0,
  gSelectedTradeMonPositions: overrides.gSelectedTradeMonPositions ?? [0, 0],
  gTrainerBattleOpponent_A: overrides.gTrainerBattleOpponent_A ?? 0,
  inUnionRoom: overrides.inUnionRoom ?? false,
  linkTaskFinished: overrides.linkTaskFinished ?? true,
  cableClubPartnersReady: overrides.cableClubPartnersReady ?? CABLE_SEAT_WAITING,
  nextWindowId: overrides.nextWindowId ?? 0,
  fieldMessageHidden: overrides.fieldMessageHidden ?? true,
  dynamicWarp: overrides.dynamicWarp ?? null,
  unusedVarNeededToMatch: overrides.unusedVarNeededToMatch ?? Array.from({ length: 8 }, () => 0)
});

const log = (runtime: DecompCableClubRuntime, op: string): void => {
  runtime.operations.push(op);
};

export const CreateTask = (runtime: DecompCableClubRuntime, func: CableClubTaskFunc, priority: number): number => {
  const taskId = runtime.nextTaskId++;
  runtime.tasks[taskId] = {
    id: taskId,
    data: Array.from({ length: 16 }, () => 0),
    func,
    priority,
    destroyed: false,
    followupFunc: null
  };
  log(runtime, `CreateTask:${func.name}:${priority}`);
  return taskId;
};

export const DestroyTask = (runtime: DecompCableClubRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  log(runtime, `DestroyTask:${taskId}`);
};

export const FindTaskIdByFunc = (runtime: DecompCableClubRuntime, func: CableClubTaskFunc): number => {
  const task = runtime.tasks.find((candidate) => !candidate.destroyed && candidate.func === func);
  return task ? task.id : TASK_NONE;
};

export const FuncIsActiveTask = (runtime: DecompCableClubRuntime, func: CableClubTaskFunc): boolean =>
  FindTaskIdByFunc(runtime, func) !== TASK_NONE;

export const SetTaskFuncWithFollowupFunc = (
  runtime: DecompCableClubRuntime,
  taskId: number,
  func: CableClubTaskFunc,
  followupFunc: CableClubTaskFunc
): void => {
  runtime.tasks[taskId].func = func;
  runtime.tasks[taskId].followupFunc = followupFunc;
  log(runtime, `SetTaskFuncWithFollowupFunc:${taskId}:${func.name}:${followupFunc.name}`);
};

export const SwitchTaskToFollowupFunc = (runtime: DecompCableClubRuntime, taskId: number): void => {
  const followupFunc = runtime.tasks[taskId].followupFunc;
  if (followupFunc) runtime.tasks[taskId].func = followupFunc;
  log(runtime, `SwitchTaskToFollowupFunc:${taskId}:${followupFunc?.name ?? 'NULL'}`);
};

export const runCableClubTask = (runtime: DecompCableClubRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  task.func(runtime, taskId);
};

const AddWindow = (runtime: DecompCableClubRuntime): number => {
  const windowId = runtime.nextWindowId++;
  log(runtime, `AddWindow:${windowId}`);
  return windowId;
};

const RemoveWindow = (runtime: DecompCableClubRuntime, windowId: number): void => log(runtime, `RemoveWindow:${windowId}`);
const OpenLinkTimed = (runtime: DecompCableClubRuntime): void => log(runtime, 'OpenLinkTimed');
const OpenLink = (runtime: DecompCableClubRuntime): void => log(runtime, 'OpenLink');
const ResetLinkPlayerCount = (runtime: DecompCableClubRuntime): void => {
  runtime.linkPlayerCount = 0;
  log(runtime, 'ResetLinkPlayerCount');
};
const ResetLinkPlayers = (runtime: DecompCableClubRuntime): void => log(runtime, 'ResetLinkPlayers');
const GetLinkPlayerCount_2 = (runtime: DecompCableClubRuntime): number => runtime.linkPlayerCount;
const GetLinkPlayerCount = (runtime: DecompCableClubRuntime): number => runtime.linkPlayerCount;
const IsLinkMaster = (runtime: DecompCableClubRuntime): boolean => runtime.isLinkMaster;
const IsLinkConnectionEstablished = (runtime: DecompCableClubRuntime): boolean => runtime.isLinkConnectionEstablished;
const HasLinkErrorOccurred = (runtime: DecompCableClubRuntime): boolean => runtime.hasLinkErrorOccurred;
const GetSioMultiSI = (runtime: DecompCableClubRuntime): boolean => runtime.sioMultiSI;
const SetSuppressLinkErrorMessage = (runtime: DecompCableClubRuntime, value: boolean): void =>
  log(runtime, `SetSuppressLinkErrorMessage:${Number(value)}`);
const PlaySE = (runtime: DecompCableClubRuntime, song: number): void => log(runtime, `PlaySE:${song}`);
const PlayMapChosenOrBattleBGM = (runtime: DecompCableClubRuntime, song: number): void =>
  log(runtime, `PlayMapChosenOrBattleBGM:${song}`);
const ShowFieldAutoScrollMessage = (runtime: DecompCableClubRuntime, text: string): void => {
  runtime.fieldMessageBoxType = FIELD_MESSAGE_BOX_AUTO_SCROLL;
  runtime.fieldMessageHidden = false;
  log(runtime, `ShowFieldAutoScrollMessage:${text}`);
};
const ShowFieldMessage = (runtime: DecompCableClubRuntime, text: string): void => {
  runtime.fieldMessageBoxType = FIELD_MESSAGE_BOX_AUTO_SCROLL;
  runtime.fieldMessageHidden = false;
  log(runtime, `ShowFieldMessage:${text}`);
};
const HideFieldMessageBox = (runtime: DecompCableClubRuntime): void => {
  runtime.fieldMessageBoxType = FIELD_MESSAGE_BOX_HIDDEN;
  runtime.fieldMessageHidden = true;
  log(runtime, 'HideFieldMessageBox');
};
const EraseFieldMessageBox = (runtime: DecompCableClubRuntime, copyToVram: boolean): void => {
  runtime.fieldMessageBoxType = FIELD_MESSAGE_BOX_HIDDEN;
  runtime.fieldMessageHidden = true;
  log(runtime, `EraseFieldMessageBox:${Number(copyToVram)}`);
};
const IsFieldMessageBoxHidden = (runtime: DecompCableClubRuntime): boolean => runtime.fieldMessageHidden;
const GetFieldMessageBoxType = (runtime: DecompCableClubRuntime): number => runtime.fieldMessageBoxType;
const ConvertIntToDecimalStringN = (runtime: DecompCableClubRuntime, value: number): void => {
  runtime.gStringVar1 = String(value);
};
const SaveLinkPlayers = (runtime: DecompCableClubRuntime, count: number): void => {
  runtime.savedPlayerCount = count;
  runtime.savedLinkPlayerCountAsBitFlags = count === 0 ? 0 : (1 << count) - 1;
  log(runtime, `SaveLinkPlayers:${count}`);
};
const GetSavedPlayerCount = (runtime: DecompCableClubRuntime): number => runtime.savedPlayerCount;
const GetMultiplayerId = (runtime: DecompCableClubRuntime): number => runtime.multiplayerId;
const GetLinkPlayerDataExchangeStatusTimed = (runtime: DecompCableClubRuntime): number => runtime.exchangeStatus;
const CheckShouldAdvanceLinkState = (runtime: DecompCableClubRuntime): void => log(runtime, 'CheckShouldAdvanceLinkState');
const SetCloseLinkCallback = (runtime: DecompCableClubRuntime): void => log(runtime, 'SetCloseLinkCallback');
const ClearLinkCallback_2 = (runtime: DecompCableClubRuntime): void => log(runtime, 'ClearLinkCallback_2');
const ClearLinkRfuCallback = (runtime: DecompCableClubRuntime): void => log(runtime, 'ClearLinkRfuCallback');
const CloseLink = (runtime: DecompCableClubRuntime): void => log(runtime, 'CloseLink');
const TrainerCard_GenerateCardForLinkPlayer = (runtime: DecompCableClubRuntime): void => {
  runtime.blockSendBuffer = { generatedTrainerCard: true };
  log(runtime, 'TrainerCard_GenerateCardForLinkPlayer');
};
const SendBlockRequest = (runtime: DecompCableClubRuntime, request: number): void => log(runtime, `SendBlockRequest:${request}`);
const SendBlock = (runtime: DecompCableClubRuntime, multiplayerId: number, block: unknown): void => {
  runtime.blockSendBuffer = block;
  log(runtime, `SendBlock:${multiplayerId}`);
};
const GetBlockReceivedStatus = (runtime: DecompCableClubRuntime): number => runtime.blockReceivedStatus;
const GetSavedLinkPlayerCountAsBitFlags = (runtime: DecompCableClubRuntime): number => runtime.savedLinkPlayerCountAsBitFlags;
const GetLinkPlayerCountAsBitFlags = (runtime: DecompCableClubRuntime): number => runtime.linkPlayerCountAsBitFlags;
const ResetBlockReceivedFlags = (runtime: DecompCableClubRuntime): void => {
  runtime.blockReceivedStatus = 0;
  log(runtime, 'ResetBlockReceivedFlags');
};
const ResetBlockReceivedFlag = (runtime: DecompCableClubRuntime, index: number): void => log(runtime, `ResetBlockReceivedFlag:${index}`);
const ConvertLinkPlayerName = (runtime: DecompCableClubRuntime, index: number): void => log(runtime, `ConvertLinkPlayerName:${index}`);
const ScriptContext_Enable = (runtime: DecompCableClubRuntime): void => log(runtime, 'ScriptContext_Enable');
const ScriptContext_Stop = (runtime: DecompCableClubRuntime): void => log(runtime, 'ScriptContext_Stop');
const ClearStdWindowAndFrame = (runtime: DecompCableClubRuntime, windowId: number): void =>
  log(runtime, `ClearStdWindowAndFrame:${windowId}:0`);
const CopyWindowToVram = (runtime: DecompCableClubRuntime, windowId: number): void => log(runtime, `CopyWindowToVram:${windowId}`);
const SetStdWindowBorderStyle = (runtime: DecompCableClubRuntime, windowId: number): void =>
  log(runtime, `SetStdWindowBorderStyle:${windowId}:0`);
const AddTextPrinterParameterized = (runtime: DecompCableClubRuntime, windowId: number, text: string): void =>
  log(runtime, `AddTextPrinterParameterized:${windowId}:${text}`);
const FadeScreen = (runtime: DecompCableClubRuntime, mode: string, speed: number): void => log(runtime, `FadeScreen:${mode}:${speed}`);
const SetMainCallback2 = (runtime: DecompCableClubRuntime, callback: string): void => {
  log(runtime, `SetMainCallback2:${callback}`);
};
const ReducePlayerPartyToThree = (runtime: DecompCableClubRuntime): void => log(runtime, 'ReducePlayerPartyToThree');
const CleanupOverworldWindowsAndTilemaps = (runtime: DecompCableClubRuntime): void =>
  log(runtime, 'CleanupOverworldWindowsAndTilemaps');
const Overworld_ResetMapMusic = (runtime: DecompCableClubRuntime): void => log(runtime, 'Overworld_ResetMapMusic');
const LoadPlayerParty = (runtime: DecompCableClubRuntime): void => log(runtime, 'LoadPlayerParty');
const SavePlayerBag = (runtime: DecompCableClubRuntime): void => log(runtime, 'SavePlayerBag');
const Special_UpdateTrainerFansAfterLinkBattle = (runtime: DecompCableClubRuntime): void =>
  log(runtime, 'Special_UpdateTrainerFansAfterLinkBattle');
const UpdatePlayerLinkBattleRecords = (runtime: DecompCableClubRuntime, id: number): void =>
  log(runtime, `UpdatePlayerLinkBattleRecords:${id}`);
const MysteryGift_TryIncrementStat = (runtime: DecompCableClubRuntime, stat: number, trainerId: number): void =>
  log(runtime, `MysteryGift_TryIncrementStat:${stat}:${trainerId}`);
const InUnionRoom = (runtime: DecompCableClubRuntime): boolean => runtime.inUnionRoom;
const SetWarpDestinationToDynamicWarp = (runtime: DecompCableClubRuntime, warpId: number): void => {
  runtime.dynamicWarp = warpId;
  log(runtime, `SetWarpDestinationToDynamicWarp:${warpId}`);
};
const QueueExitLinkRoomKey = (runtime: DecompCableClubRuntime): void => log(runtime, 'QueueExitLinkRoomKey');
const SetInCableClubSeat = (runtime: DecompCableClubRuntime): void => log(runtime, 'SetInCableClubSeat');
const SetLocalLinkPlayerId = (runtime: DecompCableClubRuntime, id: number): void => {
  runtime.gLocalLinkPlayerId = id;
  log(runtime, `SetLocalLinkPlayerId:${id}`);
};
const GetCableClubPartnersReady = (runtime: DecompCableClubRuntime): number => runtime.cableClubPartnersReady;
const SetStartedCableClubActivity = (runtime: DecompCableClubRuntime): void => log(runtime, 'SetStartedCableClubActivity');
const SetLinkWaitingForScript = (runtime: DecompCableClubRuntime): void => log(runtime, 'SetLinkWaitingForScript');
const LockPlayerFieldControls = (runtime: DecompCableClubRuntime): void => log(runtime, 'LockPlayerFieldControls');
const m4aMPlayAllStop = (runtime: DecompCableClubRuntime): void => log(runtime, 'm4aMPlayAllStop');
const SetLinkStandbyCallback = (runtime: DecompCableClubRuntime): void => log(runtime, 'SetLinkStandbyCallback');
const IsLinkTaskFinished = (runtime: DecompCableClubRuntime): boolean => runtime.linkTaskFinished;
const CreateTask_CreateTradeMenu = (runtime: DecompCableClubRuntime): void => log(runtime, 'CreateTask_CreateTradeMenu');
const Field_AskSaveTheGame = (runtime: DecompCableClubRuntime): void => log(runtime, 'Field_AskSaveTheGame');
const CheckLinkPlayersMatchSaved = (runtime: DecompCableClubRuntime): void => log(runtime, 'CheckLinkPlayersMatchSaved');
const StartSendingKeysToLink = (runtime: DecompCableClubRuntime): void => log(runtime, 'StartSendingKeysToLink');
const ShowTrainerCardInLink = (runtime: DecompCableClubRuntime, index: number, callback: string): void =>
  log(runtime, `ShowTrainerCardInLink:${index}:${callback}`);
const GetTrainerCardStars = (runtime: DecompCableClubRuntime, index: number): number => runtime.trainerCardStars[index] ?? 0;

export function PrintNumPlayersInLink(runtime: DecompCableClubRuntime, windowId: number, numPlayers: number): void {
  ConvertIntToDecimalStringN(runtime, numPlayers);
  SetStdWindowBorderStyle(runtime, windowId);
  runtime.gStringVar4 = `NumPlayerLink:${runtime.gStringVar1}`;
  AddTextPrinterParameterized(runtime, windowId, runtime.gStringVar4);
  CopyWindowToVram(runtime, windowId);
}

export function ClearLinkPlayerCountWindow(runtime: DecompCableClubRuntime, windowId: number): void {
  ClearStdWindowAndFrame(runtime, windowId);
  CopyWindowToVram(runtime, windowId);
}

export function UpdateLinkPlayerCountDisplay(runtime: DecompCableClubRuntime, taskId: number, numPlayers: number): void {
  const data = runtime.tasks[taskId].data;
  if (numPlayers !== data[3]) {
    if (numPlayers < 2) ClearLinkPlayerCountWindow(runtime, data[5]);
    else PrintNumPlayersInLink(runtime, data[5], numPlayers);
    data[3] = numPlayers;
  }
}

export function ExchangeDataAndGetLinkupStatus(
  runtime: DecompCableClubRuntime,
  _minPlayers: number,
  _maxPlayers: number
): number {
  switch (GetLinkPlayerDataExchangeStatusTimed(runtime)) {
    case EXCHANGE_COMPLETE:
      return LINKUP_SUCCESS;
    case EXCHANGE_DIFF_SELECTIONS:
      return LINKUP_DIFF_SELECTIONS;
    case EXCHANGE_PLAYER_NOT_READY:
      return LINKUP_PLAYER_NOT_READY;
    case EXCHANGE_PARTNER_NOT_READY:
      return LINKUP_PARTNER_NOT_READY;
    case EXCHANGE_WRONG_NUM_PLAYERS:
      ConvertIntToDecimalStringN(runtime, GetLinkPlayerCount_2(runtime));
      return LINKUP_WRONG_NUM_PLAYERS;
    default:
      return LINKUP_ONGOING;
  }
}

export function CheckLinkErrored(runtime: DecompCableClubRuntime, taskId: number): boolean {
  if (HasLinkErrorOccurred(runtime) === true) {
    runtime.tasks[taskId].func = Task_LinkupConnectionError;
    return true;
  }
  return false;
}

export function CheckLinkCanceledBeforeConnection(runtime: DecompCableClubRuntime, taskId: number): boolean {
  if (runtime.input.bNew && !IsLinkConnectionEstablished(runtime)) {
    runtime.gLinkType = 0;
    runtime.tasks[taskId].func = Task_LinkupFailed;
    return true;
  }
  return false;
}

export function CheckLinkCanceled(runtime: DecompCableClubRuntime, taskId: number): boolean {
  if (IsLinkConnectionEstablished(runtime)) SetSuppressLinkErrorMessage(runtime, true);
  if (runtime.input.bNew) {
    runtime.gLinkType = 0;
    runtime.tasks[taskId].func = Task_LinkupFailed;
    return true;
  }
  return false;
}

export function CheckSioErrored(runtime: DecompCableClubRuntime, taskId: number): boolean {
  if (GetSioMultiSI(runtime) === true) {
    runtime.tasks[taskId].func = Task_LinkupConnectionError;
    return true;
  }
  return false;
}

export function Task_DelayedBlockRequest(runtime: DecompCableClubRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  task.data[0]++;
  if (task.data[0] === 10) {
    SendBlockRequest(runtime, BLOCK_REQ_SIZE_100);
    DestroyTask(runtime, taskId);
  }
}

export function CreateLinkupTask(runtime: DecompCableClubRuntime, minPlayers: number, maxPlayers: number): void {
  if (FindTaskIdByFunc(runtime, Task_LinkupStart) === TASK_NONE) {
    const taskId = CreateTask(runtime, Task_LinkupStart, 80);
    runtime.tasks[taskId].data[1] = minPlayers;
    runtime.tasks[taskId].data[2] = maxPlayers;
  }
}

export function Task_LinkupStart(runtime: DecompCableClubRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[0] === 0) {
    OpenLinkTimed(runtime);
    ResetLinkPlayerCount(runtime);
    ResetLinkPlayers(runtime);
    data[5] = AddWindow(runtime);
  } else if (data[0] > 9) {
    runtime.tasks[taskId].func = Task_LinkupAwaitConnection;
  }
  data[0]++;
}

export function Task_LinkupAwaitConnection(runtime: DecompCableClubRuntime, taskId: number): void {
  const playerCount = GetLinkPlayerCount_2(runtime);
  if (CheckLinkCanceledBeforeConnection(runtime, taskId) === true || CheckLinkCanceled(runtime, taskId) === true || playerCount < 2)
    return;

  SetSuppressLinkErrorMessage(runtime, true);
  runtime.tasks[taskId].data[3] = 0;
  if (IsLinkMaster(runtime) === true) {
    PlaySE(runtime, SE_PIN);
    ShowFieldAutoScrollMessage(runtime, 'CableClub_Text_WhenAllPlayersReadyAConfirmBCancel');
    runtime.tasks[taskId].func = Task_LinkupConfirmWhenReady;
  } else {
    PlaySE(runtime, SE_BOO);
    ShowFieldAutoScrollMessage(runtime, 'CableClub_Text_AwaitingLinkupBCancel');
    runtime.tasks[taskId].func = Task_LinkupExchangeDataWithLeader;
  }
}

export function Task_LinkupConfirmWhenReady(runtime: DecompCableClubRuntime, taskId: number): void {
  if (
    CheckLinkCanceledBeforeConnection(runtime, taskId) === true ||
    CheckSioErrored(runtime, taskId) === true ||
    CheckLinkErrored(runtime, taskId) === true
  )
    return;

  if (GetFieldMessageBoxType(runtime) === FIELD_MESSAGE_BOX_HIDDEN) {
    runtime.tasks[taskId].data[3] = 0;
    runtime.tasks[taskId].func = Task_LinkupAwaitConfirmation;
  }
}

export function Task_LinkupAwaitConfirmation(runtime: DecompCableClubRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const linkPlayerCount = GetLinkPlayerCount_2(runtime);
  if (
    CheckLinkCanceledBeforeConnection(runtime, taskId) === true ||
    CheckSioErrored(runtime, taskId) === true ||
    CheckLinkErrored(runtime, taskId) === true
  )
    return;

  UpdateLinkPlayerCountDisplay(runtime, taskId, linkPlayerCount);
  if (runtime.input.aNew && linkPlayerCount >= data[1]) {
    SaveLinkPlayers(runtime, linkPlayerCount);
    ClearLinkPlayerCountWindow(runtime, data[5]);
    ClearLinkPlayerCountWindow(runtime, data[5]);
    ConvertIntToDecimalStringN(runtime, linkPlayerCount);
    ShowFieldAutoScrollMessage(runtime, 'CableClub_Text_StartLinkWithXPlayersAConfirmBCancel');
    runtime.tasks[taskId].func = Task_LinkupTryConfirmation;
  }
}

export function Task_LinkupTryConfirmation(runtime: DecompCableClubRuntime, taskId: number): void {
  if (
    CheckLinkCanceledBeforeConnection(runtime, taskId) === true ||
    CheckSioErrored(runtime, taskId) === true ||
    CheckLinkErrored(runtime, taskId) === true
  )
    return;

  if (GetFieldMessageBoxType(runtime) === FIELD_MESSAGE_BOX_HIDDEN) {
    if (GetSavedPlayerCount(runtime) !== GetLinkPlayerCount_2(runtime)) {
      ShowFieldAutoScrollMessage(runtime, 'CableClub_Text_WhenAllPlayersReadyAConfirmBCancel');
      runtime.tasks[taskId].func = Task_LinkupConfirmWhenReady;
    } else if (runtime.input.bHeld) {
      ShowFieldAutoScrollMessage(runtime, 'CableClub_Text_WhenAllPlayersReadyAConfirmBCancel');
      runtime.tasks[taskId].func = Task_LinkupConfirmWhenReady;
    } else if (runtime.input.aHeld) {
      PlaySE(runtime, SE_SELECT);
      CheckShouldAdvanceLinkState(runtime);
      runtime.tasks[taskId].func = Task_LinkupConfirm;
    }
  }
}

export function Task_LinkupConfirm(runtime: DecompCableClubRuntime, taskId: number): void {
  const minPlayers = runtime.tasks[taskId].data[1];
  const maxPlayers = runtime.tasks[taskId].data[2];
  if (CheckLinkErrored(runtime, taskId) === true || TryLinkTimeout(runtime, taskId) === true) return;

  if (GetLinkPlayerCount_2(runtime) !== GetSavedPlayerCount(runtime)) {
    runtime.tasks[taskId].func = Task_LinkupConnectionError;
  } else {
    runtime.gSpecialVar_Result = ExchangeDataAndGetLinkupStatus(runtime, minPlayers, maxPlayers);
    if (runtime.gSpecialVar_Result) runtime.tasks[taskId].func = Task_LinkupCheckStatusAfterConfirm;
  }
}

export function Task_LinkupExchangeDataWithLeader(runtime: DecompCableClubRuntime, taskId: number): void {
  const minPlayers = runtime.tasks[taskId].data[1];
  const maxPlayers = runtime.tasks[taskId].data[2];
  if (CheckLinkCanceledBeforeConnection(runtime, taskId) === true || CheckLinkErrored(runtime, taskId) === true) return;

  runtime.gSpecialVar_Result = ExchangeDataAndGetLinkupStatus(runtime, minPlayers, maxPlayers);
  if (runtime.gSpecialVar_Result === LINKUP_ONGOING) return;
  if (runtime.gSpecialVar_Result === LINKUP_DIFF_SELECTIONS || runtime.gSpecialVar_Result === LINKUP_WRONG_NUM_PLAYERS) {
    SetCloseLinkCallback(runtime);
    HideFieldMessageBox(runtime);
    runtime.tasks[taskId].func = Task_StopLinkup;
  } else if (
    runtime.gSpecialVar_Result === LINKUP_PLAYER_NOT_READY ||
    runtime.gSpecialVar_Result === LINKUP_PARTNER_NOT_READY
  ) {
    CloseLink(runtime);
    HideFieldMessageBox(runtime);
    runtime.tasks[taskId].func = Task_StopLinkup;
  } else {
    runtime.gFieldLinkPlayerCount = GetLinkPlayerCount_2(runtime);
    runtime.gLocalLinkPlayerId = GetMultiplayerId(runtime);
    SaveLinkPlayers(runtime, runtime.gFieldLinkPlayerCount);
    TrainerCard_GenerateCardForLinkPlayer(runtime);
    runtime.tasks[taskId].func = Task_LinkupAwaitTrainerCardData;
  }
}

export function AnyConnectedPartnersPlayingRS(runtime: DecompCableClubRuntime): boolean {
  for (let i = 0; i < GetLinkPlayerCount(runtime); i++) {
    const version = runtime.linkPlayers[i].version & 0xff;
    if (version === VERSION_RUBY || version === VERSION_SAPPHIRE) return true;
  }
  return false;
}

export function Task_LinkupCheckStatusAfterConfirm(runtime: DecompCableClubRuntime, taskId: number): void {
  if (CheckLinkErrored(runtime, taskId) === true) return;

  if (runtime.gSpecialVar_Result === LINKUP_WRONG_NUM_PLAYERS) {
    if (AnyConnectedPartnersPlayingRS(runtime) === true) CloseLink(runtime);
    else SetCloseLinkCallback(runtime);
    HideFieldMessageBox(runtime);
    runtime.tasks[taskId].func = Task_StopLinkup;
  } else if (runtime.gSpecialVar_Result === LINKUP_DIFF_SELECTIONS) {
    SetCloseLinkCallback(runtime);
    HideFieldMessageBox(runtime);
    runtime.tasks[taskId].func = Task_StopLinkup;
  } else if (
    runtime.gSpecialVar_Result === LINKUP_PLAYER_NOT_READY ||
    runtime.gSpecialVar_Result === LINKUP_PARTNER_NOT_READY
  ) {
    CloseLink(runtime);
    HideFieldMessageBox(runtime);
    runtime.tasks[taskId].func = Task_StopLinkup;
  } else {
    runtime.gFieldLinkPlayerCount = GetLinkPlayerCount_2(runtime);
    runtime.gLocalLinkPlayerId = GetMultiplayerId(runtime);
    SaveLinkPlayers(runtime, runtime.gFieldLinkPlayerCount);
    TrainerCard_GenerateCardForLinkPlayer(runtime);
    runtime.tasks[taskId].func = Task_LinkupAwaitTrainerCardData;
    SendBlockRequest(runtime, BLOCK_REQ_SIZE_100);
  }
}

export function Task_LinkupAwaitTrainerCardData(runtime: DecompCableClubRuntime, taskId: number): void {
  if (CheckLinkErrored(runtime, taskId) === true) return;
  if (GetBlockReceivedStatus(runtime) !== GetSavedLinkPlayerCountAsBitFlags(runtime)) return;

  for (let i = 0; i < GetLinkPlayerCount(runtime); i++) {
    const version = runtime.linkPlayers[i].version & 0xff;
    if (version !== VERSION_FIRE_RED && version !== VERSION_LEAF_GREEN) {
      runtime.trainerCards[i] = { rse: runtime.blockRecvBuffer[i], version: runtime.linkPlayers[i].version };
    } else {
      runtime.trainerCards[i] = runtime.blockRecvBuffer[i] as TrainerCard;
    }
  }
  SetSuppressLinkErrorMessage(runtime, false);
  ResetBlockReceivedFlags(runtime);
  HideFieldMessageBox(runtime);
  if (runtime.gSpecialVar_Result === LINKUP_SUCCESS) {
    if (runtime.gLinkType === LINKTYPE_BERRY_BLENDER_SETUP) runtime.unusedVarNeededToMatch[0] += 0;
    ClearLinkPlayerCountWindow(runtime, runtime.tasks[taskId].data[5]);
    ScriptContext_Enable(runtime);
    DestroyTask(runtime, taskId);
  } else {
    SetCloseLinkCallback(runtime);
    runtime.tasks[taskId].func = Task_StopLinkup;
  }
}

export function Task_StopLinkup(runtime: DecompCableClubRuntime, taskId: number): void {
  if (!runtime.receivedRemoteLinkPlayers) {
    ClearLinkPlayerCountWindow(runtime, runtime.tasks[taskId].data[5]);
    ScriptContext_Enable(runtime);
    RemoveWindow(runtime, runtime.tasks[taskId].data[5]);
    DestroyTask(runtime, taskId);
  }
}

export function Task_LinkupFailed(runtime: DecompCableClubRuntime, taskId: number): void {
  runtime.gSpecialVar_Result = LINKUP_FAILED;
  ClearLinkPlayerCountWindow(runtime, runtime.tasks[taskId].data[5]);
  HideFieldMessageBox(runtime);
  ScriptContext_Enable(runtime);
  DestroyTask(runtime, taskId);
}

export function Task_LinkupConnectionError(runtime: DecompCableClubRuntime, taskId: number): void {
  runtime.gSpecialVar_Result = LINKUP_CONNECTION_ERROR;
  ClearLinkPlayerCountWindow(runtime, runtime.tasks[taskId].data[5]);
  HideFieldMessageBox(runtime);
  ScriptContext_Enable(runtime);
  DestroyTask(runtime, taskId);
}

export function TryLinkTimeout(runtime: DecompCableClubRuntime, taskId: number): boolean {
  const task = runtime.tasks[taskId];
  if (++task.data[4] > 600) {
    task.func = Task_LinkupConnectionError;
    return true;
  }
  return false;
}

export function TryBattleLinkup(runtime: DecompCableClubRuntime): void {
  let minPlayers = 2;
  let maxPlayers = 2;
  switch (runtime.gSpecialVar_0x8004) {
    case USING_SINGLE_BATTLE:
      minPlayers = 2;
      maxPlayers = 2;
      runtime.gLinkType = LINKTYPE_SINGLE_BATTLE;
      break;
    case USING_DOUBLE_BATTLE:
      minPlayers = 2;
      maxPlayers = 2;
      runtime.gLinkType = LINKTYPE_DOUBLE_BATTLE;
      break;
    case USING_MULTI_BATTLE:
      minPlayers = 4;
      maxPlayers = 4;
      runtime.gLinkType = LINKTYPE_MULTI_BATTLE;
      break;
  }
  CreateLinkupTask(runtime, minPlayers, maxPlayers);
}

export function TryTradeLinkup(runtime: DecompCableClubRuntime): void {
  runtime.gLinkType = LINKTYPE_TRADE_SETUP;
  runtime.gBattleTypeFlags = 0;
  CreateLinkupTask(runtime, 2, 2);
}

export function TryRecordMixLinkup(runtime: DecompCableClubRuntime): void {
  runtime.gSpecialVar_Result = LINKUP_ONGOING;
  runtime.gLinkType = LINKTYPE_RECORD_MIX_BEFORE;
  runtime.gBattleTypeFlags = 0;
  CreateLinkupTask(runtime, 2, 4);
}

export function TryContestLinkup(runtime: DecompCableClubRuntime): void {
  runtime.gLinkType = LINKTYPE_CONTEST_GMODE;
  runtime.gBattleTypeFlags = 0;
  CreateLinkupTask(runtime, 4, 4);
}

export function CreateTask_ReestablishCableClubLink(runtime: DecompCableClubRuntime): number {
  if (FuncIsActiveTask(runtime, Task_ReestablishLink)) return TASK_NONE;
  switch (runtime.gSpecialVar_0x8004) {
    case USING_SINGLE_BATTLE:
      runtime.gLinkType = LINKTYPE_SINGLE_BATTLE;
      break;
    case USING_DOUBLE_BATTLE:
      runtime.gLinkType = LINKTYPE_DOUBLE_BATTLE;
      break;
    case USING_MULTI_BATTLE:
      runtime.gLinkType = LINKTYPE_MULTI_BATTLE;
      break;
    case USING_TRADE_CENTER:
      runtime.gLinkType = LINKTYPE_TRADE;
      break;
    case USING_RECORD_CORNER:
      runtime.gLinkType = LINKTYPE_RECORD_MIX_AFTER;
      break;
  }
  return CreateTask(runtime, Task_ReestablishLink, 80);
}

export function Task_ReestablishLink(runtime: DecompCableClubRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[0] === 0) {
    OpenLink(runtime);
    ResetLinkPlayers(runtime);
    CreateTask(runtime, Task_WaitForLinkPlayerConnection, 80);
  } else if (data[0] > 9) {
    runtime.tasks[taskId].func = Task_ReestablishLinkAwaitConnection;
  }
  data[0]++;
}

export function Task_ReestablishLinkAwaitConnection(runtime: DecompCableClubRuntime, taskId: number): void {
  if (GetLinkPlayerCount_2(runtime) >= 2) {
    if (IsLinkMaster(runtime) === true) runtime.tasks[taskId].func = Task_ReestablishLinkLeader;
    else runtime.tasks[taskId].func = Task_ReestablishLinkAwaitConfirmation;
  }
}

export function Task_ReestablishLinkLeader(runtime: DecompCableClubRuntime, taskId: number): void {
  if (GetSavedPlayerCount(runtime) === GetLinkPlayerCount_2(runtime)) {
    CheckShouldAdvanceLinkState(runtime);
    runtime.tasks[taskId].func = Task_ReestablishLinkAwaitConfirmation;
  }
}

export function Task_ReestablishLinkAwaitConfirmation(runtime: DecompCableClubRuntime, taskId: number): void {
  if (runtime.receivedRemoteLinkPlayers === true && runtime.exchangeStatus === EXCHANGE_COMPLETE) {
    CheckLinkPlayersMatchSaved(runtime);
    StartSendingKeysToLink(runtime);
    DestroyTask(runtime, taskId);
  }
}

export function CableClub_AskSaveTheGame(runtime: DecompCableClubRuntime): void {
  Field_AskSaveTheGame(runtime);
}

const setBattleFlagsForMode = (runtime: DecompCableClubRuntime): void => {
  switch (runtime.gSpecialVar_0x8004) {
    case USING_SINGLE_BATTLE:
      runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK;
      break;
    case USING_DOUBLE_BATTLE:
      runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE;
      break;
    case USING_MULTI_BATTLE:
      ReducePlayerPartyToThree(runtime);
      runtime.gBattleTypeFlags = BATTLE_TYPE_TRAINER | BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE | BATTLE_TYPE_MULTI;
      break;
  }
};

export function Task_StartWiredCableClubBattle(runtime: DecompCableClubRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      FadeScreen(runtime, 'FADE_TO_BLACK', 0);
      runtime.gLinkType = LINKTYPE_BATTLE;
      ClearLinkCallback_2(runtime);
      task.data[0]++;
      break;
    case 1:
      if (!runtime.gPaletteFade.active) task.data[0]++;
      break;
    case 2:
      if (++task.data[1] > 20) task.data[0]++;
      break;
    case 3:
      SetCloseLinkCallback(runtime);
      task.data[0]++;
      break;
    case 4:
      if (!runtime.receivedRemoteLinkPlayers) task.data[0]++;
      break;
    case 5:
      PlayMapChosenOrBattleBGM(runtime, runtime.linkPlayers[0].trainerId & 1 ? MUS_RS_VS_GYM_LEADER : MUS_RS_VS_TRAINER);
      setBattleFlagsForMode(runtime);
      CleanupOverworldWindowsAndTilemaps(runtime);
      runtime.gTrainerBattleOpponent_A = TRAINER_LINK_OPPONENT;
      SetMainCallback2(runtime, 'CB2_InitBattle');
      runtime.gMain.savedCallback = 'CB2_ReturnFromCableClubBattle';
      DestroyTask(runtime, taskId);
      break;
  }
}

export function Task_StartWirelessCableClubBattle(runtime: DecompCableClubRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      FadeScreen(runtime, 'FADE_TO_BLACK', 0);
      runtime.gLinkType = LINKTYPE_BATTLE;
      ClearLinkCallback_2(runtime);
      data[0] = 1;
      break;
    case 1:
      if (!runtime.gPaletteFade.active) data[0] = 2;
      break;
    case 2:
      SendBlock(runtime, 0, runtime.localLinkPlayer);
      data[0] = 3;
      break;
    case 3:
      if (GetBlockReceivedStatus(runtime) === GetLinkPlayerCountAsBitFlags(runtime)) {
        for (let i = 0; i < GetLinkPlayerCount(runtime); i++) {
          runtime.linkPlayers[i] = runtime.blockRecvBuffer[i] as LinkPlayer;
          ConvertLinkPlayerName(runtime, i);
          ResetBlockReceivedFlag(runtime, i);
        }
        data[0] = 4;
      }
      break;
    case 4:
      if (++data[1] > 20) data[0] = 5;
      break;
    case 5:
      if (!IsLinkTaskFinished(runtime)) break;
      SetLinkStandbyCallback(runtime);
      data[0] = 6;
      break;
    case 6:
      if (IsLinkTaskFinished(runtime)) data[0] = 7;
      break;
    case 7:
      PlayMapChosenOrBattleBGM(runtime, runtime.linkPlayers[0].trainerId & 1 ? MUS_RS_VS_GYM_LEADER : MUS_RS_VS_TRAINER);
      runtime.linkPlayers[0].linkType = LINKTYPE_BATTLE;
      setBattleFlagsForMode(runtime);
      CleanupOverworldWindowsAndTilemaps(runtime);
      runtime.gTrainerBattleOpponent_A = TRAINER_LINK_OPPONENT;
      SetMainCallback2(runtime, 'CB2_InitBattle');
      runtime.gMain.savedCallback = 'CB2_ReturnFromCableClubBattle';
      DestroyTask(runtime, taskId);
      break;
  }
}

export function CB2_ReturnFromUnionRoomBattle(runtime: DecompCableClubRuntime): void {
  switch (runtime.gMain.state) {
    case 0:
      SetCloseLinkCallback(runtime);
      runtime.gMain.state++;
      break;
    case 1:
      if (IsLinkTaskFinished(runtime)) SetMainCallback2(runtime, 'CB2_ReturnToField');
      break;
  }
}

export function CB2_ReturnFromCableClubBattle(runtime: DecompCableClubRuntime): void {
  runtime.gBattleTypeFlags &= ~BATTLE_TYPE_LINK_IN_BATTLE;
  Overworld_ResetMapMusic(runtime);
  LoadPlayerParty(runtime);
  SavePlayerBag(runtime);
  Special_UpdateTrainerFansAfterLinkBattle(runtime);

  if (runtime.gSpecialVar_0x8004 !== USING_MULTI_BATTLE) {
    UpdatePlayerLinkBattleRecords(runtime, runtime.gLocalLinkPlayerId ^ 1);
    if (runtime.gWirelessCommType !== 0) {
      switch (runtime.gBattleOutcome) {
        case B_OUTCOME_WON:
          MysteryGift_TryIncrementStat(runtime, CARD_STAT_BATTLES_WON, runtime.linkPlayers[GetMultiplayerId(runtime) ^ 1].trainerId);
          break;
        case B_OUTCOME_LOST:
          MysteryGift_TryIncrementStat(runtime, CARD_STAT_BATTLES_LOST, runtime.linkPlayers[GetMultiplayerId(runtime) ^ 1].trainerId);
          break;
      }
    }
  }

  if (InUnionRoom(runtime) === true) runtime.gMain.savedCallback = 'CB2_ReturnFromUnionRoomBattle';
  else runtime.gMain.savedCallback = 'CB2_ReturnToFieldFromMultiplayer';
  SetMainCallback2(runtime, 'CB2_SetUpSaveAfterLinkBattle');
}

export function CleanupLinkRoomState(runtime: DecompCableClubRuntime): void {
  if (
    runtime.gSpecialVar_0x8004 === USING_SINGLE_BATTLE ||
    runtime.gSpecialVar_0x8004 === USING_DOUBLE_BATTLE ||
    runtime.gSpecialVar_0x8004 === USING_MULTI_BATTLE
  ) {
    LoadPlayerParty(runtime);
    SavePlayerBag(runtime);
  }
  SetWarpDestinationToDynamicWarp(runtime, WARP_ID_DYNAMIC);
}

export function ExitLinkRoom(runtime: DecompCableClubRuntime): void {
  QueueExitLinkRoomKey(runtime);
}

export function Task_EnterCableClubSeat(runtime: DecompCableClubRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      ShowFieldMessage(runtime, 'CableClub_Text_PleaseWaitBCancel');
      task.data[0] = 1;
      break;
    case 1:
      if (IsFieldMessageBoxHidden(runtime)) {
        SetInCableClubSeat(runtime);
        SetLocalLinkPlayerId(runtime, runtime.gSpecialVar_0x8005);
        task.data[0] = 2;
      }
      break;
    case 2:
      switch (GetCableClubPartnersReady(runtime)) {
        case CABLE_SEAT_WAITING:
          break;
        case CABLE_SEAT_SUCCESS:
          HideFieldMessageBox(runtime);
          task.data[0] = 0;
          SetStartedCableClubActivity(runtime);
          SwitchTaskToFollowupFunc(runtime, taskId);
          break;
        case CABLE_SEAT_FAILED:
          task.data[0] = 3;
          break;
      }
      break;
    case 3:
      SetLinkWaitingForScript(runtime);
      EraseFieldMessageBox(runtime, true);
      DestroyTask(runtime, taskId);
      ScriptContext_Enable(runtime);
      break;
  }
}

export function CreateTask_EnterCableClubSeat(runtime: DecompCableClubRuntime, followupFunc: CableClubTaskFunc): void {
  const taskId = CreateTask(runtime, Task_EnterCableClubSeat, 80);
  SetTaskFuncWithFollowupFunc(runtime, taskId, Task_EnterCableClubSeat, followupFunc);
  ScriptContext_Stop(runtime);
}

export function Task_StartWiredTrade(runtime: DecompCableClubRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  switch (task.data[0]) {
    case 0:
      LockPlayerFieldControls(runtime);
      FadeScreen(runtime, 'FADE_TO_BLACK', 0);
      ClearLinkCallback_2(runtime);
      task.data[0]++;
      break;
    case 1:
      if (!runtime.gPaletteFade.active) task.data[0]++;
      break;
    case 2:
      runtime.gSelectedTradeMonPositions[TRADE_PLAYER] = 0;
      runtime.gSelectedTradeMonPositions[TRADE_PARTNER] = 0;
      m4aMPlayAllStop(runtime);
      SetCloseLinkCallback(runtime);
      task.data[0]++;
      break;
    case 3:
      if (!runtime.receivedRemoteLinkPlayers) {
        SetMainCallback2(runtime, 'CB2_StartCreateTradeMenu');
        DestroyTask(runtime, taskId);
      }
      break;
  }
}

export function Task_StartWirelessTrade(runtime: DecompCableClubRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      LockPlayerFieldControls(runtime);
      FadeScreen(runtime, 'FADE_TO_BLACK', 0);
      ClearLinkRfuCallback(runtime);
      data[0]++;
      break;
    case 1:
      if (!runtime.gPaletteFade.active) data[0]++;
      break;
    case 2:
      if (!IsLinkTaskFinished(runtime)) break;
      runtime.gSelectedTradeMonPositions[TRADE_PLAYER] = 0;
      runtime.gSelectedTradeMonPositions[TRADE_PARTNER] = 0;
      m4aMPlayAllStop(runtime);
      SetLinkStandbyCallback(runtime);
      data[0]++;
      break;
    case 3:
      if (IsLinkTaskFinished(runtime)) {
        CreateTask_CreateTradeMenu(runtime);
        DestroyTask(runtime, taskId);
      }
      break;
  }
}

export function EnterTradeSeat(runtime: DecompCableClubRuntime): void {
  if (runtime.gWirelessCommType) CreateTask_EnterCableClubSeat(runtime, Task_StartWirelessTrade);
  else CreateTask_EnterCableClubSeat(runtime, Task_StartWiredTrade);
}

export function CreateTask_StartWiredTrade(runtime: DecompCableClubRuntime): void {
  CreateTask(runtime, Task_StartWiredTrade, 80);
}

export function StartWiredCableClubTrade(runtime: DecompCableClubRuntime): void {
  CreateTask_StartWiredTrade(runtime);
  ScriptContext_Stop(runtime);
}

export function EnterColosseumPlayerSpot(runtime: DecompCableClubRuntime): void {
  runtime.gLinkType = LINKTYPE_BATTLE;
  if (runtime.gWirelessCommType) CreateTask_EnterCableClubSeat(runtime, Task_StartWirelessCableClubBattle);
  else CreateTask_EnterCableClubSeat(runtime, Task_StartWiredCableClubBattle);
}

export function CreateTask_EnterCableClubSeatNoFollowup(runtime: DecompCableClubRuntime): void {
  CreateTask(runtime, Task_EnterCableClubSeat, 80);
  ScriptContext_Stop(runtime);
}

export function Script_ShowLinkTrainerCard(runtime: DecompCableClubRuntime): void {
  ShowTrainerCardInLink(runtime, runtime.gSpecialVar_0x8006, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
}

export function GetSeeingLinkPlayerCardMsg(runtime: DecompCableClubRuntime, linkPlayerIndex: number): boolean {
  runtime.gSpecialVar_0x8006 = linkPlayerIndex;
  runtime.gStringVar1 = runtime.linkPlayers[linkPlayerIndex].name;
  const numStars = GetTrainerCardStars(runtime, linkPlayerIndex);
  if (numStars === 0) return false;
  runtime.gStringVar2 = ['BronzeCard', 'CopperCard', 'SilverCard', 'GoldCard'][numStars - 1];
  return true;
}

export function Task_WaitForLinkPlayerConnection(runtime: DecompCableClubRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (++task.data[0] > 300) {
    CloseLink(runtime);
    SetMainCallback2(runtime, 'CB2_LinkError');
    DestroyTask(runtime, taskId);
  }
  if (runtime.receivedRemoteLinkPlayers) DestroyTask(runtime, taskId);
}

export function Task_WaitExitToScript(runtime: DecompCableClubRuntime, taskId: number): void {
  if (!runtime.receivedRemoteLinkPlayers) {
    ScriptContext_Enable(runtime);
    DestroyTask(runtime, taskId);
  }
}

export function ExitLinkToScript(runtime: DecompCableClubRuntime, taskId: number): void {
  SetCloseLinkCallback(runtime);
  runtime.tasks[taskId].func = Task_WaitExitToScript;
}
