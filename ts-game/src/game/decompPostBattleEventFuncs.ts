export const FLAG_SYS_GAME_CLEAR = 'FLAG_SYS_GAME_CLEAR';
export const FLAG_SYS_RIBBON_GET = 'FLAG_SYS_RIBBON_GET';
export const FLAG_ENABLE_SHIP_BIRTH_ISLAND = 'FLAG_ENABLE_SHIP_BIRTH_ISLAND';
export const FLAG_RECEIVED_AURORA_TICKET = 'FLAG_RECEIVED_AURORA_TICKET';
export const FLAG_ENABLE_SHIP_NAVEL_ROCK = 'FLAG_ENABLE_SHIP_NAVEL_ROCK';
export const FLAG_RECEIVED_MYSTIC_TICKET = 'FLAG_RECEIVED_MYSTIC_TICKET';
export const GAME_STAT_FIRST_HOF_PLAY_TIME = 'GAME_STAT_FIRST_HOF_PLAY_TIME';
export const GAME_STAT_RECEIVED_RIBBONS = 'GAME_STAT_RECEIVED_RIBBONS';
export const HEAL_LOCATION_PALLET_TOWN = 'HEAL_LOCATION_PALLET_TOWN';
export const ITEM_AURORA_TICKET = 'ITEM_AURORA_TICKET';
export const ITEM_MYSTIC_TICKET = 'ITEM_MYSTIC_TICKET';

export interface PostBattlePartyMon {
  hasSpecies: boolean;
  isEgg: boolean;
  championRibbon: boolean;
  hp: number;
  maxHp: number;
  status: string;
}

export interface PostBattleRuntime {
  flags: Set<string>;
  gameStats: Record<string, number>;
  playerParty: PostBattlePartyMon[];
  bag: Record<string, number>;
  playTimeHours: number;
  playTimeMinutes: number;
  playTimeSeconds: number;
  hasHallOfFameRecords: boolean;
  continueGameWarpStatus: boolean;
  continueGameWarpHealLocation: string | null;
  mainCallback2: string | null;
  operations: string[];
  revision: number;
}

export const createPostBattleRuntime = (overrides: Partial<PostBattleRuntime> = {}): PostBattleRuntime => ({
  flags: new Set(),
  gameStats: {},
  playerParty: [],
  bag: {},
  playTimeHours: 0,
  playTimeMinutes: 0,
  playTimeSeconds: 0,
  hasHallOfFameRecords: false,
  continueGameWarpStatus: false,
  continueGameWarpHealLocation: null,
  mainCallback2: null,
  operations: [],
  revision: 0,
  ...overrides
});

const healPlayerParty = (runtime: PostBattleRuntime): void => {
  for (const mon of runtime.playerParty) {
    mon.hp = mon.maxHp;
    mon.status = 'none';
  }
  runtime.operations.push('HealPlayerParty');
};

const addBagItem = (runtime: PostBattleRuntime, item: string, count: number): void => {
  runtime.bag[item] = (runtime.bag[item] ?? 0) + count;
  runtime.operations.push(`AddBagItem:${item}:${count}`);
};

export function EnterHallOfFame(runtime: PostBattleRuntime): false {
  healPlayerParty(runtime);
  if (runtime.flags.has(FLAG_SYS_GAME_CLEAR)) {
    runtime.hasHallOfFameRecords = true;
  } else {
    runtime.hasHallOfFameRecords = false;
    runtime.flags.add(FLAG_SYS_GAME_CLEAR);
  }
  if ((runtime.gameStats[GAME_STAT_FIRST_HOF_PLAY_TIME] ?? 0) === 0) {
    runtime.gameStats[GAME_STAT_FIRST_HOF_PLAY_TIME] =
      (runtime.playTimeHours << 16) | (runtime.playTimeMinutes << 8) | runtime.playTimeSeconds;
  }
  runtime.continueGameWarpStatus = true;
  runtime.continueGameWarpHealLocation = HEAL_LOCATION_PALLET_TOWN;

  let gaveAtLeastOneRibbon = false;
  for (const mon of runtime.playerParty) {
    if (mon.hasSpecies && !mon.isEgg && !mon.championRibbon) {
      mon.championRibbon = true;
      gaveAtLeastOneRibbon = true;
    }
  }
  if (gaveAtLeastOneRibbon) {
    runtime.gameStats[GAME_STAT_RECEIVED_RIBBONS] = (runtime.gameStats[GAME_STAT_RECEIVED_RIBBONS] ?? 0) + 1;
    runtime.flags.add(FLAG_SYS_RIBBON_GET);
    if (runtime.revision >= 0xa && !runtime.bag[ITEM_AURORA_TICKET]) {
      addBagItem(runtime, ITEM_AURORA_TICKET, 1);
      runtime.flags.add(FLAG_ENABLE_SHIP_BIRTH_ISLAND);
      runtime.flags.add(FLAG_RECEIVED_AURORA_TICKET);
      addBagItem(runtime, ITEM_MYSTIC_TICKET, 1);
      runtime.flags.add(FLAG_ENABLE_SHIP_NAVEL_ROCK);
      runtime.flags.add(FLAG_RECEIVED_MYSTIC_TICKET);
    }
  }
  runtime.mainCallback2 = 'CB2_DoHallOfFameScreen';
  return false;
}

export function SetCB2WhiteOut(runtime: PostBattleRuntime): false {
  runtime.mainCallback2 = 'CB2_WhiteOut';
  return false;
}
