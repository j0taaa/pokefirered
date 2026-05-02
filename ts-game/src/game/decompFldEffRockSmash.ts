import type { DialogueState } from './interaction';
import type { FieldScriptSessionState } from './decompFieldDialogue';

export const OBJ_EVENT_GFX_ROCK_SMASH_ROCK = 'OBJ_EVENT_GFX_ROCK_SMASH_ROCK';
export const MAP_TYPE_UNDERWATER = 'MAP_TYPE_UNDERWATER';
export const MOVEMENT_ACTION_START_ANIM_IN_DIRECTION = 'MOVEMENT_ACTION_START_ANIM_IN_DIRECTION';
export const FLDEFF_FIELD_MOVE_SHOW_MON_INIT = 'FLDEFF_FIELD_MOVE_SHOW_MON_INIT';
export const FLDEFF_FIELD_MOVE_SHOW_MON = 'FLDEFF_FIELD_MOVE_SHOW_MON';
export const FLDEFF_USE_ROCK_SMASH = 'FLDEFF_USE_ROCK_SMASH';
export const GAME_STAT_USED_ROCK_SMASH = 'GAME_STAT_USED_ROCK_SMASH';
export const SE_M_ROCK_THROW = 'SE_M_ROCK_THROW';
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

type RockSmashTaskFunc =
  | 'Task_FieldEffectShowMon_Init'
  | 'Task_FieldEffectShowMon_WaitPlayerAnim'
  | 'Task_FieldEffectShowMon_WaitFldeff'
  | 'Task_FieldEffectShowMon_Cleanup'
  | 'DestroyTask';

interface RockSmashObjectEvent {
  graphicsId: string | number;
  localId: number;
  x: number;
  y: number;
  elevation: number;
  movementOverridden: boolean;
  heldMovementFinished: boolean;
  heldMovement: string | null;
}

interface RockSmashSprite {
  anim: number | null;
}

interface RockSmashTask {
  func: RockSmashTaskFunc;
  data: number[];
  destroyed: boolean;
}

interface LegacyRockSmashRuntime {
  vars: Record<string, number>;
}

export interface FldEffRockSmashRuntime {
  playerFacingPosition: { x: number; y: number; elevation: number };
  oneStepInFront: { x: number; y: number };
  playerElevation: number;
  playerFacingDirection: number;
  playerAvatar: {
    preventStep: boolean;
    objectEventId: number;
    spriteId: number;
  };
  mapHeader: {
    mapType: string | number;
  };
  objectEvents: RockSmashObjectEvent[];
  sprites: RockSmashSprite[];
  tasks: RockSmashTask[];
  specialVarLastTalked: number;
  fieldCallback2: string | null;
  postMenuFieldCallback: string | null;
  fieldEffectArguments: number[];
  cursorSelectionMonId: number;
  fieldEffectFuncInData: 'StartRockSmashFieldEffect' | null;
  activeFieldEffects: Set<string>;
  fieldEffectsStarted: string[];
  fieldEffectsRemoved: string[];
  scriptsSetup: string[];
  gameStats: Record<string, number>;
  sounds: string[];
  scriptContextEnabled: number;
  playerControlsLocked: number;
  playerSummonMonAnims: number;
}

export const createFldEffRockSmashRuntime = (): FldEffRockSmashRuntime => ({
  playerFacingPosition: { x: 0, y: 0, elevation: 0 },
  oneStepInFront: { x: 0, y: 0 },
  playerElevation: 0,
  playerFacingDirection: DIR_SOUTH,
  playerAvatar: {
    preventStep: false,
    objectEventId: 0,
    spriteId: 0
  },
  mapHeader: {
    mapType: 0
  },
  objectEvents: [
    {
      graphicsId: 0,
      localId: 0,
      x: 0,
      y: 0,
      elevation: 0,
      movementOverridden: false,
      heldMovementFinished: true,
      heldMovement: null
    }
  ],
  sprites: [{ anim: null }],
  tasks: [],
  specialVarLastTalked: 0,
  fieldCallback2: null,
  postMenuFieldCallback: null,
  fieldEffectArguments: Array.from({ length: 8 }, () => 0),
  cursorSelectionMonId: 0,
  fieldEffectFuncInData: null,
  activeFieldEffects: new Set(),
  fieldEffectsStarted: [],
  fieldEffectsRemoved: [],
  scriptsSetup: [],
  gameStats: {},
  sounds: [],
  scriptContextEnabled: 0,
  playerControlsLocked: 0,
  playerSummonMonAnims: 0
});

const createTask = (runtime: FldEffRockSmashRuntime, func: RockSmashTaskFunc, _priority: number): number => {
  runtime.tasks.push({ func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return runtime.tasks.length - 1;
};

const destroyTask = (runtime: FldEffRockSmashRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task) {
    task.destroyed = true;
    task.func = 'DestroyTask';
  }
};

const getXYCoordsOneStepInFrontOfPlayer = (runtime: FldEffRockSmashRuntime): void => {
  runtime.playerFacingPosition.x = runtime.oneStepInFront.x;
  runtime.playerFacingPosition.y = runtime.oneStepInFront.y;
};

const playerGetElevation = (runtime: FldEffRockSmashRuntime): number => runtime.playerElevation;

const getObjectEventIdByPosition = (runtime: FldEffRockSmashRuntime, x: number, y: number, elevation: number): number => {
  const index = runtime.objectEvents.findIndex((event) => event.x === x && event.y === y && event.elevation === elevation);
  return index >= 0 ? index : 0;
};

const lockPlayerFieldControls = (runtime: FldEffRockSmashRuntime): void => {
  runtime.playerControlsLocked += 1;
};

const objectEventIsMovementOverridden = (event: RockSmashObjectEvent): boolean => event.movementOverridden;

const objectEventClearHeldMovementIfFinished = (event: RockSmashObjectEvent): boolean => {
  if (event.heldMovementFinished) {
    event.heldMovement = null;
    event.movementOverridden = false;
    return true;
  }
  return false;
};

const fieldEffectStart = (runtime: FldEffRockSmashRuntime, fieldEffect: string): void => {
  runtime.fieldEffectsStarted.push(fieldEffect);
  runtime.activeFieldEffects.add(fieldEffect);
};

const startPlayerAvatarSummonMonForFieldMoveAnim = (runtime: FldEffRockSmashRuntime): void => {
  runtime.playerSummonMonAnims += 1;
};

const objectEventSetHeldMovement = (event: RockSmashObjectEvent, movement: string): void => {
  event.heldMovement = movement;
  event.movementOverridden = true;
  event.heldMovementFinished = false;
};

const objectEventCheckHeldMovementStatus = (event: RockSmashObjectEvent): boolean => event.heldMovementFinished;

const fieldEffectActiveListContains = (runtime: FldEffRockSmashRuntime, fieldEffect: string): boolean => runtime.activeFieldEffects.has(fieldEffect);

const getPlayerFacingDirection = (runtime: FldEffRockSmashRuntime): number => runtime.playerFacingDirection;

const objectEventSetGraphicsId = (event: RockSmashObjectEvent, graphicsId: string | number): void => {
  event.graphicsId = graphicsId;
};

const getPlayerAvatarGraphicsIdByCurrentState = (): string => 'GetPlayerAvatarGraphicsIdByCurrentState';

const startSpriteAnim = (sprite: RockSmashSprite, anim: number): void => {
  sprite.anim = anim;
};

const fieldEffectActiveListRemove = (runtime: FldEffRockSmashRuntime, fieldEffect: string): void => {
  runtime.activeFieldEffects.delete(fieldEffect);
  runtime.fieldEffectsRemoved.push(fieldEffect);
};

const incrementGameStat = (runtime: FldEffRockSmashRuntime, stat: string): void => {
  runtime.gameStats[stat] = (runtime.gameStats[stat] ?? 0) + 1;
};

const playSE = (runtime: FldEffRockSmashRuntime, song: string): void => {
  runtime.sounds.push(song);
};

const scriptContextSetupScript = (runtime: FldEffRockSmashRuntime, script: string): void => {
  runtime.scriptsSetup.push(script);
};

const scriptContextEnable = (runtime: FldEffRockSmashRuntime): void => {
  runtime.scriptContextEnabled += 1;
};

const callFldEffFuncInData = (runtime: FldEffRockSmashRuntime): void => {
  if (runtime.fieldEffectFuncInData === 'StartRockSmashFieldEffect') {
    startRockSmashFieldEffect(runtime);
  }
};

export function CheckObjectGraphicsInFrontOfPlayer(runtime: FldEffRockSmashRuntime, graphicsId: string | number): boolean {
  getXYCoordsOneStepInFrontOfPlayer(runtime);
  runtime.playerFacingPosition.elevation = playerGetElevation(runtime);
  const mapObjId = getObjectEventIdByPosition(
    runtime,
    runtime.playerFacingPosition.x,
    runtime.playerFacingPosition.y,
    runtime.playerFacingPosition.elevation
  );
  if (runtime.objectEvents[mapObjId].graphicsId !== graphicsId) {
    return false;
  }
  runtime.specialVarLastTalked = runtime.objectEvents[mapObjId].localId;
  return true;
}

export function CreateFieldEffectShowMon(runtime: FldEffRockSmashRuntime): number {
  getXYCoordsOneStepInFrontOfPlayer(runtime);
  return createTask(runtime, 'Task_FieldEffectShowMon_Init', 8);
}

export function Task_FieldEffectShowMon_Init(runtime: FldEffRockSmashRuntime, taskId: number): void {
  lockPlayerFieldControls(runtime);
  runtime.playerAvatar.preventStep = true;
  const mapObjId = runtime.playerAvatar.objectEventId;
  if (
    !objectEventIsMovementOverridden(runtime.objectEvents[mapObjId])
    || objectEventClearHeldMovementIfFinished(runtime.objectEvents[mapObjId])
  ) {
    if (runtime.mapHeader.mapType === MAP_TYPE_UNDERWATER) {
      fieldEffectStart(runtime, FLDEFF_FIELD_MOVE_SHOW_MON_INIT);
      runtime.tasks[taskId].func = 'Task_FieldEffectShowMon_WaitFldeff';
    } else {
      startPlayerAvatarSummonMonForFieldMoveAnim(runtime);
      objectEventSetHeldMovement(runtime.objectEvents[mapObjId], MOVEMENT_ACTION_START_ANIM_IN_DIRECTION);
      runtime.tasks[taskId].func = 'Task_FieldEffectShowMon_WaitPlayerAnim';
    }
  }
}

export function Task_FieldEffectShowMon_WaitPlayerAnim(runtime: FldEffRockSmashRuntime, taskId: number): void {
  if (objectEventCheckHeldMovementStatus(runtime.objectEvents[runtime.playerAvatar.objectEventId]) === true) {
    fieldEffectStart(runtime, FLDEFF_FIELD_MOVE_SHOW_MON_INIT);
    runtime.tasks[taskId].func = 'Task_FieldEffectShowMon_WaitFldeff';
  }
}

export function Task_FieldEffectShowMon_WaitFldeff(runtime: FldEffRockSmashRuntime, taskId: number): void {
  if (!fieldEffectActiveListContains(runtime, FLDEFF_FIELD_MOVE_SHOW_MON)) {
    runtime.fieldEffectArguments[1] = getPlayerFacingDirection(runtime);
    if (runtime.fieldEffectArguments[1] === DIR_SOUTH) runtime.fieldEffectArguments[2] = 0;
    if (runtime.fieldEffectArguments[1] === DIR_NORTH) runtime.fieldEffectArguments[2] = 1;
    if (runtime.fieldEffectArguments[1] === DIR_WEST) runtime.fieldEffectArguments[2] = 2;
    if (runtime.fieldEffectArguments[1] === DIR_EAST) runtime.fieldEffectArguments[2] = 3;
    objectEventSetGraphicsId(runtime.objectEvents[runtime.playerAvatar.objectEventId], getPlayerAvatarGraphicsIdByCurrentState());
    startSpriteAnim(runtime.sprites[runtime.playerAvatar.spriteId], runtime.fieldEffectArguments[2]);
    fieldEffectActiveListRemove(runtime, FLDEFF_FIELD_MOVE_SHOW_MON);
    runtime.tasks[taskId].func = 'Task_FieldEffectShowMon_Cleanup';
  }
}

export function Task_FieldEffectShowMon_Cleanup(runtime: FldEffRockSmashRuntime, taskId: number): void {
  callFldEffFuncInData(runtime);
  runtime.playerAvatar.preventStep = false;
  destroyTask(runtime, taskId);
}

export function SetUpFieldMove_RockSmash(runtime: FldEffRockSmashRuntime): boolean {
  if (CheckObjectGraphicsInFrontOfPlayer(runtime, OBJ_EVENT_GFX_ROCK_SMASH_ROCK) === true) {
    runtime.fieldCallback2 = 'FieldCallback_PrepareFadeInFromMenu';
    runtime.postMenuFieldCallback = 'FieldCallback_UseRockSmash';
    return true;
  }
  return false;
}

export function FieldCallback_UseRockSmash(runtime: FldEffRockSmashRuntime): void {
  runtime.fieldEffectArguments[0] = runtime.cursorSelectionMonId;
  scriptContextSetupScript(runtime, 'EventScript_FldEffRockSmash');
}

export function FldEff_UseRockSmash(runtime: FldEffRockSmashRuntime): boolean {
  CreateFieldEffectShowMon(runtime);
  runtime.fieldEffectFuncInData = 'StartRockSmashFieldEffect';
  incrementGameStat(runtime, GAME_STAT_USED_ROCK_SMASH);
  return false;
}

export function StartRockSmashFieldEffect(runtime: FldEffRockSmashRuntime): void {
  playSE(runtime, SE_M_ROCK_THROW);
  fieldEffectActiveListRemove(runtime, FLDEFF_USE_ROCK_SMASH);
  scriptContextEnable(runtime);
}

export const checkObjectGraphicsInFrontOfPlayer = CheckObjectGraphicsInFrontOfPlayer;
export const createFieldEffectShowMon = CreateFieldEffectShowMon;
export const taskFieldEffectShowMonInit = Task_FieldEffectShowMon_Init;
export const taskFieldEffectShowMonWaitPlayerAnim = Task_FieldEffectShowMon_WaitPlayerAnim;
export const taskFieldEffectShowMonWaitFldeff = Task_FieldEffectShowMon_WaitFldeff;
export const taskFieldEffectShowMonCleanup = Task_FieldEffectShowMon_Cleanup;
export const setUpFieldMoveRockSmash = SetUpFieldMove_RockSmash;
export const fieldCallbackUseRockSmash = FieldCallback_UseRockSmash;
export const fldEffUseRockSmash = FldEff_UseRockSmash;
export const startRockSmashFieldEffect = StartRockSmashFieldEffect;

export const doFieldEffectRockSmash = (
  runtime: LegacyRockSmashRuntime,
  _dialogue: DialogueState,
  session: FieldScriptSessionState
): void => {
  runtime.vars['gameStat.GAME_STAT_USED_ROCK_SMASH'] = (runtime.vars['gameStat.GAME_STAT_USED_ROCK_SMASH'] ?? 0) + 1;
  session.specialState = {
    kind: 'rockSmashFieldEffect'
  };
};
