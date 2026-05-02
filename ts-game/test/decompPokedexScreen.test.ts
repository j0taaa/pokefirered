import { describe, expect, test } from 'vitest';
import {
  B_BUTTON,
  DEX_CATEGORY_FOREST,
  DEX_CATEGORY_GRASSLAND,
  DEX_MODE_ATOZ,
  DEX_MODE_NUMERICAL_KANTO,
  DEX_MODE_NUMERICAL_NATIONAL,
  LIST_CANCEL,
  LIST_HEADER,
  R_BUTTON,
  START_BUTTON,
  CB2_ClosePokedex,
  CB2_OpenPokedexFromStartMenu,
  CB2_PokedexScreen,
  DexPage_TileBuffer_CopyCol,
  DexPage_TileBuffer_FillCol,
  DexScreen_AddTextPrinterParameterized,
  DexScreen_CanShowMonInDex,
  DexScreen_CountMonsInOrderedList,
  DexScreen_CreateCategoryListGfx,
  DexScreen_CreateCategoryMenuScrollArrows,
  DexScreen_CreateCategoryPageSelectionCursor,
  DexScreen_CreateCharacteristicListMenu,
  DexScreen_CreateDexOrderScrollArrows,
  DexScreen_DestroyAreaScreenResources,
  DexScreen_DestroyCategoryPageMonIconAndInfoWindows,
  DexScreen_DestroyDexOrderListMenu,
  DexScreen_DrawMonAreaPage,
  DexScreen_DrawMonDexPage,
  DexScreen_DrawMonFootprint,
  DexScreen_DrawMonPicInCategoryPage,
  DexScreen_FlipCategoryPageInDirection,
  DexScreen_GetDefaultPersonality,
  DexScreen_GetDexCount,
  DexScreen_GetPageLimitsForCategory,
  DexScreen_GetSetPokedexFlag,
  DexScreen_InitGfxForNumericalOrderList,
  DexScreen_InitGfxForTopMenu,
  DexScreen_InputHandler_GetShoulderInput,
  DexScreen_IsCategoryUnlocked,
  DexScreen_IsPageUnlocked,
  DexScreen_LoadMonPicInWindow,
  DexScreen_LoadResources,
  DexScreen_LookUpCategoryBySpecies,
  DexScreen_PageNumberToRenderablePages,
  DexScreen_PrintCategoryPageNumbers,
  DexScreen_PrintControlInfo,
  DexScreen_PrintMonCategory,
  DexScreen_PrintMonDexNo,
  DexScreen_PrintMonFlavorText,
  DexScreen_PrintMonHeight,
  DexScreen_PrintMonWeight,
  DexScreen_PrintNum3LeadingZeroes,
  DexScreen_PrintNum3RightAlign,
  DexScreen_PrintStringWithAlignment,
  DexScreen_RegisterMonToPokedex,
  DexScreen_RemoveWindow,
  DexScreen_TurnCategoryPage_BgEffect,
  DexScreen_TryScrollMonsVertical,
  DexScreen_UpdateCategoryPageCursorObject,
  DoClosePokedex,
  ItemPrintFunc_DexModeSelect,
  ItemPrintFunc_OrderedListMenu,
  MoveCursorFunc_DexModeSelect,
  RemoveDexPageWindows,
  Task_DexScreen_CategorySubmenu,
  Task_DexScreen_CharacteristicOrder,
  Task_DexScreen_NumericalOrder,
  Task_DexScreen_RegisterMonToPokedex,
  Task_DexScreen_RegisterNonKantoMonBeforeNationalDex,
  Task_DexScreen_ShowMonPage,
  Task_PokedexScreen,
  VBlankCB,
  createPokedexScreenRuntime
} from '../src/game/decompPokedexScreen';
import { FLAG_GET_CAUGHT, FLAG_GET_SEEN } from '../src/game/decompPokedex';

describe('decompPokedexScreen', () => {
  test('callbacks, opening, closing, resources, and top menu state preserve C side effects', () => {
    const runtime = createPokedexScreenRuntime({
      pokedex: { pokedex: { seenSpecies: ['BULBASAUR'], caughtSpecies: ['BULBASAUR'] } }
    });
    CB2_OpenPokedexFromStartMenu(runtime);
    expect(runtime.mainCallback2).toBe('CB2_PokedexScreen');
    expect(runtime.taskFunc).toBe('Task_PokedexScreen');
    expect(runtime.numSeenKanto).toBeGreaterThanOrEqual(1);

    VBlankCB(runtime);
    CB2_PokedexScreen(runtime);
    expect(runtime.operations).toContain('LoadOam');
    expect(runtime.operations).toContain('RunTasks');

    Task_PokedexScreen(runtime);
    expect(runtime.modeSelectWindowId).toBe(0);
    runtime.currentListInput = DEX_MODE_NUMERICAL_KANTO;
    Task_PokedexScreen(runtime);
    expect(runtime.taskFunc).toBe('Task_DexScreen_NumericalOrder');

    DoClosePokedex(runtime);
    expect(runtime.taskFunc).toBe('CB2_ClosePokedex');
    runtime.paletteFadeActive = false;
    CB2_ClosePokedex(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldWithOpenMenu');
    expect(DexScreen_LoadResources(runtime)).toBe(true);
  });

  test('mode cursor/list and numerical order task route list selections exactly', () => {
    const runtime = createPokedexScreenRuntime({
      nationalDexEnabled: false,
      orderLists: [[1, 152, 2]]
    });
    MoveCursorFunc_DexModeSelect(runtime, 3, false);
    expect(runtime.modeSelectCursorPos).toBe(3);
    expect(runtime.operations).toContain('PlaySE:SE_SELECT');

    ItemPrintFunc_DexModeSelect(runtime, 1, LIST_HEADER, 4);
    expect(runtime.windows[1].prints.at(-1)).toContain(`mode:${LIST_HEADER}`);
    expect(DexScreen_CountMonsInOrderedList(runtime, 0)).toBe(2);

    DexScreen_InitGfxForNumericalOrderList(runtime);
    expect(runtime.orderedDexCount).toBe(2);
    expect(runtime.listItems.map((item) => item.id)).toEqual([1, 152, 2]);
    expect(runtime.listItems.map((item) => (item.index! >> 16) & 1)).toEqual([1, 0, 1]);

    Task_DexScreen_NumericalOrder(runtime);
    expect(runtime.state).toBe(1);
    runtime.currentListInput = 25;
    Task_DexScreen_NumericalOrder(runtime);
    expect(runtime.taskFunc).toBe('Task_DexScreen_ShowMonPage');
    expect(runtime.dexSpecies).toBe(25);

    DexScreen_DestroyDexOrderListMenu(runtime, 0);
    expect(runtime.listItems).toEqual([]);
    expect(DexScreen_CreateDexOrderScrollArrows(runtime)).toBe(0);
    ItemPrintFunc_OrderedListMenu(runtime, 2, 25, 6);
    expect(runtime.windows[2].prints.at(-1)).toContain('025');
  });

  test('DexScreen_TryScrollMonsVertical skips hidden rows and updates the active order cursor pair', () => {
    const runtime = createPokedexScreenRuntime({
      dexOrderId: DEX_MODE_NUMERICAL_KANTO,
      orderedDexCount: 11,
      kantoOrderMenuCursorPos: 0,
      kantoOrderMenuItemsAbove: 0,
      listItems: Array.from({ length: 11 }, (_, i) => ({
        name: `row${i}`,
        id: i + 1,
        index: (i + 1) | ([0, 2, 5, 10].includes(i) ? 1 << 16 : 0)
      }))
    });

    expect(DexScreen_TryScrollMonsVertical(runtime, 1)).toBe(false);
    expect(DexScreen_TryScrollMonsVertical(runtime, 0)).toBe(true);
    expect(runtime.characteristicMenuInput).toBe((3 | (1 << 16)));
    expect(runtime.kantoOrderMenuCursorPos).toBe(0);
    expect(runtime.kantoOrderMenuItemsAbove).toBe(2);

    runtime.kantoOrderMenuCursorPos = 5;
    runtime.kantoOrderMenuItemsAbove = 0;
    expect(DexScreen_TryScrollMonsVertical(runtime, 0)).toBe(true);
    expect(runtime.characteristicMenuInput).toBe(11 | (1 << 16));
    expect(runtime.kantoOrderMenuCursorPos).toBe(2);
    expect(runtime.kantoOrderMenuItemsAbove).toBe(8);

    runtime.dexOrderId = DEX_MODE_ATOZ;
    runtime.characteristicOrderMenuCursorPos = 6;
    runtime.characteristicOrderMenuItemsAbove = 0;
    expect(DexScreen_TryScrollMonsVertical(runtime, 1)).toBe(true);
    expect(runtime.characteristicMenuInput).toBe(6 | (1 << 16));
    expect(runtime.characteristicOrderMenuCursorPos).toBe(1);
    expect(runtime.characteristicOrderMenuItemsAbove).toBe(4);

    runtime.dexOrderId = DEX_MODE_NUMERICAL_NATIONAL;
    runtime.nationalOrderMenuCursorPos = 2;
    runtime.nationalOrderMenuItemsAbove = 9;
    expect(DexScreen_TryScrollMonsVertical(runtime, 0)).toBe(false);
  });

  test('category submenu, page limits, lookup, cursor, flipping, and tile-buffer helpers mirror page state', () => {
    const runtime = createPokedexScreenRuntime({
      unlockedCategories: 1 << DEX_CATEGORY_GRASSLAND,
      modeSelectInput: DEX_CATEGORY_GRASSLAND,
      categoryPages: [[[1, 2], [3]], [[10]]]
    });
    Task_DexScreen_CategorySubmenu(runtime);
    expect(runtime.category).toBe(DEX_CATEGORY_GRASSLAND);
    expect(runtime.pageSpecies.slice(0, 2)).toEqual([1, 2]);
    expect(runtime.lastPageInCategory).toBe(1);

    expect(DexScreen_IsCategoryUnlocked(runtime, DEX_CATEGORY_GRASSLAND)).toBe(true);
    expect(DexScreen_IsCategoryUnlocked(runtime, DEX_CATEGORY_FOREST)).toBe(false);
    expect(DexScreen_IsPageUnlocked(runtime, DEX_CATEGORY_GRASSLAND, 1)).toBe(true);
    expect(DexScreen_GetPageLimitsForCategory(runtime, DEX_CATEGORY_GRASSLAND)).toBe(1);

    DexScreen_CreateCategoryPageSelectionCursor(runtime, 1);
    DexScreen_UpdateCategoryPageCursorObject(runtime, 0, 5, 2);
    expect(runtime.categoryCursorPosInPage).toBe(1);

    expect(DexScreen_FlipCategoryPageInDirection(runtime, 1)).toBe(true);
    expect(runtime.pageNum).toBe(1);
    expect(DexScreen_FlipCategoryPageInDirection(runtime, 1)).toBe(false);
    expect(DexScreen_LookUpCategoryBySpecies(runtime, 3)).toBe(true);
    expect(runtime.pageNum).toBe(1);

    const dst = [0, 0, 0];
    DexPage_TileBuffer_CopyCol(runtime, dst, [7, 8, 9], 1);
    DexPage_TileBuffer_FillCol(runtime, dst, 2, 6);
    expect(dst).toEqual([0, 8, 6]);
    expect(DexScreen_CreateCategoryMenuScrollArrows(runtime)).toBe(1);
    DexScreen_TurnCategoryPage_BgEffect(runtime, 0);
    DexScreen_PrintCategoryPageNumbers(runtime);
    expect(runtime.operations).toContain('DexScreen_PrintCategoryPageNumbers:1');
  });

  test('dex page, area page, text, number, flag, and count helpers preserve deterministic output', () => {
    const runtime = createPokedexScreenRuntime({
      dexSpecies: 25,
      pokedex: { pokedex: { seenSpecies: [], caughtSpecies: [] } }
    });
    expect(DexScreen_GetSetPokedexFlag(runtime, 1, 0)).toBe(0);
    DexScreen_RegisterMonToPokedex(runtime, 1);
    expect(DexScreen_GetSetPokedexFlag(runtime, 1, 0)).toBe(1);
    expect(DexScreen_GetDexCount(runtime, FLAG_GET_SEEN, false)).toBe(1);
    expect(DexScreen_GetDexCount(runtime, FLAG_GET_CAUGHT, true)).toBe(0);

    DexScreen_PrintNum3LeadingZeroes(runtime, 0, 0, 7, 1, 2, 3);
    DexScreen_PrintNum3RightAlign(runtime, 0, 0, 7, 1, 2, 3);
    DexScreen_PrintMonDexNo(runtime, 0, 0, 25, 0, 0);
    expect(runtime.windows[0].prints.some((line) => line.includes('007'))).toBe(true);
    expect(runtime.windows[0].prints.some((line) => line.includes('  7'))).toBe(true);
    expect(runtime.windows[0].prints.some((line) => line.includes('025'))).toBe(true);

    DexScreen_LoadMonPicInWindow(runtime, 3, 25, DexScreen_GetDefaultPersonality(25));
    DexScreen_PrintControlInfo(runtime, 'A/B');
    DexScreen_DrawMonPicInCategoryPage(runtime, 33, 2);
    expect(runtime.pageSpecies[2]).toBe(33);

    DexScreen_PrintMonCategory(runtime, 'MOUSE');
    DexScreen_PrintMonHeight(runtime, 4);
    DexScreen_PrintMonWeight(runtime, 60);
    DexScreen_PrintMonFlavorText(runtime, 'Electric mouse');
    DexScreen_DrawMonFootprint(runtime, 25);
    expect(DexScreen_DrawMonDexPage(runtime, true)).toBe(0);
    expect(runtime.operations).toContain('DexScreen_DrawMonDexPage:justRegistered');
    expect(DexScreen_DrawMonAreaPage(runtime)).toBe(0);
    expect(runtime.areaMarkersTaskId).toBe(0);
    expect(DexScreen_DestroyAreaScreenResources(runtime)).toBe(0);
    expect(runtime.areaMarkersTaskId).toBe(-1);
  });

  test('show-page, characteristic, register, remove-window, and alignment helpers follow task state', () => {
    const runtime = createPokedexScreenRuntime({ dexSpecies: 10 });
    Task_DexScreen_ShowMonPage(runtime);
    expect(runtime.state).toBe(1);
    runtime.newKeys = START_BUTTON;
    Task_DexScreen_ShowMonPage(runtime);
    expect(runtime.operations).toContain('PlayCry:10');

    runtime.newKeys = B_BUTTON;
    Task_DexScreen_ShowMonPage(runtime);
    expect(runtime.taskFunc).toBe('Task_DexScreen_NumericalOrder');

    const characteristic = createPokedexScreenRuntime();
    Task_DexScreen_CharacteristicOrder(characteristic);
    expect(characteristic.state).toBe(1);
    characteristic.currentListInput = LIST_CANCEL;
    Task_DexScreen_CharacteristicOrder(characteristic);
    expect(characteristic.taskFunc).toBe('Task_PokedexScreen');
    DexScreen_CreateCharacteristicListMenu(characteristic);
    expect(characteristic.operations).toContain('DexScreen_CreateCharacteristicListMenu');

    const ref = { value: 4 };
    DexScreen_AddTextPrinterParameterized(runtime, 4, 0, 'hello', 1, 2, 3);
    DexScreen_RemoveWindow(runtime, ref);
    expect(ref.value).toBe(-1);
    expect(runtime.windows[4].removed).toBe(true);

    DexScreen_PrintStringWithAlignment(runtime, 'abc', 0);
    DexScreen_PrintStringWithAlignment(runtime, 'abc', 1);
    DexScreen_PrintStringWithAlignment(runtime, 'abc', 2);
    expect(runtime.windows[0].prints.at(-1)).toContain('3,0,2:abc');

    Task_DexScreen_RegisterNonKantoMonBeforeNationalDex(runtime);
    expect(runtime.nationalDexEnabled).toBe(false);
    expect(runtime.taskFunc).toBe('Task_DexScreen_ShowMonPage');
    Task_DexScreen_RegisterMonToPokedex(runtime);
    expect(runtime.taskFunc).toBe('Task_DexScreen_ShowMonPage');

    expect(DexScreen_PageNumberToRenderablePages(runtime, 3)).toBe(6);
    expect(DexScreen_InputHandler_GetShoulderInput(createPokedexScreenRuntime({ heldKeys: R_BUTTON }))).toBe(1);
    expect(RemoveDexPageWindows(runtime)).toBe(0);
    expect(runtime.windowIds.every((id) => id === -1)).toBe(true);
  });

  test('category list and visibility helpers respect national dex gate', () => {
    const runtime = createPokedexScreenRuntime({ nationalDexEnabled: false });
    expect(DexScreen_CanShowMonInDex(runtime, 151)).toBe(true);
    expect(DexScreen_CanShowMonInDex(runtime, 152)).toBe(false);
    runtime.nationalDexEnabled = true;
    expect(DexScreen_CanShowMonInDex(runtime, 152)).toBe(true);

    runtime.category = 0;
    runtime.pageNum = 0;
    expect(DexScreen_CreateCategoryListGfx(runtime, true)).toBe(true);
    expect(runtime.operations).toContain('DexScreen_CreateCategoryListGfx:justRegistered');
    DexScreen_DestroyCategoryPageMonIconAndInfoWindows(runtime);
    expect(runtime.categoryMonWindowIds.every((id) => id === -1)).toBe(true);

    CB2_OpenPokedexFromStartMenu(runtime);
    DexScreen_InitGfxForTopMenu(runtime);
    expect(runtime.dexCountsWindowId).toBe(2);
  });
});
