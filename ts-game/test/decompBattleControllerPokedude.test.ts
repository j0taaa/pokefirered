import { describe, expect, test } from 'vitest';
import {
  B_ACTION_EXEC_SCRIPT,
  B_ACTION_SWITCH,
  B_SIDE_OPPONENT,
  BATTLE_TYPE_LINK_REAL,
  BATTLE_TYPE_POKEDUDE,
  CONTROLLER_BATTLEANIMATION,
  CONTROLLER_CHOOSEACTION,
  CONTROLLER_GETMONDATA,
  CONTROLLER_GETRAWMONDATA,
  CONTROLLER_HEALTHBARUPDATE,
  CONTROLLER_HITANIMATION,
  CONTROLLER_LOADMONSPRITE,
  CONTROLLER_MOVEANIMATION,
  CONTROLLER_PLAYSE,
  CONTROLLER_EXPUPDATE,
  CONTROLLER_TERMINATOR_NOP,
  CONTROLLER_TWORETURNVALUES,
  GetPokedudeText,
  HandlePokedudeVoiceoverEtc,
  InitPokedudePartyAndOpponent,
  MOVE_CONFUSION,
  MOVE_POISON_POWDER,
  PokedudeBufferExecCompleted,
  PokedudeBufferRunCommand,
  PokedudeHandleBallThrowAnim,
  PokedudeHandleChooseAction,
  PokedudeHandleChooseItem,
  PokedudeHandleChooseMove,
  PokedudeHandleDrawTrainerPic,
  PokedudeHandleFaintAnimation,
  PokedudeHandleIntroTrainerBallThrow,
  PokedudeHandleSetMonData,
  PokedudeHandleStatusXor,
  SPECIES_BUTTERFREE,
  SPECIES_JIGGLYPUFF,
  REQUEST_SPECIES_BATTLE,
  REQUEST_STATUS_BATTLE,
  SetControllerToPokedude,
  TTVSCR_BATTLE,
  TTVSCR_CATCHING,
  TTVSCR_MATCHUPS,
  TTVSCR_STATUS,
  createLinkPartnerMon,
  createPokedudeRuntime,
  runPokedudeControllerFunc,
  runPokedudeTask,
  gPokedudeText,
  sInputScripts_ChooseAction,
  sInputScripts_ChooseMove,
  sPokedudeTexts_Battle,
  sPokedudeTexts_Catching,
  sPokedudeTexts_Status,
  sPokedudeTexts_TypeMatchup,
  sPokedudeTextScripts
} from '../src/game/decompBattleControllerPokedude';

describe('decomp battle_controller_pokedude', () => {
  test('setup and completion preserve Pokedude controller/link behavior', () => {
    const runtime = createPokedudeRuntime({ gSpecialVar_0x8004: TTVSCR_STATUS });
    SetControllerToPokedude(runtime);
    expect(runtime.gBattleStruct.pdScriptNum).toBe(TTVSCR_STATUS);
    expect(runtime.gBattleStruct.pdMessageNo).toBe(0);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeBufferRunCommand');

    PokedudeBufferExecCompleted(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    const linkRuntime = createPokedudeRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK_REAL, multiplayerId: 3 });
    PokedudeBufferExecCompleted(linkRuntime);
    expect(linkRuntime.gBattleBufferA[0][0]).toBe(CONTROLLER_TERMINATOR_NOP);
    expect(linkRuntime.emittedTransfers).toEqual([{ buffer: 'link', size: 4, data: [3] }]);
  });

  test('input and text script tables match the decompiled script sentinels', () => {
    expect(sInputScripts_ChooseAction[TTVSCR_BATTLE].at(-1)?.cursorPos).toEqual([4, 4]);
    expect(sInputScripts_ChooseMove[TTVSCR_MATCHUPS].at(-1)?.cursorPos).toEqual([255, 255]);
    expect(sPokedudeTextScripts[TTVSCR_STATUS][0]).toMatchObject({ btlcmd: CONTROLLER_CHOOSEACTION, callback: null });
    expect(sPokedudeTextScripts[TTVSCR_MATCHUPS][2]).toMatchObject({ btlcmd: 22, callback: 'PokedudeAction_PrintVoiceoverMessage' });
  });

  test('pokedude text pointer tables and text source mirror the decompiled arrays', () => {
    expect(sPokedudeTexts_Battle).toEqual([
      'Pokedude_Text_SpeedierBattlerGoesFirst',
      'Pokedude_Text_MyRattataFasterThanPidgey',
      'Pokedude_Text_BattlersTakeTurnsAttacking',
      'Pokedude_Text_MyRattataWonGetsEXP'
    ]);
    expect(sPokedudeTexts_Status).toEqual([
      'Pokedude_Text_UhOhRattataPoisoned',
      'Pokedude_Text_UhOhRattataPoisoned',
      'Pokedude_Text_HealStatusRightAway',
      'Pokedude_Text_UsingItemTakesTurn',
      'Pokedude_Text_YayWeManagedToWin'
    ]);
    expect(sPokedudeTexts_TypeMatchup.at(-1)).toBe('Pokedude_Text_YeahWeWon');
    expect(sPokedudeTexts_Catching).toHaveLength(6);
    expect(gPokedudeText).toHaveLength(20);

    const runtime = createPokedudeRuntime({ gBattleStruct: { pdHealthboxPal1: 0, pdHealthboxPal2: 0, pdScriptNum: TTVSCR_BATTLE, pdMessageNo: 1, battlerPreventingSwitchout: 0, playerPartyIdx: 0, abilityPreventingSwitchout: 0 } });
    expect(GetPokedudeText(runtime)).toContain('POKé DUDE: The speedier');
    runtime.gBattleStruct.pdScriptNum = TTVSCR_CATCHING;
    runtime.gBattleStruct.pdMessageNo = 6;
    expect(GetPokedudeText(runtime)).toContain('pick the kind\\l');
  });

  test('voiceover interception advances message number and suppresses command handler when callback exists', () => {
    const runtime = createPokedudeRuntime({ gBattleStruct: { pdHealthboxPal1: 0, pdHealthboxPal2: 0, pdScriptNum: TTVSCR_BATTLE, pdMessageNo: 0, battlerPreventingSwitchout: 0, playerPartyIdx: 0, abilityPreventingSwitchout: 0 } });
    runtime.gBattleBufferA[0][0] = CONTROLLER_CHOOSEACTION;

    expect(HandlePokedudeVoiceoverEtc(runtime)).toBe(true);
    expect(runtime.gBattleStruct.pdMessageNo).toBe(1);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeAction_PrintVoiceoverMessage');

    runPokedudeControllerFunc(runtime);
    runPokedudeControllerFunc(runtime);
    runPokedudeControllerFunc(runtime);
    runPokedudeControllerFunc(runtime, 1);
    runPokedudeControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeBufferRunCommand');
    expect(runtime.operations).toContain('BtlCtrl_DrawVoiceoverMessageFrame');
  });

  test('null voiceover callback falls through to the normal command handler', () => {
    const runtime = createPokedudeRuntime({ gBattleStruct: { pdHealthboxPal1: 0, pdHealthboxPal2: 0, pdScriptNum: TTVSCR_STATUS, pdMessageNo: 0, battlerPreventingSwitchout: 0, playerPartyIdx: 0, abilityPreventingSwitchout: 0 } });
    runtime.gBattleBufferA[0][0] = CONTROLLER_CHOOSEACTION;

    PokedudeBufferRunCommand(runtime);

    expect(runtime.gBattleStruct.pdMessageNo).toBe(1);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('HandleChooseActionAfterDma3');
  });

  test('scripted action and move input emit exact return values and wrap at sentinels', () => {
    const runtime = createPokedudeRuntime({ gBattleStruct: { pdHealthboxPal1: 0, pdHealthboxPal2: 0, pdScriptNum: TTVSCR_MATCHUPS, pdMessageNo: 0, battlerPreventingSwitchout: 0, playerPartyIdx: 0, abilityPreventingSwitchout: 0 } });
    runtime.gBattlerControllerFuncs[0] = 'HandleInputChooseAction';
    for (let i = 0; i < 65; i++) runPokedudeControllerFunc(runtime);
    expect(runtime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [0, 0, 0] });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattlerControllerFuncs[0] = 'HandleInputChooseAction';
    for (let i = 0; i < 65; i++) runPokedudeControllerFunc(runtime);
    expect(runtime.gActionSelectionCursor[0]).toBe(2);
    expect(runtime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [B_ACTION_SWITCH, 0, 0] });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattlerControllerFuncs[0] = 'PokedudeHandleInputChooseMove';
    for (let i = 0; i < 65; i++) runPokedudeControllerFunc(runtime);
    expect(runtime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [B_ACTION_EXEC_SCRIPT, 2, 1] });
  });

  test('choose action/move split player side UI from opponent immediate simulation', () => {
    const player = createPokedudeRuntime();
    PokedudeHandleChooseAction(player);
    expect(player.gBattlerControllerFuncs[0]).toBe('HandleChooseActionAfterDma3');
    expect(player.operations).toContain('BattlePutTextOnWindow:gText_BattleMenu:B_WIN_ACTION_MENU');

    const opponent = createPokedudeRuntime({ gActiveBattler: 1, gBattleControllerExecFlags: 2, battlerSides: [0, B_SIDE_OPPONENT, 0, 1] });
    PokedudeHandleChooseAction(opponent);
    expect(opponent.gBattlerControllerFuncs[1]).toBe('HandleInputChooseAction');

    PokedudeHandleChooseMove(player);
    expect(player.gBattlerControllerFuncs[0]).toBe('PokedudeHandleChooseMoveAfterDma3');
    expect(player.operations).toContain('InitMoveSelectionsVarsAndStrings');
    PokedudeHandleChooseMove(opponent);
    expect(opponent.gBattlerControllerFuncs[1]).toBe('PokedudeHandleInputChooseMove');
  });

  test('mon data selects player or enemy party by battler side and choose item stores current order', () => {
    const runtime = createPokedudeRuntime({
      gEnemyParty: [createLinkPartnerMon({ species: 0x456 }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())],
      gPlayerParty: [createLinkPartnerMon({ species: 0x123 }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())],
      gActiveBattler: 1,
      gBattleControllerExecFlags: 2,
      gBattlerPartyIndexes: [0, 0, 0, 0],
      battlerSides: [0, B_SIDE_OPPONENT, 0, 1]
    });
    runtime.gBattleBufferA[1][0] = CONTROLLER_GETMONDATA;
    runtime.gBattleBufferA[1][1] = REQUEST_SPECIES_BATTLE;
    PokedudeBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 2, data: [0x56, 0x04] });

    const itemRuntime = createPokedudeRuntime();
    itemRuntime.gBattleBufferA[0].splice(1, 3, 5, 4, 3);
    PokedudeHandleChooseItem(itemRuntime);
    expect(itemRuntime.gBattlePartyCurrentOrder).toEqual([5, 4, 3]);
    expect(itemRuntime.gBattlerControllerFuncs[0]).toBe('OpenBagAndChooseItem');
  });

  test('raw mon data uses PlayerHandleGetRawMonData semantics', () => {
    const runtime = createPokedudeRuntime({
      gPlayerParty: [createLinkPartnerMon({ raw: [1, 2, 3, 4, 5, 6] }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())],
      gEnemyParty: [createLinkPartnerMon({ raw: [9, 9, 9, 9, 9, 9] }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())],
      gActiveBattler: 1,
      gBattleControllerExecFlags: 2,
      gBattlerPartyIndexes: [0, 0, 0, 0],
      battlerSides: [0, B_SIDE_OPPONENT, 0, 1]
    });
    runtime.gBattleBufferA[1][0] = CONTROLLER_GETRAWMONDATA;
    runtime.gBattleBufferA[1][1] = 2;
    runtime.gBattleBufferA[1][2] = 3;
    PokedudeBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 3, data: [3, 4, 5] });
  });

  test('ported mon mutation and status xor select the same side-specific party as C', () => {
    const runtime = createPokedudeRuntime({
      gActiveBattler: 1,
      gBattleControllerExecFlags: 2,
      gBattlerPartyIndexes: [0, 0, 0, 0],
      battlerSides: [0, B_SIDE_OPPONENT, 0, 1],
      gEnemyParty: [createLinkPartnerMon({ status1: 0x12, species: 1 }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())]
    });
    runtime.gBattleBufferA[1][1] = REQUEST_STATUS_BATTLE;
    runtime.gBattleBufferA[1][2] = 0;
    runtime.gBattleBufferA[1].splice(3, 4, 0x78, 0x56, 0x34, 0x12);

    PokedudeHandleSetMonData(runtime);
    expect(runtime.gEnemyParty[0].status1).toBe(0x12345678);

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = 0x70;
    PokedudeHandleStatusXor(runtime);
    expect(runtime.gEnemyParty[0].status1).toBe(0x12345608);
  });

  test('sprite, trainer, faint, move, health, sound, and battle animation handlers keep C callbacks', () => {
    const runtime = createPokedudeRuntime({
      gEnemyParty: [createLinkPartnerMon({ species: 0x99 }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())],
      moveBattleBarResults: [12, -1],
      tryHandleBattleAnimationResult: false
    });

    runtime.gBattleBufferA[0][0] = CONTROLLER_LOADMONSPRITE;
    PokedudeBufferRunCommand(runtime);
    expect(runtime.operations).toContain('BattleLoadOpponentMonSpriteGfx:0');
    expect(runtime.gSprites[0].x2).toBe(-240);

    runtime.gBattleControllerExecFlags = 1;
    PokedudeHandleDrawTrainerPic(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnBattlerSpriteCallbackDummy');

    PokedudeHandleFaintAnimation(runtime);
    PokedudeHandleFaintAnimation(runtime);
    expect(runtime.gSprites[0].callback).toBe('SpriteCB_FaintSlideAnim');
    expect(runtime.gBattlerControllerFuncs[0]).toBe('FreeMonSpriteAfterFaintAnim');

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][0] = CONTROLLER_MOVEANIMATION;
    runtime.gBattleBufferA[0].splice(1, 19, 0x21, 0, 1, 9, 0, 5, 0, 0, 0, 70, 0, 3, 0, 0, 0, 0xef, 0xbe, 0xad, 0xde);
    PokedudeBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeDoMoveAnimation');
    expect(runtime.gTransformedPersonalities[0]).toBe(0xdeadbeef);
    runPokedudeControllerFunc(runtime);
    runPokedudeControllerFunc(runtime);
    runPokedudeControllerFunc(runtime);
    runPokedudeControllerFunc(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeBufferRunCommand');

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][0] = CONTROLLER_HEALTHBARUPDATE;
    runtime.gBattleBufferA[0].splice(2, 2, 5, 0);
    PokedudeBufferRunCommand(runtime);
    expect(runtime.operations).toContain('SetBattleBarStruct:0:20:18:5');

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][0] = CONTROLLER_PLAYSE;
    runtime.gBattleBufferA[0].splice(1, 2, 0x34, 0x12);
    PokedudeBufferRunCommand(runtime);
    expect(runtime.sounds.at(-1)).toEqual({ kind: 'SE', id: 0x1234 });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][0] = CONTROLLER_BATTLEANIMATION;
    runtime.gBattleBufferA[0].splice(1, 3, 7, 0x44, 0x33);
    PokedudeBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnFinishedBattleAnimation');
  });

  test('intro ball throw, ball throw animation, hit blink, and party tables match decompiled flow', () => {
    const runtime = createPokedudeRuntime({ gSpecialVar_0x8004: TTVSCR_CATCHING });
    InitPokedudePartyAndOpponent(runtime);
    expect(runtime.gBattleTypeFlags).toBe(BATTLE_TYPE_POKEDUDE);
    expect(runtime.gPlayerParty[0].species).toBe(SPECIES_BUTTERFREE);
    expect(runtime.gPlayerParty[0].moves.slice(0, 2)).toEqual([MOVE_CONFUSION, MOVE_POISON_POWDER]);
    expect(runtime.gEnemyParty[0].species).toBe(SPECIES_JIGGLYPUFF);

    PokedudeHandleIntroTrainerBallThrow(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeDummy');
    expect(runtime.gTasks.at(-1)?.func).toBe('Task_StartSendOutAnim');

    PokedudeHandleBallThrowAnim(runtime);
    expect(runtime.gDoingBattleAnim).toBe(true);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('CompleteOnSpecialAnimDone');

    runtime.gBattleControllerExecFlags = 1;
    runtime.gDoingBattleAnim = false;
    runtime.gBattleBufferA[0][0] = CONTROLLER_HITANIMATION;
    PokedudeBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('DoHitAnimBlinkSpriteEffect');
    for (let i = 0; i < 33; i++) runPokedudeControllerFunc(runtime);
    expect(runtime.gDoingBattleAnim).toBe(false);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('PokedudeBufferRunCommand');
  });

  test('exp update task follows no-bar, exp-bar, and level-up branches', () => {
    const boxedRuntime = createPokedudeRuntime({
      gPlayerParty: [
        createLinkPartnerMon({ level: 15, experience: 100, species: 19 }),
        createLinkPartnerMon({ level: 15, experience: 100, species: 12 }),
        ...Array.from({ length: 4 }, () => createLinkPartnerMon())
      ],
      gBattlerPartyIndexes: [0, 0, 0, 0]
    });
    Object.assign(boxedRuntime.gPlayerParty[1], { nextLevelExp: 150 });
    boxedRuntime.gBattleBufferA[0][0] = CONTROLLER_EXPUPDATE;
    boxedRuntime.gBattleBufferA[0].splice(1, 3, 1, 20, 0);
    PokedudeBufferRunCommand(boxedRuntime);
    expect(boxedRuntime.gTasks[0].func).toBe('Task_GiveExpToMon');
    runPokedudeTask(boxedRuntime, 0);
    expect(boxedRuntime.gPlayerParty[1].experience).toBe(120);
    expect(boxedRuntime.gTasks[0].destroyed).toBe(true);
    expect(boxedRuntime.gBattlerControllerFuncs[0]).toBe('CompleteOnInactiveTextPrinter2');

    const barRuntime = createPokedudeRuntime({
      gPlayerParty: [createLinkPartnerMon({ level: 15, experience: 100, species: 19 }), ...Array.from({ length: 5 }, () => createLinkPartnerMon())],
      gBattlerPartyIndexes: [0, 0, 0, 0],
      moveBattleBarResults: [-1]
    });
    Object.assign(barRuntime.gPlayerParty[0], { currentLevelExp: 90, nextLevelExp: 120 });
    barRuntime.gBattleBufferA[0][0] = CONTROLLER_EXPUPDATE;
    barRuntime.gBattleBufferA[0].splice(1, 3, 0, 30, 0);
    PokedudeBufferRunCommand(barRuntime);
    runPokedudeTask(barRuntime, 0);
    expect(barRuntime.gTasks[0].func).toBe('Task_PrepareToGiveExpWithExpBar');
    runPokedudeTask(barRuntime, 0);
    expect(barRuntime.gTasks[0].func).toBe('Task_GiveExpWithExpBar');
    barRuntime.gTasks[0].data[10] = 13;
    runPokedudeTask(barRuntime, 0);
    expect(barRuntime.gPlayerParty[0].level).toBe(16);
    expect(barRuntime.emittedControllerValues.at(-1)).toEqual({ cmd: CONTROLLER_TWORETURNVALUES, bufferId: 1, data: [1, 10, 0] });
    expect(barRuntime.gTasks[0].func).toBe('Task_LaunchLvlUpAnim');
    runPokedudeTask(barRuntime, 0);
    expect(barRuntime.gTasks[0].func).toBe('Task_UpdateLvlInHealthbox');
    runPokedudeTask(barRuntime, 0);
    expect(barRuntime.gTasks[0].func).toBe('DestroyExpTaskAndCompleteOnInactiveTextPrinter');
    runPokedudeTask(barRuntime, 0);
    expect(barRuntime.gTasks[0].destroyed).toBe(true);
    expect(barRuntime.gBattlerControllerFuncs[0]).toBe('CompleteOnInactiveTextPrinter2');
  });
});
