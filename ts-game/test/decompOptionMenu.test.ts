import { describe, expect, it } from 'vitest';
import {
  A_BUTTON,
  BG_PLTT_ID,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_EFFECT_LIGHTEN,
  BLDCNT_TGT1_BG0,
  BLDCNT_TGT1_BG1,
  BufferOptionMenuString,
  CB2_InitOptionMenu,
  CB2_OptionMenu,
  CB2_OptionsMenuFromStartMenu,
  COPYWIN_FULL,
  CloseAndSaveOptionMenu,
  ConvertIntToDecimalStringN,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  DrawOptionMenuBg,
  FONT_NORMAL,
  FONTATTR_MAX_LETTER_HEIGHT,
  HELPCONTEXT_OPTIONS,
  LoadOptionMenuItemNames,
  LoadOptionMenuPalette,
  MENUITEM_CANCEL,
  MENUITEM_COUNT,
  MENUITEM_FRAMETYPE,
  MENUITEM_TEXTSPEED,
  OptionMenu_PickSwitchCancel,
  OptionMenu_ProcessInput,
  OptionMenu_ResetSpriteData,
  PALETTES_ALL,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN0V,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  RGB_BLACK,
  SetMainCallback2,
  Task_OptionMenu,
  TEXT_SKIP_DRAW,
  UpdateSettingSelectionDisplay,
  WIN_OPTIONS,
  WIN_RANGE,
  createOptionMenuRuntime,
  gText_PickSwitchCancel,
  sOptionMenuItemCounts,
  sOptionMenuWinTemplates,
} from '../src/game/decompOptionMenu';

describe('decompOptionMenu', () => {
  it('CB2_OptionsMenuFromStartMenu allocates menu, copies save options, clamps invalid values, and installs callback', () => {
    const runtime = createOptionMenuRuntime();
    runtime.gSaveBlock2Ptr = {
      optionsTextSpeed: 9,
      optionsBattleSceneOff: 1,
      optionsBattleStyle: 8,
      optionsSound: 1,
      optionsButtonMode: 2,
      optionsWindowFrameType: 99,
    };

    CB2_OptionsMenuFromStartMenu(runtime);

    expect(runtime.sOptionMenuPtr).not.toBeNull();
    expect(runtime.sOptionMenuPtr?.option).toEqual([0, 1, 0, 1, 2, 0, 0]);
    expect(runtime.sOptionMenuPtr).toMatchObject({ loadState: 0, loadPaletteState: 0, state: 0, cursorPos: 0 });
    expect(runtime.gMain.savedCallback?.name).toBe('CB2_ReturnToFieldWithOpenMenu');
    expect(runtime.gMain.callback2?.name).toBe('CB2_OptionMenu');
    expect(runtime.log).toContain(`SetHelpContext:${HELPCONTEXT_OPTIONS}`);
  });

  it('CB2_OptionMenu walks every setup state and only advances past palette state when fully loaded', () => {
    const runtime = createOptionMenuRuntime();
    CB2_OptionsMenuFromStartMenu(runtime);

    CB2_OptionMenu(runtime);
    expect(runtime.log).toContain('SetVBlankCallback:NULL');
    expect(runtime.sOptionMenuPtr?.state).toBe(1);

    CB2_OptionMenu(runtime);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDCNT)).toBe(BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_BLEND | BLDCNT_EFFECT_LIGHTEN);
    expect(runtime.gpuRegs.get(REG_OFFSET_BLDY)).toBe(BLDCNT_TGT1_BG1);
    expect(runtime.gpuRegs.has(REG_OFFSET_WININ)).toBe(true);
    expect(runtime.gpuRegs.has(REG_OFFSET_WINOUT)).toBe(true);
    expect(runtime.gpuRegs.get(REG_OFFSET_DISPCNT)).toBe((1 << 6) | (1 << 12) | (1 << 13));
    expect(runtime.sOptionMenuPtr?.state).toBe(2);

    CB2_OptionMenu(runtime);
    expect(runtime.log).toContain('ScanlineEffect_Stop');
    expect(runtime.sOptionMenuPtr?.state).toBe(3);

    for (let i = 0; i < 4; i += 1) {
      CB2_OptionMenu(runtime);
      expect(runtime.sOptionMenuPtr?.state).toBe(3);
    }
    expect(runtime.sOptionMenuPtr?.loadPaletteState).toBe(4);

    CB2_OptionMenu(runtime);
    expect(runtime.sOptionMenuPtr?.state).toBe(4);

    for (let expectedState = 5; expectedState <= 10; expectedState += 1) {
      CB2_OptionMenu(runtime);
      expect(runtime.sOptionMenuPtr?.state).toBe(expectedState);
    }

    CB2_OptionMenu(runtime);
    expect(runtime.tasks).toHaveLength(1);
    expect(runtime.tasks[0]).toMatchObject({ priority: 0, destroyed: false });
    expect(runtime.gMain.callback2?.name).toBe('CB2_InitOptionMenu');
    expect(runtime.sOptionMenuPtr?.state).toBe(11);
  });

  it('LoadOptionMenuPalette mirrors each staged asset load and returns TRUE only after state 3', () => {
    const runtime = createOptionMenuRuntime();
    CB2_OptionsMenuFromStartMenu(runtime);
    runtime.sOptionMenuPtr!.option[MENUITEM_FRAMETYPE] = 7;

    expect(LoadOptionMenuPalette(runtime)).toBe(false);
    expect(runtime.log.at(-1)).toBe('LoadBgTiles:1:windowTiles:7:288:426');
    expect(LoadOptionMenuPalette(runtime)).toBe(false);
    expect(runtime.log.at(-1)).toBe(`LoadPalette:windowPalette:7:${BG_PLTT_ID(2)}:32`);
    expect(LoadOptionMenuPalette(runtime)).toBe(false);
    expect(runtime.log.slice(-2)).toEqual([
      `LoadPalette:graphics/misc/option_menu.gbapal:${BG_PLTT_ID(1)}:32`,
      `LoadPalette:textWindowPalette:2:${BG_PLTT_ID(15)}:32`,
    ]);
    expect(LoadOptionMenuPalette(runtime)).toBe(false);
    expect(runtime.log.at(-1)).toBe(`LoadStdWindowGfxOnBg:1:${0x1b3}:${BG_PLTT_ID(3)}`);
    expect(LoadOptionMenuPalette(runtime)).toBe(true);
  });

  it('OptionMenu_ProcessInput wraps options and cursor with the original return codes', () => {
    const runtime = createOptionMenuRuntime();
    CB2_OptionsMenuFromStartMenu(runtime);
    const menu = runtime.sOptionMenuPtr!;

    menu.cursorPos = MENUITEM_TEXTSPEED;
    menu.option[MENUITEM_TEXTSPEED] = sOptionMenuItemCounts[MENUITEM_TEXTSPEED] - 1;
    runtime.gMain.newAndRepeatedKeys = DPAD_RIGHT;
    expect(OptionMenu_ProcessInput(runtime)).toBe(4);
    expect(menu.option[MENUITEM_TEXTSPEED]).toBe(0);

    runtime.gMain.newAndRepeatedKeys = DPAD_LEFT;
    expect(OptionMenu_ProcessInput(runtime)).toBe(4);
    expect(menu.option[MENUITEM_TEXTSPEED]).toBe(2);

    menu.cursorPos = MENUITEM_FRAMETYPE;
    menu.option[MENUITEM_FRAMETYPE] = 0;
    runtime.gMain.newAndRepeatedKeys = DPAD_LEFT;
    expect(OptionMenu_ProcessInput(runtime)).toBe(2);
    expect(menu.option[MENUITEM_FRAMETYPE]).toBe(9);

    runtime.gMain.newAndRepeatedKeys = DPAD_RIGHT;
    expect(OptionMenu_ProcessInput(runtime)).toBe(2);
    expect(menu.option[MENUITEM_FRAMETYPE]).toBe(0);

    menu.cursorPos = MENUITEM_TEXTSPEED;
    runtime.gMain.newAndRepeatedKeys = DPAD_UP;
    expect(OptionMenu_ProcessInput(runtime)).toBe(3);
    expect(menu.cursorPos).toBe(MENUITEM_CANCEL);

    runtime.gMain.newAndRepeatedKeys = DPAD_DOWN;
    expect(OptionMenu_ProcessInput(runtime)).toBe(3);
    expect(menu.cursorPos).toBe(MENUITEM_TEXTSPEED);

    runtime.gMain.newAndRepeatedKeys = 0;
    runtime.gMain.newKeys = A_BUTTON;
    expect(OptionMenu_ProcessInput(runtime)).toBe(1);

    runtime.gMain.newKeys = 0;
    expect(OptionMenu_ProcessInput(runtime)).toBe(0);
  });

  it('Task_OptionMenu follows fade, busy-link, input, redraw, and close states', () => {
    const runtime = createOptionMenuRuntime();
    CB2_OptionsMenuFromStartMenu(runtime);
    const menu = runtime.sOptionMenuPtr!;

    Task_OptionMenu(runtime, 0);
    expect(menu.loadState).toBe(1);
    expect(runtime.log).toContain(`BeginNormalPaletteFade:${PALETTES_ALL}:0:16:0:${RGB_BLACK}`);
    expect(runtime.vblankCallback?.name).toBe('VBlankCB_OptionMenu');

    runtime.gPaletteFade.active = true;
    Task_OptionMenu(runtime, 0);
    expect(menu.loadState).toBe(1);

    runtime.gPaletteFade.active = false;
    Task_OptionMenu(runtime, 0);
    expect(menu.loadState).toBe(2);

    runtime.isActiveOverworldLinkBusy = true;
    runtime.gMain.newAndRepeatedKeys = DPAD_RIGHT;
    Task_OptionMenu(runtime, 0);
    expect(menu.option[MENUITEM_TEXTSPEED]).toBe(0);

    runtime.isActiveOverworldLinkBusy = false;
    Task_OptionMenu(runtime, 0);
    expect(menu.option[MENUITEM_TEXTSPEED]).toBe(1);
    expect(runtime.log.at(-2)).toBe('PutWindowTilemap:1');

    menu.cursorPos = MENUITEM_FRAMETYPE;
    runtime.gMain.newAndRepeatedKeys = DPAD_RIGHT;
    Task_OptionMenu(runtime, 0);
    expect(runtime.log).toContain('LoadBgTiles:1:windowTiles:1:288:426');
    expect(runtime.log).toContain('LoadPalette:windowPalette:1:32:32');

    runtime.gMain.newAndRepeatedKeys = DPAD_DOWN;
    Task_OptionMenu(runtime, 0);
    expect(runtime.gpuRegs.get(REG_OFFSET_WIN0H)).toBe(WIN_RANGE(0x10, 0xe0));

    runtime.gMain.newAndRepeatedKeys = 0;
    runtime.gMain.newKeys = A_BUTTON;
    Task_OptionMenu(runtime, 0);
    expect(menu.loadState).toBe(3);

    Task_OptionMenu(runtime, 0);
    expect(menu.loadState).toBe(4);
    expect(runtime.log).toContain(`BeginNormalPaletteFade:${PALETTES_ALL}:0:0:16:${RGB_BLACK}`);

    runtime.gPaletteFade.active = false;
    Task_OptionMenu(runtime, 0);
    expect(menu.loadState).toBe(5);

    runtime.tasks.push({ func: Task_OptionMenu, priority: 0, destroyed: false });
    Task_OptionMenu(runtime, 0);
    expect(runtime.sOptionMenuPtr).toBeNull();
    expect(runtime.tasks[0].destroyed).toBe(true);
  });

  it('BufferOptionMenuString prints each selection with exact y math and frame type formatting', () => {
    const runtime = createOptionMenuRuntime();
    CB2_OptionsMenuFromStartMenu(runtime);
    const menu = runtime.sOptionMenuPtr!;
    menu.option = [2, 1, 1, 1, 2, 4, 0];

    for (let i = 0; i < MENUITEM_COUNT; i += 1) {
      BufferOptionMenuString(runtime, i);
    }

    expect(runtime.log).toContain('AddTextPrinterParameterized3:1:0:130:2:0,3,4:-1:Fast');
    expect(runtime.log).toContain('AddTextPrinterParameterized3:1:0:130:13:0,3,4:-1:Off');
    expect(runtime.log).toContain('AddTextPrinterParameterized3:1:0:130:24:0,3,4:-1:Set');
    expect(runtime.log).toContain('AddTextPrinterParameterized3:1:0:130:35:0,3,4:-1:Stereo');
    expect(runtime.log).toContain('AddTextPrinterParameterized3:1:0:130:46:0,3,4:-1:L=A');
    expect(runtime.log).toContain('AddTextPrinterParameterized3:1:0:130:57:0,3,4:-1:Type 05');
    expect(runtime.log.filter((entry) => entry === `CopyWindowToVram:1:${COPYWIN_FULL}`)).toHaveLength(MENUITEM_COUNT);
    expect(ConvertIntToDecimalStringN(5, 1, 2)).toBe('05');
  });

  it('drawing helpers preserve coordinates, item-name y formula, and selection window ranges', () => {
    const runtime = createOptionMenuRuntime();
    runtime.fontAttributes.set(`${FONT_NORMAL}:${FONTATTR_MAX_LETTER_HEIGHT}`, 10);

    DrawOptionMenuBg(runtime);
    expect(runtime.log.filter((entry) => entry.startsWith('FillBgTilemapBufferRect:'))).toHaveLength(16);
    expect(runtime.log.at(-1)).toBe('CopyBgTilemapBufferToVram:1');

    LoadOptionMenuItemNames(runtime);
    expect(runtime.log).toContain(`AddTextPrinterParameterized:${WIN_OPTIONS}:0:Cancel:8:${6 * 10 + 2 - 6}:${TEXT_SKIP_DRAW}:null`);

    UpdateSettingSelectionDisplay(runtime, 3);
    const y = 3 * (10 - 1) + 0x3a;
    expect(runtime.gpuRegs.get(REG_OFFSET_WIN0V)).toBe(WIN_RANGE(y, y + 10));
    expect(runtime.gpuRegs.get(REG_OFFSET_WIN0H)).toBe(WIN_RANGE(0x10, 0xe0));
  });

  it('misc callbacks, pick/switch text, reset, init loop, and close/save mirror their C helpers', () => {
    const runtime = createOptionMenuRuntime();
    const saved = () => runtime.log.push('savedCallback');
    runtime.stringWidths.set(gText_PickSwitchCancel, 100);
    runtime.gMain.savedCallback = saved;
    CB2_OptionsMenuFromStartMenu(runtime);
    const menu = runtime.sOptionMenuPtr!;
    menu.option = [1, 1, 0, 1, 2, 8, 0];

    OptionMenu_PickSwitchCancel(runtime);
    expect(runtime.log).toContain('AddTextPrinterParameterized3:2:1:128:0:6,1,2:0:Pick Switch Cancel');

    OptionMenu_ResetSpriteData(runtime);
    expect(runtime.log.slice(-5)).toEqual(['ResetSpriteData', 'ResetPaletteFade', 'FreeAllSpritePalettes', 'ResetTasks', 'ScanlineEffect_Stop']);

    CB2_InitOptionMenu(runtime);
    expect(runtime.log.slice(-4)).toEqual(['RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade']);

    runtime.tasks.push({ func: Task_OptionMenu, priority: 0, destroyed: false });
    CloseAndSaveOptionMenu(runtime, 0);
    expect(runtime.gFieldCallback).toBe('FieldCB_DefaultWarpExit');
    expect(runtime.gMain.callback2).toBe(saved);
    expect(runtime.gSaveBlock2Ptr).toMatchObject({
      optionsTextSpeed: 1,
      optionsBattleSceneOff: 1,
      optionsBattleStyle: 0,
      optionsSound: 1,
      optionsButtonMode: 2,
      optionsWindowFrameType: 8,
    });
    expect(runtime.log).toContain('FreeAllWindowBuffers');
    expect(runtime.log).toContain('SetPokemonCryStereo:1');
    expect(runtime.tasks[0].destroyed).toBe(true);
    expect(runtime.sOptionMenuPtr).toBeNull();

    SetMainCallback2(runtime, null);
    expect(runtime.gMain.callback2).toBeNull();
    expect(sOptionMenuWinTemplates.at(-1)).toBeNull();
  });
});
