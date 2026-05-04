import { openDialogueSequence, type DialogueState } from './interaction';
import { clearPlayerMovement, type PlayerState } from './player';
import { addBagItem, checkBagHasSpace, createBagState, getItemDefinition, type BagState } from './bag';
import {
  createBattlePokemonFromSpecies,
  createBattlePokemonFromSpeciesWithMoves,
  type BattleFormat,
  type BattlePokemonSnapshot
} from './battle';
import {
  addPokemonToParty,
  createDefaultParty,
  createDefaultPokedex,
  healParty,
  type FieldPokemon,
  type PokedexState
} from './pokemonStorage';
import { getAllCenterScriptHandlers } from './pokemonCenterTemplate';
import { getAllMartScriptHandlers, MART_STOCKS } from './martTemplate';
import type { FieldScriptSessionState } from './decompFieldDialogue';
import { runDecompFieldScript } from './decompFieldDialogue';
import {
  createPlayTimeCounter,
  getTotalPlayTimeMinutes,
  getTotalPlayTimeSeconds,
  startPlayTimeCounter,
  type PlayTimeCounter
} from './decompPlayTime';
import { DEFAULT_COINS, addCoins, getCoins, removeCoins, setCoins } from './decompCoins';
import { DEFAULT_MONEY, getMoney, setMoney } from './decompMoney';
import { MYSTERY_EVENT_MESSAGES } from './decompMysteryEventMsg';
import {
  createDefaultNewGameState,
  createDefaultPcStorageState,
  type DecompNewGameState
} from './decompNewGame';
import { getProfOaksRatingDialogue, getProfPcPokedexCount } from './decompProfPc';
import { setUnlockedPokedexFlags } from './decompSaveLocation';
import { getDecompTrainerDefinition, getDecompTrainerFlag } from './decompTrainerData';
import { createPcScreenEffectState, type PcScreenEffectState } from './decompPcScreenEffect';
import {
  createEventObjectLockState,
  type EventObjectLockState
} from './decompEventObjectLock';
import {
  createFieldPaletteFadeState,
  type FieldPaletteFadeState
} from './decompFieldPaletteFade';
import {
  createFieldAudioState,
  type FieldAudioState
} from './decompFieldSound';
import {
  createRoamerRuntime,
  type RoamerRuntime
} from './decompRoamer';
import {
  createDiplomaRuntime,
  type DiplomaRuntime
} from './decompDiploma';
import {
  createScriptMovementRuntime,
  type ScriptMovementRuntime
} from './decompScriptMovement';
import type { FishingTaskState } from './decompFishing';
import type { NpcState } from './npc';

export interface PendingTrainerBattle {
  trainerId: string;
  trainerName: string;
  defeatFlag: string;
  trainerClass: string;
  format: BattleFormat;
  victoryFlags: string[];
  trainerItems: string[];
  trainerAiFlags: string[];
  opponentParty: BattlePokemonSnapshot[];
  started: boolean;
  resolved: boolean;
  result: 'won' | 'lost' | null;
  continueScriptSession: {
    speakerId: string;
    session: FieldScriptSessionState;
  } | null;
}

export interface PcStorageState {
  currentBox: number;
  boxNames: string[];
  boxes: FieldPokemon[][];
}

export interface ScriptRuntimeState {
  vars: Record<string, number>;
  stringVars: Record<string, string>;
  flags: Set<string>;
  consumedTriggerIds: Set<string>;
  saveCounter: number;
  lastScriptId: string | null;
  startMenu: {
    mode: 'normal' | 'safari' | 'link' | 'unionRoom';
    playerName: string;
    playerGender: 'male' | 'female';
    hasPokedex: boolean;
    hasPokemon: boolean;
    seenPokemonCount: number;
  };
  options: {
    textSpeed: 'slow' | 'mid' | 'fast';
    battleScene: boolean;
    battleStyle: 'shift' | 'set';
    sound: 'mono' | 'stereo';
    buttonMode: 'help' | 'lr' | 'lEqualsA';
    frameType: number;
  };
  specialSaveWarpFlags: number;
  gcnLinkFlags: number;
  playTime: PlayTimeCounter;
  party: FieldPokemon[];
  pokedex: PokedexState;
  bag: BagState;
  pcStorage: PcStorageState;
  pendingTrainerBattle: PendingTrainerBattle | null;
  pcScreenEffect: PcScreenEffectState;
  eventObjectLock: EventObjectLockState;
  fieldPaletteFade: FieldPaletteFadeState;
  fieldAudio: FieldAudioState;
  roamer: RoamerRuntime;
  diploma: DiplomaRuntime;
  newGame: DecompNewGameState;
  scriptMovement: ScriptMovementRuntime;
  scriptMovementLocalIds: Record<string, number>;
  nextScriptMovementLocalId: number;
  doorAnimations: Record<string, 'open' | 'closed'>;
  doorAnimationTask: {
    active: boolean;
    framesRemaining: number;
    key: string | null;
  };
  fameChecker: {
    pickStates: Record<number, number>;
    flavorTextFlags: Record<number, number>;
    updates: Array<{
      person: number;
      value: number;
      special: string | null;
    }>;
  };
  dynamicWarp: {
    mapId: string;
    warpId: number;
    x: number;
    y: number;
  } | null;
  pendingScriptWarp: {
    mapId: string;
    warpId: number;
    x: number;
    y: number;
    kind: 'warp' | 'spin';
  } | null;
  fieldCamera: {
    active: boolean;
    position: { x: number; y: number };
    facing: PlayerState['facing'];
    initialFacing: PlayerState['facing'];
    currentTile?: { x: number; y: number };
    previousTile?: { x: number; y: number };
  } | null;
  fieldEffects: {
    screenShakeCount: number;
    teleporterHousingPhase: number;
    teleporterCablePhase: number;
    pokemonLeagueLightingActive: boolean;
    ssAnneDepartureScenePlayed: boolean;
    seagallopFerryScenePlayed: boolean;
    fallWarpCount: number;
    triggeredSpecials: Record<string, number>;
    fishing: FishingTaskState | null;
  };
}

export interface ScriptContext {
  player: PlayerState;
  dialogue: DialogueState;
  runtime: ScriptRuntimeState;
  speakerId?: string;
  npcs?: NpcState[];
}

export type ScriptHandler = (context: ScriptContext) => void;

const runDecompObjectScript = (
  scriptId: string,
  fallbackSpeakerId: string,
  { runtime, player, dialogue, speakerId, npcs }: ScriptContext
): void => {
  runDecompFieldScript(scriptId, {
    runtime,
    player,
    dialogue,
    speakerId: speakerId ?? fallbackSpeakerId,
    npcs
  });
};

export const syncLegacyPlayTimeVars = (runtime: ScriptRuntimeState): void => {
  runtime.vars.playTimeSeconds = getTotalPlayTimeSeconds(runtime.playTime);
  runtime.vars.playTimeMinutes = getTotalPlayTimeMinutes(runtime.playTime);
};

export const createScriptRuntimeState = (): ScriptRuntimeState => {
  const pokedex = createDefaultPokedex();
  const playTime = createPlayTimeCounter();
  startPlayTimeCounter(playTime);

  const runtime: ScriptRuntimeState = {
    vars: {},
    stringVars: {
      STR_VAR_1: '',
      STR_VAR_2: '',
      STR_VAR_3: '',
      STR_VAR_4: ''
    },
    flags: new Set<string>(),
    consumedTriggerIds: new Set<string>(),
    saveCounter: 0,
    lastScriptId: null,
    startMenu: {
      mode: 'normal',
      playerName: 'PLAYER',
      playerGender: 'male',
      hasPokedex: true,
      hasPokemon: true,
      seenPokemonCount: pokedex.seenSpecies.length
    },
    options: {
      textSpeed: 'mid',
      battleScene: true,
      battleStyle: 'shift',
      sound: 'stereo',
      buttonMode: 'help',
      frameType: 0
    },
    specialSaveWarpFlags: 0,
    gcnLinkFlags: 0,
    playTime,
    party: createDefaultParty(),
    pokedex,
    bag: createBagState(),
    pcStorage: createDefaultPcStorageState(),
    pendingTrainerBattle: null,
    pcScreenEffect: createPcScreenEffectState(),
    eventObjectLock: createEventObjectLockState(),
    fieldPaletteFade: createFieldPaletteFadeState(),
    fieldAudio: createFieldAudioState(),
    roamer: createRoamerRuntime(),
    diploma: createDiplomaRuntime(),
    newGame: createDefaultNewGameState(),
    scriptMovement: createScriptMovementRuntime(),
    scriptMovementLocalIds: {},
    nextScriptMovementLocalId: 1,
    doorAnimations: {},
    doorAnimationTask: {
      active: false,
      framesRemaining: 0,
      key: null
    },
    fameChecker: {
      pickStates: { 0: 2 },
      flavorTextFlags: {},
      updates: []
    },
    dynamicWarp: null,
    pendingScriptWarp: null,
    fieldCamera: null,
    fieldEffects: {
      screenShakeCount: 0,
      teleporterHousingPhase: 0,
      teleporterCablePhase: 0,
      pokemonLeagueLightingActive: false,
      ssAnneDepartureScenePlayed: false,
      seagallopFerryScenePlayed: false,
      fallWarpCount: 0,
      triggeredSpecials: {},
      fishing: null
    }
  };

  if (runtime.startMenu.hasPokedex) {
    setUnlockedPokedexFlags(runtime);
  }
  setCoins(runtime, DEFAULT_COINS);
  setMoney(runtime, DEFAULT_MONEY);
  syncLegacyPlayTimeVars(runtime);
  return runtime;
};

export const getScriptVar = (runtime: ScriptRuntimeState, key: string): number =>
  runtime.vars[key] ?? 0;

export const setScriptVar = (runtime: ScriptRuntimeState, key: string, value: number): void => {
  runtime.vars[key] = value;
};

export const addScriptVar = (runtime: ScriptRuntimeState, key: string, amount: number): number => {
  const nextValue = getScriptVar(runtime, key) + amount;
  runtime.vars[key] = nextValue;
  return nextValue;
};

export const isScriptFlagSet = (runtime: ScriptRuntimeState, flag: string): boolean =>
  runtime.flags.has(flag);

export const setScriptFlag = (runtime: ScriptRuntimeState, flag: string): void => {
  runtime.flags.add(flag);
};

export const clearScriptFlag = (runtime: ScriptRuntimeState, flag: string): void => {
  runtime.flags.delete(flag);
};

export const openScriptDialogue = (
  dialogue: DialogueState,
  speakerId: string,
  text: string
): void => {
  openDialogueSequence(dialogue, speakerId, [text]);
};

interface TrainerBattlePartyEntry {
  species: string;
  level: number;
  moveIds?: string[];
  heldItemId?: string | null;
}

interface ScriptedTrainerBattle {
  trainerId: string;
  trainerName: string;
  defeatFlag: string;
  trainerClass: string;
  victoryFlags?: string[];
  trainerItems?: string[];
  trainerAiFlags?: string[];
  party: TrainerBattlePartyEntry[];
}

const TRAINER_MONEY_VALUES: Record<string, number> = {
  TRAINER_CLASS_LEADER: 25,
  TRAINER_CLASS_ELITE_FOUR: 25,
  TRAINER_CLASS_PKMN_PROF: 25,
  TRAINER_CLASS_RIVAL_EARLY: 4,
  TRAINER_CLASS_RIVAL_LATE: 9,
  TRAINER_CLASS_CHAMPION: 25,
  TRAINER_CLASS_YOUNGSTER: 4,
  TRAINER_CLASS_BUG_CATCHER: 3,
  TRAINER_CLASS_HIKER: 9,
  TRAINER_CLASS_BIRD_KEEPER: 6,
  TRAINER_CLASS_PICNICKER: 5,
  TRAINER_CLASS_SUPER_NERD: 6,
  TRAINER_CLASS_FISHERMAN: 9,
  TRAINER_CLASS_TEAM_ROCKET: 8,
  TRAINER_CLASS_LASS: 4,
  TRAINER_CLASS_BEAUTY: 18,
  TRAINER_CLASS_BLACK_BELT: 6,
  TRAINER_CLASS_CUE_BALL: 6,
  TRAINER_CLASS_CHANNELER: 8,
  TRAINER_CLASS_ROCKER: 6,
  TRAINER_CLASS_GENTLEMAN: 18,
  TRAINER_CLASS_BURGLAR: 22,
  TRAINER_CLASS_SWIMMER_M: 1,
  TRAINER_CLASS_ENGINEER: 12,
  TRAINER_CLASS_JUGGLER: 10,
  TRAINER_CLASS_SAILOR: 8,
  TRAINER_CLASS_COOLTRAINER: 9,
  TRAINER_CLASS_POKEMANIAC: 12,
  TRAINER_CLASS_TAMER: 10,
  TRAINER_CLASS_CAMPER: 5,
  TRAINER_CLASS_PSYCHIC: 5,
  TRAINER_CLASS_BIKER: 5,
  TRAINER_CLASS_GAMER: 18,
  TRAINER_CLASS_SCIENTIST: 12,
  TRAINER_CLASS_CRUSH_GIRL: 6,
  TRAINER_CLASS_TUBER: 1,
  TRAINER_CLASS_PKMN_BREEDER: 7,
  TRAINER_CLASS_PKMN_RANGER: 9,
  TRAINER_CLASS_AROMA_LADY: 7,
  TRAINER_CLASS_RUIN_MANIAC: 12,
  TRAINER_CLASS_LADY: 50,
  TRAINER_CLASS_PAINTER: 4,
  TRAINER_CLASS_TWINS: 3,
  TRAINER_CLASS_YOUNG_COUPLE: 7,
  TRAINER_CLASS_SIS_AND_BRO: 1,
  TRAINER_CLASS_COOL_COUPLE: 6,
  TRAINER_CLASS_CRUSH_KIN: 6,
  TRAINER_CLASS_SWIMMER_F: 1,
  TRAINER_CLASS_PLAYER: 1,
  TRAINER_CLASS_RS_LEADER: 25,
  TRAINER_CLASS_RS_ELITE_FOUR: 25,
  TRAINER_CLASS_RS_LASS: 4,
  TRAINER_CLASS_RS_YOUNGSTER: 4,
  TRAINER_CLASS_PKMN_TRAINER: 15,
  TRAINER_CLASS_RS_HIKER: 10,
  TRAINER_CLASS_RS_BEAUTY: 20,
  TRAINER_CLASS_RS_FISHERMAN: 10,
  TRAINER_CLASS_RS_LADY: 50,
  TRAINER_CLASS_TRIATHLETE: 10,
  TRAINER_CLASS_TEAM_AQUA: 5,
  TRAINER_CLASS_RS_TWINS: 3,
  TRAINER_CLASS_RS_SWIMMER_F: 2,
  TRAINER_CLASS_RS_BUG_CATCHER: 4,
  TRAINER_CLASS_SCHOOL_KID: 5,
  TRAINER_CLASS_RICH_BOY: 50,
  TRAINER_CLASS_SR_AND_JR: 4,
  TRAINER_CLASS_RS_BLACK_BELT: 8,
  TRAINER_CLASS_RS_TUBER_F: 1,
  TRAINER_CLASS_HEX_MANIAC: 6,
  TRAINER_CLASS_RS_PKMN_BREEDER: 10,
  TRAINER_CLASS_TEAM_MAGMA: 5,
  TRAINER_CLASS_INTERVIEWER: 12,
  TRAINER_CLASS_RS_TUBER_M: 1,
  TRAINER_CLASS_RS_YOUNG_COUPLE: 8,
  TRAINER_CLASS_GUITARIST: 8,
  TRAINER_CLASS_RS_GENTLEMAN: 20,
  TRAINER_CLASS_RS_CHAMPION: 50,
  TRAINER_CLASS_MAGMA_LEADER: 20,
  TRAINER_CLASS_BATTLE_GIRL: 6,
  TRAINER_CLASS_RS_SWIMMER_M: 2,
  TRAINER_CLASS_POKEFAN: 20,
  TRAINER_CLASS_EXPERT: 10,
  TRAINER_CLASS_DRAGON_TAMER: 12,
  TRAINER_CLASS_RS_BIRD_KEEPER: 8,
  TRAINER_CLASS_NINJA_BOY: 3,
  TRAINER_CLASS_PARASOL_LADY: 10,
  TRAINER_CLASS_BUG_MANIAC: 15,
  TRAINER_CLASS_RS_SAILOR: 8,
  TRAINER_CLASS_COLLECTOR: 15,
  TRAINER_CLASS_RS_PKMN_RANGER: 12,
  TRAINER_CLASS_MAGMA_ADMIN: 10,
  TRAINER_CLASS_RS_AROMA_LADY: 10,
  TRAINER_CLASS_RS_RUIN_MANIAC: 15,
  TRAINER_CLASS_RS_COOLTRAINER: 12,
  TRAINER_CLASS_RS_POKEMANIAC: 15,
  TRAINER_CLASS_KINDLER: 8,
  TRAINER_CLASS_RS_CAMPER: 4,
  TRAINER_CLASS_RS_PICNICKER: 4,
  TRAINER_CLASS_RS_PSYCHIC: 6,
  TRAINER_CLASS_RS_SIS_AND_BRO: 3,
  TRAINER_CLASS_OLD_COUPLE: 10,
  TRAINER_CLASS_AQUA_ADMIN: 10,
  TRAINER_CLASS_AQUA_LEADER: 20,
  TRAINER_CLASS_BOSS: 25
};

const WHITE_OUT_MONEY_LOSS_MULTIPLIERS = [2, 4, 6, 9, 12, 16, 20, 25, 30] as const;
const WHITE_OUT_MONEY_LOSS_BADGE_FLAGS = [
  'FLAG_BADGE01_GET',
  'FLAG_BADGE02_GET',
  'FLAG_BADGE03_GET',
  'FLAG_BADGE04_GET',
  'FLAG_BADGE05_GET',
  'FLAG_BADGE06_GET',
  'FLAG_BADGE07_GET',
  'FLAG_BADGE08_GET'
] as const;

export const getRuntimeMoney = (runtime: ScriptRuntimeState): number =>
  getMoney(runtime);

export const setRuntimeMoney = (runtime: ScriptRuntimeState, amount: number): number => {
  return setMoney(runtime, amount);
};

export const getRuntimeCoins = (runtime: ScriptRuntimeState): number =>
  getCoins(runtime);

export const setRuntimeCoins = (runtime: ScriptRuntimeState, amount: number): number =>
  setCoins(runtime, amount);

export const addRuntimeCoins = (runtime: ScriptRuntimeState, amount: number): boolean =>
  addCoins(runtime, amount);

export const removeRuntimeCoins = (runtime: ScriptRuntimeState, amount: number): boolean =>
  removeCoins(runtime, amount);

export const getTrainerBattleMoneyReward = (
  trainerBattle: Pick<PendingTrainerBattle, 'opponentParty' | 'trainerClass'>,
  {
    moneyMultiplier = 1,
    isDoubleBattle = false
  }: {
    moneyMultiplier?: number;
    isDoubleBattle?: boolean;
  } = {}
): number => {
  const lastMonLevel = trainerBattle.opponentParty.at(-1)?.level ?? 0;
  const trainerMoneyValue = TRAINER_MONEY_VALUES[trainerBattle.trainerClass] ?? 0;
  return 4 * lastMonLevel * moneyMultiplier * (isDoubleBattle ? 2 : 1) * trainerMoneyValue;
};

export const computeWhiteOutMoneyLoss = (runtime: ScriptRuntimeState): number => {
  const badgeCount = WHITE_OUT_MONEY_LOSS_BADGE_FLAGS.reduce((count, flag) =>
    count + (isScriptFlagSet(runtime, flag) ? 1 : 0), 0);
  const topLevel = runtime.party.reduce((highest, pokemon) => Math.max(highest, pokemon.level), 0);
  const loss = topLevel * 4 * WHITE_OUT_MONEY_LOSS_MULTIPLIERS[badgeCount];
  return Math.min(getRuntimeMoney(runtime), loss);
};

export const applyPendingTrainerBattleOutcome = (
  runtime: ScriptRuntimeState,
  trainerBattle: PendingTrainerBattle,
  result: 'won' | 'lost'
): number => {
  if (result === 'won') {
    setScriptFlag(runtime, trainerBattle.defeatFlag);
    for (const flag of trainerBattle.victoryFlags) {
      setScriptFlag(runtime, flag);
    }
    if (isOakLabRivalTrainer(trainerBattle.trainerId)) {
      return 0;
    }
    const reward = getTrainerBattleMoneyReward(trainerBattle);
    setRuntimeMoney(runtime, getRuntimeMoney(runtime) + reward);
    return reward;
  }

  if (isOakLabRivalTrainer(trainerBattle.trainerId)) {
    return 0;
  }

  const loss = computeWhiteOutMoneyLoss(runtime);
  setRuntimeMoney(runtime, getRuntimeMoney(runtime) - loss);
  return -loss;
};

const createTrainerBattleParty = (entries: TrainerBattlePartyEntry[]): BattlePokemonSnapshot[] =>
  entries.map((entry) => {
    const pokemon = entry.moveIds && entry.moveIds.length > 0
      ? createBattlePokemonFromSpeciesWithMoves(entry.species, entry.level, entry.moveIds, { heldItemId: entry.heldItemId ?? null })
      : createBattlePokemonFromSpecies(entry.species, entry.level);
    pokemon.heldItemId = entry.heldItemId ?? pokemon.heldItemId;
    return pokemon;
  });

const createScriptedTrainerBattleFromDecomp = (
  trainerId: string,
  {
    defeatFlag = getDecompTrainerFlag(trainerId),
    victoryFlags = []
  }: {
    defeatFlag?: string;
    victoryFlags?: string[];
  } = {}
): ScriptedTrainerBattle => {
  const definition = getDecompTrainerDefinition(trainerId);
  if (!definition || definition.party.length === 0) {
    throw new Error(`Missing decomp trainer definition for ${trainerId}`);
  }

  return {
    trainerId: definition.trainerId,
    trainerName: definition.trainerName,
    defeatFlag,
    trainerClass: definition.trainerClass,
    victoryFlags,
    trainerItems: [...definition.trainerItems],
    trainerAiFlags: [...definition.trainerAiFlags],
    party: definition.party.map((entry) => ({
      species: entry.species,
      level: entry.level,
      moveIds: entry.moveIds,
      heldItemId: entry.heldItemId
    }))
  };
};

const queueTrainerBattleRequest = (
  runtime: ScriptRuntimeState,
  trainerBattle: ScriptedTrainerBattle
): void => {
  runtime.pendingTrainerBattle = {
    trainerId: trainerBattle.trainerId,
    trainerName: trainerBattle.trainerName,
    defeatFlag: trainerBattle.defeatFlag,
    trainerClass: trainerBattle.trainerClass,
    format: 'singles',
    victoryFlags: [...(trainerBattle.victoryFlags ?? [])],
    trainerItems: [...(trainerBattle.trainerItems ?? [])],
    trainerAiFlags: [...(trainerBattle.trainerAiFlags ?? [])],
    opponentParty: createTrainerBattleParty(trainerBattle.party),
    started: false,
    resolved: false,
    result: null,
    continueScriptSession: null
  };
};

const startTrainerBattleDialogue = (
  dialogue: DialogueState,
  runtime: ScriptRuntimeState,
  speakerId: string,
  introLines: string[],
  trainerBattle: ScriptedTrainerBattle
): void => {
  openDialogueSequence(dialogue, speakerId, introLines);
  queueTrainerBattleRequest(runtime, trainerBattle);
};

const TRAINER_BATTLE_VIRIDIAN_TAKASHI = createScriptedTrainerBattleFromDecomp('TRAINER_BLACK_BELT_TAKASHI', {
  defeatFlag: 'FLAG_DEFEATED_BLACK_BELT_TAKASHI'
});

const TRAINER_BATTLE_VIRIDIAN_YUJI = createScriptedTrainerBattleFromDecomp('TRAINER_COOLTRAINER_YUJI', {
  defeatFlag: 'FLAG_DEFEATED_COOLTRAINER_YUJI'
});

const TRAINER_BATTLE_VIRIDIAN_ATSUSHI = createScriptedTrainerBattleFromDecomp('TRAINER_BLACK_BELT_ATSUSHI', {
  defeatFlag: 'FLAG_DEFEATED_BLACK_BELT_ATSUSHI'
});

const TRAINER_BATTLE_VIRIDIAN_JASON = createScriptedTrainerBattleFromDecomp('TRAINER_TAMER_JASON', {
  defeatFlag: 'FLAG_DEFEATED_TAMER_JASON'
});

const TRAINER_BATTLE_VIRIDIAN_COLE = createScriptedTrainerBattleFromDecomp('TRAINER_TAMER_COLE', {
  defeatFlag: 'FLAG_DEFEATED_TAMER_COLE'
});

const TRAINER_BATTLE_VIRIDIAN_KIYO = createScriptedTrainerBattleFromDecomp('TRAINER_BLACK_BELT_KIYO', {
  defeatFlag: 'FLAG_DEFEATED_BLACK_BELT_KIYO'
});

const TRAINER_BATTLE_VIRIDIAN_SAMUEL = createScriptedTrainerBattleFromDecomp('TRAINER_COOLTRAINER_SAMUEL', {
  defeatFlag: 'FLAG_DEFEATED_COOLTRAINER_SAMUEL'
});

const TRAINER_BATTLE_VIRIDIAN_WARREN = createScriptedTrainerBattleFromDecomp('TRAINER_COOLTRAINER_WARREN', {
  defeatFlag: 'FLAG_DEFEATED_COOLTRAINER_WARREN'
});

const TRAINER_BATTLE_BROCK = createScriptedTrainerBattleFromDecomp('TRAINER_LEADER_BROCK', {
  defeatFlag: 'FLAG_DEFEATED_LEADER_BROCK',
  victoryFlags: ['FLAG_BADGE01_GET']
});

const TRAINER_BATTLE_LIAM = createScriptedTrainerBattleFromDecomp('TRAINER_CAMPER_LIAM', {
  defeatFlag: 'FLAG_DEFEATED_CAMPER_LIAM'
});

const TRAINER_BATTLE_DIANA = createScriptedTrainerBattleFromDecomp('TRAINER_PICNICKER_DIANA', {
  defeatFlag: 'FLAG_DEFEATED_PICNICKER_DIANA'
});

const TRAINER_BATTLE_LUIS = createScriptedTrainerBattleFromDecomp('TRAINER_SWIMMER_MALE_LUIS', {
  defeatFlag: 'FLAG_DEFEATED_SWIMMER_M_LUIS'
});

const TRAINER_BATTLE_TUCKER = createScriptedTrainerBattleFromDecomp('TRAINER_GENTLEMAN_TUCKER', {
  defeatFlag: 'FLAG_DEFEATED_GENTLEMAN_TUCKER'
});

const TRAINER_BATTLE_BAILY = createScriptedTrainerBattleFromDecomp('TRAINER_ENGINEER_BAILY', {
  defeatFlag: 'FLAG_DEFEATED_ENGINEER_BAILY'
});

const TRAINER_BATTLE_DWAYNE = createScriptedTrainerBattleFromDecomp('TRAINER_SAILOR_DWAYNE', {
  defeatFlag: 'FLAG_DEFEATED_SAILOR_DWAYNE'
});

const TRAINER_BATTLE_GIOVANNI = createScriptedTrainerBattleFromDecomp('TRAINER_LEADER_GIOVANNI', {
  defeatFlag: 'FLAG_DEFEATED_LEADER_GIOVANNI',
  victoryFlags: ['FLAG_BADGE08_GET']
});

const OAKS_AIDE_EVERSTONE_FLAG = 'FLAG_GOT_EVERSTONE_FROM_OAKS_AIDE';
const OAKS_AIDE_REQUIRED_OWNED_MONS = 20;
const MUSEUM_ADMISSION_VAR = 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F';
const MUSEUM_ADMISSION_PRICE = 50;
const OLD_AMBER_FLAG = 'FLAG_GOT_OLD_AMBER';
const SEISMIC_TOSS_TUTOR_FLAG = 'FLAG_TUTOR_SEISMIC_TOSS';
const BERRY_POWDER_JAR_FLAG = 'FLAG_GOT_POWDER_JAR';
const VERMILION_TRASH_FIRST_LOCK_VAR = 'VAR_VERMILION_GYM_TRASH_FIRST_LOCK';
const VERMILION_TRASH_SECOND_LOCK_VAR = 'VAR_VERMILION_GYM_TRASH_SECOND_LOCK';
const VERMILION_TRASH_FIRST_CAN = 3;
const VERMILION_TRASH_SECOND_CAN = 4;
const MAGIKARP_PRICE = 500;
const MAGIKARP_SELLER_FLAG = 'FLAG_BOUGHT_MAGIKARP';
const OAKS_AIDE_HM05_FLAG = 'FLAG_GOT_HM05';
const OAKS_AIDE_HM05_REQUIRED_SEEN_MONS = 10;

export const isOakLabRivalTrainer = (trainerId: string): boolean =>
  trainerId === 'TRAINER_RIVAL_OAKS_LAB_SQUIRTLE'
  || trainerId === 'TRAINER_RIVAL_OAKS_LAB_BULBASAUR'
  || trainerId === 'TRAINER_RIVAL_OAKS_LAB_CHARMANDER';

const getRoute10AideIntro = (playerName: string): string[] => [
  `Oh... ${playerName}!`,
  "I've been looking for you!",
  "It's me, one of the ever-present\nAIDES to PROF. OAK.",
  "If your POKeDEX has complete data\non twenty species, I'm supposed to\ngive you a reward from PROF. OAK.",
  'He entrusted me with this\nEVERSTONE.',
  `So, ${playerName}, let me ask you.`,
  'Have you gathered data on at least\ntwenty kinds of POKeMON?'
];

const ROUTE10_AIDE_EXPLAIN_EVERSTONE: string[] = [
  'Making POKeMON evolve certainly\ncan add to the POKeDEX.',
  'However, at times, you may not\nwant a certain POKeMON to evolve.',
  'In that case, give the EVERSTONE\nto that POKeMON.',
  'It will prevent evolution according\nto the PROFESSOR.'
];

const teachMoveToFirstPartyPokemon = (
  runtime: ScriptRuntimeState,
  moveName: string
): boolean => {
  const pokemon = runtime.party[0];
  if (!pokemon) {
    return false;
  }

  pokemon.moves = [...(pokemon.moves ?? [])];
  if (pokemon.moves.includes(moveName)) {
    return true;
  }

  if (pokemon.moves.length >= 4) {
    pokemon.moves[0] = moveName;
  } else {
    pokemon.moves.push(moveName);
  }
  return true;
};

const createRoute4Magikarp = (): FieldPokemon => ({
  species: 'MAGIKARP',
  nickname: 'MAGIKARP',
  level: 5,
  moves: ['SPLASH'],
  maxHp: 18,
  hp: 18,
  attack: 6,
  defense: 10,
  speed: 12,
  spAttack: 5,
  spDefense: 6,
  catchRate: 255,
  types: ['water'],
  status: 'none'
});

const handleVermilionTrashCan = (
  runtime: ScriptRuntimeState,
  dialogue: DialogueState,
  canId: number
): void => {
  if (isScriptFlagSet(runtime, 'FLAG_BADGE03_GET')) {
    openScriptDialogue(dialogue, 'system', 'The electric locks are already open.');
    return;
  }

  const firstLock = getScriptVar(runtime, VERMILION_TRASH_FIRST_LOCK_VAR);
  const secondLock = getScriptVar(runtime, VERMILION_TRASH_SECOND_LOCK_VAR);
  if (secondLock !== 0) {
    openScriptDialogue(dialogue, 'system', 'The second electric lock is open!');
    return;
  }

  if (firstLock === 0) {
    if (canId === VERMILION_TRASH_FIRST_CAN) {
      setScriptVar(runtime, VERMILION_TRASH_FIRST_LOCK_VAR, canId);
      openScriptDialogue(dialogue, 'system', 'Hey! There is a switch under the trash!\nThe first electric lock opened!');
      return;
    }

    openScriptDialogue(dialogue, 'system', "Nope! There's only trash here.");
    return;
  }

  if (canId === VERMILION_TRASH_SECOND_CAN) {
    setScriptVar(runtime, VERMILION_TRASH_SECOND_LOCK_VAR, canId);
    openScriptDialogue(dialogue, 'system', 'Hey! There is another switch under the trash!\nThe second electric lock opened!');
    return;
  }

  setScriptVar(runtime, VERMILION_TRASH_FIRST_LOCK_VAR, 0);
  openScriptDialogue(dialogue, 'system', "Nope! There's only trash here.\nThe electric locks reset!");
};


// engine resolves script pointers from events in field_control_avatar.c.
export const prototypeScriptRegistry: Record<string, ScriptHandler> = {
  'sign.route-tips': ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      'TRAINER TIPS: Press and hold Shift to run faster.'
    );
  },
  'sign.route-post': ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      'ROUTE: Prototype path ahead. Watch for NPC patrols.'
    );
  },
  'coord.route-warning': ({ dialogue, runtime }) => {
    const seenCount = getScriptVar(runtime, 'routeWarningSeen');
    setScriptVar(runtime, 'routeWarningSeen', seenCount + 1);
    openScriptDialogue(
      dialogue,
      'system',
      seenCount === 0
        ? 'A chill wind blows from the east...'
        : 'You feel that same chill again.'
    );
  },
  'coord.route-warning-followup': ({ dialogue, runtime }) => {
    setScriptFlag(runtime, 'routeWarningAcknowledged');
    openScriptDialogue(dialogue, 'system', 'You steel yourself and push onward.');
  },
  'warp.route-pool': ({ dialogue, player }) => {
    player.position.x = 2 * 16;
    player.position.y = 2 * 16;
    clearPlayerMovement(player);
    openScriptDialogue(dialogue, 'system', 'You were whisked back to the trailhead.');
  },
  'object.npc-lass-01.interact': ({ dialogue, runtime }) => {
    const seenIntro = isScriptFlagSet(runtime, 'npc.lass01.introSeen');
    if (!seenIntro) {
      setScriptFlag(runtime, 'npc.lass01.introSeen');
      openDialogueSequence(dialogue, 'npc-lass-01', [
        'The grass rustles when wild Pokémon are near.',
        'I am pacing this route to train my team!'
      ]);
      return;
    }

    const routeWarnings = getScriptVar(runtime, 'routeWarningSeen');
    openDialogueSequence(dialogue, 'npc-lass-01', [
      'Back again? Keep your Pokémon healthy out there.',
      routeWarnings >= 2
        ? 'That eastern wind still feels strange... stay alert.'
        : 'Try talking to every trainer and every sign.'
    ]);
  },
  'object.npc-bugcatcher-01.interact': ({ dialogue, runtime }) => {
    const seenCount = getScriptVar(runtime, 'bugcatcherSeen');
    addScriptVar(runtime, 'bugcatcherSeen', 1);
    openDialogueSequence(dialogue, 'npc-bugcatcher-01', [
      'My Caterpie and I are taking a breather.',
      seenCount === 0
        ? 'Talk to me again and I will share more bug-catching tips.'
        : 'Remember: look for moving grass to find wild encounters.'
    ]);
  },
  ViridianCity_Mart_EventScript_Clerk: (context) => {
    runDecompObjectScript(
      'ViridianCity_Mart_EventScript_Clerk',
      'LOCALID_VIRIDIAN_MART_CLERK',
      context
    );
  },
  PokedexRating_EventScript_RateInPerson: ({ dialogue, runtime, speakerId }) => {
    const ratingDialogue = getProfOaksRatingDialogue(
      runtime,
      isScriptFlagSet(runtime, 'FLAG_OAK_SAW_DEX_COMPLETION')
    );
    if (ratingDialogue.nationalComplete) {
      setScriptFlag(runtime, 'FLAG_OAK_SAW_DEX_COMPLETION');
    }
    openDialogueSequence(
      dialogue,
      speakerId ?? 'LOCALID_OAKS_LAB_PROF_OAK',
      ratingDialogue.pages
    );
  },
  Route10_PokemonCenter_1F_EventScript_Aide: ({ dialogue, runtime }) => {
    const playerName = runtime.startMenu.playerName;
    const ownedCount = getProfPcPokedexCount(runtime, false).ownedCount;
    const everstoneName = getItemDefinition('ITEM_EVERSTONE').name;

    if (isScriptFlagSet(runtime, OAKS_AIDE_EVERSTONE_FLAG)) {
      openDialogueSequence(
        dialogue,
        'Route10_PokemonCenter_1F_ObjectEvent_Aide',
        ROUTE10_AIDE_EXPLAIN_EVERSTONE
      );
      return;
    }

    const intro = getRoute10AideIntro(playerName);
    if (ownedCount < OAKS_AIDE_REQUIRED_OWNED_MONS) {
      openDialogueSequence(dialogue, 'Route10_PokemonCenter_1F_ObjectEvent_Aide', [
        ...intro,
        `Let's see...\nUh-oh! You have caught only\n${ownedCount} kinds of POKeMON!`,
        `You need ${OAKS_AIDE_REQUIRED_OWNED_MONS} kinds\nif you want the ${everstoneName}.`
      ]);
      return;
    }

    if (!checkBagHasSpace(runtime.bag, 'ITEM_EVERSTONE', 1)) {
      openDialogueSequence(dialogue, 'Route10_PokemonCenter_1F_ObjectEvent_Aide', [
        ...intro,
        `Oh! I see you don't have any\nroom for the ${everstoneName}.`
      ]);
      return;
    }

    addBagItem(runtime.bag, 'ITEM_EVERSTONE', 1);
    setScriptFlag(runtime, OAKS_AIDE_EVERSTONE_FLAG);
    openDialogueSequence(dialogue, 'Route10_PokemonCenter_1F_ObjectEvent_Aide', [
      ...intro,
      `Great! You have caught or owned\n${ownedCount} kinds of POKeMON!`,
      'Congratulations!\nHere you go!',
      `${playerName} received the EVERSTONE\nfrom the AIDE.`,
      ...ROUTE10_AIDE_EXPLAIN_EVERSTONE
    ]);
  },
  ViridianCity_School_EventScript_Woman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'LOCALID_SCHOOL_WOMAN', [
      'Okay!',
      "Be sure to read what's on the blackboard carefully!"
    ]);
  },
  ViridianCity_School_EventScript_Lass: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'LOCALID_SCHOOL_LASS', [
      "Whew! I'm trying to memorize all my notes."
    ]);
  },
  ViridianCity_House_EventScript_BaldingMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_House_ObjectEvent_BaldingMan', [
      'Coming up with nicknames is fun,',
      "but it's not so easy to do.",
      'Clever names are nice, but simple',
      'names are easier to remember.'
    ]);
  },
  ViridianCity_House_EventScript_LittleGirl: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'ViridianCity_House_ObjectEvent_LittleGirl',
      'My daddy loves POKéMON, too.'
    );
  },
  ViridianCity_House_EventScript_Speary: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'ViridianCity_House_ObjectEvent_Speary', [
      'SPEARY: Tetweet!'
    ]);
  },
  ViridianCity_House_EventScript_NicknameSign: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'SPEAROW\nName: SPEARY'
    );
  },
  ViridianCity_EventScript_GymDoorLocked: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'system', [
      "VIRIDIAN GYM's doors are locked..."
    ]);
  },
  ViridianCity_EventScript_GymDoor: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_VIRIDIAN_CITY_GYM_DOOR') === 1) {
      return;
    }
    openScriptDialogue(
      dialogue,
      'system',
      "VIRIDIAN GYM's doors are locked..."
    );
  },
  ViridianCity_EventScript_GymSign: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      'VIRIDIAN CITY\nPOKeMON GYM'
    );
  },
  ViridianCity_Gym_EventScript_GymStatue: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_BADGE08_GET');
    openScriptDialogue(
      dialogue,
      'sign',
      defeated
        ? 'VIRIDIAN POKeMON GYM\nLEADER: GIOVANNI'
        : 'VIRIDIAN POKeMON GYM\nLEADER: ?'
    );
  },
  ViridianCity_Gym_EventScript_Giovanni: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_GIOVANNI')) {
      openDialogueSequence(dialogue, 'LOCALID_VIRIDIAN_GIOVANNI', [
        'Having lost, I cannot face my underlings!',
        'TEAM ROCKET is done forever!',
        'I will dedicate my life to the study of POKeMON!',
        'Let us meet again some day. Farewell!'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'LOCALID_VIRIDIAN_GIOVANNI', [
      'So, I must say, you have finally arrived.',
      "I am GIOVANNI, the leader of TEAM ROCKET. I am the VIRIDIAN GYM's LEADER.",
      "I've waited a long time for a challenger like you.",
    ], TRAINER_BATTLE_GIOVANNI);
  },
  ViridianCity_Gym_EventScript_GymGuy: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_GIOVANNI');
    if (defeated) {
      openScriptDialogue(
        dialogue,
        'ViridianCity_Gym_ObjectEvent_GymGuy',
        'Blow me away! GIOVANNI was the GYM LEADER of VIRIDIAN?'
      );
      return;
    }
    openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_GymGuy', [
      'Yo! Champ in the making!',
      "Even I don't know the VIRIDIAN LEADER's identity.",
      "But one thing's certain. This will be the toughest of all the GYM LEADERS.",
      'Also, I heard that the TRAINERS here like GROUND-type POKeMON.'
    ]);
  },
  ViridianCity_Gym_EventScript_Takashi: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_BLACK_BELT_TAKASHI')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Takashi', [
        "The POKeMON LEAGUE?",
        "You? Don't get cocky!"
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Takashi', [
      "I'm the KARATE KING!",
      'Your fate rests with me!'
    ], TRAINER_BATTLE_VIRIDIAN_TAKASHI);
  },
  ViridianCity_Gym_EventScript_Yuji: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_COOLTRAINER_YUJI')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Yuji', [
        "You'll need power to keep up with",
        'our GYM LEADER.'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Yuji', [
      'Heh!',
      'You must be running out of steam',
      'by now!'
    ], TRAINER_BATTLE_VIRIDIAN_YUJI);
  },
  ViridianCity_Gym_EventScript_Atsushi: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_BLACK_BELT_ATSUSHI')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Atsushi', [
        "I'm still not worthy!"
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Atsushi', [
      'Rrrroar!',
      "I'm working myself into a rage!"
    ], TRAINER_BATTLE_VIRIDIAN_ATSUSHI);
  },
  ViridianCity_Gym_EventScript_Jason: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_TAMER_JASON')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Jason', [
        'Do you know the identity of our',
        'GYM LEADER?'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Jason', [
      'POKéMON and I, we make wonderful',
      'music together!'
    ], TRAINER_BATTLE_VIRIDIAN_JASON);
  },
  ViridianCity_Gym_EventScript_Cole: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_TAMER_COLE')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Cole', [
        'Wait!',
        'I was just careless!'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Cole', [
      'Your POKéMON will cower at the',
      'crack of my whip!'
    ], TRAINER_BATTLE_VIRIDIAN_COLE);
  },
  ViridianCity_Gym_EventScript_Kiyo: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_BLACK_BELT_KIYO')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Kiyo', [
        'If my POKéMON were as good at',
        'karate as I…'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Kiyo', [
      'Karate is the ultimate form of',
      'martial arts!'
    ], TRAINER_BATTLE_VIRIDIAN_KIYO);
  },
  ViridianCity_Gym_EventScript_Samuel: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_COOLTRAINER_SAMUEL')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Samuel', [
        'You can go on to the POKéMON',
        'LEAGUE only by defeating our GYM',
        'LEADER!'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Samuel', [
      'VIRIDIAN GYM was closed for a',
      'long time.',
      'But now, our LEADER is back!'
    ], TRAINER_BATTLE_VIRIDIAN_SAMUEL);
  },
  ViridianCity_Gym_EventScript_Warren: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_COOLTRAINER_WARREN')) {
      openDialogueSequence(dialogue, 'ViridianCity_Gym_ObjectEvent_Warren', [
        'The LEADER will scold me for',
        'losing this way…'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'ViridianCity_Gym_ObjectEvent_Warren', [
      'The truly talented win with style.'
    ], TRAINER_BATTLE_VIRIDIAN_WARREN);
  },
  PewterCity_Gym_EventScript_Brock: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK')) {
      openDialogueSequence(dialogue, 'PewterCity_Gym_ObjectEvent_Brock', [
        'There are all kinds of TRAINERS in this huge world of ours.',
        'You appear to be very gifted as a POKéMON TRAINER.',
        'So let me make a suggestion.',
        'Go to the GYM in CERULEAN and test your abilities.'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'PewterCity_Gym_ObjectEvent_Brock', [
      "So, you're here. I'm BROCK.",
      "I'm PEWTER's GYM LEADER.",
      'My rock-hard willpower is evident even in my POKéMON.',
      "My POKéMON are all rock hard, and have true-grit determination.",
      "That's right - my POKéMON are all the ROCK type!",
      "Fuhaha! You're going to challenge me knowing that you'll lose?",
      "That's the TRAINER's honor that compels you to challenge me.",
      'Fine, then! Show me your best!'
    ], TRAINER_BATTLE_BROCK);
  },
  PewterCity_Gym_EventScript_Liam: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_CAMPER_LIAM')) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Gym_ObjectEvent_Liam',
        "You're pretty hot. …But not as hot as BROCK!"
      );
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'PewterCity_Gym_ObjectEvent_Liam', [
      "Stop right there, kid!",
      "You're ten thousand light-years from facing BROCK!"
    ], TRAINER_BATTLE_LIAM);
  },
  PewterCity_Gym_EventScript_GymGuy: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK');
    if (defeated) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Gym_ObjectEvent_GymGuy',
        'You pulled it off! You beat BROCK! You must be dreaming about this. But keep dreaming, because the next challenge awaits!'
      );
      return;
    }
    openDialogueSequence(dialogue, 'PewterCity_Gym_ObjectEvent_GymGuy', [
      'Yo! Champ in the making!',
      "BROCK uses rock-type POKéMON.",
      'The ROCK type is really durable against physical attacks.',
      "If you can inflict Special damage, you'll have an edge.",
      'Your POKéMON will need the right moves, though.'
    ]);
  },
  PewterCity_Gym_EventScript_GymStatue: ({ dialogue, runtime }) => {
    const defeated = isScriptFlagSet(runtime, 'FLAG_DEFEATED_LEADER_BROCK');
    openScriptDialogue(
      dialogue,
      'sign',
      defeated
        ? 'PEWTER POKéMON GYM\nLEADER: BROCK'
        : 'PEWTER POKéMON GYM\nLEADER: ?'
    );
  },
  PewterCity_House1_EventScript_BaldingMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_House1_ObjectEvent_BaldingMan', [
      "Our POKéMON's an outsider, so it's finicky and hard to handle.",
      'An outsider is a POKéMON that you get in a trade.',
      'It grows fast, but it may ignore an unskilled TRAINER in battle.',
      'If only we had some BADGES…'
    ]);
  },
  PewterCity_House1_EventScript_LittleBoy: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_House1_ObjectEvent_LittleBoy',
      'NIDORAN, sit!'
    );
  },
  PewterCity_House1_EventScript_Nidoran: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'LOCALID_PEWTER_HOUSE_NIDORAN',
      'NIDORAN\u2642: Bowbow!'
    );
  },
  PewterCity_House2_EventScript_OldMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_House2_ObjectEvent_OldMan', [
      'POKéMON learn new techniques as they grow.',
      'But some moves must be taught to them by people.'
    ]);
  },
  PewterCity_House2_EventScript_LittleBoy: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_House2_ObjectEvent_LittleBoy', [
      'A POKéMON becomes easier to catch if it has a status problem.',
      'Sleep, poison, burn, or paralysis…',
      "Those are all effective. But catching POKéMON is never a sure thing!"
    ]);
  },
  PewterCity_Museum_1F_EventScript_Scientist1: ({ dialogue, runtime }) => {
    const paid = getScriptVar(runtime, MUSEUM_ADMISSION_VAR) !== 0;
    if (paid) {
      openScriptDialogue(
        dialogue,
        'LOCALID_MUSEUM_SCIENTIST1',
        'Please enjoy the exhibits!'
      );
      return;
    }
    if (getRuntimeMoney(runtime) < MUSEUM_ADMISSION_PRICE) {
      openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
        "It's \u00a550 for a child's ticket.",
        "You don't have enough money."
      ]);
      return;
    }
    setRuntimeMoney(runtime, getRuntimeMoney(runtime) - MUSEUM_ADMISSION_PRICE);
    setScriptVar(runtime, MUSEUM_ADMISSION_VAR, 1);
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "It's \u00a550 for a child's ticket.",
      'Would you like to come in?',
      'Right, \u00a550! Thank you!'
    ]);
  },
  PewterCity_Museum_1F_EventScript_OldMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_OldMan', [
      'I should be grateful for my long life.',
      'Never did I think I would get to see the bones of a dragon!'
    ]);
  },
  PewterCity_Museum_1F_EventScript_OldAmberScientist: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, OLD_AMBER_FLAG)) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Museum_1F_ObjectEvent_OldAmberScientist',
        'Take good care of that OLD AMBER!'
      );
      return;
    }
    if (!checkBagHasSpace(runtime.bag, 'ITEM_OLD_AMBER', 1)) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Museum_1F_ObjectEvent_OldAmberScientist',
        'Make room in your BAG, then come back for the OLD AMBER.'
      );
      return;
    }
    addBagItem(runtime.bag, 'ITEM_OLD_AMBER', 1);
    setScriptFlag(runtime, OLD_AMBER_FLAG);
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_OldAmberScientist', [
      'Ssh! Listen, I need to share a secret with someone.',
      'I think that this chunk of AMBER contains POKéMON DNA!',
      "I want you to get this examined at a POKéMON LAB somewhere.",
      `${runtime.startMenu.playerName} received the OLD AMBER.`
    ]);
  },
  PewterCity_Museum_1F_EventScript_OldAmber: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "It's a piece of amber containing ancient POKéMON DNA."
    );
  },
  PewterCity_Museum_1F_EventScript_Scientist2: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_Scientist2', [
      'We have two fossils of rare, prehistoric POKéMON on exhibit.'
    ]);
  },
  PewterCity_Museum_1F_EventScript_SeismicTossTutor: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, SEISMIC_TOSS_TUTOR_FLAG)) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Museum_1F_ObjectEvent_SeismicTossTutor',
        'A POKéMON can learn a move only once from a move tutor.'
      );
      return;
    }
    if (!teachMoveToFirstPartyPokemon(runtime, 'SEISMIC TOSS')) {
      openScriptDialogue(
        dialogue,
        'PewterCity_Museum_1F_ObjectEvent_SeismicTossTutor',
        "You don't have a POKéMON that can learn SEISMIC TOSS."
      );
      return;
    }
    setScriptFlag(runtime, SEISMIC_TOSS_TUTOR_FLAG);
    openDialogueSequence(dialogue, 'PewterCity_Museum_1F_ObjectEvent_SeismicTossTutor', [
      'The secrets of space… The mysteries of earth…',
      '…The only thing you should toss…',
      'Well, how about SEISMIC TOSS?',
      'Should I teach that to a POKéMON?',
      `${runtime.party[0]?.nickname ?? runtime.party[0]?.species ?? 'POKéMON'} learned SEISMIC TOSS.`
    ]);
  },
  PewterCity_Museum_1F_EventScript_AerodactylFossil: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'AERODACTYL Fossil\nA primitive and rare POKéMON.'
    );
  },
  PewterCity_Museum_1F_EventScript_KabutopsFossil: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'KABUTOPS Fossil\nA primitive and rare POKéMON.'
    );
  },
  PewterCity_Museum_1F_EventScript_PokemonJournalBrock: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "It's a POKéMON journal about BROCK. (Content stub pending script engine.)"
    );
  },
  PewterCity_Museum_1F_EventScript_EntranceTriggerLeft: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0) {
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "Come again, come again! You're always welcome!"
    ]);
  },
  PewterCity_Museum_1F_EventScript_EntranceTriggerMid: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0) {
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "Come again, come again! You're always welcome!"
    ]);
  },
  PewterCity_Museum_1F_EventScript_EntranceTriggerRight: ({ dialogue, runtime }) => {
    if (getScriptVar(runtime, 'VAR_MAP_SCENE_PEWTER_CITY_MUSEUM_1F') !== 0) {
      return;
    }
    openDialogueSequence(dialogue, 'LOCALID_MUSEUM_SCIENTIST1', [
      "Come again, come again! You're always welcome!"
    ]);
  },
  PewterCity_Museum_2F_EventScript_Scientist: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_2F_ObjectEvent_Scientist', [
      'This month, we are running a space exhibit.'
    ]);
  },
  PewterCity_Museum_2F_EventScript_Man: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_2F_ObjectEvent_Man', [
      'July 20, 1969!',
      "Humankind first set foot on the moon that day.",
      'I bought a color TV just so I could watch that news.'
    ]);
  },
  PewterCity_Museum_2F_EventScript_OldMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_Museum_2F_ObjectEvent_OldMan', [
      'MOON STONE, huh?',
      "What's so special about it?",
      'Looks like an ordinary rock to me.'
    ]);
  },
  PewterCity_Museum_2F_EventScript_LittleGirl: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Museum_2F_ObjectEvent_LittleGirl',
      'I want a PIKACHU! It is so cute! I asked my daddy to catch me one!'
    );
  },
  PewterCity_Museum_2F_EventScript_BaldingMan: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Museum_2F_ObjectEvent_BaldingMan',
      'Yeah, a PIKACHU soon, I promise!'
    );
  },
  PewterCity_Museum_2F_EventScript_MoonStone: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "A meteorite that fell on MT. MOON.\nIt is thought to be a MOON STONE."
    );
  },
  PewterCity_Museum_2F_EventScript_SpaceShuttle: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'Space Shuttle'
    );
  },
  PewterCity_Mart_EventScript_Clerk: (context) => {
    runDecompObjectScript(
      'PewterCity_Mart_EventScript_Clerk',
      'PewterCity_Mart_ObjectEvent_Clerk',
      context
    );
  },
  PewterCity_Mart_EventScript_Youngster: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Mart_ObjectEvent_Youngster',
      'You can buy things here that you cannot find elsewhere.'
    );
  },
  PewterCity_Mart_EventScript_Boy: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_Mart_ObjectEvent_Boy',
      'All POKéMON are different. Even the same type of POKéMON can have different moves.'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_Jigglypuff: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_Jigglypuff',
      'JIGGLYPUFF: Puu pupuu!'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_Gentleman: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_Gentleman',
      'I heard that there are many trainers with outstanding POKéMON in CERULEAN CITY.'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_Youngster: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'PewterCity_PokemonCenter_1F_ObjectEvent_Youngster', [
      'POKéMON LEAGUE registration is over at the reception desk.',
      'If you want to enter, go over there.'
    ]);
  },
  PewterCity_PokemonCenter_1F_EventScript_GBAKid1: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_GBAKid1',
      'You can trade POKéMON with your friends. (Link stub — pending connectivity.)'
    );
  },
  PewterCity_PokemonCenter_1F_EventScript_GBAKid2: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'PewterCity_PokemonCenter_1F_ObjectEvent_GBAKid2',
      'You can battle POKéMON with your friends. (Link stub — pending connectivity.)'
    );
  },
  Common_EventScript_UnionRoomAttendant: (context) => {
    runDecompObjectScript(
      'Common_EventScript_UnionRoomAttendant',
      'Common_EventScript_UnionRoomAttendant',
      context
    );
  },
  Common_EventScript_WirelessClubAttendant: (context) => {
    runDecompObjectScript(
      'Common_EventScript_WirelessClubAttendant',
      'Common_EventScript_WirelessClubAttendant',
      context
    );
  },
  Common_EventScript_DirectCornerAttendant: (context) => {
    runDecompObjectScript(
      'Common_EventScript_DirectCornerAttendant',
      'Common_EventScript_DirectCornerAttendant',
      context
    );
  },
  CableClub_EventScript_MysteryGiftMan: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'CableClub_EventScript_MysteryGiftMan',
      'The deliveryman has no MYSTERY GIFT for you right now.'
    );
  },
  CeruleanCity_Gym_EventScript_Misty: (context) => {
    runDecompObjectScript(
      'CeruleanCity_Gym_EventScript_Misty',
      'CeruleanCity_Gym_ObjectEvent_Misty',
      context
    );
  },
  CeruleanCity_Gym_EventScript_Diana: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_PICNICKER_DIANA')) {
      openScriptDialogue(
        dialogue,
        'CeruleanCity_Gym_ObjectEvent_Diana',
        'You have to face other TRAINERS to see how good you really are.'
      );
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'CeruleanCity_Gym_ObjectEvent_Diana', [
      'What? You?',
      "I'm more than good enough for you!",
      "MISTY won't have to be bothered."
    ], TRAINER_BATTLE_DIANA);
  },
  CeruleanCity_Gym_EventScript_Luis: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_SWIMMER_M_LUIS')) {
      openDialogueSequence(dialogue, 'CeruleanCity_Gym_ObjectEvent_Luis', [
        "MISTY is a TRAINER who's going to keep improving.",
        "She won't lose to someone like you!"
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'CeruleanCity_Gym_ObjectEvent_Luis', [
      'Splash!',
      "I'm first up!",
      "Let's do it!"
    ], TRAINER_BATTLE_LUIS);
  },
  CeruleanCity_Gym_EventScript_GymGuy: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_MISTY')) {
      openDialogueSequence(dialogue, 'CeruleanCity_Gym_ObjectEvent_GymGuy', [
        'You beat MISTY!',
        "See, what'd I tell ya?",
        'You and me, kid, we make a pretty darn-good team!'
      ]);
      return;
    }
    openDialogueSequence(dialogue, 'CeruleanCity_Gym_ObjectEvent_GymGuy', [
      'Yo! Champ in the making!',
      'The LEADER, MISTY, is a pro who uses WATER-type POKéMON.',
      'You can drain all their water with GRASS-type POKéMON.',
      'Or, you might use ELECTRIC-type POKéMON and zap them!'
    ]);
  },
  CeruleanCity_Gym_EventScript_GymStatue: ({ dialogue, runtime }) => {
    openScriptDialogue(
      dialogue,
      'sign',
      isScriptFlagSet(runtime, 'FLAG_BADGE02_GET')
        ? 'CERULEAN POKéMON GYM\nLEADER: MISTY\nWINNING TRAINERS:\nRIVAL, PLAYER'
        : 'CERULEAN POKéMON GYM\nLEADER: MISTY\nWINNING TRAINERS:\nRIVAL'
    );
  },
  CeruleanCity_House2_EventScript_Hiker: ({ dialogue, runtime }) => {
    openDialogueSequence(
      dialogue,
      'CeruleanCity_House2_ObjectEvent_Hiker',
      isScriptFlagSet(runtime, 'FLAG_GOT_TM28_FROM_ROCKET')
        ? [
            "I figure what's lost is lost.",
            'I decided to teach DIGLETT how to DIG without a TM.'
          ]
        : [
            'Those miserable ROCKETS!',
            "Look what they've done to my house!",
            'They stole a TM for teaching POKéMON how to DIG holes!'
          ]
    );
  },
  CeruleanCity_House2_EventScript_Lass: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'CeruleanCity_House2_ObjectEvent_Lass',
      'TEAM ROCKET must be trying to DIG their way into no good!'
    );
  },
  CeruleanCity_House2_EventScript_WallHole: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'system', 'TEAM ROCKET left a way out!');
  },
  CeruleanCity_House3_EventScript_OldWoman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'CeruleanCity_House3_ObjectEvent_OldWoman', [
      'My husband likes trading POKéMON.',
      "You're collecting POKéMON for your POKéDEX, aren't you?",
      'Would you please trade with him?'
    ]);
  },
  CeruleanCity_House3_EventScript_Dontae: (context) => {
    runDecompObjectScript(
      'CeruleanCity_House3_EventScript_Dontae',
      'CeruleanCity_House3_ObjectEvent_Dontae',
      context
    );
  },
  CeruleanCity_BikeShop_EventScript_Clerk: (context) => {
    runDecompObjectScript(
      'CeruleanCity_BikeShop_EventScript_Clerk',
      'CeruleanCity_BikeShop_ObjectEvent_Clerk',
      context
    );
  },
  CeruleanCity_BikeShop_EventScript_Woman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'CeruleanCity_BikeShop_ObjectEvent_Woman', [
      'A plain city bike is good enough for me.',
      "After all, you can't put a shopping basket on a mountain bike."
    ]);
  },
  CeruleanCity_BikeShop_EventScript_Youngster: ({ dialogue, runtime }) => {
    openScriptDialogue(
      dialogue,
      'CeruleanCity_BikeShop_ObjectEvent_Youngster',
      isScriptFlagSet(runtime, 'FLAG_GOT_BICYCLE')
        ? 'Wow. Your BIKE is really cool!'
        : "These bikes are cool, but they're way expensive!"
    );
  },
  CeruleanCity_BikeShop_EventScript_Bicycle: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'system', 'A shiny new BICYCLE!');
  },
  CeruleanCity_House4_EventScript_WonderNewsBerryMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'LOCALID_WONDER_NEWS_BERRY_MAN', [
      'Sigh...',
      'Too much time, too little to do...',
      'Is nothing entertaining happening anywhere?',
      '(Wonder News reward stub — pending Mystery Gift support.)'
    ]);
  },
  CeruleanCity_House5_EventScript_BerryPowderMan: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, BERRY_POWDER_JAR_FLAG)) {
      openDialogueSequence(dialogue, 'CeruleanCity_House5_ObjectEvent_BerryPowderMan', [
        'Er-hem! Have you brought me some BERRY POWDER?',
        'Come see me if you would like to trade your BERRY POWDER.',
        'I can exchange it for useful medicine when you have enough powder.'
      ]);
      return;
    }

    if (!isScriptFlagSet(runtime, 'FLAG_SYS_GOT_BERRY_POUCH')) {
      openScriptDialogue(
        dialogue,
        'CeruleanCity_House5_ObjectEvent_BerryPowderMan',
        'Why must you lie to me? How many BERRIES do you have? Not a one!'
      );
      return;
    }

    if (!checkBagHasSpace(runtime.bag, 'ITEM_POWDER_JAR', 1)) {
      openScriptDialogue(
        dialogue,
        'CeruleanCity_House5_ObjectEvent_BerryPowderMan',
        'Your BAG is full. Come back after making room for the POWDER JAR.'
      );
      return;
    }

    addBagItem(runtime.bag, 'ITEM_POWDER_JAR', 1);
    setScriptFlag(runtime, BERRY_POWDER_JAR_FLAG);
    openDialogueSequence(dialogue, 'CeruleanCity_House5_ObjectEvent_BerryPowderMan', [
      'I concoct a variety of medicine from BERRY POWDER.',
      'Ah, good! For you, then, I have just the thing.',
      'Do not forget, crush BERRIES into BERRY POWDER and bring it to me.',
      `${runtime.startMenu.playerName} received the POWDER JAR.`
    ]);
  },
  CeruleanCity_House5_EventScript_BerryCrushRankings: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'BERRY CRUSH rankings are unavailable because Wireless Adapter play is not connected.'
    );
  },
  CeruleanCity_PokemonCenter_1F_EventScript_PokemonJournalMisty: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      "It's a POKéMON journal about MISTY. (Content stub pending script engine.)"
    );
  },
  MysteryEventClub_EventScript_Woman: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'MysteryEventClub_ObjectEvent_Woman', [
      'Welcome to the MYSTERY EVENT CLUB!',
      MYSTERY_EVENT_MESSAGES.cantBeUsed
    ]);
  },
  VermilionCity_Gym_EventScript_LtSurge: (context) => {
    runDecompObjectScript(
      'VermilionCity_Gym_EventScript_LtSurge',
      'VermilionCity_Gym_ObjectEvent_LtSurge',
      context
    );
  },
  VermilionCity_Gym_EventScript_Tucker: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_GENTLEMAN_TUCKER')) {
      openDialogueSequence(dialogue, 'VermilionCity_Gym_ObjectEvent_Tucker', [
        'It\'s not easy opening that door.',
        'LT. SURGE was always famous for his cautious nature in the Army.'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'VermilionCity_Gym_ObjectEvent_Tucker', [
      'When I was in the Army, LT. SURGE was my strict CO.',
      'He was a hard taskmaster.'
    ], TRAINER_BATTLE_TUCKER);
  },
  VermilionCity_Gym_EventScript_Baily: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_ENGINEER_BAILY')) {
      openDialogueSequence(dialogue, 'VermilionCity_Gym_ObjectEvent_Baily', [
        'Okay, I\'ll talk!',
        'LT. SURGE said he hid door switches inside something.'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'VermilionCity_Gym_ObjectEvent_Baily', [
      'I\'m a lightweight, but I\'m good with electricity!',
      'That\'s why I joined this GYM.'
    ], TRAINER_BATTLE_BAILY);
  },
  VermilionCity_Gym_EventScript_Dwayne: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_SAILOR_DWAYNE')) {
      openDialogueSequence(dialogue, 'VermilionCity_Gym_ObjectEvent_Dwayne', [
        'LT. SURGE installed the traps in the GYM himself.',
        'He set up double locks everywhere. Let me give you a hint.',
        'When you open the first lock, the second lock is right next to it.'
      ]);
      return;
    }
    startTrainerBattleDialogue(dialogue, runtime, 'VermilionCity_Gym_ObjectEvent_Dwayne', [
      'This is no place for kids! Not even if you\'re good!'
    ], TRAINER_BATTLE_DWAYNE);
  },
  VermilionCity_Gym_EventScript_GymGuy: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_DEFEATED_LT_SURGE')) {
      openScriptDialogue(
        dialogue,
        'VermilionCity_Gym_ObjectEvent_GymGuy',
        'Whew! That match was electric!'
      );
      return;
    }
    openDialogueSequence(dialogue, 'VermilionCity_Gym_ObjectEvent_GymGuy', [
      'Yo! Champ in the making!',
      'LT. SURGE has a nickname. People refer to him as the Lightning American!',
      'He\'s an expert on electric POKéMON.',
      'BIRD/WATER-type POKéMON match poorly against the ELECTRIC type.',
      'Beware of paralysis, too.',
      'LT. SURGE is very cautious. He\'s locked himself in, so it won\'t be easy getting to him.'
    ]);
  },
  VermilionCity_Gym_EventScript_GymStatue: ({ dialogue, runtime }) => {
    const text = isScriptFlagSet(runtime, 'FLAG_BADGE03_GET')
      ? 'VERMILION POKéMON GYM\nLEADER: LT. SURGE\nWINNING TRAINERS:\nRIVAL, PLAYER'
      : 'VERMILION POKéMON GYM\nLEADER: LT. SURGE\nWINNING TRAINERS:\nRIVAL';
    openScriptDialogue(dialogue, 'system', text);
  },
  VermilionCity_Gym_EventScript_TrashCan1: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 1),
  VermilionCity_Gym_EventScript_TrashCan2: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 2),
  VermilionCity_Gym_EventScript_TrashCan3: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 3),
  VermilionCity_Gym_EventScript_TrashCan4: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 4),
  VermilionCity_Gym_EventScript_TrashCan5: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 5),
  VermilionCity_Gym_EventScript_TrashCan6: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 6),
  VermilionCity_Gym_EventScript_TrashCan7: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 7),
  VermilionCity_Gym_EventScript_TrashCan8: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 8),
  VermilionCity_Gym_EventScript_TrashCan9: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 9),
  VermilionCity_Gym_EventScript_TrashCan10: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 10),
  VermilionCity_Gym_EventScript_TrashCan11: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 11),
  VermilionCity_Gym_EventScript_TrashCan12: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 12),
  VermilionCity_Gym_EventScript_TrashCan13: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 13),
  VermilionCity_Gym_EventScript_TrashCan14: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 14),
  VermilionCity_Gym_EventScript_TrashCan15: ({ dialogue, runtime }) => handleVermilionTrashCan(runtime, dialogue, 15),
  VermilionCity_House1_EventScript_FishingGuru: (context) => {
    runDecompObjectScript(
      'VermilionCity_House1_EventScript_FishingGuru',
      'VermilionCity_House1_ObjectEvent_FishingGuru',
      context
    );
  },
  VermilionCity_House2_EventScript_Elyssa: (context) => {
    runDecompObjectScript(
      'VermilionCity_House2_EventScript_Elyssa',
      'VermilionCity_House2_ObjectEvent_Elyssa',
      context
    );
  },
  VermilionCity_House3_EventScript_Boy: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_House3_ObjectEvent_Boy',
      'I\'m getting my PIDGEY to fly a letter to SAFFRON in the north.'
    );
  },
  VermilionCity_House3_EventScript_Pidgey: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'VermilionCity_House3_ObjectEvent_Pidgey', 'PIDGEY: Kurukkoo!');
  },
  VermilionCity_House3_EventScript_Lass: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_House3_ObjectEvent_Lass',
      'I want to exchange MAIL with all sorts of people. I send my PIDGEY to a UNION ROOM to exchange MAIL for me.'
    );
  },
  VermilionCity_House3_EventScript_Letter: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'Dear PIPPI, I hope to see you soon. I heard SAFFRON has problems with TEAM ROCKET. VERMILION appears to be safe.'
    );
  },
  VermilionCity_Mart_EventScript_CooltrainerF: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_Mart_ObjectEvent_CooltrainerF',
      'I think POKéMON can be good or bad. It depends on the TRAINER.'
    );
  },
  CeruleanCity_House1_EventScript_BadgeGuy: ({ dialogue, runtime, player, speakerId }) => {
    runDecompFieldScript('CeruleanCity_House1_EventScript_BadgeGuy', {
      runtime,
      player,
      dialogue,
      speakerId: speakerId ?? 'CeruleanCity_House1_ObjectEvent_BadgeGuy'
    });
  },
  VermilionCity_Mart_EventScript_BaldingMan: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'VermilionCity_Mart_ObjectEvent_BaldingMan', [
      'There are wicked people who will use POKéMON for criminal acts.',
      'TEAM ROCKET traffics in rare POKéMON, for example.',
      'They also abandon POKéMON that they consider unpopular or useless.',
      'That\'s the sort of horrid people they are, TEAM ROCKET.'
    ]);
  },
  Route2_EastBuilding_EventScript_Aide: ({ dialogue, runtime }) => {
    const seenCount = runtime.pokedex.seenSpecies.length;
    if (isScriptFlagSet(runtime, OAKS_AIDE_HM05_FLAG)) {
      openScriptDialogue(
        dialogue,
        'Route2_EastBuilding_ObjectEvent_Aide',
        'HM05 contains FLASH. It lights up even the darkest caves.'
      );
      return;
    }
    if (seenCount < OAKS_AIDE_HM05_REQUIRED_SEEN_MONS) {
      openDialogueSequence(dialogue, 'Route2_EastBuilding_ObjectEvent_Aide', [
        "I'm one of PROF. OAK's AIDES.",
        `If you have caught or owned ${OAKS_AIDE_HM05_REQUIRED_SEEN_MONS} kinds of POKéMON, I'm supposed to give you a reward.`,
        `You have only ${seenCount} kinds. You need ${OAKS_AIDE_HM05_REQUIRED_SEEN_MONS} kinds.`
      ]);
      return;
    }
    if (!checkBagHasSpace(runtime.bag, 'ITEM_HM05', 1)) {
      openScriptDialogue(dialogue, 'Route2_EastBuilding_ObjectEvent_Aide', 'Make room in your BAG, then come back for HM05.');
      return;
    }
    addBagItem(runtime.bag, 'ITEM_HM05', 1);
    setScriptFlag(runtime, OAKS_AIDE_HM05_FLAG);
    openDialogueSequence(dialogue, 'Route2_EastBuilding_ObjectEvent_Aide', [
      "I'm one of PROF. OAK's AIDES.",
      `Great! You have ${seenCount} kinds of POKéMON!`,
      `${runtime.startMenu.playerName} received HM05 from the AIDE.`
    ]);
  },
  Route4_PokemonCenter_1F_EventScript_MagikarpSalesman: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, MAGIKARP_SELLER_FLAG)) {
      openScriptDialogue(dialogue, 'Route4_PokemonCenter_1F_ObjectEvent_MagikarpSalesman', 'No refunds!');
      return;
    }
    if (getRuntimeMoney(runtime) < MAGIKARP_PRICE) {
      openDialogueSequence(dialogue, 'Route4_PokemonCenter_1F_ObjectEvent_MagikarpSalesman', [
        'MAN: Hello there, laddie!',
        "You don't have enough money for my secret POKéMON."
      ]);
      return;
    }
    const magikarp = createRoute4Magikarp();
    if (!addPokemonToParty(runtime.party, magikarp)) {
      openScriptDialogue(
        dialogue,
        'Route4_PokemonCenter_1F_ObjectEvent_MagikarpSalesman',
        'You have no room for MAGIKARP. Come back after storing a POKéMON.'
      );
      return;
    }
    setRuntimeMoney(runtime, getRuntimeMoney(runtime) - MAGIKARP_PRICE);
    setScriptFlag(runtime, MAGIKARP_SELLER_FLAG);
    openDialogueSequence(dialogue, 'Route4_PokemonCenter_1F_ObjectEvent_MagikarpSalesman', [
      'MAN: Hello there, laddie!',
      "I'll let you have a secret POKéMON - a MAGIKARP - for just ¥500!",
      `${runtime.startMenu.playerName} bought MAGIKARP for ¥500.`
    ]);
  },
  VermilionCity_PokemonCenter_1F_EventScript_Nurse: ({ dialogue, runtime }) => {
    healParty(runtime.party);
    openDialogueSequence(dialogue, 'VermilionCity_PokemonCenter_1F_ObjectEvent_Nurse', [
      'Welcome to our POKéMON CENTER!',
      "Okay, I'll take your POKéMON for a few seconds.",
      "Thank you for waiting. We've restored your POKéMON to full health.",
      'We hope to see you again!'
    ]);
  },
  VermilionCity_PokemonCenter_1F_EventScript_Man: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_PokemonCenter_1F_ObjectEvent_Man',
      'My POKéMON was poisoned! It fainted while we were walking!'
    );
  },
  VermilionCity_PokemonCenter_1F_EventScript_Hiker: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_PokemonCenter_1F_ObjectEvent_Hiker',
      'Even if they are the same level, POKéMON can have very different stats and abilities. A POKéMON raised by a TRAINER is stronger than one in the wild.'
    );
  },
  VermilionCity_PokemonCenter_1F_EventScript_Youngster: ({ dialogue }) => {
    openDialogueSequence(dialogue, 'VermilionCity_PokemonCenter_1F_ObjectEvent_Youngster', [
      'It is true that a higher-level POKéMON will be more powerful…',
      'But, all POKéMON will have weak points against specific types.',
      'So, there appears to be no universally strong POKéMON.'
    ]);
  },
  VermilionCity_PokemonCenter_1F_EventScript_VSSeekerWoman: (context) => {
    runDecompObjectScript(
      'VermilionCity_PokemonCenter_1F_EventScript_VSSeekerWoman',
      'VermilionCity_PokemonCenter_1F_ObjectEvent_VSSeekerWoman',
      context
    );
  },
  VermilionCity_PokemonCenter_1F_EventScript_PokemonJournalLtSurge: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'It\'s a POKéMON journal about LT. SURGE. (Content stub pending script engine.)'
    );
  },
  VermilionCity_PokemonFanClub_EventScript_Chairman: (context) => {
    runDecompObjectScript(
      'VermilionCity_PokemonFanClub_EventScript_Chairman',
      'VermilionCity_PokemonFanClub_ObjectEvent_Chairman',
      context
    );
  },
  VermilionCity_PokemonFanClub_EventScript_WorkerF: ({ dialogue, runtime }) => {
    if (isScriptFlagSet(runtime, 'FLAG_SYS_GAME_CLEAR')) {
      openDialogueSequence(dialogue, 'VermilionCity_PokemonFanClub_ObjectEvent_WorkerF', [
        'Our CHAIRMAN really does adore his POKéMON.',
        'But the person who is most liked by POKéMON is DAISY, I think.'
      ]);
      return;
    }
    openScriptDialogue(
      dialogue,
      'VermilionCity_PokemonFanClub_ObjectEvent_WorkerF',
      'Our CHAIRMAN is very vocal about POKéMON.'
    );
  },
  VermilionCity_PokemonFanClub_EventScript_Pikachu: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'VermilionCity_PokemonFanClub_ObjectEvent_Pikachu', 'PIKACHU: Chu! Pikachu!');
  },
  VermilionCity_PokemonFanClub_EventScript_Seel: ({ dialogue }) => {
    openScriptDialogue(dialogue, 'VermilionCity_PokemonFanClub_ObjectEvent_Seel', 'SEEL: Kyuoo!');
  },
  VermilionCity_PokemonFanClub_EventScript_Woman: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_PokemonFanClub_ObjectEvent_Woman',
      'I just adore my SEEL! It\'s so lovable! It squeals, "Kyuuuh," when I hug it!'
    );
  },
  VermilionCity_PokemonFanClub_EventScript_FatMan: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'VermilionCity_PokemonFanClub_ObjectEvent_FatMan',
      'Won\'t you admire my PIKACHU\'s adorable tail?'
    );
  },
  VermilionCity_PokemonFanClub_EventScript_RulesSign1: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'Let\'s all listen politely to other TRAINERS!'
    );
  },
  VermilionCity_PokemonFanClub_EventScript_RulesSign2: ({ dialogue }) => {
    openScriptDialogue(
      dialogue,
      'system',
      'If someone brags, brag right back!'
    );
  }
};

export const runScriptById = (
  scriptId: string,
  context: ScriptContext,
  registry: Record<string, ScriptHandler> = prototypeScriptRegistry
): boolean => {
  const handler = registry[scriptId];
  if (handler) {
    handler(context);
    context.runtime.lastScriptId = scriptId;
    return true;
  }

  const ranDecompScript = runDecompFieldScript(scriptId, {
    runtime: context.runtime,
    player: context.player,
    dialogue: context.dialogue,
    speakerId: context.speakerId ?? 'system',
    npcs: context.npcs
  });
  if (!ranDecompScript) {
    return false;
  }

  context.runtime.lastScriptId = scriptId;
  return true;
};

const VIRIDIAN_GYM_DOOR_VAR = 'VAR_MAP_SCENE_VIRIDIAN_CITY_GYM_DOOR';

const VIRIDIAN_GYM_REQUIRED_BADGES = [
  'FLAG_BADGE02_GET',
  'FLAG_BADGE03_GET',
  'FLAG_BADGE04_GET',
  'FLAG_BADGE05_GET',
  'FLAG_BADGE06_GET',
  'FLAG_BADGE07_GET'
] as const;

export const viridianCityTryUnlockGym = (runtime: ScriptRuntimeState): boolean => {
  if (getScriptVar(runtime, VIRIDIAN_GYM_DOOR_VAR) !== 0) {
    return false;
  }

  const allBadgesSet = VIRIDIAN_GYM_REQUIRED_BADGES.every((flag) =>
    isScriptFlagSet(runtime, flag)
  );
  if (!allBadgesSet) {
    return false;
  }

  setScriptVar(runtime, VIRIDIAN_GYM_DOOR_VAR, 1);
  return true;
};

export const isViridianGymLocked = (runtime: ScriptRuntimeState): boolean =>
  getScriptVar(runtime, VIRIDIAN_GYM_DOOR_VAR) === 0;

export const registerCenterScripts = (): void => {
  const centerScripts = getAllCenterScriptHandlers();
  for (const [key, handler] of Object.entries(centerScripts)) {
    if (!prototypeScriptRegistry[key]) {
      prototypeScriptRegistry[key] = handler;
    }
  }
};

registerCenterScripts();

export const registerMartScripts = (): void => {
  const martScripts = getAllMartScriptHandlers();
  for (const [key, handler] of Object.entries(martScripts)) {
    if (!MART_STOCKS.some((stock) => stock.scriptId === key) && !prototypeScriptRegistry[key]) {
      prototypeScriptRegistry[key] = handler;
    }
  }

  for (const stock of MART_STOCKS) {
    prototypeScriptRegistry[stock.scriptId] = (context) => {
      runDecompObjectScript(stock.scriptId, stock.clerkLocalId, context);
    };
  }
};

registerMartScripts();
