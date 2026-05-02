import type { InputSnapshot } from '../input/inputState';
import {
  applyBattleRewards,
  createBattleEncounterState,
  createBattleState,
  startConfiguredBattle,
  stepBattle,
  type BattleEncounterState,
  type BattlePhase,
  type BattleStartConfig,
  type BattleState
} from './battle';
import {
  serializeBattleTrace,
  type SerializedBattleTraceSnapshot
} from './battleTraceSerializer';

export type BattleParityInputName =
  | 'none'
  | 'confirm'
  | 'cancel'
  | 'start'
  | 'up'
  | 'down'
  | 'left'
  | 'right';

export interface BattleParityStep {
  input?: BattleParityInputName;
  repeat?: number;
  untilPhase?: BattlePhase;
  maxSteps?: number;
  applyRewards?: boolean;
}

export interface BattleParityFixture {
  id: string;
  description: string;
  tags?: string[];
  nativeOracle?: boolean;
  encounterSeed?: number;
  startConfig?: BattleStartConfig;
  setup?: (battle: BattleState, encounter: BattleEncounterState) => void;
  steps: BattleParityStep[];
}

const neutralInput: InputSnapshot = {
  up: false,
  down: false,
  left: false,
  right: false,
  upPressed: false,
  downPressed: false,
  leftPressed: false,
  rightPressed: false,
  run: false,
  interact: false,
  interactPressed: false,
  start: false,
  startPressed: false,
  cancel: false,
  cancelPressed: false
};

const inputByName: Record<BattleParityInputName, InputSnapshot> = {
  none: neutralInput,
  confirm: { ...neutralInput, interact: true, interactPressed: true },
  cancel: { ...neutralInput, cancel: true, cancelPressed: true },
  start: { ...neutralInput, start: true, startPressed: true },
  up: { ...neutralInput, up: true, upPressed: true },
  down: { ...neutralInput, down: true, downPressed: true },
  left: { ...neutralInput, left: true, leftPressed: true },
  right: { ...neutralInput, right: true, rightPressed: true }
};

const runBattleStep = (
  battle: BattleState,
  encounter: BattleEncounterState,
  step: BattleParityStep
): void => {
  const input = inputByName[step.input ?? 'none'];
  const repeat = Math.max(1, step.repeat ?? 1);
  const maxSteps = Math.max(repeat, step.maxSteps ?? repeat);

  if (step.untilPhase) {
    let stepsTaken = 0;
    while (stepsTaken < maxSteps && battle.phase !== step.untilPhase) {
      stepBattle(battle, input, encounter);
      if (step.applyRewards) {
        applyBattleRewards(battle);
      }
      stepsTaken += 1;
    }
    return;
  }

  for (let index = 0; index < repeat; index += 1) {
    stepBattle(battle, input, encounter);
    if (step.applyRewards) {
      applyBattleRewards(battle);
    }
  }
};

export const runBattleParityFixture = (fixture: BattleParityFixture): SerializedBattleTraceSnapshot => {
  const battle = createBattleState();
  const encounter = createBattleEncounterState(fixture.encounterSeed);

  if (fixture.startConfig) {
    startConfiguredBattle(battle, fixture.startConfig);
  }

  fixture.setup?.(battle, encounter);

  for (const step of fixture.steps) {
    runBattleStep(battle, encounter, step);
  }

  return serializeBattleTrace(battle);
};
