export const PARTY_SIZE = 6;
export const MAX_MON_MOVES = 4;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const ITEM_ENIGMA_BERRY = 175;
export const MON_GIVEN_TO_PARTY = 0;
export const MON_GIVEN_TO_PC = 1;
export const PLAYER_HAS_TWO_USABLE_MONS = 0;
export const PLAYER_HAS_ONE_MON = 1;
export const PLAYER_HAS_ONE_USABLE_MON = 2;
export const CHOOSE_MONS_FOR_CABLE_CLUB_BATTLE = 0;
export const CHOOSE_MONS_FOR_BATTLE_TOWER = 1;

export interface ScriptPokemon {
  species: number;
  level: number;
  maxHP: number;
  hp: number;
  ppBonuses: number;
  moves: number[];
  pp: number[];
  status: number;
  heldItem: number;
  isEgg: boolean;
}

export interface ScriptPokemonRuntime {
  playerParty: ScriptPokemon[];
  enemyParty: ScriptPokemon[];
  playerPartyCount: number;
  specialVarResult: number;
  stringVar1: string;
  selectedOrderFromParty: number[];
  mainSavedCallback: string | null;
  mainCallback2: string | null;
  chooseMonsMode: number | null;
  pokedexSeen: Set<number>;
  pokedexCaught: Set<number>;
  giveMonResult: number;
  doubleBattleState: number;
  createdMons: ScriptPokemon[];
  berryNamesByType: Record<number, string>;
}

export const createBlankScriptPokemon = (
  species = SPECIES_NONE,
  level = 1
): ScriptPokemon => ({
  species,
  level,
  maxHP: 1,
  hp: 1,
  ppBonuses: 0,
  moves: [0, 0, 0, 0],
  pp: [0, 0, 0, 0],
  status: 0,
  heldItem: 0,
  isEgg: false
});

export const createScriptPokemonRuntime = (): ScriptPokemonRuntime => ({
  playerParty: Array.from({ length: PARTY_SIZE }, () => createBlankScriptPokemon()),
  enemyParty: Array.from({ length: PARTY_SIZE }, () => createBlankScriptPokemon()),
  playerPartyCount: 0,
  specialVarResult: 0,
  stringVar1: '',
  selectedOrderFromParty: [0, 0, 0],
  mainSavedCallback: null,
  mainCallback2: null,
  chooseMonsMode: null,
  pokedexSeen: new Set(),
  pokedexCaught: new Set(),
  giveMonResult: MON_GIVEN_TO_PARTY,
  doubleBattleState: PLAYER_HAS_TWO_USABLE_MONS,
  createdMons: [],
  berryNamesByType: {
    [ITEM_ENIGMA_BERRY]: 'ENIGMA'
  }
});

export const calculatePPWithBonus = (
  move: number,
  ppBonuses: number,
  moveIndex: number
): number => {
  const basePp = move === 0 ? 0 : 5 + (move % 40);
  const bonusStage = (ppBonuses >> (moveIndex * 2)) & 0x3;
  return Math.trunc((basePp * (5 + bonusStage)) / 5);
};

export const healPlayerParty = (runtime: ScriptPokemonRuntime): void => {
  for (let i = 0; i < runtime.playerPartyCount; i += 1) {
    const mon = runtime.playerParty[i];
    mon.hp = mon.maxHP;
    for (let j = 0; j < MAX_MON_MOVES; j += 1) {
      mon.pp[j] = calculatePPWithBonus(mon.moves[j], mon.ppBonuses, j);
    }
    mon.status = 0;
  }
};

const speciesToNationalPokedexNum = (species: number): number => species;

const createMon = (
  runtime: ScriptPokemonRuntime,
  species: number,
  level: number
): ScriptPokemon => {
  const mon = createBlankScriptPokemon(species, level);
  mon.maxHP = level + 10;
  mon.hp = mon.maxHP;
  runtime.createdMons.push(mon);
  return mon;
};

const giveMonToPlayer = (
  runtime: ScriptPokemonRuntime,
  mon: ScriptPokemon
): number => {
  if (runtime.giveMonResult === MON_GIVEN_TO_PARTY) {
    const slot = runtime.playerPartyCount;
    if (slot < PARTY_SIZE) {
      runtime.playerParty[slot] = { ...mon, moves: [...mon.moves], pp: [...mon.pp] };
      runtime.playerPartyCount += 1;
    }
  }
  return runtime.giveMonResult;
};

export const scriptGiveMon = (
  runtime: ScriptPokemonRuntime,
  species: number,
  level: number,
  item: number,
  _unused1 = 0,
  _unused2 = 0,
  _unused3 = 0
): number => {
  const mon = createMon(runtime, species, level);
  mon.heldItem = item;
  const sentToPc = giveMonToPlayer(runtime, mon);
  const nationalDexNum = speciesToNationalPokedexNum(species);

  switch (sentToPc) {
    case MON_GIVEN_TO_PARTY:
    case MON_GIVEN_TO_PC:
      runtime.pokedexSeen.add(nationalDexNum);
      runtime.pokedexCaught.add(nationalDexNum);
      break;
  }

  return sentToPc;
};

export const scriptGiveEgg = (
  runtime: ScriptPokemonRuntime,
  species: number
): number => {
  const mon = createMon(runtime, species, 5);
  mon.isEgg = true;
  const sentToPc = giveMonToPlayer(runtime, mon);
  return sentToPc;
};

export const hasEnoughMonsForDoubleBattle = (
  runtime: ScriptPokemonRuntime
): void => {
  switch (runtime.doubleBattleState) {
    case PLAYER_HAS_TWO_USABLE_MONS:
      runtime.specialVarResult = PLAYER_HAS_TWO_USABLE_MONS;
      break;
    case PLAYER_HAS_ONE_MON:
      runtime.specialVarResult = PLAYER_HAS_ONE_MON;
      break;
    case PLAYER_HAS_ONE_USABLE_MON:
      runtime.specialVarResult = PLAYER_HAS_ONE_USABLE_MON;
      break;
  }
};

const checkPartyMonHasHeldItem = (
  runtime: ScriptPokemonRuntime,
  item: number
): boolean => {
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const mon = runtime.playerParty[i];
    const species = mon.isEgg ? SPECIES_EGG : mon.species;
    if (species !== SPECIES_NONE && species !== SPECIES_EGG && mon.heldItem === item) {
      return true;
    }
  }
  return false;
};

export const doesPartyHaveEnigmaBerry = (
  runtime: ScriptPokemonRuntime
): boolean => {
  const hasItem = checkPartyMonHasHeldItem(runtime, ITEM_ENIGMA_BERRY);
  if (hasItem === true) {
    runtime.stringVar1 = runtime.berryNamesByType[ITEM_ENIGMA_BERRY] ?? '';
  }
  return hasItem;
};

export const createScriptedWildMon = (
  runtime: ScriptPokemonRuntime,
  species: number,
  level: number,
  item: number
): void => {
  runtime.enemyParty = Array.from({ length: PARTY_SIZE }, () => createBlankScriptPokemon());
  runtime.enemyParty[0] = createMon(runtime, species, level);
  if (item) {
    runtime.enemyParty[0].heldItem = item;
  }
};

export const scriptSetMonMoveSlot = (
  runtime: ScriptPokemonRuntime,
  monIndex: number,
  move: number,
  slot: number
): void => {
  let index = monIndex;
  if (index > PARTY_SIZE) {
    index = runtime.playerPartyCount - 1;
  }
  runtime.playerParty[index].moves[slot] = move;
};

export const chooseHalfPartyForBattle = (
  runtime: ScriptPokemonRuntime
): void => {
  runtime.mainSavedCallback = 'CB2_ReturnFromChooseHalfParty';
  runtime.chooseMonsMode = CHOOSE_MONS_FOR_CABLE_CLUB_BATTLE;
};

export const cb2ReturnFromChooseHalfParty = (
  runtime: ScriptPokemonRuntime
): void => {
  switch (runtime.selectedOrderFromParty[0]) {
    case 0:
      runtime.specialVarResult = 0;
      break;
    default:
      runtime.specialVarResult = 1;
      break;
  }
  runtime.mainCallback2 = 'CB2_ReturnToFieldContinueScriptPlayMapMusic';
};

export const chooseBattleTowerPlayerParty = (
  runtime: ScriptPokemonRuntime
): void => {
  runtime.mainSavedCallback = 'CB2_ReturnFromChooseBattleTowerParty';
  runtime.chooseMonsMode = CHOOSE_MONS_FOR_BATTLE_TOWER;
};

export const cb2ReturnFromChooseBattleTowerParty = (
  runtime: ScriptPokemonRuntime,
  originalParty: ScriptPokemon[]
): void => {
  switch (runtime.selectedOrderFromParty[0]) {
    case 0:
      runtime.playerParty = originalParty.map((mon) => ({ ...mon, moves: [...mon.moves], pp: [...mon.pp] }));
      runtime.specialVarResult = 0;
      break;
    default:
      reducePlayerPartyToThree(runtime);
      runtime.specialVarResult = 1;
      break;
  }
  runtime.mainCallback2 = 'CB2_ReturnToFieldContinueScriptPlayMapMusic';
};

export const reducePlayerPartyToThree = (
  runtime: ScriptPokemonRuntime
): void => {
  const party = Array.from({ length: 3 }, () => createBlankScriptPokemon());
  for (let i = 0; i < 3; i += 1) {
    if (runtime.selectedOrderFromParty[i]) {
      const selected = runtime.playerParty[runtime.selectedOrderFromParty[i] - 1];
      party[i] = { ...selected, moves: [...selected.moves], pp: [...selected.pp] };
    }
  }

  runtime.playerParty = Array.from({ length: PARTY_SIZE }, (_, index) =>
    index < 3 ? party[index] : createBlankScriptPokemon()
  );
  runtime.playerPartyCount = runtime.playerParty.filter((mon) => mon.species !== SPECIES_NONE).length;
};

export function HealPlayerParty(runtime: ScriptPokemonRuntime): void {
  healPlayerParty(runtime);
}

export function ScriptGiveMon(
  runtime: ScriptPokemonRuntime,
  species: number,
  level: number,
  item: number,
  unused1 = 0,
  unused2 = 0,
  unused3 = 0
): number {
  return scriptGiveMon(runtime, species, level, item, unused1, unused2, unused3);
}

export function ScriptGiveEgg(runtime: ScriptPokemonRuntime, species: number): number {
  return scriptGiveEgg(runtime, species);
}

export function HasEnoughMonsForDoubleBattle(runtime: ScriptPokemonRuntime): void {
  hasEnoughMonsForDoubleBattle(runtime);
}

export function CheckPartyMonHasHeldItem(
  runtime: ScriptPokemonRuntime,
  item: number
): boolean {
  return checkPartyMonHasHeldItem(runtime, item);
}

export function DoesPartyHaveEnigmaBerry(runtime: ScriptPokemonRuntime): boolean {
  return doesPartyHaveEnigmaBerry(runtime);
}

export function CreateScriptedWildMon(
  runtime: ScriptPokemonRuntime,
  species: number,
  level: number,
  item: number
): void {
  createScriptedWildMon(runtime, species, level, item);
}

export function ScriptSetMonMoveSlot(
  runtime: ScriptPokemonRuntime,
  monIndex: number,
  move: number,
  slot: number
): void {
  scriptSetMonMoveSlot(runtime, monIndex, move, slot);
}

export function ChooseHalfPartyForBattle(runtime: ScriptPokemonRuntime): void {
  chooseHalfPartyForBattle(runtime);
}

export function CB2_ReturnFromChooseHalfParty(runtime: ScriptPokemonRuntime): void {
  cb2ReturnFromChooseHalfParty(runtime);
}

export function ChooseBattleTowerPlayerParty(runtime: ScriptPokemonRuntime): void {
  chooseBattleTowerPlayerParty(runtime);
}

export function CB2_ReturnFromChooseBattleTowerParty(
  runtime: ScriptPokemonRuntime,
  originalParty: ScriptPokemon[]
): void {
  cb2ReturnFromChooseBattleTowerParty(runtime, originalParty);
}

export function ReducePlayerPartyToThree(runtime: ScriptPokemonRuntime): void {
  reducePlayerPartyToThree(runtime);
}
