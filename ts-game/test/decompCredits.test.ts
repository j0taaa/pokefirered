import { describe, expect, test } from 'vitest';
import {
  CB2_Credits,
  CREDITSSCENE_EXEC_CMD,
  CREDITSSCENE_INIT_WIN0,
  CREDITSSCENE_LOAD_PLAYER_SPRITE_AT_INDIGO,
  CREDITSSCENE_MAPNEXT_DESTROYWINDOW,
  CREDITSSCENE_MON_DESTROY_ASSETS,
  CREDITSSCENE_OPEN_WIN0,
  CREDITSSCENE_PRINT_ADDPRINTER1,
  CREDITSSCENE_PRINT_ADDPRINTER2,
  CREDITSSCENE_PRINT_DELAY,
  CREDITSSCENE_SETUP_DARKEN_EFFECT,
  CREDITSSCENE_TERMINATE,
  CREDITSSCENE_THEEND_DESTROY_ASSETS,
  CREDITSSCENE_WAITBUTTON,
  CREDITSSCRCMD_MAP,
  CREDITSSCRCMD_MAPNEXT,
  CREDITSSCRCMD_MON,
  CREDITSSCRCMD_PRINT,
  CREDITSSCRCMD_THEENDGFX,
  CREDITSSCRCMD_WAITBUTTON,
  CREDITSMON_CHARIZARD,
  CREDITSMON_PIKACHU,
  CREDITSCLOSING_THEEND,
  CreateCreditsWindow,
  DestroyCreditsWindow,
  DoCopyrightOrTheEndGfxScene,
  DoCredits,
  DoCreditsMonScene,
  DoOverworldMapScrollScene,
  GetCreditsMonSpecies,
  InitBgDarkenEffect,
  LoadPlayerOrRivalSprite,
  RollCredits,
  SwitchWin1OffWin0On,
  TASK_NONE,
  Task_MovePlayerAndGroundSprites,
  createCreditsRuntime,
  sCreditsScript,
  sCreditsTexts
} from '../src/game/decompCredits';

describe('decomp credits', () => {
  test('parses credits script and text headers from credits.c in order', () => {
    expect(sCreditsScript[0]).toMatchObject({ cmd: CREDITSSCRCMD_MAPNEXT, param: 0, duration: 16, symbol: 'ROUTE23' });
    expect(sCreditsScript[1]).toMatchObject({ cmd: CREDITSSCRCMD_PRINT, param: 0, duration: 300, symbol: 'DIRECTOR' });
    expect(sCreditsScript.some((cmd) => cmd.cmd === CREDITSSCRCMD_MON && cmd.param === CREDITSMON_CHARIZARD)).toBe(true);
    expect(sCreditsScript.at(-3)).toMatchObject({ cmd: CREDITSSCRCMD_THEENDGFX, param: 0, duration: 224 });
    expect(sCreditsScript.at(-2)).toMatchObject({ cmd: CREDITSSCRCMD_THEENDGFX, param: CREDITSCLOSING_THEEND, duration: 240 });
    expect(sCreditsScript.at(-1)).toMatchObject({ cmd: CREDITSSCRCMD_WAITBUTTON, duration: 600 });
    expect(sCreditsScript.find((cmd) => cmd.cmd === CREDITSSCRCMD_MAP && cmd.symbol === 'CERULEAN_CITY')).toBeTruthy();
    expect(sCreditsTexts[0]).toEqual({ title: 'gCreditsString_Director', names: 'gCreditsString_Junichi_Masuda', unused: false });
    expect(sCreditsTexts.at(-1)).toEqual({ title: 'gString_Dummy', names: 'gString_Dummy', unused: false });
  });

  test('initializes credits and opens the window like the C scene machine', () => {
    const runtime = createCreditsRuntime();
    DoCredits(runtime);
    expect(runtime.sCreditsMgr).toMatchObject({ mainseqno: CREDITSSCENE_INIT_WIN0, taskId: TASK_NONE, unk_1D: 0 });
    expect(runtime.mainCallback2).toBe('CB2_Credits');
    expect(runtime.operations).toContain('ResetTasks');

    expect(RollCredits(runtime)).toBe(0);
    expect(runtime.sCreditsMgr?.mainseqno).toBe(CREDITSSCENE_SETUP_DARKEN_EFFECT);
    expect(runtime.gpuRegs.WIN0V).toBe((79 << 8) + 81);

    expect(RollCredits(runtime)).toBe(0);
    expect(runtime.sCreditsMgr?.mainseqno).toBe(CREDITSSCENE_OPEN_WIN0);
    expect(runtime.sCreditsMgr?.windowIsActive).toBe(true);

    runtime.gpuRegs.WIN0V = (0x25 << 8) + 0x7b;
    RollCredits(runtime);
    expect(runtime.gpuRegs.WIN0V).toBe((0x24 << 8) + 0x7c);
    RollCredits(runtime);
    expect(runtime.sCreditsMgr?.mainseqno).toBe(CREDITSSCENE_LOAD_PLAYER_SPRITE_AT_INDIGO);
  });

  test('executes print, mapnext, map, mon, the-end, and waitbutton commands with C transitions', () => {
    const runtime = createAtExec();
    const mgr = runtime.sCreditsMgr!;

    mgr.scrcmdidx = 1;
    expect(RollCredits(runtime)).toBe(0);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_PRINT_ADDPRINTER1);
    expect(runtime.paletteFadeActive).toBe(true);
    runtime.paletteFadeActive = false;
    expect(RollCredits(runtime)).toBe(0);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_PRINT_ADDPRINTER2);
    expect(runtime.operations).toContain('AddTextPrinterHeader:gCreditsString_Director');
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_PRINT_DELAY);
    RollCredits(runtime);
    expect(mgr.scrcmdidx).toBe(2);
    expect(mgr.timer).toBe(300);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_EXEC_CMD);

    mgr.timer = 0;
    mgr.scrcmdidx = 0;
    runtime.paletteFadeActive = false;
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_MAPNEXT_DESTROYWINDOW);
    expect(mgr.whichMon).toBe(0);
    expect(mgr.timer).toBe(16);

    mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
    mgr.timer = 0;
    mgr.scrcmdidx = sCreditsScript.findIndex((cmd) => cmd.cmd === CREDITSSCRCMD_MAP && cmd.symbol === 'CERULEAN_CITY');
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(12);
    expect(mgr.whichMon).toBe(3);

    mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
    mgr.timer = 0;
    mgr.scrcmdidx = sCreditsScript.findIndex((cmd) => cmd.cmd === CREDITSSCRCMD_MON && cmd.param === CREDITSMON_PIKACHU);
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_MON_DESTROY_ASSETS);
    expect(mgr.whichMon).toBe(CREDITSMON_PIKACHU);
    expect(runtime.operations).toContain('FadeScreen:FADE_TO_BLACK:0');

    mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
    mgr.timer = 0;
    mgr.scrcmdidx = sCreditsScript.findIndex((cmd) => cmd.cmd === CREDITSSCRCMD_THEENDGFX && cmd.param === CREDITSCLOSING_THEEND);
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_THEEND_DESTROY_ASSETS);
    expect(runtime.paletteFadeActive).toBe(true);

    mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
    mgr.timer = 0;
    mgr.scrcmdidx = sCreditsScript.length - 1;
    runtime.paletteFadeActive = false;
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_WAITBUTTON);
    expect(mgr.timer).toBe(600);
  });

  test('map scenes recreate the credits window and CB2 alternates overworld callbacks when speed-through is enabled', () => {
    const runtime = createAtExec();
    const mgr = runtime.sCreditsMgr!;
    mgr.mainseqno = CREDITSSCENE_MAPNEXT_DESTROYWINDOW;
    runtime.paletteFadeActive = false;
    RollCredits(runtime);
    expect(mgr.mainseqno).toBe(11);
    expect(mgr.subseqno).toBe(0);

    runtime.overworldScrollResults = [false, true];
    expect(RollCredits(runtime)).toBe(0);
    expect(mgr.mainseqno).toBe(11);
    expect(RollCredits(runtime)).toBe(0);
    expect(mgr.canSpeedThrough).toBe(1);
    expect(mgr.mainseqno).toBe(CREDITSSCENE_EXEC_CMD);
    expect(runtime.flags.has('FLAG_DONT_SHOW_MAP_NAME_POPUP')).toBe(true);

    mgr.timer = 1;
    mgr.canSpeedThrough = 1;
    mgr.unk_1D = 1;
    CB2_Credits(runtime);
    expect(runtime.operations).toContain('Overworld_CreditsMainCB');
  });

  test('mon and the-end scene subtasks preserve timer and palette gates', () => {
    const runtime = createAtExec();
    const mgr = runtime.sCreditsMgr!;
    mgr.whichMon = CREDITSMON_CHARIZARD;

    expect(DoCreditsMonScene(runtime)).toBe(false);
    expect(mgr.subseqno).toBe(1);
    expect(runtime.operations).toContain('LoadMonPicInWindow:6');
    DoCreditsMonScene(runtime);
    DoCreditsMonScene(runtime);
    expect(mgr.subseqno).toBe(3);
    expect(mgr.creditsMonTimer).toBe(40);
    mgr.creditsMonTimer = 0;
    DoCreditsMonScene(runtime);
    runtime.paletteFadeActive = false;
    DoCreditsMonScene(runtime);
    expect(mgr.subseqno).toBe(5);
    mgr.creditsMonTimer = 0;
    mgr.unk_0E = 1;
    DoCreditsMonScene(runtime);
    expect(runtime.operations).toContain('PutWindowTilemap:1');
    mgr.subseqno = 9;
    runtime.paletteFadeActive = false;
    expect(DoCreditsMonScene(runtime)).toBe(true);
    expect(mgr.subseqno).toBe(0);

    mgr.whichMon = CREDITSCLOSING_THEEND;
    expect(DoCopyrightOrTheEndGfxScene(runtime)).toBe(false);
    expect(runtime.operations).toContain('Decompress:TheEnd:1');
    mgr.subseqno = 3;
    runtime.paletteFadeActive = false;
    expect(DoCopyrightOrTheEndGfxScene(runtime)).toBe(true);
  });

  test('player/rival sprites load, move, destroy, and terminate exactly through task data', () => {
    const runtime = createAtExec();
    const mgr = runtime.sCreditsMgr!;
    runtime.playerGender = 1;
    LoadPlayerOrRivalSprite(runtime, 0);
    expect(mgr.taskId).not.toBe(TASK_NONE);
    expect(runtime.operations).toContain('LoadCharacterSprite:player_female');
    const task = runtime.tasks[mgr.taskId];
    expect(runtime.sprites[task.data.characterSpriteId]).toMatchObject({ x: 272, y: 80, paletteNum: 15 });

    Task_MovePlayerAndGroundSprites(runtime, mgr.taskId);
    expect(runtime.sprites[task.data.characterSpriteId].x).toBe(271);

    task.data.spriteMoveCmd = 2;
    mgr.unk_1D = 1;
    runtime.sprites[task.data.characterSpriteId].y = 81;
    runtime.sprites[task.data.groundSpriteId].y = 119;
    Task_MovePlayerAndGroundSprites(runtime, mgr.taskId);
    expect(runtime.sprites[task.data.characterSpriteId].y).toBe(80);

    mgr.mainseqno = CREDITSSCENE_THEEND_DESTROY_ASSETS;
    task.data.spriteMoveCmd = 3;
    Task_MovePlayerAndGroundSprites(runtime, mgr.taskId);
    expect(runtime.sprites[task.data.characterSpriteId].x).toBe(270);

    RollCredits(Object.assign(runtime, { paletteFadeActive: false }));
    mgr.mainseqno = CREDITSSCENE_TERMINATE;
    mgr.windowIsActive = true;
    expect(RollCredits(runtime)).toBe(2);
    CB2_Credits(runtime);
    expect(runtime.freed).toBe(true);
    expect(runtime.softResetFlags).toBe(0xff);
  });

  test('species lookup keeps the C switch defaults', () => {
    expect(GetCreditsMonSpecies(0)).toBe(6);
    expect(GetCreditsMonSpecies(1)).toBe(3);
    expect(GetCreditsMonSpecies(2)).toBe(9);
    expect(GetCreditsMonSpecies(3)).toBe(25);
    expect(GetCreditsMonSpecies(99)).toBe(0);
  });

  test('exact small C helpers manipulate windows, blending, and overworld scroll scene', () => {
    const runtime = createAtExec();
    const mgr = runtime.sCreditsMgr!;

    SwitchWin1OffWin0On(runtime);
    expect(runtime.gpuRegs.WININ).toBe(0x1f3f);
    expect(runtime.gpuRegs.WINOUT).toBe(0x000e);

    InitBgDarkenEffect(runtime);
    expect(runtime.gpuRegs.BLDCNT).toBe(0x0e40);
    expect(runtime.gpuRegs.BLDALPHA).toBe((16 << 8) | 4);
    expect(runtime.gpuRegs.BLDY).toBe(10);

    DestroyCreditsWindow(runtime);
    expect(mgr.windowIsActive).toBe(false);
    CreateCreditsWindow(runtime);
    expect(mgr.windowIsActive).toBe(true);
    expect(runtime.operations).toContain('AddWindow:sCreditsWindowTemplate');

    mgr.subseqno = 0;
    runtime.overworldScrollResults = [true];
    expect(DoOverworldMapScrollScene(runtime, 2)).toBe(true);
    expect(runtime.gDisableMapMusicChangeOnMapLoad).toBe(1);
    expect(runtime.flags.has('FLAG_DONT_SHOW_MAP_NAME_POPUP')).toBe(true);
    expect(runtime.operations).toContain('Overworld_DoScrollSceneForCredits:2:0');
    expect(runtime.gpuRegs.WIN0V).toBe((36 << 8) + 124);
  });
});

function createAtExec() {
  const runtime = createCreditsRuntime();
  DoCredits(runtime);
  runtime.sCreditsMgr!.mainseqno = CREDITSSCENE_EXEC_CMD;
  runtime.sCreditsMgr!.windowIsActive = true;
  runtime.sCreditsMgr!.windowId = 0;
  return runtime;
}
