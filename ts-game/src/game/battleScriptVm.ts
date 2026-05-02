import type {
  BattleControllerCommand,
  BattleEncounterState,
  BattleMove,
  BattlePokemonSnapshot,
  PokemonType,
  BattleBattlerId,
  BattleSideId,
  BattleState,
  StatusCondition
} from './battle';
import {
  getDecompBattleScript,
  getNextDecompBattleScriptLabel,
  type DecompBattleScriptInstruction
} from './decompBattleScripts';

export type BattleVmLocalValue = string | number | boolean | null;

export interface BattleVmStackFrame {
  label: string;
  pc: number;
}

export interface BattleVmState {
  currentLabel: string | null;
  pc: number;
  callStack: BattleVmStackFrame[];
  locals: Record<string, BattleVmLocalValue>;
  pendingCommands: BattleControllerCommand[];
  pendingMessages: string[];
}

export interface BattleScriptVmStepOptions {
  shouldTakeBranch?: (
    battle: BattleState,
    instruction: DecompBattleScriptInstruction
  ) => boolean | null | undefined;
}

export interface BattleScriptVmStepResult {
  completed: boolean;
  instruction: DecompBattleScriptInstruction | null;
  label: string | null;
  pc: number;
}

export interface BattlePostResult {
  outcome: 'none' | 'won' | 'lost' | 'caught' | 'escaped';
  payouts: number;
  losses: number;
  payDayTotal: number;
  levelUps: Array<{
    side: BattleSideId;
    species: string;
    level: number;
  }>;
  pendingMoveLearn: boolean;
  pendingEvolution: boolean;
  caughtSpecies: string | null;
  caughtPokemon: {
    species: string;
    level: number;
  } | null;
  pendingMoveLearns: Array<{
    species: string;
    level: number;
    moveId: string;
    moveName: string;
  }>;
  pendingEvolutions: Array<{
    species: string;
    evolvesTo: string;
    level: number;
  }>;
  blackout: boolean;
  whiteout: boolean;
}

export interface BattleMoveVmPreludeOptions {
  consumePp?: boolean;
  announce?: boolean;
  sleepTalk?: boolean;
  preserveLastMoveUsed?: boolean;
  attackerBattlerId?: BattleBattlerId;
  defenderBattlerId?: BattleBattlerId;
}

export interface BattleMoveVmPreludeResult {
  shouldContinue: boolean;
  moveWasAttempted: boolean;
  resultingMoveHandledByCalledMove: boolean;
  previousLastMoveUsedId: string | null;
}

export interface BattleMoveVmPreludeCallbacks {
  canMoveThisTurn: () => boolean;
  emitCommand: (command: BattleControllerCommand) => void;
  pushMessage: (text: string) => void;
  getActorLabel: () => string;
}

export const getBattleScriptCommandPlan = (label: string, maxSteps = 256): string[] => {
  const plan: string[] = [];
  let currentLabel: string | null = label;
  let pc = 0;
  let steps = 0;
  const callStack: BattleVmStackFrame[] = [];
  const visited = new Set<string>();

  while (currentLabel && steps < maxSteps) {
    steps += 1;
    const script = getDecompBattleScript(currentLabel);
    if (!script) {
      plan.push(`missing:${currentLabel}`);
      break;
    }

    if (pc >= script.instructions.length) {
      const frame = callStack.pop();
      if (!frame) {
        const nextLabel = getNextDecompBattleScriptLabel(currentLabel);
        if (!nextLabel) {
          break;
        }
        currentLabel = nextLabel;
        pc = 0;
        continue;
      }
      currentLabel = frame.label;
      pc = frame.pc;
      continue;
    }

    const instruction = script.instructions[pc]!;
    const visitKey = `${currentLabel}:${pc}:${callStack.length}`;
    if (visited.has(visitKey)) {
      plan.push(`loop:${currentLabel}`);
      break;
    }
    visited.add(visitKey);

    plan.push(instruction.opcode);
    if (instruction.opcode === 'goto') {
      currentLabel = instruction.args[0] ?? null;
      pc = 0;
      continue;
    }
    if (instruction.opcode === 'call') {
      callStack.push({ label: currentLabel, pc: pc + 1 });
      currentLabel = instruction.args[0] ?? null;
      pc = 0;
      continue;
    }
    if (instruction.opcode === 'return') {
      const frame = callStack.pop();
      if (!frame) {
        break;
      }
      currentLabel = frame.label;
      pc = frame.pc;
      continue;
    }
    if (instruction.opcode === 'end' || instruction.opcode === 'end2' || instruction.opcode === 'end3' || instruction.opcode === 'endselectionscript' || instruction.opcode === 'finishaction') {
      break;
    }

    pc += 1;
  }

  return plan;
};

const getExecutedScriptCommands = (battle: BattleState): string[] =>
  typeof battle.vm.locals.executedScriptCommands === 'string'
    ? battle.vm.locals.executedScriptCommands.split(',').filter(Boolean)
    : [];

const recordScriptCommand = (battle: BattleState, opcode: string): void => {
  const executed = getExecutedScriptCommands(battle);
  executed.push(opcode);
  battle.vm.locals.executedScriptCommands = executed.join(',');
};

const getScriptCommandPlan = (battle: BattleState): string[] =>
  typeof battle.vm.locals.scriptCommandPlan === 'string'
    ? battle.vm.locals.scriptCommandPlan.split(',').filter(Boolean)
    : [];

const isAttackStringAfterAccuracy = (battle: BattleState): boolean => {
  const plan = getScriptCommandPlan(battle);
  const accuracyIndex = plan.indexOf('accuracycheck');
  const attackStringIndex = plan.indexOf('attackstring');
  return accuracyIndex >= 0 && attackStringIndex >= 0 && accuracyIndex < attackStringIndex;
};

const getPrimaryBattlerIdForSide = (side: BattleSideId): BattleBattlerId =>
  side === 'player' ? 0 : 1;

const patchBattlerMoveMemory = (
  battle: BattleState,
  battlerId: BattleBattlerId,
  patch: Partial<BattleState['moveMemory'][BattleBattlerId]>
): void => {
  Object.assign(battle.moveMemory[battlerId], patch);
};

const stripBattleConstantPrefix = (value: string, prefix: string): string =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

const normalizeMoveConstant = (value: string): string =>
  stripBattleConstantPrefix(value, 'MOVE_');

const normalizeTypeConstant = (value: string): PokemonType =>
  stripBattleConstantPrefix(value, 'TYPE_').toLowerCase() as PokemonType;

const normalizeAbilityConstant = (value: string): string =>
  stripBattleConstantPrefix(value, 'ABILITY_');

const getRuntimeBattlerByScriptArg = (
  runtime: BattleScriptCommandRuntime,
  arg: string
): BattlePokemonSnapshot | null => {
  const tokens = arg.split('|').map((token) => token.trim());
  if (tokens.includes('BS_ATTACKER') || tokens.includes('BS_EFFECT_BATTLER') || tokens.includes('BS_SCRIPTING')) {
    return runtime.attacker ?? null;
  }
  if (tokens.includes('BS_TARGET') || tokens.includes('BS_FAINTED')) {
    return runtime.defender ?? null;
  }
  switch (arg) {
    case 'BS_ATTACKER':
    case 'BS_EFFECT_BATTLER':
    case 'BS_SCRIPTING':
      return runtime.attacker ?? null;
    case 'BS_TARGET':
    case 'BS_FAINTED':
      return runtime.defender ?? null;
    default:
      return null;
  }
};

const getRuntimeSideByScriptArg = (
  runtime: BattleScriptCommandRuntime,
  arg: string
): BattleSideId | null => {
  const tokens = arg.split('|').map((token) => token.trim());
  if (tokens.includes('BS_ATTACKER') || tokens.includes('BS_EFFECT_BATTLER') || tokens.includes('BS_SCRIPTING')) {
    return runtime.attackerSide ?? null;
  }
  if (tokens.includes('BS_TARGET') || tokens.includes('BS_FAINTED')) {
    return runtime.attackerSide === 'player' ? 'opponent' : runtime.attackerSide === 'opponent' ? 'player' : null;
  }
  switch (arg) {
    case 'BS_ATTACKER':
    case 'BS_EFFECT_BATTLER':
    case 'BS_SCRIPTING':
      return runtime.attackerSide ?? null;
    case 'BS_TARGET':
    case 'BS_FAINTED':
      return runtime.attackerSide === 'player' ? 'opponent' : runtime.attackerSide === 'opponent' ? 'player' : null;
    default:
      return null;
  }
};

const matchesBattleScriptStatus1Token = (pokemon: BattlePokemonSnapshot, token: string): boolean => {
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

const matchesBattleScriptStatus1 = (pokemon: BattlePokemonSnapshot, expression: string): boolean =>
  expression.split('|').map((token) => token.trim()).some((token) => matchesBattleScriptStatus1Token(pokemon, token));

const matchesBattleScriptStatus2 = (pokemon: BattlePokemonSnapshot, token: string): boolean => {
  switch (token) {
    case 'STATUS2_CONFUSION':
      return pokemon.volatile.confusionTurns > 0;
    case 'STATUS2_SUBSTITUTE':
      return pokemon.volatile.substituteHp > 0;
    case 'STATUS2_FOCUS_ENERGY':
      return pokemon.volatile.focusEnergy;
    case 'STATUS2_INFATUATION':
      return pokemon.volatile.infatuatedBy !== null;
    case 'STATUS2_ESCAPE_PREVENTION':
      return pokemon.volatile.escapePreventedBy !== null;
    case 'STATUS2_NIGHTMARE':
      return pokemon.volatile.nightmare;
    case 'STATUS2_TORMENT':
      return pokemon.volatile.tormented;
    case 'STATUS2_MULTIPLETURNS':
      return Boolean(
        pokemon.volatile.rampageMoveId
        || pokemon.volatile.uproarMoveId
        || pokemon.volatile.chargingMoveId
        || (pokemon.volatile.bideMoveId && pokemon.volatile.bideTurns > 0)
      );
    default:
      return false;
  }
};

const matchesBattleScriptStatus3 = (pokemon: BattlePokemonSnapshot, token: string): boolean => {
  switch (token) {
    case 'STATUS3_ON_AIR':
      return pokemon.volatile.semiInvulnerable === 'air';
    case 'STATUS3_UNDERGROUND':
      return pokemon.volatile.semiInvulnerable === 'underground';
    case 'STATUS3_UNDERWATER':
      return pokemon.volatile.semiInvulnerable === 'underwater';
    case 'STATUS3_ROOTED':
      return pokemon.volatile.rooted;
    case 'STATUS3_LEECHSEED':
      return pokemon.volatile.leechSeededBy !== null;
    case 'STATUS3_PERISH_SONG':
      return pokemon.volatile.perishTurns > 0;
    case 'STATUS3_IMPRISONED_OTHERS':
      return pokemon.volatile.imprisoning;
    default:
      return false;
  }
};

const matchesBattleScriptSideStatus = (battle: BattleState, side: BattleSideId, token: string): boolean => {
  const sideState = battle.sideState[side];
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

const parseBattleVmNumber = (value: string | number | boolean | null | undefined): number | null => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value !== 'string') {
    return null;
  }
  if (value === 'MAX_STAT_STAGE') {
    return 6;
  }
  if (value === 'MIN_STAT_STAGE') {
    return -6;
  }
  if (value === 'TRUE') {
    return 1;
  }
  if (value === 'FALSE') {
    return 0;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getBattleVmComparableValue = (
  battle: BattleState,
  key: string
): BattleVmLocalValue => {
  if (key === 'gBattleWeather') {
    switch (battle.weather) {
      case 'sun':
        return 'B_WEATHER_SUN';
      case 'rain':
        return 'B_WEATHER_RAIN';
      case 'sandstorm':
        return 'B_WEATHER_SANDSTORM';
      case 'hail':
        return 'B_WEATHER_HAIL';
      default:
        return 0;
    }
  }
  if (key in battle.vm.locals) {
    return battle.vm.locals[key] ?? null;
  }
  if (key === 'gBattlerAttacker') {
    return 0;
  }
  if (key === 'gBattlerTarget') {
    return 1;
  }
  if (key === 'gBattlersCount') {
    return battle.battlers.filter((battler) => battler.active && !battler.absent).length;
  }
  return null;
};

const compareBattleVmValues = (
  comparison: string,
  left: BattleVmLocalValue,
  right: string
): boolean | null => {
  const leftNumber = parseBattleVmNumber(left);
  const rightNumber = parseBattleVmNumber(right);
  const hasNumbers = leftNumber !== null && rightNumber !== null;
  switch (comparison) {
    case 'CMP_EQUAL':
      return hasNumbers ? leftNumber === rightNumber : String(left) === right;
    case 'CMP_NOT_EQUAL':
      return hasNumbers ? leftNumber !== rightNumber : String(left) !== right;
    case 'CMP_LESS_THAN':
      return hasNumbers ? leftNumber < rightNumber : null;
    case 'CMP_GREATER_THAN':
      return hasNumbers ? leftNumber > rightNumber : null;
    case 'CMP_COMMON_BITS':
      return hasNumbers ? (leftNumber & rightNumber) !== 0 : String(left).split('|').map((entry) => entry.trim()).includes(right);
    case 'CMP_NO_COMMON_BITS':
      return hasNumbers ? (leftNumber & rightNumber) === 0 : !String(left).split('|').map((entry) => entry.trim()).includes(right);
    default:
      return null;
  }
};

const parseBattleScriptLiteral = (value: string | undefined): BattleVmLocalValue => {
  if (value === undefined) {
    return null;
  }
  if (value === 'TRUE') {
    return true;
  }
  if (value === 'FALSE') {
    return false;
  }
  const parsed = parseBattleVmNumber(value);
  return parsed === null ? value : parsed;
};

const statStageKeyByConstant: Record<string, keyof BattlePokemonSnapshot['statStages']> = {
  STAT_ATK: 'attack',
  STAT_DEF: 'defense',
  STAT_SPEED: 'speed',
  STAT_SPATK: 'spAttack',
  STAT_SPDEF: 'spDefense',
  STAT_ACC: 'accuracy',
  STAT_EVASION: 'evasion'
};

const stageEffectRuntimeByMoveEffect: Partial<Record<string, {
  target: 'self' | 'target';
  stat: keyof BattlePokemonSnapshot['statStages'];
  delta: number;
}>> = {
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
  EFFECT_SPECIAL_DEFENSE_DOWN_2: { target: 'target', stat: 'spDefense', delta: -2 },
  EFFECT_ACCURACY_DOWN_2: { target: 'target', stat: 'accuracy', delta: -2 },
  EFFECT_EVASION_DOWN_2: { target: 'target', stat: 'evasion', delta: -2 },
  EFFECT_TICKLE: { target: 'target', stat: 'attack', delta: -1 }
};

export const normalizeBattleTypeConstant = (value: string): string =>
  stripBattleConstantPrefix(value, 'BATTLE_TYPE_');

export const hasBattleTypeFlag = (battle: BattleState, flag: string): boolean => {
  switch (normalizeBattleTypeConstant(flag)) {
    case 'TRAINER':
      return battle.mode === 'trainer' || battle.battleTypeFlags.includes('trainer');
    case 'SAFARI':
      return battle.mode === 'safari' || battle.battleTypeFlags.includes('safari');
    case 'GHOST':
      return battle.mode === 'ghost' || battle.battleTypeFlags.includes('ghost');
    case 'OLD_MAN_TUTORIAL':
      return battle.mode === 'oldManTutorial' || battle.battleTypeFlags.includes('oldManTutorial');
    case 'POKEDUDE':
      return battle.mode === 'pokedude' || battle.battleTypeFlags.includes('pokedude');
    case 'DOUBLE':
      return battle.format === 'doubles';
    case 'LINK':
      return battle.controlMode === 'link';
    case 'MULTI':
      return battle.controlMode === 'partner';
    default:
      return false;
  }
};

export const getBattlerStatStageByScriptArg = (
  runtime: BattleScriptCommandRuntime,
  battlerArg: string,
  statArg: string
): number | null => {
  const battler = getRuntimeBattlerByScriptArg(runtime, battlerArg);
  const stat = statStageKeyByConstant[statArg];
  return battler && stat ? battler.statStages[stat] : null;
};

const isSleepBlockedForBattleScript = (battle: BattleState, runtime: BattleScriptCommandRuntime): boolean | null => {
  const target = runtime.defender ?? null;
  if (!target) {
    return null;
  }
  return target.status !== 'none'
    || target.abilityId === 'INSOMNIA'
    || target.abilityId === 'VITAL_SPIRIT'
    || getActiveBattlePokemon(battle).some((pokemon) => pokemon.volatile.uproarTurns > 0);
};

const getActiveBattlePokemon = (battle: BattleState): BattlePokemonSnapshot[] => {
  const snapshots: BattlePokemonSnapshot[] = [];
  const seen = new Set<BattlePokemonSnapshot>();
  for (const battler of battle.battlers) {
    if (!battler.active || battler.absent || battler.partyIndex === null) {
      continue;
    }
    const party = battler.side === 'player'
      ? battle.playerSide.party
      : battle.opponentSide.party;
    const pokemon = party[battler.partyIndex];
    if (pokemon && !seen.has(pokemon)) {
      seen.add(pokemon);
      snapshots.push(pokemon);
    }
  }
  return snapshots;
};

const isSwitchBlockedForBattleScript = (
  runtime: BattleScriptCommandRuntime,
  battlerArg: string
): boolean | null => {
  const battler = getRuntimeBattlerByScriptArg(runtime, battlerArg);
  if (!battler) {
    return null;
  }
  return battler.volatile.rooted
    || battler.volatile.escapePreventedBy !== null
    || battler.volatile.trapTurns > 0
    || battler.volatile.trappedBy !== null;
};

const combineBattleScriptFlags = (
  current: BattleVmLocalValue,
  value: string | undefined
): BattleVmLocalValue => {
  if (!value) {
    return current ?? null;
  }
  const currentNumber = parseBattleVmNumber(current);
  const valueNumber = parseBattleVmNumber(value);
  if (currentNumber !== null && valueNumber !== null) {
    return currentNumber | valueNumber;
  }
  const entries = new Set(
    String(current ?? '')
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
  for (const entry of value.split('|').map((part) => part.trim()).filter(Boolean)) {
    entries.add(entry);
  }
  return [...entries].join('|') || null;
};

const removeBattleScriptFlags = (
  current: BattleVmLocalValue,
  value: string | undefined
): BattleVmLocalValue => {
  const currentNumber = parseBattleVmNumber(current);
  const valueNumber = parseBattleVmNumber(value);
  if (currentNumber !== null && valueNumber !== null) {
    return currentNumber & ~valueNumber;
  }
  const toRemove = new Set((value ?? '').split('|').map((entry) => entry.trim()).filter(Boolean));
  return String(current ?? '')
    .split('|')
    .map((entry) => entry.trim())
    .filter((entry) => entry && !toRemove.has(entry))
    .join('|') || null;
};

const appendBattleVmLocalList = (
  battle: BattleState,
  key: string,
  value: string
): void => {
  const entries = typeof battle.vm.locals[key] === 'string'
    ? String(battle.vm.locals[key]).split(',').filter(Boolean)
    : [];
  entries.push(value);
  battle.vm.locals[key] = entries.join(',');
};

const copyBattleVmLocal = (
  battle: BattleState,
  destination: string | undefined,
  source: string | undefined
): void => {
  if (!destination) {
    return;
  }
  battle.vm.locals[destination] = source ? getBattleVmComparableValue(battle, source) : null;
};

const addBattleVmLocal = (
  battle: BattleState,
  destination: string | undefined,
  amount: string | undefined
): void => {
  if (!destination) {
    return;
  }
  const current = parseBattleVmNumber(battle.vm.locals[destination] ?? 0) ?? 0;
  const delta = parseBattleVmNumber(amount) ?? 0;
  battle.vm.locals[destination] = current + delta;
};

const normalizeBattleScriptTargetArg = (value: string | undefined): string =>
  value ?? '';

const recordBattleScriptStateCommand = (
  battle: BattleState,
  instruction: DecompBattleScriptInstruction
): void => {
  const argSuffix = instruction.args.length > 0 ? `:${instruction.args.join(':')}` : '';
  battle.vm.locals.lastStateCommand = instruction.opcode;
  battle.vm.locals.lastStateCommandArgs = instruction.args.join(',');
  appendBattleVmLocalList(battle, 'stateScriptCommands', `${instruction.opcode}${argSuffix}`);
};

const applyPassiveBattleScriptInstruction = (
  battle: BattleState,
  instruction: DecompBattleScriptInstruction
): void => {
  switch (instruction.opcode) {
    case 'goto':
    case 'call':
    case 'return':
    case 'end':
    case 'end2':
    case 'end3':
    case 'endlinkbattle':
    case 'endselectionscript':
    case 'finishaction':
    case 'finishturn':
    case 'nop':
      battle.vm.locals.lastControlCommand = instruction.opcode;
      break;
    case 'setbyte':
    case 'setword':
    case 'sethalfword':
    case 'sethword':
      battle.vm.locals[instruction.args[0] ?? ''] = parseBattleScriptLiteral(instruction.args[1]);
      break;
    case 'orbyte':
    case 'orword':
    case 'orhalfword': {
      const key = instruction.args[0] ?? '';
      battle.vm.locals[key] = combineBattleScriptFlags(battle.vm.locals[key] ?? null, instruction.args[1]);
      break;
    }
    case 'bicbyte':
    case 'bicword':
    case 'bichalfword': {
      const key = instruction.args[0] ?? '';
      battle.vm.locals[key] = removeBattleScriptFlags(battle.vm.locals[key] ?? null, instruction.args[1]);
      break;
    }
    case 'setstatchanger':
      battle.vm.locals.statChangerStat = instruction.args[0] ?? null;
      battle.vm.locals.statChangerAmount = parseBattleScriptLiteral(instruction.args[1]);
      battle.vm.locals.statChangerDown = parseBattleScriptLiteral(instruction.args[2]);
      break;
    case 'copybyte':
    case 'copyword':
    case 'copyhalfword':
    case 'copyhword':
      copyBattleVmLocal(battle, instruction.args[0], instruction.args[1]);
      break;
    case 'addbyte':
    case 'addword':
    case 'addhalfword':
      addBattleVmLocal(battle, instruction.args[0], instruction.args[1]);
      break;
    case 'attackanimation':
      battle.vm.locals.lastAnimationCommand = 'attackanimation';
      appendBattleVmLocalList(battle, 'controllerScriptCommands', instruction.opcode);
      break;
    case 'waitanimation':
    case 'waitstate':
      battle.vm.locals.lastWaitCommand = instruction.opcode;
      appendBattleVmLocalList(battle, 'controllerScriptCommands', instruction.opcode);
      break;
    case 'waitmessage':
      battle.vm.locals.lastWaitMessageDuration = parseBattleScriptLiteral(instruction.args[0]);
      appendBattleVmLocalList(battle, 'controllerScriptCommands', instruction.opcode);
      break;
    case 'pause':
      battle.vm.locals.lastPauseDuration = parseBattleScriptLiteral(instruction.args[0]);
      appendBattleVmLocalList(battle, 'controllerScriptCommands', instruction.opcode);
      break;
    case 'effectivenesssound':
      battle.vm.locals.lastSoundCommand = 'effectivenesssound';
      appendBattleVmLocalList(battle, 'controllerScriptCommands', instruction.opcode);
      break;
    case 'playse':
      battle.vm.locals.lastSoundEffect = instruction.args[0] ?? null;
      appendBattleVmLocalList(battle, 'controllerScriptCommands', `${instruction.opcode}:${instruction.args[0] ?? ''}`);
      break;
    case 'hitanimation':
    case 'statusanimation':
    case 'status2animation':
      battle.vm.locals.lastAnimationCommand = instruction.opcode;
      battle.vm.locals.lastAnimationBattler = normalizeBattleScriptTargetArg(instruction.args[0]);
      appendBattleVmLocalList(battle, 'controllerScriptCommands', `${instruction.opcode}:${instruction.args[0] ?? ''}`);
      break;
    case 'playanimation':
    case 'playanimation_var':
      battle.vm.locals.lastAnimationCommand = instruction.opcode;
      battle.vm.locals.lastAnimationBattler = normalizeBattleScriptTargetArg(instruction.args[0]);
      battle.vm.locals.lastAnimationId = instruction.args[1] ?? null;
      battle.vm.locals.lastAnimationArgument = instruction.args[2] ?? null;
      appendBattleVmLocalList(battle, 'controllerScriptCommands', `${instruction.opcode}:${instruction.args.slice(0, 2).join(':')}`);
      break;
    case 'playstatchangeanimation':
    case 'chosenstatus2animation':
      battle.vm.locals.lastAnimationCommand = instruction.opcode;
      battle.vm.locals.lastAnimationBattler = normalizeBattleScriptTargetArg(instruction.args[0]);
      battle.vm.locals.lastAnimationStats = instruction.args[1] ?? null;
      battle.vm.locals.lastAnimationArgument = instruction.args[2] ?? null;
      appendBattleVmLocalList(battle, 'controllerScriptCommands', `${instruction.opcode}:${instruction.args[0] ?? ''}:${instruction.args[1] ?? ''}`);
      break;
    case 'setgraphicalstatchangevalues':
      battle.vm.locals.graphicalStatChangeValuesReady = true;
      break;
    case 'updatestatusicon':
      battle.vm.locals.lastStatusIconBattler = normalizeBattleScriptTargetArg(instruction.args[0]);
      appendBattleVmLocalList(battle, 'controllerScriptCommands', `${instruction.opcode}:${instruction.args[0] ?? ''}`);
      break;
    case 'printstring':
    case 'printselectionstring':
      battle.vm.locals.lastPrintedStringId = instruction.args[0] ?? null;
      appendBattleVmLocalList(battle, 'printedStringIds', instruction.args[0] ?? '');
      break;
    case 'printfromtable':
    case 'printselectionstringfromtable':
      battle.vm.locals.lastPrintedStringTable = instruction.args[0] ?? null;
      appendBattleVmLocalList(battle, 'printedStringTables', instruction.args[0] ?? '');
      break;
    case 'seteffectwithchance':
      battle.vm.locals.secondaryEffectChanceRequested = true;
      break;
    case 'seteffectsecondary':
      battle.vm.locals.secondaryEffectApplied = true;
      break;
    case 'setmultihitcounter':
      battle.vm.locals.multiHitCounter = parseBattleScriptLiteral(instruction.args[0]);
      break;
    case 'initmultihitstring':
      battle.vm.locals.multiHitStringInitialized = true;
      break;
    case 'movevaluescleanup':
      battle.vm.locals.moveValuesCleaned = true;
      break;
    case 'adjustnormaldamage2':
    case 'adjustsetdamage':
    case 'typecalc2':
    case 'negativedamage':
    case 'manipulatedamage':
    case 'setdamagetohealthdifference':
    case 'damagetohalftargethp':
    case 'remaininghptopower':
    case 'weightdamagecalculation':
    case 'psywavedamageeffect':
    case 'counterdamagecalculator':
    case 'mirrorcoatdamagecalculator':
    case 'presentdamagecalculation':
    case 'magnitudedamagecalculation':
    case 'rolloutdamagecalculation':
    case 'furycuttercalc':
    case 'friendshiptodamagecalculation':
    case 'dmgtolevel':
    case 'scaledamagebyhealthratio':
    case 'hiddenpowercalc':
    case 'weatherdamage':
    case 'doubledamagedealtifdamaged':
    case 'maxattackhalvehp':
    case 'stockpiletobasedamage':
    case 'stockpiletohpheal':
    case 'recoverbasedonsunlight':
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'setlightscreen':
    case 'setreflect':
    case 'setsafeguard':
    case 'setmist':
    case 'setrain':
    case 'setsunny':
    case 'setsandstorm':
    case 'sethail':
    case 'setseeded':
    case 'settorment':
    case 'settaunt':
    case 'setyawn':
    case 'setforesight':
    case 'setdestinybond':
    case 'setfocusenergy':
    case 'setminimize':
    case 'setdefensecurlbit':
    case 'setcharge':
    case 'setbide':
    case 'setsubstitute':
    case 'setprotectlike':
    case 'setalwayshitflag':
    case 'setforcedtarget':
    case 'setsemiinvulnerablebit':
    case 'clearsemiinvulnerablebit':
    case 'setmagiccoattarget':
    case 'settypebasedhalvers':
    case 'settypetorandomresistance':
    case 'settypetoterrain':
    case 'setweatherballtype':
    case 'setatkhptozero':
    case 'setatktoplayer0':
    case 'removelightscreenreflect':
    case 'rapidspinfree':
    case 'clearstatusfromeffect':
    case 'cleareffectsonfaint':
    case 'cancelmultiturnmoves':
    case 'makevisible':
    case 'removeitem':
    case 'normalisebuffs':
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'setmultihit':
    case 'decrementmultihit':
      battle.vm.locals.multiHitCounterCommand = instruction.opcode;
      battle.vm.locals.multiHitCounterArg = parseBattleScriptLiteral(instruction.args[0]);
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'moveendall':
    case 'moveendto':
    case 'moveendfrom':
    case 'moveendfromto':
    case 'moveendcase':
      battle.vm.locals.lastMoveEndCommand = instruction.opcode;
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'openpartyscreen':
    case 'switchhandleorder':
    case 'switchindataupdate':
    case 'switchinanim':
    case 'switchineffects':
    case 'switchoutabilities':
    case 'getswitchedmondata':
    case 'getbattlersforrecall':
    case 'returntoball':
    case 'returnatktoball':
    case 'returnopponentmon1toball':
    case 'returnopponentmon2toball':
    case 'forcerandomswitch':
    case 'swapattackerwithtarget':
    case 'selectfirstvalidtarget':
    case 'snatchsetbattlers':
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'metronome':
    case 'assistattackselect':
    case 'trychoosesleeptalkmove':
    case 'jumptocalledmove':
    case 'callterrainattack':
    case 'mimicattackcopy':
    case 'copymovepermanently':
    case 'trymirrormove':
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'handleballthrow':
    case 'givecaughtmon':
    case 'trygivecaughtmonnick':
    case 'trysetcaughtmondexflags':
    case 'displaydexinfo':
    case 'incrementgamestat':
    case 'getexp':
    case 'getmoneyreward':
    case 'givepaydaymoney':
    case 'drawlvlupbox':
    case 'handlelearnnewmove':
    case 'buffermovetolearn':
    case 'yesnobox':
    case 'yesnoboxlearnmove':
    case 'yesnoboxstoplearningmove':
    case 'fanfare':
    case 'waitfanfare':
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'useitemonopponent':
    case 'hpthresholds':
    case 'hpthresholds2':
    case 'healpartystatus':
    case 'cureifburnedparalysedorpoisoned':
    case 'checkpokeflute':
    case 'pickup':
    case 'tryhealhalfhealth':
    case 'tryspiteppreduce':
    case 'tryrecycleitem':
    case 'tryswapitems':
    case 'tryswapabilities':
    case 'trycopyability':
    case 'tryconversiontypechange':
    case 'trycastformdatachange':
    case 'docastformchangeanimation':
    case 'trywish':
      recordBattleScriptStateCommand(battle, instruction);
      break;
    case 'atknameinbuff1':
    case 'cancelallactions':
    case 'checkteamslost':
    case 'confuseifrepeatingattackends':
    case 'copyarray':
    case 'copyarraywithindex':
    case 'copyfoestats':
    case 'cursetarget':
    case 'disablelastusedattack':
    case 'dofaintanimation':
    case 'drawpartystatussummary':
    case 'getbattlerfainted':
    case 'getifcantrunfrombattle':
    case 'getmovetarget':
    case 'getsecretpowereffect':
    case 'hidepartystatussummary':
    case 'painsplitdmgcalc':
    case 'playfaintcry':
    case 'resetintimidatetracebits':
    case 'resetplayerfainted':
    case 'resetsentmonsvalue':
    case 'stockpile':
    case 'trainerslidein':
    case 'transformdataexecution':
    case 'try':
    case 'trydobeatup':
    case 'tryexplosion':
    case 'tryfaintmon_spikes':
    case 'trygetintimidatetarget':
    case 'tryimprison':
    case 'tryinfatuating':
    case 'trymemento':
    case 'trysetdestinybondtohappen':
    case 'trysetencore':
    case 'trysetfutureattack':
    case 'trysetgrudge':
    case 'trysethelpinghand':
    case 'trysetmagiccoat':
    case 'trysetperishsong':
    case 'trysetrest':
    case 'trysetroots':
    case 'trysetsnatch':
    case 'trysetspikes':
    case 'updatechoicemoveonlvlup':
      recordBattleScriptStateCommand(battle, instruction);
      break;
  }
};

const getBattleScriptRuntimeBranchResult = (
  battle: BattleState,
  runtime: BattleScriptCommandRuntime,
  instruction: DecompBattleScriptInstruction
): boolean | null => {
  switch (instruction.opcode) {
    case 'jumpifmove':
      return runtime.move
        ? runtime.move.id === normalizeMoveConstant(instruction.args[0] ?? '')
        : null;
    case 'jumpifnotmove':
      return runtime.move
        ? runtime.move.id !== normalizeMoveConstant(instruction.args[0] ?? '')
        : null;
    case 'jumpifmovehadnoeffect': {
      const moveResultFlags = String(battle.vm.locals.gMoveResultFlags ?? '');
      return battle.vm.locals.lastTypeEffectiveness === 0
        || moveResultFlags.split('|').map((entry) => entry.trim()).includes('MOVE_RESULT_DOESNT_AFFECT_FOE');
    }
    case 'jumpifhasnohp': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler ? battler.hp <= 0 : null;
    }
    case 'jumpifcantmakeasleep':
      return isSleepBlockedForBattleScript(battle, runtime);
    case 'jumpifcantswitch':
      return isSwitchBlockedForBattleScript(runtime, instruction.args[0] ?? '');
    case 'jumpifconfusedandstatmaxed': {
      const target = runtime.defender ?? null;
      const stat = statStageKeyByConstant[instruction.args[0] ?? ''];
      return target && stat ? target.volatile.confusionTurns > 0 && target.statStages[stat] >= 6 : null;
    }
    case 'jumpifnodamage': {
      const damage = typeof battle.vm.locals.lastCalculatedDamage === 'number'
        ? battle.vm.locals.lastCalculatedDamage
        : runtime.damage ?? null;
      return damage !== null ? damage <= 0 : null;
    }
    case 'jumpifnotfirstturn': {
      const attacker = runtime.attacker ?? null;
      return attacker ? attacker.volatile.activeTurns > 0 : null;
    }
    case 'jumpifplayerran':
      return battle.vm.locals.playerRan === true;
    case 'jumpifnopursuitswitchdmg':
      return battle.vm.locals.pursuitSwitchDamage !== true;
    case 'jumpifnexttargetvalid':
      return battle.vm.locals.nextTargetValid === true;
    case 'jumpifbattletype':
      return hasBattleTypeFlag(battle, instruction.args[0] ?? '');
    case 'jumpifnotbattletype':
      return !hasBattleTypeFlag(battle, instruction.args[0] ?? '');
    case 'jumpifability': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? battler.abilityId === normalizeAbilityConstant(instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifabilitypresent': {
      const ability = normalizeAbilityConstant(instruction.args[0] ?? '');
      return [runtime.attacker, runtime.defender].some((battler) => battler?.abilityId === ability);
    }
    case 'jumpiftype':
    case 'jumpiftype2': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? battler.types.includes(normalizeTypeConstant(instruction.args[1] ?? 'TYPE_NORMAL'))
        : null;
    }
    case 'jumpifstatus': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? matchesBattleScriptStatus1(battler, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifnotstatus': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? !matchesBattleScriptStatus1(battler, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifstatus2': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? matchesBattleScriptStatus2(battler, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifnotstatus2': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? !matchesBattleScriptStatus2(battler, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifstatus3': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? matchesBattleScriptStatus3(battler, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifnostatus3': {
      const battler = getRuntimeBattlerByScriptArg(runtime, instruction.args[0] ?? '');
      return battler
        ? !matchesBattleScriptStatus3(battler, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifsideaffecting': {
      const side = getRuntimeSideByScriptArg(runtime, instruction.args[0] ?? '');
      return side
        ? matchesBattleScriptSideStatus(battle, side, instruction.args[1] ?? '')
        : null;
    }
    case 'jumpifstat': {
      const statStage = getBattlerStatStageByScriptArg(
        runtime,
        instruction.args[0] ?? '',
        instruction.args[2] ?? ''
      );
      return statStage === null
        ? null
        : compareBattleVmValues(instruction.args[1] ?? '', statStage, instruction.args[3] ?? '');
    }
    case 'jumpifbytenotequal': {
      const left = getBattleVmComparableValue(battle, instruction.args[0] ?? '');
      const right = getBattleVmComparableValue(battle, instruction.args[1] ?? '');
      return compareBattleVmValues('CMP_NOT_EQUAL', left, String(right ?? ''));
    }
    case 'jumpifbyteequal': {
      const left = getBattleVmComparableValue(battle, instruction.args[0] ?? '');
      const right = getBattleVmComparableValue(battle, instruction.args[1] ?? '');
      return compareBattleVmValues('CMP_EQUAL', left, String(right ?? ''));
    }
    case 'jumpifbyte':
    case 'jumpifhalfword':
    case 'jumpifword': {
      const leftKey = instruction.args[1] ?? '';
      const left = leftKey === 'gChosenMove' || leftKey === 'gCurrentMove'
        ? runtime.move ? `MOVE_${runtime.move.id}` : null
        : getBattleVmComparableValue(battle, leftKey);
      return compareBattleVmValues(instruction.args[0] ?? '', left, instruction.args[2] ?? '');
    }
    default:
      return null;
  }
};

const createBattleScriptBranchResolver = (
  runtime: BattleScriptCommandRuntime
): BattleScriptVmStepOptions['shouldTakeBranch'] => (battle, instruction) =>
  getBattleScriptRuntimeBranchResult(battle, runtime, instruction);

const battleScriptEndOpcodes = new Set([
  'end',
  'end2',
  'end3',
  'endselectionscript',
  'finishaction'
]);

const isBattleScriptBranchOpcode = (opcode: string): boolean =>
  opcode.startsWith('jumpif');

const recordVisitedInstruction = (
  battle: BattleState,
  instruction: DecompBattleScriptInstruction
): void => {
  const visited = typeof battle.vm.locals.visitedScriptInstructions === 'string'
    ? battle.vm.locals.visitedScriptInstructions.split(',').filter(Boolean)
    : [];
  visited.push(instruction.opcode);
  battle.vm.locals.visitedScriptInstructions = visited.join(',');
};

const completeBattleScriptVm = (battle: BattleState): BattleScriptVmStepResult => {
  battle.vm.currentLabel = null;
  battle.vm.pc = 0;
  battle.vm.callStack = [];
  battle.currentScriptLabel = null;
  return {
    completed: true,
    instruction: null,
    label: null,
    pc: 0
  };
};

const jumpBattleScriptVmToLabel = (battle: BattleState, label: string | null): BattleScriptVmStepResult => {
  if (!label) {
    return completeBattleScriptVm(battle);
  }
  battle.vm.currentLabel = label;
  battle.currentScriptLabel = label;
  battle.vm.pc = 0;
  return {
    completed: false,
    instruction: null,
    label,
    pc: 0
  };
};

export const stepBattleScriptVmInstruction = (
  battle: BattleState,
  options: BattleScriptVmStepOptions = {}
): BattleScriptVmStepResult => {
  const currentLabel = battle.vm.currentLabel;
  if (!currentLabel) {
    return completeBattleScriptVm(battle);
  }

  const script = getDecompBattleScript(currentLabel);
  if (!script) {
    battle.vm.locals.missingScriptLabel = currentLabel;
    return completeBattleScriptVm(battle);
  }

  if (battle.vm.pc >= script.instructions.length) {
    const frame = battle.vm.callStack.pop();
    if (frame) {
      battle.vm.currentLabel = frame.label;
      battle.currentScriptLabel = frame.label;
      battle.vm.pc = frame.pc;
      return {
        completed: false,
        instruction: null,
        label: frame.label,
        pc: frame.pc
      };
    }

    return jumpBattleScriptVmToLabel(battle, getNextDecompBattleScriptLabel(currentLabel));
  }

  const instruction = script.instructions[battle.vm.pc]!;
  recordVisitedInstruction(battle, instruction);
  battle.vm.pc += 1;
  applyPassiveBattleScriptInstruction(battle, instruction);

  if (instruction.opcode === 'goto') {
    return jumpBattleScriptVmToLabel(battle, instruction.args[0] ?? null);
  }

  if (instruction.opcode === 'call') {
    battle.vm.callStack.push({ label: currentLabel, pc: battle.vm.pc });
    return jumpBattleScriptVmToLabel(battle, instruction.args[0] ?? null);
  }

  if (instruction.opcode === 'return') {
    const frame = battle.vm.callStack.pop();
    if (!frame) {
      return completeBattleScriptVm(battle);
    }
    battle.vm.currentLabel = frame.label;
    battle.currentScriptLabel = frame.label;
    battle.vm.pc = frame.pc;
    return {
      completed: false,
      instruction,
      label: frame.label,
      pc: frame.pc
    };
  }

  if (battleScriptEndOpcodes.has(instruction.opcode)) {
    return completeBattleScriptVm(battle);
  }

  if (isBattleScriptBranchOpcode(instruction.opcode)) {
    const shouldTake = options.shouldTakeBranch?.(battle, instruction) ?? false;
    if (shouldTake) {
      return jumpBattleScriptVmToLabel(battle, instruction.args[instruction.args.length - 1] ?? null);
    }
  }

  return {
    completed: false,
    instruction,
    label: battle.vm.currentLabel,
    pc: battle.vm.pc
  };
};

export const advanceBattleScriptVmToInstruction = (
  battle: BattleState,
  opcode: string,
  options: BattleScriptVmStepOptions = {},
  maxSteps = 512
): DecompBattleScriptInstruction | null => {
  for (let step = 0; step < maxSteps; step += 1) {
    const result = stepBattleScriptVmInstruction(battle, options);
    if (result.completed) {
      return null;
    }
    if (result.instruction?.opcode === opcode) {
      return result.instruction;
    }
  }
  battle.vm.locals.scriptStepLimitHit = opcode;
  return null;
};

export const advanceBattleScriptVmToCommand = (
  battle: BattleState,
  opcode: string,
  runtime: BattleScriptCommandRuntime = {}
): DecompBattleScriptInstruction | null => {
  const found = advanceBattleScriptVmToInstruction(battle, opcode, {
    shouldTakeBranch: createBattleScriptBranchResolver(runtime)
  });
  if (!found && !battle.vm.currentLabel) {
    const plan = getScriptCommandPlan(battle);
    const fallbackIndex = plan.indexOf(opcode);
    battle.vm.pc = fallbackIndex >= 0 ? fallbackIndex + 1 : battle.vm.pc;
  }
  recordScriptCommand(battle, opcode);
  return found;
};

export interface BattleScriptCommandRuntime {
  attackerSide?: BattleSideId;
  defenderSide?: BattleSideId;
  attackerBattlerId?: BattleBattlerId;
  defenderBattlerId?: BattleBattlerId;
  attacker?: BattlePokemonSnapshot;
  defender?: BattlePokemonSnapshot;
  move?: BattleMove;
  encounterState?: BattleEncounterState;
  options?: BattleMoveVmPreludeOptions;
  messages?: string[];
  canMoveThisTurn?: () => boolean;
  pushMessage?: (text: string) => void;
  getActorLabel?: () => string;
  typeEffectiveness?: number;
  damage?: number;
  critical?: boolean;
  moveEffect?: string;
  defenderCanStillAct?: boolean;
  attemptAccuracy?: (
    battle: BattleState,
    attackerSide: BattleSideId,
    attacker: BattlePokemonSnapshot,
    defender: BattlePokemonSnapshot,
    move: BattleMove,
    encounterState: BattleEncounterState
  ) => boolean;
  getBattleTypeEffectiveness?: (move: BattleMove, defender: BattlePokemonSnapshot) => number;
  getLastUsedMove?: (pokemon: BattlePokemonSnapshot) => BattleMove | null;
  nextBattleRng?: (encounterState: BattleEncounterState) => number;
  typeByTerrain?: Partial<Record<string, PokemonType>>;
  tryUseProtect?: (...args: any[]) => boolean;
  applyDirectStageChange?: (...args: any[]) => void;
  applyConfusion?: (...args: any[]) => boolean;
  useBide?: (...args: any[]) => any;
  applyTransform?: (...args: any[]) => any;
  applyConversion?: (...args: any[]) => any;
  applyConversion2?: (...args: any[]) => any;
  useFutureAttack?: (...args: any[]) => any;
  getMoveWithDynamicPower?: (...args: any[]) => BattleMove;
  getCounterMirrorDamage?: (...args: any[]) => number | null;
  calculateFixedDamage?: (...args: any[]) => number | null;
  useTrick?: (attacker: BattlePokemonSnapshot, defender: BattlePokemonSnapshot, messages: string[]) => boolean;
  useRecycle?: (attacker: BattlePokemonSnapshot, messages: string[]) => boolean;
  healBattler?: (
    battle: BattleState,
    side: BattleSideId,
    pokemon: BattlePokemonSnapshot,
    amount: number,
    messages: string[]
  ) => boolean;
  applyQueuedDamage?: (
    battle: BattleState,
    side: BattleSideId,
    nextHp: number
  ) => void;
}

export interface BattleScriptCommandResult {
  stopped?: boolean;
  failed?: boolean;
  missed?: boolean;
  typeEffectiveness?: number;
  move?: BattleMove;
  damage?: number | null;
  healed?: boolean;
}

const sideConditionMessageByCommand: Record<string, {
  key: 'reflectTurns' | 'lightScreenTurns' | 'safeguardTurns' | 'mistTurns';
  message: (side: BattleSideId) => string;
}> = {
  setreflect: {
    key: 'reflectTurns',
    message: (side) => `${side === 'player' ? 'Your' : "Foe's"} team became protected by Reflect!`
  },
  setlightscreen: {
    key: 'lightScreenTurns',
    message: (side) => `${side === 'player' ? 'Your' : "Foe's"} team became protected by Light Screen!`
  },
  setsafeguard: {
    key: 'safeguardTurns',
    message: (side) => `${side === 'player' ? 'Your' : "Foe's"} team became protected by Safeguard!`
  },
  setmist: {
    key: 'mistTurns',
    message: (side) => `${side === 'player' ? 'Your' : "Foe's"} team became shrouded in Mist!`
  }
};

const weatherByScriptCommand = {
  setrain: 'rain',
  setsunny: 'sun',
  setsandstorm: 'sandstorm',
  sethail: 'hail'
} as const;

const weatherStartMessageByCommand: Record<keyof typeof weatherByScriptCommand, string> = {
  setrain: 'It started to rain!',
  setsunny: 'The sunlight got bright!',
  setsandstorm: 'A sandstorm brewed!',
  sethail: 'It started to hail!'
};

const getRuntimeAttackerBattlerId = (runtime: BattleScriptCommandRuntime): BattleBattlerId | null =>
  runtime.attackerBattlerId
    ?? runtime.options?.attackerBattlerId
    ?? (runtime.attackerSide ? getPrimaryBattlerIdForSide(runtime.attackerSide) : null);

const getOppositeSide = (side: BattleSideId): BattleSideId =>
  side === 'player' ? 'opponent' : 'player';

export const runBattleScriptCommand = (
  battle: BattleState,
  opcode: string,
  runtime: BattleScriptCommandRuntime = {}
): BattleScriptCommandResult => {
  const instruction = advanceBattleScriptVmToCommand(battle, opcode, runtime);

  switch (opcode) {
    case 'attackcanceler': {
      if (runtime.canMoveThisTurn && !runtime.canMoveThisTurn()) {
        return { stopped: true };
      }
      return {};
    }
    case 'attackstring': {
      const announce = runtime.options?.announce ?? true;
      if (
        announce
        && runtime.move
        && runtime.attacker
        && runtime.pushMessage
        && runtime.getActorLabel
        && battle.vm.locals.attackStringApplied !== true
      ) {
        runtime.pushMessage(`${runtime.getActorLabel()} used ${runtime.move.name}!`);
        runtime.attacker.volatile.lastPrintedMoveId = runtime.move.id;
        const attackerBattlerId = getRuntimeAttackerBattlerId(runtime);
        if (attackerBattlerId !== null) {
          patchBattlerMoveMemory(battle, attackerBattlerId, {
            printedMoveId: runtime.move.id
          });
        }
        battle.vm.locals.attackStringApplied = true;
      }
      return {};
    }
    case 'ppreduce': {
      const consumePp = runtime.options?.consumePp ?? true;
      if (
        consumePp
        && runtime.move
        && runtime.move.id !== 'STRUGGLE'
        && runtime.move.ppRemaining > 0
        && battle.vm.locals.ppReduceApplied !== true
      ) {
        runtime.move.ppRemaining -= 1;
        battle.vm.locals.ppReduceApplied = true;
      }
      return {};
    }
    case 'accuracycheck': {
      if (
        runtime.attemptAccuracy
        && runtime.attackerSide
        && runtime.attacker
        && runtime.defender
        && runtime.move
        && runtime.encounterState
      ) {
        return runtime.attemptAccuracy(
          battle,
          runtime.attackerSide,
          runtime.attacker,
          runtime.defender,
          runtime.move,
          runtime.encounterState
        )
          ? {}
          : { missed: true };
      }
      return {};
    }
    case 'typecalc':
    case 'typecalc2': {
      if (runtime.getBattleTypeEffectiveness && runtime.move && runtime.defender) {
        const typeEffectiveness = runtime.getBattleTypeEffectiveness(runtime.move, runtime.defender);
        battle.vm.locals.lastTypeEffectiveness = typeEffectiveness;
        battle.vm.locals.lastTypeCalcCommand = opcode;
        if (typeEffectiveness === 0) {
          battle.vm.locals.gMoveResultFlags = combineBattleScriptFlags(
            battle.vm.locals.gMoveResultFlags ?? null,
            'MOVE_RESULT_DOESNT_AFFECT_FOE'
          );
        }
        return { typeEffectiveness };
      }
      return {};
    }
    case 'resultmessage': {
      const typeEffectiveness = runtime.typeEffectiveness
        ?? (typeof battle.vm.locals.lastTypeEffectiveness === 'number' ? battle.vm.locals.lastTypeEffectiveness : null);
      if (typeEffectiveness !== null && runtime.pushMessage) {
        if (typeEffectiveness > 1) {
          runtime.pushMessage("It's super effective!");
        } else if (typeEffectiveness < 1 && typeEffectiveness > 0) {
          runtime.pushMessage("It's not very effective...");
        }
      }
      return {};
    }
    case 'critcalc': {
      battle.vm.locals.lastCriticalHit = runtime.critical ?? false;
      return {};
    }
    case 'damagecalc': {
      if (typeof runtime.damage === 'number') {
        battle.vm.locals.lastCalculatedDamage = runtime.damage;
      }
      return {};
    }
    case 'remaininghptopower':
    case 'weightdamagecalculation':
    case 'magnitudedamagecalculation':
    case 'rolloutdamagecalculation':
    case 'furycuttercalc':
    case 'friendshiptodamagecalculation':
    case 'scaledamagebyhealthratio':
    case 'hiddenpowercalc':
    case 'weatherdamage':
    case 'doubledamagedealtifdamaged':
    case 'stockpiletobasedamage': {
      if (
        runtime.getMoveWithDynamicPower
        && runtime.move
        && runtime.attacker
        && runtime.defender
        && runtime.encounterState
      ) {
        const dynamicMove = runtime.getMoveWithDynamicPower(
          runtime.move,
          runtime.attacker,
          runtime.defender,
          battle,
          runtime.encounterState,
          runtime.messages ?? []
        );
        battle.vm.locals.lastDynamicDamageCommand = opcode;
        battle.vm.locals.lastDynamicMoveId = dynamicMove.id;
        battle.vm.locals.lastDynamicMovePower = dynamicMove.power;
        battle.vm.locals.lastDynamicMoveType = dynamicMove.type;
        return { move: dynamicMove };
      }
      return {};
    }
    case 'counterdamagecalculator':
    case 'mirrorcoatdamagecalculator': {
      if (runtime.getCounterMirrorDamage && runtime.move && runtime.attackerSide && runtime.attacker) {
        const damage = runtime.getCounterMirrorDamage(runtime.move, runtime.attackerSide, runtime.attacker);
        battle.vm.locals.lastCounterMirrorCommand = opcode;
        battle.vm.locals.lastCalculatedDamage = damage;
        if (damage === null) {
          battle.vm.locals.gMoveResultFlags = combineBattleScriptFlags(
            battle.vm.locals.gMoveResultFlags ?? null,
            'MOVE_RESULT_FAILED'
          );
        }
        return { damage };
      }
      return {};
    }
    case 'adjustsetdamage':
    case 'psywavedamageeffect':
    case 'dmgtolevel':
    case 'damagetohalftargethp': {
      if (typeof runtime.damage === 'number') {
        battle.vm.locals.lastFixedDamageCommand = opcode;
        battle.vm.locals.lastCalculatedDamage = runtime.damage;
        return { damage: runtime.damage };
      }
      if (
        runtime.calculateFixedDamage
        && runtime.move
        && runtime.attacker
        && runtime.defender
        && runtime.encounterState
      ) {
        const damage = runtime.calculateFixedDamage(
          runtime.move,
          runtime.attacker,
          runtime.defender,
          runtime.encounterState
        );
        battle.vm.locals.lastFixedDamageCommand = opcode;
        battle.vm.locals.lastCalculatedDamage = damage;
        if (damage === null) {
          battle.vm.locals.gMoveResultFlags = combineBattleScriptFlags(
            battle.vm.locals.gMoveResultFlags ?? null,
            'MOVE_RESULT_FAILED'
          );
        }
        return { damage };
      }
      return {};
    }
    case 'setdamagetohealthdifference': {
      if (runtime.attacker && runtime.defender) {
        const damage = runtime.defender.hp > runtime.attacker.hp
          ? runtime.defender.hp - runtime.attacker.hp
          : null;
        battle.vm.locals.lastFixedDamageCommand = opcode;
        battle.vm.locals.lastCalculatedDamage = damage;
        if (damage === null) {
          battle.vm.locals.gMoveResultFlags = combineBattleScriptFlags(
            battle.vm.locals.gMoveResultFlags ?? null,
            'MOVE_RESULT_FAILED'
          );
          return { damage, failed: true };
        }
        return { damage };
      }
      return {};
    }
    case 'presentdamagecalculation': {
      if (
        runtime.nextBattleRng
        && runtime.encounterState
        && runtime.move
        && runtime.defender
      ) {
        const presentRoll = runtime.nextBattleRng(runtime.encounterState) & 0xff;
        battle.vm.locals.lastPresentDamageRoll = presentRoll;
        if (presentRoll >= 204) {
          if (runtime.defender.hp >= runtime.defender.maxHp) {
            runtime.pushMessage?.('But it failed!');
            battle.vm.locals.gMoveResultFlags = combineBattleScriptFlags(
              battle.vm.locals.gMoveResultFlags ?? null,
              'MOVE_RESULT_FAILED'
            );
            return { stopped: true, failed: true };
          }
          if (runtime.healBattler && runtime.defenderSide && runtime.messages) {
            runtime.healBattler(
              battle,
              runtime.defenderSide,
              runtime.defender,
              Math.max(1, Math.floor(runtime.defender.maxHp / 4)),
              runtime.messages
            );
          }
          return { stopped: true, healed: true };
        }

        const move = {
          ...runtime.move,
          power: presentRoll < 102 ? 40 : presentRoll < 178 ? 80 : 120
        };
        battle.vm.locals.lastDynamicDamageCommand = opcode;
        battle.vm.locals.lastDynamicMoveId = move.id;
        battle.vm.locals.lastDynamicMovePower = move.power;
        return { move };
      }
      return {};
    }
    case 'adjustnormaldamage': {
      battle.vm.locals.normalDamageAdjusted = true;
      return {};
    }
    case 'setreflect':
    case 'setlightscreen':
    case 'setsafeguard':
    case 'setmist': {
      const side = runtime.attackerSide;
      const condition = sideConditionMessageByCommand[opcode];
      if (!side || !condition) {
        return {};
      }
      if (battle.sideState[side][condition.key] > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      battle.sideState[side][condition.key] = 5;
      runtime.pushMessage?.(condition.message(side));
      return {};
    }
    case 'setrain':
    case 'setsunny':
    case 'setsandstorm':
    case 'sethail': {
      const weather = weatherByScriptCommand[opcode];
      if (battle.weather === weather) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      battle.weather = weather;
      battle.weatherTurns = 5;
      runtime.pushMessage?.(weatherStartMessageByCommand[opcode]);
      return {};
    }
    case 'setseeded': {
      if (!runtime.attackerSide || !runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.substituteHp > 0 || runtime.defender.volatile.leechSeededBy !== null) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      if (runtime.defender.types.includes('grass')) {
        runtime.pushMessage?.(`It doesn't affect ${runtime.defender.species}...`);
        return { failed: true };
      }
      runtime.defender.volatile.leechSeededBy = runtime.attackerSide;
      runtime.pushMessage?.(`${runtime.defender.species} was seeded!`);
      return {};
    }
    case 'setfocusenergy': {
      if (!runtime.attacker) {
        return {};
      }
      if (runtime.attacker.volatile.focusEnergy) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.focusEnergy = true;
      runtime.pushMessage?.(`${runtime.attacker.species} is getting pumped!`);
      return {};
    }
    case 'settorment': {
      if (!runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.tormented) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.tormented = true;
      runtime.pushMessage?.(`${runtime.defender.species} was subjected to torment!`);
      return {};
    }
    case 'settaunt': {
      if (!runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.tauntTurns > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.tauntTurns = 2;
      runtime.pushMessage?.(`${runtime.defender.species} fell for the taunt!`);
      return {};
    }
    case 'setdestinybond': {
      if (runtime.attacker) {
        runtime.attacker.volatile.destinyBond = true;
        runtime.pushMessage?.(`${runtime.attacker.species} is trying to take its foe with it!`);
      }
      return {};
    }
    case 'setforesight': {
      if (!runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.foresighted || runtime.defender.volatile.substituteHp > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.foresighted = true;
      runtime.pushMessage?.(`${runtime.defender.species} was identified!`);
      return {};
    }
    case 'setcharge': {
      if (runtime.attacker) {
        runtime.attacker.volatile.chargeTurns = 2;
        runtime.pushMessage?.(`${runtime.attacker.species} began charging power!`);
      }
      return {};
    }
    case 'settypebasedhalvers': {
      if (!runtime.move) {
        return {};
      }
      if (runtime.move.effect === 'EFFECT_MUD_SPORT') {
        if (battle.mudSport) {
          runtime.pushMessage?.('But it failed!');
          return { failed: true };
        }
        battle.mudSport = true;
        runtime.pushMessage?.('Electricity was weakened!');
        return {};
      }
      if (runtime.move.effect === 'EFFECT_WATER_SPORT') {
        if (battle.waterSport) {
          runtime.pushMessage?.('But it failed!');
          return { failed: true };
        }
        battle.waterSport = true;
        runtime.pushMessage?.('Fire was weakened!');
      }
      return {};
    }
    case 'settypetoterrain': {
      if (!runtime.attacker) {
        return {};
      }
      const terrainType = runtime.typeByTerrain?.[battle.terrain] ?? 'normal';
      if (runtime.attacker.types.length === 1 && runtime.attacker.types[0] === terrainType) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.types = [terrainType];
      runtime.pushMessage?.(`${runtime.attacker.species} changed type!`);
      return {};
    }
    case 'setalwayshitflag': {
      if (!runtime.attackerSide || !runtime.attacker || !runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.substituteHp > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.lockOnBy = runtime.attackerSide;
      runtime.defender.volatile.lockOnTurns = 2;
      runtime.pushMessage?.(`${runtime.attacker.species} took aim at ${runtime.defender.species}!`);
      return {};
    }
    case 'setforcedtarget': {
      if (runtime.attacker) {
        runtime.attacker.volatile.followMe = true;
        runtime.pushMessage?.(`${runtime.attacker.species} became the center of attention!`);
      }
      return {};
    }
    case 'setsubstitute': {
      if (!runtime.attacker || !runtime.attackerSide) {
        return {};
      }
      if (runtime.attacker.volatile.substituteHp > 0) {
        runtime.pushMessage?.(`${runtime.attacker.species} already has a substitute!`);
        return { failed: true };
      }
      const hpCost = Math.max(1, Math.floor(runtime.attacker.maxHp / 4));
      if (runtime.attacker.hp <= hpCost) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.hp -= hpCost;
      runtime.attacker.volatile.substituteHp = hpCost;
      runtime.applyQueuedDamage?.(battle, runtime.attackerSide, runtime.attacker.hp);
      runtime.pushMessage?.(`${runtime.attacker.species} put in a substitute!`);
      return {};
    }
    case 'setprotectlike': {
      if (!runtime.attacker || !runtime.encounterState || !runtime.messages || !runtime.tryUseProtect) {
        return {};
      }
      const message = runtime.move?.effect === 'EFFECT_ENDURE'
        ? `${runtime.attacker.species} braced itself!`
        : undefined;
      const protectedThisTurn = runtime.tryUseProtect(
        runtime.attacker,
        runtime.encounterState,
        runtime.messages,
        runtime.defenderCanStillAct,
        message
      );
      if (runtime.move?.effect === 'EFFECT_ENDURE') {
        runtime.attacker.volatile.protected = false;
        runtime.attacker.volatile.enduring = protectedThisTurn;
      }
      return protectedThisTurn ? {} : { failed: true };
    }
    case 'setbide': {
      if (!runtime.attackerSide || !runtime.attacker || !runtime.defender || !runtime.move || !runtime.messages || !runtime.useBide) {
        return {};
      }
      const defenderSide = getOppositeSide(runtime.attackerSide);
      return runtime.useBide(battle, runtime.attackerSide, defenderSide, runtime.attacker, runtime.defender, runtime.move, runtime.messages)
        ? {}
        : { failed: true };
    }
    case 'forcerandomswitch': {
      if (!runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.rooted || runtime.defender.volatile.substituteHp > 0 || runtime.defender.abilityId === 'SUCTION_CUPS') {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.pushMessage?.(`${runtime.defender.species} was blown away!`);
      battle.moveEndedBattle = true;
      return {};
    }
    case 'transformdataexecution':
      return runtime.attacker && runtime.defender && runtime.messages && runtime.applyTransform
        ? runtime.applyTransform(runtime.attacker, runtime.defender, runtime.messages) ? {} : { failed: true }
        : {};
    case 'tryconversiontypechange':
      return runtime.attacker && runtime.encounterState && runtime.messages && runtime.applyConversion
        ? runtime.applyConversion(runtime.attacker, runtime.encounterState, runtime.messages) ? {} : { failed: true }
        : {};
    case 'settypetorandomresistance':
      return runtime.attacker && runtime.encounterState && runtime.messages && runtime.applyConversion2
        ? runtime.applyConversion2(battle, runtime.attacker, runtime.encounterState, runtime.messages) ? {} : { failed: true }
        : {};
    case 'trysetfutureattack': {
      if (!runtime.attackerSide || !runtime.attacker || !runtime.defender || !runtime.move || !runtime.messages || !runtime.useFutureAttack) {
        return {};
      }
      const defenderSide = getOppositeSide(runtime.attackerSide);
      return runtime.useFutureAttack(battle, runtime.attackerSide, defenderSide, runtime.attacker, runtime.defender, runtime.move, runtime.messages)
        ? {}
        : { failed: true };
    }
    case 'setyawn': {
      if (!runtime.attackerSide || !runtime.defender) {
        return {};
      }
      const defenderSide = getOppositeSide(runtime.attackerSide);
      if (runtime.defender.status !== 'none' || runtime.defender.volatile.yawnTurns > 0 || runtime.defender.volatile.substituteHp > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      if (battle.sideState[defenderSide].safeguardTurns > 0) {
        runtime.pushMessage?.(`${runtime.defender.species}'s team is protected by Safeguard!`);
        return { failed: true };
      }
      runtime.defender.volatile.yawnTurns = 2;
      runtime.pushMessage?.(`${runtime.defender.species} grew drowsy!`);
      return {};
    }
    case 'disablelastusedattack': {
      if (!runtime.defender || !runtime.getLastUsedMove || !runtime.nextBattleRng || !runtime.encounterState) {
        return {};
      }
      const lastMove = runtime.getLastUsedMove(runtime.defender);
      if (!lastMove || runtime.defender.volatile.disableTurns > 0 || lastMove.ppRemaining <= 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.disabledMoveId = lastMove.id;
      runtime.defender.volatile.disableTurns = 2 + (runtime.nextBattleRng(runtime.encounterState) & 3);
      runtime.pushMessage?.(`${runtime.defender.species}'s ${lastMove.name} was disabled!`);
      return {};
    }
    case 'trysetencore': {
      if (!runtime.defender || !runtime.getLastUsedMove || !runtime.nextBattleRng || !runtime.encounterState) {
        return {};
      }
      const lastMove = runtime.getLastUsedMove(runtime.defender);
      if (!lastMove || runtime.defender.volatile.encoreTurns > 0 || lastMove.id === 'ENCORE' || lastMove.id === 'MIRROR_MOVE' || lastMove.id === 'STRUGGLE' || lastMove.ppRemaining <= 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.encoreMoveId = lastMove.id;
      runtime.defender.volatile.encoreTurns = 3 + (runtime.nextBattleRng(runtime.encounterState) & 3);
      runtime.pushMessage?.(`${runtime.defender.species} got an encore!`);
      return {};
    }
    case 'tryspiteppreduce': {
      if (!runtime.defender || !runtime.getLastUsedMove || !runtime.nextBattleRng || !runtime.encounterState) {
        return {};
      }
      const lastMove = runtime.getLastUsedMove(runtime.defender);
      if (!lastMove || lastMove.ppRemaining <= 1) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      const ppLoss = Math.min(lastMove.ppRemaining, 2 + (runtime.nextBattleRng(runtime.encounterState) & 3));
      lastMove.ppRemaining -= ppLoss;
      runtime.pushMessage?.(`${runtime.defender.species}'s ${lastMove.name} lost ${ppLoss} PP!`);
      return {};
    }
    case 'trysetspikes': {
      if (!runtime.attackerSide) {
        return {};
      }
      const targetSide = getOppositeSide(runtime.attackerSide);
      const targetSideState = battle.sideState[targetSide];
      if (targetSideState.spikesLayers >= 3) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      targetSideState.spikesLayers += 1;
      runtime.pushMessage?.('Spikes were scattered around the foe!');
      return {};
    }
    case 'trysetgrudge': {
      if (!runtime.attacker) {
        return {};
      }
      if (runtime.attacker.volatile.grudge) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.grudge = true;
      runtime.pushMessage?.(`${runtime.attacker.species} wants its foe to bear a grudge!`);
      return {};
    }
    case 'trysetroots': {
      if (!runtime.attacker) {
        return {};
      }
      if (runtime.attacker.volatile.rooted) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.rooted = true;
      runtime.pushMessage?.(`${runtime.attacker.species} planted its roots!`);
      return {};
    }
    case 'setminimize': {
      if (runtime.attacker) {
        runtime.attacker.volatile.minimized = true;
      }
      return {};
    }
    case 'setdefensecurlbit': {
      if (runtime.attacker) {
        runtime.attacker.volatile.defenseCurl = true;
      }
      return {};
    }
    case 'trysethelpinghand': {
      if (!runtime.attacker || !runtime.defender || battle.format !== 'doubles' || runtime.attacker === runtime.defender || runtime.defender.hp <= 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.helpingHand = true;
      runtime.pushMessage?.(`${runtime.attacker.species} is ready to help ${runtime.defender.species}!`);
      return {};
    }
    case 'trysetmagiccoat': {
      if (!runtime.attacker || !runtime.defenderCanStillAct) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.magicCoat = true;
      runtime.pushMessage?.(`${runtime.attacker.species} shrouded itself with Magic Coat!`);
      return {};
    }
    case 'trysetsnatch': {
      if (!runtime.attacker || !runtime.defenderCanStillAct) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.snatch = true;
      runtime.pushMessage?.(`${runtime.attacker.species} waits for a target to make a move!`);
      return {};
    }
    case 'tryimprison': {
      if (!runtime.attacker || !runtime.defender || runtime.attacker.volatile.imprisoning || !runtime.attacker.moves.some((knownMove) => runtime.defender?.moves.some((defenderMove) => defenderMove.id === knownMove.id))) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.imprisoning = true;
      runtime.pushMessage?.(`${runtime.attacker.species} sealed the foe's move!`);
      return {};
    }
    case 'trywish': {
      if (!runtime.attackerSide || !runtime.attacker) {
        return {};
      }
      const sideState = battle.sideState[runtime.attackerSide];
      if (sideState.wishTurns > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      sideState.wishTurns = 2;
      sideState.wishHp = Math.max(1, Math.floor(runtime.attacker.maxHp / 2));
      runtime.pushMessage?.(`${runtime.attacker.species} made a wish!`);
      return {};
    }
    case 'tryhealhalfhealth': {
      const target = runtime.attacker ?? null;
      const side = runtime.attackerSide ?? null;
      if (!target || !side || !runtime.healBattler) {
        return {};
      }
      return runtime.healBattler(battle, side, target, Math.floor(target.maxHp / 2), runtime.messages ?? [])
        ? {}
        : { failed: true };
    }
    case 'recoverbasedonsunlight': {
      const target = runtime.attacker ?? null;
      const side = runtime.attackerSide ?? null;
      if (!target || !side || !runtime.healBattler) {
        return {};
      }
      const amount = battle.weather === 'sun'
        ? Math.max(1, Math.floor((target.maxHp * 2) / 3))
        : battle.weather === 'none'
          ? Math.max(1, Math.floor(target.maxHp / 2))
          : Math.max(1, Math.floor(target.maxHp / 4));
      return runtime.healBattler(battle, side, target, amount, runtime.messages ?? [])
        ? {}
        : { failed: true };
    }
    case 'trysetrest': {
      if (!runtime.attacker || !runtime.attackerSide) {
        return {};
      }
      if (runtime.attacker.hp >= runtime.attacker.maxHp || runtime.attacker.status === 'sleep') {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.hp = runtime.attacker.maxHp;
      runtime.attacker.status = 'sleep';
      runtime.attacker.statusTurns = 3;
      runtime.attacker.volatile.toxicCounter = 0;
      runtime.applyQueuedDamage?.(battle, runtime.attackerSide, runtime.attacker.hp);
      runtime.pushMessage?.(`${runtime.attacker.species} went to sleep and became healthy!`);
      return {};
    }
    case 'cureifburnedparalysedorpoisoned': {
      if (!runtime.attacker || !['poison', 'badPoison', 'burn', 'paralysis'].includes(runtime.attacker.status)) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.status = 'none';
      runtime.attacker.statusTurns = 0;
      runtime.attacker.volatile.toxicCounter = 0;
      runtime.pushMessage?.(`${runtime.attacker.species} became healthy!`);
      return {};
    }
    case 'healpartystatus': {
      const party = (runtime.attackerSide ?? 'player') === 'player'
        ? battle.playerSide.party
        : battle.opponentSide.party;
      for (const pokemon of party) {
        pokemon.status = 'none';
        pokemon.statusTurns = 0;
        pokemon.volatile.toxicCounter = 0;
      }
      runtime.pushMessage?.('A bell chimed and cured status problems!');
      return {};
    }
    case 'normalisebuffs': {
      const clearStages = (pokemon: BattlePokemonSnapshot): void => {
        pokemon.statStages = {
          attack: 0,
          defense: 0,
          speed: 0,
          spAttack: 0,
          spDefense: 0,
          accuracy: 0,
          evasion: 0
        };
      };
      for (const pokemon of getActiveBattlePokemon(battle)) {
        clearStages(pokemon);
      }
      runtime.pushMessage?.('All stat changes were eliminated!');
      return {};
    }
    case 'stockpile': {
      if (!runtime.attacker) {
        return {};
      }
      if (runtime.attacker.volatile.stockpile >= 3) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.volatile.stockpile += 1;
      runtime.pushMessage?.(`${runtime.attacker.species} stockpiled ${runtime.attacker.volatile.stockpile}!`);
      return {};
    }
    case 'stockpiletohpheal': {
      if (!runtime.attacker || !runtime.attackerSide || !runtime.healBattler) {
        return {};
      }
      if (runtime.attacker.volatile.stockpile <= 0 || runtime.attacker.hp >= runtime.attacker.maxHp) {
        runtime.attacker.volatile.stockpile = 0;
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      const healDivisor = runtime.attacker.volatile.stockpile === 1 ? 8 : runtime.attacker.volatile.stockpile === 2 ? 4 : 2;
      const healed = runtime.healBattler(
        battle,
        runtime.attackerSide,
        runtime.attacker,
        Math.max(1, Math.floor(runtime.attacker.maxHp / healDivisor)),
        runtime.messages ?? []
      );
      runtime.attacker.volatile.stockpile = 0;
      return healed ? {} : { failed: true };
    }
    case 'trysetperishsong': {
      let affected = false;
      for (const pokemon of getActiveBattlePokemon(battle)) {
        if (pokemon.hp > 0 && pokemon.abilityId !== 'SOUNDPROOF' && pokemon.volatile.perishTurns === 0) {
          pokemon.volatile.perishTurns = 3;
          affected = true;
        }
      }
      runtime.pushMessage?.(affected ? 'All Pokémon hearing the song will faint in three turns!' : 'But it failed!');
      return affected ? {} : { failed: true };
    }
    case 'tryinfatuating': {
      if (!runtime.attackerSide || !runtime.defender) {
        return {};
      }
      if (runtime.defender.volatile.infatuatedBy !== null || runtime.defender.volatile.substituteHp > 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.defender.volatile.infatuatedBy = runtime.attackerSide;
      runtime.pushMessage?.(`${runtime.defender.species} fell in love!`);
      return {};
    }
    case 'cursetarget': {
      if (!runtime.attacker || !runtime.defender || !runtime.attackerSide) {
        return {};
      }
      if (runtime.defender.volatile.cursed || runtime.defender.volatile.substituteHp > 0 || runtime.attacker.hp <= 1) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.hp = Math.max(0, runtime.attacker.hp - Math.max(1, Math.floor(runtime.attacker.maxHp / 2)));
      runtime.applyQueuedDamage?.(battle, runtime.attackerSide, runtime.attacker.hp);
      runtime.defender.volatile.cursed = true;
      runtime.pushMessage?.(`${runtime.attacker.species} laid a curse on ${runtime.defender.species}!`);
      return {};
    }
    case 'maxattackhalvehp': {
      if (!runtime.attacker || !runtime.attackerSide) {
        return {};
      }
      const hpCost = Math.floor(runtime.attacker.maxHp / 2);
      if (runtime.attacker.hp <= hpCost || runtime.attacker.statStages.attack >= 6) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.hp -= hpCost;
      runtime.attacker.statStages.attack = 6;
      runtime.applyQueuedDamage?.(battle, runtime.attackerSide, runtime.attacker.hp);
      runtime.pushMessage?.(`${runtime.attacker.species} cut its HP and maximized ATTACK!`);
      return {};
    }
    case 'trymemento': {
      if (!runtime.defender) {
        return {};
      }
      if (runtime.defender.statStages.attack <= -6 && runtime.defender.statStages.spAttack <= -6 && runtime.defender.volatile.substituteHp <= 0) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      if (runtime.defender.volatile.substituteHp > 0) {
        runtime.pushMessage?.('But it had no effect!');
        return {};
      }
      runtime.applyDirectStageChange?.(runtime.defender, 'attack', -2, runtime.messages ?? []);
      runtime.applyDirectStageChange?.(runtime.defender, 'spAttack', -2, runtime.messages ?? []);
      return {};
    }
    case 'setatkhptozero': {
      if (!runtime.attacker || !runtime.attackerSide) {
        return {};
      }
      runtime.attacker.hp = 0;
      runtime.applyQueuedDamage?.(battle, runtime.attackerSide, runtime.attacker.hp);
      return {};
    }
    case 'rapidspinfree': {
      if (!runtime.attacker || !runtime.attackerSide) {
        return {};
      }
      runtime.attacker.volatile.trapTurns = 0;
      runtime.attacker.volatile.trappedBy = null;
      runtime.attacker.volatile.leechSeededBy = null;
      battle.sideState[runtime.attackerSide].spikesLayers = 0;
      runtime.pushMessage?.(`${runtime.attacker.species} was freed from binding effects!`);
      return {};
    }
    case 'clearstatusfromeffect': {
      if (!runtime.defender || runtime.defender.status !== 'paralysis') {
        return {};
      }
      runtime.defender.status = 'none';
      runtime.defender.statusTurns = 0;
      runtime.defender.volatile.toxicCounter = 0;
      runtime.pushMessage?.(`${runtime.defender.species}'s paralysis was cured!`);
      return {};
    }
    case 'confuseifrepeatingattackends': {
      if (!runtime.attacker) {
        return {};
      }
      if (runtime.move?.effect === 'EFFECT_RAMPAGE' && runtime.attacker.volatile.rampageTurns > 0) {
        runtime.attacker.volatile.rampageTurns -= 1;
        if (runtime.attacker.volatile.rampageTurns === 0) {
          runtime.attacker.volatile.rampageMoveId = null;
          runtime.applyConfusion?.(runtime.attacker, runtime.encounterState, runtime.messages ?? []);
        }
      } else if (runtime.move?.effect === 'EFFECT_UPROAR' && runtime.attacker.volatile.uproarTurns > 0) {
        runtime.attacker.volatile.uproarTurns -= 1;
        if (runtime.attacker.volatile.uproarTurns === 0) {
          runtime.attacker.volatile.uproarMoveId = null;
          runtime.pushMessage?.(`${runtime.attacker.species} calmed down.`);
        }
      }
      return {};
    }
    case 'painsplitdmgcalc': {
      if (!runtime.attacker || !runtime.defender || !runtime.attackerSide) {
        return {};
      }
      const sharedHp = Math.floor((runtime.attacker.hp + runtime.defender.hp) / 2);
      runtime.attacker.hp = Math.min(runtime.attacker.maxHp, sharedHp);
      runtime.defender.hp = Math.min(runtime.defender.maxHp, sharedHp);
      runtime.applyQueuedDamage?.(battle, runtime.attackerSide, runtime.attacker.hp);
      runtime.applyQueuedDamage?.(battle, getOppositeSide(runtime.attackerSide), runtime.defender.hp);
      runtime.pushMessage?.('The battlers shared their pain!');
      return {};
    }
    case 'tryswapitems':
      return runtime.attacker && runtime.defender && runtime.useTrick
        ? runtime.useTrick(runtime.attacker, runtime.defender, runtime.messages ?? []) ? {} : { failed: true }
        : {};
    case 'tryrecycleitem':
      return runtime.attacker && runtime.useRecycle
        ? runtime.useRecycle(runtime.attacker, runtime.messages ?? []) ? {} : { failed: true }
        : {};
    case 'trycopyability': {
      if (!runtime.attacker || !runtime.defender || !runtime.defender.abilityId || runtime.attacker.abilityId === runtime.defender.abilityId) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      runtime.attacker.abilityId = runtime.defender.abilityId;
      runtime.pushMessage?.(`${runtime.attacker.species} copied ${runtime.defender.species}'s ability!`);
      return {};
    }
    case 'tryswapabilities': {
      if (!runtime.attacker || !runtime.defender || (!runtime.attacker.abilityId && !runtime.defender.abilityId)) {
        runtime.pushMessage?.('But it failed!');
        return { failed: true };
      }
      const attackerAbility = runtime.attacker.abilityId;
      runtime.attacker.abilityId = runtime.defender.abilityId;
      runtime.defender.abilityId = attackerAbility;
      runtime.pushMessage?.(`${runtime.attacker.species} swapped abilities with its target!`);
      return {};
    }
    case 'copyfoestats': {
      if (runtime.attacker && runtime.defender) {
        runtime.attacker.statStages = { ...runtime.defender.statStages };
        runtime.pushMessage?.(`${runtime.attacker.species} copied the foe's stat changes!`);
      }
      return {};
    }
    case 'attackanimation':
    case 'waitanimation':
    case 'effectivenesssound':
    case 'hitanimation':
    case 'waitstate':
    case 'waitmessage':
    case 'pause':
    case 'playanimation':
    case 'playstatchangeanimation':
    case 'statusanimation':
    case 'status2animation':
    case 'updatestatusicon': {
      battle.vm.pendingCommands.push({
        type: 'script',
        label: instruction
          ? `${instruction.opcode}${instruction.args.length > 0 ? ` ${instruction.args.join(',')}` : ''}`
          : opcode
      });
      return {};
    }
    case 'printstring':
    case 'printselectionstring': {
      const stringId = instruction?.args[0] ?? null;
      battle.vm.locals.lastPrintedStringId = stringId;
      if (stringId) {
        battle.vm.pendingMessages.push(stringId);
        runtime.pushMessage?.(stringId);
      }
      return {};
    }
    case 'printfromtable': {
      const tableId = instruction?.args[0] ?? null;
      battle.vm.locals.lastPrintedStringTable = tableId;
      if (tableId) {
        battle.vm.pendingMessages.push(tableId);
        runtime.pushMessage?.(tableId);
      }
      return {};
    }
    case 'seteffectwithchance': {
      battle.vm.locals.secondaryEffectChanceRequested = true;
      return {};
    }
    case 'movevaluescleanup': {
      battle.vm.locals.moveValuesCleaned = true;
      return {};
    }
    case 'setmultihitcounter': {
      battle.vm.locals.multiHitCounter = parseBattleScriptLiteral(instruction?.args[0]);
      return {};
    }
    case 'initmultihitstring': {
      battle.vm.locals.multiHitStringInitialized = true;
      return {};
    }
    case 'setstatchanger': {
      battle.vm.locals.statChangerStat = instruction?.args[0] ?? null;
      battle.vm.locals.statChangerAmount = parseBattleScriptLiteral(instruction?.args[1]);
      battle.vm.locals.statChangerDown = parseBattleScriptLiteral(instruction?.args[2]);
      return {};
    }
    case 'statbuffchange': {
      const statFromScript = typeof battle.vm.locals.statChangerStat === 'string'
        ? statStageKeyByConstant[battle.vm.locals.statChangerStat]
        : undefined;
      const moveStageEffect = runtime.move ? stageEffectRuntimeByMoveEffect[runtime.move.effect] : undefined;
      const stat = statFromScript ?? moveStageEffect?.stat;
      const affectsUser = instruction?.args[0]?.includes('MOVE_EFFECT_AFFECTS_USER') ?? false;
      const target = affectsUser || moveStageEffect?.target === 'self' ? runtime.attacker : runtime.defender;
      const stage = target && stat ? target.statStages[stat] : 0;
      const isDown = battle.vm.locals.statChangerDown === true || battle.vm.locals.statChangerDown === 'TRUE' || (moveStageEffect?.delta ?? 0) < 0;
      battle.vm.locals.cMULTISTRING_CHOOSER = isDown
        ? stage <= -6 ? 'B_MSG_STAT_WONT_DECREASE' : 'B_MSG_STAT_FELL'
        : stage >= 6 ? 'B_MSG_STAT_WONT_INCREASE' : 'B_MSG_STAT_ROSE';
      battle.vm.locals.statBuffTarget = affectsUser ? 'attacker' : 'defender';
      return {};
    }
    case 'healthbarupdate': {
      if (runtime.defender) {
        battle.vm.locals.lastHealthbarHp = runtime.defender.hp;
      }
      return {};
    }
    case 'datahpupdate': {
      if (runtime.defender) {
        battle.vm.locals.lastDataHp = runtime.defender.hp;
      }
      return {};
    }
    case 'critmessage':
    case 'tryfaintmon':
    case 'moveendall': {
      return {};
    }
    case 'setmoveeffect': {
      battle.vm.locals.lastMoveEffect = runtime.moveEffect ?? runtime.move?.effect ?? null;
      return {};
    }
    case 'seteffectprimary': {
      battle.vm.locals.primaryEffectApplied = true;
      const moveEffect = runtime.moveEffect ?? battle.vm.locals.lastMoveEffect;
      if (runtime.defender && moveEffect === 'MOVE_EFFECT_NIGHTMARE') {
        if (runtime.defender.status !== 'sleep' || runtime.defender.volatile.nightmare) {
          runtime.pushMessage?.('But it failed!');
          return { failed: true };
        }
        runtime.defender.volatile.nightmare = true;
        runtime.pushMessage?.(`${runtime.defender.species} fell into a nightmare!`);
      }
      if (runtime.defender && moveEffect === 'MOVE_EFFECT_PREVENT_ESCAPE') {
        if (!runtime.attackerSide || runtime.defender.volatile.escapePreventedBy || runtime.defender.volatile.substituteHp > 0) {
          runtime.pushMessage?.('But it failed!');
          return { failed: true };
        }
        runtime.defender.volatile.escapePreventedBy = runtime.attackerSide;
        runtime.pushMessage?.(`${runtime.defender.species} can no longer escape!`);
      }
      if (runtime.attacker && moveEffect === 'MOVE_EFFECT_PAYDAY') {
        battle.payDayMoney += runtime.attacker.level * 5;
        runtime.pushMessage?.('Coins were scattered everywhere!');
      }
      if (runtime.attacker && moveEffect === 'MOVE_EFFECT_RAGE') {
        runtime.attacker.volatile.rage = true;
      }
      if (runtime.attacker && moveEffect === 'MOVE_EFFECT_RECHARGE') {
        runtime.attacker.volatile.rechargeTurns = 1;
      }
      if (runtime.attacker && runtime.encounterState && moveEffect === 'MOVE_EFFECT_RAMPAGE' && runtime.attacker.volatile.rampageTurns <= 0) {
        runtime.attacker.volatile.rampageMoveId = runtime.move?.id ?? runtime.attacker.volatile.rampageMoveId;
        runtime.attacker.volatile.rampageTurns = 2 + ((runtime.nextBattleRng?.(runtime.encounterState) ?? 0) & 1);
      }
      if (runtime.attacker && runtime.encounterState && moveEffect === 'MOVE_EFFECT_UPROAR' && runtime.attacker.volatile.uproarTurns <= 0) {
        runtime.attacker.volatile.uproarMoveId = runtime.move?.id ?? runtime.attacker.volatile.uproarMoveId;
        runtime.attacker.volatile.uproarTurns = 2 + ((runtime.nextBattleRng?.(runtime.encounterState) ?? 0) % 4);
        runtime.pushMessage?.(`${runtime.attacker.species} caused an uproar!`);
      }
      if (runtime.defender && runtime.attackerSide && runtime.encounterState && moveEffect === 'MOVE_EFFECT_WRAP' && runtime.defender.volatile.trapTurns <= 0) {
        runtime.defender.volatile.trapTurns = 3 + ((runtime.nextBattleRng?.(runtime.encounterState) ?? 0) & 3);
        runtime.defender.volatile.trappedBy = runtime.attackerSide;
        runtime.pushMessage?.(`${runtime.defender.species} was trapped!`);
      }
      return {};
    }
    default:
      return {};
  }
};

const isPrimaryStatusBlockedBeforeAccuracy = (
  status: StatusCondition,
  target: BattlePokemonSnapshot,
  move: BattleMove
): boolean => {
  if (target.volatile.substituteHp > 0 || target.status !== 'none') {
    return true;
  }
  if (status === 'poison' || status === 'badPoison') {
    return target.types.includes('poison') || target.types.includes('steel') || target.abilityId === 'IMMUNITY';
  }
  if (status === 'burn') {
    return target.types.includes('fire') || target.abilityId === 'WATER_VEIL';
  }
  if (status === 'sleep') {
    return target.abilityId === 'INSOMNIA' || target.abilityId === 'VITAL_SPIRIT';
  }
  if (status === 'paralysis') {
    return target.abilityId === 'LIMBER' || (move.type === 'electric' && target.types.includes('ground'));
  }
  return false;
};

export type BattleTurnActor = BattleSideId;

export interface SingleBattleTurnVmCallbacks {
  getPlayerMove: () => BattleMove | null;
  getEnemyMove: () => BattleMove | null;
  getActionOrder: (playerMove: BattleMove, enemyMove: BattleMove) => BattleTurnActor[];
  tryUseOpponentTrainerItem: (messages: string[]) => boolean;
  executeMove: (
    actor: BattleTurnActor,
    move: BattleMove,
    defenderCanStillAct: boolean
  ) => string[];
  resolveEndOfTurn: () => string[];
  enqueueTurnMessages: (messages: string[]) => void;
  queueResolvedMessages: (messages: string[]) => void;
}

export interface EnemyOnlyTurnVmCallbacks {
  getEnemyMove: () => BattleMove | null;
  tryUseOpponentTrainerItem: (messages: string[]) => boolean;
  executeEnemyMove: (move: BattleMove) => string[];
  resolveEndOfTurn: () => string[];
  enqueueTurnMessages: (messages: string[]) => void;
  queueResolvedMessages: (messages: string[]) => void;
}

export interface ExecuteBattleMoveVmOptions {
  consumePp?: boolean;
  announce?: boolean;
  reflected?: boolean;
  snatched?: boolean;
  sleepTalk?: boolean;
  preserveLastMoveUsed?: boolean;
  attackerBattlerId?: BattleBattlerId;
  defenderBattlerId?: BattleBattlerId;
}

export interface ExecuteBattleMoveVmDeps {
  canMoveThisTurn: (...args: any[]) => boolean;
  emitControllerCommand: (battle: BattleState, command: BattleControllerCommand) => void;
  pushMessage: (messages: string[], battle: BattleState, text: string) => void;
  getActorLabel: (side: BattleSideId, battle: BattleState) => string;
  useBide: (...args: any[]) => void;
  useMimic: (...args: any[]) => void;
  useSketch: (...args: any[]) => void;
  getLastTakenMove: (...args: any[]) => BattleMove | null;
  chooseMetronomeMove: (...args: any[]) => BattleMove;
  rememberTakenMove: (...args: any[]) => void;
  chooseAssistMove: (...args: any[]) => BattleMove | null;
  chooseSleepTalkMove: (...args: any[]) => BattleMove | null;
  getNaturePowerMove: (...args: any[]) => BattleMove | null;
  tryUseProtect: (...args: any[]) => boolean;
  isMoveBlockedByProtect: (...args: any[]) => boolean;
  isSoundMove: (...args: any[]) => boolean;
  applyAbsorbingAbility: (...args: any[]) => boolean;
  isMagicCoatReflectable: (...args: any[]) => boolean;
  isSnatchableMove: (...args: any[]) => boolean;
  isMoveBlockedBySubstitute: (...args: any[]) => boolean;
  shouldSkipTwoTurnCharge: (...args: any[]) => boolean;
  getSemiInvulnerableState: (...args: any[]) => 'air' | 'underground' | 'underwater' | null;
  useFutureAttack: (...args: any[]) => void;
  attemptAccuracy: (...args: any[]) => boolean;
  getBattleTypeEffectiveness: (...args: any[]) => number;
  calculateDamageRoll: (...args: any[]) => number;
  damageBattler: (...args: any[]) => number;
  applyFaintRetaliation: (...args: any[]) => void;
  useBeatUp: (...args: any[]) => void;
  getMoveWithDynamicPower: (...args: any[]) => BattleMove;
  getCounterMirrorDamage: (...args: any[]) => number | null;
  calculateFixedDamage: (...args: any[]) => number | null;
  isDirectHitEffect: (...args: any[]) => boolean;
  isMultiHitMove: (...args: any[]) => boolean;
  getMultiHitCount: (...args: any[]) => number;
  isCriticalHit: (...args: any[]) => boolean;
  maybeApplySecondaryStatus: (...args: any[]) => void;
  maybeApplySecondaryStageEffect: (...args: any[]) => void;
  maybeApplySecondaryConfusion: (...args: any[]) => void;
  applySecretPowerEffect: (...args: any[]) => void;
  maybeApplyFlinch: (...args: any[]) => void;
  maybeApplyKingsRock: (...args: any[]) => void;
  applyPostHitItemEffect: (...args: any[]) => void;
  applyQueuedDamage?: (...args: any[]) => void;
  maybeApplyShellBell?: (...args: any[]) => void;
  applyConfusion?: (...args: any[]) => boolean;
  applyStatusEffect: (...args: any[]) => void;
  applySideCondition: (...args: any[]) => boolean;
  applyWeatherMove: (...args: any[]) => boolean;
  useSubstitute: (...args: any[]) => void;
  clearAllStatStages: (...args: any[]) => void;
  applyTransform: (...args: any[]) => void;
  applyConversion: (...args: any[]) => void;
  applyConversion2: (...args: any[]) => void;
  getLastUsedMove: (...args: any[]) => BattleMove | null;
  nextBattleRng: (...args: any[]) => number;
  applyDirectStageChange: (...args: any[]) => void;
  useBellyDrum: (...args: any[]) => void;
  applyComboStageMove: (...args: any[]) => boolean;
  useTrick: (...args: any[]) => boolean;
  useRecycle: (...args: any[]) => boolean;
  useBatonPass: (...args: any[]) => void;
  healBattler: (...args: any[]) => boolean;
  applyStageEffect: (...args: any[]) => boolean;
  getFaintMessage: (side: BattleSideId, battle: BattleState) => string;
  rememberLandedMove: (...args: any[]) => void;
  shouldRememberTakenMoveFromMessages: (...args: any[]) => boolean;
  getHeldItemHoldEffect: (...args: any[]) => string;
  getChoicedMoveId: (...args: any[]) => string | null;
  twoTurnMoveEffects: ReadonlySet<string>;
  primaryStatusByEffect: Partial<Record<string, StatusCondition>>;
  typeByTerrain?: Partial<Record<string, PokemonType>>;
}

export const createBattleVmState = (): BattleVmState => ({
  currentLabel: null,
  pc: 0,
  callStack: [],
  locals: {},
  pendingCommands: [],
  pendingMessages: []
});

export const createBattlePostResult = (): BattlePostResult => ({
  outcome: 'none',
  payouts: 0,
  losses: 0,
  payDayTotal: 0,
  levelUps: [],
  pendingMoveLearn: false,
  pendingEvolution: false,
  caughtSpecies: null,
  caughtPokemon: null,
  pendingMoveLearns: [],
  pendingEvolutions: [],
  blackout: false,
  whiteout: false
});

export const cloneBattlePostResult = (result: BattlePostResult): BattlePostResult => ({
  outcome: result.outcome,
  payouts: result.payouts,
  losses: result.losses,
  payDayTotal: result.payDayTotal,
  levelUps: result.levelUps.map((entry) => ({ ...entry })),
  pendingMoveLearn: result.pendingMoveLearn,
  pendingEvolution: result.pendingEvolution,
  caughtSpecies: result.caughtSpecies,
  caughtPokemon: result.caughtPokemon ? { ...result.caughtPokemon } : null,
  pendingMoveLearns: result.pendingMoveLearns.map((entry) => ({ ...entry })),
  pendingEvolutions: result.pendingEvolutions.map((entry) => ({ ...entry })),
  blackout: result.blackout,
  whiteout: result.whiteout
});

export const resetBattleVmState = (vm: BattleVmState): void => {
  vm.currentLabel = null;
  vm.pc = 0;
  vm.callStack = [];
  vm.locals = {};
  vm.pendingCommands = [];
  vm.pendingMessages = [];
};

export const resetBattlePostResult = (result: BattlePostResult): void => {
  result.outcome = 'none';
  result.payouts = 0;
  result.losses = 0;
  result.payDayTotal = 0;
  result.levelUps = [];
  result.pendingMoveLearn = false;
  result.pendingEvolution = false;
  result.caughtSpecies = null;
  result.caughtPokemon = null;
  result.pendingMoveLearns = [];
  result.pendingEvolutions = [];
  result.blackout = false;
  result.whiteout = false;
};

const dynamicDamageCommandByEffect: Partial<Record<string, string>> = {
  EFFECT_HIDDEN_POWER: 'hiddenpowercalc',
  EFFECT_ERUPTION: 'scaledamagebyhealthratio',
  EFFECT_FLAIL: 'remaininghptopower',
  EFFECT_REVERSAL: 'remaininghptopower',
  EFFECT_LOW_KICK: 'weightdamagecalculation',
  EFFECT_RETURN: 'friendshiptodamagecalculation',
  EFFECT_FRUSTRATION: 'friendshiptodamagecalculation',
  EFFECT_MAGNITUDE: 'magnitudedamagecalculation',
  EFFECT_WEATHER_BALL: 'weatherdamage',
  EFFECT_REVENGE: 'doubledamagedealtifdamaged',
  EFFECT_FURY_CUTTER: 'furycuttercalc',
  EFFECT_ROLLOUT: 'rolloutdamagecalculation',
  EFFECT_SPIT_UP: 'stockpiletobasedamage'
};

const fixedDamageCommandByEffect: Partial<Record<string, string>> = {
  EFFECT_SONICBOOM: 'adjustsetdamage',
  EFFECT_DRAGON_RAGE: 'adjustsetdamage',
  EFFECT_LEVEL_DAMAGE: 'dmgtolevel',
  EFFECT_SUPER_FANG: 'damagetohalftargethp',
  EFFECT_PSYWAVE: 'psywavedamageeffect',
  EFFECT_ENDEAVOR: 'setdamagetohealthdifference'
};

const counterDamageCommandByEffect: Partial<Record<string, string>> = {
  EFFECT_COUNTER: 'counterdamagecalculator',
  EFFECT_MIRROR_COAT: 'mirrorcoatdamagecalculator'
};

export const beginBattleMoveVm = (
  battle: BattleState,
  attackerSide: BattleSideId,
  attacker: BattlePokemonSnapshot,
  move: BattleMove,
  options: BattleMoveVmPreludeOptions,
  {
    canMoveThisTurn,
    emitCommand,
    pushMessage,
    getActorLabel
  }: BattleMoveVmPreludeCallbacks
): BattleMoveVmPreludeResult => {
  battle.currentScriptLabel = move.effectScriptLabel;
  battle.vm.currentLabel = move.effectScriptLabel;
  battle.vm.pc = 0;
  battle.vm.callStack = [];
  battle.vm.pendingCommands = [];
  battle.vm.pendingMessages = [];
  battle.vm.locals.scriptCommandPlan = getBattleScriptCommandPlan(move.effectScriptLabel).join(',');
  battle.vm.locals.executedScriptCommands = '';
  battle.vm.locals.visitedScriptInstructions = '';
  battle.vm.locals.attackStringApplied = false;
  battle.vm.locals.ppReduceApplied = false;
  battle.vm.locals.attackerSide = attackerSide;
  battle.vm.locals.moveId = move.id;
  battle.vm.locals.consumePp = options.consumePp ?? true;
  battle.vm.locals.announce = options.announce ?? true;
  const attackerBattlerId = options.attackerBattlerId ?? getPrimaryBattlerIdForSide(attackerSide);
  patchBattlerMoveMemory(battle, attackerBattlerId, {
    chosenMoveId: move.id,
    currentMoveId: move.id
  });
  emitCommand({ type: 'script', label: move.effectScriptLabel });

  const commandRuntime: BattleScriptCommandRuntime = {
    attackerSide,
    attackerBattlerId,
    defenderBattlerId: options.defenderBattlerId,
    attacker,
    move,
    options,
    canMoveThisTurn,
    pushMessage,
    getActorLabel
  };
  const deferAttackStringAndPp = isAttackStringAfterAccuracy(battle);
  battle.vm.locals.deferAttackStringAndPp = deferAttackStringAndPp;

  if (runBattleScriptCommand(battle, 'attackcanceler', commandRuntime).stopped) {
    patchBattlerMoveMemory(battle, attackerBattlerId, {
      currentMoveId: null
    });
    return {
      shouldContinue: false,
      moveWasAttempted: false,
      resultingMoveHandledByCalledMove: false,
      previousLastMoveUsedId: attacker.volatile.lastMoveUsedId
    };
  }

  const consumePp = options.consumePp ?? true;
  const announce = options.announce ?? true;
  const previousLastMoveUsedId = attacker.volatile.lastMoveUsedId;

  if (consumePp && move.ppRemaining <= 0 && move.id !== 'STRUGGLE') {
    pushMessage(`There's no PP left for ${move.name}!`);
    patchBattlerMoveMemory(battle, attackerBattlerId, {
      currentMoveId: null
    });
    return {
      shouldContinue: false,
      moveWasAttempted: false,
      resultingMoveHandledByCalledMove: false,
      previousLastMoveUsedId
    };
  }

  if (move.effect === 'EFFECT_FOCUS_PUNCH' && attacker.volatile.tookDamageThisTurn) {
    if (consumePp) {
      runBattleScriptCommand(battle, 'ppreduce', commandRuntime);
    }
    pushMessage(`${attacker.species} lost its focus and couldn't move!`);
    patchBattlerMoveMemory(battle, attackerBattlerId, {
      currentMoveId: null
    });
    return {
      shouldContinue: false,
      moveWasAttempted: false,
      resultingMoveHandledByCalledMove: false,
      previousLastMoveUsedId
    };
  }

  if (announce) {
    if (deferAttackStringAndPp) {
      pushMessage(`${getActorLabel()} used ${move.name}!`);
      attacker.volatile.lastPrintedMoveId = move.id;
      patchBattlerMoveMemory(battle, attackerBattlerId, {
        printedMoveId: move.id
      });
      battle.vm.locals.attackStringApplied = true;
    } else {
      runBattleScriptCommand(battle, 'attackstring', commandRuntime);
    }
  }

  if (consumePp) {
    if (deferAttackStringAndPp) {
      if (move.id !== 'STRUGGLE' && move.ppRemaining > 0) {
        move.ppRemaining -= 1;
      }
      battle.vm.locals.ppReduceApplied = true;
    } else {
      runBattleScriptCommand(battle, 'ppreduce', commandRuntime);
    }
  }

  if (!options.preserveLastMoveUsed) {
    attacker.volatile.lastMoveUsedId = move.id;
  }
  patchBattlerMoveMemory(battle, attackerBattlerId, {
    printedMoveId: announce ? move.id : battle.moveMemory[attackerBattlerId].printedMoveId,
    resultingMoveId: options.preserveLastMoveUsed
      ? battle.moveMemory[attackerBattlerId].resultingMoveId
      : move.id
  });

  return {
    shouldContinue: true,
    moveWasAttempted: true,
    resultingMoveHandledByCalledMove: false,
    previousLastMoveUsedId
  };
};

export const finalizeBattleMoveVm = (
  battle: BattleState,
  attackerSide: BattleSideId,
  attacker: BattlePokemonSnapshot,
  move: BattleMove,
  {
    moveWasAttempted,
    resultingMoveHandledByCalledMove
  }: Pick<BattleMoveVmPreludeResult, 'moveWasAttempted' | 'resultingMoveHandledByCalledMove'>,
  {
    choiceBandActive,
    skipLastSuccessfulMove,
    attackerBattlerId
  }: {
    choiceBandActive: boolean;
    skipLastSuccessfulMove?: boolean;
    attackerBattlerId?: BattleBattlerId;
  }
): void => {
  const resolvedAttackerBattlerId = attackerBattlerId ?? getPrimaryBattlerIdForSide(attackerSide);
  if (choiceBandActive && move.id !== 'STRUGGLE' && !attacker.volatile.choicedMoveId) {
    attacker.volatile.choicedMoveId = move.id;
    patchBattlerMoveMemory(battle, resolvedAttackerBattlerId, {
      chosenMoveId: move.id
    });
  }

  if (moveWasAttempted && !resultingMoveHandledByCalledMove && !skipLastSuccessfulMove) {
    attacker.volatile.lastSuccessfulMoveId = move.id;
    patchBattlerMoveMemory(battle, resolvedAttackerBattlerId, {
      calledMoveId: move.id
    });
  }

  patchBattlerMoveMemory(battle, resolvedAttackerBattlerId, {
    currentMoveId: null
  });
};

export const runEnemyOnlyTurnVm = (
  battle: BattleState,
  leadingMessages: string[],
  {
    getEnemyMove,
    tryUseOpponentTrainerItem,
    executeEnemyMove,
    resolveEndOfTurn,
    enqueueTurnMessages,
    queueResolvedMessages
  }: EnemyOnlyTurnVmCallbacks
): void => {
  battle.vm.locals.turnResolver = 'enemyOnly';
  const messages = [...leadingMessages];

  if (tryUseOpponentTrainerItem(messages)) {
    if (battle.playerMon.hp > 0 && battle.wildMon.hp > 0) {
      messages.push(...resolveEndOfTurn());
    }
    enqueueTurnMessages(messages);
    return;
  }

  const enemyMove = getEnemyMove();
  battle.vm.locals.turnActionOrder = enemyMove ? 'opponent' : '';
  battle.vm.locals.chosenOpponentMoveId = enemyMove?.id ?? null;
  patchBattlerMoveMemory(battle, 1, {
    chosenMoveId: enemyMove?.id ?? null
  });
  if (enemyMove) {
    messages.push(...executeEnemyMove(enemyMove));
  }

  if (battle.moveEndedBattle) {
    queueResolvedMessages(messages);
    return;
  }

  if (battle.playerMon.hp > 0 && battle.wildMon.hp > 0) {
    messages.push(...resolveEndOfTurn());
  }

  enqueueTurnMessages(messages);
};

export const runSingleBattleTurnVm = (
  battle: BattleState,
  {
    getPlayerMove,
    getEnemyMove,
    getActionOrder,
    tryUseOpponentTrainerItem,
    executeMove,
    resolveEndOfTurn,
    enqueueTurnMessages,
    queueResolvedMessages
  }: SingleBattleTurnVmCallbacks
): void => {
  battle.vm.locals.turnResolver = 'selectedMove';
  const playerMove = getPlayerMove();
  const enemyMove = getEnemyMove();
  if (!playerMove || !enemyMove) {
    battle.vm.locals.turnActionOrder = '';
    return;
  }

  const messages: string[] = [];
  patchBattlerMoveMemory(battle, 0, { chosenMoveId: playerMove.id });
  patchBattlerMoveMemory(battle, 1, { chosenMoveId: enemyMove.id });
  const order = getActionOrder(playerMove, enemyMove);
  battle.vm.locals.turnActionOrder = order.join(',');
  const pendingActors = new Set<BattleTurnActor>(order);

  for (const actor of order) {
    if (battle.playerMon.hp === 0 || battle.wildMon.hp === 0) {
      break;
    }

    pendingActors.delete(actor);
    if (actor === 'opponent' && tryUseOpponentTrainerItem(messages)) {
      continue;
    }

    const defenderSide: BattleTurnActor = actor === 'player' ? 'opponent' : 'player';
    messages.push(...executeMove(
      actor,
      actor === 'player' ? playerMove : enemyMove,
      pendingActors.has(defenderSide)
    ));

    if (battle.moveEndedBattle) {
      queueResolvedMessages(messages);
      return;
    }
  }

  if (battle.playerMon.hp > 0 && battle.wildMon.hp > 0) {
    messages.push(...resolveEndOfTurn());
  }

  enqueueTurnMessages(messages);
};

export const executeBattleMoveVm = (
  battle: BattleState,
  attackerSide: BattleSideId,
  move: BattleMove,
  encounterState: BattleEncounterState,
  defenderCanStillAct = false,
  options: ExecuteBattleMoveVmOptions = {},
  deps: ExecuteBattleMoveVmDeps
): string[] => {
  const {
    canMoveThisTurn,
    emitControllerCommand,
    pushMessage,
    getActorLabel,
    useBide,
    useMimic,
    useSketch,
    getLastTakenMove,
    chooseMetronomeMove,
    rememberTakenMove,
    chooseAssistMove,
    chooseSleepTalkMove,
    getNaturePowerMove,
    tryUseProtect,
    isMoveBlockedByProtect,
    isSoundMove,
    applyAbsorbingAbility,
    isMagicCoatReflectable,
    isSnatchableMove,
    isMoveBlockedBySubstitute,
    shouldSkipTwoTurnCharge,
    getSemiInvulnerableState,
    useFutureAttack,
    attemptAccuracy,
    getBattleTypeEffectiveness,
    calculateDamageRoll,
    damageBattler,
    applyFaintRetaliation,
    useBeatUp,
    getMoveWithDynamicPower,
    getCounterMirrorDamage,
    calculateFixedDamage,
    isDirectHitEffect,
    isMultiHitMove,
    getMultiHitCount,
    isCriticalHit,
    maybeApplySecondaryStatus,
    maybeApplySecondaryStageEffect,
    maybeApplySecondaryConfusion,
    applySecretPowerEffect,
    maybeApplyFlinch,
    maybeApplyKingsRock,
    applyPostHitItemEffect,
    applyStatusEffect,
    applySideCondition,
    applyWeatherMove,
    applyTransform,
    applyConversion,
    applyConversion2,
    getLastUsedMove,
    nextBattleRng,
    applyDirectStageChange,
    applyComboStageMove,
    useTrick,
    useRecycle,
    useBatonPass,
    healBattler,
    applyStageEffect,
    getFaintMessage,
    rememberLandedMove,
    shouldRememberTakenMoveFromMessages,
    getHeldItemHoldEffect,
    getChoicedMoveId,
    twoTurnMoveEffects,
    primaryStatusByEffect
  } = deps;

  const messages: string[] = [];
  const attacker = attackerSide === 'player' ? battle.playerMon : battle.wildMon;
  const defender = attackerSide === 'player' ? battle.wildMon : battle.playerMon;
  const defenderSide = attackerSide === 'player' ? 'opponent' : 'player';

  const isChargingSecondTurn = attacker.volatile.chargingMoveId === move.id;
  const isLockedMultiTurn = attacker.volatile.rampageMoveId === move.id
    || attacker.volatile.uproarMoveId === move.id
    || (attacker.volatile.bideMoveId === move.id && attacker.volatile.bideTurns > 0);
  const vmPrelude = beginBattleMoveVm(
    battle,
    attackerSide,
    attacker,
    move,
    {
      ...options,
      consumePp: !isChargingSecondTurn && !isLockedMultiTurn && (options.consumePp ?? true)
    },
    {
      canMoveThisTurn: () => canMoveThisTurn(battle, attackerSide, attacker, move, encounterState, messages, options.sleepTalk),
      emitCommand: (command) => emitControllerCommand(battle, command),
      pushMessage: (text) => pushMessage(messages, battle, text),
      getActorLabel: () => getActorLabel(attackerSide, battle)
    }
  );
  let { resultingMoveHandledByCalledMove, moveWasAttempted, previousLastMoveUsedId } = vmPrelude;

  try {
    if (!vmPrelude.shouldContinue) {
      return messages;
    }

    if (move.target !== 'MOVE_TARGET_USER' && attackerSide !== defenderSide) {
      defender.volatile.lastLandedMoveId = null;
    }

    if (move.effect === 'EFFECT_BIDE') {
      runBattleScriptCommand(battle, 'setbide', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        useBide
      });
      return messages;
    }

    if (move.effect === 'EFFECT_MIMIC') {
      useMimic(attacker, defender, move, messages);
      return messages;
    }

    if (move.effect === 'EFFECT_SKETCH') {
      useSketch(attacker, defender, move, messages);
      return messages;
    }

    if (move.effect === 'EFFECT_MIRROR_MOVE') {
      const mirroredMove = getLastTakenMove(attacker);
      if (!mirroredMove) {
        pushMessage(messages, battle, 'Mirror Move failed!');
        return messages;
      }
      resultingMoveHandledByCalledMove = true;
      messages.push(...executeBattleMoveVm(battle, attackerSide, { ...mirroredMove }, encounterState, defenderCanStillAct, { ...options, consumePp: false, preserveLastMoveUsed: true }, deps));
      return messages;
    }

    if (move.effect === 'EFFECT_METRONOME') {
      const calledMove = chooseMetronomeMove(encounterState);
      resultingMoveHandledByCalledMove = true;
      messages.push(...executeBattleMoveVm(battle, attackerSide, calledMove, encounterState, defenderCanStillAct, { ...options, consumePp: false, preserveLastMoveUsed: true }, deps));
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
      return messages;
    }

    if (move.effect === 'EFFECT_ASSIST') {
      const calledMove = chooseAssistMove(battle, attackerSide, encounterState);
      if (!calledMove) {
        pushMessage(messages, battle, 'But it failed!');
        return messages;
      }
      resultingMoveHandledByCalledMove = true;
      messages.push(...executeBattleMoveVm(battle, attackerSide, calledMove, encounterState, defenderCanStillAct, { ...options, consumePp: false, preserveLastMoveUsed: true }, deps));
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
      return messages;
    }

    if (move.effect === 'EFFECT_SLEEP_TALK') {
      if (attacker.status !== 'sleep') {
        pushMessage(messages, battle, 'But it failed!');
        return messages;
      }
      const calledMove = chooseSleepTalkMove(battle, attackerSide, attacker, encounterState, previousLastMoveUsedId);
      messages.push(`${attacker.species} is fast asleep.`);
      if (!calledMove) {
        pushMessage(messages, battle, 'But it failed!');
        return messages;
      }
      resultingMoveHandledByCalledMove = true;
      messages.push(...executeBattleMoveVm(battle, attackerSide, calledMove, encounterState, defenderCanStillAct, { ...options, consumePp: false, sleepTalk: true, preserveLastMoveUsed: true }, deps));
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
      return messages;
    }

    if (move.effect === 'EFFECT_NATURE_POWER') {
      const calledMove = getNaturePowerMove(battle);
      if (!calledMove) {
        pushMessage(messages, battle, 'But it failed!');
        return messages;
      }
      messages.push(`Nature Power turned into ${calledMove.name}!`);
      resultingMoveHandledByCalledMove = true;
      messages.push(...executeBattleMoveVm(battle, attackerSide, calledMove, encounterState, defenderCanStillAct, { ...options, consumePp: false, preserveLastMoveUsed: true }, deps));
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
      return messages;
    }

    if (move.effect === 'EFFECT_PROTECT') {
      runBattleScriptCommand(battle, 'setprotectlike', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        messages,
        defenderCanStillAct,
        tryUseProtect
      });
      return messages;
    }

    if (isMoveBlockedByProtect(move, defender)) {
      pushMessage(messages, battle, `${defender.species} protected itself!`);
      return messages;
    }

    if (defender.abilityId === 'SOUNDPROOF' && isSoundMove(move) && move.target !== 'MOVE_TARGET_USER') {
      pushMessage(messages, battle, `${defender.species}'s Soundproof made it ineffective!`);
      return messages;
    }

    if (applyAbsorbingAbility(battle, defenderSide, defender, move, messages)) {
      return messages;
    }

    if (!options.reflected && defender.volatile.magicCoat && isMagicCoatReflectable(move)) {
      defender.volatile.magicCoat = false;
      messages.push(`${defender.species}'s Magic Coat bounced the move back!`);
      messages.push(...executeBattleMoveVm(battle, defenderSide, { ...move }, encounterState, false, {
        ...options,
        attackerBattlerId: options.defenderBattlerId,
        defenderBattlerId: options.attackerBattlerId,
        consumePp: false,
        reflected: true
      }, deps));
      return messages;
    }

    if (!options.snatched && defender.volatile.snatch && isSnatchableMove(move)) {
      defender.volatile.snatch = false;
      messages.push(`${defender.species} snatched ${move.name}!`);
      messages.push(...executeBattleMoveVm(battle, defenderSide, { ...move, target: 'MOVE_TARGET_USER' }, encounterState, false, {
        ...options,
        attackerBattlerId: options.defenderBattlerId,
        defenderBattlerId: options.attackerBattlerId,
        consumePp: false,
        snatched: true
      }, deps));
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

    if (move.effect === 'EFFECT_SPIT_UP' && attacker.volatile.stockpile <= 0) {
      pushMessage(messages, battle, 'But it failed!');
      return messages;
    }

    if ((move.effect === 'EFFECT_SNORE' || move.effect === 'EFFECT_SLEEP_TALK') && attacker.status !== 'sleep') {
      pushMessage(messages, battle, 'But it failed!');
      return messages;
    }

    if (move.effect === 'EFFECT_TELEPORT') {
      messages.push(`${attacker.species} fled from battle!`);
      battle.moveEndedBattle = true;
      return messages;
    }

    if (move.effect === 'EFFECT_ROAR') {
      runBattleScriptCommand(battle, 'forcerandomswitch', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => pushMessage(messages, battle, text)
      });
      return messages;
    }

    if (move.effect === 'EFFECT_FAKE_OUT' && attacker.volatile.activeTurns > 0) {
      pushMessage(messages, battle, 'But it failed!');
      return messages;
    }

    if (twoTurnMoveEffects.has(move.effect) && !isChargingSecondTurn && !shouldSkipTwoTurnCharge(battle, move)) {
      attacker.volatile.chargingMoveId = move.id;
      attacker.volatile.semiInvulnerable = getSemiInvulnerableState(move);
      if (move.effect === 'EFFECT_SKULL_BASH') {
        applyDirectStageChange(attacker, 'defense', 1, messages);
      }
      pushMessage(messages, battle, `${attacker.species} began charging ${move.name}!`);
      return messages;
    }

    if (isChargingSecondTurn) {
      attacker.volatile.chargingMoveId = null;
      attacker.volatile.semiInvulnerable = null;
    }

    if (move.effect === 'EFFECT_FUTURE_SIGHT') {
      runBattleScriptCommand(battle, 'trysetfutureattack', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        useFutureAttack
      });
      return messages;
    }

    const primaryStatusBeforeAccuracy = primaryStatusByEffect[move.effect];
    if (primaryStatusBeforeAccuracy) {
      if (move.effect === 'EFFECT_PARALYZE') {
        runBattleScriptCommand(battle, 'typecalc', {
          move,
          defender,
          getBattleTypeEffectiveness
        });
      }
      if (isPrimaryStatusBlockedBeforeAccuracy(primaryStatusBeforeAccuracy, defender, move)) {
        const typeBlocked =
          (primaryStatusBeforeAccuracy === 'paralysis' && move.type === 'electric' && defender.types.includes('ground'))
          || ((primaryStatusBeforeAccuracy === 'poison' || primaryStatusBeforeAccuracy === 'badPoison') && (defender.types.includes('poison') || defender.types.includes('steel')))
          || (primaryStatusBeforeAccuracy === 'burn' && defender.types.includes('fire'));
        pushMessage(messages, battle, typeBlocked
          ? `It doesn't affect ${defender.species}...`
          : 'But it failed!');
        return messages;
      }
    }

    const accuracyResult = runBattleScriptCommand(battle, 'accuracycheck', {
      attackerSide,
      attacker,
      defender,
      move,
      encounterState,
      attemptAccuracy
    });
    if (battle.vm.locals.deferAttackStringAndPp === true) {
	      const deferredRuntime: BattleScriptCommandRuntime = {
	        attackerSide,
	        attackerBattlerId: options.attackerBattlerId,
	        defenderBattlerId: options.defenderBattlerId,
	        attacker,
        move,
        options,
        pushMessage: (text) => pushMessage(messages, battle, text),
        getActorLabel: () => getActorLabel(attackerSide, battle)
      };
      if (options.announce ?? true) {
        runBattleScriptCommand(battle, 'attackstring', deferredRuntime);
      }
      if (options.consumePp ?? true) {
        runBattleScriptCommand(battle, 'ppreduce', deferredRuntime);
      }
    }
    if (accuracyResult.missed) {
      pushMessage(messages, battle, 'The attack missed!');
      if (move.effect === 'EFFECT_FURY_CUTTER') {
        attacker.volatile.furyCutterCounter = 0;
      } else if (move.effect === 'EFFECT_ROLLOUT') {
        attacker.volatile.rolloutCounter = 0;
      }
      if (move.effect === 'EFFECT_RECOIL_IF_MISS' && getBattleTypeEffectiveness(move, defender) !== 0) {
        const crashDamage = Math.min(
          Math.max(1, Math.floor(calculateDamageRoll(battle, defenderSide, attacker, defender, move, encounterState, false) / 2)),
          Math.max(1, Math.floor(defender.maxHp / 2))
        );
        attacker.hp = Math.max(0, attacker.hp - crashDamage);
        deps.applyQueuedDamage?.(battle, attackerSide, attacker.hp);
        pushMessage(messages, battle, `${attacker.species} kept going and crashed!`);
      }
      return messages;
    }

    if (move.effect === 'EFFECT_OHKO') {
      const typeCalcResult = runBattleScriptCommand(battle, 'typecalc', {
        move,
        defender,
        getBattleTypeEffectiveness
      });
      if (defender.abilityId === 'STURDY') {
        pushMessage(messages, battle, `${defender.species}'s Sturdy made it ineffective!`);
        return messages;
      }
      if (attacker.level < defender.level) {
        pushMessage(messages, battle, 'But it failed!');
        return messages;
      }
      if ((typeCalcResult.typeEffectiveness ?? getBattleTypeEffectiveness(move, defender)) === 0) {
        pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
        return messages;
      }
      damageBattler(battle, defenderSide, defender, defender.hp, move, messages);
      runBattleScriptCommand(battle, 'healthbarupdate', { defender });
      runBattleScriptCommand(battle, 'datahpupdate', { defender });
      pushMessage(messages, battle, "It's a one-hit KO!");
      runBattleScriptCommand(battle, 'tryfaintmon');
      applyFaintRetaliation(battle, attackerSide, defenderSide, attacker, defender, move, messages);
      return messages;
    }

    if (move.effect === 'EFFECT_BEAT_UP') {
      useBeatUp(battle, attackerSide, defenderSide, defender, move, encounterState, messages);
      runBattleScriptCommand(battle, 'tryfaintmon');
      applyFaintRetaliation(battle, attackerSide, defenderSide, attacker, defender, move, messages);
      return messages;
    }

    let moveForDamage = move;
    if (move.effect === 'EFFECT_PRESENT') {
      const presentResult = runBattleScriptCommand(battle, 'presentdamagecalculation', {
        attackerSide,
        defenderSide,
        attacker,
        defender,
        move,
        encounterState,
        messages,
        pushMessage: (text) => pushMessage(messages, battle, text),
        nextBattleRng,
        healBattler
      });
      if (presentResult.stopped) {
        return messages;
      }
      moveForDamage = presentResult.move ?? moveForDamage;
    }

    const dynamicDamageCommand = dynamicDamageCommandByEffect[moveForDamage.effect];
    const dynamicMoveResult = dynamicDamageCommand
      ? runBattleScriptCommand(battle, dynamicDamageCommand, {
        attackerSide,
        defenderSide,
        attacker,
        defender,
        move: moveForDamage,
        encounterState,
        messages,
        getMoveWithDynamicPower
      })
      : {};
    const effectiveMove = dynamicMoveResult.move
      ?? getMoveWithDynamicPower(moveForDamage, attacker, defender, battle, encounterState, messages);
    const counterDamageCommand = counterDamageCommandByEffect[move.effect];
    const counterMirrorDamage = counterDamageCommand
      ? runBattleScriptCommand(battle, counterDamageCommand, {
        attackerSide,
        attacker,
        move,
        getCounterMirrorDamage
      }).damage ?? null
      : getCounterMirrorDamage(move, attackerSide, attacker);
    if (counterMirrorDamage !== null) {
	      const typeCalcResult = runBattleScriptCommand(battle, 'typecalc2', {
	        move: effectiveMove,
	        defender,
	        getBattleTypeEffectiveness
	      });
      if ((typeCalcResult.typeEffectiveness ?? getBattleTypeEffectiveness(effectiveMove, defender)) === 0) {
        pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
        return messages;
      }

	      runBattleScriptCommand(battle, 'adjustsetdamage', { damage: counterMirrorDamage });
	      damageBattler(battle, defenderSide, defender, counterMirrorDamage, effectiveMove, messages);
      runBattleScriptCommand(battle, 'healthbarupdate', { defender });
      runBattleScriptCommand(battle, 'datahpupdate', { defender });
      if (defender.hp === 0) {
        runBattleScriptCommand(battle, 'tryfaintmon');
        applyFaintRetaliation(battle, attackerSide, defenderSide, attacker, defender, move, messages);
      }
      return messages;
    } else if (move.effect === 'EFFECT_COUNTER' || move.effect === 'EFFECT_MIRROR_COAT') {
      pushMessage(messages, battle, 'But it failed!');
      return messages;
    }

    if (move.effect === 'EFFECT_BRICK_BREAK') {
      const targetSideState = battle.sideState[defenderSide];
      if (targetSideState.reflectTurns > 0 || targetSideState.lightScreenTurns > 0) {
        targetSideState.reflectTurns = 0;
        targetSideState.lightScreenTurns = 0;
        messages.push(`${defender.species}'s barriers were shattered!`);
      }
    }

    const fixedDamageCommand = fixedDamageCommandByEffect[move.effect];
    const fixedDamage = fixedDamageCommand
      ? runBattleScriptCommand(battle, fixedDamageCommand, {
        attacker,
        defender,
        move: effectiveMove,
        encounterState,
        calculateFixedDamage
      }).damage ?? null
      : calculateFixedDamage(effectiveMove, attacker, defender, encounterState);
    if (move.effect === 'EFFECT_ENDEAVOR') {
      const typeCalcResult = runBattleScriptCommand(battle, 'typecalc', {
        move: effectiveMove,
        defender,
        getBattleTypeEffectiveness
      });
      const typeEffectiveness = typeCalcResult.typeEffectiveness ?? getBattleTypeEffectiveness(effectiveMove, defender);
      if (typeEffectiveness === 0) {
        pushMessage(messages, battle, `It doesn't affect ${defender.species}...`);
        return messages;
      }

      if (defender.hp <= attacker.hp) {
        pushMessage(messages, battle, 'But it failed!');
        return messages;
      }

      damageBattler(battle, defenderSide, defender, defender.hp - attacker.hp, effectiveMove, messages);
      runBattleScriptCommand(battle, 'healthbarupdate', { defender });
      runBattleScriptCommand(battle, 'datahpupdate', { defender });
      runBattleScriptCommand(battle, 'tryfaintmon');
      applyFaintRetaliation(battle, attackerSide, defenderSide, attacker, defender, move, messages);
      rememberLandedMove(battle, attackerSide, defenderSide, defender, effectiveMove, options.attackerBattlerId, options.defenderBattlerId);
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
    } else if (fixedDamage !== null) {
      const typeCalcResult = runBattleScriptCommand(battle, 'typecalc', {
        move: effectiveMove,
        defender,
        getBattleTypeEffectiveness
      });
      const typeEffectiveness = typeCalcResult.typeEffectiveness ?? getBattleTypeEffectiveness(effectiveMove, defender);
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
      runBattleScriptCommand(battle, 'healthbarupdate', { defender });
      runBattleScriptCommand(battle, 'datahpupdate', { defender });
      runBattleScriptCommand(battle, 'tryfaintmon');
      applyFaintRetaliation(battle, attackerSide, defenderSide, attacker, defender, move, messages);
      rememberLandedMove(battle, attackerSide, defenderSide, defender, effectiveMove, options.attackerBattlerId, options.defenderBattlerId);
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
    } else if (effectiveMove.power > 0 || isDirectHitEffect(effectiveMove)) {
      runBattleScriptCommand(battle, 'critcalc', { critical: false });
      runBattleScriptCommand(battle, 'damagecalc');
      const typeCalcResult = runBattleScriptCommand(battle, 'typecalc', {
        move: effectiveMove,
        defender,
        getBattleTypeEffectiveness
      });
      runBattleScriptCommand(battle, 'adjustnormaldamage');
      const typeEffectiveness = typeCalcResult.typeEffectiveness ?? getBattleTypeEffectiveness(effectiveMove, defender);
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
        const hitCritical = isCriticalHit(hitMove, attacker, defender, encounterState);
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

      runBattleScriptCommand(battle, 'healthbarupdate', { defender });
      runBattleScriptCommand(battle, 'datahpupdate', { defender });
      if (critical) {
        runBattleScriptCommand(battle, 'critmessage', { critical });
        pushMessage(messages, battle, 'A critical hit!');
      }

      if (typeEffectiveness > 1) {
        runBattleScriptCommand(battle, 'resultmessage', {
          typeEffectiveness,
          pushMessage: (text) => pushMessage(messages, battle, text)
        });
      } else if (typeEffectiveness < 1) {
        runBattleScriptCommand(battle, 'resultmessage', {
          typeEffectiveness,
          pushMessage: (text) => pushMessage(messages, battle, text)
        });
      }

      if (!hitSubstitute) {
        maybeApplySecondaryStatus(move, defender, defenderSide, battle, encounterState, messages);
        maybeApplySecondaryStageEffect(move, attacker, defender, attackerSide, defenderSide, battle, encounterState, messages);
        maybeApplySecondaryConfusion(move, defender, encounterState, messages);
        applySecretPowerEffect(battle, move, defender, defenderSide, defenderCanStillAct, encounterState, messages);
        maybeApplyFlinch(move, defender, defenderCanStillAct, encounterState);
        maybeApplyKingsRock(attacker, defender, move, damage, defenderCanStillAct, encounterState);
        if (damage > 0) {
          applyPostHitItemEffect(attacker, defender, move, messages);
        }
      }

      if (damage > 0 && move.effect === 'EFFECT_FURY_CUTTER') {
        attacker.volatile.furyCutterCounter = Math.min(5, attacker.volatile.furyCutterCounter + 1);
      } else if (damage > 0 && move.effect === 'EFFECT_ROLLOUT') {
        attacker.volatile.rolloutCounter = attacker.volatile.rolloutCounter >= 4 ? 0 : attacker.volatile.rolloutCounter + 1;
      } else if (damage > 0 && move.effect === 'EFFECT_SPIT_UP') {
        attacker.volatile.stockpile = 0;
      }

      if (damage > 0 && move.effect === 'EFFECT_RAMPAGE') {
        runBattleScriptCommand(battle, 'seteffectprimary', {
          attackerSide,
          attacker,
          defender,
          move,
          moveEffect: 'MOVE_EFFECT_RAMPAGE',
          encounterState,
          nextBattleRng
        });
      } else if (damage > 0 && move.effect === 'EFFECT_UPROAR') {
        runBattleScriptCommand(battle, 'seteffectprimary', {
          attackerSide,
          attacker,
          defender,
          move,
          moveEffect: 'MOVE_EFFECT_UPROAR',
          encounterState,
          nextBattleRng,
          pushMessage: (text) => messages.push(text)
        });
      }

      if (damage > 0 && move.effect === 'EFFECT_SUPERPOWER') {
        applyDirectStageChange(attacker, 'attack', -1, messages);
        applyDirectStageChange(attacker, 'defense', -1, messages);
      } else if (damage > 0 && move.effect === 'EFFECT_OVERHEAT') {
        applyDirectStageChange(attacker, 'spAttack', -2, messages);
      } else if (damage > 0 && move.effect === 'EFFECT_PAY_DAY') {
        runBattleScriptCommand(battle, 'seteffectprimary', {
          attackerSide,
          attacker,
          defender,
          move,
          moveEffect: 'MOVE_EFFECT_PAYDAY',
          pushMessage: (text) => messages.push(text)
        });
      } else if (damage > 0 && move.effect === 'EFFECT_RAGE') {
        runBattleScriptCommand(battle, 'seteffectprimary', {
          attackerSide,
          attacker,
          defender,
          move,
          moveEffect: 'MOVE_EFFECT_RAGE'
        });
      } else if (damage > 0 && move.effect === 'EFFECT_TWINEEDLE') {
        applyStatusEffect(defender, 'poison', messages, move, '', encounterState, battle, defenderSide);
      } else if (damage > 0 && move.effect === 'EFFECT_SMELLINGSALT' && defender.status === 'paralysis') {
        runBattleScriptCommand(battle, 'clearstatusfromeffect', {
          attackerSide,
          attacker,
          defender,
          move,
          pushMessage: (text) => messages.push(text)
        });
      } else if (damage > 0 && move.effect === 'EFFECT_RAPID_SPIN') {
        runBattleScriptCommand(battle, 'rapidspinfree', {
          attackerSide,
          attacker,
          defender,
          move,
          pushMessage: (text) => messages.push(text)
        });
      } else if (damage > 0 && move.effect === 'EFFECT_TRAP' && defender.volatile.trapTurns <= 0) {
        runBattleScriptCommand(battle, 'seteffectprimary', {
          attackerSide,
          attacker,
          defender,
          move,
          moveEffect: 'MOVE_EFFECT_WRAP',
          encounterState,
          nextBattleRng,
          pushMessage: (text) => messages.push(text)
        });
      } else if (damage > 0 && move.effect === 'EFFECT_RECHARGE') {
        runBattleScriptCommand(battle, 'seteffectprimary', {
          attackerSide,
          attacker,
          defender,
          move,
          moveEffect: 'MOVE_EFFECT_RECHARGE'
        });
      }

      if (damage > 0 && move.effect === 'EFFECT_RAMPAGE' && attacker.volatile.rampageTurns > 0) {
        runBattleScriptCommand(battle, 'confuseifrepeatingattackends', {
          attackerSide,
          attacker,
          defender,
          move,
          encounterState,
          messages,
          applyConfusion: deps.applyConfusion
        });
      } else if (damage > 0 && move.effect === 'EFFECT_UPROAR' && attacker.volatile.uproarTurns > 0) {
        runBattleScriptCommand(battle, 'confuseifrepeatingattackends', {
          attackerSide,
          attacker,
          defender,
          move,
          encounterState,
          messages,
          pushMessage: (text) => messages.push(text)
        });
      }

      runBattleScriptCommand(battle, 'tryfaintmon');
      applyFaintRetaliation(battle, attackerSide, defenderSide, attacker, defender, move, messages);
      if (hitsLanded > 0) {
        rememberLandedMove(battle, attackerSide, defenderSide, defender, effectiveMove, options.attackerBattlerId, options.defenderBattlerId);
        rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
      }

      if (move.effect === 'EFFECT_RECOIL' && attacker.abilityId !== 'ROCK_HEAD') {
        const recoil = Math.max(1, Math.floor(damage / 4));
        attacker.hp = Math.max(0, attacker.hp - recoil);
        deps.applyQueuedDamage?.(battle, attackerSide, attacker.hp);
        pushMessage(messages, battle, `${attacker.species} is hit with recoil!`);
      } else if (move.effect === 'EFFECT_DOUBLE_EDGE' && attacker.abilityId !== 'ROCK_HEAD') {
        const recoil = Math.max(1, Math.floor(damage / 3));
        attacker.hp = Math.max(0, attacker.hp - recoil);
        deps.applyQueuedDamage?.(battle, attackerSide, attacker.hp);
        pushMessage(messages, battle, `${attacker.species} is hit with recoil!`);
      } else if (move.effect === 'EFFECT_EXPLOSION') {
        attacker.hp = 0;
        deps.applyQueuedDamage?.(battle, attackerSide, attacker.hp);
      }

      if (!hitSubstitute && (move.effect === 'EFFECT_ABSORB' || move.effect === 'EFFECT_DREAM_EATER')) {
        healBattler(battle, attackerSide, attacker, Math.floor(damage / 2), messages);
      }
      deps.maybeApplyShellBell?.(battle, attackerSide, attacker, damage, messages);
    } else if (primaryStatusByEffect[move.effect]) {
      const primaryStatus = primaryStatusByEffect[move.effect];
      if (primaryStatus) {
        runBattleScriptCommand(battle, 'setmoveeffect', { move });
        runBattleScriptCommand(battle, 'seteffectprimary', { moveEffect: primaryStatus });
        applyStatusEffect(defender, primaryStatus, messages, move, 'But it failed!', encounterState, battle, defenderSide);
        runBattleScriptCommand(battle, 'resultmessage');
      }
    } else if (move.effect === 'EFFECT_CONFUSE') {
      deps.applyConfusion?.(defender, encounterState, messages);
    } else if (applySideCondition(battle, attackerSide, move, messages)) {
      // Message already appended.
    } else if (applyWeatherMove(battle, move, messages)) {
      // Message already appended.
    } else if (move.effect === 'EFFECT_SUBSTITUTE') {
      runBattleScriptCommand(battle, 'setsubstitute', {
        attackerSide,
        attacker,
        defender,
        move,
        applyQueuedDamage: deps.applyQueuedDamage,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_LEECH_SEED') {
      runBattleScriptCommand(battle, 'setseeded', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_HAZE') {
      runBattleScriptCommand(battle, 'normalisebuffs', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_FOCUS_ENERGY') {
      runBattleScriptCommand(battle, 'setfocusenergy', {
        attackerSide,
        attacker,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_TRANSFORM') {
      runBattleScriptCommand(battle, 'transformdataexecution', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        applyTransform
      });
    } else if (move.effect === 'EFFECT_CONVERSION') {
      runBattleScriptCommand(battle, 'tryconversiontypechange', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        messages,
        applyConversion
      });
    } else if (move.effect === 'EFFECT_CONVERSION_2') {
      runBattleScriptCommand(battle, 'settypetorandomresistance', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        messages,
        applyConversion2
      });
    } else if (move.effect === 'EFFECT_LOCK_ON') {
      runBattleScriptCommand(battle, 'setalwayshitflag', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_DISABLE') {
      runBattleScriptCommand(battle, 'disablelastusedattack', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        getLastUsedMove,
        nextBattleRng,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_ENCORE') {
      runBattleScriptCommand(battle, 'trysetencore', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        getLastUsedMove,
        nextBattleRng,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_SPITE') {
      runBattleScriptCommand(battle, 'tryspiteppreduce', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        getLastUsedMove,
        nextBattleRng,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_SPLASH') {
      messages.push('But nothing happened!');
    } else if (move.effect === 'EFFECT_SPIKES') {
      runBattleScriptCommand(battle, 'trysetspikes', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_ATTRACT') {
      runBattleScriptCommand(battle, 'tryinfatuating', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_TORMENT') {
      runBattleScriptCommand(battle, 'settorment', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_DESTINY_BOND') {
      runBattleScriptCommand(battle, 'setdestinybond', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_GRUDGE') {
      runBattleScriptCommand(battle, 'trysetgrudge', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_FORESIGHT') {
      runBattleScriptCommand(battle, 'setforesight', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_CURSE') {
      if (attacker.types.includes('ghost')) {
        runBattleScriptCommand(battle, 'cursetarget', {
          attackerSide,
          attacker,
          defender,
          move,
          applyQueuedDamage: deps.applyQueuedDamage,
          pushMessage: (text) => messages.push(text)
        });
      } else {
        applyDirectStageChange(attacker, 'speed', -1, messages);
        applyDirectStageChange(attacker, 'attack', 1, messages);
        applyDirectStageChange(attacker, 'defense', 1, messages);
      }
    } else if (move.effect === 'EFFECT_STOCKPILE') {
      runBattleScriptCommand(battle, 'stockpile', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_SWALLOW') {
      runBattleScriptCommand(battle, 'stockpiletohpheal', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        healBattler,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_CHARGE') {
      runBattleScriptCommand(battle, 'setcharge', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_MUD_SPORT') {
      runBattleScriptCommand(battle, 'settypebasedhalvers', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_WATER_SPORT') {
      runBattleScriptCommand(battle, 'settypebasedhalvers', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_TEETER_DANCE') {
      if (battle.sideState[defenderSide].safeguardTurns > 0) {
        messages.push(`${defender.species}'s team is protected by Safeguard!`);
      } else {
        deps.applyConfusion?.(defender, encounterState, messages);
      }
    } else if (move.effect === 'EFFECT_CAMOUFLAGE') {
      runBattleScriptCommand(battle, 'settypetoterrain', {
        attackerSide,
        attacker,
        defender,
        move,
        typeByTerrain: deps.typeByTerrain,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_MEAN_LOOK') {
      runBattleScriptCommand(battle, 'setmoveeffect', {
        attackerSide,
        attacker,
        defender,
        moveEffect: 'MOVE_EFFECT_PREVENT_ESCAPE'
      });
      runBattleScriptCommand(battle, 'seteffectprimary', {
        attackerSide,
        attacker,
        defender,
        moveEffect: 'MOVE_EFFECT_PREVENT_ESCAPE',
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_INGRAIN') {
      runBattleScriptCommand(battle, 'trysetroots', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_MINIMIZE') {
      runBattleScriptCommand(battle, 'setminimize', {
        attackerSide,
        attacker,
        defender,
        move
      });
      applyDirectStageChange(attacker, 'evasion', 1, messages);
    } else if (move.effect === 'EFFECT_DEFENSE_CURL') {
      runBattleScriptCommand(battle, 'setdefensecurlbit', {
        attackerSide,
        attacker,
        defender,
        move
      });
      applyDirectStageChange(attacker, 'defense', 1, messages);
    } else if (move.effect === 'EFFECT_PSYCH_UP') {
      runBattleScriptCommand(battle, 'copyfoestats', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_SWAGGER' || move.effect === 'EFFECT_FLATTER') {
      applyDirectStageChange(defender, move.effect === 'EFFECT_SWAGGER' ? 'attack' : 'spAttack', move.effect === 'EFFECT_SWAGGER' ? 2 : 1, messages);
      if (battle.sideState[defenderSide].safeguardTurns > 0) {
        messages.push(`${defender.species}'s team is protected by Safeguard!`);
      } else {
        deps.applyConfusion?.(defender, encounterState, messages);
      }
    } else if (move.effect === 'EFFECT_MEMENTO') {
      const mementoResult = runBattleScriptCommand(battle, 'trymemento', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        applyDirectStageChange,
        pushMessage: (text) => messages.push(text)
      });
      if (!mementoResult.failed) {
        runBattleScriptCommand(battle, 'setatkhptozero', {
          attackerSide,
          attacker,
          defender,
          move,
          applyQueuedDamage: deps.applyQueuedDamage
        });
      }
    } else if (move.effect === 'EFFECT_TAUNT') {
      runBattleScriptCommand(battle, 'settaunt', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_ENDURE') {
      runBattleScriptCommand(battle, 'setprotectlike', {
        attackerSide,
        attacker,
        defender,
        move,
        encounterState,
        messages,
        defenderCanStillAct,
        tryUseProtect
      });
    } else if (move.effect === 'EFFECT_BELLY_DRUM') {
      runBattleScriptCommand(battle, 'maxattackhalvehp', {
        attackerSide,
        attacker,
        defender,
        move,
        applyQueuedDamage: deps.applyQueuedDamage,
        pushMessage: (text) => messages.push(text)
      });
    } else if (applyComboStageMove(move, battle, attackerSide, defenderSide, attacker, defender, messages)) {
      // Message already appended.
    } else if (move.effect === 'EFFECT_YAWN') {
      runBattleScriptCommand(battle, 'setyawn', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_NIGHTMARE') {
      runBattleScriptCommand(battle, 'setmoveeffect', {
        attackerSide,
        attacker,
        defender,
        moveEffect: 'MOVE_EFFECT_NIGHTMARE'
      });
      runBattleScriptCommand(battle, 'seteffectprimary', {
        attackerSide,
        attacker,
        defender,
        moveEffect: 'MOVE_EFFECT_NIGHTMARE',
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_PERISH_SONG') {
      runBattleScriptCommand(battle, 'trysetperishsong', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_REFRESH') {
      runBattleScriptCommand(battle, 'cureifburnedparalysedorpoisoned', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_HEAL_BELL') {
      runBattleScriptCommand(battle, 'healpartystatus', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_PAIN_SPLIT') {
      runBattleScriptCommand(battle, 'painsplitdmgcalc', {
        attackerSide,
        attacker,
        defender,
        move,
        applyQueuedDamage: deps.applyQueuedDamage,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_TRICK') {
      runBattleScriptCommand(battle, 'tryswapitems', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        useTrick
      });
    } else if (move.effect === 'EFFECT_RECYCLE') {
      runBattleScriptCommand(battle, 'tryrecycleitem', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        useRecycle
      });
    } else if (move.effect === 'EFFECT_BATON_PASS') {
      useBatonPass(battle, attackerSide, attacker, messages);
    } else if (move.effect === 'EFFECT_FOLLOW_ME') {
      runBattleScriptCommand(battle, 'setforcedtarget', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_HELPING_HAND') {
      runBattleScriptCommand(battle, 'trysethelpinghand', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_MAGIC_COAT') {
      runBattleScriptCommand(battle, 'trysetmagiccoat', {
        attackerSide,
        attacker,
        defender,
        move,
        defenderCanStillAct,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_IMPRISON') {
      runBattleScriptCommand(battle, 'tryimprison', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_SNATCH') {
      runBattleScriptCommand(battle, 'trysetsnatch', {
        attackerSide,
        attacker,
        defender,
        move,
        defenderCanStillAct,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_ROLE_PLAY') {
      runBattleScriptCommand(battle, 'trycopyability', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_SKILL_SWAP') {
      runBattleScriptCommand(battle, 'tryswapabilities', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_WISH') {
      runBattleScriptCommand(battle, 'trywish', {
        attackerSide,
        attacker,
        defender,
        move,
        pushMessage: (text) => messages.push(text)
      });
    } else if (move.effect === 'EFFECT_RESTORE_HP') {
      runBattleScriptCommand(battle, 'tryhealhalfhealth', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        healBattler
      });
    } else if (move.effect === 'EFFECT_MORNING_SUN' || move.effect === 'EFFECT_SYNTHESIS' || move.effect === 'EFFECT_MOONLIGHT') {
      runBattleScriptCommand(battle, 'recoverbasedonsunlight', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        healBattler
      });
    } else if (move.effect === 'EFFECT_SOFTBOILED') {
      runBattleScriptCommand(battle, 'tryhealhalfhealth', {
        attackerSide,
        attacker,
        defender,
        move,
        messages,
        healBattler
      });
    } else if (move.effect === 'EFFECT_REST') {
      runBattleScriptCommand(battle, 'trysetrest', {
        attackerSide,
        attacker,
        defender,
        move,
        applyQueuedDamage: deps.applyQueuedDamage,
        pushMessage: (text) => messages.push(text)
      });
    } else if (stageEffectRuntimeByMoveEffect[move.effect]) {
      runBattleScriptCommand(battle, 'statbuffchange', {
        attackerSide,
        attacker,
        defender,
        move
      });
      if (!applyStageEffect(move.effect, attacker, defender, messages, battle, attackerSide, defenderSide)) {
        pushMessage(messages, battle, 'But nothing happened!');
      }
    } else if (!applyStageEffect(move.effect, attacker, defender, messages, battle, attackerSide, defenderSide)) {
      pushMessage(messages, battle, 'But nothing happened!');
    }

    if (defender.hp === 0 && !messages.includes(getFaintMessage(defenderSide, battle))) {
      runBattleScriptCommand(battle, 'tryfaintmon');
      pushMessage(messages, battle, getFaintMessage(defenderSide, battle));
    }
    if (attacker.hp === 0 && !messages.includes(getFaintMessage(attackerSide, battle))) {
      runBattleScriptCommand(battle, 'tryfaintmon');
      pushMessage(messages, battle, getFaintMessage(attackerSide, battle));
    }

    if (move.target !== 'MOVE_TARGET_USER' && shouldRememberTakenMoveFromMessages(defender, messages)) {
      rememberLandedMove(battle, attackerSide, defenderSide, defender, move, options.attackerBattlerId, options.defenderBattlerId);
      rememberTakenMove(battle, attackerSide, defenderSide, attacker, defender, move, options.attackerBattlerId, options.defenderBattlerId);
    }

    return messages;
  } finally {
    if (moveWasAttempted) {
      runBattleScriptCommand(battle, 'moveendall');
    }
	    finalizeBattleMoveVm(
	      battle,
	      attackerSide,
	      attacker,
	      move,
      {
        moveWasAttempted,
        resultingMoveHandledByCalledMove
      },
      {
	        choiceBandActive: moveWasAttempted
	          && getHeldItemHoldEffect(attacker) === 'HOLD_EFFECT_CHOICE_BAND'
	          && move.id !== 'STRUGGLE'
	          && !getChoicedMoveId(attacker)
	          && !(move.effect === 'EFFECT_BATON_PASS' && !messages.includes('But it failed!')),
	        skipLastSuccessfulMove: move.effect === 'EFFECT_BATON_PASS',
	        attackerBattlerId: options.attackerBattlerId
	      }
	    );
  }
};
