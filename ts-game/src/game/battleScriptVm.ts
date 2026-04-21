import type {
  BattleControllerCommand,
  BattleMove,
  BattlePokemonSnapshot,
  BattleSideId,
  BattleState
} from './battle';

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
  blackout: boolean;
  whiteout: boolean;
}

export interface BattleMoveVmPreludeOptions {
  consumePp?: boolean;
  announce?: boolean;
  sleepTalk?: boolean;
  preserveLastMoveUsed?: boolean;
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
  result.blackout = false;
  result.whiteout = false;
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
  battle.vm.pendingCommands = [];
  battle.vm.pendingMessages = [];
  battle.vm.locals.attackerSide = attackerSide;
  battle.vm.locals.moveId = move.id;
  battle.vm.locals.consumePp = options.consumePp ?? true;
  battle.vm.locals.announce = options.announce ?? true;
  emitCommand({ type: 'script', label: move.effectScriptLabel });
  battle.vm.pc += 1;

  if (!canMoveThisTurn()) {
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
    return {
      shouldContinue: false,
      moveWasAttempted: false,
      resultingMoveHandledByCalledMove: false,
      previousLastMoveUsedId
    };
  }

  if (consumePp && move.id !== 'STRUGGLE' && move.ppRemaining > 0) {
    move.ppRemaining -= 1;
    battle.vm.pc += 1;
  }

  if (move.effect === 'EFFECT_FOCUS_PUNCH' && attacker.volatile.tookDamageThisTurn) {
    pushMessage(`${attacker.species} lost its focus and couldn't move!`);
    return {
      shouldContinue: false,
      moveWasAttempted: false,
      resultingMoveHandledByCalledMove: false,
      previousLastMoveUsedId
    };
  }

  if (announce) {
    pushMessage(`${getActorLabel()} used ${move.name}!`);
    attacker.volatile.lastPrintedMoveId = move.id;
    battle.vm.pc += 1;
  }

  if (!options.preserveLastMoveUsed) {
    attacker.volatile.lastMoveUsedId = move.id;
  }

  return {
    shouldContinue: true,
    moveWasAttempted: true,
    resultingMoveHandledByCalledMove: false,
    previousLastMoveUsedId
  };
};

export const finalizeBattleMoveVm = (
  attacker: BattlePokemonSnapshot,
  move: BattleMove,
  {
    moveWasAttempted,
    resultingMoveHandledByCalledMove
  }: Pick<BattleMoveVmPreludeResult, 'moveWasAttempted' | 'resultingMoveHandledByCalledMove'>,
  {
    choiceBandActive,
    skipLastSuccessfulMove
  }: {
    choiceBandActive: boolean;
    skipLastSuccessfulMove?: boolean;
  }
): void => {
  if (choiceBandActive && move.id !== 'STRUGGLE' && !attacker.volatile.choicedMoveId) {
    attacker.volatile.choicedMoveId = move.id;
  }

  if (moveWasAttempted && !resultingMoveHandledByCalledMove && !skipLastSuccessfulMove) {
    attacker.volatile.lastSuccessfulMoveId = move.id;
  }
};
