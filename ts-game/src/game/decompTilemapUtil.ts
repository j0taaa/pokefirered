export const BG_ATTR_SCREENSIZE = 'screensize';
export const BG_ATTR_BGTYPE = 'bgtype';

export interface TilemapUtilRectData {
  x: number;
  y: number;
  width: number;
  height: number;
  destX: number;
  destY: number;
}

export interface TilemapUtilEntry {
  prev: TilemapUtilRectData;
  cur: TilemapUtilRectData;
  savedTilemap: Uint8Array | null;
  tilemap: Uint8Array | null;
  altWidth: number;
  altHeight: number;
  width: number;
  height: number;
  rowSize: number;
  tileSize: number;
  bg: number;
  active: boolean;
}

export interface TilemapCopy {
  bg: number;
  tiles: Uint8Array;
  destX: number;
  destY: number;
  width: number;
  height: number;
}

export interface TilemapUtilRuntime {
  entries: TilemapUtilEntry[] | null;
  numTilemapUtilIds: number;
  bgAttributes: Map<number, { screensize: number; bgtype: number }>;
  copies: TilemapCopy[];
}

const rect = (): TilemapUtilRectData => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  destX: 0,
  destY: 0
});

const cloneRect = (value: TilemapUtilRectData): TilemapUtilRectData => ({ ...value });

const createEntry = (): TilemapUtilEntry => ({
  prev: rect(),
  cur: rect(),
  savedTilemap: null,
  tilemap: null,
  altWidth: 0,
  altHeight: 0,
  width: 0,
  height: 0,
  rowSize: 0,
  tileSize: 0,
  bg: 0,
  active: false
});

export const createTilemapUtilRuntime = (): TilemapUtilRuntime => ({
  entries: null,
  numTilemapUtilIds: 0,
  bgAttributes: new Map(),
  copies: []
});

const tilemapDimensions = [
  [
    { width: 256, height: 256 },
    { width: 512, height: 256 },
    { width: 256, height: 512 },
    { width: 512, height: 512 }
  ],
  [
    { width: 128, height: 128 },
    { width: 256, height: 256 },
    { width: 512, height: 512 },
    { width: 1024, height: 1024 }
  ]
] as const;

export const tilemapUtilInit = (runtime: TilemapUtilRuntime, numTilemapIds: number): void => {
  runtime.entries = Array.from({ length: numTilemapIds }, () => createEntry());
  runtime.numTilemapUtilIds = runtime.entries === null ? 0 : numTilemapIds & 0xffff;
  for (let i = 0; i < runtime.numTilemapUtilIds; i += 1) {
    runtime.entries[i].savedTilemap = null;
    runtime.entries[i].active = false;
  }
};

export const tilemapUtilFree = (runtime: TilemapUtilRuntime): void => {
  runtime.entries = null;
};

export const tilemapUtilSetBgAttributes = (
  runtime: TilemapUtilRuntime,
  bg: number,
  screensize: number,
  bgtype: number
): void => {
  runtime.bgAttributes.set(bg & 0xff, { screensize: screensize & 0xffff, bgtype: bgtype & 0xffff });
};

export const getBgAttribute = (
  runtime: TilemapUtilRuntime,
  bg: number,
  attr: typeof BG_ATTR_SCREENSIZE | typeof BG_ATTR_BGTYPE
): number => {
  const attributes = runtime.bgAttributes.get(bg & 0xff) ?? { screensize: 0, bgtype: 0 };
  return attr === BG_ATTR_SCREENSIZE ? attributes.screensize : attributes.bgtype;
};

export const tilemapUtilUpdateAll = (runtime: TilemapUtilRuntime): void => {
  for (let i = 0; i < runtime.numTilemapUtilIds; i += 1) {
    if (runtime.entries?.[i].active === true) {
      tilemapUtilUpdate(runtime, i);
    }
  }
};

export const tilemapUtilSetTilemap = (
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  bg: number,
  tilemap: Uint8Array,
  width: number,
  height: number
): void => {
  if (runtime.entries !== null && tilemapId < runtime.numTilemapUtilIds) {
    const entry = runtime.entries[tilemapId];
    entry.savedTilemap = null;
    entry.tilemap = tilemap;
    entry.bg = bg & 0xff;
    entry.width = width & 0xffff;
    entry.height = height & 0xffff;

    const screenSize = getBgAttribute(runtime, bg, BG_ATTR_SCREENSIZE);
    const bgType = getBgAttribute(runtime, bg, BG_ATTR_BGTYPE);
    entry.altWidth = tilemapDimensions[bgType][screenSize].width;
    entry.altHeight = tilemapDimensions[bgType][screenSize].height;
    entry.tileSize = bgType !== 0 ? 1 : 2;
    entry.rowSize = entry.width * entry.tileSize;
    entry.cur.width = entry.width;
    entry.cur.height = entry.height;
    entry.cur.x = 0;
    entry.cur.y = 0;
    entry.cur.destX = 0;
    entry.cur.destY = 0;
    entry.prev = cloneRect(entry.cur);
    entry.active = true;
  }
};

export const tilemapUtilSetSavedMap = (
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  tilemap: Uint8Array
): void => {
  if (runtime.entries !== null && tilemapId < runtime.numTilemapUtilIds) {
    runtime.entries[tilemapId].savedTilemap = tilemap;
    runtime.entries[tilemapId].active = true;
  }
};

export const tilemapUtilSetPos = (
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  destX: number,
  destY: number
): void => {
  if (runtime.entries !== null && tilemapId < runtime.numTilemapUtilIds) {
    runtime.entries[tilemapId].cur.destX = destX & 0xffff;
    runtime.entries[tilemapId].cur.destY = destY & 0xffff;
    runtime.entries[tilemapId].active = true;
  }
};

export const tilemapUtilSetRect = (
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  x: number,
  y: number,
  width: number,
  height: number
): void => {
  if (runtime.entries !== null && tilemapId < runtime.numTilemapUtilIds) {
    runtime.entries[tilemapId].cur.x = x & 0xffff;
    runtime.entries[tilemapId].cur.y = y & 0xffff;
    runtime.entries[tilemapId].cur.width = width & 0xffff;
    runtime.entries[tilemapId].cur.height = height & 0xffff;
    runtime.entries[tilemapId].active = true;
  }
};

const s8 = (value: number): number => {
  const v = value & 0xff;
  return v & 0x80 ? v - 0x100 : v;
};

export const tilemapUtilMove = (
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  mode: number,
  param: number
): void => {
  if (runtime.entries !== null && tilemapId < runtime.numTilemapUtilIds) {
    const entry = runtime.entries[tilemapId];
    const p = s8(param);
    switch (mode) {
      case 0:
        entry.cur.destX += p;
        entry.cur.width -= p;
        break;
      case 1:
        entry.cur.x += p;
        entry.cur.width += p;
        break;
      case 2:
        entry.cur.destY += p;
        entry.cur.height -= p;
        break;
      case 3:
        entry.cur.y -= p;
        entry.cur.height += p;
        break;
      case 4:
        entry.cur.destX += p;
        break;
      case 5:
        entry.cur.destY += p;
        break;
    }
    entry.active = true;
  }
};

export const copyToBgTilemapBufferRect = (
  runtime: TilemapUtilRuntime,
  bg: number,
  tiles: Uint8Array,
  destX: number,
  destY: number,
  width: number,
  height: number
): void => {
  runtime.copies.push({
    bg: bg & 0xff,
    tiles: new Uint8Array(tiles),
    destX,
    destY,
    width,
    height
  });
};

export const tilemapUtilUpdate = (runtime: TilemapUtilRuntime, tilemapId: number): void => {
  if (runtime.entries !== null && tilemapId < runtime.numTilemapUtilIds) {
    if (runtime.entries[tilemapId].savedTilemap !== null) {
      tilemapUtilDrawPrev(runtime, tilemapId);
    }
    tilemapUtilDraw(runtime, tilemapId);
    runtime.entries[tilemapId].prev = cloneRect(runtime.entries[tilemapId].cur);
  }
};

export const tilemapUtilDrawPrev = (runtime: TilemapUtilRuntime, tilemapId: number): void => {
  const entry = runtime.entries?.[tilemapId];
  if (entry === undefined || entry.savedTilemap === null) {
    return;
  }
  const rowSize = entry.tileSize * entry.altWidth;
  let offset = rowSize * entry.prev.destY + entry.prev.destX * entry.tileSize;
  for (let i = 0; i < entry.prev.height; i += 1) {
    copyToBgTilemapBufferRect(
      runtime,
      entry.bg,
      entry.savedTilemap.subarray(offset, offset + entry.prev.width * entry.tileSize),
      entry.prev.destX,
      entry.prev.destY + i,
      entry.prev.width,
      1
    );
    offset += rowSize;
  }
};

export const tilemapUtilDraw = (runtime: TilemapUtilRuntime, tilemapId: number): void => {
  const entry = runtime.entries?.[tilemapId];
  if (entry === undefined || entry.tilemap === null) {
    return;
  }
  const rowSize = entry.tileSize * entry.width;
  let offset = rowSize * entry.cur.y + entry.cur.x * entry.tileSize;
  for (let i = 0; i < entry.cur.height; i += 1) {
    copyToBgTilemapBufferRect(
      runtime,
      entry.bg,
      entry.tilemap.subarray(offset, offset + entry.cur.width * entry.tileSize),
      entry.cur.destX,
      entry.cur.destY + i,
      entry.cur.width,
      1
    );
    offset += rowSize;
  }
};

export function TilemapUtil_Init(runtime: TilemapUtilRuntime, numTilemapIds: number): void {
  tilemapUtilInit(runtime, numTilemapIds);
}

export function TilemapUtil_Free(runtime: TilemapUtilRuntime): void {
  tilemapUtilFree(runtime);
}

export function TilemapUtil_UpdateAll(runtime: TilemapUtilRuntime): void {
  tilemapUtilUpdateAll(runtime);
}

export function TilemapUtil_SetTilemap(
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  bg: number,
  tilemap: Uint8Array,
  width: number,
  height: number
): void {
  tilemapUtilSetTilemap(runtime, tilemapId, bg, tilemap, width, height);
}

export function TilemapUtil_SetSavedMap(
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  tilemap: Uint8Array
): void {
  tilemapUtilSetSavedMap(runtime, tilemapId, tilemap);
}

export function TilemapUtil_SetPos(
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  destX: number,
  destY: number
): void {
  tilemapUtilSetPos(runtime, tilemapId, destX, destY);
}

export function TilemapUtil_SetRect(
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  tilemapUtilSetRect(runtime, tilemapId, x, y, width, height);
}

export function TilemapUtil_Move(
  runtime: TilemapUtilRuntime,
  tilemapId: number,
  mode: number,
  param: number
): void {
  tilemapUtilMove(runtime, tilemapId, mode, param);
}

export function TilemapUtil_Update(runtime: TilemapUtilRuntime, tilemapId: number): void {
  tilemapUtilUpdate(runtime, tilemapId);
}

export function TilemapUtil_DrawPrev(runtime: TilemapUtilRuntime, tilemapId: number): void {
  tilemapUtilDrawPrev(runtime, tilemapId);
}

export function TilemapUtil_Draw(runtime: TilemapUtilRuntime, tilemapId: number): void {
  tilemapUtilDraw(runtime, tilemapId);
}
