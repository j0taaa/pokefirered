import { describe, expect, test } from 'vitest';
import {
  COPYWIN_FULL,
  COPYWIN_GFX,
  COPYWIN_MAP,
  FLOOR_ROOFTOP,
  createMapNamePopupRuntime,
  dismissMapNamePopup,
  isMapNamePopupTaskActive,
  mapNamePopupAppendFloorNum,
  mapNamePopupCreateWindow,
  showMapNamePopup,
  taskMapNamePopup
} from '../src/rendering/decompMapNamePopup';

describe('decompMapNamePopup', () => {
  test('ShowMapNamePopup respects flag/playback guards and initializes a new task', () => {
    const guarded = createMapNamePopupRuntime();
    guarded.flagDontShowMapNamePopup = true;
    showMapNamePopup(guarded, false);
    expect(guarded.tasks).toHaveLength(0);

    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, true);
    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.bgXChanges).toEqual([{ bg: 0, value: 0, op: 0 }]);
    expect(runtime.bgYChanges).toEqual([{ bg: 0, value: -0x1081, op: 0 }]);
    expect(runtime.tasks[0].data[8]).toBe(1);
    expect(isMapNamePopupTaskActive(runtime)).toBe(true);
  });

  test('window creation expands for floors, loads palette path, prints centered name, and copies full window', () => {
    const runtime = createMapNamePopupRuntime();
    runtime.mapHeader.floorNum = -2;
    runtime.mapNames[0] = 'ROCK TUNNEL';
    const windowId = mapNamePopupCreateWindow(runtime, false);

    expect(runtime.windows[0].template.width).toBe(19);
    expect(runtime.copiedPaletteIntoUnfaded).toEqual([true]);
    expect(runtime.loadedStdWindowTiles).toEqual([{ windowId, tileNum: 0x027 }]);
    expect(runtime.printedText.at(-1)).toEqual({
      windowId,
      text: 'ROCK TUNNEL B2F',
      x: 16,
      y: 2,
      speed: 0xff
    });
    expect(runtime.copiedWindows.at(-1)).toEqual({ windowId, mode: COPYWIN_FULL });

    expect(mapNamePopupAppendFloorNum('CELADON', 0)).toBe('CELADON');
    expect(mapNamePopupAppendFloorNum('MART', FLOOR_ROOFTOP)).toBe('MART ROOFTOP');
    expect(mapNamePopupAppendFloorNum('CAVE', -1)).toBe('CAVE B1F');
  });

  test('Task_MapNamePopup follows slide-in, hold, slide-out, clear, remove, and destroy states', () => {
    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, false);
    taskMapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data[5]).toBe(1);

    runtime.dma3Busy = true;
    taskMapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[2]).toBe(0);
    runtime.dma3Busy = false;
    for (let i = 0; i < 12; i += 1) {
      taskMapNamePopup(runtime, 0);
    }
    expect(runtime.tasks[0].data[0]).toBe(3);
    expect(runtime.tasks[0].data[2]).toBe(-24);

    runtime.tasks[0].data[1] = 120;
    taskMapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(4);

    for (let i = 0; i < 12; i += 1) {
      taskMapNamePopup(runtime, 0);
    }
    expect(runtime.tasks[0].data[0]).toBe(6);

    taskMapNamePopup(runtime, 0);
    expect(runtime.rboxFilled).toEqual([0]);
    expect(runtime.copiedWindows.at(-1)).toEqual({ windowId: 0, mode: COPYWIN_MAP });
    expect(runtime.tasks[0].data[0]).toBe(7);

    taskMapNamePopup(runtime, 0);
    expect(runtime.windows[0].removed).toBe(true);
    expect(runtime.bgYChanges.at(-1)).toEqual({ bg: 0, value: 0, op: 0 });
    expect(runtime.tasks[0].data[0]).toBe(8);

    taskMapNamePopup(runtime, 0);
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(isMapNamePopupTaskActive(runtime)).toBe(false);
  });

  test('reshow and dismiss paths mutate an active task like the C code', () => {
    const runtime = createMapNamePopupRuntime();
    showMapNamePopup(runtime, false);
    taskMapNamePopup(runtime, 0);
    runtime.tasks[0].data[0] = 3;

    showMapNamePopup(runtime, false);
    expect(runtime.tasks[0].data[0]).toBe(4);
    expect(runtime.tasks[0].data[3]).toBe(1);
    runtime.tasks[0].data[2] = 0;
    taskMapNamePopup(runtime, 0);
    expect(runtime.copiedWindows.at(-1)).toEqual({ windowId: 0, mode: COPYWIN_GFX });
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data[3]).toBe(0);

    dismissMapNamePopup(runtime);
    expect(runtime.tasks[0].data[0]).toBe(6);
  });
});
