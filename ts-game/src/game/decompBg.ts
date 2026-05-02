export const BG_CTRL_ATTR_VISIBLE = 1;
export const BG_CTRL_ATTR_CHARBASEINDEX = 2;
export const BG_CTRL_ATTR_MAPBASEINDEX = 3;
export const BG_CTRL_ATTR_SCREENSIZE = 4;
export const BG_CTRL_ATTR_PALETTEMODE = 5;
export const BG_CTRL_ATTR_PRIORITY = 6;
export const BG_CTRL_ATTR_MOSAIC = 7;
export const BG_CTRL_ATTR_WRAPAROUND = 8;

export const BG_ATTR_CHARBASEINDEX = 1;
export const BG_ATTR_MAPBASEINDEX = 2;
export const BG_ATTR_SCREENSIZE = 3;
export const BG_ATTR_PALETTEMODE = 4;
export const BG_ATTR_MOSAIC = 5;
export const BG_ATTR_WRAPAROUND = 6;
export const BG_ATTR_PRIORITY = 7;
export const BG_ATTR_MAPSIZE = 8;
export const BG_ATTR_BGTYPE = 9;
export const BG_ATTR_BASETILE = 10;

export const BG_COORD_SET = 0;
export const BG_COORD_ADD = 1;
export const BG_COORD_SUB = 2;

export const BG_MOSAIC_SET = 0;
export const BG_MOSAIC_SET_H = 1;
export const BG_MOSAIC_INC_H = 2;
export const BG_MOSAIC_DEC_H = 3;
export const BG_MOSAIC_SET_V = 4;
export const BG_MOSAIC_INC_V = 5;
export const BG_MOSAIC_DEC_V = 6;

export const BG_TILE_FIND_FREE_SPACE = 0;
export const BG_TILE_ALLOC = 1;
export const BG_TILE_FREE = 2;

export const DISPCNT_MODE_1 = 1;
export const DISPCNT_MODE_2 = 2;
export const REG_OFFSET_DISPCNT = 0x00;
export const REG_OFFSET_BG0CNT = 0x08;
export const REG_OFFSET_BG1CNT = 0x0a;
export const REG_OFFSET_BG2CNT = 0x0c;
export const REG_OFFSET_BG3CNT = 0x0e;
export const REG_OFFSET_BG0HOFS = 0x10;
export const REG_OFFSET_BG0VOFS = 0x12;
export const REG_OFFSET_BG1HOFS = 0x14;
export const REG_OFFSET_BG1VOFS = 0x16;
export const REG_OFFSET_BG2HOFS = 0x18;
export const REG_OFFSET_BG2VOFS = 0x1a;
export const REG_OFFSET_BG3HOFS = 0x1c;
export const REG_OFFSET_BG3VOFS = 0x1e;
export const REG_OFFSET_BG2PA = 0x20;
export const REG_OFFSET_BG2PB = 0x22;
export const REG_OFFSET_BG2PC = 0x24;
export const REG_OFFSET_BG2PD = 0x26;
export const REG_OFFSET_BG2X_L = 0x28;
export const REG_OFFSET_BG2X_H = 0x2a;
export const REG_OFFSET_BG2Y_L = 0x2c;
export const REG_OFFSET_BG2Y_H = 0x2e;
export const REG_OFFSET_BG3X_L = 0x38;
export const REG_OFFSET_BG3X_H = 0x3a;
export const REG_OFFSET_BG3Y_L = 0x3c;
export const REG_OFFSET_BG3Y_H = 0x3e;
export const REG_OFFSET_MOSAIC = 0x4c;

export const BG_VRAM = 0x06000000;
export const BG_PLTT = 0x05000000;
export const BG_CHAR_SIZE = 0x4000;
export const BG_SCREEN_SIZE = 0x800;
export const TILE_SIZE_4BPP = 0x20;
export const IWRAM_END = 0x03007fff;

const DISPCNT_BG_ALL_ON = 0x0f00;
const DISPCNT_ALL_BG_AND_MODE_BITS = DISPCNT_BG_ALL_ON | 0x7;
const DMA3_16BIT = 0x10;
const U32_MAX = 0xffffffff;

export interface BgTemplate {
  bg: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  screenSize: number;
  paletteMode: number;
  priority: number;
  baseTile: number;
}

export interface BgControlConfig {
  visible: number;
  unknown_1: number;
  screenSize: number;
  priority: number;
  mosaic: number;
  wraparound: number;
  charBaseIndex: number;
  mapBaseIndex: number;
  paletteMode: number;
  unknown_2: number;
  unknown_3: number;
}

export interface BgConfig2 {
  baseTile: number;
  basePalette: number;
  unk_3: number;
  tilemap: TilemapBuffer;
  bg_x: number;
  bg_y: number;
}

export type TilemapBuffer = Uint16Array | Uint8Array | number | null;

export interface DmaRequest {
  cursor: number;
  src: unknown;
  dest: number;
  size: number;
  mode: number;
}

export interface BgAffineSrcData {
  texX: number;
  texY: number;
  scrX: number;
  scrY: number;
  sx: number;
  sy: number;
  alpha: number;
}

export interface BgAffineDstData {
  pa: number;
  pb: number;
  pc: number;
  pd: number;
  dx: number;
  dy: number;
}

export interface BgRuntime {
  sGpuBgConfigs: {
    configs: BgControlConfig[];
    bgVisibilityAndMode: number;
  };
  sGpuBgConfigs2: BgConfig2[];
  sDmaBusyBitfield: number[];
  gpu_tile_allocation_map_bg: Uint8Array;
  gWindowTileAutoAllocEnabled: number;
  gpuRegs: Map<number, number>;
  dmaRequests: DmaRequest[];
  nextDmaCursor: number;
  busyDmaCursors: Set<number>;
  operations: string[];
  affineSet: (src: BgAffineSrcData) => BgAffineDstData;
}

const zeroedBgControlStruct = (): BgControlConfig => ({
  visible: 0,
  unknown_1: 0,
  screenSize: 0,
  priority: 0,
  mosaic: 0,
  wraparound: 0,
  charBaseIndex: 0,
  mapBaseIndex: 0,
  paletteMode: 0,
  unknown_2: 0,
  unknown_3: 0
});

const zeroedBgConfig2 = (): BgConfig2 => ({
  baseTile: 0,
  basePalette: 0,
  unk_3: 0,
  tilemap: null,
  bg_x: 0,
  bg_y: 0
});

const toU8 = (value: number): number => value & 0xff;
const toU16 = (value: number): number => value & 0xffff;
const toU32 = (value: number): number => value >>> 0;
const s16 = (value: number): number => {
  const u16 = value & 0xffff;
  return u16 & 0x8000 ? u16 - 0x10000 : u16;
};

const defaultAffineSet = (src: BgAffineSrcData): BgAffineDstData => {
  const radians = ((src.alpha & 0xff) * Math.PI * 2) / 0x100;
  const sin = Math.round(Math.sin(radians) * 0x100);
  const cos = Math.round(Math.cos(radians) * 0x100);
  const pa = s16((cos * src.sx) >> 8);
  const pb = s16((-sin * src.sx) >> 8);
  const pc = s16((sin * src.sy) >> 8);
  const pd = s16((cos * src.sy) >> 8);
  const dx = toU32(src.texX - src.scrX * pa - src.scrY * pb);
  const dy = toU32(src.texY - src.scrX * pc - src.scrY * pd);
  return { pa, pb, pc, pd, dx, dy };
};

export const createBgRuntime = (): BgRuntime => ({
  sGpuBgConfigs: {
    configs: [zeroedBgControlStruct(), zeroedBgControlStruct(), zeroedBgControlStruct(), zeroedBgControlStruct()],
    bgVisibilityAndMode: 0
  },
  sGpuBgConfigs2: [zeroedBgConfig2(), zeroedBgConfig2(), zeroedBgConfig2(), zeroedBgConfig2()],
  sDmaBusyBitfield: [0, 0, 0, 0],
  gpu_tile_allocation_map_bg: new Uint8Array(0x100),
  gWindowTileAutoAllocEnabled: 0,
  gpuRegs: new Map<number, number>(),
  dmaRequests: [],
  nextDmaCursor: 0,
  busyDmaCursors: new Set<number>(),
  operations: [],
  affineSet: defaultAffineSet
});

export const SetGpuReg = (runtime: BgRuntime, offset: number, value: number): void => {
  runtime.gpuRegs.set(toU16(offset), toU16(value));
};

export const GetGpuReg = (runtime: BgRuntime, offset: number): number => runtime.gpuRegs.get(toU16(offset)) ?? 0;

const RequestDma3Copy = (runtime: BgRuntime, src: unknown, dest: number, size: number, mode: number): number => {
  const cursor = s16(runtime.nextDmaCursor);
  if (cursor === -1) {
    return -1;
  }
  runtime.nextDmaCursor = toU8(runtime.nextDmaCursor + 1);
  runtime.dmaRequests.push({ cursor: toU8(cursor), src, dest: toU32(dest), size: toU16(size), mode: toU16(mode) });
  return toU8(cursor);
};

const WaitDma3Request = (runtime: BgRuntime, cursor: number): number => (runtime.busyDmaCursors.has(cursor) ? -1 : cursor);

export const ResetBgs = (runtime: BgRuntime): void => {
  ResetBgControlStructs(runtime);
  runtime.sGpuBgConfigs.bgVisibilityAndMode = 0;
  SetTextModeAndHideBgs(runtime);
};

export const SetBgModeInternal = (runtime: BgRuntime, bgMode: number): void => {
  runtime.sGpuBgConfigs.bgVisibilityAndMode &= 0xfff8;
  runtime.sGpuBgConfigs.bgVisibilityAndMode |= toU8(bgMode);
};

export const SetBgMode = SetBgModeInternal;

export const GetBgMode = (runtime: BgRuntime): number => runtime.sGpuBgConfigs.bgVisibilityAndMode & 0x7;

export const ResetBgControlStructs = (runtime: BgRuntime): void => {
  for (let i = 0; i < 4; i++) {
    runtime.sGpuBgConfigs.configs[i] = zeroedBgControlStruct();
  }
};

export const Unused_ResetBgControlStruct = (runtime: BgRuntime, bg: number): void => {
  if (IsInvalidBg(bg) === 0) {
    runtime.sGpuBgConfigs.configs[toU8(bg)] = zeroedBgControlStruct();
  }
};

export const SetBgControlAttributes = (
  runtime: BgRuntime,
  bg: number,
  charBaseIndex: number,
  mapBaseIndex: number,
  screenSize: number,
  paletteMode: number,
  priority: number,
  mosaic: number,
  wraparound: number
): void => {
  if (IsInvalidBg(bg) === 0) {
    const config = runtime.sGpuBgConfigs.configs[toU8(bg)];
    if (charBaseIndex !== 0xff) config.charBaseIndex = charBaseIndex & 0x3;
    if (mapBaseIndex !== 0xff) config.mapBaseIndex = mapBaseIndex & 0x1f;
    if (screenSize !== 0xff) config.screenSize = screenSize & 0x3;
    if (paletteMode !== 0xff) config.paletteMode = paletteMode;
    if (priority !== 0xff) config.priority = priority & 0x3;
    if (mosaic !== 0xff) config.mosaic = mosaic & 0x1;
    if (wraparound !== 0xff) config.wraparound = wraparound;
    config.unknown_2 = 0;
    config.unknown_3 = 0;
    config.visible = 1;
  }
};

export const GetBgControlAttribute = (runtime: BgRuntime, bg: number, attributeId: number): number => {
  if (IsInvalidBg(bg) === 0 && runtime.sGpuBgConfigs.configs[toU8(bg)].visible !== 0) {
    const config = runtime.sGpuBgConfigs.configs[toU8(bg)];
    switch (attributeId) {
      case BG_CTRL_ATTR_VISIBLE:
        return config.visible;
      case BG_CTRL_ATTR_CHARBASEINDEX:
        return config.charBaseIndex;
      case BG_CTRL_ATTR_MAPBASEINDEX:
        return config.mapBaseIndex;
      case BG_CTRL_ATTR_SCREENSIZE:
        return config.screenSize;
      case BG_CTRL_ATTR_PALETTEMODE:
        return config.paletteMode;
      case BG_CTRL_ATTR_PRIORITY:
        return config.priority;
      case BG_CTRL_ATTR_MOSAIC:
        return config.mosaic;
      case BG_CTRL_ATTR_WRAPAROUND:
        return config.wraparound;
    }
  }
  return 0xff;
};

export const LoadBgVram = (runtime: BgRuntime, bg: number, src: unknown, size: number, destOffset: number, mode: number): number => {
  let offset = 0;
  let cursor = -1;
  if (IsInvalidBg(bg) === 0 && runtime.sGpuBgConfigs.configs[toU8(bg)].visible !== 0) {
    switch (mode) {
      case 0x1:
        offset = runtime.sGpuBgConfigs.configs[toU8(bg)].charBaseIndex * BG_CHAR_SIZE;
        break;
      case 0x2:
        offset = runtime.sGpuBgConfigs.configs[toU8(bg)].mapBaseIndex * BG_SCREEN_SIZE;
        break;
      default:
        cursor = -1;
        return cursor;
    }
    offset = toU16(destOffset + offset);
    cursor = RequestDma3Copy(runtime, src, offset + BG_VRAM, size, DMA3_16BIT);
    if (cursor === -1) return 0xff;
  } else {
    return 0xff;
  }
  return toU8(cursor);
};

export const ShowBgInternal = (runtime: BgRuntime, bg: number): void => {
  if (IsInvalidBg(bg) === 0 && runtime.sGpuBgConfigs.configs[toU8(bg)].visible !== 0) {
    const config = runtime.sGpuBgConfigs.configs[toU8(bg)];
    const value =
      config.priority |
      (config.charBaseIndex << 2) |
      (config.mosaic << 6) |
      (config.paletteMode << 7) |
      (config.mapBaseIndex << 8) |
      (config.wraparound << 13) |
      (config.screenSize << 14);
    SetGpuReg(runtime, (toU8(bg) << 1) + 0x8, value);
    runtime.sGpuBgConfigs.bgVisibilityAndMode |= 1 << (toU8(bg) + 8);
    runtime.sGpuBgConfigs.bgVisibilityAndMode &= DISPCNT_ALL_BG_AND_MODE_BITS;
  }
};

export const HideBgInternal = (runtime: BgRuntime, bg: number): void => {
  if (IsInvalidBg(bg) === 0) {
    runtime.sGpuBgConfigs.bgVisibilityAndMode &= ~(1 << (toU8(bg) + 8));
    runtime.sGpuBgConfigs.bgVisibilityAndMode &= DISPCNT_ALL_BG_AND_MODE_BITS;
  }
};

export const SyncBgVisibilityAndMode = (runtime: BgRuntime): void => {
  SetGpuReg(
    runtime,
    REG_OFFSET_DISPCNT,
    (GetGpuReg(runtime, REG_OFFSET_DISPCNT) & ~DISPCNT_ALL_BG_AND_MODE_BITS) | runtime.sGpuBgConfigs.bgVisibilityAndMode
  );
};

export const SetTextModeAndHideBgs = (runtime: BgRuntime): void => {
  SetGpuReg(runtime, REG_OFFSET_DISPCNT, GetGpuReg(runtime, REG_OFFSET_DISPCNT) & ~DISPCNT_ALL_BG_AND_MODE_BITS);
};

export const SetBgAffineInternal = (
  runtime: BgRuntime,
  bg: number,
  srcCenterX: number,
  srcCenterY: number,
  dispCenterX: number,
  dispCenterY: number,
  scaleX: number,
  scaleY: number,
  rotationAngle: number
): void => {
  switch (runtime.sGpuBgConfigs.bgVisibilityAndMode & 0x7) {
    case 1:
      if (bg !== 2) return;
      break;
    case 2:
      if (bg < 2 || bg > 3) return;
      break;
    case 0:
    default:
      return;
  }
  const dest = runtime.affineSet({
    texX: toU32(srcCenterX),
    texY: toU32(srcCenterY),
    scrX: s16(dispCenterX),
    scrY: s16(dispCenterY),
    sx: s16(scaleX),
    sy: s16(scaleY),
    alpha: toU16(rotationAngle)
  });
  SetGpuReg(runtime, REG_OFFSET_BG2PA, dest.pa);
  SetGpuReg(runtime, REG_OFFSET_BG2PB, dest.pb);
  SetGpuReg(runtime, REG_OFFSET_BG2PC, dest.pc);
  SetGpuReg(runtime, REG_OFFSET_BG2PD, dest.pd);
  SetGpuReg(runtime, REG_OFFSET_BG2PA, dest.pa);
  SetGpuReg(runtime, REG_OFFSET_BG2X_L, s16(dest.dx));
  SetGpuReg(runtime, REG_OFFSET_BG2X_H, s16(dest.dx >> 16));
  SetGpuReg(runtime, REG_OFFSET_BG2Y_L, s16(dest.dy));
  SetGpuReg(runtime, REG_OFFSET_BG2Y_H, s16(dest.dy >> 16));
};

export const IsInvalidBg = (bg: number): number => (bg > 3 ? 1 : 0);
export const IsInvalidBg32 = IsInvalidBg;

export const BgTileAllocOp = (runtime: BgRuntime, bg: number, offsetArg: number, count: number, mode: number): number => {
  let start = 0;
  let end = 0;
  switch (mode) {
    case BG_TILE_FIND_FREE_SPACE: {
      start = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_CHARBASEINDEX) * (BG_CHAR_SIZE / TILE_SIZE_4BPP);
      end = start + 0x400;
      if (end > 0x800) end = 0x800;
      let blockSize = 0;
      let blockStart = 0;
      let offset = 0;
      for (let i = start; i < end; i++, offset++) {
        if (((runtime.gpu_tile_allocation_map_bg[Math.trunc(i / 8)] >> (i % 8)) & 1) === 0) {
          if (blockSize !== 0) {
            blockSize++;
            if (blockSize === count) return blockStart;
          } else {
            blockStart = offset;
            blockSize = 1;
          }
        } else {
          blockSize = 0;
        }
      }
      return -1;
    }
    case BG_TILE_ALLOC:
      start = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_CHARBASEINDEX) * (BG_CHAR_SIZE / TILE_SIZE_4BPP) + offsetArg;
      end = start + count;
      for (let i = start; i < end; i++) runtime.gpu_tile_allocation_map_bg[Math.trunc(i / 8)] |= 1 << (i % 8);
      break;
    case BG_TILE_FREE:
      start = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_CHARBASEINDEX) * (BG_CHAR_SIZE / TILE_SIZE_4BPP) + offsetArg;
      end = start + count;
      for (let i = start; i < end; i++) runtime.gpu_tile_allocation_map_bg[Math.trunc(i / 8)] &= ~(1 << (i % 8));
      break;
  }
  return 0;
};

export const ResetBgsAndClearDma3BusyFlags = (runtime: BgRuntime, enableWindowTileAutoAlloc: number): void => {
  ResetBgs(runtime);
  for (let i = 0; i < 4; i++) runtime.sDmaBusyBitfield[i] = 0;
  runtime.gWindowTileAutoAllocEnabled = enableWindowTileAutoAlloc;
  runtime.gpu_tile_allocation_map_bg.fill(0);
};

const initBgFromTemplateBody = (runtime: BgRuntime, template: BgTemplate): void => {
  const bg = template.bg;
  if (bg < 4) {
    SetBgControlAttributes(
      runtime,
      bg,
      template.charBaseIndex,
      template.mapBaseIndex,
      template.screenSize,
      template.paletteMode,
      template.priority,
      0,
      0
    );
    runtime.sGpuBgConfigs2[bg].baseTile = template.baseTile;
    runtime.sGpuBgConfigs2[bg].basePalette = 0;
    runtime.sGpuBgConfigs2[bg].unk_3 = 0;
    runtime.sGpuBgConfigs2[bg].tilemap = null;
    runtime.sGpuBgConfigs2[bg].bg_x = 0;
    runtime.sGpuBgConfigs2[bg].bg_y = 0;
    runtime.gpu_tile_allocation_map_bg[Math.trunc((template.charBaseIndex * (BG_CHAR_SIZE / TILE_SIZE_4BPP)) / 8)] = 1;
  }
};

export const InitBgsFromTemplates = (runtime: BgRuntime, bgMode: number, templates: BgTemplate[], numTemplates: number): void => {
  SetBgModeInternal(runtime, bgMode);
  ResetBgControlStructs(runtime);
  for (let i = 0; i < numTemplates; i++) initBgFromTemplateBody(runtime, templates[i]);
};

export const InitBgFromTemplate = (runtime: BgRuntime, template: BgTemplate): void => {
  initBgFromTemplateBody(runtime, template);
};

const markDmaBusy = (runtime: BgRuntime, cursor: number): void => {
  runtime.sDmaBusyBitfield[Math.trunc(cursor / 0x20)] |= 1 << (cursor % 0x20);
};

export const LoadBgTiles = (runtime: BgRuntime, bg: number, src: unknown, size: number, destOffset: number): number => {
  const tileOffset =
    GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_PALETTEMODE) === 0
      ? (runtime.sGpuBgConfigs2[toU8(bg)].baseTile + destOffset) * 0x20
      : (runtime.sGpuBgConfigs2[toU8(bg)].baseTile + destOffset) * 0x40;
  const cursor = LoadBgVram(runtime, bg, src, size, tileOffset, DISPCNT_MODE_1);
  if (cursor === 0xff) return U32_MAX;
  markDmaBusy(runtime, cursor);
  if (runtime.gWindowTileAutoAllocEnabled === 1) {
    BgTileAllocOp(runtime, bg, Math.trunc(tileOffset / 0x20), Math.trunc(size / 0x20), BG_TILE_ALLOC);
  }
  return cursor;
};

export const LoadBgTilemap = (runtime: BgRuntime, bg: number, src: unknown, size: number, destOffset: number): number => {
  const cursor = LoadBgVram(runtime, bg, src, size, destOffset * 32, DISPCNT_MODE_2);
  if (cursor === 0xff) return U32_MAX;
  markDmaBusy(runtime, cursor);
  return cursor;
};

export const Unused_LoadBgPalette = (runtime: BgRuntime, bg: number, src: unknown, size: number, destOffset: number): number => {
  if (IsInvalidBg32(bg) !== 0) return U32_MAX;
  const paletteOffset = runtime.sGpuBgConfigs2[toU8(bg)].basePalette * 0x20 + destOffset * 2;
  const cursor = RequestDma3Copy(runtime, src, paletteOffset + BG_PLTT, size, DMA3_16BIT);
  if (cursor === -1) return U32_MAX;
  markDmaBusy(runtime, cursor);
  return toU8(cursor);
};

export const IsDma3ManagerBusyWithBgCopy = (runtime: BgRuntime): number => {
  for (let i = 0; i < 0x80; i++) {
    const div = Math.trunc(i / 0x20);
    const mod = i % 0x20;
    if ((runtime.sDmaBusyBitfield[div] & (1 << mod)) !== 0) {
      const reqSpace = WaitDma3Request(runtime, i);
      if (reqSpace === -1) return 1;
      runtime.sDmaBusyBitfield[div] &= ~(1 << mod);
    }
  }
  return 0;
};

export const ShowBg = (runtime: BgRuntime, bg: number): void => {
  ShowBgInternal(runtime, bg);
  SyncBgVisibilityAndMode(runtime);
};

export const HideBg = (runtime: BgRuntime, bg: number): void => {
  HideBgInternal(runtime, bg);
  SyncBgVisibilityAndMode(runtime);
};

export const SetBgAttribute = (runtime: BgRuntime, bg: number, attributeId: number, value: number): void => {
  switch (attributeId) {
    case 1:
      SetBgControlAttributes(runtime, bg, value, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff);
      break;
    case 2:
      SetBgControlAttributes(runtime, bg, 0xff, value, 0xff, 0xff, 0xff, 0xff, 0xff);
      break;
    case 3:
      SetBgControlAttributes(runtime, bg, 0xff, 0xff, value, 0xff, 0xff, 0xff, 0xff);
      break;
    case 4:
      SetBgControlAttributes(runtime, bg, 0xff, 0xff, 0xff, value, 0xff, 0xff, 0xff);
      break;
    case 7:
      SetBgControlAttributes(runtime, bg, 0xff, 0xff, 0xff, 0xff, value, 0xff, 0xff);
      break;
    case 5:
      SetBgControlAttributes(runtime, bg, 0xff, 0xff, 0xff, 0xff, 0xff, value, 0xff);
      break;
    case 6:
      SetBgControlAttributes(runtime, bg, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, value);
      break;
  }
};

export const GetBgAttribute = (runtime: BgRuntime, bg: number, attributeId: number): number => {
  switch (attributeId) {
    case BG_ATTR_CHARBASEINDEX:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_CHARBASEINDEX);
    case BG_ATTR_MAPBASEINDEX:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_MAPBASEINDEX);
    case BG_ATTR_SCREENSIZE:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_SCREENSIZE);
    case BG_ATTR_PALETTEMODE:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_PALETTEMODE);
    case BG_ATTR_PRIORITY:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_PRIORITY);
    case BG_ATTR_MOSAIC:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_MOSAIC);
    case BG_ATTR_WRAPAROUND:
      return GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_WRAPAROUND);
    case BG_ATTR_MAPSIZE:
      switch (GetBgType(runtime, bg)) {
        case 0:
          return GetBgMetricTextMode(runtime, bg, 0) * 0x800;
        case 1:
          return GetBgMetricAffineMode(runtime, bg, 0) * 0x100;
        default:
          return 0;
      }
    case BG_ATTR_BGTYPE:
      return GetBgType(runtime, bg);
    case BG_ATTR_BASETILE:
      return runtime.sGpuBgConfigs2[toU8(bg)].baseTile;
    default:
      return U32_MAX;
  }
};

export const ChangeBgX = (runtime: BgRuntime, bg: number, value: number, op: number): number => {
  if (IsInvalidBg32(bg) !== 0 || GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) === 0) return U32_MAX;
  const config2 = runtime.sGpuBgConfigs2[toU8(bg)];
  switch (op) {
    case BG_COORD_SET:
    default:
      config2.bg_x = toU32(value);
      break;
    case BG_COORD_ADD:
      config2.bg_x = toU32(config2.bg_x + value);
      break;
    case BG_COORD_SUB:
      config2.bg_x = toU32(config2.bg_x - value);
      break;
  }
  const mode = GetBgMode(runtime);
  switch (bg) {
    case 0:
      SetGpuReg(runtime, REG_OFFSET_BG0HOFS, config2.bg_x >> 8);
      break;
    case 1:
      SetGpuReg(runtime, REG_OFFSET_BG1HOFS, config2.bg_x >> 8);
      break;
    case 2:
      if (mode === 0) {
        SetGpuReg(runtime, REG_OFFSET_BG2HOFS, config2.bg_x >> 8);
      } else {
        SetGpuReg(runtime, REG_OFFSET_BG2X_H, config2.bg_x >> 16);
        SetGpuReg(runtime, REG_OFFSET_BG2X_L, config2.bg_x & 0xffff);
      }
      break;
    case 3:
      if (mode === 0) {
        SetGpuReg(runtime, REG_OFFSET_BG3HOFS, config2.bg_x >> 8);
      } else if (mode === 2) {
        SetGpuReg(runtime, REG_OFFSET_BG3X_H, config2.bg_x >> 16);
        SetGpuReg(runtime, REG_OFFSET_BG3X_L, config2.bg_x & 0xffff);
      }
      break;
  }
  return config2.bg_x;
};

export const GetBgX = (runtime: BgRuntime, bg: number): number => {
  if (IsInvalidBg32(bg) !== 0) return U32_MAX;
  if (GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) === 0) return U32_MAX;
  return runtime.sGpuBgConfigs2[toU8(bg)].bg_x;
};

export const ChangeBgY = (runtime: BgRuntime, bg: number, value: number, op: number): number => {
  if (IsInvalidBg32(bg) !== 0 || GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) === 0) return U32_MAX;
  const config2 = runtime.sGpuBgConfigs2[toU8(bg)];
  switch (op) {
    case BG_COORD_SET:
    default:
      config2.bg_y = toU32(value);
      break;
    case BG_COORD_ADD:
      config2.bg_y = toU32(config2.bg_y + value);
      break;
    case BG_COORD_SUB:
      config2.bg_y = toU32(config2.bg_y - value);
      break;
  }
  const mode = GetBgMode(runtime);
  switch (bg) {
    case 0:
      SetGpuReg(runtime, REG_OFFSET_BG0VOFS, config2.bg_y >> 8);
      break;
    case 1:
      SetGpuReg(runtime, REG_OFFSET_BG1VOFS, config2.bg_y >> 8);
      break;
    case 2:
      if (mode === 0) {
        SetGpuReg(runtime, REG_OFFSET_BG2VOFS, config2.bg_y >> 8);
      } else {
        SetGpuReg(runtime, REG_OFFSET_BG2Y_H, config2.bg_y >> 16);
        SetGpuReg(runtime, REG_OFFSET_BG2Y_L, config2.bg_y & 0xffff);
      }
      break;
    case 3:
      if (mode === 0) {
        SetGpuReg(runtime, REG_OFFSET_BG3VOFS, config2.bg_y >> 8);
      } else if (mode === 2) {
        SetGpuReg(runtime, REG_OFFSET_BG3Y_H, config2.bg_y >> 16);
        SetGpuReg(runtime, REG_OFFSET_BG3Y_L, config2.bg_y & 0xffff);
      }
      break;
  }
  return config2.bg_y;
};

export const ChangeBgY_ScreenOff = ChangeBgY;

export const GetBgY = (runtime: BgRuntime, bg: number): number => {
  if (IsInvalidBg32(bg) !== 0) return U32_MAX;
  if (GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) === 0) return U32_MAX;
  return runtime.sGpuBgConfigs2[toU8(bg)].bg_y;
};

export const SetBgAffine = (
  runtime: BgRuntime,
  bg: number,
  srcCenterX: number,
  srcCenterY: number,
  dispCenterX: number,
  dispCenterY: number,
  scaleX: number,
  scaleY: number,
  rotationAngle: number
): void => {
  SetBgAffineInternal(runtime, bg, srcCenterX, srcCenterY, dispCenterX, dispCenterY, scaleX, scaleY, rotationAngle);
};

export const AdjustBgMosaic = (runtime: BgRuntime, value: number, mode: number): number => {
  let mosaicSize = GetGpuReg(runtime, REG_OFFSET_MOSAIC);
  let bgMosaicH = mosaicSize & 0xf;
  let bgMosaicV = (mosaicSize >> 4) & 0xf;
  mosaicSize &= 0xff00;
  switch (mode) {
    case BG_MOSAIC_SET:
    default:
      bgMosaicH = value & 0xf;
      bgMosaicV = value >> 4;
      break;
    case BG_MOSAIC_SET_H:
      bgMosaicH = value & 0xf;
      break;
    case BG_MOSAIC_INC_H:
      bgMosaicH = bgMosaicH + value > 0xf ? 0xf : bgMosaicH + value;
      break;
    case BG_MOSAIC_DEC_H:
      bgMosaicH = bgMosaicH - value < 0 ? 0 : bgMosaicH - value;
      break;
    case BG_MOSAIC_SET_V:
      bgMosaicV = value & 0xf;
      break;
    case BG_MOSAIC_INC_V:
      bgMosaicV = bgMosaicV + value > 0xf ? 0xf : bgMosaicV + value;
      break;
    case BG_MOSAIC_DEC_V:
      bgMosaicV = bgMosaicV - value < 0 ? 0 : bgMosaicV - value;
      break;
  }
  mosaicSize |= (bgMosaicV << 4) & 0xf0;
  mosaicSize |= bgMosaicH & 0xf;
  SetGpuReg(runtime, REG_OFFSET_MOSAIC, mosaicSize);
  return toU8(mosaicSize);
};

export const SetBgTilemapBuffer = (runtime: BgRuntime, bg: number, tilemap: TilemapBuffer): void => {
  if (IsInvalidBg32(bg) === 0 && GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) !== 0) {
    runtime.sGpuBgConfigs2[toU8(bg)].tilemap = tilemap;
  }
};

export const UnsetBgTilemapBuffer = (runtime: BgRuntime, bg: number): void => {
  if (IsInvalidBg32(bg) === 0 && GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) !== 0) {
    runtime.sGpuBgConfigs2[toU8(bg)].tilemap = null;
  }
};

export const GetBgTilemapBuffer = (runtime: BgRuntime, bg: number): TilemapBuffer => {
  if (IsInvalidBg32(bg) !== 0) return null;
  if (GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_VISIBLE) === 0) return null;
  return runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
};

const toU16Source = (src: ArrayLike<number>): Uint16Array => {
  if (src instanceof Uint16Array) return src;
  const out = new Uint16Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = src[i] & 0xffff;
  return out;
};

const toU8Source = (src: ArrayLike<number>): Uint8Array => {
  if (src instanceof Uint8Array) return src;
  const out = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = src[i] & 0xff;
  return out;
};

export const CopyToBgTilemapBuffer = (runtime: BgRuntime, bg: number, src: ArrayLike<number>, mode: number, destOffset: number): void => {
  if (IsInvalidBg32(bg) === 0 && IsTileMapOutsideWram(runtime, bg) === 0) {
    const tilemap = runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
    if (tilemap instanceof Uint16Array) {
      const srcCopy = toU16Source(src);
      const words = mode !== 0 ? Math.trunc(mode / 2) : srcCopy.length;
      tilemap.set(srcCopy.slice(0, words), destOffset * 16);
    } else if (tilemap instanceof Uint8Array) {
      const srcCopy = toU8Source(src);
      const bytes = mode !== 0 ? mode : srcCopy.length;
      tilemap.set(srcCopy.slice(0, bytes), destOffset * 32);
    }
  }
};

export const CopyBgTilemapBufferToVram = (runtime: BgRuntime, bg: number): void => {
  if (IsInvalidBg32(bg) === 0 && IsTileMapOutsideWram(runtime, bg) === 0) {
    let sizeToLoad = 0;
    switch (GetBgType(runtime, bg)) {
      case 0:
        sizeToLoad = GetBgMetricTextMode(runtime, bg, 0) * 0x800;
        break;
      case 1:
        sizeToLoad = GetBgMetricAffineMode(runtime, bg, 0) * 0x100;
        break;
    }
    LoadBgVram(runtime, bg, runtime.sGpuBgConfigs2[toU8(bg)].tilemap, sizeToLoad, 0, 2);
  }
};

export const CopyToBgTilemapBufferRect = (
  runtime: BgRuntime,
  bg: number,
  src: ArrayLike<number>,
  destX: number,
  destY: number,
  width: number,
  height: number
): void => {
  if (IsInvalidBg32(bg) === 0 && IsTileMapOutsideWram(runtime, bg) === 0) {
    const tilemap = runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
    switch (GetBgType(runtime, bg)) {
      case 0: {
        if (!(tilemap instanceof Uint16Array)) return;
        const srcCopy = toU16Source(src);
        let srcIndex = 0;
        for (let y = destY; y < destY + height; y++) {
          for (let x = destX; x < destX + width; x++) tilemap[y * 0x20 + x] = srcCopy[srcIndex++];
        }
        break;
      }
      case 1: {
        if (!(tilemap instanceof Uint8Array)) return;
        const srcCopy = toU8Source(src);
        const mode = GetBgMetricAffineMode(runtime, bg, 1);
        let srcIndex = 0;
        for (let y = destY; y < destY + height; y++) {
          for (let x = destX; x < destX + width; x++) tilemap[y * mode + x] = srcCopy[srcIndex++];
        }
        break;
      }
    }
  }
};

export const CopyToBgTilemapBufferRect_ChangePalette = (
  runtime: BgRuntime,
  bg: number,
  src: ArrayLike<number>,
  destX: number,
  destY: number,
  rectWidth: number,
  rectHeight: number,
  palette: number
): void => {
  CopyRectToBgTilemapBufferRect(runtime, bg, src, 0, 0, rectWidth, rectHeight, destX, destY, rectWidth, rectHeight, palette, 0, 0);
};

export const CopyRectToBgTilemapBufferRect = (
  runtime: BgRuntime,
  bg: number,
  src: ArrayLike<number>,
  srcX: number,
  srcY: number,
  srcWidth: number,
  srcHeight: number,
  destX: number,
  destY: number,
  rectWidth: number,
  rectHeight: number,
  palette1: number,
  tileOffset: number,
  palette2: number
): void => {
  void srcHeight;
  if (IsInvalidBg32(bg) === 0 && IsTileMapOutsideWram(runtime, bg) === 0) {
    const tilemap = runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
    const screenSize = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_SCREENSIZE);
    const screenWidth = GetBgMetricTextMode(runtime, bg, 1) * 0x20;
    const screenHeight = GetBgMetricTextMode(runtime, bg, 2) * 0x20;
    switch (GetBgType(runtime, bg)) {
      case 0: {
        if (!(tilemap instanceof Uint16Array)) return;
        const srcCopy = toU16Source(src);
        let srcPtr = srcY * srcWidth + srcX;
        for (let i = destY; i < destY + rectHeight; i++) {
          for (let j = destX; j < destX + rectWidth; j++) {
            const index = GetTileMapIndexFromCoords(j, i, screenSize, screenWidth, screenHeight);
            tilemap[index] = CopyTileMapEntryValue(srcCopy[srcPtr], tilemap[index], palette1, tileOffset, palette2);
            srcPtr++;
          }
          srcPtr += srcWidth - rectWidth;
        }
        break;
      }
      case 1: {
        if (!(tilemap instanceof Uint8Array)) return;
        const srcCopy = toU8Source(src);
        let srcPtr = srcY * srcWidth + srcX;
        const widthMetric = GetBgMetricAffineMode(runtime, bg, 1);
        for (let i = destY; i < destY + rectHeight; i++) {
          for (let j = destX; j < destX + rectWidth; j++) {
            tilemap[widthMetric * i + j] = toU8(srcCopy[srcPtr] + tileOffset);
            srcPtr++;
          }
          srcPtr += srcWidth - rectWidth;
        }
        break;
      }
    }
  }
};

export const FillBgTilemapBufferRect_Palette0 = (
  runtime: BgRuntime,
  bg: number,
  tileNum: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  if (IsInvalidBg32(bg) === 0 && IsTileMapOutsideWram(runtime, bg) === 0) {
    const tilemap = runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
    switch (GetBgType(runtime, bg)) {
      case 0:
        if (!(tilemap instanceof Uint16Array)) return;
        for (let y16 = y; y16 < y + height; y16++) {
          for (let x16 = x; x16 < x + width; x16++) tilemap[y16 * 0x20 + x16] = toU16(tileNum);
        }
        break;
      case 1: {
        if (!(tilemap instanceof Uint8Array)) return;
        const mode = GetBgMetricAffineMode(runtime, bg, 1);
        for (let y16 = y; y16 < y + height; y16++) {
          for (let x16 = x; x16 < x + width; x16++) tilemap[y16 * mode + x16] = toU8(tileNum);
        }
        break;
      }
    }
  }
};

export const FillBgTilemapBufferRect = (
  runtime: BgRuntime,
  bg: number,
  tileNum: number,
  x: number,
  y: number,
  width: number,
  height: number,
  palette: number
): void => {
  WriteSequenceToBgTilemapBuffer(runtime, bg, tileNum, x, y, width, height, palette, 0);
};

export const WriteSequenceToBgTilemapBuffer = (
  runtime: BgRuntime,
  bg: number,
  firstTileNumArg: number,
  x: number,
  y: number,
  width: number,
  height: number,
  paletteSlot: number,
  tileNumDelta: number
): void => {
  if (IsInvalidBg32(bg) === 0 && IsTileMapOutsideWram(runtime, bg) === 0) {
    const tilemap = runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
    const attribute = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_SCREENSIZE);
    const mode = GetBgMetricTextMode(runtime, bg, 1) * 0x20;
    const mode2 = GetBgMetricTextMode(runtime, bg, 2) * 0x20;
    let firstTileNum = toU16(firstTileNumArg);
    switch (GetBgType(runtime, bg)) {
      case 0:
        if (!(tilemap instanceof Uint16Array)) return;
        for (let y16 = y; y16 < y + height; y16++) {
          for (let x16 = x; x16 < x + width; x16++) {
            const index = GetTileMapIndexFromCoords(x16, y16, attribute, mode, mode2);
            tilemap[index] = CopyTileMapEntryValue(firstTileNum, tilemap[index], paletteSlot, 0, 0);
            firstTileNum = toU16((firstTileNum & 0xfc00) + ((firstTileNum + tileNumDelta) & 0x3ff));
          }
        }
        break;
      case 1: {
        if (!(tilemap instanceof Uint8Array)) return;
        const mode3 = GetBgMetricAffineMode(runtime, bg, 1);
        for (let y16 = y; y16 < y + height; y16++) {
          for (let x16 = x; x16 < x + width; x16++) {
            tilemap[y16 * mode3 + x16] = toU8(firstTileNum);
            firstTileNum = toU16((firstTileNum & 0xfc00) + ((firstTileNum + tileNumDelta) & 0x3ff));
          }
        }
        break;
      }
    }
  }
};

export const GetBgMetricTextMode = (runtime: BgRuntime, bg: number, whichMetric: number): number => {
  const attribute = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_SCREENSIZE);
  switch (whichMetric) {
    case 0:
      switch (attribute) {
        case 0:
          return 1;
        case 1:
        case 2:
          return 2;
        case 3:
          return 4;
      }
      break;
    case 1:
      switch (attribute) {
        case 0:
          return 1;
        case 1:
          return 2;
        case 2:
          return 1;
        case 3:
          return 2;
      }
      break;
    case 2:
      switch (attribute) {
        case 0:
        case 1:
          return 1;
        case 2:
        case 3:
          return 2;
      }
      break;
  }
  return 0;
};

export const GetBgMetricAffineMode = (runtime: BgRuntime, bg: number, whichMetric: number): number => {
  const attribute = GetBgControlAttribute(runtime, bg, BG_CTRL_ATTR_SCREENSIZE);
  switch (whichMetric) {
    case 0:
      switch (attribute) {
        case 0:
          return 0x1;
        case 1:
          return 0x4;
        case 2:
          return 0x10;
        case 3:
          return 0x40;
      }
      break;
    case 1:
    case 2:
      return 0x10 << attribute;
  }
  return 0;
};

export const GetTileMapIndexFromCoords = (
  xArg: number,
  yArg: number,
  screenSize: number,
  screenWidth: number,
  screenHeight: number
): number => {
  let x = xArg & (screenWidth - 1);
  let y = yArg & (screenHeight - 1);
  switch (screenSize) {
    case 0:
    case 2:
      break;
    case 3:
      if (y >= 0x20) y += 0x20;
    case 1:
      if (x >= 0x20) {
        x -= 0x20;
        y += 0x20;
      }
      break;
  }
  return y * 0x20 + x;
};

const CopyTileMapEntryValue = (src: number, dest: number, palette1: number, tileOffset: number, palette2: number): number => {
  switch (palette1) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
      return toU16(((src + tileOffset) & 0xfff) + ((palette1 + palette2) << 12));
    case 16:
      return toU16((dest & 0xfc00) + (palette2 << 12) + ((src + tileOffset) & 0x3ff));
    default:
      return toU16(src + tileOffset + (palette2 << 12));
  }
};

export const CopyTileMapEntry = (
  src: Uint16Array,
  srcIndex: number,
  dest: Uint16Array,
  destIndex: number,
  palette1: number,
  tileOffset: number,
  palette2: number
): void => {
  dest[destIndex] = CopyTileMapEntryValue(src[srcIndex], dest[destIndex], palette1, tileOffset, palette2);
};

export const GetBgType = (runtime: BgRuntime, bg: number): number => {
  const mode = GetBgMode(runtime);
  switch (bg) {
    case 0:
    case 1:
      switch (mode) {
        case 0:
        case 1:
          return 0;
      }
      break;
    case 2:
      switch (mode) {
        case 0:
          return 0;
        case 1:
        case 2:
          return 1;
      }
      break;
    case 3:
      switch (mode) {
        case 0:
          return 0;
        case 2:
          return 1;
      }
      break;
  }
  return 0xffff;
};

export const IsTileMapOutsideWram = (runtime: BgRuntime, bg: number): number => {
  const tilemap = runtime.sGpuBgConfigs2[toU8(bg)].tilemap;
  if (typeof tilemap === 'number' && tilemap > IWRAM_END) return 1;
  if (tilemap === null || tilemap === 0) return 1;
  return 0;
};
