export const MARKER_CIRCULAR = 0;
export const MARKER_SMALL_H = 1;
export const MARKER_SMALL_V = 2;
export const MARKER_MED_H = 3;
export const MARKER_MED_V = 4;
export const MARKER_LARGE_H = 5;
export const MARKER_LARGE_V = 6;
export const TAG_NONE = 0xffff;

export const DEX_AREA_NONE = 0;
export const DEX_AREA_PALLET_TOWN = 1;
export const DEX_AREA_VIRIDIAN_CITY = 2;
export const DEX_AREA_PEWTER_CITY = 3;
export const DEX_AREA_CERULEAN_CITY = 4;
export const DEX_AREA_LAVENDER_TOWN = 5;
export const DEX_AREA_VERMILION_CITY = 6;
export const DEX_AREA_CELADON_CITY = 7;
export const DEX_AREA_FUCHSIA_CITY = 8;
export const DEX_AREA_CINNABAR_ISLAND = 9;
export const DEX_AREA_INDIGO_PLATEAU = 10;
export const DEX_AREA_SAFFRON_CITY = 11;
export const DEX_AREA_ROUTE_1 = 12;
export const DEX_AREA_ROUTE_2 = 13;
export const DEX_AREA_ROUTE_3 = 14;
export const DEX_AREA_ROUTE_4 = 15;
export const DEX_AREA_ROUTE_5 = 16;
export const DEX_AREA_ROUTE_6 = 17;
export const DEX_AREA_ROUTE_7 = 18;
export const DEX_AREA_ROUTE_8 = 19;
export const DEX_AREA_ROUTE_9 = 20;
export const DEX_AREA_ROUTE_10 = 21;
export const DEX_AREA_ROUTE_11 = 22;
export const DEX_AREA_ROUTE_12 = 23;
export const DEX_AREA_ROUTE_13 = 24;
export const DEX_AREA_ROUTE_14 = 25;
export const DEX_AREA_ROUTE_15 = 26;
export const DEX_AREA_ROUTE_16 = 27;
export const DEX_AREA_ROUTE_17 = 28;
export const DEX_AREA_ROUTE_18 = 29;
export const DEX_AREA_ROUTE_19 = 30;
export const DEX_AREA_ROUTE_20 = 31;
export const DEX_AREA_ROUTE_21 = 32;
export const DEX_AREA_ROUTE_22 = 33;
export const DEX_AREA_ROUTE_23 = 34;
export const DEX_AREA_ROUTE_24 = 35;
export const DEX_AREA_ROUTE_25 = 36;
export const DEX_AREA_VIRIDIAN_FOREST = 37;
export const DEX_AREA_DIGLETTS_CAVE = 38;
export const DEX_AREA_MT_MOON = 39;
export const DEX_AREA_CERULEAN_CAVE = 40;
export const DEX_AREA_ROCK_TUNNEL = 41;
export const DEX_AREA_POWER_PLANT = 42;
export const DEX_AREA_POKEMON_TOWER = 43;
export const DEX_AREA_SAFARI_ZONE = 44;
export const DEX_AREA_SEAFOAM_ISLANDS = 45;
export const DEX_AREA_POKEMON_MANSION = 46;
export const DEX_AREA_VICTORY_ROAD = 47;
export const DEX_AREA_ONE_ISLAND = 48;
export const DEX_AREA_TWO_ISLAND = 49;
export const DEX_AREA_THREE_ISLAND = 50;
export const DEX_AREA_FOUR_ISLAND = 51;
export const DEX_AREA_FIVE_ISLAND = 52;
export const DEX_AREA_SIX_ISLAND = 53;
export const DEX_AREA_SEVEN_ISLAND = 54;
export const DEX_AREA_KINDLE_ROAD = 55;
export const DEX_AREA_TREASURE_BEACH = 56;
export const DEX_AREA_CAPE_BRINK = 57;
export const DEX_AREA_BOND_BRIDGE = 58;
export const DEX_AREA_THREE_ISLE_PATH = 59;
export const DEX_AREA_RESORT_GORGEOUS = 60;
export const DEX_AREA_WATER_LABYRINTH = 61;
export const DEX_AREA_FIVE_ISLE_MEADOW = 62;
export const DEX_AREA_MEMORIAL_PILLAR = 63;
export const DEX_AREA_OUTCAST_ISLAND = 64;
export const DEX_AREA_GREEN_PATH = 65;
export const DEX_AREA_WATER_PATH = 66;
export const DEX_AREA_RUIN_VALLEY = 67;
export const DEX_AREA_TRAINER_TOWER = 68;
export const DEX_AREA_CANYON_ENTRANCE = 69;
export const DEX_AREA_SEVAULT_CANYON = 70;
export const DEX_AREA_TANOBY_RUINS = 71;
export const DEX_AREA_MT_EMBER = 72;
export const DEX_AREA_BERRY_FOREST = 73;
export const DEX_AREA_ICEFALL_CAVE = 74;
export const DEX_AREA_LOST_CAVE = 75;
export const DEX_AREA_ALTERING_CAVE = 76;
export const DEX_AREA_PATTERN_BUSH = 77;
export const DEX_AREA_DOTTED_HOLE = 78;
export const DEX_AREA_TANOBY_CHAMBER = 79;

export interface PokedexAreaMarkerSubsprite {
  size: string;
  shape: string;
  priority: number;
  tileOffset: number;
  x: number;
  y: number;
}

interface AreaMarkerEntry {
  marker: number;
  x: number;
  y: number;
}

export interface PokedexAreaMarkerSprite {
  x: number;
  y: number;
  tileTag: number;
  paletteNum: number;
  objMode: 'window';
  subspriteTableNum: number;
  invisible: boolean;
  subsprites: PokedexAreaMarkerSubsprite[];
}

export interface PokedexAreaMarkerTaskData {
  subsprites: PokedexAreaMarkerSubsprite[];
  buffer: PokedexAreaMarkerSubsprite[];
  unused: number;
  spriteId: number;
  tilesTag: number;
  paletteTag: number;
}

export interface PokedexAreaMarkerTask {
  func: 'Task_ShowAreaMarkers';
  destroyed: boolean;
  data: PokedexAreaMarkerTaskData;
}

export interface PokedexAreaMarkersRuntime {
  tasks: PokedexAreaMarkerTask[];
  sprites: PokedexAreaMarkerSprite[];
  compressedSpriteSheets: Array<{ size: number; tag: number }>;
  paletteLoads: Array<{ source: string; paletteId: number; size: number }>;
  freedSpriteTileTags: number[];
  gpuRegs: Record<string, number>;
  gpuRegBits: Record<string, number>;
  hiddenBgs: number[];
  shownBgs: number[];
  bgAttributes: Array<{ bg: number; attr: string; value: number }>;
  bgFills: Array<{ bg: number; value: number; left: number; top: number; width: number; height: number }>;
  bgCopies: number[];
  speciesMarkerAreas: Map<number, number[]>;
}

const subspriteTemplates: Record<number, Omit<PokedexAreaMarkerSubsprite, 'x' | 'y'>> = {
  [MARKER_CIRCULAR]: { size: '8x8', shape: '8x8', priority: 1, tileOffset: 0 },
  [MARKER_SMALL_H]: { size: '16x8', shape: '16x8', priority: 1, tileOffset: 1 },
  [MARKER_SMALL_V]: { size: '8x16', shape: '8x16', priority: 1, tileOffset: 3 },
  [MARKER_MED_H]: { size: '32x16', shape: '32x16', priority: 1, tileOffset: 5 },
  [MARKER_MED_V]: { size: '16x32', shape: '16x32', priority: 1, tileOffset: 13 },
  [MARKER_LARGE_H]: { size: '32x16', shape: '32x16', priority: 1, tileOffset: 21 },
  [MARKER_LARGE_V]: { size: '16x32', shape: '16x32', priority: 1, tileOffset: 29 }
};

export const sAreaMarkers: readonly AreaMarkerEntry[] = [
  { marker: MARKER_CIRCULAR, x: 0, y: 0 },
  { marker: MARKER_CIRCULAR, x: 54, y: 44 },
  { marker: MARKER_CIRCULAR, x: 54, y: 28 },
  { marker: MARKER_CIRCULAR, x: 54, y: 12 },
  { marker: MARKER_CIRCULAR, x: 92, y: 12 },
  { marker: MARKER_CIRCULAR, x: 110, y: 24 },
  { marker: MARKER_CIRCULAR, x: 92, y: 36 },
  { marker: MARKER_CIRCULAR, x: 76, y: 24 },
  { marker: MARKER_CIRCULAR, x: 78, y: 52 },
  { marker: MARKER_CIRCULAR, x: 54, y: 62 },
  { marker: MARKER_CIRCULAR, x: 42, y: 2 },
  { marker: MARKER_CIRCULAR, x: 92, y: 24 },
  { marker: MARKER_SMALL_V, x: 54, y: 32 },
  { marker: MARKER_SMALL_V, x: 54, y: 16 },
  { marker: MARKER_SMALL_H, x: 61, y: 12 },
  { marker: MARKER_SMALL_H, x: 77, y: 12 },
  { marker: MARKER_CIRCULAR, x: 92, y: 18 },
  { marker: MARKER_CIRCULAR, x: 92, y: 30 },
  { marker: MARKER_CIRCULAR, x: 84, y: 24 },
  { marker: MARKER_SMALL_H, x: 98, y: 24 },
  { marker: MARKER_SMALL_H, x: 98, y: 12 },
  { marker: MARKER_SMALL_V, x: 110, y: 12 },
  { marker: MARKER_SMALL_H, x: 98, y: 36 },
  { marker: MARKER_MED_V, x: 106, y: 25 },
  { marker: MARKER_SMALL_H, x: 100, y: 46 },
  { marker: MARKER_SMALL_V, x: 94, y: 45 },
  { marker: MARKER_SMALL_H, x: 85, y: 52 },
  { marker: MARKER_CIRCULAR, x: 68, y: 24 },
  { marker: MARKER_MED_V, x: 62, y: 26 },
  { marker: MARKER_SMALL_H, x: 64, y: 52 },
  { marker: MARKER_CIRCULAR, x: 78, y: 60 },
  { marker: MARKER_MED_H, x: 55, y: 58 },
  { marker: MARKER_SMALL_V, x: 54, y: 50 },
  { marker: MARKER_SMALL_H, x: 40, y: 28 },
  { marker: MARKER_MED_V, x: 38, y: 4 },
  { marker: MARKER_CIRCULAR, x: 92, y: 4 },
  { marker: MARKER_MED_H, x: 90, y: -2 },
  { marker: MARKER_CIRCULAR, x: 51, y: 20 },
  { marker: MARKER_SMALL_H, x: 61, y: 18 },
  { marker: MARKER_CIRCULAR, x: 72, y: 8 },
  { marker: MARKER_CIRCULAR, x: 87, y: 8 },
  { marker: MARKER_CIRCULAR, x: 112, y: 14 },
  { marker: MARKER_CIRCULAR, x: 113, y: 20 },
  { marker: MARKER_CIRCULAR, x: 113, y: 25 },
  { marker: MARKER_SMALL_H, x: 78, y: 44 },
  { marker: MARKER_CIRCULAR, x: 65, y: 60 },
  { marker: MARKER_CIRCULAR, x: 52, y: 62 },
  { marker: MARKER_CIRCULAR, x: 45, y: 7 },
  { marker: MARKER_CIRCULAR, x: 10, y: 10 },
  { marker: MARKER_CIRCULAR, x: 12, y: 35 },
  { marker: MARKER_CIRCULAR, x: 14, y: 52 },
  { marker: MARKER_CIRCULAR, x: 12, y: 84 },
  { marker: MARKER_CIRCULAR, x: 45, y: 81 },
  { marker: MARKER_CIRCULAR, x: 76, y: 84 },
  { marker: MARKER_CIRCULAR, x: 104, y: 82 },
  { marker: MARKER_SMALL_V, x: 14, y: 2 },
  { marker: MARKER_CIRCULAR, x: 10, y: 15 },
  { marker: MARKER_CIRCULAR, x: 12, y: 29 },
  { marker: MARKER_SMALL_H, x: 2, y: 52 },
  { marker: MARKER_SMALL_H, x: 12, y: 56 },
  { marker: MARKER_SMALL_H, x: 44, y: 74 },
  { marker: MARKER_SMALL_H, x: 36, y: 78 },
  { marker: MARKER_SMALL_V, x: 48, y: 80 },
  { marker: MARKER_SMALL_V, x: 52, y: 86 },
  { marker: MARKER_CIRCULAR, x: 72, y: 74 },
  { marker: MARKER_SMALL_H, x: 72, y: 78 },
  { marker: MARKER_SMALL_V, x: 81, y: 80 },
  { marker: MARKER_CIRCULAR, x: 76, y: 92 },
  { marker: MARKER_CIRCULAR, x: 104, y: 75 },
  { marker: MARKER_CIRCULAR, x: 104, y: 86 },
  { marker: MARKER_SMALL_V, x: 108, y: 83 },
  { marker: MARKER_MED_H, x: 96, y: 90 },
  { marker: MARKER_CIRCULAR, x: 14, y: 1 },
  { marker: MARKER_CIRCULAR, x: 5, y: 52 },
  { marker: MARKER_CIRCULAR, x: 13, y: 80 },
  { marker: MARKER_CIRCULAR, x: 54, y: 74 },
  { marker: MARKER_CIRCULAR, x: 69, y: 73 },
  { marker: MARKER_CIRCULAR, x: 76, y: 77 },
  { marker: MARKER_CIRCULAR, x: 73, y: 95 },
  { marker: MARKER_MED_H, x: 96, y: 90 }
];

export const createPokedexAreaMarkersRuntime = (): PokedexAreaMarkersRuntime => ({
  tasks: [],
  sprites: [],
  compressedSpriteSheets: [],
  paletteLoads: [],
  freedSpriteTileTags: [],
  gpuRegs: {},
  gpuRegBits: {},
  hiddenBgs: [],
  shownBgs: [],
  bgAttributes: [],
  bgFills: [],
  bgCopies: [],
  speciesMarkerAreas: new Map()
});

export const getAreaMarkerSubsprite = (dexArea: number): PokedexAreaMarkerSubsprite => {
  const entry = sAreaMarkers[dexArea] ?? sAreaMarkers[DEX_AREA_NONE];
  const template = subspriteTemplates[entry.marker];
  return { ...template, x: entry.x, y: entry.y };
};

export const getSpeciesPokedexAreaMarkers = (
  runtime: PokedexAreaMarkersRuntime,
  species: number
): PokedexAreaMarkerSubsprite[] =>
  (runtime.speciesMarkerAreas.get(species) ?? [])
    .filter((dexArea) => dexArea !== DEX_AREA_NONE)
    .map(getAreaMarkerSubsprite);

export const createPokedexAreaMarkers = (
  runtime: PokedexAreaMarkersRuntime,
  species: number,
  tilesTag: number,
  palIdx: number,
  y: number
): number => {
  runtime.compressedSpriteSheets.push({ size: 0x4a0, tag: tilesTag & 0xffff });
  runtime.paletteLoads.push({ source: 'sMarkerPal', paletteId: palIdx & 0xff, size: 16 });
  const taskId = runtime.tasks.length;
  const subsprites = getSpeciesPokedexAreaMarkers(runtime, species).slice(0, 120);
  const spriteId = runtime.sprites.length;
  runtime.tasks.push({
    func: 'Task_ShowAreaMarkers',
    destroyed: false,
    data: {
      subsprites,
      buffer: subsprites,
      unused: 0,
      spriteId,
      tilesTag: tilesTag & 0xffff,
      paletteTag: TAG_NONE
    }
  });
  runtime.gpuRegBits.DISPCNT = (runtime.gpuRegBits.DISPCNT ?? 0) | 0x8000;
  runtime.gpuRegs.BLDCNT = 0x3f42;
  runtime.gpuRegs.BLDALPHA = (12 << 8) | 8;
  runtime.gpuRegs.BLDY = 0;
  runtime.gpuRegs.WININ = 0x3f3f;
  runtime.gpuRegs.WINOUT = 0x3f3f;
  runtime.sprites.push({
    x: 104,
    y: y + 32,
    tileTag: tilesTag & 0xffff,
    paletteNum: palIdx & 0xff,
    objMode: 'window',
    subspriteTableNum: 0,
    invisible: true,
    subsprites
  });
  runtime.hiddenBgs.push(1);
  runtime.bgAttributes.push({ bg: 1, attr: 'BG_ATTR_CHARBASEINDEX', value: 0 });
  runtime.bgFills.push({ bg: 1, value: 0x00f, left: 0, top: 0, width: 30, height: 20 });
  runtime.bgCopies.push(1);
  runtime.shownBgs.push(1);
  return taskId;
};

export const taskShowAreaMarkers = (
  runtime: PokedexAreaMarkersRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) {
    return;
  }
  const sprite = runtime.sprites[task.data.spriteId];
  if (sprite) {
    sprite.invisible = false;
  }
};

export function Task_ShowAreaMarkers(runtime: PokedexAreaMarkersRuntime, taskId: number): void { taskShowAreaMarkers(runtime, taskId); }

export function CreatePokedexAreaMarkers(
  runtime: PokedexAreaMarkersRuntime,
  species: number,
  tilesTag: number,
  palIdx: number,
  y: number
): number {
  return createPokedexAreaMarkers(runtime, species, tilesTag, palIdx, y);
}

export const destroyPokedexAreaMarkers = (
  runtime: PokedexAreaMarkersRuntime,
  taskId: number
): void => {
  const task = runtime.tasks[taskId];
  if (!task || task.destroyed) {
    return;
  }
  runtime.freedSpriteTileTags.push(task.data.tilesTag);
  runtime.sprites[task.data.spriteId].invisible = true;
  task.data.buffer = [];
  runtime.gpuRegs.BLDCNT = 0;
  runtime.gpuRegs.BLDALPHA = 0;
  runtime.gpuRegs.BLDY = 0;
  runtime.gpuRegs.WININ = 0x3f3f;
  runtime.gpuRegs.WINOUT = 0x3f3f;
  runtime.gpuRegBits.DISPCNT = (runtime.gpuRegBits.DISPCNT ?? 0) & ~0x8000;
  runtime.hiddenBgs.push(1);
  runtime.bgAttributes.push({ bg: 1, attr: 'BG_ATTR_CHARBASEINDEX', value: 2 });
  runtime.bgFills.push({ bg: 1, value: 0x000, left: 0, top: 0, width: 30, height: 20 });
  runtime.bgCopies.push(1);
  runtime.shownBgs.push(1);
  task.destroyed = true;
};

export function DestroyPokedexAreaMarkers(runtime: PokedexAreaMarkersRuntime, taskId: number): void { destroyPokedexAreaMarkers(runtime, taskId); }

export function GetAreaMarkerSubsprite(
  i: number,
  dexArea: number,
  subsprites: PokedexAreaMarkerSubsprite[]
): void {
  subsprites[i] = getAreaMarkerSubsprite(dexArea);
}

export const getNumPokedexAreaMarkers = (
  runtime: PokedexAreaMarkersRuntime,
  taskId: number
): number => runtime.tasks[taskId]?.data.subsprites.length ?? 0;

export function GetNumPokedexAreaMarkers(runtime: PokedexAreaMarkersRuntime, taskId: number): number { return getNumPokedexAreaMarkers(runtime, taskId); }
