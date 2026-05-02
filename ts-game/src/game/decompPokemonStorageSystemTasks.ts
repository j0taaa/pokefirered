import {
  A_BUTTON,
  B_BUTTON,
  CHANGE_GRAB,
  CHANGE_PLACE,
  CHANGE_SHIFT,
  CURSOR_AREA_IN_BOX,
  CURSOR_AREA_IN_PARTY,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  INPUT_BOX_OPTIONS,
  INPUT_CLOSE_BOX,
  INPUT_DEPOSIT,
  INPUT_GIVE_ITEM,
  INPUT_HIDE_PARTY,
  INPUT_IN_MENU,
  INPUT_MOVE_CURSOR,
  INPUT_MOVE_MON,
  INPUT_MULTIMOVE_CHANGE_SELECTION,
  INPUT_MULTIMOVE_GRAB_SELECTION,
  INPUT_MULTIMOVE_MOVE_MONS,
  INPUT_MULTIMOVE_PLACE_MONS,
  INPUT_MULTIMOVE_SINGLE,
  INPUT_MULTIMOVE_START,
  INPUT_MULTIMOVE_UNABLE,
  INPUT_PLACE_MON,
  INPUT_PRESSED_B,
  INPUT_SCROLL_LEFT,
  INPUT_SCROLL_RIGHT,
  INPUT_SHIFT_MON,
  INPUT_SHOW_PARTY,
  INPUT_SWITCH_ITEMS,
  INPUT_TAKE_ITEM,
  INPUT_WITHDRAW,
  ITEM_NONE,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  MENU_TEXT_BAG,
  MENU_TEXT_CANCEL,
  MENU_TEXT_GIVE,
  MENU_TEXT_GIVE2,
  MENU_TEXT_INFO,
  MENU_TEXT_JUMP,
  MENU_TEXT_MARK,
  MENU_TEXT_MOVE,
  MENU_TEXT_NAME,
  MENU_TEXT_PLACE,
  MENU_TEXT_RELEASE,
  MENU_TEXT_SHIFT,
  MENU_TEXT_STORE,
  MENU_TEXT_SUMMARY,
  MENU_TEXT_SWITCH,
  MENU_TEXT_TAKE,
  MENU_TEXT_WALLPAPER,
  MENU_TEXT_WITHDRAW,
  OPTION_DEPOSIT,
  OPTION_MOVE_ITEMS,
  OPTION_MOVE_MONS,
  PARTY_SIZE,
  RELEASE_MON_ALLOWED,
  RELEASE_MON_UNDETERMINED,
  SPECIES_NONE,
  TOTAL_BOXES_COUNT,
  AddMenu,
  CanMovePartyMon,
  CanShiftMon,
  ClearSavedCursorPos,
  CompactPartySlots,
  DoMonPlaceChange,
  DoTrySetDisplayMonData,
  GetBoxCursorPosition,
  GetMovingMonOriginalBoxId,
  HandleInput,
  HandleMenuInput,
  InitCanReleaseMonVars,
  InitCursor,
  InitCursorOnReopen,
  InitMonPlaceChange,
  InitReleaseMon,
  InitSummaryScreenData,
  IsCursorOnBoxTitle,
  IsMonBeingMoved,
  LoadSavedMovingMon,
  ReleaseMon,
  ResetSelectionAfterDeposit,
  RunCanReleaseMon,
  SaveCursorPos,
  SaveMovingMon,
  SetCursorBoxPosition,
  SetCursorInParty,
  SetMenuText,
  SetMonMarkings,
  StartCursorAnim,
  TryHideItemAtCursor,
  TryHideReleaseMon,
  TrySetCursorFistAnim,
  TryStorePartyMonInBox,
  UpdateCursorPos,
  createPokemonStorageDataRuntime,
  setCurrentBox,
  type DecompBoxPokemon,
  type PokemonStorageDataRuntime
} from './decompPokemonStorageSystem';

export const SCREEN_CHANGE_EXIT_BOX = 0;
export const SCREEN_CHANGE_SUMMARY_SCREEN = 1;
export const SCREEN_CHANGE_NAME_BOX = 2;
export const SCREEN_CHANGE_ITEM_FROM_BAG = 3;

export const MSG_EXIT_BOX = 0;
export const MSG_WHAT_YOU_DO = 1;
export const MSG_PICK_A_THEME = 2;
export const MSG_PICK_A_WALLPAPER = 3;
export const MSG_IS_SELECTED = 4;
export const MSG_JUMP_TO_WHICH_BOX = 5;
export const MSG_DEPOSIT_IN_WHICH_BOX = 6;
export const MSG_WAS_DEPOSITED = 7;
export const MSG_BOX_IS_FULL = 8;
export const MSG_RELEASE_POKE = 9;
export const MSG_WAS_RELEASED = 10;
export const MSG_BYE_BYE = 11;
export const MSG_MARK_POKE = 12;
export const MSG_LAST_POKE = 13;
export const MSG_PARTY_FULL = 14;
export const MSG_HOLDING_POKE = 15;
export const MSG_WHICH_ONE_WILL_TAKE = 16;
export const MSG_CANT_RELEASE_EGG = 17;
export const MSG_CONTINUE_BOX = 18;
export const MSG_CAME_BACK = 19;
export const MSG_WORRIED = 20;
export const MSG_SURPRISE = 21;
export const MSG_PLEASE_REMOVE_MAIL = 22;
export const MSG_IS_SELECTED2 = 23;
export const MSG_GIVE_TO_MON = 24;
export const MSG_PLACED_IN_BAG = 25;
export const MSG_BAG_FULL = 26;
export const MSG_PUT_IN_BAG = 27;
export const MSG_ITEM_IS_HELD = 28;
export const MSG_CHANGED_TO_ITEM = 29;
export const MSG_CANT_STORE_MAIL = 30;

export const MENU_TEXT_SCENERY_1 = 18;
export const MENU_TEXT_SCENERY_2 = 19;
export const MENU_TEXT_SCENERY_3 = 20;
export const MENU_TEXT_ETCETERA = 21;
export const MENU_TEXT_FOREST = 22;
export const MENU_TEXT_CITY = 23;
export const MENU_TEXT_DESERT = 24;
export const MENU_TEXT_SAVANNA = 25;
export const MENU_TEXT_CRAG = 26;
export const MENU_TEXT_VOLCANO = 27;
export const MENU_TEXT_SNOW = 28;
export const MENU_TEXT_CAVE = 29;
export const MENU_TEXT_BEACH = 30;
export const MENU_TEXT_SEAFLOOR = 31;
export const MENU_TEXT_RIVER = 32;
export const MENU_TEXT_SKY = 33;
export const MENU_TEXT_POLKADOT = 34;
export const MENU_TEXT_POKECENTER = 35;
export const MENU_TEXT_MACHINE = 36;
export const MENU_TEXT_SIMPLE = 37;

export interface StorageTaskSprite {
  x: number;
  y: number;
  data: number[];
  invisible: boolean;
  callback: string;
  oam: { mosaic: boolean; priority: number };
}

export interface PokemonStorageTasksRuntime extends PokemonStorageDataRuntime {
  currentBoxOption: number;
  depositBoxId: number;
  whichToReshow: number;
  lastUsedBox: number;
  movingItemId: number;
  taskFunc: string;
  taskId: number;
  state: number;
  isReopening: boolean;
  inPartyMenu: boolean;
  screenChangeType: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  bg2_X: number;
  gpuRegs: Record<string, number>;
  closeBoxFlashing: boolean;
  closeBoxFlashTimer: number;
  closeBoxFlashState: boolean;
  newCurrBoxId: number;
  paletteFadeActive: boolean;
  pcScreenEffectRunning: boolean;
  initBoxActive: boolean;
  multiMoveActive: boolean;
  itemIconAnimActive: boolean;
  dmaBusy: boolean;
  yesNoInput: number;
  boxChooseInput: number;
  wallpaperSetId: number;
  wallpaperId: number;
  bagAddSucceeds: boolean;
  chosenBagItem: number;
  displayMonSprite: StorageTaskSprite | null;
  markingComboSprite: StorageTaskSprite | null;
  waveformSprites: StorageTaskSprite[];
  partyMenuMoveTimer: number;
  partyMenuY: number;
  partyMenuUnused1: number;
  showPartyMenuState: number;
  partyMenuTilemapBuffer: number[];
  messages: number[];
  questLogEvents: Array<{ event: string; data: Record<string, number> }>;
  boxToSendMonsVar: number | null;
  shownBoxWasFullMessageCleared: boolean;
}

export const createPokemonStorageTasksRuntime = (
  overrides: Partial<PokemonStorageTasksRuntime> = {}
): PokemonStorageTasksRuntime => ({
  ...createPokemonStorageDataRuntime(overrides),
  currentBoxOption: overrides.currentBoxOption ?? 0,
  depositBoxId: overrides.depositBoxId ?? 0,
  whichToReshow: overrides.whichToReshow ?? 0,
  lastUsedBox: overrides.lastUsedBox ?? 0,
  movingItemId: overrides.movingItemId ?? ITEM_NONE,
  taskFunc: overrides.taskFunc ?? 'Task_InitPokeStorage',
  taskId: overrides.taskId ?? 0,
  state: overrides.state ?? 0,
  isReopening: overrides.isReopening ?? false,
  inPartyMenu: overrides.inPartyMenu ?? false,
  screenChangeType: overrides.screenChangeType ?? SCREEN_CHANGE_EXIT_BOX,
  mainCallback2: overrides.mainCallback2 ?? null,
  vblankCallback: overrides.vblankCallback ?? null,
  bg2_X: overrides.bg2_X ?? 0,
  gpuRegs: overrides.gpuRegs ?? {},
  closeBoxFlashing: overrides.closeBoxFlashing ?? false,
  closeBoxFlashTimer: overrides.closeBoxFlashTimer ?? 0,
  closeBoxFlashState: overrides.closeBoxFlashState ?? false,
  newCurrBoxId: overrides.newCurrBoxId ?? 0,
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  pcScreenEffectRunning: overrides.pcScreenEffectRunning ?? false,
  initBoxActive: overrides.initBoxActive ?? false,
  multiMoveActive: overrides.multiMoveActive ?? false,
  itemIconAnimActive: overrides.itemIconAnimActive ?? false,
  dmaBusy: overrides.dmaBusy ?? false,
  yesNoInput: overrides.yesNoInput ?? MENU_NOTHING_CHOSEN,
  boxChooseInput: overrides.boxChooseInput ?? MENU_NOTHING_CHOSEN,
  wallpaperSetId: overrides.wallpaperSetId ?? 0,
  wallpaperId: overrides.wallpaperId ?? 0,
  bagAddSucceeds: overrides.bagAddSucceeds ?? true,
  chosenBagItem: overrides.chosenBagItem ?? ITEM_NONE,
  displayMonSprite: overrides.displayMonSprite ?? null,
  markingComboSprite: overrides.markingComboSprite ?? null,
  waveformSprites: overrides.waveformSprites ?? [],
  partyMenuMoveTimer: overrides.partyMenuMoveTimer ?? 0,
  partyMenuY: overrides.partyMenuY ?? 0,
  partyMenuUnused1: overrides.partyMenuUnused1 ?? 0,
  showPartyMenuState: overrides.showPartyMenuState ?? 0,
  partyMenuTilemapBuffer: overrides.partyMenuTilemapBuffer ?? Array.from({ length: 12 * 22 }, () => 0),
  messages: overrides.messages ?? [],
  questLogEvents: overrides.questLogEvents ?? [],
  boxToSendMonsVar: overrides.boxToSendMonsVar ?? null,
  shownBoxWasFullMessageCleared: overrides.shownBoxWasFullMessageCleared ?? false,
  ...overrides
});

const ack = (runtime: PokemonStorageTasksRuntime, name: string): void => {
  runtime.operations.push(name);
};

export const VBlankCB_PokeStorage = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'LoadOam');
  ack(runtime, 'ProcessSpriteCopyRequests');
  ack(runtime, 'UnkUtil_Run');
  ack(runtime, 'TransferPlttBuffer');
  runtime.gpuRegs.REG_OFFSET_BG2HOFS = runtime.bg2_X;
};

export const CB2_PokeStorage = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'RunTasks');
  ack(runtime, 'DoScheduledBgTilemapCopiesToVram');
  ScrollBackground(runtime);
  UpdateCloseBoxButtonFlash(runtime);
  ack(runtime, 'AnimateSprites');
  ack(runtime, 'BuildOamBuffer');
};

export const EnterPokeStorage = (runtime: PokemonStorageTasksRuntime, boxOption: number): void => {
  ack(runtime, 'ResetTasks');
  runtime.currentBoxOption = boxOption;
  runtime.boxOption = boxOption;
  runtime.isReopening = false;
  runtime.movingItemId = ITEM_NONE;
  runtime.state = 0;
  runtime.taskFunc = 'Task_InitPokeStorage';
  runtime.taskId = 0;
  runtime.lastUsedBox = runtime.storage.currentBox;
  runtime.mainCallback2 = 'CB2_PokeStorage';
  ack(runtime, 'SetHelpContext:HELPCONTEXT_BILLS_PC');
};

export const CB2_ReturnToPokeStorage = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'ResetTasks');
  runtime.boxOption = runtime.currentBoxOption;
  runtime.isReopening = true;
  runtime.state = 0;
  runtime.taskFunc = 'Task_InitPokeStorage';
  runtime.mainCallback2 = 'CB2_PokeStorage';
  ack(runtime, 'SetHelpContext:HELPCONTEXT_BILLS_PC');
};

export const ResetAllBgCoords = (runtime: PokemonStorageTasksRuntime): void => {
  for (const reg of ['REG_OFFSET_BG0HOFS', 'REG_OFFSET_BG0VOFS', 'REG_OFFSET_BG1HOFS', 'REG_OFFSET_BG1VOFS', 'REG_OFFSET_BG2HOFS', 'REG_OFFSET_BG2VOFS', 'REG_OFFSET_BG3HOFS', 'REG_OFFSET_BG3VOFS'])
    runtime.gpuRegs[reg] = 0;
};

export const ResetForPokeStorage = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'ResetPaletteFade');
  ack(runtime, 'ResetSpriteData');
  ack(runtime, 'FreeSpriteTileRanges');
  ack(runtime, 'FreeAllSpritePalettes');
  ack(runtime, 'ClearDma3Requests');
  runtime.closeBoxFlashing = false;
};

export const InitStartingPosData = (runtime: PokemonStorageTasksRuntime): void => {
  ClearSavedCursorPos(runtime);
  runtime.inPartyMenu = runtime.boxOption === OPTION_DEPOSIT;
  runtime.depositBoxId = 0;
};

export const SetMonIconTransparency = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.boxOption === OPTION_MOVE_ITEMS) {
    runtime.gpuRegs.REG_OFFSET_BLDCNT = 1;
    runtime.gpuRegs.REG_OFFSET_BLDALPHA = (7 << 8) | 11;
  }
  runtime.gpuRegs.REG_OFFSET_DISPCNT = 1;
};

export const SetPokeStorageTask = (runtime: PokemonStorageTasksRuntime, newFunc: string): void => {
  runtime.taskFunc = newFunc;
  runtime.state = 0;
};

export const Task_InitPokeStorage = (runtime: PokemonStorageTasksRuntime, _taskId = runtime.taskId): void => {
  switch (runtime.state) {
    case 0:
      runtime.vblankCallback = null;
      runtime.gpuRegs.REG_OFFSET_DISPCNT = 0;
      ResetForPokeStorage(runtime);
      if (runtime.isReopening) {
        if (runtime.whichToReshow === SCREEN_CHANGE_NAME_BOX - 1)
          LoadSavedMovingMon(runtime);
        else if (runtime.whichToReshow === SCREEN_CHANGE_SUMMARY_SCREEN - 1)
          runtime.cursorPosition = runtime.lastViewedMonIndex;
        else if (runtime.whichToReshow === SCREEN_CHANGE_ITEM_FROM_BAG - 1)
          GiveChosenBagItem(runtime);
      }
      LoadPokeStorageMenuGfx(runtime);
      LoadsMiscSpritePalette(runtime);
      break;
    case 1:
      if (!InitPokeStorageWindows(runtime)) {
        SetPokeStorageTask(runtime, 'Task_ChangeScreen');
        return;
      }
      break;
    case 2:
      ack(runtime, 'PutWindowTilemap:0');
      ack(runtime, 'ClearWindowTilemap:1');
      break;
    case 3:
      ResetAllBgCoords(runtime);
      if (!runtime.isReopening)
        InitStartingPosData(runtime);
      break;
    case 4:
      if (!runtime.isReopening)
        InitCursor(runtime);
      else
        InitCursorOnReopen(runtime);
      break;
    case 5:
      SetScrollingBackground(runtime);
      InitPokeStorageBg0(runtime);
      break;
    case 6:
      InitPalettesAndSprites(runtime);
      break;
    case 7:
      InitSupplementalTilemaps(runtime);
      break;
    case 8:
      runtime.initBoxActive = true;
      ack(runtime, `CreateInitBoxTask:${runtime.storage.currentBox}`);
      break;
    case 9:
      if (runtime.initBoxActive)
        return;
      if (runtime.boxOption === OPTION_MOVE_ITEMS)
        InitCursorItemIcon(runtime);
      else
        ack(runtime, 'InitMonMarkingsMenu');
      break;
    case 10:
      SetMonIconTransparency(runtime);
      SetPokeStorageTask(runtime, runtime.isReopening ? 'Task_ReshowPokeStorage' : 'Task_ShowPokeStorage');
      runtime.vblankCallback = 'VBlankCB_PokeStorage';
      return;
    default:
      return;
  }
  runtime.state++;
};

export const Task_ShowPokeStorage = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    ack(runtime, 'PlaySE:SE_PC_LOGIN');
    runtime.pcScreenEffectRunning = true;
    runtime.state++;
  } else if (runtime.state === 1 && !runtime.pcScreenEffectRunning) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_ReshowPokeStorage = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    runtime.paletteFadeActive = true;
    runtime.state++;
  } else if (runtime.state === 1 && !runtime.paletteFadeActive) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_PokeStorageMain = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    const input = HandleInput(runtime);
    handleMainInput(runtime, input);
  } else if (runtime.state === 1) {
    if (!UpdateCursorPos(runtime, runtime.itemIconAnimActive)) {
      if (runtime.setMosaic)
        StartDisplayMonMosaic(runtime);
      runtime.state = 0;
    }
  } else if (runtime.state === 2) {
    setCurrentBox(runtime.storage, runtime.newCurrBoxId);
    if (!runtime.inPartyMenu && !IsMonBeingMoved(runtime)) {
      DoTrySetDisplayMonData(runtime);
      StartDisplayMonMosaic(runtime);
    }
    runtime.state = runtime.boxOption === OPTION_MOVE_ITEMS ? 11 : 0;
  } else if ((runtime.state === 3 || runtime.state === 6) && (runtime.newKeys & (A_BUTTON | B_BUTTON | DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT))) {
    ClearBottomWindow(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  } else if ([7, 8, 9].includes(runtime.state) && !runtime.multiMoveActive) {
    SetPokeStorageTask(runtime, runtime.state === 8 ? 'Task_MoveMon' : 'Task_PokeStorageMain');
  } else if ((runtime.state === 10 || runtime.state === 11) && !runtime.itemIconAnimActive) {
    runtime.state = runtime.state === 10 ? 2 : 0;
  }
};

const handleMainInput = (runtime: PokemonStorageTasksRuntime, input: number): void => {
  switch (input) {
    case INPUT_MOVE_CURSOR:
      ack(runtime, 'PlaySE:SE_SELECT');
      runtime.state = 1;
      break;
    case INPUT_SHOW_PARTY:
      if (runtime.boxOption !== OPTION_MOVE_MONS && runtime.boxOption !== OPTION_MOVE_ITEMS) {
        PrintStorageMessage(runtime, MSG_WHICH_ONE_WILL_TAKE);
        runtime.state = 3;
      } else {
        ClearSavedCursorPos(runtime);
        SetPokeStorageTask(runtime, 'Task_ShowPartyPokemon');
      }
      break;
    case INPUT_HIDE_PARTY:
      SetPokeStorageTask(runtime, runtime.boxOption === OPTION_MOVE_MONS && IsMonBeingMoved(runtime) && runtime.itemIsMail(runtime.displayMonItemId) ? 'Task_PrintCantStoreMail' : 'Task_HidePartyPokemon');
      break;
    case INPUT_CLOSE_BOX:
      SetPokeStorageTask(runtime, 'Task_OnCloseBoxPressed');
      break;
    case INPUT_PRESSED_B:
      SetPokeStorageTask(runtime, 'Task_OnBPressed');
      break;
    case INPUT_BOX_OPTIONS:
      ack(runtime, 'PlaySE:SE_SELECT');
      SetPokeStorageTask(runtime, 'Task_HandleBoxOptions');
      break;
    case INPUT_IN_MENU:
      SetPokeStorageTask(runtime, 'Task_OnSelectedMon');
      break;
    case INPUT_SCROLL_RIGHT:
    case INPUT_SCROLL_LEFT:
      ack(runtime, 'PlaySE:SE_SELECT');
      runtime.newCurrBoxId = input === INPUT_SCROLL_RIGHT ? runtime.storage.currentBox + 1 : runtime.storage.currentBox - 1;
      if (runtime.newCurrBoxId >= TOTAL_BOXES_COUNT)
        runtime.newCurrBoxId = 0;
      if (runtime.newCurrBoxId < 0)
        runtime.newCurrBoxId = TOTAL_BOXES_COUNT - 1;
      if (runtime.boxOption === OPTION_MOVE_ITEMS) {
        TryHideItemAtCursor(runtime);
        runtime.state = 10;
      } else {
        ack(runtime, `SetUpScrollToBox:${runtime.newCurrBoxId}`);
        runtime.state = 2;
      }
      break;
    case INPUT_DEPOSIT:
      if (CanMovePartyMon(runtime))
        runtime.state = 4;
      else if (runtime.itemIsMail(runtime.displayMonItemId))
        runtime.state = 5;
      else
        SetPokeStorageTask(runtime, 'Task_DepositMenu');
      break;
    case INPUT_MOVE_MON:
      SetPokeStorageTask(runtime, CanMovePartyMon(runtime) ? 'Task_PokeStorageMain' : 'Task_MoveMon');
      if (CanMovePartyMon(runtime))
        runtime.state = 4;
      break;
    case INPUT_SHIFT_MON:
      SetPokeStorageTask(runtime, CanShiftMon(runtime) ? 'Task_ShiftMon' : 'Task_PokeStorageMain');
      if (!CanShiftMon(runtime))
        runtime.state = 4;
      break;
    case INPUT_WITHDRAW:
      SetPokeStorageTask(runtime, 'Task_WithdrawMon');
      break;
    case INPUT_PLACE_MON:
      SetPokeStorageTask(runtime, 'Task_PlaceMon');
      break;
    case INPUT_TAKE_ITEM:
      SetPokeStorageTask(runtime, 'Task_TakeItemForMoving');
      break;
    case INPUT_GIVE_ITEM:
      SetPokeStorageTask(runtime, 'Task_GiveMovingItemToMon');
      break;
    case INPUT_SWITCH_ITEMS:
      SetPokeStorageTask(runtime, 'Task_SwitchSelectedItem');
      break;
    case INPUT_MULTIMOVE_START:
    case INPUT_MULTIMOVE_GRAB_SELECTION:
    case INPUT_MULTIMOVE_PLACE_MONS:
      runtime.multiMoveActive = true;
      runtime.state = 7;
      break;
    case INPUT_MULTIMOVE_SINGLE:
      runtime.multiMoveActive = true;
      runtime.state = 8;
      break;
    case INPUT_MULTIMOVE_CHANGE_SELECTION:
    case INPUT_MULTIMOVE_MOVE_MONS:
      runtime.multiMoveActive = true;
      runtime.state = 9;
      break;
    case INPUT_MULTIMOVE_UNABLE:
      ack(runtime, 'PlaySE:SE_FAILURE');
      break;
  }
};

export const Task_ShowPartyPokemon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    SetUpDoShowPartyMenu(runtime);
    runtime.state++;
  } else if (runtime.state === 1 && !DoShowPartyMenu(runtime)) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_HidePartyPokemon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    ack(runtime, 'PlaySE:SE_SELECT');
    SetUpHidePartyMenu(runtime);
    runtime.state++;
  } else if (runtime.state === 1 && !HidePartyMenu(runtime)) {
    SetCursorBoxPosition(runtime, runtime.savedCursorPosition);
    runtime.state++;
  } else if (runtime.state === 2 && !UpdateCursorPos(runtime)) {
    if (runtime.setMosaic)
      StartDisplayMonMosaic(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_OnSelectedMon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0 && !IsDisplayMonMosaicActive(runtime)) {
    ack(runtime, 'PlaySE:SE_SELECT');
    PrintStorageMessage(runtime, runtime.boxOption !== OPTION_MOVE_ITEMS ? MSG_IS_SELECTED : runtime.activeItemMoving || runtime.displayMonItemId !== 0 ? MSG_IS_SELECTED2 : MSG_GIVE_TO_MON);
    AddMenu(runtime);
    runtime.state = 1;
  } else if (runtime.state === 1) {
    runtime.state = 2;
  } else if (runtime.state === 2) {
    const input = HandleMenuInput(runtime);
    selectedMenuInput(runtime, input);
  } else if ([3, 4, 5].includes(runtime.state)) {
    ack(runtime, 'PlaySE:SE_FAILURE');
    PrintStorageMessage(runtime, runtime.state === 3 ? MSG_LAST_POKE : runtime.state === 4 ? MSG_PLEASE_REMOVE_MAIL : MSG_CANT_RELEASE_EGG);
    runtime.state = 6;
  } else if (runtime.state === 6 && runtime.newKeys) {
    ClearBottomWindow(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

const selectedMenuInput = (runtime: PokemonStorageTasksRuntime, input: number): void => {
  switch (input) {
    case MENU_B_PRESSED:
    case MENU_TEXT_CANCEL:
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
      break;
    case MENU_TEXT_MOVE:
      SetPokeStorageTask(runtime, CanMovePartyMon(runtime) ? 'Task_PokeStorageMain' : 'Task_MoveMon');
      if (CanMovePartyMon(runtime))
        runtime.state = 3;
      break;
    case MENU_TEXT_PLACE:
      SetPokeStorageTask(runtime, 'Task_PlaceMon');
      break;
    case MENU_TEXT_SHIFT:
      SetPokeStorageTask(runtime, CanShiftMon(runtime) ? 'Task_ShiftMon' : 'Task_PokeStorageMain');
      if (!CanShiftMon(runtime))
        runtime.state = 3;
      break;
    case MENU_TEXT_WITHDRAW:
      SetPokeStorageTask(runtime, 'Task_WithdrawMon');
      break;
    case MENU_TEXT_STORE:
      if (CanMovePartyMon(runtime))
        runtime.state = 3;
      else if (runtime.itemIsMail(runtime.displayMonItemId))
        runtime.state = 4;
      else
        SetPokeStorageTask(runtime, 'Task_DepositMenu');
      break;
    case MENU_TEXT_RELEASE:
      if (CanMovePartyMon(runtime))
        runtime.state = 3;
      else if (runtime.displayMonIsEgg)
        runtime.state = 5;
      else if (runtime.itemIsMail(runtime.displayMonItemId))
        runtime.state = 4;
      else
        SetPokeStorageTask(runtime, 'Task_ReleaseMon');
      break;
    case MENU_TEXT_SUMMARY:
      SetPokeStorageTask(runtime, 'Task_ShowMonSummary');
      break;
    case MENU_TEXT_BAG:
      SetPokeStorageTask(runtime, 'Task_ItemToBag');
      break;
    case MENU_TEXT_SWITCH:
      SetPokeStorageTask(runtime, 'Task_SwitchSelectedItem');
      break;
    case MENU_TEXT_GIVE2:
      SetPokeStorageTask(runtime, 'Task_GiveItemFromBag');
      break;
    case MENU_TEXT_INFO:
      SetPokeStorageTask(runtime, 'Task_ShowItemInfo');
      break;
    case MENU_TEXT_MARK:
      SetPokeStorageTask(runtime, 'Task_ShowMarkMenu');
      break;
    case MENU_TEXT_TAKE:
      SetPokeStorageTask(runtime, 'Task_TakeItemForMoving');
      break;
    case MENU_TEXT_GIVE:
      SetPokeStorageTask(runtime, 'Task_GiveMovingItemToMon');
      break;
  }
};

export const Task_MoveMon = (runtime: PokemonStorageTasksRuntime): void => placeChangeTask(runtime, CHANGE_GRAB, 'Task_HandleMovingMonFromParty');
export const Task_PlaceMon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0)
    SetPokeStorageQuestLogEvent(runtime, 1);
  placeChangeTask(runtime, CHANGE_PLACE, 'Task_HandleMovingMonFromParty');
};
export const Task_ShiftMon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0)
    SetPokeStorageQuestLogEvent(runtime, 0);
  placeChangeTask(runtime, CHANGE_SHIFT, 'Task_PokeStorageMain', true);
};

const placeChangeTask = (runtime: PokemonStorageTasksRuntime, change: number, partyTask: string, mosaic = false): void => {
  if (runtime.state === 0) {
    InitMonPlaceChange(runtime, change);
    runtime.state++;
  } else if (runtime.state === 1 && !DoMonPlaceChange(runtime)) {
    if (mosaic)
      StartDisplayMonMosaic(runtime);
    SetPokeStorageTask(runtime, runtime.inPartyMenu ? partyTask : 'Task_PokeStorageMain');
  }
};

export const Task_WithdrawMon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    if (runtime.playerParty.filter((mon) => mon.species !== SPECIES_NONE).length === PARTY_SIZE) {
      PrintStorageMessage(runtime, MSG_PARTY_FULL);
      runtime.state = 1;
    } else {
      SaveCursorPos(runtime);
      InitMonPlaceChange(runtime, CHANGE_GRAB);
      runtime.state = 2;
    }
  } else if (runtime.state === 1 && runtime.newKeys) {
    ClearBottomWindow(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  } else if (runtime.state === 2 && !DoMonPlaceChange(runtime)) {
    runtime.movingMonPriority = 1;
    SetUpDoShowPartyMenu(runtime);
    runtime.state++;
  } else if (runtime.state === 3 && !DoShowPartyMenu(runtime)) {
    SetPokeStorageQuestLogEvent(runtime, 1);
    InitMonPlaceChange(runtime, CHANGE_PLACE);
    runtime.state++;
  } else if (runtime.state === 4 && !DoMonPlaceChange(runtime)) {
    UpdatePartySlotColors(runtime);
    runtime.state++;
  } else if (runtime.state === 5) {
    SetPokeStorageTask(runtime, 'Task_HidePartyPokemon');
  }
};

export const Task_DepositMenu = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_DEPOSIT_IN_WHICH_BOX);
    ack(runtime, `CreateChooseBoxMenuSprites:${runtime.depositBoxId}`);
    runtime.state++;
  } else if (runtime.state === 1) {
    const boxId = runtime.boxChooseInput;
    if (boxId === MENU_NOTHING_CHOSEN)
      return;
    if (boxId === MENU_B_PRESSED) {
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    } else if (TryStorePartyMonInBox(runtime, boxId)) {
      runtime.depositBoxId = boxId;
      SetPokeStorageQuestLogEvent(runtime, 2);
      ClearBottomWindow(runtime);
      runtime.state = 2;
    } else {
      PrintStorageMessage(runtime, MSG_BOX_IS_FULL);
      runtime.state = 4;
    }
  } else if (runtime.state === 2) {
    CompactPartySlots(runtime);
    ack(runtime, 'CompactPartySprites');
    runtime.state++;
  } else if (runtime.state === 3) {
    ResetSelectionAfterDeposit(runtime);
    StartDisplayMonMosaic(runtime);
    UpdatePartySlotColors(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  } else if (runtime.state === 4 && runtime.newKeys) {
    PrintStorageMessage(runtime, MSG_DEPOSIT_IN_WHICH_BOX);
    runtime.state = 1;
  }
};

export const Task_ReleaseMon = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_RELEASE_POKE);
    ShowYesNoWindow(runtime, 1);
    runtime.state = 1;
  }
  if (runtime.state === 1) {
    if (runtime.yesNoInput === MENU_B_PRESSED || runtime.yesNoInput === 1) {
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    } else if (runtime.yesNoInput === 0) {
      ClearBottomWindow(runtime);
      InitCanReleaseMonVars(runtime);
      InitReleaseMon(runtime);
      runtime.state++;
    }
  } else if (runtime.state === 2) {
    RunCanReleaseMon(runtime);
    if (!TryHideReleaseMon(runtime, false)) {
      let status = RELEASE_MON_UNDETERMINED;
      while (status === RELEASE_MON_UNDETERMINED)
        status = RunCanReleaseMon(runtime);
      runtime.state = status === RELEASE_MON_ALLOWED ? 3 : 8;
    }
  } else if (runtime.state === 3) {
      ReleaseMon(runtime);
    RefreshDisplayMonData(runtime);
    PrintStorageMessage(runtime, MSG_WAS_RELEASED);
    runtime.state++;
  } else if ([4, 5, 9, 10, 12, 13].includes(runtime.state) && runtime.newKeys) {
    releaseMessageAdvance(runtime);
  } else if (runtime.state === 6) {
    DoTrySetDisplayMonData(runtime);
    StartDisplayMonMosaic(runtime);
    UpdatePartySlotColors(runtime);
    runtime.state++;
  } else if (runtime.state === 7) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  } else if (runtime.state === 8) {
    PrintStorageMessage(runtime, MSG_WAS_RELEASED);
    runtime.state++;
  } else if (runtime.state === 11) {
    TrySetCursorFistAnim(runtime);
    PrintStorageMessage(runtime, MSG_CAME_BACK);
    runtime.state++;
  }
};

const releaseMessageAdvance = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 4) {
    PrintStorageMessage(runtime, MSG_BYE_BYE);
    runtime.state++;
  } else if (runtime.state === 5) {
    ClearBottomWindow(runtime);
    runtime.state = runtime.inPartyMenu ? 6 : 7;
  } else if (runtime.state === 9) {
    PrintStorageMessage(runtime, MSG_SURPRISE);
    runtime.state++;
  } else if (runtime.state === 10) {
    ClearBottomWindow(runtime);
    ack(runtime, 'DoReleaseMonComeBackAnim');
    runtime.state++;
  } else if (runtime.state === 12) {
    PrintStorageMessage(runtime, MSG_WORRIED);
    runtime.state++;
  } else if (runtime.state === 13) {
    ClearBottomWindow(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_ShowMarkMenu = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_MARK_POKE);
    ack(runtime, `OpenMonMarkingsMenu:${runtime.displayMonMarkings}`);
    runtime.state++;
  } else if (runtime.state === 1) {
    SetMonMarkings(runtime, runtime.displayMonMarkings);
    RefreshDisplayMonData(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_TakeItemForMoving = (runtime: PokemonStorageTasksRuntime): void => itemAnimTask(runtime, 'Item_FromMonToMoving', 'Task_PrintCantStoreMail');
export const Task_GiveMovingItemToMon = (runtime: PokemonStorageTasksRuntime): void => itemAnimTask(runtime, 'Item_GiveMovingToMon');
export const Task_SwitchSelectedItem = (runtime: PokemonStorageTasksRuntime): void => itemAnimTask(runtime, 'Item_SwitchMonsWithMoving', 'Task_PrintCantStoreMail');

const itemAnimTask = (runtime: PokemonStorageTasksRuntime, op: string, mailTask?: string): void => {
  if (runtime.state === 0) {
    if (mailTask && runtime.itemIsMail(runtime.displayMonItemId)) {
      SetPokeStorageTask(runtime, mailTask);
      return;
    }
    ClearBottomWindow(runtime);
    runtime.state++;
  } else if (runtime.state === 1) {
    StartCursorAnim(runtime, 2);
    ack(runtime, `${op}:${runtime.inPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX}:${GetBoxCursorPosition(runtime)}`);
    runtime.itemIconAnimActive = true;
    runtime.state++;
  } else if (runtime.state === 2 && !runtime.itemIconAnimActive) {
    StartCursorAnim(runtime, op === 'Item_GiveMovingToMon' ? 0 : 3);
    DoTrySetDisplayMonData(runtime);
    PrintDisplayMonInfo(runtime);
    if (op === 'Item_GiveMovingToMon')
      PrintStorageMessage(runtime, MSG_ITEM_IS_HELD);
    else if (op === 'Item_SwitchMonsWithMoving')
      PrintStorageMessage(runtime, MSG_CHANGED_TO_ITEM);
    runtime.state++;
  } else if (runtime.state >= 3 && (runtime.newKeys || !runtime.dmaBusy)) {
    if (runtime.newKeys)
      ClearBottomWindow(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_ItemToBag = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    if (!runtime.bagAddSucceeds) {
      ack(runtime, 'PlaySE:SE_FAILURE');
      PrintStorageMessage(runtime, MSG_BAG_FULL);
      runtime.state = 3;
    } else {
      ack(runtime, 'PlaySE:SE_SELECT');
      ack(runtime, `Item_TakeMons:${runtime.inPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX}:${GetBoxCursorPosition(runtime)}`);
      runtime.itemIconAnimActive = true;
      runtime.state = 1;
    }
  } else if (runtime.state === 1 && !runtime.itemIconAnimActive) {
    PrintStorageMessage(runtime, MSG_PLACED_IN_BAG);
    runtime.state = 2;
  } else if ((runtime.state === 2 || runtime.state === 3) && runtime.newKeys) {
    ClearBottomWindow(runtime);
    if (runtime.state === 2) {
      DoTrySetDisplayMonData(runtime);
      PrintDisplayMonInfo(runtime);
      runtime.state = 4;
    } else {
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    }
  } else if (runtime.state === 4 && !runtime.dmaBusy) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_ShowItemInfo = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    ClearBottomWindow(runtime);
    runtime.state++;
  } else if (runtime.state === 1 && !runtime.dmaBusy) {
    ack(runtime, 'PrintItemDescription');
    ack(runtime, 'InitItemInfoWindow');
    runtime.state++;
  } else if ((runtime.state === 2 || runtime.state === 5) && !runtime.dmaBusy) {
    runtime.state++;
  } else if (runtime.state === 3 && !runtime.dmaBusy) {
    runtime.state++;
  } else if (runtime.state === 4 && runtime.newKeys) {
    ack(runtime, 'PlaySE:SE_WIN_OPEN');
    runtime.state++;
  } else if (runtime.state === 6 && !runtime.dmaBusy) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_CloseBoxWhileHoldingItem = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_PUT_IN_BAG);
    ShowYesNoWindow(runtime, 0);
    runtime.state = 1;
  } else if (runtime.state === 1) {
    if (runtime.yesNoInput === 0) {
      if (runtime.bagAddSucceeds) {
        ClearBottomWindow(runtime);
        runtime.state = 3;
      } else {
        PrintStorageMessage(runtime, MSG_BAG_FULL);
        runtime.state = 2;
      }
    } else if (runtime.yesNoInput === 1 || runtime.yesNoInput === MENU_B_PRESSED) {
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    }
  } else if (runtime.state === 2 && runtime.newKeys) {
    ClearBottomWindow(runtime);
    runtime.state = 5;
  } else if (runtime.state === 3) {
    ack(runtime, 'MoveItemFromCursorToBag');
    runtime.itemIconAnimActive = true;
    runtime.state = 4;
  } else if (runtime.state === 4 && !runtime.itemIconAnimActive) {
    StartCursorAnim(runtime, 0);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  } else if (runtime.state === 5 && !runtime.dmaBusy) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_HandleMovingMonFromParty = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    CompactPartySlots(runtime);
    ack(runtime, 'CompactPartySprites');
    runtime.state++;
  } else if (runtime.state === 1) {
    UpdatePartySlotColors(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_PrintCantStoreMail = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_CANT_STORE_MAIL);
    runtime.state++;
  } else if (runtime.state === 1 && !runtime.dmaBusy) {
    runtime.state++;
  } else if (runtime.state === 2 && runtime.newKeys) {
    ClearBottomWindow(runtime);
    runtime.state++;
  } else if (runtime.state === 3 && !runtime.dmaBusy) {
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_HandleBoxOptions = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_WHAT_YOU_DO);
    AddMenu(runtime);
    runtime.state++;
  } else if (runtime.state === 1) {
    runtime.state++;
  } else if (runtime.state === 2) {
    const input = HandleMenuInput(runtime);
    if (input === MENU_B_PRESSED || input === MENU_TEXT_CANCEL) {
      ack(runtime, 'AnimateBoxScrollArrows:TRUE');
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    } else if (input === MENU_TEXT_NAME) {
      SetPokeStorageTask(runtime, 'Task_NameBox');
    } else if (input === MENU_TEXT_WALLPAPER) {
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_HandleWallpapers');
    } else if (input === MENU_TEXT_JUMP) {
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_JumpBox');
    }
  }
};

export const Task_HandleWallpapers = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    AddWallpaperSetsMenu(runtime);
    PrintStorageMessage(runtime, MSG_PICK_A_THEME);
    runtime.state++;
  } else if (runtime.state === 1) {
    runtime.state++;
  } else if (runtime.state === 2) {
    const input = HandleMenuInput(runtime);
    if (input === MENU_B_PRESSED)
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    else if ([MENU_TEXT_SCENERY_1, MENU_TEXT_SCENERY_2, MENU_TEXT_SCENERY_3, MENU_TEXT_ETCETERA].includes(input)) {
      runtime.wallpaperSetId = input - MENU_TEXT_SCENERY_1;
      runtime.state++;
    }
  } else if (runtime.state === 3 && !runtime.dmaBusy) {
    AddWallpapersMenu(runtime, runtime.wallpaperSetId ?? 0);
    PrintStorageMessage(runtime, MSG_PICK_A_WALLPAPER);
    runtime.state++;
  } else if (runtime.state === 4) {
    const input = HandleMenuInput(runtime);
    if (input === MENU_B_PRESSED) {
      ClearBottomWindow(runtime);
      runtime.state = 0;
    } else if (input !== MENU_NOTHING_CHOSEN) {
      runtime.wallpaperId = input - MENU_TEXT_FOREST;
      runtime.state++;
    }
  } else if (runtime.state === 5) {
    ack(runtime, 'DoWallpaperGfxChange');
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_JumpBox = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0) {
    PrintStorageMessage(runtime, MSG_JUMP_TO_WHICH_BOX);
    ack(runtime, `CreateChooseBoxMenuSprites:${runtime.storage.currentBox}`);
    runtime.state++;
  } else if (runtime.state === 1) {
    runtime.newCurrBoxId = runtime.boxChooseInput;
    if (runtime.newCurrBoxId === MENU_NOTHING_CHOSEN)
      return;
    ClearBottomWindow(runtime);
    if (runtime.newCurrBoxId === MENU_B_PRESSED || runtime.newCurrBoxId === runtime.storage.currentBox)
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    else
      runtime.state++;
  } else if (runtime.state === 2) {
    ack(runtime, `SetUpScrollToBox:${runtime.newCurrBoxId}`);
    runtime.state++;
  } else if (runtime.state === 3) {
    setCurrentBox(runtime.storage, runtime.newCurrBoxId);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  }
};

export const Task_NameBox = (runtime: PokemonStorageTasksRuntime): void => screenFadeTask(runtime, SCREEN_CHANGE_NAME_BOX);
export const Task_ShowMonSummary = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.state === 0)
    InitSummaryScreenData(runtime);
  screenFadeTask(runtime, SCREEN_CHANGE_SUMMARY_SCREEN);
};
export const Task_GiveItemFromBag = (runtime: PokemonStorageTasksRuntime): void => screenFadeTask(runtime, SCREEN_CHANGE_ITEM_FROM_BAG);

const screenFadeTask = (runtime: PokemonStorageTasksRuntime, screenType: number): void => {
  if (runtime.state === 0) {
    if (screenType === SCREEN_CHANGE_NAME_BOX)
      SaveMovingMon(runtime);
    runtime.paletteFadeActive = true;
    runtime.state++;
  } else if (runtime.state === 1 && !runtime.paletteFadeActive) {
    runtime.whichToReshow = screenType - 1;
    runtime.screenChangeType = screenType;
    SetPokeStorageTask(runtime, 'Task_ChangeScreen');
  }
};

export const Task_OnCloseBoxPressed = (runtime: PokemonStorageTasksRuntime): void => closeBoxTask(runtime, true);
export const Task_OnBPressed = (runtime: PokemonStorageTasksRuntime): void => closeBoxTask(runtime, false);

const closeBoxTask = (runtime: PokemonStorageTasksRuntime, closeButton: boolean): void => {
  if (runtime.state === 0) {
    if (IsMonBeingMoved(runtime)) {
      ack(runtime, 'PlaySE:SE_FAILURE');
      PrintStorageMessage(runtime, MSG_HOLDING_POKE);
      runtime.state = 1;
    } else if (runtime.activeItemMoving) {
      SetPokeStorageTask(runtime, 'Task_CloseBoxWhileHoldingItem');
    } else {
      PrintStorageMessage(runtime, closeButton ? MSG_EXIT_BOX : MSG_CONTINUE_BOX);
      ShowYesNoWindow(runtime, 0);
      runtime.state = 2;
    }
  } else if (runtime.state === 1 && runtime.newKeys) {
    ClearBottomWindow(runtime);
    SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
  } else if (runtime.state === 2) {
    const exitChosen = closeButton ? runtime.yesNoInput === 0 : runtime.yesNoInput === 1 || runtime.yesNoInput === MENU_B_PRESSED;
    const stayChosen = closeButton ? runtime.yesNoInput === 1 || runtime.yesNoInput === MENU_B_PRESSED : runtime.yesNoInput === 0;
    if (stayChosen) {
      ClearBottomWindow(runtime);
      SetPokeStorageTask(runtime, 'Task_PokeStorageMain');
    } else if (exitChosen) {
      ClearBottomWindow(runtime);
      runtime.state++;
    }
  } else if (runtime.state === 3) {
    runtime.pcScreenEffectRunning = true;
    runtime.state++;
  } else if (runtime.state === 4 && !runtime.pcScreenEffectRunning) {
    UpdateBoxToSendMons(runtime);
    runtime.screenChangeType = SCREEN_CHANGE_EXIT_BOX;
    SetPokeStorageTask(runtime, 'Task_ChangeScreen');
  }
};

export const Task_ChangeScreen = (runtime: PokemonStorageTasksRuntime, _taskId = runtime.taskId): void => {
  runtime.movingItemId = runtime.boxOption === OPTION_MOVE_ITEMS && runtime.activeItemMoving ? runtime.movingItemId : ITEM_NONE;
  switch (runtime.screenChangeType) {
    case SCREEN_CHANGE_SUMMARY_SCREEN:
      FreePokeStorageData(runtime);
      runtime.mainCallback2 = 'ShowPokemonSummaryScreen';
      break;
    case SCREEN_CHANGE_NAME_BOX:
      FreePokeStorageData(runtime);
      runtime.mainCallback2 = 'DoNamingScreen';
      break;
    case SCREEN_CHANGE_ITEM_FROM_BAG:
      FreePokeStorageData(runtime);
      runtime.mainCallback2 = 'GoToBagMenu';
      break;
    default:
      FreePokeStorageData(runtime);
      runtime.mainCallback2 = 'CB2_ExitPokeStorage';
      break;
  }
  ack(runtime, `DestroyTask:${runtime.taskId}`);
};

export const GiveChosenBagItem = (runtime: PokemonStorageTasksRuntime): void => {
  const item = runtime.chosenBagItem;
  if (item !== ITEM_NONE) {
    const id = GetBoxCursorPosition(runtime);
    const target = runtime.inPartyMenu ? runtime.playerParty[id] : runtime.storage.boxes[runtime.storage.currentBox][id];
    target.data = { ...(target.data ?? {}), heldItem: item } as DecompBoxPokemon['data'];
    ack(runtime, `RemoveBagItem:${item}:1`);
  }
};

export const FreePokeStorageData = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'TilemapUtil_Free');
  ack(runtime, 'MultiMove_Free');
  ack(runtime, 'FreeAllWindowBuffers');
};

export const SetScrollingBackground = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.gpuRegs.REG_OFFSET_BG3CNT = 3;
  ack(runtime, 'DecompressAndLoadBgGfxUsingHeap:scrolling_bg');
};

export const ScrollBackground = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.operations.push('ChangeBgX:3:128:1', 'ChangeBgY:3:128:2');
};

export const LoadPokeStorageMenuGfx = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'InitBgsFromTemplates');
  ack(runtime, 'DecompressAndLoadBgGfxUsingHeap:menu');
  ack(runtime, 'ScheduleBgCopyTilemapToVram:1');
};

export const InitPokeStorageWindows = (runtime: PokemonStorageTasksRuntime): boolean => {
  ack(runtime, 'InitWindows');
  ack(runtime, 'DeactivateAllTextPrinters');
  return true;
};

export const LoadsMiscSpritePalette = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'LoadSpritePalette:sMiscSpritePalette');
};

export const InitPalettesAndSprites = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'LoadPalette:gPokeStorageInterface_Pal');
  CreateDisplayMonSprite(runtime);
  CreateMarkingComboSprite(runtime);
  CreateWaveformSprites(runtime);
  RefreshDisplayMonData(runtime);
};

export const CreateMarkingComboSprite = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.markingComboSprite = { x: 40, y: 150, data: [], invisible: false, callback: 'SpriteCallbackDummy', oam: { mosaic: false, priority: 1 } };
};

export const CreateWaveformSprites = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.waveformSprites = [0, 1].map((i) => ({ x: i * 63 + 8, y: 9, data: [], invisible: false, callback: 'SpriteCallbackDummy', oam: { mosaic: false, priority: 0 } }));
};

export const RefreshDisplayMonData = (runtime: PokemonStorageTasksRuntime): void => {
  LoadDisplayMonGfx(runtime, runtime.displayMonSpecies, runtime.displayMonPersonality);
  PrintDisplayMonInfo(runtime);
  UpdateWaveformAnimation(runtime);
  ack(runtime, 'ScheduleBgCopyTilemapToVram:0');
};

export const StartDisplayMonMosaic = (runtime: PokemonStorageTasksRuntime): void => {
  RefreshDisplayMonData(runtime);
  if (runtime.displayMonSprite) {
    runtime.displayMonSprite.oam.mosaic = true;
    runtime.displayMonSprite.data[0] = 10;
    runtime.displayMonSprite.data[1] = 1;
    runtime.displayMonSprite.callback = 'SpriteCB_DisplayMonMosaic';
    runtime.gpuRegs.REG_OFFSET_MOSAIC = (10 << 12) | (10 << 8);
  }
};

export const IsDisplayMonMosaicActive = (runtime: PokemonStorageTasksRuntime): boolean =>
  Boolean(runtime.displayMonSprite?.oam.mosaic);

export const SpriteCB_DisplayMonMosaic = (runtime: PokemonStorageTasksRuntime, sprite: StorageTaskSprite): void => {
  sprite.data[0] -= sprite.data[1];
  if (sprite.data[0] < 0)
    sprite.data[0] = 0;
  runtime.gpuRegs.REG_OFFSET_MOSAIC = (sprite.data[0] << 12) | (sprite.data[0] << 8);
  if (sprite.data[0] === 0) {
    sprite.oam.mosaic = false;
    sprite.callback = 'SpriteCallbackDummy';
  }
};

export const CreateDisplayMonSprite = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.displayMonSprite = { x: 40, y: 48, data: [0, 0], invisible: true, callback: 'SpriteCallbackDummy', oam: { mosaic: false, priority: 0 } };
};

export const LoadDisplayMonGfx = (runtime: PokemonStorageTasksRuntime, species: number, personality: number): void => {
  if (!runtime.displayMonSprite)
    return;
  runtime.displayMonSprite.invisible = species === SPECIES_NONE;
  if (species !== SPECIES_NONE)
    ack(runtime, `LoadDisplayMonGfx:${species}:${personality}`);
};

export const PrintDisplayMonInfo = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, `PrintDisplayMonInfo:${runtime.boxOption}`);
  if (runtime.markingComboSprite)
    runtime.markingComboSprite.invisible = runtime.displayMonSpecies === SPECIES_NONE;
};

export const UpdateWaveformAnimation = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, runtime.displayMonSpecies !== SPECIES_NONE ? 'Waveform:on' : 'Waveform:off');
};

export const InitSupplementalTilemaps = (runtime: PokemonStorageTasksRuntime): void => {
  SetPartySlotTilemaps(runtime);
  UpdateCloseBoxButtonTilemap(runtime, true);
  runtime.closeBoxFlashing = false;
};

export const SetUpShowPartyMenu = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.partyMenuUnused1 = 20;
  runtime.partyMenuY = 2;
  runtime.partyMenuMoveTimer = 0;
  ack(runtime, 'CreatePartyMonsSprites:FALSE');
};

export const ShowPartyMenu = (runtime: PokemonStorageTasksRuntime): boolean => {
  if (runtime.partyMenuMoveTimer === 20)
    return false;
  runtime.partyMenuUnused1--;
  runtime.partyMenuY++;
  runtime.partyMenuMoveTimer++;
  if (runtime.partyMenuMoveTimer === 20) {
    runtime.inPartyMenu = true;
    return false;
  }
  return true;
};

export const SetUpHidePartyMenu = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.partyMenuUnused1 = 0;
  runtime.partyMenuY = 22;
  runtime.partyMenuMoveTimer = 0;
  if (runtime.boxOption === OPTION_MOVE_ITEMS)
    ack(runtime, 'MoveHeldItemWithPartyMenu');
};

export const HidePartyMenu = (runtime: PokemonStorageTasksRuntime): boolean => {
  if (runtime.partyMenuMoveTimer === 20)
    return false;
  runtime.partyMenuUnused1++;
  runtime.partyMenuY--;
  runtime.partyMenuMoveTimer++;
  if (runtime.partyMenuMoveTimer !== 20)
    return true;
  runtime.inPartyMenu = false;
  CompactPartySlots(runtime);
  return false;
};

export const UpdateCloseBoxButtonTilemap = (runtime: PokemonStorageTasksRuntime, normal: boolean): void => {
  ack(runtime, `UpdateCloseBoxButtonTilemap:${normal ? 1 : 0}`);
};

export const StartFlashingCloseBoxButton = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.closeBoxFlashing = true;
  runtime.closeBoxFlashTimer = 30;
  runtime.closeBoxFlashState = true;
};

export const StopFlashingCloseBoxButton = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.closeBoxFlashing) {
    runtime.closeBoxFlashing = false;
    UpdateCloseBoxButtonTilemap(runtime, true);
  }
};

export const UpdateCloseBoxButtonFlash = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.closeBoxFlashing && ++runtime.closeBoxFlashTimer > 30) {
    runtime.closeBoxFlashTimer = 0;
    runtime.closeBoxFlashState = !runtime.closeBoxFlashState;
    UpdateCloseBoxButtonTilemap(runtime, runtime.closeBoxFlashState);
  }
};

export const SetPartySlotTilemaps = (runtime: PokemonStorageTasksRuntime): void => {
  for (let i = 1; i < PARTY_SIZE; i++)
    SetPartySlotTilemap(runtime, i, runtime.playerParty[i]?.species !== SPECIES_NONE);
};

export const SetPartySlotTilemap = (runtime: PokemonStorageTasksRuntime, pos: number, isPartyMon: boolean): void => {
  runtime.partyMenuTilemapBuffer[pos] = isPartyMon ? 1 : 0;
};

export const UpdatePartySlotColors = (runtime: PokemonStorageTasksRuntime): void => {
  SetPartySlotTilemaps(runtime);
  ack(runtime, 'UpdatePartySlotColors');
};

export const SetUpDoShowPartyMenu = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.showPartyMenuState = 0;
  ack(runtime, 'PlaySE:SE_WIN_OPEN');
  SetUpShowPartyMenu(runtime);
};

export const DoShowPartyMenu = (runtime: PokemonStorageTasksRuntime): boolean => {
  if (runtime.showPartyMenuState === 0) {
    if (!ShowPartyMenu(runtime)) {
      SetCursorInParty(runtime);
      runtime.showPartyMenuState++;
    }
  } else if (runtime.showPartyMenuState === 1) {
    if (!UpdateCursorPos(runtime)) {
      if (runtime.setMosaic)
        StartDisplayMonMosaic(runtime);
      runtime.showPartyMenuState++;
    }
  } else if (runtime.showPartyMenuState === 2) {
    return false;
  }
  return true;
};

export const InitPokeStorageBg0 = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.gpuRegs.REG_OFFSET_BG0CNT = 0;
  ack(runtime, 'InitPokeStorageBg0');
};

export const PrintStorageMessage = (runtime: PokemonStorageTasksRuntime, textId: number): void => {
  runtime.messages.push(textId);
  ack(runtime, `PrintStorageMessage:${textId}`);
};

export const ShowYesNoWindow = (runtime: PokemonStorageTasksRuntime, cursorPos: number): void => {
  ack(runtime, `ShowYesNoWindow:${cursorPos}`);
};

export const ClearBottomWindow = (runtime: PokemonStorageTasksRuntime): void => {
  ack(runtime, 'ClearBottomWindow');
};

export const AddWallpaperSetsMenu = (runtime: PokemonStorageTasksRuntime): void => {
  runtime.menuItems = [];
  runtime.menuItemsCount = 0;
  for (const text of [MENU_TEXT_SCENERY_1, MENU_TEXT_SCENERY_2, MENU_TEXT_SCENERY_3, MENU_TEXT_ETCETERA])
    SetMenuText(runtime, text);
  AddMenu(runtime);
};

export const AddWallpapersMenu = (runtime: PokemonStorageTasksRuntime, wallpaperSet: number): void => {
  runtime.menuItems = [];
  runtime.menuItemsCount = 0;
  const sets = [
    [MENU_TEXT_FOREST, MENU_TEXT_CITY, MENU_TEXT_DESERT, MENU_TEXT_FOREST + 3],
    [MENU_TEXT_CRAG, MENU_TEXT_CRAG + 1, MENU_TEXT_CRAG + 2, MENU_TEXT_CRAG + 3],
    [MENU_TEXT_CRAG + 4, MENU_TEXT_CRAG + 5, MENU_TEXT_CRAG + 6, MENU_TEXT_CRAG + 7],
    [MENU_TEXT_POLKADOT, MENU_TEXT_POLKADOT + 1, MENU_TEXT_POLKADOT + 2, MENU_TEXT_POLKADOT + 3]
  ];
  for (const text of sets[wallpaperSet] ?? [])
    SetMenuText(runtime, text);
  AddMenu(runtime);
};

export const GetCurrentBoxOption = (runtime: PokemonStorageTasksRuntime): number =>
  runtime.currentBoxOption;

export const InitCursorItemIcon = (runtime: PokemonStorageTasksRuntime): void => {
  if (!IsCursorOnBoxTitle(runtime))
    ack(runtime, `TryLoadItemIconAtPos:${runtime.inPartyMenu ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX}:${GetBoxCursorPosition(runtime)}`);
  if (runtime.movingItemId !== ITEM_NONE) {
    ack(runtime, `InitItemIconInCursor:${runtime.movingItemId}`);
    StartCursorAnim(runtime, 3);
  }
};

export const SetPokeStorageQuestLogEvent = (runtime: PokemonStorageTasksRuntime, action: number): void => {
  const box1 = GetMovingMonOriginalBoxId(runtime);
  const box2 = runtime.inPartyMenu ? TOTAL_BOXES_COUNT : runtime.storage.currentBox;
  const data = { species1: runtime.displayMonSpecies, species2: SPECIES_NONE, box1, box2 };
  runtime.questLogEvents.push({ event: `action:${action}`, data });
};

export const UpdateBoxToSendMons = (runtime: PokemonStorageTasksRuntime): void => {
  if (runtime.lastUsedBox !== runtime.storage.currentBox) {
    runtime.shownBoxWasFullMessageCleared = true;
    runtime.boxToSendMonsVar = runtime.storage.currentBox;
  }
};
