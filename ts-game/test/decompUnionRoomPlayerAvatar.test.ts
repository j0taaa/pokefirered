import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_BATTLE_SINGLE,
  ACTIVITY_CHAT,
  ACTIVITY_NONE,
  DIR_EAST,
  DIR_NORTH,
  DIR_SOUTH,
  FEMALE,
  FLAG_HIDE_UNION_ROOM_PLAYER_1,
  GetUnionRoomPlayerCoords,
  GetUnionRoomPlayerGraphicsId,
  IN_UNION_ROOM,
  InitUnionRoomPlayerObjects,
  IsUnionRoomPlayerAt,
  MAX_RFU_PLAYERS,
  MAX_UNION_ROOM_LEADERS,
  MOVEMENT_ACTION_FLY_DOWN,
  MOVEMENT_ACTION_FLY_UP,
  NUM_TASKS,
  OBJ_EVENT_GFX_BEAUTY,
  OBJ_EVENT_GFX_COOLTRAINER_M,
  OBJ_EVENT_GFX_MAN,
  PINFO_GENDER_SHIFT,
  SpawnGroupLeader,
  T_TILE_CENTER,
  Task_AnimateUnionRoomPlayers,
  TryInteractWithUnionRoomMember,
  UNION_ROOM_SPAWN_IN,
  UNION_ROOM_SPAWN_NONE,
  UNION_ROOM_SPAWN_OUT,
  VAR_OBJ_GFX_ID_0,
  AnimateUnionRoomPlayer,
  AssembleGroup,
  CreateUnionRoomPlayerSprites,
  DespawnGroupLeaderAndMembers,
  DestroyUnionRoomPlayerObjects,
  DestroyUnionRoomPlayerSprites,
  GetNewFacingDirectionForUnionRoomPlayer,
  HandleUnionRoomPlayerRefresh,
  MakeGroupAssemblyAreasPassable,
  ScheduleUnionRoomPlayerRefresh,
  SpawnGroupLeaderAndMembers,
  UpdateUnionRoomMemberFacing,
  createRfuGameData,
  createUnionRoomAvatarRuntime,
  createUnionRoomObject,
  sUnionRoomLocalIds,
} from '../src/game/decompUnionRoomPlayerAvatar';
import type { RfuPlayer, RfuPlayerList, WirelessLinkURoom } from '../src/game/decompUnionRoomPlayerAvatar';

const makePlayers = () => Array.from({ length: MAX_UNION_ROOM_LEADERS }, () => createUnionRoomObject());
const makePlayer = (activity = ACTIVITY_NONE | IN_UNION_ROOM): RfuPlayer => ({
  rfu: { data: { ...createRfuGameData(), activity, compatibility: { playerTrainerId: [0] }, partnerInfo: [0, 0, 0, 0] } },
  groupScheduledAnim: UNION_ROOM_SPAWN_NONE,
});
const makeList = (): RfuPlayerList => ({ players: Array.from({ length: MAX_UNION_ROOM_LEADERS }, () => makePlayer()) });

describe('decompUnionRoomPlayerAvatar', () => {
  it('initializes work objects and refuses duplicate animation task creation', () => {
    const runtime = createUnionRoomAvatarRuntime();
    const players = makePlayers();
    players[2] = { state: 9, gfxId: 9, animState: 9, schedAnim: 9 };

    expect(InitUnionRoomPlayerObjects(runtime, players)).toBe(0);
    expect(runtime.sUnionObjWork).toBe(players);
    expect(runtime.sUnionObjRefreshTimer).toBe(0);
    expect(players.every((player) => player.state === 0 && player.gfxId === 0 && player.animState === 0 && player.schedAnim === 0)).toBe(true);
    expect(runtime.tasks[0]).toMatchObject({ func: 'Task_AnimateUnionRoomPlayers', priority: 5, destroyed: false });
    expect(InitUnionRoomPlayerObjects(runtime, players)).toBe(NUM_TASKS);
  });

  it('coordinate and graphics helpers preserve the C tables and modulo class lookup', () => {
    expect(GetUnionRoomPlayerGraphicsId(0, 8)).toBe(OBJ_EVENT_GFX_COOLTRAINER_M);
    expect(GetUnionRoomPlayerGraphicsId(FEMALE, 15)).toBe(OBJ_EVENT_GFX_BEAUTY);
    expect(GetUnionRoomPlayerCoords(0, 0)).toEqual({ x: 11, y: 13 });
    expect(GetUnionRoomPlayerCoords(0, 1)).toEqual({ x: 12, y: 13 });
    expect(IsUnionRoomPlayerAt(0, 2, 11, 12)).toBe(true);
    expect(IsUnionRoomPlayerAt(0, 2, 12, 12)).toBe(false);
  });

  it('leader spawn follows the decompiled fallthrough and release flow', () => {
    const runtime = createUnionRoomAvatarRuntime();
    const players = makePlayers();
    InitUnionRoomPlayerObjects(runtime, players);
    runtime.playerDestCoords = { x: 0, y: 0 };
    runtime.playerDriftCoords = { x: 0, y: 0 };
    runtime.gPlayerAvatar.tileTransitionState = T_TILE_CENTER;

    expect(SpawnGroupLeader(runtime, 0, 0, 3)).toBe(true);
    AnimateUnionRoomPlayer(runtime, 0, players[0]);

    expect(players[0].state).toBe(2);
    expect(players[0].animState).toBe(2);
    expect(players[0].schedAnim).toBe(UNION_ROOM_SPAWN_NONE);
    expect(runtime.vars.get(VAR_OBJ_GFX_ID_0)).toBe(GetUnionRoomPlayerGraphicsId(0, 3));
    expect(runtime.flags.has(FLAG_HIDE_UNION_ROOM_PLAYER_1)).toBe(false);
    const object = runtime.gObjectEvents[0];
    expect(object.heldMovement).toBe(MOVEMENT_ACTION_FLY_DOWN);
    expect(object.movementOverridden).toBe(true);

    AnimateUnionRoomPlayer(runtime, 0, players[0]);
    expect(players[0].state).toBe(2);
    object.heldMovementFinished = true;
    AnimateUnionRoomPlayer(runtime, 0, players[0]);
    expect(players[0].state).toBe(1);
    expect(players[0].animState).toBe(0);
  });

  it('despawn movement hides, waits for movement completion, removes object event, and returns to state 0', () => {
    const runtime = createUnionRoomAvatarRuntime();
    const players = makePlayers();
    InitUnionRoomPlayerObjects(runtime, players);
    runtime.playerDestCoords = { x: 0, y: 0 };
    runtime.playerDriftCoords = { x: 0, y: 0 };
    SpawnGroupLeader(runtime, 1, 0, 1);
    AnimateUnionRoomPlayer(runtime, 1, players[1]);
    runtime.gObjectEvents[0].heldMovementFinished = true;
    AnimateUnionRoomPlayer(runtime, 1, players[1]);

    players[1].schedAnim = UNION_ROOM_SPAWN_OUT;
    AnimateUnionRoomPlayer(runtime, 1, players[1]);
    expect(players[1].state).toBe(3);
    expect(players[1].animState).toBe(1);
    expect(runtime.flags.has(FLAG_HIDE_UNION_ROOM_PLAYER_1 + 1)).toBe(true);
    expect(runtime.gObjectEvents[0].heldMovement).toBe(MOVEMENT_ACTION_FLY_UP);

    runtime.gObjectEvents[0].heldMovementFinished = true;
    AnimateUnionRoomPlayer(runtime, 1, players[1]);
    expect(players[1].state).toBe(0);
    expect(runtime.objectEventByLocalId.has(`${sUnionRoomLocalIds[1]}:1:2`)).toBe(false);
  });

  it('creates/destroys virtual sprites and clears group assembly impassability', () => {
    const runtime = createUnionRoomAvatarRuntime();
    const spriteIds: number[] = [];

    CreateUnionRoomPlayerSprites(runtime, spriteIds, 0);

    expect(spriteIds.slice(0, MAX_RFU_PLAYERS)).toEqual([-56, -55, -54, -53, -52]);
    expect(runtime.virtualObjects.get(-56)).toMatchObject({ gfxId: OBJ_EVENT_GFX_MAN, x: 4, y: 6, elevation: 3, direction: 1, invisible: true });

    runtime.sprites[-56] = { destroyed: false };
    for (let i = 0; i < 40; i += 1) runtime.sprites[spriteIds[i] ?? i] = { destroyed: false };
    DestroyUnionRoomPlayerSprites(runtime, Array.from({ length: 40 }, (_unused, i) => i));
    expect(runtime.sprites[0].destroyed).toBe(true);

    MakeGroupAssemblyAreasPassable(runtime);
    expect(runtime.metatileImpassability.get('11:13')).toBe(false);
    expect(runtime.metatileImpassability.get('12:13')).toBe(false);
  });

  it('AssembleGroup spawns visible members, faces them correctly, and skips occupied player tiles', () => {
    const runtime = createUnionRoomAvatarRuntime();
    CreateUnionRoomPlayerSprites(runtime, [], 0);
    const data = createRfuGameData();
    data.activity = ACTIVITY_CHAT | IN_UNION_ROOM;
    data.playerGender = FEMALE;
    data.compatibility.playerTrainerId[0] = 7;
    data.partnerInfo = [(1 << PINFO_GENDER_SHIFT) | 6, 0, 3, 0];
    runtime.playerDestCoords = GetUnionRoomPlayerCoords(0, 3);
    runtime.playerDriftCoords = { x: 0, y: 0 };

    AssembleGroup(runtime, 0, data);

    expect(runtime.virtualObjects.get(-56)).toMatchObject({ invisible: false, gfxId: OBJ_EVENT_GFX_BEAUTY, direction: DIR_SOUTH, spriteAnim: UNION_ROOM_SPAWN_IN });
    expect(runtime.virtualObjects.get(-55)).toMatchObject({ invisible: false, direction: 3 });
    expect(runtime.virtualObjects.get(-54)?.spriteAnim).toBe(UNION_ROOM_SPAWN_OUT);
    expect(runtime.virtualObjects.get(-53)?.invisible).toBe(true);
    expect(runtime.virtualObjects.get(-52)?.spriteAnim).toBe(UNION_ROOM_SPAWN_OUT);
    expect(runtime.metatileImpassability.get('11:13')).toBe(true);
    expect(runtime.metatileImpassability.get('12:13')).toBe(true);
    expect(runtime.metatileImpassability.get('10:13')).toBeUndefined();
  });

  it('scheduled refresh updates leaders once timer passes 300', () => {
    const runtime = createUnionRoomAvatarRuntime();
    InitUnionRoomPlayerObjects(runtime, makePlayers());
    for (let leader = 0; leader < MAX_UNION_ROOM_LEADERS; leader += 1) CreateUnionRoomPlayerSprites(runtime, [], leader);
    const list = makeList();
    list.players[0].groupScheduledAnim = UNION_ROOM_SPAWN_IN;
    list.players[0].rfu.data.compatibility.playerTrainerId[0] = 2;
    list.players[1].groupScheduledAnim = UNION_ROOM_SPAWN_OUT;
    const uroom: WirelessLinkURoom = { playerList: list };

    ScheduleUnionRoomPlayerRefresh(runtime);
    expect(runtime.sUnionObjRefreshTimer).toBe(300);
    HandleUnionRoomPlayerRefresh(runtime, uroom);

    expect(runtime.sUnionObjRefreshTimer).toBe(0);
    expect(runtime.sUnionObjWork![0].schedAnim).toBe(UNION_ROOM_SPAWN_IN);
    expect(runtime.sUnionObjWork![1].schedAnim).toBe(UNION_ROOM_SPAWN_OUT);
  });

  it('interaction requires still player, visible non-animating virtual object, and scheduled-in leader', () => {
    const runtime = createUnionRoomAvatarRuntime();
    CreateUnionRoomPlayerSprites(runtime, [], 0);
    const list = makeList();
    const member = { value: -1 };
    const leader = { value: -1 };
    runtime.playerFacingCoords = GetUnionRoomPlayerCoords(0, 1);
    runtime.playerFacingDirection = DIR_SOUTH;

    expect(TryInteractWithUnionRoomMember(runtime, list, member, leader)).toBe(false);

    list.players[0].groupScheduledAnim = UNION_ROOM_SPAWN_IN;
    runtime.virtualObjects.get(-55)!.invisible = false;
    runtime.virtualObjects.get(-55)!.animating = true;
    expect(TryInteractWithUnionRoomMember(runtime, list, member, leader)).toBe(false);

    runtime.virtualObjects.get(-55)!.animating = false;
    expect(TryInteractWithUnionRoomMember(runtime, list, member, leader)).toBe(true);
    expect(member.value).toBe(1);
    expect(leader.value).toBe(0);
    expect(runtime.virtualObjects.get(-55)?.direction).toBe(DIR_NORTH);
  });

  it('facing helper, leader/member schedulers, task loop, and destroy cleanup match C behavior', () => {
    const runtime = createUnionRoomAvatarRuntime();
    const players = makePlayers();
    InitUnionRoomPlayerObjects(runtime, players);
    for (let leader = 0; leader < MAX_UNION_ROOM_LEADERS; leader += 1) {
      CreateUnionRoomPlayerSprites(runtime, [], leader);
      runtime.flags.delete(FLAG_HIDE_UNION_ROOM_PLAYER_1 + leader);
      runtime.objectEventByLocalId.set(`${sUnionRoomLocalIds[leader]}:1:2`, leader);
      runtime.gObjectEvents[leader] = { localId: sUnionRoomLocalIds[leader], movementOverridden: false, heldMovement: null, heldMovementFinished: true, frozen: false };
    }
    const list = makeList();
    list.players[0].rfu.data.activity = ACTIVITY_CHAT | IN_UNION_ROOM;
    list.players[0].rfu.data.partnerInfo = [0, 0, 0, 0];

    expect(GetNewFacingDirectionForUnionRoomPlayer(0, list.players[0].rfu.data)).toBe(DIR_SOUTH);
    list.players[0].rfu.data.activity = ACTIVITY_BATTLE_SINGLE | IN_UNION_ROOM;
    expect(GetNewFacingDirectionForUnionRoomPlayer(0, list.players[0].rfu.data)).toBe(DIR_EAST);
    expect(GetNewFacingDirectionForUnionRoomPlayer(4, list.players[0].rfu.data)).toBe(DIR_NORTH);

    UpdateUnionRoomMemberFacing(runtime, 0, 0, list);
    expect(runtime.virtualObjects.get(-56)?.direction).toBe(DIR_EAST);

    SpawnGroupLeaderAndMembers(runtime, 0, list.players[0].rfu.data);
    expect(players[0].schedAnim).toBe(UNION_ROOM_SPAWN_OUT);
    DespawnGroupLeaderAndMembers(runtime, 0);
    expect(players[0].schedAnim).toBe(UNION_ROOM_SPAWN_OUT);

    players[2].schedAnim = UNION_ROOM_SPAWN_IN;
    Task_AnimateUnionRoomPlayers(runtime);
    expect(players[2].schedAnim).toBe(UNION_ROOM_SPAWN_NONE);

    DestroyUnionRoomPlayerObjects(runtime);
    expect(runtime.sUnionObjWork).toBeNull();
    expect(runtime.tasks[0].destroyed).toBe(true);
    for (let i = 0; i < MAX_UNION_ROOM_LEADERS; i += 1) {
      expect(runtime.flags.has(FLAG_HIDE_UNION_ROOM_PLAYER_1 + i)).toBe(true);
    }
  });
});
