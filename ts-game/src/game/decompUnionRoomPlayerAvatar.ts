export const MAX_SPRITES = 64;
export const MAX_UNION_ROOM_LEADERS = 8;
export const MAX_RFU_PLAYERS = 5;
export const NUM_UNION_ROOM_SPRITES = MAX_UNION_ROOM_LEADERS * MAX_RFU_PLAYERS;
export const NUM_UNION_ROOM_CLASSES = 8;
export const UR_SPRITE_START_ID = MAX_SPRITES - MAX_UNION_ROOM_LEADERS;
export const NUM_TASKS = 16;

export const UNION_ROOM_SPAWN_NONE = 0;
export const UNION_ROOM_SPAWN_IN = 1;
export const UNION_ROOM_SPAWN_OUT = 2;
export const UNION_ROOM_SPAWN_OUT_SOON = 3;

export const MALE = 0;
export const FEMALE = 1;
export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;
export const T_NOT_MOVING = 0;
export const T_TILE_CENTER = 2;
export const MAP_OFFSET = 7;

export const ACTIVITY_NONE = 0;
export const ACTIVITY_BATTLE_SINGLE = 1;
export const ACTIVITY_TRADE = 4;
export const ACTIVITY_CHAT = 5;
export const ACTIVITY_CARD = 8;
export const ACTIVITY_ACCEPT = 17;
export const ACTIVITY_DECLINE = 18;
export const ACTIVITY_NPCTALK = 19;
export const ACTIVITY_PLYRTALK = 20;
export const IN_UNION_ROOM = 1 << 6;

export const PINFO_TID_MASK = 0x7;
export const PINFO_GENDER_SHIFT = 3;

export const MOVEMENT_ACTION_FLY_UP = 0xa4;
export const MOVEMENT_ACTION_FLY_DOWN = 0xa5;
export const MOVEMENT_ACTION_STEP_END = 0xfe;

export const OBJ_EVENT_GFX_COOLTRAINER_M = 41;
export const OBJ_EVENT_GFX_BLACK_BELT = 54;
export const OBJ_EVENT_GFX_CAMPER = 39;
export const OBJ_EVENT_GFX_YOUNGSTER = 18;
export const OBJ_EVENT_GFX_BOY = 19;
export const OBJ_EVENT_GFX_BUG_CATCHER = 20;
export const OBJ_EVENT_GFX_MAN = 25;
export const OBJ_EVENT_GFX_ROCKER = 26;
export const OBJ_EVENT_GFX_COOLTRAINER_F = 42;
export const OBJ_EVENT_GFX_CHANNELER = 58;
export const OBJ_EVENT_GFX_PICNICKER = 40;
export const OBJ_EVENT_GFX_LASS = 22;
export const OBJ_EVENT_GFX_WOMAN_1 = 23;
export const OBJ_EVENT_GFX_CRUSH_GIRL = 24;
export const OBJ_EVENT_GFX_WOMAN_2 = 28;
export const OBJ_EVENT_GFX_BEAUTY = 29;

export const FLAG_HIDE_UNION_ROOM_PLAYER_1 = 0x063;
export const VAR_OBJ_GFX_ID_0 = 0x4010;

export const sUnionRoomObjGfxIds = [
  [OBJ_EVENT_GFX_COOLTRAINER_M, OBJ_EVENT_GFX_BLACK_BELT, OBJ_EVENT_GFX_CAMPER, OBJ_EVENT_GFX_YOUNGSTER, OBJ_EVENT_GFX_BOY, OBJ_EVENT_GFX_BUG_CATCHER, OBJ_EVENT_GFX_MAN, OBJ_EVENT_GFX_ROCKER],
  [OBJ_EVENT_GFX_COOLTRAINER_F, OBJ_EVENT_GFX_CHANNELER, OBJ_EVENT_GFX_PICNICKER, OBJ_EVENT_GFX_LASS, OBJ_EVENT_GFX_WOMAN_1, OBJ_EVENT_GFX_CRUSH_GIRL, OBJ_EVENT_GFX_WOMAN_2, OBJ_EVENT_GFX_BEAUTY]
];
export const sUnionRoomPlayerCoords = [[4, 6], [13, 8], [10, 6], [1, 8], [13, 4], [7, 4], [1, 4], [7, 8]];
export const sUnionRoomGroupOffsets = [[0, 0], [1, 0], [0, -1], [-1, 0], [0, 1]];
export const sOppositeFacingDirection = [DIR_NONE, DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST];
export const sMemberFacingDirections = [DIR_SOUTH, DIR_WEST, DIR_SOUTH, DIR_EAST, DIR_NORTH];
export const sUnionRoomLocalIds = [9, 8, 7, 2, 6, 5, 4, 3];

export type UnionRoomObject = { state: number; gfxId: number; animState: number; schedAnim: number };
export type ObjectEvent = { localId: number; movementOverridden: boolean; heldMovement: number | null; heldMovementFinished: boolean; frozen: boolean };
export type VirtualObject = { gfxId: number; x: number; y: number; elevation: number; direction: number; invisible: boolean; animating: boolean; spriteAnim: number | null; destroyed: boolean };
export type RfuGameData = { activity: number; playerGender: number; compatibility: { playerTrainerId: number[] }; partnerInfo: number[] };
export type RfuPlayer = { rfu: { data: RfuGameData }; groupScheduledAnim: number };
export type RfuPlayerList = { players: RfuPlayer[] };
export type WirelessLinkURoom = { playerList: RfuPlayerList };
export type UnionRoomAvatarRuntime = {
  sUnionObjWork: UnionRoomObject[] | null;
  sUnionObjRefreshTimer: number;
  gPlayerAvatar: { tileTransitionState: number };
  gSaveBlock1Ptr: { location: { mapNum: number; mapGroup: number } };
  flags: Set<number>;
  vars: Map<number, number>;
  gObjectEvents: ObjectEvent[];
  objectEventByLocalId: Map<string, number>;
  virtualObjects: Map<number, VirtualObject>;
  sprites: Array<{ destroyed: boolean }>;
  tasks: Array<{ func: 'Task_AnimateUnionRoomPlayers'; priority: number; destroyed: boolean }>;
  playerDestCoords: { x: number; y: number };
  playerDriftCoords: { x: number; y: number };
  playerFacingCoords: { x: number; y: number };
  playerFacingDirection: number;
  playerFieldControlsLocked: boolean;
  metatileImpassability: Map<string, boolean>;
  log: string[];
};

export const createUnionRoomObject = (): UnionRoomObject => ({ state: 0, gfxId: 0, animState: 0, schedAnim: UNION_ROOM_SPAWN_NONE });
export const createRfuGameData = (): RfuGameData => ({
  activity: ACTIVITY_NONE | IN_UNION_ROOM,
  playerGender: MALE,
  compatibility: { playerTrainerId: [0] },
  partnerInfo: [0, 0, 0, 0]
});
export const createUnionRoomAvatarRuntime = (): UnionRoomAvatarRuntime => ({
  sUnionObjWork: null,
  sUnionObjRefreshTimer: 0,
  gPlayerAvatar: { tileTransitionState: T_NOT_MOVING },
  gSaveBlock1Ptr: { location: { mapNum: 1, mapGroup: 2 } },
  flags: new Set(),
  vars: new Map(),
  gObjectEvents: [],
  objectEventByLocalId: new Map(),
  virtualObjects: new Map(),
  sprites: Array.from({ length: MAX_SPRITES }, () => ({ destroyed: false })),
  tasks: [],
  playerDestCoords: { x: 0, y: 0 },
  playerDriftCoords: { x: 0, y: 0 },
  playerFacingCoords: { x: 0, y: 0 },
  playerFacingDirection: DIR_SOUTH,
  playerFieldControlsLocked: false,
  metatileImpassability: new Map(),
  log: []
});

const key = (localId: number, mapNum: number, mapGroup: number): string => `${localId}:${mapNum}:${mapGroup}`;
export const UR_PLAYER_SPRITE_ID = (leaderId: number, memberId: number): number => MAX_RFU_PLAYERS * leaderId + memberId;
export const IsPlayerStandingStill = (runtime: UnionRoomAvatarRuntime): boolean =>
  runtime.gPlayerAvatar.tileTransitionState === T_TILE_CENTER || runtime.gPlayerAvatar.tileTransitionState === T_NOT_MOVING;
export const GetUnionRoomPlayerGraphicsId = (gender: number, id: number): number => sUnionRoomObjGfxIds[gender][id % NUM_UNION_ROOM_CLASSES];
export const GetUnionRoomPlayerCoords = (leaderId: number, memberId: number): { x: number; y: number } => ({
  x: sUnionRoomPlayerCoords[leaderId][0] + sUnionRoomGroupOffsets[memberId][0] + MAP_OFFSET,
  y: sUnionRoomPlayerCoords[leaderId][1] + sUnionRoomGroupOffsets[memberId][1] + MAP_OFFSET
});
export const IsUnionRoomPlayerAt = (leaderId: number, memberId: number, x: number, y: number): boolean => {
  const coords = GetUnionRoomPlayerCoords(leaderId, memberId);
  return coords.x === x && coords.y === y ? true : false;
};

export const FlagGet = (runtime: UnionRoomAvatarRuntime, flagId: number): boolean => runtime.flags.has(flagId);
export const FlagSet = (runtime: UnionRoomAvatarRuntime, flagId: number): void => { runtime.flags.add(flagId); };
export const FlagClear = (runtime: UnionRoomAvatarRuntime, flagId: number): void => { runtime.flags.delete(flagId); };
export const IsUnionRoomPlayerHidden = (runtime: UnionRoomAvatarRuntime, leaderId: number): boolean => FlagGet(runtime, FLAG_HIDE_UNION_ROOM_PLAYER_1 + leaderId);
export const HideUnionRoomPlayer = (runtime: UnionRoomAvatarRuntime, leaderId: number): void => FlagSet(runtime, FLAG_HIDE_UNION_ROOM_PLAYER_1 + leaderId);
export const ShowUnionRoomPlayer = (runtime: UnionRoomAvatarRuntime, leaderId: number): void => FlagClear(runtime, FLAG_HIDE_UNION_ROOM_PLAYER_1 + leaderId);
export const VarSet = (runtime: UnionRoomAvatarRuntime, variable: number, value: number): void => { runtime.vars.set(variable, value); };
export const SetUnionRoomPlayerGfx = (runtime: UnionRoomAvatarRuntime, leaderId: number, gfxId: number): void => VarSet(runtime, VAR_OBJ_GFX_ID_0 + leaderId, gfxId);

export const TrySpawnObjectEvent = (runtime: UnionRoomAvatarRuntime, localId: number, mapNum: number, mapGroup: number): number => {
  const objectId = runtime.gObjectEvents.length;
  runtime.gObjectEvents.push({ localId, movementOverridden: false, heldMovement: null, heldMovementFinished: true, frozen: false });
  runtime.objectEventByLocalId.set(key(localId, mapNum, mapGroup), objectId);
  runtime.log.push(`TrySpawnObjectEvent:${localId}:${mapNum}:${mapGroup}`);
  return objectId;
};
export const RemoveObjectEventByLocalIdAndMap = (runtime: UnionRoomAvatarRuntime, localId: number, mapNum: number, mapGroup: number): void => {
  runtime.objectEventByLocalId.delete(key(localId, mapNum, mapGroup));
  runtime.log.push(`RemoveObjectEventByLocalIdAndMap:${localId}:${mapNum}:${mapGroup}`);
};
export const CreateUnionRoomPlayerObjectEvent = (runtime: UnionRoomAvatarRuntime, leaderId: number): void =>
  void TrySpawnObjectEvent(runtime, sUnionRoomLocalIds[leaderId], runtime.gSaveBlock1Ptr.location.mapNum, runtime.gSaveBlock1Ptr.location.mapGroup);
export const RemoveUnionRoomPlayerObjectEvent = (runtime: UnionRoomAvatarRuntime, leaderId: number): void =>
  RemoveObjectEventByLocalIdAndMap(runtime, sUnionRoomLocalIds[leaderId], runtime.gSaveBlock1Ptr.location.mapNum, runtime.gSaveBlock1Ptr.location.mapGroup);

export const TryGetObjectEventIdByLocalIdAndMap = (runtime: UnionRoomAvatarRuntime, localId: number, mapNum: number, mapGroup: number): { failed: boolean; objectId: number } => {
  const objectId = runtime.objectEventByLocalId.get(key(localId, mapNum, mapGroup));
  return objectId === undefined ? { failed: true, objectId: 0 } : { failed: false, objectId };
};
export const ObjectEventIsMovementOverridden = (object: ObjectEvent): boolean => object.movementOverridden;
export const ObjectEventSetHeldMovement = (object: ObjectEvent, movement: number): boolean => {
  object.heldMovement = movement;
  object.movementOverridden = true;
  object.heldMovementFinished = false;
  return false;
};
export const ObjectEventClearHeldMovementIfFinished = (object: ObjectEvent): boolean => {
  if (!object.heldMovementFinished) return false;
  object.movementOverridden = false;
  object.heldMovement = null;
  return true;
};
export const SetUnionRoomPlayerEnterExitMovement = (runtime: UnionRoomAvatarRuntime, leaderId: number, movement: readonly number[]): boolean => {
  const found = TryGetObjectEventIdByLocalIdAndMap(runtime, sUnionRoomLocalIds[leaderId], runtime.gSaveBlock1Ptr.location.mapNum, runtime.gSaveBlock1Ptr.location.mapGroup);
  if (found.failed) return false;
  const object = runtime.gObjectEvents[found.objectId];
  if (ObjectEventIsMovementOverridden(object)) return false;
  if (ObjectEventSetHeldMovement(object, movement[0])) return false;
  return true;
};
export const TryReleaseUnionRoomPlayerObjectEvent = (runtime: UnionRoomAvatarRuntime, leaderId: number): boolean => {
  const found = TryGetObjectEventIdByLocalIdAndMap(runtime, sUnionRoomLocalIds[leaderId], runtime.gSaveBlock1Ptr.location.mapNum, runtime.gSaveBlock1Ptr.location.mapGroup);
  if (found.failed) return true;
  const object = runtime.gObjectEvents[found.objectId];
  if (!ObjectEventClearHeldMovementIfFinished(object)) return false;
  object.frozen = runtime.playerFieldControlsLocked;
  return true;
};

export const CreateTask_AnimateUnionRoomPlayers = (runtime: UnionRoomAvatarRuntime): number => {
  if (runtime.tasks.some((task) => task.func === 'Task_AnimateUnionRoomPlayers' && !task.destroyed)) return NUM_TASKS;
  runtime.tasks.push({ func: 'Task_AnimateUnionRoomPlayers', priority: 5, destroyed: false });
  return runtime.tasks.length - 1;
};
export const InitUnionRoomPlayerObjects = (runtime: UnionRoomAvatarRuntime, players: UnionRoomObject[]): number => {
  runtime.sUnionObjRefreshTimer = 0;
  runtime.sUnionObjWork = players;
  for (let i = 0; i < MAX_UNION_ROOM_LEADERS; i += 1) {
    players[i].state = 0;
    players[i].gfxId = 0;
    players[i].animState = 0;
    players[i].schedAnim = UNION_ROOM_SPAWN_NONE;
  }
  return CreateTask_AnimateUnionRoomPlayers(runtime);
};

export const sMovement_UnionPlayerExit = [MOVEMENT_ACTION_FLY_UP, MOVEMENT_ACTION_STEP_END];
export const sMovement_UnionPlayerEnter = [MOVEMENT_ACTION_FLY_DOWN, MOVEMENT_ACTION_STEP_END];

export const PlayerGetDestCoords = (runtime: UnionRoomAvatarRuntime): { x: number; y: number } => runtime.playerDestCoords;
export const player_get_pos_including_state_based_drift = (runtime: UnionRoomAvatarRuntime): { x: number; y: number } => runtime.playerDriftCoords;
export const AnimateUnionRoomPlayerSpawn = (runtime: UnionRoomAvatarRuntime, object: UnionRoomObject, leaderId: number): boolean => {
  switch (object.animState) {
    case 0:
      if (!IsPlayerStandingStill(runtime)) break;
      if (IsUnionRoomPlayerAt(leaderId, 0, PlayerGetDestCoords(runtime).x, PlayerGetDestCoords(runtime).y)) break;
      if (IsUnionRoomPlayerAt(leaderId, 0, player_get_pos_including_state_based_drift(runtime).x, player_get_pos_including_state_based_drift(runtime).y)) break;
      SetUnionRoomPlayerGfx(runtime, leaderId, object.gfxId);
      CreateUnionRoomPlayerObjectEvent(runtime, leaderId);
      ShowUnionRoomPlayer(runtime, leaderId);
      object.animState += 1;
    // fallthrough
    case 3:
      if (SetUnionRoomPlayerEnterExitMovement(runtime, leaderId, sMovement_UnionPlayerEnter) === true) object.animState += 1;
      break;
    case 2:
      if (TryReleaseUnionRoomPlayerObjectEvent(runtime, leaderId)) {
        object.animState = 0;
        return true;
      }
      break;
  }
  return false;
};
export const AnimateUnionRoomPlayerDespawn = (runtime: UnionRoomAvatarRuntime, object: UnionRoomObject, leaderId: number): boolean => {
  switch (object.animState) {
    case 0:
      if (SetUnionRoomPlayerEnterExitMovement(runtime, leaderId, sMovement_UnionPlayerExit) === true) {
        HideUnionRoomPlayer(runtime, leaderId);
        object.animState += 1;
      }
      break;
    case 1:
      if (TryReleaseUnionRoomPlayerObjectEvent(runtime, leaderId)) {
        RemoveUnionRoomPlayerObjectEvent(runtime, leaderId);
        HideUnionRoomPlayer(runtime, leaderId);
        object.animState = 0;
        return true;
      }
      break;
  }
  return false;
};
export const SpawnGroupLeader = (runtime: UnionRoomAvatarRuntime, leaderId: number, gender: number, id: number): boolean => {
  const object = runtime.sUnionObjWork![leaderId];
  object.schedAnim = UNION_ROOM_SPAWN_IN;
  object.gfxId = GetUnionRoomPlayerGraphicsId(gender, id);
  return object.state === 0 ? true : false;
};
export const DespawnGroupLeader = (runtime: UnionRoomAvatarRuntime, leaderId: number): boolean => {
  const object = runtime.sUnionObjWork![leaderId];
  object.schedAnim = UNION_ROOM_SPAWN_OUT;
  return object.state === 1 ? true : false;
};
export const IsUnionRoomPlayerInvisible = (runtime: UnionRoomAvatarRuntime, leaderId: number, memberId: number): boolean =>
  IsVirtualObjectInvisible(runtime, UR_PLAYER_SPRITE_ID(leaderId, memberId) - UR_SPRITE_START_ID);
export const AnimateUnionRoomPlayer = (runtime: UnionRoomAvatarRuntime, leaderId: number, object: UnionRoomObject): void => {
  switch (object.state) {
    case 0:
      if (object.schedAnim === UNION_ROOM_SPAWN_IN) {
        object.state = 2;
        object.animState = 0;
      } else break;
    // fallthrough
    case 2:
      if (!IsUnionRoomPlayerInvisible(runtime, leaderId, 0) && object.schedAnim === UNION_ROOM_SPAWN_OUT) {
        object.state = 0; object.animState = 0; RemoveUnionRoomPlayerObjectEvent(runtime, leaderId); HideUnionRoomPlayer(runtime, leaderId);
      } else if (AnimateUnionRoomPlayerSpawn(runtime, object, leaderId) === true) object.state = 1;
      break;
    case 1:
      if (object.schedAnim !== UNION_ROOM_SPAWN_OUT) break;
      object.state = 3; object.animState = 0;
    // fallthrough
    case 3:
      if (AnimateUnionRoomPlayerDespawn(runtime, object, leaderId) === true) object.state = 0;
      break;
  }
  object.schedAnim = UNION_ROOM_SPAWN_NONE;
};
export const Task_AnimateUnionRoomPlayers = (runtime: UnionRoomAvatarRuntime): void => {
  for (let i = 0; i < MAX_UNION_ROOM_LEADERS; i += 1) AnimateUnionRoomPlayer(runtime, i, runtime.sUnionObjWork![i]);
};
export const DestroyTask_AnimateUnionRoomPlayers = (runtime: UnionRoomAvatarRuntime): void => {
  const task = runtime.tasks.find((entry) => entry.func === 'Task_AnimateUnionRoomPlayers' && !entry.destroyed);
  if (task) task.destroyed = true;
};
export const DestroyUnionRoomPlayerObjects = (runtime: UnionRoomAvatarRuntime): void => {
  for (let i = 0; i < MAX_UNION_ROOM_LEADERS; i += 1) {
    if (!IsUnionRoomPlayerHidden(runtime, i)) {
      RemoveUnionRoomPlayerObjectEvent(runtime, i);
      HideUnionRoomPlayer(runtime, i);
    }
  }
  runtime.sUnionObjWork = null;
  DestroyTask_AnimateUnionRoomPlayers(runtime);
};

export const CreateVirtualObject = (runtime: UnionRoomAvatarRuntime, gfxId: number, id: number, x: number, y: number, elevation: number, direction: number): number => {
  runtime.virtualObjects.set(id, { gfxId, x, y, elevation, direction, invisible: false, animating: false, spriteAnim: null, destroyed: false });
  return id;
};
export const SetVirtualObjectInvisibility = (runtime: UnionRoomAvatarRuntime, id: number, invisible: boolean): void => { runtime.virtualObjects.get(id)!.invisible = invisible; };
export const IsVirtualObjectInvisible = (runtime: UnionRoomAvatarRuntime, id: number): boolean => runtime.virtualObjects.get(id)?.invisible ?? true;
export const IsVirtualObjectAnimating = (runtime: UnionRoomAvatarRuntime, id: number): boolean => runtime.virtualObjects.get(id)?.animating ?? false;
export const SetVirtualObjectSpriteAnim = (runtime: UnionRoomAvatarRuntime, id: number, anim: number): void => { const obj = runtime.virtualObjects.get(id)!; obj.spriteAnim = anim; obj.animating = true; };
export const SetVirtualObjectGraphics = (runtime: UnionRoomAvatarRuntime, id: number, gfxId: number): void => { runtime.virtualObjects.get(id)!.gfxId = gfxId; };
export const TurnVirtualObject = (runtime: UnionRoomAvatarRuntime, id: number, direction: number): void => { runtime.virtualObjects.get(id)!.direction = direction; };
export const CreateUnionRoomPlayerSprites = (runtime: UnionRoomAvatarRuntime, spriteIds: number[], leaderId: number): void => {
  for (let memberId = 0; memberId < MAX_RFU_PLAYERS; memberId += 1) {
    const id = UR_PLAYER_SPRITE_ID(leaderId, memberId);
    spriteIds[id] = CreateVirtualObject(runtime, OBJ_EVENT_GFX_MAN, id - UR_SPRITE_START_ID, sUnionRoomPlayerCoords[leaderId][0] + sUnionRoomGroupOffsets[memberId][0], sUnionRoomPlayerCoords[leaderId][1] + sUnionRoomGroupOffsets[memberId][1], 3, 1);
    SetVirtualObjectInvisibility(runtime, id - UR_SPRITE_START_ID, true);
  }
};
export const DestroyUnionRoomPlayerSprites = (runtime: UnionRoomAvatarRuntime, spriteIds: number[]): void => {
  for (let i = 0; i < NUM_UNION_ROOM_SPRITES; i += 1) runtime.sprites[spriteIds[i]].destroyed = true;
};
export const MapGridSetMetatileImpassabilityAt = (runtime: UnionRoomAvatarRuntime, x: number, y: number, impassable: boolean): void => {
  runtime.metatileImpassability.set(`${x}:${y}`, impassable);
};
export const MakeGroupAssemblyAreasPassable = (runtime: UnionRoomAvatarRuntime): void => {
  for (let leaderId = 0; leaderId < MAX_UNION_ROOM_LEADERS; leaderId += 1)
    for (let memberId = 0; memberId < MAX_RFU_PLAYERS; memberId += 1) {
      const coords = GetUnionRoomPlayerCoords(leaderId, memberId);
      MapGridSetMetatileImpassabilityAt(runtime, coords.x, coords.y, false);
    }
};
export const GetNewFacingDirectionForUnionRoomPlayer = (memberId: number, gameData: RfuGameData): number => {
  if (memberId !== 0) return sMemberFacingDirections[memberId];
  if (gameData.activity === (ACTIVITY_CHAT | IN_UNION_ROOM)) return DIR_SOUTH;
  return DIR_EAST;
};
export const SetUnionRoomObjectFacingDirection = (runtime: UnionRoomAvatarRuntime, memberId: number, leaderId: number, direction: number): void =>
  TurnVirtualObject(runtime, MAX_RFU_PLAYERS * leaderId - UR_SPRITE_START_ID + memberId, direction);
export const SpawnGroupMember = (runtime: UnionRoomAvatarRuntime, leaderId: number, memberId: number, graphicsId: number, gameData: RfuGameData): void => {
  const id = UR_PLAYER_SPRITE_ID(leaderId, memberId);
  if (IsUnionRoomPlayerInvisible(runtime, leaderId, memberId) === true) {
    SetVirtualObjectInvisibility(runtime, id - UR_SPRITE_START_ID, false);
    SetVirtualObjectSpriteAnim(runtime, id - UR_SPRITE_START_ID, UNION_ROOM_SPAWN_IN);
  }
  SetVirtualObjectGraphics(runtime, id - UR_SPRITE_START_ID, graphicsId);
  SetUnionRoomObjectFacingDirection(runtime, memberId, leaderId, GetNewFacingDirectionForUnionRoomPlayer(memberId, gameData));
  const coords = GetUnionRoomPlayerCoords(leaderId, memberId);
  MapGridSetMetatileImpassabilityAt(runtime, coords.x, coords.y, true);
};
export const DespawnGroupMember = (runtime: UnionRoomAvatarRuntime, leaderId: number, memberId: number): void => {
  SetVirtualObjectSpriteAnim(runtime, UR_PLAYER_SPRITE_ID(leaderId, memberId) - UR_SPRITE_START_ID, UNION_ROOM_SPAWN_OUT);
  const coords = GetUnionRoomPlayerCoords(leaderId, memberId);
  MapGridSetMetatileImpassabilityAt(runtime, coords.x, coords.y, false);
};
export const AssembleGroup = (runtime: UnionRoomAvatarRuntime, leaderId: number, gameData: RfuGameData): void => {
  const dest = PlayerGetDestCoords(runtime);
  const drift = player_get_pos_including_state_based_drift(runtime);
  if (IsUnionRoomPlayerInvisible(runtime, leaderId, 0) === true) {
    if (IsUnionRoomPlayerAt(leaderId, 0, dest.x, dest.y) || IsUnionRoomPlayerAt(leaderId, 0, drift.x, drift.y)) return;
    SpawnGroupMember(runtime, leaderId, 0, GetUnionRoomPlayerGraphicsId(gameData.playerGender, gameData.compatibility.playerTrainerId[0]), gameData);
  }
  for (let i = 1; i < MAX_RFU_PLAYERS; i += 1) {
    if (gameData.partnerInfo[i - 1] === 0) DespawnGroupMember(runtime, leaderId, i);
    else if (IsUnionRoomPlayerAt(leaderId, i, dest.x, dest.y) === false && IsUnionRoomPlayerAt(leaderId, i, drift.x, drift.y) === false)
      SpawnGroupMember(runtime, leaderId, i, GetUnionRoomPlayerGraphicsId((gameData.partnerInfo[i - 1] >> PINFO_GENDER_SHIFT) & 1, gameData.partnerInfo[i - 1] & PINFO_TID_MASK), gameData);
  }
};
export const SpawnGroupLeaderAndMembers = (runtime: UnionRoomAvatarRuntime, leaderId: number, gameData: RfuGameData): void => {
  switch (gameData.activity) {
    case ACTIVITY_NONE | IN_UNION_ROOM:
    case ACTIVITY_PLYRTALK | IN_UNION_ROOM:
      SpawnGroupLeader(runtime, leaderId, gameData.playerGender, gameData.compatibility.playerTrainerId[0]);
      for (let i = 0; i < MAX_RFU_PLAYERS; i += 1) DespawnGroupMember(runtime, leaderId, i);
      break;
    case ACTIVITY_BATTLE_SINGLE | IN_UNION_ROOM:
    case ACTIVITY_TRADE | IN_UNION_ROOM:
    case ACTIVITY_CHAT | IN_UNION_ROOM:
    case ACTIVITY_CARD | IN_UNION_ROOM:
    case ACTIVITY_ACCEPT | IN_UNION_ROOM:
    case ACTIVITY_DECLINE | IN_UNION_ROOM:
    case ACTIVITY_NPCTALK | IN_UNION_ROOM:
      DespawnGroupLeader(runtime, leaderId);
      AssembleGroup(runtime, leaderId, gameData);
      break;
    default:
      runtime.log.push('AGB_ASSERT:SpawnGroupLeaderAndMembers');
  }
};
export const DespawnGroupLeaderAndMembers = (runtime: UnionRoomAvatarRuntime, leaderId: number): void => {
  DespawnGroupLeader(runtime, leaderId);
  for (let i = 0; i < MAX_RFU_PLAYERS; i += 1) DespawnGroupMember(runtime, leaderId, i);
};
export const UpdateUnionRoomPlayerSprites = (runtime: UnionRoomAvatarRuntime, uroom: WirelessLinkURoom): void => {
  runtime.sUnionObjRefreshTimer = 0;
  for (let i = 0; i < MAX_UNION_ROOM_LEADERS; i += 1) {
    const leader = uroom.playerList.players[i];
    if (leader.groupScheduledAnim === UNION_ROOM_SPAWN_IN) SpawnGroupLeaderAndMembers(runtime, i, leader.rfu.data);
    else if (leader.groupScheduledAnim === UNION_ROOM_SPAWN_OUT) DespawnGroupLeaderAndMembers(runtime, i);
  }
};
export const ScheduleUnionRoomPlayerRefresh = (runtime: UnionRoomAvatarRuntime): void => { runtime.sUnionObjRefreshTimer = 300; };
export const HandleUnionRoomPlayerRefresh = (runtime: UnionRoomAvatarRuntime, uroom: WirelessLinkURoom): void => {
  runtime.sUnionObjRefreshTimer += 1;
  if (runtime.sUnionObjRefreshTimer > 300) UpdateUnionRoomPlayerSprites(runtime, uroom);
};
export const GetXYCoordsOneStepInFrontOfPlayer = (runtime: UnionRoomAvatarRuntime): { x: number; y: number } => runtime.playerFacingCoords;
export const GetPlayerFacingDirection = (runtime: UnionRoomAvatarRuntime): number => runtime.playerFacingDirection;
export const TryInteractWithUnionRoomMember = (runtime: UnionRoomAvatarRuntime, list: RfuPlayerList, memberIdPtr: { value: number }, leaderIdPtr: { value: number }): boolean => {
  if (!IsPlayerStandingStill(runtime)) return false;
  const coords = GetXYCoordsOneStepInFrontOfPlayer(runtime);
  for (let leaderId = 0; leaderId < MAX_UNION_ROOM_LEADERS; leaderId += 1) {
    for (let memberId = 0; memberId < MAX_RFU_PLAYERS; memberId += 1) {
      const objId = UR_PLAYER_SPRITE_ID(leaderId, memberId);
      const target = GetUnionRoomPlayerCoords(leaderId, memberId);
      if (coords.x !== target.x) continue;
      if (coords.y !== target.y) continue;
      if (IsVirtualObjectInvisible(runtime, objId - UR_SPRITE_START_ID) !== false) continue;
      if (IsVirtualObjectAnimating(runtime, objId - UR_SPRITE_START_ID) !== false) continue;
      if (list.players[leaderId].groupScheduledAnim !== UNION_ROOM_SPAWN_IN) continue;
      SetUnionRoomObjectFacingDirection(runtime, memberId, leaderId, sOppositeFacingDirection[GetPlayerFacingDirection(runtime)]);
      memberIdPtr.value = memberId;
      leaderIdPtr.value = leaderId;
      return true;
    }
  }
  return false;
};
export const UpdateUnionRoomMemberFacing = (runtime: UnionRoomAvatarRuntime, memberId: number, leaderId: number, list: RfuPlayerList): void =>
  SetUnionRoomObjectFacingDirection(runtime, memberId, leaderId, GetNewFacingDirectionForUnionRoomPlayer(memberId, list.players[leaderId].rfu.data));
