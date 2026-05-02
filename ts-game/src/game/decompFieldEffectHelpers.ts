export const MAX_SPRITES = 64;
export const OBJECT_EVENTS_COUNT = 16;
export const OBJ_EVENT_PAL_TAG_NONE = 0x11ff;

export const ST_OAM_HFLIP = 8;
export const ST_OAM_VFLIP = 16;
export const ST_OAM_AFFINE_NORMAL = 1;
export const SUBSPRITES_OFF = 0;

export const PALSLOT_PLAYER = 0;
export const PALSLOT_NPC_SPECIAL = 1;

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const BOB_NONE = 0;
export const BOB_MON_ONLY = 2;

export const SE_PUDDLE = 63;

export const SHADOW_SIZE_S = 0;
export const SHADOW_SIZE_M = 1;
export const SHADOW_SIZE_L = 2;
export const SHADOW_SIZE_XL = 3;

export const FLDEFF_SHADOW = 0;
export const FLDEFF_TALL_GRASS = 1;
export const FLDEFF_LONG_GRASS = 2;
export const FLDEFF_SHORT_GRASS = 3;
export const FLDEFF_SAND_FOOTPRINTS = 4;
export const FLDEFF_DEEP_SAND_FOOTPRINTS = 5;
export const FLDEFF_BIKE_TIRE_TRACKS = 6;
export const FLDEFF_SPLASH = 7;
export const FLDEFF_JUMP_SMALL_SPLASH = 8;
export const FLDEFF_JUMP_BIG_SPLASH = 9;
export const FLDEFF_FEET_IN_FLOWING_WATER = 10;
export const FLDEFF_RIPPLE = 11;
export const FLDEFF_HOT_SPRINGS_WATER = 12;
export const FLDEFF_UNUSED_GRASS = 13;
export const FLDEFF_UNUSED_GRASS_2 = 14;
export const FLDEFF_UNUSED_SAND = 15;
export const FLDEFF_UNUSED_WATER_SURFACING = 16;
export const FLDEFF_ASH = 17;
export const FLDEFF_SURF_BLOB = 18;
export const FLDEFF_SAND_PILE = 19;
export const FLDEFF_BUBBLES = 20;
export const FLDEFF_BERRY_TREE_GROWTH_SPARKLE = 21;
export const FLDEFF_TREE_DISGUISE = 22;
export const FLDEFF_MOUNTAIN_DISGUISE = 23;
export const FLDEFF_SAND_DISGUISE = 24;
export const FLDEFF_SPARKLE = 25;

export const FLDEFFOBJ_ARROW = 0;
export const FLDEFFOBJ_TALL_GRASS = 1;
export const FLDEFFOBJ_JUMP_TALL_GRASS = 2;
export const FLDEFFOBJ_LONG_GRASS = 3;
export const FLDEFFOBJ_JUMP_LONG_GRASS = 4;
export const FLDEFFOBJ_SHORT_GRASS = 5;
export const FLDEFFOBJ_SAND_FOOTPRINTS = 6;
export const FLDEFFOBJ_DEEP_SAND_FOOTPRINTS = 7;
export const FLDEFFOBJ_BIKE_TIRE_TRACKS = 8;
export const FLDEFFOBJ_SPLASH = 9;
export const FLDEFFOBJ_JUMP_SMALL_SPLASH = 10;
export const FLDEFFOBJ_JUMP_BIG_SPLASH = 11;
export const FLDEFFOBJ_RIPPLE = 12;
export const FLDEFFOBJ_HOT_SPRINGS_WATER = 13;
export const FLDEFFOBJ_UNUSED_GRASS = 14;
export const FLDEFFOBJ_UNUSED_GRASS_2 = 15;
export const FLDEFFOBJ_UNUSED_SAND = 16;
export const FLDEFFOBJ_WATER_SURFACING = 17;
export const FLDEFFOBJ_ASH = 18;
export const FLDEFFOBJ_SURF_BLOB = 19;
export const FLDEFFOBJ_GROUND_IMPACT_DUST = 20;
export const FLDEFFOBJ_SAND_PILE = 21;
export const FLDEFFOBJ_BUBBLES = 22;
export const FLDEFFOBJ_SPARKLE = 23;
export const FLDEFFOBJ_TREE_DISGUISE = 24;
export const FLDEFFOBJ_MOUNTAIN_DISGUISE = 25;
export const FLDEFFOBJ_SAND_DISGUISE = 26;
export const FLDEFFOBJ_SMALL_SPARKLE = 27;
export const FLDEFFOBJ_SHADOW_S = 28;
export const FLDEFFOBJ_SHADOW_M = 29;
export const FLDEFFOBJ_SHADOW_L = 30;
export const FLDEFFOBJ_SHADOW_XL = 31;

export const gShadowEffectTemplateIds = [FLDEFFOBJ_SHADOW_S, FLDEFFOBJ_SHADOW_M, FLDEFFOBJ_SHADOW_L, FLDEFFOBJ_SHADOW_XL] as const;
export const gShadowVerticalOffsets = [4, 4, 4, 16] as const;
export const gReflectionEffectPaletteMap = Array.from({ length: 16 }, (_, i) => i ^ 8);

export type FieldEffectCallback =
  | 'SpriteCallbackDummy'
  | 'UpdateObjectReflectionSprite'
  | 'UpdateShadowFieldEffect'
  | 'UpdateTallGrassFieldEffect'
  | 'UpdateLongGrassFieldEffect'
  | 'UpdateShortGrassFieldEffect'
  | 'UpdateFootprintsTireTracksFieldEffect'
  | 'UpdateSplashFieldEffect'
  | 'UpdateFeetInFlowingWaterFieldEffect'
  | 'UpdateHotSpringsWaterFieldEffect'
  | 'UpdateAshFieldEffect'
  | 'UpdateSurfBlobFieldEffect'
  | 'SpriteCB_UnderwaterSurfBlob'
  | 'UpdateSandPileFieldEffect'
  | 'UpdateBubblesFieldEffect'
  | 'UpdateDisguiseFieldEffect'
  | 'UpdateSparkleFieldEffect'
  | 'UpdateJumpImpactEffect'
  | 'WaitFieldEffectSpriteAnim';

export interface FieldEffectOam {
  priority: number;
  paletteNum: number;
  affineMode: number;
  matrixNum: number;
  shape: number;
  size: number;
  tileNum: number;
}

export interface FieldEffectSprite {
  id: number;
  inUse: boolean;
  template: string;
  callback: FieldEffectCallback;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  oam: FieldEffectOam;
  invisible: boolean;
  usingSheet: boolean;
  anims: string;
  affineAnims: string;
  affineAnimBeginning: boolean;
  subspriteMode: number;
  subspriteTables: string;
  subspriteTableNum: number;
  centerToCornerVecX: number;
  centerToCornerVecY: number;
  coordOffsetEnabled: boolean | number;
  subpriority: number;
  animEnded: boolean;
  animPaused: boolean;
  animCmdIndex: number;
}

export interface ObjectEvent {
  active: boolean;
  localId: number;
  mapNum: number;
  mapGroup: number;
  spriteId: number;
  graphicsId: number;
  hasReflection: boolean;
  hasShadow: boolean;
  currentMetatileBehavior: number;
  previousMetatileBehavior: number;
  currentCoords: { x: number; y: number };
  previousCoords: { x: number; y: number };
  inShortGrass: boolean;
  inShallowFlowingWater: boolean;
  inHotSprings: boolean;
  inSandPile: boolean;
  movementDirection: number;
  fieldEffectSpriteId: number;
  directionSequenceIndex: number;
  triggerGroundEffectsOnMove: boolean;
}

export interface ObjectEventGraphicsInfo {
  height: number;
  disableReflectionPaletteLoad: boolean;
  reflectionPaletteTag: number;
  paletteSlot: number;
  paletteTag: number;
  shadowSize: number;
}

export interface FieldEffectHelpersRuntime {
  gSprites: FieldEffectSprite[];
  gObjectEvents: ObjectEvent[];
  graphicsInfo: Record<number, ObjectEventGraphicsInfo>;
  gFieldEffectArguments: number[];
  gCamera: { active: boolean; x: number; y: number };
  location: { mapNum: number; mapGroup: number };
  gPlayerAvatar: { objectEventId: number };
  mapMetatileBehaviors: Map<string, number>;
  mapElevations: Map<string, number>;
  operations: string[];
  sounds: number[];
  stoppedEffects: Array<{ spriteId: number; effect: number }>;
  removedActiveEffects: number[];
  startedEffects: number[];
  metatileWrites: Array<{ x: number; y: number; metatileId: number }>;
}

export const createFieldEffectHelpersRuntime = (overrides: Partial<FieldEffectHelpersRuntime> = {}): FieldEffectHelpersRuntime => {
  const gSprites = Array.from({ length: 8 }, (_, id) => createSprite(id, 'dummy', 0, 0, 0));
  const gObjectEvents = Array.from({ length: OBJECT_EVENTS_COUNT }, (_, i) => createObjectEvent(i));
  const runtime: FieldEffectHelpersRuntime = {
    gSprites,
    gObjectEvents,
    graphicsInfo: { 0: createGraphicsInfo() },
    gFieldEffectArguments: Array.from({ length: 8 }, () => 0),
    gCamera: { active: false, x: 0, y: 0 },
    location: { mapNum: 0, mapGroup: 0 },
    gPlayerAvatar: { objectEventId: 0 },
    mapMetatileBehaviors: new Map(),
    mapElevations: new Map(),
    operations: [],
    sounds: [],
    stoppedEffects: [],
    removedActiveEffects: [],
    startedEffects: [],
    metatileWrites: []
  };
  return Object.assign(runtime, overrides);
};

export const createSprite = (id: number, template: string, x: number, y: number, subpriority: number): FieldEffectSprite => ({
  id,
  inUse: true,
  template,
  callback: callbackForTemplate(template),
  x,
  y,
  x2: 0,
  y2: 0,
  data: Array.from({ length: 8 }, () => 0),
  oam: { priority: 0, paletteNum: 0, affineMode: 0, matrixNum: 0, shape: 0, size: 0, tileNum: 0 },
  invisible: false,
  usingSheet: false,
  anims: '',
  affineAnims: '',
  affineAnimBeginning: false,
  subspriteMode: 0,
  subspriteTables: '',
  subspriteTableNum: 0,
  centerToCornerVecX: 8,
  centerToCornerVecY: 8,
  coordOffsetEnabled: false,
  subpriority,
  animEnded: false,
  animPaused: false,
  animCmdIndex: 0
});

export const createObjectEvent = (id: number): ObjectEvent => ({
  active: true,
  localId: id,
  mapNum: 0,
  mapGroup: 0,
  spriteId: id < 8 ? id : 0,
  graphicsId: 0,
  hasReflection: true,
  hasShadow: true,
  currentMetatileBehavior: 0,
  previousMetatileBehavior: 0,
  currentCoords: { x: 0, y: 0 },
  previousCoords: { x: 0, y: 0 },
  inShortGrass: false,
  inShallowFlowingWater: false,
  inHotSprings: false,
  inSandPile: false,
  movementDirection: DIR_SOUTH,
  fieldEffectSpriteId: 0,
  directionSequenceIndex: 0,
  triggerGroundEffectsOnMove: false
});

export const createGraphicsInfo = (overrides: Partial<ObjectEventGraphicsInfo> = {}): ObjectEventGraphicsInfo => ({
  height: 32,
  disableReflectionPaletteLoad: false,
  reflectionPaletteTag: 1,
  paletteSlot: 2,
  paletteTag: 100,
  shadowSize: SHADOW_SIZE_M,
  ...overrides
});

export const SetUpReflection = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent, sprite: FieldEffectSprite, stillReflection: boolean): void => {
  const reflectionSprite = runtime.gSprites[createCopySpriteAt(runtime, sprite, sprite.x, sprite.y, 0x98)];
  reflectionSprite.callback = 'UpdateObjectReflectionSprite';
  reflectionSprite.oam.priority = 3;
  reflectionSprite.oam.paletteNum = gReflectionEffectPaletteMap[reflectionSprite.oam.paletteNum] ?? reflectionSprite.oam.paletteNum;
  reflectionSprite.usingSheet = true;
  reflectionSprite.anims = 'gDummySpriteAnimTable';
  startSpriteAnim(runtime, reflectionSprite, 0);
  reflectionSprite.affineAnims = 'gDummySpriteAffineAnimTable';
  reflectionSprite.affineAnimBeginning = true;
  reflectionSprite.subspriteMode = SUBSPRITES_OFF;
  reflectionSprite.data[0] = sprite.data[0];
  reflectionSprite.data[1] = objectEvent.localId;
  reflectionSprite.data[7] = stillReflection ? 1 : 0;
  LoadObjectReflectionPalette(runtime, objectEvent, reflectionSprite);
  if (!stillReflection) reflectionSprite.oam.affineMode = ST_OAM_AFFINE_NORMAL;
};

export const GetReflectionVerticalOffset = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent): number =>
  getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId).height - 2;

export const LoadObjectReflectionPalette = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent, sprite: FieldEffectSprite): void => {
  const bridgeReflectionVerticalOffsets = [12, 28, 44];
  sprite.data[2] = 0;
  const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
  const previousBridge = metatileBehaviorGetBridgeType(objectEvent.previousMetatileBehavior);
  const currentBridge = metatileBehaviorGetBridgeType(objectEvent.currentMetatileBehavior);
  const bridgeType = previousBridge || currentBridge;
  if (!info.disableReflectionPaletteLoad && bridgeType) {
    sprite.data[2] = bridgeReflectionVerticalOffsets[bridgeType - 1] ?? 0;
    LoadObjectHighBridgeReflectionPalette(runtime, objectEvent, sprite.oam.paletteNum);
  } else {
    LoadObjectRegularReflectionPalette(runtime, objectEvent, sprite.oam.paletteNum);
  }
};

export const LoadObjectRegularReflectionPalette = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent, paletteIndex: number): void => {
  const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
  if (info.reflectionPaletteTag !== OBJ_EVENT_PAL_TAG_NONE) {
    if (info.paletteSlot === PALSLOT_PLAYER) runtime.operations.push(`LoadPlayerObjectReflectionPalette:${info.paletteTag}:${paletteIndex}`);
    else if (info.paletteSlot === PALSLOT_NPC_SPECIAL) runtime.operations.push(`LoadSpecialObjectReflectionPalette:${info.paletteTag}:${paletteIndex}`);
    else runtime.operations.push(`PatchObjectPalette:${getObjectPaletteTag(paletteIndex)}:${paletteIndex}`);
    runtime.operations.push(`UpdateSpritePaletteWithWeather:${paletteIndex}`);
  }
};

export const LoadObjectHighBridgeReflectionPalette = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent, paletteNum: number): void => {
  const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
  if (info.reflectionPaletteTag !== OBJ_EVENT_PAL_TAG_NONE) {
    runtime.operations.push(`PatchObjectPalette:${info.reflectionPaletteTag}:${paletteNum}`);
    runtime.operations.push(`UpdateSpritePaletteWithWeather:${paletteNum}`);
  }
};

export const UpdateObjectReflectionSprite = (runtime: FieldEffectHelpersRuntime, reflectionSprite: FieldEffectSprite): void => {
  const objectEvent = runtime.gObjectEvents[reflectionSprite.data[0]];
  const mainSprite = runtime.gSprites[objectEvent.spriteId];
  if (!objectEvent.active || !objectEvent.hasReflection || objectEvent.localId !== reflectionSprite.data[1]) {
    reflectionSprite.inUse = false;
    return;
  }
  reflectionSprite.oam.paletteNum = gReflectionEffectPaletteMap[mainSprite.oam.paletteNum] ?? mainSprite.oam.paletteNum;
  reflectionSprite.oam.shape = mainSprite.oam.shape;
  reflectionSprite.oam.size = mainSprite.oam.size;
  reflectionSprite.oam.matrixNum = mainSprite.oam.matrixNum | ST_OAM_VFLIP;
  reflectionSprite.oam.tileNum = mainSprite.oam.tileNum;
  reflectionSprite.subspriteTables = mainSprite.subspriteTables;
  reflectionSprite.subspriteTableNum = mainSprite.subspriteTableNum;
  reflectionSprite.invisible = mainSprite.invisible;
  reflectionSprite.x = mainSprite.x;
  reflectionSprite.y = mainSprite.y + GetReflectionVerticalOffset(runtime, objectEvent) + reflectionSprite.data[2];
  reflectionSprite.centerToCornerVecX = mainSprite.centerToCornerVecX;
  reflectionSprite.centerToCornerVecY = mainSprite.centerToCornerVecY;
  reflectionSprite.x2 = mainSprite.x2;
  reflectionSprite.y2 = -mainSprite.y2;
  reflectionSprite.coordOffsetEnabled = mainSprite.coordOffsetEnabled;
  if (reflectionSprite.data[7] === 0) reflectionSprite.oam.matrixNum = (mainSprite.oam.matrixNum & ST_OAM_HFLIP) ? 1 : 0;
};

export const CreateWarpArrowSprite = (runtime: FieldEffectHelpersRuntime): number => {
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_ARROW, 0, 0, 0x52);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.oam.priority = 1;
    sprite.coordOffsetEnabled = true;
    sprite.invisible = true;
  }
  return spriteId;
};

export const SetSpriteInvisible = (runtime: FieldEffectHelpersRuntime, spriteId: number): void => {
  runtime.gSprites[spriteId].invisible = true;
};

export const ShowWarpArrowSprite = (runtime: FieldEffectHelpersRuntime, spriteId: number, direction: number, x: number, y: number): void => {
  const sprite = runtime.gSprites[spriteId];
  if (sprite.invisible || sprite.data[0] !== x || sprite.data[1] !== y) {
    const [x2, y2] = setSpritePosToMapCoords(x, y);
    sprite.x = x2 + 8;
    sprite.y = y2 + 8;
    sprite.invisible = false;
    sprite.data[0] = x;
    sprite.data[1] = y;
    startSpriteAnim(runtime, sprite, direction - 1);
  }
};

export const FldEff_Shadow = (runtime: FieldEffectHelpersRuntime): number => {
  const objectEventId = getObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]);
  const info = getObjectEventGraphicsInfo(runtime, runtime.gObjectEvents[objectEventId].graphicsId);
  const spriteId = createSpriteAtEnd(runtime, gShadowEffectTemplateIds[info.shadowSize], 0, 0, 0x94);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.data[0] = runtime.gFieldEffectArguments[0];
    sprite.data[1] = runtime.gFieldEffectArguments[1];
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.data[3] = (info.height >> 1) - gShadowVerticalOffsets[info.shadowSize];
  }
  return 0;
};

export const UpdateShadowFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[0], sprite.data[1], sprite.data[2]);
  if (objectEventId === undefined) return fieldEffectStop(runtime, sprite, FLDEFF_SHADOW);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const linkedSprite = runtime.gSprites[objectEvent.spriteId];
  sprite.oam.priority = linkedSprite.oam.priority;
  sprite.x = linkedSprite.x;
  sprite.y = linkedSprite.y + sprite.data[3];
  if (!objectEvent.active || !objectEvent.hasShadow
    || metatileBehaviorIsPokeGrass(objectEvent.currentMetatileBehavior)
    || metatileBehaviorIsSurfable(objectEvent.currentMetatileBehavior)
    || metatileBehaviorIsSurfable(objectEvent.previousMetatileBehavior)
    || metatileBehaviorIsReflective(objectEvent.currentMetatileBehavior)
    || metatileBehaviorIsReflective(objectEvent.previousMetatileBehavior)) {
    fieldEffectStop(runtime, sprite, FLDEFF_SHADOW);
  }
};

export const FldEff_TallGrass = (runtime: FieldEffectHelpersRuntime): number => createGrass(runtime, FLDEFFOBJ_TALL_GRASS, false, 8, 8);
export const FldEff_JumpTallGrass = (runtime: FieldEffectHelpersRuntime): number => createJumpImpact(runtime, FLDEFFOBJ_JUMP_TALL_GRASS, 8, 12, FLDEFF_JUMP_BIG_SPLASH, 12);
export const FldEff_LongGrass = (runtime: FieldEffectHelpersRuntime): number => createGrass(runtime, FLDEFFOBJ_LONG_GRASS, true, 8, 8);
export const FldEff_JumpLongGrass = (runtime: FieldEffectHelpersRuntime): number => createJumpImpact(runtime, FLDEFFOBJ_JUMP_LONG_GRASS, 8, 8, FLDEFF_JUMP_BIG_SPLASH, 18);

export const UpdateTallGrassFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => updateGrass(runtime, sprite, FLDEFF_TALL_GRASS, metatileBehaviorIsTallGrass, true);
export const UpdateLongGrassFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => updateGrass(runtime, sprite, FLDEFF_LONG_GRASS, metatileBehaviorIsLongGrass, false);

export const FindTallGrassFieldEffectSpriteId = (runtime: FieldEffectHelpersRuntime, localId: number, mapNum: number, mapGroup: number, x: number, y: number): number => {
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = runtime.gSprites[i];
    if (sprite?.inUse && sprite.callback === 'UpdateTallGrassFieldEffect' && x === sprite.data[1] && y === sprite.data[2]
      && localId === (sprite.data[3] >> 8) && mapNum === (sprite.data[3] & 0xff) && mapGroup === sprite.data[4]) return i;
  }
  return MAX_SPRITES;
};

export const FldEff_ShortGrass = (runtime: FieldEffectHelpersRuntime): number => {
  const objectEventId = getObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_SHORT_GRASS, 0, 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    const linked = runtime.gSprites[objectEvent.spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = linked.oam.priority;
    sprite.data[0] = runtime.gFieldEffectArguments[0];
    sprite.data[1] = runtime.gFieldEffectArguments[1];
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.data[3] = linked.x;
    sprite.data[4] = linked.y;
  }
  return 0;
};

export const UpdateShortGrassFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[0], sprite.data[1], sprite.data[2]);
  if (objectEventId === undefined || !runtime.gObjectEvents[objectEventId].inShortGrass) return fieldEffectStop(runtime, sprite, FLDEFF_SHORT_GRASS);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
  const linked = runtime.gSprites[objectEvent.spriteId];
  if (linked.x !== sprite.data[3] || linked.y !== sprite.data[4]) {
    sprite.data[3] = linked.x;
    sprite.data[4] = linked.y;
    if (sprite.animEnded) startSpriteAnim(runtime, sprite, 0);
  }
  sprite.x = linked.x;
  sprite.y = linked.y;
  sprite.y2 = (info.height >> 1) - 8;
  sprite.subpriority = linked.subpriority - 1;
  sprite.oam.priority = linked.oam.priority;
  updateObjectEventSpriteInvisibility(runtime, sprite, linked.invisible);
};

export const FldEff_SandFootprints = (runtime: FieldEffectHelpersRuntime): number => createFootprint(runtime, FLDEFFOBJ_SAND_FOOTPRINTS, FLDEFF_SAND_FOOTPRINTS, false);
export const FldEff_DeepSandFootprints = (runtime: FieldEffectHelpersRuntime): number => createFootprint(runtime, FLDEFFOBJ_DEEP_SAND_FOOTPRINTS, FLDEFF_DEEP_SAND_FOOTPRINTS, true);
export const FldEff_BikeTireTracks = (runtime: FieldEffectHelpersRuntime): number => createFootprint(runtime, FLDEFFOBJ_BIKE_TIRE_TRACKS, FLDEFF_BIKE_TIRE_TRACKS, true);

export const UpdateFootprintsTireTracksFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  if (sprite.data[0] === 0) FadeFootprintsTireTracks_Step0(runtime, sprite);
  else FadeFootprintsTireTracks_Step1(runtime, sprite);
};

export const FadeFootprintsTireTracks_Step0 = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  if (++sprite.data[1] > 40) sprite.data[0] = 1;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
};

export const FadeFootprintsTireTracks_Step1 = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  sprite.invisible = !sprite.invisible;
  sprite.data[1]++;
  updateObjectEventSpriteInvisibility(runtime, sprite, sprite.invisible);
  if (sprite.data[1] > 56) fieldEffectStop(runtime, sprite, sprite.data[7]);
};

export const FldEff_Splash = (runtime: FieldEffectHelpersRuntime): number => {
  const objectEventId = getObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_SPLASH, 0, 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
    const sprite = runtime.gSprites[spriteId];
    const linked = runtime.gSprites[objectEvent.spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = linked.oam.priority;
    sprite.data[0] = runtime.gFieldEffectArguments[0];
    sprite.data[1] = runtime.gFieldEffectArguments[1];
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.y2 = (info.height >> 1) - 4;
    playSE(runtime, SE_PUDDLE);
  }
  return 0;
};

export const UpdateSplashFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[0], sprite.data[1], sprite.data[2]);
  if (sprite.animEnded || objectEventId === undefined) return fieldEffectStop(runtime, sprite, FLDEFF_SPLASH);
  const linked = runtime.gSprites[runtime.gObjectEvents[objectEventId].spriteId];
  sprite.x = linked.x;
  sprite.y = linked.y;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
};

export const FldEff_JumpSmallSplash = (runtime: FieldEffectHelpersRuntime): number => createJumpImpact(runtime, FLDEFFOBJ_JUMP_SMALL_SPLASH, 8, 12, FLDEFF_JUMP_SMALL_SPLASH);
export const FldEff_JumpBigSplash = (runtime: FieldEffectHelpersRuntime): number => createJumpImpact(runtime, FLDEFFOBJ_JUMP_BIG_SPLASH, 8, 8, FLDEFF_JUMP_BIG_SPLASH);

export const FldEff_FeetInFlowingWater = (runtime: FieldEffectHelpersRuntime): number => {
  const objectEventId = getObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_SPLASH, 0, 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
    const sprite = runtime.gSprites[spriteId];
    sprite.callback = 'UpdateFeetInFlowingWaterFieldEffect';
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = runtime.gSprites[objectEvent.spriteId].oam.priority;
    sprite.data[0] = runtime.gFieldEffectArguments[0];
    sprite.data[1] = runtime.gFieldEffectArguments[1];
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.data[3] = -1;
    sprite.data[4] = -1;
    sprite.y2 = (info.height >> 1) - 4;
    startSpriteAnim(runtime, sprite, 1);
  }
  return 0;
};

export const UpdateFeetInFlowingWaterFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[0], sprite.data[1], sprite.data[2]);
  if (objectEventId === undefined || !runtime.gObjectEvents[objectEventId].inShallowFlowingWater) return fieldEffectStop(runtime, sprite, FLDEFF_FEET_IN_FLOWING_WATER);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const linked = runtime.gSprites[objectEvent.spriteId];
  sprite.x = linked.x;
  sprite.y = linked.y;
  sprite.subpriority = linked.subpriority;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
  if (objectEvent.currentCoords.x !== sprite.data[3] || objectEvent.currentCoords.y !== sprite.data[4]) {
    sprite.data[3] = objectEvent.currentCoords.x;
    sprite.data[4] = objectEvent.currentCoords.y;
    if (!sprite.invisible) playSE(runtime, SE_PUDDLE);
  }
};

export const FldEff_Ripple = (runtime: FieldEffectHelpersRuntime): number => createSimpleAtArgs(runtime, FLDEFFOBJ_RIPPLE, FLDEFF_RIPPLE, false);

export const FldEff_HotSpringsWater = (runtime: FieldEffectHelpersRuntime): number => {
  const objectEventId = getObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_HOT_SPRINGS_WATER, 0, 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const linked = runtime.gSprites[objectEvent.spriteId];
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = linked.oam.priority;
    sprite.data[0] = runtime.gFieldEffectArguments[0];
    sprite.data[1] = runtime.gFieldEffectArguments[1];
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.data[3] = linked.x;
    sprite.data[4] = linked.y;
  }
  return 0;
};

export const UpdateHotSpringsWaterFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[0], sprite.data[1], sprite.data[2]);
  if (objectEventId === undefined || !runtime.gObjectEvents[objectEventId].inHotSprings) return fieldEffectStop(runtime, sprite, FLDEFF_HOT_SPRINGS_WATER);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
  const linked = runtime.gSprites[objectEvent.spriteId];
  sprite.x = linked.x;
  sprite.y = (info.height >> 1) + linked.y - 8;
  sprite.subpriority = linked.subpriority - 1;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
};

export const FldEff_UnusedGrass = (runtime: FieldEffectHelpersRuntime): number => createSimpleAtArgs(runtime, FLDEFFOBJ_UNUSED_GRASS, FLDEFF_UNUSED_GRASS, true);
export const FldEff_UnusedGrass2 = (runtime: FieldEffectHelpersRuntime): number => createSimpleAtArgs(runtime, FLDEFFOBJ_UNUSED_GRASS_2, FLDEFF_UNUSED_GRASS_2, true);
export const FldEff_UnusedSand = (runtime: FieldEffectHelpersRuntime): number => createSimpleAtArgs(runtime, FLDEFFOBJ_UNUSED_SAND, FLDEFF_UNUSED_SAND, true);
export const FldEff_UnusedWaterSurfacing = (runtime: FieldEffectHelpersRuntime): number => createSimpleAtArgs(runtime, FLDEFFOBJ_WATER_SURFACING, FLDEFF_UNUSED_WATER_SURFACING, true);

export const StartAshFieldEffect = (runtime: FieldEffectHelpersRuntime, x: number, y: number, metatileId: number, d: number): void => {
  runtime.gFieldEffectArguments[0] = x;
  runtime.gFieldEffectArguments[1] = y;
  runtime.gFieldEffectArguments[2] = 0x52;
  runtime.gFieldEffectArguments[3] = 1;
  runtime.gFieldEffectArguments[4] = metatileId;
  runtime.gFieldEffectArguments[5] = d;
  fieldEffectStart(runtime, FLDEFF_ASH);
};

export const FldEff_Ash = (runtime: FieldEffectHelpersRuntime): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, 8, 8);
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_ASH, x, y, runtime.gFieldEffectArguments[2]);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = runtime.gFieldEffectArguments[3];
    sprite.data[1] = runtime.gFieldEffectArguments[0];
    sprite.data[2] = runtime.gFieldEffectArguments[1];
    sprite.data[3] = runtime.gFieldEffectArguments[4];
    sprite.data[4] = runtime.gFieldEffectArguments[5];
  }
  return 0;
};

export const UpdateAshFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  if (sprite.data[0] === 0) UpdateAshFieldEffect_Step0(sprite);
  else if (sprite.data[0] === 1) UpdateAshFieldEffect_Step1(runtime, sprite);
  else UpdateAshFieldEffect_Step2(runtime, sprite);
};

export const UpdateAshFieldEffect_Step0 = (sprite: FieldEffectSprite): void => {
  sprite.invisible = true;
  sprite.animPaused = true;
  if (--sprite.data[4] === 0) sprite.data[0] = 1;
};

export const UpdateAshFieldEffect_Step1 = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  sprite.invisible = false;
  sprite.animPaused = false;
  mapGridSetMetatileIdAt(runtime, sprite.data[1], sprite.data[2], sprite.data[3]);
  currentMapDrawMetatileAt(runtime, sprite.data[1], sprite.data[2]);
  runtime.gObjectEvents[runtime.gPlayerAvatar.objectEventId].triggerGroundEffectsOnMove = true;
  sprite.data[0] = 2;
};

export const UpdateAshFieldEffect_Step2 = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
  if (sprite.animEnded) fieldEffectStop(runtime, sprite, FLDEFF_ASH);
};

export const FldEff_SurfBlob = (runtime: FieldEffectHelpersRuntime): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, 8, 8);
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_SURF_BLOB, x, y, 0x96);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.paletteNum = 0;
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.data[3] = 0;
    sprite.data[6] = -1;
    sprite.data[7] = -1;
  }
  fieldEffectActiveListRemove(runtime, FLDEFF_SURF_BLOB);
  return spriteId;
};

export const SetSurfBlob_BobState = (runtime: FieldEffectHelpersRuntime, spriteId: number, bobState: number): void => {
  const sprite = runtime.gSprites[spriteId];
  sprite.data[0] = (sprite.data[0] & ~0xf) | (bobState & 0xf);
};

export const SetSurfBlob_DontSyncAnim = (runtime: FieldEffectHelpersRuntime, spriteId: number, value: boolean): void => {
  const sprite = runtime.gSprites[spriteId];
  sprite.data[0] = (sprite.data[0] & ~0xf0) | (((value ? 1 : 0) & 0xf) << 4);
};

export const SetSurfBlob_PlayerOffset = (runtime: FieldEffectHelpersRuntime, spriteId: number, hasOffset: boolean, offset: number): void => {
  const sprite = runtime.gSprites[spriteId];
  sprite.data[0] = (sprite.data[0] & ~0xf00) | (((hasOffset ? 1 : 0) & 0xf) << 8);
  sprite.data[1] = offset;
};

export const GetSurfBlob_BobState = (sprite: FieldEffectSprite): number => sprite.data[0] & 0xf;
export const GetSurfBlob_DontSyncAnim = (sprite: FieldEffectSprite): number => (sprite.data[0] & 0xf0) >> 4;
export const GetSurfBlob_HasPlayerOffset = (sprite: FieldEffectSprite): number => (sprite.data[0] & 0xf00) >> 8;

export const UpdateSurfBlobFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const playerObject = runtime.gObjectEvents[sprite.data[2]];
  const playerSprite = runtime.gSprites[playerObject.spriteId];
  SynchroniseSurfAnim(runtime, playerObject, sprite);
  SynchroniseSurfPosition(runtime, playerObject, sprite);
  CreateBobbingEffect(runtime, playerObject, playerSprite, sprite);
  sprite.oam.priority = playerSprite.oam.priority;
};

export const SynchroniseSurfAnim = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent, sprite: FieldEffectSprite): void => {
  const surfBlobDirectionAnims = [0, 0, 1, 2, 3];
  if (GetSurfBlob_DontSyncAnim(sprite) === 0) startSpriteAnimIfDifferent(runtime, sprite, surfBlobDirectionAnims[objectEvent.movementDirection] ?? 0);
};

export const SynchroniseSurfPosition = (runtime: FieldEffectHelpersRuntime, playerObject: ObjectEvent, surfBlobSprite: FieldEffectSprite): void => {
  let x = playerObject.currentCoords.x;
  let y = playerObject.currentCoords.y;
  const yOffset = surfBlobSprite.y2;
  if (yOffset === 0 && (x !== surfBlobSprite.data[6] || y !== surfBlobSprite.data[7])) {
    surfBlobSprite.data[5] = yOffset;
    surfBlobSprite.data[6] = x;
    surfBlobSprite.data[7] = y;
    for (let i = DIR_SOUTH; i <= DIR_EAST; i++, x = surfBlobSprite.data[6], y = surfBlobSprite.data[7]) {
      [x, y] = moveCoords(i, x, y);
      if (mapGridGetElevationAt(runtime, x, y) === 3) {
        surfBlobSprite.data[5]++;
        break;
      }
    }
  }
};

export const CreateBobbingEffect = (_runtime: FieldEffectHelpersRuntime, _objectEvent: ObjectEvent, playerSprite: FieldEffectSprite, surfBlobSprite: FieldEffectSprite): void => {
  const intervals = [7, 15];
  const bobState = GetSurfBlob_BobState(surfBlobSprite);
  if (bobState !== BOB_NONE) {
    if (((++surfBlobSprite.data[4]) & (intervals[surfBlobSprite.data[5]] ?? 0)) === 0) surfBlobSprite.y2 += surfBlobSprite.data[3];
    if ((surfBlobSprite.data[4] & 0x1f) === 0) surfBlobSprite.data[3] = -surfBlobSprite.data[3];
    if (bobState !== BOB_MON_ONLY) {
      playerSprite.y2 = GetSurfBlob_HasPlayerOffset(surfBlobSprite) === 0 ? surfBlobSprite.y2 : surfBlobSprite.data[1] + surfBlobSprite.y2;
      if (surfBlobSprite.animCmdIndex !== 0) playerSprite.y2++;
      surfBlobSprite.x = playerSprite.x;
      surfBlobSprite.y = playerSprite.y + 8;
    }
  }
};

export const StartUnderwaterSurfBlobBobbing = (runtime: FieldEffectHelpersRuntime, oldSpriteId: number): number => {
  const spriteId = createSpriteAtEnd(runtime, -1, 0, 0, -1);
  const sprite = runtime.gSprites[spriteId];
  sprite.callback = 'SpriteCB_UnderwaterSurfBlob';
  sprite.invisible = true;
  sprite.data[0] = oldSpriteId;
  sprite.data[1] = 1;
  return spriteId;
};

export const SpriteCB_UnderwaterSurfBlob = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const oldSprite = runtime.gSprites[sprite.data[0]];
  if (((sprite.data[2]++) & 0x03) === 0) oldSprite.y2 += sprite.data[1];
  if ((sprite.data[2] & 0x0f) === 0) sprite.data[1] = -sprite.data[1];
};

export const FldEff_Dust = (runtime: FieldEffectHelpersRuntime): number => createJumpImpact(runtime, FLDEFFOBJ_GROUND_IMPACT_DUST, 8, 12, FLDEFF_JUMP_BIG_SPLASH, 10);

export const FldEff_SandPile = (runtime: FieldEffectHelpersRuntime): number => {
  const objectEventId = getObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]);
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_SAND_PILE, 0, 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
    const linked = runtime.gSprites[objectEvent.spriteId];
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = linked.oam.priority;
    sprite.data[0] = runtime.gFieldEffectArguments[0];
    sprite.data[1] = runtime.gFieldEffectArguments[1];
    sprite.data[2] = runtime.gFieldEffectArguments[2];
    sprite.data[3] = linked.x;
    sprite.data[4] = linked.y;
    sprite.y2 = (info.height >> 1) - 2;
    seekSpriteAnim(runtime, sprite, 2);
  }
  return 0;
};

export const UpdateSandPileFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[0], sprite.data[1], sprite.data[2]);
  if (objectEventId === undefined || !runtime.gObjectEvents[objectEventId].inSandPile) return fieldEffectStop(runtime, sprite, FLDEFF_SAND_PILE);
  const linked = runtime.gSprites[runtime.gObjectEvents[objectEventId].spriteId];
  if (linked.x !== sprite.data[3] || linked.y !== sprite.data[4]) {
    sprite.data[3] = linked.x;
    sprite.data[4] = linked.y;
    if (sprite.animEnded) startSpriteAnim(runtime, sprite, 0);
  }
  sprite.x = linked.x;
  sprite.y = linked.y;
  sprite.subpriority = linked.subpriority;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
};

export const FldEff_Bubbles = (runtime: FieldEffectHelpersRuntime): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, 8, 0);
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_BUBBLES, x, y, 0x52);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = 1;
  }
  return 0;
};

export const UpdateBubblesFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  sprite.data[0] += 0x80;
  sprite.data[0] &= 0x100;
  sprite.y -= sprite.data[0] >> 8;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
  if (sprite.invisible || sprite.animEnded) fieldEffectStop(runtime, sprite, FLDEFF_BUBBLES);
};

export const FldEff_BerryTreeGrowthSparkle = (): number => 0;
export const ShowTreeDisguiseFieldEffect = (runtime: FieldEffectHelpersRuntime): number => ShowDisguiseFieldEffect(runtime, FLDEFF_TREE_DISGUISE, FLDEFFOBJ_TREE_DISGUISE, 4);
export const ShowMountainDisguiseFieldEffect = (runtime: FieldEffectHelpersRuntime): number => ShowDisguiseFieldEffect(runtime, FLDEFF_MOUNTAIN_DISGUISE, FLDEFFOBJ_MOUNTAIN_DISGUISE, 3);
export const ShowSandDisguiseFieldEffect = (runtime: FieldEffectHelpersRuntime): number => ShowDisguiseFieldEffect(runtime, FLDEFF_SAND_DISGUISE, FLDEFFOBJ_SAND_DISGUISE, 2);

export const ShowDisguiseFieldEffect = (runtime: FieldEffectHelpersRuntime, fldEff: number, templateIdx: number, paletteNum: number): number => {
  if (tryGetObjectEventIdByLocalIdAndMap(runtime, runtime.gFieldEffectArguments[0], runtime.gFieldEffectArguments[1], runtime.gFieldEffectArguments[2]) === undefined) {
    fieldEffectActiveListRemove(runtime, fldEff);
    return MAX_SPRITES;
  }
  const spriteId = createSpriteAtEnd(runtime, templateIdx, 0, 0, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = Number(sprite.coordOffsetEnabled) + 1;
    sprite.oam.paletteNum = paletteNum;
    sprite.data[1] = fldEff;
    sprite.data[2] = runtime.gFieldEffectArguments[0];
    sprite.data[3] = runtime.gFieldEffectArguments[1];
    sprite.data[4] = runtime.gFieldEffectArguments[2];
  }
  return spriteId;
};

export const UpdateDisguiseFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, sprite.data[2], sprite.data[3], sprite.data[4]);
  if (objectEventId === undefined) {
    fieldEffectStop(runtime, sprite, sprite.data[1]);
    return;
  }
  const objectEvent = runtime.gObjectEvents[objectEventId];
  const info = getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
  const linked = runtime.gSprites[objectEvent.spriteId];
  sprite.invisible = linked.invisible;
  sprite.x = linked.x;
  sprite.y = (info.height >> 1) + linked.y - 16;
  sprite.subpriority = linked.subpriority - 1;
  if (sprite.data[0] === 1) {
    sprite.data[0]++;
    startSpriteAnim(runtime, sprite, 1);
  }
  if (sprite.data[0] === 2 && sprite.animEnded) sprite.data[7] = 1;
  if (sprite.data[0] === 3) fieldEffectStop(runtime, sprite, sprite.data[1]);
};

export const StartRevealDisguise = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent): void => {
  if (objectEvent.directionSequenceIndex === 1) runtime.gSprites[objectEvent.fieldEffectSpriteId].data[0]++;
};

export const UpdateRevealDisguise = (runtime: FieldEffectHelpersRuntime, objectEvent: ObjectEvent): boolean => {
  if (objectEvent.directionSequenceIndex === 2) return true;
  if (objectEvent.directionSequenceIndex === 0) return true;
  const sprite = runtime.gSprites[objectEvent.fieldEffectSpriteId];
  if (sprite.data[7]) {
    objectEvent.directionSequenceIndex = 2;
    sprite.data[0]++;
    return true;
  }
  return false;
};

export const FldEff_Sparkle = (runtime: FieldEffectHelpersRuntime): number => {
  runtime.gFieldEffectArguments[0] += 7;
  runtime.gFieldEffectArguments[1] += 7;
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, 8, 8);
  const spriteId = createSpriteAtEnd(runtime, FLDEFFOBJ_SMALL_SPARKLE, x, y, 0x52);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.oam.priority = runtime.gFieldEffectArguments[2];
    sprite.coordOffsetEnabled = true;
  }
  return 0;
};

export const UpdateSparkleFieldEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  if (sprite.data[0] === 0) {
    if (sprite.animEnded) {
      sprite.invisible = true;
      sprite.data[0]++;
    }
    if (sprite.data[0] === 0) return;
  }
  if (++sprite.data[1] > 34) fieldEffectStop(runtime, sprite, FLDEFF_SPARKLE);
};

export const UpdateJumpImpactEffect = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  if (sprite.animEnded) fieldEffectStop(runtime, sprite, sprite.data[1]);
  else {
    updateObjectEventSpriteInvisibility(runtime, sprite, false);
    setObjectSubpriorityByElevation(sprite.data[0], sprite, 0);
  }
};

export const WaitFieldEffectSpriteAnim = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  if (sprite.animEnded) fieldEffectStop(runtime, sprite, sprite.data[0]);
  else updateObjectEventSpriteInvisibility(runtime, sprite, false);
};

export const UpdateGrassFieldEffectSubpriority = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, z: number, offset: number): void => {
  setObjectSubpriorityByElevation(z, sprite, offset);
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const objectEvent = runtime.gObjectEvents[i];
    if (objectEvent.active) {
      getObjectEventGraphicsInfo(runtime, objectEvent.graphicsId);
      const linkedSprite = runtime.gSprites[objectEvent.spriteId];
      const xhi = sprite.x + sprite.centerToCornerVecX;
      let varValue = sprite.x - sprite.centerToCornerVecX;
      if (xhi < linkedSprite.x && varValue > linkedSprite.x) {
        const lyhi = linkedSprite.y + linkedSprite.centerToCornerVecY;
        varValue = linkedSprite.y;
        const ylo = sprite.y - sprite.centerToCornerVecY;
        const yhi = ylo + linkedSprite.centerToCornerVecY;
        if ((lyhi < yhi || lyhi < ylo) && varValue > yhi && sprite.subpriority <= linkedSprite.subpriority) {
          sprite.subpriority = linkedSprite.subpriority + 2;
          break;
        }
      }
    }
  }
};

export const callFieldEffectCallback = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite): void => {
  switch (sprite.callback) {
    case 'UpdateObjectReflectionSprite': return UpdateObjectReflectionSprite(runtime, sprite);
    case 'UpdateShadowFieldEffect': return UpdateShadowFieldEffect(runtime, sprite);
    case 'UpdateTallGrassFieldEffect': return UpdateTallGrassFieldEffect(runtime, sprite);
    case 'UpdateLongGrassFieldEffect': return UpdateLongGrassFieldEffect(runtime, sprite);
    case 'UpdateShortGrassFieldEffect': return UpdateShortGrassFieldEffect(runtime, sprite);
    case 'UpdateFootprintsTireTracksFieldEffect': return UpdateFootprintsTireTracksFieldEffect(runtime, sprite);
    case 'UpdateSplashFieldEffect': return UpdateSplashFieldEffect(runtime, sprite);
    case 'UpdateFeetInFlowingWaterFieldEffect': return UpdateFeetInFlowingWaterFieldEffect(runtime, sprite);
    case 'UpdateHotSpringsWaterFieldEffect': return UpdateHotSpringsWaterFieldEffect(runtime, sprite);
    case 'UpdateAshFieldEffect': return UpdateAshFieldEffect(runtime, sprite);
    case 'UpdateSurfBlobFieldEffect': return UpdateSurfBlobFieldEffect(runtime, sprite);
    case 'SpriteCB_UnderwaterSurfBlob': return SpriteCB_UnderwaterSurfBlob(runtime, sprite);
    case 'UpdateSandPileFieldEffect': return UpdateSandPileFieldEffect(runtime, sprite);
    case 'UpdateBubblesFieldEffect': return UpdateBubblesFieldEffect(runtime, sprite);
    case 'UpdateDisguiseFieldEffect': return UpdateDisguiseFieldEffect(runtime, sprite);
    case 'UpdateSparkleFieldEffect': return UpdateSparkleFieldEffect(runtime, sprite);
    case 'UpdateJumpImpactEffect': return UpdateJumpImpactEffect(runtime, sprite);
    case 'WaitFieldEffectSpriteAnim': return WaitFieldEffectSpriteAnim(runtime, sprite);
    case 'SpriteCallbackDummy': return undefined;
  }
};

const createGrass = (runtime: FieldEffectHelpersRuntime, template: number, useElevationPriority: boolean, xOff: number, yOff: number): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, xOff, yOff);
  const spriteId = createSpriteAtEnd(runtime, template, x, y, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = useElevationPriority ? elevationToPriority(runtime.gFieldEffectArguments[2]) : runtime.gFieldEffectArguments[3];
    sprite.data[0] = runtime.gFieldEffectArguments[2];
    sprite.data[1] = runtime.gFieldEffectArguments[0];
    sprite.data[2] = runtime.gFieldEffectArguments[1];
    sprite.data[3] = runtime.gFieldEffectArguments[4];
    sprite.data[4] = runtime.gFieldEffectArguments[5];
    sprite.data[5] = runtime.gFieldEffectArguments[6];
    if (runtime.gFieldEffectArguments[7]) seekSpriteAnim(runtime, sprite, useElevationPriority ? 6 : 4);
  }
  return 0;
};

const updateGrass = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, effect: number, predicate: (behavior: number) => boolean, tallGrassAnimOffset: boolean): void => {
  let mapNum = sprite.data[5] >> 8;
  let mapGroup = sprite.data[5] & 0xff;
  if (runtime.gCamera.active && (runtime.location.mapNum !== mapNum || runtime.location.mapGroup !== mapGroup)) {
    sprite.data[1] -= runtime.gCamera.x;
    sprite.data[2] -= runtime.gCamera.y;
    sprite.data[5] = ((runtime.location.mapNum & 0xff) << 8) | (runtime.location.mapGroup & 0xff);
  }
  const localId = sprite.data[3] >> 8;
  mapNum = sprite.data[3] & 0xff;
  mapGroup = sprite.data[4];
  const metatileBehavior = mapGridGetMetatileBehaviorAt(runtime, sprite.data[1], sprite.data[2]);
  const objectEventId = tryGetObjectEventIdByLocalIdAndMap(runtime, localId, mapNum, mapGroup);
  if (objectEventId === undefined || !predicate(metatileBehavior) || (sprite.data[7] && sprite.animEnded)) {
    fieldEffectStop(runtime, sprite, effect);
    return;
  }
  const objectEvent = runtime.gObjectEvents[objectEventId];
  if ((objectEvent.currentCoords.x !== sprite.data[1] || objectEvent.currentCoords.y !== sprite.data[2])
    && (objectEvent.previousCoords.x !== sprite.data[1] || objectEvent.previousCoords.y !== sprite.data[2])) sprite.data[7] = 1;
  const offset = tallGrassAnimOffset && sprite.animCmdIndex === 0 ? 4 : 0;
  updateObjectEventSpriteInvisibility(runtime, sprite, false);
  UpdateGrassFieldEffectSubpriority(runtime, sprite, sprite.data[0], offset);
};

const createFootprint = (runtime: FieldEffectHelpersRuntime, template: number, effect: number, returnsSpriteId: boolean): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, 8, 8);
  const spriteId = createSpriteAtEnd(runtime, template, x, y, runtime.gFieldEffectArguments[2]);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = runtime.gFieldEffectArguments[3];
    sprite.data[7] = effect;
    startSpriteAnim(runtime, sprite, runtime.gFieldEffectArguments[4]);
  }
  return returnsSpriteId ? spriteId : 0;
};

const createJumpImpact = (runtime: FieldEffectHelpersRuntime, template: number, xOff: number, yOff: number, effect: number, data1?: number): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  [x, y] = setSpritePosToOffsetMapCoords(x, y, xOff, yOff);
  const spriteId = createSpriteAtEnd(runtime, template, x, y, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = runtime.gFieldEffectArguments[3];
    sprite.data[0] = runtime.gFieldEffectArguments[2];
    sprite.data[1] = data1 ?? effect;
  }
  return 0;
};

const createSimpleAtArgs = (runtime: FieldEffectHelpersRuntime, template: number, effect: number, offsetCoords: boolean): number => {
  let x = runtime.gFieldEffectArguments[0];
  let y = runtime.gFieldEffectArguments[1];
  if (offsetCoords) [x, y] = setSpritePosToOffsetMapCoords(x, y, 8, 8);
  const spriteId = createSpriteAtEnd(runtime, template, x, y, runtime.gFieldEffectArguments[2]);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.gSprites[spriteId];
    sprite.coordOffsetEnabled = true;
    sprite.oam.priority = runtime.gFieldEffectArguments[3];
    sprite.data[0] = effect;
  }
  return 0;
};

const callbackForTemplate = (template: string): FieldEffectCallback => {
  const templateId = Number(template.match(/\[(\-?\d+)\]/)?.[1] ?? NaN);
  if (templateId === FLDEFFOBJ_TALL_GRASS) return 'UpdateTallGrassFieldEffect';
  if (templateId === FLDEFFOBJ_LONG_GRASS) return 'UpdateLongGrassFieldEffect';
  if (templateId === FLDEFFOBJ_SHORT_GRASS) return 'UpdateShortGrassFieldEffect';
  if (templateId === FLDEFFOBJ_SAND_FOOTPRINTS || templateId === FLDEFFOBJ_DEEP_SAND_FOOTPRINTS || templateId === FLDEFFOBJ_BIKE_TIRE_TRACKS) return 'UpdateFootprintsTireTracksFieldEffect';
  if (templateId === FLDEFFOBJ_SPLASH) return 'UpdateSplashFieldEffect';
  if (templateId === FLDEFFOBJ_HOT_SPRINGS_WATER) return 'UpdateHotSpringsWaterFieldEffect';
  if (templateId === FLDEFFOBJ_ASH) return 'UpdateAshFieldEffect';
  if (templateId === FLDEFFOBJ_SURF_BLOB) return 'UpdateSurfBlobFieldEffect';
  if (templateId === FLDEFFOBJ_SAND_PILE) return 'UpdateSandPileFieldEffect';
  if (templateId === FLDEFFOBJ_BUBBLES) return 'UpdateBubblesFieldEffect';
  if (templateId === FLDEFFOBJ_TREE_DISGUISE || templateId === FLDEFFOBJ_MOUNTAIN_DISGUISE || templateId === FLDEFFOBJ_SAND_DISGUISE) return 'UpdateDisguiseFieldEffect';
  if (templateId === FLDEFFOBJ_SMALL_SPARKLE) return 'UpdateSparkleFieldEffect';
  if (templateId === FLDEFFOBJ_JUMP_TALL_GRASS || templateId === FLDEFFOBJ_JUMP_LONG_GRASS || templateId === FLDEFFOBJ_JUMP_SMALL_SPLASH || templateId === FLDEFFOBJ_JUMP_BIG_SPLASH || templateId === FLDEFFOBJ_GROUND_IMPACT_DUST) return 'UpdateJumpImpactEffect';
  if (templateId === FLDEFFOBJ_RIPPLE || templateId === FLDEFFOBJ_UNUSED_GRASS || templateId === FLDEFFOBJ_UNUSED_GRASS_2 || templateId === FLDEFFOBJ_UNUSED_SAND || templateId === FLDEFFOBJ_WATER_SURFACING) return 'WaitFieldEffectSpriteAnim';
  if (templateId === FLDEFFOBJ_SHADOW_S || templateId === FLDEFFOBJ_SHADOW_M || templateId === FLDEFFOBJ_SHADOW_L || templateId === FLDEFFOBJ_SHADOW_XL) return 'UpdateShadowFieldEffect';
  return 'SpriteCallbackDummy';
};

const createSpriteAtEnd = (runtime: FieldEffectHelpersRuntime, template: number, x: number, y: number, subpriority: number): number => {
  if (runtime.gSprites.length >= MAX_SPRITES) return MAX_SPRITES;
  const id = runtime.gSprites.length;
  runtime.gSprites.push(createSprite(id, `gFieldEffectObjectTemplatePointers[${template}]`, x, y, subpriority));
  return id;
};

const createCopySpriteAt = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, x: number, y: number, subpriority: number): number => {
  if (runtime.gSprites.length >= MAX_SPRITES) return MAX_SPRITES;
  const id = runtime.gSprites.length;
  runtime.gSprites.push({ ...sprite, id, x, y, subpriority, data: [...sprite.data], oam: { ...sprite.oam } });
  return id;
};

const startSpriteAnim = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, anim: number): void => {
  sprite.animEnded = false;
  sprite.animCmdIndex = anim;
  runtime.operations.push(`StartSpriteAnim:${sprite.id}:${anim}`);
};
const startSpriteAnimIfDifferent = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, anim: number): void => {
  if (sprite.animCmdIndex !== anim) startSpriteAnim(runtime, sprite, anim);
};
const seekSpriteAnim = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, anim: number): void => {
  sprite.animCmdIndex = anim;
  runtime.operations.push(`SeekSpriteAnim:${sprite.id}:${anim}`);
};
const fieldEffectStop = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, effect: number): void => {
  sprite.inUse = false;
  runtime.stoppedEffects.push({ spriteId: sprite.id, effect });
};
const fieldEffectActiveListRemove = (runtime: FieldEffectHelpersRuntime, effect: number): void => {
  runtime.removedActiveEffects.push(effect);
};
const fieldEffectStart = (runtime: FieldEffectHelpersRuntime, effect: number): void => {
  runtime.startedEffects.push(effect);
};
const playSE = (runtime: FieldEffectHelpersRuntime, song: number): void => {
  runtime.sounds.push(song);
};
const updateObjectEventSpriteInvisibility = (runtime: FieldEffectHelpersRuntime, sprite: FieldEffectSprite, invisible: boolean): void => {
  sprite.invisible = invisible;
  runtime.operations.push(`UpdateObjectEventSpriteInvisibility:${sprite.id}:${invisible ? 1 : 0}`);
};
const setObjectSubpriorityByElevation = (z: number, sprite: FieldEffectSprite, offset: number): void => {
  sprite.subpriority = elevationToPriority(z) + offset;
};
const getObjectEventGraphicsInfo = (runtime: FieldEffectHelpersRuntime, graphicsId: number): ObjectEventGraphicsInfo =>
  runtime.graphicsInfo[graphicsId] ?? runtime.graphicsInfo[0] ?? createGraphicsInfo();
const getObjectEventIdByLocalIdAndMap = (runtime: FieldEffectHelpersRuntime, localId: number, mapNum: number, mapGroup: number): number =>
  tryGetObjectEventIdByLocalIdAndMap(runtime, localId, mapNum, mapGroup) ?? 0;
const tryGetObjectEventIdByLocalIdAndMap = (runtime: FieldEffectHelpersRuntime, localId: number, mapNum: number, mapGroup: number): number | undefined =>
  runtime.gObjectEvents.findIndex((event) => event.active && event.localId === localId && event.mapNum === mapNum && event.mapGroup === mapGroup) >= 0
    ? runtime.gObjectEvents.findIndex((event) => event.active && event.localId === localId && event.mapNum === mapNum && event.mapGroup === mapGroup)
    : undefined;
const mapKey = (x: number, y: number): string => `${x},${y}`;
const mapGridGetMetatileBehaviorAt = (runtime: FieldEffectHelpersRuntime, x: number, y: number): number => runtime.mapMetatileBehaviors.get(mapKey(x, y)) ?? 0;
const mapGridGetElevationAt = (runtime: FieldEffectHelpersRuntime, x: number, y: number): number => runtime.mapElevations.get(mapKey(x, y)) ?? 0;
const mapGridSetMetatileIdAt = (runtime: FieldEffectHelpersRuntime, x: number, y: number, metatileId: number): void => {
  runtime.metatileWrites.push({ x, y, metatileId });
};
const currentMapDrawMetatileAt = (runtime: FieldEffectHelpersRuntime, x: number, y: number): void => {
  runtime.operations.push(`CurrentMapDrawMetatileAt:${x}:${y}`);
};
const getObjectPaletteTag = (paletteIndex: number): number => 0x1000 + paletteIndex;
const elevationToPriority = (z: number): number => 4 - Math.max(0, Math.min(3, z));
const setSpritePosToOffsetMapCoords = (x: number, y: number, xOff: number, yOff: number): [number, number] => [x * 16 + xOff, y * 16 + yOff];
const setSpritePosToMapCoords = (x: number, y: number): [number, number] => [x * 16, y * 16];
const moveCoords = (direction: number, x: number, y: number): [number, number] => {
  if (direction === DIR_SOUTH) return [x, y + 1];
  if (direction === DIR_NORTH) return [x, y - 1];
  if (direction === DIR_WEST) return [x - 1, y];
  if (direction === DIR_EAST) return [x + 1, y];
  return [x, y];
};
const metatileBehaviorGetBridgeType = (behavior: number): number => behavior >= 100 && behavior <= 102 ? behavior - 99 : 0;
const metatileBehaviorIsTallGrass = (behavior: number): boolean => behavior === 1;
const metatileBehaviorIsLongGrass = (behavior: number): boolean => behavior === 2;
const metatileBehaviorIsPokeGrass = (behavior: number): boolean => behavior === 3;
const metatileBehaviorIsSurfable = (behavior: number): boolean => behavior === 4;
const metatileBehaviorIsReflective = (behavior: number): boolean => behavior === 5;
