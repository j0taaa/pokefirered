import { describe, expect, test } from 'vitest';
import {
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
  }
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
});
