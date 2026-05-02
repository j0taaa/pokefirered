import { describe, expect, test } from 'vitest';
import { A_BUTTON, B_BUTTON, DPAD_DOWN, DPAD_UP } from '../src/game/decompMenu';
import {
  CB2_DoHallOfFameScreen,
  CB2_DoHallOfFameScreenDontSaveData,
  CB2_HofIdle,
  CB2_InitHofPC,
  DrawHofBackground,
  EOS,
  HALL_OF_FAME_MAX_TEAMS,
  InitHallOfFameScreen,
  MUS_HALL_OF_FAME,
  PARTY_SIZE,
  SAVE_STATUS_OK,
  SE_APPLAUSE,
  SE_SAVE,
  SPECIES_NONE,
  SpriteCB_EndGetOnScreen,
  SpriteCB_Confetti,
  SpriteCB_GetOnScreen,
  Task_HofPC_CopySaveData,
  Task_HofPC_DrawSpritesPrintText,
  Task_HofPC_ExitOnButtonPress,
  Task_HofPC_HandleExit,
  Task_HofPC_HandleInput,
  Task_HofPC_HandlePaletteOnExit,
  Task_HofPC_PrintDataIsCorrupted,
  Task_HofPC_PrintMonInfo,
  Task_Hof_ApplauseAndConfetti,
  Task_Hof_DelayAfterSave,
  Task_Hof_DisplayMon,
  Task_Hof_ExitOnKeyPressed,
  Task_Hof_HandleExit,
  Task_Hof_HandlePaletteOnExit,
  Task_Hof_InitMonData,
  Task_Hof_InitTeamSaveData,
  Task_Hof_PaletteFadeAndPrintWelcomeText,
  Task_Hof_PlayMonCryAndPrintInfo,
  Task_Hof_SpawnPlayerPic,
  Task_Hof_StartDisplayingMons,
  Task_Hof_TryDisplayAnotherMon,
  Task_Hof_TrySaveData,
  Task_Hof_WaitAndPrintPlayerInfo,
  Task_Hof_WaitBorderFadeAway,
  VBlankCB_HofIdle,
  createHallOfFameRuntime,
  sDummyHofMon,
  sHallOfFame_MonFullTeamPositions,
  sHallOfFame_MonHalfTeamPositions,
  sHof_BgTemplates,
  sTextColors,
  sUnused,
  sWindowTemplate,
  tickHallOfFameSprite,
  tickHallOfFameTask,
  type HallOfFameMon,
  type HallOfFameRuntime,
  type HallOfFameTeam,
  type HofTaskFunc
} from '../src/game/decompHallOfFame';

describe('decomp hall of fame', () => {
  test('parses static layout data from hall_of_fame.c', () => {
    expect(sHof_BgTemplates).toEqual([
      { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
      { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
      { bg: 3, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 }
    ]);
    expect(sWindowTemplate).toEqual({ bg: 0, tilemapLeft: 2, tilemapTop: 2, width: 17, height: 6, paletteNum: 13, baseBlock: 0x001 });
    expect(sTextColors).toEqual([[0, 1, 2], [0, 2, 3], [4, 5, 0]]);
    expect(sHallOfFame_MonFullTeamPositions[0]).toEqual([120, 210, 120, 40]);
    expect(sHallOfFame_MonFullTeamPositions[5]).toEqual([310, -92, 40, 88]);
    expect(sHallOfFame_MonHalfTeamPositions[1]).toEqual([326, 244, 56, 64]);
    expect(sUnused).toEqual([2, 1, 3, 6, 4, 5]);
    expect(sDummyHofMon).toMatchObject({ tid: 0x03ea03ea, species: SPECIES_NONE, lvl: 0 });
  });

  test('initializes HOF screen and creates the correct save/no-save task', () => {
    const runtime = createHallOfFameRuntime();
    for (let i = 0; i < 9; i += 1) {
      runtime.gPaletteFadeActive = false;
      InitHallOfFameScreen(runtime);
    }
    expect(runtime.mainCallback2).toBe('CB2_HofIdle');
    expect(runtime.vblankCallback).toBe('VBlankCB_HofIdle');
    expect(runtime.operations).toContain(`PlayBGM:${MUS_HALL_OF_FAME}`);

    const save = createHallOfFameRuntime();
    save.gMainState = 4;
    CB2_DoHallOfFameScreen(save);
    expect(save.tasks[0]).toMatchObject({ func: 'Task_Hof_InitMonData' });
    expect(save.tasks[0].data[0]).toBe(0);
    expect(save.sHofMonPtr).not.toBeNull();

    const noSave = createHallOfFameRuntime();
    noSave.gMainState = 4;
    CB2_DoHallOfFameScreenDontSaveData(noSave);
    expect(noSave.tasks[0].data[0]).toBe(1);
  });

  test('SpriteCB_EndGetOnScreen is the exact no-op landing callback', () => {
    const runtime = createHallOfFameRuntime();
    runtime.sprites.push({
      id: 0,
      kind: 'mon',
      x: 12,
      y: 34,
      x2: 1,
      y2: 2,
      data: [1, 2, 3, 4, 5, 6, 7, 8],
      oam: { priority: 1, paletteNum: 2 },
      callback: 'SpriteCB_EndGetOnScreen',
      destroyed: false
    });
    const before = JSON.stringify(runtime.sprites[0]);
    SpriteCB_EndGetOnScreen(runtime, 0);
    tickHallOfFameSprite(runtime, 0);
    expect(JSON.stringify(runtime.sprites[0])).toBe(before);
  });

  test('copies player party mons and rolls HOF save teams like C', () => {
    const runtime = createHallOfFameRuntime();
    runtime.playerParty = [mon(10, 30, 111, 222, [1, 2, EOS]), mon(20, 40), emptyMon(), emptyMon(), emptyMon(), emptyMon()];
    const taskId = pushTask(runtime, 'Task_Hof_InitMonData');
    runtime.sHofMonPtr = [emptyTeam()];
    Task_Hof_InitMonData(runtime, taskId);
    expect(runtime.tasks[taskId].data[2]).toBe(2);
    expect(runtime.sHofMonPtr[0].mon[0]).toMatchObject({ species: 10, lvl: 30, tid: 111, personality: 222 });
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_InitTeamSaveData');

    runtime.savedTeams = Array.from({ length: HALL_OF_FAME_MAX_TEAMS }, (_, i) => teamWithSpecies(100 + i));
    runtime.gHasHallOfFameRecords = true;
    runtime.loadGameSaveStatus = SAVE_STATUS_OK;
    Task_Hof_InitTeamSaveData(runtime, taskId);
    expect(runtime.savedTeams).toHaveLength(HALL_OF_FAME_MAX_TEAMS);
    expect(runtime.savedTeams[0].mon[0].species).toBe(101);
    expect(runtime.savedTeams[49].mon[0].species).toBe(10);
    expect(runtime.printed).toContain('gText_SavingDontTurnOffThePower2');

    Task_Hof_TrySaveData(runtime, taskId);
    expect(runtime.gameContinueCallback).toBe('CB2_DoHallOfFameScreenDontSaveData');
    expect(runtime.operations).toContain(`PlaySE:${SE_SAVE}`);
    expect(runtime.tasks[taskId].data[3]).toBe(32);
    runtime.tasks[taskId].data[3] = 0;
    Task_Hof_DelayAfterSave(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_StartDisplayingMons');
    Task_Hof_StartDisplayingMons(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_DisplayMon');
  });

  test('displays mons, waits, fades prior palettes, and prints welcome/applause', () => {
    const runtime = createHallOfFameRuntime();
    runtime.sHofMonPtr = [{ mon: [mon(10), mon(11), mon(12), mon(13), emptyMon(), emptyMon()] }];
    const taskId = pushTask(runtime, 'Task_Hof_DisplayMon');
    runtime.tasks[taskId].data[2] = 4;
    for (let i = 5; i < 11; i += 1) runtime.tasks[taskId].data[i] = 0xff;

    Task_Hof_DisplayMon(runtime, taskId);
    const spriteId = runtime.tasks[taskId].data[5];
    expect(runtime.sprites[spriteId]).toMatchObject({ x: 120, y: 210, callback: 'SpriteCB_GetOnScreen' });
    runtime.sprites[spriteId].data[0] = 1;
    Task_Hof_PlayMonCryAndPrintInfo(runtime, taskId);
    expect(runtime.operations).toContain('PlayCry_Normal:10:0');
    expect(runtime.printed.some((entry) => entry.startsWith('mon:10'))).toBe(true);

    runtime.tasks[taskId].data[3] = 0;
    Task_Hof_TryDisplayAnotherMon(runtime, taskId);
    expect(runtime.tasks[taskId].data[1]).toBe(1);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_DisplayMon');
    expect(runtime.sprites[spriteId].oam.priority).toBe(1);

    runtime.tasks[taskId].data[1] = 3;
    runtime.tasks[taskId].data[8] = spriteId;
    runtime.tasks[taskId].data[3] = 0;
    Task_Hof_TryDisplayAnotherMon(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_PaletteFadeAndPrintWelcomeText');
    Task_Hof_PaletteFadeAndPrintWelcomeText(runtime, taskId);
    expect(runtime.printed).toContain('gText_WelcomeToHOF');
    expect(runtime.operations).toContain(`PlaySE:${SE_APPLAUSE}`);
    expect(runtime.tasks[taskId].data[3]).toBe(400);
  });

  test('runs applause/confetti, border fade, player picture, and HOF exit cleanup', () => {
    const runtime = createHallOfFameRuntime();
    const taskId = pushTask(runtime, 'Task_Hof_ApplauseAndConfetti');
    runtime.tasks[taskId].data[3] = 113;
    runtime.randomValues = [5, 2, 3, 0];
    Task_Hof_ApplauseAndConfetti(runtime, taskId);
    expect(runtime.sprites.some((sprite) => sprite.kind === 'confetti')).toBe(true);

    runtime.tasks[taskId].data[3] = 0;
    runtime.tasks[taskId].data[5] = 0xff;
    Task_Hof_ApplauseAndConfetti(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_WaitBorderFadeAway');
    for (let i = 0; i < 10; i += 1) Task_Hof_WaitBorderFadeAway(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_SpawnPlayerPic');

    Task_Hof_SpawnPlayerPic(runtime, taskId);
    const trainerSprite = runtime.tasks[taskId].data[4];
    runtime.tasks[taskId].data[3] = 0;
    runtime.sprites[trainerSprite].x = 191;
    Task_Hof_WaitAndPrintPlayerInfo(runtime, taskId);
    expect(runtime.sprites[trainerSprite].x).toBe(192);
    Task_Hof_WaitAndPrintPlayerInfo(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_ExitOnKeyPressed');

    runtime.newKeys = A_BUTTON;
    Task_Hof_ExitOnKeyPressed(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_HandlePaletteOnExit');
    Task_Hof_HandlePaletteOnExit(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_HandleExit');
    runtime.gPaletteFadeActive = false;
    Task_Hof_HandleExit(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.warpDestination).toEqual({ map: 'MAP_INDIGO_PLATEAU_EXTERIOR', warpId: -1, x: 11, y: 6 });
  });

  test('initializes and browses Hall of Fame PC data', () => {
    const runtime = createHallOfFameRuntime();
    for (let i = 0; i < 8; i += 1) {
      CB2_InitHofPC(runtime);
    }
    runtime.pcScreenEffectOn = false;
    CB2_InitHofPC(runtime);
    CB2_InitHofPC(runtime);
    expect(runtime.mainCallback2).toBe('CB2_HofIdle');
    expect(runtime.tasks[0].func).toBe('Task_HofPC_CopySaveData');

    runtime.savedTeams = [teamWithSpecies(10), teamWithSpecies(20), emptyTeam()];
    runtime.gameStats.GAME_STAT_ENTERED_HOF = 2;
    Task_HofPC_CopySaveData(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(1);
    expect(runtime.tasks[0].data[1]).toBe(2);
    Task_HofPC_DrawSpritesPrintText(runtime, 0);
    expect(runtime.tasks[0].data[4]).toBe(1);
    expect(runtime.printed).toContain('gText_UPDOWNPick_ABUTTONNext_BBUTTONBack');
    Task_HofPC_PrintMonInfo(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_HofPC_HandleInput');

    runtime.newKeys = A_BUTTON;
    Task_HofPC_HandleInput(runtime, 0);
    expect(runtime.tasks[0].data[0]).toBe(0);
    expect(runtime.tasks[0].func).toBe('Task_HofPC_DrawSpritesPrintText');
    Task_HofPC_DrawSpritesPrintText(runtime, 0);
    runtime.newKeys = DPAD_DOWN;
    runtime.tasks[0].data[4] = 2;
    Task_HofPC_HandleInput(runtime, 0);
    expect(runtime.tasks[0].data[2]).toBe(1);
    runtime.newKeys = DPAD_UP;
    Task_HofPC_HandleInput(runtime, 0);
    expect(runtime.tasks[0].data[2]).toBe(0);
    runtime.newKeys = B_BUTTON;
    Task_HofPC_HandleInput(runtime, 0);
    expect(runtime.tasks[0].func).toBe('Task_HofPC_HandlePaletteOnExit');
  });

  test('handles HOF PC corrupted data and exit effect', () => {
    const runtime = createHallOfFameRuntime();
    const taskId = pushTask(runtime, 'Task_HofPC_CopySaveData');
    runtime.loadGameSaveStatus = 0;
    Task_HofPC_CopySaveData(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_HofPC_PrintDataIsCorrupted');
    Task_HofPC_PrintDataIsCorrupted(runtime, taskId);
    expect(runtime.printed).toContain('gText_HOFCorrupted');
    runtime.newKeys = A_BUTTON;
    Task_HofPC_ExitOnButtonPress(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_HofPC_HandlePaletteOnExit');
    Task_HofPC_HandlePaletteOnExit(runtime, taskId);
    runtime.pcScreenEffectOff = false;
    Task_HofPC_HandleExit(runtime, taskId);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.operations).toContain('ReturnFromHallOfFamePC');
  });

  test('updates sprite movement, confetti, vblank/idle, background drawing, and dispatchers', () => {
    const runtime = createHallOfFameRuntime();
    const spriteId = runtime.sprites.push({ id: 0, kind: 'mon', x: 0, y: 0, x2: 0, y2: 0, data: [0, 30, 20, 0, 0, 0, 0, 0], oam: { priority: 0, paletteNum: 0 }, callback: 'SpriteCB_GetOnScreen', destroyed: false }) - 1;
    SpriteCB_GetOnScreen(runtime, spriteId);
    expect(runtime.sprites[spriteId].x).toBe(15);
    expect(runtime.sprites[spriteId].y).toBe(10);
    runtime.sprites[spriteId].x = 30;
    runtime.sprites[spriteId].y = 20;
    tickHallOfFameSprite(runtime, spriteId);
    expect(runtime.sprites[spriteId].callback).toBe('SpriteCB_EndGetOnScreen');

    const confettiId = runtime.sprites.push({ id: 1, kind: 'confetti', x: 0, y: 0, x2: 0, y2: 121, data: [0, 1, 0, 0, 0, 0, 0, 0], oam: { priority: 0, paletteNum: 0 }, callback: 'SpriteCB_Confetti', destroyed: false }) - 1;
    SpriteCB_Confetti(runtime, confettiId);
    expect(runtime.sprites[confettiId].destroyed).toBe(true);

    VBlankCB_HofIdle(runtime);
    CB2_HofIdle(runtime);
    expect(runtime.operations).toContain('LoadOam');
    expect(runtime.operations).toContain('RunTasks');

    runtime.sHofGfxPtr = { state: 0 };
    expect(DrawHofBackground(runtime)).toBe(true);
    runtime.sHofGfxPtr.state = 4;
    expect(DrawHofBackground(runtime)).toBe(false);

    const taskId = pushTask(runtime, 'Task_Hof_DelayAfterSave');
    runtime.tasks[taskId].data[3] = 0;
    tickHallOfFameTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_Hof_StartDisplayingMons');
  });
});

function pushTask(runtime: HallOfFameRuntime, func: HofTaskFunc): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
}

function mon(species: number, lvl = 5, tid = 1, personality = 2, nick = [species, EOS]): HallOfFameMon {
  return { species, lvl, tid, personality, nick };
}

function emptyMon(): HallOfFameMon {
  return { species: SPECIES_NONE, lvl: 0, tid: 0, personality: 0, nick: [EOS] };
}

function emptyTeam(): HallOfFameTeam {
  return { mon: Array.from({ length: PARTY_SIZE }, () => emptyMon()) };
}

function teamWithSpecies(species: number): HallOfFameTeam {
  const team = emptyTeam();
  team.mon[0] = mon(species);
  return team;
}
