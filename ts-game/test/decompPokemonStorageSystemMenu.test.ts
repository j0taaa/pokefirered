import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  BOXID_CANCELED,
  BOXID_NONE_CHOSEN,
  BOX_NAME_LENGTH,
  CB2_ExitPokeStorage,
  CountMonsInBox,
  CountPartyAliveNonEggMonsExcept,
  CountPartyAliveNonEggMons_IgnoreVar0x8004Slot,
  CountPartyMons,
  CountPartyNonEggMons,
  ChooseBoxMenu_CreateSprites,
  ChooseBoxMenu_DestroySprites,
  CreateChooseBoxMenuSprites,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  DestroyChooseBoxMenuSprites,
  DrawTextWindowAndBufferTiles,
  FADE_TO_BLACK,
  FieldTask_ReturnToPcMenu,
  FreeBoxSelectionPopupSpriteGfx,
  GetFirstFreeBoxSpot,
  HandleBoxChooseSelectionInput,
  IN_BOX_COUNT,
  LoadChooseBoxMenuGfx,
  MAX_DEFAULT_WALLPAPER,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  OPTION_DEPOSIT,
  OPTION_EXIT,
  OPTION_MOVE_ITEMS,
  OPTION_WITHDRAW,
  PARTY_SIZE,
  PrintStringToBufferCopyNow,
  ResetPokemonStorageSystem,
  STATE_ENTER_PC,
  STATE_ERROR_MSG,
  STATE_FADE_IN,
  STATE_HANDLE_INPUT,
  STATE_LOAD,
  SPECIES_NONE,
  ShowPokemonStorageSystemPC,
  SpriteCB_ChooseBoxArrow,
  StringCopyAndFillWithSpaces,
  TOTAL_BOXES_COUNT,
  Task_PCMainMenu,
  UnusedWriteRectCpu,
  UnusedWriteRectDma,
  createChooseBoxMenu,
  createStorageMenuRuntime,
  sMainMenuTexts,
} from '../src/game/decompPokemonStorageSystemMenu';

describe('decompPokemonStorageSystemMenu', () => {
  it('counts party and box Pokémon with the same species/egg/hp filters', () => {
    const runtime = createStorageMenuRuntime();
    runtime.boxes[2][0].species = 1;
    runtime.boxes[2][5].species = 25;

    expect(CountMonsInBox(runtime, 2)).toBe(2);
    expect(GetFirstFreeBoxSpot(runtime, 2)).toBe(1);
    for (let i = 0; i < IN_BOX_COUNT; i += 1) runtime.boxes[3][i].species = i + 1;
    expect(GetFirstFreeBoxSpot(runtime, 3)).toBe(-1);

    runtime.party = [
      { species: 1, isEgg: false, hp: 10 },
      { species: 2, isEgg: true, hp: 10 },
      { species: 3, isEgg: false, hp: 0 },
      { species: SPECIES_NONE, isEgg: false, hp: 0 },
      { species: 4, isEgg: false, hp: 5 },
      { species: 5, isEgg: false, hp: 6 },
    ];
    runtime.gSpecialVar_0x8004 = 4;
    expect(CountPartyMons(runtime)).toBe(5);
    expect(CountPartyNonEggMons(runtime)).toBe(4);
    expect(CountPartyAliveNonEggMonsExcept(runtime, 0)).toBe(2);
    expect(CountPartyAliveNonEggMons_IgnoreVar0x8004Slot(runtime)).toBe(2);
  });

  it('copies and fills text/tile buffers and unused rect helpers according to loop bounds', () => {
    const runtime = createStorageMenuRuntime();
    expect(StringCopyAndFillWithSpaces(runtime, 'BOX1', BOX_NAME_LENGTH)).toBe('BOX1    ');

    const textDst: number[] = [];
    DrawTextWindowAndBufferTiles(runtime, 'hello', textDst, 0, 3, null, 8);
    expect(textDst).toHaveLength(6 * 0x100 + 2 * 0x100);
    expect(runtime.operations).toContain('AddTextPrinterParameterized4:1:FONT_NORMAL_COPY_1:0:2:0:0:TRANSPARENT:DYNAMIC6:DYNAMIC5:-1:hello');

    const copyDst: number[] = [];
    PrintStringToBufferCopyNow(runtime, 'AB', copyDst, 0x100, 4, 5, 6, null);
    expect(copyDst[0]).toBe('A'.charCodeAt(0));
    expect(copyDst[1]).toBe('B'.charCodeAt(0));
    expect(copyDst[0x100]).toBe('A'.charCodeAt(0));

    const rectDst = Array(0x80).fill(9);
    const rectSrc = Array.from({ length: 0x80 }, (_, i) => i);
    UnusedWriteRectCpu(runtime, rectDst, 2, 1, rectSrc, 3, 2, 4, 2, 0x20);
    expect(rectDst[0x20 + 2]).toBe(rectSrc[0x40 + 3]);
    expect(rectDst[0x40 + 5]).toBe(rectSrc[0x60 + 6]);
    UnusedWriteRectDma(runtime, rectDst, 0, 0, 3, 2);
    expect(rectDst.slice(0, 3)).toEqual([0, 0, 0]);
    expect(rectDst.slice(0x20, 0x23)).toEqual([0, 0, 0]);
  });

  it('runs PC main menu load/fade/navigation/error/exit states 1:1', () => {
    const runtime = createStorageMenuRuntime();
    const taskId = ShowPokemonStorageSystemPC(runtime);
    const task = runtime.tasks[taskId];
    expect(runtime.playerLocked).toBe(true);
    expect(task.data[0]).toBe(STATE_LOAD);

    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_FADE_IN);
    expect(task.data[1]).toBe(0);
    expect(task.data[15]).toBeGreaterThan(0);
    expect(runtime.operations).toContain(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[0].desc}:TEXT_SKIP_DRAW`);

    runtime.weatherNotFadingIn = false;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_FADE_IN);
    runtime.weatherNotFadingIn = true;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_HANDLE_INPUT);

    runtime.menuInput = MENU_NOTHING_CHOSEN;
    runtime.newKeys = DPAD_UP;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[1]).toBe(OPTION_EXIT);
    expect(runtime.operations).toContain(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[OPTION_EXIT].desc}:0`);

    runtime.newKeys = DPAD_DOWN;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[1]).toBe(OPTION_WITHDRAW);

    runtime.party = Array.from({ length: PARTY_SIZE }, (_, i) => ({ species: i + 1, isEgg: false, hp: 1 }));
    runtime.menuInput = OPTION_WITHDRAW;
    runtime.newKeys = 0;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_ERROR_MSG);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized2:0:FONT_NORMAL:gText_PartyFull:0');

    runtime.newKeys = A_BUTTON;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_HANDLE_INPUT);
    expect(runtime.operations.at(-1)).toBe(`AddTextPrinterParameterized2:0:FONT_NORMAL:${sMainMenuTexts[OPTION_WITHDRAW].desc}:0`);

    runtime.menuInput = MENU_B_PRESSED;
    runtime.newKeys = 0;
    Task_PCMainMenu(runtime, taskId);
    expect(task.destroyed).toBe(true);
    expect(runtime.playerLocked).toBe(false);
    expect(runtime.scriptContextEnabled).toBe(true);
  });

  it('handles deposit error, error-message dpad branches, and enter-PC fade completion', () => {
    const runtime = createStorageMenuRuntime();
    const taskId = ShowPokemonStorageSystemPC(runtime);
    const task = runtime.tasks[taskId];
    Task_PCMainMenu(runtime, taskId);
    Task_PCMainMenu(runtime, taskId);

    runtime.party[0] = { species: 1, isEgg: false, hp: 1 };
    runtime.menuInput = OPTION_DEPOSIT;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_ERROR_MSG);
    expect(runtime.operations.at(-1)).toBe('AddTextPrinterParameterized2:0:FONT_NORMAL:gText_JustOnePkmn:0');

    runtime.cursorPos = OPTION_MOVE_ITEMS;
    runtime.newKeys = DPAD_DOWN;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_HANDLE_INPUT);
    expect(task.data[1]).toBe(OPTION_MOVE_ITEMS);
    expect(runtime.operations).toContain('Menu_MoveCursor:1');

    runtime.party[1] = { species: 2, isEgg: false, hp: 1 };
    runtime.menuInput = OPTION_DEPOSIT;
    runtime.newKeys = 0;
    Task_PCMainMenu(runtime, taskId);
    expect(task.data[0]).toBe(STATE_ENTER_PC);
    expect(runtime.operations).toContain(`FadeScreen:${FADE_TO_BLACK}:0`);
    runtime.paletteFadeActive = true;
    Task_PCMainMenu(runtime, taskId);
    expect(task.destroyed).toBe(false);
    runtime.paletteFadeActive = false;
    Task_PCMainMenu(runtime, taskId);
    expect(runtime.operations.slice(-2)).toEqual(['CleanupOverworldWindowsAndTilemaps', `EnterPokeStorage:${OPTION_DEPOSIT}`]);
    expect(task.destroyed).toBe(true);

    const exitRuntime = createStorageMenuRuntime();
    const exitTaskId = ShowPokemonStorageSystemPC(exitRuntime);
    const exitTask = exitRuntime.tasks[exitTaskId];
    Task_PCMainMenu(exitRuntime, exitTaskId);
    Task_PCMainMenu(exitRuntime, exitTaskId);
    exitRuntime.menuInput = OPTION_EXIT;
    Task_PCMainMenu(exitRuntime, exitTaskId);
    expect(exitTask.destroyed).toBe(true);
  });

  it('returns from storage, resets storage contents, and restores PC menu with previous option', () => {
    const runtime = createStorageMenuRuntime();
    runtime.currentBox = 5;
    CB2_ExitPokeStorage(runtime);
    expect(runtime.sPreviousBoxOption).toBe(5);
    expect(runtime.gFieldCallback).toBe('FieldTask_ReturnToPcMenu');
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');

    runtime.sPreviousBoxOption = 2;
    const taskId = FieldTask_ReturnToPcMenu(runtime);
    expect(runtime.tasks[taskId].data[1]).toBe(2);
    expect(runtime.tasks[taskId].data[0]).toBe(STATE_FADE_IN);
    expect(runtime.vblankCallback).toBe('VBlank');
    expect(runtime.operations).toContain('SetVBlankCallback:NULL');
    expect(runtime.operations).toContain('FadeInFromBlack');

    runtime.boxes[1][2].species = 25;
    runtime.boxNames[0] = 'OLD';
    runtime.boxWallpapers[0] = 99;
    ResetPokemonStorageSystem(runtime);
    expect(runtime.currentBox).toBe(0);
    expect(runtime.boxes[1][2].species).toBe(SPECIES_NONE);
    expect(runtime.boxNames[0]).toBe('BOX 1');
    expect(runtime.boxNames[9]).toBe('BOX10');
    expect(runtime.boxWallpapers.slice(0, 6)).toEqual([0, 1, 2, 3, 0, 1]);
    expect(Math.max(...runtime.boxWallpapers)).toBe(MAX_DEFAULT_WALLPAPER);
  });

  it('loads/frees choose-box graphics, creates/destroys sprites, and prints padded name/count text', () => {
    const runtime = createStorageMenuRuntime();
    const menu = createChooseBoxMenu();
    runtime.boxNames[1] = 'BOX2';
    runtime.boxes[1][0].species = 1;
    runtime.boxes[1][1].species = 2;

    LoadChooseBoxMenuGfx(runtime, menu, 100, 200, 7, true);
    expect(runtime.sChooseBoxMenu).toBe(menu);
    expect(menu).toMatchObject({ tileTag: 100, paletteTag: 200, subpriority: 7, loadedPalette: true });
    expect(runtime.operations).toContain('LoadSpritePalette:200');

    ChooseBoxMenu_CreateSprites(runtime, 1);
    expect(menu.curBox).toBe(1);
    expect(menu.menuSprite).not.toBeNull();
    expect(menu.menuCornerSprites.map((sprite) => sprite?.animNum)).toEqual([0, 1, 2, 3]);
    expect(menu.menuCornerSprites.map((sprite) => [sprite?.x, sprite?.y, sprite?.oam.size])).toEqual([[124, 80, '8x32'], [124, 112, '8x16'], [196, 80, '8x32'], [196, 112, '8x16']]);
    expect(menu.arrowSprites.map((sprite) => sprite?.data[0])).toEqual([-1, 1]);
    expect(menu.arrowSprites.map((sprite) => sprite?.callback)).toEqual(['SpriteCB_ChooseBoxArrow', 'SpriteCB_ChooseBoxArrow']);
    expect(menu.printedText).toContainEqual({ text: 'BOX2    ', x: 0, y: 1 });
    expect(menu.printedText).toContainEqual({ text: ' 2', x: 3, y: 3 });
    expect(menu.printedText).toContainEqual({ text: '/30', x: 5, y: 3 });

    ChooseBoxMenu_DestroySprites(runtime);
    expect(menu.menuSprite).toBeNull();
    expect(menu.menuCornerSprites.every((sprite) => sprite === null)).toBe(true);
    expect(menu.arrowSprites.every((sprite) => sprite?.destroyed)).toBe(true);

    FreeBoxSelectionPopupSpriteGfx(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['FreeSpritePaletteByTag:200', 'FreeSpriteTilesByTag:100', 'FreeSpriteTilesByTag:101']);

    const aliasMenu = createChooseBoxMenu();
    LoadChooseBoxMenuGfx(runtime, aliasMenu, 300, 400, 1, false);
    CreateChooseBoxMenuSprites(runtime, 0);
    DestroyChooseBoxMenuSprites(runtime);
    expect(aliasMenu.menuSprite).toBeNull();
  });

  it('handles choose-box input movement/wraparound and arrow sprite wobble', () => {
    const runtime = createStorageMenuRuntime();
    const menu = createChooseBoxMenu();
    LoadChooseBoxMenuGfx(runtime, menu, 1, 2, 3, false);
    runtime.boxNames[0] = 'A';
    runtime.boxNames[TOTAL_BOXES_COUNT - 1] = 'LAST';
    CreateChooseBoxMenuSprites(runtime, 0);

    runtime.newKeys = DPAD_LEFT;
    expect(HandleBoxChooseSelectionInput(runtime)).toBe(BOXID_NONE_CHOSEN);
    expect(menu.curBox).toBe(TOTAL_BOXES_COUNT - 1);
    expect(runtime.operations.at(-1)).toBe(`ChooseBoxMenu_PrintTextToSprite:${String(CountMonsInBox(runtime, menu.curBox)).padStart(2, ' ')}:3:3`);

    runtime.newKeys = DPAD_RIGHT;
    expect(HandleBoxChooseSelectionInput(runtime)).toBe(BOXID_NONE_CHOSEN);
    expect(menu.curBox).toBe(0);

    runtime.newKeys = A_BUTTON;
    expect(HandleBoxChooseSelectionInput(runtime)).toBe(0);
    runtime.newKeys = B_BUTTON;
    expect(HandleBoxChooseSelectionInput(runtime)).toBe(BOXID_CANCELED);

    const leftArrow = menu.arrowSprites[0]!;
    for (let i = 0; i < 4; i += 1) SpriteCB_ChooseBoxArrow(leftArrow);
    expect(leftArrow.x2).toBe(-1);
    expect(leftArrow.data[1]).toBe(0);
    expect(leftArrow.data[2]).toBe(1);
    for (let i = 0; i < 20; i += 1) SpriteCB_ChooseBoxArrow(leftArrow);
    expect(leftArrow.data[2]).toBe(0);
    expect(leftArrow.x2).toBe(0);
  });
});
