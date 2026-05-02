import { describe, expect, test } from 'vitest';
import {
  MENU_TEXT_CITY,
  MENU_TEXT_FOREST,
  MENU_TEXT_SCENERY_1,
  MSG_BAG_FULL,
  MSG_CANT_STORE_MAIL,
  MSG_EXIT_BOX,
  MSG_IS_SELECTED,
  MSG_PARTY_FULL,
  MSG_PICK_A_THEME,
  MSG_PLACED_IN_BAG,
  MSG_PUT_IN_BAG,
  MSG_RELEASE_POKE,
  MSG_WAS_RELEASED,
  SCREEN_CHANGE_EXIT_BOX,
  SCREEN_CHANGE_ITEM_FROM_BAG,
  SCREEN_CHANGE_NAME_BOX,
  SCREEN_CHANGE_SUMMARY_SCREEN,
  AddWallpapersMenu,
  AddWallpaperSetsMenu,
  CB2_PokeStorage,
  CB2_ReturnToPokeStorage,
  CreateDisplayMonSprite,
  DoShowPartyMenu,
  EnterPokeStorage,
  GetCurrentBoxOption,
  InitCursorItemIcon,
  InitPalettesAndSprites,
  InitPokeStorageWindows,
  IsDisplayMonMosaicActive,
  LoadDisplayMonGfx,
  PrintStorageMessage,
  SetPokeStorageQuestLogEvent,
  ShowPartyMenu,
  SpriteCB_DisplayMonMosaic,
  StartDisplayMonMosaic,
  StartFlashingCloseBoxButton,
  StopFlashingCloseBoxButton,
  Task_ChangeScreen,
  Task_CloseBoxWhileHoldingItem,
  Task_DepositMenu,
  Task_GiveItemFromBag,
  Task_HandleBoxOptions,
  Task_HandleWallpapers,
  Task_InitPokeStorage,
  Task_ItemToBag,
  Task_JumpBox,
  Task_NameBox,
  Task_OnBPressed,
  Task_OnCloseBoxPressed,
  Task_OnSelectedMon,
  Task_PokeStorageMain,
  Task_PrintCantStoreMail,
  Task_ReleaseMon,
  Task_ShowItemInfo,
  Task_ShowMonSummary,
  Task_ShowPokeStorage,
  Task_TakeItemForMoving,
  Task_WithdrawMon,
  UpdateBoxToSendMons,
  UpdateCloseBoxButtonFlash,
  VBlankCB_PokeStorage,
  createPokemonStorageTasksRuntime,
  type StorageTaskSprite
} from '../src/game/decompPokemonStorageSystemTasks';
import {
  A_BUTTON,
  CURSOR_AREA_IN_BOX,
  MENU_TEXT_CANCEL,
  MENU_TEXT_JUMP,
  MENU_TEXT_WALLPAPER,
  OPTION_MOVE_ITEMS,
  OPTION_MOVE_MONS,
  SPECIES_NONE,
  createEmptyBoxMon,
  type DecompBoxPokemon
} from '../src/game/decompPokemonStorageSystem';

const mon = (species: number, overrides: Partial<DecompBoxPokemon> = {}): DecompBoxPokemon => ({
  species,
  nickname: `M${species}`,
  level: 5,
  data: {},
  ...overrides
});

describe('decompPokemonStorageSystemTasks', () => {
  test('entry callbacks and init task preserve setup state progression and reopening branches', () => {
    const runtime = createPokemonStorageTasksRuntime({ storage: { ...createPokemonStorageTasksRuntime().storage, currentBox: 3 } });
    EnterPokeStorage(runtime, OPTION_MOVE_MONS);
    expect(runtime.currentBoxOption).toBe(OPTION_MOVE_MONS);
    expect(runtime.mainCallback2).toBe('CB2_PokeStorage');
    expect(runtime.lastUsedBox).toBe(3);

    CB2_ReturnToPokeStorage(runtime);
    expect(runtime.isReopening).toBe(true);
    expect(runtime.boxOption).toBe(OPTION_MOVE_MONS);

    Task_InitPokeStorage(runtime);
    expect(runtime.state).toBe(1);
    expect(runtime.operations).toContain('ResetPaletteFade');
    expect(runtime.operations).toContain('LoadSpritePalette:sMiscSpritePalette');

    expect(InitPokeStorageWindows(runtime)).toBe(true);
    runtime.state = 10;
    Task_InitPokeStorage(runtime);
    expect(runtime.taskFunc).toBe('Task_ReshowPokeStorage');
    expect(runtime.vblankCallback).toBe('VBlankCB_PokeStorage');

    VBlankCB_PokeStorage(runtime);
    expect(runtime.gpuRegs.REG_OFFSET_BG2HOFS).toBe(runtime.bg2_X);
    CB2_PokeStorage(runtime);
    expect(runtime.operations).toContain('AnimateSprites');
  });

  test('main task dispatches exact input branches for cursor, box options, close, scroll, and multimove', () => {
    const runtime = createPokemonStorageTasksRuntime({ boxOption: OPTION_MOVE_MONS });
    runtime.repeatKeys = 0;
    runtime.newKeys = 0;
    runtime.cursorMoveSteps = 1;
    runtime.cursorTargetX = runtime.cursorSprite.x;
    runtime.cursorTargetY = runtime.cursorSprite.y;
    runtime.cursorArea = CURSOR_AREA_IN_BOX;
    runtime.cursorPosition = 0;

    runtime.repeatKeys = 0;
    runtime.newKeys = 0;
    runtime.state = 1;
    runtime.cursorMoveSteps = 0;
    Task_PokeStorageMain(runtime);
    expect(runtime.state).toBe(0);

    runtime.taskFunc = 'Task_PokeStorageMain';
    runtime.state = 0;
    runtime.cursorArea = 3;
    runtime.cursorPosition = 1;
    runtime.newKeys = A_BUTTON;
    Task_PokeStorageMain(runtime);
    expect(runtime.taskFunc).toBe('Task_OnCloseBoxPressed');

    runtime.taskFunc = 'Task_PokeStorageMain';
    runtime.state = 0;
    runtime.cursorArea = 2;
    runtime.newKeys = A_BUTTON;
    Task_PokeStorageMain(runtime);
    expect(runtime.taskFunc).toBe('Task_HandleBoxOptions');

    const multi = createPokemonStorageTasksRuntime({ boxOption: OPTION_MOVE_MONS });
    multi.state = 0;
    multi.inBoxMovingMode = 2;
    multi.newKeys = A_BUTTON;
    multi.multiMoveCanPlaceSelection = true;
    Task_PokeStorageMain(multi);
    expect(multi.state).toBe(7);
  });

  test('selected-mon, withdraw, deposit, release, and mail/item tasks follow C state-machine outcomes', () => {
    const runtime = createPokemonStorageTasksRuntime({
      boxOption: OPTION_MOVE_MONS,
      cursorArea: CURSOR_AREA_IN_BOX,
      displayMonSpecies: 25,
      storage: createPokemonStorageTasksRuntime().storage
    });
    runtime.storage.boxes[0][0] = mon(25);
    runtime.menuItems = [{ textId: MENU_TEXT_CANCEL, text: 'cancel' }];
    runtime.menuItemsCount = 1;
    runtime.newKeys = A_BUTTON;

    Task_OnSelectedMon(runtime);
    expect(runtime.messages).toContain(MSG_IS_SELECTED);
    runtime.state = 2;
    runtime.menuCursorPos = 0;
    runtime.newKeys = A_BUTTON;
    Task_OnSelectedMon(runtime);
    expect(runtime.taskFunc).toBe('Task_PokeStorageMain');

    const fullParty = createPokemonStorageTasksRuntime({
      playerParty: Array.from({ length: 6 }, (_, i) => mon(i + 1))
    });
    Task_WithdrawMon(fullParty);
    expect(fullParty.messages).toContain(MSG_PARTY_FULL);

    const deposit = createPokemonStorageTasksRuntime({
      cursorArea: 1,
      cursorPosition: 0,
      playerParty: [mon(7), ...Array.from({ length: 5 }, () => createEmptyBoxMon())],
      boxChooseInput: 0
    });
    Task_DepositMenu(deposit);
    Task_DepositMenu(deposit);
    expect(deposit.storage.boxes[0][0].species).toBe(7);
    expect(deposit.questLogEvents.at(-1)?.event).toBe('action:2');

    const release = createPokemonStorageTasksRuntime({
      cursorArea: CURSOR_AREA_IN_BOX,
      cursorPosition: 0,
      displayMonNickname: 'MEW',
      storage: createPokemonStorageTasksRuntime().storage,
      yesNoInput: 0
    });
    release.storage.boxes[0][0] = mon(151);
    Task_ReleaseMon(release);
    expect(release.messages).toContain(MSG_RELEASE_POKE);
    expect(release.state).toBe(2);
    Task_ReleaseMon(release);
    expect(release.state).toBe(3);
    Task_ReleaseMon(release);
    expect(release.messages).toContain(MSG_WAS_RELEASED);

    const mail = createPokemonStorageTasksRuntime({ displayMonItemId: 99, itemIsMail: (id) => id === 99 });
    Task_TakeItemForMoving(mail);
    expect(mail.taskFunc).toBe('Task_PrintCantStoreMail');
    Task_PrintCantStoreMail(mail);
    expect(mail.messages).toContain(MSG_CANT_STORE_MAIL);
  });

  test('item-to-bag, close while holding item, screen-change, and bag item return paths mutate state exactly', () => {
    const item = createPokemonStorageTasksRuntime({ bagAddSucceeds: false });
    Task_ItemToBag(item);
    expect(item.messages).toContain(MSG_BAG_FULL);

    const ok = createPokemonStorageTasksRuntime({ bagAddSucceeds: true, itemIconAnimActive: false });
    Task_ItemToBag(ok);
    expect(ok.state).toBe(1);
    ok.itemIconAnimActive = false;
    Task_ItemToBag(ok);
    expect(ok.messages).toContain(MSG_PLACED_IN_BAG);

    const close = createPokemonStorageTasksRuntime({ activeItemMoving: true, movingItemId: 50, yesNoInput: 0, bagAddSucceeds: true });
    Task_CloseBoxWhileHoldingItem(close);
    expect(close.messages).toContain(MSG_PUT_IN_BAG);
    Task_CloseBoxWhileHoldingItem(close);
    expect(close.state).toBe(3);
    Task_CloseBoxWhileHoldingItem(close);
    expect(close.operations).toContain('MoveItemFromCursorToBag');

    const screen = createPokemonStorageTasksRuntime({ screenChangeType: SCREEN_CHANGE_SUMMARY_SCREEN });
    Task_ChangeScreen(screen);
    expect(screen.mainCallback2).toBe('ShowPokemonSummaryScreen');
    screen.screenChangeType = SCREEN_CHANGE_NAME_BOX;
    Task_ChangeScreen(screen);
    expect(screen.mainCallback2).toBe('DoNamingScreen');
    screen.screenChangeType = SCREEN_CHANGE_ITEM_FROM_BAG;
    Task_ChangeScreen(screen);
    expect(screen.mainCallback2).toBe('GoToBagMenu');
    screen.screenChangeType = SCREEN_CHANGE_EXIT_BOX;
    Task_ChangeScreen(screen);
    expect(screen.mainCallback2).toBe('CB2_ExitPokeStorage');
  });

  test('graphics/display helpers preserve mosaic, invisible state, waveform, close-button flash, and party menu counters', () => {
    const runtime = createPokemonStorageTasksRuntime({ displayMonSpecies: 25, displayMonPersonality: 123 });
    InitPalettesAndSprites(runtime);
    expect(runtime.displayMonSprite).not.toBeNull();
    expect(runtime.waveformSprites.length).toBe(2);
    expect(runtime.markingComboSprite?.x).toBe(40);

    StartDisplayMonMosaic(runtime);
    expect(IsDisplayMonMosaicActive(runtime)).toBe(true);
    const sprite = runtime.displayMonSprite as StorageTaskSprite;
    SpriteCB_DisplayMonMosaic(runtime, sprite);
    expect(sprite.data[0]).toBe(9);
    sprite.data[0] = 0;
    SpriteCB_DisplayMonMosaic(runtime, sprite);
    expect(sprite.oam.mosaic).toBe(false);

    const fresh = createPokemonStorageTasksRuntime();
    CreateDisplayMonSprite(fresh);
    LoadDisplayMonGfx(fresh, SPECIES_NONE, 0);
    expect(fresh.displayMonSprite?.invisible).toBe(true);
    PrintStorageMessage(runtime, MSG_EXIT_BOX);
    expect(runtime.messages.at(-1)).toBe(MSG_EXIT_BOX);

    StartFlashingCloseBoxButton(runtime);
    UpdateCloseBoxButtonFlash(runtime);
    expect(runtime.closeBoxFlashState).toBe(false);
    StopFlashingCloseBoxButton(runtime);
    expect(runtime.closeBoxFlashing).toBe(false);

    ShowPartyMenu(runtime);
    expect(runtime.partyMenuMoveTimer).toBe(1);
    while (ShowPartyMenu(runtime)) undefined;
    expect(runtime.inPartyMenu).toBe(true);
    runtime.showPartyMenuState = 0;
    expect(DoShowPartyMenu(runtime)).toBe(true);
  });

  test('box option, wallpaper, jump, close/B handlers, and box-to-send helpers match task side effects', () => {
    const runtime = createPokemonStorageTasksRuntime({ currentBoxOption: OPTION_MOVE_ITEMS });
    expect(GetCurrentBoxOption(runtime)).toBe(OPTION_MOVE_ITEMS);

    AddWallpaperSetsMenu(runtime);
    expect(runtime.menuItems.map((item) => item.textId)).toEqual([MENU_TEXT_SCENERY_1, 19, 20, 21]);
    AddWallpapersMenu(runtime, 0);
    expect(runtime.menuItems.map((item) => item.textId)).toEqual([MENU_TEXT_FOREST, MENU_TEXT_CITY, 24, 25]);

    const box = createPokemonStorageTasksRuntime({ menuItems: [{ textId: MENU_TEXT_JUMP, text: 'jump' }], menuItemsCount: 1, menuCursorPos: 0, newKeys: A_BUTTON });
    Task_HandleBoxOptions(box);
    Task_HandleBoxOptions(box);
    box.menuItems = [{ textId: MENU_TEXT_JUMP, text: 'jump' }];
    box.menuItemsCount = 1;
    box.menuCursorPos = 0;
    box.newKeys = A_BUTTON;
    Task_HandleBoxOptions(box);
    expect(box.taskFunc).toBe('Task_JumpBox');

    const jump = createPokemonStorageTasksRuntime({ boxChooseInput: 2 });
    Task_JumpBox(jump);
    Task_JumpBox(jump);
    Task_JumpBox(jump);
    Task_JumpBox(jump);
    expect(jump.storage.currentBox).toBe(2);

    const wall = createPokemonStorageTasksRuntime({ menuItems: [{ textId: MENU_TEXT_WALLPAPER, text: 'wall' }], menuItemsCount: 1, menuCursorPos: 0, newKeys: A_BUTTON });
    Task_HandleWallpapers(wall);
    expect(wall.messages).toContain(MSG_PICK_A_THEME);

    const close = createPokemonStorageTasksRuntime({ yesNoInput: 0 });
    Task_OnCloseBoxPressed(close);
    expect(close.messages).toContain(MSG_EXIT_BOX);
    Task_OnCloseBoxPressed(close);
    expect(close.state).toBe(3);

    const b = createPokemonStorageTasksRuntime({ yesNoInput: 1 });
    Task_OnBPressed(b);
    expect(b.messages.at(-1)).toBe(18);
    Task_OnBPressed(b);
    expect(b.state).toBe(3);

    const moved = createPokemonStorageTasksRuntime({ lastUsedBox: 0 });
    moved.storage.currentBox = 4;
    UpdateBoxToSendMons(moved);
    expect(moved.boxToSendMonsVar).toBe(4);
    expect(moved.shownBoxWasFullMessageCleared).toBe(true);

    const icon = createPokemonStorageTasksRuntime({ boxOption: OPTION_MOVE_ITEMS, movingItemId: 99 });
    InitCursorItemIcon(icon);
    expect(icon.operations).toContain('InitItemIconInCursor:99');
    SetPokeStorageQuestLogEvent(icon, 3);
    expect(icon.questLogEvents.at(-1)?.event).toBe('action:3');
  });

  test('screen fade tasks and show/item info helpers transition to task change or main loop', () => {
    const name = createPokemonStorageTasksRuntime({ paletteFadeActive: false });
    Task_NameBox(name);
    expect(name.state).toBe(1);
    name.paletteFadeActive = false;
    Task_NameBox(name);
    expect(name.taskFunc).toBe('Task_ChangeScreen');
    expect(name.screenChangeType).toBe(SCREEN_CHANGE_NAME_BOX);

    const summary = createPokemonStorageTasksRuntime({ paletteFadeActive: false });
    Task_ShowMonSummary(summary);
    summary.paletteFadeActive = false;
    Task_ShowMonSummary(summary);
    expect(summary.screenChangeType).toBe(SCREEN_CHANGE_SUMMARY_SCREEN);

    const bag = createPokemonStorageTasksRuntime({ paletteFadeActive: false });
    Task_GiveItemFromBag(bag);
    bag.paletteFadeActive = false;
    Task_GiveItemFromBag(bag);
    expect(bag.screenChangeType).toBe(SCREEN_CHANGE_ITEM_FROM_BAG);

    const show = createPokemonStorageTasksRuntime();
    Task_ShowPokeStorage(show);
    expect(show.pcScreenEffectRunning).toBe(true);
    show.pcScreenEffectRunning = false;
    Task_ShowPokeStorage(show);
    expect(show.taskFunc).toBe('Task_PokeStorageMain');

    const info = createPokemonStorageTasksRuntime({ dmaBusy: false });
    Task_ShowItemInfo(info);
    Task_ShowItemInfo(info);
    expect(info.operations).toContain('PrintItemDescription');
  });
});
