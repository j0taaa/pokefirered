export const ARROW_TILE_TAG = 2000;
export const FLAG_HIDDEN_ITEMS_START = 1000;
export const SE_ITEMFINDER = 65;
export const FONT_NORMAL = 0;

export const HIDDEN_ITEM_ITEM = 0;
export const HIDDEN_ITEM_FLAG = 1;
export const HIDDEN_ITEM_QUANTITY = 2;
export const HIDDEN_ITEM_UNDERFOOT = 3;

export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;

export const CONNECTION_SOUTH = 1;
export const CONNECTION_NORTH = 2;
export const CONNECTION_WEST = 3;
export const CONNECTION_EAST = 4;

export type ItemfinderTaskFunc =
  | 'Task_NoResponse_CleanUp'
  | 'Task_ItemfinderResponseSoundsAndAnims'
  | 'Task_ItemfinderUnderfootSoundsAndAnims'
  | 'Task_ItemfinderResponsePrintMessage'
  | 'Task_ItemfinderResponseCleanUp'
  | 'Task_ItemfinderUnderfootPrintMessage'
  | 'Task_ItemfinderUnderfootDigUpItem';

export type ItemfinderSpriteCallback =
  | 'SpriteCallback_Arrow'
  | 'SpriteCallback_DestroyArrow'
  | 'SpriteCallback_Star'
  | 'SpriteCallback_DestroyStar';

export interface HiddenItemBgEvent {
  kind: number;
  x: number;
  y: number;
  hiddenItem: number;
}

export interface ItemfinderMapEvents {
  bgEventCount: number;
  bgEvents: HiddenItemBgEvent[];
}

export interface ItemfinderMapHeader {
  mapLayout: { width: number; height: number };
  events: ItemfinderMapEvents;
}

export interface ItemfinderConnection {
  direction: number;
  offset: number;
  mapHeader: ItemfinderMapHeader;
}

export interface ItemfinderTask {
  id: number;
  data: number[];
  func: ItemfinderTaskFunc;
  destroyed: boolean;
}

export interface ItemfinderSprite {
  id: number;
  x: number;
  y: number;
  data: number[];
  oam: { paletteNum: number };
  callback: ItemfinderSpriteCallback;
  destroyed: boolean;
  oamMatrixFreed: boolean;
  animNum: number | null;
  affineAnimNum: number | null;
}

export interface ItemfinderRuntime {
  tasks: ItemfinderTask[];
  sprites: ItemfinderSprite[];
  gMapHeader: ItemfinderMapHeader;
  playerDestCoords: { x: number; y: number };
  playerFacingDirection: number;
  flags: Set<number>;
  gSpecialVar_0x8004: number;
  gSpecialVar_0x8005: number;
  gSpecialVar_0x8006: number;
  stringVars: Record<number, number>;
  connectionsByPos: Record<string, ItemfinderConnection>;
  calls: Array<{ fn: string; args: unknown[] }>;
}

export const sArrowAnim0 = ['ANIMCMD_FRAME(0, 10)', 'ANIMCMD_END'] as const;
export const sArrowAnim1 = ['ANIMCMD_FRAME(4, 10)', 'ANIMCMD_END'] as const;
export const sArrowAnim2 = ['ANIMCMD_FRAME(8, 10)', 'ANIMCMD_END'] as const;
export const sArrowAnim3 = ['ANIMCMD_FRAME(12, 10)', 'ANIMCMD_END'] as const;
export const sStarAnim = ['ANIMCMD_FRAME(16, 10)', 'ANIMCMD_END'] as const;
export const sArrowAndStarSpriteAnimTable = [sArrowAnim0, sArrowAnim1, sArrowAnim2, sArrowAnim3, sStarAnim] as const;
export const sArrowAndStarSpriteAffineAnimTable = [
  ['AFFINEANIMCMD_FRAME(0, 0, 0x00, 1)', 'AFFINEANIMCMD_END'],
  ['AFFINEANIMCMD_FRAME(0, 0, 0x40, 1)', 'AFFINEANIMCMD_END'],
  ['AFFINEANIMCMD_FRAME(0, 0, 0x80, 1)', 'AFFINEANIMCMD_END'],
  ['AFFINEANIMCMD_FRAME(0, 0, 0xc0, 1)', 'AFFINEANIMCMD_END']
] as const;
export const sSpriteTemplate_ArrowAndStar = {
  tileTag: ARROW_TILE_TAG,
  paletteTag: 0xffff,
  oam: { affineMode: 'ST_OAM_AFFINE_NORMAL', shape: 'ST_OAM_SQUARE', size: 'ST_OAM_SIZE_1' },
  anims: sArrowAndStarSpriteAnimTable,
  affineAnims: sArrowAndStarSpriteAffineAnimTable,
  callback: 'SpriteCallback_Arrow'
} as const;
export const sArrowAndStarSpriteSheet = {
  data: 'graphics/itemfinder/spr_tiles.4bpp',
  size: 'sizeof(sArrowAndStarSpriteTiles)',
  tag: ARROW_TILE_TAG
} as const;

export const createItemfinderRuntime = (): ItemfinderRuntime => ({
  tasks: [],
  sprites: [],
  gMapHeader: { mapLayout: { width: 0, height: 0 }, events: { bgEventCount: 0, bgEvents: [] } },
  playerDestCoords: { x: 7, y: 7 },
  playerFacingDirection: DIR_SOUTH,
  flags: new Set(),
  gSpecialVar_0x8004: 0,
  gSpecialVar_0x8005: 0,
  gSpecialVar_0x8006: 0,
  stringVars: {},
  connectionsByPos: {},
  calls: []
});

export const createItemfinderTask = (runtime: ItemfinderRuntime, func: ItemfinderTaskFunc = 'Task_ItemfinderResponseSoundsAndAnims'): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ id, data: Array.from({ length: 16 }, () => 0), func, destroyed: false });
  return id;
};

export const makeHiddenItem = (item: number, flagId: number, quantity = 1, underfoot = false): number =>
  (item & 0xffff) | ((flagId & 0xff) << 16) | ((quantity & 0x7f) << 24) | ((underfoot ? 1 : 0) << 31);

export const getHiddenItemAttr = (hiddenItem: number, attr: number): number => {
  if (attr === HIDDEN_ITEM_ITEM) {
    return hiddenItem & 0xffff;
  }
  if (attr === HIDDEN_ITEM_FLAG) {
    return ((hiddenItem >>> 16) & 0xff) + FLAG_HIDDEN_ITEMS_START;
  }
  if (attr === HIDDEN_ITEM_QUANTITY) {
    return (hiddenItem >>> 24) & 0x7f;
  }
  if (attr === HIDDEN_ITEM_UNDERFOOT) {
    return (hiddenItem >>> 31) & 1;
  }
  return 0;
};

const call = (runtime: ItemfinderRuntime, fn: string, ...args: unknown[]): void => {
  runtime.calls.push({ fn, args });
};
const flagGet = (runtime: ItemfinderRuntime, flag: number): boolean => runtime.flags.has(flag);
const playerGetDestCoords = (runtime: ItemfinderRuntime): { x: number; y: number } => ({ ...runtime.playerDestCoords });
const getMapConnectionAtPos = (runtime: ItemfinderRuntime, x: number, y: number): ItemfinderConnection | null =>
  runtime.connectionsByPos[`${x},${y}`] ?? null;
const getMapHeaderFromConnection = (connection: ItemfinderConnection): ItemfinderMapHeader => connection.mapHeader;
const destroyTask = (runtime: ItemfinderRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  call(runtime, 'DestroyTask', taskId);
};
const displayItemMessageOnField = (runtime: ItemfinderRuntime, taskId: number, fontId: number, text: string, callback: ItemfinderTaskFunc): void => {
  call(runtime, 'DisplayItemMessageOnField', taskId, fontId, text, callback);
  runtime.tasks[taskId].func = callback;
};
const playSE = (runtime: ItemfinderRuntime, song: number): void => call(runtime, 'PlaySE', song);
const tvPrintIntToStringVar = (runtime: ItemfinderRuntime, index: number, value: number): void => {
  runtime.stringVars[index] = value;
  call(runtime, 'TV_PrintIntToStringVar', index, value);
};

export const itemUseOnFieldCBItemfinder = (runtime: ItemfinderRuntime, taskId: number): void => {
  for (let i = 0; i < 16; i += 1) {
    runtime.tasks[taskId].data[i] = 0;
  }
  if (hiddenItemIsWithinRangeOfPlayer(runtime, runtime.gMapHeader.events, taskId) === true) {
    loadArrowAndStarTiles(runtime);
    if (runtime.tasks[taskId].data[6] === 1) {
      runtime.tasks[taskId].func = 'Task_ItemfinderUnderfootSoundsAndAnims';
    } else {
      runtime.tasks[taskId].func = 'Task_ItemfinderResponseSoundsAndAnims';
    }
  } else {
    displayItemMessageOnField(runtime, taskId, FONT_NORMAL, 'Nope! There is no response.', 'Task_NoResponse_CleanUp');
  }
};

export const taskNoResponseCleanUp = (runtime: ItemfinderRuntime, taskId: number): void => {
  call(runtime, 'ClearDialogWindowAndFrame', 0, true);
  call(runtime, 'ClearPlayerHeldMovementAndUnfreezeObjectEvents');
  call(runtime, 'UnlockPlayerFieldControls');
  destroyTask(runtime, taskId);
};

export const taskItemfinderResponseSoundsAndAnims = (runtime: ItemfinderRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  if (data[3] % 25 === 0) {
    const direction = getPlayerDirectionTowardsHiddenItem(data[0], data[1]);
    if (data[4] === 0) {
      runtime.tasks[taskId].func = 'Task_ItemfinderResponsePrintMessage';
      return;
    }
    playSE(runtime, SE_ITEMFINDER);
    createArrowSprite(runtime, data[5], direction);
    data[5] += 1;
    data[4] -= 1;
  }
  data[3] += 1;
};

export const taskItemfinderUnderfootSoundsAndAnims = (runtime: ItemfinderRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  if (data[3] % 25 === 0) {
    if (data[4] === 0) {
      runtime.tasks[taskId].func = 'Task_ItemfinderUnderfootPrintMessage';
      return;
    }
    playSE(runtime, SE_ITEMFINDER);
    data[7] = createStarSprite(runtime);
    data[5] += 1;
    data[4] -= 1;
  }
  data[3] += 1;
};

export const hiddenItemIsWithinRangeOfPlayer = (runtime: ItemfinderRuntime, events: ItemfinderMapEvents, taskId: number): boolean => {
  const player = playerGetDestCoords(runtime);
  runtime.tasks[taskId].data[2] = 0;
  for (let i = 0; i < events.bgEventCount; i += 1) {
    const bgEvent = events.bgEvents[i];
    if (bgEvent.kind === 7 && !flagGet(runtime, getHiddenItemAttr(bgEvent.hiddenItem, HIDDEN_ITEM_FLAG))) {
      const dx = bgEvent.x + 7 - player.x;
      const dy = bgEvent.y + 7 - player.y;
      if (getHiddenItemAttr(bgEvent.hiddenItem, HIDDEN_ITEM_UNDERFOOT) === 1) {
        if (dx === 0 && dy === 0) {
          setUnderfootHiddenItem(runtime, taskId, bgEvent.hiddenItem);
          return true;
        }
      } else if (dx >= -7 && dx <= 7 && dy >= -5 && dy <= 5) {
        registerHiddenItemRelativeCoordsIfCloser(runtime, taskId, dx, dy);
      }
    }
  }
  findHiddenItemsInConnectedMaps(runtime, taskId);
  if (runtime.tasks[taskId].data[2] === 1) {
    setNormalHiddenItem(runtime, taskId);
    return true;
  }
  return false;
};

export const setUnderfootHiddenItem = (runtime: ItemfinderRuntime, taskId: number, hiddenItem: number): void => {
  const data = runtime.tasks[taskId].data;
  runtime.gSpecialVar_0x8004 = getHiddenItemAttr(hiddenItem, HIDDEN_ITEM_FLAG);
  runtime.gSpecialVar_0x8005 = getHiddenItemAttr(hiddenItem, HIDDEN_ITEM_ITEM);
  runtime.gSpecialVar_0x8006 = 1;
  tvPrintIntToStringVar(runtime, 0, runtime.gSpecialVar_0x8005);
  data[2] = 1;
  data[0] = 0;
  data[1] = 0;
  data[4] = 3;
  data[6] = 1;
};

export const setNormalHiddenItem = (runtime: ItemfinderRuntime, taskId: number): void => {
  const data = runtime.tasks[taskId].data;
  let absY = data[1];
  let absX = data[0];
  if (data[0] === 0 && data[1] === 0) {
    data[4] = 4;
  } else {
    if (data[0] < 0) {
      absX = data[0] * -1;
    }
    if (data[1] < 0) {
      absY = data[1] * -1;
    }
    if (absX > absY) {
      data[4] = absX > 3 ? 2 : 4;
    } else {
      data[4] = absY > 3 ? 2 : 4;
    }
  }
};

export const hiddenItemAtPos = (runtime: ItemfinderRuntime, events: ItemfinderMapEvents, x: number, y: number): boolean => {
  for (let i = 0; i < events.bgEventCount; i += 1) {
    const bgEvent = events.bgEvents[i];
    if (bgEvent.kind === 7 && x === bgEvent.x && y === bgEvent.y) {
      const eventFlag = getHiddenItemAttr(bgEvent.hiddenItem, HIDDEN_ITEM_FLAG);
      if (getHiddenItemAttr(bgEvent.hiddenItem, HIDDEN_ITEM_UNDERFOOT) !== 1 && !flagGet(runtime, eventFlag)) {
        return true;
      }
      return false;
    }
  }
  return false;
};

export const hiddenItemInConnectedMapAtPos = (runtime: ItemfinderRuntime, connection: ItemfinderConnection, x: number, y: number): boolean => {
  const mapHeader = getMapHeaderFromConnection(connection);
  let localX: number;
  let localY: number;
  let localOffset: number;
  let localLength: number;
  switch (connection.direction) {
    case CONNECTION_NORTH:
      localOffset = connection.offset + 7;
      localX = x - localOffset;
      localLength = mapHeader.mapLayout.height - 7;
      localY = localLength + y;
      break;
    case CONNECTION_SOUTH:
      localOffset = connection.offset + 7;
      localX = x - localOffset;
      localLength = runtime.gMapHeader.mapLayout.height + 7;
      localY = y - localLength;
      break;
    case CONNECTION_WEST:
      localLength = mapHeader.mapLayout.width - 7;
      localX = localLength + x;
      localOffset = connection.offset + 7;
      localY = y - localOffset;
      break;
    case CONNECTION_EAST:
      localLength = runtime.gMapHeader.mapLayout.width + 7;
      localX = x - localLength;
      localOffset = connection.offset + 7;
      localY = y - localOffset;
      break;
    default:
      return false;
  }
  return hiddenItemAtPos(runtime, mapHeader.events, localX & 0xffff, localY & 0xffff);
};

export const findHiddenItemsInConnectedMaps = (runtime: ItemfinderRuntime, taskId: number): void => {
  const player = playerGetDestCoords(runtime);
  const width = runtime.gMapHeader.mapLayout.width + 7;
  const height = runtime.gMapHeader.mapLayout.height + 7;
  const var1 = 7;
  const var2 = 7;
  for (let curX = player.x - 7; curX <= player.x + 7; curX += 1) {
    for (let curY = player.y - 5; curY <= player.y + 5; curY += 1) {
      if (var1 > curX || curX >= width || var2 > curY || curY >= height) {
        const conn = getMapConnectionAtPos(runtime, curX, curY);
        if (conn !== null && hiddenItemInConnectedMapAtPos(runtime, conn, curX, curY) === true) {
          registerHiddenItemRelativeCoordsIfCloser(runtime, taskId, curX - player.x, curY - player.y);
        }
      }
    }
  }
};

export const registerHiddenItemRelativeCoordsIfCloser = (runtime: ItemfinderRuntime, taskId: number, dx: number, dy: number): void => {
  const data = runtime.tasks[taskId].data;
  let dx2: number;
  let dy2: number;
  let dx3: number;
  let dy3: number;
  if (data[2] === 0) {
    data[0] = dx;
    data[1] = dy;
    data[2] = 1;
  } else {
    dx2 = data[0] < 0 ? data[0] * -1 : data[0];
    dy2 = data[1] < 0 ? data[1] * -1 : data[1];
    dx3 = dx < 0 ? dx * -1 : dx;
    dy3 = dy < 0 ? dy * -1 : dy;
    if (dx2 + dy2 > dx3 + dy3) {
      data[0] = dx;
      data[1] = dy;
    } else if (dx2 + dy2 === dx3 + dy3 && (dy2 > dy3 || (dy2 === dy3 && data[1] < dy))) {
      data[0] = dx;
      data[1] = dy;
    }
  }
};

export const getPlayerDirectionTowardsHiddenItem = (itemX: number, itemY: number): number => {
  if (itemX === 0 && itemY === 0) {
    return DIR_NONE;
  }
  const abX = itemX < 0 ? itemX * -1 : itemX;
  const abY = itemY < 0 ? itemY * -1 : itemY;
  if (abX > abY) {
    if (itemX < 0) {
      return DIR_EAST;
    }
    return DIR_NORTH;
  }
  if (abX < abY) {
    if (itemY < 0) {
      return DIR_SOUTH;
    }
    return DIR_WEST;
  }
  if (abX === abY) {
    if (itemY < 0) {
      return DIR_SOUTH;
    }
    return DIR_WEST;
  }
  return DIR_NONE;
};

export const taskItemfinderResponsePrintMessage = (runtime: ItemfinderRuntime, taskId: number): void => {
  displayItemMessageOnField(runtime, taskId, FONT_NORMAL, 'The Itemfinder is responding!', 'Task_ItemfinderResponseCleanUp');
};

export const taskItemfinderResponseCleanUp = (runtime: ItemfinderRuntime, taskId: number): void => {
  destroyArrowAndStarTiles(runtime);
  call(runtime, 'ClearDialogWindowAndFrame', 0, true);
  call(runtime, 'ClearPlayerHeldMovementAndUnfreezeObjectEvents');
  call(runtime, 'UnlockPlayerFieldControls');
  destroyTask(runtime, taskId);
};

export const taskItemfinderUnderfootPrintMessage = (runtime: ItemfinderRuntime, taskId: number): void => {
  displayItemMessageOnField(runtime, taskId, FONT_NORMAL, 'The Itemfinder is shaking wildly!', 'Task_ItemfinderUnderfootDigUpItem');
};

export const taskItemfinderUnderfootDigUpItem = (runtime: ItemfinderRuntime, taskId: number): void => {
  destroyArrowAndStarTiles(runtime);
  destroyTask(runtime, taskId);
  call(runtime, 'ScriptContext_SetupScript', 'EventScript_ItemfinderDigUpUnderfootItem');
  call(runtime, 'LockPlayerFieldControls');
};

export const runItemfinderTask = (runtime: ItemfinderRuntime, taskId: number): void => {
  switch (runtime.tasks[taskId].func) {
    case 'Task_NoResponse_CleanUp':
      taskNoResponseCleanUp(runtime, taskId);
      break;
    case 'Task_ItemfinderResponseSoundsAndAnims':
      taskItemfinderResponseSoundsAndAnims(runtime, taskId);
      break;
    case 'Task_ItemfinderUnderfootSoundsAndAnims':
      taskItemfinderUnderfootSoundsAndAnims(runtime, taskId);
      break;
    case 'Task_ItemfinderResponsePrintMessage':
      taskItemfinderResponsePrintMessage(runtime, taskId);
      break;
    case 'Task_ItemfinderResponseCleanUp':
      taskItemfinderResponseCleanUp(runtime, taskId);
      break;
    case 'Task_ItemfinderUnderfootPrintMessage':
      taskItemfinderUnderfootPrintMessage(runtime, taskId);
      break;
    case 'Task_ItemfinderUnderfootDigUpItem':
      taskItemfinderUnderfootDigUpItem(runtime, taskId);
      break;
  }
};

export const loadArrowAndStarTiles = (runtime: ItemfinderRuntime): void => call(runtime, 'LoadSpriteSheet', sArrowAndStarSpriteSheet);
export const destroyArrowAndStarTiles = (runtime: ItemfinderRuntime): void => call(runtime, 'FreeSpriteTilesByTag', ARROW_TILE_TAG);

const createSprite = (runtime: ItemfinderRuntime, callback: ItemfinderSpriteCallback): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push({
    id,
    x: 120,
    y: 76,
    data: Array.from({ length: 8 }, () => 0),
    oam: { paletteNum: 0 },
    callback,
    destroyed: false,
    oamMatrixFreed: false,
    animNum: null,
    affineAnimNum: null
  });
  call(runtime, 'CreateSprite', sSpriteTemplate_ArrowAndStar, 120, 76, 0);
  return id;
};

export const createArrowSprite = (runtime: ItemfinderRuntime, animNum: number, direction: number): number => {
  const spriteId = createSprite(runtime, 'SpriteCallback_Arrow');
  const sprite = runtime.sprites[spriteId];
  sprite.oam.paletteNum = 0;
  sprite.animNum = animNum;
  sprite.data[7] = animNum;
  sprite.data[0] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 120;
  sprite.data[6] = 76;
  const setDelta = (dx: number, dy: number, affine?: number): void => {
    sprite.data[1] = dx;
    sprite.data[2] = dy;
    if (affine !== undefined) {
      sprite.affineAnimNum = affine;
    }
  };
  switch (direction) {
    case DIR_NONE:
      switch (runtime.playerFacingDirection) {
        case DIR_WEST: setDelta(-100, 0, 0); break;
        case DIR_NORTH: setDelta(0, -100, 3); break;
        case DIR_EAST: setDelta(100, 0, 2); break;
        case DIR_SOUTH: setDelta(0, 100, 1); break;
      }
      break;
    case DIR_SOUTH: setDelta(0, -100, 3); break;
    case DIR_NORTH: setDelta(100, 0, 2); break;
    case DIR_WEST: setDelta(0, 100, 1); break;
    case DIR_EAST: setDelta(-100, 0); break;
  }
  call(runtime, 'StartSpriteAnim', spriteId, animNum);
  if (sprite.affineAnimNum !== null) {
    call(runtime, 'StartSpriteAffineAnim', spriteId, sprite.affineAnimNum);
  }
  return spriteId;
};

export const spriteCallbackArrow = (sprite: ItemfinderSprite): void => {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x = sprite.data[5] + (sprite.data[3] >> 8);
  sprite.y = sprite.data[6] + (sprite.data[4] >> 8);
  if (sprite.x <= 104 || sprite.x > 132 || sprite.y <= 60 || sprite.y > 88) {
    sprite.callback = 'SpriteCallback_DestroyArrow';
  }
};

export const spriteCallbackDestroyArrow = (sprite: ItemfinderSprite): void => {
  sprite.oamMatrixFreed = true;
  sprite.destroyed = true;
};

export const createStarSprite = (runtime: ItemfinderRuntime): number => {
  const spriteId = createSprite(runtime, 'SpriteCallback_Star');
  const sprite = runtime.sprites[spriteId];
  sprite.oam.paletteNum = 0;
  sprite.animNum = 4;
  sprite.data[7] = 0;
  sprite.data[0] = 0;
  sprite.data[3] = 0;
  sprite.data[4] = 0;
  sprite.data[5] = 120;
  sprite.data[6] = 76;
  sprite.data[1] = 0;
  sprite.data[2] = -100;
  call(runtime, 'StartSpriteAnim', spriteId, 4);
  return spriteId;
};

export const spriteCallbackStar = (sprite: ItemfinderSprite): void => {
  sprite.data[3] += sprite.data[1];
  sprite.data[4] += sprite.data[2];
  sprite.x = sprite.data[5] + (sprite.data[3] >> 8);
  sprite.y = sprite.data[6] + (sprite.data[4] >> 8);
  if (sprite.x <= 104 || sprite.x > 132 || sprite.y <= 60 || sprite.y > 88) {
    sprite.callback = 'SpriteCallback_DestroyStar';
  }
};

export const spriteCallbackDestroyStar = (sprite: ItemfinderSprite): void => {
  sprite.destroyed = true;
};

export const ItemUseOnFieldCB_Itemfinder = itemUseOnFieldCBItemfinder;
export const Task_NoResponse_CleanUp = taskNoResponseCleanUp;
export const Task_ItemfinderResponseSoundsAndAnims =
  taskItemfinderResponseSoundsAndAnims;
export const Task_ItemfinderUnderfootSoundsAndAnims =
  taskItemfinderUnderfootSoundsAndAnims;
export const HiddenItemIsWithinRangeOfPlayer = hiddenItemIsWithinRangeOfPlayer;
export const SetUnderfootHiddenItem = setUnderfootHiddenItem;
export const SetNormalHiddenItem = setNormalHiddenItem;
export const HiddenItemAtPos = hiddenItemAtPos;
export const HiddenItemInConnectedMapAtPos = hiddenItemInConnectedMapAtPos;
export const FindHiddenItemsInConnectedMaps = findHiddenItemsInConnectedMaps;
export const RegisterHiddenItemRelativeCoordsIfCloser =
  registerHiddenItemRelativeCoordsIfCloser;
export const GetPlayerDirectionTowardsHiddenItem =
  getPlayerDirectionTowardsHiddenItem;
export const Task_ItemfinderResponsePrintMessage =
  taskItemfinderResponsePrintMessage;
export const Task_ItemfinderResponseCleanUp = taskItemfinderResponseCleanUp;
export const Task_ItemfinderUnderfootPrintMessage =
  taskItemfinderUnderfootPrintMessage;
export const Task_ItemfinderUnderfootDigUpItem =
  taskItemfinderUnderfootDigUpItem;
export const LoadArrowAndStarTiles = loadArrowAndStarTiles;
export const DestroyArrowAndStarTiles = destroyArrowAndStarTiles;
export const CreateArrowSprite = createArrowSprite;
export const SpriteCallback_Arrow = spriteCallbackArrow;
export const SpriteCallback_DestroyArrow = spriteCallbackDestroyArrow;
export const CreateStarSprite = createStarSprite;
export const SpriteCallback_Star = spriteCallbackStar;
export const SpriteCallback_DestroyStar = spriteCallbackDestroyStar;
