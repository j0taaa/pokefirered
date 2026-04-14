import type { InputSnapshot } from '../input/inputState';

export interface BattlePokemonSnapshot {
  species: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  type: 'normal';
}

export interface BattleMove {
  id: string;
  name: string;
  power: number;
  type: 'normal';
  accuracy: number;
}

export interface BattleEncounterState {
  stepsSinceLastEncounter: number;
  encounterRate: number;
  rngState: number;
}

export interface BattleState {
  active: boolean;
  phase: 'intro' | 'command' | 'resolved';
  playerMon: BattlePokemonSnapshot;
  wildMon: BattlePokemonSnapshot;
  moves: BattleMove[];
  selectedMoveIndex: number;
  turnSummary: string;
  damagePreview: {
    min: number;
    max: number;
  } | null;
}

const RAND_MULT = 1103515245;
const ISO_RANDOMIZE2_ADD = 12345;

const clampDamage = (value: number): number => Math.max(1, Math.floor(value));

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

export const calculateDamagePreview = (
  attacker: BattlePokemonSnapshot,
  defender: BattlePokemonSnapshot,
  move: BattleMove
): { min: number; max: number } => {
  const baseDamage = calculateBaseDamage(attacker, defender, move);
  const stab = attacker.type === move.type ? 1.5 : 1;
  const max = clampDamage(baseDamage * stab);
  // In Gen 3, random damage factor is 217..255 out of 255.
  const min = clampDamage((max * 217) / 255);
  return { min, max };
};

const nextEncounterRng = (state: BattleEncounterState): number => {
  state.rngState = (RAND_MULT * state.rngState + ISO_RANDOMIZE2_ADD) >>> 0;
  return state.rngState >>> 16;
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
  return (nextEncounterRng(state) % 100) < 5;
};

export const createBattleEncounterState = (): BattleEncounterState => ({
  stepsSinceLastEncounter: 0,
  encounterRate: 30,
  rngState: 0x4a3b
});

export const createBattleState = (): BattleState => {
  const playerMon: BattlePokemonSnapshot = {
    species: 'CHARMANDER',
    level: 8,
    maxHp: 23,
    hp: 23,
    attack: 13,
    defense: 11,
    speed: 14,
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
    playerMon,
    wildMon,
    moves: [
      { id: 'tackle', name: 'TACKLE', power: 40, type: 'normal', accuracy: 100 },
      { id: 'scratch', name: 'SCRATCH', power: 40, type: 'normal', accuracy: 100 }
    ],
    selectedMoveIndex: 0,
    turnSummary: '',
    damagePreview: null
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
  battle.selectedMoveIndex = 0;
  battle.turnSummary = `Wild ${battle.wildMon.species} appeared!`;
  battle.damagePreview = calculateDamagePreview(battle.playerMon, battle.wildMon, battle.moves[0]);
  encounter.stepsSinceLastEncounter = 0;
  return true;
};

export const isBattleBlockingWorld = (battle: BattleState): boolean => battle.active;

export const stepBattle = (battle: BattleState, input: InputSnapshot): void => {
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

  const selectedMove = battle.moves[battle.selectedMoveIndex];
  const preview = calculateDamagePreview(battle.playerMon, battle.wildMon, selectedMove);
  battle.damagePreview = preview;

  battle.wildMon.hp = Math.max(0, battle.wildMon.hp - preview.max);
  if (battle.wildMon.hp === 0) {
    battle.phase = 'resolved';
    battle.turnSummary = `Enemy ${battle.wildMon.species} fainted!`;
    return;
  }

  const enemyPreview = calculateDamagePreview(battle.wildMon, battle.playerMon, battle.moves[0]);
  battle.playerMon.hp = Math.max(0, battle.playerMon.hp - enemyPreview.min);
  battle.turnSummary = `${battle.playerMon.species} used ${selectedMove.name}!`; 

  if (battle.playerMon.hp === 0) {
    battle.phase = 'resolved';
    battle.turnSummary = `${battle.playerMon.species} fainted...`;
  }
};
