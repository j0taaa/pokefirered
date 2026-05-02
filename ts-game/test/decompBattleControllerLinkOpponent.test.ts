import { describe, expect, test } from 'vitest';
import {
  B_ANIM_MON_TO_SUBSTITUTE,
  B_ANIM_SUBSTITUTE_TO_MON,
  B_ANIM_SWITCH_OUT_OPPONENT_MON,
  B_OUTCOME_DREW,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_MULTI,
  CONTROLLER_GETMONDATA,
  CONTROLLER_HITANIMATION,
  CONTROLLER_LOADMONSPRITE,
  CONTROLLER_RETURNMONTOBALL,
  CONTROLLER_TERMINATOR_NOP,
  FACILITY_CLASS_PKMN_TRAINER_MAY,
  LinkOpponentBufferExecCompleted,
  LinkOpponentBufferRunCommand,
  LinkOpponentHandleBattleAnimation,
  LinkOpponentHandleDrawPartyStatusSummary,
  LinkOpponentHandleEndLinkBattle,
  LinkOpponentHandleFaintAnimation,
  LinkOpponentHandleMoveAnimation,
  LinkOpponentHandlePlaySE,
  LinkOpponentHandleSetMonData,
  LinkOpponentHandleSetRawMonData,
  LinkOpponentHandleStatusIconUpdate,
  LinkOpponentHandleSwitchInAnim,
  LinkOpponentHandleToggleUnkFlag,
  LinkOpponentDoMoveAnimation,
  MALE,
  REQUEST_ALL_IVS_BATTLE,
  REQUEST_EXP_BATTLE,
  REQUEST_HP_BATTLE,
  REQUEST_MOVES_PP_BATTLE,
  REQUEST_SPECIES_BATTLE,
  SOUND_PAN_TARGET,
  Task_StartSendOutAnim,
  TRAINER_UNION_ROOM,
  callLinkOpponentControllerFunc,
  createLinkOpponentRuntime,
  createLinkPartnerMon
} from '../src/game/decompBattleControllerLinkOpponent';

describe('decomp battle_controller_link_opponent', () => {
  test('command dispatch and link completion use LinkOpponent controller state', () => {
    const runtime = createLinkOpponentRuntime();
    runtime.gBattleBufferA[1][0] = 255;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('LinkOpponentBufferRunCommand');

    const linkRuntime = createLinkOpponentRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK, multiplayerId: 3 });
    LinkOpponentBufferExecCompleted(linkRuntime);
    expect(linkRuntime.gBattleControllerExecFlags).toBe(2);
    expect(linkRuntime.gBattleBufferA[1][0]).toBe(CONTROLLER_TERMINATOR_NOP);
    expect(linkRuntime.emittedTransfers).toEqual([{ buffer: 'link', size: 4, data: [3] }]);
  });

  test('get/set mon data targets gEnemyParty instead of gPlayerParty', () => {
    const runtime = createLinkOpponentRuntime({
      gEnemyParty: [
        createLinkPartnerMon({
          species: 0x456,
          moves: [0x111, 0x222, 0x333, 0x444],
          pp: [9, 8, 7, 6],
          ppBonuses: 0x55,
          experience: 0x654321,
          hp: 33,
          hpIV: 11,
          attackIV: 12,
          defenseIV: 13,
          speedIV: 14,
          spAttackIV: 15,
          spDefenseIV: 16
        }),
        ...Array.from({ length: 5 }, () => createLinkPartnerMon())
      ],
      gBattlerPartyIndexes: [0, 0, 2, 3]
    });

    runtime.gBattleBufferA[1][0] = CONTROLLER_GETMONDATA;
    runtime.gBattleBufferA[1][1] = REQUEST_MOVES_PP_BATTLE;
    runtime.gBattleBufferA[1][2] = 0;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({
      buffer: 'B',
      size: 13,
      data: [0x11, 0x01, 0x22, 0x02, 0x33, 0x03, 0x44, 0x04, 9, 8, 7, 6, 0x55]
    });

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][0] = CONTROLLER_GETMONDATA;
    runtime.gBattleBufferA[1][1] = REQUEST_SPECIES_BATTLE;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 2, data: [0x56, 0x04] });

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = REQUEST_EXP_BATTLE;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 3, data: [0x21, 0x43, 0x65] });

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = REQUEST_HP_BATTLE;
    runtime.gBattleBufferA[1][2] = 0;
    runtime.gBattleBufferA[1][3] = 0x78;
    runtime.gBattleBufferA[1][4] = 0x56;
    LinkOpponentHandleSetMonData(runtime);
    expect(runtime.gEnemyParty[0].hp).toBe(0x5678);

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = REQUEST_ALL_IVS_BATTLE;
    runtime.gBattleBufferA[1][3] = 1;
    runtime.gBattleBufferA[1][4] = 2;
    runtime.gBattleBufferA[1][5] = 3;
    runtime.gBattleBufferA[1][6] = 4;
    runtime.gBattleBufferA[1][7] = 5;
    runtime.gBattleBufferA[1][8] = 6;
    LinkOpponentHandleSetMonData(runtime);
    expect(runtime.gEnemyParty[0]).toMatchObject({ hpIV: 1, attackIV: 2, defenseIV: 3, speedIV: 4, spAttackIV: 5, spDefenseIV: 6 });

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = 4;
    runtime.gBattleBufferA[1][2] = 3;
    runtime.gBattleBufferA[1][3] = 7;
    runtime.gBattleBufferA[1][4] = 8;
    runtime.gBattleBufferA[1][5] = 9;
    LinkOpponentHandleSetRawMonData(runtime);
    expect(runtime.gEnemyParty[0].raw.slice(4, 7)).toEqual([7, 8, 9]);
  });

  test('load, shiny, switch-in, return-to-ball, and faint callbacks follow opponent branches', () => {
    const runtime = createLinkOpponentRuntime();
    runtime.gBattleBufferA[1][0] = CONTROLLER_LOADMONSPRITE;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('TryShinyAnimAfterMonAnim');
    expect(runtime.operations).toContain('BattleLoadOpponentMonSpriteGfx:1');
    expect(runtime.operations).toContain('SetBattlerShadowSpriteCallback:1:102');

    runtime.gSprites[runtime.gBattlerSpriteIds[1]].x2 = 0;
    callLinkOpponentControllerFunc(runtime, 'TryShinyAnimAfterMonAnim');
    expect(runtime.operations).toContain('TryShinyAnimation:1');
    runtime.gBattleSpritesDataPtr.healthBoxesData[1].triedShinyMonAnim = true;
    runtime.gBattleSpritesDataPtr.healthBoxesData[1].finishedShinyMonAnim = true;
    callLinkOpponentControllerFunc(runtime, 'TryShinyAnimAfterMonAnim');
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = 2;
    runtime.gBattleBufferA[1][2] = 1;
    LinkOpponentHandleSwitchInAnim(runtime);
    expect(runtime.gBattlerPartyIndexes[1]).toBe(2);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('SwitchIn_TryShinyAnim');
    expect(runtime.operations).toContain('DoPokeballSendOutAnimation:0:POKEBALL_OPPONENT_SENDOUT');

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][0] = CONTROLLER_RETURNMONTOBALL;
    runtime.gBattleBufferA[1][1] = 0;
    runtime.gBattleSpritesDataPtr.battlerData[1].behindSubstitute = true;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('DoSwitchOutAnimation');
    callLinkOpponentControllerFunc(runtime, 'DoSwitchOutAnimation');
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
    callLinkOpponentControllerFunc(runtime, 'DoSwitchOutAnimation');
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_SWITCH_OUT_OPPONENT_MON}`);

    runtime.gBattleControllerExecFlags = 2;
    LinkOpponentHandleFaintAnimation(runtime);
    expect(runtime.gBattleSpritesDataPtr.healthBoxesData[1].animationState).toBe(1);
    LinkOpponentHandleFaintAnimation(runtime);
    expect(runtime.sounds.at(-1)).toEqual({ kind: 'SE_PAN', id: 171, pan: SOUND_PAN_TARGET });
    expect(runtime.gBattlerControllerFuncs[1]).toBe('HideHealthboxAfterMonFaint');
  });

  test('intro trainer throw, trainer pic, party summary delay, and end battle match opponent-specific C flow', () => {
    const runtime = createLinkOpponentRuntime({
      gBattleTypeFlags: BATTLE_TYPE_MULTI,
      gLinkPlayers: [
        { version: 4, gender: MALE },
        { version: 3, gender: 1 },
        { version: 4, gender: MALE },
        { version: 4, gender: MALE }
      ],
      gTrainerFrontPicCoords: { 201: { size: 7 } },
      gTrainerFrontPicPaletteTable: { 201: { tag: 901 } },
      gTrainerFrontPicTable: { 201: { tag: 902 } }
    });

    const skipRuntime = createLinkOpponentRuntime({ gActiveBattler: 0, gBattleControllerExecFlags: 1 });
    skipRuntime.gBattleBufferA[0][1] = 1;
    skipRuntime.gBattleBufferA[0][2] = 1;
    LinkOpponentHandleDrawPartyStatusSummary(skipRuntime);
    expect(skipRuntime.gBattlerControllerFuncs[0]).toBe('LinkOpponentBufferRunCommand');
    expect(skipRuntime.gBattleControllerExecFlags).toBe(0);

    runtime.gTrainerBattleOpponent_A = TRAINER_UNION_ROOM;

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = 0;
    runtime.gBattleBufferA[1][2] = 1;
    LinkOpponentHandleDrawPartyStatusSummary(runtime);
    LinkOpponentHandleDrawPartyStatusSummary(runtime);
    expect(runtime.gTasks.length).toBe(0);
    LinkOpponentHandleDrawPartyStatusSummary(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('EndDrawPartyStatusSummary');

    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattleBufferA[1][1] = 0;
    runtime.gBattleBufferA[1][2] = 0;
    runtime.gBattleBufferA[1][0] = 0;
    runtime.gBattleSpritesDataPtr.animationData.introAnimActive = false;
    runtime.gBattlerControllerFuncs[1] = 'LinkOpponentBufferRunCommand';
    runtime.gBattleBufferA[1][0] = 47;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('LinkOpponentDummy');
    expect(runtime.gTasks.at(-1)?.func).toBe('Task_StartSendOutAnim');
    Task_StartSendOutAnim(runtime, runtime.gTasks.length - 1);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('Intro_TryShinyAnimShowHealthbox');

    LinkOpponentBufferRunCommand(createLinkOpponentRuntime());
    runtime.gBattleControllerExecFlags = 2;
    runtime.gBattlerControllerFuncs[1] = 'LinkOpponentBufferRunCommand';
    runtime.gBattleBufferA[1][0] = 7;
    LinkOpponentBufferRunCommand(runtime);
    expect(runtime.gSprites[runtime.gBattlerSpriteIds[1]].x).toBe(200);
    expect(runtime.operations).toContain(`DecompressTrainerFrontPic:${runtime.gFacilityClassToPicIndex[FACILITY_CLASS_PKMN_TRAINER_MAY]}:1`);

    const endRuntime = createLinkOpponentRuntime();
    endRuntime.gBattleBufferA[1][1] = 1;
    LinkOpponentHandleEndLinkBattle(endRuntime);
    expect(endRuntime.gBattleOutcome).toBe(1 ^ B_OUTCOME_DREW);
    expect(endRuntime.gBattlerControllerFuncs[1]).toBe('SetBattleEndCallbacks');

    const drewRuntime = createLinkOpponentRuntime();
    drewRuntime.gBattleBufferA[1][1] = B_OUTCOME_DREW;
    LinkOpponentHandleEndLinkBattle(drewRuntime);
    expect(drewRuntime.gBattleOutcome).toBe(B_OUTCOME_DREW);
  });

  test('move, status, battle-animation, sound, flag, and hit handlers keep opponent side effects', () => {
    const runtime = createLinkOpponentRuntime();
    runtime.gBattleSpritesDataPtr.battlerData[1].behindSubstitute = true;
    runtime.gBattleBufferA[1][1] = 0x34;
    runtime.gBattleBufferA[1][2] = 0x12;
    runtime.gBattleBufferA[1][3] = 2;
    runtime.gBattleBufferA[1][4] = 0x78;
    runtime.gBattleBufferA[1][5] = 0x56;
    runtime.gBattleBufferA[1][6] = 1;
    runtime.gBattleBufferA[1][7] = 2;
    runtime.gBattleBufferA[1][8] = 3;
    runtime.gBattleBufferA[1][9] = 4;
    runtime.gBattleBufferA[1][10] = 77;
    runtime.gBattleBufferA[1][11] = 1;
    runtime.gBattleBufferA[1][12] = 0xaa;
    runtime.gBattleBufferA[1][13] = 0xbb;
    runtime.gBattleBufferA[1][16] = 0x11;
    runtime.gBattleBufferA[1][17] = 0x22;
    runtime.gBattleBufferA[1][18] = 0x33;
    runtime.gBattleBufferA[1][19] = 0x44;

    LinkOpponentHandleMoveAnimation(runtime);
    expect(runtime.gBattlerControllerFuncs[1]).toBe('LinkOpponentDoMoveAnimation');
    expect(runtime.gAnimMovePower).toBe(0x5678);
    LinkOpponentDoMoveAnimation(runtime);
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
    LinkOpponentDoMoveAnimation(runtime);
    expect(runtime.operations).toContain('DoMoveAnim:4660');
    LinkOpponentDoMoveAnimation(runtime);
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_MON_TO_SUBSTITUTE}`);
    LinkOpponentDoMoveAnimation(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    const statusRuntime = createLinkOpponentRuntime();
    LinkOpponentHandleStatusIconUpdate(statusRuntime);
    expect(statusRuntime.gBattlerControllerFuncs[1]).toBe('CompleteOnFinishedStatusAnimation');
    callLinkOpponentControllerFunc(statusRuntime, 'CompleteOnFinishedStatusAnimation');
    expect(statusRuntime.gBattleControllerExecFlags).toBe(0);

    const battleAnimRuntime = createLinkOpponentRuntime();
    battleAnimRuntime.gBattleSpritesDataPtr.healthBoxesData[1].animFromTableActive = true;
    LinkOpponentHandleBattleAnimation(battleAnimRuntime);
    expect(battleAnimRuntime.gBattlerControllerFuncs[1]).toBe('CompleteOnFinishedBattleAnimation');
    callLinkOpponentControllerFunc(battleAnimRuntime, 'CompleteOnFinishedBattleAnimation');
    expect(battleAnimRuntime.gBattleControllerExecFlags).toBe(2);
    battleAnimRuntime.gBattleSpritesDataPtr.healthBoxesData[1].animFromTableActive = false;
    callLinkOpponentControllerFunc(battleAnimRuntime, 'CompleteOnFinishedBattleAnimation');
    expect(battleAnimRuntime.gBattleControllerExecFlags).toBe(0);

    const miscRuntime = createLinkOpponentRuntime();
    miscRuntime.gBattleBufferA[1][1] = 0xad;
    miscRuntime.gBattleBufferA[1][2] = 0xde;
    LinkOpponentHandlePlaySE(miscRuntime);
    expect(miscRuntime.sounds).toEqual([{ kind: 'SE_PAN', id: 0xdead, pan: SOUND_PAN_TARGET }]);

    miscRuntime.gBattleControllerExecFlags = 2;
    LinkOpponentHandleToggleUnkFlag(miscRuntime);
    expect(miscRuntime.gUnusedControllerStruct.flag).toBe(1);

    const hitRuntime = createLinkOpponentRuntime();
    hitRuntime.gBattleBufferA[1][0] = CONTROLLER_HITANIMATION;
    LinkOpponentBufferRunCommand(hitRuntime);
    expect(hitRuntime.gDoingBattleAnim).toBe(true);
    for (let i = 0; i < 33; i++) callLinkOpponentControllerFunc(hitRuntime, 'DoHitAnimBlinkSpriteEffect');
    expect(hitRuntime.gDoingBattleAnim).toBe(false);
    expect(hitRuntime.gBattleControllerExecFlags).toBe(0);
  });
});
