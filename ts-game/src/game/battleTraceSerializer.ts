import type { BattleMoveMemory, BattleState, BattleTraceEvent } from './battle';
import { getBattlePostResult, getBattlerMoveMemory, getBattlerSnapshot } from './battle';

export interface SerializedBattleMoveMemory {
  chosenMoveId: string | null;
  currentMoveId: string | null;
  calledMoveId: string | null;
  printedMoveId: string | null;
  resultingMoveId: string | null;
  landedMoveId: string | null;
  takenMoveId: string | null;
  lastHitByBattler: string | null;
  lastMoveTargetBattler: string | null;
}

export interface SerializedBattleBattlerState {
  battlerId: number;
  side: 'player' | 'opponent';
  partyIndex: number | null;
  active: boolean;
  absent: boolean;
  species: string | null;
  hp: number | null;
  maxHp: number | null;
  status: string | null;
  moveMemory: SerializedBattleMoveMemory;
}

export interface SerializedBattleTraceSnapshot {
  mode: BattleState['mode'];
  format: BattleState['format'];
  controlMode: BattleState['controlMode'];
  phase: BattleState['phase'];
  turn: number;
  currentScriptLabel: string | null;
  vm: {
    currentLabel: string | null;
    pc: number;
    callStackDepth: number;
    locals: Record<string, string | number | boolean | null>;
    pendingCommands: BattleState['vm']['pendingCommands'];
    pendingMessages: string[];
  };
  postResult: ReturnType<typeof getBattlePostResult>;
  battlers: SerializedBattleBattlerState[];
  trace: BattleTraceEvent[];
}

const serializeMoveMemory = (memory: BattleMoveMemory): SerializedBattleMoveMemory => ({
  chosenMoveId: memory.chosenMoveId,
  currentMoveId: memory.currentMoveId,
  calledMoveId: memory.calledMoveId,
  printedMoveId: memory.printedMoveId,
  resultingMoveId: memory.resultingMoveId,
  landedMoveId: memory.landedMoveId,
  takenMoveId: memory.takenMoveId,
  lastHitByBattler: memory.lastHitByBattler === null ? null : String(memory.lastHitByBattler),
  lastMoveTargetBattler: memory.lastMoveTargetBattler === null ? null : String(memory.lastMoveTargetBattler)
});

const emptyMoveMemory = (): BattleMoveMemory => ({
  chosenMoveId: null,
  currentMoveId: null,
  calledMoveId: null,
  printedMoveId: null,
  resultingMoveId: null,
  landedMoveId: null,
  takenMoveId: null,
  lastHitByBattler: null,
  lastMoveTargetBattler: null
});

export const serializeBattleTrace = (battle: BattleState): SerializedBattleTraceSnapshot => ({
  mode: battle.mode,
  format: battle.format,
  controlMode: battle.controlMode,
  phase: battle.phase,
  turn: battle.battleTurnCounter,
  currentScriptLabel: battle.currentScriptLabel,
  vm: {
    currentLabel: battle.vm.currentLabel,
    pc: battle.vm.pc,
    callStackDepth: battle.vm.callStack.length,
    locals: { ...battle.vm.locals },
    pendingCommands: battle.vm.pendingCommands.map((command) => ({ ...command })),
    pendingMessages: [...battle.vm.pendingMessages]
  },
  postResult: getBattlePostResult(battle),
  battlers: battle.battlers.map((battler) => {
    const snapshot = getBattlerSnapshot(battle, battler.battlerId);
    return {
      battlerId: battler.battlerId,
      side: battler.side,
      partyIndex: battler.partyIndex,
      active: battler.active,
      absent: battler.absent,
      species: snapshot?.species ?? null,
      hp: snapshot?.hp ?? null,
      maxHp: snapshot?.maxHp ?? null,
      status: snapshot?.status ?? null,
      moveMemory: snapshot ? serializeMoveMemory(getBattlerMoveMemory(battle, battler.battlerId)) : serializeMoveMemory(emptyMoveMemory())
    };
  }),
  trace: battle.battleTrace.map((event) => ({ ...event }))
});
