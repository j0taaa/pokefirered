export const MAX_BATTLERS_COUNT = 4;
export const MAX_MON_MOVES = 4;
export const PARTY_SIZE = 6;
export const MULTI_PARTY_SIZE = 3;
export const BIT_SIDE = 1;
export const BIT_FLANK = 2;
export const B_SIDE_PLAYER = 0;
export const B_SIDE_OPPONENT = 1;
export const B_POSITION_PLAYER_LEFT = 0;
export const B_POSITION_OPPONENT_LEFT = 1;
export const B_POSITION_PLAYER_RIGHT = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;
export const BATTLE_TYPE_DOUBLE = 1 << 0;
export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_MULTI = 1 << 6;
export const BATTLE_TYPE_POKEDUDE = 1 << 16;
export const BS_TARGET = 0;
export const BS_ATTACKER = 1;
export const BS_EFFECT_BATTLER = 2;
export const BS_BATTLER_0 = 3;
export const BS_SCRIPTING = 4;
export const BS_FAINTED = 5;
export const BS_FAINTED_LINK_MULTIPLE_1 = 6;
export const BS_PLAYER1 = 7;
export const BS_OPPONENT1 = 8;
export const BS_ATTACKER_WITH_PARTNER = 9;
export const BS_FAINTED_LINK_MULTIPLE_2 = 10;
export const BS_ATTACKER_SIDE = 11;
export const BS_NOT_ATTACKER_SIDE = 12;
export const ABILITY_PRESSURE = 46;
export const ABILITY_FORECAST = 59;
export const ABILITY_LIGHTNING_ROD = 31;
export const MOVE_NONE = 0;
export const MOVE_STRUGGLE = 165;
export const MOVE_IMPRISON = 286;
export const MOVE_PERISH_SONG = 195;
export const MOVE_UNAVAILABLE = 0xffff;
export const MOVE_RAGE = 99;
export const MOVE_SNORE = 173;
export const MOVE_SLEEP_TALK = 214;
export const ITEM_ENIGMA_BERRY = 175;
export const HOLD_EFFECT_CHOICE_BAND = 31;
export const SPECIES_NONE = 0;
export const SPECIES_EGG = 412;
export const SPECIES_MEW = 151;
export const SPECIES_DEOXYS = 410;
export const SPECIES_CASTFORM = 351;
export const TYPE_NORMAL = 0;
export const TYPE_FIRE = 10;
export const TYPE_WATER = 11;
export const TYPE_ELECTRIC = 13;
export const TYPE_ICE = 15;
export const STATUS1_SLEEP = 0x7;
export const STATUS2_MULTIPLETURNS = 0x00000010;
export const STATUS2_LOCK_CONFUSE = 0x00000020;
export const STATUS2_UPROAR = 0x00000070;
export const STATUS2_BIDE = 0x00000300;
export const STATUS2_TORMENT = 0x20000000;
export const STATUS2_DESTINY_BOND = 0x04000000;
export const STATUS2_RAGE = 0x00000008;
export const STATUS3_SEMI_INVULNERABLE = 0x00000001;
export const STATUS3_IMPRISONED_OTHERS = 0x00000040;
export const STATUS3_GRUDGE = 0x00000080;
export const MOVE_LIMITATION_ZEROMOVE = 1 << 0;
export const MOVE_LIMITATION_PP = 1 << 1;
export const MOVE_LIMITATION_DISABLED = 1 << 2;
export const MOVE_LIMITATION_TORMENTED = 1 << 3;
export const MOVE_LIMITATION_TAUNT = 1 << 4;
export const MOVE_LIMITATION_IMPRISON = 1 << 5;
export const MOVE_LIMITATIONS_ALL = 0xff;
export const MOVE_TARGET_SELECTED = 0;
export const MOVE_TARGET_DEPENDS = 1;
export const MOVE_TARGET_USER = 2;
export const MOVE_TARGET_RANDOM = 4;
export const MOVE_TARGET_BOTH = 8;
export const MOVE_TARGET_USER_OR_SELECTED = 16;
export const MOVE_TARGET_FOES_AND_ALLY = 32;
export const MOVE_TARGET_OPPONENTS_FIELD = 64;
export const NO_TARGET_OVERRIDE = 0;
export const B_WEATHER_RAIN = 1;
export const B_WEATHER_SUN = 2;
export const B_WEATHER_HAIL = 4;
export const CASTFORM_NO_CHANGE = 0;
export const CASTFORM_TO_NORMAL = 1;
export const CASTFORM_TO_FIRE = 2;
export const CASTFORM_TO_WATER = 3;
export const CASTFORM_TO_ICE = 4;

export interface BattleUtilMon {
  ability: number;
  moves: number[];
  pp: number[];
  item: number;
  status1: number;
  status2: number;
  hp: number;
  species: number;
  speciesOrEgg: number;
  level: number;
  type1: number;
  type2: number;
  otId: number;
  otName: string;
  modernFatefulEncounter: boolean;
}

export interface DisableStruct {
  rolloutTimer: number;
  furyCutterCounter: number;
  disabledMove: number;
  tauntTimer: number;
  encoreTimer: number;
  encoredMove: number;
}

export interface ProtectStruct {
  prlzImmobility: boolean;
  targetNotAffected: boolean;
  usedImprisonedMove: boolean;
  loveImmobility: boolean;
  usedDisabledMove: boolean;
  usedTauntedMove: boolean;
  flag2Unknown: boolean;
  flinchImmobility: boolean;
  confusionSelfDmg: boolean;
  noValidMoves: boolean;
}

export interface BattleUtilRuntime {
  battleMons: BattleUtilMon[];
  playerParty: BattleUtilMon[];
  enemyParty: BattleUtilMon[];
  battlersCount: number;
  battlerPositions: number[];
  battlerPartyIndexes: number[];
  absentBattlerFlags: number;
  bitTable: number[];
  battleTypeFlags: number;
  battleControllerExecFlags: number;
  activeBattler: number;
  battlerTarget: number;
  battlerAttacker: number;
  effectBattler: number;
  battlerFainted: number;
  battleScriptingBattler: number;
  disableStructs: DisableStruct[];
  protectStructs: ProtectStruct[];
  statuses3: number[];
  sentPokesToOpponent: number[];
  battleScriptsStack: Array<string | number>;
  battlescriptCurrInstr: string | number;
  battleScriptingCommandsTable: Array<((runtime: BattleUtilRuntime) => void) | undefined>;
  selectionBattleScripts: string[];
  battleBufferB: number[][];
  currentMove: number;
  lastMoves: number[];
  battleMoves: Record<number, { power: number; target: number; type: number }>;
  battleStruct: { choicedMove: number[]; moveTarget: number[]; monToSwitchIntoId: number[] };
  enigmaBerries: { holdEffect: number }[];
  itemHoldEffects: Record<number, number>;
  potentialItemEffectBattler: number;
  lastUsedItem: number;
  sideTimers: Array<{ followmeTimer: number; followmeTarget: number }>;
  specialStatuses: Array<{ lightningRodRedirected: number }>;
  randomValues: number[];
  battleWeather: number;
  weatherHasEffect: boolean;
  flags: Record<string, boolean>;
  operations: string[];
}

const blankMon = (): BattleUtilMon => ({
  ability: 0,
  moves: [0, 0, 0, 0],
  pp: [0, 0, 0, 0],
  item: 0,
  status1: 0,
  status2: 0,
  hp: 1,
  species: 1,
  speciesOrEgg: 1,
  level: 5,
  type1: TYPE_NORMAL,
  type2: TYPE_NORMAL,
  otId: 0,
  otName: 'OT',
  modernFatefulEncounter: true
});

const blankDisable = (): DisableStruct => ({ rolloutTimer: 0, furyCutterCounter: 0, disabledMove: 0, tauntTimer: 0, encoreTimer: 0, encoredMove: 0 });
const blankProtect = (): ProtectStruct => ({
  prlzImmobility: false,
  targetNotAffected: false,
  usedImprisonedMove: false,
  loveImmobility: false,
  usedDisabledMove: false,
  usedTauntedMove: false,
  flag2Unknown: false,
  flinchImmobility: false,
  confusionSelfDmg: false,
  noValidMoves: false
});

export const createBattleUtilRuntime = (overrides: Partial<BattleUtilRuntime> = {}): BattleUtilRuntime => ({
  battleMons: Array.from({ length: MAX_BATTLERS_COUNT }, blankMon),
  playerParty: Array.from({ length: PARTY_SIZE }, blankMon),
  enemyParty: Array.from({ length: PARTY_SIZE }, blankMon),
  battlersCount: 4,
  battlerPositions: [B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT],
  battlerPartyIndexes: [0, 0, 1, 1],
  absentBattlerFlags: 0,
  bitTable: [1, 2, 4, 8, 16, 32],
  battleTypeFlags: 0,
  battleControllerExecFlags: 0,
  activeBattler: 0,
  battlerTarget: 1,
  battlerAttacker: 0,
  effectBattler: 0,
  battlerFainted: 0,
  battleScriptingBattler: 0,
  disableStructs: Array.from({ length: MAX_BATTLERS_COUNT }, blankDisable),
  protectStructs: Array.from({ length: MAX_BATTLERS_COUNT }, blankProtect),
  statuses3: [0, 0, 0, 0],
  sentPokesToOpponent: [0, 0],
  battleScriptsStack: [],
  battlescriptCurrInstr: '',
  battleScriptingCommandsTable: [],
  selectionBattleScripts: ['', '', '', ''],
  battleBufferB: Array.from({ length: MAX_BATTLERS_COUNT }, () => [0, 0, 0, 0]),
  currentMove: 0,
  lastMoves: [0, 0, 0, 0],
  battleMoves: {},
  battleStruct: { choicedMove: [0, 0, 0, 0], moveTarget: [0, 0, 0, 0], monToSwitchIntoId: [PARTY_SIZE, PARTY_SIZE, PARTY_SIZE, PARTY_SIZE] },
  enigmaBerries: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ holdEffect: 0 })),
  itemHoldEffects: {},
  potentialItemEffectBattler: 0,
  lastUsedItem: 0,
  sideTimers: [{ followmeTimer: 0, followmeTarget: 0 }, { followmeTimer: 0, followmeTarget: 1 }],
  specialStatuses: Array.from({ length: MAX_BATTLERS_COUNT }, () => ({ lightningRodRedirected: 0 })),
  randomValues: [0],
  battleWeather: 0,
  weatherHasEffect: true,
  flags: {},
  operations: [],
  ...overrides
});

const side = (runtime: BattleUtilRuntime, battler: number): number => runtime.battlerPositions[battler] & BIT_SIDE;
const position = (runtime: BattleUtilRuntime, battler: number): number => runtime.battlerPositions[battler];
const atPosition = (runtime: BattleUtilRuntime, pos: number): number => runtime.battlerPositions.indexOf(pos);
const random = (runtime: BattleUtilRuntime): number => runtime.randomValues.shift() ?? 0;
const holdEffect = (runtime: BattleUtilRuntime, battler: number): number =>
  runtime.battleMons[battler].item === ITEM_ENIGMA_BERRY ? runtime.enigmaBerries[battler].holdEffect : runtime.itemHoldEffects[runtime.battleMons[battler].item] ?? 0;
const isPermanentMove = (_runtime: BattleUtilRuntime, _battler: number, _moveIndex: number): boolean => true;
const emitSetMonData = (runtime: BattleUtilRuntime, battler: number, moveIndex: number): void => {
  runtime.operations.push(`BtlController_EmitSetMonData:${battler}:${moveIndex}:${runtime.battleMons[battler].pp[moveIndex]}`);
};

export const GetBattlerForBattleScript = (runtime: BattleUtilRuntime, caseId: number): number => {
  let ret = 0;
  switch (caseId) {
    case BS_TARGET: ret = runtime.battlerTarget; break;
    case BS_ATTACKER: ret = runtime.battlerAttacker; break;
    case BS_EFFECT_BATTLER: ret = runtime.effectBattler; break;
    case BS_BATTLER_0: ret = 0; break;
    case BS_SCRIPTING: ret = runtime.battleScriptingBattler; break;
    case BS_FAINTED:
    case BS_FAINTED_LINK_MULTIPLE_1: ret = runtime.battlerFainted; break;
    case BS_PLAYER1: ret = atPosition(runtime, B_POSITION_PLAYER_LEFT); break;
    case BS_OPPONENT1: ret = atPosition(runtime, B_POSITION_OPPONENT_LEFT); break;
  }
  return ret;
};

export const MarkAllBattlersForControllerExec = (runtime: BattleUtilRuntime): void => {
  for (let i = 0; i < runtime.battlersCount; i += 1)
    runtime.battleControllerExecFlags |= runtime.battleTypeFlags & BATTLE_TYPE_LINK ? runtime.bitTable[i] << (32 - MAX_BATTLERS_COUNT) : runtime.bitTable[i];
};

export const MarkBattlerForControllerExec = (runtime: BattleUtilRuntime, battlerId: number): void => {
  runtime.battleControllerExecFlags |= runtime.battleTypeFlags & BATTLE_TYPE_LINK ? runtime.bitTable[battlerId] << (32 - MAX_BATTLERS_COUNT) : runtime.bitTable[battlerId];
};

export const MarkBattlerReceivedLinkData = (runtime: BattleUtilRuntime, battlerId: number, linkPlayerCount = 2): void => {
  for (let i = 0; i < linkPlayerCount; i += 1)
    runtime.battleControllerExecFlags |= runtime.bitTable[battlerId] << (i << 2);
  runtime.battleControllerExecFlags &= ~((1 << 28) << battlerId);
};

export const PressurePPLose = (runtime: BattleUtilRuntime, target: number, attacker: number, move: number): void => {
  if (runtime.battleMons[target].ability !== ABILITY_PRESSURE)
    return;
  const moveIndex = runtime.battleMons[attacker].moves.indexOf(move);
  if (moveIndex === -1)
    return;
  if (runtime.battleMons[attacker].pp[moveIndex] !== 0)
    runtime.battleMons[attacker].pp[moveIndex]--;
  if (isPermanentMove(runtime, attacker, moveIndex)) {
    runtime.activeBattler = attacker;
    emitSetMonData(runtime, attacker, moveIndex);
    MarkBattlerForControllerExec(runtime, runtime.activeBattler);
  }
};

export const PressurePPLoseOnUsingImprison = (runtime: BattleUtilRuntime, attacker: number): void => {
  let imprisonPos = MAX_MON_MOVES;
  const atkSide = side(runtime, attacker);
  for (let i = 0; i < runtime.battlersCount; i += 1) {
    if (atkSide !== side(runtime, i) && runtime.battleMons[i].ability === ABILITY_PRESSURE) {
      const j = runtime.battleMons[attacker].moves.indexOf(MOVE_IMPRISON);
      if (j !== -1) {
        imprisonPos = j;
        if (runtime.battleMons[attacker].pp[j] !== 0)
          runtime.battleMons[attacker].pp[j]--;
      }
    }
  }
  if (imprisonPos !== MAX_MON_MOVES && isPermanentMove(runtime, attacker, imprisonPos)) {
    runtime.activeBattler = attacker;
    emitSetMonData(runtime, attacker, imprisonPos);
    MarkBattlerForControllerExec(runtime, runtime.activeBattler);
  }
};

export const PressurePPLoseOnUsingPerishSong = (runtime: BattleUtilRuntime, attacker: number): void => {
  let perishSongPos = MAX_MON_MOVES;
  for (let i = 0; i < runtime.battlersCount; i += 1) {
    if (runtime.battleMons[i].ability === ABILITY_PRESSURE && i !== attacker) {
      const j = runtime.battleMons[attacker].moves.indexOf(MOVE_PERISH_SONG);
      if (j !== -1) {
        perishSongPos = j;
        if (runtime.battleMons[attacker].pp[j] !== 0)
          runtime.battleMons[attacker].pp[j]--;
      }
    }
  }
  if (perishSongPos !== MAX_MON_MOVES && isPermanentMove(runtime, attacker, perishSongPos)) {
    runtime.activeBattler = attacker;
    emitSetMonData(runtime, attacker, perishSongPos);
    MarkBattlerForControllerExec(runtime, runtime.activeBattler);
  }
};

export const CancelMultiTurnMoves = (runtime: BattleUtilRuntime, battler: number): void => {
  runtime.battleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  runtime.battleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  runtime.battleMons[battler].status2 &= ~STATUS2_UPROAR;
  runtime.battleMons[battler].status2 &= ~STATUS2_BIDE;
  runtime.statuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  runtime.disableStructs[battler].rolloutTimer = 0;
  runtime.disableStructs[battler].furyCutterCounter = 0;
};

export const WasUnableToUseMove = (runtime: BattleUtilRuntime, battler: number): boolean => {
  const p = runtime.protectStructs[battler];
  return p.prlzImmobility || p.targetNotAffected || p.usedImprisonedMove || p.loveImmobility || p.usedDisabledMove || p.usedTauntedMove || p.flag2Unknown || p.flinchImmobility || p.confusionSelfDmg;
};

export const PrepareStringBattle = (runtime: BattleUtilRuntime, stringId: number, battler: number): void => {
  runtime.activeBattler = battler;
  runtime.operations.push(`BtlController_EmitPrintString:${stringId}`);
  MarkBattlerForControllerExec(runtime, runtime.activeBattler);
};

export const ResetSentPokesToOpponentValue = (runtime: BattleUtilRuntime): void => {
  let bits = 0;
  runtime.sentPokesToOpponent[0] = 0;
  runtime.sentPokesToOpponent[1] = 0;
  for (let i = 0; i < runtime.battlersCount; i += 2)
    bits |= runtime.bitTable[runtime.battlerPartyIndexes[i]];
  for (let i = 1; i < runtime.battlersCount; i += 2)
    runtime.sentPokesToOpponent[(i & BIT_FLANK) >> 1] = bits;
};

export const OpponentSwitchInResetSentPokesToOpponentValue = (runtime: BattleUtilRuntime, battler: number): void => {
  if (side(runtime, battler) === B_SIDE_OPPONENT) {
    const flank = (battler & BIT_FLANK) >> 1;
    let bits = 0;
    for (let i = 0; i < runtime.battlersCount; i += 2) {
      if (!(runtime.absentBattlerFlags & runtime.bitTable[i]))
        bits |= runtime.bitTable[runtime.battlerPartyIndexes[i]];
    }
    runtime.sentPokesToOpponent[flank] = bits;
  }
};

export const UpdateSentPokesToOpponentValue = (runtime: BattleUtilRuntime, battler: number): void => {
  if (side(runtime, battler) === B_SIDE_OPPONENT)
    OpponentSwitchInResetSentPokesToOpponentValue(runtime, battler);
  else {
    for (let i = 1; i < runtime.battlersCount; i += 1)
      runtime.sentPokesToOpponent[(i & BIT_FLANK) >> 1] |= runtime.bitTable[runtime.battlerPartyIndexes[battler]];
  }
};

export const BattleScriptPush = (runtime: BattleUtilRuntime, bsPtr: string): void => { runtime.battleScriptsStack.push(bsPtr); };
export const BattleScriptPushCursor = (runtime: BattleUtilRuntime): void => { runtime.battleScriptsStack.push(runtime.battlescriptCurrInstr); };
export const BattleScriptPop = (runtime: BattleUtilRuntime): void => { runtime.battlescriptCurrInstr = runtime.battleScriptsStack.pop() ?? ''; };

export const GetImprisonedMovesCount = (runtime: BattleUtilRuntime, battlerId: number, move: number): number => {
  let imprisonedMoves = 0;
  const battlerSide = side(runtime, battlerId);
  for (let i = 0; i < runtime.battlersCount; i += 1) {
    if (battlerSide !== side(runtime, i) && runtime.statuses3[i] & STATUS3_IMPRISONED_OTHERS && runtime.battleMons[i].moves.includes(move))
      imprisonedMoves++;
  }
  return imprisonedMoves;
};

export const TrySetCantSelectMoveBattleScript = (runtime: BattleUtilRuntime): number => {
  let limitations = 0;
  const moveIndex = runtime.battleBufferB[runtime.activeBattler][2];
  const move = runtime.battleMons[runtime.activeBattler].moves[moveIndex];
  if (runtime.disableStructs[runtime.activeBattler].disabledMove === move && move !== MOVE_NONE) {
    runtime.battleScriptingBattler = runtime.activeBattler;
    runtime.currentMove = move;
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_SelectingDisabledMove';
    limitations = 1;
  }
  if (move === runtime.lastMoves[runtime.activeBattler] && move !== MOVE_STRUGGLE && runtime.battleMons[runtime.activeBattler].status2 & STATUS2_TORMENT) {
    CancelMultiTurnMoves(runtime, runtime.activeBattler);
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_SelectingTormentedMove';
    limitations++;
  }
  if (runtime.disableStructs[runtime.activeBattler].tauntTimer !== 0 && (runtime.battleMoves[move]?.power ?? 0) === 0) {
    runtime.currentMove = move;
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_SelectingNotAllowedMoveTaunt';
    limitations++;
  }
  if (GetImprisonedMovesCount(runtime, runtime.activeBattler, move)) {
    runtime.currentMove = move;
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_SelectingImprisonedMove';
    limitations++;
  }
  runtime.potentialItemEffectBattler = runtime.activeBattler;
  const choice = runtime.battleStruct.choicedMove[runtime.activeBattler];
  if (holdEffect(runtime, runtime.activeBattler) === HOLD_EFFECT_CHOICE_BAND && choice !== MOVE_NONE && choice !== MOVE_UNAVAILABLE && choice !== move) {
    runtime.currentMove = choice;
    runtime.lastUsedItem = runtime.battleMons[runtime.activeBattler].item;
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_SelectingNotAllowedMoveChoiceItem';
    limitations++;
  }
  if (runtime.battleMons[runtime.activeBattler].pp[moveIndex] === 0) {
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_SelectingMoveWithNoPP';
    limitations++;
  }
  return limitations;
};

export const CheckMoveLimitations = (runtime: BattleUtilRuntime, battlerId: number, unusableMoves: number, check: number): number => {
  const choice = runtime.battleStruct.choicedMove[battlerId];
  const effect = holdEffect(runtime, battlerId);
  runtime.potentialItemEffectBattler = battlerId;
  for (let i = 0; i < MAX_MON_MOVES; i += 1) {
    const move = runtime.battleMons[battlerId].moves[i];
    if (move === MOVE_NONE && check & MOVE_LIMITATION_ZEROMOVE) unusableMoves |= runtime.bitTable[i];
    if (runtime.battleMons[battlerId].pp[i] === 0 && check & MOVE_LIMITATION_PP) unusableMoves |= runtime.bitTable[i];
    if (move === runtime.disableStructs[battlerId].disabledMove && check & MOVE_LIMITATION_DISABLED) unusableMoves |= runtime.bitTable[i];
    if (move === runtime.lastMoves[battlerId] && check & MOVE_LIMITATION_TORMENTED && runtime.battleMons[battlerId].status2 & STATUS2_TORMENT) unusableMoves |= runtime.bitTable[i];
    if (runtime.disableStructs[battlerId].tauntTimer && check & MOVE_LIMITATION_TAUNT && (runtime.battleMoves[move]?.power ?? 0) === 0) unusableMoves |= runtime.bitTable[i];
    if (GetImprisonedMovesCount(runtime, battlerId, move) && check & MOVE_LIMITATION_IMPRISON) unusableMoves |= runtime.bitTable[i];
    if (runtime.disableStructs[battlerId].encoreTimer && runtime.disableStructs[battlerId].encoredMove !== move) unusableMoves |= runtime.bitTable[i];
    if (effect === HOLD_EFFECT_CHOICE_BAND && choice !== MOVE_NONE && choice !== MOVE_UNAVAILABLE && choice !== move) unusableMoves |= runtime.bitTable[i];
  }
  return unusableMoves;
};

export const AreAllMovesUnusable = (runtime: BattleUtilRuntime): boolean => {
  const unusable = CheckMoveLimitations(runtime, runtime.activeBattler, 0, MOVE_LIMITATIONS_ALL);
  if (unusable === ((1 << MAX_MON_MOVES) - 1)) {
    runtime.protectStructs[runtime.activeBattler].noValidMoves = true;
    runtime.selectionBattleScripts[runtime.activeBattler] = 'BattleScript_NoMovesLeft';
  } else {
    runtime.protectStructs[runtime.activeBattler].noValidMoves = false;
  }
  return unusable === ((1 << MAX_MON_MOVES) - 1);
};

export const HandleAction_RunBattleScript = (runtime: BattleUtilRuntime): void => {
  if (runtime.battleControllerExecFlags === 0) {
    runtime.battleScriptingCommandsTable[Number(runtime.battlescriptCurrInstr)]?.(runtime);
  }
};

export const BattleScriptExecute = (runtime: BattleUtilRuntime, bsPtr: string): void => { runtime.battlescriptCurrInstr = bsPtr; };
export const BattleScriptPushCursorAndCallback = (runtime: BattleUtilRuntime, callback: string): void => { BattleScriptPushCursor(runtime); runtime.battlescriptCurrInstr = callback; };
export const DoFieldEndTurnEffects = (runtime: BattleUtilRuntime): number => { runtime.operations.push('DoFieldEndTurnEffects'); return 0; };
export const DoBattlerEndTurnEffects = (runtime: BattleUtilRuntime): number => { runtime.operations.push('DoBattlerEndTurnEffects'); return 0; };
export const HandleWishPerishSongOnTurnEnd = (runtime: BattleUtilRuntime): number => { runtime.operations.push('HandleWishPerishSongOnTurnEnd'); return 0; };
export const HandleFaintedMonActions = (runtime: BattleUtilRuntime): number => { runtime.operations.push('HandleFaintedMonActions'); return 0; };
export const TryClearRageStatuses = (runtime: BattleUtilRuntime): void => { runtime.operations.push('TryClearRageStatuses'); };
export const AtkCanceller_UnableToUseMove = (runtime: BattleUtilRuntime): number => { runtime.operations.push('AtkCanceller_UnableToUseMove'); return 0; };
export const AbilityBattleEffects = (runtime: BattleUtilRuntime, caseID: number, battler: number, ability: number, special: number, moveArg: number): number => { runtime.operations.push(`AbilityBattleEffects:${caseID}:${battler}:${ability}:${special}:${moveArg}`); return 0; };
export const ItemBattleEffects = (runtime: BattleUtilRuntime, caseID: number, battler: number, moveTurn: boolean): number => { runtime.operations.push(`ItemBattleEffects:${caseID}:${battler}:${moveTurn ? 1 : 0}`); return 0; };

export const HasNoMonsToSwitch = (runtime: BattleUtilRuntime, battler: number, partyIdBattlerOn1: number, partyIdBattlerOn2: number): boolean => {
  if (!(runtime.battleTypeFlags & BATTLE_TYPE_DOUBLE))
    return false;
  const party = side(runtime, battler) === B_SIDE_PLAYER ? runtime.playerParty : runtime.enemyParty;
  if (partyIdBattlerOn1 === PARTY_SIZE) partyIdBattlerOn1 = runtime.battlerPartyIndexes[atPosition(runtime, side(runtime, battler) === B_SIDE_PLAYER ? B_POSITION_PLAYER_LEFT : B_POSITION_OPPONENT_LEFT)];
  if (partyIdBattlerOn2 === PARTY_SIZE) partyIdBattlerOn2 = runtime.battlerPartyIndexes[atPosition(runtime, side(runtime, battler) === B_SIDE_PLAYER ? B_POSITION_PLAYER_RIGHT : B_POSITION_OPPONENT_RIGHT)];
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    if (party[i].hp !== 0 && party[i].speciesOrEgg !== SPECIES_NONE && party[i].speciesOrEgg !== SPECIES_EGG && i !== partyIdBattlerOn1 && i !== partyIdBattlerOn2)
      return false;
  }
  return true;
};

export const CastformDataTypeChange = (runtime: BattleUtilRuntime, battler: number): number => {
  const mon = runtime.battleMons[battler];
  let formChange = CASTFORM_NO_CHANGE;
  if (mon.species !== SPECIES_CASTFORM || mon.ability !== ABILITY_FORECAST || mon.hp === 0)
    return CASTFORM_NO_CHANGE;
  const isType = (type: number) => mon.type1 === type || mon.type2 === type;
  const setType = (type: number): void => { mon.type1 = type; mon.type2 = type; };
  if (!runtime.weatherHasEffect && !isType(TYPE_NORMAL)) { setType(TYPE_NORMAL); return CASTFORM_TO_NORMAL; }
  if (!runtime.weatherHasEffect) return CASTFORM_NO_CHANGE;
  if (!(runtime.battleWeather & (B_WEATHER_RAIN | B_WEATHER_SUN | B_WEATHER_HAIL)) && !isType(TYPE_NORMAL)) { setType(TYPE_NORMAL); formChange = CASTFORM_TO_NORMAL; }
  if (runtime.battleWeather & B_WEATHER_SUN && !isType(TYPE_FIRE)) { setType(TYPE_FIRE); formChange = CASTFORM_TO_FIRE; }
  if (runtime.battleWeather & B_WEATHER_RAIN && !isType(TYPE_WATER)) { setType(TYPE_WATER); formChange = CASTFORM_TO_WATER; }
  if (runtime.battleWeather & B_WEATHER_HAIL && !isType(TYPE_ICE)) { setType(TYPE_ICE); formChange = CASTFORM_TO_ICE; }
  return formChange;
};

export const ClearFuryCutterDestinyBondGrudge = (runtime: BattleUtilRuntime, battlerId: number): void => {
  runtime.disableStructs[battlerId].furyCutterCounter = 0;
  runtime.battleMons[battlerId].status2 &= ~STATUS2_DESTINY_BOND;
  runtime.statuses3[battlerId] &= ~STATUS3_GRUDGE;
};

export const GetMoveTarget = (runtime: BattleUtilRuntime, move: number, setTarget: number): number => {
  let targetBattler = 0;
  const moveTarget = setTarget !== NO_TARGET_OVERRIDE ? setTarget - 1 : runtime.battleMoves[move]?.target ?? MOVE_TARGET_SELECTED;
  let targetSide: number;
  switch (moveTarget) {
    case MOVE_TARGET_SELECTED:
      targetSide = side(runtime, runtime.battlerAttacker) ^ BIT_SIDE;
      if (runtime.sideTimers[targetSide].followmeTimer && runtime.battleMons[runtime.sideTimers[targetSide].followmeTarget].hp)
        targetBattler = runtime.sideTimers[targetSide].followmeTarget;
      else {
        const attackerSide = side(runtime, runtime.battlerAttacker);
        do {
          targetBattler = random(runtime) % runtime.battlersCount;
        } while (targetBattler === runtime.battlerAttacker || attackerSide === side(runtime, targetBattler) || runtime.absentBattlerFlags & runtime.bitTable[targetBattler]);
      }
      break;
    case MOVE_TARGET_DEPENDS:
    case MOVE_TARGET_BOTH:
    case MOVE_TARGET_FOES_AND_ALLY:
    case MOVE_TARGET_OPPONENTS_FIELD:
      targetBattler = atPosition(runtime, (position(runtime, runtime.battlerAttacker) & BIT_SIDE) ^ BIT_SIDE);
      if (runtime.absentBattlerFlags & runtime.bitTable[targetBattler]) targetBattler ^= BIT_FLANK;
      break;
    case MOVE_TARGET_RANDOM:
      targetSide = side(runtime, runtime.battlerAttacker) ^ BIT_SIDE;
      if (runtime.sideTimers[targetSide].followmeTimer && runtime.battleMons[runtime.sideTimers[targetSide].followmeTarget].hp)
        targetBattler = runtime.sideTimers[targetSide].followmeTarget;
      else
        targetBattler = atPosition(runtime, (position(runtime, runtime.battlerAttacker) & BIT_SIDE) ^ BIT_SIDE);
      break;
    case MOVE_TARGET_USER_OR_SELECTED:
    case MOVE_TARGET_USER:
      targetBattler = runtime.battlerAttacker;
      break;
  }
  runtime.battleStruct.moveTarget[runtime.battlerAttacker] = targetBattler;
  return targetBattler;
};

export const IsBattlerModernFatefulEncounter = (runtime: BattleUtilRuntime, battlerId: number): boolean => {
  if (side(runtime, battlerId) === B_SIDE_OPPONENT)
    return true;
  const mon = runtime.playerParty[runtime.battlerPartyIndexes[battlerId]];
  if (mon.species !== SPECIES_DEOXYS && mon.species !== SPECIES_MEW)
    return true;
  return mon.modernFatefulEncounter;
};

export const IsMonDisobedient = (runtime: BattleUtilRuntime): number => {
  if (runtime.battleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_POKEDUDE)) return 0;
  if (side(runtime, runtime.battlerAttacker) === B_SIDE_OPPONENT) return 0;
  if (IsBattlerModernFatefulEncounter(runtime, runtime.battlerAttacker) && runtime.flags.ownTrainer) return 0;
  const rnd = random(runtime) & 255;
  const obedienceLevel = runtime.flags.FLAG_BADGE08_GET ? 100 : runtime.flags.FLAG_BADGE06_GET ? 70 : runtime.flags.FLAG_BADGE04_GET ? 50 : runtime.flags.FLAG_BADGE02_GET ? 30 : 10;
  if (runtime.battleMons[runtime.battlerAttacker].level <= obedienceLevel) return 0;
  if (((runtime.battleMons[runtime.battlerAttacker].level + obedienceLevel) * rnd >> 8) < obedienceLevel) return 0;
  if (runtime.currentMove === MOVE_RAGE) runtime.battleMons[runtime.battlerAttacker].status2 &= ~STATUS2_RAGE;
  if (runtime.battleMons[runtime.battlerAttacker].status1 & STATUS1_SLEEP && (runtime.currentMove === MOVE_SNORE || runtime.currentMove === MOVE_SLEEP_TALK)) {
    runtime.battlescriptCurrInstr = 'BattleScript_IgnoresWhileAsleep';
    return 1;
  }
  runtime.operations.push('IsMonDisobedient:notObedient');
  return 1;
};
