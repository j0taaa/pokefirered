import { getItemDefinition } from './bag';
import { getDecompBattleMove } from './decompBattleData';
import {
  getDecompBattleAiFlag,
  getAllDecompBattleAiScripts,
  getDecompBattleAiScript,
  getDecompBattleAiScriptLabelForFlag,
  type DecompBattleAiInstruction
} from './decompBattleAi';
import {
  getDecompItemEffectField,
  getDecompTrainerAiItemType,
  itemEffectConstant,
  type DecompTrainerAiItemType
} from './decompItemEffects';
import type {
  BattleFormat,
  BattleMove,
  BattlePokemonSnapshot,
  PokemonGender,
  BattleSideState,
  BattleWeather,
  PokemonType,
  StatusCondition
} from './battle';

export interface TrainerAiContext {
  user: BattlePokemonSnapshot;
  target: BattlePokemonSnapshot;
  userMoves: BattleMove[];
  targetMoves: BattleMove[];
  userSideState: BattleSideState;
  targetSideState: BattleSideState;
  weather: BattleWeather;
  mudSport: boolean;
  waterSport: boolean;
  turnCount: number;
  format: BattleFormat;
  userPartyAliveCount: number;
  targetPartyAliveCount: number;
  userParty?: BattlePokemonSnapshot[];
  targetParty?: BattlePokemonSnapshot[];
  safariEscapeFactor?: number;
  safariRockThrowCounter?: number;
  safariBaitThrowCounter?: number;
}

export interface TrainerAiMoveCandidate {
  index: number;
  move: BattleMove;
  effectiveness: number;
  maxDamage: number;
  targetStatus: StatusCondition;
  context: TrainerAiContext;
}

export interface TrainerAiScoredMove {
  index: number;
  score: number;
  rootScripts: string[];
  visitedLabels: string[];
  unsupportedOpcodes: string[];
}

export interface TrainerAiDecision {
  selectedIndex: number;
  scoredMoves: TrainerAiScoredMove[];
}

export type TrainerAiItemDecisionKind =
  | 'fullRestore'
  | 'healHp'
  | 'cureCondition'
  | 'xAttack'
  | 'xDefense'
  | 'xSpeed'
  | 'xSpAttack'
  | 'xAccuracy'
  | 'direHit'
  | 'guardSpecs';

export interface TrainerAiItemDecision {
  itemId: string;
  itemIndex: number;
  kind: TrainerAiItemDecisionKind;
  healAmount: number;
  aiItemType: DecompTrainerAiItemType;
  aiItemFlags: string[];
}

export interface TrainerAiItemContext {
  active: BattlePokemonSnapshot;
  party: BattlePokemonSnapshot[];
  sideState: BattleSideState;
  trainerItems: string[];
}

interface TrainerAiVmState {
  candidate: TrainerAiMoveCandidate;
  allCandidates: TrainerAiMoveCandidate[];
  score: number;
  funcResult: string | number | null;
  visitedLabels: Set<string>;
  unsupportedOpcodes: Set<string>;
}

const powerDiscouragedEffects = new Set<string>([
  'EFFECT_EXPLOSION',
  'EFFECT_DREAM_EATER',
  'EFFECT_RAZOR_WIND',
  'EFFECT_SKY_ATTACK',
  'EFFECT_RECHARGE',
  'EFFECT_SKULL_BASH',
  'EFFECT_SOLAR_BEAM',
  'EFFECT_SPIT_UP',
  'EFFECT_FOCUS_PUNCH',
  'EFFECT_SUPERPOWER',
  'EFFECT_ERUPTION',
  'EFFECT_OVERHEAT'
]);

const decompStatToSnapshotKey: Record<string, keyof BattlePokemonSnapshot['statStages']> = {
  STAT_ATK: 'attack',
  STAT_DEF: 'defense',
  STAT_SPEED: 'speed',
  STAT_SPATK: 'spAttack',
  STAT_SPDEF: 'spDefense',
  STAT_ACC: 'accuracy',
  STAT_EVASION: 'evasion'
};

const weatherToAiConstant: Record<BattleWeather, string> = {
  none: 'AI_WEATHER_NONE',
  rain: 'AI_WEATHER_RAIN',
  sun: 'AI_WEATHER_SUN',
  sandstorm: 'AI_WEATHER_SANDSTORM',
  hail: 'AI_WEATHER_HAIL'
};

const supportedTrainerAiOpcodes = new Set([
  'count_alive_pokemon',
  'end',
  'flee',
  'get_ability',
  'get_considered_move_effect',
  'get_considered_move_power',
  'get_curr_move_type',
  'get_gender',
  'get_hold_effect',
  'get_how_powerful_move_is',
  'get_last_used_move',
  'get_move_effect_from_result',
  'get_move_power_from_result',
  'get_move_type_from_result',
  'get_protect_count',
  'get_stockpile_count',
  'get_target_type1',
  'get_target_type2',
  'get_turn_count',
  'get_used_held_item',
  'get_user_type1',
  'get_user_type2',
  'get_weather',
  'goto',
  'if_any_move_disabled',
  'if_any_move_encored',
  'if_can_faint',
  'if_doesnt_have_move_with_effect',
  'if_effect',
  'if_equal',
  'if_equal_',
  'if_has_move_with_effect',
  'if_hp_equal',
  'if_hp_less_than',
  'if_hp_more_than',
  'if_hp_not_equal',
  'if_in_bytes',
  'if_in_hwords',
  'if_less_than',
  'if_level_cond',
  'if_more_than',
  'if_move',
  'if_not_double_battle',
  'if_not_effect',
  'if_not_equal',
  'if_not_in_bytes',
  'if_not_in_hwords',
  'if_not_status',
  'if_not_status2',
  'if_not_status3',
  'if_random_less_than',
  'if_random_safari_flee',
  'if_side_affecting',
  'if_stat_level_equal',
  'if_stat_level_less_than',
  'if_stat_level_more_than',
  'if_status',
  'if_status2',
  'if_status3',
  'if_status_in_party',
  'if_target_faster',
  'if_target_not_taunted',
  'if_type_effectiveness',
  'if_user_faster',
  'if_user_has_no_attacking_moves',
  'is_first_turn_for',
  'score',
  'watch'
]);

export const getUnhandledTrainerAiScriptOpcodes = (): string[] => {
  const opcodes = new Set<string>();
  for (const script of getAllDecompBattleAiScripts()) {
    for (const instruction of script.instructions) {
      if (!instruction.opcode.startsWith('.') && /^[a-z_]/u.test(instruction.opcode)) {
        opcodes.add(instruction.opcode);
      }
    }
  }

  return [...opcodes]
    .filter((opcode) => !supportedTrainerAiOpcodes.has(opcode))
    .sort();
};

const stripPrefix = (value: string, prefix: string): string =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

const parseMaybeNumber = (value: string | number | null): number | null => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getAiRootScripts = (aiFlags: string[]): string[] =>
  [...aiFlags]
    .sort((left, right) => {
      const leftBit = getDecompBattleAiFlag(left)?.bit ?? Number.MAX_SAFE_INTEGER;
      const rightBit = getDecompBattleAiFlag(right)?.bit ?? Number.MAX_SAFE_INTEGER;
      return leftBit - rightBit;
    })
    .map((flag) => getDecompBattleAiScriptLabelForFlag(flag))
    .filter((label): label is string => !!label);

const getMovePowerClassification = (
  candidate: TrainerAiMoveCandidate,
  allCandidates: TrainerAiMoveCandidate[]
): string => {
  if (candidate.move.power <= 1 || powerDiscouragedEffects.has(candidate.move.effect)) {
    return 'MOVE_POWER_DISCOURAGED';
  }

  for (const other of allCandidates) {
    if (
      other.index !== candidate.index
      && other.move.power > 1
      && !powerDiscouragedEffects.has(other.move.effect)
      && other.maxDamage > candidate.maxDamage
    ) {
      return 'MOVE_NOT_MOST_POWERFUL';
    }
  }

  return 'MOVE_MOST_POWERFUL';
};

const getMoveLookup = (moveIdConstant: string, candidate: TrainerAiMoveCandidate): BattleMove | null => {
  const moveId = stripPrefix(moveIdConstant, 'MOVE_');
  const localMove = [
    candidate.move,
    ...candidate.context.userMoves,
    ...candidate.context.targetMoves
  ].find((entry) => entry.id === moveId);

  if (localMove) {
    return localMove;
  }

  const decompMove = getDecompBattleMove(moveId);
  if (!decompMove) {
    return null;
  }

  return {
    id: moveId,
    name: decompMove.displayName,
    power: decompMove.power,
    type: stripPrefix(decompMove.type, 'TYPE_').toLowerCase() as PokemonType,
    accuracy: decompMove.accuracy,
    pp: decompMove.pp,
    ppRemaining: decompMove.pp,
    priority: decompMove.priority,
    effect: decompMove.effect,
    effectScriptLabel: decompMove.effectScriptLabel,
    target: decompMove.target,
    secondaryEffectChance: decompMove.secondaryEffectChance,
    flags: [...decompMove.flags]
  };
};

const getBattlerByArg = (candidate: TrainerAiMoveCandidate, arg: string): BattlePokemonSnapshot =>
  arg === 'AI_TARGET' ? candidate.context.target : candidate.context.user;

const getBattlerMovesByArg = (candidate: TrainerAiMoveCandidate, arg: string): BattleMove[] =>
  arg === 'AI_TARGET' ? candidate.context.targetMoves : candidate.context.userMoves;

const getSideStateByArg = (candidate: TrainerAiMoveCandidate, arg: string): BattleSideState =>
  arg === 'AI_TARGET' ? candidate.context.targetSideState : candidate.context.userSideState;

const getAliveCountByArg = (candidate: TrainerAiMoveCandidate, arg: string): number =>
  arg === 'AI_TARGET' ? candidate.context.targetPartyAliveCount : candidate.context.userPartyAliveCount;

const getPartyByArg = (candidate: TrainerAiMoveCandidate, arg: string): BattlePokemonSnapshot[] => {
  if (arg === 'AI_TARGET') {
    return candidate.context.targetParty ?? [candidate.context.target];
  }
  return candidate.context.userParty ?? [candidate.context.user];
};

const genderToAiConstant = (gender: PokemonGender): string => {
  switch (gender) {
    case 'male':
      return 'MON_MALE';
    case 'female':
      return 'MON_FEMALE';
    case 'genderless':
      return 'MON_GENDERLESS';
  }
};

const getSafariFleeRate = (candidate: TrainerAiMoveCandidate): number => {
  const baseEscapeFactor = candidate.context.safariEscapeFactor ?? 0;
  let safariFleeRate = baseEscapeFactor;
  if ((candidate.context.safariRockThrowCounter ?? 0) > 0) {
    safariFleeRate = Math.min(20, baseEscapeFactor * 2);
  } else if ((candidate.context.safariBaitThrowCounter ?? 0) > 0) {
    safariFleeRate = Math.floor(baseEscapeFactor / 4);
    if (safariFleeRate === 0) {
      safariFleeRate = 1;
    }
  }
  return safariFleeRate * 5;
};

const hasAnyStatusOrConfusion = (pokemon: BattlePokemonSnapshot): boolean =>
  pokemon.status !== 'none' || pokemon.volatile.confusionTurns > 0;

const getHealAmountFromItemEffect = (itemId: string, maxHp: number): number => {
  const param = getDecompItemEffectField(itemId, 6);
  if (param === itemEffectConstant('ITEM6_HEAL_HP_FULL')) {
    return maxHp;
  }
  if (param === itemEffectConstant('ITEM6_HEAL_HP_HALF')) {
    return Math.max(1, Math.floor(maxHp / 2));
  }
  return Math.max(0, param);
};

const getCureConditionFlags = (itemId: string, pokemon: BattlePokemonSnapshot): string[] => {
  const statusFlags = getDecompItemEffectField(itemId, 3);
  const flags: string[] = [];
  if ((statusFlags & itemEffectConstant('ITEM3_SLEEP')) && pokemon.status === 'sleep') {
    flags.push('sleep');
  }
  if ((statusFlags & itemEffectConstant('ITEM3_POISON')) && (pokemon.status === 'poison' || pokemon.status === 'badPoison')) {
    flags.push('poison');
  }
  if ((statusFlags & itemEffectConstant('ITEM3_BURN')) && pokemon.status === 'burn') {
    flags.push('burn');
  }
  if ((statusFlags & itemEffectConstant('ITEM3_FREEZE')) && pokemon.status === 'freeze') {
    flags.push('freeze');
  }
  if ((statusFlags & itemEffectConstant('ITEM3_PARALYSIS')) && pokemon.status === 'paralysis') {
    flags.push('paralysis');
  }
  if ((statusFlags & itemEffectConstant('ITEM3_CONFUSION')) && pokemon.volatile.confusionTurns > 0) {
    flags.push('confusion');
  }
  return flags;
};

const getXStatItemFlags = (itemId: string): string[] => {
  const flags: string[] = [];
  if (getDecompItemEffectField(itemId, 0) & itemEffectConstant('ITEM0_X_ATTACK')) {
    flags.push('attack');
  }
  if (getDecompItemEffectField(itemId, 1) & itemEffectConstant('ITEM1_X_DEFEND')) {
    flags.push('defense');
  }
  if (getDecompItemEffectField(itemId, 1) & itemEffectConstant('ITEM1_X_SPEED')) {
    flags.push('speed');
  }
  if (getDecompItemEffectField(itemId, 2) & itemEffectConstant('ITEM2_X_SPATK')) {
    flags.push('spAttack');
  }
  if (getDecompItemEffectField(itemId, 2) & itemEffectConstant('ITEM2_X_ACCURACY')) {
    flags.push('accuracy');
  }
  if (getDecompItemEffectField(itemId, 0) & itemEffectConstant('ITEM0_DIRE_HIT')) {
    flags.push('direHit');
  }
  return flags;
};

const getXStatDecisionKind = (flag: string): TrainerAiItemDecisionKind => {
  switch (flag) {
    case 'attack':
      return 'xAttack';
    case 'defense':
      return 'xDefense';
    case 'speed':
      return 'xSpeed';
    case 'spAttack':
      return 'xSpAttack';
    case 'accuracy':
      return 'xAccuracy';
    case 'direHit':
      return 'direHit';
    default:
      return 'xAttack';
  }
};

export const chooseTrainerAiItemDecision = ({
  active,
  party,
  sideState,
  trainerItems
}: TrainerAiItemContext): TrainerAiItemDecision | null => {
  if (active.hp <= 0 || trainerItems.length === 0) {
    return null;
  }

  const validMons = party.filter((pokemon) => pokemon.hp > 0 && pokemon.species !== 'SPECIES_NONE' && pokemon.species !== 'EGG').length;
  const itemsNo = trainerItems.length;

  for (const [itemIndex, itemId] of trainerItems.entries()) {
    if (itemIndex > 0 && validMons > (itemsNo - itemIndex) + 1) {
      continue;
    }

    const aiItemType = getDecompTrainerAiItemType(itemId);
    switch (aiItemType) {
      case 'AI_ITEM_FULL_RESTORE':
        if (active.hp > 0 && active.hp < Math.floor(active.maxHp / 4)) {
          return {
            itemId,
            itemIndex,
            kind: 'fullRestore',
            healAmount: active.maxHp,
            aiItemType,
            aiItemFlags: ['healHp', 'cureCondition']
          };
        }
        break;
      case 'AI_ITEM_HEAL_HP': {
        const healAmount = getHealAmountFromItemEffect(itemId, active.maxHp);
        if (healAmount > 0 && active.hp > 0 && (active.hp < Math.floor(active.maxHp / 4) || active.maxHp - active.hp > healAmount)) {
          return {
            itemId,
            itemIndex,
            kind: 'healHp',
            healAmount,
            aiItemType,
            aiItemFlags: ['healHp']
          };
        }
        break;
      }
      case 'AI_ITEM_CURE_CONDITION': {
        const aiItemFlags = getCureConditionFlags(itemId, active);
        if (aiItemFlags.length > 0 || (getDecompItemEffectField(itemId, 3) & itemEffectConstant('ITEM3_STATUS_ALL') && hasAnyStatusOrConfusion(active))) {
          return {
            itemId,
            itemIndex,
            kind: 'cureCondition',
            healAmount: 0,
            aiItemType,
            aiItemFlags
          };
        }
        break;
      }
      case 'AI_ITEM_X_STAT': {
        if (active.volatile.activeTurns !== 0) {
          break;
        }
        const aiItemFlags = getXStatItemFlags(itemId);
        const usableFlag = aiItemFlags.find((flag) =>
          flag === 'direHit'
            ? !active.volatile.focusEnergy
            : active.statStages[flag as keyof BattlePokemonSnapshot['statStages']] < 6
        );
        if (usableFlag) {
          return {
            itemId,
            itemIndex,
            kind: getXStatDecisionKind(usableFlag),
            healAmount: 0,
            aiItemType,
            aiItemFlags
          };
        }
        break;
      }
      case 'AI_ITEM_GUARD_SPECS':
        if (active.volatile.activeTurns === 0 && sideState.mistTurns === 0) {
          return {
            itemId,
            itemIndex,
            kind: 'guardSpecs',
            healAmount: 0,
            aiItemType,
            aiItemFlags: ['guardSpecs']
          };
        }
        break;
      case 'AI_ITEM_NOT_RECOGNIZABLE':
        return null;
    }
  }

  return null;
};

const matchesStatus1Token = (pokemon: BattlePokemonSnapshot, token: string): boolean => {
  switch (token) {
    case 'STATUS1_ANY':
      return pokemon.status !== 'none';
    case 'STATUS1_SLEEP':
      return pokemon.status === 'sleep';
    case 'STATUS1_POISON':
      return pokemon.status === 'poison';
    case 'STATUS1_TOXIC_POISON':
      return pokemon.status === 'badPoison';
    case 'STATUS1_BURN':
      return pokemon.status === 'burn';
    case 'STATUS1_PARALYSIS':
      return pokemon.status === 'paralysis';
    case 'STATUS1_FREEZE':
      return pokemon.status === 'freeze';
    default:
      return false;
  }
};

const matchesStatus1Expression = (pokemon: BattlePokemonSnapshot, expression: string): boolean =>
  expression.split('|').map((token) => token.trim()).some((token) => matchesStatus1Token(pokemon, token));

const matchesStatus2Token = (pokemon: BattlePokemonSnapshot, token: string): boolean => {
  switch (token) {
    case 'STATUS2_NIGHTMARE':
      return pokemon.volatile.nightmare;
    case 'STATUS2_CONFUSION':
      return pokemon.volatile.confusionTurns > 0;
    case 'STATUS2_SUBSTITUTE':
      return pokemon.volatile.substituteHp > 0;
    case 'STATUS2_ESCAPE_PREVENTION':
      return pokemon.volatile.escapePreventedBy !== null;
    case 'STATUS2_FOCUS_ENERGY':
      return pokemon.volatile.focusEnergy;
    case 'STATUS2_INFATUATION':
      return pokemon.volatile.infatuatedBy !== null;
    case 'STATUS2_FORESIGHT':
      return pokemon.volatile.foresighted;
    case 'STATUS2_TORMENT':
      return pokemon.volatile.tormented;
    default:
      return false;
  }
};

const matchesStatus3Token = (candidate: TrainerAiMoveCandidate, pokemon: BattlePokemonSnapshot, token: string): boolean => {
  switch (token) {
    case 'STATUS3_LEECHSEED':
      return pokemon.volatile.leechSeededBy !== null;
    case 'STATUS3_PERISH_SONG':
      return pokemon.volatile.perishTurns > 0;
    case 'STATUS3_ROOTED':
      return pokemon.volatile.rooted;
    case 'STATUS3_IMPRISONED_OTHERS':
      return pokemon.volatile.imprisoning;
    case 'STATUS3_MUDSPORT':
      return candidate.context.mudSport;
    case 'STATUS3_WATERSPORT':
      return candidate.context.waterSport;
    default:
      return false;
  }
};

const matchesSideStatus = (sideState: BattleSideState, token: string): boolean => {
  switch (token) {
    case 'SIDE_STATUS_REFLECT':
      return sideState.reflectTurns > 0;
    case 'SIDE_STATUS_LIGHTSCREEN':
      return sideState.lightScreenTurns > 0;
    case 'SIDE_STATUS_SAFEGUARD':
      return sideState.safeguardTurns > 0;
    case 'SIDE_STATUS_MIST':
      return sideState.mistTurns > 0;
    case 'SIDE_STATUS_SPIKES':
      return sideState.spikesLayers > 0;
    case 'SIDE_STATUS_FUTUREATTACK':
      return sideState.futureAttack !== null;
    default:
      return false;
  }
};

const getDecompStageValue = (pokemon: BattlePokemonSnapshot, statConstant: string): number => {
  const statKey = decompStatToSnapshotKey[statConstant];
  if (!statKey) {
    return 6;
  }

  return pokemon.statStages[statKey] + 6;
};

const normalizeTypeConstant = (type: PokemonType): string =>
  `TYPE_${type.toUpperCase()}`;

const getTypeEffectivenessMatches = (candidate: TrainerAiMoveCandidate, token: string): boolean => {
  switch (token) {
    case 'AI_EFFECTIVENESS_x0':
      return candidate.effectiveness === 0;
    case 'AI_EFFECTIVENESS_x0_25':
      return candidate.effectiveness === 0.25;
    case 'AI_EFFECTIVENESS_x0_5':
      return candidate.effectiveness === 0.5;
    case 'AI_EFFECTIVENESS_x2':
      return candidate.effectiveness === 2;
    case 'AI_EFFECTIVENESS_x4':
      return candidate.effectiveness === 4;
    default:
      return false;
  }
};

const compareFuncResult = (funcResult: string | number | null, expected: string): boolean => {
  const actualNumber = parseMaybeNumber(funcResult);
  const expectedNumber = parseMaybeNumber(expected);
  if (actualNumber !== null && expectedNumber !== null) {
    return actualNumber === expectedNumber;
  }

  return String(funcResult) === expected;
};

const getInstructionTableValues = (label: string, opcode: '.byte' | '.2byte'): string[] => {
  const script = getDecompBattleAiScript(label);
  if (!script) {
    return [];
  }

  return script.instructions
    .filter((instruction) => instruction.opcode === opcode)
    .flatMap((instruction) => instruction.args)
    .filter((entry) => entry !== '-1');
};

const jumpToLabel = (
  label: string,
  callStack: Array<{ label: string; pc: number }>
): { label: string; pc: number; callStack: Array<{ label: string; pc: number }> } => ({
  label,
  pc: 0,
  callStack
});

const executeInstruction = (
  state: TrainerAiVmState,
  instruction: DecompBattleAiInstruction,
  label: string,
  pc: number,
  callStack: Array<{ label: string; pc: number }>,
  randomByte: () => number
): { label: string | null; pc: number; callStack: Array<{ label: string; pc: number }> } => {
  const { candidate } = state;

  switch (instruction.opcode) {
    case 'score': {
      const delta = Number.parseInt(instruction.args[0] ?? '0', 10);
      state.score = Math.max(0, state.score + (Number.isNaN(delta) ? 0 : delta));
      return { label, pc: pc + 1, callStack };
    }
    case 'goto':
      return jumpToLabel(instruction.args[0] ?? label, callStack);
    case 'call':
      return jumpToLabel(instruction.args[0] ?? label, [...callStack, { label, pc: pc + 1 }]);
    case 'end':
    case 'flee':
      if (callStack.length === 0) {
        return { label: null, pc: 0, callStack };
      }
      return {
        label: callStack[callStack.length - 1]!.label,
        pc: callStack[callStack.length - 1]!.pc,
        callStack: callStack.slice(0, -1)
      };
    case 'get_how_powerful_move_is':
      state.funcResult = getMovePowerClassification(candidate, state.allCandidates);
      return { label, pc: pc + 1, callStack };
    case 'get_considered_move_power':
      state.funcResult = candidate.move.power;
      return { label, pc: pc + 1, callStack };
    case 'get_considered_move_effect':
      state.funcResult = candidate.move.effect;
      return { label, pc: pc + 1, callStack };
    case 'get_curr_move_type':
      state.funcResult = normalizeTypeConstant(candidate.move.type);
      return { label, pc: pc + 1, callStack };
    case 'get_ability': {
      const ability = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER').abilityId;
      state.funcResult = ability ? `ABILITY_${ability}` : 'ABILITY_NONE';
      return { label, pc: pc + 1, callStack };
    }
    case 'get_weather':
      state.funcResult = weatherToAiConstant[candidate.context.weather];
      return { label, pc: pc + 1, callStack };
    case 'get_turn_count':
      state.funcResult = candidate.context.turnCount;
      return { label, pc: pc + 1, callStack };
    case 'get_last_used_move': {
      const moveId = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_TARGET').volatile.lastMoveUsedId;
      state.funcResult = moveId ? `MOVE_${moveId}` : 'MOVE_NONE';
      return { label, pc: pc + 1, callStack };
    }
    case 'get_move_effect_from_result': {
      const move = getMoveLookup(String(state.funcResult ?? 'MOVE_NONE'), candidate);
      state.funcResult = move?.effect ?? 'EFFECT_HIT';
      return { label, pc: pc + 1, callStack };
    }
    case 'get_move_power_from_result': {
      const move = getMoveLookup(String(state.funcResult ?? 'MOVE_NONE'), candidate);
      state.funcResult = move?.power ?? 0;
      return { label, pc: pc + 1, callStack };
    }
    case 'get_move_type_from_result': {
      const move = getMoveLookup(String(state.funcResult ?? 'MOVE_NONE'), candidate);
      state.funcResult = move ? normalizeTypeConstant(move.type) : 'TYPE_NORMAL';
      return { label, pc: pc + 1, callStack };
    }
    case 'get_target_type1':
      state.funcResult = normalizeTypeConstant(candidate.context.target.types[0] ?? 'normal');
      return { label, pc: pc + 1, callStack };
    case 'get_target_type2':
      state.funcResult = normalizeTypeConstant(candidate.context.target.types[1] ?? candidate.context.target.types[0] ?? 'normal');
      return { label, pc: pc + 1, callStack };
    case 'get_user_type1':
      state.funcResult = normalizeTypeConstant(candidate.context.user.types[0] ?? 'normal');
      return { label, pc: pc + 1, callStack };
    case 'get_user_type2':
      state.funcResult = normalizeTypeConstant(candidate.context.user.types[1] ?? candidate.context.user.types[0] ?? 'normal');
      return { label, pc: pc + 1, callStack };
    case 'get_stockpile_count':
      state.funcResult = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER').volatile.stockpile;
      return { label, pc: pc + 1, callStack };
    case 'get_hold_effect': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const holdEffect = pokemon.heldItemId ? getItemDefinition(pokemon.heldItemId).holdEffect : 'HOLD_EFFECT_NONE';
      state.funcResult = holdEffect;
      return { label, pc: pc + 1, callStack };
    }
    case 'get_used_held_item': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      state.funcResult = pokemon.recycledItemId ?? 'ITEM_NONE';
      return { label, pc: pc + 1, callStack };
    }
    case 'get_protect_count':
      state.funcResult = candidate.context.user.volatile.protectUses;
      return { label, pc: pc + 1, callStack };
    case 'count_alive_pokemon':
      state.funcResult = getAliveCountByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return { label, pc: pc + 1, callStack };
    case 'get_gender':
      state.funcResult = genderToAiConstant(getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER').gender);
      return { label, pc: pc + 1, callStack };
    case 'if_equal':
    case 'if_equal_':
      return compareFuncResult(state.funcResult, instruction.args[0] ?? '')
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_not_equal':
    case 'if_not_equal_':
      return !compareFuncResult(state.funcResult, instruction.args[0] ?? '')
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_less_than': {
      const actual = parseMaybeNumber(state.funcResult);
      const expected = parseMaybeNumber(instruction.args[0] ?? '');
      return actual !== null && expected !== null && actual < expected
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_more_than': {
      const actual = parseMaybeNumber(state.funcResult);
      const expected = parseMaybeNumber(instruction.args[0] ?? '');
      return actual !== null && expected !== null && actual > expected
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_effect':
      return candidate.move.effect === (instruction.args[0] ?? '')
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_not_effect':
      return candidate.move.effect !== (instruction.args[0] ?? '')
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_move':
      return candidate.move.id === stripPrefix(instruction.args[0] ?? '', 'MOVE_')
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_type_effectiveness':
      return getTypeEffectivenessMatches(candidate, instruction.args[0] ?? '')
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_status': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return matchesStatus1Expression(pokemon, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_status_in_party': {
      const party = getPartyByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return party.some((pokemon) => pokemon.hp > 0 && matchesStatus1Expression(pokemon, instruction.args[1] ?? ''))
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_not_status': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return !matchesStatus1Expression(pokemon, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_status2': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return matchesStatus2Token(pokemon, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_not_status2': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return !matchesStatus2Token(pokemon, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_status3': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return matchesStatus3Token(candidate, pokemon, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_not_status3': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return !matchesStatus3Token(candidate, pokemon, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_hp_less_than': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const threshold = Number.parseInt(instruction.args[1] ?? '0', 10);
      const hpPercent = pokemon.maxHp <= 0 ? 0 : Math.floor((100 * pokemon.hp) / pokemon.maxHp);
      return hpPercent < threshold
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_hp_more_than': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const threshold = Number.parseInt(instruction.args[1] ?? '0', 10);
      const hpPercent = pokemon.maxHp <= 0 ? 0 : Math.floor((100 * pokemon.hp) / pokemon.maxHp);
      return hpPercent > threshold
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_hp_equal': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const threshold = Number.parseInt(instruction.args[1] ?? '0', 10);
      const hpPercent = pokemon.maxHp <= 0 ? 0 : Math.floor((100 * pokemon.hp) / pokemon.maxHp);
      return hpPercent === threshold
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_hp_not_equal': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const threshold = Number.parseInt(instruction.args[1] ?? '0', 10);
      const hpPercent = pokemon.maxHp <= 0 ? 0 : Math.floor((100 * pokemon.hp) / pokemon.maxHp);
      return hpPercent !== threshold
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_stat_level_equal': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const stage = getDecompStageValue(pokemon, instruction.args[1] ?? '');
      const expected = Number.parseInt(instruction.args[2] ?? '6', 10);
      return stage === expected
        ? jumpToLabel(instruction.args[3] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_stat_level_less_than': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const stage = getDecompStageValue(pokemon, instruction.args[1] ?? '');
      const expected = Number.parseInt(instruction.args[2] ?? '6', 10);
      return stage < expected
        ? jumpToLabel(instruction.args[3] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_stat_level_more_than': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      const stage = getDecompStageValue(pokemon, instruction.args[1] ?? '');
      const expected = Number.parseInt(instruction.args[2] ?? '6', 10);
      return stage > expected
        ? jumpToLabel(instruction.args[3] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_has_move_with_effect': {
      const moves = getBattlerMovesByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return moves.some((move) => move.effect === (instruction.args[1] ?? ''))
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_doesnt_have_move_with_effect': {
      const moves = getBattlerMovesByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return !moves.some((move) => move.effect === (instruction.args[1] ?? ''))
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_any_move_disabled': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_TARGET');
      return pokemon.volatile.disabledMoveId !== null
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_any_move_encored': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_TARGET');
      return pokemon.volatile.encoreMoveId !== null && pokemon.volatile.encoreTurns > 0
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_side_affecting': {
      const sideState = getSideStateByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return matchesSideStatus(sideState, instruction.args[1] ?? '')
        ? jumpToLabel(instruction.args[2] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_in_bytes': {
      const values = getInstructionTableValues(instruction.args[0] ?? '', '.byte');
      return values.includes(String(state.funcResult))
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_not_in_bytes': {
      const values = getInstructionTableValues(instruction.args[0] ?? '', '.byte');
      return !values.includes(String(state.funcResult))
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_in_hwords': {
      const values = getInstructionTableValues(instruction.args[0] ?? '', '.2byte');
      return values.includes(String(state.funcResult))
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_not_in_hwords': {
      const values = getInstructionTableValues(instruction.args[0] ?? '', '.2byte');
      return !values.includes(String(state.funcResult))
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_random_less_than':
      return randomByte() < Number.parseInt(instruction.args[0] ?? '0', 10)
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_random_safari_flee':
      return randomByte() % 100 < getSafariFleeRate(candidate)
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_can_faint':
      return candidate.maxDamage >= candidate.context.target.hp
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_level_cond': {
      const compareMode = Number.parseInt(instruction.args[0] ?? '0', 10);
      const { user, target } = candidate.context;
      const matches = compareMode === 0
        ? user.level > target.level
        : compareMode === 1
          ? user.level < target.level
          : user.level === target.level;
      return matches
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_not_double_battle':
      return candidate.context.format !== 'doubles'
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'is_first_turn_for': {
      const pokemon = getBattlerByArg(candidate, instruction.args[0] ?? 'AI_USER');
      return pokemon.volatile.activeTurns === 0
        ? jumpToLabel(instruction.args[1] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_target_faster': {
      const targetFaster = candidate.context.target.speed > candidate.context.user.speed;
      return targetFaster
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_user_faster': {
      const userFaster = candidate.context.user.speed > candidate.context.target.speed;
      return userFaster
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    }
    case 'if_target_not_taunted':
      return candidate.context.target.volatile.tauntTurns === 0
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'if_user_has_no_attacking_moves':
      return candidate.context.userMoves.every((move) => move.power <= 0)
        ? jumpToLabel(instruction.args[0] ?? label, callStack)
        : { label, pc: pc + 1, callStack };
    case 'watch':
      if (callStack.length === 0) {
        return { label: null, pc: 0, callStack };
      }
      return {
        label: callStack[callStack.length - 1]!.label,
        pc: callStack[callStack.length - 1]!.pc,
        callStack: callStack.slice(0, -1)
      };
    default:
      state.unsupportedOpcodes.add(instruction.opcode);
      return { label, pc: pc + 1, callStack };
  }
};

const executeAiRootScript = (
  rootLabel: string,
  state: TrainerAiVmState,
  randomByte: () => number
): void => {
  let currentLabel: string | null = rootLabel;
  let pc = 0;
  let callStack: Array<{ label: string; pc: number }> = [];
  let steps = 0;

  while (currentLabel && steps < 2048) {
    steps += 1;
    const script = getDecompBattleAiScript(currentLabel);
    if (!script) {
      state.unsupportedOpcodes.add(`missing:${currentLabel}`);
      break;
    }

    state.visitedLabels.add(currentLabel);
    if (pc >= script.instructions.length) {
      if (callStack.length === 0) {
        break;
      }
      const frame = callStack.pop()!;
      currentLabel = frame.label;
      pc = frame.pc;
      continue;
    }

    const next = executeInstruction(state, script.instructions[pc]!, currentLabel, pc, callStack, randomByte);
    currentLabel = next.label;
    pc = next.pc;
    callStack = next.callStack;
  }

  if (steps >= 2048) {
    state.unsupportedOpcodes.add(`step_limit:${rootLabel}`);
  }
};

export const chooseTrainerMoveIndex = (
  candidates: TrainerAiMoveCandidate[],
  aiFlags: string[],
  tieBreaker: (maxExclusive: number) => number
): TrainerAiDecision | null => {
  if (candidates.length === 0) {
    return null;
  }

  const rootScripts = getAiRootScripts(aiFlags);

  let bestScore = Number.NEGATIVE_INFINITY;
  let bestIndexes: number[] = [];
  const scoredMoves = candidates.map((candidate) => {
    const state: TrainerAiVmState = {
      candidate,
      allCandidates: candidates,
      score: 100,
      funcResult: null,
      visitedLabels: new Set<string>(),
      unsupportedOpcodes: new Set<string>()
    };

    for (const rootLabel of rootScripts) {
      executeAiRootScript(rootLabel, state, () => tieBreaker(256));
    }

    if (state.score > bestScore) {
      bestScore = state.score;
      bestIndexes = [candidate.index];
    } else if (state.score === bestScore) {
      bestIndexes.push(candidate.index);
    }

    return {
      index: candidate.index,
      score: state.score,
      rootScripts,
      visitedLabels: [...state.visitedLabels],
      unsupportedOpcodes: [...state.unsupportedOpcodes]
    } satisfies TrainerAiScoredMove;
  });

  if (bestIndexes.length === 0) {
    return null;
  }

  return {
    selectedIndex: bestIndexes[tieBreaker(bestIndexes.length)] ?? bestIndexes[0]!,
    scoredMoves
  };
};
