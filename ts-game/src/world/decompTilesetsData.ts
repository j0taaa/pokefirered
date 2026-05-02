export const TILESETS_C_INCLUDES = [
  'global.h',
  'tilesets.h',
  'tileset_anims.h',
  'data/tilesets/graphics.h',
  'data/tilesets/metatiles.h',
  'data/tilesets/headers.h'
] as const;

export const getTilesetsCompilationIncludes = (): readonly string[] =>
  TILESETS_C_INCLUDES;
