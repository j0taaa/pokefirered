export const ITEMICON_TILES = 0;
export const ITEMICON_PAL = 1;

export const ITEM_NONE = 0;
export const ITEMS_COUNT = 375;
export const MAX_SPRITES = 64;
export const SPRITE_NONE = 0xff;

export const POCKET_ITEMS = 1;
export const POCKET_KEY_ITEMS = 2;
export const POCKET_POKE_BALLS = 4;

export const TAG_BAG = 100;
export const TAG_SWAP_LINE = 101;
export const TAG_ITEM_ICON = 102;
export const TAG_ITEM_ICON_ALT = 103;

export const NUM_SWAP_LINE_SPRITES = 9;

export const SPR_BAG = 0;
export const SPR_SWAP_LINE_START = 1;
export const SPR_ITEM_ICON = SPR_SWAP_LINE_START + NUM_SWAP_LINE_SPRITES;
export const SPR_ITEM_ICON_ALT = SPR_ITEM_ICON + 1;
export const SPR_COUNT = SPR_ITEM_ICON_ALT + 1;

export const ANIM_SWAP_LINE_START = 0;
export const ANIM_SWAP_LINE_MID = 1;
export const ANIM_SWAP_LINE_END = 2;

export const AFFINEANIM_BAG_IDLE = 0;
export const AFFINEANIM_BAG_SHAKE = 1;

export type SpriteCallback = (runtime: ItemMenuIconsRuntime, sprite: ItemMenuIconSprite) => void;

export interface SpriteTemplate {
  tileTag: number;
  paletteTag: number;
  callback: SpriteCallback;
  name?: string;
}

export interface ItemMenuIconSprite {
  id: number;
  template: SpriteTemplate;
  x: number;
  y: number;
  x2: number;
  y2: number;
  animNum: number;
  affineAnimNum: number;
  affineAnimEnded: boolean;
  invisible: boolean;
  destroyed: boolean;
  callback: SpriteCallback;
}

export interface SpriteSheet {
  data: Uint8Array;
  size: number;
  tag: number;
}

export interface CompressedSpritePalette {
  data: Uint8Array;
  tag: number;
}

export interface ItemMenuIconsRuntime {
  itemMenuIconSpriteIds: Uint8Array;
  itemIconTilesBuffer: Uint8Array | null;
  itemIconTilesBufferPadded: Uint8Array | null;
  itemIconTable: Array<[Uint8Array, Uint8Array]>;
  sprites: ItemMenuIconSprite[];
  nextSpriteId: number;
  allocationsFail: boolean;
  loadedSpriteSheets: SpriteSheet[];
  loadedCompressedSpritePalettes: CompressedSpritePalette[];
  freedTileTags: number[];
  freedPaletteTags: number[];
  freedBuffers: Uint8Array[];
  lzDecompressWram: (src: Uint8Array, dest: Uint8Array) => void;
}

export const spriteCallbackDummy: SpriteCallback = () => undefined;

export function SpriteCB_BagVisualSwitchingPockets(_runtime: ItemMenuIconsRuntime, sprite: ItemMenuIconSprite): void {
  if (sprite.y2 !== 0) {
    sprite.y2 += 1;
  } else {
    sprite.callback = spriteCallbackDummy;
  }
}

export function SpriteCB_ShakeBagSprite(_runtime: ItemMenuIconsRuntime, sprite: ItemMenuIconSprite): void {
  if (sprite.affineAnimEnded) {
    startSpriteAffineAnim(sprite, AFFINEANIM_BAG_IDLE);
    sprite.callback = spriteCallbackDummy;
  }
}

export const spriteCB_BagVisualSwitchingPockets: SpriteCallback = SpriteCB_BagVisualSwitchingPockets;
export const spriteCB_ShakeBagSprite: SpriteCallback = SpriteCB_ShakeBagSprite;

export const sSpriteTemplate_Bag: SpriteTemplate = {
  tileTag: TAG_BAG,
  paletteTag: TAG_BAG,
  callback: spriteCallbackDummy,
  name: 'Bag'
};

export const sSpriteTemplate_SwapLine: SpriteTemplate = {
  tileTag: TAG_SWAP_LINE,
  paletteTag: TAG_SWAP_LINE,
  callback: spriteCallbackDummy,
  name: 'SwapLine'
};

export const sSpriteTemplate_ItemIcon: SpriteTemplate = {
  tileTag: TAG_ITEM_ICON,
  paletteTag: TAG_ITEM_ICON,
  callback: spriteCallbackDummy,
  name: 'ItemIcon'
};

const defaultItemIconTable = (): Array<[Uint8Array, Uint8Array]> =>
  Array.from({ length: ITEMS_COUNT + 1 }, (_, itemId) => [
    Uint8Array.of(itemId & 0xff),
    Uint8Array.of((itemId + 1) & 0xff)
  ]);

const defaultLzDecompressWram = (src: Uint8Array, dest: Uint8Array): void => {
  dest.fill(0);
  dest.set(src.subarray(0, dest.length));
};

export const createItemMenuIconsRuntime = (
  overrides: Partial<ItemMenuIconsRuntime> = {}
): ItemMenuIconsRuntime => ({
  itemMenuIconSpriteIds: overrides.itemMenuIconSpriteIds ?? new Uint8Array(SPR_COUNT).fill(SPRITE_NONE),
  itemIconTilesBuffer: overrides.itemIconTilesBuffer ?? null,
  itemIconTilesBufferPadded: overrides.itemIconTilesBufferPadded ?? null,
  itemIconTable: overrides.itemIconTable ?? defaultItemIconTable(),
  sprites: overrides.sprites ?? [],
  nextSpriteId: overrides.nextSpriteId ?? 0,
  allocationsFail: overrides.allocationsFail ?? false,
  loadedSpriteSheets: overrides.loadedSpriteSheets ?? [],
  loadedCompressedSpritePalettes: overrides.loadedCompressedSpritePalettes ?? [],
  freedTileTags: overrides.freedTileTags ?? [],
  freedPaletteTags: overrides.freedPaletteTags ?? [],
  freedBuffers: overrides.freedBuffers ?? [],
  lzDecompressWram: overrides.lzDecompressWram ?? defaultLzDecompressWram
});

export function ResetItemMenuIconState(runtime: ItemMenuIconsRuntime): void {
  for (let i = 0; i < SPR_COUNT; i += 1) {
    runtime.itemMenuIconSpriteIds[i] = SPRITE_NONE;
  }
}

const cloneTemplate = (template: SpriteTemplate): SpriteTemplate => ({ ...template });

const createSprite = (
  runtime: ItemMenuIconsRuntime,
  template: SpriteTemplate,
  x: number,
  y: number,
  _priority: number
): number => {
  if (runtime.nextSpriteId >= MAX_SPRITES) {
    return MAX_SPRITES;
  }

  const id = runtime.nextSpriteId++;
  runtime.sprites[id] = {
    id,
    template: cloneTemplate(template),
    x,
    y,
    x2: 0,
    y2: 0,
    animNum: 0,
    affineAnimNum: AFFINEANIM_BAG_IDLE,
    affineAnimEnded: true,
    invisible: false,
    destroyed: false,
    callback: template.callback
  };
  return id;
};

const spriteAt = (runtime: ItemMenuIconsRuntime, spriteId: number): ItemMenuIconSprite =>
  runtime.sprites[spriteId];

const startSpriteAnim = (sprite: ItemMenuIconSprite, animNum: number): void => {
  sprite.animNum = animNum & 0xff;
};

export const startSpriteAffineAnim = (sprite: ItemMenuIconSprite, animNum: number): void => {
  sprite.affineAnimNum = animNum & 0xff;
  sprite.affineAnimEnded = false;
};

const freeSpriteTilesByTag = (runtime: ItemMenuIconsRuntime, tag: number): void => {
  runtime.freedTileTags.push(tag & 0xffff);
};

const freeSpritePaletteByTag = (runtime: ItemMenuIconsRuntime, tag: number): void => {
  runtime.freedPaletteTags.push(tag & 0xffff);
};

const loadSpriteSheet = (runtime: ItemMenuIconsRuntime, spriteSheet: SpriteSheet): void => {
  runtime.loadedSpriteSheets.push({
    data: Uint8Array.from(spriteSheet.data),
    size: spriteSheet.size,
    tag: spriteSheet.tag
  });
};

const loadCompressedSpritePalette = (
  runtime: ItemMenuIconsRuntime,
  spritePalette: CompressedSpritePalette
): void => {
  runtime.loadedCompressedSpritePalettes.push({
    data: spritePalette.data,
    tag: spritePalette.tag
  });
};

const destroySpriteAndFreeResources = (
  runtime: ItemMenuIconsRuntime,
  sprite: ItemMenuIconSprite
): void => {
  sprite.destroyed = true;
  freeSpriteTilesByTag(runtime, sprite.template.tileTag);
  freeSpritePaletteByTag(runtime, sprite.template.paletteTag);
};

export function CreateBagSprite(runtime: ItemMenuIconsRuntime, animNum: number): void {
  runtime.itemMenuIconSpriteIds[SPR_BAG] = createSprite(runtime, sSpriteTemplate_Bag, 40, 68, 0);
  SetBagVisualPocketId(runtime, animNum);
}

export function SetBagVisualPocketId(runtime: ItemMenuIconsRuntime, animNum: number): void {
  const sprite = spriteAt(runtime, runtime.itemMenuIconSpriteIds[SPR_BAG]);
  sprite.y2 = -5;
  sprite.callback = SpriteCB_BagVisualSwitchingPockets;
  startSpriteAnim(sprite, animNum);
}

export function ShakeBagSprite(runtime: ItemMenuIconsRuntime): void {
  const sprite = spriteAt(runtime, runtime.itemMenuIconSpriteIds[SPR_BAG]);
  if (sprite.affineAnimEnded) {
    startSpriteAffineAnim(sprite, AFFINEANIM_BAG_SHAKE);
    sprite.callback = SpriteCB_ShakeBagSprite;
  }
}

export function CreateSwapLine(runtime: ItemMenuIconsRuntime): void {
  for (let i = 0; i < NUM_SWAP_LINE_SPRITES; i += 1) {
    const spriteId = createSprite(runtime, sSpriteTemplate_SwapLine, i * 16 + 96, 7, 0);
    runtime.itemMenuIconSpriteIds[SPR_SWAP_LINE_START + i] = spriteId;
    switch (i) {
      case 0:
        break;
      case NUM_SWAP_LINE_SPRITES - 1:
        startSpriteAnim(spriteAt(runtime, spriteId), ANIM_SWAP_LINE_END);
        break;
      default:
        startSpriteAnim(spriteAt(runtime, spriteId), ANIM_SWAP_LINE_MID);
        break;
    }
    spriteAt(runtime, spriteId).invisible = true;
  }
}

export function SetSwapLineInvisibility(
  runtime: ItemMenuIconsRuntime,
  invisible: boolean
): void {
  for (let i = 0; i < NUM_SWAP_LINE_SPRITES; i += 1) {
    spriteAt(runtime, runtime.itemMenuIconSpriteIds[SPR_SWAP_LINE_START + i]).invisible = invisible;
  }
}

export function UpdateSwapLinePos(
  runtime: ItemMenuIconsRuntime,
  x: number,
  y: number
): void {
  for (let i = 0; i < NUM_SWAP_LINE_SPRITES; i += 1) {
    const sprite = spriteAt(runtime, runtime.itemMenuIconSpriteIds[SPR_SWAP_LINE_START + i]);
    sprite.x2 = x << 16 >> 16;
    sprite.y = (y & 0xffff) + 7;
  }
}

const alloc = (runtime: ItemMenuIconsRuntime, size: number, zeroed: boolean): Uint8Array | null => {
  if (runtime.allocationsFail) {
    return null;
  }
  const buffer = new Uint8Array(size);
  if (!zeroed) {
    buffer.fill(0xcd);
  }
  return buffer;
};

const free = (runtime: ItemMenuIconsRuntime, buffer: Uint8Array | null): void => {
  if (buffer !== null) {
    runtime.freedBuffers.push(buffer);
  }
};

export function TryAllocItemIconTilesBuffers(runtime: ItemMenuIconsRuntime): boolean {
  runtime.itemIconTilesBuffer = alloc(runtime, 0x120, false);
  if (runtime.itemIconTilesBuffer === null) {
    return false;
  }

  runtime.itemIconTilesBufferPadded = alloc(runtime, 0x200, true);
  if (runtime.itemIconTilesBufferPadded === null) {
    free(runtime, runtime.itemIconTilesBuffer);
    runtime.itemIconTilesBuffer = null;
    return false;
  }
  return true;
}

export function CopyItemIconPicTo4x4Buffer(src: Uint8Array, dest: Uint8Array): void {
  for (let i = 0; i < 3; i += 1) {
    dest.set(src.subarray(0x60 * i, 0x60 * i + 0x60), 0x80 * i);
  }
}

const addItemIconObjectWithTemplate = (
  runtime: ItemMenuIconsRuntime,
  origTemplate: SpriteTemplate,
  tilesTag: number,
  paletteTag: number,
  itemId: number
): number => {
  if (!TryAllocItemIconTilesBuffers(runtime)) {
    return MAX_SPRITES;
  }

  runtime.lzDecompressWram(
    getItemIconGfxPtr(runtime, itemId, ITEMICON_TILES),
    runtime.itemIconTilesBuffer as Uint8Array
  );
  CopyItemIconPicTo4x4Buffer(
    runtime.itemIconTilesBuffer as Uint8Array,
    runtime.itemIconTilesBufferPadded as Uint8Array
  );
  loadSpriteSheet(runtime, {
    data: runtime.itemIconTilesBufferPadded as Uint8Array,
    size: 0x200,
    tag: tilesTag & 0xffff
  });

  loadCompressedSpritePalette(runtime, {
    data: getItemIconGfxPtr(runtime, itemId, ITEMICON_PAL),
    tag: paletteTag & 0xffff
  });

  const template = cloneTemplate(origTemplate);
  template.tileTag = tilesTag & 0xffff;
  template.paletteTag = paletteTag & 0xffff;
  const spriteId = createSprite(runtime, template, 0, 0, 0);

  free(runtime, runtime.itemIconTilesBuffer);
  free(runtime, runtime.itemIconTilesBufferPadded);
  runtime.itemIconTilesBuffer = null;
  runtime.itemIconTilesBufferPadded = null;
  return spriteId;
};

export function AddItemIconObject(
  runtime: ItemMenuIconsRuntime,
  tilesTag: number,
  paletteTag: number,
  itemId: number
): number {
  return addItemIconObjectWithTemplate(runtime, sSpriteTemplate_ItemIcon, tilesTag, paletteTag, itemId);
}

export function AddItemIconObjectWithCustomObjectTemplate(
  runtime: ItemMenuIconsRuntime,
  origTemplate: SpriteTemplate,
  tilesTag: number,
  paletteTag: number,
  itemId: number
): number {
  return addItemIconObjectWithTemplate(runtime, origTemplate, tilesTag, paletteTag, itemId);
}

export function CreateItemMenuIcon(
  runtime: ItemMenuIconsRuntime,
  itemId: number,
  idx: number
): void {
  const spriteIndex = SPR_ITEM_ICON + idx;
  if (runtime.itemMenuIconSpriteIds[spriteIndex] === SPRITE_NONE) {
    freeSpriteTilesByTag(runtime, TAG_ITEM_ICON + idx);
    freeSpritePaletteByTag(runtime, TAG_ITEM_ICON + idx);
    const spriteId = AddItemIconObject(runtime, TAG_ITEM_ICON + idx, TAG_ITEM_ICON + idx, itemId);
    if (spriteId !== MAX_SPRITES) {
      runtime.itemMenuIconSpriteIds[spriteIndex] = spriteId;
      spriteAt(runtime, spriteId).x2 = 24;
      spriteAt(runtime, spriteId).y2 = 140;
    }
  }
}

export function DestroyItemMenuIcon(runtime: ItemMenuIconsRuntime, idx: number): void {
  const spriteIndex = SPR_ITEM_ICON + idx;
  const spriteId = runtime.itemMenuIconSpriteIds[spriteIndex];
  if (spriteId !== SPRITE_NONE) {
    destroySpriteAndFreeResources(runtime, spriteAt(runtime, spriteId));
    runtime.itemMenuIconSpriteIds[spriteIndex] = SPRITE_NONE;
  }
}

export const getItemIconGfxPtr = (
  runtime: ItemMenuIconsRuntime,
  itemId: number,
  attrId: number
): Uint8Array => {
  const clampedItemId = itemId > ITEMS_COUNT ? ITEM_NONE : itemId;
  return runtime.itemIconTable[clampedItemId]?.[attrId] ?? runtime.itemIconTable[ITEM_NONE][attrId];
};

export function CreateBerryPouchItemIcon(
  runtime: ItemMenuIconsRuntime,
  itemId: number,
  idx: number
): void {
  const spriteIndex = SPR_ITEM_ICON + idx;
  if (runtime.itemMenuIconSpriteIds[spriteIndex] === SPRITE_NONE) {
    freeSpriteTilesByTag(runtime, TAG_ITEM_ICON + idx);
    freeSpritePaletteByTag(runtime, TAG_ITEM_ICON + idx);
    const spriteId = AddItemIconObject(runtime, TAG_ITEM_ICON + idx, TAG_ITEM_ICON + idx, itemId);
    if (spriteId !== MAX_SPRITES) {
      runtime.itemMenuIconSpriteIds[spriteIndex] = spriteId;
      spriteAt(runtime, spriteId).x2 = 24;
      spriteAt(runtime, spriteId).y2 = 147;
    }
  }
}

export const resetItemMenuIconState = ResetItemMenuIconState;
export const createBagSprite = CreateBagSprite;
export const setBagVisualPocketId = SetBagVisualPocketId;
export const shakeBagSprite = ShakeBagSprite;
export const createSwapLine = CreateSwapLine;
export const setSwapLineInvisibility = SetSwapLineInvisibility;
export const updateSwapLinePos = UpdateSwapLinePos;
export const tryAllocItemIconTilesBuffers = TryAllocItemIconTilesBuffers;
export const copyItemIconPicTo4x4Buffer = CopyItemIconPicTo4x4Buffer;
export const addItemIconObject = AddItemIconObject;
export const addItemIconObjectWithCustomObjectTemplate = AddItemIconObjectWithCustomObjectTemplate;
export const createItemMenuIcon = CreateItemMenuIcon;
export const destroyItemMenuIcon = DestroyItemMenuIcon;
export const GetItemIconGfxPtr = getItemIconGfxPtr;
export const createBerryPouchItemIcon = CreateBerryPouchItemIcon;
