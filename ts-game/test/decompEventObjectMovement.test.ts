import { describe, expect, it } from 'vitest';
import {
  AddCameraObject,
  AreElevationsCompatible,
  CameraObjectGetFollowedObjectId,
  CameraObjectSetFollowedObjectId,
  ClearAllObjectEvents,
  CreateCopySpriteAt,
  CreateVirtualObject,
  DIR_EAST,
  DIR_SOUTH,
  DestroyVirtualObjects,
  ElevationToPriority,
  FindCameraObject,
  FindObjectEventTemplateByLocalId,
  FindObjectEventPaletteIndexByTag,
  FreezeObjectEvent,
  FreezeObjectEvents,
  FreezeObjectEventsExceptOne,
  GetAvailableObjectEventId,
  GetBaseTemplateForObjectEvent,
  GetFirstInactiveObjectEventId,
  GetGroundEffectFlags_TallGrassOnSpawn,
  GetLimitedVectorDirection_WestEast,
  GetObjectEventBerryTreeId,
  GetObjectEventFlagIdByLocalIdAndMap,
  GetObjectEventGraphicsInfo,
  GetObjectEventIdByLocalId,
  GetObjectEventIdByLocalIdAndMap,
  GetObjectEventIdByPosition,
  GetObjectEventIdByXY,
  GetObjectEventScriptPointerByLocalIdAndMap,
  GetObjectEventScriptPointerByObjectEventId,
  GetObjectEventTemplateByLocalIdAndMap,
  GetObjectTrainerTypeByObjectEventId,
  GetStepAnimTable,
  GetVirtualObjectSpriteId,
  MAP_OFFSET,
  MAX_SPRITES,
  OBJ_EVENT_GFX_LITTLE_BOY,
  OBJ_EVENT_GFX_VARS,
  GetReflectionEffectPaletteSlot,
  GetVectorDirection,
  IncrementObjectEventCoords,
  InitObjectEventStateFromTemplate,
  IsVirtualObjectAnimating,
  IsVirtualObjectInvisible,
  LoadObjectEventPalette,
  MoveObjectEventToMapCoords,
  MoveUnionRoomObjectDown,
  MoveUnionRoomObjectUp,
  MovementAction_WalkNormalDown_Step0,
  MovementType_WanderAround_Step1,
  OBJECT_EVENTS_COUNT,
  ObjectEventDoesElevationMatch,
  ObjectEventGetLocalIdAndMap,
  ObjectEventSetGraphicsId,
  ObjectEventTurn,
  RemoveObjectEventByLocalIdAndMap,
  SetAndStartSpriteAnim,
  SetHideObstacleFlag,
  SetMovementDelay,
  SetObjectEventCoords,
  SetObjectInvisibility,
  SetObjectPositionByLocalIdAndMap,
  SetPlayerAvatarObjectEventIdAndObjectId,
  SetVirtualObjectGraphics,
  SetVirtualObjectInvisibility,
  SetVirtualObjectSpriteAnim,
  ShouldInitObjectEventStateFromTemplate,
  SpawnSpecialObjectEvent,
  SpawnSpecialObjectEventParameterized,
  SpriteAnimEnded,
  TryMoveObjectEventToMapCoords,
  TrySpawnObjectEvent,
  TrySpawnObjectEventTemplate,
  UnfreezeObjectEvent,
  UnfreezeObjectEvents,
  UpdateObjectEventElevationAndPriority,
  WaitForMovementDelay,
  createEventObjectMovementRuntime,
  createEventSprite,
  createObjectEvent,
  type ObjectEventTemplate
} from '../src/game/decompEventObjectMovement';

describe('decompEventObjectMovement', () => {
  it('exact C-name lookup helpers return backing graphics, camera, template, and step-table records', () => {
    const template: ObjectEventTemplate = {
      localId: 7,
      mapNum: 2,
      mapGroup: 3,
      x: 10,
      y: 12,
      script: 'NpcScript'
    };
    const otherTemplate: ObjectEventTemplate = {
      localId: 8,
      mapNum: 9,
      mapGroup: 9,
      x: 1,
      y: 2,
      script: 'OtherScript'
    };
    const anims = { name: 'walk' };
    const stepTable = { anims, mode: 'alternating' };
    const littleBoy = { id: OBJ_EVENT_GFX_LITTLE_BOY, size: 64 };
    const runtime = createEventObjectMovementRuntime({
      map: { num: 2, group: 3, width: 40, height: 40 },
      templates: [template, otherTemplate],
      objectEventGraphicsInfoPointers: Array.from({ length: 152 }, (_v, i) => ({ id: i })),
      objectEventGraphicsVars: [17],
      stepAnimTables: [stepTable]
    });
    runtime.objectEventGraphicsInfoPointers![OBJ_EVENT_GFX_LITTLE_BOY] = littleBoy;
    runtime.objectEvents[0] = createObjectEvent({ active: true, localId: 7, mapNum: 2, mapGroup: 3 });
    runtime.objectEvents[1] = createObjectEvent({ active: true, localId: 7, mapNum: 9, mapGroup: 9 });
    runtime.sprites[4] = createEventSprite({ id: 4, callback: 'ObjectCB_CameraObject' });

    expect(GetObjectEventGraphicsInfo(runtime, 4)).toBe(runtime.objectEventGraphicsInfoPointers![4]);
    expect(GetObjectEventGraphicsInfo(runtime, OBJ_EVENT_GFX_VARS)).toBe(runtime.objectEventGraphicsInfoPointers![17]);
    expect(GetObjectEventGraphicsInfo(runtime, 230)).toBe(littleBoy);
    expect(FindCameraObject(runtime)).toBe(runtime.sprites[4]);
    expect(FindObjectEventTemplateByLocalId(7, [otherTemplate, template], 2)).toBe(template);
    expect(GetObjectEventTemplateByLocalIdAndMap(runtime, 7, 2, 3)).toBe(template);
    expect(GetObjectEventScriptPointerByLocalIdAndMap(runtime, 7, 2, 3)).toBe('NpcScript');
    expect(GetObjectEventScriptPointerByObjectEventId(runtime, 0)).toBe('NpcScript');
    expect(GetBaseTemplateForObjectEvent(runtime, runtime.objectEvents[0])).toBe(template);
    expect(GetBaseTemplateForObjectEvent(runtime, runtime.objectEvents[1])).toBeNull();
    expect(GetStepAnimTable(runtime, anims)).toBe(stepTable);
    expect(GetStepAnimTable(runtime, {})).toBeNull();
  });

  it('initializes, finds, hides, spawns, and removes object events by decomp ids', () => {
    const template: ObjectEventTemplate = {
      localId: 7,
      mapNum: 2,
      mapGroup: 3,
      x: 10,
      y: 12,
      elevation: 4,
      movementType: 6,
      graphicsId: 44,
      trainerType: 9,
      flagId: 123,
      berryTreeId: 5
    };
    const runtime = createEventObjectMovementRuntime({ map: { num: 2, group: 3, width: 40, height: 40 }, templates: [template] });

    expect(GetFirstInactiveObjectEventId(runtime)).toBe(0);
    expect(GetAvailableObjectEventId(runtime)).toBe(true);
    expect(ShouldInitObjectEventStateFromTemplate(runtime, template)).toBe(true);

    const slot = InitObjectEventStateFromTemplate(runtime, template, 0) as number;
    expect(slot).toBe(0);
    expect(runtime.objectEvents[0]).toMatchObject({
      active: true,
      localId: 7,
      mapNum: 2,
      mapGroup: 3,
      graphicsId: 44,
      movementType: 6,
      elevation: 4,
      trainerType: 9,
      berryTreeId: 5
    });

    expect(GetObjectEventIdByLocalIdAndMap(runtime, 7, 2, 3)).toBe(0);
    expect(GetObjectEventIdByLocalId(runtime, 7)).toBe(0);
    expect(GetObjectEventIdByXY(runtime, 10, 12, 4)).toBe(0);
    expect(GetObjectEventIdByPosition(runtime, 10, 12, 4)).toBe(0);
    expect(ObjectEventGetLocalIdAndMap(runtime, runtime.objectEvents[0])).toEqual([7, 2, 3]);
    expect(GetObjectEventFlagIdByLocalIdAndMap(runtime, 7, 2, 3)).toBe(123);
    expect(GetObjectTrainerTypeByObjectEventId(runtime, runtime.objectEvents[0])).toBe(9);
    expect(GetObjectEventBerryTreeId(runtime, runtime.objectEvents[0])).toBe(5);

    SetHideObstacleFlag(runtime, template);
    expect(ShouldInitObjectEventStateFromTemplate(runtime, template)).toBe(false);

    expect(RemoveObjectEventByLocalIdAndMap(runtime, 7, 2, 3)).toBe(true);
    expect(runtime.objectEvents[0].active).toBe(false);
    expect(TrySpawnObjectEventTemplate(runtime, template)).toBe(0);
    expect(SpawnSpecialObjectEvent(runtime, template)).toBe(1);
    expect(TrySpawnObjectEvent(runtime, 7)).toBe(2);
    expect(SpawnSpecialObjectEventParameterized(runtime, 44, 6, 9, 30, 40, 3)).toBe(3);
    expect(runtime.objectEvents[3]).toMatchObject({
      localId: 9,
      mapNum: runtime.map.num,
      mapGroup: runtime.map.group,
      graphicsId: 44,
      movementType: 6,
      elevation: 3,
      currentCoords: { x: 30 - MAP_OFFSET, y: 40 - MAP_OFFSET },
      trainerType: 0,
      flagId: 0
    });

    ClearAllObjectEvents(runtime);
    expect(runtime.objectEvents.every((event) => !event.active)).toBe(true);
    expect(GetFirstInactiveObjectEventId(runtime)).toBe(0);
  });

  it('updates graphics, direction, position, movement, elevation, and sprite state', () => {
    const runtime = createEventObjectMovementRuntime();
    runtime.objectEvents[0] = createObjectEvent({ active: true, localId: 1, mapNum: 0, mapGroup: 0, currentCoords: { x: 5, y: 5 }, spriteId: 0, elevation: 2 });
    runtime.sprites[0] = createEventSprite({ id: 0, data: [0, 0, 0, 0, 0, 0, 0, 0] });
    const object = runtime.objectEvents[0];

    ObjectEventSetGraphicsId(runtime, object, 77);
    expect(object.graphicsId).toBe(77);

    SetObjectInvisibility(runtime, object, true);
    expect(object.invisible).toBe(true);
    expect(runtime.sprites[0].invisible).toBe(true);

    ObjectEventTurn(runtime, object, DIR_EAST);
    expect(object.facingDirection).toBe(DIR_EAST);

    IncrementObjectEventCoords(runtime, object, DIR_EAST);
    expect(object.currentCoords).toEqual({ x: 6, y: 5 });

    SetObjectEventCoords(runtime, object, 2, 3);
    expect(object.currentCoords).toEqual({ x: 2, y: 3 });
    expect(TryMoveObjectEventToMapCoords(runtime, object, 7, 8)).toBe(true);
    expect(object.currentCoords).toEqual({ x: 7, y: 8 });
    MoveObjectEventToMapCoords(runtime, object, 9, 10);
    expect(object.currentCoords).toEqual({ x: 9, y: 10 });

    SetObjectPositionByLocalIdAndMap(runtime, 1, 11, 12, 0, 0);
    expect(object.currentCoords).toEqual({ x: 11, y: 12 });

    MovementType_WanderAround_Step1(runtime, object);
    expect(object.movementStep).toBe(1);

    MovementAction_WalkNormalDown_Step0(runtime, object, DIR_SOUTH);
    expect(object.singleMovementFinished).toBe(true);

    expect(ObjectEventDoesElevationMatch(runtime, object, 2)).toBe(true);
    expect(AreElevationsCompatible(runtime, 0, 4)).toBe(true);
    expect(ElevationToPriority(runtime, 4)).toBe(1);
    UpdateObjectEventElevationAndPriority(runtime, object, 5);
    expect(object.elevation).toBe(5);
  });

  it('tracks camera sprites, copied sprites, virtual objects, and animation delay helpers', () => {
    const runtime = createEventObjectMovementRuntime();
    runtime.sprites[0] = createEventSprite({ id: 0, x: 4, y: 6, data: [1, 2, 3, 4, 5, 6, 7, 8] });

    expect(AddCameraObject(runtime)).toBe(1);
    CameraObjectSetFollowedObjectId(runtime, 4);
    expect(CameraObjectGetFollowedObjectId(runtime)).toBe(4);

    const copyId = CreateCopySpriteAt(runtime, runtime.sprites[0], 20, 30) as number;
    expect(runtime.sprites[copyId]).toMatchObject({ x: 20, y: 30 });
    expect(runtime.sprites[copyId].data).toEqual(runtime.sprites[0].data);

    const virtualId = CreateVirtualObject(runtime, 8, 9) as number;
    SetVirtualObjectGraphics(runtime, virtualId, 55);
    SetVirtualObjectSpriteAnim(runtime, virtualId, 3);
    SetVirtualObjectInvisibility(runtime, virtualId, true);
    expect(IsVirtualObjectInvisible(runtime, virtualId)).toBe(true);
    expect(runtime.virtualObjects[virtualId].data[1]).toBe(55);
    expect(runtime.virtualObjects[virtualId].animNum).toBe(3);
    runtime.sprites[5] = createEventSprite({ id: 5, callback: 'SpriteCB_VirtualObject', data: [7, 0, 0, 0, 0, 0, 0, 0] });
    expect(GetVirtualObjectSpriteId(runtime, 7)).toBe(5);
    expect(GetVirtualObjectSpriteId(runtime, 8)).toBe(MAX_SPRITES);

    MoveUnionRoomObjectUp(runtime, virtualId);
    MoveUnionRoomObjectDown(runtime, virtualId);
    expect(runtime.virtualObjects[virtualId].y).toBe(9);
    expect(IsVirtualObjectAnimating(runtime, virtualId)).toBe(true);
    DestroyVirtualObjects(runtime);
    expect(runtime.virtualObjects).toHaveLength(0);

    const sprite = runtime.sprites[0];
    SetMovementDelay(runtime, sprite, 2);
    expect(WaitForMovementDelay(runtime, sprite)).toBe(false);
    expect(WaitForMovementDelay(runtime, sprite)).toBe(true);
    SetAndStartSpriteAnim(runtime, sprite, 6);
    expect(sprite.animNum).toBe(6);
    expect(SpriteAnimEnded(runtime, sprite)).toBe(false);
  });

  it('handles palettes, vectors, player avatar ids, freezing, and ground-effect flags', () => {
    const runtime = createEventObjectMovementRuntime();
    runtime.objectEvents[0] = createObjectEvent({ active: true, localId: 1, currentCoords: { x: 1, y: 1 }, spriteId: 0 });
    runtime.objectEvents[1] = createObjectEvent({ active: true, localId: 2, currentCoords: { x: 2, y: 2 }, spriteId: 1 });
    const object = runtime.objectEvents[0];

    expect(LoadObjectEventPalette(runtime, 900)).toBe(0);
    expect(FindObjectEventPaletteIndexByTag(runtime, 900)).toBe(0);
    expect(GetReflectionEffectPaletteSlot(runtime, 2)).toBe(10);

    expect(GetVectorDirection(runtime, -5, 1)).toBe(3);
    expect(GetLimitedVectorDirection_WestEast(runtime, 5, 0)).toBe(DIR_EAST);

    SetPlayerAvatarObjectEventIdAndObjectId(runtime, 0, 0);
    expect(runtime.playerAvatar).toEqual({ objectEventId: 0, spriteId: 0 });

    FreezeObjectEvent(runtime, object);
    expect(object.frozen).toBe(true);
    UnfreezeObjectEvent(runtime, object);
    expect(object.frozen).toBe(false);

    FreezeObjectEvents(runtime);
    expect(runtime.objectEvents[0].frozen).toBe(true);
    expect(runtime.objectEvents[1].frozen).toBe(true);
    UnfreezeObjectEvents(runtime);
    expect(runtime.objectEvents[0].frozen).toBe(false);

    FreezeObjectEventsExceptOne(runtime, 0);
    expect(runtime.objectEvents[0].frozen).toBe(false);
    expect(runtime.objectEvents[1].frozen).toBe(true);

    const flag = GetGroundEffectFlags_TallGrassOnSpawn(runtime, object) as number;
    expect(flag).toBeGreaterThan(0);
    expect(object.groundEffectFlags & flag).toBe(flag);
  });

  it('reports full object event capacity using the C object-event count sentinel', () => {
    const runtime = createEventObjectMovementRuntime({
      objectEvents: Array.from({ length: OBJECT_EVENTS_COUNT }, (_, i) => createObjectEvent({ active: true, localId: i }))
    });

    expect(GetFirstInactiveObjectEventId(runtime)).toBe(OBJECT_EVENTS_COUNT);
    expect(GetAvailableObjectEventId(runtime)).toBe(false);
  });
});
