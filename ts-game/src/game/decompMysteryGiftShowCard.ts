export const WIN_HEADER = 0;
export const WIN_BODY = 1;
export const WIN_FOOTER = 2;
export const WIN_COUNT = 3;
export const TAG_STAMP_SHADOW = 0x8000;
export const NUM_WONDER_BGS = 8;
export const WONDER_CARD_TEXT_LENGTH = 40;
export const WONDER_CARD_BODY_TEXT_LINES = 4;
export const MAX_STAMP_CARD_STAMPS = 7;
export const MAX_WONDER_CARD_STAT = 999;
export const CARD_TYPE_GIFT = 0;
export const CARD_TYPE_STAMP = 1;
export const CARD_TYPE_LINK_STAT = 2;
export const CARD_TYPE_COUNT = 3;
export const CHAR_DYNAMIC = 0xf7;
export const EOS = 0;
export const SPRITE_NONE = 0xff;
export const SPECIES_NONE = 0;
export const PALETTES_ALL = 0xffffffff;
export const RGB_BLACK = 0;
export const BG_PLTT_ID_1 = 16;
export const PLTT_SIZE_4BPP = 32;
export const COPYWIN_FULL = 3;
export const FONT_NORMAL = 'FONT_NORMAL';
export const FONT_NORMAL_COPY_2 = 'FONT_NORMAL_COPY_2';
export const FONTATTR_LETTER_SPACING = 'FONTATTR_LETTER_SPACING';

export interface WindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

export interface WonderGraphics {
  titleTextPal: number;
  bodyTextPal: number;
  footerTextPal: number;
  stampShadowPal: number;
  tiles: string;
  map: string;
  pal: string;
}

export interface CardStatTextData {
  width: number;
  statText: number[];
  statNumberText: number[];
}

export interface WonderCard {
  flagId: number;
  iconSpecies: number;
  idNumber: number;
  type: number;
  bgType: number;
  sendType: number;
  maxStamps: number;
  titleText: number[];
  subtitleText: number[];
  bodyText: number[][];
  footerLine1Text: number[];
  footerLine2Text: number[];
}

export interface WonderCardMetadata {
  battlesWon: number;
  battlesLost: number;
  numTrades: number;
  iconSpecies: number;
  stampData: number[][];
}

export interface CardSprite {
  id: number;
  kind: 'monIcon' | 'stampShadow';
  species: number;
  x: number;
  y: number;
  subpriority: number;
  priority: number;
  destroyed: boolean;
}

export interface WonderCardData {
  card: WonderCard;
  cardMetadata: WonderCardMetadata;
  gfx: WonderGraphics;
  enterExitState: number;
  recordIdx: number;
  windowIds: number[];
  monIconSpriteId: number;
  stampSpriteIds: number[][];
  titleText: number[];
  subtitleText: number[];
  idNumberText: number[];
  bodyText: number[][];
  footerLine1Text: number[];
  footerLine2Text: number[];
  statTextData: CardStatTextData[];
  bgTilemapBuffer: number[];
}

export interface WonderCardRuntime {
  data: WonderCardData | null;
  allocFails: boolean;
  paletteFadeBusyQueue: boolean[];
  tempTileDataBusyQueue: boolean[];
  paletteFade: { bufferTransferDisabled: boolean };
  windows: Map<number, WindowTemplate>;
  nextWindowId: number;
  sprites: CardSprite[];
  nextSpriteId: number;
  shownBgs: Set<number>;
  hiddenBgs: Set<number>;
  operations: Array<{ op: string; args: unknown[] }>;
  textPrinters: Array<{ windowId: number; font: string; x: number; y: number; colors: readonly number[]; speed: number; text: string }>;
  copiedWindows: Array<{ windowId: number; mode: number }>;
  removedWindows: number[];
  loadedMonIconPalettes: boolean;
  freedMonIconPalettes: boolean;
  loadedSpriteSheets: unknown[];
  loadedSpritePalettes: unknown[];
  freedSpriteTiles: number[];
  freedSpritePalettes: number[];
  giftIsFromEReader: boolean;
}

export const sTextColorTable = [
  [0, 2, 3],
  [0, 1, 2]
] as const;

export const sFooterTextOffsets = [7, 4, 7] as const;

export const sWindowTemplates = [
  { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 25, height: 4, paletteNum: 15, baseBlock: 0x29c },
  { bg: 1, tilemapLeft: 1, tilemapTop: 6, width: 28, height: 8, paletteNum: 15, baseBlock: 0x1bc },
  { bg: 1, tilemapLeft: 1, tilemapTop: 14, width: 28, height: 5, paletteNum: 15, baseBlock: 0x130 }
] as const satisfies readonly WindowTemplate[];

export const sSpriteSheetStampShadow = { data: 'sStampShadowGfx', size: 0x100, tag: TAG_STAMP_SHADOW } as const;
export const sSpritePalettesStampShadow = Array.from({ length: 8 }, (_, index) => ({ palette: `sStampShadowPal${index}`, tag: TAG_STAMP_SHADOW }));
export const sSpriteTemplateStampShadow = {
  tileTag: TAG_STAMP_SHADOW,
  paletteTag: TAG_STAMP_SHADOW,
  oam: 'gOamData_AffineOff_ObjNormal_32x16',
  anims: 'gDummySpriteAnimTable',
  images: null,
  affineAnims: 'gDummySpriteAffineAnimTable',
  callback: 'SpriteCallbackDummy'
} as const;

export const sCardGraphics = [
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 0, tiles: 'sCard0Gfx', map: 'sCard0Map', pal: 'sCard0Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 1, tiles: 'sCard1Gfx', map: 'sCard1Map', pal: 'gCard1Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 2, tiles: 'sCard2Gfx', map: 'sCard2Map', pal: 'gCard2Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 3, tiles: 'sCard2Gfx', map: 'sCard2Map', pal: 'gCard3Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 4, tiles: 'sCard2Gfx', map: 'sCard2Map', pal: 'gCard4Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 5, tiles: 'sCard2Gfx', map: 'sCard2Map', pal: 'gCard5Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 6, tiles: 'sCard6Gfx', map: 'sCard6Map', pal: 'sCard6Pal' },
  { titleTextPal: 1, bodyTextPal: 0, footerTextPal: 0, stampShadowPal: 7, tiles: 'sCard7Gfx', map: 'sCard7Map', pal: 'sCard7Pal' }
] as const satisfies readonly WonderGraphics[];

export const createWonderCardRuntime = (): WonderCardRuntime => ({
  data: null,
  allocFails: false,
  paletteFadeBusyQueue: [],
  tempTileDataBusyQueue: [],
  paletteFade: { bufferTransferDisabled: false },
  windows: new Map(),
  nextWindowId: 0,
  sprites: [],
  nextSpriteId: 0,
  shownBgs: new Set(),
  hiddenBgs: new Set(),
  operations: [],
  textPrinters: [],
  copiedWindows: [],
  removedWindows: [],
  loadedMonIconPalettes: false,
  freedMonIconPalettes: false,
  loadedSpriteSheets: [],
  loadedSpritePalettes: [],
  freedSpriteTiles: [],
  freedSpritePalettes: [],
  giftIsFromEReader: false
});

const zeroText = (length: number): number[] => Array.from({ length }, () => EOS);
const fixedText = (value: string | number[], length = WONDER_CARD_TEXT_LENGTH): number[] => {
  const bytes = typeof value === 'string' ? Array.from(value, (char) => char.charCodeAt(0)) : [...value];
  return Array.from({ length }, (_, index) => bytes[index] ?? EOS);
};

export const textBytesToString = (bytes: readonly number[]): string => {
  const eos = bytes.indexOf(EOS);
  return String.fromCharCode(...bytes.slice(0, eos < 0 ? bytes.length : eos));
};

const cloneCard = (card: WonderCard): WonderCard => ({
  ...card,
  titleText: fixedText(card.titleText),
  subtitleText: fixedText(card.subtitleText),
  bodyText: Array.from({ length: WONDER_CARD_BODY_TEXT_LINES }, (_, i) => fixedText(card.bodyText[i] ?? [])),
  footerLine1Text: fixedText(card.footerLine1Text),
  footerLine2Text: fixedText(card.footerLine2Text)
});

const cloneMetadata = (metadata: WonderCardMetadata): WonderCardMetadata => ({
  battlesWon: metadata.battlesWon,
  battlesLost: metadata.battlesLost,
  numTrades: metadata.numTrades,
  iconSpecies: metadata.iconSpecies,
  stampData: [Array.from({ length: MAX_STAMP_CARD_STAMPS }, (_, i) => metadata.stampData[0]?.[i] ?? 0)]
});

const emptyStatText = (): CardStatTextData => ({
  width: 0,
  statText: zeroText(WONDER_CARD_TEXT_LENGTH + 1),
  statNumberText: zeroText(4)
});

const requireData = (runtime: WonderCardRuntime): WonderCardData => {
  if (runtime.data === null) {
    throw new Error('sWonderCardData is NULL');
  }
  return runtime.data;
};

const record = (runtime: WonderCardRuntime, op: string, ...args: unknown[]): void => {
  runtime.operations.push({ op, args });
};

const beginNormalPaletteFade = (runtime: WonderCardRuntime, palettes: number, delay: number, startY: number, targetY: number, color: number): void => {
  record(runtime, 'BeginNormalPaletteFade', palettes, delay, startY, targetY, color);
};

const updatePaletteFade = (runtime: WonderCardRuntime): boolean => {
  record(runtime, 'UpdatePaletteFade');
  return runtime.paletteFadeBusyQueue.shift() ?? false;
};

const freeTempTileDataBuffersIfPossible = (runtime: WonderCardRuntime): boolean => {
  record(runtime, 'FreeTempTileDataBuffersIfPossible');
  return runtime.tempTileDataBusyQueue.shift() ?? false;
};

const addWindow = (runtime: WonderCardRuntime, template: WindowTemplate): number => {
  const windowId = runtime.nextWindowId;
  runtime.nextWindowId += 1;
  runtime.windows.set(windowId, { ...template });
  record(runtime, 'AddWindow', template, windowId);
  return windowId;
};

const removeWindow = (runtime: WonderCardRuntime, windowId: number): void => {
  runtime.windows.delete(windowId);
  runtime.removedWindows.push(windowId);
  record(runtime, 'RemoveWindow', windowId);
};

const fillBgTilemapBufferRectPalette0 = (runtime: WonderCardRuntime, bg: number, tile: number, x: number, y: number, width: number, height: number): void => {
  record(runtime, 'FillBgTilemapBufferRect_Palette0', bg, tile, x, y, width, height);
};

const copyBgTilemapBufferToVram = (runtime: WonderCardRuntime, bg: number): void => {
  record(runtime, 'CopyBgTilemapBufferToVram', bg);
};

const decompressAndCopyTileDataToVram = (runtime: WonderCardRuntime, bg: number, tiles: string, size: number, offset: number, mode: number): void => {
  record(runtime, 'DecompressAndCopyTileDataToVram', bg, tiles, size, offset, mode);
};

const loadPalette = (runtime: WonderCardRuntime, palette: string, offset: number, size: number): void => {
  record(runtime, 'LoadPalette', palette, offset, size);
};

const lz77UnCompWram = (runtime: WonderCardRuntime, map: string, buffer: number[]): void => {
  buffer.fill(0);
  record(runtime, 'LZ77UnCompWram', map);
};

const copyRectToBgTilemapBufferRect = (runtime: WonderCardRuntime, bg: number, src: number[], srcX: number, srcY: number, srcWidth: number, srcHeight: number, destX: number, destY: number, destWidth: number, destHeight: number, pal: number, baseTile: number, mode: number): void => {
  record(runtime, 'CopyRectToBgTilemapBufferRect', bg, src.length, srcX, srcY, srcWidth, srcHeight, destX, destY, destWidth, destHeight, pal, baseTile, mode);
};

const showBg = (runtime: WonderCardRuntime, bg: number): void => {
  runtime.shownBgs.add(bg);
  runtime.hiddenBgs.delete(bg);
  record(runtime, 'ShowBg', bg);
};

const hideBg = (runtime: WonderCardRuntime, bg: number): void => {
  runtime.hiddenBgs.add(bg);
  runtime.shownBgs.delete(bg);
  record(runtime, 'HideBg', bg);
};

const putWindowTilemap = (runtime: WonderCardRuntime, windowId: number): void => record(runtime, 'PutWindowTilemap', windowId);
const fillWindowPixelBuffer = (runtime: WonderCardRuntime, windowId: number, fill: number): void => record(runtime, 'FillWindowPixelBuffer', windowId, fill);
const getFontAttribute = (_font: string, _attr: string): number => 0;
const getStringWidth = (_font: string, text: number[] | string, spacing: number): number => {
  const str = typeof text === 'string' ? text : textBytesToString(text);
  return Math.max(0, str.length * 8 + Math.max(0, str.length - 1) * spacing);
};

const addTextPrinterParameterized3 = (runtime: WonderCardRuntime, windowId: number, font: string, x: number, y: number, colors: readonly number[], speed: number, text: number[]): void => {
  runtime.textPrinters.push({ windowId, font, x, y, colors, speed, text: textBytesToString(text) });
  record(runtime, 'AddTextPrinterParameterized3', windowId, font, x, y, colors, speed, textBytesToString(text));
};

const copyWindowToVram = (runtime: WonderCardRuntime, windowId: number, mode: number): void => {
  runtime.copiedWindows.push({ windowId, mode });
  record(runtime, 'CopyWindowToVram', windowId, mode);
};

const convertIntToDecimalStringN = (value: number, mode: 'LEFT_ALIGN' | 'LEADING_ZEROS', length: number): number[] => {
  const clamped = Math.max(0, Math.trunc(value));
  const text = mode === 'LEADING_ZEROS'
    ? String(clamped).padStart(length, '0').slice(-length)
    : String(clamped).slice(0, length);
  return [...Array.from(text, (char) => char.charCodeAt(0)), EOS];
};

const loadMonIconPalettes = (runtime: WonderCardRuntime): void => {
  runtime.loadedMonIconPalettes = true;
  record(runtime, 'LoadMonIconPalettes');
};

const freeMonIconPalettes = (runtime: WonderCardRuntime): void => {
  runtime.freedMonIconPalettes = true;
  record(runtime, 'FreeMonIconPalettes');
};

const mailSpeciesToIconSpecies = (species: number): number => species;

const createMonIconHandleDeoxys = (runtime: WonderCardRuntime, species: number, x: number, y: number, subpriority: number): number => {
  const id = runtime.nextSpriteId;
  runtime.nextSpriteId += 1;
  runtime.sprites[id] = { id, kind: 'monIcon', species, x, y, subpriority, priority: 0, destroyed: false };
  record(runtime, 'CreateMonIcon_HandleDeoxys', species, x, y, subpriority, id);
  return id;
};

const createSprite = (runtime: WonderCardRuntime, x: number, y: number, subpriority: number): number => {
  const id = runtime.nextSpriteId;
  runtime.nextSpriteId += 1;
  runtime.sprites[id] = { id, kind: 'stampShadow', species: 0, x, y, subpriority, priority: 0, destroyed: false };
  record(runtime, 'CreateSprite', sSpriteTemplateStampShadow, x, y, subpriority, id);
  return id;
};

const destroyMonIcon = (runtime: WonderCardRuntime, spriteId: number): void => {
  if (runtime.sprites[spriteId]) {
    runtime.sprites[spriteId].destroyed = true;
  }
  record(runtime, 'DestroyMonIcon', spriteId);
};

const destroySprite = (runtime: WonderCardRuntime, spriteId: number): void => {
  if (runtime.sprites[spriteId]) {
    runtime.sprites[spriteId].destroyed = true;
  }
  record(runtime, 'DestroySprite', spriteId);
};

export const wonderCardInit = (runtime: WonderCardRuntime, card: WonderCard | null, metadata: WonderCardMetadata | null): boolean => {
  if (card === null || metadata === null) {
    return false;
  }
  if (runtime.allocFails) {
    return false;
  }
  const copiedCard = cloneCard(card);
  if (copiedCard.bgType >= NUM_WONDER_BGS) {
    copiedCard.bgType = 0;
  }
  if (copiedCard.type >= CARD_TYPE_COUNT) {
    copiedCard.type = 0;
  }
  if (copiedCard.maxStamps > MAX_STAMP_CARD_STAMPS) {
    copiedCard.maxStamps = 0;
  }
  runtime.data = {
    card: copiedCard,
    cardMetadata: cloneMetadata(metadata),
    gfx: sCardGraphics[copiedCard.bgType],
    enterExitState: 0,
    recordIdx: 0,
    windowIds: Array.from({ length: WIN_COUNT }, () => 0),
    monIconSpriteId: SPRITE_NONE,
    stampSpriteIds: Array.from({ length: MAX_STAMP_CARD_STAMPS }, () => [SPRITE_NONE, SPRITE_NONE]),
    titleText: zeroText(WONDER_CARD_TEXT_LENGTH + 1),
    subtitleText: zeroText(WONDER_CARD_TEXT_LENGTH + 1),
    idNumberText: zeroText(7),
    bodyText: Array.from({ length: WONDER_CARD_BODY_TEXT_LINES }, () => zeroText(WONDER_CARD_TEXT_LENGTH + 1)),
    footerLine1Text: zeroText(WONDER_CARD_TEXT_LENGTH + 1),
    footerLine2Text: zeroText(WONDER_CARD_TEXT_LENGTH + 1),
    statTextData: Array.from({ length: 8 }, () => emptyStatText()),
    bgTilemapBuffer: Array.from({ length: 0x1000 }, () => 0)
  };
  return true;
};

export function WonderCard_Init(runtime: WonderCardRuntime, card: WonderCard | null, metadata: WonderCardMetadata | null): boolean {
  return wonderCardInit(runtime, card, metadata);
}

export const wonderCardDestroy = (runtime: WonderCardRuntime): void => {
  if (runtime.data !== null) {
    runtime.data = null;
  }
};

export function WonderCard_Destroy(runtime: WonderCardRuntime): void {
  wonderCardDestroy(runtime);
}

export const wonderCardEnter = (runtime: WonderCardRuntime): number => {
  const data = runtime.data;
  if (data === null) {
    return -1;
  }
  switch (data.enterExitState) {
    case 0:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      break;
    case 1:
      if (updatePaletteFade(runtime)) return 0;
      break;
    case 2:
      fillBgTilemapBufferRectPalette0(runtime, 0, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 1, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 2, 0x000, 0, 0, 30, 20);
      copyBgTilemapBufferToVram(runtime, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      copyBgTilemapBufferToVram(runtime, 2);
      decompressAndCopyTileDataToVram(runtime, 2, data.gfx.tiles, 0, 0x008, 0);
      data.windowIds[WIN_HEADER] = addWindow(runtime, sWindowTemplates[WIN_HEADER]);
      data.windowIds[WIN_BODY] = addWindow(runtime, sWindowTemplates[WIN_BODY]);
      data.windowIds[WIN_FOOTER] = addWindow(runtime, sWindowTemplates[WIN_FOOTER]);
      break;
    case 3:
      if (freeTempTileDataBuffersIfPossible(runtime)) return 0;
      runtime.paletteFade.bufferTransferDisabled = true;
      loadPalette(runtime, data.gfx.pal, BG_PLTT_ID_1, PLTT_SIZE_4BPP);
      lz77UnCompWram(runtime, data.gfx.map, data.bgTilemapBuffer);
      copyRectToBgTilemapBufferRect(runtime, 2, data.bgTilemapBuffer, 0, 0, 30, 20, 0, 0, 30, 20, 1, 0x008, 0);
      copyBgTilemapBufferToVram(runtime, 2);
      break;
    case 4:
      bufferCardText(runtime);
      break;
    case 5:
      drawCardWindow(runtime, WIN_HEADER);
      drawCardWindow(runtime, WIN_BODY);
      drawCardWindow(runtime, WIN_FOOTER);
      copyBgTilemapBufferToVram(runtime, 1);
      break;
    case 6:
      loadMonIconPalettes(runtime);
      break;
    case 7:
      showBg(runtime, 1);
      showBg(runtime, 2);
      runtime.paletteFade.bufferTransferDisabled = false;
      createCardSprites(runtime);
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      updatePaletteFade(runtime);
      break;
    default:
      if (updatePaletteFade(runtime)) return 0;
      data.enterExitState = 0;
      return 1;
  }
  data.enterExitState += 1;
  return 0;
};

export function WonderCard_Enter(runtime: WonderCardRuntime): number {
  return wonderCardEnter(runtime);
}

export const wonderCardExit = (runtime: WonderCardRuntime, useCancel: boolean): number => {
  const data = runtime.data;
  if (data === null) {
    return -1;
  }
  switch (data.enterExitState) {
    case 0:
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      break;
    case 1:
      if (updatePaletteFade(runtime)) return 0;
      break;
    case 2:
      fillBgTilemapBufferRectPalette0(runtime, 0, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 1, 0x000, 0, 0, 30, 20);
      fillBgTilemapBufferRectPalette0(runtime, 2, 0x000, 0, 0, 30, 20);
      copyBgTilemapBufferToVram(runtime, 0);
      copyBgTilemapBufferToVram(runtime, 1);
      copyBgTilemapBufferToVram(runtime, 2);
      break;
    case 3:
      hideBg(runtime, 1);
      hideBg(runtime, 2);
      removeWindow(runtime, data.windowIds[WIN_FOOTER]);
      removeWindow(runtime, data.windowIds[WIN_BODY]);
      removeWindow(runtime, data.windowIds[WIN_HEADER]);
      break;
    case 4:
      destroyCardSprites(runtime);
      freeMonIconPalettes(runtime);
      break;
    case 5:
      record(runtime, 'PrintMysteryGiftOrEReaderTopMenu', runtime.giftIsFromEReader, useCancel);
      break;
    case 6:
      copyBgTilemapBufferToVram(runtime, 0);
      beginNormalPaletteFade(runtime, PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      break;
    default:
      if (updatePaletteFade(runtime)) return 0;
      data.enterExitState = 0;
      return 1;
  }
  data.enterExitState += 1;
  return 0;
};

export function WonderCard_Exit(runtime: WonderCardRuntime, useCancel: boolean): number {
  return wonderCardExit(runtime, useCancel);
}

export const bufferCardText = (runtime: WonderCardRuntime): void => {
  const data = requireData(runtime);
  let charsUntilStat = 0;
  const stats = [
    data.cardMetadata.battlesWon < MAX_WONDER_CARD_STAT ? data.cardMetadata.battlesWon : MAX_WONDER_CARD_STAT,
    data.cardMetadata.battlesLost < MAX_WONDER_CARD_STAT ? data.cardMetadata.battlesLost : MAX_WONDER_CARD_STAT,
    data.cardMetadata.numTrades < MAX_WONDER_CARD_STAT ? data.cardMetadata.numTrades : MAX_WONDER_CARD_STAT
  ];
  data.titleText = [...data.card.titleText, EOS];
  data.subtitleText = [...data.card.subtitleText, EOS];
  if (data.card.idNumber > 999999) {
    data.card.idNumber = 999999;
  }
  data.idNumberText = convertIntToDecimalStringN(data.card.idNumber, 'LEFT_ALIGN', 6);
  for (let i = 0; i < WONDER_CARD_BODY_TEXT_LINES; i += 1) {
    data.bodyText[i] = [...data.card.bodyText[i], EOS];
  }
  data.footerLine1Text = [...data.card.footerLine1Text, EOS];

  switch (data.card.type) {
    case CARD_TYPE_GIFT:
      data.footerLine2Text = [...data.card.footerLine2Text, EOS];
      break;
    case CARD_TYPE_STAMP:
      data.footerLine2Text[0] = EOS;
      break;
    case CARD_TYPE_LINK_STAT:
      data.footerLine2Text[0] = EOS;
      for (let i = 0; i < data.statTextData.length; i += 1) {
        data.statTextData[i].statNumberText = zeroText(4);
        data.statTextData[i].statText = zeroText(WONDER_CARD_TEXT_LENGTH + 1);
      }
      for (let i = 0, recordIdx = data.recordIdx; i < WONDER_CARD_TEXT_LENGTH; i += 1) {
        if (data.card.footerLine2Text[i] !== CHAR_DYNAMIC) {
          data.statTextData[recordIdx].statText[charsUntilStat] = data.card.footerLine2Text[i];
          charsUntilStat += 1;
        } else {
          const id = data.card.footerLine2Text[i + 1];
          if (id >= stats.length) {
            i += 2;
          } else {
            data.statTextData[recordIdx].statNumberText = convertIntToDecimalStringN(stats[id], 'LEADING_ZEROS', 3);
            data.statTextData[recordIdx].width = data.card.footerLine2Text[i + 2];
            data.recordIdx += 1;
            recordIdx = data.recordIdx;
            if (data.recordIdx >= data.statTextData.length) {
              break;
            }
            charsUntilStat = 0;
            i += 2;
          }
        }
      }
      break;
  }
};

export function BufferCardText(runtime: WonderCardRuntime): void {
  bufferCardText(runtime);
}

export const drawCardWindow = (runtime: WonderCardRuntime, whichWindow: number): void => {
  const data = requireData(runtime);
  let i = 0;
  const windowId = data.windowIds[whichWindow];
  putWindowTilemap(runtime, windowId);
  fillWindowPixelBuffer(runtime, windowId, 0);
  switch (whichWindow) {
    case WIN_HEADER: {
      addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL_COPY_2, 0, 1, sTextColorTable[data.gfx.titleTextPal], 0, data.titleText);
      let x = 160 - getStringWidth(FONT_NORMAL_COPY_2, data.subtitleText, getFontAttribute(FONT_NORMAL_COPY_2, FONTATTR_LETTER_SPACING));
      if (x < 0) x = 0;
      addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL_COPY_2, x, 17, sTextColorTable[data.gfx.titleTextPal], 0, data.subtitleText);
      if (data.card.idNumber !== 0) {
        addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL, 166, 17, sTextColorTable[data.gfx.titleTextPal], 0, data.idNumberText);
      }
      break;
    }
    case WIN_BODY:
      for (; i < WONDER_CARD_BODY_TEXT_LINES; i += 1) {
        addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL_COPY_2, 0, 16 * i + 2, sTextColorTable[data.gfx.bodyTextPal], 0, data.bodyText[i]);
      }
      break;
    case WIN_FOOTER:
      addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL_COPY_2, 0, sFooterTextOffsets[data.card.type], sTextColorTable[data.gfx.footerTextPal], 0, data.footerLine1Text);
      if (data.card.type !== CARD_TYPE_LINK_STAT) {
        addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL_COPY_2, 0, 16 + sFooterTextOffsets[data.card.type], sTextColorTable[data.gfx.footerTextPal], 0, data.footerLine2Text);
      } else {
        let x = 0;
        const y = sFooterTextOffsets[data.card.type] + 16;
        const spacing = getFontAttribute(FONT_NORMAL_COPY_2, FONTATTR_LETTER_SPACING);
        for (; i < data.recordIdx; i += 1) {
          addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL_COPY_2, x, y, sTextColorTable[data.gfx.footerTextPal], 0, data.statTextData[i].statText);
          if (data.statTextData[i].statNumberText[0] !== EOS) {
            x += getStringWidth(FONT_NORMAL_COPY_2, data.statTextData[i].statText, spacing);
            addTextPrinterParameterized3(runtime, windowId, FONT_NORMAL, x, y, sTextColorTable[data.gfx.footerTextPal], 0, data.statTextData[i].statNumberText);
            x += getStringWidth(FONT_NORMAL_COPY_2, data.statTextData[i].statNumberText, spacing) + data.statTextData[i].width;
          }
        }
      }
      break;
  }
  copyWindowToVram(runtime, windowId, COPYWIN_FULL);
};

export function DrawCardWindow(runtime: WonderCardRuntime, whichWindow: number): void {
  drawCardWindow(runtime, whichWindow);
}

export const createCardSprites = (runtime: WonderCardRuntime): void => {
  const data = requireData(runtime);
  data.monIconSpriteId = SPRITE_NONE;
  if (data.cardMetadata.iconSpecies !== SPECIES_NONE) {
    data.monIconSpriteId = createMonIconHandleDeoxys(runtime, mailSpeciesToIconSpecies(data.cardMetadata.iconSpecies), 220, 20, 0);
    runtime.sprites[data.monIconSpriteId].priority = 2;
  }
  if (data.card.maxStamps !== 0 && data.card.type === CARD_TYPE_STAMP) {
    runtime.loadedSpriteSheets.push(sSpriteSheetStampShadow);
    runtime.loadedSpritePalettes.push(sSpritePalettesStampShadow[data.gfx.stampShadowPal]);
    for (let i = 0; i < data.card.maxStamps; i += 1) {
      data.stampSpriteIds[i][0] = SPRITE_NONE;
      data.stampSpriteIds[i][1] = SPRITE_NONE;
      data.stampSpriteIds[i][0] = createSprite(runtime, 216 - 32 * i, 0x90, 8);
      if (data.cardMetadata.stampData[0][i] !== 0) {
        data.stampSpriteIds[i][1] = createMonIconHandleDeoxys(runtime, mailSpeciesToIconSpecies(data.cardMetadata.stampData[0][i]), 216 - 32 * i, 136, 0);
        runtime.sprites[data.stampSpriteIds[i][1]].priority = 2;
      }
    }
  }
};

export function CreateCardSprites(runtime: WonderCardRuntime): void {
  createCardSprites(runtime);
}

export const destroyCardSprites = (runtime: WonderCardRuntime): void => {
  const data = requireData(runtime);
  if (data.monIconSpriteId !== SPRITE_NONE) {
    destroyMonIcon(runtime, data.monIconSpriteId);
  }
  if (data.card.maxStamps !== 0 && data.card.type === CARD_TYPE_STAMP) {
    for (let i = 0; i < data.card.maxStamps; i += 1) {
      if (data.stampSpriteIds[i][0] !== SPRITE_NONE) {
        destroySprite(runtime, data.stampSpriteIds[i][0]);
        if (data.stampSpriteIds[i][0] !== SPRITE_NONE) {
          destroyMonIcon(runtime, data.stampSpriteIds[i][1]);
        }
      }
    }
    runtime.freedSpriteTiles.push(TAG_STAMP_SHADOW);
    runtime.freedSpritePalettes.push(TAG_STAMP_SHADOW);
  }
};

export function DestroyCardSprites(runtime: WonderCardRuntime): void {
  destroyCardSprites(runtime);
}

export const createWonderCard = (partial: Partial<WonderCard> = {}): WonderCard => {
  const {
    titleText,
    subtitleText,
    bodyText,
    footerLine1Text,
    footerLine2Text,
    ...rest
  } = partial;
  return {
    flagId: 0,
    iconSpecies: 0,
    idNumber: 0,
    type: CARD_TYPE_GIFT,
    bgType: 0,
    sendType: 0,
    maxStamps: 0,
    ...rest,
    titleText: fixedText(titleText ?? ''),
    subtitleText: fixedText(subtitleText ?? ''),
    bodyText: Array.from({ length: WONDER_CARD_BODY_TEXT_LINES }, (_, i) => fixedText(bodyText?.[i] ?? '')),
    footerLine1Text: fixedText(footerLine1Text ?? ''),
    footerLine2Text: fixedText(footerLine2Text ?? '')
  };
};

export const createWonderCardMetadata = (partial: Partial<WonderCardMetadata> = {}): WonderCardMetadata => {
  const { stampData, ...rest } = partial;
  return {
    battlesWon: 0,
    battlesLost: 0,
    numTrades: 0,
    iconSpecies: 0,
    ...rest,
    stampData: [Array.from({ length: MAX_STAMP_CARD_STAMPS }, (_, i) => stampData?.[0]?.[i] ?? 0)]
  };
};
