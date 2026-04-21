export interface HelpMessageWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export const HELP_MESSAGE_WINDOW_TEMPLATE: HelpMessageWindowTemplate = {
  bg: 0,
  tilemapLeft: 0,
  tilemapTop: 15,
  width: 30,
  height: 5,
  paletteNum: 15,
  baseBlock: 0x08f
};

export const HELP_MESSAGE_TILE_IDS = {
  top: 0,
  middle: 5,
  bottom: 14
} as const;

export const HELP_MESSAGE_TEXT_COLORS = [
  'TEXT_COLOR_TRANSPARENT',
  'TEXT_DYNAMIC_COLOR_1',
  'TEXT_COLOR_DARK_GRAY'
] as const;

export const getHelpMessageWindowTileId = (row: number, height: number): number => {
  if (row <= 0) {
    return HELP_MESSAGE_TILE_IDS.top;
  }

  if (row >= height - 1) {
    return HELP_MESSAGE_TILE_IDS.bottom;
  }

  return HELP_MESSAGE_TILE_IDS.middle;
};

export const getHelpMessageWindowRect = (tileSize = 8) => ({
  x: HELP_MESSAGE_WINDOW_TEMPLATE.tilemapLeft * tileSize,
  y: HELP_MESSAGE_WINDOW_TEMPLATE.tilemapTop * tileSize,
  width: HELP_MESSAGE_WINDOW_TEMPLATE.width * tileSize,
  height: HELP_MESSAGE_WINDOW_TEMPLATE.height * tileSize,
  widthTiles: HELP_MESSAGE_WINDOW_TEMPLATE.width,
  heightTiles: HELP_MESSAGE_WINDOW_TEMPLATE.height
});

export const getHelpMessageTextOrigin = (tileSize = 1) => ({
  x: 2 * tileSize,
  y: 5 * tileSize
});
