import { describe, expect, test } from 'vitest';
import {
  B_OUTCOME_CAUGHT,
  B_OUTCOME_NO_SAFARI_BALLS,
  CB2_EndSafariBattle,
  EnterSafariMode,
  ExitSafariMode,
  GetSafariZoneFlag,
  ResetSafariZoneFlag,
  SafariZoneRetirePrompt,
  SafariZoneTakeStep,
  SetSafariZoneFlag,
  enterSafariMode,
  exitSafariMode,
  finalizeSafariBattle,
  GAME_STAT_ENTERED_SAFARI_ZONE,
  getSafariZoneBallCount,
  getSafariZoneFlag,
  getSafariZoneStepsRemaining,
  safariZoneTakeStep,
  SAFARI_ZONE_TEXT_OUT_OF_BALLS
} from '../src/game/decompSafariZone';

const createSafariRuntime = () => ({
  vars: {} as Record<string, number>,
  flags: new Set<string>(),
  startMenu: {
    mode: 'normal' as 'normal' | 'safari' | 'link' | 'unionRoom'
  },
  operations: [] as string[],
  mainCallback2: null as string | null,
  fieldCallback: null as string | null,
  battleOutcome: 0
});

describe('decompSafariZone', () => {
  test('enters and exits Safari mode with FireRed counters', () => {
    const runtime = createSafariRuntime();

    enterSafariMode(runtime);

    expect(getSafariZoneFlag(runtime)).toBe(true);
    expect(runtime.startMenu.mode).toBe('safari');
    expect(runtime.vars[GAME_STAT_ENTERED_SAFARI_ZONE]).toBe(1);
    expect(getSafariZoneBallCount(runtime)).toBe(30);
    expect(getSafariZoneStepsRemaining(runtime)).toBe(600);
    expect(runtime.vars.safariStepsTaken).toBe(0);

    exitSafariMode(runtime);

    expect(getSafariZoneFlag(runtime)).toBe(false);
    expect(runtime.startMenu.mode).toBe('normal');
    expect(getSafariZoneBallCount(runtime)).toBe(0);
    expect(getSafariZoneStepsRemaining(runtime)).toBe(0);
  });

  test('counts Safari steps down to a times-up result', () => {
    const runtime = createSafariRuntime();
    enterSafariMode(runtime);

    for (let i = 0; i < 599; i += 1) {
      expect(safariZoneTakeStep(runtime)).toBe(false);
    }

    expect(getSafariZoneStepsRemaining(runtime)).toBe(1);
    expect(runtime.vars.safariStepsTaken).toBe(599);
    expect(safariZoneTakeStep(runtime)).toBe(true);
    expect(getSafariZoneStepsRemaining(runtime)).toBe(0);
    expect(runtime.vars.safariStepsTaken).toBe(600);
  });

  test('ends the Safari run when the last ball is consumed', () => {
    const runtime = createSafariRuntime();
    enterSafariMode(runtime);

    expect(finalizeSafariBattle(runtime, { safariBalls: 12, caught: false })).toBeNull();
    expect(getSafariZoneFlag(runtime)).toBe(true);
    expect(getSafariZoneBallCount(runtime)).toBe(12);

    expect(finalizeSafariBattle(runtime, { safariBalls: 0, caught: true })).toEqual(SAFARI_ZONE_TEXT_OUT_OF_BALLS);
    expect(getSafariZoneFlag(runtime)).toBe(false);
    expect(runtime.startMenu.mode).toBe('normal');
    expect(getSafariZoneBallCount(runtime)).toBe(0);
  });

  test('exact C-name Safari mode helpers preserve flags, counters, scripts, and battle callbacks', () => {
    const runtime = createSafariRuntime();

    expect(GetSafariZoneFlag(runtime)).toBe(false);
    SetSafariZoneFlag(runtime);
    expect(GetSafariZoneFlag(runtime)).toBe(true);
    ResetSafariZoneFlag(runtime);
    expect(GetSafariZoneFlag(runtime)).toBe(false);

    EnterSafariMode(runtime);
    expect(GetSafariZoneFlag(runtime)).toBe(true);
    expect(getSafariZoneBallCount(runtime)).toBe(30);
    expect(getSafariZoneStepsRemaining(runtime)).toBe(600);

    runtime.vars.safariZoneStepCounter = 1;
    expect(SafariZoneTakeStep(runtime)).toBe(true);
    expect(runtime.operations).toContain('ScriptContext_SetupScript:SafariZone_EventScript_TimesUp');

    SafariZoneRetirePrompt(runtime);
    expect(runtime.operations).toContain('ScriptContext_SetupScript:SafariZone_EventScript_RetirePrompt');

    runtime.vars.safariBalls = 5;
    CB2_EndSafariBattle(runtime);
    expect(runtime.mainCallback2).toBe('CB2_ReturnToField');

    runtime.vars.safariBalls = 0;
    runtime.battleOutcome = B_OUTCOME_NO_SAFARI_BALLS;
    CB2_EndSafariBattle(runtime);
    expect(runtime.operations).toEqual(expect.arrayContaining([
      'RunScriptImmediately:SafariZone_EventScript_OutOfBallsMidBattle',
      'WarpIntoMap'
    ]));
    expect(runtime.fieldCallback).toBe('FieldCB_SafariZoneRanOutOfBalls');
    expect(runtime.mainCallback2).toBe('CB2_LoadMap');

    runtime.battleOutcome = B_OUTCOME_CAUGHT;
    CB2_EndSafariBattle(runtime);
    expect(runtime.operations).toEqual(expect.arrayContaining([
      'ScriptContext_SetupScript:SafariZone_EventScript_OutOfBalls',
      'ScriptContext_Stop'
    ]));
    expect(runtime.mainCallback2).toBe('CB2_ReturnToFieldContinueScriptPlayMapMusic');

    ExitSafariMode(runtime);
    expect(GetSafariZoneFlag(runtime)).toBe(false);
    expect(getSafariZoneBallCount(runtime)).toBe(0);
  });
});
