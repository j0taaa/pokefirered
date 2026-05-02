import { describe, expect, test } from 'vitest';
import {
  INTERFACE_POKEBALL_ASSETS,
  gBallGfx_Master,
  gBallPal_Premier,
  gOpenPokeballGfx
} from '../src/game/decompInterfacePokeballs';

describe('decomp interface pokeball graphics', () => {
  test('preserves every INCBIN_U32 symbol and path in source order', () => {
    expect(INTERFACE_POKEBALL_ASSETS).toEqual([
      { symbol: 'gBallGfx_Poke', type: 'u32', path: 'graphics/interface/ball/poke.4bpp.lz' },
      { symbol: 'gBallPal_Poke', type: 'u32', path: 'graphics/interface/ball/poke.gbapal.lz' },
      { symbol: 'gBallGfx_Great', type: 'u32', path: 'graphics/interface/ball/great.4bpp.lz' },
      { symbol: 'gBallPal_Great', type: 'u32', path: 'graphics/interface/ball/great.gbapal.lz' },
      { symbol: 'gBallGfx_Safari', type: 'u32', path: 'graphics/interface/ball/safari.4bpp.lz' },
      { symbol: 'gBallPal_Safari', type: 'u32', path: 'graphics/interface/ball/safari.gbapal.lz' },
      { symbol: 'gBallGfx_Ultra', type: 'u32', path: 'graphics/interface/ball/ultra.4bpp.lz' },
      { symbol: 'gBallPal_Ultra', type: 'u32', path: 'graphics/interface/ball/ultra.gbapal.lz' },
      { symbol: 'gBallGfx_Master', type: 'u32', path: 'graphics/interface/ball/master.4bpp.lz' },
      { symbol: 'gBallPal_Master', type: 'u32', path: 'graphics/interface/ball/master.gbapal.lz' },
      { symbol: 'gBallGfx_Net', type: 'u32', path: 'graphics/interface/ball/net.4bpp.lz' },
      { symbol: 'gBallPal_Net', type: 'u32', path: 'graphics/interface/ball/net.gbapal.lz' },
      { symbol: 'gBallGfx_Dive', type: 'u32', path: 'graphics/interface/ball/dive.4bpp.lz' },
      { symbol: 'gBallPal_Dive', type: 'u32', path: 'graphics/interface/ball/dive.gbapal.lz' },
      { symbol: 'gBallGfx_Nest', type: 'u32', path: 'graphics/interface/ball/nest.4bpp.lz' },
      { symbol: 'gBallPal_Nest', type: 'u32', path: 'graphics/interface/ball/nest.gbapal.lz' },
      { symbol: 'gBallGfx_Repeat', type: 'u32', path: 'graphics/interface/ball/repeat.4bpp.lz' },
      { symbol: 'gBallPal_Repeat', type: 'u32', path: 'graphics/interface/ball/repeat.gbapal.lz' },
      { symbol: 'gBallGfx_Timer', type: 'u32', path: 'graphics/interface/ball/timer.4bpp.lz' },
      { symbol: 'gBallPal_Timer', type: 'u32', path: 'graphics/interface/ball/timer.gbapal.lz' },
      { symbol: 'gBallGfx_Luxury', type: 'u32', path: 'graphics/interface/ball/luxury.4bpp.lz' },
      { symbol: 'gBallPal_Luxury', type: 'u32', path: 'graphics/interface/ball/luxury.gbapal.lz' },
      { symbol: 'gBallGfx_Premier', type: 'u32', path: 'graphics/interface/ball/premier.4bpp.lz' },
      { symbol: 'gBallPal_Premier', type: 'u32', path: 'graphics/interface/ball/premier.gbapal.lz' },
      { symbol: 'gOpenPokeballGfx', type: 'u32', path: 'graphics/interface/ball_open.4bpp.lz' }
    ]);
  });

  test('exports the same named graphics symbols for direct consumers', () => {
    expect(gBallGfx_Master.path).toBe('graphics/interface/ball/master.4bpp.lz');
    expect(gBallPal_Premier.path).toBe('graphics/interface/ball/premier.gbapal.lz');
    expect(gOpenPokeballGfx.symbol).toBe('gOpenPokeballGfx');
  });
});
