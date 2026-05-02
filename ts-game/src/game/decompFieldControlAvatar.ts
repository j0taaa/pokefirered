import * as MB from './decompMetatileBehavior';

export const SIGNPOST_POKECENTER = 0;
export const SIGNPOST_POKEMART = 1;
export const SIGNPOST_INDIGO_1 = 2;
export const SIGNPOST_INDIGO_2 = 3;
export const SIGNPOST_SCRIPTED = 240;
export const SIGNPOST_NA = 255;

export const A_BUTTON = 1;
export const B_BUTTON = 2;
export const SELECT_BUTTON = 4;
export const START_BUTTON = 8;
export const DPAD_RIGHT = 16;
export const DPAD_LEFT = 32;
export const DPAD_UP = 64;
export const DPAD_DOWN = 128;
export const R_BUTTON = 256;
export const L_BUTTON = 512;

export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const T_NOT_MOVING = 0;
export const T_TILE_CENTER = 2;
export const MOVING = 2;
export const PLAYER_SPEED_FASTEST = 4;
export const PLAYER_AVATAR_FLAG_FORCED = 1 << 0;
export const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << 1;
export const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << 2;
export const PLAYER_AVATAR_FLAG_ON_FOOT = 0;
export const OBJECT_EVENTS_COUNT = 16;
export const LOCALID_PLAYER = 0xff;
export const MAP_OFFSET = 7;
export const MAP_TYPE_SECRET_BASE = 9;
export const MAP_TYPE_UNDERWATER = 10;
export const MAP_DYNAMIC = 0x7f;
export const QL_STATE_PLAYBACK = 2;
export const QL_INPUT_OFF = 0;
export const QL_INPUT_UP = 1;
export const QL_INPUT_DOWN = 2;
export const QL_INPUT_LEFT = 3;
export const QL_INPUT_RIGHT = 4;
export const QL_INPUT_L = 5;
export const QL_INPUT_R = 6;
export const QL_INPUT_START = 7;
export const QL_INPUT_SELECT = 8;
export const FLDPSN_NONE = 0;
export const FLDPSN_PSN = 1;
export const FLDPSN_FNT = 2;
export const HIDDEN_ITEM_UNDERFOOT = 'underfoot';
export const HIDDEN_ITEM_ITEM = 'item';
export const HIDDEN_ITEM_FLAG = 'flag';
export const HIDDEN_ITEM_QUANTITY = 'quantity';

export type ScriptName =
  | 'EventScript_CancelMessageBox'
  | 'EventScript_PC'
  | 'PalletTown_PlayersHouse_2F_EventScript_PC'
  | 'EventScript_TestSignpostMsg'
  | 'EventScript_HiddenItemScript'
  | 'EventScript_WallTownMap'
  | 'EventScript_Bookshelf'
  | 'EventScript_PokeMartShelf'
  | 'EventScript_Food'
  | 'EventScript_ImpressiveMachine'
  | 'EventScript_Blueprints'
  | 'EventScript_VideoGame'
  | 'EventScript_Burglary'
  | 'EventScript_Computer'
  | 'TrainerTower_EventScript_ShowTime'
  | 'EventScript_PlayerFacingTVScreen'
  | 'EventScript_Cabinet'
  | 'EventScript_Kitchen'
  | 'EventScript_Dresser'
  | 'EventScript_Snacks'
  | 'EventScript_Painting'
  | 'EventScript_PowerPlantMachine'
  | 'EventScript_Telephone'
  | 'EventScript_AdvertisingPoster'
  | 'EventScript_TastyFood'
  | 'EventScript_TrashBin'
  | 'EventScript_Cup'
  | 'EventScript_PolishedWindow'
  | 'EventScript_BeautifulSkyWindow'
  | 'EventScript_BlinkingLights'
  | 'EventScript_NeatlyLinedUpTools'
  | 'CableClub_EventScript_ShowWirelessCommunicationScreen'
  | 'EventScript_Questionnaire'
  | 'CableClub_EventScript_ShowBattleRecords'
  | 'EventScript_Indigo_UltimateGoal'
  | 'EventScript_Indigo_HighestAuthority'
  | 'EventScript_PokemartSign'
  | 'EventScript_PokecenterSign'
  | 'EventScript_CurrentTooFast'
  | 'EventScript_UseSurf'
  | 'EventScript_Waterfall'
  | 'EventScript_CantUseWaterfall'
  | 'EventScript_VsSeekerChargingDone'
  | 'EventScript_FieldPoison'
  | 'EventScript_EggHatch'
  | 'EventScript_DoFallWarp'
  | string;

export interface FieldInput {
  pressedAButton: boolean;
  checkStandardWildEncounter: boolean;
  pressedStartButton: boolean;
  pressedSelectButton: boolean;
  heldDirection: boolean;
  heldDirection2: boolean;
  tookStep: boolean;
  pressedBButton: boolean;
  pressedRButton: boolean;
  input_field_1_0: boolean;
  input_field_1_1: boolean;
  input_field_1_2: boolean;
  input_field_1_3: boolean;
  dpadDirection: number;
}

export interface MapPosition {
  x: number;
  y: number;
  elevation: number;
}

export interface ObjectEvent {
  localId: number;
  currentCoords: { x: number; y: number };
  heldMovementActive?: boolean;
  script?: ScriptName | null;
}

export interface BgEvent {
  x: number;
  y: number;
  elevation: number;
  kind: number;
  script?: ScriptName | null;
  hiddenItem?: Partial<Record<typeof HIDDEN_ITEM_UNDERFOOT | typeof HIDDEN_ITEM_ITEM | typeof HIDDEN_ITEM_FLAG | typeof HIDDEN_ITEM_QUANTITY, number>>;
}

export interface CoordEvent {
  x: number;
  y: number;
  elevation: number;
  trigger: number;
  index: number;
  script?: ScriptName | null;
}

export interface WarpEvent {
  x: number;
  y: number;
  elevation: number;
  mapGroup: number;
  mapNum: number;
  warpId: number;
}

export interface FieldControlRuntime {
  gFieldInputRecord: FieldInput;
  playerAvatar: { runningState: number; tileTransitionState: number; flags: number };
  playerSpeed: number;
  playerPosition: MapPosition;
  playerFacingDirection: number;
  playerMovementDirection: number;
  mapType: number;
  mapGroup: number;
  mapNum: number;
  metatileBehaviors: Record<string, number>;
  metatileAttributes: Record<string, number>;
  elevations: Record<string, number>;
  objectEvents: ObjectEvent[];
  linkPlayerObjectEvents: Array<{ active: boolean; objEventId: number }>;
  bgEvents: BgEvent[];
  coordEvents: CoordEvent[];
  warpEvents: WarpEvent[];
  mapHeaders: Record<string, { warpEvents: WarpEvent[] }>;
  vars: Record<number, number>;
  flags: Set<number>;
  gSelectedObjectEvent: number;
  gSpecialVar_LastTalked: number;
  gSpecialVar_Facing: number;
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_0x8006: number;
  scriptContextEnabled: boolean;
  qlIsPlaybackState: boolean;
  questLogState: number;
  questLogInputDpad: boolean;
  registeredQuestLogInput: number;
  walkAwayFromSignInhibitTimer: number;
  canWalkAwayToCancelMsgBox: boolean;
  msgBoxWalkawayDisabled: boolean;
  playerControlsLocked: boolean;
  inUnionRoom: boolean;
  partyHasSurf: boolean;
  playerFacingSurfableFishableWater: boolean;
  playerSurfingNorth: boolean;
  standardWildEncounterResult: boolean;
  runOnFrameMapScriptResult: boolean;
  trainersWantBattle: boolean;
  vsSeekerStepCounterResult: boolean;
  poisonFieldEffectResult: number;
  shouldEggHatch: boolean;
  safariZoneTakeStepResult: boolean;
  updateRepelCounterResult: boolean;
  setDiveWarpEmergeResult: boolean;
  setDiveWarpDiveResult: boolean;
  boulderRevealFlagByLocalIdAndMap: Record<string, number>;
  activeTasks: Set<string>;
  operations: string[];
  setupScripts: ScriptName[];
  immediateScripts: ScriptName[];
  playedSE: number[];
  gameStats: Record<string, number>;
  dynamicWarps: Array<{ warpId: number; mapGroup: number; mapNum: number; sourceWarpId: number }>;
  warpDestination: { kind: string; mapGroup?: number; mapNum?: number; warpId?: number } | null;
}

export const createFieldInput = (): FieldInput => ({
  pressedAButton: false,
  checkStandardWildEncounter: false,
  pressedStartButton: false,
  pressedSelectButton: false,
  heldDirection: false,
  heldDirection2: false,
  tookStep: false,
  pressedBButton: false,
  pressedRButton: false,
  input_field_1_0: false,
  input_field_1_1: false,
  input_field_1_2: false,
  input_field_1_3: false,
  dpadDirection: 0
});

export const createFieldControlRuntime = (overrides: Partial<FieldControlRuntime> = {}): FieldControlRuntime => ({
  gFieldInputRecord: overrides.gFieldInputRecord ?? createFieldInput(),
  playerAvatar: overrides.playerAvatar ?? { runningState: 0, tileTransitionState: T_NOT_MOVING, flags: 0 },
  playerSpeed: overrides.playerSpeed ?? 0,
  playerPosition: overrides.playerPosition ?? { x: MAP_OFFSET, y: MAP_OFFSET, elevation: 0 },
  playerFacingDirection: overrides.playerFacingDirection ?? DIR_NORTH,
  playerMovementDirection: overrides.playerMovementDirection ?? DIR_NORTH,
  mapType: overrides.mapType ?? 0,
  mapGroup: overrides.mapGroup ?? 1,
  mapNum: overrides.mapNum ?? 1,
  metatileBehaviors: overrides.metatileBehaviors ?? {},
  metatileAttributes: overrides.metatileAttributes ?? {},
  elevations: overrides.elevations ?? {},
  objectEvents: overrides.objectEvents ?? [],
  linkPlayerObjectEvents: overrides.linkPlayerObjectEvents ?? [],
  bgEvents: overrides.bgEvents ?? [],
  coordEvents: overrides.coordEvents ?? [],
  warpEvents: overrides.warpEvents ?? [],
  mapHeaders: overrides.mapHeaders ?? {},
  vars: overrides.vars ?? {},
  flags: overrides.flags ?? new Set<number>(),
  gSelectedObjectEvent: overrides.gSelectedObjectEvent ?? 0,
  gSpecialVar_LastTalked: overrides.gSpecialVar_LastTalked ?? 0,
  gSpecialVar_Facing: overrides.gSpecialVar_Facing ?? 0,
  gSpecialVar_0x8004: overrides.gSpecialVar_0x8004 ?? 0,
  gSpecialVar_0x8005: overrides.gSpecialVar_0x8005 ?? 0,
  gSpecialVar_0x8006: overrides.gSpecialVar_0x8006 ?? 0,
  scriptContextEnabled: overrides.scriptContextEnabled ?? false,
  qlIsPlaybackState: overrides.qlIsPlaybackState ?? false,
  questLogState: overrides.questLogState ?? 0,
  questLogInputDpad: overrides.questLogInputDpad ?? false,
  registeredQuestLogInput: overrides.registeredQuestLogInput ?? QL_INPUT_OFF,
  walkAwayFromSignInhibitTimer: overrides.walkAwayFromSignInhibitTimer ?? 0,
  canWalkAwayToCancelMsgBox: overrides.canWalkAwayToCancelMsgBox ?? false,
  msgBoxWalkawayDisabled: overrides.msgBoxWalkawayDisabled ?? false,
  playerControlsLocked: overrides.playerControlsLocked ?? false,
  inUnionRoom: overrides.inUnionRoom ?? false,
  partyHasSurf: overrides.partyHasSurf ?? false,
  playerFacingSurfableFishableWater: overrides.playerFacingSurfableFishableWater ?? false,
  playerSurfingNorth: overrides.playerSurfingNorth ?? false,
  standardWildEncounterResult: overrides.standardWildEncounterResult ?? false,
  runOnFrameMapScriptResult: overrides.runOnFrameMapScriptResult ?? false,
  trainersWantBattle: overrides.trainersWantBattle ?? false,
  vsSeekerStepCounterResult: overrides.vsSeekerStepCounterResult ?? false,
  poisonFieldEffectResult: overrides.poisonFieldEffectResult ?? FLDPSN_NONE,
  shouldEggHatch: overrides.shouldEggHatch ?? false,
  safariZoneTakeStepResult: overrides.safariZoneTakeStepResult ?? false,
  updateRepelCounterResult: overrides.updateRepelCounterResult ?? false,
  setDiveWarpEmergeResult: overrides.setDiveWarpEmergeResult ?? false,
  setDiveWarpDiveResult: overrides.setDiveWarpDiveResult ?? false,
  boulderRevealFlagByLocalIdAndMap: overrides.boulderRevealFlagByLocalIdAndMap ?? {},
  activeTasks: overrides.activeTasks ?? new Set<string>(),
  operations: overrides.operations ?? [],
  setupScripts: overrides.setupScripts ?? [],
  immediateScripts: overrides.immediateScripts ?? [],
  playedSE: overrides.playedSE ?? [],
  gameStats: overrides.gameStats ?? {},
  dynamicWarps: overrides.dynamicWarps ?? [],
  warpDestination: overrides.warpDestination ?? null
});

export function FieldClearPlayerInput(input: FieldInput): void {
  Object.assign(input, createFieldInput());
}

export function FieldGetPlayerInput(runtime: FieldControlRuntime, input: FieldInput, newKeysIn: number, heldKeysIn: number): void {
  let newKeys = newKeysIn;
  let heldKeys = heldKeysIn;
  const runningState = runtime.playerAvatar.runningState;
  const tileTransitionState = runtime.playerAvatar.tileTransitionState;
  const forcedMove = MB.MetatileBehavior_IsForcedMovementTile(GetPlayerCurMetatileBehavior(runtime));

  if (!runtime.scriptContextEnabled && runtime.questLogInputDpad) {
    const override = QuestLogOverrideJoyVars(runtime, input, newKeys, heldKeys);
    newKeys = override.newKeys;
    heldKeys = override.heldKeys;
  }

  if ((tileTransitionState === T_TILE_CENTER && forcedMove === false) || tileTransitionState === T_NOT_MOVING) {
    if (runtime.playerSpeed !== PLAYER_SPEED_FASTEST) {
      if ((newKeys & START_BUTTON) !== 0 && (runtime.playerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED) === 0) input.pressedStartButton = true;
      if (!runtime.qlIsPlaybackState && (runtime.playerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED) === 0) {
        if ((newKeys & SELECT_BUTTON) !== 0) input.pressedSelectButton = true;
        if ((newKeys & A_BUTTON) !== 0) input.pressedAButton = true;
        if ((newKeys & B_BUTTON) !== 0) input.pressedBButton = true;
        if ((newKeys & R_BUTTON) !== 0) input.pressedRButton = true;
      }
    }
    if (!runtime.qlIsPlaybackState && (heldKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) !== 0) {
      input.heldDirection = true;
      input.heldDirection2 = true;
    }
  }

  if (forcedMove === false) {
    if (tileTransitionState === T_TILE_CENTER && runningState === MOVING) input.tookStep = true;
    if (tileTransitionState === T_TILE_CENTER) input.checkStandardWildEncounter = true;
  }

  if (!runtime.qlIsPlaybackState) {
    if ((heldKeys & DPAD_UP) !== 0) input.dpadDirection = DIR_NORTH;
    else if ((heldKeys & DPAD_DOWN) !== 0) input.dpadDirection = DIR_SOUTH;
    else if ((heldKeys & DPAD_LEFT) !== 0) input.dpadDirection = DIR_WEST;
    else if ((heldKeys & DPAD_RIGHT) !== 0) input.dpadDirection = DIR_EAST;
  }
}

export function ProcessPlayerFieldInput(runtime: FieldControlRuntime, input: FieldInput): number {
  let position = GetPlayerPosition(runtime);
  const playerDirection = runtime.playerFacingDirection;
  let metatileAttributes = MapGridGetMetatileAttributeAt(runtime, position.x, position.y);
  let metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, position.x, position.y);

  ResetFacingNpcOrSignpostVars(runtime);
  FieldClearPlayerInput(runtime.gFieldInputRecord);
  runtime.gFieldInputRecord.dpadDirection = input.dpadDirection;

  if (runtime.trainersWantBattle) return 1;
  if (runtime.runOnFrameMapScriptResult) return 1;

  if (input.tookStep) {
    IncrementGameStat(runtime, 'GAME_STAT_STEPS');
    ['WonderNews_IncrementStepCounter', 'IncrementRenewableHiddenItemStepCounter', 'RunMassageCooldownStepCounter', 'IncrementResortGorgeousStepCounter', 'IncrementBirthIslandRockStepCount'].forEach((op) => runtime.operations.push(op));
    if (TryStartStepBasedScript(runtime, position, metatileBehavior, playerDirection)) {
      runtime.gFieldInputRecord.tookStep = true;
      return 1;
    }
  }

  if (input.checkStandardWildEncounter) {
    if (input.dpadDirection === 0 || input.dpadDirection === playerDirection) {
      position = GetInFrontOfPlayerPosition(runtime);
      metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, position.x, position.y);
      if (TrySetUpWalkIntoSignpostScript(runtime, position, metatileBehavior, playerDirection)) {
        runtime.gFieldInputRecord.checkStandardWildEncounter = true;
        return 1;
      }
      position = GetPlayerPosition(runtime);
      metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, position.x, position.y);
    }
  }

  if (input.checkStandardWildEncounter && CheckStandardWildEncounter(runtime, metatileAttributes)) {
    runtime.gFieldInputRecord.checkStandardWildEncounter = true;
    return 1;
  }

  if (input.heldDirection && input.dpadDirection === playerDirection && TryArrowWarp(runtime, position, metatileBehavior, playerDirection)) {
    runtime.gFieldInputRecord.heldDirection = true;
    return 1;
  }

  position = GetInFrontOfPlayerPosition(runtime);
  metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, position.x, position.y);
  if (input.heldDirection && input.dpadDirection === playerDirection && TrySetUpWalkIntoSignpostScript(runtime, position, metatileBehavior, playerDirection)) {
    runtime.gFieldInputRecord.heldDirection = true;
    return 1;
  }

  if (input.pressedAButton && TryStartInteractionScript(runtime, position, metatileBehavior, playerDirection)) {
    runtime.gFieldInputRecord.pressedAButton = true;
    return 1;
  }

  if (input.heldDirection2 && input.dpadDirection === playerDirection && TryDoorWarp(runtime, position, metatileBehavior, playerDirection)) {
    runtime.gFieldInputRecord.heldDirection2 = true;
    return 1;
  }

  if (input.pressedStartButton) {
    runtime.gFieldInputRecord.pressedStartButton = true;
    FlagSet(runtime, 0x828);
    PlaySE(runtime, 5);
    ShowStartMenu(runtime);
    return 1;
  }

  if (input.pressedSelectButton && UseRegisteredKeyItemOnField(runtime)) {
    runtime.gFieldInputRecord.pressedSelectButton = true;
    return 1;
  }

  void metatileAttributes;
  return 0;
}

export function FieldInput_HandleCancelSignpost(runtime: FieldControlRuntime, input: FieldInput): void {
  if (runtime.scriptContextEnabled === true) {
    if (runtime.walkAwayFromSignInhibitTimer !== 0) runtime.walkAwayFromSignInhibitTimer -= 1;
    else if (runtime.canWalkAwayToCancelMsgBox === true) {
      if (input.dpadDirection !== 0 && runtime.playerFacingDirection !== input.dpadDirection) {
        if (runtime.msgBoxWalkawayDisabled === true) return;
        if (input.dpadDirection === DIR_NORTH) RegisterQuestLogInput(runtime, QL_INPUT_UP);
        else if (input.dpadDirection === DIR_SOUTH) RegisterQuestLogInput(runtime, QL_INPUT_DOWN);
        else if (input.dpadDirection === DIR_WEST) RegisterQuestLogInput(runtime, QL_INPUT_LEFT);
        else if (input.dpadDirection === DIR_EAST) RegisterQuestLogInput(runtime, QL_INPUT_RIGHT);
        ScriptContext_SetupScript(runtime, 'EventScript_CancelMessageBox');
        LockPlayerFieldControls(runtime);
      } else if (input.pressedStartButton) {
        ScriptContext_SetupScript(runtime, 'EventScript_CancelMessageBox');
        LockPlayerFieldControls(runtime);
        if (!runtime.activeTasks.has('Task_QuestLogPlayback_OpenStartMenu')) runtime.activeTasks.add('Task_QuestLogPlayback_OpenStartMenu');
      }
    }
  }
}

export function Task_QuestLogPlayback_OpenStartMenu(runtime: FieldControlRuntime): void {
  if (!runtime.playerControlsLocked) {
    PlaySE(runtime, 5);
    ShowStartMenu(runtime);
    runtime.activeTasks.delete('Task_QuestLogPlayback_OpenStartMenu');
  }
}

export function GetInteractedLinkPlayerScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): ScriptName | null {
  let objectEventId: number;
  if (!MB.MetatileBehavior_IsCounter(metatileBehavior)) {
    objectEventId = GetObjectEventIdByPosition(runtime, position.x, position.y, position.elevation);
  } else {
    const vector = gDirectionToVectors(direction);
    objectEventId = GetObjectEventIdByPosition(runtime, position.x + vector.x, position.y + vector.y, position.elevation);
  }
  if (objectEventId === OBJECT_EVENTS_COUNT || runtime.objectEvents[objectEventId]?.localId === LOCALID_PLAYER) return null;
  for (let i = 0; i < 4; i += 1) {
    const link = runtime.linkPlayerObjectEvents[i];
    if (link?.active === true && link.objEventId === objectEventId) return null;
  }
  runtime.gSelectedObjectEvent = objectEventId;
  runtime.gSpecialVar_LastTalked = runtime.objectEvents[objectEventId].localId;
  runtime.gSpecialVar_Facing = direction;
  return runtime.objectEvents[objectEventId].script ?? null;
}

export function ClearPoisonStepCounter(runtime: FieldControlRuntime): void {
  VarSet(runtime, 0x4040, 0);
}

export function RestartWildEncounterImmunitySteps(runtime: FieldControlRuntime): void {
  runtime.operations.push('ResetEncounterRateModifiers');
}

export function IsDirectionalStairWarpMetatileBehavior(metatileBehavior: number, playerDirection: number): boolean {
  switch (playerDirection) {
    case DIR_WEST:
      if (MB.MetatileBehavior_IsDirectionalUpLeftStairWarp(metatileBehavior)) return true;
      if (MB.MetatileBehavior_IsDirectionalDownLeftStairWarp(metatileBehavior)) return true;
      break;
    case DIR_EAST:
      if (MB.MetatileBehavior_IsDirectionalUpRightStairWarp(metatileBehavior)) return true;
      if (MB.MetatileBehavior_IsDirectionalDownRightStairWarp(metatileBehavior)) return true;
      break;
  }
  return false;
}

export function GetCoordEventScriptAtMapPosition(runtime: FieldControlRuntime, position: MapPosition): ScriptName | null {
  return GetCoordEventScriptAtPosition(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
}

export function HandleBoulderFallThroughHole(runtime: FieldControlRuntime, object: ObjectEvent): void {
  if (MapGridGetMetatileBehaviorAt(runtime, object.currentCoords.x, object.currentCoords.y) === MB.MB_FALL_WARP) {
    PlaySE(runtime, 207);
    runtime.operations.push(`RemoveObjectEventByLocalIdAndMap:${object.localId}:${runtime.mapNum}:${runtime.mapGroup}`);
    FlagClear(runtime, runtime.boulderRevealFlagByLocalIdAndMap[`${object.localId},${runtime.mapNum},${runtime.mapGroup}`] ?? 0);
  }
}

export function HandleBoulderActivateVictoryRoadSwitch(runtime: FieldControlRuntime, x: number, y: number): void {
  if (MapGridGetMetatileBehaviorAt(runtime, x, y) === MB.MB_STRENGTH_BUTTON) {
    for (let i = 0; i < runtime.coordEvents.length; i += 1) {
      const event = runtime.coordEvents[i];
      if (event.x + MAP_OFFSET === x && event.y + MAP_OFFSET === y) {
        runtime.operations.push('QuestLog_CutRecording');
        if (event.script) ScriptContext_SetupScript(runtime, event.script);
        LockPlayerFieldControls(runtime);
      }
    }
  }
}

export function dive_warp(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number): boolean {
  if (runtime.mapType === MAP_TYPE_UNDERWATER && !MB.MetatileBehavior_IsUnableToEmerge(metatileBehavior)) {
    if (SetDiveWarpEmerge(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET)) {
      StoreInitialPlayerAvatarState(runtime);
      runtime.operations.push('DoDiveWarp');
      PlaySE(runtime, 291);
      return true;
    }
  } else if (MB.MetatileBehavior_IsDiveable(metatileBehavior) === true) {
    if (SetDiveWarpDive(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET)) {
      StoreInitialPlayerAvatarState(runtime);
      runtime.operations.push('DoDiveWarp');
      PlaySE(runtime, 291);
      return true;
    }
  }
  return false;
}

export function TrySetDiveWarp(runtime: FieldControlRuntime): number {
  const { x, y } = runtime.playerPosition;
  const metatileBehavior = MapGridGetMetatileBehaviorAt(runtime, x, y);
  if (runtime.mapType === MAP_TYPE_UNDERWATER && !MB.MetatileBehavior_IsUnableToEmerge(metatileBehavior)) {
    if (SetDiveWarpEmerge(runtime, x - MAP_OFFSET, y - MAP_OFFSET) === true) return 1;
  } else if (MB.MetatileBehavior_IsDiveable(metatileBehavior) === true) {
    if (SetDiveWarpDive(runtime, x - MAP_OFFSET, y - MAP_OFFSET) === true) return 2;
  }
  return 0;
}

export function GetObjectEventScriptPointerPlayerFacing(runtime: FieldControlRuntime): ScriptName | null {
  const direction = runtime.playerMovementDirection;
  const position = GetInFrontOfPlayerPosition(runtime);
  return GetInteractedObjectEventScript(runtime, position, MapGridGetMetatileBehaviorAt(runtime, position.x, position.y), direction);
}

export function SetCableClubWarp(runtime: FieldControlRuntime): number {
  const position = GetPlayerPosition(runtime);
  SetupWarp(runtime, GetWarpEventAtMapPosition(runtime, position), position);
  return 0;
}

export function QuestLogOverrideJoyVars(runtime: FieldControlRuntime, _input: FieldInput, newKeys: number, heldKeys: number): { newKeys: number; heldKeys: number } {
  switch (runtime.registeredQuestLogInput) {
    case QL_INPUT_UP: heldKeys = newKeys = DPAD_UP; break;
    case QL_INPUT_DOWN: heldKeys = newKeys = DPAD_DOWN; break;
    case QL_INPUT_LEFT: heldKeys = newKeys = DPAD_LEFT; break;
    case QL_INPUT_RIGHT: heldKeys = newKeys = DPAD_RIGHT; break;
    case QL_INPUT_L: heldKeys = newKeys = L_BUTTON; break;
    case QL_INPUT_R: heldKeys = newKeys = R_BUTTON; break;
    case QL_INPUT_START: heldKeys = newKeys = START_BUTTON; break;
    case QL_INPUT_SELECT: heldKeys = newKeys = SELECT_BUTTON; break;
  }
  runtime.questLogInputDpad = false;
  runtime.registeredQuestLogInput = QL_INPUT_OFF;
  return { newKeys, heldKeys };
}

export function GetPlayerPosition(runtime: FieldControlRuntime): MapPosition {
  return { ...runtime.playerPosition };
}

export function GetInFrontOfPlayerPosition(runtime: FieldControlRuntime): MapPosition {
  const vector = gDirectionToVectors(runtime.playerFacingDirection);
  const x = runtime.playerPosition.x + vector.x;
  const y = runtime.playerPosition.y + vector.y;
  const elevation = MapGridGetElevationAt(runtime, runtime.playerPosition.x, runtime.playerPosition.y) !== 0 ? runtime.playerPosition.elevation : 0;
  return { x, y, elevation };
}

export function GetPlayerCurMetatileBehavior(runtime: FieldControlRuntime): number {
  return MapGridGetMetatileBehaviorAt(runtime, runtime.playerPosition.x, runtime.playerPosition.y);
}

export function TryStartInteractionScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): boolean {
  const script = GetInteractionScript(runtime, position, metatileBehavior, direction);
  if (script === null) return false;
  if (script !== 'PalletTown_PlayersHouse_2F_EventScript_PC' && script !== 'EventScript_PC') PlaySE(runtime, 1);
  ScriptContext_SetupScript(runtime, script);
  return true;
}

export function GetInteractionScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): ScriptName | null {
  return GetInteractedObjectEventScript(runtime, position, metatileBehavior, direction)
    ?? GetInteractedBackgroundEventScript(runtime, position, metatileBehavior, direction)
    ?? GetInteractedMetatileScript(runtime, position, metatileBehavior, direction)
    ?? GetInteractedWaterScript(runtime, position, metatileBehavior, direction);
}

export function GetInteractedObjectEventScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): ScriptName | null {
  let objectEventId = GetObjectEventIdByPosition(runtime, position.x, position.y, position.elevation);
  if (objectEventId === OBJECT_EVENTS_COUNT || runtime.objectEvents[objectEventId]?.localId === LOCALID_PLAYER) {
    if (MB.MetatileBehavior_IsCounter(metatileBehavior) !== true) return null;
    const vector = gDirectionToVectors(direction);
    objectEventId = GetObjectEventIdByPosition(runtime, position.x + vector.x, position.y + vector.y, position.elevation);
    if (objectEventId === OBJECT_EVENTS_COUNT || runtime.objectEvents[objectEventId]?.localId === LOCALID_PLAYER) return null;
  }
  if (runtime.inUnionRoom === true && runtime.objectEvents[objectEventId].heldMovementActive !== true) return null;
  runtime.gSelectedObjectEvent = objectEventId;
  runtime.gSpecialVar_LastTalked = runtime.objectEvents[objectEventId].localId;
  runtime.gSpecialVar_Facing = direction;
  return runtime.objectEvents[objectEventId].script ?? null;
}

export function GetInteractedBackgroundEventScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): ScriptName | null {
  const bgEvent = GetBackgroundEventAtPosition(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
  if (bgEvent === null) return null;
  if (!bgEvent.script && !bgEvent.hiddenItem) return 'EventScript_TestSignpostMsg';
  const signpostType = GetFacingSignpostType(metatileBehavior, direction);
  switch (bgEvent.kind) {
    case 1: if (direction !== DIR_NORTH) return null; break;
    case 2: if (direction !== DIR_SOUTH) return null; break;
    case 3: if (direction !== DIR_EAST) return null; break;
    case 4: if (direction !== DIR_WEST) return null; break;
    case 5:
    case 6:
    case 7:
      if ((bgEvent.hiddenItem?.underfoot ?? 0) === 1) return null;
      runtime.gSpecialVar_0x8005 = bgEvent.hiddenItem?.item ?? 0;
      runtime.gSpecialVar_0x8004 = bgEvent.hiddenItem?.flag ?? 0;
      runtime.gSpecialVar_0x8006 = bgEvent.hiddenItem?.quantity ?? 0;
      if (FlagGet(runtime, runtime.gSpecialVar_0x8004)) return null;
      runtime.gSpecialVar_Facing = direction;
      return 'EventScript_HiddenItemScript';
  }
  if (signpostType !== SIGNPOST_NA) MsgSetSignpost(runtime);
  runtime.gSpecialVar_Facing = direction;
  return bgEvent.script ?? null;
}

export function GetInteractedMetatileScript(runtime: FieldControlRuntime, _position: MapPosition, b: number, direction: number): ScriptName | null {
  runtime.gSpecialVar_Facing = direction;
  if (MB.MetatileBehavior_IsPC(b)) return 'EventScript_PC';
  if (MB.MetatileBehavior_IsRegionMap(b)) return 'EventScript_WallTownMap';
  if (MB.MetatileBehavior_IsBookshelf(b)) return 'EventScript_Bookshelf';
  if (MB.MetatileBehavior_IsPokeMartShelf(b)) return 'EventScript_PokeMartShelf';
  if (MB.MetatileBehavior_IsFood(b)) return 'EventScript_Food';
  if (MB.MetatileBehavior_IsImpressiveMachine(b)) return 'EventScript_ImpressiveMachine';
  if (MB.MetatileBehavior_IsBlueprints(b)) return 'EventScript_Blueprints';
  if (MB.MetatileBehavior_IsVideoGame(b)) return 'EventScript_VideoGame';
  if (MB.MetatileBehavior_IsBurglary(b)) return 'EventScript_Burglary';
  if (MB.MetatileBehavior_IsComputer(b)) return 'EventScript_Computer';
  if (MB.MetatileBehavior_IsTrainerTowerMonitor(b)) return 'TrainerTower_EventScript_ShowTime';
  if (MB.MetatileBehavior_IsPlayerFacingTVScreen(b, direction)) return 'EventScript_PlayerFacingTVScreen';
  if (MB.MetatileBehavior_IsCabinet(b)) return 'EventScript_Cabinet';
  if (MB.MetatileBehavior_IsKitchen(b)) return 'EventScript_Kitchen';
  if (MB.MetatileBehavior_IsDresser(b)) return 'EventScript_Dresser';
  if (MB.MetatileBehavior_IsSnacks(b)) return 'EventScript_Snacks';
  if (MB.MetatileBehavior_IsPainting(b)) return 'EventScript_Painting';
  if (MB.MetatileBehavior_IsPowerPlantMachine(b)) return 'EventScript_PowerPlantMachine';
  if (MB.MetatileBehavior_IsTelephone(b)) return 'EventScript_Telephone';
  if (MB.MetatileBehavior_IsAdvertisingPoster(b)) return 'EventScript_AdvertisingPoster';
  if (MB.MetatileBehavior_IsTastyFood(b)) return 'EventScript_TastyFood';
  if (MB.MetatileBehavior_IsTrashBin(b)) return 'EventScript_TrashBin';
  if (MB.MetatileBehavior_IsCup(b)) return 'EventScript_Cup';
  if (MB.MetatileBehavior_IsPolishedWindow(b)) return 'EventScript_PolishedWindow';
  if (MB.MetatileBehavior_IsBeautifulSkyWindow(b)) return 'EventScript_BeautifulSkyWindow';
  if (MB.MetatileBehavior_IsBlinkingLights(b)) return 'EventScript_BlinkingLights';
  if (MB.MetatileBehavior_IsNeatlyLinedUpTools(b)) return 'EventScript_NeatlyLinedUpTools';
  if (MB.MetatileBehavior_IsPlayerFacingCableClubWirelessMonitor(b, direction)) return 'CableClub_EventScript_ShowWirelessCommunicationScreen';
  if (MB.MetatileBehavior_IsQuestionnaire(b)) return 'EventScript_Questionnaire';
  if (MB.MetatileBehavior_IsPlayerFacingBattleRecords(b, direction)) return 'CableClub_EventScript_ShowBattleRecords';
  if (MB.MetatileBehavior_IsIndigoPlateauSign1(b)) { MsgSetSignpost(runtime); return 'EventScript_Indigo_UltimateGoal'; }
  if (MB.MetatileBehavior_IsIndigoPlateauSign2(b)) { MsgSetSignpost(runtime); return 'EventScript_Indigo_HighestAuthority'; }
  if (MB.MetatileBehavior_IsPlayerFacingPokeMartSign(b, direction)) { MsgSetSignpost(runtime); return 'EventScript_PokemartSign'; }
  if (MB.MetatileBehavior_IsPlayerFacingPokemonCenterSign(b, direction)) { MsgSetSignpost(runtime); return 'EventScript_PokecenterSign'; }
  return null;
}

export function GetInteractedWaterScript(runtime: FieldControlRuntime, _unused1: MapPosition, metatileBehavior: number, _direction: number): ScriptName | null {
  if (MB.MetatileBehavior_IsFastWater(metatileBehavior) && runtime.partyHasSurf) return 'EventScript_CurrentTooFast';
  if (FlagGet(runtime, 0x820) && runtime.partyHasSurf && runtime.playerFacingSurfableFishableWater) return 'EventScript_UseSurf';
  if (MB.MetatileBehavior_IsWaterfall(metatileBehavior)) return FlagGet(runtime, 0x822) && runtime.playerSurfingNorth ? 'EventScript_Waterfall' : 'EventScript_CantUseWaterfall';
  return null;
}

export function TryStartStepBasedScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): boolean {
  if (TryStartCoordEventScript(runtime, position)) return true;
  if (TryStartWarpEventScript(runtime, position, metatileBehavior)) return true;
  if (TryStartMiscWalkingScripts()) return true;
  if (TryStartStepCountScript(runtime, metatileBehavior)) return true;
  if ((runtime.playerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED) === 0 && !MB.MetatileBehavior_IsForcedMovementTile(metatileBehavior) && runtime.updateRepelCounterResult) return true;
  void direction;
  return false;
}

export function TryStartCoordEventScript(runtime: FieldControlRuntime, position: MapPosition): boolean {
  const script = GetCoordEventScriptAtPosition(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
  if (script === null) return false;
  ScriptContext_SetupScript(runtime, script);
  return true;
}

export function TryStartMiscWalkingScripts(): boolean {
  return false;
}

export function TryStartStepCountScript(runtime: FieldControlRuntime, metatileBehavior: number): boolean {
  if (runtime.inUnionRoom || runtime.questLogState === QL_STATE_PLAYBACK) return false;
  UpdateHappinessStepCounter(runtime);
  if ((runtime.playerAvatar.flags & PLAYER_AVATAR_FLAG_FORCED) === 0 && !MB.MetatileBehavior_IsForcedMovementTile(metatileBehavior)) {
    if (runtime.vsSeekerStepCounterResult) { ScriptContext_SetupScript(runtime, 'EventScript_VsSeekerChargingDone'); return true; }
    if (UpdatePoisonStepCounter(runtime)) { ScriptContext_SetupScript(runtime, 'EventScript_FieldPoison'); return true; }
    if (runtime.shouldEggHatch) { IncrementGameStat(runtime, 'GAME_STAT_HATCHED_EGGS'); ScriptContext_SetupScript(runtime, 'EventScript_EggHatch'); return true; }
  }
  return runtime.safariZoneTakeStepResult;
}

export function Unref_ClearHappinessStepCounter(runtime: FieldControlRuntime): void {
  VarSet(runtime, 0x403f, 0);
}

export function UpdateHappinessStepCounter(runtime: FieldControlRuntime): void {
  const value = ((runtime.vars[0x403f] ?? 0) + 1) % 128;
  runtime.vars[0x403f] = value;
  if (value === 0) runtime.operations.push('AdjustFriendship:PARTY:FRIENDSHIP_EVENT_WALKING');
}

export function UpdatePoisonStepCounter(runtime: FieldControlRuntime): boolean {
  if (runtime.mapType !== MAP_TYPE_SECRET_BASE) {
    const value = ((runtime.vars[0x4040] ?? 0) + 1) % 5;
    runtime.vars[0x4040] = value;
    if (value === 0) return runtime.poisonFieldEffectResult === FLDPSN_FNT;
  }
  return false;
}

export function CheckStandardWildEncounter(runtime: FieldControlRuntime, metatileAttributes: number): boolean {
  runtime.operations.push(`TryStandardWildEncounter:${metatileAttributes}`);
  return runtime.standardWildEncounterResult;
}

export function TrySetUpWalkIntoSignpostScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, playerDirection: number): boolean {
  if ((runtime.gFieldInputRecord.dpadDirection === DIR_WEST || runtime.gFieldInputRecord.dpadDirection === DIR_EAST) || playerDirection === DIR_EAST || playerDirection === DIR_WEST) return false;
  const signpostType = GetFacingSignpostType(metatileBehavior, playerDirection);
  if (signpostType === SIGNPOST_POKECENTER) { SetUpWalkIntoSignScript(runtime, 'EventScript_PokecenterSign', playerDirection); return true; }
  if (signpostType === SIGNPOST_POKEMART) { SetUpWalkIntoSignScript(runtime, 'EventScript_PokemartSign', playerDirection); return true; }
  if (signpostType === SIGNPOST_INDIGO_1) { SetUpWalkIntoSignScript(runtime, 'EventScript_Indigo_UltimateGoal', playerDirection); return true; }
  if (signpostType === SIGNPOST_INDIGO_2) { SetUpWalkIntoSignScript(runtime, 'EventScript_Indigo_HighestAuthority', playerDirection); return true; }
  const script = GetSignpostScriptAtMapPosition(runtime, position);
  if (script === null || signpostType !== SIGNPOST_SCRIPTED) return false;
  SetUpWalkIntoSignScript(runtime, script, playerDirection);
  return true;
}

export function GetFacingSignpostType(metatileBehavior: number, playerDirection: number): number {
  if (MB.MetatileBehavior_IsPlayerFacingPokemonCenterSign(metatileBehavior, playerDirection)) return SIGNPOST_POKECENTER;
  if (MB.MetatileBehavior_IsPlayerFacingPokeMartSign(metatileBehavior, playerDirection)) return SIGNPOST_POKEMART;
  if (MB.MetatileBehavior_IsIndigoPlateauSign1(metatileBehavior)) return SIGNPOST_INDIGO_1;
  if (MB.MetatileBehavior_IsIndigoPlateauSign2(metatileBehavior)) return SIGNPOST_INDIGO_2;
  if (MB.MetatileBehavior_IsSignpost(metatileBehavior)) return SIGNPOST_SCRIPTED;
  return SIGNPOST_NA;
}

export function SetUpWalkIntoSignScript(runtime: FieldControlRuntime, script: ScriptName, playerDirection: number): void {
  runtime.gSpecialVar_Facing = playerDirection;
  ScriptContext_SetupScript(runtime, script);
  SetWalkingIntoSignVars(runtime);
  MsgSetSignpost(runtime);
}

export function GetSignpostScriptAtMapPosition(runtime: FieldControlRuntime, position: MapPosition): ScriptName | null {
  const event = GetBackgroundEventAtPosition(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
  if (event === null) return null;
  return event.script ?? 'EventScript_TestSignpostMsg';
}

export function TryArrowWarp(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): boolean {
  const warpEventId = GetWarpEventAtMapPosition(runtime, position);
  if (warpEventId !== -1) {
    if (IsArrowWarpMetatileBehavior(metatileBehavior, direction)) {
      StoreInitialPlayerAvatarState(runtime);
      SetupWarp(runtime, warpEventId, position);
      runtime.operations.push('DoWarp');
      return true;
    }
    if (IsDirectionalStairWarpMetatileBehavior(metatileBehavior, direction)) {
      let delay = 0;
      if ((runtime.playerAvatar.flags & (PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE)) !== 0) {
        runtime.playerAvatar.flags = PLAYER_AVATAR_FLAG_ON_FOOT;
        delay = 12;
      }
      StoreInitialPlayerAvatarState(runtime);
      SetupWarp(runtime, warpEventId, position);
      runtime.operations.push(`DoStairWarp:${metatileBehavior}:${delay}`);
      return true;
    }
  }
  return false;
}

export function TryStartWarpEventScript(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number): boolean {
  const warpEventId = GetWarpEventAtMapPosition(runtime, position);
  if (warpEventId !== -1 && IsWarpMetatileBehavior(metatileBehavior)) {
    StoreInitialPlayerAvatarState(runtime);
    SetupWarp(runtime, warpEventId, position);
    if (MB.MetatileBehavior_IsEscalator(metatileBehavior)) { runtime.operations.push(`DoEscalatorWarp:${metatileBehavior}`); return true; }
    if (MB.MetatileBehavior_IsLavaridgeB1FWarp(metatileBehavior)) { runtime.operations.push('DoLavaridgeGymB1FWarp'); return true; }
    if (MB.MetatileBehavior_IsLavaridge1FWarp(metatileBehavior)) { runtime.operations.push('DoLavaridgeGym1FWarp'); return true; }
    if (MB.MetatileBehavior_IsWarpPad(metatileBehavior)) { runtime.operations.push('DoTeleportWarp'); return true; }
    if (MB.MetatileBehavior_IsUnionRoomWarp(metatileBehavior)) { runtime.operations.push('DoUnionRoomWarp'); return true; }
    if (MB.MetatileBehavior_IsFallWarp(metatileBehavior)) { runtime.operations.push('ResetInitialPlayerAvatarState'); ScriptContext_SetupScript(runtime, 'EventScript_DoFallWarp'); return true; }
    runtime.operations.push('DoWarp');
    return true;
  }
  return false;
}

export function IsWarpMetatileBehavior(metatileBehavior: number): boolean {
  return MB.MetatileBehavior_IsWarpDoor(metatileBehavior)
    || MB.MetatileBehavior_IsLadder(metatileBehavior)
    || MB.MetatileBehavior_IsEscalator(metatileBehavior)
    || MB.MetatileBehavior_IsNonAnimDoor(metatileBehavior)
    || MB.MetatileBehavior_IsLavaridgeB1FWarp(metatileBehavior)
    || MB.MetatileBehavior_IsLavaridge1FWarp(metatileBehavior)
    || MB.MetatileBehavior_IsWarpPad(metatileBehavior)
    || MB.MetatileBehavior_IsFallWarp(metatileBehavior)
    || MB.MetatileBehavior_IsUnionRoomWarp(metatileBehavior);
}

export function IsArrowWarpMetatileBehavior(metatileBehavior: number, direction: number): boolean {
  switch (direction) {
    case DIR_NORTH: return MB.MetatileBehavior_IsNorthArrowWarp(metatileBehavior);
    case DIR_SOUTH: return MB.MetatileBehavior_IsSouthArrowWarp(metatileBehavior);
    case DIR_WEST: return MB.MetatileBehavior_IsWestArrowWarp(metatileBehavior);
    case DIR_EAST: return MB.MetatileBehavior_IsEastArrowWarp(metatileBehavior);
  }
  return false;
}

export function GetWarpEventAtMapPosition(runtime: FieldControlRuntime, position: MapPosition): number {
  return GetWarpEventAtPosition(runtime, position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
}

export function SetupWarp(runtime: FieldControlRuntime, warpEventId: number, position: MapPosition): void {
  const warpEvent = runtime.warpEvents[warpEventId];
  if (!warpEvent) return;
  if (warpEvent.mapNum === MAP_DYNAMIC) runtime.warpDestination = { kind: 'dynamic', warpId: warpEvent.warpId };
  else {
    runtime.warpDestination = { kind: 'map', mapGroup: warpEvent.mapGroup, mapNum: warpEvent.mapNum, warpId: warpEvent.warpId };
    runtime.operations.push(`UpdateEscapeWarp:${position.x}:${position.y}`);
    const target = runtime.mapHeaders[`${warpEvent.mapGroup},${warpEvent.mapNum}`]?.warpEvents[warpEvent.warpId];
    if (target?.mapNum === MAP_DYNAMIC) runtime.dynamicWarps.push({ warpId: target.warpId, mapGroup: runtime.mapGroup, mapNum: runtime.mapNum, sourceWarpId: warpEventId });
  }
}

export function TryDoorWarp(runtime: FieldControlRuntime, position: MapPosition, metatileBehavior: number, direction: number): boolean {
  if (direction === DIR_NORTH && MB.MetatileBehavior_IsWarpDoor(metatileBehavior)) {
    const warpEventId = GetWarpEventAtMapPosition(runtime, position);
    if (warpEventId !== -1 && IsWarpMetatileBehavior(metatileBehavior)) {
      StoreInitialPlayerAvatarState(runtime);
      SetupWarp(runtime, warpEventId, position);
      runtime.operations.push('DoDoorWarp');
      return true;
    }
  }
  return false;
}

export function GetWarpEventAtPosition(runtime: FieldControlRuntime, x: number, y: number, elevation: number): number {
  for (let i = 0; i < runtime.warpEvents.length; i += 1) {
    const warp = runtime.warpEvents[i];
    if ((warp.x & 0xffff) === x && (warp.y & 0xffff) === y && (warp.elevation === elevation || warp.elevation === 0)) return i;
  }
  return -1;
}

export function TryRunCoordEventScript(runtime: FieldControlRuntime, coordEvent: CoordEvent | null): ScriptName | null {
  if (coordEvent !== null) {
    if (!coordEvent.script) { runtime.operations.push(`DoCoordEventWeather:${coordEvent.trigger}`); return null; }
    if (coordEvent.trigger === 0) { RunScriptImmediately(runtime, coordEvent.script); return null; }
    if ((runtime.vars[coordEvent.trigger] ?? 0) === (coordEvent.index & 0xff)) return coordEvent.script;
  }
  return null;
}

export function GetCoordEventScriptAtPosition(runtime: FieldControlRuntime, x: number, y: number, elevation: number): ScriptName | null {
  for (const event of runtime.coordEvents) {
    if ((event.x & 0xffff) === x && (event.y & 0xffff) === y && (event.elevation === elevation || event.elevation === 0)) {
      const script = TryRunCoordEventScript(runtime, event);
      if (script !== null) return script;
    }
  }
  return null;
}

export function GetBackgroundEventAtPosition(runtime: FieldControlRuntime, x: number, y: number, elevation: number): BgEvent | null {
  for (const event of runtime.bgEvents) {
    if ((event.x & 0xffff) === x && (event.y & 0xffff) === y && (event.elevation === elevation || event.elevation === 0)) return event;
  }
  return null;
}

const tileKey = (x: number, y: number): string => `${x},${y}`;
const MapGridGetMetatileBehaviorAt = (runtime: FieldControlRuntime, x: number, y: number): number => runtime.metatileBehaviors[tileKey(x, y)] ?? 0;
const MapGridGetMetatileAttributeAt = (runtime: FieldControlRuntime, x: number, y: number): number => runtime.metatileAttributes[tileKey(x, y)] ?? 0;
const MapGridGetElevationAt = (runtime: FieldControlRuntime, x: number, y: number): number => runtime.elevations[tileKey(x, y)] ?? runtime.playerPosition.elevation;
const GetObjectEventIdByPosition = (runtime: FieldControlRuntime, x: number, y: number, elevation: number): number => {
  const idx = runtime.objectEvents.findIndex((event) => event.currentCoords.x === x && event.currentCoords.y === y && (elevation === 0 || event.currentCoords));
  return idx < 0 ? OBJECT_EVENTS_COUNT : idx;
};
const gDirectionToVectors = (direction: number): { x: number; y: number } =>
  direction === DIR_NORTH ? { x: 0, y: -1 }
    : direction === DIR_SOUTH ? { x: 0, y: 1 }
      : direction === DIR_WEST ? { x: -1, y: 0 }
        : direction === DIR_EAST ? { x: 1, y: 0 }
          : { x: 0, y: 0 };

const ResetFacingNpcOrSignpostVars = (runtime: FieldControlRuntime): void => { runtime.operations.push('ResetFacingNpcOrSignpostVars'); };
const ScriptContext_SetupScript = (runtime: FieldControlRuntime, script: ScriptName): void => { runtime.setupScripts.push(script); };
const RunScriptImmediately = (runtime: FieldControlRuntime, script: ScriptName): void => { runtime.immediateScripts.push(script); };
const PlaySE = (runtime: FieldControlRuntime, se: number): void => { runtime.playedSE.push(se); };
const MsgSetSignpost = (runtime: FieldControlRuntime): void => { runtime.operations.push('MsgSetSignpost'); };
const SetWalkingIntoSignVars = (runtime: FieldControlRuntime): void => { runtime.operations.push('SetWalkingIntoSignVars'); };
const FlagSet = (runtime: FieldControlRuntime, flag: number): void => { runtime.flags.add(flag); };
const FlagClear = (runtime: FieldControlRuntime, flag: number): void => { runtime.flags.delete(flag); };
const FlagGet = (runtime: FieldControlRuntime, flag: number): boolean => runtime.flags.has(flag);
const VarSet = (runtime: FieldControlRuntime, variable: number, value: number): void => { runtime.vars[variable] = value & 0xffff; };
const RegisterQuestLogInput = (runtime: FieldControlRuntime, input: number): void => { runtime.registeredQuestLogInput = input; };
const LockPlayerFieldControls = (runtime: FieldControlRuntime): void => { runtime.playerControlsLocked = true; runtime.operations.push('LockPlayerFieldControls'); };
const ShowStartMenu = (runtime: FieldControlRuntime): void => { runtime.operations.push('ShowStartMenu'); };
const UseRegisteredKeyItemOnField = (runtime: FieldControlRuntime): boolean => { runtime.operations.push('UseRegisteredKeyItemOnField'); return false; };
const IncrementGameStat = (runtime: FieldControlRuntime, stat: string): void => { runtime.gameStats[stat] = (runtime.gameStats[stat] ?? 0) + 1; };
const StoreInitialPlayerAvatarState = (runtime: FieldControlRuntime): void => { runtime.operations.push('StoreInitialPlayerAvatarState'); };
const SetDiveWarpEmerge = (runtime: FieldControlRuntime, x: number, y: number): boolean => { runtime.operations.push(`SetDiveWarpEmerge:${x}:${y}`); return runtime.setDiveWarpEmergeResult; };
const SetDiveWarpDive = (runtime: FieldControlRuntime, x: number, y: number): boolean => { runtime.operations.push(`SetDiveWarpDive:${x}:${y}`); return runtime.setDiveWarpDiveResult; };
