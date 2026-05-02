export const TILESTAG_FERRY = 3000;
export const TILESTAG_WAKE = 4000;
export const PALTAG_FERRY_WAKE = 3000;
export const MAX_SPRITES = 64;

export const SE_EXIT = 9;
export const SE_SHIP = 19;

export const DIRN_WESTBOUND = 0;
export const DIRN_EASTBOUND = 1;

export const SEAGALLOP_VERMILION_CITY = 0;
export const SEAGALLOP_ONE_ISLAND = 1;
export const SEAGALLOP_TWO_ISLAND = 2;
export const SEAGALLOP_THREE_ISLAND = 3;
export const SEAGALLOP_FOUR_ISLAND = 4;
export const SEAGALLOP_FIVE_ISLAND = 5;
export const SEAGALLOP_SIX_ISLAND = 6;
export const SEAGALLOP_SEVEN_ISLAND = 7;
export const SEAGALLOP_CINNABAR_ISLAND = 8;
export const SEAGALLOP_NAVEL_ROCK = 9;
export const SEAGALLOP_BIRTH_ISLAND = 10;

export const MAP_VERMILION_CITY = 5 | (3 << 8);
export const MAP_CINNABAR_ISLAND = 8 | (3 << 8);
export const MAP_SEVEN_ISLAND_HARBOR = 6 | (31 << 8);
export const MAP_ONE_ISLAND_HARBOR = 4 | (32 << 8);
export const MAP_TWO_ISLAND_HARBOR = 4 | (33 << 8);
export const MAP_FOUR_ISLAND_HARBOR = 5 | (35 << 8);
export const MAP_FIVE_ISLAND_HARBOR = 2 | (36 << 8);
export const MAP_SIX_ISLAND_HARBOR = 2 | (37 << 8);
export const MAP_THREE_ISLAND_HARBOR = 0 | (38 << 8);
export const MAP_BIRTH_ISLAND_HARBOR = 58 | (2 << 8);
export const MAP_NAVEL_ROCK_HARBOR = 59 | (2 << 8);

export const WARP_ID_NONE = -1;
export const RGB_BLACK = 0;
export const PALETTES_ALL = 0xffff;

export const DISPCNT_MODE_0 = 0x0000;
export const DISPCNT_OBJ_1D_MAP = 0x0040;
export const DISPCNT_BG0_ON = 0x0100;
export const DISPCNT_BG3_ON = 0x0800;
export const DISPCNT_OBJ_ON = 0x1000;
export const DISPCNT_WIN0_ON = 0x2000;

export const REG_OFFSET_DISPCNT = 0x00;
export const REG_OFFSET_BG0CNT = 0x08;
export const REG_OFFSET_BG0HOFS = 0x10;
export const REG_OFFSET_BG0VOFS = 0x12;
export const REG_OFFSET_BG1CNT = 0x0a;
export const REG_OFFSET_BG1HOFS = 0x14;
export const REG_OFFSET_BG1VOFS = 0x16;
export const REG_OFFSET_BG2CNT = 0x0c;
export const REG_OFFSET_BG2HOFS = 0x18;
export const REG_OFFSET_BG2VOFS = 0x1a;
export const REG_OFFSET_BG3CNT = 0x0e;
export const REG_OFFSET_BG3HOFS = 0x1c;
export const REG_OFFSET_BG3VOFS = 0x1e;
export const REG_OFFSET_WIN0H = 0x40;
export const REG_OFFSET_WIN0V = 0x44;
export const REG_OFFSET_WININ = 0x48;
export const REG_OFFSET_WINOUT = 0x4a;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDALPHA = 0x52;
export const REG_OFFSET_BLDY = 0x54;

export type SeagallopTaskFunc = 'Task_Seagallop_0' | 'Task_Seagallop_1' | 'Task_Seagallop_2';
export type SeagallopSpriteKind = 'ferry' | 'wake';

export interface SeagallopTask {
  func: SeagallopTaskFunc;
  priority: number;
  data: number[];
  destroyed: boolean;
}

export interface SeagallopSprite {
  id: number;
  kind: SeagallopSpriteKind;
  x: number;
  y: number;
  x2: number;
  y2: number;
  priority: number;
  data: number[];
  anim: number;
  animEnded: boolean;
  destroyed: boolean;
}

export interface SeagallopRuntime {
  gMain: { state: number };
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8006: number;
  gPaletteFade: { active: boolean };
  gSaveBlock1Ptr: { location: { mapGroup: number; mapNum: number }; pos: { x: number } };
  gFieldCallback: string | null;
  sBg3TilemapBuffer: unknown;
  tasks: SeagallopTask[];
  sprites: SeagallopSprite[];
  gpuRegs: Record<number, number>;
  bgX: Record<number, number>;
  bgY: Record<number, number>;
  shownBgs: number[];
  vBlankCallback: string | null;
  mainCallback2: string | null;
  helpSystemEnabled: boolean;
  playedSE: number[];
  loadedSpriteSheets: number[];
  loadedSpritePalettes: number[];
  freedSpriteTiles: number[];
  freedSpritePalettes: number[];
  sideEffects: string[];
  warpDestination: { mapGroup: number; mapNum: number; warpId: number; x: number; y: number } | null;
  dma3BusyWithBgCopy: number;
  bgMusicStopped: boolean;
  nextCreateSpriteResult: number | null;
}

export const sBGTemplates = [
  {
    bg: 3,
    charBaseIndex: 3,
    mapBaseIndex: 30,
    screenSize: 0,
    paletteMode: 0,
    priority: 3,
    baseTile: 0x000,
  },
] as const;

export const sSeag = [
  [MAP_GROUP(MAP_VERMILION_CITY), MAP_NUM(MAP_VERMILION_CITY), 0x17, 0x20],
  [MAP_GROUP(MAP_ONE_ISLAND_HARBOR), MAP_NUM(MAP_ONE_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_TWO_ISLAND_HARBOR), MAP_NUM(MAP_TWO_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_THREE_ISLAND_HARBOR), MAP_NUM(MAP_THREE_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_FOUR_ISLAND_HARBOR), MAP_NUM(MAP_FOUR_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_FIVE_ISLAND_HARBOR), MAP_NUM(MAP_FIVE_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_SIX_ISLAND_HARBOR), MAP_NUM(MAP_SIX_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_SEVEN_ISLAND_HARBOR), MAP_NUM(MAP_SEVEN_ISLAND_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_CINNABAR_ISLAND), MAP_NUM(MAP_CINNABAR_ISLAND), 0x15, 0x07],
  [MAP_GROUP(MAP_NAVEL_ROCK_HARBOR), MAP_NUM(MAP_NAVEL_ROCK_HARBOR), 0x08, 0x05],
  [MAP_GROUP(MAP_BIRTH_ISLAND_HARBOR), MAP_NUM(MAP_BIRTH_ISLAND_HARBOR), 0x08, 0x05],
] as const;

export const sTravelDirectionMatrix = [
  0x6fe,
  0x6fc,
  0x6f8,
  0x6f0,
  0x6e0,
  0x4c0,
  0x400,
  0x440,
  0x7ff,
  0x6e0,
  0x000,
] as const;

export const sSpriteAnims_Ferry_WB = [{ frame: 0, duration: 10 }, { end: true }] as const;
export const sSpriteAnims_Ferry_EB = [{ frame: 0, duration: 10, hFlip: true }, { end: true }] as const;
export const sSpriteAnimTable_Ferry = [sSpriteAnims_Ferry_WB, sSpriteAnims_Ferry_EB] as const;
export const sOamData_Ferry = { size: 3 } as const;
export const sFerrySpriteTemplate = {
  tileTag: TILESTAG_FERRY,
  paletteTag: PALTAG_FERRY_WAKE,
  oam: sOamData_Ferry,
  anims: sSpriteAnimTable_Ferry,
  callback: 'SpriteCB_Ferry',
} as const;

export const sSpriteAnims_Wake_WB = [
  { frame: 0x00, duration: 0x14 },
  { frame: 0x10, duration: 0x14 },
  { frame: 0x20, duration: 0x0f },
  { end: true },
] as const;
export const sSpriteAnims_Wake_EB = [
  { frame: 0x00, duration: 0x14, hFlip: true },
  { frame: 0x10, duration: 0x14, hFlip: true },
  { frame: 0x20, duration: 0x0f, hFlip: true },
  { end: true },
] as const;
export const sSpriteAnimTable_Wake = [sSpriteAnims_Wake_WB, sSpriteAnims_Wake_EB] as const;
export const sOamData_Wake = { size: 2 } as const;
export const sWakeSpriteTemplate = {
  tileTag: TILESTAG_WAKE,
  paletteTag: PALTAG_FERRY_WAKE,
  oam: sOamData_Wake,
  anims: sSpriteAnimTable_Wake,
  callback: 'SpriteCB_Wake',
} as const;

export function MAP_GROUP(map: number): number {
  return map >> 8;
}

export function MAP_NUM(map: number): number {
  return map & 0xff;
}

export function createSeagallopRuntime(): SeagallopRuntime {
  return {
    gMain: { state: 0 },
    gSpecialVar_0x8004: 0,
    gSpecialVar_0x8006: 0,
    gPaletteFade: { active: false },
    gSaveBlock1Ptr: { location: { mapGroup: 0, mapNum: 0 }, pos: { x: 0 } },
    gFieldCallback: null,
    sBg3TilemapBuffer: null,
    tasks: [],
    sprites: [],
    gpuRegs: {},
    bgX: {},
    bgY: {},
    shownBgs: [],
    vBlankCallback: null,
    mainCallback2: null,
    helpSystemEnabled: true,
    playedSE: [],
    loadedSpriteSheets: [],
    loadedSpritePalettes: [],
    freedSpriteTiles: [],
    freedSpritePalettes: [],
    sideEffects: [],
    warpDestination: null,
    dma3BusyWithBgCopy: 0,
    bgMusicStopped: true,
    nextCreateSpriteResult: null,
  };
}

export function DoSeagallopFerryScene(runtime: SeagallopRuntime): void {
  SetVBlankCallback(runtime, null);
  HelpSystem_Disable(runtime);
  SetMainCallback2(runtime, 'CB2_SetUpSeagallopScene');
}

export function CB2_SetUpSeagallopScene(runtime: SeagallopRuntime): void {
  switch (runtime.gMain.state) {
    case 0:
      SetVBlankCallback(runtime, null);
      ResetGPU(runtime);
      runtime.gMain.state += 1;
      break;
    case 1:
      ResetAllAssets(runtime);
      runtime.gMain.state += 1;
      break;
    case 2:
      runtime.sBg3TilemapBuffer = { zeroedBytes: 0x800 };
      runtime.sideEffects.push('ResetBgsAndClearDma3BusyFlags(0)');
      runtime.sideEffects.push('InitBgsFromTemplates(0,sBGTemplates,1)');
      runtime.sideEffects.push('SetBgTilemapBuffer(3,sBg3TilemapBuffer)');
      ResetBGPos(runtime);
      runtime.gMain.state += 1;
      break;
    case 3:
      runtime.sideEffects.push('LoadBgTiles(3,sWaterTiles,sizeof(sWaterTiles),0)');
      runtime.sideEffects.push(GetDirectionOfTravel(runtime) === DIRN_EASTBOUND
        ? 'CopyToBgTilemapBufferRect(3,sWaterTilemap_EB,0,0,32,32)'
        : 'CopyToBgTilemapBufferRect(3,sWaterTilemap_WB,0,0,32,32)');
      runtime.sideEffects.push('LoadPalette(sWaterPal,BG_PLTT_ID(4),sizeof(sWaterPal))');
      runtime.sideEffects.push('LoadPalette(GetTextWindowPalette(2),BG_PLTT_ID(15),PLTT_SIZE_4BPP)');
      runtime.gMain.state += 1;
      break;
    case 4:
      if (runtime.dma3BusyWithBgCopy !== DIRN_EASTBOUND) {
        ShowBg(runtime, 0);
        ShowBg(runtime, 3);
        runtime.sideEffects.push('CopyBgTilemapBufferToVram(3)');
        runtime.gMain.state += 1;
      }
      break;
    case 5:
      LoadFerrySpriteResources(runtime);
      runtime.sideEffects.push(`BlendPalettes(${PALETTES_ALL},16,${RGB_BLACK})`);
      runtime.gMain.state += 1;
      break;
    case 6:
      runtime.sideEffects.push(`BeginNormalPaletteFade(${PALETTES_ALL},0,16,0,${RGB_BLACK})`);
      runtime.gMain.state += 1;
      break;
    case 7:
      SetDispcnt(runtime);
      SetVBlankCallback(runtime, 'VBlankCB_SeaGallop');
      PlaySE(runtime, SE_SHIP);
      CreateFerrySprite(runtime);
      SetGpuRegBits(runtime, REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);
      SetGpuReg(runtime, REG_OFFSET_WININ, 0x3f);
      SetGpuReg(runtime, REG_OFFSET_WINOUT, 0x00);
      SetGpuReg(runtime, REG_OFFSET_WIN0H, 0x00f0);
      SetGpuReg(runtime, REG_OFFSET_WIN0V, 0x1888);
      CreateTask(runtime, 'Task_Seagallop_0', 8);
      SetMainCallback2(runtime, 'MainCB2_SeaGallop');
      runtime.gMain.state = 0;
      break;
  }
}

export function VBlankCB_SeaGallop(runtime: SeagallopRuntime): void {
  runtime.sideEffects.push('LoadOam');
  runtime.sideEffects.push('ProcessSpriteCopyRequests');
  runtime.sideEffects.push('TransferPlttBuffer');
}

export function MainCB2_SeaGallop(runtime: SeagallopRuntime): void {
  RunTasks(runtime);
  runtime.sideEffects.push('AnimateSprites');
  runtime.sideEffects.push('BuildOamBuffer');
  runtime.sideEffects.push('UpdatePaletteFade');
}

export function Task_Seagallop_0(runtime: SeagallopRuntime, taskId: number): void {
  runtime.tasks[taskId].func = 'Task_Seagallop_1';
}

export function ScrollBG(runtime: SeagallopRuntime): void {
  if (GetDirectionOfTravel(runtime) === DIRN_EASTBOUND) {
    ChangeBgX(runtime, 3, 0x600, 1);
  } else {
    ChangeBgX(runtime, 3, 0x600, 2);
  }
}

export function Task_Seagallop_1(runtime: SeagallopRuntime, taskId: number): void {
  const task = runtime.tasks[taskId];
  ScrollBG(runtime);
  task.data[1] += 1;
  if (task.data[1] === 140) {
    runtime.sideEffects.push('Overworld_FadeOutMapMusic');
    runtime.sideEffects.push('WarpFadeOutScreen');
    task.func = 'Task_Seagallop_2';
  }
}

export function Task_Seagallop_2(runtime: SeagallopRuntime, taskId: number): void {
  ScrollBG(runtime);
  if (runtime.bgMusicStopped && !runtime.gPaletteFade.active) {
    Task_Seagallop_3(runtime);
    HelpSystem_Enable(runtime);
    DestroyTask(runtime, taskId);
  }
}

export function Task_Seagallop_3(runtime: SeagallopRuntime): void {
  if (runtime.gSpecialVar_0x8006 >= sSeag.length) {
    runtime.gSpecialVar_0x8006 = 0;
  }
  const warpInfo = sSeag[runtime.gSpecialVar_0x8006];
  SetWarpDestination(runtime, warpInfo[0], warpInfo[1], WARP_ID_NONE, warpInfo[2], warpInfo[3]);
  runtime.sideEffects.push('PlayRainStoppingSoundEffect');
  PlaySE(runtime, SE_EXIT);
  runtime.gFieldCallback = 'FieldCB_DefaultWarpExit';
  runtime.sideEffects.push('WarpIntoMap');
  SetMainCallback2(runtime, 'CB2_LoadMap');
  runtime.sideEffects.push('ResetInitialPlayerAvatarState');
  FreeFerrySpriteResources(runtime);
  runtime.sBg3TilemapBuffer = null;
  runtime.sideEffects.push('Free(sBg3TilemapBuffer)');
  runtime.sideEffects.push('FreeAllWindowBuffers');
}

export function ResetGPU(runtime: SeagallopRuntime): void {
  runtime.sideEffects.push('DmaClearLarge16(3,VRAM,VRAM_SIZE,0x1000)');
  runtime.sideEffects.push('DmaClear32(3,OAM,OAM_SIZE)');
  runtime.sideEffects.push('DmaClear16(3,PLTT,PLTT_SIZE)');
  for (const reg of [
    REG_OFFSET_DISPCNT,
    REG_OFFSET_BG0CNT,
    REG_OFFSET_BG0HOFS,
    REG_OFFSET_BG0VOFS,
    REG_OFFSET_BG1CNT,
    REG_OFFSET_BG1HOFS,
    REG_OFFSET_BG1VOFS,
    REG_OFFSET_BG2CNT,
    REG_OFFSET_BG2HOFS,
    REG_OFFSET_BG2VOFS,
    REG_OFFSET_BG3CNT,
    REG_OFFSET_BG3HOFS,
    REG_OFFSET_BG3VOFS,
    REG_OFFSET_WIN0H,
    REG_OFFSET_WIN0V,
    REG_OFFSET_WININ,
    REG_OFFSET_WINOUT,
    REG_OFFSET_BLDCNT,
    REG_OFFSET_BLDALPHA,
    REG_OFFSET_BLDY,
  ]) {
    SetGpuReg(runtime, reg, 0);
  }
}

export function ResetAllAssets(runtime: SeagallopRuntime): void {
  runtime.sideEffects.push('ScanlineEffect_Stop');
  runtime.tasks = [];
  runtime.sideEffects.push('ResetTasks');
  runtime.sprites = [];
  runtime.sideEffects.push('ResetSpriteData');
  runtime.sideEffects.push('ResetAllPicSprites');
  runtime.gPaletteFade.active = false;
  runtime.sideEffects.push('ResetPaletteFade');
  runtime.sideEffects.push('FreeAllSpritePalettes');
}

export function SetDispcnt(runtime: SeagallopRuntime): void {
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG3_ON | DISPCNT_OBJ_ON);
}

export function ResetBGPos(runtime: SeagallopRuntime): void {
  for (let bg = 0; bg < 4; bg += 1) {
    ChangeBgX(runtime, bg, 0, 0);
    ChangeBgY(runtime, bg, 0, 0);
  }
}

export function LoadFerrySpriteResources(runtime: SeagallopRuntime): void {
  runtime.loadedSpriteSheets.push(TILESTAG_WAKE, TILESTAG_FERRY);
  runtime.loadedSpritePalettes.push(PALTAG_FERRY_WAKE);
}

export function FreeFerrySpriteResources(runtime: SeagallopRuntime): void {
  runtime.freedSpriteTiles.push(TILESTAG_FERRY, TILESTAG_WAKE);
  runtime.freedSpritePalettes.push(PALTAG_FERRY_WAKE);
}

export function CreateFerrySprite(runtime: SeagallopRuntime): number {
  const spriteId = CreateSprite(runtime, 'ferry', 0, 92, 0);
  runtime.sprites[spriteId].data[0] = 48;
  if (GetDirectionOfTravel(runtime) === DIRN_EASTBOUND) {
    StartSpriteAnim(runtime, spriteId, 1);
  } else {
    runtime.sprites[spriteId].x = 240;
    runtime.sprites[spriteId].data[0] *= -1;
  }
  return spriteId;
}

export function SpriteCB_Ferry(runtime: SeagallopRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  sprite.data[1] += sprite.data[0];
  sprite.x2 = sprite.data[1] >> 4;
  if (sprite.data[2] % 5 === 0) {
    CreateWakeSprite(runtime, sprite.x + sprite.x2);
  }
  sprite.data[2] += 1;
  if (((300 + sprite.x2) & 0xffff) > 600) {
    DestroySprite(runtime, spriteId);
  }
}

export function CreateWakeSprite(runtime: SeagallopRuntime, x: number): number {
  const spriteId = CreateSprite(runtime, 'wake', x, 92, 8);
  if (spriteId !== MAX_SPRITES && GetDirectionOfTravel(runtime) === DIRN_EASTBOUND) {
    StartSpriteAnim(runtime, spriteId, 1);
  }
  return spriteId;
}

export function SpriteCB_Wake(runtime: SeagallopRuntime, spriteId: number): void {
  const sprite = runtime.sprites[spriteId];
  if (sprite.animEnded) {
    DestroySprite(runtime, spriteId);
  }
}

export function GetDirectionOfTravel(runtime: Pick<SeagallopRuntime, 'gSpecialVar_0x8004' | 'gSpecialVar_0x8006'>): number {
  if (runtime.gSpecialVar_0x8004 >= sTravelDirectionMatrix.length) {
    return DIRN_EASTBOUND;
  }
  return (sTravelDirectionMatrix[runtime.gSpecialVar_0x8004] >> runtime.gSpecialVar_0x8006) & 1;
}

export function GetSeagallopNumber(runtime: Pick<SeagallopRuntime, 'gSpecialVar_0x8004' | 'gSpecialVar_0x8006'>): number {
  const originId = runtime.gSpecialVar_0x8004;
  const destId = runtime.gSpecialVar_0x8006;

  if (originId === SEAGALLOP_CINNABAR_ISLAND || destId === SEAGALLOP_CINNABAR_ISLAND) return 1;
  if (originId === SEAGALLOP_VERMILION_CITY || destId === SEAGALLOP_VERMILION_CITY) return 7;
  if (originId === SEAGALLOP_NAVEL_ROCK || destId === SEAGALLOP_NAVEL_ROCK) return 10;
  if (originId === SEAGALLOP_BIRTH_ISLAND || destId === SEAGALLOP_BIRTH_ISLAND) return 12;
  if (
    (originId === SEAGALLOP_ONE_ISLAND || originId === SEAGALLOP_TWO_ISLAND || originId === SEAGALLOP_THREE_ISLAND)
    && (destId === SEAGALLOP_ONE_ISLAND || destId === SEAGALLOP_TWO_ISLAND || destId === SEAGALLOP_THREE_ISLAND)
  ) return 2;
  if (
    (originId === SEAGALLOP_FOUR_ISLAND || originId === SEAGALLOP_FIVE_ISLAND)
    && (destId === SEAGALLOP_FOUR_ISLAND || destId === SEAGALLOP_FIVE_ISLAND)
  ) return 3;
  if (
    (originId === SEAGALLOP_SIX_ISLAND || originId === SEAGALLOP_SEVEN_ISLAND)
    && (destId === SEAGALLOP_SIX_ISLAND || destId === SEAGALLOP_SEVEN_ISLAND)
  ) return 5;
  return 6;
}

export function IsPlayerLeftOfVermilionSailor(runtime: Pick<SeagallopRuntime, 'gSaveBlock1Ptr'>): boolean {
  return runtime.gSaveBlock1Ptr.location.mapGroup === MAP_GROUP(MAP_VERMILION_CITY)
    && runtime.gSaveBlock1Ptr.location.mapNum === MAP_NUM(MAP_VERMILION_CITY)
    && runtime.gSaveBlock1Ptr.pos.x < 24;
}

function SetVBlankCallback(runtime: SeagallopRuntime, callback: string | null): void {
  runtime.vBlankCallback = callback;
}

function SetMainCallback2(runtime: SeagallopRuntime, callback: string | null): void {
  runtime.mainCallback2 = callback;
}

function HelpSystem_Disable(runtime: SeagallopRuntime): void {
  runtime.helpSystemEnabled = false;
}

function HelpSystem_Enable(runtime: SeagallopRuntime): void {
  runtime.helpSystemEnabled = true;
}

function SetGpuReg(runtime: SeagallopRuntime, reg: number, value: number): void {
  runtime.gpuRegs[reg] = value & 0xffff;
}

function SetGpuRegBits(runtime: SeagallopRuntime, reg: number, value: number): void {
  runtime.gpuRegs[reg] = ((runtime.gpuRegs[reg] ?? 0) | value) & 0xffff;
}

function ChangeBgX(runtime: SeagallopRuntime, bg: number, value: number, op: number): void {
  if (op === 0) runtime.bgX[bg] = value;
  else if (op === 1) runtime.bgX[bg] = (runtime.bgX[bg] ?? 0) + value;
  else if (op === 2) runtime.bgX[bg] = (runtime.bgX[bg] ?? 0) - value;
}

function ChangeBgY(runtime: SeagallopRuntime, bg: number, value: number, op: number): void {
  if (op === 0) runtime.bgY[bg] = value;
  else if (op === 1) runtime.bgY[bg] = (runtime.bgY[bg] ?? 0) + value;
  else if (op === 2) runtime.bgY[bg] = (runtime.bgY[bg] ?? 0) - value;
}

function ShowBg(runtime: SeagallopRuntime, bg: number): void {
  runtime.shownBgs.push(bg);
}

function PlaySE(runtime: SeagallopRuntime, song: number): void {
  runtime.playedSE.push(song);
}

function CreateTask(runtime: SeagallopRuntime, func: SeagallopTaskFunc, priority: number): number {
  const id = runtime.tasks.length;
  runtime.tasks.push({ func, priority, data: Array.from({ length: 16 }, () => 0), destroyed: false });
  return id;
}

function DestroyTask(runtime: SeagallopRuntime, taskId: number): void {
  runtime.tasks[taskId].destroyed = true;
}

function RunTasks(runtime: SeagallopRuntime): void {
  for (let taskId = 0; taskId < runtime.tasks.length; taskId += 1) {
    const task = runtime.tasks[taskId];
    if (task.destroyed) continue;
    if (task.func === 'Task_Seagallop_0') Task_Seagallop_0(runtime, taskId);
    else if (task.func === 'Task_Seagallop_1') Task_Seagallop_1(runtime, taskId);
    else Task_Seagallop_2(runtime, taskId);
  }
}

function CreateSprite(runtime: SeagallopRuntime, kind: SeagallopSpriteKind, x: number, y: number, priority: number): number {
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
    data: Array.from({ length: 8 }, () => 0),
    anim: 0,
    animEnded: false,
    destroyed: false,
  });
  return id;
}

function DestroySprite(runtime: SeagallopRuntime, spriteId: number): void {
  runtime.sprites[spriteId].destroyed = true;
}

function StartSpriteAnim(runtime: SeagallopRuntime, spriteId: number, anim: number): void {
  runtime.sprites[spriteId].anim = anim;
}

function SetWarpDestination(runtime: SeagallopRuntime, mapGroup: number, mapNum: number, warpId: number, x: number, y: number): void {
  runtime.warpDestination = { mapGroup, mapNum, warpId, x, y };
}
