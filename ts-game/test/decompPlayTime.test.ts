import { describe, expect, test } from 'vitest';
import {
  createPlayTimeCounter,
  createPlayTimeCounterFromSeconds,
  getTotalPlayTimeMinutes,
  getTotalPlayTimeSeconds,
  resetPlayTimeCounter,
  setPlayTimeCounterToMax,
  startPlayTimeCounter,
  stopPlayTimeCounter,
  updatePlayTimeCounter
} from '../src/game/decompPlayTime';

describe('decomp play time parity', () => {
  test('resets and starts like src/play_time.c', () => {
    const counter = createPlayTimeCounterFromSeconds(3661, 12, 'RUNNING');

    resetPlayTimeCounter(counter);
    expect(counter).toMatchObject({
      state: 'STOPPED',
      hours: 0,
      minutes: 0,
      seconds: 0,
      vblanks: 0
    });

    startPlayTimeCounter(counter);
    expect(counter.state).toBe('RUNNING');
  });

  test('advances vblanks into seconds, minutes, and hours', () => {
    const counter = createPlayTimeCounter();
    startPlayTimeCounter(counter);

    updatePlayTimeCounter(counter, 60);
    expect(counter).toMatchObject({ hours: 0, minutes: 0, seconds: 1, vblanks: 0 });

    counter.seconds = 59;
    counter.vblanks = 59;
    updatePlayTimeCounter(counter);
    expect(counter).toMatchObject({ hours: 0, minutes: 1, seconds: 0, vblanks: 0 });

    counter.minutes = 59;
    counter.seconds = 59;
    counter.vblanks = 59;
    updatePlayTimeCounter(counter);
    expect(counter).toMatchObject({ hours: 1, minutes: 0, seconds: 0, vblanks: 0 });
  });

  test('stops at max play time', () => {
    const counter = createPlayTimeCounter();
    setPlayTimeCounterToMax(counter);

    updatePlayTimeCounter(counter, 120);
    expect(counter).toMatchObject({
      state: 'MAXED_OUT',
      hours: 999,
      minutes: 59,
      seconds: 59,
      vblanks: 59
    });
  });

  test('stopped counters do not advance and totals reflect stored values', () => {
    const counter = createPlayTimeCounterFromSeconds(3723, 17, 'STOPPED');
    stopPlayTimeCounter(counter);

    updatePlayTimeCounter(counter, 10);

    expect(counter).toMatchObject({ hours: 1, minutes: 2, seconds: 3, vblanks: 17 });
    expect(getTotalPlayTimeSeconds(counter)).toBe(3723);
    expect(getTotalPlayTimeMinutes(counter)).toBe(62);
  });
});
