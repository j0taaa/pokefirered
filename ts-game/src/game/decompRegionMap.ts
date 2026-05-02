import {
  LAYER_DUNGEON,
  LAYER_MAP,
  REGION_MAP_LAYOUTS,
  type RegionMapLayer
} from './decompRegionMapLayouts';

export const REG_OFFSET_DISPCNT = 0x00;
export const REG_OFFSET_BLDCNT = 0x50;
export const REG_OFFSET_BLDALPHA = 0x52;
export const REG_OFFSET_BLDY = 0x54;
export const REG_OFFSET_WIN0H = 0x40;
export const REG_OFFSET_WIN1H = 0x42;
export const REG_OFFSET_WIN0V = 0x44;
export const REG_OFFSET_WIN1V = 0x46;
export const REG_OFFSET_WININ = 0x48;
export const REG_OFFSET_WINOUT = 0x4a;

export const DISPCNT_WIN0_ON = 0x2000;
export const DISPCNT_WIN1_ON = 0x4000;

export const BLDCNT_EFFECT_NONE = 0 << 6;
export const BLDCNT_EFFECT_BLEND = 1 << 6;
export const BLDCNT_EFFECT_LIGHTEN = 2 << 6;
export const BLDCNT_EFFECT_DARKEN = 3 << 6;

export const MAPEDGE_TOP_LEFT = 0;
export const MAPEDGE_MID_LEFT = 1;
export const MAPEDGE_BOT_LEFT = 2;
export const MAPEDGE_TOP_RIGHT = 3;
export const MAPEDGE_MID_RIGHT = 4;
export const MAPEDGE_BOT_RIGHT = 5;

export const REGIONMAP_KANTO = 0;
export const REGIONMAP_SEVII123 = 1;
export const REGIONMAP_SEVII45 = 2;
export const REGIONMAP_SEVII67 = 3;

export const MAP_WIDTH = 22;
export const MAP_HEIGHT = 15;
export const CANCEL_BUTTON_X = 21;
export const CANCEL_BUTTON_Y = 13;
export const SWITCH_BUTTON_X = 21;
export const SWITCH_BUTTON_Y = 11;

export const MAPSECTYPE_NONE = 0;
export const MAPSECTYPE_ROUTE = 1;
export const MAPSECTYPE_VISITED = 2;
export const MAPSECTYPE_NOT_VISITED = 3;

export const MAPPERM_HAS_SWITCH_BUTTON = 0;
export const MAPPERM_HAS_FLY_DESTINATIONS = 3;
export const MAPPERM_COUNT = 4;

export const MAPSEC_NONE = 'MAPSEC_NONE';
export const MAPSEC_NAVEL_ROCK = 'MAPSEC_NAVEL_ROCK';
export const MAPSEC_BIRTH_ISLAND = 'MAPSEC_BIRTH_ISLAND';
export const MAPSEC_CERULEAN_CAVE = 'MAPSEC_CERULEAN_CAVE';
export const MAPSEC_ROUTE_4_POKECENTER = 'MAPSEC_ROUTE_4_POKECENTER';
export const MAPSEC_ROUTE_10_POKECENTER = 'MAPSEC_ROUTE_10_POKECENTER';
export const MAPSEC_VIRIDIAN_FOREST = 'MAPSEC_VIRIDIAN_FOREST';

export const FLAG_WORLD_MAP_NAVEL_ROCK_EXTERIOR = 'FLAG_WORLD_MAP_NAVEL_ROCK_EXTERIOR';
export const FLAG_SYS_CAN_LINK_WITH_RS = 'FLAG_SYS_CAN_LINK_WITH_RS';

export const WIN_RANGE = (a: number, b: number): number => ((a << 8) | b) & 0xffff;
export const RGB2 = (red: number, green: number, blue: number): number =>
  ((red & 0x1f) | ((green & 0x1f) << 5) | ((blue & 0x1f) << 10)) & 0xffff;

const div = (left: number, right: number): number => Math.trunc(left / right);

const sWinFlags = [DISPCNT_WIN0_ON, DISPCNT_WIN1_ON] as const;
const sWinRegs = [
  [REG_OFFSET_WIN0V, REG_OFFSET_WIN0H],
  [REG_OFFSET_WIN1V, REG_OFFSET_WIN1H]
] as const;

const gText_RegionMap_NoData = 'NO DATA';

const sMapNameOverrides: Record<string, string> = {
  MAPSEC_ROUTE_4_POKECENTER: 'ROUTE 4',
  MAPSEC_ROUTE_10_POKECENTER: 'ROUTE 10',
  MAPSEC_MT_MOON: 'MT. MOON',
  MAPSEC_S_S_ANNE: 'S.S. ANNE',
  MAPSEC_DIGLETTS_CAVE: "DIGLETT'S CAVE",
  MAPSEC_KANTO_VICTORY_ROAD: 'VICTORY ROAD',
  MAPSEC_SILPH_CO: 'SILPH CO.',
  MAPSEC_POKEMON_MANSION: 'POKéMON MANSION',
  MAPSEC_POKEMON_LEAGUE: 'POKéMON LEAGUE',
  MAPSEC_POKEMON_TOWER: 'POKéMON TOWER',
  MAPSEC_CELADON_DEPT_STORE: 'CELADON DEPT.',
  MAPSEC_KANTO_SAFARI_ZONE: 'SAFARI ZONE',
  MAPSEC_MT_EMBER: 'MT. EMBER'
};

const sDungeonInfo: Array<{ id: string; name: string; desc: string }> = [
  { id: MAPSEC_VIRIDIAN_FOREST, name: 'VIRIDIAN FOREST', desc: 'gText_RegionMap_AreaDesc_ViridianForest' },
  { id: 'MAPSEC_MT_MOON', name: 'MT. MOON', desc: 'gText_RegionMap_AreaDesc_MtMoon' },
  { id: 'MAPSEC_DIGLETTS_CAVE', name: "DIGLETT'S CAVE", desc: 'gText_RegionMap_AreaDesc_DiglettsCave' },
  { id: 'MAPSEC_KANTO_VICTORY_ROAD', name: 'VICTORY ROAD', desc: 'gText_RegionMap_AreaDesc_VictoryRoad' },
  { id: 'MAPSEC_POKEMON_MANSION', name: 'POKéMON MANSION', desc: 'gText_RegionMap_AreaDesc_PokemonMansion' },
  { id: 'MAPSEC_KANTO_SAFARI_ZONE', name: 'SAFARI ZONE', desc: 'gText_RegionMap_AreaDesc_SafariZone' },
  { id: 'MAPSEC_ROCK_TUNNEL', name: 'ROCK TUNNEL', desc: 'gText_RegionMap_AreaDesc_RockTunnel' },
  { id: 'MAPSEC_SEAFOAM_ISLANDS', name: 'SEAFOAM ISLANDS', desc: 'gText_RegionMap_AreaDesc_SeafoamIslands' },
  { id: 'MAPSEC_POKEMON_TOWER', name: 'POKéMON TOWER', desc: 'gText_RegionMap_AreaDesc_PokemonTower' },
  { id: MAPSEC_CERULEAN_CAVE, name: 'CERULEAN CAVE', desc: 'gText_RegionMap_AreaDesc_CeruleanCave' },
  { id: 'MAPSEC_POWER_PLANT', name: 'POWER PLANT', desc: 'gText_RegionMap_AreaDesc_PowerPlant' },
  { id: 'MAPSEC_MT_EMBER', name: 'MT. EMBER', desc: 'gText_RegionMap_AreaDesc_MtEmber' },
  { id: 'MAPSEC_BERRY_FOREST', name: 'BERRY FOREST', desc: 'gText_RegionMap_AreaDesc_BerryForest' },
  { id: 'MAPSEC_ICEFALL_CAVE', name: 'ICEFALL CAVE', desc: 'gText_RegionMap_AreaDesc_IcefallCave' },
  { id: 'MAPSEC_LOST_CAVE', name: 'LOST CAVE', desc: 'gText_RegionMap_AreaDesc_LostCave' },
  { id: 'MAPSEC_TANOBY_CHAMBERS', name: 'TANOBY CHAMBERS', desc: 'gText_RegionMap_AreaDesc_TanobyRuins' },
  { id: 'MAPSEC_ALTERING_CAVE', name: 'ALTERING CAVE', desc: 'gText_RegionMap_AreaDesc_AlteringCave' },
  { id: 'MAPSEC_PATTERN_BUSH', name: 'PATTERN BUSH', desc: 'gText_RegionMap_AreaDesc_PatternBush' },
  { id: 'MAPSEC_DOTTED_HOLE', name: 'DOTTED HOLE', desc: 'gText_RegionMap_AreaDesc_DottedHole' }
];

const isValidMapsec = (mapsec: string): boolean => mapsec.startsWith('MAPSEC_') && mapsec !== MAPSEC_NONE;

const getMapsecDisplayName = (mapsec: string): string =>
  sMapNameOverrides[mapsec] ?? mapsec.replace(/^MAPSEC_/, '').replace(/_/g, ' ');

export interface GpuWindowParams {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface RegionMapSprite {
  x: number;
  y: number;
  invisible: boolean;
}

export interface RegionMapEdge {
  sprite: RegionMapSprite;
}

export interface RegionMapOpenCloseAnim {
  mapEdges: RegionMapEdge[];
  moveState: number;
}

export interface RegionMapCursor {
  x: number;
  y: number;
  sprite: RegionMapSprite;
  horizontalMove: number;
  verticalMove: number;
  moveCounter: number;
  snapId: number;
  selectedMapsec: string;
  selectedMapsecType: number;
  selectedDungeonType: number;
}

export interface RegionMapPlayerIcon {
  x: number;
  y: number;
  sprite: RegionMapSprite;
}

export interface RegionMapGpuRegs {
  bldcnt: number;
  bldy: number;
  bldalpha: number;
  winin: number;
  winout: number;
  win0h: number;
  win1h: number;
  win0v: number;
  win1v: number;
}

export interface RegionMapRuntime {
  gpuRegs: Map<number, number>;
  savedGpuRegs: Array<RegionMapGpuRegs | null>;
  mapOpenCloseAnim: RegionMapOpenCloseAnim;
  selectedRegion: number;
  playersRegion: number;
  permissions: boolean[];
  flags: Set<string>;
  mapCursor: RegionMapCursor;
  playerIcon: RegionMapPlayerIcon;
}

export const createRegionMapSprite = (x = 0, y = 0): RegionMapSprite => ({
  x,
  y,
  invisible: false
});

export const createRegionMapOpenCloseAnim = (
  leftX = 104,
  rightX = 136,
  moveState = 0
): RegionMapOpenCloseAnim => ({
  mapEdges: [
    { sprite: createRegionMapSprite(leftX) },
    { sprite: createRegionMapSprite(leftX) },
    { sprite: createRegionMapSprite(leftX) },
    { sprite: createRegionMapSprite(rightX) },
    { sprite: createRegionMapSprite(rightX) },
    { sprite: createRegionMapSprite(rightX) }
  ],
  moveState
});

export const createRegionMapCursor = (x = 0, y = 0): RegionMapCursor => ({
  x,
  y,
  sprite: createRegionMapSprite(8 * x + 36, 8 * y + 36),
  horizontalMove: 0,
  verticalMove: 0,
  moveCounter: 0,
  snapId: 0,
  selectedMapsec: MAPSEC_NONE,
  selectedMapsecType: MAPSECTYPE_NONE,
  selectedDungeonType: MAPSECTYPE_NONE
});

export const createRegionMapPlayerIcon = (x = 0, y = 0): RegionMapPlayerIcon => ({
  x,
  y,
  sprite: createRegionMapSprite(8 * x + 36, 8 * y + 36)
});

export const createRegionMapRuntime = (overrides: Partial<RegionMapRuntime> = {}): RegionMapRuntime => ({
  gpuRegs: overrides.gpuRegs ?? new Map<number, number>(),
  savedGpuRegs: overrides.savedGpuRegs ?? [null, null, null, null],
  mapOpenCloseAnim: overrides.mapOpenCloseAnim ?? createRegionMapOpenCloseAnim(),
  selectedRegion: overrides.selectedRegion ?? REGIONMAP_KANTO,
  playersRegion: overrides.playersRegion ?? REGIONMAP_KANTO,
  permissions: overrides.permissions ?? Array.from({ length: MAPPERM_COUNT }, () => false),
  flags: overrides.flags ?? new Set<string>(),
  mapCursor: overrides.mapCursor ?? createRegionMapCursor(),
  playerIcon: overrides.playerIcon ?? createRegionMapPlayerIcon()
});

export const GetGpuReg = (runtime: RegionMapRuntime, reg: number): number => runtime.gpuRegs.get(reg) ?? 0;

export const SetGpuReg = (runtime: RegionMapRuntime, reg: number, value: number): void => {
  runtime.gpuRegs.set(reg, value & 0xffff);
};

export const ClearGpuRegBits = (runtime: RegionMapRuntime, reg: number, bits: number): void => {
  SetGpuReg(runtime, reg, GetGpuReg(runtime, reg) & ~bits);
};

export const RegionMap_DarkenPalette = (pal: number[], size: number, tint: number): void => {
  for (let i = 0; i < size; i += 1) {
    let red = pal[i] & 0x1f;
    let green = (pal[i] >> 5) & 0x1f;
    let blue = (pal[i] >> 10) & 0x1f;

    red = (div(red << 8, 100) * tint) >> 8;
    green = (div(green << 8, 100) * tint) >> 8;
    blue = (div(blue << 8, 100) * tint) >> 8;

    pal[i] = RGB2(red, green, blue);
  }
};

export const SetBldCnt = (runtime: RegionMapRuntime, tgt2: number, tgt1: number, effect: number): void => {
  let regval = tgt2 << 8;
  regval |= tgt1;
  regval |= effect;
  SetGpuReg(runtime, REG_OFFSET_BLDCNT, regval);
};

export const SetBldY = (runtime: RegionMapRuntime, tgt: number): void => {
  SetGpuReg(runtime, REG_OFFSET_BLDY, tgt);
};

export const SetBldAlpha = (runtime: RegionMapRuntime, tgt2: number, tgt1: number): void => {
  let regval = tgt2 << 8;
  regval |= tgt1;
  SetGpuReg(runtime, REG_OFFSET_BLDALPHA, regval);
};

export const SetWinIn = (runtime: RegionMapRuntime, b: number, a: number): void => {
  let regval = a << 8;
  regval |= b;
  SetGpuReg(runtime, REG_OFFSET_WININ, regval);
};

export const SetWinOut = (runtime: RegionMapRuntime, regval: number): void => {
  SetGpuReg(runtime, REG_OFFSET_WINOUT, regval);
};

export const SetDispCnt = (runtime: RegionMapRuntime, idx: number, clear: boolean): void => {
  const data = [...sWinFlags];
  switch (clear) {
    case false:
      SetGpuReg(runtime, REG_OFFSET_DISPCNT, GetGpuReg(runtime, REG_OFFSET_DISPCNT) | data[idx]);
      break;
    case true:
      ClearGpuRegBits(runtime, REG_OFFSET_DISPCNT, data[idx]);
      break;
  }
};

export const SetGpuWindowDims = (runtime: RegionMapRuntime, winIdx: number, data: GpuWindowParams): void => {
  SetGpuReg(runtime, sWinRegs[winIdx][0], WIN_RANGE(data.top, data.bottom));
  SetGpuReg(runtime, sWinRegs[winIdx][1], WIN_RANGE(data.left, data.right));
};

export const SaveRegionMapGpuRegs = (runtime: RegionMapRuntime, idx: number): boolean => {
  if (runtime.savedGpuRegs[idx] !== null) {
    return false;
  }

  runtime.savedGpuRegs[idx] = {
    bldcnt: GetGpuReg(runtime, REG_OFFSET_BLDCNT),
    bldy: GetGpuReg(runtime, REG_OFFSET_BLDY),
    bldalpha: GetGpuReg(runtime, REG_OFFSET_BLDALPHA),
    winin: GetGpuReg(runtime, REG_OFFSET_WININ),
    winout: GetGpuReg(runtime, REG_OFFSET_WINOUT),
    win0h: GetGpuReg(runtime, REG_OFFSET_WIN0H),
    win1h: GetGpuReg(runtime, REG_OFFSET_WIN1H),
    win0v: GetGpuReg(runtime, REG_OFFSET_WIN0V),
    win1v: GetGpuReg(runtime, REG_OFFSET_WIN1V)
  };
  return true;
};

export const SetRegionMapGpuRegs = (runtime: RegionMapRuntime, idx: number): boolean => {
  const saved = runtime.savedGpuRegs[idx];
  if (saved === null) {
    return false;
  }

  SetGpuReg(runtime, REG_OFFSET_BLDCNT, saved.bldcnt);
  SetGpuReg(runtime, REG_OFFSET_BLDY, saved.bldy);
  SetGpuReg(runtime, REG_OFFSET_BLDALPHA, saved.bldalpha);
  SetGpuReg(runtime, REG_OFFSET_WININ, saved.winin);
  SetGpuReg(runtime, REG_OFFSET_WINOUT, saved.winout);
  SetGpuReg(runtime, REG_OFFSET_WIN0H, saved.win0h);
  SetGpuReg(runtime, REG_OFFSET_WIN1H, saved.win1h);
  SetGpuReg(runtime, REG_OFFSET_WIN0V, saved.win0v);
  SetGpuReg(runtime, REG_OFFSET_WIN1V, saved.win1v);
  runtime.savedGpuRegs[idx] = null;
  return true;
};

export const SetGpuWindowDimsToMapEdges = (runtime: RegionMapRuntime): void => {
  const data: GpuWindowParams = {
    left: runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x,
    top: 16,
    right: runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_RIGHT].sprite.x,
    bottom: 160
  };
  SetGpuWindowDims(runtime, 0, data);
};

const moveMapEdges = (runtime: RegionMapRuntime, direction: -1 | 1): void => {
  let delta: number;
  if (runtime.mapOpenCloseAnim.moveState > 17) {
    delta = 1;
  } else if (runtime.mapOpenCloseAnim.moveState > 14) {
    delta = 2;
  } else if (runtime.mapOpenCloseAnim.moveState > 10) {
    delta = 3;
  } else if (runtime.mapOpenCloseAnim.moveState > 6) {
    delta = 5;
  } else {
    delta = 8;
  }

  runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x += direction * delta;
  runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_MID_LEFT].sprite.x += direction * delta;
  runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_BOT_LEFT].sprite.x += direction * delta;
  runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_RIGHT].sprite.x -= direction * delta;
  runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_MID_RIGHT].sprite.x -= direction * delta;
  runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_BOT_RIGHT].sprite.x -= direction * delta;
};

export const MoveMapEdgesOutward = (runtime: RegionMapRuntime): boolean => {
  SetGpuWindowDimsToMapEdges(runtime);
  if (runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x === 0) {
    return true;
  }

  moveMapEdges(runtime, -1);
  runtime.mapOpenCloseAnim.moveState += 1;
  return false;
};

export const MoveMapEdgesInward = (runtime: RegionMapRuntime): boolean => {
  SetGpuWindowDimsToMapEdges(runtime);
  if (runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x === 104) {
    return true;
  }

  moveMapEdges(runtime, 1);
  runtime.mapOpenCloseAnim.moveState += 1;
  return false;
};

const selectedRegionToLayoutName = (whichMap: number): keyof typeof REGION_MAP_LAYOUTS | null => {
  switch (whichMap) {
    case REGIONMAP_KANTO:
      return 'Kanto';
    case REGIONMAP_SEVII123:
      return 'Sevii123';
    case REGIONMAP_SEVII45:
      return 'Sevii45';
    case REGIONMAP_SEVII67:
      return 'Sevii67';
    default:
      return null;
  }
};

export const GetRegionMapPermission = (runtime: RegionMapRuntime, attr: number): boolean =>
  runtime.permissions[attr] === true;

export const GetSelectedRegionMap = (runtime: RegionMapRuntime): number => runtime.selectedRegion;

export const GetRegionMapPlayerIsOn = (runtime: RegionMapRuntime): number => runtime.playersRegion;

export const GetSelectedMapSection = (
  whichMap: number,
  layer: RegionMapLayer,
  y: number,
  x: number
): string => {
  const layout = selectedRegionToLayoutName(whichMap);
  if (layout === null) return MAPSEC_NONE;
  return REGION_MAP_LAYOUTS[layout][layer][y]?.[x] ?? MAPSEC_NONE;
};

export const GetMapCursorX = (runtime: RegionMapRuntime): number => runtime.mapCursor.x;

export const GetMapCursorY = (runtime: RegionMapRuntime): number => runtime.mapCursor.y;

export const GetMapsecUnderCursor = (runtime: RegionMapRuntime): string => {
  if (
    runtime.mapCursor.y < 0
    || runtime.mapCursor.y >= MAP_HEIGHT
    || runtime.mapCursor.x < 0
    || runtime.mapCursor.x >= MAP_WIDTH
  ) {
    return MAPSEC_NONE;
  }

  let mapsec = GetSelectedMapSection(GetSelectedRegionMap(runtime), LAYER_MAP, runtime.mapCursor.y, runtime.mapCursor.x);
  if (
    (mapsec === MAPSEC_NAVEL_ROCK || mapsec === MAPSEC_BIRTH_ISLAND)
    && !runtime.flags.has(FLAG_WORLD_MAP_NAVEL_ROCK_EXTERIOR)
  ) {
    mapsec = MAPSEC_NONE;
  }
  return mapsec;
};

export const GetDungeonMapsecUnderCursor = (runtime: RegionMapRuntime): string => {
  if (
    runtime.mapCursor.y < 0
    || runtime.mapCursor.y >= MAP_HEIGHT
    || runtime.mapCursor.x < 0
    || runtime.mapCursor.x >= MAP_WIDTH
  ) {
    return MAPSEC_NONE;
  }

  let mapsec = GetSelectedMapSection(GetSelectedRegionMap(runtime), LAYER_DUNGEON, runtime.mapCursor.y, runtime.mapCursor.x);
  if (mapsec === MAPSEC_CERULEAN_CAVE && !runtime.flags.has(FLAG_SYS_CAN_LINK_WITH_RS)) {
    mapsec = MAPSEC_NONE;
  }
  return mapsec;
};

const townMapsecFlags: Record<string, string> = {
  MAPSEC_PALLET_TOWN: 'FLAG_WORLD_MAP_PALLET_TOWN',
  MAPSEC_VIRIDIAN_CITY: 'FLAG_WORLD_MAP_VIRIDIAN_CITY',
  MAPSEC_PEWTER_CITY: 'FLAG_WORLD_MAP_PEWTER_CITY',
  MAPSEC_CERULEAN_CITY: 'FLAG_WORLD_MAP_CERULEAN_CITY',
  MAPSEC_LAVENDER_TOWN: 'FLAG_WORLD_MAP_LAVENDER_TOWN',
  MAPSEC_VERMILION_CITY: 'FLAG_WORLD_MAP_VERMILION_CITY',
  MAPSEC_CELADON_CITY: 'FLAG_WORLD_MAP_CELADON_CITY',
  MAPSEC_FUCHSIA_CITY: 'FLAG_WORLD_MAP_FUCHSIA_CITY',
  MAPSEC_CINNABAR_ISLAND: 'FLAG_WORLD_MAP_CINNABAR_ISLAND',
  MAPSEC_INDIGO_PLATEAU: 'FLAG_WORLD_MAP_INDIGO_PLATEAU_EXTERIOR',
  MAPSEC_SAFFRON_CITY: 'FLAG_WORLD_MAP_SAFFRON_CITY',
  MAPSEC_ONE_ISLAND: 'FLAG_WORLD_MAP_ONE_ISLAND',
  MAPSEC_TWO_ISLAND: 'FLAG_WORLD_MAP_TWO_ISLAND',
  MAPSEC_THREE_ISLAND: 'FLAG_WORLD_MAP_THREE_ISLAND',
  MAPSEC_FOUR_ISLAND: 'FLAG_WORLD_MAP_FOUR_ISLAND',
  MAPSEC_FIVE_ISLAND: 'FLAG_WORLD_MAP_FIVE_ISLAND',
  MAPSEC_SEVEN_ISLAND: 'FLAG_WORLD_MAP_SEVEN_ISLAND',
  MAPSEC_SIX_ISLAND: 'FLAG_WORLD_MAP_SIX_ISLAND'
};

export const GetMapsecType = (runtime: RegionMapRuntime, mapsec: string): number => {
  if (mapsec === MAPSEC_ROUTE_4_POKECENTER) {
    if (!GetRegionMapPermission(runtime, MAPPERM_HAS_FLY_DESTINATIONS)) return MAPSECTYPE_NONE;
    return runtime.flags.has('FLAG_WORLD_MAP_ROUTE4_POKEMON_CENTER_1F')
      ? MAPSECTYPE_VISITED
      : MAPSECTYPE_NOT_VISITED;
  }
  if (mapsec === MAPSEC_ROUTE_10_POKECENTER) {
    return runtime.flags.has('FLAG_WORLD_MAP_ROUTE10_POKEMON_CENTER_1F')
      ? MAPSECTYPE_VISITED
      : MAPSECTYPE_NOT_VISITED;
  }
  if (mapsec === MAPSEC_NONE) return MAPSECTYPE_NONE;
  const flag = townMapsecFlags[mapsec];
  if (flag) return runtime.flags.has(flag) ? MAPSECTYPE_VISITED : MAPSECTYPE_NOT_VISITED;
  return MAPSECTYPE_ROUTE;
};

export const GetSelectedMapsecType = (runtime: RegionMapRuntime, layer: number): number => {
  switch (layer) {
    default:
      return runtime.mapCursor.selectedMapsecType;
    case LAYER_MAP:
      return runtime.mapCursor.selectedMapsecType;
    case LAYER_DUNGEON:
      return runtime.mapCursor.selectedDungeonType;
  }
};

export const ResetCursorSnap = (runtime: RegionMapRuntime): void => {
  runtime.mapCursor.snapId = 0;
};

export const SnapToIconOrButton = (runtime: RegionMapRuntime): void => {
  if (GetRegionMapPermission(runtime, MAPPERM_HAS_SWITCH_BUTTON)) {
    runtime.mapCursor.snapId += 1;
    runtime.mapCursor.snapId %= 3;
    if (runtime.mapCursor.snapId === 0 && GetSelectedRegionMap(runtime) !== GetRegionMapPlayerIsOn(runtime)) {
      runtime.mapCursor.snapId += 1;
    }
    switch (runtime.mapCursor.snapId) {
      case 0:
      default:
        runtime.mapCursor.x = runtime.playerIcon.x;
        runtime.mapCursor.y = runtime.playerIcon.y;
        break;
      case 1:
        runtime.mapCursor.x = SWITCH_BUTTON_X;
        runtime.mapCursor.y = SWITCH_BUTTON_Y;
        break;
      case 2:
        runtime.mapCursor.y = CANCEL_BUTTON_Y;
        runtime.mapCursor.x = CANCEL_BUTTON_X;
        break;
    }
  } else {
    runtime.mapCursor.snapId += 1;
    runtime.mapCursor.snapId %= 2;
    switch (runtime.mapCursor.snapId) {
      case 0:
      default:
        runtime.mapCursor.x = runtime.playerIcon.x;
        runtime.mapCursor.y = runtime.playerIcon.y;
        break;
      case 1:
        runtime.mapCursor.y = CANCEL_BUTTON_Y;
        runtime.mapCursor.x = CANCEL_BUTTON_X;
        break;
    }
  }
  runtime.mapCursor.sprite.x = 8 * runtime.mapCursor.x + 36;
  runtime.mapCursor.sprite.y = 8 * runtime.mapCursor.y + 36;
  runtime.mapCursor.selectedMapsec = GetSelectedMapSection(
    GetSelectedRegionMap(runtime),
    LAYER_MAP,
    runtime.mapCursor.y,
    runtime.mapCursor.x
  );
};

type RegionMapCompatRuntime = RegionMapRuntime & {
  operations?: string[];
  mainState?: number;
  openState?: number;
  loadGfxState?: number;
  switchMenu?: { currentSelection: number; chosenRegion: number; maxSelection: number; alpha: number; yOffset: number; mainState: number };
  dungeonPreview?: { mainState: number; drawState: number; loadState: number; updateCounter: number; timer: number };
  mapIcons?: { state: number; flyInvisible: boolean[]; dungeonInvisible: boolean[] };
  flyMap?: { state: number; selectedDestination: boolean; destination: string | null };
  callback2?: string;
  vblankCallback?: string | null;
  mainTask?: string | null;
  savedTask?: string | null;
  selectedMapsecSE?: boolean;
  bgHidden?: boolean;
  mapNameText?: string;
  dungeonNameText?: string;
};

const compat = (runtime: RegionMapRuntime): RegionMapCompatRuntime => runtime as RegionMapCompatRuntime;
const op = (runtime: RegionMapRuntime, name: string, ...args: Array<string | number | boolean>): void => {
  const r = compat(runtime);
  r.operations ??= [];
  r.operations.push([name, ...args].join(':'));
};
const ensureSwitchMenu = (runtime: RegionMapRuntime) => {
  const r = compat(runtime);
  r.switchMenu ??= { currentSelection: 0, chosenRegion: runtime.selectedRegion, maxSelection: REGIONMAP_SEVII67, alpha: 0, yOffset: 0, mainState: 0 };
  return r.switchMenu;
};
const ensureMapIcons = (runtime: RegionMapRuntime) => {
  const r = compat(runtime);
  r.mapIcons ??= { state: 0, flyInvisible: Array.from({ length: 25 }, () => false), dungeonInvisible: Array.from({ length: 25 }, () => false) };
  return r.mapIcons;
};

export function TintMapEdgesPalette(pal: number[], size = pal.length, tint = 95): void { RegionMap_DarkenPalette(pal, size, tint); }
export function InitRegionMap(runtime: RegionMapRuntime): void { InitRegionMapType(runtime); compat(runtime).callback2 = 'CB2_OpenRegionMap'; }
export function InitRegionMapWithExitCB(runtime: RegionMapRuntime, exitCB = 'exit'): void { compat(runtime).savedTask = exitCB; InitRegionMap(runtime); }
export function InitRegionMapType(runtime: RegionMapRuntime): void { compat(runtime).mainState = 0; compat(runtime).openState = 0; compat(runtime).loadGfxState = 0; op(runtime, 'InitRegionMapType'); }
export function CB2_OpenRegionMap(runtime: RegionMapRuntime): void { if (LoadRegionMapGfx(runtime)) CreateMainMapTask(runtime); }
export function LoadRegionMapGfx(runtime: RegionMapRuntime): boolean { const r = compat(runtime); r.loadGfxState = (r.loadGfxState ?? 0) + 1; op(runtime, 'LoadRegionMapGfx', r.loadGfxState); return r.loadGfxState >= 1; }
export function CreateMainMapTask(runtime: RegionMapRuntime): void { compat(runtime).mainTask = 'Task_RegionMap'; op(runtime, 'CreateMainMapTask'); }
export function SelectedMapsecSEEnabled(runtime: RegionMapRuntime): boolean { return compat(runtime).selectedMapsecSE !== false; }
export function PlaySEForSelectedMapsec(runtime: RegionMapRuntime): void { if (SelectedMapsecSEEnabled(runtime)) op(runtime, 'PlaySEForSelectedMapsec', runtime.mapCursor.selectedMapsec); }
export function Task_RegionMap(taskId: number, runtime: RegionMapRuntime): void { op(runtime, 'Task_RegionMap', taskId); compat(runtime).mainTask ??= 'Task_RegionMap'; }
export function SetMainMapTask(runtime: RegionMapRuntime, task: string): void { compat(runtime).mainTask = task; }
export function SaveMainMapTask(taskId: number, runtime: RegionMapRuntime): void { compat(runtime).savedTask = compat(runtime).mainTask ?? null; op(runtime, 'SaveMainMapTask', taskId); }
export function FreeRegionMap(taskId: number, runtime: RegionMapRuntime): void { compat(runtime).mainTask = null; op(runtime, 'FreeRegionMap', taskId); }
export function FreeRegionMapForFlyMap(taskId: number, runtime: RegionMapRuntime): void { FreeRegionMap(taskId, runtime); compat(runtime).flyMap = { state: 0, selectedDestination: false, destination: null }; }
export function CB2_RegionMap(runtime: RegionMapRuntime): void { op(runtime, 'CB2_RegionMap'); }
export function VBlankCB_RegionMap(runtime: RegionMapRuntime): void { op(runtime, 'VBlankCB_RegionMap'); }
export function NullVBlankHBlankCallbacks(runtime: RegionMapRuntime): void { compat(runtime).vblankCallback = null; }
export function SetRegionMapVBlankCB(runtime: RegionMapRuntime): void { compat(runtime).vblankCallback = 'VBlankCB_RegionMap'; }
export function InitRegionMapBgs(runtime: RegionMapRuntime): void { op(runtime, 'InitRegionMapBgs'); }
export function SetBgTilemapBuffers(runtime: RegionMapRuntime): void { op(runtime, 'SetBgTilemapBuffers'); }
export function ResetOamForRegionMap(runtime: RegionMapRuntime): void { op(runtime, 'ResetOamForRegionMap'); }
export function SetBg0andBg3Hidden(hidden: boolean, runtime: RegionMapRuntime): void { compat(runtime).bgHidden = hidden; }
export function UpdateMapsecNameBox(runtime: RegionMapRuntime): void { DisplayCurrentMapName(runtime); DisplayCurrentDungeonName(runtime); }
export function DisplayCurrentMapName(runtime: RegionMapRuntime): void { compat(runtime).mapNameText = String(runtime.mapCursor.selectedMapsec || GetMapsecUnderCursor(runtime)); }
export function DrawDungeonNameBox(runtime: RegionMapRuntime): void { op(runtime, 'DrawDungeonNameBox'); }
export function DisplayCurrentDungeonName(runtime: RegionMapRuntime): void { compat(runtime).dungeonNameText = String(GetDungeonMapsecUnderCursor(runtime)); }
export function ClearMapsecNameText(runtime: RegionMapRuntime): void { compat(runtime).mapNameText = ''; compat(runtime).dungeonNameText = ''; }
export function BufferRegionMapBg(whichMap: number, _dest: number[], runtime: RegionMapRuntime): void { runtime.selectedRegion = whichMap; op(runtime, 'BufferRegionMapBg', whichMap); }
export function SetSelectedRegionMap(whichMap: number, runtime: RegionMapRuntime): void { runtime.selectedRegion = whichMap; }
export function SetRegionMapPlayerIsOn(whichMap: number, runtime: RegionMapRuntime): void { runtime.playersRegion = whichMap; }
export function InitSwitchMapMenu(runtime: RegionMapRuntime, currentSelection = runtime.selectedRegion, maxSelection = REGIONMAP_SEVII67, exitTask = 'Task_RegionMap'): void { const menu = ensureSwitchMenu(runtime); menu.currentSelection = currentSelection; menu.chosenRegion = currentSelection; menu.maxSelection = maxSelection; compat(runtime).savedTask = exitTask; }
export function ResetGpuRegsForSwitchMapMenu(runtime: RegionMapRuntime): void { ResetGpuRegs(runtime); }
export function FadeSwitchMapMenuIn(runtime: RegionMapRuntime): boolean { const menu = ensureSwitchMenu(runtime); menu.alpha = Math.min(16, menu.alpha + 2); return menu.alpha >= 16; }
export function FadeSwitchMapMenuOut(runtime: RegionMapRuntime): boolean { const menu = ensureSwitchMenu(runtime); menu.alpha = Math.max(0, menu.alpha - 2); return menu.alpha === 0; }
export function Task_SwitchMapMenu(taskId: number, runtime: RegionMapRuntime): void { const menu = ensureSwitchMenu(runtime); menu.mainState++; op(runtime, 'Task_SwitchMapMenu', taskId, menu.mainState); }
export function FreeSwitchMapMenu(taskId: number, runtime: RegionMapRuntime): void { compat(runtime).switchMenu = undefined; op(runtime, 'FreeSwitchMapMenu', taskId); }
export function BrightenScreenForSwitchMapMenu(runtime: RegionMapRuntime): boolean { return FadeSwitchMapMenuIn(runtime); }
export function LoadSwitchMapTilemap(selection: number, _dest: number[], runtime: RegionMapRuntime): void { ensureSwitchMenu(runtime).currentSelection = selection; op(runtime, 'LoadSwitchMapTilemap', selection); }
export function SetGpuRegsToDimScreen(runtime: RegionMapRuntime): void { SetBldCnt(runtime, 0, 0, BLDCNT_EFFECT_DARKEN); SetBldY(runtime, 8); }
export function DimScreenForSwitchMapMenu(runtime: RegionMapRuntime): boolean { SetGpuRegsToDimScreen(runtime); return true; }
export function HandleSwitchMapInput(runtime: RegionMapRuntime, input = 0): boolean { const menu = ensureSwitchMenu(runtime); if (input < 0) menu.currentSelection = Math.max(0, menu.currentSelection - 1); if (input > 0) menu.currentSelection = Math.min(menu.maxSelection, menu.currentSelection + 1); menu.chosenRegion = menu.currentSelection; return input === 2; }
export function SpriteCB_SwitchMapCursor(sprite: RegionMapSprite, runtime: RegionMapRuntime): void { sprite.y = 32 + ensureSwitchMenu(runtime).currentSelection * 24; }
export function CreateSwitchMapCursor(runtime: RegionMapRuntime): boolean { op(runtime, 'CreateSwitchMapCursor'); return true; }
export function CreateSwitchMapCursorSubsprite(id: number, tileTag: number, palTag: number, runtime: RegionMapRuntime): void { op(runtime, 'CreateSwitchMapCursorSubsprite', id, tileTag, palTag); }
export function CreateSwitchMapCursorSubsprite_(id: number, tileTag: number, palTag: number, runtime: RegionMapRuntime): void { CreateSwitchMapCursorSubsprite(id, tileTag, palTag, runtime); }
export function FreeSwitchMapCursor(runtime: RegionMapRuntime): void { op(runtime, 'FreeSwitchMapCursor'); }
export function InitDungeonMapPreview(runtime: RegionMapRuntime, mapsec = MAPSEC_NONE as string, exitTask = 'Task_RegionMap'): void { compat(runtime).dungeonPreview = { mainState: 0, drawState: 0, loadState: 0, updateCounter: 0, timer: 0 }; compat(runtime).savedTask = exitTask; op(runtime, 'InitDungeonMapPreview', mapsec); }
export function LoadMapPreviewGfx(runtime: RegionMapRuntime): boolean { const p = compat(runtime).dungeonPreview; if (p) p.loadState++; return true; }
export function Task_DungeonMapPreview(taskId: number, runtime: RegionMapRuntime): void { const p = compat(runtime).dungeonPreview; if (p) p.mainState++; op(runtime, 'Task_DungeonMapPreview', taskId); }
export function Task_DrawDungeonMapPreviewFlavorText(taskId: number, runtime: RegionMapRuntime): void { const p = compat(runtime).dungeonPreview; if (p) p.drawState++; op(runtime, 'Task_DrawDungeonMapPreviewFlavorText', taskId); }
export function FreeDungeonMapPreview(taskId: number, runtime: RegionMapRuntime): void { compat(runtime).dungeonPreview = undefined; op(runtime, 'FreeDungeonMapPreview', taskId); }
export function CopyMapPreviewTilemapToBgTilemapBuffer(bg: number, _tilemap: number[], runtime: RegionMapRuntime): void { op(runtime, 'CopyMapPreviewTilemapToBgTilemapBuffer', bg); }
export function InitScreenForDungeonMapPreview(runtime: RegionMapRuntime): void { op(runtime, 'InitScreenForDungeonMapPreview'); }
export function UpdateDungeonMapPreview(runtime: RegionMapRuntime, _first: boolean): boolean { const p = compat(runtime).dungeonPreview; if (p) p.updateCounter++; return (p?.updateCounter ?? 1) > 0; }
export function SpriteCB_MapEdge(sprite: RegionMapSprite): void { sprite.invisible = false; }
export function CreateMapEdgeSprite(edge: RegionMapEdge, x: number, y: number): RegionMapSprite { edge.sprite = createRegionMapSprite(x, y); return edge.sprite; }
export function InitMapOpenAnim(runtime: RegionMapRuntime, exitTask = 'Task_RegionMap'): void { runtime.mapOpenCloseAnim = createRegionMapOpenCloseAnim(); compat(runtime).savedTask = exitTask; }
export function SetMapEdgeInvisibility(invisible: boolean, runtime: RegionMapRuntime): void { runtime.mapOpenCloseAnim.mapEdges.forEach(edge => { edge.sprite.invisible = invisible; }); }
export function LoadMapEdgeGfx(runtime: RegionMapRuntime): boolean { op(runtime, 'LoadMapEdgeGfx'); return true; }
export function InitScreenForMapOpenAnim(runtime: RegionMapRuntime): void { op(runtime, 'InitScreenForMapOpenAnim'); }
export function SetGpuRegsToFadeMapToWhite(runtime: RegionMapRuntime): void { SetBldCnt(runtime, 0, 0, BLDCNT_EFFECT_LIGHTEN); SetBldY(runtime, 16); }
export function FinishMapOpenAnim(runtime: RegionMapRuntime): void { SetMapEdgeInvisibility(true, runtime); }
export function FreeMapOpenCloseAnim(runtime: RegionMapRuntime): void { op(runtime, 'FreeMapOpenCloseAnim'); }
export function FreeMapEdgeSprites(runtime: RegionMapRuntime): void { SetMapEdgeInvisibility(true, runtime); }
export function Task_MapOpenAnim(taskId: number, runtime: RegionMapRuntime): void { if (MoveMapEdgesOutward(runtime)) FinishMapOpenAnim(runtime); op(runtime, 'Task_MapOpenAnim', taskId); }
export function InitScreenForMapCloseAnim(runtime: RegionMapRuntime): void { op(runtime, 'InitScreenForMapCloseAnim'); }
export function DoMapCloseAnim(taskId: number, runtime: RegionMapRuntime): void { Task_MapCloseAnim(taskId, runtime); }
export function CreateMapEdgeSprites(runtime: RegionMapRuntime): void { runtime.mapOpenCloseAnim = createRegionMapOpenCloseAnim(); }
export function Task_MapCloseAnim(taskId: number, runtime: RegionMapRuntime): void { MoveMapEdgesInward(runtime); op(runtime, 'Task_MapCloseAnim', taskId); }
export function SpriteCB_MapCursor(sprite: RegionMapSprite, runtime: RegionMapRuntime): void { sprite.x = runtime.mapCursor.sprite.x; sprite.y = runtime.mapCursor.sprite.y; }
export function CreateMapCursor(x: number, y: number, runtime: RegionMapRuntime): void { runtime.mapCursor = createRegionMapCursor(x, y); }
export function CreateMapCursorSprite(runtime: RegionMapRuntime): RegionMapSprite { runtime.mapCursor.sprite = createRegionMapSprite(8 * runtime.mapCursor.x + 36, 8 * runtime.mapCursor.y + 36); return runtime.mapCursor.sprite; }
export function SetMapCursorInvisibility(invisible: boolean, runtime: RegionMapRuntime): void { runtime.mapCursor.sprite.invisible = invisible; }
export function FreeMapCursor(runtime: RegionMapRuntime): void { runtime.mapCursor.sprite.invisible = true; }
export function HandleRegionMapInput(runtime: RegionMapRuntime, input = 0): number { return input || GetRegionMapInput(runtime); }
export function MoveMapCursor(runtime: RegionMapRuntime, dx = 0, dy = 0): number { runtime.mapCursor.x = Math.max(0, Math.min(MAP_WIDTH - 1, runtime.mapCursor.x + dx)); runtime.mapCursor.y = Math.max(0, Math.min(MAP_HEIGHT - 1, runtime.mapCursor.y + dy)); runtime.mapCursor.sprite.x = 8 * runtime.mapCursor.x + 36; runtime.mapCursor.sprite.y = 8 * runtime.mapCursor.y + 36; return 0; }
export function GetRegionMapInput(_runtime: RegionMapRuntime): number { return 0; }
export function GetDungeonFlavorText(mapsec: string): string {
  for (const dungeon of sDungeonInfo) {
    if (dungeon.id === mapsec)
      return dungeon.desc;
  }
  return gText_RegionMap_NoData;
}
export function GetDungeonName(mapsec: string): string {
  for (const dungeon of sDungeonInfo) {
    if (dungeon.id === mapsec)
      return dungeon.name;
  }
  return gText_RegionMap_NoData;
}
export function GetMapName(
  dest: { value?: string } | null | undefined,
  mapsec: string,
  fill = 0
): string {
  let text: string;
  if (isValidMapsec(mapsec)) {
    text = IsCeladonDeptStoreMapsec(mapsec) ? 'CELADON DEPT.' : getMapsecDisplayName(mapsec);
  } else {
    text = ' '.repeat(fill === 0 ? 18 : fill);
    if (dest)
      dest.value = text;
    return text;
  }
  if (fill !== 0)
    text = text.padEnd(fill, ' ');
  if (dest)
    dest.value = text;
  return text;
}
export function GetMapNameGeneric(dest: { value?: string } | null | undefined, mapsec: string): string {
  return GetMapName(dest, mapsec, 0);
}
export function GetMapNameGeneric_(dest: { value?: string } | null | undefined, mapsec: string): string {
  return GetMapNameGeneric(dest, mapsec);
}
export function GetDungeonMapsecType(runtime: RegionMapRuntime, mapsec = GetDungeonMapsecUnderCursor(runtime)): number { return GetMapsecType(runtime, mapsec); }
export function GetPlayerCurrentMapSectionId(runtime: RegionMapRuntime): string { return runtime.mapCursor.selectedMapsec || GetMapsecUnderCursor(runtime); }
export function GetPlayerPositionOnRegionMap(runtime: RegionMapRuntime): [number, number] { GetPlayerPositionOnRegionMap_HandleOverrides(runtime); return [runtime.playerIcon.x, runtime.playerIcon.y]; }
export function GetPlayerPositionOnRegionMap_HandleOverrides(runtime: RegionMapRuntime): void { runtime.playerIcon.x = Math.max(0, Math.min(MAP_WIDTH - 1, runtime.playerIcon.x)); runtime.playerIcon.y = Math.max(0, Math.min(MAP_HEIGHT - 1, runtime.playerIcon.y)); }
export function CreatePlayerIcon(x: number, y: number, runtime: RegionMapRuntime): void { runtime.playerIcon = createRegionMapPlayerIcon(x, y); }
export function CreatePlayerIconSprite(runtime: RegionMapRuntime): RegionMapSprite { runtime.playerIcon.sprite = createRegionMapSprite(8 * runtime.playerIcon.x + 36, 8 * runtime.playerIcon.y + 36); return runtime.playerIcon.sprite; }
export function SetPlayerIconInvisibility(invisible: boolean, runtime: RegionMapRuntime): void { runtime.playerIcon.sprite.invisible = invisible; }
export function FreePlayerIcon(runtime: RegionMapRuntime): void { runtime.playerIcon.sprite.invisible = true; }
export function GetPlayerIconX(runtime: RegionMapRuntime): number { return runtime.playerIcon.x; }
export function GetPlayerIconY(runtime: RegionMapRuntime): number { return runtime.playerIcon.y; }
export function InitMapIcons(runtime: RegionMapRuntime, region = runtime.selectedRegion, exitTask = 'Task_RegionMap'): void { ensureMapIcons(runtime).state = 0; compat(runtime).savedTask = exitTask; op(runtime, 'InitMapIcons', region); }
export function LoadMapIcons(state: number, runtime: RegionMapRuntime): void { ensureMapIcons(runtime).state = state; }
export function FinishMapIconLoad(_state: number, runtime: RegionMapRuntime): void { ensureMapIcons(runtime).state = 255; }
export function CreateFlyIconSprite(id: number, runtime: RegionMapRuntime): RegionMapSprite { op(runtime, 'CreateFlyIconSprite', id); return createRegionMapSprite(); }
export function CreateDungeonIconSprite(id: number, runtime: RegionMapRuntime): RegionMapSprite { op(runtime, 'CreateDungeonIconSprite', id); return createRegionMapSprite(); }
export function CreateFlyIcons(runtime: RegionMapRuntime): void { op(runtime, 'CreateFlyIcons'); }
export function CreateDungeonIcons(runtime: RegionMapRuntime): void { op(runtime, 'CreateDungeonIcons'); }
export function SetFlyIconInvisibility(region: number, id: number, invisible: boolean, runtime: RegionMapRuntime): void { ensureMapIcons(runtime).flyInvisible[id] = invisible; op(runtime, 'SetFlyIconInvisibility', region, id, invisible); }
export function SetDungeonIconInvisibility(region: number, id: number, invisible: boolean, runtime: RegionMapRuntime): void { ensureMapIcons(runtime).dungeonInvisible[id] = invisible; op(runtime, 'SetDungeonIconInvisibility', region, id, invisible); }
export function FreeMapIcons(runtime: RegionMapRuntime): void { compat(runtime).mapIcons = undefined; }
export function FreeRegionMapGpuRegs(idx: number, runtime: RegionMapRuntime): void { runtime.savedGpuRegs[idx] = null; }
export function ResetGpuRegs(runtime: RegionMapRuntime): void { runtime.gpuRegs.clear(); }
export function FreeAndResetGpuRegs(runtime: RegionMapRuntime): void { runtime.savedGpuRegs = [null, null, null, null]; ResetGpuRegs(runtime); }
export function IsCeladonDeptStoreMapsec(mapsec: string): boolean { return mapsec === 'MAPSEC_CELADON_DEPT_STORE'; }
export function PrintTopBarTextLeft(text: string, runtime: RegionMapRuntime): void { op(runtime, 'PrintTopBarTextLeft', text); }
export function PrintTopBarTextRight(text: string, runtime: RegionMapRuntime): void { op(runtime, 'PrintTopBarTextRight', text); }
export function ClearOrDrawTopBar(clear: boolean, runtime: RegionMapRuntime): void { op(runtime, clear ? 'ClearTopBar' : 'DrawTopBar'); }
export function CB2_OpenFlyMap(runtime: RegionMapRuntime): void { InitFlyMap(runtime); compat(runtime).callback2 = 'Task_FlyMap'; }
export function Task_FlyMap(taskId: number, runtime: RegionMapRuntime): void { const fly = compat(runtime).flyMap; if (fly) fly.state++; op(runtime, 'Task_FlyMap', taskId); }
export function InitFlyMap(runtime: RegionMapRuntime): void { compat(runtime).flyMap = { state: 0, selectedDestination: false, destination: null }; runtime.permissions[MAPPERM_HAS_FLY_DESTINATIONS] = true; }
export function FreeFlyMap(taskId: number, runtime: RegionMapRuntime): void { compat(runtime).flyMap = undefined; op(runtime, 'FreeFlyMap', taskId); }
export function SetFlyWarpDestination(mapsec: string, runtime: RegionMapRuntime): void { const fly = compat(runtime).flyMap ?? (compat(runtime).flyMap = { state: 0, selectedDestination: false, destination: null }); fly.selectedDestination = true; fly.destination = mapsec; op(runtime, 'SetFlyWarpDestination', mapsec); }
