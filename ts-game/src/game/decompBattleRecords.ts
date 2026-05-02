export const LINK_B_RECORDS_COUNT = 5;
export const PLAYER_NAME_LENGTH = 7;
export const EOS = 0xff;
export const CHAR_SPACE = 0x00;
export const EXT_CTRL_CODE_BEGIN = 0xfc;
export const EXT_CTRL_CODE_JPN = 0x15;

export const LANGUAGE_JAPANESE = 1;
export const B_OUTCOME_WON = 1;
export const B_OUTCOME_LOST = 2;
export const B_OUTCOME_DREW = 3;
export const GAME_STAT_LINK_BATTLE_WINS = 23;
export const GAME_STAT_LINK_BATTLE_LOSSES = 24;
export const GAME_STAT_LINK_BATTLE_DRAWS = 25;
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const SE_SELECT = 5;

export const MAP_GROUP_UNION_ROOM = 0;
export const MAP_NUM_UNION_ROOM = 0;
export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;
export const FONT_NORMAL = 0;
export const COPYWIN_GFX = 'COPYWIN_GFX';
export const COPYWIN_FULL = 'COPYWIN_FULL';
export const PIXEL_FILL_0 = 0;
export const PLTT_SIZE_4BPP = 32;
export const VRAM_SIZE = 0x18000;
export const OAM_SIZE = 0x400;
export const PLTT_SIZE = 0x400;

export const REG_OFFSET_DISPCNT = 'REG_OFFSET_DISPCNT';
export const REG_OFFSET_BG0CNT = 'REG_OFFSET_BG0CNT';
export const REG_OFFSET_BG0HOFS = 'REG_OFFSET_BG0HOFS';
export const REG_OFFSET_BG0VOFS = 'REG_OFFSET_BG0VOFS';
export const REG_OFFSET_BG1CNT = 'REG_OFFSET_BG1CNT';
export const REG_OFFSET_BG1HOFS = 'REG_OFFSET_BG1HOFS';
export const REG_OFFSET_BG1VOFS = 'REG_OFFSET_BG1VOFS';
export const REG_OFFSET_BG2CNT = 'REG_OFFSET_BG2CNT';
export const REG_OFFSET_BG2HOFS = 'REG_OFFSET_BG2HOFS';
export const REG_OFFSET_BG2VOFS = 'REG_OFFSET_BG2VOFS';
export const REG_OFFSET_BG3CNT = 'REG_OFFSET_BG3CNT';
export const REG_OFFSET_BG3HOFS = 'REG_OFFSET_BG3HOFS';
export const REG_OFFSET_BG3VOFS = 'REG_OFFSET_BG3VOFS';
export const REG_OFFSET_WIN0H = 'REG_OFFSET_WIN0H';
export const REG_OFFSET_WIN0V = 'REG_OFFSET_WIN0V';
export const REG_OFFSET_WININ = 'REG_OFFSET_WININ';
export const REG_OFFSET_WINOUT = 'REG_OFFSET_WINOUT';
export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const REG_OFFSET_BLDY = 'REG_OFFSET_BLDY';

export const DISPCNT_MODE_0 = 0x0000;
export const DISPCNT_OBJ_1D_MAP = 0x0040;
export const DISPCNT_BG0_ON = 0x0100;
export const DISPCNT_BG3_ON = 0x0800;

export type BattleRecordsTaskFunc =
  | 'Task_WaitFadeIn'
  | 'Task_WaitButton'
  | 'Task_FadeOut'
  | 'Task_DestroyAndReturnToField';

export interface LinkBattleRecord {
  name: number[];
  trainerId: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface LinkBattleRecords {
  entries: LinkBattleRecord[];
}

export interface TrainerCardRse {
  playerName: number[];
  trainerId: number;
  linkBattleWins: number;
  linkBattleLosses: number;
}

export interface BattleRecordsTask {
  id: number;
  func: BattleRecordsTaskFunc;
  priority: number;
  destroyed: boolean;
  data: number[];
}

export interface BattleRecordsRuntime {
  sBg3TilemapBuffer_p: number[] | null;
  gMain: { state: number; newKeys: number };
  gPaletteFade: { active: boolean };
  gSpecialVar_0x8004: number;
  gBattleOutcome: number;
  gSaveBlock1Ptr: { location: { mapGroup: number; mapNum: number } };
  gSaveBlock2Ptr: { linkBattleRecords: LinkBattleRecords };
  gTrainerCards: Array<{ rse: TrainerCardRse }>;
  gLinkPlayers: Array<{ language: number }>;
  gameStats: Record<number, number>;
  gpuRegs: Record<string, number>;
  tasks: BattleRecordsTask[];
  mainCallback2: string | null;
  vblankCallback: string | null;
  dma3Busy: boolean;
  textWindowPalette: number[];
  stringVars: [number[], number[], number[], number[]];
  calls: Array<{ fn: string; args: unknown[] }>;
  printedText: Array<{ windowId: number; fontId: number; x: number; y: number; color: readonly number[]; text: string }>;
}

export const sTiles = 'graphics/battle_records/bg_tiles.4bpp';
export const sPalette = 'graphics/battle_records/bg_tiles.gbapal';
export const sTilemap = 'graphics/battle_records/bg_tiles.bin';
export const sTextColor = [0, 2, 3] as const;
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 27, height: 18, paletteNum: 15, baseBlock: 0x014 },
  'DUMMY_WIN_TEMPLATE'
] as const;
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0x000 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0x000 }
] as const;

export const gString_BattleRecords_PlayersBattleResults = "{PLAYER}'s BATTLE RESULTS";
export const gString_BattleRecords_TotalRecord = 'TOTAL RECORD W:{STR_VAR_1} L:{STR_VAR_2} D:{STR_VAR_3}';
export const gString_BattleRecords_ColumnHeaders = 'WIN{CLEAR_TO 0x30}LOSE{CLEAR_TO 0x60}DRAW';
export const gString_BattleRecords_7Dashes = '-------';
export const gString_BattleRecords_4Dashes = '----';

export const bytesFromString = (value: string): number[] => [...value].map((char) => char.charCodeAt(0)).concat(EOS);
export const stringFromBytes = (value: readonly number[]): string => {
  const chars: string[] = [];
  for (const byte of value) {
    if (byte === EOS) {
      break;
    }
    if (byte === CHAR_SPACE) {
      chars.push(' ');
    } else {
      chars.push(String.fromCharCode(byte));
    }
  }
  return chars.join('');
};

export const createLinkBattleRecord = (): LinkBattleRecord => ({
  name: [EOS],
  trainerId: 0,
  wins: 0,
  losses: 0,
  draws: 0
});

export const createBattleRecordsRuntime = (): BattleRecordsRuntime => ({
  sBg3TilemapBuffer_p: null,
  gMain: { state: 0, newKeys: 0 },
  gPaletteFade: { active: false },
  gSpecialVar_0x8004: 0,
  gBattleOutcome: 0,
  gSaveBlock1Ptr: { location: { mapGroup: 1, mapNum: 1 } },
  gSaveBlock2Ptr: { linkBattleRecords: { entries: Array.from({ length: LINK_B_RECORDS_COUNT }, createLinkBattleRecord) } },
  gTrainerCards: Array.from({ length: 4 }, () => ({
    rse: { playerName: [EOS], trainerId: 0, linkBattleWins: 0, linkBattleLosses: 0 }
  })),
  gLinkPlayers: Array.from({ length: 4 }, () => ({ language: 0 })),
  gameStats: {},
  gpuRegs: {},
  tasks: [],
  mainCallback2: null,
  vblankCallback: null,
  dma3Busy: false,
  textWindowPalette: [0],
  stringVars: [[EOS], [EOS], [EOS], [EOS]],
  calls: [],
  printedText: []
});

const call = (runtime: BattleRecordsRuntime, fn: string, ...args: unknown[]): void => {
  runtime.calls.push({ fn, args });
};

const bgPlttId = (value: number): number => value * 16;
const pixelFill = (value: number): number => value;
const stringCopy = (dest: number[], src: readonly number[], destIndex = 0): void => {
  let i = 0;
  do {
    dest[destIndex + i] = src[i] ?? EOS;
    i += 1;
  } while (dest[destIndex + i - 1] !== EOS);
  dest.length = destIndex + i;
};
const stringCopyN = (dest: number[], src: readonly number[], n: number): void => {
  for (let i = 0; i < n; i += 1) {
    dest[i] = src[i] ?? EOS;
    if (dest[i] === EOS) {
      dest.length = i + 1;
      return;
    }
  }
  dest.length = n;
};
const stringCompareN = (a: readonly number[], b: readonly number[], n: number): number => {
  for (let i = 0; i < n; i += 1) {
    const av = a[i] ?? EOS;
    const bv = b[i] ?? EOS;
    if (av !== bv) {
      return av - bv;
    }
  }
  return 0;
};
const stringFillWithTerminator = (dest: number[], n: number): void => {
  dest.length = 0;
  for (let i = 0; i < n; i += 1) {
    dest[i] = EOS;
  }
};
const convertIntToDecimalStringN = (dest: number[], value: number, mode: 'left' | 'right', n: number): void => {
  const capped = Math.trunc(value).toString().slice(0, n);
  const text = mode === 'right' ? capped.padStart(n, ' ') : capped;
  stringCopy(dest, bytesFromString(text));
};
const stringExpandPlaceholders = (runtime: BattleRecordsRuntime, dest: number[], src: string): void => {
  const expanded = src
    .replace('{STR_VAR_1}', stringFromBytes(runtime.stringVars[0]))
    .replace('{STR_VAR_2}', stringFromBytes(runtime.stringVars[1]))
    .replace('{STR_VAR_3}', stringFromBytes(runtime.stringVars[2]))
    .replace('{PLAYER}', 'PLAYER');
  stringCopy(dest, bytesFromString(expanded));
};
const getStringWidth = (_fontId: number, text: readonly number[], _letterSpacing: number): number =>
  stringFromBytes(text).length * 8;

const getGameStat = (runtime: BattleRecordsRuntime, statId: number): number => runtime.gameStats[statId] ?? 0;
const setGameStat = (runtime: BattleRecordsRuntime, statId: number, value: number): void => {
  runtime.gameStats[statId] = value;
};
const incrementGameStat = (runtime: BattleRecordsRuntime, statId: number): void => {
  runtime.gameStats[statId] = getGameStat(runtime, statId) + 1;
};
const setGpuReg = (runtime: BattleRecordsRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = value & 0xffff;
  call(runtime, 'SetGpuReg', reg, value & 0xffff);
};
const createTask = (runtime: BattleRecordsRuntime, func: BattleRecordsTaskFunc, priority: number): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({ id: taskId, func, priority, destroyed: false, data: Array.from({ length: 16 }, () => 0) });
  call(runtime, 'CreateTask', func, priority);
  return taskId;
};
const destroyTask = (runtime: BattleRecordsRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  call(runtime, 'DestroyTask', taskId);
};

export const showBattleRecords = (runtime: BattleRecordsRuntime): void => {
  runtime.vblankCallback = null;
  call(runtime, 'SetVBlankCallback', null);
  runtime.mainCallback2 = 'MainCB2_SetUp';
  call(runtime, 'SetMainCallback2', 'MainCB2_SetUp');
};

export const mainCB2SetUp = (runtime: BattleRecordsRuntime): void => {
  switch (runtime.gMain.state) {
    case 0:
      runtime.vblankCallback = null;
      call(runtime, 'SetVBlankCallback', null);
      resetGpu(runtime);
      runtime.gMain.state += 1;
      break;
    case 1:
      stopAllRunningTasks(runtime);
      runtime.gMain.state += 1;
      break;
    case 2:
      runtime.sBg3TilemapBuffer_p = Array.from({ length: 0x800 }, () => 0);
      call(runtime, 'AllocZeroed', 0x800);
      call(runtime, 'ResetBgsAndClearDma3BusyFlags', 0);
      call(runtime, 'InitBgsFromTemplates', 0, sBgTemplates, sBgTemplates.length);
      call(runtime, 'SetBgTilemapBuffer', 3, runtime.sBg3TilemapBuffer_p);
      resetBGPos(runtime);
      runtime.gMain.state += 1;
      break;
    case 3:
      loadFrameGfxOnBg(runtime, 3);
      call(runtime, 'LoadPalette', runtime.textWindowPalette, bgPlttId(15), PLTT_SIZE_4BPP);
      runtime.gMain.state += 1;
      break;
    case 4:
      if (runtime.dma3Busy !== true) {
        call(runtime, 'ShowBg', 0);
        call(runtime, 'ShowBg', 3);
        call(runtime, 'CopyBgTilemapBufferToVram', 3);
        runtime.gMain.state += 1;
      }
      break;
    case 5:
      call(runtime, 'InitWindows', sWindowTemplates);
      call(runtime, 'DeactivateAllTextPrinters');
      runtime.gMain.state += 1;
      break;
    case 6:
      call(runtime, 'BeginNormalPaletteFade', PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      runtime.gMain.state += 1;
      break;
    case 7:
      enableDisplay(runtime);
      runtime.vblankCallback = 'VBlankCB';
      call(runtime, 'SetVBlankCallback', 'VBlankCB');
      if (runtime.gSpecialVar_0x8004) {
        call(runtime, 'PrintTrainerTowerRecords');
      } else {
        printBattleRecords(runtime);
      }
      createTask(runtime, 'Task_WaitFadeIn', 8);
      runtime.mainCallback2 = 'MainCB2';
      call(runtime, 'SetMainCallback2', 'MainCB2');
      runtime.gMain.state = 0;
      break;
  }
};

export const vblankCB = (runtime: BattleRecordsRuntime): void => {
  call(runtime, 'LoadOam');
  call(runtime, 'ProcessSpriteCopyRequests');
  call(runtime, 'TransferPlttBuffer');
};

export const mainCB2 = (runtime: BattleRecordsRuntime): void => {
  call(runtime, 'RunTasks');
  call(runtime, 'AnimateSprites');
  call(runtime, 'BuildOamBuffer');
  call(runtime, 'UpdatePaletteFade');
};

export const taskWaitFadeIn = (runtime: BattleRecordsRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.tasks[taskId].func = 'Task_WaitButton';
  }
};

export const taskWaitButton = (runtime: BattleRecordsRuntime, taskId: number): void => {
  if ((runtime.gMain.newKeys & A_BUTTON) || (runtime.gMain.newKeys & B_BUTTON)) {
    call(runtime, 'PlaySE', SE_SELECT);
    runtime.tasks[taskId].func = 'Task_FadeOut';
  }
};

export const taskFadeOut = (runtime: BattleRecordsRuntime, taskId: number): void => {
  call(runtime, 'BeginNormalPaletteFade', PALETTES_ALL, 0, 0, 16, RGB_BLACK);
  runtime.tasks[taskId].func = 'Task_DestroyAndReturnToField';
};

export const taskDestroyAndReturnToField = (runtime: BattleRecordsRuntime, taskId: number): void => {
  if (!runtime.gPaletteFade.active) {
    runtime.mainCallback2 = 'CB2_ReturnToFieldContinueScriptPlayMapMusic';
    call(runtime, 'SetMainCallback2', 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
    call(runtime, 'Free', runtime.sBg3TilemapBuffer_p);
    runtime.sBg3TilemapBuffer_p = null;
    clearWindowCommitAndRemove(runtime, 0);
    call(runtime, 'FreeAllWindowBuffers');
    destroyTask(runtime, taskId);
  }
};

export const runBattleRecordsTask = (runtime: BattleRecordsRuntime, taskId: number): void => {
  switch (runtime.tasks[taskId].func) {
    case 'Task_WaitFadeIn':
      taskWaitFadeIn(runtime, taskId);
      break;
    case 'Task_WaitButton':
      taskWaitButton(runtime, taskId);
      break;
    case 'Task_FadeOut':
      taskFadeOut(runtime, taskId);
      break;
    case 'Task_DestroyAndReturnToField':
      taskDestroyAndReturnToField(runtime, taskId);
      break;
  }
};

export const clearWindowCommitAndRemove = (runtime: BattleRecordsRuntime, windowId: number): void => {
  call(runtime, 'FillWindowPixelBuffer', windowId, pixelFill(0));
  call(runtime, 'ClearWindowTilemap', windowId);
  call(runtime, 'CopyWindowToVram', windowId, COPYWIN_GFX);
  call(runtime, 'RemoveWindow', windowId);
};

export const resetGpu = (runtime: BattleRecordsRuntime): void => {
  call(runtime, 'DmaClearLarge16', 3, 'VRAM', VRAM_SIZE, 0x1000);
  call(runtime, 'DmaClear32', 3, 'OAM', OAM_SIZE);
  call(runtime, 'DmaClear16', 3, 'PLTT', PLTT_SIZE);
  for (const reg of [
    REG_OFFSET_DISPCNT,
    REG_OFFSET_BG0CNT,
    REG_OFFSET_BG0HOFS,
    REG_OFFSET_BG0VOFS,
    REG_OFFSET_BG1CNT,
    REG_OFFSET_BG1HOFS,
    REG_OFFSET_BG1VOFS,
    REG_OFFSET_BG2CNT,
    REG_OFFSET_BG2HOFS,
    REG_OFFSET_BG2VOFS,
    REG_OFFSET_BG3CNT,
    REG_OFFSET_BG3HOFS,
    REG_OFFSET_BG3VOFS,
    REG_OFFSET_WIN0H,
    REG_OFFSET_WIN0V,
    REG_OFFSET_WININ,
    REG_OFFSET_WINOUT,
    REG_OFFSET_BLDCNT,
    REG_OFFSET_BLDALPHA,
    REG_OFFSET_BLDY
  ]) {
    setGpuReg(runtime, reg, 0);
  }
};

export const stopAllRunningTasks = (runtime: BattleRecordsRuntime): void => {
  call(runtime, 'ScanlineEffect_Stop');
  runtime.tasks = [];
  call(runtime, 'ResetTasks');
  call(runtime, 'ResetSpriteData');
  call(runtime, 'ResetAllPicSprites');
  call(runtime, 'ResetPaletteFade');
  call(runtime, 'FreeAllSpritePalettes');
};

export const enableDisplay = (runtime: BattleRecordsRuntime): void => {
  setGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG3_ON);
};

export const resetBGPos = (runtime: BattleRecordsRuntime): void => {
  for (let bg = 0; bg < 4; bg += 1) {
    call(runtime, 'ChangeBgX', bg, 0, 0);
    call(runtime, 'ChangeBgY', bg, 0, 0);
  }
};

export const clearLinkBattleRecord = (record: LinkBattleRecord): void => {
  record.name = [EOS];
  record.trainerId = 0;
  record.wins = 0;
  record.losses = 0;
  record.draws = 0;
};

export const clearLinkBattleRecords = (runtime: BattleRecordsRuntime, records: LinkBattleRecords): void => {
  for (let i = 0; i < LINK_B_RECORDS_COUNT; i += 1) {
    clearLinkBattleRecord(records.entries[i]);
  }
  setGameStat(runtime, GAME_STAT_LINK_BATTLE_WINS, 0);
  setGameStat(runtime, GAME_STAT_LINK_BATTLE_LOSSES, 0);
  setGameStat(runtime, GAME_STAT_LINK_BATTLE_DRAWS, 0);
};

export const getLinkBattleRecordTotalBattles = (record: LinkBattleRecord): number =>
  record.wins + record.losses + record.draws;

export const indexOfOpponentLinkBattleRecord = (
  records: LinkBattleRecords,
  name: readonly number[],
  trainerId: number
): number => {
  for (let i = 0; i < LINK_B_RECORDS_COUNT; i += 1) {
    if (stringCompareN(records.entries[i].name, name, PLAYER_NAME_LENGTH) === 0 && records.entries[i].trainerId === trainerId) {
      return i;
    }
  }
  return LINK_B_RECORDS_COUNT;
};

export const sortLinkBattleRecords = (records: LinkBattleRecords): void => {
  for (let i = LINK_B_RECORDS_COUNT - 1; i > 0; i -= 1) {
    for (let j = i - 1; j >= 0; j -= 1) {
      if (getLinkBattleRecordTotalBattles(records.entries[i]) > getLinkBattleRecordTotalBattles(records.entries[j])) {
        const tmp = records.entries[i];
        records.entries[i] = records.entries[j];
        records.entries[j] = tmp;
      }
    }
  }
};

export const updateLinkBattleRecord = (record: LinkBattleRecord, outcome: number): void => {
  switch (outcome) {
    case B_OUTCOME_WON:
      record.wins += 1;
      if (record.wins > 9999) {
        record.wins = 9999;
      }
      break;
    case B_OUTCOME_LOST:
      record.losses += 1;
      if (record.losses > 9999) {
        record.losses = 9999;
      }
      break;
    case B_OUTCOME_DREW:
      record.draws += 1;
      if (record.draws > 9999) {
        record.draws = 9999;
      }
      break;
  }
};

export const updateLinkBattleGameStats = (runtime: BattleRecordsRuntime, outcome: number): void => {
  let statId: number;
  switch (outcome) {
    case B_OUTCOME_WON:
      statId = GAME_STAT_LINK_BATTLE_WINS;
      break;
    case B_OUTCOME_LOST:
      statId = GAME_STAT_LINK_BATTLE_LOSSES;
      break;
    case B_OUTCOME_DREW:
      statId = GAME_STAT_LINK_BATTLE_DRAWS;
      break;
    default:
      return;
  }
  if (getGameStat(runtime, statId) < 9999) {
    incrementGameStat(runtime, statId);
  }
};

export const addOpponentLinkBattleRecord = (
  runtime: BattleRecordsRuntime,
  records: LinkBattleRecords,
  name: readonly number[],
  trainerId: number,
  outcome: number,
  language: number
): void => {
  const namebuf: number[] = [];
  let i: number;

  if (language === LANGUAGE_JAPANESE) {
    namebuf[0] = EXT_CTRL_CODE_BEGIN;
    namebuf[1] = EXT_CTRL_CODE_JPN;
    stringCopy(namebuf, name, 2);
  } else {
    stringCopy(namebuf, name);
  }
  updateLinkBattleGameStats(runtime, outcome);
  sortLinkBattleRecords(records);
  i = indexOfOpponentLinkBattleRecord(records, namebuf, trainerId);
  if (i === LINK_B_RECORDS_COUNT) {
    i = LINK_B_RECORDS_COUNT - 1;
    clearLinkBattleRecord(records.entries[LINK_B_RECORDS_COUNT - 1]);
    stringCopyN(records.entries[LINK_B_RECORDS_COUNT - 1].name, namebuf, PLAYER_NAME_LENGTH);
    records.entries[LINK_B_RECORDS_COUNT - 1].trainerId = trainerId;
  }
  updateLinkBattleRecord(records.entries[i], outcome);
  sortLinkBattleRecords(records);
};

export const clearPlayerLinkBattleRecords = (runtime: BattleRecordsRuntime): void => {
  clearLinkBattleRecords(runtime, runtime.gSaveBlock2Ptr.linkBattleRecords);
};

export const incTrainerCardWinCount = (runtime: BattleRecordsRuntime, battlerId: number): void => {
  runtime.gTrainerCards[battlerId].rse.linkBattleWins += 1;
  if (runtime.gTrainerCards[battlerId].rse.linkBattleWins > 9999) {
    runtime.gTrainerCards[battlerId].rse.linkBattleWins = 9999;
  }
};

export const incTrainerCardLossCount = (runtime: BattleRecordsRuntime, battlerId: number): void => {
  runtime.gTrainerCards[battlerId].rse.linkBattleLosses += 1;
  if (runtime.gTrainerCards[battlerId].rse.linkBattleLosses > 9999) {
    runtime.gTrainerCards[battlerId].rse.linkBattleLosses = 9999;
  }
};

export const updateBattleOutcomeOnTrainerCards = (runtime: BattleRecordsRuntime, battlerId: number): void => {
  switch (runtime.gBattleOutcome) {
    case B_OUTCOME_WON:
      incTrainerCardWinCount(runtime, battlerId ^ 1);
      incTrainerCardLossCount(runtime, battlerId);
      break;
    case B_OUTCOME_LOST:
      incTrainerCardLossCount(runtime, battlerId ^ 1);
      incTrainerCardWinCount(runtime, battlerId);
      break;
  }
};

export const updatePlayerLinkBattleRecords = (runtime: BattleRecordsRuntime, battlerId: number): void => {
  if (
    runtime.gSaveBlock1Ptr.location.mapGroup !== MAP_GROUP_UNION_ROOM ||
    runtime.gSaveBlock1Ptr.location.mapNum !== MAP_NUM_UNION_ROOM
  ) {
    updateBattleOutcomeOnTrainerCards(runtime, battlerId);
    addOpponentLinkBattleRecord(
      runtime,
      runtime.gSaveBlock2Ptr.linkBattleRecords,
      runtime.gTrainerCards[battlerId].rse.playerName,
      runtime.gTrainerCards[battlerId].rse.trainerId,
      runtime.gBattleOutcome,
      runtime.gLinkPlayers[battlerId].language
    );
  }
};

export const printTotalRecord = (runtime: BattleRecordsRuntime, _records: LinkBattleRecords): void => {
  let nwins = getGameStat(runtime, GAME_STAT_LINK_BATTLE_WINS);
  let nlosses = getGameStat(runtime, GAME_STAT_LINK_BATTLE_LOSSES);
  let ndraws = getGameStat(runtime, GAME_STAT_LINK_BATTLE_DRAWS);

  if (nwins > 9999) {
    nwins = 9999;
  }
  if (nlosses > 9999) {
    nlosses = 9999;
  }
  if (ndraws > 9999) {
    ndraws = 9999;
  }
  convertIntToDecimalStringN(runtime.stringVars[0], nwins, 'left', 4);
  convertIntToDecimalStringN(runtime.stringVars[1], nlosses, 'left', 4);
  convertIntToDecimalStringN(runtime.stringVars[2], ndraws, 'left', 4);
  for (let i = 0; i < 3; i += 1) {
    const strvar = runtime.stringVars[i];
    let foundEnd = false;
    for (let j = 0; j < 4; j += 1) {
      if (!foundEnd && strvar[j] === EOS) {
        foundEnd = true;
      }
      if (foundEnd) {
        strvar[j] = CHAR_SPACE;
      }
    }
    strvar[4] = EOS;
    strvar.length = 5;
  }
  stringExpandPlaceholders(runtime, runtime.stringVars[3], gString_BattleRecords_TotalRecord);
  addTextPrinterParameterized4(runtime, 0, FONT_NORMAL, 12, 24, 0, 2, sTextColor, 0, runtime.stringVars[3]);
};

export const printOpponentBattleRecord = (runtime: BattleRecordsRuntime, record: LinkBattleRecord, y: number): void => {
  if (record.wins === 0 && record.losses === 0 && record.draws === 0) {
    addTextPrinterParameterized4(runtime, 0, FONT_NORMAL, 0, y, 0, 2, sTextColor, 0, bytesFromString(gString_BattleRecords_7Dashes));
    for (let i = 0; i < 3; i += 1) {
      let x: number;
      if (i === 0) {
        x = 0x54;
      } else if (i === 1) {
        x = 0x84;
      } else {
        x = 0xb4;
      }
      addTextPrinterParameterized4(runtime, 0, FONT_NORMAL, x, y, 0, 2, sTextColor, 0, bytesFromString(gString_BattleRecords_4Dashes));
    }
  } else {
    for (let i = 0; i < 4; i += 1) {
      let x: number;
      if (i === 0) {
        x = 0;
        stringFillWithTerminator(runtime.stringVars[0], PLAYER_NAME_LENGTH + 1);
        stringCopyN(runtime.stringVars[0], record.name, PLAYER_NAME_LENGTH);
      } else if (i === 1) {
        x = 0x54;
        convertIntToDecimalStringN(runtime.stringVars[0], record.wins, 'right', 4);
      } else if (i === 2) {
        x = 0x84;
        convertIntToDecimalStringN(runtime.stringVars[0], record.losses, 'right', 4);
      } else {
        x = 0xb4;
        convertIntToDecimalStringN(runtime.stringVars[0], record.draws, 'right', 4);
      }
      addTextPrinterParameterized4(runtime, 0, FONT_NORMAL, x, y, 0, 2, sTextColor, 0, runtime.stringVars[0]);
    }
  }
};

export const printBattleRecords = (runtime: BattleRecordsRuntime): void => {
  call(runtime, 'FillWindowPixelRect', 0, pixelFill(0), 0, 0, 0xd8, 0x90);
  stringExpandPlaceholders(runtime, runtime.stringVars[3], gString_BattleRecords_PlayersBattleResults);
  const left = 0xd0 - getStringWidth(FONT_NORMAL, runtime.stringVars[3], -1);
  addTextPrinterParameterized4(runtime, 0, FONT_NORMAL, Math.trunc(left / 2), 4, 0, 2, sTextColor, 0, runtime.stringVars[3]);
  printTotalRecord(runtime, runtime.gSaveBlock2Ptr.linkBattleRecords);
  addTextPrinterParameterized4(runtime, 0, FONT_NORMAL, 0x54, 0x30, 0, 2, sTextColor, 0, bytesFromString(gString_BattleRecords_ColumnHeaders));
  for (let i = 0; i < LINK_B_RECORDS_COUNT; i += 1) {
    printOpponentBattleRecord(runtime, runtime.gSaveBlock2Ptr.linkBattleRecords.entries[i], 0x3d + 14 * i);
  }
  commitWindow(runtime, 0);
};

export const commitWindow = (runtime: BattleRecordsRuntime, windowId: number): void => {
  call(runtime, 'PutWindowTilemap', windowId);
  call(runtime, 'CopyWindowToVram', windowId, COPYWIN_FULL);
};

export const loadFrameGfxOnBg = (runtime: BattleRecordsRuntime, bg: number): void => {
  call(runtime, 'LoadBgTiles', bg, sTiles, 0xc0, 0);
  call(runtime, 'CopyToBgTilemapBufferRect', bg, sTilemap, 0, 0, 32, 32);
  call(runtime, 'LoadPalette', sPalette, bgPlttId(0), PLTT_SIZE_4BPP);
};

export const ShowBattleRecords = showBattleRecords;
export const MainCB2_SetUp = mainCB2SetUp;
export const VBlankCB = vblankCB;
export const MainCB2 = mainCB2;
export const Task_WaitFadeIn = taskWaitFadeIn;
export const Task_WaitButton = taskWaitButton;
export const Task_FadeOut = taskFadeOut;
export const Task_DestroyAndReturnToField = taskDestroyAndReturnToField;
export const ClearWindowCommitAndRemove = clearWindowCommitAndRemove;
export const ResetGpu = resetGpu;
export const StopAllRunningTasks = stopAllRunningTasks;
export const EnableDisplay = enableDisplay;
export const ResetBGPos = resetBGPos;
export const ClearLinkBattleRecord = clearLinkBattleRecord;
export const ClearLinkBattleRecords = clearLinkBattleRecords;
export const GetLinkBattleRecordTotalBattles = getLinkBattleRecordTotalBattles;
export const IndexOfOpponentLinkBattleRecord = indexOfOpponentLinkBattleRecord;
export const SortLinkBattleRecords = sortLinkBattleRecords;
export const UpdateLinkBattleRecord = updateLinkBattleRecord;
export const UpdateLinkBattleGameStats = updateLinkBattleGameStats;
export const AddOpponentLinkBattleRecord = addOpponentLinkBattleRecord;
export const ClearPlayerLinkBattleRecords = clearPlayerLinkBattleRecords;
export const IncTrainerCardWinCount = incTrainerCardWinCount;
export const IncTrainerCardLossCount = incTrainerCardLossCount;
export const UpdateBattleOutcomeOnTrainerCards = updateBattleOutcomeOnTrainerCards;
export const UpdatePlayerLinkBattleRecords = updatePlayerLinkBattleRecords;
export const PrintTotalRecord = printTotalRecord;
export const PrintOpponentBattleRecord = printOpponentBattleRecord;
export const PrintBattleRecords = printBattleRecords;
export const CommitWindow = commitWindow;
export const LoadFrameGfxOnBg = loadFrameGfxOnBg;

const addTextPrinterParameterized4 = (
  runtime: BattleRecordsRuntime,
  windowId: number,
  fontId: number,
  x: number,
  y: number,
  letterSpacing: number,
  lineSpacing: number,
  color: readonly number[],
  speed: number,
  text: readonly number[]
): void => {
  call(runtime, 'AddTextPrinterParameterized4', windowId, fontId, x, y, letterSpacing, lineSpacing, color, speed, text.slice());
  runtime.printedText.push({ windowId, fontId, x, y, color, text: stringFromBytes(text) });
};
