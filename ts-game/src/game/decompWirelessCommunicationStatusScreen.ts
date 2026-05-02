export const COLOR_NONE = 0;
export const COLOR_NORMAL = 1;
export const COLOR_TOTAL = 2;
export const COLOR_TITLE = 3;
export const COLOR_UNUSED = 4;

export const GROUPTYPE_NONE = -1;
export const GROUPTYPE_TRADE = 0;
export const GROUPTYPE_BATTLE = 1;
export const GROUPTYPE_UNION = 2;
export const GROUPTYPE_TOTAL = 3;
export const NUM_GROUPTYPES = 4;

export const NUM_TASK_DATA = 16;
export const MAX_LINK_PLAYERS = 4;
export const RFU_CHILD_MAX = 4;
export const UNION_ROOM_SPAWN_IN = 1;

export const ACTIVITY_NONE = 0;
export const ACTIVITY_BATTLE_SINGLE = 1;
export const ACTIVITY_BATTLE_DOUBLE = 2;
export const ACTIVITY_BATTLE_MULTI = 3;
export const ACTIVITY_TRADE = 4;
export const ACTIVITY_CHAT = 5;
export const ACTIVITY_CARD = 8;
export const ACTIVITY_POKEMON_JUMP = 9;
export const ACTIVITY_BERRY_CRUSH = 10;
export const ACTIVITY_BERRY_PICK = 11;
export const ACTIVITY_SEARCH = 12;
export const ACTIVITY_SPIN_TRADE = 13;
export const ACTIVITY_ITEM_TRADE = 14;
export const ACTIVITY_RECORD_CORNER = 15;
export const ACTIVITY_BERRY_BLENDER = 16;
export const ACTIVITY_ACCEPT = 17;
export const ACTIVITY_DECLINE = 18;
export const ACTIVITY_NPCTALK = 19;
export const ACTIVITY_PLYRTALK = 20;
export const ACTIVITY_WONDER_CARD = 21;
export const ACTIVITY_WONDER_NEWS = 22;
export const IN_UNION_ROOM = 1 << 6;

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const SE_SELECT = 5;
export const PALETTES_ALL = 0xffff;
export const RGB_BLACK = 0;

export const TEXT_COLOR_TRANSPARENT = 0x0;
export const TEXT_COLOR_WHITE = 0x1;
export const TEXT_COLOR_DARK_GRAY = 0x2;
export const TEXT_COLOR_LIGHT_GRAY = 0x3;
export const TEXT_COLOR_RED = 0x4;
export const TEXT_COLOR_LIGHT_RED = 0x5;
export const TEXT_COLOR_GREEN = 0x6;
export const TEXT_COLOR_LIGHT_GREEN = 0x7;

export const FONT_SMALL = 0;
export const FONT_NORMAL_COPY_2 = 1;

export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 3, tilemapTop: 0, width: 24, height: 3, paletteNum: 15, baseBlock: 0x001 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 4, width: 22, height: 15, paletteNum: 15, baseBlock: 0x049 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 4, width: 2, height: 15, paletteNum: 15, baseBlock: 0x193 },
  { bg: 0xff, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 },
] as const;

export const sHeaderTexts = [
  'WIRELESS COMMUNICATION STATUS',
  'People trading',
  'People battling',
  'People in Union Room',
  'People communicating',
] as const;

export const sActivityGroupInfo = [
  [ACTIVITY_BATTLE_SINGLE, GROUPTYPE_BATTLE, 2],
  [ACTIVITY_BATTLE_DOUBLE, GROUPTYPE_BATTLE, 2],
  [ACTIVITY_BATTLE_MULTI, GROUPTYPE_BATTLE, 4],
  [ACTIVITY_TRADE, GROUPTYPE_TRADE, 2],
  [ACTIVITY_WONDER_CARD, GROUPTYPE_TOTAL, 2],
  [ACTIVITY_WONDER_NEWS, GROUPTYPE_TOTAL, 2],
  [ACTIVITY_POKEMON_JUMP, GROUPTYPE_TOTAL, 0],
  [ACTIVITY_BERRY_CRUSH, GROUPTYPE_TOTAL, 0],
  [ACTIVITY_BERRY_PICK, GROUPTYPE_TOTAL, 0],
  [ACTIVITY_SEARCH, GROUPTYPE_NONE, 0],
  [ACTIVITY_SPIN_TRADE, GROUPTYPE_TRADE, 0],
  [ACTIVITY_ITEM_TRADE, GROUPTYPE_NONE, 0],
  [ACTIVITY_RECORD_CORNER, GROUPTYPE_TOTAL, 0],
  [ACTIVITY_BERRY_BLENDER, GROUPTYPE_NONE, 0],
  [ACTIVITY_NONE | IN_UNION_ROOM, GROUPTYPE_UNION, 1],
  [ACTIVITY_BATTLE_SINGLE | IN_UNION_ROOM, GROUPTYPE_UNION, 2],
  [ACTIVITY_TRADE | IN_UNION_ROOM, GROUPTYPE_UNION, 2],
  [ACTIVITY_CHAT | IN_UNION_ROOM, GROUPTYPE_UNION, 0],
  [ACTIVITY_CARD | IN_UNION_ROOM, GROUPTYPE_UNION, 2],
  [ACTIVITY_PLYRTALK | IN_UNION_ROOM, GROUPTYPE_UNION, 1],
  [ACTIVITY_NPCTALK | IN_UNION_ROOM, GROUPTYPE_UNION, 2],
  [ACTIVITY_ACCEPT | IN_UNION_ROOM, GROUPTYPE_UNION, 1],
  [ACTIVITY_DECLINE | IN_UNION_ROOM, GROUPTYPE_UNION, 1],
] as const;

export interface RfuPlayer {
  groupScheduledAnim: number;
  rfu: { data: { activity: number; partnerInfo: number[] } };
}

export interface WirelessLinkGroup {
  playerList: { players: RfuPlayer[] };
}

export interface WirelessTask {
  data: number[];
  destroyed: boolean;
  group?: WirelessLinkGroup;
}

export interface WirelessStatusScreenData {
  groupCounts: number[];
  prevGroupCounts: number[];
  activities: number[];
  taskId: number;
  rfuTaskId: number;
}

export interface WirelessStatusRuntime {
  sStatusScreen: WirelessStatusScreenData | null;
  tasks: WirelessTask[];
  gPaletteFade: { active: boolean };
  newKeys: number;
  svc53: boolean;
  mainCallback2: string | null;
  vBlankCallback: string | null;
  shownBgs: number[];
  playedSE: number[];
  bgTilemapBuffers: Array<Uint8Array | null>;
  freed: unknown[];
  calls: Array<{ op: string; args: unknown[] }>;
  textPrinters: Array<{ windowId: number; fontId: number; str: string; x: number; y: number; speed: number; color: number[] }>;
  gStringVar4: string;
}

export const createWirelessStatusRuntime = (): WirelessStatusRuntime => ({
  sStatusScreen: null,
  tasks: [],
  gPaletteFade: { active: false },
  newKeys: 0,
  svc53: false,
  mainCallback2: null,
  vBlankCallback: null,
  shownBgs: [],
  playedSE: [],
  bgTilemapBuffers: [null, null],
  freed: [],
  calls: [],
  textPrinters: [],
  gStringVar4: '',
});

export const createRfuPlayer = (activity: number, partners: number[] = [], groupScheduledAnim = UNION_ROOM_SPAWN_IN): RfuPlayer => ({
  groupScheduledAnim,
  rfu: { data: { activity, partnerInfo: Array.from({ length: RFU_CHILD_MAX }, (_, i) => partners[i] ?? 0) } },
});

export function CB2_RunWirelessCommunicationScreen(runtime: WirelessStatusRuntime): void {
  if (!IsDma3ManagerBusyWithBgCopy(runtime)) {
    RunTasks(runtime);
    record(runtime, 'RunTextPrinters');
    record(runtime, 'AnimateSprites');
    record(runtime, 'BuildOamBuffer');
    record(runtime, 'UpdatePaletteFade');
  }
}

export function VBlankCB_WirelessCommunicationScreen(runtime: WirelessStatusRuntime): void {
  record(runtime, 'LoadOam');
  record(runtime, 'ProcessSpriteCopyRequests');
  record(runtime, 'TransferPlttBuffer');
}

export function ShowWirelessCommunicationScreen(runtime: WirelessStatusRuntime): void {
  SetMainCallback2(runtime, 'CB2_InitWirelessCommunicationScreen');
}

export function CB2_InitWirelessCommunicationScreen(runtime: WirelessStatusRuntime): void {
  record(runtime, 'SetGpuReg', 'REG_OFFSET_DISPCNT', 0);
  runtime.sStatusScreen = {
    groupCounts: Array(NUM_GROUPTYPES).fill(0),
    prevGroupCounts: Array(NUM_GROUPTYPES).fill(0),
    activities: Array(NUM_TASK_DATA).fill(0),
    taskId: 0,
    rfuTaskId: 0,
  };
  SetVBlankCallback(runtime, null);
  record(runtime, 'ResetBgsAndClearDma3BusyFlags', false);
  record(runtime, 'InitBgsFromTemplates', 0, sBgTemplates.length);
  runtime.bgTilemapBuffers[1] = new Uint8Array(0x800);
  runtime.bgTilemapBuffers[0] = new Uint8Array(0x800);
  record(runtime, 'SetBgTilemapBuffer', 1, 0x800);
  record(runtime, 'SetBgTilemapBuffer', 0, 0x800);
  record(runtime, 'DecompressAndLoadBgGfxUsingHeap', 1, 'sBgTiles_Gfx', 0, 0, 0);
  record(runtime, 'CopyToBgTilemapBuffer', 1, 'sBgTiles_Tilemap', 0, 0);
  record(runtime, 'InitWindows', sWindowTemplates.length);
  record(runtime, 'DeactivateAllTextPrinters');
  record(runtime, 'ResetPaletteFade');
  record(runtime, 'ResetSpriteData');
  record(runtime, 'ResetTasks');
  runtime.tasks = [];
  record(runtime, 'ScanlineEffect_Stop');
  record(runtime, 'm4aSoundVSyncOn');
  SetVBlankCallback(runtime, 'VBlankCB_WirelessCommunicationScreen');
  runtime.sStatusScreen.taskId = CreateTask(runtime, 0);
  runtime.sStatusScreen.rfuTaskId = CreateTask_ListenToWireless(runtime);
  runtime.sStatusScreen.prevGroupCounts[GROUPTYPE_TOTAL] = 1;
  record(runtime, 'ChangeBgX', 0, 0, 0);
  record(runtime, 'ChangeBgY', 0, 0, 0);
  record(runtime, 'ChangeBgX', 1, 0, 0);
  record(runtime, 'ChangeBgY', 1, 0, 0);
  record(runtime, 'LoadPalette', 'sPalettes', 0, 32);
  record(runtime, 'Menu_LoadStdPalAt', 15);
  record(runtime, 'DynamicPlaceholderTextUtil_Reset');
  record(runtime, 'FillBgTilemapBufferRect', 0, 0, 0, 0, 32, 32, 15);
  record(runtime, 'CopyBgTilemapBufferToVram', 1);
  SetMainCallback2(runtime, 'CB2_RunWirelessCommunicationScreen');
  RunTasks(runtime);
  record(runtime, 'RunTextPrinters');
  record(runtime, 'AnimateSprites');
  record(runtime, 'BuildOamBuffer');
  record(runtime, 'UpdatePaletteFade');
}

export function ExitWirelessCommunicationStatusScreen(runtime: WirelessStatusRuntime): void {
  record(runtime, 'FreeAllWindowBuffers');
  for (let i = 0; i < sBgTemplates.length; i += 1) {
    runtime.freed.push(runtime.bgTilemapBuffers[i]);
    runtime.bgTilemapBuffers[i] = null;
  }
  runtime.freed.push(runtime.sStatusScreen);
  runtime.sStatusScreen = null;
  SetMainCallback2(runtime, 'CB2_ReturnToFieldContinueScriptPlayMapMusic');
}

export function CyclePalette(runtime: WirelessStatusRuntime, taskData: number[]): void {
  taskData[7] += 1;
  if (taskData[7] > 5) {
    taskData[8] += 1;
    if (taskData[8] === 14) taskData[8] = 0;
    taskData[7] = 0;
  }
  const idx = taskData[8] + 2;
  record(runtime, 'LoadPalette', `sPalettes[${idx}]`, 0, 16);
}

export function PrintHeaderTexts(runtime: WirelessStatusRuntime): void {
  record(runtime, 'FillWindowPixelBuffer', 0, 0);
  record(runtime, 'FillWindowPixelBuffer', 1, 0);
  record(runtime, 'FillWindowPixelBuffer', 2, 0);
  const width = 192 - GetStringWidth(FONT_NORMAL_COPY_2, sHeaderTexts[0], 0);
  WCSS_AddTextPrinterParameterized(runtime, 0, FONT_NORMAL_COPY_2, sHeaderTexts[0], Math.floor(width / 2), 6, COLOR_TITLE);
  let i = 0;
  for (; i < NUM_GROUPTYPES - 1; i += 1) {
    WCSS_AddTextPrinterParameterized(runtime, 1, FONT_NORMAL_COPY_2, sHeaderTexts[i + 1], 0, 30 * i + 10, COLOR_NORMAL);
  }
  WCSS_AddTextPrinterParameterized(runtime, 1, FONT_NORMAL_COPY_2, sHeaderTexts[i + 1], 0, 30 * i + 10, COLOR_TOTAL);
  record(runtime, 'PutWindowTilemap', 0);
  record(runtime, 'CopyWindowToVram', 0, 'COPYWIN_GFX');
  record(runtime, 'PutWindowTilemap', 1);
  record(runtime, 'CopyWindowToVram', 1, 'COPYWIN_GFX');
}

export function Task_WirelessCommunicationScreen(runtime: WirelessStatusRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  const status = runtime.sStatusScreen;
  if (!status) throw new Error('sStatusScreen is null');
  switch (task.data[0]) {
    case 0:
      PrintHeaderTexts(runtime);
      task.data[0] += 1;
      break;
    case 1:
      record(runtime, 'BeginNormalPaletteFade', PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      ShowBg(runtime, 1);
      record(runtime, 'CopyBgTilemapBufferToVram', 0);
      ShowBg(runtime, 0);
      task.data[0] += 1;
      break;
    case 2:
      if (!runtime.gPaletteFade.active) task.data[0] += 1;
      break;
    case 3:
      if (UpdateCommunicationCounts(runtime, status.groupCounts, status.prevGroupCounts, status.activities, status.rfuTaskId)) {
        record(runtime, 'FillWindowPixelBuffer', 2, 0);
        for (let i = 0; i < NUM_GROUPTYPES; i += 1) {
          runtime.gStringVar4 = ConvertIntToDecimalStringN(status.groupCounts[i], 2);
          if (i !== GROUPTYPE_TOTAL) {
            WCSS_AddTextPrinterParameterized(runtime, 2, FONT_NORMAL_COPY_2, runtime.gStringVar4, 4, 30 * i + 10, COLOR_NORMAL);
          } else {
            WCSS_AddTextPrinterParameterized(runtime, 2, FONT_NORMAL_COPY_2, runtime.gStringVar4, 4, 100, COLOR_TOTAL);
          }
        }
        record(runtime, 'PutWindowTilemap', 2);
        record(runtime, 'CopyWindowToVram', 2, 'COPYWIN_FULL');
      }
      if (JOY_NEW(runtime, A_BUTTON) || JOY_NEW(runtime, B_BUTTON) || runtime.svc53) {
        PlaySE(runtime, SE_SELECT);
        runtime.tasks[status.rfuTaskId].data[15] = 0xff;
        task.data[0] += 1;
      }
      CyclePalette(runtime, task.data);
      break;
    case 4:
      record(runtime, 'BeginNormalPaletteFade', PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      task.data[0] += 1;
      break;
    case 5:
      if (!runtime.gPaletteFade.active) {
        SetMainCallback2(runtime, 'ExitWirelessCommunicationStatusScreen');
        DestroyTask(runtime, taskId);
      }
      break;
  }
}

export function WCSS_AddTextPrinterParameterized(
  runtime: WirelessStatusRuntime,
  windowId: number,
  fontId: number,
  str: string,
  x: number,
  y: number,
  mode: number,
): void {
  let textColor: number[];
  switch (mode) {
    case COLOR_NONE:
      textColor = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY];
      break;
    case COLOR_NORMAL:
      textColor = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY];
      break;
    case COLOR_TOTAL:
      textColor = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_RED, TEXT_COLOR_LIGHT_RED];
      break;
    case COLOR_TITLE:
      textColor = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GREEN, TEXT_COLOR_GREEN];
      break;
    case COLOR_UNUSED:
      textColor = [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY];
      break;
    default:
      textColor = [];
      break;
  }
  runtime.textPrinters.push({ windowId, fontId, str, x, y, speed: fontId === FONT_SMALL ? 0 : 1, color: textColor });
}

export function CountPlayersInGroupAndGetActivity(player: RfuPlayer, groupCounts: number[]): number {
  const activity = player.rfu.data.activity;
  if (player.groupScheduledAnim === UNION_ROOM_SPAWN_IN) {
    for (let i = 0; i < sActivityGroupInfo.length; i += 1) {
      const groupActivity = sActivityGroupInfo[i][0];
      const groupType = sActivityGroupInfo[i][1];
      const groupPlayers = sActivityGroupInfo[i][2];
      if (groupType < MAX_LINK_PLAYERS && activity === groupActivity) {
        let k = groupPlayers;
        if (k === 0) {
          k = 0;
          for (let j = 0; j < RFU_CHILD_MAX; j += 1) {
            if (player.rfu.data.partnerInfo[j] !== 0) k += 1;
          }
          k += 1;
        }
        groupCounts[groupType] += k;
        break;
      }
    }
  }
  return activity;
}

export function HaveCountsChanged(curCounts: readonly number[], prevCounts: readonly number[]): boolean {
  for (let i = 0; i < NUM_GROUPTYPES; i += 1) {
    if (curCounts[i] !== prevCounts[i]) return true;
  }
  return false;
}

export function UpdateCommunicationCounts(
  runtime: WirelessStatusRuntime,
  groupCounts: number[],
  prevGroupCounts: number[],
  activities: number[],
  taskId: number,
): boolean {
  let activitiesUpdated = false;
  const groupCountBuffer = [0, 0, 0, 0];
  const group = runtime.tasks[taskId].group;
  if (!group) throw new Error('wireless link group missing');
  for (let i = 0; i < NUM_TASK_DATA; i += 1) {
    const activity = CountPlayersInGroupAndGetActivity(group.playerList.players[i], groupCountBuffer);
    if (activity !== activities[i]) {
      activities[i] = activity;
      activitiesUpdated = true;
    }
  }

  if (HaveCountsChanged(groupCountBuffer, prevGroupCounts)) {
    for (let i = 0; i < NUM_GROUPTYPES; i += 1) {
      groupCounts[i] = groupCountBuffer[i];
      prevGroupCounts[i] = groupCountBuffer[i];
    }
    groupCounts[GROUPTYPE_TOTAL] = groupCounts[GROUPTYPE_TRADE]
      + groupCounts[GROUPTYPE_BATTLE]
      + groupCounts[GROUPTYPE_UNION]
      + groupCounts[GROUPTYPE_TOTAL];
    activitiesUpdated = true;
  }

  return activitiesUpdated;
}

function IsDma3ManagerBusyWithBgCopy(runtime: WirelessStatusRuntime): boolean {
  const last = runtime.calls.at(-1);
  return last?.op === 'DmaBusy';
}

function RunTasks(runtime: WirelessStatusRuntime): void {
  for (let i = 0; i < runtime.tasks.length; i += 1) {
    if (!runtime.tasks[i].destroyed && i === runtime.sStatusScreen?.taskId) {
      Task_WirelessCommunicationScreen(runtime, i);
    }
  }
}

function CreateTask(runtime: WirelessStatusRuntime, _priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ data: Array(NUM_TASK_DATA).fill(0), destroyed: false });
  return id;
}

function CreateTask_ListenToWireless(runtime: WirelessStatusRuntime): number {
  const id = runtime.tasks.length;
  const players = Array.from({ length: NUM_TASK_DATA }, () => createRfuPlayer(ACTIVITY_NONE, [], 0));
  runtime.tasks.push({ data: Array(NUM_TASK_DATA).fill(0), destroyed: false, group: { playerList: { players } } });
  return id;
}

function SetMainCallback2(runtime: WirelessStatusRuntime, callback: string): void {
  runtime.mainCallback2 = callback;
}

function SetVBlankCallback(runtime: WirelessStatusRuntime, callback: string | null): void {
  runtime.vBlankCallback = callback;
}

function ShowBg(runtime: WirelessStatusRuntime, bg: number): void {
  runtime.shownBgs.push(bg);
}

function PlaySE(runtime: WirelessStatusRuntime, song: number): void {
  runtime.playedSE.push(song);
}

function DestroyTask(runtime: WirelessStatusRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
}

function JOY_NEW(runtime: WirelessStatusRuntime, mask: number): boolean {
  return (runtime.newKeys & mask) !== 0;
}

function GetStringWidth(_fontId: number, str: string, _letterSpacing: number): number {
  return str.length;
}

function ConvertIntToDecimalStringN(value: number, width: number): string {
  return String(value).padStart(width, ' ');
}

function record(runtime: WirelessStatusRuntime, op: string, ...args: unknown[]): void {
  runtime.calls.push({ op, args });
}
