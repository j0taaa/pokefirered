import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  BackupHelpContext,
  BuildAndPrintMainTopicsListMenu,
  BuildAndPrintSubmenuList,
  BuildMainTopicsListAndMoveToH00,
  B_BUTTON,
  FLAG_BADGE01_GET,
  FLAG_DEFEATED_BROCK,
  FLAG_GOT_HM03,
  FLAG_HIDE_FOUR_ISLAND_ICEFALL_CAVE_1F_HM07,
  FLAG_SYS_UNLOCKED_TANOBY_RUINS,
  FLAG_SYS_POKEMON_GET,
  FLAG_SYS_SAW_HELP_SYSTEM_INTRO,
  FLAG_WORLD_MAP_VIRIDIAN_FOREST,
  FLAG_WORLD_MAP_VIRIDIAN_CITY,
  HELPCONTEXT_BAG,
  HELPCONTEXT_COUNT,
  HELPCONTEXT_DUNGEON,
  HELPCONTEXT_GYM,
  HELPCONTEXT_INDOORS,
  HELPCONTEXT_MART,
  HELPCONTEXT_NONE,
  HELPCONTEXT_OAKS_LAB,
  HELPCONTEXT_OVERWORLD,
  HELPCONTEXT_PARTY_MENU,
  HELPCONTEXT_POKEMON_MOVES,
  HELPCONTEXT_POKECENTER,
  HELPCONTEXT_SAFARI_BATTLE,
  HELPCONTEXT_SURFING,
  HELPCONTEXT_TITLE_SCREEN,
  HELPCONTEXT_TRAINER_BATTLE_SINGLE,
  HELPCONTEXT_WILD_BATTLE,
  HelpMenuSubroutine_HelpItemPrint,
  HelpMenuSubroutine_HelpItemWaitButton,
  HelpMenuSubroutine_InitSubmenu,
  HelpMenuSubroutine_ReturnFromHelpItem,
  HelpMenuSubroutine_ReturnFromSubmenu,
  HelpMenuSubroutine_SubmenuInputHandler,
  HelpSystem_Disable,
  HelpSystem_DisableToggleWithRButton,
  HelpSystem_Enable,
  HelpSystem_EnableToggleWithRButton,
  HelpSystem_IsSinglePlayer,
  HelpSystem_PrintTopicLabel,
  HelpSystem_ShouldShowBasicTerms,
  HelpSystemSubroutine_MenuInputHandlerMain,
  HelpSystemSubroutine_WelcomeEndGotoMenu,
  HelpSystemSubroutine_WelcomeWaitButton,
  HelpSystem_UpdateHasntSeenIntro,
  GetHelpSystemMenuLevel,
  HELP_GAME_FUNDAMENTALS_2,
  HELP_THE_GAME,
  HELP_TERM_EXP,
  HELP_TERM_HP,
  HELP_TERM_ITEMS,
  HELP_TERM_LEVEL,
  HELP_TERM_MOVES,
  HELP_TERM_POKEBALLS,
  HELP_TERM_TYPE,
  HELP_USING_AN_ITEM,
  HELP_USING_BAG,
  HELP_USING_HM,
  HELP_USING_KEYITEM,
  HELP_USING_POTION,
  HELP_USING_POKEBALL,
  HELP_REGISTER_KEY_ITEM,
  HELP_USING_TM,
  HELP_USING_TOWN_MAP,
  HELP_WHAT_ARE_MY_ADVENTURE_BASICS,
  HELP_WHAT_HAPPENED_TO_ITEM_I_GOT,
  HELP_SOMEONE_BLOCKING_MY_WAY,
  HELP_WANT_TO_END_GAME,
  HELP_WHATS_POKEMON_CENTER,
  HELP_WHATS_POKEMON_MART,
  ITEM_TOWN_MAP,
  IsCurrentMapInArray,
  IsInDungeonMap,
  IsInGymMap,
  IsHelpSystemSubmenuEnabled,
  IsInMartMap,
  HasGottenAtLeastOneHM,
  MAP_TYPE_INDOOR,
  MAP_UNDEFINED,
  PLAYER_AVATAR_FLAG_SURFING,
  ResetHelpSystemListMenu,
  ResetHelpSystemCursor,
  RestoreHelpContext,
  RunHelpMenuSubroutine,
  SAVE_STATUS_EMPTY,
  SAVE_STATUS_INVALID,
  SetHelpContext,
  SetHelpContextDontCheckBattle,
  SetHelpContextForMap,
  SetHelpSystemSubmenuItems,
  Script_SetHelpContext,
  SE_SELECT,
  TOPIC_ABOUT_GAME,
  TOPIC_EXIT,
  TOPIC_HOW_TO_DO,
  TOPIC_TERMS,
  TOPIC_TYPE_MATCHUP,
  TOPIC_WHAT_TO_DO,
  createHelpSystemCoreRuntime,
  sHelpSystemContextTopicFlags,
  sHelpSystemMenuTopicTextPtrs,
  sHelpSystemSpecializedQuestionTextPtrs,
  sHelpSystemTermTextPtrs,
  sHelpSystemTypeMatchupTextPtrs,
  sHelpSystemTopicPtrs
} from '../src/game/decompHelpSystem';
import type { HelpSystemListMenu, ListMenuItem } from '../src/game/decompHelpSystemUtil';

const makeMenu = (): { menu: HelpSystemListMenu; items: ListMenuItem[] } => ({
  menu: {
    sub: { items: [], totalItems: 99, maxShowed: 99, left: 9, top: 9 },
    itemsAbove: 0,
    cursorPos: 0,
    state: 0
  },
  items: Array.from({ length: 64 }, () => ({ label: '', index: 0 }))
});

describe('decompHelpSystem', () => {
  it('SetHelpContext preserves battle context for bag/party/pokemon subcontexts and overwrites otherwise', () => {
    const runtime = createHelpSystemCoreRuntime({ sHelpSystemContextId: HELPCONTEXT_WILD_BATTLE });

    SetHelpContext(runtime, HELPCONTEXT_BAG);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_WILD_BATTLE);
    SetHelpContext(runtime, HELPCONTEXT_PARTY_MENU);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_WILD_BATTLE);
    SetHelpContext(runtime, HELPCONTEXT_POKEMON_MOVES);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_WILD_BATTLE);
    SetHelpContext(runtime, HELPCONTEXT_OAKS_LAB);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_OAKS_LAB);

    runtime.sHelpSystemContextId = HELPCONTEXT_SAFARI_BATTLE;
    SetHelpContext(runtime, HELPCONTEXT_BAG);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_SAFARI_BATTLE);
    SetHelpContextDontCheckBattle(runtime, HELPCONTEXT_BAG);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_BAG);
  });

  it('BackupHelpContext and RestoreHelpContext copy the context id exactly', () => {
    const runtime = createHelpSystemCoreRuntime({ sHelpSystemContextId: HELPCONTEXT_GYM });

    BackupHelpContext(runtime);
    runtime.sHelpSystemContextId = HELPCONTEXT_NONE;
    RestoreHelpContext(runtime);

    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_GYM);
  });

  it('Script_SetHelpContext and map context helpers follow the C branch order', () => {
    const runtime = createHelpSystemCoreRuntime({
      gSpecialVar_0x8004: HELPCONTEXT_BAG,
      location: { mapGroup: 3, mapNum: 4 },
      martMaps: [(3 << 8) + 4, MAP_UNDEFINED],
      gymMaps: [(5 << 8) + 6, MAP_UNDEFINED],
      dungeonMaps: [[7, 8, 2], [9, 10, 2, true]]
    });

    Script_SetHelpContext(runtime);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_BAG);
    expect(IsCurrentMapInArray(runtime, runtime.martMaps)).toBe(true);
    expect(IsInMartMap(runtime)).toBe(true);
    expect(IsInGymMap(runtime)).toBe(false);
    expect(IsInDungeonMap(runtime)).toBe(false);

    runtime.playerAvatarFlags = PLAYER_AVATAR_FLAG_SURFING;
    SetHelpContextForMap(runtime);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_SURFING);

    runtime.playerAvatarFlags = 0;
    runtime.location = { mapGroup: 7, mapNum: 9 };
    SetHelpContextForMap(runtime);
    expect(runtime.sHelpSystemContextId).toBe(HELPCONTEXT_DUNGEON);

    runtime.location = { mapGroup: 9, mapNum: 11 };
    runtime.flags.clear();
    expect(IsInDungeonMap(runtime)).toBe(false);
    runtime.flags.add(FLAG_SYS_UNLOCKED_TANOBY_RUINS);
    expect(IsInDungeonMap(runtime)).toBe(true);

    const indoor = createHelpSystemCoreRuntime({
      mapType: MAP_TYPE_INDOOR,
      location: { mapGroup: 20, mapNum: 2 },
      currentMapIsPokeCenter: true
    });
    SetHelpContextForMap(indoor);
    expect(indoor.sHelpSystemContextId).toBe(HELPCONTEXT_POKECENTER);

    const mart = createHelpSystemCoreRuntime({
      mapType: MAP_TYPE_INDOOR,
      location: { mapGroup: 2, mapNum: 7 },
      martMaps: [(2 << 8) + 7, MAP_UNDEFINED]
    });
    SetHelpContextForMap(mart);
    expect(mart.sHelpSystemContextId).toBe(HELPCONTEXT_MART);

    const otherIndoor = createHelpSystemCoreRuntime({ mapType: MAP_TYPE_INDOOR, location: { mapGroup: 20, mapNum: 1 } });
    SetHelpContextForMap(otherIndoor);
    expect(otherIndoor.sHelpSystemContextId).toBe(HELPCONTEXT_INDOORS);

    const outdoor = createHelpSystemCoreRuntime();
    SetHelpContextForMap(outdoor);
    expect(outdoor.sHelpSystemContextId).toBe(HELPCONTEXT_OVERWORLD);
  });

  it('HelpSystem_UpdateHasntSeenIntro follows save-status and flag branches', () => {
    const first = createHelpSystemCoreRuntime({ gSaveFileStatus: SAVE_STATUS_EMPTY });
    expect(HelpSystem_UpdateHasntSeenIntro(first)).toBe(true);
    expect(first.sSeenHelpSystemIntro).toBe(true);
    expect(first.flags.has(FLAG_SYS_SAW_HELP_SYSTEM_INTRO)).toBe(true);
    expect(HelpSystem_UpdateHasntSeenIntro(first)).toBe(false);

    const validSeen = createHelpSystemCoreRuntime({
      gSaveFileStatus: 1,
      flags: new Set([FLAG_SYS_SAW_HELP_SYSTEM_INTRO])
    });
    expect(HelpSystem_UpdateHasntSeenIntro(validSeen)).toBe(false);
    expect(validSeen.sSeenHelpSystemIntro).toBe(false);

    const invalidSeen = createHelpSystemCoreRuntime({
      gSaveFileStatus: SAVE_STATUS_INVALID,
      flags: new Set([FLAG_SYS_SAW_HELP_SYSTEM_INTRO])
    });
    expect(HelpSystem_UpdateHasntSeenIntro(invalidSeen)).toBe(true);
  });

  it('single-player and enable/disable helpers preserve exact global toggles', () => {
    const runtime = createHelpSystemCoreRuntime({
      gHelpSystemEnabled: false,
      gHelpSystemToggleWithRButtonDisabled: true
    });

    expect(HelpSystem_IsSinglePlayer(runtime)).toBe(true);
    runtime.gReceivedRemoteLinkPlayers = true;
    expect(HelpSystem_IsSinglePlayer(runtime)).toBe(false);

    HelpSystem_Enable(runtime);
    expect(runtime.gHelpSystemEnabled).toBe(true);
    expect(runtime.gHelpSystemToggleWithRButtonDisabled).toBe(false);
    HelpSystem_DisableToggleWithRButton(runtime);
    expect(runtime.gHelpSystemToggleWithRButtonDisabled).toBe(true);
    HelpSystem_EnableToggleWithRButton(runtime);
    expect(runtime.gHelpSystemToggleWithRButtonDisabled).toBe(false);
    HelpSystem_Disable(runtime);
    expect(runtime.gHelpSystemEnabled).toBe(false);

    runtime.gQuestLogState = 2;
    runtime.gHelpSystemToggleWithRButtonDisabled = true;
    HelpSystem_Enable(runtime);
    expect(runtime.gHelpSystemEnabled).toBe(false);
    expect(runtime.gHelpSystemToggleWithRButtonDisabled).toBe(true);
  });

  it('ResetHelpSystemListMenu initializes submenu geometry like C', () => {
    const { menu, items } = makeMenu();

    ResetHelpSystemListMenu(menu, items);

    expect(menu.sub).toEqual({ items, totalItems: 1, maxShowed: 1, left: 1, top: 4 });
  });

  it('BuildMainTopicsListAndMoveToH00 uses context flags and topic order, then changes last item to cancel index', () => {
    const title = createHelpSystemCoreRuntime({ sHelpSystemContextId: HELPCONTEXT_TITLE_SCREEN });
    const titleMenu = makeMenu();

    BuildMainTopicsListAndMoveToH00(title, titleMenu.menu, titleMenu.items);
    expect(titleMenu.menu.sub.totalItems).toBe(2);
    expect(titleMenu.menu.sub.maxShowed).toBe(2);
    expect(titleMenu.menu.sub.left).toBe(0);
    expect(titleMenu.items.slice(0, 2)).toEqual([
      { label: sHelpSystemTopicPtrs[TOPIC_ABOUT_GAME], index: TOPIC_ABOUT_GAME },
      { label: sHelpSystemTopicPtrs[TOPIC_EXIT], index: -2 }
    ]);

    const gym = createHelpSystemCoreRuntime({ sHelpSystemContextId: HELPCONTEXT_GYM });
    const gymMenu = makeMenu();
    BuildMainTopicsListAndMoveToH00(gym, gymMenu.menu, gymMenu.items);
    expect(gymMenu.items.slice(0, 6)).toEqual([
      { label: sHelpSystemTopicPtrs[TOPIC_WHAT_TO_DO], index: TOPIC_WHAT_TO_DO },
      { label: sHelpSystemTopicPtrs[TOPIC_HOW_TO_DO], index: TOPIC_HOW_TO_DO },
      { label: sHelpSystemTopicPtrs[TOPIC_TERMS], index: TOPIC_TERMS },
      { label: sHelpSystemTopicPtrs[TOPIC_TYPE_MATCHUP], index: TOPIC_TYPE_MATCHUP },
      { label: sHelpSystemTopicPtrs[TOPIC_EXIT], index: -2 },
      { label: '', index: 0 }
    ]);
    expect(gymMenu.menu.sub.totalItems).toBe(5);
  });

  it('BuildAndPrint menu helpers reset menus and record the C UI side effects', () => {
    const runtime = createHelpSystemCoreRuntime({ sHelpSystemContextId: HELPCONTEXT_GYM });
    const { menu, items } = makeMenu();

    BuildAndPrintMainTopicsListMenu(runtime, menu, items);
    expect(menu.sub.left).toBe(0);
    expect(runtime.panel2RightText).toBe('gText_HelpSystemControls_PickOkEnd');
    expect(runtime.listMenuController).toEqual({ itemsAbove: 0, cursorPos: 0 });
    expect(runtime.topicMouseoverDescription).toBe('Help_Text_TopicMouseover_0');
    expect(runtime.mainWindowTextVisible).toBe(true);
    expect(runtime.controlsGuideVisible).toBe(true);

    runtime.gHelpSystemState.topic = TOPIC_HOW_TO_DO;
    BuildAndPrintSubmenuList(runtime, menu, items);
    expect(menu.sub.maxShowed).toBe(7);
    expect(runtime.panel2RightText).toBe('gText_HelpSystemControls_PickOkCancel');
    expect(runtime.printedTopicLabel).toBe(sHelpSystemTopicPtrs[TOPIC_HOW_TO_DO]);
    expect(runtime.headerFooterLighterVisible).toBe(true);
  });

  it('context topic flag table preserves notable C rows and sentinel count row', () => {
    expect(sHelpSystemContextTopicFlags[HELPCONTEXT_COUNT]).toEqual([false, false, false, false, false, false]);
    expect(sHelpSystemContextTopicFlags[HELPCONTEXT_TRAINER_BATTLE_SINGLE]).toEqual([
      true,
      true,
      true,
      false,
      true,
      true
    ]);
    expect(sHelpSystemContextTopicFlags[HELPCONTEXT_NONE][TOPIC_EXIT]).toBe(true);
  });

  it('HasGottenAtLeastOneHM checks the six HM flags and hidden HM07 flag in order-equivalent form', () => {
    const runtime = createHelpSystemCoreRuntime();

    expect(HasGottenAtLeastOneHM(runtime)).toBe(false);
    runtime.flags.add(FLAG_GOT_HM03);
    expect(HasGottenAtLeastOneHM(runtime)).toBe(true);

    const hm7 = createHelpSystemCoreRuntime({
      flags: new Set([FLAG_HIDE_FOUR_ISLAND_ICEFALL_CAVE_1F_HM07])
    });
    expect(HasGottenAtLeastOneHM(hm7)).toBe(true);
  });

  it('SetHelpSystemSubmenuItems builds Bag how-to rows using C filtering, cancel sentinel, and submenu geometry', () => {
    const runtime = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_BAG,
      flags: new Set([FLAG_SYS_POKEMON_GET, FLAG_BADGE01_GET, FLAG_GOT_HM03]),
      bagItems: new Set([ITEM_TOWN_MAP]),
      gHelpSystemState: { level: 1, topic: TOPIC_HOW_TO_DO, scrollMain: 0, scrollSub: 0 }
    });
    const { menu, items } = makeMenu();

    SetHelpSystemSubmenuItems(runtime, menu, items);

    expect(items.slice(0, menu.sub.totalItems)).toEqual([
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_BAG], index: HELP_USING_BAG },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_AN_ITEM], index: HELP_USING_AN_ITEM },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_KEYITEM], index: HELP_USING_KEYITEM },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_REGISTER_KEY_ITEM], index: HELP_REGISTER_KEY_ITEM },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_POKEBALL], index: HELP_USING_POKEBALL },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_POTION], index: HELP_USING_POTION },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_TOWN_MAP], index: HELP_USING_TOWN_MAP },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_TM], index: HELP_USING_TM },
      { label: sHelpSystemMenuTopicTextPtrs[HELP_USING_HM], index: HELP_USING_HM },
      { label: 'Help_Text_Cancel', index: -2 }
    ]);
    expect(menu.sub).toMatchObject({ totalItems: 10, maxShowed: 7, left: 0, top: 21 });

    const noTownMap = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_BAG,
      flags: new Set([FLAG_SYS_POKEMON_GET, FLAG_BADGE01_GET]),
      gHelpSystemState: { level: 1, topic: TOPIC_HOW_TO_DO, scrollMain: 0, scrollSub: 0 }
    });
    expect(IsHelpSystemSubmenuEnabled(noTownMap, HELP_USING_TOWN_MAP)).toBe(false);
    expect(IsHelpSystemSubmenuEnabled(noTownMap, HELP_USING_HM)).toBe(false);
  });

  it('SetHelpSystemSubmenuItems appends Brock basic terms and skips duplicate source terms exactly', () => {
    const runtime = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_GYM,
      flags: new Set([FLAG_DEFEATED_BROCK, FLAG_SYS_POKEMON_GET, FLAG_WORLD_MAP_VIRIDIAN_FOREST]),
      gHelpSystemState: { level: 1, topic: TOPIC_TERMS, scrollMain: 0, scrollSub: 0 }
    });
    const { menu, items } = makeMenu();

    expect(HelpSystem_ShouldShowBasicTerms(runtime)).toBe(true);
    expect(IsHelpSystemSubmenuEnabled(runtime, HELP_TERM_LEVEL)).toBe(false);
    expect(IsHelpSystemSubmenuEnabled(runtime, HELP_TERM_TYPE)).toBe(false);
    SetHelpSystemSubmenuItems(runtime, menu, items);

    expect(items[0]).toEqual({ label: sHelpSystemTermTextPtrs[HELP_TERM_LEVEL], index: HELP_TERM_LEVEL });
    expect(items[1]).toEqual({ label: sHelpSystemTermTextPtrs[HELP_TERM_HP], index: HELP_TERM_HP });
    expect(items[2]).toEqual({ label: sHelpSystemTermTextPtrs[HELP_TERM_EXP], index: HELP_TERM_EXP });
    expect(items[3]).toEqual({ label: sHelpSystemTermTextPtrs[HELP_TERM_MOVES], index: HELP_TERM_MOVES });
    expect(items[25]).toEqual({ label: sHelpSystemTermTextPtrs[HELP_TERM_ITEMS], index: HELP_TERM_ITEMS });
    expect(items[27]).toEqual({ label: sHelpSystemTermTextPtrs[HELP_TERM_POKEBALLS], index: HELP_TERM_POKEBALLS });
    expect(items[31]).toEqual({ label: 'Help_Text_Cancel', index: -2 });
    expect(menu.sub.totalItems).toBe(32);
  });

  it('SetHelpSystemSubmenuItems preserves What-to-do flag gates and About Game badge gates', () => {
    const gym = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_GYM,
      flags: new Set([FLAG_WORLD_MAP_VIRIDIAN_CITY, FLAG_SYS_POKEMON_GET]),
      gHelpSystemState: { level: 1, topic: TOPIC_WHAT_TO_DO, scrollMain: 0, scrollSub: 0 }
    });
    const gymMenu = makeMenu();

    SetHelpSystemSubmenuItems(gym, gymMenu.menu, gymMenu.items);

    expect(gymMenu.items.slice(0, gymMenu.menu.sub.totalItems)).toEqual([
      { label: sHelpSystemSpecializedQuestionTextPtrs[HELP_SOMEONE_BLOCKING_MY_WAY], index: HELP_SOMEONE_BLOCKING_MY_WAY },
      { label: sHelpSystemSpecializedQuestionTextPtrs[HELP_WHAT_ARE_MY_ADVENTURE_BASICS], index: HELP_WHAT_ARE_MY_ADVENTURE_BASICS },
      { label: sHelpSystemSpecializedQuestionTextPtrs[HELP_WHATS_POKEMON_CENTER], index: HELP_WHATS_POKEMON_CENTER },
      { label: sHelpSystemSpecializedQuestionTextPtrs[HELP_WHATS_POKEMON_MART], index: HELP_WHATS_POKEMON_MART },
      { label: sHelpSystemSpecializedQuestionTextPtrs[HELP_WHAT_HAPPENED_TO_ITEM_I_GOT], index: HELP_WHAT_HAPPENED_TO_ITEM_I_GOT },
      { label: sHelpSystemSpecializedQuestionTextPtrs[HELP_WANT_TO_END_GAME], index: HELP_WANT_TO_END_GAME },
      { label: 'Help_Text_Cancel', index: -2 }
    ]);

    const title = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_TITLE_SCREEN,
      gHelpSystemState: { level: 1, topic: TOPIC_ABOUT_GAME, scrollMain: 0, scrollSub: 0 }
    });
    expect(IsHelpSystemSubmenuEnabled(title, HELP_THE_GAME)).toBe(true);
    expect(IsHelpSystemSubmenuEnabled(title, HELP_GAME_FUNDAMENTALS_2)).toBe(false);
    title.flags.add(FLAG_BADGE01_GET);
    expect(IsHelpSystemSubmenuEnabled(title, HELP_GAME_FUNDAMENTALS_2)).toBe(true);
  });

  it('SetHelpSystemSubmenuItems keeps type-matchup submenu entries always enabled', () => {
    const runtime = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_GYM,
      gHelpSystemState: { level: 1, topic: TOPIC_TYPE_MATCHUP, scrollMain: 0, scrollSub: 0 }
    });
    const { menu, items } = makeMenu();

    SetHelpSystemSubmenuItems(runtime, menu, items);

    expect(menu.sub.totalItems).toBe(36);
    expect(items[0]).toEqual({ label: sHelpSystemTypeMatchupTextPtrs[1], index: 1 });
    expect(items[34]).toEqual({ label: sHelpSystemTypeMatchupTextPtrs[35], index: 35 });
    expect(items[35]).toEqual({ label: 'Help_Text_Cancel', index: -2 });
  });

  it('RunHelpMenuSubroutine dispatches welcome, main menu, submenu, and help-item states exactly', () => {
    const runtime = createHelpSystemCoreRuntime({
      sHelpSystemContextId: HELPCONTEXT_GYM,
      gHelpSystemState: { level: 0, topic: TOPIC_HOW_TO_DO, scrollMain: 0, scrollSub: HELP_USING_BAG }
    });
    const { menu, items } = makeMenu();

    menu.state = 8;
    expect(RunHelpMenuSubroutine(runtime, menu, items)).toBe(true);
    expect(menu.state).toBe(9);
    expect(runtime.panel1Text).toBe('Help_Text_Greetings');
    expect(runtime.panel2RightText).toBe('gText_HelpSystemControls_A_Next');

    runtime.helpSystemMenuInput = A_BUTTON;
    expect(HelpSystemSubroutine_WelcomeWaitButton(runtime, menu, items)).toBe(true);
    expect(menu.state).toBe(10);
    expect(runtime.playedSoundEffects).toContain(SE_SELECT);

    expect(HelpSystemSubroutine_WelcomeEndGotoMenu(runtime, menu, items)).toBe(true);
    expect(menu.state).toBe(0);
    expect(runtime.gHelpSystemState.scrollMain).toBe(0);

    runtime.helpSystemMenuInput = -4;
    expect(HelpSystemSubroutine_MenuInputHandlerMain(runtime, menu, items)).toBe(true);
    expect(runtime.topLevelTooltipVisible).toBe(true);
    runtime.helpSystemMenuInput = TOPIC_TERMS;
    expect(HelpSystemSubroutine_MenuInputHandlerMain(runtime, menu, items)).toBe(true);
    expect(runtime.gHelpSystemState.topic).toBe(TOPIC_TERMS);
    expect(menu.state).toBe(1);

    menu.cursorPos = 3;
    expect(HelpMenuSubroutine_InitSubmenu(runtime, menu, items)).toBe(true);
    expect(runtime.gHelpSystemState.level).toBe(1);
    expect(runtime.gHelpSystemState.scrollMain).toBe(3);
    expect(menu.state).toBe(3);
    expect(runtime.inputDelay).toBe(2);

    runtime.helpSystemMenuInput = HELP_TERM_HP;
    expect(HelpMenuSubroutine_SubmenuInputHandler(runtime, menu, items)).toBe(true);
    expect(runtime.gHelpSystemState.scrollSub).toBe(HELP_TERM_HP);
    expect(menu.state).toBe(4);

    expect(HelpMenuSubroutine_HelpItemPrint(runtime, menu, items)).toBe(true);
    expect(runtime.gHelpSystemState.level).toBe(2);
    expect(runtime.printedQuestionAnswer).toEqual({
      question: 'Help_Text_HP',
      answer: 'Help_Text_TermDefinition_1'
    });
    expect(menu.state).toBe(6);

    runtime.helpSystemMenuInput = B_BUTTON;
    expect(HelpMenuSubroutine_HelpItemWaitButton(runtime, menu, items)).toBe(true);
    expect(menu.state).toBe(5);
    expect(HelpMenuSubroutine_ReturnFromHelpItem(runtime, menu, items)).toBe(true);
    expect(menu.state).toBe(3);
    expect(runtime.gHelpSystemState.level).toBe(1);

    expect(HelpMenuSubroutine_ReturnFromSubmenu(runtime, menu, items)).toBe(true);
    expect(menu.state).toBe(0);
    expect(runtime.gHelpSystemState.level).toBe(0);

    ResetHelpSystemCursor(menu);
    expect(menu.itemsAbove).toBe(0);
    expect(menu.cursorPos).toBe(0);
    HelpSystem_PrintTopicLabel(runtime);
    expect(runtime.printedTopicLabel).toBe(sHelpSystemTopicPtrs[runtime.gHelpSystemState.topic]);
    expect(GetHelpSystemMenuLevel(runtime)).toBe(0);
  });
});
