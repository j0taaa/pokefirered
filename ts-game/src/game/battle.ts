import type { InputSnapshot } from '../input/inputState';
import { getBagQuantity, type BagState } from './bag';
import type { DecompTypeId } from './decompSpecies';
import { getDecompSpeciesInfo } from './decompSpecies';
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
export type StatusCondition = 'none' | 'poison' | 'burn' | 'paralysis' | 'sleep' | 'freeze';

export interface BattleStatStages {
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
  accuracy: number;
  evasion: number;
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
  moves: BattleMove[];
  statStages: BattleStatStages;
}

export interface BattleEncounterState {
  stepsSinceLastEncounter: number;
  encounterRate: number;
  rngState: number;
}

export type BattleCommand = 'fight' | 'bag' | 'pokemon' | 'run';
export type BattlePhase = 'intro' | 'command' | 'moveSelect' | 'partySelect' | 'bagSelect' | 'script' | 'resolved';

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
  EFFECT_EVASION_DOWN_2: { target: 'target', stat: 'evasion', delta: -2 }
};

const secondaryStatusByEffect: Partial<Record<string, StatusCondition>> = {
  EFFECT_POISON_HIT: 'poison',
  EFFECT_BURN_HIT: 'burn',
  EFFECT_PARALYZE_HIT: 'paralysis',
  EFFECT_FREEZE_HIT: 'freeze',
  EFFECT_SLEEP: 'sleep',
  EFFECT_TOXIC: 'poison'
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

const cloneMove = (move: BattleMove): BattleMove => ({ ...move });

const cloneBattlePokemon = (pokemon: BattlePokemonSnapshot): BattlePokemonSnapshot => ({
  ...pokemon,
  types: [...pokemon.types],
  moves: pokemon.moves.map(cloneMove),
  statStages: { ...pokemon.statStages }
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
    moves: getKnownMovesForSpecies(normalizedSpecies, level),
    statStages: createStatStages()
  };
};

export const createBattlePokemonFromFieldPokemon = (pokemon: FieldPokemon): BattlePokemonSnapshot => ({
  species: normalizeSpecies(pokemon.species),
  level: pokemon.level,
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
  moves: getKnownMovesForSpecies(pokemon.species, pokemon.level),
  statStages: createStatStages()
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
  Math.max(1, Math.min(255, Math.floor(moveAccuracy * (getStageMultiplier(attackerStage) / getStageMultiplier(defenderStage)))));

const getOffenseStat = (pokemon: BattlePokemonSnapshot, move: BattleMove): number =>
  specialTypes.has(move.type)
    ? getModifiedStat(pokemon.spAttack, pokemon.statStages.spAttack)
    : getModifiedStat(pokemon.attack, pokemon.statStages.attack);

const getDefenseStat = (pokemon: BattlePokemonSnapshot, move: BattleMove): number =>
  specialTypes.has(move.type)
    ? getModifiedStat(pokemon.spDefense, pokemon.statStages.spDefense)
    : getModifiedStat(pokemon.defense, pokemon.statStages.defense);

export const calculateBaseDamage = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): number => {
  if (move.power <= 0) {
    return 0;
  }

  const attackStat = getOffenseStat(attacker, move);
  const defenseStat = getDefenseStat(defender, move);
  const levelTerm = Math.floor((2 * attacker.level) / 5) + 2;
  const numerator = levelTerm * move.power * attackStat;
  const denominator = Math.max(1, defenseStat);
  const scaled = Math.floor(numerator / denominator);
  return Math.floor(scaled / 50) + 2;
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
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState
): number => {
  const preview = calculateDamagePreview(attacker, defender, move);
  if (preview.max === 0) {
    return 0;
  }

  const randomFactor = 217 + (nextBattleRng(encounterState) % 39);
  return clampDamage((preview.max * randomFactor) / 255);
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
  const playerSpeed = getModifiedStat(player.speed, player.statStages.speed);
  const enemySpeed = getModifiedStat(enemy.speed, enemy.statStages.speed);
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
    return 0;
  }

  return usable[nextEncounterRoll(encounter, usable.length)]?.index ?? usable[0].index;
};

const hasLivingBenchMon = (battle: BattleState): boolean =>
  battle.party.some((member) => member !== battle.playerMon && member.hp > 0);

const applyStatusDamage = (pokemon: BattlePokemonSnapshot): string | null => {
  if (pokemon.hp <= 0) {
    return null;
  }

  if (pokemon.status === 'poison' || pokemon.status === 'burn') {
    const damage = Math.max(1, Math.floor(pokemon.maxHp / 8));
    pokemon.hp = Math.max(0, pokemon.hp - damage);
    return `${pokemon.species} is hurt by ${pokemon.status}!`;
  }

  return null;
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

const applyStageEffect = (
  effect: string,
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  messages: string[]
): boolean => {
  const stageEffect = stageEffectTable[effect];
  if (!stageEffect) {
    return false;
  }

  const recipient = stageEffect.target === 'self' ? attacker : defender;
  const previous = recipient.statStages[stageEffect.stat];
  const next = Math.max(-6, Math.min(6, previous + stageEffect.delta));
  recipient.statStages[stageEffect.stat] = next;
  messages.push(`${recipient.species}'s ${formatStatLabel(stageEffect.stat)} ${lowerOrRaiseText(stageEffect.delta)}`);
  return true;
};

const maybeApplySecondaryStatus = (
  move: BattleMove,
  target: BattlePokemonSnapshot,
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

  target.status = nextStatus;
  switch (nextStatus) {
    case 'poison':
      messages.push(`${target.species} was poisoned!`);
      break;
    case 'burn':
      messages.push(`${target.species} was burned!`);
      break;
    case 'paralysis':
      messages.push(`${target.species} is paralyzed! It may be unable to move!`);
      break;
    case 'sleep':
      messages.push(`${target.species} fell asleep!`);
      break;
    case 'freeze':
      messages.push(`${target.species} was frozen solid!`);
      break;
    default:
      break;
  }
};

const applyQueuedDamage = (
  battle: BattleState,
  battler: 'player' | 'opponent',
  nextHp: number
): void => {
  battle.queuedControllerCommands.push({ type: 'hp', battler, value: nextHp });
};

const getActorLabel = (side: 'player' | 'opponent', battle: BattleState): string =>
  side === 'player' ? battle.playerMon.species : `Foe ${battle.wildMon.species}`;

const getFaintMessage = (side: 'player' | 'opponent', battle: BattleState): string =>
  side === 'player' ? `${battle.playerMon.species} fainted!` : `Foe ${battle.wildMon.species} fainted!`;

const canMoveThisTurn = (pokemon: BattlePokemonSnapshot, encounterState: BattleEncounterState, messages: string[]): boolean => {
  if (pokemon.hp <= 0) {
    return false;
  }

  if (pokemon.status === 'sleep') {
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

  return true;
};

const attemptAccuracy = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove,
  encounterState: BattleEncounterState
): boolean => {
  if (move.accuracy === 0) {
    return true;
  }

  const accuracyValue = getAccuracyAdjustedValue(
    move.accuracy,
    attacker.statStages.accuracy,
    defender.statStages.evasion
  );
  return (nextBattleRng(encounterState) & 0xff) < accuracyValue;
};

const executeMove = (
  battle: BattleState,
  attackerSide: 'player' | 'opponent',
  move: BattleMove,
  encounterState: BattleEncounterState
): string[] => {
  const messages: string[] = [];
  const attacker = attackerSide === 'player' ? battle.playerMon : battle.wildMon;
  const defender = attackerSide === 'player' ? battle.wildMon : battle.playerMon;
  const defenderSide = attackerSide === 'player' ? 'opponent' : 'player';

  battle.currentScriptLabel = move.effectScriptLabel;
  battle.queuedControllerCommands.push({ type: 'script', label: move.effectScriptLabel });

  if (!canMoveThisTurn(attacker, encounterState, messages)) {
    return messages;
  }

  if (move.ppRemaining > 0) {
    move.ppRemaining -= 1;
  }

  pushMessage(messages, battle, `${getActorLabel(attackerSide, battle)} used ${move.name}!`);

  if (!attemptAccuracy(attacker, defender, move, encounterState)) {
    pushMessage(messages, battle, 'The attack missed!');
    return messages;
  }

  if (move.power > 0) {
    const typeEffectiveness = calculateTypeEffectiveness(move.type, defender.types);
    if (typeEffectiveness === 0) {
      pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
      return messages;
    }

    const damage = calculateDamageRoll(attacker, defender, move, encounterState);
    defender.hp = Math.max(0, defender.hp - damage);
    applyQueuedDamage(battle, defenderSide, defender.hp);

    if (typeEffectiveness > 1) {
      pushMessage(messages, battle, "It's super effective!");
    } else if (typeEffectiveness < 1) {
      pushMessage(messages, battle, "It's not very effective...");
    }

    maybeApplySecondaryStatus(move, defender, encounterState, messages);
  } else if (!applyStageEffect(move.effect, attacker, defender, messages)) {
    pushMessage(messages, battle, 'But nothing happened!');
  }

  if (defender.hp === 0) {
    pushMessage(messages, battle, getFaintMessage(defenderSide, battle));
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

  const playerSpeed = getModifiedStat(battle.playerMon.speed, battle.playerMon.statStages.speed);
  const enemySpeed = getModifiedStat(battle.wildMon.speed, battle.wildMon.statStages.speed);
  if (playerSpeed !== enemySpeed) {
    return playerSpeed > enemySpeed ? ['player', 'opponent'] : ['opponent', 'player'];
  }

  return (nextBattleRng(encounterState) & 1) === 0 ? ['player', 'opponent'] : ['opponent', 'player'];
};

const resolveEndOfTurn = (battle: BattleState): string[] => {
  const messages: string[] = [];
  const enemyStatusMessage = applyStatusDamage(battle.wildMon);
  if (enemyStatusMessage) {
    messages.push(enemyStatusMessage);
  }

  const playerStatusMessage = applyStatusDamage(battle.playerMon);
  if (playerStatusMessage) {
    messages.push(playerStatusMessage);
  }

  if (battle.wildMon.hp === 0 && !messages.includes(getFaintMessage('opponent', battle))) {
    messages.push(getFaintMessage('opponent', battle));
  }
  if (battle.playerMon.hp === 0 && !messages.includes(getFaintMessage('player', battle))) {
    messages.push(getFaintMessage('player', battle));
  }

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
  const enemyMove = battle.wildMoves[chooseEnemyMoveIndex(battle, encounterState)] ?? battle.wildMoves[0];
  const messages = [...leadingMessages];

  if (enemyMove) {
    messages.push(...executeMove(battle, 'opponent', enemyMove, encounterState));
  }

  if (battle.playerMon.hp > 0 && battle.wildMon.hp > 0) {
    messages.push(...resolveEndOfTurn(battle));
  }

  enqueueTurnMessages(battle, messages);
};

const resolveSelectedMoveTurn = (battle: BattleState, encounterState: BattleEncounterState): void => {
  battle.queuedControllerCommands = [];
  const playerMove = battle.moves[battle.selectedMoveIndex];
  const enemyMove = battle.wildMoves[chooseEnemyMoveIndex(battle, encounterState)] ?? battle.wildMoves[0];
  if (!playerMove || !enemyMove) {
    return;
  }

  const messages: string[] = [];
  const order = getActionOrder(battle, playerMove, enemyMove, encounterState);

  for (const actor of order) {
    if (battle.playerMon.hp === 0 || battle.wildMon.hp === 0) {
      break;
    }

    messages.push(...executeMove(
      battle,
      actor,
      actor === 'player' ? playerMove : enemyMove,
      encounterState
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
      queueMessages(
        battle,
        [`${capture.ballLabel} thrown!`, `Oh no! The Pokémon broke free after ${capture.shakes} shakes!`],
        'command',
        getPromptSummary(battle)
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

    battle.playerMon = target;
    refreshActiveMovePointers(battle);
    queueMessages(battle, [`Go! ${target.species}!`], 'command', getPromptSummary(battle));
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

  resolveSelectedMoveTurn(battle, encounterState);
};
