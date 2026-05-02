import { describe, expect, test } from 'vitest';
import {
  ARROW_TILE_TAG,
  CONNECTION_EAST,
  CONNECTION_NORTH,
  CONNECTION_SOUTH,
  CONNECTION_WEST,
  CreateArrowSprite,
  CreateStarSprite,
  DestroyArrowAndStarTiles,
  DIR_EAST,
  DIR_NONE,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_WEST,
  FLAG_HIDDEN_ITEMS_START,
  HIDDEN_ITEM_FLAG,
  HIDDEN_ITEM_ITEM,
  HIDDEN_ITEM_QUANTITY,
  HIDDEN_ITEM_UNDERFOOT,
  FindHiddenItemsInConnectedMaps,
  GetPlayerDirectionTowardsHiddenItem,
  HiddenItemAtPos,
  HiddenItemInConnectedMapAtPos,
  HiddenItemIsWithinRangeOfPlayer,
  ItemUseOnFieldCB_Itemfinder,
  LoadArrowAndStarTiles,
  RegisterHiddenItemRelativeCoordsIfCloser,
  SE_ITEMFINDER,
  SetNormalHiddenItem,
  SetUnderfootHiddenItem,
  SpriteCallback_Arrow,
  SpriteCallback_DestroyArrow,
  SpriteCallback_DestroyStar,
  SpriteCallback_Star,
  Task_ItemfinderResponseCleanUp,
  Task_ItemfinderResponsePrintMessage,
  Task_ItemfinderResponseSoundsAndAnims,
  Task_ItemfinderUnderfootDigUpItem,
  Task_ItemfinderUnderfootPrintMessage,
  Task_ItemfinderUnderfootSoundsAndAnims,
  Task_NoResponse_CleanUp,
  createArrowSprite,
  createItemfinderRuntime,
  createItemfinderTask,
  createStarSprite,
  destroyArrowAndStarTiles,
  findHiddenItemsInConnectedMaps,
  getHiddenItemAttr,
  getPlayerDirectionTowardsHiddenItem,
  hiddenItemAtPos,
  hiddenItemInConnectedMapAtPos,
  hiddenItemIsWithinRangeOfPlayer,
  itemUseOnFieldCBItemfinder,
  loadArrowAndStarTiles,
  makeHiddenItem,
  registerHiddenItemRelativeCoordsIfCloser,
  runItemfinderTask,
  setNormalHiddenItem,
  setUnderfootHiddenItem,
  spriteCallbackDestroyArrow,
  spriteCallbackDestroyStar,
  spriteCallbackArrow,
  spriteCallbackStar,
  taskNoResponseCleanUp,
  taskItemfinderResponseCleanUp,
  taskItemfinderResponsePrintMessage,
  taskItemfinderResponseSoundsAndAnims,
  taskItemfinderUnderfootDigUpItem,
  taskItemfinderUnderfootPrintMessage,
  taskItemfinderUnderfootSoundsAndAnims
} from '../src/game/decompItemfinder';

describe('decomp itemfinder', () => {
  test('exports exact C function names for itemfinder callbacks and helpers', () => {
    expect(ItemUseOnFieldCB_Itemfinder).toBe(itemUseOnFieldCBItemfinder);
    expect(Task_NoResponse_CleanUp).toBe(taskNoResponseCleanUp);
    expect(Task_ItemfinderResponseSoundsAndAnims).toBe(taskItemfinderResponseSoundsAndAnims);
    expect(Task_ItemfinderUnderfootSoundsAndAnims).toBe(taskItemfinderUnderfootSoundsAndAnims);
    expect(HiddenItemIsWithinRangeOfPlayer).toBe(hiddenItemIsWithinRangeOfPlayer);
    expect(SetUnderfootHiddenItem).toBe(setUnderfootHiddenItem);
    expect(SetNormalHiddenItem).toBe(setNormalHiddenItem);
    expect(HiddenItemAtPos).toBe(hiddenItemAtPos);
    expect(HiddenItemInConnectedMapAtPos).toBe(hiddenItemInConnectedMapAtPos);
    expect(FindHiddenItemsInConnectedMaps).toBe(findHiddenItemsInConnectedMaps);
    expect(RegisterHiddenItemRelativeCoordsIfCloser).toBe(registerHiddenItemRelativeCoordsIfCloser);
    expect(GetPlayerDirectionTowardsHiddenItem).toBe(getPlayerDirectionTowardsHiddenItem);
    expect(Task_ItemfinderResponsePrintMessage).toBe(taskItemfinderResponsePrintMessage);
    expect(Task_ItemfinderResponseCleanUp).toBe(taskItemfinderResponseCleanUp);
    expect(Task_ItemfinderUnderfootPrintMessage).toBe(taskItemfinderUnderfootPrintMessage);
    expect(Task_ItemfinderUnderfootDigUpItem).toBe(taskItemfinderUnderfootDigUpItem);
    expect(LoadArrowAndStarTiles).toBe(loadArrowAndStarTiles);
    expect(DestroyArrowAndStarTiles).toBe(destroyArrowAndStarTiles);
    expect(CreateArrowSprite).toBe(createArrowSprite);
    expect(SpriteCallback_Arrow).toBe(spriteCallbackArrow);
    expect(SpriteCallback_DestroyArrow).toBe(spriteCallbackDestroyArrow);
    expect(CreateStarSprite).toBe(createStarSprite);
    expect(SpriteCallback_Star).toBe(spriteCallbackStar);
    expect(SpriteCallback_DestroyStar).toBe(spriteCallbackDestroyStar);
  });

  test('hidden item bitfields decode item, hidden-item flag base, quantity, and underfoot bit', () => {
    const hidden = makeHiddenItem(123, 7, 42, true);

    expect(getHiddenItemAttr(hidden, HIDDEN_ITEM_ITEM)).toBe(123);
    expect(getHiddenItemAttr(hidden, HIDDEN_ITEM_FLAG)).toBe(FLAG_HIDDEN_ITEMS_START + 7);
    expect(getHiddenItemAttr(hidden, HIDDEN_ITEM_QUANTITY)).toBe(42);
    expect(getHiddenItemAttr(hidden, HIDDEN_ITEM_UNDERFOOT)).toBe(1);
  });

  test('RegisterHiddenItemRelativeCoordsIfCloser preserves distance and tie-break behavior', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime);

    registerHiddenItemRelativeCoordsIfCloser(runtime, taskId, 5, 0);
    expect(runtime.tasks[taskId].data.slice(0, 3)).toEqual([5, 0, 1]);

    registerHiddenItemRelativeCoordsIfCloser(runtime, taskId, 2, 2);
    expect(runtime.tasks[taskId].data.slice(0, 2)).toEqual([2, 2]);

    registerHiddenItemRelativeCoordsIfCloser(runtime, taskId, -2, -2);
    expect(runtime.tasks[taskId].data.slice(0, 2)).toEqual([2, 2]);

    registerHiddenItemRelativeCoordsIfCloser(runtime, taskId, 3, 1);
    expect(runtime.tasks[taskId].data.slice(0, 2)).toEqual([3, 1]);
  });

  test('SetNormalHiddenItem assigns ding strength inversely to max axis distance', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime);

    runtime.tasks[taskId].data[0] = 0;
    runtime.tasks[taskId].data[1] = 0;
    setNormalHiddenItem(runtime, taskId);
    expect(runtime.tasks[taskId].data[4]).toBe(4);

    runtime.tasks[taskId].data[0] = -3;
    runtime.tasks[taskId].data[1] = 2;
    setNormalHiddenItem(runtime, taskId);
    expect(runtime.tasks[taskId].data[4]).toBe(4);

    runtime.tasks[taskId].data[0] = 1;
    runtime.tasks[taskId].data[1] = -5;
    setNormalHiddenItem(runtime, taskId);
    expect(runtime.tasks[taskId].data[4]).toBe(2);
  });

  test('underfoot item setup ignores encoded quantity, fills special vars, and prints item id', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime);
    const hidden = makeHiddenItem(55, 9, 99, true);

    setUnderfootHiddenItem(runtime, taskId, hidden);

    expect(runtime.gSpecialVar_0x8004).toBe(FLAG_HIDDEN_ITEMS_START + 9);
    expect(runtime.gSpecialVar_0x8005).toBe(55);
    expect(runtime.gSpecialVar_0x8006).toBe(1);
    expect(runtime.stringVars[0]).toBe(55);
    expect(runtime.tasks[taskId].data.slice(0, 7)).toEqual([0, 0, 1, 0, 3, 0, 1]);
  });

  test('HiddenItemIsWithinRangeOfPlayer finds underfoot first, normal in range, skips flagged and out-of-range events', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime);
    runtime.playerDestCoords = { x: 10, y: 10 };
    runtime.gMapHeader.events = {
      bgEventCount: 4,
      bgEvents: [
        { kind: 7, x: 40, y: 40, hiddenItem: makeHiddenItem(1, 1, 1, false) },
        { kind: 7, x: 4, y: 5, hiddenItem: makeHiddenItem(2, 2, 1, false) },
        { kind: 7, x: 3, y: 3, hiddenItem: makeHiddenItem(3, 3, 1, true) },
        { kind: 7, x: 2, y: 2, hiddenItem: makeHiddenItem(4, 4, 1, false) }
      ]
    };
    runtime.flags.add(FLAG_HIDDEN_ITEMS_START + 4);

    expect(hiddenItemIsWithinRangeOfPlayer(runtime, runtime.gMapHeader.events, taskId)).toBe(true);
    expect(runtime.tasks[taskId].data[6]).toBe(1);
    expect(runtime.gSpecialVar_0x8005).toBe(3);

    const normalRuntime = createItemfinderRuntime();
    const normalTaskId = createItemfinderTask(normalRuntime);
    normalRuntime.playerDestCoords = { x: 10, y: 10 };
    normalRuntime.gMapHeader.events = {
      bgEventCount: 2,
      bgEvents: [
        { kind: 7, x: 1, y: 1, hiddenItem: makeHiddenItem(1, 1, 1, false) },
        { kind: 7, x: 7, y: 9, hiddenItem: makeHiddenItem(2, 2, 1, false) }
      ]
    };
    expect(hiddenItemIsWithinRangeOfPlayer(normalRuntime, normalRuntime.gMapHeader.events, normalTaskId)).toBe(true);
    expect(normalRuntime.tasks[normalTaskId].data.slice(0, 5)).toEqual([-2, -2, 1, 0, 4]);
  });

  test('connected map hidden item lookup preserves directional local coordinate formulas', () => {
    const runtime = createItemfinderRuntime();
    runtime.gMapHeader.mapLayout = { width: 20, height: 30 };
    const hiddenItem = makeHiddenItem(1, 1, 1, false);
    const northHeader = { mapLayout: { width: 20, height: 40 }, events: { bgEventCount: 1, bgEvents: [{ kind: 7, x: 0, y: 35, hiddenItem }] } };
    const southHeader = { mapLayout: { width: 20, height: 40 }, events: { bgEventCount: 1, bgEvents: [{ kind: 7, x: 0, y: 0, hiddenItem }] } };
    const westHeader = { mapLayout: { width: 50, height: 40 }, events: { bgEventCount: 1, bgEvents: [{ kind: 7, x: 43, y: 0, hiddenItem }] } };
    const eastHeader = { mapLayout: { width: 50, height: 40 }, events: { bgEventCount: 1, bgEvents: [{ kind: 7, x: 0, y: 0, hiddenItem }] } };

    expect(hiddenItemInConnectedMapAtPos(runtime, { direction: CONNECTION_NORTH, offset: -7, mapHeader: northHeader }, 0, 2)).toBe(true);
    expect(hiddenItemInConnectedMapAtPos(runtime, { direction: CONNECTION_SOUTH, offset: -7, mapHeader: southHeader }, 0, 37)).toBe(true);
    expect(hiddenItemInConnectedMapAtPos(runtime, { direction: CONNECTION_WEST, offset: -7, mapHeader: westHeader }, 0, 0)).toBe(true);
    expect(hiddenItemInConnectedMapAtPos(runtime, { direction: CONNECTION_EAST, offset: -7, mapHeader: eastHeader }, 27, 0)).toBe(true);
    expect(hiddenItemInConnectedMapAtPos(runtime, { direction: 99, offset: 0, mapHeader: eastHeader }, 0, 0)).toBe(false);
  });

  test('HiddenItemAtPos rejects underfoot and flagged hidden items at matching coordinates', () => {
    const runtime = createItemfinderRuntime();
    const events = {
      bgEventCount: 3,
      bgEvents: [
        { kind: 7, x: 1, y: 1, hiddenItem: makeHiddenItem(10, 1, 1, false) },
        { kind: 7, x: 2, y: 2, hiddenItem: makeHiddenItem(11, 2, 1, true) },
        { kind: 7, x: 3, y: 3, hiddenItem: makeHiddenItem(12, 3, 1, false) }
      ]
    };
    runtime.flags.add(FLAG_HIDDEN_ITEMS_START + 3);

    expect(hiddenItemAtPos(runtime, events, 1, 1)).toBe(true);
    expect(hiddenItemAtPos(runtime, events, 2, 2)).toBe(false);
    expect(hiddenItemAtPos(runtime, events, 3, 3)).toBe(false);
    expect(hiddenItemAtPos(runtime, events, 9, 9)).toBe(false);
  });

  test('direction selection preserves the decompiled arrow-orientation mapping', () => {
    expect(getPlayerDirectionTowardsHiddenItem(0, 0)).toBe(DIR_NONE);
    expect(getPlayerDirectionTowardsHiddenItem(-5, 1)).toBe(DIR_EAST);
    expect(getPlayerDirectionTowardsHiddenItem(5, 1)).toBe(DIR_NORTH);
    expect(getPlayerDirectionTowardsHiddenItem(1, -5)).toBe(DIR_SOUTH);
    expect(getPlayerDirectionTowardsHiddenItem(1, 5)).toBe(DIR_WEST);
    expect(getPlayerDirectionTowardsHiddenItem(3, 3)).toBe(DIR_WEST);
  });

  test('Itemfinder field callback clears task data, loads sprites on hit, or displays no-response message on miss', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime);
    runtime.tasks[taskId].data[0] = 99;
    runtime.playerDestCoords = { x: 10, y: 10 };
    runtime.gMapHeader.events = { bgEventCount: 1, bgEvents: [{ kind: 7, x: 7, y: 8, hiddenItem: makeHiddenItem(2, 2, 1, false) }] };

    itemUseOnFieldCBItemfinder(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_ItemfinderResponseSoundsAndAnims');
    expect(runtime.calls.at(-1)?.fn).toBe('LoadSpriteSheet');

    const missRuntime = createItemfinderRuntime();
    const missTaskId = createItemfinderTask(missRuntime);
    itemUseOnFieldCBItemfinder(missRuntime, missTaskId);
    expect(missRuntime.tasks[missTaskId].func).toBe('Task_NoResponse_CleanUp');
    expect(missRuntime.calls.at(-1)).toEqual({ fn: 'DisplayItemMessageOnField', args: [missTaskId, 0, 'Nope! There is no response.', 'Task_NoResponse_CleanUp'] });
  });

  test('response and underfoot sound tasks ding every 25 ticks, create sprites, then switch to print-message tasks', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime, 'Task_ItemfinderResponseSoundsAndAnims');
    runtime.tasks[taskId].data[0] = -5;
    runtime.tasks[taskId].data[4] = 2;

    taskItemfinderResponseSoundsAndAnims(runtime, taskId);
    expect(runtime.calls.find((call) => call.fn === 'PlaySE')).toEqual({ fn: 'PlaySE', args: [SE_ITEMFINDER] });
    expect(runtime.sprites[0].data[1]).toBe(-100);
    expect(runtime.tasks[taskId].data[4]).toBe(1);
    runtime.tasks[taskId].data[3] = 25;
    runtime.tasks[taskId].data[4] = 0;
    taskItemfinderResponseSoundsAndAnims(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_ItemfinderResponsePrintMessage');

    const underfootRuntime = createItemfinderRuntime();
    const underfootTaskId = createItemfinderTask(underfootRuntime, 'Task_ItemfinderUnderfootSoundsAndAnims');
    underfootRuntime.tasks[underfootTaskId].data[4] = 1;
    taskItemfinderUnderfootSoundsAndAnims(underfootRuntime, underfootTaskId);
    expect(underfootRuntime.tasks[underfootTaskId].data[7]).toBe(0);
    expect(underfootRuntime.sprites[0].callback).toBe('SpriteCallback_Star');
    underfootRuntime.tasks[underfootTaskId].data[3] = 25;
    underfootRuntime.tasks[underfootTaskId].data[4] = 0;
    taskItemfinderUnderfootSoundsAndAnims(underfootRuntime, underfootTaskId);
    expect(underfootRuntime.tasks[underfootTaskId].func).toBe('Task_ItemfinderUnderfootPrintMessage');
  });

  test('message cleanup tasks free sprite tiles, unlock/lock controls, destroy tasks, and setup underfoot script', () => {
    const runtime = createItemfinderRuntime();
    const taskId = createItemfinderTask(runtime, 'Task_ItemfinderResponsePrintMessage');

    runItemfinderTask(runtime, taskId);
    expect(runtime.tasks[taskId].func).toBe('Task_ItemfinderResponseCleanUp');
    runItemfinderTask(runtime, taskId);
    expect(runtime.calls.map((call) => call.fn)).toContain('FreeSpriteTilesByTag');
    expect(runtime.calls.map((call) => call.fn)).toContain('UnlockPlayerFieldControls');
    expect(runtime.tasks[taskId].destroyed).toBe(true);

    const underfootRuntime = createItemfinderRuntime();
    const underfootTaskId = createItemfinderTask(underfootRuntime, 'Task_ItemfinderUnderfootPrintMessage');
    runItemfinderTask(underfootRuntime, underfootTaskId);
    expect(underfootRuntime.tasks[underfootTaskId].func).toBe('Task_ItemfinderUnderfootDigUpItem');
    runItemfinderTask(underfootRuntime, underfootTaskId);
    expect(underfootRuntime.calls.slice(-2)).toEqual([
      { fn: 'ScriptContext_SetupScript', args: ['EventScript_ItemfinderDigUpUnderfootItem'] },
      { fn: 'LockPlayerFieldControls', args: [] }
    ]);
    expect(underfootRuntime.tasks[underfootTaskId].destroyed).toBe(true);
  });

  test('arrow and star sprites initialize deltas/affine anims and destroy after leaving bounds', () => {
    const runtime = createItemfinderRuntime();
    runtime.playerFacingDirection = DIR_NORTH;
    const arrowId = createArrowSprite(runtime, 2, DIR_NONE);
    const arrow = runtime.sprites[arrowId];

    expect(arrow).toMatchObject({ x: 120, y: 76, callback: 'SpriteCallback_Arrow', animNum: 2, affineAnimNum: 3 });
    expect(arrow.data.slice(1, 7)).toEqual([0, -100, 0, 0, 120, 76]);
    for (let i = 0; i < 42 && arrow.callback === 'SpriteCallback_Arrow'; i += 1) {
      spriteCallbackArrow(arrow);
    }
    expect(arrow.callback).toBe('SpriteCallback_DestroyArrow');
    spriteCallbackDestroyArrow(arrow);
    expect(arrow.oamMatrixFreed).toBe(true);
    expect(arrow.destroyed).toBe(true);

    const starId = createStarSprite(runtime);
    const star = runtime.sprites[starId];
    expect(star.data.slice(1, 7)).toEqual([0, -100, 0, 0, 120, 76]);
    for (let i = 0; i < 42 && star.callback === 'SpriteCallback_Star'; i += 1) {
      spriteCallbackStar(star);
    }
    expect(star.callback).toBe('SpriteCallback_DestroyStar');
    spriteCallbackDestroyStar(star);
    expect(star.destroyed).toBe(true);

    loadArrowAndStarTiles(runtime);
    destroyArrowAndStarTiles(runtime);
    expect(runtime.calls.slice(-2)).toEqual([
      { fn: 'LoadSpriteSheet', args: [{ data: 'graphics/itemfinder/spr_tiles.4bpp', size: 'sizeof(sArrowAndStarSpriteTiles)', tag: ARROW_TILE_TAG }] },
      { fn: 'FreeSpriteTilesByTag', args: [ARROW_TILE_TAG] }
    ]);
  });
});
