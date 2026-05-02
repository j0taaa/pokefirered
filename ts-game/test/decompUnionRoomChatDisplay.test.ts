import { describe, expect, test } from 'vitest';
import {
  CHATDISPLAYROUTINE_ASKOVERWRITESAVE,
  CHATDISPLAYROUTINE_CURSORBLINK,
  CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO,
  CHATDISPLAYROUTINE_LOADGFX,
  CHATDISPLAYROUTINE_PRINTLEADERLEFT,
  CHATDISPLAYROUTINE_PRINTMSG,
  CHATDISPLAYROUTINE_PRINTREGISTERWHERE,
  CHATDISPLAYROUTINE_PRINTSAVEDTHEGAME,
  CHATDISPLAYROUTINE_SCROLLCHAT,
  CHATDISPLAYROUTINE_SHOWKBSWAPMENU,
  CHATDISPLAYROUTINE_SHOWQUITCHATTINGDIALOG,
  COPYWIN_FULL,
  DisplaySubtask_CancelRegister,
  DisplaySubtask_LoadGfx,
  DisplaySubtask_PrintRegisterWhere,
  DisplaySubtask_ReturnToKeyboard,
  DisplaySubtask_ScrollChat,
  DisplaySubtask_SwitchPages,
  GetCurrentKeyboardPage,
  HideStdMessageWindow,
  PIXEL_FILL,
  PlaceStdMessageWindow,
  PrintCurrentKeyboardPage,
  PrintOnWin1Parameterized,
  RunDisplaySubtask,
  STDMESSAGE_ASK_SAVE,
  STDMESSAGE_INPUT_TEXT,
  STDMESSAGE_LEADER_LEFT,
  STDMESSAGE_QUIT_CHATTING,
  TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY,
  TEXT_COLOR_WHITE,
  UNION_ROOM_KB_PAGE_COUNT,
  UNION_ROOM_KB_PAGE_EMOJI,
  UnionRoomChat_FreeGraphicsWork,
  UnionRoomChat_ProcessInput,
  UnionRoomChat_ResetDisplaySubtasks,
  UnionRoomChat_RunDisplaySubtask0,
  UnionRoomChat_RunDisplaySubtasks,
  UnionRoomChat_StartDisplaySubtask,
  UnionRoomChat_TryAllocGraphicsWork,
  createUnionRoomChatDisplayRuntime,
  sMessageWindowInfo
} from '../src/game/decompUnionRoomChatDisplay';

const runUntilInactive = (runtime: ReturnType<typeof createUnionRoomChatDisplayRuntime>, slot = 0, limit = 40) => {
  for (let i = 0; i < limit && RunDisplaySubtask(runtime, slot); i++) {
    UnionRoomChat_RunDisplaySubtasks(runtime);
  }
};

describe('decomp union_room_chat_display', () => {
  test('allocates graphics work, initializes subtasks, and frees like the C setup path', () => {
    const runtime = createUnionRoomChatDisplayRuntime();
    expect(UnionRoomChat_TryAllocGraphicsWork(runtime)).toBe(true);
    expect(runtime.sWork).toMatchObject({ yesNoMenuWinId: 0xff, messageWindowId: 0xff, curLine: 0 });
    expect(runtime.operations).toContain('ResetBgsAndClearDma3BusyFlags:0');
    expect(runtime.operations).toContain('InitBgsFromTemplates:4');
    expect(runtime.operations).toContain('ScanlineEffect_SetParams');
    expect(RunDisplaySubtask(runtime, 0)).toBe(true);
    expect(UnionRoomChat_RunDisplaySubtask0(runtime)).toBe(true);
    expect(runtime.sWork?.subtasks[0]).toMatchObject({ callback: 'DisplaySubtask_LoadGfx', active: true, state: 0 });

    UnionRoomChat_ResetDisplaySubtasks(runtime);
    expect(runtime.sWork?.subtasks.every((task) => !task.active && task.callback === 'DisplaySubtaskDummy')).toBe(true);
    UnionRoomChat_FreeGraphicsWork(runtime);
    expect(runtime.sWork).toBeNull();
    expect(runtime.scanlineEffect.state).toBe(3);
    expect(runtime.operations).toContain('FreeAllWindowBuffers');
  });

  test('load-gfx subtask walks every numbered C state and creates sprite UI at state 6', () => {
    const runtime = createUnionRoomChatDisplayRuntime();
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    const state = { value: 0 };
    for (let i = 0; i <= 6; i++) {
      expect(DisplaySubtask_LoadGfx(runtime, state)).toBe(true);
    }
    expect(state.value).toBe(7);
    expect(runtime.operations).toContain('SetBgTilemapBuffer:0:bg0Buffer');
    expect(runtime.operations).toContain('CopyBgTilemapBufferToVram:1');
    expect(runtime.operations).toContain(`CopyWindowToVram:0:${COPYWIN_FULL}`);
    expect(runtime.objects.work?.selectorCursorSprite).not.toBeNull();
    expect(runtime.objects.work?.textEntryCursorSprite).not.toBeNull();
    expect(runtime.objects.work?.rButtonSprite).not.toBeNull();
    expect(DisplaySubtask_LoadGfx(runtime, state)).toBe(false);
  });

  test('start/run display subtask dispatches mapped callbacks and preserves unknown callbacks as inactive dummy', () => {
    const runtime = createUnionRoomChatDisplayRuntime();
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SHOWKBSWAPMENU, 1);
    expect(runtime.sWork?.subtasks[1]).toMatchObject({ callback: 'DisplaySubtask_PrintWin3', active: true, state: 0 });
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(runtime.operations).toContain('DrawTextBorderOuter:3:1:13');
    expect(runtime.sWork?.subtasks[1].state).toBe(1);

    UnionRoomChat_StartDisplaySubtask(runtime, 999, 2);
    expect(runtime.sWork?.subtasks[2]).toMatchObject({ callback: 'DisplaySubtaskDummy', active: false, state: 0 });
  });

  test('standard and yes/no message windows use exact templates, bg offsets, borders, and placeholder expansion', () => {
    const runtime = createUnionRoomChatDisplayRuntime({ disbandedPlayerName: 'LEADER' });
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    PlaceStdMessageWindow(runtime, STDMESSAGE_QUIT_CHATTING, 16);
    const normal = runtime.windows.at(-1)!;
    expect(normal.template).toMatchObject({ tilemapLeft: 8, tilemapTop: 16, width: 21, height: 4, baseBlock: 0x06a });
    expect(runtime.bgY[0]).toBe(16 * 256);
    expect(runtime.operations).toContain(`DrawTextBorderInner:${normal.id}:10:2`);

    PlaceStdMessageWindow(runtime, STDMESSAGE_ASK_SAVE, 0);
    const wide = runtime.windows.at(-1)!;
    expect(wide.template).toMatchObject({ tilemapLeft: 1, width: 28 });
    expect(runtime.operations).toContain(`DrawTextBorderOuter:${wide.id}:10:2`);

    PlaceStdMessageWindow(runtime, STDMESSAGE_LEADER_LEFT, 0);
    expect(runtime.sWork?.expandedPlaceholdersBuffer).toBe('gText_LeaderHasLeftEndingChat:{expanded}');
    HideStdMessageWindow(runtime);
    expect(runtime.bgY[0]).toBe(0);
  });

  test('quit dialog and hide dialog subtasks create, hide, and destroy both message and yes/no windows', () => {
    const runtime = createUnionRoomChatDisplayRuntime();
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_SHOWQUITCHATTINGDIALOG, 0);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(runtime.sWork?.messageWindowId).not.toBe(0xff);
    expect(runtime.sWork?.yesNoMenuWinId).not.toBe(0xff);
    expect(runtime.windows.at(-1)?.template).toMatchObject({ tilemapLeft: 23, tilemapTop: 11, width: 6, height: 4 });

    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_DESTROYSTDMSGANDYESNO, 0);
    runUntilInactive(runtime);
    expect(runtime.sWork?.messageWindowId).toBe(0xff);
    expect(runtime.sWork?.yesNoMenuWinId).toBe(0xff);
    expect(runtime.removedWindows.length).toBeGreaterThanOrEqual(2);
  });

  test('message-buffer and register subtasks redraw win1 and wait on DMA like the C routines', () => {
    const runtime = createUnionRoomChatDisplayRuntime({
      messageEntryBuffer: 'HELLOWORLD',
      messageEntryCursorPosition: 5,
      bufferSelectionRegion: { start: 2, length: 3 },
      dmaBusyResults: [true, false, false, false, false]
    });
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTMSG, 0);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(runtime.operations).toContain(`FillWindowPixelRect:1:${PIXEL_FILL(0)}:16,1,24,14`);
    expect(runtime.operations.some((op) => op.includes('HELLOWORLD'))).toBe(true);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(RunDisplaySubtask(runtime, 0)).toBe(true);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(RunDisplaySubtask(runtime, 0)).toBe(false);

    const state = { value: 0 };
    expect(DisplaySubtask_PrintRegisterWhere(runtime, state)).toBe(true);
    expect(runtime.operations.some((op) => op.includes('WORLD'))).toBe(true);
    DisplaySubtask_PrintRegisterWhere(runtime, state);
    DisplaySubtask_PrintRegisterWhere(runtime, state);
    expect(runtime.objects.paletteLoads.at(-1)).toMatchObject({ sourceOffset: 3, size: 2 });

    const cancelState = { value: 0 };
    expect(DisplaySubtask_CancelRegister(runtime, cancelState)).toBe(true);
    DisplaySubtask_CancelRegister(runtime, cancelState);
    DisplaySubtask_CancelRegister(runtime, cancelState);
    expect(runtime.objects.paletteLoads.at(-1)).toMatchObject({ sourceOffset: 1, size: 2 });
  });

  test('keyboard-page rendering handles normal, emoji, and registered text truncation branches', () => {
    const runtime = createUnionRoomChatDisplayRuntime();
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    runtime.currentKeyboardPage = UNION_ROOM_KB_PAGE_EMOJI;
    PrintCurrentKeyboardPage(runtime);
    expect(GetCurrentKeyboardPage(runtime)).toBe(UNION_ROOM_KB_PAGE_EMOJI);
    expect(runtime.operations.some((op) => op.includes('EMOJI_MISCHIEVOUS') && op.includes(':6,0'))).toBe(true);

    runtime.operations.length = 0;
    runtime.currentKeyboardPage = UNION_ROOM_KB_PAGE_COUNT;
    runtime.registeredTexts[0] = 'A very very long registered phrase';
    PrintCurrentKeyboardPage(runtime);
    expect(runtime.operations.some((op) => op.includes('AddTextPrinterParameterized3:2:A ') && op.includes(':4,0'))).toBe(true);
    expect(runtime.operations.some((op) => op.includes('AddTextPrinterParameterized3:2:...:39,0'))).toBe(true);
  });

  test('switch-pages subtask animates bg1 right, redraws page, animates left, then restores cursor and icon', () => {
    const runtime = createUnionRoomChatDisplayRuntime({ currentKeyboardPage: 1, cursorCol: 2, cursorRow: 3 });
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    for (let i = 0; i <= 6; i++) DisplaySubtask_LoadGfx(runtime, { value: i });
    runtime.sWork!.bg1hofs = 0;
    const state = { value: 0 };
    let guard = 0;
    while (DisplaySubtask_SwitchPages(runtime, state) && guard++ < 30) {
      if (state.value === 1) runtime.dmaBusyResults.push(false);
    }
    expect(state.value).toBe(2);
    expect(runtime.sWork?.bg1hofs).toBe(0);
    expect(runtime.objects.work?.selectorCursorSprite?.invisible).toBe(false);
    expect(runtime.objects.work?.selectorCursorSprite).toMatchObject({ x: 26, y: 60 });
  });

  test('scroll chat prints until line 9 then scrolls the window exactly three times', () => {
    const runtime = createUnionRoomChatDisplayRuntime({ lastReceivedMessage: 'hello', receivedPlayerIndex: 2 });
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    const first = { value: 0 };
    expect(DisplaySubtask_ScrollChat(runtime, first)).toBe(true);
    expect(DisplaySubtask_ScrollChat(runtime, first)).toBe(false);
    expect(runtime.sWork?.curLine).toBe(1);

    runtime.sWork!.curLine = 9;
    const scroll = { value: 0 };
    let active = true;
    let guard = 0;
    while (active && guard++ < 10) active = DisplaySubtask_ScrollChat(runtime, scroll);
    expect(runtime.sWork?.scrollCount).toBe(3);
    expect(runtime.operations.filter((op) => op.startsWith('ScrollWindow:0:0:5')).length).toBe(3);
  });

  test('single-purpose subtasks cover return, blink, leader-left, save prompts, saved, and input processing', () => {
    const runtime = createUnionRoomChatDisplayRuntime({ playerName: 'RED', disbandedPlayerName: 'BLUE', menuInputResults: [1, -1] });
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    for (let i = 0; i <= 6; i++) DisplaySubtask_LoadGfx(runtime, { value: i });

    const ret = { value: 0 };
    expect(DisplaySubtask_ReturnToKeyboard(runtime, ret)).toBe(true);
    expect(DisplaySubtask_ReturnToKeyboard(runtime, ret)).toBe(false);

    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_CURSORBLINK, 0);
    runUntilInactive(runtime, 0, 8);
    expect(runtime.objects.work?.selectorCursorSprite?.anim).toBe(0);

    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTLEADERLEFT, 0);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(runtime.operations).toContain('DynamicPlaceholderTextUtil_SetPlaceholderPtr:0:BLUE');

    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_ASKOVERWRITESAVE, 0);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(runtime.windows.at(-1)?.template).toMatchObject({ tilemapLeft: 23, tilemapTop: 10 });

    UnionRoomChat_StartDisplaySubtask(runtime, CHATDISPLAYROUTINE_PRINTSAVEDTHEGAME, 0);
    UnionRoomChat_RunDisplaySubtasks(runtime);
    expect(runtime.operations).toContain('DynamicPlaceholderTextUtil_SetPlaceholderPtr:0:RED');

    expect(UnionRoomChat_ProcessInput(runtime)).toBe(1);
    expect(UnionRoomChat_ProcessInput(runtime)).toBe(-1);
  });

  test('low-level win1 print helper preserves color triplets and fill-before-print rule', () => {
    const runtime = createUnionRoomChatDisplayRuntime({ messageEntryCursorPosition: 6 });
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    PrintOnWin1Parameterized(runtime, 2, 'TEXT', TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY);
    expect(runtime.operations).toContain(`FillWindowPixelRect:1:${TEXT_COLOR_LIGHT_GRAY}:16,1,32,14`);
    expect(runtime.operations.some((op) => op.includes('TEXT') && op.endsWith('0/1/2'))).toBe(true);
    expect(sMessageWindowInfo[STDMESSAGE_INPUT_TEXT].text).toBe('gText_InputText');
  });

  test('running declared routines by id reaches expected C callback names', () => {
    const runtime = createUnionRoomChatDisplayRuntime();
    UnionRoomChat_TryAllocGraphicsWork(runtime);
    const routines = [
      [CHATDISPLAYROUTINE_LOADGFX, 'DisplaySubtask_LoadGfx'],
      [CHATDISPLAYROUTINE_SCROLLCHAT, 'DisplaySubtask_ScrollChat'],
      [CHATDISPLAYROUTINE_PRINTREGISTERWHERE, 'DisplaySubtask_PrintRegisterWhere']
    ] as const;
    for (const [routine, callback] of routines) {
      UnionRoomChat_StartDisplaySubtask(runtime, routine, 0);
      expect(runtime.sWork?.subtasks[0].callback).toBe(callback);
    }
  });
});
