export const WINDOW_NONE = 0xff;

export interface HelpMessageWindow {
  id: number;
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
  tilemapPut: boolean;
  pixelsFilled: number | null;
  tilesDrawn: number[];
  text: string;
  removed: boolean;
}

export interface HelpMessageRuntime {
  sHelpMessageWindowId: number;
  windows: HelpMessageWindow[];
  operations: string[];
}

export const createHelpMessageRuntime = (overrides: Partial<HelpMessageRuntime> = {}): HelpMessageRuntime => ({
  sHelpMessageWindowId: WINDOW_NONE,
  windows: [],
  operations: [],
  ...overrides
});

const getWindow = (runtime: HelpMessageRuntime, windowId: number): HelpMessageWindow => {
  const window = runtime.windows[windowId];
  if (!window) throw new Error(`window ${windowId} does not exist`);
  return window;
};

export function MapNamePopupWindowIdSetDummy(runtime: HelpMessageRuntime): void {
  runtime.sHelpMessageWindowId = WINDOW_NONE;
}

export function CreateHelpMessageWindow(runtime: HelpMessageRuntime): number {
  if (runtime.sHelpMessageWindowId === WINDOW_NONE) {
    runtime.sHelpMessageWindowId = runtime.windows.length;
    runtime.windows.push({
      id: runtime.sHelpMessageWindowId,
      bg: 0,
      tilemapLeft: 0,
      tilemapTop: 15,
      width: 30,
      height: 5,
      paletteNum: 15,
      baseBlock: 0x08f,
      tilemapPut: true,
      pixelsFilled: null,
      tilesDrawn: [],
      text: '',
      removed: false
    });
    runtime.operations.push(`AddWindow:${runtime.sHelpMessageWindowId}`, `PutWindowTilemap:${runtime.sHelpMessageWindowId}`);
  }
  return runtime.sHelpMessageWindowId;
}

export function DestroyHelpMessageWindow(runtime: HelpMessageRuntime, mode: number): void {
  if (runtime.sHelpMessageWindowId !== WINDOW_NONE) {
    const window = getWindow(runtime, runtime.sHelpMessageWindowId);
    window.pixelsFilled = 0;
    window.tilemapPut = false;
    if (mode) runtime.operations.push(`CopyWindowToVram:${window.id}:${mode}`);
    window.removed = true;
    runtime.operations.push(`RemoveWindow:${window.id}`);
    runtime.sHelpMessageWindowId = WINDOW_NONE;
  }
}

export function DrawHelpMessageWindowTilesById(runtime: HelpMessageRuntime, windowId: number): void {
  const window = getWindow(runtime, windowId);
  window.tilesDrawn = [];
  for (let i = 0; i < window.height; i += 1) {
    for (let j = 0; j < window.width; j += 1) {
      window.tilesDrawn.push(i === 0 ? 0 : i === window.height - 1 ? 14 : 5);
    }
  }
  runtime.operations.push(`CopyToWindowPixelBuffer:${windowId}:${window.width * window.height * 32}:0`);
}

export function DrawHelpMessageWindowTiles(runtime: HelpMessageRuntime): void {
  DrawHelpMessageWindowTilesById(runtime, runtime.sHelpMessageWindowId);
}

export function PrintHelpMessageText(runtime: HelpMessageRuntime, text: string): void {
  getWindow(runtime, runtime.sHelpMessageWindowId).text = text;
  runtime.operations.push(`AddTextPrinterParameterized4:${runtime.sHelpMessageWindowId}:${text}`);
}

export function PrintTextOnHelpMessageWindow(runtime: HelpMessageRuntime, text: string, mode: number): void {
  DrawHelpMessageWindowTiles(runtime);
  PrintHelpMessageText(runtime, text);
  if (mode) runtime.operations.push(`CopyWindowToVram:${runtime.sHelpMessageWindowId}:${mode}`);
}
