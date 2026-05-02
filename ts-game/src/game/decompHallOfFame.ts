import hallOfFameSourceRaw from '../../../src/hall_of_fame.c?raw';
import speciesSource from '../../../include/constants/species.h?raw';
import songsSource from '../../../include/constants/songs.h?raw';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_UP } from './decompMenu';

export const PARTY_SIZE = 6;
export const HALL_OF_FAME_MAX_TEAMS = 50;
export const HALL_OF_FAME_BG_PAL = 'RGB(22,24,29)';
export const SPECIES_NONE = defineNumber(speciesSource, 'SPECIES_NONE');
export const SPECIES_EGG = defineNumber(speciesSource, 'SPECIES_EGG');
export const MUS_HALL_OF_FAME = defineNumber(songsSource, 'MUS_HALL_OF_FAME');
export const SAVE_STATUS_OK = 1;
export const SAVE_HALL_OF_FAME = 'SAVE_HALL_OF_FAME';
export const SE_SAVE = 'SE_SAVE';
export const SE_APPLAUSE = 'SE_APPLAUSE';
export const EOS = 0xff;

export type HofTaskFunc =
  | 'Task_Hof_InitMonData'
  | 'Task_Hof_InitTeamSaveData'
  | 'Task_Hof_TrySaveData'
  | 'Task_Hof_DelayAfterSave'
  | 'Task_Hof_StartDisplayingMons'
  | 'Task_Hof_DisplayMon'
  | 'Task_Hof_PlayMonCryAndPrintInfo'
  | 'Task_Hof_TryDisplayAnotherMon'
  | 'Task_Hof_PaletteFadeAndPrintWelcomeText'
  | 'Task_Hof_ApplauseAndConfetti'
  | 'Task_Hof_WaitBorderFadeAway'
  | 'Task_Hof_SpawnPlayerPic'
  | 'Task_Hof_WaitAndPrintPlayerInfo'
  | 'Task_Hof_ExitOnKeyPressed'
  | 'Task_Hof_HandlePaletteOnExit'
  | 'Task_Hof_HandleExit'
  | 'Task_HofPC_CopySaveData'
  | 'Task_HofPC_DrawSpritesPrintText'
  | 'Task_HofPC_PrintMonInfo'
  | 'Task_HofPC_HandleInput'
  | 'Task_HofPC_HandlePaletteOnExit'
  | 'Task_HofPC_HandleExit'
  | 'Task_HofPC_PrintDataIsCorrupted'
  | 'Task_HofPC_ExitOnButtonPress';

export interface HallOfFameMon {
  tid: number;
  personality: number;
  species: number;
  lvl: number;
  nick: number[];
}

export interface HallOfFameTeam {
  mon: HallOfFameMon[];
}

export interface HofTask {
  id: number;
  func: HofTaskFunc;
  data: number[];
  destroyed: boolean;
}

export interface HofSprite {
  id: number;
  kind: 'mon' | 'trainer' | 'confetti';
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  oam: { priority: number; paletteNum: number };
  callback: 'SpriteCB_GetOnScreen' | 'SpriteCB_EndGetOnScreen' | 'SpriteCB_Confetti' | 'SpriteCallbackDummy';
  destroyed: boolean;
}

export interface HallOfFameRuntime {
  gMainState: number;
  mainCallback2: string | null;
  vblankCallback: string | null;
  gPaletteFadeActive: boolean;
  pcScreenEffectOn: boolean;
  pcScreenEffectOff: boolean;
  helpSystemEnabled: boolean;
  sSelectedPaletteIndices: number;
  sHofMonPtr: HallOfFameTeam[] | null;
  sHofGfxPtr: { state: number } | null;
  tasks: HofTask[];
  sprites: HofSprite[];
  playerParty: HallOfFameMon[];
  savedTeams: HallOfFameTeam[];
  gHasHallOfFameRecords: boolean;
  loadGameSaveStatus: number;
  gameContinueCallback: string | null;
  gameStats: Record<string, number>;
  playerGender: number;
  playerName: number[];
  playerTrainerId: number[];
  playTimeHours: number;
  playTimeMinutes: number;
  newKeys: number;
  randomValues: number[];
  rngSeed: number;
  disableMapMusicChangeOnMapLoad: number;
  warpDestination: { map: string; warpId: number; x: number; y: number } | null;
  printed: string[];
  operations: string[];
}

export const sHof_BgTemplates = parseBgTemplates(hallOfFameSourceRaw);
export const sWindowTemplate = parseWindowTemplate(hallOfFameSourceRaw);
export const sTextColors = parseTextColors(hallOfFameSourceRaw);
export const sHallOfFame_MonFullTeamPositions = parsePositionTable(hallOfFameSourceRaw, 'sHallOfFame_MonFullTeamPositions');
export const sHallOfFame_MonHalfTeamPositions = parsePositionTable(hallOfFameSourceRaw, 'sHallOfFame_MonHalfTeamPositions');
export const sUnused = parseNumericArray(hallOfFameSourceRaw, 'sUnused');
export const sDummyHofMon: HallOfFameMon = { tid: 0x03ea03ea, personality: 0, species: SPECIES_NONE, lvl: 0, nick: Array.from({ length: 10 }, () => 0) };

export const createHallOfFameRuntime = (): HallOfFameRuntime => ({
  gMainState: 0,
  mainCallback2: null,
  vblankCallback: null,
  gPaletteFadeActive: false,
  pcScreenEffectOn: false,
  pcScreenEffectOff: false,
  helpSystemEnabled: true,
  sSelectedPaletteIndices: 0,
  sHofMonPtr: null,
  sHofGfxPtr: null,
  tasks: [],
  sprites: [],
  playerParty: Array.from({ length: PARTY_SIZE }, () => makeEmptyHofMon()),
  savedTeams: [],
  gHasHallOfFameRecords: false,
  loadGameSaveStatus: SAVE_STATUS_OK,
  gameContinueCallback: null,
  gameStats: { GAME_STAT_ENTERED_HOF: 0 },
  playerGender: 0,
  playerName: [],
  playerTrainerId: [0, 0],
  playTimeHours: 0,
  playTimeMinutes: 0,
  newKeys: 0,
  randomValues: [],
  rngSeed: 0x1234,
  disableMapMusicChangeOnMapLoad: 0,
  warpDestination: null,
  printed: [],
  operations: []
});

export function VBlankCB_HofIdle(runtime: HallOfFameRuntime): void {
  ['LoadOam', 'ProcessSpriteCopyRequests', 'TransferPlttBuffer'].forEach((op) => runtime.operations.push(op));
}

export function CB2_HofIdle(runtime: HallOfFameRuntime): void {
  ['RunTasks', 'RunTextPrinters', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade'].forEach((op) => runtime.operations.push(op));
}

export function InitHallOfFameScreen(runtime: HallOfFameRuntime): boolean {
  switch (runtime.gMainState) {
    case 0:
      runtime.helpSystemEnabled = false;
      SetVBlankCallback(runtime, null);
      ClearVramOamPltt_LoadHofPal(runtime);
      runtime.sHofGfxPtr = { state: 0 };
      runtime.gMainState = 1;
      break;
    case 1:
      HofInit_ResetGpuBuffersAndLoadConfettiGfx(runtime);
      runtime.gMainState += 1;
      break;
    case 2:
      runtime.operations.push('SetGpuReg:BLDCNT:BLEND');
      runtime.operations.push('SetGpuReg:BLDALPHA:BLEND(16,7)');
      runtime.operations.push('SetGpuReg:BLDY:0');
      Hof_InitBgs(runtime);
      if (runtime.sHofGfxPtr) runtime.sHofGfxPtr.state = 0;
      runtime.gMainState += 1;
      break;
    case 3:
      if (!DrawHofBackground(runtime)) {
        SetVBlankCallback(runtime, 'VBlankCB_HofIdle');
        BeginNormalPaletteFade(runtime, 'PALETTES_ALL:0:16:0:RGB_BLACK');
        runtime.gMainState += 1;
      }
      break;
    case 4:
      runtime.operations.push('UpdatePaletteFade');
      if (!runtime.gPaletteFadeActive) {
        SetMainCallback2(runtime, 'CB2_HofIdle');
        runtime.operations.push(`PlayBGM:${MUS_HALL_OF_FAME}`);
        return false;
      }
      break;
  }
  return true;
}

export function CB2_DoHallOfFameScreen(runtime: HallOfFameRuntime): void {
  if (!InitHallOfFameScreen(runtime)) {
    const taskId = CreateTask(runtime, 'Task_Hof_InitMonData', 0);
    runtime.tasks[taskId].data[0] = 0;
    runtime.sHofMonPtr = [makeEmptyTeam()];
  }
}

export function CB2_DoHallOfFameScreenDontSaveData(runtime: HallOfFameRuntime): void {
  if (!InitHallOfFameScreen(runtime)) {
    const taskId = CreateTask(runtime, 'Task_Hof_InitMonData', 0);
    runtime.tasks[taskId].data[0] = 1;
    if (!runtime.sHofMonPtr) runtime.sHofMonPtr = [makeEmptyTeam()];
  }
}

export function Task_Hof_InitMonData(runtime: HallOfFameRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!runtime.sHofMonPtr) runtime.sHofMonPtr = [makeEmptyTeam()];
  task.data[2] = 0;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const partyMon = runtime.playerParty[i] ?? makeEmptyHofMon();
    if (partyMon.species !== SPECIES_NONE) {
      runtime.sHofMonPtr[0].mon[i] = cloneMon(partyMon);
      runtime.sHofMonPtr[0].mon[i].nick = partyMon.nick.slice(0, 10);
      task.data[2] += 1;
    } else {
      runtime.sHofMonPtr[0].mon[i] = makeEmptyHofMon();
    }
  }
  runtime.sSelectedPaletteIndices = 0;
  task.data[1] = 0;
  task.data[4] = 0xff;
  for (let i = 0; i < PARTY_SIZE; i += 1) task.data[i + 5] = 0xff;
  task.func = task.data[0] ? 'Task_Hof_StartDisplayingMons' : 'Task_Hof_InitTeamSaveData';
}

export function Task_Hof_InitTeamSaveData(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.operations.push('SaveQuestLogData');
  let teams = runtime.gHasHallOfFameRecords && runtime.loadGameSaveStatus === SAVE_STATUS_OK ? runtime.savedTeams.map(cloneTeam) : [];
  let i = 0;
  for (; i < HALL_OF_FAME_MAX_TEAMS; i += 1) {
    if (!teams[i] || teams[i].mon[0].species === SPECIES_NONE) break;
  }
  if (i >= HALL_OF_FAME_MAX_TEAMS) {
    teams = teams.slice(1, HALL_OF_FAME_MAX_TEAMS);
    i = HALL_OF_FAME_MAX_TEAMS - 1;
  }
  teams[i] = cloneTeam(runtime.sHofMonPtr?.[0] ?? makeEmptyTeam());
  runtime.savedTeams = teams;
  runtime.operations.push('DrawDialogueFrame:0:0');
  runtime.printed.push('gText_SavingDontTurnOffThePower2');
  runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
  runtime.tasks[taskId].func = 'Task_Hof_TrySaveData';
}

export function Task_Hof_TrySaveData(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.gameContinueCallback = 'CB2_DoHallOfFameScreenDontSaveData';
  runtime.operations.push(`TrySavingData:${SAVE_HALL_OF_FAME}`);
  runtime.operations.push(`PlaySE:${SE_SAVE}`);
  runtime.tasks[taskId].func = 'Task_Hof_DelayAfterSave';
  runtime.tasks[taskId].data[3] = 32;
}

export function Task_Hof_DelayAfterSave(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[3] !== 0) data[3] -= 1;
  else runtime.tasks[taskId].func = 'Task_Hof_StartDisplayingMons';
}

export function Task_Hof_StartDisplayingMons(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.tasks[taskId].func = 'Task_Hof_DisplayMon';
}

export function Task_Hof_DisplayMon(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const currMonId = data[1];
  const currMon = runtime.sHofMonPtr?.[0].mon[currMonId] ?? makeEmptyHofMon();
  const pos = data[2] > 3 ? sHallOfFame_MonFullTeamPositions[currMonId] : sHallOfFame_MonHalfTeamPositions[currMonId];
  const spriteId = CreateMonPicSprite_HandleDeoxys(runtime, currMon, pos[0], pos[1], currMonId);
  const sprite = runtime.sprites[spriteId];
  sprite.data[1] = pos[2];
  sprite.data[2] = pos[3];
  sprite.data[0] = 0;
  sprite.callback = 'SpriteCB_GetOnScreen';
  data[5 + currMonId] = spriteId;
  runtime.operations.push('ClearDialogWindowAndFrame:0:true');
  runtime.tasks[taskId].func = 'Task_Hof_PlayMonCryAndPrintInfo';
}

export function Task_Hof_PlayMonCryAndPrintInfo(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const currMonId = data[1];
  const currMon = runtime.sHofMonPtr?.[0].mon[currMonId] ?? makeEmptyHofMon();
  if (runtime.sprites[data[5 + currMonId]]?.data[0]) {
    if (currMon.species !== SPECIES_EGG) runtime.operations.push(`PlayCry_Normal:${currMon.species}:0`);
    HallOfFame_PrintMonInfo(runtime, currMon, 0, 14);
    data[3] = 120;
    runtime.tasks[taskId].func = 'Task_Hof_TryDisplayAnotherMon';
  }
}

export function Task_Hof_TryDisplayAnotherMon(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const currPokeId = data[1];
  const team = runtime.sHofMonPtr?.[0] ?? makeEmptyTeam();
  if (data[3] !== 0) data[3] -= 1;
  else {
    runtime.sSelectedPaletteIndices |= 0x10000 << (runtime.sprites[data[5 + currPokeId]]?.oam.paletteNum ?? 0);
    if (data[1] < PARTY_SIZE - 1 && team.mon[currPokeId + 1].species !== SPECIES_NONE) {
      data[1] += 1;
      BeginNormalPaletteFade(runtime, `${runtime.sSelectedPaletteIndices}:0:12:12:${HALL_OF_FAME_BG_PAL}`);
      runtime.sprites[data[5 + currPokeId]].oam.priority = 1;
      runtime.tasks[taskId].func = 'Task_Hof_DisplayMon';
    } else {
      runtime.tasks[taskId].func = 'Task_Hof_PaletteFadeAndPrintWelcomeText';
    }
  }
}

export function Task_Hof_PaletteFadeAndPrintWelcomeText(runtime: HallOfFameRuntime, taskId: number): void {
  BeginNormalPaletteFade(runtime, 'PALETTES_OBJECTS:0:0:0:RGB_BLACK');
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const spriteId = runtime.tasks[taskId].data[5 + i];
    if (spriteId !== 0xff) runtime.sprites[spriteId].oam.priority = 0;
  }
  HallOfFame_PrintWelcomeText(runtime, 0, 15);
  runtime.operations.push(`PlaySE:${SE_APPLAUSE}`);
  runtime.tasks[taskId].data[3] = 400;
  runtime.tasks[taskId].func = 'Task_Hof_ApplauseAndConfetti';
}

export function Task_Hof_ApplauseAndConfetti(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[3] !== 0) {
    data[3] -= 1;
    if ((data[3] & 3) === 0 && data[3] > 110) Hof_SpawnConfetti(runtime);
  } else {
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      const spriteId = data[5 + i];
      if (spriteId !== 0xff) runtime.sprites[spriteId].oam.priority = 1;
    }
    BeginNormalPaletteFade(runtime, `${runtime.sSelectedPaletteIndices}:0:12:12:${HALL_OF_FAME_BG_PAL}`);
    runtime.operations.push('FillWindowPixelBuffer:0:0');
    runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
    data[3] = 7;
    runtime.tasks[taskId].func = 'Task_Hof_WaitBorderFadeAway';
  }
}

export function Task_Hof_WaitBorderFadeAway(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[3] > 15) runtime.tasks[taskId].func = 'Task_Hof_SpawnPlayerPic';
  else {
    data[3] += 1;
    runtime.operations.push(`SetGpuReg:BLDALPHA:${256 * data[3]}`);
  }
}

export function Task_Hof_SpawnPlayerPic(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.operations.push('SetGpuReg:DISPCNT:HOF_PLAYER');
  ['ShowBg:0', 'ShowBg:1', 'ShowBg:3'].forEach((op) => runtime.operations.push(op));
  runtime.tasks[taskId].data[4] = CreateTrainerPicSprite(runtime, 0x78, 0x48);
  runtime.operations.push('AddWindow:sWindowTemplate');
  runtime.operations.push('LoadStdWindowGfx:1:0x21D:BG_PLTT_ID(13)');
  runtime.tasks[taskId].data[3] = 120;
  runtime.tasks[taskId].func = 'Task_Hof_WaitAndPrintPlayerInfo';
}

export function Task_Hof_WaitAndPrintPlayerInfo(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (data[3] !== 0) data[3] -= 1;
  else if (runtime.sprites[data[4]].x !== 192) runtime.sprites[data[4]].x += 1;
  else {
    runtime.operations.push('FillBgTilemapBufferRect_Palette0:0');
    HallOfFame_PrintPlayerInfo(runtime, 1, 2);
    runtime.operations.push('DrawDialogueFrame:0:0');
    runtime.printed.push('gText_LeagueChamp');
    runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
    runtime.tasks[taskId].func = 'Task_Hof_ExitOnKeyPressed';
  }
}

export function Task_Hof_ExitOnKeyPressed(runtime: HallOfFameRuntime, taskId: number): void {
  if (runtime.newKeys & A_BUTTON) {
    runtime.operations.push('FadeOutBGM:4');
    runtime.tasks[taskId].func = 'Task_Hof_HandlePaletteOnExit';
  }
}

export function Task_Hof_HandlePaletteOnExit(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.operations.push('CpuCopy16:gPlttBufferFaded:gPlttBufferUnfaded:PLTT_SIZE');
  BeginNormalPaletteFade(runtime, 'PALETTES_ALL:8:0:16:RGB_BLACK');
  runtime.tasks[taskId].func = 'Task_Hof_HandleExit';
}

export function Task_Hof_HandleExit(runtime: HallOfFameRuntime, taskId: number): void {
  if (!runtime.gPaletteFadeActive) {
    for (let i = 0; i < PARTY_SIZE; i += 1) {
      const spriteId = runtime.tasks[taskId].data[5 + i];
      if (spriteId !== 0xff) FreeAndDestroyMonPicSprite(runtime, spriteId);
    }
    FreeAndDestroyTrainerPicSprite(runtime, runtime.tasks[taskId].data[4]);
    ['HideBg:0', 'HideBg:1', 'HideBg:3', 'FreeAllWindowBuffers', 'UnsetBgTilemapBuffer:1', 'UnsetBgTilemapBuffer:3', 'ResetBgsAndClearDma3BusyFlags:0'].forEach((op) => runtime.operations.push(op));
    DestroyTask(runtime, taskId);
    runtime.sHofGfxPtr = null;
    runtime.sHofMonPtr = null;
    SetWarpsToRollCredits(runtime);
  }
}

export function SetWarpsToRollCredits(runtime: HallOfFameRuntime): void {
  runtime.operations.push('VarSet:VAR_MAP_SCENE_INDIGO_PLATEAU_EXTERIOR:1');
  runtime.operations.push('FlagSet:FLAG_DONT_SHOW_MAP_NAME_POPUP');
  runtime.disableMapMusicChangeOnMapLoad = 2;
  runtime.warpDestination = { map: 'MAP_INDIGO_PLATEAU_EXTERIOR', warpId: -1, x: 11, y: 6 };
  runtime.operations.push('DoWarp');
  runtime.operations.push('ResetInitialPlayerAvatarState');
}

export function CB2_InitHofPC(runtime: HallOfFameRuntime): void {
  switch (runtime.gMainState) {
    default:
    case 0:
      SetVBlankCallback(runtime, null);
      ClearVramOamPltt_LoadHofPal(runtime);
      runtime.sHofGfxPtr = { state: 0 };
      runtime.gMainState = 1;
      break;
    case 1:
      HofInit_ResetGpuBuffersAndLoadConfettiGfx(runtime);
      runtime.gMainState += 1;
      break;
    case 2:
      runtime.operations.push('SetGpuReg:BLDCNT:0');
      runtime.operations.push('SetGpuReg:BLDALPHA:0');
      runtime.operations.push('SetGpuReg:BLDY:0');
      Hof_InitBgs(runtime);
      runtime.gMainState += 1;
      break;
    case 3:
      if (!DrawHofBackground(runtime)) {
        runtime.pcScreenEffectOn = true;
        runtime.operations.push('BeginPCScreenEffect_TurnOn:0:0:0');
        SetVBlankCallback(runtime, 'VBlankCB_HofIdle');
        runtime.gMainState += 1;
      }
      break;
    case 4:
      ['RunTasks', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade'].forEach((op) => runtime.operations.push(op));
      if (!runtime.pcScreenEffectOn) runtime.gMainState += 1;
      break;
    case 5:
      runtime.operations.push('SetGpuReg:BLDCNT:BLEND');
      runtime.operations.push('SetGpuReg:BLDALPHA:BLEND(16,7)');
      runtime.operations.push('SetGpuReg:BLDY:0');
      CreateTask(runtime, 'Task_HofPC_CopySaveData', 0);
      runtime.sHofMonPtr = Array.from({ length: HALL_OF_FAME_MAX_TEAMS }, () => makeEmptyTeam());
      SetMainCallback2(runtime, 'CB2_HofIdle');
      break;
  }
}

export function Task_HofPC_CopySaveData(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.operations.push('CreateTopBarWindowLoadPalette:0:30:0:0x0C:0x226');
  if (runtime.loadGameSaveStatus !== SAVE_STATUS_OK) runtime.tasks[taskId].func = 'Task_HofPC_PrintDataIsCorrupted';
  else {
    runtime.sHofMonPtr = runtime.savedTeams.map(cloneTeam);
    let i = 0;
    for (; i < HALL_OF_FAME_MAX_TEAMS; i += 1) {
      if (!runtime.sHofMonPtr[i] || runtime.sHofMonPtr[i].mon[0].species === SPECIES_NONE) break;
    }
    runtime.tasks[taskId].data[0] = i < HALL_OF_FAME_MAX_TEAMS ? i - 1 : HALL_OF_FAME_MAX_TEAMS - 1;
    runtime.tasks[taskId].data[1] = runtime.gameStats.GAME_STAT_ENTERED_HOF ?? 0;
    runtime.tasks[taskId].func = 'Task_HofPC_DrawSpritesPrintText';
  }
}

export function Task_HofPC_DrawSpritesPrintText(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const team = runtime.sHofMonPtr?.[data[0]] ?? makeEmptyTeam();
  runtime.sSelectedPaletteIndices = 0;
  data[2] = 0;
  data[4] = team.mon.filter((mon) => mon.species !== SPECIES_NONE).length;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const currMon = team.mon[i];
    if (currMon.species !== SPECIES_NONE) {
      const pos = data[4] > 3 ? sHallOfFame_MonFullTeamPositions[i] : sHallOfFame_MonHalfTeamPositions[i];
      const spriteId = CreateMonPicSprite_HandleDeoxys(runtime, currMon, pos[2], pos[3], i);
      runtime.sprites[spriteId].oam.priority = 1;
      data[5 + i] = spriteId;
    } else data[5 + i] = 0xff;
  }
  runtime.operations.push(`BlendPalettes:0xFFFF0000:0xC:${HALL_OF_FAME_BG_PAL}`);
  runtime.printed.push(`gText_HOFNumber:${data[1]}`);
  runtime.printed.push(data[0] <= 0 ? 'gText_UPDOWNPick_ABUTTONBBUTTONCancel' : 'gText_UPDOWNPick_ABUTTONNext_BBUTTONBack');
  runtime.tasks[taskId].func = 'Task_HofPC_PrintMonInfo';
}

export function Task_HofPC_PrintMonInfo(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  const team = runtime.sHofMonPtr?.[data[0]] ?? makeEmptyTeam();
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const spriteId = data[5 + i];
    if (spriteId !== 0xff) runtime.sprites[spriteId].oam.priority = 1;
  }
  const currMonSpriteId = data[5 + data[2]];
  runtime.sprites[currMonSpriteId].oam.priority = 0;
  runtime.sSelectedPaletteIndices = (0x10000 << runtime.sprites[currMonSpriteId].oam.paletteNum) ^ 0xffff0000;
  runtime.operations.push(`BlendPalettesUnfaded:${runtime.sSelectedPaletteIndices}:0xC:${HALL_OF_FAME_BG_PAL}`);
  const currMon = team.mon[data[2]];
  if (currMon.species !== SPECIES_EGG) {
    runtime.operations.push('StopCryAndClearCrySongs');
    runtime.operations.push(`PlayCry_Normal:${currMon.species}:0`);
  }
  HallOfFame_PrintMonInfo(runtime, currMon, 0, 14);
  runtime.tasks[taskId].func = 'Task_HofPC_HandleInput';
}

export function Task_HofPC_HandleInput(runtime: HallOfFameRuntime, taskId: number): void {
  const data = runtime.tasks[taskId].data;
  if (runtime.newKeys & A_BUTTON) {
    if (data[0] !== 0) {
      data[0] -= 1;
      for (let i = 0; i < PARTY_SIZE; i += 1) {
        const spriteId = data[5 + i];
        if (spriteId !== 0xff) FreeAndDestroyMonPicSprite(runtime, spriteId);
      }
      if (data[1] !== 0) data[1] -= 1;
      runtime.tasks[taskId].func = 'Task_HofPC_DrawSpritesPrintText';
    } else {
      runtime.tasks[taskId].func = 'Task_HofPC_HandlePaletteOnExit';
    }
  } else if (runtime.newKeys & B_BUTTON) runtime.tasks[taskId].func = 'Task_HofPC_HandlePaletteOnExit';
  else if ((runtime.newKeys & DPAD_UP) && data[2] !== 0) {
    data[2] -= 1;
    runtime.tasks[taskId].func = 'Task_HofPC_PrintMonInfo';
  } else if ((runtime.newKeys & DPAD_DOWN) && data[2] < data[4] - 1) {
    data[2] += 1;
    runtime.tasks[taskId].func = 'Task_HofPC_PrintMonInfo';
  }
}

export function Task_HofPC_HandlePaletteOnExit(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.operations.push('CpuCopy16:gPlttBufferFaded:gPlttBufferUnfaded:PLTT_SIZE');
  runtime.pcScreenEffectOff = true;
  runtime.operations.push('BeginPCScreenEffect_TurnOff:0:0:0');
  runtime.tasks[taskId].func = 'Task_HofPC_HandleExit';
}

export function Task_HofPC_HandleExit(runtime: HallOfFameRuntime, taskId: number): void {
  if (!runtime.pcScreenEffectOff) {
    ['HideBg:0', 'HideBg:1', 'HideBg:3', 'DestroyTopBarWindow', 'FreeAllWindowBuffers', 'UnsetBgTilemapBuffer:1', 'UnsetBgTilemapBuffer:3', 'ResetBgsAndClearDma3BusyFlags:false'].forEach((op) => runtime.operations.push(op));
    DestroyTask(runtime, taskId);
    runtime.sHofGfxPtr = null;
    runtime.sHofMonPtr = null;
    runtime.operations.push('ReturnFromHallOfFamePC');
  }
}

export function Task_HofPC_PrintDataIsCorrupted(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.printed.push('gText_ABUTTONExit');
  runtime.printed.push('gText_HOFCorrupted');
  runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
  runtime.tasks[taskId].func = 'Task_HofPC_ExitOnButtonPress';
}

export function Task_HofPC_ExitOnButtonPress(runtime: HallOfFameRuntime, taskId: number): void {
  if (runtime.newKeys & A_BUTTON) runtime.tasks[taskId].func = 'Task_HofPC_HandlePaletteOnExit';
}

export function HallOfFame_PrintWelcomeText(runtime: HallOfFameRuntime, _a0: number, _a1: number): void {
  runtime.operations.push('FillWindowPixelBuffer:0:0');
  runtime.operations.push('PutWindowTilemap:0');
  runtime.printed.push('gText_WelcomeToHOF');
  runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
}

export function HallOfFame_PrintMonInfo(runtime: HallOfFameRuntime, currMon: HallOfFameMon, _a1: number, _a2: number): void {
  runtime.operations.push('FillWindowPixelBuffer:0:0');
  runtime.operations.push('PutWindowTilemap:0');
  if (currMon.species !== SPECIES_EGG) runtime.printed.push(`dex:${currMon.species}`);
  runtime.printed.push(`mon:${currMon.species}:${currMon.lvl}:${currMon.tid}:${currMon.nick.join(',')}`);
  runtime.operations.push('CopyWindowToVram:0:COPYWIN_FULL');
}

export function HallOfFame_PrintPlayerInfo(runtime: HallOfFameRuntime, _unused1: number, _unused2: number): void {
  const trainerId = (runtime.playerTrainerId[0] ?? 0) | ((runtime.playerTrainerId[1] ?? 0) << 8);
  runtime.printed.push(`player:${runtime.playerName.join(',')}:${trainerId}:${runtime.playTimeHours}:${runtime.playTimeMinutes}`);
  runtime.operations.push('CopyWindowToVram:1:COPYWIN_FULL');
}

export function ClearVramOamPltt_LoadHofPal(runtime: HallOfFameRuntime): void {
  ['DmaFill16:VRAM', 'DmaFill32:OAM', 'DmaFill16:PLTT', 'ResetPaletteFade', 'LoadPalette:sHallOfFame_Pal'].forEach((op) => runtime.operations.push(op));
}

export function HofInit_ResetGpuBuffersAndLoadConfettiGfx(runtime: HallOfFameRuntime): void {
  ['ScanlineEffect_Stop', 'ResetTasks', 'ResetSpriteData', 'ResetTempTileDataBuffers', 'ResetAllPicSprites', 'FreeAllSpritePalettes', 'LoadCompressedSpriteSheet:confetti', 'LoadCompressedSpritePalette:confetti'].forEach((op) => runtime.operations.push(op));
}

export function Hof_InitBgs(runtime: HallOfFameRuntime): void {
  runtime.operations.push(`InitBgsFromTemplates:0:sHof_BgTemplates:${sHof_BgTemplates.length}`);
  ['SetBgTilemapBuffer:1', 'SetBgTilemapBuffer:3', 'ChangeBgX:0:0', 'ChangeBgY:0:0', 'ChangeBgX:1:0', 'ChangeBgY:1:0', 'ChangeBgX:3:0', 'ChangeBgY:3:0'].forEach((op) => runtime.operations.push(op));
}

export function DrawHofBackground(runtime: HallOfFameRuntime): boolean {
  const gfx = runtime.sHofGfxPtr;
  if (!gfx) return false;
  switch (gfx.state) {
    case 0:
      runtime.operations.push('DecompressAndCopyTileDataToVram:1:sHallOfFame_Gfx');
      break;
    case 1:
      if (runtime.operations.includes('FreeTempTileDataBuffersIfPossible:true')) return true;
      break;
    case 2:
      runtime.operations.push('FillBgTilemapBufferRect_Palette0:HOF');
      runtime.operations.push('CopyBgTilemapBufferToVram:1');
      runtime.operations.push('CopyBgTilemapBufferToVram:3');
      break;
    case 3:
      runtime.operations.push('InitStandardTextBoxWindows');
      runtime.operations.push('InitTextBoxGfxAndPrinters');
      break;
    case 4:
      runtime.operations.push('SetGpuReg:DISPCNT:HOF');
      ['ShowBg:0', 'ShowBg:1', 'ShowBg:3'].forEach((op) => runtime.operations.push(op));
      gfx.state = 0;
      return false;
  }
  gfx.state += 1;
  return true;
}

export function SpriteCB_GetOnScreen(runtime: HallOfFameRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  if (sprite.x !== sprite.data[1] || sprite.y !== sprite.data[2]) {
    if (sprite.x < sprite.data[1]) sprite.x += 15;
    if (sprite.x > sprite.data[1]) sprite.x -= 15;
    if (sprite.y < sprite.data[2]) sprite.y += 10;
    if (sprite.y > sprite.data[2]) sprite.y -= 10;
  } else {
    sprite.data[0] = 1;
    sprite.callback = 'SpriteCB_EndGetOnScreen';
  }
}

export function SpriteCB_EndGetOnScreen(runtime: HallOfFameRuntime, spriteId: number): void {
  void runtime;
  void spriteId;
}

export function SpriteCB_Confetti(runtime: HallOfFameRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  if (sprite.y2 > 120) DestroySprite(runtime, spriteId);
  else {
    sprite.y2 += 1;
    sprite.y2 += sprite.data[1];
    const tableId = sprite.data[0];
    const rand = (Random(runtime) % 4) + 8;
    sprite.x2 = Math.trunc((rand * sineValue(tableId)) / 256);
    sprite.data[0] += 4;
  }
}

export function Hof_SpawnConfetti(runtime: HallOfFameRuntime): boolean {
  const posX = Random(runtime) % 240;
  const posY = -(Random(runtime) % 8);
  const spriteId = CreateSprite(runtime, 'confetti', posX, posY);
  runtime.operations.push(`StartSpriteAnim:${spriteId}:${Random(runtime) % 17}`);
  runtime.sprites[spriteId].data[1] = Random(runtime) & 3 ? 0 : 1;
  runtime.sprites[spriteId].callback = 'SpriteCB_Confetti';
  return false;
}

export function tickHallOfFameTask(runtime: HallOfFameRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) return;
  const fn = task.func;
  const table: Record<HofTaskFunc, (runtime: HallOfFameRuntime, taskId: number) => void> = {
    Task_Hof_InitMonData, Task_Hof_InitTeamSaveData, Task_Hof_TrySaveData, Task_Hof_DelayAfterSave, Task_Hof_StartDisplayingMons, Task_Hof_DisplayMon,
    Task_Hof_PlayMonCryAndPrintInfo, Task_Hof_TryDisplayAnotherMon, Task_Hof_PaletteFadeAndPrintWelcomeText, Task_Hof_ApplauseAndConfetti,
    Task_Hof_WaitBorderFadeAway, Task_Hof_SpawnPlayerPic, Task_Hof_WaitAndPrintPlayerInfo, Task_Hof_ExitOnKeyPressed, Task_Hof_HandlePaletteOnExit,
    Task_Hof_HandleExit, Task_HofPC_CopySaveData, Task_HofPC_DrawSpritesPrintText, Task_HofPC_PrintMonInfo, Task_HofPC_HandleInput,
    Task_HofPC_HandlePaletteOnExit, Task_HofPC_HandleExit, Task_HofPC_PrintDataIsCorrupted, Task_HofPC_ExitOnButtonPress
  };
  table[fn](runtime, taskId);
}

export function tickHallOfFameSprite(runtime: HallOfFameRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  if (!sprite || sprite.destroyed) return;
  if (sprite.callback === 'SpriteCB_GetOnScreen') SpriteCB_GetOnScreen(runtime, spriteId);
  else if (sprite.callback === 'SpriteCB_EndGetOnScreen') SpriteCB_EndGetOnScreen(runtime, spriteId);
  else if (sprite.callback === 'SpriteCB_Confetti') SpriteCB_Confetti(runtime, spriteId);
}

function CreateTask(runtime: HallOfFameRuntime, func: HofTaskFunc, priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  runtime.operations.push(`CreateTask:${id}:${func}:${priority}`);
  return id;
}

function DestroyTask(runtime: HallOfFameRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
  runtime.operations.push(`DestroyTask:${taskId}`);
}

function SetVBlankCallback(runtime: HallOfFameRuntime, callback: string | null): void {
  runtime.vblankCallback = callback;
  runtime.operations.push(`SetVBlankCallback:${callback ?? 'NULL'}`);
}

function SetMainCallback2(runtime: HallOfFameRuntime, callback: string): void {
  runtime.mainCallback2 = callback;
  runtime.operations.push(`SetMainCallback2:${callback}`);
}

function BeginNormalPaletteFade(runtime: HallOfFameRuntime, args: string): void {
  runtime.gPaletteFadeActive = true;
  runtime.operations.push(`BeginNormalPaletteFade:${args}`);
}

function CreateMonPicSprite_HandleDeoxys(runtime: HallOfFameRuntime, mon: HallOfFameMon, x: number, y: number, index: number): number {
  const id = CreateSprite(runtime, 'mon', x, y);
  runtime.sprites[id].oam.paletteNum = index;
  runtime.operations.push(`CreateMonPicSprite_HandleDeoxys:${mon.species}:${mon.tid}:${mon.personality}:1:${x}:${y}:${index}:0xFFFF`);
  return id;
}

function CreateTrainerPicSprite(runtime: HallOfFameRuntime, x: number, y: number): number {
  const id = CreateSprite(runtime, 'trainer', x, y);
  runtime.operations.push(`CreateTrainerPicSprite:${runtime.playerGender}:true:${x}:${y}:6:0xFFFF`);
  return id;
}

function CreateSprite(runtime: HallOfFameRuntime, kind: HofSprite['kind'], x: number, y: number): number {
  const id = runtime.sprites.length;
  runtime.sprites.push({ id, kind, x, y, x2: 0, y2: 0, data: Array.from({ length: 8 }, () => 0), oam: { priority: 0, paletteNum: id % 16 }, callback: 'SpriteCallbackDummy', destroyed: false });
  runtime.operations.push(`CreateSprite:${id}:${kind}:${x}:${y}:0`);
  return id;
}

function DestroySprite(runtime: HallOfFameRuntime, spriteId: number): void {
  runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`DestroySprite:${spriteId}`);
}

function FreeAndDestroyMonPicSprite(runtime: HallOfFameRuntime, spriteId: number): void {
  runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`FreeAndDestroyMonPicSprite:${spriteId}`);
}

function FreeAndDestroyTrainerPicSprite(runtime: HallOfFameRuntime, spriteId: number): void {
  if (runtime.sprites[spriteId]) runtime.sprites[spriteId].destroyed = true;
  runtime.operations.push(`FreeAndDestroyTrainerPicSprite:${spriteId}`);
}

function Random(runtime: HallOfFameRuntime): number {
  if (runtime.randomValues.length > 0) return runtime.randomValues.shift() ?? 0;
  runtime.rngSeed = (Math.imul(runtime.rngSeed, 1103515245) + 24691) >>> 0;
  return runtime.rngSeed >>> 16;
}

function sineValue(index: number): number {
  return Math.round(Math.sin((index & 0xff) * Math.PI / 128) * 256);
}

function makeEmptyHofMon(): HallOfFameMon {
  return { tid: 0, personality: 0, species: SPECIES_NONE, lvl: 0, nick: [EOS] };
}

function makeEmptyTeam(): HallOfFameTeam {
  return { mon: Array.from({ length: PARTY_SIZE }, () => makeEmptyHofMon()) };
}

function cloneMon(mon: HallOfFameMon): HallOfFameMon {
  return { tid: mon.tid, personality: mon.personality, species: mon.species, lvl: mon.lvl, nick: mon.nick.slice() };
}

function cloneTeam(team: HallOfFameTeam): HallOfFameTeam {
  return { mon: team.mon.map(cloneMon) };
}

function parseBgTemplates(source: string) {
  const body = source.match(/static const struct BgTemplate sHof_BgTemplates\[\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\.bg = (\d+),\s*\.charBaseIndex = (\d+),\s*\.mapBaseIndex = (\d+),\s*\.screenSize = (\d+),\s*\.paletteMode = (\d+),\s*\.priority = (\d+),\s*\.baseTile = (0x[0-9A-Fa-f]+|\d+)/gu)]
    .map(([, bg, charBaseIndex, mapBaseIndex, screenSize, paletteMode, priority, baseTile]) => ({ bg: Number(bg), charBaseIndex: Number(charBaseIndex), mapBaseIndex: Number(mapBaseIndex), screenSize: Number(screenSize), paletteMode: Number(paletteMode), priority: Number(priority), baseTile: Number.parseInt(baseTile, 0) }));
}

function parseWindowTemplate(source: string) {
  const body = source.match(/static const struct WindowTemplate sWindowTemplate = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  const field = (name: string) => Number.parseInt(body.match(new RegExp(`\\.${name}\\s*=\\s*(0x[0-9A-Fa-f]+|\\d+)`, 'u'))?.[1] ?? '0', 0);
  return { bg: field('bg'), tilemapLeft: field('tilemapLeft'), tilemapTop: field('tilemapTop'), width: field('width'), height: field('height'), paletteNum: field('paletteNum'), baseBlock: field('baseBlock') };
}

function parseTextColors(source: string): number[][] {
  const body = source.match(/static const u8 sTextColors\[\]\[4\] = \{([\s\S]*?)\n\};/u)?.[1] ?? '';
  return [...body.matchAll(/\{\s*([0-9,\s]+)\s*\}/gu)].map(([, nums]) => nums.split(',').map((n) => Number.parseInt(n.trim(), 10)).filter((n) => Number.isFinite(n)));
}

function parsePositionTable(source: string, symbol: string): number[][] {
  const body = source.match(new RegExp(`static const s16 ${symbol}\\[\\d+\\]\\[4\\] =\\s*\\{([\\s\\S]*?)\\n\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/\{\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+)\}/gu)].map((match) => match.slice(1).map(Number));
}

function parseNumericArray(source: string, symbol: string): number[] {
  const body = source.match(new RegExp(`static const u8 ${symbol}\\[\\] = \\{([\\s\\S]*?)\\};`, 'u'))?.[1] ?? '';
  return [...body.matchAll(/\d+/gu)].map(([value]) => Number.parseInt(value, 10));
}

function defineNumber(source: string, name: string): number {
  return Number.parseInt(source.match(new RegExp(`#define\\s+${name}\\s+(0x[0-9A-Fa-f]+|\\d+)`, 'u'))?.[1] ?? '0', 0);
}
