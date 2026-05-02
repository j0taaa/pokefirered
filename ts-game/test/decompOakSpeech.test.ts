import { describe, expect, it } from 'vitest';
import {
  BLDALPHA_BLEND,
  BLDCNT_EFFECT_BLEND,
  BLDCNT_TGT1_BG2,
  BLDCNT_TGT2_BG1,
  BLDCNT_TGT2_OBJ,
  A_BUTTON,
  CB2_NewGameScene,
  CB2_ReturnFromNamingScreen,
  CreateFadeInTask,
  CreateFadeOutTask,
  CreateNidoranFSprite,
  CreatePikachuOrPlatformSprites,
  ClearTrainerPic,
  DestroyPikachuOrPlatformSprites,
  EOS,
  FEMALE,
  FEMALE_PLAYER_PIC,
  GetDefaultName,
  LoadTrainerPic,
  MALE,
  MALE_PLAYER_PIC,
  MENU_B_PRESSED,
  OAK_PIC,
  PALETTES_ALL,
  PALETTES_OBJECTS,
  PLAYER_NAME_LENGTH,
  PrintNameChoiceOptions,
  Q_8_8_inv,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  RIVAL_PIC,
  RGB_BLACK,
  RGB_WHITE,
  SE_SELECT,
  SE_WARP_IN,
  SPRITE_TYPE_PIKACHU,
  SPRITE_TYPE_PLATFORM,
  SpriteCB_Pikachu,
  StartNewGameScene,
  Task_ControlsGuide_ChangePage,
  Task_ControlsGuide_Clear,
  Task_ControlsGuide_HandleInput,
  Task_NewGameScene,
  Task_OakSpeech_AskPlayerGender,
  Task_OakSpeech_DoNamingScreen,
  Task_OakSpeech_DestroyPlatformSprites,
  Task_OakSpeech_FadePlayerPicToBlack,
  Task_OakSpeech_FadePlayerPicWhite,
  Task_OakSpeech_FadeOutForPlayerNamingScreen,
  Task_OakSpeech_FadeOutOak,
  Task_OakSpeech_HandleGenderInput,
  Task_OakSpeech_FreeResources,
  Task_OakSpeech_HandleConfirmNameInput,
  Task_OakSpeech_Init,
  Task_OakSpeech_LoadPlayerPic,
  Task_OakSpeech_ShowGenderOptions,
  Task_OakSpeech_SetUpDestroyPlatformSprites,
  Task_OakSpeech_SetUpFadePlayerPicWhite,
  Task_OakSpeech_SetUpShrinkPlayerPic,
  Task_OakSpeech_ShrinkPlayerPic,
  Task_OakSpeech_ThisWorld,
  Task_OakSpeech_WelcomeToTheWorld,
  Task_PikachuIntro_Clear,
  Task_PikachuIntro_HandleInput,
  Task_PikachuIntro_LoadPage1,
  Task_OakSpeech_WaitForFade,
  Task_SlowFadeIn,
  Task_SlowFadeOut,
  bytesToString,
  createOakSpeechRuntime,
  createOakSpeechTask,
  sFemaleNameChoices,
  sMaleNameChoices,
  sRivalNameChoices,
  stringToBytes
} from '../src/game/decompOakSpeech';

describe('decompOakSpeech', () => {
  it('new-game scene bootstrap and controls-guide tasks preserve C state transitions', () => {
    const runtime = createOakSpeechRuntime();
    const task = StartNewGameScene(runtime);

    expect(runtime.plttBufferFaded[0]).toBe(RGB_BLACK);
    expect(runtime.plttBufferUnfaded[0]).toBe(RGB_BLACK);
    expect(runtime.mainCallback2).toBe('CB2_NewGameScene');
    expect(task.func).toBe('Task_NewGameScene');

    runtime.mainState = 7;
    Task_NewGameScene(runtime, task);
    expect(task.data[5]).toBe(0);
    expect(runtime.currentPage).toBe(0);

    runtime.mainState = 10;
    Task_NewGameScene(runtime, task);
    expect(task.func).toBe('Task_ControlsGuide_HandleInput');
    expect(runtime.mainState).toBe(0);
    expect(runtime.vblankCallback).toBe('VBlankCB_NewGameScene');
    expect(runtime.bgm).toContain('MUS_NEW_GAME_INSTRUCT');

    runtime.paletteFadeActive = false;
    runtime.currentPage = 0;
    runtime.mainNewKeys = A_BUTTON;
    Task_ControlsGuide_HandleInput(runtime, task);
    expect(task.data[15]).toBe(1);
    expect(task.func).toBe('Task_ControlsGuide_ChangePage');
    expect(runtime.playedSoundEffects).toContain(SE_SELECT);

    runtime.paletteFadeActive = false;
    Task_ControlsGuide_ChangePage(runtime, task);
    expect(runtime.currentPage).toBe(1);
    expect(task.func).toBe('Task_ControlsGuide_LoadPage');

    runtime.currentPage = 3;
    task.data[15] = 0;
    runtime.paletteFadeActive = false;
    Task_ControlsGuide_ChangePage(runtime, task);
    expect(task.func).toBe('Task_ControlsGuide_Clear');
    expect(runtime.paletteFades.at(-1)).toEqual({ palettes: PALETTES_ALL, delay: 2, startY: 0, targetY: 16, color: 0 });

    runtime.paletteFadeActive = false;
    Task_ControlsGuide_Clear(runtime, task);
    expect(task.data[3]).toBe(32);
    expect(task.func).toBe('Task_PikachuIntro_LoadPage1');
  });

  it('Pikachu intro and Oak intro tasks carry page, sprite, message, and trainer-pic state like C', () => {
    const runtime = createOakSpeechRuntime();
    const task = createOakSpeechTask(runtime, 'Task_PikachuIntro_LoadPage1');

    task.data[3] = 1;
    Task_PikachuIntro_LoadPage1(runtime, task);
    expect(task.data[3]).toBe(0);
    Task_PikachuIntro_LoadPage1(runtime, task);
    expect(task.func).toBe('Task_PikachuIntro_HandleInput');
    expect(runtime.currentPage).toBe(0);
    expect(runtime.createdSpriteTypes.at(-1)).toMatchObject({ taskId: task.id, spriteType: SPRITE_TYPE_PIKACHU });

    runtime.paletteFadeActive = false;
    runtime.mainState = 0;
    Task_PikachuIntro_HandleInput(runtime, task);
    expect(runtime.mainState).toBe(1);

    runtime.mainNewKeys = A_BUTTON;
    Task_PikachuIntro_HandleInput(runtime, task);
    expect(runtime.currentPage).toBe(1);
    expect(runtime.mainState).toBe(2);
    Task_PikachuIntro_Clear(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_Init');
    expect(task.data[3]).toBe(80);

    task.data[3] = 0;
    runtime.paletteFadeActive = false;
    Task_OakSpeech_Init(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_WelcomeToTheWorld');
    expect(runtime.loadedTrainerPics.at(-1)?.whichPic).toBe(OAK_PIC);
    expect(runtime.createdSpriteTypes.at(-1)).toMatchObject({ taskId: task.id, spriteType: SPRITE_TYPE_PLATFORM });

    runtime.paletteFadeActive = false;
    task.data[3] = 0;
    Task_OakSpeech_WelcomeToTheWorld(runtime, task);
    expect(runtime.printedMessages.at(-1)?.text).toBe('gOakSpeech_Text_WelcomeToTheWorld');
    expect(task.func).toBe('Task_OakSpeech_ThisWorld');

    Task_OakSpeech_ThisWorld(runtime, task);
    expect(runtime.printedMessages.at(-1)?.text).toBe('gOakSpeech_Text_ThisWorld');
    expect(task.data[3]).toBe(30);
  });

  it('Oak gender, naming, callback return, and Pikachu sprite callback preserve task-data wiring', () => {
    const runtime = createOakSpeechRuntime();
    const task = createOakSpeechTask(runtime, 'Task_OakSpeech_FadeOutOak');
    task.data[2] = 1;

    Task_OakSpeech_FadeOutOak(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_AskPlayerGender');
    task.data[2] = 1;
    task.data[3] = 0;
    Task_OakSpeech_AskPlayerGender(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_ShowGenderOptions');
    Task_OakSpeech_ShowGenderOptions(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_HandleGenderInput');
    expect(task.data[13]).toBe(0);

    runtime.menuInput = 1;
    Task_OakSpeech_HandleGenderInput(runtime, task);
    expect(runtime.playerGender).toBe(FEMALE);
    expect(task.func).toBe('Task_OakSpeech_ClearGenderWindows');

    Task_OakSpeech_LoadPlayerPic(runtime, task);
    expect(runtime.loadedTrainerPics.at(-1)?.whichPic).toBe(FEMALE_PLAYER_PIC);
    expect(task.func).toBe('Task_OakSpeech_YourNameWhatIsIt');

    task.func = 'Task_OakSpeech_FadeOutForPlayerNamingScreen';
    Task_OakSpeech_FadeOutForPlayerNamingScreen(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_DoNamingScreen');
    runtime.paletteFadeActive = false;
    Task_OakSpeech_DoNamingScreen(runtime, task);
    expect(runtime.namingScreenCalls.at(-1)).toEqual({
      type: 'NAMING_SCREEN_PLAYER',
      dest: 'playerName',
      gender: FEMALE,
      callback: 'CB2_ReturnFromNamingScreen'
    });

    runtime.resources.hasPlayerBeenNamed = true;
    runtime.mainState = 6;
    CB2_ReturnFromNamingScreen(runtime);
    expect(runtime.loadedTrainerPics.at(-1)?.whichPic).toBe(RIVAL_PIC);
    expect(runtime.tasks.at(-1)?.func).toBe('Task_OakSpeech_ConfirmName');

    const spriteTask = createOakSpeechTask(runtime, 'sprites');
    CreatePikachuOrPlatformSprites(runtime, spriteTask, SPRITE_TYPE_PIKACHU);
    const body = spriteTask.data[7];
    const ears = spriteTask.data[8];
    runtime.sprites[body].animCmdIndex = 6;
    SpriteCB_Pikachu(runtime, runtime.sprites[ears]);
    expect(runtime.sprites[ears].y2).toBe(6);

    const nidoranTask = createOakSpeechTask(runtime, 'nidoran');
    const nidoranId = CreateNidoranFSprite(runtime, nidoranTask);
    expect(nidoranTask.data[4]).toBe(nidoranId);
    expect(runtime.sprites[nidoranId].invisible).toBe(true);

    CB2_NewGameScene(runtime);
    expect(runtime.callbacksRun.slice(-5)).toEqual(['RunTasks', 'RunTextPrinters', 'AnimateSprites', 'BuildOamBuffer', 'UpdatePaletteFade']);
  });

  it('name choice tables preserve FireRed order and menu prints only rival-count options', () => {
    expect(sMaleNameChoices).toHaveLength(19);
    expect(sFemaleNameChoices).toHaveLength(19);
    expect(sRivalNameChoices).toEqual(['GREEN', 'GARY', 'KAZ', 'TORU']);
    expect(sMaleNameChoices.slice(0, 6)).toEqual(['RED', 'FIRE', 'ASH', 'KENE', 'GEKI', 'JAK']);
    expect(sFemaleNameChoices.slice(0, 6)).toEqual(['RED', 'FIRE', 'OMI', 'JODI', 'AMANDA', 'HILLARY']);

    const runtime = createOakSpeechRuntime({ playerGender: MALE });
    expect(PrintNameChoiceOptions(runtime, false)).toEqual(['NEW NAME', 'RED', 'FIRE', 'ASH', 'KENE']);
    runtime.playerGender = FEMALE;
    expect(PrintNameChoiceOptions(runtime, false)).toEqual(['NEW NAME', 'RED', 'FIRE', 'OMI', 'JODI']);
    expect(PrintNameChoiceOptions(runtime, true)).toEqual(['NEW NAME', 'GREEN', 'GARY', 'KAZ', 'TORU']);
  });

  it('GetDefaultName copies until EOS or PLAYER_NAME_LENGTH then pads through length + 1', () => {
    const runtime = createOakSpeechRuntime({ playerGender: MALE });

    GetDefaultName(runtime, false, 0, () => 1);
    expect(bytesToString(runtime.playerName)).toBe('FIRE');
    expect(runtime.playerName).toEqual([70, 73, 82, 69, EOS, EOS, EOS, EOS]);

    runtime.playerGender = FEMALE;
    GetDefaultName(runtime, false, 0, () => 5);
    expect(bytesToString(runtime.playerName)).toBe('HILLARY');
    expect(runtime.playerName).toEqual([72, 73, 76, 76, 65, 82, 89, EOS]);

    GetDefaultName(runtime, true, 3, () => 0);
    expect(bytesToString(runtime.rivalName)).toBe('TORU');
    expect(runtime.rivalName).toEqual([84, 79, 82, 85, EOS, EOS, EOS, EOS]);
    expect(stringToBytes('ABCDEFGH').slice(0, PLAYER_NAME_LENGTH + 1)).toEqual([65, 66, 67, 68, 69, 70, 71, 72]);
  });

  it('Q_8_8_inv truncates like the C helper', () => {
    expect(Q_8_8_inv(248)).toBe(264);
    expect(Q_8_8_inv(208)).toBe(315);
    expect(Q_8_8_inv(80)).toBe(819);
  });

  it('CreateFadeInTask seeds registers and child task data exactly', () => {
    const runtime = createOakSpeechRuntime();
    const parent = createOakSpeechTask(runtime, 'parent');
    parent.data[7] = 4;
    parent.data[8] = 5;
    parent.data[9] = 6;
    parent.data[2] = 99;

    const child = CreateFadeInTask(runtime, parent, 2);

    expect(runtime.gpuRegs[REG_OFFSET_BLDCNT]).toBe(BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_OBJ);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(16, 0));
    expect(runtime.gpuRegs[REG_OFFSET_BLDY]).toBe(0);
    expect(parent.data[2]).toBe(0);
    expect(child.data.slice(0, 5)).toEqual([parent.id, 16, 0, 2, 2]);
    expect(child.data.slice(7, 10)).toEqual([4, 5, 6]);
  });

  it('Task_SlowFadeIn delays, updates alpha, toggles sprites at target 8, and finishes parent state', () => {
    const runtime = createOakSpeechRuntime();
    const parent = createOakSpeechTask(runtime, 'parent');
    parent.data[7] = 1;
    parent.data[8] = 2;
    parent.data[9] = 3;
    const child = CreateFadeInTask(runtime, parent, 1);

    Task_SlowFadeIn(runtime, child);
    expect(child.data.slice(1, 5)).toEqual([16, 0, 1, 0]);

    Task_SlowFadeIn(runtime, child);
    expect(child.data.slice(1, 5)).toEqual([15, 1, 1, 1]);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(1 * 256 + 15);

    while (child.data[1] !== 8) {
      Task_SlowFadeIn(runtime, child);
      Task_SlowFadeIn(runtime, child);
    }
    expect(runtime.sprites[1].invisible).toBe(true);
    expect(runtime.sprites[2].invisible).toBe(true);
    expect(runtime.sprites[3].invisible).toBe(true);

    for (let i = child.data[1]; i !== 0; i = child.data[1]) {
      Task_SlowFadeIn(runtime, child);
      Task_SlowFadeIn(runtime, child);
    }
    Task_SlowFadeIn(runtime, child);
    expect(parent.data[2]).toBe(1);
    expect(child.destroyed).toBe(true);
  });

  it('Task_SlowFadeOut mirrors alpha progression and waits for palette fade before destroy', () => {
    const runtime = createOakSpeechRuntime();
    const parent = createOakSpeechTask(runtime, 'parent');
    parent.data[7] = 1;
    parent.data[8] = 2;
    parent.data[9] = 3;
    const child = CreateFadeOutTask(runtime, parent, 0);

    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(BLDALPHA_BLEND(0, 16));
    Task_SlowFadeOut(runtime, child);
    expect(child.data.slice(1, 5)).toEqual([2, 14, 0, 0]);
    expect(runtime.gpuRegs[REG_OFFSET_BLDALPHA]).toBe(14 * 256 + 2);

    Task_SlowFadeOut(runtime, child);
    Task_SlowFadeOut(runtime, child);
    Task_SlowFadeOut(runtime, child);
    expect(child.data[1]).toBe(8);
    expect(runtime.sprites[1].invisible).toBe(true);

    while (child.data[1] !== 16)
      Task_SlowFadeOut(runtime, child);
    runtime.paletteFadeActive = true;
    Task_SlowFadeOut(runtime, child);
    expect(child.destroyed).toBe(false);
    runtime.paletteFadeActive = false;
    Task_SlowFadeOut(runtime, child);
    expect(parent.data[2]).toBe(1);
    expect(child.destroyed).toBe(true);
  });

  it('ShrinkPlayerPic setup and step use the same 20-frame cadence, sound, affine args, and stop threshold', () => {
    const runtime = createOakSpeechRuntime();
    const task = createOakSpeechTask(runtime, 'setup');

    Task_OakSpeech_SetUpShrinkPlayerPic(runtime, task);
    expect(runtime.bgAttributeCalls).toEqual([{ bg: 2, attr: 'BG_ATTR_WRAPAROUND', value: 1 }]);
    expect(task.data[0]).toBe(0);
    expect(task.data[2]).toBe(256);
    expect(task.data[15]).toBe(0);
    expect(task.func).toBe('Task_OakSpeech_ShrinkPlayerPic');

    for (let i = 0; i < 19; i++)
      Task_OakSpeech_ShrinkPlayerPic(runtime, task);
    expect(runtime.bgAffineCalls).toEqual([]);

    Task_OakSpeech_ShrinkPlayerPic(runtime, task);
    expect(task.data[2]).toBe(224);
    expect(runtime.bgAffineCalls[0]).toEqual({ bg: 2, srcCenterX: 0x7800, srcCenterY: 0x5400, destCenterX: 120, destCenterY: 84, scaleX: 264, scaleY: 315, rotation: 0 });

    for (let i = 0; i < 20; i++)
      Task_OakSpeech_ShrinkPlayerPic(runtime, task);
    expect(runtime.playedSoundEffects).toEqual([SE_WARP_IN]);

    while (task.func !== 'Task_OakSpeech_FadePlayerPicToBlack')
      Task_OakSpeech_ShrinkPlayerPic(runtime, task);
    expect(task.data[2]).toBe(96);
    expect(task.data[15]).toBe(1);
    expect(task.data[0]).toBe(36);
  });

  it('FadePlayerPicWhite decrements timers, blends with increasing coefficient, and destroys after 14', () => {
    const runtime = createOakSpeechRuntime();
    const task = Task_OakSpeech_SetUpFadePlayerPicWhite(runtime);

    expect(task.data[0]).toBe(8);
    for (let i = 0; i < 8; i++)
      Task_OakSpeech_FadePlayerPicWhite(runtime, task);
    expect(runtime.paletteBlends).toEqual([]);

    Task_OakSpeech_FadePlayerPicWhite(runtime, task);
    expect(runtime.paletteBlends[0]).toEqual({ start: 64, count: 0x20, coefficient: 0, color: 0x7fff });
    expect(task.data[0]).toBe(7);
    expect(task.data[1]).toBe(-1);
    expect(task.data[2]).toBe(7);
    expect(task.data[14]).toBe(1);

    while (!task.destroyed)
      Task_OakSpeech_FadePlayerPicWhite(runtime, task);
    expect(runtime.paletteBlends).toHaveLength(15);
    expect(runtime.paletteBlends.at(-1)?.coefficient).toBe(14);
    expect(runtime.plttBufferFaded.slice(64, 96)).toEqual(Array.from({ length: 32 }, () => RGB_WHITE));
    expect(runtime.plttBufferUnfaded.slice(64, 96)).toEqual(Array.from({ length: 32 }, () => RGB_WHITE));
  });

  it('DestroyPlatformSprites setup and task preserve the child-task sprite-id bug from oak_speech.c', () => {
    const runtime = createOakSpeechRuntime();
    const task = Task_OakSpeech_SetUpDestroyPlatformSprites(runtime);

    expect(task.func).toBe('Task_OakSpeech_DestroyPlatformSprites');
    expect(task.data[1]).toBe(0);
    expect(runtime.paletteFades).toEqual([{ palettes: PALETTES_OBJECTS | 0x0fcf, delay: 4, startY: 0, targetY: 16, color: RGB_BLACK }]);

    Task_OakSpeech_DestroyPlatformSprites(runtime, task);
    expect(task.data[1]).toBe(0);
    expect(task.destroyed).toBe(false);

    runtime.paletteFadeActive = false;
    Task_OakSpeech_DestroyPlatformSprites(runtime, task);
    expect(task.data[1]).toBe(1);
    expect(runtime.paletteFades.at(-1)).toEqual({ palettes: 0xf000, delay: 0, startY: 0, targetY: 16, color: RGB_BLACK });

    runtime.sprites[0].invisible = false;
    runtime.sprites[7].invisible = false;
    runtime.paletteFadeActive = false;
    Task_OakSpeech_DestroyPlatformSprites(runtime, task);
    expect(task.destroyed).toBe(true);
    expect(runtime.sprites[0].invisible).toBe(true);
    expect(runtime.sprites[7].invisible).toBe(false);
    expect(runtime.destroyedSpriteTypes).toEqual([{ taskId: task.id, spriteType: SPRITE_TYPE_PLATFORM }]);
  });

  it('FadePlayerPicToBlack counts down, starts the exact palette fade, and waits until inactive', () => {
    const runtime = createOakSpeechRuntime();
    const task = createOakSpeechTask(runtime, 'Task_OakSpeech_FadePlayerPicToBlack');
    task.data[0] = 2;

    Task_OakSpeech_FadePlayerPicToBlack(runtime, task);
    expect(task.data[0]).toBe(1);
    expect(runtime.paletteFades).toEqual([]);

    Task_OakSpeech_FadePlayerPicToBlack(runtime, task);
    expect(task.data[0]).toBe(0);
    expect(runtime.paletteFades).toEqual([]);

    Task_OakSpeech_FadePlayerPicToBlack(runtime, task);
    expect(runtime.paletteFades).toEqual([{ palettes: 0x30, delay: 2, startY: 0, targetY: 16, color: RGB_BLACK }]);
    expect(runtime.paletteFadeActive).toBe(true);
    expect(task.func).toBe('Task_OakSpeech_WaitForFade');

    Task_OakSpeech_WaitForFade(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_WaitForFade');
    runtime.paletteFadeActive = false;
    Task_OakSpeech_WaitForFade(runtime, task);
    expect(task.func).toBe('Task_OakSpeech_FreeResources');
  });

  it('FreeResources mirrors the cleanup side effects and destroys the oak speech task', () => {
    const runtime = createOakSpeechRuntime();
    const task = createOakSpeechTask(runtime, 'Task_OakSpeech_FreeResources');

    Task_OakSpeech_FreeResources(runtime, task);

    expect(runtime.allWindowBuffersFreed).toBe(true);
    expect(runtime.monSpritesGfxManagerDestroyed).toBe(true);
    expect(runtime.oakSpeechResourcesFreed).toBe(true);
    expect(runtime.textFlagsCanABSpeedUpPrint).toBe(false);
    expect(runtime.mainCallback2).toBe('CB2_NewGame');
    expect(task.destroyed).toBe(true);
  });

  it('HandleConfirmNameInput preserves YES/NO/B branches for player and rival naming', () => {
    const playerRuntime = createOakSpeechRuntime({ resources: { hasPlayerBeenNamed: false, shrinkTimer: 0 } });
    const playerTask = createOakSpeechTask(playerRuntime, 'Task_OakSpeech_HandleConfirmNameInput');
    playerTask.data[7] = 1;
    playerTask.data[8] = 2;
    playerTask.data[9] = 3;

    Task_OakSpeech_HandleConfirmNameInput(playerRuntime, playerTask, 0);
    expect(playerRuntime.playedSoundEffects).toEqual([SE_SELECT]);
    expect(playerTask.data[3]).toBe(40);
    expect(playerRuntime.clearDialogWindowAndFrameCalls).toEqual([{ windowId: 0, copyToVram: true }]);
    expect(playerTask.func).toBe('Task_OakSpeech_FadeOutPlayerPic');
    expect(playerRuntime.tasks.at(-1)?.func).toBe('Task_SlowFadeIn');

    const noRuntime = createOakSpeechRuntime({ resources: { hasPlayerBeenNamed: false, shrinkTimer: 0 } });
    const noTask = createOakSpeechTask(noRuntime, 'Task_OakSpeech_HandleConfirmNameInput');
    Task_OakSpeech_HandleConfirmNameInput(noRuntime, noTask, 1);
    expect(noRuntime.playedSoundEffects).toEqual([SE_SELECT]);
    expect(noTask.func).toBe('Task_OakSpeech_FadeOutForPlayerNamingScreen');

    const rivalRuntime = createOakSpeechRuntime({ resources: { hasPlayerBeenNamed: true, shrinkTimer: 0 } });
    const rivalTask = createOakSpeechTask(rivalRuntime, 'Task_OakSpeech_HandleConfirmNameInput');
    Task_OakSpeech_HandleConfirmNameInput(rivalRuntime, rivalTask, 0);
    expect(rivalRuntime.printedMessages).toEqual([{ text: 'gOakSpeech_Text_RememberRivalsName', speed: 0 }]);
    expect(rivalTask.func).toBe('Task_OakSpeech_FadeOutRivalPic');

    Task_OakSpeech_HandleConfirmNameInput(rivalRuntime, rivalTask, MENU_B_PRESSED);
    expect(rivalRuntime.playedSoundEffects).toEqual([SE_SELECT, SE_SELECT]);
    expect(rivalTask.func).toBe('Task_OakSpeech_RepeatNameQuestion');
  });

  it('LoadTrainerPic and ClearTrainerPic mirror palette/tile selection and tilemap copy calls', () => {
    const runtime = createOakSpeechRuntime();

    LoadTrainerPic(runtime, MALE_PLAYER_PIC, 0);
    LoadTrainerPic(runtime, FEMALE_PLAYER_PIC, 64);
    LoadTrainerPic(runtime, RIVAL_PIC, 128);
    LoadTrainerPic(runtime, OAK_PIC, 192);
    LoadTrainerPic(runtime, 99, 0);

    expect(runtime.loadedTrainerPics).toEqual([
      { whichPic: MALE_PLAYER_PIC, tileOffset: 0, palette: 'sOakSpeech_Red_Pal', paletteOffset: 64, tiles: 'sOakSpeech_Red_Tiles', vramOffset: 0x600 },
      { whichPic: FEMALE_PLAYER_PIC, tileOffset: 64, palette: 'sOakSpeech_Leaf_Pal', paletteOffset: 64, tiles: 'sOakSpeech_Leaf_Tiles', vramOffset: 0x640 },
      { whichPic: RIVAL_PIC, tileOffset: 128, palette: 'sOakSpeech_Rival_Pal', paletteOffset: 96, tiles: 'sOakSpeech_Rival_Tiles', vramOffset: 0x680 },
      { whichPic: OAK_PIC, tileOffset: 192, palette: 'sOakSpeech_Oak_Pal', paletteOffset: 96, tiles: 'sOakSpeech_Oak_Tiles', vramOffset: 0x6c0 }
    ]);
    expect(runtime.trainerPicTilemap).toBeNull();
    expect(runtime.fillBgTilemapBufferRectCalls.slice(0, 4)).toEqual([
      { bg: 2, value: 0, x: 0, y: 0, width: 32, height: 32, palette: 16 },
      { bg: 2, value: 0, x: 0, y: 0, width: 32, height: 32, palette: 16 },
      { bg: 2, value: 0, x: 0, y: 0, width: 32, height: 32, palette: 16 },
      { bg: 2, value: 0, x: 0, y: 0, width: 32, height: 32, palette: 16 }
    ]);
    expect(runtime.copyRectToBgTilemapBufferRectCalls.map((call) => call.tileOffset)).toEqual([24, 25, 26, 27]);
    expect(runtime.copyBgTilemapBufferToVramCalls).toEqual([2, 2, 2, 2]);

    ClearTrainerPic(runtime);
    expect(runtime.fillBgTilemapBufferRectCalls.at(-1)).toEqual({ bg: 2, value: 0, x: 11, y: 1, width: 8, height: 12, palette: 16 });
    expect(runtime.copyBgTilemapBufferToVramCalls.at(-1)).toBe(2);
  });

  it('DestroyPikachuOrPlatformSprites destroys all three stored sprite ids and records sprite type', () => {
    const runtime = createOakSpeechRuntime();
    const task = createOakSpeechTask(runtime, 'parent');
    task.data[7] = 7;
    task.data[8] = 8;
    task.data[9] = 9;

    DestroyPikachuOrPlatformSprites(runtime, task, SPRITE_TYPE_PLATFORM);
    expect(runtime.sprites[7].invisible).toBe(true);
    expect(runtime.sprites[8].invisible).toBe(true);
    expect(runtime.sprites[9].invisible).toBe(true);
    expect(runtime.destroyedSpriteTypes).toEqual([{ taskId: task.id, spriteType: SPRITE_TYPE_PLATFORM }]);
  });
});
