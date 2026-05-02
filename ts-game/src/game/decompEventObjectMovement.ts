export const OBJECT_EVENTS_COUNT = 16;
export const VIRTUAL_OBJECTS_COUNT = 16;
export const MAX_SPRITES = 64;
export const MAP_OFFSET = 7;
export const OBJ_EVENT_GFX_LITTLE_BOY = 16;
export const NUM_OBJ_EVENT_GFX = 152;
export const OBJ_EVENT_GFX_VARS = 240;
export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export interface ObjectEventTemplate {
  localId: number;
  mapNum: number;
  mapGroup: number;
  x: number;
  y: number;
  script?: string;
  elevation?: number;
  movementType?: number;
  graphicsId?: number;
  trainerType?: number;
  flagId?: number;
  berryTreeId?: number;
  boulderRevealFlag?: number;
  invisible?: boolean;
  kind?: number | string;
}

export interface EventSprite {
  id: number;
  x: number;
  y: number;
  data: number[];
  invisible: boolean;
  animNum: number;
  animPaused: boolean;
  subpriority: number;
  priority: number;
  destroyed: boolean;
  callback?: string;
  anims?: unknown;
}

export interface ObjectEventGraphicsInfo {
  id: number;
  size?: number;
  inanimate?: boolean;
  [key: string]: unknown;
}

export interface StepAnimTable {
  anims: unknown;
  [key: string]: unknown;
}

export interface ObjectEvent {
  active: boolean;
  localId: number;
  mapNum: number;
  mapGroup: number;
  currentCoords: { x: number; y: number };
  previousCoords: { x: number; y: number };
  initialCoords: { x: number; y: number };
  range: { x: number; y: number };
  graphicsId: number;
  dynamicGraphicsId: number;
  movementType: number;
  movementActionId: number;
  movementStep: number;
  movementDirection: number;
  facingDirection: number;
  elevation: number;
  previousElevation: number;
  spriteId: number;
  invisible: boolean;
  frozen: boolean;
  singleMovementActive: boolean;
  singleMovementFinished: boolean;
  heldMovementActive: boolean;
  heldMovementFinished: boolean;
  offscreen: boolean;
  fixedPriority: boolean;
  triggerGroundEffectsOnMove: boolean;
  disableCoveringGroundEffects: boolean;
  groundEffectFlags: number;
  currentMetatileBehavior: number;
  previousMetatileBehavior: number;
  fieldEffectSpriteId: number;
  trainerType: number;
  flagId: number;
  berryTreeId: number;
  boulderRevealFlag: number;
}

export interface EventObjectMovementRuntime {
  objectEvents: ObjectEvent[];
  templates: ObjectEventTemplate[];
  sprites: EventSprite[];
  virtualObjects: EventSprite[];
  operations: string[];
  hiddenFlags: Set<number>;
  loadedPalettes: Map<number, number>;
  camera: { x: number; y: number; followedObjectId: number | null; spriteId: number | null; state: number };
  playerAvatar: { objectEventId: number | null; spriteId: number | null };
  map: { num: number; group: number; width: number; height: number };
  randomSeed: number;
  currentReflectionType: number;
  currentSpecialObjectPaletteTag: number;
  objectEventGraphicsInfoPointers?: ObjectEventGraphicsInfo[];
  objectEventGraphicsVars?: number[];
  stepAnimTables?: StepAnimTable[];
}

let activeRuntime: EventObjectMovementRuntime | null = null;

export const createObjectEvent = (overrides: Partial<ObjectEvent> = {}): ObjectEvent => ({
  active: false,
  localId: 0,
  mapNum: 0,
  mapGroup: 0,
  currentCoords: { x: 0, y: 0 },
  previousCoords: { x: 0, y: 0 },
  initialCoords: { x: 0, y: 0 },
  range: { x: 0, y: 0 },
  graphicsId: 0,
  dynamicGraphicsId: 0,
  movementType: 0,
  movementActionId: 0,
  movementStep: 0,
  movementDirection: DIR_SOUTH,
  facingDirection: DIR_SOUTH,
  elevation: 0,
  previousElevation: 0,
  spriteId: 0xff,
  invisible: false,
  frozen: false,
  singleMovementActive: false,
  singleMovementFinished: true,
  heldMovementActive: false,
  heldMovementFinished: true,
  offscreen: false,
  fixedPriority: false,
  triggerGroundEffectsOnMove: true,
  disableCoveringGroundEffects: false,
  groundEffectFlags: 0,
  currentMetatileBehavior: 0,
  previousMetatileBehavior: 0,
  fieldEffectSpriteId: 0xff,
  trainerType: 0,
  flagId: 0,
  berryTreeId: 0,
  boulderRevealFlag: 0,
  ...overrides
});

export const createEventSprite = (overrides: Partial<EventSprite> = {}): EventSprite => ({
  id: 0,
  x: 0,
  y: 0,
  data: [0, 0, 0, 0, 0, 0, 0, 0],
  invisible: false,
  animNum: 0,
  animPaused: false,
  subpriority: 0,
  priority: 2,
  destroyed: false,
  ...overrides
});

export const createEventObjectMovementRuntime = (overrides: Partial<EventObjectMovementRuntime> = {}): EventObjectMovementRuntime => {
  const runtime: EventObjectMovementRuntime = {
    objectEvents: Array.from({ length: OBJECT_EVENTS_COUNT }, () => createObjectEvent()),
    templates: [],
    sprites: [],
    virtualObjects: [],
    operations: [],
    hiddenFlags: new Set(),
    loadedPalettes: new Map(),
    camera: { x: 0, y: 0, followedObjectId: null, spriteId: null, state: 0 },
    playerAvatar: { objectEventId: null, spriteId: null },
    map: { num: 0, group: 0, width: 100, height: 100 },
    randomSeed: 1,
    currentReflectionType: 0,
    currentSpecialObjectPaletteTag: 0,
    ...overrides
  };
  activeRuntime = runtime;
  return runtime;
};

const isRuntime = (value: unknown): value is EventObjectMovementRuntime =>
  !!value && typeof value === 'object' && 'objectEvents' in value && 'operations' in value;

const runtimeFrom = (args: unknown[]): EventObjectMovementRuntime => {
  if (isRuntime(args[0])) return args.shift() as EventObjectMovementRuntime;
  if (!activeRuntime) throw new Error('event object movement runtime is not active');
  return activeRuntime;
};

const asObjectEvent = (runtime: EventObjectMovementRuntime, value: unknown): ObjectEvent | null => {
  if (typeof value === 'number') return runtime.objectEvents[value] ?? null;
  if (value && typeof value === 'object' && 'currentCoords' in value) return value as ObjectEvent;
  return null;
};

const asSprite = (runtime: EventObjectMovementRuntime, value: unknown): EventSprite | null => {
  if (typeof value === 'number') return runtime.sprites[value] ?? runtime.virtualObjects[value] ?? null;
  if (value && typeof value === 'object' && 'data' in value) return value as EventSprite;
  return null;
};

const dirDelta = (direction: number): { dx: number; dy: number } => {
  if (direction === DIR_NORTH) return { dx: 0, dy: -1 };
  if (direction === DIR_SOUTH) return { dx: 0, dy: 1 };
  if (direction === DIR_WEST) return { dx: -1, dy: 0 };
  if (direction === DIR_EAST) return { dx: 1, dy: 0 };
  return { dx: 0, dy: 0 };
};

const cloneTemplateToObjectEvent = (template: ObjectEventTemplate, slot: number): ObjectEvent => createObjectEvent({
  active: true,
  localId: template.localId,
  mapNum: template.mapNum,
  mapGroup: template.mapGroup,
  currentCoords: { x: template.x, y: template.y },
  previousCoords: { x: template.x, y: template.y },
  initialCoords: { x: template.x, y: template.y },
  graphicsId: template.graphicsId ?? 0,
  dynamicGraphicsId: template.graphicsId ?? 0,
  movementType: template.movementType ?? 0,
  elevation: template.elevation ?? 0,
  previousElevation: template.elevation ?? 0,
  spriteId: slot,
  invisible: template.invisible ?? false,
  trainerType: template.trainerType ?? 0,
  flagId: template.flagId ?? 0,
  berryTreeId: template.berryTreeId ?? 0,
  boulderRevealFlag: template.boulderRevealFlag ?? 0
});

const ensureSpriteForObject = (runtime: EventObjectMovementRuntime, objectEvent: ObjectEvent): EventSprite => {
  const id = objectEvent.spriteId === 0xff ? runtime.sprites.length : objectEvent.spriteId;
  objectEvent.spriteId = id;
  const sprite = runtime.sprites[id] ?? createEventSprite({ id });
  sprite.id = id;
  sprite.x = objectEvent.currentCoords.x;
  sprite.y = objectEvent.currentCoords.y;
  sprite.invisible = objectEvent.invisible;
  sprite.data[0] = runtime.objectEvents.indexOf(objectEvent);
  runtime.sprites[id] = sprite;
  return sprite;
};

const findTemplate = (runtime: EventObjectMovementRuntime, localId: number, mapNum = runtime.map.num, mapGroup = runtime.map.group): ObjectEventTemplate | null =>
  runtime.templates.find(t => t.localId === localId && t.mapNum === mapNum && t.mapGroup === mapGroup) ?? null;

const firstInactiveObjectId = (runtime: EventObjectMovementRuntime): number => runtime.objectEvents.findIndex(o => !o.active);

const findObjectId = (runtime: EventObjectMovementRuntime, localId: number, mapNum = runtime.map.num, mapGroup = runtime.map.group): number =>
  runtime.objectEvents.findIndex(o => o.active && o.localId === localId && o.mapNum === mapNum && o.mapGroup === mapGroup);

const findObjectIdByXY = (runtime: EventObjectMovementRuntime, x: number, y: number, elevation?: number): number =>
  runtime.objectEvents.findIndex(o => o.active && o.currentCoords.x === x && o.currentCoords.y === y && (elevation === undefined || o.elevation === elevation));

export function GetObjectEventGraphicsInfo(runtime: EventObjectMovementRuntime, graphicsId: number): ObjectEventGraphicsInfo {
  let id = graphicsId & 0xff;
  if (id >= OBJ_EVENT_GFX_VARS)
    id = runtime.objectEventGraphicsVars?.[id - OBJ_EVENT_GFX_VARS] ?? 0;
  if (id >= NUM_OBJ_EVENT_GFX)
    id = OBJ_EVENT_GFX_LITTLE_BOY;
  runtime.objectEventGraphicsInfoPointers ??= Array.from({ length: NUM_OBJ_EVENT_GFX }, (_v, i) => ({ id: i }));
  return runtime.objectEventGraphicsInfoPointers[id] ?? (runtime.objectEventGraphicsInfoPointers[id] = { id });
}

export function FindCameraObject(runtime: EventObjectMovementRuntime): EventSprite | null {
  for (let i = 0; i < MAX_SPRITES; i += 1) {
    const sprite = runtime.sprites[i];
    if (sprite && !sprite.destroyed && sprite.callback === 'ObjectCB_CameraObject')
      return sprite;
  }
  return null;
}

export function FindObjectEventTemplateByLocalId(localId: number, templates: ObjectEventTemplate[], count: number): ObjectEventTemplate | null {
  for (let i = 0; i < count; i += 1) {
    if (templates[i]?.localId === (localId & 0xff))
      return templates[i]!;
  }
  return null;
}

export function GetObjectEventTemplateByLocalIdAndMap(
  runtime: EventObjectMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): ObjectEventTemplate | null {
  const templates = runtime.templates.filter(template => template.mapNum === (mapNum & 0xff) && template.mapGroup === (mapGroup & 0xff));
  return FindObjectEventTemplateByLocalId(localId, templates, templates.length);
}

export function GetObjectEventScriptPointerByLocalIdAndMap(
  runtime: EventObjectMovementRuntime,
  localId: number,
  mapNum: number,
  mapGroup: number
): string | null {
  return GetObjectEventTemplateByLocalIdAndMap(runtime, localId, mapNum, mapGroup)?.script ?? null;
}

export function GetObjectEventScriptPointerByObjectEventId(runtime: EventObjectMovementRuntime, objectEventId: number): string | null {
  const objectEvent = runtime.objectEvents[objectEventId & 0xff];
  if (!objectEvent)
    return null;
  return GetObjectEventScriptPointerByLocalIdAndMap(runtime, objectEvent.localId, objectEvent.mapNum, objectEvent.mapGroup);
}

export function GetBaseTemplateForObjectEvent(runtime: EventObjectMovementRuntime, objectEvent: ObjectEvent): ObjectEventTemplate | null {
  if (objectEvent.mapNum !== runtime.map.num || objectEvent.mapGroup !== runtime.map.group)
    return null;
  for (let i = 0; i < runtime.templates.length; i += 1) {
    const template = runtime.templates[i];
    if (template?.localId === objectEvent.localId && objectEvent.mapNum === runtime.map.num && objectEvent.mapGroup === runtime.map.group)
      return template;
  }
  return null;
}

export function GetStepAnimTable(runtime: EventObjectMovementRuntime, anims: unknown): StepAnimTable | null {
  for (const stepTable of runtime.stepAnimTables ?? []) {
    if (stepTable.anims === anims)
      return stepTable;
  }
  return null;
}

const stepObject = (objectEvent: ObjectEvent, direction = objectEvent.movementDirection, distance = 1): void => {
  const delta = dirDelta(direction);
  objectEvent.previousCoords = { ...objectEvent.currentCoords };
  objectEvent.currentCoords.x += delta.dx * distance;
  objectEvent.currentCoords.y += delta.dy * distance;
  objectEvent.movementDirection = direction;
  objectEvent.facingDirection = direction || objectEvent.facingDirection;
  objectEvent.singleMovementFinished = true;
  objectEvent.heldMovementFinished = true;
};

const applyGroundEffect = (runtime: EventObjectMovementRuntime, objectEvent: ObjectEvent | null, name: string, flag = 1): number => {
  if (objectEvent) objectEvent.groundEffectFlags |= flag;
  runtime.operations.push(name);
  return flag;
};

const generic = (name: string, category: string) => (...input: unknown[]): unknown => {
  const args = [...input];
  const runtime = runtimeFrom(args);
  const objectEvent = asObjectEvent(runtime, args[0]);
  const sprite = objectEvent ? asSprite(runtime, args[1]) : asSprite(runtime, args[0]) ?? asSprite(runtime, args[1]);
  runtime.operations.push([name, ...args.map(String)].join(':'));

  switch (name) {
    case 'ClearObjectEvent': if (objectEvent) Object.assign(objectEvent, createObjectEvent()); return undefined;
    case 'ClearAllObjectEvents': runtime.objectEvents = Array.from({ length: OBJECT_EVENTS_COUNT }, () => createObjectEvent()); return undefined;
    case 'ResetObjectEvents': runtime.objectEvents.forEach(o => Object.assign(o, createObjectEvent())); runtime.sprites = []; return undefined;
    case 'GetFirstInactiveObjectEventId': return firstInactiveObjectId(runtime) < 0 ? OBJECT_EVENTS_COUNT : firstInactiveObjectId(runtime);
    case 'GetAvailableObjectEventId': return firstInactiveObjectId(runtime) >= 0;
    case 'GetObjectEventIdByLocalIdAndMap': case 'TryGetObjectEventIdByLocalIdAndMap': case 'GetObjectEventIdByLocalIdAndMapInternal': return findObjectId(runtime, Number(args[0]), Number(args[1] ?? runtime.map.num), Number(args[2] ?? runtime.map.group));
    case 'GetObjectEventIdByLocalId': return findObjectId(runtime, Number(args[0]));
    case 'GetObjectEventIdByXY': case 'GetObjectEventIdByPosition': return findObjectIdByXY(runtime, Number(args[0]), Number(args[1]), args[2] === undefined ? undefined : Number(args[2]));
    case 'InitObjectEventStateFromTemplate': {
      const template = args[0] as ObjectEventTemplate;
      const slot = typeof args[1] === 'number' ? args[1] : firstInactiveObjectId(runtime);
      if (!template || slot < 0) return OBJECT_EVENTS_COUNT;
      runtime.objectEvents[slot] = cloneTemplateToObjectEvent(template, slot);
      ensureSpriteForObject(runtime, runtime.objectEvents[slot]!);
      return slot;
    }
    case 'ShouldInitObjectEventStateFromTemplate': return !!args[0] && !runtime.hiddenFlags.has(Number((args[0] as ObjectEventTemplate).flagId ?? -1));
    case 'SetHideObstacleFlag': if (args[0]) runtime.hiddenFlags.add(Number((args[0] as ObjectEventTemplate).flagId ?? args[0])); return undefined;
    case 'TrySpawnObjectEventTemplate': case 'TrySpawnObjectEvent': case 'SpawnSpecialObjectEvent': {
      const template = typeof args[0] === 'number' ? findTemplate(runtime, args[0]) : args[0] as ObjectEventTemplate | null;
      if (!template) return OBJECT_EVENTS_COUNT;
      const slot = firstInactiveObjectId(runtime);
      if (slot < 0) return OBJECT_EVENTS_COUNT;
      runtime.objectEvents[slot] = cloneTemplateToObjectEvent(template, slot);
      ensureSpriteForObject(runtime, runtime.objectEvents[slot]!);
      return slot;
    }
    case 'RemoveObjectEvent': case 'RemoveObjectEventInternal': if (objectEvent) Object.assign(objectEvent, createObjectEvent()); return undefined;
    case 'RemoveObjectEventByLocalIdAndMap': { const id = findObjectId(runtime, Number(args[0]), Number(args[1] ?? runtime.map.num), Number(args[2] ?? runtime.map.group)); if (id >= 0) Object.assign(runtime.objectEvents[id]!, createObjectEvent()); return id >= 0; }
    case 'ObjectEventSetGraphicsId': if (objectEvent) { objectEvent.graphicsId = Number(args[1]); objectEvent.dynamicGraphicsId = Number(args[1]); } return undefined;
    case 'ObjectEventSetGraphicsIdByLocalIdAndMap': { const id = findObjectId(runtime, Number(args[0]), Number(args[2] ?? runtime.map.num), Number(args[3] ?? runtime.map.group)); if (id >= 0) runtime.objectEvents[id]!.graphicsId = Number(args[1]); return id >= 0; }
    case 'SetObjectEventDynamicGraphicsId': if (objectEvent) objectEvent.dynamicGraphicsId = objectEvent.graphicsId; return undefined;
    case 'SetObjectInvisibility': if (objectEvent) { objectEvent.invisible = Boolean(args[1]); const s = ensureSpriteForObject(runtime, objectEvent); s.invisible = objectEvent.invisible; } return undefined;
    case 'ObjectEventTurn': case 'SetObjectEventDirection': if (objectEvent) { objectEvent.facingDirection = Number(args[1] ?? args[0] ?? objectEvent.facingDirection); objectEvent.movementDirection = objectEvent.facingDirection; } return undefined;
    case 'ObjectEventTurnByLocalIdAndMap': { const id = findObjectId(runtime, Number(args[0]), Number(args[2] ?? runtime.map.num), Number(args[3] ?? runtime.map.group)); if (id >= 0) runtime.objectEvents[id]!.facingDirection = Number(args[1]); return id >= 0; }
    case 'PlayerObjectTurn': { const id = runtime.playerAvatar.objectEventId; if (id !== null && runtime.objectEvents[id]) runtime.objectEvents[id]!.facingDirection = Number(args[0]); return undefined; }
    case 'ObjectEventGetLocalIdAndMap': return objectEvent ? [objectEvent.localId, objectEvent.mapNum, objectEvent.mapGroup] : null;
    case 'SetObjectSubpriority': if (sprite) sprite.subpriority = Number(args[1] ?? 0); return undefined;
    case 'ResetObjectSubpriority': if (sprite) sprite.subpriority = 0; return undefined;
    case 'SetObjectPositionByLocalIdAndMap': { const id = findObjectId(runtime, Number(args[0]), Number(args[3] ?? runtime.map.num), Number(args[4] ?? runtime.map.group)); if (id >= 0) { const o = runtime.objectEvents[id]!; o.previousCoords = { ...o.currentCoords }; o.currentCoords = { x: Number(args[1]), y: Number(args[2]) }; ensureSpriteForObject(runtime, o); } return id >= 0; }
    case 'IncrementObjectEventCoords': if (objectEvent) stepObject(objectEvent, Number(args[1] ?? objectEvent.movementDirection)); return undefined;
    case 'ShiftObjectEventCoords': if (objectEvent) { objectEvent.currentCoords.x += Number(args[1] ?? 0); objectEvent.currentCoords.y += Number(args[2] ?? 0); } return undefined;
    case 'SetObjectEventCoords': case 'MoveObjectEventToMapCoords': case 'TryMoveObjectEventToMapCoords': if (objectEvent) { objectEvent.previousCoords = { ...objectEvent.currentCoords }; objectEvent.currentCoords = { x: Number(args[1]), y: Number(args[2]) }; ensureSpriteForObject(runtime, objectEvent); return true; } return false;
    case 'ShiftStillObjectEventCoords': case 'UpdateObjectEventCoordsForCameraUpdate': if (objectEvent) { objectEvent.currentCoords.x += runtime.camera.x; objectEvent.currentCoords.y += runtime.camera.y; } return undefined;
    case 'AddCameraObject': runtime.camera.spriteId = runtime.sprites.length; runtime.sprites.push(createEventSprite({ id: runtime.camera.spriteId, callback: 'ObjectCB_CameraObject' })); return runtime.camera.spriteId;
    case 'CameraObjectSetFollowedObjectId': runtime.camera.followedObjectId = Number(args[0]); return undefined;
    case 'CameraObjectGetFollowedObjectId': return runtime.camera.followedObjectId;
    case 'CameraObjectReset1': case 'CameraObjectReset2': runtime.camera = { ...runtime.camera, x: 0, y: 0, state: 0, followedObjectId: null }; return undefined;
    case 'CopySprite': return sprite ? { ...sprite, data: [...sprite.data] } : null;
    case 'CreateCopySpriteAt': { const src = asSprite(runtime, args[0]); const copy = createEventSprite({ ...(src ?? {}), id: runtime.sprites.length, x: Number(args[1] ?? src?.x ?? 0), y: Number(args[2] ?? src?.y ?? 0), data: [...(src?.data ?? [0,0,0,0,0,0,0,0])] }); runtime.sprites.push(copy); return copy.id; }
    case 'GetObjectEventFlagIdByLocalIdAndMap': { const t = findTemplate(runtime, Number(args[0]), Number(args[1] ?? runtime.map.num), Number(args[2] ?? runtime.map.group)); return t?.flagId ?? 0; }
    case 'GetObjectEventFlagIdByObjectEventId': return runtime.objectEvents[Number(args[0])]?.flagId ?? 0;
    case 'GetObjectTrainerTypeByLocalIdAndMap': case 'GetObjectTrainerTypeByObjectEventId': return (objectEvent ?? runtime.objectEvents[Number(args[0])] ?? findTemplate(runtime, Number(args[0])) as any)?.trainerType ?? 0;
    case 'GetObjectEventBerryTreeIdByLocalIdAndMap': return findTemplate(runtime, Number(args[0]), Number(args[1] ?? runtime.map.num), Number(args[2] ?? runtime.map.group))?.berryTreeId ?? 0;
    case 'GetObjectEventBerryTreeId': return objectEvent?.berryTreeId ?? 0;
    case 'GetBoulderRevealFlagByLocalIdAndMap': return findTemplate(runtime, Number(args[0]), Number(args[1] ?? runtime.map.num), Number(args[2] ?? runtime.map.group))?.boulderRevealFlag ?? 0;
    case 'OverrideTemplateCoordsForObjectEvent': if (objectEvent) { objectEvent.initialCoords = { x: Number(args[1]), y: Number(args[2]) }; } return undefined;
    case 'OverrideMovementTypeForObjectEvent': if (objectEvent) objectEvent.movementType = Number(args[1]); return undefined;
    case 'GetVectorDirection': return Math.abs(Number(args[0])) > Math.abs(Number(args[1])) ? (Number(args[0]) < 0 ? DIR_WEST : DIR_EAST) : (Number(args[1]) < 0 ? DIR_NORTH : DIR_SOUTH);
    case 'GetLimitedVectorDirection_SouthNorth': return Number(args[1]) < 0 ? DIR_NORTH : DIR_SOUTH;
    case 'GetLimitedVectorDirection_WestEast': return Number(args[0]) < 0 ? DIR_WEST : DIR_EAST;
    case 'SetPlayerAvatarObjectEventIdAndObjectId': runtime.playerAvatar.objectEventId = Number(args[0]); runtime.playerAvatar.spriteId = Number(args[1]); return undefined;
    case 'ObjectEventDoesElevationMatch': return objectEvent ? objectEvent.elevation === Number(args[1]) || objectEvent.elevation === 0 || Number(args[1]) === 0 : false;
    case 'AreElevationsCompatible': return Number(args[0]) === Number(args[1]) || Number(args[0]) === 0 || Number(args[1]) === 0;
    case 'ElevationToPriority': return Number(args[0]) >= 3 ? 1 : 2;
    case 'UpdateObjectEventElevationAndPriority': case 'ObjectEventUpdateElevation': if (objectEvent) { objectEvent.previousElevation = objectEvent.elevation; objectEvent.elevation = Number(args[1] ?? objectEvent.elevation); } return undefined;
    case 'FreezeObjectEvent': if (objectEvent) objectEvent.frozen = true; return undefined;
    case 'FreezeObjectEvents': runtime.objectEvents.forEach(o => { if (o.active) o.frozen = true; }); return undefined;
    case 'FreezeObjectEventsExceptOne': runtime.objectEvents.forEach((o, i) => { if (o.active && i !== Number(args[0])) o.frozen = true; }); return undefined;
    case 'UnfreezeObjectEvent': if (objectEvent) objectEvent.frozen = false; return undefined;
    case 'UnfreezeObjectEvents': runtime.objectEvents.forEach(o => { o.frozen = false; }); return undefined;
    case 'CreateVirtualObject': case 'CreateFameCheckerObject': { const id = runtime.virtualObjects.length; runtime.virtualObjects.push(createEventSprite({ id, x: Number(args[0] ?? 0), y: Number(args[1] ?? 0) })); return id; }
    case 'DestroyVirtualObjects': runtime.virtualObjects = []; return undefined;
    case 'TurnVirtualObject': { const v = runtime.virtualObjects[Number(args[0])]; if (v) v.animNum = Number(args[1]); return undefined; }
    case 'SetVirtualObjectGraphics': { const v = runtime.virtualObjects[Number(args[0])]; if (v) v.data[1] = Number(args[1]); return undefined; }
    case 'SetVirtualObjectInvisibility': { const v = runtime.virtualObjects[Number(args[0])]; if (v) v.invisible = Boolean(args[1]); return undefined; }
    case 'IsVirtualObjectInvisible': return runtime.virtualObjects[Number(args[0])]?.invisible ?? true;
    case 'SetVirtualObjectSpriteAnim': { const v = runtime.virtualObjects[Number(args[0])]; if (v) v.animNum = Number(args[1]); return undefined; }
    case 'IsVirtualObjectAnimating': return !(runtime.virtualObjects[Number(args[0])]?.animPaused ?? true);
    case 'MoveUnionRoomObjectUp': { const v = runtime.virtualObjects[Number(args[0])]; if (v) v.y -= 1; return undefined; }
    case 'MoveUnionRoomObjectDown': { const v = runtime.virtualObjects[Number(args[0])]; if (v) v.y += 1; return undefined; }
    case 'LoadObjectEventPalette': case 'TryLoadObjectPalette': runtime.loadedPalettes.set(Number(args[0]), runtime.loadedPalettes.size); return runtime.loadedPalettes.get(Number(args[0]));
    case 'FindObjectEventPaletteIndexByTag': return runtime.loadedPalettes.get(Number(args[0])) ?? 0xff;
    case 'GetReflectionEffectPaletteSlot': return (Number(args[0]) + 8) & 15;
    case 'SetMovementDelay': if (sprite) sprite.data[2] = Number(args[1] ?? args[0]); return undefined;
    case 'WaitForMovementDelay': if (sprite) { sprite.data[2] = Math.max(0, sprite.data[2] - 1); return sprite.data[2] === 0; } return true;
    case 'SetAndStartSpriteAnim': if (sprite) { sprite.animNum = Number(args[1]); sprite.animPaused = false; } return undefined;
    case 'SpriteAnimEnded': return sprite ? sprite.animPaused : true;
    case 'UpdateObjectEventSpriteInvisibility': if (objectEvent) ensureSpriteForObject(runtime, objectEvent).invisible = objectEvent.invisible; return undefined;
  }

  if (category === 'movementType') {
    if (objectEvent) { objectEvent.movementStep += 1; if (name.includes('Face')) objectEvent.facingDirection = objectEvent.movementDirection; if (name.includes('Walk') || name.includes('Wander')) stepObject(objectEvent); }
    return true;
  }
  if (category === 'movementAction') {
    if (objectEvent) { objectEvent.movementActionId = Number(args[1] ?? objectEvent.movementActionId); if (name.includes('Walk') || name.includes('Jump') || name.includes('Step')) stepObject(objectEvent); if (name.includes('Finish')) objectEvent.singleMovementFinished = true; }
    return true;
  }
  if (category === 'groundEffect') return applyGroundEffect(runtime, objectEvent, name, 1 << (runtime.operations.length % 24));
  if (category === 'step') { if (objectEvent) stepObject(objectEvent, Number(args[1] ?? objectEvent.movementDirection)); return true; }
  return undefined;
};

export const setup = generic('setup', 'generic');
export const ClearObjectEvent = generic('ClearObjectEvent', 'generic');
export const ClearAllObjectEvents = generic('ClearAllObjectEvents', 'generic');
export const ResetObjectEvents = generic('ResetObjectEvents', 'generic');
export const CreateReflectionEffectSprites = generic('CreateReflectionEffectSprites', 'generic');
export const GetFirstInactiveObjectEventId = generic('GetFirstInactiveObjectEventId', 'generic');
export const GetObjectEventIdByLocalIdAndMap = generic('GetObjectEventIdByLocalIdAndMap', 'generic');
export const TryGetObjectEventIdByLocalIdAndMap = generic('TryGetObjectEventIdByLocalIdAndMap', 'generic');
export const GetObjectEventIdByXY = generic('GetObjectEventIdByXY', 'generic');
export const GetObjectEventIdByLocalIdAndMapInternal = generic('GetObjectEventIdByLocalIdAndMapInternal', 'generic');
export const GetObjectEventIdByLocalId = generic('GetObjectEventIdByLocalId', 'generic');
export const InitObjectEventStateFromTemplate = generic('InitObjectEventStateFromTemplate', 'generic');
export const ShouldInitObjectEventStateFromTemplate = generic('ShouldInitObjectEventStateFromTemplate', 'generic');
export const TemplateIsObstacleAndWithinView = generic('TemplateIsObstacleAndWithinView', 'generic');
export const TemplateIsObstacleAndVisibleFromConnectingMap = generic('TemplateIsObstacleAndVisibleFromConnectingMap', 'generic');
export const SetHideObstacleFlag = generic('SetHideObstacleFlag', 'generic');
export const Unref_TryInitLocalObjectEvent = generic('Unref_TryInitLocalObjectEvent', 'generic');
export const GetAvailableObjectEventId = generic('GetAvailableObjectEventId', 'generic');
export const RemoveObjectEvent = generic('RemoveObjectEvent', 'generic');
export const RemoveObjectEventByLocalIdAndMap = generic('RemoveObjectEventByLocalIdAndMap', 'generic');
export const RemoveObjectEventInternal = generic('RemoveObjectEventInternal', 'generic');
export const Unref_RemoveAllObjectEventsExceptPlayer = generic('Unref_RemoveAllObjectEventsExceptPlayer', 'generic');
export const TrySetupObjectEventSprite = generic('TrySetupObjectEventSprite', 'generic');
export const TrySpawnObjectEventTemplate = generic('TrySpawnObjectEventTemplate', 'generic');
export const SpawnSpecialObjectEvent = generic('SpawnSpecialObjectEvent', 'generic');
export const SpawnSpecialObjectEventParameterized = (
  runtime: EventObjectMovementRuntime,
  graphicsId: number,
  movementBehavior: number,
  localId: number,
  x: number,
  y: number,
  elevation: number
): number => {
  const objectEventTemplate: ObjectEventTemplate = {
    localId: localId & 0xff,
    mapNum: runtime.map.num,
    mapGroup: runtime.map.group,
    graphicsId: graphicsId & 0xff,
    kind: 'OBJ_KIND_NORMAL',
    x: (x << 16 >> 16) - MAP_OFFSET,
    y: (y << 16 >> 16) - MAP_OFFSET,
    elevation: elevation & 0xff,
    movementType: movementBehavior & 0xff,
    trainerType: 0,
    flagId: 0,
  };
  return SpawnSpecialObjectEvent(runtime, objectEventTemplate) as number;
};
export const TrySpawnObjectEvent = generic('TrySpawnObjectEvent', 'generic');
export const CopyObjectGraphicsInfoToSpriteTemplate = generic('CopyObjectGraphicsInfoToSpriteTemplate', 'generic');
export const CopyObjectGraphicsInfoToSpriteTemplate_WithMovementType = generic('CopyObjectGraphicsInfoToSpriteTemplate_WithMovementType', 'generic');
export const MakeObjectTemplateFromObjectEventTemplate = generic('MakeObjectTemplateFromObjectEventTemplate', 'generic');
export const CreateObjectGraphicsSprite = generic('CreateObjectGraphicsSprite', 'generic');
export const CreateVirtualObject = generic('CreateVirtualObject', 'generic');
export const CreateFameCheckerObject = generic('CreateFameCheckerObject', 'generic');
export const TrySpawnObjectEvents = generic('TrySpawnObjectEvents', 'generic');
export const RemoveObjectEventsOutsideView = generic('RemoveObjectEventsOutsideView', 'generic');
export const RemoveObjectEventIfOutsideView = generic('RemoveObjectEventIfOutsideView', 'generic');
export const SpawnObjectEventsOnReturnToField = generic('SpawnObjectEventsOnReturnToField', 'generic');
export const SpawnObjectEventOnReturnToField = generic('SpawnObjectEventOnReturnToField', 'generic');
export const ResetObjectEventFldEffData = generic('ResetObjectEventFldEffData', 'generic');
export const SetPlayerAvatarObjectEventIdAndObjectId = generic('SetPlayerAvatarObjectEventIdAndObjectId', 'generic');
export const ObjectEventSetGraphicsId = generic('ObjectEventSetGraphicsId', 'generic');
export const ObjectEventSetGraphicsIdByLocalIdAndMap = generic('ObjectEventSetGraphicsIdByLocalIdAndMap', 'generic');
export const ObjectEventTurn = generic('ObjectEventTurn', 'generic');
export const ObjectEventTurnByLocalIdAndMap = generic('ObjectEventTurnByLocalIdAndMap', 'generic');
export const PlayerObjectTurn = generic('PlayerObjectTurn', 'generic');
export const SetObjectEventDynamicGraphicsId = generic('SetObjectEventDynamicGraphicsId', 'generic');
export const SetObjectInvisibility = generic('SetObjectInvisibility', 'generic');
export const ObjectEventGetLocalIdAndMap = generic('ObjectEventGetLocalIdAndMap', 'generic');
export const EnableObjectGroundEffectsByXY = generic('EnableObjectGroundEffectsByXY', 'groundEffect');
export const SetObjectSubpriority = generic('SetObjectSubpriority', 'generic');
export const ResetObjectSubpriority = generic('ResetObjectSubpriority', 'generic');
export const SetObjectPositionByLocalIdAndMap = generic('SetObjectPositionByLocalIdAndMap', 'generic');
export const FreeAndReserveObjectSpritePalettes = generic('FreeAndReserveObjectSpritePalettes', 'generic');
export const LoadObjectEventPalette = generic('LoadObjectEventPalette', 'generic');
export const LoadObjectEventPaletteSet = generic('LoadObjectEventPaletteSet', 'generic');
export const TryLoadObjectPalette = generic('TryLoadObjectPalette', 'generic');
export const PatchObjectPalette = generic('PatchObjectPalette', 'generic');
export const PatchObjectPaletteRange = generic('PatchObjectPaletteRange', 'generic');
export const FindObjectEventPaletteIndexByTag = generic('FindObjectEventPaletteIndexByTag', 'generic');
export const LoadPlayerObjectReflectionPalette = generic('LoadPlayerObjectReflectionPalette', 'generic');
export const LoadSpecialObjectReflectionPalette = generic('LoadSpecialObjectReflectionPalette', 'generic');
export const GetReflectionEffectPaletteSlot = generic('GetReflectionEffectPaletteSlot', 'generic');
export const IncrementObjectEventCoords = generic('IncrementObjectEventCoords', 'generic');
export const ShiftObjectEventCoords = generic('ShiftObjectEventCoords', 'generic');
export const SetObjectEventCoords = generic('SetObjectEventCoords', 'generic');
export const MoveObjectEventToMapCoords = generic('MoveObjectEventToMapCoords', 'generic');
export const TryMoveObjectEventToMapCoords = generic('TryMoveObjectEventToMapCoords', 'generic');
export const ShiftStillObjectEventCoords = generic('ShiftStillObjectEventCoords', 'generic');
export const UpdateObjectEventCoordsForCameraUpdate = generic('UpdateObjectEventCoordsForCameraUpdate', 'generic');
export const GetObjectEventIdByPosition = generic('GetObjectEventIdByPosition', 'generic');
export const ObjectEventDoesElevationMatch = generic('ObjectEventDoesElevationMatch', 'generic');
export const UpdateObjectEventsForCameraUpdate = generic('UpdateObjectEventsForCameraUpdate', 'generic');
export const AddCameraObject = generic('AddCameraObject', 'generic');
export const ObjectCB_CameraObject = generic('ObjectCB_CameraObject', 'generic');
export const CameraObject_0 = generic('CameraObject_0', 'generic');
export const CameraObject_1 = generic('CameraObject_1', 'generic');
export const CameraObject_2 = generic('CameraObject_2', 'generic');
export const CameraObjectReset1 = generic('CameraObjectReset1', 'generic');
export const CameraObjectSetFollowedObjectId = generic('CameraObjectSetFollowedObjectId', 'generic');
export const CameraObjectGetFollowedObjectId = generic('CameraObjectGetFollowedObjectId', 'generic');
export const CameraObjectReset2 = generic('CameraObjectReset2', 'generic');
export const CopySprite = generic('CopySprite', 'generic');
export const CreateCopySpriteAt = generic('CreateCopySpriteAt', 'generic');
export const SetObjectEventDirection = generic('SetObjectEventDirection', 'generic');
export const GetObjectEventFlagIdByLocalIdAndMap = generic('GetObjectEventFlagIdByLocalIdAndMap', 'generic');
export const GetObjectEventFlagIdByObjectEventId = generic('GetObjectEventFlagIdByObjectEventId', 'generic');
export const GetObjectTrainerTypeByLocalIdAndMap = generic('GetObjectTrainerTypeByLocalIdAndMap', 'generic');
export const GetBoulderRevealFlagByLocalIdAndMap = generic('GetBoulderRevealFlagByLocalIdAndMap', 'generic');
export const GetObjectTrainerTypeByObjectEventId = generic('GetObjectTrainerTypeByObjectEventId', 'generic');
export const GetObjectEventBerryTreeIdByLocalIdAndMap = generic('GetObjectEventBerryTreeIdByLocalIdAndMap', 'generic');
export const GetObjectEventBerryTreeId = generic('GetObjectEventBerryTreeId', 'generic');
export const OverrideTemplateCoordsForObjectEvent = generic('OverrideTemplateCoordsForObjectEvent', 'generic');
export const OverrideMovementTypeForObjectEvent = generic('OverrideMovementTypeForObjectEvent', 'generic');
export const TryOverrideObjectEventTemplateCoords = generic('TryOverrideObjectEventTemplateCoords', 'generic');
export const InitObjectEventPalettes = generic('InitObjectEventPalettes', 'generic');
export const GetObjectPaletteTag = generic('GetObjectPaletteTag', 'generic');
export const MovementType_WanderAround_Step0 = generic('MovementType_WanderAround_Step0', 'movementType');
export const MovementType_WanderAround_Step1 = generic('MovementType_WanderAround_Step1', 'movementType');
export const MovementType_WanderAround_Step2 = generic('MovementType_WanderAround_Step2', 'movementType');
export const MovementType_WanderAround_Step3 = generic('MovementType_WanderAround_Step3', 'movementType');
export const MovementType_WanderAround_Step4 = generic('MovementType_WanderAround_Step4', 'movementType');
export const MovementType_WanderAround_Step5 = generic('MovementType_WanderAround_Step5', 'movementType');
export const MovementType_WanderAround_Step5Slower = generic('MovementType_WanderAround_Step5Slower', 'movementType');
export const MovementType_WanderAround_Step6 = generic('MovementType_WanderAround_Step6', 'movementType');
export const ObjectEventIsTrainerAndCloseToPlayer = generic('ObjectEventIsTrainerAndCloseToPlayer', 'generic');
export const GetVectorDirection = generic('GetVectorDirection', 'generic');
export const GetLimitedVectorDirection_SouthNorth = generic('GetLimitedVectorDirection_SouthNorth', 'generic');
export const GetLimitedVectorDirection_WestEast = generic('GetLimitedVectorDirection_WestEast', 'generic');
export const GetLimitedVectorDirection_WestNorth = generic('GetLimitedVectorDirection_WestNorth', 'generic');
export const GetLimitedVectorDirection_EastNorth = generic('GetLimitedVectorDirection_EastNorth', 'generic');
export const GetLimitedVectorDirection_WestSouth = generic('GetLimitedVectorDirection_WestSouth', 'generic');
export const GetLimitedVectorDirection_EastSouth = generic('GetLimitedVectorDirection_EastSouth', 'generic');
export const GetLimitedVectorDirection_SouthNorthWest = generic('GetLimitedVectorDirection_SouthNorthWest', 'generic');
export const GetLimitedVectorDirection_SouthNorthEast = generic('GetLimitedVectorDirection_SouthNorthEast', 'generic');
export const GetLimitedVectorDirection_NorthWestEast = generic('GetLimitedVectorDirection_NorthWestEast', 'generic');
export const GetLimitedVectorDirection_SouthWestEast = generic('GetLimitedVectorDirection_SouthWestEast', 'generic');
export const TryGetTrainerEncounterDirection = generic('TryGetTrainerEncounterDirection', 'generic');
export const MovementType_LookAround_Step0 = generic('MovementType_LookAround_Step0', 'movementType');
export const MovementType_LookAround_Step1 = generic('MovementType_LookAround_Step1', 'movementType');
export const MovementType_LookAround_Step2 = generic('MovementType_LookAround_Step2', 'movementType');
export const MovementType_LookAround_Step3 = generic('MovementType_LookAround_Step3', 'movementType');
export const MovementType_LookAround_Step4 = generic('MovementType_LookAround_Step4', 'movementType');
export const MovementType_WanderUpAndDown_Step0 = generic('MovementType_WanderUpAndDown_Step0', 'movementType');
export const MovementType_WanderUpAndDown_Step1 = generic('MovementType_WanderUpAndDown_Step1', 'movementType');
export const MovementType_WanderUpAndDown_Step2 = generic('MovementType_WanderUpAndDown_Step2', 'movementType');
export const MovementType_WanderUpAndDown_Step3 = generic('MovementType_WanderUpAndDown_Step3', 'movementType');
export const MovementType_WanderUpAndDown_Step4 = generic('MovementType_WanderUpAndDown_Step4', 'movementType');
export const MovementType_WanderUpAndDown_Step5 = generic('MovementType_WanderUpAndDown_Step5', 'movementType');
export const MovementType_WanderUpAndDown_Step6 = generic('MovementType_WanderUpAndDown_Step6', 'movementType');
export const MovementType_WanderLeftAndRight_Step0 = generic('MovementType_WanderLeftAndRight_Step0', 'movementType');
export const MovementType_WanderLeftAndRight_Step1 = generic('MovementType_WanderLeftAndRight_Step1', 'movementType');
export const MovementType_WanderLeftAndRight_Step2 = generic('MovementType_WanderLeftAndRight_Step2', 'movementType');
export const MovementType_WanderLeftAndRight_Step3 = generic('MovementType_WanderLeftAndRight_Step3', 'movementType');
export const MovementType_WanderLeftAndRight_Step4 = generic('MovementType_WanderLeftAndRight_Step4', 'movementType');
export const MovementType_WanderLeftAndRight_Step5 = generic('MovementType_WanderLeftAndRight_Step5', 'movementType');
export const MovementType_WanderLeftAndRight_Step6 = generic('MovementType_WanderLeftAndRight_Step6', 'movementType');
export const MovementType_FaceDirection_Step0 = generic('MovementType_FaceDirection_Step0', 'movementType');
export const MovementType_FaceDirection_Step1 = generic('MovementType_FaceDirection_Step1', 'movementType');
export const MovementType_FaceDirection_Step2 = generic('MovementType_FaceDirection_Step2', 'movementType');
export const MovementType_FaceDownAndUp_Step0 = generic('MovementType_FaceDownAndUp_Step0', 'movementType');
export const MovementType_FaceDownAndUp_Step1 = generic('MovementType_FaceDownAndUp_Step1', 'movementType');
export const MovementType_FaceDownAndUp_Step2 = generic('MovementType_FaceDownAndUp_Step2', 'movementType');
export const MovementType_FaceDownAndUp_Step3 = generic('MovementType_FaceDownAndUp_Step3', 'movementType');
export const MovementType_FaceDownAndUp_Step4 = generic('MovementType_FaceDownAndUp_Step4', 'movementType');
export const MovementType_FaceLeftAndRight_Step0 = generic('MovementType_FaceLeftAndRight_Step0', 'movementType');
export const MovementType_FaceLeftAndRight_Step1 = generic('MovementType_FaceLeftAndRight_Step1', 'movementType');
export const MovementType_FaceLeftAndRight_Step2 = generic('MovementType_FaceLeftAndRight_Step2', 'movementType');
export const MovementType_FaceLeftAndRight_Step3 = generic('MovementType_FaceLeftAndRight_Step3', 'movementType');
export const MovementType_FaceLeftAndRight_Step4 = generic('MovementType_FaceLeftAndRight_Step4', 'movementType');
export const MovementType_FaceUpAndLeft_Step0 = generic('MovementType_FaceUpAndLeft_Step0', 'movementType');
export const MovementType_FaceUpAndLeft_Step1 = generic('MovementType_FaceUpAndLeft_Step1', 'movementType');
export const MovementType_FaceUpAndLeft_Step2 = generic('MovementType_FaceUpAndLeft_Step2', 'movementType');
export const MovementType_FaceUpAndLeft_Step3 = generic('MovementType_FaceUpAndLeft_Step3', 'movementType');
export const MovementType_FaceUpAndLeft_Step4 = generic('MovementType_FaceUpAndLeft_Step4', 'movementType');
export const MovementType_FaceUpAndRight_Step0 = generic('MovementType_FaceUpAndRight_Step0', 'movementType');
export const MovementType_FaceUpAndRight_Step1 = generic('MovementType_FaceUpAndRight_Step1', 'movementType');
export const MovementType_FaceUpAndRight_Step2 = generic('MovementType_FaceUpAndRight_Step2', 'movementType');
export const MovementType_FaceUpAndRight_Step3 = generic('MovementType_FaceUpAndRight_Step3', 'movementType');
export const MovementType_FaceUpAndRight_Step4 = generic('MovementType_FaceUpAndRight_Step4', 'movementType');
export const MovementType_FaceDownAndLeft_Step0 = generic('MovementType_FaceDownAndLeft_Step0', 'movementType');
export const MovementType_FaceDownAndLeft_Step1 = generic('MovementType_FaceDownAndLeft_Step1', 'movementType');
export const MovementType_FaceDownAndLeft_Step2 = generic('MovementType_FaceDownAndLeft_Step2', 'movementType');
export const MovementType_FaceDownAndLeft_Step3 = generic('MovementType_FaceDownAndLeft_Step3', 'movementType');
export const MovementType_FaceDownAndLeft_Step4 = generic('MovementType_FaceDownAndLeft_Step4', 'movementType');
export const MovementType_FaceDownAndRight_Step0 = generic('MovementType_FaceDownAndRight_Step0', 'movementType');
export const MovementType_FaceDownAndRight_Step1 = generic('MovementType_FaceDownAndRight_Step1', 'movementType');
export const MovementType_FaceDownAndRight_Step2 = generic('MovementType_FaceDownAndRight_Step2', 'movementType');
export const MovementType_FaceDownAndRight_Step3 = generic('MovementType_FaceDownAndRight_Step3', 'movementType');
export const MovementType_FaceDownAndRight_Step4 = generic('MovementType_FaceDownAndRight_Step4', 'movementType');
export const MovementType_FaceDownUpAndLeft_Step0 = generic('MovementType_FaceDownUpAndLeft_Step0', 'movementType');
export const MovementType_FaceDownUpAndLeft_Step1 = generic('MovementType_FaceDownUpAndLeft_Step1', 'movementType');
export const MovementType_FaceDownUpAndLeft_Step2 = generic('MovementType_FaceDownUpAndLeft_Step2', 'movementType');
export const MovementType_FaceDownUpAndLeft_Step3 = generic('MovementType_FaceDownUpAndLeft_Step3', 'movementType');
export const MovementType_FaceDownUpAndLeft_Step4 = generic('MovementType_FaceDownUpAndLeft_Step4', 'movementType');
export const MovementType_FaceDownUpAndRight_Step0 = generic('MovementType_FaceDownUpAndRight_Step0', 'movementType');
export const MovementType_FaceDownUpAndRight_Step1 = generic('MovementType_FaceDownUpAndRight_Step1', 'movementType');
export const MovementType_FaceDownUpAndRight_Step2 = generic('MovementType_FaceDownUpAndRight_Step2', 'movementType');
export const MovementType_FaceDownUpAndRight_Step3 = generic('MovementType_FaceDownUpAndRight_Step3', 'movementType');
export const MovementType_FaceDownUpAndRight_Step4 = generic('MovementType_FaceDownUpAndRight_Step4', 'movementType');
export const MovementType_FaceUpLeftAndRight_Step0 = generic('MovementType_FaceUpLeftAndRight_Step0', 'movementType');
export const MovementType_FaceUpLeftAndRight_Step1 = generic('MovementType_FaceUpLeftAndRight_Step1', 'movementType');
export const MovementType_FaceUpLeftAndRight_Step2 = generic('MovementType_FaceUpLeftAndRight_Step2', 'movementType');
export const MovementType_FaceUpLeftAndRight_Step3 = generic('MovementType_FaceUpLeftAndRight_Step3', 'movementType');
export const MovementType_FaceUpLeftAndRight_Step4 = generic('MovementType_FaceUpLeftAndRight_Step4', 'movementType');
export const MovementType_FaceDownLeftAndRight_Step0 = generic('MovementType_FaceDownLeftAndRight_Step0', 'movementType');
export const MovementType_FaceDownLeftAndRight_Step1 = generic('MovementType_FaceDownLeftAndRight_Step1', 'movementType');
export const MovementType_FaceDownLeftAndRight_Step2 = generic('MovementType_FaceDownLeftAndRight_Step2', 'movementType');
export const MovementType_FaceDownLeftAndRight_Step3 = generic('MovementType_FaceDownLeftAndRight_Step3', 'movementType');
export const MovementType_FaceDownLeftAndRight_Step4 = generic('MovementType_FaceDownLeftAndRight_Step4', 'movementType');
export const MovementType_RotateCounterclockwise_Step0 = generic('MovementType_RotateCounterclockwise_Step0', 'movementType');
export const MovementType_RotateCounterclockwise_Step1 = generic('MovementType_RotateCounterclockwise_Step1', 'movementType');
export const MovementType_RotateCounterclockwise_Step2 = generic('MovementType_RotateCounterclockwise_Step2', 'movementType');
export const MovementType_RotateCounterclockwise_Step3 = generic('MovementType_RotateCounterclockwise_Step3', 'movementType');
export const MovementType_RotateClockwise_Step0 = generic('MovementType_RotateClockwise_Step0', 'movementType');
export const MovementType_RotateClockwise_Step1 = generic('MovementType_RotateClockwise_Step1', 'movementType');
export const MovementType_RotateClockwise_Step2 = generic('MovementType_RotateClockwise_Step2', 'movementType');
export const MovementType_RotateClockwise_Step3 = generic('MovementType_RotateClockwise_Step3', 'movementType');
export const MovementType_WalkBackAndForth_Step0 = generic('MovementType_WalkBackAndForth_Step0', 'movementType');
export const MovementType_WalkBackAndForth_Step1 = generic('MovementType_WalkBackAndForth_Step1', 'movementType');
export const MovementType_WalkBackAndForth_Step2 = generic('MovementType_WalkBackAndForth_Step2', 'movementType');
export const MovementType_WalkBackAndForth_Step3 = generic('MovementType_WalkBackAndForth_Step3', 'movementType');
export const MovementType_WalkSequence_Step0 = generic('MovementType_WalkSequence_Step0', 'movementType');
export const MoveNextDirectionInSequence = generic('MoveNextDirectionInSequence', 'generic');
export const MovementType_WalkSequence_Step2 = generic('MovementType_WalkSequence_Step2', 'movementType');
export const MovementType_WalkSequenceUpRightLeftDown_Step1 = generic('MovementType_WalkSequenceUpRightLeftDown_Step1', 'movementType');
export const MovementType_WalkSequenceRightLeftDownUp_Step1 = generic('MovementType_WalkSequenceRightLeftDownUp_Step1', 'movementType');
export const MovementType_WalkSequenceDownUpRightLeft_Step1 = generic('MovementType_WalkSequenceDownUpRightLeft_Step1', 'movementType');
export const MovementType_WalkSequenceLeftDownUpRight_Step1 = generic('MovementType_WalkSequenceLeftDownUpRight_Step1', 'movementType');
export const MovementType_WalkSequenceUpLeftRightDown_Step1 = generic('MovementType_WalkSequenceUpLeftRightDown_Step1', 'movementType');
export const MovementType_WalkSequenceLeftRightDownUp_Step1 = generic('MovementType_WalkSequenceLeftRightDownUp_Step1', 'movementType');
export const MovementType_WalkSequenceDownUpLeftRight_Step1 = generic('MovementType_WalkSequenceDownUpLeftRight_Step1', 'movementType');
export const MovementType_WalkSequenceRightDownUpLeft_Step1 = generic('MovementType_WalkSequenceRightDownUpLeft_Step1', 'movementType');
export const MovementType_WalkSequenceLeftUpDownRight_Step1 = generic('MovementType_WalkSequenceLeftUpDownRight_Step1', 'movementType');
export const MovementType_WalkSequenceUpDownRightLeft_Step1 = generic('MovementType_WalkSequenceUpDownRightLeft_Step1', 'movementType');
export const MovementType_WalkSequenceRightLeftUpDown_Step1 = generic('MovementType_WalkSequenceRightLeftUpDown_Step1', 'movementType');
export const MovementType_WalkSequenceDownRightLeftUp_Step1 = generic('MovementType_WalkSequenceDownRightLeftUp_Step1', 'movementType');
export const MovementType_WalkSequenceRightUpDownLeft_Step1 = generic('MovementType_WalkSequenceRightUpDownLeft_Step1', 'movementType');
export const MovementType_WalkSequenceUpDownLeftRight_Step1 = generic('MovementType_WalkSequenceUpDownLeftRight_Step1', 'movementType');
export const MovementType_WalkSequenceLeftRightUpDown_Step1 = generic('MovementType_WalkSequenceLeftRightUpDown_Step1', 'movementType');
export const MovementType_WalkSequenceDownLeftRightUp_Step1 = generic('MovementType_WalkSequenceDownLeftRightUp_Step1', 'movementType');
export const MovementType_WalkSequenceUpLeftDownRight_Step1 = generic('MovementType_WalkSequenceUpLeftDownRight_Step1', 'movementType');
export const MovementType_WalkSequenceDownRightUpLeft_Step1 = generic('MovementType_WalkSequenceDownRightUpLeft_Step1', 'movementType');
export const MovementType_WalkSequenceLeftDownRightUp_Step1 = generic('MovementType_WalkSequenceLeftDownRightUp_Step1', 'movementType');
export const MovementType_WalkSequenceRightUpLeftDown_Step1 = generic('MovementType_WalkSequenceRightUpLeftDown_Step1', 'movementType');
export const MovementType_WalkSequenceUpRightDownLeft_Step1 = generic('MovementType_WalkSequenceUpRightDownLeft_Step1', 'movementType');
export const MovementType_WalkSequenceDownLeftUpRight_Step1 = generic('MovementType_WalkSequenceDownLeftUpRight_Step1', 'movementType');
export const MovementType_WalkSequenceLeftUpRightDown_Step1 = generic('MovementType_WalkSequenceLeftUpRightDown_Step1', 'movementType');
export const MovementType_WalkSequenceRightDownLeftUp_Step1 = generic('MovementType_WalkSequenceRightDownLeftUp_Step1', 'movementType');
export const MovementType_CopyPlayer_Step0 = generic('MovementType_CopyPlayer_Step0', 'movementType');
export const MovementType_CopyPlayer_Step1 = generic('MovementType_CopyPlayer_Step1', 'movementType');
export const MovementType_CopyPlayer_Step2 = generic('MovementType_CopyPlayer_Step2', 'movementType');
export const CopyablePlayerMovement_None = generic('CopyablePlayerMovement_None', 'generic');
export const CopyablePlayerMovement_FaceDirection = generic('CopyablePlayerMovement_FaceDirection', 'generic');
export const CopyablePlayerMovement_GoSpeed0 = generic('CopyablePlayerMovement_GoSpeed0', 'generic');
export const CopyablePlayerMovement_GoSpeed1 = generic('CopyablePlayerMovement_GoSpeed1', 'generic');
export const CopyablePlayerMovement_GoSpeed2 = generic('CopyablePlayerMovement_GoSpeed2', 'generic');
export const CopyablePlayerMovement_Slide = generic('CopyablePlayerMovement_Slide', 'generic');
export const cph_IM_DIFFERENT = generic('cph_IM_DIFFERENT', 'generic');
export const CopyablePlayerMovement_GoSpeed4 = generic('CopyablePlayerMovement_GoSpeed4', 'generic');
export const CopyablePlayerMovement_Jump = generic('CopyablePlayerMovement_Jump', 'generic');
export const MovementType_CopyPlayerInGrass_Step1 = generic('MovementType_CopyPlayerInGrass_Step1', 'movementType');
export const MovementType_TreeDisguise = generic('MovementType_TreeDisguise', 'movementType');
export const MovementType_Disguise_Callback = generic('MovementType_Disguise_Callback', 'movementType');
export const MovementType_MountainDisguise = generic('MovementType_MountainDisguise', 'movementType');
export const MovementType_Buried = generic('MovementType_Buried', 'movementType');
export const MovementType_Buried_Callback = generic('MovementType_Buried_Callback', 'movementType');
export const MovementType_Buried_Step0 = generic('MovementType_Buried_Step0', 'movementType');
export const MovementType_MoveInPlace_Step1 = generic('MovementType_MoveInPlace_Step1', 'movementType');
export const MovementType_WalkInPlace_Step0 = generic('MovementType_WalkInPlace_Step0', 'movementType');
export const MovementType_WalkInPlaceFast_Step0 = generic('MovementType_WalkInPlaceFast_Step0', 'movementType');
export const MovementType_JogInPlace_Step0 = generic('MovementType_JogInPlace_Step0', 'movementType');
export const MovementType_Invisible_Step0 = generic('MovementType_Invisible_Step0', 'movementType');
export const MovementType_Invisible_Step1 = generic('MovementType_Invisible_Step1', 'movementType');
export const MovementType_Invisible_Step2 = generic('MovementType_Invisible_Step2', 'movementType');
export const MovementType_RaiseHandAndStop = generic('MovementType_RaiseHandAndStop', 'movementType');
export const MovementType_RaiseHandAndJump = generic('MovementType_RaiseHandAndJump', 'movementType');
export const MovementType_RaiseHandAndSwim = generic('MovementType_RaiseHandAndSwim', 'movementType');
export const MovementType_RaiseHandAndStop_Callback = generic('MovementType_RaiseHandAndStop_Callback', 'movementType');
export const MovementType_RaiseHandAndJump_Callback = generic('MovementType_RaiseHandAndJump_Callback', 'movementType');
export const MovementType_RaiseHandAndSwim_Callback = generic('MovementType_RaiseHandAndSwim_Callback', 'movementType');
export const MovementType_RaiseHandAndStop_Step0 = generic('MovementType_RaiseHandAndStop_Step0', 'movementType');
export const MovementType_RaiseHandAndStop_Step1 = generic('MovementType_RaiseHandAndStop_Step1', 'movementType');
export const MovementType_RaiseHandAndStop_Step2 = generic('MovementType_RaiseHandAndStop_Step2', 'movementType');
export const MovementType_RaiseHandAndJump_Step0 = generic('MovementType_RaiseHandAndJump_Step0', 'movementType');
export const MovementType_RaiseHandAndSwim_Step0 = generic('MovementType_RaiseHandAndSwim_Step0', 'movementType');
export const MovementType_RaiseHandAndMove_Step1 = generic('MovementType_RaiseHandAndMove_Step1', 'movementType');
export const ClearObjectEventMovement = generic('ClearObjectEventMovement', 'generic');
export const GetFaceDirectionAnimNum = generic('GetFaceDirectionAnimNum', 'generic');
export const GetMoveDirectionAnimNum = generic('GetMoveDirectionAnimNum', 'generic');
export const GetMoveDirectionFastAnimNum = generic('GetMoveDirectionFastAnimNum', 'generic');
export const GetMoveDirectionFasterAnimNum = generic('GetMoveDirectionFasterAnimNum', 'generic');
export const GetMoveDirectionFastestAnimNum = generic('GetMoveDirectionFastestAnimNum', 'generic');
export const GetJumpSpecialDirectionAnimNum = generic('GetJumpSpecialDirectionAnimNum', 'generic');
export const GetAcroWheelieDirectionAnimNum = generic('GetAcroWheelieDirectionAnimNum', 'generic');
export const GetAcroBunnyHopFrontWheelDirectionAnimNum = generic('GetAcroBunnyHopFrontWheelDirectionAnimNum', 'generic');
export const GetAcroEndWheelieDirectionAnimNum = generic('GetAcroEndWheelieDirectionAnimNum', 'generic');
export const GetSpinDirectionAnimNum = generic('GetSpinDirectionAnimNum', 'generic');
export const GetAcroUnusedActionDirectionAnimNum = generic('GetAcroUnusedActionDirectionAnimNum', 'generic');
export const GetAcroWheeliePedalDirectionAnimNum = generic('GetAcroWheeliePedalDirectionAnimNum', 'generic');
export const GetFishingDirectionAnimNum = generic('GetFishingDirectionAnimNum', 'generic');
export const GetFishingNoCatchDirectionAnimNum = generic('GetFishingNoCatchDirectionAnimNum', 'generic');
export const GetFishingBiteDirectionAnimNum = generic('GetFishingBiteDirectionAnimNum', 'generic');
export const GetRunningDirectionAnimNum = generic('GetRunningDirectionAnimNum', 'generic');
export const SetStepAnimHandleAlternation = generic('SetStepAnimHandleAlternation', 'generic');
export const SetStepAnim = generic('SetStepAnim', 'generic');
export const GetDirectionToFace = generic('GetDirectionToFace', 'generic');
export const SetTrainerMovementType = generic('SetTrainerMovementType', 'generic');
export const GetTrainerFacingDirectionMovementType = generic('GetTrainerFacingDirectionMovementType', 'generic');
export const GetCollisionInDirection = generic('GetCollisionInDirection', 'generic');
export const GetCollisionAtCoords = generic('GetCollisionAtCoords', 'generic');
export const GetCollisionFlagsAtCoords = generic('GetCollisionFlagsAtCoords', 'generic');
export const IsCoordOutsideObjectEventMovementRange = generic('IsCoordOutsideObjectEventMovementRange', 'generic');
export const IsMetatileDirectionallyImpassable = generic('IsMetatileDirectionallyImpassable', 'generic');
export const DoesObjectCollideWithObjectAt = generic('DoesObjectCollideWithObjectAt', 'generic');
export const IsBerryTreeSparkling = generic('IsBerryTreeSparkling', 'generic');
export const SetBerryTreeJustPicked = generic('SetBerryTreeJustPicked', 'generic');
export const MoveCoords = generic('MoveCoords', 'generic');
export const MoveCoordsInMapCoordIncrement = generic('MoveCoordsInMapCoordIncrement', 'generic');
export const MoveCoordsInDirection = generic('MoveCoordsInDirection', 'generic');
export const GetMapCoordsFromSpritePos = generic('GetMapCoordsFromSpritePos', 'generic');
export const SetSpritePosToMapCoords = generic('SetSpritePosToMapCoords', 'generic');
export const SetSpritePosToOffsetMapCoords = generic('SetSpritePosToOffsetMapCoords', 'generic');
export const GetObjectEventMovingCameraOffset = generic('GetObjectEventMovingCameraOffset', 'generic');
export const ObjectEventMoveDestCoords = generic('ObjectEventMoveDestCoords', 'generic');
export const ObjectEventIsMovementOverridden = generic('ObjectEventIsMovementOverridden', 'generic');
export const ObjectEventIsHeldMovementActive = generic('ObjectEventIsHeldMovementActive', 'generic');
export const ObjectEventSetHeldMovement = generic('ObjectEventSetHeldMovement', 'generic');
export const ObjectEventForceSetHeldMovement = generic('ObjectEventForceSetHeldMovement', 'generic');
export const ObjectEventClearHeldMovementIfActive = generic('ObjectEventClearHeldMovementIfActive', 'generic');
export const ObjectEventClearHeldMovement = generic('ObjectEventClearHeldMovement', 'generic');
export const ObjectEventCheckHeldMovementStatus = generic('ObjectEventCheckHeldMovementStatus', 'generic');
export const ObjectEventClearHeldMovementIfFinished = generic('ObjectEventClearHeldMovementIfFinished', 'generic');
export const ObjectEventGetHeldMovementActionId = generic('ObjectEventGetHeldMovementActionId', 'generic');
export const UpdateObjectEventCurrentMovement = generic('UpdateObjectEventCurrentMovement', 'generic');
export const QL_UpdateObjectEventCurrentMovement = generic('QL_UpdateObjectEventCurrentMovement', 'generic');
export const name = generic('name', 'generic');
export const GetWalkSlowestMovementAction = generic('GetWalkSlowestMovementAction', 'generic');
export const ObjectEventFaceOppositeDirection = generic('ObjectEventFaceOppositeDirection', 'generic');
export const GetOppositeDirection = generic('GetOppositeDirection', 'generic');
export const GetPlayerDirectionForCopy = generic('GetPlayerDirectionForCopy', 'generic');
export const GetCopyDirection = generic('GetCopyDirection', 'generic');
export const ObjectEventExecHeldMovementAction = generic('ObjectEventExecHeldMovementAction', 'generic');
export const QuestLogObjectEventExecHeldMovementAction = generic('QuestLogObjectEventExecHeldMovementAction', 'generic');
export const ObjectEventExecSingleMovementAction = generic('ObjectEventExecSingleMovementAction', 'generic');
export const ObjectEventSetSingleMovement = generic('ObjectEventSetSingleMovement', 'generic');
export const FaceDirection = generic('FaceDirection', 'generic');
export const MovementAction_FaceDown_Step0 = generic('MovementAction_FaceDown_Step0', 'movementAction');
export const MovementAction_FaceUp_Step0 = generic('MovementAction_FaceUp_Step0', 'movementAction');
export const MovementAction_FaceLeft_Step0 = generic('MovementAction_FaceLeft_Step0', 'movementAction');
export const MovementAction_FaceRight_Step0 = generic('MovementAction_FaceRight_Step0', 'movementAction');
export const InitNpcForMovement = generic('InitNpcForMovement', 'generic');
export const InitMovementNormal = generic('InitMovementNormal', 'generic');
export const StartRunningAnim = generic('StartRunningAnim', 'generic');
export const UpdateMovementNormal = generic('UpdateMovementNormal', 'generic');
export const InitNpcForWalkSlower = generic('InitNpcForWalkSlower', 'generic');
export const InitWalkSlower = generic('InitWalkSlower', 'generic');
export const UpdateWalkSlower = generic('UpdateWalkSlower', 'generic');
export const InitNpcForWalkSlowest = generic('InitNpcForWalkSlowest', 'generic');
export const InitWalkSlowest = generic('InitWalkSlowest', 'generic');
export const UpdateWalkSlowest = generic('UpdateWalkSlowest', 'generic');
export const MovementAction_WalkSlowestDown_Step0 = generic('MovementAction_WalkSlowestDown_Step0', 'movementAction');
export const MovementAction_WalkSlowestDown_Step1 = generic('MovementAction_WalkSlowestDown_Step1', 'movementAction');
export const MovementAction_WalkSlowestUp_Step0 = generic('MovementAction_WalkSlowestUp_Step0', 'movementAction');
export const MovementAction_WalkSlowestUp_Step1 = generic('MovementAction_WalkSlowestUp_Step1', 'movementAction');
export const MovementAction_WalkSlowestLeft_Step0 = generic('MovementAction_WalkSlowestLeft_Step0', 'movementAction');
export const MovementAction_WalkSlowestLeft_Step1 = generic('MovementAction_WalkSlowestLeft_Step1', 'movementAction');
export const MovementAction_WalkSlowestRight_Step0 = generic('MovementAction_WalkSlowestRight_Step0', 'movementAction');
export const MovementAction_WalkSlowestRight_Step1 = generic('MovementAction_WalkSlowestRight_Step1', 'movementAction');
export const MovementAction_WalkSlowerDown_Step0 = generic('MovementAction_WalkSlowerDown_Step0', 'movementAction');
export const MovementAction_WalkSlowerDown_Step1 = generic('MovementAction_WalkSlowerDown_Step1', 'movementAction');
export const MovementAction_WalkSlowerUp_Step0 = generic('MovementAction_WalkSlowerUp_Step0', 'movementAction');
export const MovementAction_WalkSlowerUp_Step1 = generic('MovementAction_WalkSlowerUp_Step1', 'movementAction');
export const MovementAction_WalkSlowerLeft_Step0 = generic('MovementAction_WalkSlowerLeft_Step0', 'movementAction');
export const MovementAction_WalkSlowerLeft_Step1 = generic('MovementAction_WalkSlowerLeft_Step1', 'movementAction');
export const MovementAction_WalkSlowerRight_Step0 = generic('MovementAction_WalkSlowerRight_Step0', 'movementAction');
export const MovementAction_WalkSlowerRight_Step1 = generic('MovementAction_WalkSlowerRight_Step1', 'movementAction');
export const InitNpcForWalkSlow = generic('InitNpcForWalkSlow', 'generic');
export const InitWalkSlow = generic('InitWalkSlow', 'generic');
export const UpdateWalkSlow = generic('UpdateWalkSlow', 'generic');
export const MovementAction_WalkSlowUp_Step0 = generic('MovementAction_WalkSlowUp_Step0', 'movementAction');
export const MovementAction_WalkSlowUp_Step1 = generic('MovementAction_WalkSlowUp_Step1', 'movementAction');
export const MovementAction_WalkSlowDown_Step0 = generic('MovementAction_WalkSlowDown_Step0', 'movementAction');
export const MovementAction_WalkSlowDown_Step1 = generic('MovementAction_WalkSlowDown_Step1', 'movementAction');
export const MovementAction_WalkSlowLeft_Step0 = generic('MovementAction_WalkSlowLeft_Step0', 'movementAction');
export const MovementAction_WalkSlowLeft_Step1 = generic('MovementAction_WalkSlowLeft_Step1', 'movementAction');
export const MovementAction_WalkSlowRight_Step0 = generic('MovementAction_WalkSlowRight_Step0', 'movementAction');
export const MovementAction_WalkSlowRight_Step1 = generic('MovementAction_WalkSlowRight_Step1', 'movementAction');
export const MovementAction_WalkNormalDown_Step0 = generic('MovementAction_WalkNormalDown_Step0', 'movementAction');
export const MovementAction_WalkNormalDown_Step1 = generic('MovementAction_WalkNormalDown_Step1', 'movementAction');
export const MovementAction_WalkNormalUp_Step0 = generic('MovementAction_WalkNormalUp_Step0', 'movementAction');
export const MovementAction_WalkNormalUp_Step1 = generic('MovementAction_WalkNormalUp_Step1', 'movementAction');
export const MovementAction_WalkNormalLeft_Step0 = generic('MovementAction_WalkNormalLeft_Step0', 'movementAction');
export const MovementAction_WalkNormalLeft_Step1 = generic('MovementAction_WalkNormalLeft_Step1', 'movementAction');
export const MovementAction_WalkNormalRight_Step0 = generic('MovementAction_WalkNormalRight_Step0', 'movementAction');
export const MovementAction_WalkNormalRight_Step1 = generic('MovementAction_WalkNormalRight_Step1', 'movementAction');
export const InitJump = generic('InitJump', 'generic');
export const InitJumpRegular = generic('InitJumpRegular', 'generic');
export const UpdateJumpAnim = generic('UpdateJumpAnim', 'generic');
export const DoJumpAnimStep = generic('DoJumpAnimStep', 'generic');
export const DoJumpSpecialAnimStep = generic('DoJumpSpecialAnimStep', 'generic');
export const DoJumpAnim = generic('DoJumpAnim', 'generic');
export const DoJumpSpecialAnim = generic('DoJumpSpecialAnim', 'generic');
export const DoJumpInPlaceAnim = generic('DoJumpInPlaceAnim', 'generic');
export const MovementAction_Jump2Down_Step0 = generic('MovementAction_Jump2Down_Step0', 'movementAction');
export const MovementAction_Jump2Down_Step1 = generic('MovementAction_Jump2Down_Step1', 'movementAction');
export const MovementAction_Jump2Up_Step0 = generic('MovementAction_Jump2Up_Step0', 'movementAction');
export const MovementAction_Jump2Up_Step1 = generic('MovementAction_Jump2Up_Step1', 'movementAction');
export const MovementAction_Jump2Left_Step0 = generic('MovementAction_Jump2Left_Step0', 'movementAction');
export const MovementAction_Jump2Left_Step1 = generic('MovementAction_Jump2Left_Step1', 'movementAction');
export const MovementAction_Jump2Right_Step0 = generic('MovementAction_Jump2Right_Step0', 'movementAction');
export const MovementAction_Jump2Right_Step1 = generic('MovementAction_Jump2Right_Step1', 'movementAction');
export const InitMovementDelay = generic('InitMovementDelay', 'generic');
export const MovementAction_Delay_Step1 = generic('MovementAction_Delay_Step1', 'movementAction');
export const MovementAction_Delay1_Step0 = generic('MovementAction_Delay1_Step0', 'movementAction');
export const MovementAction_Delay2_Step0 = generic('MovementAction_Delay2_Step0', 'movementAction');
export const MovementAction_Delay4_Step0 = generic('MovementAction_Delay4_Step0', 'movementAction');
export const MovementAction_Delay8_Step0 = generic('MovementAction_Delay8_Step0', 'movementAction');
export const MovementAction_Delay16_Step0 = generic('MovementAction_Delay16_Step0', 'movementAction');
export const MovementAction_WalkFastDown_Step0 = generic('MovementAction_WalkFastDown_Step0', 'movementAction');
export const MovementAction_WalkFastDown_Step1 = generic('MovementAction_WalkFastDown_Step1', 'movementAction');
export const MovementAction_WalkFastUp_Step0 = generic('MovementAction_WalkFastUp_Step0', 'movementAction');
export const MovementAction_WalkFastUp_Step1 = generic('MovementAction_WalkFastUp_Step1', 'movementAction');
export const MovementAction_WalkFastLeft_Step0 = generic('MovementAction_WalkFastLeft_Step0', 'movementAction');
export const MovementAction_WalkFastLeft_Step1 = generic('MovementAction_WalkFastLeft_Step1', 'movementAction');
export const MovementAction_WalkFastRight_Step0 = generic('MovementAction_WalkFastRight_Step0', 'movementAction');
export const MovementAction_WalkFastRight_Step1 = generic('MovementAction_WalkFastRight_Step1', 'movementAction');
export const UpdateMovementGlide = generic('UpdateMovementGlide', 'generic');
export const MovementAction_GlideDown_Step0 = generic('MovementAction_GlideDown_Step0', 'movementAction');
export const MovementAction_GlideDown_Step1 = generic('MovementAction_GlideDown_Step1', 'movementAction');
export const MovementAction_GlideUp_Step0 = generic('MovementAction_GlideUp_Step0', 'movementAction');
export const MovementAction_GlideUp_Step1 = generic('MovementAction_GlideUp_Step1', 'movementAction');
export const MovementAction_GlideLeft_Step0 = generic('MovementAction_GlideLeft_Step0', 'movementAction');
export const MovementAction_GlideLeft_Step1 = generic('MovementAction_GlideLeft_Step1', 'movementAction');
export const MovementAction_GlideRight_Step0 = generic('MovementAction_GlideRight_Step0', 'movementAction');
export const MovementAction_GlideRight_Step1 = generic('MovementAction_GlideRight_Step1', 'movementAction');
export const FaceDirectionFast = generic('FaceDirectionFast', 'generic');
export const MovementAction_FaceDownFast_Step0 = generic('MovementAction_FaceDownFast_Step0', 'movementAction');
export const MovementAction_FaceUpFast_Step0 = generic('MovementAction_FaceUpFast_Step0', 'movementAction');
export const MovementAction_FaceLeftFast_Step0 = generic('MovementAction_FaceLeftFast_Step0', 'movementAction');
export const MovementAction_FaceRightFast_Step0 = generic('MovementAction_FaceRightFast_Step0', 'movementAction');
export const InitMoveInPlace = generic('InitMoveInPlace', 'generic');
export const MovementAction_WalkInPlace_Step1 = generic('MovementAction_WalkInPlace_Step1', 'movementAction');
export const MovementAction_WalkInPlaceSlow_Step1 = generic('MovementAction_WalkInPlaceSlow_Step1', 'movementAction');
export const MovementAction_WalkInPlaceSlowDown_Step0 = generic('MovementAction_WalkInPlaceSlowDown_Step0', 'movementAction');
export const MovementAction_WalkInPlaceSlowUp_Step0 = generic('MovementAction_WalkInPlaceSlowUp_Step0', 'movementAction');
export const MovementAction_WalkInPlaceSlowLeft_Step0 = generic('MovementAction_WalkInPlaceSlowLeft_Step0', 'movementAction');
export const MovementAction_WalkInPlaceSlowRight_Step0 = generic('MovementAction_WalkInPlaceSlowRight_Step0', 'movementAction');
export const MovementAction_WalkInPlaceNormalDown_Step0 = generic('MovementAction_WalkInPlaceNormalDown_Step0', 'movementAction');
export const MovementAction_WalkInPlaceNormalUp_Step0 = generic('MovementAction_WalkInPlaceNormalUp_Step0', 'movementAction');
export const MovementAction_WalkInPlaceNormalLeft_Step0 = generic('MovementAction_WalkInPlaceNormalLeft_Step0', 'movementAction');
export const MovementAction_WalkInPlaceNormalRight_Step0 = generic('MovementAction_WalkInPlaceNormalRight_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFastDown_Step0 = generic('MovementAction_WalkInPlaceFastDown_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFastUp_Step0 = generic('MovementAction_WalkInPlaceFastUp_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFastLeft_Step0 = generic('MovementAction_WalkInPlaceFastLeft_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFastRight_Step0 = generic('MovementAction_WalkInPlaceFastRight_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFasterDown_Step0 = generic('MovementAction_WalkInPlaceFasterDown_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFasterUp_Step0 = generic('MovementAction_WalkInPlaceFasterUp_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFasterLeft_Step0 = generic('MovementAction_WalkInPlaceFasterLeft_Step0', 'movementAction');
export const MovementAction_WalkInPlaceFasterRight_Step0 = generic('MovementAction_WalkInPlaceFasterRight_Step0', 'movementAction');
export const MovementAction_RideWaterCurrentDown_Step0 = generic('MovementAction_RideWaterCurrentDown_Step0', 'movementAction');
export const MovementAction_RideWaterCurrentDown_Step1 = generic('MovementAction_RideWaterCurrentDown_Step1', 'movementAction');
export const MovementAction_RideWaterCurrentUp_Step0 = generic('MovementAction_RideWaterCurrentUp_Step0', 'movementAction');
export const MovementAction_RideWaterCurrentUp_Step1 = generic('MovementAction_RideWaterCurrentUp_Step1', 'movementAction');
export const MovementAction_RideWaterCurrentLeft_Step0 = generic('MovementAction_RideWaterCurrentLeft_Step0', 'movementAction');
export const MovementAction_RideWaterCurrentLeft_Step1 = generic('MovementAction_RideWaterCurrentLeft_Step1', 'movementAction');
export const MovementAction_RideWaterCurrentRight_Step0 = generic('MovementAction_RideWaterCurrentRight_Step0', 'movementAction');
export const MovementAction_RideWaterCurrentRight_Step1 = generic('MovementAction_RideWaterCurrentRight_Step1', 'movementAction');
export const MovementAction_WalkFasterDown_Step0 = generic('MovementAction_WalkFasterDown_Step0', 'movementAction');
export const MovementAction_WalkFasterDown_Step1 = generic('MovementAction_WalkFasterDown_Step1', 'movementAction');
export const MovementAction_WalkFasterUp_Step0 = generic('MovementAction_WalkFasterUp_Step0', 'movementAction');
export const MovementAction_WalkFasterUp_Step1 = generic('MovementAction_WalkFasterUp_Step1', 'movementAction');
export const MovementAction_WalkFasterLeft_Step0 = generic('MovementAction_WalkFasterLeft_Step0', 'movementAction');
export const MovementAction_WalkFasterLeft_Step1 = generic('MovementAction_WalkFasterLeft_Step1', 'movementAction');
export const MovementAction_WalkFasterRight_Step0 = generic('MovementAction_WalkFasterRight_Step0', 'movementAction');
export const MovementAction_WalkFasterRight_Step1 = generic('MovementAction_WalkFasterRight_Step1', 'movementAction');
export const MovementAction_SlideDown_Step0 = generic('MovementAction_SlideDown_Step0', 'movementAction');
export const MovementAction_SlideDown_Step1 = generic('MovementAction_SlideDown_Step1', 'movementAction');
export const MovementAction_SlideUp_Step0 = generic('MovementAction_SlideUp_Step0', 'movementAction');
export const MovementAction_SlideUp_Step1 = generic('MovementAction_SlideUp_Step1', 'movementAction');
export const MovementAction_SlideLeft_Step0 = generic('MovementAction_SlideLeft_Step0', 'movementAction');
export const MovementAction_SlideLeft_Step1 = generic('MovementAction_SlideLeft_Step1', 'movementAction');
export const MovementAction_SlideRight_Step0 = generic('MovementAction_SlideRight_Step0', 'movementAction');
export const MovementAction_SlideRight_Step1 = generic('MovementAction_SlideRight_Step1', 'movementAction');
export const MovementAction_PlayerRunDown_Step0 = generic('MovementAction_PlayerRunDown_Step0', 'movementAction');
export const MovementAction_PlayerRunDown_Step1 = generic('MovementAction_PlayerRunDown_Step1', 'movementAction');
export const MovementAction_PlayerRunUp_Step0 = generic('MovementAction_PlayerRunUp_Step0', 'movementAction');
export const MovementAction_PlayerRunUp_Step1 = generic('MovementAction_PlayerRunUp_Step1', 'movementAction');
export const MovementAction_PlayerRunLeft_Step0 = generic('MovementAction_PlayerRunLeft_Step0', 'movementAction');
export const MovementAction_PlayerRunLeft_Step1 = generic('MovementAction_PlayerRunLeft_Step1', 'movementAction');
export const MovementAction_PlayerRunRight_Step0 = generic('MovementAction_PlayerRunRight_Step0', 'movementAction');
export const MovementAction_PlayerRunRight_Step1 = generic('MovementAction_PlayerRunRight_Step1', 'movementAction');
export const InitNpcForRunSlow = generic('InitNpcForRunSlow', 'generic');
export const InitRunSlow = generic('InitRunSlow', 'generic');
export const UpdateRunSlow = generic('UpdateRunSlow', 'generic');
export const MovementAction_RunDownSlow_Step0 = generic('MovementAction_RunDownSlow_Step0', 'movementAction');
export const MovementAction_RunDownSlow_Step1 = generic('MovementAction_RunDownSlow_Step1', 'movementAction');
export const MovementAction_RunUpSlow_Step0 = generic('MovementAction_RunUpSlow_Step0', 'movementAction');
export const MovementAction_RunUpSlow_Step1 = generic('MovementAction_RunUpSlow_Step1', 'movementAction');
export const MovementAction_RunLeftSlow_Step0 = generic('MovementAction_RunLeftSlow_Step0', 'movementAction');
export const MovementAction_RunLeftSlow_Step1 = generic('MovementAction_RunLeftSlow_Step1', 'movementAction');
export const MovementAction_RunRightSlow_Step0 = generic('MovementAction_RunRightSlow_Step0', 'movementAction');
export const MovementAction_RunRightSlow_Step1 = generic('MovementAction_RunRightSlow_Step1', 'movementAction');
export const StartSpriteAnimInDirection = generic('StartSpriteAnimInDirection', 'generic');
export const MovementAction_StartAnimInDirection_Step0 = generic('MovementAction_StartAnimInDirection_Step0', 'movementAction');
export const MovementAction_WaitSpriteAnim = generic('MovementAction_WaitSpriteAnim', 'movementAction');
export const InitJumpSpecial = generic('InitJumpSpecial', 'generic');
export const MovementAction_JumpSpecialDown_Step0 = generic('MovementAction_JumpSpecialDown_Step0', 'movementAction');
export const MovementAction_JumpSpecialDown_Step1 = generic('MovementAction_JumpSpecialDown_Step1', 'movementAction');
export const MovementAction_JumpSpecialUp_Step0 = generic('MovementAction_JumpSpecialUp_Step0', 'movementAction');
export const MovementAction_JumpSpecialUp_Step1 = generic('MovementAction_JumpSpecialUp_Step1', 'movementAction');
export const MovementAction_JumpSpecialLeft_Step0 = generic('MovementAction_JumpSpecialLeft_Step0', 'movementAction');
export const MovementAction_JumpSpecialLeft_Step1 = generic('MovementAction_JumpSpecialLeft_Step1', 'movementAction');
export const MovementAction_JumpSpecialRight_Step0 = generic('MovementAction_JumpSpecialRight_Step0', 'movementAction');
export const MovementAction_JumpSpecialRight_Step1 = generic('MovementAction_JumpSpecialRight_Step1', 'movementAction');
export const MovementAction_JumpSpecialWithEffectDown_Step0 = generic('MovementAction_JumpSpecialWithEffectDown_Step0', 'movementAction');
export const MovementAction_JumpSpecialWithEffectDown_Step1 = generic('MovementAction_JumpSpecialWithEffectDown_Step1', 'movementAction');
export const MovementAction_JumpSpecialWithEffectUp_Step0 = generic('MovementAction_JumpSpecialWithEffectUp_Step0', 'movementAction');
export const MovementAction_JumpSpecialWithEffectUp_Step1 = generic('MovementAction_JumpSpecialWithEffectUp_Step1', 'movementAction');
export const MovementAction_JumpSpecialWithEffectLeft_Step0 = generic('MovementAction_JumpSpecialWithEffectLeft_Step0', 'movementAction');
export const MovementAction_JumpSpecialWithEffectLeft_Step1 = generic('MovementAction_JumpSpecialWithEffectLeft_Step1', 'movementAction');
export const MovementAction_JumpSpecialWithEffectRight_Step0 = generic('MovementAction_JumpSpecialWithEffectRight_Step0', 'movementAction');
export const MovementAction_JumpSpecialWithEffectRight_Step1 = generic('MovementAction_JumpSpecialWithEffectRight_Step1', 'movementAction');
export const MovementAction_FacePlayer_Step0 = generic('MovementAction_FacePlayer_Step0', 'movementAction');
export const MovementAction_FaceAwayPlayer_Step0 = generic('MovementAction_FaceAwayPlayer_Step0', 'movementAction');
export const MovementAction_LockFacingDirection_Step0 = generic('MovementAction_LockFacingDirection_Step0', 'movementAction');
export const MovementAction_UnlockFacingDirection_Step0 = generic('MovementAction_UnlockFacingDirection_Step0', 'movementAction');
export const MovementAction_JumpDown_Step0 = generic('MovementAction_JumpDown_Step0', 'movementAction');
export const MovementAction_JumpDown_Step1 = generic('MovementAction_JumpDown_Step1', 'movementAction');
export const MovementAction_JumpUp_Step0 = generic('MovementAction_JumpUp_Step0', 'movementAction');
export const MovementAction_JumpUp_Step1 = generic('MovementAction_JumpUp_Step1', 'movementAction');
export const MovementAction_JumpLeft_Step0 = generic('MovementAction_JumpLeft_Step0', 'movementAction');
export const MovementAction_JumpLeft_Step1 = generic('MovementAction_JumpLeft_Step1', 'movementAction');
export const MovementAction_JumpRight_Step0 = generic('MovementAction_JumpRight_Step0', 'movementAction');
export const MovementAction_JumpRight_Step1 = generic('MovementAction_JumpRight_Step1', 'movementAction');
export const MovementAction_JumpInPlaceDown_Step0 = generic('MovementAction_JumpInPlaceDown_Step0', 'movementAction');
export const MovementAction_JumpInPlaceDown_Step1 = generic('MovementAction_JumpInPlaceDown_Step1', 'movementAction');
export const MovementAction_JumpInPlaceUp_Step0 = generic('MovementAction_JumpInPlaceUp_Step0', 'movementAction');
export const MovementAction_JumpInPlaceUp_Step1 = generic('MovementAction_JumpInPlaceUp_Step1', 'movementAction');
export const MovementAction_JumpInPlaceLeft_Step0 = generic('MovementAction_JumpInPlaceLeft_Step0', 'movementAction');
export const MovementAction_JumpInPlaceLeft_Step1 = generic('MovementAction_JumpInPlaceLeft_Step1', 'movementAction');
export const MovementAction_JumpInPlaceRight_Step0 = generic('MovementAction_JumpInPlaceRight_Step0', 'movementAction');
export const MovementAction_JumpInPlaceRight_Step1 = generic('MovementAction_JumpInPlaceRight_Step1', 'movementAction');
export const MovementAction_JumpInPlaceDownUp_Step0 = generic('MovementAction_JumpInPlaceDownUp_Step0', 'movementAction');
export const MovementAction_JumpInPlaceDownUp_Step1 = generic('MovementAction_JumpInPlaceDownUp_Step1', 'movementAction');
export const MovementAction_JumpInPlaceUpDown_Step0 = generic('MovementAction_JumpInPlaceUpDown_Step0', 'movementAction');
export const MovementAction_JumpInPlaceUpDown_Step1 = generic('MovementAction_JumpInPlaceUpDown_Step1', 'movementAction');
export const MovementAction_JumpInPlaceLeftRight_Step0 = generic('MovementAction_JumpInPlaceLeftRight_Step0', 'movementAction');
export const MovementAction_JumpInPlaceLeftRight_Step1 = generic('MovementAction_JumpInPlaceLeftRight_Step1', 'movementAction');
export const MovementAction_JumpInPlaceRightLeft_Step0 = generic('MovementAction_JumpInPlaceRightLeft_Step0', 'movementAction');
export const MovementAction_JumpInPlaceRightLeft_Step1 = generic('MovementAction_JumpInPlaceRightLeft_Step1', 'movementAction');
export const MovementAction_FaceOriginalDirection_Step0 = generic('MovementAction_FaceOriginalDirection_Step0', 'movementAction');
export const MovementAction_NurseJoyBowDown_Step0 = generic('MovementAction_NurseJoyBowDown_Step0', 'movementAction');
export const MovementAction_EnableJumpLandingGroundEffect_Step0 = generic('MovementAction_EnableJumpLandingGroundEffect_Step0', 'movementAction');
export const MovementAction_DisableJumpLandingGroundEffect_Step0 = generic('MovementAction_DisableJumpLandingGroundEffect_Step0', 'movementAction');
export const MovementAction_DisableAnimation_Step0 = generic('MovementAction_DisableAnimation_Step0', 'movementAction');
export const MovementAction_RestoreAnimation_Step0 = generic('MovementAction_RestoreAnimation_Step0', 'movementAction');
export const MovementAction_SetInvisible_Step0 = generic('MovementAction_SetInvisible_Step0', 'movementAction');
export const MovementAction_SetVisible_Step0 = generic('MovementAction_SetVisible_Step0', 'movementAction');
export const MovementAction_EmoteExclamationMark_Step0 = generic('MovementAction_EmoteExclamationMark_Step0', 'movementAction');
export const MovementAction_EmoteQuestionMark_Step0 = generic('MovementAction_EmoteQuestionMark_Step0', 'movementAction');
export const MovementAction_EmoteX_Step0 = generic('MovementAction_EmoteX_Step0', 'movementAction');
export const MovementAction_EmoteDoubleExclamationMark_Step0 = generic('MovementAction_EmoteDoubleExclamationMark_Step0', 'movementAction');
export const MovementAction_EmoteSmile_Step0 = generic('MovementAction_EmoteSmile_Step0', 'movementAction');
export const MovementAction_RevealTrainer_Step0 = generic('MovementAction_RevealTrainer_Step0', 'movementAction');
export const MovementAction_RevealTrainer_Step1 = generic('MovementAction_RevealTrainer_Step1', 'movementAction');
export const MovementAction_RockSmashBreak_Step0 = generic('MovementAction_RockSmashBreak_Step0', 'movementAction');
export const MovementAction_RockSmashBreak_Step1 = generic('MovementAction_RockSmashBreak_Step1', 'movementAction');
export const MovementAction_RockSmashBreak_Step2 = generic('MovementAction_RockSmashBreak_Step2', 'movementAction');
export const MovementAction_CutTree_Step0 = generic('MovementAction_CutTree_Step0', 'movementAction');
export const MovementAction_CutTree_Step1 = generic('MovementAction_CutTree_Step1', 'movementAction');
export const MovementAction_CutTree_Step2 = generic('MovementAction_CutTree_Step2', 'movementAction');
export const MovementAction_SetFixedPriority_Step0 = generic('MovementAction_SetFixedPriority_Step0', 'movementAction');
export const MovementAction_ClearFixedPriority_Step0 = generic('MovementAction_ClearFixedPriority_Step0', 'movementAction');
export const MovementAction_InitAffineAnim_Step0 = generic('MovementAction_InitAffineAnim_Step0', 'movementAction');
export const MovementAction_ClearAffineAnim_Step0 = generic('MovementAction_ClearAffineAnim_Step0', 'movementAction');
export const MovementAction_WalkDownStartAffine_Step0 = generic('MovementAction_WalkDownStartAffine_Step0', 'movementAction');
export const MovementAction_WalkDownStartAffine_Step1 = generic('MovementAction_WalkDownStartAffine_Step1', 'movementAction');
export const MovementAction_WalkDownAffine_Step0 = generic('MovementAction_WalkDownAffine_Step0', 'movementAction');
export const MovementAction_WalkDownAffine_Step1 = generic('MovementAction_WalkDownAffine_Step1', 'movementAction');
export const AcroWheelieFaceDirection = generic('AcroWheelieFaceDirection', 'generic');
export const MovementAction_AcroWheelieFaceDown_Step0 = generic('MovementAction_AcroWheelieFaceDown_Step0', 'movementAction');
export const MovementAction_AcroWheelieFaceUp_Step0 = generic('MovementAction_AcroWheelieFaceUp_Step0', 'movementAction');
export const MovementAction_AcroWheelieFaceLeft_Step0 = generic('MovementAction_AcroWheelieFaceLeft_Step0', 'movementAction');
export const MovementAction_AcroWheelieFaceRight_Step0 = generic('MovementAction_AcroWheelieFaceRight_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieDown_Step0 = generic('MovementAction_AcroPopWheelieDown_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieUp_Step0 = generic('MovementAction_AcroPopWheelieUp_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieLeft_Step0 = generic('MovementAction_AcroPopWheelieLeft_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieRight_Step0 = generic('MovementAction_AcroPopWheelieRight_Step0', 'movementAction');
export const MovementAction_AcroEndWheelieFaceDown_Step0 = generic('MovementAction_AcroEndWheelieFaceDown_Step0', 'movementAction');
export const MovementAction_AcroEndWheelieFaceUp_Step0 = generic('MovementAction_AcroEndWheelieFaceUp_Step0', 'movementAction');
export const MovementAction_AcroEndWheelieFaceLeft_Step0 = generic('MovementAction_AcroEndWheelieFaceLeft_Step0', 'movementAction');
export const MovementAction_AcroEndWheelieFaceRight_Step0 = generic('MovementAction_AcroEndWheelieFaceRight_Step0', 'movementAction');
export const MovementAction_UnusedAcroActionDown_Step0 = generic('MovementAction_UnusedAcroActionDown_Step0', 'movementAction');
export const MovementAction_UnusedAcroActionUp_Step0 = generic('MovementAction_UnusedAcroActionUp_Step0', 'movementAction');
export const MovementAction_UnusedAcroActionLeft_Step0 = generic('MovementAction_UnusedAcroActionLeft_Step0', 'movementAction');
export const MovementAction_UnusedAcroActionRight_Step0 = generic('MovementAction_UnusedAcroActionRight_Step0', 'movementAction');
export const InitAcroWheelieJump = generic('InitAcroWheelieJump', 'generic');
export const MovementAction_AcroWheelieHopFaceDown_Step0 = generic('MovementAction_AcroWheelieHopFaceDown_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopFaceDown_Step1 = generic('MovementAction_AcroWheelieHopFaceDown_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopFaceUp_Step0 = generic('MovementAction_AcroWheelieHopFaceUp_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopFaceUp_Step1 = generic('MovementAction_AcroWheelieHopFaceUp_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopFaceLeft_Step0 = generic('MovementAction_AcroWheelieHopFaceLeft_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopFaceLeft_Step1 = generic('MovementAction_AcroWheelieHopFaceLeft_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopFaceRight_Step0 = generic('MovementAction_AcroWheelieHopFaceRight_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopFaceRight_Step1 = generic('MovementAction_AcroWheelieHopFaceRight_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopDown_Step0 = generic('MovementAction_AcroWheelieHopDown_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopDown_Step1 = generic('MovementAction_AcroWheelieHopDown_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopUp_Step0 = generic('MovementAction_AcroWheelieHopUp_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopUp_Step1 = generic('MovementAction_AcroWheelieHopUp_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopLeft_Step0 = generic('MovementAction_AcroWheelieHopLeft_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopLeft_Step1 = generic('MovementAction_AcroWheelieHopLeft_Step1', 'movementAction');
export const MovementAction_AcroWheelieHopRight_Step0 = generic('MovementAction_AcroWheelieHopRight_Step0', 'movementAction');
export const MovementAction_AcroWheelieHopRight_Step1 = generic('MovementAction_AcroWheelieHopRight_Step1', 'movementAction');
export const MovementAction_AcroWheelieJumpDown_Step0 = generic('MovementAction_AcroWheelieJumpDown_Step0', 'movementAction');
export const MovementAction_AcroWheelieJumpDown_Step1 = generic('MovementAction_AcroWheelieJumpDown_Step1', 'movementAction');
export const MovementAction_AcroWheelieJumpUp_Step0 = generic('MovementAction_AcroWheelieJumpUp_Step0', 'movementAction');
export const MovementAction_AcroWheelieJumpUp_Step1 = generic('MovementAction_AcroWheelieJumpUp_Step1', 'movementAction');
export const MovementAction_AcroWheelieJumpLeft_Step0 = generic('MovementAction_AcroWheelieJumpLeft_Step0', 'movementAction');
export const MovementAction_AcroWheelieJumpLeft_Step1 = generic('MovementAction_AcroWheelieJumpLeft_Step1', 'movementAction');
export const MovementAction_AcroWheelieJumpRight_Step0 = generic('MovementAction_AcroWheelieJumpRight_Step0', 'movementAction');
export const MovementAction_AcroWheelieJumpRight_Step1 = generic('MovementAction_AcroWheelieJumpRight_Step1', 'movementAction');
export const MovementAction_AcroWheelieInPlaceDown_Step0 = generic('MovementAction_AcroWheelieInPlaceDown_Step0', 'movementAction');
export const MovementAction_AcroWheelieInPlaceUp_Step0 = generic('MovementAction_AcroWheelieInPlaceUp_Step0', 'movementAction');
export const MovementAction_AcroWheelieInPlaceLeft_Step0 = generic('MovementAction_AcroWheelieInPlaceLeft_Step0', 'movementAction');
export const MovementAction_AcroWheelieInPlaceRight_Step0 = generic('MovementAction_AcroWheelieInPlaceRight_Step0', 'movementAction');
export const InitAcroPopWheelie = generic('InitAcroPopWheelie', 'generic');
export const MovementAction_AcroPopWheelieMoveDown_Step0 = generic('MovementAction_AcroPopWheelieMoveDown_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieMoveDown_Step1 = generic('MovementAction_AcroPopWheelieMoveDown_Step1', 'movementAction');
export const MovementAction_AcroPopWheelieMoveUp_Step0 = generic('MovementAction_AcroPopWheelieMoveUp_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieMoveUp_Step1 = generic('MovementAction_AcroPopWheelieMoveUp_Step1', 'movementAction');
export const MovementAction_AcroPopWheelieMoveLeft_Step0 = generic('MovementAction_AcroPopWheelieMoveLeft_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieMoveLeft_Step1 = generic('MovementAction_AcroPopWheelieMoveLeft_Step1', 'movementAction');
export const MovementAction_AcroPopWheelieMoveRight_Step0 = generic('MovementAction_AcroPopWheelieMoveRight_Step0', 'movementAction');
export const MovementAction_AcroPopWheelieMoveRight_Step1 = generic('MovementAction_AcroPopWheelieMoveRight_Step1', 'movementAction');
export const InitAcroWheelieMove = generic('InitAcroWheelieMove', 'generic');
export const MovementAction_AcroWheelieMoveDown_Step0 = generic('MovementAction_AcroWheelieMoveDown_Step0', 'movementAction');
export const MovementAction_AcroWheelieMoveDown_Step1 = generic('MovementAction_AcroWheelieMoveDown_Step1', 'movementAction');
export const MovementAction_AcroWheelieMoveUp_Step0 = generic('MovementAction_AcroWheelieMoveUp_Step0', 'movementAction');
export const MovementAction_AcroWheelieMoveUp_Step1 = generic('MovementAction_AcroWheelieMoveUp_Step1', 'movementAction');
export const MovementAction_AcroWheelieMoveLeft_Step0 = generic('MovementAction_AcroWheelieMoveLeft_Step0', 'movementAction');
export const MovementAction_AcroWheelieMoveLeft_Step1 = generic('MovementAction_AcroWheelieMoveLeft_Step1', 'movementAction');
export const MovementAction_AcroWheelieMoveRight_Step0 = generic('MovementAction_AcroWheelieMoveRight_Step0', 'movementAction');
export const MovementAction_AcroWheelieMoveRight_Step1 = generic('MovementAction_AcroWheelieMoveRight_Step1', 'movementAction');
export const InitSpin = generic('InitSpin', 'generic');
export const MovementAction_SpinDown_Step0 = generic('MovementAction_SpinDown_Step0', 'movementAction');
export const MovementAction_SpinDown_Step1 = generic('MovementAction_SpinDown_Step1', 'movementAction');
export const MovementAction_SpinUp_Step0 = generic('MovementAction_SpinUp_Step0', 'movementAction');
export const MovementAction_SpinUp_Step1 = generic('MovementAction_SpinUp_Step1', 'movementAction');
export const MovementAction_SpinLeft_Step0 = generic('MovementAction_SpinLeft_Step0', 'movementAction');
export const MovementAction_SpinLeft_Step1 = generic('MovementAction_SpinLeft_Step1', 'movementAction');
export const MovementAction_SpinRight_Step0 = generic('MovementAction_SpinRight_Step0', 'movementAction');
export const MovementAction_SpinRight_Step1 = generic('MovementAction_SpinRight_Step1', 'movementAction');
export const MovementAction_RaiseHand_Step0 = generic('MovementAction_RaiseHand_Step0', 'movementAction');
export const MovementAction_RaiseHandAndStop_Step1 = generic('MovementAction_RaiseHandAndStop_Step1', 'movementAction');
export const MovementAction_RaiseHandAndJump_Step1 = generic('MovementAction_RaiseHandAndJump_Step1', 'movementAction');
export const MovementAction_RaiseHandAndSwim_Step1 = generic('MovementAction_RaiseHandAndSwim_Step1', 'movementAction');
export const MovementAction_ShakeHeadOrWalkInPlace_Step0 = generic('MovementAction_ShakeHeadOrWalkInPlace_Step0', 'movementAction');
export const MovementAction_ShakeHeadOrWalkInPlace_Step1 = generic('MovementAction_ShakeHeadOrWalkInPlace_Step1', 'movementAction');
export const MovementAction_Finish = generic('MovementAction_Finish', 'movementAction');
export const MovementAction_PauseSpriteAnim = generic('MovementAction_PauseSpriteAnim', 'movementAction');
export const MovementAction_FlyUp_Step0 = generic('MovementAction_FlyUp_Step0', 'movementAction');
export const MovementAction_FlyUp_Step1 = generic('MovementAction_FlyUp_Step1', 'movementAction');
export const MovementAction_FlyDown_Step0 = generic('MovementAction_FlyDown_Step0', 'movementAction');
export const MovementAction_FlyDown_Step1 = generic('MovementAction_FlyDown_Step1', 'movementAction');
export const MovementAction_FlyUp_Step2 = generic('MovementAction_FlyUp_Step2', 'movementAction');
export const UpdateObjectEventSpriteAnimPause = generic('UpdateObjectEventSpriteAnimPause', 'generic');
export const TryEnableObjectEventAnim = generic('TryEnableObjectEventAnim', 'generic');
export const UpdateObjectEventVisibility = generic('UpdateObjectEventVisibility', 'generic');
export const CalcWhetherObjectIsOffscreen = generic('CalcWhetherObjectIsOffscreen', 'generic');
export const UpdateObjEventSpriteVisibility = generic('UpdateObjEventSpriteVisibility', 'generic');
export const GetAllGroundEffectFlags_OnSpawn = generic('GetAllGroundEffectFlags_OnSpawn', 'groundEffect');
export const GetAllGroundEffectFlags_OnBeginStep = generic('GetAllGroundEffectFlags_OnBeginStep', 'groundEffect');
export const GetAllGroundEffectFlags_OnFinishStep = generic('GetAllGroundEffectFlags_OnFinishStep', 'groundEffect');
export const ObjectEventUpdateMetatileBehaviors = generic('ObjectEventUpdateMetatileBehaviors', 'generic');
export const GetGroundEffectFlags_Reflection = generic('GetGroundEffectFlags_Reflection', 'groundEffect');
export const GetGroundEffectFlags_TallGrassOnSpawn = generic('GetGroundEffectFlags_TallGrassOnSpawn', 'groundEffect');
export const GetGroundEffectFlags_TallGrassOnBeginStep = generic('GetGroundEffectFlags_TallGrassOnBeginStep', 'groundEffect');
export const GetGroundEffectFlags_LongGrassOnSpawn = generic('GetGroundEffectFlags_LongGrassOnSpawn', 'groundEffect');
export const GetGroundEffectFlags_LongGrassOnBeginStep = generic('GetGroundEffectFlags_LongGrassOnBeginStep', 'groundEffect');
export const GetGroundEffectFlags_Tracks = generic('GetGroundEffectFlags_Tracks', 'groundEffect');
export const GetGroundEffectFlags_SandHeap = generic('GetGroundEffectFlags_SandHeap', 'groundEffect');
export const GetGroundEffectFlags_ShallowFlowingWater = generic('GetGroundEffectFlags_ShallowFlowingWater', 'groundEffect');
export const GetGroundEffectFlags_Puddle = generic('GetGroundEffectFlags_Puddle', 'groundEffect');
export const GetGroundEffectFlags_Ripple = generic('GetGroundEffectFlags_Ripple', 'groundEffect');
export const GetGroundEffectFlags_ShortGrass = generic('GetGroundEffectFlags_ShortGrass', 'groundEffect');
export const GetGroundEffectFlags_HotSprings = generic('GetGroundEffectFlags_HotSprings', 'groundEffect');
export const GetGroundEffectFlags_Seaweed = generic('GetGroundEffectFlags_Seaweed', 'groundEffect');
export const GetGroundEffectFlags_JumpLanding = generic('GetGroundEffectFlags_JumpLanding', 'groundEffect');
export const ObjectEventCheckForReflectiveSurface = generic('ObjectEventCheckForReflectiveSurface', 'generic');
export const GetReflectionTypeByMetatileBehavior = generic('GetReflectionTypeByMetatileBehavior', 'generic');
export const GetLedgeJumpDirection = generic('GetLedgeJumpDirection', 'generic');
export const SetObjectEventSpriteOamTableForLongGrass = generic('SetObjectEventSpriteOamTableForLongGrass', 'generic');
export const IsElevationMismatchAt = generic('IsElevationMismatchAt', 'generic');
export const UpdateObjectEventElevationAndPriority = generic('UpdateObjectEventElevationAndPriority', 'generic');
export const InitObjectPriorityByElevation = generic('InitObjectPriorityByElevation', 'generic');
export const ElevationToPriority = generic('ElevationToPriority', 'generic');
export const ObjectEventUpdateElevation = generic('ObjectEventUpdateElevation', 'generic');
export const SetObjectSubpriorityByElevation = generic('SetObjectSubpriorityByElevation', 'generic');
export const ObjectEventUpdateSubpriority = generic('ObjectEventUpdateSubpriority', 'generic');
export const AreElevationsCompatible = generic('AreElevationsCompatible', 'generic');
export const GroundEffect_SpawnOnTallGrass = generic('GroundEffect_SpawnOnTallGrass', 'groundEffect');
export const GroundEffect_StepOnTallGrass = generic('GroundEffect_StepOnTallGrass', 'groundEffect');
export const GroundEffect_SpawnOnLongGrass = generic('GroundEffect_SpawnOnLongGrass', 'groundEffect');
export const GroundEffect_StepOnLongGrass = generic('GroundEffect_StepOnLongGrass', 'groundEffect');
export const GroundEffect_WaterReflection = generic('GroundEffect_WaterReflection', 'groundEffect');
export const GroundEffect_IceReflection = generic('GroundEffect_IceReflection', 'groundEffect');
export const GroundEffect_FlowingWater = generic('GroundEffect_FlowingWater', 'groundEffect');
export const GroundEffect_SandTracks = generic('GroundEffect_SandTracks', 'groundEffect');
export const GroundEffect_DeepSandTracks = generic('GroundEffect_DeepSandTracks', 'groundEffect');
export const DoTracksGroundEffect_None = generic('DoTracksGroundEffect_None', 'groundEffect');
export const DoTracksGroundEffect_Footprints = generic('DoTracksGroundEffect_Footprints', 'groundEffect');
export const DoTracksGroundEffect_BikeTireTracks = generic('DoTracksGroundEffect_BikeTireTracks', 'groundEffect');
export const GroundEffect_Ripple = generic('GroundEffect_Ripple', 'groundEffect');
export const GroundEffect_StepOnPuddle = generic('GroundEffect_StepOnPuddle', 'groundEffect');
export const GroundEffect_SandHeap = generic('GroundEffect_SandHeap', 'groundEffect');
export const GroundEffect_JumpOnTallGrass = generic('GroundEffect_JumpOnTallGrass', 'groundEffect');
export const GroundEffect_JumpOnLongGrass = generic('GroundEffect_JumpOnLongGrass', 'groundEffect');
export const GroundEffect_JumpOnShallowWater = generic('GroundEffect_JumpOnShallowWater', 'groundEffect');
export const GroundEffect_JumpOnWater = generic('GroundEffect_JumpOnWater', 'groundEffect');
export const GroundEffect_JumpLandingDust = generic('GroundEffect_JumpLandingDust', 'groundEffect');
export const GroundEffect_ShortGrass = generic('GroundEffect_ShortGrass', 'groundEffect');
export const GroundEffect_HotSprings = generic('GroundEffect_HotSprings', 'groundEffect');
export const GroundEffect_Seaweed = generic('GroundEffect_Seaweed', 'groundEffect');
export const DoFlaggedGroundEffects = generic('DoFlaggedGroundEffects', 'groundEffect');
export const filters_out_some_ground_effects = generic('filters_out_some_ground_effects', 'generic');
export const FilterOutStepOnPuddleGroundEffectIfJumping = generic('FilterOutStepOnPuddleGroundEffectIfJumping', 'groundEffect');
export const DoGroundEffects_OnSpawn = generic('DoGroundEffects_OnSpawn', 'groundEffect');
export const DoGroundEffects_OnBeginStep = generic('DoGroundEffects_OnBeginStep', 'groundEffect');
export const DoGroundEffects_OnFinishStep = generic('DoGroundEffects_OnFinishStep', 'groundEffect');
export const FreezeObjectEvent = generic('FreezeObjectEvent', 'generic');
export const FreezeObjectEvents = generic('FreezeObjectEvents', 'generic');
export const FreezeObjectEventsExceptOne = generic('FreezeObjectEventsExceptOne', 'generic');
export const UnfreezeObjectEvent = generic('UnfreezeObjectEvent', 'generic');
export const UnfreezeObjectEvents = generic('UnfreezeObjectEvents', 'generic');
export const Step1 = generic('Step1', 'step');
export const Step2 = generic('Step2', 'step');
export const Step3 = generic('Step3', 'step');
export const Step4 = generic('Step4', 'step');
export const Step8 = generic('Step8', 'step');
export const SetSpriteDataForNormalStep = generic('SetSpriteDataForNormalStep', 'generic');
export const NpcTakeStep = generic('NpcTakeStep', 'generic');
export const SetWalkSlowerSpriteData = generic('SetWalkSlowerSpriteData', 'generic');
export const UpdateWalkSlowerAnim = generic('UpdateWalkSlowerAnim', 'generic');
export const SetWalkSlowSpriteData = generic('SetWalkSlowSpriteData', 'generic');
export const UpdateWalkSlowAnim = generic('UpdateWalkSlowAnim', 'generic');
export const SetWalkSlowestSpriteData = generic('SetWalkSlowestSpriteData', 'generic');
export const UpdateWalkSlowestAnim = generic('UpdateWalkSlowestAnim', 'generic');
export const SetRunSlowSpriteData = generic('SetRunSlowSpriteData', 'generic');
export const UpdateRunSlowAnim = generic('UpdateRunSlowAnim', 'generic');
export const GetJumpY = generic('GetJumpY', 'generic');
export const SetJumpSpriteData = generic('SetJumpSpriteData', 'generic');
export const DoJumpSpriteMovement = generic('DoJumpSpriteMovement', 'generic');
export const DoJumpSpecialSpriteMovement = generic('DoJumpSpecialSpriteMovement', 'generic');
export const SetMovementDelay = generic('SetMovementDelay', 'generic');
export const WaitForMovementDelay = generic('WaitForMovementDelay', 'generic');
export const SetAndStartSpriteAnim = generic('SetAndStartSpriteAnim', 'generic');
export const SpriteAnimEnded = generic('SpriteAnimEnded', 'generic');
export const UpdateObjectEventSpriteInvisibility = generic('UpdateObjectEventSpriteInvisibility', 'generic');
export const SpriteCB_VirtualObject = generic('SpriteCB_VirtualObject', 'generic');
export const DestroyVirtualObjects = generic('DestroyVirtualObjects', 'generic');
export const GetVirtualObjectSpriteId = (runtime: EventObjectMovementRuntime, virtualObjId: number): number => {
  for (let i = 0; i < MAX_SPRITES; i += 1) {
    const sprite = runtime.sprites[i] ?? runtime.virtualObjects[i];
    if (!sprite || sprite.destroyed) continue;
    if (sprite.callback === 'SpriteCB_VirtualObject' && (sprite.data[0] & 0xff) === (virtualObjId & 0xff)) return i;
  }
  return MAX_SPRITES;
};
export const TurnVirtualObject = generic('TurnVirtualObject', 'generic');
export const SetVirtualObjectGraphics = generic('SetVirtualObjectGraphics', 'generic');
export const SetVirtualObjectInvisibility = generic('SetVirtualObjectInvisibility', 'generic');
export const IsVirtualObjectInvisible = generic('IsVirtualObjectInvisible', 'generic');
export const SetVirtualObjectSpriteAnim = generic('SetVirtualObjectSpriteAnim', 'generic');
export const MoveUnionRoomObjectUp = generic('MoveUnionRoomObjectUp', 'generic');
export const MoveUnionRoomObjectDown = generic('MoveUnionRoomObjectDown', 'generic');
export const VirtualObject_UpdateAnim = generic('VirtualObject_UpdateAnim', 'generic');
export const IsVirtualObjectAnimating = generic('IsVirtualObjectAnimating', 'generic');
export const StartFieldEffectForObjectEvent = generic('StartFieldEffectForObjectEvent', 'generic');
export const DoShadowFieldEffect = generic('DoShadowFieldEffect', 'generic');
export const DoRippleFieldEffect = generic('DoRippleFieldEffect', 'generic');
