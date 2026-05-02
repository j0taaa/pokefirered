import type { SerializedBattleTraceSnapshot } from './battleTraceSerializer';
import { getDecompMoveConstant, getDecompSpeciesConstant } from './decompBattleConstants';

export interface ComparableOracleBattler {
  battlerId: number;
  side: 'player' | 'opponent';
  partyIndex: number | null;
  absent: boolean;
  species: number | null;
  hp: number | null;
  maxHp: number | null;
  status: number;
  chosen: number | null;
  printed: number | null;
  result: number | null;
  landed: number | null;
}

export interface ComparableBattleOracle {
  fixtureId: string;
  mode: 'wild' | 'trainer';
  phase: 'command' | 'shiftPrompt' | 'resolved';
  turn: number;
  outcome: number;
  battlers: ComparableOracleBattler[];
  events: Array<{
    kind: string;
    battler: number;
    value: number;
    extra: number;
  }>;
}

const statusToDecompValue = (status: string | null): number => {
  switch (status) {
    case 'poison':
      return 1 << 3;
    case 'badPoison':
      return 1 << 7;
    case 'burn':
      return 1 << 4;
    case 'freeze':
      return 1 << 5;
    case 'paralysis':
      return 1 << 6;
    case 'sleep':
      return 1;
    default:
      return 0;
  }
};

const outcomeToDecompValue = (outcome: SerializedBattleTraceSnapshot['postResult']['outcome']): number => {
  switch (outcome) {
    case 'won':
      return 1;
    case 'lost':
      return 2;
    case 'caught':
      return 7;
    case 'escaped':
      return 4;
    default:
      return 0;
  }
};

const normalizeMode = (mode: SerializedBattleTraceSnapshot['mode']): 'wild' | 'trainer' =>
  mode === 'trainer' ? 'trainer' : 'wild';

const normalizePhase = (phase: SerializedBattleTraceSnapshot['phase']): 'command' | 'shiftPrompt' | 'resolved' => {
  if (phase === 'shiftPrompt') {
    return 'shiftPrompt';
  }
  if (phase === 'resolved') {
    return 'resolved';
  }
  return 'command';
};

const battlerSideToDecompId = (side: 'player' | 'opponent' | undefined): number =>
  side === 'opponent' ? 1 : 0;

const getComparableChosenMove = (
  snapshot: SerializedBattleTraceSnapshot,
  battler: SerializedBattleTraceSnapshot['battlers'][number]
): number | null => {
  if (snapshot.vm.locals.turnResolver !== 'enemyOnly' || battler.side !== 'opponent') {
    return null;
  }
  return getDecompMoveConstant(battler.moveMemory.chosenMoveId);
};

export const serializeComparableBattleOracle = (
  fixtureId: string,
  snapshot: SerializedBattleTraceSnapshot
): ComparableBattleOracle => ({
  fixtureId,
  mode: normalizeMode(snapshot.mode),
  phase: normalizePhase(snapshot.phase),
  turn: snapshot.turn,
  outcome: outcomeToDecompValue(snapshot.postResult.outcome),
  battlers: snapshot.battlers
    .filter((battler) => battler.active)
    .map((battler) => ({
      battlerId: battler.battlerId,
      side: battler.side,
      partyIndex: battler.partyIndex,
      absent: battler.absent,
      species: getDecompSpeciesConstant(battler.species),
      hp: battler.hp,
      maxHp: battler.maxHp,
      status: statusToDecompValue(battler.status),
      chosen: getComparableChosenMove(snapshot, battler),
      printed: getDecompMoveConstant(battler.moveMemory.printedMoveId),
      result: getDecompMoveConstant(battler.moveMemory.resultingMoveId),
      landed: getDecompMoveConstant(battler.moveMemory.landedMoveId)
    })),
  events: snapshot.trace
    .filter((event) => event.type === 'chooseAction' || event.type === 'unknown')
    .map((event) => ({
      kind: event.type,
      battler: event.battlerId ?? battlerSideToDecompId(event.battler),
      value: event.value ?? 0,
      extra: event.extra ?? 0
    }))
});
