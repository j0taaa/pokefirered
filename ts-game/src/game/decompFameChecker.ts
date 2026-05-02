export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const START_BUTTON = 1 << 3;
export const DPAD_RIGHT = 1 << 4;
export const DPAD_LEFT = 1 << 5;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;

export const NUM_FAMECHECKER_PERSONS = 16;
export const NUM_FAMECHECKER_FLAVOR_TEXTS = 6;
export const FC_NONTRAINER_START = 0xfe00;
export const TASK_NONE = 0xff;

export const FCPICKSTATE_NO_DRAW = 0;
export const FCPICKSTATE_SILHOUETTE = 1;
export const FCPICKSTATE_COLORED = 2;

export const FAMECHECKER_OAK = 0;
export const FAMECHECKER_DAISY = 1;
export const FAMECHECKER_BROCK = 2;
export const FAMECHECKER_MISTY = 3;
export const FAMECHECKER_LTSURGE = 4;
export const FAMECHECKER_ERIKA = 5;
export const FAMECHECKER_KOGA = 6;
export const FAMECHECKER_SABRINA = 7;
export const FAMECHECKER_BLAINE = 8;
export const FAMECHECKER_LORELEI = 9;
export const FAMECHECKER_BRUNO = 10;
export const FAMECHECKER_AGATHA = 11;
export const FAMECHECKER_LANCE = 12;
export const FAMECHECKER_BILL = 13;
export const FAMECHECKER_MRFUJI = 14;
export const FAMECHECKER_GIOVANNI = 15;

export const FCWINDOWID_LIST = 0;
export const FCWINDOWID_UIHELP = 1;
export const FCWINDOWID_MSGBOX = 2;
export const FCWINDOWID_ICONDESC = 3;

export interface FameCheckerSaveEntry {
  pickState: number;
  flavorTextFlags: number;
  unk_0_E: number;
}

export interface FameCheckerData {
  savedCallback: string | null;
  listMenuTopIdx: number;
  scrollIndicatorPairTaskId: number;
  personHasUnlockedPanels: boolean;
  inPickMode: boolean;
  numUnlockedPersons: number;
  listMenuTaskId: number;
  listMenuCurIdx: number;
  listMenuTopIdx2: number;
  listMenuDrawnSelIdx: number;
  unlockedPersons: number[];
  spriteIds: number[];
  viewingFlavorText: boolean;
  unk_23_1: boolean;
  pickModeOverCancel: boolean;
}

export interface FameCheckerTask {
  id: number;
  func: string;
  data: number[];
  isActive: boolean;
}

export interface FameCheckerSprite {
  id: number;
  template: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  callback: string;
  oam: { objMode: number; priority: number; paletteNum: number };
}

export interface FameCheckerListMenuItem {
  label: string;
  index: number;
}

export interface FameCheckerListMenuTemplate {
  totalItems: number;
  maxShowed: number;
  windowId: number;
  item_X: number;
  cursor_X: number;
  upText_Y: number;
  fontId: number;
  cursorKind: number;
}

export interface FameCheckerRuntime {
  sFameCheckerData: FameCheckerData | null;
  sListMenuItems: FameCheckerListMenuItem[];
  gFameChecker_ListMenuTemplate: FameCheckerListMenuTemplate;
  gIconDescriptionBoxIsOpen: number;
  sLastMenuIdx: number;
  fameCheckerSave: FameCheckerSaveEntry[];
  trainerNames: string[];
  nonTrainerNames: string[];
  trainerBeenFought: Set<number>;
  specialVar8004: number;
  specialVar8005: number;
  mainCallback: string | null;
  vblankCallback: string | null;
  gMainState: number;
  paletteFadeActive: boolean;
  dmaBusy: boolean;
  textPrinterActive: boolean;
  newKeys: number;
  listMenuInput: number;
  listMenuTop: number;
  listMenuRow: number;
  bgX: number[];
  tasks: FameCheckerTask[];
  sprites: FameCheckerSprite[];
  nextTaskId: number;
  nextSpriteId: number;
  operations: string[];
  printedTexts: { windowId: number; text: string; color?: string; x?: number; y?: number }[];
  infoBoxUpdates: { bg: number; state: number }[];
}

export const sTrainerIdxs = [
  FC_NONTRAINER_START + 0,
  FC_NONTRAINER_START + 1,
  100,
  101,
  102,
  103,
  104,
  105,
  106,
  107,
  108,
  109,
  110,
  FC_NONTRAINER_START + 2,
  FC_NONTRAINER_START + 3,
  111
] as const;

export const sFameCheckerPersonNames = [
  'Prof. Oak',
  'Daisy',
  'Brock',
  'Misty',
  'Lt. Surge',
  'Erika',
  'Koga',
  'Sabrina',
  'Blaine',
  'Lorelei',
  'Bruno',
  'Agatha',
  'Lance',
  'Bill',
  'Mr. Fuji',
  'Giovanni'
] as const;

export const sFameCheckerPersonQuotes = sFameCheckerPersonNames.map((name) => `${name} quote`);
export const sFameCheckerFlavorTextPointers = Array.from({ length: NUM_FAMECHECKER_PERSONS * NUM_FAMECHECKER_FLAVOR_TEXTS }, (_, index) => `FlavorText${index}`);
export const sFlavorTextOriginLocationTexts = Array.from({ length: NUM_FAMECHECKER_PERSONS * NUM_FAMECHECKER_FLAVOR_TEXTS }, (_, index) => `Location${index}`);
export const sFlavorTextOriginObjectNameTexts = Array.from({ length: NUM_FAMECHECKER_PERSONS * NUM_FAMECHECKER_FLAVOR_TEXTS }, (_, index) => `Object${index}`);
export const sFameCheckerArrayNpcGraphicsIds = Array.from({ length: NUM_FAMECHECKER_PERSONS * NUM_FAMECHECKER_FLAVOR_TEXTS }, (_, index) => index);

const defaultSave = (): FameCheckerSaveEntry[] =>
  Array.from({ length: NUM_FAMECHECKER_PERSONS }, () => ({ pickState: FCPICKSTATE_NO_DRAW, flavorTextFlags: 0, unk_0_E: 0 }));

const defaultData = (savedCallback: string | null): FameCheckerData => ({
  savedCallback,
  listMenuTopIdx: 0,
  scrollIndicatorPairTaskId: 0,
  personHasUnlockedPanels: false,
  inPickMode: false,
  numUnlockedPersons: 0,
  listMenuTaskId: 0,
  listMenuCurIdx: 0,
  listMenuTopIdx2: 0,
  listMenuDrawnSelIdx: 0,
  unlockedPersons: Array(NUM_FAMECHECKER_PERSONS + 1).fill(0),
  spriteIds: Array(NUM_FAMECHECKER_FLAVOR_TEXTS).fill(0),
  viewingFlavorText: false,
  unk_23_1: false,
  pickModeOverCancel: false
});

export const createFameCheckerRuntime = (overrides: Partial<FameCheckerRuntime> = {}): FameCheckerRuntime => {
  const save = defaultSave();
  save[FAMECHECKER_OAK]!.pickState = FCPICKSTATE_COLORED;
  const runtime: FameCheckerRuntime = {
    sFameCheckerData: null,
    sListMenuItems: [],
    gFameChecker_ListMenuTemplate: { totalItems: 1, maxShowed: 1, windowId: FCWINDOWID_LIST, item_X: 8, cursor_X: 0, upText_Y: 4, fontId: 2, cursorKind: 0 },
    gIconDescriptionBoxIsOpen: 0,
    sLastMenuIdx: 0,
    fameCheckerSave: save,
    trainerNames: Array.from({ length: 112 }, (_, index) => `TRAINER_${index}`),
    nonTrainerNames: ['Oak', 'Daisy', 'Bill', 'Mr. Fuji'],
    trainerBeenFought: new Set(),
    specialVar8004: 0,
    specialVar8005: 0,
    mainCallback: null,
    vblankCallback: null,
    gMainState: 0,
    paletteFadeActive: false,
    dmaBusy: false,
    textPrinterActive: false,
    newKeys: 0,
    listMenuInput: 0,
    listMenuTop: 0,
    listMenuRow: 0,
    bgX: [0, 0, 0, 0],
    tasks: [],
    sprites: [],
    nextTaskId: 0,
    nextSpriteId: 0,
    operations: [],
    printedTexts: [],
    infoBoxUpdates: [],
    ...overrides
  };
  return runtime;
};

const data = (runtime: FameCheckerRuntime): FameCheckerData => {
  if (runtime.sFameCheckerData === null) throw new Error('Fame Checker data is not allocated');
  return runtime.sFameCheckerData;
};

const task = (runtime: FameCheckerRuntime, taskId: number): FameCheckerTask => {
  const found = runtime.tasks.find((entry) => entry.id === taskId);
  if (found === undefined) throw new Error(`Task ${taskId} not found`);
  return found;
};

const sprite = (runtime: FameCheckerRuntime, spriteId: number): FameCheckerSprite => {
  const found = runtime.sprites.find((entry) => entry.id === spriteId);
  if (found === undefined) throw new Error(`Sprite ${spriteId} not found`);
  return found;
};

const op = (runtime: FameCheckerRuntime, value: string): void => {
  runtime.operations.push(value);
};

export const CreateTask = (runtime: FameCheckerRuntime, func: string): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks.push({ id, func, data: Array(16).fill(0), isActive: true });
  return id;
};

export const DestroyTask = (runtime: FameCheckerRuntime, taskId: number): void => {
  const current = task(runtime, taskId);
  current.isActive = false;
  op(runtime, `DestroyTask(${current.func})`);
};

export const FindTaskIdByFunc = (runtime: FameCheckerRuntime, func: string): number => runtime.tasks.find((entry) => entry.func === func && entry.isActive)?.id ?? TASK_NONE;

const CreateSprite = (runtime: FameCheckerRuntime, template: string, x: number, y: number): number => {
  const id = runtime.nextSpriteId++;
  runtime.sprites.push({ id, template, x, y, x2: 0, y2: 0, data: Array(8).fill(0), invisible: false, callback: 'SpriteCallbackDummy', oam: { objMode: 0, priority: 0, paletteNum: 0 } });
  return id;
};

const DestroySprite = (runtime: FameCheckerRuntime, spriteId: number): void => {
  sprite(runtime, spriteId).invisible = true;
  op(runtime, `DestroySprite(${spriteId})`);
};

const print = (runtime: FameCheckerRuntime, windowId: number, text: string, color?: string, x?: number, y?: number): void => {
  runtime.printedTexts.push({ windowId, text, color, x, y });
};

export const UseFameChecker = (runtime: FameCheckerRuntime, savedCallback: string | null): void => {
  runtime.vblankCallback = null;
  runtime.sFameCheckerData = defaultData(savedCallback);
  data(runtime).listMenuCurIdx = 0;
  data(runtime).listMenuTopIdx2 = 0;
  data(runtime).listMenuDrawnSelIdx = 0;
  data(runtime).viewingFlavorText = false;
  op(runtime, 'PlaySE(SE_M_SWIFT)');
  runtime.mainCallback = 'MainCB2_LoadFameChecker';
};

export const MainCB2_LoadFameChecker = (runtime: FameCheckerRuntime): void => {
  switch (runtime.gMainState) {
    case 0:
      runtime.vblankCallback = null;
      FCSetup_ClearVideoRegisters(runtime);
      runtime.gMainState++;
      break;
    case 1:
      FCSetup_ResetTasksAndSpriteResources(runtime);
      runtime.gMainState++;
      break;
    case 2:
      op(runtime, 'AllocBgTilemapBuffers');
      FCSetup_ResetBGCoords(runtime);
      runtime.gMainState++;
      break;
    case 3:
      op(runtime, 'LoadFameCheckerBackgrounds');
      runtime.gMainState++;
      break;
    case 4:
      if (!runtime.dmaBusy) {
        [0, 1, 2, 3].forEach((bg) => op(runtime, `ShowBg(${bg})`));
        runtime.gMainState++;
      }
      break;
    case 5:
      Setup_DrawMsgAndListBoxes(runtime);
      runtime.sListMenuItems = Array.from({ length: 17 }, () => ({ label: '', index: 0 }));
      FC_CreateListMenu(runtime);
      runtime.gMainState++;
      break;
    case 6:
      LoadUISpriteSheetsAndPalettes(runtime);
      CreateAllFlavorTextIcons(runtime, FAMECHECKER_OAK);
      WipeMsgBoxAndTransfer(runtime);
      op(runtime, 'BeginNormalPaletteFade(PALETTES_ALL,0,16,0,0)');
      runtime.gMainState++;
      break;
    case 7:
      FCSetup_TurnOnDisplay(runtime);
      runtime.vblankCallback = 'FC_VBlankCallback';
      data(runtime).listMenuTopIdx = 0;
      FC_CreateScrollIndicatorArrowPair(runtime);
      UpdateInfoBoxTilemap(runtime, 1, 4);
      CreateTask(runtime, 'Task_WaitFadeOnInit');
      runtime.mainCallback = 'MainCB2_FameCheckerMain';
      runtime.gMainState = 0;
      break;
  }
};

export const FC_VBlankCallback = (runtime: FameCheckerRuntime): void => {
  op(runtime, 'LoadOam');
  op(runtime, 'ProcessSpriteCopyRequests');
  op(runtime, 'TransferPlttBuffer');
};

export const MainCB2_FameCheckerMain = (runtime: FameCheckerRuntime): void => {
  op(runtime, 'RunTasks');
  op(runtime, 'AnimateSprites');
  op(runtime, 'BuildOamBuffer');
  op(runtime, 'UpdatePaletteFade');
};

export const Task_WaitFadeOnInit = (runtime: FameCheckerRuntime, taskId: number): void => {
  if (!runtime.paletteFadeActive) task(runtime, taskId).func = 'Task_TopMenuHandleInput';
};

export const Task_TopMenuHandleInput = (runtime: FameCheckerRuntime, taskId: number): void => {
  if (FindTaskIdByFunc(runtime, 'Task_FCOpenOrCloseInfoBox') !== TASK_NONE) return;
  const currentTask = task(runtime, taskId);
  if ((runtime.newKeys & SELECT_BUTTON) !== 0 && !data(runtime).inPickMode && data(runtime).savedCallback !== 'CB2_BagMenuFromStartMenu') {
    currentTask.func = 'Task_StartToCloseFameChecker';
  } else if ((runtime.newKeys & START_BUTTON) !== 0) {
    const cursorPos = FameCheckerGetCursorY(runtime);
    if (TryExitPickMode(runtime, taskId)) {
      op(runtime, 'PlaySE(SE_M_LOCK_ON)');
    } else if (cursorPos !== data(runtime).numUnlockedPersons - 1) {
      op(runtime, 'PlaySE(SE_M_LOCK_ON)');
      UpdateInfoBoxTilemap(runtime, 2, 4);
      UpdateInfoBoxTilemap(runtime, 1, 5);
      PrintUIHelp(runtime, 1);
      currentTask.data[2] = CreatePersonPicSprite(runtime, data(runtime).unlockedPersons[cursorPos]!);
      sprite(runtime, currentTask.data[2]!).x2 = 0xf0;
      sprite(runtime, currentTask.data[2]!).data[0] = 1;
      currentTask.data[3] = CreateSpinningPokeballSprite(runtime);
      sprite(runtime, currentTask.data[3]!).x2 = 0xf0;
      sprite(runtime, currentTask.data[3]!).data[0] = 1;
      currentTask.func = 'Task_EnterPickMode';
    }
  } else if ((runtime.newKeys & A_BUTTON) !== 0) {
    const cursorPos = ListMenu_ProcessInput(runtime);
    if (cursorPos === data(runtime).numUnlockedPersons - 1) currentTask.func = 'Task_StartToCloseFameChecker';
    else if (data(runtime).inPickMode) {
      if (!runtime.textPrinterActive && HasUnlockedAllFlavorTextsForCurrentPerson(runtime)) GetPickModeText(runtime);
    } else if (data(runtime).personHasUnlockedPanels) {
      op(runtime, 'PlaySE(SE_SELECT)');
      currentTask.data[0] = CreateFlavorTextIconSelectorCursorSprite(runtime, currentTask.data[1]);
      for (let i = 0; i < 6; i++) if (i !== currentTask.data[1]) SetMessageSelectorIconObjMode(runtime, data(runtime).spriteIds[i]!, 1);
      runtime.gIconDescriptionBoxIsOpen = 0xff;
      PlaceListMenuCursor(runtime, false);
      PrintUIHelp(runtime, 2);
      if (sprite(runtime, data(runtime).spriteIds[currentTask.data[1]]!).data[1] !== 0xff) {
        PrintSelectedNameInBrightGreen(runtime, taskId);
        UpdateIconDescriptionBox(runtime, currentTask.data[1]);
      }
      FreeListMenuSelectorArrowPairResources(runtime);
      currentTask.func = 'Task_FlavorTextDisplayHandleInput';
    }
  } else if ((runtime.newKeys & B_BUTTON) !== 0) {
    if (!TryExitPickMode(runtime, taskId)) currentTask.func = 'Task_StartToCloseFameChecker';
  } else {
    ListMenu_ProcessInput(runtime);
  }
};

export const TryExitPickMode = (runtime: FameCheckerRuntime, taskId: number): boolean => {
  if (data(runtime).inPickMode) {
    const currentTask = task(runtime, taskId);
    sprite(runtime, currentTask.data[2]!).data[0] = 2;
    sprite(runtime, currentTask.data[2]!).x2 += 10;
    sprite(runtime, currentTask.data[3]!).data[0] = 2;
    sprite(runtime, currentTask.data[3]!).x2 += 10;
    WipeMsgBoxAndTransfer(runtime);
    currentTask.func = 'Task_ExitPickMode';
    MessageBoxPrintEmptyText(runtime);
    data(runtime).pickModeOverCancel = false;
    return true;
  }
  return false;
};

export const Task_EnterPickMode = (runtime: FameCheckerRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  if (sprite(runtime, currentTask.data[2]!).data[0] === 0) {
    GetPickModeText(runtime);
    data(runtime).inPickMode = true;
    currentTask.func = 'Task_TopMenuHandleInput';
  } else {
    ChangeBgX(runtime, 1, 0xa00, 1);
  }
};

export const Task_ExitPickMode = (runtime: FameCheckerRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  if (runtime.bgX[1] !== 0) ChangeBgX(runtime, 1, 0xa00, 2);
  else ChangeBgX(runtime, 1, 0, 0);
  if (sprite(runtime, currentTask.data[2]!).data[0] === 0) {
    if (data(runtime).personHasUnlockedPanels) PrintUIHelp(runtime, 0);
    UpdateInfoBoxTilemap(runtime, 1, 4);
    UpdateInfoBoxTilemap(runtime, 2, 2);
    data(runtime).inPickMode = false;
    DestroyPersonPicSprite(runtime, taskId, FameCheckerGetCursorY(runtime));
    currentTask.func = 'Task_TopMenuHandleInput';
    sprite(runtime, currentTask.data[3]!).callback = 'SpriteCB_DestroySpinningPokeball';
  }
};

export const Task_FlavorTextDisplayHandleInput = (runtime: FameCheckerRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  if ((runtime.newKeys & A_BUTTON) !== 0 && !runtime.textPrinterActive) {
    if (sprite(runtime, data(runtime).spriteIds[currentTask.data[1]]!).data[1] !== 0xff) PrintSelectedNameInBrightGreen(runtime, taskId);
  }
  if ((runtime.newKeys & B_BUTTON) !== 0) {
    op(runtime, 'PlaySE(SE_SELECT)');
    for (let i = 0; i < 6; i++) SetMessageSelectorIconObjMode(runtime, data(runtime).spriteIds[i]!, 0);
    WipeMsgBoxAndTransfer(runtime);
    sprite(runtime, currentTask.data[0]!).callback = 'SpriteCB_DestroyFlavorTextIconSelectorCursor';
    if (runtime.gIconDescriptionBoxIsOpen !== 0xff) UpdateIconDescriptionBoxOff(runtime);
    PlaceListMenuCursor(runtime, true);
    PrintUIHelp(runtime, 0);
    FC_CreateScrollIndicatorArrowPair(runtime);
    MessageBoxPrintEmptyText(runtime);
    currentTask.func = 'Task_TopMenuHandleInput';
  } else if ((runtime.newKeys & (DPAD_UP | DPAD_DOWN)) !== 0) {
    if (currentTask.data[1] >= 3) {
      currentTask.data[1] -= 3;
      FC_MoveSelectorCursor(runtime, taskId, 0, -0x1b);
    } else {
      currentTask.data[1] += 3;
      FC_MoveSelectorCursor(runtime, taskId, 0, 0x1b);
    }
  } else if ((runtime.newKeys & DPAD_LEFT) !== 0) {
    if (currentTask.data[1] === 0 || currentTask.data[1] % 3 === 0) {
      currentTask.data[1] += 2;
      FC_MoveSelectorCursor(runtime, taskId, 0x5e, 0);
    } else {
      currentTask.data[1]--;
      FC_MoveSelectorCursor(runtime, taskId, -0x2f, 0);
    }
  } else if ((runtime.newKeys & DPAD_RIGHT) !== 0) {
    if ((currentTask.data[1] + 1) % 3 === 0) {
      currentTask.data[1] -= 2;
      FC_MoveSelectorCursor(runtime, taskId, -0x5e, 0);
    } else {
      currentTask.data[1]++;
      FC_MoveSelectorCursor(runtime, taskId, 0x2f, 0);
    }
  }
};

export const FC_MoveSelectorCursor = (runtime: FameCheckerRuntime, taskId: number, dx: number, dy: number): void => {
  const currentTask = task(runtime, taskId);
  op(runtime, 'PlaySE(SE_M_SWAGGER2)');
  sprite(runtime, currentTask.data[0]!).x += dx;
  sprite(runtime, currentTask.data[0]!).y += dy;
  for (let i = 0; i < 6; i++) SetMessageSelectorIconObjMode(runtime, data(runtime).spriteIds[i]!, 1);
  MessageBoxPrintEmptyText(runtime);
  if (SetMessageSelectorIconObjMode(runtime, data(runtime).spriteIds[currentTask.data[1]]!, 0)) {
    PrintSelectedNameInBrightGreen(runtime, taskId);
    UpdateIconDescriptionBox(runtime, currentTask.data[1]);
  } else if (runtime.gIconDescriptionBoxIsOpen !== 0xff) {
    UpdateIconDescriptionBoxOff(runtime);
  }
};

export const GetPickModeText = (runtime: FameCheckerRuntime): void => {
  let whichText = 0;
  const who = FameCheckerGetCursorY(runtime);
  const person = data(runtime).unlockedPersons[who]!;
  if (runtime.fameCheckerSave[person]!.pickState !== FCPICKSTATE_COLORED) {
    WipeMsgBoxAndTransfer(runtime);
    MessageBoxPrintEmptyText(runtime);
  } else {
    if (HasUnlockedAllFlavorTextsForCurrentPerson(runtime)) whichText = NUM_FAMECHECKER_PERSONS;
    const text = whichText === 0 ? sFameCheckerPersonNames[person]! : sFameCheckerPersonQuotes[person]!;
    print(runtime, FCWINDOWID_MSGBOX, text, 'dark-gray');
  }
};

export const PrintSelectedNameInBrightGreen = (runtime: FameCheckerRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  const cursorPos = FameCheckerGetCursorY(runtime);
  const idx = data(runtime).unlockedPersons[cursorPos]! * 6 + currentTask.data[1];
  print(runtime, FCWINDOWID_MSGBOX, sFameCheckerFlavorTextPointers[idx]!, 'dark-gray');
};

export const MessageBoxPrintEmptyText = (runtime: FameCheckerRuntime): void => print(runtime, FCWINDOWID_MSGBOX, 'gFameCheckerText_ClearTextbox', 'dark-gray');
export const WipeMsgBoxAndTransfer = (runtime: FameCheckerRuntime): void => op(runtime, 'WipeMsgBoxAndTransfer');
export const Setup_DrawMsgAndListBoxes = (runtime: FameCheckerRuntime): void => op(runtime, 'Setup_DrawMsgAndListBoxes');
export const LoadUISpriteSheetsAndPalettes = (runtime: FameCheckerRuntime): void => op(runtime, 'LoadUISpriteSheetsAndPalettes');
export const FC_PutWindowTilemapAndCopyWindowToVramMode3 = (
  runtime: FameCheckerRuntime,
  windowId: number
): void => {
  op(runtime, `PutWindowTilemap(${windowId})`);
  op(runtime, `CopyWindowToVram(${windowId},COPYWIN_FULL)`);
};

export const SetMessageSelectorIconObjMode = (runtime: FameCheckerRuntime, spriteId: number, objMode: number): boolean => {
  const currentSprite = sprite(runtime, spriteId);
  if (currentSprite.data[1] !== 0xff) {
    currentSprite.oam.objMode = objMode;
    return true;
  }
  return false;
};

export const Task_StartToCloseFameChecker = (runtime: FameCheckerRuntime, taskId: number): void => {
  op(runtime, 'PlaySE(SE_M_SWIFT)');
  op(runtime, 'BeginNormalPaletteFade(PALETTES_ALL,0,0,16,0)');
  task(runtime, taskId).func = 'Task_DestroyAssetsAndCloseFameChecker';
};

export const Task_DestroyAssetsAndCloseFameChecker = (runtime: FameCheckerRuntime, taskId: number): void => {
  if (runtime.paletteFadeActive) return;
  if (data(runtime).inPickMode) {
    DestroyPersonPicSprite(runtime, taskId, FameCheckerGetCursorY(runtime));
    DestroySprite(runtime, task(runtime, taskId).data[3]!);
  }
  for (let i = 0; i < 6; i++) DestroySprite(runtime, data(runtime).spriteIds[i]!);
  runtime.mainCallback = data(runtime).savedCallback;
  runtime.sFameCheckerData = null;
  runtime.sListMenuItems = [];
  op(runtime, 'FreeAllWindowBuffers');
  DestroyTask(runtime, taskId);
};

export const FC_DestroyWindow = (
  runtime: FameCheckerRuntime,
  windowId: number
): void => {
  op(runtime, `FillWindowPixelBuffer(${windowId},0)`);
  op(runtime, `ClearWindowTilemap(${windowId})`);
  op(runtime, `CopyWindowToVram(${windowId},COPYWIN_GFX)`);
  op(runtime, `RemoveWindow(${windowId})`);
};

export const AdjustGiovanniIndexIfBeatenInGym = (runtime: FameCheckerRuntime, value: number): number => {
  if (runtime.trainerBeenFought.has(111)) {
    if (value === 9) return FAMECHECKER_GIOVANNI;
    if (value > 9) return value - 1;
  }
  return value;
};

export const PrintUIHelp = (runtime: FameCheckerRuntime, state: number): void => {
  const text = state === 0 ? 'gFameCheckerText_MainScreenUI' : state === 1 ? 'gFameCheckerText_PickScreenUI' : 'gFameCheckerText_FlavorTextUI';
  print(runtime, FCWINDOWID_UIHELP, text, 'white', 188 - text.length, 0);
};

export const DestroyAllFlavorTextIcons = (runtime: FameCheckerRuntime): void => {
  for (let i = 0; i < 6; i++) DestroySprite(runtime, data(runtime).spriteIds[i]!);
};

export const CreateAllFlavorTextIcons = (runtime: FameCheckerRuntime, who: number): boolean => {
  let result = false;
  const person = data(runtime).unlockedPersons[who] ?? who;
  for (let i = 0; i < 6; i++) {
    if (((runtime.fameCheckerSave[person]!.flavorTextFlags >> i) & 1) !== 0) {
      data(runtime).spriteIds[i] = CreateFameCheckerObject(runtime, sFameCheckerArrayNpcGraphicsIds[person * 6 + i]!, i, 47 * (i % 3) + 0x72, 27 * Math.trunc(i / 3) + 0x2f);
      result = true;
    } else {
      data(runtime).spriteIds[i] = PlaceQuestionMarkTile(runtime, 47 * (i % 3) + 0x72, 27 * Math.trunc(i / 3) + 0x1f);
      sprite(runtime, data(runtime).spriteIds[i]!).data[1] = 0xff;
    }
  }
  data(runtime).personHasUnlockedPanels = result;
  PrintUIHelp(runtime, result && !data(runtime).inPickMode ? 0 : 1);
  return result;
};

export const ResetFameChecker = (runtime: FameCheckerRuntime): void => {
  for (let i = 0; i < NUM_FAMECHECKER_PERSONS; i++) {
    runtime.fameCheckerSave[i]!.pickState = FCPICKSTATE_NO_DRAW;
    runtime.fameCheckerSave[i]!.flavorTextFlags = 0;
    runtime.fameCheckerSave[i]!.unk_0_E = 0;
  }
  runtime.fameCheckerSave[FAMECHECKER_OAK]!.pickState = FCPICKSTATE_COLORED;
};

export const FullyUnlockFameChecker = (runtime: FameCheckerRuntime): void => {
  for (let i = 0; i < NUM_FAMECHECKER_PERSONS; i++) {
    runtime.fameCheckerSave[i]!.pickState = FCPICKSTATE_COLORED;
    for (let j = 0; j < 6; j++) runtime.fameCheckerSave[i]!.flavorTextFlags |= 1 << j;
  }
};

export const SetFlavorTextFlagFromSpecialVars = (runtime: FameCheckerRuntime): void => {
  if (runtime.specialVar8004 < NUM_FAMECHECKER_PERSONS && runtime.specialVar8005 < 6) {
    runtime.fameCheckerSave[runtime.specialVar8004]!.flavorTextFlags |= 1 << runtime.specialVar8005;
    runtime.specialVar8005 = FCPICKSTATE_SILHOUETTE;
    UpdatePickStateFromSpecialVar8005(runtime);
  }
};

export const UpdatePickStateFromSpecialVar8005 = (runtime: FameCheckerRuntime): void => {
  if (runtime.specialVar8004 < NUM_FAMECHECKER_PERSONS && runtime.specialVar8005 < 3) {
    if (runtime.specialVar8005 === FCPICKSTATE_NO_DRAW) return;
    if (runtime.specialVar8005 === FCPICKSTATE_SILHOUETTE && runtime.fameCheckerSave[runtime.specialVar8004]!.pickState === FCPICKSTATE_COLORED) return;
    runtime.fameCheckerSave[runtime.specialVar8004]!.pickState = runtime.specialVar8005;
  }
};

export const HasUnlockedAllFlavorTextsForCurrentPerson = (runtime: FameCheckerRuntime): boolean => {
  const who = data(runtime).unlockedPersons[FameCheckerGetCursorY(runtime)]!;
  for (let i = 0; i < 6; i++) if (((runtime.fameCheckerSave[who]!.flavorTextFlags >> i) & 1) === 0) return false;
  return true;
};

export const CreateFlavorTextIconSelectorCursorSprite = (runtime: FameCheckerRuntime, where: number): number => {
  const y = 34 + 27 * (where >= 3 ? 1 : 0);
  const x = 114 + 47 * (where % 3);
  return CreateSprite(runtime, 'SelectorCursor', x, y);
};

export const FreeSelectionCursorSpriteResources = (
  runtime: FameCheckerRuntime
): void => {
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_SELECTOR_CURSOR)');
  op(runtime, 'FreeSpritePaletteByTag(SPRITETAG_SELECTOR_CURSOR)');
};

export const SpriteCB_DestroyFlavorTextIconSelectorCursor = (
  runtime: FameCheckerRuntime,
  spriteId: number
): void => {
  DestroySprite(runtime, spriteId);
};

export const PlaceQuestionMarkTile = (runtime: FameCheckerRuntime, x: number, y: number): number => {
  const spriteId = CreateSprite(runtime, 'QuestionMark', x, y);
  sprite(runtime, spriteId).oam.priority = 2;
  sprite(runtime, spriteId).oam.paletteNum = 2;
  return spriteId;
};

export const FreeQuestionMarkSpriteResources = (
  runtime: FameCheckerRuntime
): void => {
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_QUESTION_MARK)');
};

export const FreeSpinningPokeballSpriteResources = (
  runtime: FameCheckerRuntime
): void => {
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_SPINNING_POKEBALL)');
  op(runtime, 'FreeSpritePaletteByTag(SPRITETAG_SPINNING_POKEBALL)');
};

export const CreateSpinningPokeballSprite = (runtime: FameCheckerRuntime): number => CreateSprite(runtime, 'SpinningPokeball', 0xe2, 0x42);

export const SpriteCB_DestroySpinningPokeball = (
  runtime: FameCheckerRuntime,
  spriteId: number
): void => {
  op(runtime, `FreeSpriteOamMatrix(${spriteId})`);
  DestroySprite(runtime, spriteId);
};

export const FreeNonTrainerPicTiles = (runtime: FameCheckerRuntime): void => {
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_DAISY)');
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_FUJI)');
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_OAK)');
  op(runtime, 'FreeSpriteTilesByTag(SPRITETAG_BILL)');
};

export const SpriteCB_FCSpinningPokeball = (runtime: FameCheckerRuntime, spriteId: number): void => {
  const current = sprite(runtime, spriteId);
  if (current.data[0] === 1) {
    if (current.x2 - 10 < 0) {
      current.x2 = 0;
      current.data[0] = 0;
    } else current.x2 -= 10;
  } else if (current.data[0] === 2) {
    if (current.x2 > 240) {
      current.x2 = 240;
      current.data[0] = 0;
    } else current.x2 += 10;
  }
};

export const CreatePersonPicSprite = (runtime: FameCheckerRuntime, fcPersonIdx: number): number => {
  const template = fcPersonIdx === FAMECHECKER_DAISY ? 'Daisy' : fcPersonIdx === FAMECHECKER_MRFUJI ? 'Fuji' : fcPersonIdx === FAMECHECKER_OAK ? 'Oak' : fcPersonIdx === FAMECHECKER_BILL ? 'Bill' : 'TrainerPic';
  const spriteId = CreateSprite(runtime, template, 148, 66);
  sprite(runtime, spriteId).callback = 'SpriteCB_FCSpinningPokeball';
  sprite(runtime, spriteId).oam.paletteNum = 6;
  if (runtime.fameCheckerSave[fcPersonIdx]!.pickState === FCPICKSTATE_SILHOUETTE) op(runtime, 'LoadPalette(sSilhouettePalette)');
  return spriteId;
};

export const DestroyPersonPicSprite = (runtime: FameCheckerRuntime, taskId: number, who: number): void => {
  let whoCopy = who;
  if (who === data(runtime).numUnlockedPersons - 1) whoCopy = who - 1;
  const person = data(runtime).unlockedPersons[whoCopy]!;
  const spriteId = task(runtime, taskId).data[2]!;
  if (person === FAMECHECKER_DAISY || person === FAMECHECKER_MRFUJI || person === FAMECHECKER_OAK || person === FAMECHECKER_BILL) DestroySprite(runtime, spriteId);
  else op(runtime, `FreeAndDestroyTrainerPicSprite(${spriteId})`);
};

export const UpdateIconDescriptionBox = (runtime: FameCheckerRuntime, whichText: number): void => {
  const idx = 6 * data(runtime).unlockedPersons[FameCheckerGetCursorY(runtime)]! + whichText;
  HandleFlavorTextModeSwitch(runtime, true);
  runtime.gIconDescriptionBoxIsOpen = 1;
  print(runtime, FCWINDOWID_ICONDESC, sFlavorTextOriginLocationTexts[idx]!, 'dark-grey');
  print(runtime, FCWINDOWID_ICONDESC, sFlavorTextOriginObjectNameTexts[idx]!, 'dark-grey');
};

export const UpdateIconDescriptionBoxOff = (runtime: FameCheckerRuntime): void => {
  HandleFlavorTextModeSwitch(runtime, false);
  runtime.gIconDescriptionBoxIsOpen = 0xff;
};

export const FC_CreateListMenu = (runtime: FameCheckerRuntime): void => {
  InitListMenuTemplate(runtime);
  data(runtime).numUnlockedPersons = FC_PopulateListMenu(runtime);
  data(runtime).listMenuTaskId = 0;
  op(runtime, 'ListMenuInit');
};

export const InitListMenuTemplate = (runtime: FameCheckerRuntime): void => {
  runtime.gFameChecker_ListMenuTemplate = { totalItems: 1, maxShowed: 1, windowId: FCWINDOWID_LIST, item_X: 8, cursor_X: 0, upText_Y: 4, fontId: 2, cursorKind: 0 };
};

export const FC_MoveCursorFunc = (runtime: FameCheckerRuntime, itemIndex: number, onInit: boolean): void => {
  runtime.sLastMenuIdx = 0;
  const personIdx = data(runtime).listMenuTopIdx2 + data(runtime).listMenuDrawnSelIdx;
  FC_DoMoveCursor(runtime, itemIndex, onInit);
  const taskId = FindTaskIdByFunc(runtime, 'Task_TopMenuHandleInput');
  if (taskId !== TASK_NONE) {
    const currentTask = task(runtime, taskId);
    op(runtime, 'PlaySE(SE_SELECT)');
    currentTask.data[1] = 0;
    data(runtime).listMenuTopIdx = runtime.listMenuTop;
    if (itemIndex !== data(runtime).numUnlockedPersons - 1) {
      DestroyAllFlavorTextIcons(runtime);
      CreateAllFlavorTextIcons(runtime, itemIndex);
      if (data(runtime).inPickMode) {
        if (!data(runtime).pickModeOverCancel) {
          DestroyPersonPicSprite(runtime, taskId, personIdx);
          runtime.sLastMenuIdx = itemIndex;
          currentTask.func = 'Task_SwitchToPickMode';
        } else {
          sprite(runtime, currentTask.data[2]!).invisible = false;
          data(runtime).pickModeOverCancel = false;
          sprite(runtime, currentTask.data[2]!).data[0] = 0;
          GetPickModeText(runtime);
        }
      } else {
        WipeMsgBoxAndTransfer(runtime);
      }
    } else {
      PrintCancelDescription(runtime);
      if (data(runtime).inPickMode) {
        sprite(runtime, currentTask.data[2]!).invisible = true;
        data(runtime).pickModeOverCancel = true;
      } else {
        for (let i = 0; i < 6; i++) sprite(runtime, data(runtime).spriteIds[i]!).invisible = true;
      }
    }
  }
};

export const Task_SwitchToPickMode = (runtime: FameCheckerRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  currentTask.data[2] = CreatePersonPicSprite(runtime, data(runtime).unlockedPersons[runtime.sLastMenuIdx]!);
  sprite(runtime, currentTask.data[2]!).data[0] = 0;
  GetPickModeText(runtime);
  currentTask.func = 'Task_TopMenuHandleInput';
};

export const PrintCancelDescription = (runtime: FameCheckerRuntime): void => print(runtime, FCWINDOWID_MSGBOX, 'gFameCheckerText_FameCheckerWillBeClosed', 'dark-gray');

export const FC_DoMoveCursor = (runtime: FameCheckerRuntime, itemIndex: number, onInit: boolean): void => {
  const listY = runtime.listMenuTop;
  const cursorY = runtime.listMenuRow;
  const who = listY + cursorY;
  print(runtime, FCWINDOWID_LIST, runtime.sListMenuItems[itemIndex]?.label ?? '', 'green', 8, 14 * cursorY + 4);
  if (!onInit) {
    if (listY < data(runtime).listMenuTopIdx2) data(runtime).listMenuDrawnSelIdx++;
    else if (listY > data(runtime).listMenuTopIdx2 && who !== data(runtime).numUnlockedPersons - 1) data(runtime).listMenuDrawnSelIdx--;
    print(runtime, FCWINDOWID_LIST, runtime.sListMenuItems[data(runtime).listMenuCurIdx]?.label ?? '', 'dark-grey', 8, 14 * data(runtime).listMenuDrawnSelIdx + 4);
  }
  data(runtime).listMenuCurIdx = itemIndex;
  data(runtime).listMenuDrawnSelIdx = cursorY;
  data(runtime).listMenuTopIdx2 = listY;
};

export const FC_PopulateListMenu = (runtime: FameCheckerRuntime): number => {
  let nitems = 0;
  for (let i = 0; i < NUM_FAMECHECKER_PERSONS; i++) {
    const fameCheckerIdx = AdjustGiovanniIndexIfBeatenInGym(runtime, i);
    if (runtime.fameCheckerSave[fameCheckerIdx]!.pickState !== FCPICKSTATE_NO_DRAW) {
      const trainerIdx = sTrainerIdxs[fameCheckerIdx]!;
      runtime.sListMenuItems[nitems] = {
        label: trainerIdx < FC_NONTRAINER_START ? runtime.trainerNames[trainerIdx]! : runtime.nonTrainerNames[trainerIdx - FC_NONTRAINER_START]!,
        index: nitems
      };
      data(runtime).unlockedPersons[nitems] = fameCheckerIdx;
      nitems++;
    }
  }
  runtime.sListMenuItems[nitems] = { label: 'Cancel', index: nitems };
  data(runtime).unlockedPersons[nitems] = 0xff;
  nitems++;
  runtime.gFameChecker_ListMenuTemplate.totalItems = nitems;
  runtime.gFameChecker_ListMenuTemplate.maxShowed = nitems < 5 ? nitems : 5;
  return nitems;
};

export const FC_CreateScrollIndicatorArrowPair = (runtime: FameCheckerRuntime): void => {
  if (data(runtime).numUnlockedPersons > 5) {
    data(runtime).scrollIndicatorPairTaskId = 1;
    op(runtime, `AddScrollIndicatorArrowPair(${data(runtime).numUnlockedPersons - 5})`);
  }
};

export const FreeListMenuSelectorArrowPairResources = (runtime: FameCheckerRuntime): void => {
  if (data(runtime).numUnlockedPersons > 5) op(runtime, `RemoveScrollIndicatorArrowPair(${data(runtime).scrollIndicatorPairTaskId})`);
};

export const FC_PutWindowTilemapAndCopyWindowToVramMode3_2 =
  FC_PutWindowTilemapAndCopyWindowToVramMode3;

export const FameCheckerGetCursorY = (runtime: FameCheckerRuntime): number => runtime.listMenuTop + runtime.listMenuRow;

export const HandleFlavorTextModeSwitch = (runtime: FameCheckerRuntime, state: boolean): void => {
  if (data(runtime).viewingFlavorText !== state) {
    let taskId = FindTaskIdByFunc(runtime, 'Task_FCOpenOrCloseInfoBox');
    if (taskId === TASK_NONE) taskId = CreateTask(runtime, 'Task_FCOpenOrCloseInfoBox');
    const currentTask = task(runtime, taskId);
    currentTask.data[0] = 0;
    currentTask.data[1] = 4;
    if (state) {
      currentTask.data[2] = 1;
      data(runtime).viewingFlavorText = true;
    } else {
      currentTask.data[2] = 4;
      data(runtime).viewingFlavorText = false;
    }
  }
};

export const Task_FCOpenOrCloseInfoBox = (runtime: FameCheckerRuntime, taskId: number): void => {
  const currentTask = task(runtime, taskId);
  switch (currentTask.data[0]) {
    case 0:
      if (--currentTask.data[1] === 0) {
        UpdateInfoBoxTilemap(runtime, 1, 0);
        currentTask.data[1] = 4;
        currentTask.data[0]++;
      }
      break;
    case 1:
      if (--currentTask.data[1] === 0) {
        UpdateInfoBoxTilemap(runtime, 1, currentTask.data[2]);
        DestroyTask(runtime, taskId);
      }
      break;
  }
};

export const UpdateInfoBoxTilemap = (runtime: FameCheckerRuntime, bg: number, state: number): void => {
  runtime.infoBoxUpdates.push({ bg, state });
  op(runtime, `UpdateInfoBoxTilemap(${bg},${state})`);
};

export const PlaceListMenuCursor = (runtime: FameCheckerRuntime, isActive: boolean): void => {
  print(runtime, FCWINDOWID_LIST, 'gText_SelectorArrow2', isActive ? 'dark-grey' : 'white', 0, 14 * runtime.listMenuRow + 4);
};

export const CreateFameCheckerObject = (runtime: FameCheckerRuntime, gfxId: number, index: number, x: number, y: number): number => {
  const spriteId = CreateSprite(runtime, `FameCheckerObject(${gfxId})`, x, y);
  sprite(runtime, spriteId).data[1] = index;
  return spriteId;
};

const ListMenu_ProcessInput = (runtime: FameCheckerRuntime): number => runtime.listMenuInput;

const ChangeBgX = (runtime: FameCheckerRuntime, bg: number, value: number, opMode: number): void => {
  if (opMode === 0) runtime.bgX[bg] = value;
  else if (opMode === 1) runtime.bgX[bg] += value;
  else if (opMode === 2) runtime.bgX[bg] = Math.max(0, runtime.bgX[bg] - value);
};

export const FCSetup_ClearVideoRegisters = (runtime: FameCheckerRuntime): void => op(runtime, 'FCSetup_ClearVideoRegisters');
export const FCSetup_ResetTasksAndSpriteResources = (runtime: FameCheckerRuntime): void => {
  runtime.tasks = [];
  runtime.sprites = [];
  op(runtime, 'FCSetup_ResetTasksAndSpriteResources');
};
export const FCSetup_TurnOnDisplay = (runtime: FameCheckerRuntime): void => op(runtime, 'FCSetup_TurnOnDisplay');
export const FCSetup_ResetBGCoords = (runtime: FameCheckerRuntime): void => {
  runtime.bgX = [0, 0, 0, 0];
  op(runtime, 'FCSetup_ResetBGCoords');
};
