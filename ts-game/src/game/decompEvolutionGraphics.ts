export const MAX_SPRITES = 64;
export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const RGB_WHITE = 0x7fff;
export const SE_M_MEGA_KICK = 123;
export const SE_M_BUBBLE_BEAM2 = 124;
export const SE_SHINY = 125;
export const SE_M_PETAL_DANCE = 126;
export const BG_PLTT_ID_2 = 32;
export const PLTT_SIZE_4BPP = 32;
export const OBJ_PLTT_ID = (id: number): number => 0x100 + id * 16;

export type EvoTaskFunc =
  | 'EvoTask_PreEvoSparkleSet1Init'
  | 'EvoTask_CreatePreEvoSparkleSet1'
  | 'EvoTask_WaitForPre1SparklesToGoUp'
  | 'EvoTask_PreEvoSparkleSet2Init'
  | 'EvoTask_CreatePreEvoSparklesSet2'
  | 'EvoTask_PreEvoSparkleSet2Teardown'
  | 'EvoTask_PostEvoSparklesSet1Init'
  | 'EvoTask_CreatePostEvoSparklesSet1'
  | 'EvoTask_PostEvoSparklesSet1Teardown'
  | 'EvoTask_PostEvoSparklesSet2Init'
  | 'EvoTask_CreatePostEvoSparklesSet2'
  | 'EvoTask_PostEvoSparklesSet2Teardown'
  | 'EvoTask_PostEvoSparklesSet2TradeInit'
  | 'EvoTask_CreatePostEvoSparklesSet2Trade'
  | 'EvoTask_PrePostEvoMonSpritesInit'
  | 'EvoTask_ChooseNextEvoSpriteAnim'
  | 'EvoTask_ShrinkOrExpandEvoSprites'
  | 'PreEvoInvisible_PostEvoVisible_KillTask'
  | 'PreEvoVisible_PostEvoInvisible_KillTask';

export type EvoSpriteCallback =
  | 'SpriteCallbackDummy_EvoSparkles'
  | 'SpriteCB_PreEvoSparkleSet1'
  | 'SpriteCB_PreEvoSparkleSet2'
  | 'SpriteCB_PostEvoSparkleSet1'
  | 'SpriteCB_PostEvoSparkleSet2'
  | 'SpriteCallbackDummy_MonSprites';

export type EvoSprite = {
  x: number;
  y: number;
  x2: number;
  y2: number;
  subpriority: number;
  invisible: boolean;
  destroyed: boolean;
  data: number[];
  oam: { affineMode: number; matrixNum: number; paletteNum: number };
  callback: EvoSpriteCallback;
};

export type EvoTask = {
  func: EvoTaskFunc;
  priority: number;
  data: number[];
  destroyed: boolean;
  EvoGraphicsTaskEvoStop: boolean;
};

export type EvolutionGraphicsRuntime = {
  sprites: EvoSprite[];
  tasks: EvoTask[];
  oamMatrices: Map<number, [number, number, number, number]>;
  gPlttBufferFaded: number[];
  gPlttBufferUnfaded: number[];
  gPaletteFade: { active: boolean };
  randomValues: number[];
  operations: string[];
};

export const sEvolutionSparkleMatrixScales = [0x3c0, 0x380, 0x340, 0x300, 0x2c0, 0x280, 0x240, 0x200, 0x1c0, 0x180, 0x140, 0x100] as const;

export const createEvolutionGraphicsRuntime = (): EvolutionGraphicsRuntime => ({
  sprites: [],
  tasks: [],
  oamMatrices: new Map(),
  gPlttBufferFaded: Array(0x200).fill(0),
  gPlttBufferUnfaded: Array(0x200).fill(0),
  gPaletteFade: { active: false },
  randomValues: [],
  operations: []
});

export const Sin = (angle: number, amplitude: number): number => Math.trunc(Math.sin(((angle & 0xff) * Math.PI) / 128) * amplitude);
export const Cos = (angle: number, amplitude: number): number => Math.trunc(Math.cos(((angle & 0xff) * Math.PI) / 128) * amplitude);
export const Random = (runtime: EvolutionGraphicsRuntime): number => runtime.randomValues.shift() ?? 0;

export const CreateTask = (runtime: EvolutionGraphicsRuntime, func: EvoTaskFunc, priority: number): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ func, priority, data: Array(16).fill(0), destroyed: false, EvoGraphicsTaskEvoStop: false });
  return id;
};
export const DestroyTask = (runtime: EvolutionGraphicsRuntime, taskId: number): void => { runtime.tasks[taskId].destroyed = true; };
export const CreateSprite = (runtime: EvolutionGraphicsRuntime, x: number, y: number, subpriority: number): number => {
  if (runtime.sprites.length >= MAX_SPRITES) return MAX_SPRITES;
  const id = runtime.sprites.length;
  runtime.sprites.push({ x, y, x2: 0, y2: 0, subpriority, invisible: false, destroyed: false, data: Array(8).fill(0), oam: { affineMode: 0, matrixNum: 0, paletteNum: 0 }, callback: 'SpriteCallbackDummy_EvoSparkles' });
  return id;
};
export const DestroySprite = (sprite: EvoSprite): void => { sprite.destroyed = true; };
export const SetOamMatrix = (runtime: EvolutionGraphicsRuntime, id: number, a: number, b: number, c: number, d: number): void => {
  runtime.oamMatrices.set(id, [Math.trunc(a), b, c, Math.trunc(d)]);
};
export const BeginNormalPaletteFade = (runtime: EvolutionGraphicsRuntime, mask: number, delay: number, start: number, end: number, color: number): void => {
  runtime.operations.push(`BeginNormalPaletteFade:${mask}:${delay}:${start}:${end}:${color}`);
};
export const PlaySE = (runtime: EvolutionGraphicsRuntime, se: number): void => { runtime.operations.push(`PlaySE:${se}`); };
export const CpuCopy16 = (src: readonly number[], dst: number[], size: number, dstOffset = 0): void => {
  for (let i = 0; i < size / 2; i += 1) dst[dstOffset + i] = src[i] ?? 0;
};
export const IsMovingBackgroundTaskRunning = (runtime: EvolutionGraphicsRuntime): boolean => {
  runtime.operations.push('IsMovingBackgroundTaskRunning');
  return false;
};
export const SpriteCallbackDummy_EvoSparkles = (_sprite: EvoSprite): void => {};
export const SpriteCallbackDummy_MonSprites = (_sprite: EvoSprite): void => {};
export const LoadEvoSparkleSpriteAndPal = (runtime: EvolutionGraphicsRuntime): void => {
  runtime.operations.push('LoadCompressedSpriteSheetUsingHeap:sSpriteSheet_EvolutionSparkles');
  runtime.operations.push('LoadSpritePalettes:sSpritePalette_EvolutionSparkles');
};
export const SetEvoSparklesMatrices = (runtime: EvolutionGraphicsRuntime): void => {
  for (let i = 0; i < sEvolutionSparkleMatrixScales.length; i += 1) SetOamMatrix(runtime, i + 20, sEvolutionSparkleMatrixScales[i], 0, 0, sEvolutionSparkleMatrixScales[i]);
};

export const SpriteCB_PreEvoSparkleSet1 = (sprite: EvoSprite): void => {
  if (sprite.y > 8) {
    sprite.y = 88 - Math.trunc((sprite.data[7] * sprite.data[7]) / 80);
    sprite.y2 = Math.trunc(Sin(sprite.data[6], sprite.data[5]) / 4);
    sprite.x2 = Cos(sprite.data[6], sprite.data[5]);
    sprite.data[6] += 4;
    if (sprite.data[7] & 1) sprite.data[5] -= 1;
    sprite.data[7] += 1;
    sprite.subpriority = sprite.y2 > 0 ? 1 : 20;
    let mnum = Math.trunc(sprite.data[5] / 4) + 20;
    if (mnum > 31) mnum = 31;
    sprite.oam.matrixNum = mnum;
  } else DestroySprite(sprite);
};
export const CreatePreEvoSparkleSet1 = (runtime: EvolutionGraphicsRuntime, a0: number): number => {
  const spriteId = CreateSprite(runtime, 120, 88, 0);
  if (spriteId !== MAX_SPRITES) {
    const s = runtime.sprites[spriteId];
    s.data[5] = 48; s.data[6] = a0; s.data[7] = 0;
    s.oam.affineMode = ST_OAM_AFFINE_NORMAL; s.oam.matrixNum = 31; s.callback = 'SpriteCB_PreEvoSparkleSet1';
  }
  return spriteId;
};
export const SpriteCB_PreEvoSparkleSet2 = (sprite: EvoSprite): void => {
  if (sprite.y < 88) {
    sprite.y = 8 + Math.trunc((sprite.data[7] * sprite.data[7]) / 5);
    sprite.y2 = Math.trunc(Sin(sprite.data[6], sprite.data[5]) / 4);
    sprite.x2 = Cos(sprite.data[6], sprite.data[5]);
    sprite.data[5] = Sin(sprite.data[7] * 4, 40) + 8;
    sprite.data[7] += 1;
  } else DestroySprite(sprite);
};
export const CreatePreEvoSparkleSet2 = (runtime: EvolutionGraphicsRuntime, a0: number): number => {
  const spriteId = CreateSprite(runtime, 120, 8, 0);
  if (spriteId !== MAX_SPRITES) {
    const s = runtime.sprites[spriteId];
    s.data[5] = 8; s.data[6] = a0; s.data[7] = 0;
    s.oam.affineMode = ST_OAM_AFFINE_NORMAL; s.oam.matrixNum = 25; s.subpriority = 1; s.callback = 'SpriteCB_PreEvoSparkleSet2';
  }
  return spriteId;
};
export const SpriteCB_PostEvoSparkleSet1 = (sprite: EvoSprite): void => {
  if (sprite.data[5] > 8) {
    sprite.y2 = Sin(sprite.data[6], sprite.data[5]);
    sprite.x2 = Cos(sprite.data[6], sprite.data[5]);
    sprite.data[5] -= sprite.data[3];
    sprite.data[6] += 4;
  } else DestroySprite(sprite);
};
export const CreatePostEvoSparkleSet1 = (runtime: EvolutionGraphicsRuntime, a0: number, a1: number): number => {
  const spriteId = CreateSprite(runtime, 120, 56, 0);
  if (spriteId !== MAX_SPRITES) {
    const s = runtime.sprites[spriteId];
    s.data[3] = a1; s.data[5] = 120; s.data[6] = a0; s.data[7] = 0;
    s.oam.affineMode = ST_OAM_AFFINE_NORMAL; s.oam.matrixNum = 31; s.subpriority = 1; s.callback = 'SpriteCB_PostEvoSparkleSet1';
  }
  return spriteId;
};
export const SpriteCB_PostEvoSparkleSet2 = (sprite: EvoSprite): void => {
  if ((sprite.data[7] & 3) === 0) sprite.y += 1;
  if (sprite.data[6] < 128) {
    const y2 = -Sin(sprite.data[6], sprite.data[5]);
    sprite.y2 = Object.is(y2, -0) ? 0 : y2;
    sprite.x = 120 + Math.trunc((sprite.data[3] * sprite.data[7]) / 3);
    sprite.data[6] += 1;
    let mnum = 31 - Math.trunc((sprite.data[6] * 12) / 128);
    if (sprite.data[6] > 64) sprite.subpriority = 1;
    else {
      sprite.invisible = false; sprite.subpriority = 20;
      if (sprite.data[6] > 112 && (sprite.data[6] & 1)) sprite.invisible = true;
    }
    if (mnum < 20) mnum = 20;
    sprite.oam.matrixNum = mnum;
    sprite.data[7] += 1;
  } else DestroySprite(sprite);
};
export const CreatePostEvoSparkleSet2 = (runtime: EvolutionGraphicsRuntime, _unused: number): number => {
  const spriteId = CreateSprite(runtime, 120, 56, 0);
  if (spriteId !== MAX_SPRITES) {
    const s = runtime.sprites[spriteId];
    s.data[3] = 3 - (Random(runtime) % 7);
    s.data[5] = 48 + (Random(runtime) & 63);
    s.data[7] = 0;
    s.oam.affineMode = ST_OAM_AFFINE_NORMAL; s.oam.matrixNum = 31; s.subpriority = 20; s.callback = 'SpriteCB_PostEvoSparkleSet2';
  }
  return spriteId;
};

export const EvolutionSparkles_SpiralUpward = (runtime: EvolutionGraphicsRuntime, a0: number): number => {
  const taskId = CreateTask(runtime, 'EvoTask_PreEvoSparkleSet1Init', 0); runtime.tasks[taskId].data[1] = a0; return taskId;
};
export const EvolutionSparkles_ArcDown = (runtime: EvolutionGraphicsRuntime): number => CreateTask(runtime, 'EvoTask_PreEvoSparkleSet2Init', 0);
export const EvolutionSparkles_CircleInward = (runtime: EvolutionGraphicsRuntime): number => CreateTask(runtime, 'EvoTask_PostEvoSparklesSet1Init', 0);
export const EvolutionSparkles_SprayAndFlash = (runtime: EvolutionGraphicsRuntime, species: number): number => { const id = CreateTask(runtime, 'EvoTask_PostEvoSparklesSet2Init', 0); runtime.tasks[id].data[2] = species; return id; };
export const EvolutionSparkles_SprayAndFlash_Trade = (runtime: EvolutionGraphicsRuntime, species: number): number => { const id = CreateTask(runtime, 'EvoTask_PostEvoSparklesSet2TradeInit', 0); runtime.tasks[id].data[2] = species; return id; };

export const runEvolutionTask = (runtime: EvolutionGraphicsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  switch (task.func) {
    case 'EvoTask_PreEvoSparkleSet1Init':
      SetEvoSparklesMatrices(runtime); task.data[15] = 0; BeginNormalPaletteFade(runtime, 3 << task.data[1], 10, 0, 16, RGB_WHITE); task.func = 'EvoTask_CreatePreEvoSparkleSet1'; PlaySE(runtime, SE_M_MEGA_KICK); break;
    case 'EvoTask_CreatePreEvoSparkleSet1':
      if (task.data[15] < 64) { if ((task.data[15] & 7) === 0) for (let i = 0; i < 4; i += 1) CreatePreEvoSparkleSet1(runtime, 2 * (task.data[15] & 0x78) + 64 * i); task.data[15] += 1; }
      else { task.data[15] = 96; task.func = 'EvoTask_WaitForPre1SparklesToGoUp'; } break;
    case 'EvoTask_WaitForPre1SparklesToGoUp': if (task.data[15] !== 0) task.data[15] -= 1; else DestroyTask(runtime, taskId); break;
    case 'EvoTask_PreEvoSparkleSet2Init':
      SetEvoSparklesMatrices(runtime); task.data[15] = 0; task.func = 'EvoTask_CreatePreEvoSparklesSet2'; PlaySE(runtime, SE_M_BUBBLE_BEAM2); break;
    case 'EvoTask_CreatePreEvoSparklesSet2':
      if (task.data[15] < 96) { if (task.data[15] < 6) for (let i = 0; i < 9; i += 1) CreatePreEvoSparkleSet2(runtime, 16 * i); task.data[15] += 1; }
      else task.func = 'EvoTask_PreEvoSparkleSet2Teardown'; break;
    case 'EvoTask_PreEvoSparkleSet2Teardown': DestroyTask(runtime, taskId); break;
    case 'EvoTask_PostEvoSparklesSet1Init':
      SetEvoSparklesMatrices(runtime); task.data[15] = 0; task.func = 'EvoTask_CreatePostEvoSparklesSet1'; PlaySE(runtime, SE_SHINY); break;
    case 'EvoTask_CreatePostEvoSparklesSet1':
      if (task.data[15] < 48) { if (task.data[15] === 0) for (let i = 0; i < 16; i += 1) CreatePostEvoSparkleSet1(runtime, i * 16, 4); if (task.data[15] === 32) for (let i = 0; i < 16; i += 1) CreatePostEvoSparkleSet1(runtime, i * 16, 8); task.data[15] += 1; }
      else task.func = 'EvoTask_PostEvoSparklesSet1Teardown'; break;
    case 'EvoTask_PostEvoSparklesSet1Teardown': DestroyTask(runtime, taskId); break;
    case 'EvoTask_PostEvoSparklesSet2Init':
      SetEvoSparklesMatrices(runtime); task.data[15] = 0; IsMovingBackgroundTaskRunning(runtime); CpuCopy16(runtime.gPlttBufferFaded.slice(BG_PLTT_ID_2), runtime.gPlttBufferUnfaded, 3 * PLTT_SIZE_4BPP, BG_PLTT_ID_2); BeginNormalPaletteFade(runtime, 0xfff90f1c, 0, 0, 16, RGB_WHITE); task.func = 'EvoTask_CreatePostEvoSparklesSet2'; PlaySE(runtime, SE_M_PETAL_DANCE); break;
    case 'EvoTask_CreatePostEvoSparklesSet2':
      createSprayFrame(runtime, task, 0xffff0f1c, 'EvoTask_PostEvoSparklesSet2Teardown'); break;
    case 'EvoTask_PostEvoSparklesSet2TradeInit':
      SetEvoSparklesMatrices(runtime); task.data[15] = 0; IsMovingBackgroundTaskRunning(runtime); CpuCopy16(runtime.gPlttBufferFaded.slice(BG_PLTT_ID_2), runtime.gPlttBufferUnfaded, 3 * PLTT_SIZE_4BPP, BG_PLTT_ID_2); BeginNormalPaletteFade(runtime, 0xfff90f00, 0, 0, 16, RGB_WHITE); task.func = 'EvoTask_CreatePostEvoSparklesSet2Trade'; PlaySE(runtime, SE_M_PETAL_DANCE); break;
    case 'EvoTask_CreatePostEvoSparklesSet2Trade':
      createSprayFrame(runtime, task, 0xffff0f00, 'EvoTask_PostEvoSparklesSet2Teardown'); break;
    case 'EvoTask_PostEvoSparklesSet2Teardown': if (!runtime.gPaletteFade.active) DestroyTask(runtime, taskId); break;
    case 'EvoTask_PrePostEvoMonSpritesInit': task.data[5] = 0; task.data[6] = 8; task.func = 'EvoTask_ChooseNextEvoSpriteAnim'; break;
    case 'EvoTask_ChooseNextEvoSpriteAnim':
      if (task.EvoGraphicsTaskEvoStop) PreEvoVisible_PostEvoInvisible_KillTask(runtime, taskId);
      else if (task.data[6] === 128) PreEvoInvisible_PostEvoVisible_KillTask(runtime, taskId);
      else { task.data[6] += 2; task.data[5] ^= 1; task.func = 'EvoTask_ShrinkOrExpandEvoSprites'; }
      break;
    case 'EvoTask_ShrinkOrExpandEvoSprites': EvoTask_ShrinkOrExpandEvoSprites(runtime, taskId); break;
    case 'PreEvoInvisible_PostEvoVisible_KillTask': PreEvoInvisible_PostEvoVisible_KillTask(runtime, taskId); break;
    case 'PreEvoVisible_PostEvoInvisible_KillTask': PreEvoVisible_PostEvoInvisible_KillTask(runtime, taskId); break;
  }
};

const createSprayFrame = (runtime: EvolutionGraphicsRuntime, task: EvoTask, fadeMask: number, teardown: EvoTaskFunc): void => {
  if (task.data[15] < 128) {
    switch (task.data[15]) {
      case 0: for (let i = 0; i < 8; i += 1) CreatePostEvoSparkleSet2(runtime, i); break;
      case 32: BeginNormalPaletteFade(runtime, fadeMask, 16, 16, 0, RGB_WHITE); break;
      default: if (task.data[15] < 50) CreatePostEvoSparkleSet2(runtime, Random(runtime) & 7); break;
    }
    task.data[15] += 1;
  } else task.func = teardown;
};

export const CycleEvolutionMonSprite = (runtime: EvolutionGraphicsRuntime, preEvoSpriteId: number, postEvoSpriteId: number): number => {
  const palette = Array(16).fill(RGB_WHITE);
  const taskId = CreateTask(runtime, 'EvoTask_PrePostEvoMonSpritesInit', 0);
  const task = runtime.tasks[taskId];
  task.data[1] = preEvoSpriteId; task.data[2] = postEvoSpriteId; task.data[3] = 256; task.data[4] = 16;
  SetOamMatrix(runtime, 30, 0x10000 / task.data[3], 0, 0, 0x10000 / task.data[3]);
  SetOamMatrix(runtime, 31, 0x10000 / task.data[4], 0, 0, 0x10000 / task.data[4]);
  for (const id of [preEvoSpriteId, postEvoSpriteId]) {
    runtime.sprites[id].callback = 'SpriteCallbackDummy_MonSprites';
    runtime.sprites[id].oam.affineMode = ST_OAM_AFFINE_NORMAL;
    runtime.sprites[id].oam.matrixNum = id === preEvoSpriteId ? 30 : 31;
    runtime.sprites[id].invisible = false;
    CpuCopy16(palette, runtime.gPlttBufferFaded, PLTT_SIZE_4BPP, OBJ_PLTT_ID(runtime.sprites[id].oam.paletteNum));
  }
  task.EvoGraphicsTaskEvoStop = false;
  return taskId;
};

export const EvoTask_ShrinkOrExpandEvoSprites = (runtime: EvolutionGraphicsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.EvoGraphicsTaskEvoStop) task.func = 'PreEvoVisible_PostEvoInvisible_KillTask';
  else {
    let r6 = 0;
    if (!task.data[5]) {
      if (task.data[3] < 0x100 - task.data[6]) task.data[3] += task.data[6]; else { task.data[3] = 0x100; r6 = 1; }
      if (task.data[4] > 0x10 + task.data[6]) task.data[4] -= task.data[6]; else { task.data[4] = 0x10; r6 += 1; }
    } else {
      if (task.data[4] < 0x100 - task.data[6]) task.data[4] += task.data[6]; else { task.data[4] = 0x100; r6 = 1; }
      if (task.data[3] > 0x10 + task.data[6]) task.data[3] -= task.data[6]; else { task.data[3] = 0x10; r6 += 1; }
    }
    SetOamMatrix(runtime, 30, 0x10000 / task.data[3], 0, 0, 0x10000 / task.data[3]);
    SetOamMatrix(runtime, 31, 0x10000 / task.data[4], 0, 0, 0x10000 / task.data[4]);
    if (r6 === 2) task.func = 'EvoTask_ChooseNextEvoSpriteAnim';
  }
};
export const PreEvoInvisible_PostEvoVisible_KillTask = (runtime: EvolutionGraphicsRuntime, taskId: number): void => {
  const t = runtime.tasks[taskId], pre = runtime.sprites[t.data[1]], post = runtime.sprites[t.data[2]];
  pre.oam.affineMode = ST_OAM_AFFINE_OFF; pre.oam.matrixNum = 0; pre.invisible = true;
  post.oam.affineMode = ST_OAM_AFFINE_OFF; post.oam.matrixNum = 0; post.invisible = false;
  DestroyTask(runtime, taskId);
};
export const PreEvoVisible_PostEvoInvisible_KillTask = (runtime: EvolutionGraphicsRuntime, taskId: number): void => {
  const t = runtime.tasks[taskId], pre = runtime.sprites[t.data[1]], post = runtime.sprites[t.data[2]];
  pre.oam.affineMode = ST_OAM_AFFINE_OFF; pre.oam.matrixNum = 0; pre.invisible = false;
  post.oam.affineMode = ST_OAM_AFFINE_OFF; post.oam.matrixNum = 0; post.invisible = true;
  DestroyTask(runtime, taskId);
};

const runNamedEvolutionTask = (runtime: EvolutionGraphicsRuntime, taskId: number, func: EvoTaskFunc): void => {
  runtime.tasks[taskId].func = func;
  runEvolutionTask(runtime, taskId);
};

export const EvoTask_PreEvoSparkleSet1Init = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PreEvoSparkleSet1Init');
export const EvoTask_CreatePreEvoSparkleSet1 = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_CreatePreEvoSparkleSet1');
export const EvoTask_WaitForPre1SparklesToGoUp = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_WaitForPre1SparklesToGoUp');
export const EvoTask_PreEvoSparkleSet2Init = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PreEvoSparkleSet2Init');
export const EvoTask_CreatePreEvoSparklesSet2 = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_CreatePreEvoSparklesSet2');
export const EvoTask_PreEvoSparkleSet2Teardown = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PreEvoSparkleSet2Teardown');
export const EvoTask_PostEvoSparklesSet1Init = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PostEvoSparklesSet1Init');
export const EvoTask_CreatePostEvoSparklesSet1 = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_CreatePostEvoSparklesSet1');
export const EvoTask_PostEvoSparklesSet1Teardown = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PostEvoSparklesSet1Teardown');
export const EvoTask_PostEvoSparklesSet2Init = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PostEvoSparklesSet2Init');
export const EvoTask_CreatePostEvoSparklesSet2 = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_CreatePostEvoSparklesSet2');
export const EvoTask_PostEvoSparklesSet2Teardown = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PostEvoSparklesSet2Teardown');
export const EvoTask_PostEvoSparklesSet2TradeInit = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PostEvoSparklesSet2TradeInit');
export const EvoTask_CreatePostEvoSparklesSet2Trade = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_CreatePostEvoSparklesSet2Trade');
export const EvoTask_PrePostEvoMonSpritesInit = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_PrePostEvoMonSpritesInit');
export const EvoTask_ChooseNextEvoSpriteAnim = (runtime: EvolutionGraphicsRuntime, taskId: number): void => runNamedEvolutionTask(runtime, taskId, 'EvoTask_ChooseNextEvoSpriteAnim');
