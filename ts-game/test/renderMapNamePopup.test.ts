import { describe, expect, test } from 'vitest';
import {
  FLOOR_ROOFTOP,
  WIN_PAL_NUM,
  FONT_NORMAL,
  TEXT_SKIP_DRAW,
  CHAR_SPACE,
  CHAR_B,
  CHAR_F,
  createMapNamePopupRuntime,
  showMapNamePopup,
  taskMapNamePopup,
  dismissMapNamePopup,
  isMapNamePopupTaskActive,
  mapNamePopupCreateWindow,
  mapNamePopupAppendFloorNum,
  mapNamePopupPrintMapNameOnWindow
} from '../src/rendering/decompMapNamePopup';

describe('map name popup rendering parity', () => {
  test('constants match decomp values', () => {
    expect(FLOOR_ROOFTOP).toBe(127);
    expect(WIN_PAL_NUM).toBe(13);
    expect(FONT_NORMAL).toBe(2);
    expect(TEXT_SKIP_DRAW).toBe(0xff);
    expect(CHAR_SPACE).toBe(' ');
    expect(CHAR_B).toBe('B');
    expect(CHAR_F).toBe('F');
  });

  test('createMapNamePopupRuntime initializes all fields', () => {
    const runtime = createMapNamePopupRuntime();
    expect(runtime.flagDontShowMapNamePopup).toBe(false);
    expect(runtime.questLogPlaybackState).toBe(false);
    expect(runtime.tasks).toEqual([]);
    expect(runtime.bgXChanges).toEqual([]);
    expect(runtime.bgYChanges).toEqual([]);
    expect(runtime.gpuRegBG0VOFS).toEqual([]);
    expect(runtime.dma3Busy).toBe(false);
    expect(runtime.nextWindowId).toBe(0);
    expect(runtime.windows).toEqual([]);
    expect(runtime.mapNames[0]).toBe('PALLET TOWN');
  });

  test('showMapNamePopup creates task and sets BG scroll offsets', () => {
    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, false);

    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.tasks[0]!.data[0]).toBe(0);
    expect(runtime.bgXChanges).toEqual([{ bg: 0, value: 0x0000, op: 0 }]);
    expect(runtime.bgYChanges).toEqual([{ bg: 0, value: -0x1081, op: 0 }]);
  });

  test('showMapNamePopup with existing task updates state to re-show', () => {
    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, false);
    showMapNamePopup(runtime, true);

    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.tasks[0]!.data[0]).toBe(4);
    expect(runtime.tasks[0]!.data[3]).toBe(1);
  });

  test('showMapNamePopup is suppressed when flag is set', () => {
    const runtime = createMapNamePopupRuntime();
    runtime.flagDontShowMapNamePopup = true;
    showMapNamePopup(runtime, false);

    expect(runtime.tasks).toHaveLength(0);
  });

  test('showMapNamePopup is suppressed during quest log playback', () => {
    const runtime = createMapNamePopupRuntime();
    runtime.questLogPlaybackState = true;
    showMapNamePopup(runtime, false);

    expect(runtime.tasks).toHaveLength(0);
  });

  test('taskMapNamePopup state machine progresses through states', () => {
    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, false);
    const taskId = 0;

    expect(runtime.tasks[taskId]!.data[0]).toBe(0);

    taskMapNamePopup(runtime, taskId);
    expect(runtime.tasks[taskId]!.data[0]).toBe(1);
    expect(runtime.windows).toHaveLength(1);

    runtime.dma3Busy = true;
    taskMapNamePopup(runtime, taskId);
    expect(runtime.tasks[taskId]!.data[0]).toBe(1);

    runtime.dma3Busy = false;
    taskMapNamePopup(runtime, taskId);
    expect(runtime.tasks[taskId]!.data[0]).toBe(1);
    expect(runtime.tasks[taskId]!.data[2]).toBe(-2);
  });

  test('dismissMapNamePopup transitions active task to state 6', () => {
    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, false);
    const taskId = 0;

    taskMapNamePopup(runtime, taskId);
    expect(runtime.tasks[taskId]!.data[0]).toBe(1);

    dismissMapNamePopup(runtime);
    expect(runtime.tasks[taskId]!.data[0]).toBe(6);
  });

  test('isMapNamePopupTaskActive returns correct state', () => {
    const runtime = createMapNamePopupRuntime();
    expect(isMapNamePopupTaskActive(runtime)).toBe(false);

    showMapNamePopup(runtime, false);
    expect(isMapNamePopupTaskActive(runtime)).toBe(true);

    dismissMapNamePopup(runtime);
    expect(isMapNamePopupTaskActive(runtime)).toBe(true);
  });

  test('mapNamePopupCreateWindow creates window with correct template', () => {
    const runtime = createMapNamePopupRuntime();
    const windowId = mapNamePopupCreateWindow(runtime, false);

    expect(windowId).toBe(0);
    expect(runtime.windows[0]!.template).toEqual({
      bg: 0,
      tilemapLeft: 1,
      tilemapTop: 29,
      width: 14,
      height: 2,
      paletteNum: WIN_PAL_NUM,
      baseBlock: 0x001
    });
    expect(runtime.loadedStdWindowTiles).toEqual([{ windowId: 0, tileNum: 0x01d }]);
    expect(runtime.drawnTextBorders).toEqual([{ windowId: 0, tileNum: 0x01d, palNum: WIN_PAL_NUM }]);
  });

  test('mapNamePopupCreateWindow widens window for floor numbers', () => {
    const runtime = createMapNamePopupRuntime();
    runtime.mapHeader.floorNum = 3;

    mapNamePopupCreateWindow(runtime, false);
    expect(runtime.windows[0]!.template.width).toBe(19);
    expect(runtime.loadedStdWindowTiles[0]!.tileNum).toBe(0x027);
  });

  test('mapNamePopupCreateWindow widens window for rooftop', () => {
    const runtime = createMapNamePopupRuntime();
    runtime.mapHeader.floorNum = FLOOR_ROOFTOP;

    mapNamePopupCreateWindow(runtime, false);
    expect(runtime.windows[0]!.template.width).toBe(22);
    expect(runtime.loadedStdWindowTiles[0]!.tileNum).toBe(0x02d);
  });

  test('mapNamePopupAppendFloorNum formats floor numbers correctly', () => {
    expect(mapNamePopupAppendFloorNum('PALLET TOWN', 0)).toBe('PALLET TOWN');
    expect(mapNamePopupAppendFloorNum('CELADON CITY', 3)).toBe('CELADON CITY 3F');
    expect(mapNamePopupAppendFloorNum('SILPH CO.', -1)).toBe('SILPH CO. B1F');
    expect(mapNamePopupAppendFloorNum('ROOFTOP', FLOOR_ROOFTOP)).toBe('ROOFTOP ROOFTOP');
    expect(mapNamePopupAppendFloorNum('BUILDING', -2)).toBe('BUILDING B2F');
  });

  test('mapNamePopupPrintMapNameOnWindow centers text and records print', () => {
    const runtime = createMapNamePopupRuntime();
    runtime.mapNames[0] = 'PALLET TOWN';

    mapNamePopupPrintMapNameOnWindow(runtime, 0);
    expect(runtime.printedText).toHaveLength(1);
    expect(runtime.printedText[0]!.windowId).toBe(0);
    expect(runtime.printedText[0]!.text).toBe('PALLET TOWN');
    expect(runtime.printedText[0]!.y).toBe(2);
    expect(runtime.printedText[0]!.speed).toBe(TEXT_SKIP_DRAW);
  });
});