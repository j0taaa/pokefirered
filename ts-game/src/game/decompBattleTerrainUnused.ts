export interface UnusedBattleTerrainAssetRef {
  symbol: string;
  type: 'u32';
  path: string;
}

const unusedTerrainAsset = (symbol: string, path: string): UnusedBattleTerrainAssetRef => ({
  symbol,
  type: 'u32',
  path
});

export const gUnusedBattleTerrain_Plain_Palette = unusedTerrainAsset(
  'gUnusedBattleTerrain_Plain_Palette',
  'graphics/battle_terrain/unused/plain.gbapal.lz'
);
export const gUnusedBattleTerrain_Building_Tiles_Sheet = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Tiles_Sheet',
  'graphics/battle_terrain/unused/building/tiles.4bpp.lz'
);
export const gUnusedBattleTerrain_Stadium_Battle_Frontier_Palette = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Battle_Frontier_Palette',
  'graphics/battle_terrain/unused/stadium/battle_frontier.gbapal.lz'
);
export const gUnusedBattleTerrain_Building_Map_Tilemap = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Map_Tilemap',
  'graphics/battle_terrain/unused/building/map.bin.lz'
);
export const gUnusedBattleTerrain_Stadium_Tiles_Sheet = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Tiles_Sheet',
  'graphics/battle_terrain/unused/stadium/tiles.4bpp.lz'
);
export const gUnusedBattleTerrain_Stadium_Map_Tilemap = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Map_Tilemap',
  'graphics/battle_terrain/unused/stadium/map.bin.lz'
);
export const gUnusedBattleTerrain_Building_Palette = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Palette',
  'graphics/battle_terrain/unused/building/palette.gbapal.lz'
);
export const gUnusedBattleTerrain_Kyogre_Palette = unusedTerrainAsset(
  'gUnusedBattleTerrain_Kyogre_Palette',
  'graphics/battle_terrain/unused/kyogre.gbapal.lz'
);
export const gUnusedBattleTerrain_Groudon_Palette = unusedTerrainAsset(
  'gUnusedBattleTerrain_Groudon_Palette',
  'graphics/battle_terrain/unused/groudon.gbapal.lz'
);
export const gUnusedBattleTerrain_Building_Palette2 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Palette2',
  'graphics/battle_terrain/unused/building/palette2.gbapal.lz'
);
export const gUnusedBattleTerrain_Building_Palette3 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Palette3',
  'graphics/battle_terrain/unused/building/palette3.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette1 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette1',
  'graphics/battle_terrain/unused/stadium/palette1.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette2 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette2',
  'graphics/battle_terrain/unused/stadium/palette2.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette3 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette3',
  'graphics/battle_terrain/unused/stadium/palette3.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette4 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette4',
  'graphics/battle_terrain/unused/stadium/palette4.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette5 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette5',
  'graphics/battle_terrain/unused/stadium/palette5.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette6 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette6',
  'graphics/battle_terrain/unused/stadium/palette6.gbapal.lz'
);
export const gUnusedBattleTerrain_Stadium_Palette7 = unusedTerrainAsset(
  'gUnusedBattleTerrain_Stadium_Palette7',
  'graphics/battle_terrain/unused/stadium/palette7.gbapal.lz'
);
export const gUnusedBattleTerrain_Building_Anim_Tiles_Sheet = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Anim_Tiles_Sheet',
  'graphics/battle_terrain/unused/building/anim_tiles.4bpp.lz'
);
export const gUnusedBattleTerrain_Building_Anim_Map_Tilemap = unusedTerrainAsset(
  'gUnusedBattleTerrain_Building_Anim_Map_Tilemap',
  'graphics/battle_terrain/unused/building/anim_map.bin.lz'
);

export const UNUSED_BATTLE_TERRAIN_ASSETS: readonly UnusedBattleTerrainAssetRef[] = [
  gUnusedBattleTerrain_Plain_Palette,
  gUnusedBattleTerrain_Building_Tiles_Sheet,
  gUnusedBattleTerrain_Stadium_Battle_Frontier_Palette,
  gUnusedBattleTerrain_Building_Map_Tilemap,
  gUnusedBattleTerrain_Stadium_Tiles_Sheet,
  gUnusedBattleTerrain_Stadium_Map_Tilemap,
  gUnusedBattleTerrain_Building_Palette,
  gUnusedBattleTerrain_Kyogre_Palette,
  gUnusedBattleTerrain_Groudon_Palette,
  gUnusedBattleTerrain_Building_Palette2,
  gUnusedBattleTerrain_Building_Palette3,
  gUnusedBattleTerrain_Stadium_Palette1,
  gUnusedBattleTerrain_Stadium_Palette2,
  gUnusedBattleTerrain_Stadium_Palette3,
  gUnusedBattleTerrain_Stadium_Palette4,
  gUnusedBattleTerrain_Stadium_Palette5,
  gUnusedBattleTerrain_Stadium_Palette6,
  gUnusedBattleTerrain_Stadium_Palette7,
  gUnusedBattleTerrain_Building_Anim_Tiles_Sheet,
  gUnusedBattleTerrain_Building_Anim_Map_Tilemap
];
