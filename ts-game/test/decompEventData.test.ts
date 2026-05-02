import { describe, expect, test } from 'vitest';
import {
  FLAG_MYSTERY_GIFT_DONE,
  FLAG_SYS_BLACK_FLUTE_ACTIVE,
  FLAG_SYS_MYSTERY_GIFT_ENABLED,
  FLAG_SYS_NATIONAL_DEX,
  FLAG_SYS_RESET_RTC_ENABLE,
  FLAG_SYS_USE_STRENGTH,
  CanResetRTC,
  ClearMysteryGiftFlags,
  ClearMysteryGiftVars,
  ClearTempFieldEventData,
  DisableMysteryGift,
  DisableNationalPokedex,
  DisableNationalPokedex_RSE,
  DisableResetRTC,
  EnableMysteryGift,
  EnableNationalPokedex,
  EnableNationalPokedex_RSE,
  EnableResetRTC,
  FlagClear,
  FlagGet,
  FlagSet,
  GetFlagAddr,
  GetVarPointer,
  InitEventData,
  IsFlagOrVarStoredInQuestLog,
  IsMysteryGiftEnabled,
  IsNationalPokedexEnabled,
  IsNationalPokedexEnabled_RSE,
  QL_PLAYBACK_STATE_RECORDING,
  QL_PLAYBACK_STATE_RUNNING,
  ResetSpecialVars,
  SPECIAL_FLAGS_START,
  SPECIAL_VARS_START,
  STORY_FLAGS_START,
  TEMP_VARS_START,
  VarGet,
  VarGetObjectEventGraphicsId,
  VarSet,
  VAR_0x403C,
  VAR_ICE_STEP_COUNT,
  VAR_NATIONAL_DEX,
  VAR_RESET_RTC_ENABLE,
  VARS_START,
  canResetRTC,
  clearMysteryGiftFlags,
  clearMysteryGiftVars,
  clearTempFieldEventData,
  createEventDataRuntime,
  disableMysteryGift,
  disableNationalPokedex,
  disableNationalPokedexRSE,
  disableResetRTC,
  enableMysteryGift,
  enableNationalPokedex,
  enableNationalPokedexRSE,
  enableResetRTC,
  flagClear,
  flagGet,
  flagSet,
  getFlagAddr,
  getVarPointer,
  initEventData,
  isFlagOrVarStoredInQuestLog,
  isMysteryGiftEnabled,
  isNationalPokedexEnabled,
  isNationalPokedexEnabledRSE,
  resetSpecialVars,
  varGet,
  varGetObjectEventGraphicsId,
  varSet
} from '../src/game/decompEventData';

describe('decomp event_data', () => {
  test('exports exact C function names for event_data helpers', () => {
    expect(InitEventData).toBe(initEventData);
    expect(ClearTempFieldEventData).toBe(clearTempFieldEventData);
    expect(DisableNationalPokedex_RSE).toBe(disableNationalPokedexRSE);
    expect(EnableNationalPokedex_RSE).toBe(enableNationalPokedexRSE);
    expect(IsNationalPokedexEnabled_RSE).toBe(isNationalPokedexEnabledRSE);
    expect(DisableNationalPokedex).toBe(disableNationalPokedex);
    expect(EnableNationalPokedex).toBe(enableNationalPokedex);
    expect(IsNationalPokedexEnabled).toBe(isNationalPokedexEnabled);
    expect(DisableMysteryGift).toBe(disableMysteryGift);
    expect(EnableMysteryGift).toBe(enableMysteryGift);
    expect(IsMysteryGiftEnabled).toBe(isMysteryGiftEnabled);
    expect(ClearMysteryGiftFlags).toBe(clearMysteryGiftFlags);
    expect(ClearMysteryGiftVars).toBe(clearMysteryGiftVars);
    expect(DisableResetRTC).toBe(disableResetRTC);
    expect(EnableResetRTC).toBe(enableResetRTC);
    expect(CanResetRTC).toBe(canResetRTC);
    expect(GetVarPointer).toBe(getVarPointer);
    expect(IsFlagOrVarStoredInQuestLog).toBe(isFlagOrVarStoredInQuestLog);
    expect(VarGet).toBe(varGet);
    expect(VarSet).toBe(varSet);
    expect(VarGetObjectEventGraphicsId).toBe(varGetObjectEventGraphicsId);
    expect(GetFlagAddr).toBe(getFlagAddr);
    expect(FlagSet).toBe(flagSet);
    expect(FlagClear).toBe(flagClear);
    expect(FlagGet).toBe(flagGet);
    expect(ResetSpecialVars).toBe(resetSpecialVars);
  });

  test('InitEventData clears save flags, vars, and special flags', () => {
    const runtime = createEventDataRuntime();
    runtime.saveBlock1.flags[1] = 0xff;
    runtime.saveBlock1.vars[2] = 77;
    runtime.specialFlags[0] = 0xff;

    initEventData(runtime);

    expect(runtime.saveBlock1.flags[1]).toBe(0);
    expect(runtime.saveBlock1.vars[2]).toBe(0);
    expect(runtime.specialFlags[0]).toBe(0);
  });

  test('vars and special vars use the same pointer ranges and return values as C', () => {
    const runtime = createEventDataRuntime();

    expect(getVarPointer(runtime, VARS_START - 1)).toBeNull();
    expect(varGet(runtime, 0x1234)).toBe(0x1234);
    expect(varSet(runtime, 0x1234, 99)).toBe(false);

    expect(varSet(runtime, TEMP_VARS_START + 1, 0xbeef)).toBe(true);
    expect(varGet(runtime, TEMP_VARS_START + 1)).toBe(0xbeef);

    expect(varSet(runtime, SPECIAL_VARS_START + 2, 0xabcd)).toBe(true);
    expect(varGet(runtime, SPECIAL_VARS_START + 2)).toBe(0xabcd);
    resetSpecialVars(runtime);
    expect(varGet(runtime, SPECIAL_VARS_START + 2)).toBe(0);

    varSet(runtime, 0x4013, 0x1234);
    expect(varGetObjectEventGraphicsId(runtime, 3)).toBe(0x34);
  });

  test('flags and special flags mutate bits while FlagSet and FlagClear return false', () => {
    const runtime = createEventDataRuntime();

    expect(getFlagAddr(runtime, 0)).toBeNull();
    expect(flagSet(runtime, STORY_FLAGS_START)).toBe(false);
    expect(flagGet(runtime, STORY_FLAGS_START)).toBe(true);
    expect(flagClear(runtime, STORY_FLAGS_START)).toBe(false);
    expect(flagGet(runtime, STORY_FLAGS_START)).toBe(false);

    flagSet(runtime, SPECIAL_FLAGS_START + 3);
    expect(runtime.specialFlags[0]).toBe(1 << 3);
    expect(flagGet(runtime, SPECIAL_FLAGS_START + 3)).toBe(true);
  });

  test('quest log running and recording paths mirror GetVarPointer and GetFlagAddr', () => {
    const runtime = createEventDataRuntime();
    runtime.questLogPlaybackState = QL_PLAYBACK_STATE_RUNNING;
    runtime.questLogValues.set(`0:${VAR_ICE_STEP_COUNT}`, 0x2222);
    runtime.questLogValues.set(`1:${STORY_FLAGS_START + 7}`, 0x80);

    expect(varGet(runtime, VAR_ICE_STEP_COUNT)).toBe(0x2222);
    flagGet(runtime, STORY_FLAGS_START + 7);
    expect(runtime.saveBlock1.flags[Math.trunc((STORY_FLAGS_START + 7) / 8)]).toBe(0x80);

    runtime.questLogPlaybackState = QL_PLAYBACK_STATE_RECORDING;
    varSet(runtime, VAR_ICE_STEP_COUNT, 5);
    flagSet(runtime, STORY_FLAGS_START + 1);

    expect(runtime.questLogStored[0]).toMatchObject({ isFlag: false, idx: VAR_ICE_STEP_COUNT });
    expect(runtime.questLogStored[1]).toMatchObject({ isFlag: true, idx: STORY_FLAGS_START + 1 });
    expect(isFlagOrVarStoredInQuestLog(1, false)).toBe(false);
    expect(isFlagOrVarStoredInQuestLog(FLAG_SYS_USE_STRENGTH, false)).toBe(false);
    expect(isFlagOrVarStoredInQuestLog(VAR_NATIONAL_DEX - VARS_START, true)).toBe(true);
  });

  test('feature toggles preserve magic values and flags', () => {
    const runtime = createEventDataRuntime();

    enableNationalPokedex(runtime);
    expect(runtime.saveBlock2.pokedex.nationalMagic).toBe(0xb9);
    expect(varGet(runtime, VAR_NATIONAL_DEX)).toBe(0x6258);
    expect(flagGet(runtime, FLAG_SYS_NATIONAL_DEX)).toBe(true);
    expect(isNationalPokedexEnabled(runtime)).toBe(true);

    disableNationalPokedex(runtime);
    expect(isNationalPokedexEnabled(runtime)).toBe(false);

    enableNationalPokedexRSE(runtime);
    expect(runtime.saveBlock2.pokedex.unused).toBe(0xda);
    expect(varGet(runtime, VAR_0x403C)).toBe(0x0302);
    expect(isNationalPokedexEnabledRSE(runtime)).toBe(true);
    disableNationalPokedexRSE(runtime);
    expect(runtime.saveBlock2.pokedex.unused).toBe(0);
    expect(varGet(runtime, VAR_0x403C)).toBe(0);
    expect(isNationalPokedexEnabledRSE(runtime)).toBe(false);

    enableMysteryGift(runtime);
    expect(isMysteryGiftEnabled(runtime)).toBe(true);
    disableMysteryGift(runtime);
    expect(isMysteryGiftEnabled(runtime)).toBe(false);

    enableResetRTC(runtime);
    expect(flagGet(runtime, FLAG_SYS_RESET_RTC_ENABLE)).toBe(true);
    expect(varGet(runtime, VAR_RESET_RTC_ENABLE)).toBe(0x0920);
    expect(canResetRTC(runtime)).toBe(true);
  });

  test('temp clear and Mystery Gift flag clear reset the same ranges', () => {
    const runtime = createEventDataRuntime();
    varSet(runtime, TEMP_VARS_START + 2, 44);
    flagSet(runtime, FLAG_SYS_BLACK_FLUTE_ACTIVE);
    flagSet(runtime, FLAG_SYS_USE_STRENGTH);
    clearTempFieldEventData(runtime);
    expect(varGet(runtime, TEMP_VARS_START + 2)).toBe(0);
    expect(flagGet(runtime, FLAG_SYS_BLACK_FLUTE_ACTIVE)).toBe(false);
    expect(flagGet(runtime, FLAG_SYS_USE_STRENGTH)).toBe(false);

    for (let flag = FLAG_MYSTERY_GIFT_DONE; flag <= FLAG_MYSTERY_GIFT_DONE + 15; flag += 1) {
      flagSet(runtime, flag);
    }
    clearMysteryGiftFlags(runtime);
    expect(flagGet(runtime, FLAG_MYSTERY_GIFT_DONE)).toBe(false);
    expect(flagGet(runtime, FLAG_MYSTERY_GIFT_DONE + 15)).toBe(false);
    expect(flagGet(runtime, FLAG_SYS_MYSTERY_GIFT_ENABLED)).toBe(false);
  });
});
