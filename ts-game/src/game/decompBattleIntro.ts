export const BG_ANIM_SCREEN_SIZE = 0;
export const BG_ANIM_AREA_OVERFLOW_MODE = 1;
export const BG_ANIM_MOSAIC = 2;
export const BG_ANIM_CHAR_BASE_BLOCK = 3;
export const BG_ANIM_PRIORITY = 4;
export const BG_ANIM_PALETTES_MODE = 5;
export const BG_ANIM_SCREEN_BASE_BLOCK = 6;

export const BATTLE_TERRAIN_GRASS = 0;
export const BATTLE_TERRAIN_LONG_GRASS = 1;
export const BATTLE_TERRAIN_SAND = 2;
export const BATTLE_TERRAIN_UNDERWATER = 3;
export const BATTLE_TERRAIN_WATER = 4;
export const BATTLE_TERRAIN_POND = 5;
export const BATTLE_TERRAIN_MOUNTAIN = 6;
export const BATTLE_TERRAIN_CAVE = 7;
export const BATTLE_TERRAIN_BUILDING = 8;
export const BATTLE_TERRAIN_PLAIN = 9;

export const BATTLE_TYPE_LINK = 1 << 1;
export const BATTLE_TYPE_KYOGRE_GROUDON = 1 << 12;
export const VERSION_RUBY = 1;

export const REG_OFFSET_BG0CNT = 'REG_OFFSET_BG0CNT';
export const REG_OFFSET_BG1CNT = 'REG_OFFSET_BG1CNT';
export const REG_OFFSET_BG2CNT = 'REG_OFFSET_BG2CNT';
export const REG_OFFSET_BG3CNT = 'REG_OFFSET_BG3CNT';
export const REG_OFFSET_BLDCNT = 'REG_OFFSET_BLDCNT';
export const REG_OFFSET_BLDALPHA = 'REG_OFFSET_BLDALPHA';
export const REG_OFFSET_BLDY = 'REG_OFFSET_BLDY';
export const REG_OFFSET_WININ = 'REG_OFFSET_WININ';
export const REG_OFFSET_WINOUT = 'REG_OFFSET_WINOUT';

export const BG_ATTR_CHARBASEINDEX = 'BG_ATTR_CHARBASEINDEX';
export const BG_SCREEN_SIZE = 0x800;
export const ST_OAM_OBJ_WINDOW = 2;
export const SPRITE_CB_VS_LETTER_INIT = 'SpriteCB_VsLetterInit';

export const WININ_WIN0_BG_ALL = 0x000f;
export const WININ_WIN0_OBJ = 0x0010;
export const WININ_WIN0_CLR = 0x0020;
export const WININ_WIN1_BG_ALL = 0x0f00;
export const WININ_WIN1_OBJ = 0x1000;
export const WININ_WIN1_CLR = 0x2000;
export const WINOUT_WIN01_BG_ALL = 0x000f;
export const WINOUT_WIN01_BG1 = 0x0002;
export const WINOUT_WIN01_BG2 = 0x0004;
export const WINOUT_WIN01_OBJ = 0x0010;
export const WINOUT_WIN01_CLR = 0x0020;
export const WINOUT_WINOBJ_BG_ALL = 0x0f00;
export const WINOUT_WINOBJ_OBJ = 0x1000;
export const WINOUT_WINOBJ_CLR = 0x2000;

export const BLDCNT_TGT1_BG1 = 0x0002;
export const BLDCNT_EFFECT_BLEND = 0x0040;
export const BLDCNT_TGT2_BG3 = 0x0800;
export const BLDCNT_TGT2_OBJ = 0x1000;

export type BattleIntroTaskFunc =
  | 'BattleIntroSlide1'
  | 'BattleIntroSlide2'
  | 'BattleIntroSlide3'
  | 'BattleIntroSlideLink';

export interface BattleIntroTask {
  id: number;
  data: number[];
  func: BattleIntroTaskFunc;
  priority: number;
  destroyed: boolean;
}

export interface BattleIntroSprite {
  oam: { objMode: number };
  callback: string;
}

export interface BattleIntroRuntime {
  sBgCnt: number;
  gBattleTypeFlags: number;
  gGameVersion: number;
  gBattle_BG1_X: number;
  gBattle_BG1_Y: number;
  gBattle_BG2_X: number;
  gBattle_BG2_Y: number;
  gBattle_WIN0V: number;
  gIntroSlideFlags: number;
  gScanlineEffect: { srcBuffer: number; state: number };
  gScanlineEffectRegBuffers: [number[], number[]];
  gpuRegs: Record<string, number>;
  tasks: BattleIntroTask[];
  bgAttributes: Record<string, number>;
  bgAttributeCalls: Array<{ bg: number; attr: string; value: number }>;
  cpuFill32Calls: Array<{ value: number; dest: string; size: number }>;
  loadBgTilesCalls: Array<{ bgId: number; tiles: number[]; size: number; offset: number }>;
  loadBgTilemapCalls: Array<{ bgId: number; tilemap: number[]; size: number; offset: number }>;
  dmaCopy16Calls: Array<{ channel: number; source: number[]; dest: string; size: number }>;
  gSprites: BattleIntroSprite[];
  gBattleStruct: { linkBattleVsSpriteId_V: number; linkBattleVsSpriteId_S: number };
  gBattleMonForms: number[];
  gMonSpritesGfxPtr: { sprites: number[][] };
  battlersByPosition: Record<number, number>;
  bgVram: number[];
}

const gBattleAnimRegOffsBgCnt = [
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG1CNT,
  REG_OFFSET_BG2CNT,
  REG_OFFSET_BG3CNT
] as const;

const gBattleIntroRegOffsBgCnt = [
  REG_OFFSET_BG0CNT,
  REG_OFFSET_BG1CNT,
  REG_OFFSET_BG2CNT,
  REG_OFFSET_BG3CNT
] as const;

export const bldAlphaBlend = (evA: number, evB: number): number => (evA & 0x1f) | ((evB & 0x1f) << 8);
export const bgcntPriority = (value: number): number => value & 3;
export const bgcntCharbase = (value: number): number => (value & 3) << 2;
export const bgcntScreenbase = (value: number): number => (value & 0x1f) << 8;
export const BGCNT_16COLOR = 0;
export const BGCNT_TXT512x256 = 1 << 14;
export const BGCNT_TXT256x512 = 2 << 14;

export const battleIntroBg1Cnt =
  bgcntPriority(0) | bgcntCharbase(0) | BGCNT_16COLOR | bgcntScreenbase(28) | BGCNT_TXT256x512;
export const battleIntroBg2Cnt =
  bgcntPriority(0) | bgcntCharbase(0) | BGCNT_16COLOR | bgcntScreenbase(30) | BGCNT_TXT512x256;

const u16 = (value: number): number => value & 0xffff;
const i16 = (value: number): number => {
  const wrapped = u16(value);
  return wrapped & 0x8000 ? wrapped - 0x10000 : wrapped;
};
const bgScreenAddr = (screenBaseBlock: number): string => `BG_SCREEN_ADDR(${screenBaseBlock})`;

const bgAttrKey = (bg: number, attr: string): string => `${bg}:${attr}`;
const getGpuReg = (runtime: BattleIntroRuntime, reg: string): number => runtime.gpuRegs[reg] ?? 0;
const setGpuReg = (runtime: BattleIntroRuntime, reg: string, value: number): void => {
  runtime.gpuRegs[reg] = u16(value);
};

const setBgAttribute = (runtime: BattleIntroRuntime, bg: number, attr: string, value: number): void => {
  runtime.bgAttributes[bgAttrKey(bg, attr)] = value;
  runtime.bgAttributeCalls.push({ bg, attr, value });
};

const cpuFill32 = (runtime: BattleIntroRuntime, value: number, dest: string, size: number): void => {
  runtime.cpuFill32Calls.push({ value, dest, size });
};

const createTask = (runtime: BattleIntroRuntime, func: BattleIntroTaskFunc, priority: number): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    id: taskId,
    data: Array.from({ length: 16 }, () => 0),
    func,
    priority,
    destroyed: false
  });
  return taskId;
};

const destroyTask = (runtime: BattleIntroRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
};

const getBattlerAtPosition = (runtime: BattleIntroRuntime, battlerPosition: number): number =>
  runtime.battlersByPosition[battlerPosition] ?? battlerPosition;

const cos2 = (angle: number): number => Math.round(Math.cos((angle * Math.PI) / 180) * 32768);

const copy16 = (source: number[], sourceOffset: number, dest: number[], size: number): void => {
  for (let i = 0; i < size; i += 1) {
    dest[i] = source[sourceOffset + i] ?? 0;
  }
};

const loadBgTiles = (runtime: BattleIntroRuntime, bgId: number, tiles: number[], size: number, offset: number): void => {
  runtime.loadBgTilesCalls.push({ bgId, tiles: tiles.slice(), size, offset });
};

const loadBgTilemap = (runtime: BattleIntroRuntime, bgId: number, tilemap: number[], size: number, offset: number): void => {
  runtime.loadBgTilemapCalls.push({ bgId, tilemap: tilemap.slice(), size, offset });
};

const dmaCopy16 = (
  runtime: BattleIntroRuntime,
  channel: number,
  source: number[],
  sourceOffset: number,
  dest: string,
  size: number
): void => {
  runtime.dmaCopy16Calls.push({ channel, source: source.slice(sourceOffset, sourceOffset + size), dest, size });
};

const writeScanlineBuffer = (runtime: BattleIntroRuntime, value: number): void => {
  const buffer = runtime.gScanlineEffectRegBuffers[runtime.gScanlineEffect.srcBuffer];
  let i = 0;
  for (; i < 80; i += 1) {
    buffer[i] = value;
  }
  while (i < 160) {
    buffer[i] = -value;
    i += 1;
  }
};

const clearIntroSlideBg = (runtime: BattleIntroRuntime): void => {
  runtime.gScanlineEffect.state = 3;
  cpuFill32(runtime, 0, bgScreenAddr(28), BG_SCREEN_SIZE);
  setBgAttribute(runtime, 1, BG_ATTR_CHARBASEINDEX, 0);
  setBgAttribute(runtime, 2, BG_ATTR_CHARBASEINDEX, 0);
  setGpuReg(runtime, REG_OFFSET_BG1CNT, battleIntroBg1Cnt);
  setGpuReg(runtime, REG_OFFSET_BG2CNT, battleIntroBg2Cnt);
};

export const createBattleIntroRuntime = (): BattleIntroRuntime => ({
  sBgCnt: 0,
  gBattleTypeFlags: 0,
  gGameVersion: VERSION_RUBY,
  gBattle_BG1_X: 0,
  gBattle_BG1_Y: 0,
  gBattle_BG2_X: 0,
  gBattle_BG2_Y: 0,
  gBattle_WIN0V: 0,
  gIntroSlideFlags: 1,
  gScanlineEffect: { srcBuffer: 0, state: 0 },
  gScanlineEffectRegBuffers: [
    Array.from({ length: 160 }, () => 0),
    Array.from({ length: 160 }, () => 0)
  ],
  gpuRegs: {
    [REG_OFFSET_BG0CNT]: 0,
    [REG_OFFSET_BG1CNT]: 0,
    [REG_OFFSET_BG2CNT]: 0,
    [REG_OFFSET_BG3CNT]: 0
  },
  tasks: [],
  bgAttributes: {},
  bgAttributeCalls: [],
  cpuFill32Calls: [],
  loadBgTilesCalls: [],
  loadBgTilemapCalls: [],
  dmaCopy16Calls: [],
  gSprites: Array.from({ length: 64 }, () => ({ oam: { objMode: 0 }, callback: 'SpriteCallbackDummy' })),
  gBattleStruct: { linkBattleVsSpriteId_V: 0, linkBattleVsSpriteId_S: 1 },
  gBattleMonForms: [],
  gMonSpritesGfxPtr: { sprites: [] },
  battlersByPosition: {},
  bgVram: Array.from({ length: 0x8000 }, () => 0)
});

export const setAnimBgAttribute = (
  runtime: BattleIntroRuntime,
  bgId: number,
  attributeId: number,
  value: number
): void => {
  if (bgId < 4) {
    runtime.sBgCnt = getGpuReg(runtime, gBattleAnimRegOffsBgCnt[bgId]);
    switch (attributeId) {
      case BG_ANIM_SCREEN_SIZE:
        runtime.sBgCnt = (runtime.sBgCnt & ~0xc000) | ((value & 3) << 14);
        break;
      case BG_ANIM_AREA_OVERFLOW_MODE:
        runtime.sBgCnt = (runtime.sBgCnt & ~0x2000) | ((value & 1) << 13);
        break;
      case BG_ANIM_MOSAIC:
        runtime.sBgCnt = (runtime.sBgCnt & ~0x0040) | ((value & 1) << 6);
        break;
      case BG_ANIM_CHAR_BASE_BLOCK:
        runtime.sBgCnt = (runtime.sBgCnt & ~0x000c) | ((value & 3) << 2);
        break;
      case BG_ANIM_PRIORITY:
        runtime.sBgCnt = (runtime.sBgCnt & ~0x0003) | (value & 3);
        break;
      case BG_ANIM_PALETTES_MODE:
        runtime.sBgCnt = (runtime.sBgCnt & ~0x0080) | ((value & 1) << 7);
        break;
      case BG_ANIM_SCREEN_BASE_BLOCK:
        runtime.sBgCnt = (runtime.sBgCnt & ~0x1f00) | ((value & 0x1f) << 8);
        break;
    }
    setGpuReg(runtime, gBattleAnimRegOffsBgCnt[bgId], runtime.sBgCnt);
  }
};

export const getAnimBgAttribute = (runtime: BattleIntroRuntime, bgId: number, attributeId: number): number => {
  if (bgId < 4) {
    const bgCnt = getGpuReg(runtime, gBattleIntroRegOffsBgCnt[bgId]);
    switch (attributeId) {
      case BG_ANIM_SCREEN_SIZE:
        return (bgCnt >> 14) & 3;
      case BG_ANIM_AREA_OVERFLOW_MODE:
        return (bgCnt >> 13) & 1;
      case BG_ANIM_MOSAIC:
        return (bgCnt >> 6) & 1;
      case BG_ANIM_CHAR_BASE_BLOCK:
        return (bgCnt >> 2) & 3;
      case BG_ANIM_PRIORITY:
        return bgCnt & 3;
      case BG_ANIM_PALETTES_MODE:
        return (bgCnt >> 7) & 1;
      case BG_ANIM_SCREEN_BASE_BLOCK:
        return (bgCnt >> 8) & 0x1f;
    }
  }
  return 0;
};

export const handleIntroSlide = (runtime: BattleIntroRuntime, terrain: number): number => {
  let taskId: number;

  if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
    taskId = createTask(runtime, 'BattleIntroSlideLink', 0);
  } else if ((runtime.gBattleTypeFlags & BATTLE_TYPE_KYOGRE_GROUDON) && runtime.gGameVersion !== VERSION_RUBY) {
    terrain = BATTLE_TERRAIN_UNDERWATER;
    taskId = createTask(runtime, 'BattleIntroSlide2', 0);
  } else {
    const funcs: readonly BattleIntroTaskFunc[] = [
      'BattleIntroSlide1',
      'BattleIntroSlide1',
      'BattleIntroSlide2',
      'BattleIntroSlide2',
      'BattleIntroSlide2',
      'BattleIntroSlide1',
      'BattleIntroSlide1',
      'BattleIntroSlide1',
      'BattleIntroSlide3',
      'BattleIntroSlide3'
    ];
    taskId = createTask(runtime, funcs[terrain], 0);
  }
  runtime.tasks[taskId].data[0] = 0;
  runtime.tasks[taskId].data[1] = terrain;
  runtime.tasks[taskId].data[2] = 0;
  runtime.tasks[taskId].data[3] = 0;
  runtime.tasks[taskId].data[4] = 0;
  runtime.tasks[taskId].data[5] = 0;
  runtime.tasks[taskId].data[6] = 0;
  return taskId;
};

export const battleIntroSlideEnd = (runtime: BattleIntroRuntime, taskId: number): void => {
  destroyTask(runtime, taskId);
  runtime.gBattle_BG1_X = 0;
  runtime.gBattle_BG1_Y = 0;
  runtime.gBattle_BG2_X = 0;
  runtime.gBattle_BG2_Y = 0;
  setGpuReg(runtime, REG_OFFSET_BLDCNT, 0);
  setGpuReg(runtime, REG_OFFSET_BLDALPHA, 0);
  setGpuReg(runtime, REG_OFFSET_BLDY, 0);
  setGpuReg(runtime, REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ | WININ_WIN1_CLR);
  setGpuReg(runtime, REG_OFFSET_WINOUT, WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR | WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR);
};

export const battleIntroSlide1 = (runtime: BattleIntroRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];

  runtime.gBattle_BG1_X = u16(runtime.gBattle_BG1_X + 6);
  switch (task.data[0]) {
    case 0:
      if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
        task.data[2] = 16;
        task.data[0] += 1;
      } else {
        task.data[2] = 1;
        task.data[0] += 1;
      }
      break;
    case 1:
      task.data[2] -= 1;
      if (task.data[2] === 0) {
        task.data[0] += 1;
        setGpuReg(runtime, REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
      }
      break;
    case 2:
      runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0xff);
      if ((runtime.gBattle_WIN0V & 0xff00) === 0x3000) {
        task.data[0] += 1;
        task.data[2] = 240;
        task.data[3] = 32;
        runtime.gIntroSlideFlags &= ~1;
      }
      break;
    case 3:
      if (task.data[3]) {
        task.data[3] -= 1;
      } else if (task.data[1] === BATTLE_TERRAIN_LONG_GRASS) {
        if (runtime.gBattle_BG1_Y !== 0xffb0) {
          runtime.gBattle_BG1_Y = u16(runtime.gBattle_BG1_Y - 2);
        }
      } else if (runtime.gBattle_BG1_Y !== 0xffc8) {
        runtime.gBattle_BG1_Y = u16(runtime.gBattle_BG1_Y - 1);
      }
      if (runtime.gBattle_WIN0V & 0xff00) {
        runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0x3fc);
      }
      if (task.data[2]) {
        task.data[2] -= 2;
      }
      writeScanlineBuffer(runtime, task.data[2]);
      if (!task.data[2]) {
        task.data[0] += 1;
        clearIntroSlideBg(runtime);
      }
      break;
    case 4:
      battleIntroSlideEnd(runtime, taskId);
      break;
  }
};

export const battleIntroSlide2 = (runtime: BattleIntroRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];

  switch (task.data[1]) {
    case BATTLE_TERRAIN_SAND:
    case BATTLE_TERRAIN_WATER:
      runtime.gBattle_BG1_X = u16(runtime.gBattle_BG1_X + 8);
      break;
    case BATTLE_TERRAIN_UNDERWATER:
      runtime.gBattle_BG1_X = u16(runtime.gBattle_BG1_X + 6);
      break;
  }
  if (task.data[1] === BATTLE_TERRAIN_WATER) {
    runtime.gBattle_BG1_Y = u16(i16(Math.trunc(cos2(task.data[6]) / 512) - 8));
    if (task.data[6] < 180) {
      task.data[6] += 4;
    } else {
      task.data[6] += 6;
    }
    if (task.data[6] === 360) {
      task.data[6] = 0;
    }
  }
  switch (task.data[0]) {
    case 0:
      task.data[4] = 16;
      if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
        task.data[2] = 16;
        task.data[0] += 1;
      } else {
        task.data[2] = 1;
        task.data[0] += 1;
      }
      break;
    case 1:
      task.data[2] -= 1;
      if (task.data[2] === 0) {
        task.data[0] += 1;
        setGpuReg(runtime, REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
      }
      break;
    case 2:
      runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0xff);
      if ((runtime.gBattle_WIN0V & 0xff00) === 0x3000) {
        task.data[0] += 1;
        task.data[2] = 240;
        task.data[3] = 32;
        task.data[5] = 1;
        runtime.gIntroSlideFlags &= ~1;
      }
      break;
    case 3:
      if (task.data[3]) {
        task.data[3] -= 1;
        if (task.data[3] === 0) {
          setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
          setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(15, 0));
          setGpuReg(runtime, REG_OFFSET_BLDY, 0);
        }
      } else if ((task.data[4] & 0x1f) && --task.data[5] === 0) {
        task.data[4] += 0xff;
        task.data[5] = 4;
      }
      if (runtime.gBattle_WIN0V & 0xff00) {
        runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0x3fc);
      }
      if (task.data[2]) {
        task.data[2] -= 2;
      }
      writeScanlineBuffer(runtime, task.data[2]);
      if (!task.data[2]) {
        task.data[0] += 1;
        clearIntroSlideBg(runtime);
      }
      break;
    case 4:
      battleIntroSlideEnd(runtime, taskId);
      break;
  }
  if (task.data[0] !== 4) {
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[4], 0));
  }
};

export const battleIntroSlide3 = (runtime: BattleIntroRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];

  runtime.gBattle_BG1_X = u16(runtime.gBattle_BG1_X + 8);
  switch (task.data[0]) {
    case 0:
      setGpuReg(runtime, REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ);
      setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(8, 8));
      setGpuReg(runtime, REG_OFFSET_BLDY, 0);
      task.data[4] = bldAlphaBlend(8, 8);
      if (runtime.gBattleTypeFlags & BATTLE_TYPE_LINK) {
        task.data[2] = 16;
        task.data[0] += 1;
      } else {
        task.data[2] = 1;
        task.data[0] += 1;
      }
      break;
    case 1:
      task.data[2] -= 1;
      if (task.data[2] === 0) {
        task.data[0] += 1;
        setGpuReg(runtime, REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
      }
      break;
    case 2:
      runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0xff);
      if ((runtime.gBattle_WIN0V & 0xff00) === 0x3000) {
        task.data[0] += 1;
        task.data[2] = 240;
        task.data[3] = 32;
        task.data[5] = 1;
        runtime.gIntroSlideFlags &= ~1;
      }
      break;
    case 3:
      if (task.data[3]) {
        task.data[3] -= 1;
      } else if ((task.data[4] & 0xf) && --task.data[5] === 0) {
        task.data[4] += 0xff;
        task.data[5] = 6;
      }
      if (runtime.gBattle_WIN0V & 0xff00) {
        runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0x3fc);
      }
      if (task.data[2]) {
        task.data[2] -= 2;
      }
      writeScanlineBuffer(runtime, task.data[2]);
      if (!task.data[2]) {
        task.data[0] += 1;
        clearIntroSlideBg(runtime);
      }
      break;
    case 4:
      battleIntroSlideEnd(runtime, taskId);
      break;
  }
  if (task.data[0] !== 4) {
    setGpuReg(runtime, REG_OFFSET_BLDALPHA, bldAlphaBlend(task.data[4], 0));
  }
};

export const battleIntroSlideLink = (runtime: BattleIntroRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];

  if (task.data[0] > 1 && !task.data[4]) {
    const var0 = runtime.gBattle_BG1_X & 0x8000;

    if (var0 || runtime.gBattle_BG1_X < 80) {
      runtime.gBattle_BG1_X = u16(runtime.gBattle_BG1_X + 3);
      runtime.gBattle_BG2_X = u16(runtime.gBattle_BG2_X - 3);
    } else {
      cpuFill32(runtime, 0, bgScreenAddr(28), BG_SCREEN_SIZE);
      cpuFill32(runtime, 0, bgScreenAddr(30), BG_SCREEN_SIZE);
      task.data[4] = 1;
    }
  }
  switch (task.data[0]) {
    case 0:
      task.data[2] = 32;
      task.data[0] += 1;
      break;
    case 1:
      task.data[2] -= 1;
      if (task.data[2] === 0) {
        task.data[0] += 1;
        runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_V].oam.objMode = ST_OAM_OBJ_WINDOW;
        runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_V].callback = SPRITE_CB_VS_LETTER_INIT;
        runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_S].oam.objMode = ST_OAM_OBJ_WINDOW;
        runtime.gSprites[runtime.gBattleStruct.linkBattleVsSpriteId_S].callback = SPRITE_CB_VS_LETTER_INIT;
        setGpuReg(runtime, REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);
        setGpuReg(runtime, REG_OFFSET_WINOUT, WINOUT_WINOBJ_BG_ALL | WINOUT_WINOBJ_OBJ | WINOUT_WINOBJ_CLR | WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2);
      }
      break;
    case 2:
      runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0xff);
      if ((runtime.gBattle_WIN0V & 0xff00) === 0x3000) {
        task.data[0] += 1;
        task.data[2] = 240;
        task.data[3] = 32;
        runtime.gIntroSlideFlags &= ~1;
      }
      break;
    case 3:
      if (runtime.gBattle_WIN0V & 0xff00) {
        runtime.gBattle_WIN0V = u16(runtime.gBattle_WIN0V - 0x3fc);
      }
      if (task.data[2]) {
        task.data[2] -= 2;
      }
      writeScanlineBuffer(runtime, task.data[2]);
      if (!task.data[2]) {
        runtime.gScanlineEffect.state = 3;
        task.data[0] += 1;
        setBgAttribute(runtime, 1, BG_ATTR_CHARBASEINDEX, 0);
        setBgAttribute(runtime, 2, BG_ATTR_CHARBASEINDEX, 0);
        setGpuReg(runtime, REG_OFFSET_BG1CNT, battleIntroBg1Cnt);
        setGpuReg(runtime, REG_OFFSET_BG2CNT, battleIntroBg2Cnt);
      }
      break;
    case 4:
      battleIntroSlideEnd(runtime, taskId);
      break;
  }
};

export const runBattleIntroTask = (runtime: BattleIntroRuntime, taskId: number): void => {
  switch (runtime.tasks[taskId].func) {
    case 'BattleIntroSlide1':
      battleIntroSlide1(runtime, taskId);
      break;
    case 'BattleIntroSlide2':
      battleIntroSlide2(runtime, taskId);
      break;
    case 'BattleIntroSlide3':
      battleIntroSlide3(runtime, taskId);
      break;
    case 'BattleIntroSlideLink':
      battleIntroSlideLink(runtime, taskId);
      break;
  }
};

export const copyBattlerSpriteToBg = (
  runtime: BattleIntroRuntime,
  bgId: number,
  x: number,
  y: number,
  battlerPosition: number,
  palno: number,
  tilesDest: number[],
  tilemapDest: number[],
  tilesOffset: number
): void => {
  const battler = getBattlerAtPosition(runtime, battlerPosition);
  let offset = tilesOffset;
  const sprites = runtime.gMonSpritesGfxPtr.sprites[battlerPosition] ?? [];

  copy16(sprites, BG_SCREEN_SIZE * (runtime.gBattleMonForms[battler] ?? 0), tilesDest, BG_SCREEN_SIZE);
  loadBgTiles(runtime, bgId, tilesDest, 0x1000, tilesOffset);
  for (let i = y; i < y + 8; i += 1) {
    for (let j = x; j < x + 8; j += 1) {
      tilemapDest[i * 32 + j] = offset++ | (palno << 12);
    }
  }
  loadBgTilemap(runtime, bgId, tilemapDest, BG_SCREEN_SIZE, 0);
};

export const drawBattlerOnBgDMA = (
  runtime: BattleIntroRuntime,
  arg0: number,
  arg1: number,
  battlerPosition: number,
  arg3: number,
  arg4: number,
  arg5: number,
  arg6: number,
  arg7: number
): void => {
  const sprites = runtime.gMonSpritesGfxPtr.sprites[battlerPosition] ?? [];
  let offset: number;

  dmaCopy16(runtime, 3, sprites, BG_SCREEN_SIZE * arg3, `${bgScreenAddr(0)}+${arg5}`, BG_SCREEN_SIZE);
  offset = (arg5 >> 5) - (arg7 << 9);
  for (let i = arg1; i < arg1 + 8; i += 1) {
    for (let j = arg0; j < arg0 + 8; j += 1) {
      runtime.bgVram[i * 32 + (j + (arg6 << 10))] = offset++ | (arg4 << 12);
    }
  }
};

export function SetAnimBgAttribute(
  runtime: BattleIntroRuntime,
  bgId: number,
  attributeId: number,
  value: number
): void {
  setAnimBgAttribute(runtime, bgId, attributeId, value);
}

export function GetAnimBgAttribute(
  runtime: BattleIntroRuntime,
  bgId: number,
  attributeId: number
): number {
  return getAnimBgAttribute(runtime, bgId, attributeId);
}

export function HandleIntroSlide(runtime: BattleIntroRuntime, terrain: number): number {
  return handleIntroSlide(runtime, terrain);
}

export function BattleIntroSlideEnd(runtime: BattleIntroRuntime, taskId: number): void {
  battleIntroSlideEnd(runtime, taskId);
}

export function BattleIntroSlide1(runtime: BattleIntroRuntime, taskId: number): void {
  battleIntroSlide1(runtime, taskId);
}

export function BattleIntroSlide2(runtime: BattleIntroRuntime, taskId: number): void {
  battleIntroSlide2(runtime, taskId);
}

export function BattleIntroSlide3(runtime: BattleIntroRuntime, taskId: number): void {
  battleIntroSlide3(runtime, taskId);
}

export function BattleIntroSlideLink(runtime: BattleIntroRuntime, taskId: number): void {
  battleIntroSlideLink(runtime, taskId);
}

export function CopyBattlerSpriteToBg(
  runtime: BattleIntroRuntime,
  bgId: number,
  x: number,
  y: number,
  battlerPosition: number,
  palno: number,
  tilesDest: number[],
  tilemapDest: number[],
  tilesOffset: number
): void {
  copyBattlerSpriteToBg(runtime, bgId, x, y, battlerPosition, palno, tilesDest, tilemapDest, tilesOffset);
}

export function DrawBattlerOnBgDMA(
  runtime: BattleIntroRuntime,
  arg0: number,
  arg1: number,
  battlerPosition: number,
  arg3: number,
  arg4: number,
  arg5: number,
  arg6: number,
  arg7: number
): void {
  drawBattlerOnBgDMA(runtime, arg0, arg1, battlerPosition, arg3, arg4, arg5, arg6, arg7);
}
