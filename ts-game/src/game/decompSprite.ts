import { gSineTable } from './decompTrig';

export const MAX_SPRITES = 64;
export const MAX_SPRITE_COPY_REQUESTS = 64;
export const OAM_MATRIX_COUNT = 32;
export const TOTAL_OBJ_TILE_COUNT = 1024;
export const TILE_SIZE_4BPP = 32;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;
export const OBJ_PLTT_OFFSET = 0x100;
export const PLTT_SIZE_4BPP = 0x20;
export const TAG_NONE = 0xffff;
export const ANIM_END = 0xffff;
export const AFFINE_ANIM_END = 0x7fff;
export const NO_ANCHOR = 0x7fff;

export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const ST_OAM_AFFINE_DOUBLE = 3;
export const ST_OAM_AFFINE_ON_MASK = 1;
export const ST_OAM_AFFINE_DOUBLE_MASK = 2;
export const ST_OAM_SQUARE = 0;
export const ST_OAM_H_RECTANGLE = 1;
export const ST_OAM_V_RECTANGLE = 2;
export const ST_OAM_SIZE_0 = 0;
export const ST_OAM_SIZE_1 = 1;
export const ST_OAM_SIZE_2 = 2;
export const ST_OAM_SIZE_3 = 3;
export const SUBSPRITES_OFF = 0;
export const SUBSPRITES_ON = 1;
export const SUBSPRITES_IGNORE_PRIORITY = 2;

export type SpriteCallback = (runtime: SpriteRuntime, sprite: Sprite) => void;

export interface OamData {
  y: number;
  affineMode: number;
  objMode: number;
  mosaic: boolean;
  bpp: number;
  shape: number;
  x: number;
  matrixNum: number;
  size: number;
  tileNum: number;
  priority: number;
  paletteNum: number;
  affineParam: number;
}

export interface OamMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface SpriteFrameImage {
  data: string;
  size: number;
}

export type AnimCmd =
  | { type: 'frame'; imageValue: number; duration: number; hFlip?: number; vFlip?: number }
  | { type: 'loop'; count: number }
  | { type: 'jump'; target: number }
  | { type: 'end' };

export interface AffineAnimFrameCmd {
  xScale: number;
  yScale: number;
  rotation: number;
  duration: number;
}

export type AffineAnimCmd =
  | ({ type: 'frame' } & AffineAnimFrameCmd)
  | { type: 'loop'; count: number }
  | { type: 'jump'; target: number }
  | { type: 'end' };

export interface SpriteTemplate {
  tileTag: number;
  paletteTag: number;
  oam: OamData;
  anims: AnimCmd[][];
  images: SpriteFrameImage[] | null;
  affineAnims: AffineAnimCmd[][];
  callback: SpriteCallback;
}

export interface Subsprite {
  x: number;
  y: number;
  shape: number;
  size: number;
  tileOffset: number;
  priority: number;
}

export interface SubspriteTable {
  subspriteCount: number;
  subsprites: Subsprite[] | null;
}

export interface Sprite {
  oam: OamData;
  anims: AnimCmd[][];
  affineAnims: AffineAnimCmd[][];
  template: SpriteTemplate;
  callback: SpriteCallback;
  x: number;
  y: number;
  x2: number;
  y2: number;
  centerToCornerVecX: number;
  centerToCornerVecY: number;
  subpriority: number;
  inUse: boolean;
  invisible: boolean;
  coordOffsetEnabled: boolean;
  animBeginning: boolean;
  affineAnimBeginning: boolean;
  usingSheet: boolean;
  images: SpriteFrameImage[] | null;
  sheetTileStart: number;
  animNum: number;
  animCmdIndex: number;
  animDelayCounter: number;
  animLoopCounter: number;
  animEnded: boolean;
  animPaused: boolean;
  affineAnimEnded: boolean;
  affineAnimPaused: boolean;
  hFlip: number;
  vFlip: number;
  anchored: boolean;
  data: number[];
  subspriteTables: SubspriteTable[] | null;
  subspriteTableNum: number;
  subspriteMode: number;
}

export interface AffineAnimState {
  animNum: number;
  animCmdIndex: number;
  delayCounter: number;
  loopCounter: number;
  xScale: number;
  yScale: number;
  rotation: number;
}

export interface SpriteCopyRequest {
  src: string | null;
  dest: string | null;
  size: number;
}

export interface SpriteSheet {
  data: string | null;
  size: number;
  tag: number;
}

export interface SpritePalette {
  data: string | null;
  tag: number;
}

export interface SpriteRuntime {
  gSprites: Sprite[];
  gSpritePriorities: number[];
  gSpriteOrder: number[];
  gShouldProcessSpriteCopyRequests: boolean;
  gSpriteCopyRequestCount: number;
  gSpriteCopyRequests: SpriteCopyRequest[];
  gOamLimit: number;
  gReservedSpriteTileCount: number;
  gSpriteTileAllocBitmap: number[];
  gSpriteCoordOffsetX: number;
  gSpriteCoordOffsetY: number;
  gOamMatrices: OamMatrix[];
  gAffineAnimsDisabled: boolean;
  gOamMatrixAllocBitmap: number;
  gReservedSpritePaletteCount: number;
  sSpriteTileRangeTags: number[];
  sSpriteTileRanges: number[];
  sAffineAnimStates: AffineAnimState[];
  sSpritePaletteTags: number[];
  oamBuffer: OamData[];
  oamLoadDisabled: boolean;
  copiedRequests: SpriteCopyRequest[];
  operations: string[];
}

export const SpriteCallbackDummy: SpriteCallback = () => {};

export const gDummyOamData: OamData = {
  y: 160,
  affineMode: ST_OAM_AFFINE_OFF,
  objMode: 0,
  mosaic: false,
  bpp: 0,
  shape: ST_OAM_SQUARE,
  x: 304,
  matrixNum: 0,
  size: ST_OAM_SIZE_0,
  tileNum: 0,
  priority: 3,
  paletteNum: 0,
  affineParam: 0
};

const dummyAnim: AnimCmd = { type: 'end' };
const dummyAffineAnim: AffineAnimCmd = { type: 'end' };

export const gDummySpriteTemplate: SpriteTemplate = {
  tileTag: 0,
  paletteTag: TAG_NONE,
  oam: gDummyOamData,
  anims: [[dummyAnim]],
  images: null,
  affineAnims: [[dummyAffineAnim]],
  callback: SpriteCallbackDummy
};

const cloneOam = (oam: OamData): OamData => ({ ...oam });
const identityMatrix = (): OamMatrix => ({ a: 0x100, b: 0, c: 0, d: 0x100 });
const resetAffineState = (): AffineAnimState => ({ animNum: 0, animCmdIndex: 0, delayCounter: 0, loopCounter: 0, xScale: 0x100, yScale: 0x100, rotation: 0 });
const cloneSprite = (sprite: Sprite): Sprite => ({
  ...sprite,
  oam: cloneOam(sprite.oam),
  anims: sprite.anims.map((anim) => anim.map((cmd) => ({ ...cmd }))),
  affineAnims: sprite.affineAnims.map((anim) => anim.map((cmd) => ({ ...cmd }))),
  template: {
    ...sprite.template,
    oam: cloneOam(sprite.template.oam),
    anims: sprite.template.anims.map((anim) => anim.map((cmd) => ({ ...cmd }))),
    images: sprite.template.images?.map((image) => ({ ...image })) ?? null,
    affineAnims: sprite.template.affineAnims.map((anim) => anim.map((cmd) => ({ ...cmd })))
  },
  images: sprite.images?.map((image) => ({ ...image })) ?? null,
  data: [...sprite.data],
  subspriteTables: sprite.subspriteTables?.map((table) => ({
    subspriteCount: table.subspriteCount,
    subsprites: table.subsprites?.map((subsprite) => ({ ...subsprite })) ?? null
  })) ?? null
});

const centerToCornerVecTable = [
  [[-4, -4], [-8, -8], [-16, -16], [-32, -32]],
  [[-8, -4], [-16, -4], [-16, -8], [-32, -16]],
  [[-4, -8], [-4, -16], [-8, -16], [-16, -32]]
] as const;

const oamDimensions = [
  [[8, 8], [16, 16], [32, 32], [64, 64]],
  [[16, 8], [32, 8], [32, 16], [64, 32]],
  [[8, 16], [8, 32], [16, 32], [32, 64]]
] as const;

export const createSpriteRuntime = (overrides: Partial<SpriteRuntime> = {}): SpriteRuntime => {
  const runtime: SpriteRuntime = {
    gSprites: Array.from({ length: MAX_SPRITES + 1 }, () => createDummySprite()),
    gSpritePriorities: Array(MAX_SPRITES).fill(0),
    gSpriteOrder: Array.from({ length: MAX_SPRITES }, (_, i) => i),
    gShouldProcessSpriteCopyRequests: false,
    gSpriteCopyRequestCount: 0,
    gSpriteCopyRequests: Array.from({ length: MAX_SPRITE_COPY_REQUESTS }, () => ({ src: null, dest: null, size: 0 })),
    gOamLimit: 0,
    gReservedSpriteTileCount: 0,
    gSpriteTileAllocBitmap: Array(128).fill(0),
    gSpriteCoordOffsetX: 0,
    gSpriteCoordOffsetY: 0,
    gOamMatrices: Array.from({ length: OAM_MATRIX_COUNT }, identityMatrix),
    gAffineAnimsDisabled: false,
    gOamMatrixAllocBitmap: 0,
    gReservedSpritePaletteCount: 0,
    sSpriteTileRangeTags: Array(MAX_SPRITES).fill(TAG_NONE),
    sSpriteTileRanges: Array(MAX_SPRITES * 2).fill(0),
    sAffineAnimStates: Array.from({ length: OAM_MATRIX_COUNT }, resetAffineState),
    sSpritePaletteTags: Array(16).fill(TAG_NONE),
    oamBuffer: Array.from({ length: 128 }, () => cloneOam(gDummyOamData)),
    oamLoadDisabled: false,
    copiedRequests: [],
    operations: []
  };
  return { ...runtime, ...overrides };
};

export function createDummySprite(): Sprite {
  return {
    oam: cloneOam(gDummyOamData),
    anims: gDummySpriteTemplate.anims,
    affineAnims: gDummySpriteTemplate.affineAnims,
    template: gDummySpriteTemplate,
    callback: SpriteCallbackDummy,
    x: DISPLAY_WIDTH + 64,
    y: DISPLAY_HEIGHT,
    x2: 0,
    y2: 0,
    centerToCornerVecX: 0,
    centerToCornerVecY: 0,
    subpriority: 0xff,
    inUse: false,
    invisible: false,
    coordOffsetEnabled: false,
    animBeginning: false,
    affineAnimBeginning: false,
    usingSheet: false,
    images: null,
    sheetTileStart: 0,
    animNum: 0,
    animCmdIndex: 0,
    animDelayCounter: 0,
    animLoopCounter: 0,
    animEnded: false,
    animPaused: false,
    affineAnimEnded: false,
    affineAnimPaused: false,
    hFlip: 0,
    vFlip: 0,
    anchored: false,
    data: Array(8).fill(0),
    subspriteTables: null,
    subspriteTableNum: 0,
    subspriteMode: SUBSPRITES_OFF
  };
}

const isTileAllocated = (runtime: SpriteRuntime, tile: number): number => (runtime.gSpriteTileAllocBitmap[tile >> 3]! >> (tile & 7)) & 1;
const allocTile = (runtime: SpriteRuntime, tile: number): void => {
  runtime.gSpriteTileAllocBitmap[tile >> 3] |= 1 << (tile & 7);
};
const freeTile = (runtime: SpriteRuntime, tile: number): void => {
  runtime.gSpriteTileAllocBitmap[tile >> 3] &= ~(1 << (tile & 7));
};

export const ResetSpriteData = (runtime: SpriteRuntime): void => {
  ResetOamRange(runtime, 0, 128);
  ResetAllSprites(runtime);
  ClearSpriteCopyRequests(runtime);
  ResetAffineAnimData(runtime);
  FreeSpriteTileRanges(runtime);
  runtime.gOamLimit = 64;
  runtime.gReservedSpriteTileCount = 0;
  AllocSpriteTiles(runtime, 0);
  runtime.gSpriteCoordOffsetX = 0;
  runtime.gSpriteCoordOffsetY = 0;
};

export const AnimateSprites = (runtime: SpriteRuntime): void => {
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = runtime.gSprites[i]!;
    if (sprite.inUse) {
      sprite.callback(runtime, sprite);
      if (sprite.inUse) AnimateSprite(runtime, sprite);
    }
  }
};

export const BuildOamBuffer = (runtime: SpriteRuntime): void => {
  UpdateOamCoords(runtime);
  BuildSpritePriorities(runtime);
  SortSprites(runtime);
  const temp = runtime.oamLoadDisabled;
  runtime.oamLoadDisabled = true;
  AddSpritesToOamBuffer(runtime);
  CopyMatricesToOamBuffer(runtime);
  runtime.oamLoadDisabled = temp;
  runtime.gShouldProcessSpriteCopyRequests = true;
};

export const UpdateOamCoords = (runtime: SpriteRuntime): void => {
  for (const sprite of runtime.gSprites.slice(0, MAX_SPRITES)) {
    if (sprite.inUse && !sprite.invisible) {
      const offX = sprite.coordOffsetEnabled ? runtime.gSpriteCoordOffsetX : 0;
      const offY = sprite.coordOffsetEnabled ? runtime.gSpriteCoordOffsetY : 0;
      sprite.oam.x = sprite.x + sprite.x2 + sprite.centerToCornerVecX + offX;
      sprite.oam.y = sprite.y + sprite.y2 + sprite.centerToCornerVecY + offY;
    }
  }
};

export const BuildSpritePriorities = (runtime: SpriteRuntime): void => {
  for (let i = 0; i < MAX_SPRITES; i++) runtime.gSpritePriorities[i] = runtime.gSprites[i]!.subpriority | (runtime.gSprites[i]!.oam.priority << 8);
};

const sortableY = (sprite: Sprite): number => {
  let y = sprite.oam.y;
  if (y >= DISPLAY_HEIGHT) y -= 256;
  if (sprite.oam.affineMode === ST_OAM_AFFINE_DOUBLE && sprite.oam.size === 3) {
    if ((sprite.oam.shape === ST_OAM_SQUARE || sprite.oam.shape === ST_OAM_V_RECTANGLE) && y > 128) y -= 256;
  }
  return y;
};

export const SortSprites = (runtime: SpriteRuntime): void => {
  for (let i = 1; i < MAX_SPRITES; i++) {
    let j = i;
    while (j > 0) {
      const aIndex = runtime.gSpriteOrder[j - 1]!;
      const bIndex = runtime.gSpriteOrder[j]!;
      const aPriority = runtime.gSpritePriorities[aIndex]!;
      const bPriority = runtime.gSpritePriorities[bIndex]!;
      const aY = sortableY(runtime.gSprites[aIndex]!);
      const bY = sortableY(runtime.gSprites[bIndex]!);
      if (!(aPriority > bPriority || (aPriority === bPriority && aY < bY))) break;
      runtime.gSpriteOrder[j] = aIndex;
      runtime.gSpriteOrder[j - 1] = bIndex;
      j--;
    }
  }
};

export const CopyMatricesToOamBuffer = (runtime: SpriteRuntime): void => {
  for (let i = 0; i < OAM_MATRIX_COUNT; i++) {
    const base = 4 * i;
    runtime.oamBuffer[base + 0]!.affineParam = runtime.gOamMatrices[i]!.a;
    runtime.oamBuffer[base + 1]!.affineParam = runtime.gOamMatrices[i]!.b;
    runtime.oamBuffer[base + 2]!.affineParam = runtime.gOamMatrices[i]!.c;
    runtime.oamBuffer[base + 3]!.affineParam = runtime.gOamMatrices[i]!.d;
  }
};

export const AddSpritesToOamBuffer = (runtime: SpriteRuntime): void => {
  let oamIndex = 0;
  for (let i = 0; i < MAX_SPRITES; i++) {
    const sprite = runtime.gSprites[runtime.gSpriteOrder[i]!]!;
    if (sprite.inUse && !sprite.invisible) {
      const result = AddSpriteToOamBuffer(runtime, sprite, oamIndex);
      oamIndex = result.oamIndex;
      if (result.full) return;
    }
  }
  while (oamIndex < runtime.gOamLimit) runtime.oamBuffer[oamIndex++] = cloneOam(gDummyOamData);
};

export const CreateSprite = (runtime: SpriteRuntime, template: SpriteTemplate, x: number, y: number, subpriority: number): number => {
  for (let i = 0; i < MAX_SPRITES; i++) if (!runtime.gSprites[i]!.inUse) return CreateSpriteAt(runtime, i, template, x, y, subpriority);
  return MAX_SPRITES;
};

export const CreateSpriteAtEnd = (runtime: SpriteRuntime, template: SpriteTemplate, x: number, y: number, subpriority: number): number => {
  for (let i = MAX_SPRITES - 1; i > -1; i--) if (!runtime.gSprites[i]!.inUse) return CreateSpriteAt(runtime, i, template, x, y, subpriority);
  return MAX_SPRITES;
};

export const CreateInvisibleSprite = (runtime: SpriteRuntime, callback: SpriteCallback): number => {
  const index = CreateSprite(runtime, gDummySpriteTemplate, 0, 0, 31);
  if (index === MAX_SPRITES) return MAX_SPRITES;
  runtime.gSprites[index]!.invisible = true;
  runtime.gSprites[index]!.callback = callback;
  return index;
};

export const CreateSpriteAt = (runtime: SpriteRuntime, index: number, template: SpriteTemplate, x: number, y: number, subpriority: number): number => {
  const sprite = runtime.gSprites[index]!;
  ResetSprite(sprite);
  sprite.inUse = true;
  sprite.animBeginning = true;
  sprite.affineAnimBeginning = true;
  sprite.usingSheet = true;
  sprite.subpriority = subpriority;
  sprite.oam = cloneOam(template.oam);
  sprite.anims = template.anims;
  sprite.affineAnims = template.affineAnims;
  sprite.template = template;
  sprite.callback = template.callback;
  sprite.x = x;
  sprite.y = y;
  CalcCenterToCornerVec(sprite, sprite.oam.shape, sprite.oam.size, sprite.oam.affineMode);
  if (template.tileTag === TAG_NONE) {
    sprite.images = template.images;
    const imageSize = sprite.images?.[0]?.size ?? 0;
    const tileNum = AllocSpriteTiles(runtime, Math.trunc(imageSize / TILE_SIZE_4BPP));
    if (tileNum === -1) {
      ResetSprite(sprite);
      return MAX_SPRITES;
    }
    sprite.oam.tileNum = tileNum;
    sprite.usingSheet = false;
    sprite.sheetTileStart = 0;
  } else {
    sprite.sheetTileStart = GetSpriteTileStartByTag(runtime, template.tileTag);
    SetSpriteSheetFrameTileNum(sprite);
  }
  if ((sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) !== 0) InitSpriteAffineAnim(runtime, sprite);
  if (template.paletteTag !== TAG_NONE) sprite.oam.paletteNum = IndexOfSpritePaletteTag(runtime, template.paletteTag);
  return index;
};

export const CreateSpriteAndAnimate = (runtime: SpriteRuntime, template: SpriteTemplate, x: number, y: number, subpriority: number): number => {
  for (let i = 0; i < MAX_SPRITES; i++) {
    if (!runtime.gSprites[i]!.inUse) {
      const index = CreateSpriteAt(runtime, i, template, x, y, subpriority);
      if (index === MAX_SPRITES) return MAX_SPRITES;
      template.callback(runtime, runtime.gSprites[i]!);
      if (runtime.gSprites[i]!.inUse) AnimateSprite(runtime, runtime.gSprites[i]!);
      return index;
    }
  }
  return MAX_SPRITES;
};

export const DestroySprite = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if (sprite.inUse) {
    if (!sprite.usingSheet) FreeSpriteTilesIfNotUsingSheet(runtime, sprite);
    ResetSprite(sprite);
  }
};

export const ResetOamRange = (runtime: SpriteRuntime, a: number, b: number): void => {
  for (let i = a; i < b; i++) runtime.oamBuffer[i] = cloneOam(gDummyOamData);
};

export const LoadOam = (runtime: SpriteRuntime): void => {
  if (!runtime.oamLoadDisabled) runtime.operations.push('LoadOam');
};

export const ClearSpriteCopyRequests = (runtime: SpriteRuntime): void => {
  runtime.gShouldProcessSpriteCopyRequests = false;
  runtime.gSpriteCopyRequestCount = 0;
  for (let i = 0; i < MAX_SPRITE_COPY_REQUESTS; i++) runtime.gSpriteCopyRequests[i] = { src: null, dest: null, size: 0 };
};

export const ResetOamMatrices = (runtime: SpriteRuntime): void => {
  for (let i = 0; i < OAM_MATRIX_COUNT; i++) runtime.gOamMatrices[i] = identityMatrix();
};

export const SetOamMatrix = (runtime: SpriteRuntime, matrixNum: number, a: number, b: number, c: number, d: number): void => {
  runtime.gOamMatrices[matrixNum] = { a, b, c, d };
};

export const ResetSprite = (sprite: Sprite): void => {
  Object.assign(sprite, createDummySprite());
};

export const CalcCenterToCornerVec = (sprite: Sprite, shape: number, size: number, affineMode: number): void => {
  let x = centerToCornerVecTable[shape]![size]![0];
  let y = centerToCornerVecTable[shape]![size]![1];
  if ((affineMode & ST_OAM_AFFINE_DOUBLE_MASK) !== 0) {
    x *= 2;
    y *= 2;
  }
  sprite.centerToCornerVecX = x;
  sprite.centerToCornerVecY = y;
};

export const AllocSpriteTiles = (runtime: SpriteRuntime, tileCount: number): number => {
  if (tileCount === 0) {
    for (let i = runtime.gReservedSpriteTileCount; i < TOTAL_OBJ_TILE_COUNT; i++) freeTile(runtime, i);
    return 0;
  }
  let i = runtime.gReservedSpriteTileCount;
  for (;;) {
    while (isTileAllocated(runtime, i)) {
      i++;
      if (i === TOTAL_OBJ_TILE_COUNT) return -1;
    }
    const start = i;
    let numTilesFound = 1;
    while (numTilesFound !== tileCount) {
      i++;
      if (i === TOTAL_OBJ_TILE_COUNT) return -1;
      if (!isTileAllocated(runtime, i)) numTilesFound++;
      else break;
    }
    if (numTilesFound === tileCount) {
      for (let tile = start; tile < tileCount + start; tile++) allocTile(runtime, tile);
      return start;
    }
  }
};

export const SpriteTileAllocBitmapOp = (runtime: SpriteRuntime, bit: number, op: number): number => {
  const index = Math.trunc(bit / 8);
  const shift = bit % 8;
  let val = bit % 8;
  let retVal = 0;
  if (op === 0) {
    val = ~(1 << val);
    runtime.gSpriteTileAllocBitmap[index] &= val;
  } else if (op === 1) {
    val = 1 << val;
    runtime.gSpriteTileAllocBitmap[index] |= val;
  } else {
    retVal = 1 << shift;
    retVal &= runtime.gSpriteTileAllocBitmap[index]!;
  }
  return retVal;
};

export const FreeSpriteTilesIfNotUsingSheet = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if (!sprite.usingSheet) {
    const end = Math.trunc((sprite.images?.[0]?.size ?? 0) / TILE_SIZE_4BPP) + sprite.oam.tileNum;
    for (let i = sprite.oam.tileNum; i < end; i++) freeTile(runtime, i);
  }
};

export const ProcessSpriteCopyRequests = (runtime: SpriteRuntime): void => {
  if (runtime.gShouldProcessSpriteCopyRequests) {
    let i = 0;
    while (runtime.gSpriteCopyRequestCount > 0) {
      runtime.copiedRequests.push({ ...runtime.gSpriteCopyRequests[i]! });
      runtime.gSpriteCopyRequestCount--;
      i++;
    }
    runtime.gShouldProcessSpriteCopyRequests = false;
  }
};

export const RequestSpriteFrameImageCopy = (runtime: SpriteRuntime, index: number, tileNum: number, images: SpriteFrameImage[]): void => {
  if (runtime.gSpriteCopyRequestCount < MAX_SPRITE_COPY_REQUESTS) {
    runtime.gSpriteCopyRequests[runtime.gSpriteCopyRequestCount++] = {
      src: images[index]!.data,
      dest: `OBJ_VRAM0+${TILE_SIZE_4BPP * tileNum}`,
      size: images[index]!.size
    };
  }
};

export const RequestSpriteCopy = (runtime: SpriteRuntime, src: string, dest: string, size: number): void => {
  if (runtime.gSpriteCopyRequestCount < MAX_SPRITE_COPY_REQUESTS) runtime.gSpriteCopyRequests[runtime.gSpriteCopyRequestCount++] = { src, dest, size };
};

export const CopyFromSprites = (runtime: SpriteRuntime): Sprite[] =>
  runtime.gSprites.slice(0, MAX_SPRITES).map((sprite) => cloneSprite(sprite));

export const CopyToSprites = (runtime: SpriteRuntime, src: readonly Sprite[]): void => {
  for (let i = 0; i < MAX_SPRITES; i += 1) {
    runtime.gSprites[i] = cloneSprite(src[i] ?? createDummySprite());
  }
};

export const ResetAllSprites = (runtime: SpriteRuntime): void => {
  for (let i = 0; i < MAX_SPRITES; i++) {
    ResetSprite(runtime.gSprites[i]!);
    runtime.gSpriteOrder[i] = i;
  }
  ResetSprite(runtime.gSprites[MAX_SPRITES]!);
};

export const FreeSpriteTiles = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if (sprite.template.tileTag !== TAG_NONE) FreeSpriteTilesByTag(runtime, sprite.template.tileTag);
};
export const FreeSpritePalette = (runtime: SpriteRuntime, sprite: Sprite): void => FreeSpritePaletteByTag(runtime, sprite.template.paletteTag);
export const FreeSpriteOamMatrix = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if ((sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) !== 0) {
    FreeOamMatrix(runtime, sprite.oam.matrixNum);
    sprite.oam.affineMode = ST_OAM_AFFINE_OFF;
  }
};
export const DestroySpriteAndFreeResources = (runtime: SpriteRuntime, sprite: Sprite): void => {
  FreeSpriteTiles(runtime, sprite);
  FreeSpritePalette(runtime, sprite);
  FreeSpriteOamMatrix(runtime, sprite);
  DestroySprite(runtime, sprite);
};

export const AnimateSprite = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if (sprite.animBeginning) BeginAnim(runtime, sprite);
  else ContinueAnim(runtime, sprite);
  if (!runtime.gAffineAnimsDisabled) {
    if (sprite.affineAnimBeginning) BeginAffineAnim(runtime, sprite);
    else ContinueAffineAnim(runtime, sprite);
  }
};

const currentAnimCmd = (sprite: Sprite): AnimCmd => sprite.anims[sprite.animNum]![sprite.animCmdIndex]!;
const currentAffineCmd = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): AffineAnimCmd => sprite.affineAnims[runtime.sAffineAnimStates[matrixNum]!.animNum]![runtime.sAffineAnimStates[matrixNum]!.animCmdIndex]!;

export const BeginAnim = (runtime: SpriteRuntime, sprite: Sprite): void => {
  sprite.animCmdIndex = 0;
  sprite.animEnded = false;
  sprite.animLoopCounter = 0;
  const cmd = currentAnimCmd(sprite);
  if (cmd.type !== 'end') {
    sprite.animBeginning = false;
    AnimCmd_frame(runtime, sprite);
  }
};

export const ContinueAnim = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if (sprite.animDelayCounter) {
    DecrementAnimDelayCounter(sprite);
    const cmd = currentAnimCmd(sprite);
    if (cmd.type === 'frame' && (sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) === 0) SetSpriteOamFlipBits(sprite, cmd.hFlip ?? 0, cmd.vFlip ?? 0);
  } else if (!sprite.animPaused) {
    sprite.animCmdIndex++;
    const cmd = currentAnimCmd(sprite);
    if (cmd.type === 'loop') AnimCmd_loop(runtime, sprite);
    else if (cmd.type === 'jump') AnimCmd_jump(runtime, sprite);
    else if (cmd.type === 'end') AnimCmd_end(sprite);
    else AnimCmd_frame(runtime, sprite);
  }
};

export const AnimCmd_frame = (runtime: SpriteRuntime, sprite: Sprite): void => {
  const cmd = currentAnimCmd(sprite);
  if (cmd.type !== 'frame') return;
  sprite.animDelayCounter = cmd.duration ? cmd.duration - 1 : 0;
  if ((sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) === 0) SetSpriteOamFlipBits(sprite, cmd.hFlip ?? 0, cmd.vFlip ?? 0);
  if (sprite.usingSheet) sprite.oam.tileNum = sprite.sheetTileStart + cmd.imageValue;
  else if (sprite.images) RequestSpriteFrameImageCopy(runtime, cmd.imageValue, sprite.oam.tileNum, sprite.images);
};

export const AnimCmd_end = (sprite: Sprite): void => {
  sprite.animCmdIndex--;
  sprite.animEnded = true;
};

export const AnimCmd_jump = (runtime: SpriteRuntime, sprite: Sprite): void => {
  const cmd = currentAnimCmd(sprite);
  if (cmd.type !== 'jump') return;
  sprite.animCmdIndex = cmd.target;
  AnimCmd_frame(runtime, sprite);
};

export const AnimCmd_loop = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if (sprite.animLoopCounter) ContinueAnimLoop(runtime, sprite);
  else BeginAnimLoop(runtime, sprite);
};

export const BeginAnimLoop = (runtime: SpriteRuntime, sprite: Sprite): void => {
  const cmd = currentAnimCmd(sprite);
  if (cmd.type === 'loop') sprite.animLoopCounter = cmd.count;
  JumpToTopOfAnimLoop(sprite);
  ContinueAnim(runtime, sprite);
};

export const ContinueAnimLoop = (runtime: SpriteRuntime, sprite: Sprite): void => {
  sprite.animLoopCounter--;
  JumpToTopOfAnimLoop(sprite);
  ContinueAnim(runtime, sprite);
};

export const JumpToTopOfAnimLoop = (sprite: Sprite): void => {
  if (sprite.animLoopCounter) {
    sprite.animCmdIndex--;
    while (sprite.anims[sprite.animNum]![sprite.animCmdIndex - 1]?.type !== 'loop') {
      if (sprite.animCmdIndex === 0) break;
      sprite.animCmdIndex--;
    }
    sprite.animCmdIndex--;
  }
};

export const BeginAffineAnim = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if ((sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) !== 0 && sprite.affineAnims[0]![0]!.type !== 'end') {
    const matrixNum = GetSpriteMatrixNum(sprite);
    AffineAnimStateRestartAnim(runtime, matrixNum);
    const frameCmd = GetAffineAnimFrame(runtime, matrixNum, sprite);
    sprite.affineAnimBeginning = false;
    sprite.affineAnimEnded = false;
    ApplyAffineAnimFrame(runtime, matrixNum, frameCmd);
    runtime.sAffineAnimStates[matrixNum]!.delayCounter = frameCmd.duration;
    if (sprite.anchored) UpdateSpriteMatrixAnchorPos(runtime, sprite, sprite.data[6]!, sprite.data[7]!);
  }
};

export const ContinueAffineAnim = (runtime: SpriteRuntime, sprite: Sprite): void => {
  if ((sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) !== 0) {
    const matrixNum = GetSpriteMatrixNum(sprite);
    if (runtime.sAffineAnimStates[matrixNum]!.delayCounter) AffineAnimDelay(runtime, matrixNum, sprite);
    else if (sprite.affineAnimPaused) return;
    else {
      runtime.sAffineAnimStates[matrixNum]!.animCmdIndex++;
      const cmd = currentAffineCmd(runtime, matrixNum, sprite);
      if (cmd.type === 'loop') AffineAnimCmd_loop(runtime, matrixNum, sprite);
      else if (cmd.type === 'jump') AffineAnimCmd_jump(runtime, matrixNum, sprite);
      else if (cmd.type === 'end') AffineAnimCmd_end(runtime, matrixNum, sprite);
      else AffineAnimCmd_frame(runtime, matrixNum, sprite);
    }
    if (sprite.anchored) UpdateSpriteMatrixAnchorPos(runtime, sprite, sprite.data[6]!, sprite.data[7]!);
  }
};

export const AffineAnimDelay = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  if (!DecrementAffineAnimDelayCounter(runtime, sprite, matrixNum)) ApplyAffineAnimFrameRelativeAndUpdateMatrix(runtime, matrixNum, GetAffineAnimFrame(runtime, matrixNum, sprite));
};

export const AffineAnimCmd_loop = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  if (runtime.sAffineAnimStates[matrixNum]!.loopCounter) ContinueAffineAnimLoop(runtime, matrixNum, sprite);
  else BeginAffineAnimLoop(runtime, matrixNum, sprite);
};

export const BeginAffineAnimLoop = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  const cmd = currentAffineCmd(runtime, matrixNum, sprite);
  if (cmd.type === 'loop') runtime.sAffineAnimStates[matrixNum]!.loopCounter = cmd.count;
  JumpToTopOfAffineAnimLoop(runtime, matrixNum, sprite);
  ContinueAffineAnim(runtime, sprite);
};

export const ContinueAffineAnimLoop = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  runtime.sAffineAnimStates[matrixNum]!.loopCounter--;
  JumpToTopOfAffineAnimLoop(runtime, matrixNum, sprite);
  ContinueAffineAnim(runtime, sprite);
};

export const JumpToTopOfAffineAnimLoop = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  const state = runtime.sAffineAnimStates[matrixNum]!;
  if (state.loopCounter) {
    state.animCmdIndex--;
    while (sprite.affineAnims[state.animNum]![state.animCmdIndex - 1]?.type !== 'loop') {
      if (state.animCmdIndex === 0) break;
      state.animCmdIndex--;
    }
    state.animCmdIndex--;
  }
};

export const AffineAnimCmd_jump = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  const cmd = currentAffineCmd(runtime, matrixNum, sprite);
  if (cmd.type !== 'jump') return;
  runtime.sAffineAnimStates[matrixNum]!.animCmdIndex = cmd.target;
  const frame = GetAffineAnimFrame(runtime, matrixNum, sprite);
  ApplyAffineAnimFrame(runtime, matrixNum, frame);
  runtime.sAffineAnimStates[matrixNum]!.delayCounter = frame.duration;
};

export const AffineAnimCmd_end = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  sprite.affineAnimEnded = true;
  runtime.sAffineAnimStates[matrixNum]!.animCmdIndex--;
  ApplyAffineAnimFrameRelativeAndUpdateMatrix(runtime, matrixNum, { xScale: 0, yScale: 0, rotation: 0, duration: 0 });
};

export const AffineAnimCmd_frame = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): void => {
  const frame = GetAffineAnimFrame(runtime, matrixNum, sprite);
  ApplyAffineAnimFrame(runtime, matrixNum, frame);
  runtime.sAffineAnimStates[matrixNum]!.delayCounter = frame.duration;
};

export const CopyOamMatrix = (runtime: SpriteRuntime, destMatrixIndex: number, srcMatrix: OamMatrix): void => {
  runtime.gOamMatrices[destMatrixIndex] = { ...srcMatrix };
};

export const GetSpriteMatrixNum = (sprite: Sprite): number => (sprite.oam.affineMode & ST_OAM_AFFINE_ON_MASK) !== 0 ? sprite.oam.matrixNum : 0;
export const SetSpriteMatrixAnchor = (sprite: Sprite, x: number, y: number): void => {
  sprite.data[6] = x;
  sprite.data[7] = y;
  sprite.anchored = true;
};

const getAnchorCoord = (baseDim: number, xformed: number, modifier: number): number => {
  const subResult = xformed - baseDim;
  const shiftResult = subResult < 0 ? -subResult >> 9 : -(subResult >> 9);
  return modifier - (Math.trunc((modifier * xformed) / baseDim) + shiftResult);
};
export const GetAnchorCoord = getAnchorCoord;

export const UpdateSpriteMatrixAnchorPos = (runtime: SpriteRuntime, sprite: Sprite, x: number, y: number): void => {
  const matrixNum = sprite.oam.matrixNum;
  if (x !== NO_ANCHOR) {
    const dim = oamDimensions[sprite.oam.shape]![sprite.oam.size]![0];
    const baseDim = dim << 8;
    const xFormed = Math.trunc((dim << 16) / runtime.gOamMatrices[matrixNum]!.a);
    sprite.x2 = getAnchorCoord(baseDim, xFormed, x);
  }
  if (y !== NO_ANCHOR) {
    const dim = oamDimensions[sprite.oam.shape]![sprite.oam.size]![1];
    const baseDim = dim << 8;
    const xFormed = Math.trunc((dim << 16) / runtime.gOamMatrices[matrixNum]!.d);
    sprite.y2 = getAnchorCoord(baseDim, xFormed, y);
  }
};

export const SetSpriteOamFlipBits = (sprite: Sprite, hFlip: number, vFlip: number): void => {
  sprite.oam.matrixNum &= 0x7;
  sprite.oam.matrixNum |= ((hFlip ^ sprite.hFlip) & 1) << 3;
  sprite.oam.matrixNum |= ((vFlip ^ sprite.vFlip) & 1) << 4;
};

export const AffineAnimStateRestartAnim = (runtime: SpriteRuntime, matrixNum: number): void => {
  runtime.sAffineAnimStates[matrixNum]!.animCmdIndex = 0;
  runtime.sAffineAnimStates[matrixNum]!.delayCounter = 0;
  runtime.sAffineAnimStates[matrixNum]!.loopCounter = 0;
};

export const AffineAnimStateStartAnim = (runtime: SpriteRuntime, matrixNum: number, animNum: number): void => {
  runtime.sAffineAnimStates[matrixNum] = { animNum, animCmdIndex: 0, delayCounter: 0, loopCounter: 0, xScale: 0x100, yScale: 0x100, rotation: 0 };
};

export const AffineAnimStateReset = (runtime: SpriteRuntime, matrixNum: number): void => {
  runtime.sAffineAnimStates[matrixNum] = resetAffineState();
};

export const ApplyAffineAnimFrameAbsolute = (runtime: SpriteRuntime, matrixNum: number, frameCmd: AffineAnimFrameCmd): void => {
  runtime.sAffineAnimStates[matrixNum]!.xScale = frameCmd.xScale;
  runtime.sAffineAnimStates[matrixNum]!.yScale = frameCmd.yScale;
  runtime.sAffineAnimStates[matrixNum]!.rotation = frameCmd.rotation << 8;
};

export const DecrementAnimDelayCounter = (sprite: Sprite): void => {
  if (!sprite.animPaused) sprite.animDelayCounter--;
};

export const DecrementAffineAnimDelayCounter = (runtime: SpriteRuntime, sprite: Sprite, matrixNum: number): boolean => {
  if (!sprite.affineAnimPaused) --runtime.sAffineAnimStates[matrixNum]!.delayCounter;
  return sprite.affineAnimPaused;
};

export const ApplyAffineAnimFrameRelativeAndUpdateMatrix = (runtime: SpriteRuntime, matrixNum: number, frameCmd: AffineAnimFrameCmd): void => {
  const state = runtime.sAffineAnimStates[matrixNum]!;
  state.xScale += frameCmd.xScale;
  state.yScale += frameCmd.yScale;
  state.rotation = (state.rotation + (frameCmd.rotation << 8)) & ~0xff;
  ObjAffineSetOne(runtime, matrixNum, ConvertScaleParam(state.xScale), ConvertScaleParam(state.yScale), state.rotation);
};

export const ConvertScaleParam = (scale: number): number => Math.trunc(0x10000 / scale);
export const GetAffineAnimFrame = (runtime: SpriteRuntime, matrixNum: number, sprite: Sprite): AffineAnimFrameCmd => {
  const cmd = currentAffineCmd(runtime, matrixNum, sprite);
  if (cmd.type !== 'frame') return { xScale: 0, yScale: 0, rotation: 0, duration: 0 };
  return { xScale: cmd.xScale, yScale: cmd.yScale, rotation: cmd.rotation, duration: cmd.duration };
};

export const ApplyAffineAnimFrame = (runtime: SpriteRuntime, matrixNum: number, frameCmd: AffineAnimFrameCmd): void => {
  if (frameCmd.duration) {
    frameCmd.duration--;
    ApplyAffineAnimFrameRelativeAndUpdateMatrix(runtime, matrixNum, frameCmd);
  } else {
    ApplyAffineAnimFrameAbsolute(runtime, matrixNum, frameCmd);
    ApplyAffineAnimFrameRelativeAndUpdateMatrix(runtime, matrixNum, { xScale: 0, yScale: 0, rotation: 0, duration: 0 });
  }
};

export const StartSpriteAnim = (sprite: Sprite, animNum: number): void => {
  sprite.animNum = animNum;
  sprite.animBeginning = true;
  sprite.animEnded = false;
};
export const StartSpriteAnimIfDifferent = (sprite: Sprite, animNum: number): void => {
  if (sprite.animNum !== animNum) StartSpriteAnim(sprite, animNum);
};
export const SeekSpriteAnim = (runtime: SpriteRuntime, sprite: Sprite, animCmdIndex: number): void => {
  const temp = sprite.animPaused;
  sprite.animCmdIndex = animCmdIndex - 1;
  sprite.animDelayCounter = 0;
  sprite.animBeginning = false;
  sprite.animEnded = false;
  sprite.animPaused = false;
  ContinueAnim(runtime, sprite);
  if (sprite.animDelayCounter) sprite.animDelayCounter++;
  sprite.animPaused = temp;
};
export const StartSpriteAffineAnim = (runtime: SpriteRuntime, sprite: Sprite, animNum: number): void => {
  const matrixNum = GetSpriteMatrixNum(sprite);
  AffineAnimStateStartAnim(runtime, matrixNum, animNum);
  sprite.affineAnimBeginning = true;
  sprite.affineAnimEnded = false;
};
export const StartSpriteAffineAnimIfDifferent = (runtime: SpriteRuntime, sprite: Sprite, animNum: number): void => {
  if (runtime.sAffineAnimStates[GetSpriteMatrixNum(sprite)]!.animNum !== animNum) StartSpriteAffineAnim(runtime, sprite, animNum);
};
export const ChangeSpriteAffineAnim = (runtime: SpriteRuntime, sprite: Sprite, animNum: number): void => {
  runtime.sAffineAnimStates[GetSpriteMatrixNum(sprite)]!.animNum = animNum;
  sprite.affineAnimBeginning = true;
  sprite.affineAnimEnded = false;
};
export const ChangeSpriteAffineAnimIfDifferent = (runtime: SpriteRuntime, sprite: Sprite, animNum: number): void => {
  if (runtime.sAffineAnimStates[GetSpriteMatrixNum(sprite)]!.animNum !== animNum) ChangeSpriteAffineAnim(runtime, sprite, animNum);
};

export const SetSpriteSheetFrameTileNum = (sprite: Sprite): void => {
  if (sprite.usingSheet) {
    const cmd = currentAnimCmd(sprite);
    let tileOffset = cmd.type === 'frame' ? cmd.imageValue : 0;
    if (tileOffset < 0) tileOffset = 0;
    sprite.oam.tileNum = sprite.sheetTileStart + tileOffset;
  }
};

export const ResetAffineAnimData = (runtime: SpriteRuntime): void => {
  runtime.gAffineAnimsDisabled = false;
  runtime.gOamMatrixAllocBitmap = 0;
  ResetOamMatrices(runtime);
  for (let i = 0; i < OAM_MATRIX_COUNT; i++) AffineAnimStateReset(runtime, i);
};

export const AllocOamMatrix = (runtime: SpriteRuntime): number => {
  let bit = 1;
  let bitmap = runtime.gOamMatrixAllocBitmap;
  for (let i = 0; i < OAM_MATRIX_COUNT; i++, bit <<= 1) {
    if (!(bitmap & bit)) {
      runtime.gOamMatrixAllocBitmap |= bit;
      return i;
    }
  }
  return 0xff;
};

export const FreeOamMatrix = (runtime: SpriteRuntime, matrixNum: number): void => {
  runtime.gOamMatrixAllocBitmap &= ~(1 << matrixNum);
  SetOamMatrix(runtime, matrixNum, 0x100, 0, 0, 0x100);
};

export const InitSpriteAffineAnim = (runtime: SpriteRuntime, sprite: Sprite): void => {
  const matrixNum = AllocOamMatrix(runtime);
  if (matrixNum !== 0xff) {
    CalcCenterToCornerVec(sprite, sprite.oam.shape, sprite.oam.size, sprite.oam.affineMode);
    sprite.oam.matrixNum = matrixNum;
    sprite.affineAnimBeginning = true;
    AffineAnimStateReset(runtime, matrixNum);
  }
};

export const SetOamMatrixRotationScaling = (runtime: SpriteRuntime, matrixNum: number, xScale: number, yScale: number, rotation: number): void => {
  ObjAffineSetOne(runtime, matrixNum, ConvertScaleParam(xScale), ConvertScaleParam(yScale), rotation);
};

const ObjAffineSetOne = (runtime: SpriteRuntime, matrixNum: number, xScale: number, yScale: number, rotation: number): void => {
  const theta = (rotation >> 8) & 0xff;
  const sin = gSineTable[theta]!;
  const cos = gSineTable[theta + 64]!;
  CopyOamMatrix(runtime, matrixNum, {
    a: (xScale * cos) >> 8,
    b: -(xScale * sin) >> 8,
    c: (yScale * sin) >> 8,
    d: (yScale * cos) >> 8
  });
};

export const LoadSpriteSheet = (runtime: SpriteRuntime, sheet: SpriteSheet): number => {
  const tileStart = AllocSpriteTiles(runtime, Math.trunc(sheet.size / TILE_SIZE_4BPP));
  if (tileStart < 0) return 0;
  AllocSpriteTileRange(runtime, sheet.tag, tileStart, Math.trunc(sheet.size / TILE_SIZE_4BPP));
  runtime.operations.push(`CpuCopy16(${sheet.data},OBJ_VRAM0+${TILE_SIZE_4BPP * tileStart},${sheet.size})`);
  return tileStart;
};

export const LoadSpriteSheets = (runtime: SpriteRuntime, sheets: SpriteSheet[]): void => {
  for (const sheet of sheets) {
    if (sheet.data === null) break;
    LoadSpriteSheet(runtime, sheet);
  }
};

export const FreeSpriteTilesByTag = (runtime: SpriteRuntime, tag: number): void => {
  const index = IndexOfSpriteTileTag(runtime, tag);
  if (index !== 0xff) {
    const start = runtime.sSpriteTileRanges[index * 2]!;
    const count = runtime.sSpriteTileRanges[index * 2 + 1]!;
    for (let i = start; i < start + count; i++) freeTile(runtime, i);
    runtime.sSpriteTileRangeTags[index] = TAG_NONE;
  }
};

export const FreeSpriteTileRanges = (runtime: SpriteRuntime): void => {
  for (let i = 0; i < MAX_SPRITES; i++) {
    runtime.sSpriteTileRangeTags[i] = TAG_NONE;
    runtime.sSpriteTileRanges[i * 2] = 0;
    runtime.sSpriteTileRanges[i * 2 + 1] = 0;
  }
};

export const GetSpriteTileStartByTag = (runtime: SpriteRuntime, tag: number): number => {
  const index = IndexOfSpriteTileTag(runtime, tag);
  return index === 0xff ? TAG_NONE : runtime.sSpriteTileRanges[index * 2]!;
};
export const IndexOfSpriteTileTag = (runtime: SpriteRuntime, tag: number): number => runtime.sSpriteTileRangeTags.findIndex((entry) => entry === tag) === -1 ? 0xff : runtime.sSpriteTileRangeTags.findIndex((entry) => entry === tag);
export const GetSpriteTileTagByTileStart = (runtime: SpriteRuntime, start: number): number => {
  for (let i = 0; i < MAX_SPRITES; i++) if (runtime.sSpriteTileRangeTags[i] !== TAG_NONE && runtime.sSpriteTileRanges[i * 2] === start) return runtime.sSpriteTileRangeTags[i]!;
  return TAG_NONE;
};
export const AllocSpriteTileRange = (runtime: SpriteRuntime, tag: number, start: number, count: number): void => {
  const freeIndex = IndexOfSpriteTileTag(runtime, TAG_NONE);
  runtime.sSpriteTileRangeTags[freeIndex] = tag;
  runtime.sSpriteTileRanges[freeIndex * 2] = start;
  runtime.sSpriteTileRanges[freeIndex * 2 + 1] = count;
};

export const FreeAllSpritePalettes = (runtime: SpriteRuntime): void => {
  runtime.gReservedSpritePaletteCount = 0;
  runtime.sSpritePaletteTags.fill(TAG_NONE);
};
export const LoadSpritePalette = (runtime: SpriteRuntime, palette: SpritePalette): number => {
  let index = IndexOfSpritePaletteTag(runtime, palette.tag);
  if (index !== 0xff) return index;
  index = IndexOfSpritePaletteTag(runtime, TAG_NONE);
  if (index === 0xff) return 0xff;
  runtime.sSpritePaletteTags[index] = palette.tag;
  DoLoadSpritePalette(runtime, palette.data, index * 16);
  return index;
};
export const LoadSpritePalettes = (runtime: SpriteRuntime, palettes: SpritePalette[]): void => {
  for (const palette of palettes) {
    if (palette.data === null) break;
    if (LoadSpritePalette(runtime, palette) === 0xff) break;
  }
};
export const AllocSpritePalette = (runtime: SpriteRuntime, tag: number): number => {
  const index = IndexOfSpritePaletteTag(runtime, TAG_NONE);
  if (index === 0xff) return 0xff;
  runtime.sSpritePaletteTags[index] = tag;
  return index;
};
export const IndexOfSpritePaletteTag = (runtime: SpriteRuntime, tag: number): number => {
  for (let i = runtime.gReservedSpritePaletteCount; i < 16; i++) if (runtime.sSpritePaletteTags[i] === tag) return i;
  return 0xff;
};
export const GetSpritePaletteTagByPaletteNum = (runtime: SpriteRuntime, paletteNum: number): number => runtime.sSpritePaletteTags[paletteNum]!;
export const DoLoadSpritePalette = (runtime: SpriteRuntime, src: string | null, paletteOffset: number): void => {
  runtime.operations.push(`LoadPalette(${src},${paletteOffset + OBJ_PLTT_OFFSET},${PLTT_SIZE_4BPP})`);
};
export const FreeSpritePaletteByTag = (runtime: SpriteRuntime, tag: number): void => {
  const index = IndexOfSpritePaletteTag(runtime, tag);
  if (index !== 0xff) runtime.sSpritePaletteTags[index] = TAG_NONE;
};

export const SetSubspriteTables = (sprite: Sprite, subspriteTables: SubspriteTable[]): void => {
  sprite.subspriteTables = subspriteTables;
  sprite.subspriteTableNum = 0;
  sprite.subspriteMode = SUBSPRITES_ON;
};

export const AddSpriteToOamBuffer = (runtime: SpriteRuntime, sprite: Sprite, oamIndex: number): { full: boolean; oamIndex: number } => {
  if (oamIndex >= runtime.gOamLimit) return { full: true, oamIndex };
  if (!sprite.subspriteTables || sprite.subspriteMode === SUBSPRITES_OFF) {
    runtime.oamBuffer[oamIndex++] = cloneOam(sprite.oam);
    return { full: false, oamIndex };
  }
  return AddSubspritesToOamBuffer(runtime, sprite, oamIndex);
};

export const AddSubspritesToOamBuffer = (runtime: SpriteRuntime, sprite: Sprite, oamIndex: number): { full: boolean; oamIndex: number } => {
  if (oamIndex >= runtime.gOamLimit) return { full: true, oamIndex };
  const table = sprite.subspriteTables?.[sprite.subspriteTableNum];
  if (!table || !table.subsprites) {
    runtime.oamBuffer[oamIndex++] = cloneOam(sprite.oam);
    return { full: false, oamIndex };
  }
  const hFlip = (sprite.oam.matrixNum >> 3) & 1;
  const vFlip = (sprite.oam.matrixNum >> 4) & 1;
  const baseX = sprite.oam.x - sprite.centerToCornerVecX;
  const baseY = sprite.oam.y - sprite.centerToCornerVecY;
  for (let i = 0; i < table.subspriteCount; i++, oamIndex++) {
    if (oamIndex >= runtime.gOamLimit) return { full: true, oamIndex };
    const sub = table.subsprites[i]!;
    let x = sub.x;
    let y = sub.y;
    if (hFlip) {
      const width = oamDimensions[sub.shape]![sub.size]![0];
      x = ~((x + width) & 0xffff) + 1;
    }
    if (vFlip) {
      const height = oamDimensions[sub.shape]![sub.size]![1];
      y = ~((y + height) & 0xffff) + 1;
    }
    const dest = cloneOam(sprite.oam);
    dest.shape = sub.shape;
    dest.size = sub.size;
    dest.x = baseX + x;
    dest.y = baseY + y;
    dest.tileNum = sprite.oam.tileNum + sub.tileOffset;
    if (sprite.subspriteMode !== SUBSPRITES_IGNORE_PRIORITY) dest.priority = sub.priority;
    runtime.oamBuffer[oamIndex] = dest;
  }
  return { full: false, oamIndex };
};
