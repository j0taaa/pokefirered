import { describe, expect, test } from 'vitest';
import {
  MAIL_GRAPHICS_ASSETS,
  MAIL_GRAPHICS_VARIANTS,
  gFile_graphics_mail_map_tilemaps,
  gFile_graphics_mail_palette_pals,
  gFile_graphics_mail_tiles_sheets
} from '../src/game/decompMailGraphics';

describe('decomp mail graphics', () => {
  test('preserves the twelve mail variants in source order', () => {
    expect(MAIL_GRAPHICS_VARIANTS).toEqual([
      'orange',
      'harbor',
      'glitter',
      'mech',
      'wood',
      'wave',
      'bead',
      'shadow',
      'tropic',
      'dream',
      'fab',
      'retro'
    ]);
  });

  test('preserves palette, tiles, and map INCBIN declarations with exact types and paths', () => {
    expect(gFile_graphics_mail_palette_pals[0]).toEqual({
      symbol: 'gFile_graphics_mail_orange_palette_pal',
      type: 'u16',
      path: 'graphics/mail/orange/palette.gbapal'
    });
    expect(gFile_graphics_mail_palette_pals.at(-1)).toEqual({
      symbol: 'gFile_graphics_mail_retro_palette_pal',
      type: 'u16',
      path: 'graphics/mail/retro/palette.gbapal'
    });
    expect(gFile_graphics_mail_tiles_sheets[3]).toEqual({
      symbol: 'gFile_graphics_mail_mech_tiles_sheet',
      type: 'u32',
      path: 'graphics/mail/mech/tiles.4bpp.lz'
    });
    expect(gFile_graphics_mail_map_tilemaps[8]).toEqual({
      symbol: 'gFile_graphics_mail_tropic_map_tilemap',
      type: 'u32',
      path: 'graphics/mail/tropic/map.bin.lz'
    });
    expect(MAIL_GRAPHICS_ASSETS).toHaveLength(36);
  });
});
