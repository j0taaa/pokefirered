import { describe, expect, it } from 'vitest';
import {
  EnterHallOfFame,
  FLAG_ENABLE_SHIP_BIRTH_ISLAND,
  FLAG_ENABLE_SHIP_NAVEL_ROCK,
  FLAG_RECEIVED_AURORA_TICKET,
  FLAG_RECEIVED_MYSTIC_TICKET,
  FLAG_SYS_GAME_CLEAR,
  FLAG_SYS_RIBBON_GET,
  GAME_STAT_FIRST_HOF_PLAY_TIME,
  GAME_STAT_RECEIVED_RIBBONS,
  HEAL_LOCATION_PALLET_TOWN,
  ITEM_AURORA_TICKET,
  ITEM_MYSTIC_TICKET,
  SetCB2WhiteOut,
  createPostBattleRuntime
} from '../src/game/decompPostBattleEventFuncs';
import {
  CreateHelpMessageWindow,
  DestroyHelpMessageWindow,
  DrawHelpMessageWindowTilesById,
  MapNamePopupWindowIdSetDummy,
  PrintTextOnHelpMessageWindow,
  WINDOW_NONE,
  createHelpMessageRuntime
} from '../src/game/decompHelpMessage';
import {
  DismissMapNamePopup,
  FLOOR_ROOFTOP,
  FLAG_DONT_SHOW_MAP_NAME_POPUP,
  IsMapNamePopupTaskActive,
  MapNamePopupAppendFloorNum,
  MapNamePopupCreateWindow,
  ShowMapNamePopup,
  Task_MapNamePopup,
  createMapNamePopupRuntime
} from '../src/game/decompMapNamePopup';

describe('small checked C ports with missing game-facing modules', () => {
  it('ports post_battle_event_funcs Hall of Fame and whiteout callbacks 1:1', () => {
    const runtime = createPostBattleRuntime({
      playTimeHours: 12,
      playTimeMinutes: 34,
      playTimeSeconds: 56,
      revision: 0xa,
      playerParty: [
        { hasSpecies: true, isEgg: false, championRibbon: false, hp: 1, maxHp: 50, status: 'poison' },
        { hasSpecies: true, isEgg: true, championRibbon: false, hp: 2, maxHp: 40, status: 'burn' },
        { hasSpecies: false, isEgg: false, championRibbon: false, hp: 0, maxHp: 0, status: 'none' }
      ]
    });

    expect(EnterHallOfFame(runtime)).toBe(false);
    expect(runtime.playerParty[0]).toMatchObject({ championRibbon: true, hp: 50, status: 'none' });
    expect(runtime.playerParty[1]).toMatchObject({ championRibbon: false, hp: 40, status: 'none' });
    expect(runtime.flags.has(FLAG_SYS_GAME_CLEAR)).toBe(true);
    expect(runtime.flags.has(FLAG_SYS_RIBBON_GET)).toBe(true);
    expect(runtime.gameStats[GAME_STAT_FIRST_HOF_PLAY_TIME]).toBe((12 << 16) | (34 << 8) | 56);
    expect(runtime.gameStats[GAME_STAT_RECEIVED_RIBBONS]).toBe(1);
    expect(runtime.continueGameWarpStatus).toBe(true);
    expect(runtime.continueGameWarpHealLocation).toBe(HEAL_LOCATION_PALLET_TOWN);
    expect(runtime.mainCallback2).toBe('CB2_DoHallOfFameScreen');
    expect(runtime.bag[ITEM_AURORA_TICKET]).toBe(1);
    expect(runtime.bag[ITEM_MYSTIC_TICKET]).toBe(1);
    expect(runtime.flags.has(FLAG_ENABLE_SHIP_BIRTH_ISLAND)).toBe(true);
    expect(runtime.flags.has(FLAG_RECEIVED_AURORA_TICKET)).toBe(true);
    expect(runtime.flags.has(FLAG_ENABLE_SHIP_NAVEL_ROCK)).toBe(true);
    expect(runtime.flags.has(FLAG_RECEIVED_MYSTIC_TICKET)).toBe(true);

    expect(SetCB2WhiteOut(runtime)).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_WhiteOut');
  });

  it('ports help_message window creation, tile drawing, printing, and teardown', () => {
    const runtime = createHelpMessageRuntime();

    MapNamePopupWindowIdSetDummy(runtime);
    expect(runtime.sHelpMessageWindowId).toBe(WINDOW_NONE);

    const windowId = CreateHelpMessageWindow(runtime);
    expect(windowId).toBe(0);
    expect(CreateHelpMessageWindow(runtime)).toBe(0);

    DrawHelpMessageWindowTilesById(runtime, windowId);
    expect(runtime.windows[windowId].tilesDrawn.slice(0, 30).every((tile) => tile === 0)).toBe(true);
    expect(runtime.windows[windowId].tilesDrawn.slice(30, 120).every((tile) => tile === 5)).toBe(true);
    expect(runtime.windows[windowId].tilesDrawn.slice(120).every((tile) => tile === 14)).toBe(true);

    PrintTextOnHelpMessageWindow(runtime, 'Choose a command.', 2);
    expect(runtime.windows[windowId].text).toBe('Choose a command.');
    expect(runtime.operations).toContain('CopyWindowToVram:0:2');

    DestroyHelpMessageWindow(runtime, 1);
    expect(runtime.windows[windowId].removed).toBe(true);
    expect(runtime.sHelpMessageWindowId).toBe(WINDOW_NONE);
  });

  it('ports map_name_popup window sizing, floor suffixes, task show, reshow, dismiss, and destroy flow', () => {
    const runtime = createMapNamePopupRuntime({
      regionMapSectionId: 3,
      floorNum: -2,
      mapNames: { 3: 'ROCK TUNNEL' }
    });

    expect(MapNamePopupAppendFloorNum('CELADON DEPT.', FLOOR_ROOFTOP)).toBe('CELADON DEPT. ROOFTOP');
    const windowId = MapNamePopupCreateWindow(runtime, false);
    expect(runtime.windows[windowId]).toMatchObject({ width: 19, tileNum: 0x027, text: 'ROCK TUNNEL B2F' });

    ShowMapNamePopup(runtime, true);
    expect(IsMapNamePopupTaskActive(runtime)).toBe(true);
    Task_MapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[4]).toBe(1);
    expect(runtime.windows[1]).toMatchObject({ paletteIntoFadedBuffer: true, text: 'ROCK TUNNEL B2F' });

    for (let i = 0; i < 12; i += 1) Task_MapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(3);
    runtime.tasks[0].data[1] = 121;
    Task_MapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(4);

    ShowMapNamePopup(runtime, true);
    expect(runtime.tasks[0].data[3]).toBe(1);
    runtime.tasks[0].data[2] = 0;
    Task_MapNamePopup(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data[3]).toBe(0);

    DismissMapNamePopup(runtime);
    expect(runtime.tasks[0].data[0]).toBe(6);
    Task_MapNamePopup(runtime, 0);
    expect(runtime.windows[1].cleared).toBe(true);
    Task_MapNamePopup(runtime, 0);
    expect(runtime.windows[1].removed).toBe(true);
    Task_MapNamePopup(runtime, 0);
    expect(runtime.tasks[0].active).toBe(false);

    const hidden = createMapNamePopupRuntime({ flags: new Set([FLAG_DONT_SHOW_MAP_NAME_POPUP]) });
    ShowMapNamePopup(hidden, false);
    expect(IsMapNamePopupTaskActive(hidden)).toBe(false);
  });
});
