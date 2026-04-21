import type { BattleState, BattleTraceEvent, BattleVolatileState } from './battle';
import { getBattlePostResult, getBattlerSnapshot } from './battle';

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

const serializeMoveMemory = (volatile: BattleVolatileState): SerializedBattleMoveMemory => ({
  chosenMoveId: volatile.choicedMoveId,
  currentMoveId: volatile.chargingMoveId ?? volatile.rampageMoveId ?? volatile.uproarMoveId,
  calledMoveId: volatile.lastSuccessfulMoveId,
  printedMoveId: volatile.lastPrintedMoveId,
  resultingMoveId: volatile.lastMoveUsedId,
  landedMoveId: volatile.lastLandedMoveId,
  takenMoveId: volatile.lastTakenMoveId,
  lastHitByBattler: volatile.lastDamagedBy,
  lastMoveTargetBattler: volatile.lockOnBy
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
      moveMemory: snapshot ? serializeMoveMemory(snapshot.volatile) : serializeMoveMemory({
        confusionTurns: 0,
        flinched: false,
        protected: false,
        protectUses: 0,
        substituteHp: 0,
        leechSeededBy: null,
        focusEnergy: false,
        enduring: false,
        rechargeTurns: 0,
        trapTurns: 0,
        trappedBy: null,
        yawnTurns: 0,
        nightmare: false,
        perishTurns: 0,
        tookDamageThisTurn: false,
        minimized: false,
        defenseCurl: false,
        tauntTurns: 0,
        furyCutterCounter: 0,
        rolloutCounter: 0,
        toxicCounter: 0,
        lastMoveUsedId: null,
        lastDamageTaken: 0,
        lastDamageCategory: null,
        lastDamagedBy: null,
        disabledMoveId: null,
        disableTurns: 0,
        encoreMoveId: null,
        encoreTurns: 0,
        escapePreventedBy: null,
        rooted: false,
        transformed: false,
        infatuatedBy: null,
        tormented: false,
        destinyBond: false,
        grudge: false,
        cursed: false,
        foresighted: false,
        stockpile: 0,
        chargeTurns: 0,
        lockOnBy: null,
        lockOnTurns: 0,
        activeTurns: 0,
        lastReceivedMoveType: null,
        lastLandedMoveId: null,
        lastTakenMoveId: null,
        lastPrintedMoveId: null,
        semiInvulnerable: null,
        chargingMoveId: null,
        rampageMoveId: null,
        rampageTurns: 0,
        uproarMoveId: null,
        uproarTurns: 0,
        rage: false,
        bideMoveId: null,
        bideTurns: 0,
        bideDamage: 0,
        bideTarget: null,
        lastSuccessfulMoveId: null,
        imprisoning: false,
        magicCoat: false,
        snatch: false,
        followMe: false,
        helpingHand: false,
        flashFire: false,
        choicedMoveId: null
      })
    };
  }),
  trace: battle.battleTrace.map((event) => ({ ...event }))
});
