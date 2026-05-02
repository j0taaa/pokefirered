import { describe, expect, test } from 'vitest';
import * as startMenu from '../src/game/decompStartMenu';
import {
  FADE_TO_BLACK,
  OPTIONS_BUTTON_MODE_HELP,
  SAVECB_RETURN_CANCEL,
  SAVECB_RETURN_CONTINUE,
  SAVECB_RETURN_ERROR,
  SAVECB_RETURN_OKAY,
  SAVE_NORMAL,
  SAVE_OVERWRITE_DIFFERENT_FILE,
  SAVE_STATUS_EMPTY,
  SAVE_STATUS_INVALID,
  SAVE_STATUS_OK,
  SE_BOO,
  SE_SAVE,
  SE_SELECT,
  STARTMENU_BAG,
  STARTMENU_EXIT,
  STARTMENU_OPTION,
  STARTMENU_PLAYER,
  STARTMENU_PLAYER2,
  STARTMENU_POKEDEX,
  STARTMENU_POKEMON,
  STARTMENU_RETIRE,
  STARTMENU_SAVE,
  appendToList,
  cb2SetUpSaveAfterLinkBattle,
  closeStartMenu,
  createStartMenuRuntime,
  doDrawStartMenu,
  doSetUpSaveAfterLinkBattle,
  drawSafariZoneStatsWindow,
  drawStartMenuInOneGo,
  fieldAskSaveTheGame,
  fieldCB2DrawStartMenu,
  openStartMenuWithFollowupFunc,
  printSaveStats,
  runSaveDialogCB,
  saveDialogCBAskOverwriteOrReplacePreviousFileHandleInput,
  saveDialogCBAskSaveHandleInput,
  saveDialogCBDoSave,
  saveDialogCBPrintAskOverwriteText,
  saveDialogCBPrintAskSaveText,
  saveDialogCBPrintSaveResult,
  saveDialogCBPrintSavingDontTurnOffPower,
  saveDialogCBReturnError,
  saveDialogCBReturnSuccess,
  saveDialogCBWaitPrintErrorAndPlaySE,
  saveDialogCBWaitPrintSuccessAndPlaySE,
  saveDialogWait60FramesOrAButtonHeld,
  saveDialogWait60FramesThenCheckAButtonHeld,
  setHasPokedexAndPokemon,
  setUpReturnToStartMenu,
  setUpStartMenu,
  setUpStartMenuLink,
  setUpStartMenuNormalField,
  setUpStartMenuSafariZone,
  setUpStartMenuUnionRoom,
  showStartMenu,
  startCBHandleInput,
  startCBSave1,
  startCBSave2,
  startMenuBagCallback,
  startMenuExitCallback,
  startMenuFadeScreenIfLeavingOverworld,
  startMenuLinkPlayerCallback,
  startMenuOptionCallback,
  startMenuPokedexCallback,
  startMenuPokedexSanityCheck,
  startMenuPokemonCallback,
  startMenuSafariZoneRetireCallback,
  startMenuSaveCallback,
  task50AfterLinkBattleSave,
  task50SaveGame,
  task50Startmenu,
  taskStartMenuHandleInput
} from '../src/game/decompStartMenu';

const order = (runtime: ReturnType<typeof createStartMenuRuntime>) =>
  runtime.sStartMenuOrder.slice(0, runtime.sNumStartMenuItems);

describe('decomp start_menu', () => {
  test('start menu setup preserves normal, safari, link, and union-room item ordering', () => {
    const runtime = createStartMenuRuntime();
    setUpStartMenuNormalField(runtime);
    expect(order(runtime)).toEqual([STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_SAVE, STARTMENU_OPTION, STARTMENU_EXIT]);

    runtime.sNumStartMenuItems = 0;
    setHasPokedexAndPokemon(runtime);
    setUpStartMenuNormalField(runtime);
    expect(order(runtime)).toEqual([STARTMENU_POKEDEX, STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_SAVE, STARTMENU_OPTION, STARTMENU_EXIT]);

    runtime.sNumStartMenuItems = 0;
    setUpStartMenuSafariZone(runtime);
    expect(order(runtime)).toEqual([STARTMENU_RETIRE, STARTMENU_POKEDEX, STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_OPTION, STARTMENU_EXIT]);

    runtime.sNumStartMenuItems = 0;
    setUpStartMenuLink(runtime);
    expect(order(runtime)).toEqual([STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER2, STARTMENU_OPTION, STARTMENU_EXIT]);

    runtime.sNumStartMenuItems = 0;
    setUpStartMenuUnionRoom(runtime);
    expect(order(runtime)).toEqual([STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_OPTION, STARTMENU_EXIT]);

    runtime.sNumStartMenuItems = 0;
    runtime.isUpdateLinkStateCBActive = true;
    setUpStartMenu(runtime);
    expect(order(runtime)).toEqual([STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER2, STARTMENU_OPTION, STARTMENU_EXIT]);
  });

  test('staged drawing prints two menu rows per pass and emits safari stats when flagged', () => {
    const runtime = createStartMenuRuntime();
    runtime.safariZoneFlag = true;
    runtime.safariStepCounter = 12;
    runtime.numSafariBalls = 7;

    expect(doDrawStartMenu(runtime)).toBe(false);
    expect(runtime.sDrawStartMenuState).toEqual([1, 0]);
    expect(doDrawStartMenu(runtime)).toBe(false);
    expect(order(runtime)).toEqual([STARTMENU_RETIRE, STARTMENU_POKEDEX, STARTMENU_POKEMON, STARTMENU_BAG, STARTMENU_PLAYER, STARTMENU_OPTION, STARTMENU_EXIT]);
    expect(doDrawStartMenu(runtime)).toBe(false);
    expect(doDrawStartMenu(runtime)).toBe(false);
    expect(runtime.operations).toContain('ConvertIntToDecimalStringN(gStringVar2, 600, RIGHT_ALIGN, 3)');

    expect(doDrawStartMenu(runtime)).toBe(false);
    expect(runtime.sDrawStartMenuState).toEqual([4, 2]);
    expect(doDrawStartMenu(runtime)).toBe(false);
    expect(runtime.sDrawStartMenuState).toEqual([4, 4]);
    drawStartMenuInOneGo(runtime);
    expect(runtime.sDrawStartMenuState[0]).toBe(5);
    expect(runtime.operations.at(-2)).toBe('DrawHelpMessageWindowWithText(gStartMenuDesc_Retire)');
  });

  test('opening and task dispatch mirrors the followup task flow', () => {
    const runtime = createStartMenuRuntime();
    showStartMenu(runtime);
    expect(runtime.operations.slice(0, 3)).toEqual([
      'FreezeObjectEvents()',
      'HandleEnforcedLookDirectionOnPlayerStopMoving()',
      'StopPlayerAvatar()'
    ]);
    expect(runtime.tasks[0]).toMatchObject({ func: 'task50_startmenu', followupFunc: 'Task_StartMenuHandleInput', priority: 80 });
    expect(runtime.operations.at(-1)).toBe('LockPlayerFieldControls()');

    while (runtime.tasks[0]?.func === 'task50_startmenu') {
      task50Startmenu(runtime, 0);
    }
    expect(runtime.tasks[0].func).toBe('Task_StartMenuHandleInput');

    taskStartMenuHandleInput(runtime, 0);
    expect(runtime.sStartMenuCallback).toBe('StartCB_HandleInput');
    runtime.input = { b: true };
    taskStartMenuHandleInput(runtime, 0);
    expect(runtime.tasks).toHaveLength(0);

    const taskId = openStartMenuWithFollowupFunc(runtime, 'after');
    expect(taskId).toBe(0);
    setUpReturnToStartMenu(runtime);
    expect(runtime.operations).toContain('gFieldCallback2 = FieldCB2_DrawStartMenu');
    while (!fieldCB2DrawStartMenu(runtime)) {
      // staged draw
    }
    expect(runtime.operations).toContain('FadeTransition_FadeInOnReturnToStartMenu()');
  });

  test('input handler moves cursor, blocks empty Pokédex, dispatches callbacks, and closes on B/START', () => {
    const runtime = createStartMenuRuntime();
    setHasPokedexAndPokemon(runtime);
    setUpStartMenu(runtime);
    runtime.sStartMenuCursorPos = 0;
    runtime.optionsButtonMode = OPTIONS_BUTTON_MODE_HELP;

    runtime.input = { dpadDown: true };
    expect(startCBHandleInput(runtime)).toBe(false);
    expect(runtime.sStartMenuCursorPos).toBe(1);
    expect(runtime.playedSoundEffects).toEqual([SE_SELECT]);
    expect(runtime.operations.at(-1)).toBe('PrintTextOnHelpMessageWindow(gStartMenuDesc_Pokemon, 2)');

    runtime.input = { a: true };
    expect(startCBHandleInput(runtime)).toBe(false);
    expect(runtime.sStartMenuCallback).toBe('StartMenuPokemonCallback');
    expect(runtime.operations).toContain(`FadeScreen(${FADE_TO_BLACK}, 0)`);

    runtime.sStartMenuCursorPos = 0;
    runtime.nationalPokedexCount = 0;
    expect(startMenuPokedexSanityCheck(runtime)).toBe(false);
    runtime.input = { a: true };
    runtime.sStartMenuCallback = 'StartCB_HandleInput';
    expect(startCBHandleInput(runtime)).toBe(false);
    expect(runtime.sStartMenuCallback).toBe('StartCB_HandleInput');

    runtime.input = { start: true };
    expect(startCBHandleInput(runtime)).toBe(true);
    expect(runtime.operations).toContain('DestroyHelpMessageWindow_()');
  });

  test('start menu callbacks wait for palette fade and run exact leave/cleanup side effects', () => {
    const runtime = createStartMenuRuntime();
    runtime.safariZoneFlag = true;
    runtime.sSafariZoneStatsWindowId = 4;
    runtime.paletteFadeActive = true;
    expect(startMenuPokedexCallback(runtime)).toBe(false);

    runtime.paletteFadeActive = false;
    expect(startMenuPokedexCallback(runtime)).toBe(true);
    expect(runtime.operations).toContain('IncrementGameStat(GAME_STAT_CHECKED_POKEDEX)');
    expect(runtime.operations).toContain('SetMainCallback2(CB2_OpenPokedexFromStartMenu)');

    runtime.operations = [];
    expect(startMenuPokemonCallback(runtime)).toBe(true);
    expect(runtime.operations).toContain('SetMainCallback2(CB2_PartyMenuFromStartMenu)');
    runtime.operations = [];
    expect(startMenuBagCallback(runtime)).toBe(true);
    expect(runtime.operations).toContain('SetMainCallback2(CB2_BagMenuFromStartMenu)');

    runtime.operations = [];
    expect(startMenuOptionCallback(runtime)).toBe(true);
    expect(runtime.gMain.savedCallback).toBe('CB2_ReturnToFieldWithOpenMenu');
    expect(runtime.operations).toContain('SetMainCallback2(CB2_OptionsMenuFromStartMenu)');

    runtime.operations = [];
    runtime.localLinkPlayerId = 2;
    expect(startMenuLinkPlayerCallback(runtime)).toBe(true);
    expect(runtime.operations).toContain('ShowTrainerCardInLink(2, CB2_ReturnToFieldWithOpenMenu)');

    runtime.operations = [];
    expect(startMenuExitCallback(runtime)).toBe(true);
    expect(runtime.playedSoundEffects.at(-1)).toBe(SE_SELECT);
    runtime.operations = [];
    expect(startMenuSafariZoneRetireCallback(runtime)).toBe(true);
    expect(runtime.operations.at(-1)).toBe('SafariZoneRetirePrompt()');

    runtime.operations = [];
    runtime.sStartMenuCallback = 'StartMenuSaveCallback';
    startMenuFadeScreenIfLeavingOverworld(runtime);
    expect(runtime.operations).toEqual([]);
    expect(startMenuSaveCallback(runtime)).toBe(false);
    expect(runtime.sStartMenuCallback).toBe('StartCB_Save1');
  });

  test('save dialog state machine follows ask, overwrite, save, success, cancel, and error branches', () => {
    const runtime = createStartMenuRuntime();
    expect(startCBSave1(runtime)).toBe(false);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_PrintAskSaveText');
    expect(runtime.sStartMenuCallback).toBe('StartCB_Save2');

    expect(saveDialogCBPrintAskSaveText(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_AskSavePrintYesNoMenu');
    expect(runtime.sSaveDialogIsPrinting).toBe(true);

    runtime.sSaveDialogIsPrinting = false;
    runtime.sSaveDialogCB = 'SaveDialogCB_AskSaveHandleInput';
    runtime.menuInput = 0;
    runtime.gSaveFileStatus = SAVE_STATUS_EMPTY;
    runtime.gDifferentSaveFile = true;
    expect(saveDialogCBAskSaveHandleInput(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_PrintSavingDontTurnOffPower');

    runtime.sSaveDialogCB = 'SaveDialogCB_AskSaveHandleInput';
    runtime.gSaveFileStatus = SAVE_STATUS_OK;
    expect(saveDialogCBAskSaveHandleInput(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_PrintAskOverwriteText');

    runtime.gDifferentSaveFile = false;
    expect(saveDialogCBPrintAskOverwriteText(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_AskOverwritePrintYesNoMenu');
    runtime.gDifferentSaveFile = true;
    expect(saveDialogCBPrintAskOverwriteText(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_AskReplacePreviousFilePrintYesNoMenu');

    runtime.menuInput = 1;
    expect(saveDialogCBAskOverwriteOrReplacePreviousFileHandleInput(runtime)).toBe(SAVECB_RETURN_CANCEL);

    expect(saveDialogCBPrintSavingDontTurnOffPower(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    runtime.gDifferentSaveFile = true;
    expect(saveDialogCBDoSave(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.gDifferentSaveFile).toBe(false);
    expect(runtime.operations).toContain(`TrySavingData(${SAVE_OVERWRITE_DIFFERENT_FILE})`);
    expect(saveDialogCBDoSave(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.operations).toContain(`TrySavingData(${SAVE_NORMAL})`);

    runtime.gSaveAttemptStatus = SAVE_STATUS_OK;
    expect(saveDialogCBPrintSaveResult(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogDelay).toBe(60);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_WaitPrintSuccessAndPlaySE');
    expect(saveDialogCBWaitPrintSuccessAndPlaySE(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.playedSoundEffects).toContain(SE_SAVE);
    runtime.input = { aHeld: true };
    expect(saveDialogCBReturnSuccess(runtime)).toBe(SAVECB_RETURN_OKAY);

    runtime.gSaveAttemptStatus = SAVE_STATUS_INVALID;
    expect(saveDialogCBPrintSaveResult(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.sSaveDialogCB).toBe('SaveDialogCB_WaitPrintErrorAndPlaySE');
    expect(saveDialogCBWaitPrintErrorAndPlaySE(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    expect(runtime.playedSoundEffects).toContain(SE_BOO);
    runtime.sSaveDialogDelay = 0;
    runtime.input = { aHeld: true };
    expect(saveDialogCBReturnError(runtime)).toBe(SAVECB_RETURN_ERROR);
  });

  test('RunSaveDialogCB, Field_AskSaveTheGame, task50_save_game, and StartCB_Save2 preserve return handling', () => {
    const runtime = createStartMenuRuntime();
    runtime.textPrinter0Active = true;
    expect(runSaveDialogCB(runtime)).toBe(SAVECB_RETURN_CONTINUE);
    runtime.textPrinter0Active = false;

    fieldAskSaveTheGame(runtime);
    expect(runtime.tasks.at(-1)?.func).toBe('task50_save_game');

    const taskId = runtime.tasks.length - 1;
    runtime.sSaveDialogCB = 'SaveDialogCB_AskSaveHandleInput';
    runtime.menuInput = -1;
    task50SaveGame(runtime, taskId);
    expect(runtime.gSpecialVar_Result).toBe(false);
    expect(runtime.operations).toContain('ScriptContext_Enable()');

    const ok = createStartMenuRuntime();
    ok.sStartMenuCallback = 'StartCB_Save2';
    ok.sSaveDialogCB = 'SaveDialogCB_ReturnSuccess';
    ok.sSaveDialogDelay = 0;
    ok.input = { aHeld: true };
    expect(startCBSave2(ok)).toBe(true);
    expect(ok.operations).toContain('UnlockPlayerFieldControls()');

    const cancel = createStartMenuRuntime();
    cancel.sSaveDialogCB = 'SaveDialogCB_AskSaveHandleInput';
    cancel.menuInput = -1;
    expect(startCBSave2(cancel)).toBe(false);
    expect(cancel.sStartMenuCallback).toBe('StartCB_HandleInput');
  });

  test('save delay helpers match A-held and countdown edge cases', () => {
    const runtime = createStartMenuRuntime();
    runtime.sSaveDialogDelay = 2;
    expect(saveDialogWait60FramesOrAButtonHeld(runtime)).toBe(false);
    expect(runtime.sSaveDialogDelay).toBe(1);
    runtime.input = { aHeld: true };
    expect(saveDialogWait60FramesOrAButtonHeld(runtime)).toBe(true);
    expect(runtime.playedSoundEffects.at(-1)).toBe(SE_SELECT);

    runtime.input = {};
    runtime.sSaveDialogDelay = 1;
    expect(saveDialogWait60FramesThenCheckAButtonHeld(runtime)).toBe(false);
    expect(runtime.sSaveDialogDelay).toBe(0);
    expect(saveDialogWait60FramesThenCheckAButtonHeld(runtime)).toBe(false);
    runtime.input = { aHeld: true };
    expect(saveDialogWait60FramesThenCheckAButtonHeld(runtime)).toBe(true);
  });

  test('link-battle save setup and save task use the exact staged branches', () => {
    const runtime = createStartMenuRuntime();
    const state = { value: 0 };
    expect(doSetUpSaveAfterLinkBattle(runtime, state)).toBe(false);
    expect(state.value).toBe(1);
    expect(runtime.operations[0]).toBe('SetGpuReg(0, 0)');
    doSetUpSaveAfterLinkBattle(runtime, state);
    doSetUpSaveAfterLinkBattle(runtime, state);
    doSetUpSaveAfterLinkBattle(runtime, state);
    expect(doSetUpSaveAfterLinkBattle(runtime, state)).toBe(true);

    const cb = createStartMenuRuntime();
    for (let i = 0; i < 5; i++) cb2SetUpSaveAfterLinkBattle(cb);
    expect(cb.tasks[0].func).toBe('task50_after_link_battle_save');
    expect(cb.operations).toContain('SetMainCallback2(CB2_WhileSavingAfterLinkBattle)');

    const taskId = cb.tasks.length - 1;
    task50AfterLinkBattleSave(cb, taskId);
    expect(cb.tasks[taskId].data[0]).toBe(1);
    task50AfterLinkBattleSave(cb, taskId);
    expect(cb.operations).toContain('WriteSaveBlock2()');
    task50AfterLinkBattleSave(cb, taskId);
    task50AfterLinkBattleSave(cb, taskId);
    task50AfterLinkBattleSave(cb, taskId);
    expect(cb.tasks).toHaveLength(0);

    const wireless = createStartMenuRuntime();
    const wirelessTask = 0;
    wireless.tasks.push({ func: 'task50_after_link_battle_save', priority: 80, data: Array(16).fill(0) });
    wireless.wirelessCommType = 1;
    wireless.inUnionRoom = true;
    task50AfterLinkBattleSave(wireless, wirelessTask);
    expect(wireless.tasks[wirelessTask].data[0]).toBe(5);
    task50AfterLinkBattleSave(wireless, wirelessTask);
    expect(wireless.tasks.at(-1)?.func).toBe('Task_LinkFullSave');
  });

  test('exports exact C start_menu names as 1:1 entry points', () => {
    const aliases: [unknown, unknown][] = [
      [startMenu.SetHasPokedexAndPokemon, setHasPokedexAndPokemon],
      [startMenu.SetUpStartMenu, setUpStartMenu],
      [startMenu.AppendToList, appendToList],
      [startMenu.SetUpStartMenu_NormalField, setUpStartMenuNormalField],
      [startMenu.SetUpStartMenu_SafariZone, setUpStartMenuSafariZone],
      [startMenu.SetUpStartMenu_Link, setUpStartMenuLink],
      [startMenu.SetUpStartMenu_UnionRoom, setUpStartMenuUnionRoom],
      [startMenu.DrawSafariZoneStatsWindow, drawSafariZoneStatsWindow],
      [startMenu.DoDrawStartMenu, doDrawStartMenu],
      [startMenu.DrawStartMenuInOneGo, drawStartMenuInOneGo],
      [startMenu.task50_startmenu, task50Startmenu],
      [startMenu.OpenStartMenuWithFollowupFunc, openStartMenuWithFollowupFunc],
      [startMenu.FieldCB2_DrawStartMenu, fieldCB2DrawStartMenu],
      [startMenu.SetUpReturnToStartMenu, setUpReturnToStartMenu],
      [startMenu.Task_StartMenuHandleInput, taskStartMenuHandleInput],
      [startMenu.ShowStartMenu, showStartMenu],
      [startMenu.StartCB_HandleInput, startCBHandleInput],
      [startMenu.StartMenu_FadeScreenIfLeavingOverworld, startMenuFadeScreenIfLeavingOverworld],
      [startMenu.StartMenuPokedexSanityCheck, startMenuPokedexSanityCheck],
      [startMenu.StartMenuPokedexCallback, startMenuPokedexCallback],
      [startMenu.StartMenuPokemonCallback, startMenuPokemonCallback],
      [startMenu.StartMenuBagCallback, startMenuBagCallback],
      [startMenu.StartMenuSaveCallback, startMenuSaveCallback],
      [startMenu.StartMenuOptionCallback, startMenuOptionCallback],
      [startMenu.StartMenuExitCallback, startMenuExitCallback],
      [startMenu.StartMenuSafariZoneRetireCallback, startMenuSafariZoneRetireCallback],
      [startMenu.StartMenuLinkPlayerCallback, startMenuLinkPlayerCallback],
      [startMenu.StartCB_Save1, startCBSave1],
      [startMenu.StartCB_Save2, startCBSave2],
      [startMenu.RunSaveDialogCB, runSaveDialogCB],
      [startMenu.Field_AskSaveTheGame, fieldAskSaveTheGame],
      [startMenu.task50_save_game, task50SaveGame],
      [startMenu.SaveDialogCB_PrintAskSaveText, saveDialogCBPrintAskSaveText],
      [startMenu.SaveDialogCB_AskSaveHandleInput, saveDialogCBAskSaveHandleInput],
      [startMenu.SaveDialogCB_PrintAskOverwriteText, saveDialogCBPrintAskOverwriteText],
      [startMenu.SaveDialogCB_PrintSavingDontTurnOffPower, saveDialogCBPrintSavingDontTurnOffPower],
      [startMenu.SaveDialogCB_DoSave, saveDialogCBDoSave],
      [startMenu.SaveDialogCB_PrintSaveResult, saveDialogCBPrintSaveResult],
      [startMenu.SaveDialogCB_WaitPrintSuccessAndPlaySE, saveDialogCBWaitPrintSuccessAndPlaySE],
      [startMenu.SaveDialogCB_ReturnSuccess, saveDialogCBReturnSuccess],
      [startMenu.SaveDialogCB_WaitPrintErrorAndPlaySE, saveDialogCBWaitPrintErrorAndPlaySE],
      [startMenu.SaveDialogCB_ReturnError, saveDialogCBReturnError],
      [startMenu.DoSetUpSaveAfterLinkBattle, doSetUpSaveAfterLinkBattle],
      [startMenu.CB2_SetUpSaveAfterLinkBattle, cb2SetUpSaveAfterLinkBattle],
      [startMenu.CB2_WhileSavingAfterLinkBattle, startMenu.cb2WhileSavingAfterLinkBattle],
      [startMenu.task50_after_link_battle_save, task50AfterLinkBattleSave],
      [startMenu.Task_50_AfterLinkBattleSave, task50AfterLinkBattleSave],
      [startMenu.PrintSaveStats, printSaveStats],
      [startMenu.CloseStartMenu, closeStartMenu]
    ];

    for (const [exactName, lowerCamel] of aliases) {
      expect(exactName).toBe(lowerCamel);
    }

    const runtime = createStartMenuRuntime();
    startMenu.VBlankCB_WhileSavingAfterLinkBattle(runtime);
    expect(runtime.operations).toEqual(['TransferPlttBuffer()']);
  });

  test('misc exported helpers preserve simple window/list behavior', () => {
    const runtime = createStartMenuRuntime();
    runtime.safariZoneFlag = true;
    drawSafariZoneStatsWindow(runtime);
    expect(runtime.sSafariZoneStatsWindowId).toBe(1);

    printSaveStats(runtime);
    expect(runtime.operations).toContain('SaveStatToString(SAVE_STAT_TIME, gStringVar4, 2)');

    closeStartMenu(runtime);
    expect(runtime.playedSoundEffects.at(-1)).toBe(SE_SELECT);

    const list = [0, 0, 0];
    const cursor = { value: 0 };
    appendToList(list, cursor, 7);
    appendToList(list, cursor, 8);
    expect(list).toEqual([7, 8, 0]);
    expect(cursor.value).toBe(2);
  });
});
