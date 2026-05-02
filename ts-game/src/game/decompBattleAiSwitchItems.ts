export const PARTY_SIZE = 6;
export const MAX_MON_MOVES = 4;
export const MAX_TRAINER_ITEMS = 4;
export const NUM_BATTLE_STATS = 8;

export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const MOVE_NONE = 0;
export const MOVE_SENTINEL = 0xffff;

export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const BIT_SIDE = 1;
export const BIT_FLANK = 2;

export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_TRAINER = 1 << 3;

export const B_ACTION_USE_MOVE = 0;
export const B_ACTION_USE_ITEM = 1;
export const B_ACTION_SWITCH = 2;

export const STATUS1_SLEEP = (1 << 0) | (1 << 1) | (1 << 2);
export const STATUS1_POISON = 1 << 3;
export const STATUS1_BURN = 1 << 4;
export const STATUS1_FREEZE = 1 << 5;
export const STATUS1_PARALYSIS = 1 << 6;
export const STATUS1_TOXIC_POISON = 1 << 7;
export const STATUS2_CONFUSION = (1 << 0) | (1 << 1) | (1 << 2);
export const STATUS2_WRAPPED = (1 << 13) | (1 << 14) | (1 << 15);
export const STATUS2_ESCAPE_PREVENTION = 1 << 26;
export const STATUS3_ROOTED = 1 << 2;
export const STATUS3_PERISH_SONG = 1 << 5;

export const MOVE_RESULT_SUPER_EFFECTIVE = 1 << 1;
export const MOVE_RESULT_NOT_VERY_EFFECTIVE = 1 << 2;
export const MOVE_RESULT_DOESNT_AFFECT_FOE = 1 << 3;

export const TYPE_NORMAL = 0;
export const TYPE_FIGHTING = 1;
export const TYPE_FLYING = 2;
export const TYPE_POISON = 3;
export const TYPE_GROUND = 4;
export const TYPE_ROCK = 5;
export const TYPE_BUG = 6;
export const TYPE_GHOST = 7;
export const TYPE_STEEL = 8;
export const TYPE_FIRE = 10;
export const TYPE_WATER = 11;
export const TYPE_GRASS = 12;
export const TYPE_ELECTRIC = 13;
export const TYPE_ICE = 15;
export const TYPE_FORESIGHT = 0xfe;
export const TYPE_ENDTABLE = 0xff;

export const TYPE_MUL_NO_EFFECT = 0;
export const TYPE_MUL_NOT_EFFECTIVE = 5;
export const TYPE_MUL_NORMAL = 10;
export const TYPE_MUL_SUPER_EFFECTIVE = 20;

export const ABILITY_NONE = 0;
export const ABILITY_VOLT_ABSORB = 10;
export const ABILITY_WATER_ABSORB = 11;
export const ABILITY_FLASH_FIRE = 18;
export const ABILITY_SHADOW_TAG = 23;
export const ABILITY_WONDER_GUARD = 25;
export const ABILITY_NATURAL_CURE = 30;
export const ABILITY_MAGNET_PULL = 42;
export const ABILITY_ARENA_TRAP = 71;

export const ABILITYEFFECT_CHECK_OTHER_SIDE = 0;
export const ABILITYEFFECT_FIELD_SPORT = 1;

export const ITEM_NONE = 0;
export const ITEM_POTION = 13;
export const ITEM_FULL_RESTORE = 19;
export const ITEM_ENIGMA_BERRY = 175;

export const ITEM0_X_ATTACK = 0x0f;
export const ITEM0_DIRE_HIT = 0x30;
export const ITEM1_X_SPEED = 0x0f;
export const ITEM1_X_DEFEND = 0xf0;
export const ITEM2_X_SPATK = 0x0f;
export const ITEM2_X_ACCURACY = 0xf0;
export const ITEM3_CONFUSION = 0x01;
export const ITEM3_PARALYSIS = 0x02;
export const ITEM3_FREEZE = 0x04;
export const ITEM3_BURN = 0x08;
export const ITEM3_POISON = 0x10;
export const ITEM3_SLEEP = 0x20;
export const ITEM3_GUARD_SPEC = 0x80;
export const ITEM3_STATUS_ALL =
  ITEM3_CONFUSION | ITEM3_PARALYSIS | ITEM3_FREEZE | ITEM3_BURN | ITEM3_POISON | ITEM3_SLEEP;
export const ITEM4_HEAL_HP = 0x04;
export const ITEM4_PP_UP = 0x20;
export const ITEM4_REVIVE = 0x40;
export const ITEM_EFFECT_ARG_START = 6;

export const AI_ITEM_FULL_RESTORE = 1;
export const AI_ITEM_HEAL_HP = 2;
export const AI_ITEM_CURE_CONDITION = 3;
export const AI_ITEM_X_STAT = 4;
export const AI_ITEM_GUARD_SPECS = 5;
export const AI_ITEM_NOT_RECOGNIZABLE = 6;

export const MON_DATA_HP = 'hp';
export const MON_DATA_SPECIES = 'species';
export const MON_DATA_SPECIES_OR_EGG = 'speciesOrEgg';
export const MON_DATA_ABILITY_NUM = 'abilityNum';
export const MON_DATA_MOVE1 = 0;

export interface BattleAiMove {
  power: number;
  type: number;
}

export interface BattleAiMon {
  hp: number;
  maxHP?: number;
  species: number;
  speciesOrEgg?: number;
  abilityNum?: number;
  ability?: number;
  moves?: number[];
  type1?: number;
  type2?: number;
  status1?: number;
  status2?: number;
  statStages?: number[];
}

export interface BattleAiSpeciesInfo {
  abilities: [number, number];
  types: [number, number];
}

export interface BattleAiDisableStruct {
  perishSongTimer: number;
  isFirstTurn: boolean;
}

export interface BattleAiSideTimer {
  mistTimer: number;
}

export interface BattleAiBattleStruct {
  AI_monToSwitchIntoId: number[];
  monToSwitchIntoId: number[];
  AI_itemType: number[];
  AI_itemFlags: number[];
  chosenItem: number[];
  dynamicMoveType: number;
}

export interface BattleAiBattleHistory {
  itemsNo: number;
  trainerItems: number[];
}

export interface BattleAiResources {
  battleHistory: BattleAiBattleHistory;
}

export interface BattleAiScripting {
  dmgMultiplier: number;
}

export interface BattleAiControllerAction {
  bufferId: number;
  action: number;
  value: number;
}

export type TypeEffectivenessEntry = readonly [atkType: number, defType: number, multiplier: number];

export interface BattleAiSwitchItemsRuntime {
  gBattleTypeFlags: number;
  gActiveBattler: number;
  gStatuses3: number[];
  gDisableStructs: BattleAiDisableStruct[];
  gBattleMons: BattleAiMon[];
  gEnemyParty: BattleAiMon[];
  gBattleStruct: BattleAiBattleStruct;
  gBattlerPartyIndexes: number[];
  gLastLandedMoves: number[];
  gLastHitBy: number[];
  gBattleMoves: Record<number, BattleAiMove>;
  gAbsentBattlerFlags: number;
  gBitTable: number[];
  gSpeciesInfo: Record<number, BattleAiSpeciesInfo>;
  gBattleResources: BattleAiResources;
  gSaveBlock1Ptr: { enigmaBerry: { itemEffect: number[] } };
  gItemEffectTable: Record<number, number[] | null>;
  gSideTimers: BattleAiSideTimer[];
  gDynamicBasePower: number;
  gBattleScripting: BattleAiScripting;
  gMoveResultFlags: number;
  gCritMultiplier: number;
  gBattleMoveDamage: number;
  gTypeEffectiveness: TypeEffectivenessEntry[];
  randomValues: number[];
  controllerActions: BattleAiControllerAction[];
  abilityBattleEffects?: (
    effect: number,
    battler: number,
    ability: number,
    special: number,
    moveArg: number
  ) => number | boolean;
  aiTypeCalc?: (move: number, species: number, ability: number) => number;
  typeCalc?: (move: number, attacker: number, defender: number) => number;
  aiCalcDmg?: (attacker: number, defender: number) => number;
}

export const createBattleAiMon = (overrides: Partial<BattleAiMon> = {}): BattleAiMon => ({
  hp: 1,
  maxHP: 1,
  species: SPECIES_NONE,
  speciesOrEgg: overrides.species ?? SPECIES_NONE,
  abilityNum: ABILITY_NONE,
  ability: ABILITY_NONE,
  moves: [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
  type1: TYPE_NORMAL,
  type2: TYPE_NORMAL,
  status1: 0,
  status2: 0,
  statStages: [6, 6, 6, 6, 6, 6, 6, 6],
  ...overrides
});

export const createBattleAiSwitchItemsRuntime = (
  overrides: Partial<BattleAiSwitchItemsRuntime> = {}
): BattleAiSwitchItemsRuntime => ({
  gBattleTypeFlags: BATTLE_TYPE_TRAINER,
  gActiveBattler: B_POSITION_OPPONENT_LEFT,
  gStatuses3: [0, 0, 0, 0],
  gDisableStructs: Array.from({ length: 4 }, () => ({ perishSongTimer: 1, isFirstTurn: false })),
  gBattleMons: Array.from({ length: 4 }, () => createBattleAiMon()),
  gEnemyParty: Array.from({ length: PARTY_SIZE }, () => createBattleAiMon()),
  gBattleStruct: {
    AI_monToSwitchIntoId: [PARTY_SIZE, PARTY_SIZE],
    monToSwitchIntoId: [PARTY_SIZE, PARTY_SIZE, PARTY_SIZE, PARTY_SIZE],
    AI_itemType: [0, 0],
    AI_itemFlags: [0, 0],
    chosenItem: [0, 0, 0, 0],
    dynamicMoveType: 0
  },
  gBattlerPartyIndexes: [0, 0, 0, 0],
  gLastLandedMoves: [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
  gLastHitBy: [0xff, 0xff, 0xff, 0xff],
  gBattleMoves: {},
  gAbsentBattlerFlags: 0,
  gBitTable: [1, 2, 4, 8, 16, 32],
  gSpeciesInfo: {},
  gBattleResources: {
    battleHistory: {
      itemsNo: 0,
      trainerItems: [ITEM_NONE, ITEM_NONE, ITEM_NONE, ITEM_NONE]
    }
  },
  gSaveBlock1Ptr: { enigmaBerry: { itemEffect: [] } },
  gItemEffectTable: {},
  gSideTimers: [{ mistTimer: 0 }, { mistTimer: 0 }],
  gDynamicBasePower: 0,
  gBattleScripting: { dmgMultiplier: 1 },
  gMoveResultFlags: 0,
  gCritMultiplier: 1,
  gBattleMoveDamage: 0,
  gTypeEffectiveness: [[TYPE_ENDTABLE, TYPE_ENDTABLE, TYPE_MUL_NO_EFFECT]],
  randomValues: [],
  controllerActions: [],
  ...overrides
});

const toU8 = (value: number): number => value & 0xff;

const random = (runtime: BattleAiSwitchItemsRuntime): number =>
  runtime.randomValues.length > 0 ? (runtime.randomValues.shift() ?? 0) >>> 0 : 0;

const getBattlerPosition = (_runtime: BattleAiSwitchItemsRuntime, battler: number): number => battler;

const getBattlerAtPosition = (_runtime: BattleAiSwitchItemsRuntime, position: number): number => position;

const battlePartner = (id: number): number => id ^ 2;

const getBattlerSide = (runtime: BattleAiSwitchItemsRuntime, battler: number): number =>
  getBattlerPosition(runtime, battler) & BIT_SIDE;

const getMonData = (mon: BattleAiMon, field: string | number): number => {
  if (field === MON_DATA_HP) {
    return mon.hp;
  }
  if (field === MON_DATA_SPECIES) {
    return mon.species;
  }
  if (field === MON_DATA_SPECIES_OR_EGG) {
    return mon.speciesOrEgg ?? mon.species;
  }
  if (field === MON_DATA_ABILITY_NUM) {
    return mon.abilityNum ?? ABILITY_NONE;
  }
  if (typeof field === 'number') {
    return mon.moves?.[field - MON_DATA_MOVE1] ?? MOVE_NONE;
  }
  return 0;
};

const emitTwoReturnValues = (
  runtime: BattleAiSwitchItemsRuntime,
  bufferId: number,
  action: number,
  value: number
): void => {
  runtime.controllerActions.push({ bufferId, action, value });
};

const abilityBattleEffects = (
  runtime: BattleAiSwitchItemsRuntime,
  effect: number,
  battler: number,
  ability: number,
  special: number,
  moveArg: number
): number | boolean => runtime.abilityBattleEffects?.(effect, battler, ability, special, moveArg) ?? false;

const aiTypeCalc = (
  runtime: BattleAiSwitchItemsRuntime,
  move: number,
  species: number,
  ability: number
): number => runtime.aiTypeCalc?.(move, species, ability) ?? 0;

const typeCalc = (
  runtime: BattleAiSwitchItemsRuntime,
  move: number,
  attacker: number,
  defender: number
): number => runtime.typeCalc?.(move, attacker, defender) ?? aiTypeCalc(
  runtime,
  move,
  runtime.gBattleMons[defender]?.species ?? SPECIES_NONE,
  runtime.gBattleMons[defender]?.ability ?? ABILITY_NONE
);

const aiCalcDmg = (runtime: BattleAiSwitchItemsRuntime, attacker: number, defender: number): void => {
  const damage = runtime.aiCalcDmg?.(attacker, defender);
  if (damage !== undefined) {
    runtime.gBattleMoveDamage = toU8(damage);
  }
};

export function ShouldSwitchIfPerishSong(runtime: BattleAiSwitchItemsRuntime): boolean {
  if (
    (runtime.gStatuses3[runtime.gActiveBattler] & STATUS3_PERISH_SONG) !== 0
    && runtime.gDisableStructs[runtime.gActiveBattler].perishSongTimer === 0
  ) {
    runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = PARTY_SIZE;
    emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
    return true;
  }
  return false;
}

export function ShouldSwitchIfWonderGuard(runtime: BattleAiSwitchItemsRuntime): boolean {
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0) {
    return false;
  }
  if (runtime.gBattleMons[getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT)].ability === ABILITY_WONDER_GUARD) {
    for (
      let opposingBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT), i = 0;
      i < MAX_MON_MOVES;
      ++i
    ) {
      const move = runtime.gBattleMons[runtime.gActiveBattler].moves?.[i] ?? MOVE_NONE;
      if (move === MOVE_NONE) {
        continue;
      }
      const moveFlags = aiTypeCalc(
        runtime,
        move,
        runtime.gBattleMons[opposingBattler].species,
        runtime.gBattleMons[opposingBattler].ability ?? ABILITY_NONE
      );
      if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) !== 0) {
        return false;
      }
    }
    for (let i = 0; i < PARTY_SIZE; ++i) {
      if (
        getMonData(runtime.gEnemyParty[i], MON_DATA_HP) === 0
        || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE
        || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG
        || i === runtime.gBattlerPartyIndexes[runtime.gActiveBattler]
      ) {
        continue;
      }
      getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES);
      getMonData(runtime.gEnemyParty[i], MON_DATA_ABILITY_NUM);
      for (
        let opposingBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT), j = 0;
        j < MAX_MON_MOVES;
        ++j
      ) {
        const move = getMonData(runtime.gEnemyParty[i], MON_DATA_MOVE1 + j);
        if (move === MOVE_NONE) {
          continue;
        }
        const moveFlags = aiTypeCalc(
          runtime,
          move,
          runtime.gBattleMons[opposingBattler].species,
          runtime.gBattleMons[opposingBattler].ability ?? ABILITY_NONE
        );
        if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) !== 0 && random(runtime) % 3 < 2) {
          runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = i;
          emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
          return true;
        }
      }
    }
  }
  return false;
}

export function HasSuperEffectiveMoveAgainstOpponents(
  runtime: BattleAiSwitchItemsRuntime,
  noRng: boolean
): boolean {
  let opposingBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
  if ((runtime.gAbsentBattlerFlags & runtime.gBitTable[opposingBattler]) === 0) {
    for (let i = 0; i < MAX_MON_MOVES; ++i) {
      const move = runtime.gBattleMons[runtime.gActiveBattler].moves?.[i] ?? MOVE_NONE;
      if (move === MOVE_NONE) {
        continue;
      }
      const moveFlags = aiTypeCalc(
        runtime,
        move,
        runtime.gBattleMons[opposingBattler].species,
        runtime.gBattleMons[opposingBattler].ability ?? ABILITY_NONE
      );
      if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) !== 0) {
        if (noRng || random(runtime) % 10 !== 0) {
          return true;
        }
      }
    }
  }
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) === 0) {
    return false;
  }
  opposingBattler = getBattlerAtPosition(runtime, battlePartner(B_POSITION_PLAYER_LEFT));
  if ((runtime.gAbsentBattlerFlags & runtime.gBitTable[opposingBattler]) === 0) {
    for (let i = 0; i < MAX_MON_MOVES; ++i) {
      const move = runtime.gBattleMons[runtime.gActiveBattler].moves?.[i] ?? MOVE_NONE;
      if (move === MOVE_NONE) {
        continue;
      }
      const moveFlags = aiTypeCalc(
        runtime,
        move,
        runtime.gBattleMons[opposingBattler].species,
        runtime.gBattleMons[opposingBattler].ability ?? ABILITY_NONE
      );
      if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) !== 0) {
        if (noRng) {
          return true;
        }
        if (random(runtime) % 10 !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

export function FindMonThatAbsorbsOpponentsMove(runtime: BattleAiSwitchItemsRuntime): boolean {
  if (
    (HasSuperEffectiveMoveAgainstOpponents(runtime, true) && random(runtime) % 3 !== 0)
    || runtime.gLastLandedMoves[runtime.gActiveBattler] === MOVE_NONE
  ) {
    return false;
  }
  if (
    runtime.gLastLandedMoves[runtime.gActiveBattler] === MOVE_SENTINEL
    || (runtime.gBattleMoves[runtime.gLastLandedMoves[runtime.gActiveBattler]]?.power ?? 0) === 0
  ) {
    return false;
  }
  let battlerIn1: number;
  let battlerIn2: number;
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0) {
    battlerIn1 = runtime.gActiveBattler;
    if (
      (runtime.gAbsentBattlerFlags
        & runtime.gBitTable[getBattlerAtPosition(runtime, battlePartner(getBattlerPosition(runtime, runtime.gActiveBattler)))]) !== 0
    ) {
      battlerIn2 = runtime.gActiveBattler;
    } else {
      battlerIn2 = getBattlerAtPosition(runtime, battlePartner(getBattlerPosition(runtime, runtime.gActiveBattler)));
    }
  } else {
    battlerIn1 = runtime.gActiveBattler;
    battlerIn2 = runtime.gActiveBattler;
  }
  let absorbingTypeAbility: number;
  if (runtime.gBattleMoves[runtime.gLastLandedMoves[runtime.gActiveBattler]].type === TYPE_FIRE) {
    absorbingTypeAbility = ABILITY_FLASH_FIRE;
  } else if (runtime.gBattleMoves[runtime.gLastLandedMoves[runtime.gActiveBattler]].type === TYPE_WATER) {
    absorbingTypeAbility = ABILITY_WATER_ABSORB;
  } else if (runtime.gBattleMoves[runtime.gLastLandedMoves[runtime.gActiveBattler]].type === TYPE_ELECTRIC) {
    absorbingTypeAbility = ABILITY_VOLT_ABSORB;
  } else {
    return false;
  }
  if (runtime.gBattleMons[runtime.gActiveBattler].ability === absorbingTypeAbility) {
    return false;
  }
  for (let i = 0; i < PARTY_SIZE; ++i) {
    if (
      getMonData(runtime.gEnemyParty[i], MON_DATA_HP) === 0
      || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE
      || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG
      || i === runtime.gBattlerPartyIndexes[battlerIn1]
      || i === runtime.gBattlerPartyIndexes[battlerIn2]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn1]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn2]
    ) {
      continue;
    }
    const species = getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES);
    const monAbility = getMonData(runtime.gEnemyParty[i], MON_DATA_ABILITY_NUM) !== ABILITY_NONE
      ? runtime.gSpeciesInfo[species].abilities[1]
      : runtime.gSpeciesInfo[species].abilities[0];
    if (absorbingTypeAbility === monAbility && (random(runtime) & 1) !== 0) {
      runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = i;
      emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
      return true;
    }
  }
  return false;
}

export function AreStatsRaised(runtime: BattleAiSwitchItemsRuntime): boolean {
  let buffedStatsValue = 0;
  for (let i = 0; i < NUM_BATTLE_STATS; ++i) {
    const stage = runtime.gBattleMons[runtime.gActiveBattler].statStages?.[i] ?? 6;
    if (stage > 6) {
      buffedStatsValue = toU8(buffedStatsValue + stage - 6);
    }
  }
  return buffedStatsValue > 3;
}

export function FindMonWithFlagsAndSuperEffective(
  runtime: BattleAiSwitchItemsRuntime,
  flags: number,
  moduloPercent: number
): boolean {
  if (runtime.gLastLandedMoves[runtime.gActiveBattler] === 0) {
    return false;
  }
  if (
    runtime.gLastLandedMoves[runtime.gActiveBattler] === MOVE_SENTINEL
    || runtime.gLastHitBy[runtime.gActiveBattler] === 0xff
    || (runtime.gBattleMoves[runtime.gLastLandedMoves[runtime.gActiveBattler]]?.power ?? 0) === 0
  ) {
    return false;
  }
  let battlerIn1: number;
  let battlerIn2: number;
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0) {
    battlerIn1 = runtime.gActiveBattler;
    if (
      (runtime.gAbsentBattlerFlags
        & runtime.gBitTable[getBattlerAtPosition(runtime, battlePartner(getBattlerPosition(runtime, runtime.gActiveBattler)))]) !== 0
    ) {
      battlerIn2 = runtime.gActiveBattler;
    } else {
      battlerIn2 = getBattlerAtPosition(runtime, battlePartner(getBattlerPosition(runtime, runtime.gActiveBattler)));
    }
  } else {
    battlerIn1 = runtime.gActiveBattler;
    battlerIn2 = runtime.gActiveBattler;
  }
  for (let i = 0; i < PARTY_SIZE; ++i) {
    if (
      getMonData(runtime.gEnemyParty[i], MON_DATA_HP) === 0
      || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE
      || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG
      || i === runtime.gBattlerPartyIndexes[battlerIn1]
      || i === runtime.gBattlerPartyIndexes[battlerIn2]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn1]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn2]
    ) {
      continue;
    }
    const species = getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES);
    const monAbility = getMonData(runtime.gEnemyParty[i], MON_DATA_ABILITY_NUM) !== ABILITY_NONE
      ? runtime.gSpeciesInfo[species].abilities[1]
      : runtime.gSpeciesInfo[species].abilities[0];
    let moveFlags = aiTypeCalc(runtime, runtime.gLastLandedMoves[runtime.gActiveBattler], species, monAbility);
    if ((moveFlags & flags) !== 0) {
      battlerIn1 = runtime.gLastHitBy[runtime.gActiveBattler];
      for (let j = 0; j < MAX_MON_MOVES; ++j) {
        const move = getMonData(runtime.gEnemyParty[i], MON_DATA_MOVE1 + j);
        if (move === MOVE_NONE) {
          continue;
        }
        moveFlags = aiTypeCalc(
          runtime,
          move,
          runtime.gBattleMons[battlerIn1].species,
          runtime.gBattleMons[battlerIn1].ability ?? ABILITY_NONE
        );
        if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) !== 0 && random(runtime) % moduloPercent === 0) {
          runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = i;
          emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
          return true;
        }
      }
    }
  }
  return false;
}

export function ShouldSwitchIfNaturalCure(runtime: BattleAiSwitchItemsRuntime): boolean {
  const activeMon = runtime.gBattleMons[runtime.gActiveBattler];
  if (
    ((activeMon.status1 ?? 0) & STATUS1_SLEEP) === 0
    || activeMon.ability !== ABILITY_NATURAL_CURE
    || activeMon.hp < (activeMon.maxHP ?? 0) / 2
  ) {
    return false;
  }
  if (
    (runtime.gLastLandedMoves[runtime.gActiveBattler] === MOVE_NONE
      || runtime.gLastLandedMoves[runtime.gActiveBattler] === MOVE_SENTINEL)
    && (random(runtime) & 1) !== 0
  ) {
    runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = PARTY_SIZE;
    emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
    return true;
  } else if (
    (runtime.gBattleMoves[runtime.gLastLandedMoves[runtime.gActiveBattler]]?.power ?? 0) === 0
    && (random(runtime) & 1) !== 0
  ) {
    runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = PARTY_SIZE;
    emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
    return true;
  }
  if (
    FindMonWithFlagsAndSuperEffective(runtime, MOVE_RESULT_DOESNT_AFFECT_FOE, 1)
    || FindMonWithFlagsAndSuperEffective(runtime, MOVE_RESULT_NOT_VERY_EFFECTIVE, 1)
  ) {
    return true;
  }
  if ((random(runtime) & 1) !== 0) {
    runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = PARTY_SIZE;
    emitTwoReturnValues(runtime, 1, B_ACTION_SWITCH, 0);
    return true;
  }
  return false;
}

export function ShouldSwitch(runtime: BattleAiSwitchItemsRuntime): boolean {
  const activeMon = runtime.gBattleMons[runtime.gActiveBattler];
  if (
    ((activeMon.status2 ?? 0) & (STATUS2_WRAPPED | STATUS2_ESCAPE_PREVENTION)) !== 0
    || (runtime.gStatuses3[runtime.gActiveBattler] & STATUS3_ROOTED) !== 0
    || abilityBattleEffects(runtime, ABILITYEFFECT_CHECK_OTHER_SIDE, runtime.gActiveBattler, ABILITY_SHADOW_TAG, 0, 0)
    || abilityBattleEffects(runtime, ABILITYEFFECT_CHECK_OTHER_SIDE, runtime.gActiveBattler, ABILITY_ARENA_TRAP, 0, 0)
  ) {
    return false;
  }
  if (abilityBattleEffects(runtime, ABILITYEFFECT_FIELD_SPORT, 0, ABILITY_MAGNET_PULL, 0, 0)) {
    if (activeMon.type1 === TYPE_STEEL || activeMon.type2 === TYPE_STEEL) {
      return false;
    }
  }
  let battlerIn1: number;
  let battlerIn2: number;
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0) {
    battlerIn1 = runtime.gActiveBattler;
    if (
      (runtime.gAbsentBattlerFlags
        & runtime.gBitTable[getBattlerAtPosition(runtime, getBattlerPosition(runtime, runtime.gActiveBattler) ^ BIT_FLANK)]) !== 0
    ) {
      battlerIn2 = runtime.gActiveBattler;
    } else {
      battlerIn2 = getBattlerAtPosition(runtime, getBattlerPosition(runtime, runtime.gActiveBattler) ^ BIT_FLANK);
    }
  } else {
    battlerIn2 = runtime.gActiveBattler;
    battlerIn1 = runtime.gActiveBattler;
  }
  let availableToSwitch = 0;
  for (let i = 0; i < PARTY_SIZE; ++i) {
    if (
      getMonData(runtime.gEnemyParty[i], MON_DATA_HP) === 0
      || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE
      || getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG
      || i === runtime.gBattlerPartyIndexes[battlerIn1]
      || i === runtime.gBattlerPartyIndexes[battlerIn2]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn1]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn2]
    ) {
      continue;
    }
    ++availableToSwitch;
  }
  if (!availableToSwitch) {
    return false;
  }
  if (
    ShouldSwitchIfPerishSong(runtime)
    || ShouldSwitchIfWonderGuard(runtime)
    || FindMonThatAbsorbsOpponentsMove(runtime)
    || ShouldSwitchIfNaturalCure(runtime)
  ) {
    return true;
  }
  if (HasSuperEffectiveMoveAgainstOpponents(runtime, false) || AreStatsRaised(runtime)) {
    return false;
  }
  if (
    FindMonWithFlagsAndSuperEffective(runtime, MOVE_RESULT_DOESNT_AFFECT_FOE, 2)
    || FindMonWithFlagsAndSuperEffective(runtime, MOVE_RESULT_NOT_VERY_EFFECTIVE, 3)
  ) {
    return true;
  }
  return false;
}

export function ModulateByTypeEffectiveness(
  runtime: BattleAiSwitchItemsRuntime,
  atkType: number,
  defType1: number,
  defType2: number,
  value: number
): number {
  let result = value;
  let i = 0;
  while ((runtime.gTypeEffectiveness[i]?.[0] ?? TYPE_ENDTABLE) !== TYPE_ENDTABLE) {
    const [effectAtkType, effectDefType, multiplier] = runtime.gTypeEffectiveness[i];
    if (effectAtkType === TYPE_FORESIGHT) {
      i += 1;
      continue;
    } else if (effectAtkType === atkType) {
      if (effectDefType === defType1) {
        result = Math.trunc((toU8(result) * multiplier) / 10);
      }
      if (effectDefType === defType2 && defType1 !== defType2) {
        result = Math.trunc((toU8(result) * multiplier) / 10);
      }
    }
    i += 1;
  }
  return toU8(result);
}

export function GetMostSuitableMonToSwitchInto(runtime: BattleAiSwitchItemsRuntime): number {
  if (runtime.gBattleStruct.monToSwitchIntoId[runtime.gActiveBattler] !== PARTY_SIZE) {
    return runtime.gBattleStruct.monToSwitchIntoId[runtime.gActiveBattler];
  }
  let opposingBattler: number;
  let battlerIn1: number;
  let battlerIn2: number;
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0) {
    battlerIn1 = runtime.gActiveBattler;
    if (
      (runtime.gAbsentBattlerFlags
        & runtime.gBitTable[getBattlerAtPosition(runtime, getBattlerPosition(runtime, runtime.gActiveBattler) ^ BIT_FLANK)]) !== 0
    ) {
      battlerIn2 = runtime.gActiveBattler;
    } else {
      battlerIn2 = getBattlerAtPosition(runtime, getBattlerPosition(runtime, runtime.gActiveBattler) ^ BIT_FLANK);
    }
    opposingBattler = random(runtime) & BIT_FLANK;
    if ((runtime.gAbsentBattlerFlags & runtime.gBitTable[opposingBattler]) !== 0) {
      opposingBattler ^= BIT_FLANK;
    }
  } else {
    opposingBattler = getBattlerAtPosition(runtime, B_POSITION_PLAYER_LEFT);
    battlerIn1 = runtime.gActiveBattler;
    battlerIn2 = runtime.gActiveBattler;
  }
  let invalidMons = 0;
  while (invalidMons !== 0x3f) {
    let bestDmg = 0;
    let bestMonId = PARTY_SIZE;
    for (let i = 0; i < PARTY_SIZE; ++i) {
      const species = getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES);
      if (
        species !== SPECIES_NONE
        && getMonData(runtime.gEnemyParty[i], MON_DATA_HP) !== 0
        && (runtime.gBitTable[i] & invalidMons) === 0
        && runtime.gBattlerPartyIndexes[battlerIn1] !== i
        && runtime.gBattlerPartyIndexes[battlerIn2] !== i
        && i !== runtime.gBattleStruct.monToSwitchIntoId[battlerIn1]
        && i !== runtime.gBattleStruct.monToSwitchIntoId[battlerIn2]
      ) {
        const type1 = runtime.gSpeciesInfo[species].types[0];
        const type2 = runtime.gSpeciesInfo[species].types[1];
        let typeDmg = 10;
        typeDmg = ModulateByTypeEffectiveness(runtime, runtime.gBattleMons[opposingBattler].type1 ?? TYPE_NORMAL, type1, type2, typeDmg);
        typeDmg = ModulateByTypeEffectiveness(runtime, runtime.gBattleMons[opposingBattler].type2 ?? TYPE_NORMAL, type1, type2, typeDmg);
        if (bestDmg < typeDmg) {
          bestDmg = typeDmg;
          bestMonId = i;
        }
      } else {
        invalidMons |= runtime.gBitTable[i];
      }
    }
    if (bestMonId !== PARTY_SIZE) {
      let i = 0;
      for (; i < MAX_MON_MOVES; ++i) {
        const move = getMonData(runtime.gEnemyParty[bestMonId], MON_DATA_MOVE1 + i);
        if (move !== MOVE_NONE && (typeCalc(runtime, move, runtime.gActiveBattler, opposingBattler) & MOVE_RESULT_SUPER_EFFECTIVE) !== 0) {
          break;
        }
      }
      if (i !== MAX_MON_MOVES) {
        return bestMonId;
      }
      invalidMons |= runtime.gBitTable[bestMonId];
    } else {
      invalidMons = 0x3f;
    }
  }
  runtime.gDynamicBasePower = 0;
  runtime.gBattleStruct.dynamicMoveType = 0;
  runtime.gBattleScripting.dmgMultiplier = 1;
  runtime.gMoveResultFlags = 0;
  runtime.gCritMultiplier = 1;
  let bestDmg = 0;
  let bestMonId = PARTY_SIZE;
  for (let i = 0; i < PARTY_SIZE; ++i) {
    if (
      getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES) === SPECIES_NONE
      || getMonData(runtime.gEnemyParty[i], MON_DATA_HP) === 0
      || runtime.gBattlerPartyIndexes[battlerIn1] === i
      || runtime.gBattlerPartyIndexes[battlerIn2] === i
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn1]
      || i === runtime.gBattleStruct.monToSwitchIntoId[battlerIn2]
    ) {
      continue;
    }
    for (let j = 0; j < MAX_MON_MOVES; ++j) {
      const move = getMonData(runtime.gEnemyParty[i], MON_DATA_MOVE1 + j);
      runtime.gBattleMoveDamage = 0;
      if (move !== MOVE_NONE && (runtime.gBattleMoves[move]?.power ?? 0) !== 1) {
        aiCalcDmg(runtime, runtime.gActiveBattler, opposingBattler);
        typeCalc(runtime, move, runtime.gActiveBattler, opposingBattler);
      }
      if (bestDmg < runtime.gBattleMoveDamage) {
        bestDmg = runtime.gBattleMoveDamage;
        bestMonId = i;
      }
    }
  }
  return bestMonId;
}

export function GetAI_ItemType(itemId: number, itemEffect: number[]): number {
  if (itemId === ITEM_FULL_RESTORE) {
    return AI_ITEM_FULL_RESTORE;
  } else if ((itemEffect[4] & ITEM4_HEAL_HP) !== 0) {
    return AI_ITEM_HEAL_HP;
  } else if ((itemEffect[3] & ITEM3_STATUS_ALL) !== 0) {
    return AI_ITEM_CURE_CONDITION;
  } else if (((itemEffect[0] & (ITEM0_DIRE_HIT | ITEM0_X_ATTACK)) !== 0 || itemEffect[1] !== 0 || itemEffect[2] !== 0)) {
    return AI_ITEM_X_STAT;
  } else if ((itemEffect[3] & ITEM3_GUARD_SPEC) !== 0) {
    return AI_ITEM_GUARD_SPECS;
  }
  return AI_ITEM_NOT_RECOGNIZABLE;
}

export const GetItemEffectParamOffset = (
  runtime: BattleAiSwitchItemsRuntime,
  itemId: number,
  effectByte: number,
  effectBit: number
): number => {
  let offset = ITEM_EFFECT_ARG_START;
  let temp = runtime.gItemEffectTable[itemId - ITEM_POTION] ?? null;
  if (!temp && itemId !== ITEM_ENIGMA_BERRY) {
    return 0;
  }
  if (itemId === ITEM_ENIGMA_BERRY) {
    temp = runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect;
  }
  const itemEffect = temp ?? [];
  let mutableEffectBit = effectBit;
  for (let i = 0; i < ITEM_EFFECT_ARG_START; i += 1) {
    switch (i) {
      case 0:
      case 1:
      case 2:
      case 3:
        if (i === effectByte) {
          return 0;
        }
        break;
      case 4: {
        let val = itemEffect[4] ?? 0;
        if ((val & ITEM4_PP_UP) !== 0) {
          val &= ~ITEM4_PP_UP;
        }
        let j = 0;
        while (val) {
          if ((val & 1) !== 0) {
            switch (j) {
              case 2:
                if ((val & (ITEM4_REVIVE >> 2)) !== 0) {
                  val &= ~(ITEM4_REVIVE >> 2);
                }
              // fallthrough
              case 0:
              case 1:
              case 3:
                if (i === effectByte && (val & mutableEffectBit) !== 0) {
                  return offset;
                }
                offset = toU8(offset + 1);
                break;
              case 7:
                if (i === effectByte) {
                  return 0;
                }
                break;
            }
          }
          j = toU8(j + 1);
          val >>= 1;
          if (i === effectByte) {
            mutableEffectBit >>= 1;
          }
        }
        break;
      }
      case 5: {
        let val = itemEffect[5] ?? 0;
        let j = 0;
        while (val) {
          if ((val & 1) !== 0) {
            switch (j) {
              case 0:
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
              case 6:
                if (i === effectByte && (val & mutableEffectBit) !== 0) {
                  return offset;
                }
                offset = toU8(offset + 1);
                break;
              case 7:
                if (i === effectByte) {
                  return 0;
                }
                break;
            }
          }
          j = toU8(j + 1);
          val >>= 1;
          if (i === effectByte) {
            mutableEffectBit >>= 1;
          }
        }
        break;
      }
    }
  }
  return offset;
};

export function ShouldUseItem(runtime: BattleAiSwitchItemsRuntime): boolean {
  let validMons = 0;
  let shouldUse = false;
  for (let i = 0; i < PARTY_SIZE; ++i) {
    if (
      getMonData(runtime.gEnemyParty[i], MON_DATA_HP) !== 0
      && getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE
      && getMonData(runtime.gEnemyParty[i], MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG
    ) {
      ++validMons;
    }
  }
  for (let i = 0; i < MAX_TRAINER_ITEMS; ++i) {
    if (i && validMons > runtime.gBattleResources.battleHistory.itemsNo - i + 1) {
      continue;
    }
    const item = runtime.gBattleResources.battleHistory.trainerItems[i];
    const tableEffect = runtime.gItemEffectTable[item - ITEM_POTION] ?? null;
    if (item === ITEM_NONE || tableEffect === null) {
      continue;
    }
    const itemEffects = item === ITEM_ENIGMA_BERRY ? runtime.gSaveBlock1Ptr.enigmaBerry.itemEffect : tableEffect;
    runtime.gBattleStruct.AI_itemType[Math.trunc(runtime.gActiveBattler / 2)] = GetAI_ItemType(item, itemEffects);
    switch (runtime.gBattleStruct.AI_itemType[Math.trunc(runtime.gActiveBattler / 2)]) {
      case AI_ITEM_FULL_RESTORE:
        if (runtime.gBattleMons[runtime.gActiveBattler].hp >= (runtime.gBattleMons[runtime.gActiveBattler].maxHP ?? 0) / 4) {
          break;
        }
        if (runtime.gBattleMons[runtime.gActiveBattler].hp === 0) {
          break;
        }
        shouldUse = true;
        break;
      case AI_ITEM_HEAL_HP: {
        const paramOffset = GetItemEffectParamOffset(runtime, item, 4, 4);
        if (paramOffset === 0 || runtime.gBattleMons[runtime.gActiveBattler].hp === 0) {
          break;
        }
        if (
          runtime.gBattleMons[runtime.gActiveBattler].hp < (runtime.gBattleMons[runtime.gActiveBattler].maxHP ?? 0) / 4
          || (runtime.gBattleMons[runtime.gActiveBattler].maxHP ?? 0) - runtime.gBattleMons[runtime.gActiveBattler].hp > (itemEffects[paramOffset] ?? 0)
        ) {
          shouldUse = true;
        }
        break;
      }
      case AI_ITEM_CURE_CONDITION:
        runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] = 0;
        if ((itemEffects[3] & ITEM3_SLEEP) !== 0 && ((runtime.gBattleMons[runtime.gActiveBattler].status1 ?? 0) & STATUS1_SLEEP) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x20;
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_POISON) !== 0 && (((runtime.gBattleMons[runtime.gActiveBattler].status1 ?? 0) & STATUS1_POISON) !== 0 || ((runtime.gBattleMons[runtime.gActiveBattler].status1 ?? 0) & STATUS1_TOXIC_POISON) !== 0)) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x10;
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_BURN) !== 0 && ((runtime.gBattleMons[runtime.gActiveBattler].status1 ?? 0) & STATUS1_BURN) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x8;
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_FREEZE) !== 0 && ((runtime.gBattleMons[runtime.gActiveBattler].status1 ?? 0) & STATUS1_FREEZE) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x4;
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_PARALYSIS) !== 0 && ((runtime.gBattleMons[runtime.gActiveBattler].status1 ?? 0) & STATUS1_PARALYSIS) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x2;
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_CONFUSION) !== 0 && ((runtime.gBattleMons[runtime.gActiveBattler].status2 ?? 0) & STATUS2_CONFUSION) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x1;
          shouldUse = true;
        }
        break;
      case AI_ITEM_X_STAT:
        runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] = 0;
        if (!runtime.gDisableStructs[runtime.gActiveBattler].isFirstTurn) {
          break;
        }
        if ((itemEffects[0] & ITEM0_X_ATTACK) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x1;
        }
        if ((itemEffects[1] & ITEM1_X_DEFEND) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x2;
        }
        if ((itemEffects[1] & ITEM1_X_SPEED) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x4;
        }
        if ((itemEffects[2] & ITEM2_X_SPATK) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x8;
        }
        if ((itemEffects[2] & ITEM2_X_ACCURACY) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x20;
        }
        if ((itemEffects[0] & ITEM0_DIRE_HIT) !== 0) {
          runtime.gBattleStruct.AI_itemFlags[Math.trunc(runtime.gActiveBattler / 2)] |= 0x80;
        }
        shouldUse = true;
        break;
      case AI_ITEM_GUARD_SPECS: {
        const battlerSide = getBattlerSide(runtime, runtime.gActiveBattler);
        if (runtime.gDisableStructs[runtime.gActiveBattler].isFirstTurn && runtime.gSideTimers[battlerSide].mistTimer === 0) {
          shouldUse = true;
        }
        break;
      }
      case AI_ITEM_NOT_RECOGNIZABLE:
        return false;
    }
    if (shouldUse) {
      emitTwoReturnValues(runtime, 1, B_ACTION_USE_ITEM, 0);
      runtime.gBattleStruct.chosenItem[Math.trunc(runtime.gActiveBattler / 2) * 2] = item;
      runtime.gBattleResources.battleHistory.trainerItems[i] = 0;
      return shouldUse;
    }
  }
  return false;
}

export function AI_TrySwitchOrUseItem(runtime: BattleAiSwitchItemsRuntime): void {
  if ((runtime.gBattleTypeFlags & BATTLE_TYPE_TRAINER) !== 0) {
    if (ShouldSwitch(runtime)) {
      if (runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] === 6) {
        let monToSwitchId = GetMostSuitableMonToSwitchInto(runtime);
        if (monToSwitchId === 6) {
          let battlerIn1: number;
          let battlerIn2: number;
          if ((runtime.gBattleTypeFlags & BATTLE_TYPE_DOUBLE) === 0) {
            battlerIn1 = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
            battlerIn2 = battlerIn1;
          } else {
            battlerIn1 = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_LEFT);
            battlerIn2 = getBattlerAtPosition(runtime, B_POSITION_OPPONENT_RIGHT);
          }
          for (monToSwitchId = 0; monToSwitchId < PARTY_SIZE; ++monToSwitchId) {
            if (
              !getMonData(runtime.gEnemyParty[monToSwitchId], MON_DATA_HP) === false
              && monToSwitchId !== runtime.gBattlerPartyIndexes[battlerIn1]
              && monToSwitchId !== runtime.gBattlerPartyIndexes[battlerIn2]
              && monToSwitchId !== runtime.gBattleStruct.monToSwitchIntoId[battlerIn1]
              && monToSwitchId !== runtime.gBattleStruct.monToSwitchIntoId[battlerIn2]
            ) {
              break;
            }
          }
        }
        runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1] = monToSwitchId;
      }
      runtime.gBattleStruct.monToSwitchIntoId[runtime.gActiveBattler] =
        runtime.gBattleStruct.AI_monToSwitchIntoId[getBattlerPosition(runtime, runtime.gActiveBattler) >> 1];
      return;
    } else if (ShouldUseItem(runtime)) {
      return;
    }
  }
  emitTwoReturnValues(runtime, 1, B_ACTION_USE_MOVE, (runtime.gActiveBattler ^ BIT_SIDE) << 8);
}
