import { describe, expect, test } from 'vitest';
import { GetDisplayedWordByIndex, GetNumDisplayedWords, GetUnlockedECWords, InitEasyChatSelection } from '../src/game/decompEasyChat';
import {
  A_BUTTON,
  B_BUTTON,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  EASY_CHAT_TYPE_BATTLE_START,
  EASY_CHAT_TYPE_MAIL,
  EASY_CHAT_TYPE_PROFILE,
  EASY_CHAT_TYPE_QUESTIONNAIRE,
  EC_ACTION_BACK_TO_FIELD,
  EC_ACTION_CLOSE_YES_NO,
  EC_ACTION_CREATE_CANCEL_YES_NO,
  EC_ACTION_CREATE_CONFIRM_YES_NO,
  EC_ACTION_CREATE_DEL_ALL_YES_NO,
  EC_ACTION_DELETE_ALL,
  EC_ACTION_DELETE_WORD,
  EC_ACTION_FINISH,
  EC_ACTION_MOVE_FIELD_CURSOR,
  EC_ACTION_MOVE_GROUP_CURSOR,
  EC_ACTION_MOVE_TO_FOOTER,
  EC_ACTION_OPEN_GROUP_SELECT,
  EC_ACTION_OPEN_WORD_SELECT,
  EC_ACTION_PLACE_WORD,
  EC_ACTION_SCROLL_GROUP_DOWN,
  EC_ACTION_SCROLL_GROUP_UP,
  EC_ACTION_TOGGLE_ALPHA,
  EC_ACTION_WORD_PAGE_DOWN,
  EC_WORD_UNDEFINED,
  EZCHAT_TASK_STATE,
  FLAG_SYS_SET_TRAINER_CARD_PROFILE,
  MENU_B_PRESSED,
  SELECT_BUTTON,
  START_BUTTON,
  BackOutFromGroupToFieldSelect,
  Cancel_HandleYesNoMenu,
  CB2_EasyChatScreen,
  CompareProfileResponseWithPassphrase,
  Confirm_CreateYesNoMenu,
  Confirm_HandleYesNoMenu,
  DelAll_CreateYesNoMenu,
  DelAll_HandleYesNoMenu,
  DoEasyChatScreen,
  EASY_CHAT_TYPE_MAIL_NO_CONFIRM,
  EasyChatScreen_HandleJoypad,
  EasyChat_AllocateResources,
  GetECSelectGroupCursorCoords,
  GetECSelectWordCursorCoords,
  GetEasyChatConfirmCancelText,
  GetEasyChatConfirmDeletionText,
  GetEasyChatConfirmText,
  GetEasyChatInstructionsText,
  GetEasyChatScreenFrameId,
  GetEasyChatScreenTemplateId,
  GetEasyChatWordBuffer,
  GetMainCursorColumn,
  GetMainCursorRow,
  GetNumColumns,
  GetNumRows,
  GetSelectedFieldIndex,
  GetSelectedGroupIndex,
  GetSelectedLetter,
  GetSelectWordCursorPos,
  GetTitleText,
  GroupCursorMoveToBlueBox,
  HandleJoypad_SelectField,
  HandleJoypad_SelectFooter,
  HandleJoypad_SelectGroup,
  HandleJoypad_SelectWord,
  HasECMessageChanged,
  IsEasyChatAlphaMode,
  IsEcWordBufferUninitialized,
  OpenSelectedGroup,
  PlaceSelectedWord,
  RunTasks,
  SE_SELECT,
  SelectGroupCursorAction,
  SelectWordCursorAction,
  SetEasyChatTaskFunc,
  SetEasyChatWordToField,
  ShouldDrawECDownArrow,
  ShouldDrawECUpArrow,
  ShowEasyChatScreen,
  Task_InitEasyChat,
  Task_RunEasyChat,
  ToggleGroupAlphaMode,
  UnusedDummy,
  createEasyChat2Runtime,
  sECPhrase_MysteryEventIsExciting
} from '../src/game/decompEasyChat2';

const alloc = (words = [1, 2, 3, 4], type = EASY_CHAT_TYPE_PROFILE) => {
  const runtime = createEasyChat2Runtime();
  InitEasyChatSelection(runtime.easyChatCore);
  expect(EasyChat_AllocateResources(runtime, type, words)).toBe(true);
  return runtime;
};

describe('decomp easy_chat_2', () => {
  test('allocates the C screen struct from templates and exposes text accessors', () => {
    const runtime = alloc([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], EASY_CHAT_TYPE_MAIL);
    expect(GetEasyChatScreenTemplateId(EASY_CHAT_TYPE_PROFILE)).toBe(0);
    expect(GetEasyChatScreenTemplateId(123)).toBe(0);
    expect(GetEasyChatScreenFrameId(runtime)).toBe(2);
    expect(GetTitleText(runtime)).toBeNull();
    expect(GetNumColumns(runtime)).toBe(2);
    expect(GetNumRows(runtime)).toBe(5);
    expect(GetEasyChatWordBuffer(runtime)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(GetMainCursorColumn(runtime)).toBe(0);
    expect(GetMainCursorRow(runtime)).toBe(0);
    expect(GetEasyChatInstructionsText(runtime)).toEqual(['gText_CombineNineWordsOrPhrases', 'gText_AndMakeAMessage']);
    expect(GetEasyChatConfirmText(runtime)).toEqual(['gText_TheMailMessage', 'gText_IsAsShownOkay']);
    expect(GetEasyChatConfirmCancelText(runtime)).toEqual(['gText_StopGivingPkmnMail', null]);
    expect(GetEasyChatConfirmDeletionText()).toEqual(['gText_AllTextBeingEditedWill', 'gText_BeDeletedThatOkay']);
    expect(IsEcWordBufferUninitialized(runtime)).toBe(false);

    const mailNoConfirm = alloc([EC_WORD_UNDEFINED, EC_WORD_UNDEFINED, EC_WORD_UNDEFINED, EC_WORD_UNDEFINED], EASY_CHAT_TYPE_MAIL_NO_CONFIRM);
    expect(GetEasyChatConfirmText(mailNoConfirm)).toEqual([null, null]);
    expect(GetEasyChatConfirmCancelText(mailNoConfirm)).toEqual(['gText_QuitEditing', null]);
    expect(IsEcWordBufferUninitialized(mailNoConfirm)).toBe(true);
  });

  test('DoEasyChatScreen and init task follow linked and non-linked setup flow', () => {
    const runtime = createEasyChat2Runtime();
    const words = [1, 2, 3, 4];
    DoEasyChatScreen(runtime, EASY_CHAT_TYPE_PROFILE, words, 'ReturnCallback');
    expect(runtime.mainCallback2).toBe('CB2_EasyChatScreen');
    expect(runtime.gTasks[0].func).toBe('Task_InitEasyChat');
    expect(runtime.gTasks[0].data[2]).toBe(words);
    runtime.gTasks[0].data[EZCHAT_TASK_STATE] = 9;
    SetEasyChatTaskFunc(runtime, 0, 'Task_RunEasyChat');
    expect(runtime.gTasks[0].func).toBe('Task_RunEasyChat');
    expect(runtime.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(0);
    expect(UnusedDummy()).toBe(0);

    Task_InitEasyChat(runtime, 0);
    expect(runtime.gTasks[0].func).toBe('Task_RunEasyChat');
    expect(runtime.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(0);
    expect(runtime.sEasyChatScreen?.words).toBe(words);
    expect(runtime.operations).toContain('LoadEasyChatGraphics');

    const linked = createEasyChat2Runtime({ linkStateCBActive: true, loadEasyChatGraphicsResults: [true, false] });
    DoEasyChatScreen(linked, EASY_CHAT_TYPE_PROFILE, words, 'ReturnCallback');
    Task_InitEasyChat(linked, 0);
    expect(linked.gTasks[0].func).toBe('Task_InitEasyChat');
    expect(linked.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(1);
    for (let i = 0; i < 6; i++) Task_InitEasyChat(linked, 0);
    expect(linked.gTasks[0].func).toBe('Task_RunEasyChat');
  });

  test('main task state machine runs fades, commands, command wait, and profile teardown', () => {
    const runtime = alloc([...sECPhrase_MysteryEventIsExciting], EASY_CHAT_TYPE_PROFILE);
    DoEasyChatScreen(runtime, EASY_CHAT_TYPE_PROFILE, runtime.sEasyChatScreen!.words, 'ReturnCallback');
    runtime.gTasks[0].func = 'Task_RunEasyChat';
    runtime.gTasks[0].data[EZCHAT_TASK_STATE] = 0;
    runtime.sEasyChatScreen = { ...runtime.sEasyChatScreen!, state: 0 };

    Task_RunEasyChat(runtime, 0);
    expect(runtime.vblankCallback).toBe('VBlankCallback_EasyChatScreen');
    expect(runtime.operations).toContain('BeginNormalPaletteFadeIn');

    runtime.gTasks[0].data[EZCHAT_TASK_STATE] = 1;
    runtime.newKeys = A_BUTTON;
    Task_RunEasyChat(runtime, 0);
    expect(runtime.playedSE).toEqual([SE_SELECT]);
    expect(runtime.interfaceCommands).toEqual([EC_ACTION_OPEN_GROUP_SELECT]);
    expect(runtime.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(2);

    runtime.interfaceCommandRunResults = [true, false];
    Task_RunEasyChat(runtime, 0);
    expect(runtime.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(2);
    Task_RunEasyChat(runtime, 0);
    expect(runtime.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(1);

    runtime.sEasyChatScreen!.state = 6;
    runtime.menuInputResults = [0];
    Task_RunEasyChat(runtime, 0);
    expect(runtime.operations).toContain('BeginNormalPaletteFadeOut');
    expect(runtime.gTasks[0].data[EZCHAT_TASK_STATE]).toBe(3);
    runtime.gPaletteFade.active = false;
    Task_RunEasyChat(runtime, 0);
    expect(runtime.flags.has(FLAG_SYS_SET_TRAINER_CARD_PROFILE)).toBe(true);
    expect(runtime.gSpecialVar_0x8004).toBe(0);
    expect(runtime.mainCallback2).toBe('ReturnCallback');
    expect(runtime.sEasyChatScreen).toBeNull();
  });

  test('field and footer joypad handlers mirror cursor wrapping and yes/no creation', () => {
    const runtime = alloc([1, 2, 3, 4, 5, 6], EASY_CHAT_TYPE_BATTLE_START);
    runtime.newKeys = DPAD_UP;
    expect(HandleJoypad_SelectField(runtime)).toBe(EC_ACTION_MOVE_TO_FOOTER);
    expect(runtime.sEasyChatScreen).toMatchObject({ state: 1, mainCursorRow: 3 });

    runtime.newKeys = DPAD_LEFT;
    expect(HandleJoypad_SelectFooter(runtime)).toBe(EC_ACTION_MOVE_TO_FOOTER);
    expect(runtime.sEasyChatScreen?.mainCursorColumn).toBe(2);
    runtime.newKeys = DPAD_DOWN;
    expect(HandleJoypad_SelectFooter(runtime)).toBe(EC_ACTION_MOVE_FIELD_CURSOR);
    expect(runtime.sEasyChatScreen).toMatchObject({ state: 0, mainCursorRow: 0, mainCursorColumn: 1 });

    runtime.newKeys = A_BUTTON;
    expect(HandleJoypad_SelectField(runtime)).toBe(EC_ACTION_OPEN_GROUP_SELECT);
    expect(runtime.sEasyChatScreen).toMatchObject({ state: 2, selectGroupCursorX: 0, selectGroupCursorY: 0 });

    runtime.sEasyChatScreen!.state = 0;
    runtime.newKeys = B_BUTTON;
    expect(HandleJoypad_SelectField(runtime)).toBe(EC_ACTION_CREATE_CANCEL_YES_NO);
    runtime.sEasyChatScreen!.state = 0;
    runtime.newKeys = START_BUTTON;
    expect(HandleJoypad_SelectField(runtime)).toBe(EC_ACTION_CREATE_CONFIRM_YES_NO);

    const mail = alloc([1, 2, 3, 4, 5, 6, 7, 8, 9], EASY_CHAT_TYPE_MAIL);
    mail.sEasyChatScreen!.mainCursorRow = 4;
    mail.sEasyChatScreen!.mainCursorColumn = 0;
    mail.newKeys = DPAD_RIGHT;
    expect(HandleJoypad_SelectField(mail)).toBe(EC_ACTION_MOVE_FIELD_CURSOR);
    expect(mail.sEasyChatScreen?.mainCursorColumn).toBe(0);
  });

  test('group selection handles normal mode, alpha mode, and blue box actions', () => {
    const runtime = alloc([1, 2, 3, 4]);
    runtime.sEasyChatScreen!.state = 2;
    expect(GetSelectedGroupIndex(runtime)).toBe(0);
    expect(SelectGroupCursorAction(runtime, 0)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)).toEqual([1, 0]);
    expect(SelectGroupCursorAction(runtime, 1)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)).toEqual([0, 0]);
    expect(SelectGroupCursorAction(runtime, 1)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)).toEqual([-1, 0]);

    expect(SelectGroupCursorAction(runtime, 2)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)).toEqual([-1, 2]);
    expect(SelectGroupCursorAction(runtime, 1)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)[0]).toBe(1);

    runtime.sEasyChatScreen!.selectGroupCursorY = 3;
    runtime.sEasyChatScreen!.selectGroupRowsAbove = 0;
    expect(SelectGroupCursorAction(runtime, 3)).toBe(EC_ACTION_SCROLL_GROUP_DOWN);
    expect(runtime.sEasyChatScreen?.selectGroupRowsAbove).toBe(1);
    runtime.sEasyChatScreen!.selectGroupCursorY = 0;
    expect(SelectGroupCursorAction(runtime, 2)).toBe(EC_ACTION_SCROLL_GROUP_UP);

    expect(ToggleGroupAlphaMode(runtime)).toBe(EC_ACTION_TOGGLE_ALPHA);
    expect(IsEasyChatAlphaMode(runtime)).toBe(true);
    runtime.sEasyChatScreen!.selectGroupCursorX = 6;
    runtime.sEasyChatScreen!.selectGroupCursorY = 0;
    expect(SelectGroupCursorAction(runtime, 3)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)).toEqual([5, 1]);
    runtime.sEasyChatScreen!.selectGroupCursorX = 0;
    expect(SelectGroupCursorAction(runtime, 1)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(GetECSelectGroupCursorCoords(runtime)).toEqual([-1, 0]);

    expect(HandleJoypad_SelectGroup(runtime)).toBe(0);
    runtime.newKeys = SELECT_BUTTON;
    expect(HandleJoypad_SelectGroup(runtime)).toBe(EC_ACTION_TOGGLE_ALPHA);
    runtime.sEasyChatScreen!.selectGroupCursorX = -1;
    runtime.sEasyChatScreen!.selectGroupCursorY = 1;
    runtime.newKeys = A_BUTTON;
    expect(HandleJoypad_SelectGroup(runtime)).toBe(EC_ACTION_DELETE_WORD);
    expect(GetEasyChatWordBuffer(runtime)[0]).toBe(EC_WORD_UNDEFINED);
    runtime.sEasyChatScreen!.selectGroupCursorY = 2;
    expect(HandleJoypad_SelectGroup(runtime)).toBe(EC_ACTION_BACK_TO_FIELD);
    GroupCursorMoveToBlueBox(runtime);
    expect(GetECSelectGroupCursorCoords(runtime)[0]).toBe(-1);
    expect(BackOutFromGroupToFieldSelect(runtime)).toBe(EC_ACTION_BACK_TO_FIELD);
  });

  test('opening groups and word cursor actions select displayed words 1:1', () => {
    const runtime = alloc([1, 2, 3, 4]);
    InitEasyChatSelection(runtime.easyChatCore);
    runtime.sEasyChatScreen!.state = 2;
    expect(OpenSelectedGroup(runtime)).toBe(EC_ACTION_OPEN_WORD_SELECT);
    expect(runtime.sEasyChatScreen?.state).toBe(3);
    expect(GetNumDisplayedWords(runtime.easyChatCore)).toBeGreaterThan(0);
    const firstWord = GetDisplayedWordByIndex(runtime.easyChatCore, 0);
    expect(PlaceSelectedWord(runtime)).toBe(EC_ACTION_PLACE_WORD);
    expect(GetEasyChatWordBuffer(runtime)[0]).toBe(firstWord);

    runtime.sEasyChatScreen!.state = 3;
    runtime.sEasyChatScreen!.selectWordNumRows = 7;
    runtime.sEasyChatScreen!.selectWordCursorX = 1;
    runtime.sEasyChatScreen!.selectWordCursorY = 3;
    expect(SelectWordCursorAction(runtime, 3)).toBe(19);
    expect(runtime.sEasyChatScreen?.selectWordRowsAbove).toBe(1);
    expect(ShouldDrawECUpArrow(runtime)).toBe(true);
    expect(ShouldDrawECDownArrow(runtime)).toBe(true);
    expect(SelectWordCursorAction(runtime, 4)).toBe(20);
    expect(runtime.sEasyChatScreen?.selectWordRowsAbove).toBe(0);
    expect(SelectWordCursorAction(runtime, 5)).toBe(EC_ACTION_WORD_PAGE_DOWN);
    expect(GetECSelectWordCursorCoords(runtime)).toEqual([1, 3]);
    expect(GetSelectWordCursorPos(runtime)).toBe(15);

    runtime.newKeys = B_BUTTON;
    expect(HandleJoypad_SelectWord(runtime)).toBe(13);
    runtime.newKeys = DPAD_RIGHT;
    runtime.repeatedKeys = DPAD_RIGHT;
    expect(EasyChatScreen_HandleJoypad(runtime)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
  });

  test('yes/no handlers restore, delete, cancel, commit, and finish with C return codes', () => {
    const runtime = alloc([1, 2, 3, 4]);
    runtime.sEasyChatScreen!.ecWordBuffer[0] = 9;
    expect(HasECMessageChanged(runtime)).toBe(true);
    expect(Confirm_CreateYesNoMenu(runtime)).toBe(EC_ACTION_CREATE_CONFIRM_YES_NO);
    runtime.menuInputResults = [1];
    expect(Confirm_HandleYesNoMenu(runtime)).toBe(EC_ACTION_CLOSE_YES_NO);
    expect(runtime.sEasyChatScreen?.state).toBe(0);

    Confirm_CreateYesNoMenu(runtime);
    runtime.menuInputResults = [0];
    expect(Confirm_HandleYesNoMenu(runtime)).toBe(EC_ACTION_FINISH);
    expect(runtime.gSpecialVar_Result).toBe(1);
    expect(runtime.sEasyChatScreen?.words[0]).toBe(9);

    expect(DelAll_CreateYesNoMenu(runtime)).toBe(EC_ACTION_CREATE_DEL_ALL_YES_NO);
    runtime.menuInputResults = [0];
    expect(DelAll_HandleYesNoMenu(runtime)).toBe(EC_ACTION_DELETE_ALL);
    expect(runtime.sEasyChatScreen?.ecWordBuffer.every((word) => word === EC_WORD_UNDEFINED)).toBe(true);

    runtime.sEasyChatScreen!.state = 0;
    expect(Confirm_CreateYesNoMenu(runtime)).toBe(EC_ACTION_CREATE_CANCEL_YES_NO);
    runtime.menuInputResults = [MENU_B_PRESSED];
    expect(Cancel_HandleYesNoMenu(runtime)).toBe(EC_ACTION_CLOSE_YES_NO);
    runtime.menuInputResults = [0];
    expect(Cancel_HandleYesNoMenu(runtime)).toBe(EC_ACTION_FINISH);
    expect(runtime.gSpecialVar_Result).toBe(0);
  });

  test('passphrase comparison and ShowEasyChatScreen use the same save-block words as C', () => {
    const runtime = alloc([...sECPhrase_MysteryEventIsExciting], EASY_CHAT_TYPE_PROFILE);
    CompareProfileResponseWithPassphrase(runtime);
    expect(runtime.gSpecialVar_0x8004).toBe(0);
    runtime.sEasyChatScreen!.ecWordBuffer[2] = 123;
    CompareProfileResponseWithPassphrase(runtime);
    expect(runtime.gSpecialVar_0x8004).toBe(1);

    const show = createEasyChat2Runtime();
    show.gSpecialVar_0x8004 = EASY_CHAT_TYPE_MAIL;
    show.gSpecialVar_0x8005 = 2;
    show.gSaveBlock1Ptr.mail[2].words[0] = 777;
    ShowEasyChatScreen(show);
    expect(show.gTasks[0].data[2]).toBe(show.gSaveBlock1Ptr.mail[2].words);
    expect(show.mainCallback2).toBe('CB2_EasyChatScreen');

    const ignored = createEasyChat2Runtime({ gSpecialVar_0x8004: 99 });
    ShowEasyChatScreen(ignored);
    expect(ignored.gTasks).toHaveLength(0);
  });

  test('CB2 and task runner dispatch active task functions', () => {
    const runtime = createEasyChat2Runtime();
    DoEasyChatScreen(runtime, EASY_CHAT_TYPE_QUESTIONNAIRE, runtime.gSaveBlock1Ptr.questionnaireWords, 'ReturnCallback');
    CB2_EasyChatScreen(runtime);
    expect(runtime.operations).toContain('AnimateSprites');
    expect(runtime.gTasks[0].func).toBe('Task_RunEasyChat');

    runtime.sEasyChatScreen!.state = 0;
    runtime.newKeys = A_BUTTON;
    RunTasks(runtime);
    RunTasks(runtime);
    expect(runtime.interfaceCommands.at(-1)).toBe(EC_ACTION_OPEN_GROUP_SELECT);
  });

  test('selection helpers expose exact field, group, alphabet, and arrow calculations', () => {
    const runtime = alloc([1, 2, 3, 4]);
    runtime.sEasyChatScreen!.mainCursorColumn = 1;
    runtime.sEasyChatScreen!.mainCursorRow = 1;
    expect(GetSelectedFieldIndex(runtime)).toBe(3);
    SetEasyChatWordToField(runtime, 55);
    expect(runtime.sEasyChatScreen?.ecWordBuffer[3]).toBe(55);

    runtime.sEasyChatScreen!.selectGroupCursorX = 1;
    runtime.sEasyChatScreen!.selectGroupCursorY = 2;
    runtime.sEasyChatScreen!.selectGroupRowsAbove = 1;
    expect(GetSelectedGroupIndex(runtime)).toBe(7);
    expect(GetSelectedLetter(runtime)).toBe(14);
    runtime.sEasyChatScreen!.state = 2;
    expect(ShouldDrawECDownArrow(runtime)).toBe(true);
    expect(ShouldDrawECUpArrow(runtime)).toBe(true);

    runtime.sEasyChatScreen!.isAlphaMode = true;
    runtime.sEasyChatScreen!.selectGroupCursorX = 7;
    runtime.sEasyChatScreen!.selectGroupCursorY = 1;
    expect(SelectGroupCursorAction(runtime, 2)).toBe(EC_ACTION_MOVE_GROUP_CURSOR);
    expect(runtime.sEasyChatScreen?.selectGroupCursorX).toBe(6);

    GetUnlockedECWords(runtime.easyChatCore, false, 1);
    runtime.sEasyChatScreen!.selectWordNumRows = Math.trunc((GetNumDisplayedWords(runtime.easyChatCore) - 1) / 2);
    runtime.sEasyChatScreen!.selectWordCursorX = 1;
    runtime.sEasyChatScreen!.selectWordCursorY = runtime.sEasyChatScreen!.selectWordNumRows;
    expect(SelectWordCursorAction(runtime, 0)).toBe(17);
    expect(runtime.sEasyChatScreen?.selectWordCursorX).toBe(0);
  });
});
