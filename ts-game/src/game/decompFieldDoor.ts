export const DOOR_SOUND_NORMAL = 0;
export const DOOR_SOUND_SLIDING = 1;
export const DOOR_SIZE_1x1 = 0;
export const DOOR_SIZE_1x2 = 1;

export const TILE_SIZE_4BPP = 32;
export const NUM_TILES_TOTAL = 1024;
export const DOOR_TILE_START = NUM_TILES_TOTAL - 8;
export const CLOSED_DOOR_TILES_OFFSET = 0xffff;
export const MB_WARP_DOOR = 0x69;
export const SE_SLIDING_DOOR = 18;
export const SE_DOOR = 241;

export const METATILE_CeladonCity_DeptStoreDoor = 0x294;
export const METATILE_CeruleanCity_Door = 0x298;
export const METATILE_CinnabarIsland_LabDoor = 0x2ad;
export const METATILE_DepartmentStore_ElevatorDoor = 0x28d;
export const METATILE_FuchsiaCity_Door = 0x2bf;
export const METATILE_FuchsiaCity_SafariZoneDoor = 0x2d2;
export const METATILE_General_Door = 0x03d;
export const METATILE_General_SlidingDoubleDoor = 0x15b;
export const METATILE_General_SlidingSingleDoor = 0x062;
export const METATILE_LavenderTown_Door = 0x2a2;
export const METATILE_PalletTown_Door = 0x2a3;
export const METATILE_PalletTown_OaksLabDoor = 0x2ac;
export const METATILE_PewterCity_Door = 0x2ce;
export const METATILE_PokemonCenter_CableClubDoor = 0x2de;
export const METATILE_SSAnne_Door = 0x281;
export const METATILE_SaffronCity_Door = 0x284;
export const METATILE_SaffronCity_SilphCoDoor = 0x2bc;
export const METATILE_SeaCottage_Teleporter_Door = 0x296;
export const METATILE_SeviiIslands123_Door = 0x297;
export const METATILE_SeviiIslands123_GameCornerDoor = 0x29b;
export const METATILE_SeviiIslands123_PokeCenterDoor = 0x2eb;
export const METATILE_SeviiIslands45_DayCareDoor = 0x2b9;
export const METATILE_SeviiIslands45_Door = 0x29a;
export const METATILE_SeviiIslands45_RocketWarehouseDoor_Unlocked = 0x2af;
export const METATILE_SeviiIslands67_Door = 0x30c;
export const METATILE_SilphCo_ElevatorDoor = 0x2e2;
export const METATILE_SilphCo_HideoutElevatorDoor = 0x2ab;
export const METATILE_TrainerTower_LobbyElevatorDoor = 0x2c3;
export const METATILE_TrainerTower_RoofElevatorDoor = 0x356;
export const METATILE_VermilionCity_Door = 0x29e;
export const METATILE_VermilionCity_SSAnneWarp = 0x2e1;
export const METATILE_ViridianCity_Door = 0x299;

export interface DoorAnimFrame {
  duration: number;
  tileOffset: number;
}

export interface DoorGraphics {
  metatileId: number;
  sound: number;
  size: number;
  tiles: string;
  paletteNums: readonly number[];
}

export interface FieldDoorTask {
  id: number;
  func: 'Task_AnimateDoor';
  priority: number;
  data: number[];
  frames: readonly DoorAnimFrame[];
  gfx: DoorGraphics;
  destroyed: boolean;
}

export interface FieldDoorRuntime {
  tasks: FieldDoorTask[];
  metatileIds: Record<string, number>;
  metatileBehaviors: Record<string, number>;
  currentMapDraws: Array<{ x: number; y: number }>;
  doorMetatileDraws: Array<{ x: number; y: number; tiles: number[] }>;
  copiedDoorTiles: Array<{ tiles: string; offset: number; destTile: number; size: number }>;
  calls: Array<{ fn: string; args: unknown[] }>;
}

const palette = (value: number): readonly number[] => [value, value, value, value, value, value, value, value] as const;

export const sDoorAnimFrames_OpenSmall: readonly DoorAnimFrame[] = [
  { duration: 4, tileOffset: CLOSED_DOOR_TILES_OFFSET },
  { duration: 4, tileOffset: 0 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 4 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 8 * TILE_SIZE_4BPP },
  { duration: 0, tileOffset: 0 }
] as const;
export const sDoorAnimFrames_OpenLarge: readonly DoorAnimFrame[] = [
  { duration: 4, tileOffset: CLOSED_DOOR_TILES_OFFSET },
  { duration: 4, tileOffset: 0 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 8 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 16 * TILE_SIZE_4BPP },
  { duration: 0, tileOffset: 0 }
] as const;
export const sDoorAnimFrames_CloseSmall: readonly DoorAnimFrame[] = [
  { duration: 4, tileOffset: 8 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 4 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 0 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: CLOSED_DOOR_TILES_OFFSET },
  { duration: 0, tileOffset: 0 }
] as const;
export const sDoorAnimFrames_CloseLarge: readonly DoorAnimFrame[] = [
  { duration: 4, tileOffset: 16 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 8 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: 0 * TILE_SIZE_4BPP },
  { duration: 4, tileOffset: CLOSED_DOOR_TILES_OFFSET },
  { duration: 0, tileOffset: 0 }
] as const;

export const sDoorAnimPalettes_General = palette(2);
export const sDoorAnimPalettes_SlidingSingle = palette(3);
export const sDoorAnimPalettes_SlidingDouble = palette(3);
export const sDoorAnimPalettes_Pallet = palette(8);
export const sDoorAnimPalettes_OaksLab = palette(10);
export const sDoorAnimPalettes_Viridian = palette(8);
export const sDoorAnimPalettes_Pewter = palette(8);
export const sDoorAnimPalettes_Saffron = palette(8);
export const sDoorAnimPalettes_SilphCo = palette(3);
export const sDoorAnimPalettes_Cerulean = palette(12);
export const sDoorAnimPalettes_Lavender = palette(9);
export const sDoorAnimPalettes_Vermilion = palette(9);
export const sDoorAnimPalettes_PokemonFanClub = palette(9);
export const sDoorAnimPalettes_DeptStore = palette(3);
export const sDoorAnimPalettes_Fuchsia = palette(8);
export const sDoorAnimPalettes_SafariZone = palette(9);
export const sDoorAnimPalettes_CinnabarLab = palette(3);
export const sDoorAnimPalettes_DeptStoreElevator = palette(8);
export const sDoorAnimPalettes_CableClub = palette(8);
export const sDoorAnimPalettes_HideoutElevator = [12, 12, 2, 2, 2, 2, 2, 2] as const;
export const sDoorAnimPalettes_SSAnne = palette(7);
export const sDoorAnimPalettes_SilphCoElevator = [8, 8, 2, 2, 2, 2, 2, 2] as const;
export const sDoorAnimPalettes_Sevii123 = palette(5);
export const sDoorAnimPalettes_JoyfulGameCorner = palette(3);
export const sDoorAnimPalettes_OneIslandPokeCenter = palette(3);
export const sDoorAnimPalettes_Sevii45 = palette(5);
export const sDoorAnimPalettes_FourIslandDayCare = palette(3);
export const sDoorAnimPalettes_RocketWarehouse = palette(10);
export const sDoorAnimPalettes_Sevii67 = palette(5);
export const sDoorAnimPalettes_Teleporter = palette(8);
export const sDoorAnimPalettes_TrainerTowerLobbyElevator = [8, 8, 2, 2, 2, 2, 2, 2] as const;
export const sDoorAnimPalettes_TrainerTowerRoofElevator = [11, 11, 2, 2, 2, 2, 2, 2] as const;

export const sDoorGraphics: readonly DoorGraphics[] = [
  { metatileId: METATILE_General_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/general.4bpp', paletteNums: sDoorAnimPalettes_General },
  { metatileId: METATILE_General_SlidingSingleDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/sliding_single.4bpp', paletteNums: sDoorAnimPalettes_SlidingSingle },
  { metatileId: METATILE_General_SlidingDoubleDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/sliding_double.4bpp', paletteNums: sDoorAnimPalettes_SlidingDouble },
  { metatileId: METATILE_PalletTown_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/pallet.4bpp', paletteNums: sDoorAnimPalettes_Pallet },
  { metatileId: METATILE_PalletTown_OaksLabDoor, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/oaks_lab.4bpp', paletteNums: sDoorAnimPalettes_OaksLab },
  { metatileId: METATILE_ViridianCity_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/viridian.4bpp', paletteNums: sDoorAnimPalettes_Viridian },
  { metatileId: METATILE_PewterCity_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/pewter.4bpp', paletteNums: sDoorAnimPalettes_Pewter },
  { metatileId: METATILE_SaffronCity_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/saffron.4bpp', paletteNums: sDoorAnimPalettes_Saffron },
  { metatileId: METATILE_SaffronCity_SilphCoDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/silph_co.4bpp', paletteNums: sDoorAnimPalettes_SilphCo },
  { metatileId: METATILE_CeruleanCity_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/cerulean.4bpp', paletteNums: sDoorAnimPalettes_Cerulean },
  { metatileId: METATILE_LavenderTown_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/lavender.4bpp', paletteNums: sDoorAnimPalettes_Lavender },
  { metatileId: METATILE_VermilionCity_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/vermilion.4bpp', paletteNums: sDoorAnimPalettes_Vermilion },
  { metatileId: METATILE_VermilionCity_SSAnneWarp, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/pokemon_fan_club.4bpp', paletteNums: sDoorAnimPalettes_PokemonFanClub },
  { metatileId: METATILE_CeladonCity_DeptStoreDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/dept_store.4bpp', paletteNums: sDoorAnimPalettes_DeptStore },
  { metatileId: METATILE_FuchsiaCity_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/fuchsia.4bpp', paletteNums: sDoorAnimPalettes_Fuchsia },
  { metatileId: METATILE_FuchsiaCity_SafariZoneDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/safari_zone.4bpp', paletteNums: sDoorAnimPalettes_SafariZone },
  { metatileId: METATILE_CinnabarIsland_LabDoor, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/cinnabar_lab.4bpp', paletteNums: sDoorAnimPalettes_CinnabarLab },
  { metatileId: METATILE_SeviiIslands123_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/sevii_123.4bpp', paletteNums: sDoorAnimPalettes_Sevii123 },
  { metatileId: METATILE_SeviiIslands123_GameCornerDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/joyful_game_corner.4bpp', paletteNums: sDoorAnimPalettes_JoyfulGameCorner },
  { metatileId: METATILE_SeviiIslands123_PokeCenterDoor, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/one_island_poke_center.4bpp', paletteNums: sDoorAnimPalettes_OneIslandPokeCenter },
  { metatileId: METATILE_SeviiIslands45_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/sevii_45.4bpp', paletteNums: sDoorAnimPalettes_Sevii45 },
  { metatileId: METATILE_SeviiIslands45_DayCareDoor, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/four_island_day_care.4bpp', paletteNums: sDoorAnimPalettes_FourIslandDayCare },
  { metatileId: METATILE_SeviiIslands45_RocketWarehouseDoor_Unlocked, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/rocket_warehouse.4bpp', paletteNums: sDoorAnimPalettes_RocketWarehouse },
  { metatileId: METATILE_SeviiIslands67_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x1, tiles: 'graphics/door_anims/sevii_67.4bpp', paletteNums: sDoorAnimPalettes_Sevii67 },
  { metatileId: METATILE_DepartmentStore_ElevatorDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/dept_store_elevator.4bpp', paletteNums: sDoorAnimPalettes_DeptStoreElevator },
  { metatileId: METATILE_PokemonCenter_CableClubDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/cable_club.4bpp', paletteNums: sDoorAnimPalettes_CableClub },
  { metatileId: METATILE_SilphCo_HideoutElevatorDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/hideout_elevator.4bpp', paletteNums: sDoorAnimPalettes_HideoutElevator },
  { metatileId: METATILE_SSAnne_Door, sound: DOOR_SOUND_NORMAL, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/ss_anne.4bpp', paletteNums: sDoorAnimPalettes_SSAnne },
  { metatileId: METATILE_SilphCo_ElevatorDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/silph_co_elevator.4bpp', paletteNums: sDoorAnimPalettes_SilphCoElevator },
  { metatileId: METATILE_SeaCottage_Teleporter_Door, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/teleporter.4bpp', paletteNums: sDoorAnimPalettes_Teleporter },
  { metatileId: METATILE_TrainerTower_LobbyElevatorDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/trainer_tower_lobby_elevator.4bpp', paletteNums: sDoorAnimPalettes_TrainerTowerLobbyElevator },
  { metatileId: METATILE_TrainerTower_RoofElevatorDoor, sound: DOOR_SOUND_SLIDING, size: DOOR_SIZE_1x2, tiles: 'graphics/door_anims/trainer_tower_roof_elevator.4bpp', paletteNums: sDoorAnimPalettes_TrainerTowerRoofElevator }
] as const;

export const createFieldDoorRuntime = (): FieldDoorRuntime => ({
  tasks: [],
  metatileIds: {},
  metatileBehaviors: {},
  currentMapDraws: [],
  doorMetatileDraws: [],
  copiedDoorTiles: [],
  calls: []
});

const key = (x: number, y: number): string => `${x},${y}`;
const call = (runtime: FieldDoorRuntime, fn: string, ...args: unknown[]): void => {
  runtime.calls.push({ fn, args });
};
const mapGridGetMetatileIdAt = (runtime: FieldDoorRuntime, x: number, y: number): number => runtime.metatileIds[key(x, y)] ?? 0;
const mapGridGetMetatileBehaviorAt = (runtime: FieldDoorRuntime, x: number, y: number): number => runtime.metatileBehaviors[key(x, y)] ?? 0;
const metatileBehaviorIsWarpDoor2 = (metatileBehavior: number): boolean => metatileBehavior === MB_WARP_DOOR;
const funcIsActiveTask = (runtime: FieldDoorRuntime): boolean =>
  runtime.tasks.some((task) => task.func === 'Task_AnimateDoor' && !task.destroyed);
const createTask = (
  runtime: FieldDoorRuntime,
  gfx: DoorGraphics,
  frames: readonly DoorAnimFrame[],
  x: number,
  y: number
): number => {
  const taskId = runtime.tasks.length;
  runtime.tasks.push({
    id: taskId,
    func: 'Task_AnimateDoor',
    priority: 80,
    data: [0, 0, 0, 0, 0, 0, x, y, 0, 0, 0, 0, 0, 0, 0, 0],
    frames,
    gfx,
    destroyed: false
  });
  call(runtime, 'CreateTask', 'Task_AnimateDoor', 80);
  return taskId;
};
const destroyTask = (runtime: FieldDoorRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  call(runtime, 'DestroyTask', taskId);
};

export const currentMapDrawMetatileAt = (runtime: FieldDoorRuntime, x: number, y: number): void => {
  runtime.currentMapDraws.push({ x, y });
  call(runtime, 'CurrentMapDrawMetatileAt', x, y);
};

export const drawDoorMetatileAt = (runtime: FieldDoorRuntime, x: number, y: number, tiles: readonly number[]): void => {
  runtime.doorMetatileDraws.push({ x, y, tiles: tiles.slice() });
  call(runtime, 'DrawDoorMetatileAt', x, y, tiles.slice());
};

export const drawClosedDoorTiles = (runtime: FieldDoorRuntime, gfx: DoorGraphics, x: number, y: number): void => {
  if (gfx.size === DOOR_SIZE_1x1) {
    currentMapDrawMetatileAt(runtime, x, y);
  } else {
    currentMapDrawMetatileAt(runtime, x, y);
    currentMapDrawMetatileAt(runtime, x, y - 1);
  }
};

export const copyDoorTilesToVram = (runtime: FieldDoorRuntime, tiles: string, offset: number): void => {
  runtime.copiedDoorTiles.push({ tiles, offset, destTile: DOOR_TILE_START, size: 8 * TILE_SIZE_4BPP });
  call(runtime, 'CpuFastCopy', `${tiles}+${offset}`, `VRAM+TILE_OFFSET_4BPP(${DOOR_TILE_START})`, 8 * TILE_SIZE_4BPP);
};

export const buildDoorTiles = (tileNum: number, paletteNums: readonly number[]): number[] => {
  const tiles = Array.from({ length: 8 }, () => 0);
  let i = 0;
  let tile: number;
  for (; i < 4; i += 1) {
    tile = paletteNums[i] << 12;
    tiles[i] = tile | (tileNum + i);
  }
  for (; i < 8; i += 1) {
    tile = paletteNums[i] << 12;
    tiles[i] = tile;
  }
  return tiles;
};

export const drawCurrentDoorAnimFrame = (runtime: FieldDoorRuntime, gfx: DoorGraphics, x: number, y: number, paletteNums: readonly number[]): void => {
  let tiles: number[];
  if (gfx.size === DOOR_SIZE_1x1) {
    tiles = buildDoorTiles(DOOR_TILE_START, paletteNums);
  } else {
    tiles = buildDoorTiles(DOOR_TILE_START, paletteNums);
    drawDoorMetatileAt(runtime, x, y - 1, tiles);
    tiles = buildDoorTiles(DOOR_TILE_START + 4, paletteNums.slice(4));
  }
  drawDoorMetatileAt(runtime, x, y, tiles);
};

export const drawDoor = (runtime: FieldDoorRuntime, gfx: DoorGraphics, frames: DoorAnimFrame, x: number, y: number): void => {
  if (frames.tileOffset === CLOSED_DOOR_TILES_OFFSET) {
    drawClosedDoorTiles(runtime, gfx, x, y);
  } else {
    copyDoorTilesToVram(runtime, gfx.tiles, frames.tileOffset);
    drawCurrentDoorAnimFrame(runtime, gfx, x, y, gfx.paletteNums);
  }
};

export const animateDoorFrame = (
  runtime: FieldDoorRuntime,
  gfx: DoorGraphics,
  frames: readonly DoorAnimFrame[],
  data: number[]
): boolean => {
  if (data[5] === 0) {
    drawDoor(runtime, gfx, frames[data[4]], data[6], data[7]);
  }
  if (data[5] === frames[data[4]].duration) {
    data[5] = 0;
    data[4] += 1;
    if (frames[data[4]].duration === 0) {
      return false;
    }
    return true;
  }
  data[5] += 1;
  return true;
};

export const taskAnimateDoor = (runtime: FieldDoorRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (!animateDoorFrame(runtime, task.gfx, task.frames, task.data)) {
    destroyTask(runtime, taskId);
  }
};

export const getDoorGraphics = (gfx: readonly DoorGraphics[], id: number): DoorGraphics | null => {
  for (const entry of gfx) {
    if (entry.metatileId === id) {
      return entry;
    }
  }
  return null;
};

export const startDoorAnimationTask = (
  runtime: FieldDoorRuntime,
  gfx: DoorGraphics,
  frames: readonly DoorAnimFrame[],
  x: number,
  y: number
): number => {
  if (funcIsActiveTask(runtime)) {
    return -1;
  }
  return createTask(runtime, gfx, frames, x, y);
};

export const drawClosedDoor = (runtime: FieldDoorRuntime, gfx: DoorGraphics, x: number, y: number): void => {
  drawClosedDoorTiles(runtime, gfx, x, y);
};

export const getLastDoorAnimFrame = (frames: readonly DoorAnimFrame[]): DoorAnimFrame => {
  let index = 0;
  while (frames[index].duration !== 0) {
    index += 1;
  }
  return frames[index - 1];
};

export const drawOpenedDoor = (runtime: FieldDoorRuntime, gfx: readonly DoorGraphics[], x: number, y: number): void => {
  const doorGfx = getDoorGraphics(gfx, mapGridGetMetatileIdAt(runtime, x, y));
  if (doorGfx !== null) {
    const frames = doorGfx.size === DOOR_SIZE_1x1 ? sDoorAnimFrames_OpenSmall : sDoorAnimFrames_OpenLarge;
    drawDoor(runtime, doorGfx, getLastDoorAnimFrame(frames), x, y);
  }
};

export const animateDoorOpenInternal = (runtime: FieldDoorRuntime, gfx: readonly DoorGraphics[], x: number, y: number): number => {
  const doorGfx = getDoorGraphics(gfx, mapGridGetMetatileIdAt(runtime, x, y));
  if (doorGfx === null) {
    return -1;
  }
  if (doorGfx.size === DOOR_SIZE_1x1) {
    return startDoorAnimationTask(runtime, doorGfx, sDoorAnimFrames_OpenSmall, x, y);
  }
  return startDoorAnimationTask(runtime, doorGfx, sDoorAnimFrames_OpenLarge, x, y);
};

export const startDoorCloseAnimation = (runtime: FieldDoorRuntime, gfx: readonly DoorGraphics[], x: number, y: number): number => {
  const doorGfx = getDoorGraphics(gfx, mapGridGetMetatileIdAt(runtime, x, y));
  if (doorGfx === null) {
    return -1;
  }
  if (doorGfx.size === DOOR_SIZE_1x1) {
    return startDoorAnimationTask(runtime, doorGfx, sDoorAnimFrames_CloseSmall, x, y);
  }
  return startDoorAnimationTask(runtime, doorGfx, sDoorAnimFrames_CloseLarge, x, y);
};

export const fieldSetDoorOpened = (runtime: FieldDoorRuntime, x: number, y: number): void => {
  if (metatileBehaviorIsWarpDoor2(mapGridGetMetatileBehaviorAt(runtime, x, y))) {
    drawOpenedDoor(runtime, sDoorGraphics, x, y);
  }
};

export const fieldSetDoorClosed = (runtime: FieldDoorRuntime, x: number, y: number): void => {
  if (metatileBehaviorIsWarpDoor2(mapGridGetMetatileBehaviorAt(runtime, x, y))) {
    drawClosedDoor(runtime, sDoorGraphics[0], x, y);
  }
};

export const fieldAnimateDoorClose = (runtime: FieldDoorRuntime, x: number, y: number): number => {
  if (!metatileBehaviorIsWarpDoor2(mapGridGetMetatileBehaviorAt(runtime, x, y))) {
    return -1;
  }
  return startDoorCloseAnimation(runtime, sDoorGraphics, x, y);
};

export const fieldAnimateDoorOpen = (runtime: FieldDoorRuntime, x: number, y: number): number => {
  if (!metatileBehaviorIsWarpDoor2(mapGridGetMetatileBehaviorAt(runtime, x, y))) {
    return -1;
  }
  return animateDoorOpenInternal(runtime, sDoorGraphics, x, y);
};

export const fieldIsDoorAnimationRunning = (runtime: FieldDoorRuntime): boolean => funcIsActiveTask(runtime);

export const getDoorSoundType = (runtime: FieldDoorRuntime, gfx: readonly DoorGraphics[], x: number, y: number): number => {
  const doorGfx = getDoorGraphics(gfx, mapGridGetMetatileIdAt(runtime, x, y));
  if (doorGfx === null) {
    return -1;
  }
  return doorGfx.sound;
};

export const getDoorSoundEffect = (runtime: FieldDoorRuntime, x: number, y: number): number => {
  if (getDoorSoundType(runtime, sDoorGraphics, x, y) === DOOR_SOUND_NORMAL) {
    return SE_DOOR;
  }
  return SE_SLIDING_DOOR;
};

export const DrawDoor = drawDoor;
export const DrawClosedDoorTiles = drawClosedDoorTiles;
export const CopyDoorTilesToVram = copyDoorTilesToVram;
export const DrawCurrentDoorAnimFrame = drawCurrentDoorAnimFrame;
export const BuildDoorTiles = buildDoorTiles;
export const Task_AnimateDoor = taskAnimateDoor;
export const AnimateDoorFrame = animateDoorFrame;
export const GetDoorGraphics = getDoorGraphics;
export const StartDoorAnimationTask = startDoorAnimationTask;
export const DrawClosedDoor = drawClosedDoor;
export const DrawOpenedDoor = drawOpenedDoor;
export const GetLastDoorAnimFrame = getLastDoorAnimFrame;
export const AnimateDoorOpenInternal = animateDoorOpenInternal;
export const StartDoorCloseAnimation = startDoorCloseAnimation;
export const FieldSetDoorOpened = fieldSetDoorOpened;
export const FieldSetDoorClosed = fieldSetDoorClosed;
export const FieldAnimateDoorClose = fieldAnimateDoorClose;
export const FieldAnimateDoorOpen = fieldAnimateDoorOpen;
export const FieldIsDoorAnimationRunning = fieldIsDoorAnimationRunning;
export const GetDoorSoundEffect = getDoorSoundEffect;
export const GetDoorSoundType = getDoorSoundType;
