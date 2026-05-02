import type { HelpSystemListMenu, ListMenuItem } from './decompHelpSystemUtil';

export const TOPIC_WHAT_TO_DO = 0;
export const TOPIC_HOW_TO_DO = 1;
export const TOPIC_TERMS = 2;
export const TOPIC_ABOUT_GAME = 3;
export const TOPIC_TYPE_MATCHUP = 4;
export const TOPIC_EXIT = 5;
export const TOPIC_COUNT = 6;
export const HELP_NONE = 0;
export const HELP_END = 0xff;
export const MAP_UNDEFINED = 0xffff;
export const MAP_TYPE_INDOOR = 1;
export const PLAYER_AVATAR_FLAG_SURFING = 1 << 0;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const L_BUTTON = 0x0200;
export const R_BUTTON = 0x0100;
export const SE_SELECT = 5;

export const HELPCONTEXT_NONE = 0;
export const HELPCONTEXT_TITLE_SCREEN = 1;
export const HELPCONTEXT_NEW_GAME = 2;
export const HELPCONTEXT_NAMING_SCREEN = 3;
export const HELPCONTEXT_POKEDEX = 4;
export const HELPCONTEXT_PARTY_MENU = 5;
export const HELPCONTEXT_POKEMON_INFO = 6;
export const HELPCONTEXT_POKEMON_SKILLS = 7;
export const HELPCONTEXT_POKEMON_MOVES = 8;
export const HELPCONTEXT_BAG = 9;
export const HELPCONTEXT_TRAINER_CARD_FRONT = 10;
export const HELPCONTEXT_TRAINER_CARD_BACK = 11;
export const HELPCONTEXT_SAVE = 12;
export const HELPCONTEXT_OPTIONS = 13;
export const HELPCONTEXT_PLAYERS_HOUSE = 14;
export const HELPCONTEXT_OAKS_LAB = 15;
export const HELPCONTEXT_POKECENTER = 16;
export const HELPCONTEXT_MART = 17;
export const HELPCONTEXT_GYM = 18;
export const HELPCONTEXT_INDOORS = 19;
export const HELPCONTEXT_OVERWORLD = 20;
export const HELPCONTEXT_DUNGEON = 21;
export const HELPCONTEXT_SURFING = 22;
export const HELPCONTEXT_WILD_BATTLE = 23;
export const HELPCONTEXT_TRAINER_BATTLE_SINGLE = 24;
export const HELPCONTEXT_TRAINER_BATTLE_DOUBLE = 25;
export const HELPCONTEXT_SAFARI_BATTLE = 26;
export const HELPCONTEXT_PC = 27;
export const HELPCONTEXT_BILLS_PC = 28;
export const HELPCONTEXT_PLAYERS_PC_ITEMS = 29;
export const HELPCONTEXT_PLAYERS_PC_MAILBOX = 30;
export const HELPCONTEXT_PC_MISC = 31;
export const HELPCONTEXT_BEDROOM_PC = 32;
export const HELPCONTEXT_BEDROOM_PC_ITEMS = 33;
export const HELPCONTEXT_BEDROOM_PC_MAILBOX = 34;
export const HELPCONTEXT_UNUSED = 35;
export const HELPCONTEXT_COUNT = 36;

export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_INVALID = 2;

export const FLAG_SYS_SAW_HELP_SYSTEM_INTRO = 'FLAG_SYS_SAW_HELP_SYSTEM_INTRO';
export const FLAG_GOT_HM01 = 'FLAG_GOT_HM01';
export const FLAG_GOT_HM02 = 'FLAG_GOT_HM02';
export const FLAG_GOT_HM03 = 'FLAG_GOT_HM03';
export const FLAG_GOT_HM04 = 'FLAG_GOT_HM04';
export const FLAG_GOT_HM05 = 'FLAG_GOT_HM05';
export const FLAG_GOT_HM06 = 'FLAG_GOT_HM06';
export const FLAG_HIDE_FOUR_ISLAND_ICEFALL_CAVE_1F_HM07 = 'FLAG_HIDE_FOUR_ISLAND_ICEFALL_CAVE_1F_HM07';
export const FLAG_SYS_UNLOCKED_TANOBY_RUINS = 'FLAG_SYS_UNLOCKED_TANOBY_RUINS';
export const FLAG_DEFEATED_BROCK = 'FLAG_DEFEATED_BROCK';
export const FLAG_SYS_POKEMON_GET = 'FLAG_SYS_POKEMON_GET';
export const FLAG_SYS_POKEDEX_GET = 'FLAG_SYS_POKEDEX_GET';
export const FLAG_VISITED_OAKS_LAB = 'FLAG_VISITED_OAKS_LAB';
export const FLAG_WORLD_MAP_VIRIDIAN_CITY = 'FLAG_WORLD_MAP_VIRIDIAN_CITY';
export const FLAG_WORLD_MAP_VERMILION_CITY = 'FLAG_WORLD_MAP_VERMILION_CITY';
export const FLAG_WORLD_MAP_VIRIDIAN_FOREST = 'FLAG_WORLD_MAP_VIRIDIAN_FOREST';
export const FLAG_BADGE01_GET = 'FLAG_BADGE01_GET';
export const FLAG_BADGE02_GET = 'FLAG_BADGE02_GET';
export const FLAG_GOT_FAME_CHECKER = 'FLAG_GOT_FAME_CHECKER';
export const FLAG_WORLD_MAP_PEWTER_CITY = 'FLAG_WORLD_MAP_PEWTER_CITY';
export const FLAG_GOT_BICYCLE = 'FLAG_GOT_BICYCLE';
export const FLAG_SYS_GAME_CLEAR = 'FLAG_SYS_GAME_CLEAR';
export const ITEM_TOWN_MAP = 0x0168;

export const HELP_PLAYING_FOR_FIRST_TIME = 1;
export const HELP_WHAT_SHOULD_I_BE_DOING = 2;
export const HELP_CANT_GET_OUT_OF_ROOM = 3;
export const HELP_CANT_FIND_PERSON_I_WANT = 4;
export const HELP_TALKED_TO_EVERYONE_NOW_WHAT = 5;
export const HELP_SOMEONE_BLOCKING_MY_WAY = 6;
export const HELP_I_CANT_GO_ON = 7;
export const HELP_OUT_OF_THINGS_TO_DO = 8;
export const HELP_WHAT_HAPPENED_TO_ITEM_I_GOT = 9;
export const HELP_WHAT_ARE_MY_ADVENTURE_BASICS = 10;
export const HELP_HOW_ARE_ROADS_FORESTS_DIFFERENT = 11;
export const HELP_HOW_ARE_CAVES_DIFFERENT = 12;
export const HELP_HOW_DO_I_PROGRESS = 13;
export const HELP_WHEN_CAN_I_USE_ITEM = 14;
export const HELP_WHATS_A_BATTLE = 15;
export const HELP_HOW_DO_I_PREPARE_FOR_BATTLE = 16;
export const HELP_WHAT_IS_A_MONS_VITALITY = 17;
export const HELP_MY_MONS_ARE_HURT = 18;
export const HELP_WHAT_IS_STATUS_PROBLEM = 19;
export const HELP_WHAT_HAPPENS_IF_ALL_MY_MONS_FAINT = 20;
export const HELP_CANT_CATCH_MONS = 21;
export const HELP_RAN_OUT_OF_POTIONS = 22;
export const HELP_CAN_I_BUY_POKEBALLS = 23;
export const HELP_WHATS_A_TRAINER = 24;
export const HELP_HOW_DO_I_WIN_AGAINST_TRAINER = 25;
export const HELP_WHERE_DO_MONS_APPEAR = 26;
export const HELP_WHAT_ARE_MOVES = 27;
export const HELP_WHAT_ARE_HIDDEN_MOVES = 28;
export const HELP_WHAT_MOVES_SHOULD_I_USE = 29;
export const HELP_WANT_TO_ADD_MORE_MOVES = 30;
export const HELP_WANT_TO_MAKE_MON_STRONGER = 31;
export const HELP_FOE_MONS_TOO_STRONG = 32;
export const HELP_WHAT_DO_I_DO_IN_CAVE = 33;
export const HELP_NOTHING_I_WANT_TO_KNOW = 34;
export const HELP_WHATS_POKEMON_CENTER = 35;
export const HELP_WHATS_POKEMON_MART = 36;
export const HELP_WANT_TO_END_GAME = 37;
export const HELP_WHATS_A_MON = 38;
export const HELP_WHAT_IS_THAT_PERSON_LIKE = 39;
export const HELP_WHAT_DOES_HIDDEN_MOVE_DO = 40;
export const HELP_WHAT_DO_I_DO_IN_SAFARI = 41;
export const HELP_WHAT_ARE_SAFARI_RULES = 42;
export const HELP_WANT_TO_END_SAFARI = 43;
export const HELP_WHAT_IS_A_GYM = 44;

export const HELP_USING_POKEDEX = 1;
export const HELP_USING_POKEMON = 2;
export const HELP_USING_SUMMARY = 3;
export const HELP_USING_SWITCH = 4;
export const HELP_USING_ITEM = 5;
export const HELP_USING_BAG = 6;
export const HELP_USING_AN_ITEM = 7;
export const HELP_USING_KEYITEM = 8;
export const HELP_USING_POKEBALL = 9;
export const HELP_USING_PLAYER = 10;
export const HELP_USING_SAVE = 11;
export const HELP_USING_OPTION = 12;
export const HELP_USING_POTION = 13;
export const HELP_USING_TOWN_MAP = 14;
export const HELP_USING_TM = 15;
export const HELP_USING_HM = 16;
export const HELP_USING_MOVE_OUTSIDE_OF_BATTLE = 17;
export const HELP_RIDING_BICYCLE = 18;
export const HELP_ENTERING_NAME = 19;
export const HELP_USING_PC = 20;
export const HELP_USING_BILLS_PC = 21;
export const HELP_USING_WITHDRAW = 22;
export const HELP_USING_DEPOSIT = 23;
export const HELP_USING_MOVE = 24;
export const HELP_MOVING_ITEMS = 25;
export const HELP_USING_PLAYERS_PC = 26;
export const HELP_USING_WITHDRAW_ITEM = 27;
export const HELP_USING_DEPOSIT_ITEM = 28;
export const HELP_USING_MAILBOX = 29;
export const HELP_USING_PROF_OAKS_PC = 30;
export const HELP_OPENING_MENU = 31;
export const HELP_USING_FIGHT = 32;
export const HELP_USING_POKEMON2 = 33;
export const HELP_USING_SHIFT = 34;
export const HELP_USING_SUMMARY2 = 35;
export const HELP_USING_BAG2 = 36;
export const HELP_READING_POKEDEX = 37;
export const HELP_USING_HOME_PC = 38;
export const HELP_USING_ITEM_STORAGE = 39;
export const HELP_USING_WITHDRAW_ITEM2 = 40;
export const HELP_USING_DEPOSIT_ITEM2 = 41;
export const HELP_USING_MAILBOX2 = 42;
export const HELP_USING_RUN = 43;
export const HELP_REGISTER_KEY_ITEM = 44;
export const HELP_USING_BALL = 45;
export const HELP_USING_BAIT = 46;
export const HELP_USING_ROCK = 47;
export const HELP_USING_HALL_OF_FAME = 48;

export const HELP_TERM_HP = 1;
export const HELP_TERM_EXP = 2;
export const HELP_TERM_MOVES = 3;
export const HELP_TERM_ATTACK = 4;
export const HELP_TERM_DEFENSE = 5;
export const HELP_TERM_SPATK = 6;
export const HELP_TERM_SPDEF = 7;
export const HELP_TERM_SPEED = 8;
export const HELP_TERM_LEVEL = 9;
export const HELP_TERM_TYPE = 10;
export const HELP_TERM_OT = 11;
export const HELP_TERM_ITEM = 12;
export const HELP_TERM_ABILITY = 13;
export const HELP_TERM_MONEY = 14;
export const HELP_TERM_MOVE_TYPE = 15;
export const HELP_TERM_NATURE = 16;
export const HELP_TERM_ID_NO = 17;
export const HELP_TERM_PP = 18;
export const HELP_TERM_POWER = 19;
export const HELP_TERM_ACCURACY = 20;
export const HELP_TERM_FNT = 21;
export const HELP_TERM_ITEMS = 22;
export const HELP_TERM_KEYITEMS = 23;
export const HELP_TERM_POKEBALLS = 24;
export const HELP_TERM_POKEDEX = 25;
export const HELP_TERM_PLAY_TIME = 26;
export const HELP_TERM_BADGES = 27;
export const HELP_TERM_TEXT_SPEED = 28;
export const HELP_TERM_BATTLE_SCENE = 29;
export const HELP_TERM_BATTLE_STYLE = 30;
export const HELP_TERM_SOUND = 31;
export const HELP_TERM_BUTTON_MODE = 32;
export const HELP_TERM_FRAME = 33;
export const HELP_TERM_CANCEL = 34;
export const HELP_TERM_TM = 35;
export const HELP_TERM_HM = 36;
export const HELP_TERM_HM_MOVE = 37;
export const HELP_TERM_EVOLUTION = 38;
export const HELP_TERM_STATUS_PROBLEM = 39;
export const HELP_TERM_POKEMON = 40;
export const HELP_TERM_ID_NO2 = 41;
export const HELP_TERM_MONEY2 = 42;
export const HELP_TERM_BADGES2 = 43;

export const HELP_THE_HELP_SYSTEM = 1;
export const HELP_THE_GAME = 2;
export const HELP_WIRELESS_ADAPTER = 3;
export const HELP_GAME_FUNDAMENTALS_1 = 4;
export const HELP_GAME_FUNDAMENTALS_2 = 5;
export const HELP_GAME_FUNDAMENTALS_3 = 6;
export const HELP_WHAT_ARE_POKEMON = 7;

export interface HelpSystemState {
  level: number;
  topic: number;
  scrollMain: number;
  scrollSub: number;
}

export interface HelpSystemCoreRuntime {
  sHelpSystemContextId: number;
  sSeenHelpSystemIntro: boolean;
  gHelpContextIdBackup: number;
  gHelpSystemEnabled: boolean;
  gHelpSystemToggleWithRButtonDisabled: boolean;
  gQuestLogState: number;
  gReceivedRemoteLinkPlayers: boolean;
  gSaveFileStatus: number;
  flags: Set<string>;
  bagItems: Set<number>;
  kantoPokedexCount: number;
  gHelpSystemState: HelpSystemState;
  gSpecialVar_0x8004: number;
  location: { mapGroup: number; mapNum: number };
  mapType: number;
  playerAvatarFlags: number;
  currentMapIsPokeCenter: boolean;
  martMaps: readonly number[];
  gymMaps: readonly number[];
  dungeonMaps: ReadonlyArray<readonly [number, number, number, boolean?]>;
  helpSystemMenuInput: number;
  mainWindowTextVisible: boolean;
  controlsGuideVisible: boolean;
  topLevelTooltipVisible: boolean;
  mainWindowBgBrightness: number;
  headerFooterDarkerVisible: boolean;
  headerFooterLighterVisible: boolean;
  headerLineDarkerFooterStyleVisible: boolean;
  panel1Text: string;
  panel2RightText: string;
  topicMouseoverDescription: string;
  printedTopicLabel: string;
  printedQuestionAnswer: { question: string; answer: string } | null;
  listMenuController: { itemsAbove: number; cursorPos: number } | null;
  inputDelay: number;
  playedSoundEffects: number[];
  uiOperations: string[];
}

export const sHelpSystemTopicPtrs = [
  'Help_Text_WhatShouldIDo',
  'Help_Text_HowDoIDoThis',
  'Help_Text_WhatDoesThisTermMean',
  'Help_Text_AboutThisGame',
  'Help_Text_TypeMatchupList',
  'Help_Text_Exit'
] as const;

export const sHelpSystemMenuTopicTextPtrs = Array.from({ length: HELP_USING_HALL_OF_FAME + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_HowToDo_${i}`
);
sHelpSystemMenuTopicTextPtrs[HELP_USING_BAG] = 'Help_Text_UsingBag';
sHelpSystemMenuTopicTextPtrs[HELP_USING_AN_ITEM] = 'Help_Text_UsingAnItem';
sHelpSystemMenuTopicTextPtrs[HELP_USING_KEYITEM] = 'Help_Text_UsingKeyItem';
sHelpSystemMenuTopicTextPtrs[HELP_REGISTER_KEY_ITEM] = 'Help_Text_RegisterKeyItem';
sHelpSystemMenuTopicTextPtrs[HELP_USING_POKEBALL] = 'Help_Text_UsingPokeBall';
sHelpSystemMenuTopicTextPtrs[HELP_USING_POTION] = 'Help_Text_UsingPotion';
sHelpSystemMenuTopicTextPtrs[HELP_USING_TOWN_MAP] = 'Help_Text_UsingTownMap';
sHelpSystemMenuTopicTextPtrs[HELP_USING_TM] = 'Help_Text_UsingTM';
sHelpSystemMenuTopicTextPtrs[HELP_USING_HM] = 'Help_Text_UsingHM';
sHelpSystemMenuTopicTextPtrs[HELP_RIDING_BICYCLE] = 'Help_Text_RidingBicycle';
sHelpSystemMenuTopicTextPtrs[HELP_OPENING_MENU] = 'Help_Text_OpeningMenu';
sHelpSystemMenuTopicTextPtrs[HELP_USING_POKEDEX] = 'Help_Text_UsingPokedex';
sHelpSystemMenuTopicTextPtrs[HELP_USING_POKEMON] = 'Help_Text_UsingPokemon';
sHelpSystemMenuTopicTextPtrs[HELP_USING_SUMMARY] = 'Help_Text_UsingSummary';
sHelpSystemMenuTopicTextPtrs[HELP_USING_SWITCH] = 'Help_Text_UsingSwitch';
sHelpSystemMenuTopicTextPtrs[HELP_USING_ITEM] = 'Help_Text_UsingItem';
sHelpSystemMenuTopicTextPtrs[HELP_USING_PLAYER] = 'Help_Text_UsingPlayer';
sHelpSystemMenuTopicTextPtrs[HELP_USING_SAVE] = 'Help_Text_UsingSave';
sHelpSystemMenuTopicTextPtrs[HELP_USING_OPTION] = 'Help_Text_UsingOption';
sHelpSystemMenuTopicTextPtrs[HELP_USING_MOVE_OUTSIDE_OF_BATTLE] = 'Help_Text_UsingMoveOutsideOfBattle';

export const sHelpSystemTermTextPtrs = Array.from({ length: HELP_TERM_BADGES2 + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_Term_${i}`
);
sHelpSystemTermTextPtrs[HELP_TERM_LEVEL] = 'Help_Text_Level';
sHelpSystemTermTextPtrs[HELP_TERM_HP] = 'Help_Text_HP';
sHelpSystemTermTextPtrs[HELP_TERM_EXP] = 'Help_Text_EXP';
sHelpSystemTermTextPtrs[HELP_TERM_MOVES] = 'Help_Text_Moves';
sHelpSystemTermTextPtrs[HELP_TERM_TM] = 'Help_Text_TM';
sHelpSystemTermTextPtrs[HELP_TERM_HM_MOVE] = 'Help_Text_HMMove';
sHelpSystemTermTextPtrs[HELP_TERM_HM] = 'Help_Text_HM';
sHelpSystemTermTextPtrs[HELP_TERM_ATTACK] = 'Help_Text_Attack';
sHelpSystemTermTextPtrs[HELP_TERM_DEFENSE] = 'Help_Text_Defense';
sHelpSystemTermTextPtrs[HELP_TERM_SPATK] = 'Help_Text_SpAtk';
sHelpSystemTermTextPtrs[HELP_TERM_SPDEF] = 'Help_Text_SpDef';
sHelpSystemTermTextPtrs[HELP_TERM_SPEED] = 'Help_Text_Speed';
sHelpSystemTermTextPtrs[HELP_TERM_TYPE] = 'Help_Text_Type';
sHelpSystemTermTextPtrs[HELP_TERM_OT] = 'Help_Text_OT';
sHelpSystemTermTextPtrs[HELP_TERM_ITEM] = 'Help_Text_Item';
sHelpSystemTermTextPtrs[HELP_TERM_ABILITY] = 'Help_Text_Ability';
sHelpSystemTermTextPtrs[HELP_TERM_MOVE_TYPE] = 'Help_Text_MoveType';
sHelpSystemTermTextPtrs[HELP_TERM_NATURE] = 'Help_Text_Nature';
sHelpSystemTermTextPtrs[HELP_TERM_ID_NO] = 'Help_Text_IDNo';
sHelpSystemTermTextPtrs[HELP_TERM_PP] = 'Help_Text_PP';
sHelpSystemTermTextPtrs[HELP_TERM_POWER] = 'Help_Text_Power';
sHelpSystemTermTextPtrs[HELP_TERM_ACCURACY] = 'Help_Text_Accuracy';
sHelpSystemTermTextPtrs[HELP_TERM_STATUS_PROBLEM] = 'Help_Text_StatusProblem';
sHelpSystemTermTextPtrs[HELP_TERM_FNT] = 'Help_Text_FNT';
sHelpSystemTermTextPtrs[HELP_TERM_EVOLUTION] = 'Help_Text_Evolution';
sHelpSystemTermTextPtrs[HELP_TERM_ITEMS] = 'Help_Text_Items';
sHelpSystemTermTextPtrs[HELP_TERM_KEYITEMS] = 'Help_Text_KeyItems';
sHelpSystemTermTextPtrs[HELP_TERM_POKEBALLS] = 'Help_Text_PokeBalls';
sHelpSystemTermTextPtrs[HELP_TERM_PLAY_TIME] = 'Help_Text_PlayTime';
sHelpSystemTermTextPtrs[HELP_TERM_MONEY] = 'Help_Text_Money';
sHelpSystemTermTextPtrs[HELP_TERM_BADGES] = 'Help_Text_Badges';

export const sHelpSystemGeneralTopicTextPtrs = Array.from({ length: HELP_WHAT_ARE_POKEMON + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_General_${i}`
);
sHelpSystemGeneralTopicTextPtrs[HELP_THE_HELP_SYSTEM] = 'Help_Text_TheHelpSystem';
sHelpSystemGeneralTopicTextPtrs[HELP_THE_GAME] = 'Help_Text_TheGame';
sHelpSystemGeneralTopicTextPtrs[HELP_WIRELESS_ADAPTER] = 'Help_Text_WirelessAdapter';
sHelpSystemGeneralTopicTextPtrs[HELP_GAME_FUNDAMENTALS_1] = 'Help_Text_GameFundamentals1';
sHelpSystemGeneralTopicTextPtrs[HELP_GAME_FUNDAMENTALS_2] = 'Help_Text_GameFundamentals2';
sHelpSystemGeneralTopicTextPtrs[HELP_GAME_FUNDAMENTALS_3] = 'Help_Text_GameFundamentals3';

export const sHelpSystemSpecializedQuestionTextPtrs = Array.from({ length: HELP_WHAT_IS_A_GYM + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_SpecializedQuestion_${i}`
);
sHelpSystemSpecializedQuestionTextPtrs[HELP_SOMEONE_BLOCKING_MY_WAY] = 'Help_Text_SomeoneBlockingMyWay';
sHelpSystemSpecializedQuestionTextPtrs[HELP_WHAT_ARE_MY_ADVENTURE_BASICS] = 'Help_Text_WhatAreMyAdventureBasics';
sHelpSystemSpecializedQuestionTextPtrs[HELP_WHATS_POKEMON_CENTER] = 'Help_Text_WhatsPokemonCenter';
sHelpSystemSpecializedQuestionTextPtrs[HELP_WHATS_POKEMON_MART] = 'Help_Text_WhatsPokemonMart';
sHelpSystemSpecializedQuestionTextPtrs[HELP_WHAT_HAPPENED_TO_ITEM_I_GOT] = 'Help_Text_WhatHappenedToItemIGot';
sHelpSystemSpecializedQuestionTextPtrs[HELP_WANT_TO_END_GAME] = 'Help_Text_WantToEndGame';

export const sHelpSystemTypeMatchupTextPtrs = Array.from({ length: 36 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_TypeMatchup_${i}`
);

export const sHelpSystemTopicMouseoverDescriptionPtrs = Array.from({ length: TOPIC_COUNT }, (_, i) =>
  `Help_Text_TopicMouseover_${i}`
);
export const sHelpSystemSpecializedAnswerTextPtrs = Array.from({ length: HELP_WHAT_IS_A_GYM + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_SpecializedAnswer_${i}`
);
export const sHelpSystemHowToUseMenuTextPtrs = Array.from({ length: HELP_USING_HALL_OF_FAME + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_HowToUse_${i}`
);
export const sHelpSystemTermDefinitionsTextPtrs = Array.from({ length: HELP_TERM_BADGES2 + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_TermDefinition_${i}`
);
export const sHelpSystemGeneralTopicDescriptionTextPtrs = Array.from({ length: HELP_WHAT_ARE_POKEMON + 1 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_GeneralDescription_${i}`
);
export const sHelpSystemTypeMatchupDescriptionTextPtrs = Array.from({ length: 36 }, (_, i) =>
  i === HELP_NONE ? '' : `Help_Text_TypeMatchupDescription_${i}`
);

export const sHelpSystemContextTopicOrder = [
  TOPIC_ABOUT_GAME,
  TOPIC_WHAT_TO_DO,
  TOPIC_HOW_TO_DO,
  TOPIC_TERMS,
  TOPIC_TYPE_MATCHUP,
  TOPIC_EXIT
] as const;

export const sAboutGame_TitleScreen = [
  HELP_THE_HELP_SYSTEM,
  HELP_THE_GAME,
  HELP_WIRELESS_ADAPTER,
  HELP_END
] as const;

export const sHowTo_Bag = [
  HELP_USING_BAG,
  HELP_USING_AN_ITEM,
  HELP_USING_KEYITEM,
  HELP_REGISTER_KEY_ITEM,
  HELP_USING_POKEBALL,
  HELP_USING_POTION,
  HELP_USING_TOWN_MAP,
  HELP_USING_TM,
  HELP_USING_HM,
  HELP_RIDING_BICYCLE,
  HELP_END
] as const;

export const sTerms_Bag = [
  HELP_TERM_ITEMS,
  HELP_TERM_KEYITEMS,
  HELP_TERM_POKEBALLS,
  HELP_END
] as const;

export const sWhatToDo_Gym = [
  HELP_SOMEONE_BLOCKING_MY_WAY,
  HELP_WHAT_ARE_MY_ADVENTURE_BASICS,
  HELP_WHATS_POKEMON_CENTER,
  HELP_WHATS_POKEMON_MART,
  HELP_WHAT_HAPPENED_TO_ITEM_I_GOT,
  HELP_WANT_TO_END_GAME,
  HELP_END
] as const;

export const sHowTo_Gym = [
  HELP_OPENING_MENU,
  HELP_USING_POKEDEX,
  HELP_USING_POKEMON,
  HELP_USING_SUMMARY,
  HELP_USING_SWITCH,
  HELP_USING_ITEM,
  HELP_USING_BAG,
  HELP_USING_AN_ITEM,
  HELP_USING_KEYITEM,
  HELP_REGISTER_KEY_ITEM,
  HELP_USING_POKEBALL,
  HELP_USING_POTION,
  HELP_USING_TOWN_MAP,
  HELP_USING_TM,
  HELP_USING_HM,
  HELP_USING_PLAYER,
  HELP_USING_SAVE,
  HELP_USING_OPTION,
  HELP_USING_MOVE_OUTSIDE_OF_BATTLE,
  HELP_END
] as const;

export const sTerms_Gym = [
  HELP_TERM_LEVEL,
  HELP_TERM_HP,
  HELP_TERM_EXP,
  HELP_TERM_MOVES,
  HELP_TERM_TYPE,
  HELP_TERM_FNT,
  HELP_END
] as const;

export const sTypeMatchups_Gym = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
  HELP_END
] as const;

export const sTerms_Basic = [
  HELP_TERM_LEVEL,
  HELP_TERM_HP,
  HELP_TERM_EXP,
  HELP_TERM_MOVES,
  HELP_TERM_TM,
  HELP_TERM_HM_MOVE,
  HELP_TERM_HM,
  HELP_TERM_ATTACK,
  HELP_TERM_DEFENSE,
  HELP_TERM_SPATK,
  HELP_TERM_SPDEF,
  HELP_TERM_SPEED,
  HELP_TERM_TYPE,
  HELP_TERM_OT,
  HELP_TERM_ITEM,
  HELP_TERM_ABILITY,
  HELP_TERM_MOVE_TYPE,
  HELP_TERM_NATURE,
  HELP_TERM_ID_NO,
  HELP_TERM_PP,
  HELP_TERM_POWER,
  HELP_TERM_ACCURACY,
  HELP_TERM_STATUS_PROBLEM,
  HELP_TERM_FNT,
  HELP_TERM_EVOLUTION,
  HELP_TERM_ITEMS,
  HELP_TERM_KEYITEMS,
  HELP_TERM_POKEBALLS,
  HELP_TERM_PLAY_TIME,
  HELP_TERM_MONEY,
  HELP_TERM_BADGES,
  HELP_END
] as const;

const emptySubmenu = [HELP_END] as const;

export const sHelpSystemSubmenuItemLists = Array.from(
  { length: HELPCONTEXT_COUNT * (TOPIC_COUNT - 1) },
  () => emptySubmenu as readonly number[]
);
sHelpSystemSubmenuItemLists[HELPCONTEXT_TITLE_SCREEN * 5 + TOPIC_ABOUT_GAME] = sAboutGame_TitleScreen;
sHelpSystemSubmenuItemLists[HELPCONTEXT_BAG * 5 + TOPIC_HOW_TO_DO] = sHowTo_Bag;
sHelpSystemSubmenuItemLists[HELPCONTEXT_BAG * 5 + TOPIC_TERMS] = sTerms_Bag;
sHelpSystemSubmenuItemLists[HELPCONTEXT_GYM * 5 + TOPIC_WHAT_TO_DO] = sWhatToDo_Gym;
sHelpSystemSubmenuItemLists[HELPCONTEXT_GYM * 5 + TOPIC_HOW_TO_DO] = sHowTo_Gym;
sHelpSystemSubmenuItemLists[HELPCONTEXT_GYM * 5 + TOPIC_TERMS] = sTerms_Gym;
sHelpSystemSubmenuItemLists[HELPCONTEXT_GYM * 5 + TOPIC_TYPE_MATCHUP] = sTypeMatchups_Gym;

const contextTopicFlags = (
  whatToDo: boolean,
  howToDo: boolean,
  terms: boolean,
  aboutGame: boolean,
  typeMatchup: boolean,
  exit: boolean
): boolean[] => {
  const flags = Array.from({ length: TOPIC_COUNT }, () => false);
  flags[TOPIC_WHAT_TO_DO] = whatToDo;
  flags[TOPIC_HOW_TO_DO] = howToDo;
  flags[TOPIC_TERMS] = terms;
  flags[TOPIC_ABOUT_GAME] = aboutGame;
  flags[TOPIC_TYPE_MATCHUP] = typeMatchup;
  flags[TOPIC_EXIT] = exit;
  return flags;
};

export const sHelpSystemContextTopicFlags: boolean[][] = [
  contextTopicFlags(false, false, false, false, false, true),
  contextTopicFlags(false, false, false, true, false, true),
  contextTopicFlags(false, false, false, true, false, true),
  contextTopicFlags(false, true, false, true, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, true, false, false, true),
  contextTopicFlags(false, true, true, false, false, true),
  contextTopicFlags(false, false, true, false, false, true),
  contextTopicFlags(false, false, true, false, false, true),
  contextTopicFlags(false, true, true, false, false, true),
  contextTopicFlags(false, true, true, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, true, false, false, true),
  contextTopicFlags(false, true, true, false, false, true),
  contextTopicFlags(true, false, false, true, false, true),
  contextTopicFlags(true, true, true, false, false, true),
  contextTopicFlags(true, true, true, true, false, true),
  contextTopicFlags(true, true, true, false, false, true),
  contextTopicFlags(true, true, true, false, true, true),
  contextTopicFlags(true, true, true, false, false, true),
  contextTopicFlags(true, true, true, false, false, true),
  contextTopicFlags(true, true, true, false, false, true),
  contextTopicFlags(true, true, true, false, false, true),
  contextTopicFlags(true, true, true, false, true, true),
  contextTopicFlags(true, true, true, false, true, true),
  contextTopicFlags(true, true, true, false, true, true),
  contextTopicFlags(true, true, true, false, true, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, true, false, false, false, true),
  contextTopicFlags(false, false, false, false, false, false),
  contextTopicFlags(false, false, false, false, false, false)
];

export const createHelpSystemCoreRuntime = (
  overrides: Partial<HelpSystemCoreRuntime> = {}
): HelpSystemCoreRuntime => ({
  sHelpSystemContextId: HELPCONTEXT_NONE,
  sSeenHelpSystemIntro: false,
  gHelpContextIdBackup: HELPCONTEXT_NONE,
  gHelpSystemEnabled: false,
  gHelpSystemToggleWithRButtonDisabled: false,
  gQuestLogState: 0,
  gReceivedRemoteLinkPlayers: false,
  gSaveFileStatus: SAVE_STATUS_EMPTY,
  flags: new Set(),
  bagItems: new Set(),
  kantoPokedexCount: 0,
  gHelpSystemState: { level: 0, topic: TOPIC_WHAT_TO_DO, scrollMain: 0, scrollSub: 0 },
  gSpecialVar_0x8004: HELPCONTEXT_NONE,
  location: { mapGroup: 0, mapNum: 0 },
  mapType: 0,
  playerAvatarFlags: 0,
  currentMapIsPokeCenter: false,
  martMaps: [MAP_UNDEFINED],
  gymMaps: [MAP_UNDEFINED],
  dungeonMaps: [],
  helpSystemMenuInput: -1,
  mainWindowTextVisible: false,
  controlsGuideVisible: false,
  topLevelTooltipVisible: false,
  mainWindowBgBrightness: 0,
  headerFooterDarkerVisible: false,
  headerFooterLighterVisible: false,
  headerLineDarkerFooterStyleVisible: false,
  panel1Text: '',
  panel2RightText: '',
  topicMouseoverDescription: '',
  printedTopicLabel: '',
  printedQuestionAnswer: null,
  listMenuController: null,
  inputDelay: 0,
  playedSoundEffects: [],
  uiOperations: [],
  ...overrides
});

export const SetHelpContextDontCheckBattle = (runtime: HelpSystemCoreRuntime, contextId: number): void => {
  runtime.sHelpSystemContextId = contextId;
};

export const SetHelpContext = (runtime: HelpSystemCoreRuntime, contextId: number): void => {
  switch (runtime.sHelpSystemContextId) {
    case HELPCONTEXT_WILD_BATTLE:
    case HELPCONTEXT_TRAINER_BATTLE_SINGLE:
    case HELPCONTEXT_TRAINER_BATTLE_DOUBLE:
    case HELPCONTEXT_SAFARI_BATTLE:
      if (
        contextId === HELPCONTEXT_BAG ||
        contextId === HELPCONTEXT_PARTY_MENU ||
        contextId === HELPCONTEXT_POKEMON_INFO ||
        contextId === HELPCONTEXT_POKEMON_SKILLS ||
        contextId === HELPCONTEXT_POKEMON_MOVES
      ) {
        break;
      }
    default:
      runtime.sHelpSystemContextId = contextId;
      break;
  }
};

export const Script_SetHelpContext = (runtime: HelpSystemCoreRuntime): void => {
  runtime.sHelpSystemContextId = runtime.gSpecialVar_0x8004;
};

export const BackupHelpContext = (runtime: HelpSystemCoreRuntime): void => {
  runtime.gHelpContextIdBackup = runtime.sHelpSystemContextId;
};

export const RestoreHelpContext = (runtime: HelpSystemCoreRuntime): void => {
  runtime.sHelpSystemContextId = runtime.gHelpContextIdBackup;
};

export const IsCurrentMapInArray = (runtime: HelpSystemCoreRuntime, mapIdxs: readonly number[]): boolean => {
  const mapIdx = ((runtime.location.mapGroup & 0xff) << 8) + (runtime.location.mapNum & 0xff);
  for (let i = 0; mapIdxs[i] !== MAP_UNDEFINED && i < mapIdxs.length; i += 1) {
    if (mapIdxs[i] === mapIdx)
      return true;
  }
  return false;
};

export const IsInMartMap = (runtime: HelpSystemCoreRuntime): boolean =>
  IsCurrentMapInArray(runtime, runtime.martMaps);

export const IsInGymMap = (runtime: HelpSystemCoreRuntime): boolean =>
  IsCurrentMapInArray(runtime, runtime.gymMaps);

export const IsInDungeonMap = (runtime: HelpSystemCoreRuntime): boolean => {
  for (let i = 0; i < runtime.dungeonMaps.length; i += 1) {
    const [mapGroup, firstMapNum, count, requiresTanobyUnlock] = runtime.dungeonMaps[i];
    for (let j = 0; j < count; j += 1) {
      if (
        mapGroup === runtime.location.mapGroup
        && firstMapNum + j === runtime.location.mapNum
        && (requiresTanobyUnlock !== true || runtime.flags.has(FLAG_SYS_UNLOCKED_TANOBY_RUINS))
      ) {
        return true;
      }
    }
  }
  return false;
};

export const SetHelpContextForMap = (runtime: HelpSystemCoreRuntime): void => {
  HelpSystem_EnableToggleWithRButton(runtime);
  if ((runtime.playerAvatarFlags & PLAYER_AVATAR_FLAG_SURFING) !== 0)
    SetHelpContext(runtime, HELPCONTEXT_SURFING);
  else if (IsInDungeonMap(runtime))
    SetHelpContext(runtime, HELPCONTEXT_DUNGEON);
  else if (runtime.mapType === MAP_TYPE_INDOOR) {
    if (runtime.location.mapGroup === 0 && (runtime.location.mapNum === 0 || runtime.location.mapNum === 1))
      SetHelpContext(runtime, HELPCONTEXT_PLAYERS_HOUSE);
    else if (runtime.location.mapGroup === 0 && runtime.location.mapNum === 2)
      SetHelpContext(runtime, HELPCONTEXT_OAKS_LAB);
    else if (runtime.currentMapIsPokeCenter)
      SetHelpContext(runtime, HELPCONTEXT_POKECENTER);
    else if (IsInMartMap(runtime))
      SetHelpContext(runtime, HELPCONTEXT_MART);
    else if (IsInGymMap(runtime))
      SetHelpContext(runtime, HELPCONTEXT_GYM);
    else
      SetHelpContext(runtime, HELPCONTEXT_INDOORS);
  } else {
    SetHelpContext(runtime, HELPCONTEXT_OVERWORLD);
  }
};

export const HelpSystem_UpdateHasntSeenIntro = (runtime: HelpSystemCoreRuntime): boolean => {
  if (runtime.sSeenHelpSystemIntro === true) {
    return false;
  }

  if (
    runtime.gSaveFileStatus !== SAVE_STATUS_EMPTY &&
    runtime.gSaveFileStatus !== SAVE_STATUS_INVALID &&
    runtime.flags.has(FLAG_SYS_SAW_HELP_SYSTEM_INTRO)
  ) {
    return false;
  }

  runtime.flags.add(FLAG_SYS_SAW_HELP_SYSTEM_INTRO);
  runtime.sSeenHelpSystemIntro = true;
  return true;
};

export const HelpSystem_IsSinglePlayer = (runtime: HelpSystemCoreRuntime): boolean => {
  if (runtime.gReceivedRemoteLinkPlayers === true) {
    return false;
  }
  return true;
};

export const HelpSystem_Disable = (runtime: HelpSystemCoreRuntime): void => {
  runtime.gHelpSystemEnabled = false;
};

export const HelpSystem_EnableToggleWithRButton = (runtime: HelpSystemCoreRuntime): void => {
  runtime.gHelpSystemToggleWithRButtonDisabled = false;
};

export const HelpSystem_DisableToggleWithRButton = (runtime: HelpSystemCoreRuntime): void => {
  runtime.gHelpSystemToggleWithRButtonDisabled = true;
};

export const HelpSystem_Enable = (runtime: HelpSystemCoreRuntime): void => {
  if (!(runtime.gQuestLogState === 2 || runtime.gQuestLogState === 3)) {
    runtime.gHelpSystemEnabled = true;
    HelpSystem_EnableToggleWithRButton(runtime);
  }
};

export const ResetHelpSystemListMenu = (
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): void => {
  helpListMenu.sub.items = listMenuItemsBuffer;
  helpListMenu.sub.totalItems = 1;
  helpListMenu.sub.maxShowed = 1;
  helpListMenu.sub.left = 1;
  helpListMenu.sub.top = 4;
};

export const BuildMainTopicsListAndMoveToH00 = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): void => {
  let totalItems = 0;
  for (let i = 0; i < TOPIC_COUNT; i += 1) {
    const topic = sHelpSystemContextTopicOrder[i];
    if (sHelpSystemContextTopicFlags[runtime.sHelpSystemContextId][topic] === true) {
      listMenuItemsBuffer[totalItems].label = sHelpSystemTopicPtrs[topic];
      listMenuItemsBuffer[totalItems].index = topic;
      totalItems += 1;
    }
  }
  listMenuItemsBuffer[totalItems - 1].index = -2;
  helpListMenu.sub.totalItems = totalItems;
  helpListMenu.sub.maxShowed = totalItems;
  helpListMenu.sub.left = 0;
};

export const HelpSystem_ShouldShowBasicTerms = (runtime: HelpSystemCoreRuntime): boolean => {
  if (runtime.flags.has(FLAG_DEFEATED_BROCK) === true && runtime.gHelpSystemState.topic === TOPIC_TERMS) {
    return true;
  }
  return false;
};

export const IsHelpSystemSubmenuEnabled = (
  runtime: HelpSystemCoreRuntime,
  id: number
): boolean => {
  let i = 0;

  if (runtime.gHelpSystemState.topic === TOPIC_WHAT_TO_DO) {
    switch (id) {
      case HELP_PLAYING_FOR_FIRST_TIME:
      case HELP_WHAT_SHOULD_I_BE_DOING:
      case HELP_CANT_GET_OUT_OF_ROOM:
      case HELP_TALKED_TO_EVERYONE_NOW_WHAT:
      case HELP_OUT_OF_THINGS_TO_DO:
      case HELP_NOTHING_I_WANT_TO_KNOW:
      case HELP_WHATS_A_MON:
      case HELP_WHAT_DO_I_DO_IN_SAFARI:
      case HELP_WHAT_ARE_SAFARI_RULES:
      case HELP_WANT_TO_END_SAFARI:
        return true;
      case HELP_CANT_FIND_PERSON_I_WANT:
        return runtime.flags.has(FLAG_VISITED_OAKS_LAB);
      case HELP_SOMEONE_BLOCKING_MY_WAY:
      case HELP_WHAT_ARE_MY_ADVENTURE_BASICS:
      case HELP_HOW_DO_I_PREPARE_FOR_BATTLE:
      case HELP_WHAT_IS_STATUS_PROBLEM:
      case HELP_RAN_OUT_OF_POTIONS:
      case HELP_WHATS_POKEMON_CENTER:
      case HELP_WHATS_POKEMON_MART:
        return runtime.flags.has(FLAG_WORLD_MAP_VIRIDIAN_CITY);
      case HELP_I_CANT_GO_ON:
        return runtime.flags.has(FLAG_WORLD_MAP_VERMILION_CITY);
      case HELP_HOW_ARE_ROADS_FORESTS_DIFFERENT:
      case HELP_WHATS_A_TRAINER:
        return runtime.flags.has(FLAG_WORLD_MAP_VIRIDIAN_FOREST);
      case HELP_WHAT_HAPPENED_TO_ITEM_I_GOT:
      case HELP_WHEN_CAN_I_USE_ITEM:
      case HELP_HOW_DO_I_PROGRESS:
      case HELP_WHATS_A_BATTLE:
      case HELP_WHAT_IS_A_MONS_VITALITY:
      case HELP_MY_MONS_ARE_HURT:
      case HELP_WHAT_HAPPENS_IF_ALL_MY_MONS_FAINT:
      case HELP_WHERE_DO_MONS_APPEAR:
      case HELP_WHAT_MOVES_SHOULD_I_USE:
      case HELP_WANT_TO_MAKE_MON_STRONGER:
      case HELP_WANT_TO_END_GAME:
        return runtime.flags.has(FLAG_SYS_POKEMON_GET);
      case HELP_CANT_CATCH_MONS:
      case HELP_CAN_I_BUY_POKEBALLS:
        return runtime.flags.has(FLAG_SYS_POKEDEX_GET);
      case HELP_HOW_ARE_CAVES_DIFFERENT:
      case HELP_WHAT_DO_I_DO_IN_CAVE:
      case HELP_HOW_DO_I_WIN_AGAINST_TRAINER:
      case HELP_FOE_MONS_TOO_STRONG:
      case HELP_WHAT_ARE_MOVES:
      case HELP_WANT_TO_ADD_MORE_MOVES:
        return runtime.flags.has(FLAG_BADGE01_GET);
      case HELP_WHAT_ARE_HIDDEN_MOVES:
      case HELP_WHAT_DOES_HIDDEN_MOVE_DO:
        return HasGottenAtLeastOneHM(runtime);
      case HELP_WHAT_IS_THAT_PERSON_LIKE:
        return runtime.flags.has(FLAG_GOT_FAME_CHECKER);
      case HELP_WHAT_IS_A_GYM:
        return runtime.flags.has(FLAG_WORLD_MAP_PEWTER_CITY);
    }
    return false;
  }
  if (runtime.gHelpSystemState.topic === TOPIC_HOW_TO_DO) {
    switch (id) {
      case HELP_USING_BAG:
      case HELP_USING_PLAYER:
      case HELP_USING_SAVE:
      case HELP_USING_OPTION:
      case HELP_ENTERING_NAME:
      case HELP_USING_PC:
      case HELP_USING_BILLS_PC:
      case HELP_USING_WITHDRAW:
      case HELP_USING_DEPOSIT:
      case HELP_USING_MOVE:
      case HELP_MOVING_ITEMS:
      case HELP_USING_PLAYERS_PC:
      case HELP_USING_WITHDRAW_ITEM:
      case HELP_USING_DEPOSIT_ITEM:
      case HELP_USING_MAILBOX:
      case HELP_OPENING_MENU:
      case HELP_USING_BAG2:
      case HELP_USING_HOME_PC:
      case HELP_USING_ITEM_STORAGE:
      case HELP_USING_WITHDRAW_ITEM2:
      case HELP_USING_DEPOSIT_ITEM2:
      case HELP_USING_MAILBOX2:
      case HELP_USING_BALL:
      case HELP_USING_BAIT:
      case HELP_USING_ROCK:
        return true;
      case HELP_USING_POKEDEX:
      case HELP_USING_PROF_OAKS_PC:
      case HELP_READING_POKEDEX:
        return runtime.flags.has(FLAG_SYS_POKEDEX_GET);
      case HELP_USING_TOWN_MAP:
        return runtime.bagItems.has(ITEM_TOWN_MAP);
      case HELP_USING_POKEMON:
      case HELP_USING_SUMMARY:
      case HELP_USING_ITEM:
      case HELP_USING_AN_ITEM:
      case HELP_USING_KEYITEM:
      case HELP_USING_POKEBALL:
      case HELP_USING_POTION:
      case HELP_USING_FIGHT:
      case HELP_USING_POKEMON2:
      case HELP_USING_SUMMARY2:
      case HELP_USING_RUN:
      case HELP_REGISTER_KEY_ITEM:
        return runtime.flags.has(FLAG_SYS_POKEMON_GET);
      case HELP_USING_SWITCH:
      case HELP_USING_SHIFT:
        if (runtime.kantoPokedexCount > 1) return true;
        return false;
      case HELP_USING_TM:
        return runtime.flags.has(FLAG_BADGE01_GET);
      case HELP_USING_HM:
      case HELP_USING_MOVE_OUTSIDE_OF_BATTLE:
        return HasGottenAtLeastOneHM(runtime);
      case HELP_RIDING_BICYCLE:
        return runtime.flags.has(FLAG_GOT_BICYCLE);
      case HELP_USING_HALL_OF_FAME:
        return runtime.flags.has(FLAG_SYS_GAME_CLEAR);
    }
    return false;
  }
  if (runtime.gHelpSystemState.topic === TOPIC_TERMS) {
    if (HelpSystem_ShouldShowBasicTerms(runtime) === true) {
      for (i = 0; sTerms_Basic[i] !== HELP_END; i += 1) {
        if (sTerms_Basic[i] === id) return false;
      }
    }
    switch (id) {
      case HELP_TERM_MONEY:
      case HELP_TERM_ID_NO:
      case HELP_TERM_ITEMS:
      case HELP_TERM_KEYITEMS:
      case HELP_TERM_POKEBALLS:
      case HELP_TERM_POKEDEX:
      case HELP_TERM_PLAY_TIME:
      case HELP_TERM_BADGES:
      case HELP_TERM_TEXT_SPEED:
      case HELP_TERM_BATTLE_SCENE:
      case HELP_TERM_BATTLE_STYLE:
      case HELP_TERM_SOUND:
      case HELP_TERM_BUTTON_MODE:
      case HELP_TERM_FRAME:
      case HELP_TERM_CANCEL:
      case HELP_TERM_TM:
      case HELP_TERM_EVOLUTION:
        return true;
      case HELP_TERM_HP:
      case HELP_TERM_EXP:
      case HELP_TERM_ATTACK:
      case HELP_TERM_DEFENSE:
      case HELP_TERM_SPATK:
      case HELP_TERM_SPDEF:
      case HELP_TERM_SPEED:
      case HELP_TERM_LEVEL:
      case HELP_TERM_TYPE:
      case HELP_TERM_OT:
      case HELP_TERM_ITEM:
      case HELP_TERM_ABILITY:
      case HELP_TERM_NATURE:
      case HELP_TERM_POWER:
      case HELP_TERM_ACCURACY:
      case HELP_TERM_FNT:
        return runtime.flags.has(FLAG_SYS_POKEMON_GET);
      case HELP_TERM_HM:
      case HELP_TERM_HM_MOVE:
        return HasGottenAtLeastOneHM(runtime);
      case HELP_TERM_MOVES:
      case HELP_TERM_MOVE_TYPE:
      case HELP_TERM_PP:
      case HELP_TERM_STATUS_PROBLEM:
        return runtime.flags.has(FLAG_WORLD_MAP_VIRIDIAN_FOREST);
    }
    return true;
  }
  if (runtime.gHelpSystemState.topic === TOPIC_ABOUT_GAME) {
    switch (id) {
      case HELP_GAME_FUNDAMENTALS_2:
        return runtime.flags.has(FLAG_BADGE01_GET);
      case HELP_GAME_FUNDAMENTALS_3:
        return runtime.flags.has(FLAG_BADGE02_GET);
    }
    return true;
  }
  if (runtime.gHelpSystemState.topic === TOPIC_TYPE_MATCHUP) {
    return true;
  }

  return false;
};

const submenuLabelForTopic = (topic: number, id: number): string => {
  if (topic === TOPIC_WHAT_TO_DO) return sHelpSystemSpecializedQuestionTextPtrs[id];
  if (topic === TOPIC_HOW_TO_DO) return sHelpSystemMenuTopicTextPtrs[id];
  if (topic === TOPIC_TERMS) return sHelpSystemTermTextPtrs[id];
  if (topic === TOPIC_ABOUT_GAME) return sHelpSystemGeneralTopicTextPtrs[id];
  return sHelpSystemTypeMatchupTextPtrs[id];
};

export const SetHelpSystemSubmenuItems = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): void => {
  let totalItems = 0;
  let submenuItems = sHelpSystemSubmenuItemLists[runtime.sHelpSystemContextId * 5 + runtime.gHelpSystemState.topic];
  let i: number;
  for (i = 0; submenuItems[i] !== HELP_END; i += 1) {
    if (IsHelpSystemSubmenuEnabled(runtime, submenuItems[i]) === true) {
      listMenuItemsBuffer[totalItems].label = submenuLabelForTopic(runtime.gHelpSystemState.topic, submenuItems[i]);
      listMenuItemsBuffer[totalItems].index = submenuItems[i];
      totalItems += 1;
    }
  }
  if (HelpSystem_ShouldShowBasicTerms(runtime) === true) {
    for (i = 0, submenuItems = sTerms_Basic; submenuItems[i] !== HELP_END; i += 1) {
      listMenuItemsBuffer[totalItems].label = sHelpSystemTermTextPtrs[submenuItems[i]];
      listMenuItemsBuffer[totalItems].index = submenuItems[i];
      totalItems += 1;
    }
  }
  listMenuItemsBuffer[totalItems].label = 'Help_Text_Cancel';
  listMenuItemsBuffer[totalItems].index = -2;
  totalItems += 1;
  helpListMenu.sub.totalItems = totalItems;
  helpListMenu.sub.maxShowed = 7;
  helpListMenu.sub.left = 0;
  helpListMenu.sub.top = 21;
};

const HelpSystem_GetMenuInput = (runtime: HelpSystemCoreRuntime): number => runtime.helpSystemMenuInput;

const PlaySE = (runtime: HelpSystemCoreRuntime, se: number): void => {
  runtime.playedSoundEffects.push(se);
};

const HelpSystem_PrintTextAt = (runtime: HelpSystemCoreRuntime, text: string, x: number, y: number): void => {
  runtime.uiOperations.push(`HelpSystem_PrintTextAt:${text}:${x}:${y}`);
  if (x === 0 && y === 0)
    runtime.printedTopicLabel = text;
};

const HelpSystem_FillPanel1 = (runtime: HelpSystemCoreRuntime): void => {
  runtime.panel1Text = '';
  runtime.uiOperations.push('HelpSystem_FillPanel1');
};

const HelpSystem_FillPanel2 = (runtime: HelpSystemCoreRuntime): void => {
  runtime.panel2RightText = '';
  runtime.uiOperations.push('HelpSystem_FillPanel2');
};

const HelpSystem_PrintTextRightAlign_Row52 = (runtime: HelpSystemCoreRuntime, text: string): void => {
  runtime.panel2RightText = text;
  runtime.uiOperations.push(`HelpSystem_PrintTextRightAlign_Row52:${text}`);
};

const HelpSystem_PrintTopicMouseoverDescription = (runtime: HelpSystemCoreRuntime, text: string): void => {
  runtime.topicMouseoverDescription = text;
  runtime.uiOperations.push(`HelpSystem_PrintTopicMouseoverDescription:${text}`);
};

const HelpSystem_PrintQuestionAndAnswerPair = (runtime: HelpSystemCoreRuntime, question: string, answer: string): void => {
  runtime.printedQuestionAnswer = { question, answer };
  runtime.uiOperations.push(`HelpSystem_PrintQuestionAndAnswerPair:${question}:${answer}`);
};

const HelpSystem_InitListMenuController = (
  runtime: HelpSystemCoreRuntime,
  _helpListMenu: HelpSystemListMenu,
  itemsAbove: number,
  cursorPos: number
): void => {
  runtime.listMenuController = { itemsAbove, cursorPos };
};

const HelpSystem_SetInputDelay = (runtime: HelpSystemCoreRuntime, delay: number): void => {
  runtime.inputDelay = delay;
};

const HS_ShowOrHideMainWindowText = (runtime: HelpSystemCoreRuntime, visible: number): void => {
  runtime.mainWindowTextVisible = visible !== 0;
};

const HS_ShowOrHideControlsGuideInTopRight = (runtime: HelpSystemCoreRuntime, visible: number): void => {
  runtime.controlsGuideVisible = visible !== 0;
};

const HS_ShowOrHideToplevelTooltipWindow = (runtime: HelpSystemCoreRuntime, visible: number): void => {
  runtime.topLevelTooltipVisible = visible !== 0;
};

const HS_SetMainWindowBgBrightness = (runtime: HelpSystemCoreRuntime, brightness: number): void => {
  runtime.mainWindowBgBrightness = brightness;
};

const HS_ShowOrHideHeaderAndFooterLines_Darker = (runtime: HelpSystemCoreRuntime, visible: number): void => {
  runtime.headerFooterDarkerVisible = visible !== 0;
};

const HS_ShowOrHideHeaderAndFooterLines_Lighter = (runtime: HelpSystemCoreRuntime, visible: number): void => {
  runtime.headerFooterLighterVisible = visible !== 0;
};

const HS_ShowOrHideHeaderLine_Darker_FooterStyle = (runtime: HelpSystemCoreRuntime, visible: number): void => {
  runtime.headerLineDarkerFooterStyleVisible = visible !== 0;
};

const HS_ShowOrHideScrollArrows = (runtime: HelpSystemCoreRuntime, which: number, visible: number): void => {
  runtime.uiOperations.push(`HS_ShowOrHideScrollArrows:${which}:${visible}`);
};

const HS_UpdateMenuScrollArrows = (runtime: HelpSystemCoreRuntime): void => {
  runtime.uiOperations.push('HS_UpdateMenuScrollArrows');
};

export const PrintTextOnPanel2Row52RightAlign = (runtime: HelpSystemCoreRuntime, str: string): void => {
  HelpSystem_FillPanel2(runtime);
  HelpSystem_PrintTextRightAlign_Row52(runtime, str);
};

export const PrintWelcomeMessageOnPanel1 = (runtime: HelpSystemCoreRuntime): void => {
  HelpSystem_FillPanel1(runtime);
  runtime.panel1Text = 'Help_Text_Greetings';
  HelpSystem_PrintTextAt(runtime, 'Help_Text_Greetings', 0, 0);
};

export const ResetHelpSystemCursor = (helpListMenu: HelpSystemListMenu): void => {
  helpListMenu.itemsAbove = 0;
  helpListMenu.cursorPos = 0;
};

export const PrintHelpSystemTopicMouseoverDescription = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): void => {
  const index = listMenuItemsBuffer[helpListMenu.itemsAbove + helpListMenu.cursorPos].index;
  if (index === -2)
    HelpSystem_PrintTopicMouseoverDescription(runtime, sHelpSystemTopicMouseoverDescriptionPtrs[5]);
  else
    HelpSystem_PrintTopicMouseoverDescription(runtime, sHelpSystemTopicMouseoverDescriptionPtrs[index]);
  HS_ShowOrHideToplevelTooltipWindow(runtime, 1);
};

export const HelpSystem_PrintTopicLabel = (runtime: HelpSystemCoreRuntime): void => {
  HelpSystem_PrintTextAt(runtime, sHelpSystemTopicPtrs[runtime.gHelpSystemState.topic], 0, 0);
};

export const BuildAndPrintMainTopicsListMenu = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): void => {
  ResetHelpSystemListMenu(helpListMenu, listMenuItemsBuffer);
  BuildMainTopicsListAndMoveToH00(runtime, helpListMenu, listMenuItemsBuffer);
  PrintTextOnPanel2Row52RightAlign(runtime, 'gText_HelpSystemControls_PickOkEnd');
  HelpSystem_InitListMenuController(runtime, helpListMenu, 0, runtime.gHelpSystemState.scrollMain);
  PrintHelpSystemTopicMouseoverDescription(runtime, helpListMenu, listMenuItemsBuffer);
  HS_ShowOrHideMainWindowText(runtime, 1);
  HS_ShowOrHideControlsGuideInTopRight(runtime, 1);
};

export const BuildAndPrintSubmenuList = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): void => {
  HS_SetMainWindowBgBrightness(runtime, 0);
  HS_ShowOrHideHeaderLine_Darker_FooterStyle(runtime, 0);
  HS_ShowOrHideHeaderAndFooterLines_Lighter(runtime, 1);
  ResetHelpSystemListMenu(helpListMenu, listMenuItemsBuffer);
  SetHelpSystemSubmenuItems(runtime, helpListMenu, listMenuItemsBuffer);
  PrintTextOnPanel2Row52RightAlign(runtime, 'gText_HelpSystemControls_PickOkCancel');
  HelpSystem_InitListMenuController(runtime, helpListMenu, helpListMenu.itemsAbove, helpListMenu.cursorPos);
  HelpSystem_PrintTextAt(runtime, sHelpSystemTopicPtrs[runtime.gHelpSystemState.topic], 0, 0);
  HS_ShowOrHideMainWindowText(runtime, 1);
  HS_ShowOrHideControlsGuideInTopRight(runtime, 1);
};

export const HasGottenAtLeastOneHM = (runtime: HelpSystemCoreRuntime): boolean => {
  if (runtime.flags.has(FLAG_GOT_HM01) === true) {
    return true;
  }
  if (runtime.flags.has(FLAG_GOT_HM02) === true) {
    return true;
  }
  if (runtime.flags.has(FLAG_GOT_HM03) === true) {
    return true;
  }
  if (runtime.flags.has(FLAG_GOT_HM04) === true) {
    return true;
  }
  if (runtime.flags.has(FLAG_GOT_HM05) === true) {
    return true;
  }
  if (runtime.flags.has(FLAG_GOT_HM06) === true) {
    return true;
  }
  if (runtime.flags.has(FLAG_HIDE_FOUR_ISLAND_ICEFALL_CAVE_1F_HM07) === true) {
    return true;
  }
  return false;
};

export const HelpSystemSubroutine_PrintWelcomeMessage = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  _listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  PrintTextOnPanel2Row52RightAlign(runtime, 'gText_HelpSystemControls_A_Next');
  PrintWelcomeMessageOnPanel1(runtime);
  HS_ShowOrHideMainWindowText(runtime, 1);
  HS_ShowOrHideControlsGuideInTopRight(runtime, 1);
  helpListMenu.state = 9;
  return true;
};

export const HelpSystemSubroutine_WelcomeWaitButton = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  _listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  if ((runtime.helpSystemMenuInput & A_BUTTON) !== 0) {
    PlaySE(runtime, SE_SELECT);
    helpListMenu.state = 10;
  }
  return true;
};

export const HelpSystemSubroutine_WelcomeEndGotoMenu = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  runtime.gHelpSystemState.scrollMain = 0;
  ResetHelpSystemCursor(helpListMenu);
  BuildAndPrintMainTopicsListMenu(runtime, helpListMenu, listMenuItemsBuffer);
  helpListMenu.state = 0;
  return true;
};

export const HelpSystemSubroutine_MenuInputHandlerMain = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  const input = HelpSystem_GetMenuInput(runtime);
  switch (input) {
    case -6:
    case -2:
      return false;
    case -5:
    case -4:
      PrintHelpSystemTopicMouseoverDescription(runtime, helpListMenu, listMenuItemsBuffer);
      break;
    case -3:
    case -1:
      break;
    default:
      runtime.gHelpSystemState.topic = input;
      helpListMenu.state = 1;
      break;
  }
  return true;
};

export const HelpMenuSubroutine_InitSubmenu = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  runtime.gHelpSystemState.level = 1;
  runtime.gHelpSystemState.scrollMain = helpListMenu.cursorPos;
  ResetHelpSystemCursor(helpListMenu);
  BuildAndPrintSubmenuList(runtime, helpListMenu, listMenuItemsBuffer);
  HS_UpdateMenuScrollArrows(runtime);
  HelpSystem_SetInputDelay(runtime, 2);
  helpListMenu.state = 3;
  return true;
};

export const HelpMenuSubroutine_ReturnFromSubmenu = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  HS_ShowOrHideScrollArrows(runtime, 0, 0);
  HS_ShowOrHideScrollArrows(runtime, 1, 0);
  runtime.gHelpSystemState.level = 0;
  BuildAndPrintMainTopicsListMenu(runtime, helpListMenu, listMenuItemsBuffer);
  helpListMenu.state = 0;
  return true;
};

export const HelpMenuSubroutine_SubmenuInputHandler = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  _listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  const input = HelpSystem_GetMenuInput(runtime);
  switch (input) {
    case -6:
      return false;
    case -2:
      helpListMenu.state = 2;
      break;
    case -5:
    case -4:
    case -3:
    case -1:
      break;
    default:
      runtime.gHelpSystemState.scrollSub = input;
      helpListMenu.state = 4;
      break;
  }
  return true;
};

export const HelpMenuSubroutine_HelpItemPrint = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  _listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  runtime.gHelpSystemState.level = 2;
  HS_ShowOrHideMainWindowText(runtime, 0);
  HelpSystem_FillPanel1(runtime);
  PrintTextOnPanel2Row52RightAlign(runtime, 'gText_HelpSystemControls_AorBtoCancel');
  HS_SetMainWindowBgBrightness(runtime, 1);
  HS_ShowOrHideHeaderAndFooterLines_Darker(runtime, 1);

  if (runtime.gHelpSystemState.topic === TOPIC_WHAT_TO_DO)
    HelpSystem_PrintQuestionAndAnswerPair(runtime, sHelpSystemSpecializedQuestionTextPtrs[runtime.gHelpSystemState.scrollSub], sHelpSystemSpecializedAnswerTextPtrs[runtime.gHelpSystemState.scrollSub]);
  else if (runtime.gHelpSystemState.topic === TOPIC_HOW_TO_DO)
    HelpSystem_PrintQuestionAndAnswerPair(runtime, sHelpSystemMenuTopicTextPtrs[runtime.gHelpSystemState.scrollSub], sHelpSystemHowToUseMenuTextPtrs[runtime.gHelpSystemState.scrollSub]);
  else if (runtime.gHelpSystemState.topic === TOPIC_TERMS)
    HelpSystem_PrintQuestionAndAnswerPair(runtime, sHelpSystemTermTextPtrs[runtime.gHelpSystemState.scrollSub], sHelpSystemTermDefinitionsTextPtrs[runtime.gHelpSystemState.scrollSub]);
  else if (runtime.gHelpSystemState.topic === TOPIC_ABOUT_GAME)
    HelpSystem_PrintQuestionAndAnswerPair(runtime, sHelpSystemGeneralTopicTextPtrs[runtime.gHelpSystemState.scrollSub], sHelpSystemGeneralTopicDescriptionTextPtrs[runtime.gHelpSystemState.scrollSub]);
  else
    HelpSystem_PrintQuestionAndAnswerPair(runtime, sHelpSystemTypeMatchupTextPtrs[runtime.gHelpSystemState.scrollSub], sHelpSystemTypeMatchupDescriptionTextPtrs[runtime.gHelpSystemState.scrollSub]);
  HS_ShowOrHideMainWindowText(runtime, 1);
  HS_ShowOrHideControlsGuideInTopRight(runtime, 1);
  helpListMenu.state = 6;
  return true;
};

export const HelpMenuSubroutine_ReturnFromHelpItem = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  runtime.gHelpSystemState.level = 1;
  BuildAndPrintSubmenuList(runtime, helpListMenu, listMenuItemsBuffer);
  HS_UpdateMenuScrollArrows(runtime);
  HelpSystem_SetInputDelay(runtime, 2);
  helpListMenu.state = 3;
  return true;
};

export const HelpMenuSubroutine_HelpItemWaitButton = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  _listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  if ((runtime.helpSystemMenuInput & (B_BUTTON | A_BUTTON)) !== 0) {
    PlaySE(runtime, SE_SELECT);
    helpListMenu.state = 5;
    return true;
  }
  if ((runtime.helpSystemMenuInput & (L_BUTTON | R_BUTTON)) !== 0)
    return false;
  return true;
};

export const RunHelpMenuSubroutine = (
  runtime: HelpSystemCoreRuntime,
  helpListMenu: HelpSystemListMenu,
  listMenuItemsBuffer: ListMenuItem[]
): boolean => {
  switch (helpListMenu.state) {
    case 8:
      return HelpSystemSubroutine_PrintWelcomeMessage(runtime, helpListMenu, listMenuItemsBuffer);
    case 9:
      return HelpSystemSubroutine_WelcomeWaitButton(runtime, helpListMenu, listMenuItemsBuffer);
    case 10:
      return HelpSystemSubroutine_WelcomeEndGotoMenu(runtime, helpListMenu, listMenuItemsBuffer);
    case 0:
      return HelpSystemSubroutine_MenuInputHandlerMain(runtime, helpListMenu, listMenuItemsBuffer);
    case 1:
      return HelpMenuSubroutine_InitSubmenu(runtime, helpListMenu, listMenuItemsBuffer);
    case 2:
      return HelpMenuSubroutine_ReturnFromSubmenu(runtime, helpListMenu, listMenuItemsBuffer);
    case 3:
      return HelpMenuSubroutine_SubmenuInputHandler(runtime, helpListMenu, listMenuItemsBuffer);
    case 4:
      return HelpMenuSubroutine_HelpItemPrint(runtime, helpListMenu, listMenuItemsBuffer);
    case 5:
      return HelpMenuSubroutine_ReturnFromHelpItem(runtime, helpListMenu, listMenuItemsBuffer);
    case 6:
      return HelpMenuSubroutine_HelpItemWaitButton(runtime, helpListMenu, listMenuItemsBuffer);
  }
  return false;
};

export const GetHelpSystemMenuLevel = (runtime: HelpSystemCoreRuntime): number =>
  runtime.gHelpSystemState.level;
