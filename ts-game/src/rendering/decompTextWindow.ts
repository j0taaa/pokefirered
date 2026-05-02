export interface TextWindowTemplateLike {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
}

export interface TextWindowOp {
  kind: 'tiles' | 'palette' | 'rect';
  bg?: number;
  gfx?: string;
  size?: number;
  destOffset?: number;
  palette?: string;
  palOffset?: number;
  tileNum?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  palNum?: number;
}

export const PLTT_SIZE_4BPP = 32;

export const getTextWindowPaletteOffset = (id: number): number => {
  switch (id) {
    case 0:
      return 0;
    case 1:
      return 0x10;
    case 2:
      return 0x20;
    case 3:
      return 0x30;
    case 4:
    default:
      return 0x40;
  }
};

export const loadWindowGfxOnBg = (
  bg: number,
  gfx: string,
  size: number,
  destOffset: number,
  paletteId: number,
  palOffset: number
): TextWindowOp[] => [
  { kind: 'tiles', bg, gfx, size, destOffset },
  { kind: 'palette', palette: `textWindowPalette:${getTextWindowPaletteOffset(paletteId)}`, palOffset, size: PLTT_SIZE_4BPP }
];

export const loadStdWindowGfxOnBg = (bg: number, destOffset: number, palOffset: number): TextWindowOp[] =>
  loadWindowGfxOnBg(bg, 'gStdTextWindow_Gfx', 0x120, destOffset, 3, palOffset);

export const loadHelpMessageWindowGfx = (window: TextWindowTemplateLike, destOffset: number, palOffset: number): TextWindowOp[] =>
  loadWindowGfxOnBg(window.bg, 'gHelpMessageWindow_Gfx', 0x280, destOffset, 2, palOffset);

export const loadMenuMessageWindowGfx = (window: TextWindowTemplateLike, destOffset: number, palOffset: number): TextWindowOp[] =>
  loadWindowGfxOnBg(window.bg, 'gMenuMessageWindow_Gfx', 0x280, destOffset, 0, palOffset);

export const loadSignpostWindowGfx = (window: TextWindowTemplateLike, destOffset: number, palOffset: number): TextWindowOp[] =>
  loadWindowGfxOnBg(window.bg, 'gSignpostWindow_Gfx', 0x260, destOffset, 1, palOffset);

export const loadStdWindowGfx = (window: TextWindowTemplateLike, destOffset: number, palOffset: number): TextWindowOp[] =>
  loadStdWindowGfxOnBg(window.bg, destOffset, palOffset);

export const loadStdWindowTiles = (window: TextWindowTemplateLike, destOffset: number): TextWindowOp[] => [
  { kind: 'tiles', bg: window.bg, gfx: 'gStdTextWindow_Gfx', size: 0x120, destOffset }
];

export const loadQuestLogWindowTiles = (window: TextWindowTemplateLike, destOffset: number): TextWindowOp[] => [
  { kind: 'tiles', bg: window.bg, gfx: 'gQuestLogWindow_Gfx', size: 0x280, destOffset }
];

export const loadUserWindowGfxByFrame = (
  window: TextWindowTemplateLike,
  frameType: number,
  destOffset: number,
  palOffset: number
): TextWindowOp[] => [
  { kind: 'tiles', bg: window.bg, gfx: `gUserFrames[${frameType}].tiles`, size: 0x120, destOffset },
  { kind: 'palette', palette: `gUserFrames[${frameType}].palette`, palOffset, size: PLTT_SIZE_4BPP }
];

export const drawTextBorderOuter = (
  window: TextWindowTemplateLike,
  tileNum: number,
  palNum: number
): TextWindowOp[] => {
  const { bg, tilemapLeft, tilemapTop, width, height } = window;
  return [
    { kind: 'rect', bg, tileNum: tileNum + 0, x: tilemapLeft - 1, y: tilemapTop - 1, width: 1, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 1, x: tilemapLeft, y: tilemapTop - 1, width, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 2, x: tilemapLeft + width, y: tilemapTop - 1, width: 1, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 3, x: tilemapLeft - 1, y: tilemapTop, width: 1, height, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 5, x: tilemapLeft + width, y: tilemapTop, width: 1, height, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 6, x: tilemapLeft - 1, y: tilemapTop + height, width: 1, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 7, x: tilemapLeft, y: tilemapTop + height, width, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 8, x: tilemapLeft + width, y: tilemapTop + height, width: 1, height: 1, palNum }
  ];
};

export const drawTextBorderInner = (
  window: TextWindowTemplateLike,
  tileNum: number,
  palNum: number
): TextWindowOp[] => {
  const { bg, tilemapLeft, tilemapTop, width, height } = window;
  return [
    { kind: 'rect', bg, tileNum: tileNum + 0, x: tilemapLeft, y: tilemapTop, width: 1, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 1, x: tilemapLeft + 1, y: tilemapTop, width: width - 2, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 2, x: tilemapLeft + width - 1, y: tilemapTop, width: 1, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 3, x: tilemapLeft, y: tilemapTop + 1, width: 1, height: height - 2, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 5, x: tilemapLeft + width - 1, y: tilemapTop + 1, width: 1, height: height - 2, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 6, x: tilemapLeft, y: tilemapTop + height - 1, width: 1, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 7, x: tilemapLeft + 1, y: tilemapTop + height - 1, width: width - 2, height: 1, palNum },
    { kind: 'rect', bg, tileNum: tileNum + 8, x: tilemapLeft + width - 1, y: tilemapTop + height - 1, width: 1, height: 1, palNum }
  ];
};

export const rboxFillRectangle = (window: TextWindowTemplateLike): TextWindowOp => ({
  kind: 'rect',
  bg: window.bg,
  tileNum: 0,
  x: window.tilemapLeft - 1,
  y: window.tilemapTop - 1,
  width: window.width + 2,
  height: window.height + 2,
  palNum: 17
});
