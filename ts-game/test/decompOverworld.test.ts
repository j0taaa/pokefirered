import { describe, expect, test } from 'vitest';
import {
  AreAllPlayersInLinkState,
  BGMusicStopped,
  CB2_ContinueSavedGame,
  CB2_LoadMap,
  CB2_ReturnToFieldContinueScriptPlayMapMusic,
  CheckRfuKeepAliveTimer,
  ClearFieldCallback,
  ClearLinkPlayerObjectEvents,
  CountBadgesForOverworldWhiteOutLossCalculation,
  DIR_EAST,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_WEST,
  DoWhiteOut,
  FieldClearVBlankHBlankCallbacks,
  GetInitialPlayerAvatarState,
  GetCableClubPartnersReady,
  GetCurrentMapBattleScene,
  GetCurrentMapType,
  GetCurrentRegionMapSectionId,
  GetDirectionForDpadKey,
  GetGameStat,
  GetLinkPlayerCoords,
  GetLinkPlayerFacingDirection,
  GetLinkPlayerIdAt,
  GetMapConnection,
  GetMapLayout,
  GetMapMusicFadeoutSpeed,
  GetSpriteForLinkedPlayer,
  IsMapTypeIndoors,
  IsMapTypeOutdoors,
  KeyInterCB_DoNothingAndKeepAlive,
  KeyInterCB_Ready,
  LinkPlayerDetectCollision,
  MAP_TYPE_INDOOR,
  MAP_TYPE_ROUTE,
  MAP_TYPE_SECRET_BASE,
  MAP_TYPE_TOWN,
  MAP_TYPE_UNDERWATER,
  MOVEMENT_MODE_FREE,
  MOVEMENT_MODE_FROZEN,
  MOVEMENT_MODE_SCRIPTED,
  MovementEventModeCB_Normal,
  Overworld_ClearSavedMusic,
  Overworld_ChangeMusicTo,
  Overworld_ChangeMusicToDefault,
  Overworld_FadeOutMapMusic,
  Overworld_GetFlashLevel,
  Overworld_IsBikingAllowed,
  Overworld_MapTypeAllowsTeleportAndFly,
  Overworld_PlaySpecialMapMusic,
  Overworld_ResetMapMusic,
  Overworld_ResetStateAfterFly,
  Overworld_SetSavedMusic,
  PLAYER_AVATAR_FLAG_ON_FOOT,
  PLAYER_AVATAR_FLAG_SURFING,
  PLAYER_AVATAR_FLAG_UNDERWATER,
  PLAYER_LINK_STATE_IDLE,
  PLAYER_LINK_STATE_BUSY,
  PLAYER_LINK_STATE_READY,
  ResetAllMultiplayerState,
  ResetGameStats,
  ResetInitialPlayerAvatarState,
  RunFieldCallback,
  SetContinueGameWarp,
  SetDiveWarpDive,
  SetDynamicWarpWithCoords,
  SetEscapeWarp,
  SetFieldVBlankCallback,
  SetFixedDiveWarp,
  SetFixedHoleWarp,
  SetFlashLevel,
  SetGameStat,
  SetInitialPlayerAvatarStateWithDirection,
  SetInCableClubSeat,
  SetKeyInterceptCallback,
  SetLastHealLocationWarp,
  SetMainCallback1,
  SetPlayerFacingDirection,
  SetWarpDestination,
  SetWarpDestinationToContinueGameWarp,
  SetWarpDestinationToDynamicWarp,
  SetWarpDestinationToEscapeWarp,
  SetWarpDestinationToFixedHoleWarp,
  SetWarpDestinationToLastHealLocation,
  SpawnLinkPlayerObjectEvent,
  StoreInitialPlayerAvatarState,
  TryGetTileEventScript,
  TryInteractWithPlayer,
  UpdateHeldKeyCode,
  WarpIntoMap,
  createOverworldRuntime,
  type LinkPlayerObjectEvent
} from '../src/game/decompOverworld';

describe('decompOverworld', () => {
  test('exact C-name overworld helpers expose map layout, initial avatar state, and link scripts', () => {
    const layout0 = { id: 'layout0' };
    const layout1 = { id: 'layout1' };
    const runtime = createOverworldRuntime({
      mapLayoutId: 2,
      mapLayouts: [layout0, layout1],
      mapHeader: {
        mapGroup: 0,
        mapNum: 0,
        mapType: MAP_TYPE_UNDERWATER,
        music: 0,
        regionMapSectionId: 0,
        battleScene: 0,
        bikingAllowed: true,
        cave: false,
        layoutWidth: 10,
        layoutHeight: 10,
        warps: []
      },
      initialPlayerAvatarState: { transitionFlags: PLAYER_AVATAR_FLAG_SURFING, direction: DIR_EAST, hasDirectionSet: true },
      coordEventScripts: new Map([['3,4,0', 'CoordScript']]),
      interactedLinkPlayerScripts: new Map([['4,4,0', 'FallbackInteractScript']]),
      seenLinkPlayerCardMsgs: new Set([1])
    });

    expect(GetMapLayout(runtime)).toBe(layout1);
    runtime.mapLayoutId = 0;
    expect(GetMapLayout(runtime)).toBeNull();

    const avatarState = GetInitialPlayerAvatarState(runtime);
    expect(avatarState).toBe(runtime.initialPlayerAvatarState);
    expect(avatarState).toEqual({ transitionFlags: PLAYER_AVATAR_FLAG_UNDERWATER, direction: DIR_EAST, hasDirectionSet: false });

    const player = { movementMode: MOVEMENT_MODE_SCRIPTED, pos: { x: 3, y: 4, elevation: 0 }, metatileBehavior: 0, facing: DIR_EAST, isLocalPlayer: true };
    expect(TryGetTileEventScript(player, runtime)).toBe('CoordScript');
    player.movementMode = MOVEMENT_MODE_FROZEN;
    expect(TryGetTileEventScript(player, runtime)).toBeNull();
    expect(TryInteractWithPlayer(player, runtime)).toBeNull();

    player.movementMode = MOVEMENT_MODE_FREE;
    expect(TryInteractWithPlayer(player, runtime)).toBe('FallbackInteractScript');

    SpawnLinkPlayerObjectEvent(1, 4, 4, 0, runtime);
    runtime.linkStates[1] = PLAYER_LINK_STATE_BUSY;
    expect(TryInteractWithPlayer(player, runtime)).toBe('CableClub_EventScript_TooBusyToNotice');
    runtime.linkStates[1] = PLAYER_LINK_STATE_IDLE;
    expect(TryInteractWithPlayer(player, runtime)).toBe('CableClub_EventScript_ReadTrainerCardColored');
    runtime.seenLinkPlayerCardMsgs!.delete(1);
    expect(TryInteractWithPlayer(player, runtime)).toBe('CableClub_EventScript_ReadTrainerCard');
    player.isLocalPlayer = false;
    expect(TryInteractWithPlayer(player, runtime)).toBe('CableClub_EventScript_TooBusyToNotice');
  });

  test('whiteout and encrypted game stats follow the overworld save-state rules', () => {
    const runtime = createOverworldRuntime({
      money: 5000,
      partyHighestLevel: 10,
      badges: [true, true, false, false, false, false, false, false],
      lastHealLocation: { mapGroup: 7, mapNum: 8, warpId: -1, x: 12, y: 13 }
    });

    expect(CountBadgesForOverworldWhiteOutLossCalculation(runtime)).toBe(2);
    DoWhiteOut(runtime);
    expect(runtime.money).toBe(4760);
    expect(runtime.location).toEqual({ mapGroup: 7, mapNum: 8, warpId: -1, x: 12, y: 13 });
    expect(runtime.pos).toEqual({ x: 12, y: 13 });
    expect(runtime.operations).toContain('HealPlayerParty');

    ResetGameStats(runtime);
    SetGameStat(3, 41, runtime);
    expect(GetGameStat(3, runtime)).toBe(41);
    runtime.encryptionKey = 0x1111;
    SetGameStat(3, 44, runtime);
    expect(GetGameStat(3, runtime)).toBe(44);
  });

  test('GetMapConnection scans exactly count entries and returns null for missing connection tables', () => {
    const runtime = createOverworldRuntime();
    expect(GetMapConnection(DIR_NORTH, runtime)).toBeNull();

    const north = { direction: DIR_NORTH, offset: -3, mapGroup: 4, mapNum: 5 };
    const east = { direction: DIR_EAST, offset: 7, mapGroup: 6, mapNum: 8 };
    runtime.mapHeader.connections = { count: 1, connections: [north, east] };
    expect(GetMapConnection(DIR_NORTH, runtime)).toBe(north);
    expect(GetMapConnection(DIR_EAST, runtime)).toBeNull();

    runtime.mapHeader.connections.count = 2;
    expect(GetMapConnection(DIR_EAST, runtime)).toBe(east);

    runtime.mapHeader.connections.connections = null;
    expect(GetMapConnection(DIR_NORTH, runtime)).toBeNull();
  });

  test('warp helpers copy the same warp slots used by map transitions', () => {
    const runtime = createOverworldRuntime();

    SetWarpDestination(2, 3, -1, 9, 10, runtime);
    WarpIntoMap(runtime);
    expect(runtime.location).toEqual({ mapGroup: 2, mapNum: 3, warpId: -1, x: 9, y: 10 });
    expect(runtime.pos).toEqual({ x: 9, y: 10 });

    SetDynamicWarpWithCoords(0, 4, 5, 6, 7, 8, runtime);
    SetWarpDestinationToDynamicWarp(0, runtime);
    expect(runtime.warpDestination).toEqual({ mapGroup: 4, mapNum: 5, warpId: 6, x: 7, y: 8 });

    SetEscapeWarp(6, 7, -1, 2, 3, runtime);
    SetWarpDestinationToEscapeWarp(runtime);
    expect(runtime.warpDestination).toEqual({ mapGroup: 6, mapNum: 7, warpId: -1, x: 2, y: 3 });

    SetContinueGameWarp(8, 9, -1, 4, 5, runtime);
    SetWarpDestinationToContinueGameWarp(runtime);
    expect(runtime.warpDestination).toEqual({ mapGroup: 8, mapNum: 9, warpId: -1, x: 4, y: 5 });

    SetFixedHoleWarp(10, 11, 12, 1, 1, runtime);
    SetWarpDestinationToFixedHoleWarp(20, 21, runtime);
    expect(runtime.warpDestination).toEqual({ mapGroup: 10, mapNum: 11, warpId: -1, x: 20, y: 21 });

    SetFixedDiveWarp(12, 13, 14, 1, 1, runtime);
    expect(SetDiveWarpDive(30, 31, runtime)).toBe(true);
    expect(runtime.warpDestination).toEqual({ mapGroup: 12, mapNum: 13, warpId: -1, x: 30, y: 31 });

    SetLastHealLocationWarp(0, runtime);
    SetWarpDestinationToLastHealLocation(runtime);
    expect(runtime.warpDestination).toEqual(runtime.lastHealLocation);
  });

  test('map type, avatar, flash, and music state use the C-facing flags', () => {
    const runtime = createOverworldRuntime({
      mapHeader: {
        mapGroup: 1,
        mapNum: 2,
        mapType: MAP_TYPE_ROUTE,
        music: 321,
        regionMapSectionId: 44,
        battleScene: 5,
        bikingAllowed: false,
        cave: true,
        layoutWidth: 20,
        layoutHeight: 20,
        warps: []
      },
      location: { mapGroup: 1, mapNum: 2, warpId: -1, x: 3, y: 4 }
    });

    expect(IsMapTypeOutdoors(MAP_TYPE_TOWN)).toBe(true);
    expect(IsMapTypeIndoors(MAP_TYPE_INDOOR)).toBe(true);
    expect(IsMapTypeIndoors(MAP_TYPE_SECRET_BASE)).toBe(true);
    expect(Overworld_MapTypeAllowsTeleportAndFly(MAP_TYPE_UNDERWATER)).toBe(false);
    expect(GetCurrentMapType(runtime)).toBe(MAP_TYPE_ROUTE);
    expect(GetCurrentRegionMapSectionId(runtime)).toBe(44);
    expect(GetCurrentMapBattleScene(runtime)).toBe(5);
    expect(Overworld_IsBikingAllowed(runtime)).toBe(false);

    SetFlashLevel(9, runtime);
    expect(Overworld_GetFlashLevel(runtime)).toBe(0);
    SetFlashLevel(6, runtime);
    expect(Overworld_GetFlashLevel(runtime)).toBe(6);

    ResetInitialPlayerAvatarState(runtime);
    expect(runtime.initialPlayerAvatarState.transitionFlags).toBe(PLAYER_AVATAR_FLAG_ON_FOOT);
    SetInitialPlayerAvatarStateWithDirection(DIR_EAST, runtime);
    expect(runtime.initialPlayerAvatarState.direction).toBe(DIR_EAST);
    runtime.playerAvatarFlags = PLAYER_AVATAR_FLAG_SURFING;
    runtime.playerFacingDirection = DIR_NORTH;
    StoreInitialPlayerAvatarState(runtime);
    expect(runtime.initialPlayerAvatarState.transitionFlags).toBe(PLAYER_AVATAR_FLAG_SURFING);
    expect(runtime.initialPlayerAvatarState.direction).toBe(DIR_NORTH);

    Overworld_SetSavedMusic(777, runtime);
    Overworld_PlaySpecialMapMusic(runtime);
    expect(runtime.currentMusic).toBe(777);
    Overworld_ClearSavedMusic(runtime);
    Overworld_ChangeMusicToDefault(runtime);
    expect(runtime.currentMusic).toBe(321);
    Overworld_ChangeMusicTo(888, runtime);
    expect(runtime.currentMusic).toBe(888);
    expect(GetMapMusicFadeoutSpeed(runtime)).toBe(4);
    Overworld_ResetMapMusic(runtime);
    expect(BGMusicStopped(runtime)).toBe(true);
    Overworld_FadeOutMapMusic(runtime);
    expect(runtime.currentMusic).toBe(0);
    expect(PLAYER_AVATAR_FLAG_UNDERWATER).toBe(16);
  });

  test('callbacks and map-load state machines execute the same staged overworld hooks', () => {
    let callbackCount = 0;
    const runtime = createOverworldRuntime({
      fieldCallback: () => { callbackCount++; },
      fieldCallbackName: 'FieldCB_ShowMapNameOnContinue',
      savedMusic: 555
    });

    SetMainCallback1('CB1_UpdateLinkState', runtime);
    RunFieldCallback(runtime);
    expect(callbackCount).toBe(1);
    expect(runtime.operations).toContain('FieldCB_ShowMapNameOnContinue');

    ClearFieldCallback(runtime);
    RunFieldCallback(runtime);
    expect(callbackCount).toBe(1);

    FieldClearVBlankHBlankCallbacks(runtime);
    expect(runtime.vblankCallback).toBeNull();
    SetFieldVBlankCallback(runtime);
    expect(runtime.vblankCallback).toBe('VBlankCB_Field');

    CB2_LoadMap(runtime);
    expect(runtime.operations).toContain('LoadMapFromWarp');
    CB2_ReturnToFieldContinueScriptPlayMapMusic(runtime);
    expect(runtime.currentMusic).toBe(100);
    expect(runtime.operations).toContain('ScriptContext_Enable');

    SetContinueGameWarp(14, 15, -1, 6, 7, runtime);
    CB2_ContinueSavedGame(runtime);
    expect(runtime.location).toEqual({ mapGroup: 14, mapNum: 15, warpId: -1, x: 6, y: 7 });
    Overworld_ResetStateAfterFly(runtime);
    expect(runtime.initialPlayerAvatarState.direction).toBe(DIR_SOUTH);
  });

  test('link-state and link-object helpers preserve multiplayer object bookkeeping', () => {
    const runtime = createOverworldRuntime({ fieldLinkPlayerCount: 2 });

    ResetAllMultiplayerState(runtime);
    expect(runtime.linkStates.slice(0, 2)).toEqual([PLAYER_LINK_STATE_IDLE, PLAYER_LINK_STATE_IDLE]);
    SetKeyInterceptCallback('KeyInterCB_Ready', runtime);
    expect(runtime.keyInterceptCallback).toBe('KeyInterCB_Ready');
    KeyInterCB_Ready(0, runtime);
    KeyInterCB_Ready(1, runtime);
    expect(AreAllPlayersInLinkState(PLAYER_LINK_STATE_READY, runtime)).toBe(true);
    expect(GetCableClubPartnersReady(runtime)).toBe(true);

    runtime.linkKeys[0] = 0x10;
    UpdateHeldKeyCode(runtime.linkKeys[0], runtime);
    expect(runtime.heldKeyCodeToSend).toBe(0x10);
    expect(GetDirectionForDpadKey(0x10)).toBe(DIR_EAST);
    expect(GetDirectionForDpadKey(0x20)).toBe(DIR_WEST);

    SetInCableClubSeat(1, runtime);
    expect(runtime.cableClubSeats.has(1)).toBe(true);
    expect(CheckRfuKeepAliveTimer(runtime)).toBe(false);
    KeyInterCB_DoNothingAndKeepAlive(0, runtime);
    expect(runtime.rfuKeepAliveTimer).toBe(2);

    SpawnLinkPlayerObjectEvent(0, 5, 6, 0, runtime);
    SpawnLinkPlayerObjectEvent(1, 7, 8, 0, runtime);
    SetPlayerFacingDirection(0, DIR_NORTH, runtime);
    expect(GetLinkPlayerCoords(0, runtime)).toEqual([5, 6]);
    expect(GetLinkPlayerFacingDirection(0, runtime)).toBe(DIR_NORTH);
    expect(GetLinkPlayerIdAt(7, 8, runtime)).toBe(1);
    expect(LinkPlayerDetectCollision(0, 0, 7, 8, runtime)).toBe(1);

    const linkPlayer = runtime.linkPlayerObjectEvents[0] as LinkPlayerObjectEvent;
    MovementEventModeCB_Normal(linkPlayer, {}, DIR_EAST);
    expect(linkPlayer.facing).toBe(DIR_EAST);
    expect(linkPlayer.stepTimer).toBe(1);
    expect(GetSpriteForLinkedPlayer(0, runtime)).toBe(0);

    ClearLinkPlayerObjectEvents(runtime);
    expect(GetLinkPlayerIdAt(5, 6, runtime)).toBe(0xff);
  });
});
