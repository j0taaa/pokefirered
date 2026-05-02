export const SPRITE_TAG_WAKE = 4000;
export const SPRITE_TAG_SMOKE = 4001;
export const SE_SS_ANNE_HORN = 249;
export const MAX_SPRITES = 64;

export const SPRITE_SHEETS_SS_ANNE = [
  { data: 'sWakeTiles', size: 'sizeof(sWakeTiles)', tag: SPRITE_TAG_WAKE },
  { data: 'sSmokeTiles', size: 'sizeof(sSmokeTiles)', tag: SPRITE_TAG_SMOKE },
  { data: 0 }
] as const;

export const WAKE_ANIM = [
  { frame: 0, duration: 12 },
  { frame: 8, duration: 12 },
  { jump: 0 }
] as const;

export const SMOKE_ANIM = [
  { frame: 0, duration: 10 },
  { frame: 4, duration: 20 },
  { frame: 8, duration: 20 },
  { frame: 12, duration: 30 },
  { end: true }
] as const;

export interface SSAnneSprite {
  id: number;
  kind: 'boat' | 'wake' | 'smoke';
  x: number;
  y: number;
  x2: number;
  y2: number;
  priority: number;
  paletteNum: number;
  data: number[];
  animEnded: boolean;
  destroyed: boolean;
}

export interface SSAnneTask {
  func: 'Task_SSAnneInit' | 'Task_SSAnneRun' | 'Task_SSAnneFinish';
  priority: number;
  data: number[];
  destroyed: boolean;
}

export interface SSAnneRuntimeState {
  tasks: SSAnneTask[];
  sprites: SSAnneSprite[];
  boatSpriteId: number;
  playedSE: number[];
  loadedSpriteSheets: Array<typeof SPRITE_TAG_WAKE | typeof SPRITE_TAG_SMOKE>;
  freedSpriteTileTags: number[];
  scriptContextEnabled: boolean;
  nextCreateSpriteResult: number | null;
}

export const createSSAnneRuntimeState = (
  boatX = 0,
  boatX2 = 0
): SSAnneRuntimeState => ({
  tasks: [],
  sprites: [
    {
      id: 0,
      kind: 'boat',
      x: boatX,
      y: 0,
      x2: boatX2,
      y2: 0,
      priority: 0,
      paletteNum: 0,
      data: Array.from({ length: 8 }, () => 0),
      animEnded: false,
      destroyed: false
    }
  ],
  boatSpriteId: 0,
  playedSE: [],
  loadedSpriteSheets: [],
  freedSpriteTileTags: [],
  scriptContextEnabled: false,
  nextCreateSpriteResult: null
});

const playSE = (runtime: SSAnneRuntimeState, song: number): void => {
  runtime.playedSE.push(song);
};

const createTask = (
  runtime: SSAnneRuntimeState,
  func: SSAnneTask['func'],
  priority: number
): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    func,
    priority,
    data: Array.from({ length: 16 }, () => 0),
    destroyed: false
  });
  return taskId;
};

const createSprite = (
  runtime: SSAnneRuntimeState,
  kind: SSAnneSprite['kind'],
  x: number,
  y: number,
  priority: number
): number => {
  if (runtime.nextCreateSpriteResult !== null) {
    const result = runtime.nextCreateSpriteResult;
    runtime.nextCreateSpriteResult = null;
    if (result === MAX_SPRITES) {
      return MAX_SPRITES;
    }
  }

  const id = runtime.sprites.length;
  runtime.sprites.push({
    id,
    kind,
    x,
    y,
    x2: 0,
    y2: 0,
    priority,
    paletteNum: 0,
    data: Array.from({ length: 8 }, () => 0),
    animEnded: false,
    destroyed: false
  });
  return id;
};

export const doSSAnneDepartureCutscene = (runtime: SSAnneRuntimeState): number => {
  playSE(runtime, SE_SS_ANNE_HORN);
  const taskId = createTask(runtime, 'Task_SSAnneInit', 8);
  runtime.tasks[taskId].data[0] = 50;
  return taskId;
};

export function DoSSAnneDepartureCutscene(runtime: SSAnneRuntimeState): number {
  return doSSAnneDepartureCutscene(runtime);
}

export const taskSSAnneInit = (
  runtime: SSAnneRuntimeState,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  task.data[0] -= 1;
  if (task.data[0] === 0) {
    runtime.loadedSpriteSheets.push(SPRITE_TAG_WAKE, SPRITE_TAG_SMOKE);
    createWakeBehindBoat(runtime);
    task.func = 'Task_SSAnneRun';
  }
};

export function Task_SSAnneInit(runtime: SSAnneRuntimeState, taskId: number): void {
  taskSSAnneInit(runtime, taskId);
}

export const taskSSAnneRun = (
  runtime: SSAnneRuntimeState,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const boatSprite = runtime.sprites[runtime.boatSpriteId];
  task.data[1] += 1;
  task.data[2] += 1;

  if (task.data[1] === 70) {
    task.data[1] = 0;
    createSmokeSprite(runtime);
  }

  if (boatSprite.x + boatSprite.x2 < -120) {
    playSE(runtime, SE_SS_ANNE_HORN);
    task.func = 'Task_SSAnneFinish';
  } else {
    const x = Math.trunc(task.data[2] / 5);
    boatSprite.x2 = -x;
  }
};

export function Task_SSAnneRun(runtime: SSAnneRuntimeState, taskId: number): void {
  taskSSAnneRun(runtime, taskId);
}

export const taskSSAnneFinish = (
  runtime: SSAnneRuntimeState,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  task.data[3] += 1;
  if (task.data[3] === 40) {
    runtime.freedSpriteTileTags.push(SPRITE_TAG_WAKE, SPRITE_TAG_SMOKE);
    task.destroyed = true;
    runtime.scriptContextEnabled = true;
  }
};

export function Task_SSAnneFinish(runtime: SSAnneRuntimeState, taskId: number): void {
  taskSSAnneFinish(runtime, taskId);
}

export const createWakeBehindBoat = (runtime: SSAnneRuntimeState): number => {
  const boatSprite = runtime.sprites[runtime.boatSpriteId];
  const spriteId = createSprite(runtime, 'wake', boatSprite.x + boatSprite.x2 + 80, 109, 0xff);
  if (spriteId !== MAX_SPRITES) {
    runtime.sprites[spriteId].priority = 2;
    runtime.sprites[spriteId].paletteNum = 10;
  }
  return spriteId;
};

export function CreateWakeBehindBoat(runtime: SSAnneRuntimeState): number {
  return createWakeBehindBoat(runtime);
}

export const wakeSpriteCallback = (
  runtime: SSAnneRuntimeState,
  spriteId: number
): void => {
  const sprite = runtime.sprites[spriteId];
  const boatSprite = runtime.sprites[runtime.boatSpriteId];
  sprite.x = boatSprite.x + boatSprite.x2 + 80;

  if (Math.trunc(sprite.data[0] / 6) < 22) {
    sprite.data[0] += 1;
  }

  sprite.x2 = Math.trunc(sprite.data[0] / 6);
  if (sprite.x + sprite.x2 < -18) {
    sprite.destroyed = true;
  }
};

export function WakeSpriteCallback(runtime: SSAnneRuntimeState, spriteId: number): void {
  wakeSpriteCallback(runtime, spriteId);
}

export const createSmokeSprite = (runtime: SSAnneRuntimeState): number => {
  const boatSprite = runtime.sprites[runtime.boatSpriteId];
  const x = boatSprite.x + boatSprite.x2 + 49;
  if (x >= -32) {
    const spriteId = createSprite(runtime, 'smoke', x, 78, 8);
    if (spriteId !== MAX_SPRITES) {
      runtime.sprites[spriteId].paletteNum = 10;
    }
    return spriteId;
  }

  return MAX_SPRITES;
};

export function CreateSmokeSprite(runtime: SSAnneRuntimeState): number {
  return createSmokeSprite(runtime);
}

export const smokeSpriteCallback = (
  runtime: SSAnneRuntimeState,
  spriteId: number
): void => {
  const sprite = runtime.sprites[spriteId];
  sprite.data[0] += 1;
  sprite.x2 = Math.trunc(sprite.data[0] / 4);
  if (sprite.animEnded) {
    sprite.destroyed = true;
  }
};

export function SmokeSpriteCallback(runtime: SSAnneRuntimeState, spriteId: number): void {
  smokeSpriteCallback(runtime, spriteId);
}
