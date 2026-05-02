export const SAVE_NORMAL = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_ERROR = 0xff;

export const gText_SaveFailedCheckingBackup =
  'Save failed.\nChecking the backup memory..\nPlease wait.\n"Time required:\nabout 1 minute"';
export const gText_BackupMemoryDamaged =
  "The backup memory is damaged or\nthe game's battery has run dry.\nThe game can be played, but its\nprogress cannot be saved.\n\"Please press the A Button.\"";
export const gText_SaveCompletePressA = 'Save completed.\n"Please press the A Button."';

export interface SaveFailedScreenRuntime {
  isInSaveFailedScreen: boolean;
  saveType: number;
  unused: number;
  state: number;
  bgPalette: number[];
  objPalette: number[];
  decompressionBuffer: Uint8Array;
  gpuRegs: Map<string, number>;
  dmaRequests: { kind: 'fill' | 'copy'; value?: number; size: number; mode: string; dest: string }[];
  printedTexts: string[];
  fontLookup: { fg: number; bg: number; shadow: number } | null;
  damagedSaveSectors: number;
  flashSectors: Uint8Array[];
  saveDataBuffer: Uint32Array;
  saveAttemptStatus: number;
  aButtonNew: boolean;
  bgmVolume: number;
  callbacksSaved: number;
  callbacksRestored: number;
  mapTilesSaved: number;
  mapTilesRestored: number;
  gpuRegsSaved: number;
  mapTextColorsSaved: number;
  mapTextColorsRestored: number;
  handleSavingDataCalls: number[];
  handleSavingData?: (runtime: SaveFailedScreenRuntime, saveType: number) => void;
}

export const createSaveFailedScreenRuntime = (): SaveFailedScreenRuntime => ({
  isInSaveFailedScreen: false,
  saveType: SAVE_NORMAL,
  unused: 0,
  state: 0,
  bgPalette: Array.from({ length: 0x100 }, () => 0),
  objPalette: Array.from({ length: 0x100 }, () => 0),
  decompressionBuffer: new Uint8Array(0x4000),
  gpuRegs: new Map(),
  dmaRequests: [],
  printedTexts: [],
  fontLookup: null,
  damagedSaveSectors: 0,
  flashSectors: Array.from({ length: 32 }, () => new Uint8Array(0x1000)),
  saveDataBuffer: new Uint32Array(0x1000 / 4),
  saveAttemptStatus: SAVE_STATUS_OK,
  aButtonNew: false,
  bgmVolume: 256,
  callbacksSaved: 0,
  callbacksRestored: 0,
  mapTilesSaved: 0,
  mapTilesRestored: 0,
  gpuRegsSaved: 0,
  mapTextColorsSaved: 0,
  mapTextColorsRestored: 0,
  handleSavingDataCalls: []
});

export const setNotInSaveFailedScreen = (runtime: SaveFailedScreenRuntime): void => {
  runtime.isInSaveFailedScreen = false;
};

export const doSaveFailedScreen = (runtime: SaveFailedScreenRuntime, saveType: number): void => {
  runtime.saveType = saveType & 0xff;
  runtime.isInSaveFailedScreen = true;
};

const blankPalettes = (runtime: SaveFailedScreenRuntime): void => {
  for (let i = 0; i < runtime.bgPalette.length; i += 1) {
    runtime.bgPalette[i] = 0;
    runtime.objPalette[i] = 0;
  }
};

const requestDma3Fill = (
  runtime: SaveFailedScreenRuntime,
  value: number,
  dest: string,
  size: number,
  mode: string
): void => {
  runtime.dmaRequests.push({ kind: 'fill', value, dest, size, mode });
};

const requestDma3Copy = (
  runtime: SaveFailedScreenRuntime,
  dest: string,
  size: number,
  mode: string
): void => {
  runtime.dmaRequests.push({ kind: 'copy', dest, size, mode });
};

const requestDmaCopyFromScreenBuffer = (runtime: SaveFailedScreenRuntime): void => {
  requestDma3Copy(runtime, 'BG_SCREEN_ADDR(31)', 0x500, 'DMA3_16BIT');
};

const requestDmaCopyFromCharBuffer = (runtime: SaveFailedScreenRuntime): void => {
  requestDma3Copy(runtime, 'BG_CHAR_ADDR(3)+0x20', 0x2300, 'DMA3_16BIT');
};

export const fillBgMapBufferRect = (
  runtime: SaveFailedScreenRuntime,
  baseBlock: number,
  left: number,
  top: number,
  width: number,
  height: number,
  blockOffset: number
): void => {
  let block = baseBlock & 0xffff;
  for (let i = top; i < top + height; i += 1) {
    for (let j = left; j < left + width; j += 1) {
      const offset = 0x3800 + 64 * i + 2 * j;
      runtime.decompressionBuffer[offset] = block & 0xff;
      runtime.decompressionBuffer[offset + 1] = (block >>> 8) & 0xff;
      block = (block + blockOffset) & 0xffff;
    }
  }
  requestDmaCopyFromScreenBuffer(runtime);
};

export const updateMapBufferWithText = (runtime: SaveFailedScreenRuntime): void => {
  fillBgMapBufferRect(runtime, 0x001, 1, 5, 28, 10, 0x001);
};

export const clearMapBuffer = (runtime: SaveFailedScreenRuntime): void => {
  fillBgMapBufferRect(runtime, 0x000, 0, 0, 30, 20, 0x000);
};

export const printTextOnSaveFailedScreen = (
  runtime: SaveFailedScreenRuntime,
  str: string
): void => {
  runtime.fontLookup = { fg: 2, bg: 1, shadow: 3 };
  runtime.decompressionBuffer.fill(0x11, 0x20, 0x20 + 0x2300);
  runtime.printedTexts.push(str);
  requestDmaCopyFromCharBuffer(runtime);
};

export const verifySectorWipe = (
  runtime: SaveFailedScreenRuntime,
  sector: number
): boolean => {
  const flash = runtime.flashSectors[sector & 0xffff];
  for (let i = 0; i < runtime.saveDataBuffer.length; i += 1) {
    const offset = i * 4;
    runtime.saveDataBuffer[i] =
      (flash[offset] |
        (flash[offset + 1] << 8) |
        (flash[offset + 2] << 16) |
        (flash[offset + 3] << 24)) >>>
      0;
    if (runtime.saveDataBuffer[i] !== 0) {
      return true;
    }
  }
  return false;
};

export const wipeSector = (
  runtime: SaveFailedScreenRuntime,
  sector: number
): boolean => {
  let result = false;
  let i = 0;
  while (i < 130) {
    for (let j = 0; j < 0x1000; j += 1) {
      runtime.flashSectors[sector][j] = 0;
    }
    result = verifySectorWipe(runtime, sector);
    i += 1;
    if (!result) {
      break;
    }
  }
  return result;
};

export const wipeDamagedSectors = (
  runtime: SaveFailedScreenRuntime,
  damagedSectors: number
): boolean => {
  let damaged = damagedSectors >>> 0;
  for (let i = 0; i < 32; i += 1) {
    if (damaged & (1 << i)) {
      if (!wipeSector(runtime, i)) {
        damaged &= ~(1 << i);
      }
    }
  }
  return damaged !== 0;
};

export const tryWipeDamagedSectors = (runtime: SaveFailedScreenRuntime): boolean => {
  for (let i = 0; runtime.damagedSaveSectors !== 0 && i < 3; i += 1) {
    if (wipeDamagedSectors(runtime, runtime.damagedSaveSectors)) {
      return false;
    }
    runtime.handleSavingDataCalls.push(runtime.saveType);
    runtime.handleSavingData?.(runtime, runtime.saveType);
  }
  if (runtime.damagedSaveSectors !== 0) {
    return false;
  }
  return true;
};

export const runSaveFailedScreen = (runtime: SaveFailedScreenRuntime): boolean => {
  switch (runtime.state) {
    case 0:
      if (!runtime.isInSaveFailedScreen) {
        return false;
      }
      runtime.bgmVolume = 128;
      runtime.callbacksSaved += 1;
      runtime.state = 1;
      break;
    case 1:
      runtime.mapTilesSaved += 1;
      runtime.gpuRegsSaved += 1;
      runtime.mapTextColorsSaved += 1;
      blankPalettes(runtime);
      runtime.gpuRegs.set('DISPCNT', 0);
      runtime.state = 2;
      break;
    case 2:
      requestDma3Fill(runtime, 0, 'BG_CHAR_ADDR(3)', 0x4000, 'DMA3_16BIT');
      requestDma3Copy(runtime, 'PLTT', 0x20, 'DMA3_16BIT');
      runtime.state = 3;
      break;
    case 3:
      clearMapBuffer(runtime);
      printTextOnSaveFailedScreen(runtime, gText_SaveFailedCheckingBackup);
      updateMapBufferWithText(runtime);
      runtime.state = 4;
      break;
    case 4:
      runtime.gpuRegs.set('BLDCNT', 0);
      runtime.gpuRegs.set('BG0HOFS', 0);
      runtime.gpuRegs.set('BG0VOFS', 0);
      runtime.gpuRegs.set('BG0CNT', 0x1f00);
      runtime.gpuRegs.set('DISPCNT', 0x0100);
      runtime.state = 5;
      break;
    case 5:
      if (tryWipeDamagedSectors(runtime)) {
        runtime.saveAttemptStatus = SAVE_STATUS_OK;
        printTextOnSaveFailedScreen(runtime, gText_SaveCompletePressA);
      } else {
        runtime.saveAttemptStatus = SAVE_STATUS_ERROR;
        printTextOnSaveFailedScreen(runtime, gText_BackupMemoryDamaged);
      }
      runtime.state = 6;
      break;
    case 6:
      if (runtime.aButtonNew) {
        runtime.state = 7;
      }
      break;
    case 7:
      runtime.gpuRegs.set('DISPCNT', 0);
      runtime.mapTilesRestored += 1;
      blankPalettes(runtime);
      runtime.state = 8;
      break;
    case 8:
      runtime.bgmVolume = 256;
      runtime.mapTextColorsRestored += 1;
      runtime.callbacksRestored += 1;
      runtime.isInSaveFailedScreen = false;
      runtime.state = 0;
      break;
  }
  return true;
};

export function SetNotInSaveFailedScreen(runtime: SaveFailedScreenRuntime): void {
  setNotInSaveFailedScreen(runtime);
}

export function DoSaveFailedScreen(runtime: SaveFailedScreenRuntime, saveType: number): void {
  doSaveFailedScreen(runtime, saveType);
}

export function RunSaveFailedScreen(runtime: SaveFailedScreenRuntime): boolean {
  return runSaveFailedScreen(runtime);
}

export function BlankPalettes(runtime: SaveFailedScreenRuntime): void {
  blankPalettes(runtime);
}

export function RequestDmaCopyFromScreenBuffer(runtime: SaveFailedScreenRuntime): void {
  requestDmaCopyFromScreenBuffer(runtime);
}

export function RequestDmaCopyFromCharBuffer(runtime: SaveFailedScreenRuntime): void {
  requestDmaCopyFromCharBuffer(runtime);
}

export function FillBgMapBufferRect(
  runtime: SaveFailedScreenRuntime,
  baseBlock: number,
  left: number,
  top: number,
  width: number,
  height: number,
  blockOffset: number
): void {
  fillBgMapBufferRect(runtime, baseBlock, left, top, width, height, blockOffset);
}

export function UpdateMapBufferWithText(runtime: SaveFailedScreenRuntime): void {
  updateMapBufferWithText(runtime);
}

export function ClearMapBuffer(runtime: SaveFailedScreenRuntime): void {
  clearMapBuffer(runtime);
}

export function PrintTextOnSaveFailedScreen(
  runtime: SaveFailedScreenRuntime,
  str: string
): void {
  printTextOnSaveFailedScreen(runtime, str);
}

export function TryWipeDamagedSectors(runtime: SaveFailedScreenRuntime): boolean {
  return tryWipeDamagedSectors(runtime);
}

export function VerifySectorWipe(runtime: SaveFailedScreenRuntime, sector: number): boolean {
  return verifySectorWipe(runtime, sector);
}

export function WipeSector(runtime: SaveFailedScreenRuntime, sector: number): boolean {
  return wipeSector(runtime, sector);
}

export function WipeDamagedSectors(
  runtime: SaveFailedScreenRuntime,
  damagedSectors: number
): boolean {
  return wipeDamagedSectors(runtime, damagedSectors);
}
