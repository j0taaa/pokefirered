import creditsSourceRaw from '../../../src/credits.c?raw';

export const CREDITSSCENE_INIT_WIN0 = 0;
export const CREDITSSCENE_SETUP_DARKEN_EFFECT = 1;
export const CREDITSSCENE_OPEN_WIN0 = 2;
export const CREDITSSCENE_LOAD_PLAYER_SPRITE_AT_INDIGO = 3;
export const CREDITSSCENE_PRINT_TITLE_STAFF = 4;
export const CREDITSSCENE_WAIT_TITLE_STAFF = 5;
export const CREDITSSCENE_EXEC_CMD = 6;
export const CREDITSSCENE_PRINT_ADDPRINTER1 = 7;
export const CREDITSSCENE_PRINT_ADDPRINTER2 = 8;
export const CREDITSSCENE_PRINT_DELAY = 9;
export const CREDITSSCENE_MAPNEXT_DESTROYWINDOW = 10;
export const CREDITSSCENE_MAPNEXT_LOADMAP = 11;
export const CREDITSSCENE_MAP_LOADMAP_CREATESPRITES = 12;
export const CREDITSSCENE_MON_DESTROY_ASSETS = 13;
export const CREDITSSCENE_MON_SHOW = 14;
export const CREDITSSCENE_THEEND_DESTROY_ASSETS = 15;
export const CREDITSSCENE_THEEND_SHOW = 16;
export const CREDITSSCENE_WAITBUTTON = 17;
export const CREDITSSCENE_TERMINATE = 18;

export const CREDITSSCRCMD_PRINT = 0;
export const CREDITSSCRCMD_MAPNEXT = 1;
export const CREDITSSCRCMD_MAP = 2;
export const CREDITSSCRCMD_MON = 3;
export const CREDITSSCRCMD_THEENDGFX = 4;
export const CREDITSSCRCMD_WAITBUTTON = 5;

export const CREDITSMON_CHARIZARD = 0;
export const CREDITSMON_VENUSAUR = 1;
export const CREDITSMON_BLASTOISE = 2;
export const CREDITSMON_PIKACHU = 3;
export const CREDITSCLOSING_ALLRIGHTSRESERVED = 0;
export const CREDITSCLOSING_THEEND = 1;
export const TASK_NONE = 0xff;
export const A_BUTTON = 1;
export const MALE = 0;
export const FEMALE = 1;
export const MUSIC_DISABLE_OFF = 0;
export const MUSIC_DISABLE_KEEP = 1;
export const RESET_ALL = 0xff;
export const GFXTAG_CHARACTER = 0x2000;
export const GFXTAG_GROUND = 0x2001;

export type CreditsScene = number;
export type CreditsScrCmdKind = 0 | 1 | 2 | 3 | 4 | 5;

export interface CreditsScrcmd {
  cmd: CreditsScrCmdKind;
  param: number;
  duration: number;
  macro: string;
  symbol: string;
}

export interface CreditsTextHeader {
  title: string;
  names: string;
  unused: boolean;
}

export interface CreditsSprite {
  id: number;
  kind: 'character' | 'ground';
  x: number;
  y: number;
  paletteNum: number;
  subpriority: number;
  destroyed: boolean;
}

export interface CreditsTaskData {
  spriteMoveCmd: number;
  characterSpriteId: number;
  characterTilesTag: number;
  characterPalTag: number;
  groundSpriteId: number;
  groundTilesTag: number;
  groundPalTag: number;
}

export interface CreditsTask {
  id: number;
  func: 'Task_MovePlayerAndGroundSprites';
  data: CreditsTaskData;
  destroyed: boolean;
}

export interface CreditsResources {
  mainseqno: CreditsScene;
  subseqno: number;
  taskId: number;
  timer: number;
  scrcmdidx: number;
  canSpeedThrough: number;
  whichMon: number;
  windowId: number;
  windowIsActive: boolean;
  creditsMonTimer: number;
  unk_0E: number;
  ovwldseqno: number;
  unk_1D: number;
}

export interface CreditsRuntime {
  sCreditsMgr: CreditsResources | null;
  tasks: CreditsTask[];
  sprites: CreditsSprite[];
  operations: string[];
  gpuRegs: Record<string, number>;
  paletteFadeActive: boolean;
  newKeys: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  hblankCallback: string | null;
  gDisableMapMusicChangeOnMapLoad: number;
  flags: Set<string>;
  playerGender: number;
  overworldScrollResults: boolean[];
  freed: boolean;
  softResetFlags: number | null;
}

export const sCreditsScript: CreditsScrcmd[] = parseCreditsScript(creditsSourceRaw);
export const sCreditsTexts: CreditsTextHeader[] = parseCreditsTexts(creditsSourceRaw);
export const sPlayerRivalSpriteParams = [
  [0, 3, 1],
  [0, 2, 0],
  [0, 3, 0],
  [1, 1, 2],
  [0, 0, 3]
] as const;

export const createCreditsRuntime = (overrides: Partial<CreditsRuntime> = {}): CreditsRuntime => ({
  sCreditsMgr: overrides.sCreditsMgr ?? null,
  tasks: overrides.tasks ?? [],
  sprites: overrides.sprites ?? [],
  operations: overrides.operations ?? [],
  gpuRegs: overrides.gpuRegs ?? {},
  paletteFadeActive: overrides.paletteFadeActive ?? false,
  newKeys: overrides.newKeys ?? 0,
  mainCallback2: overrides.mainCallback2 ?? null,
  vblankCallback: overrides.vblankCallback ?? null,
  hblankCallback: overrides.hblankCallback ?? null,
  gDisableMapMusicChangeOnMapLoad: overrides.gDisableMapMusicChangeOnMapLoad ?? MUSIC_DISABLE_OFF,
  flags: overrides.flags ?? new Set<string>(),
  playerGender: overrides.playerGender ?? MALE,
  overworldScrollResults: overrides.overworldScrollResults ?? [],
  freed: overrides.freed ?? false,
  softResetFlags: overrides.softResetFlags ?? null
});

export function DoCredits(runtime: CreditsRuntime): void {
  runtime.sCreditsMgr = {
    mainseqno: CREDITSSCENE_INIT_WIN0,
    subseqno: 0,
    taskId: TASK_NONE,
    timer: 0,
    scrcmdidx: 0,
    canSpeedThrough: 0,
    whichMon: 0,
    windowId: 0,
    windowIsActive: false,
    creditsMonTimer: 0,
    unk_0E: 0,
    ovwldseqno: 0,
    unk_1D: 0
  };
  runtime.tasks = [];
  runtime.sprites = [];
  runtime.operations.push('ResetTasks', 'ResetSpriteData');
  runtime.mainCallback2 = 'CB2_Credits';
}

export function CB2_Credits(runtime: CreditsRuntime): void {
  const result = RollCredits(runtime);
  if (result === 0) runFrame(runtime);
  else if (result === 1) {
    const mgr = requireMgr(runtime);
    if ((mgr.unk_1D & 1) !== 0) runtime.operations.push('Overworld_CreditsMainCB');
    else runFrame(runtime);
    mgr.unk_1D += 1;
  } else if (result === 2) {
    runtime.flags.delete('FLAG_DONT_SHOW_MAP_NAME_POPUP');
    runtime.gDisableMapMusicChangeOnMapLoad = MUSIC_DISABLE_OFF;
    runtime.freed = true;
    runtime.softResetFlags = RESET_ALL;
    runtime.sCreditsMgr = null;
  }
}

export function RollCredits(runtime: CreditsRuntime): number {
  const mgr = requireMgr(runtime);
  switch (mgr.mainseqno) {
    case CREDITSSCENE_INIT_WIN0:
      SwitchWin1OffWin0On(runtime);
      setGpuReg(runtime, 'WIN0H', winRange(0, 240));
      setGpuReg(runtime, 'WIN0V', winRange(79, 81));
      mgr.mainseqno = CREDITSSCENE_SETUP_DARKEN_EFFECT;
      return 0;
    case CREDITSSCENE_SETUP_DARKEN_EFFECT:
      InitBgDarkenEffect(runtime);
      CreateCreditsWindow(runtime);
      runtime.operations.push('Menu_LoadStdPalAt:15', 'SetCreditsWindowBlack');
      mgr.mainseqno = CREDITSSCENE_OPEN_WIN0;
      return 0;
    case CREDITSSCENE_OPEN_WIN0: {
      const win0v = runtime.gpuRegs.WIN0V ?? winRange(79, 81);
      let top = win0v >> 8;
      let bottom = win0v & 0xff;
      if (top === 0x24) {
        mgr.timer = 0;
        mgr.mainseqno = CREDITSSCENE_LOAD_PLAYER_SPRITE_AT_INDIGO;
      } else {
        top -= 1;
        bottom += 1;
        setGpuReg(runtime, 'WIN0V', (top << 8) + bottom);
      }
      return 0;
    }
    case CREDITSSCENE_LOAD_PLAYER_SPRITE_AT_INDIGO:
      if (mgr.timer !== 0) { mgr.timer -= 1; return 0; }
      LoadPlayerOrRivalSprite(runtime, 0);
      mgr.timer = 100;
      mgr.mainseqno = CREDITSSCENE_PRINT_TITLE_STAFF;
      return 0;
    case CREDITSSCENE_PRINT_TITLE_STAFF:
      if (mgr.timer !== 0) { mgr.timer -= 1; return 0; }
      mgr.timer = 360;
      runtime.operations.push('AddTextPrinter:TITLE_TEXT');
      mgr.mainseqno = CREDITSSCENE_WAIT_TITLE_STAFF;
      return 0;
    case CREDITSSCENE_WAIT_TITLE_STAFF:
      if (mgr.timer !== 0) { mgr.timer -= 1; return 0; }
      DestroyCreditsWindow(runtime);
      mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
      mgr.timer = 0;
      mgr.scrcmdidx = 0;
      return 0;
    case CREDITSSCENE_EXEC_CMD:
      if (mgr.timer !== 0) {
        mgr.timer -= 1;
        return mgr.canSpeedThrough;
      }
      return executeCreditsCommand(runtime, mgr);
    case CREDITSSCENE_PRINT_ADDPRINTER1:
      if (runtime.paletteFadeActive) return mgr.canSpeedThrough;
      runtime.operations.push(`AddTextPrinterHeader:${sCreditsTexts[sCreditsScript[mgr.scrcmdidx].param].title}`);
      mgr.mainseqno = CREDITSSCENE_PRINT_ADDPRINTER2;
      return mgr.canSpeedThrough;
    case CREDITSSCENE_PRINT_ADDPRINTER2:
      runtime.operations.push(`AddTextPrinterNames:${sCreditsTexts[sCreditsScript[mgr.scrcmdidx].param].names}`);
      mgr.mainseqno = CREDITSSCENE_PRINT_DELAY;
      return mgr.canSpeedThrough;
    case CREDITSSCENE_PRINT_DELAY:
      runtime.operations.push(`CopyWindowToVram:${mgr.windowId}:COPYWIN_GFX`);
      mgr.timer = sCreditsScript[mgr.scrcmdidx].duration;
      mgr.scrcmdidx += 1;
      beginPaletteFade(runtime, 'credits-window-in');
      mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
      return mgr.canSpeedThrough;
    case CREDITSSCENE_MAPNEXT_DESTROYWINDOW:
      if (!runtime.paletteFadeActive) {
        DestroyCreditsWindow(runtime);
        mgr.subseqno = 0;
        mgr.mainseqno = CREDITSSCENE_MAPNEXT_LOADMAP;
      }
      return 0;
    case CREDITSSCENE_MAPNEXT_LOADMAP:
      if (DoOverworldMapScrollScene(runtime, mgr.whichMon)) {
        mgr.canSpeedThrough = 1;
        mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
      }
      return 0;
    case CREDITSSCENE_MAP_LOADMAP_CREATESPRITES:
      if (!runtime.paletteFadeActive) {
        DestroyCreditsWindow(runtime);
        mgr.subseqno = 0;
        while (!DoOverworldMapScrollScene(runtime, mgr.whichMon)) { /* C busy-waits here. */ }
        LoadPlayerOrRivalSprite(runtime, mapSceneToSpriteScene(mgr.whichMon));
        mgr.canSpeedThrough = 1;
        mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
      }
      return 0;
    case CREDITSSCENE_MON_DESTROY_ASSETS:
      if (!runtime.paletteFadeActive) {
        DestroyPlayerOrRivalSprite(runtime);
        DestroyCreditsWindow(runtime);
        mgr.subseqno = 0;
        mgr.canSpeedThrough = 0;
        mgr.mainseqno = CREDITSSCENE_MON_SHOW;
      }
      return 0;
    case CREDITSSCENE_MON_SHOW:
      if (DoCreditsMonScene(runtime)) mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
      return 0;
    case CREDITSSCENE_THEEND_DESTROY_ASSETS:
      if (!runtime.paletteFadeActive) {
        DestroyCreditsWindow(runtime);
        mgr.subseqno = 0;
        mgr.canSpeedThrough = 0;
        mgr.mainseqno = CREDITSSCENE_THEEND_SHOW;
      }
      return 0;
    case CREDITSSCENE_THEEND_SHOW:
      if (DoCopyrightOrTheEndGfxScene(runtime)) mgr.mainseqno = CREDITSSCENE_EXEC_CMD;
      return 0;
    case CREDITSSCENE_WAITBUTTON:
      if ((runtime.newKeys & A_BUTTON) !== 0) {
        beginPaletteFade(runtime, 'waitbutton-white');
        mgr.mainseqno = CREDITSSCENE_TERMINATE;
        return 0;
      }
      if (mgr.timer !== 0) mgr.timer -= 1;
      else {
        mgr.mainseqno = CREDITSSCENE_TERMINATE;
        beginPaletteFade(runtime, 'waitbutton-white');
      }
      return 0;
    case CREDITSSCENE_TERMINATE:
      if (!runtime.paletteFadeActive) DestroyCreditsWindow(runtime);
      break;
  }
  return 2;
}

export function VBlankCB(runtime: CreditsRuntime): void {
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
}

export function LoadCreditsMonPic(runtime: CreditsRuntime, whichMon: number): void {
  const monNames = ['CHARIZARD', 'VENUSAUR', 'BLASTOISE', 'PIKACHU'];
  runtime.operations.push(`InitWindows:${monNames[whichMon]}`, `LoadMonPicInWindow:${GetCreditsMonSpecies(whichMon)}`, `CopyWindowToVram:0:COPYWIN_GFX`, `CopyWindowToVram:1:COPYWIN_GFX`, `CopyWindowToVram:2:COPYWIN_GFX`);
}

export function GetCreditsMonSpecies(whichMon: number): number {
  switch (whichMon) {
    case CREDITSMON_CHARIZARD: return 6;
    case CREDITSMON_VENUSAUR: return 3;
    case CREDITSMON_BLASTOISE: return 9;
    case CREDITSMON_PIKACHU: return 25;
    default: return 0;
  }
}

export function DoCreditsMonScene(runtime: CreditsRuntime): boolean {
  const mgr = requireMgr(runtime);
  switch (mgr.subseqno) {
    case 0:
      runtime.vblankCallback = null;
      runtime.hblankCallback = null;
      runtime.operations.push('ClearWinRegs', 'ResetPaletteFade', 'ResetSpriteData', 'ResetTasks', 'ResetBgsAndClearDma3BusyFlags:1', 'InitBgsFromTemplates:MonScene');
      mgr.creditsMonTimer = 0;
      mgr.unk_0E = 0;
      runtime.operations.push('SetBgAffine:2:0:0', 'Decompress:CreditsMonPokeball', 'Decompress:CreditsMonCircle', `LoadPalette:CreditsMon:${mgr.whichMon}`);
      LoadCreditsMonPic(runtime, mgr.whichMon);
      runtime.vblankCallback = 'VBlankCB';
      runtime.operations.push('EnableInterrupts:VBLANK');
      mgr.subseqno += 1;
      break;
    case 1:
      runtime.operations.push('FillBgTilemapBufferRect:0', 'PutWindowTilemap:0', 'CopyBgTilemapBufferToVram:2', 'CopyBgTilemapBufferToVram:1', 'CopyBgTilemapBufferToVram:0');
      mgr.subseqno += 1;
      break;
    case 2:
      runtime.operations.push('ShowBg:2', 'ShowBg:0');
      beginPaletteFade(runtime, 'mon-scene-in');
      mgr.creditsMonTimer = 40;
      mgr.subseqno += 1;
      break;
    case 3:
      if (mgr.creditsMonTimer !== 0) mgr.creditsMonTimer -= 1;
      else mgr.subseqno += 1;
      break;
    case 4:
      if (!runtime.paletteFadeActive) {
        mgr.creditsMonTimer = 8;
        mgr.unk_0E = 1;
        mgr.subseqno += 1;
      }
      break;
    case 5:
      if (mgr.creditsMonTimer !== 0) mgr.creditsMonTimer -= 1;
      else if (mgr.unk_0E < 3) {
        runtime.operations.push(`PutWindowTilemap:${mgr.unk_0E}`, 'CopyBgTilemapBufferToVram:0');
        mgr.creditsMonTimer = 4;
        mgr.unk_0E += 1;
      } else mgr.subseqno += 1;
      break;
    case 6:
      if (mgr.creditsMonTimer < 256) {
        mgr.creditsMonTimer += 16;
        runtime.operations.push(`SetBgAffine:2:${mgr.creditsMonTimer}:${mgr.creditsMonTimer}`);
      } else {
        runtime.operations.push('SetBgAffine:2:256:256');
        mgr.creditsMonTimer = 32;
        mgr.subseqno += 1;
      }
      break;
    case 7:
      if (mgr.creditsMonTimer !== 0) mgr.creditsMonTimer -= 1;
      else {
        runtime.operations.push('HideBg:2', 'ShowBg:1', `PlayCry_NormalNoDucking:${GetCreditsMonSpecies(mgr.whichMon)}`);
        mgr.creditsMonTimer = 128;
        mgr.subseqno += 1;
      }
      break;
    case 8:
      if (mgr.creditsMonTimer !== 0) mgr.creditsMonTimer -= 1;
      else {
        beginPaletteFade(runtime, 'mon-scene-out');
        mgr.subseqno += 1;
      }
      break;
    case 9:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push('FreeAllWindowBuffers', 'FreeBgTilemapBuffer:0');
        mgr.subseqno = 0;
        return true;
      }
      break;
  }
  return false;
}

export function DoCopyrightOrTheEndGfxScene(runtime: CreditsRuntime): boolean {
  const mgr = requireMgr(runtime);
  switch (mgr.subseqno) {
    case 0:
      runtime.vblankCallback = null;
      runtime.hblankCallback = null;
      runtime.operations.push('ClearWinRegs', 'ResetPaletteFade', 'ResetSpriteData', 'ResetTasks', 'ResetBgsAndClearDma3BusyFlags:1', 'InitBgsFromTemplates:TheEnd', `Decompress:TheEnd:${mgr.whichMon}`, `LoadPalette:TheEnd:${mgr.whichMon}`);
      runtime.vblankCallback = 'VBlankCB';
      runtime.operations.push('EnableInterrupts:VBLANK');
      mgr.subseqno += 1;
      break;
    case 1:
      runtime.operations.push('CopyBgTilemapBufferToVram:0');
      mgr.subseqno += 1;
      break;
    case 2:
      runtime.operations.push('ShowBg:0');
      beginPaletteFade(runtime, mgr.whichMon !== 0 ? 'theend-no-fade' : 'copyright-in');
      mgr.subseqno += 1;
      break;
    case 3:
      if (!runtime.paletteFadeActive) {
        mgr.subseqno = 0;
        return true;
      }
      break;
  }
  return false;
}

export function Task_MovePlayerAndGroundSprites(runtime: CreditsRuntime, taskId: number): void {
  const mgr = requireMgr(runtime);
  const task = runtime.tasks[taskId];
  const character = runtime.sprites[task.data.characterSpriteId];
  const ground = runtime.sprites[task.data.groundSpriteId];
  switch (task.data.spriteMoveCmd) {
    case 1:
      if (character.x !== 0xd0) { character.x -= 1; ground.x -= 1; }
      else task.data.spriteMoveCmd = 0;
      break;
    case 2:
      if ((mgr.unk_1D & 1) !== 0) {
        if (character.y !== 0x50) { character.y -= 1; ground.y -= 1; }
        else task.data.spriteMoveCmd = 0;
      }
      break;
    case 3:
      if (mgr.mainseqno === CREDITSSCENE_THEEND_DESTROY_ASSETS) { character.x -= 1; ground.x -= 1; }
      break;
  }
}

export function DestroyPlayerOrRivalSprite(runtime: CreditsRuntime): void {
  const mgr = requireMgr(runtime);
  if (mgr.taskId !== TASK_NONE) {
    const task = runtime.tasks[mgr.taskId];
    runtime.operations.push(`FreeSpriteTilesByTag:${task.data.characterTilesTag}`, `DestroySprite:${task.data.characterSpriteId}`, `FreeSpriteTilesByTag:${task.data.groundTilesTag}`, `DestroySprite:${task.data.groundSpriteId}`, `DestroyTask:${mgr.taskId}`);
    runtime.sprites[task.data.characterSpriteId].destroyed = true;
    runtime.sprites[task.data.groundSpriteId].destroyed = true;
    task.destroyed = true;
    mgr.taskId = TASK_NONE;
  }
}

export function LoadPlayerOrRivalSprite(runtime: CreditsRuntime, whichScene: number): void {
  const mgr = requireMgr(runtime);
  if (mgr.taskId !== TASK_NONE) return;
  const params = sPlayerRivalSpriteParams[whichScene] ?? sPlayerRivalSpriteParams[0];
  const taskId = runtime.tasks.length;
  const moveCmd = params[2];
  const [x, y] = moveCmd === 1 ? [272, 80] : moveCmd === 2 ? [208, 160] : [208, 80];
  const characterSpriteId = createSprite(runtime, 'character', x, y, 15, 0);
  const groundSpriteId = createSprite(runtime, 'ground', x, y + 38, 14, 1);
  runtime.tasks.push({
    id: taskId,
    func: 'Task_MovePlayerAndGroundSprites',
    data: {
      spriteMoveCmd: moveCmd,
      characterSpriteId,
      characterTilesTag: GFXTAG_CHARACTER,
      characterPalTag: 0xffff,
      groundSpriteId,
      groundTilesTag: GFXTAG_GROUND,
      groundPalTag: 0xffff
    },
    destroyed: false
  });
  mgr.taskId = taskId;
  runtime.operations.push(`CreateTask:Task_MovePlayerAndGroundSprites:0`, `LoadCharacterSprite:${params[0] === 0 ? (runtime.playerGender === MALE ? 'player_male' : 'player_female') : 'rival'}`, `LoadGroundSprite:${params[1]}`, `CreateSprite:character:${x}:${y}`, `CreateSprite:ground:${x}:${y + 38}`);
}

function executeCreditsCommand(runtime: CreditsRuntime, mgr: CreditsResources): number {
  const cmd = sCreditsScript[mgr.scrcmdidx];
  switch (cmd.cmd) {
    case CREDITSSCRCMD_PRINT:
      beginPaletteFade(runtime, 'credits-window-out');
      mgr.mainseqno = CREDITSSCENE_PRINT_ADDPRINTER1;
      runtime.operations.push(`FillWindowPixelBuffer:${mgr.windowId}:0`);
      return mgr.canSpeedThrough;
    case CREDITSSCRCMD_MAPNEXT:
      mgr.mainseqno = CREDITSSCENE_MAPNEXT_DESTROYWINDOW;
      mgr.whichMon = cmd.param;
      runtime.operations.push('FadeSelectedPals:1:0:0x3FFFFFFF');
      break;
    case CREDITSSCRCMD_MAP:
      mgr.mainseqno = CREDITSSCENE_MAP_LOADMAP_CREATESPRITES;
      mgr.whichMon = cmd.param;
      break;
    case CREDITSSCRCMD_MON:
      mgr.mainseqno = CREDITSSCENE_MON_DESTROY_ASSETS;
      mgr.whichMon = cmd.param;
      runtime.operations.push('FadeScreen:FADE_TO_BLACK:0');
      break;
    case CREDITSSCRCMD_THEENDGFX:
      mgr.mainseqno = CREDITSSCENE_THEEND_DESTROY_ASSETS;
      mgr.whichMon = cmd.param;
      beginPaletteFade(runtime, 'theend-destroy');
      break;
    case CREDITSSCRCMD_WAITBUTTON:
      mgr.mainseqno = CREDITSSCENE_WAITBUTTON;
      break;
  }
  mgr.timer = cmd.duration;
  mgr.scrcmdidx += 1;
  return 0;
}

export function DoOverworldMapScrollScene(runtime: CreditsRuntime, whichMon: number): boolean {
  const mgr = requireMgr(runtime);
  switch (mgr.subseqno) {
    case 0:
      runtime.flags.add('FLAG_DONT_SHOW_MAP_NAME_POPUP');
      runtime.gDisableMapMusicChangeOnMapLoad = MUSIC_DISABLE_KEEP;
      mgr.ovwldseqno = 0;
      mgr.subseqno += 1;
    // fallthrough
    case 1: {
      const done = runtime.overworldScrollResults.shift() ?? true;
      runtime.operations.push(`Overworld_DoScrollSceneForCredits:${whichMon}:${mgr.ovwldseqno}`);
      if (!done) return false;
      CreateCreditsWindow(runtime);
      setGpuReg(runtime, 'WIN0H', winRange(0, 240));
      setGpuReg(runtime, 'WIN0V', winRange(36, 124));
      SwitchWin1OffWin0On(runtime);
      InitBgDarkenEffect(runtime);
      runtime.operations.push('Menu_LoadStdPalAt:15', 'SetCreditsWindowBlack');
      return true;
    }
    default:
      return false;
  }
}

export function SwitchWin1OffWin0On(runtime: CreditsRuntime): void {
  runtime.operations.push('ClearGpuRegBits:DISPCNT:WIN1', 'SetGpuRegBits:DISPCNT:WIN0');
  setGpuReg(runtime, 'WININ', 0x1f3f);
  setGpuReg(runtime, 'WINOUT', 0x000e);
}

export function InitBgDarkenEffect(runtime: CreditsRuntime): void {
  setGpuReg(runtime, 'BLDCNT', 0x0e40);
  setGpuReg(runtime, 'BLDALPHA', (16 << 8) | 4);
  setGpuReg(runtime, 'BLDY', 10);
}

export function CreateCreditsWindow(runtime: CreditsRuntime): void {
  const mgr = requireMgr(runtime);
  mgr.windowId = 0;
  runtime.operations.push('AddWindow:sCreditsWindowTemplate', `FillWindowPixelBuffer:${mgr.windowId}:0`, `PutWindowTilemap:${mgr.windowId}`, `CopyWindowToVram:${mgr.windowId}:COPYWIN_FULL`);
  mgr.windowIsActive = true;
}

export function DestroyCreditsWindow(runtime: CreditsRuntime): void {
  const mgr = requireMgr(runtime);
  if (mgr.windowIsActive) {
    runtime.operations.push(`RemoveWindow:${mgr.windowId}`, 'CleanupOverworldWindowsAndTilemaps');
    mgr.windowIsActive = false;
  }
}

function createSprite(runtime: CreditsRuntime, kind: CreditsSprite['kind'], x: number, y: number, paletteNum: number, subpriority: number): number {
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, kind, x, y, paletteNum, subpriority, destroyed: false });
  return id;
}

function runFrame(runtime: CreditsRuntime): void {
  runtime.operations.push('RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade');
}

function beginPaletteFade(runtime: CreditsRuntime, tag: string): void {
  runtime.paletteFadeActive = true;
  runtime.operations.push(`BeginNormalPaletteFade:${tag}`);
}

function setGpuReg(runtime: CreditsRuntime, reg: string, value: number): void {
  runtime.gpuRegs[reg] = value;
  runtime.operations.push(`SetGpuReg:${reg}:${value}`);
}

function winRange(a: number, b: number): number {
  return ((a & 0xff) << 8) | (b & 0xff);
}

function mapSceneToSpriteScene(whichMon: number): number {
  switch (whichMon) {
    case 6: return 2;
    case 9: return 3;
    case 12: return 4;
    default: return 1;
  }
}

function requireMgr(runtime: CreditsRuntime): CreditsResources {
  if (!runtime.sCreditsMgr) throw new Error('credits manager is not initialized');
  return runtime.sCreditsMgr;
}

function parseCreditsScript(source: string): CreditsScrcmd[] {
  const body = source.split('static const struct CreditsScrcmd sCreditsScript[] = {', 2)[1].split('};', 1)[0];
  const mapNames = ['ROUTE23', 'VIRIDIAN_CITY', 'PEWTER_CITY', 'CERULEAN_CITY', 'ROUTE25', 'VERMILION_CITY', 'ROUTE10', 'CELADON_CITY', 'SAFFRON_CITY', 'ROUTE17', 'FUCHSIA_CITY', 'CINNABAR_ISLAND', 'ROUTE21_NORTH'];
  const monNames = ['CHARIZARD', 'VENUSAUR', 'BLASTOISE', 'PIKACHU'];
  const closingNames = ['ALLRIGHTSRESERVED', 'THEEND'];
  const textNames = parseCreditStringNames(source);
  return body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('CREDITS_')).map((line) => {
    const match = /CREDITS_(\w+)\(([^),]+)(?:,\s*(\d+))?\)/u.exec(line);
    if (!match) throw new Error(`Unable to parse credits script line: ${line}`);
    const [, macro, symbol, durationRaw] = match;
    if (macro === 'PRINT') return { cmd: CREDITSSCRCMD_PRINT, param: textNames.indexOf(symbol), duration: Number(durationRaw), macro, symbol } as CreditsScrcmd;
    if (macro === 'MAPNEXT') return { cmd: CREDITSSCRCMD_MAPNEXT, param: mapNames.indexOf(symbol), duration: Number(durationRaw), macro, symbol } as CreditsScrcmd;
    if (macro === 'MAP') return { cmd: CREDITSSCRCMD_MAP, param: mapNames.indexOf(symbol), duration: Number(durationRaw), macro, symbol } as CreditsScrcmd;
    if (macro === 'MON') return { cmd: CREDITSSCRCMD_MON, param: monNames.indexOf(symbol), duration: 0, macro, symbol } as CreditsScrcmd;
    if (macro === 'THEENDGFX') return { cmd: CREDITSSCRCMD_THEENDGFX, param: closingNames.indexOf(symbol), duration: Number(durationRaw), macro, symbol } as CreditsScrcmd;
    return { cmd: CREDITSSCRCMD_WAITBUTTON, param: 0, duration: Number(symbol), macro, symbol: 'WAITBUTTON' } as CreditsScrcmd;
  });
}

function parseCreditsTexts(source: string): CreditsTextHeader[] {
  const body = source.split('static const struct CreditsTextHeader sCreditsTexts[] = {', 2)[1].split('};', 1)[0];
  const regex = /\{\s*(g\w+),\s*(g\w+),\s*(TRUE|FALSE)\s*\}/gu;
  const out: CreditsTextHeader[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body))) {
    out.push({ title: match[1], names: match[2], unused: match[3] === 'TRUE' });
  }
  return out;
}

function parseCreditStringNames(source: string): string[] {
  const enumBody = source.split('enum CreditsString', 2)[1].split('};', 1)[0];
  return Array.from(enumBody.matchAll(/CREDITS_STRING_([A-Z0-9_]+)/gu), (match) => match[1]);
}
