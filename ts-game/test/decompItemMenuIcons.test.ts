import { describe, expect, test } from 'vitest';
import {
  AFFINEANIM_BAG_IDLE,
  AFFINEANIM_BAG_SHAKE,
  ANIM_SWAP_LINE_END,
  ANIM_SWAP_LINE_MID,
  ITEMICON_PAL,
  ITEMICON_TILES,
  ITEM_NONE,
  ITEMS_COUNT,
  MAX_SPRITES,
  NUM_SWAP_LINE_SPRITES,
  SPRITE_NONE,
  SPR_BAG,
  SPR_ITEM_ICON,
  SPR_SWAP_LINE_START,
  TAG_ITEM_ICON,
  SpriteCB_BagVisualSwitchingPockets,
  SpriteCB_ShakeBagSprite,
  TryAllocItemIconTilesBuffers,
  addItemIconObject,
  addItemIconObjectWithCustomObjectTemplate,
  copyItemIconPicTo4x4Buffer,
  createBagSprite,
  createBerryPouchItemIcon,
  createItemMenuIcon,
  createItemMenuIconsRuntime,
  createSwapLine,
  destroyItemMenuIcon,
  getItemIconGfxPtr,
  resetItemMenuIconState,
  setBagVisualPocketId,
  setSwapLineInvisibility,
  shakeBagSprite,
  spriteCB_BagVisualSwitchingPockets,
  spriteCB_ShakeBagSprite,
  spriteCallbackDummy,
  updateSwapLinePos,
  type SpriteTemplate
} from '../src/game/decompItemMenuIcons';

const iconTable = (): Array<[Uint8Array, Uint8Array]> =>
  Array.from({ length: ITEMS_COUNT + 1 }, (_, itemId) => [
    Uint8Array.from(Array.from({ length: 0x120 }, (_, i) => (itemId + i) & 0xff)),
    Uint8Array.of((itemId + 0x80) & 0xff)
  ]);

describe('decomp item menu icons', () => {
  test('ResetItemMenuIconState fills every sprite slot with SPRITE_NONE', () => {
    const runtime = createItemMenuIconsRuntime();
    runtime.itemMenuIconSpriteIds.fill(7);

    resetItemMenuIconState(runtime);

    expect([...runtime.itemMenuIconSpriteIds]).toEqual(Array(runtime.itemMenuIconSpriteIds.length).fill(SPRITE_NONE));
  });

  test('bag sprite creation and callbacks match the visual pocket switching and shake flow', () => {
    const runtime = createItemMenuIconsRuntime();

    createBagSprite(runtime, 2);
    const sprite = runtime.sprites[runtime.itemMenuIconSpriteIds[SPR_BAG]];

    expect(sprite.x).toBe(40);
    expect(sprite.y).toBe(68);
    expect(sprite.y2).toBe(-5);
    expect(sprite.animNum).toBe(2);
    expect(sprite.callback).toBe(spriteCB_BagVisualSwitchingPockets);

    sprite.callback(runtime, sprite);
    expect(sprite.y2).toBe(-4);
    sprite.y2 = 0;
    sprite.callback(runtime, sprite);
    expect(sprite.callback).toBe(spriteCallbackDummy);

    shakeBagSprite(runtime);
    expect(sprite.affineAnimNum).toBe(AFFINEANIM_BAG_SHAKE);
    expect(sprite.affineAnimEnded).toBe(false);
    expect(sprite.callback).toBe(spriteCB_ShakeBagSprite);
    sprite.affineAnimEnded = true;
    sprite.callback(runtime, sprite);
    expect(sprite.affineAnimNum).toBe(AFFINEANIM_BAG_IDLE);
    expect(sprite.callback).toBe(spriteCallbackDummy);

    setBagVisualPocketId(runtime, 1);
    expect(sprite.y2).toBe(-5);
    expect(sprite.animNum).toBe(1);
  });

  test('exact C-name static helpers keep callback and allocation behavior', () => {
    const runtime = createItemMenuIconsRuntime();
    const sprite = {
      id: 0,
      template: { tileTag: 0, paletteTag: 0, callback: spriteCallbackDummy },
      x: 0,
      y: 0,
      x2: 0,
      y2: -1,
      animNum: 0,
      affineAnimNum: AFFINEANIM_BAG_SHAKE,
      affineAnimEnded: true,
      invisible: false,
      destroyed: false,
      callback: SpriteCB_BagVisualSwitchingPockets
    };

    SpriteCB_BagVisualSwitchingPockets(runtime, sprite);
    expect(sprite.y2).toBe(0);
    SpriteCB_BagVisualSwitchingPockets(runtime, sprite);
    expect(sprite.callback).toBe(spriteCallbackDummy);

    sprite.callback = SpriteCB_ShakeBagSprite;
    SpriteCB_ShakeBagSprite(runtime, sprite);
    expect(sprite.affineAnimNum).toBe(AFFINEANIM_BAG_IDLE);
    expect(sprite.affineAnimEnded).toBe(false);
    expect(sprite.callback).toBe(spriteCallbackDummy);

    expect(TryAllocItemIconTilesBuffers(runtime)).toBe(true);
    expect(runtime.itemIconTilesBuffer).toHaveLength(0x120);
    expect(runtime.itemIconTilesBufferPadded).toHaveLength(0x200);

    const failing = createItemMenuIconsRuntime({ allocationsFail: true });
    expect(TryAllocItemIconTilesBuffers(failing)).toBe(false);
    expect(failing.itemIconTilesBuffer).toBeNull();
  });

  test('CreateSwapLine creates nine invisible sprites with start, mid, and end animation indexes', () => {
    const runtime = createItemMenuIconsRuntime();

    createSwapLine(runtime);

    const ids = [...runtime.itemMenuIconSpriteIds.slice(SPR_SWAP_LINE_START, SPR_SWAP_LINE_START + NUM_SWAP_LINE_SPRITES)];
    expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(ids.map((id) => runtime.sprites[id].x)).toEqual([96, 112, 128, 144, 160, 176, 192, 208, 224]);
    expect(ids.map((id) => runtime.sprites[id].y)).toEqual(Array(9).fill(7));
    expect(ids.map((id) => runtime.sprites[id].animNum)).toEqual([
      0,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_MID,
      ANIM_SWAP_LINE_END
    ]);
    expect(ids.every((id) => runtime.sprites[id].invisible)).toBe(true);

    setSwapLineInvisibility(runtime, false);
    updateSwapLinePos(runtime, -3, 20);
    expect(ids.every((id) => !runtime.sprites[id].invisible)).toBe(true);
    expect(ids.map((id) => runtime.sprites[id].x2)).toEqual(Array(9).fill(-3));
    expect(ids.map((id) => runtime.sprites[id].y)).toEqual(Array(9).fill(27));
  });

  test('CopyItemIconPicTo4x4Buffer copies three 0x60-byte rows into 0x80-byte row slots', () => {
    const src = Uint8Array.from(Array.from({ length: 0x120 }, (_, i) => i & 0xff));
    const dest = new Uint8Array(0x200).fill(0xaa);

    copyItemIconPicTo4x4Buffer(src, dest);

    expect([...dest.slice(0, 0x60)]).toEqual([...src.slice(0, 0x60)]);
    expect([...dest.slice(0x60, 0x80)]).toEqual(Array(0x20).fill(0xaa));
    expect([...dest.slice(0x80, 0xe0)]).toEqual([...src.slice(0x60, 0xc0)]);
    expect([...dest.slice(0xe0, 0x100)]).toEqual(Array(0x20).fill(0xaa));
    expect([...dest.slice(0x100, 0x160)]).toEqual([...src.slice(0xc0, 0x120)]);
    expect([...dest.slice(0x160)]).toEqual(Array(0xa0).fill(0xaa));
  });

  test('AddItemIconObject allocates buffers, decompresses tiles, loads sheet and palette, creates sprite, then frees buffers', () => {
    const runtime = createItemMenuIconsRuntime({
      itemIconTable: iconTable(),
      lzDecompressWram: (src, dest) => {
        dest.set(src.subarray(0, dest.length));
      }
    });

    const spriteId = addItemIconObject(runtime, 500, 501, 13);

    expect(spriteId).toBe(0);
    expect(runtime.loadedSpriteSheets).toHaveLength(1);
    expect(runtime.loadedSpriteSheets[0].size).toBe(0x200);
    expect(runtime.loadedSpriteSheets[0].tag).toBe(500);
    expect([...runtime.loadedSpriteSheets[0].data.slice(0, 0x60)]).toEqual([
      ...runtime.itemIconTable[13][ITEMICON_TILES].slice(0, 0x60)
    ]);
    expect(runtime.loadedCompressedSpritePalettes).toEqual([
      { data: runtime.itemIconTable[13][ITEMICON_PAL], tag: 501 }
    ]);
    expect(runtime.sprites[spriteId].template.tileTag).toBe(500);
    expect(runtime.sprites[spriteId].template.paletteTag).toBe(501);
    expect(runtime.freedBuffers).toHaveLength(2);
    expect(runtime.itemIconTilesBuffer).toBeNull();
    expect(runtime.itemIconTilesBufferPadded).toBeNull();
  });

  test('AddItemIconObject returns MAX_SPRITES on allocation failure without creating sprite resources', () => {
    const runtime = createItemMenuIconsRuntime({ allocationsFail: true });

    expect(addItemIconObject(runtime, 1, 2, 3)).toBe(MAX_SPRITES);

    expect(runtime.sprites).toHaveLength(0);
    expect(runtime.loadedSpriteSheets).toHaveLength(0);
    expect(runtime.loadedCompressedSpritePalettes).toHaveLength(0);
  });

  test('custom object template is copied and then has tile and palette tags overwritten', () => {
    const customTemplate: SpriteTemplate = {
      tileTag: 10,
      paletteTag: 11,
      callback: spriteCallbackDummy,
      name: 'Custom'
    };
    const runtime = createItemMenuIconsRuntime({ itemIconTable: iconTable() });

    const spriteId = addItemIconObjectWithCustomObjectTemplate(runtime, customTemplate, 12, 13, 1);

    expect(runtime.sprites[spriteId].template).toMatchObject({
      tileTag: 12,
      paletteTag: 13,
      name: 'Custom'
    });
    expect(customTemplate.tileTag).toBe(10);
    expect(customTemplate.paletteTag).toBe(11);
  });

  test('CreateItemMenuIcon and CreateBerryPouchItemIcon only create absent icons and set the original offsets', () => {
    const runtime = createItemMenuIconsRuntime({ itemIconTable: iconTable() });

    createItemMenuIcon(runtime, 5, 0);
    createItemMenuIcon(runtime, 6, 0);
    createBerryPouchItemIcon(runtime, 7, 1);

    const normal = runtime.sprites[runtime.itemMenuIconSpriteIds[SPR_ITEM_ICON]];
    const berry = runtime.sprites[runtime.itemMenuIconSpriteIds[SPR_ITEM_ICON + 1]];
    expect(normal.x2).toBe(24);
    expect(normal.y2).toBe(140);
    expect(berry.x2).toBe(24);
    expect(berry.y2).toBe(147);
    expect(runtime.sprites).toHaveLength(2);
    expect(runtime.freedTileTags).toEqual([TAG_ITEM_ICON, TAG_ITEM_ICON + 1]);
    expect(runtime.freedPaletteTags).toEqual([TAG_ITEM_ICON, TAG_ITEM_ICON + 1]);
  });

  test('DestroyItemMenuIcon frees resources and resets the sprite id slot', () => {
    const runtime = createItemMenuIconsRuntime({ itemIconTable: iconTable() });
    createItemMenuIcon(runtime, 5, 0);
    const spriteId = runtime.itemMenuIconSpriteIds[SPR_ITEM_ICON];

    destroyItemMenuIcon(runtime, 0);
    destroyItemMenuIcon(runtime, 0);

    expect(runtime.sprites[spriteId].destroyed).toBe(true);
    expect(runtime.itemMenuIconSpriteIds[SPR_ITEM_ICON]).toBe(SPRITE_NONE);
    expect(runtime.freedTileTags.slice(-1)).toEqual([TAG_ITEM_ICON]);
    expect(runtime.freedPaletteTags.slice(-1)).toEqual([TAG_ITEM_ICON]);
  });

  test('GetItemIconGfxPtr clamps item ids above ITEMS_COUNT to ITEM_NONE', () => {
    const runtime = createItemMenuIconsRuntime({ itemIconTable: iconTable() });

    expect(getItemIconGfxPtr(runtime, 25, ITEMICON_TILES)).toBe(runtime.itemIconTable[25][ITEMICON_TILES]);
    expect(getItemIconGfxPtr(runtime, ITEMS_COUNT + 1, ITEMICON_TILES)).toBe(
      runtime.itemIconTable[ITEM_NONE][ITEMICON_TILES]
    );
    expect(getItemIconGfxPtr(runtime, ITEMS_COUNT + 1, ITEMICON_PAL)).toBe(
      runtime.itemIconTable[ITEM_NONE][ITEMICON_PAL]
    );
  });
});
