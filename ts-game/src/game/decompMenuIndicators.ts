export const TAG_NONE = 0xffff;
export const SCROLL_ARROW_LEFT = 0;
export const SCROLL_ARROW_RIGHT = 1;
export const SCROLL_ARROW_UP = 2;
export const SCROLL_ARROW_DOWN = 3;

export interface ScrollArrowsTemplate {
  firstArrowType: number;
  firstX: number;
  firstY: number;
  secondArrowType: number;
  secondX: number;
  secondY: number;
  fullyUpThreshold: number;
  fullyDownThreshold: number;
  tileTag: number;
  palTag: number;
  palNum: number;
}

export interface CursorStruct {
  left: number;
  top: number;
  rowWidth: number;
  rowHeight: number;
  tileTag: number;
  palTag: number;
  palNum: number;
}

export interface MenuIndicatorSprite {
  id: number;
  x: number;
  y: number;
  x2: number;
  y2: number;
  data: number[];
  invisible: boolean;
  oam: { paletteNum: number; priority: number };
  subpriority: number;
  subspriteTableNum: number;
  callback: 'SpriteCallback_ScrollIndicatorArrow' | 'SpriteCallback_RedArrowCursor' | 'SpriteCallbackDummy';
  animNum: number | null;
  destroyed: boolean;
  subspriteTable: SubspriteTable | null;
}

export interface Subsprite {
  x: number;
  y: number;
  shape: string;
  size: string;
  tileOffset: number;
  priority: number;
}

export interface SubspriteTable {
  subspriteCount: number;
  subsprites: Subsprite[];
}

export type MenuIndicatorTask =
  | { id: number; func: 'Task_ScrollIndicatorArrowPair'; destroyed: boolean; priority: number; data: ScrollIndicatorPairData }
  | { id: number; func: 'Task_RedOutlineCursor'; destroyed: boolean; priority: number; data: RedOutlineCursorData }
  | { id: number; func: 'Task_RedArrowCursor'; destroyed: boolean; priority: number; data: RedArrowCursorData };

export interface ScrollIndicatorPairData {
  field_0: number;
  scrollOffset: { value: number };
  fullyUpThreshold: number;
  fullyDownThreshold: number;
  topSpriteId: number;
  bottomSpriteId: number;
  tileTag: number;
  palTag: number;
}

export interface RedOutlineCursorData {
  subspriteTable: SubspriteTable;
  subspritesPtr: Subsprite[];
  spriteId: number;
  tileTag: number;
  palTag: number;
}

export interface RedArrowCursorData {
  spriteId: number;
  tileTag: number;
  palTag: number;
}

export interface MenuIndicatorsRuntime {
  sTempScrollArrowTemplate: ScrollArrowsTemplate;
  sprites: MenuIndicatorSprite[];
  tasks: MenuIndicatorTask[];
  calls: Array<{ fn: string; args: unknown[] }>;
  freedAllocations: unknown[];
}

export const sScrollIndicatorTemplates = [
  { animNum: 0, bounceDir: 0, multiplier: 2, frequency: 8 },
  { animNum: 1, bounceDir: 0, multiplier: 2, frequency: -8 },
  { animNum: 2, bounceDir: 1, multiplier: 2, frequency: 8 },
  { animNum: 3, bounceDir: 1, multiplier: 2, frequency: -8 }
] as const;

export const sSpriteAnimTable_ScrollArrowIndicator = [
  ['ANIMCMD_FRAME(0, 30)', 'ANIMCMD_END'],
  ['ANIMCMD_FRAME(0, 30, 1, 0)', 'ANIMCMD_END'],
  ['ANIMCMD_FRAME(4, 30)', 'ANIMCMD_END'],
  ['ANIMCMD_FRAME(4, 30, 0, 1)', 'ANIMCMD_END']
] as const;
export const sSpriteAnimTable_RedArrowCursor = [['ANIMCMD_FRAME(0, 30)', 'ANIMCMD_END']] as const;
export const sRedArrowPal = 'graphics/interface/red_arrow.gbapal';
export const sRedArrowOtherGfx = 'graphics/interface/red_arrow_other.4bpp.lz';
export const sSelectorOutlineGfx = 'graphics/interface/selector_outline.4bpp.lz';
export const sRedArrowGfx = 'graphics/interface/red_arrow.4bpp.lz';

const baseSubsprite = (tileOffset: number): Subsprite => ({
  x: 0,
  y: 0,
  shape: 'SPRITE_SHAPE(8x8)',
  size: 'SPRITE_SIZE(8x8)',
  tileOffset,
  priority: 0
});

export const sSubsprite_RedOutline1 = baseSubsprite(0);
export const sSubsprite_RedOutline2 = baseSubsprite(1);
export const sSubsprite_RedOutline3 = baseSubsprite(2);
export const sSubsprite_RedOutline4 = baseSubsprite(3);
export const sSubsprite_RedOutline5 = baseSubsprite(4);
export const sSubsprite_RedOutline6 = baseSubsprite(5);
export const sSubsprite_RedOutline7 = baseSubsprite(6);
export const sSubsprite_RedOutline8 = baseSubsprite(7);

export const createMenuIndicatorsRuntime = (): MenuIndicatorsRuntime => ({
  sTempScrollArrowTemplate: {
    firstArrowType: 0,
    firstX: 0,
    firstY: 0,
    secondArrowType: 0,
    secondX: 0,
    secondY: 0,
    fullyUpThreshold: 0,
    fullyDownThreshold: 0,
    tileTag: 0,
    palTag: 0,
    palNum: 0
  },
  sprites: [],
  tasks: [],
  calls: [],
  freedAllocations: []
});

const call = (runtime: MenuIndicatorsRuntime, fn: string, ...args: unknown[]): void => {
  runtime.calls.push({ fn, args });
};
const objPlttId = (palNum: number): number => palNum * 16;
const sine = (pos: number): number => Math.round(Math.sin(((pos & 0xff) * Math.PI) / 128) * 256);
const cloneSubsprite = (subsprite: Subsprite): Subsprite => ({ ...subsprite });

const createSprite = (
  runtime: MenuIndicatorsRuntime,
  callback: MenuIndicatorSprite['callback'],
  x: number,
  y: number,
  template: unknown
): number => {
  const id = runtime.sprites.length;
  runtime.sprites.push({
    id,
    x,
    y,
    x2: 0,
    y2: 0,
    data: Array.from({ length: 8 }, () => 0),
    invisible: false,
    oam: { paletteNum: 0, priority: 0 },
    subpriority: 0,
    subspriteTableNum: 0,
    callback,
    animNum: null,
    destroyed: false,
    subspriteTable: null
  });
  call(runtime, 'CreateSprite', template, x, y, 0);
  return id;
};

const createTask = <T extends MenuIndicatorTask>(runtime: MenuIndicatorsRuntime, task: Omit<T, 'id' | 'destroyed' | 'priority'>, priority = 0): number => {
  const id = runtime.tasks.length;
  runtime.tasks.push({ ...task, id, destroyed: false, priority } as T);
  call(runtime, 'CreateTask', task.func, priority);
  return id;
};

const destroySprite = (runtime: MenuIndicatorsRuntime, spriteId: number): void => {
  runtime.sprites[spriteId].destroyed = true;
  call(runtime, 'DestroySprite', spriteId);
};

const destroyTask = (runtime: MenuIndicatorsRuntime, taskId: number): void => {
  runtime.tasks[taskId].destroyed = true;
  call(runtime, 'DestroyTask', taskId);
};

export const spriteCallbackScrollIndicatorArrow = (sprite: MenuIndicatorSprite): void => {
  let multiplier: number;
  switch (sprite.data[0]) {
    case 0:
      sprite.animNum = sprite.data[1];
      sprite.data[0] += 1;
      break;
    case 1:
      switch (sprite.data[2]) {
        case 0:
          multiplier = sprite.data[3];
          sprite.x2 = Math.trunc((sine(sprite.data[5]) * multiplier) / 256);
          break;
        case 1:
          multiplier = sprite.data[3];
          sprite.y2 = Math.trunc((sine(sprite.data[5]) * multiplier) / 256);
          break;
      }
      sprite.data[5] += sprite.data[4];
      break;
  }
};

export const addScrollIndicatorArrowObject = (
  runtime: MenuIndicatorsRuntime,
  arrowDir: number,
  x: number,
  y: number,
  tileTag: number,
  palTag: number
): number => {
  const spriteTemplate = { kind: 'sSpriteTemplate_ScrollArrowIndicator', tileTag, paletteTag: palTag };
  const spriteId = createSprite(runtime, 'SpriteCallback_ScrollIndicatorArrow', x, y, spriteTemplate);
  const sprite = runtime.sprites[spriteId];
  sprite.invisible = true;
  sprite.data[0] = 0;
  sprite.data[1] = sScrollIndicatorTemplates[arrowDir].animNum;
  sprite.data[2] = sScrollIndicatorTemplates[arrowDir].bounceDir;
  sprite.data[3] = sScrollIndicatorTemplates[arrowDir].multiplier;
  sprite.data[4] = sScrollIndicatorTemplates[arrowDir].frequency;
  sprite.data[5] = 0;
  return spriteId;
};

export const addScrollIndicatorArrowPair = (
  runtime: MenuIndicatorsRuntime,
  arrowInfo: ScrollArrowsTemplate,
  scrollOffset: { value: number }
): number => {
  call(runtime, 'LoadCompressedSpriteSheet', { data: sRedArrowOtherGfx, size: 0x100, tag: arrowInfo.tileTag });
  if (arrowInfo.palTag === TAG_NONE) {
    call(runtime, 'LoadPalette', sRedArrowPal, objPlttId(arrowInfo.palNum), 'sizeof(sRedArrowPal)');
  } else {
    call(runtime, 'LoadSpritePalette', { data: sRedArrowPal, tag: arrowInfo.palTag });
  }
  const topSpriteId = addScrollIndicatorArrowObject(runtime, arrowInfo.firstArrowType, arrowInfo.firstX, arrowInfo.firstY, arrowInfo.tileTag, arrowInfo.palTag);
  const bottomSpriteId = addScrollIndicatorArrowObject(runtime, arrowInfo.secondArrowType, arrowInfo.secondX, arrowInfo.secondY, arrowInfo.tileTag, arrowInfo.palTag);
  const taskId = createTask<MenuIndicatorTask>(runtime, {
    func: 'Task_ScrollIndicatorArrowPair',
    data: {
      field_0: 0,
      scrollOffset,
      fullyUpThreshold: arrowInfo.fullyUpThreshold,
      fullyDownThreshold: arrowInfo.fullyDownThreshold,
      tileTag: arrowInfo.tileTag,
      palTag: arrowInfo.palTag,
      topSpriteId,
      bottomSpriteId
    }
  });
  if (arrowInfo.palTag === TAG_NONE) {
    runtime.sprites[topSpriteId].oam.paletteNum = arrowInfo.palNum;
    runtime.sprites[bottomSpriteId].oam.paletteNum = arrowInfo.palNum;
  }
  return taskId;
};

export const addScrollIndicatorArrowPairParameterized = (
  runtime: MenuIndicatorsRuntime,
  arrowType: number,
  commonPos: number,
  firstPos: number,
  secondPos: number,
  fullyDownThreshold: number,
  tileTag: number,
  palTag: number,
  scrollOffset: { value: number }
): number => {
  if (arrowType === SCROLL_ARROW_UP || arrowType === SCROLL_ARROW_DOWN) {
    runtime.sTempScrollArrowTemplate.firstArrowType = SCROLL_ARROW_UP;
    runtime.sTempScrollArrowTemplate.firstX = commonPos;
    runtime.sTempScrollArrowTemplate.firstY = firstPos;
    runtime.sTempScrollArrowTemplate.secondArrowType = SCROLL_ARROW_DOWN;
    runtime.sTempScrollArrowTemplate.secondX = commonPos;
    runtime.sTempScrollArrowTemplate.secondY = secondPos;
  } else {
    runtime.sTempScrollArrowTemplate.firstArrowType = SCROLL_ARROW_LEFT;
    runtime.sTempScrollArrowTemplate.firstX = firstPos;
    runtime.sTempScrollArrowTemplate.firstY = commonPos;
    runtime.sTempScrollArrowTemplate.secondArrowType = SCROLL_ARROW_RIGHT;
    runtime.sTempScrollArrowTemplate.secondX = secondPos;
    runtime.sTempScrollArrowTemplate.secondY = commonPos;
  }
  runtime.sTempScrollArrowTemplate.fullyUpThreshold = 0;
  runtime.sTempScrollArrowTemplate.fullyDownThreshold = fullyDownThreshold;
  runtime.sTempScrollArrowTemplate.tileTag = tileTag;
  runtime.sTempScrollArrowTemplate.palTag = palTag;
  runtime.sTempScrollArrowTemplate.palNum = 0;
  return addScrollIndicatorArrowPair(runtime, runtime.sTempScrollArrowTemplate, scrollOffset);
};

export const taskScrollIndicatorArrowPair = (runtime: MenuIndicatorsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.func !== 'Task_ScrollIndicatorArrowPair') return;
  const data = task.data;
  const currItem = data.scrollOffset.value;
  runtime.sprites[data.topSpriteId].invisible = currItem === data.fullyUpThreshold;
  runtime.sprites[data.bottomSpriteId].invisible = currItem === data.fullyDownThreshold;
};

export const removeScrollIndicatorArrowPair = (runtime: MenuIndicatorsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.func !== 'Task_ScrollIndicatorArrowPair') return;
  const data = task.data;
  if (data.tileTag !== TAG_NONE) call(runtime, 'FreeSpriteTilesByTag', data.tileTag);
  if (data.palTag !== TAG_NONE) call(runtime, 'FreeSpritePaletteByTag', data.palTag);
  destroySprite(runtime, data.topSpriteId);
  destroySprite(runtime, data.bottomSpriteId);
  destroyTask(runtime, taskId);
};

export const listMenuAddCursorObjectInternal = (runtime: MenuIndicatorsRuntime, cursor: CursorStruct, cursorKind: number): number => {
  switch (cursorKind) {
    case 0:
    default:
      return listMenuAddRedOutlineCursorObject(runtime, cursor);
    case 1:
      return listMenuAddRedArrowCursorObject(runtime, cursor);
  }
};

export const listMenuUpdateCursorObject = (runtime: MenuIndicatorsRuntime, taskId: number, x: number, y: number, cursorKind: number): void => {
  switch (cursorKind) {
    case 0: listMenuUpdateRedOutlineCursorObject(runtime, taskId, x, y); break;
    case 1: listMenuUpdateRedArrowCursorObject(runtime, taskId, x, y); break;
  }
};

export const listMenuRemoveCursorObject = (runtime: MenuIndicatorsRuntime, taskId: number, cursorKind: number): void => {
  switch (cursorKind) {
    case 0: listMenuRemoveRedOutlineCursorObject(runtime, taskId); break;
    case 1: listMenuRemoveRedArrowCursorObject(runtime, taskId); break;
  }
};

export const taskRedOutlineCursor = (_runtime: MenuIndicatorsRuntime, _taskId: number): void => {};

export const listMenuGetRedOutlineCursorSpriteCount = (rowWidth: number, rowHeight: number): number => {
  let count = 4;
  if (rowWidth > 16) {
    for (let i = 8; i < rowWidth - 8; i += 8) count += 2;
  }
  if (rowHeight > 16) {
    for (let i = 8; i < rowHeight - 8; i += 8) count += 2;
  }
  return count;
};

export const listMenuSetUpRedOutlineCursorSpriteOamTable = (rowWidth: number, rowHeight: number, subsprites: Subsprite[]): void => {
  let id = 0;
  subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline1), x: 136, y: 136 }; id += 1;
  subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline2), x: rowWidth + 128, y: 136 }; id += 1;
  subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline7), x: 136, y: rowHeight + 128 }; id += 1;
  subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline8), x: rowWidth + 128, y: rowHeight + 128 }; id += 1;
  if (rowWidth > 16) {
    for (let i = 8; i < rowWidth - 8; i += 8) {
      subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline3), x: i - 120, y: 136 }; id += 1;
      subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline6), x: i - 120, y: rowHeight + 128 }; id += 1;
    }
  }
  if (rowHeight > 16) {
    for (let j = 8; j < rowHeight - 8; j += 8) {
      subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline4), x: 136, y: j - 120 }; id += 1;
      subsprites[id] = { ...cloneSubsprite(sSubsprite_RedOutline5), x: rowWidth + 128, y: j - 120 }; id += 1;
    }
  }
};

export const listMenuAddRedOutlineCursorObject = (runtime: MenuIndicatorsRuntime, cursor: CursorStruct): number => {
  call(runtime, 'LoadCompressedSpriteSheet', { data: sSelectorOutlineGfx, size: 0x100, tag: cursor.tileTag });
  if (cursor.palTag === TAG_NONE) call(runtime, 'LoadPalette', sRedArrowPal, objPlttId(cursor.palNum), 'sizeof(sRedArrowPal)');
  else call(runtime, 'LoadSpritePalette', { data: sRedArrowPal, tag: cursor.palTag });

  const subspriteCount = listMenuGetRedOutlineCursorSpriteCount(cursor.rowWidth, cursor.rowHeight);
  const subsprites = Array.from({ length: subspriteCount }, () => cloneSubsprite(sSubsprite_RedOutline1));
  listMenuSetUpRedOutlineCursorSpriteOamTable(cursor.rowWidth, cursor.rowHeight, subsprites);
  const subspriteTable = { subspriteCount, subsprites };
  const spriteId = createSprite(runtime, 'SpriteCallbackDummy', cursor.left + 120, cursor.top + 120, { kind: 'gDummySpriteTemplate', tileTag: cursor.tileTag, paletteTag: cursor.palTag });
  runtime.sprites[spriteId].subspriteTable = subspriteTable;
  runtime.sprites[spriteId].oam.priority = 0;
  runtime.sprites[spriteId].subpriority = 0;
  runtime.sprites[spriteId].subspriteTableNum = 0;
  if (cursor.palTag === TAG_NONE) runtime.sprites[spriteId].oam.paletteNum = cursor.palNum;
  return createTask<MenuIndicatorTask>(runtime, {
    func: 'Task_RedOutlineCursor',
    data: { tileTag: cursor.tileTag, palTag: cursor.palTag, subspriteTable, subspritesPtr: subsprites, spriteId }
  });
};

export const listMenuUpdateRedOutlineCursorObject = (runtime: MenuIndicatorsRuntime, taskId: number, x: number, y: number): void => {
  const task = runtime.tasks[taskId];
  if (task.func !== 'Task_RedOutlineCursor') return;
  runtime.sprites[task.data.spriteId].x = x + 120;
  runtime.sprites[task.data.spriteId].y = y + 120;
};

export const listMenuRemoveRedOutlineCursorObject = (runtime: MenuIndicatorsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.func !== 'Task_RedOutlineCursor') return;
  runtime.freedAllocations.push(task.data.subspritesPtr);
  call(runtime, 'Free', task.data.subspritesPtr);
  if (task.data.tileTag !== TAG_NONE) call(runtime, 'FreeSpriteTilesByTag', task.data.tileTag);
  if (task.data.palTag !== TAG_NONE) call(runtime, 'FreeSpritePaletteByTag', task.data.palTag);
  destroySprite(runtime, task.data.spriteId);
  destroyTask(runtime, taskId);
};

export const spriteCallbackRedArrowCursor = (sprite: MenuIndicatorSprite): void => {
  sprite.x2 = Math.trunc(sine(sprite.data[0]) / 64);
  sprite.data[0] += 8;
};

export const taskRedArrowCursor = (_runtime: MenuIndicatorsRuntime, _taskId: number): void => {};

export const listMenuAddRedArrowCursorObject = (runtime: MenuIndicatorsRuntime, cursor: CursorStruct): number => {
  call(runtime, 'LoadCompressedSpriteSheet', { data: sRedArrowGfx, size: 0x80, tag: cursor.tileTag });
  if (cursor.palTag === TAG_NONE) call(runtime, 'LoadPalette', sRedArrowPal, objPlttId(cursor.palNum), 'sizeof(sRedArrowPal)');
  else call(runtime, 'LoadSpritePalette', { data: sRedArrowPal, tag: cursor.palTag });
  const spriteId = createSprite(runtime, 'SpriteCallback_RedArrowCursor', cursor.left, cursor.top, { kind: 'sSpriteTemplate_RedArrowCursor', tileTag: cursor.tileTag, paletteTag: cursor.palTag });
  runtime.sprites[spriteId].x2 = 8;
  runtime.sprites[spriteId].y2 = 8;
  if (cursor.palTag === TAG_NONE) runtime.sprites[spriteId].oam.paletteNum = cursor.palNum;
  return createTask<MenuIndicatorTask>(runtime, {
    func: 'Task_RedArrowCursor',
    data: { spriteId, tileTag: cursor.tileTag, palTag: cursor.palTag }
  });
};

export const listMenuUpdateRedArrowCursorObject = (runtime: MenuIndicatorsRuntime, taskId: number, x: number, y: number): void => {
  const task = runtime.tasks[taskId];
  if (task.func !== 'Task_RedArrowCursor') return;
  runtime.sprites[task.data.spriteId].x = x;
  runtime.sprites[task.data.spriteId].y = y;
};

export const listMenuRemoveRedArrowCursorObject = (runtime: MenuIndicatorsRuntime, taskId: number): void => {
  const task = runtime.tasks[taskId];
  if (task.func !== 'Task_RedArrowCursor') return;
  if (task.data.tileTag !== TAG_NONE) call(runtime, 'FreeSpriteTilesByTag', task.data.tileTag);
  if (task.data.palTag !== TAG_NONE) call(runtime, 'FreeSpritePaletteByTag', task.data.palTag);
  destroySprite(runtime, task.data.spriteId);
  destroyTask(runtime, taskId);
};

export const SpriteCallback_ScrollIndicatorArrow = spriteCallbackScrollIndicatorArrow;
export const AddScrollIndicatorArrowObject = addScrollIndicatorArrowObject;
export const AddScrollIndicatorArrowPair = addScrollIndicatorArrowPair;
export const AddScrollIndicatorArrowPairParameterized = addScrollIndicatorArrowPairParameterized;
export const Task_ScrollIndicatorArrowPair = taskScrollIndicatorArrowPair;
export const RemoveScrollIndicatorArrowPair = removeScrollIndicatorArrowPair;
export const ListMenuAddCursorObjectInternal = listMenuAddCursorObjectInternal;
export const ListMenuUpdateCursorObject = listMenuUpdateCursorObject;
export const ListMenuRemoveCursorObject = listMenuRemoveCursorObject;
export const Task_RedOutlineCursor = taskRedOutlineCursor;
export const ListMenuGetRedOutlineCursorSpriteCount = listMenuGetRedOutlineCursorSpriteCount;
export const ListMenuSetUpRedOutlineCursorSpriteOamTable = listMenuSetUpRedOutlineCursorSpriteOamTable;
export const ListMenuAddRedOutlineCursorObject = listMenuAddRedOutlineCursorObject;
export const ListMenuUpdateRedOutlineCursorObject = listMenuUpdateRedOutlineCursorObject;
export const ListMenuRemoveRedOutlineCursorObject = listMenuRemoveRedOutlineCursorObject;
export const SpriteCallback_RedArrowCursor = spriteCallbackRedArrowCursor;
export const Task_RedArrowCursor = taskRedArrowCursor;
export const ListMenuAddRedArrowCursorObject = listMenuAddRedArrowCursorObject;
export const ListMenuUpdateRedArrowCursorObject = listMenuUpdateRedArrowCursorObject;
export const ListMenuRemoveRedArrowCursorObject = listMenuRemoveRedArrowCursorObject;
