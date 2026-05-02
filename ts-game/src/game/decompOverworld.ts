export interface WarpData { mapGroup: number; mapNum: number; warpId: number; x: number; y: number; }
export interface MapPosition { x: number; y: number; elevation?: number; }
export interface InitialPlayerAvatarState { transitionFlags: number; direction: number; hasDirectionSet: boolean; }
export interface ObjEventTemplate { localId: number; x: number; y: number; movementType: number; script?: string; kind?: string; }
export interface CableClubPlayer { movementMode: number; pos: MapPosition; metatileBehavior: number; facing: number; isLocalPlayer: boolean; }
export interface LinkPlayerObjectEvent { active: boolean; linkPlayerId: number; objEventId: number; x: number; y: number; facing: number; elevation: number; movementMode: number; stepTimer: number; rangeX: number; rangeY: number; spriteId: number; }
export interface MapConnection { direction: number; offset: number; mapGroup: number; mapNum: number; }
export interface MapConnectionHeader { count: number; connections: MapConnection[] | null; }
export interface OverworldMapHeader { mapGroup: number; mapNum: number; mapType: number; music: number; regionMapSectionId: number; battleScene: number; bikingAllowed: boolean; cave: boolean; layoutWidth: number; layoutHeight: number; warps: WarpData[]; connections?: MapConnectionHeader | null; }
export interface OverworldRuntime {
  operations: string[];
  money: number;
  partyHighestLevel: number;
  badges: boolean[];
  gameStats: number[];
  encryptionKey: number;
  objectEventTemplates: ObjEventTemplate[];
  mapHeader: OverworldMapHeader;
  mapGroups?: OverworldMapHeader[][];
  location: WarpData;
  lastUsedWarp: WarpData;
  warpDestination: WarpData;
  dynamicWarp: WarpData;
  lastHealLocation: WarpData;
  escapeWarp: WarpData;
  fixedDiveWarp: WarpData;
  fixedHoleWarp: WarpData;
  continueGameWarp: WarpData;
  pos: { x: number; y: number };
  mapLayoutId: number;
  mapLayouts?: unknown[];
  coordEventScripts?: Map<string, string>;
  interactedLinkPlayerScripts?: Map<string, string>;
  seenLinkPlayerCardMsgs?: Set<number>;
  flashLevel: number;
  maxFlashLevel: number;
  initialPlayerAvatarState: InitialPlayerAvatarState;
  playerAvatarFlags: number;
  playerFacingDirection: number;
  centerMetatileBehavior: number;
  flags: Set<string>;
  vars: Map<string, number>;
  savedMusic: number;
  currentMusic: number;
  defaultMusic: number;
  ambientCrySpecies: number;
  isAmbientCryWaterMon: boolean;
  disableMapMusicChangeOnMapLoad: number;
  mainCallback1: string | null;
  mainCallback2: string | null;
  fieldCallback: (() => void) | null;
  fieldCallbackName: string | null;
  fieldCallback2: (() => boolean) | null;
  vblankCallback: string | null;
  hblankCallback: string | null;
  linkStates: number[];
  linkKeys: number[];
  heldKeyCodeToSend: number;
  keyInterceptCallback: string;
  receivingFromLink: boolean;
  rfuKeepAliveTimer: number;
  localLinkPlayerId: number;
  fieldLinkPlayerCount: number;
  linkSendQueueLength: number;
  linkRecvQueueLength: number;
  linkPlayerObjectEvents: LinkPlayerObjectEvent[];
  linkPlayerCoords: Array<{ x: number; y: number; facing: number; elevation: number; }>;
  cableClubSeats: Set<number>;
  linkWaitingForScript: boolean;
  startedCableClubActivity: boolean;
  exitLinkRoomQueued: boolean;
  credits: { script: unknown; cmdLength: number; cmdIndex: number; scrolling: boolean; fadeDone: boolean; };
}

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;
export const PLAYER_AVATAR_FLAG_ON_FOOT = 1;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 2;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 4;
export const PLAYER_AVATAR_FLAG_SURFING = 8;
export const PLAYER_AVATAR_FLAG_UNDERWATER = 16;
export const MAP_TYPE_NONE = 0;
export const MAP_TYPE_TOWN = 1;
export const MAP_TYPE_CITY = 2;
export const MAP_TYPE_ROUTE = 3;
export const MAP_TYPE_UNDERWATER = 4;
export const MAP_TYPE_INDOOR = 5;
export const MAP_TYPE_SECRET_BASE = 6;
export const MAP_TYPE_OCEAN_ROUTE = 7;
export const PLAYER_LINK_STATE_IDLE = 0x80;
export const PLAYER_LINK_STATE_BUSY = 0x81;
export const PLAYER_LINK_STATE_READY = 0x82;
export const PLAYER_LINK_STATE_EXITING_ROOM = 0x83;
export const MOVEMENT_MODE_FREE = 0;
export const MOVEMENT_MODE_FROZEN = 1;
export const MOVEMENT_MODE_SCRIPTED = 2;
export const CableClub_EventScript_TooBusyToNotice = 'CableClub_EventScript_TooBusyToNotice';
export const CableClub_EventScript_ReadTrainerCard = 'CableClub_EventScript_ReadTrainerCard';
export const CableClub_EventScript_ReadTrainerCardColored = 'CableClub_EventScript_ReadTrainerCardColored';

const NUM_GAME_STATS = 64;
const dummyWarp = (): WarpData => ({ mapGroup: -1, mapNum: -1, warpId: -1, x: -1, y: -1 });
const cloneWarp = (warp: WarpData): WarpData => ({ ...warp });
let activeRuntime: OverworldRuntime | null = null;

export function createOverworldRuntime(overrides: Partial<OverworldRuntime> = {}): OverworldRuntime {
  const runtime: OverworldRuntime = {
    operations: [],
    money: 3000,
    partyHighestLevel: 5,
    badges: Array.from({ length: 8 }, () => false),
    gameStats: Array.from({ length: NUM_GAME_STATS }, () => 0),
    encryptionKey: 0,
    objectEventTemplates: [],
    mapHeader: { mapGroup: 0, mapNum: 0, mapType: MAP_TYPE_TOWN, music: 100, regionMapSectionId: 0, battleScene: 0, bikingAllowed: true, cave: false, layoutWidth: 30, layoutHeight: 30, warps: [], connections: null },
    location: { mapGroup: 0, mapNum: 0, warpId: -1, x: 0, y: 0 },
    lastUsedWarp: dummyWarp(),
    warpDestination: dummyWarp(),
    dynamicWarp: dummyWarp(),
    lastHealLocation: { mapGroup: 1, mapNum: 1, warpId: -1, x: 5, y: 5 },
    escapeWarp: dummyWarp(),
    fixedDiveWarp: dummyWarp(),
    fixedHoleWarp: dummyWarp(),
    continueGameWarp: dummyWarp(),
    pos: { x: 0, y: 0 },
    mapLayoutId: 0,
    flashLevel: 0,
    maxFlashLevel: 7,
    initialPlayerAvatarState: { transitionFlags: PLAYER_AVATAR_FLAG_ON_FOOT, direction: DIR_SOUTH, hasDirectionSet: false },
    playerAvatarFlags: PLAYER_AVATAR_FLAG_ON_FOOT,
    playerFacingDirection: DIR_SOUTH,
    centerMetatileBehavior: 0,
    flags: new Set(),
    vars: new Map(),
    savedMusic: 0,
    currentMusic: 0,
    defaultMusic: 100,
    ambientCrySpecies: 0,
    isAmbientCryWaterMon: false,
    disableMapMusicChangeOnMapLoad: 0,
    mainCallback1: null,
    mainCallback2: null,
    fieldCallback: null,
    fieldCallbackName: null,
    fieldCallback2: null,
    vblankCallback: null,
    hblankCallback: null,
    linkStates: Array.from({ length: 4 }, () => PLAYER_LINK_STATE_IDLE),
    linkKeys: Array.from({ length: 4 }, () => 0),
    heldKeyCodeToSend: 0,
    keyInterceptCallback: 'KeyInterCB_ReadButtons',
    receivingFromLink: false,
    rfuKeepAliveTimer: 0,
    localLinkPlayerId: 0,
    fieldLinkPlayerCount: 1,
    linkSendQueueLength: 0,
    linkRecvQueueLength: 0,
    linkPlayerObjectEvents: Array.from({ length: 4 }, (_v, i) => ({ active: false, linkPlayerId: i, objEventId: 0, x: 0, y: 0, facing: DIR_SOUTH, elevation: 0, movementMode: 0, stepTimer: 0, rangeX: 0, rangeY: 0, spriteId: i })),
    linkPlayerCoords: Array.from({ length: 4 }, () => ({ x: 0, y: 0, facing: DIR_SOUTH, elevation: 0 })),
    cableClubSeats: new Set(),
    linkWaitingForScript: false,
    startedCableClubActivity: false,
    exitLinkRoomQueued: false,
    credits: { script: null, cmdLength: 0, cmdIndex: 0, scrolling: false, fadeDone: false },
    ...overrides
  };
  activeRuntime = runtime;
  runtime.mapGroups ??= [[runtime.mapHeader]];
  return runtime;
}

const req = (runtime?: OverworldRuntime): OverworldRuntime => { const r = runtime ?? activeRuntime; if (!r) throw new Error('overworld runtime is not active'); return r; };
const op = (r: OverworldRuntime, name: string, ...args: Array<string | number | boolean>): void => { r.operations.push([name, ...args].join(':')); };
const setWarp = (warp: WarpData, mapGroup: number, mapNum: number, warpId: number, x: number, y: number): void => { warp.mapGroup = mapGroup; warp.mapNum = mapNum; warp.warpId = warpId; warp.x = x; warp.y = y; };
const resetSharedOverworldState = (r: OverworldRuntime): void => { ResetInitialPlayerAvatarState(r); ['FLAG_SYS_ON_CYCLING_ROAD', 'FLAG_SYS_CRUISE_MODE', 'FLAG_SYS_SAFARI_MODE', 'FLAG_SYS_USE_STRENGTH', 'FLAG_SYS_FLASH_ACTIVE', 'FLAG_SYS_QL_DEPARTED'].forEach(flag => r.flags.delete(flag)); r.vars.set('VAR_MAP_SCENE_ROUTE16', 0); r.vars.set('VAR_MAP_SCENE_FUCHSIA_CITY_SAFARI_ZONE_ENTRANCE', 0); r.vars.set('VAR_QL_ENTRANCE', 0); };
const mapPositionKey = (pos: MapPosition): string => `${pos.x},${pos.y},${pos.elevation ?? 0}`;
const directionToVector = (direction: number): { x: number; y: number } => {
  switch (direction) {
    case DIR_SOUTH: return { x: 0, y: 1 };
    case DIR_NORTH: return { x: 0, y: -1 };
    case DIR_WEST: return { x: -1, y: 0 };
    case DIR_EAST: return { x: 1, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

export function DoWhiteOut(r = req()): void { op(r, 'RunScriptImmediately:EventScript_ResetEliteFourEnd'); r.money -= ComputeWhiteOutMoneyLoss(r); if (r.money < 0) r.money = 0; op(r, 'HealPlayerParty'); Overworld_ResetStateAfterWhitingOut(r); Overworld_SetWhiteoutRespawnPoint(r); WarpIntoMap(r); }
export function ComputeWhiteOutMoneyLoss(r = req()): number { const nbadges = CountBadgesForOverworldWhiteOutLossCalculation(r); const multipliers = [2, 4, 6, 9, 12, 16, 20, 25, 30]; return Math.min(r.money, r.partyHighestLevel * 4 * multipliers[nbadges]); }
export function OverworldWhiteOutGetMoneyLoss(r = req()): string { return String(ComputeWhiteOutMoneyLoss(r)); }
export function CountBadgesForOverworldWhiteOutLossCalculation(r = req()): number { return r.badges.filter(Boolean).length; }
export function Overworld_ResetStateAfterFly(r = req()): void { resetSharedOverworldState(r); }
export function Overworld_ResetStateAfterTeleport(r = req()): void { resetSharedOverworldState(r); }
export function Overworld_ResetStateAfterDigEscRope(r = req()): void { resetSharedOverworldState(r); }
export function Overworld_ResetStateAfterWhitingOut(r = req()): void { resetSharedOverworldState(r); }
export function Overworld_ResetStateOnContinue(r = req()): void { r.flags.delete('FLAG_SYS_SAFARI_MODE'); r.vars.set('VAR_MAP_SCENE_FUCHSIA_CITY_SAFARI_ZONE_ENTRANCE', 0); ChooseAmbientCrySpecies(r); op(r, 'UpdateLocationHistoryForRoamer'); op(r, 'RoamerMoveToOtherLocationSet'); }
export function ResetGameStats(r = req()): void { r.gameStats.fill(0); }
export function IncrementGameStat(statId: number, r = req()): void { if (statId >= NUM_GAME_STATS) return; SetGameStat(statId, Math.min(0xffffff, GetGameStat(statId, r) + 1), r); }
export function GetGameStat(statId: number, r = req()): number { return statId >= NUM_GAME_STATS ? 0 : (r.gameStats[statId] ^ r.encryptionKey) >>> 0; }
export function SetGameStat(statId: number, statVal: number, r = req()): void { if (statId < NUM_GAME_STATS) r.gameStats[statId] = (statVal ^ r.encryptionKey) >>> 0; }
export function ApplyNewEncryptionKeyToGameStats(newKey: number, r = req()): void { for (let i = 0; i < r.gameStats.length; i++) r.gameStats[i] = GetGameStat(i, r) ^ newKey; r.encryptionKey = newKey; }
export function LoadObjEventTemplatesFromHeader(r = req()): void { op(r, 'LoadObjEventTemplatesFromHeader'); }
export function LoadSaveblockObjEventScripts(r = req()): void { r.objectEventTemplates.forEach(t => { t.script ??= 'script'; }); }
export function SetObjEventTemplateCoords(localId: number, x: number, y: number, r = req()): void { const t = r.objectEventTemplates.find(o => o.localId === localId); if (t) { t.x = x; t.y = y; } }
export function SetObjEventTemplateMovementType(localId: number, movementType: number, r = req()): void { const t = r.objectEventTemplates.find(o => o.localId === localId); if (t) t.movementType = movementType; }
export function InitMapView(r = req()): void { op(r, 'InitMapView'); }
export function GetMapLayout(r = req()): unknown | null {
  const mapLayoutId = r.mapLayoutId & 0xffff;
  if (mapLayoutId)
    return r.mapLayouts?.[mapLayoutId - 1] ?? null;
  return null;
}
export function Overworld_GetMapHeaderByGroupAndId(mapGroup: number, mapNum: number, r = req()): OverworldMapHeader {
  return r.mapGroups?.[mapGroup]?.[mapNum] ?? r.mapHeader;
}
export function GetDestinationWarpMapHeader(r = req()): OverworldMapHeader {
  return Overworld_GetMapHeaderByGroupAndId(r.warpDestination.mapGroup, r.warpDestination.mapNum, r);
}
export function ApplyCurrentWarp(r = req()): void { r.lastUsedWarp = cloneWarp(r.location); r.location = cloneWarp(r.warpDestination); r.fixedDiveWarp = dummyWarp(); r.fixedHoleWarp = dummyWarp(); }
export function SetWarpData(warp: WarpData, mapGroup: number, mapNum: number, warpId: number, x: number, y: number): void { setWarp(warp, mapGroup, mapNum, warpId, x, y); }
export function IsDummyWarp(warp: WarpData): boolean { return warp.mapGroup === -1 && warp.mapNum === -1 && warp.warpId === -1 && warp.x === -1 && warp.y === -1; }
export function LoadCurrentMapData(r = req()): void { r.mapHeader.mapGroup = r.location.mapGroup; r.mapHeader.mapNum = r.location.mapNum; r.mapLayoutId = r.mapLayoutId || 1; }
export function LoadSaveblockMapHeader(r = req()): void { LoadCurrentMapData(r); }
export function SetPlayerCoordsFromWarp(r = req()): void { const warp = r.location.warpId >= 0 ? r.mapHeader.warps[r.location.warpId] : null; if (warp) { r.pos.x = warp.x; r.pos.y = warp.y; } else if (r.location.x >= 0 && r.location.y >= 0) { r.pos.x = r.location.x; r.pos.y = r.location.y; } else { r.pos.x = Math.trunc(r.mapHeader.layoutWidth / 2); r.pos.y = Math.trunc(r.mapHeader.layoutHeight / 2); } }
export function WarpIntoMap(r = req()): void { ApplyCurrentWarp(r); LoadCurrentMapData(r); SetPlayerCoordsFromWarp(r); }
export function SetWarpDestination(mapGroup: number, mapNum: number, warpId: number, x: number, y: number, r = req()): void { setWarp(r.warpDestination, mapGroup, mapNum, warpId, x, y); }
export function SetWarpDestinationToMapWarp(mapGroup: number, mapNum: number, warpId: number, r = req()): void { SetWarpDestination(mapGroup, mapNum, warpId, -1, -1, r); }
export function SetDynamicWarp(_unused: number, mapGroup: number, mapNum: number, warpId: number, r = req()): void { setWarp(r.dynamicWarp, mapGroup, mapNum, warpId, r.pos.x, r.pos.y); }
export function SetDynamicWarpWithCoords(_unused: number, mapGroup: number, mapNum: number, warpId: number, x: number, y: number, r = req()): void { setWarp(r.dynamicWarp, mapGroup, mapNum, warpId, x, y); }
export function SetWarpDestinationToDynamicWarp(_unusedWarpId = 0, r = req()): void { r.warpDestination = cloneWarp(r.dynamicWarp); }
export function SetWarpDestinationToHealLocation(_healLocationId: number, r = req()): void { r.warpDestination = cloneWarp(r.lastHealLocation); }
export function SetWarpDestinationToLastHealLocation(r = req()): void { r.warpDestination = cloneWarp(r.lastHealLocation); }
export function Overworld_SetWhiteoutRespawnPoint(r = req()): void { r.warpDestination = cloneWarp(r.lastHealLocation); }
export function SetLastHealLocationWarp(_healLocationId: number, r = req()): void { r.lastHealLocation = cloneWarp(r.warpDestination); }
export function UpdateEscapeWarp(x: number, y: number, r = req()): void { if (IsMapTypeOutdoors(GetCurrentMapType(r)) && !IsMapTypeOutdoors(GetMapTypeByWarpData(r.warpDestination, r))) SetEscapeWarp(r.location.mapGroup, r.location.mapNum, -1, x - 7, y - 7, r); }
export function SetEscapeWarp(mapGroup: number, mapNum: number, warpId: number, x: number, y: number, r = req()): void { setWarp(r.escapeWarp, mapGroup, mapNum, warpId, x, y); }
export function SetWarpDestinationToEscapeWarp(r = req()): void { r.warpDestination = cloneWarp(r.escapeWarp); }
export function SetFixedDiveWarp(mapGroup: number, mapNum: number, warpId: number, x: number, y: number, r = req()): void { setWarp(r.fixedDiveWarp, mapGroup, mapNum, warpId, x, y); }
export function SetWarpDestinationToDiveWarp(r = req()): void { r.warpDestination = cloneWarp(r.fixedDiveWarp); }
export function SetFixedHoleWarp(mapGroup: number, mapNum: number, warpId: number, x: number, y: number, r = req()): void { setWarp(r.fixedHoleWarp, mapGroup, mapNum, warpId, x, y); }
export function SetWarpDestinationToFixedHoleWarp(x: number, y: number, r = req()): void { if (IsDummyWarp(r.fixedHoleWarp)) r.warpDestination = cloneWarp(r.lastUsedWarp); else SetWarpDestination(r.fixedHoleWarp.mapGroup, r.fixedHoleWarp.mapNum, -1, x, y, r); }
export function SetWarpDestinationToContinueGameWarp(r = req()): void { r.warpDestination = cloneWarp(r.continueGameWarp); }
export function SetContinueGameWarp(mapGroup: number, mapNum: number, warpId: number, x: number, y: number, r = req()): void { setWarp(r.continueGameWarp, mapGroup, mapNum, warpId, x, y); }
export function SetContinueGameWarpToHealLocation(_healLocationId: number, r = req()): void { r.continueGameWarp = cloneWarp(r.lastHealLocation); }
export function SetContinueGameWarpToDynamicWarp(_unused = 0, r = req()): void { r.continueGameWarp = cloneWarp(r.dynamicWarp); }
export function GetMapConnection(dir: number, r = req()): MapConnection | null {
  const connectionHeader = r.mapHeader.connections ?? null;
  if (connectionHeader === null || connectionHeader.connections === null) return null;
  for (let i = 0; i < connectionHeader.count; i++) {
    const connection = connectionHeader.connections[i];
    if (connection !== undefined && connection.direction === (dir & 0xff)) return connection;
  }
  return null;
}
export function SetDiveWarp(_dir: number, x: number, y: number, r = req()): boolean { if (IsDummyWarp(r.fixedDiveWarp)) return false; SetWarpDestination(r.fixedDiveWarp.mapGroup, r.fixedDiveWarp.mapNum, -1, x, y, r); return true; }
export function SetDiveWarpEmerge(x: number, y: number, r = req()): boolean { return SetDiveWarp(0, x, y, r); }
export function SetDiveWarpDive(x: number, y: number, r = req()): boolean { return SetDiveWarp(1, x, y, r); }
export function LoadMapFromCameraTransition(mapGroup: number, mapNum: number, r = req()): void { SetWarpDestination(mapGroup, mapNum, -1, -1, -1, r); Overworld_TryMapConnectionMusicTransition(r); ApplyCurrentWarp(r); LoadCurrentMapData(r); op(r, 'LoadMapFromCameraTransition', mapGroup, mapNum); }
export function LoadMapFromWarp(_unused = false, r = req()): void { LoadCurrentMapData(r); LoadObjEventTemplatesFromHeader(r); SetDefaultFlashLevel(r); Overworld_ClearSavedMusic(r); op(r, 'LoadMapFromWarp'); }
export function QL_LoadMapNormal(r = req()): void { LoadCurrentMapData(r); SetDefaultFlashLevel(r); op(r, 'QL_LoadMapNormal'); }
export function ResetInitialPlayerAvatarState(r = req()): void { r.initialPlayerAvatarState = { direction: DIR_SOUTH, transitionFlags: PLAYER_AVATAR_FLAG_ON_FOOT, hasDirectionSet: false }; }
export function SetInitialPlayerAvatarStateWithDirection(dirn: number, r = req()): void { r.initialPlayerAvatarState = { direction: dirn, transitionFlags: PLAYER_AVATAR_FLAG_ON_FOOT, hasDirectionSet: true }; }
export function StoreInitialPlayerAvatarState(r = req()): void { r.initialPlayerAvatarState.direction = r.playerFacingDirection; r.initialPlayerAvatarState.transitionFlags = r.playerAvatarFlags; r.initialPlayerAvatarState.hasDirectionSet = false; }
export function GetAdjustedInitialTransitionFlags(playerStruct: InitialPlayerAvatarState, metatileBehavior: number, mapType: number, r = req()): number { if (mapType === MAP_TYPE_UNDERWATER) return PLAYER_AVATAR_FLAG_UNDERWATER; if (metatileBehavior === 1) return PLAYER_AVATAR_FLAG_SURFING; if (!Overworld_IsBikingAllowed(r)) return PLAYER_AVATAR_FLAG_ON_FOOT; return playerStruct.transitionFlags; }
export function MetatileBehavior_IsSurfableInSeafoamIslands(metatileBehavior: number): boolean { return metatileBehavior === 1; }
export function GetAdjustedInitialDirection(playerStruct: InitialPlayerAvatarState, _transitionFlags: number, metatileBehavior: number, mapType: number): number { if (mapType === MAP_TYPE_OCEAN_ROUTE) return DIR_EAST; if (metatileBehavior === 2) return DIR_NORTH; return playerStruct.hasDirectionSet ? playerStruct.direction : DIR_SOUTH; }
export function GetInitialPlayerAvatarState(r = req()): InitialPlayerAvatarState {
  const playerStruct = r.initialPlayerAvatarState;
  const mapType = GetCurrentMapType(r);
  const metatileBehavior = GetCenterScreenMetatileBehavior(r);
  const transitionFlags = GetAdjustedInitialTransitionFlags(playerStruct, metatileBehavior, mapType, r);
  r.initialPlayerAvatarState = {
    transitionFlags,
    direction: GetAdjustedInitialDirection(playerStruct, transitionFlags, metatileBehavior, mapType),
    hasDirectionSet: false
  };
  return r.initialPlayerAvatarState;
}
export function GetCenterScreenMetatileBehavior(r = req()): number { return r.centerMetatileBehavior; }
export function Overworld_IsBikingAllowed(r = req()): boolean { return r.mapHeader.bikingAllowed; }
export function SetDefaultFlashLevel(r = req()): void { r.flashLevel = !r.mapHeader.cave || r.flags.has('FLAG_SYS_FLASH_ACTIVE') ? 0 : r.maxFlashLevel; }
export function SetFlashLevel(flashLevel: number, r = req()): void { r.flashLevel = flashLevel < 0 || flashLevel > r.maxFlashLevel ? 0 : flashLevel; }
export function Overworld_GetFlashLevel(r = req()): number { return r.flashLevel; }
export function SetCurrentMapLayout(mapLayoutId: number, r = req()): void { r.mapLayoutId = mapLayoutId; }
export function Overworld_SetWarpDestinationFromWarp(warp: WarpData, r = req()): void { r.warpDestination = cloneWarp(warp); }
export function GetLocationMusic(warp: WarpData, r = req()): number { return warp.mapGroup === r.mapHeader.mapGroup && warp.mapNum === r.mapHeader.mapNum ? r.mapHeader.music : r.defaultMusic; }
export function GetCurrLocationDefaultMusic(r = req()): number { return GetLocationMusic(r.location, r); }
export function GetWarpDestinationMusic(r = req()): number { return GetLocationMusic(r.warpDestination, r); }
export function Overworld_ResetMapMusic(r = req()): void { r.currentMusic = 0; }
export function Overworld_PlaySpecialMapMusic(r = req()): void { if (r.disableMapMusicChangeOnMapLoad === 1) { r.currentMusic = 0; return; } if (r.disableMapMusicChangeOnMapLoad === 2) return; r.currentMusic = r.savedMusic || GetCurrLocationDefaultMusic(r); }
export function Overworld_SetSavedMusic(songId: number, r = req()): void { r.savedMusic = songId; }
export function Overworld_ClearSavedMusic(r = req()): void { r.savedMusic = 0; }
export function Overworld_TryMapConnectionMusicTransition(r = req()): void { if (GetCurrLocationDefaultMusic(r) !== GetWarpDestinationMusic(r)) TryFadeOutOldMapMusic(r); }
export function Overworld_ChangeMusicToDefault(r = req()): void { r.currentMusic = GetCurrLocationDefaultMusic(r); }
export function Overworld_ChangeMusicTo(music: number, r = req()): void { r.currentMusic = music; }
export function GetMapMusicFadeoutSpeed(_r = req()): number { return 4; }
export function TryFadeOutOldMapMusic(r = req()): void { op(r, 'TryFadeOutOldMapMusic'); }
export function BGMusicStopped(r = req()): boolean { return r.currentMusic === 0; }
export function Overworld_FadeOutMapMusic(r = req()): void { r.currentMusic = 0; }
export function PlayAmbientCry(r = req()): void { if (r.ambientCrySpecies) op(r, 'PlayAmbientCry', r.ambientCrySpecies); }
export function UpdateAmbientCry(r = req()): void { ChooseAmbientCrySpecies(r); PlayAmbientCry(r); }
export function ChooseAmbientCrySpecies(r = req()): void { r.ambientCrySpecies = r.mapHeader.regionMapSectionId || 1; r.isAmbientCryWaterMon = r.mapHeader.mapType === MAP_TYPE_OCEAN_ROUTE; }
export function Overworld_MusicCanOverrideMapMusic(_music: number, _r = req()): boolean { return true; }
export function GetMapTypeByGroupAndId(mapGroup: number, mapNum: number, r = req()): number { return mapGroup === r.mapHeader.mapGroup && mapNum === r.mapHeader.mapNum ? r.mapHeader.mapType : MAP_TYPE_TOWN; }
export function GetMapTypeByWarpData(warp: WarpData, r = req()): number { return GetMapTypeByGroupAndId(warp.mapGroup, warp.mapNum, r); }
export function GetCurrentMapType(r = req()): number { return r.mapHeader.mapType; }
export function GetLastUsedWarpMapType(r = req()): number { return GetMapTypeByWarpData(r.lastUsedWarp, r); }
export function GetLastUsedWarpMapSectionId(r = req()): number { return r.mapHeader.regionMapSectionId; }
export function IsMapTypeOutdoors(mapType: number): boolean { return [MAP_TYPE_TOWN, MAP_TYPE_CITY, MAP_TYPE_ROUTE, MAP_TYPE_OCEAN_ROUTE].includes(mapType); }
export function Overworld_MapTypeAllowsTeleportAndFly(mapType: number): boolean { return IsMapTypeOutdoors(mapType); }
export function IsMapTypeIndoors(mapType: number): boolean { return mapType === MAP_TYPE_INDOOR || mapType === MAP_TYPE_SECRET_BASE; }
export function GetSavedWarpRegionMapSectionId(r = req()): number { return r.mapHeader.regionMapSectionId; }
export function GetCurrentRegionMapSectionId(r = req()): number { return r.mapHeader.regionMapSectionId; }
export function GetCurrentMapBattleScene(r = req()): number { return r.mapHeader.battleScene; }
export function InitOverworldBgs(r = req()): void { op(r, 'InitOverworldBgs'); }
export function InitOverworldBgs_NoResetHeap(r = req()): void { op(r, 'InitOverworldBgs_NoResetHeap'); }
export function CleanupOverworldWindowsAndTilemaps(r = req()): void { op(r, 'CleanupOverworldWindowsAndTilemaps'); }
export function ResetSafariZoneFlag_(r = req()): void { r.flags.delete('FLAG_SYS_SAFARI_MODE'); }
export function IsUpdateLinkStateCBActive(r = req()): boolean { return r.mainCallback1 === 'CB1_UpdateLinkState'; }
export function DoCB1_Overworld(r = req()): void { CB1_Overworld(r); }
export function DoCB1_Overworld_QuestLogPlayback(r = req()): void { op(r, 'DoCB1_Overworld_QuestLogPlayback'); }
export function CB1_Overworld(r = req()): void { OverworldBasic(r); }
export function OverworldBasic(r = req()): void { op(r, 'OverworldBasic'); }
export function CB2_OverworldBasic(r = req()): void { op(r, 'CB2_OverworldBasic'); }
export function CB2_Overworld(r = req()): void { op(r, 'CB2_Overworld'); }
export function SetMainCallback1(callback: string, r = req()): void { r.mainCallback1 = callback; }
export function RunFieldCallback(r = req()): void { r.fieldCallback?.(); if (r.fieldCallbackName) op(r, r.fieldCallbackName); }
export function ClearFieldCallback(r = req()): void { r.fieldCallback = null; r.fieldCallbackName = null; }
export function CB2_NewGame(r = req()): void { op(r, 'CB2_NewGame'); }
export function CB2_WhiteOut(r = req()): void { DoWhiteOut(r); }
export function CB2_LoadMap(r = req()): void { DoMapLoadLoop({ value: 0 }, r); }
export function CB2_LoadMap2(r = req()): void { CB2_LoadMap(r); }
export function CB2_ReturnToFieldCableClub(r = req()): void { CB2_ReturnToFieldLink(r); }
export function CB2_LoadMapOnReturnToFieldCableClub(r = req()): void { CB2_LoadMap(r); }
export function CB2_ReturnToField(r = req()): void { CB2_ReturnToFieldLocal(r); }
export function CB2_ReturnToFieldLocal(r = req()): void { const state = { value: 0 }; ReturnToFieldLocal(state, r); }
export function CB2_ReturnToFieldLink(r = req()): void { const state = { value: 0 }; ReturnToFieldLink(state, r); }
export function CB2_ReturnToFieldFromMultiplayer(r = req()): void { CB2_ReturnToFieldLink(r); }
export function CB2_ReturnToFieldWithOpenMenu(r = req()): void { op(r, 'CB2_ReturnToFieldWithOpenMenu'); }
export function CB2_ReturnToFieldContinueScript(r = req()): void { op(r, 'ScriptContext_Enable'); CB2_ReturnToFieldLocal(r); }
export function CB2_ReturnToFieldContinueScriptPlayMapMusic(r = req()): void { Overworld_PlaySpecialMapMusic(r); CB2_ReturnToFieldContinueScript(r); }
export function CB2_ReturnToFieldFromDiploma(r = req()): void { CB2_ReturnToFieldLocal(r); }
export function FieldCB_ShowMapNameOnContinue(r = req()): void { op(r, 'ShowMapNamePopup'); }
export function CB2_ContinueSavedGame(r = req()): void { Overworld_ResetStateOnContinue(r); SetWarpDestinationToContinueGameWarp(r); WarpIntoMap(r); }
export function FieldClearVBlankHBlankCallbacks(r = req()): void { r.vblankCallback = null; r.hblankCallback = null; }
export function SetFieldVBlankCallback(r = req()): void { r.vblankCallback = 'VBlankCB_Field'; }
export function VBlankCB_Field(r = req()): void { op(r, 'VBlankCB_Field'); }
export function InitCurrentFlashLevelScanlineEffect(r = req()): void { op(r, 'InitCurrentFlashLevelScanlineEffect', r.flashLevel); }
export function LoadMapInStepsLink(state: { value: number }, r = req()): boolean { state.value++; if (state.value === 1) LoadMapFromWarp(false, r); return state.value > 1; }
export function LoadMapInStepsLocal(state: { value: number }, r = req()): boolean { return LoadMapInStepsLink(state, r); }
export function ReturnToFieldLocal(state: { value: number }, r = req()): boolean { state.value++; if (state.value === 1) ResumeMap(false, r); return state.value > 1; }
export function ReturnToFieldLink(state: { value: number }, r = req()): boolean { state.value++; if (state.value === 1) ResumeMap(true, r); return state.value > 1; }
export function DoMapLoadLoop(state: { value: number }, r = req()): void { while (!LoadMapInStepsLocal(state, r)) undefined; }
export function MoveSaveBlocks_ResetHeap_(r = req()): void { op(r, 'MoveSaveBlocks_ResetHeap_'); }
export function ResetScreenForMapLoad(r = req()): void { op(r, 'ResetScreenForMapLoad'); }
export function InitViewGraphics(r = req()): void { InitMapView(r); }
export function InitOverworldGraphicsRegisters(r = req()): void { op(r, 'InitOverworldGraphicsRegisters'); }
export function ResumeMap(inLink: boolean, r = req()): void { if (inLink) InitObjectEventsLink(r); else InitObjectEventsLocal(r); ReloadObjectsAndRunReturnToFieldMapScript(r); }
export function InitObjectEventsLink(r = req()): void { op(r, 'InitObjectEventsLink'); }
export function InitObjectEventsLocal(r = req()): void { op(r, 'InitObjectEventsLocal'); }
export function ReloadObjectsAndRunReturnToFieldMapScript(r = req()): void { op(r, 'ReloadObjectsAndRunReturnToFieldMapScript'); }
export function SetCameraToTrackPlayer(r = req()): void { op(r, 'SetCameraToTrackPlayer'); }
export function SetCameraToTrackGuestPlayer(r = req()): void { op(r, 'SetCameraToTrackGuestPlayer'); }
export function SetCameraToTrackGuestPlayer_2(r = req()): void { op(r, 'SetCameraToTrackGuestPlayer_2'); }
export function OffsetCameraFocusByLinkPlayerId(r = req()): void { op(r, 'OffsetCameraFocusByLinkPlayerId', r.localLinkPlayerId); }
export function SpawnLinkPlayers(r = req()): void { for (let i = 0; i < r.fieldLinkPlayerCount; i++) SpawnLinkPlayerObjectEvent(i, r.linkPlayerCoords[i].x, r.linkPlayerCoords[i].y, 0, r); }
export function CreateLinkPlayerSprites(r = req()): void { for (let i = 0; i < r.fieldLinkPlayerCount; i++) CreateLinkPlayerSprite(i, 0, r); }
export function CB2_SetUpOverworldForQLPlaybackWithWarpExit(r = req()): void { op(r, 'CB2_SetUpOverworldForQLPlaybackWithWarpExit'); }
export function CB2_SetUpOverworldForQLPlayback(r = req()): void { op(r, 'CB2_SetUpOverworldForQLPlayback'); }
export function CB2_LoadMapForQLPlayback(r = req()): void { DoLoadMap_QLPlayback({ value: 0 }, r); }
export function DoLoadMap_QLPlayback(state: { value: number }, r = req()): void { while (!LoadMap_QLPlayback(state, r)) undefined; }
export function LoadMap_QLPlayback(state: { value: number }, r = req()): boolean { state.value++; QL_LoadMapNormal(r); return true; }
export function CB2_EnterFieldFromQuestLog(r = req()): void { op(r, 'CB2_EnterFieldFromQuestLog'); }
export function Overworld_CreditsMainCB(r = req()): void { op(r, 'Overworld_CreditsMainCB'); }
export function FieldCB2_Credits_WaitFade(r = req()): boolean { return r.credits.fadeDone; }
export function Overworld_DoScrollSceneForCredits(r = req()): void { r.credits.scrolling = true; }
export function SetUpScrollSceneForCredits(state: { value: number }, _unused = 0, r = req()): boolean { state.value++; r.credits.scrolling = true; return state.value > 1; }
export function MapLdr_Credits(r = req()): boolean { r.credits.cmdIndex++; return r.credits.cmdIndex >= r.credits.cmdLength; }
export function CameraCB_CreditsPan(_camera: unknown, r = req()): void { op(r, 'CameraCB_CreditsPan'); }
export function Task_OvwldCredits_FadeOut(_taskId: number, r = req()): void { r.credits.fadeDone = false; op(r, 'Task_OvwldCredits_FadeOut'); }
export function Task_OvwldCredits_WaitFade(_taskId: number, r = req()): void { r.credits.fadeDone = true; }
export function CB1_UpdateLinkState(r = req()): void { HandleLinkPlayerKeyInput(r); }
export function ResetAllMultiplayerState(r = req()): void { ClearAllPlayerKeys(r); ResetAllLinkStates(r); r.linkWaitingForScript = false; }
export function ClearAllPlayerKeys(r = req()): void { r.linkKeys.fill(0); r.heldKeyCodeToSend = 0; }
export function SetKeyInterceptCallback(callback: string, r = req()): void { r.keyInterceptCallback = callback; }
export function CheckRfuKeepAliveTimer(r = req()): boolean { r.rfuKeepAliveTimer++; return r.rfuKeepAliveTimer > 60; }
export function ResetAllLinkStates(r = req()): void { r.linkStates.fill(PLAYER_LINK_STATE_IDLE); }
export function AreAllPlayersInLinkState(state: number, r = req()): boolean { return r.linkStates.slice(0, r.fieldLinkPlayerCount).every(s => s === state); }
export function IsAnyPlayerInLinkState(state: number, r = req()): boolean { return r.linkStates.slice(0, r.fieldLinkPlayerCount).some(s => s === state); }
export function HandleLinkPlayerKeyInput(r = req()): void { r.heldKeyCodeToSend = KeyInterCB_ReadButtons(r.localLinkPlayerId, r); UpdateHeldKeyCode(r.heldKeyCodeToSend, r); }
export function UpdateAllLinkPlayers(linkKeys: number[] = req().linkKeys, selfId = req().localLinkPlayerId, r = req()): void { for (let i = 0; i < r.fieldLinkPlayerCount; i++) if (i !== selfId) r.linkKeys[i] = linkKeys[i] ?? 0; }
export function UpdateHeldKeyCode(interceptedKeys: number, r = req()): void { r.heldKeyCodeToSend = interceptedKeys; }
export function KeyInterCB_ReadButtons(linkPlayerId: number, r = req()): number { return r.linkKeys[linkPlayerId] ?? 0; }
export function GetDirectionForDpadKey(key: number): number { if (key & 0x40) return DIR_NORTH; if (key & 0x80) return DIR_SOUTH; if (key & 0x20) return DIR_WEST; if (key & 0x10) return DIR_EAST; return DIR_NONE; }
export function ResetPlayerHeldKeys(linkKeys: number[]): void { linkKeys.fill(0); }
export function KeyInterCB_SelfIdle(linkPlayerId: number, r = req()): number { r.linkStates[linkPlayerId] = PLAYER_LINK_STATE_IDLE; return 0; }
export function KeyInterCB_Idle(_linkPlayerId = 0, _r = req()): number { return 0; }
export function KeyInterCB_DeferToEventScript(linkPlayerId: number, r = req()): number { r.linkStates[linkPlayerId] = PLAYER_LINK_STATE_BUSY; return 0; }
export function KeyInterCB_DeferToRecvQueue(_linkPlayerId = 0, r = req()): number { return r.linkRecvQueueLength > 0 ? 1 : 0; }
export function KeyInterCB_DeferToSendQueue(_linkPlayerId = 0, r = req()): number { return r.linkSendQueueLength > 0 ? 1 : 0; }
export function KeyInterCB_DoNothingAndKeepAlive(_linkPlayerId = 0, r = req()): number { CheckRfuKeepAliveTimer(r); return 0; }
export function KeyInterCB_Ready(linkPlayerId: number, r = req()): number { r.linkStates[linkPlayerId] = PLAYER_LINK_STATE_READY; return 0; }
export function KeyInterCB_SetReady(linkPlayerId: number, r = req()): number { return KeyInterCB_Ready(linkPlayerId, r); }
export function KeyInterCB_SendNothing(_linkPlayerId = 0, _r = req()): number { return 0; }
export function KeyInterCB_WaitForPlayersToExit(linkPlayerId: number, r = req()): number { return AreAllPlayersInLinkState(PLAYER_LINK_STATE_EXITING_ROOM, r) ? KeyInterCB_SendExitRoomKey(linkPlayerId, r) : 0; }
export function KeyInterCB_SendExitRoomKey(linkPlayerId: number, r = req()): number { r.linkStates[linkPlayerId] = PLAYER_LINK_STATE_EXITING_ROOM; return 0x2; }
export function KeyInterCB_SendNothing_2(_linkPlayerId = 0, _r = req()): number { return 0; }
export function GetCableClubPartnersReady(r = req()): boolean { return AreAllPlayersInLinkState(PLAYER_LINK_STATE_READY, r); }
export function IsAnyPlayerExitingCableClub(r = req()): boolean { return IsAnyPlayerInLinkState(PLAYER_LINK_STATE_EXITING_ROOM, r); }
export function SetInCableClubSeat(playerId: number, r = req()): void { r.cableClubSeats.add(playerId); }
export function SetLinkWaitingForScript(r = req()): void { r.linkWaitingForScript = true; }
export function QueueExitLinkRoomKey(r = req()): void { r.exitLinkRoomQueued = true; }
export function SetStartedCableClubActivity(r = req()): void { r.startedCableClubActivity = true; }
export function LoadCableClubPlayer(i: number, selfId: number, player: Record<string, unknown>, r = req()): void { Object.assign(player, { playerId: i, isLocalPlayer: i === selfId, pos: { ...r.linkPlayerCoords[i] } }); }
export function IsCableClubPlayerUnfrozen(player: { movementMode?: number }): boolean { return player.movementMode !== 1; }
export function CanCableClubPlayerPressStart(player: { isLocalPlayer?: boolean }): boolean { return !!player.isLocalPlayer; }
export function PlayerIsAtSouthExit(player: { pos?: { y: number } }): boolean { return (player.pos?.y ?? 0) > 0; }
export function TryGetTileEventScript(player: CableClubPlayer, r = req()): string | null {
  if (player.movementMode !== MOVEMENT_MODE_SCRIPTED)
    return null;
  return r.coordEventScripts?.get(mapPositionKey(player.pos)) ?? null;
}
export function TryInteractWithPlayer(player: CableClubPlayer, r = req()): string | null {
  if (player.movementMode !== MOVEMENT_MODE_FREE && player.movementMode !== MOVEMENT_MODE_SCRIPTED)
    return null;

  const vector = directionToVector(player.facing);
  const otherPlayerPos = { x: player.pos.x + vector.x, y: player.pos.y + vector.y, elevation: 0 };
  const linkPlayer = r.linkPlayerObjectEvents.find(ev => ev.active && ev.x === otherPlayerPos.x && ev.y === otherPlayerPos.y);
  const linkPlayerId = linkPlayer?.linkPlayerId ?? 4;

  if (linkPlayerId !== 4) {
    if (!player.isLocalPlayer)
      return CableClub_EventScript_TooBusyToNotice;
    if (r.linkStates[linkPlayerId] !== PLAYER_LINK_STATE_IDLE)
      return CableClub_EventScript_TooBusyToNotice;
    if (!r.seenLinkPlayerCardMsgs?.has(linkPlayerId))
      return CableClub_EventScript_ReadTrainerCard;
    return CableClub_EventScript_ReadTrainerCardColored;
  }

  return r.interactedLinkPlayerScripts?.get(mapPositionKey(otherPlayerPos)) ?? null;
}
export function GetDirectionForEventScript(script: string | null): number { if (script?.includes('north')) return DIR_NORTH; if (script?.includes('west')) return DIR_WEST; if (script?.includes('east')) return DIR_EAST; return DIR_SOUTH; }
export function InitLinkPlayerQueueScript(r = req()): void { op(r, 'InitLinkPlayerQueueScript'); }
export function InitLinkRoomStartMenuScript(r = req()): void { op(r, 'InitLinkRoomStartMenuScript'); }
export function RunInteractLocalPlayerScript(script: string, r = req()): void { op(r, 'RunInteractLocalPlayerScript', script); }
export function CreateConfirmLeaveTradeRoomPrompt(r = req()): void { op(r, 'CreateConfirmLeaveTradeRoomPrompt'); }
export function InitMenuBasedScript(script: string, r = req()): void { op(r, 'InitMenuBasedScript', script); }
export function RunTerminateLinkScript(r = req()): void { QueueExitLinkRoomKey(r); }
export function Overworld_LinkRecvQueueLengthMoreThan2(r = req()): boolean { return r.linkRecvQueueLength > 2; }
export function Overworld_RecvKeysFromLinkIsRunning(r = req()): boolean { return r.receivingFromLink; }
export function Overworld_SendKeysToLinkIsRunning(r = req()): boolean { return r.linkSendQueueLength > 0; }
export function IsSendingKeysOverCable(r = req()): boolean { return r.linkSendQueueLength > 0; }
export function GetLinkSendQueueLength(r = req()): number { return r.linkSendQueueLength; }
export function ZeroLinkPlayerObjectEvent(linkPlayerId: number, r = req()): void { r.linkPlayerObjectEvents[linkPlayerId] = { active: false, linkPlayerId, objEventId: 0, x: 0, y: 0, facing: DIR_SOUTH, elevation: 0, movementMode: 0, stepTimer: 0, rangeX: 0, rangeY: 0, spriteId: linkPlayerId }; }
export function ClearLinkPlayerObjectEvents(r = req()): void { for (let i = 0; i < r.linkPlayerObjectEvents.length; i++) ZeroLinkPlayerObjectEvent(i, r); }
export function ZeroObjectEvent(obj: Partial<LinkPlayerObjectEvent>): void { Object.assign(obj, { active: false, x: 0, y: 0 }); }
export function SpawnLinkPlayerObjectEvent(i: number, x: number, y: number, _gender = 0, r = req()): void { const ev = r.linkPlayerObjectEvents[i]; Object.assign(ev, { active: true, x, y, objEventId: i, linkPlayerId: i }); InitLinkPlayerObjectEventPos(ev, x, y); }
export function InitLinkPlayerObjectEventPos(objEvent: LinkPlayerObjectEvent, x: number, y: number): void { objEvent.x = x; objEvent.y = y; }
export function SetLinkPlayerObjectRange(linkPlayerId: number, rangeX: number, rangeY: number, r = req()): void { r.linkPlayerObjectEvents[linkPlayerId].rangeX = rangeX; r.linkPlayerObjectEvents[linkPlayerId].rangeY = rangeY; }
export function DestroyLinkPlayerObject(linkPlayerId: number, r = req()): void { r.linkPlayerObjectEvents[linkPlayerId].active = false; }
export function GetSpriteForLinkedPlayer(linkPlayerId: number, r = req()): number { return r.linkPlayerObjectEvents[linkPlayerId].spriteId; }
export function GetLinkPlayerCoords(linkPlayerId: number, r = req()): [number, number] { const ev = r.linkPlayerObjectEvents[linkPlayerId]; return [ev.x, ev.y]; }
export function GetLinkPlayerFacingDirection(linkPlayerId: number, r = req()): number { return r.linkPlayerObjectEvents[linkPlayerId].facing; }
export function GetLinkPlayerElevation(linkPlayerId: number, r = req()): number { return r.linkPlayerObjectEvents[linkPlayerId].elevation; }
export function GetLinkPlayerObjectStepTimer(linkPlayerId: number, r = req()): number { return r.linkPlayerObjectEvents[linkPlayerId].stepTimer; }
export function GetLinkPlayerIdAt(x: number, y: number, r = req()): number { return r.linkPlayerObjectEvents.find(ev => ev.active && ev.x === x && ev.y === y)?.linkPlayerId ?? 0xff; }
export function SetPlayerFacingDirection(linkPlayerId: number, setFacing: number, r = req()): void { r.linkPlayerObjectEvents[linkPlayerId].facing = setFacing; }
export function MovementEventModeCB_Normal(linkPlayer: LinkPlayerObjectEvent, _objEvent: unknown, direction: number): number { linkPlayer.facing = direction; linkPlayer.stepTimer++; return 0; }
export function MovementEventModeCB_Ignored(_linkPlayer: LinkPlayerObjectEvent, _objEvent: unknown, _direction: number): number { return 0; }
export function MovementEventModeCB_Normal_2(linkPlayer: LinkPlayerObjectEvent, objEvent: unknown, direction: number): number { return MovementEventModeCB_Normal(linkPlayer, objEvent, direction); }
export function FacingHandler_DoNothing(_linkPlayer: LinkPlayerObjectEvent, _objEvent: unknown, _direction: number): number { return 0; }
export function FacingHandler_DpadMovement(linkPlayer: LinkPlayerObjectEvent, _objEvent: unknown, direction: number): number { linkPlayer.facing = direction; return direction; }
export function FacingHandler_ForcedFacingChange(linkPlayer: LinkPlayerObjectEvent, _objEvent: unknown, direction: number): number { linkPlayer.facing = FlipVerticalAndClearForced(direction, linkPlayer.facing); return linkPlayer.facing; }
export function MovementStatusHandler_EnterFreeMode(linkPlayer: LinkPlayerObjectEvent): void { linkPlayer.movementMode = 0; }
export function MovementStatusHandler_TryAdvanceScript(linkPlayer: LinkPlayerObjectEvent): void { linkPlayer.stepTimer++; }
export function FlipVerticalAndClearForced(newFacing: number, _oldFacing: number): number { if (newFacing === 7) return DIR_NORTH; if (newFacing === 8) return DIR_SOUTH; if (newFacing === 9) return DIR_WEST; if (newFacing === 10) return DIR_EAST; return newFacing; }
export function LinkPlayerDetectCollision(selfObjEventId: number, _a2: number, x: number, y: number, r = req()): number { return r.linkPlayerObjectEvents.some(ev => ev.active && ev.objEventId !== selfObjEventId && ev.x === x && ev.y === y) ? 1 : 0; }
export function CreateLinkPlayerSprite(i: number, version = 0, r = req()): void { r.linkPlayerObjectEvents[i].spriteId = i + version * 10; }
export function SpriteCB_LinkPlayer(sprite: { x?: number; y?: number; data?: number[] }, r = req()): void { const id = sprite.data?.[0] ?? 0; sprite.x = r.linkPlayerObjectEvents[id].x; sprite.y = r.linkPlayerObjectEvents[id].y; }
