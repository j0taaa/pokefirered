export const VARS_START = 0x4000;
export const TEMP_VARS_START = 0x4000;
export const TEMP_VARS_END = 0x400f;
export const VAR_ICE_STEP_COUNT = 0x4030;
export const VAR_RESET_RTC_ENABLE = 0x4032;
export const VAR_ENIGMA_BERRY_AVAILABLE = 0x4033;
export const VAR_0x403C = 0x403c;
export const VAR_NATIONAL_DEX = 0x404e;
export const VAR_MAP_SCENE_PALLET_TOWN_OAK = 0x4050;
export const VAR_PORTHOLE = 0x40b4;
export const VARS_END = 0x40ff;
export const SPECIAL_VARS_START = 0x8000;
export const SPECIAL_VARS_END = 0x8014;

export const TEMP_FLAGS_START = 0x0000;
export const TEMP_FLAGS_END = 0x001f;
export const STORY_FLAGS_START = 0x0230;
export const SYS_FLAGS = 0x0800;
export const PERMA_SYS_FLAGS_START = 0x0820;
export const FLAG_SYS_WHITE_FLUTE_ACTIVE = SYS_FLAGS + 0x03;
export const FLAG_SYS_BLACK_FLUTE_ACTIVE = SYS_FLAGS + 0x04;
export const FLAG_SYS_USE_STRENGTH = SYS_FLAGS + 0x05;
export const FLAG_SYS_SPECIAL_WILD_BATTLE = SYS_FLAGS + 0x07;
export const FLAG_SYS_RESET_RTC_ENABLE = SYS_FLAGS + 0x37;
export const FLAG_0x838 = SYS_FLAGS + 0x38;
export const FLAG_SYS_MYSTERY_GIFT_ENABLED = SYS_FLAGS + 0x39;
export const FLAG_SYS_NATIONAL_DEX = SYS_FLAGS + 0x40;
export const FLAG_SYS_INFORMED_OF_LOCAL_WIRELESS_PLAYER = SYS_FLAGS + 0x42;
export const FLAG_MYSTERY_GIFT_DONE = 0x03d8;
export const SPECIAL_FLAGS_START = 0x4000;
export const SPECIAL_FLAGS_END = 0x407f;

export const QL_PLAYBACK_STATE_STOPPED = 0;
export const QL_PLAYBACK_STATE_RUNNING = 1;
export const QL_PLAYBACK_STATE_RECORDING = 2;

export interface EventSaveBlock1 {
  flags: Uint8Array;
  vars: Uint16Array;
}

export interface EventSaveBlock2 {
  pokedex: {
    unused: number;
    nationalMagic: number;
  };
}

export interface QuestLogStoredValue {
  isFlag: boolean;
  idx: number;
  value: number;
}

export interface EventDataRuntime {
  saveBlock1: EventSaveBlock1;
  saveBlock2: EventSaveBlock2;
  specialVars: Uint16Array;
  specialFlags: Uint8Array;
  questLogPlaybackState: number;
  questLogValues: Map<string, number>;
  questLogStored: QuestLogStoredValue[];
  lastQuestLogStoredFlagOrVarIdx: number;
}

export const createEventDataRuntime = (): EventDataRuntime => ({
  saveBlock1: {
    flags: new Uint8Array((0x900 + 7) / 8),
    vars: new Uint16Array(VARS_END - VARS_START + 1)
  },
  saveBlock2: {
    pokedex: {
      unused: 0,
      nationalMagic: 0
    }
  },
  specialVars: new Uint16Array(SPECIAL_VARS_END - SPECIAL_VARS_START + 1),
  specialFlags: new Uint8Array((SPECIAL_FLAGS_END - SPECIAL_FLAGS_START + 1) / 8),
  questLogPlaybackState: QL_PLAYBACK_STATE_STOPPED,
  questLogValues: new Map(),
  questLogStored: [],
  lastQuestLogStoredFlagOrVarIdx: 0
});

export const initEventData = (runtime: EventDataRuntime): void => {
  runtime.saveBlock1.flags.fill(0);
  runtime.saveBlock1.vars.fill(0);
  runtime.specialFlags.fill(0);
};

export const clearTempFieldEventData = (runtime: EventDataRuntime): void => {
  runtime.saveBlock1.flags.fill(
    0,
    Math.trunc(TEMP_FLAGS_START / 8),
    Math.trunc(TEMP_FLAGS_START / 8) + Math.trunc((TEMP_FLAGS_END - TEMP_FLAGS_START + 1) / 8)
  );
  runtime.saveBlock1.vars.fill(
    0,
    TEMP_VARS_START - VARS_START,
    TEMP_VARS_END - VARS_START + 1
  );
  flagClear(runtime, FLAG_SYS_WHITE_FLUTE_ACTIVE);
  flagClear(runtime, FLAG_SYS_BLACK_FLUTE_ACTIVE);
  flagClear(runtime, FLAG_SYS_USE_STRENGTH);
  flagClear(runtime, FLAG_SYS_SPECIAL_WILD_BATTLE);
  flagClear(runtime, FLAG_SYS_INFORMED_OF_LOCAL_WIRELESS_PLAYER);
};

export const isFlagOrVarStoredInQuestLog = (idx: number, isVar: boolean): boolean => {
  if (!isVar) {
    if (idx < STORY_FLAGS_START) {
      return false;
    }
    if (idx >= SYS_FLAGS && idx < PERMA_SYS_FLAGS_START) {
      return false;
    }
  } else {
    if (idx < VAR_ICE_STEP_COUNT - VARS_START) {
      return false;
    }
    if (idx >= VAR_MAP_SCENE_PALLET_TOWN_OAK - VARS_START && idx < VAR_PORTHOLE - VARS_START) {
      return false;
    }
  }
  return true;
};

const questLogKey = (isFlag: boolean, idx: number): string => `${isFlag ? 1 : 0}:${idx}`;

export const getVarPointer = (
  runtime: EventDataRuntime,
  idx: number
): { kind: 'var' | 'special'; index: number } | null => {
  if (idx < VARS_START) {
    return null;
  }
  if (idx < SPECIAL_VARS_START) {
    const varIndex = idx - VARS_START;
    switch (runtime.questLogPlaybackState) {
      case QL_PLAYBACK_STATE_RUNNING: {
        const value = runtime.questLogValues.get(questLogKey(false, idx));
        if (value !== undefined) {
          runtime.saveBlock1.vars[varIndex] = value & 0xffff;
        }
        break;
      }
      case QL_PLAYBACK_STATE_RECORDING:
        if (isFlagOrVarStoredInQuestLog(varIndex, true)) {
          runtime.lastQuestLogStoredFlagOrVarIdx = varIndex;
          runtime.questLogStored.push({ isFlag: false, idx, value: runtime.saveBlock1.vars[varIndex] });
        }
        break;
    }
    return { kind: 'var', index: varIndex };
  }
  return { kind: 'special', index: idx - SPECIAL_VARS_START };
};

export const varGet = (runtime: EventDataRuntime, idx: number): number => {
  const ptr = getVarPointer(runtime, idx);
  if (ptr === null) {
    return idx & 0xffff;
  }
  return ptr.kind === 'var' ? runtime.saveBlock1.vars[ptr.index] : runtime.specialVars[ptr.index];
};

export const varSet = (runtime: EventDataRuntime, idx: number, val: number): boolean => {
  const ptr = getVarPointer(runtime, idx);
  if (ptr === null) {
    return false;
  }
  if (ptr.kind === 'var') {
    runtime.saveBlock1.vars[ptr.index] = val & 0xffff;
  } else {
    runtime.specialVars[ptr.index] = val & 0xffff;
  }
  return true;
};

export const varGetObjectEventGraphicsId = (runtime: EventDataRuntime, idx: number): number =>
  varGet(runtime, 0x4010 + (idx & 0xff)) & 0xff;

export const getFlagAddr = (
  runtime: EventDataRuntime,
  idx: number
): { target: Uint8Array; index: number } | null => {
  if (idx === 0) {
    return null;
  }
  if (idx < SPECIAL_FLAGS_START) {
    switch (runtime.questLogPlaybackState) {
      case QL_PLAYBACK_STATE_RUNNING: {
        const value = runtime.questLogValues.get(questLogKey(true, idx));
        if (value !== undefined) {
          runtime.saveBlock1.flags[Math.trunc(idx / 8)] = value & 0xff;
        }
        break;
      }
      case QL_PLAYBACK_STATE_RECORDING:
        if (isFlagOrVarStoredInQuestLog(idx, false)) {
          runtime.lastQuestLogStoredFlagOrVarIdx = idx;
          runtime.questLogStored.push({
            isFlag: true,
            idx,
            value: runtime.saveBlock1.flags[Math.trunc(idx / 8)]
          });
        }
        break;
    }
    return { target: runtime.saveBlock1.flags, index: Math.trunc(idx / 8) };
  }
  return { target: runtime.specialFlags, index: Math.trunc((idx - SPECIAL_FLAGS_START) / 8) };
};

export const flagSet = (runtime: EventDataRuntime, idx: number): boolean => {
  const ptr = getFlagAddr(runtime, idx);
  if (ptr !== null) {
    ptr.target[ptr.index] |= 1 << (idx & 7);
  }
  return false;
};

export const flagClear = (runtime: EventDataRuntime, idx: number): boolean => {
  const ptr = getFlagAddr(runtime, idx);
  if (ptr !== null) {
    ptr.target[ptr.index] &= ~(1 << (idx & 7));
  }
  return false;
};

export const flagGet = (runtime: EventDataRuntime, idx: number): boolean => {
  const ptr = getFlagAddr(runtime, idx);
  if (ptr === null) {
    return false;
  }
  return (ptr.target[ptr.index] & (1 << (idx & 7))) !== 0;
};

export const enableNationalPokedexRSE = (runtime: EventDataRuntime): void => {
  runtime.saveBlock2.pokedex.unused = 0xda;
  varSet(runtime, VAR_0x403C, 0x0302);
  flagSet(runtime, FLAG_0x838);
};

export const disableNationalPokedexRSE = (runtime: EventDataRuntime): void => {
  runtime.saveBlock2.pokedex.unused = 0;
  varSet(runtime, VAR_0x403C, 0);
  flagClear(runtime, FLAG_0x838);
};

export const isNationalPokedexEnabledRSE = (runtime: EventDataRuntime): boolean =>
  runtime.saveBlock2.pokedex.unused === 0xda &&
  varGet(runtime, VAR_0x403C) === 0x0302 &&
  flagGet(runtime, FLAG_0x838);

export const disableNationalPokedex = (runtime: EventDataRuntime): void => {
  runtime.saveBlock2.pokedex.nationalMagic = 0;
  varSet(runtime, VAR_NATIONAL_DEX, 0);
  flagClear(runtime, FLAG_SYS_NATIONAL_DEX);
};

export const enableNationalPokedex = (runtime: EventDataRuntime): void => {
  runtime.saveBlock2.pokedex.nationalMagic = 0xb9;
  varSet(runtime, VAR_NATIONAL_DEX, 0x6258);
  flagSet(runtime, FLAG_SYS_NATIONAL_DEX);
};

export const isNationalPokedexEnabled = (runtime: EventDataRuntime): boolean =>
  runtime.saveBlock2.pokedex.nationalMagic === 0xb9 &&
  varGet(runtime, VAR_NATIONAL_DEX) === 0x6258 &&
  flagGet(runtime, FLAG_SYS_NATIONAL_DEX);

export const disableMysteryGift = (runtime: EventDataRuntime): void => {
  flagClear(runtime, FLAG_SYS_MYSTERY_GIFT_ENABLED);
};

export const enableMysteryGift = (runtime: EventDataRuntime): void => {
  flagSet(runtime, FLAG_SYS_MYSTERY_GIFT_ENABLED);
};

export const isMysteryGiftEnabled = (runtime: EventDataRuntime): boolean =>
  flagGet(runtime, FLAG_SYS_MYSTERY_GIFT_ENABLED);

export const clearMysteryGiftFlags = (runtime: EventDataRuntime): void => {
  for (let flag = FLAG_MYSTERY_GIFT_DONE; flag <= FLAG_MYSTERY_GIFT_DONE + 15; flag += 1) {
    flagClear(runtime, flag);
  }
};

export const clearMysteryGiftVars = (runtime: EventDataRuntime): void => {
  [
    VAR_ENIGMA_BERRY_AVAILABLE,
    0x40a3,
    0x40a4,
    0x40a5,
    0x40a6,
    0x40a7,
    0x40a8,
    0x40a9,
    0x4024
  ].forEach((idx) => varSet(runtime, idx, 0));
};

export const disableResetRTC = (runtime: EventDataRuntime): void => {
  varSet(runtime, VAR_RESET_RTC_ENABLE, 0);
  flagClear(runtime, FLAG_SYS_RESET_RTC_ENABLE);
};

export const enableResetRTC = (runtime: EventDataRuntime): void => {
  varSet(runtime, VAR_RESET_RTC_ENABLE, 0x0920);
  flagSet(runtime, FLAG_SYS_RESET_RTC_ENABLE);
};

export const canResetRTC = (runtime: EventDataRuntime): boolean => {
  if (!flagGet(runtime, FLAG_SYS_RESET_RTC_ENABLE)) {
    return false;
  }
  if (varGet(runtime, VAR_RESET_RTC_ENABLE) !== 0x0920) {
    return false;
  }
  return true;
};

export const resetSpecialVars = (runtime: EventDataRuntime): void => {
  runtime.specialVars.fill(0);
};

export const InitEventData = initEventData;
export const ClearTempFieldEventData = clearTempFieldEventData;
export const DisableNationalPokedex_RSE = disableNationalPokedexRSE;
export const EnableNationalPokedex_RSE = enableNationalPokedexRSE;
export const IsNationalPokedexEnabled_RSE = isNationalPokedexEnabledRSE;
export const DisableNationalPokedex = disableNationalPokedex;
export const EnableNationalPokedex = enableNationalPokedex;
export const IsNationalPokedexEnabled = isNationalPokedexEnabled;
export const DisableMysteryGift = disableMysteryGift;
export const EnableMysteryGift = enableMysteryGift;
export const IsMysteryGiftEnabled = isMysteryGiftEnabled;
export const ClearMysteryGiftFlags = clearMysteryGiftFlags;
export const ClearMysteryGiftVars = clearMysteryGiftVars;
export const DisableResetRTC = disableResetRTC;
export const EnableResetRTC = enableResetRTC;
export const CanResetRTC = canResetRTC;
export const GetVarPointer = getVarPointer;
export const IsFlagOrVarStoredInQuestLog = isFlagOrVarStoredInQuestLog;
export const VarGet = varGet;
export const VarSet = varSet;
export const VarGetObjectEventGraphicsId = varGetObjectEventGraphicsId;
export const GetFlagAddr = getFlagAddr;
export const FlagSet = flagSet;
export const FlagClear = flagClear;
export const FlagGet = flagGet;
export const ResetSpecialVars = resetSpecialVars;
