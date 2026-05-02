import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  CLI_MSG_BUFFER_SUCCESS,
  CLI_MSG_CANT_ACCEPT,
  CLI_MSG_CARD_RECEIVED,
  CLI_MSG_NEWS_RECEIVED,
  CLI_RET_ASK_TOSS,
  CLI_RET_COPY_MSG,
  CLI_RET_END,
  CLI_RET_YES_NO,
  CLIENT_MAX_MSG_SIZE,
  CreateMysteryGiftTask,
  DoMysteryGiftYesNo,
  GetClientResultMessage,
  GetMysteryGiftBaseBlock,
  GetServerResultMessage,
  HandleLoadWonderCardOrNews,
  HandleMysteryGiftListMenu,
  HandleMysteryGiftOrEReaderSetup,
  HideDownArrow,
  HideDownArrowAndWaitButton,
  LINKUP_FAILED,
  LIST_CANCEL,
  LIST_NOTHING_CHOSEN,
  MENU_B_PRESSED,
  MG_DrawCheckerboardPattern,
  MG_STATE_ASK_TOSS,
  MG_STATE_ASK_TOSS_UNRECEIVED,
  MG_STATE_CLIENT_ASK_TOSS,
  MG_STATE_CLIENT_ASK_TOSS_UNRECEIVED,
  MG_STATE_CLIENT_COMMUNICATING,
  MG_STATE_CLIENT_LINK,
  MG_STATE_CLIENT_LINK_END,
  MG_STATE_CLIENT_LINK_START,
  MG_STATE_CLIENT_LINK_WAIT,
  MG_STATE_CLIENT_RESULT_MSG,
  MG_STATE_DONT_HAVE_ANY,
  MG_STATE_EXIT,
  MG_STATE_HANDLE_GIFT_INPUT,
  MG_STATE_HANDLE_GIFT_SELECT,
  MG_STATE_LOAD_GIFT,
  MG_STATE_MAIN_MENU,
  MG_STATE_RECEIVE,
  MG_STATE_SAVE_LOAD_GIFT,
  MG_STATE_SEND,
  MG_STATE_SERVER_LINK,
  MG_STATE_SERVER_LINK_END,
  MG_STATE_SERVER_LINK_START,
  MG_STATE_SERVER_LINK_WAIT,
  MG_STATE_SOURCE_PROMPT,
  MG_STATE_SOURCE_PROMPT_INPUT,
  MG_STATE_TOSS,
  MG_STATE_TOSS_SAVE,
  MG_STATE_TO_MAIN_MENU,
  PrintMysteryGiftMenuMessage,
  PrintSuccessMessage,
  PrintThrownAway,
  SVR_MSG_NEWS_SENT,
  SVR_RET_END,
  SaveOnMysteryGiftMenu,
  ShowDownArrow,
  Task_MysteryGift,
  WONDER_NEWS_RECV_FRIEND,
  WONDER_NEWS_SENT,
  createMysteryGiftRuntime,
  sListMenuItems_CardsOrNews,
  sListMenuItems_Receive,
  sListMenuItems_ReceiveSendToss,
  sListMenuItems_ReceiveToss,
  sListMenuItems_WirelessOrFriend
} from '../src/game/decompMysteryGiftMenu';
import {
  gText_AlreadyHadCard,
  gText_CantAcceptNewsFromTrainer,
  gText_DontHaveCardNewOneInput,
  gText_IfThrowAwayCardEventWontHappen,
  gText_MysteryGift2,
  gText_PickOKCancel,
  gText_PickOKExit,
  gText_WonderCardReceived,
  gText_WonderCardReceivedFrom,
  gText_WonderNewsSentTo
} from '../src/game/decompStrings';

const createTaskRuntime = () => {
  const runtime = createMysteryGiftRuntime();
  const taskId = CreateMysteryGiftTask(runtime);
  return { runtime, taskId, data: runtime.tasks[0]!.data };
};

const finishMessage = (runtime: ReturnType<typeof createMysteryGiftRuntime>, taskId: number) => {
  Task_MysteryGift(runtime, taskId);
  runtime.pressedButtons = A_BUTTON;
  Task_MysteryGift(runtime, taskId);
  Task_MysteryGift(runtime, taskId);
};

describe('decompMysteryGiftMenu', () => {
  test('setup state machine initializes BGs, checkerboard, top menu, callbacks, and base block', () => {
    const runtime = createMysteryGiftRuntime();

    expect(HandleMysteryGiftOrEReaderSetup(runtime, false)).toBe(false);
    expect(runtime.gMainState).toBe(1);
    expect(HandleMysteryGiftOrEReaderSetup(runtime, false)).toBe(false);
    expect(runtime.topMenuPrints.at(-1)).toEqual({ isEReader: false, useCancel: false, left: gText_MysteryGift2, right: gText_PickOKCancel });
    expect(runtime.bgTilemapBuffers[3]![0]).toBe(0x003);
    expect(runtime.bgTilemapBuffers[3]![2 * 32]).toBe(2);
    expect(runtime.bgTilemapBuffers[3]![2 * 32 + 1]).toBe(1);
    expect(HandleMysteryGiftOrEReaderSetup(runtime, false)).toBe(false);
    expect(HandleMysteryGiftOrEReaderSetup(runtime, false)).toBe(true);
    expect(runtime.vblankCallback).toBe('VBlankCB_MysteryGiftEReader');
    expect(GetMysteryGiftBaseBlock()).toBe(0x19b);

    const eReader = createMysteryGiftRuntime({ gMainState: 1 });
    HandleMysteryGiftOrEReaderSetup(eReader, true);
    expect(eReader.topMenuPrints.at(-1)?.isEReader).toBe(true);

    const checker = createMysteryGiftRuntime();
    MG_DrawCheckerboardPattern(checker);
    expect(checker.bgTilemapBuffers[3]![3 * 32 + 4]).toBe((1 & 1) !== (4 & 1) ? 1 : 2);
  });

  test('message, yes/no, save, success, and list helpers follow their C textState transitions', () => {
    const runtime = createMysteryGiftRuntime();
    const data = { textState: 0, var: 0 };

    expect(PrintMysteryGiftMenuMessage(runtime, data, gText_DontHaveCardNewOneInput)).toBe(false);
    expect(data.textState).toBe(1);
    runtime.pressedButtons = A_BUTTON;
    expect(PrintMysteryGiftMenuMessage(runtime, data, gText_DontHaveCardNewOneInput)).toBe(false);
    expect(data.textState).toBe(2);
    expect(PrintMysteryGiftMenuMessage(runtime, data, gText_DontHaveCardNewOneInput)).toBe(true);
    expect(data.textState).toBe(0);

    HideDownArrow(runtime);
    ShowDownArrow(runtime);
    expect(runtime.operations.slice(-2)).toEqual(['DrawDownArrow(false)', 'DrawDownArrow(true)']);
    expect(HideDownArrowAndWaitButton(runtime, data)).toBe(false);
    expect(runtime.operations.at(-1)).toBe('DrawDownArrow(false)');
    runtime.pressedButtons = B_BUTTON;
    expect(HideDownArrowAndWaitButton(runtime, data)).toBe(false);
    expect(data.textState).toBe(1);
    expect(HideDownArrowAndWaitButton(runtime, data)).toBe(true);
    expect(runtime.operations.at(-1)).toBe('DrawDownArrow(true)');
    expect(data.textState).toBe(0);

    expect(DoMysteryGiftYesNo(runtime, data, true, gText_IfThrowAwayCardEventWontHappen)).toBe(-2);
    expect(DoMysteryGiftYesNo(runtime, data, true, gText_IfThrowAwayCardEventWontHappen)).toBe(-2);
    runtime.yesNoInputs.push(0);
    expect(DoMysteryGiftYesNo(runtime, data, true, gText_IfThrowAwayCardEventWontHappen)).toBe(0);
    expect(data.textState).toBe(0);

    for (let i = 0; i < 4; i++) {
      if (i === 3) runtime.pressedButtons = B_BUTTON;
      SaveOnMysteryGiftMenu(runtime, data);
    }
    expect(SaveOnMysteryGiftMenu(runtime, data)).toBe(true);
    expect(runtime.savedDataCount).toBe(1);

    expect(PrintSuccessMessage(runtime, data, gText_WonderCardReceived)).toBe(false);
    data.var = 240;
    expect(PrintSuccessMessage(runtime, data, gText_WonderCardReceived)).toBe(false);
    expect(PrintSuccessMessage(runtime, data, gText_WonderCardReceived)).toBe(true);

    runtime.listMenuInputs.push(LIST_NOTHING_CHOSEN, 2);
    expect(HandleMysteryGiftListMenu(runtime, data, false, false)).toBe(LIST_NOTHING_CHOSEN);
    expect(runtime.textWindowMessages.at(-1)).toContain('WONDER CARDS');
    expect(HandleMysteryGiftListMenu(runtime, data, false, false)).toBe(LIST_NOTHING_CHOSEN);
    expect(HandleMysteryGiftListMenu(runtime, data, false, false)).toBe(2);
    expect(sListMenuItems_ReceiveSendToss.map((item) => item.index)).toEqual([0, 1, 2, LIST_CANCEL]);
    expect(sListMenuItems_ReceiveToss.map((item) => item.index)).toEqual([0, 2, LIST_CANCEL]);
    expect(sListMenuItems_Receive.map((item) => item.index)).toEqual([0, LIST_CANCEL]);
  });

  test('Task_MysteryGift main menu, missing gift, source prompt, link start, and link wait match the C flow', () => {
    const { runtime, taskId, data } = createTaskRuntime();

    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_MAIN_MENU);

    runtime.listMenuInputs.push(0);
    Task_MysteryGift(runtime, taskId);
    expect(data.isWonderNews).toBe(false);
    expect(data.state).toBe(MG_STATE_DONT_HAVE_ANY);
    finishMessage(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SOURCE_PROMPT);
    expect(runtime.topMenuPrints.at(-1)?.right).toBe(gText_PickOKExit);

    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SOURCE_PROMPT_INPUT);
    expect(runtime.textWindowMessages.at(-1)).toContain('WONDER CARD');

    runtime.listMenuInputs.push(1);
    Task_MysteryGift(runtime, taskId);
    expect(data.sourceIsFriend).toBe(true);
    expect(data.state).toBe(MG_STATE_CLIENT_LINK_START);

    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_CLIENT_LINK_WAIT);
    expect(runtime.operations.at(-1)).toBe('CreateTask_LinkMysteryGiftWithFriend(69)');

    runtime.gSpecialVar_Result = LINKUP_FAILED;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SOURCE_PROMPT);

    data.state = MG_STATE_CLIENT_LINK_WAIT;
    runtime.gSpecialVar_Result = 0;
    runtime.gReceivedRemoteLinkPlayers = true;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_CLIENT_COMMUNICATING);
    expect(runtime.operations).toContain('MysteryGiftClient_Create');

    expect(sListMenuItems_CardsOrNews.map((item) => item.index)).toEqual([0, 1, LIST_CANCEL]);
    expect(sListMenuItems_WirelessOrFriend.map((item) => item.index)).toEqual([0, 1, LIST_CANCEL]);
  });

  test('client link states copy messages, answer prompts, ask toss twice, and route result messages', () => {
    const { runtime, taskId, data } = createTaskRuntime();
    data.state = MG_STATE_CLIENT_LINK;
    runtime.clientMsg = 'Buffered success message';
    runtime.clientRunReturns.push({ ret: CLI_RET_COPY_MSG });
    Task_MysteryGift(runtime, taskId);
    expect(data.clientMsg).toBe('Buffered success message'.slice(0, CLIENT_MAX_MSG_SIZE));
    expect(runtime.clientAdvanceCount).toBe(1);

    runtime.clientRunReturns.push({ ret: CLI_RET_YES_NO });
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(9);
    DoMysteryGiftYesNo(runtime, data, false, runtime.clientMsg);
    DoMysteryGiftYesNo(runtime, data, false, runtime.clientMsg);
    runtime.yesNoInputs.push(1);
    Task_MysteryGift(runtime, taskId);
    expect(runtime.clientParams.at(-1)).toBe(1);
    expect(data.state).toBe(MG_STATE_CLIENT_COMMUNICATING);

    data.state = MG_STATE_CLIENT_LINK;
    runtime.savedWonderCardGiftNotReceived = true;
    runtime.clientRunReturns.push({ ret: CLI_RET_ASK_TOSS });
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_CLIENT_ASK_TOSS);
    DoMysteryGiftYesNo(runtime, data, false, '');
    DoMysteryGiftYesNo(runtime, data, false, '');
    runtime.yesNoInputs.push(0);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_CLIENT_ASK_TOSS_UNRECEIVED);
    DoMysteryGiftYesNo(runtime, data, false, '');
    DoMysteryGiftYesNo(runtime, data, false, '');
    runtime.yesNoInputs.push(MENU_B_PRESSED);
    Task_MysteryGift(runtime, taskId);
    expect(runtime.clientParams.at(-1)).toBe(1);

    data.state = MG_STATE_CLIENT_LINK;
    runtime.clientRunReturns.push({ ret: CLI_RET_END, endVal: CLI_MSG_NEWS_RECEIVED });
    Task_MysteryGift(runtime, taskId);
    expect(data.msgId).toBe(CLI_MSG_NEWS_RECEIVED);
    expect(data.state).toBe(MG_STATE_CLIENT_LINK_END);

    runtime.linkRfuTaskFinished = true;
    Task_MysteryGift(runtime, taskId);
    data.state = MG_STATE_CLIENT_RESULT_MSG;
    data.isWonderNews = true;
    data.sourceIsFriend = true;
    data.msgId = CLI_MSG_NEWS_RECEIVED;
    data.textState = 0;
    Task_MysteryGift(runtime, taskId);
    data.var = 240;
    Task_MysteryGift(runtime, taskId);
    Task_MysteryGift(runtime, taskId);
    expect(runtime.wonderNewsRewards).toContain(WONDER_NEWS_RECV_FRIEND);
    expect(data.state).toBe(MG_STATE_SAVE_LOAD_GIFT);

    expect(GetClientResultMessage(false, false, CLI_MSG_CARD_RECEIVED)).toEqual({ successMsg: true, msg: gText_WonderCardReceived });
    expect(GetClientResultMessage(false, true, CLI_MSG_CARD_RECEIVED)).toEqual({ successMsg: true, msg: gText_WonderCardReceivedFrom });
    expect(GetClientResultMessage(true, false, CLI_MSG_CANT_ACCEPT)).toEqual({ successMsg: false, msg: gText_CantAcceptNewsFromTrainer });
    expect(GetClientResultMessage(false, false, CLI_MSG_BUFFER_SUCCESS)).toEqual({ successMsg: true, msg: null });
  });

  test('loaded gift input, receive/send/toss selection, toss confirmations, and clear/save paths are preserved', () => {
    const { runtime, taskId, data } = createTaskRuntime();
    data.state = MG_STATE_LOAD_GIFT;
    data.isWonderNews = false;
    expect(HandleLoadWonderCardOrNews(runtime, data, false)).toBe(false);
    expect(HandleLoadWonderCardOrNews(runtime, data, false)).toBe(true);
    data.state = MG_STATE_HANDLE_GIFT_INPUT;
    runtime.pressedButtons = A_BUTTON;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_HANDLE_GIFT_SELECT);

    runtime.listMenuInputs.push(0);
    Task_MysteryGift(runtime, taskId);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_RECEIVE);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SOURCE_PROMPT);

    data.state = MG_STATE_HANDLE_GIFT_SELECT;
    runtime.listMenuInputs.push(1);
    Task_MysteryGift(runtime, taskId);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SEND);
    Task_MysteryGift(runtime, taskId);
    expect(data.sourceIsFriend).toBe(true);
    expect(data.state).toBe(MG_STATE_SERVER_LINK_WAIT);

    data.state = MG_STATE_HANDLE_GIFT_SELECT;
    runtime.listMenuInputs.push(2);
    Task_MysteryGift(runtime, taskId);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_ASK_TOSS);
    runtime.savedWonderCardGiftNotReceived = true;
    DoMysteryGiftYesNo(runtime, data, true, gText_IfThrowAwayCardEventWontHappen);
    DoMysteryGiftYesNo(runtime, data, true, gText_IfThrowAwayCardEventWontHappen);
    runtime.yesNoInputs.push(0);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_ASK_TOSS_UNRECEIVED);
    DoMysteryGiftYesNo(runtime, data, true, '');
    DoMysteryGiftYesNo(runtime, data, true, '');
    runtime.yesNoInputs.push(0);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_TOSS);

    Task_MysteryGift(runtime, taskId);
    expect(runtime.clearedCard).toBe(true);
    expect(data.state).toBe(MG_STATE_TOSS_SAVE);

    data.textState = 0;
    for (let i = 0; i < 4; i++) {
      if (i === 3) runtime.pressedButtons = A_BUTTON;
      Task_MysteryGift(runtime, taskId);
    }
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(26);
    expect(PrintThrownAway(runtime, data, false)).toBe(false);
  });

  test('server link path and result handling match send flow including Wonder News reward save', () => {
    const { runtime, taskId, data } = createTaskRuntime();
    data.state = MG_STATE_SERVER_LINK_WAIT;
    runtime.gSpecialVar_Result = LINKUP_FAILED;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_LOAD_GIFT);

    data.state = MG_STATE_SERVER_LINK_WAIT;
    runtime.gSpecialVar_Result = 0;
    runtime.gReceivedRemoteLinkPlayers = true;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SERVER_LINK_START);

    data.isWonderNews = true;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_SERVER_LINK);
    expect(runtime.textWindowMessages.at(-1)).toContain('WONDER NEWS');

    runtime.serverRunReturns.push({ ret: SVR_RET_END, endVal: SVR_MSG_NEWS_SENT });
    Task_MysteryGift(runtime, taskId);
    expect(data.msgId).toBe(SVR_MSG_NEWS_SENT);
    expect(data.state).toBe(MG_STATE_SERVER_LINK_END);

    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(34);
    runtime.linkRfuTaskFinished = true;
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(35);

    data.sourceIsFriend = true;
    Task_MysteryGift(runtime, taskId);
    data.var = 240;
    Task_MysteryGift(runtime, taskId);
    Task_MysteryGift(runtime, taskId);
    expect(runtime.wonderNewsRewards).toContain(WONDER_NEWS_SENT);
    expect(data.state).toBe(MG_STATE_SAVE_LOAD_GIFT);
    expect(GetServerResultMessage(SVR_MSG_NEWS_SENT)).toEqual({ wonderSuccess: true, msg: gText_WonderNewsSentTo });
  });

  test('non-success client/server messages return to main menu and exit destroys task', () => {
    const { runtime, taskId, data } = createTaskRuntime();
    data.state = MG_STATE_CLIENT_RESULT_MSG;
    data.msgId = 5;
    Task_MysteryGift(runtime, taskId);
    runtime.pressedButtons = A_BUTTON;
    Task_MysteryGift(runtime, taskId);
    Task_MysteryGift(runtime, taskId);
    expect(runtime.textWindowMessages).toContain(gText_AlreadyHadCard);
    expect(data.state).toBe(MG_STATE_TO_MAIN_MENU);

    data.state = MG_STATE_EXIT;
    Task_MysteryGift(runtime, taskId);
    expect(runtime.tasks[0]?.destroyed).toBe(true);
    expect(runtime.mainCallback).toBe('MainCB_FreeAllBuffersAndReturnToInitTitleScreen');
  });

  test('cancel source prompt returns to loaded gift if valid otherwise top menu', () => {
    const { runtime, taskId, data } = createTaskRuntime();
    data.state = MG_STATE_SOURCE_PROMPT_INPUT;
    data.isWonderNews = true;
    runtime.validateWonderNews = true;
    runtime.listMenuInputs.push(LIST_CANCEL);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_LOAD_GIFT);

    data.state = MG_STATE_SOURCE_PROMPT_INPUT;
    runtime.validateWonderNews = false;
    runtime.listMenuInputs.push(LIST_CANCEL);
    Task_MysteryGift(runtime, taskId);
    expect(data.state).toBe(MG_STATE_TO_MAIN_MENU);
  });
});
