import { describe, expect, test } from 'vitest';
import {
  B_ANIM_MON_TO_SUBSTITUTE,
  B_ANIM_SUBSTITUTE_TO_MON,
  B_ANIM_SWITCH_OUT_PLAYER_MON,
  BATTLE_TYPE_LINK,
  CONTROLLER_GETMONDATA,
  CONTROLLER_HITANIMATION,
  CONTROLLER_LOADMONSPRITE,
  CONTROLLER_RETURNMONTOBALL,
  CONTROLLER_TERMINATOR_NOP,
  LinkPartnerBufferExecCompleted,
  LinkPartnerBufferRunCommand,
  LinkPartnerHandleBattleAnimation,
  LinkPartnerHandleEndLinkBattle,
  LinkPartnerHandleMoveAnimation,
  LinkPartnerHandleSetMonData,
  LinkPartnerHandleSetRawMonData,
  LinkPartnerHandleStatusIconUpdate,
  LinkPartnerHandleSwitchInAnim,
  LinkPartnerHandleToggleUnkFlag,
  LinkPartnerHandlePlaySE,
  LinkPartnerDoMoveAnimation,
  REQUEST_ALL_IVS_BATTLE,
  REQUEST_EXP_BATTLE,
  REQUEST_HP_BATTLE,
  REQUEST_MOVES_PP_BATTLE,
  REQUEST_SPECIES_BATTLE,
  SOUND_PAN_ATTACKER,
  callLinkPartnerControllerFunc,
  createLinkPartnerMon,
  createLinkPartnerRuntime
} from '../src/game/decompBattleControllerLinkPartner';

describe('decomp battle_controller_link_partner', () => {
  test('command dispatch and completion preserve link/non-link exec semantics', () => {
    const runtime = createLinkPartnerRuntime();
    runtime.gBattleBufferA[0][0] = 255;
    LinkPartnerBufferRunCommand(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    const linkRuntime = createLinkPartnerRuntime({ gBattleTypeFlags: BATTLE_TYPE_LINK, multiplayerId: 2 });
    LinkPartnerBufferExecCompleted(linkRuntime);
    expect(linkRuntime.gBattleControllerExecFlags).toBe(1);
    expect(linkRuntime.gBattleBufferA[0][0]).toBe(CONTROLLER_TERMINATOR_NOP);
    expect(linkRuntime.emittedTransfers).toEqual([{ buffer: 'link', size: 4, data: [2] }]);
  });

  test('get/set mon data packs and unpacks battle requests like the C controller', () => {
    const runtime = createLinkPartnerRuntime({
      gPlayerParty: [
        createLinkPartnerMon({
          species: 0x123,
          moves: [0x111, 0x222, 0x333, 0x444],
          pp: [1, 2, 3, 4],
          ppBonuses: 0xaa,
          experience: 0xabcdef,
          hp: 44,
          hpIV: 7,
          attackIV: 8,
          defenseIV: 9,
          speedIV: 10,
          spAttackIV: 11,
          spDefenseIV: 12
        }),
        ...Array.from({ length: 5 }, () => createLinkPartnerMon())
      ]
    });

    runtime.gBattleBufferA[0][0] = CONTROLLER_GETMONDATA;
    runtime.gBattleBufferA[0][1] = REQUEST_MOVES_PP_BATTLE;
    runtime.gBattleBufferA[0][2] = 0;
    LinkPartnerBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({
      buffer: 'B',
      size: 13,
      data: [0x11, 0x01, 0x22, 0x02, 0x33, 0x03, 0x44, 0x04, 1, 2, 3, 4, 0xaa]
    });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][0] = CONTROLLER_GETMONDATA;
    runtime.gBattleBufferA[0][1] = REQUEST_SPECIES_BATTLE;
    LinkPartnerBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 2, data: [0x23, 0x01] });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][1] = REQUEST_EXP_BATTLE;
    LinkPartnerBufferRunCommand(runtime);
    expect(runtime.emittedTransfers.at(-1)).toEqual({ buffer: 'B', size: 3, data: [0xef, 0xcd, 0xab] });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][1] = REQUEST_HP_BATTLE;
    runtime.gBattleBufferA[0][2] = 0;
    runtime.gBattleBufferA[0][3] = 0x34;
    runtime.gBattleBufferA[0][4] = 0x12;
    LinkPartnerHandleSetMonData(runtime);
    expect(runtime.gPlayerParty[0].hp).toBe(0x1234);

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][1] = REQUEST_ALL_IVS_BATTLE;
    runtime.gBattleBufferA[0][3] = 1;
    runtime.gBattleBufferA[0][4] = 2;
    runtime.gBattleBufferA[0][5] = 3;
    runtime.gBattleBufferA[0][6] = 4;
    runtime.gBattleBufferA[0][7] = 5;
    runtime.gBattleBufferA[0][8] = 6;
    LinkPartnerHandleSetMonData(runtime);
    expect(runtime.gPlayerParty[0]).toMatchObject({ hpIV: 1, attackIV: 2, defenseIV: 3, speedIV: 4, spAttackIV: 5, spDefenseIV: 6 });

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][1] = 5;
    runtime.gBattleBufferA[0][2] = 3;
    runtime.gBattleBufferA[0][3] = 9;
    runtime.gBattleBufferA[0][4] = 8;
    runtime.gBattleBufferA[0][5] = 7;
    LinkPartnerHandleSetRawMonData(runtime);
    expect(runtime.gPlayerParty[0].raw.slice(5, 8)).toEqual([9, 8, 7]);
  });

  test('load, switch-in, return-to-ball, and hit animations advance through C callback states', () => {
    const runtime = createLinkPartnerRuntime();
    runtime.gBattleBufferA[0][0] = CONTROLLER_LOADMONSPRITE;
    LinkPartnerBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('WaitForMonAnimAfterLoad');
    expect(runtime.gSprites[runtime.gBattlerSpriteIds[0]].x2).toBe(-240);
    runtime.gSprites[runtime.gBattlerSpriteIds[0]].x2 = 0;
    callLinkPartnerControllerFunc(runtime, runtime.gBattlerControllerFuncs[0]);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][1] = 2;
    runtime.gBattleBufferA[0][2] = 1;
    LinkPartnerHandleSwitchInAnim(runtime);
    expect(runtime.gBattlerPartyIndexes[0]).toBe(2);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('SwitchIn_TryShinyAnim');
    expect(runtime.operations).toContain('DoPokeballSendOutAnimation:0:POKEBALL_PLAYER_SENDOUT');

    runtime.gBattleControllerExecFlags = 1;
    runtime.gBattleBufferA[0][0] = CONTROLLER_RETURNMONTOBALL;
    runtime.gBattleBufferA[0][1] = 0;
    runtime.gBattleSpritesDataPtr.battlerData[0].behindSubstitute = true;
    LinkPartnerBufferRunCommand(runtime);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('DoSwitchOutAnimation');
    callLinkPartnerControllerFunc(runtime, 'DoSwitchOutAnimation');
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
    callLinkPartnerControllerFunc(runtime, 'DoSwitchOutAnimation');
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_SWITCH_OUT_PLAYER_MON}`);
    expect(runtime.gBattlerControllerFuncs[0]).toBe('FreeMonSpriteAfterSwitchOutAnim');

    runtime.gBattleControllerExecFlags = 1;
    runtime.gSprites[runtime.gBattlerSpriteIds[0]].callback = 'SpriteCallbackDummy';
    callLinkPartnerControllerFunc(runtime, 'FreeMonSpriteAfterSwitchOutAnim');
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    const hitRuntime = createLinkPartnerRuntime();
    hitRuntime.gBattleBufferA[0][0] = CONTROLLER_HITANIMATION;
    LinkPartnerBufferRunCommand(hitRuntime);
    expect(hitRuntime.gDoingBattleAnim).toBe(true);
    for (let i = 0; i < 33; i++) callLinkPartnerControllerFunc(hitRuntime, 'DoHitAnimBlinkSpriteEffect');
    expect(hitRuntime.gDoingBattleAnim).toBe(false);
    expect(hitRuntime.gBattleControllerExecFlags).toBe(0);
  });

  test('move, status, battle-animation, sound, flag, and end-link handlers keep controller side effects', () => {
    const runtime = createLinkPartnerRuntime();
    runtime.gBattleSpritesDataPtr.battlerData[0].behindSubstitute = true;
    runtime.gBattleBufferA[0][1] = 0x34;
    runtime.gBattleBufferA[0][2] = 0x12;
    runtime.gBattleBufferA[0][3] = 2;
    runtime.gBattleBufferA[0][4] = 0x78;
    runtime.gBattleBufferA[0][5] = 0x56;
    runtime.gBattleBufferA[0][6] = 1;
    runtime.gBattleBufferA[0][7] = 2;
    runtime.gBattleBufferA[0][8] = 3;
    runtime.gBattleBufferA[0][9] = 4;
    runtime.gBattleBufferA[0][10] = 77;
    runtime.gBattleBufferA[0][11] = 1;
    runtime.gBattleBufferA[0][12] = 0xaa;
    runtime.gBattleBufferA[0][13] = 0xbb;
    runtime.gBattleBufferA[0][16] = 0x11;
    runtime.gBattleBufferA[0][17] = 0x22;
    runtime.gBattleBufferA[0][18] = 0x33;
    runtime.gBattleBufferA[0][19] = 0x44;

    LinkPartnerHandleMoveAnimation(runtime);
    expect(runtime.gAnimMoveTurn).toBe(2);
    expect(runtime.gAnimMovePower).toBe(0x5678);
    expect(runtime.gAnimMoveDmg).toBe(0x04030201);
    expect(runtime.gAnimFriendship).toBe(77);
    expect(runtime.gWeatherMoveAnim).toBe(0xbbaa);
    expect(runtime.gTransformedPersonalities[0]).toBe(0x44332211);

    LinkPartnerDoMoveAnimation(runtime);
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_SUBSTITUTE_TO_MON}`);
    LinkPartnerDoMoveAnimation(runtime);
    expect(runtime.operations).toContain('DoMoveAnim:4660');
    LinkPartnerDoMoveAnimation(runtime);
    expect(runtime.operations).toContain(`InitAndLaunchSpecialAnimation:${B_ANIM_MON_TO_SUBSTITUTE}`);
    LinkPartnerDoMoveAnimation(runtime);
    expect(runtime.gBattleControllerExecFlags).toBe(0);

    const statusRuntime = createLinkPartnerRuntime();
    LinkPartnerHandleStatusIconUpdate(statusRuntime);
    expect(statusRuntime.gBattlerControllerFuncs[0]).toBe('CompleteOnFinishedStatusAnimation');
    callLinkPartnerControllerFunc(statusRuntime, 'CompleteOnFinishedStatusAnimation');
    expect(statusRuntime.gBattleControllerExecFlags).toBe(0);

    const battleAnimRuntime = createLinkPartnerRuntime();
    battleAnimRuntime.gBattleSpritesDataPtr.healthBoxesData[0].animFromTableActive = true;
    LinkPartnerHandleBattleAnimation(battleAnimRuntime);
    expect(battleAnimRuntime.gBattlerControllerFuncs[0]).toBe('CompleteOnFinishedBattleAnimation');
    callLinkPartnerControllerFunc(battleAnimRuntime, 'CompleteOnFinishedBattleAnimation');
    expect(battleAnimRuntime.gBattleControllerExecFlags).toBe(1);
    battleAnimRuntime.gBattleSpritesDataPtr.healthBoxesData[0].animFromTableActive = false;
    callLinkPartnerControllerFunc(battleAnimRuntime, 'CompleteOnFinishedBattleAnimation');
    expect(battleAnimRuntime.gBattleControllerExecFlags).toBe(0);

    const miscRuntime = createLinkPartnerRuntime();
    miscRuntime.gBattleBufferA[0][1] = 0xad;
    miscRuntime.gBattleBufferA[0][2] = 0xde;
    LinkPartnerHandlePlaySE(miscRuntime);
    expect(miscRuntime.sounds).toEqual([{ kind: 'SE_PAN', id: 0xdead, pan: SOUND_PAN_ATTACKER }]);

    miscRuntime.gBattleControllerExecFlags = 1;
    LinkPartnerHandleToggleUnkFlag(miscRuntime);
    expect(miscRuntime.gUnusedControllerStruct.flag).toBe(1);

    miscRuntime.gBattleControllerExecFlags = 1;
    miscRuntime.gBattleBufferA[0][1] = 3;
    LinkPartnerHandleEndLinkBattle(miscRuntime);
    expect(miscRuntime.gBattleOutcome).toBe(3);
    expect(miscRuntime.gBattlerControllerFuncs[0]).toBe('SetBattleEndCallbacks');
  });
});
