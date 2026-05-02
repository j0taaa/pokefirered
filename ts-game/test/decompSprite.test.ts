import { describe, expect, test } from 'vitest';
import {
  AFFINE_ANIM_END,
  ANIM_END,
  AddSpriteToOamBuffer,
  AnimateSprite,
  BuildOamBuffer,
  CopyFromSprites,
  CopyToSprites,
  CreateInvisibleSprite,
  CreateSprite,
  CreateSpriteAndAnimate,
  DoLoadSpritePalette,
  DestroySprite,
  FreeOamMatrix,
  FreeSpritePaletteByTag,
  FreeSpriteTilesByTag,
  GetAnchorCoord,
  GetSpritePaletteTagByPaletteNum,
  GetSpriteTileStartByTag,
  GetSpriteTileTagByTileStart,
  IndexOfSpritePaletteTag,
  LoadSpritePalette,
  LoadSpriteSheet,
  OBJ_PLTT_OFFSET,
  PLTT_SIZE_4BPP,
  ProcessSpriteCopyRequests,
  RequestSpriteCopy,
  ResetSpriteData,
  SUBSPRITES_IGNORE_PRIORITY,
  ST_OAM_AFFINE_NORMAL,
  ST_OAM_AFFINE_OFF,
  ST_OAM_H_RECTANGLE,
  ST_OAM_SIZE_0,
  ST_OAM_SIZE_1,
  ST_OAM_SQUARE,
  SetSpriteMatrixAnchor,
  SetSubspriteTables,
  SpriteTileAllocBitmapOp,
  TAG_NONE,
  TILE_SIZE_4BPP,
  createSpriteRuntime,
  gDummyOamData,
  type OamData,
  type SpriteCallback,
  type SpriteTemplate
} from '../src/game/decompSprite';

const baseOam = (overrides: Partial<OamData> = {}): OamData => ({
  y: 0,
  affineMode: ST_OAM_AFFINE_OFF,
  objMode: 0,
  mosaic: false,
  bpp: 0,
  shape: ST_OAM_SQUARE,
  x: 0,
  matrixNum: 0,
  size: ST_OAM_SIZE_0,
  tileNum: 0,
  priority: 2,
  paletteNum: 0,
  affineParam: 0,
  ...overrides
});

const makeTemplate = (overrides: Partial<SpriteTemplate> = {}): SpriteTemplate => ({
  tileTag: TAG_NONE,
  paletteTag: TAG_NONE,
  oam: baseOam(),
  anims: [[{ type: 'frame', imageValue: 0, duration: 1 }, { type: 'end' }]],
  images: [{ data: 'frame0', size: TILE_SIZE_4BPP }],
  affineAnims: [[{ type: 'end' }]],
  callback: (() => {}) as SpriteCallback,
  ...overrides
});

describe('decompSprite', () => {
  test('ResetSpriteData mirrors the C globals, dummy sprites, and reserved tile clearing', () => {
    const runtime = createSpriteRuntime({
      gOamLimit: 7,
      gReservedSpriteTileCount: 2,
      gSpriteCoordOffsetX: 11,
      gSpriteCoordOffsetY: 13,
      gShouldProcessSpriteCopyRequests: true,
      gSpriteCopyRequestCount: 1
    });
    SpriteTileAllocBitmapOp(runtime, 1, 1);
    SpriteTileAllocBitmapOp(runtime, 2, 1);
    runtime.gSprites[0]!.inUse = true;
    runtime.oamBuffer[0] = baseOam({ x: 99, y: 88 });

    ResetSpriteData(runtime);

    expect(runtime.gOamLimit).toBe(64);
    expect(runtime.gReservedSpriteTileCount).toBe(0);
    expect(runtime.gSpriteCoordOffsetX).toBe(0);
    expect(runtime.gSpriteCoordOffsetY).toBe(0);
    expect(runtime.gShouldProcessSpriteCopyRequests).toBe(false);
    expect(runtime.gSpriteCopyRequestCount).toBe(0);
    expect(runtime.gSprites[0]).toMatchObject({ inUse: false, x: 304, y: 160, subpriority: 0xff });
    expect(runtime.gSpriteOrder.slice(0, 4)).toEqual([0, 1, 2, 3]);
    expect(runtime.oamBuffer[0]).toEqual(gDummyOamData);
    expect(runtime.gSpriteTileAllocBitmap.every((entry) => entry === 0)).toBe(true);
    expect(runtime.sSpriteTileRangeTags.every((tag) => tag === TAG_NONE)).toBe(true);
    expect(runtime.gOamMatrixAllocBitmap).toBe(0);
    expect(runtime.gOamMatrices[0]).toEqual({ a: 0x100, b: 0, c: 0, d: 0x100 });
  });

  test('sprite sheet and palette helpers allocate, find, and free exact tag ranges', () => {
    const runtime = createSpriteRuntime();

    expect(LoadSpriteSheet(runtime, { data: 'sheetA', size: TILE_SIZE_4BPP * 3, tag: 0x1234 })).toBe(0);
    expect(GetSpriteTileStartByTag(runtime, 0x1234)).toBe(0);
    expect(GetSpriteTileTagByTileStart(runtime, 0)).toBe(0x1234);
    expect(SpriteTileAllocBitmapOp(runtime, 2, 2)).toBe(1 << 2);
    expect(runtime.operations.at(-1)).toBe(`CpuCopy16(sheetA,OBJ_VRAM0+0,${TILE_SIZE_4BPP * 3})`);
    FreeSpriteTilesByTag(runtime, 0x1234);
    expect(GetSpriteTileStartByTag(runtime, 0x1234)).toBe(TAG_NONE);
    expect(SpriteTileAllocBitmapOp(runtime, 2, 2)).toBe(0);

    runtime.gReservedSpritePaletteCount = 1;
    runtime.sSpritePaletteTags[0] = 0xbeef;
    expect(LoadSpritePalette(runtime, { data: 'palA', tag: 0x2222 })).toBe(1);
    expect(LoadSpritePalette(runtime, { data: 'palAgain', tag: 0x2222 })).toBe(1);
    expect(IndexOfSpritePaletteTag(runtime, 0xbeef)).toBe(0xff);
    expect(GetSpritePaletteTagByPaletteNum(runtime, 1)).toBe(0x2222);
    expect(runtime.operations.at(-1)).toBe(`LoadPalette(palA,${OBJ_PLTT_OFFSET + 16},${PLTT_SIZE_4BPP})`);
    FreeSpritePaletteByTag(runtime, 0x2222);
    expect(IndexOfSpritePaletteTag(runtime, 0x2222)).toBe(0xff);
  });

  test('CopyFromSprites, CopyToSprites, GetAnchorCoord, and DoLoadSpritePalette expose exact C helpers', () => {
    const runtime = createSpriteRuntime();
    runtime.gSprites[0]!.x = 42;
    runtime.gSprites[0]!.data[0] = 7;

    const copied = CopyFromSprites(runtime);
    expect(copied).toHaveLength(64);
    expect(copied[0]!.x).toBe(42);
    copied[0]!.x = 99;
    copied[0]!.data[0] = 12;
    expect(runtime.gSprites[0]!.x).toBe(42);
    expect(runtime.gSprites[0]!.data[0]).toBe(7);

    CopyToSprites(runtime, copied);
    expect(runtime.gSprites[0]!.x).toBe(99);
    expect(runtime.gSprites[0]!.data[0]).toBe(12);

    expect(GetAnchorCoord(64 << 8, 32 << 8, 12)).toBe(-10);
    expect(GetAnchorCoord(64 << 8, 96 << 8, 12)).toBe(10);

    DoLoadSpritePalette(runtime, 'manualPal', 32);
    expect(runtime.operations.at(-1)).toBe(`LoadPalette(manualPal,${OBJ_PLTT_OFFSET + 32},${PLTT_SIZE_4BPP})`);
  });

  test('CreateSprite handles sheet-backed and image-backed sprites, callbacks, animation, and destruction', () => {
    const runtime = createSpriteRuntime();
    LoadSpriteSheet(runtime, { data: 'sheetB', size: TILE_SIZE_4BPP * 8, tag: 0x4444 });
    LoadSpritePalette(runtime, { data: 'palB', tag: 0x5555 });
    const callback: SpriteCallback = (_runtime, sprite) => {
      sprite.data[0]++;
    };
    const sheetTemplate = makeTemplate({
      tileTag: 0x4444,
      paletteTag: 0x5555,
      oam: baseOam({ shape: ST_OAM_H_RECTANGLE, size: ST_OAM_SIZE_1 }),
      anims: [[{ type: 'frame', imageValue: 4, duration: 2, hFlip: 1 }, { type: 'end' }]],
      images: null,
      callback
    });

    const sheetId = CreateSpriteAndAnimate(runtime, sheetTemplate, 40, 50, 3);
    const sheetSprite = runtime.gSprites[sheetId]!;
    expect(sheetId).toBe(0);
    expect(sheetSprite.inUse).toBe(true);
    expect(sheetSprite.data[0]).toBe(1);
    expect(sheetSprite.usingSheet).toBe(true);
    expect(sheetSprite.sheetTileStart).toBe(0);
    expect(sheetSprite.oam.tileNum).toBe(4);
    expect(sheetSprite.oam.paletteNum).toBe(0);
    expect(sheetSprite.oam.matrixNum).toBe(1 << 3);
    expect(sheetSprite.animDelayCounter).toBe(1);
    expect(sheetSprite.centerToCornerVecX).toBe(-16);
    expect(sheetSprite.centerToCornerVecY).toBe(-4);

    const imageTemplate = makeTemplate({
      anims: [[{ type: 'frame', imageValue: 1, duration: 1 }, { type: 'end' }]],
      images: [
        { data: 'unused', size: TILE_SIZE_4BPP * 2 },
        { data: 'dynamicFrame', size: TILE_SIZE_4BPP * 2 }
      ]
    });
    const imageId = CreateSprite(runtime, imageTemplate, 8, 9, 1);
    const imageSprite = runtime.gSprites[imageId]!;
    expect(imageSprite.usingSheet).toBe(false);
    expect(SpriteTileAllocBitmapOp(runtime, imageSprite.oam.tileNum, 2)).not.toBe(0);
    AnimateSprite(runtime, imageSprite);
    expect(runtime.gSpriteCopyRequests[0]).toEqual({ src: 'dynamicFrame', dest: `OBJ_VRAM0+${TILE_SIZE_4BPP * imageSprite.oam.tileNum}`, size: TILE_SIZE_4BPP * 2 });

    DestroySprite(runtime, imageSprite);
    expect(imageSprite.inUse).toBe(false);
    expect(SpriteTileAllocBitmapOp(runtime, 8, 0)).toBe(0);

    const invisibleId = CreateInvisibleSprite(runtime, callback);
    expect(runtime.gSprites[invisibleId]).toMatchObject({ inUse: true, invisible: true, callback });
  });

  test('BuildOamBuffer updates coordinates, sorts by priority/y, appends dummy OAM, and queues copies', () => {
    const runtime = createSpriteRuntime({ gOamLimit: 64, gSpriteCoordOffsetX: 3, gSpriteCoordOffsetY: 4 });
    const template = makeTemplate({ tileTag: 0x7777, images: null, anims: [[{ type: 'frame', imageValue: 0, duration: 1 }, { type: 'end' }]] });
    LoadSpriteSheet(runtime, { data: 'sheetC', size: TILE_SIZE_4BPP, tag: 0x7777 });

    const a = CreateSprite(runtime, template, 20, 10, 2);
    const b = CreateSprite(runtime, template, 30, 20, 1);
    const c = CreateSprite(runtime, template, 40, 30, 1);
    runtime.gSprites[a]!.coordOffsetEnabled = true;
    runtime.gSprites[a]!.oam.priority = 1;
    runtime.gSprites[b]!.oam.priority = 0;
    runtime.gSprites[c]!.oam.priority = 0;

    BuildOamBuffer(runtime);

    expect(runtime.gSprites[a]!.oam).toMatchObject({ x: 19, y: 10 });
    expect(runtime.gSpriteOrder.slice(0, 3)).toEqual([c, b, a]);
    expect(runtime.oamBuffer[0]).toMatchObject({ x: 36, y: 26 });
    expect(runtime.oamBuffer[1]).toMatchObject({ x: 26, y: 16 });
    expect(runtime.oamBuffer[3]).toEqual({ ...gDummyOamData, affineParam: 0x100 });
    expect(runtime.gShouldProcessSpriteCopyRequests).toBe(true);

    RequestSpriteCopy(runtime, 'src', 'dst', 12);
    ProcessSpriteCopyRequests(runtime);
    expect(runtime.copiedRequests).toEqual([{ src: 'src', dest: 'dst', size: 12 }]);
    expect(runtime.gShouldProcessSpriteCopyRequests).toBe(false);
  });

  test('animation commands preserve frame delay, end, jump, and exported sentinel values', () => {
    const runtime = createSpriteRuntime();
    const template = makeTemplate({
      tileTag: 0x8888,
      images: null,
      anims: [[
        { type: 'frame', imageValue: 1, duration: 2 },
        { type: 'frame', imageValue: 3, duration: 1 },
        { type: 'jump', target: 1 },
        { type: 'end' }
      ]]
    });
    LoadSpriteSheet(runtime, { data: 'sheetD', size: TILE_SIZE_4BPP * 8, tag: 0x8888 });
    const id = CreateSprite(runtime, template, 0, 0, 0);
    const sprite = runtime.gSprites[id]!;

    AnimateSprite(runtime, sprite);
    expect(sprite.oam.tileNum).toBe(1);
    expect(sprite.animDelayCounter).toBe(1);
    AnimateSprite(runtime, sprite);
    expect(sprite.animCmdIndex).toBe(0);
    expect(sprite.animDelayCounter).toBe(0);
    AnimateSprite(runtime, sprite);
    expect(sprite.oam.tileNum).toBe(3);
    AnimateSprite(runtime, sprite);
    expect(sprite.animCmdIndex).toBe(1);
    expect(sprite.oam.tileNum).toBe(3);
    expect(ANIM_END).toBe(0xffff);
    expect(AFFINE_ANIM_END).toBe(0x7fff);
  });

  test('affine sprites allocate matrices, apply frame state, anchors, and free resources', () => {
    const runtime = createSpriteRuntime();
    const template = makeTemplate({
      oam: baseOam({ affineMode: ST_OAM_AFFINE_NORMAL, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_1 }),
      affineAnims: [[{ type: 'frame', xScale: 0x100, yScale: 0x100, rotation: 2, duration: 2 }, { type: 'end' }]]
    });

    const id = CreateSprite(runtime, template, 32, 32, 0);
    const sprite = runtime.gSprites[id]!;
    expect(sprite.oam.matrixNum).toBe(0);
    expect(runtime.gOamMatrixAllocBitmap).toBe(1);

    SetSpriteMatrixAnchor(sprite, 6, 7);
    AnimateSprite(runtime, sprite);
    expect(sprite.affineAnimBeginning).toBe(false);
    expect(runtime.sAffineAnimStates[0]).toMatchObject({ xScale: 0x200, yScale: 0x200, rotation: 0x200, delayCounter: 1 });
    expect(runtime.gOamMatrices[0]).toEqual({ a: 127, b: -6, c: 6, d: 127 });
    expect(sprite.x2).not.toBe(0);
    expect(sprite.y2).not.toBe(0);

    AnimateSprite(runtime, sprite);
    expect(runtime.sAffineAnimStates[0]).toMatchObject({ xScale: 0x300, yScale: 0x300, rotation: 0x400, delayCounter: 0 });
    FreeOamMatrix(runtime, 0);
    expect(runtime.gOamMatrixAllocBitmap).toBe(0);
    expect(runtime.gOamMatrices[0]).toEqual({ a: 0x100, b: 0, c: 0, d: 0x100 });
  });

  test('subsprites expand into OAM entries with inherited tile base and priority modes', () => {
    const runtime = createSpriteRuntime({ gOamLimit: 4 });
    const template = makeTemplate({ tileTag: 0x9999, images: null });
    LoadSpriteSheet(runtime, { data: 'sheetE', size: TILE_SIZE_4BPP * 8, tag: 0x9999 });
    const id = CreateSprite(runtime, template, 24, 24, 0);
    const sprite = runtime.gSprites[id]!;
    sprite.oam = baseOam({ x: 20, y: 22, tileNum: 5, priority: 3 });
    SetSubspriteTables(sprite, [{
      subspriteCount: 2,
      subsprites: [
        { x: 0, y: 0, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_0, tileOffset: 0, priority: 1 },
        { x: 8, y: 0, shape: ST_OAM_SQUARE, size: ST_OAM_SIZE_0, tileOffset: 2, priority: 2 }
      ]
    }]);

    expect(AddSpriteToOamBuffer(runtime, sprite, 0)).toEqual({ full: false, oamIndex: 2 });
    expect(runtime.oamBuffer[0]).toMatchObject({ x: 24, y: 26, tileNum: 5, priority: 1 });
    expect(runtime.oamBuffer[1]).toMatchObject({ x: 32, y: 26, tileNum: 7, priority: 2 });

    sprite.subspriteMode = SUBSPRITES_IGNORE_PRIORITY;
    expect(AddSpriteToOamBuffer(runtime, sprite, 2)).toEqual({ full: false, oamIndex: 4 });
    expect(runtime.oamBuffer[2]).toMatchObject({ priority: 3 });
    expect(runtime.oamBuffer[3]).toMatchObject({ priority: 3 });
  });
});
