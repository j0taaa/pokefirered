import type { ScriptRuntimeState } from './scripts';

export const FLAG_SYS_GAME_CLEAR = 'FLAG_SYS_GAME_CLEAR';
export const FLAG_SYS_POKEDEX_GET = 'FLAG_SYS_POKEDEX_GET';
export const FLAG_SYS_NOT_SOMEONES_PC = 'FLAG_SYS_NOT_SOMEONES_PC';

export interface HofPcRuntime {
  paletteFadeActive: boolean;
  playerFieldControlsLocked: boolean;
  windowBuffersFreed: boolean;
  dma3BusyFlagsReset: boolean;
  mainCallback2: string | null;
  fieldCallback: string | null;
  tasks: Map<number, { callback: string; priority: number }>;
  nextTaskId: number;
  pcMenuCreated: boolean;
  pcStartupPromptDisplayed: boolean;
  specialMapMusicPlayed: boolean;
  paletteFades: Array<{ start: number; end: number; color: string }>;
}

export const createHofPcRuntime = (): HofPcRuntime => ({
  paletteFadeActive: false,
  playerFieldControlsLocked: false,
  windowBuffersFreed: false,
  dma3BusyFlagsReset: false,
  mainCallback2: null,
  fieldCallback: null,
  tasks: new Map(),
  nextTaskId: 0,
  pcMenuCreated: false,
  pcStartupPromptDisplayed: false,
  specialMapMusicPlayed: false,
  paletteFades: []
});

const BeginNormalPaletteFade = (
  runtime: HofPcRuntime,
  start: number,
  end: number,
  color: string
): void => {
  runtime.paletteFadeActive = true;
  runtime.paletteFades.push({ start, end, color });
};

const LockPlayerFieldControls = (runtime: HofPcRuntime): void => {
  runtime.playerFieldControlsLocked = true;
};

const CreateTask = (runtime: HofPcRuntime, callback: string, priority: number): number => {
  const taskId = runtime.nextTaskId;
  runtime.nextTaskId += 1;
  runtime.tasks.set(taskId, { callback, priority });
  return taskId;
};

const DestroyTask = (runtime: HofPcRuntime, taskId: number): void => {
  runtime.tasks.delete(taskId);
};

export function Task_WaitFadeAndSetCallback(runtime: HofPcRuntime, taskId: number): void {
  if (!runtime.paletteFadeActive) {
    runtime.windowBuffersFreed = true;
    runtime.dma3BusyFlagsReset = true;
    DestroyTask(runtime, taskId);
    runtime.mainCallback2 = 'CB2_InitHofPC';
  }
}

export function HallOfFamePCBeginFade(runtime: HofPcRuntime): void {
  BeginNormalPaletteFade(runtime, 0, 0x10, 'RGB_BLACK');
  LockPlayerFieldControls(runtime);
  CreateTask(runtime, 'Task_WaitFadeAndSetCallback', 0);
}

export function ReturnFromHallOfFamePC(runtime: HofPcRuntime): void {
  runtime.mainCallback2 = 'CB2_ReturnToField';
  runtime.fieldCallback = 'ReshowPCMenuAfterHallOfFamePC';
}

export function ReshowPCMenuAfterHallOfFamePC(runtime: HofPcRuntime): void {
  LockPlayerFieldControls(runtime);
  runtime.specialMapMusicPlayed = true;
  runtime.pcMenuCreated = true;
  runtime.pcStartupPromptDisplayed = true;
  BeginNormalPaletteFade(runtime, 0x10, 0, 'RGB_BLACK');
  CreateTask(runtime, 'Task_WaitForPaletteFade', 10);
}

export function Task_WaitForPaletteFade(runtime: HofPcRuntime, taskId: number): void {
  if (!runtime.paletteFadeActive) {
    DestroyTask(runtime, taskId);
  }
}

export const getCenterPcMenuOptions = (runtime: ScriptRuntimeState): string[] => {
  const options = [
    runtime.flags.has(FLAG_SYS_NOT_SOMEONES_PC) ? "BILL'S PC" : "SOMEONE'S PC",
    `${runtime.startMenu.playerName}'S PC`
  ];

  if (runtime.flags.has(FLAG_SYS_POKEDEX_GET) || runtime.startMenu.hasPokedex) {
    options.push("PROF. OAK'S PC");
  }

  if (runtime.flags.has(FLAG_SYS_GAME_CLEAR)) {
    options.push('HALL OF FAME');
  }

  options.push('LOG OFF');
  return options;
};

export const getBedroomPcMenuOptions = (): string[] => [
  'ITEM STORAGE',
  'MAILBOX',
  'TURN OFF'
];

const formatHofTime = (runtime: ScriptRuntimeState): string | null => {
  const hours = runtime.vars.hofDebutHours;
  const minutes = runtime.vars.hofDebutMinutes;
  const seconds = runtime.vars.hofDebutSeconds;
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || !Number.isInteger(seconds)) {
    return null;
  }

  return `${String(hours).padStart(3, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getHallOfFamePcPages = (runtime: ScriptRuntimeState): string[] => {
  const debutTime = formatHofTime(runtime);
  return debutTime
    ? [
      'Welcome to the HALL OF FAME!',
      `HALL OF FAME DEBUT\n${debutTime}`,
      'Hall of Fame record viewer stub.'
    ]
    : [
      'Welcome to the HALL OF FAME!',
      'Hall of Fame record viewer stub.'
    ];
};

export const getPlayerPcStubPages = (submenu: 'itemStorage' | 'mailbox'): string[] =>
  submenu === 'itemStorage'
    ? [
      'ITEM STORAGE',
      'Item Storage PC flow stub.'
    ]
    : [
      'MAILBOX',
      'Mailbox PC flow stub.'
    ];
