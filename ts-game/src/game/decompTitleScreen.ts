import titleScreenSourceRaw from '../../../src/title_screen.c?raw';
import songsSource from '../../../include/constants/songs.h?raw';
import speciesSource from '../../../include/constants/species.h?raw';
import { A_BUTTON, B_BUTTON, DPAD_UP } from './decompMenu';

export const TITLESCREENSCENE_INIT = 0;
export const TITLESCREENSCENE_FLASHSPRITE = 1;
export const TITLESCREENSCENE_FADEIN = 2;
export const TITLESCREENSCENE_RUN = 3;
export const TITLESCREENSCENE_RESTART = 4;
export const TITLESCREENSCENE_CRY = 5;
export const TASK_NONE = 0xff;
export const MAX_SPRITES = 64;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const START_BUTTON = 1 << 3;
export const SELECT_BUTTON = 1 << 2;
export const KEYSTROKE_DELSAVE = B_BUTTON | SELECT_BUTTON | DPAD_UP;
export const KEYSTROKE_BERRY_FIX = B_BUTTON | SELECT_BUTTON;
export const TILE_TAG_FLAME_OR_LEAF = 0;
export const TILE_TAG_BLANK_OR_STREAK = 1;
export const TILE_TAG_BLANK = 2;
export const TILE_TAG_SLASH = 3;
export const PAL_TAG_DEFAULT = 0;
export const PAL_TAG_UNUSED = 1;
export const PAL_TAG_SLASH = 2;
export const TITLE_SPECIES = parseDefineValue(speciesSource, 'SPECIES_CHARIZARD');
export const MUS_TITLE = parseDefineValue(songsSource, 'MUS_TITLE');

const titleScreenSource = keepFireRedBranch(titleScreenSourceRaw);

export interface TitleScreenTask {
  id: number;
  func: TitleScreenTaskFunc;
  data: number[];
  destroyed: boolean;
}

export type TitleScreenTaskFunc =
  | 'Task_TitleScreenTimer'
  | 'Task_TitleScreenMain'
  | 'Task_TitleScreen_SlideWin0'
  | 'Task_TitleScreen_BlinkPressStart'
  | 'Task_FlameSpawner'
  | 'Task_LeafSpawner';

export interface TitleScreenSprite {
  id: number;
  template: string;
  x: number;
  y: number;
  priority: number;
  data: number[];
  invisible: boolean;
  animEnded: boolean;
  callback: TitleScreenSpriteCallback;
  destroyed: boolean;
}

export type TitleScreenSpriteCallback =
  | 'SpriteCallbackDummy'
  | 'SpriteCallback_TitleScreenFlame'
  | 'SpriteCallback_TitleScreenLeaf'
  | 'SpriteCallback_Streak'
  | 'SpriteCallback_Slash';

export interface TitleScreenRuntime {
  gMainState: number;
  sTitleScreenTimerTaskId: number;
  tasks: TitleScreenTask[];
  sprites: TitleScreenSprite[];
  scanlineEffect: { state: number; srcBuffer: 0 | 1 };
  scanlineEffectRegBuffers: [number[], number[]];
  paletteFadeActive: boolean;
  paletteFadeY: number;
  paletteFadeBlendColor: string;
  blendPalettesGraduallyActive: boolean;
  waitingForBgmStop: boolean;
  saveFileStatus: 'SAVE_STATUS_EMPTY' | 'SAVE_STATUS_INVALID' | 'SAVE_STATUS_OK';
  optionsSound: number;
  newKeys: number;
  heldKeys: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  helpSystemEnabled: boolean;
  operations: string[];
}

export const sBgTemplates = parseBgTemplates(titleScreenSource);
export const sSceneFuncs = parseSceneFuncs(titleScreenSource);
export const sSpriteSheets = parseSpriteSheets(titleScreenSource);
export const sSpritePals = parseSpritePals(titleScreenSource);
export const sFlameXPositions = parseNumericConstArray(titleScreenSource, 'sFlameXPositions');
export const sStreakYPositions = parseNumericConstArray(titleScreenSourceRaw, 'sStreakYPositions');
export const sSpriteAnimFlameFrames = parseAnimFrames(titleScreenSource, 'sSpriteAnim_Flame');

export const createTitleScreenRuntime = (): TitleScreenRuntime => ({
  gMainState: 0,
  sTitleScreenTimerTaskId: TASK_NONE,
  tasks: [],
  sprites: [],
  scanlineEffect: { state: 0, srcBuffer: 0 },
  scanlineEffectRegBuffers: [Array.from({ length: 0x140 }, () => 0), Array.from({ length: 0x140 }, () => 0)],
  paletteFadeActive: false,
  paletteFadeY: 0,
  paletteFadeBlendColor: 'RGB_BLACK',
  blendPalettesGraduallyActive: false,
  waitingForBgmStop: false,
  saveFileStatus: 'SAVE_STATUS_EMPTY',
  optionsSound: 0,
  newKeys: 0,
  heldKeys: 0,
  mainCallback2: null,
  vblankCallback: null,
  helpSystemEnabled: false,
  operations: []
});

export function CB2_InitTitleScreen(runtime: TitleScreenRuntime): void {
  switch (runtime.gMainState) {
    default:
      runtime.gMainState = 0;
    // fallthrough
    case 0:
      SetVBlankCallback(runtime, null);
      [
        'StartTimer1',
        'InitHeap:gHeap:HEAP_SIZE',
        'ResetTasks',
        'ResetSpriteData',
        'FreeAllSpritePalettes',
        'ResetPaletteFade'
      ].forEach((op) => runtime.operations.push(op));
      ResetGpuRegs(runtime);
      runtime.operations.push('DmaFill16:VRAM');
      runtime.operations.push('DmaFill32:OAM');
      runtime.operations.push('DmaFill16:PLTT');
      runtime.operations.push('ResetBgsAndClearDma3BusyFlags:false');
      runtime.operations.push(`InitBgsFromTemplates:0:sBgTemplates:${sBgTemplates.length}`);
      runtime.operations.push('SetGpuRegBits:REG_OFFSET_DISPCNT:DISPCNT_OBJ_1D_MAP|DISPCNT_OBJ_ON');
      runtime.sTitleScreenTimerTaskId = TASK_NONE;
      break;
    case 1:
      [
        'LoadPalette:gGraphics_TitleScreen_GameTitleLogoPals:BG_PLTT_ID(0):13*PLTT_SIZE_4BPP',
        'DecompressAndCopyTileDataToVram:0:gGraphics_TitleScreen_GameTitleLogoTiles:0:0:0',
        'DecompressAndCopyTileDataToVram:0:gGraphics_TitleScreen_GameTitleLogoMap:0:0:1',
        'LoadPalette:gGraphics_TitleScreen_BoxArtMonPals:BG_PLTT_ID(13):PLTT_SIZE_4BPP',
        'DecompressAndCopyTileDataToVram:1:gGraphics_TitleScreen_BoxArtMonTiles:0:0:0',
        'DecompressAndCopyTileDataToVram:1:gGraphics_TitleScreen_BoxArtMonMap:0:0:1',
        'LoadPalette:gGraphics_TitleScreen_BackgroundPals:BG_PLTT_ID(15):PLTT_SIZE_4BPP',
        'DecompressAndCopyTileDataToVram:2:gGraphics_TitleScreen_CopyrightPressStartTiles:0:0:0',
        'DecompressAndCopyTileDataToVram:2:gGraphics_TitleScreen_CopyrightPressStartMap:0:0:1',
        'LoadPalette:gGraphics_TitleScreen_BackgroundPals:BG_PLTT_ID(14):PLTT_SIZE_4BPP',
        'DecompressAndCopyTileDataToVram:3:sBorderBgTiles:0:0:0',
        'DecompressAndCopyTileDataToVram:3:sBorderBgMap:0:0:1'
      ].forEach((op) => runtime.operations.push(op));
      LoadSpriteGfxAndPals(runtime);
      break;
    case 2:
      if (!FreeTempTileDataBuffersIfPossible(runtime)) {
        runtime.operations.push('BlendPalettes:PALETTES_BG:16:RGB_BLACK');
        CreateTask(runtime, 'Task_TitleScreenMain', 4);
        runtime.sTitleScreenTimerTaskId = CreateTask(runtime, 'Task_TitleScreenTimer', 2);
        SetVBlankCallback(runtime, 'VBlankCB');
        SetMainCallback2(runtime, 'CB2_TitleScreenRun');
        runtime.operations.push(`m4aSongNumStart:${MUS_TITLE}`);
      }
      return;
  }
  runtime.gMainState += 1;
}

export function ResetGpuRegs(runtime: TitleScreenRuntime): void {
  [
    'DISPCNT',
    'BLDCNT',
    'BLDALPHA',
    'BLDY',
    'BG0HOFS',
    'BG0VOFS',
    'BG1HOFS',
    'BG1VOFS',
    'BG2HOFS',
    'BG2VOFS',
    'BG3HOFS',
    'BG3VOFS'
  ].forEach((reg) => runtime.operations.push(`SetGpuReg:REG_OFFSET_${reg}:0`));
}

export function CB2_TitleScreenRun(runtime: TitleScreenRuntime): void {
  runtime.operations.push('RunTasks');
  runtime.operations.push('AnimateSprites');
  runtime.operations.push('BuildOamBuffer');
  runtime.operations.push('UpdatePaletteFade');
}

export function VBlankCB(runtime: TitleScreenRuntime): void {
  runtime.operations.push('LoadOam');
  runtime.operations.push('ProcessSpriteCopyRequests');
  runtime.operations.push('TransferPlttBuffer');
  runtime.operations.push('ScanlineEffect_InitHBlankDmaTransfer');
  if (runtime.sTitleScreenTimerTaskId !== TASK_NONE) runtime.tasks[runtime.sTitleScreenTimerTaskId].data[0] += 1;
}

export function Task_TitleScreenTimer(runtime: TitleScreenRuntime, taskId: number): void {
  if (runtime.tasks[taskId].data[0] >= 2700) {
    runtime.sTitleScreenTimerTaskId = TASK_NONE;
    DestroyTask(runtime, taskId);
  }
}

export function Task_TitleScreenMain(runtime: TitleScreenRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (
    (runtime.newKeys & (A_BUTTON | B_BUTTON | START_BUTTON)) !== 0
    && data[0] !== TITLESCREENSCENE_RUN
    && data[0] !== TITLESCREENSCENE_RESTART
    && data[0] !== TITLESCREENSCENE_CRY
  ) {
    ScheduleStopScanlineEffect(runtime);
    LoadMainTitleScreenPalsAndResetBgs(runtime);
    SetPalOnOrCreateBlankSprite(runtime, data[5] !== 0);
    SetTitleScreenScene(data, TITLESCREENSCENE_RUN);
  } else {
    sceneHandlers[data[0] ?? 0](runtime, data);
  }
}

export function SetTitleScreenScene(data: number[], sceneNum: number): void {
  data[1] = 0;
  data[0] = sceneNum;
}

export function SetTitleScreenScene_Init(runtime: TitleScreenRuntime, data: number[]): void {
  runtime.operations.push('HideBg:0');
  runtime.operations.push('ShowBg:1');
  runtime.operations.push('ShowBg:2');
  runtime.operations.push('ShowBg:3');
  runtime.scanlineEffectRegBuffers[0].fill(0);
  runtime.scanlineEffectRegBuffers[1].fill(0);
  runtime.operations.push('ScanlineEffect_SetParams:REG_ADDR_BLDY');
  SetTitleScreenScene(data, TITLESCREENSCENE_FLASHSPRITE);
}

export function SetTitleScreenScene_FlashSprite(runtime: TitleScreenRuntime, data: number[]): void {
  switch (data[1]) {
    case 0:
      runtime.operations.push('SetGpuReg:REG_OFFSET_BLDCNT:BLDCNT_TGT1_BG1|BLDCNT_EFFECT_LIGHTEN');
      runtime.operations.push('SetGpuReg:REG_OFFSET_BLDY:0');
      data[2] = 128;
      UpdateScanlineEffectRegBuffer(runtime, data[2]);
      data[1] += 1;
      break;
    case 1:
      data[2] -= 4;
      UpdateScanlineEffectRegBuffer(runtime, data[2]);
      if (data[2] < 0) {
        runtime.scanlineEffect.state = 3;
        data[1] += 1;
      }
      break;
    case 2:
      runtime.operations.push('SetGpuReg:REG_OFFSET_BLDCNT:0');
      runtime.operations.push('SetGpuReg:REG_OFFSET_BLDY:0');
      SetTitleScreenScene(data, TITLESCREENSCENE_FADEIN);
      break;
  }
}

export function SetTitleScreenScene_FadeIn(runtime: TitleScreenRuntime, data: number[]): void {
  switch (data[1]) {
    case 0:
      data[2] = 0;
      data[1] += 1;
      break;
    case 1:
      data[2] += 1;
      if (data[2] > 10) {
        runtime.operations.push('TintPalette_GrayScale2:BG_PLTT_ID(13)');
        runtime.operations.push('BeginNormalPaletteFade:1<<13:9:16:0:RGB_BLACK');
        runtime.paletteFadeActive = true;
        data[1] += 1;
      }
      break;
    case 2:
      if (!runtime.paletteFadeActive) {
        data[2] = 0;
        data[1] += 1;
      }
      break;
    case 3:
      data[2] += 1;
      if (data[2] > 36) {
        CreateTask(runtime, 'Task_TitleScreen_SlideWin0', 3);
        runtime.operations.push('BlendPalettesGradually:1<<13:-4:1:16:RGB(30,30,31):0:0');
        runtime.blendPalettesGraduallyActive = true;
        data[2] = 0;
        data[1] += 1;
      }
      break;
    case 4:
      if (!runtime.blendPalettesGraduallyActive) {
        runtime.operations.push('BlendPalettesGradually:1<<13:-4:15:0:RGB(30,30,31):0:0');
        runtime.blendPalettesGraduallyActive = true;
        data[1] += 1;
      }
      break;
    case 5:
      data[2] += 1;
      if (data[2] > 20) {
        data[2] = 0;
        runtime.operations.push('BlendPalettesGradually:1<<13:-4:1:16:RGB(30,30,31):0:0');
        runtime.blendPalettesGraduallyActive = true;
        data[1] += 1;
      }
      break;
    case 6:
      if (!runtime.blendPalettesGraduallyActive) {
        runtime.operations.push('BlendPalettesGradually:1<<13:-4:15:0:RGB(30,30,31):0:0');
        runtime.blendPalettesGraduallyActive = true;
        data[1] += 1;
      }
      break;
    case 7:
      data[2] += 1;
      if (data[2] > 20) {
        data[2] = 0;
        runtime.operations.push('BlendPalettesGradually:1<<13:-3:0:16:RGB(30,30,31):0:0');
        runtime.blendPalettesGraduallyActive = true;
        data[1] += 1;
      }
      break;
    case 8:
      if (!runtime.blendPalettesGraduallyActive) {
        data[5] = 1;
        runtime.operations.push(`BlendPalettes:mainTitlePalettes:16:RGB(30,30,31):blankPal:${CreateBlankSprite(runtime)}`);
        runtime.operations.push('BeginNormalPaletteFade:mainTitlePalettes:1:16:0:RGB(30,30,31)');
        runtime.paletteFadeActive = true;
        runtime.operations.push('ShowBg:0');
        runtime.operations.push('CpuCopy16:gGraphics_TitleScreen_BoxArtMonPals:BG_PLTT_ID(13):PLTT_SIZE_4BPP');
        runtime.operations.push('BlendPalettesGradually:1<<13:1:15:0:RGB(30,30,31):0:0');
        runtime.blendPalettesGraduallyActive = true;
        data[1] += 1;
      }
      break;
    case 9:
      if (!runtime.blendPalettesGraduallyActive && !runtime.paletteFadeActive) SetTitleScreenScene(data, TITLESCREENSCENE_RUN);
      break;
  }
}

export function SetTitleScreenScene_Run(runtime: TitleScreenRuntime, data: number[]): void {
  switch (data[1]) {
    case 0:
      runtime.operations.push('SetHelpContext:HELPCONTEXT_TITLE_SCREEN');
      CreateTask(runtime, 'Task_TitleScreen_BlinkPressStart', 0);
      CreateTask(runtime, 'Task_FlameSpawner', 5);
      SetGpuRegsForTitleScreenRun(runtime);
      data[6] = CreateSlashSprite(runtime);
      HelpSystem_Enable(runtime);
      data[1] += 1;
    // fallthrough
    case 1:
      if ((runtime.heldKeys & KEYSTROKE_DELSAVE) === KEYSTROKE_DELSAVE) {
        DeactivateSlashSprite(runtime, data[6]);
        DestroyTask(runtime, FindTaskIdByFunc(runtime, 'Task_TitleScreenMain'));
        SetMainCallback2(runtime, 'CB2_FadeOutTransitionToSaveClearScreen');
      } else if ((runtime.heldKeys & KEYSTROKE_BERRY_FIX) === KEYSTROKE_BERRY_FIX) {
        DeactivateSlashSprite(runtime, data[6]);
        DestroyTask(runtime, FindTaskIdByFunc(runtime, 'Task_TitleScreenMain'));
        SetMainCallback2(runtime, 'CB2_FadeOutTransitionToBerryFix');
      } else if ((runtime.newKeys & (A_BUTTON | START_BUTTON)) !== 0) {
        SetTitleScreenScene(data, TITLESCREENSCENE_CRY);
      } else if (!FuncIsActiveTask(runtime, 'Task_TitleScreenTimer')) {
        SetTitleScreenScene(data, TITLESCREENSCENE_RESTART);
      }
      break;
  }
}

export function SetGpuRegsForTitleScreenRun(runtime: TitleScreenRuntime): void {
  runtime.operations.push('SetGpuRegBits:REG_OFFSET_DISPCNT:DISPCNT_OBJWIN_ON');
  runtime.operations.push('SetGpuReg:REG_OFFSET_WINOUT:WINOUT_WIN01_BG_ALL|WINOUT_WIN01_OBJ|WINOUT_WINOBJ_ALL');
  runtime.operations.push('SetGpuReg:REG_OFFSET_BLDCNT:BLDCNT_TGT1_BG0|BLDCNT_EFFECT_LIGHTEN');
  runtime.operations.push('SetGpuReg:REG_OFFSET_BLDY:13');
}

export function SetTitleScreenScene_Restart(runtime: TitleScreenRuntime, data: number[]): void {
  switch (data[1]) {
    case 0:
      DeactivateSlashSprite(runtime, data[6]);
      data[1] += 1;
      break;
    case 1:
      if (!runtime.paletteFadeActive && !IsSlashSpriteDeactivated(runtime, data[6])) {
        runtime.operations.push('FadeOutMapMusic:10');
        runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL:3:0:16:RGB_BLACK');
        runtime.paletteFadeActive = true;
        SignalEndTitleScreenPaletteSomethingTask(runtime);
        data[1] += 1;
      }
      break;
    case 2:
      if (!runtime.waitingForBgmStop && !runtime.paletteFadeActive) {
        DestroyTask(runtime, FindTaskIdByFunc(runtime, 'Task_TitleScreen_BlinkPressStart'));
        data[2] = 0;
        data[1] += 1;
      }
      break;
    case 3:
      data[2] += 1;
      if (data[2] >= 20) {
        DestroyTask(runtime, FindTaskIdByFunc(runtime, 'Task_TitleScreen_BlinkPressStart'));
        data[1] += 1;
      }
      break;
    case 4:
      HelpSystem_Disable(runtime);
      DestroyTask(runtime, FindTaskIdByFunc(runtime, 'Task_TitleScreenMain'));
      SetMainCallback2(runtime, 'CB2_InitCopyrightScreenAfterTitleScreen');
      break;
  }
}

export function SetTitleScreenScene_Cry(runtime: TitleScreenRuntime, data: number[]): void {
  switch (data[1]) {
    case 0:
      if (!runtime.paletteFadeActive) {
        runtime.operations.push(`PlayCry_Normal:${TITLE_SPECIES}:0`);
        DeactivateSlashSprite(runtime, data[6]);
        data[2] = 0;
        data[1] += 1;
      }
      break;
    case 1:
      if (data[2] < 90) data[2] += 1;
      else if (!IsSlashSpriteDeactivated(runtime, data[6])) {
        runtime.operations.push('BeginNormalPaletteFade:PALETTES_ALL_MASKED:0:0:16:RGB_WHITE');
        runtime.paletteFadeActive = true;
        SignalEndTitleScreenPaletteSomethingTask(runtime);
        runtime.operations.push('FadeOutBGM:4');
        data[1] += 1;
      }
      break;
    case 2:
      if (!runtime.paletteFadeActive) {
        [
          'SeedRngAndSetTrainerId',
          'SetSaveBlocksPointers',
          'ResetMenuAndMonGlobals',
          'Save_ResetSaveCounters',
          'LoadGameSave:SAVE_NORMAL'
        ].forEach((op) => runtime.operations.push(op));
        if (runtime.saveFileStatus === 'SAVE_STATUS_EMPTY' || runtime.saveFileStatus === 'SAVE_STATUS_INVALID') runtime.operations.push('Sav2_ClearSetDefault');
        runtime.operations.push(`SetPokemonCryStereo:${runtime.optionsSound}`);
        runtime.operations.push('InitHeap:gHeap:HEAP_SIZE');
        SetMainCallback2(runtime, 'CB2_InitMainMenu');
        DestroyTask(runtime, FindTaskIdByFunc(runtime, 'Task_TitleScreenMain'));
      }
      break;
  }
}

export function Task_TitleScreen_SlideWin0(runtime: TitleScreenRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      runtime.operations.push('SetGpuRegBits:REG_OFFSET_DISPCNT:DISPCNT_WIN0_ON');
      runtime.operations.push('SetGpuReg:REG_OFFSET_WININ:WININ_WIN0_ALL');
      runtime.operations.push('SetGpuReg:REG_OFFSET_WINOUT:WINOUT_WIN01_BG0|WINOUT_WIN01_BG1|WINOUT_WIN01_BG2|WINOUT_WIN01_OBJ|WINOUT_WIN01_CLR');
      runtime.operations.push(`SetGpuReg:REG_OFFSET_WIN0V:WIN_RANGE(0,${DISPLAY_HEIGHT})`);
      runtime.operations.push('SetGpuReg:REG_OFFSET_WIN0H:WIN_RANGE(0,0)');
      runtime.operations.push('BlendPalettes:1<<0xE:0:RGB_BLACK');
      data[0] += 1;
      break;
    case 1:
      data[1] += 24 << 4;
      data[2] = data[1] >> 4;
      if (data[2] >= DISPLAY_WIDTH) {
        data[2] = DISPLAY_WIDTH;
        data[0] += 1;
      }
      runtime.operations.push(`SetGpuReg:REG_OFFSET_WIN0H:WIN_RANGE(0,${data[2]})`);
      break;
    case 2:
      data[3] += 1;
      if (data[3] >= 10) {
        data[3] = 0;
        data[0] += 1;
      }
      break;
    case 3:
      runtime.operations.push('SetGpuReg:REG_OFFSET_WINOUT:WINOUT_WIN01_BG0|WINOUT_WIN01_BG1|WINOUT_WIN01_BG3|WINOUT_WIN01_OBJ|WINOUT_WIN01_CLR');
      runtime.operations.push(`SetGpuReg:REG_OFFSET_WIN0H:WIN_RANGE(${DISPLAY_WIDTH},${DISPLAY_WIDTH})`);
      runtime.operations.push('ChangeBgX:2:-0xF000:0');
      runtime.operations.push('BlendPalettes:1<<0xF:0:RGB_BLACK');
      data[1] = 10 * 24 << 4;
      data[0] += 1;
      break;
    case 4:
      data[1] -= 24 << 4;
      data[2] = data[1] >> 4;
      if (data[2] <= 0) {
        data[2] = 0;
        data[0] += 1;
      }
      runtime.operations.push(`ChangeBgX:2:${-data[2] << 8}:0`);
      runtime.operations.push(`SetGpuReg:REG_OFFSET_WIN0H:WIN_RANGE(${data[2]},${DISPLAY_WIDTH})`);
      break;
    case 5:
      runtime.operations.push('ClearGpuRegBits:REG_OFFSET_DISPCNT:DISPCNT_WIN0_ON');
      DestroyTask(runtime, taskId);
      break;
  }
}

export function Task_TitleScreen_BlinkPressStart(runtime: TitleScreenRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[15] && runtime.paletteFadeActive) data[14] = 1;
  if (data[14] && !runtime.paletteFadeActive) DestroyTask(runtime, taskId);
  else {
    data[2] = !data[1] ? 60 : 30;
    data[0] += 1;
    if (data[0] >= data[2]) {
      data[0] = 0;
      data[1] ^= 1;
      runtime.operations.push(data[1] ? 'BlinkPressStart:hide' : 'BlinkPressStart:show');
      if (data[14]) runtime.operations.push(`BlendPalettes:0x00008000:${runtime.paletteFadeY}:${runtime.paletteFadeBlendColor}`);
    }
  }
}

export function SignalEndTitleScreenPaletteSomethingTask(runtime: TitleScreenRuntime): void {
  const taskId = FindTaskIdByFunc(runtime, 'Task_TitleScreen_BlinkPressStart');
  if (taskId !== TASK_NONE) runtime.tasks[taskId].data[15] = 1;
}

export function UpdateScanlineEffectRegBuffer(runtime: TitleScreenRuntime, y: number): void {
  const buffer = runtime.scanlineEffectRegBuffers[runtime.scanlineEffect.srcBuffer];
  if (y >= 0) buffer[y] = 16;
  for (let i = 0; i < 16; i += 1) {
    if (y + i >= 0) buffer[y + i] = 15 - i;
    if (y - i >= 0) buffer[y - i] = 15 - i;
  }
  for (let i = y + 16; i < 160; i += 1) if (i >= 0) buffer[i] = 0;
  for (let i = y - 16; i >= 0; i -= 1) if (i >= 0) buffer[i] = 0;
}

export function ScheduleStopScanlineEffect(runtime: TitleScreenRuntime): void {
  if (runtime.scanlineEffect.state) runtime.scanlineEffect.state = 3;
  runtime.operations.push('SetGpuReg:REG_OFFSET_BLDCNT:0');
  runtime.operations.push('SetGpuReg:REG_OFFSET_BLDY:0');
}

export function LoadMainTitleScreenPalsAndResetBgs(runtime: TitleScreenRuntime): void {
  const slideTask = FindTaskIdByFunc(runtime, 'Task_TitleScreen_SlideWin0');
  if (slideTask !== TASK_NONE) DestroyTask(runtime, slideTask);
  runtime.blendPalettesGraduallyActive = false;
  [
    'DestroyBlendPalettesGraduallyTask',
    'ResetPaletteFadeControl',
    'LoadPalette:gGraphics_TitleScreen_GameTitleLogoPals:BG_PLTT_ID(0):13*PLTT_SIZE_4BPP',
    'LoadPalette:gGraphics_TitleScreen_BoxArtMonPals:BG_PLTT_ID(13):PLTT_SIZE_4BPP',
    'LoadPalette:gGraphics_TitleScreen_BackgroundPals:BG_PLTT_ID(15):PLTT_SIZE_4BPP',
    'LoadPalette:gGraphics_TitleScreen_BackgroundPals:BG_PLTT_ID(14):PLTT_SIZE_4BPP',
    'ResetBgPositions',
    'ClearGpuRegBits:REG_OFFSET_DISPCNT:DISPCNT_WIN0_ON|DISPCNT_WIN1_ON|DISPCNT_OBJWIN_ON',
    'ShowBg:1',
    'ShowBg:2',
    'ShowBg:0',
    'ShowBg:3'
  ].forEach((op) => runtime.operations.push(op));
}

export function CB2_FadeOutTransitionToSaveClearScreen(runtime: TitleScreenRuntime): void {
  if (!UpdatePaletteFade(runtime)) SetMainCallback2(runtime, 'CB2_SaveClearScreen_Init');
}

export function CB2_FadeOutTransitionToBerryFix(runtime: TitleScreenRuntime): void {
  if (!UpdatePaletteFade(runtime)) {
    runtime.operations.push('m4aMPlayAllStop');
    SetMainCallback2(runtime, 'CB2_InitBerryFixProgram');
  }
}

export function LoadSpriteGfxAndPals(runtime: TitleScreenRuntime): void {
  for (const sheet of sSpriteSheets) runtime.operations.push(`LoadCompressedSpriteSheet:${sheet.tileTag}:${sheet.size}`);
  runtime.operations.push(`LoadSpritePalettes:${sSpritePals.map((pal) => pal.tag).join(',')}`);
}

export function SpriteCallback_TitleScreenFlame(runtime: TitleScreenRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  sprite.data[0] -= sprite.data[1];
  sprite.x = sprite.data[0] >> 4;
  if (sprite.x < -8) {
    DestroySprite(runtime, spriteId);
    return;
  }
  sprite.data[2] += sprite.data[3];
  sprite.y = sprite.data[2] >> 4;
  if (sprite.y < 16 || sprite.y > 200 || sprite.animEnded) {
    DestroySprite(runtime, spriteId);
    return;
  }
  if (sprite.data[7] !== 0) {
    sprite.data[7] -= 1;
    if (sprite.data[7] === 0) {
      runtime.operations.push(`StartSpriteAnim:${spriteId}:0`);
      sprite.invisible = false;
    }
  }
}

export function CreateFlameSprite(runtime: TitleScreenRuntime, x: number, y: number, xspeed: number, yspeed: number, createFlame: boolean): boolean {
  const spriteId = CreateSprite(runtime, createFlame ? 'sSpriteTemplate_FlameOrLeaf' : 'sSpriteTemplate_BlankFlame', x, y, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.sprites[spriteId];
    sprite.data[0] = x * 16;
    sprite.data[1] = xspeed;
    sprite.data[2] = y * 16;
    sprite.data[3] = yspeed;
    sprite.data[4] = 0;
    sprite.data[5] = (xspeed * yspeed) % 16;
    sprite.data[6] = createFlame ? 1 : 0;
    sprite.callback = 'SpriteCallback_TitleScreenFlame';
    return true;
  }
  return false;
}

export function Task_FlameSpawner(runtime: TitleScreenRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      TitleScreen_srand(runtime, taskId, 3, 30840);
      data[0] += 1;
      break;
    case 1:
      data[1] += 1;
      if (data[1] >= data[2]) {
        data[1] = 0;
        TitleScreen_rand(runtime, taskId, 3);
        data[2] = 18;
        let xspeed = (TitleScreen_rand(runtime, taskId, 3) % 4) - 2;
        let yspeed = (TitleScreen_rand(runtime, taskId, 3) % 8) - 16;
        const y = (TitleScreen_rand(runtime, taskId, 3) % 3) + 116;
        const x = TitleScreen_rand(runtime, taskId, 3) % DISPLAY_WIDTH;
        CreateFlameSprite(runtime, x, y, xspeed, yspeed, (TitleScreen_rand(runtime, taskId, 3) % 16) >= 8);
        for (let i = 0; i < 15; i += 1) {
          CreateFlameSprite(runtime, data[5] + sFlameXPositions[i], y, xspeed, yspeed, true);
          xspeed = (TitleScreen_rand(runtime, taskId, 3) % 4) - 2;
          yspeed = (TitleScreen_rand(runtime, taskId, 3) % 8) - 16;
        }
        data[5] += 1;
        if (data[5] > 3) data[5] = 0;
      }
      break;
  }
}

export function SpriteCallback_TitleScreenLeaf(runtime: TitleScreenRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  const data = sprite.data;
  data[0] -= data[1];
  sprite.x = data[0] >> 4;
  if (sprite.x < -8) {
    DestroySprite(runtime, spriteId);
    return;
  }
  data[2] += data[3];
  sprite.y = data[2] >> 4;
  if (sprite.y < 16 || sprite.y > 200) {
    DestroySprite(runtime, spriteId);
    return;
  }
  if (!data[5]) {
    data[6] += 1;
    let r2 = data[1] * data[6];
    let r1 = data[3] * data[6];
    r2 = (r2 * r2) >> 4;
    r1 = (r1 * r1) >> 4;
    if (r2 + r1 >= 81 << 4) data[5] = 1;
  }
}

export function CreateLeafSprite(runtime: TitleScreenRuntime, y: number, xspeed: number, yspeed: number): void {
  const spriteId = CreateSprite(runtime, 'sSpriteTemplate_FlameOrLeaf', DISPLAY_WIDTH, y, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.sprites[spriteId];
    sprite.data[0] = DISPLAY_WIDTH * 16;
    sprite.data[1] = xspeed;
    sprite.data[2] = y * 16;
    sprite.data[3] = yspeed;
    sprite.callback = 'SpriteCallback_TitleScreenLeaf';
  }
}

export function SpriteCallback_Streak(runtime: TitleScreenRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  sprite.x -= 7;
  if (sprite.x < -16) {
    sprite.x = DISPLAY_WIDTH + 16;
    sprite.data[7] += 1;
    if (sprite.data[7] >= sStreakYPositions.length) sprite.data[7] = 0;
    sprite.y = sStreakYPositions[sprite.data[7]];
  }
}

export function CreateStreakSprites(runtime: TitleScreenRuntime): void {
  for (let i = 0; i < 4; i += 1) {
    const spriteId = CreateSprite(runtime, 'sSpriteTemplate_Streak', DISPLAY_WIDTH + 16 + 40 * i, sStreakYPositions[i], 0xff);
    if (spriteId !== MAX_SPRITES) {
      runtime.sprites[spriteId].data[7] = i;
      runtime.sprites[spriteId].callback = 'SpriteCallback_Streak';
    }
  }
}

export function Task_LeafSpawner(runtime: TitleScreenRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  switch (data[0]) {
    case 0:
      CreateStreakSprites(runtime);
      TitleScreen_srand(runtime, taskId, 3, 30840);
      data[0] += 1;
      break;
    case 1:
      data[1] += 1;
      if (data[1] >= data[2]) {
        data[1] = 0;
        data[2] = (TitleScreen_rand(runtime, taskId, 3) % 6) + 6;
        const rval = TitleScreen_rand(runtime, taskId, 3) % 30;
        let xspeed = 16;
        if (rval >= 6) {
          xspeed = 48;
          if (rval < 12) xspeed = 24;
        }
        const yspeed = (TitleScreen_rand(runtime, taskId, 3) % 4) - 2;
        const y = (TitleScreen_rand(runtime, taskId, 3) % 88) + 32;
        CreateLeafSprite(runtime, y, xspeed, yspeed);
      }
      break;
  }
}

export function TitleScreen_srand(runtime: TitleScreenRuntime, taskId: number, field: number, seed: number): void {
  SetWordTaskArg(runtime, taskId, field, seed);
}

export function TitleScreen_rand(runtime: TitleScreenRuntime, taskId: number, field: number): number {
  let rngval = GetWordTaskArg(runtime, taskId, field);
  rngval = isoRandomize1(rngval);
  SetWordTaskArg(runtime, taskId, field, rngval);
  return rngval >>> 16;
}

export function CreateBlankSprite(runtime: TitleScreenRuntime): number {
  CreateSprite(runtime, 'sSpriteTemplate_BlankSprite', 24, 144, 0);
  return PAL_TAG_SLASH;
}

export function SetPalOnOrCreateBlankSprite(runtime: TitleScreenRuntime, hasCreatedBlankSprite: boolean): void {
  if (hasCreatedBlankSprite) runtime.operations.push(`LoadPalette:gTitleScreen_Slash_Pal:OBJ_PLTT_ID(${PAL_TAG_SLASH}):PLTT_SIZE_4BPP`);
  else CreateBlankSprite(runtime);
}

export function CreateSlashSprite(runtime: TitleScreenRuntime): number {
  const spriteId = CreateSprite(runtime, 'sSlashSpriteTemplate', -32, 27, 1);
  if (spriteId !== MAX_SPRITES) {
    const sprite = runtime.sprites[spriteId];
    sprite.callback = 'SpriteCallback_Slash';
    sprite.data[1] = 540;
  }
  return spriteId;
}

export function DeactivateSlashSprite(runtime: TitleScreenRuntime, spriteId: number): void {
  if (spriteId !== MAX_SPRITES && runtime.sprites[spriteId]) runtime.sprites[spriteId].data[2] = 1;
}

export function IsSlashSpriteDeactivated(runtime: TitleScreenRuntime, spriteId: number): boolean {
  if (spriteId !== MAX_SPRITES && runtime.sprites[spriteId]) return (runtime.sprites[spriteId].data[0] ^ 2) ? true : false;
  return false;
}

export function SpriteCallback_Slash(runtime: TitleScreenRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  switch (sprite.data[0]) {
    case 0:
      if (sprite.data[2]) {
        sprite.invisible = true;
        sprite.data[0] = 2;
      }
      sprite.data[1] -= 1;
      if (sprite.data[1] === 0) {
        sprite.invisible = false;
        sprite.data[0] = 1;
      }
      break;
    case 1:
      sprite.x += 9;
      if (sprite.x === 67) sprite.y -= 7;
      if (sprite.x === 148) sprite.y += 7;
      if (sprite.x > DISPLAY_WIDTH + 32) {
        sprite.invisible = true;
        if (sprite.data[2]) sprite.data[0] = 2;
        else {
          sprite.x = -32;
          sprite.data[1] = 540;
          sprite.data[0] = 0;
        }
      }
      break;
    case 2:
      break;
  }
}

export function tickTitleScreenTask(runtime: TitleScreenRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  if (task.func === 'Task_TitleScreenTimer') Task_TitleScreenTimer(runtime, taskId);
  else if (task.func === 'Task_TitleScreenMain') Task_TitleScreenMain(runtime, taskId);
  else if (task.func === 'Task_TitleScreen_SlideWin0') Task_TitleScreen_SlideWin0(runtime, taskId);
  else if (task.func === 'Task_TitleScreen_BlinkPressStart') Task_TitleScreen_BlinkPressStart(runtime, taskId);
  else if (task.func === 'Task_FlameSpawner') Task_FlameSpawner(runtime, taskId);
  else if (task.func === 'Task_LeafSpawner') Task_LeafSpawner(runtime, taskId);
}

export function tickTitleScreenSprite(runtime: TitleScreenRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  if (!sprite || sprite.destroyed) return;
  if (sprite.callback === 'SpriteCallback_TitleScreenFlame') SpriteCallback_TitleScreenFlame(runtime, spriteId);
  else if (sprite.callback === 'SpriteCallback_TitleScreenLeaf') SpriteCallback_TitleScreenLeaf(runtime, spriteId);
  else if (sprite.callback === 'SpriteCallback_Streak') SpriteCallback_Streak(runtime, spriteId);
  else if (sprite.callback === 'SpriteCallback_Slash') SpriteCallback_Slash(runtime, spriteId);
}

const sceneHandlers: Array<(runtime: TitleScreenRuntime, data: number[]) => void> = [
  SetTitleScreenScene_Init,
  SetTitleScreenScene_FlashSprite,
  SetTitleScreenScene_FadeIn,
  SetTitleScreenScene_Run,
  SetTitleScreenScene_Restart,
  SetTitleScreenScene_Cry
];

function CreateTask(runtime: TitleScreenRuntime, func: TitleScreenTaskFunc, priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${id}:${func}:${priority}`);
  return id;
}

function DestroyTask(runtime: TitleScreenRuntime, taskId: number): void {
  if (taskId !== TASK_NONE && runtime.tasks[taskId]) {
    runtime.tasks[taskId].destroyed = true;
    runtime.operations.push(`DestroyTask:${taskId}`);
  }
}

function FindTaskIdByFunc(runtime: TitleScreenRuntime, func: TitleScreenTaskFunc): number {
  return runtime.tasks.find((task) => task.func === func && !task.destroyed)?.id ?? TASK_NONE;
}

function FuncIsActiveTask(runtime: TitleScreenRuntime, func: TitleScreenTaskFunc): boolean {
  return FindTaskIdByFunc(runtime, func) !== TASK_NONE;
}

function CreateSprite(runtime: TitleScreenRuntime, template: string, x: number, y: number, priority: number): number {
  if (runtime.sprites.filter((sprite) => !sprite.destroyed).length >= MAX_SPRITES) return MAX_SPRITES;
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, template, x, y, priority, data: Array.from({ length: 8 }, () => 0), invisible: false, animEnded: false, callback: 'SpriteCallbackDummy', destroyed: false });
  runtime.operations.push(`CreateSprite:${id}:${template}:${x}:${y}:${priority}`);
  return id;
}

function DestroySprite(runtime: TitleScreenRuntime, spriteId: number): void {
  runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`DestroySprite:${spriteId}`);
}

function SetWordTaskArg(runtime: TitleScreenRuntime, taskId: number, field: number, value: number): void {
  runtime.tasks[taskId].data[field] = value & 0xffff;
  runtime.tasks[taskId].data[field + 1] = (value >>> 16) & 0xffff;
}

function GetWordTaskArg(runtime: TitleScreenRuntime, taskId: number, field: number): number {
  return ((runtime.tasks[taskId].data[field + 1] << 16) | (runtime.tasks[taskId].data[field] & 0xffff)) >>> 0;
}

function isoRandomize1(value: number): number {
  return (Math.imul(1103515245, value) + 24691) >>> 0;
}

function FreeTempTileDataBuffersIfPossible(_runtime: TitleScreenRuntime): boolean {
  return false;
}

function UpdatePaletteFade(runtime: TitleScreenRuntime): boolean {
  return runtime.paletteFadeActive;
}

function SetVBlankCallback(runtime: TitleScreenRuntime, callback: string | null): void {
  runtime.vblankCallback = callback;
  runtime.operations.push(`SetVBlankCallback:${callback ?? 'NULL'}`);
}

function SetMainCallback2(runtime: TitleScreenRuntime, callback: string): void {
  runtime.mainCallback2 = callback;
  runtime.operations.push(`SetMainCallback2:${callback}`);
}

function HelpSystem_Enable(runtime: TitleScreenRuntime): void {
  runtime.helpSystemEnabled = true;
  runtime.operations.push('HelpSystem_Enable');
}

function HelpSystem_Disable(runtime: TitleScreenRuntime): void {
  runtime.helpSystemEnabled = false;
  runtime.operations.push('HelpSystem_Disable');
}

function keepFireRedBranch(source: string): string {
  return source
    .replace(/#if\s+defined\(FIRERED\)([\s\S]*?)#elif\s+defined\(LEAFGREEN\)[\s\S]*?#endif/gu, '$1')
    .replace(/#if REVISION >= 0xA[\s\S]*?#else([\s\S]*?)#endif/gu, '$1');
}

function parseBgTemplates(source: string) {
  const body = source.match(/static const struct BgTemplate sBgTemplates\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\.bg = (\d+),\s*\.charBaseIndex = (\d+),\s*\.mapBaseIndex = (\d+),\s*\.screenSize = (\d+),\s*\.paletteMode = (\d+),[\s\S]*?\.priority = (\d+),\s*\.baseTile = (\d+)/gu)]
    .map(([, bg, charBaseIndex, mapBaseIndex, screenSize, paletteMode, priority, baseTile]) => ({
      bg: Number.parseInt(bg, 10),
      charBaseIndex: Number.parseInt(charBaseIndex, 10),
      mapBaseIndex: Number.parseInt(mapBaseIndex, 10),
      screenSize: Number.parseInt(screenSize, 10),
      paletteMode: Number.parseInt(paletteMode, 10),
      priority: Number.parseInt(priority, 10),
      baseTile: Number.parseInt(baseTile, 10)
    }));
}

function parseSceneFuncs(source: string): string[] {
  const body = source.match(/static void \(\*const sSceneFuncs\[\]\)\(s16 \*data\) = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const result: string[] = [];
  for (const [, scene, fn] of body.matchAll(/\[(TITLESCREENSCENE_[A-Z]+)\]\s*=\s*([A-Za-z0-9_]+)/gu)) {
    result[sceneIndex(scene)] = fn;
  }
  return result;
}

function sceneIndex(scene: string): number {
  return {
    TITLESCREENSCENE_INIT,
    TITLESCREENSCENE_FLASHSPRITE,
    TITLESCREENSCENE_FADEIN,
    TITLESCREENSCENE_RUN,
    TITLESCREENSCENE_RESTART,
    TITLESCREENSCENE_CRY
  }[scene] ?? 0;
}

function parseSpriteSheets(source: string) {
  const body = source.match(/static const struct CompressedSpriteSheet sSpriteSheets\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{([A-Za-z0-9_]+),\s*(0x[0-9A-Fa-f]+|\d+),\s*(TILE_TAG_[A-Z_]+)\}/gu)]
    .map(([, gfx, size, tileTag]) => ({ gfx, size: Number.parseInt(size, 0), tileTag }));
}

function parseSpritePals(source: string) {
  const body = source.match(/static const struct SpritePalette sSpritePals\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{([A-Za-z0-9_]+),\s*(PAL_TAG_[A-Z_]+)\}/gu)].map(([, pal, tag]) => ({ pal, tag }));
}

function parseNumericConstArray(source: string, symbol: string): number[] {
  const body = source.match(new RegExp(`static const u(?:8|16) ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/\d+/gu)].map(([value]) => Number.parseInt(value, 10));
}

function parseAnimFrames(source: string, symbol: string): Array<{ frame: number; duration: number }> {
  const body = source.match(new RegExp(`static const union AnimCmd ${symbol}\\[\\] = \\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/ANIMCMD_FRAME\((\d+),\s*(\d+)\)/gu)].map(([, frame, duration]) => ({ frame: Number.parseInt(frame, 10), duration: Number.parseInt(duration, 10) }));
}

function parseDefineValue(source: string, name: string): number {
  return Number.parseInt(source.match(new RegExp(`#define\\s+${name}\\s+(\\d+)`, 'u'))?.[1] ?? '0', 10);
}
