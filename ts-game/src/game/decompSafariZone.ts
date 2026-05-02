export interface SafariZoneRuntimeState {
  vars: Record<string, number>;
  flags: Set<string>;
  startMenu: {
    mode: 'normal' | 'safari' | 'link' | 'unionRoom';
  };
  operations?: string[];
  mainCallback2?: string | null;
  fieldCallback?: string | null;
  battleOutcome?: number;
}

export const FLAG_SYS_SAFARI_MODE = 'FLAG_SYS_SAFARI_MODE';
export const GAME_STAT_ENTERED_SAFARI_ZONE = 'gameStatEnteredSafariZone';
export const SAFARI_ZONE_TOTAL_BALLS = 30;
export const SAFARI_ZONE_TOTAL_STEPS = 600;
export const B_OUTCOME_NO_SAFARI_BALLS = 5;
export const B_OUTCOME_CAUGHT = 7;

export const SAFARI_ZONE_TEXT_WOULD_YOU_LIKE_TO_EXIT = [
  'Would you like to exit the SAFARI',
  'ZONE right now?'
] as const;

export const SAFARI_ZONE_TEXT_TIMES_UP = [
  'PA: Ding-dong!',
  "Time's up!",
  'PA: Your SAFARI GAME is over!'
] as const;

export const SAFARI_ZONE_TEXT_OUT_OF_BALLS = [
  'PA: Ding-dong!',
  'You are out of SAFARI BALLS!',
  'PA: Your SAFARI GAME is over!'
] as const;

const clampSafariBalls = (value: number): number =>
  Math.max(0, Math.min(SAFARI_ZONE_TOTAL_BALLS, Math.trunc(value)));

const clampSafariSteps = (value: number): number =>
  Math.max(0, Math.min(SAFARI_ZONE_TOTAL_STEPS, Math.trunc(value)));

const setSafariZoneStepState = (runtime: SafariZoneRuntimeState, stepsRemaining: number): void => {
  const clampedSteps = clampSafariSteps(stepsRemaining);
  runtime.vars.safariZoneStepCounter = clampedSteps;
  runtime.vars.safariStepsTaken = SAFARI_ZONE_TOTAL_STEPS - clampedSteps;
};

const op = (runtime: SafariZoneRuntimeState, operation: string): void => {
  runtime.operations?.push(operation);
};

export const getSafariZoneFlag = (runtime: SafariZoneRuntimeState): boolean =>
  runtime.flags.has(FLAG_SYS_SAFARI_MODE);

export function GetSafariZoneFlag(runtime: SafariZoneRuntimeState): boolean {
  return getSafariZoneFlag(runtime);
}

export const setSafariZoneFlag = (runtime: SafariZoneRuntimeState): void => {
  runtime.flags.add(FLAG_SYS_SAFARI_MODE);
};

export function SetSafariZoneFlag(runtime: SafariZoneRuntimeState): void {
  setSafariZoneFlag(runtime);
}

export const resetSafariZoneFlag = (runtime: SafariZoneRuntimeState): void => {
  runtime.flags.delete(FLAG_SYS_SAFARI_MODE);
};

export function ResetSafariZoneFlag(runtime: SafariZoneRuntimeState): void {
  resetSafariZoneFlag(runtime);
}

export const getSafariZoneBallCount = (runtime: SafariZoneRuntimeState): number =>
  clampSafariBalls(runtime.vars.safariBalls ?? (getSafariZoneFlag(runtime) ? SAFARI_ZONE_TOTAL_BALLS : 0));

export const getSafariZoneStepsRemaining = (runtime: SafariZoneRuntimeState): number => {
  if (Number.isInteger(runtime.vars.safariZoneStepCounter)) {
    return clampSafariSteps(runtime.vars.safariZoneStepCounter);
  }

  const stepsTaken = clampSafariSteps(runtime.vars.safariStepsTaken ?? 0);
  return SAFARI_ZONE_TOTAL_STEPS - stepsTaken;
};

export const setSafariZoneBallCount = (runtime: SafariZoneRuntimeState, balls: number): void => {
  runtime.vars.safariBalls = clampSafariBalls(balls);
};

export const enterSafariMode = (runtime: SafariZoneRuntimeState): void => {
  runtime.vars[GAME_STAT_ENTERED_SAFARI_ZONE] = Math.max(
    0,
    Math.trunc(runtime.vars[GAME_STAT_ENTERED_SAFARI_ZONE] ?? 0)
  ) + 1;
  setSafariZoneFlag(runtime);
  runtime.startMenu.mode = 'safari';
  setSafariZoneBallCount(runtime, SAFARI_ZONE_TOTAL_BALLS);
  setSafariZoneStepState(runtime, SAFARI_ZONE_TOTAL_STEPS);
};

export function EnterSafariMode(runtime: SafariZoneRuntimeState): void {
  enterSafariMode(runtime);
}

export const exitSafariMode = (runtime: SafariZoneRuntimeState): void => {
  resetSafariZoneFlag(runtime);
  if (runtime.startMenu.mode === 'safari') {
    runtime.startMenu.mode = 'normal';
  }
  setSafariZoneBallCount(runtime, 0);
  setSafariZoneStepState(runtime, 0);
};

export function ExitSafariMode(runtime: SafariZoneRuntimeState): void {
  exitSafariMode(runtime);
}

export const safariZoneTakeStep = (runtime: SafariZoneRuntimeState): boolean => {
  if (!getSafariZoneFlag(runtime)) {
    return false;
  }

  const stepsRemaining = getSafariZoneStepsRemaining(runtime);
  const nextStepsRemaining = Math.max(0, stepsRemaining - 1);
  setSafariZoneStepState(runtime, nextStepsRemaining);
  if (nextStepsRemaining === 0) {
    op(runtime, 'ScriptContext_SetupScript:SafariZone_EventScript_TimesUp');
    return true;
  }
  return false;
};

export function SafariZoneTakeStep(runtime: SafariZoneRuntimeState): boolean {
  return safariZoneTakeStep(runtime);
}

export function SafariZoneRetirePrompt(runtime: SafariZoneRuntimeState): void {
  op(runtime, 'ScriptContext_SetupScript:SafariZone_EventScript_RetirePrompt');
}

export function CB2_EndSafariBattle(runtime: SafariZoneRuntimeState): void {
  if (getSafariZoneBallCount(runtime) !== 0) {
    runtime.mainCallback2 = 'CB2_ReturnToField';
  } else if (runtime.battleOutcome === B_OUTCOME_NO_SAFARI_BALLS) {
    op(runtime, 'RunScriptImmediately:SafariZone_EventScript_OutOfBallsMidBattle');
    op(runtime, 'WarpIntoMap');
    runtime.fieldCallback = 'FieldCB_SafariZoneRanOutOfBalls';
    runtime.mainCallback2 = 'CB2_LoadMap';
  } else if (runtime.battleOutcome === B_OUTCOME_CAUGHT) {
    op(runtime, 'ScriptContext_SetupScript:SafariZone_EventScript_OutOfBalls');
    op(runtime, 'ScriptContext_Stop');
    runtime.mainCallback2 = 'CB2_ReturnToFieldContinueScriptPlayMapMusic';
  }
}

export const finalizeSafariBattle = (
  runtime: SafariZoneRuntimeState,
  result: {
    safariBalls: number;
    caught: boolean;
  }
): readonly string[] | null => {
  setSafariZoneBallCount(runtime, result.safariBalls);
  if (result.safariBalls > 0) {
    return null;
  }

  exitSafariMode(runtime);
  return result.caught ? SAFARI_ZONE_TEXT_OUT_OF_BALLS : SAFARI_ZONE_TEXT_OUT_OF_BALLS;
};
