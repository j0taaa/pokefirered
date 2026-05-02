export interface URPlayer { id: number; name: string; trainerId: number; gender: number; activity: number; group: number; species?: number; level?: number; isEgg?: boolean; }
export interface URTask { func: keyof typeof unionRoomTaskHandlers | null; data: number[]; destroyed: boolean; }
export interface UnionRoomRuntime {
  player: URPlayer; incoming: URPlayer[]; candidates: URPlayer[]; groupMembers: URPlayer[]; tradeBoard: URPlayer[]; buffer: URPlayer[];
  tasks: URTask[]; operations: string[]; messages: string[]; state: number; nextState: number; selectedId: number; activity: number; linkGroup: number;
  usingStartMenu: boolean; inUnionRoom: boolean; wirelessActive: boolean; textBusy: boolean; yesNoInput: number; listInput: number;
  registeredTradeMon: number; party: URPlayer[]; activePartners: URPlayer[]; trainerCard: Record<string, unknown>; linkPlayerInfoFlags: number;
}
export const ACTIVITY_NONE = 0, ACTIVITY_BATTLE = 1, ACTIVITY_TRADE = 2, ACTIVITY_CHAT = 3, ACTIVITY_CARD = 4, ACTIVITY_NEWS = 5;
export const UR_COLOR_NORMAL = 0, UR_COLOR_GRAY = 1, UR_COLOR_RED = 2;
let activeRuntime: UnionRoomRuntime | null = null;
const req = (runtime?: UnionRoomRuntime): UnionRoomRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('union room runtime is not active'); return r; };
const op = (r: UnionRoomRuntime, s: string): void => { r.operations.push(s); };
const makeTask = (func: keyof typeof unionRoomTaskHandlers | null): URTask => ({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
const createTask = (r: UnionRoomRuntime, func: keyof typeof unionRoomTaskHandlers): number => { const id = r.tasks.length; r.tasks.push(makeTask(func)); op(r, `CreateTask:${func}:${id}`); return id; };
const destroyTask = (r: UnionRoomRuntime, id: number): void => { r.tasks[id].destroyed = true; r.tasks[id].func = null; op(r, `DestroyTask:${id}`); };
const task = (r: UnionRoomRuntime, id: number): URTask => r.tasks[id] ?? (r.tasks[id] = makeTask(null));
const clonePlayer = (p: URPlayer): URPlayer => ({ ...p });
const samePlayer = (a: URPlayer, b: URPlayer): boolean => a.id === b.id && a.trainerId === b.trainerId && a.name === b.name;
export function createUnionRoomRuntime(): UnionRoomRuntime { const r: UnionRoomRuntime = { player: { id: 1, name: 'PLAYER', trainerId: 12345, gender: 0, activity: ACTIVITY_NONE, group: 0 }, incoming: [], candidates: [], groupMembers: [], tradeBoard: [], buffer: [], tasks: [], operations: [], messages: [], state: 0, nextState: 0, selectedId: -1, activity: ACTIVITY_NONE, linkGroup: 0, usingStartMenu: false, inUnionRoom: false, wirelessActive: false, textBusy: false, yesNoInput: -1, listInput: -1, registeredTradeMon: -1, party: [], activePartners: [], trainerCard: {}, linkPlayerInfoFlags: 0 }; activeRuntime = r; return r; }
export function PrintNumPlayersWaitingForMsg(windowId: number, capacityCode: number, stringId: number, r=req()): void { op(r, `PrintNumPlayersWaitingForMsg:${windowId}:${capacityCode}:${stringId}:${r.groupMembers.length}`); }
export function PrintPlayerNameAndIdOnWindow(windowId: number, r=req()): void { op(r, `PrintPlayerNameAndIdOnWindow:${windowId}:${r.player.name}:${r.player.trainerId}`); }
export function GetAwaitingCommunicationText(dst: string[] | { value?: string }, caseId: number, _r=req()): string { const text = ['Awaiting communication...', 'Awaiting response...', 'Please wait...'][caseId] ?? 'Awaiting communication...'; if (Array.isArray(dst)) dst[0] = text; else dst.value = text; return text; }
export function TryBecomeLinkLeader(r=req()): void { r.state = 0; createTask(r, 'Task_TryBecomeLinkLeader'); }
export function Task_TryBecomeLinkLeader(taskId: number, r=req()): void { const t = task(r, taskId); if (t.data[0]++ === 0) { r.wirelessActive = true; r.groupMembers = [clonePlayer(r.player)]; } else { r.state = 1; destroyTask(r, taskId); } }
export function Leader_DestroyResources(data: { destroyed?: boolean } | null, r=req()): void { if (data) data.destroyed = true; r.groupMembers = []; op(r, 'Leader_DestroyResources'); }
export function Leader_GetAcceptNewMemberPrompt(dst: string[] | { value?: string }, activity: number, _r=req()): string { const text = `Accept member for activity ${activity}?`; if (Array.isArray(dst)) dst[0] = text; else dst.value = text; return text; }
export function GetYouDeclinedTheOfferMessage(dst: string[] | { value?: string }, activity: number, _r=req()): string { const text = `Declined activity ${activity}`; if (Array.isArray(dst)) dst[0] = text; else dst.value = text; return text; }
export function GetYouAskedToJoinGroupPleaseWaitMessage(dst: string[] | { value?: string }, activity: number, _r=req()): string { const text = `Asked to join ${activity}. Please wait.`; if (Array.isArray(dst)) dst[0] = text; else dst.value = text; return text; }
export function GetGroupLeaderSentAnOKMessage(dst: string[] | { value?: string }, caseId: number, _r=req()): string { const text = `Leader OK ${caseId}`; if (Array.isArray(dst)) dst[0] = text; else dst.value = text; return text; }
export function Leader_DisconnectOnState(data: { state?: number; disconnected?: boolean }, state: number, _r=req()): void { if (data.state === state) data.disconnected = true; }
export function Leader_SetStateIfMemberListChanged(data: { state?: number; lastCount?: number }, joinedState: number, droppedState: number, r=req()): void { const prev = data.lastCount ?? 0; data.state = r.groupMembers.length > prev ? joinedState : r.groupMembers.length < prev ? droppedState : data.state; data.lastCount = r.groupMembers.length; }
export function ItemPrintFunc_PossibleGroupMembers(windowId: number, id: number, y: number, r=req()): void { const p = r.candidates[id]; op(r, `ItemPrintFunc_PossibleGroupMembers:${windowId}:${p?.name ?? 'NONE'}:${y}`); }
export function LeaderUpdateGroupMembership(list: { players?: URPlayer[] }, r=req()): void { r.groupMembers = (list.players ?? []).map(clonePlayer); }
export function LeaderPrunePlayerList(list: { players?: URPlayer[] }, r=req()): void { list.players = (list.players ?? []).filter((p) => r.incoming.some((q) => samePlayer(p, q))); }
export function TryJoinLinkGroup(r=req()): void { createTask(r, 'Task_TryJoinLinkGroup'); }
export function svc_50_wrapper(r=req()): void { op(r, 'svc_50_wrapper'); }
export function Task_TryJoinLinkGroup(taskId: number, r=req()): void { const t = task(r, taskId); if (t.data[0]++ === 0) r.state = 1; else { r.groupMembers.push(clonePlayer(r.player)); destroyTask(r, taskId); } }
export function IsTryingToTradeAcrossVersionTooSoon(data: { version?: number }, id: number, _r=req()): boolean { return (data.version ?? 1) !== id; }
export function AskToJoinRfuGroup(data: { requestedId?: number }, id: number, r=req()): void { data.requestedId = id; r.selectedId = id; op(r, `AskToJoinRfuGroup:${id}`); }
export function CreateTask_ListenToWireless(r=req()): number { return createTask(r, 'Task_ListenToWireless'); }
export function Task_ListenToWireless(taskId: number, r=req()): void { r.wirelessActive = true; task(r, taskId).data[0]++; ReceiveUnionRoomActivityPacket({} as never, r); }
export function IsPartnerActivityAcceptable(activity: number, group: number, _r=req()): boolean { return activity !== ACTIVITY_NONE && (group === 0 || group === activity); }
export function GetGroupListTextColor(data: { players?: URPlayer[] }, id: number, r=req()): number { const p = data.players?.[id]; return !p ? UR_COLOR_GRAY : IsPartnerActivityAcceptable(p.activity, r.linkGroup, r) ? UR_COLOR_NORMAL : UR_COLOR_RED; }
export function ListMenuItemPrintFunc_UnionRoomGroups(windowId: number, id: number, y: number, r=req()): void { op(r, `ListMenuItemPrintFunc_UnionRoomGroups:${windowId}:${r.candidates[id]?.name ?? 'NONE'}:${y}`); }
export function GetNewLeaderCandidate(r=req()): number { const p = r.candidates.find((c) => !r.groupMembers.some((m) => samePlayer(m, c))); return p?.id ?? -1; }
export function Task_CreateTradeMenu(taskId: number, r=req()): void { r.state = 2; op(r, 'Task_CreateTradeMenu'); destroyTask(r, taskId); }
export function CreateTask_CreateTradeMenu(r=req()): number { return createTask(r, 'Task_CreateTradeMenu'); }
export function Task_StartUnionRoomTrade(taskId: number, r=req()): void { r.activity = ACTIVITY_TRADE; op(r, 'StartUnionRoomTrade'); destroyTask(r, taskId); }
export function Task_ExchangeCards(taskId: number, r=req()): void { r.activity = ACTIVITY_CARD; op(r, 'ExchangeCards'); destroyTask(r, taskId); }
export function CB2_ShowCard(r=req()): void { op(r, 'CB2_ShowCard'); }
export function StartUnionRoomBattle(battleFlags: number, r=req()): void { r.activity = ACTIVITY_BATTLE; op(r, `StartUnionRoomBattle:${battleFlags}`); }
export function WarpForWirelessMinigame(linkService: number, x: number, y: number, r=req()): void { op(r, `WarpForWirelessMinigame:${linkService}:${x}:${y}`); }
export function WarpForCableClubActivity(mapGroup: number, mapNum: number, x: number, y: number, linkService: number, r=req()): void { op(r, `WarpForCableClubActivity:${mapGroup}:${mapNum}:${x}:${y}:${linkService}`); }
export function CB2_TransitionToCableClub(r=req()): void { op(r, 'CB2_TransitionToCableClub'); }
export function CreateTrainerCardInBuffer(dest: Record<string, unknown>, setWonderCard: boolean, r=req()): void { Object.assign(dest, { name: r.player.name, trainerId: r.player.trainerId, wonderCard: setWonderCard }); r.trainerCard = dest; }
export function Task_StartActivity(taskId: number, r=req()): void { op(r, `Task_StartActivity:${r.activity}`); destroyTask(r, taskId); }
export function Task_RunScriptAndFadeToActivity(taskId: number, r=req()): void { op(r, 'Task_RunScriptAndFadeToActivity'); task(r, taskId).func = 'Task_StartActivity'; }
export function CreateTask_RunScriptAndFadeToActivity(r=req()): number { return createTask(r, 'Task_RunScriptAndFadeToActivity'); }
export function CreateTask_StartActivity(r=req()): number { return createTask(r, 'Task_StartActivity'); }
export function CreateTask_SendMysteryGift(activity: number, r=req()): number { r.activity = activity; return createTask(r, 'Task_SendMysteryGift'); }
export function Task_SendMysteryGift(taskId: number, r=req()): void { op(r, `Task_SendMysteryGift:${r.activity}`); destroyTask(r, taskId); }
export function CreateTask_LinkMysteryGiftWithFriend(activity: number, r=req()): number { r.activity = activity; return createTask(r, 'Task_CardOrNewsWithFriend'); }
export function Task_CardOrNewsWithFriend(taskId: number, r=req()): void { op(r, `Task_CardOrNewsWithFriend:${r.activity}`); destroyTask(r, taskId); }
export function CreateTask_LinkMysteryGiftOverWireless(activity: number, r=req()): number { r.activity = activity; return createTask(r, 'Task_CardOrNewsOverWireless'); }
export function Task_CardOrNewsOverWireless(taskId: number, r=req()): void { op(r, `Task_CardOrNewsOverWireless:${r.activity}`); destroyTask(r, taskId); }
export function RunUnionRoom(r=req()): void { r.inUnionRoom = true; createTask(r, 'Task_RunUnionRoom'); }
export function ReadU16(ptr: readonly number[], _r=req()): number { return (ptr[0] ?? 0) | ((ptr[1] ?? 0) << 8); }
export function ReadAsU16(ptr: readonly number[], r=req()): number { return ReadU16(ptr, r); }
export function ScheduleFieldMessageWithFollowupState(nextState: number, src: string, r=req()): void { r.nextState = nextState; r.messages.push(src); r.textBusy = true; }
export function ScheduleFieldMessageAndExit(src: string, r=req()): void { ScheduleFieldMessageWithFollowupState(-1, src, r); }
export function CopyPlayerListToBuffer(uroom: { players?: URPlayer[] }, r=req()): void { r.buffer = (uroom.players ?? r.incoming).map(clonePlayer); }
export function CopyPlayerListFromBuffer(uroom: { players?: URPlayer[] }, r=req()): void { uroom.players = r.buffer.map(clonePlayer); }
export function Task_RunUnionRoom(taskId: number, r=req()): void { task(r, taskId).data[0]++; HandlePlayerListUpdate(r); }
export function SetUsingUnionRoomStartMenu(r=req()): void { r.usingStartMenu = true; }
export function ReceiveUnionRoomActivityPacket(_uroom: unknown, r=req()): void { if (r.incoming.length) r.activePartners = r.incoming.filter((p) => p.activity !== ACTIVITY_NONE); }
export function HandleContactFromOtherPlayer(_uroom: unknown, r=req()): void { const p = r.activePartners[0]; if (p) { r.selectedId = p.id; r.messages.push(`Contact:${p.name}`); } }
export function InitUnionRoom(r=req()): void { r.inUnionRoom = true; r.state = 0; createTask(r, 'Task_InitUnionRoom'); }
export function Task_InitUnionRoom(taskId: number, r=req()): void { r.state = 1; destroyTask(r, taskId); }
export function BufferUnionRoomPlayerName(r=req()): string { return r.incoming.find((p) => p.id === r.selectedId)?.name ?? ''; }
export function HandlePlayerListUpdate(r=req()): void { r.candidates = r.incoming.filter((p) => !r.candidates.some((q) => samePlayer(p, q))).concat(r.candidates.filter((p) => r.incoming.some((q) => samePlayer(p, q)))); }
export function Task_SearchForChildOrParent(taskId: number, r=req()): void { task(r, taskId).data[0]++; HandlePlayerListUpdate(r); }
export function CreateTask_SearchForChildOrParent(parentList: URPlayer[], childList: URPlayer[], linkGroup: number, r=req()): number { r.incoming = parentList.concat(childList).map(clonePlayer); r.linkGroup = linkGroup; return createTask(r, 'Task_SearchForChildOrParent'); }
export function Task_ListenForCompatiblePartners(taskId: number, r=req()): void { r.activePartners = r.incoming.filter((p) => IsPartnerActivityAcceptable(p.activity, r.linkGroup, r)); task(r, taskId).data[0]++; }
export function HasWonderCardOrNewsByLinkGroup(data: { activity?: number }, linkGroup: number, _r=req()): boolean { return linkGroup === ACTIVITY_CARD || linkGroup === ACTIVITY_NEWS || data.activity === ACTIVITY_CARD || data.activity === ACTIVITY_NEWS; }
export function Task_ListenForWonderDistributor(taskId: number, r=req()): void { r.activePartners = r.incoming.filter((p) => HasWonderCardOrNewsByLinkGroup(p, r.linkGroup, r)); task(r, taskId).data[0]++; }
export function CreateTask_ListenForCompatiblePartners(main4: URPlayer[], linkGroup: number, r=req()): number { r.incoming = main4.map(clonePlayer); r.linkGroup = linkGroup; return createTask(r, 'Task_ListenForCompatiblePartners'); }
export function CreateTask_ListenForWonderDistributor(main4: URPlayer[], linkGroup: number, r=req()): number { r.incoming = main4.map(clonePlayer); r.linkGroup = linkGroup; return createTask(r, 'Task_ListenForWonderDistributor'); }
export function UR_PrintFieldMessage(src: string, r=req()): void { r.messages.push(src); }
export function UR_RunTextPrinters(r=req()): boolean { const wasBusy = r.textBusy; r.textBusy = false; return wasBusy; }
export function PrintOnTextbox(textState: { value: number } | number[], str: string, r=req()): boolean { r.messages.push(str); if (Array.isArray(textState)) textState[0] = (textState[0] ?? 0) + 1; else textState.value += 1; return true; }
export function UnionRoomHandleYesNo(state: { value: number } | number[], noDraw: boolean, r=req()): number { if (!noDraw) op(r, 'DrawYesNo'); const result = r.yesNoInput; if (Array.isArray(state)) state[0] = result; else state.value = result; return result; }
export function CreateTradeBoardWindow(_template: unknown, r=req()): number { op(r, 'CreateTradeBoardWindow'); return 1; }
export function DeleteTradeBoardWindow(windowId: number, r=req()): void { op(r, `DeleteTradeBoardWindow:${windowId}`); }
export function ListMenuHandler_AllItemsAvailable(state: number[] | { value: number }, windowId: number[] | { value: number }, listMenuId: number[] | { value: number }, _winTemplate: unknown, _menuTemplate: unknown, r=req()): number { const result = r.listInput; const set = (x: number[] | { value: number }, v: number) => Array.isArray(x) ? (x[0] = v) : (x.value = v); set(state, result); set(windowId, 1); set(listMenuId, 1); return result; }
export function TradeBoardMenuHandler(state: number[] | { value: number }, mainWindowId: number[] | { value: number }, listMenuId: number[] | { value: number }, headerWindowId: number[] | { value: number }, winTemplate: unknown, menuTemplate: unknown, list: { players?: URPlayer[] }, r=req()): number { r.tradeBoard = (list.players ?? []).map(clonePlayer); const result = ListMenuHandler_AllItemsAvailable(state, mainWindowId, listMenuId, winTemplate, menuTemplate, r); if (Array.isArray(headerWindowId)) headerWindowId[0] = 2; else headerWindowId.value = 2; return result; }
export function UR_ClearBg0(r=req()): void { op(r, 'UR_ClearBg0'); }
export function JoinGroup_EnableScriptContexts(r=req()): void { op(r, 'JoinGroup_EnableScriptContexts'); }
export function PrintUnionRoomText(windowId: number, fontId: number, str: string, x: number, y: number, colorIdx: number, r=req()): void { op(r, `PrintUnionRoomText:${windowId}:${fontId}:${str}:${x}:${y}:${colorIdx}`); }
export function ClearRfuPlayerList(x20arr: URPlayer[], count: number, _r=req()): void { x20arr.splice(0, count); }
export function ClearIncomingPlayerList(list: URPlayer[], count: number, r=req()): void { ClearRfuPlayerList(list, count, r); }
export function ArePlayersDifferent(a: URPlayer, b: URPlayer, _r=req()): boolean { return !samePlayer(a, b); }
export function ArePlayerDataDifferent(a: URPlayer, b: URPlayer, r=req()): boolean { return ArePlayersDifferent(a, b, r) || a.activity !== b.activity || a.group !== b.group; }
export function GetNewIncomingPlayerId(list: URPlayer[], player: URPlayer, _r=req()): number { return list.findIndex((p) => samePlayer(p, player)); }
export function TryAddIncomingPlayerToList(list: URPlayer[], player: URPlayer, r=req()): boolean { if (GetNewIncomingPlayerId(list, player, r) >= 0) return false; list.push(clonePlayer(player)); return true; }
export function PrintGroupMemberOnWindow(windowId: number, member: URPlayer, y: number, r=req()): void { op(r, `PrintGroupMemberOnWindow:${windowId}:${member.name}:${y}`); }
export function PrintGroupCandidateOnWindow(windowId: number, candidate: URPlayer, y: number, r=req()): void { op(r, `PrintGroupCandidateOnWindow:${windowId}:${candidate.name}:${y}`); }
export function IsPlayerFacingTradingBoard(r=req()): boolean { return r.state === 2; }
export function GetResponseIdx_InviteToURoomActivity(activity: number, r=req()): number { return IsPartnerActivityAcceptable(activity, r.linkGroup, r) ? 0 : 1; }
export function ConvPartnerUnameAndGetWhetherMetAlready(player: URPlayer, r=req()): boolean { return r.groupMembers.some((p) => samePlayer(p, player)); }
export function UnionRoomGetPlayerInteractionResponse(player: URPlayer, r=req()): number { return ConvPartnerUnameAndGetWhetherMetAlready(player, r) ? 1 : 0; }
export function ItemPrintFunc_Unused(windowId: number, id: number, y: number, r=req()): void { op(r, `ItemPrintFunc_Unused:${windowId}:${id}:${y}`); }
export function TradeBoardPrintItemInfo(windowId: number, id: number, y: number, r=req()): void { const p = r.tradeBoard[id]; op(r, `TradeBoardPrintItemInfo:${windowId}:${p?.species ?? 0}:${y}`); }
export function TradeBoardListMenuItemPrintFunc(windowId: number, id: number, y: number, r=req()): void { TradeBoardPrintItemInfo(windowId, id, y, r); }
export function GetIndexOfNthTradeBoardOffer(n: number, r=req()): number { let seen = -1; return r.tradeBoard.findIndex((p) => { if (p.species) seen++; return seen === n; }); }
export function GetUnionRoomPlayerGender(r=req()): number { return r.player.gender; }
export function IsRequestedTradeInPlayerParty(r=req()): boolean { return r.party.some((p) => p.species === r.tradeBoard[r.selectedId]?.species); }
export function GetURoomActivityRejectMsg(activity: number, _r=req()): string { return `Reject activity ${activity}`; }
export function GetURoomActivityStartMsg(activity: number, _r=req()): string { return `Start activity ${activity}`; }
export function GetChatLeaderActionRequestMessage(_r=req()): string { return 'Chat leader action?'; }
export function PollPartnerYesNoResponse(r=req()): number { return r.yesNoInput; }
export function InUnionRoom(r=req()): boolean { return r.inUnionRoom; }
export function HasAtLeastTwoMonsOfLevel30OrLower(r=req()): boolean { return r.party.filter((p) => !p.isEgg && (p.level ?? 100) <= 30).length >= 2; }
export function ResetUnionRoomTrade(r=req()): void { r.registeredTradeMon = -1; r.tradeBoard = []; }
export function Script_ResetUnionRoomTrade(r=req()): void { ResetUnionRoomTrade(r); }
export function RegisterTradeMonAndGetIsEgg(monId: number, r=req()): boolean { r.registeredTradeMon = monId; return !!r.party[monId]?.isEgg; }
export function RegisterTradeMon(monId: number, r=req()): void { r.registeredTradeMon = monId; }
export function GetPartyPositionOfRegisteredMon(r=req()): number { return r.registeredTradeMon; }
export function HandleCancelActivity(r=req()): void { r.activity = ACTIVITY_NONE; r.messages.push('Activity canceled'); }
export function StartScriptInteraction(r=req()): void { op(r, 'StartScriptInteraction'); }
export function GetLinkPlayerInfoFlags(r=req()): number { return r.linkPlayerInfoFlags; }
export function GetActivePartnersInfo(r=req()): URPlayer[] { return r.activePartners.map(clonePlayer); }
export function ViewURoomPartnerTrainerCard(r=req()): void { const p = r.activePartners[0]; r.trainerCard = { name: p?.name ?? '', trainerId: p?.trainerId ?? 0 }; op(r, 'ViewURoomPartnerTrainerCard'); }
export const unionRoomTaskHandlers = { Task_TryBecomeLinkLeader, Task_TryJoinLinkGroup, Task_ListenToWireless, Task_CreateTradeMenu, Task_StartUnionRoomTrade, Task_ExchangeCards, Task_StartActivity, Task_RunScriptAndFadeToActivity, Task_SendMysteryGift, Task_CardOrNewsWithFriend, Task_CardOrNewsOverWireless, Task_RunUnionRoom, Task_InitUnionRoom, Task_SearchForChildOrParent, Task_ListenForCompatiblePartners, Task_ListenForWonderDistributor };
