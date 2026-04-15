import type { InputSnapshot } from '../input/inputState';
import type { WildEncounterGroupSource } from '../world/mapSource';

export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel';

export type StatusCondition = 'none' | 'poison';

export interface BattlePokemonSnapshot {
  species: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  catchRate: number;
  types: PokemonType[];
  status: StatusCondition;
}

export interface BattleMove {
  id: string;
  name: string;
  power: number;
  type: PokemonType;
  accuracy: number;
}

export interface BattleEncounterState {
  stepsSinceLastEncounter: number;
  encounterRate: number;
  rngState: number;
}

export type BattleCommand = 'fight' | 'bag' | 'pokemon' | 'run';
export type BattlePhase = 'intro' | 'command' | 'moveSelect' | 'partySelect' | 'resolved';

export interface BattleState {
  active: boolean;
  phase: BattlePhase;
  playerMon: BattlePokemonSnapshot;
  party: BattlePokemonSnapshot[];
  wildMon: BattlePokemonSnapshot;
  moves: BattleMove[];
  selectedMoveIndex: number;
  selectedCommandIndex: number;
  commands: BattleCommand[];
  selectedPartyIndex: number;
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
}

export interface CaptureResult {
  caught: boolean;
  shakes: number;
  ballLabel: string;
}

const RAND_MULT = 1103515245;
const ISO_RANDOMIZE2_ADD = 12345;

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

const clampDamage = (value: number): number => Math.max(1, Math.floor(value));

const nextBattleRng = (state: BattleEncounterState): number => {
  state.rngState = (RAND_MULT * state.rngState + ISO_RANDOMIZE2_ADD) >>> 0;
  return state.rngState >>> 16;
};

// Mirrors the core Gen 3 base formula in src/pokemon.c::CalculateBaseDamage,
// with intentionally scoped simplifications (single-hit, no weather/items/abilities).
export const calculateBaseDamage = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): number => {
  const levelTerm = Math.floor((2 * attacker.level) / 5) + 2;
  const numerator = levelTerm * move.power * attacker.attack;
  const denominator = Math.max(1, defender.defense);
  const scaled = Math.floor(numerator / denominator);
  return Math.floor(scaled / 50) + 2;
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

export const calculateDamagePreview = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): { min: number; max: number } => {
  const baseDamage = calculateBaseDamage(attacker, defender, move);
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const typeBonus = calculateTypeEffectiveness(move.type, defender.types);
  const max = clampDamage(baseDamage * stab * typeBonus);
  // In Gen 3, random damage factor is 217..255 out of 255.
  const min = clampDamage((max * 217) / 255);
  return { min, max };
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

// Approximation of wild_encounter.c::HandleWildEncounterCooldown without item/ability modifiers.
export const shouldStartWildEncounter = (state: BattleEncounterState): boolean => {
  const minSteps = getMapBaseEncounterCooldown(state.encounterRate);
  if (state.stepsSinceLastEncounter >= minSteps) {
    return true;
  }

  state.stepsSinceLastEncounter += 1;
  return (nextBattleRng(state) % 100) < 5;
};

const tryRunFromBattle = (
  player: BattlePokemonSnapshot,
  enemy: BattlePokemonSnapshot,
  runAttempts: number,
  encounter: BattleEncounterState
): boolean => {
  if (player.speed >= enemy.speed) {
    return true;
  }

  // Mirrors battle_main.c::TryRunFromBattle speedVar branch.
  const speedVar = Math.floor((player.speed * 128) / Math.max(1, enemy.speed)) + (runAttempts * 30);
  const roll = nextBattleRng(encounter) & 0xff;
  return speedVar > roll;
};

const chooseEnemyMoveIndex = (battle: BattleState, encounter: BattleEncounterState): number => {
  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < battle.moves.length; i += 1) {
    const move = battle.moves[i];
    const preview = calculateDamagePreview(battle.wildMon, battle.playerMon, move);
    const typeBonus = calculateTypeEffectiveness(move.type, battle.playerMon.types);
    const accuracyWeight = move.accuracy / 100;
    const expectedDamage = preview.max * accuracyWeight;
    const koBonus = preview.max >= battle.playerMon.hp ? 10_000 : 0;
    const superEffectiveBonus = typeBonus > 1 ? 50 : 0;
    const resistedPenalty = typeBonus < 1 ? -25 : 0;
    const score = expectedDamage + koBonus + superEffectiveBonus + resistedPenalty;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
      continue;
    }

    if (score === bestScore) {
      const coinFlip = nextBattleRng(encounter) & 1;
      if (coinFlip === 1) {
        bestIndex = i;
      }
    }
  }

  return bestIndex;
};

const speciesProfile: Record<string, Pick<BattlePokemonSnapshot, 'catchRate' | 'types'>> = {
  SPECIES_PIDGEY: {
    catchRate: 255,
    types: ['normal', 'flying']
  },
  SPECIES_RATTATA: {
    catchRate: 255,
    types: ['normal']
  }
};

const createWildPokemonFromEncounter = (
  wildTable: WildEncounterGroupSource,
  encounter: BattleEncounterState
): BattlePokemonSnapshot | null => {
  if (wildTable.mons.length === 0) {
    return null;
  }

  const totalSlotRate = wildTable.mons.reduce((sum, mon) => sum + (mon.slotRate ?? 0), 0);
  const roll = totalSlotRate > 0 ? nextBattleRng(encounter) % totalSlotRate : nextBattleRng(encounter) % wildTable.mons.length;
  let runningRate = 0;
  const mon = totalSlotRate > 0
    ? wildTable.mons.find((candidate) => {
      runningRate += candidate.slotRate ?? 0;
      return roll < runningRate;
    }) ?? wildTable.mons[0]
    : wildTable.mons[roll];
  const levelRange = mon.maxLevel - mon.minLevel + 1;
  const level = mon.minLevel + (levelRange > 1 ? nextBattleRng(encounter) % levelRange : 0);
  const profile = speciesProfile[mon.species] ?? { catchRate: 255, types: ['normal'] };
  const baseHp = mon.species === 'SPECIES_RATTATA' ? 18 : 19;
  const baseAttack = mon.species === 'SPECIES_RATTATA' ? 56 : 45;
  const baseDefense = mon.species === 'SPECIES_RATTATA' ? 35 : 40;
  const baseSpeed = mon.species === 'SPECIES_RATTATA' ? 72 : 56;

  return {
    species: mon.species.replace('SPECIES_', ''),
    level,
    maxHp: Math.max(10, Math.floor(baseHp + level * 2.1)),
    hp: Math.max(10, Math.floor(baseHp + level * 2.1)),
    attack: Math.max(5, Math.floor(baseAttack / 5 + level)),
    defense: Math.max(5, Math.floor(baseDefense / 5 + level)),
    speed: Math.max(5, Math.floor(baseSpeed / 5 + level)),
    catchRate: profile.catchRate,
    types: [...profile.types],
    status: 'none'
  };
};

export const createBattleEncounterState = (): BattleEncounterState => ({
  stepsSinceLastEncounter: 0,
  encounterRate: 30,
  rngState: 0x4a3b
});

export const createBattleState = (): BattleState => {
  const playerMonA: BattlePokemonSnapshot = {
    species: 'CHARMANDER',
    level: 8,
    maxHp: 23,
    hp: 23,
    attack: 13,
    defense: 11,
    speed: 14,
    catchRate: 45,
    types: ['fire'],
    status: 'none'
  };
  const playerMonB: BattlePokemonSnapshot = {
    species: 'PIDGEY',
    level: 7,
    maxHp: 21,
    hp: 21,
    attack: 11,
    defense: 10,
    speed: 13,
    catchRate: 255,
    types: ['normal', 'flying'],
    status: 'none'
  };
  const wildMon: BattlePokemonSnapshot = {
    species: 'PIDGEY',
    level: 3,
    maxHp: 14,
    hp: 14,
    attack: 8,
    defense: 7,
    speed: 8,
    catchRate: 255,
    types: ['normal', 'flying'],
    status: 'none'
  };

  return {
    active: false,
    phase: 'intro',
    playerMon: playerMonA,
    party: [playerMonA, playerMonB],
    wildMon,
    moves: [
      { id: 'tackle', name: 'TACKLE', power: 40, type: 'normal', accuracy: 100 },
      { id: 'ember', name: 'EMBER', power: 40, type: 'fire', accuracy: 100 }
    ],
    selectedMoveIndex: 0,
    selectedCommandIndex: 0,
    commands: ['fight', 'bag', 'pokemon', 'run'],
    selectedPartyIndex: 0,
    turnSummary: '',
    damagePreview: null,
    runAttempts: 0,
    bag: {
      pokeBalls: 5,
      greatBalls: 1
    }
  };
};

export const tryStartWildBattle = (
  battle: BattleState,
  encounter: BattleEncounterState,
  playerMoved: boolean,
  canEncounterOnTile = true,
  wildTable?: WildEncounterGroupSource
): boolean => {
  if (!playerMoved || battle.active || !canEncounterOnTile) {
    return false;
  }

  if (!shouldStartWildEncounter(encounter)) {
    return false;
  }

  battle.active = true;
  battle.phase = 'intro';
  if (wildTable) {
    const generatedWildMon = createWildPokemonFromEncounter(wildTable, encounter);
    if (generatedWildMon) {
      battle.wildMon = generatedWildMon;
    }
  }
  battle.wildMon.hp = battle.wildMon.maxHp;
  battle.wildMon.status = 'none';
  battle.playerMon.hp = battle.playerMon.maxHp;
  battle.playerMon.status = 'none';
  battle.party.forEach((mon) => {
    mon.hp = mon.maxHp;
    mon.status = 'none';
  });
  battle.selectedMoveIndex = 0;
  battle.selectedCommandIndex = 0;
  battle.selectedPartyIndex = 0;
  battle.commands = ['fight', 'bag', 'pokemon', 'run'];
  battle.runAttempts = 0;
  battle.turnSummary = `Wild ${battle.wildMon.species} appeared!`;
  battle.damagePreview = calculateDamagePreview(battle.playerMon, battle.wildMon, battle.moves[0]);
  encounter.stepsSinceLastEncounter = 0;
  return true;
};

export const isBattleBlockingWorld = (battle: BattleState): boolean => battle.active;

const applyEndOfTurnPoison = (pokemon: BattlePokemonSnapshot): string | null => {
  if (pokemon.status !== 'poison' || pokemon.hp <= 0) {
    return null;
  }

  const poisonDamage = Math.max(1, Math.floor(pokemon.maxHp / 8));
  pokemon.hp = Math.max(0, pokemon.hp - poisonDamage);
  return `${pokemon.species} is hurt by poison!`;
};

export const performCaptureAttempt = (
  battle: BattleState,
  encounterState: BattleEncounterState
): CaptureResult => {
  const useGreatBall = battle.bag.pokeBalls <= 0 && battle.bag.greatBalls > 0;

  if (!useGreatBall && battle.bag.pokeBalls <= 0) {
    return {
      caught: false,
      shakes: 0,
      ballLabel: 'NONE'
    };
  }

  if (useGreatBall) {
    battle.bag.greatBalls -= 1;
  } else {
    battle.bag.pokeBalls -= 1;
  }

  const ballBonus = useGreatBall ? 1.5 : 1;
  const statusBonus = battle.wildMon.status === 'poison' ? 1.5 : 1;

  const catchNumerator =
    ((3 * battle.wildMon.maxHp) - (2 * battle.wildMon.hp)) * battle.wildMon.catchRate * ballBonus;
  const catchDenominator = 3 * battle.wildMon.maxHp;
  const a = Math.floor((catchNumerator / Math.max(1, catchDenominator)) * statusBonus);

  if (a >= 255) {
    return {
      caught: true,
      shakes: 4,
      ballLabel: useGreatBall ? 'GREAT BALL' : 'POKé BALL'
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
    ballLabel: useGreatBall ? 'GREAT BALL' : 'POKé BALL'
  };
};

export const stepBattle = (
  battle: BattleState,
  input: InputSnapshot,
  encounterState: BattleEncounterState = createBattleEncounterState()
): void => {
  if (!battle.active) {
    return;
  }

  if (battle.phase === 'intro') {
    if (input.interactPressed || input.startPressed) {
      battle.phase = 'command';
      battle.turnSummary = `Go! ${battle.playerMon.species}!`;
    }
    return;
  }

  if (battle.phase === 'resolved') {
    if (input.interactPressed || input.cancelPressed || input.startPressed) {
      battle.active = false;
      battle.phase = 'intro';
      battle.turnSummary = '';
      battle.damagePreview = null;
    }
    return;
  }

  if (battle.phase === 'command') {
    if (input.upPressed || input.downPressed) {
      const direction = input.upPressed ? -1 : 1;
      battle.selectedCommandIndex = (battle.selectedCommandIndex + direction + battle.commands.length) % battle.commands.length;
    }

    if (!input.interactPressed) {
      return;
    }

    const selectedCommand = battle.commands[battle.selectedCommandIndex];
    if (selectedCommand === 'fight') {
      battle.phase = 'moveSelect';
      battle.turnSummary = 'Choose a move.';
      battle.damagePreview = calculateDamagePreview(
        battle.playerMon,
        battle.wildMon,
        battle.moves[battle.selectedMoveIndex]
      );
      return;
    }

    if (selectedCommand === 'bag') {
      if (battle.bag.pokeBalls <= 0 && battle.bag.greatBalls <= 0) {
        battle.turnSummary = 'No balls left!';
        return;
      }

      const capture = performCaptureAttempt(battle, encounterState);
      if (capture.ballLabel === 'NONE') {
        battle.turnSummary = 'No balls left!';
        return;
      }

      if (capture.caught) {
        battle.phase = 'resolved';
        battle.turnSummary = `${capture.ballLabel}... shake x4! Gotcha! ${battle.wildMon.species} was caught!`;
      } else {
        battle.turnSummary = `${capture.ballLabel}... shake x${capture.shakes}. Oh no! The Pokémon broke free!`;
      }
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
      battle.phase = 'resolved';
      battle.turnSummary = `${battle.playerMon.species} fled safely!`;
    } else {
      battle.phase = 'moveSelect';
      battle.turnSummary = `Can't escape!`;
    }
    return;
  }

  if (battle.phase === 'partySelect') {
    if (input.upPressed || input.downPressed) {
      const direction = input.upPressed ? -1 : 1;
      battle.selectedPartyIndex =
        (battle.selectedPartyIndex + direction + battle.party.length) % battle.party.length;
    }

    if (input.cancelPressed) {
      battle.phase = 'command';
      battle.turnSummary = 'What will you do?';
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
    battle.phase = 'command';
    battle.turnSummary = `Go! ${target.species}!`;
    battle.damagePreview = calculateDamagePreview(battle.playerMon, battle.wildMon, battle.moves[battle.selectedMoveIndex]);
    return;
  }

  if (input.cancelPressed) {
    battle.phase = 'command';
    battle.turnSummary = 'What will you do?';
    return;
  }

  if (input.upPressed || input.downPressed) {
    const direction = input.upPressed ? -1 : 1;
    const moveCount = battle.moves.length;
    battle.selectedMoveIndex = (battle.selectedMoveIndex + direction + moveCount) % moveCount;
    const selectedMove = battle.moves[battle.selectedMoveIndex];
    battle.damagePreview = calculateDamagePreview(battle.playerMon, battle.wildMon, selectedMove);
  }

  if (!input.interactPressed) {
    return;
  }

  const playerMove = battle.moves[battle.selectedMoveIndex];
  const enemyMove = battle.moves[chooseEnemyMoveIndex(battle, encounterState)];
  const playerActsFirst = battle.playerMon.speed >= battle.wildMon.speed;

  const resolvePlayer = () => {
    const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, playerMove);
    battle.wildMon.hp = Math.max(0, battle.wildMon.hp - preview.max);
    const playerText = `${battle.playerMon.species} used ${playerMove.name}!`;
    battle.turnSummary = battle.turnSummary ? `${battle.turnSummary} ${playerText}` : playerText;
  };

  const resolveEnemy = () => {
    const preview = calculateDamagePreview(battle.wildMon, battle.playerMon, enemyMove);
    battle.playerMon.hp = Math.max(0, battle.playerMon.hp - preview.min);
    battle.turnSummary += ` Enemy ${battle.wildMon.species} used ${enemyMove.name}!`;
  };

  if (playerActsFirst) {
    resolvePlayer();
    if (battle.wildMon.hp === 0) {
      battle.phase = 'resolved';
      battle.turnSummary = `Enemy ${battle.wildMon.species} fainted!`;
      return;
    }

    resolveEnemy();
  } else {
    resolveEnemy();
    if (battle.playerMon.hp === 0) {
      battle.phase = 'resolved';
      battle.turnSummary = `${battle.playerMon.species} fainted...`;
      return;
    }

    resolvePlayer();
  }

  const poisonMessages: string[] = [];
  const enemyPoison = applyEndOfTurnPoison(battle.wildMon);
  if (enemyPoison) {
    poisonMessages.push(enemyPoison);
  }

  const playerPoison = applyEndOfTurnPoison(battle.playerMon);
  if (playerPoison) {
    poisonMessages.push(playerPoison);
  }

  if (poisonMessages.length > 0) {
    battle.turnSummary = `${battle.turnSummary} ${poisonMessages.join(' ')}`;
  }

  if (battle.playerMon.hp === 0) {
    battle.phase = 'resolved';
    battle.turnSummary = `${battle.playerMon.species} fainted...`;
    return;
  }

  if (battle.wildMon.hp === 0) {
    battle.phase = 'resolved';
    battle.turnSummary = `Enemy ${battle.wildMon.species} fainted!`;
    return;
  }

  battle.phase = 'command';
};
