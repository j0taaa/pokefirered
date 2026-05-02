import { describe, expect, test } from 'vitest';
import {
  DIR_EAST,
  DIR_WEST,
  DoCableClubWarp,
  DoDiveWarp,
  DoDoorWarp,
  DoEscalatorWarp,
  DoFallWarp,
  DoLavaridgeGym1FWarp,
  DoLavaridgeGymB1FWarp,
  DoStairWarp,
  DoTeleport2Warp,
  DoTeleportWarp,
  DoUnionRoomWarp,
  DoWarp,
  FADE_FROM_BLACK,
  FADE_FROM_WHITE,
  FADE_TO_BLACK,
  FADE_TO_WHITE,
  FadeTransition_FadeInOnReturnToStartMenu,
  FieldCB_ContinueScript,
  FieldCB_ContinueScriptHandleMusic,
  FieldCB_ContinueScriptUnionRoom,
  FieldCB_DefaultWarpExit,
  FieldCB_ReturnToFieldCableLink,
  FieldCB_ReturnToFieldOpenStartMenu,
  FieldCB_ReturnToFieldWirelessLink,
  FieldCB_SafariZoneRanOutOfBalls,
  FieldCB_WarpExitFadeFromBlack,
  FieldFadeTransitionBackgroundEffectIsFinished,
  FuncIsActiveTask,
  MAP_TYPE_ROUTE,
  MAP_TYPE_TOWN,
  MAP_TYPE_UNDERGROUND,
  MOVEMENT_ACTION_WALK_NORMAL_UP,
  ReturnFromLinkRoom,
  RunTask,
  SetUpWarpExitTask,
  Task_ExitStairs,
  Task_StartMenuHandleInput,
  Task_Teleport2Warp,
  WarpFadeInScreen,
  WarpFadeOutScreen,
  createFieldFadeTransitionRuntime
} from '../src/game/decompFieldFadeTransition';
import { RGB_BLACK, RGB_WHITE } from '../src/game/decompPalette';

describe('decomp field_fadetransition.c parity', () => {
  test('warp fade-in fills black for normal transitions and white for underground exits', () => {
    const normal = createFieldFadeTransitionRuntime();
    WarpFadeInScreen(normal);
    expect(normal.gPlttBufferFaded[0]).toBe(RGB_BLACK);
    expect(normal.operations).toContain(`FadeScreen:${FADE_FROM_BLACK}:0`);

    const exiting = createFieldFadeTransitionRuntime({
      lastUsedWarpMapType: MAP_TYPE_UNDERGROUND,
      currentMapType: MAP_TYPE_ROUTE
    });
    WarpFadeInScreen(exiting);
    expect(exiting.gPlttBufferFaded[0]).toBe(RGB_WHITE);
    expect(exiting.operations).toContain(`FadeScreen:${FADE_FROM_WHITE}:0`);
  });

  test('warp fade-out chooses preview black before map-type white enter fades', () => {
    const preview = createFieldFadeTransitionRuntime({
      gMapHeader: { mapType: MAP_TYPE_TOWN, regionMapSectionId: 1 },
      currentMapType: MAP_TYPE_TOWN,
      destinationWarpMapHeader: { mapType: MAP_TYPE_UNDERGROUND, regionMapSectionId: 2 },
      mapPreviewSections: new Set([2])
    });
    WarpFadeOutScreen(preview);
    expect(preview.operations).toContain(`FadeScreen:${FADE_TO_BLACK}:0`);

    const cave = createFieldFadeTransitionRuntime({
      currentMapType: MAP_TYPE_ROUTE,
      destinationWarpMapHeader: { mapType: MAP_TYPE_UNDERGROUND, regionMapSectionId: 1 }
    });
    WarpFadeOutScreen(cave);
    expect(cave.operations).toContain(`FadeScreen:${FADE_TO_WHITE}:0`);
  });

  test('continue-script callbacks lock controls, fade in, and enable script only after background effect finishes', () => {
    const runtime = createFieldFadeTransitionRuntime({ weatherNotFadingIn: false });
    FieldCB_ContinueScript(runtime);
    expect(runtime.playerFieldControlsLocked).toBe(1);
    expect(runtime.tasks[0].isActive).toBe(true);

    RunTask(runtime, 0);
    expect(runtime.operations).not.toContain('ScriptContext_Enable');
    runtime.weatherNotFadingIn = true;
    RunTask(runtime, 0);
    expect(runtime.operations).toContain('ScriptContext_Enable');
    expect(runtime.tasks[0].isActive).toBe(false);

    const withMusic = createFieldFadeTransitionRuntime();
    FieldCB_ContinueScriptHandleMusic(withMusic);
    expect(withMusic.operations).toContain('Overworld_PlaySpecialMapMusic');

    const unionRoom = createFieldFadeTransitionRuntime();
    FieldCB_ContinueScriptUnionRoom(unionRoom);
    RunTask(unionRoom, 0);
    expect(unionRoom.operations).not.toContain('ScriptContext_Enable');
    expect(unionRoom.tasks[0].isActive).toBe(false);
  });

  test('return-to-field cable and wireless tasks mirror their three-step link wait flows', () => {
    const cable = createFieldFadeTransitionRuntime({ reestablishCableClubLinkDuration: 0 });
    FieldCB_ReturnToFieldCableLink(cable);
    RunTask(cable, 0);
    RunTask(cable, 1);
    RunTask(cable, 0);
    expect(cable.operations).toContain(`FadeScreen:${FADE_FROM_BLACK}:0`);
    RunTask(cable, 0);
    expect(cable.playerFieldControlsLocked).toBe(0);
    expect(cable.tasks[0].isActive).toBe(false);

    const wireless = createFieldFadeTransitionRuntime({ linkTaskFinished: false });
    FieldCB_ReturnToFieldWirelessLink(wireless);
    RunTask(wireless, 0);
    expect(wireless.operations).not.toContain('SetLinkStandbyCallback');
    wireless.linkTaskFinished = true;
    RunTask(wireless, 0);
    expect(wireless.operations).toContain('SetLinkStandbyCallback');
    RunTask(wireless, 0);
    RunTask(wireless, 0);
    expect(wireless.operations).toContain('StartSendingKeysToLink');
  });

  test('SetUpWarpExitTask selects door, non-anim door, stair, and non-door callbacks exactly by metatile behavior', () => {
    const door = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 1 });
    SetUpWarpExitTask(door, false);
    expect(door.tasks[0].func.name).toBe('Task_ExitDoor');

    const nonAnim = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 2 });
    SetUpWarpExitTask(nonAnim, false);
    expect(nonAnim.tasks[0].func.name).toBe('Task_ExitNonAnimDoor');

    const stair = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 3 });
    SetUpWarpExitTask(stair, false);
    expect(stair.tasks[0].func.name).toBe('Task_ExitStairs');

    const disabledStair = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 3, gExitStairsMovementDisabled: true });
    SetUpWarpExitTask(disabledStair, false);
    expect(disabledStair.tasks[0].func.name).toBe('Task_ExitNonDoor');
    expect(disabledStair.gExitStairsMovementDisabled).toBe(false);
  });

  test('default and fade-from-black warp exit callbacks keep the original music/header/control ordering', () => {
    const runtime = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 0 });
    FieldCB_DefaultWarpExit(runtime);
    expect(runtime.operations.slice(0, 2)).toEqual([
      'Overworld_PlaySpecialMapMusic',
      'QuestLog_DrawPreviouslyOnQuestHeaderIfInPlaybackMode'
    ]);
    expect(runtime.tasks[0].func.name).toBe('Task_ExitNonDoor');
    expect(runtime.playerFieldControlsLocked).toBe(1);

    const fadeBlack = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 0 });
    FieldCB_WarpExitFadeFromBlack(fadeBlack);
    expect(fadeBlack.operations).toContain(`FadeScreen:${FADE_FROM_BLACK}:0`);
  });

  test('door warp walks player through door, hides them, then switches to Teleport2Warp state', () => {
    const runtime = createFieldFadeTransitionRuntime({
      playerDestCoords: { x: 8, y: 9 },
      nextDoorTaskResult: -1
    });
    DoDoorWarp(runtime);
    RunTask(runtime, 0);
    expect(runtime.operations).toContain('FieldAnimateDoorOpen:8:8');
    RunTask(runtime, 0);
    expect(runtime.objectEvents[0].heldMovement).toBe(MOVEMENT_ACTION_WALK_NORMAL_UP);
    RunTask(runtime, 0);
    expect(runtime.playerInvisible).toBe(true);
    RunTask(runtime, 0);
    RunTask(runtime, 0);
    expect(runtime.tasks[0].func.name).toBe('Task_Teleport2Warp');
    expect(runtime.tasks[0].data[0]).toBe(0);
  });

  test('Teleport2, teleport warp, cable-club, and link-room tasks wait for fades/music before loading maps', () => {
    const teleport2 = createFieldFadeTransitionRuntime({ bgMusicStopped: false, gPaletteFade: { active: true } });
    DoTeleport2Warp(teleport2);
    RunTask(teleport2, 0);
    RunTask(teleport2, 0);
    expect(teleport2.tasks[0].data[0]).toBe(1);
    teleport2.gPaletteFade.active = false;
    teleport2.bgMusicStopped = true;
    RunTask(teleport2, 0);
    RunTask(teleport2, 0);
    expect(teleport2.mainCallback2).toBe('CB2_LoadMap');

    const teleport = createFieldFadeTransitionRuntime({ teleportWarpOutAnimWaiting: false });
    DoTeleportWarp(teleport);
    RunTask(teleport, 0);
    expect(teleport.operations).toContain('StartTeleportWarpOutPlayerAnim');
    RunTask(teleport, 0);
    expect(teleport.operations.some((op) => op.startsWith('FadeScreen:'))).toBe(true);

    const cable = createFieldFadeTransitionRuntime();
    DoCableClubWarp(cable);
    RunTask(cable, 0);
    cable.gPaletteFade.active = false;
    RunTask(cable, 0);
    RunTask(cable, 0);
    expect(cable.mainCallback2).toBe('CB2_ReturnToFieldCableClub');

    const link = createFieldFadeTransitionRuntime({ receivedRemoteLinkPlayers: true });
    ReturnFromLinkRoom(link);
    RunTask(link, 0);
    link.gPaletteFade.active = false;
    RunTask(link, 0);
    RunTask(link, 0);
    expect(link.mainCallback2).toBeNull();
    link.receivedRemoteLinkPlayers = false;
    RunTask(link, 0);
    expect(link.mainCallback2).toBe('CB2_LoadMap');
  });

  test('stair warp uses the same directional speeds, priority change, and subpixel offsets', () => {
    const runtime = createFieldFadeTransitionRuntime({ gPaletteFade: { active: false } });
    DoStairWarp(runtime, 3, 0);
    const task = runtime.tasks[0];
    expect(task.data[0]).toBe(1);
    RunTask(runtime, 0);
    expect(runtime.sprites[0].oam.priority).toBe(1);
    expect(task.data[2]).toBe(16);
    expect(task.data[3]).toBe(-10);
    RunTask(runtime, 0);
    expect(runtime.sprites[0].x2).toBe(0);
    expect(runtime.sprites[0].y2).toBe(0);
    task.data[15] = 11;
    RunTask(runtime, 0);
    expect(runtime.operations).toContain(`FadeScreen:${FADE_TO_BLACK}:0`);
  });

  test('exit-stairs movement starts from the opposite offset and counts down to zero', () => {
    const runtime = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 3 });
    const taskId = 0;
    runtime.tasks[taskId] = {
      id: taskId,
      func: Task_ExitStairs,
      priority: 10,
      data: Array(16).fill(0),
      isActive: true
    };
    RunTask(runtime, taskId);
    expect(runtime.objectEvents[0].heldMovement).toBe(`GetWalkInPlaceFastMovementAction:${DIR_WEST}`);
    expect(runtime.tasks[taskId].data.slice(1, 6)).toEqual([-16, 10, 256, -160, 16]);
    expect(runtime.sprites[0].x2).toBe(8);
    expect(runtime.sprites[0].y2).toBe(-5);
    for (let i = 0; i < 16; i++) {
      RunTask(runtime, taskId);
    }
    RunTask(runtime, taskId);
    expect(runtime.sprites[0].x2).toBe(0);
    expect(runtime.sprites[0].y2).toBe(0);
    RunTask(runtime, taskId);
    expect(runtime.tasks[taskId].isActive).toBe(false);

    const left = createFieldFadeTransitionRuntime({ metatileBehaviorAtDest: 4 });
    left.tasks[0] = { id: 0, func: Task_ExitStairs, priority: 10, data: Array(16).fill(0), isActive: true };
    RunTask(left, 0);
    expect(left.objectEvents[0].heldMovement).toBe(`GetWalkInPlaceFastMovementAction:${DIR_EAST}`);
  });

  test('public warp entrypoints set callbacks and external starts without eliding side effects', () => {
    const warp = createFieldFadeTransitionRuntime();
    DoWarp(warp);
    expect(warp.fieldCallback).toBe('FieldCB_DefaultWarpExit');
    expect(warp.operations).toContain('PlaySE:9');
    expect(warp.tasks[0].func).toBe(Task_Teleport2Warp);

    const dive = createFieldFadeTransitionRuntime();
    DoDiveWarp(dive);
    expect(dive.operations).not.toContain('PlaySE:9');

    const fall = createFieldFadeTransitionRuntime();
    DoFallWarp(fall);
    expect(fall.fieldCallback).toBe('FieldCB_FallWarpExit');

    const unionRoom = createFieldFadeTransitionRuntime();
    DoUnionRoomWarp(unionRoom);
    expect(unionRoom.fieldCallback).toBe('FieldCB_DefaultWarpExit');

    const escalator = createFieldFadeTransitionRuntime();
    DoEscalatorWarp(escalator, 77);
    expect(escalator.operations).toContain('StartEscalatorWarp:77:10');

    const b1 = createFieldFadeTransitionRuntime();
    DoLavaridgeGymB1FWarp(b1);
    expect(b1.operations).toContain('StartLavaridgeGymB1FWarp:10');

    const oneF = createFieldFadeTransitionRuntime();
    DoLavaridgeGym1FWarp(oneF);
    expect(oneF.operations).toContain('StartLavaridgeGym1FWarp:10');
  });

  test('start-menu, safari, field-open-menu, and background-finish helpers match simple C return paths', () => {
    const startMenu = createFieldFadeTransitionRuntime();
    FieldCB_ReturnToFieldOpenStartMenu(startMenu);
    expect(startMenu.operations).toContain('SetUpReturnToStartMenu');

    const safari = createFieldFadeTransitionRuntime();
    FieldCB_SafariZoneRanOutOfBalls(safari);
    RunTask(safari, 0);
    expect(safari.playerFieldControlsLocked).toBe(0);
    expect(safari.objectEventsFrozen).toBe(false);

    expect(FieldFadeTransitionBackgroundEffectIsFinished(createFieldFadeTransitionRuntime())).toBe(true);
    expect(FieldFadeTransitionBackgroundEffectIsFinished(createFieldFadeTransitionRuntime({ weatherNotFadingIn: false }))).toBe(false);

    const fadeMenu = createFieldFadeTransitionRuntime();
    FadeTransition_FadeInOnReturnToStartMenu(fadeMenu);
    RunTask(fadeMenu, 0);
    expect(FuncIsActiveTask(fadeMenu, Task_StartMenuHandleInput)).toBe(true);
  });
});
