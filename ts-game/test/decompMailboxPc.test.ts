import { describe, expect, test } from 'vitest';
import {
  ItemPrintFunc,
  MAILBOX_PC_CANCEL_INDEX,
  MAILBOX_PC_CANCEL_LABEL,
  MAILBOX_PC_TEXT_COLOR,
  MAILBOX_PC_WINDOW_TEMPLATES,
  MailboxPC_AddScrollIndicatorArrows,
  MailboxPC_DestroyListMenuBuffer,
  MailboxPC_GetAddWindow,
  MailboxPC_GetWindowId,
  MailboxPC_InitBuffers,
  MailboxPC_InitListMenu,
  MailboxPC_RemoveWindow,
  MoveCursorFunc,
  type MailboxPcItemPageStruct,
  createMailboxPcState,
  mailboxPcAddScrollIndicatorArrows,
  mailboxPcDestroyListMenuBuffer,
  mailboxPcGetAddWindow,
  mailboxPcGetWindowId,
  mailboxPcInitBuffers,
  mailboxPcInitListMenu,
  mailboxPcMoveCursorFunc,
  mailboxPcRemoveWindow
} from '../src/game/decompMailboxPc';

describe('decompMailboxPc', () => {
  test('ports window templates and text color constants exactly', () => {
    expect(MAILBOX_PC_WINDOW_TEMPLATES).toEqual([
      { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 2, paletteNum: 15, baseBlock: 0x008 },
      { bg: 0, tilemapLeft: 19, tilemapTop: 1, width: 10, height: 18, paletteNum: 15, baseBlock: 0x01c },
      { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 15, height: 8, paletteNum: 15, baseBlock: 0x01c }
    ]);
    expect(MAILBOX_PC_TEXT_COLOR).toEqual([1, 2, 3]);
  });

  test('MailboxPC_InitBuffers resets window ids and allocates count + cancel list items', () => {
    const state = createMailboxPcState();
    state.windowIds = [1, 2, 3];

    expect(mailboxPcInitBuffers(state, 3)).toBe(true);

    expect(state.windowIds).toEqual([0xff, 0xff, 0xff]);
    expect(state.listMenuItems).toHaveLength(4);
  });

  test('MailboxPC_GetAddWindow lazily creates stable window ids and remove resets the slot', () => {
    const state = createMailboxPcState();

    expect(mailboxPcGetAddWindow(state, 1)).toBe(0);
    expect(mailboxPcGetAddWindow(state, 1)).toBe(0);
    expect(mailboxPcGetWindowId(state, 1)).toBe(0);
    expect(mailboxPcGetAddWindow(state, 2)).toBe(1);

    mailboxPcRemoveWindow(state, 1);

    expect(mailboxPcGetWindowId(state, 1)).toBe(0xff);
  });

  test('MailboxPC_InitListMenu builds dummy mail rows plus the cancel row and menu template fields', () => {
    const state = createMailboxPcState();
    mailboxPcInitBuffers(state, 2);
    state.windowIds[1] = 9;

    const cursor = mailboxPcInitListMenu(state, {
      count: 2,
      cursorPos: 1,
      itemsAbove: 3,
      pageItems: 8
    });

    expect(cursor).toBe(1);
    expect(state.listMenuItems?.slice(0, 3)).toEqual([
      { label: '', index: 0 },
      { label: '', index: 1 },
      { label: MAILBOX_PC_CANCEL_LABEL, index: MAILBOX_PC_CANCEL_INDEX }
    ]);
    expect(state.lastListMenuTemplate).toMatchObject({
      totalItems: 3,
      windowId: 9,
      header_X: 0,
      item_X: 8,
      cursor_X: 0,
      lettersSpacing: 0,
      itemVerticalPadding: 2,
      maxShowed: 8,
      fontId: 1,
      upText_Y: 10,
      cursorPal: 2,
      fillValue: 1,
      cursorShadowPal: 3,
      moveCursorFunc: 'MoveCursorFunc',
      itemPrintFunc: 'ItemPrintFunc',
      cursorKind: 0,
      scrollMultiple: 0,
      cursorPos: 1,
      itemsAbove: 3
    });
  });

  test('MoveCursorFunc plays select only after initialization and list buffer can be destroyed', () => {
    const state = createMailboxPcState();
    mailboxPcInitBuffers(state, 1);

    mailboxPcMoveCursorFunc(state, true);
    mailboxPcMoveCursorFunc(state, false);

    expect(state.playedSelectSeCount).toBe(1);
    mailboxPcDestroyListMenuBuffer(state);
    expect(state.listMenuItems).toBeNull();
  });

  test('MailboxPC_AddScrollIndicatorArrows keeps the decomp max calculation and id assignment', () => {
    const page: MailboxPcItemPageStruct = {
      count: 12,
      cursorPos: 2,
      itemsAbove: 0,
      pageItems: 8
    };

    expect(mailboxPcAddScrollIndicatorArrows(page)).toBe(5);
    expect(page.scrollIndicatorId).toBe(110);
  });

  test('exact C-name mailbox helpers preserve window, list, cursor, print, and cleanup behavior', () => {
    const state = createMailboxPcState();
    state.windowIds = [1, 2, 3];
    expect(MailboxPC_InitBuffers(state, 2)).toBe(true);
    expect(state.windowIds).toEqual([0xff, 0xff, 0xff]);
    expect(state.listMenuItems).toHaveLength(3);

    expect(MailboxPC_GetAddWindow(state, 1)).toBe(0);
    expect(MailboxPC_GetAddWindow(state, 1)).toBe(0);
    expect(MailboxPC_GetWindowId(state, 1)).toBe(0);
    MailboxPC_RemoveWindow(state, 1);
    expect(MailboxPC_GetWindowId(state, 1)).toBe(0xff);

    state.windowIds[1] = 7;
    const page: MailboxPcItemPageStruct = { count: 2, cursorPos: 1, itemsAbove: 4, pageItems: 8 };
    expect(MailboxPC_InitListMenu(state, page)).toBe(1);
    expect(state.listMenuItems?.slice(0, 3)).toEqual([
      { label: '', index: 0 },
      { label: '', index: 1 },
      { label: MAILBOX_PC_CANCEL_LABEL, index: MAILBOX_PC_CANCEL_INDEX }
    ]);
    expect(state.lastListMenuTemplate).toMatchObject({
      totalItems: 3,
      windowId: 7,
      moveCursorFunc: 'MoveCursorFunc',
      itemPrintFunc: 'ItemPrintFunc',
      cursorPos: 1,
      itemsAbove: 4
    });

    MoveCursorFunc(state, 0, true);
    MoveCursorFunc(state, 1, false);
    expect(state.playedSelectSeCount).toBe(1);

    state.mailPlayerNames = ['RED', 'GREEN'];
    ItemPrintFunc(state, 9, 1, 12);
    ItemPrintFunc(state, 9, MAILBOX_PC_CANCEL_INDEX, 20);
    expect(state.printedText).toEqual([{ windowId: 9, x: 8, y: 12, text: 'GREEN' }]);

    expect(MailboxPC_AddScrollIndicatorArrows(page)).toBe(-5);
    expect(page.scrollIndicatorId).toBe(110);
    MailboxPC_DestroyListMenuBuffer(state);
    expect(state.listMenuItems).toBeNull();
  });
});
