import { createDecompRng, nextDecompRandom, type DecompRngState } from './decompRandom';

export const ROAMER_MAP_GROUP = 3;
export const MAP_GRP = 0;
export const MAP_NUM = 1;
export const MAP_UNDEFINED_NUM = 0xff;
export const MAPSEC_NONE = 0;

export const SPECIES_BULBASAUR = 1;
export const SPECIES_CHARMANDER = 4;
export const SPECIES_RAIKOU = 243;
export const SPECIES_ENTEI = 244;
export const SPECIES_SUICUNE = 245;

export const TRAINER_BACK_PIC_OLD_MAN = 5;
export const USE_RANDOM_IVS = 32;
export const OT_ID_PLAYER_ID = 0;

export interface RoamerData {
  species: number;
  level: number;
  status: number;
  active: boolean;
  ivs: number;
  personality: number;
  hp: number;
  cool: number;
  beauty: number;
  cute: number;
  smart: number;
  tough: number;
}

export interface RoamerPokemon {
  species: number;
  level: number;
  ivs: number;
  personality: number;
  status: number;
  hp: number;
  maxHp: number;
  cool: number;
  beauty: number;
  cute: number;
  smart: number;
  tough: number;
}

export interface RoamerRuntime {
  roamer: RoamerData;
  locationHistory: number[][];
  roamerLocation: number[];
  enemyParty: RoamerPokemon[];
  rng: DecompRngState;
  starterSpecies: number;
  mapSectionByLocation: Record<string, number>;
}

export const ROAMER_LOCATIONS: readonly (readonly number[])[] = [
  [19, 20, 39, 41, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [20, 19, 21, 41, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [21, 20, 22, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [22, 21, 23, 27, 43, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [23, 22, 24, 25, 26, 27, 43],
  [24, 23, 25, 26, 29, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [25, 23, 24, 26, 34, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [26, 23, 24, 25, 28, 30, MAP_UNDEFINED_NUM],
  [27, 22, 23, 28, 43, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [28, 26, 27, 30, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [29, 24, 30, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [30, 28, 29, 31, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [31, 30, 32, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [32, 31, 33, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [33, 32, 36, 37, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [34, 25, 35, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [35, 34, 36, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [36, 33, 35, 37, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [37, 33, 36, 38, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [38, 37, 39, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [39, 19, 38, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [41, 19, 20, 42, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [42, 41, 20, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [43, 22, 23, 27, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM],
  [44, 43, 27, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM, MAP_UNDEFINED_NUM]
];

export const NUM_LOCATION_SETS = ROAMER_LOCATIONS.length;
export const NUM_LOCATIONS_PER_SET = ROAMER_LOCATIONS[0].length;

const createEmptyRoamer = (): RoamerData => ({
  species: 0,
  level: 0,
  status: 0,
  active: false,
  ivs: 0,
  personality: 0,
  hp: 0,
  cool: 0,
  beauty: 0,
  cute: 0,
  smart: 0,
  tough: 0
});

const createEmptyPokemon = (): RoamerPokemon => ({
  species: 0,
  level: 0,
  ivs: 0,
  personality: 0,
  status: 0,
  hp: 0,
  maxHp: 0,
  cool: 0,
  beauty: 0,
  cute: 0,
  smart: 0,
  tough: 0
});

export const createRoamerRuntime = (seed = 0): RoamerRuntime => ({
  roamer: createEmptyRoamer(),
  locationHistory: [[0, 0], [0, 0], [0, 0]],
  roamerLocation: [0, 0],
  enemyParty: [createEmptyPokemon()],
  rng: createDecompRng(seed),
  starterSpecies: 0,
  mapSectionByLocation: {}
});

const random = (runtime: RoamerRuntime): number => nextDecompRandom(runtime.rng);

export const getRoamerSpecies = (starterSpecies: number): number => {
  switch (starterSpecies) {
    default:
      return SPECIES_RAIKOU;
    case SPECIES_BULBASAUR:
      return SPECIES_ENTEI;
    case SPECIES_CHARMANDER:
      return SPECIES_SUICUNE;
  }
};

const createMon = (
  runtime: RoamerRuntime,
  species: number,
  level: number
): RoamerPokemon => {
  const ivs = random(runtime) & 0x3fffffff;
  const personality = ((random(runtime) << 16) | random(runtime)) >>> 0;
  return {
    species,
    level,
    ivs,
    personality,
    status: 0,
    hp: 100,
    maxHp: 100,
    cool: 0,
    beauty: 0,
    cute: 0,
    smart: 0,
    tough: 0
  };
};

export const clearRoamerData = (runtime: RoamerRuntime): void => {
  runtime.roamer = createEmptyRoamer();
  runtime.roamerLocation[MAP_GRP] = 0;
  runtime.roamerLocation[MAP_NUM] = 0;
  for (let i = 0; i < runtime.locationHistory.length; i += 1) {
    runtime.locationHistory[i][MAP_GRP] = 0;
    runtime.locationHistory[i][MAP_NUM] = 0;
  }
};

export const createInitialRoamerMon = (runtime: RoamerRuntime): void => {
  const species = getRoamerSpecies(runtime.starterSpecies);
  const mon = createMon(runtime, species, 50);
  runtime.enemyParty[0] = mon;
  runtime.roamer.species = species;
  runtime.roamer.level = 50;
  runtime.roamer.status = 0;
  runtime.roamer.active = true;
  runtime.roamer.ivs = mon.ivs;
  runtime.roamer.personality = mon.personality;
  runtime.roamer.hp = mon.maxHp;
  runtime.roamer.cool = mon.cool;
  runtime.roamer.beauty = mon.beauty;
  runtime.roamer.cute = mon.cute;
  runtime.roamer.smart = mon.smart;
  runtime.roamer.tough = mon.tough;
  runtime.roamerLocation[MAP_GRP] = ROAMER_MAP_GROUP;
  runtime.roamerLocation[MAP_NUM] = ROAMER_LOCATIONS[random(runtime) % NUM_LOCATION_SETS][0];
};

export const initRoamer = (runtime: RoamerRuntime): void => {
  clearRoamerData(runtime);
  createInitialRoamerMon(runtime);
};

export const updateLocationHistoryForRoamer = (
  runtime: RoamerRuntime,
  mapGroup: number,
  mapNum: number
): void => {
  runtime.locationHistory[2][MAP_GRP] = runtime.locationHistory[1][MAP_GRP];
  runtime.locationHistory[2][MAP_NUM] = runtime.locationHistory[1][MAP_NUM];
  runtime.locationHistory[1][MAP_GRP] = runtime.locationHistory[0][MAP_GRP];
  runtime.locationHistory[1][MAP_NUM] = runtime.locationHistory[0][MAP_NUM];
  runtime.locationHistory[0][MAP_GRP] = mapGroup;
  runtime.locationHistory[0][MAP_NUM] = mapNum;
};

export const roamerMoveToOtherLocationSet = (runtime: RoamerRuntime): void => {
  if (!runtime.roamer.active) {
    return;
  }
  runtime.roamerLocation[MAP_GRP] = ROAMER_MAP_GROUP;
  while (true) {
    const mapNum = ROAMER_LOCATIONS[random(runtime) % NUM_LOCATION_SETS][0];
    if (runtime.roamerLocation[MAP_NUM] !== mapNum) {
      runtime.roamerLocation[MAP_NUM] = mapNum;
      return;
    }
  }
};

export const roamerMove = (runtime: RoamerRuntime): void => {
  let locSet = 0;
  if ((random(runtime) % 16) === 0) {
    roamerMoveToOtherLocationSet(runtime);
  } else {
    if (!runtime.roamer.active) {
      return;
    }
    while (locSet < NUM_LOCATION_SETS) {
      if (runtime.roamerLocation[MAP_NUM] === ROAMER_LOCATIONS[locSet][0]) {
        let mapNum = 0;
        while (true) {
          mapNum = ROAMER_LOCATIONS[locSet][(random(runtime) % (NUM_LOCATIONS_PER_SET - 1)) + 1];
          if (!(runtime.locationHistory[2][MAP_GRP] === ROAMER_MAP_GROUP
            && runtime.locationHistory[2][MAP_NUM] === mapNum)
            && mapNum !== MAP_UNDEFINED_NUM) {
            break;
          }
        }
        runtime.roamerLocation[MAP_NUM] = mapNum;
        return;
      }
      locSet += 1;
    }
  }
};

export const isRoamerAt = (
  runtime: RoamerRuntime,
  mapGroup: number,
  mapNum: number
): boolean =>
  runtime.roamer.active
  && mapGroup === runtime.roamerLocation[MAP_GRP]
  && mapNum === runtime.roamerLocation[MAP_NUM];

export const createRoamerMonInstance = (runtime: RoamerRuntime): RoamerPokemon => {
  const mon: RoamerPokemon = {
    species: runtime.roamer.species,
    level: runtime.roamer.level,
    ivs: runtime.roamer.ivs,
    personality: runtime.roamer.personality,
    status: runtime.roamer.status,
    hp: runtime.roamer.hp,
    maxHp: runtime.roamer.hp,
    cool: runtime.roamer.cool,
    beauty: runtime.roamer.beauty,
    cute: runtime.roamer.cute,
    smart: runtime.roamer.smart,
    tough: runtime.roamer.tough
  };
  runtime.enemyParty[0] = mon;
  return mon;
};

export const tryStartRoamerEncounter = (
  runtime: RoamerRuntime,
  mapGroup: number,
  mapNum: number
): boolean => {
  if (isRoamerAt(runtime, mapGroup, mapNum) && (random(runtime) % 4) === 0) {
    createRoamerMonInstance(runtime);
    return true;
  }
  return false;
};

export const updateRoamerHPStatus = (
  runtime: RoamerRuntime,
  mon: Pick<RoamerPokemon, 'hp' | 'status'>
): void => {
  runtime.roamer.hp = mon.hp;
  runtime.roamer.status = mon.status;
  roamerMoveToOtherLocationSet(runtime);
};

export const setRoamerInactive = (runtime: RoamerRuntime): void => {
  runtime.roamer.active = false;
};

export const getRoamerLocation = (runtime: RoamerRuntime): { mapGroup: number; mapNum: number } => ({
  mapGroup: runtime.roamerLocation[MAP_GRP],
  mapNum: runtime.roamerLocation[MAP_NUM]
});

export const getRoamerLocationMapSectionId = (runtime: RoamerRuntime): number => {
  if (!runtime.roamer.active) {
    return MAPSEC_NONE;
  }
  return runtime.mapSectionByLocation[`${runtime.roamerLocation[MAP_GRP]}:${runtime.roamerLocation[MAP_NUM]}`] ?? MAPSEC_NONE;
};

export function ClearRoamerData(runtime: RoamerRuntime): void {
  clearRoamerData(runtime);
}

export function CreateInitialRoamerMon(runtime: RoamerRuntime): void {
  createInitialRoamerMon(runtime);
}

export function InitRoamer(runtime: RoamerRuntime): void {
  initRoamer(runtime);
}

export function UpdateLocationHistoryForRoamer(
  runtime: RoamerRuntime,
  mapGroup: number,
  mapNum: number
): void {
  updateLocationHistoryForRoamer(runtime, mapGroup, mapNum);
}

export function RoamerMoveToOtherLocationSet(runtime: RoamerRuntime): void {
  roamerMoveToOtherLocationSet(runtime);
}

export function RoamerMove(runtime: RoamerRuntime): void {
  roamerMove(runtime);
}

export function IsRoamerAt(
  runtime: RoamerRuntime,
  mapGroup: number,
  mapNum: number
): boolean {
  return isRoamerAt(runtime, mapGroup, mapNum);
}

export function CreateRoamerMonInstance(runtime: RoamerRuntime): RoamerPokemon {
  return createRoamerMonInstance(runtime);
}

export function TryStartRoamerEncounter(
  runtime: RoamerRuntime,
  mapGroup: number,
  mapNum: number
): boolean {
  return tryStartRoamerEncounter(runtime, mapGroup, mapNum);
}

export function UpdateRoamerHPStatus(
  runtime: RoamerRuntime,
  mon: Pick<RoamerPokemon, 'hp' | 'status'>
): void {
  updateRoamerHPStatus(runtime, mon);
}

export function SetRoamerInactive(runtime: RoamerRuntime): void {
  setRoamerInactive(runtime);
}

export function GetRoamerLocation(runtime: RoamerRuntime): { mapGroup: number; mapNum: number } {
  return getRoamerLocation(runtime);
}

export function GetRoamerLocationMapSectionId(runtime: RoamerRuntime): number {
  return getRoamerLocationMapSectionId(runtime);
}
