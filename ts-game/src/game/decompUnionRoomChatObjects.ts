export const UNION_ROOM_KB_PAGE_COUNT = 4;

export enum UnionRoomChatGfxTag {
  SelectorCursor = 0,
  CharacterSelectCursor = 1,
  TextEntryCursor = 2,
  RButton = 3,
  Icons = 4
}

export interface UnionRoomChatSprite {
  id: number;
  template: string;
  x: number;
  y: number;
  subpriority: number;
  invisible: boolean;
  anim: number;
  x2: number;
  data: number[];
}

export interface UnionRoomChatWork {
  selectorCursorSprite: UnionRoomChatSprite | null;
  characterSelectCursorSprite: UnionRoomChatSprite | null;
  textEntryCursorSprite: UnionRoomChatSprite | null;
  rButtonSprite: UnionRoomChatSprite | null;
  chatIconsSprite: UnionRoomChatSprite | null;
  cursorBlinkTimer: number;
}

export interface UnionRoomChatObjectsRuntime {
  work: UnionRoomChatWork | null;
  allocationFails: boolean;
  loadedSheets: { tag: number; size: number }[];
  paletteLoaded: boolean;
  sprites: UnionRoomChatSprite[];
  currentKeyboardPage: number;
  cursorCol: number;
  cursorRow: number;
  messageEntryCursorPosition: number;
  messageEntryBufferLength: number;
  caseToggleIconAnim: number;
  paletteLoads: { index: number; sourceOffset: number; size: number }[];
}

export const createUnionRoomChatObjectsRuntime = (): UnionRoomChatObjectsRuntime => ({
  work: null,
  allocationFails: false,
  loadedSheets: [],
  paletteLoaded: false,
  sprites: [],
  currentKeyboardPage: 0,
  cursorCol: 0,
  cursorRow: 0,
  messageEntryCursorPosition: 0,
  messageEntryBufferLength: 0,
  caseToggleIconAnim: 0,
  paletteLoads: []
});

const spriteSheets = [
  { tag: UnionRoomChatGfxTag.SelectorCursor, size: 128 * 32 },
  { tag: UnionRoomChatGfxTag.CharacterSelectCursor, size: 2 * 32 },
  { tag: UnionRoomChatGfxTag.TextEntryCursor, size: 2 * 32 },
  { tag: UnionRoomChatGfxTag.RButton, size: 4 * 32 },
  { tag: UnionRoomChatGfxTag.Icons, size: 32 * 32 }
];

const createSprite = (
  runtime: UnionRoomChatObjectsRuntime,
  template: string,
  x: number,
  y: number,
  subpriority: number
): UnionRoomChatSprite => {
  const sprite: UnionRoomChatSprite = {
    id: runtime.sprites.length,
    template,
    x,
    y,
    subpriority,
    invisible: false,
    anim: 0,
    x2: 0,
    data: Array.from({ length: 8 }, () => 0)
  };
  runtime.sprites.push(sprite);
  return sprite;
};

export const unionRoomChatTryAllocSpriteWork = (
  runtime: UnionRoomChatObjectsRuntime
): boolean => {
  for (const sheet of spriteSheets) {
    runtime.loadedSheets.push(sheet);
  }
  runtime.paletteLoaded = true;
  if (runtime.allocationFails) {
    runtime.work = null;
    return false;
  }
  runtime.work = {
    selectorCursorSprite: null,
    characterSelectCursorSprite: null,
    textEntryCursorSprite: null,
    rButtonSprite: null,
    chatIconsSprite: null,
    cursorBlinkTimer: 0
  };
  return true;
};

export const unionRoomChatFreeSpriteWork = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  if (runtime.work !== null) {
    runtime.work = null;
  }
};

const work = (runtime: UnionRoomChatObjectsRuntime): UnionRoomChatWork => {
  if (runtime.work === null) {
    throw new Error('UnionRoomChat sprite work is not allocated');
  }
  return runtime.work;
};

export const unionRoomChatCreateSelectorCursorObj = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  work(runtime).selectorCursorSprite = createSprite(runtime, 'SelectorCursor', 10, 24, 0);
};

export const unionRoomChatToggleSelectorCursorObjVisibility = (
  runtime: UnionRoomChatObjectsRuntime,
  invisible: boolean
): void => {
  const sprite = work(runtime).selectorCursorSprite;
  if (sprite !== null) {
    sprite.invisible = invisible;
  }
};

export const unionRoomChatMoveSelectorCursorObj = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  const sprite = work(runtime).selectorCursorSprite;
  if (sprite === null) {
    return;
  }
  const page = runtime.currentKeyboardPage;
  const x = runtime.cursorCol;
  const y = runtime.cursorRow;
  if (page !== UNION_ROOM_KB_PAGE_COUNT) {
    sprite.anim = 0;
    sprite.x = x * 8 + 10;
    sprite.y = y * 12 + 24;
  } else {
    sprite.anim = 2;
    sprite.x = 24;
    sprite.y = y * 12 + 24;
  }
};

export const unionRoomChatUpdateObjPalCycle = (
  runtime: UnionRoomChatObjectsRuntime,
  arg0: number
): void => {
  runtime.paletteLoads.push({ index: 1, sourceOffset: arg0 * 2 + 1, size: 2 });
};

export const unionRoomChatSetSelectorCursorClosedImage = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  const w = work(runtime);
  const sprite = w.selectorCursorSprite;
  if (sprite !== null) {
    sprite.anim = runtime.currentKeyboardPage !== UNION_ROOM_KB_PAGE_COUNT ? 1 : 3;
  }
  w.cursorBlinkTimer = 0;
};

export const unionRoomChatAnimateSelectorCursorReopen = (
  runtime: UnionRoomChatObjectsRuntime
): boolean => {
  const w = work(runtime);
  if (w.cursorBlinkTimer > 3) {
    return false;
  }
  w.cursorBlinkTimer += 1;
  if (w.cursorBlinkTimer > 3) {
    const sprite = w.selectorCursorSprite;
    if (sprite !== null) {
      sprite.anim = runtime.currentKeyboardPage !== UNION_ROOM_KB_PAGE_COUNT ? 0 : 2;
    }
    return false;
  }
  return true;
};

export const unionRoomChatSpawnTextEntryPointerSprites = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  const w = work(runtime);
  w.textEntryCursorSprite = createSprite(runtime, 'TextEntryCursor', 76, 152, 2);
  w.characterSelectCursorSprite = createSprite(runtime, 'CharacterSelectCursor', 64, 152, 1);
};

export const spriteCBTextEntryCursor = (
  runtime: UnionRoomChatObjectsRuntime,
  sprite: UnionRoomChatSprite
): void => {
  const position = runtime.messageEntryCursorPosition;
  if (position === 15) {
    sprite.invisible = true;
  } else {
    sprite.invisible = false;
    sprite.x = position * 8 + 76;
  }
};

export const spriteCBCharacterSelectCursor = (
  sprite: UnionRoomChatSprite
): void => {
  if (++sprite.data[0] > 4) {
    sprite.data[0] = 0;
    if (++sprite.x2 > 4) {
      sprite.x2 = 0;
    }
  }
};

export const createPageSwitchUISprites = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  const w = work(runtime);
  w.rButtonSprite = createSprite(runtime, 'RButton', 8, 152, 3);
  w.chatIconsSprite = createSprite(runtime, 'UnionRoomChatIcons', 32, 152, 4);
  w.chatIconsSprite.invisible = true;
};

export const updateVisibleUnionRoomChatIcon = (
  runtime: UnionRoomChatObjectsRuntime
): void => {
  const sprite = work(runtime).chatIconsSprite;
  if (sprite === null) {
    return;
  }
  if (runtime.currentKeyboardPage === UNION_ROOM_KB_PAGE_COUNT) {
    if (runtime.messageEntryBufferLength !== 0) {
      sprite.invisible = false;
      sprite.anim = 3;
    } else {
      sprite.invisible = true;
    }
  } else {
    const anim = runtime.caseToggleIconAnim;
    if (anim === 3) {
      sprite.invisible = true;
    } else {
      sprite.invisible = false;
      sprite.anim = anim;
    }
  }
};

export function UnionRoomChat_TryAllocSpriteWork(
  runtime: UnionRoomChatObjectsRuntime
): boolean {
  return unionRoomChatTryAllocSpriteWork(runtime);
}

export function UnionRoomChat_FreeSpriteWork(runtime: UnionRoomChatObjectsRuntime): void {
  unionRoomChatFreeSpriteWork(runtime);
}

export function UnionRoomChat_CreateSelectorCursorObj(
  runtime: UnionRoomChatObjectsRuntime
): void {
  unionRoomChatCreateSelectorCursorObj(runtime);
}

export function UnionRoomChat_ToggleSelectorCursorObjVisibility(
  runtime: UnionRoomChatObjectsRuntime,
  invisible: boolean
): void {
  unionRoomChatToggleSelectorCursorObjVisibility(runtime, invisible);
}

export function UnionRoomChat_MoveSelectorCursorObj(
  runtime: UnionRoomChatObjectsRuntime
): void {
  unionRoomChatMoveSelectorCursorObj(runtime);
}

export function UnionRoomChat_UpdateObjPalCycle(
  runtime: UnionRoomChatObjectsRuntime,
  arg0: number
): void {
  unionRoomChatUpdateObjPalCycle(runtime, arg0);
}

export function UnionRoomChat_SetSelectorCursorClosedImage(
  runtime: UnionRoomChatObjectsRuntime
): void {
  unionRoomChatSetSelectorCursorClosedImage(runtime);
}

export function UnionRoomChat_AnimateSelectorCursorReopen(
  runtime: UnionRoomChatObjectsRuntime
): boolean {
  return unionRoomChatAnimateSelectorCursorReopen(runtime);
}

export function UnionRoomChat_SpawnTextEntryPointerSprites(
  runtime: UnionRoomChatObjectsRuntime
): void {
  unionRoomChatSpawnTextEntryPointerSprites(runtime);
}

export function SpriteCB_TextEntryCursor(
  runtime: UnionRoomChatObjectsRuntime,
  sprite: UnionRoomChatSprite
): void {
  spriteCBTextEntryCursor(runtime, sprite);
}

export function SpriteCB_CharacterSelectCursor(sprite: UnionRoomChatSprite): void {
  spriteCBCharacterSelectCursor(sprite);
}

export function CreatePageSwitchUISprites(runtime: UnionRoomChatObjectsRuntime): void {
  createPageSwitchUISprites(runtime);
}

export function UpdateVisibleUnionRoomChatIcon(runtime: UnionRoomChatObjectsRuntime): void {
  updateVisibleUnionRoomChatIcon(runtime);
}
