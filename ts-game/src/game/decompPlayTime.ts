export type PlayTimeCounterState = 'STOPPED' | 'RUNNING' | 'MAXED_OUT';

export interface PlayTimeCounter {
  state: PlayTimeCounterState;
  hours: number;
  minutes: number;
  seconds: number;
  vblanks: number;
}

export const PLAY_TIME_C_TRANSLATION_UNIT = 'src/play_time.c';

const MAX_HOURS = 999;
const MAX_COMPONENT = 59;

export const createPlayTimeCounter = (): PlayTimeCounter => ({
  state: 'STOPPED',
  hours: 0,
  minutes: 0,
  seconds: 0,
  vblanks: 0
});

export const clonePlayTimeCounter = (counter: PlayTimeCounter): PlayTimeCounter => ({
  state: counter.state,
  hours: counter.hours,
  minutes: counter.minutes,
  seconds: counter.seconds,
  vblanks: counter.vblanks
});

export const resetPlayTimeCounter = (counter: PlayTimeCounter): void => {
  counter.state = 'STOPPED';
  counter.hours = 0;
  counter.minutes = 0;
  counter.seconds = 0;
  counter.vblanks = 0;
};

export function PlayTimeCounter_Reset(counter: PlayTimeCounter): void {
  resetPlayTimeCounter(counter);
}

export const setPlayTimeCounterToMax = (counter: PlayTimeCounter): void => {
  counter.state = 'MAXED_OUT';
  counter.hours = MAX_HOURS;
  counter.minutes = MAX_COMPONENT;
  counter.seconds = MAX_COMPONENT;
  counter.vblanks = MAX_COMPONENT;
};

export function PlayTimeCounter_SetToMax(counter: PlayTimeCounter): void {
  setPlayTimeCounterToMax(counter);
}

export const startPlayTimeCounter = (counter: PlayTimeCounter): void => {
  counter.state = 'RUNNING';
  if (counter.hours > MAX_HOURS) {
    setPlayTimeCounterToMax(counter);
  }
};

export function PlayTimeCounter_Start(counter: PlayTimeCounter): void {
  startPlayTimeCounter(counter);
}

export const stopPlayTimeCounter = (counter: PlayTimeCounter): void => {
  counter.state = 'STOPPED';
};

export function PlayTimeCounter_Stop(counter: PlayTimeCounter): void {
  stopPlayTimeCounter(counter);
}

const tickPlayTimeCounter = (counter: PlayTimeCounter): void => {
  counter.vblanks += 1;
  if (counter.vblanks > MAX_COMPONENT) {
    counter.vblanks = 0;
    counter.seconds += 1;
    if (counter.seconds > MAX_COMPONENT) {
      counter.seconds = 0;
      counter.minutes += 1;
      if (counter.minutes > MAX_COMPONENT) {
        counter.minutes = 0;
        counter.hours += 1;
        if (counter.hours > MAX_HOURS) {
          setPlayTimeCounterToMax(counter);
        }
      }
    }
  }
};

export const updatePlayTimeCounter = (counter: PlayTimeCounter, vblankTicks = 1): void => {
  if (counter.state !== 'RUNNING') {
    return;
  }

  const ticks = Math.max(0, Math.trunc(vblankTicks));
  for (let i = 0; i < ticks; i += 1) {
    tickPlayTimeCounter(counter);
    if (counter.state !== 'RUNNING') {
      return;
    }
  }
};

export function PlayTimeCounter_Update(counter: PlayTimeCounter): void {
  updatePlayTimeCounter(counter);
}

export const getTotalPlayTimeSeconds = (counter: PlayTimeCounter): number =>
  (counter.hours * 3600) + (counter.minutes * 60) + counter.seconds;

export const getTotalPlayTimeMinutes = (counter: PlayTimeCounter): number =>
  (counter.hours * 60) + counter.minutes;

export const createPlayTimeCounterFromSeconds = (
  totalSeconds: number,
  vblanks = 0,
  state: PlayTimeCounterState = 'RUNNING'
): PlayTimeCounter => {
  const safeSeconds = Math.max(0, Math.trunc(totalSeconds));
  const counter: PlayTimeCounter = {
    state,
    hours: Math.floor(safeSeconds / 3600),
    minutes: Math.floor((safeSeconds % 3600) / 60),
    seconds: safeSeconds % 60,
    vblanks: Math.max(0, Math.min(MAX_COMPONENT, Math.trunc(vblanks)))
  };

  if (counter.hours > MAX_HOURS) {
    setPlayTimeCounterToMax(counter);
  }

  return counter;
};
