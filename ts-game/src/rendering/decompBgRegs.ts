export const BG_LAYER_COUNT = 4;
export const BG_SCREEN_TILE_WIDTH = 32;
export const BG_SCREEN_TILE_HEIGHT = 32;
export const BG_TILE_SIZE = 8;
export const BG_MAP_ENTRY_SIZE = 2;
export const BG_BYTES_PER_ROW = BG_SCREEN_TILE_WIDTH * BG_MAP_ENTRY_SIZE;

export const BG_CONTROL_REG_OFFSETS = [0x08, 0x0a, 0x0c, 0x0e] as const;
export const BG_HOFFSET_REG_OFFSETS = [0x10, 0x14, 0x18, 0x1c] as const;
export const BG_VOFFSET_REG_OFFSETS = [0x12, 0x16, 0x1a, 0x1e] as const;

export const DISPCNT_BG_FLAGS = [0x0100, 0x0200, 0x0400, 0x0800] as const;
export const OVERWORLD_BACKGROUND_LAYER_FLAGS = [0x0100, 0x0200, 0x0400, 0x0800] as const;
export const BLDCNT_TARGET1_BG_FLAGS = [0x0001, 0x0002, 0x0004, 0x0008] as const;

export const getBgControlRegOffset = (bgLayer: number): number => BG_CONTROL_REG_OFFSETS[bgLayer] ?? 0;
export const getBgHOffsetRegOffset = (bgLayer: number): number => BG_HOFFSET_REG_OFFSETS[bgLayer] ?? 0;
export const getBgVOffsetRegOffset = (bgLayer: number): number => BG_VOFFSET_REG_OFFSETS[bgLayer] ?? 0;
export const getDispcntBgFlag = (bgLayer: number): number => DISPCNT_BG_FLAGS[bgLayer] ?? 0;
export const getOverworldBackgroundLayerFlag = (bgLayer: number): number =>
  OVERWORLD_BACKGROUND_LAYER_FLAGS[bgLayer] ?? 0;
export const getBldcntTarget1BgFlag = (bgLayer: number): number => BLDCNT_TARGET1_BG_FLAGS[bgLayer] ?? 0;
