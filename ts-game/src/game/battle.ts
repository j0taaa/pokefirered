import type { InputSnapshot } from '../input/inputState';

export interface BattlePokemonSnapshot {
  species: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  type: 'normal' | 'fire' | 'water' | 'grass';
}

export interface BattleMove {
  id: string;
  name: string;
  power: number;
  type: 'normal' | 'fire' | 'water' | 'grass';
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
  };
}

const RAND_MULT = 1103515245;
const ISO_RANDOMIZE2_ADD = 12345;

const clampDamage = (value: number): number => Math.max(1, Math.floor(value));

const nextBattleRng = (state: BattleEncounterState): number => {
  state.rngState = (RAND_MULT * state.rngState + ISO_RANDOMIZE2_ADD) >>> 0;
  return state.rngState >>> 16;
};

// Mirrors the core Gen 3 base formula in src/pokemon.c::CalculateBaseDamage,
// with intentionally scoped simplifications (single-type, no weather/items/abilities).
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

const typeEffectiveness = (
  moveType: BattlePokemonSnapshot['type'],
  defenderType: BattlePokemonSnapshot['type']
): number => {
  if (moveType === 'fire' && defenderType === 'grass') {
    return 2;
  }
  if (moveType === 'water' && defenderType === 'fire') {
    return 2;
  }
  if (moveType === 'grass' && defenderType === 'water') {
    return 2;
  }
  if (moveType === 'grass' && defenderType === 'fire') {
    return 0.5;
  }
  if (moveType === 'fire' && defenderType === 'water') {
    return 0.5;
  }
  if (moveType === 'water' && defenderType === 'grass') {
    return 0.5;
  }
  return 1;
};

export const calculateDamagePreview = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): { min: number; max: number } => {
  const baseDamage = calculateBaseDamage(attacker, defender, move);
  const stab = attacker.type === move.type ? 1.5 : 1;
  const typeBonus = typeEffectiveness(move.type, defender.type);
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
  let bestScore = -1;
  for (let i = 0; i < battle.moves.length; i += 1) {
    const move = battle.moves[i];
    const preview = calculateDamagePreview(battle.wildMon, battle.playerMon, move);
    const knocksOut = preview.max >= battle.playerMon.hp ? 10_000 : 0;
    const score = knocksOut + preview.max;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
      continue;
    }

    if (score === bestScore) {
      // Mimics a PRNG tie-break instead of deterministic "first move always wins".
      const coinFlip = nextBattleRng(encounter) & 1;
      if (coinFlip === 1) {
        bestIndex = i;
      }
    }
  }

  return bestIndex;
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
    type: 'normal'
  };
  const playerMonB: BattlePokemonSnapshot = {
    species: 'PIDGEY',
    level: 7,
    maxHp: 21,
    hp: 21,
    attack: 11,
    defense: 10,
    speed: 13,
    type: 'normal'
  };
  const wildMon: BattlePokemonSnapshot = {
    species: 'PIDGEY',
    level: 3,
    maxHp: 14,
    hp: 14,
    attack: 8,
    defense: 7,
    speed: 8,
    type: 'normal'
  };

  return {
    active: false,
    phase: 'intro',
    playerMon: playerMonA,
    party: [playerMonA, playerMonB],
    wildMon,
    moves: [
      { id: 'tackle', name: 'TACKLE', power: 40, type: 'normal', accuracy: 100 },
      { id: 'scratch', name: 'SCRATCH', power: 40, type: 'normal', accuracy: 100 }
    ],
    selectedMoveIndex: 0,
    selectedCommandIndex: 0,
    commands: ['fight', 'bag', 'pokemon', 'run'],
    selectedPartyIndex: 0,
    turnSummary: '',
    damagePreview: null,
    runAttempts: 0,
    bag: {
      pokeBalls: 5
    }
  };
};

export const tryStartWildBattle = (
  battle: BattleState,
  encounter: BattleEncounterState,
  playerMoved: boolean
): boolean => {
  if (!playerMoved || battle.active) {
    return false;
  }

  if (!shouldStartWildEncounter(encounter)) {
    return false;
  }

  battle.active = true;
  battle.phase = 'intro';
  battle.wildMon.hp = battle.wildMon.maxHp;
  battle.playerMon.hp = battle.playerMon.maxHp;
  battle.party.forEach((mon) => {
    mon.hp = mon.maxHp;
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
      if (battle.bag.pokeBalls <= 0) {
        battle.turnSummary = 'No Poké Balls left!';
        return;
      }

      // Inspired by FRLG capture probability flow in BattleScript_ThrowPokeBall.
      battle.bag.pokeBalls -= 1;
      const hpFactor = ((3 * battle.wildMon.maxHp) - (2 * battle.wildMon.hp)) / (3 * battle.wildMon.maxHp);
      const levelFactor = Math.max(1, 36 - (2 * battle.wildMon.level));
      const catchChance = Math.min(0.95, 0.1 + hpFactor * (levelFactor / 36));
      const roll = (nextBattleRng(encounterState) & 0xff) / 255;
      if (roll < catchChance) {
        battle.phase = 'resolved';
        battle.turnSummary = `Gotcha! ${battle.wildMon.species} was caught!`;
      } else {
        battle.turnSummary = `Oh no! The Pokémon broke free!`;
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
