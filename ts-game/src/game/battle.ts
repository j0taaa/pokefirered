import type { InputSnapshot } from '../input/inputState';
import { getBagQuantity, type BagState } from './bag';
import type { DecompTypeId } from './decompSpecies';
import { getDecompSpeciesInfo } from './decompSpecies';
import { getDecompPokedexEntry } from './decompPokedex';
import {
  getBattleTerrainForScene,
  getDecompBattleMove,
  getDecompLevelUpMoves,
  getFallbackBattleMoves,
  type DecompBattleTerrainId,
  type DecompBattleMove
} from './decompBattleData';
import type { FieldPokemon } from './pokemonStorage';
import type { WildEncounterGroup } from '../world/mapSource';

export type PokemonType = DecompTypeId;
export type StatusCondition = 'none' | 'poison' | 'badPoison' | 'burn' | 'paralysis' | 'sleep' | 'freeze';

export interface BattleStatStages {
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  accuracy: number;
  evasion: number;
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
}

export interface BattleSideState {
  reflectTurns: number;
  lightScreenTurns: number;
  safeguardTurns: number;
  mistTurns: number;
  wishTurns: number;
  wishHp: number;
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
}

export interface BattlePokemonSnapshot {
  species: string;
  level: number;
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
  moves: BattleMove[];
  statStages: BattleStatStages;
  volatile: BattleVolatileState;
}

export interface BattleEncounterState {
  stepsSinceLastEncounter: number;
  encounterRate: number;
  rngState: number;
}

export type BattleCommand = 'fight' | 'bag' | 'pokemon' | 'run';
export type BattlePhase = 'intro' | 'command' | 'moveSelect' | 'partySelect' | 'bagSelect' | 'script' | 'resolved';
export type BattleWeather = 'none' | 'rain' | 'sun' | 'sandstorm' | 'hail';

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
  terrain: DecompBattleTerrainId;
  mapBattleScene: string;
  playerMon: BattlePokemonSnapshot;
  party: BattlePokemonSnapshot[];
  wildMon: BattlePokemonSnapshot;
  moves: BattleMove[];
  wildMoves: BattleMove[];
  sideState: {
    player: BattleSideState;
    opponent: BattleSideState;
  };
  weather: BattleWeather;
  weatherTurns: number;
  selectedMoveIndex: number;
  selectedCommandIndex: number;
  commands: BattleCommand[];
  selectedPartyIndex: number;
  selectedBagIndex: number;
  turnSummary: string;
  damagePreview: {
    min: number;
    max: number;
  } | null;
  runAttempts: number;
  bag: {
    pokeBalls: number;
    greatBalls: number;
  };
  caughtMon: BattlePokemonSnapshot | null;
  queuedMessages: string[];
  queuedControllerCommands: BattleControllerCommand[];
  currentScriptLabel: string | null;
  resumePhase: Exclude<BattlePhase, 'script'>;
  resumeSummary: string;
}

export interface CaptureResult {
  caught: boolean;
  shakes: number;
  ballLabel: string;
  usedItemId: string | null;
}

export interface BattleBagChoice {
  itemId: 'ITEM_POKE_BALL' | 'ITEM_GREAT_BALL' | null;
  label: string;
  quantity: number | null;
  isExit: boolean;
}

const RAND_MULT = 1103515245;
const ISO_RANDOMIZE2_ADD = 12345;
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
  EFFECT_ACCURACY_DOWN_2: { target: 'target', stat: 'accuracy', delta: -2 },
  EFFECT_EVASION_DOWN_2: { target: 'target', stat: 'evasion', delta: -2 },
  EFFECT_TICKLE: { target: 'target', stat: 'attack', delta: -1 }
};

const secondaryStatusByEffect: Partial<Record<string, StatusCondition>> = {
  EFFECT_POISON_HIT: 'poison',
  EFFECT_POISON_FANG: 'poison',
  EFFECT_POISON_TAIL: 'poison',
  EFFECT_BURN_HIT: 'burn',
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

const weatherStartMessages: Record<Exclude<BattleWeather, 'none'>, string> = {
  rain: 'It started to rain!',
  sun: 'The sunlight got bright!',
  sandstorm: 'A sandstorm brewed!',
  hail: 'It started to hail!'
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
  toxicCounter: 0
});

const createSideState = (): BattleSideState => ({
  reflectTurns: 0,
  lightScreenTurns: 0,
  safeguardTurns: 0,
  mistTurns: 0,
  wishTurns: 0,
  wishHp: 0
});

const resetBattlePokemonTransientState = (pokemon: BattlePokemonSnapshot): void => {
  pokemon.statStages = createStatStages();
  pokemon.volatile = createVolatileState();
};

const cloneMove = (move: BattleMove): BattleMove => ({ ...move });

const cloneBattlePokemon = (pokemon: BattlePokemonSnapshot): BattlePokemonSnapshot => ({
  ...pokemon,
  types: [...pokemon.types],
  moves: pokemon.moves.map(cloneMove),
  statStages: { ...pokemon.statStages },
  volatile: { ...pokemon.volatile }
});

const nextBattleRng = (state: BattleEncounterState): number => {
  state.rngState = (RAND_MULT * state.rngState + ISO_RANDOMIZE2_ADD) >>> 0;
  return state.rngState >>> 16;
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
  secondaryEffectChance: move.secondaryEffectChance
});

const getStruggleMove = (): BattleMove =>
  decompMoveToBattleMove(getDecompBattleMove('STRUGGLE') ?? getDecompBattleMove('TACKLE') ?? getFallbackBattleMoves()[0]!);

const getKnownMovesForSpecies = (species: string, level: number): BattleMove[] => {
  const learned = getDecompLevelUpMoves(species, level);
  const fallback = learned.length > 0 ? learned : getFallbackBattleMoves();
  return fallback.map(decompMoveToBattleMove);
};

const calculateStat = (base: number, level: number, isHp: boolean): number => {
  const iv = 0;
  const ev = 0;
  const core = Math.floor(((2 * base) + iv + Math.floor(ev / 4)) * level / 100);
  return isHp ? core + level + 10 : core + 5;
};

const normalizeSpecies = (species: string): string => species.replace(/^SPECIES_/u, '').toUpperCase();

const createBattlePokemonFromSpecies = (
  species: string,
  level: number,
  status: StatusCondition = 'none'
): BattlePokemonSnapshot => {
  const normalizedSpecies = normalizeSpecies(species);
  const speciesInfo = getDecompSpeciesInfo(normalizedSpecies);
  const maxHp = calculateStat(speciesInfo?.baseHp ?? 10, level, true);

  return {
    species: normalizedSpecies,
    level,
    expProgress: 0,
    maxHp,
    hp: maxHp,
    attack: calculateStat(speciesInfo?.baseAttack ?? 10, level, false),
    defense: calculateStat(speciesInfo?.baseDefense ?? 10, level, false),
    speed: calculateStat(speciesInfo?.baseSpeed ?? 10, level, false),
    spAttack: calculateStat(speciesInfo?.baseSpAttack ?? 10, level, false),
    spDefense: calculateStat(speciesInfo?.baseSpDefense ?? 10, level, false),
    catchRate: speciesInfo?.catchRate ?? 255,
    types: (speciesInfo?.types ?? ['normal']) as PokemonType[],
    status,
    statusTurns: status === 'sleep' ? 2 : 0,
    moves: getKnownMovesForSpecies(normalizedSpecies, level),
    statStages: createStatStages(),
    volatile: createVolatileState()
  };
};

export const createBattlePokemonFromFieldPokemon = (pokemon: FieldPokemon): BattlePokemonSnapshot => ({
  species: normalizeSpecies(pokemon.species),
  level: pokemon.level,
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
  moves: getKnownMovesForSpecies(pokemon.species, pokemon.level),
  statStages: createStatStages(),
  volatile: createVolatileState()
});

const getPromptSummary = (battle: BattleState): string => `What will ${battle.playerMon.species} do?`;

const refreshActiveMovePointers = (battle: BattleState): void => {
  battle.moves = battle.playerMon.moves;
  battle.wildMoves = battle.wildMon.moves;
  if (battle.moves.length === 0) {
    battle.moves = getFallbackBattleMoves().map(decompMoveToBattleMove);
    battle.playerMon.moves = battle.moves;
  }
  if (battle.wildMoves.length === 0) {
    battle.wildMoves = getFallbackBattleMoves().map(decompMoveToBattleMove);
    battle.wildMon.moves = battle.wildMoves;
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
    battle.queuedControllerCommands.push({ type: 'message', text });
  }

  if (messages.length === 0) {
    battle.phase = resumePhase;
    if (resumeSummary) {
      battle.turnSummary = resumeSummary;
    }
    return;
  }

  battle.phase = 'script';
  battle.turnSummary = messages[0];
  battle.queuedMessages = messages.slice(1);
  battle.resumePhase = resumePhase;
  battle.resumeSummary = resumeSummary;
};

const advanceQueuedMessages = (battle: BattleState): void => {
  if (battle.queuedMessages.length > 0) {
    battle.turnSummary = battle.queuedMessages.shift() ?? '';
    return;
  }

  battle.phase = battle.resumePhase;
  if (battle.resumeSummary) {
    battle.turnSummary = battle.resumeSummary;
  }
};

const singleTypeEffectiveness = (moveType: PokemonType, defenderType: PokemonType): number =>
  TYPE_CHART[moveType]?.[defenderType] ?? 1;

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

const getOffenseStat = (pokemon: BattlePokemonSnapshot, move: BattleMove, critical = false): number => {
  const isSpecial = specialTypes.has(move.type);
  const stage = isSpecial ? pokemon.statStages.spAttack : pokemon.statStages.attack;
  const effectiveStage = critical && stage < 0 ? 0 : stage;
  return isSpecial
    ? getModifiedStat(pokemon.spAttack, effectiveStage)
    : getModifiedStat(pokemon.attack, effectiveStage);
};

const getDefenseStat = (pokemon: BattlePokemonSnapshot, move: BattleMove, critical = false): number => {
  const isSpecial = specialTypes.has(move.type);
  const stage = isSpecial ? pokemon.statStages.spDefense : pokemon.statStages.defense;
  const effectiveStage = critical && stage > 0 ? 0 : stage;
  return isSpecial
    ? getModifiedStat(pokemon.spDefense, effectiveStage)
    : getModifiedStat(pokemon.defense, effectiveStage);
};

const getTurnOrderSpeed = (pokemon: BattlePokemonSnapshot): number => {
  const speed = getModifiedStat(pokemon.speed, pokemon.statStages.speed);
  return pokemon.status === 'paralysis' ? Math.max(1, Math.floor(speed / 4)) : speed;
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
  if (!specialTypes.has(move.type) && attacker.status === 'burn') {
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

  const baseDamage = calculateBaseDamage(attacker, defender, move);
  const typeBonus = calculateTypeEffectiveness(move.type, defender.types);
  if (typeBonus === 0) {
    return { min: 0, max: 0 };
  }

  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const max = clampDamage(baseDamage * stab * typeBonus);
  const min = clampDamage((max * 217) / 255);
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

  const typeBonus = calculateTypeEffectiveness(move.type, defender.types);
  if (typeBonus === 0) {
    return 0;
  }

  const baseDamage = calculateBaseDamage(attacker, defender, move, critical) * (critical ? 2 : 1);
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  let max = clampDamage(baseDamage * stab * typeBonus);
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
  const randomFactor = 217 + (nextBattleRng(encounterState) % 39);
  return clampDamage((max * randomFactor) / 255);
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
  const playerSpeed = getTurnOrderSpeed(player);
  const enemySpeed = getTurnOrderSpeed(enemy);
  if (playerSpeed >= enemySpeed) {
    return true;
  }

  const speedVar = Math.floor((playerSpeed * 128) / Math.max(1, enemySpeed)) + (runAttempts * 30);
  const roll = nextBattleRng(encounter) & 0xff;
  return speedVar > roll;
};

const chooseEnemyMoveIndex = (battle: BattleState, encounter: BattleEncounterState): number => {
  const usable = battle.wildMoves
    .map((move, index) => ({ move, index }))
    .filter(({ move }) => move.ppRemaining > 0);

  if (usable.length === 0) {
    return -1;
  }

  return usable[nextEncounterRoll(encounter, usable.length)]?.index ?? usable[0].index;
};

const hasUsableMove = (moves: BattleMove[]): boolean => moves.some((move) => move.ppRemaining > 0);

const getEnemyTurnMove = (battle: BattleState, encounter: BattleEncounterState): BattleMove | null => {
  const enemyMoveIndex = chooseEnemyMoveIndex(battle, encounter);
  if (enemyMoveIndex < 0) {
    return getStruggleMove();
  }

  return battle.wildMoves[enemyMoveIndex] ?? battle.wildMoves[0] ?? null;
};

const getPlayerTurnMove = (battle: BattleState): BattleMove | null => {
  const playerMove = battle.moves[battle.selectedMoveIndex];
  if (!playerMove) {
    return null;
  }

  return playerMove.ppRemaining > 0 || hasUsableMove(battle.moves) ? playerMove : getStruggleMove();
};

const hasLivingBenchMon = (battle: BattleState): boolean =>
  battle.party.some((member) => member !== battle.playerMon && member.hp > 0);

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
  messages.push(`${pokemon.species} is locked in a nightmare!`);
};

const applyYawn = (
  target: BattlePokemonSnapshot,
  targetSide: 'player' | 'opponent',
  battle: BattleState,
  messages: string[]
): boolean => {
  if (target.status !== 'none' || target.volatile.yawnTurns > 0 || target.volatile.substituteHp > 0) {
    messages.push('But it failed!');
    return true;
  }

  if (battle.sideState[targetSide].safeguardTurns > 0) {
    messages.push(`${target.species}'s team is protected by Safeguard!`);
    return true;
  }

  target.volatile.yawnTurns = 2;
  messages.push(`${target.species} grew drowsy!`);
  return true;
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
    pokemon.statusTurns = 2;
    messages.push(`${pokemon.species} fell asleep!`);
  }
};

const decrementTaunt = (pokemon: BattlePokemonSnapshot): void => {
  if (pokemon.volatile.tauntTurns > 0 && pokemon.hp > 0) {
    pokemon.volatile.tauntTurns -= 1;
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
    applyWeatherDamage(battle, 'opponent', battle.wildMon, messages);
    applyWeatherDamage(battle, 'player', battle.playerMon, messages);
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
  battle.playerMon.volatile.protected = false;
  battle.wildMon.volatile.protected = false;
  battle.playerMon.volatile.enduring = false;
  battle.wildMon.volatile.enduring = false;
  battle.playerMon.volatile.tookDamageThisTurn = false;
  battle.wildMon.volatile.tookDamageThisTurn = false;
};

const getStatusBonus = (status: StatusCondition): number => {
  if (status === 'sleep' || status === 'freeze') {
    return 2;
  }
  if (status !== 'none') {
    return 1.5;
  }
  return 1;
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
  battle.queuedControllerCommands.push({ type: 'message', text });
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
    return target.types.includes('poison') || target.types.includes('steel');
  }
  if (status === 'burn') {
    return target.types.includes('fire');
  }
  if (status === 'freeze') {
    return target.types.includes('ice');
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
  const nextStatus = secondaryStatusByEffect[move.effect];
  if (!nextStatus || target.status !== 'none' || move.secondaryEffectChance <= 0) {
    return;
  }

  if ((nextBattleRng(encounterState) % 100) >= move.secondaryEffectChance) {
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
  battle.queuedControllerCommands.push({ type: 'hp', battler, value: nextHp });
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

const applyConfusion = (
  target: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[]
): boolean => {
  if (target.volatile.confusionTurns > 0) {
    messages.push(`${target.species} is already confused!`);
    return false;
  }

  target.volatile.confusionTurns = 2 + (nextBattleRng(encounterState) % 4);
  messages.push(`${target.species} became confused!`);
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
  if (!targetCanStillAct || (move.effect !== 'EFFECT_FLINCH_HIT' && move.effect !== 'EFFECT_FLINCH_MINIMIZE_HIT')) {
    return;
  }

  if (move.secondaryEffectChance > 0 && (nextBattleRng(encounterState) % 100) >= move.secondaryEffectChance) {
    return;
  }

  target.volatile.flinched = true;
};

const applySideCondition = (
  battle: BattleState,
  side: 'player' | 'opponent',
  move: BattleMove,
  messages: string[]
): boolean => {
  if (move.effect === 'EFFECT_REFLECT') {
    if (battle.sideState[side].reflectTurns > 0) {
      messages.push('But it failed!');
      return true;
    }
    battle.sideState[side].reflectTurns = 5;
    messages.push(`${side === 'player' ? 'Your' : "Foe's"} team became protected by Reflect!`);
    return true;
  }

  if (move.effect === 'EFFECT_LIGHT_SCREEN') {
    if (battle.sideState[side].lightScreenTurns > 0) {
      messages.push('But it failed!');
      return true;
    }
    battle.sideState[side].lightScreenTurns = 5;
    messages.push(`${side === 'player' ? 'Your' : "Foe's"} team became protected by Light Screen!`);
    return true;
  }

  if (move.effect === 'EFFECT_SAFEGUARD') {
    if (battle.sideState[side].safeguardTurns > 0) {
      messages.push('But it failed!');
      return true;
    }
    battle.sideState[side].safeguardTurns = 5;
    messages.push(`${side === 'player' ? 'Your' : "Foe's"} team became protected by Safeguard!`);
    return true;
  }

  if (move.effect === 'EFFECT_MIST') {
    if (battle.sideState[side].mistTurns > 0) {
      messages.push('But it failed!');
      return true;
    }
    battle.sideState[side].mistTurns = 5;
    messages.push(`${side === 'player' ? 'Your' : "Foe's"} team became shrouded in Mist!`);
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

  if (battle.weather === nextWeather) {
    messages.push('But it failed!');
    return true;
  }

  battle.weather = nextWeather;
  battle.weatherTurns = 5;
  messages.push(weatherStartMessages[nextWeather]);
  return true;
};

const tryUseProtect = (
  attacker: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  messages: string[],
  canBlockThisTurn = true,
  successMessage = `${attacker.species} protected itself!`
): boolean => {
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
  defender.volatile.protected && move.target !== 'MOVE_TARGET_USER' && move.effect !== 'EFFECT_PROTECT';

const isMoveBlockedBySubstitute = (move: BattleMove, defender: BattlePokemonSnapshot): boolean =>
  defender.volatile.substituteHp > 0
  && move.target !== 'MOVE_TARGET_USER'
  && move.effect !== 'EFFECT_MEMENTO'
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

  pokemon.hp = Math.max(0, pokemon.hp - boundedDamage);
  if (pokemon.volatile.enduring && pokemon.hp === 0 && boundedDamage > 0) {
    pokemon.hp = 1;
    messages.push(`${pokemon.species} endured the hit!`);
  }
  applyQueuedDamage(battle, side, pokemon.hp);
  if (boundedDamage > 0) {
    pokemon.volatile.tookDamageThisTurn = true;
  }
  return boundedDamage;
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

const applyLeechSeed = (
  attackerSide: 'player' | 'opponent',
  defender: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  if (defender.volatile.substituteHp > 0 || defender.volatile.leechSeededBy !== null) {
    messages.push('But it failed!');
    return true;
  }

  if (defender.types.includes('grass')) {
    messages.push(`It doesn't affect ${defender.species}...`);
    return true;
  }

  defender.volatile.leechSeededBy = attackerSide;
  messages.push(`${defender.species} was seeded!`);
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

const getActorLabel = (side: 'player' | 'opponent', battle: BattleState): string =>
  side === 'player' ? battle.playerMon.species : `Foe ${battle.wildMon.species}`;

const getFaintMessage = (side: 'player' | 'opponent', battle: BattleState): string =>
  side === 'player' ? `${battle.playerMon.species} fainted!` : `Foe ${battle.wildMon.species} fainted!`;

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
    secondaryEffectChance: 0
  };
  return calculateBaseDamage(pokemon, pokemon, confusionMove);
};

const canMoveThisTurn = (
  battle: BattleState,
  side: 'player' | 'opponent',
  pokemon: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState,
  messages: string[]
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

const attemptAccuracy = (
  battle: BattleState,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState
): boolean => {
  if (move.effect === 'EFFECT_ALWAYS_HIT' || (move.effect === 'EFFECT_THUNDER' && battle.weather === 'rain')) {
    return true;
  }

  if (move.effect === 'EFFECT_THUNDER' && battle.weather === 'sun') {
    return (nextBattleRng(encounterState) % 100) + 1 <= 50;
  }

  if (move.accuracy === 0) {
    return true;
  }

  const accuracyValue = getAccuracyAdjustedValue(
    move.accuracy,
    attacker.statStages.accuracy,
    defender.statStages.evasion
  );
  return (nextBattleRng(encounterState) % 100) + 1 <= accuracyValue;
};

const isCriticalHit = (move: BattleMove, attacker: BattlePokemonSnapshot, encounterState: BattleEncounterState): boolean => {
  const critStage = Math.min(
    criticalHitDivisors.length - 1,
    (highCriticalEffects.has(move.effect) ? 1 : 0) + (attacker.volatile.focusEnergy ? 2 : 0)
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

const executeMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  move: BattleMove,
  encounterState: BattleEncounterState,
  defenderCanStillAct = false
): string[] => {
  const messages: string[] = [];
  const attacker = attackerSide === 'player' ? battle.playerMon : battle.wildMon;
  const defender = attackerSide === 'player' ? battle.wildMon : battle.playerMon;
  const defenderSide = attackerSide === 'player' ? 'opponent' : 'player';

  battle.currentScriptLabel = move.effectScriptLabel;
  battle.queuedControllerCommands.push({ type: 'script', label: move.effectScriptLabel });

  if (!canMoveThisTurn(battle, attackerSide, attacker, move, encounterState, messages)) {
    return messages;
  }

  if (move.effect !== 'EFFECT_PROTECT') {
    attacker.volatile.protectUses = 0;
  }

  if (move.ppRemaining <= 0 && move.id !== 'STRUGGLE') {
    pushMessage(messages, battle, `There's no PP left for ${move.name}!`);
    return messages;
  }

  if (move.id !== 'STRUGGLE' && move.ppRemaining > 0) {
    move.ppRemaining -= 1;
  }

  pushMessage(messages, battle, `${getActorLabel(attackerSide, battle)} used ${move.name}!`);

  if (move.effect === 'EFFECT_PROTECT') {
    tryUseProtect(attacker, encounterState, messages, defenderCanStillAct);
    return messages;
  }

  if (isMoveBlockedByProtect(move, defender)) {
    pushMessage(messages, battle, `${defender.species} protected itself!`);
    return messages;
  }

  if (isMoveBlockedBySubstitute(move, defender)) {
    pushMessage(messages, battle, 'But it failed!');
    return messages;
  }

  if (move.effect === 'EFFECT_DREAM_EATER' && defender.status !== 'sleep') {
    pushMessage(messages, battle, 'But it failed!');
    return messages;
  }

  if (!attemptAccuracy(battle, attacker, defender, move, encounterState)) {
    pushMessage(messages, battle, 'The attack missed!');
    if (move.effect === 'EFFECT_FURY_CUTTER') {
      attacker.volatile.furyCutterCounter = 0;
    } else if (move.effect === 'EFFECT_ROLLOUT') {
      attacker.volatile.rolloutCounter = 0;
    }
    if (move.effect === 'EFFECT_RECOIL_IF_MISS' && calculateTypeEffectiveness(move.type, defender.types) !== 0) {
      const crashDamage = Math.min(
        Math.max(1, Math.floor(calculateDamageRoll(battle, defenderSide, attacker, defender, move, encounterState, false) / 2)),
        Math.max(1, Math.floor(defender.maxHp / 2))
      );
      attacker.hp = Math.max(0, attacker.hp - crashDamage);
      applyQueuedDamage(battle, attackerSide, attacker.hp);
      pushMessage(messages, battle, `${attacker.species} kept going and crashed!`);
    }
    return messages;
  }

  if (move.effect === 'EFFECT_OHKO') {
    if (attacker.level < defender.level) {
      pushMessage(messages, battle, 'But it failed!');
      return messages;
    }
    if (calculateTypeEffectiveness(move.type, defender.types) === 0) {
      pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
      return messages;
    }
    damageBattler(battle, defenderSide, defender, defender.hp, move, messages);
    pushMessage(messages, battle, "It's a one-hit KO!");
    pushMessage(messages, battle, getFaintMessage(defenderSide, battle));
    return messages;
  }

  const effectiveMove = getMoveWithDynamicPower(move, attacker, defender, battle, encounterState, messages);
  if (move.effect === 'EFFECT_BRICK_BREAK') {
    const targetSideState = battle.sideState[defenderSide];
    if (targetSideState.reflectTurns > 0 || targetSideState.lightScreenTurns > 0) {
      targetSideState.reflectTurns = 0;
      targetSideState.lightScreenTurns = 0;
      messages.push(`${defender.species}'s barriers were shattered!`);
    }
  }

  const fixedDamage = calculateFixedDamage(effectiveMove, attacker, defender, encounterState);
  if (move.effect === 'EFFECT_ENDEAVOR') {
    const typeEffectiveness = calculateTypeEffectiveness(effectiveMove.type, defender.types);
    if (typeEffectiveness === 0) {
      pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
      return messages;
    }

    if (defender.hp <= attacker.hp) {
      pushMessage(messages, battle, 'But it failed!');
      return messages;
    }

    damageBattler(battle, defenderSide, defender, defender.hp - attacker.hp, effectiveMove, messages);
  } else if (fixedDamage !== null) {
    const typeEffectiveness = calculateTypeEffectiveness(effectiveMove.type, defender.types);
    if (typeEffectiveness === 0) {
      pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
      if (move.effect === 'EFFECT_FURY_CUTTER') {
        attacker.volatile.furyCutterCounter = 0;
      } else if (move.effect === 'EFFECT_ROLLOUT') {
        attacker.volatile.rolloutCounter = 0;
      }
      return messages;
    }

    damageBattler(battle, defenderSide, defender, fixedDamage, effectiveMove, messages);
  } else if (effectiveMove.power > 0) {
    const typeEffectiveness = calculateTypeEffectiveness(effectiveMove.type, defender.types);
    if (typeEffectiveness === 0) {
      pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
      return messages;
    }

    let damage = 0;
    let critical = false;
    const hitSubstitute = defender.volatile.substituteHp > 0 && effectiveMove.id !== 'STRUGGLE';
    const hitCount = isMultiHitMove(effectiveMove) ? getMultiHitCount(effectiveMove, encounterState) : 1;
    let hitsLanded = 0;

    for (let hitIndex = 0; hitIndex < hitCount; hitIndex += 1) {
      if (defender.hp <= 0) {
        break;
      }
      const hitMove = effectiveMove.effect === 'EFFECT_TRIPLE_KICK'
        ? { ...effectiveMove, power: effectiveMove.power * (hitIndex + 1) }
        : effectiveMove;
      const hitCritical = isCriticalHit(hitMove, attacker, encounterState);
      critical ||= hitCritical;
      damage += damageBattler(
        battle,
        defenderSide,
        defender,
        calculateDamageRoll(battle, defenderSide, attacker, defender, hitMove, encounterState, hitCritical),
        hitMove,
        messages
      );
      hitsLanded += 1;
      if (defender.volatile.substituteHp === 0 && hitSubstitute) {
        break;
      }
    }

    if (hitsLanded > 1) {
      pushMessage(messages, battle, `Hit ${hitsLanded} times!`);
    }

    if (critical) {
      pushMessage(messages, battle, 'A critical hit!');
    }

    if (typeEffectiveness > 1) {
      pushMessage(messages, battle, "It's super effective!");
    } else if (typeEffectiveness < 1) {
      pushMessage(messages, battle, "It's not very effective...");
    }

    if (!hitSubstitute) {
      maybeApplySecondaryStatus(move, defender, defenderSide, battle, encounterState, messages);
      maybeApplySecondaryStageEffect(move, attacker, defender, attackerSide, defenderSide, battle, encounterState, messages);
      maybeApplySecondaryConfusion(move, defender, encounterState, messages);
      maybeApplyFlinch(move, defender, defenderCanStillAct, encounterState);
    }

    if (damage > 0 && move.effect === 'EFFECT_FURY_CUTTER') {
      attacker.volatile.furyCutterCounter = Math.min(5, attacker.volatile.furyCutterCounter + 1);
    } else if (damage > 0 && move.effect === 'EFFECT_ROLLOUT') {
      attacker.volatile.rolloutCounter = attacker.volatile.rolloutCounter >= 4 ? 0 : attacker.volatile.rolloutCounter + 1;
    }

    if (damage > 0 && move.effect === 'EFFECT_SUPERPOWER') {
      applyDirectStageChange(attacker, 'attack', -1, messages);
      applyDirectStageChange(attacker, 'defense', -1, messages);
    } else if (damage > 0 && move.effect === 'EFFECT_OVERHEAT') {
      applyDirectStageChange(attacker, 'spAttack', -2, messages);
    } else if (damage > 0 && move.effect === 'EFFECT_TWINEEDLE') {
      applyStatusEffect(defender, 'poison', messages, move, '', encounterState, battle, defenderSide);
    } else if (damage > 0 && move.effect === 'EFFECT_SMELLINGSALT' && defender.status === 'paralysis') {
      defender.status = 'none';
      defender.statusTurns = 0;
      defender.volatile.toxicCounter = 0;
      messages.push(`${defender.species}'s paralysis was cured!`);
    } else if (damage > 0 && move.effect === 'EFFECT_RAPID_SPIN') {
      attacker.volatile.trapTurns = 0;
      attacker.volatile.trappedBy = null;
      attacker.volatile.leechSeededBy = null;
      messages.push(`${attacker.species} was freed from binding effects!`);
    } else if (damage > 0 && move.effect === 'EFFECT_TRAP' && defender.volatile.trapTurns <= 0) {
      defender.volatile.trapTurns = 3 + (nextBattleRng(encounterState) & 3);
      defender.volatile.trappedBy = attackerSide;
      messages.push(`${defender.species} was trapped!`);
    } else if (damage > 0 && move.effect === 'EFFECT_RECHARGE') {
      attacker.volatile.rechargeTurns = 1;
    }

    if (move.effect === 'EFFECT_RECOIL') {
      const recoil = Math.max(1, Math.floor(damage / 4));
      attacker.hp = Math.max(0, attacker.hp - recoil);
      applyQueuedDamage(battle, attackerSide, attacker.hp);
      pushMessage(messages, battle, `${attacker.species} is hit with recoil!`);
    } else if (move.effect === 'EFFECT_DOUBLE_EDGE') {
      const recoil = Math.max(1, Math.floor(damage / 3));
      attacker.hp = Math.max(0, attacker.hp - recoil);
      applyQueuedDamage(battle, attackerSide, attacker.hp);
      pushMessage(messages, battle, `${attacker.species} is hit with recoil!`);
    } else if (move.effect === 'EFFECT_EXPLOSION') {
      attacker.hp = 0;
      applyQueuedDamage(battle, attackerSide, attacker.hp);
    }

    if (!hitSubstitute && (move.effect === 'EFFECT_ABSORB' || move.effect === 'EFFECT_DREAM_EATER')) {
      healBattler(battle, attackerSide, attacker, Math.floor(damage / 2), messages);
    }
  } else if (primaryStatusByEffect[move.effect]) {
    const primaryStatus = primaryStatusByEffect[move.effect];
    if (primaryStatus) {
      applyStatusEffect(defender, primaryStatus, messages, move, 'But it failed!', encounterState, battle, defenderSide);
    }
  } else if (move.effect === 'EFFECT_CONFUSE') {
    applyConfusion(defender, encounterState, messages);
  } else if (applySideCondition(battle, attackerSide, move, messages)) {
    // Message already appended.
  } else if (applyWeatherMove(battle, move, messages)) {
    // Message already appended.
  } else if (move.effect === 'EFFECT_SUBSTITUTE') {
    useSubstitute(battle, attackerSide, attacker, messages);
  } else if (move.effect === 'EFFECT_LEECH_SEED') {
    applyLeechSeed(attackerSide, defender, messages);
  } else if (move.effect === 'EFFECT_HAZE') {
    clearAllStatStages(battle, messages);
  } else if (move.effect === 'EFFECT_FOCUS_ENERGY') {
    useFocusEnergy(attacker, messages);
  } else if (move.effect === 'EFFECT_MINIMIZE') {
    attacker.volatile.minimized = true;
    applyDirectStageChange(attacker, 'evasion', 1, messages);
  } else if (move.effect === 'EFFECT_DEFENSE_CURL') {
    attacker.volatile.defenseCurl = true;
    applyDirectStageChange(attacker, 'defense', 1, messages);
  } else if (move.effect === 'EFFECT_PSYCH_UP') {
    attacker.statStages = { ...defender.statStages };
    messages.push(`${attacker.species} copied the foe's stat changes!`);
  } else if (move.effect === 'EFFECT_SWAGGER' || move.effect === 'EFFECT_FLATTER') {
    applyDirectStageChange(defender, move.effect === 'EFFECT_SWAGGER' ? 'attack' : 'spAttack', move.effect === 'EFFECT_SWAGGER' ? 2 : 1, messages);
    if (battle.sideState[defenderSide].safeguardTurns > 0) {
      messages.push(`${defender.species}'s team is protected by Safeguard!`);
    } else {
      applyConfusion(defender, encounterState, messages);
    }
  } else if (move.effect === 'EFFECT_MEMENTO') {
    if (defender.statStages.attack <= -6 && defender.statStages.spAttack <= -6 && defender.volatile.substituteHp <= 0) {
      messages.push('But it failed!');
    } else {
      attacker.hp = 0;
      applyQueuedDamage(battle, attackerSide, attacker.hp);
      if (defender.volatile.substituteHp > 0) {
        messages.push('But it had no effect!');
      } else {
        applyDirectStageChange(defender, 'attack', -2, messages);
        applyDirectStageChange(defender, 'spAttack', -2, messages);
      }
    }
  } else if (move.effect === 'EFFECT_TAUNT') {
    if (defender.volatile.tauntTurns > 0) {
      messages.push('But it failed!');
    } else {
      defender.volatile.tauntTurns = 2;
      messages.push(`${defender.species} fell for the taunt!`);
    }
  } else if (move.effect === 'EFFECT_ENDURE') {
    const endured = tryUseProtect(attacker, encounterState, messages, defenderCanStillAct, `${attacker.species} braced itself!`);
    attacker.volatile.protected = false;
    attacker.volatile.enduring = endured;
  } else if (move.effect === 'EFFECT_BELLY_DRUM') {
    useBellyDrum(battle, attackerSide, attacker, messages);
  } else if (applyComboStageMove(move, battle, attackerSide, defenderSide, attacker, defender, messages)) {
    // Message already appended.
  } else if (move.effect === 'EFFECT_YAWN') {
    applyYawn(defender, defenderSide, battle, messages);
  } else if (move.effect === 'EFFECT_NIGHTMARE') {
    if (defender.status !== 'sleep' || defender.volatile.nightmare) {
      messages.push('But it failed!');
    } else {
      defender.volatile.nightmare = true;
      messages.push(`${defender.species} fell into a nightmare!`);
    }
  } else if (move.effect === 'EFFECT_PERISH_SONG') {
    let affected = false;
    for (const pokemon of [battle.playerMon, battle.wildMon]) {
      if (pokemon.volatile.perishTurns === 0) {
        pokemon.volatile.perishTurns = 3;
        affected = true;
      }
    }
    messages.push(affected ? 'All Pokémon hearing the song will faint in three turns!' : 'But it failed!');
  } else if (move.effect === 'EFFECT_REFRESH') {
    if (['poison', 'badPoison', 'burn', 'paralysis'].includes(attacker.status)) {
      attacker.status = 'none';
      attacker.statusTurns = 0;
      attacker.volatile.toxicCounter = 0;
      messages.push(`${attacker.species} became healthy!`);
    } else {
      messages.push('But it failed!');
    }
  } else if (move.effect === 'EFFECT_HEAL_BELL') {
    for (const pokemon of battle.party) {
      pokemon.status = 'none';
      pokemon.statusTurns = 0;
      pokemon.volatile.toxicCounter = 0;
    }
    battle.playerMon.status = 'none';
    battle.playerMon.statusTurns = 0;
    battle.playerMon.volatile.toxicCounter = 0;
    messages.push('A bell chimed and cured status problems!');
  } else if (move.effect === 'EFFECT_PAIN_SPLIT') {
    const sharedHp = Math.floor((attacker.hp + defender.hp) / 2);
    attacker.hp = Math.min(attacker.maxHp, sharedHp);
    defender.hp = Math.min(defender.maxHp, sharedHp);
    applyQueuedDamage(battle, attackerSide, attacker.hp);
    applyQueuedDamage(battle, defenderSide, defender.hp);
    messages.push('The battlers shared their pain!');
  } else if (move.effect === 'EFFECT_WISH') {
    const sideState = battle.sideState[attackerSide];
    if (sideState.wishTurns > 0) {
      messages.push('But it failed!');
    } else {
      sideState.wishTurns = 2;
      sideState.wishHp = Math.max(1, Math.floor(attacker.maxHp / 2));
      messages.push(`${attacker.species} made a wish!`);
    }
  } else if (move.effect === 'EFFECT_RESTORE_HP') {
    healBattler(battle, attackerSide, attacker, Math.floor(attacker.maxHp / 2), messages);
  } else if (move.effect === 'EFFECT_MORNING_SUN' || move.effect === 'EFFECT_SYNTHESIS' || move.effect === 'EFFECT_MOONLIGHT') {
    const amount = battle.weather === 'sun'
      ? Math.max(1, Math.floor((attacker.maxHp * 2) / 3))
      : battle.weather === 'none'
        ? Math.max(1, Math.floor(attacker.maxHp / 2))
        : Math.max(1, Math.floor(attacker.maxHp / 4));
    healBattler(battle, attackerSide, attacker, amount, messages);
  } else if (move.effect === 'EFFECT_SOFTBOILED') {
    healBattler(battle, attackerSide, attacker, Math.floor(attacker.maxHp / 2), messages);
  } else if (move.effect === 'EFFECT_REST') {
    if (attacker.hp >= attacker.maxHp || attacker.status === 'sleep') {
      messages.push('But it failed!');
    } else {
      attacker.hp = attacker.maxHp;
      attacker.status = 'sleep';
      attacker.statusTurns = 3;
      attacker.volatile.toxicCounter = 0;
      applyQueuedDamage(battle, attackerSide, attacker.hp);
      messages.push(`${attacker.species} went to sleep and became healthy!`);
    }
  } else if (!applyStageEffect(move.effect, attacker, defender, messages, battle, attackerSide, defenderSide)) {
    pushMessage(messages, battle, 'But nothing happened!');
  }

  if (defender.hp === 0) {
    pushMessage(messages, battle, getFaintMessage(defenderSide, battle));
  }
  if (attacker.hp === 0) {
    pushMessage(messages, battle, getFaintMessage(attackerSide, battle));
  }

  return messages;
};

const getActionOrder = (
  battle: BattleState,
  playerMove: BattleMove,
  enemyMove: BattleMove,
  encounterState: BattleEncounterState
): Array<'player' | 'opponent'> => {
  if (playerMove.priority !== enemyMove.priority) {
    return playerMove.priority > enemyMove.priority ? ['player', 'opponent'] : ['opponent', 'player'];
  }

  const playerSpeed = getTurnOrderSpeed(battle.playerMon);
  const enemySpeed = getTurnOrderSpeed(battle.wildMon);
  if (playerSpeed !== enemySpeed) {
    return playerSpeed > enemySpeed ? ['player', 'opponent'] : ['opponent', 'player'];
  }

  return (nextBattleRng(encounterState) & 1) === 0 ? ['player', 'opponent'] : ['opponent', 'player'];
};

const resolveEndOfTurn = (battle: BattleState): string[] => {
  const messages: string[] = [];
  decrementSideConditions(battle, messages);
  resolveWish(battle, 'opponent', battle.wildMon, messages);
  resolveWish(battle, 'player', battle.playerMon, messages);
  resolveWeatherEndOfTurn(battle, messages);
  applyLeechSeedDrain(battle, 'opponent', battle.wildMon, messages);
  applyLeechSeedDrain(battle, 'player', battle.playerMon, messages);

  const enemyStatusMessage = applyStatusDamage(battle, 'opponent', battle.wildMon);
  if (enemyStatusMessage) {
    messages.push(enemyStatusMessage);
  }

  const playerStatusMessage = applyStatusDamage(battle, 'player', battle.playerMon);
  if (playerStatusMessage) {
    messages.push(playerStatusMessage);
  }

  applyNightmareDamage(battle, 'opponent', battle.wildMon, messages);
  applyNightmareDamage(battle, 'player', battle.playerMon, messages);
  applyTrapDamage(battle, 'opponent', battle.wildMon, messages);
  applyTrapDamage(battle, 'player', battle.playerMon, messages);
  decrementYawn(battle.wildMon, messages);
  decrementYawn(battle.playerMon, messages);
  decrementTaunt(battle.wildMon);
  decrementTaunt(battle.playerMon);
  decrementPerishSong(battle, 'opponent', battle.wildMon, messages);
  decrementPerishSong(battle, 'player', battle.playerMon, messages);

  if (battle.wildMon.hp === 0 && !messages.includes(getFaintMessage('opponent', battle))) {
    messages.push(getFaintMessage('opponent', battle));
  }
  if (battle.playerMon.hp === 0 && !messages.includes(getFaintMessage('player', battle))) {
    messages.push(getFaintMessage('player', battle));
  }

  clearSingleTurnVolatiles(battle);
  return messages;
};

const enqueueTurnMessages = (battle: BattleState, messages: string[]): void => {
  if (battle.playerMon.hp === 0) {
    if (hasLivingBenchMon(battle)) {
      queueMessages(battle, messages, 'partySelect', 'Choose a Pokémon.');
      return;
    }
    queueMessages(battle, messages, 'resolved');
    return;
  }

  if (battle.wildMon.hp === 0) {
    queueMessages(battle, messages, 'resolved');
    return;
  }

  queueMessages(battle, messages, 'command', getPromptSummary(battle));
};

const resolveEnemyOnlyTurn = (battle: BattleState, encounterState: BattleEncounterState, leadingMessages: string[]): void => {
  battle.queuedControllerCommands = [];
  const enemyMove = getEnemyTurnMove(battle, encounterState);
  const messages = [...leadingMessages];

  if (enemyMove) {
    messages.push(...executeMove(battle, 'opponent', enemyMove, encounterState));
  }

  if (battle.playerMon.hp > 0 && battle.wildMon.hp > 0) {
    messages.push(...resolveEndOfTurn(battle));
  }

  enqueueTurnMessages(battle, messages);
};

const resolvePlayerSwitchTurn = (
  battle: BattleState,
  target: BattlePokemonSnapshot,
  encounterState: BattleEncounterState,
  voluntary: boolean
): void => {
  const previous = battle.playerMon;
  resetBattlePokemonTransientState(previous);
  resetBattlePokemonTransientState(target);
  battle.playerMon = target;
  refreshActiveMovePointers(battle);
  battle.currentScriptLabel = 'BattleScript_ActionSwitch';

  const messages = voluntary
    ? [`${previous.species}, come back!`, `Go! ${target.species}!`]
    : [`Go! ${target.species}!`];

  // Mirrors battle_main.c::SetActionsAndBattlersTurnOrder: switch actions are
  // ordered before moves, but the opposing battler's move still resolves.
  if (voluntary && battle.wildMon.hp > 0) {
    resolveEnemyOnlyTurn(battle, encounterState, messages);
    return;
  }

  queueMessages(battle, messages, 'command', getPromptSummary(battle));
};

const resolveSelectedMoveTurn = (battle: BattleState, encounterState: BattleEncounterState): void => {
  battle.queuedControllerCommands = [];
  const playerMove = getPlayerTurnMove(battle);
  const enemyMove = getEnemyTurnMove(battle, encounterState);
  if (!playerMove || !enemyMove) {
    return;
  }

  const messages: string[] = [];
  const order = getActionOrder(battle, playerMove, enemyMove, encounterState);
  const pendingActors = new Set<'player' | 'opponent'>(order);

  for (const actor of order) {
    if (battle.playerMon.hp === 0 || battle.wildMon.hp === 0) {
      break;
    }

    pendingActors.delete(actor);
    const defenderSide = actor === 'player' ? 'opponent' : 'player';
    messages.push(...executeMove(
      battle,
      actor,
      actor === 'player' ? playerMove : enemyMove,
      encounterState,
      pendingActors.has(defenderSide)
    ));
  }

  if (battle.playerMon.hp > 0 && battle.wildMon.hp > 0) {
    messages.push(...resolveEndOfTurn(battle));
  }

  enqueueTurnMessages(battle, messages);
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

export const createBattleEncounterState = (): BattleEncounterState => ({
  stepsSinceLastEncounter: 0,
  encounterRate: 30,
  rngState: 0x4a3b
});

export const createBattleState = (): BattleState => {
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
  const wildMon = createBattlePokemonFromSpecies('PIDGEY', 3);

  return {
    active: false,
    phase: 'intro',
    terrain: 'BATTLE_TERRAIN_GRASS',
    mapBattleScene: DEFAULT_BATTLE_SCENE,
    playerMon: playerMonA,
    party: [playerMonA, playerMonB],
    wildMon,
    moves: playerMonA.moves,
    wildMoves: wildMon.moves,
    sideState: {
      player: createSideState(),
      opponent: createSideState()
    },
    weather: 'none',
    weatherTurns: 0,
    selectedMoveIndex: 0,
    selectedCommandIndex: 0,
    commands: ['fight', 'bag', 'pokemon', 'run'],
    selectedPartyIndex: 0,
    selectedBagIndex: 0,
    turnSummary: '',
    damagePreview: calculateDamagePreview(playerMonA, wildMon, playerMonA.moves[0] ?? decompMoveToBattleMove(getDecompBattleMove('TACKLE') ?? getFallbackBattleMoves()[0]!)),
    runAttempts: 0,
    bag: {
      pokeBalls: 5,
      greatBalls: 1
    },
    caughtMon: null,
    queuedMessages: [],
    queuedControllerCommands: [],
    currentScriptLabel: null,
    resumePhase: 'command',
    resumeSummary: ''
  };
};

export const tryStartWildBattle = (
  battle: BattleState,
  encounter: BattleEncounterState,
  playerMoved: boolean,
  canEncounter: boolean,
  encounterGroup?: WildEncounterGroup,
  mapBattleScene = DEFAULT_BATTLE_SCENE,
  mapId?: string
): boolean => {
  if (!playerMoved || battle.active || !canEncounter || !encounterGroup) {
    return false;
  }

  encounter.encounterRate = encounterGroup.encounterRate;

  if (!shouldStartWildEncounter(encounter)) {
    return false;
  }

  battle.wildMon = chooseWildEncounterMon(encounterGroup, encounter);
  battle.active = true;
  battle.phase = 'intro';
  battle.mapBattleScene = mapBattleScene;
  battle.terrain = getBattleTerrainForScene(mapBattleScene, { mapId, encounterKind: 'land' });
  battle.wildMon.hp = battle.wildMon.maxHp;
  battle.wildMon.status = 'none';
  resetBattlePokemonTransientState(battle.wildMon);
  for (const partyMember of battle.party) {
    resetBattlePokemonTransientState(partyMember);
  }
  battle.sideState = {
    player: createSideState(),
    opponent: createSideState()
  };
  battle.weather = 'none';
  battle.weatherTurns = 0;
  battle.selectedMoveIndex = 0;
  battle.selectedCommandIndex = 0;
  battle.selectedPartyIndex = 0;
  battle.selectedBagIndex = 0;
  battle.commands = ['fight', 'bag', 'pokemon', 'run'];
  battle.runAttempts = 0;
  battle.caughtMon = null;
  battle.currentScriptLabel = 'BattleIntroPrintWildMonAttacked';
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

export const performCaptureAttempt = (
  battle: BattleState,
  encounterState: BattleEncounterState,
  bag?: BagState,
  preferredItemId?: 'ITEM_POKE_BALL' | 'ITEM_GREAT_BALL'
): CaptureResult => {
  const pokeBallCount = bag ? getBagQuantity(bag, 'ITEM_POKE_BALL') : battle.bag.pokeBalls;
  const greatBallCount = bag ? getBagQuantity(bag, 'ITEM_GREAT_BALL') : battle.bag.greatBalls;
  const useGreatBall = preferredItemId
    ? preferredItemId === 'ITEM_GREAT_BALL'
    : pokeBallCount <= 0 && greatBallCount > 0;
  const selectedItemId = useGreatBall ? 'ITEM_GREAT_BALL' : 'ITEM_POKE_BALL';

  if ((selectedItemId === 'ITEM_POKE_BALL' && pokeBallCount <= 0) || (selectedItemId === 'ITEM_GREAT_BALL' && greatBallCount <= 0)) {
    return {
      caught: false,
      shakes: 0,
      ballLabel: 'NONE',
      usedItemId: null
    };
  }

  if (useGreatBall) {
    if (bag) {
      bag.pockets.pokeBalls = bag.pockets.pokeBalls.map((slot) =>
        slot.itemId === 'ITEM_GREAT_BALL'
          ? { ...slot, quantity: slot.quantity - 1 }
          : slot
      ).filter((slot) => slot.quantity > 0);
      battle.bag.greatBalls = getBagQuantity(bag, 'ITEM_GREAT_BALL');
    } else {
      battle.bag.greatBalls -= 1;
    }
  } else {
    if (bag) {
      bag.pockets.pokeBalls = bag.pockets.pokeBalls.map((slot) =>
        slot.itemId === 'ITEM_POKE_BALL'
          ? { ...slot, quantity: slot.quantity - 1 }
          : slot
      ).filter((slot) => slot.quantity > 0);
      battle.bag.pokeBalls = getBagQuantity(bag, 'ITEM_POKE_BALL');
    } else {
      battle.bag.pokeBalls -= 1;
    }
  }

  const ballBonus = useGreatBall ? 1.5 : 1;
  const statusBonus = getStatusBonus(battle.wildMon.status);
  const catchNumerator =
    ((3 * battle.wildMon.maxHp) - (2 * battle.wildMon.hp)) * battle.wildMon.catchRate * ballBonus;
  const catchDenominator = 3 * battle.wildMon.maxHp;
  const a = Math.floor((catchNumerator / Math.max(1, catchDenominator)) * statusBonus);

  if (a >= 255) {
    return {
      caught: true,
      shakes: 4,
      ballLabel: useGreatBall ? 'GREAT BALL' : 'POKé BALL',
      usedItemId: useGreatBall ? 'ITEM_GREAT_BALL' : 'ITEM_POKE_BALL'
    };
  }

  const aClamped = Math.max(1, a);
  const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / aClamped)));

  let shakes = 0;
  for (let i = 0; i < 4; i += 1) {
    const shakeRoll = nextBattleRng(encounterState) & 0xffff;
    if (shakeRoll < b) {
      shakes += 1;
      continue;
    }

    break;
  }

  return {
    caught: shakes === 4,
    shakes,
    ballLabel: useGreatBall ? 'GREAT BALL' : 'POKé BALL',
    usedItemId: useGreatBall ? 'ITEM_GREAT_BALL' : 'ITEM_POKE_BALL'
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
  const pokeBalls = bag ? getBagQuantity(bag, 'ITEM_POKE_BALL') : battle.bag.pokeBalls;
  const greatBalls = bag ? getBagQuantity(bag, 'ITEM_GREAT_BALL') : battle.bag.greatBalls;
  const choices: BattleBagChoice[] = [];

  if (pokeBalls > 0) {
    choices.push({ itemId: 'ITEM_POKE_BALL', label: 'POKé BALL', quantity: pokeBalls, isExit: false });
  }

  if (greatBalls > 0) {
    choices.push({ itemId: 'ITEM_GREAT_BALL', label: 'GREAT BALL', quantity: greatBalls, isExit: false });
  }

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
      battle.active = false;
      battle.phase = 'intro';
      battle.turnSummary = '';
      battle.damagePreview = null;
      battle.caughtMon = null;
      battle.queuedMessages = [];
      battle.queuedControllerCommands = [];
      battle.currentScriptLabel = null;
      battle.sideState = {
        player: createSideState(),
        opponent: createSideState()
      };
      battle.weather = 'none';
      battle.weatherTurns = 0;
      for (const partyMember of battle.party) {
        resetBattlePokemonTransientState(partyMember);
      }
      resetBattlePokemonTransientState(battle.wildMon);
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
    if (selectedCommand === 'fight') {
      battle.phase = 'moveSelect';
      battle.turnSummary = 'Choose a move.';
      updateMovePreview(battle);
      return;
    }

    if (selectedCommand === 'bag') {
      if (battle.bag.pokeBalls <= 0 && battle.bag.greatBalls <= 0) {
        battle.turnSummary = 'No balls left!';
        return;
      }

      battle.phase = 'bagSelect';
      battle.selectedBagIndex = 0;
      battle.turnSummary = 'Choose an item.';
      return;
    }

    if (selectedCommand === 'pokemon') {
      battle.phase = 'partySelect';
      battle.turnSummary = 'Choose a Pokémon.';
      return;
    }

    const escaped = tryRunFromBattle(battle.playerMon, battle.wildMon, battle.runAttempts, encounterState);
    battle.runAttempts += 1;
    if (escaped) {
      battle.currentScriptLabel = 'BattleScript_GotAwaySafely';
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

    const capture = performCaptureAttempt(battle, encounterState, bag, selectedChoice.itemId);
    if (capture.ballLabel === 'NONE') {
      battle.phase = 'command';
      battle.turnSummary = 'No balls left!';
      return;
    }

    battle.currentScriptLabel = 'BattleScript_ThrowBall';
    if (capture.caught) {
      battle.caughtMon = cloneBattlePokemon(battle.wildMon);
      queueMessages(
        battle,
        [`${capture.ballLabel} thrown!`, `Gotcha! ${battle.wildMon.species} was caught!`],
        'resolved'
      );
    } else {
      resolveEnemyOnlyTurn(
        battle,
        encounterState,
        [`${capture.ballLabel} thrown!`, `Oh no! The Pokémon broke free after ${capture.shakes} shakes!`]
      );
    }
    return;
  }

  if (battle.phase === 'partySelect') {
    if (input.upPressed || input.leftPressed) {
      battle.selectedPartyIndex = stepCyclicSelection(battle.selectedPartyIndex, battle.party.length, -1);
    } else if (input.downPressed || input.rightPressed) {
      battle.selectedPartyIndex = stepCyclicSelection(battle.selectedPartyIndex, battle.party.length, 1);
    }

    if (input.cancelPressed && battle.playerMon.hp > 0) {
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
  if (selectedMove && selectedMove.ppRemaining <= 0 && hasUsableMove(battle.moves)) {
    battle.turnSummary = `There's no PP left for ${selectedMove.name}!`;
    return;
  }

  resolveSelectedMoveTurn(battle, encounterState);
};
