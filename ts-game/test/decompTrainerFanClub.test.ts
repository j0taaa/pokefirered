import { describe, expect, test } from 'vitest';
import {
  B_OUTCOME_WON,
  FANCLUB_MEMBER1,
  FANCLUB_MEMBER2,
  FANCLUB_MEMBER3,
  FANCLUB_MEMBER4,
  FANCLUB_MEMBER5,
  FANCLUB_MEMBER6,
  FANCLUB_MEMBER7,
  BufferFanClubTrainerName,
  DidPlayerGetFirstFans,
  GetNumFansOfPlayerInTrainerFanClub,
  IsFanClubMemberFanOfPlayer,
  PlayerGainRandomTrainerFan,
  PlayerLoseRandomTrainerFan,
  ResetTrainerFanClub,
  Script_BufferFanClubTrainerName,
  Script_GetNumFansOfPlayerInTrainerFanClub,
  Script_IsFanClubMemberFanOfPlayer,
  Script_SetPlayerGotFirstFans,
  Script_TryGainNewFanFromCounter,
  Script_TryLoseFansFromPlayTime,
  Script_TryLoseFansFromPlayTimeAfterLinkBattle,
  Script_UpdateTrainerFanClubGameClear,
  SetInitialFansOfPlayer,
  SetPlayerGotFirstFans,
  Special_UpdateTrainerFansAfterLinkBattle,
  TryGainNewFanFromCounter,
  TryLoseFansFromPlayTime,
  TryLoseFansFromPlayTimeAfterLinkBattle,
  UpdateTrainerFanClubGameClear,
  UpdateTrainerFansAfterLinkBattle,
  bufferFanClubTrainerName,
  createTrainerFanClubRuntime,
  didPlayerGetFirstFans,
  getNumFansOfPlayerInTrainerFanClub,
  isFanClubMemberFanOfPlayer,
  playerGainRandomTrainerFan,
  playerLoseRandomTrainerFan,
  resetTrainerFanClub,
  scriptBufferFanClubTrainerName,
  scriptTryGainNewFanFromCounter,
  setInitialFansOfPlayer,
  setPlayerGotFirstFans,
  tryGainNewFanFromCounter,
  tryLoseFansFromPlayTime,
  tryLoseFansFromPlayTimeAfterLinkBattle,
  updateTrainerFanClubGameClear,
  updateTrainerFansAfterLinkBattle
} from '../src/game/decompTrainerFanClub';

describe('decomp trainer_fan_club', () => {
  test('exports exact C function names for trainer_fan_club entry points', () => {
    expect(ResetTrainerFanClub).toBe(resetTrainerFanClub);
    expect(Script_TryLoseFansFromPlayTimeAfterLinkBattle).toBe(
      tryLoseFansFromPlayTimeAfterLinkBattle
    );
    expect(TryLoseFansFromPlayTimeAfterLinkBattle).toBe(
      tryLoseFansFromPlayTimeAfterLinkBattle
    );
    expect(Script_UpdateTrainerFanClubGameClear).toBe(updateTrainerFanClubGameClear);
    expect(UpdateTrainerFanClubGameClear).toBe(updateTrainerFanClubGameClear);
    expect(TryGainNewFanFromCounter).toBe(tryGainNewFanFromCounter);
    expect(PlayerGainRandomTrainerFan).toBe(playerGainRandomTrainerFan);
    expect(PlayerLoseRandomTrainerFan).toBe(playerLoseRandomTrainerFan);
    expect(GetNumFansOfPlayerInTrainerFanClub).toBe(
      getNumFansOfPlayerInTrainerFanClub
    );
    expect(TryLoseFansFromPlayTime).toBe(tryLoseFansFromPlayTime);
    expect(Script_IsFanClubMemberFanOfPlayer).toBe(isFanClubMemberFanOfPlayer);
    expect(IsFanClubMemberFanOfPlayer).toBe(isFanClubMemberFanOfPlayer);
    expect(SetInitialFansOfPlayer).toBe(setInitialFansOfPlayer);
    expect(Script_BufferFanClubTrainerName).toBe(scriptBufferFanClubTrainerName);
    expect(BufferFanClubTrainerName).toBe(bufferFanClubTrainerName);
    expect(Special_UpdateTrainerFansAfterLinkBattle).toBe(
      updateTrainerFansAfterLinkBattle
    );
    expect(UpdateTrainerFansAfterLinkBattle).toBe(updateTrainerFansAfterLinkBattle);
    expect(DidPlayerGetFirstFans).toBe(didPlayerGetFirstFans);
    expect(SetPlayerGotFirstFans).toBe(setPlayerGotFirstFans);
    expect(Script_TryGainNewFanFromCounter).toBe(scriptTryGainNewFanFromCounter);
  });

  test('script-style C wrappers operate on runtime fan club state', () => {
    const runtime = createTrainerFanClubRuntime();

    Script_UpdateTrainerFanClubGameClear(runtime);
    expect(Script_GetNumFansOfPlayerInTrainerFanClub(runtime)).toBe(3);
    expect(runtime.fanClub.gotInitialFans).toBe(true);

    runtime.specialVar8004 = FANCLUB_MEMBER1;
    expect(Script_IsFanClubMemberFanOfPlayer(runtime)).toBe(true);

    runtime.fanClub.fanFlags = 0xff;
    runtime.playTimeHours = 12;
    runtime.loseFanTimer = 0;
    runtime.randomValues = Array.from({ length: 8 }, () => 1);
    Script_TryLoseFansFromPlayTime(runtime);
    expect(runtime.loseFanTimer).toBe(12);

    ResetTrainerFanClub(runtime);
    expect(runtime.fanClub.fanFlags).toBe(0);
    Script_SetPlayerGotFirstFans(runtime);
    expect(runtime.fanClub.gotInitialFans).toBe(true);
  });

  test('reset and game-clear setup initialize packed fan state and clear hide flags once', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.fanClub = { timer: 9, gotInitialFans: true, fanFlags: 0xff };
    runtime.loseFanTimer = 22;
    resetTrainerFanClub(runtime);
    expect(runtime.fanClub).toEqual({ timer: 0, gotInitialFans: false, fanFlags: 0 });
    expect(runtime.loseFanTimer).toBe(0);

    runtime.playTimeHours = 45;
    updateTrainerFanClubGameClear(runtime);
    expect(runtime.fanClub.gotInitialFans).toBe(true);
    expect(runtime.fanClub.fanFlags & 0b111).toBe(0b111);
    expect(runtime.loseFanTimer).toBe(45);
    expect(runtime.hiddenFlagsCleared).toHaveLength(4);
    expect(runtime.mapScene).toBe(1);
    updateTrainerFanClubGameClear(runtime);
    expect(runtime.hiddenFlagsCleared).toHaveLength(4);
  });

  test('gain fan uses random order and fallback when no random branch succeeds', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.randomValues = [0, 1];
    const gained = playerGainRandomTrainerFan(runtime, runtime.fanClub);
    expect(gained).toBe(FANCLUB_MEMBER4);
    expect(runtime.fanClub.fanFlags & (1 << FANCLUB_MEMBER4)).not.toBe(0);

    const fallbackRuntime = createTrainerFanClubRuntime();
    fallbackRuntime.randomValues = Array.from({ length: 8 }, () => 0);
    const fallback = playerGainRandomTrainerFan(fallbackRuntime, fallbackRuntime.fanClub);
    expect(fallback).toBe(FANCLUB_MEMBER3);
    expect(fallbackRuntime.fanClub.fanFlags & (1 << FANCLUB_MEMBER3)).not.toBe(0);
  });

  test('lose fan keeps one fan, otherwise uses random order and fallback flip', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.fanClub.fanFlags = 1 << FANCLUB_MEMBER1;
    expect(playerLoseRandomTrainerFan(runtime, runtime.fanClub)).toBe(0);
    expect(runtime.fanClub.fanFlags).toBe(1 << FANCLUB_MEMBER1);

    runtime.fanClub.fanFlags = (1 << FANCLUB_MEMBER6) | (1 << FANCLUB_MEMBER2);
    runtime.randomValues = [1];
    expect(playerLoseRandomTrainerFan(runtime, runtime.fanClub)).toBe(FANCLUB_MEMBER6);
    expect(runtime.fanClub.fanFlags & (1 << FANCLUB_MEMBER6)).toBe(0);

    runtime.fanClub.fanFlags = (1 << FANCLUB_MEMBER7) | (1 << FANCLUB_MEMBER5);
    runtime.randomValues = [0, 0];
    expect(playerLoseRandomTrainerFan(runtime, runtime.fanClub)).toBe(FANCLUB_MEMBER5);
    expect(runtime.fanClub.fanFlags & (1 << FANCLUB_MEMBER5)).toBe(0);
  });

  test('counter gain only advances in map scene 2 and caps or resets like C', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.fanClub.timer = 18;
    expect(tryGainNewFanFromCounter(runtime, runtime.fanClub, 0)).toBe(18);

    runtime.mapScene = 2;
    runtime.randomValues = [1];
    expect(tryGainNewFanFromCounter(runtime, runtime.fanClub, 0)).toBe(0);
    expect(getNumFansOfPlayerInTrainerFanClub(runtime.fanClub)).toBe(1);

    setInitialFansOfPlayer(runtime.fanClub);
    runtime.fanClub.timer = 19;
    expect(tryGainNewFanFromCounter(runtime, runtime.fanClub, 1)).toBe(20);

    runtime.specialVar8004 = 2;
    expect(scriptTryGainNewFanFromCounter(runtime)).toBe(20);
  });

  test('play-time loss updates timer until below five fans or below 12 hours elapsed', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.fanClub.fanFlags = 0xff;
    runtime.playTimeHours = 36;
    runtime.loseFanTimer = 0;
    runtime.randomValues = Array.from({ length: 20 }, () => 1);

    tryLoseFansFromPlayTime(runtime, runtime.fanClub);

    expect(getNumFansOfPlayerInTrainerFanClub(runtime.fanClub)).toBe(5);
    expect(runtime.loseFanTimer).toBe(36);

    runtime.fanClub.gotInitialFans = true;
    runtime.playTimeHours = 50;
    tryLoseFansFromPlayTimeAfterLinkBattle(runtime);
    expect(runtime.loseFanTimer).toBe(50);
  });

  test('member lookup and name buffering follow script member mapping', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.fanClub.fanFlags = 1 << FANCLUB_MEMBER7;
    runtime.specialVar8004 = FANCLUB_MEMBER7;
    expect(isFanClubMemberFanOfPlayer(runtime)).toBe(true);

    scriptBufferFanClubTrainerName(runtime);
    expect(runtime.stringVar1).toBe('KOGA');

    runtime.linkBattleRecords.entries[1].name = 'LINKDUDE';
    scriptBufferFanClubTrainerName(runtime);
    expect(runtime.stringVar1).toBe('LINKDUD');
  });

  test('link battle update loses from play time then gains on win or loses on non-win', () => {
    const runtime = createTrainerFanClubRuntime();
    runtime.mapScene = 2;
    runtime.fanClub.gotInitialFans = true;
    setPlayerGotFirstFans(runtime.fanClub);
    runtime.fanClub.fanFlags = 1 << FANCLUB_MEMBER1;
    runtime.battleOutcome = B_OUTCOME_WON;
    runtime.randomValues = [1];

    updateTrainerFansAfterLinkBattle(runtime);
    expect(getNumFansOfPlayerInTrainerFanClub(runtime.fanClub)).toBe(2);

    runtime.battleOutcome = 0;
    runtime.randomValues = [1];
    updateTrainerFansAfterLinkBattle(runtime);
    expect(getNumFansOfPlayerInTrainerFanClub(runtime.fanClub)).toBe(1);
  });
});
