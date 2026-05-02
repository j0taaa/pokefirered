export const SE_BALL_BOUNCE_2 = 'SE_BALL_BOUNCE_2';
export const TASK_MINIGAME_COUNTDOWN = 'Task_MinigameCountdown';

export interface CountdownSprite {
  id: number;
  x: number;
  y: number;
  y2: number;
  invisible: boolean;
  callback: 'SpriteCallbackDummy' | 'SpriteCB_Start' | 'destroyed';
  affineAnimEnded: boolean;
  anim: number;
  affineAnim: number;
  data: number[];
}

export interface CountdownTask {
  id: number;
  func: string;
  priority: number;
  active: boolean;
  data: number[];
}

export interface MinigameCountdownRuntime {
  tasks: CountdownTask[];
  sprites: CountdownSprite[];
  loadedSheets: { tilesTag: number; size: number }[];
  loadedPalettes: number[];
  freedTileTags: number[];
  freedPaletteTags: number[];
  freedOamMatrices: number[];
  sounds: string[];
}

export const createMinigameCountdownRuntime = (): MinigameCountdownRuntime => ({
  tasks: [],
  sprites: [],
  loadedSheets: [],
  loadedPalettes: [],
  freedTileTags: [],
  freedPaletteTags: [],
  freedOamMatrices: [],
  sounds: []
});

const createTask = (runtime: MinigameCountdownRuntime, func: string, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, func, priority, active: true, data: Array.from({ length: 16 }, () => 0) });
  return id;
};

const destroyTask = (runtime: MinigameCountdownRuntime, taskId: number): void => {
  runtime.tasks[taskId].active = false;
};

const createSprite = (
  runtime: MinigameCountdownRuntime,
  x: number,
  y: number,
  callback: CountdownSprite['callback'] = 'SpriteCallbackDummy'
): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push({
    id,
    x,
    y,
    y2: 0,
    invisible: false,
    callback,
    affineAnimEnded: false,
    anim: 0,
    affineAnim: 0,
    data: Array.from({ length: 8 }, () => 0)
  });
  return id;
};

const destroySprite = (runtime: MinigameCountdownRuntime, spriteId: number): void => {
  runtime.sprites[spriteId].callback = 'destroyed';
};

const startSpriteAnim = (sprite: CountdownSprite, anim: number): void => {
  sprite.anim = anim;
};

const startSpriteAffineAnim = (sprite: CountdownSprite, anim: number): void => {
  sprite.affineAnim = anim;
  sprite.affineAnimEnded = false;
};

export const startMinigameCountdown = (
  runtime: MinigameCountdownRuntime,
  tilesTag: number,
  palTag: number,
  x: number,
  y: number,
  subpriority: number
): void => {
  const taskId = createTask(runtime, TASK_MINIGAME_COUNTDOWN, 80);
  const data = runtime.tasks[taskId].data;
  data[2] = tilesTag & 0xffff;
  data[3] = palTag & 0xffff;
  data[4] = x;
  data[5] = y;
  data[6] = subpriority & 0xff;
};

export const isMinigameCountdownRunning = (runtime: MinigameCountdownRuntime): boolean =>
  runtime.tasks.some((task) => task.active && task.func === TASK_MINIGAME_COUNTDOWN);

export const load321StartGfx = (
  runtime: MinigameCountdownRuntime,
  tilesTag: number,
  palTag: number
): void => {
  runtime.loadedSheets.push({ tilesTag, size: 0xe00 });
  runtime.loadedPalettes.push(palTag);
};

export const createNumberSprite = (
  runtime: MinigameCountdownRuntime,
  _tilesTag: number,
  _palTag: number,
  x: number,
  y: number,
  _subpriority: number
): number => createSprite(runtime, x, y);

export const createStartSprite = (
  runtime: MinigameCountdownRuntime,
  _tilesTag: number,
  _palTag: number,
  x: number,
  y: number,
  _subpriority: number,
  spriteIds: { left: number; right: number }
): void => {
  spriteIds.left = createSprite(runtime, x - 32, y);
  spriteIds.right = createSprite(runtime, x + 32, y);
  runtime.sprites[spriteIds.left].invisible = true;
  runtime.sprites[spriteIds.right].invisible = true;
  startSpriteAnim(runtime.sprites[spriteIds.right], 1);
};

export const runMinigameCountdownDigitsAnim = (
  runtime: MinigameCountdownRuntime,
  spriteId: number
): boolean => {
  const sprite = runtime.sprites[spriteId];
  switch (sprite.data[0]) {
    case 0:
      sprite.data[0] += 1;
    // fallthrough
    case 1:
      if (sprite.data[2] === 0) {
        runtime.sounds.push(SE_BALL_BOUNCE_2);
      }
      if (++sprite.data[2] >= 20) {
        sprite.data[2] = 0;
        startSpriteAffineAnim(sprite, 1);
        sprite.data[0] += 1;
      }
      break;
    case 2:
      if (sprite.affineAnimEnded) {
        sprite.data[0] += 1;
      }
      break;
    case 3:
      if (++sprite.data[2] >= 4) {
        sprite.data[2] = 0;
        sprite.data[0] += 1;
        startSpriteAffineAnim(sprite, 2);
      }
      break;
    case 4:
      sprite.y -= 4;
      if (++sprite.data[2] >= 8) {
        if (sprite.data[4] < 2) {
          startSpriteAnim(sprite, sprite.data[4] + 1);
          sprite.data[2] = 0;
          sprite.data[0] += 1;
        } else {
          sprite.data[0] = 7;
          return false;
        }
      }
      break;
    case 5:
      sprite.y += 4;
      if (++sprite.data[2] >= 8) {
        sprite.data[2] = 0;
        startSpriteAffineAnim(sprite, 3);
        sprite.data[0] += 1;
      }
      break;
    case 6:
      if (sprite.affineAnimEnded) {
        sprite.data[4] += 1;
        sprite.data[0] = 1;
      }
      break;
    case 7:
      return false;
  }
  return true;
};

export const startStartGraphic = (
  runtime: MinigameCountdownRuntime,
  _spriteId1: number,
  spriteId2: number,
  spriteId3: number
): void => {
  for (const id of [spriteId2, spriteId3]) {
    runtime.sprites[id].y2 = -40;
    runtime.sprites[id].invisible = false;
    runtime.sprites[id].callback = 'SpriteCB_Start';
  }
};

export const isStartGraphicAnimRunning = (
  runtime: MinigameCountdownRuntime,
  spriteId: number
): boolean => runtime.sprites[spriteId].callback === 'SpriteCB_Start';

const sineTable = Array.from({ length: 256 }, (_unused, i) =>
  Math.round(Math.sin((i * Math.PI) / 128) * 256)
);

export const spriteCBStart = (
  runtime: MinigameCountdownRuntime,
  sprite: CountdownSprite
): void => {
  const data = sprite.data;
  switch (data[0]) {
    case 0:
      data[4] = 64;
      data[5] = sprite.y2 << 4;
      data[0] += 1;
    // fallthrough
    case 1:
      data[5] += data[4];
      data[4] += 1;
      sprite.y2 = data[5] >> 4;
      if (sprite.y2 >= 0) {
        runtime.sounds.push(SE_BALL_BOUNCE_2);
        sprite.y2 = 0;
        data[0] += 1;
      }
      break;
    case 2:
      data[1] += 12;
      if (data[1] >= 128) {
        runtime.sounds.push(SE_BALL_BOUNCE_2);
        data[1] = 0;
        data[0] += 1;
      }
      sprite.y2 = -(sineTable[data[1]] >> 4);
      break;
    case 3:
      data[1] += 16;
      if (data[1] >= 128) {
        runtime.sounds.push(SE_BALL_BOUNCE_2);
        data[1] = 0;
        data[0] += 1;
      }
      sprite.y2 = -(sineTable[data[1]] >> 5);
      break;
    case 4:
      if (++data[1] > 40) {
        sprite.callback = 'SpriteCallbackDummy';
      }
      break;
  }
};

export const taskMinigameCountdown = (
  runtime: MinigameCountdownRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  const data = task.data;
  switch (data[0]) {
    case 0: {
      load321StartGfx(runtime, data[2], data[3]);
      data[7] = createNumberSprite(runtime, data[2], data[3], data[4], data[5], data[6]);
      const startSprites = { left: 0, right: 0 };
      createStartSprite(runtime, data[2], data[3], data[4], data[5], data[6], startSprites);
      data[8] = startSprites.left;
      data[9] = startSprites.right;
      data[0] += 1;
      break;
    }
    case 1:
      if (!runMinigameCountdownDigitsAnim(runtime, data[7])) {
        startStartGraphic(runtime, data[7], data[8], data[9]);
        runtime.freedOamMatrices.push(data[7]);
        destroySprite(runtime, data[7]);
        data[0] += 1;
      }
      break;
    case 2:
      if (!isStartGraphicAnimRunning(runtime, data[8])) {
        destroySprite(runtime, data[8]);
        destroySprite(runtime, data[9]);
        runtime.freedTileTags.push(data[2]);
        runtime.freedPaletteTags.push(data[3]);
        destroyTask(runtime, taskId);
      }
      break;
  }
};

export function StartMinigameCountdown(
  runtime: MinigameCountdownRuntime,
  tilesTag: number,
  palTag: number,
  x: number,
  y: number,
  subpriority: number
): void {
  startMinigameCountdown(runtime, tilesTag, palTag, x, y, subpriority);
}

export function IsMinigameCountdownRunning(runtime: MinigameCountdownRuntime): boolean {
  return isMinigameCountdownRunning(runtime);
}

export function Task_MinigameCountdown(runtime: MinigameCountdownRuntime, taskId: number): void {
  taskMinigameCountdown(runtime, taskId);
}

export function RunMinigameCountdownDigitsAnim(
  runtime: MinigameCountdownRuntime,
  spriteId: number
): boolean {
  return runMinigameCountdownDigitsAnim(runtime, spriteId);
}

export function StartStartGraphic(
  runtime: MinigameCountdownRuntime,
  spriteId1: number,
  spriteId2: number,
  spriteId3: number
): void {
  startStartGraphic(runtime, spriteId1, spriteId2, spriteId3);
}

export function IsStartGraphicAnimRunning(
  runtime: MinigameCountdownRuntime,
  spriteId: number
): boolean {
  return isStartGraphicAnimRunning(runtime, spriteId);
}

export function SpriteCB_Start(
  runtime: MinigameCountdownRuntime,
  sprite: CountdownSprite
): void {
  spriteCBStart(runtime, sprite);
}

export function Load321StartGfx(
  runtime: MinigameCountdownRuntime,
  tilesTag: number,
  palTag: number
): void {
  load321StartGfx(runtime, tilesTag, palTag);
}

export function CreateNumberSprite(
  runtime: MinigameCountdownRuntime,
  tilesTag: number,
  palTag: number,
  x: number,
  y: number,
  subpriority: number
): number {
  return createNumberSprite(runtime, tilesTag, palTag, x, y, subpriority);
}

export function CreateStartSprite(
  runtime: MinigameCountdownRuntime,
  tilesTag: number,
  palTag: number,
  x: number,
  y: number,
  subpriority: number,
  spriteIds: { left: number; right: number }
): void {
  createStartSprite(runtime, tilesTag, palTag, x, y, subpriority, spriteIds);
}
