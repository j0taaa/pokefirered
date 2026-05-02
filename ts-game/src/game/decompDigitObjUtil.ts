export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_ERASE = 2;
export const ST_OAM_SQUARE = 0;
export const ST_OAM_H_RECTANGLE = 1;
export const ST_OAM_V_RECTANGLE = 2;
export const ST_OAM_SIZE_0 = 0;
export const ST_OAM_SIZE_1 = 1;
export const ST_OAM_SIZE_2 = 2;
export const ST_OAM_SIZE_3 = 3;
export const OAM_CAPACITY = 128;
export const DIGIT_OAM_START = 64;
export const TAG_NONE = 0xffff;
export const INDEX_NONE = 0xff;

export interface DigitOamData {
  y: number;
  x: number;
  shape: number;
  size: number;
  tileNum: number;
  priority: number;
  paletteNum: number;
  affineMode: number;
}

export interface DigitSpriteSheet {
  tag: number;
  size: number;
  data?: number[] | Uint8Array;
  decompressedSize?: number;
}

export interface DigitSpritePalette {
  tag: number;
}

export interface DigitObjUtilTemplate {
  strConvMode: number;
  shape: number;
  size: number;
  priority: number;
  oamCount: number;
  xDelta: number;
  x: number;
  y: number;
  spriteSheet: {
    uncompressed?: DigitSpriteSheet;
    compressed?: DigitSpriteSheet;
  };
  spritePal: DigitSpritePalette;
}

interface DigitPrinter {
  isActive: boolean;
  firstOamId: number;
  strConvMode: number;
  oamCount: number;
  palTagIndex: number;
  size: number;
  shape: number;
  priority: number;
  xDelta: number;
  tilesPerImage: number;
  tileStart: number;
  x: number;
  y: number;
  tileTag: number;
  palTag: number;
  pow10: number;
  lastPrinted: number;
}

interface DigitPrinterAlloc {
  count: number;
  array: DigitPrinter[];
}

export interface DigitObjUtilRuntime {
  oamWork: DigitPrinterAlloc | null;
  oamBuffer: DigitOamData[];
  spriteTiles: Map<number, number>;
  spritePalettes: Map<number, number>;
  nextTileStart: number;
  nextPaletteIndex: number;
  loadedSheets: Array<{ tag: number; size: number; compressed: boolean; tileStart: number }>;
  loadedPalettes: Array<{ tag: number; paletteIndex: number }>;
  freedTileTags: number[];
  freedPaletteTags: number[];
}

const tilesPerImage = [
  [0x01, 0x04, 0x10, 0x40],
  [0x02, 0x04, 0x08, 0x20],
  [0x02, 0x04, 0x08, 0x20],
  [0x00, 0x00, 0x00, 0x00]
];

const emptyOam = (): DigitOamData => ({
  y: 0,
  x: 0,
  shape: 0,
  size: 0,
  tileNum: 0,
  priority: 0,
  paletteNum: 0,
  affineMode: 0
});

const emptyPrinter = (): DigitPrinter => ({
  isActive: false,
  firstOamId: INDEX_NONE,
  strConvMode: 0,
  oamCount: 0,
  palTagIndex: 0,
  size: 0,
  shape: 0,
  priority: 0,
  xDelta: 0,
  tilesPerImage: 0,
  tileStart: 0,
  x: 0,
  y: 0,
  tileTag: 0,
  palTag: 0,
  pow10: 0,
  lastPrinted: 0
});

export const createDigitObjUtilRuntime = (): DigitObjUtilRuntime => ({
  oamWork: null,
  oamBuffer: Array.from({ length: OAM_CAPACITY }, () => emptyOam()),
  spriteTiles: new Map(),
  spritePalettes: new Map(),
  nextTileStart: 0,
  nextPaletteIndex: 0,
  loadedSheets: [],
  loadedPalettes: [],
  freedTileTags: [],
  freedPaletteTags: []
});

const getPrinter = (runtime: DigitObjUtilRuntime, id: number): DigitPrinter | null =>
  runtime.oamWork?.array[id] ?? null;

const cpuFillOam = (runtime: DigitObjUtilRuntime, start: number, count: number): void => {
  for (let i = 0; i < count; i += 1) {
    runtime.oamBuffer[start + i] = emptyOam();
  }
};

const getSpriteTileStartByTag = (runtime: DigitObjUtilRuntime, tag: number): number =>
  runtime.spriteTiles.get(tag) ?? TAG_NONE;

const loadSpriteSheet = (runtime: DigitObjUtilRuntime, sheet: DigitSpriteSheet): number => {
  const tileStart = runtime.nextTileStart;
  runtime.nextTileStart += 1;
  runtime.spriteTiles.set(sheet.tag, tileStart);
  runtime.loadedSheets.push({ tag: sheet.tag, size: sheet.size, compressed: false, tileStart });
  return tileStart;
};

const getDecompressedDataSize = (sheet: DigitSpriteSheet): number =>
  sheet.decompressedSize ?? sheet.size;

const loadCompressedSpriteSheet = (
  runtime: DigitObjUtilRuntime,
  sheet: DigitSpriteSheet
): number => {
  const tileStart = runtime.nextTileStart;
  runtime.nextTileStart += 1;
  runtime.spriteTiles.set(sheet.tag, tileStart);
  runtime.loadedSheets.push({
    tag: sheet.tag,
    size: getDecompressedDataSize(sheet),
    compressed: true,
    tileStart
  });
  return tileStart;
};

const indexOfSpritePaletteTag = (runtime: DigitObjUtilRuntime, tag: number): number =>
  runtime.spritePalettes.get(tag) ?? INDEX_NONE;

const loadSpritePalette = (
  runtime: DigitObjUtilRuntime,
  palette: DigitSpritePalette
): number => {
  const paletteIndex = runtime.nextPaletteIndex;
  runtime.nextPaletteIndex += 1;
  runtime.spritePalettes.set(palette.tag, paletteIndex);
  runtime.loadedPalettes.push({ tag: palette.tag, paletteIndex });
  return paletteIndex;
};

const freeSpriteTilesByTag = (runtime: DigitObjUtilRuntime, tag: number): void => {
  runtime.spriteTiles.delete(tag);
  runtime.freedTileTags.push(tag);
};

const freeSpritePaletteByTag = (runtime: DigitObjUtilRuntime, tag: number): void => {
  runtime.spritePalettes.delete(tag);
  runtime.freedPaletteTags.push(tag);
};

export const digitObjUtilInit = (runtime: DigitObjUtilRuntime, count: number): boolean => {
  if (runtime.oamWork !== null) {
    digitObjUtilFree(runtime);
  }

  runtime.oamWork = {
    count,
    array: Array.from({ length: count }, () => emptyPrinter())
  };
  return true;
};

export const digitObjUtilFree = (runtime: DigitObjUtilRuntime): void => {
  if (runtime.oamWork !== null) {
    if (runtime.oamWork.array !== null) {
      for (let i = 0; i < runtime.oamWork.count; i += 1) {
        digitObjUtilDeletePrinter(runtime, i);
      }
    }
    runtime.oamWork = null;
  }
};

export const digitObjUtilCreatePrinter = (
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number,
  template: DigitObjUtilTemplate
): boolean => {
  const printer = getPrinter(runtime, id);
  if (runtime.oamWork === null || printer === null) {
    return false;
  }
  if (printer.isActive) {
    return false;
  }

  printer.firstOamId = getFirstOamId(runtime, template.oamCount);
  if (printer.firstOamId === INDEX_NONE) {
    return false;
  }

  const uncompressed = template.spriteSheet.uncompressed;
  const sheet = uncompressed ?? template.spriteSheet.compressed;
  if (sheet === undefined) {
    return false;
  }
  printer.tileStart = getSpriteTileStartByTag(runtime, sheet.tag);
  if (printer.tileStart === TAG_NONE) {
    if (uncompressed !== undefined && uncompressed.size !== 0) {
      printer.tileStart = loadSpriteSheet(runtime, uncompressed);
    } else {
      const compressed = template.spriteSheet.compressed;
      if (compressed === undefined) {
        return false;
      }
      printer.tileStart = loadCompressedSpriteSheet(runtime, compressed);
    }

    if (printer.tileStart === TAG_NONE) {
      return false;
    }
  }

  printer.palTagIndex = indexOfSpritePaletteTag(runtime, template.spritePal.tag);
  if (printer.palTagIndex === INDEX_NONE) {
    printer.palTagIndex = loadSpritePalette(runtime, template.spritePal);
  }

  printer.strConvMode = template.strConvMode;
  printer.oamCount = template.oamCount;
  printer.x = template.x;
  printer.y = template.y;
  printer.shape = template.shape;
  printer.size = template.size;
  printer.priority = template.priority;
  printer.xDelta = template.xDelta;
  printer.tilesPerImage = getTilesPerImage(template.shape, template.size);
  printer.tileTag = sheet.tag;
  printer.palTag = template.spritePal.tag;
  printer.isActive = true;

  printer.pow10 = 1;
  for (let i = 1; i < template.oamCount; i += 1) {
    printer.pow10 *= 10;
  }

  copyWorkToOam(runtime, printer);
  digitObjUtilPrintNumOn(runtime, id, num);

  return true;
};

const copyWorkToOam = (runtime: DigitObjUtilRuntime, objWork: DigitPrinter): void => {
  let oamId = objWork.firstOamId;
  let x = objWork.x;
  const oamCount = objWork.oamCount + 1;

  cpuFillOam(runtime, oamId, oamCount);
  for (let i = 0; i < oamCount; i += 1, oamId += 1) {
    const oam = runtime.oamBuffer[oamId];
    oam.y = objWork.y;
    oam.x = x;
    oam.shape = objWork.shape;
    oam.size = objWork.size;
    oam.tileNum = objWork.tileStart;
    oam.priority = objWork.priority;
    oam.paletteNum = objWork.palTagIndex;

    x += objWork.xDelta;
  }

  oamId -= 1;
  runtime.oamBuffer[oamId].x = objWork.x - objWork.xDelta;
  runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  runtime.oamBuffer[oamId].tileNum = objWork.tileStart + objWork.tilesPerImage * 10;
};

export const digitObjUtilPrintNumOn = (
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number
): void => {
  const printer = getPrinter(runtime, id);
  if (runtime.oamWork === null || printer === null) {
    return;
  }
  if (!printer.isActive) {
    return;
  }

  printer.lastPrinted = num;
  let absNum = num;
  let sign: boolean;
  if (num < 0) {
    sign = true;
    absNum *= -1;
  } else {
    sign = false;
  }

  switch (printer.strConvMode) {
    case 1:
      drawNumObjsMinusInFront(runtime, printer, absNum, sign);
      break;
    case 2:
      drawNumObjsMinusInBack(runtime, printer, absNum, sign);
      break;
    case 0:
    default:
      drawNumObjsLeadingZeros(runtime, printer, absNum, sign);
      break;
  }
};

const drawNumObjsLeadingZeros = (
  runtime: DigitObjUtilRuntime,
  objWork: DigitPrinter,
  num: number,
  sign: boolean
): void => {
  let pow10 = objWork.pow10;
  let oamId = objWork.firstOamId;

  while (pow10 !== 0) {
    const digit = Math.trunc(num / pow10);
    num -= digit * pow10;
    pow10 = Math.trunc(pow10 / 10);

    runtime.oamBuffer[oamId].tileNum = digit * objWork.tilesPerImage + objWork.tileStart;
    oamId += 1;
  }

  runtime.oamBuffer[oamId].affineMode = sign ? ST_OAM_AFFINE_OFF : ST_OAM_AFFINE_ERASE;
};

const drawNumObjsMinusInFront = (
  runtime: DigitObjUtilRuntime,
  objWork: DigitPrinter,
  num: number,
  sign: boolean
): void => {
  let pow10 = objWork.pow10;
  let oamId = objWork.firstOamId;
  let curDigit = 0;
  let firstDigit = -1;

  while (pow10 !== 0) {
    const digit = Math.trunc(num / pow10);
    num -= digit * pow10;
    pow10 = Math.trunc(pow10 / 10);

    if (digit !== 0 || firstDigit !== -1 || pow10 === 0) {
      runtime.oamBuffer[oamId].tileNum = digit * objWork.tilesPerImage + objWork.tileStart;
      runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;

      if (firstDigit === -1) {
        firstDigit = curDigit;
      }
    } else {
      runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
    }

    oamId += 1;
    curDigit += 1;
  }

  if (sign) {
    runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
    runtime.oamBuffer[oamId].x = objWork.x + (firstDigit - 1) * objWork.xDelta;
  } else {
    runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  }
};

const drawNumObjsMinusInBack = (
  runtime: DigitObjUtilRuntime,
  objWork: DigitPrinter,
  num: number,
  sign: boolean
): void => {
  let pow10 = objWork.pow10;
  let oamId = objWork.firstOamId;
  let printingDigits = 0;
  let nsprites = 0;

  while (pow10 !== 0) {
    const digit = Math.trunc(num / pow10);
    num -= digit * pow10;
    pow10 = Math.trunc(pow10 / 10);

    if (digit !== 0 || printingDigits !== 0 || pow10 === 0) {
      printingDigits = 1;
      runtime.oamBuffer[oamId].tileNum = digit * objWork.tilesPerImage + objWork.tileStart;
      runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;

      oamId += 1;
      nsprites += 1;
    }
  }

  while (nsprites < objWork.oamCount) {
    runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
    oamId += 1;
    nsprites += 1;
  }

  runtime.oamBuffer[oamId].affineMode = sign ? ST_OAM_AFFINE_OFF : ST_OAM_AFFINE_ERASE;
};

export const digitObjUtilDeletePrinter = (
  runtime: DigitObjUtilRuntime,
  id: number
): void => {
  const printer = getPrinter(runtime, id);
  if (runtime.oamWork === null || printer === null) {
    return;
  }
  if (!printer.isActive) {
    return;
  }

  const oamCount = printer.oamCount + 1;
  let oamId = printer.firstOamId;
  for (let i = 0; i < oamCount; i += 1, oamId += 1) {
    runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
  }

  if (!sharesTileWithAnyActive(runtime, id)) {
    freeSpriteTilesByTag(runtime, printer.tileTag);
  }
  if (!sharesPalWithAnyActive(runtime, id)) {
    freeSpritePaletteByTag(runtime, printer.palTag);
  }

  printer.isActive = false;
};

export const digitObjUtilHideOrShow = (
  runtime: DigitObjUtilRuntime,
  id: number,
  hide: boolean
): void => {
  const printer = getPrinter(runtime, id);
  if (runtime.oamWork === null || printer === null) {
    return;
  }
  if (!printer.isActive) {
    return;
  }

  const oamCount = printer.oamCount + 1;
  let oamId = printer.firstOamId;
  if (hide) {
    for (let i = 0; i < oamCount; i += 1, oamId += 1) {
      runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_ERASE;
    }
  } else {
    for (let i = 0; i < oamCount; i += 1, oamId += 1) {
      runtime.oamBuffer[oamId].affineMode = ST_OAM_AFFINE_OFF;
    }

    digitObjUtilPrintNumOn(runtime, id, printer.lastPrinted);
  }
};

const getFirstOamId = (runtime: DigitObjUtilRuntime, oamCount: number): number => {
  if (runtime.oamWork === null) {
    return INDEX_NONE;
  }

  let firstOamId = DIGIT_OAM_START;
  for (let i = 0; i < runtime.oamWork.count; i += 1) {
    const printer = runtime.oamWork.array[i];
    if (!printer.isActive) {
      if (printer.firstOamId !== INDEX_NONE && printer.oamCount <= oamCount) {
        return printer.firstOamId;
      }
    } else {
      firstOamId += 1 + printer.oamCount;
    }
  }

  if (firstOamId + oamCount + 1 > OAM_CAPACITY) {
    return INDEX_NONE;
  }
  return firstOamId;
};

const sharesTileWithAnyActive = (runtime: DigitObjUtilRuntime, id: number): boolean => {
  if (runtime.oamWork === null) {
    return false;
  }
  const printer = runtime.oamWork.array[id];
  for (let i = 0; i < runtime.oamWork.count; i += 1) {
    if (
      runtime.oamWork.array[i].isActive &&
      i !== id &&
      runtime.oamWork.array[i].tileTag === printer.tileTag
    ) {
      return true;
    }
  }

  return false;
};

const sharesPalWithAnyActive = (runtime: DigitObjUtilRuntime, id: number): boolean => {
  if (runtime.oamWork === null) {
    return false;
  }
  const printer = runtime.oamWork.array[id];
  for (let i = 0; i < runtime.oamWork.count; i += 1) {
    if (
      runtime.oamWork.array[i].isActive &&
      i !== id &&
      runtime.oamWork.array[i].palTag === printer.palTag
    ) {
      return true;
    }
  }

  return false;
};

export const getTilesPerImage = (shape: number, size: number): number =>
  tilesPerImage[shape]?.[size] ?? 0;

export function DigitObjUtil_Init(runtime: DigitObjUtilRuntime, count: number): boolean {
  return digitObjUtilInit(runtime, count);
}

export function DigitObjUtil_Free(runtime: DigitObjUtilRuntime): void {
  digitObjUtilFree(runtime);
}

export function DigitObjUtil_CreatePrinter(
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number,
  template: DigitObjUtilTemplate
): boolean {
  return digitObjUtilCreatePrinter(runtime, id, num, template);
}

export function CopyWorkToOam(runtime: DigitObjUtilRuntime, id: number): void {
  const printer = getPrinter(runtime, id);
  if (printer !== null) {
    copyWorkToOam(runtime, printer);
  }
}

export function DigitObjUtil_PrintNumOn(
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number
): void {
  digitObjUtilPrintNumOn(runtime, id, num);
}

export function DrawNumObjsLeadingZeros(
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number,
  sign: boolean
): void {
  const printer = getPrinter(runtime, id);
  if (printer !== null) {
    drawNumObjsLeadingZeros(runtime, printer, num, sign);
  }
}

export function DrawNumObjsMinusInFront(
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number,
  sign: boolean
): void {
  const printer = getPrinter(runtime, id);
  if (printer !== null) {
    drawNumObjsMinusInFront(runtime, printer, num, sign);
  }
}

export function DrawNumObjsMinusInBack(
  runtime: DigitObjUtilRuntime,
  id: number,
  num: number,
  sign: boolean
): void {
  const printer = getPrinter(runtime, id);
  if (printer !== null) {
    drawNumObjsMinusInBack(runtime, printer, num, sign);
  }
}

export function DigitObjUtil_DeletePrinter(runtime: DigitObjUtilRuntime, id: number): void {
  digitObjUtilDeletePrinter(runtime, id);
}

export function DigitObjUtil_HideOrShow(
  runtime: DigitObjUtilRuntime,
  id: number,
  hide: boolean
): void {
  digitObjUtilHideOrShow(runtime, id, hide);
}

export function GetFirstOamId(runtime: DigitObjUtilRuntime, oamCount: number): number {
  return getFirstOamId(runtime, oamCount);
}

export function SharesTileWithAnyActive(runtime: DigitObjUtilRuntime, id: number): boolean {
  return sharesTileWithAnyActive(runtime, id);
}

export function SharesPalWithAnyActive(runtime: DigitObjUtilRuntime, id: number): boolean {
  return sharesPalWithAnyActive(runtime, id);
}

export function GetTilesPerImage(shape: number, size: number): number {
  return getTilesPerImage(shape, size);
}
