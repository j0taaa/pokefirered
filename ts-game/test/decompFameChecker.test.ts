import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  FAMECHECKER_BILL,
  FAMECHECKER_BROCK,
  FAMECHECKER_GIOVANNI,
  FAMECHECKER_MISTY,
  FAMECHECKER_OAK,
  FCPICKSTATE_COLORED,
  FCPICKSTATE_NO_DRAW,
  FCPICKSTATE_SILHOUETTE,
  FCWINDOWID_MSGBOX,
  FCWINDOWID_UIHELP,
  START_BUTTON,
  TASK_NONE,
  AdjustGiovanniIndexIfBeatenInGym,
  CreateAllFlavorTextIcons,
  CreateSpinningPokeballSprite,
  CreateTask,
  FC_DestroyWindow,
  FC_MoveCursorFunc,
  FC_PopulateListMenu,
  FC_PutWindowTilemapAndCopyWindowToVramMode3,
  FC_PutWindowTilemapAndCopyWindowToVramMode3_2,
  FC_VBlankCallback,
  FCSetup_ClearVideoRegisters,
  FCSetup_ResetBGCoords,
  FCSetup_ResetTasksAndSpriteResources,
  FCSetup_TurnOnDisplay,
  FameCheckerGetCursorY,
  FindTaskIdByFunc,
  FreeNonTrainerPicTiles,
  FreeQuestionMarkSpriteResources,
  FreeSelectionCursorSpriteResources,
  FreeSpinningPokeballSpriteResources,
  FullyUnlockFameChecker,
  HandleFlavorTextModeSwitch,
  MainCB2_FameCheckerMain,
  MainCB2_LoadFameChecker,
  ResetFameChecker,
  SetFlavorTextFlagFromSpecialVars,
  SpriteCB_DestroyFlavorTextIconSelectorCursor,
  SpriteCB_FCSpinningPokeball,
  SpriteCB_DestroySpinningPokeball,
  Task_EnterPickMode,
  Task_FCOpenOrCloseInfoBox,
  Task_FlavorTextDisplayHandleInput,
  Task_TopMenuHandleInput,
  Task_WaitFadeOnInit,
  TryExitPickMode,
  UpdateIconDescriptionBox,
  UpdateIconDescriptionBoxOff,
  UpdatePickStateFromSpecialVar8005,
  UseFameChecker,
  createFameCheckerRuntime
} from '../src/game/decompFameChecker';

const allocateAndPopulate = () => {
  const runtime = createFameCheckerRuntime();
  UseFameChecker(runtime, 'SavedCB');
  runtime.sListMenuItems = Array.from({ length: 17 }, () => ({ label: '', index: 0 }));
  runtime.sFameCheckerData!.numUnlockedPersons = FC_PopulateListMenu(runtime);
  return runtime;
};

describe('decompFameChecker', () => {
  test('exports exact C callback, window, setup, and sprite-resource helpers', () => {
    const runtime = createFameCheckerRuntime();

    FC_VBlankCallback(runtime);
    MainCB2_FameCheckerMain(runtime);
    FC_PutWindowTilemapAndCopyWindowToVramMode3(runtime, 2);
    FC_PutWindowTilemapAndCopyWindowToVramMode3_2(runtime, 3);
    FC_DestroyWindow(runtime, 1);
    FCSetup_ClearVideoRegisters(runtime);
    FCSetup_TurnOnDisplay(runtime);
    FCSetup_ResetBGCoords(runtime);
    FreeSelectionCursorSpriteResources(runtime);
    FreeQuestionMarkSpriteResources(runtime);
    FreeSpinningPokeballSpriteResources(runtime);
    FreeNonTrainerPicTiles(runtime);

    expect(runtime.operations).toEqual([
      'LoadOam',
      'ProcessSpriteCopyRequests',
      'TransferPlttBuffer',
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'UpdatePaletteFade',
      'PutWindowTilemap(2)',
      'CopyWindowToVram(2,COPYWIN_FULL)',
      'PutWindowTilemap(3)',
      'CopyWindowToVram(3,COPYWIN_FULL)',
      'FillWindowPixelBuffer(1,0)',
      'ClearWindowTilemap(1)',
      'CopyWindowToVram(1,COPYWIN_GFX)',
      'RemoveWindow(1)',
      'FCSetup_ClearVideoRegisters',
      'FCSetup_TurnOnDisplay',
      'FCSetup_ResetBGCoords',
      'FreeSpriteTilesByTag(SPRITETAG_SELECTOR_CURSOR)',
      'FreeSpritePaletteByTag(SPRITETAG_SELECTOR_CURSOR)',
      'FreeSpriteTilesByTag(SPRITETAG_QUESTION_MARK)',
      'FreeSpriteTilesByTag(SPRITETAG_SPINNING_POKEBALL)',
      'FreeSpritePaletteByTag(SPRITETAG_SPINNING_POKEBALL)',
      'FreeSpriteTilesByTag(SPRITETAG_DAISY)',
      'FreeSpriteTilesByTag(SPRITETAG_FUJI)',
      'FreeSpriteTilesByTag(SPRITETAG_OAK)',
      'FreeSpriteTilesByTag(SPRITETAG_BILL)'
    ]);
    expect(runtime.bgX).toEqual([0, 0, 0, 0]);

    const selectorId = CreateSpinningPokeballSprite(runtime);
    SpriteCB_DestroyFlavorTextIconSelectorCursor(runtime, selectorId);
    expect(runtime.sprites.find((sprite) => sprite.id === selectorId)!.invisible).toBe(true);

    const ballId = CreateSpinningPokeballSprite(runtime);
    SpriteCB_DestroySpinningPokeball(runtime, ballId);
    expect(runtime.sprites.find((sprite) => sprite.id === ballId)!.invisible).toBe(true);
    expect(runtime.operations).toContain(`FreeSpriteOamMatrix(${ballId})`);

    runtime.tasks.push({ id: 99, func: 'Dirty', data: [], isActive: true });
    FCSetup_ResetTasksAndSpriteResources(runtime);
    expect(runtime.tasks).toEqual([]);
    expect(runtime.sprites).toEqual([]);
  });

  test('reset, full unlock, and special-var helpers match the guarded C mutations', () => {
    const runtime = createFameCheckerRuntime();
    FullyUnlockFameChecker(runtime);
    expect(runtime.fameCheckerSave.every((entry) => entry.pickState === FCPICKSTATE_COLORED && entry.flavorTextFlags === 0x3f)).toBe(true);

    ResetFameChecker(runtime);
    expect(runtime.fameCheckerSave[FAMECHECKER_OAK]!.pickState).toBe(FCPICKSTATE_COLORED);
    expect(runtime.fameCheckerSave[FAMECHECKER_BROCK]!.pickState).toBe(FCPICKSTATE_NO_DRAW);

    runtime.specialVar8004 = FAMECHECKER_MISTY;
    runtime.specialVar8005 = 4;
    SetFlavorTextFlagFromSpecialVars(runtime);
    expect(runtime.fameCheckerSave[FAMECHECKER_MISTY]!.flavorTextFlags).toBe(1 << 4);
    expect(runtime.fameCheckerSave[FAMECHECKER_MISTY]!.pickState).toBe(FCPICKSTATE_SILHOUETTE);

    runtime.fameCheckerSave[FAMECHECKER_MISTY]!.pickState = FCPICKSTATE_COLORED;
    runtime.specialVar8005 = FCPICKSTATE_SILHOUETTE;
    UpdatePickStateFromSpecialVar8005(runtime);
    expect(runtime.fameCheckerSave[FAMECHECKER_MISTY]!.pickState).toBe(FCPICKSTATE_COLORED);

    runtime.specialVar8005 = FCPICKSTATE_NO_DRAW;
    UpdatePickStateFromSpecialVar8005(runtime);
    expect(runtime.fameCheckerSave[FAMECHECKER_MISTY]!.pickState).toBe(FCPICKSTATE_COLORED);
  });

  test('list population uses trainer/non-trainer labels, Cancel, maxShowed, and Giovanni gym adjustment', () => {
    const runtime = createFameCheckerRuntime();
    UseFameChecker(runtime, 'SavedCB');
    runtime.sListMenuItems = Array.from({ length: 17 }, () => ({ label: '', index: 0 }));
    runtime.fameCheckerSave[FAMECHECKER_BROCK]!.pickState = FCPICKSTATE_SILHOUETTE;
    runtime.fameCheckerSave[FAMECHECKER_BILL]!.pickState = FCPICKSTATE_COLORED;

    expect(FC_PopulateListMenu(runtime)).toBe(4);
    expect(runtime.sListMenuItems.slice(0, 4).map((item) => item.label)).toEqual(['Oak', 'TRAINER_100', 'Bill', 'Cancel']);
    expect(runtime.sFameCheckerData!.unlockedPersons.slice(0, 4)).toEqual([FAMECHECKER_OAK, FAMECHECKER_BROCK, FAMECHECKER_BILL, 0xff]);
    expect(runtime.gFameChecker_ListMenuTemplate.maxShowed).toBe(4);

    expect(AdjustGiovanniIndexIfBeatenInGym(runtime, 9)).toBe(9);
    runtime.trainerBeenFought.add(111);
    expect(AdjustGiovanniIndexIfBeatenInGym(runtime, 9)).toBe(FAMECHECKER_GIOVANNI);
    expect(AdjustGiovanniIndexIfBeatenInGym(runtime, 10)).toBe(9);
  });

  test('load callback advances through the same eight setup states and installs the wait task', () => {
    const runtime = createFameCheckerRuntime();
    UseFameChecker(runtime, 'SavedCB');

    for (let i = 0; i < 8; i++) MainCB2_LoadFameChecker(runtime);

    expect(runtime.mainCallback).toBe('MainCB2_FameCheckerMain');
    expect(runtime.vblankCallback).toBe('FC_VBlankCallback');
    expect(runtime.gMainState).toBe(0);
    expect(FindTaskIdByFunc(runtime, 'Task_WaitFadeOnInit')).not.toBe(TASK_NONE);
    expect(runtime.infoBoxUpdates.at(-1)).toEqual({ bg: 1, state: 4 });

    const taskId = FindTaskIdByFunc(runtime, 'Task_WaitFadeOnInit');
    Task_WaitFadeOnInit(runtime, taskId);
    expect(runtime.tasks.find((task) => task.id === taskId)!.func).toBe('Task_TopMenuHandleInput');
  });

  test('flavor icon creation records real object sprites and question marks exactly by bit flags', () => {
    const runtime = allocateAndPopulate();
    runtime.fameCheckerSave[FAMECHECKER_OAK]!.flavorTextFlags = 0b001011;

    expect(CreateAllFlavorTextIcons(runtime, 0)).toBe(true);
    expect(runtime.sFameCheckerData!.personHasUnlockedPanels).toBe(true);
    expect(runtime.sFameCheckerData!.spriteIds.map((id) => runtime.sprites.find((sprite) => sprite.id === id)!.template)).toEqual([
      'FameCheckerObject(0)',
      'FameCheckerObject(1)',
      'QuestionMark',
      'FameCheckerObject(3)',
      'QuestionMark',
      'QuestionMark'
    ]);
    expect(runtime.printedTexts.at(-1)).toMatchObject({ windowId: FCWINDOWID_UIHELP, text: 'gFameCheckerText_MainScreenUI' });

    runtime.fameCheckerSave[FAMECHECKER_OAK]!.flavorTextFlags = 0;
    expect(CreateAllFlavorTextIcons(runtime, 0)).toBe(false);
    expect(runtime.sFameCheckerData!.personHasUnlockedPanels).toBe(false);
  });

  test('top menu enters pick mode, exits it, and keeps the C sprite data/x2 transitions', () => {
    const runtime = allocateAndPopulate();
    runtime.fameCheckerSave[FAMECHECKER_OAK]!.flavorTextFlags = 0x3f;
    CreateAllFlavorTextIcons(runtime, 0);
    const taskId = CreateTask(runtime, 'Task_TopMenuHandleInput');
    runtime.newKeys = START_BUTTON;

    Task_TopMenuHandleInput(runtime, taskId);
    expect(runtime.tasks.find((task) => task.id === taskId)!.func).toBe('Task_EnterPickMode');
    const personSprite = runtime.tasks.find((task) => task.id === taskId)!.data[2]!;
    const ballSprite = runtime.tasks.find((task) => task.id === taskId)!.data[3]!;
    expect(runtime.sprites.find((sprite) => sprite.id === personSprite)!.x2).toBe(0xf0);
    expect(runtime.sprites.find((sprite) => sprite.id === ballSprite)!.data[0]).toBe(1);

    runtime.sprites.find((sprite) => sprite.id === personSprite)!.data[0] = 0;
    Task_EnterPickMode(runtime, taskId);
    expect(runtime.sFameCheckerData!.inPickMode).toBe(true);
    expect(runtime.tasks.find((task) => task.id === taskId)!.func).toBe('Task_TopMenuHandleInput');
    expect(runtime.printedTexts.some((entry) => entry.windowId === FCWINDOWID_MSGBOX && entry.text === 'Prof. Oak quote')).toBe(true);

    expect(TryExitPickMode(runtime, taskId)).toBe(true);
    expect(runtime.tasks.find((task) => task.id === taskId)!.func).toBe('Task_ExitPickMode');
    expect(runtime.sFameCheckerData!.pickModeOverCancel).toBe(false);
  });

  test('flavor text mode cursor wraps across the six icon grid and closes with B', () => {
    const runtime = allocateAndPopulate();
    runtime.fameCheckerSave[FAMECHECKER_OAK]!.flavorTextFlags = 0x3f;
    CreateAllFlavorTextIcons(runtime, 0);
    const taskId = CreateTask(runtime, 'Task_FlavorTextDisplayHandleInput');
    const task = runtime.tasks.find((entry) => entry.id === taskId)!;
    task.data[0] = 99;
    runtime.sprites.push({ id: 99, template: 'SelectorCursor', x: 114, y: 34, x2: 0, y2: 0, data: Array(8).fill(0), invisible: false, callback: 'dummy', oam: { objMode: 0, priority: 0, paletteNum: 0 } });
    task.data[1] = 0;

    runtime.newKeys = DPAD_LEFT;
    Task_FlavorTextDisplayHandleInput(runtime, taskId);
    expect(task.data[1]).toBe(2);
    expect(runtime.sprites.find((sprite) => sprite.id === 99)!.x).toBe(114 + 0x5e);

    runtime.newKeys = DPAD_RIGHT;
    Task_FlavorTextDisplayHandleInput(runtime, taskId);
    expect(task.data[1]).toBe(0);

    runtime.newKeys = DPAD_UP;
    Task_FlavorTextDisplayHandleInput(runtime, taskId);
    expect(task.data[1]).toBe(3);

    runtime.newKeys = A_BUTTON;
    Task_FlavorTextDisplayHandleInput(runtime, taskId);
    expect(runtime.printedTexts.at(-1)?.text).toBe('FlavorText3');

    runtime.newKeys = B_BUTTON;
    Task_FlavorTextDisplayHandleInput(runtime, taskId);
    expect(task.func).toBe('Task_TopMenuHandleInput');
    expect(runtime.sprites.find((sprite) => sprite.id === 99)!.callback).toBe('SpriteCB_DestroyFlavorTextIconSelectorCursor');
  });

  test('info box mode switch and animation task use the same two four-frame stages', () => {
    const runtime = allocateAndPopulate();

    UpdateIconDescriptionBox(runtime, 2);
    expect(runtime.gIconDescriptionBoxIsOpen).toBe(1);
    const taskId = FindTaskIdByFunc(runtime, 'Task_FCOpenOrCloseInfoBox');
    expect(taskId).not.toBe(TASK_NONE);

    for (let i = 0; i < 4; i++) Task_FCOpenOrCloseInfoBox(runtime, taskId);
    expect(runtime.infoBoxUpdates.at(-1)).toEqual({ bg: 1, state: 0 });
    for (let i = 0; i < 4; i++) Task_FCOpenOrCloseInfoBox(runtime, taskId);
    expect(runtime.infoBoxUpdates.at(-1)).toEqual({ bg: 1, state: 1 });
    expect(FindTaskIdByFunc(runtime, 'Task_FCOpenOrCloseInfoBox')).toBe(TASK_NONE);

    UpdateIconDescriptionBoxOff(runtime);
    expect(runtime.gIconDescriptionBoxIsOpen).toBe(0xff);
    expect(runtime.sFameCheckerData!.viewingFlavorText).toBe(false);
    HandleFlavorTextModeSwitch(runtime, false);
    expect(runtime.tasks.filter((task) => task.func === 'Task_FCOpenOrCloseInfoBox' && task.isActive)).toHaveLength(1);
  });

  test('move cursor bookkeeping, cursor Y, and spinning pokeball callback preserve C math', () => {
    const runtime = allocateAndPopulate();
    runtime.fameCheckerSave[FAMECHECKER_BROCK]!.pickState = FCPICKSTATE_COLORED;
    runtime.sFameCheckerData!.numUnlockedPersons = FC_PopulateListMenu(runtime);
    runtime.listMenuTop = 0;
    runtime.listMenuRow = 1;
    FC_MoveCursorFunc(runtime, 1, false);
    expect(FameCheckerGetCursorY(runtime)).toBe(1);
    expect(runtime.sFameCheckerData!.listMenuCurIdx).toBe(1);
    expect(runtime.sFameCheckerData!.listMenuDrawnSelIdx).toBe(1);

    const spriteId = CreateSpinningPokeballSprite(runtime);
    const sprite = runtime.sprites.find((sprite) => sprite.id === spriteId)!;
    sprite.data[0] = 1;
    sprite.x2 = 5;
    SpriteCB_FCSpinningPokeball(runtime, spriteId);
    expect(sprite.x2).toBe(0);
    expect(sprite.data[0]).toBe(0);
    sprite.data[0] = 2;
    sprite.x2 = 241;
    SpriteCB_FCSpinningPokeball(runtime, spriteId);
    expect(sprite.x2).toBe(240);
    expect(sprite.data[0]).toBe(0);
  });
});
