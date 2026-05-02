import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  ACTION_EXIT,
  ACTION_GIVE,
  ACTION_USE,
  ANIM_HM,
  ANIM_TM,
  B_BUTTON,
  CB2_Idle,
  CB2_SetUpTMCaseUI_Blocking,
  calculateTmSaleAmount,
  clampTMCaseSaleQuantityOwned,
  compactTMCaseSlots,
  createTMCaseRuntime,
  CreateListScrollArrows,
  CreateDiscSprite,
  DISC_CASE_DISTANCE,
  DISC_HIDDEN,
  DISC_Y_MOVE,
  GetTMNumberAndMoveString,
  HandleLoadTMCaseGraphicsAndPalettes,
  InitTMCase,
  InitTMCaseListMenuItems,
  ITEM_TM03,
  ITEM_TM09,
  ITEM_TM35,
  isTMCaseHM,
  ITEM_HM08,
  ITEM_TM01,
  ITEM_TM50,
  LIST_CANCEL,
  List_MoveCursorFunc,
  LIST_NOTHING_CHOSEN,
  List_ItemPrintFunc,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  NUM_DISC_COLORS,
  Pokedude_InitTMCase,
  POKEDUDE_INPUT_DELAY,
  PrintDescription,
  PrintListCursorAtRow,
  PrintMoveInfo,
  QL_EVENT_SOLD_ITEM,
  QL_EVENT_USED_POKEMART,
  RemoveScrollArrows,
  ResetTMCaseCursorPos,
  selectTMCaseMenuActionIndices,
  SE_SELECT,
  SE_SHOP,
  SetDescriptionWindowShade,
  SetDiscSpriteAnim,
  SetDiscSpritePosition,
  SpriteCB_SwapDisc,
  sTMSpritePaletteOffsetByType,
  SwapDisc,
  TASK_NONE,
  SELECT_BUTTON,
  Task_AfterSale_ReturnToList,
  Task_ContextMenu_HandleInput,
  Task_DoSaleOfTMs,
  Task_HandleListInput,
  Task_InitQuantitySelectUI,
  Task_Pokedude_Run,
  Task_Pokedude_Start,
  Task_PrintSaleConfirmedText,
  Task_QuantitySelect_HandleInput,
  Task_SelectedTMHM_Field,
  Task_SelectedTMHM_GivePC,
  Task_SelectedTMHM_GiveParty,
  Task_SelectedTMHM_Sell,
  Task_WaitButtonAfterErrorPrint,
  TMCASE_FIELD,
  TMCASE_GIVE_PC,
  TMCASE_GIVE_PARTY,
  TMCASE_POKEDUDE,
  TMCASE_SELL,
  TMCaseSetup_GetTMCount,
  TMCaseSetup_InitListMenuPositions,
  TMCaseSetup_UpdateVisualMenuOffset
} from '../src/game/decompTmCase';
import { ITEM_HM01, ITEM_NONE, type ItemSlot } from '../src/game/decompItem';
import { gText_TMCaseWillBePutAway } from '../src/game/decompStrings';

describe('decomp tm case', () => {
  test('initializes TM Case resources and runs the C setup state machine to the idle callbacks', () => {
    const runtime = createTMCaseRuntime({
      slots: [
        { itemId: ITEM_TM01, quantity: 2 },
        { itemId: ITEM_TM50, quantity: 1 }
      ],
      staticResources: { menuType: TMCASE_FIELD, allowSelectClose: true, selectedRow: 1, scrollOffset: 0, exitCallback: null }
    });

    InitTMCase(runtime, TMCASE_SELL, 'ExitCB', false);
    expect(runtime.staticResources).toMatchObject({ menuType: TMCASE_SELL, allowSelectClose: false, exitCallback: 'ExitCB' });
    expect(runtime.textFlagsAutoScroll).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_SetUpTMCaseUI_Blocking');

    CB2_SetUpTMCaseUI_Blocking(runtime);

    expect(runtime.mainState).toBe(19);
    expect(runtime.vblankCallback).toBe('VBlankCB_Idle');
    expect(runtime.mainCallback2).toBe('CB2_Idle');
    expect(runtime.dynamicResources).toMatchObject({ numTMs: 2, maxTMsShown: 3, scrollArrowsTaskId: 0, discSpriteId: 0 });
    expect(runtime.listMenuItems.map((item) => item.index)).toEqual([0, 1, LIST_CANCEL]);
    expect(runtime.discSprite).toMatchObject({ itemId: ITEM_TM50 });
    expect(runtime.task.func).toBe('Task_HandleListInput');

    CB2_Idle(runtime);
    expect(runtime.operations.slice(-5)).toEqual([
      'RunTasks',
      'AnimateSprites',
      'BuildOamBuffer',
      'DoScheduledBgTilemapCopiesToVram',
      'UpdatePaletteFade'
    ]);
  });

  test('graphics loader, cursor helpers, list cursor callback, and scroll arrows match C-side side effects', () => {
    const runtime = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 1 }],
      discSprite: CreateDiscSprite(ITEM_TM01),
      staticResources: { menuType: TMCASE_FIELD, allowSelectClose: true, selectedRow: 2, scrollOffset: 4, exitCallback: null }
    });

    for (let i = 0; i < 5; i += 1)
      expect(HandleLoadTMCaseGraphicsAndPalettes(runtime)).toBe(false);
    expect(HandleLoadTMCaseGraphicsAndPalettes(runtime)).toBe(true);
    expect(runtime.dynamicResources.seqId).toBe(0);

    SetDescriptionWindowShade(runtime, 1);
    PrintListCursorAtRow(runtime, 18, 2);
    PrintListCursorAtRow(runtime, 18, 0xff);
    List_MoveCursorFunc(runtime, 0, false);
    expect(runtime.playedSoundEffects).toEqual([SE_SELECT]);
    expect(runtime.discSprite).toMatchObject({ callback: 'swap', itemId: ITEM_TM01 });
    expect(runtime.operations).toContain(`PrintDescription:${PrintDescription(runtime.slots, 0)}`);
    expect(runtime.operations).toContain('PrintMoveInfo:289');

    CreateListScrollArrows(runtime);
    expect(runtime.dynamicResources.scrollArrowsTaskId).toBe(0);
    RemoveScrollArrows(runtime);
    expect(runtime.dynamicResources.scrollArrowsTaskId).toBe(TASK_NONE);

    ResetTMCaseCursorPos(runtime);
    expect(runtime.staticResources).toMatchObject({ selectedRow: 0, scrollOffset: 0 });
  });

  test('formats TM and HM labels with the exact C prefix/number/move string shape', () => {
    expect(GetTMNumberAndMoveString(ITEM_TM01)).toBe('{FONT_SMALL}{NO}{CLEAR 0x01}01 {FONT_NORMAL}FOCUS PUNCH');
    expect(GetTMNumberAndMoveString(ITEM_TM50)).toBe('{FONT_SMALL}{NO}{CLEAR 0x01}50 {FONT_NORMAL}OVERHEAT');
    expect(GetTMNumberAndMoveString(ITEM_HM01)).toBe('{FONT_SMALL}{CLEAR_TO 18}{NO}{CLEAR 0x01}1 {FONT_NORMAL}CUT');
    expect(GetTMNumberAndMoveString(ITEM_HM08)).toBe('{FONT_SMALL}{CLEAR_TO 18}{NO}{CLEAR 0x01}8 {FONT_NORMAL}DIVE');
  });

  test('compacts the TM pocket and computes count/max shown like TMCaseSetup_GetTMCount', () => {
    const slots: ItemSlot[] = [
      { itemId: ITEM_NONE, quantity: 0 },
      { itemId: ITEM_TM01, quantity: 2 },
      { itemId: ITEM_HM01, quantity: 1 },
      { itemId: ITEM_TM50, quantity: 0 },
      { itemId: ITEM_TM50, quantity: 3 }
    ];

    const result = TMCaseSetup_GetTMCount(slots, slots.length);
    expect(result.slots.map((slot) => slot.itemId)).toEqual([ITEM_TM01, ITEM_HM01, ITEM_TM50, ITEM_NONE, ITEM_NONE]);
    expect(result.numTMs).toBe(3);
    expect(result.maxTMsShown).toBe(4);
    expect(compactTMCaseSlots(slots, slots.length).at(-1)).toEqual({ itemId: ITEM_NONE, quantity: 0 });
  });

  test('repairs saved scroll and row using the same bounds checks as the C setup', () => {
    const staticResources = {
      menuType: 0,
      allowSelectClose: true,
      selectedRow: 5,
      scrollOffset: 4
    };

    const repaired = TMCaseSetup_InitListMenuPositions(staticResources, { numTMs: 3, maxTMsShown: 4 });
    expect(repaired.scrollOffset).toBe(0);
    expect(repaired.selectedRow).toBe(3);

    const visual = TMCaseSetup_UpdateVisualMenuOffset(
      { menuType: 0, allowSelectClose: true, selectedRow: 6, scrollOffset: 0 },
      { numTMs: 8, maxTMsShown: 5 }
    );
    expect(visual).toMatchObject({ selectedRow: 4, scrollOffset: 2 });
  });

  test('builds list items, quantity decorations, HM tile marker, and cancel description', () => {
    const slots: ItemSlot[] = [
      { itemId: ITEM_TM01, quantity: 2 },
      { itemId: ITEM_HM01, quantity: 1 }
    ];

    expect(InitTMCaseListMenuItems(slots, 2)).toEqual([
      { label: '{FONT_SMALL}{NO}{CLEAR 0x01}01 {FONT_NORMAL}FOCUS PUNCH', index: 0 },
      { label: '{FONT_SMALL}{CLEAR_TO 18}{NO}{CLEAR 0x01}1 {FONT_NORMAL}CUT', index: 1 },
      { label: 'Close', index: LIST_CANCEL }
    ]);
    expect(List_ItemPrintFunc(slots, 0)).toBe('×  2');
    expect(List_ItemPrintFunc(slots, 1)).toBe('HM_TILE');
    expect(PrintDescription(slots, LIST_CANCEL)).toBe(gText_TMCaseWillBePutAway);
  });

  test('prints move info fields with C hyphen rules and type icon offset', () => {
    expect(PrintMoveInfo(ITEM_NONE)).toEqual({
      itemId: ITEM_NONE,
      moveId: null,
      typeIcon: null,
      power: '---',
      accuracy: '---',
      pp: '---'
    });
    expect(PrintMoveInfo(ITEM_TM01)).toMatchObject({
      moveId: 'MOVE_FOCUS_PUNCH',
      typeIcon: 2,
      power: '150',
      accuracy: '100',
      pp: ' 20'
    });
    expect(PrintMoveInfo(ITEM_HM01)).toMatchObject({
      moveId: 'MOVE_CUT',
      typeIcon: 1,
      power: ' 50',
      accuracy: ' 95',
      pp: ' 30'
    });
  });

  test('selects field vs union-room context menu action arrays exactly', () => {
    expect(selectTMCaseMenuActionIndices(false, false)).toEqual([ACTION_USE, ACTION_GIVE, ACTION_EXIT]);
    expect(selectTMCaseMenuActionIndices(true, false)).toEqual([ACTION_GIVE, ACTION_EXIT]);
    expect(selectTMCaseMenuActionIndices(false, true)).toEqual([ACTION_GIVE, ACTION_EXIT]);
  });

  test('uses importance for HM checks and price / 2 * quantity for sales', () => {
    expect(isTMCaseHM(ITEM_TM01)).toBe(false);
    expect(isTMCaseHM(ITEM_HM01)).toBe(true);
    expect(calculateTmSaleAmount(ITEM_TM01, 3)).toBe(4500);
    expect(calculateTmSaleAmount(ITEM_HM01, 3)).toBe(0);
    expect(clampTMCaseSaleQuantityOwned(100)).toBe(99);
    expect(clampTMCaseSaleQuantityOwned(42)).toBe(42);
  });

  test('ports disc palette offsets, animations, and fixed-point positions', () => {
    expect(NUM_DISC_COLORS).toBe(272);
    expect(sTMSpritePaletteOffsetByType[10]).toBe(0x010);
    expect(sTMSpritePaletteOffsetByType[16]).toBe(0x100);
    expect(SetDiscSpriteAnim(0)).toBe(ANIM_TM);
    expect(SetDiscSpriteAnim(50)).toBe(ANIM_HM);
    expect(SetDiscSpritePosition(DISC_HIDDEN)).toEqual({ x: 27, y: 54, y2: DISC_CASE_DISTANCE });
    expect(SetDiscSpritePosition(0)).toEqual({ x: 40, y: 47, y2: 0 });
    expect(SetDiscSpritePosition(50)).toEqual({ x: 41, y: 46, y2: 0 });
    expect(SetDiscSpritePosition(57)).toEqual({ x: 40, y: 46, y2: 0 });
  });

  test('steps SpriteCB_SwapDisc through the same lower/setup/raise states', () => {
    let sprite = CreateDiscSprite(ITEM_TM01);
    expect(sprite).toMatchObject({ anim: ANIM_TM, callback: 'dummy', y2: 0 });

    sprite = SwapDisc(sprite, ITEM_HM01);
    sprite = SpriteCB_SwapDisc(sprite);
    expect(sprite.y2).toBe(DISC_Y_MOVE);
    sprite = SpriteCB_SwapDisc(sprite);
    expect(sprite.y2).toBe(DISC_CASE_DISTANCE);
    sprite = SpriteCB_SwapDisc(sprite);
    expect(sprite).toMatchObject({ anim: ANIM_HM, itemId: ITEM_HM01 - ITEM_TM01, state: 1, y2: 0 });
    sprite = SpriteCB_SwapDisc(sprite);
    expect(sprite.callback).toBe('dummy');

    let hidden = CreateDiscSprite(ITEM_NONE);
    hidden = SwapDisc(hidden, ITEM_NONE);
    hidden = SpriteCB_SwapDisc(hidden);
    expect(hidden.callback).toBe('dummy');
  });

  test('handles list input, SELECT close, cancel, and dispatches by TM case mode like the task switch', () => {
    const selectClose = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 2 }],
      newKeys: SELECT_BUTTON
    });
    Task_HandleListInput(selectClose);
    expect(selectClose.playedSoundEffects).toEqual([SE_SELECT]);
    expect(selectClose.gSpecialVar_ItemId).toBe(ITEM_NONE);
    expect(selectClose.task.func).toBe('Task_FadeOutAndCloseTMCase');
    expect(selectClose.operations).toContain('Task_BeginFadeOutFromTMCase');

    const nothing = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 2 }],
      listInput: LIST_NOTHING_CHOSEN
    });
    Task_HandleListInput(nothing);
    expect(nothing.playedSoundEffects).toEqual([]);
    expect(nothing.task.func).toBe('Task_HandleListInput');

    const cancel = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 2 }],
      listInput: LIST_CANCEL
    });
    Task_HandleListInput(cancel);
    expect(cancel.playedSoundEffects).toEqual([SE_SELECT]);
    expect(cancel.gSpecialVar_ItemId).toBe(ITEM_NONE);
    expect(cancel.task.func).toBe('Task_FadeOutAndCloseTMCase');

    const selected = createTMCaseRuntime({
      staticResources: { menuType: TMCASE_SELL, allowSelectClose: true, selectedRow: 0, scrollOffset: 0 },
      slots: [
        { itemId: ITEM_TM01, quantity: 2 },
        { itemId: ITEM_HM01, quantity: 1 }
      ],
      listInput: 1
    });
    Task_HandleListInput(selected);
    expect(selected.playedSoundEffects).toEqual([SE_SELECT]);
    expect(selected.operations).toEqual([
      'SetDescriptionWindowShade:1',
      'RemoveScrollArrows',
      'PrintListCursor:COLOR_CURSOR_SELECTED'
    ]);
    expect(selected.task.data[1]).toBe(1);
    expect(selected.task.data[2]).toBe(1);
    expect(selected.gSpecialVar_ItemId).toBe(ITEM_HM01);
    expect(selected.task.func).toBe('Task_SelectedTMHM_Sell');
  });

  test('creates the same field context menus and routes B/default choices through action callbacks', () => {
    const field = createTMCaseRuntime({
      gSpecialVar_ItemId: ITEM_TM01,
      playerPartyCount: 2
    });
    Task_SelectedTMHM_Field(field);
    expect(field.dynamicResources.menuActionIndices).toEqual([ACTION_USE, ACTION_GIVE, ACTION_EXIT]);
    expect(field.dynamicResources.numMenuActions).toBe(3);
    expect(field.dynamicResources.contextMenuWindowId).toBe(0);
    expect(field.task.func).toBe('Task_ContextMenu_HandleInput');
    expect(field.operations).toContain(`Selected:${GetTMNumberAndMoveString(ITEM_TM01)}`);

    field.contextInput = MENU_NOTHING_CHOSEN;
    Task_ContextMenu_HandleInput(field);
    expect(field.playedSoundEffects).toEqual([]);

    field.contextInput = MENU_B_PRESSED;
    Task_ContextMenu_HandleInput(field);
    expect(field.playedSoundEffects).toEqual([SE_SELECT]);
    expect(field.operations).toContain('RemoveContextMenu');
    expect(field.task.func).toBe('Task_HandleListInput');

    const unionHm = createTMCaseRuntime({
      gSpecialVar_ItemId: ITEM_HM01,
      inUnionRoom: true
    });
    Task_SelectedTMHM_Field(unionHm);
    expect(unionHm.dynamicResources.menuActionIndices).toEqual([ACTION_GIVE, ACTION_EXIT]);
    expect(unionHm.dynamicResources.contextMenuWindowId).toBe(1);
    expect(unionHm.operations).toContain('PlaceHMTileInWindow');

    const useWithNoParty = createTMCaseRuntime({
      gSpecialVar_ItemId: ITEM_TM01,
      playerPartyCount: 0,
      contextInput: 0
    });
    Task_SelectedTMHM_Field(useWithNoParty);
    Task_ContextMenu_HandleInput(useWithNoParty);
    expect(useWithNoParty.playedSoundEffects).toEqual([SE_SELECT]);
    expect(useWithNoParty.operations).toContain('PrintError_ThereIsNoPokemon');
    expect(useWithNoParty.task.func).toBe('Task_WaitButtonAfterErrorPrint');
  });

  test('ports use/give party/PC gates including HM rejection and error acknowledgement', () => {
    const use = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 1 }],
      gSpecialVar_ItemId: ITEM_TM01,
      playerPartyCount: 2
    });
    Task_SelectedTMHM_Field(use);
    use.contextInput = 0;
    Task_ContextMenu_HandleInput(use);
    expect(use.gItemUseCB).toBe('ItemUseCB_TMHM');
    expect(use.dynamicResources.nextScreenCallback).toBe('CB2_ShowPartyMenuForItemUse');
    expect(use.task.func).toBe('Task_FadeOutAndCloseTMCase');

    const give = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 1 }],
      gSpecialVar_ItemId: ITEM_TM01,
      playerPartyCount: 2,
      task: { func: 'Task_HandleListInput', data: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    });
    Task_SelectedTMHM_Field(give);
    give.contextInput = 1;
    Task_ContextMenu_HandleInput(give);
    expect(give.dynamicResources.nextScreenCallback).toBe('CB2_ChooseMonToGiveItem');
    expect(give.task.func).toBe('Task_FadeOutAndCloseTMCase');

    const giveHm = createTMCaseRuntime({
      slots: [{ itemId: ITEM_HM01, quantity: 1 }],
      gSpecialVar_ItemId: ITEM_HM01,
      playerPartyCount: 2,
      task: { func: 'Task_HandleListInput', data: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    });
    Task_SelectedTMHM_Field(giveHm);
    giveHm.contextInput = 1;
    Task_ContextMenu_HandleInput(giveHm);
    expect(giveHm.operations).toContain('PrintError_ItemCantBeHeld');
    expect(giveHm.task.func).toBe('Task_WaitButtonAfterErrorPrint');

    giveHm.newKeys = A_BUTTON;
    Task_WaitButtonAfterErrorPrint(giveHm);
    expect(giveHm.playedSoundEffects).toEqual([SE_SELECT, SE_SELECT]);
    expect(giveHm.task.func).toBe('Task_HandleListInput');

    const party = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 1 }],
      staticResources: { menuType: TMCASE_GIVE_PARTY, allowSelectClose: true, selectedRow: 0, scrollOffset: 0 }
    });
    Task_SelectedTMHM_GiveParty(party);
    expect(party.dynamicResources.nextScreenCallback).toBe('CB2_GiveHoldItem');

    const pc = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 1 }],
      staticResources: { menuType: TMCASE_GIVE_PC, allowSelectClose: true, selectedRow: 0, scrollOffset: 0 }
    });
    Task_SelectedTMHM_GivePC(pc);
    expect(pc.dynamicResources.nextScreenCallback).toBe('CB2_ReturnToPokeStorage');

    const hmParty = createTMCaseRuntime({
      slots: [{ itemId: ITEM_HM01, quantity: 1 }],
      staticResources: { menuType: TMCASE_GIVE_PARTY, allowSelectClose: true, selectedRow: 0, scrollOffset: 0 }
    });
    Task_SelectedTMHM_GiveParty(hmParty);
    expect(hmParty.operations).toContain('PrintError_ItemCantBeHeld');
  });

  test('ports sell setup, quantity UI, quantity input, and cancel paths', () => {
    const cannotBuy = createTMCaseRuntime({
      slots: [{ itemId: ITEM_HM01, quantity: 1 }],
      gSpecialVar_ItemId: ITEM_HM01,
      task: { func: 'Task_HandleListInput', data: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    });
    Task_SelectedTMHM_Sell(cannotBuy);
    expect(cannotBuy.operations).toEqual(['PrintMessage:OhNoICantBuyThat']);
    expect(cannotBuy.task.func).toBe('CloseMessageAndReturnToList');

    const one = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 1 }],
      gSpecialVar_ItemId: ITEM_TM01,
      task: { func: 'Task_HandleListInput', data: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    });
    Task_SelectedTMHM_Sell(one);
    expect(one.task.data[8]).toBe(1);
    expect(one.operations).toEqual(['PrintPlayersMoney', 'PrintMessage:ICanPayThisMuch:1500']);
    expect(one.task.func).toBe('Task_PlaceYesNoBox');

    const many = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 120 }],
      gSpecialVar_ItemId: ITEM_TM01,
      task: { func: 'Task_HandleListInput', data: [0, 0, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
    });
    Task_SelectedTMHM_Sell(many);
    expect(many.task.data[2]).toBe(99);
    expect(many.task.data[8]).toBe(1);
    expect(many.operations).toEqual(['PrintMessage:HowManyWouldYouLikeToSell']);
    expect(many.task.func).toBe('Task_InitQuantitySelectUI');

    Task_InitQuantitySelectUI(many);
    expect(many.operations.slice(1)).toEqual([
      'TMCase_SetWindowBorder1:WIN_SELL_QUANTITY',
      'SellTM_PrintQuantityAndSalePrice:01:1500',
      'PrintPlayersMoney',
      'CreateQuantityScrollArrows'
    ]);
    expect(many.task.func).toBe('Task_QuantitySelect_HandleInput');

    many.task.data[8] = 3;
    many.quantityAdjustResult = 1;
    Task_QuantitySelect_HandleInput(many);
    expect(many.operations.at(-1)).toBe('SellTM_PrintQuantityAndSalePrice:03:4500');

    many.quantityAdjustResult = 0;
    many.newKeys = B_BUTTON;
    Task_QuantitySelect_HandleInput(many);
    expect(many.playedSoundEffects).toEqual([SE_SELECT]);
    expect(many.operations.slice(-5)).toEqual([
      'ClearQuantityMoneyMessageWindows',
      'RemoveScrollArrows',
      'PrintListCursor:COLOR_DARK',
      'SetDescriptionWindowShade:0',
      'CreateListScrollArrows'
    ]);
    expect(many.task.func).toBe('Task_HandleListInput');

    const confirm = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM01, quantity: 5 }],
      gSpecialVar_ItemId: ITEM_TM01,
      newKeys: A_BUTTON,
      task: { func: 'Task_HandleListInput', data: [0, 0, 5, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0] }
    });
    Task_QuantitySelect_HandleInput(confirm);
    expect(confirm.operations).toEqual([
      'ClearQuantityWindow',
      'RemoveScrollArrows',
      'PrintMessage:ICanPayThisMuch:3000'
    ]);
    expect(confirm.task.func).toBe('Task_PlaceYesNoBox');
  });

  test('ports sale confirmation, item removal, money addition, quest-log transaction, and return-to-list wait', () => {
    const runtime = createTMCaseRuntime({
      staticResources: { menuType: TMCASE_FIELD, allowSelectClose: true, selectedRow: 4, scrollOffset: 0 },
      slots: [
        { itemId: ITEM_TM01, quantity: 3 },
        { itemId: ITEM_TM50, quantity: 1 }
      ],
      gSpecialVar_ItemId: ITEM_TM01,
      money: 100,
      task: { func: 'Task_HandleListInput', data: [0, 0, 3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0] }
    });

    Task_PrintSaleConfirmedText(runtime);
    expect(runtime.operations).toEqual(['PrintMessage:TurnedOverItemsWorthYen:3000']);
    expect(runtime.task.func).toBe('Task_DoSaleOfTMs');

    Task_DoSaleOfTMs(runtime);
    expect(runtime.playedSoundEffects).toEqual([SE_SHOP]);
    expect(runtime.money).toBe(3100);
    expect(runtime.itemTransactions).toEqual([
      {
        itemId: ITEM_TM01,
        quantity: 2,
        type: QL_EVENT_SOLD_ITEM - QL_EVENT_USED_POKEMART
      }
    ]);
    expect(runtime.slots).toEqual([
      { itemId: ITEM_TM01, quantity: 1 },
      { itemId: ITEM_TM50, quantity: 1 }
    ]);
    expect(runtime.dynamicResources).toMatchObject({ numTMs: 2, maxTMsShown: 3 });
    expect(runtime.staticResources.selectedRow).toBe(2);
    expect(runtime.operations.slice(1)).toEqual([
      'DestroyListMenuTask',
      'InitTMCaseListMenuItems',
      'ListMenuInit',
      'PrintListCursor:COLOR_CURSOR_SELECTED'
    ]);
    expect(runtime.task.func).toBe('Task_AfterSale_ReturnToList');

    runtime.newKeys = A_BUTTON;
    Task_AfterSale_ReturnToList(runtime);
    expect(runtime.playedSoundEffects).toEqual([SE_SHOP, SE_SELECT]);
    expect(runtime.task.func).toBe('Task_HandleListInput');
    expect(runtime.operations.slice(-5)).toEqual([
      'PrintListCursor:COLOR_CURSOR_SELECTED',
      'DestroyListMenuTask',
      'ListMenuInit',
      'PrintListCursor:COLOR_DARK',
      'SetDescriptionWindowShade:0',
      'CreateListScrollArrows'
    ].slice(-5));
  });

  test('ports Pokédude TM Case bag override, scripted movement states, skip path, and bag restore', () => {
    const runtime = createTMCaseRuntime({
      slots: [{ itemId: ITEM_TM50, quantity: 7 }],
      staticResources: { menuType: TMCASE_FIELD, allowSelectClose: true, selectedRow: 3, scrollOffset: 2, exitCallback: null }
    });

    Pokedude_InitTMCase(runtime);
    expect(runtime.slots).toEqual([
      { itemId: ITEM_TM01, quantity: 1 },
      { itemId: ITEM_TM03, quantity: 1 },
      { itemId: ITEM_TM09, quantity: 1 },
      { itemId: ITEM_TM35, quantity: 1 }
    ]);
    expect(runtime.staticResources).toMatchObject({
      menuType: TMCASE_POKEDUDE,
      allowSelectClose: false,
      selectedRow: 0,
      scrollOffset: 0,
      exitCallback: 'CB2_ReturnToTeachyTV'
    });

    Task_Pokedude_Start(runtime);
    expect(runtime.task.func).toBe('Task_Pokedude_Run');
    Task_Pokedude_Run(runtime);
    expect(runtime.task.data[8]).toBe(1);
    expect(runtime.operations).toContain('BeginNormalPaletteFade:0xFFFF8405:4:0:6:0');

    runtime.task.data[9] = POKEDUDE_INPUT_DELAY;
    Task_Pokedude_Run(runtime);
    expect(runtime.task.data[8]).toBe(2);
    Task_Pokedude_Run(runtime);
    expect(runtime.operations).toContain('ListMenu_ProcessInput:DPAD_DOWN');

    runtime.newKeys = B_BUTTON;
    Task_Pokedude_Run(runtime);
    expect(runtime.task.data[8]).toBe(22);
    expect(runtime.teachyTvResumeMode).toBe(true);
    expect(runtime.slots).toEqual([{ itemId: ITEM_TM50, quantity: 7 }]);
    expect(runtime.staticResources).toMatchObject({ selectedRow: 3, scrollOffset: 2 });
    expect(runtime.operations).toContain('CB2_SetUpReshowBattleScreenAfterMenu');

    runtime.newKeys = 0;
    Task_Pokedude_Run(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToTeachyTV');
    expect(runtime.operations).toContain('DestroyTMCaseBuffers');
  });
});
