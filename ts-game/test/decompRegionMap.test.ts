import { describe, expect, it } from 'vitest';
import {
  BLDCNT_EFFECT_DARKEN,
  CANCEL_BUTTON_X,
  CANCEL_BUTTON_Y,
  CB2_OpenFlyMap,
  CB2_OpenRegionMap,
  CreateMapCursor,
  CreatePlayerIcon,
  DisplayCurrentMapName,
  FadeSwitchMapMenuIn,
  FadeSwitchMapMenuOut,
  FreeFlyMap,
  FreeMapCursor,
  FreePlayerIcon,
  DISPCNT_WIN0_ON,
  DISPCNT_WIN1_ON,
  GetPlayerIconX,
  GetPlayerIconY,
  GetPlayerPositionOnRegionMap,
  FLAG_SYS_CAN_LINK_WITH_RS,
  FLAG_WORLD_MAP_NAVEL_ROCK_EXTERIOR,
  GetDungeonFlavorText,
  GetDungeonMapsecUnderCursor,
  GetDungeonName,
  GetGpuReg,
  GetMapName,
  GetMapNameGeneric,
  GetMapNameGeneric_,
  GetMapCursorX,
  GetMapCursorY,
  GetMapsecType,
  GetMapsecUnderCursor,
  GetRegionMapPermission,
  GetSelectedMapSection,
  GetSelectedMapsecType,
  InitFlyMap,
  InitMapIcons,
  InitMapOpenAnim,
  InitRegionMap,
  InitSwitchMapMenu,
  MAPEDGE_BOT_LEFT,
  MAPEDGE_BOT_RIGHT,
  MAPEDGE_MID_LEFT,
  MAPEDGE_MID_RIGHT,
  MAPEDGE_TOP_LEFT,
  MAPEDGE_TOP_RIGHT,
  MAPPERM_HAS_FLY_DESTINATIONS,
  MAPPERM_HAS_SWITCH_BUTTON,
  MAPSECTYPE_NONE,
  MAPSECTYPE_NOT_VISITED,
  MAPSECTYPE_ROUTE,
  MAPSECTYPE_VISITED,
  MAPSEC_BIRTH_ISLAND,
  MAPSEC_CERULEAN_CAVE,
  MAPSEC_NAVEL_ROCK,
  MAPSEC_NONE,
  MAPSEC_ROUTE_4_POKECENTER,
  MAPSEC_ROUTE_10_POKECENTER,
  MAPSEC_VIRIDIAN_FOREST,
  MAP_HEIGHT,
  MAP_WIDTH,
  MoveMapEdgesInward,
  MoveMapEdgesOutward,
  MoveMapCursor,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDY,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_WIN0H,
  REG_OFFSET_WIN0V,
  REG_OFFSET_WIN1H,
  REG_OFFSET_WIN1V,
  REG_OFFSET_WININ,
  REG_OFFSET_WINOUT,
  RGB2,
  RegionMap_DarkenPalette,
  REGIONMAP_KANTO,
  REGIONMAP_SEVII45,
  REGIONMAP_SEVII67,
  ResetCursorSnap,
  ResetGpuRegsForSwitchMapMenu,
  SetFlyIconInvisibility,
  SetFlyWarpDestination,
  SaveRegionMapGpuRegs,
  SetBldAlpha,
  SetBldCnt,
  SetBldY,
  SetDispCnt,
  SetGpuReg,
  SetGpuWindowDims,
  SetGpuWindowDimsToMapEdges,
  SetMapCursorInvisibility,
  SetPlayerIconInvisibility,
  SetRegionMapPlayerIsOn,
  SetRegionMapGpuRegs,
  SetSelectedRegionMap,
  SetWinIn,
  SetWinOut,
  SWITCH_BUTTON_X,
  SWITCH_BUTTON_Y,
  SnapToIconOrButton,
  WIN_RANGE,
  createRegionMapCursor,
  createRegionMapOpenCloseAnim,
  createRegionMapPlayerIcon,
  createRegionMapRuntime
} from '../src/game/decompRegionMap';
import { LAYER_DUNGEON, LAYER_MAP } from '../src/game/decompRegionMapLayouts';

const edgeXs = (runtime: ReturnType<typeof createRegionMapRuntime>) =>
  runtime.mapOpenCloseAnim.mapEdges.map((edge) => edge.sprite.x);

describe('decompRegionMap', () => {
  it('C-name map and dungeon string helpers preserve lookup, alias, padding, and no-data behavior', () => {
    const dest = { value: '' };

    expect(GetDungeonName(MAPSEC_VIRIDIAN_FOREST)).toBe('VIRIDIAN FOREST');
    expect(GetDungeonFlavorText(MAPSEC_VIRIDIAN_FOREST)).toBe('gText_RegionMap_AreaDesc_ViridianForest');
    expect(GetDungeonName('MAPSEC_ROUTE_1')).toBe('NO DATA');
    expect(GetDungeonFlavorText('MAPSEC_ROUTE_1')).toBe('NO DATA');

    expect(GetMapName(dest, 'MAPSEC_CELADON_DEPT_STORE', 0)).toBe('CELADON DEPT.');
    expect(dest.value).toBe('CELADON DEPT.');
    expect(GetMapName(dest, MAPSEC_ROUTE_4_POKECENTER, 10)).toBe('ROUTE 4   ');
    expect(GetMapNameGeneric(dest, 'MAPSEC_PALLET_TOWN')).toBe('PALLET TOWN');
    expect(GetMapNameGeneric_(dest, 'MAPSEC_MT_MOON')).toBe('MT. MOON');
    expect(GetMapName(dest, MAPSEC_NONE, 0)).toBe(' '.repeat(18));
    expect(GetMapName(dest, MAPSEC_NONE, 4)).toBe('    ');
  });

  it('RegionMap_DarkenPalette applies the exact fixed-point tint formula in place', () => {
    const pal = [RGB2(31, 31, 31), RGB2(12, 16, 20), RGB2(1, 2, 3)];

    RegionMap_DarkenPalette(pal, 2, 95);

    expect(pal[0]).toBe(RGB2(29, 29, 29));
    expect(pal[1]).toBe(RGB2(11, 14, 18));
    expect(pal[2]).toBe(RGB2(1, 2, 3));
  });

  it('blend/window register helpers preserve C packing order', () => {
    const runtime = createRegionMapRuntime();

    SetBldCnt(runtime, 0x12, 0x34, BLDCNT_EFFECT_DARKEN);
    expect(GetGpuReg(runtime, REG_OFFSET_BLDCNT)).toBe((0x12 << 8) | 0x34 | BLDCNT_EFFECT_DARKEN);
    SetBldY(runtime, 9);
    expect(GetGpuReg(runtime, REG_OFFSET_BLDY)).toBe(9);
    SetBldAlpha(runtime, 7, 11);
    expect(GetGpuReg(runtime, REG_OFFSET_BLDALPHA)).toBe((7 << 8) | 11);
    SetWinIn(runtime, 0x1f, 0x2a);
    expect(GetGpuReg(runtime, REG_OFFSET_WININ)).toBe((0x2a << 8) | 0x1f);
    SetWinOut(runtime, 0x1234);
    expect(GetGpuReg(runtime, REG_OFFSET_WINOUT)).toBe(0x1234);
  });

  it('SetDispCnt mirrors the C clear switch for WIN0/WIN1 bits', () => {
    const runtime = createRegionMapRuntime();

    SetDispCnt(runtime, 0, false);
    SetDispCnt(runtime, 1, false);
    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(DISPCNT_WIN0_ON | DISPCNT_WIN1_ON);
    SetDispCnt(runtime, 0, true);
    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(DISPCNT_WIN1_ON);
    SetDispCnt(runtime, 1, true);
    expect(GetGpuReg(runtime, REG_OFFSET_DISPCNT)).toBe(0);
  });

  it('SetGpuWindowDims writes vertical then horizontal window ranges for each window', () => {
    const runtime = createRegionMapRuntime();

    SetGpuWindowDims(runtime, 0, { left: 3, top: 4, right: 30, bottom: 40 });
    expect(GetGpuReg(runtime, REG_OFFSET_WIN0V)).toBe(WIN_RANGE(4, 40));
    expect(GetGpuReg(runtime, REG_OFFSET_WIN0H)).toBe(WIN_RANGE(3, 30));

    SetGpuWindowDims(runtime, 1, { left: 8, top: 9, right: 88, bottom: 99 });
    expect(GetGpuReg(runtime, REG_OFFSET_WIN1V)).toBe(WIN_RANGE(9, 99));
    expect(GetGpuReg(runtime, REG_OFFSET_WIN1H)).toBe(WIN_RANGE(8, 88));
  });

  it('SaveRegionMapGpuRegs saves once and SetRegionMapGpuRegs restores then frees slot', () => {
    const runtime = createRegionMapRuntime();

    SetGpuReg(runtime, REG_OFFSET_BLDCNT, 1);
    SetGpuReg(runtime, REG_OFFSET_BLDY, 2);
    SetGpuReg(runtime, REG_OFFSET_BLDALPHA, 3);
    SetGpuReg(runtime, REG_OFFSET_WININ, 4);
    SetGpuReg(runtime, REG_OFFSET_WINOUT, 5);
    SetGpuReg(runtime, REG_OFFSET_WIN0H, 6);
    SetGpuReg(runtime, REG_OFFSET_WIN1H, 7);
    SetGpuReg(runtime, REG_OFFSET_WIN0V, 8);
    SetGpuReg(runtime, REG_OFFSET_WIN1V, 9);

    expect(SaveRegionMapGpuRegs(runtime, 1)).toBe(true);
    expect(SaveRegionMapGpuRegs(runtime, 1)).toBe(false);
    SetGpuReg(runtime, REG_OFFSET_BLDCNT, 99);
    SetGpuReg(runtime, REG_OFFSET_WIN1V, 99);

    expect(SetRegionMapGpuRegs(runtime, 1)).toBe(true);
    expect(GetGpuReg(runtime, REG_OFFSET_BLDCNT)).toBe(1);
    expect(GetGpuReg(runtime, REG_OFFSET_WIN1V)).toBe(9);
    expect(runtime.savedGpuRegs[1]).toBeNull();
    expect(SetRegionMapGpuRegs(runtime, 1)).toBe(false);
  });

  it('SetGpuWindowDimsToMapEdges uses top-left/top-right sprite x and fixed map vertical bounds', () => {
    const runtime = createRegionMapRuntime({
      mapOpenCloseAnim: createRegionMapOpenCloseAnim(12, 228)
    });

    SetGpuWindowDimsToMapEdges(runtime);

    expect(GetGpuReg(runtime, REG_OFFSET_WIN0V)).toBe(WIN_RANGE(16, 160));
    expect(GetGpuReg(runtime, REG_OFFSET_WIN0H)).toBe(WIN_RANGE(12, 228));
  });

  it('MoveMapEdgesOutward follows every C moveState speed tier and completion guard', () => {
    const runtime = createRegionMapRuntime({
      mapOpenCloseAnim: createRegionMapOpenCloseAnim(104, 136, 0)
    });

    expect(MoveMapEdgesOutward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([96, 96, 96, 144, 144, 144]);
    runtime.mapOpenCloseAnim.moveState = 7;
    expect(MoveMapEdgesOutward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([91, 91, 91, 149, 149, 149]);
    runtime.mapOpenCloseAnim.moveState = 11;
    expect(MoveMapEdgesOutward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([88, 88, 88, 152, 152, 152]);
    runtime.mapOpenCloseAnim.moveState = 15;
    expect(MoveMapEdgesOutward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([86, 86, 86, 154, 154, 154]);
    runtime.mapOpenCloseAnim.moveState = 18;
    expect(MoveMapEdgesOutward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([85, 85, 85, 155, 155, 155]);

    runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x = 0;
    expect(MoveMapEdgesOutward(runtime)).toBe(true);
  });

  it('MoveMapEdgesInward mirrors outward movement and stops at x=104', () => {
    const runtime = createRegionMapRuntime({
      mapOpenCloseAnim: createRegionMapOpenCloseAnim(0, 240, 0)
    });

    expect(MoveMapEdgesInward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([8, 8, 8, 232, 232, 232]);
    runtime.mapOpenCloseAnim.moveState = 7;
    expect(MoveMapEdgesInward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([13, 13, 13, 227, 227, 227]);
    runtime.mapOpenCloseAnim.moveState = 11;
    expect(MoveMapEdgesInward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([16, 16, 16, 224, 224, 224]);
    runtime.mapOpenCloseAnim.moveState = 15;
    expect(MoveMapEdgesInward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([18, 18, 18, 222, 222, 222]);
    runtime.mapOpenCloseAnim.moveState = 18;
    expect(MoveMapEdgesInward(runtime)).toBe(false);
    expect(edgeXs(runtime)).toEqual([19, 19, 19, 221, 221, 221]);

    runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x = 104;
    expect(MoveMapEdgesInward(runtime)).toBe(true);
  });

  it('map edge constants preserve decompiled array order', () => {
    expect([
      MAPEDGE_TOP_LEFT,
      MAPEDGE_MID_LEFT,
      MAPEDGE_BOT_LEFT,
      MAPEDGE_TOP_RIGHT,
      MAPEDGE_MID_RIGHT,
      MAPEDGE_BOT_RIGHT
    ]).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('GetSelectedMapSection dispatches by selected region and layer with MAPSEC_NONE fallback', () => {
    expect(MAP_WIDTH).toBe(22);
    expect(MAP_HEIGHT).toBe(15);
    expect(GetSelectedMapSection(REGIONMAP_KANTO, LAYER_MAP, 3, 8)).toBe(MAPSEC_ROUTE_4_POKECENTER);
    expect(GetSelectedMapSection(REGIONMAP_KANTO, LAYER_DUNGEON, 3, 14)).toBe(MAPSEC_CERULEAN_CAVE);
    expect(GetSelectedMapSection(REGIONMAP_SEVII45, LAYER_MAP, 8, 10)).toBe(MAPSEC_NAVEL_ROCK);
    expect(GetSelectedMapSection(REGIONMAP_SEVII67, LAYER_MAP, 13, 18)).toBe(MAPSEC_BIRTH_ISLAND);
    expect(GetSelectedMapSection(99, LAYER_MAP, 0, 0)).toBe(MAPSEC_NONE);
    expect(GetSelectedMapSection(REGIONMAP_KANTO, LAYER_MAP, 99, 99)).toBe(MAPSEC_NONE);
  });

  it('mapsec-under-cursor helpers preserve bounds and decompiled event-flag filters', () => {
    const outOfBounds = createRegionMapRuntime({
      mapCursor: createRegionMapCursor(-1, 0)
    });
    expect(GetMapsecUnderCursor(outOfBounds)).toBe(MAPSEC_NONE);
    expect(GetDungeonMapsecUnderCursor(outOfBounds)).toBe(MAPSEC_NONE);

    const navel = createRegionMapRuntime({
      selectedRegion: REGIONMAP_SEVII45,
      mapCursor: createRegionMapCursor(10, 8)
    });
    expect(GetMapsecUnderCursor(navel)).toBe(MAPSEC_NONE);
    navel.flags.add(FLAG_WORLD_MAP_NAVEL_ROCK_EXTERIOR);
    expect(GetMapsecUnderCursor(navel)).toBe(MAPSEC_NAVEL_ROCK);

    const birth = createRegionMapRuntime({
      selectedRegion: REGIONMAP_SEVII67,
      mapCursor: createRegionMapCursor(18, 13)
    });
    expect(GetMapsecUnderCursor(birth)).toBe(MAPSEC_NONE);
    birth.flags.add(FLAG_WORLD_MAP_NAVEL_ROCK_EXTERIOR);
    expect(GetMapsecUnderCursor(birth)).toBe(MAPSEC_BIRTH_ISLAND);

    const cave = createRegionMapRuntime({
      selectedRegion: REGIONMAP_KANTO,
      mapCursor: createRegionMapCursor(14, 3)
    });
    expect(GetDungeonMapsecUnderCursor(cave)).toBe(MAPSEC_NONE);
    cave.flags.add(FLAG_SYS_CAN_LINK_WITH_RS);
    expect(GetDungeonMapsecUnderCursor(cave)).toBe(MAPSEC_CERULEAN_CAVE);
  });

  it('GetMapsecType follows the C town, center, none, and default route branches', () => {
    const runtime = createRegionMapRuntime();

    expect(GetMapsecType(runtime, MAPSEC_NONE)).toBe(MAPSECTYPE_NONE);
    expect(GetMapsecType(runtime, 'MAPSEC_PALLET_TOWN')).toBe(MAPSECTYPE_NOT_VISITED);
    runtime.flags.add('FLAG_WORLD_MAP_PALLET_TOWN');
    expect(GetMapsecType(runtime, 'MAPSEC_PALLET_TOWN')).toBe(MAPSECTYPE_VISITED);
    expect(GetMapsecType(runtime, MAPSEC_ROUTE_4_POKECENTER)).toBe(MAPSECTYPE_NONE);
    runtime.permissions[MAPPERM_HAS_FLY_DESTINATIONS] = true;
    expect(GetMapsecType(runtime, MAPSEC_ROUTE_4_POKECENTER)).toBe(MAPSECTYPE_NOT_VISITED);
    runtime.flags.add('FLAG_WORLD_MAP_ROUTE4_POKEMON_CENTER_1F');
    expect(GetMapsecType(runtime, MAPSEC_ROUTE_4_POKECENTER)).toBe(MAPSECTYPE_VISITED);
    expect(GetMapsecType(runtime, MAPSEC_ROUTE_10_POKECENTER)).toBe(MAPSECTYPE_NOT_VISITED);
    expect(GetMapsecType(runtime, 'MAPSEC_ROUTE_1')).toBe(MAPSECTYPE_ROUTE);
  });

  it('cursor getters and selected mapsec type dispatch use the cursor fields exactly', () => {
    const runtime = createRegionMapRuntime({
      mapCursor: {
        ...createRegionMapCursor(4, 12),
        selectedMapsecType: MAPSECTYPE_VISITED,
        selectedDungeonType: MAPSECTYPE_NOT_VISITED
      }
    });

    expect(GetMapCursorX(runtime)).toBe(4);
    expect(GetMapCursorY(runtime)).toBe(12);
    expect(GetSelectedMapsecType(runtime, LAYER_MAP)).toBe(MAPSECTYPE_VISITED);
    expect(GetSelectedMapsecType(runtime, LAYER_DUNGEON)).toBe(MAPSECTYPE_NOT_VISITED);
    expect(GetSelectedMapsecType(runtime, 99)).toBe(MAPSECTYPE_VISITED);
  });

  it('SnapToIconOrButton cycles switch/cancel/player exactly, including skipping absent player icon', () => {
    const runtime = createRegionMapRuntime({
      permissions: [true, false, false, false],
      selectedRegion: REGIONMAP_KANTO,
      playersRegion: REGIONMAP_KANTO,
      mapCursor: createRegionMapCursor(0, 0),
      playerIcon: createRegionMapPlayerIcon(4, 12)
    });

    expect(GetRegionMapPermission(runtime, MAPPERM_HAS_SWITCH_BUTTON)).toBe(true);
    SnapToIconOrButton(runtime);
    expect(runtime.mapCursor).toMatchObject({ x: SWITCH_BUTTON_X, y: SWITCH_BUTTON_Y, snapId: 1 });
    expect(runtime.mapCursor.sprite).toMatchObject({ x: 8 * SWITCH_BUTTON_X + 36, y: 8 * SWITCH_BUTTON_Y + 36 });
    SnapToIconOrButton(runtime);
    expect(runtime.mapCursor).toMatchObject({ x: CANCEL_BUTTON_X, y: CANCEL_BUTTON_Y, snapId: 2 });
    SnapToIconOrButton(runtime);
    expect(runtime.mapCursor).toMatchObject({ x: 4, y: 12, snapId: 0 });
    ResetCursorSnap(runtime);
    expect(runtime.mapCursor.snapId).toBe(0);

    runtime.playersRegion = REGIONMAP_SEVII45;
    SnapToIconOrButton(runtime);
    expect(runtime.mapCursor).toMatchObject({ x: SWITCH_BUTTON_X, y: SWITCH_BUTTON_Y, snapId: 1 });

    const noSwitch = createRegionMapRuntime({
      permissions: [false, false, false, false],
      mapCursor: createRegionMapCursor(0, 0),
      playerIcon: createRegionMapPlayerIcon(7, 8)
    });
    SnapToIconOrButton(noSwitch);
    expect(noSwitch.mapCursor).toMatchObject({ x: CANCEL_BUTTON_X, y: CANCEL_BUTTON_Y, snapId: 1 });
    SnapToIconOrButton(noSwitch);
    expect(noSwitch.mapCursor).toMatchObject({ x: 7, y: 8, snapId: 0 });
  });

  it('C-named region map entrypoints initialize callbacks, menus, cursors, icons, and fly destination state', () => {
    const runtime = createRegionMapRuntime();
    const compat = runtime as typeof runtime & {
      callback2?: string;
      mainTask?: string | null;
      switchMenu?: { alpha: number; currentSelection: number; chosenRegion: number };
      operations?: string[];
      flyMap?: { selectedDestination: boolean; destination: string | null };
      mapNameText?: string;
      mapIcons?: { flyInvisible: boolean[] };
    };

    InitRegionMap(runtime);
    expect(compat.callback2).toBe('CB2_OpenRegionMap');
    CB2_OpenRegionMap(runtime);
    expect(compat.mainTask).toBe('Task_RegionMap');

    SetSelectedRegionMap(REGIONMAP_SEVII45, runtime);
    SetRegionMapPlayerIsOn(REGIONMAP_SEVII67, runtime);
    expect(runtime.selectedRegion).toBe(REGIONMAP_SEVII45);
    expect(runtime.playersRegion).toBe(REGIONMAP_SEVII67);

    InitSwitchMapMenu(runtime, REGIONMAP_KANTO, REGIONMAP_SEVII67, 'afterSwitch');
    expect(compat.switchMenu?.currentSelection).toBe(REGIONMAP_KANTO);
    expect(FadeSwitchMapMenuIn(runtime)).toBe(false);
    expect(compat.switchMenu?.alpha).toBe(2);
    compat.switchMenu!.alpha = 2;
    expect(FadeSwitchMapMenuOut(runtime)).toBe(true);

    ResetGpuRegsForSwitchMapMenu(runtime);
    expect(runtime.gpuRegs.size).toBe(0);

    CreateMapCursor(4, 5, runtime);
    expect(GetMapCursorX(runtime)).toBe(4);
    expect(GetMapCursorY(runtime)).toBe(5);
    expect(MoveMapCursor(runtime, 2, -1)).toBe(0);
    expect([GetMapCursorX(runtime), GetMapCursorY(runtime)]).toEqual([6, 4]);
    SetMapCursorInvisibility(true, runtime);
    expect(runtime.mapCursor.sprite.invisible).toBe(true);
    FreeMapCursor(runtime);
    expect(runtime.mapCursor.sprite.invisible).toBe(true);

    CreatePlayerIcon(7, 8, runtime);
    expect(GetPlayerIconX(runtime)).toBe(7);
    expect(GetPlayerIconY(runtime)).toBe(8);
    expect(GetPlayerPositionOnRegionMap(runtime)).toEqual([7, 8]);
    SetPlayerIconInvisibility(true, runtime);
    expect(runtime.playerIcon.sprite.invisible).toBe(true);
    FreePlayerIcon(runtime);
    expect(runtime.playerIcon.sprite.invisible).toBe(true);

    runtime.mapCursor.selectedMapsec = MAPSEC_ROUTE_4_POKECENTER;
    DisplayCurrentMapName(runtime);
    expect(compat.mapNameText).toBe(MAPSEC_ROUTE_4_POKECENTER);

    InitMapOpenAnim(runtime, 'afterOpen');
    expect(runtime.mapOpenCloseAnim.mapEdges[MAPEDGE_TOP_LEFT].sprite.x).toBe(104);

    InitMapIcons(runtime, REGIONMAP_KANTO, 'afterIcons');
    SetFlyIconInvisibility(REGIONMAP_KANTO, 2, true, runtime);
    expect(compat.mapIcons?.flyInvisible[2]).toBe(true);

    InitFlyMap(runtime);
    expect(runtime.permissions[MAPPERM_HAS_FLY_DESTINATIONS]).toBe(true);
    CB2_OpenFlyMap(runtime);
    SetFlyWarpDestination(MAPSEC_ROUTE_10_POKECENTER, runtime);
    expect(compat.flyMap).toMatchObject({ selectedDestination: true, destination: MAPSEC_ROUTE_10_POKECENTER });
    FreeFlyMap(3, runtime);
    expect(compat.flyMap).toBeUndefined();
  });
});
