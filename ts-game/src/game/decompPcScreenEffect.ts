export type PcScreenEffectMode = 'turnOn' | 'turnOff';

export interface PcScreenEffectState {
  active: boolean;
  mode: PcScreenEffectMode | null;
  state: number;
  xSpeed: number;
  ySpeed: number;
  priority: number;
  win0Left: number;
  win0Right: number;
  win0Top: number;
  win0Bottom: number;
}

export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
const DEFAULT_X_SPEED = 16;
const DEFAULT_Y_SPEED = 20;
const CENTER_X = 120;
const CENTER_TOP = 80;
const CENTER_BOTTOM = 81;

export const createPcScreenEffectState = (): PcScreenEffectState => ({
  active: false,
  mode: null,
  state: 0,
  xSpeed: DEFAULT_X_SPEED,
  ySpeed: DEFAULT_Y_SPEED,
  priority: 0,
  win0Left: CENTER_X,
  win0Right: CENTER_X,
  win0Top: CENTER_TOP,
  win0Bottom: CENTER_BOTTOM
});

const beginPcScreenEffect = (
  effect: PcScreenEffectState,
  mode: PcScreenEffectMode,
  speed = 0,
  priority = 0
): void => {
  effect.active = true;
  effect.mode = mode;
  effect.state = 0;
  effect.priority = priority;
  effect.xSpeed = speed === 0 ? DEFAULT_X_SPEED : speed;
  // Mirrors the original bug where both axes use the first speed arg.
  effect.ySpeed = speed === 0 ? DEFAULT_Y_SPEED : speed;
  if (mode === 'turnOn') {
    effect.win0Left = CENTER_X;
    effect.win0Right = CENTER_X;
    effect.win0Top = CENTER_TOP;
    effect.win0Bottom = CENTER_BOTTOM;
  } else {
    effect.win0Left = 0;
    effect.win0Right = DISPLAY_WIDTH;
    effect.win0Top = 0;
    effect.win0Bottom = DISPLAY_HEIGHT;
  }
};

export const beginPcScreenEffectTurnOn = (effect: PcScreenEffectState, speed = 0): void => {
  beginPcScreenEffect(effect, 'turnOn', speed);
};

export function BeginPCScreenEffect_TurnOn(
  effect: PcScreenEffectState,
  xspeed: number,
  yspeed: number,
  priority: number
): void {
  BeginPCScreenEffect(effect, 'Task_PCScreenEffect_TurnOn', xspeed, yspeed, priority);
}

export const beginPcScreenEffectTurnOff = (effect: PcScreenEffectState, speed = 0): void => {
  beginPcScreenEffect(effect, 'turnOff', speed);
};

export function BeginPCScreenEffect_TurnOff(
  effect: PcScreenEffectState,
  xspeed: number,
  yspeed: number,
  priority: number
): void {
  BeginPCScreenEffect(effect, 'Task_PCScreenEffect_TurnOff', xspeed, yspeed, priority);
}

export const isPcScreenEffectRunningTurnOn = (effect: PcScreenEffectState): boolean =>
  effect.active && effect.mode === 'turnOn';

export function IsPCScreenEffectRunning_TurnOn(effect: PcScreenEffectState): boolean {
  return isPcScreenEffectRunningTurnOn(effect);
}

export const isPcScreenEffectRunningTurnOff = (effect: PcScreenEffectState): boolean =>
  effect.active && effect.mode === 'turnOff';

export function IsPCScreenEffectRunning_TurnOff(effect: PcScreenEffectState): boolean {
  return isPcScreenEffectRunningTurnOff(effect);
}

export function BeginPCScreenEffect(
  effect: PcScreenEffectState,
  func: 'Task_PCScreenEffect_TurnOn' | 'Task_PCScreenEffect_TurnOff' | PcScreenEffectMode,
  speed: number,
  _unused: number,
  priority: number
): void {
  const mode = func === 'Task_PCScreenEffect_TurnOff' || func === 'turnOff' ? 'turnOff' : 'turnOn';
  beginPcScreenEffect(effect, mode, speed, priority);
  stepPcScreenEffect(effect);
}

export const stepPcScreenEffect = (effect: PcScreenEffectState): void => {
  if (!effect.active || !effect.mode) {
    return;
  }

  if (effect.mode === 'turnOn') {
    switch (effect.state) {
      case 0:
      case 1:
        effect.state += 1;
        return;
      case 2:
        effect.win0Left = Math.max(0, effect.win0Left - effect.xSpeed);
        effect.win0Right = Math.min(DISPLAY_WIDTH, effect.win0Right + effect.xSpeed);
        if (effect.win0Left === 0 && effect.win0Right === DISPLAY_WIDTH) {
          effect.state += 1;
        }
        return;
      case 3:
        effect.win0Top = Math.max(0, effect.win0Top - effect.ySpeed);
        effect.win0Bottom = Math.min(DISPLAY_HEIGHT, effect.win0Bottom + effect.ySpeed);
        if (effect.win0Top === 0 && effect.win0Bottom === DISPLAY_HEIGHT) {
          effect.active = false;
          effect.mode = null;
          effect.state = 4;
        }
        return;
      default:
        effect.active = false;
        effect.mode = null;
        return;
    }
  }

  switch (effect.state) {
    case 0:
    case 1:
      effect.state += 1;
      return;
    case 2:
      effect.win0Top = Math.min(CENTER_TOP, effect.win0Top + effect.ySpeed);
      effect.win0Bottom = Math.max(CENTER_BOTTOM, effect.win0Bottom - effect.ySpeed);
      if (effect.win0Top === CENTER_TOP && effect.win0Bottom === CENTER_BOTTOM) {
        effect.state += 1;
      }
      return;
    case 3:
      effect.win0Left = Math.min(CENTER_X, effect.win0Left + effect.xSpeed);
      effect.win0Right = Math.max(CENTER_X, effect.win0Right - effect.xSpeed);
      if (effect.win0Left === CENTER_X && effect.win0Right === CENTER_X) {
        effect.active = false;
        effect.mode = null;
        effect.state = 4;
      }
      return;
    default:
      effect.active = false;
      effect.mode = null;
      return;
  }
};

export function Task_PCScreenEffect_TurnOn(effect: PcScreenEffectState): void {
  if (effect.mode === null) effect.mode = 'turnOn';
  stepPcScreenEffect(effect);
}

export function Task_PCScreenEffect_TurnOff(effect: PcScreenEffectState): void {
  if (effect.mode === null) effect.mode = 'turnOff';
  stepPcScreenEffect(effect);
}

export const getPcScreenEffectWindow = (
  effect: PcScreenEffectState
): { left: number; right: number; top: number; bottom: number } | null => {
  if (!effect.active || !effect.mode) {
    return null;
  }

  return {
    left: effect.win0Left,
    right: effect.win0Right,
    top: effect.win0Top,
    bottom: effect.win0Bottom
  };
};
