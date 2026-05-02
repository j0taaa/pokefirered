import { describe, expect, test } from 'vitest';
import {
  AddScrollIndicatorArrowObject,
  AddScrollIndicatorArrowPair,
  AddScrollIndicatorArrowPairParameterized,
  ListMenuAddCursorObjectInternal,
  ListMenuAddRedArrowCursorObject,
  ListMenuAddRedOutlineCursorObject,
  ListMenuGetRedOutlineCursorSpriteCount,
  ListMenuRemoveCursorObject,
  ListMenuRemoveRedArrowCursorObject,
  ListMenuRemoveRedOutlineCursorObject,
  ListMenuSetUpRedOutlineCursorSpriteOamTable,
  ListMenuUpdateCursorObject,
  ListMenuUpdateRedArrowCursorObject,
  ListMenuUpdateRedOutlineCursorObject,
  RemoveScrollIndicatorArrowPair,
  SCROLL_ARROW_DOWN,
  SCROLL_ARROW_LEFT,
  SCROLL_ARROW_RIGHT,
  SCROLL_ARROW_UP,
  SpriteCallback_RedArrowCursor,
  SpriteCallback_ScrollIndicatorArrow,
  TAG_NONE,
  Task_RedArrowCursor,
  Task_RedOutlineCursor,
  Task_ScrollIndicatorArrowPair,
  addScrollIndicatorArrowObject,
  addScrollIndicatorArrowPair,
  addScrollIndicatorArrowPairParameterized,
  createMenuIndicatorsRuntime,
  listMenuAddCursorObjectInternal,
  listMenuAddRedArrowCursorObject,
  listMenuAddRedOutlineCursorObject,
  listMenuGetRedOutlineCursorSpriteCount,
  listMenuRemoveCursorObject,
  listMenuRemoveRedArrowCursorObject,
  listMenuRemoveRedOutlineCursorObject,
  listMenuSetUpRedOutlineCursorSpriteOamTable,
  listMenuUpdateCursorObject,
  listMenuUpdateRedArrowCursorObject,
  listMenuUpdateRedOutlineCursorObject,
  removeScrollIndicatorArrowPair,
  sRedArrowGfx,
  sRedArrowOtherGfx,
  sSelectorOutlineGfx,
  sSubsprite_RedOutline1,
  spriteCallbackRedArrowCursor,
  spriteCallbackScrollIndicatorArrow,
  taskRedArrowCursor,
  taskRedOutlineCursor,
  taskScrollIndicatorArrowPair
} from '../src/game/decompMenuIndicators';

describe('decomp menu_indicators', () => {
  test('exact C function names are exported as the implemented menu indicator routines', () => {
    expect(SpriteCallback_ScrollIndicatorArrow).toBe(spriteCallbackScrollIndicatorArrow);
    expect(AddScrollIndicatorArrowObject).toBe(addScrollIndicatorArrowObject);
    expect(AddScrollIndicatorArrowPair).toBe(addScrollIndicatorArrowPair);
    expect(AddScrollIndicatorArrowPairParameterized).toBe(addScrollIndicatorArrowPairParameterized);
    expect(Task_ScrollIndicatorArrowPair).toBe(taskScrollIndicatorArrowPair);
    expect(RemoveScrollIndicatorArrowPair).toBe(removeScrollIndicatorArrowPair);
    expect(ListMenuAddCursorObjectInternal).toBe(listMenuAddCursorObjectInternal);
    expect(ListMenuUpdateCursorObject).toBe(listMenuUpdateCursorObject);
    expect(ListMenuRemoveCursorObject).toBe(listMenuRemoveCursorObject);
    expect(Task_RedOutlineCursor).toBe(taskRedOutlineCursor);
    expect(ListMenuGetRedOutlineCursorSpriteCount).toBe(listMenuGetRedOutlineCursorSpriteCount);
    expect(ListMenuSetUpRedOutlineCursorSpriteOamTable).toBe(listMenuSetUpRedOutlineCursorSpriteOamTable);
    expect(ListMenuAddRedOutlineCursorObject).toBe(listMenuAddRedOutlineCursorObject);
    expect(ListMenuUpdateRedOutlineCursorObject).toBe(listMenuUpdateRedOutlineCursorObject);
    expect(ListMenuRemoveRedOutlineCursorObject).toBe(listMenuRemoveRedOutlineCursorObject);
    expect(SpriteCallback_RedArrowCursor).toBe(spriteCallbackRedArrowCursor);
    expect(Task_RedArrowCursor).toBe(taskRedArrowCursor);
    expect(ListMenuAddRedArrowCursorObject).toBe(listMenuAddRedArrowCursorObject);
    expect(ListMenuUpdateRedArrowCursorObject).toBe(listMenuUpdateRedArrowCursorObject);
    expect(ListMenuRemoveRedArrowCursorObject).toBe(listMenuRemoveRedArrowCursorObject);
  });

  test('scroll indicator arrow objects initialize invisible sprite data from template table and animate on callback', () => {
    const runtime = createMenuIndicatorsRuntime();
    const spriteId = addScrollIndicatorArrowObject(runtime, SCROLL_ARROW_DOWN, 12, 34, 100, 200);
    const sprite = runtime.sprites[spriteId];

    expect(sprite).toMatchObject({ x: 12, y: 34, invisible: true, callback: 'SpriteCallback_ScrollIndicatorArrow' });
    expect(sprite.data.slice(0, 6)).toEqual([0, 3, 1, 2, -8, 0]);

    spriteCallbackScrollIndicatorArrow(sprite);
    expect(sprite.animNum).toBe(3);
    expect(sprite.data[0]).toBe(1);

    sprite.data[5] = 64;
    spriteCallbackScrollIndicatorArrow(sprite);
    expect(sprite.y2).toBe(2);
    expect(sprite.data[5]).toBe(56);
  });

  test('AddScrollIndicatorArrowPair loads resources, creates task data, applies palNum for TAG_NONE, and task toggles invisibility', () => {
    const runtime = createMenuIndicatorsRuntime();
    const scrollOffset = { value: 0 };
    const taskId = addScrollIndicatorArrowPair(runtime, {
      firstArrowType: SCROLL_ARROW_UP,
      firstX: 10,
      firstY: 20,
      secondArrowType: SCROLL_ARROW_DOWN,
      secondX: 30,
      secondY: 40,
      fullyUpThreshold: 0,
      fullyDownThreshold: 5,
      tileTag: 123,
      palTag: TAG_NONE,
      palNum: 7
    }, scrollOffset);

    expect(runtime.calls[0]).toEqual({ fn: 'LoadCompressedSpriteSheet', args: [{ data: sRedArrowOtherGfx, size: 0x100, tag: 123 }] });
    expect(runtime.calls[1]).toEqual({ fn: 'LoadPalette', args: ['graphics/interface/red_arrow.gbapal', 112, 'sizeof(sRedArrowPal)'] });
    const task = runtime.tasks[taskId];
    expect(task.func).toBe('Task_ScrollIndicatorArrowPair');
    if (task.func !== 'Task_ScrollIndicatorArrowPair') throw new Error('wrong task');
    expect(task.data).toMatchObject({ fullyUpThreshold: 0, fullyDownThreshold: 5, tileTag: 123, palTag: TAG_NONE });
    expect(runtime.sprites[task.data.topSpriteId].oam.paletteNum).toBe(7);
    expect(runtime.sprites[task.data.bottomSpriteId].oam.paletteNum).toBe(7);

    taskScrollIndicatorArrowPair(runtime, taskId);
    expect(runtime.sprites[task.data.topSpriteId].invisible).toBe(true);
    expect(runtime.sprites[task.data.bottomSpriteId].invisible).toBe(false);

    scrollOffset.value = 5;
    taskScrollIndicatorArrowPair(runtime, taskId);
    expect(runtime.sprites[task.data.topSpriteId].invisible).toBe(false);
    expect(runtime.sprites[task.data.bottomSpriteId].invisible).toBe(true);
  });

  test('parameterized scroll arrows build vertical and horizontal temp templates exactly', () => {
    const runtime = createMenuIndicatorsRuntime();
    const offset = { value: 1 };
    addScrollIndicatorArrowPairParameterized(runtime, SCROLL_ARROW_UP, 99, 10, 20, 8, 55, 66, offset);
    expect(runtime.sTempScrollArrowTemplate).toMatchObject({
      firstArrowType: SCROLL_ARROW_UP,
      firstX: 99,
      firstY: 10,
      secondArrowType: SCROLL_ARROW_DOWN,
      secondX: 99,
      secondY: 20,
      fullyUpThreshold: 0,
      fullyDownThreshold: 8,
      tileTag: 55,
      palTag: 66,
      palNum: 0
    });

    const runtime2 = createMenuIndicatorsRuntime();
    addScrollIndicatorArrowPairParameterized(runtime2, SCROLL_ARROW_LEFT, 77, 11, 22, 9, 56, 67, offset);
    expect(runtime2.sTempScrollArrowTemplate).toMatchObject({
      firstArrowType: SCROLL_ARROW_LEFT,
      firstX: 11,
      firstY: 77,
      secondArrowType: SCROLL_ARROW_RIGHT,
      secondX: 22,
      secondY: 77
    });
  });

  test('RemoveScrollIndicatorArrowPair frees non-TAG_NONE resources, destroys sprites, and destroys task', () => {
    const runtime = createMenuIndicatorsRuntime();
    const taskId = addScrollIndicatorArrowPair(runtime, {
      firstArrowType: SCROLL_ARROW_LEFT,
      firstX: 1,
      firstY: 2,
      secondArrowType: SCROLL_ARROW_RIGHT,
      secondX: 3,
      secondY: 4,
      fullyUpThreshold: 0,
      fullyDownThreshold: 1,
      tileTag: 10,
      palTag: 11,
      palNum: 0
    }, { value: 0 });
    const task = runtime.tasks[taskId];
    if (task.func !== 'Task_ScrollIndicatorArrowPair') throw new Error('wrong task');

    removeScrollIndicatorArrowPair(runtime, taskId);

    expect(runtime.calls.some((call) => call.fn === 'FreeSpriteTilesByTag' && call.args[0] === 10)).toBe(true);
    expect(runtime.calls.some((call) => call.fn === 'FreeSpritePaletteByTag' && call.args[0] === 11)).toBe(true);
    expect(runtime.sprites[task.data.topSpriteId].destroyed).toBe(true);
    expect(runtime.sprites[task.data.bottomSpriteId].destroyed).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
  });

  test('red outline cursor count and subsprite OAM table preserve corner, horizontal, and vertical construction', () => {
    expect(listMenuGetRedOutlineCursorSpriteCount(16, 16)).toBe(4);
    expect(listMenuGetRedOutlineCursorSpriteCount(32, 24)).toBe(10);

    const subsprites = Array.from({ length: 10 }, () => ({ ...sSubsprite_RedOutline1 }));
    listMenuSetUpRedOutlineCursorSpriteOamTable(32, 24, subsprites);
    expect(subsprites.slice(0, 4).map((s) => [s.x, s.y, s.tileOffset])).toEqual([
      [136, 136, 0],
      [160, 136, 1],
      [136, 152, 6],
      [160, 152, 7]
    ]);
    expect(subsprites[4]).toMatchObject({ x: -112, y: 136, tileOffset: 2 });
    expect(subsprites[5]).toMatchObject({ x: -112, y: 152, tileOffset: 5 });
    expect(subsprites.at(-1)).toMatchObject({ x: 160, y: -112, tileOffset: 4 });
  });

  test('red outline cursor object loads resources, creates dummy sprite offset by 120, updates, and removes', () => {
    const runtime = createMenuIndicatorsRuntime();
    const taskId = listMenuAddRedOutlineCursorObject(runtime, {
      left: 4,
      top: 5,
      rowWidth: 32,
      rowHeight: 24,
      tileTag: 500,
      palTag: TAG_NONE,
      palNum: 3
    });
    const task = runtime.tasks[taskId];
    if (task.func !== 'Task_RedOutlineCursor') throw new Error('wrong task');
    expect(runtime.calls[0]).toEqual({ fn: 'LoadCompressedSpriteSheet', args: [{ data: sSelectorOutlineGfx, size: 0x100, tag: 500 }] });
    expect(runtime.sprites[task.data.spriteId]).toMatchObject({ x: 124, y: 125, callback: 'SpriteCallbackDummy' });
    expect(runtime.sprites[task.data.spriteId].oam.paletteNum).toBe(3);
    expect(task.data.subspriteTable.subspriteCount).toBe(10);

    listMenuUpdateRedOutlineCursorObject(runtime, taskId, 9, 10);
    expect(runtime.sprites[task.data.spriteId]).toMatchObject({ x: 129, y: 130 });

    listMenuRemoveRedOutlineCursorObject(runtime, taskId);
    expect(runtime.freedAllocations).toContain(task.data.subspritesPtr);
    expect(runtime.sprites[task.data.spriteId].destroyed).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.calls.some((call) => call.fn === 'FreeSpriteTilesByTag' && call.args[0] === 500)).toBe(true);
  });

  test('red arrow cursor object loads resources, starts at x2/y2 8, sine-bobs, updates, and removes', () => {
    const runtime = createMenuIndicatorsRuntime();
    const taskId = listMenuAddRedArrowCursorObject(runtime, {
      left: 20,
      top: 30,
      rowWidth: 0,
      rowHeight: 0,
      tileTag: 600,
      palTag: 601,
      palNum: 0
    });
    const task = runtime.tasks[taskId];
    if (task.func !== 'Task_RedArrowCursor') throw new Error('wrong task');
    expect(runtime.calls[0]).toEqual({ fn: 'LoadCompressedSpriteSheet', args: [{ data: sRedArrowGfx, size: 0x80, tag: 600 }] });
    expect(runtime.sprites[task.data.spriteId]).toMatchObject({ x: 20, y: 30, x2: 8, y2: 8, callback: 'SpriteCallback_RedArrowCursor' });

    const sprite = runtime.sprites[task.data.spriteId];
    sprite.data[0] = 64;
    spriteCallbackRedArrowCursor(sprite);
    expect(sprite.x2).toBe(4);
    expect(sprite.data[0]).toBe(72);

    listMenuUpdateRedArrowCursorObject(runtime, taskId, 40, 50);
    expect(sprite).toMatchObject({ x: 40, y: 50 });

    listMenuRemoveRedArrowCursorObject(runtime, taskId);
    expect(sprite.destroyed).toBe(true);
    expect(runtime.tasks[taskId].destroyed).toBe(true);
    expect(runtime.calls.some((call) => call.fn === 'FreeSpritePaletteByTag' && call.args[0] === 601)).toBe(true);
  });

  test('cursor kind dispatch defaults to red outline and routes update/remove by kind', () => {
    const runtime = createMenuIndicatorsRuntime();
    const outlineId = listMenuAddCursorObjectInternal(runtime, {
      left: 1,
      top: 2,
      rowWidth: 16,
      rowHeight: 16,
      tileTag: TAG_NONE,
      palTag: TAG_NONE,
      palNum: 1
    }, 99);
    expect(runtime.tasks[outlineId].func).toBe('Task_RedOutlineCursor');
    listMenuUpdateCursorObject(runtime, outlineId, 3, 4, 0);
    if (runtime.tasks[outlineId].func !== 'Task_RedOutlineCursor') throw new Error('wrong task');
    expect(runtime.sprites[runtime.tasks[outlineId].data.spriteId]).toMatchObject({ x: 123, y: 124 });

    const arrowId = listMenuAddCursorObjectInternal(runtime, {
      left: 5,
      top: 6,
      rowWidth: 0,
      rowHeight: 0,
      tileTag: TAG_NONE,
      palTag: TAG_NONE,
      palNum: 2
    }, 1);
    expect(runtime.tasks[arrowId].func).toBe('Task_RedArrowCursor');
    listMenuUpdateCursorObject(runtime, arrowId, 7, 8, 1);
    if (runtime.tasks[arrowId].func !== 'Task_RedArrowCursor') throw new Error('wrong task');
    expect(runtime.sprites[runtime.tasks[arrowId].data.spriteId]).toMatchObject({ x: 7, y: 8 });

    listMenuRemoveCursorObject(runtime, outlineId, 0);
    listMenuRemoveCursorObject(runtime, arrowId, 1);
    expect(runtime.tasks[outlineId].destroyed).toBe(true);
    expect(runtime.tasks[arrowId].destroyed).toBe(true);
  });
});
