import { describe, expect, test } from 'vitest';
import { createItemRuntime, GetPcItemQuantity, ITEM_NONE, ITEM_POTION } from '../src/game/decompItem';
import {
  A_BUTTON,
  B_BUTTON,
  BedroomPC,
  CB2_ReturnFromDepositMenu,
  CB2_ReturnFromWithdrawMenu,
  CB2_ReturnToMailbox,
  CB2_ReturnToMailboxPc_UpdateScrollVariables,
  CB2_SetCbToReturnToMailbox,
  CountPCMail,
  DPAD_DOWN,
  DPAD_UP,
  HELPCONTEXT_BEDROOM_PC_ITEMS,
  HELPCONTEXT_BEDROOM_PC_MAILBOX,
  HELPCONTEXT_PLAYERS_PC_ITEMS,
  HELPCONTEXT_PLAYERS_PC_MAILBOX,
  LIST_CANCEL,
  LIST_NOTHING_CHOSEN,
  MENU_B_PRESSED,
  MENU_NOTHING_CHOSEN,
  Mailbox_ReturnToMailListAfterDeposit,
  NewGameInitPCItems,
  PCMailCompaction,
  PC_MAIL_NUM,
  PlayerPC,
  RunPlayerPcTask,
  Task_CreateItemStorageSubmenu,
  Task_MoveToBagYesNoMenuHandleInput,
  Task_PlayerPcGiveMailToMon,
  Task_SetPageItemVars,
  Task_TopMenu_ItemStorageSubmenu_HandleInput,
  createPlayerPcRuntime
} from '../src/game/decompPlayerPc';

const makeRuntime = () => createPlayerPcRuntime(createItemRuntime());

const putMail = (runtime: ReturnType<typeof makeRuntime>, slot: number, itemId: number, playerName = 'RED'): void => {
  runtime.gSaveBlock1Ptr.mail[slot] = { itemId, playerName, words: [1, 2, 3] };
};

describe('decomp player_pc.c parity', () => {
  test('NewGameInitPCItems clears PC item slots and loads the potion sentinel list', () => {
    const runtime = makeRuntime();
    runtime.gSaveBlock1Ptr.pcItems[0].itemId = 99;
    runtime.gSaveBlock1Ptr.pcItems[0].quantity = 99;

    NewGameInitPCItems(runtime);

    expect(runtime.gSaveBlock1Ptr.pcItems[0].itemId).toBe(ITEM_POTION);
    expect(GetPcItemQuantity(runtime, runtime.gSaveBlock1Ptr.pcItems[0])).toBe(1);
    expect(runtime.gSaveBlock1Ptr.pcItems[1].itemId).toBe(ITEM_NONE);
  });

  test('BedroomPC and PlayerPC set room flag, item order, and top menu task', () => {
    const bedroom = makeRuntime();
    const bedroomTask = BedroomPC(bedroom);
    expect(bedroom.gPlayerPcMenuManager.notInRoom).toBe(false);
    expect(bedroom.sItemOrder).toEqual([0, 1, 2]);
    expect(bedroom.tasks[bedroomTask]?.func).toBe('Task_DrawPlayerPcTopMenu');

    const player = makeRuntime();
    const playerTask = PlayerPC(player);
    expect(player.gPlayerPcMenuManager.notInRoom).toBe(true);
    expect(player.tasks[playerTask]?.func).toBe('Task_DrawPlayerPcTopMenu');
  });

  test('top menu draw/input routes B to turn off and selections through item order', () => {
    const runtime = makeRuntime();
    const taskId = PlayerPC(runtime);
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_TopMenuHandleInput');

    runtime.menuInputQueue.push(MENU_NOTHING_CHOSEN);
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_TopMenuHandleInput');

    runtime.menuInputQueue.push(0);
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_PlayerPcItemStorage');

    const cancelRuntime = makeRuntime();
    const cancelTask = BedroomPC(cancelRuntime);
    RunPlayerPcTask(cancelRuntime, cancelTask);
    cancelRuntime.menuInputQueue.push(MENU_B_PRESSED);
    RunPlayerPcTask(cancelRuntime, cancelTask);
    expect(cancelRuntime.tasks[cancelTask]?.func).toBe('Task_PlayerPcTurnOff');
    RunPlayerPcTask(cancelRuntime, cancelTask);
    expect(cancelRuntime.setupScript).toBe('EventScript_PalletTown_PlayersHouse_2F_ShutDownPC');
    expect(cancelRuntime.tasks[cancelTask]).toBeNull();
  });

  test('item storage submenu updates help context, cursor descriptions, and A/B routing', () => {
    const runtime = makeRuntime();
    const taskId = PlayerPC(runtime);
    runtime.gPlayerPcMenuManager.notInRoom = true;
    Task_CreateItemStorageSubmenu(runtime, taskId, 0);
    expect(runtime.helpContext).toBe(HELPCONTEXT_PLAYERS_PC_ITEMS);

    runtime.joyRepeat = DPAD_DOWN;
    Task_TopMenu_ItemStorageSubmenu_HandleInput(runtime, taskId);
    expect(runtime.menuCursorPos).toBe(1);
    runtime.joyRepeat = DPAD_UP;
    Task_TopMenu_ItemStorageSubmenu_HandleInput(runtime, taskId);
    expect(runtime.menuCursorPos).toBe(0);

    runtime.joyRepeat = 0;
    runtime.joyNew = A_BUTTON;
    NewGameInitPCItems(runtime);
    Task_TopMenu_ItemStorageSubmenu_HandleInput(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_WithdrawItemBeginFade');

    const bRuntime = makeRuntime();
    const bTask = PlayerPC(bRuntime);
    Task_CreateItemStorageSubmenu(bRuntime, bTask, 0);
    bRuntime.joyNew = B_BUTTON;
    Task_TopMenu_ItemStorageSubmenu_HandleInput(bRuntime, bTask);
    expect(bRuntime.tasks[bTask]?.func).toBe('Task_DrawPlayerPcTopMenu');
  });

  test('deposit and withdraw paths wait for fade before entering bag/item storage', () => {
    const runtime = makeRuntime();
    const taskId = PlayerPC(runtime);
    RunPlayerPcTask(runtime, taskId, 'Task_PlayerPcDepositItem');
    expect(runtime.tasks[taskId]?.func).toBe('Task_DepositItem_WaitFadeAndGoToBag');
    runtime.gPaletteFade.active = false;
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.gFieldCallback).toBe('CB2_ReturnFromDepositMenu');
    expect(runtime.operations).toContain('GoToBagMenu:3:0:CB2_ReturnToField');
    expect(runtime.tasks[taskId]).toBeNull();

    const returnedDeposit = CB2_ReturnFromDepositMenu(runtime);
    expect(runtime.tasks[returnedDeposit]?.func).toBe('Task_ReturnToItemStorageSubmenu');
    expect(runtime.menuCursorPos).toBe(1);

    const withdraw = makeRuntime();
    const withdrawTask = PlayerPC(withdraw);
    NewGameInitPCItems(withdraw);
    RunPlayerPcTask(withdraw, withdrawTask, 'Task_PlayerPcWithdrawItem');
    expect(withdraw.tasks[withdrawTask]?.func).toBe('Task_WithdrawItemBeginFade');
    expect(withdraw.gFieldCallback).toBe('CB2_ReturnFromWithdrawMenu');
    RunPlayerPcTask(withdraw, withdrawTask);
    withdraw.gPaletteFade.active = false;
    RunPlayerPcTask(withdraw, withdrawTask);
    expect(withdraw.operations).toContain('ItemPc_Init:0:CB2_ReturnToField');
    expect(withdraw.tasks[withdrawTask]).toBeNull();
    expect(withdraw.tasks[CB2_ReturnFromWithdrawMenu(withdraw)]?.func).toBe('Task_ReturnToItemStorageSubmenu');
  });

  test('page variables, PC mail count, and compaction preserve the C nested swap behavior', () => {
    const runtime = makeRuntime();
    putMail(runtime, PC_MAIL_NUM(0), ITEM_NONE);
    putMail(runtime, PC_MAIL_NUM(1), 121, 'ONE');
    putMail(runtime, PC_MAIL_NUM(2), ITEM_NONE);
    putMail(runtime, PC_MAIL_NUM(3), 122, 'TWO');

    expect(CountPCMail(runtime)).toBe(2);
    PCMailCompaction(runtime);
    expect(runtime.gSaveBlock1Ptr.mail[PC_MAIL_NUM(0)].playerName).toBe('ONE');
    expect(runtime.gSaveBlock1Ptr.mail[PC_MAIL_NUM(1)].playerName).toBe('TWO');

    const taskId = PlayerPC(runtime);
    runtime.tasks[taskId]!.data[2] = 9;
    runtime.gPlayerPcMenuManager.count = 7;
    Task_SetPageItemVars(runtime, taskId);
    expect(runtime.tasks[taskId]?.data[4]).toBe(8);
    expect(runtime.gPlayerPcMenuManager.pageItems).toBe(8);
  });

  test('mailbox empty/nonempty branches initialize buffers, help context, and list input routing', () => {
    const empty = makeRuntime();
    const emptyTask = PlayerPC(empty);
    RunPlayerPcTask(empty, emptyTask, 'Task_PlayerPcMailbox');
    expect(empty.tasks[emptyTask]?.func).toBe('Task_ReturnToTopMenu');

    const runtime = makeRuntime();
    putMail(runtime, PC_MAIL_NUM(0), 121, 'RED');
    const taskId = BedroomPC(runtime);
    RunPlayerPcTask(runtime, taskId, 'Task_PlayerPcMailbox');
    expect(runtime.helpContext).toBe(HELPCONTEXT_BEDROOM_PC_MAILBOX);
    expect(runtime.tasks[taskId]?.func).toBe('Task_MailboxPcHandleInput');

    runtime.listMenuInputQueue.push(LIST_NOTHING_CHOSEN);
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_MailboxPcHandleInput');
    runtime.listMenuInputQueue.push(0);
    runtime.listMenuScrollRows.push({ cursorPos: 0, itemsAbove: 0 });
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_PrintWhatToDoWithSelectedMail');

    const cancel = makeRuntime();
    putMail(cancel, PC_MAIL_NUM(0), 121, 'RED');
    const cancelTask = PlayerPC(cancel);
    RunPlayerPcTask(cancel, cancelTask, 'Task_PlayerPcMailbox');
    cancel.listMenuInputQueue.push(LIST_CANCEL);
    RunPlayerPcTask(cancel, cancelTask);
    expect(cancel.tasks[cancelTask]?.func).toBe('Task_DrawPlayerPcTopMenu');
  });

  test('selected mail prompt trims long names or applies Japanese conversion to short names', () => {
    const runtime = makeRuntime();
    putMail(runtime, PC_MAIL_NUM(0), 121, 'RED');
    const taskId = PlayerPC(runtime);
    runtime.gPlayerPcMenuManager.count = 1;
    RunPlayerPcTask(runtime, taskId, 'Task_PrintWhatToDoWithSelectedMail');
    expect(runtime.operations.at(-1)).toContain("RED<JP>'s mail");

    const longName = makeRuntime();
    putMail(longName, PC_MAIL_NUM(0), 121, `GREEN\0\0`);
    const longTask = PlayerPC(longName);
    longName.gPlayerPcMenuManager.count = 1;
    RunPlayerPcTask(longName, longTask, 'Task_PrintWhatToDoWithSelectedMail');
    expect(longName.operations.at(-1)).toContain("GREEN's mail");
  });

  test('mail submenu read and callbacks return through field callback exactly like C', () => {
    const runtime = makeRuntime();
    putMail(runtime, PC_MAIL_NUM(0), 121, 'RED');
    const taskId = PlayerPC(runtime);
    runtime.gPlayerPcMenuManager.count = 1;
    RunPlayerPcTask(runtime, taskId, 'Task_PlayerPcReadMail');
    expect(runtime.tasks[taskId]?.func).toBe('Task_WaitFadeAndReadSelectedMail');
    runtime.gPaletteFade.active = false;
    RunPlayerPcTask(runtime, taskId);
    expect(runtime.operations).toContain('ReadMail:121:CB2_SetCbToReturnToMailbox:1');
    expect(runtime.tasks[taskId]).toBeNull();

    CB2_SetCbToReturnToMailbox(runtime);
    expect(runtime.gFieldCallback).toBe('CB2_ReturnToMailbox');
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');

    const returnTask = CB2_ReturnToMailbox(runtime);
    expect(runtime.tasks[returnTask]?.func).toBe('Task_WaitFadeAndReturnToMailboxPcInputHandler');
    RunPlayerPcTask(runtime, returnTask);
    expect(runtime.tasks[returnTask]?.func).toBe('Task_MailboxPcHandleInput');
  });

  test('move mail to bag handles full bag failure, success compaction, and declined yes/no', () => {
    const runtime = makeRuntime();
    putMail(runtime, PC_MAIL_NUM(0), 121, 'RED');
    runtime.gPlayerPcMenuManager.count = 1;
    runtime.gPlayerPcMenuManager.pageItems = 2;
    runtime.gPlayerPcMenuManager.cursorPos = 0;
    const taskId = PlayerPC(runtime);

    RunPlayerPcTask(runtime, taskId, 'Task_PlayerPcMoveMailToBag');
    expect(runtime.tasks[taskId]?.func).toBe('Task_DrawYesNoMenuToConfirmMoveToBag');
    RunPlayerPcTask(runtime, taskId);
    runtime.yesNoInputQueue.push(0);
    Task_MoveToBagYesNoMenuHandleInput(runtime, taskId);
    expect(runtime.gPlayerPcMenuManager.count).toBe(0);
    expect(runtime.gSaveBlock1Ptr.mail[PC_MAIL_NUM(0)].itemId).toBe(ITEM_NONE);
    expect(runtime.tasks[taskId]?.func).toBe('Task_PlayerPcExitMailSubmenu');

    const declined = makeRuntime();
    const declinedTask = PlayerPC(declined);
    declined.yesNoInputQueue.push(MENU_B_PRESSED);
    Task_MoveToBagYesNoMenuHandleInput(declined, declinedTask);
    expect(declined.tasks[declinedTask]?.func).toBe('Task_RedrawPlayerPcMailboxAndSetUpInputHandler');
  });

  test('give mail to mon and mailbox-return-after-deposit callbacks preserve scroll adjustment', () => {
    const runtime = makeRuntime();
    const taskId = PlayerPC(runtime);
    runtime.partyCount = 0;
    Task_PlayerPcGiveMailToMon(runtime, taskId);
    expect(runtime.tasks[taskId]?.func).toBe('Task_PlayerPcExitMailSubmenu');

    const withParty = makeRuntime();
    const withPartyTask = PlayerPC(withParty);
    withParty.partyCount = 1;
    Task_PlayerPcGiveMailToMon(withParty, withPartyTask);
    expect(withParty.tasks[withPartyTask]?.func).toBe('Task_WaitFadeAndGoToPartyMenu');
    withParty.gPaletteFade.active = false;
    RunPlayerPcTask(withParty, withPartyTask);
    expect(withParty.operations).toContain('ChooseMonToGiveMailFromMailbox');
    expect(withParty.tasks[withPartyTask]).toBeNull();

    const returned = makeRuntime();
    putMail(returned, PC_MAIL_NUM(0), 121, 'ONE');
    returned.gPlayerPcMenuManager.count = 2;
    returned.gPlayerPcMenuManager.pageItems = 2;
    returned.gPlayerPcMenuManager.cursorPos = 1;
    returned.gPlayerPcMenuManager.notInRoom = true;
    const returnTask = CB2_ReturnToMailboxPc_UpdateScrollVariables(returned);
    expect(returned.helpContext).toBe(HELPCONTEXT_PLAYERS_PC_MAILBOX);
    expect(returned.gPlayerPcMenuManager.count).toBe(1);
    expect(returned.gPlayerPcMenuManager.cursorPos).toBe(0);
    expect(returned.tasks[returnTask]?.func).toBe('Task_WaitFadeAndReturnToMailboxPcInputHandler');

    Mailbox_ReturnToMailListAfterDeposit(returned);
    expect(returned.gFieldCallback).toBe('CB2_ReturnToMailboxPc_UpdateScrollVariables');
    expect(returned.mainCallback2).toBe('CB2_ReturnToField');
  });

  test('player-room turn off enables script context and item submenu bedroom help context is used', () => {
    const runtime = makeRuntime();
    const taskId = PlayerPC(runtime);
    RunPlayerPcTask(runtime, taskId, 'Task_PlayerPcTurnOff');
    expect(runtime.scriptContextEnabled).toBe(true);
    expect(runtime.tasks[taskId]).toBeNull();

    const bedroom = makeRuntime();
    const bedroomTask = BedroomPC(bedroom);
    Task_CreateItemStorageSubmenu(bedroom, bedroomTask, 0);
    expect(bedroom.helpContext).toBe(HELPCONTEXT_BEDROOM_PC_ITEMS);
  });
});
