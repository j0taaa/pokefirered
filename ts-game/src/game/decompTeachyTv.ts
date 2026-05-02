import {
  gTeachyTvString_AboutTMs,
  gTeachyTvString_Cancel,
  gTeachyTvString_CatchPkmn,
  gTeachyTvString_RegisterItem,
  gTeachyTvString_StatusProblems,
  gTeachyTvString_TeachBattle,
  gTeachyTvString_TypeMatchups,
  gTeachyTvText_BattleScript1,
  gTeachyTvText_BattleScript2,
  gTeachyTvText_CatchingScript1,
  gTeachyTvText_CatchingScript2,
  gTeachyTvText_MatchupsScript1,
  gTeachyTvText_MatchupsScript2,
  gTeachyTvText_PokedudeSaysHello,
  gTeachyTvText_RegisterScript1,
  gTeachyTvText_RegisterScript2,
  gTeachyTvText_StatusScript1,
  gTeachyTvText_StatusScript2,
  gTeachyTvText_TMsScript1,
  gTeachyTvText_TMsScript2
} from './decompStrings';

export const TTVSCR_BATTLE = 0;
export const TTVSCR_STATUS = 1;
export const TTVSCR_MATCHUPS = 2;
export const TTVSCR_CATCHING = 3;
export const TTVSCR_TMS = 4;
export const TTVSCR_REGISTER = 5;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const ITEM_TM_CASE = 0x016d;
export const ITEMMENULOCATION_TTVSCR_REGISTER = 9;
export const ITEMMENULOCATION_TTVSCR_TMS = 10;
export const B_OUTCOME_DREW = 5;
export const B_TRANSITION_WHITE_BARS_FADE = 0;
export const B_TRANSITION_SLICE = 1;
export const NUM_TILES_IN_PRIMARY = 0x280;
export const NUM_TILES_TOTAL = 0x400;
export const NUM_METATILES_IN_PRIMARY = 0x200;
export const NUM_PALS_IN_PRIMARY = 7;

export type TeachyTvMainCallback =
  | 'TeachyTvMainCallback'
  | 'TeachyTvCallback'
  | 'TeachyTvVblankHandler'
  | 'TeachyTvRestorePlayerPartyCallback'
  | 'TeachyTvSetupBagItemsByOptionChosen'
  | 'CB2_InitBattle'
  | 'CB2_ReturnToTeachyTV'
  | string
  | null;

export type TeachyTvTaskFunc =
  | 'TeachyTvPostBattleFadeControl'
  | 'TeachyTvOptionListController'
  | 'TeachyTvQuitFadeControlAndTaskDel'
  | 'TeachyTvRenderMsgAndSwitchClusterFuncs'
  | 'TeachyTvPreBattleAnimAndSetBattleCallback'
  | 'TTVcmd_End';

export type TeachyTvScriptFunc =
  | 'TTVcmd_TransitionRenderBg2TeachyTvGraphicInitNpcPos'
  | 'TTVcmd_ClearBg2TeachyTvGraphic'
  | 'TTVcmd_NpcMoveAndSetupTextPrinter'
  | 'TTVcmd_IdleIfTextPrinterIsActive'
  | 'TTVcmd_TextPrinterSwitchStringByOptionChosen'
  | 'TTVcmd_TextPrinterSwitchStringByOptionChosen2'
  | 'TTVcmd_IdleIfTextPrinterIsActive2'
  | 'TTVcmd_EraseTextWindowIfKeyPressed'
  | 'TTVcmd_StartAnimNpcWalkIntoGrass'
  | 'TTVcmd_DudeMoveUp'
  | 'TTVcmd_DudeMoveRight'
  | 'TTVcmd_DudeTurnLeft'
  | 'TTVcmd_DudeMoveLeft'
  | 'TTVcmd_RenderAndRemoveBg1EndGraphic'
  | 'TTVcmd_TaskBattleOrFadeByOptionChosen'
  | 'TTVcmd_End';

export interface TeachyTvBgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export interface TeachyTvWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface TeachyTvListMenuItem {
  label: string;
  index: number;
}

export interface TeachyTvListMenuTemplate {
  items: readonly TeachyTvListMenuItem[];
  totalItems: number;
  maxShowed: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  upText_Y: number;
  cursorPal: number;
  fillValue: number;
  cursorShadowPal: number;
  lettersSpacing: number;
  itemVerticalPadding: number;
  scrollMultiple: number;
  fontId: number;
  cursorKind: number;
  moveCursorFunc: 'TeachyTvAudioByInput' | null;
}

export interface TeachyTvCtrlBlk {
  callback: TeachyTvMainCallback;
  mode: number;
  whichScript: number;
  scrollOffset: number;
  selectedRow: number;
}

export interface TeachyTvBuf {
  savedCallback: TeachyTvMainCallback;
  screenTilemap: number[];
  buffer2: number[];
  buffer3: number[];
  titleTilemap: number[];
  grassAnimCounterLo: number;
  grassAnimCounterHi: number;
  grassAnimDisabled: number;
  scrollIndicatorArrowPairId: number;
}

export interface TeachyTvTask {
  id: number;
  func: TeachyTvTaskFunc;
  data: number[];
  destroyed: boolean;
}

export interface TeachyTvSprite {
  id: number;
  x2: number;
  y2: number;
  invisible: boolean;
  anim: number;
  animCmdIndex: number;
  animEnded: boolean;
  callback: 'SpriteCallbackDummy' | 'TeachyTvGrassAnimationObjCallback';
  data: number[];
  oam: { priority: number };
  subpriority: number;
  subspriteTableNum: number;
  subspriteMode: number;
  destroyed: boolean;
}

export interface TeachyTvRuntime {
  sStaticResources: TeachyTvCtrlBlk;
  sResources: TeachyTvBuf | null;
  gMainState: number;
  mainCallback: TeachyTvMainCallback;
  vblankCallback: TeachyTvMainCallback;
  gMainSavedCallback: TeachyTvMainCallback;
  gPaletteFadeActive: boolean;
  gBattleOutcome: number;
  gSpecialVar_0x8004: number;
  textPrinterActive: boolean;
  battleTransitionDone: boolean;
  hasTmCase: boolean;
  pressedButtons: number;
  listInputs: number[];
  nextTaskId: number;
  nextListTaskId: number;
  nextSpriteId: number;
  nextArrowPairId: number;
  tasks: TeachyTvTask[];
  sprites: TeachyTvSprite[];
  listMenuTemplate: TeachyTvListMenuTemplate | null;
  operations: string[];
  textPrinterLog: string[];
  randomValues: number[];
  initializedBagLocation: number | null;
}

export interface TeachyTvTilesetLike {
  isCompressed: boolean;
  tiles: readonly number[];
  palettes?: readonly (readonly number[])[];
  metatiles?: readonly number[];
}

export interface TeachyTvMapLayoutLike {
  primaryTileset: TeachyTvTilesetLike;
  secondaryTileset: TeachyTvTilesetLike;
}

export const sBgTemplates: readonly TeachyTvBgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 }
];

export const sWindowTemplates: readonly TeachyTvWindowTemplate[] = [
  { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 3, baseBlock: 0x0ea },
  { bg: 0, tilemapLeft: 4, tilemapTop: 1, width: 22, height: 12, paletteNum: 3, baseBlock: 0x152 }
];

export const sListMenuItems: readonly TeachyTvListMenuItem[] = [
  { label: gTeachyTvString_TeachBattle, index: TTVSCR_BATTLE },
  { label: gTeachyTvString_StatusProblems, index: TTVSCR_STATUS },
  { label: gTeachyTvString_TypeMatchups, index: TTVSCR_MATCHUPS },
  { label: gTeachyTvString_CatchPkmn, index: TTVSCR_CATCHING },
  { label: gTeachyTvString_AboutTMs, index: TTVSCR_TMS },
  { label: gTeachyTvString_RegisterItem, index: TTVSCR_REGISTER },
  { label: gTeachyTvString_Cancel, index: -2 }
];

export const sListMenuItems_NoTMCase: readonly TeachyTvListMenuItem[] = [
  { label: gTeachyTvString_TeachBattle, index: TTVSCR_BATTLE },
  { label: gTeachyTvString_StatusProblems, index: TTVSCR_STATUS },
  { label: gTeachyTvString_TypeMatchups, index: TTVSCR_MATCHUPS },
  { label: gTeachyTvString_CatchPkmn, index: TTVSCR_CATCHING },
  { label: gTeachyTvString_Cancel, index: -2 }
];

export const sListMenuTemplate: TeachyTvListMenuTemplate = {
  items: sListMenuItems,
  totalItems: 7,
  maxShowed: 6,
  windowId: 0,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 6,
  cursorPal: 1,
  fillValue: 0,
  cursorShadowPal: 2,
  lettersSpacing: 0,
  itemVerticalPadding: 0,
  scrollMultiple: 1,
  fontId: 1,
  cursorKind: 0,
  moveCursorFunc: null
};

export const sWhereToReturnToFromBattle = [12, 12, 12, 12, 9, 9] as const;

export const sBattleScript: readonly TeachyTvScriptFunc[] = [
  'TTVcmd_TransitionRenderBg2TeachyTvGraphicInitNpcPos',
  'TTVcmd_ClearBg2TeachyTvGraphic',
  'TTVcmd_NpcMoveAndSetupTextPrinter',
  'TTVcmd_IdleIfTextPrinterIsActive',
  'TTVcmd_IdleIfTextPrinterIsActive2',
  'TTVcmd_TextPrinterSwitchStringByOptionChosen',
  'TTVcmd_IdleIfTextPrinterIsActive2',
  'TTVcmd_EraseTextWindowIfKeyPressed',
  'TTVcmd_StartAnimNpcWalkIntoGrass',
  'TTVcmd_DudeMoveUp',
  'TTVcmd_DudeMoveRight',
  'TTVcmd_TaskBattleOrFadeByOptionChosen',
  'TTVcmd_TextPrinterSwitchStringByOptionChosen2',
  'TTVcmd_IdleIfTextPrinterIsActive2',
  'TTVcmd_EraseTextWindowIfKeyPressed',
  'TTVcmd_DudeTurnLeft',
  'TTVcmd_DudeMoveLeft',
  'TTVcmd_RenderAndRemoveBg1EndGraphic',
  'TTVcmd_End'
];

export const sStatusScript = sBattleScript;
export const sMatchupsScript = sBattleScript;
export const sCatchingScript = sBattleScript;
export const sTMsScript: readonly TeachyTvScriptFunc[] = [
  'TTVcmd_TransitionRenderBg2TeachyTvGraphicInitNpcPos',
  'TTVcmd_ClearBg2TeachyTvGraphic',
  'TTVcmd_NpcMoveAndSetupTextPrinter',
  'TTVcmd_IdleIfTextPrinterIsActive',
  'TTVcmd_IdleIfTextPrinterIsActive2',
  'TTVcmd_TextPrinterSwitchStringByOptionChosen',
  'TTVcmd_IdleIfTextPrinterIsActive2',
  'TTVcmd_EraseTextWindowIfKeyPressed',
  'TTVcmd_TaskBattleOrFadeByOptionChosen',
  'TTVcmd_TextPrinterSwitchStringByOptionChosen2',
  'TTVcmd_IdleIfTextPrinterIsActive2',
  'TTVcmd_EraseTextWindowIfKeyPressed',
  'TTVcmd_DudeTurnLeft',
  'TTVcmd_DudeMoveLeft',
  'TTVcmd_RenderAndRemoveBg1EndGraphic',
  'TTVcmd_End'
];
export const sRegisterKeyItemScript = sTMsScript;

export const sGrassAnimArray: readonly number[] = [
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 0, 0
];

const scripts = [
  sBattleScript,
  sStatusScript,
  sMatchupsScript,
  sCatchingScript,
  sTMsScript,
  sRegisterKeyItemScript
] as const;

const makeResources = (): TeachyTvBuf => ({
  savedCallback: null,
  screenTilemap: Array.from({ length: 0x800 }, () => 0),
  buffer2: Array.from({ length: 0x800 }, () => 0),
  buffer3: Array.from({ length: 0x800 }, () => 0),
  titleTilemap: Array.from({ length: 0x800 }, () => 0),
  grassAnimCounterLo: 0,
  grassAnimCounterHi: 0,
  grassAnimDisabled: 0,
  scrollIndicatorArrowPairId: 0xff
});

export const createTeachyTvRuntime = (overrides: Partial<TeachyTvRuntime> = {}): TeachyTvRuntime => {
  const runtime: TeachyTvRuntime = {
    sStaticResources: { callback: null, mode: 0, whichScript: TTVSCR_BATTLE, scrollOffset: 0, selectedRow: 0 },
    sResources: null,
    gMainState: 0,
    mainCallback: null,
    vblankCallback: null,
    gMainSavedCallback: null,
    gPaletteFadeActive: false,
    gBattleOutcome: 0,
    gSpecialVar_0x8004: 0,
    textPrinterActive: false,
    battleTransitionDone: false,
    hasTmCase: true,
    pressedButtons: 0,
    listInputs: [],
    nextTaskId: 0,
    nextListTaskId: 0,
    nextSpriteId: 0,
    nextArrowPairId: 0,
    tasks: [],
    sprites: [],
    listMenuTemplate: null,
    operations: [],
    textPrinterLog: [],
    randomValues: [],
    initializedBagLocation: null
  };
  return Object.assign(runtime, overrides);
};

const resources = (runtime: TeachyTvRuntime): TeachyTvBuf => {
  if (runtime.sResources === null) throw new Error('sResources is NULL');
  return runtime.sResources;
};

const task = (runtime: TeachyTvRuntime, taskId: number): TeachyTvTask => {
  const found = runtime.tasks.find((entry) => entry.id === taskId && !entry.destroyed);
  if (found === undefined) throw new Error(`Task ${taskId} does not exist`);
  return found;
};

const sprite = (runtime: TeachyTvRuntime, spriteId: number): TeachyTvSprite => {
  const found = runtime.sprites.find((entry) => entry.id === spriteId && !entry.destroyed);
  if (found === undefined) throw new Error(`Sprite ${spriteId} does not exist`);
  return found;
};

const createTask = (runtime: TeachyTvRuntime, func: TeachyTvTaskFunc): number => {
  const id = runtime.nextTaskId++;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask(${func})`);
  return id;
};

const createSprite = (runtime: TeachyTvRuntime, callback: TeachyTvSprite['callback'] = 'SpriteCallbackDummy', subpriority = 0): number => {
  const id = runtime.nextSpriteId++;
  runtime.sprites.push({
    id,
    x2: 0,
    y2: 0,
    invisible: true,
    anim: 0,
    animCmdIndex: 0,
    animEnded: false,
    callback,
    data: Array.from({ length: 8 }, () => 0),
    oam: { priority: 0 },
    subpriority,
    subspriteTableNum: 0,
    subspriteMode: 0,
    destroyed: false
  });
  return id;
};

const consumeButton = (runtime: TeachyTvRuntime, mask: number): boolean => {
  if ((runtime.pressedButtons & mask) === 0) return false;
  runtime.pressedButtons &= ~mask;
  return true;
};

export const InitTeachyTvController = (runtime: TeachyTvRuntime, mode: number, callback: TeachyTvMainCallback): void => {
  runtime.sStaticResources.mode = mode;
  runtime.sStaticResources.callback = callback;
  if (mode === 0) {
    runtime.sStaticResources.scrollOffset = 0;
    runtime.sStaticResources.selectedRow = 0;
    runtime.sStaticResources.whichScript = TTVSCR_BATTLE;
  }
  if (mode === 1) {
    runtime.sStaticResources.mode = 0;
  }
  runtime.mainCallback = 'TeachyTvMainCallback';
};

export const CB2_ReturnToTeachyTV = (runtime: TeachyTvRuntime): void => {
  if (runtime.sStaticResources.mode === 1) InitTeachyTvController(runtime, 1, runtime.sStaticResources.callback);
  else InitTeachyTvController(runtime, 2, runtime.sStaticResources.callback);
};

export const SetTeachyTvControllerModeToResume = (runtime: TeachyTvRuntime): void => {
  runtime.sStaticResources.mode = 1;
};

export const TeachyTvMainCallback = (runtime: TeachyTvRuntime): void => {
  switch (runtime.gMainState) {
    case 0:
      runtime.sResources = makeResources();
      resources(runtime).savedCallback = null;
      resources(runtime).grassAnimDisabled = 0;
      resources(runtime).scrollIndicatorArrowPairId = 0xff;
      runtime.operations.push('SetVBlankHBlankCallbacksToNull', 'ClearScheduledBgCopiesToVram', 'ScanlineEffect_Stop', 'FreeAllSpritePalettes', 'ResetPaletteFade', 'ResetSpriteData', 'ResetTasks');
      TeachyTvSetupBg(runtime);
      TeachyTvLoadGraphic(runtime);
      runtime.gMainState++;
      break;
    case 1: {
      runtime.operations.push('FreeTempTileDataBuffersIfPossible');
      TeachyTvCreateAndRenderRbox(runtime);
      TeachyTvInitIo(runtime);
      if (runtime.sStaticResources.mode === 2) {
        const taskId = createTask(runtime, 'TeachyTvPostBattleFadeControl');
        task(runtime, taskId).data[1] = TeachyTvSetupObjEventAndOam(runtime);
        TeachyTvSetupPostBattleWindowAndObj(runtime, taskId);
      } else {
        const taskId = createTask(runtime, 'TeachyTvOptionListController');
        task(runtime, taskId).data[0] = TeachyTvSetupWindow(runtime);
        task(runtime, taskId).data[1] = TeachyTvSetupObjEventAndOam(runtime);
        TeachyTvSetupScrollIndicatorArrowPair(runtime);
        runtime.operations.push('PlayNewMapMusic(MUS_TEACHY_TV_MENU)');
        TeachyTvSetWindowRegs(runtime);
      }
      runtime.operations.push('ScheduleBgCopyTilemapToVram(0)', 'ScheduleBgCopyTilemapToVram(1)', 'ScheduleBgCopyTilemapToVram(2)', 'ScheduleBgCopyTilemapToVram(3)', 'SetHelpContextDontCheckBattle(HELPCONTEXT_BAG)', 'BlendPalettes(PALETTES_ALL,0x10,0)', 'BeginNormalPaletteFade(PALETTES_ALL,0,0x10,0,0)');
      runtime.vblankCallback = 'TeachyTvVblankHandler';
      runtime.mainCallback = 'TeachyTvCallback';
      break;
    }
  }
};

export const TeachyTvCallback = (runtime: TeachyTvRuntime): void => {
  for (const entry of runtime.tasks) {
    if (!entry.destroyed) {
      dispatchTeachyTvTask(runtime, entry.id);
    }
  }
  runtime.operations.push(
    'AnimateSprites',
    'BuildOamBuffer',
    'DoScheduledBgTilemapCopiesToVram',
    'UpdatePaletteFade'
  );
};

export const TeachyTvVblankHandler = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer');
};

export const TeachyTvSetupBg = (runtime: TeachyTvRuntime): void => {
  const res = resources(runtime);
  runtime.operations.push('ResetAllBgsCoordinatesAndBgCntRegs', 'ResetBgsAndClearDma3BusyFlags(0)', 'InitBgsFromTemplates(0,sBgTemplates,4)', 'SetBgTilemapBuffer(1,screenTilemap)', 'SetBgTilemapBuffer(2,buffer2)', 'SetBgTilemapBuffer(3,buffer3)', 'SetGpuReg(REG_OFFSET_DISPCNT,0x3040)', 'ShowBg(0)', 'ShowBg(1)', 'ShowBg(2)', 'ShowBg(3)', 'ChangeBgX(3,0x1000,2)', 'ChangeBgY(3,0x2800,1)', 'SetGpuReg(REG_OFFSET_BLDCNT,0)');
  res.grassAnimCounterLo = 0;
  res.grassAnimCounterHi = 3;
};

export const TeachyTvLoadGraphic = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('ResetTempTileDataBuffers', 'DecompressAndCopyTileDataToVram(1,gTeachyTv_Gfx,0,0,0)', 'LZDecompressWram(gTeachyTvScreen_Tilemap,screenTilemap)', 'LZDecompressWram(gTeachyTvTitle_Tilemap,titleTilemap)', 'LoadCompressedPalette(gTeachyTv_Pal,BG_PLTT_ID(0),4*PLTT_SIZE_4BPP)', 'LoadPalette(RGB_BLACK,BG_PLTT_ID(0),sizeof(u16))', 'LoadSpritePalette(gSpritePalette_GeneralFieldEffect1)');
  TeachyTvLoadBg3Map(runtime, resources(runtime).buffer3);
};

export const TeachyTvCreateAndRenderRbox = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('InitWindows(sWindowTemplates)', 'DeactivateAllTextPrinters', 'FillWindowPixelBuffer(0,0xCC)', 'PutWindowTilemap(0)', 'PutWindowTilemap(1)', 'CopyWindowToVram(0,COPYWIN_GFX)');
};

export const TeachyTvSetupWindow = (runtime: TeachyTvRuntime): number => {
  const template: TeachyTvListMenuTemplate = { ...sListMenuTemplate, windowId: 1, moveCursorFunc: 'TeachyTvAudioByInput' };
  if (!runtime.hasTmCase) {
    template.items = sListMenuItems_NoTMCase;
    template.totalItems = 5;
    template.maxShowed = 5;
    template.upText_Y = (template.upText_Y + 8) & 0xf;
  }
  runtime.listMenuTemplate = template;
  const listId = runtime.nextListTaskId++;
  runtime.operations.push(`ListMenuInit(${runtime.sStaticResources.scrollOffset},${runtime.sStaticResources.selectedRow})`);
  return listId;
};

export const TeachyTvSetupScrollIndicatorArrowPair = (runtime: TeachyTvRuntime): void => {
  if (!runtime.hasTmCase) {
    resources(runtime).scrollIndicatorArrowPairId = 0xff;
  } else {
    resources(runtime).scrollIndicatorArrowPairId = runtime.nextArrowPairId++;
    runtime.operations.push('AddScrollIndicatorArrowPair(sScrollIndicatorArrowPair,scrollOffset)');
  }
};

export const TeachyTvRemoveScrollIndicatorArrowPair = (runtime: TeachyTvRuntime): void => {
  const res = resources(runtime);
  if (res.scrollIndicatorArrowPairId !== 0xff) {
    runtime.operations.push(`RemoveScrollIndicatorArrowPair(${res.scrollIndicatorArrowPairId})`);
    res.scrollIndicatorArrowPairId = 0xff;
  }
};

export const TeachyTvAudioByInput = (runtime: TeachyTvRuntime, play: boolean): void => {
  if (play !== true) runtime.operations.push('PlaySE(SE_SELECT)');
};

export const TeachyTvInitIo = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('SetGpuReg(REG_OFFSET_WININ,0x3F)', 'SetGpuReg(REG_OFFSET_WINOUT,0x1F)', 'SetGpuReg(REG_OFFSET_BLDCNT,0xCC)', 'SetGpuReg(REG_OFFSET_BLDY,0x5)');
};

export const TeachyTvSetupObjEventAndOam = (runtime: TeachyTvRuntime): number => {
  const id = createSprite(runtime);
  const spr = sprite(runtime, id);
  spr.oam.priority = 2;
  spr.invisible = true;
  runtime.operations.push('CreateObjectGraphicsSprite(OBJ_EVENT_GFX_TEACHY_TV_HOST,SpriteCallbackDummy,0,0,8)');
  return id;
};

export const TeachyTvSetSpriteCoordsAndSwitchFrame = (runtime: TeachyTvRuntime, objId: number, x: number, y: number, frame: number): void => {
  const spr = sprite(runtime, objId);
  spr.x2 = x;
  spr.y2 = y;
  spr.invisible = false;
  spr.anim = frame;
  runtime.operations.push(`StartSpriteAnim(${objId},${frame})`);
};

export const TeachyTvSetWindowRegs = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('SetGpuReg(REG_OFFSET_WIN0V,0xC64)', 'SetGpuReg(REG_OFFSET_WIN0H,0x1CD4)');
};

export const TeachyTvClearWindowRegs = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('SetGpuReg(REG_OFFSET_WIN0V,0)', 'SetGpuReg(REG_OFFSET_WIN0H,0)');
};

export const TeachyTvBg2AnimController = (runtime: TeachyTvRuntime): void => {
  const res = resources(runtime);
  for (let i = 1; i < 13; i++) {
    for (let j = 2; j < 28; j++) {
      const value = runtime.randomValues.shift() ?? 0;
      res.buffer2[32 * i + j] = ((value & 3) << 10) + 0x301f;
    }
  }
  runtime.operations.push('ScheduleBgCopyTilemapToVram(2)');
};

export const TeachyTvSetupPostBattleWindowAndObj = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const obj = sprite(runtime, entry.data[1]);
  runtime.operations.push('ClearWindowTilemap(1)');
  TeachyTvClearWindowRegs(runtime);
  switch (runtime.sStaticResources.whichScript) {
    case TTVSCR_BATTLE:
    case TTVSCR_STATUS:
    case TTVSCR_MATCHUPS:
    case TTVSCR_CATCHING:
      TeachyTvSetSpriteCoordsAndSwitchFrame(runtime, entry.data[1], 0x78, 0x38, 0);
      runtime.operations.push('ChangeBgX(3,0x3000,1)', 'ChangeBgY(3,0x3000,2)');
      resources(runtime).grassAnimCounterLo += 3;
      resources(runtime).grassAnimCounterHi -= 3;
      break;
    case TTVSCR_TMS:
    case TTVSCR_REGISTER:
      TeachyTvSetSpriteCoordsAndSwitchFrame(runtime, entry.data[1], 0x78, 0x38, 0);
      break;
  }
  entry.data[4] = 0;
  entry.data[5] = 0;
  TeachyTvGrassAnimationMain(runtime, taskId, obj.x2, obj.y2, 0, true);
};

export const TeachyTvInitTextPrinter = (runtime: TeachyTvRuntime, text: string): void => {
  runtime.textPrinterActive = true;
  runtime.textPrinterLog.push(text);
  runtime.operations.push('AddTextPrinterParameterized2(0,FONT_MALE,text,GetTextSpeedSetting(),0,1,0xC,3)');
};

export const TeachyTvFree = (runtime: TeachyTvRuntime): void => {
  runtime.sResources = null;
  runtime.operations.push('Free(sResources)', 'FreeAllWindowBuffers');
};

export const TeachyTvQuitBeginFade = (runtime: TeachyTvRuntime, taskId: number): void => {
  runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL,0,0,0x10,0)');
  task(runtime, taskId).func = 'TeachyTvQuitFadeControlAndTaskDel';
};

export const TeachyTvQuitFadeControlAndTaskDel = (runtime: TeachyTvRuntime, taskId: number): void => {
  if (!runtime.gPaletteFadeActive) {
    if (resources(runtime).savedCallback !== null) {
      runtime.mainCallback = resources(runtime).savedCallback;
    } else {
      runtime.operations.push('Overworld_PlaySpecialMapMusic');
      runtime.mainCallback = runtime.sStaticResources.callback;
    }
    TeachyTvFree(runtime);
    task(runtime, taskId).destroyed = true;
    runtime.operations.push(`DestroyTask(${taskId})`);
  }
};

export const TeachyTvOptionListController = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  TeachyTvBg2AnimController(runtime);
  if (runtime.gPaletteFadeActive) return;
  const input = runtime.listInputs.shift() ?? -1;
  runtime.operations.push(`ListMenu_ProcessInput(${entry.data[0]})`, `ListMenuGetScrollAndRow(${entry.data[0]})`);
  if (consumeButton(runtime, SELECT_BUTTON) && runtime.sStaticResources.callback !== 'CB2_BagMenuFromStartMenu') {
    runtime.operations.push('PlaySE(SE_SELECT)');
    TeachyTvQuitBeginFade(runtime, taskId);
  } else {
    switch (input) {
      case -1:
        break;
      case -2:
        runtime.operations.push('PlaySE(SE_SELECT)');
        TeachyTvQuitBeginFade(runtime, taskId);
        break;
      default:
        runtime.operations.push('PlaySE(SE_SELECT)');
        runtime.sStaticResources.whichScript = input;
        runtime.operations.push(`DestroyListMenuTask(${entry.data[0]})`);
        TeachyTvClearWindowRegs(runtime);
        runtime.operations.push('ClearWindowTilemap(1)', 'ScheduleBgCopyTilemapToVram(0)');
        TeachyTvRemoveScrollIndicatorArrowPair(runtime);
        entry.data[3] = 0;
        entry.data[2] = 0;
        entry.func = 'TeachyTvRenderMsgAndSwitchClusterFuncs';
        break;
    }
  }
};

export const TeachyTvRenderMsgAndSwitchClusterFuncs = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (consumeButton(runtime, B_BUTTON)) {
    resources(runtime).grassAnimDisabled = 1;
    TeachyTvSetSpriteCoordsAndSwitchFrame(runtime, entry.data[1], 0, 0, 0);
    runtime.operations.push('FillWindowPixelBuffer(0,0xCC)', 'CopyWindowToVram(0,COPYWIN_GFX)');
    TeachyTvClearBg1EndGraphicText(runtime);
    entry.data[2] = 0;
    entry.data[3] = 0;
    entry.func = 'TTVcmd_End';
  } else {
    const cluster = scripts[runtime.sStaticResources.whichScript] ?? sBattleScript;
    dispatchTeachyTvScriptFunc(runtime, cluster[entry.data[3]] ?? 'TTVcmd_End', taskId);
  }
};

export const TTVcmd_TransitionRenderBg2TeachyTvGraphicInitNpcPos = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  TeachyTvBg2AnimController(runtime);
  if (++entry.data[2] > 63) {
    runtime.operations.push('CopyToBgTilemapBufferRect_ChangePalette(2,titleTilemap,0,0,0x20,0x20,0x11)');
    TeachyTvSetSpriteCoordsAndSwitchFrame(runtime, entry.data[1], 8, 0x38, 7);
    runtime.operations.push('ScheduleBgCopyTilemapToVram(2)', 'PlayNewMapMusic(MUS_FOLLOW_ME)');
    entry.data[2] = 0;
    entry.data[3]++;
  }
};

export const TTVcmd_ClearBg2TeachyTvGraphic = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (++entry.data[2] === 134) {
    runtime.operations.push('FillBgTilemapBufferRect_Palette0(2,0,2,1,0x1A,0xC)', 'ScheduleBgCopyTilemapToVram(2)');
    entry.data[2] = 0;
    entry.data[3]++;
  }
};

export const TTVcmd_NpcMoveAndSetupTextPrinter = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const spr = sprite(runtime, entry.data[1]);
  if (entry.data[2] !== 35) {
    entry.data[2]++;
  } else if (spr.x2 === 0x78) {
    spr.anim = 0;
    TeachyTvInitTextPrinter(runtime, gTeachyTvText_PokedudeSaysHello);
    entry.data[2] = 0;
    entry.data[3]++;
  } else {
    spr.x2++;
  }
};

export const TTVcmd_IdleIfTextPrinterIsActive = (runtime: TeachyTvRuntime, taskId: number): void => {
  if (!runtime.textPrinterActive) task(runtime, taskId).data[3]++;
};

export const TTVcmd_IdleIfTextPrinterIsActive2 = TTVcmd_IdleIfTextPrinterIsActive;

export const TTVcmd_TextPrinterSwitchStringByOptionChosen = (runtime: TeachyTvRuntime, taskId: number): void => {
  const texts = [gTeachyTvText_BattleScript1, gTeachyTvText_StatusScript1, gTeachyTvText_MatchupsScript1, gTeachyTvText_CatchingScript1, gTeachyTvText_TMsScript1, gTeachyTvText_RegisterScript1] as const;
  TeachyTvInitTextPrinter(runtime, texts[runtime.sStaticResources.whichScript] ?? texts[0]);
  task(runtime, taskId).data[3]++;
};

export const TTVcmd_TextPrinterSwitchStringByOptionChosen2 = (runtime: TeachyTvRuntime, taskId: number): void => {
  const texts = [gTeachyTvText_BattleScript2, gTeachyTvText_StatusScript2, gTeachyTvText_MatchupsScript2, gTeachyTvText_CatchingScript2, gTeachyTvText_TMsScript2, gTeachyTvText_RegisterScript2] as const;
  TeachyTvInitTextPrinter(runtime, texts[runtime.sStaticResources.whichScript] ?? texts[0]);
  task(runtime, taskId).data[3]++;
};

export const TTVcmd_EraseTextWindowIfKeyPressed = (runtime: TeachyTvRuntime, taskId: number): void => {
  if (consumeButton(runtime, A_BUTTON | B_BUTTON)) {
    runtime.operations.push('FillWindowPixelBuffer(0,0xCC)', 'CopyWindowToVram(0,COPYWIN_GFX)');
    task(runtime, taskId).data[3]++;
  }
};

export const TTVcmd_StartAnimNpcWalkIntoGrass = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  sprite(runtime, entry.data[1]).anim = 5;
  entry.data[2] = 0;
  entry.data[4] = 0;
  entry.data[5] = 1;
  entry.data[3]++;
};

export const TTVcmd_DudeMoveUp = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const spr = sprite(runtime, entry.data[1]);
  runtime.operations.push('ChangeBgY(3,0x100,2)');
  if (!(++entry.data[2] & 0xf)) {
    resources(runtime).grassAnimCounterHi--;
    TeachyTvGrassAnimationMain(runtime, taskId, spr.x2, spr.y2, 0, false);
  }
  if (entry.data[2] === 48) {
    entry.data[2] = 0;
    entry.data[4] = -1;
    entry.data[5] = 0;
    spr.anim = 7;
    entry.data[3]++;
  }
};

export const TTVcmd_DudeMoveRight = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const spr = sprite(runtime, entry.data[1]);
  runtime.operations.push('ChangeBgX(3,0x100,1)');
  if (!(++entry.data[2] & 0xf)) resources(runtime).grassAnimCounterLo++;
  if (!((entry.data[2] + 8) & 0xf)) TeachyTvGrassAnimationMain(runtime, taskId, spr.x2 + 8, spr.y2, 0, false);
  if (entry.data[2] === 0x30) {
    entry.data[2] = 0;
    entry.data[4] = 0;
    entry.data[5] = 0;
    spr.anim = 3;
    entry.data[3]++;
  }
};

export const TTVcmd_DudeTurnLeft = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const spr = sprite(runtime, entry.data[1]);
  spr.anim = 6;
  entry.data[3]++;
  entry.data[4] = 0;
  entry.data[5] = 0;
  TeachyTvGrassAnimationMain(runtime, taskId, spr.x2, spr.y2, 0, false);
};

export const TTVcmd_DudeMoveLeft = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  const spr = sprite(runtime, entry.data[1]);
  if (!(spr.x2 & 0xf)) TeachyTvGrassAnimationMain(runtime, taskId, spr.x2 - 8, spr.y2, 0, false);
  if (spr.x2 === 8) entry.data[3]++;
  else spr.x2--;
};

export const TTVcmd_RenderAndRemoveBg1EndGraphic = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (!entry.data[2]) runtime.operations.push('CopyToBgTilemapBufferRect_ChangePalette(1,sBg1EndGraphic,20,10,8,2,0x11)', 'ScheduleBgCopyTilemapToVram(1)');
  if (++entry.data[2] > 126) {
    TeachyTvClearBg1EndGraphicText(runtime);
    entry.data[2] = 0;
    entry.data[3]++;
  }
};

export const TeachyTvClearBg1EndGraphicText = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('FillBgTilemapBufferRect_Palette0(1,0,20,10,8,2)', 'ScheduleBgCopyTilemapToVram(1)');
};

export const TTVcmd_End = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  if (entry.data[2] === 0) runtime.operations.push('PlayNewMapMusic(MUS_TEACHY_TV_MENU)');
  TeachyTvBg2AnimController(runtime);
  if (++entry.data[2] > 63) {
    entry.data[2] = 0;
    entry.data[3] = 0;
    entry.data[0] = TeachyTvSetupWindow(runtime);
    entry.func = 'TeachyTvOptionListController';
    runtime.operations.push('PutWindowTilemap(0)');
    TeachyTvSetupScrollIndicatorArrowPair(runtime);
    TeachyTvSetWindowRegs(runtime);
    runtime.operations.push('ScheduleBgCopyTilemapToVram(0)', 'ChangeBgX(3,0,0)', 'ChangeBgY(3,0,0)', 'ChangeBgX(3,0x1000,2)', 'ChangeBgY(3,0x2800,1)');
    resources(runtime).grassAnimCounterLo = 0;
    resources(runtime).grassAnimCounterHi = 3;
    resources(runtime).grassAnimDisabled = 0;
  }
};

export const TTVcmd_TaskBattleOrFadeByOptionChosen = (runtime: TeachyTvRuntime, taskId: number): void => {
  switch (runtime.sStaticResources.whichScript) {
    case TTVSCR_BATTLE:
    case TTVSCR_STATUS:
    case TTVSCR_MATCHUPS:
    case TTVSCR_CATCHING:
      TeachyTvPrepBattle(runtime, taskId);
      break;
    case TTVSCR_TMS:
    case TTVSCR_REGISTER:
      resources(runtime).savedCallback = 'TeachyTvSetupBagItemsByOptionChosen';
      TeachyTvQuitBeginFade(runtime, taskId);
      break;
  }
};

export const TeachyTvSetupBagItemsByOptionChosen = (runtime: TeachyTvRuntime): void => {
  runtime.initializedBagLocation = runtime.sStaticResources.whichScript === TTVSCR_TMS
    ? ITEMMENULOCATION_TTVSCR_TMS
    : ITEMMENULOCATION_TTVSCR_REGISTER;
  runtime.operations.push(`InitPokedudeBag(${runtime.initializedBagLocation})`);
};

export const TeachyTvPostBattleFadeControl = (runtime: TeachyTvRuntime, taskId: number): void => {
  if (!runtime.gPaletteFadeActive) {
    const entry = task(runtime, taskId);
    entry.data[3] = sWhereToReturnToFromBattle[runtime.sStaticResources.whichScript] ?? 12;
    entry.func = 'TeachyTvRenderMsgAndSwitchClusterFuncs';
  }
};

export const TeachyTvGrassAnimationMain = (
  runtime: TeachyTvRuntime,
  taskId: number,
  x: number,
  y: number,
  subpriority: number,
  mode: boolean
): void => {
  if (resources(runtime).grassAnimDisabled !== 1 && TeachyTvGrassAnimationCheckIfNeedsToGenerateGrassObj(runtime, x - 0x10, y)) {
    const spriteId = createSprite(runtime, 'TeachyTvGrassAnimationObjCallback', subpriority);
    const obj = sprite(runtime, spriteId);
    obj.x2 = x;
    obj.y2 = y + 8;
    obj.data[0] = taskId;
    if (mode) {
      obj.animCmdIndex = 4;
      obj.oam.priority = 2;
      runtime.operations.push('SeekSpriteAnim(grass,4)');
    } else {
      obj.subspriteTableNum = 0;
      obj.subspriteMode = 1;
      runtime.operations.push('SetSubspriteTables(grass,sSubspriteTableArray)');
    }
  }
};

export const TeachyTvGrassAnimationObjCallback = (runtime: TeachyTvRuntime, spriteId: number): void => {
  const spr = sprite(runtime, spriteId);
  const data = task(runtime, spr.data[0]).data;
  const objAddr = sprite(runtime, data[1]);
  if (resources(runtime).grassAnimDisabled === 1) {
    spr.destroyed = true;
    runtime.operations.push(`DestroySprite(${spriteId})`);
  } else {
    spr.subspriteTableNum = spr.animCmdIndex === 0 ? 1 : 0;
    spr.x2 += data[4];
    spr.y2 += data[5];
    if (spr.animEnded) {
      spr.subpriority = 0;
      const diff1 = spr.x2 - objAddr.x2;
      const diff2 = spr.y2 - objAddr.y2;
      if (diff1 <= -16 || diff1 >= 16 || diff2 <= -16 || diff2 >= 24) {
        spr.destroyed = true;
        runtime.operations.push(`DestroySprite(${spriteId})`);
      }
    }
  }
};

export const TeachyTvGrassAnimationCheckIfNeedsToGenerateGrassObj = (runtime: TeachyTvRuntime, x: number, y: number): number => {
  if (x < 0 || y < 0) return 0;
  const res = resources(runtime);
  const high = ((y >> 4) + res.grassAnimCounterHi) << 4;
  const low = (x >> 4) + res.grassAnimCounterLo;
  return sGrassAnimArray[high + low] ?? 0;
};

export const TeachyTvPrepBattle = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  TeachyTvFree(runtime);
  runtime.gSpecialVar_0x8004 = runtime.sStaticResources.whichScript;
  runtime.gMainSavedCallback = 'TeachyTvRestorePlayerPartyCallback';
  runtime.operations.push('SavePlayerParty', 'InitPokedudePartyAndOpponent', 'PlayMapChosenOrBattleBGM(MUS_DUMMY)');
  entry.data[6] = runtime.sStaticResources.whichScript === TTVSCR_BATTLE ? B_TRANSITION_WHITE_BARS_FADE : B_TRANSITION_SLICE;
  entry.data[7] = 0;
  entry.func = 'TeachyTvPreBattleAnimAndSetBattleCallback';
};

export const TeachyTvPreBattleAnimAndSetBattleCallback = (runtime: TeachyTvRuntime, taskId: number): void => {
  const entry = task(runtime, taskId);
  switch (entry.data[7]) {
    case 0:
      runtime.operations.push(`BattleTransition_StartOnField(${entry.data[6]})`);
      entry.data[7]++;
      break;
    case 1:
      if (runtime.battleTransitionDone) {
        runtime.mainCallback = 'CB2_InitBattle';
        entry.destroyed = true;
        runtime.operations.push(`DestroyTask(${taskId})`);
      }
      break;
  }
};

export const TeachyTvRestorePlayerPartyCallback = (runtime: TeachyTvRuntime): void => {
  runtime.operations.push('LoadPlayerParty');
  if (runtime.gBattleOutcome === B_OUTCOME_DREW) SetTeachyTvControllerModeToResume(runtime);
  else runtime.operations.push('PlayNewMapMusic(MUS_FOLLOW_ME)');
  CB2_ReturnToTeachyTV(runtime);
};

export const TeachyTvLoadBg3Map = (runtime: TeachyTvRuntime, buffer: number[]): void => {
  buffer.fill(0);
  runtime.operations.push('TeachyTvLoadBg3Map(Route1_Layout)', 'LoadBgTiles(3,bgTilesBuffer,numMapTilesRows*0x80,0)', 'TeachyTvLoadMapPalette(Route1_Layout,palIndicesBuffer)');
};

export const TeachyTvLoadMapTilesetToBuffer = (
  runtime: TeachyTvRuntime,
  tileset: TeachyTvTilesetLike | null,
  dstBuffer: number[],
  size: number
): void => {
  if (tileset) {
    if (!tileset.isCompressed) {
      for (let i = 0; i < 0x20 * size; i += 1) {
        dstBuffer[i] = tileset.tiles[i] ?? 0;
      }
      runtime.operations.push(`CpuFastCopy(tiles,dstBuffer,${0x20 * size})`);
    } else {
      dstBuffer.length = 0;
      dstBuffer.push(...tileset.tiles);
      runtime.operations.push('LZDecompressWram(tiles,dstBuffer)');
    }
  }
};

export const TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles = (
  blockBuf: number[],
  tileset: readonly number[],
  metaTile: number,
  blockOffset = 0
): void => {
  const buffer = Array.from({ length: 0x20 }, (_, i) => tileset[i] ?? 0);
  let src = Array.from({ length: 0x20 }, () => 0);
  if (metaTile & 1) {
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 4; ++j) {
        const offset = j - 3;
        const value = buffer[(i << 2) - offset] ?? 0;
        src[(i << 2) + j] = ((value & 0xf) << 4) + ((value & 0xf0) >> 4);
      }
    }
    for (let i = 0; i < 0x20; i++) buffer[i] = src[i] ?? 0;
  }
  if (metaTile & 2) {
    src = Array.from({ length: 0x20 }, () => 0);
    for (let i = 0; i < 8; ++i) {
      for (let j = 0; j < 4; j++) src[4 * i + j] = buffer[4 * (7 - i) + j] ?? 0;
    }
    for (let i = 0; i < 0x20; i++) buffer[i] = src[i] ?? 0;
  }
  for (let i = 0; i < 32; ++i) {
    const value = buffer[i] ?? 0;
    const dest = blockOffset + i;
    if (value & 0xf0) blockBuf[dest] = ((blockBuf[dest] ?? 0) & 0xf) + (value & 0xf0);
    if (value & 0xf) blockBuf[dest] = ((blockBuf[dest] ?? 0) & 0xf0) + (value & 0xf);
  }
};

export const TeachyTvComputeMapTilesFromTilesetAndMetaTiles = (
  metaTilesArray: readonly number[],
  blockBuf: number[],
  tileset: readonly number[]
): void => {
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[0] ?? 0) & 0x3ff)), ((metaTilesArray[0] ?? 0) >> 10) & 3, 0);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[4] ?? 0) & 0x3ff)), ((metaTilesArray[4] ?? 0) >> 10) & 3, 0);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[1] ?? 0) & 0x3ff)), ((metaTilesArray[1] ?? 0) >> 10) & 3, 0x20);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[5] ?? 0) & 0x3ff)), ((metaTilesArray[5] ?? 0) >> 10) & 3, 0x20);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[2] ?? 0) & 0x3ff)), ((metaTilesArray[2] ?? 0) >> 10) & 3, 0x40);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[6] ?? 0) & 0x3ff)), ((metaTilesArray[6] ?? 0) >> 10) & 3, 0x40);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[3] ?? 0) & 0x3ff)), ((metaTilesArray[3] ?? 0) >> 10) & 3, 0x60);
  TeachyTvComputeSingleMapTileBlockFromTilesetAndMetaTiles(blockBuf, tileset.slice(0x20 * ((metaTilesArray[7] ?? 0) & 0x3ff)), ((metaTilesArray[7] ?? 0) >> 10) & 3, 0x60);
};

export const TeachyTvComputePalIndexArrayEntryByMetaTile = (palIndexArrayBuf: number[], metaTile: number): number => {
  let i = 0;
  const pal = metaTile >> 12;
  const firstEntry = palIndexArrayBuf[0] ?? 0xff;
  if (firstEntry !== pal) {
    if (firstEntry === 0xff) {
      palIndexArrayBuf[0] = pal;
    } else {
      while (++i < 16) {
        const temp = palIndexArrayBuf[i] ?? 0xff;
        if (temp === pal) break;
        if (temp === 0xff) {
          palIndexArrayBuf[i] = pal;
          break;
        }
      }
    }
  }
  return 0xf - i;
};

export const TeachyTvPushBackNewMapPalIndexArrayEntry = (
  buf1: number[],
  palIndexArray: number[],
  metaTileEntryAddr: readonly number[],
  offset: number,
  bufOffset = 0
): void => {
  buf1[bufOffset] = (TeachyTvComputePalIndexArrayEntryByMetaTile(palIndexArray, metaTileEntryAddr[0] ?? 0) << 12) + 4 * offset;
  buf1[bufOffset + 1] = (TeachyTvComputePalIndexArrayEntryByMetaTile(palIndexArray, metaTileEntryAddr[1] ?? 0) << 12) + 4 * offset + 1;
  buf1[bufOffset + 32] = (TeachyTvComputePalIndexArrayEntryByMetaTile(palIndexArray, metaTileEntryAddr[2] ?? 0) << 12) + 4 * offset + 2;
  buf1[bufOffset + 33] = (TeachyTvComputePalIndexArrayEntryByMetaTile(palIndexArray, metaTileEntryAddr[3] ?? 0) << 12) + 4 * offset + 3;
};

export const TeachyTvLoadMapPalette = (
  runtime: TeachyTvRuntime,
  layout: TeachyTvMapLayoutLike,
  palIndexArray: readonly number[]
): void => {
  for (let i = 0; i < 16; i += 1) {
    const palIndex = palIndexArray[i] ?? 0xff;
    if (palIndex === 0xff) {
      break;
    }
    const tileset = palIndex >= NUM_PALS_IN_PRIMARY ? layout.secondaryTileset : layout.primaryTileset;
    const palette = tileset.palettes?.[palIndex] ?? [];
    runtime.operations.push(`LoadPalette(${palette.join(',')},BG_PLTT_ID(${15 - i}),PLTT_SIZE_4BPP)`);
  }
};

export const dispatchTeachyTvScriptFunc = (runtime: TeachyTvRuntime, func: TeachyTvScriptFunc, taskId: number): void => {
  if (func === 'TTVcmd_TransitionRenderBg2TeachyTvGraphicInitNpcPos') TTVcmd_TransitionRenderBg2TeachyTvGraphicInitNpcPos(runtime, taskId);
  else if (func === 'TTVcmd_ClearBg2TeachyTvGraphic') TTVcmd_ClearBg2TeachyTvGraphic(runtime, taskId);
  else if (func === 'TTVcmd_NpcMoveAndSetupTextPrinter') TTVcmd_NpcMoveAndSetupTextPrinter(runtime, taskId);
  else if (func === 'TTVcmd_IdleIfTextPrinterIsActive') TTVcmd_IdleIfTextPrinterIsActive(runtime, taskId);
  else if (func === 'TTVcmd_TextPrinterSwitchStringByOptionChosen') TTVcmd_TextPrinterSwitchStringByOptionChosen(runtime, taskId);
  else if (func === 'TTVcmd_TextPrinterSwitchStringByOptionChosen2') TTVcmd_TextPrinterSwitchStringByOptionChosen2(runtime, taskId);
  else if (func === 'TTVcmd_IdleIfTextPrinterIsActive2') TTVcmd_IdleIfTextPrinterIsActive2(runtime, taskId);
  else if (func === 'TTVcmd_EraseTextWindowIfKeyPressed') TTVcmd_EraseTextWindowIfKeyPressed(runtime, taskId);
  else if (func === 'TTVcmd_StartAnimNpcWalkIntoGrass') TTVcmd_StartAnimNpcWalkIntoGrass(runtime, taskId);
  else if (func === 'TTVcmd_DudeMoveUp') TTVcmd_DudeMoveUp(runtime, taskId);
  else if (func === 'TTVcmd_DudeMoveRight') TTVcmd_DudeMoveRight(runtime, taskId);
  else if (func === 'TTVcmd_DudeTurnLeft') TTVcmd_DudeTurnLeft(runtime, taskId);
  else if (func === 'TTVcmd_DudeMoveLeft') TTVcmd_DudeMoveLeft(runtime, taskId);
  else if (func === 'TTVcmd_RenderAndRemoveBg1EndGraphic') TTVcmd_RenderAndRemoveBg1EndGraphic(runtime, taskId);
  else if (func === 'TTVcmd_TaskBattleOrFadeByOptionChosen') TTVcmd_TaskBattleOrFadeByOptionChosen(runtime, taskId);
  else if (func === 'TTVcmd_End') TTVcmd_End(runtime, taskId);
};

export const dispatchTeachyTvTask = (runtime: TeachyTvRuntime, taskId: number): void => {
  const func = task(runtime, taskId).func;
  if (func === 'TeachyTvPostBattleFadeControl') TeachyTvPostBattleFadeControl(runtime, taskId);
  else if (func === 'TeachyTvOptionListController') TeachyTvOptionListController(runtime, taskId);
  else if (func === 'TeachyTvQuitFadeControlAndTaskDel') TeachyTvQuitFadeControlAndTaskDel(runtime, taskId);
  else if (func === 'TeachyTvRenderMsgAndSwitchClusterFuncs') TeachyTvRenderMsgAndSwitchClusterFuncs(runtime, taskId);
  else if (func === 'TeachyTvPreBattleAnimAndSetBattleCallback') TeachyTvPreBattleAnimAndSetBattleCallback(runtime, taskId);
  else if (func === 'TTVcmd_End') TTVcmd_End(runtime, taskId);
};
