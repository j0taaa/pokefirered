import { describe, expect, test } from 'vitest';
import {
  UNUSED_BATTLE_TERRAIN_ASSETS,
  gUnusedBattleTerrain_Building_Anim_Map_Tilemap,
  gUnusedBattleTerrain_Plain_Palette,
  gUnusedBattleTerrain_Stadium_Palette7
} from '../src/game/decompBattleTerrainUnused';

describe('decomp unused battle terrain graphics', () => {
  test('preserves every unused battle terrain INCBIN_U32 in source order', () => {
    expect(UNUSED_BATTLE_TERRAIN_ASSETS).toEqual([
      { symbol: 'gUnusedBattleTerrain_Plain_Palette', type: 'u32', path: 'graphics/battle_terrain/unused/plain.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Tiles_Sheet', type: 'u32', path: 'graphics/battle_terrain/unused/building/tiles.4bpp.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Battle_Frontier_Palette', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/battle_frontier.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Map_Tilemap', type: 'u32', path: 'graphics/battle_terrain/unused/building/map.bin.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Tiles_Sheet', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/tiles.4bpp.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Map_Tilemap', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/map.bin.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Palette', type: 'u32', path: 'graphics/battle_terrain/unused/building/palette.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Kyogre_Palette', type: 'u32', path: 'graphics/battle_terrain/unused/kyogre.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Groudon_Palette', type: 'u32', path: 'graphics/battle_terrain/unused/groudon.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Palette2', type: 'u32', path: 'graphics/battle_terrain/unused/building/palette2.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Palette3', type: 'u32', path: 'graphics/battle_terrain/unused/building/palette3.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette1', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette1.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette2', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette2.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette3', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette3.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette4', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette4.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette5', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette5.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette6', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette6.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Stadium_Palette7', type: 'u32', path: 'graphics/battle_terrain/unused/stadium/palette7.gbapal.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Anim_Tiles_Sheet', type: 'u32', path: 'graphics/battle_terrain/unused/building/anim_tiles.4bpp.lz' },
      { symbol: 'gUnusedBattleTerrain_Building_Anim_Map_Tilemap', type: 'u32', path: 'graphics/battle_terrain/unused/building/anim_map.bin.lz' }
    ]);
  });

  test('exports named declarations for direct symbol parity', () => {
    expect(gUnusedBattleTerrain_Plain_Palette.path).toBe('graphics/battle_terrain/unused/plain.gbapal.lz');
    expect(gUnusedBattleTerrain_Stadium_Palette7.symbol).toBe('gUnusedBattleTerrain_Stadium_Palette7');
    expect(gUnusedBattleTerrain_Building_Anim_Map_Tilemap.type).toBe('u32');
  });
});
