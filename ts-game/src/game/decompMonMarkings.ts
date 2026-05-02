export const NUM_MON_MARKINGS = 4;
export const ANIM_CURSOR = NUM_MON_MARKINGS * 2;
export const ANIM_TEXT = ANIM_CURSOR + 1;
export const SELECTION_OK = NUM_MON_MARKINGS;
export const SELECTION_CANCEL = SELECTION_OK + 1;
export const MAX_SPRITES = 64;
export const TILE_SIZE_4BPP = 32;

export const A_BUTTON = 1 << 0;
export const B_BUTTON = 1 << 1;
export const DPAD_UP = 1 << 6;
export const DPAD_DOWN = 1 << 7;

export type MonMarkingsSpriteCallback = (
  runtime: MonMarkingsRuntime,
  sprite: MonMarkingsSprite
) => void;

export interface MonMarkingsSprite {
  id: number;
  x: number;
  y: number;
  priority: number;
  tileTag: number;
  paletteTag: number;
  animNum: number;
  shape: string;
  size: string;
  data: number[];
  destroyed: boolean;
  callback: MonMarkingsSpriteCallback;
  centerToCornerVec?: {
    shape: string;
    size: string;
    affineMode: string;
  };
}

export interface MonMarkingsMenu {
  baseTileTag: number;
  basePaletteTag: number;
  markings: number;
  cursorPos: number;
  markingsArray: number[];
  cursorBaseY: number;
  spriteSheetLoadRequired: boolean;
  windowSprites: Array<MonMarkingsSprite | null>;
  markingSprites: Array<MonMarkingsSprite | null>;
  cursorSprite: MonMarkingsSprite | null;
  textSprite: MonMarkingsSprite | null;
  frameTiles: Uint8Array;
  framePalette: Uint16Array;
  windowSpriteTiles: Uint8Array;
  unused: Uint8Array;
  tileLoadState: number;
}

export interface MonMarkingsRuntime {
  menu: MonMarkingsMenu | null;
  sprites: MonMarkingsSprite[];
  nextSpriteId: number;
  nextCreateSpriteResult: number | null;
  joyNew: number;
  optionsWindowFrameType: number;
  userWindowGraphics: Array<{ tiles: Uint8Array; palette: Uint16Array }>;
  monMarkingsMenuGfx: Uint8Array;
  monMarkingsMenuPal: Uint16Array;
  monMarkingsGfx: Uint8Array;
  monMarkingsPal: Uint16Array;
  loadedSpriteSheets: Array<{ data: Uint8Array; size: number; tag: number }>;
  loadedSpritePalettes: Array<{ data: Uint16Array; tag: number }>;
  freedTileTags: number[];
  freedPaletteTags: number[];
  destroyedSpriteIds: number[];
  playedSounds: number[];
  dma3Copies: Array<{ src: Uint8Array; dest: Uint8Array; size: number; mode: string }>;
}

export const SE_SELECT = 5;

const rangeBytes = (length: number, offset = 0): Uint8Array =>
  Uint8Array.from(Array.from({ length }, (_, i) => (i + offset) & 0xff));

const rangePal = (length: number, offset = 0): Uint16Array =>
  Uint16Array.from(Array.from({ length }, (_, i) => (i + offset) & 0xffff));

export const createMonMarkingsMenu = (
  baseTileTag = 0,
  basePaletteTag = 0
): MonMarkingsMenu => ({
  baseTileTag,
  basePaletteTag,
  markings: 0,
  cursorPos: 0,
  markingsArray: Array(NUM_MON_MARKINGS).fill(0),
  cursorBaseY: 0,
  spriteSheetLoadRequired: false,
  windowSprites: [null, null],
  markingSprites: Array(NUM_MON_MARKINGS).fill(null),
  cursorSprite: null,
  textSprite: null,
  frameTiles: new Uint8Array(TILE_SIZE_4BPP * 9),
  framePalette: new Uint16Array(16),
  windowSpriteTiles: new Uint8Array(0x1000),
  unused: new Uint8Array(0x80),
  tileLoadState: 0
});

export const createMonMarkingsRuntime = (
  overrides: Partial<MonMarkingsRuntime> = {}
): MonMarkingsRuntime => ({
  menu: overrides.menu ?? null,
  sprites: overrides.sprites ?? [],
  nextSpriteId: overrides.nextSpriteId ?? 0,
  nextCreateSpriteResult: overrides.nextCreateSpriteResult ?? null,
  joyNew: overrides.joyNew ?? 0,
  optionsWindowFrameType: overrides.optionsWindowFrameType ?? 0,
  userWindowGraphics: overrides.userWindowGraphics ?? [
    { tiles: rangeBytes(TILE_SIZE_4BPP * 9), palette: rangePal(16) }
  ],
  monMarkingsMenuGfx: overrides.monMarkingsMenuGfx ?? rangeBytes(0x320, 0x40),
  monMarkingsMenuPal: overrides.monMarkingsMenuPal ?? rangePal(16, 0x20),
  monMarkingsGfx: overrides.monMarkingsGfx ?? rangeBytes(16 * 0x80, 0x80),
  monMarkingsPal: overrides.monMarkingsPal ?? rangePal(16, 0x40),
  loadedSpriteSheets: overrides.loadedSpriteSheets ?? [],
  loadedSpritePalettes: overrides.loadedSpritePalettes ?? [],
  freedTileTags: overrides.freedTileTags ?? [],
  freedPaletteTags: overrides.freedPaletteTags ?? [],
  destroyedSpriteIds: overrides.destroyedSpriteIds ?? [],
  playedSounds: overrides.playedSounds ?? [],
  dma3Copies: overrides.dma3Copies ?? []
});

const activeMenu = (runtime: MonMarkingsRuntime): MonMarkingsMenu => {
  if (runtime.menu === null) {
    throw new Error('Mon markings menu has not been initialized');
  }
  return runtime.menu;
};

const cpuFastCopy = (src: Uint8Array, srcOffset: number, dest: Uint8Array, destOffset: number, size: number): void => {
  dest.set(src.subarray(srcOffset, srcOffset + size), destOffset);
};

const createSprite = (
  runtime: MonMarkingsRuntime,
  tileTag: number,
  paletteTag: number,
  callback: MonMarkingsSpriteCallback,
  x: number,
  y: number,
  priority: number,
  shape = '64x64',
  size = '64x64'
): number => {
  if (runtime.nextCreateSpriteResult !== null) {
    const result = runtime.nextCreateSpriteResult;
    runtime.nextCreateSpriteResult = null;
    if (result === MAX_SPRITES) {
      return MAX_SPRITES;
    }
  }
  if (runtime.nextSpriteId >= MAX_SPRITES) {
    return MAX_SPRITES;
  }

  const id = runtime.nextSpriteId++;
  runtime.sprites[id] = {
    id,
    x,
    y,
    priority,
    tileTag,
    paletteTag,
    animNum: 0,
    shape,
    size,
    data: Array(8).fill(0),
    destroyed: false,
    callback
  };
  return id;
};

const startSpriteAnim = (sprite: MonMarkingsSprite, animNum: number): void => {
  sprite.animNum = animNum & 0xff;
};

const loadSpriteSheet = (
  runtime: MonMarkingsRuntime,
  sheet: { data: Uint8Array; size: number; tag: number }
): void => {
  runtime.loadedSpriteSheets.push({ data: sheet.data, size: sheet.size, tag: sheet.tag & 0xffff });
};

const loadSpritePalette = (
  runtime: MonMarkingsRuntime,
  palette: { data: Uint16Array; tag: number }
): void => {
  runtime.loadedSpritePalettes.push({ data: palette.data, tag: palette.tag & 0xffff });
};

const freeSpriteTilesByTag = (runtime: MonMarkingsRuntime, tag: number): void => {
  runtime.freedTileTags.push(tag & 0xffff);
};

const freeSpritePaletteByTag = (runtime: MonMarkingsRuntime, tag: number): void => {
  runtime.freedPaletteTags.push(tag & 0xffff);
};

const destroySprite = (runtime: MonMarkingsRuntime, sprite: MonMarkingsSprite): void => {
  sprite.destroyed = true;
  runtime.destroyedSpriteIds.push(sprite.id);
};

const playSE = (runtime: MonMarkingsRuntime, song: number): void => {
  runtime.playedSounds.push(song);
};

export function InitMonMarkingsMenu(
  runtime: MonMarkingsRuntime,
  ptr: MonMarkingsMenu
): void {
  runtime.menu = ptr;
}

export function BufferMenuWindowTiles(runtime: MonMarkingsRuntime): void {
  const menu = activeMenu(runtime);
  const frame = runtime.userWindowGraphics[runtime.optionsWindowFrameType];
  menu.frameTiles = frame.tiles;
  menu.framePalette = frame.palette;
  menu.tileLoadState = 0;
  menu.windowSpriteTiles.fill(0);
}

export function BufferMenuFrameTiles(runtime: MonMarkingsRuntime): boolean {
  const menu = activeMenu(runtime);
  const destOffset = menu.tileLoadState * 0x100;

  switch (menu.tileLoadState) {
    case 0:
      cpuFastCopy(menu.frameTiles, 0, menu.windowSpriteTiles, destOffset, TILE_SIZE_4BPP);
      for (let i = 0; i < 6; i += 1) {
        cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP, menu.windowSpriteTiles, destOffset + TILE_SIZE_4BPP * (i + 1), TILE_SIZE_4BPP);
      }
      cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 2, menu.windowSpriteTiles, destOffset + TILE_SIZE_4BPP * 7, TILE_SIZE_4BPP);
      menu.tileLoadState += 1;
      break;
    case 13:
      cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 6, menu.windowSpriteTiles, destOffset, TILE_SIZE_4BPP);
      for (let i = 0; i < 6; i += 1) {
        cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 7, menu.windowSpriteTiles, destOffset + TILE_SIZE_4BPP * (i + 1), TILE_SIZE_4BPP);
      }
      cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 8, menu.windowSpriteTiles, destOffset + TILE_SIZE_4BPP * 7, TILE_SIZE_4BPP);
      menu.tileLoadState += 1;
      return false;
    case 14:
      return false;
    default:
      cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 3, menu.windowSpriteTiles, destOffset, TILE_SIZE_4BPP);
      for (let i = 0; i < 6; i += 1) {
        cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 4, menu.windowSpriteTiles, destOffset + TILE_SIZE_4BPP * (i + 1), TILE_SIZE_4BPP);
      }
      cpuFastCopy(menu.frameTiles, TILE_SIZE_4BPP * 5, menu.windowSpriteTiles, destOffset + TILE_SIZE_4BPP * 7, TILE_SIZE_4BPP);
      menu.tileLoadState += 1;
      break;
  }
  return true;
}

export function BufferMonMarkingsMenuTiles(runtime: MonMarkingsRuntime): void {
  BufferMenuWindowTiles(runtime);
  while (BufferMenuFrameTiles(runtime));
}

export function OpenMonMarkingsMenu(
  runtime: MonMarkingsRuntime,
  markings: number,
  x: number,
  y: number
): void {
  const menu = activeMenu(runtime);
  menu.cursorPos = 0;
  menu.markings = markings & 0xff;
  for (let i = 0; i < NUM_MON_MARKINGS; i += 1) {
    menu.markingsArray[i] = (menu.markings >> i) & 1;
  }
  CreateMonMarkingsMenuSprites(runtime, x << 16 >> 16, y << 16 >> 16, menu.baseTileTag, menu.basePaletteTag);
}

export function FreeMonMarkingsMenu(runtime: MonMarkingsRuntime): void {
  const menu = activeMenu(runtime);
  for (let i = 0; i < 3; i += 1) {
    freeSpriteTilesByTag(runtime, menu.baseTileTag + i);
  }
  freeSpritePaletteByTag(runtime, menu.basePaletteTag);
  freeSpritePaletteByTag(runtime, menu.basePaletteTag + 1);
  for (let i = 0; i < menu.windowSprites.length; i += 1) {
    const sprite = menu.windowSprites[i];
    if (sprite === null) {
      return;
    }
    destroySprite(runtime, sprite);
  }
  for (let i = 0; i < NUM_MON_MARKINGS; i += 1) {
    const sprite = menu.markingSprites[i];
    if (sprite === null) {
      return;
    }
    destroySprite(runtime, sprite);
  }
  if (menu.cursorSprite !== null) {
    destroySprite(runtime, menu.cursorSprite);
  }
  if (menu.textSprite !== null) {
    destroySprite(runtime, menu.textSprite);
  }
}

export function HandleMonMarkingsMenuInput(runtime: MonMarkingsRuntime): boolean {
  const menu = activeMenu(runtime);
  if (runtime.joyNew & DPAD_UP) {
    playSE(runtime, SE_SELECT);
    menu.cursorPos -= 1;
    if (menu.cursorPos < 0) {
      menu.cursorPos = SELECTION_CANCEL;
    }
    return true;
  }

  if (runtime.joyNew & DPAD_DOWN) {
    playSE(runtime, SE_SELECT);
    menu.cursorPos += 1;
    if (menu.cursorPos > SELECTION_CANCEL) {
      menu.cursorPos = 0;
    }
    return true;
  }

  if (runtime.joyNew & A_BUTTON) {
    playSE(runtime, SE_SELECT);
    switch (menu.cursorPos) {
      case SELECTION_OK:
        menu.markings = 0;
        for (let i = 0; i < NUM_MON_MARKINGS; i += 1) {
          menu.markings |= menu.markingsArray[i] << i;
        }
        return false;
      case SELECTION_CANCEL:
        return false;
      default:
        menu.markingsArray[menu.cursorPos] = menu.markingsArray[menu.cursorPos] ? 0 : 1;
        return true;
    }
  }

  if (runtime.joyNew & B_BUTTON) {
    playSE(runtime, SE_SELECT);
    return false;
  }

  return true;
}

export function CreateMonMarkingsMenuSprites(
  runtime: MonMarkingsRuntime,
  x: number,
  y: number,
  baseTileTag: number,
  basePaletteTag: number
): void {
  const menu = activeMenu(runtime);
  loadSpriteSheet(runtime, { data: menu.windowSpriteTiles, size: 0x1000, tag: baseTileTag });
  loadSpriteSheet(runtime, { data: runtime.monMarkingsMenuGfx, size: 0x320, tag: baseTileTag + 1 });
  loadSpritePalette(runtime, { data: menu.framePalette, tag: basePaletteTag });
  loadSpritePalette(runtime, { data: runtime.monMarkingsMenuPal, tag: basePaletteTag + 1 });

  for (let i = 0; i < menu.windowSprites.length; i += 1) {
    const spriteId = createSprite(runtime, baseTileTag, basePaletteTag, SpriteCB_Dummy, x + 32, y + 32, 1);
    if (spriteId !== MAX_SPRITES) {
      menu.windowSprites[i] = runtime.sprites[spriteId];
      startSpriteAnim(runtime.sprites[spriteId], i);
    } else {
      menu.windowSprites[i] = null;
      return;
    }
  }
  (menu.windowSprites[1] as MonMarkingsSprite).y = y + 96;

  for (let i = 0; i < NUM_MON_MARKINGS; i += 1) {
    const spriteId = createSprite(runtime, baseTileTag + 1, basePaletteTag + 1, SpriteCB_Marking, x + 32, y + 16 + 16 * i, 0, '8x8', '8x8');
    if (spriteId !== MAX_SPRITES) {
      menu.markingSprites[i] = runtime.sprites[spriteId];
      runtime.sprites[spriteId].data[0] = i;
    } else {
      menu.markingSprites[i] = null;
      return;
    }
  }

  let spriteId = createSprite(runtime, baseTileTag + 1, basePaletteTag + 1, spriteCallbackDummy, 0, 0, 0, '8x8', '8x8');
  if (spriteId !== MAX_SPRITES) {
    menu.textSprite = runtime.sprites[spriteId];
    menu.textSprite.shape = '32x32';
    menu.textSprite.size = '32x32';
    startSpriteAnim(menu.textSprite, ANIM_TEXT);
    menu.textSprite.x = x + 32;
    menu.textSprite.y = y + 80;
    menu.textSprite.centerToCornerVec = {
      shape: '32x16',
      size: '32x16',
      affineMode: 'off'
    };
  } else {
    menu.textSprite = null;
  }

  spriteId = createSprite(runtime, baseTileTag + 1, basePaletteTag + 1, SpriteCB_Cursor, x + 12, 0, 0, '8x8', '8x8');
  if (spriteId !== MAX_SPRITES) {
    menu.cursorSprite = runtime.sprites[spriteId];
    menu.cursorSprite.data[0] = y + 16;
    startSpriteAnim(menu.cursorSprite, ANIM_CURSOR);
  } else {
    menu.cursorSprite = null;
  }
}

export function SpriteCB_Dummy(_runtime: MonMarkingsRuntime, _sprite: MonMarkingsSprite): void {}
export const spriteCallbackDummy = SpriteCB_Dummy;

export function SpriteCB_Marking(runtime: MonMarkingsRuntime, sprite: MonMarkingsSprite): void {
  const menu = activeMenu(runtime);
  if (menu.markingsArray[sprite.data[0]]) {
    startSpriteAnim(sprite, 2 * sprite.data[0] + 1);
  } else {
    startSpriteAnim(sprite, 2 * sprite.data[0]);
  }
}

export function SpriteCB_Cursor(runtime: MonMarkingsRuntime, sprite: MonMarkingsSprite): void {
  const menu = activeMenu(runtime);
  sprite.y = 16 * menu.cursorPos + sprite.data[0];
}

const createMarkingComboSprite = (
  runtime: MonMarkingsRuntime,
  tileTag: number,
  paletteTag: number,
  palette: Uint16Array | null,
  size: number
): MonMarkingsSprite | null => {
  const selectedPalette = palette ?? runtime.monMarkingsPal;
  loadSpriteSheet(runtime, { data: runtime.monMarkingsGfx, size: size * 0x80, tag: tileTag });
  loadSpritePalette(runtime, { data: selectedPalette, tag: paletteTag });
  const spriteId = createSprite(runtime, tileTag, paletteTag, SpriteCB_Dummy, 0, 0, 0, '32x8', '32x8');
  return spriteId !== MAX_SPRITES ? runtime.sprites[spriteId] : null;
};

export const CreateMarkingComboSprite = createMarkingComboSprite;

export const CreateMonMarkingAllCombosSprite = (
  runtime: MonMarkingsRuntime,
  tileTag: number,
  paletteTag: number,
  palette: Uint16Array | null
): MonMarkingsSprite | null =>
  createMarkingComboSprite(runtime, tileTag, paletteTag, palette, 1 << NUM_MON_MARKINGS);

export const CreateMonMarkingComboSprite = (
  runtime: MonMarkingsRuntime,
  tileTag: number,
  paletteTag: number,
  palette: Uint16Array | null
): MonMarkingsSprite | null => createMarkingComboSprite(runtime, tileTag, paletteTag, palette, 1);

export function UpdateMonMarkingTiles(
  runtime: MonMarkingsRuntime,
  markings: number,
  dest: Uint8Array
): void {
  const src = runtime.monMarkingsGfx.subarray(0x80 * (markings & 0xff), 0x80 * (markings & 0xff) + 0x80);
  dest.set(src);
  runtime.dma3Copies.push({ src, dest, size: 0x80, mode: 'DMA3_32BIT' });
}
