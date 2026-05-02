export const STARTMENU_POKEDEX = 0;
export const STARTMENU_POKEMON = 1;
export const STARTMENU_BAG = 2;
export const STARTMENU_PLAYER = 3;
export const STARTMENU_SAVE = 4;
export const STARTMENU_OPTION = 5;
export const STARTMENU_EXIT = 6;
export const STARTMENU_RETIRE = 7;
export const STARTMENU_PLAYER2 = 8;
export const MAX_STARTMENU_ITEMS = 9;

export const SAVECB_RETURN_CONTINUE = 0;
export const SAVECB_RETURN_OKAY = 1;
export const SAVECB_RETURN_CANCEL = 2;
export const SAVECB_RETURN_ERROR = 3;

export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_INVALID = 2;
export const SAVE_OVERWRITE_DIFFERENT_FILE = 0;
export const SAVE_NORMAL = 1;

export const OPTIONS_BUTTON_MODE_HELP = 0;
export const FADE_TO_BLACK = 1;
export const SE_SELECT = 5;
export const SE_SAVE = 42;
export const SE_BOO = 43;
export const RGB_BLACK = 0;
export const PALETTES_ALL = 0xffffffff;
export const REG_OFFSET_DISPCNT = 0;

export type StartMenuCallbackName =
  | 'StartCB_HandleInput'
  | 'StartMenuPokedexCallback'
  | 'StartMenuPokemonCallback'
  | 'StartMenuBagCallback'
  | 'StartMenuPlayerCallback'
  | 'StartMenuSaveCallback'
  | 'StartMenuOptionCallback'
  | 'StartMenuExitCallback'
  | 'StartMenuSafariZoneRetireCallback'
  | 'StartMenuLinkPlayerCallback'
  | 'StartCB_Save1'
  | 'StartCB_Save2';

export type SaveDialogCallbackName =
  | 'SaveDialogCB_PrintAskSaveText'
  | 'SaveDialogCB_AskSavePrintYesNoMenu'
  | 'SaveDialogCB_AskSaveHandleInput'
  | 'SaveDialogCB_PrintAskOverwriteText'
  | 'SaveDialogCB_AskOverwritePrintYesNoMenu'
  | 'SaveDialogCB_AskReplacePreviousFilePrintYesNoMenu'
  | 'SaveDialogCB_AskOverwriteOrReplacePreviousFileHandleInput'
  | 'SaveDialogCB_PrintSavingDontTurnOffPower'
  | 'SaveDialogCB_DoSave'
  | 'SaveDialogCB_PrintSaveResult'
  | 'SaveDialogCB_WaitPrintSuccessAndPlaySE'
  | 'SaveDialogCB_ReturnSuccess'
  | 'SaveDialogCB_WaitPrintErrorAndPlaySE'
  | 'SaveDialogCB_ReturnError';

export interface StartMenuTask {
  func: string;
  followupFunc?: string;
  data: number[];
  priority: number;
}

export interface StartMenuInput {
  dpadUp?: boolean;
  dpadDown?: boolean;
  a?: boolean;
  b?: boolean;
  start?: boolean;
  aHeld?: boolean;
}

export interface StartMenuRuntime {
  sStartMenuCallback: StartMenuCallbackName | null;
  sStartMenuCursorPos: number;
  sNumStartMenuItems: number;
  sStartMenuOrder: number[];
  sDrawStartMenuState: [number, number];
  sSafariZoneStatsWindowId: number;
  sSaveStatsWindowId: number;
  sSaveDialogCB: SaveDialogCallbackName;
  sSaveDialogDelay: number;
  sSaveDialogIsPrinting: boolean;
  tasks: StartMenuTask[];
  operations: string[];
  playedSoundEffects: number[];
  flags: Set<string>;
  input: StartMenuInput;
  isUpdateLinkStateCBActive: boolean;
  inUnionRoom: boolean;
  safariZoneFlag: boolean;
  menuHelpersLinkActive: boolean;
  optionsButtonMode: number;
  nationalPokedexCount: number;
  paletteFadeActive: boolean;
  gSaveFileStatus: number;
  gDifferentSaveFile: boolean;
  gSaveAttemptStatus: number;
  textPrinter0Active: boolean;
  menuInput: number;
  sePlaying: boolean;
  wirelessCommType: number;
  localLinkPlayerId: number;
  gMain: { state: number; savedCallback: string };
  gSpecialVar_Result: boolean;
  safariStepCounter: number;
  numSafariBalls: number;
  startMenuWindowId: number;
  nextWindowId: number;
  linkFullSaveActive: boolean;
}

export const sStartMenuActionTable = [
  { text: 'gText_MenuPokedex', callback: 'StartMenuPokedexCallback' },
  { text: 'gText_MenuPokemon', callback: 'StartMenuPokemonCallback' },
  { text: 'gText_MenuBag', callback: 'StartMenuBagCallback' },
  { text: 'gText_MenuPlayer', callback: 'StartMenuPlayerCallback' },
  { text: 'gText_MenuSave', callback: 'StartMenuSaveCallback' },
  { text: 'gText_MenuOption', callback: 'StartMenuOptionCallback' },
  { text: 'gText_MenuExit', callback: 'StartMenuExitCallback' },
  { text: 'gText_MenuRetire', callback: 'StartMenuSafariZoneRetireCallback' },
  { text: 'gText_MenuPlayer', callback: 'StartMenuLinkPlayerCallback' }
] as const satisfies readonly { text: string; callback: StartMenuCallbackName }[];

export const sSafariZoneStatsWindowTemplate = {
  bg: 0,
  tilemapLeft: 1,
  tilemapTop: 1,
  width: 10,
  height: 4,
  paletteNum: 15,
  baseBlock: 0x008
} as const;

export const sStartMenuDescPointers = [
  'gStartMenuDesc_Pokedex',
  'gStartMenuDesc_Pokemon',
  'gStartMenuDesc_Bag',
  'gStartMenuDesc_Player',
  'gStartMenuDesc_Save',
  'gStartMenuDesc_Option',
  'gStartMenuDesc_Exit',
  'gStartMenuDesc_Retire',
  'gStartMenuDesc_Player'
] as const;

export const sBGTemplates_AfterLinkSaveMessage = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0x000 }
] as const;

export const sWindowTemplates_AfterLinkSaveMessage = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 0x198 },
  null
] as const;

export const sSaveStatsWindowTemplate = {
  bg: 0,
  tilemapLeft: 1,
  tilemapTop: 1,
  width: 14,
  height: 9,
  paletteNum: 13,
  baseBlock: 0x008
} as const;

export const sTextColor_StatName = [1, 2, 3] as const;
export const sTextColor_StatValue = [1, 4, 5] as const;
export const sTextColor_LocationHeader = [1, 6, 7] as const;

export const createStartMenuRuntime = (): StartMenuRuntime => ({
  sStartMenuCallback: null,
  sStartMenuCursorPos: 0,
  sNumStartMenuItems: 0,
  sStartMenuOrder: Array(MAX_STARTMENU_ITEMS).fill(0),
  sDrawStartMenuState: [0, 0],
  sSafariZoneStatsWindowId: 0,
  sSaveStatsWindowId: 0,
  sSaveDialogCB: 'SaveDialogCB_PrintAskSaveText',
  sSaveDialogDelay: 0,
  sSaveDialogIsPrinting: false,
  tasks: [],
  operations: [],
  playedSoundEffects: [],
  flags: new Set(),
  input: {},
  isUpdateLinkStateCBActive: false,
  inUnionRoom: false,
  safariZoneFlag: false,
  menuHelpersLinkActive: false,
  optionsButtonMode: OPTIONS_BUTTON_MODE_HELP,
  nationalPokedexCount: 1,
  paletteFadeActive: false,
  gSaveFileStatus: SAVE_STATUS_EMPTY,
  gDifferentSaveFile: false,
  gSaveAttemptStatus: SAVE_STATUS_OK,
  textPrinter0Active: false,
  menuInput: -2,
  sePlaying: false,
  wirelessCommType: 0,
  localLinkPlayerId: 0,
  gMain: { state: 0, savedCallback: 'savedCallback' },
  gSpecialVar_Result: false,
  safariStepCounter: 0,
  numSafariBalls: 0,
  startMenuWindowId: 0,
  nextWindowId: 1,
  linkFullSaveActive: false
});

const op = (runtime: StartMenuRuntime, name: string): void => {
  runtime.operations.push(name);
};

export const setHasPokedexAndPokemon = (runtime: StartMenuRuntime): void => {
  runtime.flags.add('FLAG_SYS_POKEDEX_GET');
  runtime.flags.add('FLAG_SYS_POKEMON_GET');
};

export const appendToList = (list: number[], cursor: { value: number }, newEntry: number): void => {
  list[cursor.value] = newEntry;
  cursor.value++;
};

export const appendToStartMenuItems = (runtime: StartMenuRuntime, newEntry: number): void => {
  const cursor = { value: runtime.sNumStartMenuItems };
  appendToList(runtime.sStartMenuOrder, cursor, newEntry);
  runtime.sNumStartMenuItems = cursor.value;
};

export const setUpStartMenuNormalField = (runtime: StartMenuRuntime): void => {
  if (runtime.flags.has('FLAG_SYS_POKEDEX_GET')) appendToStartMenuItems(runtime, STARTMENU_POKEDEX);
  if (runtime.flags.has('FLAG_SYS_POKEMON_GET')) appendToStartMenuItems(runtime, STARTMENU_POKEMON);
  appendToStartMenuItems(runtime, STARTMENU_BAG);
  appendToStartMenuItems(runtime, STARTMENU_PLAYER);
  appendToStartMenuItems(runtime, STARTMENU_SAVE);
  appendToStartMenuItems(runtime, STARTMENU_OPTION);
  appendToStartMenuItems(runtime, STARTMENU_EXIT);
};

export const setUpStartMenuSafariZone = (runtime: StartMenuRuntime): void => {
  [STARTMENU_RETIRE, STARTMENU_POKEDEX, STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_OPTION, STARTMENU_EXIT]
    .forEach((entry) => appendToStartMenuItems(runtime, entry));
};

export const setUpStartMenuLink = (runtime: StartMenuRuntime): void => {
  [STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER2, STARTMENU_OPTION, STARTMENU_EXIT]
    .forEach((entry) => appendToStartMenuItems(runtime, entry));
};

export const setUpStartMenuUnionRoom = (runtime: StartMenuRuntime): void => {
  [STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_OPTION, STARTMENU_EXIT]
    .forEach((entry) => appendToStartMenuItems(runtime, entry));
};

export const setUpStartMenu = (runtime: StartMenuRuntime): void => {
  runtime.sNumStartMenuItems = 0;
  if (runtime.isUpdateLinkStateCBActive) setUpStartMenuLink(runtime);
  else if (runtime.inUnionRoom) setUpStartMenuUnionRoom(runtime);
  else if (runtime.safariZoneFlag) setUpStartMenuSafariZone(runtime);
  else setUpStartMenuNormalField(runtime);
};

export const drawSafariZoneStatsWindow = (runtime: StartMenuRuntime): void => {
  runtime.sSafariZoneStatsWindowId = runtime.nextWindowId++;
  op(runtime, `AddWindow(sSafariZoneStatsWindowTemplate) -> ${runtime.sSafariZoneStatsWindowId}`);
  op(runtime, `PutWindowTilemap(${runtime.sSafariZoneStatsWindowId})`);
  op(runtime, `DrawStdWindowFrame(${runtime.sSafariZoneStatsWindowId}, FALSE)`);
  op(runtime, `ConvertIntToDecimalStringN(gStringVar1, ${runtime.safariStepCounter}, RIGHT_ALIGN, 3)`);
  op(runtime, `ConvertIntToDecimalStringN(gStringVar1, ${runtime.safariStepCounter}, RIGHT_ALIGN, 3)`);
  op(runtime, 'ConvertIntToDecimalStringN(gStringVar2, 600, RIGHT_ALIGN, 3)');
  op(runtime, `ConvertIntToDecimalStringN(gStringVar3, ${runtime.numSafariBalls}, RIGHT_ALIGN, 2)`);
  op(runtime, 'StringExpandPlaceholders(gStringVar4, gText_MenuSafariStats)');
  op(runtime, `AddTextPrinterParameterized(${runtime.sSafariZoneStatsWindowId}, FONT_NORMAL, gStringVar4, 4, 3, 0xFF, NULL)`);
  op(runtime, `CopyWindowToVram(${runtime.sSafariZoneStatsWindowId}, COPYWIN_GFX)`);
};

export const destroySafariZoneStatsWindow = (runtime: StartMenuRuntime): void => {
  if (runtime.safariZoneFlag) {
    op(runtime, `ClearStdWindowAndFrameToTransparent(${runtime.sSafariZoneStatsWindowId}, FALSE)`);
    op(runtime, `CopyWindowToVram(${runtime.sSafariZoneStatsWindowId}, COPYWIN_GFX)`);
    op(runtime, `RemoveWindow(${runtime.sSafariZoneStatsWindowId})`);
  }
};

export const printStartMenuItems = (runtime: StartMenuRuntime, cursor: { value: number }, nitems: number): boolean => {
  let i = cursor.value;
  do {
    const entry = runtime.sStartMenuOrder[i];
    if (entry === STARTMENU_PLAYER || entry === STARTMENU_PLAYER2) {
      op(runtime, `Menu_PrintFormatIntlPlayerName(${runtime.startMenuWindowId}, ${sStartMenuActionTable[entry].text}, 8, ${i * 15})`);
    } else {
      op(runtime, `StringExpandPlaceholders(gStringVar4, ${sStartMenuActionTable[entry].text})`);
      op(runtime, `AddTextPrinterParameterized(${runtime.startMenuWindowId}, FONT_NORMAL, gStringVar4, 8, ${i * 15}, 0xFF, NULL)`);
    }
    i++;
    if (i >= runtime.sNumStartMenuItems) {
      cursor.value = i;
      return true;
    }
  } while (--nitems);
  cursor.value = i;
  return false;
};

export const doDrawStartMenu = (runtime: StartMenuRuntime): boolean => {
  switch (runtime.sDrawStartMenuState[0]) {
    case 0:
      runtime.sDrawStartMenuState[0]++;
      break;
    case 1:
      setUpStartMenu(runtime);
      runtime.sDrawStartMenuState[0]++;
      break;
    case 2:
      op(runtime, 'LoadStdWindowFrameGfx()');
      runtime.startMenuWindowId = 10 + runtime.sNumStartMenuItems;
      op(runtime, `CreateStartMenuWindow(${runtime.sNumStartMenuItems}) -> ${runtime.startMenuWindowId}`);
      op(runtime, `DrawStdWindowFrame(${runtime.startMenuWindowId}, FALSE)`);
      runtime.sDrawStartMenuState[0]++;
      break;
    case 3:
      if (runtime.safariZoneFlag) drawSafariZoneStatsWindow(runtime);
      runtime.sDrawStartMenuState[0]++;
      break;
    case 4: {
      const cursor = { value: runtime.sDrawStartMenuState[1] };
      if (printStartMenuItems(runtime, cursor, 2)) runtime.sDrawStartMenuState[0]++;
      runtime.sDrawStartMenuState[1] = cursor.value;
      break;
    }
    case 5:
      runtime.sStartMenuCursorPos = menuInitCursor(runtime, runtime.sStartMenuCursorPos);
      if (!runtime.menuHelpersLinkActive && !runtime.inUnionRoom && runtime.optionsButtonMode === OPTIONS_BUTTON_MODE_HELP) {
        op(runtime, `DrawHelpMessageWindowWithText(${sStartMenuDescPointers[runtime.sStartMenuOrder[runtime.sStartMenuCursorPos]]})`);
      }
      op(runtime, `CopyWindowToVram(${runtime.startMenuWindowId}, COPYWIN_MAP)`);
      return true;
  }
  return false;
};

export const drawStartMenuInOneGo = (runtime: StartMenuRuntime): void => {
  runtime.sDrawStartMenuState = [0, 0];
  while (!doDrawStartMenu(runtime)) {
    // C spins until the staged renderer completes.
  }
};

const createTask = (runtime: StartMenuRuntime, func: string, priority: number): number => {
  runtime.tasks.push({ func, priority, data: Array(16).fill(0) });
  return runtime.tasks.length - 1;
};

export const task50Startmenu = (runtime: StartMenuRuntime, taskId: number): void => {
  if (doDrawStartMenu(runtime)) switchTaskToFollowupFunc(runtime, taskId);
};

export const openStartMenuWithFollowupFunc = (runtime: StartMenuRuntime, func: string): number => {
  runtime.sDrawStartMenuState = [0, 0];
  const taskId = createTask(runtime, 'task50_startmenu', 80);
  runtime.tasks[taskId].followupFunc = func;
  return taskId;
};

export const fieldCB2DrawStartMenu = (runtime: StartMenuRuntime): boolean => {
  if (!doDrawStartMenu(runtime)) return false;
  op(runtime, 'FadeTransition_FadeInOnReturnToStartMenu()');
  return true;
};

export const setUpReturnToStartMenu = (runtime: StartMenuRuntime): void => {
  runtime.sDrawStartMenuState = [0, 0];
  op(runtime, 'gFieldCallback2 = FieldCB2_DrawStartMenu');
};

export const taskStartMenuHandleInput = (runtime: StartMenuRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      if (runtime.inUnionRoom) op(runtime, 'SetUsingUnionRoomStartMenu()');
      runtime.sStartMenuCallback = 'StartCB_HandleInput';
      data[0]++;
      break;
    case 1:
      if (runStartMenuCallback(runtime)) destroyTask(runtime, taskId);
      break;
  }
};

export const showStartMenu = (runtime: StartMenuRuntime): void => {
  if (!runtime.isUpdateLinkStateCBActive) {
    op(runtime, 'FreezeObjectEvents()');
    op(runtime, 'HandleEnforcedLookDirectionOnPlayerStopMoving()');
    op(runtime, 'StopPlayerAvatar()');
  }
  openStartMenuWithFollowupFunc(runtime, 'Task_StartMenuHandleInput');
  op(runtime, 'LockPlayerFieldControls()');
};

export const startCBHandleInput = (runtime: StartMenuRuntime): boolean => {
  if (runtime.input.dpadUp) {
    playSE(runtime, SE_SELECT);
    runtime.sStartMenuCursorPos = menuMoveCursor(runtime, -1);
    updateHelpForCursor(runtime);
  }
  if (runtime.input.dpadDown) {
    playSE(runtime, SE_SELECT);
    runtime.sStartMenuCursorPos = menuMoveCursor(runtime, +1);
    updateHelpForCursor(runtime);
  }
  if (runtime.input.a) {
    playSE(runtime, SE_SELECT);
    if (!startMenuPokedexSanityCheck(runtime)) return false;
    runtime.sStartMenuCallback = sStartMenuActionTable[runtime.sStartMenuOrder[runtime.sStartMenuCursorPos]].callback;
    startMenuFadeScreenIfLeavingOverworld(runtime);
    return false;
  }
  if (runtime.input.b || runtime.input.start) {
    destroySafariZoneStatsWindow(runtime);
    op(runtime, 'DestroyHelpMessageWindow_()');
    closeStartMenu(runtime);
    return true;
  }
  return false;
};

export const startMenuFadeScreenIfLeavingOverworld = (runtime: StartMenuRuntime): void => {
  if (
    runtime.sStartMenuCallback !== 'StartMenuSaveCallback'
    && runtime.sStartMenuCallback !== 'StartMenuExitCallback'
    && runtime.sStartMenuCallback !== 'StartMenuSafariZoneRetireCallback'
  ) {
    op(runtime, 'StopPokemonLeagueLightingEffectTask()');
    op(runtime, `FadeScreen(${FADE_TO_BLACK}, 0)`);
  }
};

export const startMenuPokedexSanityCheck = (runtime: StartMenuRuntime): boolean =>
  !(sStartMenuActionTable[runtime.sStartMenuOrder[runtime.sStartMenuCursorPos]].callback === 'StartMenuPokedexCallback' && runtime.nationalPokedexCount === 0);

const leaveToCallback = (runtime: StartMenuRuntime, callback: string, extra?: string): boolean => {
  if (!runtime.paletteFadeActive) {
    if (extra) op(runtime, extra);
    op(runtime, 'PlayRainStoppingSoundEffect()');
    destroySafariZoneStatsWindow(runtime);
    op(runtime, 'CleanupOverworldWindowsAndTilemaps()');
    op(runtime, callback);
    return true;
  }
  return false;
};

export const startMenuPokedexCallback = (runtime: StartMenuRuntime): boolean =>
  leaveToCallback(runtime, 'SetMainCallback2(CB2_OpenPokedexFromStartMenu)', 'IncrementGameStat(GAME_STAT_CHECKED_POKEDEX)');

export const startMenuPokemonCallback = (runtime: StartMenuRuntime): boolean =>
  leaveToCallback(runtime, 'SetMainCallback2(CB2_PartyMenuFromStartMenu)');

export const startMenuBagCallback = (runtime: StartMenuRuntime): boolean =>
  leaveToCallback(runtime, 'SetMainCallback2(CB2_BagMenuFromStartMenu)');

export const startMenuPlayerCallback = (runtime: StartMenuRuntime): boolean =>
  leaveToCallback(runtime, 'ShowPlayerTrainerCard(CB2_ReturnToFieldWithOpenMenu)');

export const startMenuSaveCallback = (runtime: StartMenuRuntime): boolean => {
  runtime.sStartMenuCallback = 'StartCB_Save1';
  return false;
};

export const startMenuOptionCallback = (runtime: StartMenuRuntime): boolean => {
  if (!runtime.paletteFadeActive) {
    op(runtime, 'PlayRainStoppingSoundEffect()');
    destroySafariZoneStatsWindow(runtime);
    op(runtime, 'CleanupOverworldWindowsAndTilemaps()');
    op(runtime, 'SetMainCallback2(CB2_OptionsMenuFromStartMenu)');
    runtime.gMain.savedCallback = 'CB2_ReturnToFieldWithOpenMenu';
    return true;
  }
  return false;
};

export const startMenuExitCallback = (runtime: StartMenuRuntime): boolean => {
  destroySafariZoneStatsWindow(runtime);
  op(runtime, 'DestroyHelpMessageWindow_()');
  closeStartMenu(runtime);
  return true;
};

export const startMenuSafariZoneRetireCallback = (runtime: StartMenuRuntime): boolean => {
  destroySafariZoneStatsWindow(runtime);
  op(runtime, 'DestroyHelpMessageWindow_()');
  closeStartMenu(runtime);
  op(runtime, 'SafariZoneRetirePrompt()');
  return true;
};

export const startMenuLinkPlayerCallback = (runtime: StartMenuRuntime): boolean => {
  if (!runtime.paletteFadeActive) {
    op(runtime, 'PlayRainStoppingSoundEffect()');
    op(runtime, 'CleanupOverworldWindowsAndTilemaps()');
    op(runtime, `ShowTrainerCardInLink(${runtime.localLinkPlayerId}, CB2_ReturnToFieldWithOpenMenu)`);
    return true;
  }
  return false;
};

export const startCBSave1 = (runtime: StartMenuRuntime): boolean => {
  op(runtime, 'BackupHelpContext()');
  op(runtime, 'SetHelpContext(HELPCONTEXT_SAVE)');
  startMenuPrepareForSave(runtime);
  runtime.sStartMenuCallback = 'StartCB_Save2';
  return false;
};

export const startCBSave2 = (runtime: StartMenuRuntime): boolean => {
  switch (runSaveDialogCB(runtime)) {
    case SAVECB_RETURN_CONTINUE:
      break;
    case SAVECB_RETURN_OKAY:
      op(runtime, 'ClearDialogWindowAndFrameToTransparent(0, TRUE)');
      op(runtime, 'ClearPlayerHeldMovementAndUnfreezeObjectEvents()');
      op(runtime, 'UnlockPlayerFieldControls()');
      op(runtime, 'RestoreHelpContext()');
      return true;
    case SAVECB_RETURN_CANCEL:
      op(runtime, 'ClearDialogWindowAndFrameToTransparent(0, FALSE)');
      drawStartMenuInOneGo(runtime);
      op(runtime, 'RestoreHelpContext()');
      runtime.sStartMenuCallback = 'StartCB_HandleInput';
      break;
    case SAVECB_RETURN_ERROR:
      op(runtime, 'ClearDialogWindowAndFrameToTransparent(0, TRUE)');
      op(runtime, 'ClearPlayerHeldMovementAndUnfreezeObjectEvents()');
      op(runtime, 'UnlockPlayerFieldControls()');
      op(runtime, 'RestoreHelpContext()');
      return true;
  }
  return false;
};

export const startMenuPrepareForSave = (runtime: StartMenuRuntime): void => {
  op(runtime, 'SaveMapView()');
  runtime.sSaveDialogCB = 'SaveDialogCB_PrintAskSaveText';
  runtime.sSaveDialogIsPrinting = false;
};

export const runSaveDialogCB = (runtime: StartMenuRuntime): number => {
  if (runtime.textPrinter0Active) return SAVECB_RETURN_CONTINUE;
  runtime.sSaveDialogIsPrinting = false;
  return saveDialogCallbacks[runtime.sSaveDialogCB](runtime);
};

export const fieldAskSaveTheGame = (runtime: StartMenuRuntime): void => {
  op(runtime, 'BackupHelpContext()');
  op(runtime, 'SetHelpContext(HELPCONTEXT_SAVE)');
  startMenuPrepareForSave(runtime);
  createTask(runtime, 'task50_save_game', 80);
};

export const printSaveTextWithFollowupFunc = (
  runtime: StartMenuRuntime,
  str: string,
  saveDialogCB: SaveDialogCallbackName
): void => {
  op(runtime, `StringExpandPlaceholders(gStringVar4, ${str})`);
  op(runtime, 'LoadMessageBoxAndFrameGfx(0, TRUE)');
  op(runtime, 'AddTextPrinterForMessage(TRUE)');
  runtime.sSaveDialogIsPrinting = true;
  runtime.sSaveDialogCB = saveDialogCB;
};

export const task50SaveGame = (runtime: StartMenuRuntime, taskId: number): void => {
  switch (runSaveDialogCB(runtime)) {
    case SAVECB_RETURN_CONTINUE:
      return;
    case SAVECB_RETURN_CANCEL:
    case SAVECB_RETURN_ERROR:
      runtime.gSpecialVar_Result = false;
      break;
    case SAVECB_RETURN_OKAY:
      runtime.gSpecialVar_Result = true;
      break;
  }
  destroyTask(runtime, taskId);
  op(runtime, 'ScriptContext_Enable()');
  op(runtime, 'RestoreHelpContext()');
};

export const closeSaveMessageWindow = (runtime: StartMenuRuntime): void => {
  op(runtime, 'ClearDialogWindowAndFrame(0, TRUE)');
};

export const closeSaveStatsWindow_ = (runtime: StartMenuRuntime): void => {
  closeSaveStatsWindow(runtime);
};

export const setSaveDialogDelayTo60Frames = (runtime: StartMenuRuntime): void => {
  runtime.sSaveDialogDelay = 60;
};

export const saveDialogWait60FramesOrAButtonHeld = (runtime: StartMenuRuntime): boolean => {
  runtime.sSaveDialogDelay--;
  if (runtime.input.aHeld) {
    playSE(runtime, SE_SELECT);
    return true;
  }
  return runtime.sSaveDialogDelay === 0;
};

export const saveDialogWait60FramesThenCheckAButtonHeld = (runtime: StartMenuRuntime): boolean => {
  if (runtime.sSaveDialogDelay === 0) return !!runtime.input.aHeld;
  runtime.sSaveDialogDelay--;
  return false;
};

export const saveDialogCBPrintAskSaveText = (runtime: StartMenuRuntime): number => {
  op(runtime, `ClearStdWindowAndFrame(${runtime.startMenuWindowId}, FALSE)`);
  op(runtime, 'RemoveStartMenuWindow()');
  op(runtime, 'DestroyHelpMessageWindow(0)');
  printSaveStats(runtime);
  printSaveTextWithFollowupFunc(runtime, 'gText_WouldYouLikeToSaveTheGame', 'SaveDialogCB_AskSavePrintYesNoMenu');
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBAskSavePrintYesNoMenu = (runtime: StartMenuRuntime): number => {
  op(runtime, 'DisplayYesNoMenuDefaultYes()');
  runtime.sSaveDialogCB = 'SaveDialogCB_AskSaveHandleInput';
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBAskSaveHandleInput = (runtime: StartMenuRuntime): number => {
  switch (runtime.menuInput) {
    case 0:
      if ((runtime.gSaveFileStatus !== SAVE_STATUS_EMPTY && runtime.gSaveFileStatus !== SAVE_STATUS_INVALID) || !runtime.gDifferentSaveFile) {
        runtime.sSaveDialogCB = 'SaveDialogCB_PrintAskOverwriteText';
      } else {
        runtime.sSaveDialogCB = 'SaveDialogCB_PrintSavingDontTurnOffPower';
      }
      break;
    case 1:
    case -1:
      closeSaveStatsWindow_(runtime);
      closeSaveMessageWindow(runtime);
      return SAVECB_RETURN_CANCEL;
  }
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBPrintAskOverwriteText = (runtime: StartMenuRuntime): number => {
  if (runtime.gDifferentSaveFile) {
    printSaveTextWithFollowupFunc(runtime, 'gText_DifferentGameFile', 'SaveDialogCB_AskReplacePreviousFilePrintYesNoMenu');
  } else {
    printSaveTextWithFollowupFunc(runtime, 'gText_AlreadySaveFile_WouldLikeToOverwrite', 'SaveDialogCB_AskOverwritePrintYesNoMenu');
  }
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBAskOverwritePrintYesNoMenu = (runtime: StartMenuRuntime): number => {
  op(runtime, 'DisplayYesNoMenuDefaultYes()');
  runtime.sSaveDialogCB = 'SaveDialogCB_AskOverwriteOrReplacePreviousFileHandleInput';
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBAskReplacePreviousFilePrintYesNoMenu = (runtime: StartMenuRuntime): number => {
  op(runtime, 'DisplayYesNoMenuDefaultNo()');
  runtime.sSaveDialogCB = 'SaveDialogCB_AskOverwriteOrReplacePreviousFileHandleInput';
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBAskOverwriteOrReplacePreviousFileHandleInput = (runtime: StartMenuRuntime): number => {
  switch (runtime.menuInput) {
    case 0:
      runtime.sSaveDialogCB = 'SaveDialogCB_PrintSavingDontTurnOffPower';
      break;
    case 1:
    case -1:
      closeSaveStatsWindow_(runtime);
      closeSaveMessageWindow(runtime);
      return SAVECB_RETURN_CANCEL;
  }
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBPrintSavingDontTurnOffPower = (runtime: StartMenuRuntime): number => {
  op(runtime, 'SaveQuestLogData()');
  printSaveTextWithFollowupFunc(runtime, 'gText_SavingDontTurnOffThePower', 'SaveDialogCB_DoSave');
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBDoSave = (runtime: StartMenuRuntime): number => {
  op(runtime, 'IncrementGameStat(GAME_STAT_SAVED_GAME)');
  if (runtime.gDifferentSaveFile) {
    op(runtime, `TrySavingData(${SAVE_OVERWRITE_DIFFERENT_FILE})`);
    runtime.gDifferentSaveFile = false;
  } else {
    op(runtime, `TrySavingData(${SAVE_NORMAL})`);
  }
  runtime.sSaveDialogCB = 'SaveDialogCB_PrintSaveResult';
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBPrintSaveResult = (runtime: StartMenuRuntime): number => {
  if (runtime.gSaveAttemptStatus === SAVE_STATUS_OK) {
    printSaveTextWithFollowupFunc(runtime, 'gText_PlayerSavedTheGame', 'SaveDialogCB_WaitPrintSuccessAndPlaySE');
  } else {
    printSaveTextWithFollowupFunc(runtime, 'gText_SaveError_PleaseExchangeBackupMemory', 'SaveDialogCB_WaitPrintErrorAndPlaySE');
  }
  setSaveDialogDelayTo60Frames(runtime);
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBWaitPrintSuccessAndPlaySE = (runtime: StartMenuRuntime): number => {
  if (!runtime.textPrinter0Active) {
    playSE(runtime, SE_SAVE);
    runtime.sSaveDialogCB = 'SaveDialogCB_ReturnSuccess';
  }
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBReturnSuccess = (runtime: StartMenuRuntime): number => {
  if (!runtime.sePlaying && saveDialogWait60FramesOrAButtonHeld(runtime)) {
    closeSaveStatsWindow_(runtime);
    return SAVECB_RETURN_OKAY;
  }
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBWaitPrintErrorAndPlaySE = (runtime: StartMenuRuntime): number => {
  if (!runtime.textPrinter0Active) {
    playSE(runtime, SE_BOO);
    runtime.sSaveDialogCB = 'SaveDialogCB_ReturnError';
  }
  return SAVECB_RETURN_CONTINUE;
};

export const saveDialogCBReturnError = (runtime: StartMenuRuntime): number => {
  if (!saveDialogWait60FramesThenCheckAButtonHeld(runtime)) return SAVECB_RETURN_CONTINUE;
  closeSaveStatsWindow_(runtime);
  return SAVECB_RETURN_ERROR;
};

export const doSetUpSaveAfterLinkBattle = (runtime: StartMenuRuntime, state: { value: number }): boolean => {
  switch (state.value) {
    case 0:
      op(runtime, `SetGpuReg(${REG_OFFSET_DISPCNT}, 0)`);
      op(runtime, 'SetVBlankCallback(NULL)');
      op(runtime, 'ScanlineEffect_Stop()');
      op(runtime, 'DmaFill16Defvars(3, 0, PLTT, PLTT_SIZE)');
      op(runtime, 'DmaFillLarge16(3, 0, VRAM, VRAM_SIZE, 0x1000)');
      break;
    case 1:
      op(runtime, 'ResetSpriteData()');
      op(runtime, 'ResetTasks()');
      op(runtime, 'ResetPaletteFade()');
      op(runtime, 'ScanlineEffect_Clear()');
      break;
    case 2:
      op(runtime, 'ResetBgsAndClearDma3BusyFlags(FALSE)');
      op(runtime, 'InitBgsFromTemplates(0, sBGTemplates_AfterLinkSaveMessage, 1)');
      op(runtime, 'InitWindows(sWindowTemplates_AfterLinkSaveMessage)');
      op(runtime, 'LoadStdWindowGfx(0, 0x008, BG_PLTT_ID(15))');
      break;
    case 3:
      op(runtime, 'ShowBg(0)');
      op(runtime, `BlendPalettes(${PALETTES_ALL}, 16, ${RGB_BLACK})`);
      op(runtime, 'SetVBlankCallback(VBlankCB_WhileSavingAfterLinkBattle)');
      op(runtime, 'EnableInterrupts(INTR_FLAG_VBLANK)');
      break;
    case 4:
      return true;
  }
  state.value++;
  return false;
};

export const cb2SetUpSaveAfterLinkBattle = (runtime: StartMenuRuntime): void => {
  const state = { value: runtime.gMain.state };
  if (doSetUpSaveAfterLinkBattle(runtime, state)) {
    createTask(runtime, 'task50_after_link_battle_save', 80);
    op(runtime, 'SetMainCallback2(CB2_WhileSavingAfterLinkBattle)');
  }
  runtime.gMain.state = state.value;
};

export const cb2WhileSavingAfterLinkBattle = (runtime: StartMenuRuntime): void => {
  op(runtime, 'RunTasks()');
  op(runtime, 'UpdatePaletteFade()');
};

export const VBlankCB_WhileSavingAfterLinkBattle = (runtime: StartMenuRuntime): void => {
  op(runtime, 'TransferPlttBuffer()');
};

export const task50AfterLinkBattleSave = (runtime: StartMenuRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  if (runtime.paletteFadeActive) return;
  switch (data[0]) {
    case 0:
      op(runtime, 'FillWindowPixelBuffer(0, PIXEL_FILL(1))');
      op(runtime, 'AddTextPrinterParameterized2(0, FONT_NORMAL, gText_SavingDontTurnOffThePower2, 0xFF, NULL, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY)');
      op(runtime, 'DrawTextBorderOuter(0, 0x008, 15)');
      op(runtime, 'PutWindowTilemap(0)');
      op(runtime, 'CopyWindowToVram(0, COPYWIN_FULL)');
      op(runtime, `BeginNormalPaletteFade(${PALETTES_ALL}, 0, 16, 0, ${RGB_BLACK})`);
      data[0] = runtime.wirelessCommType !== 0 && runtime.inUnionRoom ? 5 : 1;
      break;
    case 1:
      op(runtime, 'SetContinueGameWarpStatusToDynamicWarp()');
      op(runtime, 'WriteSaveBlock2()');
      data[0] = 2;
      break;
    case 2:
      if (true) {
        op(runtime, 'WriteSaveBlock1Sector() -> TRUE');
        op(runtime, 'ClearContinueGameWarpStatus2()');
        data[0] = 3;
      }
      break;
    case 3:
      op(runtime, `BeginNormalPaletteFade(${PALETTES_ALL}, 0, 0, 16, ${RGB_BLACK})`);
      data[0] = 4;
      break;
    case 4:
      op(runtime, 'FreeAllWindowBuffers()');
      op(runtime, `SetMainCallback2(${runtime.gMain.savedCallback})`);
      destroyTask(runtime, taskId);
      break;
    case 5:
      createTask(runtime, 'Task_LinkFullSave', 5);
      runtime.linkFullSaveActive = true;
      data[0] = 6;
      break;
    case 6:
      if (!runtime.linkFullSaveActive) data[0] = 3;
      break;
  }
};

export const printSaveStats = (runtime: StartMenuRuntime): void => {
  runtime.sSaveStatsWindowId = runtime.nextWindowId++;
  op(runtime, `AddWindow(sSaveStatsWindowTemplate) -> ${runtime.sSaveStatsWindowId}`);
  op(runtime, `LoadStdWindowGfx(${runtime.sSaveStatsWindowId}, 0x21D, BG_PLTT_ID(13))`);
  op(runtime, `DrawStdFrameWithCustomTileAndPalette(${runtime.sSaveStatsWindowId}, FALSE, 0x21D, 13)`);
  op(runtime, 'SaveStatToString(SAVE_STAT_LOCATION, gStringVar4, 8)');
  op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_NORMAL, centered, 0, sTextColor_LocationHeader, -1, gStringVar4)');
  op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 2, 14, sTextColor_StatName, -1, gSaveStatName_Player)');
  op(runtime, 'SaveStatToString(SAVE_STAT_NAME, gStringVar4, 2)');
  op(runtime, 'Menu_PrintFormatIntlPlayerName(saveStats, gStringVar4, 60, 14)');
  op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 2, 28, sTextColor_StatName, -1, gSaveStatName_Badges)');
  op(runtime, 'SaveStatToString(SAVE_STAT_BADGES, gStringVar4, 2)');
  op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 60, 28, sTextColor_StatValue, -1, gStringVar4)');
  if (runtime.flags.has('FLAG_SYS_POKEDEX_GET')) {
    op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 2, 42, sTextColor_StatName, -1, gSaveStatName_Pokedex)');
    op(runtime, 'SaveStatToString(SAVE_STAT_POKEDEX, gStringVar4, 2)');
    op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 60, 42, sTextColor_StatValue, -1, gStringVar4)');
    op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 2, 56, sTextColor_StatName, -1, gSaveStatName_Time)');
  } else {
    op(runtime, 'AddTextPrinterParameterized3(saveStats, FONT_SMALL, 2, 42, sTextColor_StatName, -1, gSaveStatName_Time)');
  }
  op(runtime, 'SaveStatToString(SAVE_STAT_TIME, gStringVar4, 2)');
  op(runtime, `CopyWindowToVram(${runtime.sSaveStatsWindowId}, COPYWIN_GFX)`);
};

export const closeSaveStatsWindow = (runtime: StartMenuRuntime): void => {
  op(runtime, `ClearStdWindowAndFrame(${runtime.sSaveStatsWindowId}, FALSE)`);
  op(runtime, `RemoveWindow(${runtime.sSaveStatsWindowId})`);
};

export const closeStartMenu = (runtime: StartMenuRuntime): void => {
  playSE(runtime, SE_SELECT);
  op(runtime, `ClearStdWindowAndFrame(${runtime.startMenuWindowId}, TRUE)`);
  op(runtime, 'RemoveStartMenuWindow()');
  op(runtime, 'ClearPlayerHeldMovementAndUnfreezeObjectEvents()');
  op(runtime, 'UnlockPlayerFieldControls()');
};

export const runStartMenuCallback = (runtime: StartMenuRuntime): boolean => {
  if (!runtime.sStartMenuCallback) return false;
  return startMenuCallbacks[runtime.sStartMenuCallback](runtime);
};

const playSE = (runtime: StartMenuRuntime, se: number): void => {
  runtime.playedSoundEffects.push(se);
};

const menuInitCursor = (runtime: StartMenuRuntime, pos: number): number =>
  Math.max(0, Math.min(pos, Math.max(0, runtime.sNumStartMenuItems - 1)));

const menuMoveCursor = (runtime: StartMenuRuntime, delta: number): number =>
  (runtime.sStartMenuCursorPos + delta + runtime.sNumStartMenuItems) % runtime.sNumStartMenuItems;

const updateHelpForCursor = (runtime: StartMenuRuntime): void => {
  if (!runtime.menuHelpersLinkActive && !runtime.inUnionRoom && runtime.optionsButtonMode === OPTIONS_BUTTON_MODE_HELP) {
    op(runtime, `PrintTextOnHelpMessageWindow(${sStartMenuDescPointers[runtime.sStartMenuOrder[runtime.sStartMenuCursorPos]]}, 2)`);
  }
};

const switchTaskToFollowupFunc = (runtime: StartMenuRuntime, taskId: number): void => {
  runtime.tasks[taskId].func = runtime.tasks[taskId].followupFunc ?? runtime.tasks[taskId].func;
};

const destroyTask = (runtime: StartMenuRuntime, taskId: number): void => {
  runtime.tasks.splice(taskId, 1);
};

const startMenuCallbacks: Record<StartMenuCallbackName, (runtime: StartMenuRuntime) => boolean> = {
  StartCB_HandleInput: startCBHandleInput,
  StartMenuPokedexCallback: startMenuPokedexCallback,
  StartMenuPokemonCallback: startMenuPokemonCallback,
  StartMenuBagCallback: startMenuBagCallback,
  StartMenuPlayerCallback: startMenuPlayerCallback,
  StartMenuSaveCallback: startMenuSaveCallback,
  StartMenuOptionCallback: startMenuOptionCallback,
  StartMenuExitCallback: startMenuExitCallback,
  StartMenuSafariZoneRetireCallback: startMenuSafariZoneRetireCallback,
  StartMenuLinkPlayerCallback: startMenuLinkPlayerCallback,
  StartCB_Save1: startCBSave1,
  StartCB_Save2: startCBSave2
};

const saveDialogCallbacks: Record<SaveDialogCallbackName, (runtime: StartMenuRuntime) => number> = {
  SaveDialogCB_PrintAskSaveText: saveDialogCBPrintAskSaveText,
  SaveDialogCB_AskSavePrintYesNoMenu: saveDialogCBAskSavePrintYesNoMenu,
  SaveDialogCB_AskSaveHandleInput: saveDialogCBAskSaveHandleInput,
  SaveDialogCB_PrintAskOverwriteText: saveDialogCBPrintAskOverwriteText,
  SaveDialogCB_AskOverwritePrintYesNoMenu: saveDialogCBAskOverwritePrintYesNoMenu,
  SaveDialogCB_AskReplacePreviousFilePrintYesNoMenu: saveDialogCBAskReplacePreviousFilePrintYesNoMenu,
  SaveDialogCB_AskOverwriteOrReplacePreviousFileHandleInput: saveDialogCBAskOverwriteOrReplacePreviousFileHandleInput,
  SaveDialogCB_PrintSavingDontTurnOffPower: saveDialogCBPrintSavingDontTurnOffPower,
  SaveDialogCB_DoSave: saveDialogCBDoSave,
  SaveDialogCB_PrintSaveResult: saveDialogCBPrintSaveResult,
  SaveDialogCB_WaitPrintSuccessAndPlaySE: saveDialogCBWaitPrintSuccessAndPlaySE,
  SaveDialogCB_ReturnSuccess: saveDialogCBReturnSuccess,
  SaveDialogCB_WaitPrintErrorAndPlaySE: saveDialogCBWaitPrintErrorAndPlaySE,
  SaveDialogCB_ReturnError: saveDialogCBReturnError
};

export const SetHasPokedexAndPokemon = setHasPokedexAndPokemon;
export const SetUpStartMenu = setUpStartMenu;
export const AppendToList = appendToList;
export const AppendToStartMenuItems = appendToStartMenuItems;
export const SetUpStartMenu_NormalField = setUpStartMenuNormalField;
export const SetUpStartMenu_SafariZone = setUpStartMenuSafariZone;
export const SetUpStartMenu_Link = setUpStartMenuLink;
export const SetUpStartMenu_UnionRoom = setUpStartMenuUnionRoom;
export const DrawSafariZoneStatsWindow = drawSafariZoneStatsWindow;
export const DestroySafariZoneStatsWindow = destroySafariZoneStatsWindow;
export const PrintStartMenuItems = printStartMenuItems;
export const DoDrawStartMenu = doDrawStartMenu;
export const DrawStartMenuInOneGo = drawStartMenuInOneGo;
export const task50_startmenu = task50Startmenu;
export const OpenStartMenuWithFollowupFunc = openStartMenuWithFollowupFunc;
export const FieldCB2_DrawStartMenu = fieldCB2DrawStartMenu;
export const SetUpReturnToStartMenu = setUpReturnToStartMenu;
export const Task_StartMenuHandleInput = taskStartMenuHandleInput;
export const ShowStartMenu = showStartMenu;
export const StartCB_HandleInput = startCBHandleInput;
export const StartMenu_FadeScreenIfLeavingOverworld = startMenuFadeScreenIfLeavingOverworld;
export const StartMenuPokedexSanityCheck = startMenuPokedexSanityCheck;
export const StartMenuPokedexCallback = startMenuPokedexCallback;
export const StartMenuPokemonCallback = startMenuPokemonCallback;
export const StartMenuBagCallback = startMenuBagCallback;
export const StartMenuPlayerCallback = startMenuPlayerCallback;
export const StartMenuSaveCallback = startMenuSaveCallback;
export const StartMenuOptionCallback = startMenuOptionCallback;
export const StartMenuExitCallback = startMenuExitCallback;
export const StartMenuSafariZoneRetireCallback = startMenuSafariZoneRetireCallback;
export const StartMenuLinkPlayerCallback = startMenuLinkPlayerCallback;
export const StartCB_Save1 = startCBSave1;
export const StartCB_Save2 = startCBSave2;
export const StartMenu_PrepareForSave = startMenuPrepareForSave;
export const RunSaveDialogCB = runSaveDialogCB;
export const Field_AskSaveTheGame = fieldAskSaveTheGame;
export const PrintSaveTextWithFollowupFunc = printSaveTextWithFollowupFunc;
export const task50_save_game = task50SaveGame;
export const CloseSaveMessageWindow = closeSaveMessageWindow;
export const CloseSaveStatsWindow_ = closeSaveStatsWindow_;
export const SetSaveDialogDelayTo60Frames = setSaveDialogDelayTo60Frames;
export const SaveDialog_Wait60FramesOrAButtonHeld = saveDialogWait60FramesOrAButtonHeld;
export const SaveDialog_Wait60FramesThenCheckAButtonHeld = saveDialogWait60FramesThenCheckAButtonHeld;
export const SaveDialogCB_PrintAskSaveText = saveDialogCBPrintAskSaveText;
export const SaveDialogCB_AskSavePrintYesNoMenu = saveDialogCBAskSavePrintYesNoMenu;
export const SaveDialogCB_AskSaveHandleInput = saveDialogCBAskSaveHandleInput;
export const SaveDialogCB_PrintAskOverwriteText = saveDialogCBPrintAskOverwriteText;
export const SaveDialogCB_AskOverwritePrintYesNoMenu = saveDialogCBAskOverwritePrintYesNoMenu;
export const SaveDialogCB_AskReplacePreviousFilePrintYesNoMenu = saveDialogCBAskReplacePreviousFilePrintYesNoMenu;
export const SaveDialogCB_AskOverwriteOrReplacePreviousFileHandleInput = saveDialogCBAskOverwriteOrReplacePreviousFileHandleInput;
export const SaveDialogCB_PrintSavingDontTurnOffPower = saveDialogCBPrintSavingDontTurnOffPower;
export const SaveDialogCB_DoSave = saveDialogCBDoSave;
export const SaveDialogCB_PrintSaveResult = saveDialogCBPrintSaveResult;
export const SaveDialogCB_WaitPrintSuccessAndPlaySE = saveDialogCBWaitPrintSuccessAndPlaySE;
export const SaveDialogCB_ReturnSuccess = saveDialogCBReturnSuccess;
export const SaveDialogCB_WaitPrintErrorAndPlaySE = saveDialogCBWaitPrintErrorAndPlaySE;
export const SaveDialogCB_ReturnError = saveDialogCBReturnError;
export const DoSetUpSaveAfterLinkBattle = doSetUpSaveAfterLinkBattle;
export const CB2_SetUpSaveAfterLinkBattle = cb2SetUpSaveAfterLinkBattle;
export const CB2_WhileSavingAfterLinkBattle = cb2WhileSavingAfterLinkBattle;
export const task50_after_link_battle_save = task50AfterLinkBattleSave;
export const Task_50_AfterLinkBattleSave = task50AfterLinkBattleSave;
export const PrintSaveStats = printSaveStats;
export const CloseSaveStatsWindow = closeSaveStatsWindow;
export const CloseStartMenu = closeStartMenu;
