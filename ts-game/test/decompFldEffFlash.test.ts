import { describe, expect, test } from 'vitest';
import {
  CB2_ChangeMapMain,
  CB2_DoChangeMap,
  EVENT_SCRIPT_FLD_EFF_FLASH,
  FLAG_SYS_FLASH_ACTIVE,
  FieldCallback_Flash,
  FlashTransition_Enter,
  FlashTransition_Exit,
  FldEff_UseFlash,
  MAP_TYPE_INDOOR,
  MAP_TYPE_ROUTE,
  MAP_TYPE_TOWN,
  MAP_TYPE_UNDERGROUND,
  MapTransitionIsEnter,
  MapTransitionIsExit,
  RunMapPreviewScreen,
  SE_M_REFLECT,
  SetUpFieldMove_Flash,
  Task_FlashTransition_Enter_0,
  Task_FlashTransition_Enter_1,
  Task_FlashTransition_Enter_2,
  Task_FlashTransition_Enter_3,
  Task_FlashTransition_Exit_0,
  Task_FlashTransition_Exit_1,
  Task_FlashTransition_Exit_2,
  Task_FlashTransition_Exit_3,
  Task_FlashTransition_Exit_4,
  Task_MapPreviewScreen_0,
  TryDoMapTransition,
  VBC_ChangeMapVBlank,
  cb2DoChangeMap,
  cb2ChangeMapMain,
  createFldEffFlashRuntime,
  fieldCallbackFlash,
  flashTransitionEnter,
  flashTransitionExit,
  fldEffUseFlash,
  mapTransitionIsEnter,
  mapTransitionIsExit,
  runMapPreviewScreen,
  setUpFieldMoveFlash,
  stepFldEffFlashTask,
  taskFlashTransitionEnter0,
  taskFlashTransitionEnter1,
  taskFlashTransitionEnter2,
  taskFlashTransitionEnter3,
  taskFlashTransitionExit0,
  taskFlashTransitionExit1,
  taskFlashTransitionExit2,
  taskFlashTransitionExit3,
  taskFlashTransitionExit4,
  taskMapPreviewScreen0,
  tryDoMapTransition,
  vbcChangeMapVBlank
} from '../src/game/decompFldEffFlash';

describe('decomp fldeff_flash', () => {
  test('exports exact C names as aliases of the implemented Flash logic', () => {
    expect(SetUpFieldMove_Flash).toBe(setUpFieldMoveFlash);
    expect(FieldCallback_Flash).toBe(fieldCallbackFlash);
    expect(FldEff_UseFlash).toBe(fldEffUseFlash);
    expect(CB2_ChangeMapMain).toBe(cb2ChangeMapMain);
    expect(VBC_ChangeMapVBlank).toBe(vbcChangeMapVBlank);
    expect(CB2_DoChangeMap).toBe(cb2DoChangeMap);
    expect(TryDoMapTransition).toBe(tryDoMapTransition);
    expect(MapTransitionIsEnter).toBe(mapTransitionIsEnter);
    expect(MapTransitionIsExit).toBe(mapTransitionIsExit);
    expect(FlashTransition_Exit).toBe(flashTransitionExit);
    expect(Task_FlashTransition_Exit_0).toBe(taskFlashTransitionExit0);
    expect(Task_FlashTransition_Exit_1).toBe(taskFlashTransitionExit1);
    expect(Task_FlashTransition_Exit_2).toBe(taskFlashTransitionExit2);
    expect(Task_FlashTransition_Exit_3).toBe(taskFlashTransitionExit3);
    expect(Task_FlashTransition_Exit_4).toBe(taskFlashTransitionExit4);
    expect(FlashTransition_Enter).toBe(flashTransitionEnter);
    expect(Task_FlashTransition_Enter_0).toBe(taskFlashTransitionEnter0);
    expect(Task_FlashTransition_Enter_1).toBe(taskFlashTransitionEnter1);
    expect(Task_FlashTransition_Enter_2).toBe(taskFlashTransitionEnter2);
    expect(Task_FlashTransition_Enter_3).toBe(taskFlashTransitionEnter3);
    expect(RunMapPreviewScreen).toBe(runMapPreviewScreen);
    expect(Task_MapPreviewScreen_0).toBe(taskMapPreviewScreen0);
  });

  test('CB2_ChangeMapMain and VBC_ChangeMapVBlank preserve callback side-effect order', () => {
    const runtime = createFldEffFlashRuntime();
    cb2ChangeMapMain(runtime);
    vbcChangeMapVBlank(runtime);
    expect(runtime.transitionLog).toEqual([
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'UpdatePaletteFade',
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'TransferPlttBuffer'
    ]);
  });

  test('SetUpFieldMove_Flash rejects non-caves and active flash, otherwise installs callbacks', () => {
    const runtime = createFldEffFlashRuntime();
    expect(setUpFieldMoveFlash(runtime)).toBe(false);

    runtime.mapHeader.cave = true;
    runtime.flags.add(FLAG_SYS_FLASH_ACTIVE);
    expect(setUpFieldMoveFlash(runtime)).toBe(false);

    runtime.flags.clear();
    expect(setUpFieldMoveFlash(runtime)).toBe(true);
    expect(runtime.fieldCallback2).toBe('FieldCallback_PrepareFadeInFromMenu');
    expect(runtime.postMenuFieldCallback).toBe('FieldCallback_Flash');
  });

  test('FieldCallback_Flash stores selected mon and FldEff_UseFlash plays sound, sets flag, and starts script', () => {
    const runtime = createFldEffFlashRuntime();
    runtime.cursorSelectionMonId = 3;

    const taskId = fieldCallbackFlash(runtime);
    expect(taskId).toBe(0);
    expect(runtime.fieldEffectArguments[0]).toBe(3);
    expect(runtime.tasks[taskId].func).toBe('CreateFieldEffectShowMon');

    fldEffUseFlash(runtime);
    expect(runtime.playedSE).toEqual([SE_M_REFLECT]);
    expect(runtime.flags.has(FLAG_SYS_FLASH_ACTIVE)).toBe(true);
    expect(runtime.setupScripts).toEqual([EVENT_SCRIPT_FLD_EFF_FLASH]);
  });

  test('MapTransitionIsEnter and MapTransitionIsExit classify underground transitions from sTransitionTypes', () => {
    expect(mapTransitionIsEnter(MAP_TYPE_TOWN, MAP_TYPE_UNDERGROUND)).toBe(true);
    expect(mapTransitionIsEnter(MAP_TYPE_UNDERGROUND, MAP_TYPE_ROUTE)).toBe(false);
    expect(mapTransitionIsExit(MAP_TYPE_UNDERGROUND, MAP_TYPE_ROUTE)).toBe(true);
    expect(mapTransitionIsExit(MAP_TYPE_ROUTE, MAP_TYPE_UNDERGROUND)).toBe(false);
    expect(mapTransitionIsEnter(MAP_TYPE_ROUTE, MAP_TYPE_INDOOR)).toBe(false);
    expect(mapTransitionIsExit(MAP_TYPE_ROUTE, MAP_TYPE_INDOOR)).toBe(false);
  });

  test('TryDoMapTransition prefers map preview when section changes and preview is allowed', () => {
    const runtime = createFldEffFlashRuntime();
    runtime.lastWarpMapSectionId = 1;
    runtime.mapHeader.regionMapSectionId = 2;
    runtime.mapPreviewAllowed = true;
    runtime.lastWarpMapType = MAP_TYPE_ROUTE;
    runtime.currentMapType = MAP_TYPE_UNDERGROUND;

    expect(tryDoMapTransition(runtime)).toBe(true);
    expect(runtime.tasks[0].func).toBe('Task_MapPreviewScreen_0');
    expect(runtime.tasks[0].data[3]).toBe(2);
  });

  test('CB2_DoChangeMap creates enter or exit transition tasks and falls back when no transition matches', () => {
    const enter = createFldEffFlashRuntime();
    enter.lastWarpMapType = MAP_TYPE_ROUTE;
    enter.currentMapType = MAP_TYPE_UNDERGROUND;
    cb2DoChangeMap(enter);
    expect(enter.callbacks.main).toBe('CB2_ChangeMapMain');
    expect(enter.tasks[0].func).toBe('Task_FlashTransition_Enter_0');

    const exit = createFldEffFlashRuntime();
    exit.lastWarpMapType = MAP_TYPE_UNDERGROUND;
    exit.currentMapType = MAP_TYPE_ROUTE;
    cb2DoChangeMap(exit);
    expect(exit.tasks[0].func).toBe('Task_FlashTransition_Exit_0');

    const none = createFldEffFlashRuntime();
    none.lastWarpMapType = MAP_TYPE_ROUTE;
    none.currentMapType = MAP_TYPE_INDOOR;
    cb2DoChangeMap(none);
    expect(none.callbacks.main).toBe(none.callbacks.savedMain);
    expect(none.tasks).toHaveLength(0);
  });

  test('enter and exit transition task state machines reach saved callback with C counter behavior', () => {
    const enter = createFldEffFlashRuntime();
    enter.lastWarpMapType = MAP_TYPE_ROUTE;
    enter.currentMapType = MAP_TYPE_UNDERGROUND;
    cb2DoChangeMap(enter);
    for (let i = 0; i < 30; i += 1) {
      stepFldEffFlashTask(enter, 0);
    }
    expect(enter.callbacks.main).toBe(enter.callbacks.savedMain);
    expect(enter.paletteLoads.some((load) => load.source === 'sCaveTransitionPalette_Black')).toBe(true);

    const exit = createFldEffFlashRuntime();
    exit.lastWarpMapType = MAP_TYPE_UNDERGROUND;
    exit.currentMapType = MAP_TYPE_ROUTE;
    cb2DoChangeMap(exit);
    for (let i = 0; i < 42; i += 1) {
      stepFldEffFlashTask(exit, 0);
    }
    expect(exit.callbacks.main).toBe(exit.callbacks.savedMain);
    expect(exit.paletteLoads.some((load) => load.source === 'sCaveTransitionPalette_White' && load.offset === 0)).toBe(true);
  });

  test('map preview task follows load, fade, duration, unload, then hands off to enter transition', () => {
    const runtime = createFldEffFlashRuntime();
    const taskId = runMapPreviewScreen(runtime, 7);

    stepFldEffFlashTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[0]).toBe(1);
    stepFldEffFlashTask(runtime, taskId);
    expect(runtime.mapPreviewWindows).toEqual([0]);
    stepFldEffFlashTask(runtime, taskId);
    expect(runtime.paletteFadeActive).toBe(true);
    runtime.paletteFadeActive = false;
    stepFldEffFlashTask(runtime, taskId);
    expect(runtime.tasks[taskId].data[2]).toBe(120);
    runtime.bButtonHeld = true;
    stepFldEffFlashTask(runtime, taskId);
    expect(runtime.paletteFadeActive).toBe(true);
    runtime.paletteFadeActive = false;
    stepFldEffFlashTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_FlashTransition_Enter_1');
  });
});
