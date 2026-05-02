export const OBJECT_EVENTS_COUNT = 16;
export const OBJECT_EVENT_TEMPLATES_COUNT = 64;
export const MAP_OFFSET = 7;

export interface QuestLogObjectEvent {
  active: boolean;
  triggerGroundEffectsOnStop: boolean;
  disableCoveringGroundEffects: boolean;
  landingJump: boolean;
  frozen: boolean;
  facingDirectionLocked: boolean;
  disableAnim: boolean;
  enableAnim: boolean;
  inanimate: boolean;
  invisible: boolean;
  offScreen: boolean;
  trackedByCamera: boolean;
  isPlayer: boolean;
  spriteAnimPausedBackup: boolean;
  spriteAffineAnimPausedBackup: boolean;
  disableJumpLandingGroundEffect: boolean;
  fixedPriority: boolean;
  facingDirection: number;
  currentElevation: number;
  previousElevation: number;
  graphicsId: number;
  movementType: number;
  trainerType: number;
  localId: number;
  mapNum: number;
  mapGroup: number;
  x: number;
  y: number;
  trainerRange_berryTreeId: number;
  previousMetatileBehavior: number;
  directionSequenceIndex: number;
  animId: number;
}

export interface RuntimeObjectEvent extends Omit<QuestLogObjectEvent, 'x' | 'y' | 'animId'> {
  currentCoords: { x: number; y: number };
  previousCoords: { x: number; y: number };
  initialCoords: { x: number; y: number };
  rangeX: number;
  rangeY: number;
  currentMetatileBehavior: number;
  playerCopyableMovement: number;
  fieldEffectSpriteId?: number;
}

export interface ObjectEventTemplateLike {
  localId: number;
  x: number;
  y: number;
  movementRangeX: number;
  movementRangeY: number;
}

export interface QuestLogSceneLike {
  objectEvents: QuestLogObjectEvent[];
}

export const createEmptyRuntimeObjectEvent = (): RuntimeObjectEvent => ({
  active: false,
  triggerGroundEffectsOnStop: false,
  disableCoveringGroundEffects: false,
  landingJump: false,
  frozen: false,
  facingDirectionLocked: false,
  disableAnim: false,
  enableAnim: false,
  inanimate: false,
  invisible: false,
  offScreen: false,
  trackedByCamera: false,
  isPlayer: false,
  spriteAnimPausedBackup: false,
  spriteAffineAnimPausedBackup: false,
  disableJumpLandingGroundEffect: false,
  fixedPriority: false,
  facingDirection: 0,
  currentElevation: 0,
  previousElevation: 0,
  graphicsId: 0,
  movementType: 0,
  trainerType: 0,
  localId: 0,
  mapNum: 0,
  mapGroup: 0,
  currentCoords: { x: 0, y: 0 },
  previousCoords: { x: 0, y: 0 },
  initialCoords: { x: 0, y: 0 },
  rangeX: 0,
  rangeY: 0,
  currentMetatileBehavior: 0,
  trainerRange_berryTreeId: 0,
  previousMetatileBehavior: 0,
  directionSequenceIndex: 0,
  playerCopyableMovement: 0
});

export const qlRecordObjects = (objectEvents: readonly RuntimeObjectEvent[]): QuestLogSceneLike => ({
  objectEvents: Array.from({ length: OBJECT_EVENTS_COUNT }, (_, i) => {
    const objectEvent = objectEvents[i] ?? createEmptyRuntimeObjectEvent();
    return {
      active: objectEvent.active,
      triggerGroundEffectsOnStop: objectEvent.triggerGroundEffectsOnStop,
      disableCoveringGroundEffects: objectEvent.disableCoveringGroundEffects,
      landingJump: objectEvent.landingJump,
      frozen: objectEvent.frozen,
      facingDirectionLocked: objectEvent.facingDirectionLocked,
      disableAnim: objectEvent.disableAnim,
      enableAnim: objectEvent.enableAnim,
      inanimate: objectEvent.inanimate,
      invisible: objectEvent.invisible,
      offScreen: objectEvent.offScreen,
      trackedByCamera: objectEvent.trackedByCamera,
      isPlayer: objectEvent.isPlayer,
      spriteAnimPausedBackup: objectEvent.spriteAnimPausedBackup,
      spriteAffineAnimPausedBackup: objectEvent.spriteAffineAnimPausedBackup,
      disableJumpLandingGroundEffect: objectEvent.disableJumpLandingGroundEffect,
      fixedPriority: objectEvent.fixedPriority,
      facingDirection: objectEvent.facingDirection,
      currentElevation: objectEvent.currentElevation,
      previousElevation: objectEvent.previousElevation,
      graphicsId: objectEvent.graphicsId,
      movementType: objectEvent.movementType,
      trainerType: objectEvent.trainerType,
      localId: objectEvent.localId,
      mapNum: objectEvent.mapNum,
      mapGroup: objectEvent.mapGroup,
      x: objectEvent.currentCoords.x,
      y: objectEvent.currentCoords.y,
      trainerRange_berryTreeId: objectEvent.trainerRange_berryTreeId,
      previousMetatileBehavior: objectEvent.previousMetatileBehavior,
      directionSequenceIndex: objectEvent.directionSequenceIndex,
      animId: objectEvent.playerCopyableMovement
    };
  })
});

const findPreviousCoords = (
  x: number,
  y: number,
  previousBehavior: number,
  getMetatileBehaviorAt: (x: number, y: number) => number
): { x: number; y: number } => {
  const candidates = [
    { x, y },
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 }
  ];
  return candidates.find((coord) => getMetatileBehaviorAt(coord.x, coord.y) === previousBehavior) ?? { x: 0, y: 0 };
};

export const qlLoadObjects = (
  questLog: QuestLogSceneLike,
  templates: readonly ObjectEventTemplateLike[],
  getMetatileBehaviorAt: (x: number, y: number) => number
): RuntimeObjectEvent[] => questLog.objectEvents.slice(0, OBJECT_EVENTS_COUNT).map((saved) => {
  const loaded = createEmptyRuntimeObjectEvent();
  loaded.active = saved.active;
  loaded.triggerGroundEffectsOnStop = saved.triggerGroundEffectsOnStop;
  loaded.disableCoveringGroundEffects = saved.disableCoveringGroundEffects;
  loaded.landingJump = saved.landingJump;
  loaded.frozen = saved.frozen;
  loaded.facingDirectionLocked = saved.facingDirectionLocked;
  loaded.disableAnim = saved.disableAnim;
  loaded.enableAnim = saved.enableAnim;
  loaded.inanimate = saved.inanimate;
  loaded.invisible = saved.invisible;
  loaded.offScreen = saved.offScreen;
  loaded.trackedByCamera = saved.trackedByCamera;
  loaded.isPlayer = saved.isPlayer;
  loaded.spriteAnimPausedBackup = saved.spriteAnimPausedBackup;
  loaded.spriteAffineAnimPausedBackup = saved.spriteAffineAnimPausedBackup;
  loaded.disableJumpLandingGroundEffect = saved.disableJumpLandingGroundEffect;
  loaded.fixedPriority = saved.fixedPriority;
  loaded.facingDirection = saved.facingDirection;
  loaded.currentElevation = saved.currentElevation;
  loaded.previousElevation = saved.previousElevation;
  loaded.graphicsId = saved.graphicsId;
  loaded.movementType = saved.movementType;
  loaded.trainerType = saved.trainerType;
  loaded.localId = saved.localId;
  loaded.mapNum = saved.mapNum;
  loaded.mapGroup = saved.mapGroup;
  loaded.currentCoords = { x: saved.x, y: saved.y };
  loaded.trainerRange_berryTreeId = saved.trainerRange_berryTreeId;
  loaded.previousMetatileBehavior = saved.previousMetatileBehavior;
  loaded.directionSequenceIndex = saved.directionSequenceIndex;
  loaded.playerCopyableMovement = saved.animId;

  const template = templates.slice(0, OBJECT_EVENT_TEMPLATES_COUNT).find((entry) => entry.localId === loaded.localId);
  if (template) {
    loaded.initialCoords = { x: template.x + MAP_OFFSET, y: template.y + MAP_OFFSET };
    loaded.rangeX = template.movementRangeX;
    loaded.rangeY = template.movementRangeY;
  }

  loaded.currentMetatileBehavior = getMetatileBehaviorAt(loaded.currentCoords.x, loaded.currentCoords.y);
  loaded.previousCoords = findPreviousCoords(
    loaded.currentCoords.x,
    loaded.currentCoords.y,
    loaded.previousMetatileBehavior,
    getMetatileBehaviorAt
  );
  return loaded;
});

export const qlTryStopSurfing = (
  questLogState: 'playback' | 'recording' | 'none',
  player: { avatarMode?: string; transitionFlags?: string; fieldEffectSpriteDestroyed?: boolean },
  objectEvent: RuntimeObjectEvent,
  destCoords: { x: number; y: number },
  getMetatileBehaviorAt: (x: number, y: number) => number,
  isSurfable: (behavior: number) => boolean
): void => {
  if (
    questLogState === 'playback'
    && !isSurfable(getMetatileBehaviorAt(destCoords.x, destCoords.y))
    && player.avatarMode === 'surfing'
  ) {
    player.avatarMode = 'normal';
    player.transitionFlags = 'PLAYER_AVATAR_FLAG_ON_FOOT';
    player.fieldEffectSpriteDestroyed = objectEvent.fieldEffectSpriteId !== undefined;
  }
};

export function QL_RecordObjects(objectEvents: readonly RuntimeObjectEvent[]): QuestLogSceneLike { return qlRecordObjects(objectEvents); }
export function QL_LoadObjects(
  questLog: QuestLogSceneLike,
  templates: readonly ObjectEventTemplateLike[],
  getMetatileBehaviorAt: (x: number, y: number) => number
): RuntimeObjectEvent[] {
  return qlLoadObjects(questLog, templates, getMetatileBehaviorAt);
}
export function QL_TryStopSurfing(
  questLogState: 'playback' | 'recording' | 'none',
  player: { avatarMode?: string; transitionFlags?: string; fieldEffectSpriteDestroyed?: boolean },
  objectEvent: RuntimeObjectEvent,
  destCoords: { x: number; y: number },
  getMetatileBehaviorAt: (x: number, y: number) => number,
  isSurfable: (behavior: number) => boolean
): void {
  qlTryStopSurfing(questLogState, player, objectEvent, destCoords, getMetatileBehaviorAt, isSurfable);
}
