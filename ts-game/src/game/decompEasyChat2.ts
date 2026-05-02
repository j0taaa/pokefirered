import easyChatConstantsSource from '../../../include/constants/easy_chat.h?raw';
import {
  EC_WORD_UNDEFINED,
  GetDisplayedWordByIndex,
  GetNumDisplayableGroups,
  GetNumDisplayedWords,
  GetSelectedGroupByIndex,
  GetUnlockedECWords,
  InitEasyChatSelection,
  DestroyEasyChatSelectionData,
  createEasyChatRuntime,
  type EasyChatRuntime as EasyChatCoreRuntime
} from './decompEasyChat';
import { MENU_B_PRESSED } from './decompMenu';

export { EC_WORD_UNDEFINED } from './decompEasyChat';
export { MENU_B_PRESSED } from './decompMenu';

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const START_BUTTON = 1 << 3;
export const DPAD_RIGHT = 1 << 4;
export const DPAD_LEFT = 1 << 5;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;

export const EASY_CHAT_TYPE_PROFILE = 0;
export const EASY_CHAT_TYPE_BATTLE_START = 1;
export const EASY_CHAT_TYPE_BATTLE_WON = 2;
export const EASY_CHAT_TYPE_BATTLE_LOST = 3;
export const EASY_CHAT_TYPE_MAIL = 4;
export const EASY_CHAT_TYPE_MAIL_NO_CONFIRM = 5;
export const EASY_CHAT_TYPE_BARD_SONG = 6;
export const EASY_CHAT_TYPE_INTERVIEW = 7;
export const EASY_CHAT_TYPE_TRENDY_PHRASE = 9;
export const EASY_CHAT_TYPE_QUESTIONNAIRE = 14;

export const FLAG_SYS_SET_TRAINER_CARD_PROFILE = 0x926;
export const SE_SELECT = 5;

export const EZCHAT_TASK_STATE = 0;
export const EZCHAT_TASK_TYPE = 1;
export const EZCHAT_TASK_WORDS = 2;
export const EZCHAT_TASK_MAINCALLBACK = 4;
export const EZCHAT_TASK_UNK06 = 6;
export const EZCHAT_TASK_SIZE = 7;

export const EC_ACTION_NONE = 0;
export const EC_ACTION_DELETE_WORD = 1;
export const EC_ACTION_MOVE_FIELD_CURSOR = 2;
export const EC_ACTION_MOVE_TO_FOOTER = 3;
export const EC_ACTION_CREATE_DEL_ALL_YES_NO = 4;
export const EC_ACTION_CREATE_CANCEL_YES_NO = 5;
export const EC_ACTION_CREATE_CONFIRM_YES_NO = 6;
export const EC_ACTION_CLOSE_YES_NO = 7;
export const EC_ACTION_DELETE_ALL = 8;
export const EC_ACTION_OPEN_GROUP_SELECT = 9;
export const EC_ACTION_BACK_TO_FIELD = 10;
export const EC_ACTION_OPEN_WORD_SELECT = 11;
export const EC_ACTION_PLACE_WORD = 12;
export const EC_ACTION_BACK_TO_GROUP = 13;
export const EC_ACTION_MOVE_GROUP_CURSOR = 14;
export const EC_ACTION_SCROLL_GROUP_DOWN = 15;
export const EC_ACTION_SCROLL_GROUP_UP = 16;
export const EC_ACTION_MOVE_WORD_CURSOR = 17;
export const EC_ACTION_SCROLL_WORD_UP = 18;
export const EC_ACTION_SCROLL_WORD_DOWN = 19;
export const EC_ACTION_WORD_PAGE_UP = 20;
export const EC_ACTION_WORD_PAGE_DOWN = 21;
export const EC_ACTION_TOGGLE_ALPHA = 22;
export const EC_ACTION_FINISH = 23;

type MainCallback = string;
type TaskFuncName = 'Task_InitEasyChat' | 'Task_RunEasyChat';

export interface EasyChatScreenTemplate {
  type: number;
  numColumns: number;
  numRows: number;
  frameId: number;
  titleText: string | null;
  instructionsText1: string | null;
  instructionsText2: string | null;
  confirmText1: string | null;
  confirmText2: string | null;
}

export interface EasyChatScreen {
  type: number;
  templateId: number;
  numColumns: number;
  numRows: number;
  state: number;
  mainCursorColumn: number;
  mainCursorRow: number;
  numWords: number;
  stateBackup: number;
  isAlphaMode: boolean;
  selectGroupCursorX: number;
  selectGroupCursorY: number;
  selectGroupRowsAbove: number;
  selectGroupNumRows: number;
  selectWordRowsAbove: number;
  selectWordNumRows: number;
  selectWordCursorX: number;
  selectWordCursorY: number;
  words: number[];
  ecWordBuffer: number[];
}

export interface EasyChatTask {
  func: TaskFuncName;
  data: Array<number | number[] | MainCallback>;
}

export interface EasyChat2Runtime {
  sEasyChatScreen: EasyChatScreen | null;
  easyChatCore: EasyChatCoreRuntime;
  gTasks: EasyChatTask[];
  mainCallback2: MainCallback | null;
  vblankCallback: MainCallback | null;
  gPaletteFade: { active: boolean };
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_Result: number;
  gSaveBlock1Ptr: {
    easyChatProfile: number[];
    easyChatBattleStart: number[];
    easyChatBattleWon: number[];
    easyChatBattleLost: number[];
    questionnaireWords: number[];
    mail: Array<{ words: number[] }>;
  };
  flags: Set<number>;
  newKeys: number;
  repeatedKeys: number;
  menuInputResults: number[];
  initEasyChatSelectionResult: boolean;
  initEasyChatGraphicsWorkResult: boolean;
  loadEasyChatGraphicsResults: boolean[];
  interfaceCommandRunResults: boolean[];
  linkStateCBActive: boolean;
  allocationFails: boolean;
  operations: string[];
  playedSE: number[];
  interfaceCommands: number[];
}

const parseDefineValues = (source: string): Map<string, number> => {
  const values = new Map<string, number>();
  for (const match of source.matchAll(/^#define\s+(\w+)\s+(.+)$/gmu)) {
    const name = match[1];
    let expr = match[2].replace(/\/\/.*$/u, '').trim();
    expr = expr.replace(/\((EC_GROUP_\w+)\s*<<\s*9\)/gu, (_, group: string) => String((values.get(group) ?? 0) << 9));
    expr = expr.replace(/\((0x[0-9a-fA-F]+|\d+)\s*<<\s*(\d+)\)/gu, (_, left: string, right: string) =>
      String(Number(left) << Number(right))
    );
    const parts = expr.split('|').map((part) => Number(part.trim().replace(/[()]/gu, '')));
    if (parts.length > 0 && parts.every(Number.isFinite)) values.set(name, parts.reduce((acc, part) => acc | part, 0));
  }
  return values;
};

const ecConstants = parseDefineValues(easyChatConstantsSource);
export const EC_WORD_MYSTERY = ecConstants.get('EC_WORD_MYSTERY') ?? 0;
export const EC_WORD_EVENT = ecConstants.get('EC_WORD_EVENT') ?? 0;
export const EC_WORD_IS = ecConstants.get('EC_WORD_IS') ?? 0;
export const EC_WORD_EXCITING = ecConstants.get('EC_WORD_EXCITING') ?? 0;
export const EC_WORD_LINK = ecConstants.get('EC_WORD_LINK') ?? 0;
export const EC_WORD_TOGETHER = ecConstants.get('EC_WORD_TOGETHER') ?? 0;
export const EC_WORD_WITH = ecConstants.get('EC_WORD_WITH') ?? 0;
export const EC_WORD_ALL = ecConstants.get('EC_WORD_ALL') ?? 0;

export const sECPhrase_MysteryEventIsExciting = [EC_WORD_MYSTERY, EC_WORD_EVENT, EC_WORD_IS, EC_WORD_EXCITING];
export const sECPhrase_LinkTogetherWithAll = [EC_WORD_LINK, EC_WORD_TOGETHER, EC_WORD_WITH, EC_WORD_ALL];

export const sEasyChatScreenTemplates: EasyChatScreenTemplate[] = [
  {
    type: EASY_CHAT_TYPE_PROFILE,
    numColumns: 2,
    numRows: 2,
    frameId: 0,
    titleText: 'gText_Profile',
    instructionsText1: 'gText_CombineFourWordsOrPhrases',
    instructionsText2: 'gText_AndMakeYourProfile',
    confirmText1: 'gText_YourProfile',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_BATTLE_START,
    numColumns: 2,
    numRows: 3,
    frameId: 1,
    titleText: 'gText_AtTheBattlesStart',
    instructionsText1: 'gText_MakeMessageSixPhrases',
    instructionsText2: 'gText_MaxTwoTwelveLetterPhrases',
    confirmText1: 'gText_YourFeelingAtTheBattlesStart',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_BATTLE_WON,
    numColumns: 2,
    numRows: 3,
    frameId: 1,
    titleText: 'gText_UponWinningABattle',
    instructionsText1: 'gText_MakeMessageSixPhrases',
    instructionsText2: 'gText_MaxTwoTwelveLetterPhrases',
    confirmText1: 'gText_WhatYouSayIfYouWin',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_BATTLE_LOST,
    numColumns: 2,
    numRows: 3,
    frameId: 1,
    titleText: 'gText_UponLosingABattle',
    instructionsText1: 'gText_MakeMessageSixPhrases',
    instructionsText2: 'gText_MaxTwoTwelveLetterPhrases',
    confirmText1: 'gText_WhatYouSayIfYouLose',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_MAIL,
    numColumns: 2,
    numRows: 5,
    frameId: 2,
    titleText: null,
    instructionsText1: 'gText_CombineNineWordsOrPhrases',
    instructionsText2: 'gText_AndMakeAMessage',
    confirmText1: 'gText_TheMailMessage',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_MAIL_NO_CONFIRM,
    numColumns: 2,
    numRows: 2,
    frameId: 0,
    titleText: null,
    instructionsText1: 'gText_CombineNineWordsOrPhrases',
    instructionsText2: 'gText_AndMakeAMessage',
    confirmText1: null,
    confirmText2: null
  },
  {
    type: EASY_CHAT_TYPE_BARD_SONG,
    numColumns: 2,
    numRows: 3,
    frameId: 1,
    titleText: 'gText_TheBardsSong',
    instructionsText1: 'gText_ChangeJustOneWordOrPhrase',
    instructionsText2: 'gText_AndImproveTheBardsSong',
    confirmText1: 'gText_TheNewSong',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_INTERVIEW,
    numColumns: 2,
    numRows: 3,
    frameId: 1,
    titleText: 'gText_Interview',
    instructionsText1: 'gText_FindWordsThatDescribeYour',
    instructionsText2: 'gText_FeelingsRightNow',
    confirmText1: 'gText_TheAnswer',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_TRENDY_PHRASE,
    numColumns: 2,
    numRows: 1,
    frameId: 3,
    titleText: 'gText_WhatsHipAndHappening',
    instructionsText1: 'gText_CombineTwoWordsOrPhrases',
    instructionsText2: 'gText_AndMakeATrendySaying',
    confirmText1: 'gText_TheTrendySaying',
    confirmText2: 'gText_IsAsShownOkay'
  },
  {
    type: EASY_CHAT_TYPE_QUESTIONNAIRE,
    numColumns: 2,
    numRows: 2,
    frameId: 0,
    titleText: 'gText_Questionnaire',
    instructionsText1: 'gText_CombineFourWordsOrPhrases',
    instructionsText2: 'gText_AndFillOutTheQuestionnaire',
    confirmText1: 'gText_TheAnswer',
    confirmText2: 'gText_IsAsShownOkay'
  }
];

export const createEasyChat2Runtime = (overrides: Partial<EasyChat2Runtime> = {}): EasyChat2Runtime => {
  const easyChatCore = overrides.easyChatCore ?? createEasyChatRuntime();
  const gSaveBlock1Ptr = overrides.gSaveBlock1Ptr ?? easyChatCore.gSaveBlock1Ptr;
  return {
    sEasyChatScreen: null,
    easyChatCore,
    gTasks: [],
    mainCallback2: null,
    vblankCallback: null,
    gPaletteFade: { active: false },
    gSpecialVar_0x8004: 0,
    gSpecialVar_0x8005: 0,
    gSpecialVar_Result: 0,
    gSaveBlock1Ptr,
    flags: new Set<number>(),
    newKeys: 0,
    repeatedKeys: 0,
    menuInputResults: [],
    initEasyChatSelectionResult: true,
    initEasyChatGraphicsWorkResult: true,
    loadEasyChatGraphicsResults: [],
    interfaceCommandRunResults: [],
    linkStateCBActive: false,
    allocationFails: false,
    operations: [],
    playedSE: [],
    interfaceCommands: [],
    ...overrides
  };
};

const screen = (runtime: EasyChat2Runtime): EasyChatScreen => {
  if (!runtime.sEasyChatScreen) throw new Error('sEasyChatScreen is NULL');
  return runtime.sEasyChatScreen;
};

const joyNew = (runtime: EasyChat2Runtime, key: number): boolean => (runtime.newKeys & key) !== 0;
const joyRept = (runtime: EasyChat2Runtime, key: number): boolean => (runtime.repeatedKeys & key) !== 0;
const menuProcessInputNoWrapClearOnChoose = (runtime: EasyChat2Runtime): number =>
  runtime.menuInputResults.length > 0 ? runtime.menuInputResults.shift()! : -2;

const ResetTasks = (runtime: EasyChat2Runtime): void => {
  runtime.gTasks = [];
  runtime.operations.push('ResetTasks');
};
const CreateTask = (runtime: EasyChat2Runtime, func: TaskFuncName): number => {
  runtime.gTasks.push({ func, data: Array.from({ length: EZCHAT_TASK_SIZE }, () => 0) });
  return runtime.gTasks.length - 1;
};
const SetMainCallback2 = (runtime: EasyChat2Runtime, callback: MainCallback): void => {
  runtime.mainCallback2 = callback;
};
const SetVBlankCallback = (runtime: EasyChat2Runtime, callback: MainCallback | null): void => {
  runtime.vblankCallback = callback;
};
export const SetEasyChatTaskFunc = (runtime: EasyChat2Runtime, taskId: number, func: TaskFuncName): void => {
  runtime.gTasks[taskId].func = func;
  runtime.gTasks[taskId].data[EZCHAT_TASK_STATE] = 0;
};
const IsUpdateLinkStateCBActive = (runtime: EasyChat2Runtime): boolean => runtime.linkStateCBActive;
const InitEasyChatGraphicsWork = (runtime: EasyChat2Runtime): boolean => {
  runtime.operations.push('InitEasyChatGraphicsWork');
  return runtime.initEasyChatGraphicsWorkResult;
};
const LoadEasyChatGraphics = (runtime: EasyChat2Runtime): boolean => {
  runtime.operations.push('LoadEasyChatGraphics');
  return runtime.loadEasyChatGraphicsResults.length > 0 ? runtime.loadEasyChatGraphicsResults.shift()! : false;
};
const DestroyEasyChatGraphicsResources = (runtime: EasyChat2Runtime): void => {
  runtime.operations.push('DestroyEasyChatGraphicsResources');
};
const FreeAllWindowBuffers = (runtime: EasyChat2Runtime): void => {
  runtime.operations.push('FreeAllWindowBuffers');
};
const PlaySE = (runtime: EasyChat2Runtime, song: number): void => {
  runtime.playedSE.push(song);
};
const EasyChatInterfaceCommand_Setup = (runtime: EasyChat2Runtime, action: number): void => {
  runtime.interfaceCommands.push(action);
};
const EasyChatInterfaceCommand_Run = (runtime: EasyChat2Runtime): boolean =>
  runtime.interfaceCommandRunResults.length > 0 ? runtime.interfaceCommandRunResults.shift()! : false;
const FlagSet = (runtime: EasyChat2Runtime, flag: number): void => {
  runtime.flags.add(flag);
};

export const DoEasyChatScreen = (runtime: EasyChat2Runtime, type: number, words: number[], callback: MainCallback): void => {
  ResetTasks(runtime);
  const taskId = CreateTask(runtime, 'Task_InitEasyChat');
  runtime.gTasks[taskId].data[EZCHAT_TASK_TYPE] = type;
  runtime.gTasks[taskId].data[EZCHAT_TASK_WORDS] = words;
  runtime.gTasks[taskId].data[EZCHAT_TASK_MAINCALLBACK] = callback;
  SetMainCallback2(runtime, 'CB2_EasyChatScreen');
};

export const CB2_EasyChatScreen = (runtime: EasyChat2Runtime): void => {
  RunTasks(runtime);
  runtime.operations.push('AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade');
};

export const VBlankCallback_EasyChatScreen = (runtime: EasyChat2Runtime): void => {
  runtime.operations.push('TransferPlttBuffer', 'LoadOam', 'ProcessSpriteCopyRequests');
};

export const RunTasks = (runtime: EasyChat2Runtime): void => {
  const taskCount = runtime.gTasks.length;
  for (let taskId = 0; taskId < taskCount; taskId++) {
    const func = runtime.gTasks[taskId].func;
    if (func === 'Task_InitEasyChat') Task_InitEasyChat(runtime, taskId);
    else Task_RunEasyChat(runtime, taskId);
  }
};

export const Task_InitEasyChat = (runtime: EasyChat2Runtime, taskId: number): void => {
  if (!IsUpdateLinkStateCBActive(runtime)) {
    while (Task_InitEasyChatInternal(runtime, taskId)) {
      // The C code intentionally drains all initialization states when not linked.
    }
  } else if (Task_InitEasyChatInternal(runtime, taskId)) {
    return;
  }
  SetEasyChatTaskFunc(runtime, taskId, 'Task_RunEasyChat');
};

export const Task_RunEasyChat = (runtime: EasyChat2Runtime, taskId: number): void => {
  const task = runtime.gTasks[taskId];
  const data = task.data;
  switch (data[EZCHAT_TASK_STATE] as number) {
    case 0:
      SetVBlankCallback(runtime, 'VBlankCallback_EasyChatScreen');
      runtime.operations.push('BlendPalettes', 'BeginNormalPaletteFadeIn');
      data[EZCHAT_TASK_STATE] = (data[EZCHAT_TASK_STATE] as number) + 1;
      break;
    case 1: {
      const action = EasyChatScreen_HandleJoypad(runtime);
      if (action === EC_ACTION_FINISH) {
        runtime.operations.push('BeginNormalPaletteFadeOut');
        data[EZCHAT_TASK_STATE] = 3;
      } else if (action !== EC_ACTION_NONE) {
        PlaySE(runtime, SE_SELECT);
        EasyChatInterfaceCommand_Setup(runtime, action);
        data[EZCHAT_TASK_STATE] = (data[EZCHAT_TASK_STATE] as number) + 1;
      }
      break;
    }
    case 2:
      if (!EasyChatInterfaceCommand_Run(runtime)) data[EZCHAT_TASK_STATE] = 1;
      break;
    case 3:
      if (!runtime.gPaletteFade.active) {
        if (data[EZCHAT_TASK_TYPE] === EASY_CHAT_TYPE_QUESTIONNAIRE) CompareQuestionnaireResponseWithPassphrase(runtime);
        if (data[EZCHAT_TASK_TYPE] === EASY_CHAT_TYPE_PROFILE) {
          FlagSet(runtime, FLAG_SYS_SET_TRAINER_CARD_PROFILE);
          CompareProfileResponseWithPassphrase(runtime);
        }
        DismantleEasyChat(runtime, data[EZCHAT_TASK_MAINCALLBACK] as MainCallback);
      }
      break;
  }
};

export const Task_InitEasyChatInternal = (runtime: EasyChat2Runtime, taskId: number): boolean => {
  const data = runtime.gTasks[taskId].data;
  switch (data[EZCHAT_TASK_STATE] as number) {
    case 0:
      SetVBlankCallback(runtime, null);
      runtime.operations.push('ResetSpriteData', 'FreeAllSpritePalettes', 'ResetPaletteFade');
      break;
    case 1:
      runtime.operations.push('InitEasyChatSelection');
      if (!runtime.initEasyChatSelectionResult || !InitEasyChatSelection(runtime.easyChatCore)) {
        DismantleEasyChat(runtime, data[EZCHAT_TASK_MAINCALLBACK] as MainCallback);
      }
      break;
    case 2:
      if (!EasyChat_AllocateResources(runtime, data[EZCHAT_TASK_TYPE] as number, data[EZCHAT_TASK_WORDS] as number[])) {
        DismantleEasyChat(runtime, data[EZCHAT_TASK_MAINCALLBACK] as MainCallback);
      }
      break;
    case 3:
      if (!InitEasyChatGraphicsWork(runtime)) DismantleEasyChat(runtime, data[EZCHAT_TASK_MAINCALLBACK] as MainCallback);
      break;
    case 4:
      if (LoadEasyChatGraphics(runtime)) return true;
      break;
    default:
      return false;
  }
  data[EZCHAT_TASK_STATE] = (data[EZCHAT_TASK_STATE] as number) + 1;
  return true;
};

export const DismantleEasyChat = (runtime: EasyChat2Runtime, callback: MainCallback): void => {
  DestroyEasyChatSelectionData(runtime.easyChatCore);
  EasyChat_FreeResources(runtime);
  DestroyEasyChatGraphicsResources(runtime);
  FreeAllWindowBuffers(runtime);
  SetMainCallback2(runtime, callback);
};

export const ShowEasyChatScreen = (runtime: EasyChat2Runtime): void => {
  let words: number[] | null = null;
  switch (runtime.gSpecialVar_0x8004) {
    case EASY_CHAT_TYPE_PROFILE:
      words = runtime.gSaveBlock1Ptr.easyChatProfile;
      break;
    case EASY_CHAT_TYPE_BATTLE_START:
      words = runtime.gSaveBlock1Ptr.easyChatBattleStart;
      break;
    case EASY_CHAT_TYPE_BATTLE_WON:
      words = runtime.gSaveBlock1Ptr.easyChatBattleWon;
      break;
    case EASY_CHAT_TYPE_BATTLE_LOST:
      words = runtime.gSaveBlock1Ptr.easyChatBattleLost;
      break;
    case EASY_CHAT_TYPE_QUESTIONNAIRE:
      words = runtime.gSaveBlock1Ptr.questionnaireWords;
      break;
    case EASY_CHAT_TYPE_MAIL:
      words = runtime.gSaveBlock1Ptr.mail[runtime.gSpecialVar_0x8005].words;
      break;
    default:
      return;
  }
  DoEasyChatScreen(runtime, runtime.gSpecialVar_0x8004, words, 'CB2_ReturnToFieldContinueScript');
};

export const CompareProfileResponseWithPassphrase = (runtime: EasyChat2Runtime): void => {
  runtime.gSpecialVar_0x8004 = IsPhraseDifferentThanPlayerInput(runtime, sECPhrase_MysteryEventIsExciting, sECPhrase_MysteryEventIsExciting.length);
};

export const CompareQuestionnaireResponseWithPassphrase = (runtime: EasyChat2Runtime): void => {
  runtime.gSpecialVar_0x8004 = IsPhraseDifferentThanPlayerInput(runtime, sECPhrase_LinkTogetherWithAll, sECPhrase_LinkTogetherWithAll.length);
};

export const EasyChat_AllocateResources = (runtime: EasyChat2Runtime, type: number, words: number[]): boolean => {
  if (runtime.allocationFails) return false;
  const templateId = GetEasyChatScreenTemplateId(type);
  const template = sEasyChatScreenTemplates[templateId];
  const numWords = Math.min(template.numColumns * template.numRows, 9);
  runtime.sEasyChatScreen = {
    type,
    words,
    state: 0,
    mainCursorColumn: 0,
    mainCursorRow: 0,
    isAlphaMode: false,
    templateId,
    numColumns: template.numColumns,
    numRows: template.numRows,
    numWords,
    stateBackup: 0,
    selectGroupCursorX: 0,
    selectGroupCursorY: 0,
    selectGroupRowsAbove: 0,
    selectGroupNumRows: Math.trunc((GetNumDisplayableGroups(runtime.easyChatCore) - 1) / 2) + 1,
    selectWordRowsAbove: 0,
    selectWordNumRows: 0,
    selectWordCursorX: 0,
    selectWordCursorY: 0,
    ecWordBuffer: words.slice(0, numWords)
  };
  return true;
};

export const EasyChat_FreeResources = (runtime: EasyChat2Runtime): void => {
  if (runtime.sEasyChatScreen !== null) runtime.sEasyChatScreen = null;
};

export const EasyChatScreen_HandleJoypad = (runtime: EasyChat2Runtime): number => {
  switch (screen(runtime).state) {
    case 0:
      return HandleJoypad_SelectField(runtime);
    case 1:
      return HandleJoypad_SelectFooter(runtime);
    case 2:
      return HandleJoypad_SelectGroup(runtime);
    case 3:
      return HandleJoypad_SelectWord(runtime);
    case 4:
      return Cancel_HandleYesNoMenu(runtime);
    case 5:
      return DelAll_HandleYesNoMenu(runtime);
    case 6:
      return Confirm_HandleYesNoMenu(runtime);
    default:
      return 0;
  }
};

export const HandleJoypad_SelectField = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  if (joyNew(runtime, A_BUTTON)) {
    s.state = 2;
    s.selectGroupCursorX = 0;
    s.selectGroupCursorY = 0;
    s.selectGroupRowsAbove = 0;
    return 9;
  }
  if (joyNew(runtime, B_BUTTON)) return Cancel_CreateYesNoMenu(runtime);
  if (joyNew(runtime, START_BUTTON)) return Confirm_CreateYesNoMenu(runtime);
  if (joyNew(runtime, DPAD_UP)) s.mainCursorRow--;
  else if (joyNew(runtime, DPAD_LEFT)) s.mainCursorColumn--;
  else if (joyNew(runtime, DPAD_DOWN)) s.mainCursorRow++;
  else if (joyNew(runtime, DPAD_RIGHT)) s.mainCursorColumn++;
  else return 0;

  const template = sEasyChatScreenTemplates[s.templateId];
  if (s.mainCursorRow < 0) s.mainCursorRow = template.numRows;
  if (s.mainCursorRow > template.numRows) s.mainCursorRow = 0;
  if (s.mainCursorRow === template.numRows) {
    if (s.mainCursorColumn > 2) s.mainCursorColumn = 2;
    s.state = 1;
    return 3;
  }
  if (s.mainCursorColumn < 0) s.mainCursorColumn = template.numColumns - 1;
  if (s.mainCursorColumn >= template.numColumns) s.mainCursorColumn = 0;
  if (GetEasyChatScreenFrameId(runtime) === 2 && s.mainCursorColumn === 1 && s.mainCursorRow === 4) s.mainCursorColumn = 0;
  return 2;
};

export const HandleJoypad_SelectFooter = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  if (joyNew(runtime, A_BUTTON)) {
    switch (s.mainCursorColumn) {
      case 0:
        return DelAll_CreateYesNoMenu(runtime);
      case 1:
        return Cancel_CreateYesNoMenu(runtime);
      case 2:
        return Confirm_CreateYesNoMenu(runtime);
    }
  }
  if (joyNew(runtime, B_BUTTON)) return Cancel_CreateYesNoMenu(runtime);
  if (joyNew(runtime, START_BUTTON)) return Confirm_CreateYesNoMenu(runtime);
  if (joyNew(runtime, DPAD_UP)) s.mainCursorRow--;
  else if (joyNew(runtime, DPAD_LEFT)) s.mainCursorColumn--;
  else if (joyNew(runtime, DPAD_DOWN)) s.mainCursorRow = 0;
  else if (joyNew(runtime, DPAD_RIGHT)) s.mainCursorColumn++;
  else return 0;

  const template = sEasyChatScreenTemplates[s.templateId];
  if (s.mainCursorRow === template.numRows) {
    if (s.mainCursorColumn < 0) s.mainCursorColumn = 2;
    if (s.mainCursorColumn >= 3) s.mainCursorColumn = 0;
    return 3;
  }
  if (s.mainCursorColumn >= template.numColumns) s.mainCursorColumn = template.numColumns - 1;
  if (GetEasyChatScreenFrameId(runtime) === 2 && s.mainCursorColumn === 1 && s.mainCursorRow === 4) s.mainCursorColumn = 0;
  s.state = 0;
  return 2;
};

export const HandleJoypad_SelectGroup = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  if (joyNew(runtime, B_BUTTON)) return BackOutFromGroupToFieldSelect(runtime);
  if (joyNew(runtime, A_BUTTON)) {
    if (s.selectGroupCursorX !== -1) return OpenSelectedGroup(runtime);
    switch (s.selectGroupCursorY) {
      case 0:
        return ToggleGroupAlphaMode(runtime);
      case 1:
        return DeleteSelectedWord(runtime);
      case 2:
        return BackOutFromGroupToFieldSelect(runtime);
    }
  }
  if (joyNew(runtime, SELECT_BUTTON)) return ToggleGroupAlphaMode(runtime);
  if (joyRept(runtime, DPAD_UP)) return SelectGroupCursorAction(runtime, 2);
  if (joyRept(runtime, DPAD_DOWN)) return SelectGroupCursorAction(runtime, 3);
  if (joyRept(runtime, DPAD_LEFT)) return SelectGroupCursorAction(runtime, 1);
  if (joyRept(runtime, DPAD_RIGHT)) return SelectGroupCursorAction(runtime, 0);
  return 0;
};

export const HandleJoypad_SelectWord = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  if (joyNew(runtime, B_BUTTON)) {
    s.state = 2;
    return 13;
  }
  if (joyNew(runtime, A_BUTTON)) return PlaceSelectedWord(runtime);
  if (joyNew(runtime, START_BUTTON)) return SelectWordCursorAction(runtime, 4);
  if (joyNew(runtime, SELECT_BUTTON)) return SelectWordCursorAction(runtime, 5);
  if (joyRept(runtime, DPAD_UP)) return SelectWordCursorAction(runtime, 2);
  if (joyRept(runtime, DPAD_DOWN)) return SelectWordCursorAction(runtime, 3);
  if (joyRept(runtime, DPAD_LEFT)) return SelectWordCursorAction(runtime, 1);
  if (joyRept(runtime, DPAD_RIGHT)) return SelectWordCursorAction(runtime, 0);
  return 0;
};

export const Cancel_HandleYesNoMenu = (runtime: EasyChat2Runtime): number => {
  const input = menuProcessInputNoWrapClearOnChoose(runtime);
  switch (input) {
    case MENU_B_PRESSED:
    case 1:
      screen(runtime).state = GetStateBackup(runtime);
      return 7;
    case 0:
      runtime.gSpecialVar_Result = 0;
      return 23;
    default:
      return 0;
  }
};

export const Confirm_HandleYesNoMenu = (runtime: EasyChat2Runtime): number => {
  const input = menuProcessInputNoWrapClearOnChoose(runtime);
  switch (input) {
    case MENU_B_PRESSED:
    case 1:
      screen(runtime).state = GetStateBackup(runtime);
      return 7;
    case 0:
      runtime.gSpecialVar_Result = HasECMessageChanged(runtime) ? 1 : 0;
      CommitECWords(runtime);
      return 23;
    default:
      return 0;
  }
};

export const DelAll_HandleYesNoMenu = (runtime: EasyChat2Runtime): number => {
  const input = menuProcessInputNoWrapClearOnChoose(runtime);
  switch (input) {
    case MENU_B_PRESSED:
    case 1:
      screen(runtime).state = 1;
      return 7;
    case 0:
      DeleteAllECFields(runtime);
      screen(runtime).state = 1;
      return 8;
    default:
      return 0;
  }
};

export const Cancel_CreateYesNoMenu = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  s.stateBackup = s.state;
  s.state = 4;
  return 5;
};

export const DelAll_CreateYesNoMenu = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  s.stateBackup = s.state;
  s.state = 5;
  return 4;
};

export const Confirm_CreateYesNoMenu = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  s.stateBackup = s.state;
  if (IsEcWordBufferUninitialized(runtime)) {
    s.state = 4;
    return 5;
  }
  s.state = 6;
  return 6;
};

export const GetStateBackup = (runtime: EasyChat2Runtime): number => screen(runtime).stateBackup;

export const OpenSelectedGroup = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  if (!s.isAlphaMode) {
    const groupId = GetSelectedGroupByIndex(runtime.easyChatCore, GetSelectedGroupIndex(runtime));
    GetUnlockedECWords(runtime.easyChatCore, false, groupId);
  } else {
    GetUnlockedECWords(runtime.easyChatCore, true, GetSelectedLetter(runtime));
  }
  const numDisplayedWords = GetNumDisplayedWords(runtime.easyChatCore);
  if (numDisplayedWords === 0) return 0;
  s.selectWordNumRows = Math.trunc((numDisplayedWords - 1) / 2);
  s.selectWordRowsAbove = 0;
  s.selectWordCursorX = 0;
  s.selectWordCursorY = 0;
  s.state = 3;
  return 11;
};

export const BackOutFromGroupToFieldSelect = (runtime: EasyChat2Runtime): number => {
  screen(runtime).state = 0;
  return 10;
};

export const ToggleGroupAlphaMode = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  s.selectGroupCursorX = 0;
  s.selectGroupCursorY = 0;
  s.selectGroupRowsAbove = 0;
  s.isAlphaMode = !s.isAlphaMode;
  return 22;
};

export const DeleteSelectedWord = (runtime: EasyChat2Runtime): number => {
  SetEasyChatWordToField(runtime, EC_WORD_UNDEFINED);
  return 1;
};

export const PlaceSelectedWord = (runtime: EasyChat2Runtime): number => {
  const easyChatWord = GetDisplayedWordByIndex(runtime.easyChatCore, GetSelectWordCursorPos(runtime));
  SetEasyChatWordToField(runtime, easyChatWord);
  screen(runtime).state = 0;
  return 12;
};

export const CommitECWords = (runtime: EasyChat2Runtime): void => {
  const s = screen(runtime);
  for (let i = 0; i < s.numWords; i++) s.words[i] = s.ecWordBuffer[i];
};

export const DeleteAllECFields = (runtime: EasyChat2Runtime): void => {
  const s = screen(runtime);
  for (let i = 0; i < s.numWords; i++) s.ecWordBuffer[i] = EC_WORD_UNDEFINED;
};

export const SetEasyChatWordToField = (runtime: EasyChat2Runtime, easyChatWord: number): void => {
  screen(runtime).ecWordBuffer[GetSelectedFieldIndex(runtime)] = easyChatWord & 0xffff;
};

export const HasECMessageChanged = (runtime: EasyChat2Runtime): boolean => {
  const s = screen(runtime);
  for (let i = 0; i < s.numWords; i++) {
    if (s.ecWordBuffer[i] !== s.words[i]) return true;
  }
  return false;
};

export const SelectGroupCursorAction = (runtime: EasyChat2Runtime, action: number): number => {
  const s = screen(runtime);
  if (s.selectGroupCursorX !== -1) {
    return !s.isAlphaMode
      ? UpdateSelectGroupCursorPos_OutsideBlueBox_GroupMode(runtime, action)
      : UpdateSelectGroupCursorPos_OutsideBlueBox_AlphaMode(runtime, action);
  }
  return UpdateSelectGroupCursorPos_InsideBlueBox(runtime, action);
};

export const UpdateSelectGroupCursorPos_OutsideBlueBox_GroupMode = (runtime: EasyChat2Runtime, action: number): number => {
  const s = screen(runtime);
  switch (action) {
    case 2:
      if (s.selectGroupCursorY !== -s.selectGroupRowsAbove) {
        if (s.selectGroupCursorY) {
          s.selectGroupCursorY--;
          return 14;
        }
        s.selectGroupRowsAbove--;
        return 16;
      }
      break;
    case 3:
      if (s.selectGroupCursorY + s.selectGroupRowsAbove < s.selectGroupNumRows - 1) {
        let result: number;
        if (s.selectGroupCursorY < 3) {
          s.selectGroupCursorY++;
          result = 14;
        } else {
          s.selectGroupRowsAbove++;
          result = 15;
        }
        MoveGroupCursorXToMaxCol(runtime);
        return result;
      }
      break;
    case 1:
      if (s.selectGroupCursorX) s.selectGroupCursorX--;
      else GroupCursorMoveToBlueBox(runtime);
      return 14;
    case 0:
      if (s.selectGroupCursorX < 1) {
        s.selectGroupCursorX++;
        if (GroupSelectCursorXPosTooFarRight(runtime)) GroupCursorMoveToBlueBox(runtime);
      } else {
        GroupCursorMoveToBlueBox(runtime);
      }
      return 14;
  }
  return 0;
};

export const UpdateSelectGroupCursorPos_OutsideBlueBox_AlphaMode = (runtime: EasyChat2Runtime, action: number): number => {
  const s = screen(runtime);
  switch (action) {
    case 2:
      if (s.selectGroupCursorY > 0) s.selectGroupCursorY--;
      else s.selectGroupCursorY = 3;
      MoveGroupCursorXToMaxCol(runtime);
      return 14;
    case 3:
      if (s.selectGroupCursorY < 3) s.selectGroupCursorY++;
      else s.selectGroupCursorY = 0;
      MoveGroupCursorXToMaxCol(runtime);
      return 14;
    case 0:
      s.selectGroupCursorX++;
      if (GroupSelectCursorXPosTooFarRight(runtime)) GroupCursorMoveToBlueBox(runtime);
      return 14;
    case 1:
      s.selectGroupCursorX--;
      if (s.selectGroupCursorX < 0) GroupCursorMoveToBlueBox(runtime);
      return 14;
  }
  return 0;
};

export const UpdateSelectGroupCursorPos_InsideBlueBox = (runtime: EasyChat2Runtime, action: number): number => {
  const s = screen(runtime);
  switch (action) {
    case 2:
      if (s.selectGroupCursorY) s.selectGroupCursorY--;
      else s.selectGroupCursorY = 2;
      return 14;
    case 3:
      if (s.selectGroupCursorY < 2) s.selectGroupCursorY++;
      else s.selectGroupCursorY = 0;
      return 14;
    case 1:
      s.selectGroupCursorY++;
      GroupCursorWrapAroundLeft(runtime);
      return 14;
    case 0:
      s.selectGroupCursorX = 0;
      s.selectGroupCursorY++;
      return 14;
  }
  return 0;
};

export const GroupCursorMoveToBlueBox = (runtime: EasyChat2Runtime): void => {
  const s = screen(runtime);
  s.selectGroupCursorX = -1;
  if (s.selectGroupCursorY) s.selectGroupCursorY--;
};

export const GroupCursorWrapAroundLeft = (runtime: EasyChat2Runtime): void => {
  const s = screen(runtime);
  if (!s.isAlphaMode) {
    s.selectGroupCursorX = 1;
    MoveGroupCursorXToMaxCol(runtime);
  } else {
    s.selectGroupCursorX = GetMaxGroupCursorXinAlphaMode(s.selectGroupCursorY);
  }
};

export const SelectWordCursorAction = (runtime: EasyChat2Runtime, action: number): number => {
  const s = screen(runtime);
  switch (action) {
    case 2:
      if (s.selectWordCursorY + s.selectWordRowsAbove > 0) {
        let result: number;
        if (s.selectWordCursorY > 0) {
          s.selectWordCursorY--;
          result = 17;
        } else {
          s.selectWordRowsAbove--;
          result = 18;
        }
        MoveWordCursorXToMaxCol(runtime);
        return result;
      }
      break;
    case 3:
      if (s.selectWordCursorY + s.selectWordRowsAbove < s.selectWordNumRows) {
        let result: number;
        if (s.selectWordCursorY < 3) {
          s.selectWordCursorY++;
          result = 17;
        } else {
          s.selectWordRowsAbove++;
          result = 19;
        }
        MoveWordCursorXToMaxCol(runtime);
        return result;
      }
      break;
    case 1:
      if (s.selectWordCursorX > 0) s.selectWordCursorX--;
      else s.selectWordCursorX = 1;
      MoveWordCursorXToMaxCol(runtime);
      return 17;
    case 0:
      if (s.selectWordCursorX < 1) {
        s.selectWordCursorX++;
        if (WordSelectCursorXPosTooFarRight(runtime)) s.selectWordCursorX = 0;
      } else {
        s.selectWordCursorX = 0;
      }
      return 17;
    case 4:
      if (s.selectWordRowsAbove) {
        if (s.selectWordRowsAbove > 3) s.selectWordRowsAbove -= 4;
        else s.selectWordRowsAbove = 0;
        return 20;
      }
      break;
    case 5:
      if (s.selectWordRowsAbove <= s.selectWordNumRows - 4) {
        s.selectWordRowsAbove += 4;
        if (s.selectWordRowsAbove > s.selectWordNumRows - 3) s.selectWordRowsAbove = s.selectWordNumRows - 3;
        MoveWordCursorXToMaxCol(runtime);
        return 21;
      }
      break;
  }
  return 0;
};

export const GetSelectedFieldIndex = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  return s.mainCursorRow * s.numColumns + s.mainCursorColumn;
};

export const GetSelectedGroupIndex = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  return 2 * (s.selectGroupCursorY + s.selectGroupRowsAbove) + s.selectGroupCursorX;
};

export const sAlphabetLayout = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26]
];

export const GetSelectedLetter = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  const col = s.selectGroupCursorX < sAlphabetLayout[0].length ? s.selectGroupCursorX : 0;
  const row = s.selectGroupCursorY < sAlphabetLayout.length ? s.selectGroupCursorY : 0;
  return sAlphabetLayout[row][col];
};

export const GetSelectWordCursorPos = (runtime: EasyChat2Runtime): number => {
  const s = screen(runtime);
  return 2 * (s.selectWordCursorY + s.selectWordRowsAbove) + s.selectWordCursorX;
};

export const GetMaxGroupCursorXinAlphaMode = (row: number): number => {
  switch (row) {
    case 1:
      return 5;
    case 0:
    default:
      return 6;
  }
};

export const MoveGroupCursorXToMaxCol = (runtime: EasyChat2Runtime): void => {
  const s = screen(runtime);
  while (GroupSelectCursorXPosTooFarRight(runtime)) {
    if (s.selectGroupCursorX) s.selectGroupCursorX--;
    else break;
  }
};

export const MoveWordCursorXToMaxCol = (runtime: EasyChat2Runtime): void => {
  const s = screen(runtime);
  while (WordSelectCursorXPosTooFarRight(runtime)) {
    if (s.selectWordCursorX) s.selectWordCursorX--;
    else break;
  }
};

export const GroupSelectCursorXPosTooFarRight = (runtime: EasyChat2Runtime): boolean => {
  const s = screen(runtime);
  if (!s.isAlphaMode) return GetSelectedGroupIndex(runtime) >= GetNumDisplayableGroups(runtime.easyChatCore);
  return s.selectGroupCursorX > GetMaxGroupCursorXinAlphaMode(s.selectGroupCursorY);
};

export const WordSelectCursorXPosTooFarRight = (runtime: EasyChat2Runtime): boolean =>
  GetSelectWordCursorPos(runtime) >= GetNumDisplayedWords(runtime.easyChatCore);

export const GetEasyChatScreenFrameId = (runtime: EasyChat2Runtime): number =>
  sEasyChatScreenTemplates[screen(runtime).templateId].frameId;

export const GetTitleText = (runtime: EasyChat2Runtime): string | null =>
  sEasyChatScreenTemplates[screen(runtime).templateId].titleText;

export const GetEasyChatWordBuffer = (runtime: EasyChat2Runtime): number[] => screen(runtime).ecWordBuffer;
export const GetNumRows = (runtime: EasyChat2Runtime): number => screen(runtime).numRows;
export const GetNumColumns = (runtime: EasyChat2Runtime): number => screen(runtime).numColumns;
export const GetMainCursorColumn = (runtime: EasyChat2Runtime): number => screen(runtime).mainCursorColumn;
export const GetMainCursorRow = (runtime: EasyChat2Runtime): number => screen(runtime).mainCursorRow;

export const GetEasyChatInstructionsText = (runtime: EasyChat2Runtime): [string | null, string | null] => {
  const template = sEasyChatScreenTemplates[screen(runtime).templateId];
  return [template.instructionsText1, template.instructionsText2];
};

export const GetEasyChatConfirmText = (runtime: EasyChat2Runtime): [string | null, string | null] => {
  const template = sEasyChatScreenTemplates[screen(runtime).templateId];
  return [template.confirmText1, template.confirmText2];
};

export const GetEasyChatConfirmCancelText = (runtime: EasyChat2Runtime): [string | null, string | null] => {
  switch (screen(runtime).type) {
    case EASY_CHAT_TYPE_MAIL:
      return ['gText_StopGivingPkmnMail', null];
    default:
      return ['gText_QuitEditing', null];
  }
};

export const GetEasyChatConfirmDeletionText = (): [string, string] => ['gText_AllTextBeingEditedWill', 'gText_BeDeletedThatOkay'];

export const GetECSelectGroupCursorCoords = (runtime: EasyChat2Runtime): [number, number] => {
  const s = screen(runtime);
  return [s.selectGroupCursorX, s.selectGroupCursorY];
};

export const IsEasyChatAlphaMode = (runtime: EasyChat2Runtime): boolean => screen(runtime).isAlphaMode;
export const GetECSelectGroupRowsAbove = (runtime: EasyChat2Runtime): number => screen(runtime).selectGroupRowsAbove;

export const GetECSelectWordCursorCoords = (runtime: EasyChat2Runtime): [number, number] => {
  const s = screen(runtime);
  return [s.selectWordCursorX, s.selectWordCursorY];
};

export const GetECSelectWordRowsAbove = (runtime: EasyChat2Runtime): number => screen(runtime).selectWordRowsAbove;
export const GetECSelectWordNumRows = (runtime: EasyChat2Runtime): number => screen(runtime).selectWordNumRows;
export const UnusedDummy = (): number => 0;

export const ShouldDrawECUpArrow = (runtime: EasyChat2Runtime): boolean => {
  const s = screen(runtime);
  switch (s.state) {
    case 2:
      if (!s.isAlphaMode && s.selectGroupRowsAbove !== 0) return true;
      break;
    case 3:
      if (s.selectWordRowsAbove !== 0) return true;
      break;
  }
  return false;
};

export const ShouldDrawECDownArrow = (runtime: EasyChat2Runtime): boolean => {
  const s = screen(runtime);
  switch (s.state) {
    case 2:
      if (!s.isAlphaMode && s.selectGroupRowsAbove + 4 <= s.selectGroupNumRows - 1) return true;
      break;
    case 3:
      if (s.selectWordRowsAbove + 4 <= s.selectWordNumRows) return true;
      break;
  }
  return false;
};

export const IsPhraseDifferentThanPlayerInput = (runtime: EasyChat2Runtime, phrase: number[], phraseLength: number): number => {
  const s = screen(runtime);
  for (let i = 0; i < phraseLength; i++) {
    if (phrase[i] !== s.ecWordBuffer[i]) return 1;
  }
  return 0;
};

export const GetEasyChatScreenTemplateId = (type: number): number => {
  for (let i = 0; i < sEasyChatScreenTemplates.length; i++) {
    if (sEasyChatScreenTemplates[i].type === type) return i;
  }
  return 0;
};

export const IsEcWordBufferUninitialized = (runtime: EasyChat2Runtime): boolean => {
  const s = screen(runtime);
  for (let i = 0; i < s.numWords; i++) {
    if (s.ecWordBuffer[i] !== EC_WORD_UNDEFINED) return false;
  }
  return true;
};
