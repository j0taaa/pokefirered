import { describe, expect, it } from 'vitest';
import * as safari from '../src/game/decompBattleControllerSafari';
import {
  A_BUTTON,
  B_ACTION_SAFARI_BAIT,
  B_ACTION_SAFARI_BALL,
  B_ACTION_SAFARI_GO_NEAR,
  B_ACTION_SAFARI_RUN,
  B_ANIM_BALL_THROW_WITH_TRAINER,
  BATTLE_TYPE_IS_MASTER,
  BATTLE_TYPE_LINK,
  BALL_3_SHAKES_SUCCESS,
  CONTROLLER_BALLTHROWANIM,
  CONTROLLER_BATTLEANIMATION,
  CONTROLLER_CHOOSEACTION,
  CONTROLLER_DRAWTRAINERPIC,
  CONTROLLER_ENDLINKBATTLE,
  CONTROLLER_FAINTINGCRY,
  CONTROLLER_INTROSLIDE,
  CONTROLLER_INTROTRAINERBALLTHROW,
  CONTROLLER_OPENBAG,
  CONTROLLER_PLAYFANFARE,
  CONTROLLER_PLAYSE,
  CONTROLLER_PRINTSTRING,
  CONTROLLER_PRINTSTRINGPLAYERONLY,
  CONTROLLER_STATUSICONUPDATE,
  CONTROLLER_SUCCESSBALLTHROWANIM,
  CONTROLLER_TERMINATOR_NOP,
  DPAD_DOWN,
  DPAD_LEFT,
  DPAD_RIGHT,
  DPAD_UP,
  DISPLAY_WIDTH,
  HEALTHBOX_SAFARI_ALL_TEXT,
  HEALTHBOX_SAFARI_BALLS_TEXT,
  SOUND_PAN_ATTACKER,
  SOUND_PAN_TARGET,
  SafariBufferExecCompleted,
  SafariBufferRunCommand,
  SetControllerToSafari,
  createSafariRuntime,
  runSafariControllerFunc,
  sSafariBufferCommands,
} from '../src/game/decompBattleControllerSafari';

const armCommand = (runtime: ReturnType<typeof createSafariRuntime>, command: number, bytes: number[] = []) => {
  const battler = runtime.gActiveBattler;
  runtime.gBattleControllerExecFlags |= runtime.gBitTable[battler];
  runtime.gBattleBufferA[battler] = [command, ...bytes, 0, 0, 0, 0, 0].slice(0, 8);
};

describe('decompBattleControllerSafari', () => {
  it('exports exact C Safari handler names and preserves dummy versus completed no-op behavior', () => {
    expect(safari.SafariHandleDrawTrainerPic).toBe(safari.sSafariBufferCommands[CONTROLLER_DRAWTRAINERPIC]);
    expect(safari.SafariHandleSuccessBallThrowAnim).toBe(safari.sSafariBufferCommands[CONTROLLER_SUCCESSBALLTHROWANIM]);
    expect(safari.SafariHandleBallThrowAnim).toBe(safari.sSafariBufferCommands[CONTROLLER_BALLTHROWANIM]);
    expect(safari.SafariHandlePrintString).toBe(safari.sSafariBufferCommands[CONTROLLER_PRINTSTRING]);
    expect(safari.SafariHandlePrintSelectionString).toBe(safari.sSafariBufferCommands[CONTROLLER_PRINTSTRINGPLAYERONLY]);
    expect(safari.SafariHandleChooseAction).toBe(safari.sSafariBufferCommands[CONTROLLER_CHOOSEACTION]);
    expect(safari.SafariHandleChooseItem).toBe(safari.sSafariBufferCommands[CONTROLLER_OPENBAG]);
    expect(safari.SafariHandleStatusIconUpdate).toBe(safari.sSafariBufferCommands[CONTROLLER_STATUSICONUPDATE]);
    expect(safari.SafariHandlePlaySE).toBe(safari.sSafariBufferCommands[CONTROLLER_PLAYSE]);
    expect(safari.SafariHandlePlayFanfareOrBGM).toBe(safari.sSafariBufferCommands[CONTROLLER_PLAYFANFARE]);
    expect(safari.SafariHandleFaintingCry).toBe(safari.sSafariBufferCommands[CONTROLLER_FAINTINGCRY]);
    expect(safari.SafariHandleIntroSlide).toBe(safari.sSafariBufferCommands[CONTROLLER_INTROSLIDE]);
    expect(safari.SafariHandleIntroTrainerBallThrow).toBe(safari.sSafariBufferCommands[CONTROLLER_INTROTRAINERBALLTHROW]);
    expect(safari.SafariHandleBattleAnimation).toBe(safari.sSafariBufferCommands[CONTROLLER_BATTLEANIMATION]);
    expect(safari.SafariHandleCmd55).toBe(safari.sSafariBufferCommands[CONTROLLER_ENDLINKBATTLE]);

    for (const handler of [
      safari.SafariHandleGetMonData,
      safari.SafariHandleGetRawMonData,
      safari.SafariHandleSetMonData,
      safari.SafariHandleSetRawMonData,
      safari.SafariHandleLoadMonSprite,
      safari.SafariHandleSwitchInAnim,
      safari.SafariHandleReturnMonToBall,
      safari.SafariHandleTrainerSlide,
      safari.SafariHandleTrainerSlideBack,
      safari.SafariHandleFaintAnimation,
      safari.SafariHandlePaletteFade,
      safari.SafariHandlePause,
      safari.SafariHandleMoveAnimation,
      safari.SafariHandleUnknownYesNoBox,
      safari.SafariHandleChooseMove,
      safari.SafariHandleChoosePokemon,
      safari.SafariHandleCmd23,
      safari.SafariHandleHealthBarUpdate,
      safari.SafariHandleExpUpdate,
      safari.SafariHandleStatusAnimation,
      safari.SafariHandleStatusXor,
      safari.SafariHandleDataTransfer,
      safari.SafariHandleDMA3Transfer,
      safari.SafariHandlePlayBGM,
      safari.SafariHandleCmd32,
      safari.SafariHandleTwoReturnValues,
      safari.SafariHandleChosenMonReturnValue,
      safari.SafariHandleOneReturnValue,
      safari.SafariHandleOneReturnValue_Duplicate,
      safari.SafariHandleCmd37,
      safari.SafariHandleCmd38,
      safari.SafariHandleCmd39,
      safari.SafariHandleCmd40,
      safari.SafariHandleHitAnimation,
      safari.SafariHandleCmd42,
      safari.SafariHandleDrawPartyStatusSummary,
      safari.SafariHandleHidePartyStatusSummary,
      safari.SafariHandleEndBounceEffect,
      safari.SafariHandleSpriteInvisibility,
      safari.SafariHandleLinkStandbyMsg,
      safari.SafariHandleResetActionMoveSelection
    ]) {
      const runtime = createSafariRuntime();
      runtime.gBattleControllerExecFlags = runtime.gBitTable[0];
      handler(runtime);
      expect(runtime.gBattleControllerExecFlags).toBe(0);
    }

    const dummyRuntime = createSafariRuntime();
    dummyRuntime.gBattleControllerExecFlags = dummyRuntime.gBitTable[0];
    safari.SafariDummy(dummyRuntime);
    expect(dummyRuntime.gBattleControllerExecFlags).toBe(dummyRuntime.gBitTable[0]);
  });

  it('sets the safari controller and dispatches only while the exec bit is set', () => {
    const runtime = createSafariRuntime();
    runtime.gActiveBattler = 1;
    runtime.gBattlerControllerFuncs[1] = 'HandleInputChooseAction';

    SetControllerToSafari(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('SafariBufferRunCommand');
    expect(sSafariBufferCommands).toHaveLength(57);

    armCommand(runtime, 99);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattleControllerExecFlags & runtime.gBitTable[1]).toBe(0);

    runtime.gBattleControllerExecFlags = 0;
    armCommand(runtime, CONTROLLER_TERMINATOR_NOP);
    runtime.gBattleControllerExecFlags = 0;
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattleBufferA[1][0]).toBe(CONTROLLER_TERMINATOR_NOP);
  });

  it('completes non-link commands by clearing the active battler exec flag, but link commands transfer player id and install terminator', () => {
    const runtime = createSafariRuntime();
    runtime.gActiveBattler = 2;
    runtime.gBattleControllerExecFlags = runtime.gBitTable[2] | runtime.gBitTable[1];

    SafariBufferExecCompleted(runtime);
    expect(runtime.gBattlerControllerFuncs[2]).toBe('SafariBufferRunCommand');
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[1]);

    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    runtime.gBattleControllerExecFlags = runtime.gBitTable[2];
    runtime.multiplayerId = 3;
    runtime.gBattleBufferA[2][0] = CONTROLLER_PLAYSE;
    SafariBufferExecCompleted(runtime);
    expect(runtime.linkTransfers).toEqual([{ bufferId: 2, size: 4, data: [3] }]);
    expect(runtime.gBattleBufferA[2][0]).toBe(CONTROLLER_TERMINATOR_NOP);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[2]);
  });

  it('preserves HandleInputChooseAction cursor movement and safari action emissions', () => {
    const runtime = createSafariRuntime();
    runtime.gBattleControllerExecFlags = runtime.gBitTable[0];
    runtime.gBattlerControllerFuncs[0] = 'HandleInputChooseAction';

    runSafariControllerFunc(runtime, DPAD_RIGHT);
    expect(runtime.gActionSelectionCursor[0]).toBe(1);
    expect(runtime.operations.slice(-3)).toEqual(['PlaySE:SE_SELECT', 'ActionSelectionDestroyCursorAt:0', 'ActionSelectionCreateCursorAt:1:0']);

    runSafariControllerFunc(runtime, DPAD_DOWN);
    expect(runtime.gActionSelectionCursor[0]).toBe(3);
    runSafariControllerFunc(runtime, DPAD_LEFT);
    expect(runtime.gActionSelectionCursor[0]).toBe(2);
    runSafariControllerFunc(runtime, DPAD_UP);
    expect(runtime.gActionSelectionCursor[0]).toBe(0);

    for (const [cursor, action] of [[0, B_ACTION_SAFARI_BALL], [1, B_ACTION_SAFARI_BAIT], [2, B_ACTION_SAFARI_GO_NEAR], [3, B_ACTION_SAFARI_RUN]] as const) {
      runtime.gBattleControllerExecFlags = runtime.gBitTable[0];
      runtime.gActionSelectionCursor[0] = cursor;
      runtime.gBattlerControllerFuncs[0] = 'HandleInputChooseAction';
      runSafariControllerFunc(runtime, A_BUTTON);
      expect(runtime.emissions.at(-1)).toEqual({ type: 'two', bufferId: 1, value1: action, value2: 0 });
      expect(runtime.gBattleControllerExecFlags).toBe(0);
    }
  });

  it('draw trainer pic, ball throw, and completion callbacks match deferred C behavior', () => {
    const runtime = createSafariRuntime();
    runtime.playerGender = 1;
    runtime.trainerBackPicCoords[1] = { size: 6 };
    runtime.battlerPositions[0] = 0;
    armCommand(runtime, CONTROLLER_DRAWTRAINERPIC);
    SafariBufferRunCommand(runtime);

    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnBattlerSpriteCallbackDummy');
    const sprite = runtime.gSprites[runtime.gBattlerSpriteIds[0]];
    expect(sprite.oam.paletteNum).toBe(0);
    expect(sprite.x2).toBe(DISPLAY_WIDTH);
    expect(sprite.data[0]).toBe(-2);
    expect(sprite.callback).toBe('SpriteCB_TrainerSlideIn');
    expect(runtime.operations).toContain('SetMultiuseSpriteTemplateToTrainerBack:1:0');
    expect(runtime.operations).toContain('CreateSprite:gMultiuseSpriteTemplate:80:88:30');
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[0]);
    sprite.callback = 'SpriteCallbackDummy';
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    armCommand(runtime, CONTROLLER_SUCCESSBALLTHROWANIM);
    SafariBufferRunCommand(runtime);
    expect(runtime.ballThrowCaseId).toBe(BALL_3_SHAKES_SUCCESS);
    expect(runtime.gDoingBattleAnim).toBe(true);
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:0:0:1:${B_ANIM_BALL_THROW_WITH_TRAINER}`);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnSpecialAnimDone');
    runtime.specialAnimActive[0] = true;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[0]);
    runtime.gDoingBattleAnim = false;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    armCommand(runtime, CONTROLLER_BALLTHROWANIM, [7]);
    SafariBufferRunCommand(runtime);
    expect(runtime.ballThrowCaseId).toBe(7);
  });

  it('prints strings, gates player-only selection strings, and enters choose-action/menu states', () => {
    const runtime = createSafariRuntime();
    runtime.coloredStringIds.add(0x1234);
    armCommand(runtime, CONTROLLER_PRINTSTRING, [0, 0x34, 0x12]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattle_BG0_X).toBe(0);
    expect(runtime.gBattle_BG0_Y).toBe(0);
    expect(runtime.gDisplayedStringBattle).toBe('String:4660');
    expect(runtime.operations).toContain('BattlePutTextOnWindow:String:4660:B_WIN_MSG|NPC');
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnInactiveTextPrinter');
    runtime.textPrinterActive = true;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[0]);
    runtime.textPrinterActive = false;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    runtime.gActiveBattler = 1;
    runtime.battlerSides[1] = 1;
    armCommand(runtime, CONTROLLER_PRINTSTRINGPLAYERONLY, [0, 1, 0]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattleControllerExecFlags & runtime.gBitTable[1]).toBe(0);

    runtime.gActiveBattler = 0;
    runtime.gActionSelectionCursor[0] = 2;
    armCommand(runtime, CONTROLLER_CHOOSEACTION);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('HandleChooseActionAfterDma3');
    expect(runtime.operations).toContain('BattlePutTextOnWindow:gText_SafariZoneMenu:B_WIN_ACTION_MENU');
    expect(runtime.operations).toContain('ActionSelectionCreateCursorAt:2:0');
    runtime.dma3Busy = true;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('HandleChooseActionAfterDma3');
    runtime.dma3Busy = false;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattle_BG0_Y).toBe(160);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('HandleInputChooseAction');

    armCommand(runtime, CONTROLLER_OPENBAG);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('SafariOpenPokeblockCase');
    expect(runtime.gBattlerInMenuId).toBe(0);
    expect(runtime.operations.at(-1)).toBe('BeginNormalPaletteFade:4294967295:0:0:16:0');
    runtime.paletteFadeActive = true;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('SafariOpenPokeblockCase');
    runtime.paletteFadeActive = false;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteWhenChosePokeblock');
    runtime.gSpecialVar_ItemId = 42;
    runSafariControllerFunc(runtime);
    expect(runtime.emissions.at(-1)).toEqual({ type: 'one', bufferId: 1, value1: 42 });
  });

  it('runs sound, fanfare, cry, intro, healthbox, battle animation, and end-link handlers with exact side effects', () => {
    const runtime = createSafariRuntime();
    runtime.gBattleBufferA[0] = [CONTROLLER_PLAYSE, 0x34, 0x12, 0, 0, 0, 0, 0];
    runtime.gBattleControllerExecFlags = runtime.gBitTable[0];
    SafariBufferRunCommand(runtime);
    expect(runtime.operations.at(-1)).toBe(`PlaySE12WithPanning:4660:${SOUND_PAN_ATTACKER}`);

    runtime.gActiveBattler = 1;
    runtime.battlerSides[1] = 1;
    runtime.gBattleBufferA[1] = [CONTROLLER_PLAYSE, 0x78, 0x56, 0, 0, 0, 0, 0];
    runtime.gBattleControllerExecFlags = runtime.gBitTable[1];
    SafariBufferRunCommand(runtime);
    expect(runtime.operations.at(-1)).toBe(`PlaySE12WithPanning:22136:${SOUND_PAN_TARGET}`);

    runtime.gActiveBattler = 0;
    armCommand(runtime, CONTROLLER_PLAYFANFARE, [0x01, 0x02]);
    SafariBufferRunCommand(runtime);
    expect(runtime.operations.at(-1)).toBe('PlayFanfare:513');

    runtime.playerParty[3] = { species: 25, hp: 10 };
    runtime.battlerPartyIndexes[0] = 3;
    armCommand(runtime, CONTROLLER_FAINTINGCRY);
    SafariBufferRunCommand(runtime);
    expect(runtime.operations.at(-1)).toBe('PlayCry_Normal:25:25');

    armCommand(runtime, CONTROLLER_INTROSLIDE, [9]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gIntroSlideFlags).toBe(1);
    expect(runtime.operations.at(-1)).toBe('HandleIntroSlide:9');

    armCommand(runtime, CONTROLLER_STATUSICONUPDATE);
    SafariBufferRunCommand(runtime);
    expect(runtime.operations.at(-1)).toBe(`UpdateHealthboxAttribute:${runtime.gHealthboxSpriteIds[0]}:3:${HEALTHBOX_SAFARI_BALLS_TEXT}`);

    armCommand(runtime, CONTROLLER_INTROTRAINERBALLTHROW);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnHealthboxSpriteCallbackDummy');
    expect(runtime.operations).toContain(`UpdateHealthboxAttribute:${runtime.gHealthboxSpriteIds[0]}:3:${HEALTHBOX_SAFARI_ALL_TEXT}`);
    runtime.gSprites[runtime.gHealthboxSpriteIds[0]].callback = 'SlideIn';
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[0]);
    runtime.gSprites[runtime.gHealthboxSpriteIds[0]].callback = 'SpriteCallbackDummy';
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    runtime.tryHandleBattleTableAnimationResult = true;
    armCommand(runtime, CONTROLLER_BATTLEANIMATION, [5, 0x34, 0x12]);
    SafariBufferRunCommand(runtime);
    expect(runtime.operations.at(-1)).toBe('TryHandleLaunchBattleTableAnimation:0:0:0:5:4660');
    expect(runtime.gBattleControllerExecFlags).toBe(0);
    runtime.tryHandleBattleTableAnimationResult = false;
    armCommand(runtime, CONTROLLER_BATTLEANIMATION, [6, 1, 0]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnFinishedBattleAnimation');
    runtime.animFromTableActive[0] = true;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[0]);
    runtime.animFromTableActive[0] = false;
    runSafariControllerFunc(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);
  });

  it('end link battle sets outcome, fades, and only slave link battles install battle-end callback', () => {
    const runtime = createSafariRuntime();

    armCommand(runtime, CONTROLLER_ENDLINKBATTLE, [7]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattleOutcome).toBe(7);
    expect(runtime.operations.slice(-2)).toEqual(['FadeOutMapMusic:5', 'BeginFastPaletteFade:3']);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('SafariBufferRunCommand');

    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK | BATTLE_TYPE_IS_MASTER;
    armCommand(runtime, CONTROLLER_ENDLINKBATTLE, [8]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('SafariBufferRunCommand');

    runtime.gBattleTypeFlags = BATTLE_TYPE_LINK;
    armCommand(runtime, CONTROLLER_ENDLINKBATTLE, [9]);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattleOutcome).toBe(9);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('Safari_SetBattleEndCallbacks');
    runtime.paletteFadeActive = true;
    runSafariControllerFunc(runtime);
    expect(runtime.gMainInBattle).toBe(true);
    runtime.paletteFadeActive = false;
    runSafariControllerFunc(runtime);
    expect(runtime.gMainInBattle).toBe(false);
    expect(runtime.gMainCallback1).toBe(runtime.gPreBattleCallback1);
    expect(runtime.operations.at(-1)).toBe(`SetMainCallback2:${runtime.gMainSavedCallback}`);
  });

  it('immediate no-op command slots complete, while command end is intentionally empty', () => {
    const runtime = createSafariRuntime();

    for (const command of [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 14, 15, 19, 20, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 48, 49, 50, 51, 53, 54]) {
      armCommand(runtime, command);
      SafariBufferRunCommand(runtime);
      expect(runtime.gBattleControllerExecFlags).toBe(0);
    }

    armCommand(runtime, CONTROLLER_TERMINATOR_NOP);
    SafariBufferRunCommand(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(runtime.gBitTable[0]);
  });
});
