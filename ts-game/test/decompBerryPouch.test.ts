import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  BERRYPOUCH_FROMBATTLE,
  BERRYPOUCH_FROMBERRYCRUSH,
  BERRYPOUCH_FROMFIELD,
  BERRYPOUCH_FROMMART,
  BERRYPOUCH_FROMPARTY,
  BERRYPOUCH_FROMPOKEMONPC,
  BERRYPOUCH_NA,
  BP_ACTION_EXIT,
  BP_ACTION_GIVE,
  BP_ACTION_TOSS,
  BP_ACTION_USE,
  CB2_BerryPouchIdle,
  CreateYesNoMenuWin3,
  CreateYesNoMenuWin4,
  DPAD_RIGHT,
  FIRST_BERRY_INDEX,
  InitBerryPouch,
  ITEM_NONE,
  LIST_CANCEL,
  RunBerryPouchInit,
  SpriteCB_BerryPouchWaitWobbleAnim,
  StartBerryPouchSpriteWobbleAnim,
  Task_BerryPouchMain,
  Task_ContextMenu_FromPartyGiveMenu,
  Task_ContextMenu_Sell,
  Task_NormalContextMenu,
  Task_NormalContextMenu_HandleInput,
  Task_SellBerries_PlaySfxAndRemoveBerries,
  Task_Sell_PrintSelectMultipleUI,
  Task_Toss_SelectMultiple,
  VBlankCB_BerryPouchIdle,
  createBerryPouchRuntime,
  dispatchBerryPouchTask,
  sOptions_Exit,
  sOptions_GiveExit,
  sOptions_UseGiveTossExit,
  sOptions_UseToss_Exit
} from '../src/game/decompBerryPouch';

const seededRuntime = () => {
  const runtime = createBerryPouchRuntime({
    bagPocket: [
      { itemId: FIRST_BERRY_INDEX + 2, quantity: 3 },
      { itemId: FIRST_BERRY_INDEX, quantity: 7 },
      { itemId: ITEM_NONE, quantity: 0 }
    ],
    itemNames: new Map([
      [FIRST_BERRY_INDEX, 'CHERI BERRY'],
      [FIRST_BERRY_INDEX + 2, 'PECHA BERRY']
    ]),
    itemDescriptions: new Map([
      [FIRST_BERRY_INDEX, 'Heals paralysis.'],
      [FIRST_BERRY_INDEX + 2, 'Heals poison.']
    ]),
    itemPrices: new Map([
      [FIRST_BERRY_INDEX, 20],
      [FIRST_BERRY_INDEX + 2, 30]
    ]),
    itemHoldingAllowed: new Set([FIRST_BERRY_INDEX])
  });
  InitBerryPouch(runtime, BERRYPOUCH_FROMFIELD, 'CB2_ReturnToField', 1);
  return runtime;
};

const runUntilLoaded = (runtime: ReturnType<typeof createBerryPouchRuntime>) => {
  for (let guard = 0; guard < 40 && runtime.mainCallback !== 'CB2_BerryPouchIdle'; guard++) {
    RunBerryPouchInit(runtime);
  }
};

describe('decompBerryPouch', () => {
  test('InitBerryPouch follows the C sentinel rules and allocation failure fallback', () => {
    const runtime = createBerryPouchRuntime({
      sStaticCnt: { savedCallback: 'oldCb', type: BERRYPOUCH_FROMMART, allowSelect: 1, unused_06: 0, listMenuSelectedRow: 4, listMenuScrollOffset: 2 }
    });

    InitBerryPouch(runtime, BERRYPOUCH_NA, null, 0xff);

    expect(runtime.sStaticCnt.type).toBe(BERRYPOUCH_FROMMART);
    expect(runtime.sStaticCnt.allowSelect).toBe(1);
    expect(runtime.sStaticCnt.savedCallback).toBe('oldCb');
    expect(runtime.gSpecialVar_ItemId).toBe(ITEM_NONE);
    expect(runtime.gTextFlagsAutoScroll).toBe(false);
    expect(runtime.mainCallback).toBe('CB2_InitBerryPouch');

    const failRuntime = createBerryPouchRuntime({ allocResourcesSucceeds: false });
    InitBerryPouch(failRuntime, BERRYPOUCH_FROMFIELD, 'savedCb', 0);
    expect(failRuntime.sResources).toBeNull();
    expect(failRuntime.mainCallback).toBe('savedCb');
  });

  test('RunBerryPouchInit walks the loading state machine, sorts berries, and builds the list template', () => {
    const runtime = seededRuntime();

    runUntilLoaded(runtime);

    expect(runtime.mainCallback).toBe('CB2_BerryPouchIdle');
    expect(runtime.vblankCallback).toBe('VBlankCB_BerryPouchIdle');
    expect(runtime.sResources?.listMenuNumItems).toBe(2);
    expect(runtime.sResources?.listMenuMaxShowed).toBe(3);
    expect(runtime.bagPocket.map((slot) => slot.itemId)).toEqual([FIRST_BERRY_INDEX, FIRST_BERRY_INDEX + 2]);
    expect(runtime.listMenuTemplate?.totalItems).toBe(3);
    expect(runtime.listMenuTemplate?.items.map((item) => item.label)).toEqual([
      '{FONT_SMALL}{NO_CLEAR}01 {FONT_NORMAL}CHERI BERRY',
      '{FONT_SMALL}{NO_CLEAR}03 {FONT_NORMAL}PECHA BERRY',
      'Close'
    ]);
    expect(runtime.tasks[0]?.func).toBe('Task_BerryPouchMain');
    expect(runtime.sVariableWindowIds.every((id) => id === 0xff)).toBe(true);
    expect(runtime.sprites[0]).toMatchObject({ x: 40, y: 76, callback: 'SpriteCallbackDummy' });
  });

  test('RunBerryPouchInit aborts exactly at list buffer allocation failure', () => {
    const runtime = seededRuntime();
    runtime.allocListStrbufSucceeds = false;

    for (let guard = 0; guard < 20 && runtime.gMainState < 12; guard++) {
      RunBerryPouchInit(runtime);
    }

    expect(runtime.gMainState).toBe(11);
    expect(runtime.mainCallback).toBe('CB2_BerryPouchIdle');
    expect(runtime.vblankCallback).toBe('VBlankCB_BerryPouchIdle');
    expect(runtime.tasks.at(-1)?.func).toBe('Task_AbortBerryPouchLoading_WaitFade');

    dispatchBerryPouchTask(runtime, runtime.tasks.at(-1)!.id);
    expect(runtime.mainCallback).toBe('CB2_ReturnToField');
    expect(runtime.sResources).toBeNull();
  });

  test('Task_BerryPouchMain matches cancel, berry-crush select, select-button, and normal item branches', () => {
    const cancelRuntime = seededRuntime();
    runUntilLoaded(cancelRuntime);
    cancelRuntime.listMenuSelections.push(LIST_CANCEL);
    Task_BerryPouchMain(cancelRuntime, 0);
    expect(cancelRuntime.gSpecialVar_ItemId).toBe(0);
    expect(cancelRuntime.tasks[0]?.func).toBe('Task_BerryPouchFadeToExitCallback');

    const crushRuntime = seededRuntime();
    crushRuntime.sStaticCnt.type = BERRYPOUCH_FROMBERRYCRUSH;
    runUntilLoaded(crushRuntime);
    crushRuntime.listMenuSelections.push(1);
    Task_BerryPouchMain(crushRuntime, 0);
    expect(crushRuntime.gSpecialVar_ItemId).toBe(FIRST_BERRY_INDEX + 2);
    expect(crushRuntime.tasks[0]?.func).toBe('Task_BerryPouchFadeToExitCallback');

    const selectRuntime = seededRuntime();
    runUntilLoaded(selectRuntime);
    selectRuntime.pressedButtons = 4;
    Task_BerryPouchMain(selectRuntime, 0);
    expect(selectRuntime.gSpecialVar_ItemId).toBe(0);
    expect(selectRuntime.tasks[0]?.func).toBe('Task_BerryPouchFadeToExitCallback');

    const normalRuntime = seededRuntime();
    runUntilLoaded(normalRuntime);
    normalRuntime.listMenuSelections.push(0);
    Task_BerryPouchMain(normalRuntime, 0);
    expect(normalRuntime.gSpecialVar_ItemId).toBe(FIRST_BERRY_INDEX);
    expect(normalRuntime.tasks[0]?.func).toBe('Task_NormalContextMenu');
    expect(normalRuntime.tasks[0]?.data[1]).toBe(0);
    expect(normalRuntime.tasks[0]?.data[2]).toBe(7);
  });

  test('normal context menu chooses the same option arrays as the C code', () => {
    const runtime = seededRuntime();
    runUntilLoaded(runtime);
    runtime.listMenuSelections.push(0);
    Task_BerryPouchMain(runtime, 0);
    Task_NormalContextMenu(runtime, 0);
    expect(runtime.sContextMenuOptions).toEqual([...sOptions_UseGiveTossExit]);

    const battleRuntime = seededRuntime();
    battleRuntime.sStaticCnt.type = BERRYPOUCH_FROMBATTLE;
    runUntilLoaded(battleRuntime);
    battleRuntime.listMenuSelections.push(0);
    Task_BerryPouchMain(battleRuntime, 0);
    Task_NormalContextMenu(battleRuntime, 0);
    expect(battleRuntime.sContextMenuOptions).toEqual([...sOptions_UseToss_Exit]);

    const linkAllowed = seededRuntime();
    linkAllowed.linkActive = true;
    runUntilLoaded(linkAllowed);
    linkAllowed.listMenuSelections.push(0);
    Task_BerryPouchMain(linkAllowed, 0);
    Task_NormalContextMenu(linkAllowed, 0);
    expect(linkAllowed.sContextMenuOptions).toEqual([...sOptions_GiveExit]);

    const linkBlocked = seededRuntime();
    linkBlocked.linkActive = true;
    linkBlocked.itemHoldingAllowed.clear();
    runUntilLoaded(linkBlocked);
    linkBlocked.listMenuSelections.push(0);
    Task_BerryPouchMain(linkBlocked, 0);
    Task_NormalContextMenu(linkBlocked, 0);
    expect(linkBlocked.sContextMenuOptions).toEqual([...sOptions_Exit]);
  });

  test('context menu input dispatches use/toss/give/exit actions through option indices', () => {
    const runtime = seededRuntime();
    runUntilLoaded(runtime);
    runtime.listMenuSelections.push(0);
    Task_BerryPouchMain(runtime, 0);
    Task_NormalContextMenu(runtime, 0);

    runtime.menuInputs.push(2);
    Task_NormalContextMenu_HandleInput(runtime, 0);

    expect(runtime.sContextMenuOptions?.[2]).toBe(BP_ACTION_TOSS);
    expect(runtime.tasks[0]?.func).toBe('Task_Toss_SelectMultiple');
    expect(runtime.sResources?.indicatorOffset).toBe(1);

    const giveRuntime = seededRuntime();
    runUntilLoaded(giveRuntime);
    giveRuntime.listMenuSelections.push(0);
    Task_BerryPouchMain(giveRuntime, 0);
    Task_NormalContextMenu(giveRuntime, 0);
    giveRuntime.menuInputs.push(1);
    Task_NormalContextMenu_HandleInput(giveRuntime, 0);
    expect(giveRuntime.sContextMenuOptions?.[1]).toBe(BP_ACTION_GIVE);
    expect(giveRuntime.tasks[0]?.func).toBe('BerryPouch_StartFadeToExitCallback');
    expect(giveRuntime.sResources?.exitCallback).toBe('CB2_ChooseMonToGiveItem');

    expect(BP_ACTION_USE).toBe(0);
    expect(BP_ACTION_EXIT).toBe(3);
  });

  test('toss selection adjusts quantity, confirms, then removes berries and refreshes the list', () => {
    const runtime = seededRuntime();
    runUntilLoaded(runtime);
    runtime.listMenuSelections.push(0);
    Task_BerryPouchMain(runtime, 0);
    Task_NormalContextMenu(runtime, 0);
    runtime.menuInputs.push(2);
    Task_NormalContextMenu_HandleInput(runtime, 0);

    runtime.pressedButtons = DPAD_RIGHT;
    Task_Toss_SelectMultiple(runtime, 0);
    expect(runtime.tasks[0]?.data[8]).toBe(4);

    runtime.pressedButtons = A_BUTTON;
    Task_Toss_SelectMultiple(runtime, 0);
    expect(runtime.textPrints.at(-1)?.text).toBe('Throw away 4 of this item?');

    dispatchBerryPouchTask(runtime, 0);
    runtime.tasks[0]!.func = 'Task_WaitButtonThenTossBerries';
    runtime.pressedButtons = A_BUTTON;
    dispatchBerryPouchTask(runtime, 0);
    expect(runtime.bagPocket.find((slot) => slot.itemId === FIRST_BERRY_INDEX)?.quantity).toBe(3);
    expect(runtime.tasks[0]?.func).toBe('Task_BerryPouchMain');
  });

  test('party, pokemon pc, and mart context menu branches preserve the original callbacks and sell math', () => {
    const partyRuntime = seededRuntime();
    partyRuntime.sStaticCnt.type = BERRYPOUCH_FROMPARTY;
    runUntilLoaded(partyRuntime);
    partyRuntime.listMenuSelections.push(0);
    Task_BerryPouchMain(partyRuntime, 0);
    Task_ContextMenu_FromPartyGiveMenu(partyRuntime, 0);
    expect(partyRuntime.sResources?.exitCallback).toBe('CB2_GiveHoldItem');
    expect(partyRuntime.tasks[0]?.func).toBe('BerryPouch_StartFadeToExitCallback');

    const pcRuntime = seededRuntime();
    pcRuntime.sStaticCnt.type = BERRYPOUCH_FROMPOKEMONPC;
    runUntilLoaded(pcRuntime);
    pcRuntime.listMenuSelections.push(0);
    Task_BerryPouchMain(pcRuntime, 0);
    dispatchBerryPouchTask(pcRuntime, 0);
    expect(pcRuntime.sResources?.exitCallback).toBe('CB2_ReturnToPokeStorage');

    const martRuntime = seededRuntime();
    martRuntime.sStaticCnt.type = BERRYPOUCH_FROMMART;
    runUntilLoaded(martRuntime);
    martRuntime.listMenuSelections.push(0);
    Task_BerryPouchMain(martRuntime, 0);
    Task_ContextMenu_Sell(martRuntime, 0);
    expect(martRuntime.messages.at(-1)?.text).toBe('How many would you like to sell?');

    Task_Sell_PrintSelectMultipleUI(martRuntime, 0);
    martRuntime.tasks[0]!.data[8] = 2;
    Task_SellBerries_PlaySfxAndRemoveBerries(martRuntime, 0);
    expect(martRuntime.money).toBe(20);
    expect(martRuntime.bagPocket.find((slot) => slot.itemId === FIRST_BERRY_INDEX)?.quantity).toBe(5);
    expect(martRuntime.tasks[0]?.func).toBe('Task_SellBerries_WaitButton');
  });

  test('berry pouch sprite wobble starts only after affine animation has ended', () => {
    const runtime = seededRuntime();
    runUntilLoaded(runtime);

    StartBerryPouchSpriteWobbleAnim(runtime);
    expect(runtime.sprites[0]).toMatchObject({ affineAnim: 1, affineAnimEnded: false, callback: 'SpriteCB_BerryPouchWaitWobbleAnim' });

    StartBerryPouchSpriteWobbleAnim(runtime);
    expect(runtime.operations.filter((entry) => entry === 'StartSpriteAffineAnim(1)')).toHaveLength(1);

    runtime.sprites[0]!.affineAnimEnded = true;
    SpriteCB_BerryPouchWaitWobbleAnim(runtime, runtime.sBerryPouchSpriteId);
    expect(runtime.sprites[0]).toMatchObject({ affineAnim: 0, callback: 'SpriteCallbackDummy' });
  });

  test('idle, vblank, and yes-no helpers match the C callback handoff', () => {
    const runtime = seededRuntime();
    runUntilLoaded(runtime);
    runtime.listMenuSelections.push(LIST_CANCEL);

    CB2_BerryPouchIdle(runtime);
    expect(runtime.tasks[0]?.func).toBe('Task_BerryPouchFadeToExitCallback');
    expect(runtime.operations.slice(-4)).toEqual([
      'AnimateSprites',
      'BuildOamBuffer',
      'DoScheduledBgTilemapCopiesToVram',
      'UpdatePaletteFade'
    ]);

    VBlankCB_BerryPouchIdle(runtime);
    expect(runtime.operations.slice(-3)).toEqual(['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer']);

    CreateYesNoMenuWin3(runtime, 2, 'sYesNoFuncs_Toss');
    expect(runtime.operations.at(-1)).toBe('CreateYesNoMenuWithCallbacks(2,sWindowTemplates_Variable[3],FONT_NORMAL,0,2,0x001,14,sYesNoFuncs_Toss)');
    CreateYesNoMenuWin4(runtime, 3, 'sYesNoFuncs_Sell');
    expect(runtime.operations.at(-1)).toBe('CreateYesNoMenuWithCallbacks(3,sWindowTemplates_Variable[4],FONT_NORMAL,0,2,0x001,14,sYesNoFuncs_Sell)');
  });
});
