import vsSeekerSourceRaw from '../../../src/vs_seeker.c?raw';
import opponentsSource from '../../../include/constants/opponents.h?raw';
import movementSource from '../../../include/constants/event_object_movement.h?raw';
import eventObjectsSource from '../../../include/constants/event_objects.h?raw';
import trainerTypesSource from '../../../include/constants/trainer_types.h?raw';

export const MAX_REMATCH_PARTIES = 6;
export const SKIP = 0xffff;
export const TRAINER_NONE = defineNumber(opponentsSource, 'TRAINER_NONE');
export const OBJECT_EVENTS_COUNT = 16;
export const LOCALID_PLAYER = defineNumber(eventObjectsSource, 'LOCALID_PLAYER');
export const NO_REMATCH_LOCALID = LOCALID_PLAYER;
export const VSSEEKER_NOT_CHARGED = 0;
export const VSSEEKER_NO_ONE_IN_RANGE = 1;
export const VSSEEKER_CAN_USE = 2;
export const VSSEEKER_SINGLE_RESP_RAND = 0;
export const VSSEEKER_SINGLE_RESP_NO = 1;
export const VSSEEKER_SINGLE_RESP_YES = 2;
export const VSSEEKER_RESPONSE_NO_RESPONSE = 0;
export const VSSEEKER_RESPONSE_UNFOUGHT_TRAINERS = 1;
export const VSSEEKER_RESPONSE_FOUND_REMATCHES = 2;
export const TRAINER_TYPE_NORMAL = defineNumber(trainerTypesSource, 'TRAINER_TYPE_NORMAL');
export const TRAINER_TYPE_BURIED = defineNumber(trainerTypesSource, 'TRAINER_TYPE_BURIED');
export const MOVEMENT_TYPE_FACE_UP = defineNumber(movementSource, 'MOVEMENT_TYPE_FACE_UP');
export const MOVEMENT_TYPE_FACE_DOWN = defineNumber(movementSource, 'MOVEMENT_TYPE_FACE_DOWN');
export const MOVEMENT_TYPE_FACE_LEFT = defineNumber(movementSource, 'MOVEMENT_TYPE_FACE_LEFT');
export const MOVEMENT_TYPE_FACE_RIGHT = defineNumber(movementSource, 'MOVEMENT_TYPE_FACE_RIGHT');
export const MOVEMENT_TYPE_RAISE_HAND_AND_STOP = defineNumber(movementSource, 'MOVEMENT_TYPE_RAISE_HAND_AND_STOP');
export const MOVEMENT_TYPE_RAISE_HAND_AND_JUMP = defineNumber(movementSource, 'MOVEMENT_TYPE_RAISE_HAND_AND_JUMP');
export const MOVEMENT_TYPE_RAISE_HAND_AND_SWIM = defineNumber(movementSource, 'MOVEMENT_TYPE_RAISE_HAND_AND_SWIM');
export const FLAG_GOT_VS_SEEKER = 'FLAG_GOT_VS_SEEKER';
export const FLAG_WORLD_MAP_CELADON_CITY = 'FLAG_WORLD_MAP_CELADON_CITY';
export const FLAG_WORLD_MAP_FUCHSIA_CITY = 'FLAG_WORLD_MAP_FUCHSIA_CITY';
export const FLAG_SYS_GAME_CLEAR = 'FLAG_SYS_GAME_CLEAR';
export const FLAG_SYS_CAN_LINK_WITH_RS = 'FLAG_SYS_CAN_LINK_WITH_RS';
export const FLAG_SYS_VS_SEEKER_CHARGING = 'FLAG_SYS_VS_SEEKER_CHARGING';
export const ITEM_VS_SEEKER = 'ITEM_VS_SEEKER';
export const FLDEFF_USE_VS_SEEKER = 'FLDEFF_USE_VS_SEEKER';
export const SE_CONTEST_MONS_TURN = 'SE_CONTEST_MONS_TURN';
export const SE_PIN = 'SE_PIN';

export type VsSeekerTaskFunc =
  | 'Task_ResetObjectsRematchWantedState'
  | 'Task_VsSeeker_0'
  | 'Task_VsSeeker_1'
  | 'Task_VsSeeker_2'
  | 'Task_VsSeeker_3'
  | 'Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker';

export interface RematchData {
  trainerIdxs: number[];
  map: string;
}

export interface VsSeekerTrainerInfo {
  script: number[];
  trainerIdx: number;
  localId: number;
  objectEventId: number;
  xCoord: number;
  yCoord: number;
  graphicsId: number;
}

export interface VsSeekerStruct {
  trainerInfo: VsSeekerTrainerInfo[];
  trainerIdxArray: number[];
  runningBehaviourEtcArray: number[];
  numRematchableTrainers: number;
  trainerHasNotYetBeenFought: boolean;
  trainerDoesNotWantRematch: boolean;
  trainerWantsRematch: boolean;
  responseCode: number;
}

export interface VsSeekerTask {
  id: number;
  func: VsSeekerTaskFunc;
  data: number[];
  destroyed: boolean;
}

export interface VsSeekerObjectEventTemplate {
  localId: number;
  trainerType: number;
  movementType: number;
  script: number[];
  graphicsId: number;
}

export interface VsSeekerObjectEvent {
  active: boolean;
  localId: number;
  spriteId: number;
  singleMovementActive: boolean;
  currentCoords: { x: number; y: number };
  movementType: number;
  facingDirection: number;
  frozen: boolean;
  shiftedStillCoords: boolean;
}

export interface VsSeekerSprite {
  data: number[];
  x2: number;
  y2: number;
}

export interface VsSeekerRuntime {
  tasks: VsSeekerTask[];
  sVsSeeker: VsSeekerStruct | null;
  trainerRematchStepCounter: number;
  trainerRematches: number[];
  objectEventTemplates: VsSeekerObjectEventTemplate[];
  objectEvents: VsSeekerObjectEvent[];
  sprites: VsSeekerSprite[];
  objectEventCount: number;
  location: { mapNum: number; mapGroup: number };
  playerDestCoords: { x: number; y: number };
  flags: Set<string>;
  bagItems: Map<string, number>;
  foughtTrainers: Set<number>;
  fieldEffects: Set<string>;
  movementFinished: boolean;
  walkrunStandingStill: boolean;
  selectedObjectEvent: number;
  trainerBattleOpponentA: number;
  specialVarLastTalked: number;
  specialVarItemId: number;
  randomValues: number[];
  rngSeed: number;
  stringVars: string[];
  operations: string[];
}

const trainerDefines = parseNumericDefines(opponentsSource);
const movementDefines = parseNumericDefines(movementSource);
const eventObjectDefines = parseNumericDefines(eventObjectsSource);

export const sRematches: RematchData[] = parseRematches(vsSeekerSourceRaw);
export const sMovementScript_Wait48 = parseMovementScript(vsSeekerSourceRaw, 'sMovementScript_Wait48');
export const sMovementScript_TrainerUnfought = parseMovementScript(vsSeekerSourceRaw, 'sMovementScript_TrainerUnfought');
export const sMovementScript_TrainerNoRematch = parseMovementScript(vsSeekerSourceRaw, 'sMovementScript_TrainerNoRematch');
export const sMovementScript_TrainerRematch = parseMovementScript(vsSeekerSourceRaw, 'sMovementScript_TrainerRematch');
export const sFaceDirectionMovementTypeByFacingDirection = [
  MOVEMENT_TYPE_FACE_DOWN,
  MOVEMENT_TYPE_FACE_DOWN,
  MOVEMENT_TYPE_FACE_UP,
  MOVEMENT_TYPE_FACE_LEFT,
  MOVEMENT_TYPE_FACE_RIGHT
];

export const createVsSeekerRuntime = (): VsSeekerRuntime => ({
  tasks: [],
  sVsSeeker: null,
  trainerRematchStepCounter: 0,
  trainerRematches: Array.from({ length: 256 }, () => 0),
  objectEventTemplates: [],
  objectEvents: Array.from({ length: OBJECT_EVENTS_COUNT }, (_, id) => ({
    active: false,
    localId: id,
    spriteId: id,
    singleMovementActive: false,
    currentCoords: { x: 7, y: 7 },
    movementType: MOVEMENT_TYPE_FACE_DOWN,
    facingDirection: 1,
    frozen: false,
    shiftedStillCoords: false
  })),
  sprites: Array.from({ length: OBJECT_EVENTS_COUNT }, (_, id) => ({ data: [id], x2: 0, y2: 0 })),
  objectEventCount: 0,
  location: { mapNum: 0, mapGroup: 0 },
  playerDestCoords: { x: 7, y: 7 },
  flags: new Set(),
  bagItems: new Map(),
  foughtTrainers: new Set(),
  fieldEffects: new Set(),
  movementFinished: true,
  walkrunStandingStill: true,
  selectedObjectEvent: -1,
  trainerBattleOpponentA: 0,
  specialVarLastTalked: 0,
  specialVarItemId: 0,
  randomValues: [],
  rngSeed: 0x5a0,
  stringVars: [],
  operations: []
});

export function VsSeekerFreezeObjectsAfterChargeComplete(runtime: VsSeekerRuntime): number {
  return CreateTask(runtime, 'Task_ResetObjectsRematchWantedState', 80);
}

export function Task_ResetObjectsRematchWantedState(runtime: VsSeekerRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (task.data[0] === 0 && runtime.walkrunStandingStill === true) {
    runtime.operations.push('HandleEnforcedLookDirectionOnPlayerStopMoving');
    task.data[0] = 1;
  }
  if (task.data[1] === 0) {
    for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
      if (ObjectEventIdIsSane(runtime, i) === true) {
        if (runtime.objectEvents[i].singleMovementActive) return;
        FreezeObjectEvent(runtime, i);
      }
    }
  }
  task.data[1] = 1;
  if (task.data[0] !== 0) {
    DestroyTask(runtime, taskId);
    runtime.operations.push('StopPlayerAvatar');
    runtime.operations.push('ScriptContext_Enable');
  }
}

export function VsSeekerResetObjectMovementAfterChargeComplete(runtime: VsSeekerRuntime): void {
  for (let i = 0; i < runtime.objectEventCount; i += 1) {
    const template = runtime.objectEventTemplates[i];
    if (
      (template.trainerType === TRAINER_TYPE_NORMAL || template.trainerType === TRAINER_TYPE_BURIED)
      && (template.movementType === MOVEMENT_TYPE_RAISE_HAND_AND_STOP
        || template.movementType === MOVEMENT_TYPE_RAISE_HAND_AND_JUMP
        || template.movementType === MOVEMENT_TYPE_RAISE_HAND_AND_SWIM)
    ) {
      const movementType = GetRandomFaceDirectionMovementType(runtime);
      const objEventId = TryGetObjectEventIdByLocalIdAndMap(runtime, template.localId);
      if (ObjectEventIdIsSane(runtime, objEventId) === true) SetTrainerMovementType(runtime, runtime.objectEvents[objEventId], movementType);
      template.movementType = movementType;
    }
  }
}

export function UpdateVsSeekerStepCounter(runtime: VsSeekerRuntime): boolean {
  let x = 0;
  if (CheckBagHasItem(runtime, ITEM_VS_SEEKER, 1) === true) {
    if ((runtime.trainerRematchStepCounter & 0xff) < 100) runtime.trainerRematchStepCounter += 1;
  }
  if (FlagGet(runtime, FLAG_SYS_VS_SEEKER_CHARGING) === true) {
    if (((runtime.trainerRematchStepCounter >> 8) & 0xff) < 100) {
      x = ((runtime.trainerRematchStepCounter >> 8) & 0xff) + 1;
      runtime.trainerRematchStepCounter = (runtime.trainerRematchStepCounter & 0xff) | (x << 8);
    }
    if (((runtime.trainerRematchStepCounter >> 8) & 0xff) === 100) {
      FlagClear(runtime, FLAG_SYS_VS_SEEKER_CHARGING);
      VsSeekerResetChargingStepCounter(runtime);
      ClearAllTrainerRematchStates(runtime);
      return true;
    }
  }
  return false;
}

export function MapResetTrainerRematches(runtime: VsSeekerRuntime, _mapGroup: number, _mapNum: number): void {
  FlagClear(runtime, FLAG_SYS_VS_SEEKER_CHARGING);
  VsSeekerResetChargingStepCounter(runtime);
  ClearAllTrainerRematchStates(runtime);
  ResetMovementOfRematchableTrainers(runtime);
}

export function ResetMovementOfRematchableTrainers(runtime: VsSeekerRuntime): void {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i += 1) {
    const objectEvent = runtime.objectEvents[i];
    if (
      objectEvent.movementType === MOVEMENT_TYPE_RAISE_HAND_AND_STOP
      || objectEvent.movementType === MOVEMENT_TYPE_RAISE_HAND_AND_JUMP
      || objectEvent.movementType === MOVEMENT_TYPE_RAISE_HAND_AND_SWIM
    ) {
      const movementType = GetRandomFaceDirectionMovementType(runtime);
      if (objectEvent.active && runtime.sprites[objectEvent.spriteId].data[0] === i) {
        runtime.sprites[objectEvent.spriteId].x2 = 0;
        runtime.sprites[objectEvent.spriteId].y2 = 0;
        SetTrainerMovementType(runtime, objectEvent, movementType);
      }
    }
  }
}

export function VsSeekerResetInBagStepCounter(runtime: VsSeekerRuntime): void {
  runtime.trainerRematchStepCounter &= 0xff00;
}

export function VsSeekerSetStepCounterInBagFull(runtime: VsSeekerRuntime): void {
  runtime.trainerRematchStepCounter &= 0xff00;
  runtime.trainerRematchStepCounter |= 100;
}

export function VsSeekerResetChargingStepCounter(runtime: VsSeekerRuntime): void {
  runtime.trainerRematchStepCounter &= 0x00ff;
}

export function VsSeekerSetStepCounterFullyCharged(runtime: VsSeekerRuntime): void {
  runtime.trainerRematchStepCounter &= 0x00ff;
  runtime.trainerRematchStepCounter |= 100 << 8;
}

export function Task_VsSeeker_0(runtime: VsSeekerRuntime, taskId: number): void {
  runtime.tasks[taskId].data.fill(0);
  runtime.sVsSeeker = createVsSeekerStruct();
  GatherNearbyTrainerInfo(runtime);
  const respval = CanUseVsSeeker(runtime);
  if (respval === VSSEEKER_NOT_CHARGED) {
    runtime.sVsSeeker = null;
    DisplayItemMessageOnField(runtime, taskId, 'FONT_NORMAL', 'VSSeeker_Text_BatteryNotChargedNeedXSteps', 'Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker');
  } else if (respval === VSSEEKER_NO_ONE_IN_RANGE) {
    runtime.sVsSeeker = null;
    DisplayItemMessageOnField(runtime, taskId, 'FONT_NORMAL', 'VSSeeker_Text_NoTrainersWithinRange', 'Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker');
  } else if (respval === VSSEEKER_CAN_USE) {
    runtime.operations.push(`ItemUse_SetQuestLogEvent:QL_EVENT_USED_ITEM:0:${runtime.specialVarItemId}:65535`);
    FieldEffectStart(runtime, FLDEFF_USE_VS_SEEKER);
    runtime.tasks[taskId].func = 'Task_VsSeeker_1';
    runtime.tasks[taskId].data[0] = 15;
  }
}

export function Task_VsSeeker_1(runtime: VsSeekerRuntime, taskId: number): void {
  runtime.tasks[taskId].data[0] -= 1;
  if (runtime.tasks[taskId].data[0] === 0) {
    runtime.tasks[taskId].func = 'Task_VsSeeker_2';
    runtime.tasks[taskId].data[1] = 16;
  }
}

export function Task_VsSeeker_2(runtime: VsSeekerRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[2] !== 2 && --data[1] === 0) {
    PlaySE(runtime, SE_CONTEST_MONS_TURN);
    data[1] = 11;
    data[2] += 1;
  }
  if (!FieldEffectActiveListContains(runtime, FLDEFF_USE_VS_SEEKER)) {
    data[1] = 0;
    data[2] = 0;
    VsSeekerResetInBagStepCounter(runtime);
    if (runtime.sVsSeeker) runtime.sVsSeeker.responseCode = GetVsSeekerResponseInArea(runtime, sRematches);
    ScriptMovement_StartObjectMovementScript(runtime, NO_REMATCH_LOCALID, sMovementScript_Wait48);
    runtime.tasks[taskId].func = 'Task_VsSeeker_3';
  }
}

export function GatherNearbyTrainerInfo(runtime: VsSeekerRuntime): void {
  if (!runtime.sVsSeeker) runtime.sVsSeeker = createVsSeekerStruct();
  let objectEventId = 0;
  let vsSeekerObjectIdx = 0;
  for (let objectEventIdx = 0; objectEventIdx < runtime.objectEventCount; objectEventIdx += 1) {
    const template = runtime.objectEventTemplates[objectEventIdx];
    if (template.trainerType === TRAINER_TYPE_NORMAL || template.trainerType === TRAINER_TYPE_BURIED) {
      objectEventId = TryGetObjectEventIdByLocalIdAndMap(runtime, template.localId);
      runtime.sVsSeeker.trainerInfo[vsSeekerObjectIdx] = {
        script: template.script,
        trainerIdx: GetTrainerFlagFromScript(template.script),
        localId: template.localId,
        objectEventId,
        xCoord: runtime.objectEvents[objectEventId].currentCoords.x - 7,
        yCoord: runtime.objectEvents[objectEventId].currentCoords.y - 7,
        graphicsId: template.graphicsId
      };
      vsSeekerObjectIdx += 1;
    }
  }
  runtime.sVsSeeker.trainerInfo[vsSeekerObjectIdx] = sentinelTrainerInfo();
}

export function Task_VsSeeker_3(runtime: VsSeekerRuntime, taskId: number): void {
  if (ScriptMovement_IsObjectMovementFinished(runtime, NO_REMATCH_LOCALID)) {
    if (runtime.sVsSeeker?.responseCode === VSSEEKER_RESPONSE_NO_RESPONSE) {
      DisplayItemMessageOnField(runtime, taskId, 'FONT_NORMAL', 'VSSeeker_Text_TrainersNotReady', 'Task_ItemUse_CloseMessageBoxAndReturnToField_VsSeeker');
    } else {
      if (runtime.sVsSeeker?.responseCode === VSSEEKER_RESPONSE_FOUND_REMATCHES) StartAllRespondantIdleMovements(runtime);
      runtime.operations.push('ClearDialogWindowAndFrame:0:true');
      runtime.operations.push('ClearPlayerHeldMovementAndUnfreezeObjectEvents');
      runtime.operations.push('UnlockPlayerFieldControls');
      DestroyTask(runtime, taskId);
    }
    runtime.sVsSeeker = null;
  }
}

export function CanUseVsSeeker(runtime: VsSeekerRuntime): number {
  const vsSeekerChargeSteps = runtime.trainerRematchStepCounter & 0xff;
  if (vsSeekerChargeSteps === 100) {
    if (GetRematchableTrainerLocalId(runtime) === NO_REMATCH_LOCALID) return VSSEEKER_NO_ONE_IN_RANGE;
    return VSSEEKER_CAN_USE;
  }
  runtime.stringVars[0] = String(100 - vsSeekerChargeSteps);
  runtime.operations.push(`TV_PrintIntToStringVar:0:${100 - vsSeekerChargeSteps}`);
  return VSSEEKER_NOT_CHARGED;
}

export function GetVsSeekerResponseInArea(runtime: VsSeekerRuntime, vsSeekerData: RematchData[]): number {
  if (!runtime.sVsSeeker) return VSSEEKER_RESPONSE_NO_RESPONSE;
  let trainerIdx = 0;
  let rval = 0;
  let rematchTrainerIdx: number;
  const unusedIdx = { value: 0 };
  let response = 0;
  let vsSeekerIdx = 0;
  while (runtime.sVsSeeker.trainerInfo[vsSeekerIdx]?.localId !== NO_REMATCH_LOCALID) {
    const trainerInfo = runtime.sVsSeeker.trainerInfo[vsSeekerIdx];
    if (IsTrainerVisibleOnScreen(runtime, trainerInfo) === true) {
      trainerIdx = trainerInfo.trainerIdx;
      if (!HasTrainerBeenFought(runtime, trainerIdx)) {
        StartTrainerObjectMovementScript(runtime, trainerInfo, sMovementScript_TrainerUnfought);
        runtime.sVsSeeker.trainerHasNotYetBeenFought = true;
        vsSeekerIdx += 1;
        continue;
      }
      rematchTrainerIdx = GetNextAvailableRematchTrainer(runtime, vsSeekerData, trainerIdx, unusedIdx);
      if (rematchTrainerIdx === 0) {
        StartTrainerObjectMovementScript(runtime, trainerInfo, sMovementScript_TrainerNoRematch);
        runtime.sVsSeeker.trainerDoesNotWantRematch = true;
      } else {
        rval = Random(runtime) % 100;
        response = GetCurVsSeekerResponse(runtime, vsSeekerIdx, trainerIdx);
        if (response === VSSEEKER_SINGLE_RESP_YES) rval = 100;
        else if (response === VSSEEKER_SINGLE_RESP_NO) rval = 0;
        if (rval < 30) {
          StartTrainerObjectMovementScript(runtime, trainerInfo, sMovementScript_TrainerNoRematch);
          runtime.sVsSeeker.trainerDoesNotWantRematch = true;
        } else {
          runtime.trainerRematches[trainerInfo.localId] = rematchTrainerIdx;
          ShiftStillObjectEventCoords(runtime, runtime.objectEvents[trainerInfo.objectEventId]);
          StartTrainerObjectMovementScript(runtime, trainerInfo, sMovementScript_TrainerRematch);
          runtime.sVsSeeker.trainerIdxArray[runtime.sVsSeeker.numRematchableTrainers] = trainerIdx;
          runtime.sVsSeeker.runningBehaviourEtcArray[runtime.sVsSeeker.numRematchableTrainers] = GetRunningBehaviorFromGraphicsId(trainerInfo.graphicsId);
          runtime.sVsSeeker.numRematchableTrainers += 1;
          runtime.sVsSeeker.trainerWantsRematch = true;
        }
      }
    }
    vsSeekerIdx += 1;
  }
  if (runtime.sVsSeeker.trainerWantsRematch) {
    PlaySE(runtime, SE_PIN);
    FlagSet(runtime, FLAG_SYS_VS_SEEKER_CHARGING);
    VsSeekerResetChargingStepCounter(runtime);
    return VSSEEKER_RESPONSE_FOUND_REMATCHES;
  }
  if (runtime.sVsSeeker.trainerHasNotYetBeenFought) return VSSEEKER_RESPONSE_UNFOUGHT_TRAINERS;
  return VSSEEKER_RESPONSE_NO_RESPONSE;
}

export function ClearRematchStateByTrainerId(runtime: VsSeekerRuntime): void {
  let objEventId = 0;
  const vsSeekerDataIdx = LookupVsSeekerOpponentInArray(sRematches, runtime.trainerBattleOpponentA);
  if (vsSeekerDataIdx !== -1) {
    for (let i = 0; i < runtime.objectEventCount; i += 1) {
      const template = runtime.objectEventTemplates[i];
      if (
        (template.trainerType === TRAINER_TYPE_NORMAL || template.trainerType === TRAINER_TYPE_BURIED)
        && vsSeekerDataIdx === LookupVsSeekerOpponentInArray(sRematches, GetTrainerFlagFromScript(template.script))
      ) {
        objEventId = TryGetObjectEventIdByLocalIdAndMap(runtime, template.localId);
        const objectEvent = runtime.objectEvents[objEventId];
        GetRandomFaceDirectionMovementType(runtime);
        OverrideMovementTypeForObjectEvent(runtime, objectEvent, sFaceDirectionMovementTypeByFacingDirection[objectEvent.facingDirection] ?? MOVEMENT_TYPE_FACE_DOWN);
        runtime.trainerRematches[template.localId] = 0;
        if (runtime.selectedObjectEvent === objEventId) objectEvent.movementType = sFaceDirectionMovementTypeByFacingDirection[objectEvent.facingDirection] ?? MOVEMENT_TYPE_FACE_DOWN;
        else objectEvent.movementType = MOVEMENT_TYPE_FACE_DOWN;
      }
    }
  }
}

export function TryGetRematchTrainerIdGivenGameState(runtime: VsSeekerRuntime, trainerIdxs: number[], rematchIdx: { value: number }): void {
  switch (rematchIdx.value) {
    case 0:
      break;
    case 1:
      if (!FlagGet(runtime, FLAG_GOT_VS_SEEKER)) rematchIdx.value = GetRematchTrainerIdGivenGameState(trainerIdxs, rematchIdx.value);
      break;
    case 2:
      if (!FlagGet(runtime, FLAG_WORLD_MAP_CELADON_CITY)) rematchIdx.value = GetRematchTrainerIdGivenGameState(trainerIdxs, rematchIdx.value);
      break;
    case 3:
      if (!FlagGet(runtime, FLAG_WORLD_MAP_FUCHSIA_CITY)) rematchIdx.value = GetRematchTrainerIdGivenGameState(trainerIdxs, rematchIdx.value);
      break;
    case 4:
      if (!FlagGet(runtime, FLAG_SYS_GAME_CLEAR)) rematchIdx.value = GetRematchTrainerIdGivenGameState(trainerIdxs, rematchIdx.value);
      break;
    case 5:
      if (!FlagGet(runtime, FLAG_SYS_CAN_LINK_WITH_RS)) rematchIdx.value = GetRematchTrainerIdGivenGameState(trainerIdxs, rematchIdx.value);
      break;
  }
}

export function GetRematchTrainerIdGivenGameState(trainerIdxs: number[], rematchIdx: number): number {
  while (--rematchIdx !== 0) {
    if (trainerIdxs[rematchIdx] !== SKIP) return rematchIdx;
  }
  return 0;
}

export function ShouldTryRematchBattle(runtime: VsSeekerRuntime): boolean {
  if (ShouldTryRematchBattleInternal(runtime, sRematches, runtime.trainerBattleOpponentA)) return true;
  return HasRematchTrainerAlreadyBeenFought(runtime, sRematches, runtime.trainerBattleOpponentA);
}

export function ShouldTryRematchBattleInternal(runtime: VsSeekerRuntime, vsSeekerData: RematchData[], trainerBattleOpponent: number): boolean {
  const rematchIdx = GetRematchIdx(vsSeekerData, trainerBattleOpponent);
  if (rematchIdx === -1) return false;
  if (rematchIdx >= 0 && rematchIdx < sRematches.length) {
    if (IsThisTrainerRematchable(runtime, runtime.specialVarLastTalked)) return true;
  }
  return false;
}

export function HasRematchTrainerAlreadyBeenFought(runtime: VsSeekerRuntime, vsSeekerData: RematchData[], trainerBattleOpponent: number): boolean {
  const rematchIdx = GetRematchIdx(vsSeekerData, trainerBattleOpponent);
  if (rematchIdx === -1) return false;
  if (!HasTrainerBeenFought(runtime, vsSeekerData[rematchIdx].trainerIdxs[0])) return false;
  return true;
}

export function ClearRematchStateOfLastTalked(runtime: VsSeekerRuntime): void {
  runtime.trainerRematches[runtime.specialVarLastTalked] = 0;
  runtime.operations.push('SetBattledTrainerFlag');
}

export function LookupVsSeekerOpponentInArray(array: RematchData[], trainerId: number): number {
  for (let i = 0; i < sRematches.length; i += 1) {
    for (let j = 0; j < MAX_REMATCH_PARTIES; j += 1) {
      if (array[i].trainerIdxs[j] === 0) break;
      const testTrainerId = array[i].trainerIdxs[j];
      if (testTrainerId === SKIP) continue;
      if (testTrainerId === trainerId) return i;
    }
  }
  return -1;
}

export function GetRematchTrainerId(runtime: VsSeekerRuntime, trainerId: number): number {
  const i = { value: 0 };
  const j = { value: GetNextAvailableRematchTrainer(runtime, sRematches, trainerId, i) };
  if (!j.value) return 0;
  TryGetRematchTrainerIdGivenGameState(runtime, sRematches[i.value].trainerIdxs, j);
  return sRematches[i.value].trainerIdxs[j.value];
}

export function IsTrainerReadyForRematch(runtime: VsSeekerRuntime): boolean {
  return IsTrainerReadyForRematchInternal(runtime, sRematches, runtime.trainerBattleOpponentA);
}

export function IsTrainerReadyForRematchInternal(runtime: VsSeekerRuntime, array: RematchData[], trainerId: number): boolean {
  const rematchTrainerIdx = LookupVsSeekerOpponentInArray(array, trainerId);
  if (rematchTrainerIdx === -1) return false;
  if (rematchTrainerIdx >= sRematches.length) return false;
  if (!IsThisTrainerRematchable(runtime, runtime.specialVarLastTalked)) return false;
  return true;
}

export function ObjectEventIdIsSane(runtime: VsSeekerRuntime, objectEventId: number): boolean {
  const objectEvent = runtime.objectEvents[objectEventId];
  if (objectEvent?.active && runtime.objectEventCount >= objectEvent.localId && runtime.sprites[objectEvent.spriteId]?.data[0] === objectEventId) return true;
  return false;
}

export function GetRandomFaceDirectionMovementType(runtime: VsSeekerRuntime): number {
  const r1 = Random(runtime) % 4;
  switch (r1) {
    case 0:
      return MOVEMENT_TYPE_FACE_UP;
    case 1:
      return MOVEMENT_TYPE_FACE_DOWN;
    case 2:
      return MOVEMENT_TYPE_FACE_LEFT;
    case 3:
      return MOVEMENT_TYPE_FACE_RIGHT;
    default:
      return MOVEMENT_TYPE_FACE_DOWN;
  }
}

export function GetRunningBehaviorFromGraphicsId(graphicsId: number): number {
  const jumpGraphics = [
    'OBJ_EVENT_GFX_LITTLE_GIRL',
    'OBJ_EVENT_GFX_YOUNGSTER',
    'OBJ_EVENT_GFX_BOY',
    'OBJ_EVENT_GFX_BUG_CATCHER',
    'OBJ_EVENT_GFX_LASS',
    'OBJ_EVENT_GFX_WOMAN_1',
    'OBJ_EVENT_GFX_CRUSH_GIRL',
    'OBJ_EVENT_GFX_MAN',
    'OBJ_EVENT_GFX_ROCKER',
    'OBJ_EVENT_GFX_WOMAN_2',
    'OBJ_EVENT_GFX_BEAUTY',
    'OBJ_EVENT_GFX_BALDING_MAN',
    'OBJ_EVENT_GFX_TUBER_F',
    'OBJ_EVENT_GFX_CAMPER',
    'OBJ_EVENT_GFX_PICNICKER',
    'OBJ_EVENT_GFX_COOLTRAINER_M',
    'OBJ_EVENT_GFX_COOLTRAINER_F',
    'OBJ_EVENT_GFX_SWIMMER_M_LAND',
    'OBJ_EVENT_GFX_SWIMMER_F_LAND',
    'OBJ_EVENT_GFX_BLACK_BELT',
    'OBJ_EVENT_GFX_HIKER',
    'OBJ_EVENT_GFX_SAILOR'
  ].map((name) => eventObjectDefines.get(name));
  const swimGraphics = ['OBJ_EVENT_GFX_TUBER_M_WATER', 'OBJ_EVENT_GFX_SWIMMER_M_WATER', 'OBJ_EVENT_GFX_SWIMMER_F_WATER'].map((name) => eventObjectDefines.get(name));
  if (jumpGraphics.includes(graphicsId)) return MOVEMENT_TYPE_RAISE_HAND_AND_JUMP;
  if (swimGraphics.includes(graphicsId)) return MOVEMENT_TYPE_RAISE_HAND_AND_SWIM;
  return MOVEMENT_TYPE_RAISE_HAND_AND_STOP;
}

export function GetTrainerFlagFromScript(script: number[]): number {
  return (script[2] ?? 0) | ((script[3] ?? 0) << 8);
}

export function GetRematchIdx(vsSeekerData: RematchData[], trainerFlagIdx: number): number {
  for (let i = 0; i < sRematches.length; i += 1) {
    if (vsSeekerData[i].trainerIdxs[0] === trainerFlagIdx) return i;
  }
  return -1;
}

export function IsThisTrainerRematchable(runtime: VsSeekerRuntime, localId: number): boolean {
  if (!runtime.trainerRematches[localId]) return false;
  return true;
}

export function ClearAllTrainerRematchStates(runtime: VsSeekerRuntime): void {
  for (let i = 0; i < runtime.trainerRematches.length; i += 1) runtime.trainerRematches[i] = 0;
}

export function IsTrainerVisibleOnScreen(runtime: VsSeekerRuntime, trainerInfo: VsSeekerTrainerInfo): boolean {
  let x = runtime.playerDestCoords.x;
  let y = runtime.playerDestCoords.y;
  x -= 7;
  y -= 7;
  if (
    x - 7 <= trainerInfo.xCoord
    && x + 7 >= trainerInfo.xCoord
    && y - 5 <= trainerInfo.yCoord
    && y + 5 >= trainerInfo.yCoord
    && ObjectEventIdIsSane(runtime, trainerInfo.objectEventId) === true
  ) {
    return true;
  }
  return false;
}

export function GetNextAvailableRematchTrainer(runtime: VsSeekerRuntime, vsSeekerData: RematchData[], trainerFlagNo: number, idxPtr: { value: number }): number {
  for (let i = 0; i < sRematches.length; i += 1) {
    if (vsSeekerData[i].trainerIdxs[0] === trainerFlagNo) {
      idxPtr.value = i;
      let j = 1;
      for (; j < MAX_REMATCH_PARTIES; j += 1) {
        if (vsSeekerData[i].trainerIdxs[j] === TRAINER_NONE) return j - 1;
        if (vsSeekerData[i].trainerIdxs[j] === SKIP) continue;
        if (HasTrainerBeenFought(runtime, vsSeekerData[i].trainerIdxs[j])) continue;
        return j;
      }
      return j - 1;
    }
  }
  idxPtr.value = 0;
  return 0;
}

export function GetRematchableTrainerLocalId(runtime: VsSeekerRuntime): number {
  if (!runtime.sVsSeeker) return NO_REMATCH_LOCALID;
  const idx = { value: 0 };
  for (let i = 0; runtime.sVsSeeker.trainerInfo[i]?.localId !== NO_REMATCH_LOCALID; i += 1) {
    const trainerInfo = runtime.sVsSeeker.trainerInfo[i];
    if (IsTrainerVisibleOnScreen(runtime, trainerInfo) === true) {
      if (HasTrainerBeenFought(runtime, trainerInfo.trainerIdx) !== true || GetNextAvailableRematchTrainer(runtime, sRematches, trainerInfo.trainerIdx, idx)) {
        return trainerInfo.localId;
      }
    }
  }
  return NO_REMATCH_LOCALID;
}

export function StartTrainerObjectMovementScript(runtime: VsSeekerRuntime, trainerInfo: VsSeekerTrainerInfo, script: number[]): void {
  UnfreezeObjectEvent(runtime, trainerInfo.objectEventId);
  ScriptMovement_StartObjectMovementScript(runtime, trainerInfo.localId, script);
}

export function GetCurVsSeekerResponse(runtime: VsSeekerRuntime, vsSeekerIdx: number, trainerIdx: number): number {
  if (!runtime.sVsSeeker) return VSSEEKER_SINGLE_RESP_RAND;
  for (let i = 0; i < vsSeekerIdx; i += 1) {
    if (IsTrainerVisibleOnScreen(runtime, runtime.sVsSeeker.trainerInfo[i]) === true && runtime.sVsSeeker.trainerInfo[i].trainerIdx === trainerIdx) {
      for (let j = 0; j < runtime.sVsSeeker.numRematchableTrainers; j += 1) {
        if (runtime.sVsSeeker.trainerIdxArray[j] === runtime.sVsSeeker.trainerInfo[i].trainerIdx) return VSSEEKER_SINGLE_RESP_YES;
      }
      return VSSEEKER_SINGLE_RESP_NO;
    }
  }
  return VSSEEKER_SINGLE_RESP_RAND;
}

export function StartAllRespondantIdleMovements(runtime: VsSeekerRuntime): void {
  if (!runtime.sVsSeeker) return;
  const dummy = { value: 0 };
  for (let i = 0; i < runtime.sVsSeeker.numRematchableTrainers; i += 1) {
    for (let j = 0; runtime.sVsSeeker.trainerInfo[j]?.localId !== NO_REMATCH_LOCALID; j += 1) {
      if (runtime.sVsSeeker.trainerInfo[j].trainerIdx === runtime.sVsSeeker.trainerIdxArray[i]) {
        const objectEvent = runtime.objectEvents[runtime.sVsSeeker.trainerInfo[j].objectEventId];
        if (ObjectEventIdIsSane(runtime, runtime.sVsSeeker.trainerInfo[j].objectEventId) === true) SetTrainerMovementType(runtime, objectEvent, runtime.sVsSeeker.runningBehaviourEtcArray[i]);
        OverrideMovementTypeForObjectEvent(runtime, objectEvent, runtime.sVsSeeker.runningBehaviourEtcArray[i]);
        runtime.trainerRematches[runtime.sVsSeeker.trainerInfo[j].localId] = GetNextAvailableRematchTrainer(runtime, sRematches, runtime.sVsSeeker.trainerInfo[j].trainerIdx, dummy);
      }
    }
  }
}

export function tickVsSeekerTask(runtime: VsSeekerRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  if (task.func === 'Task_ResetObjectsRematchWantedState') Task_ResetObjectsRematchWantedState(runtime, taskId);
  else if (task.func === 'Task_VsSeeker_0') Task_VsSeeker_0(runtime, taskId);
  else if (task.func === 'Task_VsSeeker_1') Task_VsSeeker_1(runtime, taskId);
  else if (task.func === 'Task_VsSeeker_2') Task_VsSeeker_2(runtime, taskId);
  else if (task.func === 'Task_VsSeeker_3') Task_VsSeeker_3(runtime, taskId);
}

export function trainerConst(name: string): number {
  return trainerDefines.get(name) ?? 0;
}

export function movementConst(name: string): number {
  return movementDefines.get(name) ?? 0;
}

export function objectGfxConst(name: string): number {
  return eventObjectDefines.get(name) ?? 0;
}

function CreateTask(runtime: VsSeekerRuntime, func: VsSeekerTaskFunc, priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${id}:${func}:${priority}`);
  return id;
}

function DestroyTask(runtime: VsSeekerRuntime, taskId: number): void {
  if (runtime.tasks[taskId]) {
    runtime.tasks[taskId].destroyed = true;
    runtime.operations.push(`DestroyTask:${taskId}`);
  }
}

function createVsSeekerStruct(): VsSeekerStruct {
  return {
    trainerInfo: [sentinelTrainerInfo()],
    trainerIdxArray: Array.from({ length: OBJECT_EVENTS_COUNT }, () => 0),
    runningBehaviourEtcArray: Array.from({ length: OBJECT_EVENTS_COUNT }, () => 0),
    numRematchableTrainers: 0,
    trainerHasNotYetBeenFought: false,
    trainerDoesNotWantRematch: false,
    trainerWantsRematch: false,
    responseCode: VSSEEKER_RESPONSE_NO_RESPONSE
  };
}

function sentinelTrainerInfo(): VsSeekerTrainerInfo {
  return { script: [], trainerIdx: 0, localId: NO_REMATCH_LOCALID, objectEventId: 0, xCoord: 0, yCoord: 0, graphicsId: 0 };
}

function FlagGet(runtime: VsSeekerRuntime, flag: string): boolean {
  return runtime.flags.has(flag);
}

function FlagSet(runtime: VsSeekerRuntime, flag: string): void {
  runtime.flags.add(flag);
  runtime.operations.push(`FlagSet:${flag}`);
}

function FlagClear(runtime: VsSeekerRuntime, flag: string): void {
  runtime.flags.delete(flag);
  runtime.operations.push(`FlagClear:${flag}`);
}

function CheckBagHasItem(runtime: VsSeekerRuntime, item: string, quantity: number): boolean {
  return (runtime.bagItems.get(item) ?? 0) >= quantity;
}

function HasTrainerBeenFought(runtime: VsSeekerRuntime, trainerId: number): boolean {
  return runtime.foughtTrainers.has(trainerId);
}

function TryGetObjectEventIdByLocalIdAndMap(runtime: VsSeekerRuntime, localId: number): number {
  return runtime.objectEvents.findIndex((event) => event.localId === localId);
}

function FreezeObjectEvent(runtime: VsSeekerRuntime, objectEventId: number): void {
  runtime.objectEvents[objectEventId].frozen = true;
  runtime.operations.push(`FreezeObjectEvent:${objectEventId}`);
}

function UnfreezeObjectEvent(runtime: VsSeekerRuntime, objectEventId: number): void {
  runtime.objectEvents[objectEventId].frozen = false;
  runtime.operations.push(`UnfreezeObjectEvent:${objectEventId}`);
}

function SetTrainerMovementType(runtime: VsSeekerRuntime, objectEvent: VsSeekerObjectEvent, movementType: number): void {
  objectEvent.movementType = movementType;
  runtime.operations.push(`SetTrainerMovementType:${objectEvent.localId}:${movementType}`);
}

function OverrideMovementTypeForObjectEvent(runtime: VsSeekerRuntime, objectEvent: VsSeekerObjectEvent, movementType: number): void {
  objectEvent.movementType = movementType;
  runtime.operations.push(`OverrideMovementTypeForObjectEvent:${objectEvent.localId}:${movementType}`);
}

function ShiftStillObjectEventCoords(runtime: VsSeekerRuntime, objectEvent: VsSeekerObjectEvent): void {
  objectEvent.shiftedStillCoords = true;
  runtime.operations.push(`ShiftStillObjectEventCoords:${objectEvent.localId}`);
}

function DisplayItemMessageOnField(runtime: VsSeekerRuntime, taskId: number, font: string, text: string, callback: VsSeekerTaskFunc): void {
  runtime.tasks[taskId].func = callback;
  runtime.operations.push(`DisplayItemMessageOnField:${taskId}:${font}:${text}:${callback}`);
}

function FieldEffectStart(runtime: VsSeekerRuntime, effect: string): void {
  runtime.fieldEffects.add(effect);
  runtime.operations.push(`FieldEffectStart:${effect}`);
}

function FieldEffectActiveListContains(runtime: VsSeekerRuntime, effect: string): boolean {
  return runtime.fieldEffects.has(effect);
}

function PlaySE(runtime: VsSeekerRuntime, se: string): void {
  runtime.operations.push(`PlaySE:${se}`);
}

function ScriptMovement_StartObjectMovementScript(runtime: VsSeekerRuntime, localId: number, script: number[]): void {
  runtime.operations.push(`ScriptMovement_StartObjectMovementScript:${localId}:${runtime.location.mapNum}:${runtime.location.mapGroup}:${script.join(',')}`);
}

function ScriptMovement_IsObjectMovementFinished(runtime: VsSeekerRuntime, _localId: number): boolean {
  return runtime.movementFinished;
}

function Random(runtime: VsSeekerRuntime): number {
  if (runtime.randomValues.length > 0) return runtime.randomValues.shift() ?? 0;
  runtime.rngSeed = (Math.imul(runtime.rngSeed, 1103515245) + 24691) >>> 0;
  return runtime.rngSeed >>> 16;
}

function parseRematches(source: string): RematchData[] {
  const body = source.match(/static const struct RematchData sRematches\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{\s*\{([^}]+)\},\s*MAP\((MAP_[A-Z0-9_]+)\)\s*\}/gu)].map(([, trainerBody, map]) => {
    const trainerIdxs = trainerBody.split(',').map((token) => resolveTrainerToken(token.trim())).filter((value) => value !== null) as number[];
    while (trainerIdxs.length < MAX_REMATCH_PARTIES) trainerIdxs.push(TRAINER_NONE);
    return { trainerIdxs: trainerIdxs.slice(0, MAX_REMATCH_PARTIES), map };
  });
}

function parseMovementScript(source: string, symbol: string): number[] {
  const body = source.match(new RegExp(`static const u8 ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return body.split(',').map((token) => token.trim()).filter(Boolean).map((token) => movementDefines.get(token) ?? 0);
}

function resolveTrainerToken(token: string): number | null {
  if (token === '') return null;
  if (token === 'SKIP') return SKIP;
  return trainerDefines.get(token) ?? Number.parseInt(token, 0);
}

function defineNumber(source: string, name: string): number {
  return parseNumericDefines(source).get(name) ?? 0;
}

function parseNumericDefines(source: string): Map<string, number> {
  const values = new Map<string, number>();
  for (const [, name, value] of source.matchAll(/^#define\s+([A-Z0-9_]+)\s+((?:0x[0-9A-Fa-f]+)|(?:\d+))(?:\s|$)/gmu)) {
    values.set(name, Number.parseInt(value, 0));
  }
  return values;
}
