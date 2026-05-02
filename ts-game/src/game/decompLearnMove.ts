import {
  gText_1_2_and_Poof,
  gText_GiveUpTryingToTeachNewMove,
  gText_MonForgotOldMoveAndMonLearnedNewMove,
  gText_MonIsTryingToLearnMove,
  gText_MonLearnedMove,
  gText_StopLearningMove,
  gText_TeachMoveQues,
  gText_TeachWhichMoveToMon,
  gText_ThreeHyphens,
  gText_WhichMoveShouldBeForgotten
} from './decompStrings';

export const MENU_STATE_FADE_TO_BLACK = 0;
export const MENU_STATE_WAIT_FOR_FADE = 1;
export const MENU_STATE_UNREACHABLE = 2;
export const MENU_STATE_SETUP_BATTLE_MODE = 3;
export const MENU_STATE_IDLE_BATTLE_MODE = 4;
export const MENU_STATE_PRINT_TEACH_MOVE_PROMPT = 8;
export const MENU_STATE_TEACH_MOVE_CONFIRM = 9;
export const MENU_STATE_PRINT_GIVE_UP_PROMPT = 12;
export const MENU_STATE_GIVE_UP_CONFIRM = 13;
export const MENU_STATE_FADE_AND_RETURN = 14;
export const MENU_STATE_RETURN_TO_FIELD = 15;
export const MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT = 16;
export const MENU_STATE_WAIT_FOR_TRYING_TO_LEARN = 17;
export const MENU_STATE_CONFIRM_DELETE_OLD_MOVE = 18;
export const MENU_STATE_PRINT_WHICH_MOVE_PROMPT = 19;
export const MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN = 20;
export const MENU_STATE_PRINT_STOP_TEACHING = 24;
export const MENU_STATE_WAIT_FOR_STOP_TEACHING = 25;
export const MENU_STATE_CONFIRM_STOP_TEACHING = 26;
export const MENU_STATE_CHOOSE_SETUP_STATE = 27;
export const MENU_STATE_FADE_FROM_SUMMARY_SCREEN = 28;
export const MENU_STATE_TRY_OVERWRITE_MOVE = 29;
export const MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE = 30;
export const MENU_STATE_PRINT_TEXT_THEN_FANFARE = 31;
export const MENU_STATE_WAIT_FOR_FANFARE = 32;
export const MENU_STATE_WAIT_FOR_A_BUTTON = 33;

export const MOVE_NONE = 0;
export const A_BUTTON = 1;
export const B_BUTTON = 2;
export const SE_SELECT = 'SE_SELECT';
export const MUS_LEVEL_UP = 'MUS_LEVEL_UP';
export const MENU_NOTHING_CHOSEN = -2;
export const MENU_B_PRESSED = -1;
export const LIST_CANCEL = 0xfe;

export interface MoveTutorMoveInfoHeader {
  text: string | null;
  left: number;
  right: number;
  index: number;
}

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface BgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  priority: number;
}

export interface LearnMoveSprite {
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  anim: number | null;
}

export interface LearnMoveListMenuItem {
  label: string;
  index: number;
}

export interface LearnMoveMon {
  nickname: string;
  moves: number[];
  ppBonuses?: number[];
  relearnMoves: number[];
}

export interface LearnMoveBattleMove {
  power: number;
  accuracy: number;
  pp: number;
  type: number;
  description: string;
}

export interface LearnMoveResources {
  state: number;
  unk_01: number;
  unk_02: number;
  spriteIds: number[];
  unk_18: number;
  scrollPositionMaybe: number;
  numLearnableMoves: number;
  unk_1B: number;
  unk_1C: number;
  unk_1D: number;
  unk_1E: number;
  listMenuItems: LearnMoveListMenuItem[];
  learnableMoves: number[];
  listMenuStrbufs: string[];
  scheduleMoveInfoUpdate: boolean;
  selectedPartyMember: number;
  selectedMoveSlot: number;
  unk_262: number;
  listMenuTaskId: number;
  bg1TilemapBuffer: number[];
  textColor: number[];
  selectedIndex: number;
  listMenuScrollPos: number;
  listMenuScrollRow: number;
}

export interface LearnMoveRuntime {
  sMoveRelearner: LearnMoveResources | null;
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gPlayerParty: LearnMoveMon[];
  gPlayerPartyCount: number;
  gStringVar1: string;
  gStringVar2: string;
  gStringVar3: string;
  gStringVar4: string;
  gPaletteFade: { active: boolean };
  gMainCallback2: string | null;
  gFieldCallback: string | null;
  gVBlankCallback: string | null;
  tasks: Array<{ func: string; priority: number; destroyed: boolean }>;
  sprites: LearnMoveSprite[];
  operations: string[];
  printedText: Array<{ windowId: number; str: string; x: number; y: number; speed: number; colorIdx: number; textColor: number[] }>;
  yesNoInputs: number[];
  listMenuInputs: number[];
  joyNew: number;
  fanfareInactive: boolean;
  textPrinterActive7: boolean;
  moveNames: Record<number, string>;
  battleMoves: Record<number, LearnMoveBattleMove>;
  listMenuScrollResult: { pos: number; row: number };
}

export const sMoveTutorMenuWindowFrameDimensions = [
  [0, 0, 19, 13],
  [20, 0, 29, 13],
  [2, 14, 27, 19]
] as const;

export const sJPText_TatakauWaza = 'たたかうわざ';
export const sJPText_Taipu = 'タイプ/';
export const sJPText_PP = 'PP/';
export const sJPText_Iryoku = 'いりょく/';
export const sJPText_Meichuu = 'めいちゅう/';

export const sMoveTutorMoveInfoHeaders: readonly (readonly MoveTutorMoveInfoHeader[])[] = [
  [
    { text: sJPText_TatakauWaza, left: 7, right: 1, index: 0 },
    { text: sJPText_Taipu, left: 1, right: 4, index: 1 },
    { text: sJPText_Iryoku, left: 11, right: 4, index: 2 },
    { text: sJPText_PP, left: 2, right: 6, index: 3 },
    { text: sJPText_Meichuu, left: 10, right: 6, index: 4 }
  ],
  [
    { text: null, left: 0, right: 0, index: 0 },
    { text: null, left: 0, right: 0, index: 0 },
    { text: null, left: 0, right: 0, index: 0 },
    { text: null, left: 0, right: 0, index: 0 },
    { text: null, left: 0, right: 0, index: 0 }
  ]
] as const;

export const sBgTemplates: readonly BgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, priority: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, priority: 1 }
] as const;

export const sWindowTemplates: readonly (WindowTemplate | null)[] = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 6, height: 7, paletteNum: 13, baseBlock: 0x014 },
  { bg: 0, tilemapLeft: 10, tilemapTop: 0, width: 5, height: 5, paletteNum: 13, baseBlock: 0x03e },
  { bg: 0, tilemapLeft: 5, tilemapTop: 0, width: 5, height: 2, paletteNum: 13, baseBlock: 0x057 },
  { bg: 0, tilemapLeft: 15, tilemapTop: 0, width: 3, height: 5, paletteNum: 15, baseBlock: 0x061 },
  { bg: 0, tilemapLeft: 5, tilemapTop: 2, width: 3, height: 3, paletteNum: 15, baseBlock: 0x070 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 6, width: 15, height: 8, paletteNum: 15, baseBlock: 0x079 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 1, width: 10, height: 12, paletteNum: 15, baseBlock: 0x0f1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 0x169 },
  null
] as const;

export const sMoveRelearnerYesNoMenuTemplate: WindowTemplate = {
  bg: 0,
  tilemapLeft: 21,
  tilemapTop: 8,
  width: 6,
  height: 4,
  paletteNum: 15,
  baseBlock: 0x1d1
};

export const sMoveRelearnerListMenuTemplate = {
  items: null as LearnMoveListMenuItem[] | null,
  totalItems: 0,
  maxShowed: 7,
  windowId: 6,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 0,
  cursorPal: 2,
  fillValue: 1,
  cursorShadowPal: 3,
  lettersSpacing: 1,
  itemVerticalPadding: 0,
  scrollMultiple: 0,
  fontId: 0,
  cursorKind: 0
};

export const createLearnMoveRuntime = (overrides: Partial<LearnMoveRuntime> = {}): LearnMoveRuntime => {
  const { gPaletteFade, ...rest } = overrides;
  return {
  sMoveRelearner: null,
  gSpecialVar_0x8004: 0,
  gSpecialVar_0x8005: 0,
  gPlayerParty: [],
  gPlayerPartyCount: overrides.gPlayerParty?.length ?? 0,
  gStringVar1: '',
  gStringVar2: '',
  gStringVar3: '',
  gStringVar4: '',
  gMainCallback2: null,
  gFieldCallback: null,
  gVBlankCallback: null,
  tasks: [],
  sprites: [],
  operations: [],
  printedText: [],
  yesNoInputs: [],
  listMenuInputs: [],
  joyNew: 0,
  fanfareInactive: false,
  textPrinterActive7: false,
  moveNames: {},
  battleMoves: {},
  listMenuScrollResult: { pos: 0, row: 0 },
  ...rest,
  gPaletteFade: { active: false, ...gPaletteFade }
  };
};

const resources = (runtime: LearnMoveRuntime): LearnMoveResources => {
  if (!runtime.sMoveRelearner) {
    throw new Error('sMoveRelearner is NULL');
  }
  return runtime.sMoveRelearner;
};

const expand = (runtime: LearnMoveRuntime, str: string): string =>
  str
    .replaceAll('{STR_VAR_1}', runtime.gStringVar1)
    .replaceAll('{STR_VAR_2}', runtime.gStringVar2)
    .replaceAll('{STR_VAR_3}', runtime.gStringVar3);

const getMoveName = (runtime: LearnMoveRuntime, move: number): string => runtime.moveNames[move] ?? `MOVE_${move}`;

export const allocLearnMoveResources = (): LearnMoveResources => ({
  state: 0,
  unk_01: 0,
  unk_02: 0,
  spriteIds: [0, 0],
  unk_18: 0,
  scrollPositionMaybe: 0,
  numLearnableMoves: 0,
  unk_1B: 0,
  unk_1C: 0,
  unk_1D: 0,
  unk_1E: 0,
  listMenuItems: [],
  learnableMoves: Array.from({ length: 25 }, () => MOVE_NONE),
  listMenuStrbufs: Array.from({ length: 25 }, () => ''),
  scheduleMoveInfoUpdate: false,
  selectedPartyMember: 0,
  selectedMoveSlot: 0,
  unk_262: 0,
  listMenuTaskId: 0,
  bg1TilemapBuffer: Array.from({ length: 0x800 }, () => 0),
  textColor: [0, 0, 0],
  selectedIndex: 0,
  listMenuScrollPos: 0,
  listMenuScrollRow: 0
});

export const teachMoveRelearnerMove = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('LockPlayerFieldControls');
  runtime.tasks.push({ func: 'Task_InitMoveRelearnerMenu', priority: 10, destroyed: false });
  runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)');
};

export const taskInitMoveRelearnerMenu = (runtime: LearnMoveRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.gMainCallback2 = 'CB2_MoveRelearner_Init';
    runtime.gFieldCallback = 'FieldCB_ContinueScriptHandleMusic';
    runtime.tasks[taskId].destroyed = true;
  }
};

export const vBlankCBMoveRelearner = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('LoadOam');
  runtime.operations.push('ProcessSpriteCopyRequests');
  runtime.operations.push('TransferPlttBuffer');
};

export const cb2MoveRelearnerInit = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('SetGpuReg(REG_OFFSET_DISPCNT, 0)');
  runtime.operations.push('ResetSpriteData');
  runtime.operations.push('FreeAllSpritePalettes');
  runtime.operations.push('ResetTasks');
  runtime.tasks = [];
  runtime.sMoveRelearner = allocLearnMoveResources();
  initMoveRelearnerStateVariables(runtime);
  resources(runtime).selectedPartyMember = runtime.gSpecialVar_0x8004;
  moveRelearnerInitListMenuBuffersEtc(runtime);
  runtime.gVBlankCallback = 'VBlankCB_MoveRelearner';
  moveRelearnerLoadBgGfx(runtime);
  spawnListMenuScrollIndicatorSprites(runtime);
  runtime.operations.push('RunTasks');
  runtime.operations.push('AnimateSprites');
  runtime.operations.push('BuildOamBuffer');
  runtime.operations.push('UpdatePaletteFade');
  runtime.gMainCallback2 = 'CB2_MoveRelearner';
};

export const cb2MoveRelearnerResume = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('SetGpuReg(REG_OFFSET_DISPCNT, 0)');
  runtime.operations.push('ResetSpriteData');
  runtime.operations.push('FreeAllSpritePalettes');
  runtime.operations.push('ResetTasks');
  runtime.tasks = [];
  moveRelearnerInitListMenuBuffersEtc(runtime);
  resources(runtime).selectedMoveSlot = runtime.gSpecialVar_0x8005;
  runtime.gVBlankCallback = 'VBlankCB_MoveRelearner';
  moveRelearnerLoadBgGfx(runtime);
  spawnListMenuScrollIndicatorSprites(runtime);
  runtime.operations.push('SetBackdropFromColor(RGB_BLACK)');
  runtime.operations.push('RunTasks');
  runtime.operations.push('AnimateSprites');
  runtime.operations.push('BuildOamBuffer');
  runtime.operations.push('UpdatePaletteFade');
  runtime.gMainCallback2 = 'CB2_MoveRelearner';
};

export const cb2MoveRelearner = (runtime: LearnMoveRuntime): void => {
  if (!runtime.textPrinterActive7) {
    moveRelearnerStateMachine(runtime);
  }
  if (resources(runtime).scheduleMoveInfoUpdate) {
    printMoveInfoHandleCancelCopyToVram(runtime);
    resources(runtime).scheduleMoveInfoUpdate = false;
  }
  runtime.operations.push('RunTasks');
  runtime.operations.push('RunTextPrinters');
  runtime.operations.push('AnimateSprites');
  runtime.operations.push('BuildOamBuffer');
  runtime.operations.push('UpdatePaletteFade');
};

export const stringExpandPlaceholdersAndPrintTextOnWindow7Color2 = (runtime: LearnMoveRuntime, str: string): void => {
  runtime.gStringVar4 = expand(runtime, str);
  printTextOnWindow(runtime, 7, runtime.gStringVar4, 0, 2, 0, 2);
};

export const moveRelearnerStateMachine = (runtime: LearnMoveRuntime): void => {
  const state = resources(runtime).state;
  switch (state) {
    case MENU_STATE_FADE_TO_BLACK:
      runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)');
      runtime.operations.push('ShowBg(0)');
      runtime.operations.push('ShowBg(1)');
      loadMoveInfoUI(runtime);
      resources(runtime).state += 1;
      drawTextBorderOnWindows6and7(runtime);
      printTeachWhichMoveToStrVar1(runtime, false);
      moveLearnerInitListMenu(runtime);
      resources(runtime).scheduleMoveInfoUpdate = true;
      break;
    case MENU_STATE_WAIT_FOR_FADE:
      if (!runtime.gPaletteFade.active) resources(runtime).state = MENU_STATE_IDLE_BATTLE_MODE;
      break;
    case MENU_STATE_UNREACHABLE:
      resources(runtime).state += 1;
      break;
    case MENU_STATE_SETUP_BATTLE_MODE:
      printTeachWhichMoveToStrVar1(runtime, false);
      resources(runtime).scheduleMoveInfoUpdate = true;
      resources(runtime).state += 1;
      break;
    case MENU_STATE_IDLE_BATTLE_MODE:
      moveRelearnerMenuHandleInput(runtime);
      break;
    case MENU_STATE_PRINT_TEACH_MOVE_PROMPT:
      createYesNoMenu(runtime);
      resources(runtime).state += 1;
      break;
    case MENU_STATE_TEACH_MOVE_CONFIRM:
      handleTeachMoveConfirm(runtime);
      break;
    case MENU_STATE_PRINT_GIVE_UP_PROMPT:
      createYesNoMenu(runtime);
      resources(runtime).state += 1;
      break;
    case MENU_STATE_GIVE_UP_CONFIRM:
      handleGiveUpConfirm(runtime);
      break;
    case MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT:
      stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_MonIsTryingToLearnMove);
      resources(runtime).state += 1;
      break;
    case MENU_STATE_WAIT_FOR_TRYING_TO_LEARN:
      createYesNoMenu(runtime);
      resources(runtime).state = MENU_STATE_CONFIRM_DELETE_OLD_MOVE;
      break;
    case MENU_STATE_CONFIRM_DELETE_OLD_MOVE:
      handleConfirmDeleteOldMove(runtime);
      break;
    case MENU_STATE_PRINT_STOP_TEACHING:
      stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_StopLearningMove);
      resources(runtime).state += 1;
      break;
    case MENU_STATE_WAIT_FOR_STOP_TEACHING:
      createYesNoMenu(runtime);
      resources(runtime).state = MENU_STATE_CONFIRM_STOP_TEACHING;
      break;
    case MENU_STATE_CONFIRM_STOP_TEACHING:
      handleConfirmStopTeaching(runtime);
      break;
    case MENU_STATE_CHOOSE_SETUP_STATE:
      resources(runtime).state = MENU_STATE_SETUP_BATTLE_MODE;
      break;
    case MENU_STATE_PRINT_WHICH_MOVE_PROMPT:
      resources(runtime).state = MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN;
      runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)');
      break;
    case MENU_STATE_SHOW_MOVE_SUMMARY_SCREEN:
      if (!runtime.gPaletteFade.active) {
        resources(runtime).listMenuScrollPos = runtime.listMenuScrollResult.pos;
        resources(runtime).listMenuScrollRow = runtime.listMenuScrollResult.row;
        runtime.operations.push(`ListMenuGetScrollAndRow(${resources(runtime).listMenuTaskId})`);
        runtime.operations.push('FreeAllWindowBuffers');
        runtime.operations.push(`ShowSelectMovePokemonSummaryScreen(selected=${resources(runtime).selectedPartyMember}, last=${runtime.gPlayerPartyCount - 1}, move=${resources(runtime).learnableMoves[resources(runtime).selectedIndex]})`);
        resources(runtime).state = MENU_STATE_FADE_FROM_SUMMARY_SCREEN;
      }
      break;
    case 21:
      resources(runtime).state = MENU_STATE_FADE_AND_RETURN;
      break;
    case 22:
      runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)');
      break;
    case MENU_STATE_FADE_AND_RETURN:
      runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK)');
      resources(runtime).state += 1;
      break;
    case MENU_STATE_RETURN_TO_FIELD:
      if (!runtime.gPaletteFade.active) {
        runtime.operations.push('FreeAllWindowBuffers');
        runtime.sMoveRelearner = null;
        runtime.gMainCallback2 = 'CB2_ReturnToField';
      }
      break;
    case MENU_STATE_FADE_FROM_SUMMARY_SCREEN:
      runtime.operations.push('BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)');
      runtime.operations.push('ShowBg(0)');
      runtime.operations.push('ShowBg(1)');
      resources(runtime).state += 1;
      loadMoveInfoUI(runtime);
      drawTextBorderOnWindows6and7(runtime);
      moveLearnerInitListMenu(runtime);
      printTeachWhichMoveToStrVar1(runtime, true);
      printMoveInfoHandleCancelCopyToVram(runtime);
      break;
    case MENU_STATE_TRY_OVERWRITE_MOVE:
      tryOverwriteMove(runtime);
      break;
    case MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE:
      stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_MonForgotOldMoveAndMonLearnedNewMove);
      resources(runtime).state = MENU_STATE_PRINT_TEXT_THEN_FANFARE;
      runtime.operations.push(`PlayFanfare(${MUS_LEVEL_UP})`);
      break;
    case MENU_STATE_PRINT_TEXT_THEN_FANFARE:
      runtime.operations.push(`PlayFanfare(${MUS_LEVEL_UP})`);
      resources(runtime).state = MENU_STATE_WAIT_FOR_FANFARE;
      break;
    case MENU_STATE_WAIT_FOR_FANFARE:
      if (runtime.fanfareInactive) resources(runtime).state = MENU_STATE_WAIT_FOR_A_BUTTON;
      break;
    case MENU_STATE_WAIT_FOR_A_BUTTON:
      if ((runtime.joyNew & A_BUTTON) !== 0) {
        runtime.operations.push(`PlaySE(${SE_SELECT})`);
        resources(runtime).state = MENU_STATE_FADE_AND_RETURN;
      }
      break;
  }
};

const handleTeachMoveConfirm = (runtime: LearnMoveRuntime): void => {
  switch (yesNoMenuProcessInput(runtime)) {
    case 0:
      if (giveMoveToMon(runtime, resources(runtime).selectedPartyMember, resources(runtime).learnableMoves[resources(runtime).selectedIndex]) !== 0xffff) {
        stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_MonLearnedMove);
        runtime.gSpecialVar_0x8004 = 1;
        resources(runtime).state = MENU_STATE_PRINT_TEXT_THEN_FANFARE;
      } else {
        resources(runtime).state = MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT;
      }
      break;
    case 1:
    case MENU_B_PRESSED:
      resources(runtime).state = MENU_STATE_SETUP_BATTLE_MODE;
      break;
  }
};

const handleGiveUpConfirm = (runtime: LearnMoveRuntime): void => {
  switch (yesNoMenuProcessInput(runtime)) {
    case 0:
      runtime.gSpecialVar_0x8004 = 0;
      resources(runtime).state = MENU_STATE_FADE_AND_RETURN;
      break;
    case 1:
    case MENU_B_PRESSED:
      resources(runtime).state = MENU_STATE_SETUP_BATTLE_MODE;
      break;
  }
};

const handleConfirmDeleteOldMove = (runtime: LearnMoveRuntime): void => {
  switch (yesNoMenuProcessInput(runtime)) {
    case 0:
      stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_WhichMoveShouldBeForgotten);
      resources(runtime).state = MENU_STATE_PRINT_WHICH_MOVE_PROMPT;
      break;
    case 1:
    case MENU_B_PRESSED:
      resources(runtime).state = MENU_STATE_PRINT_STOP_TEACHING;
      break;
  }
};

const handleConfirmStopTeaching = (runtime: LearnMoveRuntime): void => {
  switch (yesNoMenuProcessInput(runtime)) {
    case 0:
      resources(runtime).state = MENU_STATE_CHOOSE_SETUP_STATE;
      break;
    case 1:
    case MENU_B_PRESSED:
      resources(runtime).state = MENU_STATE_PRINT_TRYING_TO_LEARN_PROMPT;
      break;
  }
};

const tryOverwriteMove = (runtime: LearnMoveRuntime): void => {
  if (runtime.gPaletteFade.active) return;
  const selectedSlot = resources(runtime).selectedMoveSlot;
  if (selectedSlot === 4) {
    resources(runtime).state = MENU_STATE_PRINT_STOP_TEACHING;
    return;
  }
  const mon = runtime.gPlayerParty[resources(runtime).selectedPartyMember];
  const oldMove = mon.moves[selectedSlot] ?? MOVE_NONE;
  runtime.gStringVar3 = getMoveName(runtime, oldMove);
  if (mon.ppBonuses) mon.ppBonuses[selectedSlot] = 0;
  const newMove = resources(runtime).learnableMoves[resources(runtime).selectedIndex];
  mon.moves[selectedSlot] = newMove;
  runtime.gStringVar2 = getMoveName(runtime, newMove);
  stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_1_2_and_Poof);
  resources(runtime).state = MENU_STATE_DOUBLE_FANFARE_FORGOT_MOVE;
  runtime.gSpecialVar_0x8004 = 1;
};

export const drawTextBorderOnWindows6and7 = (runtime: LearnMoveRuntime): void => {
  for (let i = 6; i < 8; i += 1) runtime.operations.push(`DrawTextBorderOuter(${i}, 0x001, 14)`);
};

export const printTeachWhichMoveToStrVar1 = (runtime: LearnMoveRuntime, onInit: boolean): void => {
  if (!onInit) {
    runtime.gStringVar4 = expand(runtime, gText_TeachWhichMoveToMon);
    printTextOnWindow(runtime, 7, runtime.gStringVar4, 0, 2, 0, 2);
    runtime.operations.push('PutWindowTilemap(7)');
    runtime.operations.push('CopyWindowToVram(7, COPYWIN_FULL)');
  }
};

export const initMoveRelearnerStateVariables = (runtime: LearnMoveRuntime): void => {
  const r = resources(runtime);
  r.state = MENU_STATE_FADE_TO_BLACK;
  r.unk_02 = 0;
  r.scrollPositionMaybe = 0;
  r.unk_18 = 0;
  r.unk_1C = 0;
  r.numLearnableMoves = 0;
  r.unk_1B = 0;
  r.unk_1D = 0;
  r.unk_1E = 0;
  r.scheduleMoveInfoUpdate = false;
  for (let i = 0; i < 20; i += 1) r.learnableMoves[i] = MOVE_NONE;
};

export const spriteCBListMenuScrollIndicators = (sprite: LearnMoveSprite): void => {
  const abcissa = (sprite.data[1] * 10) & 0xff;
  switch (sprite.data[0]) {
    case 1:
      sprite.x2 = sin(abcissa, 3) * sprite.data[2];
      break;
    case 2:
      sprite.y2 = sin(abcissa, 1) * sprite.data[2];
      break;
  }
  sprite.data[1] += 1;
};

export const spawnListMenuScrollIndicatorSprites = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('LoadSpriteSheet(5525)');
  runtime.operations.push('LoadSpritePalette(5526)');
  const first = createSprite(runtime, 200, 4);
  resources(runtime).spriteIds[0] = first;
  runtime.sprites[first].anim = 1;
  runtime.sprites[first].data[0] = 2;
  runtime.sprites[first].data[2] = -1;
  const second = createSprite(runtime, 200, 108);
  resources(runtime).spriteIds[0] = second;
  runtime.sprites[second].data[0] = 2;
  runtime.sprites[second].data[2] = 1;
  for (let i = 0; i < 2; i += 1) {
    runtime.sprites[resources(runtime).spriteIds[i]].invisible = true;
  }
};

export const moveRelearnerInitListMenuBuffersEtc = (runtime: LearnMoveRuntime): void => {
  const r = resources(runtime);
  const mon = runtime.gPlayerParty[r.selectedPartyMember];
  r.numLearnableMoves = getMoveRelearnerMoves(mon, r.learnableMoves);
  const count = getMoveRelearnerMoves(mon, r.learnableMoves);
  for (let i = 0; i < r.numLearnableMoves; i += 1) r.listMenuStrbufs[i] = getMoveName(runtime, r.learnableMoves[i]);
  runtime.gStringVar1 = mon.nickname;
  r.listMenuStrbufs[r.numLearnableMoves] = 'CANCEL';
  r.numLearnableMoves += 1;
  r.listMenuItems = [];
  let i = 0;
  for (; i < count; i += 1) r.listMenuItems[i] = { label: r.listMenuStrbufs[i], index: i };
  r.listMenuItems[i] = { label: 'CANCEL', index: LIST_CANCEL };
};

export const moveRelearnerMenuHandleInput = (runtime: LearnMoveRuntime): void => {
  const input = runtime.listMenuInputs.shift();
  if (input !== undefined) moveRelearnerMenuMoveCursorFunc(runtime, input, false);
  if ((runtime.joyNew & A_BUTTON) !== 0) {
    runtime.operations.push(`PlaySE(${SE_SELECT})`);
    if (resources(runtime).selectedIndex !== LIST_CANCEL) {
      resources(runtime).state = MENU_STATE_PRINT_TEACH_MOVE_PROMPT;
      runtime.gStringVar2 = resources(runtime).listMenuStrbufs[resources(runtime).selectedIndex];
      stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_TeachMoveQues);
    } else {
      stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_GiveUpTryingToTeachNewMove);
      resources(runtime).state = MENU_STATE_PRINT_GIVE_UP_PROMPT;
    }
  } else if ((runtime.joyNew & B_BUTTON) !== 0) {
    runtime.operations.push(`PlaySE(${SE_SELECT})`);
    resources(runtime).state = MENU_STATE_PRINT_GIVE_UP_PROMPT;
    stringExpandPlaceholdersAndPrintTextOnWindow7Color2(runtime, gText_GiveUpTryingToTeachNewMove);
  }
  if (resources(runtime).numLearnableMoves > 6) {
    runtime.sprites[0].invisible = false;
    runtime.sprites[1].invisible = false;
    if (resources(runtime).scrollPositionMaybe === 0) runtime.sprites[0].invisible = true;
    else if (resources(runtime).scrollPositionMaybe === resources(runtime).numLearnableMoves - 6) runtime.sprites[1].invisible = true;
  }
};

export const moveLearnerInitListMenu = (runtime: LearnMoveRuntime): void => {
  resources(runtime).listMenuTaskId = 1;
  runtime.operations.push(`ListMenuInit(scroll=${resources(runtime).listMenuScrollPos}, row=${resources(runtime).listMenuScrollRow})`);
  runtime.operations.push('CopyWindowToVram(6, COPYWIN_MAP)');
};

export const printMoveInfo = (runtime: LearnMoveRuntime, move: number): void => {
  const battleMove = runtime.battleMoves[move] ?? { type: 0, power: 0, accuracy: 0, pp: 0, description: '' };
  runtime.operations.push(`BlitMenuInfoIcon(2, ${battleMove.type + 1}, 1, 4)`);
  printTextOnWindow(runtime, 3, battleMove.power < 2 ? gText_ThreeHyphens : battleMove.power.toString().padStart(3, ' '), 1, 4, 0, 0);
  printTextOnWindow(runtime, 3, battleMove.accuracy === 0 ? gText_ThreeHyphens : battleMove.accuracy.toString().padStart(3, ' '), 1, 18, 0, 1);
  printTextOnWindow(runtime, 4, String(battleMove.pp), 2, 2, 0, 0);
  printTextOnWindow(runtime, 5, battleMove.description, 1, 0, 0, 0);
};

export const loadMoveInfoUI = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('BlitMenuInfoIcon(0, MENU_INFO_ICON_TYPE, 1, 4)');
  runtime.operations.push('BlitMenuInfoIcon(1, MENU_INFO_ICON_POWER, 0, 4)');
  runtime.operations.push('BlitMenuInfoIcon(1, MENU_INFO_ICON_ACCURACY, 0, 19)');
  runtime.operations.push('BlitMenuInfoIcon(0, MENU_INFO_ICON_PP, 1, 19)');
  runtime.operations.push('BlitMenuInfoIcon(0, MENU_INFO_ICON_EFFECT, 1, 34)');
  for (const id of [0, 1, 4, 3, 5, 2, 7]) runtime.operations.push(`PutWindowTilemap(${id})`);
  runtime.operations.push('CopyWindowToVram(0, COPYWIN_GFX)');
  runtime.operations.push('CopyWindowToVram(1, COPYWIN_GFX)');
};

export const printMoveInfoHandleCancelCopyToVram = (runtime: LearnMoveRuntime): void => {
  if (resources(runtime).selectedIndex !== LIST_CANCEL) {
    printMoveInfo(runtime, resources(runtime).learnableMoves[resources(runtime).selectedIndex]);
  } else {
    for (let i = 2; i < 6; i += 1) {
      runtime.operations.push(`FillWindowPixelBuffer(${i}, PIXEL_FILL(0))`);
      runtime.operations.push(`CopyWindowToVram(${i}, COPYWIN_GFX)`);
    }
  }
  for (const id of [3, 4, 2, 2, 5]) runtime.operations.push(`CopyWindowToVram(${id}, COPYWIN_GFX)`);
  runtime.operations.push('CopyWindowToVram(7, COPYWIN_FULL)');
};

export const moveRelearnerMenuMoveCursorFunc = (runtime: LearnMoveRuntime, itemIndex: number, onInit: boolean): void => {
  if (!onInit) {
    runtime.operations.push(`PlaySE(${SE_SELECT})`);
    resources(runtime).scheduleMoveInfoUpdate = true;
    resources(runtime).selectedIndex = itemIndex;
  }
};

export const yesNoMenuProcessInput = (runtime: LearnMoveRuntime): number => {
  const input = runtime.yesNoInputs.shift() ?? MENU_NOTHING_CHOSEN;
  if (input !== MENU_NOTHING_CHOSEN) {
    runtime.operations.push('PutWindowTilemap(6)');
    runtime.operations.push('CopyWindowToVram(6, COPYWIN_MAP)');
  }
  return input;
};

export const printTextOnWindow = (
  runtime: LearnMoveRuntime,
  windowId: number,
  str: string,
  x: number,
  y: number,
  speed: number,
  colorIdx: number
): void => {
  let letterSpacing = 1;
  let lineSpacing = 1;
  if (colorIdx === 0 || colorIdx === 1) {
    letterSpacing = 0;
    lineSpacing = 0;
  }
  const r = resources(runtime);
  if (colorIdx === 0 || colorIdx === 1) r.textColor = [0, 2, 3];
  else if (colorIdx === 2) r.textColor = [1, 2, 3];
  if (colorIdx !== 1) runtime.operations.push(`FillWindowPixelBuffer(${windowId}, PIXEL_FILL(${r.textColor[0]}))`);
  runtime.printedText.push({ windowId, str, x, y, speed, colorIdx, textColor: [...r.textColor] });
  runtime.operations.push(`AddTextPrinterParameterized4(${windowId}, FONT_NORMAL_COPY_2, ${x}, ${y}, ${letterSpacing}, ${lineSpacing})`);
};

export const moveRelearnerLoadBgGfx = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('ResetBgsAndClearDma3BusyFlags(FALSE)');
  runtime.operations.push('InitBgsFromTemplates(0, sBgTemplates, 2)');
  runtime.operations.push('ResetTempTileDataBuffers');
  runtime.operations.push('InitWindows(sWindowTemplates)');
  runtime.operations.push('DeactivateAllTextPrinters');
  for (let i = 0; i < sWindowTemplates.length; i += 1) {
    runtime.operations.push(`ClearWindowTilemap(${i})`);
    runtime.operations.push(`FillWindowPixelBuffer(${i}, PIXEL_FILL(0))`);
  }
  runtime.operations.push('FillWindowPixelBuffer(7, PIXEL_FILL(1))');
  runtime.operations.push('FillBgTilemapBufferRect(0, 0x000, 0, 0, 30, 20, 15)');
  runtime.operations.push('SetBgTilemapBuffer(1, sMoveRelearner->bg1TilemapBuffer)');
  runtime.operations.push('LoadUserWindowGfx(0, 1, BG_PLTT_ID(14))');
  runtime.operations.push('ListMenuLoadStdPalAt(BG_PLTT_ID(13), 1)');
  runtime.operations.push('LoadPalette(gMoveRelearner_Pal, BG_PLTT_ID(0), PLTT_SIZE_4BPP)');
  runtime.operations.push('DecompressAndLoadBgGfxUsingHeap(1, gMoveRelearner_Gfx, 0, 0, 0)');
  runtime.operations.push('CopyToBgTilemapBuffer(1, gMoveRelearner_Tilemap, 0, 0)');
  runtime.operations.push('CopyBgTilemapBufferToVram(1)');
  for (const reg of ['BG0VOFS', 'BG0HOFS', 'BG1VOFS', 'BG1HOFS']) runtime.operations.push(`SetGpuReg(REG_OFFSET_${reg}, 0)`);
};

const createYesNoMenu = (runtime: LearnMoveRuntime): void => {
  runtime.operations.push('CreateYesNoMenu(&sMoveRelearnerYesNoMenuTemplate, FONT_NORMAL_COPY_2, 0, 2, 0x001, 14, 0)');
};

const createSprite = (runtime: LearnMoveRuntime, x: number, y: number): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push({ x, y, x2: 0, y2: 0, data: [0, 0, 0, 0, 0, 0, 0, 0], invisible: false, anim: null });
  runtime.operations.push(`CreateSprite(${x}, ${y})`);
  return id;
};

const getMoveRelearnerMoves = (mon: LearnMoveMon, out: number[]): number => {
  for (let i = 0; i < mon.relearnMoves.length; i += 1) out[i] = mon.relearnMoves[i];
  return mon.relearnMoves.length;
};

const giveMoveToMon = (runtime: LearnMoveRuntime, partyIndex: number, move: number): number => {
  const mon = runtime.gPlayerParty[partyIndex];
  const openSlot = mon.moves.findIndex((slot) => slot === MOVE_NONE);
  if (openSlot < 0 || openSlot >= 4) return 0xffff;
  mon.moves[openSlot] = move;
  runtime.gStringVar2 = getMoveName(runtime, move);
  return openSlot;
};

const sin = (angle: number, amplitude: number): number => Math.round(Math.sin((angle * Math.PI) / 128) * amplitude);

export const VBlankCB_MoveRelearner = vBlankCBMoveRelearner;
export const TeachMoveRelearnerMove = teachMoveRelearnerMove;
export const Task_InitMoveRelearnerMenu = taskInitMoveRelearnerMenu;
export const MoveRelearnerLoadBgGfx = moveRelearnerLoadBgGfx;
export const CB2_MoveRelearner_Init = cb2MoveRelearnerInit;
export const CB2_MoveRelearner_Resume = cb2MoveRelearnerResume;
export const CB2_MoveRelearner = cb2MoveRelearner;
export const StringExpandPlaceholdersAndPrintTextOnWindow7Color2 = stringExpandPlaceholdersAndPrintTextOnWindow7Color2;
export const MoveRelearnerStateMachine = moveRelearnerStateMachine;
export const DrawTextBorderOnWindows6and7 = drawTextBorderOnWindows6and7;
export const PrintTeachWhichMoveToStrVar1 = printTeachWhichMoveToStrVar1;
export const InitMoveRelearnerStateVariables = initMoveRelearnerStateVariables;
export const SpriteCB_ListMenuScrollIndicators = spriteCBListMenuScrollIndicators;
export const SpawnListMenuScrollIndicatorSprites = spawnListMenuScrollIndicatorSprites;
export const MoveRelearnerInitListMenuBuffersEtc = moveRelearnerInitListMenuBuffersEtc;
export const MoveRelearnerMenuHandleInput = moveRelearnerMenuHandleInput;
export const MoveLearnerInitListMenu = moveLearnerInitListMenu;
export const PrintMoveInfo = printMoveInfo;
export const LoadMoveInfoUI = loadMoveInfoUI;
export const PrintMoveInfoHandleCancel_CopyToVram = printMoveInfoHandleCancelCopyToVram;
export const MoveRelearnerMenu_MoveCursorFunc = moveRelearnerMenuMoveCursorFunc;
export const YesNoMenuProcessInput = yesNoMenuProcessInput;
export const PrintTextOnWindow = printTextOnWindow;
