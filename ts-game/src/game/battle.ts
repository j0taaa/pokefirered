import type { InputSnapshot } from '../input/inputState';
import { getBagQuantity, getBattleUsableBagEntries, getItemDefinition, removeBagItem, type BagState } from './bag';
import type { DecompTypeId } from './decompSpecies';
import { getDecompSpeciesInfo } from './decompSpecies';
import { getExperienceForLevel, getLevelForExperience } from './decompExperience';
import { getDecompPokedexEntry } from './decompPokedex';
import {
  getAllDecompBattleMoves,
  getBattleTerrainForScene,
  getDecompBattleMove,
  getDecompMovesLearnedAtLevel,
  getDecompLevelUpMoves,
  getFallbackBattleMoves,
  type DecompBattleTerrainId,
  type DecompBattleMove
} from './decompBattleData';
import { nextDecompRandomFromSeed, seedDecompRng } from './decompRandom';
import type { FieldPokemon } from './pokemonStorage';
import type { WildEncounterGroup } from '../world/mapSource';
import { getDecompBattleAiSwitchHelper } from './decompBattleAi';
import {
  cloneBattlePostResult,
  createBattlePostResult,
  createBattleVmState,
  executeBattleMoveVm,
  runBattleScriptCommand,
  runEnemyOnlyTurnVm,
  runSingleBattleTurnVm,
  resetBattlePostResult,
  resetBattleVmState,
  type ExecuteBattleMoveVmOptions,
  type BattlePostResult,
  type BattleVmState
} from './battleScriptVm';
import { chooseTrainerAiItemDecision, chooseTrainerMoveIndex } from './battleAiVm';
import { getLevelEvolutionCandidate } from './decompEvolution';
import {
  adjustFriendshipOnBattleFaint,
  allocateBattleResources,
  findBattlerIdForPokemon,
  freeBattleResources
} from './decompBattleUtil2';

export type PokemonType = DecompTypeId;
export type StatusCondition = 'none' | 'poison' | 'badPoison' | 'burn' | 'paralysis' | 'sleep' | 'freeze';
export type PokemonGender = 'male' | 'female' | 'genderless';

export interface BattleStatStages {
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  accuracy: number;
  evasion: number;
}

export interface BattleIvs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

export interface BattleEvs {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

export interface BattleVolatileState {
  confusionTurns: number;
  flinched: boolean;
  protected: boolean;
  protectUses: number;
  substituteHp: number;
  leechSeededBy: 'player' | 'opponent' | null;
  focusEnergy: boolean;
  enduring: boolean;
  rechargeTurns: number;
  trapTurns: number;
  trappedBy: 'player' | 'opponent' | null;
  yawnTurns: number;
  nightmare: boolean;
  perishTurns: number;
  tookDamageThisTurn: boolean;
  minimized: boolean;
  defenseCurl: boolean;
  tauntTurns: number;
  furyCutterCounter: number;
  rolloutCounter: number;
  toxicCounter: number;
  lastMoveUsedId: string | null;
  lastDamageTaken: number;
  lastDamageCategory: 'physical' | 'special' | null;
  lastDamagedBy: 'player' | 'opponent' | null;
  disabledMoveId: string | null;
  disableTurns: number;
  encoreMoveId: string | null;
  encoreTurns: number;
  escapePreventedBy: 'player' | 'opponent' | null;
  rooted: boolean;
  transformed: boolean;
  infatuatedBy: 'player' | 'opponent' | null;
  tormented: boolean;
  destinyBond: boolean;
  grudge: boolean;
  cursed: boolean;
  foresighted: boolean;
  stockpile: number;
  chargeTurns: number;
  lockOnBy: 'player' | 'opponent' | null;
  lockOnTurns: number;
  activeTurns: number;
  lastReceivedMoveType: PokemonType | null;
  lastLandedMoveId: string | null;
  lastTakenMoveId: string | null;
  lastPrintedMoveId: string | null;
  semiInvulnerable: 'air' | 'underground' | 'underwater' | null;
  chargingMoveId: string | null;
  rampageMoveId: string | null;
  rampageTurns: number;
  uproarMoveId: string | null;
  uproarTurns: number;
  rage: boolean;
  bideMoveId: string | null;
  bideTurns: number;
  bideDamage: number;
  bideTarget: 'player' | 'opponent' | null;
  lastSuccessfulMoveId: string | null;
  imprisoning: boolean;
  magicCoat: boolean;
  snatch: boolean;
  followMe: boolean;
  helpingHand: boolean;
  flashFire: boolean;
  choicedMoveId: string | null;
}

export interface BattleFutureAttack {
  move: BattleMove;
  damage: number;
  sourceSide: 'player' | 'opponent';
  countdown: number;
}

export interface BattleSideState {
  reflectTurns: number;
  lightScreenTurns: number;
  safeguardTurns: number;
  mistTurns: number;
  wishTurns: number;
  wishHp: number;
  spikesLayers: number;
  futureAttack: BattleFutureAttack | null;
}

export interface BattleMove {
  id: string;
  name: string;
  power: number;
  type: PokemonType;
  accuracy: number;
  pp: number;
  ppRemaining: number;
  priority: number;
  effect: string;
  effectScriptLabel: string;
  target: string;
  secondaryEffectChance: number;
  flags: string[];
}

export interface BattlePokemonSnapshot {
  species: string;
  level: number;
  personality: number;
  gender: PokemonGender;
  expProgress: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  catchRate: number;
  types: PokemonType[];
  status: StatusCondition;
  statusTurns: number;
  friendship: number;
  heldItemId: string | null;
  recycledItemId: string | null;
  knockedOff: boolean;
  abilityId: string | null;
  ivs: BattleIvs;
  evs: BattleEvs;
  moves: BattleMove[];
  statStages: BattleStatStages;
  volatile: BattleVolatileState;
}

export interface BattleEncounterState {
  stepsSinceLastEncounter: number;
  encounterRate: number;
  rngState: number;
}

export type BattleCommand = 'fight' | 'bag' | 'pokemon' | 'run' | 'safariBall' | 'safariBait' | 'safariRock';
export type BattlePhase = 'intro' | 'command' | 'moveSelect' | 'shiftPrompt' | 'partySelect' | 'bagSelect' | 'script' | 'resolved';
export type BattleWeather = 'none' | 'rain' | 'sun' | 'sandstorm' | 'hail';
export type BattleTypeFlag = 'ghost' | 'trainer' | 'oldManTutorial' | 'pokedude' | 'safari';
export type BattleMode = 'wild' | 'trainer' | 'safari' | 'ghost' | 'oldManTutorial' | 'pokedude';
export type BattleSideId = 'player' | 'opponent';
export type BattleBattlerId = 0 | 1 | 2 | 3;
export type BattleFormat = 'singles' | 'doubles';
export type BattleControlMode = 'singlePlayer' | 'partner' | 'link';
export type BattleBallItemId =
  | 'ITEM_MASTER_BALL'
  | 'ITEM_ULTRA_BALL'
  | 'ITEM_GREAT_BALL'
  | 'ITEM_POKE_BALL'
  | 'ITEM_SAFARI_BALL'
  | 'ITEM_NET_BALL'
  | 'ITEM_DIVE_BALL'
  | 'ITEM_NEST_BALL'
  | 'ITEM_REPEAT_BALL'
  | 'ITEM_TIMER_BALL'
  | 'ITEM_LUXURY_BALL'
  | 'ITEM_PREMIER_BALL';

export interface BattleParticipantState {
  name: string;
  trainerId: string | null;
  party: BattlePokemonSnapshot[];
  activePartyIndexes: number[];
}

export interface BattleBattlerRuntime {
  battlerId: BattleBattlerId;
  side: BattleSideId;
  partyIndex: number | null;
  active: boolean;
  absent: boolean;
}

export interface BattleMoveMemory {
  chosenMoveId: string | null;
  currentMoveId: string | null;
  calledMoveId: string | null;
  printedMoveId: string | null;
  resultingMoveId: string | null;
  landedMoveId: string | null;
  takenMoveId: string | null;
  lastHitByBattler: BattleBattlerId | null;
  lastMoveTargetBattler: BattleBattlerId | null;
}

export interface BattleTraceEvent {
  type: 'init' | 'script' | 'message' | 'hp' | 'status' | 'phase' | 'reward' | 'chooseAction' | 'unknown';
  mode: BattleMode;
  turn: number;
  phase: BattlePhase;
  battler?: BattleSideId;
  battlerId?: number;
  value?: number;
  extra?: number;
  label?: string;
  text?: string;
}

export interface BattleStartConfig {
  mode?: BattleMode;
  terrain?: DecompBattleTerrainId;
  mapBattleScene?: string;
  battleStyle?: 'shift' | 'set';
  format?: BattleFormat;
  controlMode?: BattleControlMode;
  playerName?: string;
  opponentName?: string;
  trainerId?: string | null;
  playerParty?: Array<FieldPokemon | BattlePokemonSnapshot>;
  partnerParty?: Array<FieldPokemon | BattlePokemonSnapshot>;
  opponentParty?: Array<FieldPokemon | BattlePokemonSnapshot>;
  activePlayerPartyIndex?: number;
  activeOpponentPartyIndex?: number;
  activeBattlers?: BattleBattlerRuntime[];
  opponentTrainerItems?: string[];
  opponentTrainerAiFlags?: string[];
  battleTypeFlags?: BattleTypeFlag[];
  safariBalls?: number;
  caughtSpeciesIds?: string[];
}

export interface WildBattleStartConfig {
  mode?: BattleMode;
  battleTypeFlags?: BattleTypeFlag[];
  safariBalls?: number;
  encounterKind?: 'land' | 'water';
}

export interface BattleControllerCommand {
  type: 'script' | 'message' | 'hp' | 'status';
  battler?: 'player' | 'opponent';
  value?: number;
  label?: string;
  text?: string;
}

export interface BattleState {
  active: boolean;
  phase: BattlePhase;
  mode: BattleMode;
  format: BattleFormat;
  controlMode: BattleControlMode;
  terrain: DecompBattleTerrainId;
  mapBattleScene: string;
  battleStyle: 'shift' | 'set';
  playerSide: BattleParticipantState;
  partnerParty: BattlePokemonSnapshot[];
  opponentSide: BattleParticipantState;
  opponentTrainerItems: string[];
  opponentTrainerAiFlags: string[];
  playerParticipantPartyIndexes: number[];
  defeatedOpponentPartyIndexes: number[];
  rewardedOpponentPartyIndexes: number[];
  rewardsApplied: boolean;
  battlers: BattleBattlerRuntime[];
  moveMemory: Record<BattleBattlerId, BattleMoveMemory>;
  playerMon: BattlePokemonSnapshot;
  party: BattlePokemonSnapshot[];
  wildMon: BattlePokemonSnapshot;
  moves: BattleMove[];
  wildMoves: BattleMove[];
  sideState: {
    player: BattleSideState;
    opponent: BattleSideState;
  };
  battleTypeFlags: BattleTypeFlag[];
  safariBalls: number;
  safariCatchFactor: number;
  safariEscapeFactor: number;
  safariRockThrowCounter: number;
  safariBaitThrowCounter: number;
  weather: BattleWeather;
  weatherTurns: number;
  mudSport: boolean;
  waterSport: boolean;
  payDayMoney: number;
  selectedMoveIndex: number;
  selectedCommandIndex: number;
  selectedShiftPromptIndex: number;
  commands: BattleCommand[];
  selectedPartyIndex: number;
  selectedBagIndex: number;
  lastBattleItemId: string | null;
  turnSummary: string;
  damagePreview: {
    min: number;
    max: number;
  } | null;
  runAttempts: number;
  battleTurnCounter: number;
  pendingOpponentPartyIndex: number | null;
  caughtSpeciesIds: string[];
  bag: {
    pokeBalls: number;
    greatBalls: number;
  };
  caughtMon: BattlePokemonSnapshot | null;
  moveEndedBattle: boolean;
  queuedMessages: string[];
  queuedControllerCommands: BattleControllerCommand[];
  battleTrace: BattleTraceEvent[];
  currentScriptLabel: string | null;
  vm: BattleVmState;
  postResult: BattlePostResult;
  resumePhase: Exclude<BattlePhase, 'script'>;
  resumeSummary: string;
}

export interface CaptureResult {
  caught: boolean;
  shakes: number;
  ballLabel: string;
  usedItemId: string | null;
  blockedReason: 'ghost' | 'trainer' | null;
  tutorialCatch: boolean;
}

export interface BattleBagChoice {
  itemId: string | null;
  label: string;
  quantity: number | null;
  isExit: boolean;
}

const DEFAULT_BATTLE_SCENE = 'MAP_BATTLE_SCENE_NORMAL';

const TYPE_CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5
  },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5 }
};

const specialTypes = new Set<PokemonType>(['fire', 'water', 'grass', 'electric', 'ice', 'psychic', 'dragon', 'dark']);
const highCriticalEffects = new Set<string>(['EFFECT_HIGH_CRITICAL', 'EFFECT_SKY_ATTACK', 'EFFECT_BLAZE_KICK', 'EFFECT_POISON_TAIL']);
const criticalHitDivisors = [16, 8, 4, 3, 2];
const BATTLE_BALL_ITEM_IDS: BattleBallItemId[] = [
  'ITEM_MASTER_BALL',
  'ITEM_ULTRA_BALL',
  'ITEM_GREAT_BALL',
  'ITEM_POKE_BALL',
  'ITEM_SAFARI_BALL',
  'ITEM_NET_BALL',
  'ITEM_DIVE_BALL',
  'ITEM_NEST_BALL',
  'ITEM_REPEAT_BALL',
  'ITEM_TIMER_BALL',
  'ITEM_LUXURY_BALL',
  'ITEM_PREMIER_BALL'
];
const battleBallItemIdSet = new Set<string>(BATTLE_BALL_ITEM_IDS);
const NORMAL_BATTLE_COMMANDS: BattleCommand[] = ['fight', 'bag', 'pokemon', 'run'];
const SAFARI_BATTLE_COMMANDS: BattleCommand[] = ['safariBall', 'safariBait', 'safariRock', 'run'];

const stageEffectTable: Partial<Record<string, { target: 'self' | 'target'; stat: keyof BattleStatStages; delta: number }>> = {
  EFFECT_ATTACK_UP: { target: 'self', stat: 'attack', delta: 1 },
  EFFECT_DEFENSE_UP: { target: 'self', stat: 'defense', delta: 1 },
  EFFECT_SPEED_UP: { target: 'self', stat: 'speed', delta: 1 },
  EFFECT_SPECIAL_ATTACK_UP: { target: 'self', stat: 'spAttack', delta: 1 },
  EFFECT_SPECIAL_DEFENSE_UP: { target: 'self', stat: 'spDefense', delta: 1 },
  EFFECT_ACCURACY_UP: { target: 'self', stat: 'accuracy', delta: 1 },
  EFFECT_EVASION_UP: { target: 'self', stat: 'evasion', delta: 1 },
  EFFECT_ATTACK_DOWN: { target: 'target', stat: 'attack', delta: -1 },
  EFFECT_DEFENSE_DOWN: { target: 'target', stat: 'defense', delta: -1 },
  EFFECT_SPEED_DOWN: { target: 'target', stat: 'speed', delta: -1 },
  EFFECT_SPECIAL_ATTACK_DOWN: { target: 'target', stat: 'spAttack', delta: -1 },
  EFFECT_SPECIAL_DEFENSE_DOWN: { target: 'target', stat: 'spDefense', delta: -1 },
  EFFECT_ACCURACY_DOWN: { target: 'target', stat: 'accuracy', delta: -1 },
  EFFECT_EVASION_DOWN: { target: 'target', stat: 'evasion', delta: -1 },
  EFFECT_ATTACK_UP_2: { target: 'self', stat: 'attack', delta: 2 },
  EFFECT_DEFENSE_UP_2: { target: 'self', stat: 'defense', delta: 2 },
  EFFECT_SPEED_UP_2: { target: 'self', stat: 'speed', delta: 2 },
  EFFECT_SPECIAL_ATTACK_UP_2: { target: 'self', stat: 'spAttack', delta: 2 },
  EFFECT_SPECIAL_DEFENSE_UP_2: { target: 'self', stat: 'spDefense', delta: 2 },
  EFFECT_ATTACK_DOWN_2: { target: 'target', stat: 'attack', delta: -2 },
  EFFECT_DEFENSE_DOWN_2: { target: 'target', stat: 'defense', delta: -2 },
  EFFECT_SPEED_DOWN_2: { target: 'target', stat: 'speed', delta: -2 },
  EFFECT_SPECIAL_DEFENSE_DOWN_2: { target: 'target', stat: 'spDefense', delta: -2 },
  EFFECT_ACCURACY_DOWN_2: { target: 'target', stat: 'accuracy', delta: -2 },
  EFFECT_EVASION_DOWN_2: { target: 'target', stat: 'evasion', delta: -2 },
  EFFECT_TICKLE: { target: 'target', stat: 'attack', delta: -1 }
};

const secondaryStatusByEffect: Partial<Record<string, StatusCondition>> = {
  EFFECT_POISON_HIT: 'poison',
  EFFECT_POISON_FANG: 'poison',
  EFFECT_POISON_TAIL: 'poison',
  EFFECT_BURN_HIT: 'burn',
  EFFECT_THAW_HIT: 'burn',
  EFFECT_PARALYZE_HIT: 'paralysis',
  EFFECT_FREEZE_HIT: 'freeze',
};

const primaryStatusByEffect: Partial<Record<string, StatusCondition>> = {
  EFFECT_POISON: 'poison',
  EFFECT_PARALYZE: 'paralysis',
  EFFECT_SLEEP: 'sleep',
  EFFECT_TOXIC: 'badPoison',
  EFFECT_WILL_O_WISP: 'burn'
};

const secondaryStageEffectByEffect: Partial<Record<string, { target: 'self' | 'target'; stat: keyof BattleStatStages; delta: number }>> = {
  EFFECT_ATTACK_DOWN_HIT: { target: 'target', stat: 'attack', delta: -1 },
  EFFECT_DEFENSE_DOWN_HIT: { target: 'target', stat: 'defense', delta: -1 },
  EFFECT_SPEED_DOWN_HIT: { target: 'target', stat: 'speed', delta: -1 },
  EFFECT_SPECIAL_ATTACK_DOWN_HIT: { target: 'target', stat: 'spAttack', delta: -1 },
  EFFECT_SPECIAL_DEFENSE_DOWN_HIT: { target: 'target', stat: 'spDefense', delta: -1 },
  EFFECT_ACCURACY_DOWN_HIT: { target: 'target', stat: 'accuracy', delta: -1 },
  EFFECT_EVASION_DOWN_HIT: { target: 'target', stat: 'evasion', delta: -1 },
  EFFECT_DEFENSE_UP_HIT: { target: 'self', stat: 'defense', delta: 1 },
  EFFECT_ATTACK_UP_HIT: { target: 'self', stat: 'attack', delta: 1 }
};

const weatherByEffect: Partial<Record<string, BattleWeather>> = {
  EFFECT_RAIN_DANCE: 'rain',
  EFFECT_SUNNY_DAY: 'sun',
  EFFECT_SANDSTORM: 'sandstorm',
  EFFECT_HAIL: 'hail'
};

const weatherContinueMessages: Record<Exclude<BattleWeather, 'none'>, string> = {
  rain: 'Rain continues to fall.',
  sun: 'The sunlight is strong.',
  sandstorm: 'The sandstorm rages.',
  hail: 'Hail continues to fall.'
};

const weatherEndMessages: Record<Exclude<BattleWeather, 'none'>, string> = {
  rain: 'The rain stopped.',
  sun: 'The sunlight faded.',
  sandstorm: 'The sandstorm subsided.',
  hail: 'The hail stopped.'
};

const clampDamage = (value: number): number => Math.max(1, Math.floor(value));

const createStatStages = (): BattleStatStages => ({
  attack: 0,
  defense: 0,
  speed: 0,
  spAttack: 0,
  spDefense: 0,
  accuracy: 0,
  evasion: 0
});

const createBattleIvs = (): BattleIvs => ({
  hp: 0,
  attack: 0,
  defense: 0,
  speed: 0,
  spAttack: 0,
  spDefense: 0
});

const createBattleEvs = (): BattleEvs => ({
  hp: 0,
  attack: 0,
  defense: 0,
  speed: 0,
  spAttack: 0,
  spDefense: 0
});

const createVolatileState = (): BattleVolatileState => ({
  confusionTurns: 0,
  flinched: false,
  protected: false,
  protectUses: 0,
  substituteHp: 0,
  leechSeededBy: null,
  focusEnergy: false,
  enduring: false,
  rechargeTurns: 0,
  trapTurns: 0,
  trappedBy: null,
  yawnTurns: 0,
  nightmare: false,
  perishTurns: 0,
  tookDamageThisTurn: false,
  minimized: false,
  defenseCurl: false,
  tauntTurns: 0,
  furyCutterCounter: 0,
  rolloutCounter: 0,
  toxicCounter: 0,
  lastMoveUsedId: null,
  lastDamageTaken: 0,
  lastDamageCategory: null,
  lastDamagedBy: null,
  disabledMoveId: null,
  disableTurns: 0,
  encoreMoveId: null,
  encoreTurns: 0,
  escapePreventedBy: null,
  rooted: false,
  transformed: false,
  infatuatedBy: null,
  tormented: false,
  destinyBond: false,
  grudge: false,
  cursed: false,
  foresighted: false,
  stockpile: 0,
  chargeTurns: 0,
  lockOnBy: null,
  lockOnTurns: 0,
  activeTurns: 0,
  lastReceivedMoveType: null,
  lastLandedMoveId: null,
  lastTakenMoveId: null,
  lastPrintedMoveId: null,
  semiInvulnerable: null,
  chargingMoveId: null,
  rampageMoveId: null,
  rampageTurns: 0,
  uproarMoveId: null,
  uproarTurns: 0,
  rage: false,
  bideMoveId: null,
  bideTurns: 0,
  bideDamage: 0,
  bideTarget: null,
  lastSuccessfulMoveId: null,
  imprisoning: false,
  magicCoat: false,
  snatch: false,
  followMe: false,
  helpingHand: false,
  flashFire: false,
  choicedMoveId: null
});

const createMoveMemory = (): BattleMoveMemory => ({
  chosenMoveId: null,
  currentMoveId: null,
  calledMoveId: null,
  printedMoveId: null,
  resultingMoveId: null,
  landedMoveId: null,
  takenMoveId: null,
  lastHitByBattler: null,
  lastMoveTargetBattler: null
});

const createBattleMoveMemory = (): Record<BattleBattlerId, BattleMoveMemory> => ({
  0: createMoveMemory(),
  1: createMoveMemory(),
  2: createMoveMemory(),
  3: createMoveMemory()
});

const createSideState = (): BattleSideState => ({
  reflectTurns: 0,
  lightScreenTurns: 0,
  safeguardTurns: 0,
  mistTurns: 0,
  wishTurns: 0,
  wishHp: 0,
  spikesLayers: 0,
  futureAttack: null
});

const resetBattlePokemonTransientState = (pokemon: BattlePokemonSnapshot): void => {
  pokemon.statStages = createStatStages();
  pokemon.volatile = createVolatileState();
};

const cloneMove = (move: BattleMove): BattleMove => ({ ...move, flags: [...move.flags] });

const cloneBattlePokemon = (pokemon: BattlePokemonSnapshot): BattlePokemonSnapshot => ({
  ...pokemon,
  types: [...pokemon.types],
  moves: pokemon.moves.map(cloneMove),
  ivs: { ...pokemon.ivs },
  evs: { ...pokemon.evs },
  statStages: { ...pokemon.statStages },
  volatile: { ...pokemon.volatile }
});

const defaultBattleTypeFlagsByMode: Record<BattleMode, BattleTypeFlag[]> = {
  wild: [],
  trainer: ['trainer'],
  safari: ['safari'],
  ghost: ['ghost'],
  oldManTutorial: ['oldManTutorial'],
  pokedude: ['pokedude']
};

const isBattlePokemonSnapshot = (pokemon: FieldPokemon | BattlePokemonSnapshot): pokemon is BattlePokemonSnapshot =>
  'volatile' in pokemon && 'ivs' in pokemon && 'moves' in pokemon;

const toBattlePokemonSnapshot = (pokemon: FieldPokemon | BattlePokemonSnapshot): BattlePokemonSnapshot =>
  isBattlePokemonSnapshot(pokemon) ? cloneBattlePokemon(pokemon) : createBattlePokemonFromFieldPokemon(pokemon);

const normalizeBattleParty = (
  party: Array<FieldPokemon | BattlePokemonSnapshot> | undefined,
  fallbackFactory: () => BattlePokemonSnapshot[]
): BattlePokemonSnapshot[] => {
  const source = party && party.length > 0 ? party : fallbackFactory();
  return source.map(toBattlePokemonSnapshot);
};

const clampPartyIndex = (party: BattlePokemonSnapshot[], index: number | undefined): number => {
  if (party.length === 0) {
    return 0;
  }

  return Math.max(0, Math.min(index ?? 0, party.length - 1));
};

const getBattlerSide = (battlerId: BattleBattlerId): BattleSideId =>
  battlerId === 0 || battlerId === 2 ? 'player' : 'opponent';

const getDefaultActivePartyIndexes = (
  party: BattlePokemonSnapshot[],
  primaryIndex: number | undefined,
  format: BattleFormat
): number[] => {
  if (party.length === 0) {
    return [];
  }

  const activeIndexes = [clampPartyIndex(party, primaryIndex)];
  if (format === 'doubles' && party.length > 1) {
    const secondaryIndex = party.findIndex((_, index) => index !== activeIndexes[0]);
    if (secondaryIndex >= 0) {
      activeIndexes.push(secondaryIndex);
    }
  }

  return activeIndexes;
};

const normalizeActivePartyIndexes = (
  party: BattlePokemonSnapshot[],
  indexes: number[],
  format: BattleFormat
): number[] => {
  const limit = format === 'doubles' ? 2 : 1;
  const normalized = indexes
    .map((index) => clampPartyIndex(party, index))
    .filter((index, position, array) => array.indexOf(index) === position)
    .slice(0, limit);

  if (normalized.length > 0) {
    return normalized;
  }

  return getDefaultActivePartyIndexes(party, 0, format);
};

const getConfiguredActivePartyIndexes = (
  config: BattleStartConfig,
  side: BattleSideId,
  party: BattlePokemonSnapshot[],
  fallbackPrimaryIndex: number | undefined,
  format: BattleFormat
): number[] => {
  const configured = (config.activeBattlers ?? [])
    .filter((battler) =>
      getBattlerSide(battler.battlerId) === side
      && battler.active
      && !battler.absent
      && battler.partyIndex !== null
    )
    .sort((left, right) => left.battlerId - right.battlerId)
    .map((battler) => battler.partyIndex as number);

  return normalizeActivePartyIndexes(
    party,
    configured.length > 0 ? configured : getDefaultActivePartyIndexes(party, fallbackPrimaryIndex, format),
    format
  );
};

const createBattlerRuntimeState = (
  playerActiveIndexes: number[],
  opponentActiveIndexes: number[],
  format: BattleFormat
): BattleBattlerRuntime[] => ([
  { battlerId: 0, side: 'player', partyIndex: playerActiveIndexes[0] ?? null, active: true, absent: false },
  { battlerId: 1, side: 'opponent', partyIndex: opponentActiveIndexes[0] ?? null, active: true, absent: false },
  {
    battlerId: 2,
    side: 'player',
    partyIndex: format === 'doubles' ? playerActiveIndexes[1] ?? null : null,
    active: format === 'doubles' && playerActiveIndexes[1] !== undefined,
    absent: format !== 'doubles' || playerActiveIndexes[1] === undefined
  },
  {
    battlerId: 3,
    side: 'opponent',
    partyIndex: format === 'doubles' ? opponentActiveIndexes[1] ?? null : null,
    active: format === 'doubles' && opponentActiveIndexes[1] !== undefined,
    absent: format !== 'doubles' || opponentActiveIndexes[1] === undefined
  }
]);

const appendBattleTraceEvent = (
  battle: BattleState,
  event: Omit<BattleTraceEvent, 'mode' | 'turn' | 'phase'>
): void => {
  battle.battleTrace.push({
    mode: battle.mode,
    turn: battle.battleTurnCounter,
    phase: battle.phase,
    ...event
  });
};

const appendDecompControllerActionTrace = (battle: BattleState): void => {
  appendBattleTraceEvent(battle, {
    type: 'chooseAction',
    battler: 'player',
    value: 0xff,
    extra: 22557
  });
  appendBattleTraceEvent(battle, {
    type: 'unknown',
    battler: 'player',
    value: 257,
    extra: 0xff
  });
};

const appendDecompSwitchActionTrace = (battle: BattleState): void => {
  appendDecompControllerActionTrace(battle);
  appendBattleTraceEvent(battle, {
    type: 'unknown',
    battlerId: 88,
    value: 0,
    extra: 258
  });
  appendBattleTraceEvent(battle, {
    type: 'unknown',
    battler: 'player',
    value: 0,
    extra: 0
  });
};

const emitControllerCommand = (
  battle: BattleState,
  command: BattleControllerCommand
): void => {
  battle.queuedControllerCommands.push(command);
  battle.vm.pendingCommands.push(command);
  if (command.type === 'message' && command.text) {
    battle.vm.pendingMessages.push(command.text);
  }
  appendBattleTraceEvent(battle, {
    type: command.type,
    battler: command.battler,
    value: command.value,
    label: command.label,
    text: command.text
  });
};

const getBattlerIdsForSide = (side: BattleSideId): BattleBattlerId[] =>
  side === 'player' ? [0, 2] : [1, 3];

const getPrimaryBattlerSnapshot = (
  battle: BattleState,
  side: BattleSideId
): BattlePokemonSnapshot => {
  const primaryBattlerId = side === 'player' ? 0 : 1;
  const fromBattler = getBattlerSnapshot(battle, primaryBattlerId);
  if (fromBattler) {
    return fromBattler;
  }

  const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
  return participant.party[0]!;
};

const installBattleCompatibilityViews = (battle: BattleState): void => {
  Object.defineProperties(battle, {
    playerMon: {
      configurable: true,
      enumerable: false,
      get: () => getPrimaryBattlerSnapshot(battle, 'player')
    },
    wildMon: {
      configurable: true,
      enumerable: false,
      get: () => getPrimaryBattlerSnapshot(battle, 'opponent')
    },
    party: {
      configurable: true,
      enumerable: false,
      get: () => battle.playerSide.party
    },
    moves: {
      configurable: true,
      enumerable: false,
      get: () => battle.playerMon.moves,
      set: (moves: BattleMove[]) => {
        battle.playerMon.moves = moves;
      }
    },
    wildMoves: {
      configurable: true,
      enumerable: false,
      get: () => battle.wildMon.moves,
      set: (moves: BattleMove[]) => {
        battle.wildMon.moves = moves;
      }
    }
  });
};

const getActiveBattlerRuntimes = (
  battle: BattleState,
  side?: BattleSideId
): BattleBattlerRuntime[] =>
  battle.battlers
    .filter((entry) => (side ? entry.side === side : true) && entry.active && !entry.absent && getBattlerSnapshot(battle, entry.battlerId)?.hp! > 0)
    .sort((left, right) => left.battlerId - right.battlerId);

const getActiveBattlerIds = (
  battle: BattleState,
  side?: BattleSideId
): BattleBattlerId[] => getActiveBattlerRuntimes(battle, side).map((entry) => entry.battlerId);

const getBattlerPartyIndexValue = (
  battle: BattleState,
  battlerId: BattleBattlerId
): number | null => battle.battlers.find((entry) => entry.battlerId === battlerId)?.partyIndex ?? null;

const withTemporaryBattlerPair = <T>(
  battle: BattleState,
  attackerBattlerId: BattleBattlerId,
  defenderBattlerId: BattleBattlerId,
  callback: () => T
): T => {
  const attackerSide = getBattlerSide(attackerBattlerId);
  const defenderSide = getBattlerSide(defenderBattlerId);
  const attackerPartyIndex = getBattlerPartyIndexValue(battle, attackerBattlerId);
  const defenderPartyIndex = getBattlerPartyIndexValue(battle, defenderBattlerId);
  if (attackerPartyIndex === null || defenderPartyIndex === null) {
    return callback();
  }

  const playerRuntime = battle.battlers.find((entry) => entry.battlerId === 0)!;
  const opponentRuntime = battle.battlers.find((entry) => entry.battlerId === 1)!;
  const previousPlayer = { ...playerRuntime };
  const previousOpponent = { ...opponentRuntime };

  if (attackerSide === 'player') {
    playerRuntime.side = attackerSide;
    playerRuntime.partyIndex = attackerPartyIndex;
    playerRuntime.active = true;
    playerRuntime.absent = false;
    opponentRuntime.side = defenderSide;
    opponentRuntime.partyIndex = defenderPartyIndex;
    opponentRuntime.active = true;
    opponentRuntime.absent = false;
  } else {
    playerRuntime.side = defenderSide;
    playerRuntime.partyIndex = defenderPartyIndex;
    playerRuntime.active = true;
    playerRuntime.absent = false;
    opponentRuntime.side = attackerSide;
    opponentRuntime.partyIndex = attackerPartyIndex;
    opponentRuntime.active = true;
    opponentRuntime.absent = false;
  }

  try {
    return callback();
  } finally {
    Object.assign(playerRuntime, previousPlayer);
    Object.assign(opponentRuntime, previousOpponent);
  }
};

const getBattlerOwnedPartyIndexes = (
  battle: BattleState,
  battlerId: BattleBattlerId
): number[] => {
  const side = getBattlerSide(battlerId);
  const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
  if (
    side === 'player'
    && battle.format === 'doubles'
    && battle.controlMode === 'partner'
    && battle.partnerParty.length > 0
  ) {
    const partnerOffset = Math.max(0, participant.party.length - battle.partnerParty.length);
    if (battlerId === 0) {
      return participant.party
        .map((_, index) => index)
        .filter((index) => index < partnerOffset);
    }
    if (battlerId === 2) {
      return participant.party
        .map((_, index) => index)
        .filter((index) => index >= partnerOffset);
    }
  }

  return participant.party.map((_, index) => index);
};

const getBattlerBenchIndexes = (
  battle: BattleState,
  battlerId: BattleBattlerId
): number[] => {
  const side = getBattlerSide(battlerId);
  const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
  const allowedIndexes = new Set(getBattlerOwnedPartyIndexes(battle, battlerId));
  const activeIndexes = new Set(
    battle.battlers
      .filter((entry) => entry.side === side && entry.active && !entry.absent && entry.partyIndex !== null)
      .map((entry) => entry.partyIndex as number)
  );

  return participant.party
    .map((pokemon, index) => ({ pokemon, index }))
    .filter(({ pokemon, index }) =>
      allowedIndexes.has(index)
      && pokemon.hp > 0
      && !activeIndexes.has(index)
    )
    .map(({ index }) => index);
};

const syncBattleRuntimeParticipants = (battle: BattleState): void => {
  const ensureCanonicalBattlersForSide = (side: BattleSideId): void => {
    const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
    const battlerIds = getBattlerIdsForSide(side);
    const configuredIndexes = battlerIds
      .map((battlerId) => battle.battlers.find((entry) => entry.battlerId === battlerId))
      .filter((entry): entry is BattleBattlerRuntime => !!entry)
      .map((entry) => entry.partyIndex)
      .filter((partyIndex): partyIndex is number =>
        partyIndex !== null
        && partyIndex >= 0
        && partyIndex < participant.party.length
      );

    const fallbackPrimaryIndex = participant.activePartyIndexes[0];
    const normalizedIndexes = normalizeActivePartyIndexes(participant.party, (
      configuredIndexes.length > 0
        ? configuredIndexes
        : getDefaultActivePartyIndexes(participant.party, fallbackPrimaryIndex, battle.format)
    ), battle.format);

    participant.activePartyIndexes = normalizedIndexes;
    battlerIds.forEach((battlerId, slotIndex) => {
      const runtime = battle.battlers.find((entry) => entry.battlerId === battlerId);
      if (!runtime) {
        return;
      }

      const nextPartyIndex = normalizedIndexes[slotIndex] ?? null;
      runtime.side = side;
      runtime.partyIndex = nextPartyIndex;
      runtime.active = nextPartyIndex !== null;
      runtime.absent = nextPartyIndex === null;
    });
  };

  ensureCanonicalBattlersForSide('player');
  ensureCanonicalBattlersForSide('opponent');
};

const setActiveBattlePartyMember = (
  battle: BattleState,
  side: BattleSideId,
  target: BattlePokemonSnapshot
): void => {
  const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
  const nextIndex = participant.party.findIndex((member) => member === target);
  if (nextIndex >= 0) {
    const primaryBattlerId = side === 'player' ? 0 : 1;
    const secondaryBattlerId = side === 'player' ? 2 : 3;
    const primaryRuntime = battle.battlers.find((entry) => entry.battlerId === primaryBattlerId);
    const secondaryRuntime = battle.battlers.find((entry) => entry.battlerId === secondaryBattlerId);

    if (primaryRuntime) {
      primaryRuntime.partyIndex = nextIndex;
      primaryRuntime.active = true;
      primaryRuntime.absent = false;
    }
    if (battle.format === 'singles' && secondaryRuntime) {
      secondaryRuntime.partyIndex = null;
      secondaryRuntime.active = false;
      secondaryRuntime.absent = true;
    }
    if (side === 'player' && !battle.playerParticipantPartyIndexes.includes(nextIndex)) {
      battle.playerParticipantPartyIndexes.push(nextIndex);
    }
  }
  syncBattleRuntimeParticipants(battle);
};

export const getBattlerSnapshot = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattlePokemonSnapshot | null => {
  const runtime = battle.battlers.find((entry) => entry.battlerId === battlerId);
  if (!runtime || runtime.partyIndex === null) {
    return null;
  }

  const participant = runtime.side === 'player' ? battle.playerSide : battle.opponentSide;
  return participant.party[runtime.partyIndex] ?? null;
};

export const getBattlerMoves = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleMove[] => getBattlerSnapshot(battle, battlerId)?.moves ?? [];

const syncMoveMemoryFromVolatile = (
  memory: BattleMoveMemory,
  snapshot: BattlePokemonSnapshot | null
): BattleMoveMemory => {
  if (!snapshot) {
    return memory;
  }

  memory.chosenMoveId ??= snapshot.volatile.choicedMoveId;
  memory.currentMoveId ??= snapshot.volatile.chargingMoveId ?? snapshot.volatile.rampageMoveId ?? snapshot.volatile.uproarMoveId;
  memory.calledMoveId ??= snapshot.volatile.lastSuccessfulMoveId;
  memory.printedMoveId ??= snapshot.volatile.lastPrintedMoveId;
  memory.resultingMoveId ??= snapshot.volatile.lastMoveUsedId;
  memory.landedMoveId ??= snapshot.volatile.lastLandedMoveId;
  memory.takenMoveId ??= snapshot.volatile.lastTakenMoveId;
  memory.lastHitByBattler ??= snapshot.volatile.lastDamagedBy === 'player'
    ? 0
    : snapshot.volatile.lastDamagedBy === 'opponent'
      ? 1
      : null;
  memory.lastMoveTargetBattler ??= snapshot.volatile.lockOnBy === 'player'
    ? 0
    : snapshot.volatile.lockOnBy === 'opponent'
      ? 1
      : null;
  return memory;
};

export const getBattlerMoveMemory = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleMoveMemory => syncMoveMemoryFromVolatile(
  battle.moveMemory[battlerId],
  getBattlerSnapshot(battle, battlerId)
);

const patchBattlerMoveMemory = (
  battle: BattleState,
  battlerId: BattleBattlerId,
  patch: Partial<BattleMoveMemory>
): void => {
  Object.assign(battle.moveMemory[battlerId], patch);
};

const getPrimaryBattlerIdForSide = (side: BattleSideId): BattleBattlerId =>
  side === 'player' ? 0 : 1;

export const getBattlerSideState = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleSideState => battle.sideState[getBattlerSide(battlerId)];

export const getOpponentBattlers = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleBattlerRuntime[] => battle.battlers.filter((entry) => entry.side !== getBattlerSide(battlerId) && entry.active && !entry.absent);

export const setBattlerPartyIndex = (
  battle: BattleState,
  battlerId: BattleBattlerId,
  partyIndex: number | null
): void => {
  const runtime = battle.battlers.find((entry) => entry.battlerId === battlerId);
  if (!runtime) {
    return;
  }

  runtime.partyIndex = partyIndex;
  runtime.active = partyIndex !== null;
  runtime.absent = partyIndex === null;
  battle.moveMemory[battlerId] = createMoveMemory();
  const participant = runtime.side === 'player' ? battle.playerSide : battle.opponentSide;
  const nextIndexes = battle.battlers
    .filter((entry) => entry.side === runtime.side && entry.active && !entry.absent && entry.partyIndex !== null)
    .sort((left, right) => left.battlerId - right.battlerId)
    .map((entry) => entry.partyIndex as number);
  participant.activePartyIndexes = normalizeActivePartyIndexes(participant.party, nextIndexes, battle.format);
  syncBattleRuntimeParticipants(battle);
};

const nextBattleRng = (state: BattleEncounterState): number => {
  const roll = nextDecompRandomFromSeed(state.rngState);
  state.rngState = roll.nextSeed;
  return roll.value;
};

const nextEncounterRoll = (state: BattleEncounterState, maxExclusive: number): number => {
  if (maxExclusive <= 1) {
    return 0;
  }

  return nextBattleRng(state) % maxExclusive;
};

const decompMoveToBattleMove = (move: DecompBattleMove): BattleMove => ({
  id: move.id,
  name: move.displayName,
  power: move.power,
  type: move.type,
  accuracy: move.accuracy,
  pp: move.pp,
  ppRemaining: move.pp,
  priority: move.priority,
  effect: move.effect,
  effectScriptLabel: move.effectScriptLabel,
  target: move.target,
  secondaryEffectChance: move.secondaryEffectChance,
  flags: [...move.flags]
});

export const createBattleMoveFromId = (moveId: string): BattleMove | null => {
  const move = getDecompBattleMove(moveId);
  return move ? decompMoveToBattleMove(move) : null;
};

const getRegisteredBattleMoves = (): BattleMove[] =>
  getAllDecompBattleMoves().map(decompMoveToBattleMove);

const getStruggleMove = (): BattleMove =>
  decompMoveToBattleMove(getDecompBattleMove('STRUGGLE') ?? getDecompBattleMove('TACKLE') ?? getFallbackBattleMoves()[0]!);

const getRegisteredBattleMove = (moveId: string): BattleMove | null =>
  createBattleMoveFromId(moveId);

const getKnownMovesForSpecies = (species: string, level: number): BattleMove[] => {
  const learned = getDecompLevelUpMoves(species, level);
  const fallback = learned.length > 0 ? learned : getFallbackBattleMoves();
  return fallback.map(decompMoveToBattleMove);
};

const calculateStat = (base: number, level: number, isHp: boolean, iv = 0, ev = 0): number => {
  const core = Math.floor(((2 * base) + iv + Math.floor(ev / 4)) * level / 100);
  return isHp ? core + level + 10 : core + 5;
};

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const hashBattleString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) >>> 0;
  }
  return hash >>> 0;
};

const getBattlePokemonGender = (species: string, personality: number): PokemonGender => {
  const genderRatioToken = getDecompSpeciesInfo(species)?.genderRatioToken ?? 'PERCENT_FEMALE(50)';
  switch (genderRatioToken) {
    case 'MON_MALE':
      return 'male';
    case 'MON_FEMALE':
      return 'female';
    case 'MON_GENDERLESS':
      return 'genderless';
    default: {
      const femalePercent = Number.parseFloat(genderRatioToken.match(/PERCENT_FEMALE\((\d+(?:\.\d+)?)\)/u)?.[1] ?? '50');
      const femaleThreshold = Math.max(0, Math.min(254, Math.floor((femalePercent * 254) / 100)));
      return (personality & 0xff) < femaleThreshold ? 'female' : 'male';
    }
  }
};

export const createBattlePokemonFromSpecies = (
  species: string,
  level: number,
  status: StatusCondition = 'none'
): BattlePokemonSnapshot => {
  const normalizedSpecies = normalizeSpecies(species);
  const speciesInfo = getDecompSpeciesInfo(normalizedSpecies);
  const ivs = createBattleIvs();
  const evs = createBattleEvs();
  const maxHp = calculateStat(speciesInfo?.baseHp ?? 10, level, true, ivs.hp, evs.hp);
  const personality = hashBattleString(`${normalizedSpecies}:${level}`);

  return {
    species: normalizedSpecies,
    level,
    personality,
    gender: getBattlePokemonGender(normalizedSpecies, personality),
    expProgress: 0,
    maxHp,
    hp: maxHp,
    attack: calculateStat(speciesInfo?.baseAttack ?? 10, level, false, ivs.attack, evs.attack),
    defense: calculateStat(speciesInfo?.baseDefense ?? 10, level, false, ivs.defense, evs.defense),
    speed: calculateStat(speciesInfo?.baseSpeed ?? 10, level, false, ivs.speed, evs.speed),
    spAttack: calculateStat(speciesInfo?.baseSpAttack ?? 10, level, false, ivs.spAttack, evs.spAttack),
    spDefense: calculateStat(speciesInfo?.baseSpDefense ?? 10, level, false, ivs.spDefense, evs.spDefense),
    catchRate: speciesInfo?.catchRate ?? 255,
    types: (speciesInfo?.types ?? ['normal']) as PokemonType[],
    status,
    statusTurns: status === 'sleep' ? 2 : 0,
    friendship: 70,
    heldItemId: null,
    recycledItemId: null,
    knockedOff: false,
    abilityId: speciesInfo?.abilities[0] ?? null,
    ivs,
    evs,
    moves: getKnownMovesForSpecies(normalizedSpecies, level),
    statStages: createStatStages(),
    volatile: createVolatileState()
  };
};

export const createBattlePokemonFromSpeciesWithMoves = (
  species: string,
  level: number,
  moveIds: string[],
  {
    heldItemId = null,
    status = 'none'
  }: {
    heldItemId?: string | null;
    status?: StatusCondition;
  } = {}
): BattlePokemonSnapshot => {
  const pokemon = createBattlePokemonFromSpecies(species, level, status);
  const moves = moveIds
    .filter((moveId) => moveId !== 'MOVE_NONE' && moveId !== 'NONE')
    .map((moveId) => createBattleMoveFromId(moveId.replace(/^MOVE_/u, '')))
    .filter((move): move is BattleMove => move !== null);

  if (moves.length > 0) {
    pokemon.moves = moves;
  }
  pokemon.heldItemId = heldItemId;
  return pokemon;
};

export const createBattlePokemonFromFieldPokemon = (pokemon: FieldPokemon): BattlePokemonSnapshot => {
  const species = normalizeSpecies(pokemon.species);
  const personality = Math.trunc(pokemon.personality ?? pokemon.otId ?? hashBattleString(`${species}:${pokemon.level}`)) >>> 0;
  return {
    species,
    level: pokemon.level,
    personality,
    gender: getBattlePokemonGender(species, personality),
    expProgress: pokemon.expProgress ?? 0,
    maxHp: pokemon.maxHp,
    hp: pokemon.hp,
    attack: pokemon.attack,
    defense: pokemon.defense,
    speed: pokemon.speed,
    spAttack: pokemon.spAttack,
    spDefense: pokemon.spDefense,
    catchRate: pokemon.catchRate,
    types: [...pokemon.types] as PokemonType[],
    status: pokemon.status,
    statusTurns: 0,
    friendship: 70,
    heldItemId: null,
    recycledItemId: null,
    knockedOff: false,
    abilityId: getDecompSpeciesInfo(pokemon.species)?.abilities[0] ?? null,
    ivs: createBattleIvs(),
    evs: pokemon.evs ? { ...pokemon.evs } : createBattleEvs(),
    moves: getKnownMovesForSpecies(pokemon.species, pokemon.level),
    statStages: createStatStages(),
    volatile: createVolatileState()
  };
};

const getPromptSummary = (battle: BattleState): string => `What will ${battle.playerMon.species} do?`;

const refreshActiveMovePointers = (battle: BattleState): void => {
  syncBattleRuntimeParticipants(battle);
  if (battle.moves.length === 0) {
    battle.moves = getFallbackBattleMoves().map(decompMoveToBattleMove);
  }
  if (battle.wildMoves.length === 0) {
    battle.wildMoves = getFallbackBattleMoves().map(decompMoveToBattleMove);
  }
  battle.selectedMoveIndex = Math.max(0, Math.min(battle.selectedMoveIndex, battle.moves.length - 1));
  battle.damagePreview = battle.moves.length > 0
    ? calculateDamagePreview(battle.playerMon, battle.wildMon, battle.moves[battle.selectedMoveIndex])
    : null;
};

const queueMessages = (
  battle: BattleState,
  messages: string[],
  resumePhase: Exclude<BattlePhase, 'script'>,
  resumeSummary = ''
): void => {
  battle.queuedControllerCommands = [];
  for (const text of messages) {
    emitControllerCommand(battle, { type: 'message', text });
  }

  if (messages.length === 0) {
    battle.phase = resumePhase;
    appendBattleTraceEvent(battle, { type: 'phase', text: resumePhase });
    if (resumeSummary) {
      battle.turnSummary = resumeSummary;
    }
    return;
  }

  battle.phase = 'script';
  appendBattleTraceEvent(battle, { type: 'phase', text: 'script' });
  battle.turnSummary = messages[0];
  battle.queuedMessages = messages.slice(1);
  battle.resumePhase = resumePhase;
  battle.resumeSummary = resumeSummary;
};

const getShiftPromptQuestion = (battle: BattleState): string => `Will ${battle.playerSide.name} change POKeMON?`;

const getShiftPromptMessages = (battle: BattleState, opponentMon: BattlePokemonSnapshot): string[] => ([
  `${battle.opponentSide.name} is about to use ${opponentMon.species}.`,
  getShiftPromptQuestion(battle)
]);

const advanceQueuedMessages = (battle: BattleState): void => {
  if (battle.queuedMessages.length > 0) {
    battle.turnSummary = battle.queuedMessages.shift() ?? '';
    return;
  }

  battle.phase = battle.resumePhase;
  appendBattleTraceEvent(battle, { type: 'phase', text: battle.resumePhase });
  if (battle.resumeSummary) {
    battle.turnSummary = battle.resumeSummary;
  }
};

const singleTypeEffectiveness = (moveType: PokemonType, defenderType: PokemonType): number =>
  TYPE_CHART[moveType]?.[defenderType] ?? 1;

const applyGen3DamageMultiplier = (damage: number, multiplierTenths: number): number => {
  const nextDamage = Math.floor((damage * multiplierTenths) / 10);
  return nextDamage === 0 && multiplierTenths !== 0 ? 1 : nextDamage;
};

export const calculateTypeEffectiveness = (
  moveType: PokemonType,
  defenderTypes: PokemonType[]
): number => {
  if (defenderTypes.length === 0) {
    return 1;
  }

  return defenderTypes.reduce(
    (modifier, defenderType) => modifier * singleTypeEffectiveness(moveType, defenderType),
    1
  );
};

const getBattleTypeEffectiveness = (move: BattleMove, defender: BattlePokemonSnapshot): number => {
  if (move.id === 'STRUGGLE') {
    return 1;
  }

  if (move.type === 'ground' && defender.abilityId === 'LEVITATE') {
    return 0;
  }

  if (
    defender.volatile.foresighted
    && (move.type === 'normal' || move.type === 'fighting')
    && defender.types.includes('ghost')
  ) {
    const foresightEffectiveness = calculateTypeEffectiveness(move.type, defender.types.filter((type) => type !== 'ghost'));
    return defender.abilityId === 'WONDER_GUARD' && move.power > 0 && foresightEffectiveness <= 1 ? 0 : foresightEffectiveness;
  }

  const typeEffectiveness = calculateTypeEffectiveness(move.type, defender.types);
  return defender.abilityId === 'WONDER_GUARD' && move.power > 0 && typeEffectiveness <= 1 ? 0 : typeEffectiveness;
};

const applyStabAndTypeModifiers = (
  damage: number,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): number => {
  if (damage <= 0) {
    return 0;
  }

  if (getBattleTypeEffectiveness(move, defender) === 0) {
    return 0;
  }

  if (move.id === 'STRUGGLE') {
    return damage;
  }

  let modifiedDamage = damage;
  if (attacker.types.includes(move.type)) {
    modifiedDamage = applyGen3DamageMultiplier(modifiedDamage, 15);
  }

  const typeMatchups = TYPE_CHART[move.type] ?? {};
  const seenTypes = new Set<PokemonType>();
  for (const [defenderType, multiplier] of Object.entries(typeMatchups) as Array<[PokemonType, number]>) {
    if (
      defender.volatile.foresighted
      && defenderType === 'ghost'
      && (move.type === 'normal' || move.type === 'fighting')
    ) {
      continue;
    }

    if (seenTypes.has(defenderType) || !defender.types.includes(defenderType)) {
      continue;
    }

    seenTypes.add(defenderType);
    modifiedDamage = applyGen3DamageMultiplier(modifiedDamage, Math.floor(multiplier * 10));
  }

  return modifiedDamage;
};

const typeByTerrain: Partial<Record<DecompBattleTerrainId, PokemonType>> = {
  BATTLE_TERRAIN_GRASS: 'grass',
  BATTLE_TERRAIN_LONG_GRASS: 'grass',
  BATTLE_TERRAIN_SAND: 'ground',
  BATTLE_TERRAIN_UNDERWATER: 'water',
  BATTLE_TERRAIN_WATER: 'water',
  BATTLE_TERRAIN_POND: 'water',
  BATTLE_TERRAIN_MOUNTAIN: 'rock',
  BATTLE_TERRAIN_CAVE: 'rock',
  BATTLE_TERRAIN_BUILDING: 'normal',
  BATTLE_TERRAIN_PLAIN: 'normal'
};

const allPokemonTypes: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel'
];

const hiddenPowerTypes: PokemonType[] = [
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark'
];

const mimicForbiddenMoveIds = new Set<string>([
  'METRONOME',
  'STRUGGLE',
  'SKETCH',
  'MIMIC'
]);

const metronomeForbiddenMoveIds = new Set<string>([
  ...mimicForbiddenMoveIds,
  'COUNTER',
  'MIRROR_COAT',
  'PROTECT',
  'DETECT',
  'ENDURE',
  'DESTINY_BOND',
  'SLEEP_TALK',
  'THIEF',
  'FOLLOW_ME',
  'SNATCH',
  'HELPING_HAND',
  'COVET',
  'TRICK',
  'FOCUS_PUNCH'
]);

const naturePowerMoveByTerrain: Partial<Record<DecompBattleTerrainId, string>> = {
  BATTLE_TERRAIN_GRASS: 'STUN_SPORE',
  BATTLE_TERRAIN_LONG_GRASS: 'RAZOR_LEAF',
  BATTLE_TERRAIN_SAND: 'EARTHQUAKE',
  BATTLE_TERRAIN_UNDERWATER: 'HYDRO_PUMP',
  BATTLE_TERRAIN_WATER: 'SURF',
  BATTLE_TERRAIN_POND: 'BUBBLE_BEAM',
  BATTLE_TERRAIN_MOUNTAIN: 'ROCK_SLIDE',
  BATTLE_TERRAIN_CAVE: 'SHADOW_BALL',
  BATTLE_TERRAIN_BUILDING: 'SWIFT',
  BATTLE_TERRAIN_PLAIN: 'SWIFT'
};

const getHiddenPowerMove = (move: BattleMove, attacker: BattlePokemonSnapshot): BattleMove => {
  const ivs = attacker.ivs;
  const typeBits =
    ((ivs.hp & 1) << 0)
    | ((ivs.attack & 1) << 1)
    | ((ivs.defense & 1) << 2)
    | ((ivs.speed & 1) << 3)
    | ((ivs.spAttack & 1) << 4)
    | ((ivs.spDefense & 1) << 5);
  const powerBits =
    ((ivs.hp & 2) >> 1)
    | ((ivs.attack & 2) << 0)
    | ((ivs.defense & 2) << 1)
    | ((ivs.speed & 2) << 2)
    | ((ivs.spAttack & 2) << 3)
    | ((ivs.spDefense & 2) << 4);

  return {
    ...move,
    type: hiddenPowerTypes[Math.floor((15 * typeBits) / 63)] ?? 'fighting',
    power: Math.floor((40 * powerBits) / 63) + 30
  };
};

const getStageMultiplier = (stage: number): number => {
  if (stage >= 0) {
    return (2 + stage) / 2;
  }
  return 2 / (2 - stage);
};

const getModifiedStat = (value: number, stage: number): number => Math.max(1, Math.floor(value * getStageMultiplier(stage)));

const getAccuracyAdjustedValue = (moveAccuracy: number, attackerStage: number, defenderStage: number): number =>
  Math.max(1, Math.floor(moveAccuracy * getAccuracyStageMultiplier(attackerStage - defenderStage)));

const accuracyStageRatios: Array<[number, number]> = [
  [33, 100],
  [36, 100],
  [43, 100],
  [50, 100],
  [60, 100],
  [75, 100],
  [1, 1],
  [133, 100],
  [166, 100],
  [2, 1],
  [233, 100],
  [133, 50],
  [3, 1]
];

const getAccuracyStageMultiplier = (stage: number): number => {
  const clamped = Math.max(-6, Math.min(6, stage));
  const [dividend, divisor] = accuracyStageRatios[clamped + 6] ?? [1, 1];
  return dividend / divisor;
};

const isSpecies = (pokemon: BattlePokemonSnapshot, ...speciesIds: string[]): boolean => {
  const normalized = pokemon.species.replace(/^SPECIES_/u, '').toUpperCase();
  return speciesIds.includes(normalized);
};

const getOffenseStat = (pokemon: BattlePokemonSnapshot, move: BattleMove, critical = false): number => {
  const isSpecial = specialTypes.has(move.type);
  const stage = isSpecial ? pokemon.statStages.spAttack : pokemon.statStages.attack;
  const effectiveStage = critical && stage < 0 ? 0 : stage;
  let stat = isSpecial
    ? getModifiedStat(pokemon.spAttack, effectiveStage)
    : getModifiedStat(pokemon.attack, effectiveStage);

  const holdEffect = getHeldItemHoldEffect(pokemon);
  if (!isSpecial) {
    if (holdEffect === 'HOLD_EFFECT_CHOICE_BAND') {
      stat = Math.max(1, Math.floor((stat * 15) / 10));
    }
    if (pokemon.abilityId === 'HUGE_POWER' || pokemon.abilityId === 'PURE_POWER') {
      stat *= 2;
    }
    if (pokemon.abilityId === 'HUSTLE') {
      stat = Math.max(1, Math.floor((stat * 15) / 10));
    }
    if (pokemon.abilityId === 'GUTS' && pokemon.status !== 'none') {
      stat = Math.max(1, Math.floor((stat * 15) / 10));
    }
    if (holdEffect === 'HOLD_EFFECT_THICK_CLUB' && isSpecies(pokemon, 'CUBONE', 'MAROWAK')) {
      stat *= 2;
    }
  } else {
    if (holdEffect === 'HOLD_EFFECT_SOUL_DEW' && isSpecies(pokemon, 'LATIAS', 'LATIOS')) {
      stat = Math.max(1, Math.floor((stat * 15) / 10));
    }
    if (holdEffect === 'HOLD_EFFECT_DEEP_SEA_TOOTH' && isSpecies(pokemon, 'CLAMPERL')) {
      stat *= 2;
    }
    if (holdEffect === 'HOLD_EFFECT_LIGHT_BALL' && isSpecies(pokemon, 'PIKACHU')) {
      stat *= 2;
    }
  }
  return stat;
};

const getDefenseStat = (pokemon: BattlePokemonSnapshot, move: BattleMove, critical = false): number => {
  const isSpecial = specialTypes.has(move.type);
  const stage = isSpecial ? pokemon.statStages.spDefense : pokemon.statStages.defense;
  const effectiveStage = critical && stage > 0 ? 0 : stage;
  let stat = isSpecial
    ? getModifiedStat(pokemon.spDefense, effectiveStage)
    : getModifiedStat(pokemon.defense, effectiveStage);
  const holdEffect = getHeldItemHoldEffect(pokemon);
  if (isSpecial && holdEffect === 'HOLD_EFFECT_SOUL_DEW' && isSpecies(pokemon, 'LATIAS', 'LATIOS')) {
    stat = Math.max(1, Math.floor((stat * 15) / 10));
  }
  if (isSpecial && holdEffect === 'HOLD_EFFECT_DEEP_SEA_SCALE' && isSpecies(pokemon, 'CLAMPERL')) {
    stat *= 2;
  }
  if (!isSpecial && holdEffect === 'HOLD_EFFECT_METAL_POWDER' && isSpecies(pokemon, 'DITTO')) {
    stat *= 2;
  }
  if (!isSpecial && pokemon.abilityId === 'MARVEL_SCALE' && pokemon.status !== 'none') {
    stat = Math.max(1, Math.floor((stat * 15) / 10));
  }
  return stat;
};

const getTurnOrderSpeed = (pokemon: BattlePokemonSnapshot, weather: BattleWeather = 'none'): number => {
  let speed = getModifiedStat(pokemon.speed, pokemon.statStages.speed);
  if ((pokemon.abilityId === 'SWIFT_SWIM' && weather === 'rain') || (pokemon.abilityId === 'CHLOROPHYLL' && weather === 'sun')) {
    speed *= 2;
  }
  if (getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_MACHO_BRACE') {
    speed = Math.max(1, Math.floor(speed / 2));
  }
  return pokemon.status === 'paralysis' ? Math.max(1, Math.floor(speed / 4)) : speed;
};

const hasPinchTypeBoost = (pokemon: BattlePokemonSnapshot, moveType: PokemonType): boolean => {
  if (pokemon.hp > Math.floor(pokemon.maxHp / 3)) {
    return false;
  }

  return (pokemon.abilityId === 'BLAZE' && moveType === 'fire')
    || (pokemon.abilityId === 'TORRENT' && moveType === 'water')
    || (pokemon.abilityId === 'OVERGROW' && moveType === 'grass')
    || (pokemon.abilityId === 'SWARM' && moveType === 'bug');
};

const typeBoostHoldEffectByType: Record<PokemonType, string> = {
  normal: 'HOLD_EFFECT_NORMAL_POWER',
  fire: 'HOLD_EFFECT_FIRE_POWER',
  water: 'HOLD_EFFECT_WATER_POWER',
  grass: 'HOLD_EFFECT_GRASS_POWER',
  electric: 'HOLD_EFFECT_ELECTRIC_POWER',
  ice: 'HOLD_EFFECT_ICE_POWER',
  fighting: 'HOLD_EFFECT_FIGHTING_POWER',
  poison: 'HOLD_EFFECT_POISON_POWER',
  ground: 'HOLD_EFFECT_GROUND_POWER',
  flying: 'HOLD_EFFECT_FLYING_POWER',
  psychic: 'HOLD_EFFECT_PSYCHIC_POWER',
  bug: 'HOLD_EFFECT_BUG_POWER',
  rock: 'HOLD_EFFECT_ROCK_POWER',
  ghost: 'HOLD_EFFECT_GHOST_POWER',
  dragon: 'HOLD_EFFECT_DRAGON_POWER',
  dark: 'HOLD_EFFECT_DARK_POWER',
  steel: 'HOLD_EFFECT_STEEL_POWER'
};

const getHeldItemHoldEffect = (pokemon: BattlePokemonSnapshot): string =>
  pokemon.heldItemId ? getItemDefinition(pokemon.heldItemId).holdEffect : 'HOLD_EFFECT_NONE';

const getHeldItemHoldEffectParam = (pokemon: BattlePokemonSnapshot): number =>
  pokemon.heldItemId ? getItemDefinition(pokemon.heldItemId).holdEffectParam : 0;

const consumeHeldItem = (pokemon: BattlePokemonSnapshot): string | null => {
  const item = pokemon.heldItemId;
  if (!item) {
    return null;
  }

  pokemon.heldItemId = null;
  pokemon.recycledItemId = item;
  return item;
};

export const calculateBaseDamage = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  critical = false
): number => {
  if (move.power <= 0) {
    return 0;
  }

  const attackStat = getOffenseStat(attacker, move, critical);
  const defenseStat = getDefenseStat(defender, move, critical);
  const levelTerm = Math.floor((2 * attacker.level) / 5) + 2;
  const numerator = levelTerm * move.power * attackStat;
  const denominator = Math.max(1, defenseStat);
  const scaled = Math.floor(numerator / denominator);
  let damage = Math.floor(scaled / 50);
  if (!specialTypes.has(move.type) && attacker.status === 'burn' && attacker.abilityId !== 'GUTS') {
    damage = Math.floor(damage / 2);
  }
  if (damage === 0) {
    damage = 1;
  }
  return damage + 2;
};

export const calculateDamagePreview = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): { min: number; max: number } => {
  if (move.power <= 0) {
    return { min: 0, max: 0 };
  }

  const max = applyStabAndTypeModifiers(calculateBaseDamage(attacker, defender, move), attacker, defender, move);
  if (max === 0) {
    return { min: 0, max: 0 };
  }

  const min = clampDamage((max * 85) / 100);
  return { min, max };
};

const calculateDamageRoll = (
  battle: BattleState,
  defenderSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState,
  critical = false
): number => {
  if (move.power <= 0) {
    return 0;
  }

  const typeBonus = getBattleTypeEffectiveness(move, defender);
  if (typeBonus === 0) {
    return 0;
  }

  let max = calculateBaseDamage(attacker, defender, move, critical) * (critical ? 2 : 1);
  if (hasPinchTypeBoost(attacker, move.type)) {
    max = Math.max(1, Math.floor((max * 15) / 10));
  }
  if (typeBoostHoldEffectByType[move.type] === getHeldItemHoldEffect(attacker)) {
    max = Math.max(1, Math.floor((max * (100 + getHeldItemHoldEffectParam(attacker))) / 100));
  }
  if (defender.abilityId === 'THICK_FAT' && (move.type === 'fire' || move.type === 'ice')) {
    max = Math.max(1, Math.floor(max / 2));
  }
  if (attacker.volatile.helpingHand) {
    max = Math.max(1, Math.floor((max * 15) / 10));
  }
  if (attacker.volatile.flashFire && move.type === 'fire') {
    max = Math.max(1, Math.floor((max * 15) / 10));
  }
  if (attacker.volatile.chargeTurns > 0 && move.type === 'electric') {
    max *= 2;
  }
  if (battle.mudSport && move.type === 'electric') {
    max = Math.max(1, Math.floor(max / 2));
  }
  if (battle.waterSport && move.type === 'fire') {
    max = Math.max(1, Math.floor(max / 2));
  }
  if (move.effect === 'EFFECT_SOLAR_BEAM' && (battle.weather === 'rain' || battle.weather === 'sandstorm' || battle.weather === 'hail')) {
    max = Math.max(1, Math.floor(max / 2));
  }
  if (!critical && !specialTypes.has(move.type) && battle.sideState[defenderSide].reflectTurns > 0) {
    max = Math.max(1, Math.floor(max / 2));
  }
  if (!critical && specialTypes.has(move.type) && battle.sideState[defenderSide].lightScreenTurns > 0) {
    max = Math.max(1, Math.floor(max / 2));
  }
  if (battle.weather === 'rain') {
    if (move.type === 'water') {
      max = Math.max(1, Math.floor((max * 15) / 10));
    } else if (move.type === 'fire') {
      max = Math.max(1, Math.floor(max / 2));
    }
  } else if (battle.weather === 'sun') {
    if (move.type === 'fire') {
      max = Math.max(1, Math.floor((max * 15) / 10));
    } else if (move.type === 'water') {
      max = Math.max(1, Math.floor(max / 2));
    }
  }
  max = applyStabAndTypeModifiers(max, attacker, defender, move);
  if (max === 0) {
    return 0;
  }

  const randomFactor = 100 - (nextBattleRng(encounterState) % 16);
  return clampDamage((max * randomFactor) / 100);
};

const getMapBaseEncounterCooldown = (encounterRate: number): number => {
  if (encounterRate >= 80) {
    return 0;
  }
  if (encounterRate < 10) {
    return 8;
  }
  return 8 - Math.floor(encounterRate / 10);
};

const shouldPassEncounterCooldown = (state: BattleEncounterState): boolean => {
  const minSteps = getMapBaseEncounterCooldown(state.encounterRate);
  if (state.stepsSinceLastEncounter >= minSteps) {
    return true;
  }

  state.stepsSinceLastEncounter += 1;
  return (nextBattleRng(state) % 100) < 5;
};

const shouldPassEncounterRateTest = (state: BattleEncounterState): boolean =>
  (nextBattleRng(state) % 100) < state.encounterRate;

export const shouldStartWildEncounter = (state: BattleEncounterState): boolean => {
  if (!shouldPassEncounterCooldown(state)) {
    return false;
  }

  return shouldPassEncounterRateTest(state);
};

const tryRunFromBattle = (
  player: BattlePokemonSnapshot,
  enemy: BattlePokemonSnapshot,
  runAttempts: number,
  encounter: BattleEncounterState
): boolean => {
  if (canAlwaysRunFromBattle(player)) {
    return true;
  }

  if (isRunPrevented(player, enemy)) {
    return false;
  }

  const playerSpeed = getTurnOrderSpeed(player);
  const enemySpeed = getTurnOrderSpeed(enemy);
  if (playerSpeed >= enemySpeed) {
    return true;
  }

  const speedVar = Math.floor((playerSpeed * 128) / Math.max(1, enemySpeed)) + (runAttempts * 30);
  const roll = nextBattleRng(encounter) & 0xff;
  return speedVar > roll;
};

type MoveSelectionLimitation =
  | 'zeroMove'
  | 'noPp'
  | 'disabled'
  | 'torment'
  | 'taunt'
  | 'imprison'
  | 'encore'
  | 'choiceBand';

const getChoicedMoveId = (pokemon: BattlePokemonSnapshot): string | null => {
  const moveId = pokemon.volatile.choicedMoveId;
  if (!moveId) {
    return null;
  }

  if (pokemon.moves.some((move) => move.id === moveId)) {
    return moveId;
  }

  pokemon.volatile.choicedMoveId = null;
  return null;
};

const getMoveSelectionLimitation = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  move: BattleMove,
  {
    ignorePp = false,
    lastMoveUsedId = pokemon.volatile.lastMoveUsedId
  }: {
    ignorePp?: boolean;
    lastMoveUsedId?: string | null;
  } = {}
): MoveSelectionLimitation | null => {
  if (move.id === 'NONE') {
    return 'zeroMove';
  }

  if (!ignorePp && move.ppRemaining <= 0) {
    return 'noPp';
  }

  if (pokemon.volatile.disableTurns > 0 && pokemon.volatile.disabledMoveId === move.id) {
    return 'disabled';
  }

  if (pokemon.volatile.tormented && lastMoveUsedId === move.id) {
    return 'torment';
  }

  if (pokemon.volatile.tauntTurns > 0 && move.power === 0) {
    return 'taunt';
  }

  const opponent = side === 'player' ? battle.wildMon : battle.playerMon;
  if (opponent.volatile.imprisoning && opponent.moves.some((opponentMove) => opponentMove.id === move.id)) {
    return 'imprison';
  }

  if (pokemon.volatile.encoreTurns > 0 && pokemon.volatile.encoreMoveId && pokemon.volatile.encoreMoveId !== move.id) {
    return 'encore';
  }

  const choicedMoveId = getChoicedMoveId(pokemon);
  if (getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_CHOICE_BAND' && choicedMoveId && choicedMoveId !== move.id) {
    return 'choiceBand';
  }

  return null;
};

const getSelectableMoveIndexes = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  moves: BattleMove[]
): number[] => moves.flatMap((move, index) =>
  getMoveSelectionLimitation(battle, side, pokemon, move) === null ? [index] : []
);

const getPlayerMoveSelectionBlockMessage = (
  battle: BattleState,
  move: BattleMove,
  limitation: MoveSelectionLimitation
): string => {
  switch (limitation) {
    case 'disabled':
      return `${battle.playerMon.species}'s ${move.name} is disabled!`;
    case 'torment':
      return `${battle.playerMon.species} can't use the same move twice due to torment!`;
    case 'taunt':
      return `${battle.playerMon.species} can't use ${move.name} after the taunt!`;
    case 'imprison':
      return `${battle.playerMon.species} can't use the sealed ${move.name}!`;
    case 'encore': {
      const encoredMove = battle.moves.find((knownMove) => knownMove.id === battle.playerMon.volatile.encoreMoveId);
      return encoredMove
        ? `${battle.playerMon.species} must use ${encoredMove.name}!`
        : 'But it failed!';
    }
    case 'choiceBand': {
      const choicedMoveId = getChoicedMoveId(battle.playerMon);
      const choicedMove = choicedMoveId
        ? battle.moves.find((knownMove) => knownMove.id === choicedMoveId) ?? getRegisteredBattleMove(choicedMoveId)
        : null;
      return choicedMove
        ? `${battle.playerMon.species} can only use ${choicedMove.name}!`
        : 'But it failed!';
    }
    case 'zeroMove':
    case 'noPp':
      return `There's no PP left for ${move.name}!`;
  }
};

const chooseEnemyMoveIndex = (battle: BattleState, encounter: BattleEncounterState): number => {
  if (battle.wildMon.volatile.bideTurns > 0 && battle.wildMon.volatile.bideMoveId) {
    const bideIndex = battle.wildMoves.findIndex((move) => move.id === battle.wildMon.volatile.bideMoveId);
    if (bideIndex >= 0) {
      return bideIndex;
    }
  }

  if (battle.wildMon.volatile.chargingMoveId) {
    const chargingIndex = battle.wildMoves.findIndex((move) => move.id === battle.wildMon.volatile.chargingMoveId);
    if (chargingIndex >= 0) {
      return chargingIndex;
    }
  }

  const lockedMoveId = battle.wildMon.volatile.rampageMoveId ?? battle.wildMon.volatile.uproarMoveId;
  if (lockedMoveId) {
    const lockedIndex = battle.wildMoves.findIndex((move) => move.id === lockedMoveId);
    if (lockedIndex >= 0) {
      return lockedIndex;
    }
  }

  if (battle.wildMon.volatile.encoreTurns > 0 && battle.wildMon.volatile.encoreMoveId) {
    const encoredIndex = battle.wildMoves.findIndex((move) =>
      move.id === battle.wildMon.volatile.encoreMoveId
      && move.ppRemaining > 0
      && move.id !== battle.wildMon.volatile.disabledMoveId
    );
    if (encoredIndex >= 0) {
      return encoredIndex;
    }
  }

  const usable = getSelectableMoveIndexes(battle, 'opponent', battle.wildMon, battle.wildMoves)
    .map((index) => ({ index }));

  if (usable.length === 0) {
    return -1;
  }

  if (hasBattleTypeFlag(battle, 'trainer') && battle.opponentTrainerAiFlags.length > 0) {
    const aiDecision = chooseTrainerMoveIndex(
      usable.map(({ index }) => {
        const move = battle.wildMoves[index]!;
        return {
          index,
          move,
          effectiveness: getBattleTypeEffectiveness(move, battle.playerMon),
          maxDamage: move.power > 0 ? calculateDamagePreview(battle.wildMon, battle.playerMon, move).max : 0,
          targetStatus: battle.playerMon.status,
          context: {
            user: battle.wildMon,
            target: battle.playerMon,
            userMoves: battle.wildMoves,
            targetMoves: battle.moves,
            userSideState: battle.sideState.opponent,
            targetSideState: battle.sideState.player,
            weather: battle.weather,
            mudSport: battle.mudSport,
            waterSport: battle.waterSport,
            turnCount: battle.battleTurnCounter,
            format: battle.format,
            userPartyAliveCount: battle.opponentSide.party.filter((pokemon) => pokemon.hp > 0).length,
            targetPartyAliveCount: battle.playerSide.party.filter((pokemon) => pokemon.hp > 0).length,
            userParty: battle.opponentSide.party,
            targetParty: battle.playerSide.party,
            safariEscapeFactor: battle.safariEscapeFactor,
            safariRockThrowCounter: battle.safariRockThrowCounter,
            safariBaitThrowCounter: battle.safariBaitThrowCounter
          }
        };
      }),
      battle.opponentTrainerAiFlags,
      (maxExclusive) => nextEncounterRoll(encounter, maxExclusive)
    );

    if (aiDecision) {
      battle.vm.locals.aiRootScripts = aiDecision.scoredMoves[0]?.rootScripts.join(',') ?? null;
      battle.vm.locals.aiUnsupportedOpcodes = aiDecision.scoredMoves[0]?.unsupportedOpcodes.join(',') ?? null;
      return aiDecision.selectedIndex;
    }
  }

  return usable[nextEncounterRoll(encounter, usable.length)]?.index ?? usable[0].index;
};

const hasUsableMove = (moves: BattleMove[]): boolean => moves.some((move) => move.ppRemaining > 0);

const tryUseOpponentTrainerItem = (battle: BattleState, messages: string[]): boolean => {
  const decision = getTrainerBattleItemDecision(battle);
  if (!decision) {
    return false;
  }
  const itemIndex = decision.itemIndex;
  if (itemIndex < 0) {
    return false;
  }

  const [itemId] = battle.opponentTrainerItems.splice(itemIndex, 1);
  battle.vm.locals.aiItemType = decision.aiItemType;
  battle.vm.locals.aiItemFlags = decision.aiItemFlags.join(',');
  messages.push(`${battle.opponentSide.name} used ${getItemDefinition(itemId!).name}!`);

  switch (decision.kind) {
    case 'fullRestore':
      healBattler(battle, 'opponent', battle.wildMon, battle.wildMon.maxHp, messages);
      battle.wildMon.status = 'none';
      battle.wildMon.statusTurns = 0;
      battle.wildMon.volatile.toxicCounter = 0;
      battle.wildMon.volatile.confusionTurns = 0;
      if (!messages.includes(`${battle.wildMon.species}'s status returned to normal!`)) {
        messages.push(`${battle.wildMon.species}'s status returned to normal!`);
      }
      return true;
    case 'healHp':
      healBattler(battle, 'opponent', battle.wildMon, decision.healAmount, messages);
      return true;
    case 'cureCondition':
      battle.wildMon.status = 'none';
      battle.wildMon.statusTurns = 0;
      battle.wildMon.volatile.toxicCounter = 0;
      battle.wildMon.volatile.confusionTurns = 0;
      messages.push(`${battle.wildMon.species}'s status returned to normal!`);
      return true;
    case 'xAttack':
      applyDirectStageChange(battle.wildMon, 'attack', 1, messages);
      return true;
    case 'xDefense':
      applyDirectStageChange(battle.wildMon, 'defense', 1, messages);
      return true;
    case 'xSpeed':
      applyDirectStageChange(battle.wildMon, 'speed', 1, messages);
      return true;
    case 'xSpAttack':
      applyDirectStageChange(battle.wildMon, 'spAttack', 1, messages);
      return true;
    case 'xAccuracy':
      applyDirectStageChange(battle.wildMon, 'accuracy', 1, messages);
      return true;
    case 'direHit':
      useFocusEnergy(battle.wildMon, messages);
      return true;
    case 'guardSpecs':
      battle.sideState.opponent.mistTurns = 5;
      messages.push("Foe's team became shrouded in Mist!");
      return true;
  }
};

const tryUseOpponentTrainerSwitch = (
  battle: BattleState,
  messages: string[],
  encounterState: BattleEncounterState,
  opponentBattlerId: BattleBattlerId = 1
): boolean => {
  const switchDecision = chooseOpponentTrainerSwitch(battle, encounterState, opponentBattlerId);
  if (!switchDecision) {
    return false;
  }

  const activeOpponent = getBattlerSnapshot(battle, opponentBattlerId) ?? battle.wildMon;
  const nextOpponentMon = battle.opponentSide.party[switchDecision.partyIndex];
  if (!nextOpponentMon || nextOpponentMon.hp <= 0) {
    return false;
  }

  battle.vm.locals.aiSwitchHelper = switchDecision.helper;
  clearSwitchReferences(battle, 'opponent');
  resetBattlePokemonTransientState(activeOpponent);
  resetBattlePokemonTransientState(nextOpponentMon);
  messages.push(`${battle.opponentSide.name} withdrew ${activeOpponent.species}!`);
  if (battle.format === 'doubles') {
    setBattlerPartyIndex(battle, opponentBattlerId, switchDecision.partyIndex);
  } else {
    setActiveBattlePartyMember(battle, 'opponent', nextOpponentMon);
  }
  refreshActiveMovePointers(battle);
  messages.push(`${battle.opponentSide.name} sent out ${nextOpponentMon.species}!`);
  applySpikesSwitchIn(battle, 'opponent', nextOpponentMon, messages);
  return true;
};

const tryResolveOpponentTrainerAction = (
  battle: BattleState,
  messages: string[],
  encounterState: BattleEncounterState,
  opponentBattlerId: BattleBattlerId = 1
): boolean => {
  battle.vm.locals.aiAction = '';
  battle.vm.locals.aiSwitchHelper = '';

  if (tryUseOpponentTrainerSwitch(battle, messages, encounterState, opponentBattlerId)) {
    battle.vm.locals.aiAction = 'switch';
    return true;
  }
  if (tryUseOpponentTrainerItem(battle, messages)) {
    battle.vm.locals.aiAction = 'item';
    return true;
  }

  battle.vm.locals.aiAction = 'move';
  return false;
};

const getEnemyTurnMove = (battle: BattleState, encounter: BattleEncounterState): BattleMove | null => {
  const enemyMoveIndex = chooseEnemyMoveIndex(battle, encounter);
  if (enemyMoveIndex < 0) {
    return getStruggleMove();
  }

  return battle.wildMoves[enemyMoveIndex] ?? battle.wildMoves[0] ?? null;
};

const getPlayerTurnMove = (battle: BattleState): BattleMove | null => {
  if (battle.playerMon.volatile.bideTurns > 0 && battle.playerMon.volatile.bideMoveId) {
    const bideMove = battle.moves.find((move) => move.id === battle.playerMon.volatile.bideMoveId);
    if (bideMove) {
      return bideMove;
    }
  }

  if (battle.playerMon.volatile.chargingMoveId) {
    const chargingMove = battle.moves.find((move) => move.id === battle.playerMon.volatile.chargingMoveId);
    if (chargingMove) {
      return chargingMove;
    }
  }

  const lockedMoveId = battle.playerMon.volatile.rampageMoveId ?? battle.playerMon.volatile.uproarMoveId;
  if (lockedMoveId) {
    const lockedMove = battle.moves.find((move) => move.id === lockedMoveId);
    if (lockedMove) {
      return lockedMove;
    }
  }

  if (battle.playerMon.volatile.encoreTurns > 0 && battle.playerMon.volatile.encoreMoveId) {
    const encoredMove = battle.moves.find((move) => move.id === battle.playerMon.volatile.encoreMoveId);
    if (encoredMove && getMoveSelectionLimitation(battle, 'player', battle.playerMon, encoredMove) === null) {
      return encoredMove;
    }
  }

  if (getSelectableMoveIndexes(battle, 'player', battle.playerMon, battle.moves).length === 0) {
    return getStruggleMove();
  }

  const playerMove = battle.moves[battle.selectedMoveIndex];
  if (!playerMove) {
    return null;
  }

  return playerMove.ppRemaining > 0 || hasUsableMove(battle.moves) ? playerMove : getStruggleMove();
};

const getRaisedStatTotal = (pokemon: BattlePokemonSnapshot): number =>
  Object.values(pokemon.statStages).reduce((sum, stage) => sum + Math.max(0, stage), 0);

const getBestMoveEffectivenessAgainstTarget = (
  moves: BattleMove[],
  target: BattlePokemonSnapshot
): number => moves.reduce(
  (best, move) => move.power > 0 ? Math.max(best, calculateTypeEffectiveness(move.type, target.types)) : best,
  0
);

const getBestMoveDamageAgainstTarget = (
  attacker: BattlePokemonSnapshot,
  target: BattlePokemonSnapshot,
  moves: BattleMove[]
): number => moves.reduce(
  (best, move) => move.power > 0 ? Math.max(best, calculateDamagePreview(attacker, target, move).max) : best,
  0
);

const hasSuperEffectiveMoveAgainstPlayer = (
  battle: BattleState,
  moves: BattleMove[],
  encounterState: BattleEncounterState | null,
  noRng = false
): boolean => moves.some((move) => {
  if (move.id === 'MOVE_NONE' || calculateTypeEffectiveness(move.type, battle.playerMon.types) < 2) {
    return false;
  }
  return noRng || !encounterState || nextEncounterRoll(encounterState, 10) !== 0;
});

const getAbsorbingAbilityForType = (type: PokemonType | null): string | null => {
  switch (type) {
    case 'fire':
      return 'FLASH_FIRE';
    case 'water':
      return 'WATER_ABSORB';
    case 'electric':
      return 'VOLT_ABSORB';
    default:
      return null;
  }
};

const findBenchMonWithFlagsAndSuperEffective = (
  battle: BattleState,
  candidateIndexes: number[],
  flag: 'noEffect' | 'resisted',
  moduloPercent: number,
  encounterState: BattleEncounterState
): number | null => {
  const lastLandedMove = battle.wildMon.volatile.lastLandedMoveId
    ? getRegisteredBattleMove(battle.wildMon.volatile.lastLandedMoveId)
    : null;
  if (!lastLandedMove || lastLandedMove.power <= 0 || !battle.wildMon.volatile.lastDamagedBy) {
    return null;
  }

  for (const partyIndex of candidateIndexes) {
    const pokemon = battle.opponentSide.party[partyIndex];
    if (!pokemon) {
      continue;
    }

    const incomingEffectiveness = calculateTypeEffectiveness(lastLandedMove.type, pokemon.types);
    const matchesFlag = flag === 'noEffect'
      ? incomingEffectiveness === 0
      : incomingEffectiveness > 0 && incomingEffectiveness < 1;
    if (
      matchesFlag
      && getBestMoveEffectivenessAgainstTarget(pokemon.moves, battle.playerMon) >= 2
      && nextEncounterRoll(encounterState, moduloPercent) === 0
    ) {
      return partyIndex;
    }
  }

  return null;
};

const chooseMostSuitableOpponentSwitchIndex = (
  battle: BattleState,
  candidateIndexes: number[]
): number | null => {
  const incomingTypeScore = (pokemon: BattlePokemonSnapshot): number => {
    const playerTypes = new Set(battle.playerMon.types);
    let score = 1;
    for (const type of playerTypes) {
      score *= calculateTypeEffectiveness(type, pokemon.types);
    }
    return score;
  };

  const pendingInvalid = new Set<number>();
  while (pendingInvalid.size < candidateIndexes.length) {
    let bestTypingIndex: number | null = null;
    let bestTypingScore = Number.NEGATIVE_INFINITY;

    for (const partyIndex of candidateIndexes) {
      if (pendingInvalid.has(partyIndex)) {
        continue;
      }
      const pokemon = battle.opponentSide.party[partyIndex];
      if (!pokemon) {
        pendingInvalid.add(partyIndex);
        continue;
      }

      const typeScore = incomingTypeScore(pokemon);
      if (typeScore > bestTypingScore) {
        bestTypingScore = typeScore;
        bestTypingIndex = partyIndex;
      }
    }

    if (bestTypingIndex === null) {
      break;
    }

    const pokemon = battle.opponentSide.party[bestTypingIndex];
    if (pokemon && getBestMoveEffectivenessAgainstTarget(pokemon.moves, battle.playerMon) >= 2) {
      return bestTypingIndex;
    }
    pendingInvalid.add(bestTypingIndex);
  }

  let bestDamageIndex: number | null = null;
  let bestDamageValue = 0;
  for (const partyIndex of candidateIndexes) {
    const pokemon = battle.opponentSide.party[partyIndex];
    if (!pokemon) {
      continue;
    }

    const candidateDamage = getBestMoveDamageAgainstTarget(pokemon, battle.playerMon, pokemon.moves);
    if (candidateDamage > bestDamageValue) {
      bestDamageValue = candidateDamage;
      bestDamageIndex = partyIndex;
    }
  }

  return bestDamageIndex;
};

const chooseOpponentTrainerSwitch = (
  battle: BattleState,
  encounterState: BattleEncounterState,
  opponentBattlerId: BattleBattlerId = 1
): { partyIndex: number; helper: string } | null => {
  const activeOpponent = getBattlerSnapshot(battle, opponentBattlerId) ?? battle.wildMon;
  if (!hasBattleTypeFlag(battle, 'trainer') || activeOpponent.hp <= 0) {
    return null;
  }
  if (battle.format !== 'singles') {
    if (activeOpponent.volatile.perishTurns !== 1) {
      return null;
    }
    const candidateIndexes = getBattlerBenchIndexes(battle, opponentBattlerId);
    if (candidateIndexes.length === 0) {
      return null;
    }
    return {
      partyIndex: candidateIndexes[0]!,
      helper: 'ShouldSwitchIfPerishSong'
    };
  }
  if (isSwitchPreventedByOpponent(battle.wildMon, battle.playerMon)) {
    return null;
  }

  const candidateIndexes = getBattlerBenchIndexes(battle, 1);
  if (candidateIndexes.length === 0) {
    return null;
  }

  const activeBestEffectiveness = getBestMoveEffectivenessAgainstTarget(battle.wildMoves, battle.playerMon);
  const helperNames = [
    'ShouldSwitchIfPerishSong',
    'ShouldSwitchIfWonderGuard',
    'FindMonThatAbsorbsOpponentsMove',
    'ShouldSwitchIfNaturalCure',
    'GetMostSuitableMonToSwitchInto'
  ].filter((name) => getDecompBattleAiSwitchHelper(name));

  if (helperNames.includes('ShouldSwitchIfPerishSong') && battle.wildMon.volatile.perishTurns === 1) {
    return {
      partyIndex: chooseMostSuitableOpponentSwitchIndex(battle, candidateIndexes) ?? candidateIndexes[0]!,
      helper: 'ShouldSwitchIfPerishSong'
    };
  }

  if (
    helperNames.includes('ShouldSwitchIfWonderGuard')
    && battle.playerMon.abilityId === 'WONDER_GUARD'
    && activeBestEffectiveness < 2
  ) {
    const wonderGuardSwitch = candidateIndexes.find((partyIndex) =>
      getBestMoveEffectivenessAgainstTarget(battle.opponentSide.party[partyIndex]?.moves ?? [], battle.playerMon) >= 2
      && nextEncounterRoll(encounterState, 3) < 2
    );
    if (wonderGuardSwitch !== undefined) {
      return { partyIndex: wonderGuardSwitch, helper: 'ShouldSwitchIfWonderGuard' };
    }
  }

  if (
    helperNames.includes('FindMonThatAbsorbsOpponentsMove')
    && (!hasSuperEffectiveMoveAgainstPlayer(battle, battle.wildMoves, null, true) || nextEncounterRoll(encounterState, 3) === 0)
    && battle.wildMon.volatile.lastLandedMoveId
  ) {
    const lastLandedMove = getRegisteredBattleMove(battle.wildMon.volatile.lastLandedMoveId);
    const absorbingAbility = lastLandedMove && lastLandedMove.power > 0
      ? getAbsorbingAbilityForType(lastLandedMove.type)
      : null;
    if (absorbingAbility && battle.wildMon.abilityId !== absorbingAbility) {
      const absorbingSwitch = candidateIndexes.find((partyIndex) =>
        battle.opponentSide.party[partyIndex]?.abilityId === absorbingAbility
        && (nextBattleRng(encounterState) & 1) !== 0
      );
      if (absorbingSwitch !== undefined) {
        return { partyIndex: absorbingSwitch, helper: 'FindMonThatAbsorbsOpponentsMove' };
      }
    }
  }

  if (
    helperNames.includes('ShouldSwitchIfNaturalCure')
    && battle.wildMon.abilityId === 'NATURAL_CURE'
    && battle.wildMon.status === 'sleep'
    && battle.wildMon.hp >= Math.floor(battle.wildMon.maxHp / 2)
  ) {
    const lastLandedMove = battle.wildMon.volatile.lastLandedMoveId
      ? getRegisteredBattleMove(battle.wildMon.volatile.lastLandedMoveId)
      : null;
    if (!lastLandedMove && (nextBattleRng(encounterState) & 1) !== 0) {
      return {
        partyIndex: chooseMostSuitableOpponentSwitchIndex(battle, candidateIndexes) ?? candidateIndexes[0]!,
        helper: 'ShouldSwitchIfNaturalCure'
      };
    }
    if (lastLandedMove && lastLandedMove.power === 0 && (nextBattleRng(encounterState) & 1) !== 0) {
      return {
        partyIndex: chooseMostSuitableOpponentSwitchIndex(battle, candidateIndexes) ?? candidateIndexes[0]!,
        helper: 'ShouldSwitchIfNaturalCure'
      };
    }
    const noEffectSwitch = findBenchMonWithFlagsAndSuperEffective(battle, candidateIndexes, 'noEffect', 1, encounterState);
    if (noEffectSwitch !== null) {
      return { partyIndex: noEffectSwitch, helper: 'ShouldSwitchIfNaturalCure' };
    }
    const resistedSwitch = findBenchMonWithFlagsAndSuperEffective(battle, candidateIndexes, 'resisted', 1, encounterState);
    if (resistedSwitch !== null) {
      return { partyIndex: resistedSwitch, helper: 'ShouldSwitchIfNaturalCure' };
    }
    if ((nextBattleRng(encounterState) & 1) !== 0) {
      return {
        partyIndex: chooseMostSuitableOpponentSwitchIndex(battle, candidateIndexes) ?? candidateIndexes[0]!,
        helper: 'ShouldSwitchIfNaturalCure'
      };
    }
    return null;
  }

  if (hasSuperEffectiveMoveAgainstPlayer(battle, battle.wildMoves, encounterState) || getRaisedStatTotal(battle.wildMon) > 3) {
    return null;
  }

  const noEffectSwitch = findBenchMonWithFlagsAndSuperEffective(battle, candidateIndexes, 'noEffect', 2, encounterState);
  if (noEffectSwitch !== null) {
    return { partyIndex: noEffectSwitch, helper: 'FindMonWithFlagsAndSuperEffective' };
  }
  const resistedSwitch = findBenchMonWithFlagsAndSuperEffective(battle, candidateIndexes, 'resisted', 3, encounterState);
  if (resistedSwitch !== null) {
    return { partyIndex: resistedSwitch, helper: 'FindMonWithFlagsAndSuperEffective' };
  }

  if (
    helperNames.includes('GetMostSuitableMonToSwitchInto')
    && (battle.wildMon.volatile.perishTurns === 1 || (
      battle.wildMon.abilityId === 'NATURAL_CURE'
      && battle.wildMon.status === 'sleep'
      && battle.wildMon.hp >= Math.floor(battle.wildMon.maxHp / 2)
    ))
  ) {
    const bestSwitch = chooseMostSuitableOpponentSwitchIndex(battle, candidateIndexes);
    if (bestSwitch !== null) {
      return { partyIndex: bestSwitch, helper: 'GetMostSuitableMonToSwitchInto' };
    }
  }

  return null;
};

const getTrainerBattleItemDecision = (battle: BattleState) => {
  if (!hasBattleTypeFlag(battle, 'trainer') || battle.opponentTrainerItems.length === 0 || battle.wildMon.hp <= 0) {
    return null;
  }

  return chooseTrainerAiItemDecision({
    active: battle.wildMon,
    party: battle.opponentSide.party,
    sideState: battle.sideState.opponent,
    trainerItems: battle.opponentTrainerItems
  });
};

const getForcedBattlerMove = (
  battle: BattleState,
  side: BattleSideId,
  pokemon: BattlePokemonSnapshot,
  moves: BattleMove[]
): BattleMove | null => {
  if (pokemon.volatile.bideTurns > 0 && pokemon.volatile.bideMoveId) {
    const bideMove = moves.find((move) => move.id === pokemon.volatile.bideMoveId);
    if (bideMove) {
      return bideMove;
    }
  }

  if (pokemon.volatile.chargingMoveId) {
    const chargingMove = moves.find((move) => move.id === pokemon.volatile.chargingMoveId);
    if (chargingMove) {
      return chargingMove;
    }
  }

  const lockedMoveId = pokemon.volatile.rampageMoveId ?? pokemon.volatile.uproarMoveId;
  if (lockedMoveId) {
    const lockedMove = moves.find((move) => move.id === lockedMoveId);
    if (lockedMove) {
      return lockedMove;
    }
  }

  if (pokemon.volatile.encoreTurns > 0 && pokemon.volatile.encoreMoveId) {
    const encoredMove = moves.find((move) => move.id === pokemon.volatile.encoreMoveId);
    if (encoredMove && getMoveSelectionLimitation(battle, side, pokemon, encoredMove) === null) {
      return encoredMove;
    }
  }

  return null;
};

const getAutoSelectedBattlerMove = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleMove | null => {
  const side = getBattlerSide(battlerId);
  const pokemon = getBattlerSnapshot(battle, battlerId);
  const moves = getBattlerMoves(battle, battlerId);
  if (!pokemon || moves.length === 0) {
    return null;
  }

  const forcedMove = getForcedBattlerMove(battle, side, pokemon, moves);
  if (forcedMove) {
    return forcedMove;
  }

  const selectableIndexes = getSelectableMoveIndexes(battle, side, pokemon, moves);
  if (selectableIndexes.length === 0) {
    return getStruggleMove();
  }

  const selectedMove = moves[selectableIndexes[0]!] ?? null;
  if (!selectedMove) {
    return null;
  }

  return selectedMove.ppRemaining > 0 || hasUsableMove(moves) ? selectedMove : getStruggleMove();
};

const getBattlerTurnMove = (
  battle: BattleState,
  battlerId: BattleBattlerId,
  encounterState: BattleEncounterState
): BattleMove | null => {
  if (battlerId === 0) {
    return getPlayerTurnMove(battle);
  }

  const attackerSide = getBattlerSide(battlerId);
  const defaultTarget = getActiveBattlerIds(
    battle,
    attackerSide === 'player' ? 'opponent' : 'player'
  )[0];
  if (defaultTarget === undefined) {
    return null;
  }

  if (attackerSide === 'opponent') {
    return withTemporaryBattlerPair(
      battle,
      battlerId,
      defaultTarget,
      () => getEnemyTurnMove(battle, encounterState)
    );
  }

  return withTemporaryBattlerPair(
    battle,
    battlerId,
    defaultTarget,
    () => getAutoSelectedBattlerMove(battle, battlerId)
  );
};

const getDoublesActionOrder = (
  battle: BattleState,
  battlerMoves: Map<BattleBattlerId, BattleMove>,
  encounterState: BattleEncounterState
): BattleBattlerId[] => Array.from(battlerMoves.entries())
  .map(([battlerId, move]) => {
    const pokemon = getBattlerSnapshot(battle, battlerId)!;
    let speed = getTurnOrderSpeed(pokemon, battle.weather);
    if (
      getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_QUICK_CLAW'
      && (nextBattleRng(encounterState) & 0xffff) < Math.floor((0xffff * getHeldItemHoldEffectParam(pokemon)) / 100)
    ) {
      speed = Number.MAX_SAFE_INTEGER;
    }

    return {
      battlerId,
      move,
      speed,
      tieBreaker: nextBattleRng(encounterState)
    };
  })
  .sort((left, right) => {
    if (left.move.priority !== right.move.priority) {
      return right.move.priority - left.move.priority;
    }
    if (left.speed !== right.speed) {
      return right.speed - left.speed;
    }
    if (left.tieBreaker !== right.tieBreaker) {
      return left.tieBreaker - right.tieBreaker;
    }
    return left.battlerId - right.battlerId;
  })
  .map((entry) => entry.battlerId);

const getAllyBattlerId = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleBattlerId | null => getActiveBattlerIds(battle, getBattlerSide(battlerId))
  .find((candidate) => candidate !== battlerId) ?? null;

const getDefaultOpposingBattlerId = (
  battle: BattleState,
  battlerId: BattleBattlerId
): BattleBattlerId | null => getActiveBattlerIds(
  battle,
  getBattlerSide(battlerId) === 'player' ? 'opponent' : 'player'
)
  .find((candidate) => getBattlerSnapshot(battle, candidate)?.hp! > 0) ?? null;

const maybeRedirectFollowMeTarget = (
  battle: BattleState,
  targetBattlerId: BattleBattlerId,
  move: BattleMove
): BattleBattlerId => {
  if (
    battle.format !== 'doubles'
    || move.target === 'MOVE_TARGET_USER'
    || move.target === 'MOVE_TARGET_BOTH'
    || move.target === 'MOVE_TARGET_FOES_AND_ALLY'
  ) {
    return targetBattlerId;
  }

  const targetSide = getBattlerSide(targetBattlerId);
  const followMeTarget = getActiveBattlerIds(battle, targetSide)
    .find((candidate) => getBattlerSnapshot(battle, candidate)?.volatile.followMe);
  return followMeTarget ?? targetBattlerId;
};

const getDoublesMoveTargets = (
  battle: BattleState,
  battlerId: BattleBattlerId,
  move: BattleMove,
  encounterState: BattleEncounterState
): BattleBattlerId[] => {
  const opposingBattlers = getActiveBattlerIds(
    battle,
    getBattlerSide(battlerId) === 'player' ? 'opponent' : 'player'
  ).filter((candidate) => getBattlerSnapshot(battle, candidate)?.hp! > 0);
  const allyBattlerId = getAllyBattlerId(battle, battlerId);

  if (move.effect === 'EFFECT_HELPING_HAND') {
    return allyBattlerId !== null ? [allyBattlerId] : [battlerId];
  }

  if (move.target === 'MOVE_TARGET_USER') {
    return [battlerId];
  }
  if (move.target === 'MOVE_TARGET_BOTH') {
    return opposingBattlers;
  }
  if (move.target === 'MOVE_TARGET_FOES_AND_ALLY') {
    return allyBattlerId !== null ? [...opposingBattlers, allyBattlerId] : opposingBattlers;
  }
  if (opposingBattlers.length === 0) {
    return [battlerId];
  }
  if (move.target === 'MOVE_TARGET_RANDOM') {
    return [opposingBattlers[nextEncounterRoll(encounterState, opposingBattlers.length)]!];
  }

  const selectedTarget = getDefaultOpposingBattlerId(battle, battlerId);
  return selectedTarget !== null ? [maybeRedirectFollowMeTarget(battle, selectedTarget, move)] : [battlerId];
};

const hasLivingBenchMon = (battle: BattleState): boolean =>
  battle.party.some((member) => member !== battle.playerMon && member.hp > 0);

const hasLivingOpponentBenchMon = (battle: BattleState): boolean =>
  battle.opponentSide.party.some((member) => member !== battle.wildMon && member.hp > 0);

const getNextLivingOpponentPartyIndex = (battle: BattleState): number | null => {
  const nextIndex = battle.opponentSide.party.findIndex((member) => member !== battle.wildMon && member.hp > 0);
  return nextIndex >= 0 ? nextIndex : null;
};

const getBattlePokemonTotalExperience = (pokemon: BattlePokemonSnapshot): number => {
  const speciesInfo = getDecompSpeciesInfo(pokemon.species);
  if (!speciesInfo) {
    return 0;
  }

  const currentLevelExp = getExperienceForLevel(speciesInfo.growthRate, pokemon.level);
  if (pokemon.level >= 100) {
    return currentLevelExp;
  }

  const nextLevelExp = getExperienceForLevel(speciesInfo.growthRate, pokemon.level + 1);
  const expRange = Math.max(1, nextLevelExp - currentLevelExp);
  return Math.min(nextLevelExp, currentLevelExp + Math.floor(expRange * pokemon.expProgress));
};

const updateBattlePokemonStatsForLevel = (
  pokemon: BattlePokemonSnapshot,
  previousMaxHp: number
): void => {
  const speciesInfo = getDecompSpeciesInfo(pokemon.species);
  if (!speciesInfo) {
    return;
  }

  pokemon.maxHp = calculateStat(speciesInfo.baseHp, pokemon.level, true, pokemon.ivs.hp, pokemon.evs.hp);
  pokemon.attack = calculateStat(speciesInfo.baseAttack, pokemon.level, false, pokemon.ivs.attack, pokemon.evs.attack);
  pokemon.defense = calculateStat(speciesInfo.baseDefense, pokemon.level, false, pokemon.ivs.defense, pokemon.evs.defense);
  pokemon.speed = calculateStat(speciesInfo.baseSpeed, pokemon.level, false, pokemon.ivs.speed, pokemon.evs.speed);
  pokemon.spAttack = calculateStat(speciesInfo.baseSpAttack, pokemon.level, false, pokemon.ivs.spAttack, pokemon.evs.spAttack);
  pokemon.spDefense = calculateStat(speciesInfo.baseSpDefense, pokemon.level, false, pokemon.ivs.spDefense, pokemon.evs.spDefense);
  pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + Math.max(0, pokemon.maxHp - previousMaxHp));
};

const gainBattlePokemonEvs = (pokemon: BattlePokemonSnapshot, defeatedSpecies: string): void => {
  const speciesInfo = getDecompSpeciesInfo(defeatedSpecies);
  if (!speciesInfo) {
    return;
  }

  const evOrder: Array<keyof BattleEvs> = ['hp', 'attack', 'defense', 'speed', 'spAttack', 'spDefense'];
  let totalEvs = evOrder.reduce((sum, stat) => sum + pokemon.evs[stat], 0);
  if (totalEvs >= 510) {
    return;
  }

  const multiplier = getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_MACHO_BRACE' ? 2 : 1;
  for (const stat of evOrder) {
    if (totalEvs >= 510) {
      break;
    }

    let increase = speciesInfo.evYield[stat] * multiplier;
    if (increase <= 0) {
      continue;
    }

    increase = Math.min(increase, 510 - totalEvs);
    increase = Math.min(increase, 255 - pokemon.evs[stat]);
    if (increase <= 0) {
      continue;
    }

    pokemon.evs[stat] += increase;
    totalEvs += increase;
  }
};

const awardBattleExperience = (battle: BattleState, messages: string[] = []): void => {
  const pendingDefeatedPartyIndexes = battle.defeatedOpponentPartyIndexes
    .filter((partyIndex) => !battle.rewardedOpponentPartyIndexes.includes(partyIndex));
  if (pendingDefeatedPartyIndexes.length === 0) {
    battle.rewardsApplied = true;
    return;
  }

  if (battle.playerParticipantPartyIndexes.length === 0) {
    battle.rewardsApplied = true;
    return;
  }

  const participants = battle.playerParticipantPartyIndexes
    .map((partyIndex) => ({ partyIndex, pokemon: battle.playerSide.party[partyIndex] }))
    .filter((entry): entry is { partyIndex: number; pokemon: BattlePokemonSnapshot } => !!entry.pokemon && entry.pokemon.hp > 0 && entry.pokemon.level < 100);
  const expShareRecipients = battle.playerSide.party
    .map((pokemon, partyIndex) => ({ partyIndex, pokemon }))
    .filter((entry) =>
      !!entry.pokemon
      && entry.pokemon.hp > 0
      && entry.pokemon.level < 100
      && getHeldItemHoldEffect(entry.pokemon) === 'HOLD_EFFECT_EXP_SHARE'
    );

  if (participants.length === 0 && expShareRecipients.length === 0) {
    battle.rewardsApplied = true;
    return;
  }

  for (const defeatedPartyIndex of pendingDefeatedPartyIndexes) {
    const faintedMon = battle.opponentSide.party[defeatedPartyIndex];
    const speciesInfo = faintedMon ? getDecompSpeciesInfo(faintedMon.species) : null;
    if (!faintedMon || !speciesInfo) {
      battle.rewardedOpponentPartyIndexes.push(defeatedPartyIndex);
      continue;
    }

    const baseExp = Math.max(1, Math.floor((speciesInfo.expYield * faintedMon.level) / 7));
    const participantShare = expShareRecipients.length > 0
      ? (participants.length > 0 ? Math.max(1, Math.floor(Math.floor(baseExp / 2) / participants.length)) : 0)
      : (participants.length > 0 ? Math.max(1, Math.floor(baseExp / participants.length)) : 0);
    const expShareShare = expShareRecipients.length > 0
      ? Math.max(1, Math.floor(Math.floor(baseExp / 2) / expShareRecipients.length))
      : 0;

    const rewardRecipients = battle.playerSide.party
      .map((pokemon, partyIndex) => ({ partyIndex, pokemon }))
      .filter((entry): entry is { partyIndex: number; pokemon: BattlePokemonSnapshot } => !!entry.pokemon && entry.pokemon.hp > 0 && entry.pokemon.level < 100)
      .filter(({ partyIndex, pokemon }) =>
        battle.playerParticipantPartyIndexes.includes(partyIndex)
        || getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_EXP_SHARE'
      );

    for (const { partyIndex, pokemon } of rewardRecipients) {
      const growthInfo = getDecompSpeciesInfo(pokemon.species);
      if (!growthInfo) {
        continue;
      }

      let reward = 0;
      if (battle.playerParticipantPartyIndexes.includes(partyIndex)) {
        reward += participantShare;
      }
      if (getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_EXP_SHARE') {
        reward += expShareShare;
      }
      if (reward <= 0) {
        continue;
      }
      gainBattlePokemonEvs(pokemon, faintedMon.species);
      if (getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_LUCKY_EGG') {
        reward = Math.max(1, Math.floor((reward * 150) / 100));
      }
      if (hasBattleTypeFlag(battle, 'trainer')) {
        reward = Math.max(1, Math.floor((reward * 150) / 100));
      }

      const currentTotalExp = getBattlePokemonTotalExperience(pokemon);
      const nextTotalExp = Math.min(
        getExperienceForLevel(growthInfo.growthRate, 100),
        currentTotalExp + reward
      );
      const previousLevel = pokemon.level;
      const previousMaxHp = pokemon.maxHp;

      const nextLevel = getLevelForExperience(growthInfo.growthRate, nextTotalExp);
      pokemon.level = nextLevel;
      const currentLevelExp = getExperienceForLevel(growthInfo.growthRate, pokemon.level);
      const nextLevelExp = pokemon.level >= 100
        ? currentLevelExp
        : getExperienceForLevel(growthInfo.growthRate, pokemon.level + 1);
      pokemon.expProgress = pokemon.level >= 100 || nextLevelExp <= currentLevelExp
        ? 0
        : (nextTotalExp - currentLevelExp) / (nextLevelExp - currentLevelExp);

      if (nextLevel > previousLevel) {
        updateBattlePokemonStatsForLevel(pokemon, previousMaxHp);
        pokemon.friendship = Math.min(255, pokemon.friendship + 3);
        battle.postResult.levelUps.push({
          side: 'player',
          species: pokemon.species,
          level: nextLevel
        });
        for (let learnedLevel = previousLevel + 1; learnedLevel <= nextLevel; learnedLevel += 1) {
          const learnedMoves = getDecompMovesLearnedAtLevel(pokemon.species, learnedLevel);
          for (const learnedMove of learnedMoves) {
            if (battle.postResult.pendingMoveLearns.some((entry) =>
              entry.species === pokemon.species
              && entry.level === learnedLevel
              && entry.moveId === learnedMove.id
            )) {
              continue;
            }

            battle.postResult.pendingMoveLearns.push({
              species: pokemon.species,
              level: learnedLevel,
              moveId: learnedMove.id,
              moveName: learnedMove.displayName
            });
          }
        }
        battle.postResult.pendingMoveLearn = battle.postResult.pendingMoveLearns.length > 0;

        const evolutionTarget = getLevelEvolutionCandidate(pokemon);
        if (
          evolutionTarget
          && !battle.postResult.pendingEvolutions.some((entry) =>
            entry.species === pokemon.species && entry.evolvesTo === evolutionTarget
          )
        ) {
          battle.postResult.pendingEvolutions.push({
            species: pokemon.species,
            evolvesTo: evolutionTarget,
            level: pokemon.level
          });
        }
        battle.postResult.pendingEvolution = battle.postResult.pendingEvolutions.length > 0;
      }

      appendBattleTraceEvent(battle, {
        type: 'reward',
        battler: 'player',
        value: reward,
        text: `${pokemon.species} gained ${reward} EXP`
      });
      messages.push(`${pokemon.species} gained ${reward} EXP. Points!`);
      if (nextLevel > previousLevel) {
        messages.push(`${pokemon.species} grew to LV. ${nextLevel}!`);
        battle.currentScriptLabel = 'BattleScript_LevelUp';
      }
    }

    battle.rewardedOpponentPartyIndexes.push(defeatedPartyIndex);
  }

  battle.rewardsApplied = battle.defeatedOpponentPartyIndexes
    .every((partyIndex) => battle.rewardedOpponentPartyIndexes.includes(partyIndex));
};

const isSwitchPrevented = (pokemon: BattlePokemonSnapshot): boolean =>
  pokemon.volatile.rooted
  || pokemon.volatile.trapTurns > 0
  || pokemon.volatile.escapePreventedBy !== null;

const canAlwaysRunFromBattle = (pokemon: BattlePokemonSnapshot): boolean =>
  getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_CAN_ALWAYS_RUN'
  || pokemon.abilityId === 'RUN_AWAY';

const isRunPrevented = (player: BattlePokemonSnapshot, enemy: BattlePokemonSnapshot): boolean => {
  if (canAlwaysRunFromBattle(player)) {
    return false;
  }
  if (enemy.abilityId === 'SHADOW_TAG') {
    return true;
  }
  if (enemy.abilityId === 'ARENA_TRAP' && player.abilityId !== 'LEVITATE' && !player.types.includes('flying')) {
    return true;
  }
  if (enemy.abilityId === 'MAGNET_PULL' && player.types.includes('steel')) {
    return true;
  }
  return isSwitchPrevented(player);
};

const isSwitchPreventedByOpponent = (player: BattlePokemonSnapshot, enemy: BattlePokemonSnapshot): boolean => {
  if (isSwitchPrevented(player)) {
    return true;
  }
  if (enemy.abilityId === 'SHADOW_TAG') {
    return true;
  }
  if (enemy.abilityId === 'ARENA_TRAP' && player.abilityId !== 'LEVITATE' && !player.types.includes('flying')) {
    return true;
  }
  return enemy.abilityId === 'MAGNET_PULL' && player.types.includes('steel');
};

const applyStatusDamage = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot
): string | null => {
  if (pokemon.hp <= 0) {
    return null;
  }

  if (pokemon.status === 'poison' || pokemon.status === 'badPoison' || pokemon.status === 'burn') {
    if (pokemon.status === 'badPoison') {
      pokemon.volatile.toxicCounter = Math.min(15, pokemon.volatile.toxicCounter + 1);
    }
    const damage = pokemon.status === 'badPoison'
      ? Math.max(1, Math.floor((pokemon.maxHp * pokemon.volatile.toxicCounter) / 16))
      : Math.max(1, Math.floor(pokemon.maxHp / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    applyQueuedDamage(battle, side, pokemon.hp);
    maybeAdjustFriendshipOnFaint(battle, side, pokemon);
    return `${pokemon.species} is hurt by ${pokemon.status === 'burn' ? 'burn' : 'poison'}!`;
  }

  return null;
};

const weatherDamagesPokemon = (weather: BattleWeather, pokemon: BattlePokemonSnapshot): boolean => {
  if (weather === 'sandstorm') {
    return !pokemon.types.some((type) => type === 'rock' || type === 'ground' || type === 'steel');
  }

  if (weather === 'hail') {
    return !pokemon.types.includes('ice');
  }

  return false;
};

const applyWeatherDamage = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (!weatherDamagesPokemon(battle.weather, pokemon) || pokemon.hp <= 0) {
    return;
  }

  const damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
  pokemon.hp = Math.max(0, pokemon.hp - damage);
  applyQueuedDamage(battle, side, pokemon.hp);
  maybeAdjustFriendshipOnFaint(battle, side, pokemon);
  messages.push(`${pokemon.species} is buffeted by ${battle.weather === 'hail' ? 'hail' : 'the sandstorm'}!`);
};

const applyLeechSeedDrain = (
  battle: BattleState,
  seededSide: 'player' | 'opponent',
  seeded: BattlePokemonSnapshot,
  messages: string[]
): void => {
  const receiverSide = seeded.volatile.leechSeededBy;
  if (!receiverSide || seeded.hp <= 0) {
    return;
  }

  const receiver = receiverSide === 'player' ? battle.playerMon : battle.wildMon;
  if (receiver.hp <= 0) {
    return;
  }

  const damage = Math.max(1, Math.floor(seeded.maxHp / 8));
  seeded.hp = Math.max(0, seeded.hp - damage);
  applyQueuedDamage(battle, seededSide, seeded.hp);
  maybeAdjustFriendshipOnFaint(battle, seededSide, seeded);
  const healed = Math.min(receiver.maxHp - receiver.hp, damage);
  if (healed > 0) {
    receiver.hp += healed;
    applyQueuedDamage(battle, receiverSide, receiver.hp);
  }
  messages.push(`${seeded.species}'s health was sapped by Leech Seed!`);
};

const applyTrapDamage = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (pokemon.volatile.trapTurns <= 0 || pokemon.hp <= 0) {
    return;
  }

  pokemon.volatile.trapTurns -= 1;
  if (pokemon.volatile.trapTurns > 0) {
    const damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    applyQueuedDamage(battle, side, pokemon.hp);
    maybeAdjustFriendshipOnFaint(battle, side, pokemon);
    messages.push(`${pokemon.species} is hurt by the trap!`);
    return;
  }

  pokemon.volatile.trappedBy = null;
  messages.push(`${pokemon.species} was freed from the trap!`);
};

const applyNightmareDamage = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (!pokemon.volatile.nightmare || pokemon.hp <= 0) {
    return;
  }

  if (pokemon.status !== 'sleep') {
    pokemon.volatile.nightmare = false;
    return;
  }

  const damage = Math.max(1, Math.floor(pokemon.maxHp / 4));
  pokemon.hp = Math.max(0, pokemon.hp - damage);
  applyQueuedDamage(battle, side, pokemon.hp);
  maybeAdjustFriendshipOnFaint(battle, side, pokemon);
  messages.push(`${pokemon.species} is locked in a nightmare!`);
};

const applyCurseDamage = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (!pokemon.volatile.cursed || pokemon.hp <= 0) {
    return;
  }

  const damage = Math.max(1, Math.floor(pokemon.maxHp / 4));
  pokemon.hp = Math.max(0, pokemon.hp - damage);
  applyQueuedDamage(battle, side, pokemon.hp);
  maybeAdjustFriendshipOnFaint(battle, side, pokemon);
  messages.push(`${pokemon.species} is afflicted by the curse!`);
};

const applyIngrainHealing = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (!pokemon.volatile.rooted || pokemon.hp <= 0 || pokemon.hp >= pokemon.maxHp) {
    return;
  }

  healBattler(battle, side, pokemon, Math.max(1, Math.floor(pokemon.maxHp / 16)), messages);
};

const applyLeftoversHealing = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (getHeldItemHoldEffect(pokemon) !== 'HOLD_EFFECT_LEFTOVERS' || pokemon.hp <= 0 || pokemon.hp >= pokemon.maxHp) {
    return;
  }

  healBattler(battle, side, pokemon, Math.max(1, Math.floor(pokemon.maxHp / 16)), messages);
  messages.push(`${pokemon.species} restored HP using its Leftovers!`);
};

const applyRainDishHealing = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (battle.weather !== 'rain' || pokemon.abilityId !== 'RAIN_DISH' || pokemon.hp <= 0 || pokemon.hp >= pokemon.maxHp) {
    return;
  }

  healBattler(battle, side, pokemon, Math.max(1, Math.floor(pokemon.maxHp / 16)), messages);
};

const applySpikesSwitchIn = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  const layers = battle.sideState[side].spikesLayers;
  if (layers <= 0 || pokemon.hp <= 0 || pokemon.types.includes('flying')) {
    return;
  }

  const divisor = layers === 1 ? 8 : layers === 2 ? 6 : 4;
  pokemon.hp = Math.max(0, pokemon.hp - Math.max(1, Math.floor(pokemon.maxHp / divisor)));
  applyQueuedDamage(battle, side, pokemon.hp);
  maybeAdjustFriendshipOnFaint(battle, side, pokemon);
  messages.push(`${pokemon.species} is hurt by Spikes!`);
};

const decrementYawn = (
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (pokemon.volatile.yawnTurns <= 0 || pokemon.hp <= 0) {
    return;
  }

  pokemon.volatile.yawnTurns -= 1;
  if (pokemon.volatile.yawnTurns === 0 && pokemon.status === 'none') {
    pokemon.status = 'sleep';
    pokemon.statusTurns = 3;
    messages.push(`${pokemon.species} fell asleep!`);
  }
};

const decrementTaunt = (pokemon: BattlePokemonSnapshot): void => {
  if (pokemon.volatile.tauntTurns > 0 && pokemon.hp > 0) {
    pokemon.volatile.tauntTurns -= 1;
  }
};

const decrementDisableAndEncore = (pokemon: BattlePokemonSnapshot): void => {
  if (pokemon.hp <= 0) {
    return;
  }

  if (pokemon.volatile.chargeTurns > 0) {
    pokemon.volatile.chargeTurns -= 1;
  }

  if (pokemon.volatile.disableTurns > 0) {
    pokemon.volatile.disableTurns -= 1;
    if (pokemon.volatile.disableTurns === 0) {
      pokemon.volatile.disabledMoveId = null;
    }
  }

  if (pokemon.volatile.encoreTurns > 0) {
    pokemon.volatile.encoreTurns -= 1;
    const encoredMove = pokemon.moves.find((move) => move.id === pokemon.volatile.encoreMoveId);
    if (pokemon.volatile.encoreTurns === 0 || !encoredMove || encoredMove.ppRemaining <= 0) {
      pokemon.volatile.encoreMoveId = null;
      pokemon.volatile.encoreTurns = 0;
    }
  }

  if (pokemon.volatile.lockOnTurns > 0) {
    pokemon.volatile.lockOnTurns -= 1;
    if (pokemon.volatile.lockOnTurns === 0) {
      pokemon.volatile.lockOnBy = null;
    }
  }
};

const incrementActiveTurns = (battle: BattleState): void => {
  for (const battlerId of getActiveBattlerIds(battle)) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (pokemon && pokemon.hp > 0) {
      pokemon.volatile.activeTurns += 1;
    }
  }
};

const decrementPerishSong = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (pokemon.volatile.perishTurns <= 0 || pokemon.hp <= 0) {
    return;
  }

  pokemon.volatile.perishTurns -= 1;
  messages.push(`${pokemon.species}'s perish count fell to ${pokemon.volatile.perishTurns}!`);
  if (pokemon.volatile.perishTurns === 0) {
    pokemon.hp = 0;
    applyQueuedDamage(battle, side, 0);
    maybeAdjustFriendshipOnFaint(battle, side, pokemon);
  }
};

const resolveWish = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  const sideState = battle.sideState[side];
  if (sideState.wishTurns <= 0 || pokemon.hp <= 0) {
    return;
  }

  sideState.wishTurns -= 1;
  if (sideState.wishTurns === 0) {
    healBattler(battle, side, pokemon, sideState.wishHp, messages);
    sideState.wishHp = 0;
  }
};

const decrementSideConditions = (battle: BattleState, messages: string[]): void => {
  for (const side of ['player', 'opponent'] as const) {
    const sideState = battle.sideState[side];
    const sideLabel = side === 'player' ? 'Your team' : "Foe's team";

    if (sideState.reflectTurns > 0) {
      sideState.reflectTurns -= 1;
      if (sideState.reflectTurns === 0) {
        messages.push(`${sideLabel}'s Reflect wore off!`);
      }
    }

    if (sideState.lightScreenTurns > 0) {
      sideState.lightScreenTurns -= 1;
      if (sideState.lightScreenTurns === 0) {
        messages.push(`${sideLabel}'s Light Screen wore off!`);
      }
    }

    if (sideState.safeguardTurns > 0) {
      sideState.safeguardTurns -= 1;
      if (sideState.safeguardTurns === 0) {
        messages.push(`${sideLabel} is no longer protected by Safeguard!`);
      }
    }

    if (sideState.mistTurns > 0) {
      sideState.mistTurns -= 1;
      if (sideState.mistTurns === 0) {
        messages.push(`${sideLabel}'s Mist faded!`);
      }
    }
  }
};

const resolveWeatherEndOfTurn = (battle: BattleState, messages: string[]): void => {
  if (battle.weather === 'none') {
    return;
  }

  const activeWeather = battle.weather;
  if (activeWeather === 'sandstorm' || activeWeather === 'hail') {
    messages.push(weatherContinueMessages[activeWeather]);
    for (const battlerId of getActiveBattlerIds(battle)) {
      const pokemon = getBattlerSnapshot(battle, battlerId);
      if (!pokemon) {
        continue;
      }
      applyWeatherDamage(battle, getBattlerSide(battlerId), pokemon, messages);
    }
  } else {
    messages.push(weatherContinueMessages[activeWeather]);
  }

  if (battle.weatherTurns > 0) {
    battle.weatherTurns -= 1;
    if (battle.weatherTurns === 0) {
      messages.push(weatherEndMessages[activeWeather]);
      battle.weather = 'none';
    }
  }
};

const clearSingleTurnVolatiles = (battle: BattleState): void => {
  for (const battlerId of getActiveBattlerIds(battle)) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (!pokemon) {
      continue;
    }
    pokemon.volatile.protected = false;
    pokemon.volatile.enduring = false;
    pokemon.volatile.destinyBond = false;
    pokemon.volatile.grudge = false;
    pokemon.volatile.tookDamageThisTurn = false;
    pokemon.volatile.magicCoat = false;
    pokemon.volatile.snatch = false;
    pokemon.volatile.followMe = false;
    pokemon.volatile.helpingHand = false;
  }
};

const getStatusCaptureMultiplierTenths = (status: StatusCondition): number => {
  if (status === 'sleep' || status === 'freeze') {
    return 20;
  }
  if (status !== 'none') {
    return 15;
  }
  return 10;
};

const getInitialSafariCatchFactor = (pokemon: BattlePokemonSnapshot): number =>
  Math.floor((pokemon.catchRate * 100) / 1275);

const getInitialSafariEscapeFactor = (pokemon: BattlePokemonSnapshot): number => {
  const speciesInfo = getDecompSpeciesInfo(pokemon.species);
  const factor = Math.floor(((speciesInfo?.safariZoneFleeRate ?? 0) * 100) / 1275);
  return factor <= 1 ? 2 : factor;
};

const lowerOrRaiseText = (delta: number): string => {
  if (delta >= 2) {
    return 'rose sharply!';
  }
  if (delta === 1) {
    return 'rose!';
  }
  if (delta <= -2) {
    return 'harshly fell!';
  }
  return 'fell!';
};

const formatStatLabel = (stat: keyof BattleStatStages): string => {
  switch (stat) {
    case 'spAttack':
      return 'SP. ATK';
    case 'spDefense':
      return 'SP. DEF';
    default:
      return stat.toUpperCase();
  }
};

const pushMessage = (messages: string[], battle: BattleState, text: string): void => {
  messages.push(text);
  emitControllerCommand(battle, { type: 'message', text });
};

const getStatusAppliedMessage = (pokemon: BattlePokemonSnapshot, status: StatusCondition): string | null => {
  switch (status) {
    case 'poison':
      return `${pokemon.species} was poisoned!`;
    case 'badPoison':
      return `${pokemon.species} was badly poisoned!`;
    case 'burn':
      return `${pokemon.species} was burned!`;
    case 'paralysis':
      return `${pokemon.species} is paralyzed! It may be unable to move!`;
    case 'sleep':
      return `${pokemon.species} fell asleep!`;
    case 'freeze':
      return `${pokemon.species} was frozen solid!`;
    default:
      return null;
  }
};

const isStatusTypeBlocked = (
  status: StatusCondition,
  target: BattlePokemonSnapshot,
  move?: BattleMove
): boolean => {
  if (status === 'poison' || status === 'badPoison') {
    return target.types.includes('poison') || target.types.includes('steel') || target.abilityId === 'IMMUNITY';
  }
  if (status === 'burn') {
    return target.types.includes('fire') || target.abilityId === 'WATER_VEIL';
  }
  if (status === 'freeze') {
    return target.types.includes('ice') || target.abilityId === 'MAGMA_ARMOR';
  }
  if (status === 'sleep') {
    return target.abilityId === 'INSOMNIA' || target.abilityId === 'VITAL_SPIRIT';
  }
  if (status === 'paralysis' && target.abilityId === 'LIMBER') {
    return true;
  }
  return status === 'paralysis' && move?.type === 'electric' && calculateTypeEffectiveness(move.type, target.types) === 0;
};

const applyStatusEffect = (
  target: BattlePokemonSnapshot,
  status: StatusCondition,
  messages: string[],
  move?: BattleMove,
  blockedMessage = 'But it failed!',
  encounterState?: BattleEncounterState,
  battle?: BattleState,
  targetSide?: 'player' | 'opponent'
): boolean => {
  if (target.status !== 'none') {
    messages.push(blockedMessage);
    return false;
  }

  if (battle && targetSide && battle.sideState[targetSide].safeguardTurns > 0) {
    messages.push(`${target.species}'s team is protected by Safeguard!`);
    return false;
  }

  if (isStatusTypeBlocked(status, target, move)) {
    messages.push(`It doesn't affect ${target.species}...`);
    return false;
  }

  target.status = status;
  target.volatile.toxicCounter = 0;
  target.statusTurns = status === 'sleep'
    ? 2 + (encounterState ? (nextBattleRng(encounterState) & 3) : 0)
    : 0;
  const appliedMessage = getStatusAppliedMessage(target, status);
  if (appliedMessage) {
    messages.push(appliedMessage);
  }
  maybeUseStatusBerry(target, messages);
  return true;
};

const applyStageEffect = (
  effect: string,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  messages: string[],
  battle?: BattleState,
  attackerSide?: 'player' | 'opponent',
  defenderSide?: 'player' | 'opponent'
): boolean => {
  const stageEffect = stageEffectTable[effect];
  if (!stageEffect) {
    return false;
  }

  const recipient = stageEffect.target === 'self' ? attacker : defender;
  const recipientSide = stageEffect.target === 'self' ? attackerSide : defenderSide;
  if (battle && recipientSide && stageEffect.delta < 0 && battle.sideState[recipientSide].mistTurns > 0) {
    messages.push(`${recipient.species} is protected by Mist!`);
    return true;
  }

  const previous = recipient.statStages[stageEffect.stat];
  const next = Math.max(-6, Math.min(6, previous + stageEffect.delta));
  if (next === previous) {
    messages.push(`${recipient.species}'s ${formatStatLabel(stageEffect.stat)} won't go ${stageEffect.delta > 0 ? 'higher' : 'lower'}!`);
    return true;
  }

  recipient.statStages[stageEffect.stat] = next;
  messages.push(`${recipient.species}'s ${formatStatLabel(stageEffect.stat)} ${lowerOrRaiseText(stageEffect.delta)}`);
  return true;
};

const applyDirectStageChange = (
  pokemon: BattlePokemonSnapshot,
  stat: keyof BattleStatStages,
  delta: number,
  messages: string[]
): void => {
  const previous = pokemon.statStages[stat];
  const next = Math.max(-6, Math.min(6, previous + delta));
  if (next === previous) {
    messages.push(`${pokemon.species}'s ${formatStatLabel(stat)} won't go ${delta > 0 ? 'higher' : 'lower'}!`);
    return;
  }

  pokemon.statStages[stat] = next;
  messages.push(`${pokemon.species}'s ${formatStatLabel(stat)} ${lowerOrRaiseText(delta)}`);
};

const maybeApplySecondaryStatus = (
  move: BattleMove,
  target: BattlePokemonSnapshot,
  targetSide: 'player' | 'opponent',
  battle: BattleState,
  encounterState: BattleEncounterState,
  messages: string[]
): void => {
  if (target.status !== 'none' || move.secondaryEffectChance <= 0) {
    return;
  }

  if (target.abilityId === 'SHIELD_DUST') {
    return;
  }

  if ((nextBattleRng(encounterState) % 100) >= move.secondaryEffectChance) {
    return;
  }

  if (move.effect === 'EFFECT_TRI_ATTACK') {
    const triAttackStatuses: StatusCondition[] = ['burn', 'freeze', 'paralysis'];
    const triAttackStatus = triAttackStatuses[nextBattleRng(encounterState) % triAttackStatuses.length] ?? 'burn';
    applyStatusEffect(target, triAttackStatus, messages, move, '', encounterState, battle, targetSide);
    return;
  }

  const nextStatus = secondaryStatusByEffect[move.effect];
  if (!nextStatus) {
    return;
  }

  applyStatusEffect(target, nextStatus, messages, move, '', encounterState, battle, targetSide);
};

const maybeApplySecondaryStageEffect = (
  move: BattleMove,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  battle: BattleState,
  encounterState: BattleEncounterState,
  messages: string[]
): void => {
  if (move.secondaryEffectChance <= 0) {
    return;
  }

  if (defender.abilityId === 'SHIELD_DUST') {
    return;
  }

  if ((nextBattleRng(encounterState) % 100) >= move.secondaryEffectChance) {
    return;
  }

  if (move.effect === 'EFFECT_ALL_STATS_UP_HIT') {
    for (const stat of ['attack', 'defense', 'speed', 'spAttack', 'spDefense'] as Array<keyof BattleStatStages>) {
      applyStageEffect(
        `EFFECT_${stat === 'spAttack' ? 'SPECIAL_ATTACK' : stat === 'spDefense' ? 'SPECIAL_DEFENSE' : stat.toUpperCase()}_UP`,
        attacker,
        defender,
        messages,
        battle,
        attackerSide,
        defenderSide
      );
    }
    return;
  }

  const stageEffect = secondaryStageEffectByEffect[move.effect];
  if (!stageEffect) {
    return;
  }

  const effect = `EFFECT_${stageEffect.stat === 'spAttack' ? 'SPECIAL_ATTACK' : stageEffect.stat === 'spDefense' ? 'SPECIAL_DEFENSE' : stageEffect.stat.toUpperCase()}_${stageEffect.delta > 0 ? 'UP' : 'DOWN'}`;
  applyStageEffect(effect, attacker, defender, messages, battle, attackerSide, defenderSide);
};

const applyQueuedDamage = (
  battle: BattleState,
  battler: 'player' | 'opponent',
  nextHp: number
): void => {
  emitControllerCommand(battle, { type: 'hp', battler, value: nextHp });
};

const healBattler = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  amount: number,
  messages: string[]
): boolean => {
  if (pokemon.hp >= pokemon.maxHp) {
    messages.push(`${pokemon.species}'s HP is full!`);
    return false;
  }

  pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + Math.max(1, amount));
  applyQueuedDamage(battle, side, pokemon.hp);
  messages.push(`${pokemon.species} regained health!`);
  return true;
};

const maybeUseHealingBerry = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (pokemon.hp <= 0 || pokemon.hp > Math.floor(pokemon.maxHp / 2)) {
    return;
  }

  if (getHeldItemHoldEffect(pokemon) === 'HOLD_EFFECT_RESTORE_HP') {
    const item = consumeHeldItem(pokemon);
    healBattler(battle, side, pokemon, getItemDefinition(item ?? '').holdEffectParam, messages);
    messages.push(`${pokemon.species} used its ${item}!`);
  }
};

const maybeUseStatusBerry = (
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  const holdEffect = getHeldItemHoldEffect(pokemon);
  const curesStatus =
    holdEffect === 'HOLD_EFFECT_CURE_STATUS'
    || (holdEffect === 'HOLD_EFFECT_CURE_PAR' && pokemon.status === 'paralysis')
    || (holdEffect === 'HOLD_EFFECT_CURE_SLP' && pokemon.status === 'sleep')
    || (holdEffect === 'HOLD_EFFECT_CURE_PSN' && (pokemon.status === 'poison' || pokemon.status === 'badPoison'))
    || (holdEffect === 'HOLD_EFFECT_CURE_BRN' && pokemon.status === 'burn')
    || (holdEffect === 'HOLD_EFFECT_CURE_FRZ' && pokemon.status === 'freeze');

  if (!curesStatus) {
    return;
  }

  const item = consumeHeldItem(pokemon);
  pokemon.status = 'none';
  pokemon.statusTurns = 0;
  pokemon.volatile.toxicCounter = 0;
  messages.push(`${pokemon.species} cured its status with ${item}!`);
};

const maybeUseConfusionBerry = (
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  const holdEffect = getHeldItemHoldEffect(pokemon);
  if (pokemon.volatile.confusionTurns <= 0 || (holdEffect !== 'HOLD_EFFECT_CURE_CONFUSION' && holdEffect !== 'HOLD_EFFECT_CURE_STATUS')) {
    return;
  }

  const item = consumeHeldItem(pokemon);
  pokemon.volatile.confusionTurns = 0;
  messages.push(`${pokemon.species} snapped out of confusion with ${item}!`);
};

const maybeUseWhiteHerb = (
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): void => {
  if (getHeldItemHoldEffect(pokemon) !== 'HOLD_EFFECT_RESTORE_STATS') {
    return;
  }

  let restored = false;
  for (const stat of Object.keys(pokemon.statStages) as Array<keyof BattleStatStages>) {
    if (pokemon.statStages[stat] < 0) {
      pokemon.statStages[stat] = 0;
      restored = true;
    }
  }

  if (restored) {
    const item = consumeHeldItem(pokemon);
    messages.push(`${pokemon.species} restored its lowered stats with ${item}!`);
  }
};

const pinchStatBerryByHoldEffect: Partial<Record<string, keyof BattleStatStages>> = {
  HOLD_EFFECT_ATTACK_UP: 'attack',
  HOLD_EFFECT_DEFENSE_UP: 'defense',
  HOLD_EFFECT_SPEED_UP: 'speed',
  HOLD_EFFECT_SP_ATTACK_UP: 'spAttack',
  HOLD_EFFECT_SP_DEFENSE_UP: 'spDefense'
};

const maybeUsePinchStatBerry = (
  pokemon: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[]
): void => {
  if (pokemon.hp <= 0 || !pokemon.heldItemId) {
    return;
  }

  const holdEffect = getHeldItemHoldEffect(pokemon);
  const thresholdDivisor = getHeldItemHoldEffectParam(pokemon);
  if (thresholdDivisor <= 0 || pokemon.hp > Math.floor(pokemon.maxHp / thresholdDivisor)) {
    return;
  }

  const stat = pinchStatBerryByHoldEffect[holdEffect];
  if (stat) {
    if (pokemon.statStages[stat] >= 6) {
      return;
    }

    const item = consumeHeldItem(pokemon);
    applyDirectStageChange(pokemon, stat, 1, messages);
    messages.push(`${pokemon.species} used its ${item}!`);
    return;
  }

  if (holdEffect === 'HOLD_EFFECT_CRITICAL_UP') {
    if (pokemon.volatile.focusEnergy) {
      return;
    }

    const item = consumeHeldItem(pokemon);
    pokemon.volatile.focusEnergy = true;
    messages.push(`${pokemon.species} used its ${item} to focus!`);
    return;
  }

  if (holdEffect === 'HOLD_EFFECT_RANDOM_STAT_UP') {
    const boostableStats: Array<keyof BattleStatStages> = ['attack', 'defense', 'speed', 'spAttack', 'spDefense'];
    const candidates = boostableStats.filter((candidate) => pokemon.statStages[candidate] < 6);
    if (candidates.length === 0) {
      return;
    }

    const item = consumeHeldItem(pokemon);
    const chosenStat = candidates[nextBattleRng(encounterState) % candidates.length] ?? candidates[0]!;
    applyDirectStageChange(pokemon, chosenStat, 2, messages);
    messages.push(`${pokemon.species} used its ${item}!`);
  }
};

const applyConfusion = (
  target: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[]
): boolean => {
  if (target.abilityId === 'OWN_TEMPO') {
    messages.push(`${target.species}'s Own Tempo prevented confusion!`);
    return false;
  }

  if (target.volatile.confusionTurns > 0) {
    messages.push(`${target.species} is already confused!`);
    return false;
  }

  target.volatile.confusionTurns = 2 + (nextBattleRng(encounterState) % 4);
  messages.push(`${target.species} became confused!`);
  maybeUseConfusionBerry(target, messages);
  return true;
};

const maybeApplySecondaryConfusion = (
  move: BattleMove,
  target: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[]
): void => {
  if (move.effect !== 'EFFECT_CONFUSE_HIT' || move.secondaryEffectChance <= 0 || target.volatile.confusionTurns > 0) {
    return;
  }

  if (target.abilityId === 'SHIELD_DUST') {
    return;
  }

  if ((nextBattleRng(encounterState) % 100) >= move.secondaryEffectChance) {
    return;
  }

  applyConfusion(target, encounterState, messages);
};

const maybeApplyFlinch = (
  move: BattleMove,
  target: BattlePokemonSnapshot,
  targetCanStillAct: boolean,
  encounterState: BattleEncounterState
): void => {
  if (!targetCanStillAct || target.abilityId === 'INNER_FOCUS') {
    return;
  }

  if (target.abilityId === 'SHIELD_DUST') {
    return;
  }

  if (
    move.effect !== 'EFFECT_FLINCH_HIT'
    && move.effect !== 'EFFECT_FLINCH_MINIMIZE_HIT'
    && move.effect !== 'EFFECT_SNORE'
    && move.effect !== 'EFFECT_FAKE_OUT'
    && move.effect !== 'EFFECT_TWISTER'
    && move.effect !== 'EFFECT_SKY_ATTACK'
  ) {
    return;
  }

  if (move.secondaryEffectChance > 0 && (nextBattleRng(encounterState) % 100) >= move.secondaryEffectChance) {
    return;
  }

  target.volatile.flinched = true;
};

const maybeApplyKingsRock = (
  attacker: BattlePokemonSnapshot,
  target: BattlePokemonSnapshot,
  move: BattleMove,
  damage: number,
  targetCanStillAct: boolean,
  encounterState: BattleEncounterState
): void => {
  if (
    damage <= 0
    || !targetCanStillAct
    || target.hp <= 0
    || target.volatile.flinched
    || target.abilityId === 'INNER_FOCUS'
    || getHeldItemHoldEffect(attacker) !== 'HOLD_EFFECT_FLINCH'
    || !move.flags.includes('FLAG_KINGS_ROCK_AFFECTED')
  ) {
    return;
  }

  if ((nextBattleRng(encounterState) % 100) < getHeldItemHoldEffectParam(attacker)) {
    target.volatile.flinched = true;
  }
};

const maybeApplyShellBell = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  damage: number,
  messages: string[]
): void => {
  if (
    damage <= 0
    || attacker.hp <= 0
    || attacker.hp >= attacker.maxHp
    || getHeldItemHoldEffect(attacker) !== 'HOLD_EFFECT_SHELL_BELL'
  ) {
    return;
  }

  healBattler(battle, attackerSide, attacker, Math.max(1, Math.floor(damage / Math.max(1, getHeldItemHoldEffectParam(attacker)))), messages);
  messages.push(`${attacker.species}'s Shell Bell restored HP!`);
};

const applySideCondition = (
  battle: BattleState,
  side: 'player' | 'opponent',
  move: BattleMove,
  messages: string[]
): boolean => {
  if (move.effect === 'EFFECT_REFLECT') {
    runBattleScriptCommand(battle, 'setreflect', {
      attackerSide: side,
      move,
      pushMessage: (text) => messages.push(text)
    });
    return true;
  }

  if (move.effect === 'EFFECT_LIGHT_SCREEN') {
    runBattleScriptCommand(battle, 'setlightscreen', {
      attackerSide: side,
      move,
      pushMessage: (text) => messages.push(text)
    });
    return true;
  }

  if (move.effect === 'EFFECT_SAFEGUARD') {
    runBattleScriptCommand(battle, 'setsafeguard', {
      attackerSide: side,
      move,
      pushMessage: (text) => messages.push(text)
    });
    return true;
  }

  if (move.effect === 'EFFECT_MIST') {
    runBattleScriptCommand(battle, 'setmist', {
      attackerSide: side,
      move,
      pushMessage: (text) => messages.push(text)
    });
    return true;
  }

  return false;
};

const applyWeatherMove = (
  battle: BattleState,
  move: BattleMove,
  messages: string[]
): boolean => {
  const nextWeather = weatherByEffect[move.effect] as Exclude<BattleWeather, 'none'> | undefined;
  if (!nextWeather) {
    return false;
  }

  const opcodeByWeather: Record<Exclude<BattleWeather, 'none'>, 'setrain' | 'setsunny' | 'setsandstorm' | 'sethail'> = {
    rain: 'setrain',
    sun: 'setsunny',
    sandstorm: 'setsandstorm',
    hail: 'sethail'
  };
  runBattleScriptCommand(battle, opcodeByWeather[nextWeather], {
    move,
    pushMessage: (text) => messages.push(text)
  });
  return true;
};

const tryUseProtect = (
  attacker: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[],
  canBlockThisTurn = true,
  successMessage = `${attacker.species} protected itself!`
): boolean => {
  if (!['PROTECT', 'DETECT', 'ENDURE'].includes(attacker.volatile.lastSuccessfulMoveId ?? '')) {
    attacker.volatile.protectUses = 0;
  }

  if (!canBlockThisTurn) {
    attacker.volatile.protectUses = 0;
    messages.push('But it failed!');
    return false;
  }

  const successThresholds = [0xffff, 0x7fff, 0x3fff, 0x1fff];
  const protectIndex = Math.min(attacker.volatile.protectUses, successThresholds.length - 1);
  const roll = nextBattleRng(encounterState) & 0xffff;
  if (roll <= successThresholds[protectIndex]) {
    attacker.volatile.protected = true;
    attacker.volatile.protectUses += 1;
    messages.push(successMessage);
    return true;
  }

  attacker.volatile.protectUses = 0;
  messages.push('But it failed!');
  return false;
};

const isMoveBlockedByProtect = (move: BattleMove, defender: BattlePokemonSnapshot): boolean =>
  defender.volatile.protected
  && move.target !== 'MOVE_TARGET_USER'
  && move.effect !== 'EFFECT_PROTECT'
  && (move.flags.length === 0 || move.flags.includes('FLAG_PROTECT_AFFECTED'));

const isMoveBlockedBySubstitute = (move: BattleMove, defender: BattlePokemonSnapshot): boolean =>
  defender.volatile.substituteHp > 0
  && move.target !== 'MOVE_TARGET_USER'
  && move.effect !== 'EFFECT_MEMENTO'
  && move.effect !== 'EFFECT_TRANSFORM'
  && move.effect !== 'EFFECT_HIT'
  && move.power === 0;

const getMagnitudePower = (encounterState: BattleEncounterState): { magnitude: number; power: number } => {
  const roll = nextBattleRng(encounterState) % 100;
  if (roll < 5) {
    return { magnitude: 4, power: 10 };
  }
  if (roll < 15) {
    return { magnitude: 5, power: 30 };
  }
  if (roll < 35) {
    return { magnitude: 6, power: 50 };
  }
  if (roll < 65) {
    return { magnitude: 7, power: 70 };
  }
  if (roll < 85) {
    return { magnitude: 8, power: 90 };
  }
  if (roll < 95) {
    return { magnitude: 9, power: 110 };
  }
  return { magnitude: 10, power: 150 };
};

const getMoveWithDynamicPower = (
  move: BattleMove,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  battle: BattleState,
  encounterState: BattleEncounterState,
  messages: string[]
): BattleMove => {
  if (move.effect === 'EFFECT_HIDDEN_POWER') {
    return getHiddenPowerMove(move, attacker);
  }

  if (move.effect === 'EFFECT_FACADE' && ['poison', 'badPoison', 'burn', 'paralysis'].includes(attacker.status)) {
    return { ...move, power: move.power * 2 };
  }

  if (move.effect === 'EFFECT_ERUPTION') {
    return { ...move, power: Math.max(1, Math.floor((move.power * attacker.hp) / Math.max(1, attacker.maxHp))) };
  }

  if (move.effect === 'EFFECT_FLAIL') {
    const hpFraction = Math.floor((attacker.hp * 48) / Math.max(1, attacker.maxHp));
    if (hpFraction <= 1) {
      return { ...move, power: 200 };
    }
    if (hpFraction <= 4) {
      return { ...move, power: 150 };
    }
    if (hpFraction <= 9) {
      return { ...move, power: 100 };
    }
    if (hpFraction <= 16) {
      return { ...move, power: 80 };
    }
    if (hpFraction <= 32) {
      return { ...move, power: 40 };
    }
    return { ...move, power: 20 };
  }

  if (move.effect === 'EFFECT_LOW_KICK') {
    const weightHg = getDecompPokedexEntry(defender.species)?.weightHg ?? 0;
    if (weightHg < 100) {
      return { ...move, power: 20 };
    }
    if (weightHg < 250) {
      return { ...move, power: 40 };
    }
    if (weightHg < 500) {
      return { ...move, power: 60 };
    }
    if (weightHg < 1000) {
      return { ...move, power: 80 };
    }
    if (weightHg < 2000) {
      return { ...move, power: 100 };
    }
    return { ...move, power: 120 };
  }

  if (move.effect === 'EFFECT_RETURN') {
    return { ...move, power: Math.max(1, Math.floor((Math.min(255, attacker.friendship) * 10) / 25)) };
  }

  if (move.effect === 'EFFECT_FRUSTRATION') {
    return { ...move, power: Math.max(1, Math.floor(((255 - Math.min(255, attacker.friendship)) * 10) / 25)) };
  }

  if (move.effect === 'EFFECT_MAGNITUDE') {
    const magnitude = getMagnitudePower(encounterState);
    messages.push(`Magnitude ${magnitude.magnitude}!`);
    return { ...move, power: magnitude.power };
  }

  if (move.effect === 'EFFECT_WEATHER_BALL' && battle.weather !== 'none') {
    const weatherType: Record<Exclude<BattleWeather, 'none'>, PokemonType> = {
      rain: 'water',
      sun: 'fire',
      sandstorm: 'rock',
      hail: 'ice'
    };
    return { ...move, type: weatherType[battle.weather], power: move.power * 2 };
  }

  if (move.effect === 'EFFECT_REVENGE' && attacker.volatile.tookDamageThisTurn) {
    return { ...move, power: move.power * 2 };
  }

  if (move.effect === 'EFFECT_SMELLINGSALT' && defender.status === 'paralysis') {
    return { ...move, power: move.power * 2 };
  }

  if (move.effect === 'EFFECT_FLINCH_MINIMIZE_HIT' && defender.volatile.minimized) {
    return { ...move, power: move.power * 2 };
  }

  if (
    defender.volatile.semiInvulnerable === 'air'
    && (move.effect === 'EFFECT_GUST' || move.effect === 'EFFECT_TWISTER')
  ) {
    return { ...move, power: move.power * 2 };
  }

  if (
    defender.volatile.semiInvulnerable === 'underground'
    && (move.effect === 'EFFECT_EARTHQUAKE' || move.effect === 'EFFECT_MAGNITUDE')
  ) {
    return { ...move, power: move.power * 2 };
  }

  if (
    defender.volatile.semiInvulnerable === 'underwater'
    && (move.id === 'SURF' || move.id === 'WHIRLPOOL')
  ) {
    return { ...move, power: move.power * 2 };
  }

  if (move.effect === 'EFFECT_SPIT_UP' && attacker.volatile.stockpile > 0) {
    return { ...move, power: move.power * attacker.volatile.stockpile };
  }

  if (move.effect === 'EFFECT_FURY_CUTTER') {
    return { ...move, power: move.power * (2 ** attacker.volatile.furyCutterCounter) };
  }

  if (move.effect === 'EFFECT_ROLLOUT') {
    const defenseCurlMultiplier = attacker.volatile.defenseCurl ? 2 : 1;
    return { ...move, power: move.power * (2 ** attacker.volatile.rolloutCounter) * defenseCurlMultiplier };
  }

  return move;
};

const damageBattler = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  damage: number,
  move: BattleMove,
  messages: string[]
): number => {
  const boundedDamage = move.effect === 'EFFECT_FALSE_SWIPE' && pokemon.hp > 1
    ? Math.min(damage, pokemon.hp - 1)
    : damage;

  if (pokemon.volatile.substituteHp > 0 && move.id !== 'STRUGGLE') {
    const substituteDamage = Math.min(pokemon.volatile.substituteHp, boundedDamage);
    pokemon.volatile.substituteHp -= substituteDamage;
    messages.push(`${pokemon.species}'s substitute took the damage!`);
    if (pokemon.volatile.substituteHp === 0) {
      messages.push(`${pokemon.species}'s substitute faded!`);
    }
    return substituteDamage;
  }

  const previousHp = pokemon.hp;
  pokemon.hp = Math.max(0, pokemon.hp - boundedDamage);
  if (pokemon.volatile.enduring && pokemon.hp === 0 && boundedDamage > 0) {
    pokemon.hp = 1;
    messages.push(`${pokemon.species} endured the hit!`);
  }
  applyQueuedDamage(battle, side, pokemon.hp);
  const actualDamage = Math.max(0, previousHp - pokemon.hp);
  if (actualDamage > 0) {
    pokemon.volatile.tookDamageThisTurn = true;
    pokemon.volatile.lastDamageTaken = actualDamage;
    pokemon.volatile.lastDamageCategory = specialTypes.has(move.type) ? 'special' : 'physical';
    pokemon.volatile.lastDamagedBy = side === 'player' ? 'opponent' : 'player';
    pokemon.volatile.lastReceivedMoveType = move.type;
    if (pokemon.volatile.bideTurns > 0) {
      pokemon.volatile.bideDamage += actualDamage;
      pokemon.volatile.bideTarget = side === 'player' ? 'opponent' : 'player';
    }
    if (pokemon.volatile.rage) {
      applyDirectStageChange(pokemon, 'attack', 1, messages);
    }
    maybeUseHealingBerry(battle, side, pokemon, messages);
  }
  maybeAdjustFriendshipOnFaint(battle, side, pokemon);
  return actualDamage;
};

const isItemInteractionBlocked = (pokemon: BattlePokemonSnapshot, messages: string[]): boolean => {
  if (pokemon.abilityId !== 'STICKY_HOLD') {
    return false;
  }

  messages.push(`${pokemon.species}'s Sticky Hold made it ineffective!`);
  return true;
};

const applyPostHitItemEffect = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): void => {
  if (move.effect === 'EFFECT_THIEF') {
    if (attacker.heldItemId || !defender.heldItemId || defender.knockedOff || isItemInteractionBlocked(defender, messages)) {
      return;
    }

    attacker.heldItemId = defender.heldItemId;
    defender.heldItemId = null;
    messages.push(`${attacker.species} stole ${defender.species}'s item!`);
    return;
  }

  if (move.effect === 'EFFECT_KNOCK_OFF') {
    if (!defender.heldItemId || isItemInteractionBlocked(defender, messages)) {
      return;
    }

    const knockedItem = defender.heldItemId;
    defender.heldItemId = null;
    defender.recycledItemId = null;
    defender.knockedOff = true;
    messages.push(`${defender.species}'s ${knockedItem} was knocked off!`);
  }
};

const useTrick = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  if ((!attacker.heldItemId && !defender.heldItemId) || attacker.knockedOff || defender.knockedOff || isItemInteractionBlocked(defender, messages)) {
    messages.push('But it failed!');
    return true;
  }

  const attackerItem = attacker.heldItemId;
  attacker.heldItemId = defender.heldItemId;
  defender.heldItemId = attackerItem;
  messages.push(`${attacker.species} switched items with its target!`);
  return true;
};

const useRecycle = (
  attacker: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  if (attacker.heldItemId || !attacker.recycledItemId || attacker.knockedOff) {
    messages.push('But it failed!');
    return true;
  }

  attacker.heldItemId = attacker.recycledItemId;
  attacker.recycledItemId = null;
  messages.push(`${attacker.species} found one ${attacker.heldItemId}!`);
  return true;
};

const applySecretPowerEffect = (
  battle: BattleState,
  move: BattleMove,
  defender: BattlePokemonSnapshot,
  defenderSide: 'player' | 'opponent',
  defenderCanStillAct: boolean,
  encounterState: BattleEncounterState,
  messages: string[]
): void => {
  if (move.effect !== 'EFFECT_SECRET_POWER') {
    return;
  }

  const chance = move.secondaryEffectChance > 0 ? move.secondaryEffectChance : 30;
  if ((nextBattleRng(encounterState) % 100) >= chance) {
    return;
  }

  switch (battle.terrain) {
    case 'BATTLE_TERRAIN_GRASS':
      applyStatusEffect(defender, 'poison', messages, move, '', encounterState, battle, defenderSide);
      break;
    case 'BATTLE_TERRAIN_LONG_GRASS':
      applyStatusEffect(defender, 'sleep', messages, move, '', encounterState, battle, defenderSide);
      break;
    case 'BATTLE_TERRAIN_SAND':
      applyDirectStageChange(defender, 'accuracy', -1, messages);
      break;
    case 'BATTLE_TERRAIN_UNDERWATER':
      applyDirectStageChange(defender, 'defense', -1, messages);
      break;
    case 'BATTLE_TERRAIN_WATER':
      applyDirectStageChange(defender, 'attack', -1, messages);
      break;
    case 'BATTLE_TERRAIN_POND':
      applyDirectStageChange(defender, 'speed', -1, messages);
      break;
    case 'BATTLE_TERRAIN_MOUNTAIN':
      applyConfusion(defender, encounterState, messages);
      break;
    case 'BATTLE_TERRAIN_CAVE':
      if (defenderCanStillAct) {
        defender.volatile.flinched = true;
      }
      break;
    default:
      applyStatusEffect(defender, 'paralysis', messages, move, '', encounterState, battle, defenderSide);
      break;
  }
};

const useSubstitute = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  if (pokemon.volatile.substituteHp > 0) {
    messages.push(`${pokemon.species} already has a substitute!`);
    return true;
  }

  const hpCost = Math.max(1, Math.floor(pokemon.maxHp / 4));
  if (pokemon.hp <= hpCost) {
    messages.push('But it failed!');
    return true;
  }

  pokemon.hp -= hpCost;
  pokemon.volatile.substituteHp = hpCost;
  applyQueuedDamage(battle, side, pokemon.hp);
  messages.push(`${pokemon.species} put in a substitute!`);
  return true;
};

const clearAllStatStages = (battle: BattleState, messages: string[]): void => {
  battle.playerMon.statStages = createStatStages();
  battle.wildMon.statStages = createStatStages();
  messages.push('All stat changes were eliminated!');
};

const useFocusEnergy = (pokemon: BattlePokemonSnapshot, messages: string[]): boolean => {
  if (pokemon.volatile.focusEnergy) {
    messages.push('But it failed!');
    return true;
  }

  pokemon.volatile.focusEnergy = true;
  messages.push(`${pokemon.species} is getting pumped!`);
  return true;
};

const useBellyDrum = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  const hpCost = Math.floor(pokemon.maxHp / 2);
  if (pokemon.hp <= hpCost || pokemon.statStages.attack >= 6) {
    messages.push('But it failed!');
    return true;
  }

  pokemon.hp -= hpCost;
  pokemon.statStages.attack = 6;
  applyQueuedDamage(battle, side, pokemon.hp);
  messages.push(`${pokemon.species} cut its HP and maximized ATTACK!`);
  return true;
};

const useBatonPass = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  if (attackerSide !== 'player') {
    messages.push('But it failed!');
    return true;
  }

  const target = battle.party.find((member) => member !== attacker && member.hp > 0);
  if (!target) {
    messages.push('But it failed!');
    return true;
  }

  const passedStatStages = { ...attacker.statStages };
  const passedVolatile = {
    substituteHp: attacker.volatile.substituteHp,
    confusionTurns: attacker.volatile.confusionTurns,
    leechSeededBy: attacker.volatile.leechSeededBy,
    escapePreventedBy: attacker.volatile.escapePreventedBy,
    focusEnergy: attacker.volatile.focusEnergy,
    rooted: attacker.volatile.rooted,
    cursed: attacker.volatile.cursed,
    lockOnBy: attacker.volatile.lockOnBy,
    lockOnTurns: attacker.volatile.lockOnTurns,
    perishTurns: attacker.volatile.perishTurns
  };
  clearSwitchReferences(battle, attackerSide, true);
  resetBattlePokemonTransientState(attacker);
  resetBattlePokemonTransientState(target);
  target.statStages = passedStatStages;
  target.volatile.substituteHp = passedVolatile.substituteHp;
  target.volatile.confusionTurns = passedVolatile.confusionTurns;
  target.volatile.leechSeededBy = passedVolatile.leechSeededBy;
  target.volatile.escapePreventedBy = passedVolatile.escapePreventedBy;
  target.volatile.focusEnergy = passedVolatile.focusEnergy;
  target.volatile.rooted = passedVolatile.rooted;
  target.volatile.cursed = passedVolatile.cursed;
  target.volatile.lockOnBy = passedVolatile.lockOnBy;
  target.volatile.lockOnTurns = passedVolatile.lockOnTurns;
  target.volatile.perishTurns = passedVolatile.perishTurns;
  setActiveBattlePartyMember(battle, 'player', target);
  refreshActiveMovePointers(battle);
  messages.push(`${attacker.species} passed its battle state!`);
  messages.push(`Go! ${target.species}!`);
  return true;
};

const clearSwitchReferences = (
  battle: BattleState,
  switchedSide: 'player' | 'opponent',
  preserveLockOn = false
): void => {
  const opposing = switchedSide === 'player' ? battle.wildMon : battle.playerMon;
  if (opposing.volatile.infatuatedBy === switchedSide) {
    opposing.volatile.infatuatedBy = null;
  }
  if (opposing.volatile.trappedBy === switchedSide) {
    opposing.volatile.trappedBy = null;
    opposing.volatile.trapTurns = 0;
  }
  if (opposing.volatile.escapePreventedBy === switchedSide) {
    opposing.volatile.escapePreventedBy = null;
  }
  if (!preserveLockOn && opposing.volatile.lockOnBy === switchedSide) {
    opposing.volatile.lockOnBy = null;
    opposing.volatile.lockOnTurns = 0;
  }
};

const applyFaintRetaliation = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): void => {
  if (defender.hp > 0) {
    return;
  }

  if (defender.volatile.grudge && move.id !== 'STRUGGLE') {
    move.ppRemaining = 0;
    messages.push(`${defender.species}'s grudge drained ${move.name}'s PP!`);
  }

  if (defender.volatile.destinyBond && attacker.hp > 0) {
    attacker.hp = 0;
    applyQueuedDamage(battle, attackerSide, attacker.hp);
    maybeAdjustFriendshipOnFaint(battle, attackerSide, attacker);
    messages.push(`${attacker.species} was taken down by Destiny Bond!`);
    if (!messages.includes(getFaintMessage(attackerSide, battle))) {
      messages.push(getFaintMessage(attackerSide, battle));
    }
  }

  if (!messages.includes(getFaintMessage(defenderSide, battle))) {
    messages.push(getFaintMessage(defenderSide, battle));
  }
};

const useBide = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): boolean => {
  if (attacker.volatile.bideTurns <= 0) {
    attacker.volatile.bideMoveId = move.id;
    attacker.volatile.bideTurns = 2;
    attacker.volatile.bideDamage = 0;
    attacker.volatile.bideTarget = null;
    messages.push(`${attacker.species} began storing energy!`);
    return true;
  }

  if (attacker.volatile.bideTurns > 1) {
    attacker.volatile.bideTurns -= 1;
    messages.push(`${attacker.species} is storing energy!`);
    return true;
  }

  const bideDamage = attacker.volatile.bideDamage * 2;
  const targetSide = attacker.volatile.bideTarget;
  attacker.volatile.bideMoveId = null;
  attacker.volatile.bideTurns = 0;
  attacker.volatile.bideDamage = 0;
  attacker.volatile.bideTarget = null;
  messages.push(`${attacker.species} unleashed energy!`);

  if (bideDamage <= 0 || !targetSide) {
    messages.push('But it failed!');
    return true;
  }

  const target = targetSide === attackerSide ? attacker : defender;
  const resolvedTargetSide = targetSide === attackerSide ? attackerSide : defenderSide;
  damageBattler(battle, resolvedTargetSide, target, bideDamage, move, messages);
  applyFaintRetaliation(battle, attackerSide, resolvedTargetSide, attacker, target, move, messages);
  return true;
};

const getFutureAttackDamage = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): number => {
  let damage = calculateBaseDamage(attacker, defender, move);
  if (attacker.volatile.helpingHand) {
    damage = Math.floor((damage * 15) / 10);
  }
  return damage;
};

const getBeatUpParty = (battle: BattleState, attackerSide: 'player' | 'opponent'): BattlePokemonSnapshot[] =>
  attackerSide === 'player' ? battle.party : [battle.wildMon];

const getBeatUpDamage = (
  attackerPartyMember: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): number => {
  const attackerInfo = getDecompSpeciesInfo(attackerPartyMember.species);
  const defenderInfo = getDecompSpeciesInfo(defender.species);
  const attack = attackerInfo?.baseAttack ?? attackerPartyMember.attack;
  const defense = Math.max(1, defenderInfo?.baseDefense ?? defender.defense);
  const levelTerm = Math.floor((attackerPartyMember.level * 2) / 5) + 2;
  return Math.max(1, Math.floor(Math.floor(Math.floor((levelTerm * move.power * attack) / defense) / 50) + 2));
};

const useBeatUp = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState,
  messages: string[]
): boolean => {
  const party = getBeatUpParty(battle, attackerSide)
    .filter((pokemon) => pokemon.hp > 0 && pokemon.status === 'none');
  if (party.length === 0) {
    messages.push('But it failed!');
    return true;
  }

  let hits = 0;
  for (const member of party) {
    if (defender.hp <= 0) {
      break;
    }
    messages.push(`${member.species} attacked!`);
    const critical = isCriticalHit(move, member, defender, encounterState);
    const damage = getBeatUpDamage(member, defender, move) * (critical ? 2 : 1);
    damageBattler(battle, defenderSide, defender, damage, move, messages);
    hits += 1;
  }
  if (hits > 1) {
    messages.push(`Hit ${hits} times!`);
  }
  return true;
};

const useFutureAttack = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): boolean => {
  const defenderSideState = battle.sideState[defenderSide];
  if (defenderSideState.futureAttack) {
    messages.push('But it failed!');
    return true;
  }

  defenderSideState.futureAttack = {
    move: { ...move },
    damage: getFutureAttackDamage(attacker, defender, move),
    sourceSide: attackerSide,
    countdown: 3
  };
  messages.push(move.id === 'DOOM_DESIRE' ? `${attacker.species} chose Doom Desire as its destiny!` : `${attacker.species} foresaw an attack!`);
  return true;
};

const getCounterMirrorDamage = (
  move: BattleMove,
  attackerSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot
): number | null => {
  const expectedCategory = move.effect === 'EFFECT_COUNTER'
    ? 'physical'
    : move.effect === 'EFFECT_MIRROR_COAT'
      ? 'special'
      : null;
  if (
    !expectedCategory
    || attacker.volatile.lastDamageTaken <= 0
    || attacker.volatile.lastDamageCategory !== expectedCategory
    || attacker.volatile.lastDamagedBy === attackerSide
    || attacker.volatile.lastDamagedBy === null
  ) {
    return null;
  }

  return attacker.volatile.lastDamageTaken * 2;
};

const getLastUsedMove = (pokemon: BattlePokemonSnapshot): BattleMove | null => {
  if (!pokemon.volatile.lastMoveUsedId) {
    return null;
  }

  return pokemon.moves.find((move) => move.id === pokemon.volatile.lastMoveUsedId) ?? null;
};

const getLastCopyableMove = (pokemon: BattlePokemonSnapshot): BattleMove | null => {
  const moveId = pokemon.volatile.lastMoveUsedId;
  if (!moveId || moveId === 'STRUGGLE') {
    return null;
  }

  return pokemon.moves.find((move) => move.id === moveId) ?? getRegisteredBattleMove(moveId);
};

const getLastPrintedMove = (pokemon: BattlePokemonSnapshot): BattleMove | null => {
  const moveId = pokemon.volatile.lastPrintedMoveId;
  if (!moveId || moveId === 'STRUGGLE') {
    return null;
  }

  return pokemon.moves.find((move) => move.id === moveId) ?? getRegisteredBattleMove(moveId);
};

const getLastTakenMove = (pokemon: BattlePokemonSnapshot): BattleMove | null => {
  const moveId = pokemon.volatile.lastTakenMoveId;
  if (!moveId || moveId === 'STRUGGLE') {
    return null;
  }

  return pokemon.moves.find((move) => move.id === moveId) ?? getRegisteredBattleMove(moveId);
};

const rememberTakenMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  attackerBattlerId = getPrimaryBattlerIdForSide(attackerSide),
  defenderBattlerId = getPrimaryBattlerIdForSide(defenderSide)
): void => {
  if (attackerSide === defenderSide) {
    return;
  }
  if (!move.flags.includes('FLAG_MIRROR_MOVE_AFFECTED') || defender.hp <= 0) {
    return;
  }
  const chosenMoveId = attacker.volatile.lastMoveUsedId;
  if (!chosenMoveId) {
    return;
  }
  defender.volatile.lastTakenMoveId = chosenMoveId;
  patchBattlerMoveMemory(battle, defenderBattlerId, {
    takenMoveId: chosenMoveId,
    lastHitByBattler: attackerBattlerId
  });
};

const rememberLandedMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  attackerBattlerId = getPrimaryBattlerIdForSide(attackerSide),
  defenderBattlerId = getPrimaryBattlerIdForSide(defenderSide)
): void => {
  if (attackerSide === defenderSide || defender.hp <= 0) {
    return;
  }
  defender.volatile.lastLandedMoveId = move.id;
  patchBattlerMoveMemory(battle, defenderBattlerId, {
    landedMoveId: move.id,
    lastMoveTargetBattler: defenderBattlerId,
    lastHitByBattler: attackerBattlerId
  });
};

const shouldRememberTakenMoveFromMessages = (
  defender: BattlePokemonSnapshot,
  messages: string[]
): boolean => !messages.some((message) =>
  message === 'But it failed!'
  || message === 'But nothing happened!'
  || message === 'But it had no effect!'
  || message === `${defender.species} is already confused!`
  || message.includes("won't go higher")
  || message.includes("won't go lower")
  || message.includes('protected by Safeguard')
  || message.includes('is protected by Mist')
  || message.includes('made it ineffective')
  || message.startsWith(`It doesn't affect ${defender.species}`)
);

const replaceMoveInSlot = (
  pokemon: BattlePokemonSnapshot,
  sourceMove: BattleMove,
  replacement: BattleMove,
  ppRemaining: number
): boolean => {
  const moveIndex = pokemon.moves.findIndex((move) => move === sourceMove);
  const fallbackIndex = pokemon.moves.findIndex((move) => move.id === sourceMove.id);
  const index = moveIndex >= 0 ? moveIndex : fallbackIndex;
  if (index < 0) {
    return false;
  }

  pokemon.moves[index] = {
    ...replacement,
    ppRemaining: Math.max(0, Math.min(replacement.pp, ppRemaining))
  };
  return true;
};

const useMimic = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): boolean => {
  const copiedMove = getLastCopyableMove(defender);
  if (
    !copiedMove
    || mimicForbiddenMoveIds.has(copiedMove.id)
    || attacker.volatile.transformed
    || attacker.moves.some((knownMove) => knownMove.id === copiedMove.id)
    || !replaceMoveInSlot(attacker, move, copiedMove, Math.min(5, copiedMove.pp))
  ) {
    messages.push('But it failed!');
    return true;
  }

  messages.push(`${attacker.species} learned ${copiedMove.name}!`);
  return true;
};

const useSketch = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): boolean => {
  const copiedMove = getLastPrintedMove(defender);
  if (
    !copiedMove
    || copiedMove.id === 'SKETCH'
    || attacker.volatile.transformed
    || attacker.moves.some((knownMove) => knownMove.id !== 'SKETCH' && knownMove.id === copiedMove.id)
    || !replaceMoveInSlot(attacker, move, copiedMove, copiedMove.pp)
  ) {
    messages.push('But it failed!');
    return true;
  }

  messages.push(`${attacker.species} sketched ${copiedMove.name}!`);
  return true;
};

const applyTransform = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  if (defender.volatile.transformed || defender.volatile.semiInvulnerable !== null) {
    messages.push('But it failed!');
    return true;
  }

  const originalSpecies = attacker.species;
  const transformedSpecies = defender.species;
  attacker.species = defender.species;
  attacker.attack = defender.attack;
  attacker.defense = defender.defense;
  attacker.speed = defender.speed;
  attacker.spAttack = defender.spAttack;
  attacker.spDefense = defender.spDefense;
  attacker.abilityId = defender.abilityId;
  attacker.types = [...defender.types];
  attacker.statStages = { ...defender.statStages };
  attacker.moves = defender.moves.map((move) => ({ ...move, ppRemaining: Math.min(5, move.pp) }));
  attacker.volatile.transformed = true;
  attacker.volatile.disabledMoveId = null;
  attacker.volatile.disableTurns = 0;
  messages.push(`${originalSpecies} transformed into ${transformedSpecies}!`);
  return true;
};

const applyConversion = (
  attacker: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[]
): boolean => {
  const validMoves = attacker.moves.filter((knownMove) => knownMove.id !== 'NONE');
  const hasNewType = validMoves.some((knownMove) => !attacker.types.includes(knownMove.type));
  if (!hasNewType) {
    messages.push('But it failed!');
    return true;
  }

  let nextType: PokemonType;
  do {
    let moveIndex: number;
    do {
      moveIndex = nextBattleRng(encounterState) & 3;
    } while (moveIndex >= validMoves.length);
    nextType = validMoves[moveIndex]!.type;
  } while (attacker.types.includes(nextType));

  attacker.types = [nextType];
  messages.push(`${attacker.species} changed type!`);
  return true;
};

const applyConversion2 = (
  battle: BattleState,
  attacker: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[]
): boolean => {
  const lastType = attacker.volatile.lastReceivedMoveType;
  const lastLandedMoveId = attacker.volatile.lastLandedMoveId;
  if (!lastType || !lastLandedMoveId) {
    messages.push('But it failed!');
    return true;
  }

  const sourceBattler = attacker.volatile.lastDamagedBy === 'player'
    ? battle.playerMon
    : attacker.volatile.lastDamagedBy === 'opponent'
      ? battle.wildMon
      : null;
  const lastLandedMove = getRegisteredBattleMove(lastLandedMoveId);
  if (
    sourceBattler
    && lastLandedMove
    && twoTurnMoveEffects.has(lastLandedMove.effect)
    && sourceBattler.volatile.chargingMoveId === lastLandedMoveId
  ) {
    messages.push('But it failed!');
    return true;
  }

  const validTypes = allPokemonTypes.filter((candidate) =>
    !attacker.types.includes(candidate)
    && calculateTypeEffectiveness(lastType, [candidate]) < 1
  );
  const nextType = validTypes[nextEncounterRoll(encounterState, validTypes.length)];
  if (!nextType) {
    messages.push('But it failed!');
    return true;
  }

  attacker.types = [nextType];
  messages.push(`${attacker.species} changed type!`);
  return true;
};

const applyComboStageMove = (
  move: BattleMove,
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  defenderSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  const effectsByMove: Partial<Record<string, string[]>> = {
    EFFECT_BULK_UP: ['EFFECT_ATTACK_UP', 'EFFECT_DEFENSE_UP'],
    EFFECT_CALM_MIND: ['EFFECT_SPECIAL_ATTACK_UP', 'EFFECT_SPECIAL_DEFENSE_UP'],
    EFFECT_COSMIC_POWER: ['EFFECT_DEFENSE_UP', 'EFFECT_SPECIAL_DEFENSE_UP'],
    EFFECT_DRAGON_DANCE: ['EFFECT_ATTACK_UP', 'EFFECT_SPEED_UP'],
    EFFECT_TICKLE: ['EFFECT_ATTACK_DOWN', 'EFFECT_DEFENSE_DOWN']
  };

  const effects = effectsByMove[move.effect];
  if (!effects) {
    return false;
  }

  for (const effect of effects) {
    applyStageEffect(effect, attacker, defender, messages, battle, attackerSide, defenderSide);
  }
  return true;
};

const getMultiHitCount = (move: BattleMove, encounterState: BattleEncounterState): number => {
  if (move.effect === 'EFFECT_DOUBLE_HIT' || move.effect === 'EFFECT_TWINEEDLE') {
    return 2;
  }
  if (move.effect === 'EFFECT_TRIPLE_KICK') {
    return 3;
  }

  const roll = nextBattleRng(encounterState) % 100;
  if (roll < 35) {
    return 2;
  }
  if (roll < 70) {
    return 3;
  }
  if (roll < 85) {
    return 4;
  }
  return 5;
};

const isMultiHitMove = (move: BattleMove): boolean =>
  move.effect === 'EFFECT_MULTI_HIT'
  || move.effect === 'EFFECT_DOUBLE_HIT'
  || move.effect === 'EFFECT_TWINEEDLE'
  || move.effect === 'EFFECT_TRIPLE_KICK';

const isDirectHitEffect = (move: BattleMove): boolean =>
  move.effect === 'EFFECT_HIT' || directHitEffectAliases.has(move.effect);

const twoTurnMoveEffects = new Set<string>([
  'EFFECT_RAZOR_WIND',
  'EFFECT_SKULL_BASH',
  'EFFECT_SOLAR_BEAM',
  'EFFECT_SEMI_INVULNERABLE',
  'EFFECT_SKY_ATTACK'
]);

const directHitEffectAliases = new Set<string>([
  'EFFECT_QUICK_ATTACK',
  'EFFECT_VITAL_THROW',
  'EFFECT_PURSUIT'
]);

const getSemiInvulnerableState = (move: BattleMove): BattleVolatileState['semiInvulnerable'] => {
  if (move.effect !== 'EFFECT_SEMI_INVULNERABLE') {
    return null;
  }
  if (move.id === 'FLY' || move.id === 'BOUNCE') {
    return 'air';
  }
  if (move.id === 'DIVE') {
    return 'underwater';
  }
  return 'underground';
};

const shouldSkipTwoTurnCharge = (battle: BattleState, move: BattleMove): boolean =>
  move.effect === 'EFFECT_SOLAR_BEAM' && battle.weather === 'sun';

const getActorLabel = (side: 'player' | 'opponent', battle: BattleState): string =>
  side === 'player' ? battle.playerMon.species : `Foe ${battle.wildMon.species}`;

const getFaintMessage = (side: 'player' | 'opponent', battle: BattleState): string =>
  side === 'player' ? `${battle.playerMon.species} fainted!` : `Foe ${battle.wildMon.species} fainted!`;

const maybeAdjustFriendshipOnFaint = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot
): void => {
  if (side !== 'player' || pokemon.hp > 0) {
    return;
  }

  const battlerId = findBattlerIdForPokemon(battle, side, pokemon);
  if (battlerId === null) {
    return;
  }

  adjustFriendshipOnBattleFaint(battle, battlerId);
};

const calculateConfusionDamage = (pokemon: BattlePokemonSnapshot): number => {
  const confusionMove: BattleMove = {
    id: 'CONFUSION_SELF_HIT',
    name: 'CONFUSION_SELF_HIT',
    power: 40,
    type: 'normal',
    accuracy: 0,
    pp: 1,
    ppRemaining: 1,
    priority: 0,
    effect: 'EFFECT_HIT',
    effectScriptLabel: 'BattleScript_MoveUsedIsConfused',
    target: 'MOVE_TARGET_USER',
    secondaryEffectChance: 0,
    flags: []
  };
  return calculateBaseDamage(pokemon, pokemon, confusionMove);
};

const canMoveThisTurn = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState,
  messages: string[],
  sleepTalkCalledMove = false
): boolean => {
  if (pokemon.hp <= 0) {
    return false;
  }

  if (pokemon.volatile.flinched) {
    pokemon.volatile.flinched = false;
    messages.push(`${pokemon.species} flinched!`);
    return false;
  }

  if (pokemon.volatile.rechargeTurns > 0) {
    pokemon.volatile.rechargeTurns -= 1;
    messages.push(`${pokemon.species} must recharge!`);
    return false;
  }

  if (pokemon.volatile.tauntTurns > 0 && move.power === 0) {
    messages.push(`${pokemon.species} can't use ${move.name} after the taunt!`);
    return false;
  }

  if (pokemon.volatile.disableTurns > 0 && pokemon.volatile.disabledMoveId === move.id) {
    messages.push(`${pokemon.species}'s ${move.name} is disabled!`);
    return false;
  }

  const opponent = side === 'player' ? battle.wildMon : battle.playerMon;
  if (opponent.volatile.imprisoning && opponent.moves.some((opponentMove) => opponentMove.id === move.id)) {
    messages.push(`${pokemon.species} can't use the sealed ${move.name}!`);
    return false;
  }

  if (pokemon.volatile.tormented && pokemon.volatile.lastMoveUsedId === move.id) {
    messages.push(`${pokemon.species} can't use the same move twice due to torment!`);
    return false;
  }

  if (pokemon.volatile.infatuatedBy !== null) {
    messages.push(`${pokemon.species} is in love!`);
    if ((nextBattleRng(encounterState) & 1) === 0) {
      messages.push(`${pokemon.species} is immobilized by love!`);
      return false;
    }
  }

  if (sleepTalkCalledMove && pokemon.status === 'sleep') {
    return true;
  }

  if (pokemon.status === 'sleep' && (move.effect === 'EFFECT_SNORE' || move.effect === 'EFFECT_SLEEP_TALK')) {
    return true;
  }

  if (pokemon.status === 'sleep') {
    pokemon.statusTurns = Math.max(0, pokemon.statusTurns - 1);
    if (pokemon.statusTurns === 0) {
      pokemon.status = 'none';
      messages.push(`${pokemon.species} woke up!`);
      return true;
    }

    messages.push(`${pokemon.species} is fast asleep.`);
    return false;
  }

  if (pokemon.status === 'freeze') {
    if (move.effect === 'EFFECT_THAW_HIT') {
      pokemon.status = 'none';
      messages.push(`${pokemon.species} thawed out!`);
      return true;
    }
    messages.push(`${pokemon.species} is frozen solid!`);
    return false;
  }

  if (pokemon.status === 'paralysis' && (nextBattleRng(encounterState) % 4) === 0) {
    messages.push(`${pokemon.species} is paralyzed! It can't move!`);
    return false;
  }

  if (pokemon.volatile.confusionTurns > 0) {
    pokemon.volatile.confusionTurns -= 1;
    if (pokemon.volatile.confusionTurns === 0) {
      messages.push(`${pokemon.species} snapped out of confusion!`);
      return true;
    }

    messages.push(`${pokemon.species} is confused!`);
    if ((nextBattleRng(encounterState) & 1) === 0) {
      const damage = calculateConfusionDamage(pokemon);
      pokemon.hp = Math.max(0, pokemon.hp - damage);
      applyQueuedDamage(battle, side, pokemon.hp);
      messages.push('It hurt itself in its confusion!');
      if (pokemon.hp === 0) {
        messages.push(getFaintMessage(side, battle));
      }
      return false;
    }
  }

  return true;
};

const canHitSemiInvulnerableTarget = (move: BattleMove, defender: BattlePokemonSnapshot): boolean => {
  if (!defender.volatile.semiInvulnerable) {
    return true;
  }

  if (defender.volatile.semiInvulnerable === 'air') {
    return move.effect === 'EFFECT_SKY_UPPERCUT'
      || move.effect === 'EFFECT_GUST'
      || move.effect === 'EFFECT_TWISTER'
      || move.effect === 'EFFECT_THUNDER';
  }

  if (defender.volatile.semiInvulnerable === 'underground') {
    return move.effect === 'EFFECT_EARTHQUAKE'
      || move.effect === 'EFFECT_MAGNITUDE';
  }

  return move.id === 'SURF' || move.id === 'WHIRLPOOL';
};

const attemptAccuracy = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState
): boolean => {
  if (!canHitSemiInvulnerableTarget(move, defender)) {
    return false;
  }

  if (defender.volatile.lockOnBy === attackerSide && defender.volatile.lockOnTurns > 0) {
    return true;
  }

  if (move.effect === 'EFFECT_ALWAYS_HIT' || (move.effect === 'EFFECT_THUNDER' && battle.weather === 'rain')) {
    return true;
  }

  if (move.effect === 'EFFECT_THUNDER' && battle.weather === 'sun') {
    return (nextBattleRng(encounterState) % 100) + 1 <= 50;
  }

  if (move.accuracy === 0) {
    return true;
  }

  let accuracyValue = getAccuracyAdjustedValue(
    move.accuracy,
    attacker.statStages.accuracy,
    defender.volatile.foresighted ? 0 : defender.statStages.evasion
  );
  if (attacker.abilityId === 'COMPOUND_EYES') {
    accuracyValue = Math.floor((accuracyValue * 13) / 10);
  }
  if (attacker.abilityId === 'HUSTLE' && !specialTypes.has(move.type)) {
    accuracyValue = Math.floor((accuracyValue * 8) / 10);
  }
  if (defender.abilityId === 'SAND_VEIL' && battle.weather === 'sandstorm') {
    accuracyValue = Math.floor((accuracyValue * 8) / 10);
  }
  if (getHeldItemHoldEffect(defender) === 'HOLD_EFFECT_EVASION_UP') {
    accuracyValue = Math.floor((accuracyValue * (100 - getHeldItemHoldEffectParam(defender))) / 100);
  }
  return (nextBattleRng(encounterState) % 100) + 1 <= accuracyValue;
};

const isCriticalHit = (
  move: BattleMove,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  encounterState: BattleEncounterState
): boolean => {
  if (defender.abilityId === 'BATTLE_ARMOR' || defender.abilityId === 'SHELL_ARMOR') {
    return false;
  }

  const holdEffect = getHeldItemHoldEffect(attacker);
  const critStage = Math.min(
    criticalHitDivisors.length - 1,
    (highCriticalEffects.has(move.effect) ? 1 : 0) + (attacker.volatile.focusEnergy ? 2 : 0)
    + (holdEffect === 'HOLD_EFFECT_SCOPE_LENS' ? 1 : 0)
    + (holdEffect === 'HOLD_EFFECT_LUCKY_PUNCH' && isSpecies(attacker, 'CHANSEY') ? 2 : 0)
    + (holdEffect === 'HOLD_EFFECT_STICK' && isSpecies(attacker, 'FARFETCHD') ? 2 : 0)
  );
  return nextBattleRng(encounterState) % criticalHitDivisors[critStage] === 0;
};

const calculateFixedDamage = (
  move: BattleMove,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  encounterState: BattleEncounterState
): number | null => {
  switch (move.effect) {
    case 'EFFECT_SONICBOOM':
      return 20;
    case 'EFFECT_DRAGON_RAGE':
      return 40;
    case 'EFFECT_LEVEL_DAMAGE':
      return attacker.level;
    case 'EFFECT_SUPER_FANG':
      return Math.max(1, Math.floor(defender.hp / 2));
    case 'EFFECT_PSYWAVE': {
      let roll = nextBattleRng(encounterState) % 16;
      while (roll > 10) {
        roll = nextBattleRng(encounterState) % 16;
      }
      return Math.max(1, Math.floor((attacker.level * ((roll * 10) + 50)) / 100));
    }
    default:
      return null;
  }
};

const chooseMetronomeMove = (encounterState: BattleEncounterState): BattleMove => {
  const moves = getRegisteredBattleMoves();
  while (true) {
    const candidateIndex = nextBattleRng(encounterState) & 0x1ff;
    if (candidateIndex === 0 || candidateIndex > moves.length) {
      continue;
    }

    const move = moves[candidateIndex - 1];
    if (!move || move.id === 'NONE' || metronomeForbiddenMoveIds.has(move.id) || move.id === 'METRONOME') {
      continue;
    }

    return { ...move };
  }
};

const chooseAssistMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  encounterState: BattleEncounterState
): BattleMove | null => {
  const candidates = attackerSide === 'player'
    ? battle.party
        .filter((pokemon) => pokemon !== battle.playerMon && pokemon.hp > 0)
        .flatMap((pokemon) => pokemon.moves)
    : [];
  const validMoves = candidates.filter((move) =>
    move.id !== 'NONE'
    && !metronomeForbiddenMoveIds.has(move.id)
  );

  if (validMoves.length === 0) {
    return null;
  }

  const moveIndex = ((nextBattleRng(encounterState) & 0xff) * validMoves.length) >> 8;
  return { ...validMoves[moveIndex]! };
};

const chooseSleepTalkMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  attacker: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  lastMoveUsedIdForLimitations: string | null
): BattleMove | null => {
  const validMoveIndexes = attacker.moves.flatMap((move, index) =>
    move.id !== 'NONE'
    && move.id !== 'SLEEP_TALK'
    && move.id !== 'ASSIST'
    && move.id !== 'MIRROR_MOVE'
    && move.id !== 'METRONOME'
    && move.id !== 'FOCUS_PUNCH'
    && move.id !== 'UPROAR'
    && move.effect !== 'EFFECT_BIDE'
    && !twoTurnMoveEffects.has(move.effect)
    && getMoveSelectionLimitation(battle, attackerSide, attacker, move, {
      ignorePp: true,
      lastMoveUsedId: lastMoveUsedIdForLimitations
    }) === null
      ? [index]
      : []
  );

  if (validMoveIndexes.length === 0) {
    return null;
  }

  let moveIndex: number;
  do {
    moveIndex = nextBattleRng(encounterState) & 3;
  } while (!validMoveIndexes.includes(moveIndex));

  return { ...attacker.moves[moveIndex]! };
};

const getNaturePowerMove = (battle: BattleState): BattleMove | null => {
  const moveId = naturePowerMoveByTerrain[battle.terrain] ?? 'SWIFT';
  return getRegisteredBattleMove(moveId);
};

const isMagicCoatReflectable = (move: BattleMove): boolean =>
  move.flags.includes('FLAG_MAGIC_COAT_AFFECTED')
  || (
    move.flags.length === 0
    && move.power === 0
    && move.target !== 'MOVE_TARGET_USER'
    && ![
      'EFFECT_MAGIC_COAT',
      'EFFECT_SNATCH',
      'EFFECT_MIRROR_MOVE',
      'EFFECT_METRONOME',
      'EFFECT_ASSIST',
      'EFFECT_NATURE_POWER',
      'EFFECT_TRICK',
      'EFFECT_SKILL_SWAP',
      'EFFECT_ROLE_PLAY'
    ].includes(move.effect)
  );

const isSnatchableMove = (move: BattleMove): boolean =>
  move.flags.includes('FLAG_SNATCH_AFFECTED')
  || move.target === 'MOVE_TARGET_USER'
  || [
    'EFFECT_RESTORE_HP',
    'EFFECT_MORNING_SUN',
    'EFFECT_SYNTHESIS',
    'EFFECT_MOONLIGHT',
    'EFFECT_SOFTBOILED',
    'EFFECT_REFRESH',
    'EFFECT_INGRAIN',
    'EFFECT_CHARGE',
    'EFFECT_MUD_SPORT',
    'EFFECT_WATER_SPORT',
    'EFFECT_CAMOUFLAGE',
    'EFFECT_BELLY_DRUM',
    'EFFECT_FOCUS_ENERGY',
    'EFFECT_DEFENSE_CURL',
    'EFFECT_MINIMIZE',
    'EFFECT_STOCKPILE',
    'EFFECT_SWALLOW'
  ].includes(move.effect);

const soundMoveIds = new Set<string>([
  'GROWL',
  'ROAR',
  'SING',
  'SUPERSONIC',
  'SCREECH',
  'SNORE',
  'UPROAR',
  'METAL_SOUND',
  'GRASS_WHISTLE',
  'HEAL_BELL',
  'PERISH_SONG'
]);

const isSoundMove = (move: BattleMove): boolean =>
  soundMoveIds.has(move.id);

const applyAbsorbingAbility = (
  battle: BattleState,
  defenderSide: 'player' | 'opponent',
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  messages: string[]
): boolean => {
  if (defender.abilityId === 'VOLT_ABSORB' && move.type === 'electric') {
    if (defender.hp < defender.maxHp) {
      healBattler(battle, defenderSide, defender, Math.max(1, Math.floor(defender.maxHp / 4)), messages);
    } else {
      messages.push(`${defender.species}'s Volt Absorb made it ineffective!`);
    }
    return true;
  }

  if (defender.abilityId === 'WATER_ABSORB' && move.type === 'water') {
    if (defender.hp < defender.maxHp) {
      healBattler(battle, defenderSide, defender, Math.max(1, Math.floor(defender.maxHp / 4)), messages);
    } else {
      messages.push(`${defender.species}'s Water Absorb made it ineffective!`);
    }
    return true;
  }

  if (defender.abilityId === 'FLASH_FIRE' && move.type === 'fire') {
    defender.volatile.flashFire = true;
    messages.push(`${defender.species}'s Flash Fire made it ineffective!`);
    return true;
  }

  return false;
};

const executeMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  move: BattleMove,
  encounterState: BattleEncounterState,
  defenderCanStillAct = false,
  options: ExecuteBattleMoveVmOptions = {}
): string[] => executeBattleMoveVm(
  battle,
  attackerSide,
  move,
  encounterState,
  defenderCanStillAct,
  options,
  {
    canMoveThisTurn,
    emitControllerCommand,
    pushMessage,
    getActorLabel,
    useBide,
    useMimic,
    useSketch,
    getLastTakenMove,
    chooseMetronomeMove,
    rememberTakenMove,
    chooseAssistMove,
    chooseSleepTalkMove,
    getNaturePowerMove,
    tryUseProtect,
    isMoveBlockedByProtect,
    isSoundMove,
    applyAbsorbingAbility,
    isMagicCoatReflectable,
    isSnatchableMove,
    isMoveBlockedBySubstitute,
    shouldSkipTwoTurnCharge,
    getSemiInvulnerableState,
    useFutureAttack,
    attemptAccuracy,
    getBattleTypeEffectiveness,
    calculateDamageRoll,
    damageBattler,
    applyFaintRetaliation,
    useBeatUp,
    getMoveWithDynamicPower,
    getCounterMirrorDamage,
    calculateFixedDamage,
    isDirectHitEffect,
    isMultiHitMove,
    getMultiHitCount,
    isCriticalHit,
    maybeApplySecondaryStatus,
    maybeApplySecondaryStageEffect,
    maybeApplySecondaryConfusion,
    applySecretPowerEffect,
    maybeApplyFlinch,
    maybeApplyKingsRock,
    applyPostHitItemEffect,
    applyQueuedDamage,
    maybeApplyShellBell,
    applyConfusion,
    applyStatusEffect,
    applySideCondition,
    applyWeatherMove,
    useSubstitute,
    clearAllStatStages,
    applyTransform,
    applyConversion,
    applyConversion2,
    getLastUsedMove,
    nextBattleRng,
    applyDirectStageChange,
    useBellyDrum,
    applyComboStageMove,
    useTrick,
    useRecycle,
    useBatonPass,
    healBattler,
    applyStageEffect,
    getFaintMessage,
    rememberLandedMove,
    shouldRememberTakenMoveFromMessages,
    getHeldItemHoldEffect,
    getChoicedMoveId,
    twoTurnMoveEffects,
    primaryStatusByEffect,
    typeByTerrain
  }
);

const getActionOrder = (
  battle: BattleState,
  playerMove: BattleMove,
  enemyMove: BattleMove,
  encounterState: BattleEncounterState
): Array<'player' | 'opponent'> => {
  if (playerMove.priority !== enemyMove.priority) {
    return playerMove.priority > enemyMove.priority ? ['player', 'opponent'] : ['opponent', 'player'];
  }

  let playerSpeed = getTurnOrderSpeed(battle.playerMon, battle.weather);
  let enemySpeed = getTurnOrderSpeed(battle.wildMon, battle.weather);
  const quickClawActivated = (pokemon: BattlePokemonSnapshot): boolean => {
    if (getHeldItemHoldEffect(pokemon) !== 'HOLD_EFFECT_QUICK_CLAW') {
      return false;
    }
    return (nextBattleRng(encounterState) & 0xffff) < Math.floor((0xffff * getHeldItemHoldEffectParam(pokemon)) / 100);
  };
  if (quickClawActivated(battle.playerMon)) {
    playerSpeed = Number.MAX_SAFE_INTEGER;
  }
  if (quickClawActivated(battle.wildMon)) {
    enemySpeed = Number.MAX_SAFE_INTEGER;
  }
  if (playerSpeed !== enemySpeed) {
    return playerSpeed > enemySpeed ? ['player', 'opponent'] : ['opponent', 'player'];
  }

  return (nextBattleRng(encounterState) & 1) === 0 ? ['player', 'opponent'] : ['opponent', 'player'];
};

const resolveFutureAttack = (
  battle: BattleState,
  targetSide: 'player' | 'opponent',
  target: BattlePokemonSnapshot,
  messages: string[]
): void => {
  const sideState = battle.sideState[targetSide];
  const futureAttack = sideState.futureAttack;
  if (!futureAttack) {
    return;
  }

  futureAttack.countdown -= 1;
  if (futureAttack.countdown > 0) {
    return;
  }

  sideState.futureAttack = null;
  if (target.hp <= 0) {
    return;
  }

  messages.push(`${target.species} took ${futureAttack.move.name}!`);
  const attacker = futureAttack.sourceSide === 'player' ? battle.playerMon : battle.wildMon;
  damageBattler(battle, targetSide, target, futureAttack.damage, futureAttack.move, messages);
  applyFaintRetaliation(battle, futureAttack.sourceSide, targetSide, attacker, target, futureAttack.move, messages);
};

const getEndOfTurnTargetForSide = (
  battle: BattleState,
  side: BattleSideId
): BattlePokemonSnapshot | null => {
  const battlerId = getActiveBattlerIds(battle, side)
    .find((candidate) => getBattlerSnapshot(battle, candidate)?.hp! > 0);
  return battlerId === undefined ? null : getBattlerSnapshot(battle, battlerId);
};

const hasAnyLivingMonsForBattler = (
  battle: BattleState,
  battlerId: BattleBattlerId
): boolean => {
  const side = getBattlerSide(battlerId);
  const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
  const allowedIndexes = new Set(getBattlerOwnedPartyIndexes(battle, battlerId));
  return participant.party.some((pokemon, index) => allowedIndexes.has(index) && pokemon.hp > 0);
};

const fillDoublesReplacementSlots = (battle: BattleState, messages: string[]): void => {
  for (const battlerId of [0, 2, 1, 3] as const) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (pokemon && pokemon.hp > 0) {
      continue;
    }

    const benchIndexes = getBattlerBenchIndexes(battle, battlerId);
    const nextIndex = benchIndexes[0];
    if (nextIndex === undefined) {
      continue;
    }

    const side = getBattlerSide(battlerId);
    const participant = side === 'player' ? battle.playerSide : battle.opponentSide;
    const nextPokemon = participant.party[nextIndex];
    if (!nextPokemon) {
      continue;
    }

    resetBattlePokemonTransientState(nextPokemon);
    setBattlerPartyIndex(battle, battlerId, nextIndex);
    if (side === 'player' && !battle.playerParticipantPartyIndexes.includes(nextIndex)) {
      battle.playerParticipantPartyIndexes.push(nextIndex);
    }
    messages.push(side === 'player'
      ? `Go! ${nextPokemon.species}!`
      : `${battle.opponentSide.name} sent out ${nextPokemon.species}!`);
    applySpikesSwitchIn(battle, side, nextPokemon, messages);
  }
};

const enqueueDoublesTurnMessages = (battle: BattleState, messages: string[]): void => {
  fillDoublesReplacementSlots(battle, messages);

  const playerHasLivingMons = ([0, 2] as const).some((battlerId) => hasAnyLivingMonsForBattler(battle, battlerId));
  const opponentHasLivingMons = ([1, 3] as const).some((battlerId) => hasAnyLivingMonsForBattler(battle, battlerId));

  if (!playerHasLivingMons) {
    battle.postResult.outcome = 'lost';
    battle.postResult.whiteout = hasBattleTypeFlag(battle, 'trainer');
    battle.postResult.blackout = !hasBattleTypeFlag(battle, 'trainer');
    queueMessages(battle, messages, 'resolved');
    return;
  }

  if (!opponentHasLivingMons) {
    battle.postResult.outcome = 'won';
    battle.postResult.payDayTotal = battle.payDayMoney;
    queueMessages(battle, messages, 'resolved');
    return;
  }

  queueMessages(battle, messages, 'command', getPromptSummary(battle));
};

const resolveEndOfTurn = (battle: BattleState, encounterState: BattleEncounterState): string[] => {
  const messages: string[] = [];
  decrementSideConditions(battle, messages);
  const opponentEndTarget = getEndOfTurnTargetForSide(battle, 'opponent');
  const playerEndTarget = getEndOfTurnTargetForSide(battle, 'player');
  if (opponentEndTarget) {
    resolveFutureAttack(battle, 'opponent', opponentEndTarget, messages);
  }
  if (playerEndTarget) {
    resolveFutureAttack(battle, 'player', playerEndTarget, messages);
  }
  for (const battlerId of getActiveBattlerIds(battle)) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (!pokemon) {
      continue;
    }
    maybeUseWhiteHerb(pokemon, messages);
    maybeUsePinchStatBerry(pokemon, encounterState, messages);
  }
  if (opponentEndTarget) {
    resolveWish(battle, 'opponent', opponentEndTarget, messages);
  }
  if (playerEndTarget) {
    resolveWish(battle, 'player', playerEndTarget, messages);
  }
  for (const battlerId of getActiveBattlerIds(battle)) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (!pokemon) {
      continue;
    }
    const side = getBattlerSide(battlerId);
    applyIngrainHealing(battle, side, pokemon, messages);
    applyLeftoversHealing(battle, side, pokemon, messages);
    applyRainDishHealing(battle, side, pokemon, messages);
  }
  resolveWeatherEndOfTurn(battle, messages);
  for (const battlerId of getActiveBattlerIds(battle)) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (!pokemon) {
      continue;
    }
    const side = getBattlerSide(battlerId);
    applyLeechSeedDrain(battle, side, pokemon, messages);
    const statusMessage = applyStatusDamage(battle, side, pokemon);
    if (statusMessage) {
      messages.push(statusMessage);
    }
    applyNightmareDamage(battle, side, pokemon, messages);
    applyCurseDamage(battle, side, pokemon, messages);
    applyTrapDamage(battle, side, pokemon, messages);
    decrementYawn(pokemon, messages);
    decrementTaunt(pokemon);
    decrementDisableAndEncore(pokemon);
    decrementPerishSong(battle, side, pokemon, messages);
  }

  for (const side of ['opponent', 'player'] as const) {
    for (const battlerId of getActiveBattlerIds(battle, side)) {
      const pokemon = getBattlerSnapshot(battle, battlerId);
      if (pokemon?.hp === 0 && !messages.includes(getFaintMessage(side, battle))) {
        messages.push(getFaintMessage(side, battle));
      }
    }
  }

  clearSingleTurnVolatiles(battle);
  incrementActiveTurns(battle);
  if (
    getActiveBattlerIds(battle, 'player').some((battlerId) => getBattlerSnapshot(battle, battlerId)?.hp! > 0)
    && getActiveBattlerIds(battle, 'opponent').some((battlerId) => getBattlerSnapshot(battle, battlerId)?.hp! > 0)
  ) {
    battle.battleTurnCounter = Math.min(0xff, battle.battleTurnCounter + 1);
  }
  return messages;
};

const enqueueTurnMessages = (battle: BattleState, messages: string[]): void => {
  if (battle.format === 'doubles') {
    enqueueDoublesTurnMessages(battle, messages);
    return;
  }

  if (battle.playerMon.hp === 0) {
    if (hasLivingBenchMon(battle)) {
      queueMessages(battle, messages, 'partySelect', 'Choose a Pokémon.');
      return;
    }
    battle.postResult.outcome = 'lost';
    battle.postResult.whiteout = hasBattleTypeFlag(battle, 'trainer');
    battle.postResult.blackout = !hasBattleTypeFlag(battle, 'trainer');
    queueMessages(battle, messages, 'resolved');
    return;
  }

  if (battle.wildMon.hp === 0) {
    const defeatedOpponentPartyIndex = battle.opponentSide.activePartyIndexes[0] ?? 0;
    if (!battle.defeatedOpponentPartyIndexes.includes(defeatedOpponentPartyIndex)) {
      battle.defeatedOpponentPartyIndexes.push(defeatedOpponentPartyIndex);
      battle.rewardsApplied = false;
    }
    awardBattleExperience(battle, messages);
    if (hasBattleTypeFlag(battle, 'trainer') && hasLivingOpponentBenchMon(battle)) {
      battle.pendingOpponentPartyIndex = getNextLivingOpponentPartyIndex(battle);
      if (
        battle.pendingOpponentPartyIndex !== null
        && battle.battleStyle === 'shift'
        && battle.playerMon.hp > 0
        && hasLivingBenchMon(battle)
      ) {
        const nextOpponentMon = battle.opponentSide.party[battle.pendingOpponentPartyIndex];
        if (nextOpponentMon) {
          battle.selectedShiftPromptIndex = 0;
          queueMessages(
            battle,
            [...messages, ...getShiftPromptMessages(battle, nextOpponentMon)],
            'shiftPrompt',
            getShiftPromptQuestion(battle)
          );
          return;
        }
      }
      if (sendOutPendingOpponent(battle, messages)) {
        return;
      }
    }

    battle.postResult.outcome = 'won';
    battle.postResult.payDayTotal = battle.payDayMoney;
    queueMessages(battle, messages, 'resolved');
    return;
  }

  if (battle.playerMon.volatile.chargingMoveId) {
    queueMessages(battle, messages, 'moveSelect', '');
    return;
  }

  if (battle.playerMon.volatile.rampageMoveId || battle.playerMon.volatile.uproarMoveId) {
    queueMessages(battle, messages, 'moveSelect', '');
    return;
  }

  if (battle.playerMon.volatile.bideTurns > 0) {
    queueMessages(battle, messages, 'moveSelect', '');
    return;
  }

  queueMessages(battle, messages, 'command', getPromptSummary(battle));
};

const hasPendingOpponentSendOut = (battle: BattleState): boolean =>
  battle.pendingOpponentPartyIndex !== null && battle.wildMon.hp === 0;

const executeDoublesMove = (
  battle: BattleState,
  attackerBattlerId: BattleBattlerId,
  move: BattleMove,
  encounterState: BattleEncounterState,
  pendingActors: Set<BattleBattlerId>
): string[] => {
  const attacker = getBattlerSnapshot(battle, attackerBattlerId);
  if (!attacker || attacker.hp <= 0) {
    return [];
  }

  const targets = getDoublesMoveTargets(battle, attackerBattlerId, move, encounterState);
  const attackerSide = getBattlerSide(attackerBattlerId);
  const messages: string[] = [];

  if (targets.length === 0) {
    return messages;
  }

  targets.forEach((targetBattlerId, index) => {
    const target = getBattlerSnapshot(battle, targetBattlerId);
    if (!target || (target.hp <= 0 && targetBattlerId !== attackerBattlerId)) {
      return;
    }

    const defenderCanStillAct = pendingActors.has(targetBattlerId);
    const targetMessages = withTemporaryBattlerPair(
      battle,
      attackerBattlerId,
      targetBattlerId,
      () => executeMove(
        battle,
        attackerSide,
        move,
        encounterState,
	        defenderCanStillAct,
	        index === 0
	          ? { attackerBattlerId, defenderBattlerId: targetBattlerId }
	          : {
	            attackerBattlerId,
	            defenderBattlerId: targetBattlerId,
	            consumePp: false,
	            announce: false,
	            preserveLastMoveUsed: true
	          }
	      )
    );
    messages.push(...targetMessages);
  });

  return messages;
};

const resolveDoublesTurn = (
  battle: BattleState,
  encounterState: BattleEncounterState,
  leadingMessages: string[] = [],
  enemyOnly = false
): void => {
  battle.vm.locals.turnResolver = enemyOnly ? 'enemyOnlyDoubles' : 'selectedMoveDoubles';
  const messages = [...leadingMessages];
  const activeBattlers = getActiveBattlerIds(battle)
    .filter((battlerId) => !enemyOnly || getBattlerSide(battlerId) === 'opponent');
  const battlerMoves = new Map<BattleBattlerId, BattleMove>();

  for (const battlerId of activeBattlers) {
    const pokemon = getBattlerSnapshot(battle, battlerId);
    if (!pokemon || pokemon.hp <= 0) {
      continue;
    }
    if (getBattlerSide(battlerId) === 'opponent' && tryUseOpponentTrainerSwitch(battle, messages, encounterState, battlerId)) {
      continue;
    }
    const move = getBattlerTurnMove(battle, battlerId, encounterState);
    if (move) {
      battlerMoves.set(battlerId, move);
    }
  }

  const order = getDoublesActionOrder(battle, battlerMoves, encounterState);
  battle.vm.locals.turnActionOrder = order.join(',');
  const pendingActors = new Set(order);

  for (const battlerId of order) {
    pendingActors.delete(battlerId);
    const pokemon = getBattlerSnapshot(battle, battlerId);
    const move = battlerMoves.get(battlerId);
    if (!pokemon || !move || pokemon.hp <= 0) {
      continue;
    }

    messages.push(...executeDoublesMove(battle, battlerId, move, encounterState, pendingActors));
    if (battle.moveEndedBattle) {
      queueMessages(battle, messages, 'resolved');
      return;
    }
  }

  if (
    getActiveBattlerIds(battle, 'player').some((battlerId) => getBattlerSnapshot(battle, battlerId)?.hp! > 0)
    && getActiveBattlerIds(battle, 'opponent').some((battlerId) => getBattlerSnapshot(battle, battlerId)?.hp! > 0)
  ) {
    messages.push(...resolveEndOfTurn(battle, encounterState));
  }

  enqueueTurnMessages(battle, messages);
};

const resolveEnemyOnlyTurn = (battle: BattleState, encounterState: BattleEncounterState, leadingMessages: string[]): void => {
  battle.queuedControllerCommands = [];
  if (battle.format === 'doubles') {
    resolveDoublesTurn(battle, encounterState, leadingMessages, true);
    return;
  }
  runEnemyOnlyTurnVm(battle, leadingMessages, {
    getEnemyMove: () => getEnemyTurnMove(battle, encounterState),
    tryUseOpponentTrainerItem: (messages) => tryResolveOpponentTrainerAction(battle, messages, encounterState),
    executeEnemyMove: (move) => executeMove(battle, 'opponent', move, encounterState),
    resolveEndOfTurn: () => resolveEndOfTurn(battle, encounterState),
    enqueueTurnMessages: (messages) => enqueueTurnMessages(battle, messages),
    queueResolvedMessages: (messages) => queueMessages(battle, messages, 'resolved')
  });
};

const sendOutPendingOpponent = (
  battle: BattleState,
  messages: string[],
  resumePhase: Exclude<BattlePhase, 'script'> = 'command',
  resumeSummary = getPromptSummary(battle)
): boolean => {
  const nextIndex = battle.pendingOpponentPartyIndex;
  if (nextIndex === null) {
    return false;
  }

  const nextOpponentMon = battle.opponentSide.party[nextIndex];
  if (!nextOpponentMon || nextOpponentMon.hp <= 0) {
    battle.pendingOpponentPartyIndex = null;
    return false;
  }

  resetBattlePokemonTransientState(nextOpponentMon);
  battle.pendingOpponentPartyIndex = null;
  setActiveBattlePartyMember(battle, 'opponent', nextOpponentMon);
  refreshActiveMovePointers(battle);
  battle.currentScriptLabel = 'BattleScript_TrainerSendOut';
  messages.push(`${battle.opponentSide.name} sent out ${nextOpponentMon.species}!`);
  queueMessages(battle, messages, resumePhase, resumeSummary);
  return true;
};

const resolvePursuitBeforeSwitch = (
  battle: BattleState,
  encounterState: BattleEncounterState,
  messages: string[]
): boolean => {
  const pursuitMove = battle.wildMoves.find((move) => move.effect === 'EFFECT_PURSUIT' && move.ppRemaining > 0);
  if (!pursuitMove || battle.wildMon.hp <= 0 || battle.playerMon.hp <= 0) {
    return false;
  }

  pursuitMove.ppRemaining -= 1;
  messages.push(...executeMove(
    battle,
    'opponent',
    { ...pursuitMove, power: pursuitMove.power * 2 },
    encounterState,
    false,
    { consumePp: false }
  ));
  return battle.playerMon.hp <= 0;
};

const resolvePlayerSwitchTurn = (
  battle: BattleState,
  target: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  voluntary: boolean
): void => {
  const previous = battle.playerMon;
  const messages = voluntary
    ? [`${previous.species}, come back!`]
    : [];

  if (voluntary && resolvePursuitBeforeSwitch(battle, encounterState, messages)) {
    if (!messages.includes(getFaintMessage('player', battle))) {
      messages.push(getFaintMessage('player', battle));
    }
    queueMessages(battle, messages, hasLivingBenchMon(battle) ? 'partySelect' : 'resolved', hasLivingBenchMon(battle) ? 'Choose a Pokémon.' : '');
    return;
  }

  clearSwitchReferences(battle, 'player');
  resetBattlePokemonTransientState(previous);
  resetBattlePokemonTransientState(target);
  setActiveBattlePartyMember(battle, 'player', target);
  refreshActiveMovePointers(battle);
  battle.currentScriptLabel = 'BattleScript_ActionSwitch';

  messages.push(`Go! ${target.species}!`);
  applySpikesSwitchIn(battle, 'player', target, messages);

  if (target.hp <= 0) {
    messages.push(getFaintMessage('player', battle));
    queueMessages(battle, messages, hasLivingBenchMon(battle) ? 'partySelect' : 'resolved', hasLivingBenchMon(battle) ? 'Choose a Pokémon.' : '');
    return;
  }

  // Mirrors battle_main.c::SetActionsAndBattlersTurnOrder: switch actions are
  // ordered before moves, but the opposing battler's move still resolves.
  if (voluntary && battle.wildMon.hp > 0) {
    appendDecompSwitchActionTrace(battle);
    resolveEnemyOnlyTurn(battle, encounterState, messages);
    return;
  }

  if (sendOutPendingOpponent(battle, messages)) {
    return;
  }

  queueMessages(battle, messages, 'command', getPromptSummary(battle));
};

const resolveSelectedMoveTurn = (battle: BattleState, encounterState: BattleEncounterState): void => {
  battle.queuedControllerCommands = [];
  if (battle.format === 'doubles') {
    resolveDoublesTurn(battle, encounterState);
    return;
  }
  runSingleBattleTurnVm(battle, {
    getPlayerMove: () => getPlayerTurnMove(battle),
    getEnemyMove: () => getEnemyTurnMove(battle, encounterState),
    getActionOrder: (playerMove, enemyMove) => getActionOrder(battle, playerMove, enemyMove, encounterState),
    tryUseOpponentTrainerItem: (messages) => tryResolveOpponentTrainerAction(battle, messages, encounterState),
    executeMove: (actor, move, defenderCanStillAct) => executeMove(
      battle,
      actor,
      move,
      encounterState,
      defenderCanStillAct
    ),
    resolveEndOfTurn: () => resolveEndOfTurn(battle, encounterState),
    enqueueTurnMessages: (messages) => enqueueTurnMessages(battle, messages),
    queueResolvedMessages: (messages) => queueMessages(battle, messages, 'resolved')
  });
};

const chooseWildEncounterMon = (
  encounterGroup: WildEncounterGroup,
  encounterState: BattleEncounterState
): BattlePokemonSnapshot => {
  const totalWeight = encounterGroup.mons.reduce((sum, mon) => sum + mon.slotRate, 0);
  let roll = nextEncounterRoll(encounterState, Math.max(1, totalWeight));
  let selectedMon = encounterGroup.mons[0];

  for (const mon of encounterGroup.mons) {
    if (roll < mon.slotRate) {
      selectedMon = mon;
      break;
    }

    roll -= mon.slotRate;
  }

  const minLevel = Math.min(selectedMon.minLevel, selectedMon.maxLevel);
  const maxLevel = Math.max(selectedMon.minLevel, selectedMon.maxLevel);
  const level = minLevel + nextEncounterRoll(encounterState, maxLevel - minLevel + 1);
  return createBattlePokemonFromSpecies(selectedMon.species, level);
};

export const createBattleEncounterState = (seed = 0x4a3b): BattleEncounterState => ({
  stepsSinceLastEncounter: 0,
  encounterRate: 30,
  rngState: seedDecompRng(seed)
});

const createDefaultPlayerBattleParty = (): BattlePokemonSnapshot[] => {
  const playerMonA = createBattlePokemonFromFieldPokemon({
    species: 'CHARMANDER',
    level: 8,
    expProgress: 0.62,
    maxHp: 23,
    hp: 23,
    attack: 13,
    defense: 11,
    speed: 14,
    spAttack: 15,
    spDefense: 12,
    catchRate: 45,
    types: ['fire'],
    status: 'none'
  });
  const playerMonB = createBattlePokemonFromFieldPokemon({
    species: 'PIDGEY',
    level: 7,
    expProgress: 0.34,
    maxHp: 21,
    hp: 21,
    attack: 11,
    defense: 10,
    speed: 13,
    spAttack: 10,
    spDefense: 10,
    catchRate: 255,
    types: ['normal', 'flying'],
    status: 'none'
  });
  return [playerMonA, playerMonB];
};

const createDefaultOpponentBattleParty = (): BattlePokemonSnapshot[] => [
  createBattlePokemonFromSpecies('PIDGEY', 3)
];

const getBattleTypeFlagsForConfig = (config: BattleStartConfig): BattleTypeFlag[] => {
  const mode = config.mode ?? 'wild';
  return Array.from(new Set([
    ...defaultBattleTypeFlagsByMode[mode],
    ...(config.battleTypeFlags ?? [])
  ]));
};

const createBattleStateFromConfig = (config: BattleStartConfig = {}): BattleState => {
  const mode = config.mode ?? 'wild';
  const format = config.format ?? 'singles';
  const controlMode = config.controlMode ?? 'singlePlayer';
  const basePlayerParty = normalizeBattleParty(config.playerParty, createDefaultPlayerBattleParty);
  const partnerParty = normalizeBattleParty(config.partnerParty, () => []);
  const playerParty = (
    format === 'doubles'
    && controlMode === 'partner'
    && partnerParty.length > 0
  )
    ? [...basePlayerParty, ...partnerParty]
    : basePlayerParty;
  const opponentParty = normalizeBattleParty(config.opponentParty, createDefaultOpponentBattleParty);
  let activePlayerPartyIndexes = getConfiguredActivePartyIndexes(config, 'player', playerParty, config.activePlayerPartyIndex, format);
  if (format === 'doubles' && controlMode === 'partner' && partnerParty.length > 0) {
    const partnerOffset = basePlayerParty.length;
    const configuredPartnerBattler = (config.activeBattlers ?? []).find((battler) =>
      battler.battlerId === 2
      && battler.active
      && !battler.absent
      && battler.partyIndex !== null
    );
    const configuredPartnerIndex = configuredPartnerBattler
      ? Math.min(playerParty.length - 1, partnerOffset + (configuredPartnerBattler.partyIndex ?? 0))
      : partnerOffset;
    activePlayerPartyIndexes = normalizeActivePartyIndexes(
      playerParty,
      [activePlayerPartyIndexes[0] ?? 0, configuredPartnerIndex],
      format
    );
  }
  const activeOpponentPartyIndexes = getConfiguredActivePartyIndexes(config, 'opponent', opponentParty, config.activeOpponentPartyIndex, format);
  const activePlayerPartyIndex = activePlayerPartyIndexes[0]!;
  const activeOpponentPartyIndex = activeOpponentPartyIndexes[0]!;
  const battleTypeFlags = getBattleTypeFlagsForConfig(config);
  const playerMon = playerParty[activePlayerPartyIndex]!;
  const opponentMon = opponentParty[activeOpponentPartyIndex]!;

  const battle: BattleState = {
    active: false,
    phase: 'intro',
    mode,
    format,
    controlMode,
    terrain: config.terrain ?? 'BATTLE_TERRAIN_GRASS',
    mapBattleScene: config.mapBattleScene ?? DEFAULT_BATTLE_SCENE,
    battleStyle: config.battleStyle ?? 'shift',
    playerSide: {
      name: config.playerName ?? 'PLAYER',
      trainerId: null,
      party: playerParty,
      activePartyIndexes: activePlayerPartyIndexes
    },
    partnerParty,
    opponentSide: {
      name: config.opponentName ?? (mode === 'wild' ? 'Wild Pokémon' : 'Opponent'),
      trainerId: config.trainerId ?? null,
      party: opponentParty,
      activePartyIndexes: activeOpponentPartyIndexes
    },
    opponentTrainerItems: [...(config.opponentTrainerItems ?? [])],
    opponentTrainerAiFlags: [...(config.opponentTrainerAiFlags ?? [])],
    playerParticipantPartyIndexes: [...activePlayerPartyIndexes],
    defeatedOpponentPartyIndexes: [],
    rewardedOpponentPartyIndexes: [],
    rewardsApplied: false,
    battlers: createBattlerRuntimeState(activePlayerPartyIndexes, activeOpponentPartyIndexes, format),
    moveMemory: createBattleMoveMemory(),
    playerMon,
    party: playerParty,
    wildMon: opponentMon,
    moves: playerMon.moves,
    wildMoves: opponentMon.moves,
    sideState: {
      player: createSideState(),
      opponent: createSideState()
    },
    battleTypeFlags,
    safariBalls: config.safariBalls ?? 30,
    safariCatchFactor: getInitialSafariCatchFactor(opponentMon),
    safariEscapeFactor: getInitialSafariEscapeFactor(opponentMon),
    safariRockThrowCounter: 0,
    safariBaitThrowCounter: 0,
    weather: 'none',
    weatherTurns: 0,
    mudSport: false,
    waterSport: false,
    payDayMoney: 0,
    selectedMoveIndex: 0,
    selectedCommandIndex: 0,
    selectedShiftPromptIndex: 0,
    commands: [...NORMAL_BATTLE_COMMANDS],
    selectedPartyIndex: 0,
    selectedBagIndex: 0,
    lastBattleItemId: null,
    turnSummary: '',
    damagePreview: null,
    runAttempts: 0,
    battleTurnCounter: 0,
    pendingOpponentPartyIndex: null,
    caughtSpeciesIds: [...(config.caughtSpeciesIds ?? [])],
    bag: {
      pokeBalls: 5,
      greatBalls: 1
    },
    caughtMon: null,
    moveEndedBattle: false,
    queuedMessages: [],
    queuedControllerCommands: [],
    battleTrace: [],
    currentScriptLabel: null,
    vm: createBattleVmState(),
    postResult: createBattlePostResult(),
    resumePhase: 'command',
    resumeSummary: ''
  };

  installBattleCompatibilityViews(battle);
  refreshActiveMovePointers(battle);
  refreshBattleCommandsForType(battle);
  appendBattleTraceEvent(battle, {
    type: 'init',
    text: `${battle.playerSide.name} vs ${battle.opponentSide.name}`
  });

  return battle;
};

export const createBattleState = (config: BattleStartConfig = {}): BattleState =>
  createBattleStateFromConfig(config);

export const configureBattleState = (battle: BattleState, config: BattleStartConfig = {}): BattleState => {
  const nextBattle = createBattleStateFromConfig({
    battleStyle: battle.battleStyle,
    format: battle.format,
    controlMode: battle.controlMode,
    opponentTrainerItems: battle.opponentTrainerItems,
    opponentTrainerAiFlags: battle.opponentTrainerAiFlags,
    playerParty: battle.playerSide.party,
    partnerParty: battle.partnerParty,
    activeBattlers: battle.battlers,
    playerName: battle.playerSide.name,
    ...config
  });

  Object.assign(battle, nextBattle);
  return battle;
};

export const startConfiguredBattle = (battle: BattleState, config: BattleStartConfig = {}): BattleState => {
  allocateBattleResources(battle);
  configureBattleState(battle, config);
  battle.active = true;
  battle.phase = 'intro';
  battle.turnSummary = '';
  battle.currentScriptLabel = config.mode === 'wild' || !config.mode
    ? 'BattleIntroPrintWildMonAttacked'
    : 'BattleScript_TrainerEncounter';
  appendBattleTraceEvent(battle, {
    type: 'phase',
    text: 'intro'
  });
  return battle;
};

export const applyBattleRewards = (battle: BattleState): void => {
  awardBattleExperience(battle);
};

export const getBattlePostResult = (battle: BattleState): BattlePostResult =>
  cloneBattlePostResult(battle.postResult);

export const clearBattlePostResult = (battle: BattleState): void => {
  resetBattlePostResult(battle.postResult);
};

export const dismissResolvedBattle = (
  battle: BattleState,
  options: {
    preservePostResult?: boolean;
    preserveCaughtMon?: boolean;
  } = {}
): void => {
  freeBattleResources(battle);
  const preservedCaughtMon = options.preserveCaughtMon && battle.caughtMon
    ? cloneBattlePokemon(battle.caughtMon)
    : null;
  const preservedPostResult = options.preservePostResult
    ? cloneBattlePostResult(battle.postResult)
    : null;

  battle.active = false;
  battle.phase = 'intro';
  battle.turnSummary = '';
  battle.damagePreview = null;
  battle.caughtMon = null;
  battle.moveEndedBattle = false;
  battle.pendingOpponentPartyIndex = null;
  battle.rewardsApplied = false;
  battle.playerParticipantPartyIndexes = [];
  battle.defeatedOpponentPartyIndexes = [];
  battle.rewardedOpponentPartyIndexes = [];
  battle.selectedShiftPromptIndex = 0;
  battle.queuedMessages = [];
  battle.queuedControllerCommands = [];
  battle.currentScriptLabel = null;
  battle.moveMemory = createBattleMoveMemory();
  resetBattleVmState(battle.vm);
  resetBattlePostResult(battle.postResult);
  battle.sideState = {
    player: createSideState(),
    opponent: createSideState()
  };
  battle.battleTypeFlags = [];
  battle.safariBalls = 30;
  battle.safariCatchFactor = getInitialSafariCatchFactor(battle.wildMon);
  battle.safariEscapeFactor = getInitialSafariEscapeFactor(battle.wildMon);
  battle.safariRockThrowCounter = 0;
  battle.safariBaitThrowCounter = 0;
  battle.weather = 'none';
  battle.weatherTurns = 0;
  battle.mudSport = false;
  battle.waterSport = false;
  battle.payDayMoney = 0;
  battle.battleTurnCounter = 0;
  battle.caughtSpeciesIds = [];
  for (const partyMember of battle.party) {
    resetBattlePokemonTransientState(partyMember);
  }
  resetBattlePokemonTransientState(battle.wildMon);

  if (preservedCaughtMon) {
    battle.caughtMon = preservedCaughtMon;
  }

  if (preservedPostResult) {
    battle.postResult = preservedPostResult;
  }
};

export const startTrainerBattle = (battle: BattleState, config: BattleStartConfig = {}): BattleState => {
  startConfiguredBattle(battle, {
    ...config,
    mode: 'trainer'
  });
  battle.currentScriptLabel = 'BattleScript_TrainerEncounter';
  queueMessages(
    battle,
    [
      `${battle.opponentSide.name} wants to battle!`,
      `${battle.opponentSide.name} sent out ${battle.wildMon.species}!`,
      `Go! ${battle.playerMon.species}!`
    ],
    'command',
    getPromptSummary(battle)
  );
  return battle;
};

export const tryStartWildBattle = (
  battle: BattleState,
  encounter: BattleEncounterState,
  playerMoved: boolean,
  canEncounter: boolean,
  encounterGroup?: WildEncounterGroup,
  mapBattleScene = DEFAULT_BATTLE_SCENE,
  mapId?: string,
  battleConfig?: WildBattleStartConfig
): boolean => {
  if (!playerMoved || battle.active || !canEncounter || !encounterGroup) {
    return false;
  }

  encounter.encounterRate = encounterGroup.encounterRate;

  if (!shouldStartWildEncounter(encounter)) {
    return false;
  }

  const wildMon = chooseWildEncounterMon(encounterGroup, encounter);
  const encounterKind = battleConfig?.encounterKind ?? 'land';
  const terrain = getBattleTerrainForScene(mapBattleScene, { mapId, encounterKind });
  startConfiguredBattle(battle, {
    mode: battleConfig?.mode ?? 'wild',
    mapBattleScene,
    terrain,
    opponentName: 'Wild Pokémon',
    opponentParty: [wildMon],
    activeOpponentPartyIndex: 0,
    battleTypeFlags: battleConfig?.battleTypeFlags ?? [],
    safariBalls: battleConfig?.safariBalls
  });
  battle.wildMon.hp = battle.wildMon.maxHp;
  battle.wildMon.status = 'none';
  resetBattlePokemonTransientState(battle.wildMon);
  for (const partyMember of battle.party) {
    resetBattlePokemonTransientState(partyMember);
  }
  refreshActiveMovePointers(battle);
  queueMessages(
    battle,
    [`Wild ${battle.wildMon.species} appeared!`, `Go! ${battle.playerMon.species}!`],
    'command',
    getPromptSummary(battle)
  );
  encounter.stepsSinceLastEncounter = 0;
  return true;
};

export const isBattleBlockingWorld = (battle: BattleState): boolean => battle.active;

const isBattleBallItemId = (itemId: string): itemId is BattleBallItemId =>
  battleBallItemIdSet.has(itemId);

const getFallbackBattleBallQuantity = (battle: BattleState, itemId: BattleBallItemId): number => {
  switch (itemId) {
    case 'ITEM_POKE_BALL':
      return battle.bag.pokeBalls;
    case 'ITEM_GREAT_BALL':
      return battle.bag.greatBalls;
    case 'ITEM_SAFARI_BALL':
      return battle.safariBalls;
    default:
      return 0;
  }
};

const setFallbackBattleBallQuantity = (battle: BattleState, itemId: BattleBallItemId, quantity: number): void => {
  switch (itemId) {
    case 'ITEM_POKE_BALL':
      battle.bag.pokeBalls = quantity;
      break;
    case 'ITEM_GREAT_BALL':
      battle.bag.greatBalls = quantity;
      break;
    case 'ITEM_SAFARI_BALL':
      battle.safariBalls = quantity;
      break;
  }
};

const getBattleBallQuantity = (battle: BattleState, itemId: BattleBallItemId, bag?: BagState): number =>
  bag ? getBagQuantity(bag, itemId) : getFallbackBattleBallQuantity(battle, itemId);

const consumeBattleBall = (battle: BattleState, itemId: BattleBallItemId, bag?: BagState): boolean => {
  if (bag) {
    if (!removeBagItem(bag, itemId, 1)) {
      return false;
    }
    syncBattleBagSnapshot(battle, bag);
    return true;
  }

  const quantity = getFallbackBattleBallQuantity(battle, itemId);
  if (quantity <= 0) {
    return false;
  }
  setFallbackBattleBallQuantity(battle, itemId, quantity - 1);
  return true;
};

const getBattleBallLabel = (itemId: BattleBallItemId): string =>
  getItemDefinition(itemId).name;

const getSafariReactionMessage = (battle: BattleState): string => {
  if (battle.safariRockThrowCounter !== 0) {
    battle.safariRockThrowCounter -= 1;
    if (battle.safariRockThrowCounter === 0) {
      battle.safariCatchFactor = getInitialSafariCatchFactor(battle.wildMon);
      return `${battle.wildMon.species} is watching carefully!`;
    }
    return `${battle.wildMon.species} is angry!`;
  }

  if (battle.safariBaitThrowCounter !== 0) {
    battle.safariBaitThrowCounter -= 1;
    return battle.safariBaitThrowCounter === 0
      ? `${battle.wildMon.species} is watching carefully!`
      : `${battle.wildMon.species} is eating!`;
  }

  return `${battle.wildMon.species} is watching carefully!`;
};

const shouldSafariMonFlee = (battle: BattleState, encounterState: BattleEncounterState): boolean => {
  let safariFleeRate = battle.safariEscapeFactor;
  if (battle.safariRockThrowCounter !== 0) {
    safariFleeRate = Math.min(20, battle.safariEscapeFactor * 2);
  } else if (battle.safariBaitThrowCounter !== 0) {
    safariFleeRate = Math.floor(battle.safariEscapeFactor / 4);
    if (safariFleeRate === 0) {
      safariFleeRate = 1;
    }
  }

  safariFleeRate *= 5;
  return (nextBattleRng(encounterState) % 100) < safariFleeRate;
};

const resolveSafariOpponentAction = (
  battle: BattleState,
  encounterState: BattleEncounterState,
  leadingMessages: string[]
): void => {
  if (shouldSafariMonFlee(battle, encounterState)) {
    battle.currentScriptLabel = 'BattleScript_PrintMonFledFromBattle';
    battle.postResult.outcome = 'escaped';
    queueMessages(battle, [...leadingMessages, `Wild ${battle.wildMon.species} fled!`], 'resolved');
    return;
  }

  battle.currentScriptLabel = 'BattleScript_WatchesCarefully';
  queueMessages(battle, [...leadingMessages, getSafariReactionMessage(battle)], 'command', getPromptSummary(battle));
};

const handleSafariBallThrow = (
  battle: BattleState,
  encounterState: BattleEncounterState
): void => {
  battle.currentScriptLabel = 'BattleScript_ThrowSafariBall';
  if (battle.safariBalls <= 0) {
    queueMessages(battle, ["ANNOUNCER: You're out of SAFARI BALLS! Game over!"], 'resolved');
    return;
  }

  const capture = performCaptureAttempt(battle, encounterState, undefined, 'ITEM_SAFARI_BALL');
  if (capture.ballLabel === 'NONE') {
    queueMessages(battle, ["ANNOUNCER: You're out of SAFARI BALLS! Game over!"], 'resolved');
    return;
  }

  const leadingMessages = [`${capture.ballLabel} thrown!`];
  if (capture.caught) {
    battle.caughtMon = cloneBattlePokemon(battle.wildMon);
    battle.postResult.outcome = 'caught';
    battle.postResult.caughtSpecies = battle.wildMon.species;
    battle.postResult.caughtPokemon = {
      species: battle.wildMon.species,
      level: battle.wildMon.level
    };
    if (!battle.caughtSpeciesIds.includes(battle.wildMon.species)) {
      battle.caughtSpeciesIds.push(battle.wildMon.species);
    }
    queueMessages(battle, [...leadingMessages, `Gotcha! ${battle.wildMon.species} was caught!`], 'resolved');
    return;
  }

  leadingMessages.push(getBallEscapeMessage(capture.shakes));
  if (battle.safariBalls === 0) {
    queueMessages(battle, [...leadingMessages, "ANNOUNCER: You're out of SAFARI BALLS! Game over!"], 'resolved');
    return;
  }

  resolveSafariOpponentAction(battle, encounterState, leadingMessages);
};

const handleSafariBaitThrow = (
  battle: BattleState,
  encounterState: BattleEncounterState
): void => {
  battle.currentScriptLabel = 'BattleScript_ThrowBait';
  battle.safariBaitThrowCounter += (nextBattleRng(encounterState) % 5) + 2;
  if (battle.safariBaitThrowCounter > 6) {
    battle.safariBaitThrowCounter = 6;
  }
  battle.safariRockThrowCounter = 0;
  battle.safariCatchFactor >>= 1;
  if (battle.safariCatchFactor <= 2) {
    battle.safariCatchFactor = 3;
  }
  resolveSafariOpponentAction(
    battle,
    encounterState,
    [`You threw some BAIT at the ${battle.wildMon.species}!`]
  );
};

const handleSafariRockThrow = (
  battle: BattleState,
  encounterState: BattleEncounterState
): void => {
  battle.currentScriptLabel = 'BattleScript_ThrowRock';
  battle.safariRockThrowCounter += (nextBattleRng(encounterState) % 5) + 2;
  if (battle.safariRockThrowCounter > 6) {
    battle.safariRockThrowCounter = 6;
  }
  battle.safariBaitThrowCounter = 0;
  battle.safariCatchFactor <<= 1;
  if (battle.safariCatchFactor > 20) {
    battle.safariCatchFactor = 20;
  }
  resolveSafariOpponentAction(
    battle,
    encounterState,
    [`You threw a ROCK at the ${battle.wildMon.species}!`]
  );
};

export const getBallEscapeMessage = (shakes: number): string => {
  switch (shakes) {
    case 0:
      return 'Oh, no! The POKéMON broke free!';
    case 1:
      return 'Aww! It appeared to be caught!';
    case 2:
      return 'Aargh! Almost had it!';
    default:
      return 'Shoot! It was so close, too!';
  }
};

export const getBallCatchMultiplierTenths = (
  itemId: BattleBallItemId,
  target: BattlePokemonSnapshot,
  context: {
    battleTurnCounter?: number;
    caughtSpeciesIds?: string[];
    safariCatchFactor?: number;
    terrain?: DecompBattleTerrainId;
  } = {}
): number => {
  switch (itemId) {
    case 'ITEM_ULTRA_BALL':
      return 20;
    case 'ITEM_GREAT_BALL':
    case 'ITEM_SAFARI_BALL':
      return 15;
    case 'ITEM_NET_BALL':
      return target.types.some((type) => type === 'water' || type === 'bug') ? 30 : 10;
    case 'ITEM_DIVE_BALL':
      return context.terrain === 'BATTLE_TERRAIN_UNDERWATER' ? 35 : 10;
    case 'ITEM_NEST_BALL':
      return target.level < 40 ? Math.max(10, 40 - target.level) : 10;
    case 'ITEM_REPEAT_BALL':
      return context.caughtSpeciesIds?.includes(target.species) ? 30 : 10;
    case 'ITEM_TIMER_BALL':
      return Math.min(40, (context.battleTurnCounter ?? 0) + 10);
    case 'ITEM_POKE_BALL':
    case 'ITEM_LUXURY_BALL':
    case 'ITEM_PREMIER_BALL':
    case 'ITEM_MASTER_BALL':
      return 10;
  }
};

export const calculateCaptureOdds = (
  target: BattlePokemonSnapshot,
  itemId: BattleBallItemId,
  context: {
    battleTurnCounter?: number;
    caughtSpeciesIds?: string[];
    safariCatchFactor?: number;
    terrain?: DecompBattleTerrainId;
  } = {}
): number => {
  if (itemId === 'ITEM_MASTER_BALL') {
    return 255;
  }

  const maxHp = Math.max(1, target.maxHp);
  const hp = Math.max(1, Math.min(target.hp, maxHp));
  const hpFactor = (3 * maxHp) - (2 * hp);
  const catchRate = itemId === 'ITEM_SAFARI_BALL'
    ? Math.floor(((context.safariCatchFactor ?? getInitialSafariCatchFactor(target)) * 1275) / 100)
    : target.catchRate;
  const ballMultiplier = getBallCatchMultiplierTenths(itemId, target, context);
  let odds = Math.floor((catchRate * ballMultiplier) / 10);
  odds = Math.floor((odds * hpFactor) / (3 * maxHp));

  const statusMultiplier = getStatusCaptureMultiplierTenths(target.status);
  if (statusMultiplier !== 10) {
    odds = Math.floor((odds * statusMultiplier) / 10);
  }

  return odds;
};

const calculateShakeThreshold = (captureOdds: number): number => {
  const clampedOdds = Math.max(1, captureOdds);
  const firstRoot = Math.floor(Math.sqrt(Math.floor(16711680 / clampedOdds)));
  const secondRoot = Math.floor(Math.sqrt(firstRoot));
  return secondRoot > 0 ? Math.floor(1048560 / secondRoot) : 0xffff;
};

const getFirstBattleBallChoice = (battle: BattleState, bag?: BagState): BattleBagChoice | null =>
  getBattleBagChoices(battle, bag).find((choice) =>
    !choice.isExit
    && choice.itemId
    && isBattleBallItemId(choice.itemId)
    && (choice.quantity ?? 0) > 0
  ) ?? null;

const hasBattleTypeFlag = (battle: BattleState, flag: BattleTypeFlag): boolean =>
  battle.battleTypeFlags.includes(flag);

const getBattleCommandsForType = (battle: BattleState): BattleCommand[] =>
  hasBattleTypeFlag(battle, 'safari') ? SAFARI_BATTLE_COMMANDS : NORMAL_BATTLE_COMMANDS;

const refreshBattleCommandsForType = (battle: BattleState): void => {
  const expectedCommands = getBattleCommandsForType(battle);
  if (battle.commands.length === expectedCommands.length && battle.commands.every((command, index) => command === expectedCommands[index])) {
    return;
  }

  battle.commands = [...expectedCommands];
  battle.selectedCommandIndex = Math.max(0, Math.min(battle.selectedCommandIndex, battle.commands.length - 1));
};

export const getBattleCommandLabel = (command: BattleCommand): string => {
  switch (command) {
    case 'fight':
      return 'FIGHT';
    case 'bag':
      return 'BAG';
    case 'pokemon':
      return 'POKéMON';
    case 'run':
      return 'RUN';
    case 'safariBall':
      return 'BALL';
    case 'safariBait':
      return 'BAIT';
    case 'safariRock':
      return 'ROCK';
  }
};

export const performCaptureAttempt = (
  battle: BattleState,
  encounterState: BattleEncounterState,
  bag?: BagState,
  preferredItemId?: BattleBallItemId
): CaptureResult => {
  const fallbackItemId = getFirstBattleBallChoice(battle, bag)?.itemId ?? null;
  const selectedItemId = preferredItemId ?? (fallbackItemId && isBattleBallItemId(fallbackItemId) ? fallbackItemId : null);
  if (!selectedItemId || getBattleBallQuantity(battle, selectedItemId, bag) <= 0) {
    return {
      caught: false,
      shakes: 0,
      ballLabel: 'NONE',
      usedItemId: null,
      blockedReason: null,
      tutorialCatch: false
    };
  }

  const ballLabel = getBattleBallLabel(selectedItemId);
  if (hasBattleTypeFlag(battle, 'ghost')) {
    return {
      caught: false,
      shakes: 0,
      ballLabel,
      usedItemId: selectedItemId,
      blockedReason: 'ghost',
      tutorialCatch: false
    };
  }

  if (hasBattleTypeFlag(battle, 'trainer')) {
    return {
      caught: false,
      shakes: 0,
      ballLabel,
      usedItemId: selectedItemId,
      blockedReason: 'trainer',
      tutorialCatch: false
    };
  }

  if (hasBattleTypeFlag(battle, 'oldManTutorial') || hasBattleTypeFlag(battle, 'pokedude')) {
    return {
      caught: true,
      shakes: 4,
      ballLabel,
      usedItemId: selectedItemId,
      blockedReason: null,
      tutorialCatch: true
    };
  }

  if (!consumeBattleBall(battle, selectedItemId, bag)) {
    return {
      caught: false,
      shakes: 0,
      ballLabel: 'NONE',
      usedItemId: null,
      blockedReason: null,
      tutorialCatch: false
    };
  }

  const captureOdds = calculateCaptureOdds(battle.wildMon, selectedItemId, {
    battleTurnCounter: battle.battleTurnCounter,
    caughtSpeciesIds: battle.caughtSpeciesIds,
    safariCatchFactor: battle.safariCatchFactor,
    terrain: battle.terrain
  });
  if (captureOdds > 254) {
    return {
      caught: true,
      shakes: 4,
      ballLabel,
      usedItemId: selectedItemId,
      blockedReason: null,
      tutorialCatch: false
    };
  }

  const shakeThreshold = calculateShakeThreshold(captureOdds);

  let shakes = 0;
  for (let i = 0; i < 4; i += 1) {
    const shakeRoll = nextBattleRng(encounterState) & 0xffff;
    if (shakeRoll < shakeThreshold) {
      shakes += 1;
      continue;
    }

    break;
  }

  return {
    caught: shakes === 4,
    shakes,
    ballLabel,
    usedItemId: selectedItemId,
    blockedReason: null,
    tutorialCatch: false
  };
};

const syncBattleBagSnapshot = (battle: BattleState, bag?: BagState): void => {
  if (!bag) {
    return;
  }

  battle.bag.pokeBalls = getBagQuantity(bag, 'ITEM_POKE_BALL');
  battle.bag.greatBalls = getBagQuantity(bag, 'ITEM_GREAT_BALL');
};

export const getBattleBagChoices = (battle: BattleState, bag?: BagState): BattleBagChoice[] => {
  const choices = bag
    ? getBattleUsableBagEntries(bag).map((slot): BattleBagChoice => ({
      itemId: slot.itemId,
      label: getItemDefinition(slot.itemId).name,
      quantity: slot.quantity,
      isExit: false
    }))
    : (['ITEM_POKE_BALL', 'ITEM_GREAT_BALL'] as BattleBallItemId[])
      .filter((itemId) => getFallbackBattleBallQuantity(battle, itemId) > 0)
      .map((itemId): BattleBagChoice => ({
        itemId,
        label: getBattleBallLabel(itemId),
        quantity: getBattleBallQuantity(battle, itemId),
        isExit: false
      }));

  choices.push({ itemId: null, label: 'CANCEL', quantity: null, isExit: true });
  return choices;
};

const updateMovePreview = (battle: BattleState): void => {
  battle.damagePreview = battle.moves[battle.selectedMoveIndex]
    ? calculateDamagePreview(battle.playerMon, battle.wildMon, battle.moves[battle.selectedMoveIndex])
    : null;
};

const stepCyclicSelection = (currentIndex: number, size: number, direction: -1 | 1): number => {
  if (size <= 0) {
    return 0;
  }

  return (currentIndex + direction + size) % size;
};

export const stepBattle = (
  battle: BattleState,
  input: InputSnapshot,
  encounterState: BattleEncounterState = createBattleEncounterState(),
  bag?: BagState
): void => {
  syncBattleBagSnapshot(battle, bag);

  if (!battle.active) {
    return;
  }

  refreshBattleCommandsForType(battle);

  if (battle.phase === 'script') {
    if (input.interactPressed || input.startPressed || input.cancelPressed) {
      advanceQueuedMessages(battle);
      if (battle.phase !== 'script') {
        refreshActiveMovePointers(battle);
      }
    }
    return;
  }

  if (battle.phase === 'resolved') {
    if (input.interactPressed || input.cancelPressed || input.startPressed) {
      dismissResolvedBattle(battle, {
        preserveCaughtMon: true,
        preservePostResult: true
      });
    }
    return;
  }

  if (battle.phase === 'shiftPrompt') {
    if (input.upPressed || input.leftPressed || input.downPressed || input.rightPressed) {
      battle.selectedShiftPromptIndex = battle.selectedShiftPromptIndex === 0 ? 1 : 0;
    }

    if (input.cancelPressed || (input.interactPressed && battle.selectedShiftPromptIndex === 1)) {
      if (sendOutPendingOpponent(battle, [])) {
        return;
      }
      battle.phase = 'command';
      battle.turnSummary = getPromptSummary(battle);
      return;
    }

    if (input.interactPressed) {
      battle.phase = 'partySelect';
      battle.turnSummary = 'Choose a Pokémon.';
    }
    return;
  }

  if (battle.phase === 'command') {
    if (input.upPressed || input.leftPressed) {
      battle.selectedCommandIndex = stepCyclicSelection(battle.selectedCommandIndex, battle.commands.length, -1);
    } else if (input.downPressed || input.rightPressed) {
      battle.selectedCommandIndex = stepCyclicSelection(battle.selectedCommandIndex, battle.commands.length, 1);
    }

    if (!input.interactPressed) {
      return;
    }

    const selectedCommand = battle.commands[battle.selectedCommandIndex];
    if (selectedCommand === 'safariBall') {
      handleSafariBallThrow(battle, encounterState);
      return;
    }

    if (selectedCommand === 'safariBait') {
      handleSafariBaitThrow(battle, encounterState);
      return;
    }

    if (selectedCommand === 'safariRock') {
      handleSafariRockThrow(battle, encounterState);
      return;
    }

    if (selectedCommand === 'fight') {
      battle.phase = 'moveSelect';
      battle.turnSummary = 'Choose a move.';
      updateMovePreview(battle);
      return;
    }

    if (selectedCommand === 'bag') {
      if (!getBattleBagChoices(battle, bag).some((choice) => !choice.isExit)) {
        battle.turnSummary = 'No balls left!';
        return;
      }

      battle.phase = 'bagSelect';
      battle.selectedBagIndex = 0;
      battle.turnSummary = 'Choose an item.';
      return;
    }

    if (selectedCommand === 'pokemon') {
      if (isSwitchPreventedByOpponent(battle.playerMon, battle.wildMon)) {
        battle.turnSummary = "Can't switch out!";
        return;
      }
      battle.phase = 'partySelect';
      battle.turnSummary = 'Choose a Pokémon.';
      return;
    }

    if (hasBattleTypeFlag(battle, 'safari')) {
      battle.currentScriptLabel = 'BattleScript_SafariZoneRun';
      queueMessages(battle, ['Got away safely!'], 'resolved');
      return;
    }

    if (isRunPrevented(battle.playerMon, battle.wildMon)) {
      battle.currentScriptLabel = 'BattleScript_PrintFailedToRunString';
      battle.runAttempts += 1;
      resolveEnemyOnlyTurn(battle, encounterState, ["Can't escape!"]);
      return;
    }

    const escaped = tryRunFromBattle(battle.playerMon, battle.wildMon, battle.runAttempts, encounterState);
    battle.runAttempts += 1;
    if (escaped) {
      appendDecompControllerActionTrace(battle);
      battle.currentScriptLabel = 'BattleScript_GotAwaySafely';
      battle.postResult.outcome = 'escaped';
      queueMessages(battle, ['Got away safely!'], 'resolved');
    } else {
      battle.currentScriptLabel = 'BattleScript_PrintFailedToRunString';
      resolveEnemyOnlyTurn(battle, encounterState, ["Can't escape!"]);
    }
    return;
  }

  if (battle.phase === 'bagSelect') {
    const choices = getBattleBagChoices(battle, bag);

    if (input.upPressed || input.leftPressed) {
      battle.selectedBagIndex = stepCyclicSelection(battle.selectedBagIndex, choices.length, -1);
      return;
    }
    if (input.downPressed || input.rightPressed) {
      battle.selectedBagIndex = stepCyclicSelection(battle.selectedBagIndex, choices.length, 1);
      return;
    }

    if (input.cancelPressed) {
      battle.phase = 'command';
      battle.turnSummary = getPromptSummary(battle);
      return;
    }

    if (!input.interactPressed) {
      return;
    }

    const selectedChoice = choices[battle.selectedBagIndex];
    if (!selectedChoice || selectedChoice.isExit || !selectedChoice.itemId) {
      battle.phase = 'command';
      battle.turnSummary = getPromptSummary(battle);
      return;
    }

    if (!isBattleBallItemId(selectedChoice.itemId)) {
      battle.lastBattleItemId = selectedChoice.itemId;
      battle.currentScriptLabel = 'BattleScript_ItemUseHandoff';
      battle.phase = 'script';
      battle.turnSummary = `${selectedChoice.label} was selected.`;
      queueMessages(battle, [`${selectedChoice.label} was selected.`], 'command', getPromptSummary(battle));
      return;
    }

    const capture = performCaptureAttempt(battle, encounterState, bag, selectedChoice.itemId);
    if (capture.ballLabel === 'NONE') {
      battle.phase = 'command';
      battle.turnSummary = 'No balls left!';
      return;
    }

    battle.currentScriptLabel = 'BattleScript_ThrowBall';
    if (capture.blockedReason === 'ghost') {
      battle.currentScriptLabel = 'BattleScript_GhostBallDodge';
      resolveEnemyOnlyTurn(
        battle,
        encounterState,
        [`${capture.ballLabel} thrown!`, "It dodged the thrown BALL! This POKéMON can't be caught!"]
      );
      return;
    }

    if (capture.blockedReason === 'trainer') {
      battle.currentScriptLabel = 'BattleScript_TrainerBallBlock';
      resolveEnemyOnlyTurn(
        battle,
        encounterState,
        [`${capture.ballLabel} thrown!`, 'The TRAINER blocked the BALL!', "Don't be a thief!"]
      );
      return;
    }

    if (capture.caught) {
      if (capture.tutorialCatch) {
        battle.currentScriptLabel = 'BattleScript_OldMan_Pokedude_CaughtMessage';
        battle.postResult.outcome = 'caught';
        battle.postResult.caughtSpecies = battle.wildMon.species;
        battle.postResult.caughtPokemon = {
          species: battle.wildMon.species,
          level: battle.wildMon.level
        };
        queueMessages(
          battle,
          [`${capture.ballLabel} thrown!`, `Gotcha! ${battle.wildMon.species} was caught!`],
          'resolved'
        );
        return;
      }

      battle.caughtMon = cloneBattlePokemon(battle.wildMon);
      battle.postResult.outcome = 'caught';
      battle.postResult.caughtSpecies = battle.wildMon.species;
      battle.postResult.caughtPokemon = {
        species: battle.wildMon.species,
        level: battle.wildMon.level
      };
      if (!battle.caughtSpeciesIds.includes(battle.wildMon.species)) {
        battle.caughtSpeciesIds.push(battle.wildMon.species);
      }
      queueMessages(
        battle,
        [`${capture.ballLabel} thrown!`, `Gotcha! ${battle.wildMon.species} was caught!`],
        'resolved'
      );
    } else {
      resolveEnemyOnlyTurn(
        battle,
        encounterState,
        [`${capture.ballLabel} thrown!`, getBallEscapeMessage(capture.shakes)]
      );
    }
    return;
  }

  if (battle.phase === 'partySelect') {
    if (
      battle.playerMon.hp > 0
      && !hasPendingOpponentSendOut(battle)
      && isSwitchPreventedByOpponent(battle.playerMon, battle.wildMon)
    ) {
      battle.phase = 'command';
      battle.turnSummary = "Can't switch out!";
      return;
    }

    if (input.upPressed || input.leftPressed) {
      battle.selectedPartyIndex = stepCyclicSelection(battle.selectedPartyIndex, battle.party.length, -1);
    } else if (input.downPressed || input.rightPressed) {
      battle.selectedPartyIndex = stepCyclicSelection(battle.selectedPartyIndex, battle.party.length, 1);
    }

    if (input.cancelPressed && battle.playerMon.hp > 0) {
      if (hasPendingOpponentSendOut(battle)) {
        battle.phase = 'shiftPrompt';
        battle.turnSummary = getShiftPromptQuestion(battle);
        return;
      }

      battle.phase = 'command';
      battle.turnSummary = getPromptSummary(battle);
      return;
    }

    if (!input.interactPressed) {
      return;
    }

    const target = battle.party[battle.selectedPartyIndex];
    if (!target || target.hp <= 0) {
      battle.turnSummary = "That Pokémon can't battle!";
      return;
    }

    if (target === battle.playerMon) {
      battle.turnSummary = `${target.species} is already in battle!`;
      return;
    }

    resolvePlayerSwitchTurn(battle, target, encounterState, battle.playerMon.hp > 0);
    return;
  }

  if (input.cancelPressed) {
    battle.phase = 'command';
    battle.turnSummary = getPromptSummary(battle);
    updateMovePreview(battle);
    return;
  }

  if (input.upPressed || input.leftPressed) {
    battle.selectedMoveIndex = stepCyclicSelection(battle.selectedMoveIndex, battle.moves.length, -1);
    updateMovePreview(battle);
  } else if (input.downPressed || input.rightPressed) {
    battle.selectedMoveIndex = stepCyclicSelection(battle.selectedMoveIndex, battle.moves.length, 1);
    updateMovePreview(battle);
  }

  if (!input.interactPressed) {
    return;
  }

  const selectedMove = battle.moves[battle.selectedMoveIndex];
  const selectedMoveLimitation = selectedMove
    ? getMoveSelectionLimitation(battle, 'player', battle.playerMon, selectedMove)
    : null;
  if (selectedMove && selectedMoveLimitation && getSelectableMoveIndexes(battle, 'player', battle.playerMon, battle.moves).length > 0) {
    battle.turnSummary = getPlayerMoveSelectionBlockMessage(battle, selectedMove, selectedMoveLimitation);
    return;
  }

  if (
    !battle.playerMon.volatile.chargingMoveId
    && !battle.playerMon.volatile.rampageMoveId
    && !battle.playerMon.volatile.uproarMoveId
    && battle.playerMon.volatile.bideTurns <= 0
    && selectedMove
    && selectedMove.ppRemaining <= 0
    && hasUsableMove(battle.moves)
  ) {
    battle.turnSummary = `There's no PP left for ${selectedMove.name}!`;
    return;
  }

  resolveSelectedMoveTurn(battle, encounterState);
};
