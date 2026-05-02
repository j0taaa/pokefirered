import * as BattleAi from './decompBattleAi';

export * from './decompBattleAi';

export const BATTLE_AI_SCRIPT_COMMANDS_C_TRANSLATION_UNIT = 'src/battle_ai_script_commands.c';

export const AI_ACTION_DONE = 0x0001;
export const AI_ACTION_FLEE = 0x0002;
export const AI_ACTION_WATCH = 0x0004;
export const AI_ACTION_DO_NOT_ATTACK = 0x0008;
export const AI_ACTION_UNK5 = 0x0010;
export const AI_ACTION_UNK6 = 0x0020;
export const AI_ACTION_UNK7 = 0x0040;
export const AI_ACTION_UNK8 = 0x0080;
export const B_WEATHER_RAIN = 1 << 0;
export const B_WEATHER_SANDSTORM = 1 << 1;
export const B_WEATHER_SUN = 1 << 2;
export const B_WEATHER_HAIL_TEMPORARY = 1 << 3;
export const AI_TARGET = 0;
export const AI_USER = 1;
export const AI_TARGET_PARTNER = 2;
export const AI_USER_PARTNER = 3;
export const AI_TYPE1_TARGET = 0;
export const AI_TYPE1_USER = 1;
export const AI_TYPE2_TARGET = 2;
export const AI_TYPE2_USER = 3;
export const AI_TYPE_MOVE = 4;
export const WEATHER_TYPE_SUNNY = 0;
export const WEATHER_TYPE_RAIN = 1;
export const WEATHER_TYPE_SANDSTORM = 2;
export const WEATHER_TYPE_HAIL = 3;
export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const MOVE_NONE = 0;
export const BIT_FLANK = 2;
export const ABILITY_NONE = 0;
export const ABILITY_SHADOW_TAG = 23;
export const ABILITY_MAGNET_PULL = 42;
export const ABILITY_ARENA_TRAP = 71;
export const AI_EFFECTIVENESS_x4 = 160;
export const AI_EFFECTIVENESS_x2 = 80;
export const AI_EFFECTIVENESS_x1 = 40;
export const AI_EFFECTIVENESS_x0_5 = 20;
export const AI_EFFECTIVENESS_x0_25 = 10;
export const AI_EFFECTIVENESS_x0 = 0;
export const MOVE_POWER_DISCOURAGED = 0;
export const MOVE_NOT_MOST_POWERFUL = 1;
export const MOVE_MOST_POWERFUL = 2;
export const MOVE_RESULT_DOESNT_AFFECT_FOE = 1 << 0;
export const sDiscouragedPowerfulMoveEffects = [7, 8, 39, 75, 80, 145, 151, 161, 170, 182, 190, 204, 0xffff];

export interface BattleAiPartyMon {
  species: number;
  hp: number;
  status: number;
}

export interface BattleAiMon {
  hp: number;
  maxHP: number;
  type1: number;
  type2: number;
  moves: number[];
  statStages: number[];
  status1?: number;
  status2?: number;
  ability?: number;
  species?: number;
  personality?: number;
  level?: number;
  item?: number;
  gender?: number;
}

export interface BattleAiDisableStruct {
  disabledMove: number;
  encoredMove: number;
  isFirstTurn: number;
  stockpileCounter: number;
  protectUses: number;
  tauntTimer: number;
}

export interface BattleAiScriptCommandsRuntime {
  sAIScriptPtr: number;
  script: number[];
  pointers: Record<number, number>;
  randomValues: number[];
  battleTurnCounter: number;
  gBattleWeather: number;
  gBattleTypeFlags: number;
  gBattleMoves: Record<number, { effect: number; power?: number; type?: number }>;
  damageByMove: Record<number, number>;
  typeCalcDamageByMove: Record<number, number>;
  moveResultFlagsByMove: Record<number, number>;
  speciesInfoAbilities: Record<number, [number, number]>;
  gStatuses3: number[];
  gSideStatuses: number[];
  battlerSides: number[];
  battlerPositions: number[];
  battlerAtPositions: number[];
  gBattlerPartyIndexes: number[];
  gLastMoves: number[];
  gActiveBattler: number;
  gDisableStructs: Partial<BattleAiDisableStruct>[];
  itemHoldEffects: Record<number, number>;
  usedHeldItems: number[];
  safariRockThrowCounter: number;
  safariBaitThrowCounter: number;
  safariEscapeFactor: number;
  whoStrikesFirstResult: number;
  gBattlerAttacker: number;
  gBattlerTarget: number;
  gBattleMons: BattleAiMon[];
  gPlayerParty: BattleAiPartyMon[];
  gEnemyParty: BattleAiPartyMon[];
  battleHistory: {
    usedMoves: number[][];
    itemEffects?: number[];
    abilities?: number[];
  };
  ai: {
    score: number[];
    movesetIndex: number;
    funcResult: number;
    aiAction: number;
    moveConsidered: number;
    simulatedRNG: number[];
  };
  AI_ScriptsStack: {
    ptr: number[];
    size: number;
  };
}

export type BattleAiScriptCommandsRuntimeOverrides = Omit<Partial<BattleAiScriptCommandsRuntime>, 'ai' | 'AI_ScriptsStack'> & {
  ai?: Partial<BattleAiScriptCommandsRuntime['ai']>;
  AI_ScriptsStack?: Partial<BattleAiScriptCommandsRuntime['AI_ScriptsStack']>;
};

export const createBattleAiScriptCommandsRuntime = (
  overrides: BattleAiScriptCommandsRuntimeOverrides = {}
): BattleAiScriptCommandsRuntime => {
  const { ai: aiOverrides, AI_ScriptsStack: stackOverrides, ...topLevelOverrides } = overrides;
  const runtime: BattleAiScriptCommandsRuntime = {
    sAIScriptPtr: 0,
    script: [],
    pointers: {},
    randomValues: [],
    battleTurnCounter: 0,
    gBattleWeather: 0,
    gBattleTypeFlags: 0,
    gBattleMoves: {},
    damageByMove: {},
    typeCalcDamageByMove: {},
    moveResultFlagsByMove: {},
    speciesInfoAbilities: {},
    gStatuses3: [],
    gSideStatuses: [],
    battlerSides: [0, 1, 0, 1],
    battlerPositions: [0, 1, 2, 3],
    battlerAtPositions: [0, 1, 2, 3],
    gBattlerPartyIndexes: [],
    gLastMoves: [],
    gActiveBattler: 0,
    gDisableStructs: [],
    itemHoldEffects: {},
    usedHeldItems: [],
    safariRockThrowCounter: 0,
    safariBaitThrowCounter: 0,
    safariEscapeFactor: 0,
    whoStrikesFirstResult: 0,
    gBattlerAttacker: 0,
    gBattlerTarget: 1,
    gBattleMons: [],
    gPlayerParty: [],
    gEnemyParty: [],
    battleHistory: {
      usedMoves: [],
      itemEffects: [],
      abilities: []
    },
    AI_ScriptsStack: {
      ptr: [],
      size: 0
    },
    ai: {
      score: [0, 0, 0, 0],
      movesetIndex: 0,
      funcResult: 0,
      aiAction: 0,
      moveConsidered: 0,
      simulatedRNG: [100, 100, 100, 100]
    },
    ...topLevelOverrides
  };

  runtime.ai = {
    score: [0, 0, 0, 0],
    movesetIndex: 0,
    funcResult: 0,
    aiAction: 0,
    moveConsidered: 0,
    simulatedRNG: [100, 100, 100, 100],
    ...aiOverrides
  };
  runtime.AI_ScriptsStack = {
    ptr: [],
    size: 0,
    ...stackOverrides
  };
  return runtime;
};

const readByte = (runtime: BattleAiScriptCommandsRuntime, offset: number): number =>
  runtime.script[runtime.sAIScriptPtr + offset] ?? 0;

const readPointer = (runtime: BattleAiScriptCommandsRuntime, absoluteOffset: number): number =>
  runtime.pointers[absoluteOffset] ?? 0;

const nextRandom8 = (runtime: BattleAiScriptCommandsRuntime): number =>
  (runtime.randomValues.shift() ?? 0) % 256;

const branchRandom = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (random: number, value: number) => boolean
): void => {
  if (predicate(nextRandom8(runtime), readByte(runtime, 1))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
  } else {
    runtime.sAIScriptPtr += 6;
  }
};

const branchFuncResultImmediate = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (funcResult: number, value: number) => boolean
): void => {
  if (predicate(runtime.ai.funcResult, readByte(runtime, 1))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
  } else {
    runtime.sAIScriptPtr += 6;
  }
};

const branchFuncResultPointer = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (funcResult: number, value: number) => boolean
): void => {
  const valuePtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  if (predicate(runtime.ai.funcResult, runtime.script[valuePtr] ?? 0)) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 5);
  } else {
    runtime.sAIScriptPtr += 9;
  }
};

const readU16 = (runtime: BattleAiScriptCommandsRuntime, offset: number): number =>
  readByte(runtime, offset) | (readByte(runtime, offset + 1) << 8);

const readU32 = (runtime: BattleAiScriptCommandsRuntime, offset: number): number =>
  (readByte(runtime, offset) |
    (readByte(runtime, offset + 1) << 8) |
    (readByte(runtime, offset + 2) << 16) |
    (readByte(runtime, offset + 3) << 24)) >>>
  0;

const readU16At = (runtime: BattleAiScriptCommandsRuntime, absoluteOffset: number): number =>
  ((runtime.script[absoluteOffset] ?? 0) | ((runtime.script[absoluteOffset + 1] ?? 0) << 8)) & 0xffff;

const getAiBattler = (runtime: BattleAiScriptCommandsRuntime, selector: number): number =>
  selector === AI_USER ? runtime.gBattlerAttacker : runtime.gBattlerTarget;

const getBattlerSide = (runtime: BattleAiScriptCommandsRuntime, battlerId: number): number =>
  runtime.battlerSides[battlerId] ?? (battlerId & 1);

const getBattlerPosition = (runtime: BattleAiScriptCommandsRuntime, battlerId: number): number =>
  runtime.battlerPositions[battlerId] ?? battlerId;

const getBattlerAtPosition = (runtime: BattleAiScriptCommandsRuntime, position: number): number =>
  runtime.battlerAtPositions[position] ?? runtime.battlerPositions.indexOf(position);

const getHpPercent = (mon: BattleAiMon | undefined): number => {
  if (!mon || mon.maxHP === 0) return 0;
  return Math.trunc((100 * mon.hp) / mon.maxHP);
};

const branchHp = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (hpPercent: number, value: number) => boolean
): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  const hpPercent = getHpPercent(runtime.gBattleMons[battlerId]);
  if (predicate(hpPercent, readByte(runtime, 2))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
  } else {
    runtime.sAIScriptPtr += 7;
  }
};

const branchMove = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (moveConsidered: number, move: number) => boolean
): void => {
  if (predicate(runtime.ai.moveConsidered, readU16(runtime, 1))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
  } else {
    runtime.sAIScriptPtr += 7;
  }
};

const branchMoveEffect = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (effect: number, value: number) => boolean
): void => {
  const effect = runtime.gBattleMoves[runtime.ai.moveConsidered]?.effect ?? 0;
  if (predicate(effect, readByte(runtime, 1))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
  } else {
    runtime.sAIScriptPtr += 6;
  }
};

const branchStatLevel = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (statLevel: number, value: number) => boolean
): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  const statLevel = runtime.gBattleMons[battlerId]?.statStages[readByte(runtime, 2)] ?? 0;
  if (predicate(statLevel, readByte(runtime, 3))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 4);
  } else {
    runtime.sAIScriptPtr += 8;
  }
};

const branchStatus = (
  runtime: BattleAiScriptCommandsRuntime,
  statusValue: number,
  predicate: (hasStatus: boolean) => boolean
): void => {
  const status = readU32(runtime, 2);
  if (predicate((statusValue & status) !== 0)) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 6);
  } else {
    runtime.sAIScriptPtr += 10;
  }
};

const branchStatusMonField = (
  runtime: BattleAiScriptCommandsRuntime,
  field: 'status1' | 'status2',
  predicate: (hasStatus: boolean) => boolean
): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  branchStatus(runtime, runtime.gBattleMons[battlerId]?.[field] ?? 0, predicate);
};

const branchStatus3 = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (hasStatus: boolean) => boolean
): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  branchStatus(runtime, runtime.gStatuses3[battlerId] ?? 0, predicate);
};

const branchSideAffecting = (
  runtime: BattleAiScriptCommandsRuntime,
  predicate: (hasStatus: boolean) => boolean
): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  const side = getBattlerSide(runtime, battlerId);
  branchStatus(runtime, runtime.gSideStatuses[side] ?? 0, predicate);
};

const branchInBytes = (runtime: BattleAiScriptCommandsRuntime, branchWhenFound: boolean): void => {
  let ptr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  while ((runtime.script[ptr] ?? 0) !== 0xff) {
    if (runtime.ai.funcResult === (runtime.script[ptr] ?? 0)) {
      runtime.sAIScriptPtr = branchWhenFound ? readPointer(runtime, runtime.sAIScriptPtr + 5) : runtime.sAIScriptPtr + 9;
      return;
    }
    ptr++;
  }
  runtime.sAIScriptPtr = branchWhenFound ? runtime.sAIScriptPtr + 9 : readPointer(runtime, runtime.sAIScriptPtr + 5);
};

const branchInHwords = (runtime: BattleAiScriptCommandsRuntime, branchWhenFound: boolean): void => {
  let ptr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  while (readU16At(runtime, ptr) !== 0xffff) {
    if (runtime.ai.funcResult === readU16At(runtime, ptr)) {
      runtime.sAIScriptPtr = branchWhenFound ? readPointer(runtime, runtime.sAIScriptPtr + 5) : runtime.sAIScriptPtr + 9;
      return;
    }
    ptr += 2;
  }
  runtime.sAIScriptPtr = branchWhenFound ? runtime.sAIScriptPtr + 9 : readPointer(runtime, runtime.sAIScriptPtr + 5);
};

const hasMove = (runtime: BattleAiScriptCommandsRuntime, selector: number, move: number): boolean => {
  switch (selector) {
    case AI_USER:
    case AI_USER_PARTNER:
      return (runtime.gBattleMons[runtime.gBattlerAttacker]?.moves ?? []).slice(0, 4).includes(move);
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      return (runtime.battleHistory.usedMoves[runtime.gBattlerTarget >> 1] ?? []).slice(0, 8).includes(move);
    default:
      return false;
  }
};

const userHasMoveEffect = (runtime: BattleAiScriptCommandsRuntime, effect: number): boolean => {
  const moves = runtime.gBattleMons[runtime.gBattlerAttacker]?.moves ?? [];
  for (let i = 0; i < 4; i++) {
    const move = moves[i] ?? 0;
    if (move !== 0 && runtime.gBattleMoves[move]?.effect === effect) return true;
  }
  return false;
};

const userHasAttackingMove = (runtime: BattleAiScriptCommandsRuntime): boolean => {
  const moves = runtime.gBattleMons[runtime.gBattlerAttacker]?.moves ?? [];
  for (let i = 0; i < 4; i++) {
    const move = moves[i] ?? 0;
    if (move !== 0 && (runtime.gBattleMoves[move]?.power ?? 0) !== 0) return true;
  }
  return false;
};

const isDiscouragedPowerfulMoveEffect = (effect: number): boolean => {
  for (const discouragedEffect of sDiscouragedPowerfulMoveEffects) {
    if (discouragedEffect === 0xffff) return false;
    if (effect === discouragedEffect) return true;
  }
  return false;
};

const calcMoveDamage = (runtime: BattleAiScriptCommandsRuntime, move: number): number =>
  runtime.damageByMove[move] ?? 0;

const getSimulatedRng = (runtime: BattleAiScriptCommandsRuntime, index: number): number =>
  runtime.ai.simulatedRNG[index] ?? 100;

const calcMoveDamageWithRng = (runtime: BattleAiScriptCommandsRuntime, move: number, rngIndex: number, minOne: boolean): number => {
  let damage = Math.trunc((calcMoveDamage(runtime, move) * getSimulatedRng(runtime, rngIndex)) / 100);
  if (minOne && damage === 0) damage = 1;
  return damage;
};

const normalizeAiEffectiveness = (runtime: BattleAiScriptCommandsRuntime, move: number, defaultDamage: number): number => {
  let damage = runtime.typeCalcDamageByMove[move] ?? defaultDamage;
  if (damage === 120) damage = AI_EFFECTIVENESS_x2;
  if (damage === 240) damage = AI_EFFECTIVENESS_x4;
  if (damage === 30) damage = AI_EFFECTIVENESS_x0_5;
  if (damage === 15) damage = AI_EFFECTIVENESS_x0_25;
  if ((runtime.moveResultFlagsByMove[move] ?? 0) & MOVE_RESULT_DOESNT_AFFECT_FOE) damage = AI_EFFECTIVENESS_x0;
  return damage;
};

const getDisableStruct = (runtime: BattleAiScriptCommandsRuntime, battlerId: number): BattleAiDisableStruct => ({
  disabledMove: MOVE_NONE,
  encoredMove: MOVE_NONE,
  isFirstTurn: 0,
  stockpileCounter: 0,
  protectUses: 0,
  tauntTimer: 0,
  ...runtime.gDisableStructs[battlerId]
});

const partyHasExactStatus = (party: BattleAiPartyMon[], statusToCompareTo: number): boolean => {
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (
      mon &&
      mon.species !== SPECIES_NONE &&
      mon.species !== SPECIES_EGG &&
      mon.hp !== 0 &&
      mon.status === statusToCompareTo
    ) {
      return true;
    }
  }
  return false;
};

export const Cmd_if_random_less_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchRandom(runtime, (random, value) => random < value);

export const Cmd_if_random_greater_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchRandom(runtime, (random, value) => random > value);

export const Cmd_if_random_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchRandom(runtime, (random, value) => random === value);

export const Cmd_if_random_not_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchRandom(runtime, (random, value) => random !== value);

export const Cmd_score = (runtime: BattleAiScriptCommandsRuntime): void => {
  const index = runtime.ai.movesetIndex;
  runtime.ai.score[index] += readByte(runtime, 1);
  if (runtime.ai.score[index] < 0) runtime.ai.score[index] = 0;
  runtime.sAIScriptPtr += 2;
};

export const Cmd_if_hp_less_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchHp(runtime, (hpPercent, value) => hpPercent < value);

export const Cmd_if_hp_more_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchHp(runtime, (hpPercent, value) => hpPercent > value);

export const Cmd_if_hp_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchHp(runtime, (hpPercent, value) => hpPercent === value);

export const Cmd_if_hp_not_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchHp(runtime, (hpPercent, value) => hpPercent !== value);

export const Cmd_if_status = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatusMonField(runtime, 'status1', hasStatus => hasStatus);

export const Cmd_if_not_status = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatusMonField(runtime, 'status1', hasStatus => !hasStatus);

export const Cmd_if_status2 = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatusMonField(runtime, 'status2', hasStatus => hasStatus);

export const Cmd_if_not_status2 = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatusMonField(runtime, 'status2', hasStatus => !hasStatus);

export const Cmd_if_status3 = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatus3(runtime, hasStatus => hasStatus);

export const Cmd_if_not_status3 = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatus3(runtime, hasStatus => !hasStatus);

export const Cmd_if_side_affecting = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchSideAffecting(runtime, hasStatus => hasStatus);

export const Cmd_if_not_side_affecting = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchSideAffecting(runtime, hasStatus => !hasStatus);

export const Cmd_if_less_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultImmediate(runtime, (funcResult, value) => funcResult < value);

export const Cmd_if_more_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultImmediate(runtime, (funcResult, value) => funcResult > value);

export const Cmd_if_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultImmediate(runtime, (funcResult, value) => funcResult === value);

export const Cmd_if_not_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultImmediate(runtime, (funcResult, value) => funcResult !== value);

export const Cmd_if_less_than_ptr = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultPointer(runtime, (funcResult, value) => funcResult < value);

export const Cmd_if_more_than_ptr = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultPointer(runtime, (funcResult, value) => funcResult > value);

export const Cmd_if_equal_ptr = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultPointer(runtime, (funcResult, value) => funcResult === value);

export const Cmd_if_not_equal_ptr = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultPointer(runtime, (funcResult, value) => funcResult !== value);

export const Cmd_if_move = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchMove(runtime, (moveConsidered, move) => moveConsidered === move);

export const Cmd_if_not_move = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchMove(runtime, (moveConsidered, move) => moveConsidered !== move);

export const Cmd_if_in_bytes = (runtime: BattleAiScriptCommandsRuntime): void => {
  branchInBytes(runtime, true);
};

export const Cmd_if_not_in_bytes = (runtime: BattleAiScriptCommandsRuntime): void => {
  branchInBytes(runtime, false);
};

export const Cmd_if_in_hwords = (runtime: BattleAiScriptCommandsRuntime): void => {
  branchInHwords(runtime, true);
};

export const Cmd_if_not_in_hwords = (runtime: BattleAiScriptCommandsRuntime): void => {
  branchInHwords(runtime, false);
};

export const Cmd_if_user_has_attacking_move = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (userHasAttackingMove(runtime)) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  } else {
    runtime.sAIScriptPtr += 5;
  }
};

export const Cmd_if_user_has_no_attacking_moves = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (userHasAttackingMove(runtime)) {
    runtime.sAIScriptPtr += 5;
  } else {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  }
};

export const Cmd_if_effect = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchMoveEffect(runtime, (effect, value) => effect === value);

export const Cmd_if_not_effect = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchMoveEffect(runtime, (effect, value) => effect !== value);

export const Cmd_if_stat_level_less_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatLevel(runtime, (statLevel, value) => statLevel < value);

export const Cmd_if_stat_level_more_than = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatLevel(runtime, (statLevel, value) => statLevel > value);

export const Cmd_if_stat_level_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatLevel(runtime, (statLevel, value) => statLevel === value);

export const Cmd_if_stat_level_not_equal = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchStatLevel(runtime, (statLevel, value) => statLevel !== value);

export const Cmd_if_has_move = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (hasMove(runtime, readByte(runtime, 1), readU16(runtime, 2))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 4);
  } else {
    runtime.sAIScriptPtr += 8;
  }
};

export const Cmd_if_doesnt_have_move = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (hasMove(runtime, readByte(runtime, 1), readU16(runtime, 2))) {
    runtime.sAIScriptPtr += 8;
  } else {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 4);
  }
};

export const Cmd_if_has_move_with_effect = (runtime: BattleAiScriptCommandsRuntime): void => {
  switch (readByte(runtime, 1)) {
    case AI_USER:
    case AI_USER_PARTNER:
      if (userHasMoveEffect(runtime, readByte(runtime, 2))) {
        runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
      } else {
        runtime.sAIScriptPtr += 7;
      }
      break;
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
      break;
  }
};

export const Cmd_if_doesnt_have_move_with_effect = (runtime: BattleAiScriptCommandsRuntime): void => {
  switch (readByte(runtime, 1)) {
    case AI_USER:
    case AI_USER_PARTNER:
      if (userHasMoveEffect(runtime, readByte(runtime, 2))) {
        runtime.sAIScriptPtr += 7;
      } else {
        runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
      }
      break;
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      runtime.sAIScriptPtr += 7;
      break;
  }
};

export const Cmd_get_last_used_battler_move = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (readByte(runtime, 1) === AI_USER) {
    runtime.ai.funcResult = runtime.gLastMoves[runtime.gBattlerAttacker] ?? 0;
  } else {
    runtime.ai.funcResult = runtime.gLastMoves[runtime.gBattlerTarget] ?? 0;
  }
  runtime.sAIScriptPtr += 2;
};

export const Cmd_count_alive_pokemon = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = 0;
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  const party = getBattlerSide(runtime, battlerId) === 0 ? runtime.gPlayerParty : runtime.gEnemyParty;
  let battlerOnField1: number;
  let battlerOnField2: number;

  if (runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    battlerOnField1 = runtime.gBattlerPartyIndexes[battlerId] ?? 0;
    const position = getBattlerPosition(runtime, battlerId) ^ BIT_FLANK;
    battlerOnField2 = runtime.gBattlerPartyIndexes[getBattlerAtPosition(runtime, position)] ?? 0;
  } else {
    battlerOnField1 = runtime.gBattlerPartyIndexes[battlerId] ?? 0;
    battlerOnField2 = runtime.gBattlerPartyIndexes[battlerId] ?? 0;
  }

  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (
      i !== battlerOnField1 &&
      i !== battlerOnField2 &&
      mon &&
      mon.hp !== 0 &&
      mon.species !== SPECIES_NONE &&
      mon.species !== SPECIES_EGG
    ) {
      runtime.ai.funcResult++;
    }
  }
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_ability = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  if (getBattlerSide(runtime, battlerId) === AI_TARGET) {
    const side = getBattlerSide(runtime, battlerId);
    const knownAbility = runtime.battleHistory.abilities?.[side] ?? 0;
    if (knownAbility !== 0) {
      runtime.ai.funcResult = knownAbility;
      runtime.sAIScriptPtr += 2;
      return;
    }

    const ability = runtime.gBattleMons[battlerId]?.ability ?? ABILITY_NONE;
    if (ability === ABILITY_SHADOW_TAG || ability === ABILITY_MAGNET_PULL || ability === ABILITY_ARENA_TRAP) {
      runtime.ai.funcResult = ability;
      runtime.sAIScriptPtr += 2;
      return;
    }

    const species = runtime.gBattleMons[battlerId]?.species ?? SPECIES_NONE;
    const abilities = runtime.speciesInfoAbilities[species] ?? [ABILITY_NONE, ABILITY_NONE];
    if (abilities[0] !== ABILITY_NONE) {
      if (abilities[1] !== ABILITY_NONE) {
        runtime.ai.funcResult = (runtime.randomValues.shift() ?? 0) % 2 ? abilities[0] : abilities[1];
      } else {
        runtime.ai.funcResult = abilities[0];
      }
    } else {
      runtime.ai.funcResult = abilities[1];
    }
  } else {
    runtime.ai.funcResult = runtime.gBattleMons[battlerId]?.ability ?? ABILITY_NONE;
  }
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_highest_type_effectiveness = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = 0;
  const moves = runtime.gBattleMons[runtime.gBattlerAttacker]?.moves ?? [];
  for (let i = 0; i < 4; i++) {
    const currentMove = moves[i] ?? MOVE_NONE;
    if (currentMove !== MOVE_NONE) {
      const damage = normalizeAiEffectiveness(runtime, currentMove, 40);
      if (runtime.ai.funcResult < damage) runtime.ai.funcResult = damage;
    }
  }
  runtime.sAIScriptPtr += 1;
};

export const Cmd_if_type_effectiveness = (runtime: BattleAiScriptCommandsRuntime): void => {
  const damageVar = normalizeAiEffectiveness(runtime, runtime.ai.moveConsidered, AI_EFFECTIVENESS_x1) & 0xff;
  if (damageVar === readByte(runtime, 1)) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
  } else {
    runtime.sAIScriptPtr += 6;
  }
};

export const Cmd_if_equal_ = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultImmediate(runtime, (funcResult, value) => value === funcResult);

export const Cmd_if_not_equal_ = (runtime: BattleAiScriptCommandsRuntime): void =>
  branchFuncResultImmediate(runtime, (funcResult, value) => value !== funcResult);

export const Cmd_if_would_go_first = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (runtime.whoStrikesFirstResult === readByte(runtime, 1)) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
  } else {
    runtime.sAIScriptPtr += 6;
  }
};

export const Cmd_if_would_not_go_first = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (runtime.whoStrikesFirstResult !== readByte(runtime, 1)) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
  } else {
    runtime.sAIScriptPtr += 6;
  }
};

export const Cmd_if_status_in_party = (runtime: BattleAiScriptCommandsRuntime): void => {
  const party = readByte(runtime, 1) === 1 ? runtime.gEnemyParty : runtime.gPlayerParty;
  if (partyHasExactStatus(party, readU32(runtime, 2))) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 6);
  } else {
    runtime.sAIScriptPtr += 10;
  }
};

export const Cmd_if_status_not_in_party = (runtime: BattleAiScriptCommandsRuntime): void => {
  const party = readByte(runtime, 1) === 1 ? runtime.gEnemyParty : runtime.gPlayerParty;
  const statusToCompareTo = readU32(runtime, 2);
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (
      mon &&
      mon.species !== SPECIES_NONE &&
      mon.species !== SPECIES_EGG &&
      mon.hp !== 0 &&
      mon.status === statusToCompareTo
    ) {
      runtime.sAIScriptPtr += 10;
    }
  }
  runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 6);
};

export const Cmd_if_any_move_disabled_or_encored = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  const disableStruct = getDisableStruct(runtime, battlerId);
  switch (readByte(runtime, 2)) {
    case 0:
      if (disableStruct.disabledMove === MOVE_NONE) runtime.sAIScriptPtr += 7;
      else runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
      break;
    case 1:
      if (disableStruct.encoredMove !== MOVE_NONE) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 3);
      else runtime.sAIScriptPtr += 7;
      break;
    default:
      runtime.sAIScriptPtr += 7;
      break;
  }
};

export const Cmd_if_curr_move_disabled_or_encored = (runtime: BattleAiScriptCommandsRuntime): void => {
  const disableStruct = getDisableStruct(runtime, runtime.gActiveBattler);
  switch (readByte(runtime, 1)) {
    case 0:
      if (disableStruct.disabledMove === runtime.ai.moveConsidered) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
      else runtime.sAIScriptPtr += 6;
      break;
    case 1:
      if (disableStruct.encoredMove === runtime.ai.moveConsidered) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
      else runtime.sAIScriptPtr += 6;
      break;
    default:
      runtime.sAIScriptPtr += 6;
      break;
  }
};

export const Cmd_if_random_safari_flee = (runtime: BattleAiScriptCommandsRuntime): void => {
  let safariFleeRate: number;
  if (runtime.safariRockThrowCounter) {
    safariFleeRate = runtime.safariEscapeFactor * 2;
    if (safariFleeRate > 20) safariFleeRate = 20;
  } else if (runtime.safariBaitThrowCounter !== 0) {
    safariFleeRate = Math.trunc(runtime.safariEscapeFactor / 4);
    if (safariFleeRate === 0) safariFleeRate = 1;
  } else {
    safariFleeRate = runtime.safariEscapeFactor;
  }
  safariFleeRate *= 5;
  if ((runtime.randomValues.shift() ?? 0) % 100 < safariFleeRate) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  } else {
    runtime.sAIScriptPtr += 5;
  }
};

export const Cmd_get_hold_effect = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  if (getBattlerSide(runtime, battlerId) === 0) {
    const side = getBattlerSide(runtime, battlerId);
    runtime.ai.funcResult = runtime.battleHistory.itemEffects?.[side] ?? 0;
  } else {
    const item = runtime.gBattleMons[battlerId]?.item ?? 0;
    runtime.ai.funcResult = runtime.itemHoldEffects[item] ?? 0;
  }
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_gender = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  runtime.ai.funcResult = runtime.gBattleMons[battlerId]?.gender ?? 0;
  runtime.sAIScriptPtr += 2;
};

export const Cmd_is_first_turn_for = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  runtime.ai.funcResult = getDisableStruct(runtime, battlerId).isFirstTurn;
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_stockpile_count = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  runtime.ai.funcResult = getDisableStruct(runtime, battlerId).stockpileCounter;
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_used_held_item = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  runtime.ai.funcResult = runtime.usedHeldItems[battlerId * 2] ?? 0;
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_move_type_from_result = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.gBattleMoves[runtime.ai.funcResult]?.type ?? 0;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_move_power_from_result = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.gBattleMoves[runtime.ai.funcResult]?.power ?? 0;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_move_effect_from_result = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.gBattleMoves[runtime.ai.funcResult]?.effect ?? 0;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_protect_count = (runtime: BattleAiScriptCommandsRuntime): void => {
  const battlerId = getAiBattler(runtime, readByte(runtime, 1));
  runtime.ai.funcResult = getDisableStruct(runtime, battlerId).protectUses;
  runtime.sAIScriptPtr += 2;
};

export const Cmd_if_level_compare = (runtime: BattleAiScriptCommandsRuntime): void => {
  const attackerLevel = runtime.gBattleMons[runtime.gBattlerAttacker]?.level ?? 0;
  const targetLevel = runtime.gBattleMons[runtime.gBattlerTarget]?.level ?? 0;
  switch (readByte(runtime, 1)) {
    case 0:
      if (attackerLevel > targetLevel) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
      else runtime.sAIScriptPtr += 6;
      return;
    case 1:
      if (attackerLevel < targetLevel) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
      else runtime.sAIScriptPtr += 6;
      return;
    case 2:
      if (attackerLevel === targetLevel) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 2);
      else runtime.sAIScriptPtr += 6;
      return;
  }
};

export const Cmd_if_can_faint = (runtime: BattleAiScriptCommandsRuntime): void => {
  const move = runtime.ai.moveConsidered;
  if ((runtime.gBattleMoves[move]?.power ?? 0) < 2) {
    runtime.sAIScriptPtr += 5;
    return;
  }
  const damage = calcMoveDamageWithRng(runtime, move, runtime.ai.movesetIndex, true);
  if ((runtime.gBattleMons[runtime.gBattlerTarget]?.hp ?? 0) <= damage) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  } else {
    runtime.sAIScriptPtr += 5;
  }
};

export const Cmd_if_cant_faint = (runtime: BattleAiScriptCommandsRuntime): void => {
  const move = runtime.ai.moveConsidered;
  if ((runtime.gBattleMoves[move]?.power ?? 0) < 2) {
    runtime.sAIScriptPtr += 5;
    return;
  }
  const damage = calcMoveDamageWithRng(runtime, move, runtime.ai.movesetIndex, false);
  if ((runtime.gBattleMons[runtime.gBattlerTarget]?.hp ?? 0) > damage) {
    runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  } else {
    runtime.sAIScriptPtr += 5;
  }
};

export const Cmd_if_target_taunted = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (getDisableStruct(runtime, runtime.gBattlerTarget).tauntTimer !== 0) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  else runtime.sAIScriptPtr += 5;
};

export const Cmd_if_target_not_taunted = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (getDisableStruct(runtime, runtime.gBattlerTarget).tauntTimer === 0) runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
  else runtime.sAIScriptPtr += 5;
};

export const AIStackPushVar_cursor = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.AI_ScriptsStack.ptr[runtime.AI_ScriptsStack.size++] = runtime.sAIScriptPtr;
};

export const AIStackPushVar = (runtime: BattleAiScriptCommandsRuntime, ptr: number): void => {
  runtime.AI_ScriptsStack.ptr[runtime.AI_ScriptsStack.size++] = ptr;
};

export const AIStackPop = (runtime: BattleAiScriptCommandsRuntime): boolean => {
  if (runtime.AI_ScriptsStack.size !== 0) {
    runtime.AI_ScriptsStack.size--;
    runtime.sAIScriptPtr = runtime.AI_ScriptsStack.ptr[runtime.AI_ScriptsStack.size] ?? 0;
    return true;
  }
  return false;
};

export const Cmd_call = (runtime: BattleAiScriptCommandsRuntime): void => {
  AIStackPushVar(runtime, runtime.sAIScriptPtr + 5);
  runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
};

export const Cmd_goto = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.sAIScriptPtr = readPointer(runtime, runtime.sAIScriptPtr + 1);
};

export const Cmd_end = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (!AIStackPop(runtime)) runtime.ai.aiAction |= AI_ACTION_DONE;
};

export const Cmd_nullsub_2A = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_2B = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_32 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_33 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_52 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_53 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_54 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_55 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_56 = (_runtime: BattleAiScriptCommandsRuntime): void => {};
export const Cmd_nullsub_57 = (_runtime: BattleAiScriptCommandsRuntime): void => {};

export const Cmd_flee = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.aiAction |= AI_ACTION_DONE | AI_ACTION_FLEE | AI_ACTION_DO_NOT_ATTACK;
};

export const Cmd_watch = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.aiAction |= AI_ACTION_DONE | AI_ACTION_WATCH | AI_ACTION_DO_NOT_ATTACK;
};

export const Cmd_get_turn_count = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.battleTurnCounter;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_considered_move = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.ai.moveConsidered;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_considered_move_effect = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.gBattleMoves[runtime.ai.moveConsidered]?.effect ?? 0;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_type = (runtime: BattleAiScriptCommandsRuntime): void => {
  switch (readByte(runtime, 1)) {
    case AI_TYPE1_USER:
      runtime.ai.funcResult = runtime.gBattleMons[runtime.gBattlerAttacker]?.type1 ?? 0;
      break;
    case AI_TYPE1_TARGET:
      runtime.ai.funcResult = runtime.gBattleMons[runtime.gBattlerTarget]?.type1 ?? 0;
      break;
    case AI_TYPE2_USER:
      runtime.ai.funcResult = runtime.gBattleMons[runtime.gBattlerAttacker]?.type2 ?? 0;
      break;
    case AI_TYPE2_TARGET:
      runtime.ai.funcResult = runtime.gBattleMons[runtime.gBattlerTarget]?.type2 ?? 0;
      break;
    case AI_TYPE_MOVE:
      runtime.ai.funcResult = runtime.gBattleMoves[runtime.ai.moveConsidered]?.type ?? 0;
      break;
  }
  runtime.sAIScriptPtr += 2;
};

export const Cmd_get_considered_move_power = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.gBattleMoves[runtime.ai.moveConsidered]?.power ?? 0;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_how_powerful_move_is = (runtime: BattleAiScriptCommandsRuntime): void => {
  const consideredMove = runtime.ai.moveConsidered;
  const consideredMoveData = runtime.gBattleMoves[consideredMove];
  if ((consideredMoveData?.power ?? 0) > 1 && !isDiscouragedPowerfulMoveEffect(consideredMoveData?.effect ?? 0)) {
    const moves = runtime.gBattleMons[runtime.gBattlerAttacker]?.moves ?? [];
    const moveDmgs = [0, 0, 0, 0];
    for (let checkedMove = 0; checkedMove < 4; checkedMove++) {
      const move = moves[checkedMove] ?? MOVE_NONE;
      const moveData = runtime.gBattleMoves[move];
      if (move !== MOVE_NONE && !isDiscouragedPowerfulMoveEffect(moveData?.effect ?? 0) && (moveData?.power ?? 0) > 1) {
        moveDmgs[checkedMove] = calcMoveDamageWithRng(runtime, move, checkedMove, true);
      } else {
        moveDmgs[checkedMove] = 0;
      }
    }

    let checkedMove = 0;
    for (; checkedMove < 4; checkedMove++) {
      if (moveDmgs[checkedMove] > moveDmgs[runtime.ai.movesetIndex]) break;
    }
    runtime.ai.funcResult = checkedMove === 4 ? MOVE_MOST_POWERFUL : MOVE_NOT_MOST_POWERFUL;
  } else {
    runtime.ai.funcResult = MOVE_POWER_DISCOURAGED;
  }
  runtime.sAIScriptPtr += 1;
};

export const Cmd_get_weather = (runtime: BattleAiScriptCommandsRuntime): void => {
  if (runtime.gBattleWeather & B_WEATHER_RAIN) runtime.ai.funcResult = WEATHER_TYPE_RAIN;
  if (runtime.gBattleWeather & B_WEATHER_SANDSTORM) runtime.ai.funcResult = WEATHER_TYPE_SANDSTORM;
  if (runtime.gBattleWeather & B_WEATHER_SUN) runtime.ai.funcResult = WEATHER_TYPE_SUNNY;
  if (runtime.gBattleWeather & B_WEATHER_HAIL_TEMPORARY) runtime.ai.funcResult = WEATHER_TYPE_HAIL;
  runtime.sAIScriptPtr += 1;
};

export const Cmd_is_double_battle = (runtime: BattleAiScriptCommandsRuntime): void => {
  runtime.ai.funcResult = runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE;
  runtime.sAIScriptPtr += 1;
};

export const BattleAI_HandleItemUseBeforeAISetup = BattleAi.getDecompBattleAiSourceFunction;
export const BattleAI_SetupAIData = BattleAi.getDecompBattleAiSourceFunction;
export const BattleAI_ChooseMoveOrAction = BattleAi.getDecompBattleAiSourceFunction;
export const BattleAI_DoAIProcessing = BattleAi.getDecompBattleAiSourceFunction;
export const RecordLastUsedMoveByTarget = BattleAi.getDecompBattleAiSourceFunction;
export const ClearBattlerMoveHistory = BattleAi.getDecompBattleAiSourceFunction;
export const RecordAbilityBattle = BattleAi.getDecompBattleAiSourceFunction;
export const RecordItemEffectBattle = BattleAi.getDecompBattleAiSourceFunction;
