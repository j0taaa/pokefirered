export interface IncbinAssetRef {
  symbol: string;
  type: 'u32';
  path: string;
}

const ballAsset = (symbol: string, path: string): IncbinAssetRef => ({
  symbol,
  type: 'u32',
  path
});

export const gBallGfx_Poke = ballAsset('gBallGfx_Poke', 'graphics/interface/ball/poke.4bpp.lz');
export const gBallPal_Poke = ballAsset('gBallPal_Poke', 'graphics/interface/ball/poke.gbapal.lz');
export const gBallGfx_Great = ballAsset('gBallGfx_Great', 'graphics/interface/ball/great.4bpp.lz');
export const gBallPal_Great = ballAsset('gBallPal_Great', 'graphics/interface/ball/great.gbapal.lz');
export const gBallGfx_Safari = ballAsset('gBallGfx_Safari', 'graphics/interface/ball/safari.4bpp.lz');
export const gBallPal_Safari = ballAsset('gBallPal_Safari', 'graphics/interface/ball/safari.gbapal.lz');
export const gBallGfx_Ultra = ballAsset('gBallGfx_Ultra', 'graphics/interface/ball/ultra.4bpp.lz');
export const gBallPal_Ultra = ballAsset('gBallPal_Ultra', 'graphics/interface/ball/ultra.gbapal.lz');
export const gBallGfx_Master = ballAsset('gBallGfx_Master', 'graphics/interface/ball/master.4bpp.lz');
export const gBallPal_Master = ballAsset('gBallPal_Master', 'graphics/interface/ball/master.gbapal.lz');
export const gBallGfx_Net = ballAsset('gBallGfx_Net', 'graphics/interface/ball/net.4bpp.lz');
export const gBallPal_Net = ballAsset('gBallPal_Net', 'graphics/interface/ball/net.gbapal.lz');
export const gBallGfx_Dive = ballAsset('gBallGfx_Dive', 'graphics/interface/ball/dive.4bpp.lz');
export const gBallPal_Dive = ballAsset('gBallPal_Dive', 'graphics/interface/ball/dive.gbapal.lz');
export const gBallGfx_Nest = ballAsset('gBallGfx_Nest', 'graphics/interface/ball/nest.4bpp.lz');
export const gBallPal_Nest = ballAsset('gBallPal_Nest', 'graphics/interface/ball/nest.gbapal.lz');
export const gBallGfx_Repeat = ballAsset('gBallGfx_Repeat', 'graphics/interface/ball/repeat.4bpp.lz');
export const gBallPal_Repeat = ballAsset('gBallPal_Repeat', 'graphics/interface/ball/repeat.gbapal.lz');
export const gBallGfx_Timer = ballAsset('gBallGfx_Timer', 'graphics/interface/ball/timer.4bpp.lz');
export const gBallPal_Timer = ballAsset('gBallPal_Timer', 'graphics/interface/ball/timer.gbapal.lz');
export const gBallGfx_Luxury = ballAsset('gBallGfx_Luxury', 'graphics/interface/ball/luxury.4bpp.lz');
export const gBallPal_Luxury = ballAsset('gBallPal_Luxury', 'graphics/interface/ball/luxury.gbapal.lz');
export const gBallGfx_Premier = ballAsset('gBallGfx_Premier', 'graphics/interface/ball/premier.4bpp.lz');
export const gBallPal_Premier = ballAsset('gBallPal_Premier', 'graphics/interface/ball/premier.gbapal.lz');
export const gOpenPokeballGfx = ballAsset('gOpenPokeballGfx', 'graphics/interface/ball_open.4bpp.lz');

export const INTERFACE_POKEBALL_ASSETS: readonly IncbinAssetRef[] = [
  gBallGfx_Poke,
  gBallPal_Poke,
  gBallGfx_Great,
  gBallPal_Great,
  gBallGfx_Safari,
  gBallPal_Safari,
  gBallGfx_Ultra,
  gBallPal_Ultra,
  gBallGfx_Master,
  gBallPal_Master,
  gBallGfx_Net,
  gBallPal_Net,
  gBallGfx_Dive,
  gBallPal_Dive,
  gBallGfx_Nest,
  gBallPal_Nest,
  gBallGfx_Repeat,
  gBallPal_Repeat,
  gBallGfx_Timer,
  gBallPal_Timer,
  gBallGfx_Luxury,
  gBallPal_Luxury,
  gBallGfx_Premier,
  gBallPal_Premier,
  gOpenPokeballGfx
];
