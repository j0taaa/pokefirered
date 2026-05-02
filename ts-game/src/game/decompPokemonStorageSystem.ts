export const TOTAL_BOXES_COUNT = 14;
export const IN_BOX_COUNT = 30;
export const IN_BOX_COLUMNS = 6;
export const IN_BOX_ROWS = 5;
export const PARTY_SIZE = 6;
export const WALLPAPER_COUNT = 16;
export const SPECIES_NONE = 0;
export const DISPLAY_WIDTH = 240;
export const DISPLAY_HEIGHT = 160;

export const OPTION_WITHDRAW = 0;
export const OPTION_DEPOSIT = 1;
export const OPTION_MOVE_MONS = 2;
export const OPTION_MOVE_ITEMS = 3;

export const CURSOR_AREA_IN_BOX = 0;
export const CURSOR_AREA_IN_PARTY = 1;
export const CURSOR_AREA_BOX_TITLE = 2;
export const CURSOR_AREA_BUTTONS = 3;
export const CURSOR_AREA_IN_HAND = 4;

export const MOVE_MODE_NORMAL = 0;
export const MOVE_MODE_MULTIPLE_SELECTING = 1;
export const MOVE_MODE_MULTIPLE_MOVING = 2;

export interface DecompBoxPokemon {
  species: number;
  isEgg?: boolean;
  nickname?: string;
  level?: number;
  fixedIV?: number;
  hasFixedPersonality?: number;
  personality?: number;
  otIDType?: number;
  otID?: number;
  data?: Record<number, number | string | boolean>;
}

export type DecompPokemon = DecompBoxPokemon;
export type BoxMonDataDestination =
  | { value?: number | string | boolean }
  | Array<number | string | boolean>;

export interface DecompPokemonStorage {
  currentBox: number;
  boxes: DecompBoxPokemon[][];
  boxNames: string[];
  boxWallpapers: number[];
}

export interface StorageCursorSprite {
  x: number;
  y: number;
  y2?: number;
  vFlip: boolean;
  oam: {
    priority: number;
  };
  subpriority?: number;
  invisible?: boolean;
}

export interface StorageCursorRuntime {
  boxOption: number;
  inBoxMovingMode: number;
  cursorArea: number;
  cursorPosition: number;
  savedCursorPosition: number;
  isMonBeingMoved: boolean;
  movingMonOrigBoxId: number;
  movingMonOrigBoxPos: number;
  cursorPrevPartyPos: number;
  newCursorArea: number;
  newCursorPosition: number;
  cursorTargetX: number;
  cursorTargetY: number;
  cursorNewX: number;
  cursorNewY: number;
  cursorSpeedX: number;
  cursorSpeedY: number;
  cursorMoveSteps: number;
  cursorVerticalWrap: number;
  cursorHorizontalWrap: number;
  cursorFlipTimer: number;
  cursorSprite: StorageCursorSprite;
  cursorShadowSprite: StorageCursorSprite;
  movingMonPriority: number;
}

export const createEmptyBoxMon = (): DecompBoxPokemon => ({
  species: SPECIES_NONE,
  isEgg: false,
  nickname: '',
  data: {}
});

export const createPokemonStorage = (): DecompPokemonStorage => ({
  currentBox: 0,
  boxes: Array.from({ length: TOTAL_BOXES_COUNT }, () =>
    Array.from({ length: IN_BOX_COUNT }, () => createEmptyBoxMon())
  ),
  boxNames: Array.from({ length: TOTAL_BOXES_COUNT }, (_, i) => `BOX ${i + 1}`),
  boxWallpapers: Array.from({ length: TOTAL_BOXES_COUNT }, () => 0)
});

export const createStorageCursorRuntime = (overrides: Partial<StorageCursorRuntime> = {}): StorageCursorRuntime => {
  const cursorArea = overrides.cursorArea ?? (overrides.boxOption === OPTION_DEPOSIT ? CURSOR_AREA_IN_PARTY : CURSOR_AREA_IN_BOX);
  const coords = getCursorCoordsByPos(cursorArea, overrides.cursorPosition ?? 0, overrides.isMonBeingMoved ?? false);
  return {
    boxOption: OPTION_WITHDRAW,
    inBoxMovingMode: MOVE_MODE_NORMAL,
    cursorArea,
    cursorPosition: 0,
    savedCursorPosition: 0,
    isMonBeingMoved: false,
    movingMonOrigBoxId: 0,
    movingMonOrigBoxPos: 0,
    cursorPrevPartyPos: 1,
    newCursorArea: cursorArea,
    newCursorPosition: 0,
    cursorTargetX: coords.x,
    cursorTargetY: coords.y,
    cursorNewX: coords.x << 8,
    cursorNewY: coords.y << 8,
    cursorSpeedX: 0,
    cursorSpeedY: 0,
    cursorMoveSteps: 0,
    cursorVerticalWrap: 0,
    cursorHorizontalWrap: 0,
    cursorFlipTimer: 0,
    cursorSprite: { x: coords.x, y: coords.y, vFlip: false, oam: { priority: 1 } },
    cursorShadowSprite: { x: coords.x, y: coords.y, vFlip: false, oam: { priority: 1 }, invisible: true },
    movingMonPriority: 1,
    ...overrides
  };
};

const isValidBoxSlot = (boxId: number, boxPosition: number): boolean =>
  boxId >= 0 && boxId < TOTAL_BOXES_COUNT && boxPosition >= 0 && boxPosition < IN_BOX_COUNT;

export const backupPokemonStorage = (storage: DecompPokemonStorage): DecompPokemonStorage =>
  structuredClone(storage) as DecompPokemonStorage;

export const restorePokemonStorage = (
  storage: DecompPokemonStorage,
  src: DecompPokemonStorage
): void => {
  storage.currentBox = src.currentBox;
  storage.boxes = structuredClone(src.boxes) as DecompBoxPokemon[][];
  storage.boxNames = [...src.boxNames];
  storage.boxWallpapers = [...src.boxWallpapers];
};

export const storageGetCurrentBox = (storage: DecompPokemonStorage): number =>
  storage.currentBox;

export const setCurrentBox = (storage: DecompPokemonStorage, boxId: number): void => {
  if (boxId < TOTAL_BOXES_COUNT) {
    storage.currentBox = Math.trunc(boxId) & 0xff;
  }
};

export const getBoxMonDataAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  request: number
): number | string | boolean => {
  if (!isValidBoxSlot(boxId, boxPosition)) {
    return 0;
  }
  const mon = storage.boxes[boxId][boxPosition];
  if (request === 0) {
    return mon.species;
  }
  if (request === 1) {
    return mon.isEgg ? 1 : 0;
  }
  return mon.data?.[request] ?? 0;
};

export const setBoxMonDataAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  request: number,
  value: number | string | boolean
): void => {
  if (!isValidBoxSlot(boxId, boxPosition)) {
    return;
  }
  const mon = storage.boxes[boxId][boxPosition];
  if (request === 0 && typeof value === 'number') {
    mon.species = value;
    return;
  }
  if (request === 1) {
    mon.isEgg = Boolean(value);
    return;
  }
  mon.data ??= {};
  mon.data[request] = value;
};

export const getCurrentBoxMonData = (
  storage: DecompPokemonStorage,
  boxPosition: number,
  request: number
): number | string | boolean => getBoxMonDataAt(storage, storage.currentBox, boxPosition, request);

export const setCurrentBoxMonData = (
  storage: DecompPokemonStorage,
  boxPosition: number,
  request: number,
  value: number | string | boolean
): void => setBoxMonDataAt(storage, storage.currentBox, boxPosition, request, value);

export const getBoxMonNickAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number
): string => isValidBoxSlot(boxId, boxPosition)
  ? storage.boxes[boxId][boxPosition].nickname ?? ''
  : '';

export const setBoxMonNickAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  nick: string
): void => {
  if (isValidBoxSlot(boxId, boxPosition)) {
    storage.boxes[boxId][boxPosition].nickname = nick;
  }
};

export const getAndCopyBoxMonDataAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  request: number,
  dst?: BoxMonDataDestination
): number | string | boolean => {
  if (!isValidBoxSlot(boxId, boxPosition)) {
    return 0;
  }
  const value = getBoxMonDataAt(storage, boxId, boxPosition, request);
  if (dst) {
    if (Array.isArray(dst)) {
      dst[0] = value;
    } else {
      dst.value = value;
    }
  }
  return value;
};

export const setBoxMonAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  src: DecompBoxPokemon
): void => {
  if (isValidBoxSlot(boxId, boxPosition)) {
    storage.boxes[boxId][boxPosition] = structuredClone(src) as DecompBoxPokemon;
  }
};

export const copyBoxMonAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number
): DecompBoxPokemon | null => isValidBoxSlot(boxId, boxPosition)
  ? structuredClone(storage.boxes[boxId][boxPosition]) as DecompBoxPokemon
  : null;

export const createBoxMonAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  species: number,
  level: number,
  fixedIV: number,
  hasFixedPersonality: number,
  personality: number,
  otIDType: number,
  otID: number
): void => {
  if (isValidBoxSlot(boxId, boxPosition)) {
    storage.boxes[boxId][boxPosition] = {
      species,
      isEgg: false,
      level,
      fixedIV,
      hasFixedPersonality,
      personality,
      otIDType,
      otID,
      data: {}
    };
  }
};

export const zeroBoxMonAt = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number
): void => {
  if (isValidBoxSlot(boxId, boxPosition)) {
    storage.boxes[boxId][boxPosition] = createEmptyBoxMon();
  }
};

export const boxMonAtToMon = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number,
  dst: DecompPokemon
): void => {
  if (isValidBoxSlot(boxId, boxPosition)) {
    Object.assign(dst, structuredClone(storage.boxes[boxId][boxPosition]) as DecompPokemon);
  }
};

export const getBoxedMonPtr = (
  storage: DecompPokemonStorage,
  boxId: number,
  boxPosition: number
): DecompBoxPokemon | null => isValidBoxSlot(boxId, boxPosition)
  ? storage.boxes[boxId][boxPosition]
  : null;

export const getBoxNamePtr = (
  storage: DecompPokemonStorage,
  boxId: number
): string | null => boxId < TOTAL_BOXES_COUNT ? storage.boxNames[boxId] : null;

export const getBoxWallpaper = (
  storage: DecompPokemonStorage,
  boxId: number
): number => boxId < TOTAL_BOXES_COUNT ? storage.boxWallpapers[boxId] : 0;

export const setBoxWallpaper = (
  storage: DecompPokemonStorage,
  boxId: number,
  wallpaperId: number
): void => {
  if (boxId < TOTAL_BOXES_COUNT && wallpaperId < WALLPAPER_COUNT) {
    storage.boxWallpapers[boxId] = Math.trunc(wallpaperId) & 0xff;
  }
};

export const seekToNextMonInBox = (
  boxMons: readonly DecompBoxPokemon[],
  curIndex: number,
  maxIndex: number,
  flags: number
): number => {
  const adder = flags === 0 || flags === 1 ? 1 : -1;
  const allowEggs = flags === 1 || flags === 3;
  for (let i = Math.trunc(curIndex) + adder; i >= 0 && i <= maxIndex; i += adder) {
    const mon = boxMons[i];
    if (mon?.species !== SPECIES_NONE && (allowEggs || !mon?.isEgg)) {
      return i;
    }
  }
  return -1;
};

export const BackupPokemonStorage = backupPokemonStorage;
export const RestorePokemonStorage = restorePokemonStorage;
export const StorageGetCurrentBox = storageGetCurrentBox;
export const SetCurrentBox = setCurrentBox;
export const GetBoxMonDataAt = getBoxMonDataAt;
export const SetBoxMonDataAt = setBoxMonDataAt;
export const GetCurrentBoxMonData = getCurrentBoxMonData;
export const SetCurrentBoxMonData = setCurrentBoxMonData;
export const GetBoxMonNickAt = getBoxMonNickAt;
export const SetBoxMonNickAt = setBoxMonNickAt;
export const GetAndCopyBoxMonDataAt = getAndCopyBoxMonDataAt;
export const SetBoxMonAt = setBoxMonAt;
export const CopyBoxMonAt = copyBoxMonAt;
export const CreateBoxMonAt = createBoxMonAt;
export const ZeroBoxMonAt = zeroBoxMonAt;
export const BoxMonAtToMon = boxMonAtToMon;
export const GetBoxedMonPtr = getBoxedMonPtr;
export const GetBoxNamePtr = getBoxNamePtr;
export const GetBoxWallpaper = getBoxWallpaper;
export const SetBoxWallpaper = setBoxWallpaper;
export const SeekToNextMonInBox = seekToNextMonInBox;

export const getCursorCoordsByPos = (
  cursorArea: number,
  cursorPosition: number,
  isMonBeingMoved = false
): { x: number; y: number } => {
  switch (cursorArea) {
    case CURSOR_AREA_IN_BOX:
      return {
        x: (cursorPosition % IN_BOX_COLUMNS) * 24 + 100,
        y: Math.trunc(cursorPosition / IN_BOX_COLUMNS) * 24 + 32
      };
    case CURSOR_AREA_IN_PARTY:
      if (cursorPosition === 0) {
        return { x: 104, y: 52 };
      }
      if (cursorPosition === PARTY_SIZE) {
        return { x: 152, y: 132 };
      }
      return { x: 152, y: (cursorPosition - 1) * 24 + 4 };
    case CURSOR_AREA_BOX_TITLE:
      return { x: 162, y: 12 };
    case CURSOR_AREA_BUTTONS:
      return { x: cursorPosition * 88 + 120, y: isMonBeingMoved ? 8 : 14 };
    case CURSOR_AREA_IN_HAND:
      return { x: 160, y: 96 };
    default:
      return { x: 0, y: 0 };
  }
};

export const initNewCursorPos = (
  runtime: StorageCursorRuntime,
  newCursorArea: number,
  newCursorPosition: number
): void => {
  const coords = getCursorCoordsByPos(newCursorArea, newCursorPosition, runtime.isMonBeingMoved);
  runtime.newCursorArea = newCursorArea;
  runtime.newCursorPosition = newCursorPosition;
  runtime.cursorTargetX = coords.x;
  runtime.cursorTargetY = coords.y;
};

export const initCursorMove = (runtime: StorageCursorRuntime): void => {
  let yDistance: number;
  let xDistance: number;
  runtime.cursorMoveSteps = runtime.cursorVerticalWrap !== 0 || runtime.cursorHorizontalWrap !== 0 ? 12 : 6;
  if (runtime.cursorFlipTimer) {
    runtime.cursorFlipTimer = Math.trunc(runtime.cursorMoveSteps / 2);
  }

  switch (runtime.cursorVerticalWrap) {
    case -1:
      yDistance = runtime.cursorTargetY - 192 - runtime.cursorSprite.y;
      break;
    case 1:
      yDistance = runtime.cursorTargetY + 192 - runtime.cursorSprite.y;
      break;
    default:
      yDistance = runtime.cursorTargetY - runtime.cursorSprite.y;
      break;
  }

  switch (runtime.cursorHorizontalWrap) {
    case -1:
      xDistance = runtime.cursorTargetX - 192 - runtime.cursorSprite.x;
      break;
    case 1:
      xDistance = runtime.cursorTargetX + 192 - runtime.cursorSprite.x;
      break;
    default:
      xDistance = runtime.cursorTargetX - runtime.cursorSprite.x;
      break;
  }

  runtime.cursorSpeedX = Math.trunc((xDistance << 8) / runtime.cursorMoveSteps);
  runtime.cursorSpeedY = Math.trunc((yDistance << 8) / runtime.cursorMoveSteps);
  runtime.cursorNewX = runtime.cursorSprite.x << 8;
  runtime.cursorNewY = runtime.cursorSprite.y << 8;
};

export const doCursorNewPosUpdate = (runtime: StorageCursorRuntime): void => {
  runtime.cursorArea = runtime.newCursorArea;
  runtime.cursorPosition = runtime.newCursorPosition;
  switch (runtime.cursorArea) {
    case CURSOR_AREA_BUTTONS:
      runtime.movingMonPriority = 1;
      break;
    case CURSOR_AREA_IN_PARTY:
      runtime.cursorShadowSprite.subpriority = 13;
      runtime.movingMonPriority = 1;
      break;
    case CURSOR_AREA_IN_BOX:
      if (runtime.inBoxMovingMode === MOVE_MODE_NORMAL) {
        runtime.cursorSprite.oam.priority = 1;
        runtime.cursorShadowSprite.oam.priority = 2;
        runtime.cursorShadowSprite.subpriority = 21;
        runtime.cursorShadowSprite.invisible = false;
        runtime.movingMonPriority = 2;
      }
      break;
  }
};

export const updateCursorPos = (
  runtime: StorageCursorRuntime,
  isItemIconAnimActive = false
): boolean => {
  let tmp: number;
  if (runtime.cursorMoveSteps === 0) {
    if (runtime.boxOption !== OPTION_MOVE_ITEMS) {
      return false;
    }
    return isItemIconAnimActive;
  }

  runtime.cursorMoveSteps -= 1;
  if (runtime.cursorMoveSteps !== 0) {
    runtime.cursorNewX += runtime.cursorSpeedX;
    runtime.cursorNewY += runtime.cursorSpeedY;
    runtime.cursorSprite.x = runtime.cursorNewX >> 8;
    runtime.cursorSprite.y = runtime.cursorNewY >> 8;

    if (runtime.cursorSprite.x > DISPLAY_WIDTH + 16) {
      tmp = runtime.cursorSprite.x - (DISPLAY_WIDTH + 16);
      runtime.cursorSprite.x = tmp + 64;
    }
    if (runtime.cursorSprite.x < 64) {
      tmp = 64 - runtime.cursorSprite.x;
      runtime.cursorSprite.x = DISPLAY_WIDTH + 16 - tmp;
    }
    if (runtime.cursorSprite.y > DISPLAY_HEIGHT + 16) {
      tmp = runtime.cursorSprite.y - (DISPLAY_HEIGHT + 16);
      runtime.cursorSprite.y = tmp - 16;
    }
    if (runtime.cursorSprite.y < -16) {
      tmp = -16 - runtime.cursorSprite.y;
      runtime.cursorSprite.y = DISPLAY_HEIGHT + 16 - tmp;
    }

    if (runtime.cursorFlipTimer) {
      runtime.cursorFlipTimer -= 1;
      if (runtime.cursorFlipTimer === 0) {
        runtime.cursorSprite.vFlip = !runtime.cursorSprite.vFlip;
      }
    }
  } else {
    runtime.cursorSprite.x = runtime.cursorTargetX;
    runtime.cursorSprite.y = runtime.cursorTargetY;
    doCursorNewPosUpdate(runtime);
  }

  return true;
};

export const setCursorPosition = (
  runtime: StorageCursorRuntime,
  newCursorArea: number,
  newCursorPosition: number
): void => {
  initNewCursorPos(runtime, newCursorArea, newCursorPosition);
  initCursorMove(runtime);
  if (newCursorArea === CURSOR_AREA_IN_PARTY && runtime.cursorArea !== CURSOR_AREA_IN_PARTY) {
    runtime.cursorPrevPartyPos = 1;
    runtime.cursorShadowSprite.invisible = true;
  }
  switch (newCursorArea) {
    case CURSOR_AREA_IN_PARTY:
    case CURSOR_AREA_BOX_TITLE:
    case CURSOR_AREA_BUTTONS:
      runtime.cursorSprite.oam.priority = 1;
      runtime.cursorShadowSprite.invisible = true;
      runtime.cursorShadowSprite.oam.priority = 1;
      break;
    case CURSOR_AREA_IN_BOX:
      if (runtime.inBoxMovingMode !== MOVE_MODE_NORMAL) {
        runtime.cursorSprite.oam.priority = 0;
        runtime.cursorShadowSprite.invisible = true;
      } else {
        runtime.cursorSprite.oam.priority = 2;
        if (runtime.cursorArea === CURSOR_AREA_IN_BOX && runtime.isMonBeingMoved) {
          runtime.movingMonPriority = 2;
        }
      }
      break;
  }
};

export const setCursorInParty = (runtime: StorageCursorRuntime, partyCount: number): void => {
  let targetPartyCount: number;
  if (!runtime.isMonBeingMoved) {
    targetPartyCount = 0;
  } else {
    targetPartyCount = partyCount;
    if (targetPartyCount >= PARTY_SIZE) {
      targetPartyCount = PARTY_SIZE - 1;
    }
  }
  if (runtime.cursorSprite.vFlip) {
    runtime.cursorFlipTimer = 1;
  }
  setCursorPosition(runtime, CURSOR_AREA_IN_PARTY, targetPartyCount);
};

export const setCursorBoxPosition = (runtime: StorageCursorRuntime, cursorBoxPosition: number): void => {
  setCursorPosition(runtime, CURSOR_AREA_IN_BOX, cursorBoxPosition);
};

export const clearSavedCursorPos = (runtime: StorageCursorRuntime): void => {
  runtime.savedCursorPosition = 0;
};

export const saveCursorPos = (runtime: StorageCursorRuntime): void => {
  runtime.savedCursorPosition = runtime.cursorPosition;
};

export const getSavedCursorPos = (runtime: StorageCursorRuntime): number =>
  runtime.savedCursorPosition;

export const isMonBeingMoved = (runtime: StorageCursorRuntime): boolean =>
  runtime.isMonBeingMoved;

export const isCursorOnBoxTitle = (runtime: StorageCursorRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_BOX_TITLE;

export const isCursorOnCloseBox = (runtime: StorageCursorRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_BUTTONS && runtime.cursorPosition === 1;

export const isCursorInBox = (runtime: StorageCursorRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_IN_BOX;

export const getBoxCursorPosition = (runtime: StorageCursorRuntime): number =>
  runtime.cursorPosition;

export const getCursorBoxColumnAndRow = (runtime: StorageCursorRuntime): { column: number; row: number } => {
  if (runtime.cursorArea === CURSOR_AREA_IN_BOX) {
    return {
      column: runtime.cursorPosition % IN_BOX_COLUMNS,
      row: Math.trunc(runtime.cursorPosition / IN_BOX_COLUMNS)
    };
  }
  return { column: 0, row: 0 };
};

export interface StoragePartyMon {
  species: number;
  [key: string]: unknown;
}

export const compactPartySlots = (party: StoragePartyMon[]): number => {
  let retVal = -1;
  let last = 0;
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const mon = party[i] ?? { species: SPECIES_NONE };
    if (mon.species !== SPECIES_NONE) {
      if (i !== last) {
        party[last] = mon;
      }
      last += 1;
    } else if (retVal === -1) {
      retVal = i;
    }
  }
  for (; last < PARTY_SIZE; last += 1) {
    party[last] = { species: SPECIES_NONE };
  }
  return retVal;
};

export const CHANGE_GRAB = 0;
export const CHANGE_PLACE = 1;
export const CHANGE_SHIFT = 2;

export const INPUT_NONE = 0;
export const INPUT_MOVE_CURSOR = 1;
export const INPUT_IN_MENU = 2;
export const INPUT_PRESSED_B = 3;
export const INPUT_SCROLL_LEFT = 4;
export const INPUT_SCROLL_RIGHT = 5;
export const INPUT_DEPOSIT = 6;
export const INPUT_WITHDRAW = 7;
export const INPUT_MOVE_MON = 8;
export const INPUT_SHIFT_MON = 9;
export const INPUT_PLACE_MON = 10;
export const INPUT_TAKE_ITEM = 11;
export const INPUT_GIVE_ITEM = 12;
export const INPUT_SWITCH_ITEMS = 13;
export const INPUT_MULTIMOVE_START = 14;
export const INPUT_MULTIMOVE_CHANGE_SELECTION = 15;
export const INPUT_MULTIMOVE_UNABLE = 16;
export const INPUT_MULTIMOVE_SINGLE = 17;
export const INPUT_MULTIMOVE_GRAB_SELECTION = 18;
export const INPUT_MULTIMOVE_MOVE_MONS = 19;
export const INPUT_MULTIMOVE_PLACE_MONS = 20;
export const INPUT_HIDE_PARTY = 21;
export const INPUT_CLOSE_BOX = 22;
export const INPUT_SHOW_PARTY = 23;
export const INPUT_BOX_OPTIONS = 24;

export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const SELECT_BUTTON = 0x0004;
export const START_BUTTON = 0x0008;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;
export const L_BUTTON = 0x0200;
export const R_BUTTON = 0x0100;

export const MODE_PARTY = 0;
export const MODE_BOX = 1;
export const MODE_MOVE = 2;

export const MENU_TEXT_CANCEL = 0;
export const MENU_TEXT_STORE = 1;
export const MENU_TEXT_WITHDRAW = 2;
export const MENU_TEXT_MOVE = 3;
export const MENU_TEXT_SHIFT = 4;
export const MENU_TEXT_PLACE = 5;
export const MENU_TEXT_SUMMARY = 6;
export const MENU_TEXT_RELEASE = 7;
export const MENU_TEXT_MARK = 8;
export const MENU_TEXT_JUMP = 9;
export const MENU_TEXT_WALLPAPER = 10;
export const MENU_TEXT_NAME = 11;
export const MENU_TEXT_TAKE = 12;
export const MENU_TEXT_GIVE = 13;
export const MENU_TEXT_GIVE2 = 14;
export const MENU_TEXT_SWITCH = 15;
export const MENU_TEXT_BAG = 16;
export const MENU_TEXT_INFO = 17;
export const MENU_B_PRESSED = -1;
export const MENU_NOTHING_CHOSEN = -2;

export const ITEM_NONE = 0;
export const SPECIES_EGG = 412;
export const MOVE_SURF = 57;
export const MOVE_DIVE = 291;
export const MOVES_COUNT = 355;
export const RELEASE_MON_ALLOWED = 0;
export const RELEASE_MON_NOT_ALLOWED = 1;
export const RELEASE_MON_UNDETERMINED = 2;

export interface StorageMenuItem {
  textId: number;
  text: string;
}

export interface PokemonStorageDataRuntime extends StorageCursorRuntime {
  storage: DecompPokemonStorage;
  playerParty: DecompBoxPokemon[];
  movingMon: DecompBoxPokemon;
  tempMon: DecompBoxPokemon;
  carriedMon: DecompBoxPokemon;
  displayMonSpecies: number;
  displayMonIsEgg: boolean;
  displayMonNickname: string;
  displayMonLevel: number;
  displayMonMarkings: number;
  displayMonPersonality: number;
  displayMonItemId: number;
  displayMonTexts: string[];
  displayMonPalette: number;
  displayMonGender: number;
  setMosaic: boolean;
  menuItems: StorageMenuItem[];
  menuItemsCount: number;
  menuWidth: number;
  menuWindow: { width: number; height: number; tilemapLeft: number; tilemapTop: number; bg: number; paletteNum: number; baseBlock: number };
  menuWindowId: number;
  menuCursorPos: number;
  monPlaceChangeState: number;
  newKeys: number;
  repeatKeys: number;
  heldKeys: number;
  optionsButtonMode: number;
  inMultiMoveMode: boolean;
  operations: string[];
  activeItemMoving: boolean;
  itemIsMail: (itemId: number) => boolean;
  multiMoveOriginPosition: number;
  multiMoveCanPlaceSelection: boolean;
  multiMoveTryMoveGroup: boolean[];
  releaseBoxId: number;
  releaseBoxPos: number;
  releaseCheckState: number;
  releaseCheckBoxId: number;
  releaseCheckBoxPos: number;
  releaseMonStatusResolved: boolean;
  releaseMonStatus: number;
  isSurfMon: boolean;
  isDiveMon: boolean;
  restrictedMoveList: number[];
  lastViewedMonIndex: number;
  summaryCursorPos: number;
  summaryLastIndex: number;
  summaryScreenMode: number;
  summaryMonPtrKind: 'moving' | 'party' | 'box';
  shiftBoxId: number;
  releaseMonName: string;
}

const cloneMon = (mon: DecompBoxPokemon): DecompBoxPokemon =>
  structuredClone(mon) as DecompBoxPokemon;

export const createPokemonStorageDataRuntime = (
  overrides: Partial<PokemonStorageDataRuntime> = {}
): PokemonStorageDataRuntime => {
  const storage = overrides.storage ?? createPokemonStorage();
  const base = createStorageCursorRuntime(overrides);
  return {
    ...base,
    storage,
    playerParty: overrides.playerParty ?? Array.from({ length: PARTY_SIZE }, () => createEmptyBoxMon()),
    movingMon: overrides.movingMon ?? createEmptyBoxMon(),
    tempMon: overrides.tempMon ?? createEmptyBoxMon(),
    carriedMon: overrides.carriedMon ?? createEmptyBoxMon(),
    displayMonSpecies: overrides.displayMonSpecies ?? SPECIES_NONE,
    displayMonIsEgg: overrides.displayMonIsEgg ?? false,
    displayMonNickname: overrides.displayMonNickname ?? '',
    displayMonLevel: overrides.displayMonLevel ?? 0,
    displayMonMarkings: overrides.displayMonMarkings ?? 0,
    displayMonPersonality: overrides.displayMonPersonality ?? 0,
    displayMonItemId: overrides.displayMonItemId ?? ITEM_NONE,
    displayMonTexts: overrides.displayMonTexts ?? ['', '', '', ''],
    displayMonPalette: overrides.displayMonPalette ?? 0,
    displayMonGender: overrides.displayMonGender ?? 0,
    setMosaic: overrides.setMosaic ?? false,
    menuItems: overrides.menuItems ?? [],
    menuItemsCount: overrides.menuItemsCount ?? 0,
    menuWidth: overrides.menuWidth ?? 0,
    menuWindow: overrides.menuWindow ?? { width: 0, height: 0, tilemapLeft: 0, tilemapTop: 0, bg: 0, paletteNum: 15, baseBlock: 92 },
    menuWindowId: overrides.menuWindowId ?? -1,
    menuCursorPos: overrides.menuCursorPos ?? 0,
    monPlaceChangeState: overrides.monPlaceChangeState ?? 0,
    newKeys: overrides.newKeys ?? 0,
    repeatKeys: overrides.repeatKeys ?? 0,
    heldKeys: overrides.heldKeys ?? 0,
    optionsButtonMode: overrides.optionsButtonMode ?? 0,
    inMultiMoveMode: overrides.inMultiMoveMode ?? false,
    operations: overrides.operations ?? [],
    activeItemMoving: overrides.activeItemMoving ?? false,
    itemIsMail: overrides.itemIsMail ?? (() => false),
    multiMoveOriginPosition: overrides.multiMoveOriginPosition ?? 0,
    multiMoveCanPlaceSelection: overrides.multiMoveCanPlaceSelection ?? true,
    multiMoveTryMoveGroup: overrides.multiMoveTryMoveGroup ?? [true, true, true, true],
    releaseBoxId: overrides.releaseBoxId ?? -1,
    releaseBoxPos: overrides.releaseBoxPos ?? -1,
    releaseCheckState: overrides.releaseCheckState ?? 0,
    releaseCheckBoxId: overrides.releaseCheckBoxId ?? 0,
    releaseCheckBoxPos: overrides.releaseCheckBoxPos ?? 0,
    releaseMonStatusResolved: overrides.releaseMonStatusResolved ?? false,
    releaseMonStatus: overrides.releaseMonStatus ?? RELEASE_MON_UNDETERMINED,
    isSurfMon: overrides.isSurfMon ?? false,
    isDiveMon: overrides.isDiveMon ?? false,
    restrictedMoveList: overrides.restrictedMoveList ?? [MOVE_SURF, MOVE_DIVE, MOVES_COUNT],
    lastViewedMonIndex: overrides.lastViewedMonIndex ?? 0,
    summaryCursorPos: overrides.summaryCursorPos ?? 0,
    summaryLastIndex: overrides.summaryLastIndex ?? 0,
    summaryScreenMode: overrides.summaryScreenMode ?? 0,
    summaryMonPtrKind: overrides.summaryMonPtrKind ?? 'party',
    shiftBoxId: overrides.shiftBoxId ?? 0,
    releaseMonName: overrides.releaseMonName ?? '',
    ...overrides
  };
};

const joyNew = (runtime: PokemonStorageDataRuntime, mask: number): boolean => (runtime.newKeys & mask) !== 0;
const joyHeld = (runtime: PokemonStorageDataRuntime, mask: number): boolean => (runtime.heldKeys & mask) !== 0;
const joyRept = (runtime: PokemonStorageDataRuntime, mask: number): boolean => (runtime.repeatKeys & mask) !== 0;

const getPartyCount = (runtime: PokemonStorageDataRuntime): number =>
  runtime.playerParty.filter((mon) => mon.species !== SPECIES_NONE).length;

const getCurrentStorageMon = (runtime: PokemonStorageDataRuntime, boxId: number, pos: number): DecompBoxPokemon =>
  boxId === TOTAL_BOXES_COUNT ? runtime.playerParty[pos] : runtime.storage.boxes[boxId][pos];

const setCurrentStorageMon = (
  runtime: PokemonStorageDataRuntime,
  boxId: number,
  pos: number,
  mon: DecompBoxPokemon
): void => {
  if (boxId === TOTAL_BOXES_COUNT)
    runtime.playerParty[pos] = cloneMon(mon);
  else
    runtime.storage.boxes[boxId][pos] = cloneMon(mon);
};

export const InitCursor = (runtime: PokemonStorageDataRuntime): void => {
  runtime.cursorArea = runtime.boxOption !== OPTION_DEPOSIT ? CURSOR_AREA_IN_BOX : CURSOR_AREA_IN_PARTY;
  runtime.cursorPosition = 0;
  runtime.isMonBeingMoved = false;
  runtime.movingMonOrigBoxId = 0;
  runtime.movingMonOrigBoxPos = 0;
  runtime.inMultiMoveMode = false;
  ClearSavedCursorPos(runtime);
  CreateCursorSprites(runtime);
  runtime.cursorPrevPartyPos = 1;
  runtime.inBoxMovingMode = MOVE_MODE_NORMAL;
  TrySetDisplayMonData(runtime);
};

export const InitCursorOnReopen = (runtime: PokemonStorageDataRuntime): void => {
  CreateCursorSprites(runtime);
  ReshowDisplayMon(runtime);
  runtime.cursorPrevPartyPos = 1;
  runtime.inBoxMovingMode = MOVE_MODE_NORMAL;
  if (runtime.isMonBeingMoved) {
    runtime.movingMon = cloneMon(runtime.carriedMon);
    runtime.operations.push('CreateMovingMonIcon');
  }
};

export const GetCursorCoordsByPos = (
  cursorArea: number,
  cursorPosition: number,
  runtime?: PokemonStorageDataRuntime
): { x: number; y: number } => getCursorCoordsByPos(cursorArea, cursorPosition, runtime?.isMonBeingMoved ?? false);

export const GetSpeciesAtCursorPosition = (runtime: PokemonStorageDataRuntime): number => {
  switch (runtime.cursorArea) {
    case CURSOR_AREA_IN_PARTY:
      return runtime.playerParty[runtime.cursorPosition]?.species ?? SPECIES_NONE;
    case CURSOR_AREA_IN_BOX:
      return runtime.storage.boxes[runtime.storage.currentBox][runtime.cursorPosition]?.species ?? SPECIES_NONE;
    default:
      return SPECIES_NONE;
  }
};

export const UpdateCursorPos = (runtime: PokemonStorageDataRuntime, isItemIconAnimActive = false): boolean =>
  updateCursorPos(runtime, isItemIconAnimActive);

export const InitNewCursorPos = (runtime: PokemonStorageDataRuntime, newCursorArea: number, newCursorPosition: number): void =>
  initNewCursorPos(runtime, newCursorArea, newCursorPosition);

export const InitCursorMove = (runtime: PokemonStorageDataRuntime): void =>
  initCursorMove(runtime);

export const SetCursorPosition = (runtime: PokemonStorageDataRuntime, newCursorArea: number, newCursorPosition: number): void => {
  setCursorPosition(runtime, newCursorArea, newCursorPosition);
  if (runtime.boxOption === OPTION_MOVE_ITEMS) {
    if (runtime.cursorArea === CURSOR_AREA_IN_BOX || runtime.cursorArea === CURSOR_AREA_IN_PARTY)
      runtime.operations.push(`TryHideItemIconAtPos:${runtime.cursorArea}:${runtime.cursorPosition}`);
    if (newCursorArea === CURSOR_AREA_IN_BOX || newCursorArea === CURSOR_AREA_IN_PARTY)
      runtime.operations.push(`TryLoadItemIconAtPos:${newCursorArea}:${newCursorPosition}`);
  }
};

export const DoCursorNewPosUpdate = (runtime: PokemonStorageDataRuntime): void => {
  doCursorNewPosUpdate(runtime);
  TrySetDisplayMonData(runtime);
  if (runtime.cursorArea === CURSOR_AREA_BOX_TITLE)
    runtime.operations.push('AnimateBoxScrollArrows:TRUE');
};

export const SetCursorInParty = (runtime: PokemonStorageDataRuntime): void =>
  setCursorInParty(runtime, getPartyCount(runtime));

export const SetCursorBoxPosition = (runtime: PokemonStorageDataRuntime, cursorBoxPosition: number): void =>
  SetCursorPosition(runtime, CURSOR_AREA_IN_BOX, cursorBoxPosition);

export const ClearSavedCursorPos = (runtime: PokemonStorageDataRuntime): void =>
  clearSavedCursorPos(runtime);

export const SaveCursorPos = (runtime: PokemonStorageDataRuntime): void =>
  saveCursorPos(runtime);

export const GetSavedCursorPos = (runtime: PokemonStorageDataRuntime): number =>
  getSavedCursorPos(runtime);

export const InitMonPlaceChange = (runtime: PokemonStorageDataRuntime, type: number): void => {
  runtime.monPlaceChangeState = 0;
  runtime.operations.push(`InitMonPlaceChange:${type}`);
  (runtime as PokemonStorageDataRuntime & { monPlaceChangeType: number }).monPlaceChangeType = type;
};

export const InitMultiMonPlaceChange = (runtime: PokemonStorageDataRuntime, moveCursorUp: boolean): void => {
  runtime.monPlaceChangeState = 0;
  (runtime as PokemonStorageDataRuntime & { monPlaceChangeType: number }).monPlaceChangeType = moveCursorUp ? 4 : 3;
};

export const DoMonPlaceChange = (runtime: PokemonStorageDataRuntime): boolean => {
  switch ((runtime as PokemonStorageDataRuntime & { monPlaceChangeType?: number }).monPlaceChangeType) {
    case CHANGE_GRAB:
      return MonPlaceChange_Grab(runtime);
    case CHANGE_PLACE:
      return MonPlaceChange_Place(runtime);
    case CHANGE_SHIFT:
      return MonPlaceChange_Shift(runtime);
    case 3:
      return MonPlaceChange_DoMoveCursorDown(runtime);
    case 4:
      return MonPlaceChange_DoMoveCursorUp(runtime);
    default:
      return false;
  }
};

export const MonPlaceChange_MoveCursorDown = (runtime: PokemonStorageDataRuntime): boolean => {
  switch (runtime.cursorSprite.y2 ?? 0) {
    case 8:
      return false;
    default:
      runtime.cursorSprite.y2 = (runtime.cursorSprite.y2 ?? 0) + 1;
      return true;
  }
};

export const MonPlaceChange_MoveCursorUp = (runtime: PokemonStorageDataRuntime): boolean => {
  if ((runtime.cursorSprite.y2 ?? 0) === 0)
    return false;
  runtime.cursorSprite.y2 = (runtime.cursorSprite.y2 ?? 0) - 1;
  return true;
};

export const MonPlaceChange_DoMoveCursorDown = (runtime: PokemonStorageDataRuntime): boolean =>
  MonPlaceChange_MoveCursorDown(runtime);

export const MonPlaceChange_DoMoveCursorUp = (runtime: PokemonStorageDataRuntime): boolean =>
  MonPlaceChange_MoveCursorUp(runtime);

export const MoveMon = (runtime: PokemonStorageDataRuntime): void => {
  switch (runtime.cursorArea) {
    case CURSOR_AREA_IN_PARTY:
      SetMovedMonData(runtime, TOTAL_BOXES_COUNT, runtime.cursorPosition);
      runtime.operations.push(`SetMovingMonSprite:${MODE_PARTY}:${runtime.cursorPosition}`);
      break;
    case CURSOR_AREA_IN_BOX:
      if (runtime.inBoxMovingMode === MOVE_MODE_NORMAL) {
        SetMovedMonData(runtime, runtime.storage.currentBox, runtime.cursorPosition);
        runtime.operations.push(`SetMovingMonSprite:${MODE_BOX}:${runtime.cursorPosition}`);
      }
      break;
    default:
      return;
  }
  runtime.isMonBeingMoved = true;
};

export const PlaceMon = (runtime: PokemonStorageDataRuntime): void => {
  switch (runtime.cursorArea) {
    case CURSOR_AREA_IN_PARTY:
      SetPlacedMonData(runtime, TOTAL_BOXES_COUNT, runtime.cursorPosition);
      runtime.operations.push(`SetPlacedMonSprite:${TOTAL_BOXES_COUNT}:${runtime.cursorPosition}`);
      break;
    case CURSOR_AREA_IN_BOX:
      SetPlacedMonData(runtime, runtime.storage.currentBox, runtime.cursorPosition);
      runtime.operations.push(`SetPlacedMonSprite:${runtime.storage.currentBox}:${runtime.cursorPosition}`);
      break;
    default:
      return;
  }
  runtime.isMonBeingMoved = false;
};

export const MonPlaceChange_Grab = (runtime: PokemonStorageDataRuntime): boolean => {
  switch (runtime.monPlaceChangeState) {
    case 0:
      if (runtime.isMonBeingMoved)
        return false;
      StartCursorAnim(runtime, 2);
      runtime.monPlaceChangeState++;
      break;
    case 1:
      if (!MonPlaceChange_MoveCursorDown(runtime)) {
        StartCursorAnim(runtime, 3);
        MoveMon(runtime);
        runtime.monPlaceChangeState++;
      }
      break;
    case 2:
      if (!MonPlaceChange_MoveCursorUp(runtime))
        runtime.monPlaceChangeState++;
      break;
    case 3:
      return false;
  }
  return true;
};

export const MonPlaceChange_Place = (runtime: PokemonStorageDataRuntime): boolean => {
  switch (runtime.monPlaceChangeState) {
    case 0:
      if (!MonPlaceChange_MoveCursorDown(runtime)) {
        StartCursorAnim(runtime, 2);
        PlaceMon(runtime);
        runtime.monPlaceChangeState++;
      }
      break;
    case 1:
      if (!MonPlaceChange_MoveCursorUp(runtime)) {
        StartCursorAnim(runtime, 0);
        runtime.monPlaceChangeState++;
      }
      break;
    case 2:
      return false;
  }
  return true;
};

export const MonPlaceChange_Shift = (runtime: PokemonStorageDataRuntime): boolean => {
  switch (runtime.monPlaceChangeState) {
    case 0:
      if (runtime.cursorArea === CURSOR_AREA_IN_PARTY)
        runtime.shiftBoxId = TOTAL_BOXES_COUNT;
      else if (runtime.cursorArea === CURSOR_AREA_IN_BOX)
        runtime.shiftBoxId = runtime.storage.currentBox;
      else
        return false;
      StartCursorAnim(runtime, 2);
      runtime.operations.push(`SetShiftMonSpritePtr:${runtime.shiftBoxId}:${runtime.cursorPosition}`);
      runtime.monPlaceChangeState++;
      break;
    case 1:
      StartCursorAnim(runtime, 3);
      SetShiftedMonData(runtime, runtime.shiftBoxId, runtime.cursorPosition);
      runtime.monPlaceChangeState++;
      break;
    case 2:
      return false;
  }
  return true;
};

export const DoTrySetDisplayMonData = (runtime: PokemonStorageDataRuntime): void =>
  TrySetDisplayMonData(runtime);

export const SetMovedMonData = (runtime: PokemonStorageDataRuntime, boxId: number, position: number): void => {
  runtime.movingMon = cloneMon(getCurrentStorageMon(runtime, boxId, position));
  PurgeMonOrBoxMon(runtime, boxId, position);
  runtime.movingMonOrigBoxId = boxId;
  runtime.movingMonOrigBoxPos = position;
};

export const SetPlacedMonData = (runtime: PokemonStorageDataRuntime, boxId: number, position: number): void => {
  setCurrentStorageMon(runtime, boxId, position, runtime.movingMon);
};

export const PurgeMonOrBoxMon = (runtime: PokemonStorageDataRuntime, boxId: number, position: number): void => {
  setCurrentStorageMon(runtime, boxId, position, createEmptyBoxMon());
};

export const SetShiftedMonData = (runtime: PokemonStorageDataRuntime, boxId: number, position: number): void => {
  runtime.tempMon = cloneMon(getCurrentStorageMon(runtime, boxId, position));
  SetPlacedMonData(runtime, boxId, position);
  runtime.movingMon = cloneMon(runtime.tempMon);
  SetDisplayMonData(runtime, runtime.movingMon, MODE_PARTY);
  runtime.movingMonOrigBoxId = boxId;
  runtime.movingMonOrigBoxPos = position;
};

export const TryStorePartyMonInBox = (runtime: PokemonStorageDataRuntime, boxId: number): boolean => {
  const boxPosition = runtime.storage.boxes[boxId].findIndex((mon) => mon.species === SPECIES_NONE);
  if (boxPosition === -1)
    return false;
  if (runtime.isMonBeingMoved) {
    SetPlacedMonData(runtime, boxId, boxPosition);
    runtime.operations.push('DestroyMovingMonIcon');
    runtime.isMonBeingMoved = false;
  } else {
    SetMovedMonData(runtime, TOTAL_BOXES_COUNT, runtime.cursorPosition);
    SetPlacedMonData(runtime, boxId, boxPosition);
    runtime.operations.push(`DestroyPartyMonIcon:${runtime.cursorPosition}`);
  }
  if (boxId === runtime.storage.currentBox)
    runtime.operations.push(`CreateBoxMonIconAtPos:${boxPosition}`);
  StartCursorAnim(runtime, 1);
  return true;
};

export const ResetSelectionAfterDeposit = (runtime: PokemonStorageDataRuntime): void => {
  StartCursorAnim(runtime, 0);
  TrySetDisplayMonData(runtime);
};

export const InitReleaseMon = (runtime: PokemonStorageDataRuntime): void => {
  const mode = runtime.isMonBeingMoved ? MODE_MOVE : runtime.cursorArea === CURSOR_AREA_IN_PARTY ? MODE_PARTY : MODE_BOX;
  runtime.operations.push(`DoReleaseMonAnim:${mode}:${runtime.cursorPosition}`);
  runtime.releaseMonName = runtime.displayMonNickname;
};

export const TryHideReleaseMon = (runtime: PokemonStorageDataRuntime, hidden = false): boolean => {
  if (!hidden) {
    StartCursorAnim(runtime, 0);
    return false;
  }
  return true;
};

export const ReleaseMon = (runtime: PokemonStorageDataRuntime): void => {
  runtime.operations.push('DestroyReleaseMonIcon');
  if (runtime.isMonBeingMoved)
    runtime.isMonBeingMoved = false;
  else
    PurgeMonOrBoxMon(runtime, runtime.cursorArea === CURSOR_AREA_IN_PARTY ? TOTAL_BOXES_COUNT : runtime.storage.currentBox, runtime.cursorPosition);
  TrySetDisplayMonData(runtime);
};

export const TrySetCursorFistAnim = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved)
    StartCursorAnim(runtime, 3);
};

const monKnownMoveFlags = (mon: DecompBoxPokemon): number => {
  const moves = ((mon.data as Record<string, unknown> | undefined)?.moves ?? []) as number[];
  return (moves.includes(MOVE_SURF) ? 1 : 0) | (moves.includes(MOVE_DIVE) ? 2 : 0);
};

export const InitCanReleaseMonVars = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved) {
    runtime.tempMon = cloneMon(runtime.movingMon);
    runtime.releaseBoxId = -1;
    runtime.releaseBoxPos = -1;
  } else if (runtime.cursorArea === CURSOR_AREA_IN_PARTY) {
    runtime.tempMon = cloneMon(runtime.playerParty[runtime.cursorPosition]);
    runtime.releaseBoxId = TOTAL_BOXES_COUNT;
    runtime.releaseBoxPos = runtime.cursorPosition;
  } else {
    runtime.tempMon = cloneMon(runtime.storage.boxes[runtime.storage.currentBox][runtime.cursorPosition]);
    runtime.releaseBoxId = runtime.storage.currentBox;
    runtime.releaseBoxPos = runtime.cursorPosition;
  }
  runtime.isSurfMon = false;
  runtime.isDiveMon = false;
  runtime.restrictedMoveList = [MOVE_SURF, MOVE_DIVE, MOVES_COUNT];
  const knownMoveFlags = monKnownMoveFlags(runtime.tempMon);
  runtime.isSurfMon = (knownMoveFlags & 1) !== 0;
  runtime.isDiveMon = ((knownMoveFlags >> 1) & 1) !== 0;
  if (runtime.isSurfMon || runtime.isDiveMon) {
    runtime.releaseMonStatusResolved = false;
  } else {
    runtime.releaseMonStatusResolved = true;
    runtime.releaseMonStatus = RELEASE_MON_ALLOWED;
  }
  runtime.releaseCheckState = 0;
};

export const RunCanReleaseMon = (runtime: PokemonStorageDataRuntime): number => {
  if (runtime.releaseMonStatusResolved)
    return runtime.releaseMonStatus;
  if (runtime.releaseCheckState === 0) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      if (runtime.releaseBoxId !== TOTAL_BOXES_COUNT || runtime.releaseBoxPos !== i) {
        const flags = monKnownMoveFlags(runtime.playerParty[i]);
        if (flags & 1)
          runtime.isSurfMon = false;
        if (flags & 2)
          runtime.isDiveMon = false;
      }
    }
    if (!(runtime.isSurfMon || runtime.isDiveMon)) {
      runtime.releaseMonStatusResolved = true;
      runtime.releaseMonStatus = RELEASE_MON_ALLOWED;
    } else {
      runtime.releaseCheckBoxId = 0;
      runtime.releaseCheckBoxPos = 0;
      runtime.releaseCheckState++;
    }
  } else if (runtime.releaseCheckState === 1) {
    for (let i = 0; i < 5; i++) {
      const flags = monKnownMoveFlags(runtime.storage.boxes[runtime.releaseCheckBoxId][runtime.releaseCheckBoxPos]);
      if (flags !== 0 && !(runtime.releaseBoxId === runtime.releaseCheckBoxId && runtime.releaseBoxPos === runtime.releaseCheckBoxPos)) {
        if (flags & 1)
          runtime.isSurfMon = false;
        if (flags & 2)
          runtime.isDiveMon = false;
      }
      if (++runtime.releaseCheckBoxPos >= IN_BOX_COUNT) {
        runtime.releaseCheckBoxPos = 0;
        if (++runtime.releaseCheckBoxId >= TOTAL_BOXES_COUNT) {
          runtime.releaseMonStatusResolved = true;
          runtime.releaseMonStatus = RELEASE_MON_NOT_ALLOWED;
          break;
        }
      }
    }
    if (!(runtime.isSurfMon || runtime.isDiveMon)) {
      runtime.releaseMonStatusResolved = true;
      runtime.releaseMonStatus = RELEASE_MON_ALLOWED;
    }
  }
  return RELEASE_MON_UNDETERMINED;
};

export const SaveMovingMon = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved)
    runtime.carriedMon = cloneMon(runtime.movingMon);
};

export const LoadSavedMovingMon = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved)
    runtime.movingMon = cloneMon(runtime.carriedMon);
};

export const InitSummaryScreenData = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved) {
    SaveMovingMon(runtime);
    runtime.summaryMonPtrKind = 'moving';
    runtime.summaryCursorPos = 0;
    runtime.summaryLastIndex = 0;
    runtime.summaryScreenMode = MODE_PARTY;
  } else if (runtime.cursorArea === CURSOR_AREA_IN_PARTY) {
    runtime.summaryMonPtrKind = 'party';
    runtime.summaryCursorPos = runtime.cursorPosition;
    runtime.summaryLastIndex = getPartyCount(runtime) - 1;
    runtime.summaryScreenMode = MODE_PARTY;
  } else {
    runtime.summaryMonPtrKind = 'box';
    runtime.summaryCursorPos = runtime.cursorPosition;
    runtime.summaryLastIndex = IN_BOX_COUNT - 1;
    runtime.summaryScreenMode = MODE_BOX;
  }
};

export const SetSelectionAfterSummaryScreen = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved)
    LoadSavedMovingMon(runtime);
  else
    runtime.cursorPosition = runtime.lastViewedMonIndex;
};

export const CompactPartySlots = (runtime: PokemonStorageDataRuntime): number =>
  compactPartySlots(runtime.playerParty as StoragePartyMon[]);

export const SetMonMarkings = (runtime: PokemonStorageDataRuntime, markings: number): void => {
  runtime.displayMonMarkings = markings;
  if (runtime.isMonBeingMoved)
    runtime.movingMon.data = { ...(runtime.movingMon.data ?? {}), markings } as DecompBoxPokemon['data'];
  else if (runtime.cursorArea === CURSOR_AREA_IN_PARTY)
    runtime.playerParty[runtime.cursorPosition].data = { ...(runtime.playerParty[runtime.cursorPosition].data ?? {}), markings } as DecompBoxPokemon['data'];
  else if (runtime.cursorArea === CURSOR_AREA_IN_BOX)
    runtime.storage.boxes[runtime.storage.currentBox][runtime.cursorPosition].data = {
      ...(runtime.storage.boxes[runtime.storage.currentBox][runtime.cursorPosition].data ?? {}),
      markings
    } as DecompBoxPokemon['data'];
};

const countPartyAliveNonEggExcept = (runtime: PokemonStorageDataRuntime, except: number): number =>
  runtime.playerParty.filter((mon, i) => i !== except && mon.species !== SPECIES_NONE && !mon.isEgg && (((mon.data as Record<string, unknown> | undefined)?.hp as number | undefined) ?? 1) > 0).length;

export const CanMovePartyMon = (runtime: PokemonStorageDataRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_IN_PARTY && !runtime.isMonBeingMoved && countPartyAliveNonEggExcept(runtime, runtime.cursorPosition) === 0;

export const CanShiftMon = (runtime: PokemonStorageDataRuntime): boolean => {
  if (!runtime.isMonBeingMoved)
    return false;
  if (runtime.cursorArea === CURSOR_AREA_IN_PARTY && countPartyAliveNonEggExcept(runtime, runtime.cursorPosition) === 0) {
    if (runtime.displayMonIsEgg || (((runtime.movingMon.data as Record<string, unknown> | undefined)?.hp as number | undefined) ?? 1) === 0)
      return false;
  }
  return true;
};

export const IsMonBeingMoved = (runtime: PokemonStorageDataRuntime): boolean =>
  runtime.isMonBeingMoved;

export const IsCursorOnBoxTitle = (runtime: PokemonStorageDataRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_BOX_TITLE;

export const IsCursorOnCloseBox = (runtime: PokemonStorageDataRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_BUTTONS && runtime.cursorPosition === 1;

export const IsCursorInBox = (runtime: PokemonStorageDataRuntime): boolean =>
  runtime.cursorArea === CURSOR_AREA_IN_BOX;

export const TrySetDisplayMonData = (runtime: PokemonStorageDataRuntime): void => {
  runtime.setMosaic = runtime.isMonBeingMoved === false;
  if (runtime.isMonBeingMoved)
    return;
  switch (runtime.cursorArea) {
    case CURSOR_AREA_IN_PARTY:
      if (runtime.cursorPosition < PARTY_SIZE) {
        SetDisplayMonData(runtime, runtime.playerParty[runtime.cursorPosition], MODE_PARTY);
        break;
      }
      SetDisplayMonData(runtime, null, MODE_MOVE);
      break;
    case CURSOR_AREA_BUTTONS:
    case CURSOR_AREA_BOX_TITLE:
      SetDisplayMonData(runtime, null, MODE_MOVE);
      break;
    case CURSOR_AREA_IN_BOX:
      SetDisplayMonData(runtime, runtime.storage.boxes[runtime.storage.currentBox][runtime.cursorPosition], MODE_BOX);
      break;
  }
};

export const ReshowDisplayMon = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.isMonBeingMoved)
    SetDisplayMonData(runtime, runtime.carriedMon, MODE_PARTY);
  else
    TrySetDisplayMonData(runtime);
};

export const SetDisplayMonData = (
  runtime: PokemonStorageDataRuntime,
  pokemon: DecompBoxPokemon | null,
  _mode: number
): void => {
  runtime.displayMonItemId = ITEM_NONE;
  if (!pokemon) {
    runtime.displayMonSpecies = SPECIES_NONE;
  } else {
    runtime.displayMonSpecies = pokemon.species;
    if (runtime.displayMonSpecies !== SPECIES_NONE) {
      runtime.displayMonIsEgg = Boolean(pokemon.isEgg);
      runtime.displayMonNickname = pokemon.nickname ?? '';
      runtime.displayMonLevel = pokemon.level ?? 0;
      runtime.displayMonMarkings = ((pokemon.data as Record<string, unknown> | undefined)?.markings as number | undefined) ?? 0;
      runtime.displayMonPersonality = pokemon.personality ?? 0;
      runtime.displayMonItemId = ((pokemon.data as Record<string, unknown> | undefined)?.heldItem as number | undefined) ?? ITEM_NONE;
    }
  }
  if (runtime.displayMonSpecies === SPECIES_NONE) {
    runtime.displayMonNickname = '     ';
    runtime.displayMonTexts = ['        ', '        ', '        ', '        '];
  } else if (runtime.displayMonIsEgg) {
    runtime.displayMonTexts = [runtime.displayMonNickname || 'EGG', '        ', '        ', '        '];
  } else {
    runtime.displayMonTexts = [
      runtime.displayMonNickname.padEnd(5, ' '),
      `/${runtime.displayMonSpecies}`.padEnd(6, ' '),
      ` Lv${runtime.displayMonLevel}`.padEnd(8, ' '),
      runtime.displayMonItemId !== ITEM_NONE ? `ITEM${runtime.displayMonItemId}`.slice(0, 8).padEnd(8, ' ') : '        '
    ];
  }
};

export const HandleInput_InBox = (runtime: PokemonStorageDataRuntime): number => {
  switch (runtime.inBoxMovingMode) {
    case MOVE_MODE_MULTIPLE_SELECTING:
      return HandleInput_InBox_GrabbingMultiple(runtime);
    case MOVE_MODE_MULTIPLE_MOVING:
      return HandleInput_InBox_MovingMultiple(runtime);
    case MOVE_MODE_NORMAL:
    default:
      return HandleInput_InBox_Normal(runtime);
  }
};

export const HandleInput_InBox_Normal = (runtime: PokemonStorageDataRuntime): number => {
  let input = INPUT_NONE;
  let cursorArea = runtime.cursorArea;
  let cursorPosition = runtime.cursorPosition;
  runtime.cursorVerticalWrap = 0;
  runtime.cursorHorizontalWrap = 0;
  runtime.cursorFlipTimer = 0;
  if (joyRept(runtime, DPAD_UP)) {
    input = INPUT_MOVE_CURSOR;
    if (runtime.cursorPosition >= IN_BOX_COLUMNS)
      cursorPosition -= IN_BOX_COLUMNS;
    else {
      cursorArea = CURSOR_AREA_BOX_TITLE;
      cursorPosition = 0;
    }
  } else if (joyRept(runtime, DPAD_DOWN)) {
    input = INPUT_MOVE_CURSOR;
    cursorPosition += IN_BOX_COLUMNS;
    if (cursorPosition >= IN_BOX_COUNT) {
      cursorArea = CURSOR_AREA_BUTTONS;
      cursorPosition = Math.trunc((cursorPosition - IN_BOX_COUNT) / 3);
      runtime.cursorVerticalWrap = 1;
      runtime.cursorFlipTimer = 1;
    }
  } else if (joyRept(runtime, DPAD_LEFT)) {
    input = INPUT_MOVE_CURSOR;
    if (runtime.cursorPosition % IN_BOX_COLUMNS !== 0)
      cursorPosition--;
    else {
      runtime.cursorHorizontalWrap = -1;
      cursorPosition += IN_BOX_COLUMNS - 1;
    }
  } else if (joyRept(runtime, DPAD_RIGHT)) {
    input = INPUT_MOVE_CURSOR;
    if ((runtime.cursorPosition + 1) % IN_BOX_COLUMNS !== 0)
      cursorPosition++;
    else {
      runtime.cursorHorizontalWrap = 1;
      cursorPosition -= IN_BOX_COLUMNS - 1;
    }
  } else if (joyNew(runtime, START_BUTTON)) {
    input = INPUT_MOVE_CURSOR;
    cursorArea = CURSOR_AREA_BOX_TITLE;
    cursorPosition = 0;
  } else if (joyNew(runtime, A_BUTTON) && SetSelectionMenuTexts(runtime)) {
    if (!runtime.inMultiMoveMode)
      return INPUT_IN_MENU;
    if (runtime.boxOption !== OPTION_MOVE_MONS || runtime.isMonBeingMoved) {
      return menuTextIdToInput(GetMenuItemTextId(runtime, 0));
    }
    runtime.inBoxMovingMode = MOVE_MODE_MULTIPLE_SELECTING;
    return INPUT_MULTIMOVE_START;
  } else if (joyNew(runtime, B_BUTTON)) {
    return INPUT_PRESSED_B;
  } else if (runtime.optionsButtonMode === 1 && joyHeld(runtime, L_BUTTON)) {
    return INPUT_SCROLL_LEFT;
  } else if (runtime.optionsButtonMode === 1 && joyHeld(runtime, R_BUTTON)) {
    return INPUT_SCROLL_RIGHT;
  } else if (joyNew(runtime, SELECT_BUTTON)) {
    ToggleCursorMultiMoveMode(runtime);
    return INPUT_NONE;
  }
  if (input !== INPUT_NONE)
    SetCursorPosition(runtime, cursorArea, cursorPosition);
  return input;
};

const menuTextIdToInput = (textId: number): number => {
  switch (textId) {
    case MENU_TEXT_STORE:
      return INPUT_DEPOSIT;
    case MENU_TEXT_WITHDRAW:
      return INPUT_WITHDRAW;
    case MENU_TEXT_MOVE:
      return INPUT_MOVE_MON;
    case MENU_TEXT_SHIFT:
      return INPUT_SHIFT_MON;
    case MENU_TEXT_PLACE:
      return INPUT_PLACE_MON;
    case MENU_TEXT_TAKE:
      return INPUT_TAKE_ITEM;
    case MENU_TEXT_GIVE:
    case MENU_TEXT_GIVE2:
      return INPUT_GIVE_ITEM;
    case MENU_TEXT_SWITCH:
      return INPUT_SWITCH_ITEMS;
    default:
      return INPUT_IN_MENU;
  }
};

export const HandleInput_InBox_GrabbingMultiple = (runtime: PokemonStorageDataRuntime): number => {
  if (joyHeld(runtime, A_BUTTON)) {
    if (joyRept(runtime, DPAD_UP) && runtime.cursorPosition / IN_BOX_COLUMNS >= 1) {
      SetCursorPosition(runtime, CURSOR_AREA_IN_BOX, runtime.cursorPosition - IN_BOX_COLUMNS);
      return INPUT_MULTIMOVE_CHANGE_SELECTION;
    }
    if (joyRept(runtime, DPAD_DOWN) && runtime.cursorPosition + IN_BOX_COLUMNS < IN_BOX_COUNT) {
      SetCursorPosition(runtime, CURSOR_AREA_IN_BOX, runtime.cursorPosition + IN_BOX_COLUMNS);
      return INPUT_MULTIMOVE_CHANGE_SELECTION;
    }
    if (joyRept(runtime, DPAD_LEFT) && runtime.cursorPosition % IN_BOX_COLUMNS !== 0) {
      SetCursorPosition(runtime, CURSOR_AREA_IN_BOX, runtime.cursorPosition - 1);
      return INPUT_MULTIMOVE_CHANGE_SELECTION;
    }
    if (joyRept(runtime, DPAD_RIGHT) && (runtime.cursorPosition + 1) % IN_BOX_COLUMNS !== 0) {
      SetCursorPosition(runtime, CURSOR_AREA_IN_BOX, runtime.cursorPosition + 1);
      return INPUT_MULTIMOVE_CHANGE_SELECTION;
    }
    return (runtime.repeatKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) ? INPUT_MULTIMOVE_UNABLE : INPUT_NONE;
  }
  if (runtime.multiMoveOriginPosition === runtime.cursorPosition) {
    runtime.inBoxMovingMode = MOVE_MODE_NORMAL;
    runtime.cursorShadowSprite.invisible = false;
    return INPUT_MULTIMOVE_SINGLE;
  }
  runtime.isMonBeingMoved = runtime.displayMonSpecies !== SPECIES_NONE;
  runtime.inBoxMovingMode = MOVE_MODE_MULTIPLE_MOVING;
  runtime.movingMonOrigBoxId = runtime.storage.currentBox;
  return INPUT_MULTIMOVE_GRAB_SELECTION;
};

export const HandleInput_InBox_MovingMultiple = (runtime: PokemonStorageDataRuntime): number => {
  const dirs = [
    [DPAD_UP, 0, -IN_BOX_COLUMNS, INPUT_MULTIMOVE_UNABLE],
    [DPAD_DOWN, 1, IN_BOX_COLUMNS, INPUT_MULTIMOVE_UNABLE],
    [DPAD_LEFT, 2, -1, INPUT_SCROLL_LEFT],
    [DPAD_RIGHT, 3, 1, INPUT_SCROLL_RIGHT]
  ] as const;
  for (const [button, dir, delta, fail] of dirs) {
    if (joyRept(runtime, button)) {
      if (runtime.multiMoveTryMoveGroup[dir]) {
        SetCursorPosition(runtime, CURSOR_AREA_IN_BOX, runtime.cursorPosition + delta);
        return INPUT_MULTIMOVE_MOVE_MONS;
      }
      return fail;
    }
  }
  if (joyNew(runtime, A_BUTTON)) {
    if (runtime.multiMoveCanPlaceSelection) {
      runtime.isMonBeingMoved = false;
      runtime.inBoxMovingMode = MOVE_MODE_NORMAL;
      return INPUT_MULTIMOVE_PLACE_MONS;
    }
    return INPUT_MULTIMOVE_UNABLE;
  }
  if (joyNew(runtime, B_BUTTON))
    return INPUT_MULTIMOVE_UNABLE;
  if (runtime.optionsButtonMode === 1 && joyHeld(runtime, L_BUTTON))
    return INPUT_SCROLL_LEFT;
  if (runtime.optionsButtonMode === 1 && joyHeld(runtime, R_BUTTON))
    return INPUT_SCROLL_RIGHT;
  return INPUT_NONE;
};

export const HandleInput_InParty = (runtime: PokemonStorageDataRuntime): number => {
  let input = INPUT_NONE;
  let cursorArea = runtime.cursorArea;
  let cursorPosition = runtime.cursorPosition;
  let gotoBox = false;
  runtime.cursorHorizontalWrap = 0;
  runtime.cursorVerticalWrap = 0;
  runtime.cursorFlipTimer = 0;
  if (joyRept(runtime, DPAD_UP)) {
    cursorPosition--;
    if (cursorPosition < 0)
      cursorPosition = PARTY_SIZE;
    if (cursorPosition !== runtime.cursorPosition)
      input = INPUT_MOVE_CURSOR;
  } else if (joyRept(runtime, DPAD_DOWN)) {
    cursorPosition++;
    if (cursorPosition > PARTY_SIZE)
      cursorPosition = 0;
    if (cursorPosition !== runtime.cursorPosition)
      input = INPUT_MOVE_CURSOR;
  } else if (joyRept(runtime, DPAD_LEFT) && runtime.cursorPosition !== 0) {
    input = INPUT_MOVE_CURSOR;
    runtime.cursorPrevPartyPos = runtime.cursorPosition;
    cursorPosition = 0;
  } else if (joyRept(runtime, DPAD_RIGHT)) {
    if (runtime.cursorPosition === 0) {
      input = INPUT_MOVE_CURSOR;
      cursorPosition = runtime.cursorPrevPartyPos;
    } else {
      input = INPUT_HIDE_PARTY;
      cursorArea = CURSOR_AREA_IN_BOX;
      cursorPosition = 0;
    }
  } else if (joyNew(runtime, A_BUTTON)) {
    if (runtime.cursorPosition === PARTY_SIZE) {
      if (runtime.boxOption === OPTION_DEPOSIT)
        return INPUT_CLOSE_BOX;
      gotoBox = true;
    } else if (SetSelectionMenuTexts(runtime)) {
      if (!runtime.inMultiMoveMode)
        return INPUT_IN_MENU;
      return menuTextIdToInput(GetMenuItemTextId(runtime, 0));
    }
  } else if (joyNew(runtime, B_BUTTON)) {
    if (runtime.boxOption === OPTION_DEPOSIT)
      return INPUT_PRESSED_B;
    gotoBox = true;
  } else if (joyNew(runtime, SELECT_BUTTON)) {
    ToggleCursorMultiMoveMode(runtime);
    return INPUT_NONE;
  }
  if (gotoBox) {
    input = INPUT_HIDE_PARTY;
    cursorArea = CURSOR_AREA_IN_BOX;
    cursorPosition = 0;
  }
  if (input !== INPUT_NONE && input !== INPUT_HIDE_PARTY)
    SetCursorPosition(runtime, cursorArea, cursorPosition);
  return input;
};

export const HandleInput_BoxTitle = (runtime: PokemonStorageDataRuntime): number => {
  let input = INPUT_NONE;
  let cursorArea = runtime.cursorArea;
  let cursorPosition = runtime.cursorPosition;
  runtime.cursorHorizontalWrap = 0;
  runtime.cursorVerticalWrap = 0;
  runtime.cursorFlipTimer = 0;
  if (joyRept(runtime, DPAD_UP)) {
    input = INPUT_MOVE_CURSOR;
    cursorArea = CURSOR_AREA_BUTTONS;
    cursorPosition = 0;
    runtime.cursorFlipTimer = 1;
  } else if (joyRept(runtime, DPAD_DOWN)) {
    input = INPUT_MOVE_CURSOR;
    cursorArea = CURSOR_AREA_IN_BOX;
    cursorPosition = 2;
  } else if (joyHeld(runtime, DPAD_LEFT) || (runtime.optionsButtonMode === 1 && joyHeld(runtime, L_BUTTON))) {
    return INPUT_SCROLL_LEFT;
  } else if (joyHeld(runtime, DPAD_RIGHT) || (runtime.optionsButtonMode === 1 && joyHeld(runtime, R_BUTTON))) {
    return INPUT_SCROLL_RIGHT;
  } else if (joyNew(runtime, A_BUTTON)) {
    runtime.operations.push('AnimateBoxScrollArrows:FALSE');
    AddBoxMenu(runtime);
    return INPUT_BOX_OPTIONS;
  } else if (joyNew(runtime, B_BUTTON)) {
    return INPUT_PRESSED_B;
  } else if (joyNew(runtime, SELECT_BUTTON)) {
    ToggleCursorMultiMoveMode(runtime);
    return INPUT_NONE;
  }
  if (input !== INPUT_NONE) {
    if (cursorArea !== CURSOR_AREA_BOX_TITLE)
      runtime.operations.push('AnimateBoxScrollArrows:FALSE');
    SetCursorPosition(runtime, cursorArea, cursorPosition);
  }
  return input;
};

export const HandleInput_OnButtons = (runtime: PokemonStorageDataRuntime): number => {
  let input = INPUT_NONE;
  let cursorArea = runtime.cursorArea;
  let cursorPosition = runtime.cursorPosition;
  runtime.cursorHorizontalWrap = 0;
  runtime.cursorVerticalWrap = 0;
  runtime.cursorFlipTimer = 0;
  if (joyRept(runtime, DPAD_UP)) {
    input = INPUT_MOVE_CURSOR;
    cursorArea = CURSOR_AREA_IN_BOX;
    runtime.cursorVerticalWrap = -1;
    cursorPosition = runtime.cursorPosition === 0 ? IN_BOX_COUNT - 1 - 5 : IN_BOX_COUNT - 1;
    runtime.cursorFlipTimer = 1;
  } else if (joyRept(runtime, DPAD_DOWN | START_BUTTON)) {
    input = INPUT_MOVE_CURSOR;
    cursorArea = CURSOR_AREA_BOX_TITLE;
    cursorPosition = 0;
    runtime.cursorFlipTimer = 1;
  } else if (joyRept(runtime, DPAD_LEFT)) {
    input = INPUT_MOVE_CURSOR;
    cursorPosition--;
    if (cursorPosition < 0)
      cursorPosition = 1;
  } else if (joyRept(runtime, DPAD_RIGHT)) {
    input = INPUT_MOVE_CURSOR;
    cursorPosition++;
    if (cursorPosition > 1)
      cursorPosition = 0;
  } else if (joyNew(runtime, A_BUTTON)) {
    return cursorPosition === 0 ? INPUT_SHOW_PARTY : INPUT_CLOSE_BOX;
  } else if (joyNew(runtime, B_BUTTON)) {
    return INPUT_PRESSED_B;
  } else if (joyNew(runtime, SELECT_BUTTON)) {
    ToggleCursorMultiMoveMode(runtime);
    return INPUT_NONE;
  }
  if (input !== INPUT_NONE)
    SetCursorPosition(runtime, cursorArea, cursorPosition);
  return input;
};

export const HandleInput = (runtime: PokemonStorageDataRuntime): number => {
  switch (runtime.cursorArea) {
    case CURSOR_AREA_IN_BOX:
      return HandleInput_InBox(runtime);
    case CURSOR_AREA_IN_PARTY:
      return HandleInput_InParty(runtime);
    case CURSOR_AREA_BOX_TITLE:
      return HandleInput_BoxTitle(runtime);
    case CURSOR_AREA_BUTTONS:
      return HandleInput_OnButtons(runtime);
    default:
      return INPUT_NONE;
  }
};

export const AddBoxMenu = (runtime: PokemonStorageDataRuntime): void => {
  InitMenu(runtime);
  SetMenuText(runtime, MENU_TEXT_JUMP);
  SetMenuText(runtime, MENU_TEXT_WALLPAPER);
  SetMenuText(runtime, MENU_TEXT_NAME);
  SetMenuText(runtime, MENU_TEXT_CANCEL);
};

export const SetSelectionMenuTexts = (runtime: PokemonStorageDataRuntime): boolean => {
  InitMenu(runtime);
  return runtime.boxOption !== OPTION_MOVE_ITEMS ? SetMenuTextsForMon(runtime) : SetMenuTextsForItem(runtime);
};

export const SetMenuTextsForMon = (runtime: PokemonStorageDataRuntime): boolean => {
  const species = GetSpeciesAtCursorPosition(runtime);
  switch (runtime.boxOption) {
    case OPTION_DEPOSIT:
      if (species !== SPECIES_NONE)
        SetMenuText(runtime, MENU_TEXT_STORE);
      else
        return false;
      break;
    case OPTION_WITHDRAW:
      if (species !== SPECIES_NONE)
        SetMenuText(runtime, MENU_TEXT_WITHDRAW);
      else
        return false;
      break;
    case OPTION_MOVE_MONS:
      if (runtime.isMonBeingMoved)
        SetMenuText(runtime, species !== SPECIES_NONE ? MENU_TEXT_SHIFT : MENU_TEXT_PLACE);
      else if (species !== SPECIES_NONE)
        SetMenuText(runtime, MENU_TEXT_MOVE);
      else
        return false;
      break;
    default:
      return false;
  }
  SetMenuText(runtime, MENU_TEXT_SUMMARY);
  if (runtime.boxOption === OPTION_MOVE_MONS)
    SetMenuText(runtime, runtime.cursorArea === CURSOR_AREA_IN_BOX ? MENU_TEXT_WITHDRAW : MENU_TEXT_STORE);
  SetMenuText(runtime, MENU_TEXT_MARK);
  SetMenuText(runtime, MENU_TEXT_RELEASE);
  SetMenuText(runtime, MENU_TEXT_CANCEL);
  return true;
};

export const SetMenuTextsForItem = (runtime: PokemonStorageDataRuntime): boolean => {
  if (runtime.displayMonSpecies === SPECIES_EGG)
    return false;
  if (!runtime.activeItemMoving) {
    if (runtime.displayMonItemId === ITEM_NONE) {
      if (runtime.displayMonSpecies === SPECIES_NONE)
        return false;
      SetMenuText(runtime, MENU_TEXT_GIVE2);
    } else {
      if (!runtime.itemIsMail(runtime.displayMonItemId)) {
        SetMenuText(runtime, MENU_TEXT_TAKE);
        SetMenuText(runtime, MENU_TEXT_BAG);
      }
      SetMenuText(runtime, MENU_TEXT_INFO);
    }
  } else if (runtime.displayMonItemId === ITEM_NONE) {
    if (runtime.displayMonSpecies === SPECIES_NONE)
      return false;
    SetMenuText(runtime, MENU_TEXT_GIVE);
  } else {
    if (runtime.itemIsMail(runtime.displayMonItemId))
      return false;
    SetMenuText(runtime, MENU_TEXT_SWITCH);
  }
  SetMenuText(runtime, MENU_TEXT_CANCEL);
  return true;
};

export const SpriteCB_CursorShadow = (runtime: PokemonStorageDataRuntime, sprite: StorageCursorSprite): void => {
  sprite.x = runtime.cursorSprite.x;
  sprite.y = runtime.cursorSprite.y + 20;
};

export const CreateCursorSprites = (runtime: PokemonStorageDataRuntime): void => {
  const coords = getCursorCoordsByPos(runtime.cursorArea, runtime.cursorPosition, runtime.isMonBeingMoved);
  runtime.cursorSprite = { x: coords.x, y: coords.y, vFlip: false, oam: { priority: 1 }, y2: 0 } as StorageCursorSprite;
  if (runtime.isMonBeingMoved)
    StartCursorAnim(runtime, 3);
  runtime.cursorShadowSprite = {
    x: 0,
    y: 0,
    vFlip: false,
    oam: { priority: runtime.cursorArea === CURSOR_AREA_IN_PARTY ? 1 : 2 },
    subpriority: runtime.cursorArea === CURSOR_AREA_IN_PARTY ? 13 : 21,
    invisible: runtime.cursorArea !== CURSOR_AREA_IN_BOX
  };
  runtime.operations.push('LoadSpriteSheets:cursor', 'LoadSpritePalettes:cursor');
};

export const ToggleCursorMultiMoveMode = (runtime: PokemonStorageDataRuntime): void => {
  runtime.inMultiMoveMode = !runtime.inMultiMoveMode;
  runtime.operations.push(`ToggleCursorMultiMoveMode:${runtime.inMultiMoveMode ? 1 : 0}`);
};

export const GetBoxCursorPosition = (runtime: PokemonStorageDataRuntime): number =>
  runtime.cursorPosition;

export const GetCursorBoxColumnAndRow = (runtime: PokemonStorageDataRuntime): { column: number; row: number } =>
  getCursorBoxColumnAndRow(runtime);

export const StartCursorAnim = (runtime: PokemonStorageDataRuntime, animNum: number): void => {
  runtime.operations.push(`StartSpriteAnim:${animNum}`);
};

export const GetMovingMonOriginalBoxId = (runtime: PokemonStorageDataRuntime): number =>
  runtime.movingMonOrigBoxId;

export const SetCursorPriorityTo1 = (runtime: PokemonStorageDataRuntime): void => {
  runtime.cursorSprite.oam.priority = 1;
};

export const TryHideItemAtCursor = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.cursorArea === CURSOR_AREA_IN_BOX)
    runtime.operations.push(`TryHideItemIconAtPos:${CURSOR_AREA_IN_BOX}:${runtime.cursorPosition}`);
};

export const TryShowItemAtCursor = (runtime: PokemonStorageDataRuntime): void => {
  if (runtime.cursorArea === CURSOR_AREA_IN_BOX)
    runtime.operations.push(`TryLoadItemIconAtPos:${CURSOR_AREA_IN_BOX}:${runtime.cursorPosition}`);
};

const menuText = (textId: number): string => `MENU_${textId}`;

export const InitMenu = (runtime: PokemonStorageDataRuntime): void => {
  runtime.menuItemsCount = 0;
  runtime.menuItems = [];
  runtime.menuWidth = 0;
  runtime.menuWindow.bg = 0;
  runtime.menuWindow.paletteNum = 15;
  runtime.menuWindow.baseBlock = 92;
};

export const SetMenuText = (runtime: PokemonStorageDataRuntime, textId: number): void => {
  if (runtime.menuItemsCount < 7) {
    const text = menuText(textId);
    runtime.menuItems.push({ text, textId });
    runtime.menuWidth = Math.max(runtime.menuWidth, text.length);
    runtime.menuItemsCount++;
  }
};

export const GetMenuItemTextId = (runtime: PokemonStorageDataRuntime, menuIndex: number): number =>
  menuIndex >= runtime.menuItemsCount ? MENU_B_PRESSED : runtime.menuItems[menuIndex].textId;

export const AddMenu = (runtime: PokemonStorageDataRuntime): void => {
  runtime.menuWindow.width = runtime.menuWidth + 2;
  runtime.menuWindow.height = 2 * runtime.menuItemsCount;
  runtime.menuWindow.tilemapLeft = 29 - runtime.menuWindow.width;
  runtime.menuWindow.tilemapTop = 15 - runtime.menuWindow.height;
  runtime.menuWindowId = 0;
  runtime.operations.push('AddWindow', 'PrintTextArray', 'Menu_InitCursor', 'ScheduleBgCopyTilemapToVram');
};

export const IsMenuLoading = (): boolean => false;

export const HandleMenuInput = (runtime: PokemonStorageDataRuntime): number => {
  let input = MENU_NOTHING_CHOSEN;
  if (joyNew(runtime, A_BUTTON))
    input = runtime.menuCursorPos;
  else if (joyNew(runtime, B_BUTTON))
    input = MENU_B_PRESSED;
  if (joyNew(runtime, DPAD_UP))
    runtime.menuCursorPos = Math.max(0, runtime.menuCursorPos - 1);
  else if (joyNew(runtime, DPAD_DOWN))
    runtime.menuCursorPos = Math.min(runtime.menuItemsCount - 1, runtime.menuCursorPos + 1);
  if (input !== MENU_NOTHING_CHOSEN)
    RemoveMenu(runtime);
  return input >= 0 ? runtime.menuItems[input].textId : input;
};

export const RemoveMenu = (runtime: PokemonStorageDataRuntime): void => {
  runtime.operations.push(`RemoveWindow:${runtime.menuWindowId}`);
  runtime.menuWindowId = -1;
};
