import { describe, expect, test } from 'vitest';
import {
  A_BUTTON,
  B_BUTTON,
  BG_COORD_ADD,
  BG_COORD_SUB,
  BG_COORD_SET,
  COPYWIN_FULL,
  DISPCNT_WIN0_ON,
  DPAD_DOWN,
  DPAD_UP,
  NEWS_INPUT_A,
  NEWS_INPUT_B,
  NEWS_INPUT_NONE,
  NEWS_INPUT_SCROLL_DOWN,
  NEWS_INPUT_SCROLL_UP,
  NUM_WONDER_BGS,
  TASK_NONE,
  BufferNewsText,
  DrawNewsWindows,
  UpdateNewsScroll,
  WIN_BODY,
  WIN_TITLE,
  WONDER_NEWS_TEXT_LENGTH,
  WonderNews_AddScrollIndicatorArrowPair,
  WonderNews_Destroy,
  WonderNews_Enter,
  WonderNews_Exit,
  WonderNews_GetInput,
  WonderNews_Init,
  WonderNews_RemoveScrollIndicatorArrowPair,
  bufferNewsText,
  createWonderNews,
  createWonderNewsRuntime,
  drawNewsWindows,
  sArrowsTemplate,
  sNewsGraphics,
  sWindowTemplates,
  updateNewsScroll,
  wonderNewsAddScrollIndicatorArrowPair,
  wonderNewsDestroy,
  wonderNewsEnter,
  wonderNewsExit,
  wonderNewsGetInput,
  wonderNewsInit,
  wonderNewsRemoveScrollIndicatorArrowPair
} from '../src/game/decompMysteryGiftShowNews';

describe('decomp mystery_gift_show_news', () => {
  test('WonderNews_Init rejects NULL/allocation failure and clamps invalid bgType to 0', () => {
    const runtime = createWonderNewsRuntime();

    expect(wonderNewsInit(runtime, null)).toBe(false);
    runtime.allocFails = true;
    expect(wonderNewsInit(runtime, createWonderNews())).toBe(false);

    runtime.allocFails = false;
    expect(wonderNewsInit(runtime, createWonderNews({ bgType: NUM_WONDER_BGS + 4 }))).toBe(true);
    expect(runtime.data?.news.bgType).toBe(0);
    expect(runtime.data?.gfx).toBe(sNewsGraphics[0]);
    expect(runtime.data?.arrowTaskId).toBe(TASK_NONE);
  });

  test('WonderNews_Destroy clears the static allocation slot', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews({ bgType: 6 }));

    wonderNewsDestroy(runtime);

    expect(runtime.data).toBeNull();
    expect(wonderNewsEnter(runtime)).toBe(-1);
    expect(wonderNewsExit(runtime, false)).toBe(-1);
  });

  test('BufferNewsText copies exactly 40 chars, terminates strings, and computes scrollEnd from lines 8 and 9', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews({
      titleText: 'T'.repeat(WONDER_NEWS_TEXT_LENGTH + 5),
      bodyText: ['', '', '', '', '', '', '', '', 'line eight', 'line nine']
    }));

    bufferNewsText(runtime);

    expect(runtime.data?.titleText).toBe('T'.repeat(WONDER_NEWS_TEXT_LENGTH));
    expect(runtime.data?.bodyText[8]).toBe('line eight');
    expect(runtime.data?.bodyText[9]).toBe('line nine');
    expect(runtime.data?.scrollEnd).toBe(2);
    expect(runtime.data?.arrowsTemplate).toEqual({ ...sArrowsTemplate, fullyDownThreshold: 2 });
  });

  test('DrawNewsWindows writes title/body windows with centered title, 16px body spacing, and full VRAM copies', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews({
      bgType: 1,
      titleText: 'NEWS',
      bodyText: ['a', 'b', 'c']
    }));
    runtime.data!.windowIds[WIN_TITLE] = 3;
    runtime.data!.windowIds[WIN_BODY] = 4;
    bufferNewsText(runtime);

    drawNewsWindows(runtime);

    expect(runtime.textPrinters[0]).toMatchObject({ windowId: 3, x: 96, y: 6, text: 'NEWS' });
    expect(runtime.textPrinters.slice(1).map((printer) => printer.y)).toEqual([2, 18, 34, 50, 66, 82, 98, 114, 130, 146]);
    expect(runtime.textPrinters[1]).toMatchObject({ windowId: 4, text: 'a' });
    expect(runtime.copiedWindows).toEqual([{ windowId: 3, mode: COPYWIN_FULL }, { windowId: 4, mode: COPYWIN_FULL }]);
  });

  test('WonderNews_Enter runs the decomp enter state machine and respects busy fade/temp-buffer waits', () => {
    const runtime = createWonderNewsRuntime();
    runtime.paletteFadeBusyQueue = [true, false, false];
    runtime.tempTileDataBusyQueue = [true, false];
    wonderNewsInit(runtime, createWonderNews({ bgType: 7, titleText: 'Hello' }));

    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(2);
    expect(runtime.bgY).toMatchObject({ 0: 0, 1: 0, 2: 0, 3: 0 });
    expect(runtime.gpuRegs.REG_OFFSET_DISPCNT & DISPCNT_WIN0_ON).toBe(DISPCNT_WIN0_ON);

    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.data?.windowIds).toEqual([0, 1]);
    expect(runtime.windows.get(0)).toEqual(sWindowTemplates[WIN_TITLE]);
    expect(runtime.windows.get(1)).toEqual(sWindowTemplates[WIN_BODY]);

    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(3);
    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(true);

    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.data?.titleText).toBe('Hello');
    expect(wonderNewsEnter(runtime)).toBe(0);
    expect(runtime.textPrinters).toHaveLength(11);
    expect(wonderNewsEnter(runtime)).toBe(0);
    expect([...runtime.shownBgs]).toEqual([1, 2, 3]);
    expect(runtime.paletteFade.bufferTransferDisabled).toBe(false);
    expect(runtime.data?.arrowTaskId).toBe(1);

    expect(wonderNewsEnter(runtime)).toBe(1);
    expect(runtime.data?.enterExitState).toBe(0);

    expect(runtime.operations.some((entry) => entry.op === 'DecompressAndCopyTileDataToVram' && entry.args[1] === 'sNews7Gfx')).toBe(true);
    expect(runtime.operations.some((entry) => entry.op === 'LoadPalette' && entry.args[0] === 'sNews7Pal')).toBe(true);
  });

  test('WonderNews_Exit runs the exit state machine, removes windows/arrows, redraws menu, and resets state after fade', () => {
    const runtime = createWonderNewsRuntime();
    runtime.paletteFadeBusyQueue = [true, false, false];
    wonderNewsInit(runtime, createWonderNews());
    runtime.data!.windowIds[WIN_TITLE] = 5;
    runtime.data!.windowIds[WIN_BODY] = 6;
    runtime.data!.arrowTaskId = 9;
    runtime.windows.set(5, sWindowTemplates[WIN_TITLE]);
    runtime.windows.set(6, sWindowTemplates[WIN_BODY]);
    runtime.gpuRegs.REG_OFFSET_DISPCNT = DISPCNT_WIN0_ON;
    runtime.giftIsFromEReader = true;

    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(runtime.bgY[2]).toBe(0);
    expect(runtime.gpuRegs.REG_OFFSET_DISPCNT & DISPCNT_WIN0_ON).toBe(0);

    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect([...runtime.hiddenBgs]).toEqual([1, 2]);
    expect(runtime.removedWindows).toEqual([6, 5]);

    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(runtime.bgY[3]).toBe(0);
    expect(runtime.removedArrowTaskIds).toEqual([9]);
    expect(runtime.data?.arrowTaskId).toBe(TASK_NONE);

    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(runtime.operations.at(-1)).toEqual({ op: 'PrintMysteryGiftOrEReaderTopMenu', args: [true, true] });

    expect(wonderNewsExit(runtime, true)).toBe(0);
    expect(runtime.operations.some((entry) => entry.op === 'MG_DrawCheckerboardPattern')).toBe(true);

    expect(wonderNewsExit(runtime, true)).toBe(1);
    expect(runtime.data?.enterExitState).toBe(0);
  });

  test('scroll indicator helpers exactly follow verticalScrollDisabled and TASK_NONE guards', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews());
    runtime.data!.arrowTaskId = 7;

    wonderNewsRemoveScrollIndicatorArrowPair(runtime);
    expect(runtime.removedArrowTaskIds).toEqual([7]);
    expect(runtime.data?.arrowTaskId).toBe(TASK_NONE);
    expect(runtime.data?.verticalScrollDisabled).toBe(true);

    wonderNewsRemoveScrollIndicatorArrowPair(runtime);
    expect(runtime.removedArrowTaskIds).toEqual([7]);

    wonderNewsAddScrollIndicatorArrowPair(runtime);
    expect(runtime.data?.arrowTaskId).toBe(1);
    expect(runtime.data?.verticalScrollDisabled).toBe(false);

    wonderNewsAddScrollIndicatorArrowPair(runtime);
    expect(runtime.data?.arrowTaskId).toBe(1);
  });

  test('WonderNews_GetInput returns buttons, rejects blocked scrolls, and initializes one-tile scrolls', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews());
    runtime.data!.scrollEnd = 2;

    expect(wonderNewsGetInput(runtime, A_BUTTON)).toBe(NEWS_INPUT_A);
    expect(wonderNewsGetInput(runtime, B_BUTTON)).toBe(NEWS_INPUT_B);
    expect(wonderNewsGetInput(runtime, DPAD_UP)).toBe(NEWS_INPUT_NONE);
    expect(wonderNewsGetInput(runtime, DPAD_DOWN)).toBe(NEWS_INPUT_SCROLL_DOWN);
    expect(runtime.data).toMatchObject({ scrolling: true, scrollingDown: true, scrollIncrement: 2, scrollTotal: 0 });

    expect(wonderNewsGetInput(runtime, A_BUTTON)).toBe(NEWS_INPUT_NONE);
    for (let i = 0; i < 7; i += 1) {
      expect(wonderNewsGetInput(runtime, A_BUTTON)).toBe(NEWS_INPUT_NONE);
    }
    expect(runtime.data).toMatchObject({ scrolling: false, scrollOffset: 1, scrollTotal: 0 });
    expect(runtime.bgY[2]).toBe(4096);
    expect(runtime.operations.some((entry) => entry.op === 'ChangeBgY' && entry.args[2] === BG_COORD_ADD)).toBe(true);

    expect(wonderNewsGetInput(runtime, DPAD_UP)).toBe(NEWS_INPUT_SCROLL_UP);
    for (let i = 0; i < 8; i += 1) {
      wonderNewsGetInput(runtime, 0);
    }
    expect(runtime.data?.scrollOffset).toBe(0);
    expect(runtime.bgY[2]).toBe(0);
    expect(runtime.operations.some((entry) => entry.op === 'ChangeBgY' && entry.args[2] === BG_COORD_SUB)).toBe(true);
  });

  test('UpdateNewsScroll can be driven directly and changes BG2/BG3 by scrollIncrement * 256', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews());
    runtime.data!.scrolling = true;
    runtime.data!.scrollingDown = true;
    runtime.data!.scrollIncrement = 2;

    updateNewsScroll(runtime);

    expect(runtime.bgY[2]).toBe(512);
    expect(runtime.bgY[3]).toBe(512);
    expect(runtime.operations.at(-2)).toEqual({ op: 'ChangeBgY', args: [2, 512, BG_COORD_ADD] });
  });

  test('disabled vertical scrolling and fully-down threshold return NEWS_INPUT_NONE', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews());
    runtime.data!.scrollEnd = 1;
    runtime.data!.scrollOffset = 1;
    expect(wonderNewsGetInput(runtime, DPAD_DOWN)).toBe(NEWS_INPUT_NONE);

    runtime.data!.scrollOffset = 0;
    runtime.data!.verticalScrollDisabled = true;
    expect(wonderNewsGetInput(runtime, DPAD_DOWN)).toBe(NEWS_INPUT_NONE);
    runtime.data!.scrollOffset = 1;
    expect(wonderNewsGetInput(runtime, DPAD_UP)).toBe(NEWS_INPUT_NONE);
  });

  test('enter and exit use BG_COORD_SET for reset operations', () => {
    const runtime = createWonderNewsRuntime();
    wonderNewsInit(runtime, createWonderNews());
    runtime.paletteFadeBusyQueue = [false];
    runtime.data!.enterExitState = 1;
    wonderNewsEnter(runtime);
    expect(runtime.operations.some((entry) => entry.op === 'ChangeBgY' && entry.args[2] === BG_COORD_SET)).toBe(true);
  });

  test('exact C-name WonderNews exports preserve init, enter, draw, scroll, input, exit, and destroy logic', () => {
    const runtime = createWonderNewsRuntime();

    expect(WonderNews_Init(runtime, createWonderNews({
      bgType: NUM_WONDER_BGS + 1,
      titleText: 'C NEWS',
      bodyText: ['', '', '', '', '', '', '', '', 'line 8', 'line 9']
    }))).toBe(true);
    expect(runtime.data?.news.bgType).toBe(0);

    BufferNewsText(runtime);
    expect(runtime.data?.scrollEnd).toBe(2);
    expect(runtime.data?.arrowsTemplate.fullyDownThreshold).toBe(2);

    runtime.data!.windowIds[WIN_TITLE] = 8;
    runtime.data!.windowIds[WIN_BODY] = 9;
    DrawNewsWindows(runtime);
    expect(runtime.textPrinters[0]).toMatchObject({ windowId: 8, y: 6, text: 'C NEWS' });
    expect(runtime.textPrinters.at(-1)).toMatchObject({ windowId: 9, y: 146, text: 'line 9' });

    runtime.data!.verticalScrollDisabled = true;
    WonderNews_AddScrollIndicatorArrowPair(runtime);
    expect(runtime.data?.verticalScrollDisabled).toBe(false);
    expect(runtime.data?.arrowTaskId).toBe(1);
    WonderNews_RemoveScrollIndicatorArrowPair(runtime);
    expect(runtime.data?.verticalScrollDisabled).toBe(true);
    expect(runtime.removedArrowTaskIds).toEqual([1]);

    runtime.data!.verticalScrollDisabled = false;
    expect(WonderNews_GetInput(runtime, DPAD_DOWN)).toBe(NEWS_INPUT_SCROLL_DOWN);
    UpdateNewsScroll(runtime);
    expect(runtime.bgY[2]).toBe(512);

    runtime.paletteFadeBusyQueue = [false];
    runtime.data!.enterExitState = 0;
    expect(WonderNews_Enter(runtime)).toBe(0);
    expect(runtime.data?.enterExitState).toBe(1);
    WonderNews_Enter(runtime);
    expect(runtime.gpuRegs.REG_OFFSET_DISPCNT & DISPCNT_WIN0_ON).toBe(DISPCNT_WIN0_ON);

    runtime.data!.enterExitState = 0;
    expect(WonderNews_Exit(runtime, true)).toBe(0);
    runtime.paletteFadeBusyQueue = [false];
    WonderNews_Exit(runtime, true);
    expect(runtime.gpuRegs.REG_OFFSET_WIN0H).toBe(0);

    WonderNews_Destroy(runtime);
    expect(runtime.data).toBeNull();
  });
});
